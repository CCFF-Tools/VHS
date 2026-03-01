#!/usr/bin/env bash

# Export QuickTime capture files and creation timestamps to CSV.
# Designed for macOS 10.10+ (BSD find/stat/date, Bash 3.2).

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  export_quicktime_capture_csv.sh [options]

Options:
  -r, --root DIR          Directory to scan (default: current directory)
  -o, --output FILE       CSV output path (default: ./quicktime_capture_export_YYYYmmdd_HHMMSS.csv)
  -e, --ext LIST          Comma-separated extensions (default: mov,mp4,m4v,qt)
  -f, --format FORMAT     csv format: airtable or standard (default: airtable)
  -h, --help              Show this help

Formats:
  airtable  -> QT Filename,Captured At,Captured,Capture File Path,Timestamp Source
  standard  -> File Name,File Path,Created At,Created Epoch,Timestamp Source

Examples:
  ./export_quicktime_capture_csv.sh -r "/Volumes/Capture Drive/Session_2026_03_01"
  ./export_quicktime_capture_csv.sh -r . -o capture.csv -e mov -f standard
EOF
}

ROOT="."
TIMESTAMP="$(date '+%Y%m%d_%H%M%S')"
OUTPUT="./quicktime_capture_export_${TIMESTAMP}.csv"
EXTENSIONS="mov,mp4,m4v,qt"
FORMAT="airtable"

while [ $# -gt 0 ]; do
  case "$1" in
    -r|--root)
      ROOT="$2"
      shift 2
      ;;
    -o|--output)
      OUTPUT="$2"
      shift 2
      ;;
    -e|--ext)
      EXTENSIONS="$2"
      shift 2
      ;;
    -f|--format)
      FORMAT="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [ ! -d "$ROOT" ]; then
  echo "Root directory does not exist: $ROOT" >&2
  exit 1
fi

if [ "$FORMAT" != "airtable" ] && [ "$FORMAT" != "standard" ]; then
  echo "Invalid format: $FORMAT (expected: airtable or standard)" >&2
  exit 1
fi

csv_escape() {
  local value="$1"
  value=${value//\"/\"\"}
  printf '"%s"' "$value"
}

ROOT_ABS="$(cd "$ROOT" && pwd -P)"

IFS=',' read -r -a EXT_ARRAY <<< "$EXTENSIONS"
if [ "${#EXT_ARRAY[@]}" -eq 0 ]; then
  echo "No extensions provided." >&2
  exit 1
fi

exec 3>"$OUTPUT"

if [ "$FORMAT" = "airtable" ]; then
  printf '"QT Filename","Captured At","Captured","Capture File Path","Timestamp Source"\n' >&3
else
  printf '"File Name","File Path","Created At","Created Epoch","Timestamp Source"\n' >&3
fi

FIND_ARGS=()
first=1
for ext in "${EXT_ARRAY[@]}"; do
  ext="$(echo "$ext" | tr -d '[:space:]')"
  [ -z "$ext" ] && continue
  if [ "$first" -eq 1 ]; then
    FIND_ARGS+=(-iname "*.${ext}")
    first=0
  else
    FIND_ARGS+=(-o -iname "*.${ext}")
  fi
done

if [ "${#FIND_ARGS[@]}" -eq 0 ]; then
  echo "No valid extensions after parsing: $EXTENSIONS" >&2
  exit 1
fi

count=0

while IFS= read -r -d '' file; do
  count=$((count + 1))

  filename="$(basename "$file")"

  created_epoch="$(stat -f '%B' "$file" 2>/dev/null || echo -1)"
  source="birth"
  if [ -z "$created_epoch" ] || [ "$created_epoch" -le 0 ] 2>/dev/null; then
    created_epoch="$(stat -f '%m' "$file" 2>/dev/null || echo 0)"
    source="mtime_fallback"
  fi

  created_at="$(date -r "$created_epoch" '+%Y-%m-%d %H:%M:%S %z')"

  if [ "$FORMAT" = "airtable" ]; then
    csv_escape "$filename" >&3
    printf ',' >&3
    csv_escape "$created_at" >&3
    printf ',' >&3
    csv_escape "1" >&3
    printf ',' >&3
    csv_escape "$file" >&3
    printf ',' >&3
    csv_escape "$source" >&3
    printf '\n' >&3
  else
    csv_escape "$filename" >&3
    printf ',' >&3
    csv_escape "$file" >&3
    printf ',' >&3
    csv_escape "$created_at" >&3
    printf ',' >&3
    csv_escape "$created_epoch" >&3
    printf ',' >&3
    csv_escape "$source" >&3
    printf '\n' >&3
  fi
done < <(find "$ROOT_ABS" -type f \( "${FIND_ARGS[@]}" \) -print0)

exec 3>&-

echo "Wrote $count row(s) to: $OUTPUT"
