function parseAirtableInput(raw: string) {
  const parts = raw
    .split("/")
    .map((p) => p.trim())
    .filter(Boolean);

  const baseId = parts.find((p) => p.startsWith("app")) ?? raw;
  const tableId = parts.find((p) => p.startsWith("tbl"));
  const viewId = parts.find((p) => p.startsWith("viw"));

  return { baseId, tableId, viewId };
}

const rawBaseInput = process.env.AIRTABLE_BASE_ID ?? "";
const parsed = parseAirtableInput(rawBaseInput);

const required = ["AIRTABLE_API_KEY", "AIRTABLE_BASE_ID"] as const;

for (const key of required) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.warn(`Missing env var: ${key}`);
  }
}

if (rawBaseInput && rawBaseInput !== parsed.baseId) {
  // eslint-disable-next-line no-console
  console.info(
    `AIRTABLE_BASE_ID included extra path segments; using base id '${parsed.baseId}' automatically.`
  );
}

export const env = {
  airtableApiKey: process.env.AIRTABLE_API_KEY ?? "",
  airtableBaseId: parsed.baseId,
  airtableTableRef: process.env.AIRTABLE_TABLE_NAME ?? parsed.tableId ?? "Titled Table",
  airtableViewId: process.env.AIRTABLE_VIEW_NAME ?? parsed.viewId ?? "",
  internalPassword: process.env.INTERNAL_APP_PASSWORD ?? "change-me",
  appTitle: process.env.NEXT_PUBLIC_APP_TITLE ?? "VHS Ops Flow",
};
