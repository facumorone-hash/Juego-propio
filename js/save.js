// Guardado local (localStorage). En Steam se sincroniza con Steam Cloud vía el envoltorio de escritorio.
(function () {
  const V = globalThis.V;
  const KEY = 'voidling_save_v1';
  function fresh() {
    return {
      v: 1, matter: 0, levels: { core: 1 }, record: 0, recordRun: {}, runs: 0, totalEaten: 0,
      playTime: 0, seenLogs: [], victory: false,
      settings: { music: 0.5, sfx: 0.7, shake: true, lang: null },
    };
  }
  const extra = {}, extraSettings = {};
  const clone = (o) => JSON.parse(JSON.stringify(o));
  V.Save = {
    KEY, // clave de localStorage (no cambiar: la usa el envoltorio de escritorio / Steam Cloud)
    data: null,
    // Los módulos añaden campos con valores por defecto ANTES de que main.js cargue el guardado.
    extend(defaults) { Object.assign(extra, defaults); },
    extendSettings(defaults) { Object.assign(extraSettings, defaults); },
    load() {
      let d = null;
      try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) { d = null; }
      const f = Object.assign(fresh(), clone(extra));
      Object.assign(f.settings, clone(extraSettings));
      if (!d || typeof d !== 'object') d = f;
      for (const k in f) if (d[k] === undefined) d[k] = f[k];
      if (!d.settings || typeof d.settings !== 'object') d.settings = clone(f.settings);
      for (const k in f.settings) if (d.settings[k] === undefined) d.settings[k] = f.settings[k];
      if (!Array.isArray(d.seenLogs)) d.seenLogs = [];
      if (!d.levels || typeof d.levels !== 'object') d.levels = { core: 1 };
      this.data = d;
      return d;
    },
    save() { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* almacenamiento no disponible */ } },
    // Borra el progreso. Si se pasa keepSettings, conserva los ajustes (volumen, accesibilidad, idioma...).
    reset(keepSettings) {
      const f = Object.assign(fresh(), clone(extra));
      Object.assign(f.settings, clone(extraSettings));
      if (keepSettings) Object.assign(f.settings, clone(keepSettings));
      this.data = f; this.save(); return f;
    },
  };

  // ---------- Accesibilidad: valores globales que leen render.js y otros módulos ----------
  // main.js los actualiza desde save.settings al arrancar y cada vez que cambia un ajuste
  // (y emite V.bus 'settings:change'). Aquí solo quedan los valores por defecto, para que
  // existan aunque render.js los lea antes del arranque.
  V.uiScale = 1; // 0.8 – 1.4: escala del HUD del canvas y del CSS (ver main.js draw())
  V.colorblind = false; // true → usar V.PALETTE_CB en lugar de V.PALETTE
  V.showNumbers = true; // false → no dibujar números flotantes (main.js además vacía run.texts)
  V.reduceFlash = false; // true → atenuar destellos, parpadeos y viñetas de golpe

  // Paleta semántica normal (coincide con los colores actuales del juego).
  V.PALETTE = {
    danger: '#ff5a6e', // anillo punteado de cuerpos NO comestibles / peligro genérico
    edible: '#ffc896', // resalte de cuerpos comestibles / objetivo
    enemy: '#ff4fd8', // Custodios (antimateria)
    swarm: '#ff4fd8', // enjambre
    pulsar: '#7fe3ff', // púlsar y sus anillos
    boss: '#ffd27a', // el Núcleo (jefe)
    gold: '#ffd25a', // cuerpos dorados (x10 materia)
    stabHigh: '#47f0a0', stabMid: '#ffd23c', stabLow: '#ff5470', // barra de estabilidad
    hurt: '#ff2878', // viñeta al recibir daño
    lowStab: '#9640ff', // viñeta de estabilidad baja
    pulse: '#4fb3ff', // pulso del jugador / indicador de recarga
    good: '#47f0a0', bad: '#ff5470', // textos positivo / negativo
    lumen: '#7fe3ff', custodians: '#ff4fd8', // emisores de transmisiones
  };
  // Paleta para daltonismo (basada en Okabe–Ito, aclarada para fondo oscuro). Distingue
  // peligro (bermellón) de bueno (azul cielo) y de oro (amarillo) también en protan/deutan/tritan.
  V.PALETTE_CB = {
    // Custodios: rosa-violeta con contorno blanco (render.js); antes naranja, se confundían con asteroides y combos
    danger: '#ff6d1f', edible: '#56b4e9', enemy: '#e66bd8', swarm: '#ff9cf0', pulsar: '#9fe6ff',
    boss: '#f0e442', gold: '#f0e442',
    stabHigh: '#56b4e9', stabMid: '#f0e442', stabLow: '#ff6d1f',
    hurt: '#ff6d1f', lowStab: '#e08cc0', pulse: '#56b4e9',
    good: '#56b4e9', bad: '#ff6d1f', lumen: '#56b4e9', custodians: '#e66bd8',
  };
  // Paleta activa según el ajuste.
  V.pal = () => (V.colorblind ? V.PALETTE_CB : V.PALETTE);
})();
