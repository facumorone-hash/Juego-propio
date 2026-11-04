// Escenario 8: FPS aproximados (Edge headless, render por software: valores orientativos, comparar entre fases).
const Q = require('./lib');
const saves = require('./saves.json');
(async () => {
  for (const [w, h] of [[1280, 800], [1920, 1080]]) {
    const sv = JSON.parse(JSON.stringify(saves.win)); sv.seenLogs = Array.from({ length: 0 });
    sv.seenLogs = ['p0','p1','p2','c1a','c1b','c1c','c1d','c2a','c2b','c2c','c2d','c2e','c2f','c2g','c2h','c3a','c3b','c3c','c3d','c4a','c4b','c4c','c5a','c5b','c5c','c5d'];
    const s = await Q.open({ w, h, save: sv });
    const { page, ev } = s;
    await page.click('#btnPlay'); await page.waitForTimeout(400); await s.skipTrans();
    await page.keyboard.press('Space'); await page.waitForTimeout(400); await s.bot();
    const measure = (ms) => ev((ms) => new Promise((res) => { const ts = []; const t0 = performance.now(); function f(t) { ts.push(t); if (t - t0 < ms) requestAnimationFrame(f); else { const d = ts.slice(1).map((x, i) => x - ts[i]); d.sort((a, b) => a - b); res({ fps: +(1000 * d.length / (ts[ts.length - 1] - ts[0])).toFixed(1), p95ms: +d[Math.floor(d.length * 0.95)].toFixed(1), objs: V.game.run && V.game.run.objs.length, parts: V.game.run && V.game.run.parts.length }); } } requestAnimationFrame(f); }), ms);
    console.log(w + 'x' + h, 'early', JSON.stringify(await measure(3000)));
    await page.waitForTimeout(12000);
    console.log(w + 'x' + h, 'mid', JSON.stringify(await measure(3000)));
    await ev(() => { const r = V.game.run; r.mass = 1590 * 1590; r.updateR(); });
    await page.waitForTimeout(4000);
    console.log(w + 'x' + h, 'boss', JSON.stringify(await measure(3000)));
    await s.close();
  }
})();
