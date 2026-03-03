# AGENTS.md

This file defines how contributors/agents should work in this repository.

## Project Purpose
- Build and maintain an internal operations dashboard for VHS digitization.
- Audience is internal staff (not customer-facing).
- Product tone: information-dense, fast, visually polished, and motivating.
- Core mission statement on Home: `Mission Control for municipal meeting archives`.

## Stack (Do Not Drift)
- Next.js App Router + TypeScript
- TailwindCSS + local shadcn-style UI primitives
- Recharts for visualizations
- Airtable as source of truth
- Vercel-compatible deployment

## Canonical Data Semantics
- Use `Cataloged` terminology, not `Received`, for entry timing.
- "Awaiting Capture" is the display label for stage `Intake`.
- Stage inference lives in `lib/data.ts`; keep stage naming consistent across pages.
- Meeting/event date should come from:
  1. `AIRTABLE_CONTENT_DATE_FIELD` if present
  2. otherwise inferred from `QT Filename` pattern containing `YYYY-MM-DD`
- Runtime values should be shown in `HH:MM:SS` in UI.

## Airtable Rules
- Airtable API key must never be exposed to client code.
- All Airtable access is server-side (`lib/airtable.ts` + API routes).
- Field names are configurable via env and `lib/schema.ts`; add new mappings there first.
- If a chart depends on optional data, always provide a clear empty/fallback state with setup guidance.

## Current Product Expectations
- Home page should prioritize:
  - Workflow stage counts
  - Captured per day (prominent)
  - Cataloged per day
  - Original content recorded timeline
  - Runtime distributions
- Presentation mode (`/presentation`):
  - 16:9 wallboard style
  - auto-rotate slides
  - `Escape` key returns to `/`
  - avoid clutter text and slide counters
- Analytics page includes runtime deep dives (scatter + distributions + density/box/CDF).

## Interactions & Drilldowns
- Phase 1 drilldown is implemented via URL params (`dr*`) and right-side drawer.
- Clicking charts should open filtered tape rows (not just highlight).
- Keep filters shareable/bookmarkable in URL.
- Extend existing `/api/tapes` filtering rather than creating duplicate endpoints.

## Visual/UX Direction
- Keep it "Data Is Beautiful": clean hierarchy, sharp typography, whitespace, high signal.
- Keep it fun but intentional (meme accents are fine, clutter is not).
- Prefer clarity over decoration for operational views.

## Engineering Guardrails
- Favor small, explicit functions in `lib/data.ts`; avoid hidden assumptions.
- Add types for new API response fields in `lib/types.ts`.
- Reuse chart components; add click props rather than forking duplicates.
- Keep components client/server boundaries correct (`use client` only where needed).

## Validation Checklist Before Handoff
- Run: `./node_modules/.bin/tsc --noEmit`
- Verify critical routes load:
  - `/`
  - `/board`
  - `/analytics`
  - `/presentation`
  - `/tapes/[id]`
- Confirm no Airtable secrets leak into client bundle.
- Confirm empty/error states still render gracefully when optional fields are missing.

## Env Variables to Keep in Mind
- Required:
  - `AIRTABLE_API_KEY`
  - `AIRTABLE_BASE_ID`
  - `AIRTABLE_TABLE_NAME`
  - `INTERNAL_APP_PASSWORD`
- Important optional mappings:
  - `AIRTABLE_CONTENT_DATE_FIELD`
  - `AIRTABLE_CAPTURED_AT_FIELD`
  - `AIRTABLE_RUNTIME_NUMERIC_UNIT`

## Change Management
- Preserve existing user-made changes in working tree; do not revert unrelated edits.
- Keep labels and wording consistent across Home, Board, Analytics, Presentation, and Detail views.
- If changing terminology or workflow logic, update both UI labels and filtering semantics.

## Mission Lore + Visualization (Do Not Drift)

This dashboard is also a “Mission Control” metaphor with a canon lore layer used in `/presentation` and some UI copy.

**Canon destinations**
- Homeworld: **NoCap**
- Planet: **Meridia**
- Landing site: **Fluxfall Basin**
- Outpost: **The Stacks**

**Urgency**
- Planetary **Core Cascade** destabilizes the magnetic field, degrading magnetic media (S-VHS etc.).
- Countdown event: **Great “Signal Fade”** (ties to launch window deadline in presentation mode).

**Visualization mapping contract**
- Capture drives **ship assembly** visuals.
- Trim + Combine drive **mission planning / course plotting** visuals.
- Archived drives **colonization timeline** visuals (launch → cruise → landing → outpost growth).
- Blocked triggers **Quarantine overlay**; blocked work never advances phases.

Authoritative specs:
- Mission state contract + milestone tables: `docs/MISSION_STATE.md`
- Crew roster (names + roles + placements): `docs/CREW_ROSTER.md`
