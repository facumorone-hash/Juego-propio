// Escenario 6: cambiar idioma desde la pausa (solo UI real) y comprobar textos al morir.
const Q = require('./lib');
const saves = require('./saves.json');
(async () => {
  const sv = JSON.parse(JSON.stringify(saves['1'])); sv.seenLogs = ['p0', 'p1', 'p2', 'c1a', 'c1b', 'c1c', 'c1d'];
  const s = await Q.open({ w: 1280, h: 800, save: sv });
  const { page, ev, shot } = s;
  await page.click('#btnPlay'); await page.waitForTimeout(500); await s.skipTrans();
  await page.click('#treeStart'); await page.waitForTimeout(500);
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await page.click('#btnPauseSettings'); await page.waitForTimeout(300);
  await page.selectOption('#setLang', 'en'); await page.waitForTimeout(200);
  console.log('T after en:', await ev(() => [V.lang, V.T ? V.T('rMatter') : '?']));
  await page.selectOption('#setLang', 'es'); await page.waitForTimeout(200);
  console.log('T after es:', await ev(() => [V.lang, V.T ? V.T('rMatter') : '?']));
  await shot('s6_01_settings_back_es');
  await page.click('#btnSetBack'); await page.waitForTimeout(200);
  await page.click('#btnResume'); await page.waitForTimeout(200);
  await ev(() => { V.game.run.stab = 0.01; });
  await page.waitForTimeout(2500);
  await shot('s6_02_results_after_lang_switch');
  console.log(await ev(() => document.getElementById('results').innerText));
  // ahora en inglés de verdad
  await page.click('#btnUpgrade'); await page.waitForTimeout(500);
  await ev(() => { V.game.save.settings.lang = 'en'; });
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await page.click('#btnSettings'); await page.waitForTimeout(300);
  await page.selectOption('#setLang', 'en'); await page.waitForTimeout(200);
  await page.click('#btnSetBack'); await page.waitForTimeout(300);
  await shot('s6_03_menu_en');
  await page.click('#btnPlay'); await page.waitForTimeout(600);
  await shot('s6_04_tree_en');
  console.log('errors', s.errors.filter((e) => !e.includes('404')));
  await s.close();
})();
