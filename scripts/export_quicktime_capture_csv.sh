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
      --series-mode MODE  Series grouping: parent or root (default: parent, standard format only)
      --series-name NAME  Force one series name for all rows (standard format only)
      --sequence-by MODE  Row ordering in output: created or name (default: created)
      --recording-date D  Force original recording date for all rows (YYYY-MM-DD)
      --tape-name NAME    Force tape name/label for all rows
      --content-type T    Legacy option (ignored for Tape Name parsing)
  -h, --help              Show this help

Formats:
  airtable  -> QT Filename,📼,Tape Name,Captured At,Captured,Capture File Path,Tape Sequence,Tapes in Sequence,Original Recording Date,Label RT,Is City Council Meeting
  standard  -> File Name,Primary Identifier,File Path,Created At,Created Epoch,Timestamp Source,Series Name,Tape Name,Tape Name Source,Tape Sequence,Tapes in Sequence,Tape Span Source,Original Recording Date,Recording Date Source,Label RT,Label RT Source,Is City Council Meeting

Examples:
  ./export_quicktime_capture_csv.sh -r "/Volumes/Capture Drive/Session_2026_03_01"
  ./export_quicktime_capture_csv.sh -r . -o capture.csv --recording-date 1994-04-13
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
TAPE_NAME_OVERRIDE=""
CONTENT_TYPE_OVERRIDE=""

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
    --tape-name)
      TAPE_NAME_OVERRIDE="$2"
      shift 2
      ;;
    --content-type)
      CONTENT_TYPE_OVERRIDE="$2"
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

if [ -n "$CONTENT_TYPE_OVERRIDE" ]; then
  echo "Warning: --content-type is ignored for Tape Name; Tape Name is parsed from filename text." >&2
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

infer_tape_span() {
  local filename="$1"
  local stem=""
  local -a tokens=()
  local token_count=0
  local i=0
  local seq_raw=""
  local total_raw=""
  local of_token=""
  local seq=1
  local total=1

  stem="${filename%.*}"
  read -r -a tokens <<< "$stem"
  token_count="${#tokens[@]}"

  for ((i=0; i+2<token_count; i++)); do
    if [[ "${tokens[$i]}" =~ ^[0-9]{1,3}$ ]] && [[ "${tokens[$((i+2))]}" =~ ^[0-9]{1,3}$ ]]; then
      of_token="$(echo "${tokens[$((i+1))]}" | tr '[:upper:]' '[:lower:]')"
      if [ "$of_token" = "of" ]; then
        seq_raw="${tokens[$i]}"
        total_raw="${tokens[$((i+2))]}"
        seq=$((10#$seq_raw))
        total=$((10#$total_raw))
        if [ "$seq" -ge 1 ] && [ "$total" -ge "$seq" ]; then
          printf '%s\t%s\tfilename_pattern' "$seq" "$total"
          return
        fi
      fi
    fi
  done

  printf '1\t1\tdefault_single'
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

infer_label_runtime() {
  local filename="$1"
  local file_path="$2"
  local stem=""
  local -a tokens=()
  local token_count=0
  local candidate=""
  local h=""
  local m=""
  local s=""
  local h_n=0
  local m_n=0
  local s_n=0
  local duration_raw=""
  local duration_sec=""

  stem="${filename%.*}"
  read -r -a tokens <<< "$stem"
  token_count="${#tokens[@]}"
  if [ "$token_count" -eq 0 ]; then
    printf '\tmissing'
    return
  fi

  candidate="${tokens[$((token_count - 1))]}"
  if [[ "$candidate" =~ ^([0-9]{1,4})[.:]([0-9]{1,2})[.:]([0-9]{1,2})$ ]]; then
    h="${BASH_REMATCH[1]}"
    m="${BASH_REMATCH[2]}"
    s="${BASH_REMATCH[3]}"
    h_n=$((10#$h))
    m_n=$((10#$m))
    s_n=$((10#$s))

    # Only accept runtime-like triples at end of filename token list.
    if [ "$h_n" -lt 100 ] && [ "$m_n" -ge 0 ] && [ "$m_n" -le 59 ] && [ "$s_n" -ge 0 ] && [ "$s_n" -le 59 ]; then
      printf '%d:%02d:%02d\tfilename_pattern' "$h_n" "$m_n" "$s_n"
      return
    fi
  fi

  # Fallback to Finder/Spotlight metadata duration for real file runtime.
  duration_raw="$(mdls -name kMDItemDurationSeconds -raw "$file_path" 2>/dev/null || true)"
  if [ -n "$duration_raw" ] && [ "$duration_raw" != "(null)" ]; then
    duration_sec="$(awk -v v="$duration_raw" 'BEGIN { if (v ~ /^[0-9]+([.][0-9]+)?$/) printf "%d", v + 0.5; }')"
    if [ -n "$duration_sec" ] && [ "$duration_sec" -ge 0 ] 2>/dev/null; then
      h_n=$((duration_sec / 3600))
      m_n=$(((duration_sec % 3600) / 60))
      s_n=$((duration_sec % 60))
      printf '%d:%02d:%02d\tfile_metadata' "$h_n" "$m_n" "$s_n"
      return
    fi
  fi

  printf '\tmissing'
}

infer_tape_name() {
  local filename="$1"
  local stem=""
  local working=""
  local -a tokens=()
  local token_count=0
  local i=0
  local date_index=-1
  local start_index=0
  local sequence_index=-1
  local end_index=0
  local of_token=""
  local label=""

  if [ -n "$TAPE_NAME_OVERRIDE" ]; then
    printf '%s\tmanual' "$TAPE_NAME_OVERRIDE"
    return
  fi

  stem="${filename%.*}"
  working="$(echo "$stem" | sed -E 's/^[[:space:]]*[Vv][Hh][Ss][-_[:space:]]*[0-9]+[[:space:]_-]*//')"
  read -r -a tokens <<< "$working"
  token_count="${#tokens[@]}"

  if [ "$token_count" -eq 0 ]; then
    printf '\tmissing'
    return
  fi

  for ((i=0; i<token_count; i++)); do
    if [[ "${tokens[$i]}" =~ ^[12][0-9]{3}[-_.][01][0-9][-_.][0-3][0-9]$ ]] || [[ "${tokens[$i]}" =~ ^[12][0-9]{7}$ ]]; then
      date_index="$i"
      break
    fi
  done

  if [ "$date_index" -ge 0 ]; then
    start_index=$((date_index + 1))
  fi

  for ((i=start_index; i+2<token_count; i++)); do
    if [[ "${tokens[$i]}" =~ ^[0-9]{1,3}$ ]] && [[ "${tokens[$((i+2))]}" =~ ^[0-9]{1,3}$ ]]; then
      of_token="$(echo "${tokens[$((i+1))]}" | tr '[:upper:]' '[:lower:]')"
      if [ "$of_token" = "of" ]; then
        sequence_index="$i"
        break
      fi
    fi
  done

  if [ "$sequence_index" -ge 0 ]; then
    end_index=$((sequence_index - 1))
  else
    end_index=$((token_count - 1))
  fi

  # Exclude trailing runtime token only when it is at the end.
  if [ "$end_index" -ge "$start_index" ] && [[ "${tokens[$end_index]}" =~ ^([0-9]{1,4})[.:]([0-9]{1,2})[.:]([0-9]{1,2})$ ]]; then
    h_n=$((10#${BASH_REMATCH[1]}))
    m_n=$((10#${BASH_REMATCH[2]}))
    s_n=$((10#${BASH_REMATCH[3]}))
    if [ "$h_n" -lt 100 ] && [ "$m_n" -ge 0 ] && [ "$m_n" -le 59 ] && [ "$s_n" -ge 0 ] && [ "$s_n" -le 59 ]; then
      end_index=$((end_index - 1))
    fi
  fi

  if [ "$end_index" -lt "$start_index" ]; then
    printf '\tmissing'
    return
  fi

  for ((i=start_index; i<=end_index; i++)); do
    if [ -n "$label" ]; then
      label="$label ${tokens[$i]}"
    else
      label="${tokens[$i]}"
    fi
  done

  label="$(echo "$label" | sed -E 's/^[[:space:]_-]+//;s/[[:space:]_-]+$//')"
  if [ -z "$label" ]; then
    printf '\tmissing'
    return
  fi

  printf '%s\tfilename_segment' "$label"
}

is_city_flag() {
  local tape_name="$1"
  local lowered=""

  lowered="$(echo "$tape_name" | tr '[:upper:]' '[:lower:]')"
  if [[ "$lowered" == *"city council"* ]]; then
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
trap 'rm -f "$TMP_META" "$TMP_SORTED"' EXIT
META_DELIM=$'\037'

exec 3>"$OUTPUT"

if [ "$FORMAT" = "airtable" ]; then
  id_field_escaped="${ID_FIELD//\"/\"\"}"
  printf '"QT Filename","%s","Tape Name","Captured At","Captured","Capture File Path","Tape Sequence","Tapes in Sequence","Original Recording Date","Label RT","Is City Council Meeting"\n' "$id_field_escaped" >&3
else
  printf '"File Name","Primary Identifier","File Path","Created At","Created Epoch","Timestamp Source","Series Name","Tape Name","Tape Name Source","Tape Sequence","Tapes in Sequence","Tape Span Source","Original Recording Date","Recording Date Source","Label RT","Label RT Source","Is City Council Meeting"\n' >&3
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
  tape_span_result="$(infer_tape_span "$filename")"
  tape_sequence="${tape_span_result%%$'\t'*}"
  tape_span_rest="${tape_span_result#*$'\t'}"
  tapes_in_sequence="${tape_span_rest%%$'\t'*}"
  tape_span_source="${tape_span_rest#*$'\t'}"
  recording_result="$(infer_recording_date "$filename")"
  recording_date="${recording_result%%$'\t'*}"
  recording_source="${recording_result#*$'\t'}"
  tape_name_result="$(infer_tape_name "$filename")"
  tape_name="${tape_name_result%%$'\t'*}"
  tape_name_source="${tape_name_result#*$'\t'}"
  label_rt_result="$(infer_label_runtime "$filename" "$file")"
  label_rt="${label_rt_result%%$'\t'*}"
  label_rt_source="${label_rt_result#*$'\t'}"
  city_flag="$(is_city_flag "$tape_name")"

  printf '%s\037%s\037%s\037%s\037%s\037%s\037%s\037%s\037%s\037%s\037%s\037%s\037%s\037%s\037%s\037%s\037%s\n' \
    "$filename" \
    "$file" \
    "$created_at" \
    "$created_epoch" \
    "$source" \
    "$series_name" \
    "$tape_name" \
    "$tape_name_source" \
    "$tape_sequence" \
    "$tapes_in_sequence" \
    "$tape_span_source" \
    "$recording_date" \
    "$recording_source" \
    "$label_rt" \
    "$label_rt_source" \
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
  sort -t "$META_DELIM" -k1,1 "$TMP_META" > "$TMP_SORTED"
else
  sort -t "$META_DELIM" -k4,4n -k1,1 "$TMP_META" > "$TMP_SORTED"
fi

while IFS="$META_DELIM" read -r filename file created_at created_epoch source series_name tape_name tape_name_source tape_sequence tapes_in_sequence tape_span_source recording_date recording_source label_rt label_rt_source city_flag primary_id; do

  if [ "$FORMAT" = "airtable" ]; then
    csv_escape "$filename" >&3
    printf ',' >&3
    csv_escape "$primary_id" >&3
    printf ',' >&3
    csv_escape "$tape_name" >&3
    printf ',' >&3
    csv_escape "$created_at" >&3
    printf ',' >&3
    csv_escape "1" >&3
    printf ',' >&3
    csv_escape "$file" >&3
    printf ',' >&3
    csv_escape "$tape_sequence" >&3
    printf ',' >&3
    csv_escape "$tapes_in_sequence" >&3
    printf ',' >&3
    csv_escape "$recording_date" >&3
    printf ',' >&3
    csv_escape "$label_rt" >&3
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
    csv_escape "$tape_name" >&3
    printf ',' >&3
    csv_escape "$tape_name_source" >&3
    printf ',' >&3
    csv_escape "$tape_sequence" >&3
    printf ',' >&3
    csv_escape "$tapes_in_sequence" >&3
    printf ',' >&3
    csv_escape "$tape_span_source" >&3
    printf ',' >&3
    csv_escape "$recording_date" >&3
    printf ',' >&3
    csv_escape "$recording_source" >&3
    printf ',' >&3
    csv_escape "$label_rt" >&3
    printf ',' >&3
    csv_escape "$label_rt_source" >&3
    printf ',' >&3
    csv_escape "$city_flag" >&3
    printf '\n' >&3
  fi
done < "$TMP_SORTED"

exec 3>&-

echo "Wrote $count row(s) to: $OUTPUT"
