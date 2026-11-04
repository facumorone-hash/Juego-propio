// Árbol de mejoras: datos, cálculo de estadísticas y costes.
(function () {
  const V = globalThis.V;

  V.BRANCHES = {
    core: { color: '#ece8ff', angle: 0 },
    hunger: { color: '#ff9a3c', angle: -90 },
    gravity: { color: '#4fb3ff', angle: -30 },
    stability: { color: '#47f0a0', angle: 30 },
    tidal: { color: '#ff5470', angle: 90 },
    cosmos: { color: '#b98bff', angle: 150 },
    origin: { color: '#ffd966', angle: 210 },
  };

  // op: 'pct' suma per*lvl a un multiplicador base 1 · 'mul' multiplica por per^lvl · 'add' suma per*lvl
  // u (formato de efecto): p=porcentaje, m=reducción %, n=número, x=multiplicador, f=desbloqueo
  const N = [];
  function n(id, b, d, l, p, max, cost, g, stat, op, per, u, req) {
    N.push({ id, b, d, l, p, max, cost, g, stat, op, per, u, req: req || 0 });
  }
  n('core', 'core', 0, 0, null, 1, 0, 1, null, 'none', 0, 'f');

  // HAMBRE — materia y masa
  n('h1', 'hunger', 1, 0, 'core', 5, 6, 1.55, 'massGainMul', 'pct', 0.12, 'p');
  n('h2', 'hunger', 2, -1, 'h1', 5, 14, 1.6, 'matterMul', 'pct', 0.2, 'p');
  n('h3', 'hunger', 2, 1, 'h1', 4, 45, 1.9, 'eatRatio', 'add', 0.04, 'p');
  n('h4', 'hunger', 3, 0, 'h2', 3, 220, 3, 'combo', 'add', 5, 'n', 1);
  n('h5', 'hunger', 4, -1, 'h4', 5, 1500, 1.85, 'matterMul2', 'pct', 0.3, 'p');
  n('h6', 'hunger', 4, 1, 'h4', 5, 4000, 1.9, 'massGainMul2', 'pct', 0.15, 'p');
  n('h7', 'hunger', 5, 0, 'h6', 3, 40000, 3, 'eatRatio2', 'add', 0.05, 'p', 3);
  n('h8', 'hunger', 6, 0, 'h7', 5, 350000, 2.2, 'matterMul3', 'pct', 0.4, 'p', 4);

  // GRAVEDAD — alcance, fuerza, movilidad, pulso
  n('g1', 'gravity', 1, 0, 'core', 5, 8, 1.55, 'pullRange', 'pct', 0.15, 'p');
  n('g2', 'gravity', 2, -1, 'g1', 5, 20, 1.65, 'pullStr', 'pct', 0.2, 'p');
  n('g3', 'gravity', 2, 1, 'g1', 4, 35, 1.8, 'speed', 'pct', 0.1, 'p');
  n('g4', 'gravity', 3, 0, 'g2', 1, 400, 1, 'pulse', 'add', 1, 'f', 1);
  n('g5', 'gravity', 4, -1, 'g4', 4, 1200, 2.2, 'pulseLv', 'add', 1, 'n');
  n('g6', 'gravity', 4, 1, 'g4', 5, 6000, 2, 'pullRange2', 'pct', 0.2, 'p');
  n('g7', 'gravity', 5, 0, 'g6', 3, 60000, 2.6, 'pullStr2', 'pct', 0.4, 'p', 3);
  n('g8', 'gravity', 6, 0, 'g7', 3, 500000, 3, 'pullRange3', 'pct', 0.3, 'p', 4);
  // Cosecha exótica: los Custodios destruidos (pulso, lunas) sueltan materia y estabilidad.
  n('g9', 'gravity', 5, -1, 'g5', 3, 700, 2.4, 'antiLoot', 'add', 1, 'n', 4);

  // ESTABILIDAD — duración de la run
  n('s1', 'stability', 1, 0, 'core', 5, 6, 1.55, 'drainMul', 'mul', 0.93, 'm');
  n('s2', 'stability', 2, -1, 's1', 5, 25, 1.7, 'feed', 'add', 0.5, 'n');
  n('s3', 'stability', 2, 1, 's1', 4, 250, 2, 'armor', 'mul', 0.85, 'm', 1);
  n('s4', 'stability', 3, 0, 's2', 5, 1800, 1.9, 'drainMul2', 'mul', 0.93, 'm');
  n('s5', 'stability', 4, -1, 's4', 1, 15000, 1, 'revive', 'add', 1, 'f', 2);
  n('s6', 'stability', 4, 1, 's4', 4, 9000, 2.2, 'feed2', 'add', 0.6, 'n');
  n('s7', 'stability', 5, 0, 's6', 5, 80000, 2.3, 'drainMul3', 'mul', 0.92, 'm', 3);
  n('s8', 'stability', 6, 0, 's7', 3, 700000, 3, 'stabMax', 'pct', 0.3, 'p', 4);
  // Cáscara de neutrones: los anillos de púlsar quitan menos estabilidad.
  n('s9', 'stability', 3, 2, 's3', 4, 2600, 2.1, 'ringArmor', 'mul', 0.8, 'm', 3);

  // MAREA — romper cuerpos grandes
  n('t1', 'tidal', 1, 0, 'core', 5, 10, 1.55, 'tidal', 'pct', 0.25, 'p');
  n('t2', 'tidal', 2, -1, 't1', 3, 90, 2.2, 'frags', 'add', 1, 'n');
  n('t3', 'tidal', 2, 1, 't1', 3, 600, 3.5, 'orbitals', 'add', 1, 'n', 1);
  n('t4', 'tidal', 3, -1, 't2', 5, 3500, 1.9, 'tidal2', 'pct', 0.4, 'p');
  n('t5', 'tidal', 3, 1, 't3', 4, 12000, 2.3, 'orbSpeed', 'pct', 0.3, 'p');
  n('t6', 'tidal', 4, 0, 't4', 3, 50000, 2.8, 'breakBonus', 'pct', 0.5, 'p', 3);
  n('t7', 'tidal', 5, 0, 't6', 5, 300000, 2.3, 'tidal3', 'pct', 0.6, 'p', 4);
  // Rompenúcleos: más daño a púlsares y al Núcleo galáctico.
  n('t8', 'tidal', 4, 1, 't5', 4, 9000, 2.2, 'bossDmg', 'pct', 0.3, 'p', 4);

  // COSMOS — densidad, dorados, cometas
  n('c1', 'cosmos', 1, 0, 'core', 5, 12, 1.6, 'density', 'pct', 0.1, 'p');
  n('c2', 'cosmos', 2, -1, 'c1', 4, 150, 2.1, 'goldChance', 'add', 0.01, 'p');
  n('c3', 'cosmos', 2, 1, 'c1', 1, 900, 1, 'comets', 'add', 1, 'f', 1);
  n('c4', 'cosmos', 3, -1, 'c2', 5, 7000, 2, 'density2', 'pct', 0.12, 'p');
  n('c6', 'cosmos', 3, 1, 'c3', 3, 20000, 2.5, 'cometRate', 'pct', 0.5, 'p', 2);
  n('c5', 'cosmos', 4, -1, 'c4', 3, 40000, 2.8, 'goldMul', 'add', 5, 'x', 2);
  n('c7', 'cosmos', 5, 0, 'c5', 5, 250000, 2.3, 'density3', 'pct', 0.15, 'p', 4);

  // ORIGEN — tamaño inicial y meta
  n('o1', 'origin', 1, 0, 'core', 5, 12, 1.65, 'startR', 'pct', 0.08, 'p');
  n('o2', 'origin', 2, -1, 'o1', 5, 300, 2, 'echo', 'add', 0.1, 'p', 1);
  n('o3', 'origin', 2, 1, 'o1', 5, 1000, 2, 'startR2', 'pct', 0.1, 'p', 1);
  n('o4', 'origin', 3, 0, 'o3', 1, 10000, 1, 'antiEat', 'add', 1, 'f', 2);
  n('o5', 'origin', 4, 0, 'o4', 5, 90000, 2.4, 'startR3', 'pct', 0.12, 'p', 3);
  n('o6', 'origin', 5, 0, 'o5', 1, 2000000, 1, 'naked', 'add', 1, 'f', 4);

  V.NODES = N;
  V.NODE = {};
  N.forEach((nd) => (V.NODE[nd.id] = nd));

  // Posición en el lienzo del árbol
  N.forEach((nd) => {
    if (nd.b === 'core') { nd.x = 0; nd.y = 0; return; }
    const a = (V.BRANCHES[nd.b].angle * Math.PI) / 180;
    const dist = nd.d * 130;
    const px = Math.cos(a + Math.PI / 2), py = Math.sin(a + Math.PI / 2);
    nd.x = Math.cos(a) * dist + px * nd.l * 100;
    nd.y = Math.sin(a) * dist + py * nd.l * 100;
  });

  // Multiplicador por profundidad: las ramas profundas son la meta a largo plazo.
  const DEPTH = [1, 1, 1.5, 2.2, 7, 55, 160];
  V.cost = (nd, lvl) => Math.ceil(nd.cost * DEPTH[nd.d] * Math.pow(nd.g, lvl));

  V.isVisible = (nd, levels) => !nd.p || (levels[nd.p] || 0) > 0;
  V.isUnlocked = (nd, record) => record >= nd.req;

  V.fxText = function (nd, lvl) {
    if (lvl <= 0 && nd.u !== 'f') return '—';
    switch (nd.u) {
      case 'p': return '+' + Math.round(nd.per * lvl * 100) + '%';
      case 'm': return '-' + Math.round((1 - Math.pow(nd.per, lvl)) * 100) + '%';
      case 'n': return '+' + +(nd.per * lvl).toFixed(2);
      case 'x': return '+x' + nd.per * lvl;
      case 'f': return lvl > 0 ? '✓' : '—';
    }
    return '';
  };

  V.computeStats = function (levels) {
    const s = {
      massGainMul: 1, massGainMul2: 1, matterMul: 1, matterMul2: 1, matterMul3: 1,
      eatRatio: 0.8, eatRatio2: 0, combo: 0,
      pullRange: 1, pullRange2: 1, pullRange3: 1, pullStr: 1, pullStr2: 1, speed: 1, pulse: 0, pulseLv: 0,
      drainMul: 1, drainMul2: 1, drainMul3: 1, feed: 0, feed2: 0, armor: 1, revive: 0, stabMax: 1,
      tidal: 1, tidal2: 1, tidal3: 1, frags: 0, orbitals: 0, orbSpeed: 1, breakBonus: 1,
      density: 1, density2: 1, density3: 1, goldChance: 0.006, goldMul: 10, comets: 0, cometRate: 1,
      echo: 0, startR: 1, startR2: 1, startR3: 1, antiEat: 0, naked: 0,
      ringArmor: 1, bossDmg: 1, antiLoot: 0,
    };
    for (const nd of N) {
      const lv = levels[nd.id] || 0;
      if (!lv || !nd.stat) continue;
      if (nd.op === 'pct' || nd.op === 'add') s[nd.stat] += nd.per * lv;
      else if (nd.op === 'mul') s[nd.stat] *= Math.pow(nd.per, lv);
    }
    return {
      startR: 8 * s.startR * s.startR2 * s.startR3,
      massGain: 0.085 * s.massGainMul * s.massGainMul2,
      matterMul: s.matterMul * s.matterMul2 * s.matterMul3 * (s.naked ? 1.5 : 1),
      eatRatio: s.eatRatio + s.eatRatio2 + (s.naked ? 0.05 : 0),
      combo: s.combo,
      pullRange: 3.0 * s.pullRange * s.pullRange2 * s.pullRange3,
      pullStr: s.pullStr * s.pullStr2,
      speed: s.speed,
      pulse: s.pulse,
      pulseCd: 9 * Math.pow(0.86, s.pulseLv),
      pulseRad: Math.pow(1.15, s.pulseLv),
      drain: 7 * s.drainMul * s.drainMul2 * s.drainMul3,
      feed: s.feed + s.feed2,
      armor: s.armor,
      revive: s.revive,
      stabMax: 100 * s.stabMax,
      tidal: s.tidal * s.tidal2 * s.tidal3,
      frags: s.frags,
      orbitals: s.orbitals,
      orbSpeed: s.orbSpeed,
      breakBonus: s.breakBonus,
      density: s.density * s.density2 * s.density3,
      goldChance: s.goldChance,
      goldMul: s.goldMul,
      comets: s.comets,
      cometRate: s.cometRate,
      echo: s.echo,
      antiEat: s.antiEat,
      ringArmor: s.ringArmor,
      bossDmg: s.bossDmg,
      antiLoot: s.antiLoot,
    };
  };
})();
