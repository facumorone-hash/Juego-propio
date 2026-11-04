const Q = require('./lib');
const saves = require('./saves.json');
(async () => {
  const sv = JSON.parse(JSON.stringify(saves['3'])); sv.seenLogs = ['p0','p1','p2','c1a','c1b','c1c','c1d','c2a','c2b','c2c','c2d','c2e','c2f','c2g','c2h','c3a','c3b','c3c','c3d'];
  const s = await Q.open({ w: 1280, h: 800, save: sv });
  await s.page.click('#btnPlay'); await s.page.waitForTimeout(600); await s.skipTrans();
  const btns = await s.ev(() => [...document.querySelectorAll('#treebar button')].map((b) => b.id + ':' + b.textContent));
  console.log(btns);
  const ach = await s.ev(() => { const b = [...document.querySelectorAll('#treebar button')].find((b) => /LOGROS/i.test(b.textContent)); if (b) b.click(); return !!b; });
  await s.page.waitForTimeout(700); await s.shot('s12_achievements');
  console.log('opened', ach, await s.ev(() => document.getElementById('achScreen') && document.getElementById('achScreen').innerText.slice(0, 600)));
  await s.page.click('#treeStats', { timeout: 2000 }).catch(() => {});
  await s.ev(() => document.getElementById('achClose').click()); await s.page.waitForTimeout(300);
  await s.page.click('#treeStats'); await s.page.waitForTimeout(500); await s.shot('s12_stats');
  await s.close();
})();
