# Tracer Roadmap

Goal: 50 real users who can open Tracer, complete at least one tracing session, save their work, and understand what to do when the browser or stylus behaves differently than expected.

The roadmap is deliberately small. Tracer is useful because it is a direct pen-first tool, not because it has every drawing feature.

## Current state

Tracer is a self-contained static PWA for stylus tracing.

Already in place:

- load a reference image and control its opacity
- draw pressure-sensitive strokes with optional stabilizer and smoothing
- organize strokes into layers with colour, opacity, visibility, reorder, rename, and delete controls
- save lossless JSON projects, optionally embedding the reference image
- export visible layers as SVG for the plotter/vector toolchain
- direct folder save in Chromium through the File System Access API
- offline/PWA app shell with manifest, icons, and service worker
- regression tests for the core file format, sanitization, pointer handling, and deploy artifact contract
- user-facing docs: README, handbook, practical guide, architecture notes, and this roadmap

Known gaps:

- no built-in onboarding beyond the compact guide panel
- no sample reference image or guided first-run project
- no in-app diagnostics for pressure quality, browser capability, or export suitability
- no structured feedback channel from actual users
- no import/export compatibility matrix from real plotter workflows yet

## Milestone 1 — reliable first session, 1 to 5 users

Purpose: a first user should be able to trace something without being coached in chat.

Work:

- keep the app deployable as plain static files under GitHub Pages and `/tracer/`
- ship the in-app guide panel and link to `docs/user-guide.md`
- keep README and user-guide instructions aligned with actual controls
- add a smoke checklist for Chrome desktop, Chrome Android, Safari iPad, and Firefox
- add a tiny example workflow: reference image → ink layer → save JSON → export SVG

Acceptance:

- a new user can complete the first tracing session in under 10 minutes
- JSON can be reopened without losing stabilizer, layer, or pressure data
- SVG export opens in at least one downstream vector tool
- the app works after reload with the network disabled on the installed PWA path

## Milestone 2 — useful feedback loop, 5 to 15 users

Purpose: collect enough practical evidence to know what breaks first.

Work:

- add a short feedback template in docs: device, browser, stylus, pressure behavior, export target, failure point
- add a manual test log under `docs/test-results/` for real-device sessions
- add visible pressure/browser capability diagnostics inside the app
- clarify what Tracer does not do: no raster vectorization, no brush library, no cloud sync
- document common SVG handoff paths for plotting tools

Acceptance:

- at least 5 external sessions are recorded with device/browser notes
- pressure/no-pressure behavior is understandable without opening dev tools
- the guide explains the correct fallback when Folder connect is missing
- recurring problems are turned into issues or roadmap items, not only remembered informally

## Milestone 3 — robust tablet workflow, 15 to 30 users

Purpose: make Tracer comfortable enough for repeated tablet use.

Work:

- improve the mobile/tablet toolbar based on observed mis-taps and cramped controls
- add optional sample/reference files for onboarding
- add autosave or recovery only if real users lose work
- add export naming controls if downloaded filenames become confusing
- add more structural tests around guide-panel interaction and deployment files

Acceptance:

- the main tested tablet path has no horizontal overflow or hidden critical controls
- accidental page scrolling/zooming does not interrupt drawing
- users can distinguish save-for-later JSON from handoff SVG
- no more than one critical workflow issue remains open from the first 30 user sessions

## Milestone 4 — plotter-chain fit, 30 to 50 users

Purpose: make the exported SVG predictable enough for the larger drawing/plotting workflow.

Work:

- test SVG output with the downstream plotter/vector pipeline
- document the expected SVG structure and limitations in `docs/architecture.md`
- add export options only when backed by a real workflow need: simplified paths, fixed-width paths, per-layer groups, or scale metadata
- add a small gallery of outputs only after there are real examples worth showing
- update the public Tracer article when the workflow is clearer

Acceptance:

- at least 3 different reference-image styles produce usable exported SVGs
- users can select a plotting workflow from docs without guessing hidden assumptions
- the README states the current maturity honestly
- 50 real users can be supported by docs, tests, and known manual checks rather than one-off explanations

## Not planned before 50 users

- cloud accounts or sync
- collaborative editing
- complex brush engine
- raster auto-vectorization
- a bundled backend
- heavy build system unless the single-file model becomes a real blocker

## Operating rules

- Keep the app static, local-first, and easy to inspect.
- Add features only when they reduce friction in a real tracing/export workflow.
- Prefer boring browser APIs over dependencies.
- Keep tests covering the file format, deploy contract, and the specific regressions that have already happened.
- When in doubt, improve the guide before adding another control.
