# Airgapped QuickTime Capture Export -> Airtable

This workflow is designed for an offline capture Mac (macOS 10.10 compatible) and a separate internet-connected machine for Airtable import.

## 1) Export CSV on the capture machine

Script path:
- `scripts/export_quicktime_capture_csv.sh`

Make it executable once:

```bash
chmod +x scripts/export_quicktime_capture_csv.sh
```

Run it against your capture folder:

```bash
./scripts/export_quicktime_capture_csv.sh \
  --root "/Volumes/Capture Drive/Session_2026_03_01" \
  --output "/Users/operator/Desktop/capture_export_2026_03_01.csv"
```

If you need to force original recording date and content type:

```bash
./scripts/export_quicktime_capture_csv.sh \
  --root "/Volumes/Capture Drive/City Council/1998-04-13" \
  --recording-date "1998-04-13" \
  --content-type "City Council Meeting" \
  --output "/Users/operator/Desktop/city_council_1998_04_13.csv"
```

Default behavior:
- Scans for `mov,mp4,m4v,qt`
- Uses file creation date (birth time), with modified-time fallback if unavailable
- Extracts primary identifier in `VHS-XXX` style for Airtable field `📼` (can rename with `--id-field`)
- Parses tape span from filename `X of Y` (for example `1 of 2`) into:
  - `Tape Sequence` = `X`
  - `Tapes in Sequence` = `Y`
- If no `X of Y` is found, defaults to `1 of 1`
- Tries to infer `Original Recording Date` from filename patterns like `YYYY-MM-DD`, `YYYY_MM_DD`, or `YYYYMMDD`
- Parses `Label RT` from runtime token in filename, like `2.23.10` -> `2:23:10` (ignores date-like tokens such as `2000.10.23`)
- Auto-tags content type as `City Council Meeting` if path/name includes keywords like `city council`, `city_council`, `city-council`, `citycouncil`, or `council meeting`; otherwise `Other`
- Writes Airtable-ready columns:
  - `QT Filename`
  - `📼` (Primary Identifier)
  - `Captured At`
  - `Captured`
  - `Capture File Path`
  - `Tape Sequence`
  - `Tapes in Sequence`
  - `Original Recording Date`
  - `Label RT`
  - `Content Type`
  - `Is City Council Meeting`

## 2) Move CSV off the airgapped machine

- Copy the CSV to a USB drive.
- Move it to the connected machine.

## 3) Import into Airtable (automated, one command)

Importer script:
- `scripts/upsert_capture_csv_to_airtable.mjs`

On the connected machine, set credentials in `.env.local` (or export them in shell):
- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_TABLE_NAME`
- Optional: `AIRTABLE_SCHEMA_CSV=/path/to/Titled Table-Grid view.csv` to auto-limit uploads to real table fields
- Optional: `AIRTABLE_CAPTURED_VALUE=Yes` if your `Captured` field expects text/select instead of checkbox boolean

Dry-run first (no Airtable writes):

```bash
npm run airtable:upsert-capture -- "/Volumes/USB/capture_export_2026_03_01.csv" --dry-run
```

Run real upsert (create new rows, update existing rows by `📼` / `VHS-XXX`):

```bash
npm run airtable:upsert-capture -- "/Volumes/USB/capture_export_2026_03_01.csv"
```

Schema-guided run (recommended when field names drift):

```bash
npm run airtable:upsert-capture -- "/Volumes/USB/capture_export_2026_03_01.csv" \
  --schema-csv "/Users/operator/Downloads/Titled Table-Grid view.csv" \
  --captured-value "yes"
```

By default, this import step forces `Captured` for every row (default value: boolean `true`).  
If your Airtable field expects text/single-select, pass `--captured-value "Yes"`.

Useful options:
- `--key-field "📼"` (default; change upsert key if needed)
- `--fields "📼,QT Filename,Captured At,Tape Sequence,Tapes in Sequence,Original Recording Date"` (import only these columns)
- `--fields "📼,QT Filename,Captured At,Tape Sequence,Tapes in Sequence,Original Recording Date,Label RT"` (include parsed runtime)
- `--include-empty` (allow blank CSV values to clear Airtable fields)
- `--env-file /path/to/.env.local` (explicit env file path)
- `--schema-csv /path/to/Titled Table-Grid view.csv` (only upload fields that exist in that schema CSV)
- `--captured-field "Captured"` (if your checkbox field has a different name)
- `--captured-value "Yes"` (set captured using text/single-select value)
- `--no-mark-captured` (disable forced captured field updates)

## 4) Airtable field setup

Recommended table fields:
- `QT Filename` (single line text)
- `📼` (single line text; Primary Identifier like `VHS-001`)
- `Captured At` (date+time)
- `Captured` (single select `yes/no` or checkbox, depending on your base)
- `Capture File Path` (long text, optional)
- `Tape Sequence` (number)
- `Tapes in Sequence` (number)
- `Original Recording Date` (date)
- `Label RT` (text/time-style runtime, e.g. `2:23:10`)
- `Content Type` (single select or text)
- `Is City Council Meeting` (checkbox)

## 5) Manual fallback import

If API automation is unavailable, use Airtable’s CSV import UI:
- New table: ingest CSV directly.
- Existing table: import and merge on `📼` (or `QT Filename` if your IDs are incomplete).

## Notes

- If you only want `.mov`, pass `--ext mov`.
- For generic auditing output instead of Airtable column names, use `--format standard`.
- If one export should be treated as one series, force it with `--series-name "Series 12"`.
- If sequence should be alphabetical by filename, pass `--sequence-by name`.
- If you need a different Airtable identifier column name, pass `--id-field "Your ID Field Name"`.
