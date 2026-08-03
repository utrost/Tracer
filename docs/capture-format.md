# Tracer Capture Format

Tracer's lossless project export is a JSON capture file. It preserves the drawing gesture: layer order, stroke order, raw point positions, pressure, timestamps, settings, and optional reference-image metadata.

SVG remains a derived handoff format for visual/vector tools. Gantry and other plotter-performance tools should import the JSON capture because it keeps the pressure-bearing centerline data.

## File naming

Current Tracer saves capture files as:

```text
<reference-or-trace>.tracer.json
```

The MIME type is `application/json`. Older `.json` Tracer files can still be opened.

## Top-level object

```json
{
  "type": "tracer-capture",
  "version": 1,
  "created": "2026-08-03T12:34:56.000Z",
  "source": {
    "app": "Tracer",
    "appVersion": "0.1.0"
  },
  "canvas": {
    "width": 1000,
    "height": 1400,
    "units": "px",
    "coordinateSystem": "top-left-y-down"
  },
  "artboard": {
    "width": 1000,
    "height": 1400,
    "units": "px",
    "coordinateSystem": "top-left-y-down"
  },
  "coordinateSystem": "top-left-y-down",
  "image": null,
  "capture": {
    "input": "pointer-events",
    "pressure": {
      "samples": 0,
      "min": null,
      "max": null,
      "nonDefaultSamples": 0
    },
    "pointSchema": ["x", "y", "p", "t"]
  },
  "settings": {
    "stabilizer": 0.35,
    "smooth": true,
    "variable_width": true
  },
  "layers": []
}
```

## Coordinate system

`canvas` describes the capture coordinate space.

- `width`, `height`: artboard dimensions.
- `units`: currently always `px`.
- `coordinateSystem`: currently always `top-left-y-down`.

For `top-left-y-down`:

- origin is the top-left corner of the artboard;
- positive `x` moves right;
- positive `y` moves down.

Downstream tools such as Gantry should treat these as capture-space coordinates, then apply their own physical scaling, margins, rotation, origin, and plotter-bed mapping.

`artboard` is kept as a compatibility alias for earlier Tracer files and early downstream experiments. New code should read `canvas` first and fall back to `artboard`.

## Source metadata

`source` identifies the app that produced the file.

```json
{
  "app": "Tracer",
  "appVersion": "0.1.0"
}
```

This helps downstream tools preserve reproducibility and handle future migrations.

## Image metadata

`image` is either `null` or an object:

```json
{
  "name": "reference-grid.svg",
  "data": "data:image/svg+xml;base64,..."
}
```

- `name`: original reference filename when known.
- `data`: optional embedded data URL when the **Embed** checkbox was enabled.

The reference image is part of the project context. SVG exports do not include it.

## Settings

```json
{
  "stabilizer": 0.35,
  "smooth": true,
  "variable_width": true
}
```

- `stabilizer`: normalized UI value from `0` to `1`.
- `smooth`: whether Catmull-Rom smoothing is enabled for display/export.
- `variable_width`: whether pressure is baked into SVG outline geometry.

Raw points remain unchanged. Stabilizer and smoothing are render/export settings.

## Layers

`layers` are ordered bottom-to-top. Later array entries are drawn above earlier entries.

```json
{
  "name": "Ink",
  "color": "#111111",
  "visible": true,
  "opacity": 1,
  "strokes": []
}
```

- `name`: user-facing layer name.
- `color`: six-digit hex color.
- `visible`: hidden layers are preserved in JSON and omitted from SVG export.
- `opacity`: layer opacity from `0` to `1`.
- `strokes`: raw strokes in draw order within the layer.

## Strokes and points

Each stroke stores its own color, base width, and raw points.

```json
{
  "color": "#111111",
  "width": 5,
  "points": [
    { "x": 150, "y": 520, "p": 0.45, "t": 0 },
    { "x": 260, "y": 360, "p": 0.65, "t": 20 }
  ]
}
```

Point fields:

- `x`: artboard-space x coordinate.
- `y`: artboard-space y coordinate.
- `p`: normalized pointer pressure from `0` to `1`.
- `t`: timestamp in milliseconds from the browser event capture. Existing files may contain absolute `Date.now()` values; sample files may use relative values for readability.

Gantry should preserve stroke order. If it wants time-aware replay, it can normalize each stroke's first `t` to zero during import.

## Capture pressure summary

`capture.pressure` summarizes saved points:

```json
{
  "samples": 327,
  "min": 0.08,
  "max": 0.91,
  "nonDefaultSamples": 284
}
```

This is diagnostic metadata. The authoritative pressure values are the per-point `p` values.

## Backward compatibility

Tracer still opens older files with:

```json
{
  "type": "vhs-trace",
  "version": 2
}
```

and

```json
{
  "type": "vhs-trace",
  "version": 3
}
```

When those files are saved again, Tracer writes the current `tracer-capture` v1 format.

## Gantry import guidance

A Gantry importer should:

1. Require `type: "tracer-capture"` or accept legacy `type: "vhs-trace"` during migration.
2. Read `canvas` first and fall back to `artboard`.
3. Treat `x`, `y`, `p`, and `t` as raw capture data.
4. Apply physical size, page margin, rotation, plotter origin, and axis direction in Gantry config.
5. Map pressure `p` to Z, feed rate, or other machine behavior through a per-tool/per-plotter calibration curve.
6. Keep SVG export as preview/reference geometry only.

This split keeps Tracer focused on capture and lets Gantry own machine performance.