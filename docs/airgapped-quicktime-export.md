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

Default behavior:
- Scans for `mov,mp4,m4v,qt`
- Uses file creation date (birth time), with modified-time fallback if unavailable
- Writes Airtable-ready columns:
  - `QT Filename`
  - `Captured At`
  - `Captured`
  - `Capture File Path`
  - `Timestamp Source`

## 2) Move CSV off the airgapped machine

- Copy the CSV to a USB drive.
- Move it to the connected machine.

## 3) Import into Airtable

Recommended table fields:
- `QT Filename` (single line text)
- `Captured At` (date+time)
- `Captured` (checkbox)
- `Capture File Path` (long text, optional)
- `Timestamp Source` (single line text, optional)

Import options:
- New table: Airtable can ingest the CSV directly.
- Existing table: use Airtable CSV import and merge on `QT Filename` to update matching records.

## Notes

- If you only want `.mov`, pass `--ext mov`.
- For generic auditing output instead of Airtable column names, use `--format standard`.
