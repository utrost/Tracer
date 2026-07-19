const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync(new URL('../index.html', `file://${__filename}`), 'utf8');

assert.match(html, /<link\s+rel="manifest"\s+href="\.\/manifest\.webmanifest"/,
  'index should expose a web app manifest for PWA installation');
assert.match(html, /<meta\s+name="theme-color"\s+content="#1e232b"/,
  'index should set a theme color for browser/PWA chrome');
assert.match(html, /navigator\.serviceWorker\.register\('\.\/sw\.js'\)/,
  'index should register a service worker for offline PWA support');
assert.match(html, /@media\s*\(max-width:\s*720px\)[\s\S]*#bar[\s\S]*position:\s*fixed[\s\S]*overflow-x:\s*auto/,
  'toolbar should become a horizontally scrollable fixed mobile control strip');
assert.match(html, /@media\s*\(max-width:\s*720px\)[\s\S]*#layers[\s\S]*width:\s*min\(360px,\s*calc\(100vw - 24px\)\)/,
  'layers panel should shrink to the mobile viewport width');

const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.webmanifest', `file://${__filename}`), 'utf8'));
assert.equal(manifest.name, 'Tracer');
assert.equal(manifest.display, 'standalone');
assert.equal(manifest.start_url, './');
assert.ok(manifest.icons.some(icon => icon.src === './icons/icon-192.svg' && icon.sizes === '192x192'),
  'manifest should provide a 192px install icon');
assert.ok(manifest.icons.some(icon => icon.src === './icons/icon-512.svg' && icon.sizes === '512x512'),
  'manifest should provide a 512px install icon');

const sw = fs.readFileSync(new URL('../sw.js', `file://${__filename}`), 'utf8');
assert.match(sw, /const\s+PRECACHE_URLS\s*=\s*\[/, 'service worker should declare precache urls');
assert.match(sw, /'\.\/index\.html'/, 'service worker should precache the app shell');
assert.match(sw, /'\.\/manifest\.webmanifest'/, 'service worker should precache the manifest');
assert.match(sw, /caches\.open\(CACHE_NAME\)/, 'service worker should populate the Cache API');
assert.match(sw, /fetch\(event\.request\)/, 'service worker should fall back to network fetches');

const deployWorkflow = fs.readFileSync(new URL('../.github/workflows/deploy-pages.yml', `file://${__filename}`), 'utf8');
assert.match(deployWorkflow, /cp\s+manifest\.webmanifest\s+_site\//,
  'Pages deploy should publish the web app manifest');
assert.match(deployWorkflow, /cp\s+sw\.js\s+_site\//,
  'Pages deploy should publish the service worker');
assert.match(deployWorkflow, /cp\s+-R\s+icons\s+_site\//,
  'Pages deploy should publish install icons');

const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
assert.equal(scripts.length, 1, 'expected one inline application script');

const noop = () => {};
const canvasContext = {
  setTransform: noop, clearRect: noop, fillRect: noop, drawImage: noop,
  save: noop, restore: noop, beginPath: noop, arc: noop, fill: noop,
  moveTo: noop, lineTo: noop, stroke: noop, closePath: noop
};

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.style = {};
    this.classList = { add: noop, remove: noop, contains: () => false };
    this.children = [];
    this.listeners = {};
    this.value = '';
    this.checked = false;
    this.textContent = '';
  }
  addEventListener(type, listener) {
    (this.listeners[type] ||= []).push(listener);
  }
  removeEventListener() {}
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.children.push(child); return child; }
  click() {}
  getContext() { return canvasContext; }
  getBoundingClientRect() { return { left: 0, top: 0, width: 1280, height: 720 }; }
  setPointerCapture() {}
  set innerHTML(value) { this.children = []; }
  get innerHTML() { return ''; }
}

const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, new MockElement(id === 'board' ? 'canvas' : 'div'));
  return elements.get(id);
}

Object.assign(element('stab'), { value: '35' });
Object.assign(element('smooth'), { checked: true });
Object.assign(element('varw'), { checked: true });
Object.assign(element('embedImg'), { checked: true });
Object.assign(element('penColor'), { value: '#111111' });
Object.assign(element('layerOpacity'), { value: '100' });

const document = {
  getElementById: element,
  createElement: tag => new MockElement(tag),
  addEventListener: noop,
  removeEventListener: noop
};
const windowListeners = {};
const window = {
  devicePixelRatio: 1,
  addEventListener(type, listener) { (windowListeners[type] ||= []).push(listener); },
  removeEventListener: noop
};

const sandbox = {
  window, document, innerWidth: 1280, innerHeight: 720,
  console, Date, Math, Number, String, Array, JSON, RegExp,
  setTimeout, clearTimeout,
  confirm: () => true, prompt: () => null, alert: noop,
  Blob: class Blob {},
  FileReader: class FileReader {},
  Image: class Image {},
  URL: { createObjectURL: () => 'blob:test', revokeObjectURL: noop }
};
window.window = window;
window.document = document;
vm.createContext(sandbox);
vm.runInContext(scripts[0][1], sandbox, { filename: 'index.html' });

const tracer = window.__tracer;
assert.ok(tracer, 'test interface should be available');

const initial = JSON.parse(tracer.buildJSON());
assert.equal(initial.version, 3);
assert.equal(initial.settings.stabilizer, 0.35);

tracer.loadTraceJSON(initial);
const reopenedOnce = JSON.parse(tracer.buildJSON());
tracer.loadTraceJSON(reopenedOnce);
const reopenedTwice = JSON.parse(tracer.buildJSON());
assert.deepEqual(
  [initial.settings.stabilizer, reopenedOnce.settings.stabilizer, reopenedTwice.settings.stabilizer],
  [0.35, 0.35, 0.35],
  'v3 stabilizer values must not drift across reopen cycles'
);

tracer.loadTraceJSON({
  type: 'vhs-trace', version: 2,
  artboard: { width: 1000, height: 1400 }, image: null,
  settings: { stabilizer: 0.35, smooth: true, variable_width: true },
  layers: []
});
assert.equal(tracer.cfg.stab, 0.35, 'v2 internal stabilizer strength should be preserved');
assert.equal(JSON.parse(tracer.buildJSON()).settings.stabilizer, 0.4118);

tracer.loadTraceJSON({
  type: 'vhs-trace', version: 3,
  artboard: { width: '1" onload="bad', height: -5 },
  image: { name: '', data: 'javascript:bad' },
  settings: { stabilizer: 2, smooth: 'yes', variable_width: 0 },
  layers: [{
    name: '<bad" &', color: '" onload="bad', visible: true, opacity: 9,
    strokes: [{
      color: '" onload="bad', width: 'wide',
      points: [{ x: 10, y: 20, p: 9, t: -4 }, null, { x: 'bad', y: 4 }]
    }]
  }]
});

const sanitized = JSON.parse(tracer.buildJSON());
const layer = sanitized.layers[0];
const stroke = layer.strokes[0];
assert.deepEqual(sanitized.artboard, { width: 1000, height: 1 });
assert.equal(sanitized.image, null);
assert.equal(layer.color, '#111111');
assert.equal(layer.opacity, 1);
assert.equal(stroke.color, '#111111');
assert.equal(stroke.width, 4);
assert.deepEqual(stroke.points, [{ x: 10, y: 20, p: 1, t: 0 }]);

const svg = tracer.buildSVG();
assert.doesNotMatch(svg, /onload/i);
assert.match(svg, /fill="#111111"/);
assert.match(svg, /data-layer="&lt;bad&quot; &amp;"/);

tracer.loadTraceJSON({
  type: 'vhs-trace', version: 3, artboard: { width: 1000, height: 1400 },
  image: null, settings: { stabilizer: 0.35, smooth: true, variable_width: true },
  layers: [{ name: 'Ink', color: '#111111', visible: true, opacity: 1, strokes: [] }]
});
const board = element('board');
const pointer = (x, y) => ({
  pointerType: 'mouse', pointerId: 1, clientX: x, clientY: y, pressure: 0.5,
  getCoalescedEvents: () => []
});
board.listeners.pointerdown[0](pointer(100, 100));
board.listeners.pointermove[0](pointer(120, 120));
board.listeners.pointerup[0](pointer(120, 120));
assert.equal(tracer.strokes[0].points.length, 2,
  'the dispatched move must be recorded when no coalesced events are returned');

console.log('Tracer core regression tests passed');
