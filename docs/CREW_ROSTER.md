# Crew Roster (Kermans)

Lore canon and terminology are defined in `docs/MISSION_LORE.md`.
This file focuses on character names, roles, and usage guidelines.

This file defines the canonical “mission control” crew names + positions used in UI copy, slide callouts, and optional avatar/tooltip elements.

## Canon (Do Not Drift)
- Species: **Kermans**
- Homeworld: **NoCap**
- Destination: **Meridia**
- Landing: **Fluxfall Basin**
- Outpost: **The Stacks**
- Threat: Core Cascade → Great “Signal Fade”

## Existing Named Crew (already in-world)
| Name | Position | Domain | Typical appearances |
|---|---|---|---|
| Jebrin Kerman | EVA Technician | Capture rigs, signal recovery | Capture/Assembly moments, “hull progress” |
| Valdo Kerman | Runway Marshal | Pad ops, rollout discipline | Presentation readiness, launch gates |
| Mira Kerman | Science Lead | Magnetics, degradation models | Signal Fade warnings, QA/Blocked triage tone |

## Expanded Crew
Use these for slide voice-lines, tooltips, and “who owns what” clarity.

| Name | Position | Owns stages | What they care about (UI hints) |
|---|---|---|---|
| Genev Kerman | Flight Director | all | launch window status, ETA, confidence |
| Dexrin Kerman | Launch Window Analyst | planning + colonization | deadline math, “inside window / missed” |
| Rivet Kerman | Airframe Chief | captured | capture throughput, consistency, dropouts |
| Paxlo Kerman | GNC Lead | trimmed + combined | trajectory locked, sequencing, “plan locked” |
| Splicia Kerman | Integration Engineer | combined + transferred | merge correctness, continuity, handoffs |
| Mallo Kerman | Pad Ops | transferred | final checks, transfer integrity |
| Nora Kerman | Payload Officer | archived | Archive Seal, chain-of-custody, completeness |
| Bitra Kerman | Telemetry Officer | all | dashboards, KPIs, drilldowns, data correctness |
| Vexa Kerman | QA / Anomaly Review | blocked | quarantine queue, fix-forward actions |

## Style rules (so the crew doesn’t become clutter)
- Crew appears as **light touch**: small caption, tooltip, or a single callout line.
- Do not add multiple character blocks to dense operational views (`/`, `/board`, `/analytics`).
- Presentation mode can use crew voice-lines to keep momentum, but keep them short.

## Optional: Callout templates (one-liners)
- “Rivet: Capture rate is the airframe. Feed the bay.”
- “Paxlo: Trim + Combine locks the course. No hand-wavy burns.”
- “Nora: Archive Seal is cargo certification. No seal, no colony.”
- “Dexrin: Window is closing. Signal Fade doesn’t negotiate.”
- “Vexa: Quarantine is growing. Clear anomalies or we stall.”
