// Escenario 5: casos límite (pausas raras, dobles pulsaciones, redimensionar, menús durante transiciones).
const Q = require('./lib');
const saves = require('./saves.json');
const log = (...a) => console.log(...a);
(async () => {
  const sv = JSON.parse(JSON.stringify(saves['2']));
  sv.seenLogs = ['p0', 'p1', 'p2', 'c1a', 'c1b', 'c1c', 'c1d'];
  const s = await Q.open({ w: 1280, h: 800, save: sv });
  const { page, ev, shot } = s;
  const st = async (label) => { const v = await ev(() => ({ state: V.game.state, paused: V.game.paused, trans: V.game.transActive(), run: !!V.game.run, vis: [...document.querySelectorAll('#ui > .screen, #trans, #treebar')].filter((e) => !e.classList.contains('hidden')).map((e) => e.id).join(',') })); log(label.padEnd(44), JSON.stringify(v)); return v; };

  // 1. JUGAR → árbol con transmisiones pendientes. Pulsar ESPACIO muchas veces rápido.
  await page.click('#btnPlay'); await page.waitForTimeout(400);
  await st('1a tree w/ pending trans');
  for (let i = 0; i < 6; i++) { await page.keyboard.press('Space'); await page.waitForTimeout(40); }
  await st('1b after 6x Space fast');
  await shot('s5_01_space_spam');
  await s.skipTrans();
  // 2. Clic en MENÚ y ESC durante el árbol
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  await st('2a Esc in tree');
  await page.click('#btnPlay', { timeout: 2000 }).catch(() => log('   btnPlay not clickable')); await page.waitForTimeout(500);
  await st('2b back to tree');
  // 3. Doble clic en INICIAR
  await page.dblclick('#treeStart').catch(async () => { log('no #btnTreePlay'); await page.keyboard.press('Space'); });
  await page.waitForTimeout(500);
  const r1 = await ev(() => V.game.run && V.game.run.t);
  await st('3 dblclick INICIAR');
  // 4. Pausa con Esc, luego Ajustes desde pausa, cambiar idioma a en, volver
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await st('4a Esc pause');
  await shot('s5_02_pause');
  await page.click('#btnPauseSettings', { timeout: 2000 }).catch(() => log('   pause settings not clickable')); await page.waitForTimeout(300);
  await st('4b settings from pause');
  await shot('s5_03_settings_from_pause');
  await page.selectOption('#setLang', 'en', { timeout: 2000 }).catch(() => log('   setLang not selectable')); await page.waitForTimeout(300);
  await shot('s5_04_settings_lang_en');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await st('4c Esc from settings (from pause)');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await st('4d Esc again');
  const tBefore = await ev(() => V.game.run && V.game.run.t);
  await page.waitForTimeout(800);
  const tAfter = await ev(() => V.game.run && V.game.run.t);
  log('   run time advancing while in that state?', tBefore, '->', tAfter);
  await page.click('#btnResume', { timeout: 2000 }).catch(() => log('   resume not clickable'));
  await page.waitForTimeout(300);
  await st('4e resume');
  await shot('s5_05_after_resume_en');
  await page.selectOption('#setLang', 'es').catch(() => {});
  await ev(() => { V.game.save.settings.lang = 'es'; V.setLang('es'); V.game.applyI18n(); });
  // 5. Redimensionar durante la run
  for (const [w, h] of [[800, 600], [1920, 1080], [375, 812], [1280, 800]]) {
    await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(400);
    await shot(`s5_06_resize_run_${w}x${h}`);
  }
  await st('5 after resizes');
  // 6. Morir y, durante la animación de "ending", pulsar Esc / Espacio / R
  await s.bot();
  await ev(() => { V.game.run.stab = 0.01; });
  await page.waitForTimeout(150);
  await st('6a dying');
  await page.keyboard.press('Escape'); await page.keyboard.press('Space'); await page.keyboard.press('KeyR');
  await page.waitForTimeout(1600);
  await st('6b after Esc+Space+R during ending');
  await shot('s5_07_after_ending_keys');
  // 7. Resultados: Espacio dos veces rápido (árbol → ¿run inmediata?)
  if ((await s.state()) === 'results') {
    await page.keyboard.press('Space'); await page.waitForTimeout(60); await page.keyboard.press('Space');
    await page.waitForTimeout(600);
    await st('7 results: Space,Space fast');
  }
  if ((await s.state()) === 'run') { await ev(() => { V.game.run.stab = 0.01; }); await page.waitForTimeout(2000); }
  // 8. Resultados: R y luego Esc inmediato (pausa en el primer frame)
  await st('8a');
  if ((await s.state()) === 'results') { await page.keyboard.press('KeyR'); await page.keyboard.press('Escape'); await page.waitForTimeout(400); await st('8b R then Esc'); await shot('s5_08_r_then_esc'); }
  // 9. Pausa → TERMINAR RUN y → SALIR AL MENÚ
  if ((await s.state()) === 'run') {
    if (!(await ev(() => V.game.paused))) await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    const m0 = await ev(() => V.game.save.matter);
    await page.click('#btnAbandon', { timeout: 2000 }).catch(() => log('   abandon not clickable')); await page.waitForTimeout(1500);
    await st('9a abandon');
    log('   matter before/after abandon', m0, await ev(() => V.game.save.matter));
  }
  // 10. Blur de la ventana durante la run
  if ((await s.state()) === 'results') { await page.keyboard.press('KeyR'); await page.waitForTimeout(400); }
  await ev(() => window.dispatchEvent(new Event('blur'))); await page.waitForTimeout(200);
  await st('10 blur during run');
  // 11. Salir al menú desde pausa y luego JUGAR
  if (await ev(() => V.game.paused)) { await page.click('#btnQuitMenu', { timeout: 2000 }).catch(() => log('   quitmenu not clickable')); await page.waitForTimeout(800); await st('11a quit to menu'); await shot('s5_09_quit_menu'); }
  // 12. Archivo / Datos / Logros desde el árbol y con ESC
  await page.click('#btnPlay', { timeout: 2000 }).catch(() => log('   btnPlay not clickable (12)')); await page.waitForTimeout(600); await s.skipTrans();
  for (const id of ['treeArchive', 'treeStats']) {
    const ok = await page.click('#' + id, { timeout: 1500 }).then(() => true).catch(() => false);
    if (!ok) continue;
    await page.waitForTimeout(400); await shot('s5_10_' + id); await st('12 open ' + id);
    await page.keyboard.press('Escape'); await page.waitForTimeout(300); await st('12 Esc ' + id);
  }
  log('errors', s.errors.filter((e) => !e.includes('404')));
  await s.close();
})();
