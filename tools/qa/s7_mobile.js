// Escenario 7: móvil web 375x812 táctil. Primer arranque + árbol + partida avanzada.
const Q = require('./lib');
const saves = require('./saves.json');
(async () => {
  const s = await Q.open({ w: 375, h: 812, touch: true, mobile: true, dpr: 2 });
  const { page, ev, shot } = s;
  await page.waitForTimeout(1200); await shot('s7_01_menu');
  await page.tap('#btnPlay'); await page.waitForTimeout(3500); await shot('s7_02_trans');
  await page.touchscreen.tap(187, 640); await page.waitForTimeout(100); await page.touchscreen.tap(187, 640); await page.waitForTimeout(600);
  console.log('state', await s.state());
  await s.bot();
  await page.waitForTimeout(1200); await shot('s7_03_run_hint');
  await page.waitForTimeout(3000); await shot('s7_04_run');
  for (let i = 0; i < 100 && (await s.state()) !== 'results'; i++) await page.waitForTimeout(200);
  await page.waitForTimeout(500); await shot('s7_05_results');
  await page.tap('#btnUpgrade'); await page.waitForTimeout(700); await s.skipTrans(); await page.waitForTimeout(300);
  await shot('s7_06_tree');
  // tocar el nodo guía: ¿compra directa sin ver la info?
  const g = await ev(() => V.Tree.guide && V.Tree.screenPos(V.Tree.guide, V.game.size.W, V.game.size.H));
  const m0 = await ev(() => V.game.save.matter);
  if (g) { await page.touchscreen.tap(g.x, g.y); await page.waitForTimeout(400); }
  console.log('matter before/after one tap', m0, await ev(() => V.game.save.matter));
  await shot('s7_07_tree_after_tap');
  await s.close();
  // partida avanzada en móvil
  const sv = JSON.parse(JSON.stringify(saves['4'])); sv.seenLogs = []; 
  const s2 = await Q.open({ w: 375, h: 812, touch: true, mobile: true, dpr: 2, save: sv });
  await s2.page.tap('#btnPlay'); await s2.page.waitForTimeout(800); await s2.shot('s7_08_trans_long_mobile');
  console.log('pending trans count', await s2.ev(() => V.Story.pending(V.game.save).length));
  await s2.skipTrans(); await s2.page.waitForTimeout(400); await s2.shot('s7_09_tree_late');
  await s2.page.tap('#treeStart'); await s2.page.waitForTimeout(500); await s2.bot();
  await s2.page.waitForTimeout(14000); await s2.shot('s7_10_run_late');
  console.log('errors', s.errors.concat(s2.errors).filter((e) => !e.includes('404')));
  await s2.close();
})();
