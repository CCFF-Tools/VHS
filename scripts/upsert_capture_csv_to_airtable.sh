#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd -P)"
exec /usr/bin/ruby "$SCRIPT_DIR/upsert_capture_csv_to_airtable.rb" "$@"
