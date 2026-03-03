# Mission Lore Canon (NoCap / Meridia / Fluxfall Basin / The Stacks)

This document defines the **canon lore** for the VHS Archive “Mission Control” layer.
It is the authoritative reference for names, stakes, tone, and approved in-world terminology.

If a UI label, tooltip, slide caption, or illustration references the mission story,
it should align with this file.

---

## Canon Names (Do Not Drift)

### Species
- **Kermans** (the crew)

### Destination
- **Homeworld:** **NoCap**
- **Planet:** **Meridia**
- **Landing site:** **Fluxfall Basin**
- **Primary outpost:** **The Stacks**

### Threat
- **Cause:** **Core Cascade**
- **Countdown event:** **Great “Signal Fade”**
- **What it destroys:** magnetic media, especially **(S)-VHS** municipal archives

---

## Setting Summary (1 paragraph)

The Kermans are the caretakers of municipal memory: council meetings, ordinances, plans, and civic decisions.
A planetary core reaction (“Core Cascade”) is destabilizing the magnetic field.
As the field shifts and spikes, magnetic recordings degrade faster and more unpredictably.
The Great “Signal Fade” is the point-of-no-return where unprotected tapes begin accelerating toward unreadability.
The mission is to digitize, verify, and **Archive Seal** the records, then evacuate them off-world from NoCap to Meridia,
landing at Fluxfall Basin and establishing The Stacks: a shielded archival outpost built for permanence.

---

## The Threat, Clearly (why this matters)

### Core Cascade → Magnetic Instability
The planet’s dynamo is no longer stable. The field drifts rapidly and experiences turbulence.
This instability is especially dangerous to magnetic storage:
- gradual wobble causes progressive detail loss (fine signal fades first)
- turbulence causes dropouts and stripe noise
- severe spikes can partially overwrite/erase track data

### Great “Signal Fade”
The “Signal Fade” is the projected threshold where damage becomes self-accelerating:
even tapes sitting on shelves begin to degrade quickly if not captured and sealed.

**Mission pressure:** finish evacuation fast enough to keep launch inside the window,
or lose civic history forever.

---

## Mission Objective (what success looks like)

1. **Preserve the signal** (capture before deterioration accelerates)
2. **Mange VHS logistics** (track mission progress through Airtable)
3. **Stabilize payloads** (trim, combine, and export files)
4. **Depart for Meridia** (initiate transfer of all files to NAS)
5. **Land at Fluxfall Basin** (final verification of archive status of each tape)
6. **Expand The Stacks into a permanent off world municipal archive** (upload files to final public archive, probably YouTube)

---

## Workflow → Lore Mapping (the core metaphor)

These are the canonical translations between real work and in-world progress:

- **Intake / Awaiting Capture** → Blueprint backlog / jigs awaiting material
- **Captured** → Airframe construction (the ship visibly grows)
- **Trimmed** → Flight simulation + engine tuning (course math becomes real)
- **Combined** → Avionics / command integration (trajectory locks in)
- **Transferred** → Pad systems / transfer plumbing (final routing & verification)
- **Archived** → **Archive Seal** (cargo certified; mission timeline advances)
- **Blocked** → Quarantine bay (anomalies; show as overlay pressure)

**Rule of the universe (repeat everywhere):**
- **Capture builds the ship**
- **Trim + Combine lock the plan**
- **Archived advances colonization (launch → cruise → land → outpost growth)**

---

## Tone & Style Guide (so it stays consistent)

### Voice
- “Ops-forward with a wink.” The mission metaphor should **add urgency**, not add confusion.
- Prefer short, declarative lines that read well on wallboards.

### Allowed humor
- Light Kerbal-style workplace banter.
- High-stakes phrasing with civic flavor (“minutes”, “records”, “ordinance”, “ledger”).

### Avoid
- Overly long lore paragraphs in operational views.
- Confusing new proper nouns (keep canon names minimal).
- Anything that makes the archival work feel frivolous—this is preservation under pressure.

---

## Approved UI Terms (canonical labels)

Use these exact phrases for consistency:

- **Mission Control for municipal meeting archives**
- **Launch Window**
- **Signal Fade**
- **Core Cascade**
- **Archive Seal** (Archived stage badge)
- **Quarantine** (Blocked overlay)
- **Trajectory: Inside Window / Missed Window**
- **NoCap**, **Meridia**, **Fluxfall Basin**, **The Stacks**

---

## Microcopy Bank (safe-to-use lines)

### Wallboard / Presentation (short captions)
- “Launch window closes before the Signal Fade.”
- “We’re evacuating memory—tape by tape.”
- “Capture builds the ship. Archive Seal launches the mission.”
- “Trim + Combine lock the course.”
- “Quarantine is rising—clear anomalies to keep the window.”

### Tooltips
- “Signal Fade risk increases as magnetic instability worsens.”
- “Archive Seal certifies cargo for Meridia.”
- “Blocked items do not advance mission phase.”

### Status callouts (for slides)
- “Trajectory stable.”
- “Course locked.”
- “Cargo certified.”
- “Approach: Fluxfall Basin.”
- “The Stacks expanding.”

---

## Glossary (quick reference)

- **Core Cascade:** chain reaction destabilizing the planet’s core dynamo.
- **Signal Fade:** the projected point where magnetic media degradation accelerates sharply.
- **Archive Seal:** certification state: digitized + verified + safely stored.
- **Quarantine:** blocked work requiring intervention; counts as mission pressure.
- **NoCap:** homeworld launch point and source of municipal tape rescue missions.
- **The Stacks:** Meridia outpost designed for long-term municipal preservation.

---

## Canon Change Policy

If you want to rename a canon entity (planet/site/outpost/threat terms),
change it **only here** first, then update any dependent configs.
Do not introduce new lore names inside components.
