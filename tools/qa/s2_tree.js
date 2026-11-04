// Escenario 2: primeras partidas + árbol. Bot conduce; el árbol se usa con el ratón real.
const Q = require('./lib');
const W = +process.argv[2] || 1280, H = +process.argv[3] || 800;
(async () => {
  const s = await Q.open({ w: W, h: H });
  const { page, ev, shot } = s;
  const tag = 's2_' + W + '_';
  await page.click('#btnPlay');
  await page.waitForTimeout(300);
  await s.skipTrans();
  await s.bot();
  const waitEnd = async () => { for (let i = 0; i < 400; i++) { if ((await s.state()) === 'results') return; await page.waitForTimeout(100); } };
  const runs = [];
  for (let n = 0; n < 6; n++) {
    await waitEnd();
    await page.waitForTimeout(400);
    runs.push(await ev(() => ({ runs: V.game.save.runs, matter: V.game.save.matter, rec: V.game.save.record })));
    // MEJORAR
    await page.click('#btnUpgrade').catch(async () => { await page.keyboard.press('Space'); });
    await page.waitForTimeout(700);
    if (n === 0) await shot(tag + '01_tree_first_with_trans');
    const tr = await s.skipTrans();
    await page.waitForTimeout(400);
    if (n === 0) {
      await shot(tag + '02_tree_first');
      const guide = await ev(() => V.Tree.guide && { id: V.Tree.guide.id, p: V.Tree.screenPos(V.Tree.guide, V.game.size.W, V.game.size.H) });
      console.log('guide', JSON.stringify(guide));
      if (guide) {
        await page.mouse.move(guide.p.x, guide.p.y);
        await page.waitForTimeout(300);
        await shot(tag + '03_tree_hover_guide');
        console.log('tooltip:', await ev(() => document.getElementById('tooltip').innerText));
      }
    }
    // compra con clic lo más barato visible (como un jugador), mientras pueda
    for (let k = 0; k < 30; k++) {
      const tgt = await ev(() => {
        const sv = V.game.save; let best = null, bc = Infinity;
        for (const n of V.NODES) { const l = sv.levels[n.id] || 0; if (n.id === 'core' || l >= n.max || !V.isVisible(n, sv.levels) || !V.isUnlocked(n, sv.record)) continue; const c = V.cost(n, l); if (c < bc) { bc = c; best = n; } }
        if (!best || sv.matter < bc) return null;
        const p = V.Tree.screenPos(best, V.game.size.W, V.game.size.H); return { id: best.id, x: p.x, y: p.y, c: bc };
      });
      if (!tgt) break;
      const inView = tgt.x > 10 && tgt.y > 60 && tgt.x < W - 10 && tgt.y < H - 10;
      if (!inView) console.log('node off-screen', JSON.stringify(tgt));
      const before = await ev(() => V.game.save.matter);
      await page.mouse.click(tgt.x, tgt.y);
      await page.waitForTimeout(150);
      const after = await ev(() => V.game.save.matter);
      if (after === before) { console.log('click did not buy', JSON.stringify(tgt)); await ev((id) => V.game.tree && (V.Tree.sel = V.NODE[id], V.game.tree.buy()), tgt.id); }
    }
    if (n === 0 || n === 5) await shot(tag + '04_tree_after_buy_' + n);
    console.log('run', n + 1, JSON.stringify(runs[n]), 'trans:', tr.join(','));
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    if ((await s.state()) !== 'run') { console.log('space did not start run; state', await s.state(), await s.visible()); await page.click('#btnTreePlay').catch(() => {}); }
    await s.bot();
  }
  await waitEnd();
  console.log('levels', JSON.stringify(await ev(() => V.game.save.levels)));
  console.log('errors', s.errors);
  await s.close();
})();
