// Genera guardados realistas (bot + compra la mejora más barata) al alcanzar cada escala por primera vez.
// Salida: tools/qa/saves.json  { "1": save, ..., "6": save, "boss": save (antes de la run que vence) }
const path = require('path'); const fs = require('fs');
let seedState = 7;
Math.random = function () { seedState |= 0; seedState = (seedState + 0x6d2b79f5) | 0; let t = Math.imul(seedState ^ (seedState >>> 15), 1 | seedState); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const js = (f) => path.join(__dirname, '..', '..', 'js', f);
require(js('core.js')); require(js('upgrades.js')); require(js('run.js'));
const V = globalThis.V;
const save = { v: 1, matter: 0, levels: { core: 1 }, record: 0, recordRun: {}, runs: 0, totalEaten: 0, playTime: 0, seenLogs: [], victory: false };
const out = {};
function buyAll() { for (;;) { let best = null, bc = Infinity; for (const nd of V.NODES) { const l = save.levels[nd.id] || 0; if (nd.id === 'core' || l >= nd.max || !V.isVisible(nd, save.levels) || !V.isUnlocked(nd, save.record)) continue; const c = V.cost(nd, l); if (c < bc) { bc = c; best = nd; } } if (!best || bc > save.matter) return; save.matter -= bc; save.levels[best.id] = (save.levels[best.id] || 0) + 1; } }
for (let i = 1; i <= 300; i++) {
  const pre = JSON.parse(JSON.stringify(save));
  const run = new V.Run(V.computeStats(save.levels), { headless: true, vw: 1600, vh: 900 });
  let bt = 0; while (!run.over && run.t < 900) { bt -= 1 / 30; if (bt <= 0) { run.bot(); bt = 0.1; } run.update(1 / 30); }
  save.runs++; save.playTime += run.t + 8; save.matter += Math.floor(run.matter); save.totalEaten += run.eaten;
  if (run.bossSpawned && !out.boss) out.boss = pre;
  if (run.victory) { out.win = pre; break; }
  if (run.milestone > save.record) { for (let k = save.record + 1; k <= run.milestone; k++) save.recordRun[k] = save.runs; save.record = run.milestone; }
  buyAll();
  for (let k = 1; k <= 6; k++) if (save.record >= k && !out[k]) out[k] = JSON.parse(JSON.stringify(save));
}
fs.writeFileSync(path.join(__dirname, 'saves.json'), JSON.stringify(out, null, 1));
console.log(Object.keys(out).map((k) => k + ':r' + out[k].runs + '/rec' + out[k].record).join(' '));
