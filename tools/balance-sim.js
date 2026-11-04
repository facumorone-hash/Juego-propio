// Simulador de balance: juega runs con un bot y compra mejoras como un jugador "promedio".
// Uso:
//   node tools/balance-sim.js            → semillas 1, 2 y 3 + tabla resumen
//   node tools/balance-sim.js 7 42 99    → semillas elegidas
//   node tools/balance-sim.js -v 5       → una semilla con el detalle de cada run
const path = require('path');
const js = (f) => path.join(__dirname, '..', 'js', f);

// Generador determinista (mulberry32): reemplaza Math.random para que cada semilla sea reproducible.
let seedState = 1;
function mulberry32() {
  seedState |= 0; seedState = (seedState + 0x6d2b79f5) | 0;
  let t = Math.imul(seedState ^ (seedState >>> 15), 1 | seedState);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
Math.random = mulberry32;

require(js('core.js'));
require(js('upgrades.js'));
require(js('run.js'));
const V = globalThis.V;

const DT = 1 / 30;
const MAX_RUNS = 500;

function simulate(seed, verbose) {
  seedState = seed * 2654435761;
  const save = { matter: 0, levels: { core: 1 }, record: 0 };
  let played = 0;
  const firstReach = {};
  let bossFirst = null, bossTries = 0, victory = null;

  function buyAll() {
    for (;;) {
      let best = null, bc = Infinity;
      for (const nd of V.NODES) {
        const l = save.levels[nd.id] || 0;
        if (nd.id === 'core' || l >= nd.max || !V.isVisible(nd, save.levels) || !V.isUnlocked(nd, save.record)) continue;
        const c = V.cost(nd, l);
        if (c < bc) { bc = c; best = nd; }
      }
      if (!best || bc > save.matter) return;
      save.matter -= bc;
      save.levels[best.id] = (save.levels[best.id] || 0) + 1;
    }
  }

  for (let i = 1; i <= MAX_RUNS; i++) {
    const run = new V.Run(V.computeStats(save.levels), { headless: true, vw: 1600, vh: 900 });
    let bt = 0;
    while (!run.over && run.t < 900) {
      bt -= DT;
      if (bt <= 0) { run.bot(); bt = 0.1; }
      run.update(DT);
    }
    played += run.t + 8; // +8 s de pantalla de mejoras
    save.matter += Math.floor(run.matter);
    if (run.milestone > save.record) {
      for (let k = save.record + 1; k <= run.milestone; k++) firstReach[k] = { run: i, min: played / 60 };
      save.record = run.milestone;
    }
    let bossInfo = '';
    if (run.bossSpawned) {
      bossTries++;
      if (!bossFirst) bossFirst = { run: i, min: played / 60 };
      const hp = run.boss ? Math.max(0, run.boss.hp / run.boss.maxHp) : 0;
      bossInfo = ` | jefe ${run.victory ? 'DERROTADO' : 'vida ' + (hp * 100).toFixed(0) + '%'} en ${run.bossT.toFixed(0)}s`;
    }
    buyAll();
    if (verbose && (i <= 10 || i % 10 === 0 || run.bossSpawned))
      console.log(`run ${String(i).padStart(3)} | ${run.t.toFixed(0).padStart(4)}s | r ${run.maxR.toFixed(0).padStart(5)} | m${run.milestone} | +${V.fmt(run.matter).padStart(7)} | total ${(played / 60).toFixed(1)} min${bossInfo}`);
    if (run.victory) { victory = { run: i, min: played / 60 }; break; }
  }
  const owned = V.NODES.reduce((a, n) => a + (save.levels[n.id] || 0), 0), all = V.NODES.reduce((a, n) => a + n.max, 0);
  return { seed, firstReach, bossFirst, bossTries, victory, owned, all };
}

const args = process.argv.slice(2);
const verbose = args.includes('-v');
let seeds = args.filter((a) => /^\d+$/.test(a)).map(Number);
if (!seeds.length) seeds = verbose ? [1] : [1, 2, 3];

const results = seeds.map((s) => {
  if (verbose) console.log(`\n=== Semilla ${s} ===`);
  return simulate(s, verbose);
});

const f = (x) => (x ? (x.min.toFixed(1) + ' (r' + x.run + ')').padStart(13) : '            —');
console.log('\nMinuto (y número de run) en que el bot alcanza cada escala por primera vez:');
console.log('semilla |' + [1, 2, 3, 4, 5, 6].map((k) => ('esc ' + k).padStart(13)).join(' |') + ' |       VICTORIA | intentos jefe | niveles');
for (const r of results) {
  console.log(String(r.seed).padStart(7) + ' |' + [1, 2, 3, 4, 5, 6].map((k) => f(r.firstReach[k])).join(' |') + ' |  ' + f(r.victory) + ' | ' + String(r.bossTries).padStart(13) + ' | ' + r.owned + '/' + r.all);
}
const fails = results.filter((r) => !r.victory);
if (fails.length) { console.log('\nAVISO: sin victoria en ' + MAX_RUNS + ' runs para las semillas ' + fails.map((r) => r.seed).join(', ')); process.exitCode = 1; }
// Objetivo de diseño: el bot ve el final entre los minutos 40 y 55 (una persona tarda ~x1,7–2,2).
const WIN_MIN = 40, WIN_MAX = 55;
const off = results.filter((r) => r.victory && (r.victory.min < WIN_MIN || r.victory.min > WIN_MAX));
if (off.length) { console.log('\nAVISO: victoria fuera de ' + WIN_MIN + '–' + WIN_MAX + ' min en las semillas ' + off.map((r) => r.seed + ' (' + r.victory.min.toFixed(1) + ')').join(', ')); process.exitCode = 1; }
if (!fails.length && !off.length) console.log('\nOK: victoria entre los minutos ' + WIN_MIN + ' y ' + WIN_MAX + ' en todas las semillas.');
