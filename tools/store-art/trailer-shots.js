// Saca fotogramas del tráiler (storyboard) a marketing/trailer/storyboard/ para revisar el guion sin grabar.
// Uso: node trailer-shots.js [--lang es|en] [--res 720|1080]
const path = require('path'), fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright-core');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const TIMES = [1.6, 4.5, 8.0, 11.0, 13.2, 14.0, 16.2, 18.8, 19.6, 20.3, 25.5, 28.8, 33.6, 37.5, 41.0, 43.0, 46.0, 50.0];
(async () => {
  const lang = arg('lang', 'es'), res = arg('res', '720');
  const OUT = path.resolve(__dirname, '..', '..', 'marketing', 'trailer', 'storyboard');
  fs.mkdirSync(OUT, { recursive: true });
  let browser;
  for (const c of ['msedge', 'chrome']) { try { browser = await chromium.launch({ channel: c, headless: true }); break; } catch (e) { /* siguiente */ } }
  if (!browser) throw new Error('No se encontró Edge ni Chrome');
  const [w, h] = res === '1080' ? [1920, 1080] : [1280, 720];
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error('[console]', m.text()); });
  await page.goto(pathToFileURL(path.join(__dirname, 'trailer.html')).href + '?shot=1&res=' + res + '&lang=' + lang);
  await page.waitForFunction(() => window.Trailer && window.Trailer.ready);
  for (const t of TIMES) {
    const b64 = await page.evaluate((tt) => { window.Trailer.advanceTo(tt); return document.getElementById('c').toDataURL('image/jpeg', 0.9).split(',')[1]; }, t);
    const f = path.join(OUT, lang + '_' + String(t.toFixed(1)).padStart(4, '0') + 's.jpg');
    fs.writeFileSync(f, Buffer.from(b64, 'base64'));
    console.log('  ' + path.basename(f));
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
