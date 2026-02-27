# VHS Ops Flow Product Spec

## Experience Goals
- Give operators a high-signal at-a-glance view of throughput, queue pressure, and bottlenecks.
- Keep production movement visible in a live kanban board with aging and issue indicators.
- Support fast drill-down into any tape for context and optional internal actions.
- Make analytics readable and comparative (distribution, backlog trend, cohorts, issue mix).

## Core Views
- `/`: Operations dashboard with KPI cards, throughput trend, backlog trend, stage flow, and bottleneck callouts.
- `/board`: Production board grouped by stage with filters and search.
- `/tapes/[id]`: Tape detail page with timeline, metadata, related tapes, and optional write actions.
- `/analytics`: Deep-dive analytics for runtime drift distribution, cohorts, stage aging, sequence progress, and issues.

## Data Mapping Strategy
- Single Airtable table (`Titled Table`) is normalized into `TapeRecord` objects.
- Pipeline stage is inferred from completion booleans and filenames:
  - `Archival Filename` => `Archived`
  - `Transferred to NAS` => `Transfer`
  - `Combined` => `Combine`
  - `Trimmed` => `Trim`
  - `Captured` or `QT Filename` => `Capture`
  - else => `Intake`
- Field names are centralized in `lib/schema.ts` and overrideable by env vars.

## Workflow-Specific Metrics
- Queue metrics by real stages: Intake, Capture, Trim/Combine, Transfer, Archived.
- Blocked queue inferred from issue heuristics (runtime mismatch, missing QT file, stalled transitions).
- Runtime drift analytics from `Label RT`, `QT TRT`, and `Final Clip Duration`.
- Sequence progress from `Tape Sequence` + `Tapes in Sequence`.

## Internal Actions
- Optional status and note writes are exposed via API routes.
- Password-gated internal access through `x-internal-password` header.
- Airtable API key remains server-side only.

## Performance + Reliability
- SWR client caching and refresh intervals for near-live feel.
- Next.js route-level revalidation for cached API responses.
- Airtable request backoff with exponential retry to handle transient limits.
