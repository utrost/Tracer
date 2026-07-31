# Tracer User Handbook

Tracer is a pen-first tracing surface for tablets and desktop browsers. It lets you load a reference image, fade it back, trace on pressure-sensitive layers, and export either a lossless JSON project or a plotter-friendly SVG.

## 1. Quick start

1. Open Tracer in a modern browser.
2. Click **Image** and choose a reference image, or drag an image onto the canvas.
3. Use the **Image** opacity slider to fade the reference.
4. Draw with a stylus or mouse.
5. Save your work with **JSON** if you want to reopen it later.
6. Export with **SVG** when you want vector output for another toolchain.

Tracer works without an account, server, or cloud storage. All files stay local unless you explicitly move them somewhere else.

## 2. Recommended devices and browsers

- **Best:** Chrome or Edge on a pen-enabled tablet or laptop.
- **Good:** Chrome on Android with stylus support.
- **Good:** Safari on iPad with Apple Pencil, except direct folder saving is not available.
- **Fallback:** Firefox works for drawing and export, but not folder connect.

Pressure support depends on the browser, operating system, and stylus hardware. If pressure is not available, Tracer falls back to a steady default pressure.

## 3. Installing as a PWA

When Tracer is served from HTTPS, browsers can install it as a standalone app.

### Chrome / Edge desktop

1. Open the Tracer page.
2. Look for the install icon in the address bar.
3. Choose **Install**.
4. Launch Tracer from the app launcher or desktop shortcut.

### Android Chrome

1. Open the Tracer page.
2. Open the browser menu.
3. Choose **Add to Home screen** or **Install app**.

### iPad Safari

1. Open the Tracer page.
2. Tap **Share**.
3. Tap **Add to Home Screen**.

PWA install is only available when Tracer is served via `https://` or from `localhost`. Opening `index.html` directly from disk is useful for testing, but service-worker offline installation is browser-dependent in that mode.

## 4. Canvas navigation

- **Pen / mouse:** draw.
- **One finger:** pan the canvas.
- **Two fingers:** pinch-zoom.
- **Mouse wheel:** zoom around the pointer.
- **Fit:** fit the artboard back into the viewport.

The artboard size follows the loaded reference image. If no image is loaded, Tracer starts with a default portrait artboard.

## 5. Drawing settings

### Width

Controls the base stroke width in artboard units.

### Stabilizer

Smooths hand jitter with an exponential moving average. A low value keeps strokes close to the raw input. A high value produces steadier, slower-feeling lines.

The stabilizer is non-destructive: Tracer stores the raw points and applies smoothing during render/export.

### Smooth

Enables Catmull-Rom curve interpolation for more flowing strokes. This is also non-destructive.

### Pressure

When enabled, pen pressure changes stroke thickness. SVG export bakes this into filled outline paths. When disabled, strokes export as regular fixed-width SVG paths.

## 6. Layers

Layers are drawn bottom-to-top. The topmost layer appears at the top of the Layers panel.

You can:

- Add a layer with **+**.
- Select a layer by clicking it.
- Toggle visibility with the eye button.
- Change the layer color with the swatch.
- Rename a layer by double-clicking its name.
- Reorder layers by dragging the grip handle.
- Change active layer opacity with the opacity slider.
- Delete a layer with **×**.

Changing a layer color recolors its existing strokes. Use separate layers when you need separate colors.

## 7. Saving and reopening projects

Click **JSON** to save a lossless project file.

The JSON stores:

- artboard width and height
- reference image metadata
- optionally the embedded reference image
- drawing settings
- layer names, colors, visibility, and opacity
- every raw stroke point: `x`, `y`, pressure `p`, and timestamp `t`

Keep **Embed** enabled if you want a self-contained project file that reopens with the reference image. Disable **Embed** if you want smaller JSON files and do not need the reference image included.

Click **Open** to reopen a saved `.json` project.

## 8. Exporting SVG

Click **SVG** to export the visible artwork.

SVG export includes:

- one `<g data-layer="…">` group per visible layer
- layer opacity where applicable
- fixed-width paths when pressure rendering is off
- filled outline paths when pressure rendering is on

The reference image is not exported into the SVG. The SVG is intended to contain the traced artwork, not the source image.

## 9. Folder connect

On browsers with the File System Access API, usually Chrome/Edge, **Folder** lets you choose a local folder. After connecting, **JSON** and **SVG** saves write directly into that folder instead of triggering browser downloads.

If the browser does not support the API, the Folder button is hidden and Tracer uses normal downloads.

## 10. Troubleshooting

### I cannot install Tracer as an app

Make sure you are opening Tracer from an HTTPS URL or `localhost`. PWA installation is usually not offered for plain `file://` pages.

### Pen pressure does not change line width

Check that **Pressure width** is enabled. If it is enabled and the line is still uniform, the browser/device may not expose pressure data. Tracer will still work, but strokes use fallback pressure.

### The Folder button is missing

Your browser likely does not support the File System Access API. Use Chrome or Edge, or save through regular downloads.

### A large JSON project feels slow

Embedded reference images and very dense strokes can create large files. Save without **Embed** for smaller files, and consider splitting complex drawings into separate projects.

### The canvas moves instead of drawing

Use a pen or mouse to draw. Touch input is reserved for pan and pinch-zoom so that tablet navigation remains predictable.

See also: [User guide](user-guide.md), [Architecture](architecture.md), [Roadmap](../ROADMAP.md).
