// =====================================================================
// VOIDLING — audio.js
// Audio 100 % procedural con WebAudio: música generativa por contextos y
// por escala cósmica + efectos sintetizados. Sin archivos de sonido.
//
// API pública (la llama main.js): ensure, setVol(m,s), mute(on), suspend(on),
// eat(rel,chain,gold), brk(rel), hit(), pulse(), buy(), deny(), click(),
// milestone(), revive(), end(), type(), victory(), intensity(k).
// Todo lo demás (temas por pantalla, escalas, púlsares, jefe, logros,
// transmisiones, pausa, ducking) se resuelve escuchando V.bus.
// =====================================================================
(function () {
  'use strict';
  const V = window.V;

  // ---------- Utilidades ----------
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const smooth = (x, a, b) => { const k = clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
  const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  // Patrón de 16 pasos: x = siempre, o = probable, - = nota fantasma (depende de la intensidad)
  const pat = (s) => s.split('').map((c) => (c === 'x' ? 1 : c === 'o' ? 0.6 : c === '-' ? 0.25 : 0));
  // Ganancia relativa por forma de onda (para que un pad de sierra no tape a uno de senos)
  const WAVE_K = { sine: 1, triangle: 0.85, square: 0.4, sawtooth: 0.45 };

  // ---------- Material armónico ----------
  // Cada acorde: r = raíz MIDI (registro grave), iv = intervalos, nx = posibles siguientes.
  // La música elige el siguiente acorde con una cadena de Markov: nunca suena igual dos veces.
  const ch = (r, iv, nx) => ({ r, iv, nx });
  const MIN9 = [0, 3, 7, 10, 14], MAJ9 = [0, 4, 7, 11, 14], LYD = [0, 4, 7, 11, 18];
  const ADD9 = [0, 4, 7, 14], MADD9 = [0, 3, 7, 14], SIX9 = [0, 4, 7, 9, 14], SUS69 = [0, 5, 7, 9, 14];
  const PROG = {
    // Menú: misterioso (Am9 con color lidio y napolitano)
    menu: {
      Am9: ch(45, MIN9, ['Fl', 'Dm9', 'Bb']), Fl: ch(41, LYD, ['Am9', 'G6s']), Dm9: ch(50, MIN9, ['Am9', 'Fl', 'Em']),
      G6s: ch(43, SUS69, ['Am9', 'Dm9']), Em: ch(40, MIN9, ['Fl', 'Am9']), Bb: ch(46, LYD, ['Am9']),
    },
    // Árbol: laboratorio, calmo y cálido (Do mayor / Fa lidio)
    tree: {
      F9: ch(41, MAJ9, ['C9', 'Dm9', 'G69']), C9: ch(48, MAJ9, ['F9', 'Am9', 'Em7']), Am9: ch(45, MIN9, ['F9', 'Dm9']),
      Dm9: ch(50, MIN9, ['G69', 'F9']), G69: ch(43, SIX9, ['C9', 'Em7']), Em7: ch(40, [0, 3, 7, 10], ['F9', 'Am9']),
    },
    // Tras morir: reflexivo
    after: {
      F7: ch(41, MAJ9, ['Em7', 'Am9']), Em7: ch(40, MIN9, ['Dm9', 'Am9']), Dm9: ch(50, MIN9, ['Am9', 'F7']), Am9: ch(45, MIN9, ['F7', 'Dm9']),
    },
    // Partida: la progresión del GDD (Am9 · Fmaj7 · Cadd9 · G6 · Em7)
    run: {
      Am9: ch(45, MIN9, ['F7', 'C9', 'G6']), F7: ch(41, MAJ9, ['C9', 'G6', 'Am9']), C9: ch(48, ADD9, ['G6', 'Em7', 'F7']),
      G6: ch(43, SIX9, ['Em7', 'Am9']), Em7: ch(40, MIN9, ['Am9', 'F7']),
    },
    // Mota cuántica: casi estática
    quantum: { Am9: ch(45, MIN9, ['Fl', 'Em']), Fl: ch(41, LYD, ['Am9']), Em: ch(40, MIN9, ['Am9', 'Fl']) },
    // Asteroides: eólico, rodante
    ast: {
      Am9: ch(45, MIN9, ['G', 'F7']), G: ch(43, ADD9, ['F7', 'Am9', 'Em7']), F7: ch(41, MAJ9, ['Em7', 'G', 'Am9']), Em7: ch(40, MIN9, ['Am9', 'F7']),
    },
    // Lunar: dórico, plateado
    lunar: {
      Am9: ch(45, MIN9, ['D9', 'Em7', 'G6']), D9: ch(50, [0, 4, 7, 10, 14], ['Am9', 'F7']), Em7: ch(40, MIN9, ['D9', 'Am9']),
      G6: ch(43, SIX9, ['Am9', 'D9']), F7: ch(41, MAJ9, ['G6', 'Am9']),
    },
    // Planetaria: cálida y llena
    plan: {
      F9: ch(41, MAJ9, ['G6', 'Am9', 'C9']), G6: ch(43, SIX9, ['Am9', 'Em7', 'C9']), Am9: ch(45, MIN9, ['F9', 'Dm9']),
      C9: ch(48, MAJ9, ['F9', 'G6']), Dm9: ch(50, MIN9, ['G6', 'F9']), Em7: ch(40, MIN9, ['F9', 'Am9']),
    },
    // Estelar: brillante, con Re y La mayores que "abren" el cielo
    star: {
      Fl: ch(41, LYD, ['C9', 'G69']), C9: ch(48, MAJ9, ['G69', 'Fl', 'As']), G69: ch(43, SIX9, ['As', 'D', 'C9']),
      As: ch(45, [0, 2, 7, 14, 16], ['D', 'Fl']), D: ch(50, ADD9, ['Fl', 'G69', 'Am9']), Am9: ch(45, MIN9, ['Fl', 'C9']),
    },
    // Núcleo galáctico: coral, épico menor con dominante mayor
    core: {
      Am: ch(45, MADD9, ['F', 'Dm', 'C']), F: ch(41, ADD9, ['C', 'G', 'Dm']), C: ch(48, ADD9, ['G', 'Em', 'Am']),
      G: ch(43, ADD9, ['Am', 'E']), Dm: ch(50, MADD9, ['E', 'F', 'Am']), E: ch(40, ADD9, ['Am', 'F']), Em: ch(40, MADD9, ['F', 'Am']),
    },
    // Jefe: tensión (napolitano Si bemol y dominante E7b9)
    boss: {
      Am: ch(45, MADD9, ['Bb', 'F', 'Dm']), Bb: ch(46, ADD9, ['E7']), F: ch(41, ADD9, ['E7', 'Dm']),
      Dm: ch(50, MADD9, ['E7', 'Bb']), E7: ch(40, [0, 4, 7, 10, 13], ['Am', 'F']),
    },
    // Tras vencer al Núcleo: La mayor luminoso
    tri: {
      A: ch(45, ADD9, ['D', 'E', 'Fsm']), D: ch(50, ADD9, ['A', 'E', 'Bm']), E: ch(40, [0, 5, 7, 14], ['A', 'Fsm']),
      Fsm: ch(42, MADD9, ['D', 'E']), Bm: ch(47, MADD9, ['E', 'D']),
    },
  };

  // Leitmotivs (en índices de la escala del acorde actual: se adaptan a cualquier armonía).
  // [paso en corcheas, índice, duración en tiempos]
  const M_VOID = [[0, 0, 2], [3, 1, 1], [4, 2, 1], [6, 4, 3]]; // "Voidling": sube y se abre
  const M_ILSE = [[0, 4, 1.5], [3, 3, 1], [4, 2, 2], [8, 1, 2], [12, 2, 4]]; // "Ilse": suspiro que desciende
  const M_LUMEN = [[0, 2, 1], [2, 2, 1], [4, 3, 1], [6, 1, 3]]; // "LUMEN": pregunta insistente

  // Patrones de arpegio (índices sobre la escala del acorde; -1 = silencio). Mutan con el tiempo.
  const ARPS = [
    [0, 1, 2, 3], [0, 2, 1, 3], [0, 1, 2, 3, 4, 3, 2, 1], [0, 2, 4, 2], [3, 2, 1, 0],
    [0, 4, 1, 3], [0, -1, 2, 1, -1, 3, 2, -1], [0, 2, 3, 5, 3, 2], [1, 0, 2, 0, 3, 0],
  ];

  // Percusión por "kit" (16 pasos por compás)
  const KITS = {
    tick: { tick: pat('x.......x.......'), shk: pat('....-.......-...') },
    soft: { kick: pat('x.......o.......'), shk: pat('....-.......-..-') },
    rock: { kick: pat('x.....o.x.-.....'), tom: pat('..............o.'), hat: pat('..x...x...x...x.') },
    lunar: { kick: pat('x.......x.......'), hat: pat('-.x.-.x.-.x.-.x.'), rim: pat('....o.......o...') },
    full: { kick: pat('x...-.o.x...-...'), snap: pat('....x.......x...'), hat: pat('x-x-x-x-x-x-x-x-') },
    epic: { tom: pat('x.......x.....o.'), kick: pat('x.......x.......'), snap: pat('........x.......'), hat: pat('--x---x---x---x-') },
    boss: { kick: pat('x..x..x.x..x..-.'), snap: pat('....x.......x...'), hat: pat('xoxoxoxoxoxoxoxo'), tom: pat('............o-o-') },
  };
  const BASS = {
    pulse: pat('x...o...x...o...'), drive: pat('x.o.x.o.x.o.x.o-'), rock: pat('x..o..x.x..o..o.'), ost: pat('xxxxxxxxxxxxxxxx'),
  };
  const OST = [0, 12, 0, 7, 0, 12, 0, 10, 0, 12, 0, 7, 12, 10, 7, 3];

  // ---------- Estilos musicales (tema + escala) ----------
  const BASE = {
    bpm: 72, bars: 2, prog: 'run', start: 'Am9', pad: 0.7, padWave: 'triangle', padCut: 1400, padN: 4, width: 0.5,
    bass: 0, bassPat: 'long', arp: 0, arpRate: 2, arpRatio: 2, arpIdx: 1.2, arpLo: 64, arpDens: 0.6, arpDec: 0.35,
    bell: 0, bellRatio: 3.5, bellLo: 76, bellDens: 0.12, bellDec: 2.2, perc: 0, kit: 'soft',
    choir: 0, drone: 0, dronePedal: true, shim: 0, delay: 0.3, verb: 0.35, motifs: [M_VOID], motifP: 0.2, dyn: false, arc: 16,
  };
  const THEMES = {
    menu: { bpm: 56, prog: 'menu', start: 'Am9', pad: 0.8, padWave: 'triangle', padCut: 900, drone: 0.7, bell: 0.6, bellRatio: 3.5, bellDens: 0.07, bellLo: 79, bellDec: 3, shim: 0.25, delay: 0.45, verb: 0.6, motifs: [M_ILSE, M_VOID], motifP: 0.35, width: 0.6 },
    tree: { bpm: 76, prog: 'tree', start: 'F9', pad: 0.6, padWave: 'sine', padCut: 1800, bass: 0.45, arp: 0.42, arpRatio: 4, arpIdx: 1.5, arpLo: 67, arpDens: 0.5, arpDec: 0.4, perc: 0.45, kit: 'tick', bell: 0.3, bellDens: 0.05, delay: 0.3, verb: 0.35, motifs: [M_ILSE, M_LUMEN], motifP: 0.25 },
    after: { bpm: 54, prog: 'after', start: 'F7', pad: 0.7, padCut: 900, bell: 0.35, bellDens: 0.05, bellDec: 3, drone: 0.4, shim: 0.15, verb: 0.6, motifs: [M_ILSE], motifP: 0.4 },
    tri: { bpm: 72, prog: 'tri', start: 'A', pad: 0.7, padWave: 'sawtooth', padCut: 2600, choir: 0.8, shim: 0.7, bell: 0.4, bellLo: 81, bellDens: 0.1, width: 0.9, verb: 0.7, motifs: [M_VOID], motifP: 0.5 },
  };
  // Una entrada por escala (0 mota cuántica … 6 núcleo galáctico)
  const SCALES = [
    { bpm: 80, bars: 4, prog: 'quantum', start: 'Am9', pad: 0.55, padWave: 'sine', padCut: 900, padN: 3, bass: 0.45, bassPat: 'pulse', bell: 0.55, bellRatio: 4.2, bellLo: 81, bellDens: 0.12, bellDec: 1.6, perc: 0.3, kit: 'soft', shim: 0.2, width: 0.35, verb: 0.5, delay: 0.45 },
    { bpm: 84, prog: 'run', start: 'Am9', pad: 0.55, padWave: 'sine', padCut: 1100, padN: 3, bass: 0.5, bassPat: 'pulse', arp: 0.5, arpRatio: 3.5, arpIdx: 1, arpLo: 76, arpDens: 0.35, arpDec: 0.5, bell: 0.45, bellLo: 84, bellDens: 0.1, perc: 0.45, kit: 'soft', shim: 0.25, width: 0.45, delay: 0.45 },
    { bpm: 90, prog: 'ast', start: 'Am9', pad: 0.6, padWave: 'triangle', padCut: 1300, bass: 0.7, bassPat: 'rock', arp: 0.6, arpRatio: 1, arpIdx: 1.4, arpLo: 64, arpDens: 0.6, arpDec: 0.3, bell: 0.25, bellRatio: 2, perc: 0.65, kit: 'rock', width: 0.5, delay: 0.35 },
    { bpm: 88, prog: 'lunar', start: 'Am9', pad: 0.65, padWave: 'square', padCut: 1000, bass: 0.6, bassPat: 'pulse', arp: 0.55, arpRate: 4, arpRatio: 2, arpIdx: 0.9, arpLo: 69, arpDens: 0.3, arpDec: 0.35, bell: 0.35, bellLo: 81, bellDens: 0.1, perc: 0.6, kit: 'lunar', shim: 0.2, delay: 0.5, width: 0.6, motifs: [M_VOID, M_LUMEN] },
    { bpm: 92, prog: 'plan', start: 'F9', pad: 0.7, padWave: 'sawtooth', padCut: 1500, bass: 0.75, bassPat: 'drive', arp: 0.55, arpRatio: 2, arpIdx: 1.2, arpLo: 64, arpDens: 0.65, arpDec: 0.35, bell: 0.3, perc: 0.75, kit: 'full', shim: 0.15, width: 0.6, motifs: [M_VOID, M_ILSE] },
    { bpm: 96, prog: 'star', start: 'Fl', pad: 0.75, padWave: 'sawtooth', padCut: 3200, padN: 5, bass: 0.7, bassPat: 'drive', arp: 0.6, arpRate: 4, arpRatio: 3, arpIdx: 1, arpLo: 72, arpDens: 0.55, arpDec: 0.3, bell: 0.35, bellLo: 88, perc: 0.8, kit: 'full', shim: 0.6, width: 0.9, verb: 0.5, delay: 0.4, motifs: [M_VOID, M_ILSE] },
    { bpm: 76, prog: 'core', start: 'Am', pad: 0.6, padWave: 'sawtooth', padCut: 1600, bass: 0.7, bassPat: 'pulse', choir: 0.9, drone: 0.6, dronePedal: false, arp: 0.3, arpRatio: 1, arpLo: 57, arpDens: 0.4, bell: 0.2, perc: 0.8, kit: 'epic', shim: 0.35, width: 0.8, verb: 0.6, motifs: [M_VOID, M_ILSE, M_LUMEN], motifP: 0.3 },
  ];
  const BOSS = { bpm: 100, bars: 1, prog: 'boss', start: 'Am', pad: 0.55, padCut: 2000, bass: 0.8, bassPat: 'ost', perc: 0.9, kit: 'boss', choir: 0.9, arp: 0.45, arpRate: 4, arpRatio: 1, arpIdx: 1.6, arpLo: 57, arpDens: 0.7, drone: 0.5, bell: 0, motifP: 0 };
  // Nivel base de cada capa (mezcla interna de la música)
  const MUSIC_GAIN = 1.1; // volumen global de la música respecto a los efectos
  const LVL = { pad: 0.55, bass: 0.5, arp: 0.32, bell: 0.3, perc: 0.55, choir: 0.4, drone: 0.4, shim: 0.25 };

  function styleFor(theme, scale, boss) {
    if (theme === 'run') {
      const s = SCALES[clamp(scale | 0, 0, SCALES.length - 1)];
      return Object.assign({}, BASE, s, boss ? BOSS : null, { dyn: true, name: 'run' + scale + (boss ? 'b' : '') });
    }
    if (THEMES[theme]) return Object.assign({}, BASE, THEMES[theme], { name: theme });
    return null; // silencio
  }

  // =====================================================================
  const A = {
    ctx: null, musicVol: 0.5, sfxVol: 0.7, muted: false, sysSuspended: false,
    theme: 'menu', scale: 0, boss: false, bossPhase: 0, baseI: 0.2, I: 0.3, danger: 0, paused: false,
    st: null, gates: {}, load: [], held: [], swell: [],

    // ---------- Arranque (solo tras un gesto del usuario) ----------
    ensure() {
      if (this.ctx) { if (this.ctx.state === 'suspended' && !this.sysSuspended) this.ctx.resume().catch(() => {}); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try { this.ctx = new AC({ latencyHint: 'playback' }); } catch (e) { try { this.ctx = new AC(); } catch (e2) { return; } }
      this.build();
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      this.applyTheme(true);
      this.timer = setInterval(() => this.tick(), 90);
    },

    // Construye el grafo de audio. Separado de ensure() para poder probarlo con OfflineAudioContext.
    build() {
      const c = this.ctx;
      const G = (v) => { const g = c.createGain(); g.gain.value = v; return g; };
      // Máster → un único compresor-limitador (rodilla amplia: pega la mezcla y frena los picos)
      this.master = G(this.muted ? 0 : 1);
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -12; comp.knee.value = 10; comp.ratio.value = 12; comp.attack.value = 0.003; comp.release.value = 0.2;
      this.master.connect(comp); comp.connect(c.destination);

      // Ruido blanco compartido (2 s) y respuesta al impulso generada por código
      const len = c.sampleRate * 2;
      this.noiseBuf = c.createBuffer(1, len, c.sampleRate);
      const nd = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) nd[i] = Math.random() * 2 - 1;
      // Una sola reverb (ConvolverNode) compartida por música y efectos: es lo más caro del grafo.
      // Los envíos llegan ya escalados por su volumen (música / efectos).
      const rev = c.createConvolver(); rev.buffer = this.makeIR(2.2, 3);
      rev.connect(this.master);

      // --- Efectos: seco → volumen; húmedo → volumen → reverb ---
      this.sfxOut = G(this.sfxVol);
      this.sfx = G(1); this.sfxWet = G(0.9); this.sfxWetVol = G(this.sfxVol);
      this.sfx.connect(this.sfxOut); this.sfxOut.connect(this.master);
      this.sfxWet.connect(this.sfxWetVol); this.sfxWetVol.connect(rev);

      // --- Música: capas → mezcla (+reverb +delay ping-pong) → filtro pausa/golpe → ducking → volumen ---
      this.musicOut = G(this.musicVol * 0.8);
      this.duck = G(1);
      this.mLP = c.createBiquadFilter(); this.mLP.type = 'lowpass'; this.mLP.frequency.value = 18000; this.mLP.Q.value = 0.5;
      this.mix = G(1);
      this.mix.connect(this.mLP); this.mLP.connect(this.duck); this.duck.connect(this.musicOut); this.musicOut.connect(this.master);
      this.mWet = G(1); this.mWetVol = G(this.musicVol);
      this.mWet.connect(this.mWetVol); this.mWetVol.connect(rev);
      // Delay ping-pong (izquierda → derecha) con realimentación oscurecida
      this.dIn = G(1);
      const dL = c.createDelay(2), dR = c.createDelay(2), fb = G(0.38), fbLP = c.createBiquadFilter(), mg = c.createChannelMerger(2);
      fbLP.type = 'lowpass'; fbLP.frequency.value = 2400;
      dL.delayTime.value = dR.delayTime.value = 0.5;
      this.dIn.connect(dL); dL.connect(fbLP); fbLP.connect(dR); dR.connect(fb); fb.connect(dL);
      dL.connect(mg, 0, 0); dR.connect(mg, 0, 1); mg.connect(this.mix);
      this.dL = dL; this.dR = dR;

      // Capas
      this.L = {};
      const layer = (name, verb, del) => {
        const g = G(0); g.connect(this.mix);
        const sv = G(verb); g.connect(sv); sv.connect(this.mWet);
        if (del) { const sd = G(del); g.connect(sd); sd.connect(this.dIn); g.dSend = sd; }
        g.vSend = sv; this.L[name] = g; return g;
      };
      // Pad: dos paneos fijos + un filtro compartido (barato)
      this.padLP = c.createBiquadFilter(); this.padLP.type = 'lowpass'; this.padLP.Q.value = 0.7; this.padLP.frequency.value = 1200;
      this.padLP.connect(layer('pad', 0.35, 0.15));
      this.padPan = [c.createStereoPanner(), c.createStereoPanner()];
      this.padPan.forEach((p, i) => { p.pan.value = i ? 0.5 : -0.5; p.connect(this.padLP); });
      this.bassLP = c.createBiquadFilter(); this.bassLP.type = 'lowpass'; this.bassLP.frequency.value = 700;
      this.bassLP.connect(layer('bass', 0.05));
      layer('arp', 0.25, 0.45); layer('bell', 0.6, 0.35); layer('perc', 0.15);
      // Coro: banco de formantes compartido (vocal "a"/"o" que muta lentamente)
      this.choirIn = G(1);
      const chG = layer('choir', 0.6, 0.1);
      this.formants = [[700, 6, 1], [1150, 7, 0.55], [2600, 9, 0.3]].map(([f, q, v]) => {
        const b = c.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = q;
        const g = G(v * 2.2); this.choirIn.connect(b); b.connect(g); g.connect(chG); return b;
      });
      const body = c.createBiquadFilter(); body.type = 'lowpass'; body.frequency.value = 450;
      const bg = G(0.35); this.choirIn.connect(body); body.connect(bg); bg.connect(chG);
      // Dron: filtro con LFO lento (movimiento misterioso)
      this.droneLP = c.createBiquadFilter(); this.droneLP.type = 'lowpass'; this.droneLP.frequency.value = 380; this.droneLP.Q.value = 2;
      this.droneLP.connect(layer('drone', 0.45));
      const lfo = c.createOscillator(), lg = G(220); lfo.frequency.value = 0.05; lfo.connect(lg); lg.connect(this.droneLP.frequency); lfo.start();
      layer('shim', 0.9, 0.3);
      this.shimPan = [c.createStereoPanner(), c.createStereoPanner()];
      this.shimPan.forEach((p, i) => { p.pan.value = i ? 0.8 : -0.8; p.connect(this.L.shim); });
      // Vibrato compartido por todas las voces del coro
      this.vib = c.createOscillator(); this.vib.frequency.value = 5.2;
      this.vibG = G(9); this.vib.connect(this.vibG); this.vib.start();
      // Latido de peligro y voces del final: salida propia (no dependen del nivel de capa)
      this.beatG = G(1); this.beatG.connect(this.mix);
      this.fin = G(1); this.fin.connect(this.mix); const fv = G(0.7); this.fin.connect(fv); fv.connect(this.mWet);
      // coro del final: sierras suavizadas (no pasa por los formantes, cuya capa estará apagada)
      this.finLP = c.createBiquadFilter(); this.finLP.type = 'lowpass'; this.finLP.frequency.value = 1500; this.finLP.Q.value = 0.8;
      this.finLP.connect(this.fin);

      // Estado del secuenciador
      this.k = 0; this.bar = -1; this.chordEnd = 0; this.nt = c.currentTime + 0.1; this.lastLv = {};
      this.arpPat = ARPS[0].slice(); this.arpPos = 0; this.bellIdx = 3; this.mq = []; this.voicing = null;
      this.energy = 0.7; this.phase = Math.random() * 6; this.nextBreak = 24; this.breakUntil = -1;
    },

    // Respuesta al impulso: ruido estéreo con caída exponencial que se oscurece con el tiempo.
    makeIR(dur, decay) {
      const c = this.ctx, sr = c.sampleRate, len = Math.floor(sr * dur), pre = Math.floor(sr * 0.012);
      const b = c.createBuffer(2, len, sr);
      for (let chn = 0; chn < 2; chn++) {
        const d = b.getChannelData(chn);
        let y = 0;
        for (let i = pre; i < len; i++) {
          const x = (i - pre) / (len - pre);
          const a = 0.85 - 0.75 * x; // filtro paso bajo de un polo cada vez más cerrado
          y += a * ((Math.random() * 2 - 1) - y);
          d[i] = y * Math.pow(1 - x, decay);
        }
      }
      return b;
    },

    // ---------- Volumen / estado ----------
    setVol(m, s) { this.musicVol = +m || 0; this.sfxVol = +s || 0; this.applyVol(); },
    applyVol() {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // curva perceptual suave
      const mg = Math.pow(this.musicVol, 1.4) * MUSIC_GAIN, sg = Math.pow(this.sfxVol, 1.4);
      this.musicOut.gain.setTargetAtTime(mg, t, 0.08);
      this.mWetVol.gain.setTargetAtTime(mg * (this.paused ? 0.3 : 1), t, 0.15); // en pausa la cola de reverb también se apaga
      this.sfxOut.gain.setTargetAtTime(sg, t, 0.05);
      this.sfxWetVol.gain.setTargetAtTime(sg, t, 0.05);
      this.master.gain.setTargetAtTime(this.muted ? 0 : 1, t, 0.05);
    },
    mute(on) { this.muted = !!on; this.applyVol(); },
    suspend(on) {
      this.sysSuspended = !!on;
      if (!this.ctx) return;
      (on ? this.ctx.suspend() : this.ctx.resume()).catch(() => {});
    },
    intensity(k) { this.baseI = clamp(+k || 0, 0, 1); },

    // ---------- Temas ----------
    setTheme(name, now) {
      if (this.theme === name && !now) return;
      this.theme = name;
      this.applyTheme(now);
    },
    setScale(m) {
      m = clamp(m | 0, 0, SCALES.length - 1);
      if (m === this.scale) return;
      this.scale = m;
      if (this.theme === 'run') this.applyTheme(false);
    },
    // Calcula el estilo y lo aplica en el siguiente tiempo con fundido cruzado.
    applyTheme(immediate) {
      const st = styleFor(this.theme, this.scale, this.boss);
      if (!this.ctx) return;
      if ((st && this.st && st.name === this.st.name) || (!st && !this.st)) { this.pending = null; return; }
      this.pending = st || 'off';
      this.pendingNow = !!immediate;
    },
    commitStyle(t) {
      const st = this.pending === 'off' ? null : this.pending;
      this.pending = null; this.pendingNow = false;
      this.releaseHeld(t, st ? 2.5 : 1.8); // las notas largas del estilo anterior se desvanecen
      this.st = st;
      this.k = 0; this.bar = -1; this.chordEnd = 0; this.mq.length = 0;
      if (st) {
        this.bpm = st.bpm;
        this.chordId = st.start; this.newChord = true;
        const dt = (60 / st.bpm) * 0.75; // corchea con puntillo
        this.dL.delayTime.setTargetAtTime(dt, t, 0.3); this.dR.delayTime.setTargetAtTime(dt, t, 0.3);
        const w = st.width;
        this.padPan[0].pan.setTargetAtTime(-w, t, 1); this.padPan[1].pan.setTargetAtTime(w, t, 1);
        this.L.arp.dSend.gain.setTargetAtTime(st.delay * 1.2, t, 1);
        this.L.pad.vSend.gain.setTargetAtTime(st.verb * 0.8, t, 1);
        if (Math.random() < 0.5) this.arpPat = pick(ARPS).slice();
      }
      this.updateLevels(1.2, true);
    },

    // ---------- Secuenciador (anticipación de 0,35 s, intervalo de 90 ms) ----------
    tick() {
      const c = this.ctx;
      if (!c || c.state !== 'running') return;
      const now = c.currentTime;
      if (this.nt < now) this.nt = now + 0.05; // tras una suspensión
      if (this.pending && this.pendingNow) { this.commitStyle(now + 0.05); this.nt = now + 0.1; }
      const ahead = now + 0.35;
      let guard = 0;
      while (this.nt < ahead && guard++ < 32) {
        // Los cambios de tema esperan al siguiente tiempo (negra) para entrar a compás
        if (this.pending && this.k % 4 === 0) this.commitStyle(this.nt);
        const s16 = 60 / (this.bpm || 60) / 4;
        if (this.st) this.step(this.nt, s16);
        this.nt += s16; this.k++;
      }
      // Limpieza de la lista de voces largas
      if (this.held.length > 40) this.held = this.held.filter((v) => v.end > now);
    },

    step(t, s16) {
      const st = this.st, s = this.k % 16, dyn = st.dyn, I = dyn ? this.I : 1;
      if (s === 0) {
        this.bar++;
        if (this.newChord || this.bar >= this.chordEnd) this.nextChord(t, s16);
        // Arco de energía (respira cada ~16 compases) y secciones de "respiro" ocasionales
        this.energy = 0.55 + 0.45 * Math.sin((this.bar / st.arc) * Math.PI * 2 + this.phase);
        if (dyn && this.bar >= this.nextBreak) { this.breakUntil = this.bar + (Math.random() < 0.5 ? 2 : 4); this.nextBreak = this.bar + 20 + ((Math.random() * 20) | 0); }
      }
      const brk = this.bar < this.breakUntil;
      const lv = this.lastLv;

      // Bajo
      if (lv.bass > 0.01 && st.bassPat !== 'long' && !brk) {
        const p = BASS[st.bassPat][s];
        if (p && Math.random() < (p >= 1 ? 1 : p * (0.4 + I))) {
          const off = st.bassPat === 'ost' ? OST[s] : (s === 8 && Math.random() < 0.3 ? 12 : 0);
          this.bassNote(this.bassRoot + off, t, s16 * (st.bassPat === 'ost' ? 0.9 : 1.8), p >= 1 ? 0.9 : 0.6);
        }
      }
      // Arpegio
      const every = 4 / st.arpRate;
      if (lv.arp > 0.01 && s % every === 0) {
        const p = st.arpDens * (0.5 + 0.5 * this.energy) * (dyn ? 0.4 + I : 1) * (brk ? 0.4 : 1);
        const idx = this.arpPat[this.arpPos++ % this.arpPat.length];
        if (idx >= 0 && Math.random() < p) {
          const m = this.ladAt(st.arpLo, idx);
          this.fm(mtof(m), t, st.arpDec, 0.22 * (s % 4 === 0 ? 1 : 0.75), st.arpRatio, st.arpIdx, this.L.arp, 0.004);
        }
      }
      // Campanas: leitmotiv en cola o paseo aleatorio por la escala
      if (lv.bell > 0.01) {
        for (let i = this.mq.length - 1; i >= 0; i--) {
          const q = this.mq[i];
          if (q.k === this.k) { this.fm(mtof(this.ladAt(st.bellLo, q.i)), t, Math.max(st.bellDec, q.d * 4 * s16 + 0.6), 0.2, st.bellRatio, 0.9, this.L.bell, 0.006); this.mq.splice(i, 1); }
          else if (q.k < this.k) this.mq.splice(i, 1);
        }
        if (!this.mq.length && s % 2 === 0 && Math.random() < st.bellDens * this.energy) {
          this.bellIdx = clamp(this.bellIdx + pick([-2, -1, -1, 1, 1, 2]), 0, 8);
          this.fm(mtof(this.ladAt(st.bellLo, this.bellIdx)), t, st.bellDec, 0.14, st.bellRatio, 0.8, this.L.bell, 0.006);
        }
      }
      // Percusión
      if (lv.perc > 0.01 && !brk) {
        const kit = KITS[st.kit];
        for (const inst in kit) {
          const p = kit[inst][s];
          if (!p) continue;
          if (Math.random() < (p >= 1 ? 1 : clamp(p * (dyn ? I * 1.5 : 1) * (0.6 + 0.4 * this.energy), 0, 1))) this.drum(inst, t, p >= 1 ? 1 : 0.55, this.L.perc);
        }
      }
      // Latido cuando la estabilidad es crítica (aunque la percusión esté apagada)
      if (dyn && this.danger > 0.05 && (s === 0 || s === 3)) this.drum('kick', t, (s ? 0.55 : 0.8) * this.danger * 0.7, this.beatG);
    },

    // Cambio de acorde: cadena de Markov + voces largas (pad, coro, dron, brillo)
    nextChord(t, s16) {
      const st = this.st, P = PROG[st.prog];
      if (!this.newChord) {
        const opts = P[this.chordId] ? P[this.chordId].nx : [st.start];
        let id = pick(opts);
        if (id === this.prevId && opts.length > 1 && Math.random() < 0.7) id = pick(opts);
        this.prevId = this.chordId; this.chordId = id;
      }
      this.newChord = false;
      const C = P[this.chordId] || P[st.start];
      this.chord = C;
      this.pcs = Array.from(new Set(C.iv.map((i) => (C.r + i) % 12))).sort((a, b) => a - b);
      this.bassRoot = C.r > 44 ? C.r - 12 : C.r;
      this.chordEnd = this.bar + st.bars;
      const dur = st.bars * 16 * s16;
      const lv = this.lastLv;

      // Voicing con conducción de voces: cada nota busca la octava más cercana a la voz anterior
      if (lv.pad > 0.01) {
        const tones = C.iv.slice(1).concat(C.iv.length < 5 ? [12] : []).slice(0, st.padN);
        const prev = this.voicing;
        const center = prev ? prev.reduce((a, b) => a + b, 0) / prev.length : 62;
        const v = tones.map((iv) => {
          let m = C.r + iv; while (m < center - 6) m += 12; while (m > center + 6) m -= 12; return clamp(m, 50, 79);
        });
        this.voicing = v;
        const vel = 0.05 * (WAVE_K[st.padWave] || 1) / Math.sqrt(v.length / 3);
        v.forEach((m, i) => this.padNote(m, t + i * 0.03, dur, vel, st.padWave, this.padPan[i % 2]));
      }
      if (st.bassPat === 'long' && lv.bass > 0.01) this.bassNote(this.bassRoot, t, dur * 0.9, 0.7, true);
      if (lv.drone > 0.01) {
        const r = st.dronePedal ? 33 : (C.r % 12) + 24 + (C.r % 12 < 4 ? 12 : 0);
        this.longNote(r, t, dur, 0.16, 'triangle', this.droneLP, 3, 3);
        this.longNote(r + 7, t + 0.4, dur, 0.08, 'triangle', this.droneLP, 3, 3);
      }
      if (lv.choir > 0.01) {
        const tones = [C.r + 12].concat(C.iv.slice(1, 4).map((i) => C.r + 12 + i));
        tones.forEach((m, i) => { while (m > 72) m -= 12; this.choirNote(m, t + i * 0.08, dur, 0.06); });
        // la vocal muta: "a" ↔ "o"
        const o = Math.random() < 0.5, F = o ? [480, 820, 2800] : [720, 1160, 2600];
        this.formants.forEach((b, i) => b.frequency.setTargetAtTime(F[i], t, 1.5));
      }
      if (lv.shim > 0.01) {
        const tops = this.pcs.map((pc) => pc + 84);
        for (let i = 0; i < 2; i++) this.longNote(pick(tops), t + rnd(0.2, 1.5), dur * 0.8, 0.05, 'sine', this.shimPan[i], 2.5, 3);
      }
      // ¿Leitmotiv en este acorde?
      if (lv.bell > 0.01 && st.motifs && Math.random() < st.motifP) {
        const M = pick(st.motifs), shift = Math.random() < 0.3 ? 2 : 0, k0 = this.k + (Math.random() < 0.5 ? 0 : 8);
        M.forEach(([step, i, d]) => this.mq.push({ k: k0 + step * 2, i: i + shift, d }));
      }
      // El arpegio muta: a veces intercambia dos notas, a veces cambia de figura
      if (Math.random() < 0.3) { const a = this.arpPat, i = (Math.random() * a.length) | 0, j = (Math.random() * a.length) | 0; const x = a[i]; a[i] = a[j]; a[j] = x; }
      if (Math.random() < 0.12) this.arpPat = pick(ARPS).slice();
      this.updateEatLadder();
    },

    // Nota n-ésima (índice) de la escala del acorde actual a partir de 'lo'
    ladAt(lo, idx) {
      const pcs = this.pcs || [9, 0, 4, 7, 11];
      let m = lo; while (pcs.indexOf(((m % 12) + 12) % 12) < 0) m++;
      let n = 0;
      while (n < idx) { m++; if (pcs.indexOf(m % 12) >= 0) n++; }
      return m;
    },
    updateEatLadder() {
      const pcs = this.pcs || [9, 0, 2, 4, 7];
      const lad = [];
      for (let m = 57; m <= 100; m++) if (pcs.indexOf(m % 12) >= 0) lad.push(m);
      this.eatLad = lad;
    },

    // Niveles de capa según estilo e intensidad (solo se reprograma si cambia)
    updateLevels(tau, force) {
      if (!this.ctx) return;
      const st = this.st, t = this.ctx.currentTime, I = st && st.dyn ? this.I : 1;
      const g = (v, a, b) => (st && st.dyn ? v * smooth(I, a, b) : v);
      const tgt = st ? {
        pad: st.pad, bass: g(st.bass, 0.1, 0.35), arp: g(st.arp, 0.12, 0.45), perc: g(st.perc, 0.3, 0.6),
        bell: st.bell, choir: st.choir, drone: st.drone, shim: st.dyn ? st.shim * (0.5 + 0.5 * I) : st.shim,
      } : {};
      for (const n in this.L) {
        const v = (tgt[n] || 0);
        if (!force && Math.abs((this.lastLv[n] || 0) - v) < 0.01) continue;
        this.lastLv[n] = v;
        this.L[n].gain.setTargetAtTime(v * LVL[n], t, tau);
      }
      const cut = st ? st.padCut * (st.dyn ? 0.55 + 0.9 * I : 1) : 600;
      if (force || Math.abs((this.lastCut || 0) - cut) > 20) { this.lastCut = cut; this.padLP.frequency.setTargetAtTime(cut, t, tau); }
    },

    // Desvanece las notas largas que siguen sonando (crossfade sin clics)
    releaseHeld(t, fade) {
      for (const v of this.held) {
        if (v.end <= t) continue;
        const p = v.g.gain;
        if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t); else { p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); }
        p.setTargetAtTime(0, t, fade / 4);
        v.end = t;
      }
      this.held = this.held.filter((v) => v.end > t);
    },

    // ---------- Voces de la música ----------
    padNote(m, t, dur, vel, wave, dest) {
      const c = this.ctx, f = mtof(m), g = c.createGain(), atk = Math.min(2.5, dur * 0.3), rel = 3;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + atk);
      g.gain.setValueAtTime(vel, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + rel);
      for (let i = 0; i < 2; i++) {
        const o = c.createOscillator(); o.type = wave; o.frequency.value = f; o.detune.value = (i ? 7 : -7) + rnd(-2, 2);
        o.connect(g); o.start(t); o.stop(t + dur + rel + 0.05);
      }
      g.connect(dest);
      this.held.push({ g, end: t + dur + rel });
    },
    longNote(m, t, dur, vel, wave, dest, atk, rel) {
      const c = this.ctx, g = c.createGain(), o = c.createOscillator();
      o.type = wave; o.frequency.value = mtof(m);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + atk);
      g.gain.setValueAtTime(vel, t + Math.max(atk, dur)); g.gain.linearRampToValueAtTime(0, t + Math.max(atk, dur) + rel);
      o.connect(g); g.connect(dest); o.start(t); o.stop(t + Math.max(atk, dur) + rel + 0.05);
      this.held.push({ g, end: t + dur + rel });
      return g;
    },
    choirNote(m, t, dur, vel, dest, list) {
      const c = this.ctx, g = c.createGain(), f = mtof(m), atk = Math.min(1.8, dur * 0.4), rel = 2.5;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + atk);
      g.gain.setValueAtTime(vel, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + rel);
      for (let i = 0; i < 2; i++) {
        const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = (i ? 9 : -9) + rnd(-3, 3);
        this.vibG.connect(o.detune);
        // al terminar, se suelta la conexión del vibrato para que la voz pueda liberarse
        o.onended = () => { try { this.vibG.disconnect(o.detune); } catch (e) { /* ya desconectado */ } };
        o.connect(g); o.start(t); o.stop(t + dur + rel + 0.05);
      }
      g.connect(dest || this.choirIn);
      (list || this.held).push({ g, end: t + dur + rel });
      return g;
    },
    bassNote(m, t, dur, vel, long) {
      const c = this.ctx, g = c.createGain(), f = mtof(m);
      const o = c.createOscillator(), o2 = c.createOscillator();
      o.type = 'sine'; o.frequency.value = f; o2.type = 'triangle'; o2.frequency.value = f * 2;
      const g2 = c.createGain(); g2.gain.value = 0.25;
      const atk = long ? 0.6 : 0.008, v = 0.32 * vel;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + atk);
      if (long) { g.gain.setValueAtTime(v, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + 1.5); }
      else g.gain.setTargetAtTime(0, t + atk, dur * 0.45);
      const end = t + (long ? dur + 1.6 : dur * 1.7 + 0.05);
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(this.bassLP);
      o.start(t); o2.start(t); o.stop(end); o2.stop(end);
      if (long) this.held.push({ g, end });
    },
    // Batería sintetizada
    drum(kind, t, v, dest) {
      const c = this.ctx;
      if (kind === 'kick') {
        const o = c.createOscillator(), g = c.createGain();
        o.frequency.setValueAtTime(115, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.22);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.55 * v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
        o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.45);
      } else if (kind === 'tom') {
        const o = c.createOscillator(), g = c.createGain();
        o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(58, t + 0.3);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5 * v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
        o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.72);
        this.noise(t, 0.12, 0.08 * v, 'lowpass', 900, 300, 0.7, dest);
      } else if (kind === 'snap') this.noise(t, 0.16, 0.2 * v, 'bandpass', 1900, 1200, 1.1, dest);
      else if (kind === 'rim') this.noise(t, 0.06, 0.14 * v, 'bandpass', 3200, 2800, 4, dest);
      else if (kind === 'hat') this.noise(t, 0.035 + 0.02 * v, 0.07 * v, 'highpass', 7500, 7000, 0.7, dest);
      else if (kind === 'shk') this.noise(t, 0.07, 0.05 * v, 'bandpass', 6000, 5000, 1.5, dest, 0.02);
      else if (kind === 'tick') this.osc('sine', 2900, t, 0.03, 0.05 * v, { dest, f2: 2600 });
    },

    // ---------- Herramientas de síntesis de efectos ----------
    // Puerta por tipo de sonido (rate-limit)
    gate(name, ms) {
      const n = nowMs();
      if (n - (this.gates[name] || -1e9) < ms) return false;
      this.gates[name] = n; return true;
    },
    // Presupuesto de voces: con muchos eventos, los sonidos poco importantes se descartan
    allow(prio, dur) {
      const c = this.ctx; if (!c) return false;
      const t = c.currentTime;
      if (this.load.length > 12) this.load = this.load.filter((e) => e > t);
      const cap = prio >= 2 ? 99 : prio === 1 ? 26 : 16;
      if (this.load.length >= cap) return false;
      this.load.push(t + (dur || 0.3));
      return true;
    },
    osc(type, f, t, dur, vol, o) {
      o = o || {};
      const c = this.ctx, os = c.createOscillator(), g = c.createGain(), atk = o.atk || 0.005;
      os.type = type; os.frequency.setValueAtTime(f, t);
      if (o.f2) os.frequency.exponentialRampToValueAtTime(o.f2, t + (o.sweep || dur));
      if (o.det) os.detune.value = o.det;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + atk);
      g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur, atk + 0.01));
      os.connect(g); g.connect(o.dest || this.sfx);
      if (o.wet) { const w = c.createGain(); w.gain.value = o.wet; g.connect(w); w.connect(o.wetDest || this.sfxWet); }
      os.start(t); os.stop(t + dur + 0.05);
      return g;
    },
    noise(t, dur, vol, ftype, f1, f2, q, dest, atk, wet) {
      const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = this.noiseBuf; s.loop = true;
      f.type = ftype || 'bandpass'; f.Q.value = q || 1;
      f.frequency.setValueAtTime(f1, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f2 || f1), t + dur);
      atk = atk || 0.003;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + atk); g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur, atk + 0.01));
      s.connect(f); f.connect(g); g.connect(dest || this.sfx);
      if (wet) { const w = c.createGain(); w.gain.value = wet; g.connect(w); w.connect(this.sfxWet); }
      s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
      return g;
    },
    // Síntesis FM de dos operadores: campanas, marimbas, cristales
    fm(f, t, dur, vol, ratio, index, dest, atk, wet) {
      const c = this.ctx, o = c.createOscillator(), m = c.createOscillator(), mg = c.createGain(), g = c.createGain();
      o.frequency.value = f; m.frequency.value = f * ratio;
      mg.gain.setValueAtTime(f * index, t); mg.gain.exponentialRampToValueAtTime(f * index * 0.03 + 0.5, t + Math.min(dur, 0.25 + dur * 0.4));
      m.connect(mg); mg.connect(o.frequency);
      atk = atk || 0.004;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + atk); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(dest || this.sfx);
      if (wet) { const w = c.createGain(); w.gain.value = wet; g.connect(w); w.connect(this.sfxWet); }
      o.start(t); m.start(t); o.stop(t + dur + 0.05); m.stop(t + dur + 0.05);
      return g;
    },
    // Ducking de la música (y filtro opcional)
    duckMusic(amount, hold, rel, lp) {
      if (!this.ctx) return;
      const t = this.ctx.currentTime, p = this.duck.gain;
      if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t); else { p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); }
      p.setTargetAtTime(amount, t, 0.03); p.setTargetAtTime(1, t + hold, rel / 3);
      if (lp) {
        const f = this.mLP.frequency;
        if (f.cancelAndHoldAtTime) f.cancelAndHoldAtTime(t); else { f.cancelScheduledValues(t); f.setValueAtTime(f.value, t); }
        f.setTargetAtTime(lp, t, 0.02); f.setTargetAtTime(this.lpBase(), t + hold, rel / 3);
      }
    },
    lpBase() { return this.paused ? 650 : 18000; },
    rootHz(oct) { const r = this.chord ? this.chord.r % 12 : 9; return mtof(r + 12 * (oct || 2)); },

    // ---------- Efectos de la API pública ----------
    // Devorar: nota de la escala del acorde actual; la cadena sube como melodía.
    eat(rel, chain, gold) {
      if (!this.ctx || !this.gate('eat', 28) || !this.allow(gold ? 1 : 0, 0.3)) return;
      const t = this.ctx.currentTime, lad = this.eatLad || (this.updateEatLadder(), this.eatLad);
      const start = rel > 0.45 ? 0 : 4; // los bocados grandes empiezan más grave
      const n = lad.length - start;
      let i = Math.max(0, (chain | 0) - 1);
      if (i >= n) i = n - 3 + ((i - n) % 3); // en cadenas muy largas oscila en lo alto
      const m = lad[start + i], f = mtof(m);
      const v = 0.075 + Math.min(0.05, rel * 0.08);
      this.fm(f, t, 0.18 + rel * 0.25, v, 2, 1.3, this.sfx, 0.003, 0.12);
      if (rel > 0.3) this.osc('sine', f / 2, t, 0.14, 0.05 * Math.min(1, rel), { f2: f / 2.1 });
      if (chain >= 5) this.osc('sine', mtof(lad[Math.min(lad.length - 1, start + i + 2)]), t + 0.03, 0.35, 0.025, { wet: 0.5 });
      if (gold) {
        this.fm(f * 2, t + 0.04, 0.9, 0.05, 3.5, 0.8, this.sfx, 0.004, 0.6);
        this.osc('sine', f * 3, t + 0.09, 0.7, 0.025, { wet: 0.8 });
      }
    },
    // Romper: golpe grave + crujido + escombros, con peso según el tamaño
    brk(rel) {
      if (!this.ctx || !this.gate('brk', 55) || !this.allow(1, 0.6)) return;
      const t = this.ctx.currentTime, w = clamp(((rel || 1) - 0.8) / 3, 0, 1);
      this.osc('sine', 150 - 70 * w, t, 0.28 + 0.5 * w, 0.32 + 0.2 * w, { f2: this.rootHz(2) * (w > 0.5 ? 1 : 1.5), sweep: 0.2 + 0.3 * w });
      this.noise(t, 0.2 + 0.4 * w, 0.22, 'bandpass', 1800 - 900 * w, 220, 0.9);
      const n = 2 + Math.round(3 * w);
      for (let k = 0; k < n; k++) this.noise(t + rnd(0.03, 0.18 + 0.2 * w), 0.04, 0.05, 'highpass', rnd(2000, 4500), 1800, 0.8);
      if (w > 0.45) this.noise(t, 1.3, 0.12 * w, 'lowpass', 400, 60, 0.7, this.sfx, 0.02, 0.6);
    },
    hit() {
      if (!this.ctx || !this.gate('hit', 80) || !this.allow(2, 0.5)) return;
      const t = this.ctx.currentTime;
      this.osc('sine', 170, t, 0.4, 0.4, { f2: 42 });
      this.osc('sawtooth', 120, t, 0.3, 0.08, { f2: 50 });
      this.noise(t, 0.35, 0.25, 'lowpass', 2500, 250, 0.8);
      this.noise(t + 0.01, 0.12, 0.08, 'bandpass', 3500, 1500, 3);
    },
    pulse() {
      if (!this.ctx || !this.gate('pulse', 120) || !this.allow(2, 0.9)) return;
      const t = this.ctx.currentTime;
      this.noise(t, 0.7, 0.28, 'bandpass', 300, 4000, 1.2, this.sfx, 0.05, 0.4); // whoosh hacia fuera
      this.osc('sine', 90, t, 0.8, 0.42, { f2: 28 });
      this.osc('sine', this.rootHz(4), t + 0.05, 0.9, 0.03, { f2: this.rootHz(5), wet: 0.8, atk: 0.1 });
    },
    buy() {
      if (!this.ctx || !this.gate('buy', 40)) return;
      const t = this.ctx.currentTime, lad = this.eatLad || (this.updateEatLadder(), this.eatLad);
      const b = lad.findIndex((m) => m >= 72);
      [0, 1, 2].forEach((k) => this.fm(mtof(lad[b + k * 2] || 84), t + k * 0.06, 0.6 + k * 0.2, 0.08 - k * 0.015, 3, 0.7, this.sfx, 0.004, 0.35));
    },
    deny() {
      if (!this.ctx || !this.gate('deny', 90)) return;
      const t = this.ctx.currentTime;
      this.osc('triangle', 220, t, 0.11, 0.07, { f2: 200 });
      this.osc('triangle', 155, t + 0.08, 0.16, 0.07, { f2: 140 });
    },
    click() {
      if (!this.ctx || !this.gate('click', 25)) return;
      const t = this.ctx.currentTime;
      this.osc('sine', 1700, t, 0.045, 0.045, { f2: 1250 });
      this.noise(t, 0.015, 0.02, 'highpass', 5000, 5000, 0.7);
    },
    type() {
      if (!this.ctx || !this.gate('type', 22) || !this.allow(0, 0.02)) return;
      const t = this.ctx.currentTime;
      this.noise(t, 0.014, 0.025, 'bandpass', rnd(3000, 4200), 3000, 2);
      this.osc('sine', rnd(2200, 2600), t, 0.012, 0.008);
    },
    // Nueva escala: arpegio ascendente en la armonía de la escala nueva + oleada
    milestone() {
      if (!this.ctx || !this.gate('milestone', 400)) return;
      const t = this.ctx.currentTime, st = styleFor('run', this.scale, false), C = PROG[st.prog][st.start];
      const notes = C.iv.map((i) => C.r + 12 + i).concat(C.iv.map((i) => C.r + 24 + i)).slice(0, 7);
      notes.forEach((m, i) => this.fm(mtof(m), t + 0.05 + i * 0.075, 1.6, 0.07, 3, 0.9, this.sfx, 0.005, 0.6));
      this.noise(t, 0.8, 0.12, 'lowpass', 300, 5000, 1, this.sfx, 0.6, 0.5);
      this.osc('sine', mtof(C.r - 12), t, 2, 0.25, { atk: 0.05 });
      this.duckMusic(0.55, 0.6, 1.5);
    },
    revive() {
      if (!this.ctx || !this.gate('revive', 500)) return;
      const t = this.ctx.currentTime;
      [57, 64, 69, 73, 76].forEach((m, i) => this.osc('sine', mtof(m), t + i * 0.09, 1.4, 0.07, { atk: 0.15, wet: 0.6 }));
      this.noise(t, 1.2, 0.08, 'bandpass', 400, 6000, 2, this.sfx, 0.4, 0.5);
    },
    // Muerte: caída, la música se aparta
    end() {
      if (!this.ctx || !this.gate('end', 500)) return;
      const t = this.ctx.currentTime;
      this.osc('sine', 330, t, 1.6, 0.14, { f2: 70 });
      this.osc('triangle', 220, t + 0.1, 1.5, 0.05, { f2: 55 });
      this.noise(t, 1.5, 0.14, 'lowpass', 4000, 100, 0.5, this.sfx, 0.01, 0.4);
      this.duckMusic(0.25, 1.2, 2.5, 500);
      this.danger = 0;
    },
    // Crescendo épico (evento run:victory): culmina a los ~1,7 s, cuando llega victory()
    victorySwell() {
      if (!this.ctx || !this.gate('swell', 5000)) return;
      const t = this.ctx.currentTime + 0.05;
      this.setTheme(null);
      this.swell = [];
      [45, 57, 61, 64, 69, 71, 73, 76].forEach((m, i) => {
        const g = this.choirNote(m > 70 ? m - 12 : m, t + i * 0.04, 4.5, 0.05, this.finLP, this.swell);
        g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.012, t + 0.4); g.gain.exponentialRampToValueAtTime(0.07, t + 1.7);
        g.gain.setTargetAtTime(0, t + 3.5, 1);
      });
      const r = this.noise(t, 1.75, 0.18, 'bandpass', 250, 7000, 1.5, this.fin, 1.6);
      this.swell.push({ g: r, end: t + 1.8 });
      const sub = this.osc('sine', 40, t, 2.2, 0.3, { f2: 55, atk: 1.6 });
      this.swell.push({ g: sub, end: t + 2.2 });
    },
    // Final: Big Bang (coincide con el destello blanco) y luego silencio
    victory() {
      if (!this.ctx || !this.gate('victory', 4000)) return;
      const t = this.ctx.currentTime + 0.02;
      this.setTheme(null);
      for (const v of this.swell) { const p = v.g.gain; p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); p.linearRampToValueAtTime(0, t + 0.04); }
      this.swell = [];
      this.duckMusic(1, 0, 0.1);
      // Explosión
      this.osc('sine', 70, t, 5, 0.9, { f2: 20, sweep: 4 });
      this.osc('triangle', 140, t, 2.2, 0.3, { f2: 35 });
      this.noise(t, 4, 0.55, 'lowpass', 9000, 120, 0.6, this.sfx, 0.004, 0.9);
      for (let k = 0; k < 10; k++) this.noise(t + rnd(0.05, 1.5), 0.05, 0.06, 'highpass', rnd(3000, 8000), 2000, 0.8, this.sfx, 0.002, 0.8);
      // Estela luminosa en La mayor que se apaga hasta el silencio
      [81, 85, 88, 93, 95, 100].forEach((m, i) => this.longNote(m, t + 0.3 + i * 0.12, 1.5, 0.035, 'sine', this.fin, 0.8, 7));
      [57, 64, 69, 73].forEach((m, i) => this.choirNote(m, t + 0.6 + i * 0.1, 1.5, 0.035, this.finLP, []));
    },

    // ---------- Efectos nuevos (vía bus) ----------
    // Púlsar aparece: zumbido rítmico
    pulsar() {
      if (!this.ctx || !this.gate('pulsar', 400) || !this.allow(1, 2)) return;
      const c = this.ctx, t = c.currentTime;
      const o = c.createOscillator(), lp = c.createBiquadFilter(), am = c.createGain(), env = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
      o.type = 'square'; o.frequency.value = this.rootHz(2);
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(1600, t + 0.8); lp.frequency.linearRampToValueAtTime(400, t + 2);
      lfo.type = 'square'; lfo.frequency.value = 7.5; lg.gain.value = 0.5; am.gain.value = 0.5;
      lfo.connect(lg); lg.connect(am.gain);
      env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(0.14, t + 0.25); env.gain.setValueAtTime(0.14, t + 1.2); env.gain.linearRampToValueAtTime(0, t + 2);
      o.connect(lp); lp.connect(am); am.connect(env); env.connect(this.sfx);
      const w = c.createGain(); w.gain.value = 0.4; env.connect(w); w.connect(this.sfxWet);
      o.start(t); lfo.start(t); o.stop(t + 2.05); lfo.stop(t + 2.05);
      for (let k = 0; k < 6; k++) this.osc('sine', this.rootHz(6), t + 0.15 + k * (2 / 15), 0.05, 0.025);
    },
    // La onda del púlsar te golpea
    ring() {
      if (!this.ctx || !this.gate('ring', 150) || !this.allow(2, 0.5)) return;
      const t = this.ctx.currentTime;
      this.osc('sine', 420, t, 0.4, 0.3, { f2: 55 });
      this.osc('square', 210, t, 0.2, 0.04, { f2: 60 });
      this.noise(t, 0.3, 0.16, 'bandpass', 1400, 300, 3);
      this.duckMusic(0.6, 0.15, 0.6, 1200);
    },
    // Enjambre: chirrido que crece
    swarm() {
      if (!this.ctx || !this.gate('swarm', 600) || !this.allow(1, 1.6)) return;
      const c = this.ctx, t = c.currentTime;
      for (let k = 0; k < 5; k++) {
        const t0 = t + k * 0.12, f = rnd(1300, 2100), p = c.createStereoPanner(), bp = c.createBiquadFilter(), o = c.createOscillator(), g = c.createGain();
        p.pan.value = rnd(-0.7, 0.7);
        bp.type = 'bandpass'; bp.frequency.value = f * 1.2; bp.Q.value = 4;
        o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t0); o.frequency.exponentialRampToValueAtTime(f * 1.6, t0 + 1);
        const tr = c.createOscillator(), tg = c.createGain(); tr.frequency.value = rnd(18, 26); tg.gain.value = 0.02;
        tr.connect(tg); tg.connect(g.gain);
        g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.03 + k * 0.006, t0 + 0.8); g.gain.linearRampToValueAtTime(0, t0 + 1.1);
        o.connect(bp); bp.connect(g); g.connect(p); p.connect(this.sfx);
        o.start(t0); tr.start(t0); o.stop(t0 + 1.15); tr.stop(t0 + 1.15);
      }
    },
    kill(kind) {
      if (!this.ctx || !this.gate('kill', 40) || !this.allow(1, 0.6)) return;
      const t = this.ctx.currentTime, lad = this.eatLad || (this.updateEatLadder(), this.eatLad);
      if (kind === 'anti') { // antimateria: estallido cristalino
        this.fm(mtof(lad[lad.length - 3] || 88), t, 0.7, 0.07, 2.76, 2, this.sfx, 0.002, 0.6);
        this.noise(t, 0.15, 0.08, 'highpass', 6000, 4000, 0.8);
      } else if (kind === 'swarm') { // enjambre: chasquido
        this.osc('sine', 950, t, 0.09, 0.08, { f2: 280 });
        this.noise(t, 0.03, 0.05, 'bandpass', 3000, 2000, 2);
      } else if (kind === 'pulsar') { // púlsar: se apaga
        this.osc('square', 220, t, 0.7, 0.05, { f2: 40 });
        this.osc('sine', 110, t, 0.8, 0.3, { f2: 30 });
        this.noise(t, 0.9, 0.12, 'lowpass', 3000, 100, 0.7, this.sfx, 0.004, 0.5);
      } else this.osc('sine', 700, t, 0.12, 0.08, { f2: 200 });
    },
    // Aparece el Núcleo: oleada grave, metales y gong
    bossAppear() {
      if (!this.ctx || !this.gate('boss', 2000)) return;
      const c = this.ctx, t = c.currentTime;
      this.osc('sine', 32, t, 3.5, 0.45, { f2: 45, atk: 2 });
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2;
      lp.frequency.setValueAtTime(180, t); lp.frequency.exponentialRampToValueAtTime(2000, t + 2.4); lp.frequency.exponentialRampToValueAtTime(300, t + 5);
      lp.connect(this.sfx); const w = c.createGain(); w.gain.value = 0.5; lp.connect(w); w.connect(this.sfxWet);
      [33, 40, 45, 52].forEach((m, i) => this.osc('sawtooth', mtof(m), t, 5, 0.09 - i * 0.012, { atk: 2.2, dest: lp, det: rnd(-6, 6) }));
      this.fm(110, t + 2.3, 5, 0.18, 1.41, 3, this.sfx, 0.004, 0.8); // gong
      this.noise(t, 2.3, 0.12, 'bandpass', 200, 5000, 1.2, this.sfx, 2.2, 0.4);
      this.duckMusic(0.3, 2.2, 2);
    },
    bossHit() {
      if (!this.ctx || !this.gate('bossHit', 120) || !this.allow(1, 0.4)) return;
      const t = this.ctx.currentTime;
      this.fm(rnd(170, 200), t, 0.35, 0.09, 3.17, 2.5, this.sfx, 0.002, 0.3);
      this.noise(t, 0.12, 0.12, 'lowpass', 1500, 200, 0.8);
    },
    bossPhaseFx(phase) {
      if (!this.ctx || !this.gate('bossPhase', 1000)) return;
      const t = this.ctx.currentTime;
      this.noise(t, 1.1, 0.14, 'bandpass', 300, 5000, 2, this.sfx, 1);
      this.osc('sine', 60, t + 1.1, 1.6, 0.55, { f2: 25 });
      this.noise(t + 1.1, 1, 0.25, 'lowpass', 5000, 150, 0.7, this.sfx, 0.004, 0.6);
      const C = PROG.boss.E7;
      C.iv.slice(0, 4).forEach((i, k) => this.osc('sawtooth', mtof(C.r + 12 + i), t + 1.1, 1.2, 0.04, { det: rnd(-8, 8), wet: 0.4 }));
      this.bossPhase = phase | 0;
      this.duckMusic(0.35, 1.1, 1);
      if (this.theme === 'run' && this.boss) this.newChord = true;
    },
    bossDefeat() {
      if (!this.ctx || !this.gate('bossDefeat', 3000)) return;
      const t = this.ctx.currentTime;
      this.osc('sine', 80, t, 3.5, 0.8, { f2: 22 });
      this.noise(t, 3, 0.45, 'lowpass', 8000, 120, 0.6, this.sfx, 0.004, 0.8);
      this.fm(mtof(93), t, 2.5, 0.06, 2.76, 2.5, this.sfx, 0.002, 0.9);
      this.boss = false;
      // silencio breve y luego el tema luminoso (si el final no llega antes)
      this.setTheme(null);
      setTimeout(() => {
        const won = nowMs() - (this.gates.victory || -1e9) < 8000 || nowMs() - (this.gates.swell || -1e9) < 8000;
        if (!won && this.theme === null && V.game && V.game.state === 'run') this.setTheme('tri');
      }, 2500);
    },
    achievement() {
      if (!this.ctx || !this.gate('ach', 300)) return;
      const t = this.ctx.currentTime, lad = this.eatLad || (this.updateEatLadder(), this.eatLad);
      const b = lad.findIndex((m) => m >= 81);
      [lad[b], lad[b + 2], lad[b + 4]].forEach((m, i) => this.fm(mtof(m || 88), t + i * 0.11, 1.8 - i * 0.3, 0.06 - i * 0.012, 3.5, 0.7, this.sfx, 0.003, 0.7));
    },
    // Transmisión entrante: chirrido de radio + estática
    transmission() {
      if (!this.ctx || !this.gate('story', 1500)) return;
      const t = this.ctx.currentTime;
      this.noise(t, 0.3, 0.035, 'bandpass', 2500, 1800, 1.5, this.sfx, 0.02);
      this.osc('sine', 1320, t + 0.05, 0.08, 0.065, { wet: 0.3 });
      this.osc('sine', 1760, t + 0.16, 0.12, 0.065, { wet: 0.4 });
      this.duckMusic(0.7, 2.5, 2);
    },

    // ---------- Por fotograma: pausa, intensidad dinámica, peligro ----------
    onFrame(dt) {
      if (!this.ctx) return;
      const g = V.game;
      const paused = !!(g && g.paused && (g.state === 'run' || g.state === 'ending'));
      if (paused !== this.paused) {
        this.paused = paused;
        const t = this.ctx.currentTime;
        this.mLP.frequency.setTargetAtTime(this.lpBase(), t, paused ? 0.12 : 0.3);
        this.duck.gain.setTargetAtTime(paused ? 0.7 : 1, t, 0.2);
        this.applyVol();
      }
      const r = g && g.run;
      if (this.theme === 'run' && r && !paused) {
        const chain = Math.max(r.combo || 0, r.chain || 0);
        const ratio = r.stabMax ? r.stab / r.stabMax : 1;
        this.danger = r.over ? 0 : clamp((0.28 - ratio) / 0.28, 0, 1);
        const target = clamp(0.15 + this.baseI * 0.5 + clamp(chain / 16, 0, 1) * 0.35 + this.scale * 0.025 + (this.boss ? 0.3 + this.bossPhase * 0.08 : 0) + this.danger * 0.15, 0, 1);
        // sube rápido, baja despacio
        const k = Math.min(1, dt * (target > this.I ? 0.8 : 0.25));
        this.I += (target - this.I) * k;
      } else if (this.theme !== 'run') this.danger = 0;
      this.lvT = (this.lvT || 0) + dt;
      if (this.lvT > 0.25) { this.lvT = 0; this.updateLevels(0.8); }
    },
  };

  // =====================================================================
  // Bus de eventos
  // =====================================================================
  const on = (ev, fn) => V.bus && V.bus.on(ev, fn);
  on('menu:open', () => { A.boss = false; A.setTheme('menu'); });
  on('tree:open', () => { A.boss = false; A.setTheme('tree'); });
  on('run:start', (run) => {
    A.boss = false; A.bossPhase = 0; A.I = 0.3; A.danger = 0;
    A.scale = clamp((run && (run.milestone || 0)) | 0, 0, SCALES.length - 1);
    A.theme = null; A.setTheme('run');
  });
  on('run:milestone', (e) => A.setScale(e && e.m));
  on('run:end', (e) => {
    A.boss = false; A.danger = 0;
    if (!(e && e.run && e.run.victory)) A.setTheme('after');
  });
  on('run:over', () => { A.danger = 0; A.setTheme('after'); }); // al evaporarse (antes llegaba como un 'run:end' duplicado)
  on('run:victory', () => A.victorySwell());
  on('victory', () => A.victory());
  const bossOn = () => { A.bossAppear(); if (!A.boss) { A.boss = true; A.bossPhase = 0; if (A.theme === 'run') A.applyTheme(false); } };
  on('run:boss', bossOn);
  on('run:bossHit', () => A.bossHit());
  on('run:bossPhase', (e) => A.bossPhaseFx(e && e.phase));
  on('run:bossDefeat', () => A.bossDefeat());
  on('run:pulsar', () => A.pulsar());
  on('run:ring', () => A.ring());
  on('run:swarm', () => A.swarm());
  on('run:kill', (e) => A.kill(e && e.kind));
  on('run:hit', () => A.duckMusic(0.45, 0.12, 0.8, 900));
  on('ach:unlock', () => A.achievement());
  on('story:seen', () => A.transmission());
  on('frame', (dt) => A.onFrame(dt || 0.016));

  // Desbloqueo del AudioContext con el primer gesto (teclado, ratón o táctil).
  // Nunca se crea antes de un gesto: así se respeta la política de autoplay.
  if (typeof window !== 'undefined' && window.addEventListener) {
    const unlock = () => { if (!A.sysSuspended) A.ensure(); };
    ['pointerdown', 'keydown', 'touchend'].forEach((ev) => window.addEventListener(ev, unlock, { capture: true, passive: true }));
  }

  V.Audio = A;
})();
