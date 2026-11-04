// Escenario 3: partidas de mitad de juego desde un guardado realista (saves.json[key]).
// node tools/qa/s3_mid.js <key> [segundos] [ancho] [alto] [bot=1]
const Q = require('./lib');
const saves = require('./saves.json');
const key = process.argv[2] || '2', secs = +process.argv[3] || 60, W = +process.argv[4] || 1280, H = +process.argv[5] || 800;
const useBot = process.argv[6] !== '0';
(async () => {
  const sv = JSON.parse(JSON.stringify(saves[key]));
  // marcar historia como leída hasta este punto, para no bloquear con transmisiones
  sv.seenLogs = ['p0', 'p1', 'p2', 'c1a', 'c1b', 'c1c', 'c1d', 'c2a', 'c2b', 'c2c', 'c2d', 'c2e', 'c2f', 'c2g', 'c2h', 'c3a', 'c3b', 'c3c', 'c3d', 'c4a', 'c4b', 'c4c', 'c5a', 'c5b', 'c5c', 'c5d'];
  const s = await Q.open({ w: W, h: H, save: sv });
  const { page, ev, shot } = s;
  const tag = `s3_k${key}_${W}_`;
  await ev(() => { window.__ev = []; for (const k of ['hit', 'pulsar', 'swarm', 'milestone', 'boss', 'bossPhase', 'ring', 'break', 'revive', 'victory', 'bossDefeat']) V.bus.on('run:' + k, (e) => window.__ev.push({ k, t: V.game.run ? +V.game.run.t.toFixed(2) : -1, src: e && e.src, m: e && e.m })); });
  await page.click('#btnPlay'); await page.waitForTimeout(600);
  await s.skipTrans();
  await page.keyboard.press('Space'); await page.waitForTimeout(600);
  if (useBot) await s.bot();
  console.log('state', await s.state());
  let seen = 0, lastShot = -99, shots = 0;
  const t0 = Date.now();
  while (Date.now() - t0 < secs * 1000) {
    const st = await s.state();
    if (st !== 'run' && st !== 'ending') break;
    const evs = await ev(() => window.__ev);
    const info = await ev(() => { const r = V.game.run; return r && { t: r.t, r: r.r, m: r.milestone, stab: r.stab / r.stabMax, n: r.objs.length, anti: r.objs.filter((o) => o.kind === 'anti' && !o.dead).length, boss: r.boss && !r.boss.dead ? { hp: r.boss.hp / r.boss.maxHp, ph: r.boss.phase } : null }; });
    for (; seen < evs.length; seen++) {
      const e = evs[seen];
      if (e.k === 'break') continue;
      console.log('EV', JSON.stringify(e), 'stab', info && info.stab.toFixed(2));
      if (['pulsar', 'swarm', 'milestone', 'boss', 'bossPhase', 'revive'].includes(e.k) && shots < 30) { await page.waitForTimeout(e.k === 'pulsar' ? 300 : 700); await shot(`${tag}ev_${e.k}${e.m != null ? e.m : ''}_${Math.round(e.t)}`); shots++; }
    }
    if (info && info.t - lastShot > 12 && shots < 30) { lastShot = info.t; await shot(`${tag}t${Math.round(info.t)}`); shots++; console.log('INFO', JSON.stringify(info)); }
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(1500);
  console.log('final state', await s.state(), await s.visible());
  await shot(tag + 'end');
  console.log('run summary', JSON.stringify(await ev(() => ({ runs: V.game.save.runs, rec: V.game.save.record, matter: V.game.save.matter }))));
  console.log('errors', s.errors.filter((e) => !e.includes('404')));
  await s.close();
})();
