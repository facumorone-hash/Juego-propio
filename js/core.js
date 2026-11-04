// Voidling — utilidades base compartidas (funciona en navegador y en Node para simulación)
(function () {
  const V = (globalThis.V = globalThis.V || {});
  V.TAU = Math.PI * 2;

  // Bus de eventos: los módulos (logros, audio, entrada, Steam...) se suscriben sin tocar main.js.
  // Eventos: ver docs/ARQUITECTURA.md
  const handlers = {};
  V.bus = {
    on(ev, fn) { (handlers[ev] = handlers[ev] || []).push(fn); },
    emit(ev, data) {
      const hs = handlers[ev];
      if (!hs) return;
      for (const f of hs) { try { f(data); } catch (e) { console.error('[bus ' + ev + ']', e); } }
    },
  };
  V.rand = (a, b) => a + Math.random() * (b - a);
  V.clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  V.lerp = (a, b, t) => a + (b - a) * t;

  const UNITS = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp'];
  V.fmt = function (n) {
    n = Math.floor(n);
    if (n < 1000) return String(n);
    let i = -1;
    while (n >= 1000 && i < UNITS.length - 1) { n /= 1000; i++; }
    return (n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : Math.floor(n)) + UNITS[i];
  };
  V.fmtTime = function (sec) {
    sec = Math.floor(sec);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const mm = String(m).padStart(2, '0'), ss = String(s).padStart(2, '0');
    return h > 0 ? h + ':' + mm + ':' + ss : m + ':' + ss;
  };

  // Escalas cósmicas: se alcanzan por radio absoluto del agujero dentro de una run.
  V.MILESTONES = [
    { r: 0, color: '#9fb3d9' },
    { r: 16, color: '#c9b8a0' },
    { r: 40, color: '#d9a066' },
    { r: 80, color: '#d6dbe6' },
    { r: 210, color: '#6fc2ff' },
    { r: 580, color: '#ffd27a' },
    { r: 1600, color: '#e08bff' },
  ];
  V.FINAL_MILESTONE = V.MILESTONES.length - 1;
  V.milestoneAt = function (r) {
    let k = 0;
    for (let i = 0; i < V.MILESTONES.length; i++) if (r >= V.MILESTONES[i].r) k = i;
    return k;
  };

  // El tipo visual de un cuerpo depende de su tamaño absoluto: al crecer, el universo "cambia".
  V.TYPES = [
    ['dust', 5], ['rock', 14], ['asteroid', 40], ['moon', 100],
    ['planet', 260], ['star', 700], ['nebula', Infinity],
  ];
  V.typeFor = function (s) {
    for (let i = 0; i < V.TYPES.length; i++) if (s < V.TYPES[i][1]) return V.TYPES[i][0];
    return 'nebula';
  };
  V.TYPE_COLORS = {
    dust: '#9fb3d9', rock: '#c2a27f', asteroid: '#b09a86', moon: '#d6dbe6',
    planet: '#6fc2ff', star: '#ffd27a', nebula: '#e08bff',
    pulsar: '#bff4ff', boss: '#ffe6a0',
  };

  // ---------- Peligros y jefe (constantes de balance; las usa run.js) ----------
  // Distancias en múltiplos del radio que indica cada campo; tiempos en segundos.
  // Los Custodios (antimateria) aparecen entre estas escalas. Desde la escala 5 dejan de atacar
  // ("Ya no te detendremos. Demuestra que eres suficiente").
  V.CUSTODIANS = { fromM: 2, fromR: 28, lastM: 4, dmg: 13 };

  // Púlsar: estrella de neutrones casi estática que emite anillos con dos huecos (donde apuntaban sus haces).
  V.PULSAR = {
    fromM: 3,             // escala mínima de la run
    first: [9, 14],       // primer púlsar tras cumplir la condición
    every: [26, 38],      // intervalo entre púlsares
    maxAlive: 2,
    size: [1.5, 2.1],     // × radio del agujero al aparecer
    hpK: 9,               // vida = s² × hpK (un cuerpo normal tiene s²)
    firstRing: 3.2,       // margen antes del primer anillo
    period: 3,            // un anillo cada ~3 s
    charge: 0.75,         // aviso visual antes de cada anillo
    range: 6.5,           // alcance del anillo × s
    ringTime: 1.7,        // segundos hasta alcanzar el alcance máximo
    gapW: 0.62,           // ancho angular (rad) de cada hueco
    dmg: 8,               // estabilidad por anillo (× armadura × blindaje de anillos)
    loot: 8,              // materia al romperlo: × la de devorar un cuerpo de su tamaño
    frags: 6,
  };

  // Enjambre de Custodios (escala 4): orbitan a distancia y luego embisten en ráfaga.
  V.SWARM = {
    fromM: 4,
    first: [7, 11],
    every: [18, 26],
    n: [5, 8],
    size: [0.22, 0.3],    // × radio del agujero
    orbitR: 0.31,         // radio de órbita en fracción del lado corto de la pantalla
    orbitW: 1.15,         // rad/s
    gather: 1.6,          // tiempo para formar el anillo
    orbitT: 3.2,          // tiempo orbitando antes de atacar
    aim: 0.5,             // telegrafiado: la línea de embestida se fija este tiempo antes
    stagger: 0.2,         // separación entre embestidas
    dashSp: 1000,         // px de pantalla por segundo
    dmg: 8,
  };

  // Jefe final: el Núcleo galáctico. Aparece al cruzar MILESTONES[6].r.
  V.BOSS = {
    size: 3.7,            // × radio del agujero al aparecer
    hp: 8000,             // vida = hp × r0² (r0 = radio del agujero al aparecer)
    intro: 3,             // segundos de aparición sin ataques
    chase: 1.6,           // velocidad de acercamiento (× r0 por segundo) si te alejas
    chase3: 3,
    shotS: 0.3,           // tamaño de cada estrella × r0
    shotSp: 5.2,          // × r0 por segundo
    shotLife: 4.2,
    ring1: { n: 14, gaps: 1, gapLen: 3, every: 3.2, dmg: 6 },
    ring2: { n: 18, gaps: 2, gapLen: 2, every: 2.8, dmg: 6 },
    spiral: { arms: 3, every: 0.27, spin: 1.05, dmg: 4 },
    rep: { every2: 8, every3: 6.5, warn: 1.3, R: 9, v: 20 }, // repulsión ("atracción inversa")
    grace: 1.8,           // pausa de ataques al cambiar de fase
    loot: 40,
    pulseDmg: 4,          // daño del pulso = tidal × r² × pulseDmg
    dmgCapR: 1.3,         // el daño escala con tu radio solo hasta r0 × dmgCapR
    minSize: 2.6,         // si creces, el Núcleo crece contigo (s ≥ r × minSize)
    drain: 0.7,          // multiplicador del drenaje de estabilidad mientras el Núcleo vive
    drainMul(b) { return b && !b.dead ? this.drain : 1; },
  };

  // Curva de estabilidad (QA H-16: antes era "binaria", casi siempre al 100 % y de golpe a 0).
  // feedTop: la nutrición rinde menos cerca del máximo (×(1 − feedTop·f²), f = estabilidad/máximo), así la
  //   barra vive por debajo del tope y el drenaje se ve venir.
  // drainLow: con la barra baja el drenaje se suaviza (×(1 − drainLow·(1 − f))): margen para reaccionar.
  V.STAB = { feedTop: 0.8, drainLow: 0.2 };

  V.value = (s) => 0.55 * Math.pow(s, 0.8);
  // Rendimientos decrecientes: cuanto más grande eres, menos te aporta (relativamente) cada cuerpo.
  V.GROWTH_ALPHA = 0.9;
  V.DRAIN_BETA = 0.6;
  V.growthFactor = (r) => Math.min(1, Math.pow(8 / r, V.GROWTH_ALPHA));

  // Zoom de cámara: el agujero crece en pantalla muy despacio mientras el mundo se aleja.
  V.zoomFor = (r, minDim) => ((minDim / 32) * Math.pow(r / 8, 0.1)) / r;
})();
