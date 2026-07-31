const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync(new URL('../index.html', `file://${__filename}`), 'utf8');
const readText = relativePath => fs.readFileSync(new URL(`../${relativePath}`, `file://${__filename}`), 'utf8');
const assertMarkdownLinkTargetsExist = (relativePath, text) => {
  const base = new URL(`../${relativePath}`, `file://${__filename}`);
  const problems = [];
  for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('#') || target.startsWith('mailto:')) continue;
    const cleanTarget = target.split('#', 1)[0];
    if (!cleanTarget) continue;
    const targetPath = new URL(cleanTarget, base);
    if (!fs.existsSync(targetPath)) problems.push(`${relativePath}: broken link ${target}`);
  }
  assert.deepEqual(problems, []);
};

const readme = readText('README.md');
const userGuide = readText('docs/user-guide.md');
const handbook = readText('docs/user-handbook.md');
const roadmap = readText('ROADMAP.md');

assert.match(readme, /\[User guide\]\(docs\/user-guide\.md\)/, 'README should link the practical user guide');
assert.match(readme, /\[Roadmap\]\(ROADMAP\.md\)/, 'README should link the roadmap');
assert.match(html, /<button id="help"[^>]*>[^<]*Guide/, 'app should expose an in-app user guide button');
assert.match(html, /id="guidePanel"/, 'app should contain an in-app user guide panel');
assert.match(html, /docs\/user-guide\.md/, 'app guide should link to the full markdown user guide');
assert.match(userGuide, /First tracing session/, 'user guide should cover a first tracing session');
assert.match(userGuide, /Exporting SVG for plotting/, 'user guide should cover plotter-oriented SVG export');
assert.match(userGuide, /Troubleshooting/, 'user guide should include troubleshooting');
assert.match(handbook, /See also: \[User guide\]\(user-guide\.md\)/, 'handbook should cross-link the user guide');
assert.match(roadmap, /Goal: 50 real users/i, 'roadmap should explicitly target 50 real users');
assert.match(roadmap, /Current state/i, 'roadmap should document current state');
assert.match(roadmap, /Milestone 1/i, 'roadmap should define staged milestones');
assert.match(roadmap, /50 users/i, 'roadmap should include the 50-user target');
for (const [path, text] of [['README.md', readme], ['docs/user-guide.md', userGuide], ['docs/user-handbook.md', handbook], ['ROADMAP.md', roadmap]]) {
  assertMarkdownLinkTargetsExist(path, text);
}

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
assert.ok(manifest.icons.some(icon => icon.src === './icons/icon-192.png' && icon.type === 'image/png'),
  'manifest should provide a 192px PNG install icon for broad platform support');
assert.ok(manifest.icons.some(icon => icon.src === './icons/icon-512.svg' && icon.sizes === '512x512'),
  'manifest should provide a 512px install icon');
assert.ok(manifest.icons.some(icon => icon.src === './icons/icon-512.png' && icon.type === 'image/png'),
  'manifest should provide a 512px PNG install icon for broad platform support');

const sw = fs.readFileSync(new URL('../sw.js', `file://${__filename}`), 'utf8');
assert.match(sw, /const\s+PRECACHE_URLS\s*=\s*\[/, 'service worker should declare precache urls');
assert.match(sw, /'\.\/index\.html'/, 'service worker should precache the app shell');
assert.match(sw, /'\.\/manifest\.webmanifest'/, 'service worker should precache the manifest');
assert.match(sw, /'\.\/icons\/icon-192\.png'/, 'service worker should precache the 192px PNG icon');
assert.match(sw, /'\.\/icons\/icon-512\.png'/, 'service worker should precache the 512px PNG icon');
assert.match(sw, /'\.\/docs\/user-guide\.md'/, 'service worker should precache the in-app linked user guide');
assert.match(sw, /caches\.open\(CACHE_NAME\)/, 'service worker should populate the Cache API');
assert.match(sw, /fetch\(event\.request\)/, 'service worker should fall back to network fetches');
assert.match(sw, /event\.request\.mode\s*===\s*'navigate'/,
  'service worker should only serve the app shell fallback for navigation requests');

const deployWorkflow = fs.readFileSync(new URL('../.github/workflows/deploy-pages.yml', `file://${__filename}`), 'utf8');
assert.match(deployWorkflow, /cp\s+manifest\.webmanifest\s+_site\//,
  'Pages deploy should publish the web app manifest');
assert.match(deployWorkflow, /cp\s+sw\.js\s+_site\//,
  'Pages deploy should publish the service worker');
assert.match(deployWorkflow, /cp\s+-R\s+icons\s+_site\//,
  'Pages deploy should publish install icons');
assert.match(deployWorkflow, /cp\s+-R\s+docs\s+_site\//,
  'Pages deploy should publish user-facing documentation linked from the app');
assert.match(deployWorkflow, /cp\s+ROADMAP\.md\s+_site\//,
  'Pages deploy should publish the roadmap linked from the user guide');

const packageJson = JSON.parse(fs.readFileSync(new URL('../package.json', `file://${__filename}`), 'utf8'));
assert.equal(packageJson.scripts.test, 'node tests/tracer-core.test.cjs');
assert.equal(packageJson.scripts.serve, 'python3 -m http.server 8000');

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
  setAttribute(name, value) { this[name] = String(value); }
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
