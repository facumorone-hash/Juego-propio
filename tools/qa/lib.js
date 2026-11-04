// Utilidades de QA (revisor independiente). No modifica el juego.
// Uso: const Q = require('./lib'); const s = await Q.open({w:1280,h:800}); ...
const path = require('path');
const { chromium } = require(path.join(__dirname, '..', 'store-art', 'node_modules', 'playwright-core'));

const PORT = process.env.QA_PORT || 8820;
const URL = `http://localhost:${PORT}/index.html`;
const SHOTS = path.join(__dirname, 'shots');

async function open(opts = {}) {
  const w = opts.w || 1280, h = opts.h || 800;
  const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({
    viewport: { width: w, height: h }, locale: opts.locale || 'es-ES',
    hasTouch: !!opts.touch, isMobile: !!opts.mobile, deviceScaleFactor: opts.dpr || 1,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + (e.stack || e.message)));
  if (opts.save) {
    await page.addInitScript((s) => { if (!sessionStorage.getItem('qa_seeded')) { localStorage.setItem('voidling_save_v1', JSON.stringify(s)); sessionStorage.setItem('qa_seeded', '1'); } }, opts.save);
  } else if (opts.fresh !== false) {
    await page.addInitScript(() => { if (!sessionStorage.getItem('qa_seeded')) { localStorage.clear(); sessionStorage.setItem('qa_seeded', '1'); } });
  }
  await page.goto(URL);
  await page.waitForFunction(() => window.V && V.game && V.game.state);
  await page.waitForTimeout(600);
  const shot = async (name) => { const p = path.join(SHOTS, name + '.png'); await page.screenshot({ path: p }); return p; };
  const ev = (fn, arg) => page.evaluate(fn, arg);
  const bot = () => ev(() => { V.game.setTarget = (r) => { r.bot(); return { tx: r.tx, ty: r.ty }; }; });
  const state = () => ev(() => V.game.state);
  // Avanza todas las transmisiones visibles; devuelve los textos leídos.
  const skipTrans = async () => {
    const out = [];
    for (let i = 0; i < 80; i++) {
      const a = await ev(() => V.game.transActive());
      if (!a) break;
      out.push(await ev(() => document.getElementById('tFrom').textContent));
      await ev(() => V.game.advanceTrans()); await ev(() => V.game.advanceTrans());
      await page.waitForTimeout(30);
    }
    return out;
  };
  const visible = () => ev(() => [...document.querySelectorAll('#ui > .screen, #trans, #treebar')].filter((e) => !e.classList.contains('hidden')).map((e) => e.id));
  return { browser, ctx, page, errors, shot, ev, bot, state, skipTrans, visible, close: () => browser.close() };
}

module.exports = { open, URL, SHOTS };
