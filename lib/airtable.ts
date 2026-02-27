import Airtable from "airtable";
import { env } from "@/lib/env";
import { fieldMap } from "@/lib/schema";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: env.airtableApiKey,
});

function getBase() {
  if (!env.airtableApiKey) {
    throw new Error("Missing AIRTABLE_API_KEY");
  }
  if (!env.airtableBaseId || !env.airtableBaseId.startsWith("app")) {
    throw new Error(
      "Invalid AIRTABLE_BASE_ID. Use only the base id (app...), or app.../tbl.../viw... and the app will parse it."
    );
  }

  return Airtable.base(env.airtableBaseId);
}

function formatAirtableError(error: unknown) {
  const err = error as { statusCode?: number; message?: string; error?: string };
  if (err?.statusCode === 401) {
    return "Airtable auth failed (401). Ensure AIRTABLE_API_KEY is the full token value copied exactly.";
  }
  if (err?.statusCode === 403) {
    return "Airtable permission denied (403). Ensure the token has required scopes and access to this base.";
  }
  if (err?.statusCode === 404) {
    return "Airtable base/table/view not found. Verify AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME (or table id), and AIRTABLE_VIEW_NAME.";
  }
  return err?.message || "Unknown Airtable error";
}

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, retries = 4): Promise<T> {
  let current = 0;
  let delay = 500;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 401 || status === 403 || status === 404) {
        throw new Error(formatAirtableError(error));
      }
      current += 1;
      if (current > retries) {
        throw new Error(formatAirtableError(error));
      }
      await wait(delay);
      delay *= 2;
    }
  }
}

export async function listRecords(maxRecords = 500) {
  const base = getBase();

  return withRetry(async () => {
    const selectOptions: {
      maxRecords: number;
      view?: string;
      sort: Array<{ field: string; direction: "desc" | "asc" }>;
    } = {
      maxRecords,
      sort: [{ field: fieldMap.receivedDate, direction: "desc" }],
    };

    const view = (env.airtableViewId || "").trim();
    if (view) {
      selectOptions.view = view;
    }

    return base(env.airtableTableRef).select(selectOptions).all();
  });
}

export async function getRecord(recordId: string) {
  const base = getBase();
  return withRetry(async () => base(env.airtableTableRef).find(recordId));
}

export async function updateRecord(recordId: string, fields: Record<string, unknown>) {
  const base = getBase();
  return withRetry(async () => base(env.airtableTableRef).update(recordId, fields));
}
