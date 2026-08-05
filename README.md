# Tracer

A pen-first tracing surface for stylus-enabled devices. Load a reference image, lower its opacity, trace over it with pressure-sensitive ink, then save JSON or export SVG.

Tracer is deliberately small: one static web app, no server, no account, no cloud storage, no build step.

![Tracer screenshot](docs/screenshot.png)

Real mobile tracing session:

![Android portrait tracing in Tracer](docs/test-results/2026-08-05-portrait-trace-android.jpg)

Notes: [Android portrait tracing screenshot — 2026-08-05](docs/test-results/2026-08-05-portrait-trace-android.md).

## Live app

- GitHub Pages: <https://utrost.github.io/Tracer/>
- simiono: <https://simiono.com/tracer/>

## Documentation

- [User guide](docs/user-guide.md) — practical first session, controls, saving, SVG export, tablet workflow, and troubleshooting.
- [First-session workflow](docs/first-session.md) — guided sample run using bundled sample assets.
- [Feedback template](docs/feedback-template.md) — compact real-device feedback capture.
- [SVG handoff](docs/svg-handoff.md) — expected export structure and plotter/vector workflow notes.
- [Capture format](docs/capture-format.md) — lossless JSON data contract for raw pressure strokes and Gantry import.
- [User handbook](docs/user-handbook.md) — fuller reference for browser/device behavior and file formats.
- [Architecture](docs/architecture.md) — state model, rendering pipeline, persistence, PWA behavior, and trade-offs.
- [Roadmap](ROADMAP.md) — current state through the target of 50 real users.

## Features

- **Pressure-sensitive ink** — pointer pressure is captured per point and rendered as variable-width strokes.
- **Pen stabilizer** — exponential moving average smoothing reduces hand jitter without changing raw saved points.
- **Optional curve smoothing** — Catmull-Rom interpolation can make traced lines more flowing.
- **Layers** — colour, visibility, opacity, rename, reorder, and delete controls.
- **Undo / redo** — stroke-level undo and redo across layers.
- **Portable JSON projects** — lossless save format with artboard, layers, raw points, settings, and optional embedded reference image.
- **SVG export** — visible layers export as SVG groups for the plotter/vector toolchain.
- **Folder connect** — Chromium browsers can save directly into a chosen local folder.
- **Offline/PWA support** — manifest, service worker, install icons, and app shell caching.
- **In-app guide** — a compact guide panel is available from the toolbar, with links to the full user guide and first-session workflow.
- **Diagnostics panel** — reports pointer support, pressure sampling, folder-save availability, service-worker status, and current SVG export mode.
- **Bundled first-run sample** — a simple reference grid and example project make the first tracing session testable without extra assets.

## Getting started

### Option A — live app

Open one of the live URLs above. This is the best path for testing PWA installation and offline behavior.

### Option B — open locally

Download or clone the repo, then open `index.html` directly:

```sh
# clone the repo, then:
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

### Option C — local server

A local server is useful for service-worker and PWA testing:

```sh
npm run serve
# then open http://localhost:8000/
```

## Basic workflow

1. Click **Image** and choose a reference image.
2. Reduce **Image** opacity until your own strokes are easy to see.
3. Draw with a stylus or mouse.
4. Use layers to separate passes or colours.
5. Save **JSON** if you want to reopen the project.
6. Export **SVG** for vector or plotter handoff.

JSON is the working capture format. SVG is the output format. The reference image is not included in SVG exports.

## Controls

### Input

| Device | Action |
|---|---|
| Pen / mouse | Draw |
| One finger | Pan |
| Two fingers | Pinch-zoom |
| Mouse wheel | Zoom |

### Keyboard

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Escape` | Close the guide panel |

### Toolbar

| Control | Description |
|---|---|
| **Guide** | Opens the compact in-app guide and links to the full guide. |
| **Image** | Load a reference image. |
| **Open** | Open a saved `.json` Tracer project. |
| **Image opacity** | Fade the reference image. |
| **Colour** | Set the active layer colour. |
| **Width** | Base stroke width before pressure scaling. |
| **Stabilizer** | Smooth hand jitter. |
| **Smooth** | Toggle curve interpolation. |
| **Pressure width** | Toggle whether more pressure makes thicker lines. |
| **Undo / Redo** | Step through stroke history. |
| **Fit** | Fit the artboard into the viewport. |
| **Clear** | Clear the active layer. |
| **Embed** | Embed the reference image inside JSON saves. |
| **Folder** | Connect a local save folder in Chromium browsers. |
| **JSON** | Save a lossless project. |
| **SVG** | Export visible layers. |

## File formats

### JSON

JSON is lossless and re-openable. Tracer saves the current full-data contract as `.tracer.json` with `type: "tracer-capture"`, canvas metadata, source metadata, pressure summary, layer metadata, and every raw stroke point as `{x, y, p, t}`. It can still open older `.json` projects.

### SVG

SVG contains visible drawing layers only. With **Pressure width** enabled, more pressure makes thicker filled outline polygons. With **Pressure width** disabled, strokes export as fixed-width paths.

## Browser compatibility

| Browser | Draw | Pressure | Folder connect | PWA install |
|---|---:|---:|---:|---:|
| Chrome / Edge desktop | ✅ | ✅ | ✅ | ✅ |
| Chrome Android | ✅ | ✅ | ✅ | ✅ |
| Safari iPad | ✅ | ✅ | ❌ | ✅ via Add to Home Screen |
| Firefox | ✅ | ✅ | ❌ | limited |

Pressure support depends on browser, operating system, and stylus hardware. If pressure is flat, Tracer still works as a fixed-width tracing tool.

## Development

Run the dependency-free regression suite:

```sh
npm test
```

Serve locally:

```sh
npm run serve
```

The test suite checks:

- PWA manifest/service-worker/deploy artifact contract
- documentation links and roadmap/user-guide presence
- JSON save/reopen stability
- JSON sanitization and SVG escaping
- pointer handling regression coverage

## Deploy notes

GitHub Pages deploys automatically from `main` through `.github/workflows/deploy-pages.yml`.

The deploy artifact must include:

- `index.html`
- `manifest.webmanifest`
- `sw.js`
- `icons/`
- `docs/`

`simiono.com/tracer/` is a separate FTPS deploy target and must be updated after GitHub merge when the public app should match the repo.

## Project direction

Tracer is not a raster vectorizer, drawing suite, brush engine, or cloud product. It is a local-first manual tracing tool for pen/stylus work and plotter-friendly SVG handoff.

The next work is documented in [Roadmap](ROADMAP.md): make the first session reliable, gather feedback from real devices, improve tablet workflow from observed issues, and support 50 real users without one-off explanation.
