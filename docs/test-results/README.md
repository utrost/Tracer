# Tracer Manual Test Log

This folder records real-device sessions. Use one Markdown file per session, named like `2026-07-31-chrome-android-pixel-tablet.md`.

Start from [Feedback template](../feedback-template.md). Copy the template into a dated file, fill in only what was actually tested, and attach exported JSON/SVG/screenshots when useful.

## Smoke matrix

Minimum coverage before calling a release comfortable for the first users:

- Chrome desktop: load image, draw, save JSON, reopen JSON, export SVG, install PWA if offered.
- Chrome Android: draw with stylus, pan with one finger, pinch zoom with two fingers, save/download JSON and SVG.
- Safari iPad: Apple Pencil draw, touch pan/zoom, JSON/SVG download behavior, Add to Home Screen if available.
- Firefox: draw, save/download JSON and SVG, confirm Folder connect fallback is clear.

## Manual test log fields

- Device and stylus
- Browser and operating system
- Pressure behavior
- Folder connect availability
- PWA install/offline result
- JSON save/reopen result
- SVG export target and result
- Confusing step or failure point

## Rule

Record observations first. Convert repeated failures into GitHub issues or roadmap changes after at least two similar reports, unless the failure blocks the first session completely.
