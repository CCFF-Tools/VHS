#!/usr/bin/env ruby
# frozen_string_literal: true

require "cgi"
require "csv"
require "json"
require "net/http"
require "optparse"
require "time"
require "uri"

FIELD_ALIASES = {
  "Sequence Number" => "Tape Sequence",
  "Series Count" => "Tapes in Sequence",
  "Original Recording Date" => "Rec Date",
}.freeze

BOOLEAN_SOURCE_FIELDS = ["Captured", "Is City Council Meeting"].freeze
NUMBER_SOURCE_FIELDS = ["Sequence Number", "Series Count", "Tape Sequence", "Tapes in Sequence"].freeze
DATETIME_SOURCE_FIELDS = ["Captured At"].freeze
DATE_SOURCE_FIELDS = ["Original Recording Date"].freeze

def parse_simple_env(path)
  File.foreach(path) do |line|
    trimmed = line.strip
    next if trimmed.empty? || trimmed.start_with?("#")

    idx = trimmed.index("=")
    next if idx.nil? || idx < 1

    key = trimmed[0...idx].strip
    value = trimmed[(idx + 1)..].to_s.strip
    if (value.start_with?('"') && value.end_with?('"')) || (value.start_with?("'") && value.end_with?("'"))
      value = value[1...-1]
    end
    ENV[key] = value if ENV[key].nil?
  end
end

def maybe_load_env_from_file(argv)
  return nil if argv.include?("--no-env-file")

  explicit_path = nil
  argv.each_with_index do |arg, idx|
    next unless arg == "--env-file"

    explicit_path = argv[idx + 1]
    break
  end

  candidates = explicit_path ? [explicit_path] : [".env.local", ".env"]
  candidates.each do |candidate|
    next if candidate.nil? || candidate.empty?
    next unless File.file?(candidate)

    parse_simple_env(candidate)
    return candidate
  end

  nil
end

def usage_banner
  <<~USAGE
    Usage:
      ruby scripts/upsert_capture_csv_to_airtable.rb <csv-path> [options]
      ruby scripts/upsert_capture_csv_to_airtable.rb --latest-csv "<glob-pattern>" [options]

    Options:
      --env-file PATH        Load env vars from file (default: .env.local, fallback: .env)
      --no-env-file          Do not load env vars from file
      --latest-csv GLOB      Auto-select newest CSV matching glob (default: AIRTABLE_LATEST_CSV_GLOB)
      --schema-csv PATH      CSV file used as Airtable schema reference (default: AIRTABLE_SCHEMA_CSV)
      --key-field NAME       Unique key field used for upsert (default: AIRTABLE_TAPE_ID_FIELD or "📼")
      --captured-field NAME  Captured field name (default: AIRTABLE_CAPTURED_FIELD or "Captured")
      --captured-value VALUE Forced value for captured field (default: AIRTABLE_CAPTURED_VALUE or "true")
      --no-mark-captured     Do not force a captured value
      --table NAME           Airtable table name/id (default: AIRTABLE_TABLE_NAME)
      --base-id ID           Airtable base id (default: AIRTABLE_BASE_ID)
      --api-key KEY          Airtable token/key (default: AIRTABLE_API_KEY)
      --fields LIST          Comma-separated CSV fields to import (default: all CSV columns)
      --batch-size N         API batch size (1-10, default: 10)
      --pause-ms N           Delay between API calls in ms (default: 225)
      --no-typecast          Disable Airtable typecast (default: enabled)
      --include-empty        Include empty values in updates (default: skip empty)
      --dry-run              Parse and plan only; do not call Airtable
      -h, --help             Show this help
  USAGE
end

def parse_options(argv)
  options = {
    csv_path: nil,
    latest_csv_glob: ENV["AIRTABLE_LATEST_CSV_GLOB"] || "",
    schema_csv_path: ENV["AIRTABLE_SCHEMA_CSV"] || "",
    key_field: ENV["AIRTABLE_TAPE_ID_FIELD"] || "📼",
    captured_field: ENV["AIRTABLE_CAPTURED_FIELD"] || "Captured",
    captured_value: ENV["AIRTABLE_CAPTURED_VALUE"] || "true",
    mark_captured: true,
    table_name: ENV["AIRTABLE_TABLE_NAME"] || "",
    base_id: ENV["AIRTABLE_BASE_ID"] || "",
    api_key: ENV["AIRTABLE_API_KEY"] || "",
    field_filter: nil,
    batch_size: 10,
    pause_ms: 225,
    typecast: true,
    include_empty: false,
    dry_run: false,
  }

  parser = OptionParser.new do |opts|
    opts.banner = usage_banner
    opts.on("--env-file PATH", String) {}
    opts.on("--no-env-file") {}
    opts.on("--latest-csv GLOB", String) { |v| options[:latest_csv_glob] = v }
    opts.on("--schema-csv PATH", String) { |v| options[:schema_csv_path] = v }
    opts.on("--key-field NAME", String) { |v| options[:key_field] = v }
    opts.on("--captured-field NAME", String) { |v| options[:captured_field] = v }
    opts.on("--captured-value VALUE", String) { |v| options[:captured_value] = v }
    opts.on("--no-mark-captured") { options[:mark_captured] = false }
    opts.on("--table NAME", String) { |v| options[:table_name] = v }
    opts.on("--base-id ID", String) { |v| options[:base_id] = v }
    opts.on("--api-key KEY", String) { |v| options[:api_key] = v }
    opts.on("--fields LIST", String) do |v|
      options[:field_filter] = v.split(",").map(&:strip).reject(&:empty?)
    end
    opts.on("--batch-size N", Integer) { |v| options[:batch_size] = v }
    opts.on("--pause-ms N", Integer) { |v| options[:pause_ms] = v }
    opts.on("--no-typecast") { options[:typecast] = false }
    opts.on("--include-empty") { options[:include_empty] = true }
    opts.on("--dry-run") { options[:dry_run] = true }
    opts.on("-h", "--help") do
      puts opts
      exit 0
    end
  end

  positional = parser.parse(argv)
  if positional.empty? && options[:latest_csv_glob].to_s.strip.empty?
    raise ArgumentError, "Missing CSV path. Provide <csv-path> or --latest-csv \"<glob-pattern>\"."
  end
  if !positional.empty? && !options[:latest_csv_glob].to_s.strip.empty?
    raise ArgumentError, "Provide either <csv-path> or --latest-csv, not both."
  end
  options[:csv_path] = positional.first unless positional.empty?

  raise ArgumentError, "--batch-size must be between 1 and 10." if options[:batch_size] < 1 || options[:batch_size] > 10
  raise ArgumentError, "--pause-ms must be >= 0." if options[:pause_ms] < 0
  raise ArgumentError, "Missing key field (--key-field)." if options[:key_field].to_s.strip.empty?
  if options[:mark_captured] && options[:captured_field].to_s.strip.empty?
    raise ArgumentError, "Missing captured field (--captured-field)."
  end

  options
end

def load_csv_rows(path)
  rows = CSV.read(path, headers: true, return_headers: false, encoding: "bom|utf-8")
  raise "CSV is empty." if rows.headers.nil?

  headers = rows.headers.map { |h| h.to_s.strip }
  objects = rows.each_with_index.map do |row, idx|
    values = {}
    headers.each do |header|
      values[header] = row[header]
    end
    values["__row_number"] = idx + 2
    values
  end
  [headers, objects]
end

def normalize_captured_value(value)
  raw = value.to_s.strip
  lowered = raw.downcase
  return true if lowered == "true" || lowered == "1"
  return false if lowered == "false" || lowered == "0"

  raw
end

def coerce_value(source_field, raw_value)
  value = raw_value.to_s.strip

  if BOOLEAN_SOURCE_FIELDS.include?(source_field)
    lowered = value.downcase
    return true if %w[1 true yes y].include?(lowered)
    return false if %w[0 false no n].include?(lowered)
    return value
  end

  return Integer(value) if NUMBER_SOURCE_FIELDS.include?(source_field) && value.match?(/^-?[0-9]+$/)

  if DATETIME_SOURCE_FIELDS.include?(source_field)
    match = value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?\s*([+-]\d{2}):?(\d{2})?$/)
    return value unless match

    second = match[6] || "00"
    tz_minute = match[8] || "00"
    return "#{match[1]}-#{match[2]}-#{match[3]}T#{match[4]}:#{match[5]}:#{second}#{match[7]}:#{tz_minute}"
  end

  if DATE_SOURCE_FIELDS.include?(source_field)
    match = value.match(/^(\d{4})[-_\/](\d{2})[-_\/](\d{2})$/)
    return value unless match

    return "#{match[1]}-#{match[2]}-#{match[3]}"
  end

  value
end

def resolve_upload_fields(csv_headers, requested_fields, schema_headers)
  source_fields = (requested_fields && !requested_fields.empty? ? requested_fields : csv_headers).reject { |name| name == "__row_number" }

  if schema_headers.nil? || schema_headers.empty?
    pairs = source_fields.map { |source| { source: source, target: source } }
    return {
      source_target_pairs: pairs,
      skipped_source_fields: [],
      alias_mappings: [],
      target_fields: pairs.map { |p| p[:target] }.uniq,
    }
  end

  schema_set = schema_headers.each_with_object({}) { |h, out| out[h] = true }
  source_target_pairs = []
  skipped_source_fields = []
  alias_mappings = []
  used_targets = {}

  source_fields.each do |source_field|
    target_field = nil
    if schema_set[source_field]
      target_field = source_field
    else
      aliased = FIELD_ALIASES[source_field]
      if aliased && schema_set[aliased]
        target_field = aliased
        alias_mappings << "#{source_field} -> #{aliased}"
      end
    end

    unless target_field
      skipped_source_fields << source_field
      next
    end

    next if used_targets[target_field]

    used_targets[target_field] = true
    source_target_pairs << { source: source_field, target: target_field }
  end

  {
    source_target_pairs: source_target_pairs,
    skipped_source_fields: skipped_source_fields,
    alias_mappings: alias_mappings,
    target_fields: used_targets.keys,
  }
end

def build_payload_rows(rows, key_field, include_empty, source_target_pairs, captured_field, mark_captured, captured_value)
  payload_rows = []
  skipped_missing_key = 0

  rows.each do |row|
    key_value = row[key_field].to_s.strip
    if key_value.empty?
      skipped_missing_key += 1
      next
    end

    fields = {}
    source_target_pairs.each do |pair|
      source_field = pair[:source]
      target_field = pair[:target]
      next unless row.key?(source_field)

      raw = row[source_field]
      value = raw.nil? ? "" : raw.to_s
      next if !include_empty && value.strip.empty?

      fields[target_field] = coerce_value(source_field, value)
    end

    fields[key_field] = key_value unless fields.key?(key_field)
    fields[captured_field] = normalize_captured_value(captured_value) if mark_captured

    payload_rows << {
      key_value: key_value,
      row_number: row["__row_number"],
      fields: fields,
    }
  end

  [payload_rows, skipped_missing_key]
end

def chunk(array, size)
  out = []
  i = 0
  while i < array.length
    out << array[i, size]
    i += size
  end
  out
end

def should_retry_status?(status)
  return true if status == 429
  return true if status >= 500 && status <= 599

  false
end

def parse_airtable_error(response)
  body = response.body.to_s
  begin
    parsed = JSON.parse(body)
    error = parsed["error"]
    if error.is_a?(Hash)
      type = error["type"]
      message = error["message"]
      return "#{type} #{message}".strip
    end
  rescue JSON::ParserError
    # ignored
  end
  body.empty? ? response.message.to_s : body
end

def request_json(method:, url:, api_key:, body: nil)
  uri = URI(url)
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true

  req =
    case method
    when :get
      Net::HTTP::Get.new(uri)
    when :post
      Net::HTTP::Post.new(uri)
    when :patch
      Net::HTTP::Patch.new(uri)
    else
      raise "Unsupported method: #{method}"
    end

  req["Authorization"] = "Bearer #{api_key}"
  req["Content-Type"] = "application/json"
  req.body = JSON.generate(body) if body

  response = http.request(req)
  status = response.code.to_i

  if status >= 400
    raise({
      status: status,
      message: parse_airtable_error(response),
    })
  end

  response.body.to_s.empty? ? {} : JSON.parse(response.body)
end

def with_retry(label, max_retries = 5)
  attempt = 0
  begin
    return yield
  rescue => error
    status = error.is_a?(Hash) ? error[:status].to_i : 0
    attempt += 1
    if !should_retry_status?(status) || attempt > max_retries
      raise error
    end

    delay_ms = 400 * (2**(attempt - 1)) + rand(200)
    warn "#{label} failed with status #{status}; retrying in #{delay_ms}ms (attempt #{attempt}/#{max_retries})"
    sleep(delay_ms / 1000.0)
    retry
  end
end

def table_endpoint(base_id, table_name)
  encoded_table = CGI.escape(table_name).gsub("+", "%20")
  "https://api.airtable.com/v0/#{base_id}/#{encoded_table}"
end

def fetch_existing_record_map(base_id, table_name, api_key, key_field)
  endpoint = table_endpoint(base_id, table_name)
  record_id_by_key = {}
  duplicate_keys = {}
  offset = nil

  loop do
    query = [["pageSize", "100"], ["fields[]", key_field]]
    query << ["offset", offset] if offset
    query_string = URI.encode_www_form(query)
    url = "#{endpoint}?#{query_string}"

    body = with_retry("fetch existing records") do
      request_json(method: :get, url: url, api_key: api_key)
    end

    records = body["records"] || []
    records.each do |record|
      fields = record["fields"] || {}
      key = fields[key_field].to_s.strip
      next if key.empty?

      if record_id_by_key.key?(key)
        duplicate_keys[key] = true
      else
        record_id_by_key[key] = record["id"]
      end
    end

    offset = body["offset"]
    break if offset.nil? || offset.to_s.empty?
  end

  [record_id_by_key, duplicate_keys.keys]
end

def summarize_error(error)
  if error.is_a?(Hash)
    status = error[:status]
    msg = error[:message].to_s.strip
    return "status=#{status} #{msg}".strip
  end
  error.to_s
end

def resolve_csv_path(options)
  explicit_path = options[:csv_path].to_s.strip
  return [explicit_path, false] unless explicit_path.empty?

  glob_pattern = options[:latest_csv_glob].to_s.strip
  raise "Missing CSV path." if glob_pattern.empty?

  matches = Dir.glob(glob_pattern).select { |path| File.file?(path) }
  raise "No CSV files matched pattern: #{glob_pattern}" if matches.empty?

  latest = matches.max_by { |path| File.mtime(path) }
  [latest, true]
end

def run
  env_file_used = maybe_load_env_from_file(ARGV)
  options = parse_options(ARGV)
  csv_path, csv_auto_selected = resolve_csv_path(options)
  headers, rows = load_csv_rows(csv_path)

  schema_headers = []
  schema_csv_used = ""
  unless options[:schema_csv_path].to_s.strip.empty?
    schema_headers, = load_csv_rows(options[:schema_csv_path])
    schema_csv_used = options[:schema_csv_path]
  end

  if !schema_headers.empty? && !schema_headers.include?(options[:key_field])
    raise "Key field \"#{options[:key_field]}\" is not present in schema CSV: #{schema_csv_used}"
  end
  if !schema_headers.empty? && options[:mark_captured] && !schema_headers.include?(options[:captured_field])
    raise "Captured field \"#{options[:captured_field]}\" is not present in schema CSV: #{schema_csv_used}"
  end

  field_resolution = resolve_upload_fields(headers, options[:field_filter], schema_headers)
  payload_rows, skipped_missing_key = build_payload_rows(
    rows,
    options[:key_field],
    options[:include_empty],
    field_resolution[:source_target_pairs],
    options[:captured_field],
    options[:mark_captured],
    options[:captured_value]
  )

  if payload_rows.empty?
    puts "No valid rows to process."
    puts "Skipped #{skipped_missing_key} row(s) with empty \"#{options[:key_field]}\"." if skipped_missing_key > 0
    return
  end

  deduped_by_key = {}
  duplicate_input_rows = 0
  payload_rows.each do |row|
    duplicate_input_rows += 1 if deduped_by_key.key?(row[:key_value])
    deduped_by_key[row[:key_value]] = row
  end
  deduped_rows = deduped_by_key.values

  puts "CSV headers: #{headers.join(', ')}"
  puts "CSV path: #{csv_path}"
  puts "CSV auto-selected: true (latest match for #{options[:latest_csv_glob]})" if csv_auto_selected
  puts "Schema CSV: #{schema_csv_used}" unless schema_csv_used.empty?
  puts "Input rows: #{rows.length}"
  puts "Rows with key (#{options[:key_field]}): #{payload_rows.length}"
  puts "Mapped fields: #{field_resolution[:alias_mappings].join('; ')}" unless field_resolution[:alias_mappings].empty?
  puts "Skipped non-schema fields: #{field_resolution[:skipped_source_fields].join(', ')}" unless field_resolution[:skipped_source_fields].empty?
  puts "Upload fields: #{field_resolution[:target_fields].join(', ')}" unless field_resolution[:target_fields].empty?
  puts "Skipped rows with empty key: #{skipped_missing_key}" if skipped_missing_key > 0
  puts "Duplicate key rows in CSV: #{duplicate_input_rows} (last row per key wins)" if duplicate_input_rows > 0
  if options[:mark_captured]
    forced = normalize_captured_value(options[:captured_value]).inspect
    puts "Forcing \"#{options[:captured_field]}\" = #{forced} on all upsert rows"
  end
  puts "Loaded env from: #{env_file_used}" if env_file_used

  if options[:dry_run]
    puts "Dry run enabled; Airtable was not called."
    puts "Rows that would be upserted: #{deduped_rows.length}"
    return
  end

  if options[:api_key].to_s.empty? || options[:base_id].to_s.empty? || options[:table_name].to_s.empty?
    raise "Missing Airtable credentials. Set AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME."
  end

  record_id_by_key, duplicate_keys = fetch_existing_record_map(
    options[:base_id],
    options[:table_name],
    options[:api_key],
    options[:key_field]
  )
  unless duplicate_keys.empty?
    warn "Found #{duplicate_keys.length} duplicate key(s) already in Airtable; updating the first match per key."
  end

  to_update = []
  to_create = []
  deduped_rows.each do |row|
    existing_id = record_id_by_key[row[:key_value]]
    if existing_id
      to_update << { id: existing_id, fields: row[:fields] }
    else
      to_create << { fields: row[:fields] }
    end
  end

  puts "Will update: #{to_update.length}"
  puts "Will create: #{to_create.length}"

  endpoint = table_endpoint(options[:base_id], options[:table_name])
  created = 0
  updated = 0

  update_batches = chunk(to_update, options[:batch_size])
  create_batches = chunk(to_create, options[:batch_size])

  update_batches.each_with_index do |batch, idx|
    body = { records: batch, typecast: options[:typecast] }
    with_retry("update batch #{idx + 1}/#{update_batches.length}") do
      request_json(method: :patch, url: endpoint, api_key: options[:api_key], body: body)
    end
    updated += batch.length
    puts "Updated #{updated}/#{to_update.length}"
    if options[:pause_ms] > 0 && (idx < update_batches.length - 1 || !create_batches.empty?)
      sleep(options[:pause_ms] / 1000.0)
    end
  end

  create_batches.each_with_index do |batch, idx|
    body = { records: batch, typecast: options[:typecast] }
    with_retry("create batch #{idx + 1}/#{create_batches.length}") do
      request_json(method: :post, url: endpoint, api_key: options[:api_key], body: body)
    end
    created += batch.length
    puts "Created #{created}/#{to_create.length}"
    if options[:pause_ms] > 0 && idx < create_batches.length - 1
      sleep(options[:pause_ms] / 1000.0)
    end
  end

  puts "Upsert complete."
  puts "Summary: #{updated} updated, #{created} created, #{skipped_missing_key} skipped (missing key)."
end

begin
  run
rescue => error
  warn "Import failed: #{summarize_error(error)}"
  exit 1
end
