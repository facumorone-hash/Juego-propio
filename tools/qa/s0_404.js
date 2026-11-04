const Q = require('./lib');
(async () => {
  const s = await Q.open({ w: 1280, h: 800 });
  const bad = [];
  s.page.on('response', (r) => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
  await s.page.reload(); await s.page.waitForTimeout(1500);
  console.log(bad);
  await s.close();
})();
