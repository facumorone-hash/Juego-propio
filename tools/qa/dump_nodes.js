// Vuelca los nodos del árbol (nombre, descripción, efecto por nivel, coste) usando el código del juego en Node.
global.window = global; global.V = {};
global.localStorage = { getItem: () => null, setItem: () => {} };
const path = require('path'); const js = (f) => path.join(__dirname, '..', '..', 'js', f);
require(js('config.js')); require(js('core.js')); require(js('i18n.js')); require(js('strings-gameplay.js')); require(js('upgrades.js'));
const V = global.V;
if (V.setLang) V.setLang('es');
let tot = 0;
for (const n of V.NODES) {
  const costs = []; for (let l = 0; l < n.max; l++) costs.push(V.cost(n, l)); tot += costs.reduce((a, b) => a + b, 0);
  const fx = []; for (let l = 0; l <= n.max; l++) { try { fx.push(V.fxText(n, l)); } catch (e) { fx.push('ERR'); } }
  console.log(`${n.id} [${n.b}] req=${n.req || 0} max=${n.max} | ${V.nodeName ? V.nodeName(n.id) : ''} — ${V.nodeDesc ? V.nodeDesc(n.id) : ''}\n    fx: ${fx.join(' | ')}\n    cost: ${costs.join(', ')}`);
}
console.log('total cost', tot, 'nodes', V.NODES.length, 'levels', V.NODES.reduce((a, n) => a + n.max, 0));
