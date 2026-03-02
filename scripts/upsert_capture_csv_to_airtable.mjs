#!/usr/bin/env node

import fs from "node:fs/promises";
import Airtable from "airtable";

function usage() {
  console.log(`Usage:
  node scripts/upsert_capture_csv_to_airtable.mjs <csv-path> [options]

Options:
  --env-file PATH        Load env vars from file (default: .env.local, fallback: .env)
  --no-env-file          Do not load env vars from file
  --key-field NAME       Unique key field used for upsert (default: AIRTABLE_QT_FILENAME_FIELD or "QT Filename")
  --table NAME           Airtable table name/id (default: AIRTABLE_TABLE_NAME)
  --base-id ID           Airtable base id (default: AIRTABLE_BASE_ID)
  --api-key KEY          Airtable token/key (default: AIRTABLE_API_KEY)
  --fields LIST          Comma-separated CSV fields to import (default: all CSV columns)
  --batch-size N         API batch size (1-10, default: 10)
  --pause-ms N           Delay between API calls in ms (default: 225)
  --no-typecast          Disable Airtable typecast (default: typecast enabled)
  --include-empty        Include empty values in updates (default: skip empty values)
  --dry-run              Parse and plan only; do not call Airtable
  -h, --help             Show this help

Examples:
  node scripts/upsert_capture_csv_to_airtable.mjs ./capture_export.csv
  node scripts/upsert_capture_csv_to_airtable.mjs ./capture_export.csv --fields "QT Filename,📼,Captured At,Sequence Number,Original Recording Date,Content Type,Is City Council Meeting"
  node scripts/upsert_capture_csv_to_airtable.mjs ./capture_export.csv --dry-run
`);
}

function parseSimpleEnv(content) {
  const entries = [];
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const idx = trimmed.indexOf("=");
    if (idx < 1) continue;

    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    entries.push([key, value]);
  }

  return entries;
}

async function maybeLoadEnvFromFile(argv) {
  if (argv.includes("--no-env-file")) {
    return null;
  }

  let explicitPath = null;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--env-file") {
      explicitPath = argv[i + 1];
      break;
    }
  }

  const candidates = explicitPath ? [explicitPath] : [".env.local", ".env"];

  for (const candidate of candidates) {
    if (!candidate) continue;

    try {
      const content = await fs.readFile(candidate, "utf8");
      const entries = parseSimpleEnv(content);
      for (const [key, value] of entries) {
        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
      return candidate;
    } catch (error) {
      if (error && error.code === "ENOENT") {
        continue;
      }
      throw error;
    }
  }

  return null;
}

function parseArgs(argv) {
  const options = {
    csvPath: "",
    keyField: process.env.AIRTABLE_QT_FILENAME_FIELD || "QT Filename",
    tableName: process.env.AIRTABLE_TABLE_NAME || "",
    baseId: process.env.AIRTABLE_BASE_ID || "",
    apiKey: process.env.AIRTABLE_API_KEY || "",
    fieldFilter: null,
    batchSize: 10,
    pauseMs: 225,
    typecast: true,
    includeEmpty: false,
    dryRun: false,
  };

  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("-")) {
      positional.push(arg);
      continue;
    }

    switch (arg) {
      case "--key-field":
        options.keyField = argv[++i];
        break;
      case "--env-file":
        i += 1;
        break;
      case "--no-env-file":
        break;
      case "--table":
        options.tableName = argv[++i];
        break;
      case "--base-id":
        options.baseId = argv[++i];
        break;
      case "--api-key":
        options.apiKey = argv[++i];
        break;
      case "--fields":
        options.fieldFilter = argv[++i]
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        break;
      case "--batch-size":
        options.batchSize = Number(argv[++i]);
        break;
      case "--pause-ms":
        options.pauseMs = Number(argv[++i]);
        break;
      case "--no-typecast":
        options.typecast = false;
        break;
      case "--include-empty":
        options.includeEmpty = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "-h":
      case "--help":
        usage();
        process.exit(0);
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (positional.length < 1) {
    throw new Error("Missing CSV path.");
  }
  options.csvPath = positional[0];

  if (!Number.isInteger(options.batchSize) || options.batchSize < 1 || options.batchSize > 10) {
    throw new Error("--batch-size must be an integer from 1 to 10.");
  }
  if (!Number.isFinite(options.pauseMs) || options.pauseMs < 0) {
    throw new Error("--pause-ms must be a non-negative number.");
  }
  if (!options.keyField.trim()) {
    throw new Error("Missing key field (--key-field).");
  }

  return options;
}

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i];

    if (inQuotes) {
      if (ch === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    if (ch === "\r") {
      continue;
    }

    field += ch;
  }

  if (inQuotes) {
    throw new Error("Invalid CSV: unclosed quote.");
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((v) => String(v).trim() !== ""));
}

function toIsoOffsetDateTime(rawValue) {
  const value = String(rawValue).trim();
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?\s*([+-]\d{2}):?(\d{2})?$/
  );
  if (!match) {
    return value;
  }

  const year = match[1];
  const month = match[2];
  const day = match[3];
  const hour = match[4];
  const minute = match[5];
  const second = match[6] || "00";
  const tzHour = match[7];
  const tzMinute = match[8] || "00";

  return `${year}-${month}-${day}T${hour}:${minute}:${second}${tzHour}:${tzMinute}`;
}

function toDateOnly(rawValue) {
  const value = String(rawValue).trim();
  const match = value.match(/^(\d{4})[-_/](\d{2})[-_/](\d{2})$/);
  if (!match) {
    return value;
  }
  return `${match[1]}-${match[2]}-${match[3]}`;
}

const BOOLEAN_FIELDS = new Set(["Captured", "Is City Council Meeting"]);
const NUMBER_FIELDS = new Set(["Sequence Number", "Series Count"]);
const DATETIME_FIELDS = new Set(["Captured At"]);
const DATE_FIELDS = new Set(["Original Recording Date"]);

function coerceValue(fieldName, rawValue) {
  const value = String(rawValue).trim();

  if (BOOLEAN_FIELDS.has(fieldName)) {
    const lowered = value.toLowerCase();
    if (["1", "true", "yes", "y"].includes(lowered)) return true;
    if (["0", "false", "no", "n"].includes(lowered)) return false;
    return value;
  }

  if (NUMBER_FIELDS.has(fieldName)) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }

  if (DATETIME_FIELDS.has(fieldName)) {
    return toIsoOffsetDateTime(value);
  }

  if (DATE_FIELDS.has(fieldName)) {
    return toDateOnly(value);
  }

  return value;
}

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) {
    out.push(array.slice(i, i + size));
  }
  return out;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(error) {
  const statusCode = Number(error?.statusCode || 0);
  if (statusCode === 429) return true;
  if (statusCode >= 500 && statusCode <= 599) return true;
  return false;
}

async function withRetry(action, label, maxRetries = 5) {
  let attempt = 0;
  while (true) {
    try {
      return await action();
    } catch (error) {
      attempt += 1;
      if (!shouldRetry(error) || attempt > maxRetries) {
        throw error;
      }
      const delay = 400 * 2 ** (attempt - 1) + Math.floor(Math.random() * 200);
      console.warn(`${label} failed with status ${error?.statusCode ?? "unknown"}; retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
      await sleep(delay);
    }
  }
}

function summarizeError(error) {
  const status = error?.statusCode ? `status=${error.statusCode} ` : "";
  const body = error?.error ? `${error.error} ` : "";
  const message = error?.message || "Unknown Airtable error";
  return `${status}${body}${message}`.trim();
}

async function loadCsvRows(csvPath) {
  const raw = await fs.readFile(csvPath, "utf8");
  const parsed = parseCsv(raw);
  if (parsed.length < 1) {
    throw new Error("CSV is empty.");
  }

  const headers = parsed[0].map((h, idx) => {
    const value = idx === 0 ? String(h).replace(/^\uFEFF/, "") : String(h);
    return value.trim();
  });

  const dataRows = parsed.slice(1);
  const objects = dataRows.map((cells, rowIndex) => {
    const record = {};
    for (let i = 0; i < headers.length; i += 1) {
      record[headers[i]] = cells[i] ?? "";
    }
    record.__rowNumber = rowIndex + 2;
    return record;
  });

  return { headers, rows: objects };
}

function buildPayloadRows(rows, keyField, includeEmpty, fieldFilter) {
  const filteredRows = [];
  let skippedMissingKey = 0;

  for (const row of rows) {
    const rawKey = row[keyField];
    const keyValue = String(rawKey ?? "").trim();
    if (!keyValue) {
      skippedMissingKey += 1;
      continue;
    }

    const fields = {};
    const fieldNames = fieldFilter && fieldFilter.length > 0 ? fieldFilter : Object.keys(row);

    for (const fieldName of fieldNames) {
      if (fieldName === "__rowNumber") continue;
      if (!(fieldName in row)) continue;

      const rawValue = row[fieldName];
      const value = String(rawValue ?? "");
      if (!includeEmpty && value.trim() === "") {
        continue;
      }

      fields[fieldName] = coerceValue(fieldName, value);
    }

    if (!(keyField in fields)) {
      fields[keyField] = keyValue;
    }

    filteredRows.push({
      keyValue,
      rowNumber: row.__rowNumber,
      fields,
    });
  }

  return { payloadRows: filteredRows, skippedMissingKey };
}

async function fetchExistingRecordMap(table, keyField) {
  const records = await withRetry(
    () => table.select({ fields: [keyField] }).all(),
    "fetch existing records"
  );

  const recordIdByKey = new Map();
  const duplicateKeys = new Set();

  for (const record of records) {
    const value = record.get(keyField);
    const key = String(value ?? "").trim();
    if (!key) continue;
    if (recordIdByKey.has(key)) {
      duplicateKeys.add(key);
      continue;
    }
    recordIdByKey.set(key, record.id);
  }

  return { recordIdByKey, duplicateKeys };
}

async function run() {
  try {
    const envFileUsed = await maybeLoadEnvFromFile(process.argv.slice(2));
    const options = parseArgs(process.argv.slice(2));
    const { headers, rows } = await loadCsvRows(options.csvPath);
    const { payloadRows, skippedMissingKey } = buildPayloadRows(
      rows,
      options.keyField,
      options.includeEmpty,
      options.fieldFilter
    );

    if (payloadRows.length === 0) {
      console.log("No valid rows to process.");
      if (skippedMissingKey > 0) {
        console.log(`Skipped ${skippedMissingKey} row(s) with empty "${options.keyField}".`);
      }
      return;
    }

    const dedupedByKey = new Map();
    let duplicateInputRows = 0;
    for (const row of payloadRows) {
      if (dedupedByKey.has(row.keyValue)) {
        duplicateInputRows += 1;
      }
      dedupedByKey.set(row.keyValue, row);
    }
    const dedupedRows = Array.from(dedupedByKey.values());

    console.log(`CSV headers: ${headers.join(", ")}`);
    console.log(`Input rows: ${rows.length}`);
    console.log(`Rows with key (${options.keyField}): ${payloadRows.length}`);
    if (skippedMissingKey > 0) {
      console.log(`Skipped rows with empty key: ${skippedMissingKey}`);
    }
    if (duplicateInputRows > 0) {
      console.log(`Duplicate key rows in CSV: ${duplicateInputRows} (last row per key wins)`);
    }
    if (envFileUsed) {
      console.log(`Loaded env from: ${envFileUsed}`);
    }

    if (options.dryRun) {
      console.log("Dry run enabled; Airtable was not called.");
      console.log(`Rows that would be upserted: ${dedupedRows.length}`);
      return;
    }

    if (!options.apiKey || !options.baseId || !options.tableName) {
      throw new Error(
        "Missing Airtable credentials. Set AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME (or pass --api-key/--base-id/--table)."
      );
    }

    Airtable.configure({
      endpointUrl: "https://api.airtable.com",
      apiKey: options.apiKey,
    });

    const base = Airtable.base(options.baseId);
    const table = base(options.tableName);

    const { recordIdByKey, duplicateKeys } = await fetchExistingRecordMap(table, options.keyField);
    if (duplicateKeys.size > 0) {
      console.warn(`Found ${duplicateKeys.size} duplicate key(s) already in Airtable; updating the first match per key.`);
    }

    const toUpdate = [];
    const toCreate = [];
    for (const row of dedupedRows) {
      const existingId = recordIdByKey.get(row.keyValue);
      if (existingId) {
        toUpdate.push({ id: existingId, fields: row.fields });
      } else {
        toCreate.push({ fields: row.fields });
      }
    }

    console.log(`Will update: ${toUpdate.length}`);
    console.log(`Will create: ${toCreate.length}`);

    const createBatches = chunk(toCreate, options.batchSize);
    const updateBatches = chunk(toUpdate, options.batchSize);

    let created = 0;
    let updated = 0;

    for (let i = 0; i < updateBatches.length; i += 1) {
      const batch = updateBatches[i];
      await withRetry(
        () => table.update(batch, { typecast: options.typecast }),
        `update batch ${i + 1}/${updateBatches.length}`
      );
      updated += batch.length;
      console.log(`Updated ${updated}/${toUpdate.length}`);
      if (options.pauseMs > 0 && (i < updateBatches.length - 1 || createBatches.length > 0)) {
        await sleep(options.pauseMs);
      }
    }

    for (let i = 0; i < createBatches.length; i += 1) {
      const batch = createBatches[i];
      await withRetry(
        () => table.create(batch, { typecast: options.typecast }),
        `create batch ${i + 1}/${createBatches.length}`
      );
      created += batch.length;
      console.log(`Created ${created}/${toCreate.length}`);
      if (options.pauseMs > 0 && i < createBatches.length - 1) {
        await sleep(options.pauseMs);
      }
    }

    console.log("Upsert complete.");
    console.log(`Summary: ${updated} updated, ${created} created, ${skippedMissingKey} skipped (missing key).`);
  } catch (error) {
    console.error(`Import failed: ${summarizeError(error)}`);
    process.exit(1);
  }
}

run();
