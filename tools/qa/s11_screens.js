// Escenario 11: pantallas secundarias (logros, datos) y partida en modo daltónico con Custodios.
const Q = require('./lib');
const saves = require('./saves.json');
(async () => {
  const sv = JSON.parse(JSON.stringify(saves['3']));
  sv.seenLogs = ['p0','p1','p2','c1a','c1b','c1c','c1d','c2a','c2b','c2c','c2d','c2e','c2f','c2g','c2h','c3a','c3b','c3c','c3d'];
  const s = await Q.open({ w: 1280, h: 800, save: sv });
  const { page, ev, shot } = s;
  await page.click('#btnPlay'); await page.waitForTimeout(600); await s.skipTrans();
  await page.getByText('LOGROS', { exact: true }).first().click({ timeout: 3000 }).catch((e) => console.log('logros', e.message.slice(0, 60)));
  await page.waitForTimeout(600); await shot('s11_01_achievements');
  console.log('ach open vis', await s.visible(), await s.state());
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  console.log('after Esc from achievements', await s.visible(), await s.state());
  if ((await s.state()) !== 'tree') { await page.click('#btnPlay'); await page.waitForTimeout(600); await s.skipTrans(); }
  await page.click('#treeStats', { timeout: 3000 }); await page.waitForTimeout(500); await shot('s11_02_stats');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  // daltónico + partida con Custodios (escala 2): forzar Custodios cerca
  await ev(() => { V.game.save.settings.colorblind = true; V.game.applySettings(); });
  await page.keyboard.press('Space'); await page.waitForTimeout(500); await s.bot();
  await page.waitForTimeout(7000);
  await ev(() => { const r = V.game.run; for (let i = 0; i < 4; i++) r.spawnAnti(); });
  await page.waitForTimeout(1500); await shot('s11_03_colorblind_custodians');
  await ev(() => { V.game.save.settings.colorblind = false; V.game.applySettings(); });
  await ev(() => { const r = V.game.run; for (let i = 0; i < 4; i++) r.spawnAnti(); });
  await page.waitForTimeout(1500); await shot('s11_04_normal_custodians');
  // ¿hay indicador en el borde para Custodios fuera de pantalla?
  const info = await ev(() => { const r = V.game.run; const { W, H } = V.game.size; return r.objs.filter((o) => o.kind === 'anti' && !o.dead).map((o) => ({ sx: Math.round(W / 2 + (o.x - r.x) * r.zoom), sy: Math.round(H / 2 + (o.y - r.y) * r.zoom), s: +(o.s * r.zoom).toFixed(1) })); });
  console.log('custodians on screen px', JSON.stringify(info));
  console.log('errors', s.errors.filter((e) => !e.includes('404')));
  await s.close();
})();
