# Tracer SVG Handoff

Tracer SVG export is meant for inspection and downstream vector/plotter tools. It is not a raster vectorizer: the reference image is never exported into the SVG.

## Structure

- The root `<svg>` uses the current artboard width, height, and matching `viewBox`.
- Each visible layer becomes one `<g data-layer="Layer name">` group.
- Hidden layers are omitted.
- Layer opacity is preserved on the group when opacity is below 100%.
- Layer names are escaped before being written to `data-layer`.

## Export modes

### Pressure width / pressure outline mode

When **Pressure width** is enabled, Tracer converts each stroke centerline into a filled pressure outline path. More pressure makes thicker lines; lighter pressure makes thinner lines. This bakes pressure into geometry and can preserve expressive tapering. Single-point marks are exported as filled circles whose radius also follows pressure.

Use pressure outline mode when:

- the downstream tool accepts filled paths cleanly
- expressive stroke width matters
- the output is meant to be viewed or printed as filled vector artwork

Caveat: pressure outlines can be heavier than simple paths and may need simplification before plotting.

### Fixed-width mode

When **Pressure width** is disabled, Tracer exports each stroke as a fixed-width SVG path with `stroke-width`. Single-point marks use a fixed circle radius derived from the Width slider; pressure is not baked into their SVG geometry.

Use fixed-width mode when:

- the downstream tool expects centerline paths
- the plotter pen already defines physical line width
- pressure outlines create too many points or filled shapes

## Handoff checklist

1. Hide construction/reference-helper layers before export.
2. Decide between pressure outline and fixed-width mode.
3. Export SVG.
4. Open the SVG in the next vector tool before plotting.
5. Confirm scale, layer groups, and path count look reasonable.
6. If the plotter tool behaves badly, retry fixed-width mode before adding a new feature request.

## Current limitations

- No automatic raster vectorization.
- No path simplification control yet.
- No scale metadata beyond SVG dimensions and viewBox.
- No per-layer file export yet.

These should only become features when backed by real workflow evidence.
