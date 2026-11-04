// Exporta todo el arte de tienda a marketing/ con un navegador headless (Edge o Chrome ya instalados).
// Uso:  cd tools/store-art && npm install && node export.js [--seed 7] [--only header,small]
// No descarga navegadores: usa playwright-core con el Edge/Chrome del sistema.
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'marketing');

function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  return i > 0 ? process.argv[i + 1] : def;
}

async function launch() {
  const tries = [{ channel: 'msedge' }, { channel: 'chrome' }];
  if (process.env.CHROME_PATH) tries.unshift({ executablePath: process.env.CHROME_PATH });
  const errs = [];
  for (const t of tries) {
    try { return await chromium.launch(Object.assign({ headless: true, args: ['--allow-file-access-from-files'] }, t)); }
    catch (e) { errs.push((t.channel || t.executablePath) + ': ' + e.message.split('\n')[0]); }
  }
  throw new Error('No se encontró Edge ni Chrome. Define CHROME_PATH.\n' + errs.join('\n'));
}

(async () => {
  const seed = +arg('seed', 7);
  const only = arg('only', null);
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error('[console]', m.text()); });
  const url = pathToFileURL(path.join(__dirname, 'index.html')).href + '?noui=1';
  await page.goto(url);
  await page.waitForFunction(() => window.StoreArt && window.StoreArt.ready === true, null, { timeout: 60000 });
  const t0 = Date.now();
  const files = await page.evaluate(([s, o]) => window.StoreArt.exportAll(s, o), [seed, only ? only.split(',') : null]);
  for (const f of files) {
    const p = path.join(OUT, f.path);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    const buf = Buffer.from(f.b64, 'base64');
    fs.writeFileSync(p, buf);
    console.log('  ' + path.relative(ROOT, p).replace(/\\/g, '/') + '  (' + Math.round(buf.length / 1024) + ' KB)');
  }
  console.log(files.length + ' archivos exportados en ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s · semilla ' + seed);
  await browser.close();
})().catch((e) => { console.error(e.message || e); process.exit(1); });
