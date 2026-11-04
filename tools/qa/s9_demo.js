// Escenario 9: build de demo (Next Fest): llegar a la escala 2 y ver la pantalla de fin de demo.
const Q = require('./lib');
const saves = require('./saves.json');
(async () => {
  const sv = JSON.parse(JSON.stringify(saves['2'])); sv.record = 1; delete sv.recordRun[2];
  sv.seenLogs = ['p0','p1','p2','c1a','c1b','c1c','c1d'];
  const s = await Q.open({ w: 1280, h: 800, save: sv });
  const { page, ev, shot } = s;
  await ev(() => { V.CONFIG.demo = true; V.CONFIG.build = 'demo'; });
  await page.click('#btnPlay'); await page.waitForTimeout(400); await s.skipTrans();
  await page.keyboard.press('Space'); await page.waitForTimeout(400); await s.bot(); await page.waitForTimeout(1500); await ev(() => { const r = V.game.run; r.mass = 39 * 39; r.updateR(); });
  for (let i = 0; i < 300; i++) { const st = await s.state(); if (st !== 'run' && st !== 'ending') break; await page.waitForTimeout(200); }
  await page.waitForTimeout(1200);
  console.log('state', await s.state(), await s.visible(), JSON.stringify(await ev(() => ({ rec: V.game.save.record }))));
  await shot('s9_00_results'); await page.click('#btnUpgrade'); await page.waitForTimeout(800); console.log('after upgrade', await s.visible()); await shot('s9_01_demo_end');
  console.log(await ev(() => document.getElementById('demoEnd').innerText));
  await page.click('#btnDemoKeep').catch((e) => console.log('keep', e.message.slice(0, 80))); await page.waitForTimeout(800);
  console.log('after keep', await s.state(), await s.visible());
  await s.skipTrans(); await shot('s9_02_after_keep');
  console.log('errors', s.errors.filter((e) => !e.includes('404')));
  await s.close();
})();
