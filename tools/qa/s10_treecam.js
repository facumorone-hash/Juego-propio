// Escenario 10: ¿se reencuadra el árbol tras comprar? Espera 2,5 s después de las compras.
const Q = require('./lib');
(async () => {
  const sv = { v: 1, matter: 96, levels: { core: 1 }, record: 0, recordRun: {}, runs: 1, totalEaten: 30, playTime: 15, seenLogs: ['p0', 'p1'], victory: false };
  const s = await Q.open({ w: 1280, h: 800, save: sv });
  const { page, ev, shot } = s;
  await page.click('#btnPlay'); await page.waitForTimeout(800); await s.skipTrans();
  for (const id of ['h1', 's1', 'g1', 't1', 'c1', 'o1', 'h1', 's1']) {
    const p = await ev((id) => V.Tree.screenPos(V.NODE[id], V.game.size.W, V.game.size.H), id);
    await page.mouse.click(p.x, p.y); await page.waitForTimeout(250);
  }
  await page.mouse.move(1200, 700);
  await page.waitForTimeout(2500);
  await shot('s10_tree_after_buys_settled');
  const off = await ev(() => { const { W, H } = V.game.size; const out = []; const top = document.getElementById('treebar').getBoundingClientRect().bottom; for (const n of V.NODES) { if (!V.isVisible(n, V.game.save.levels)) continue; const p = V.Tree.screenPos(n, W, H); if (p.y < top + 10 || p.y > H - 90 || p.x < 20 || p.x > W - 20) out.push(n.id + '@' + Math.round(p.x) + ',' + Math.round(p.y)); } return { top, out }; });
  console.log(JSON.stringify(off));
  await s.close();
})();
