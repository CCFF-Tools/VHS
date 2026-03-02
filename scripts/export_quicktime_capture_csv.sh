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
      --id-field NAME     Primary identifier field name (default: AIRTABLE_TAPE_ID_FIELD or 📼)
      --series-mode MODE  Series grouping: parent or root (default: parent)
      --series-name NAME  Force one series name for all rows
      --sequence-by MODE  Sequence ordering: created or name (default: created)
      --recording-date D  Force original recording date for all rows (YYYY-MM-DD)
      --content-type T    Force content type for all rows
      --city-label LABEL  Label used for City Council content (default: City Council Meeting)
      --other-label LABEL Label used for non-City Council content (default: Other)
      --city-keywords L   Comma-separated keywords for auto-detection (default: city council,city_council,city-council,citycouncil,council meeting)
  -h, --help              Show this help

Formats:
  airtable  -> QT Filename,📼,Captured At,Captured,Capture File Path,Sequence Number,Series Count,Original Recording Date,Content Type,Is City Council Meeting
  standard  -> File Name,Primary Identifier,File Path,Created At,Created Epoch,Timestamp Source,Series Name,Sequence Number,Series Count,Original Recording Date,Recording Date Source,Content Type,Is City Council Meeting

Examples:
  ./export_quicktime_capture_csv.sh -r "/Volumes/Capture Drive/Session_2026_03_01"
  ./export_quicktime_capture_csv.sh -r . -o capture.csv --recording-date 1994-04-13 --content-type "City Council Meeting"
EOF
}

ROOT="."
TIMESTAMP="$(date '+%Y%m%d_%H%M%S')"
OUTPUT="./quicktime_capture_export_${TIMESTAMP}.csv"
EXTENSIONS="mov,mp4,m4v,qt"
FORMAT="airtable"
ID_FIELD="${AIRTABLE_TAPE_ID_FIELD:-📼}"
SERIES_MODE="parent"
SERIES_NAME_OVERRIDE=""
SEQUENCE_BY="created"
RECORDING_DATE_OVERRIDE=""
CONTENT_TYPE_OVERRIDE=""
CITY_LABEL="City Council Meeting"
OTHER_LABEL="Other"
CITY_KEYWORDS="city council,city_council,city-council,citycouncil,council meeting"

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
    --id-field)
      ID_FIELD="$2"
      shift 2
      ;;
    --series-mode)
      SERIES_MODE="$2"
      shift 2
      ;;
    --series-name)
      SERIES_NAME_OVERRIDE="$2"
      shift 2
      ;;
    --sequence-by)
      SEQUENCE_BY="$2"
      shift 2
      ;;
    --recording-date)
      RECORDING_DATE_OVERRIDE="$2"
      shift 2
      ;;
    --content-type)
      CONTENT_TYPE_OVERRIDE="$2"
      shift 2
      ;;
    --city-label)
      CITY_LABEL="$2"
      shift 2
      ;;
    --other-label)
      OTHER_LABEL="$2"
      shift 2
      ;;
    --city-keywords)
      CITY_KEYWORDS="$2"
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

if [ "$SERIES_MODE" != "parent" ] && [ "$SERIES_MODE" != "root" ]; then
  echo "Invalid --series-mode: $SERIES_MODE (expected: parent or root)" >&2
  exit 1
fi

if [ "$SEQUENCE_BY" != "created" ] && [ "$SEQUENCE_BY" != "name" ]; then
  echo "Invalid --sequence-by: $SEQUENCE_BY (expected: created or name)" >&2
  exit 1
fi

csv_escape() {
  local value="$1"
  value=${value//\"/\"\"}
  printf '"%s"' "$value"
}

infer_primary_identifier() {
  local filename="$1"
  local full_path="$2"
  local digits=""

  if [[ "$filename" =~ [Vv][Hh][Ss][-_[:space:]]*([0-9]+) ]]; then
    digits="${BASH_REMATCH[1]}"
  elif [[ "$full_path" =~ [Vv][Hh][Ss][-_[:space:]]*([0-9]+) ]]; then
    digits="${BASH_REMATCH[1]}"
  else
    printf ''
    return
  fi

  # Keep the common VHS-XXX style while still allowing >3 digits when present.
  printf 'VHS-%03d' "$((10#$digits))"
}

infer_recording_date() {
  local filename="$1"
  local token=""
  local normalized=""

  if [ -n "$RECORDING_DATE_OVERRIDE" ]; then
    printf '%s\tmanual' "$RECORDING_DATE_OVERRIDE"
    return
  fi

  token="$(echo "$filename" | grep -Eo '[12][0-9]{3}[-_.][01][0-9][-_.][0-3][0-9]' | head -n 1 || true)"
  if [ -n "$token" ]; then
    normalized="$(echo "$token" | tr '._' '-')"
    printf '%s\tfilename_pattern' "$normalized"
    return
  fi

  token="$(echo "$filename" | grep -Eo '[12][0-9]{7}' | head -n 1 || true)"
  if [ -n "$token" ]; then
    printf '%s-%s-%s\tfilename_pattern' "${token:0:4}" "${token:4:2}" "${token:6:2}"
    return
  fi

  printf '\tmissing'
}

infer_content_type() {
  local path="$1"
  local lowered_path=""
  local keyword=""

  if [ -n "$CONTENT_TYPE_OVERRIDE" ]; then
    printf '%s' "$CONTENT_TYPE_OVERRIDE"
    return
  fi

  lowered_path="$(echo "$path" | tr '[:upper:]' '[:lower:]')"

  IFS=',' read -r -a keyword_array <<< "$CITY_KEYWORDS"
  for keyword in "${keyword_array[@]}"; do
    keyword="$(echo "$keyword" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | tr '[:upper:]' '[:lower:]')"
    [ -z "$keyword" ] && continue
    if [[ "$lowered_path" == *"$keyword"* ]]; then
      printf '%s' "$CITY_LABEL"
      return
    fi
  done

  printf '%s' "$OTHER_LABEL"
}

is_city_flag() {
  local content_type="$1"
  if [ "$content_type" = "$CITY_LABEL" ]; then
    printf '1'
  else
    printf '0'
  fi
}

resolve_series_name() {
  local file_path="$1"
  local result=""

  if [ -n "$SERIES_NAME_OVERRIDE" ]; then
    printf '%s' "$SERIES_NAME_OVERRIDE"
    return
  fi

  if [ "$SERIES_MODE" = "root" ]; then
    printf '%s' "$(basename "$ROOT_ABS")"
    return
  fi

  result="$(basename "$(dirname "$file_path")")"
  if [ -z "$result" ]; then
    result="$(basename "$ROOT_ABS")"
  fi
  printf '%s' "$result"
}

ROOT_ABS="$(cd "$ROOT" && pwd -P)"

IFS=',' read -r -a EXT_ARRAY <<< "$EXTENSIONS"
if [ "${#EXT_ARRAY[@]}" -eq 0 ]; then
  echo "No extensions provided." >&2
  exit 1
fi

TMP_META="$(mktemp "/tmp/qt_export_meta.XXXXXX")"
TMP_SORTED="$(mktemp "/tmp/qt_export_sorted.XXXXXX")"
TMP_COUNTS="$(mktemp "/tmp/qt_export_counts.XXXXXX")"
trap 'rm -f "$TMP_META" "$TMP_SORTED" "$TMP_COUNTS"' EXIT

exec 3>"$OUTPUT"

if [ "$FORMAT" = "airtable" ]; then
  id_field_escaped="${ID_FIELD//\"/\"\"}"
  printf '"QT Filename","%s","Captured At","Captured","Capture File Path","Sequence Number","Series Count","Original Recording Date","Content Type","Is City Council Meeting"\n' "$id_field_escaped" >&3
else
  printf '"File Name","Primary Identifier","File Path","Created At","Created Epoch","Timestamp Source","Series Name","Sequence Number","Series Count","Original Recording Date","Recording Date Source","Content Type","Is City Council Meeting"\n' >&3
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
  filename="$(basename "$file")"
  series_name="$(resolve_series_name "$file")"

  created_epoch="$(stat -f '%B' "$file" 2>/dev/null || echo -1)"
  source="birth"
  if [ -z "$created_epoch" ] || [ "$created_epoch" -le 0 ] 2>/dev/null; then
    created_epoch="$(stat -f '%m' "$file" 2>/dev/null || echo 0)"
    source="mtime_fallback"
  fi

  created_at="$(date -r "$created_epoch" '+%Y-%m-%d %H:%M:%S %z')"
  primary_id="$(infer_primary_identifier "$filename" "$file")"
  recording_result="$(infer_recording_date "$filename")"
  recording_date="${recording_result%%$'\t'*}"
  recording_source="${recording_result#*$'\t'}"
  content_type="$(infer_content_type "$file")"
  city_flag="$(is_city_flag "$content_type")"

  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' \
    "$filename" \
    "$file" \
    "$created_at" \
    "$created_epoch" \
    "$source" \
    "$series_name" \
    "$recording_date" \
    "$recording_source" \
    "$content_type" \
    "$city_flag" \
    "$primary_id" >> "$TMP_META"
  count=$((count + 1))
done < <(find "$ROOT_ABS" -type f \( "${FIND_ARGS[@]}" \) -print0)

if [ "$count" -eq 0 ]; then
  exec 3>&-
  echo "Wrote 0 row(s) to: $OUTPUT"
  exit 0
fi

if [ "$SEQUENCE_BY" = "name" ]; then
  sort -t "$(printf '\t')" -k6,6 -k1,1 "$TMP_META" > "$TMP_SORTED"
else
  sort -t "$(printf '\t')" -k6,6 -k4,4n -k1,1 "$TMP_META" > "$TMP_SORTED"
fi

awk -F "$(printf '\t')" '{ counts[$6] += 1 } END { for (s in counts) { printf "%s\t%d\n", s, counts[s] } }' "$TMP_SORTED" > "$TMP_COUNTS"

current_series=""
sequence_number=0
series_count=0

while IFS="$(printf '\t')" read -r filename file created_at created_epoch source series_name recording_date recording_source content_type city_flag primary_id; do
  if [ "$series_name" != "$current_series" ]; then
    current_series="$series_name"
    sequence_number=0
    series_count="$(awk -F "$(printf '\t')" -v series="$series_name" '$1 == series { print $2; exit }' "$TMP_COUNTS")"
    [ -z "$series_count" ] && series_count=0
  fi

  sequence_number=$((sequence_number + 1))

  if [ "$FORMAT" = "airtable" ]; then
    csv_escape "$filename" >&3
    printf ',' >&3
    csv_escape "$primary_id" >&3
    printf ',' >&3
    csv_escape "$created_at" >&3
    printf ',' >&3
    csv_escape "1" >&3
    printf ',' >&3
    csv_escape "$file" >&3
    printf ',' >&3
    csv_escape "$sequence_number" >&3
    printf ',' >&3
    csv_escape "$series_count" >&3
    printf ',' >&3
    csv_escape "$recording_date" >&3
    printf ',' >&3
    csv_escape "$content_type" >&3
    printf ',' >&3
    csv_escape "$city_flag" >&3
    printf '\n' >&3
  else
    csv_escape "$filename" >&3
    printf ',' >&3
    csv_escape "$primary_id" >&3
    printf ',' >&3
    csv_escape "$file" >&3
    printf ',' >&3
    csv_escape "$created_at" >&3
    printf ',' >&3
    csv_escape "$created_epoch" >&3
    printf ',' >&3
    csv_escape "$source" >&3
    printf ',' >&3
    csv_escape "$series_name" >&3
    printf ',' >&3
    csv_escape "$sequence_number" >&3
    printf ',' >&3
    csv_escape "$series_count" >&3
    printf ',' >&3
    csv_escape "$recording_date" >&3
    printf ',' >&3
    csv_escape "$recording_source" >&3
    printf ',' >&3
    csv_escape "$content_type" >&3
    printf ',' >&3
    csv_escape "$city_flag" >&3
    printf '\n' >&3
  fi
done < "$TMP_SORTED"

exec 3>&-

echo "Wrote $count row(s) to: $OUTPUT"
