# Tracer User Guide

Tracer is a pen-first tracing surface. It is for the manual step between a reference image and drawn vector output: load an image, fade it back, draw over it on layers, then save JSON or export SVG.

It is local-first. Files stay on your device unless you save, upload, or move them yourself.

## First tracing session

1. Open Tracer in a modern browser.
2. Click **Image** and choose a reference image, or drag an image onto the canvas.
3. Lower **Image** opacity until the reference is visible but not dominant.
4. Draw with a stylus, pen display, or mouse.
5. Use one finger to pan and two fingers to pinch-zoom on touch devices.
6. Click **JSON** to save the project if you want to reopen it later.
7. Click **SVG** when you want vector output for the next tool in the chain.

A useful first test is simple: one black ink layer over a high-contrast reference image. Do not start by testing every feature at once.

## Controls

### Image

Loads the reference image. The artboard follows the reference image size. If no image is loaded, Tracer starts with a default portrait artboard.

### Open

Opens a saved `.json` Tracer project. JSON is the lossless project format. Use this when you want to continue a drawing.

### Image opacity

Controls how strongly the reference image shows through. Lower values make your tracing strokes easier to see.

### Colour and Width

The colour picker changes the active layer colour. Existing strokes on that layer are recoloured as well. Width is the base stroke width before pressure changes it.

### Stabilizer

Smooths hand jitter while preserving raw points in the saved JSON. A low value follows the hand closely. A high value feels steadier but more delayed.

### Smooth

Applies Catmull-Rom curve interpolation when rendering and exporting. This is also non-destructive: the raw points stay in the JSON.

### Pressure width

This is the optional flag for pressure-sensitive thickness. When **Pressure width** is enabled, more pressure makes thicker lines and lighter pressure makes thinner lines. SVG export bakes the result into filled pressure-outline shapes, including pressure-sized circles for single-point marks. When disabled, SVG uses fixed-width paths and fixed-size circles based only on the **Width** slider.

If your device does not provide useful pressure, disable **Pressure width** and treat Tracer as a fixed-line tracing tool.

### Layers

Layers are drawn bottom-to-top. Use them for separate passes such as underdrawing, ink, shadow, or correction marks.

You can:

- add a layer with **+**
- select a layer by tapping/clicking it
- toggle visibility with the eye button
- reorder layers by dragging the grip
- rename a layer by double-clicking the name
- delete a layer with **×**
- adjust active layer opacity at the bottom of the layer panel

## Saving work

### JSON for reopening

Use **JSON** as the working project format. It stores:

- artboard size
- reference image metadata
- the embedded reference image when **Embed** is enabled
- layers, colours, opacity, and visibility
- every raw point with position, pressure, and timestamp
- current drawing settings

Keep **Embed** on when you want one portable file. Turn it off for smaller files if you do not need the reference image inside the project.

### Folder connect

In Chromium browsers, **Folder** connects a local folder through the File System Access API. After that, **JSON** and **SVG** save directly into that folder.

Safari and Firefox usually do not support this API. In those browsers Tracer falls back to normal downloads.

## Exporting SVG for plotting

Use **SVG** for handoff to vector and plotter tools.

The export contains the visible drawing layers, not the reference image. Each visible layer becomes an SVG group with `data-layer="..."`.

Recommended plotter-chain workflow:

1. Keep one layer per pen colour or logical drawing pass.
2. Hide construction layers before export.
3. Export SVG.
4. Inspect the SVG in the next vector tool before plotting.
5. If pressure outlines are too heavy for the target tool, disable **Pressure width** and export again as fixed-width paths.

Tracer is not a raster vectorizer. It does not automatically convert the reference image into paths. The hand-drawn tracing is the output.

## Tablet workflow

On a tablet:

- pen draws
- one finger pans
- two fingers pinch-zoom
- the toolbar becomes a bottom strip that can scroll sideways
- the layer panel stays in the upper part of the viewport

If controls feel cramped, rotate the device or use a browser that lets the PWA run full screen.

## Troubleshooting

### I cannot install it as an app

PWA installation requires HTTPS or `localhost`. Use the GitHub Pages or simiono deployment, not a raw `file://` copy, when testing installation.

### Pressure width does not change line width

Check that **Pressure width** is enabled. If it still looks flat, your browser, operating system, or stylus may not expose pressure through Pointer Events. You can still draw and export fixed-width SVG.

### Folder connect is missing

Your browser probably does not support the File System Access API. Use normal downloads instead.

### The exported SVG looks different from the canvas

Check whether **Smooth** and **Pressure width** are enabled. Pressure-width export uses filled outline polygons; fixed-width export uses regular SVG paths.

### The JSON file is large

Disable **Embed** before saving if you do not need the reference image included inside the JSON.

### Drawing feels delayed

Lower **Stabilizer**. High stabilizer values intentionally smooth hand movement, which can feel like lag.

## What to report when testing

For useful feedback, record:

- device and stylus
- browser and operating system
- whether pressure worked
- whether PWA install worked
- whether Folder connect appeared
- what you tried to export to
- the smallest step that failed or felt confusing

See also: [User handbook](user-handbook.md), [Architecture](architecture.md), [Roadmap](../ROADMAP.md), [First-session workflow](first-session.md), [Feedback template](feedback-template.md), [SVG handoff](svg-handoff.md).
