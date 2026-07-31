# Tracer First-Session Workflow

This is the smallest complete Tracer run: reference image → ink layer → Save JSON → Export SVG.

Use the bundled sample reference if you do not have an image ready: [samples/reference-grid.svg](samples/reference-grid.svg). You can also open the example project later: [samples/example-project.json](samples/example-project.json).

## Steps

1. Open Tracer.
2. Click **Image** and load `docs/samples/reference-grid.svg`.
3. Set **Image** opacity to about 35–45%.
4. Leave the first layer named `Layer 1`, or rename it `Ink`.
5. Draw three or four deliberate strokes over the grey guide shapes.
6. Click **JSON**. This is the Save JSON step; keep the file so the drawing can be reopened.
7. Click **Open** and reopen the JSON you just saved.
8. Confirm the strokes, layer, width, pressure setting, and stabilizer still look right.
9. Click **SVG**. This is the Export SVG step.
10. Open the SVG in a browser or vector tool and confirm only the drawn strokes are exported, not the reference image.

## Expected result

- JSON reopens with the same visible strokes.
- SVG contains the traced drawing only.
- If pressure makes the SVG too heavy for your downstream tool, disable **Pressure** and export again as fixed-width paths.

## Done criteria

A first session counts as complete when the user has produced both a JSON project and an SVG export from the same traced reference.
