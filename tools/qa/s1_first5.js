// Escenario 1: primer arranque, jugando con el ratón "a mano" (sin bot), 1280x800.
const Q = require('./lib');
(async () => {
  const s = await Q.open({ w: 1280, h: 800 });
  const { page, ev, shot } = s;
  await page.waitForTimeout(1500);
  await shot('s1_01_menu');
  console.log('visible', await s.visible());
  // clic en JUGAR
  await page.click('#btnPlay');
  await page.waitForTimeout(800);
  await shot('s1_02_first_trans_typing');
  await page.waitForTimeout(4000);
  await shot('s1_03_first_trans_full');
  console.log('trans text:', await ev(() => document.getElementById('tText').textContent));
  await page.mouse.click(640, 400);
  await page.waitForTimeout(300);
  await page.mouse.click(640, 400);
  await page.waitForTimeout(500);
  console.log('state', await s.state());
  // Juega moviendo el ratón hacia el cuerpo comestible más cercano (como haría una persona), en coordenadas de pantalla.
  const t0 = Date.now();
  let k = 0;
  const log = [];
  while (Date.now() - t0 < 40000) {
    const info = await ev(() => {
      const r = V.game.run; if (!r || V.game.state !== 'run') return null;
      const { W, H } = V.game.size;
      let best = null, bd = 1e9;
      for (const o of r.objs) { if (o.dead || o.kind === 'anti' || o.s > r.r * r.st.eatRatio) continue; const d = Math.hypot(o.x - r.x, o.y - r.y); if (d < bd) { bd = d; best = o; } }
      const z = r.zoom || 1;
      const sx = best ? W / 2 + (best.x - r.x) * z : W / 2 + 100, sy = best ? H / 2 + (best.y - r.y) * z : H / 2;
      return { t: r.t, r: r.r, stab: r.stab, stabMax: r.stabMax, matter: r.matter, eaten: r.eaten, sx, sy, m: r.milestone, objs: r.objs.length };
    });
    if (!info) break;
    if (k % 10 === 0) log.push(`t=${info.t.toFixed(1)} r=${info.r.toFixed(1)} stab=${info.stab.toFixed(0)}/${info.stabMax} matter=${info.matter.toFixed(1)} eaten=${info.eaten} objs=${info.objs}`);
    await page.mouse.move(Math.max(5, Math.min(1275, info.sx)), Math.max(5, Math.min(795, info.sy)), { steps: 2 });
    if ([1, 4, 7.5, 12, 20].some((x) => Math.abs(info.t - x) < 0.12)) await shot('s1_run1_t' + Math.round(info.t));
    k++;
    await page.waitForTimeout(80);
  }
  console.log(log.join('\n'));
  await page.waitForTimeout(1500);
  console.log('state after run 1', await s.state(), await s.visible());
  await shot('s1_04_results1');
  console.log('results:', await ev(() => document.getElementById('results').innerText));
  console.log('errors', s.errors);
  await s.close();
})();
