// Logros de VOIDLING — módulo autónomo (propiedad del agente de logros). Ver docs/ARQUITECTURA.md
//
// · Define V.ACHIEVEMENTS (ids estilo Steam, textos ES/EN, secretos, progreso).
// · Escucha el bus (V.bus) y lee V.game; no toca main.js ni run.js.
// · Para distinguir qué se devora (cometa, dorado, Custodio) y qué destruye el jugador, envuelve de forma
//   defensiva algunos métodos de V.Run.prototype. Si un método no existe, cae a los datos de los eventos.
// · Al desbloquear: guarda, emite 'ach:unlock' {id} (audio y Steam lo escuchan) y muestra un toast.
// · Pantalla propia de logros (botón LOGROS en #menu y #treebar).
// · V.achievementIcon(id, size, unlocked) → canvas con el icono procedural (para Steam/tienda).
//
// Funciona también en Node (sin DOM) para probar la lógica: la parte visual se activa solo si hay document.
(function () {
  'use strict';
  const V = globalThis.V;
  const HAS_DOM = typeof document !== 'undefined' && typeof window !== 'undefined';

  // ---------- Ajustes de diseño (fáciles de retocar) ----------
  const FAST_FINALE_RUNS = 70; // "Final en 70 partidas o menos" (el bot de balance lo logra en ~61–65)
  const LONG_RUN_SECONDS = 60; // el bot llega a ~65 s en su mejor partida
  const EXPRESS_SECONDS = 5; // secreto: evaporarse en menos de 5 s (solo posible abandonando)
  const TOAST_MS = 4300; // tiempo visible de cada toast
  const BOOT_SUMMARY_OVER = 3; // si al cargar se desbloquean más de N, se muestra un único toast resumen

  // Contadores acumulados entre partidas (en el guardado)
  const STATS_DEFAULT = {
    broken: 0, // cuerpos destrozados
    custodians: 0, // Custodios destruidos (pulso, lunas, devorados…)
    pulsars: 0, // púlsares destruidos
    golden: 0, // cuerpos dorados devorados
    comets: 0, // cometas devorados
    custEaten: 0, // Custodios devorados
    bigBite: 0, // cuerpos más grandes que tú devorados
    bestChain: 0, // cadena de bocados más larga
    bestTime: 0, // partida más larga (s)
  };
  if (V.Save && typeof V.Save.extend === 'function') {
    V.Save.extend({ achievements: {}, achStats: Object.assign({}, STATS_DEFAULT) });
  }

  // ---------- Acceso al guardado ----------
  function S() { return (V.game && V.game.save) || (V.Save && V.Save.data) || null; }
  function ensureSave(s) {
    if (!s) return null;
    if (!s.achievements || typeof s.achievements !== 'object' || Array.isArray(s.achievements)) s.achievements = {};
    if (!s.achStats || typeof s.achStats !== 'object') s.achStats = {};
    for (const k in STATS_DEFAULT) if (typeof s.achStats[k] !== 'number' || !isFinite(s.achStats[k])) s.achStats[k] = STATS_DEFAULT[k];
    // Si V.Save.data y V.game.save son objetos distintos (p. ej. tras "Borrar progreso"), comparten los mismos
    // sub-objetos para que lo que se guarda en disco incluya los logros.
    const d = V.Save && V.Save.data;
    if (d && d !== s) { d.achievements = s.achievements; d.achStats = s.achStats; }
    return s;
  }
  function stats() { const s = ensureSave(S()); return s ? s.achStats : Object.assign({}, STATS_DEFAULT); }
  function persist() { try { if (V.Save && V.Save.save) V.Save.save(); } catch (e) { /* sin almacenamiento */ } }

  // ---------- Estado de la partida en curso (solo en memoria) ----------
  const L = { run: null, killsEv: 0, killsScan: 0, pulsarsEv: 0, pulsarsScan: 0, revived: false, evalAcc: 0 };
  function resetLive(run) {
    L.run = run || null; L.killsEv = 0; L.killsScan = 0; L.pulsarsEv = 0; L.pulsarsScan = 0; L.revived = false; L.evalAcc = 0;
  }
  const isLive = (run) => !!run && run === L.run && !run.demo;
  const liveRun = () => (L.run && !L.run.demo ? L.run : null);

  // ---------- Valores derivados ----------
  function eatenTotal() { const s = S() || {}; const r = liveRun(); return (s.totalEaten || 0) + (r ? r.eaten || 0 : 0); }
  function brokenTotal() { const r = liveRun(); return stats().broken + (r ? r.broken || 0 : 0); }
  function custodiansTotal() { return stats().custodians + (liveRun() ? Math.max(L.killsEv, L.killsScan) : 0); }
  function pulsarsTotal() { return stats().pulsars + (liveRun() ? Math.max(L.pulsarsEv, L.pulsarsScan) : 0); }
  function bestChain() { const r = liveRun(); return Math.max(stats().bestChain, r ? r.chain || 0 : 0); }
  function bestTime() { const r = liveRun(); return Math.max(stats().bestTime, r ? r.t || 0 : 0); }
  function recordNow() { const s = S() || {}; const r = liveRun(); return Math.max(s.record || 0, r ? r.milestone || 0 : 0); }
  function treeLevels() {
    const s = S() || {}, lv = s.levels || {};
    let own = 0, all = 0;
    for (const nd of V.NODES || []) { const m = nd.max || 0; all += m; own += Math.min(m, lv[nd.id] || 0); }
    return { own, all };
  }
  // Todas las transmisiones, incluidas las post-final (V.STORY_POST se añade a V.STORY solo tras la victoria).
  function storyIds() {
    const ids = [];
    for (const e of (V.STORY || []).concat(V.STORY_POST || [])) if (e && e.id && !ids.includes(e.id)) ids.push(e.id);
    return ids;
  }
  function seenCount() { const s = S() || {}, seen = s.seenLogs || []; return storyIds().filter((id) => seen.includes(id)).length; }
  // Combo máximo: suma de lo que aportan los nodos con estadística 'combo' al nivel máximo (Frenesí: 3 × 5 = 15).
  function maxCombo() {
    let m = 0;
    for (const nd of V.NODES || []) if (nd.stat === 'combo' && nd.op === 'add') m += (nd.per || 0) * (nd.max || 0);
    return m > 0 ? m : 15;
  }
  function boughtAny() {
    const s = S() || {}, lv = s.levels || {};
    for (const k in lv) if (k !== 'core' && lv[k] > 0) return true;
    return false;
  }
  // Giro del capítulo 4 (transmisión 'c4b'). Si la narrativa cambia el id, se usa el final como respaldo
  // (el final muestra antes todos los capítulos no leídos, así que la revelación siempre se ha visto).
  function truthSeen() {
    const s = S() || {};
    if (storyIds().includes('c4b')) return (s.seenLogs || []).includes('c4b');
    return !!s.victory;
  }

  // ---------- Definición de los logros ----------
  // icon: glifo procedural · color: acento del icono · hidden: secreto (Steam "hidden")
  // test(): condición booleana · cur()/goal: progreso numérico (goal puede ser función) · bar: mostrar barra
  // Los que no tienen test/cur se desbloquean por evento.
  const A = [
    { id: 'ACH_FIRST_MEAL', icon: 'meal', color: '#ff9a3c', cur: eatenTotal, goal: 1,
      es: ['Primer bocado', 'Devora tu primer cuerpo.'], en: ['First Bite', 'Devour your first body.'] },
    { id: 'ACH_FIRST_RESEARCH', icon: 'research', color: '#ece8ff', test: boughtAny,
      es: ['Primera investigación', 'Compra tu primera mejora en el árbol.'], en: ['First Research', 'Buy your first upgrade in the research tree.'] },
    { id: 'ACH_SCALE_1', icon: 'scale', scale: 1, test: () => recordNow() >= 1,
      es: ['Ya no eres un error', 'Alcanza la escala Nube de polvo.'], en: ['No Longer an Accident', 'Reach the Dust Cloud scale.'] },
    { id: 'ACH_SCALE_2', icon: 'scale', scale: 2, test: () => recordNow() >= 2,
      es: ['Te han visto', 'Alcanza la escala Cinturón de asteroides.'], en: ['They Have Seen You', 'Reach the Asteroid Belt scale.'] },
    { id: 'ACH_SCALE_3', icon: 'scale', scale: 3, test: () => recordNow() >= 3,
      es: ['Esa luna tenía nombre', 'Alcanza la Escala lunar.'], en: ['That Moon Had a Name', 'Reach the Lunar scale.'] },
    { id: 'ACH_SCALE_4', icon: 'scale', scale: 4, test: () => recordNow() >= 4,
      es: ['Un mundo entero', 'Alcanza la Escala planetaria.'], en: ['An Entire World', 'Reach the Planetary scale.'] },
    { id: 'ACH_SCALE_5', icon: 'scale', scale: 5, test: () => recordNow() >= 5,
      es: ['Luz interior', 'Alcanza la Escala estelar.'], en: ['Light Within', 'Reach the Stellar scale.'] },
    { id: 'ACH_SCALE_6', icon: 'scale', scale: 6, test: () => recordNow() >= 6,
      es: ['Ahora. Todo.', 'Alcanza el Núcleo galáctico.'], en: ['Now. Everything.', 'Reach the Galactic Core.'] },
    { id: 'ACH_BREAK_100', icon: 'shatter', tier: 1, color: '#ff7a5c', cur: brokenTotal, goal: 100, bar: true,
      es: ['Fuerza de marea', 'Destroza 100 cuerpos grandes.'], en: ['Tidal Force', 'Shatter 100 large bodies.'] },
    { id: 'ACH_BREAK_1000', icon: 'shatter', tier: 2, color: '#ff5470', cur: brokenTotal, goal: 1000, bar: true,
      es: ['Trituradora cósmica', 'Destroza 1000 cuerpos grandes.'], en: ['Cosmic Grinder', 'Shatter 1,000 large bodies.'] },
    { id: 'ACH_DEVOUR_10000', icon: 'devour', color: '#ffb36b', cur: eatenTotal, goal: 10000, bar: true,
      es: ['Apetito insaciable', 'Devora 10 000 cuerpos en total.'], en: ['Insatiable Appetite', 'Devour 10,000 bodies in total.'] },
    { id: 'ACH_CHAIN_100', icon: 'chain', color: '#ffcf5e', cur: bestChain, goal: 100, bar: true,
      es: ['Banquete en cadena', 'Devora 100 cuerpos seguidos sin romper la cadena.'], en: ['Chain Feast', 'Devour 100 bodies in a row without breaking the chain.'] },
    { id: 'ACH_COMBO_MAX', icon: 'combo', color: '#ff9a3c',
      test: () => { const r = liveRun(); return !!r && (r.combo || 0) >= maxCombo(); },
      es: ['Frenesí absoluto', 'Con Frenesí al nivel máximo, llena el combo por completo.'], en: ['Absolute Frenzy', 'With Frenzy fully upgraded, fill the combo meter completely.'] },
    { id: 'ACH_GOLDEN', icon: 'gold', color: '#ffd75e', cur: () => stats().golden, goal: 1,
      es: ['Brillo dorado', 'Devora un cuerpo dorado.'], en: ['Golden Glow', 'Devour a golden body.'] },
    { id: 'ACH_COMET', icon: 'comet', color: '#7fe3ff', cur: () => stats().comets, goal: 1,
      es: ['Pide un deseo', 'Devora un cometa.'], en: ['Make a Wish', 'Devour a comet.'] },
    { id: 'ACH_EAT_CUSTODIAN', icon: 'eatCustodian', color: '#ff4fd8', cur: () => stats().custEaten, goal: 1,
      es: ['Sabor a antimateria', 'Devora un Custodio (requiere Digestión exótica).'], en: ['A Taste of Antimatter', 'Devour a Custodian (requires Exotic Digestion).'] },
    { id: 'ACH_CUSTODIANS_50', icon: 'custodians', color: '#ff4fd8', cur: custodiansTotal, goal: 50, bar: true,
      es: ['Contramedidas', 'Destruye 50 Custodios (con el pulso, las lunas o devorándolos).'], en: ['Countermeasures', 'Destroy 50 Custodians (with your pulse, your moons or by devouring them).'] },
    { id: 'ACH_PULSAR', icon: 'pulsar', color: '#8fd0ff', cur: pulsarsTotal, goal: 1,
      es: ['Faro apagado', 'Destruye un púlsar.'], en: ['Lighthouse Out', 'Destroy a pulsar.'] },
    { id: 'ACH_BIG_BITE', icon: 'bigbite', color: '#6fc2ff', cur: () => stats().bigBite, goal: 1,
      es: ['Ojos más grandes que el horizonte', 'Devora un cuerpo más grande que tú.'], en: ['Eyes Bigger Than the Horizon', 'Devour a body larger than yourself.'] },
    { id: 'ACH_LONG_RUN', icon: 'clock', color: '#47f0a0', cur: bestTime, goal: LONG_RUN_SECONDS, bar: true, fmt: 'time',
      es: ['Horizonte persistente', 'Sobrevive 60 segundos en una sola partida.'], en: ['Lingering Horizon', 'Survive for 60 seconds in a single run.'] },
    { id: 'ACH_NO_REVIVE', icon: 'shield', color: '#47f0a0',
      es: ['Sin red', 'Completa una partida victoriosa sin que se active Segunda oportunidad.'], en: ['No Safety Net', 'Finish a winning run without Second Chance kicking in.'] },
    { id: 'ACH_FAST_FINALE', icon: 'bolt', color: '#ffd966',
      es: ['Agujero con prisa', 'Completa el Ciclo I en 70 partidas o menos.'], en: ['In a Hurry', 'Complete Cycle I in 70 runs or fewer.'] },
    { id: 'ACH_TREE_100', icon: 'tree', color: '#b98bff', cur: () => treeLevels().own, goal: () => treeLevels().all, bar: true,
      es: ['Calibración total', 'Lleva todas las mejoras del árbol a su nivel máximo.'], en: ['Fully Calibrated', 'Max out every upgrade in the research tree.'] },
    { id: 'ACH_ARCHIVE', icon: 'archive', color: '#7fe3ff', cur: seenCount, goal: () => storyIds().length, bar: true,
      es: ['Archivista', 'Recibe todas las transmisiones del archivo, incluso las que llegan después del final.'], en: ['Archivist', 'Receive every transmission in the archive, even those that arrive after the ending.'] },
    { id: 'ACH_RUNS_100', icon: 'loop', color: '#9fb3d9', cur: () => (S() || {}).runs || 0, goal: 100, bar: true,
      es: ['Una más', 'Juega 100 partidas.'], en: ['Just One More', 'Play 100 runs.'] },
    { id: 'ACH_TRUTH', icon: 'ember', color: '#ffcf9e', hidden: true, test: truthSeen,
      es: ['Lo primero que devoraste', 'Descubre qué fue de la Dra. Ilse Varga.'], en: ['The First Thing You Ate', 'Learn what became of Dr. Ilse Varga.'] },
    { id: 'ACH_CYCLE_ONE', icon: 'bigbang', color: '#e08bff', hidden: true, test: () => !!(S() || {}).victory,
      es: ['Florecer', 'Completa el Ciclo I.'], en: ['Bloom', 'Complete Cycle I.'] },
    { id: 'ACH_EXPRESS', icon: 'express', color: '#b98bff', hidden: true,
      es: ['Evaporación exprés', 'Termina una partida en menos de 5 segundos.'], en: ['Express Evaporation', 'End a run in less than 5 seconds.'] },
  ];
  // Color de los iconos de escala = color de la escala
  for (const a of A) if (a.icon === 'scale' && !a.color) a.color = (V.MILESTONES && V.MILESTONES[a.scale] && V.MILESTONES[a.scale].color) || '#ece8ff';

  V.ACHIEVEMENTS = A;
  const BY_ID = {};
  A.forEach((a) => (BY_ID[a.id] = a));

  // ---------- Textos ----------
  const STR = {
    es: {
      achBtn: 'LOGROS', achTitle: 'LOGROS', achToastHead: 'Logro desbloqueado', achSecret: '???',
      achSecretDesc: 'Logro secreto. Sigue jugando para descubrirlo.', achSummaryHead: 'Logros desbloqueados',
      achSummaryN: '{n} logros nuevos', achSummaryDesc: 'Ábrelos en la pantalla de LOGROS.', achUnlockedOn: 'Desbloqueado el {d}',
      achTotal: '{n} de {t}',
    },
    en: {
      achBtn: 'ACHIEVEMENTS', achTitle: 'ACHIEVEMENTS', achToastHead: 'Achievement unlocked', achSecret: '???',
      achSecretDesc: 'Secret achievement. Keep playing to discover it.', achSummaryHead: 'Achievements unlocked',
      achSummaryN: '{n} new achievements', achSummaryDesc: 'See them on the ACHIEVEMENTS screen.', achUnlockedOn: 'Unlocked on {d}',
      achTotal: '{n} of {t}',
    },
  };
  for (const a of A) {
    STR.es['ach_' + a.id + '_n'] = a.es[0]; STR.es['ach_' + a.id + '_d'] = a.es[1];
    STR.en['ach_' + a.id + '_n'] = a.en[0]; STR.en['ach_' + a.id + '_d'] = a.en[1];
  }
  if (typeof V.addStrings === 'function') V.addStrings(STR);
  const T = (k) => (typeof V.t === 'function' ? V.t(k) : (STR[V.lang] || STR.es)[k] || STR.es[k] || k);
  const achName = (a) => T('ach_' + a.id + '_n');
  const achDesc = (a) => T('ach_' + a.id + '_d');
  // Locale BCP47 para fechas y números: el código de idioma ya lo es (pt-BR, zh-CN, ru, de, ja...).
  const locale = () => {
    const l = V.lang === 'en' ? 'en-US' : V.lang === 'es' ? 'es-ES' : V.lang || 'en-US';
    try { new Intl.DateTimeFormat(l); return l; } catch (e) { return 'en-US'; }
  };

  // ---------- Desbloqueo ----------
  let batch = null; // en la comprobación inicial se agrupan los toasts
  function isUnlocked(id) { const s = S(); return !!(s && s.achievements && s.achievements[id]); }
  function unlock(id) {
    const a = BY_ID[id];
    const s = ensureSave(S());
    if (!a || !s || s.achievements[id]) return false;
    s.achievements[id] = Date.now();
    persist();
    V.bus.emit('ach:unlock', { id });
    if (batch) batch.push(a); else queueToast(a);
    return true;
  }
  function goalOf(a) { return typeof a.goal === 'function' ? a.goal() : a.goal; }
  function progress(id) {
    const a = BY_ID[id];
    if (!a || !a.cur) return null;
    const goal = goalOf(a);
    if (!(goal > 0)) return null;
    let cur = 0; try { cur = a.cur() || 0; } catch (e) { cur = 0; }
    return { cur: Math.min(cur, goal), goal };
  }
  // Recorre los logros con condición y desbloquea los que se cumplen.
  // ids opcional: lista de logros a comprobar (para no recorrerlos todos en eventos muy frecuentes).
  function evaluate(ids) {
    const s = S();
    if (!s) return;
    ensureSave(s);
    const list = Array.isArray(ids) ? ids.map((id) => BY_ID[id]).filter(Boolean) : A;
    for (const a of list) {
      if (s.achievements[a.id]) continue;
      let ok = false;
      try {
        if (a.test) ok = !!a.test();
        else if (a.cur) { const g = goalOf(a); ok = g > 0 && a.cur() >= g; }
      } catch (e) { ok = false; }
      if (ok) unlock(a.id);
    }
  }

  // ---------- Detección fina: envoltorios defensivos de V.Run ----------
  // Solo actúan sobre la partida activa (nunca sobre la demo del menú ni el simulador de balance).
  const hooks = {};
  const proto = V.Run && V.Run.prototype;
  function wrap(name, make) {
    if (!proto || typeof proto[name] !== 'function' || proto[name].__ach) return;
    const w = make(proto[name]);
    w.__ach = true;
    proto[name] = w;
    hooks[name] = true;
  }
  const CUSTODIAN_KINDS = { anti: 1, swarm: 1 };

  function onEaten(run, kind, gold, rel) {
    const st = stats();
    if (kind === 'comet') st.comets++;
    if (CUSTODIAN_KINDS[kind]) st.custEaten++;
    if (gold && kind !== 'comet') st.golden++;
    if (kind === 'pulsar') L.pulsarsScan++;
    if (rel >= 1 && kind !== 'comet' && !CUSTODIAN_KINDS[kind]) st.bigBite++;
  }

  wrap('hit', (orig) => function (o) {
    if (o && isLive(this)) o._achHit = true;
    return orig.apply(this, arguments);
  });
  wrap('eat', (orig) => function (o) {
    const live = !!o && isLive(this);
    const kind = live ? o.kind : null, gold = live && !!o.gold, rel = live && this.r > 0 ? o.s / this.r : 0;
    const res = orig.apply(this, arguments);
    if (live && o.dead && !o._achEaten) { o._achEaten = true; onEaten(this, kind, gold, rel); }
    return res;
  });
  wrap('breakObj', (orig) => function (o) {
    const live = !!o && isLive(this) && !o.dead;
    const res = orig.apply(this, arguments);
    if (live && o.dead && o.kind === 'pulsar' && !o._achDone) { o._achDone = true; L.pulsarsScan++; }
    return res;
  });
  // Custodios destruidos: se miran los que estaban vivos antes de update()/pulse() y murieron después.
  // Se descartan los que chocaron contigo, los que caducaron y los que salieron de la zona visible.
  function custodianScan(orig) {
    return function () {
      if (!isLive(this) || !Array.isArray(this.objs)) return orig.apply(this, arguments);
      const before = [];
      for (let i = 0; i < this.objs.length; i++) { const o = this.objs[i]; if (o && !o.dead && o.kind === 'anti') before.push(o); }
      const res = orig.apply(this, arguments);
      if (before.length) {
        let vr = 0;
        try { vr = typeof this.viewRad === 'function' ? this.viewRad() : 0; } catch (e) { vr = 0; }
        for (const o of before) {
          if (!o.dead || o._achDone) continue;
          o._achDone = true;
          if (o._achEaten) { L.killsScan++; continue; }
          if (o._achHit) continue;
          if (typeof o.life === 'number' && o.life <= 0) continue;
          if (vr > 0 && Math.hypot(o.x - this.x, o.y - this.y) > vr * 1.2) continue;
          L.killsScan++;
        }
      }
      return res;
    };
  }
  wrap('update', custodianScan);
  wrap('pulse', custodianScan);

  // Logros que puede completar un bocado (se comprueban en cada 'run:eat'; el resto, 4 veces por segundo)
  const EAT_IDS = ['ACH_FIRST_MEAL', 'ACH_CHAIN_100', 'ACH_COMBO_MAX', 'ACH_GOLDEN', 'ACH_COMET', 'ACH_EAT_CUSTODIAN', 'ACH_CUSTODIANS_50', 'ACH_PULSAR', 'ACH_BIG_BITE'];

  // ---------- Bus de eventos ----------
  const on = (ev, fn) => V.bus.on(ev, fn);

  on('run:start', (run) => { resetLive(run && run.demo ? null : run || (V.game && V.game.run)); });

  on('run:eat', (e) => {
    if (!liveRun() || !e) return;
    const st = stats();
    if (e.chain > st.bestChain) st.bestChain = e.chain;
    if (!hooks.eat) {
      // Respaldo si no se pudo envolver Run.eat: usa los datos del evento.
      const kind = e.kind || 'obj';
      const gold = e.kind ? !!e.gold && kind !== 'comet' : !!e.gold && !(L.run.st && L.run.st.comets);
      onEaten(L.run, kind, gold, e.rel || 0);
    }
    evaluate(EAT_IDS);
  });
  on('run:kill', (e) => {
    if (!liveRun() || !e) return;
    if (CUSTODIAN_KINDS[e.kind]) L.killsEv++;
    else if (e.kind === 'pulsar') L.pulsarsEv++;
    evaluate();
  });
  on('run:break', () => { if (liveRun()) evaluate(['ACH_BREAK_100', 'ACH_BREAK_1000']); });
  on('run:revive', () => { if (liveRun()) L.revived = true; });
  on('run:milestone', () => { if (liveRun()) evaluate(); });
  on('run:bossDefeat', () => { if (liveRun()) unlock('ACH_CYCLE_ONE'); });

  on('run:end', (d) => {
    const r = d && d.run;
    if (!r || r.demo) return;
    const st = stats();
    const same = r === L.run;
    st.broken += r.broken || 0;
    if (same) {
      st.custodians += Math.max(L.killsEv, L.killsScan);
      st.pulsars += Math.max(L.pulsarsEv, L.pulsarsScan);
    }
    st.bestTime = Math.max(st.bestTime, r.t || 0);
    st.bestChain = Math.max(st.bestChain, r.chain || 0);
    const revived = !!r.reviveUsed || (same && L.revived);
    resetLive(null); // a partir de aquí los totales ya incluyen esta partida
    const s = S() || {};
    if (r.victory) {
      unlock('ACH_CYCLE_ONE');
      if (!revived) unlock('ACH_NO_REVIVE');
      if ((s.runs || 0) <= FAST_FINALE_RUNS) unlock('ACH_FAST_FINALE');
    } else if ((r.t || 0) < EXPRESS_SECONDS) unlock('ACH_EXPRESS');
    evaluate();
    persist();
  });

  on('victory', () => { unlock('ACH_CYCLE_ONE'); evaluate(); });
  on('buy', () => evaluate());
  on('story:seen', () => evaluate());

  // Durante la partida: comprobación periódica (cuerpos rotos, tiempo, combo…)
  on('frame', (dt) => {
    if (!liveRun()) return;
    L.evalAcc += dt || 0;
    if (L.evalAcc >= 0.25) { L.evalAcc = 0; evaluate(); }
  });

  // Al arrancar: el guardado puede cumplir ya algunos logros (partidas anteriores a este módulo).
  on('boot', () => {
    ensureSave(S());
    batch = [];
    evaluate();
    const got = batch;
    batch = null;
    if (got.length > BOOT_SUMMARY_OVER) queueToast({ summary: got.length });
    else got.forEach(queueToast);
    if (HAS_DOM) injectButtons();
  });

  // ======================================================================
  // ICONOS PROCEDURALES
  // ======================================================================
  let K = 1; // escala de píxeles reales por unidad (el icono se dibuja en un espacio de 100×100)
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function prng(seed) { let x = seed || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 100000) / 100000; }; }
  function rgba(hex, a) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function glow(c, col, b) { c.shadowColor = col; c.shadowBlur = b * K; }
  function noGlow(c) { c.shadowBlur = 0; c.shadowColor = 'transparent'; }
  function rr(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function circle(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); }
  function star(c, x, y, spikes, r1, r2, rot) {
    c.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const a = rot + (i * Math.PI) / spikes, r = i % 2 ? r2 : r1;
      c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    c.closePath();
  }
  // Agujero negro con disco de acreción (motivo principal del juego)
  function hole(c, x, y, r, col) {
    c.save(); c.translate(x, y); c.rotate(-0.35); c.scale(1, 0.36);
    glow(c, col, 10); c.strokeStyle = col; c.lineWidth = r * 0.55; circle(c, 0, 0, r * 1.9); c.stroke();
    c.restore();
    noGlow(c);
    const g = c.createRadialGradient(x, y, r * 0.2, x, y, r * 1.15);
    g.addColorStop(0, '#000'); g.addColorStop(0.82, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; circle(c, x, y, r * 1.15); c.fill();
    glow(c, '#ffd2a8', 6); c.strokeStyle = '#ffe6c8'; c.lineWidth = Math.max(1.6, r * 0.12); circle(c, x, y, r); c.stroke();
    // parte delantera del disco
    c.save(); c.translate(x, y); c.rotate(-0.35); c.scale(1, 0.36);
    glow(c, col, 8); c.strokeStyle = col; c.lineWidth = r * 0.55; c.beginPath(); c.arc(0, 0, r * 1.9, 0.05, Math.PI - 0.05); c.stroke();
    c.restore(); noGlow(c);
  }
  function spiky(c, x, y, r, col) {
    glow(c, col, 10); c.fillStyle = col; star(c, x, y, 10, r, r * 0.55, 0.2); c.fill();
    noGlow(c); c.fillStyle = '#2a0622'; circle(c, x, y, r * 0.38); c.fill();
    c.fillStyle = rgba('#ffffff', 0.85); circle(c, x - r * 0.12, y - r * 0.12, r * 0.12); c.fill();
  }
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI'];

  const GLYPHS = {
    meal(c, a) {
      hole(c, 50, 54, 15, a.color);
      c.fillStyle = '#cfe8ff'; glow(c, '#cfe8ff', 6);
      [[78, 22, 3.6], [70, 30, 2.8], [63, 37, 2]].forEach((p) => { circle(c, p[0], p[1], p[2]); c.fill(); });
    },
    research(c, a) {
      const pts = [[50, 50], [26, 30], [76, 32], [32, 76], [74, 74]];
      c.strokeStyle = rgba(a.color, 0.5); c.lineWidth = 2;
      for (let i = 1; i < pts.length; i++) { c.beginPath(); c.moveTo(50, 50); c.lineTo(pts[i][0], pts[i][1]); c.stroke(); }
      for (let i = 1; i < pts.length; i++) { c.fillStyle = rgba(a.color, 0.55); circle(c, pts[i][0], pts[i][1], 5); c.fill(); }
      glow(c, '#ff9a3c', 12); c.fillStyle = '#ff9a3c'; circle(c, 50, 50, 15); c.fill(); noGlow(c);
      c.strokeStyle = '#1a0b02'; c.lineWidth = 4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(50, 42); c.lineTo(50, 58); c.moveTo(42, 50); c.lineTo(58, 50); c.stroke();
    },
    scale(c, a) {
      const k = a.scale || 1, col = a.color;
      c.save(); c.translate(50, 44); c.scale(1, 0.42);
      c.strokeStyle = rgba(col, 0.45); c.lineWidth = 2; circle(c, 0, 0, 33); c.stroke(); c.restore();
      const g = c.createRadialGradient(46, 39, 2, 50, 44, 11 + k * 2);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, col); g.addColorStop(1, rgba(col, 0.15));
      glow(c, col, 14); c.fillStyle = g; circle(c, 50, 44, 9 + k * 2); c.fill(); noGlow(c);
      for (let i = 0; i < k; i++) {
        const t = -Math.PI / 2 + (i + 0.5) * (Math.PI * 2 / k) + 0.4;
        const x = 50 + Math.cos(t) * 33, y = 44 + Math.sin(t) * 33 * 0.42;
        glow(c, col, 6); c.fillStyle = '#ffffff'; circle(c, x, y, 2.6); c.fill();
      }
      noGlow(c);
      c.font = '900 17px "Segoe UI",system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      glow(c, col, 8); c.fillStyle = col; c.fillText(ROMAN[k] || String(k), 50, 81); noGlow(c);
    },
    shatter(c, a) {
      const col = a.color;
      const shards = [
        [[50, 50], [30, 24], [56, 18], [62, 40]],
        [[52, 54], [70, 36], [84, 58], [64, 74]],
        [[47, 55], [56, 80], [30, 78], [22, 52], [34, 40]],
      ];
      const off = [[-4, -4], [5, 0], [-2, 5]];
      shards.forEach((sh, i) => {
        c.beginPath();
        sh.forEach((p, j) => c[j ? 'lineTo' : 'moveTo'](p[0] + off[i][0], p[1] + off[i][1]));
        c.closePath();
        const g = c.createLinearGradient(20, 20, 80, 80);
        g.addColorStop(0, '#e8d6c2'); g.addColorStop(1, '#7a5c48');
        c.fillStyle = g; c.fill();
        glow(c, col, 6); c.strokeStyle = col; c.lineWidth = 1.6; c.stroke(); noGlow(c);
      });
      c.strokeStyle = '#fff3e0'; c.lineWidth = 2; c.lineCap = 'round'; glow(c, col, 8);
      [[50, 50, 14, 0.3], [50, 50, 12, 2.4], [50, 50, 13, 4.2]].forEach((s) => {
        c.beginPath(); c.moveTo(s[0] + Math.cos(s[3]) * 6, s[1] + Math.sin(s[3]) * 6);
        c.lineTo(s[0] + Math.cos(s[3]) * s[2], s[1] + Math.sin(s[3]) * s[2]); c.stroke();
      });
      noGlow(c);
    },
    devour(c, a) {
      for (let i = 0; i < 18; i++) {
        const t = i / 18, ang = t * Math.PI * 4.2, rad = 38 * (1 - t) + 6;
        const x = 50 + Math.cos(ang) * rad, y = 50 + Math.sin(ang) * rad;
        c.fillStyle = rgba(i % 3 ? a.color : '#cfe8ff', 0.35 + t * 0.6);
        circle(c, x, y, 1.4 + (1 - t) * 3.2); c.fill();
      }
      hole(c, 50, 50, 10, a.color);
    },
    chain(c, a) {
      for (let i = 0; i < 8; i++) {
        const t = i / 7, ang = Math.PI * 0.95 - t * Math.PI * 1.3;
        const x = 50 + Math.cos(ang) * 30, y = 56 - Math.sin(ang) * 30;
        if (i) {
          const t0 = (i - 1) / 7, a0 = Math.PI * 0.95 - t0 * Math.PI * 1.3;
          c.strokeStyle = rgba(a.color, 0.45); c.lineWidth = 2;
          c.beginPath(); c.moveTo(50 + Math.cos(a0) * 30, 56 - Math.sin(a0) * 30); c.lineTo(x, y); c.stroke();
        }
        glow(c, a.color, 4 + t * 10); c.fillStyle = t > 0.85 ? '#ffffff' : a.color; circle(c, x, y, 2.5 + t * 5); c.fill(); noGlow(c);
      }
      c.font = '900 20px "Segoe UI",system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      glow(c, a.color, 8); c.fillStyle = '#fff3e0'; c.fillText('100', 50, 64); noGlow(c);
    },
    combo(c, a) {
      c.lineJoin = 'round'; c.lineCap = 'round';
      [0, 1, 2].forEach((i) => {
        const y = 70 - i * 16;
        glow(c, a.color, 6 + i * 5); c.strokeStyle = i === 2 ? '#fff3e0' : a.color; c.lineWidth = 7;
        c.beginPath(); c.moveTo(28, y + 8); c.lineTo(50, y - 8); c.lineTo(72, y + 8); c.stroke();
      });
      noGlow(c);
    },
    gold(c, a) {
      const top = 30, mid = 44, bot = 80;
      c.beginPath(); c.moveTo(34, top); c.lineTo(66, top); c.lineTo(80, mid); c.lineTo(50, bot); c.lineTo(20, mid); c.closePath();
      const g = c.createLinearGradient(20, top, 80, bot);
      g.addColorStop(0, '#fff6c8'); g.addColorStop(0.45, a.color); g.addColorStop(1, '#a8701a');
      glow(c, a.color, 16); c.fillStyle = g; c.fill(); noGlow(c);
      c.strokeStyle = 'rgba(90,50,0,.55)'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(20, mid); c.lineTo(80, mid); c.moveTo(34, top); c.lineTo(42, mid); c.lineTo(50, bot);
      c.moveTo(66, top); c.lineTo(58, mid); c.lineTo(50, bot); c.moveTo(42, mid); c.lineTo(50, top); c.lineTo(58, mid); c.stroke();
      c.fillStyle = '#ffffff'; glow(c, '#ffffff', 8); star(c, 74, 24, 4, 7, 1.6, 0); c.fill(); noGlow(c);
    },
    comet(c, a) {
      const g = c.createLinearGradient(66, 34, 16, 84);
      g.addColorStop(0, rgba(a.color, 0.9)); g.addColorStop(1, rgba(a.color, 0));
      c.fillStyle = g;
      c.beginPath(); c.moveTo(60, 26); c.lineTo(74, 40); c.lineTo(14, 88); c.closePath(); c.fill();
      c.fillStyle = rgba('#ffffff', 0.35);
      c.beginPath(); c.moveTo(63, 31); c.lineTo(69, 37); c.lineTo(28, 76); c.closePath(); c.fill();
      glow(c, a.color, 16); c.fillStyle = '#ffffff'; circle(c, 67, 33, 9); c.fill(); noGlow(c);
    },
    eatCustodian(c, a) {
      hole(c, 60, 62, 15, '#ff9a3c');
      c.save(); c.translate(34, 34); c.rotate(0.78); c.scale(1.35, 0.8); spiky(c, 0, 0, 12, a.color); c.restore();
      c.fillStyle = rgba(a.color, 0.7); [[44, 44, 2.2], [49, 49, 1.6]].forEach((p) => { circle(c, p[0], p[1], p[2]); c.fill(); });
    },
    custodians(c, a) {
      c.strokeStyle = rgba('#ffffff', 0.5); c.lineWidth = 2; c.setLineDash([3, 4]); circle(c, 50, 50, 36); c.stroke(); c.setLineDash([]);
      spiky(c, 50, 40, 14, a.color); spiky(c, 30, 64, 10, a.color); spiky(c, 70, 64, 10, a.color);
      c.font = '900 15px "Segoe UI",system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      glow(c, a.color, 6); c.fillStyle = '#ffe0f6'; c.fillText('50', 50, 86); noGlow(c);
    },
    pulsar(c, a) {
      c.save(); c.translate(50, 50); c.rotate(-0.5);
      [1, -1].forEach((s) => {
        const g = c.createLinearGradient(0, 0, 0, s * 46);
        g.addColorStop(0, rgba('#ffffff', 0.95)); g.addColorStop(1, rgba(a.color, 0));
        c.fillStyle = g; c.beginPath(); c.moveTo(-3, 0); c.lineTo(-11, s * 46); c.lineTo(11, s * 46); c.lineTo(3, 0); c.closePath(); c.fill();
      });
      c.restore();
      [20, 30].forEach((r, i) => { c.strokeStyle = rgba(a.color, 0.55 - i * 0.2); c.lineWidth = 2; circle(c, 50, 50, r); c.stroke(); });
      glow(c, a.color, 16); c.fillStyle = '#ffffff'; circle(c, 50, 50, 8); c.fill(); noGlow(c);
      // fractura: el púlsar se rompe
      c.strokeStyle = '#2a1640'; c.lineWidth = 2; c.beginPath(); c.moveTo(45, 45); c.lineTo(51, 50); c.lineTo(48, 56); c.stroke();
    },
    bigbite(c, a) {
      const g = c.createRadialGradient(58, 40, 4, 62, 48, 30);
      g.addColorStop(0, '#d8f0ff'); g.addColorStop(0.5, a.color); g.addColorStop(1, '#1d3b66');
      c.fillStyle = g; circle(c, 62, 48, 28); c.fill();
      c.save(); circle(c, 62, 48, 28); c.clip();
      c.strokeStyle = rgba('#ffffff', 0.22); c.lineWidth = 3;
      [38, 48, 58].forEach((y) => { c.beginPath(); c.moveTo(30, y); c.quadraticCurveTo(62, y + 6, 94, y); c.stroke(); });
      c.restore();
      hole(c, 33, 64, 13, '#ff9a3c');
    },
    clock(c, a) {
      c.lineCap = 'round';
      c.strokeStyle = rgba('#ffffff', 0.12); c.lineWidth = 8; circle(c, 50, 50, 30); c.stroke();
      glow(c, a.color, 10); c.strokeStyle = a.color; c.lineWidth = 8;
      c.beginPath(); c.arc(50, 50, 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 1.75); c.stroke(); noGlow(c);
      c.strokeStyle = '#ece8ff'; c.lineWidth = 3.5;
      c.beginPath(); c.moveTo(50, 50); c.lineTo(50, 31); c.moveTo(50, 50); c.lineTo(63, 56); c.stroke();
      c.fillStyle = '#ece8ff'; circle(c, 50, 50, 3.5); c.fill();
    },
    shield(c, a) {
      c.beginPath(); c.moveTo(50, 18); c.lineTo(76, 28); c.quadraticCurveTo(76, 66, 50, 84); c.quadraticCurveTo(24, 66, 24, 28); c.closePath();
      c.fillStyle = rgba(a.color, 0.12); c.fill();
      glow(c, a.color, 10); c.strokeStyle = a.color; c.lineWidth = 4; c.stroke(); noGlow(c);
      c.strokeStyle = '#ff5470'; c.lineWidth = 5; c.lineCap = 'round'; glow(c, '#ff5470', 8);
      c.beginPath(); c.moveTo(32, 74); c.lineTo(70, 26); c.stroke(); noGlow(c);
    },
    bolt(c, a) {
      c.strokeStyle = rgba(a.color, 0.35); c.lineWidth = 2; c.setLineDash([4, 5]); circle(c, 50, 50, 34); c.stroke(); c.setLineDash([]);
      c.beginPath(); c.moveTo(56, 14); c.lineTo(30, 54); c.lineTo(48, 54); c.lineTo(42, 86); c.lineTo(70, 42); c.lineTo(52, 42); c.closePath();
      const g = c.createLinearGradient(30, 14, 70, 86); g.addColorStop(0, '#fff6c8'); g.addColorStop(1, a.color);
      glow(c, a.color, 16); c.fillStyle = g; c.fill(); noGlow(c);
    },
    tree(c, a) {
      const B = V.BRANCHES || {};
      const cols = ['hunger', 'gravity', 'stability', 'tidal', 'cosmos', 'origin'].map((k) => (B[k] && B[k].color) || a.color);
      c.strokeStyle = rgba('#ffffff', 0.18); c.lineWidth = 1.5; c.setLineDash([2, 4]); circle(c, 50, 50, 34); c.stroke(); c.setLineDash([]);
      for (let i = 0; i < 6; i++) {
        const t = -Math.PI / 2 + (i * Math.PI) / 3;
        const x1 = 50 + Math.cos(t) * 18, y1 = 50 + Math.sin(t) * 18, x2 = 50 + Math.cos(t) * 32, y2 = 50 + Math.sin(t) * 32;
        c.strokeStyle = rgba(cols[i], 0.7); c.lineWidth = 2.2;
        c.beginPath(); c.moveTo(50, 50); c.lineTo(x2, y2); c.stroke();
        glow(c, cols[i], 6); c.fillStyle = cols[i]; circle(c, x1, y1, 3.6); c.fill(); circle(c, x2, y2, 5); c.fill(); noGlow(c);
      }
      glow(c, '#ffffff', 10); c.fillStyle = '#ece8ff'; circle(c, 50, 50, 7); c.fill(); noGlow(c);
    },
    archive(c, a) {
      rr(c, 18, 24, 64, 52, 8); c.fillStyle = 'rgba(8,6,20,.85)'; c.fill();
      glow(c, a.color, 8); c.strokeStyle = a.color; c.lineWidth = 2.5; c.stroke(); noGlow(c);
      const hs = [10, 22, 14, 30, 18, 26, 8, 20, 12];
      hs.forEach((h, i) => {
        const x = 27 + i * 5.8;
        c.fillStyle = i % 2 ? rgba(a.color, 0.75) : a.color;
        c.fillRect(x - 1.6, 50 - h / 2, 3.2, h);
      });
      glow(c, a.color, 6); c.fillStyle = a.color; circle(c, 26, 31, 2.6); c.fill(); noGlow(c);
    },
    loop(c, a) {
      c.lineCap = 'round'; glow(c, a.color, 8); c.strokeStyle = a.color; c.lineWidth = 6;
      c.beginPath(); c.arc(50, 50, 30, -Math.PI * 0.35, Math.PI * 1.45); c.stroke();
      const t = Math.PI * 1.45, ex = 50 + Math.cos(t) * 30, ey = 50 + Math.sin(t) * 30;
      c.fillStyle = a.color; c.beginPath(); c.moveTo(ex + 9, ey - 6); c.lineTo(ex - 4, ey - 10); c.lineTo(ex + 1, ey + 5); c.closePath(); c.fill();
      noGlow(c);
      c.font = '900 19px "Segoe UI",system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = '#ece8ff'; c.fillText('100', 50, 51);
    },
    ember(c, a) {
      hole(c, 50, 52, 20, '#ff9a3c');
      const g = c.createRadialGradient(50, 52, 0, 50, 52, 12);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, a.color); g.addColorStop(1, rgba(a.color, 0));
      c.fillStyle = g; circle(c, 50, 52, 12); c.fill();
    },
    bigbang(c, a) {
      for (let i = 0; i < 20; i++) {
        const t = (i / 20) * Math.PI * 2, len = i % 2 ? 26 : 40;
        const g = c.createLinearGradient(50, 50, 50 + Math.cos(t) * len, 50 + Math.sin(t) * len);
        g.addColorStop(0, rgba('#ffffff', 0.9)); g.addColorStop(1, rgba(i % 3 ? a.color : '#ffd27a', 0));
        c.strokeStyle = g; c.lineWidth = i % 2 ? 2 : 3; c.lineCap = 'round';
        c.beginPath(); c.moveTo(50, 50); c.lineTo(50 + Math.cos(t) * len, 50 + Math.sin(t) * len); c.stroke();
      }
      const g = c.createRadialGradient(50, 50, 0, 50, 50, 18);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, 'rgba(255,230,200,.8)'); g.addColorStop(1, 'rgba(255,200,150,0)');
      c.fillStyle = g; circle(c, 50, 50, 18); c.fill();
    },
    express(c, a) {
      c.strokeStyle = rgba(a.color, 0.55); c.lineWidth = 3; c.setLineDash([5, 6]); circle(c, 44, 56, 16); c.stroke(); c.setLineDash([]);
      c.fillStyle = 'rgba(0,0,0,.7)'; circle(c, 44, 56, 11); c.fill();
      const rnd = prng(7);
      for (let i = 0; i < 12; i++) {
        const t = -Math.PI * 0.15 - rnd() * Math.PI * 0.7, d = 20 + rnd() * 22;
        c.fillStyle = rgba(i % 2 ? '#ffffff' : a.color, 0.4 + rnd() * 0.6);
        circle(c, 44 + Math.cos(t) * d, 56 + Math.sin(t) * d, 1.2 + rnd() * 2.2); c.fill();
      }
      c.font = '900 16px "Segoe UI",system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      glow(c, a.color, 6); c.fillStyle = '#ece8ff'; c.fillText('5s', 74, 76); noGlow(c);
    },
    secret(c) {
      c.font = '900 50px "Segoe UI",system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      glow(c, '#b98bff', 10); c.fillStyle = '#cfc6ff'; c.fillText('?', 50, 53); noGlow(c);
    },
  };

  // Dibuja el icono completo de un logro en un contexto ya escalado (100×100 unidades)
  function paintIcon(c, a) {
    const col = a.color || '#b98bff';
    rr(c, 2, 2, 96, 96, 20);
    const bg = c.createRadialGradient(50, 40, 6, 50, 50, 72);
    bg.addColorStop(0, '#221852'); bg.addColorStop(1, '#07051a');
    c.fillStyle = bg; c.fill();
    c.save(); rr(c, 2, 2, 96, 96, 20); c.clip();
    const neb = c.createRadialGradient(64, 30, 0, 64, 30, 60);
    neb.addColorStop(0, rgba(col, 0.22)); neb.addColorStop(1, rgba(col, 0));
    c.fillStyle = neb; c.fillRect(0, 0, 100, 100);
    const rnd = prng(hash(a.id || 'x'));
    for (let i = 0; i < 16; i++) { c.fillStyle = rgba('#ffffff', 0.15 + rnd() * 0.45); circle(c, 4 + rnd() * 92, 4 + rnd() * 92, 0.4 + rnd() * 0.9); c.fill(); }
    c.save();
    (GLYPHS[a.icon] || GLYPHS.secret)(c, a);
    c.restore();
    c.restore();
    noGlow(c);
    rr(c, 2.5, 2.5, 95, 95, 19.5);
    glow(c, col, 8); c.strokeStyle = rgba(col, 0.85); c.lineWidth = 2.6; c.stroke(); noGlow(c);
    rr(c, 6, 6, 88, 88, 16); c.strokeStyle = 'rgba(255,255,255,.06)'; c.lineWidth = 1; c.stroke();
  }

  // Versión bloqueada: escala de grises oscurecida (el formato que pide Steam para "unachieved")
  function toLocked(cv) {
    const c = cv.getContext('2d');
    try {
      const img = c.getImageData(0, 0, cv.width, cv.height), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const l = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
        const v = Math.min(255, l * 0.55 + 14);
        d[i] = v; d[i + 1] = v; d[i + 2] = Math.min(255, v + 4);
      }
      c.putImageData(img, 0, 0);
    } catch (e) { c.fillStyle = 'rgba(10,8,20,.6)'; c.fillRect(0, 0, cv.width, cv.height); }
  }

  // API pública: V.achievementIcon(id, size, unlocked) → canvas nuevo de size×size.
  // id '__secret' devuelve el icono genérico de logro secreto.
  V.achievementIcon = function (id, size, unlocked) {
    if (!HAS_DOM) return null;
    size = Math.max(16, Math.round(size || 256));
    const a = id === '__secret' ? { id: '__secret', icon: 'secret', color: '#b98bff' } : BY_ID[id];
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    // index.html fija todos los <canvas> a pantalla completa (position:fixed): el icono se libera de esa regla.
    cv.style.position = 'static'; cv.style.display = 'inline-block'; cv.style.inset = 'auto';
    if (!a) return cv;
    const c = cv.getContext('2d');
    K = size / 100;
    c.setTransform(K, 0, 0, K, 0, 0);
    paintIcon(c, a);
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (unlocked === false) toLocked(cv);
    return cv;
  };
  const urlCache = {};
  function iconURL(id, size, unlocked) {
    const k = id + '|' + size + '|' + (unlocked ? 1 : 0);
    if (!urlCache[k]) { try { urlCache[k] = V.achievementIcon(id, size, unlocked).toDataURL('image/png'); } catch (e) { urlCache[k] = ''; } }
    return urlCache[k];
  }

  // ======================================================================
  // INTERFAZ: estilos, toasts y pantalla
  // ======================================================================
  const CSS = `
#achToasts{position:absolute;right:18px;bottom:18px;display:flex;flex-direction:column;align-items:flex-end;gap:10px;pointer-events:none;z-index:40}
#achToasts.top{bottom:auto;top:18px}
.achName,.achDesc,.achTName,.achTDesc{overflow-wrap:anywhere}
.achToast{position:relative;overflow:hidden;display:flex;align-items:center;gap:14px;width:min(370px,calc(100vw - 36px));padding:12px 16px 12px 12px;
  background:rgba(14,10,32,.88);border:1px solid rgba(170,150,255,.22);border-radius:14px;
  box-shadow:0 14px 44px rgba(0,0,0,.55),0 0 26px rgba(255,154,60,.16);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);
  transform:translateX(calc(100% + 40px));opacity:0;transition:transform .55s cubic-bezier(.18,1.15,.3,1),opacity .35s ease-out}
.achToast.in{transform:none;opacity:1}
.achToast.out{transform:translateY(14px) scale(.96);opacity:0;transition:transform .45s ease-in,opacity .45s ease-in}
.achToast::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:#ff9a3c;box-shadow:0 0 14px #ff9a3c}
.achToast::after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(100deg,transparent 30%,rgba(255,210,160,.16) 50%,transparent 70%);transform:translateX(-110%)}
.achToast.in::after{animation:achShine 1.5s .35s ease-out forwards}
@keyframes achShine{to{transform:translateX(110%)}}
.achToast img{width:58px;height:58px;border-radius:12px;flex:none;box-shadow:0 0 20px rgba(255,154,60,.32)}
.achToast.in img{animation:achPop .6s .15s cubic-bezier(.2,1.6,.4,1) both}
@keyframes achPop{from{transform:scale(.6) rotate(-8deg)}to{transform:none}}
.achTxt{min-width:0}
.achTHead{font-size:10.5px;font-weight:800;letter-spacing:.2em;color:#ff9a3c;text-transform:uppercase}
.achTName{font-size:16px;font-weight:900;letter-spacing:.03em;color:#ece8ff;margin-top:2px}
.achTDesc{font-size:12.5px;color:#9a93c2;margin-top:2px;line-height:1.35}
#achScreen{z-index:8}
#achScreen .achCard{width:min(1000px,94vw);max-height:94vh;padding:22px 24px;gap:12px}
.achSum{display:flex;align-items:center;gap:14px;width:100%;font-size:13px;color:#9a93c2;letter-spacing:.08em;font-variant-numeric:tabular-nums}
.achSum b{color:#ece8ff;font-size:17px}
.achSum .achPct{color:#ff9a3c;font-weight:900;font-size:17px;min-width:3.4em;text-align:right}
.achBar{flex:1;height:8px;border-radius:99px;background:rgba(170,150,255,.12);overflow:hidden}
.achBar i{display:block;height:100%;width:0;border-radius:inherit;background:linear-gradient(90deg,#ff9a3c,#ffd27a);box-shadow:0 0 10px rgba(255,154,60,.6);transition:width .6s ease-out}
.achGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;width:100%;overflow:auto;max-height:64vh;padding:2px 6px 2px 2px;touch-action:pan-y;outline:none}
.achTile{display:flex;gap:12px;align-items:center;padding:10px 12px;border-radius:12px;border:1px solid rgba(170,150,255,.14);background:rgba(20,14,44,.55);min-height:80px;text-align:left}
.achTile.on{border-color:rgba(255,154,60,.42);background:linear-gradient(135deg,rgba(255,154,60,.11),rgba(20,14,44,.6) 60%)}
.achTile img{width:56px;height:56px;border-radius:11px;flex:none}
.achTile.on img{box-shadow:0 0 16px rgba(255,154,60,.28)}
.achInfo{min-width:0;flex:1}
.achName{font-weight:800;font-size:14.5px;color:#ece8ff;letter-spacing:.02em}
.achTile.off .achName{color:#bdb6e0}
.achDesc{font-size:12.5px;color:#9a93c2;line-height:1.35;margin-top:2px}
.achProg{display:flex;align-items:center;gap:8px;margin-top:6px;font-size:11px;color:#9a93c2;font-variant-numeric:tabular-nums}
.achProg .achBar{height:5px}
.achProg .achBar i{box-shadow:none}
.achDate{font-size:11px;color:#ff9a3c;margin-top:4px;letter-spacing:.05em;font-weight:700}
@media (max-width:600px){.achGrid{grid-template-columns:1fr;max-height:62vh}#achScreen .achCard{padding:16px}}
@media (prefers-reduced-motion:reduce){
  .achToast{transform:none;transition:opacity .3s}.achToast.out{transform:none}
  .achToast.in::after,.achToast.in img{animation:none}.achBar i{transition:none}
}`;

  let toastBox = null, scr = null, grid = null, sumCount = null, sumBar = null, sumPct = null, opener = null;
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  function uiRoot() { return document.getElementById('ui') || document.body; }

  function setupDOM() {
    if (!HAS_DOM || toastBox) return;
    const st = document.createElement('style');
    // Medidas en rem (1rem = 10px × escala de interfaz, ver index.html) para que el ajuste "Escala de
    // interfaz" también afecte a los avisos y a la pantalla de logros. Las @media se quedan en px.
    st.id = 'achStyle';
    st.textContent = CSS.split('\n').map((l) => (/^\s*@media/.test(l) ? l : l.replace(/(\d*\.?\d+)px/g, (m, n) => +(n / 10).toFixed(3) + 'rem'))).join('\n');
    document.head.appendChild(st);
    toastBox = el('div'); toastBox.id = 'achToasts';
    toastBox.setAttribute('role', 'status'); toastBox.setAttribute('aria-live', 'polite');
    uiRoot().appendChild(toastBox);
  }

  // ---------- Toasts ----------
  // Abajo a la derecha, salvo cuando taparían la tarjeta de una transmisión (también abajo) o durante
  // el final: entonces se muestran arriba a la derecha.
  function toastTop() {
    const g = V.game;
    return !!g && ((g.transActive && g.transActive()) || g.state === 'finale');
  }
  function placeToasts() {
    if (!toastBox) return;
    const top = toastTop();
    if (toastBox.classList.contains('top') !== top) toastBox.classList.toggle('top', top);
    // con la pista del árbol visible (abajo, centrada), los avisos suben para no taparla
    const hint = document.getElementById('treeHint');
    const lift = !top && hint && !hint.classList.contains('hidden') && hint.offsetParent ? hint.offsetHeight + 28 + 'px' : '';
    if (toastBox.style.bottom !== lift) toastBox.style.bottom = lift;
  }
  // Momentos en los que NO se muestran avisos (se guardan y salen después, agrupados):
  // con el Núcleo en escena, durante la muerte/victoria (ending), el final y la pantalla de victoria,
  // y mientras se ve una pista del tutorial.
  function toastHold() {
    const g = V.game;
    if (!g) return false;
    const st = g.state, r = g.run;
    if (st === 'finale' || st === 'ending') return true;
    if (st === 'run' && r && r.bossSpawned) return true;
    const vic = document.getElementById('victory');
    if (vic && !vic.classList.contains('hidden')) return true;
    if (g.hintActive && g.hintActive()) return true;
    return false;
  }
  let held = false, curToast = null;
  function releaseHeld() {
    // si empieza un momento "sin avisos" (p. ej. aparece el Núcleo) con un aviso en pantalla, se retira y vuelve a la cola
    if (curToast && toastHold()) {
      clearTimeout(curToast.timer); curToast.el.remove();
      toastQ.unshift(curToast.a); curToast = null; toastBusy = false; held = true;
      return;
    }
    if (toastBusy || !toastQ.length || toastHold()) return;
    // lo acumulado durante una espera sale como UN aviso resumen si son más de 2
    if (held && toastQ.length > 2) {
      let n = 0;
      for (const a of toastQ) n += a.summary || 1;
      toastQ.length = 0; toastQ.push({ summary: n });
    }
    held = false;
    nextToast();
  }
  if (HAS_DOM) on('frame', () => { placeToasts(); releaseHeld(); });
  const toastQ = [];
  let toastBusy = false;
  function queueToast(a) {
    if (!HAS_DOM) return;
    toastQ.push(a);
    if (!toastBusy) nextToast();
  }
  function nextToast() {
    if (toastHold()) { toastBusy = false; held = held || toastQ.length > 0; return; }
    const a = toastQ.shift();
    if (!a) { toastBusy = false; return; }
    toastBusy = true;
    setupDOM();
    placeToasts();
    const t = el('div', 'achToast');
    const img = new Image();
    img.alt = '';
    img.src = iconURL(a.summary ? 'ACH_FIRST_MEAL' : a.id, 116, true);
    const box = el('div', 'achTxt');
    if (a.summary) {
      box.append(el('div', 'achTHead', T('achSummaryHead')), el('div', 'achTName', T('achSummaryN').replace('{n}', a.summary)), el('div', 'achTDesc', T('achSummaryDesc')));
    } else {
      box.append(el('div', 'achTHead', T('achToastHead')), el('div', 'achTName', achName(a)), el('div', 'achTDesc', achDesc(a)));
    }
    t.append(img, box);
    toastBox.appendChild(t);
    void t.offsetWidth; // fuerza el reflow para que la transición de entrada se ejecute
    requestAnimationFrame(() => t.classList.add('in'));
    const cur = { a, el: t, timer: 0 };
    curToast = cur;
    cur.timer = setTimeout(() => {
      if (curToast === cur) curToast = null;
      t.classList.add('out');
      setTimeout(() => { t.remove(); nextToast(); }, 470);
    }, TOAST_MS);
  }

  // ---------- Pantalla de logros ----------
  function buildScreen() {
    if (scr) return;
    setupDOM();
    scr = el('div', 'screen dim hidden'); scr.id = 'achScreen';
    scr.setAttribute('role', 'dialog'); scr.setAttribute('aria-modal', 'true'); scr.setAttribute('aria-labelledby', 'achTitle');
    const card = el('div', 'card achCard');
    const h = el('h2'); h.id = 'achTitle'; h.dataset.i18n = 'achTitle'; h.textContent = T('achTitle');
    const sum = el('div', 'achSum');
    sumCount = el('span'); sumBar = el('div', 'achBar'); sumBar.appendChild(el('i')); sumPct = el('span', 'achPct');
    sum.append(sumCount, sumBar, sumPct);
    grid = el('div', 'achGrid'); grid.tabIndex = 0;
    const close = el('button', 'primary'); close.id = 'achClose'; close.dataset.i18n = 'close'; close.textContent = T('close');
    close.addEventListener('click', (e) => { e.stopPropagation(); click(); closeScreen(); });
    card.append(h, sum, grid, close);
    scr.appendChild(card);
    // Clic fuera de la tarjeta: no cierra (evita cierres accidentales), pero no deja pasar el clic al juego.
    scr.addEventListener('pointerdown', (e) => e.stopPropagation());
    uiRoot().appendChild(scr);
  }
  function fmtNum(n) { try { return Math.floor(n).toLocaleString(locale()); } catch (e) { return String(Math.floor(n)); } }
  function fmtProg(a, v) { return a.fmt === 'time' ? Math.floor(v) + ' s' : fmtNum(v); }

  function render() {
    const s = ensureSave(S()) || { achievements: {} };
    grid.innerHTML = '';
    let n = 0;
    for (const a of A) {
      const ts = s.achievements[a.id];
      const on = !!ts;
      if (on) n++;
      const secret = a.hidden && !on;
      const tile = el('div', 'achTile ' + (on ? 'on' : 'off') + (secret ? ' secret' : ''));
      const img = new Image();
      img.alt = '';
      img.src = iconURL(secret ? '__secret' : a.id, 112, on);
      const info = el('div', 'achInfo');
      info.append(el('div', 'achName', secret ? T('achSecret') : achName(a)), el('div', 'achDesc', secret ? T('achSecretDesc') : achDesc(a)));
      if (on) {
        let d = '';
        try { d = new Date(ts).toLocaleDateString(locale()); } catch (e) { d = ''; }
        if (d) info.appendChild(el('div', 'achDate', '✓ ' + T('achUnlockedOn').replace('{d}', d)));
      } else if (!secret && a.bar) {
        const p = progress(a.id);
        if (p) {
          const row = el('div', 'achProg'), bar = el('div', 'achBar'), fill = el('i');
          fill.style.width = ((p.cur / p.goal) * 100).toFixed(1) + '%';
          bar.appendChild(fill);
          row.append(bar, el('span', null, fmtProg(a, p.cur) + ' / ' + fmtProg(a, p.goal)));
          info.appendChild(row);
        }
      }
      tile.append(img, info);
      grid.appendChild(tile);
    }
    const pct = A.length ? Math.round((n / A.length) * 100) : 0;
    sumCount.innerHTML = '';
    sumCount.append(el('b', null, T('achTotal').replace('{n}', n).replace('{t}', A.length)));
    sumBar.firstChild.style.width = pct + '%';
    sumPct.textContent = pct + ' %';
  }
  function click() { try { if (V.Audio) { V.Audio.ensure && V.Audio.ensure(); V.Audio.click && V.Audio.click(); } } catch (e) { /* audio no disponible */ } }
  function isOpen() { return !!scr && !scr.classList.contains('hidden'); }
  function openScreen() {
    if (!HAS_DOM) return;
    buildScreen();
    render();
    opener = document.activeElement;
    scr.classList.remove('hidden');
    const tip = document.getElementById('tooltip');
    if (tip) tip.classList.add('hidden');
    grid.scrollTop = 0;
    const c = document.getElementById('achClose');
    if (c) try { c.focus({ preventScroll: true }); } catch (e) { c.focus(); }
    V.bus.emit('ach:open');
  }
  function closeScreen() {
    if (!isOpen()) return;
    scr.classList.add('hidden');
    if (opener && opener.focus && document.contains(opener)) try { opener.focus({ preventScroll: true }); } catch (e) { /* sin foco */ }
    opener = null;
    V.bus.emit('ach:close');
  }

  // Botones LOGROS en el menú principal y en la barra del árbol
  function injectButtons() {
    if (!HAS_DOM) return;
    setupDOM();
    const mk = (id, cls) => {
      const b = el('button', cls); b.id = id; b.dataset.i18n = 'achBtn'; b.textContent = T('achBtn');
      b.addEventListener('click', (e) => { e.stopPropagation(); click(); openScreen(); });
      return b;
    };
    const tb = document.getElementById('treebar');
    if (tb && !document.getElementById('treeAch')) {
      const b = mk('treeAch', 'small');
      const arch = document.getElementById('treeArchive'), start = document.getElementById('treeStart');
      if (arch && arch.parentNode === tb) arch.after(b);
      else if (start && start.parentNode === tb) tb.insertBefore(b, start);
      else tb.appendChild(b);
      if (V.game && V.game.applyI18n) V.game.applyI18n(); // envuelve el texto y reajusta la barra
    }
    const menu = document.getElementById('menu');
    if (menu && !document.getElementById('btnAchievements')) {
      const b = mk('btnAchievements', '');
      const set = document.getElementById('btnSettings'), foot = document.getElementById('menuFoot');
      if (set && set.parentNode) set.after(b);
      else if (foot && foot.parentNode === menu) menu.insertBefore(b, foot);
      else menu.appendChild(b);
    }
  }

  if (HAS_DOM) {
    // Con la pantalla abierta, el teclado no llega al juego (ESPACIO iniciaría una partida desde el árbol).
    window.addEventListener('keydown', (e) => {
      if (!isOpen()) return;
      if (e.code === 'Escape' || e.key === 'Escape') { e.preventDefault(); click(); closeScreen(); }
      if (e.code !== 'Tab') e.stopImmediatePropagation();
    }, true);
    // Por seguridad: si empieza una partida o cambia la pantalla, se cierra.
    on('run:start', closeScreen);
    on('menu:open', closeScreen);
    on('tree:open', closeScreen);
    // Los botones se inyectan ya (el DOM existe porque los scripts van al final del <body>) y de nuevo en 'boot' por si acaso.
    try { injectButtons(); } catch (e) { /* se reintenta en boot */ }
  }

  // ---------- API pública ----------
  V.Achievements = {
    list: () => A.slice(),
    isUnlocked,
    unlock, // para depuración o integraciones (p. ej. consola de desarrollo)
    progress,
    evaluate,
    open: openScreen,
    close: closeScreen,
    isOpen,
    unlockedIds: () => { const s = S(); return s && s.achievements ? Object.keys(s.achievements).filter((k) => s.achievements[k]) : []; },
    // Exporta los iconos para Steamworks: [{ id, unlocked: dataURL, locked: dataURL }]
    exportIcons(size) {
      if (!HAS_DOM) return [];
      size = size || 256;
      return A.map((a) => ({ id: a.id, unlocked: V.achievementIcon(a.id, size, true).toDataURL('image/png'), locked: V.achievementIcon(a.id, size, false).toDataURL('image/png') }));
    },
    // Descarga los 2 PNG de cada logro (útil desde la consola de desarrollo del navegador).
    downloadIcons(size) {
      if (!HAS_DOM) return 0;
      const list = this.exportIcons(size);
      list.forEach((it, i) => {
        [['unlocked', ''], ['locked', '_locked']].forEach(([k, suf], j) => {
          setTimeout(() => { const l = document.createElement('a'); l.href = it[k]; l.download = it.id + suf + '.png'; l.click(); }, (i * 2 + j) * 120);
        });
      });
      return list.length * 2;
    },
    _hooks: hooks, // qué métodos de V.Run se pudieron envolver (diagnóstico)
  };
})();
