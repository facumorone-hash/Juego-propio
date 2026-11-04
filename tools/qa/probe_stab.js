// Mide la curva de estabilidad (en Node, misma simulación) para un guardado de saves.json.
const path = require('path');
const js = (f) => path.join(__dirname, '..', '..', 'js', f);
require(js('core.js')); require(js('upgrades.js')); require(js('run.js'));
const V = globalThis.V; const saves = require('./saves.json');
for (const key of process.argv.slice(2)) {
  for (let rep = 0; rep < 3; rep++) {
    const run = new V.Run(V.computeStats(saves[key].levels), { headless: true, vw: 1280, vh: 800 });
    let bt = 0, next = 0; const row = [];
    let maxDrop = 0, prev = 1, prevT = 0;
    while (!run.over && run.t < 600) { bt -= 1 / 30; if (bt <= 0) { run.bot(); bt = 0.1; } run.update(1 / 30);
      if (run.t >= next) { const f = run.stab / run.stabMax; row.push(Math.round(f * 100)); if (next > 0) maxDrop = Math.max(maxDrop, prev - f); prev = f; next += 2; } }
    console.log(`k${key} rep${rep}: dur ${run.t.toFixed(1)}s m${run.milestone} maxDrop/2s ${(maxDrop * 100).toFixed(0)}% | ` + row.join(' '));
  }
}
