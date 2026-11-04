// Escenario 4: jefe y final. Guardado 'win' (todo comprado como el bot), salta al radio 1590 y pelea.
// node tools/qa/s4_boss.js [ancho] [alto] [modo: fight|kill]
const Q = require('./lib');
const saves = require('./saves.json');
const W = +process.argv[2] || 1280, H = +process.argv[3] || 800, mode = process.argv[4] || 'kill';
(async () => {
  const sv = JSON.parse(JSON.stringify(saves.win));
  // historia parcialmente leída: deja c5c y c5d sin leer para comprobar el "si ganas rápido se muestran antes del final"
  sv.seenLogs = ['p0', 'p1', 'p2', 'c1a', 'c1b', 'c1c', 'c1d', 'c2a', 'c2b', 'c2c', 'c2d', 'c2e', 'c2f', 'c2g', 'c2h', 'c3a', 'c3b', 'c3c', 'c3d', 'c4a', 'c4b', 'c4c', 'c5a', 'c5b'];
  sv.record = 5;
  const s = await Q.open({ w: W, h: H, save: sv });
  const { page, ev, shot } = s;
  const tag = `s4_${W}_`;
  await page.click('#btnPlay'); await page.waitForTimeout(500);
  const pre = await s.skipTrans();
  console.log('trans before run', pre.length);
  await page.keyboard.press('Space'); await page.waitForTimeout(500);
  await s.bot();
  await page.waitForTimeout(1500);
  await ev(() => { const r = V.game.run; r.mass = 1590 * 1590; r.updateR(); });
  await page.waitForTimeout(300);
  await shot(tag + '01_boss_spawn');
  for (let i = 0; i < 6; i++) { await page.waitForTimeout(1200); await shot(tag + '02_boss_intro_' + i); }
  const bossInfo = await ev(() => { const r = V.game.run, b = r.boss; const { W, H } = V.game.size; return b && { sx: W / 2 + (b.x - r.x) * r.zoom, sy: H / 2 + (b.y - r.y) * r.zoom, sr: b.s * r.zoom, pr: r.r * r.zoom, zoom: r.zoom }; });
  console.log('boss on screen', JSON.stringify(bossInfo));
  if (mode === 'fight') {
    for (let i = 0; i < 60; i++) {
      await page.waitForTimeout(2000);
      const st = await s.state();
      const inf = await ev(() => { const r = V.game.run; return r && { t: r.t.toFixed(0), stab: (r.stab / r.stabMax).toFixed(2), hp: r.boss ? (r.boss.hp / r.boss.maxHp).toFixed(2) : null, ph: r.boss && r.boss.phase }; });
      console.log(st, JSON.stringify(inf));
      if (i % 4 === 0) await shot(tag + '03_fight_' + i);
      if (st !== 'run') break;
    }
  } else {
    await ev(() => { const b = V.game.run.boss; b.hp = b.maxHp * 0.6; });
    await page.waitForTimeout(2500); await shot(tag + '03_phase2');
    await ev(() => { const b = V.game.run.boss; b.hp = b.maxHp * 0.25; });
    await page.waitForTimeout(2500); await shot(tag + '04_phase3');
    await ev(() => { const b = V.game.run.boss; b.hp = 1; });
  }
  // victoria
  for (let i = 0; i < 40; i++) { const st = await s.state(); if (st === 'finale' || st === 'results') break; await page.waitForTimeout(250); }
  console.log('state', await s.state());
  await shot(tag + '05_defeat_moment');
  for (let i = 0; i < 6; i++) { await page.waitForTimeout(700); await shot(tag + '06_finale_' + i); }
  // transmisiones del final: leer con el ratón
  const texts = [];
  for (let i = 0; i < 30; i++) {
    if (!(await ev(() => V.game.transActive()))) break;
    await page.waitForTimeout(2500);
    texts.push(await ev(() => document.getElementById('tFrom').textContent + ' :: ' + document.getElementById('tText').textContent));
    if (i < 12) await shot(tag + '07_final_trans_' + i);
    await page.mouse.click(W / 2, H / 2); await page.waitForTimeout(150);
    if ((await ev(() => V.game.transActive()))) { const full = await ev(() => document.getElementById('tText').textContent); await page.mouse.click(W / 2, H / 2); }
    await page.waitForTimeout(200);
  }
  console.log(texts.join('\n'));
  await page.waitForTimeout(1500);
  console.log('after finale', await s.state(), await s.visible());
  await shot(tag + '08_victory_screen');
  console.log('victory text:', await ev(() => document.getElementById('victory').innerText));
  await page.click('#btnVictoryCredits').catch((e) => console.log('no credits btn', e.message));
  await page.waitForTimeout(800); await shot(tag + '09_credits');
  console.log('credits:', await ev(() => document.getElementById('credList').innerText.slice(0, 400)));
  await page.click('#btnCredBack').catch(() => {}); await page.waitForTimeout(500);
  console.log('after credits back', await s.visible());
  await page.click('#btnVictory').catch((e) => console.log('btnVictory', e.message)); await page.waitForTimeout(1200);
  const post = await s.skipTrans();
  console.log('post-victory tree trans', post);
  await shot(tag + '10_tree_after_victory');
  // jugar otra run post-final
  await page.keyboard.press('Space'); await page.waitForTimeout(800); await s.bot();
  await page.waitForTimeout(8000); await shot(tag + '11_postgame_run');
  console.log('postgame state', await s.state(), JSON.stringify(await ev(() => ({ v: V.game.save.victory, runs: V.game.save.runs, seen: V.game.save.seenLogs.length }))));
  console.log('errors', s.errors.filter((e) => !e.includes('404')));
  await s.close();
})();
