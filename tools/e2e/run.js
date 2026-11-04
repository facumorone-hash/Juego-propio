#!/usr/bin/env node
// Suite E2E de VOIDLING: juega todos los flujos en Edge/Chromium sin ventana y falla si algo se rompe
// o si aparece CUALQUIER error de consola / excepción / petición fallida.
//
// Uso:
//   node tools/e2e/run.js                 todas las pruebas
//   node tools/e2e/run.js victoria demo   solo las pruebas cuyo nombre contenga esos textos
//   node tools/e2e/run.js --list          lista las pruebas
//   Opciones: --headed (con ventana)  --shots (capturas en tools/e2e/out/)  --port=8811
//             --strict-lang (un js/lang/*.js con error de sintaxis hace fallar; por defecto se avisa y se omite)
//             --browser=msedge|chrome|chromium (por defecto msedge, el Edge del sistema)
//
// Requiere playwright-core (se usa el de tools/store-art/node_modules si existe).
'use strict';
const path = require('path');
const fs = require('fs');
const http = require('http');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');
const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : args.includes('--' + k) ? true : d; };
const PORT = +opt('port', process.env.E2E_PORT || 8811);
const HEADED = !!opt('headed', false);
const SHOTS = !!opt('shots', false);
const STRICT_LANG = !!opt('strict-lang', false);
const CHANNEL = opt('browser', 'msedge');
const filters = args.filter((a) => !a.startsWith('--'));
if (PORT === 8765) { console.error('El puerto 8765 está reservado (coordinador). Usa --port=8810..8819'); process.exit(2); }

function loadPlaywright() {
  const cands = [path.join(ROOT, 'tools', 'store-art', 'node_modules', 'playwright-core'), 'playwright-core', 'playwright'];
  for (const c of cands) { try { return require(c); } catch (e) { /* siguiente */ } }
  console.error('No se encontró playwright-core. Instálalo en tools/store-art (npm i) o globalmente.');
  process.exit(2);
}
const { chromium } = loadPlaywright();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- servidor estático
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' };
function startServer() {
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/') p = '/index.html';
    if (p === '/favicon.ico') { res.writeHead(204); return res.end(); }
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    fs.readFile(f, (err, data) => {
      if (err) { res.writeHead(404); return res.end('404'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(data);
    });
  });
  return new Promise((ok, ko) => { srv.on('error', ko); srv.listen(PORT, '127.0.0.1', () => ok(srv)); });
}
const URL0 = `http://127.0.0.1:${PORT}/index.html`;

// Paquetes de idioma con error de sintaxis (los están escribiendo otros agentes): se sustituyen por un
// archivo vacío para que no bloqueen el resto de pruebas, salvo con --strict-lang.
const brokenLang = [];
for (const f of fs.readdirSync(path.join(ROOT, 'js', 'lang')).filter((x) => x.endsWith('.js'))) {
  try { execFileSync(process.execPath, ['--check', path.join(ROOT, 'js', 'lang', f)], { stdio: 'pipe' }); }
  catch (e) { brokenLang.push(f); }
}

// ---------------------------------------------------------------- utilidades de página
let browser;
async function openPage(o) {
  o = o || {};
  const ctx = await browser.newContext({
    viewport: o.viewport || { width: 1280, height: 800 },
    hasTouch: !!o.touch, isMobile: !!o.mobile, deviceScaleFactor: o.dpr || 1,
    locale: o.locale || 'es-ES',
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text() + ' @' + ((m.location() || {}).url || '')); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + (e.stack || e.message)));
  page.on('response', (r) => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
  page.on('requestfailed', (r) => errors.push('requestfailed ' + r.url() + ' ' + ((r.failure() || {}).errorText || '')));
  if (!STRICT_LANG) for (const f of brokenLang) await page.route('**/js/lang/' + f, (rt) => rt.fulfill({ status: 200, contentType: 'text/javascript', body: '/* omitido por la suite: error de sintaxis */' }));
  if (o.config) await page.route('**/js/config.js', async (rt) => {
    let body = fs.readFileSync(path.join(ROOT, 'js', 'config.js'), 'utf8');
    body = body.replace(/\}\)\(\);\s*$/, 'Object.assign(V.CONFIG, ' + JSON.stringify(o.config) + ');\n})();');
    rt.fulfill({ status: 200, contentType: 'text/javascript', body });
  });
  if (o.init) for (const s of [].concat(o.init)) await page.addInitScript(s);
  // Guardado inicial (o ninguno) antes de que cargue el juego
  await page.addInitScript(({ save, raw }) => {
    if (sessionStorage.getItem('__e2e_seeded')) return;
    sessionStorage.setItem('__e2e_seeded', '1');
    try {
      localStorage.clear();
      if (raw != null) localStorage.setItem('voidling_save_v1', raw);
      else if (save) localStorage.setItem('voidling_save_v1', JSON.stringify(save));
    } catch (e) { /* sin almacenamiento */ }
  }, { save: o.save || null, raw: o.raw == null ? null : o.raw });
  await page.goto(URL0 + '?t=' + Date.now());
  await page.waitForFunction(() => window.V && V.game && V.game.state === 'menu', null, { timeout: 15000 });
  await sleep(300);
  const P = {
    page, ctx, errors,
    ev: (fn, a) => page.evaluate(fn, a),
    state: () => page.evaluate(() => V.game.state),
    vis: (id) => page.evaluate((i) => { const e = document.getElementById(i); return !!e && !e.classList.contains('hidden') && e.offsetParent !== null; }, id),
    wait: async (fn, a, ms, what) => {
      global.__step = what || 'espera';
      try { await page.waitForFunction(fn, a, { timeout: ms || 10000, polling: 50 }); }
      catch (e) { throw new Error('tiempo agotado esperando: ' + (what || fn.toString().slice(0, 140))); }
    },
    shot: async (n) => { if (SHOTS) { fs.mkdirSync(OUT, { recursive: true }); await page.screenshot({ path: path.join(OUT, n + '.png') }); } },
    // pasa todas las transmisiones activas (respetando el bloqueo de entrada de ~0,6 s de cada tarjeta)
    skipTrans: async () => {
      const t0 = Date.now();
      let any = false;
      while (Date.now() - t0 < 40000 && (await page.evaluate(() => V.game.transActive()))) { any = true; await page.keyboard.press('Space'); await sleep(120); }
      if (any) await sleep(550); // tiempo muerto tras cerrar la última
    },
    click: async (id) => { await page.click('#' + id); await sleep(80); },
    close: () => ctx.close(),
  };
  openPages.push(P);
  return P;
}
const openPages = [];
function assert(c, msg) { if (!c) throw new Error('falló: ' + msg); }
const eq = (a, b, msg) => assert(a === b, msg + ' (esperado ' + JSON.stringify(b) + ', obtenido ' + JSON.stringify(a) + ')');

// Guardados de prueba
const NODES_ALL = '__all__';
function advancedSave(extra) {
  return Object.assign({ v: 1, matter: 1e7, levels: NODES_ALL, record: 5, recordRun: { 1: 2, 2: 6, 3: 20, 4: 40, 5: 55 }, runs: 61, totalEaten: 5000, playTime: 3600, seenLogs: '__allStory__', victory: false }, extra || {});
}
// Algunos guardados necesitan datos del juego (todos los nodos, todas las historias): se completan en página.
async function expandSave(P) {
  await P.ev(() => {
    const s = V.game.save;
    if (s.levels === '__all__' || s.levels.__all__) { s.levels = { core: 1 }; for (const n of V.NODES) if (n.id !== 'core') s.levels[n.id] = n.max; }
    if (s.seenLogs === '__allStory__' || (Array.isArray(s.seenLogs) && s.seenLogs[0] === '__allStory__')) s.seenLogs = V.STORY.filter((e) => !e.post).map((e) => e.id);
    V.Save.save();
  });
}
// El bot juega por nosotros (y opcionalmente es inmortal)
async function botOn(P, immortal) {
  await P.ev((imm) => {
    V.game.setTarget = (r) => { r.bot(); return { tx: r.tx, ty: r.ty }; };
    if (imm && !window.__imm) { window.__imm = true; V.bus.on('frame', () => { const r = V.game.run; if (r && window.__immOn) r.stab = r.stabMax; }); }
    window.__immOn = !!imm;
  }, !!immortal);
}
async function startRunFromTree(P) {
  await P.ev(() => { if (V.game.state !== 'tree') V.game.goTree(); });
  await P.skipTrans();
  await P.ev(() => V.game.requestRun());
  await P.wait(() => V.game.state === 'run', null, 5000, 'state run');
}
async function killRun(P) {
  await P.ev(() => { window.__immOn = false; const r = V.game.run; r.st.revive = 0; r.stab = 0; });
  await P.wait(() => V.game.state === 'results' || V.game.state === 'menu' || !document.getElementById('demoEnd').classList.contains('hidden'), null, 8000, 'fin de la partida');
}

// ---------------------------------------------------------------- pruebas
const TESTS = [];
const test = (name, fn) => TESTS.push({ name, fn });

test('arranque y menú', async () => {
  const P = await openPage();
  assert(await P.vis('menu'), 'menú visible');
  for (const id of ['btnPlay', 'btnSettings', 'btnStats', 'btnCredits', 'btnFull', 'btnAchievements']) assert(await P.vis(id), 'botón ' + id);
  eq(await P.ev(() => document.getElementById('btnPlay').textContent.trim().length > 0), true, 'texto en JUGAR');
  await P.shot('menu');
  return P;
});

test('primera partida: prólogo, partida, muerte, resultados, árbol', async () => {
  const P = await openPage();
  await P.click('btnPlay');
  await P.wait(() => V.game.transActive(), null, 3000, 'prólogo');
  eq(await P.ev(() => V.game.save.seenLogs.includes('p0')), false, 'p0 aún no cuenta como leída al aparecer');
  await P.skipTrans();
  eq(await P.ev(() => V.game.save.seenLogs.includes('p0')), true, 'p0 leída al completarse');
  await P.wait(() => V.game.state === 'run', null, 4000, 'partida tras el prólogo');
  for (let i = 0; i < 8; i++) { await P.page.mouse.move(640 + Math.cos(i) * 260, 400 + Math.sin(i) * 200); await sleep(220); }
  assert(await P.ev(() => V.game.run.t > 1), 'el tiempo de la partida avanza');
  await P.shot('run1');
  await killRun(P);
  eq(await P.state(), 'results', 'pantalla de resultados');
  eq(await P.ev(() => document.querySelectorAll('#resStats .k').length), 5, 'filas de resultados');
  eq(await P.ev(() => V.game.save.runs), 1, 'runs=1');
  // Espacio activa el botón con foco (MEJORAR) → árbol con la transmisión p1
  await P.page.keyboard.press('Space');
  await P.wait(() => V.game.state === 'tree', null, 4000, 'árbol');
  await P.wait(() => V.game.transActive(), null, 3000, 'transmisión p1');
  await P.skipTrans();
  eq(await P.ev(() => V.game.save.seenLogs.includes('p1')), true, 'p1 vista');
  assert(await P.vis('treebar'), 'barra del árbol');
  await P.shot('tree1');
  return P;
});

test('resultados: Enter y R reinician la partida', async () => {
  const P = await openPage({ save: { v: 1, matter: 0, levels: { core: 1 }, record: 0, recordRun: {}, runs: 5, totalEaten: 10, playTime: 60, seenLogs: ['p0', 'p1', 'p2'], victory: false } });
  await startRunFromTree(P);
  await killRun(P);
  await P.page.keyboard.press('Enter');
  await P.wait(() => V.game.state === 'run', null, 3000, 'Enter → partida');
  await killRun(P);
  await P.page.keyboard.press('KeyR');
  await P.wait(() => V.game.state === 'run', null, 3000, 'R → partida');
  return P;
});

test('árbol: comprar, archivo, estadísticas, logros, menú', async () => {
  const P = await openPage({ save: { v: 1, matter: 500, levels: { core: 1 }, record: 1, recordRun: { 1: 1 }, runs: 3, totalEaten: 50, playTime: 120, seenLogs: ['p0', 'p1', 'p2', 'c1a', 'c1c'], victory: false } });
  await P.click('btnPlay');
  await P.wait(() => V.game.state === 'tree', null, 3000, 'árbol');
  await P.skipTrans();
  const before = await P.ev(() => V.game.save.matter);
  // comprar con teclado: el primer nodo guía queda seleccionado
  await P.page.keyboard.press('Enter');
  await sleep(100);
  const after = await P.ev(() => V.game.save.matter);
  assert(after < before, 'la compra con Enter gasta materia (' + before + ' → ' + after + ')');
  // compra con clic sobre un nodo
  const pos = await P.ev(() => { const n = V.NODE.g1; const { W, H } = V.game.size; return V.Tree.screenPos(n, W, H); });
  await P.page.mouse.click(pos.x, pos.y);
  await sleep(100);
  assert(await P.ev(() => (V.game.save.levels.g1 || 0) >= 1), 'compra con clic (g1)');
  await P.click('treeArchive');
  assert(await P.vis('archive'), 'archivo abierto');
  assert(await P.ev(() => document.querySelectorAll('#archList .alog').length >= 3), 'entradas en el archivo');
  await P.page.keyboard.press('Escape');
  await P.wait(() => document.getElementById('archive').classList.contains('hidden'), null, 2000, 'cerrar archivo con Esc');
  await P.click('treeStats');
  assert(await P.vis('stats'), 'estadísticas');
  await P.click('btnStatsBack');
  await P.click('treeAch');
  assert(await P.vis('achScreen'), 'pantalla de logros');
  assert(await P.ev(() => document.querySelectorAll('#achScreen .achTile').length === V.ACHIEVEMENTS.length), 'una ficha por logro');
  await P.page.keyboard.press('Escape');
  await P.wait(() => document.getElementById('achScreen').classList.contains('hidden'), null, 2000, 'cerrar logros');
  eq(await P.state(), 'tree', 'sigue en el árbol');
  await P.click('treeMenu');
  eq(await P.state(), 'menu', 'vuelve al menú');
  // estadísticas y créditos desde el menú
  await P.click('btnStats'); assert(await P.vis('stats'), 'stats desde menú'); await P.click('btnStatsBack');
  await P.click('btnCredits'); assert(await P.vis('credits'), 'créditos');
  assert(await P.ev(() => document.querySelectorAll('#credList .ch').length >= 1 && document.querySelectorAll('#credList .ct').length === 1), 'título y encabezados en los créditos');
  await P.click('btnCredBack'); assert(await P.vis('menu'), 'menú tras créditos');
  return P;
});

test('pausa: continuar, ajustes, terminar run, salir al menú', async () => {
  const P = await openPage({ save: { v: 1, matter: 0, levels: { core: 1 }, record: 0, recordRun: {}, runs: 5, totalEaten: 10, playTime: 60, seenLogs: ['p0', 'p1', 'p2'], victory: false } });
  await startRunFromTree(P);
  await P.page.keyboard.press('Escape');
  await P.wait(() => V.game.paused, null, 2000, 'pausa con Esc');
  const t0 = await P.ev(() => V.game.run.t); await sleep(300);
  eq(await P.ev(() => V.game.run.t), t0, 'el tiempo no avanza en pausa');
  await P.click('btnPauseSettings');
  assert(await P.vis('settings'), 'ajustes desde pausa');
  eq(await P.vis('btnReset'), false, 'sin "borrar progreso" en pausa');
  await P.page.keyboard.press('Escape');
  assert(await P.vis('pause'), 'Esc vuelve a la pausa');
  await P.page.keyboard.press('Escape');
  await P.wait(() => !V.game.paused, null, 2000, 'continuar con Esc');
  // salir al menú conservando la materia
  await P.ev(() => { V.game.run.matter = 123; });
  await P.page.keyboard.press('Escape');
  await P.click('btnQuitMenu');
  assert(await P.vis('confirm'), 'diálogo de confirmación');
  await P.click('cfYes');
  await P.wait(() => V.game.state === 'menu', null, 3000, 'menú tras salir');
  eq(await P.ev(() => V.game.save.matter), 123, 'materia conservada al salir');
  eq(await P.ev(() => V.game.save.runs), 6, 'runs++ al salir');
  // terminar run
  await startRunFromTree(P);
  await P.page.keyboard.press('Escape');
  await P.click('btnAbandon');
  await P.wait(() => V.game.state === 'results', null, 5000, 'resultados tras terminar run');
  return P;
});

test('ajustes: cada opción funciona y persiste tras recargar', async () => {
  const P = await openPage();
  await P.click('btnSettings');
  const set = async (id, v) => P.ev(([i, val]) => {
    const el = document.getElementById(i);
    if (el.type === 'checkbox') el.checked = val; else el.value = val;
    el.dispatchEvent(new Event(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
    if (el.type === 'range') el.dispatchEvent(new Event('change', { bubbles: true }));
  }, [id, v]);
  await set('setMusic', 0.2); await set('setSfx', 0.3); await set('setShake', false); await set('setFlash', true);
  await set('setNumbers', false); await set('setColorblind', true); await set('setRumble', false);
  await set('setUiScale', 120); await set('setTransSize', 130); await set('setLang', 'en');
  const s1 = await P.ev(() => V.game.save.settings);
  eq(s1.music, 0.2, 'música'); eq(s1.sfx, 0.3, 'efectos'); eq(s1.shake, false, 'temblor'); eq(s1.reduceFlash, true, 'destellos');
  eq(s1.showNumbers, false, 'números'); eq(s1.colorblind, true, 'daltónico'); eq(s1.rumble, false, 'vibración');
  eq(s1.uiScale, 120, 'escala'); eq(s1.transSize, 130, 'texto transmisiones'); eq(s1.lang, 'en', 'idioma');
  eq(await P.ev(() => document.getElementById('btnSetBack').textContent.trim()), 'BACK', 'interfaz en inglés al instante');
  eq(await P.ev(() => V.colorblind && V.pal().danger === V.PALETTE_CB.danger), true, 'paleta daltónica activa');
  await P.page.reload();
  await P.wait(() => window.V && V.game && V.game.state === 'menu', null, 10000, 'recarga');
  const s2 = await P.ev(() => ({ s: V.game.save.settings, lang: V.lang, ui: getComputedStyle(document.documentElement).getPropertyValue('--ui').trim(), cb: document.documentElement.classList.contains('cb'), play: document.getElementById('btnPlay').textContent.trim() }));
  eq(s2.lang, 'en', 'idioma persiste'); eq(s2.ui, '1.2', 'escala persiste'); eq(s2.cb, true, 'daltónico persiste');
  eq(s2.s.music, 0.2, 'música persiste'); eq(s2.s.showNumbers, false, 'números persiste'); eq(s2.play, 'PLAY', 'menú en inglés tras recargar');
  // los números flotantes desactivados no se dibujan
  await P.ev(() => { V.game.save.runs = 3; V.game.save.seenLogs = ['p0', 'p1', 'p2']; });
  await startRunFromTree(P);
  await sleep(600);
  eq(await P.ev(() => V.game.run.texts.length), 0, 'sin números flotantes con el ajuste apagado');
  return P;
});

test('borrar progreso conserva los ajustes', async () => {
  const P = await openPage({ save: advancedSave({ victory: true, victoryRun: 61, record: 6, settings: { music: 0.1, sfx: 0.7, shake: true, lang: 'en', uiScale: 100 } }) });
  await expandSave(P);
  assert(await P.ev(() => V.STORY.some((e) => e.post)), 'post-final cargadas con victoria');
  await P.click('btnSettings');
  await P.click('btnReset');
  assert(await P.vis('settings'), 'primer clic solo arma el botón');
  await P.click('btnReset');
  await P.wait(() => V.game.state === 'menu' && V.game.save.runs === 0, null, 3000, 'progreso borrado');
  const s = await P.ev(() => ({ m: V.game.save.matter, rec: V.game.save.record, lang: V.game.save.settings.lang, mus: V.game.save.settings.music, post: V.STORY.some((e) => e.post), ach: Object.keys(V.game.save.achievements || {}).length, stored: JSON.parse(localStorage.getItem('voidling_save_v1')).runs }));
  eq(s.m, 0, 'materia 0'); eq(s.rec, 0, 'récord 0'); eq(s.lang, 'en', 'idioma conservado'); eq(s.mus, 0.1, 'volumen conservado');
  eq(s.post, false, 'transmisiones post-final retiradas'); eq(s.stored, 0, 'guardado en disco');
  eq(await P.ev(() => document.getElementById('btnPlay').textContent.trim()), 'PLAY', 'botón JUGAR (no CONTINUAR)');
  return P;
});

test('guardado v0.1 (sin campos nuevos) migra sin errores', async () => {
  const old = { v: 1, matter: 77, levels: { core: 1, h1: 2, s1: 1 }, record: 1, recordRun: { 1: 2 }, runs: 4, totalEaten: 120, playTime: 300, seenLogs: ['p0', 'p1', 'p2', 'c1a'], victory: false, settings: { music: 0.4, sfx: 0.6, shake: false, lang: 'es' } };
  const P = await openPage({ save: old });
  const s = await P.ev(() => V.game.save);
  eq(s.matter, 77, 'materia conservada'); eq(s.levels.h1, 2, 'niveles conservados'); eq(s.settings.shake, false, 'ajuste antiguo conservado');
  eq(s.settings.colorblind, false, 'ajuste nuevo con valor por defecto'); assert(s.settings.uiScale >= 80, 'uiScale por defecto');
  assert(s.achievements && typeof s.achievements === 'object', 'campo de logros creado'); eq(s.totalBroken, 0, 'estadística nueva = 0');
  await P.click('btnPlay');
  await P.wait(() => V.game.state === 'tree', null, 3000, 'árbol');
  await P.skipTrans();
  await P.ev(() => V.game.requestRun());
  await P.wait(() => V.game.state === 'run', null, 3000, 'partida');
  await killRun(P);
  return P;
});

test('guardado corrupto (JSON roto) arranca con partida nueva', async () => {
  const P = await openPage({ raw: '{"v":1,"matter":12,"levels":{' });
  eq(await P.ev(() => V.game.save.runs), 0, 'partida nueva');
  await P.click('btnPlay');
  await P.wait(() => V.game.transActive(), null, 3000, 'prólogo');
  await P.skipTrans();
  await P.wait(() => V.game.state === 'run', null, 3000, 'partida');
  return P;
});

test('guardado de tipos inválidos (null, array, números como texto)', async () => {
  const P = await openPage({ raw: JSON.stringify({ v: 1, matter: 5, levels: null, seenLogs: 'x', settings: [], recordRun: null, record: 0, runs: 2 }) });
  await P.click('btnPlay');
  await P.wait(() => V.game.state === 'tree', null, 3000, 'árbol');
  await P.skipTrans();
  await P.ev(() => V.game.requestRun());
  await P.wait(() => V.game.state === 'run', null, 3000, 'partida');
  await killRun(P);
  return P;
});

test('sin localStorage (bloqueado) el juego funciona', async () => {
  const P = await openPage({ init: () => { Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('bloqueado', 'SecurityError'); } }); } });
  await P.click('btnPlay');
  await P.wait(() => V.game.transActive(), null, 3000, 'prólogo');
  await P.skipTrans();
  await P.wait(() => V.game.state === 'run', null, 3000, 'partida');
  await killRun(P);
  await P.ev(() => V.game.goMenu());
  await P.click('btnSettings');
  await P.ev(() => { const el = document.getElementById('setShake'); el.checked = false; el.dispatchEvent(new Event('change', { bubbles: true })); });
  eq(await P.ev(() => V.game.save.settings.shake), false, 'los ajustes funcionan en memoria');
  return P;
});

test('victoria: jefe → final → victoria → créditos → post-victoria n1–n3', async () => {
  // Escala 6 ya alcanzada 10 partidas antes (jefe perdido): n1–n3 NO deben salir todas juntas al ganar.
  const P = await openPage({ save: advancedSave({ record: 6, recordRun: { 1: 2, 2: 6, 3: 20, 4: 40, 5: 50, 6: 51 } }) });
  await expandSave(P);
  await botOn(P, true);
  await startRunFromTree(P);
  await P.ev(() => { const r = V.game.run; r.mass = 1590 * 1590; r.updateR(); });
  await P.wait(() => V.game.run && V.game.run.bossSpawned, null, 15000, 'aparece el Núcleo');
  await sleep(300);
  eq(await P.ev(() => document.querySelectorAll('#achToasts .achToast').length), 0, 'sin avisos de logro con el Núcleo en escena');
  eq(await P.ev(() => V.STORY.some((e) => e.post)), false, 'sin post-final antes de ganar');
  // acelerar: el Núcleo pasa por sus fases y cae
  await P.ev(() => { window.__immOn = false; const r = V.game.run, b = r.boss; b.age = 5; r.damageHeavy(b, b.maxHp * 0.36 / r.st.bossDmg); });
  await sleep(500);
  eq(await P.ev(() => V.game.run.boss.phase), 2, 'fase 2');
  await P.ev(() => { window.__immOn = true; const r = V.game.run, b = r.boss; r.damageHeavy(b, b.maxHp * 0.35 / r.st.bossDmg); });
  await sleep(1500);
  eq(await P.ev(() => V.game.run.boss.phase), 3, 'fase 3');
  await P.shot('boss3');
  await P.ev(() => { const r = V.game.run, b = r.boss; r.damageHeavy(b, b.maxHp * 2 / r.st.bossDmg * 4); });
  await P.wait(() => V.game.state === 'finale', null, 8000, 'final');
  eq(await P.ev(() => V.game.save.victory), true, 'victoria guardada');
  // El final es una cinemática en el canvas (js/finale.js): subtítulos de LUMEN → colapso → BIG BANG → epílogo
  await P.wait(() => V.Cine && V.Cine.active, null, 5000, 'cinemática del final');
  eq(await P.ev(() => V.game.transActive()), false, 'sin caja de transmisiones en el final (todo leído)');
  // durante el jefe y el final no se muestra ningún aviso de logro (se guardan para después)
  await P.ev(() => V.Achievements.unlock('ACH_RUNS_100'));
  await sleep(900);
  eq(await P.ev(() => document.querySelectorAll('#achToasts .achToast').length), 0, 'sin avisos de logro durante el final');
  // la primera línea de LUMEN sale como subtítulo (no en la caja de transmisiones) y aún no hubo Big Bang
  await P.wait(() => V.Cine.info().sub === V.pick(V.ENDING[0]), null, 8000, 'subtítulo V.ENDING[0]');
  eq(await P.ev(() => V.Cine.info().banged), false, 'el Big Bang espera al final del colapso');
  await P.shot('finale_collapse');
  // pulsar = avanzar (avance rápido hasta la línea siguiente) hasta el Big Bang; el título conserva sus espacios
  let sawBang = false, subs = new Set();
  for (let i = 0; i < 160 && !(await P.ev(() => V.Cine.info().banged && V.Cine.info().t > V.Cine.info().tBang + 3.2)); i++) {
    const inf = await P.ev(() => V.Cine.info());
    if (inf.sub) subs.add(inf.sub);
    if (/B I G {3}B A N G/.test(inf.sub)) sawBang = true;
    if (i % 3 === 0 && !inf.banged) await P.page.keyboard.press('Space');
    await sleep(150);
  }
  const lumen = await P.ev(() => [0, 1, 2, 3].map((i) => V.pick(V.ENDING[i])));
  assert(lumen.every((l) => subs.has(l)), 'las cuatro líneas de LUMEN se vieron como subtítulos');
  assert(sawBang, 'título B I G   B A N G (con sus espacios) tras el Big Bang');
  await P.shot('finale_bang');
  // mantener = saltar el epílogo → pantalla de victoria
  await P.page.keyboard.down('Space'); await sleep(1300); await P.page.keyboard.up('Space');
  await P.wait(() => !document.getElementById('victory').classList.contains('hidden'), null, 5000, 'pantalla de victoria');
  await P.shot('victory');
  await P.click('btnVictoryCredits');
  assert(await P.vis('credits'), 'créditos desde la victoria');
  await P.click('btnCredBack');
  assert(await P.vis('victory'), 'vuelve a la victoria');
  await P.click('btnVictory');
  await P.wait(() => V.game.state === 'tree', null, 3000, 'árbol tras la victoria');
  await sleep(400);
  eq(await P.ev(() => V.game.transActive()), false, 'n1 no aparece justo después del final');
  // los avisos retenidos salen ahora, agrupados en uno
  await P.wait(() => document.querySelectorAll('#achToasts .achToast').length === 1, null, 3000, 'aviso resumen tras volver al árbol');
  assert(await P.ev(() => /\d/.test(document.querySelector('#achToasts .achTName').textContent)), 'el aviso agrupa varios logros');
  const seenAfter = [];
  for (let k = 1; k <= 3; k++) {
    await botOn(P, false);
    await P.ev(() => V.game.requestRun());
    await P.wait(() => V.game.state === 'run', null, 3000, 'partida post-victoria');
    await killRun(P);
    await P.ev(() => V.game.goTree());
    await sleep(300);
    // con una transmisión activa, los avisos van arriba a la derecha y no tapan la tarjeta
    if (k === 1) {
      await P.wait(() => V.game.transActive(), null, 3000, 'n1 activa');
      await P.ev(() => V.Achievements.unlock('ACH_EXPRESS'));
      await sleep(900);
      const ov = await P.ev(() => {
        const ts = [...document.querySelectorAll('#achToasts .achToast')], c = document.querySelector('#trans .tcard');
        if (!ts.length || !c) return { ok: false, why: 'sin toast o tarjeta' };
        const b = c.getBoundingClientRect();
        const inter = ts.some((t) => { const a = t.getBoundingClientRect(); return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom); });
        return { ok: !inter, top: document.getElementById('achToasts').classList.contains('top') };
      });
      assert(ov.ok && ov.top, 'aviso arriba a la derecha sin tapar la transmisión ' + JSON.stringify(ov));
    }
    await P.skipTrans();
    seenAfter.push((await P.ev(() => V.game.save.seenLogs.filter((x) => /^n\d$/.test(x)))).join(','));
  }
  eq(seenAfter.join(' | '), 'n1 | n1,n2 | n1,n2,n3', 'una transmisión post-final por partida');
  return P;
});

test('transmisiones: ESPACIO en ráfaga no se salta la historia', async () => {
  const P = await openPage({ save: { v: 1, matter: 0, levels: { core: 1 }, record: 1, recordRun: { 1: 1 }, runs: 3, totalEaten: 10, playTime: 60, seenLogs: ['p0', 'p1'], victory: false } });
  await P.click('btnPlay');
  await P.wait(() => V.game.transActive(), null, 3000, 'transmisión pendiente');
  // 6 pulsaciones en 0,4 s (el bucle "una más"): no debe cerrarse ni arrancar la partida
  for (let i = 0; i < 6; i++) { await P.page.keyboard.press('Space'); await sleep(65); }
  eq(await P.ev(() => V.game.transActive()), true, 'la transmisión sigue abierta');
  eq(await P.state(), 'tree', 'no arrancó ninguna partida');
  const seenFirst = await P.ev(() => V.game.save.seenLogs.slice());
  await P.skipTrans();
  assert(!seenFirst.includes('c1a'), 'la segunda transmisión no se marcó durante la ráfaga ' + JSON.stringify(seenFirst));
  assert(await P.ev(() => ['p2', 'c1a'].every((id) => V.game.save.seenLogs.includes(id))), 'todas marcadas como leídas al completarse');
  return P;
});

test('táctil en el árbol: 1.er toque informa, 2.º toque compra', async () => {
  const P = await openPage({ touch: true, mobile: true, viewport: { width: 812, height: 375 }, save: { v: 1, matter: 500, levels: { core: 1 }, record: 1, recordRun: { 1: 1 }, runs: 3, totalEaten: 10, playTime: 60, seenLogs: ['p0', 'p1', 'p2', 'c1a', 'c1c'], victory: false } });
  const b = await P.page.locator('#btnPlay').boundingBox();
  await P.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
  await P.wait(() => V.game.state === 'tree', null, 3000, 'árbol');
  const pos = await P.ev(() => { const { W, H } = V.game.size; return V.Tree.screenPos(V.NODE.s1, W, H); });
  const m0 = await P.ev(() => V.game.save.matter);
  await P.page.touchscreen.tap(pos.x, pos.y); await sleep(200);
  eq(await P.ev(() => V.game.save.matter), m0, 'el primer toque no compra');
  assert(await P.vis('tooltip'), 'el primer toque muestra la información');
  await P.page.touchscreen.tap(pos.x, pos.y); await sleep(200);
  assert((await P.ev(() => V.game.save.matter)) < m0, 'el segundo toque compra');
  // tras comprar (aparecen hijos) ningún nodo queda bajo la barra superior ni fuera de pantalla
  await sleep(1200);
  const bad = await P.ev(() => {
    const { W, H } = V.game.size, top = document.getElementById('treebar').getBoundingClientRect().bottom;
    return V.NODES.filter((n) => V.isVisible(n, V.game.save.levels)).filter((n) => { const p = V.Tree.screenPos(n, W, H); return p.y - V.Tree.radius() < top - 2 || p.y > H - 4 || p.x < 0 || p.x > W; }).map((n) => n.id);
  });
  eq(bad.join(','), '', 'nodos tapados o fuera tras reencuadrar');
  return P;
});

test('créditos: el estudio una sola vez, sin [NOMBRE]', async () => {
  const P = await openPage();
  for (const lang of ['es', 'en']) {
    await P.ev((l) => { V.setLang(l); V.game.applyI18n(); }, lang);
    await P.click('btnCredits');
    const c = await P.ev(() => ({ txt: document.getElementById('credList').innerText, n: (document.getElementById('credList').innerText.match(/Voidling Team/g) || []).length }));
    assert(c.n <= 1 && !/\[NOMBRE\]|\[ESTUDIO\]/.test(c.txt), lang + ': créditos sin repeticiones ni marcadores (' + c.n + ')');
    await P.click('btnCredBack');
  }
  return P;
});

test('primera partida: pistas guiadas por eventos', async () => {
  const P = await openPage({ save: { v: 1, matter: 0, levels: { core: 1 }, record: 0, recordRun: {}, runs: 0, totalEaten: 0, playTime: 0, seenLogs: ['p0'], victory: false } });
  await P.click('btnPlay');
  await P.wait(() => V.game.state === 'run', null, 3000, 'partida');
  await P.ev(() => { V.game.setTarget = (r) => ({ tx: r.x, ty: r.y }); }); // quieto
  await sleep(3500);
  eq(await P.ev(() => V.game.hintActive()), true, 'la pista 1 sigue mientras no se mueve');
  eq(await P.ev(() => document.querySelectorAll('#achToasts .achToast').length), 0, 'sin avisos de logro sobre la pista');
  await botOn(P, false);
  await P.wait(() => V.game.run && (V.game.run.eaten >= 3 || V.game.run.over), null, 15000, 'moverse y comer');
  return P;
});

test('modo demo: fin de la demo y tope de escala', async () => {
  const P = await openPage({ config: { demo: true, demoMaxMilestone: 2, build: 'demo' }, save: { v: 1, matter: 0, levels: { core: 1 }, record: 1, recordRun: { 1: 1 }, runs: 6, totalEaten: 10, playTime: 60, seenLogs: ['p0', 'p1', 'p2', 'c1a', 'c1c', 'c1b'], victory: false } });
  assert(await P.ev(() => /DEMO/.test(document.getElementById('verTag').textContent)), 'etiqueta DEMO');
  await startRunFromTree(P);
  await P.ev(() => { const r = V.game.run; r.mass = 41 * 41; r.updateR(); });
  await sleep(200);
  eq(await P.ev(() => V.game.run.milestone), 2, 'escala 2 alcanzada');
  await killRun(P);
  await P.page.keyboard.press('Space'); // MEJORAR → primero el fin de la demo
  await P.wait(() => !document.getElementById('demoEnd').classList.contains('hidden'), null, 3000, 'pantalla de fin de la demo');
  assert(await P.ev(() => document.getElementById('demoText').textContent.length > 20), 'texto de fin de demo');
  await P.click('btnDemoKeep');
  await P.wait(() => V.game.state === 'tree', null, 3000, 'seguir en la demo → árbol');
  await P.skipTrans();
  // otra partida que llega a la escala 2: ya no repite la pantalla
  await P.ev(() => V.game.requestRun());
  await P.wait(() => V.game.state === 'run', null, 3000, 'partida');
  await P.ev(() => { const r = V.game.run; r.mass = 41 * 41; r.updateR(); });
  await killRun(P);
  eq(await P.state(), 'results', 'resultados normales (sin repetir fin de demo)');
  await P.page.keyboard.press('Space');
  await P.wait(() => V.game.state === 'tree', null, 3000, 'árbol directamente');
  await P.skipTrans();
  // cruzar la escala 3 termina la partida en la demo
  await P.ev(() => V.game.requestRun());
  await P.wait(() => V.game.state === 'run', null, 3000, 'partida');
  await P.ev(() => { const r = V.game.run; r.mass = 82 * 82; r.updateR(); });
  await P.wait(() => !document.getElementById('demoEnd').classList.contains('hidden'), null, 5000, 'fin de la demo al chocar con el tope');
  const s = await P.ev(() => ({ rec: V.game.save.record, c3: V.game.save.seenLogs.includes('c3a'), ach3: !!(V.game.save.achievements || {}).ACH_SCALE_3 }));
  eq(s.rec, 2, 'récord limitado a la escala de la demo'); eq(s.ach3, false, 'sin logro de escala 3 en la demo');
  await P.click('btnDemoMenu');
  eq(await P.state(), 'menu', 'menú');
  return P;
});

// Mando simulado (Gamepad API) como en las pruebas del agente de UX: navigator.getGamepads devuelve
// un objeto que la prueba modifica (botones / ejes).
const PAD_INIT = () => {
  const pad = { id: 'Xbox 360 Controller (XInput STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', timestamp: 0,
    buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), axes: [0, 0, 0, 0] };
  window.__pad = pad;
  window.__padOn = false;
  navigator.getGamepads = () => (window.__padOn ? [pad] : []);
  window.__press = async (i, ms) => { pad.buttons[i].pressed = true; pad.buttons[i].value = 1; await new Promise((r) => setTimeout(r, ms || 90)); pad.buttons[i].pressed = false; pad.buttons[i].value = 0; await new Promise((r) => setTimeout(r, 90)); };
};
test('mando: menús, árbol, partida, pausa y barra en una fila (1280×800)', async () => {
  const P = await openPage({ init: PAD_INIT, save: { v: 1, matter: 5000, levels: { core: 1, g1: 1, g2: 1, g4: 1 }, record: 2, recordRun: { 1: 1, 2: 3 }, runs: 9, totalEaten: 100, playTime: 300, seenLogs: ['p0', 'p1', 'p2', 'c1a', 'c1c', 'c1b', 'c2a', 'c2c', 'c1d'], victory: false, settings: { music: 0.5, sfx: 0.7, shake: true, lang: 'es', uiScale: 120 } } });
  await P.ev(() => { window.__padOn = true; });
  await sleep(200);
  await P.ev(() => window.__press(0)); // A en el menú → CONTINUAR → árbol
  await P.wait(() => V.game.state === 'tree', null, 3000, 'A abre el árbol');
  await P.skipTrans();
  eq(await P.ev(() => V.inputMode), 'pad', 'modo de entrada mando');
  // la barra cabe en una fila con glifos y escala 120 %
  const one = await P.ev(() => { const b = document.getElementById('treebar'); const kids = [...b.children].filter((e) => e.offsetParent); const tops = kids.map((e) => Math.round(e.getBoundingClientRect().top)); return { rows: new Set(tops.map((t) => Math.round(t / 20))).size, over: b.scrollWidth - b.clientWidth, cls: b.className }; });
  assert(one.over <= 1 && !/wrap/.test(one.cls), 'treebar en una fila con mando a 1280×800 ' + JSON.stringify(one));
  await P.shot('pad-tree');
  const sel0 = await P.ev(() => V.Tree.sel && V.Tree.sel.id);
  await P.ev(() => window.__press(15)); // derecha en la cruceta
  const sel1 = await P.ev(() => V.Tree.sel && V.Tree.sel.id);
  assert(sel0 !== sel1 || sel1, 'la cruceta mueve la selección');
  const m0 = await P.ev(() => V.game.save.matter);
  await P.ev(() => window.__press(0)); // A compra
  assert((await P.ev(() => V.game.save.matter)) <= m0, 'A intenta comprar');
  await P.ev(() => window.__press(2)); // X inicia
  await P.wait(() => V.game.state === 'run', null, 3000, 'X inicia la partida');
  const x0 = await P.ev(() => V.game.run.x);
  await P.ev(() => { window.__pad.axes[0] = 1; });
  await sleep(500);
  await P.ev(() => { window.__pad.axes[0] = 0; });
  assert((await P.ev(() => V.game.run.x)) > x0 + 1, 'el stick mueve el agujero');
  await P.ev(() => { V.game.run.pulseT = 0; });
  await P.ev(() => window.__press(0));
  assert(await P.ev(() => V.game.run.pulseT > 0), 'A lanza el pulso');
  await P.ev(() => window.__press(9)); // START pausa
  await P.wait(() => V.game.paused, null, 2000, 'START pausa');
  await P.ev(() => window.__press(1)); // B continúa
  await P.wait(() => !V.game.paused, null, 2000, 'B continúa');
  // desconectar el mando en partida pausa el juego
  await P.ev(() => { window.__padOn = false; });
  await P.wait(() => V.game.paused, null, 2000, 'pausa al desconectar');
  await P.ev(() => { window.__padOn = true; });
  await sleep(150);
  await P.ev(() => window.__press(1));
  await P.wait(() => !V.game.paused, null, 2000, 'continuar');
  await killRun(P);
  await P.ev(() => window.__press(2)); // X en resultados = reintentar
  await P.wait(() => V.game.state === 'run', null, 3000, 'X reintenta');
  return P;
});

test('táctil: tocar para jugar, arrastrar mueve, doble toque = pulso', async () => {
  const P = await openPage({ touch: true, mobile: true, viewport: { width: 844, height: 390 }, save: { v: 1, matter: 0, levels: { core: 1, g1: 1, g2: 1, g4: 1 }, record: 1, recordRun: { 1: 1 }, runs: 5, totalEaten: 10, playTime: 60, seenLogs: ['p0', 'p1', 'p2', 'c1a', 'c1c'], victory: false } });
  const b = await P.page.locator('#btnPlay').boundingBox();
  await P.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
  await P.wait(() => V.game.state === 'tree', null, 3000, 'toque en CONTINUAR');
  for (let i = 0; i < 20 && (await P.ev(() => V.game.transActive())); i++) { await P.page.touchscreen.tap(400, 300); await sleep(60); }
  const s = await P.page.locator('#treeStart').boundingBox();
  await P.page.touchscreen.tap(s.x + s.width / 2, s.y + s.height / 2);
  await P.wait(() => V.game.state === 'run', null, 3000, 'toque en INICIAR');
  eq(await P.ev(() => V.inputMode), 'touch', 'modo táctil');
  // arrastrar con el dedo (CDP: touchStart → touchMove ...)
  const cdp = await P.ctx.newCDPSession(P.page);
  const x0 = await P.ev(() => V.game.run.x);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 422, y: 195 }] });
  for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 422 + i * 30, y: 195 }] }); await sleep(40); }
  await sleep(300);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  assert((await P.ev(() => V.game.run.x)) > x0 + 1, 'el arrastre mueve el agujero');
  await P.ev(() => { V.game.run.pulseT = 0; });
  await P.page.touchscreen.tap(300, 200); await sleep(60); await P.page.touchscreen.tap(300, 200);
  await sleep(100);
  assert(await P.ev(() => V.game.run.pulseT > 0), 'doble toque lanza el pulso');
  return P;
});

test('run: dt extremos, segundo plano, redimensionar y cambiar idioma en partida', async () => {
  const P = await openPage({ save: advancedSave({ record: 4, levels: { core: 1 } }) });
  await startRunFromTree(P);
  await botOn(P, true);
  await P.ev(() => { const r = V.game.run; r.mass = 220 * 220; r.updateR(); r.spawnSwarm(); r.spawnPulsar(); });
  const ok = await P.ev(() => {
    const r = V.game.run;
    r.update(0); r.update(-1); r.update(NaN); r.update(5); r.stab = r.stabMax; r.update(0.0001);
    for (let i = 0; i < 30; i++) { r.stab = r.stabMax; r.update(0.25); }
    r.stab = r.stabMax;
    return [r.x, r.y, r.r, r.zoom, r.stab].every(Number.isFinite) && r.objs.every((o) => Number.isFinite(o.x) && Number.isFinite(o.y));
  });
  assert(ok, 'sin NaN tras dt 0/negativo/NaN/enormes');
  // ventana minimizada (0×0) y redimensionada
  await P.page.setViewportSize({ width: 600, height: 900 });
  await sleep(200);
  await P.ev(() => {
    window.__dW = Object.getOwnPropertyDescriptor(window, 'innerWidth'); window.__dH = Object.getOwnPropertyDescriptor(window, 'innerHeight');
    Object.defineProperty(window, 'innerWidth', { configurable: true, get: () => 0 }); Object.defineProperty(window, 'innerHeight', { configurable: true, get: () => 0 });
    window.dispatchEvent(new Event('resize'));
  });
  await sleep(200);
  assert(await P.ev(() => { const r = V.game.run; return Number.isFinite(r.zoom) && r.zoom > 0 && Number.isFinite(r.x); }), 'sin NaN con la ventana minimizada (0×0)');
  await P.ev(() => { Object.defineProperty(window, 'innerWidth', window.__dW); Object.defineProperty(window, 'innerHeight', window.__dH); window.dispatchEvent(new Event('resize')); });
  await P.page.setViewportSize({ width: 1600, height: 900 });
  await sleep(300);
  assert(await P.ev(() => { const r = V.game.run; return r.vw === 1600 && Number.isFinite(r.zoom) && r.zoom > 0 && Number.isFinite(r.x); }), 'el tamaño se aplica y no hay NaN tras minimizar');
  // pestaña en segundo plano → pausa
  await P.ev(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  eq(await P.ev(() => V.game.paused), true, 'pausa al pasar a segundo plano');
  await P.ev(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
  // idioma en partida (pausa → ajustes → idioma → volver → continuar)
  await P.click('btnPauseSettings');
  await P.ev(() => { const s = document.getElementById('setLang'); s.value = 'en'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  await P.click('btnSetBack');
  eq(await P.ev(() => document.getElementById('btnResume').textContent.trim()), 'RESUME', 'pausa en inglés');
  await P.click('btnResume');
  await sleep(500);
  eq(await P.ev(() => V.t('stability')), 'STABILITY', 'HUD en inglés');
  return P;
});

test('números flotantes: agrupados, limitados y sin solapes', async () => {
  const P = await openPage({ save: advancedSave({ record: 4, levels: { core: 1, h4: 3 } }) });
  await startRunFromTree(P);
  await botOn(P, true);
  const r = await P.ev(async () => {
    const run = V.game.run;
    const maxes = [];
    for (let f = 0; f < 90; f++) {
      // combo: 6 bocados por fotograma alrededor del agujero + roturas repartidas por la pantalla
      for (let k = 0; k < 6; k++) { const o = run.makeObj(run.x + run.r, run.y, run.r * 0.3); run.eat(o); }
      if (f % 3 === 0) for (let k = 0; k < 4; k++) { const o = run.makeObj(run.x + (k - 2) * run.r * 4, run.y - run.r * 5, run.r * 2); run.breakObj(o); }
      await new Promise((res) => requestAnimationFrame(res));
      maxes.push(run.texts.length);
    }
    const follow = run.texts.filter((t) => t.follow);
    return { max: Math.max(...maxes), follow: follow.length, big: follow.length ? follow[0].n : 0 };
  });
  assert(r.max <= 18, 'como mucho 18 números a la vez (hubo ' + r.max + ')');
  assert(r.follow <= 2 && r.big > 20, 'el combo se agrupa en un contador que crece ' + JSON.stringify(r));
  await P.shot('numbers');
  return P;
});

test('idiomas: textos +30 % y CJK caben (DOM y HUD del canvas)', async () => {
  const P = await openPage({ save: { v: 1, matter: 9e5, levels: { core: 1, g1: 2, g4: 1, h1: 1, h2: 1, h4: 1 }, record: 3, recordRun: { 1: 1, 2: 3, 3: 8 }, runs: 12, totalEaten: 100, playTime: 300, seenLogs: [], victory: false } });
  // Idiomas de prueba: 'xx-LONG' (inglés con cada palabra un 40 % más larga) y 'xx-CJK' (sin espacios)
  await P.ev(() => {
    const en = V._S.en, L = {}, C = {};
    const CJK = '的一是不了人我在有他这为之大来以个中上们到说时国和地要就出会可也你对生能而子那得于着下自之年过发后作里用道行所然家种事成方多经么去法学如都同现当没动面起看定天分还进好小部其些主样理心她本前开但因只从想实日军者意无力它与长把机十民第公此已工使情明性知全三又关点正业外将两高间由问很最重并物手应战向头文体政美相见被利什二等产或新己制身果加西斯月话合回特代内信表化老给世位次度门任常先海通教儿原东声提立及比员解水名真论处走义各入几口认条平系气题活尔更别打女变四神总何电数安少报才结反受目太量再感建务做接必场件计管期市直德资命山金指克许统区保至队形社便空决治展马科司五基眼书非则听白却界达光放强即像难且权思王象完设式色路记南品住告类求据程北边死张该交规万取拉格望觉术领共确传师观清今切院让识候带导争运笑飞风步改收根干造言联持组每济车亲极林服快办议往元英士证近失转夫令准布始怎呢存未远叫台单影具罗字爱击流备兵连调深商算质团集百需价花党华城石级整府离况亚请技际约示复病息究线似官火断精满支视消越器容照须九增研写称企八功吗包片史委乎查轻易早曾除农找装广显吧阿李标谈吃图念六引历首医局突专费号尽另周较注语仅考落青随选列武红响虽推势参希古众构房半节土投某案黑维革划敌致陈律足态护七兴派孩验责营星够章音跟志底站严巴例防族供效续施留讲型料终答紧黄绝奇察母京段依批群项故按河米围江织害斗双境客纪采举杀攻父苏密低朝友诉止细愿千值仍男钱破网热助倒育属坐帝限船脸职速刻乐否刚威毛状率甚独球般普怕弹校苦创假久错承印晚兰试股拿脑预谁益阳若哪微尼继送急血惊伤素药适波夜省初喜卫源食险待述陆习置居劳财环排福纳欢雷警获模充负云停木游龙树疑层冷洲冲射略范竟句室异激汉村哈策演简卡罪判担州静退既衣您宗积余痛检差富灵协角占配征修皮挥胜降阶审沉坚善妈刘读啊超免压银买皇养伊怀执副乱抗犯追帮宣佛岁航优怪香著田铁控税左右份穿艺背阵草脚概恶块顿敢守酒岛托央户烈洋哥索胡款靠评版宝座释景顾弟登货互付伯慢欧换闻危忙核暗姐介坏讨丽良序升监临亮露永呼味野架域沙掉括舰鱼杂误湾吉减编楚肯测败屋跑梦散温困剑渐封救贵枪缺楼县尚毫移娘朋画班智亦耳恩短掌恐遗固席松秘谢鲁遇康虑幸均销钟诗藏赶剧票损忽巨炮旧端探湖录叶春乡附吸予礼港雨呀板庭妇归睛饭额含顺输摇招婚脱补谓督毒油疗旅泽材灭逐莫笔亡鲜词圣择寻厂睡博勒烟授诺伦岸奥唐卖俄炸载洛健堂旁宫喝借君禁阴园谋宋避抓荣姑孙逃牙束跳顶玉镇雪午练迫爷篇肉嘴馆遍凡础洞卷坦牛宁纸诸训私庄祖丝翻暴森塔默握戏隐熟骨访弱蒙歌店鬼软典欲萨伙遭盘爸扩盖弄雄稳忘亿刺拥徒姆杨齐赛趣曲刀床迎冰虚玩析窗醒妻透购替塞努休虎扬途侵刑绿兄迅套贸毕唯谷轮库迹尤竞街促延震弃甲伟麻川申缓潜闪售灯针哲络抵朱埃抱鼓植纯夏忍页杰筑折郑贝尊吴秀混臣雅振染盛怒舞圆搞狂措姓残秋培迷诚宽宇猛摆梅毁伸摩盟末乃悲拍丁赵硬麦蒋操耶阻订彩抽赞魔纷沿喊违妹浪汇币丰蓝殊献桌啦瓦莱援译夺汽烧距裁偏符勇触课敬哭懂墙袭召罚侠厅拜巧侧韩冒债曼融惯享戴童犹乘挂奖绍厚纵障讯涉彻刊丈爆乌役描洗玛患妙镜唱烦签仙彼弗症仿倾牌陷鸟轰咱菜闭奋庆撤泪茶疾缘播朗杜奶季丹狗尾仪偷奔珠虫驻孔宜艾桥淡翼恨繁寒伴叹旦愈潮粮缩罢聚径恰挑袋灰捕徐珍幕映裂泰隔启尖忠累炎暂估泛荒偿横拒瑞忆孤鼻闹羊呆厉衡胞零穷舍码赫婆魂灾洪腿胆津俗辩胸晓劲贫仁偶辑邦恢赖圈摸仰润堆碰艇稍迟辆废净凶署壁御奉旋冬矿抬蛋晨伏吹鸡倍糊秦盾杯租骑乏隆诊奴摄丧污渡旗甘耐凭扎抢绪粗肩梁幻菲皆碎宙叔岩荡综爬荷悉蒂返井壮薄悄扫敏碍殖详迪矛霍允幅撒剩凯颗骂赏液番箱贴漫酸郎腰舒眉忧浮辛恋餐吓挺励辞艘键伍峰尺昨黎辈贯侦滑券崇扰宪绕趋慈乔阅汗枝拖墨胁插箭腊粉泥氏彭拔骗凤慧媒佩愤扑龄驱惜豪掩兼跃尸肃帕驶堡届欣惠册储飘桑闲惨洁踪勃宾频仇磨递邪撞拟滚奏巡颜剂绩贡疯坡瞧截燃焦殿伪柳锁逼颇昏劝呈搜勤戒驾漂饮曹朵仔柔俩孟腐幼践籍牧凉牲佳娜浓芳稿竹腹跌逻垂遵脉貌柏狱猜怜惑陶兽帐饰贷昌叙躺钢沟寄扶铺邓寿惧询汤盗肥尝匆辉奈扣廷澳嘛董迁凝慰厌脏腾幽怨鞋丢埋泉涌辖躲晋紫艰魏吾慌祝邮吐狠鉴曰械咬邻赤挤弯椅陪割揭韦悟聪雾锋梯猫祥阔誉筹丛牵鸣沈阁穆屈旨袖猎臂蛇贺柱抛鼠瑟戈牢逊迈欺吨琴衰瓶恼燕仲诱狼池疼卢仗冠粒遥吕玄尘冯抚浅敦纠钻晶岂峡苍喷耗凌敲菌赔涂粹扁亏寂煤熊恭湿循暖糖赋抑秩帽哀宿踏烂袁侯抖夹昆肝擦猪炼恒慎搬纽纹玻渔磁铜齿跨押怖漠疲叛遣兹祭醉拳弥斜档稀捷肤疫肿豆削岗晃吞宏癌肚隶履涨耀扭坛拨沃绘伐堪仆郭牺歼墓雇廉契拼惩捉覆刷劫嫌瓜歇雕闷乳串娃缴唤赢莲霸桃妥瘦搭赴岳嘉舱俊址庞耕锐缝悔邀玲惟斥宅添挖呵讼氧浩羽斤酷掠妖祸侍乙妨贪挣汪尿莉悬唇翰仓轨枚盐览傅帅庙芬屏寺胖璃愚滴疏萧姿颤丑劣柯寸扔盯辱匹俱辨饿蜂哦腔郁溃谨糟葛苗肠忌溜鸿爵鹏鹰笼丘桂滋聊挡纲肌茨壳痕碗穴膀卓贤卧膜毅锦欠哩函茫昂薛皱夸豫胃舌剥傲拾窝睁携陵哼棉晴铃填饲渴吻扮逆脆喘罩卜炉柴愉绳胎蓄眠竭喂傻慕浑奸扇柜悦拦诞饱乾泡贼亭夕爹酬儒姻卵氛泄杆挨僧蜜吟猩遂狭肖甜霞驳裕顽於摘矮秒卿畜咽披辅勾盆疆赌塑畏吵囊嗯泊肺骤缠冈羞瞪吊贾漏斑涛悠鹿俘锡卑葬铭滩嫁催璇翅盒蛮矣潘歧赐鲍锅廊拆灌勉盲宰佐啥胀扯禧辽抹筒棋裤唉朴咐孕誓喉妄拘链驰栏逝窃艳臭纤玑棵趁匠盈翁愁瞬婴孝颈倘浙谅蔽畅赠妮莎尉冻跪闯葡後厨鸭颠遮谊圳吁仑辟瘤嫂陀框谭亨钦庸歉芝吼甫衫摊宴嘱衷娇陕矩浦讶耸裸碧摧薪淋耻胶屠鹅饥盼脖虹翠崩账萍逢赚撑翔倡绵猴枯巫昭怔渊凑溪蠢禅阐旺寓藤匪伞碑挪琼脂谎慨菩萄狮掘抄岭晕逮砍挫郊陌诫醋碌莫';
    let ci = 0;
    const cjk = (n) => { let s = ''; for (let i = 0; i < n; i++) s += CJK[(ci++ * 7) % CJK.length]; return s; };
    for (const k in en) {
      const v = String(en[k]);
      L[k] = v.replace(/[A-Za-zÀ-ÿ]+/g, (w) => w + w.slice(0, Math.ceil(w.length * 0.4)).toLowerCase());
      C[k] = v.replace(/\{[A-Za-z]+\}|\[[A-Z]+\]/g, '\u0001$&\u0001').split('\u0001').map((p) => (/^\{|\[/.test(p) ? p : p.replace(/[A-Za-zÀ-ÿ'’]+(?:\s+[A-Za-zÀ-ÿ'’]+)*/g, (w) => cjk(Math.max(2, Math.round(w.length * 0.45)))))).join('');
    }
    for (const n of V.NODES) { L['node_' + n.id + '_n'] = V.nodeName(n.id) + 'enverlängerung'; L['node_' + n.id + '_d'] = V.nodeDesc(n.id) + ' Zusätzlicheerklärungstextlänge'; C['node_' + n.id + '_n'] = cjk(5); C['node_' + n.id + '_d'] = cjk(30); }
    V.registerLang('xx-LONG', 'Langtextdeutschtest'); V.registerLang('ja', '日本語テスト');
    V.addStrings({ 'xx-LONG': L, ja: Object.assign({}, V._S.ja || {}, C) });
  });
  const problems = [];
  // Comprueba que nada visible se desborda horizontalmente
  const scanDom = (where) => P.ev((w) => {
    const out = [];
    if (document.documentElement.scrollWidth > innerWidth + 1) out.push(w + ': la página tiene scroll horizontal');
    for (const el of document.querySelectorAll('#ui button, #ui .card, #ui .srow, #ui .srow > span, #tooltip, #treebar .pill, #ui h2, #ui .sub, .achTile, #treeHint')) {
      if (!el.offsetParent || el.closest('.hidden')) continue;
      const r = el.getBoundingClientRect();
      if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== 'auto') out.push(w + ': desborda ' + (el.id || el.className || el.tagName) + ' (' + el.scrollWidth + ' > ' + el.clientWidth + ') «' + el.textContent.trim().slice(0, 40) + '»');
      if (r.right > innerWidth + 1 || r.left < -1) out.push(w + ': fuera de pantalla ' + (el.id || el.className || el.tagName));
    }
    return out;
  }, where);
  // Registra los fillText del canvas que se salen del lienzo (HUD, banners, pistas)
  await P.ev(() => {
    const proto = CanvasRenderingContext2D.prototype, orig = proto.fillText;
    window.__ftOut = [];
    proto.fillText = function (t, x, y) {
      if (window.__ftCheck && this.canvas.id === 'c') {
        const m = this.getTransform(), w = this.measureText(t).width * m.a, sx = m.a * x + m.e;
        const a = this.textAlign, l = a === 'center' ? sx - w / 2 : a === 'right' || a === 'end' ? sx - w : sx;
        if (l < -2 || l + w > this.canvas.width + 2) window.__ftOut.push(String(t).slice(0, 50) + ' [' + Math.round(l) + '..' + Math.round(l + w) + ' de ' + this.canvas.width + ']');
      }
      return orig.apply(this, arguments);
    };
  });
  for (const lang of ['xx-LONG', 'ja']) {
    for (const vp of [{ width: 1280, height: 800 }, { width: 800, height: 600 }]) {
      await P.page.setViewportSize(vp);
      const tag = lang + ' ' + vp.width + 'x' + vp.height;
      await P.ev((l) => { V.setLang(l); V.game.save.settings.lang = l; V.game.applyI18n(); V.game.goMenu(); }, lang);
      await sleep(350); problems.push(...(await scanDom(tag + ' menú')));
      await P.click('btnSettings'); await sleep(300); problems.push(...(await scanDom(tag + ' ajustes'))); await P.click('btnSetBack');
      await P.click('btnStats'); await sleep(300); problems.push(...(await scanDom(tag + ' estadísticas'))); await P.click('btnStatsBack');
      await P.ev(() => V.game.goTree()); await P.skipTrans(); await sleep(300);
      await P.ev(() => { V.Input.setMode('key'); V.game.tree.move(1, 0); }); await sleep(200);
      problems.push(...(await scanDom(tag + ' árbol')));
      await P.ev(() => V.Input.setMode('mouse'));
      await P.click('treeAch'); await sleep(300); problems.push(...(await scanDom(tag + ' logros'))); await P.page.keyboard.press('Escape');
      await P.ev(() => V.game.requestRun()); await P.wait(() => V.game.state === 'run', null, 3000, 'partida');
      await P.ev(() => { const r = V.game.run; r.combo = 15; r.st.combo = 15; V.game.queueBanner({ text: V.t('evSwarm'), small: V.t('evThreat'), sub: V.t('ev_swarmSub') }); window.__ftCheck = true; });
      await sleep(600);
      await P.ev(() => { window.__ftCheck = false; });
      await P.shot('lang-' + lang + '-' + vp.width);
      await P.page.keyboard.press('Escape'); await sleep(200); problems.push(...(await scanDom(tag + ' pausa')));
      await P.page.keyboard.press('Escape');
      await killRun(P); problems.push(...(await scanDom(tag + ' resultados')));
    }
  }
  const ft = await P.ev(() => [...new Set(window.__ftOut)]);
  for (const t of ft) problems.push('canvas: texto fuera del lienzo: ' + t);
  assert(!problems.length, 'problemas de maquetación:\n    ' + [...new Set(problems)].slice(0, 25).join('\n    '));
  // wrapText corta CJK por carácter
  const lines = await P.ev(() => { const c = document.createElement('canvas').getContext('2d'); c.font = V.font('600', 16); return V.Render.wrapLines(c, '这是一个很长的中文句子没有任何空格需要按字符换行才能显示完整的内容。', 120).length; });
  assert(lines >= 3, 'wrapText corta el chino por carácter (' + lines + ' líneas)');
  return P;
});

test('coherencia: todas las claves de texto existen en ES y EN', async () => {
  const P = await openPage();
  const src = ['main.js', 'render.js', 'finale.js', 'tree.js', 'input.js', 'achievements.js'].map((f) => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8')).join('\n');
  const keys = new Set();
  for (const m of src.matchAll(/\b(?:T|V\.t|V\.tHTML)\('([A-Za-z0-9_]+)'\)/g)) keys.add(m[1]);
  for (const m of fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/data-i18n="([^"]+)"/g)) keys.add(m[1]);
  const missing = await P.ev((ks) => {
    const dyn = [];
    for (let i = 0; i <= 6; i++) dyn.push('m' + i);
    for (const b in V.BRANCHES) dyn.push('b_' + b);
    for (const f of ['lumen', 'varga', 'custodians', 'void']) dyn.push('from_' + f);
    dyn.push('bossP2', 'bossP3', 'bossName');
    for (const k of ['pulsar', 'swarm', 'boss', 'bossPhase2', 'bossPhase3', 'bossDefeat']) dyn.push('ev_' + k + 'Sub');
    for (const a of V.ACHIEVEMENTS) dyn.push('ach_' + a.id + '_n', 'ach_' + a.id + '_d');
    const out = [];
    for (const k of ks.concat(dyn)) for (const l of ['es', 'en']) if (V._S[l][k] == null) out.push(l + ':' + k);
    for (const n of V.NODES) for (const l of ['es', 'en']) { V.setLang(l); if (!V.nodeName(n.id) || V.nodeName(n.id) === n.id) out.push(l + ':nodo ' + n.id); }
    V.setLang(V.game.save.settings.lang);
    for (const e of V.STORY.concat(V.STORY_POST)) if (!e.es || !e.en) out.push('historia ' + e.id);
    return out;
  }, [...keys]);
  assert(!missing.length, 'claves sin texto: ' + missing.join(', '));
  return P;
});

test('sin fugas: listeners, intervalos y handlers del bus estables tras 6 partidas', async () => {
  const P = await openPage({
    init: () => {
      window.__cnt = { listeners: 0, intervals: 0 };
      const ael = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function () { window.__cnt.listeners++; return ael.apply(this, arguments); };
      const si = window.setInterval;
      window.setInterval = function () { window.__cnt.intervals++; return si.apply(this, arguments); };
    },
    save: { v: 1, matter: 0, levels: { core: 1 }, record: 0, recordRun: {}, runs: 5, totalEaten: 10, playTime: 60, seenLogs: ['p0', 'p1', 'p2'], victory: false },
  });
  await P.ev(() => { const on = V.bus.on; window.__busOn = 0; V.bus.on = function () { window.__busOn++; return on.apply(this, arguments); }; });
  await startRunFromTree(P); await killRun(P); // primera vuelta: inicializaciones perezosas (audio, logros...)
  await P.ev(() => V.game.goTree()); await P.skipTrans();
  const c0 = await P.ev(() => ({ l: window.__cnt.listeners, i: window.__cnt.intervals, b: window.__busOn }));
  for (let k = 0; k < 6; k++) {
    await P.ev(() => V.game.requestRun()); await P.wait(() => V.game.state === 'run', null, 3000, 'partida');
    await sleep(150);
    await killRun(P);
    await P.ev(() => V.game.goTree()); await P.skipTrans();
  }
  const c1 = await P.ev(() => ({ l: window.__cnt.listeners, i: window.__cnt.intervals, b: window.__busOn }));
  eq(c1.i - c0.i, 0, 'setInterval nuevos');
  eq(c1.b - c0.b, 0, 'V.bus.on nuevos');
  assert(c1.l - c0.l <= 6 * 8, 'addEventListener nuevos acotados (' + (c1.l - c0.l) + ')'); // imágenes de iconos, etc.
  return P;
});

// Mide (1) el tiempo de JS de cada fotograma (update + draw, sin leer píxeles: leerlos pasa el canvas a
// rasterizado por CPU y falsea todo) y (2) los FPS reales, que incluyen el coste de GPU. Headless usa la
// GPU del sistema si la hay (en este equipo, una Radeon 610M: buena referencia de "hardware modesto").
test('rendimiento a 1920×1080: escenas pesadas frente a simples', async () => {
  const P = await openPage({
    viewport: { width: 1920, height: 1080 },
    init: () => {
      const raf = window.requestAnimationFrame.bind(window);
      window.__ft = []; window.__ftOn = false; window.__fr = 0;
      window.requestAnimationFrame = (cb) => raf((t) => {
        if (!window.__ftOn) return cb(t);
        const s = performance.now(); cb(t);
        window.__ft.push(performance.now() - s); window.__fr++;
      });
    },
    save: advancedSave(),
  });
  await expandSave(P);
  const measure = async (label, ms) => {
    await P.ev(() => { window.__ft = []; window.__fr = 0; window.__t0 = performance.now(); window.__ftOn = true; });
    await sleep(ms || 2500);
    const r = await P.ev(() => {
      window.__ftOn = false;
      const a = window.__ft.slice().sort((x, y) => x - y), avg = a.reduce((s, x) => s + x, 0) / (a.length || 1);
      return { n: a.length, avg, p95: a[Math.floor(a.length * 0.95)] || 0, max: a[a.length - 1] || 0, fps: (window.__fr * 1000) / (performance.now() - window.__t0) };
    });
    console.log(`      ${label.padEnd(36)} ${r.fps.toFixed(1).padStart(5)} FPS · JS ${r.avg.toFixed(2).padStart(5)} ms media, p95 ${r.p95.toFixed(2).padStart(5)}, máx ${r.max.toFixed(1).padStart(5)}`);
    return r;
  };
  await sleep(500);
  const menu = await measure('menú (demo)');
  await botOn(P, true);
  await P.ev(() => { const s = V.game.save; s.levels = { core: 1, g4: 1 }; });
  await startRunFromTree(P);
  await sleep(800);
  const simple = await measure('partida simple (escala 0)');
  // escena pesada: escala 4, enjambres, púlsares, combos y roturas constantes
  await P.ev(() => { const s = V.game.save; for (const n of V.NODES) if (n.id !== 'core') s.levels[n.id] = n.max; });
  await killRun(P);
  await P.ev(() => V.game.requestRun());
  await P.wait(() => V.game.state === 'run', null, 3000, 'partida');
  await P.ev(() => {
    const r = V.game.run; r.mass = 300 * 300; r.updateR(); r.st.density = 4;
    r.spawnSwarm(); r.spawnSwarm(); r.spawnPulsar(); r.spawnPulsar();
    if (!window.__heavy) { window.__heavy = true; V.bus.on('frame', () => {
      const run = V.game.run; if (!run || !window.__heavyOn) return;
      for (let k = 0; k < 4; k++) { const o = run.makeObj(run.x + run.r * 1.1, run.y, run.r * 0.3, { gold: k === 0 }); run.eat(o); }
      if (Math.random() < 0.3) { const o = run.makeObj(run.x + V.rand(-1, 1) * run.r * 8, run.y + V.rand(-1, 1) * run.r * 5, run.r * 2); run.breakObj(o); }
      if (Math.random() < 0.02) run.spawnSwarm();
    }); }
    window.__heavyOn = true;
  });
  await sleep(1500);
  const heavy = await measure('pesada (enjambre+púlsares+combos)', 3500);
  await P.ev(() => { window.__heavyOn = false; });
  // jefe en fase 3
  await P.ev(() => { const r = V.game.run; r.mass = 1700 * 1700; r.updateR(); });
  await P.wait(() => V.game.run.bossSpawned, null, 5000, 'jefe');
  await P.ev(() => { const r = V.game.run, b = r.boss; b.age = 5; r.bossPhase(b, 2); r.bossPhase(b, 3); b.hp = b.maxHp * 0.3; b.grace = 0; });
  await sleep(2500);
  const boss = await measure('jefe fase 3', 3500);
  await P.ev(() => { window.__immOn = false; });
  const parts = await P.ev(() => ({ parts: V.game.run.parts.length, texts: V.game.run.texts.length, objs: V.game.run.objs.length, shots: V.game.run.shots.length }));
  console.log('      (al final: ' + JSON.stringify(parts) + ')');
  global.__perf = { menu, simple, heavy, boss };
  // JS por fotograma: margen de sobra para 60 FPS (16,7 ms) en cualquier equipo.
  const LIMIT = +(process.env.E2E_PERF_MS || 10);
  assert(heavy.avg < LIMIT && boss.avg < LIMIT, `JS medio por fotograma < ${LIMIT} ms en escenas pesadas (pesada ${heavy.avg.toFixed(1)}, jefe ${boss.avg.toFixed(1)})`);
  // FPS: dependen de la GPU. Con E2E_MIN_FPS=n se exige un mínimo (p. ej. 50 en el equipo de referencia).
  const MINFPS = +(process.env.E2E_MIN_FPS || 0);
  if (MINFPS) assert(heavy.fps >= MINFPS && boss.fps >= MINFPS, `FPS ≥ ${MINFPS} (pesada ${heavy.fps.toFixed(1)}, jefe ${boss.fps.toFixed(1)})`);
  return P;
});

// ---------------------------------------------------------------- ejecución
(async () => {
  if (args.includes('--list')) { TESTS.forEach((t, i) => console.log(String(i + 1).padStart(2) + '. ' + t.name)); return; }
  const sel = filters.length ? TESTS.filter((t) => filters.some((f) => t.name.toLowerCase().includes(f.toLowerCase()))) : TESTS;
  const srv = await startServer();
  browser = await chromium.launch({ channel: CHANNEL === 'chromium' ? undefined : CHANNEL, headless: !HEADED, args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
  console.log(`VOIDLING E2E · ${sel.length} pruebas · ${URL0}` + (brokenLang.length ? `\n  AVISO: js/lang/${brokenLang.join(', js/lang/')} con error de sintaxis: ${STRICT_LANG ? 'cuenta como fallo' : 'se omite(n) (usa --strict-lang para fallar)'}` : ''));
  let failed = 0;
  const t0 = Date.now();
  for (const t of sel) {
    const s = Date.now();
    let P = null, err = null, wd;
    // vigilante: una prueba colgada falla en vez de bloquear la suite (E2E_TEST_TIMEOUT en segundos)
    const limit = +(process.env.E2E_TEST_TIMEOUT || 150) * 1000;
    try { P = await Promise.race([t.fn(), new Promise((_, ko) => { wd = setTimeout(() => ko(new Error('tiempo máximo de la prueba superado (' + limit / 1000 + ' s) en: ' + (global.__step || '?'))), limit); })]); await sleep(100); }
    catch (e) { err = e; }
    clearTimeout(wd);
    if (!P && openPages.length) P = openPages[openPages.length - 1];
    openPages.length = 0;
    // Cualquier error de consola o excepción hace fallar la prueba (también si la prueba lanzó)
    const pageErrs = P ? P.errors.slice() : [];
    if (P) await P.close().catch(() => {});
    if (!err && pageErrs.length) err = new Error('errores en la página:\n    ' + pageErrs.join('\n    '));
    const dur = ((Date.now() - s) / 1000).toFixed(1) + ' s';
    if (err) { failed++; console.log(`  ✗ ${t.name} (${dur})\n    ${String(err.message || err).split('\n').join('\n    ')}`); }
    else console.log(`  ✓ ${t.name} (${dur})`);
  }
  if (STRICT_LANG && brokenLang.length) { failed++; console.log('  ✗ paquetes de idioma con error de sintaxis: ' + brokenLang.join(', ')); }
  await browser.close();
  srv.close();
  console.log(`\n${failed ? 'FALLARON ' + failed : 'TODO OK'} · ${sel.length - failed}/${sel.length} pruebas · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  process.exitCode = failed ? 1 : 0;
})().catch((e) => { console.error('ERROR DE LA SUITE', e); process.exit(1); });
