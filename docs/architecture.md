# Tracer Architecture

Tracer is a static, dependency-free web application for pressure-sensitive image tracing. The project deliberately optimizes for local ownership, portability, and a small maintenance surface.

## Design goals

1. **File-first workflow** — projects save as ordinary JSON files and artwork exports as SVG.
2. **No backend** — all drawing, saving, loading, and export happen in the browser.
3. **No dependency chain** — the distributable app is a single HTML file plus optional PWA assets.
4. **Tablet-first interaction** — pen draws, touch navigates, and the UI adapts to narrow screens.
5. **Non-destructive stroke processing** — raw points remain intact; smoothing and stabilization run at render/export time.

## Repository layout

```text
.
├── index.html                 # Application shell, styles, UI, and inline JS app
├── manifest.webmanifest       # PWA manifest
├── sw.js                      # Service worker for offline app-shell caching
├── icons/                     # PWA install icons
├── docs/
│   ├── capture-format.md
│   ├── first-session.md
│   ├── feedback-template.md
│   ├── svg-handoff.md
│   ├── screenshot.png
│   ├── samples/
│   │   ├── reference-grid.svg
│   │   └── example-project.json
│   ├── test-results/
│   │   └── README.md
│   ├── user-guide.md
│   ├── user-handbook.md
│   └── architecture.md
├── ROADMAP.md                 # Path from current state to 50 real users
├── tests/
│   └── tracer-core.test.cjs   # Dependency-free Node regression tests
└── .github/workflows/         # CI and GitHub Pages deployment
```

## Runtime architecture

Tracer runs entirely in one browser document.

```text
Pointer events / files / toolbar controls
          │
          ▼
Application state
  - artboard
  - reference image
  - layers
  - strokes
  - view transform
  - settings
          │
          ├── Canvas renderer
          │     - background sheet
          │     - reference image
          │     - layer compositing
          │     - processed strokes
          │
          ├── JSON serializer/loader
          │     - lossless project format
          │     - input sanitization
          │
          └── SVG exporter
                - visible layers
                - pressure outlines or fixed-width paths
```

## State model

The primary runtime state is kept in JavaScript variables in `index.html`:

- `AW`, `AH` — artboard dimensions.
- `bgImage`, `bgName` — reference image and source name.
- `view` — canvas scale and offset.
- `layers` — ordered layer array, bottom-to-top.
- `activeId` — active layer id.
- `undoStack`, `redoStack` — stroke-level history.
- `cfg` — drawing settings such as image opacity, pen width, stabilizer, smoothing, pressure rendering, and image embedding.

Layer shape:

```js
{
  id,
  name,
  color,
  visible,
  opacity,
  strokes: [
    {
      color,
      width,
      points: [{ x, y, p, t }]
    }
  ]
}
```

Raw points are the source of truth. Processed paths are derived when drawing or exporting.

## Rendering pipeline

1. Clear the full HiDPI canvas.
2. Apply the artboard-to-device transform.
3. Draw the white artboard sheet.
4. Draw the reference image at configured opacity.
5. Draw visible layers bottom-to-top.
6. For translucent layers, draw onto an offscreen canvas first, then composite once at layer opacity.
7. For each stroke:
   - stabilize raw points
   - optionally Catmull-Rom smooth them
   - render as either a variable-width filled outline or fixed-width path

The offscreen layer compositing avoids overlapping strokes double-darkening inside a semi-transparent layer.

## Input architecture

Tracer uses pointer events:

- `pen` and `mouse` pointers draw.
- `touch` pointers navigate the view.
- one active touch pans.
- two active touches pinch-zoom.
- mouse wheel zooms around the cursor.

This separation prevents accidental finger drawing on tablets while keeping pen input precise.

## Persistence

### JSON capture projects

`buildJSON()` serializes the lossless `tracer-capture` v1 project format:

- capture type/version, creation time, and source app metadata
- canvas size, units, and coordinate system
- artboard compatibility alias for older importers
- optional embedded reference image
- drawing settings
- layers
- raw points
- pressure summary metadata

`loadTraceJSON()` validates and normalizes loaded projects. It supports current `tracer-capture` files plus older `vhs-trace` versions and sanitizes colors, names, dimensions, pressure, timestamps, and embedded image data. The complete public contract lives in `docs/capture-format.md`.

### SVG export

`buildSVG()` exports only visible artwork layers. The reference image is intentionally not embedded.

- Variable-width strokes become filled outline `<path>` elements.
- Fixed-width strokes become regular stroked `<path>` elements.
- Layers become `<g data-layer="…">` groups.

## PWA architecture

`manifest.webmanifest` defines install metadata and icons.

`sw.js` precaches the app shell and the in-app linked guide:

- `/`
- `index.html`
- manifest
- `docs/user-guide.md`
- first-session and feedback docs
- sample reference/project files
- service worker icons

Fetch handling is cache-first for cached app-shell files, network-first for other same-origin GET requests, and falls back to the cached app shell for navigation requests when offline.

## Testing strategy

`tests/tracer-core.test.cjs` avoids external dependencies. It:

- reads the inline script from `index.html`
- runs it inside a Node `vm` sandbox with mocked DOM/canvas primitives
- verifies PWA wiring
- verifies mobile CSS expectations
- verifies that user-facing docs, roadmap, and app guide links are present and internally linked
- verifies JSON save/load behavior
- verifies stabilizer migration behavior
- checks sanitization against SVG/JSON injection cases
- checks pointer-move handling

This gives regression coverage without introducing a browser automation stack.

## Current trade-offs

### Single-file app

The main app is intentionally inside `index.html`. This keeps the public artifact easy to download and archive, but the file is now large enough that future feature work may benefit from source modularization.

A future structure could keep the single-file distribution while splitting source modules:

```text
src/state.js
src/render.js
src/input.js
src/layers.js
src/persistence.js
src/svg.js
src/pwa.js
```

A small build script could then emit the self-contained `index.html`.

### Canvas accessibility

Tracer is a visual drawing tool, so the canvas itself is not meaningfully screen-reader accessible. Toolbar controls should still remain keyboard-accessible and labeled with explicit `aria-label` text.

### Offline behavior

The service worker is intentionally conservative and small. It caches the app shell, not arbitrary user project files. User JSON/SVG files remain normal local files controlled by the browser or File System Access API.
