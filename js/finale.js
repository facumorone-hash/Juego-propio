// VOIDLING — cinemática del final (QA H-18): colapso → silencio → BIG BANG → epílogo.
// Todo en el canvas. main.js la arranca al derrotar al Núcleo (startFinale), le pasa la entrada
// (pulsar = avanzar, mantener = saltar, Esc = saltar) y la dibuja mientras el estado es 'finale'.
//
// Línea de tiempo (s desde la derrota; las líneas duran según su longitud, así vale en todos los idiomas):
//   0–3     cámara lenta: estalla el Núcleo, entran las franjas de cine
//   1.5–…   todo el campo cae en espiral hacia el agujero; anillo de fotones y lente gravitatoria crecen
//   3.2–…   V.ENDING[0..3] (LUMEN) como subtítulos; con la [2] entra LUMEN (destello cian)
//   crunch  el universo se reduce a un punto (crescendo de audio.victorySwell)
//   +1.7    silencio (duckMusic) con un punto de luz temblando
//   +1.25   BIG BANG (bus 'victory' → audio.victory()): destello, onda, partículas que se enfrían
//           blanco → naranja → violeta, nacen las primeras estrellas; título V.ENDING[4]
//   epílogo V.ENDING[5]: una mota de luz en un universo joven que crece (y acaba siendo un agujero
//           diminuto, como al empezar el juego); luego la pantalla de victoria encima.
(function () {
  const V = window.V;
  const TAU = V.TAU;
  const clamp = V.clamp, lerp = V.lerp;
  const sm = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  const easeIn = (x) => { x = clamp(x, 0, 1); return x * x * x; };
  const easeOut = (x) => { x = clamp(x, 0, 1); return 1 - (1 - x) * (1 - x) * (1 - x); };
  const RF = () => !!V.reduceFlash;
  const CJK_RE = /[⺀-鿿가-힯豈-﫿＀-￯]/g;
  const F = (w, px) => (V.font ? V.font(w, px) : w + ' ' + px + 'px "Segoe UI",system-ui,sans-serif');

  const HOLD_SKIP = 0.85; // s manteniendo para saltar
  const TAP_MAX = 0.35;   // una pulsación más corta que esto = avanzar
  const T_LINE0 = 3.0;

  // Tiempo de lectura de una línea: ~24 caracteres/s (los CJK cuentan 2,5), entre 3 y 7,5 s.
  // (pulsar adelanta a la línea siguiente, así que quien lee rápido no espera)
  function readDur(s) {
    s = String(s || '');
    const cjk = (s.match(CJK_RE) || []).length;
    return clamp(1.0 + (s.length + cjk * 1.5) / 24, 3, 7.5);
  }
  function endingText(i) {
    const L = V.ENDING || [];
    return L[i] ? String((V.pick ? V.pick(L[i]) : L[i].en || L[i].es) || '') : '';
  }

  // Color de las partículas del Big Bang según su "temperatura" (0 = recién nacidas).
  const TEMP = [[0, [255, 255, 255]], [0.6, [255, 244, 208]], [1.2, [255, 192, 112]], [1.9, [255, 122, 64]], [2.7, [208, 80, 138]], [3.5, [138, 92, 255]], [5, [90, 108, 255]]];
  const LUT = [];
  for (let i = 0; i <= 64; i++) {
    const T = (i / 64) * 5;
    let k = 0;
    while (k < TEMP.length - 2 && TEMP[k + 1][0] < T) k++;
    const a = TEMP[k], b = TEMP[k + 1], f = clamp((T - a[0]) / (b[0] - a[0]), 0, 1);
    LUT.push('rgb(' + a[1].map((c, j) => Math.round(lerp(c, b[1][j], f))).join(',') + ')');
  }
  const tempCol = (T) => LUT[clamp(Math.round((T / 5) * 64), 0, 64)];

  let S = null;
  let glowCyan = null, glowBlue = null;
  function glowSprite(rgb) {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(' + rgb + ',1)'); gr.addColorStop(0.25, 'rgba(' + rgb + ',0.45)'); gr.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return c;
  }

  // ---------------------------------------------------------------- arranque
  function start(o) {
    const run = o.run;
    if (!glowCyan) { glowCyan = glowSprite('127,227,255'); glowBlue = glowSprite('190,210,255'); }
    const rm = !!V.reduceMotion || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
    const s = {
      run, rm, t: 0, real: 0, ff: 0, hold: false, preRoll: o.preRoll || null, preDone: !o.preRoll,
      onBang: o.onBang, onDone: o.onDone, done: false, banged: false, fired: {},
      hx: run.x, hy: run.y, r0: run.r, z0: o.z || run.zoom, dir: Math.random() < 0.5 ? 1 : -1,
      press: 0, pressAt: 0, holdT: 0, hintT: 0, padDown: false, doneAt: 0, diskPh: 0,
      beats: [], objs: [], dust: [], arcs: [], parts: [], stars: [], fil: [], trail: [],
    };
    // Subtítulos de LUMEN (V.ENDING 0–3)
    let t = T_LINE0;
    for (let i = 0; i < 4; i++) {
      const text = endingText(i);
      if (!text) continue;
      const d = readDur(text);
      s.beats.push({ i, text, t0: t, t1: t + d, who: 'lumen' });
      t += d + 0.35;
    }
    s.tCrunch = Math.max(t - 0.2, 9);
    s.tPoint = s.tCrunch + 1.5;
    s.tSwell = s.tPoint - 1.75;
    s.tBang = s.tPoint + 1.1;
    const lumenBeat = s.beats.find((b) => b.i === 2);
    s.tLumen = lumenBeat ? lumenBeat.t0 + 0.9 : -1;
    s.tLumenIn = s.tLumen + 2.6;
    s.title = { text: endingText(4), t0: s.tBang + 0.5, t1: s.tBang + 3.0 };
    const epi = endingText(5);
    s.epi = epi ? { text: epi, t0: s.tBang + 2.7, t1: s.tBang + 2.7 + readDur(epi), who: 'void' } : null;
    // la pantalla de victoria llega cuando la mota ya es un agujero diminuto (como al empezar el juego)
    s.tEnd = Math.max(s.epi ? s.epi.t1 + 0.5 : 0, s.tBang + 9.4);
    s.stops = s.beats.map((b) => b.t0).concat([s.tCrunch, s.tBang, s.epi ? s.epi.t0 : s.tBang + 3, s.tEnd]).sort((a, b) => a - b);

    // Cuerpos que caen: los más cercanos primero; tope de 260 para el rendimiento.
    const list = [];
    for (const b of run.objs) {
      if (b.dead || b.kind === 'boss') continue;
      const dx = b.x - s.hx, dy = b.y - s.hy;
      list.push({ o: b, rho: Math.hypot(dx, dy) || 1, th: Math.atan2(dy, dx) });
    }
    list.sort((a, b) => a.rho - b.rho);
    list.length = Math.min(list.length, 260);
    const n = list.length;
    list.forEach((e, i) => {
      const rank = n > 1 ? i / (n - 1) : 0;
      const tf = clamp(lerp(3.4, s.tCrunch - 0.3, Math.pow(rank, 0.75)) + V.rand(-0.7, 0.7), 2.6, s.tCrunch - 0.1);
      const o = e.o;
      s.objs.push({
        kind: o.kind, type: o.type, variant: o.variant | 0, s: o.s, rot: o.rot || 0, vr: o.vr || 0, gold: !!o.gold,
        rho: e.rho, th: e.th, ts: 1.3 + rank * 1.4, tf, turns: V.rand(0.5, 1.1) * (1 + 1.4 * (1 - rank)),
      });
    });
    // Polvo de acreción (decorativo): espiral continua hacia el agujero
    const nd = rm ? 110 : 230;
    for (let i = 0; i < nd; i++) s.dust.push({ a: Math.random() * TAU, f: Math.random(), k: V.rand(0.05, 0.13), sz: V.rand(0.8, 2.2), hot: Math.random() });
    // Arcos de luz curvada alrededor del horizonte
    for (let i = 0; i < 30; i++) s.arcs.push({ a: Math.random() * TAU, rr: V.rand(1.35, 3.1), len: V.rand(0.15, 0.85), al: V.rand(0.1, 0.35), w: V.rand(0.8, 2) });
    // Big Bang: partículas analíticas (posición y color dependen solo de su edad: saltar no rompe nada)
    const np = rm ? 420 : 900;
    for (let i = 0; i < 6; i++) s.fil.push(Math.random() * TAU);
    for (let i = 0; i < np; i++) {
      const filament = Math.random() < 0.3;
      const ang = filament ? s.fil[(Math.random() * s.fil.length) | 0] + V.rand(-0.12, 0.12) : Math.random() * TAU;
      s.parts.push({ ang, R: 0.04 + 1.25 * Math.pow(Math.random(), filament ? 0.6 : 1.4), g: (Math.random() * 4) | 0, sz: V.rand(1.1, 3), tw: Math.random() * TAU });
    }
    // Primeras estrellas: se encienden dentro de la nube que se expande
    const ns = rm ? 18 : 34;
    for (let i = 0; i < ns; i++) {
      const p = s.parts[(Math.random() * s.parts.length) | 0];
      s.stars.push({
        ang: p.ang + V.rand(-0.05, 0.05), R: clamp(p.R, 0.12, 0.95) * V.rand(0.6, 0.95), ti: s.tBang + V.rand(1.5, 6.5),
        sz: Math.pow(Math.random(), 2) * 3 + 1.2, col: ['#d6e4ff', '#ffffff', '#bcd2ff', '#ffe9c4'][(Math.random() * 4) | 0], tw: Math.random() * TAU,
      });
    }
    S = s;
  }

  // ---------------------------------------------------------------- entrada
  // Pulsación corta = avanzar a la siguiente línea (avance rápido, sin cortes); mantener = saltar.
  // (el primer segundo se ignora: la tecla o el botón con el que se dio el último golpe no salta el final)
  const LOCK = 1.2;
  function press() {
    if (!S || S.done || S.real < LOCK) return;
    if (!S.press) { S.press = 1; S.pressAt = S.real; }
    S.hintT = 2.5;
  }
  function release() {
    if (!S || S.done || !S.press) return;
    const held = S.real - S.pressAt;
    S.press = 0; S.holdT = 0;
    if (held < TAP_MAX && !S.hold) advance();
  }
  function advance() {
    const now = Math.max(S.t, S.ff);
    for (const st of S.stops) if (st > now + 0.05) { S.ff = st; return; }
  }
  function skip() {
    if (!S || S.done) return;
    S.press = 0; S.holdT = 0; S.ff = 0;
    // Lo que no se llegó a disparar: el Big Bang sí (guardado de logros y sonido de cierre), el crescendo no.
    S.fired.swell = S.fired.silence = S.fired.theme = S.fired.lumen = true;
    if (!S.banged) { S.banged = true; S.fired.bang = true; S.onBang && S.onBang(); }
    S.t = Math.max(S.t, S.tBang + 6.2); // (el tema del epílogo entra en la siguiente actualización)
    finish();
  }
  function finish() {
    if (S.done) return;
    S.done = true; S.doneAt = S.real;
    S.onDone && S.onDone();
  }

  // ---------------------------------------------------------------- actualización
  function cue(name, at, fn) {
    if (S.fired[name] || S.t < at) return;
    S.fired[name] = true;
    try { fn(); } catch (e) { console.error('[finale ' + name + ']', e); }
  }
  function update(dt) {
    const s = S;
    if (!s) return;
    s.real += dt;
    if (s.hintT > 0) s.hintT -= dt;
    // Explosión del Núcleo: las partículas y ondas de la run siguen, a cámara lenta al principio
    const slow = s.real < 2.4 ? 0.3 : 1;
    const run = s.run, d = dt * slow;
    for (let i = run.parts.length - 1; i >= 0; i--) {
      const p = run.parts[i];
      p.life -= d; p.x += p.vx * d; p.y += p.vy * d;
      p.vx *= Math.exp(-d * 2); p.vy *= Math.exp(-d * 2);
      if (p.life <= 0) run.parts.splice(i, 1);
    }
    if (run.waves) for (let i = run.waves.length - 1; i >= 0; i--) { run.waves[i].t += d; if (run.waves[i].t > run.waves[i].dur) run.waves.splice(i, 1); }
    if (run.texts) for (let i = run.texts.length - 1; i >= 0; i--) { const t = run.texts[i]; t.life -= d; t.fresh += d; if (t.life <= 0) run.texts.splice(i, 1); }

    // Transmisiones pendientes (si el jugador ganó muy rápido): la escena espera
    if (!s.preDone && s.t >= 2.3) {
      s.preDone = true; s.hold = true;
      s.preRoll(() => { if (S === s) s.hold = false; });
    }
    if (s.hold) return;
    // mantener para saltar (teclado, ratón, táctil o mando)
    if (s.press || s.padDown) {
      if (!s.press) { s.press = 1; s.pressAt = s.real; }
      s.holdT = s.real - s.pressAt;
      if (!s.done && s.holdT >= HOLD_SKIP) skip();
    }
    const sp = s.ff > s.t ? 7 : 1;
    s.t += dt * sp;
    if (s.ff && s.t >= s.ff) { s.t = Math.max(s.t, s.ff); s.ff = 0; }
    const t = s.t;
    const c = collapseK(t);
    s.diskPh += dt * sp * (1 + 1.5 * c + (t > s.tCrunch ? 2 : 0));
    for (const p of s.dust) {
      p.f += p.k * dt * sp * (1 + c * 2.2);
      if (p.f >= 1) { p.f -= 1; p.a = Math.random() * TAU; }
    }

    const A = V.Audio || {};
    cue('theme', 3.0, () => A.setTheme && A.setTheme('after'));
    cue('lumen', s.tLumenIn, () => A.revive && A.revive());
    cue('swell', s.tSwell, () => A.victorySwell && A.victorySwell());
    cue('silence', s.tPoint, () => A.duckMusic && A.duckMusic(0, 3, 0.4));
    cue('bang', s.tBang, () => { s.banged = true; s.onBang && s.onBang(); });
    cue('epi', s.tBang + 4.5, () => A.setTheme && A.setTheme('menu'));
    if (!s.done && t >= s.tEnd) finish();
  }
  function collapseK(t) { return clamp((t - 1.5) / (S.tCrunch - 1.5), 0, 1); }

  // ---------------------------------------------------------------- dibujo
  function drawUniverse(ctx, W, H, rot, scale, U, alpha) {
    const R = V.Render;
    if (U < 2 || !R.neb) return;
    const cx = W / 2, cy = H / 2;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, U, 0, TAU); ctx.clip();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(scale, scale);
    const cover = U / scale + 2;
    ctx.fillStyle = '#0a0620'; ctx.fillRect(-cover, -cover, cover * 2, cover * 2);
    const layers = [[R.neb, 0.03], [R.stars[0], 0.08], [R.stars[1], 0.18], [R.stars[2], 0.35]];
    for (const [img, f] of layers) {
      const ox = (((R.bgOff.x * f) % 1024) + 1024) % 1024, oy = (((R.bgOff.y * f) % 1024) + 1024) % 1024;
      // mismo encuadre que R.background con la cámara centrada: el paso de la partida a la cinemática no salta
      const x0 = -cx - ox, y0 = -cy - oy;
      const i0 = Math.floor((-cover - x0) / 1024), i1 = Math.ceil((cover - x0) / 1024);
      const j0 = Math.floor((-cover - y0) / 1024), j1 = Math.ceil((cover - y0) / 1024);
      for (let i = i0; i < i1; i++) for (let j = j0; j < j1; j++) ctx.drawImage(img, x0 + i * 1024, y0 + j * 1024);
    }
    ctx.restore();
    // borde del universo que se apaga
    const g = ctx.createRadialGradient(cx, cy, U * 0.72, cx, cy, U);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, U + 1, 0, TAU); ctx.fill();
  }

  function drawHole(ctx, x, y, r, time, photon, cyan) {
    const R = V.Render;
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 4);
    g.addColorStop(0, 'rgba(255,170,90,' + (0.28 + 0.25 * photon) + ')');
    g.addColorStop(0.35, 'rgba(170,90,255,' + 0.12 * (1 + photon) + ')');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4, 0, TAU); ctx.fill();
    const tilt = -0.35, ct = Math.cos(tilt), st = Math.sin(tilt);
    const big = r > 22;
    const disk = (front) => {
      if (big) { // banda del disco (media elipse trasera o delantera)
        ctx.globalAlpha = 0.22 + 0.2 * Math.min(1, photon);
        ctx.beginPath(); ctx.ellipse(x, y, r * 1.85, r * 0.55, tilt, front ? 0 : Math.PI, front ? Math.PI : TAU);
        ctx.strokeStyle = 'rgba(255,170,90,1)'; ctx.lineWidth = r * 0.42; ctx.stroke();
        ctx.lineWidth = r * 0.12; ctx.strokeStyle = 'rgba(255,230,190,1)'; ctx.stroke();
      }
      ctx.globalAlpha = 0.6;
      for (const p of R.disk) {
        const ang = p.a + time * p.w;
        const sn = Math.sin(ang);
        if (front ? sn < 0 : sn >= 0) continue;
        const ex = Math.cos(ang) * p.rad * r, ey = sn * p.rad * r * 0.3;
        const px = x + ex * ct - ey * st, py = y + ex * st + ey * ct;
        const sz = clamp(p.sz * r * 1.6, 1.5, 3.2);
        ctx.fillStyle = p.col; ctx.fillRect(px - sz / 2, py - sz / 2, sz * 2.4, sz);
      }
      ctx.globalAlpha = 1;
    };
    disk(false);
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = '#000'; ctx.fill();
    // anillo de fotones: crece en brillo y grosor a medida que todo cae
    ctx.globalCompositeOperation = 'lighter';
    const pr = r * (1.06 + 0.04 * photon);
    ctx.beginPath(); ctx.arc(x, y, pr, 0, TAU);
    ctx.lineWidth = Math.max(2, r * (0.1 + 0.18 * photon)); ctx.strokeStyle = cyan > 0 ? 'rgba(127,227,255,' + (0.25 + 0.5 * cyan) + ')' : 'rgba(255,190,110,' + (0.18 + 0.3 * photon) + ')'; ctx.stroke();
    ctx.lineWidth = Math.max(1.2, r * (0.035 + 0.05 * photon)); ctx.strokeStyle = 'rgba(255,248,235,' + (0.75 + 0.25 * photon) + ')'; ctx.stroke();
    disk(true);
    ctx.globalCompositeOperation = 'source-over';
  }

  // Lente gravitatoria fingida: lo que hay "detrás" del agujero se ve ampliado en un anillo a su alrededor.
  function drawLens(ctx, W, H, x, y, r, k) {
    if (k <= 0.01 || r < 4) return;
    const cvs = ctx.canvas, d = V.Render.dpr || 1;
    const Ro = r * 3.1, m = 1.9;
    const Rs = Ro / m;
    const sx = (x - Rs) * d, sy = (y - Rs) * d, sw = Rs * 2 * d, sh = Rs * 2 * d;
    if (sx < 0 || sy < 0 || sx + sw > cvs.width || sy + sh > cvs.height) return; // fuera de pantalla: sin lente
    // borde suave: tres coronas con opacidad decreciente hacia fuera
    const rings = [[1.02, 2.0, 0.6], [2.0, 2.6, 0.36], [2.6, 3.1, 0.15]];
    for (const [a, b, al] of rings) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.beginPath(); ctx.arc(x * d, y * d, r * b * d, 0, TAU); ctx.arc(x * d, y * d, r * a * d, 0, TAU, true); ctx.clip();
      ctx.globalAlpha = al * k;
      try { ctx.drawImage(cvs, sx, sy, sw, sh, (x - Ro) * d, (y - Ro) * d, Ro * 2 * d, Ro * 2 * d); } catch (e) { /* sin lente */ }
      ctx.restore();
    }
  }

  function drawCollapse(ctx, W, H, time, ox, oy) {
    const s = S, t = s.t, R = V.Render;
    const c = collapseK(t);
    const g = t < s.tCrunch ? 1 : 1 - easeIn((t - s.tCrunch) / (s.tPoint - s.tCrunch));
    const crunch = 1 - g;
    const zc = s.z0 * (1 - 0.42 * sm((t - 1.5) / 6.5));
    const rw = s.r0 * (1 + 1.6 * Math.pow(c, 1.4));
    const K = zc * g;
    const cx = W / 2 + ox, cy = H / 2 + oy;
    const hr = rw * K;
    const diag = Math.hypot(W, H) / 2;
    const mot = s.rm ? 0.25 : 1;

    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    // 1. el universo: gira cada vez más deprisa, se aleja y al final se reduce a un punto
    const U = diag * 1.04 * (1 - 0.5 * sm((c - 0.5) / 0.5)) * Math.pow(g, 0.85);
    const rot = s.dir * mot * (0.9 * Math.pow(c, 2.4) + 2.6 * crunch * crunch);
    drawUniverse(ctx, W, H, rot, Math.sqrt(zc / s.z0) * g, U, 1 - 0.35 * c);

    // 2. polvo de acreción en espiral
    if (hr > 0.5) {
      ctx.globalCompositeOperation = 'lighter';
      const dk = sm((t - 1.4) / 2.5) * g;
      const cols = ['rgba(255,236,200,', 'rgba(255,160,90,', 'rgba(190,120,255,'];
      for (let b = 0; b < 3; b++) {
        ctx.fillStyle = cols[b] + (0.75 * dk) + ')';
        for (const p of s.dust) {
          const rr = 1.05 + 9 * Math.pow(1 - p.f, 1.6);
          const band = rr < 2.4 ? 0 : rr < 5.5 ? 1 : 2;
          if (band !== b) continue;
          const ang = p.a + s.dir * (time * 0.4 + 7 * Math.pow(p.f, 2)) * mot;
          const px = cx + Math.cos(ang) * rr * hr, py = cy + Math.sin(ang) * rr * hr * 0.85;
          const z = p.sz * (b === 0 ? 1.3 : 1);
          ctx.fillRect(px - z / 2, py - z / 2, z, z);
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    // 3. los cuerpos caen en espiral, estirados por la marea, y desaparecen en el horizonte
    let flare = 0;
    const d = R.dpr || 1;
    for (const o of s.objs) {
      const u = clamp((t - o.ts) / (o.tf - o.ts), 0, 1);
      if (u >= 1) continue;
      if (Math.abs(t - o.tf) < 0.18) flare += 1;
      const rho = o.rho * (1 - Math.pow(u, 2.2));
      if (rho < rw * 0.95) continue;
      const th = o.th + s.dir * o.turns * TAU * Math.pow(u, 2.5) * (s.rm ? 0.5 : 1) + s.dir * 0.03 * t;
      const px = cx + Math.cos(th) * rho * K, py = cy + Math.sin(th) * rho * K;
      const sr = o.s * K;
      if (sr < 0.4) continue;
      if (px + sr * 3 < 0 || py + sr * 3 < 0 || px - sr * 3 > W || py - sr * 3 > H) continue;
      const a = 1 - sm((u - 0.8) / 0.2);
      const stretch = 1 + 2.4 * Math.pow(u, 3);
      ctx.globalAlpha = a;
      if (o.kind === 'obj' && R.sprites[o.type]) {
        const sp = R.sprites[o.type][o.variant] || R.sprites[o.type][0];
        const sz = sr * sp.scale;
        const ang = th + s.dir * 0.6, ca = Math.cos(ang) * d, sa = Math.sin(ang) * d;
        ctx.setTransform(ca * stretch, sa * stretch, -sa / Math.sqrt(stretch), ca / Math.sqrt(stretch), px * d, py * d);
        ctx.rotate(o.rot + o.vr * t * 0.3);
        ctx.drawImage(sp.img, -sz / 2, -sz / 2, sz, sz);
        ctx.setTransform(d, 0, 0, d, 0, 0);
      } else {
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(R.glowW, px - sr * 2, py - sr * 2, sr * 4, sr * 4);
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    ctx.globalAlpha = 1;

    // 4. la explosión del Núcleo (partículas y ondas de la run)
    const run = s.run;
    const wx = (x) => cx + (x - s.hx) * K, wy = (y) => cy + (y - s.hy) * K;
    if (run.waves) for (const w of run.waves) {
      const k = w.t / w.dur, e = 1 - (1 - k) * (1 - k);
      ctx.beginPath(); ctx.arc(wx(w.x), wy(w.y), Math.max(0.1, lerp(w.R0, w.R1, e) * K), 0, TAU);
      ctx.strokeStyle = 'rgba(' + w.col + ',' + (1 - k) * (RF() ? 0.3 : 0.7) + ')'; ctx.lineWidth = 2 + 8 * (1 - k); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'lighter';
    let last = null;
    for (const p of run.parts) {
      const z = Math.max(1.2, p.size * K), px = wx(p.x), py = wy(p.y);
      if (px < -z || py < -z || px > W + z || py > H + z) continue;
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      if (p.col !== last) { ctx.fillStyle = p.col; last = p.col; }
      ctx.fillRect(px - z / 2, py - z / 2, z, z);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // 5. lente y luz curvada
    const photon = clamp(c * 0.85 + crunch + Math.min(1, flare * 0.12), 0, 1.6);
    drawLens(ctx, W, H, cx, cy, hr, sm((t - 2.5) / 4) * g);
    if (hr > 2) {
      ctx.globalCompositeOperation = 'lighter';
      const ak = sm((t - 2) / 4) * g;
      ctx.lineCap = 'round';
      for (const a of s.arcs) {
        const rr = a.rr * hr, w = (1.6 / Math.pow(a.rr, 1.5)) * (1 + c * 2) * mot;
        const a0 = a.a + s.dir * w * t;
        ctx.beginPath(); ctx.arc(cx, cy, rr, a0, a0 + a.len * (1 + c));
        ctx.strokeStyle = 'rgba(220,235,255,' + a.al * ak + ')'; ctx.lineWidth = a.w; ctx.stroke();
      }
      ctx.lineCap = 'butt';
      ctx.globalCompositeOperation = 'source-over';
    }

    // 6. LUMEN abre las esclusas: una mota cian cae en espiral hasta el agujero
    let cyan = 0;
    if (s.tLumen > 0 && t >= s.tLumen && t < s.tLumenIn + 1.2) {
      const k = clamp((t - s.tLumen) / (s.tLumenIn - s.tLumen), 0, 1);
      const pos = (kk) => {
        const ang = -2.25 + s.dir * 2.2 * Math.pow(kk, 1.6);
        const rr = lerp(diag * 0.95, hr * 1.05, Math.pow(kk, 1.35));
        return [cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr];
      };
      if (k < 1) {
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 14; i >= 0; i--) {
          const kk = Math.max(0, k - i * 0.014), [px, py] = pos(kk), sz = (1 - i / 15) * 34;
          ctx.globalAlpha = (1 - i / 15) * 0.55;
          ctx.drawImage(glowCyan, px - sz / 2, py - sz / 2, sz, sz);
        }
        const [px, py] = pos(k);
        ctx.globalAlpha = 1; ctx.drawImage(glowCyan, px - 28, py - 28, 56, 56);
        ctx.fillStyle = '#eafcff'; ctx.beginPath(); ctx.arc(px, py, 2.6, 0, TAU); ctx.fill();
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      } else {
        // llegada: pequeño destello cian en el horizonte
        const e = (t - s.tLumenIn) / 1.2;
        cyan = 1 - e;
        ctx.beginPath(); ctx.arc(cx, cy, hr * (1.1 + 2.4 * easeOut(e)), 0, TAU);
        ctx.strokeStyle = 'rgba(127,227,255,' + (1 - e) * (RF() ? 0.35 : 0.8) + ')'; ctx.lineWidth = 2 + 6 * (1 - e); ctx.stroke();
        if (!RF()) {
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - e) * 0.5;
          ctx.drawImage(glowCyan, cx - hr * 3, cy - hr * 3, hr * 6, hr * 6);
          ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
        }
      }
    }

    // 7. el agujero (se contrae con todo lo demás en el colapso final)
    if (hr > 0.6) drawHole(ctx, cx, cy, hr, s.diskPh, photon, cyan);

    // 8. el punto: todo el universo en un solo punto de luz, temblando en silencio
    if (t >= s.tCrunch + 0.7) {
      const pk = sm((t - s.tCrunch - 0.7) / (s.tPoint - s.tCrunch - 0.7));
      const quiet = t >= s.tPoint;
      const jit = quiet && !s.rm ? 0.6 : 0;
      const px = cx + (Math.random() - 0.5) * jit, py = cy + (Math.random() - 0.5) * jit;
      const pre = quiet ? sm((t - s.tPoint) / (s.tBang - s.tPoint)) : 0;
      const gz = (14 + 26 * pk + 30 * pre) * (quiet ? 0.9 + 0.1 * Math.sin(time * 23) : 1);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = pk;
      ctx.drawImage(V.Render.glowW, px - gz / 2, py - gz / 2, gz, gz);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(255,255,255,' + pk + ')';
      ctx.beginPath(); ctx.arc(px, py, 1.4 + pre * 1.2, 0, TAU); ctx.fill();
    }
  }

  function drawBang(ctx, W, H, time, ox, oy) {
    const s = S, t = s.t, a = t - s.tBang, R = V.Render;
    const cx = W / 2 + ox, cy = H / 2 + oy, diag = Math.hypot(W, H) / 2;
    // universo joven: de negro a un violeta azulado con nebulosas que aparecen
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const yk = sm(a / 4);
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, diag * 1.1);
    bg.addColorStop(0, 'rgba(' + Math.round(lerp(255, 52, yk)) + ',' + Math.round(lerp(220, 34, yk)) + ',' + Math.round(lerp(180, 112, yk)) + ',' + (0.85 * sm(a / 0.6)) + ')');
    bg.addColorStop(0.5, 'rgba(26,18,70,' + (0.7 * yk) + ')');
    bg.addColorStop(1, 'rgba(6,4,20,1)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    if (R.neb) {
      const nk = sm((a - 1.2) / 4);
      if (nk > 0) {
        ctx.globalAlpha = 0.75 * nk;
        const x0 = -((a * 6) % 1024);
        for (let x = x0; x < W; x += 1024) for (let y = 0; y < H; y += 1024) ctx.drawImage(R.neb, x, y);
        ctx.globalAlpha = 0.45 * sm((a - 3) / 5);
        const x1 = -((a * 3) % 1024);
        if (ctx.globalAlpha > 0) for (let x = x1; x < W; x += 1024) for (let y = 0; y < H; y += 1024) ctx.drawImage(R.stars[0], x, y);
        ctx.globalAlpha = 1;
      }
    }
    // ondas expansivas
    for (const [delay, spd, col, wmax] of [[0, 2.4, '235,245,255', 34], [0.18, 1.5, '255,190,120', 22], [0.45, 0.9, '190,140,255', 16]]) {
      const e = a - delay;
      if (e <= 0) continue;
      const k = 1 - Math.exp(-e * spd);
      const al = Math.pow(Math.max(0, 1 - e / 3.2), 1.5) * (RF() ? 0.4 : 0.85);
      if (al <= 0.01) continue;
      ctx.beginPath(); ctx.arc(cx, cy, diag * 1.25 * k, 0, TAU);
      ctx.strokeStyle = 'rgba(' + col + ',' + al + ')'; ctx.lineWidth = Math.max(1.5, wmax * (1 - k)); ctx.stroke();
    }
    // bola de fuego: blanca al nacer, se expande y se enfría
    ctx.globalCompositeOperation = 'lighter';
    {
      const fk = 1 - Math.exp(-a * 1.6), fr = diag * (0.12 + 0.75 * fk), fa = Math.exp(-a * 0.75) * (RF() ? 0.35 : 0.95);
      if (fa > 0.01) {
        const fb = ctx.createRadialGradient(cx, cy, 0, cx, cy, fr);
        fb.addColorStop(0, 'rgba(255,255,255,' + fa + ')');
        fb.addColorStop(0.25, tempCol(clamp(a * 0.7, 0, 5)).replace('rgb', 'rgba').replace(')', ',' + fa * 0.7 + ')'));
        fb.addColorStop(1, 'rgba(120,60,200,0)');
        ctx.fillStyle = fb; ctx.fillRect(cx - fr, cy - fr, fr * 2, fr * 2);
      }
    }
    // partículas que nacen y se enfrían (blanco → naranja → violeta)
    const ex = 1 - Math.exp(-a * 1.25); // fracción del recorrido (0→1), con frenado
    const twist = Math.log(1 + a) * 0.12 * s.dir * (s.rm ? 0.3 : 1);
    const al = a < 0.15 ? 1 : 0.28 + 0.72 * Math.exp(-(a - 0.15) * 0.32);
    const toff = [-0.35, -0.1, 0.15, 0.45];
    for (let gi = 0; gi < 4; gi++) {
      ctx.fillStyle = tempCol(clamp(a * 0.8 + toff[gi], 0, 5));
      for (const p of s.parts) {
        if (p.g !== gi) continue;
        const rr = p.R * diag * ex;
        const ang = p.ang + twist * (1.2 - p.R);
        const px = cx + Math.cos(ang) * rr, py = cy + Math.sin(ang) * rr;
        if (px < -4 || py < -4 || px > W + 4 || py > H + 4) continue;
        ctx.globalAlpha = al * (0.7 + 0.3 * Math.sin(p.tw + time * 3));
        const z = p.sz * (1.6 - 0.6 * Math.min(1, a / 3)) * (1 + 0.6 * Math.exp(-a * 1.5));
        ctx.fillRect(px - z / 2, py - z / 2, z, z);
      }
    }
    ctx.globalAlpha = 1;
    // las primeras estrellas
    for (const st of s.stars) {
      const e = t - st.ti;
      if (e <= 0) continue;
      const k = easeOut(e / 0.5);
      const rr = st.R * diag * ex, px = cx + Math.cos(st.ang) * rr, py = cy + Math.sin(st.ang) * rr;
      const flash = (1 - k) * (RF() ? 0.3 : 1.6);
      const tw = 0.8 + 0.2 * Math.sin(time * 2.3 + st.tw);
      const z = st.sz * (k + flash) * tw;
      ctx.globalAlpha = Math.min(1, k * 0.9 + flash * 0.3);
      ctx.drawImage(glowBlue, px - z * 5, py - z * 5, z * 10, z * 10);
      ctx.fillStyle = st.col;
      ctx.fillRect(px - z * 0.5, py - z * 0.5, z, z);
      if (st.sz > 2.6) { ctx.globalAlpha *= 0.55; ctx.fillRect(px - z * 4, py - 0.5, z * 8, 1); ctx.fillRect(px - 0.5, py - z * 4, 1, z * 8); }
    }
    ctx.globalAlpha = 1;
    // epílogo: una mota de luz nueva que crece (y acaba siendo un agujero diminuto, como al empezar)
    if (a > 3.0) {
      const k = sm((a - 3.0) / 1.4), grow = sm((a - 3.6) / 5.5) + Math.min(0.6, Math.max(0, a - 9.1) * 0.025);
      const us = (V.uiScale || 1) * clamp(Math.min(W / 1280, H / 800), 0.85, 1.6);
      const rm = (2.8 + 5.5 * grow) * us;
      const breath = 1 + 0.08 * Math.sin(time * 2.2);
      ctx.globalAlpha = k * 0.75;
      const gz = rm * 9 * breath;
      ctx.drawImage(R.glowW, cx - gz / 2, cy - gz / 2, gz, gz);
      ctx.globalAlpha = k;
      // disco: tres chispas en órbita
      const dk = sm((a - 5.0) / 1.8);
      if (dk > 0) {
        ctx.fillStyle = 'rgba(255,190,120,' + dk + ')';
        for (let i = 0; i < 4; i++) {
          const ang = time * (1.6 + i * 0.25) + (i * TAU) / 4;
          const ex2 = Math.cos(ang) * rm * 2.4, ey2 = Math.sin(ang) * rm * 0.75;
          ctx.fillRect(cx + ex2 * 0.94 - ey2 * 0.34 - 1, cy + ex2 * -0.34 + ey2 * 0.94 - 1, 2.2, 2);
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      const hk = sm((a - 6.9) / 1.5);
      ctx.fillStyle = 'rgba(255,246,228,' + k + ')';
      ctx.beginPath(); ctx.arc(cx, cy, rm * 0.55, 0, TAU); ctx.fill();
      if (hk > 0) {
        ctx.beginPath(); ctx.arc(cx, cy, rm * 0.5 * hk, 0, TAU); ctx.fillStyle = '#000'; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, rm * 0.52 * hk, 0, TAU); ctx.lineWidth = Math.max(1, rm * 0.12); ctx.strokeStyle = 'rgba(255,225,190,' + hk + ')'; ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = 'source-over';
    // destello (suave y sin fogonazo con "reducir destellos")
    let fl;
    if (RF()) fl = a < 0.4 ? 0.18 * (a / 0.4) : 0.18 * Math.exp(-(a - 0.4) * 1.5);
    else fl = a < 0.06 ? a / 0.06 : Math.exp(-(a - 0.06) * 1.9);
    if (fl > 0.003) { ctx.fillStyle = RF() ? 'rgba(170,150,255,' + fl + ')' : 'rgba(255,255,255,' + fl + ')'; ctx.fillRect(0, 0, W, H); }
  }

  // Subtítulo de cine: grande, centrado en el tercio inferior, con ajuste de línea (CJK incluido).
  function subtitle(ctx, W, H, text, alpha, who, us, lb) {
    if (!text || alpha <= 0.01) return;
    const R = V.Render;
    const maxW = Math.min(W - 64, 980 * us);
    let fs = clamp(27 * us, 17, 40), lines;
    for (let i = 0; i < 10; i++) {
      ctx.font = F('600', fs);
      lines = R.wrapLines(ctx, text, maxW);
      if (lines.length <= 3 || fs <= 15) break;
      fs *= 0.9;
    }
    const lh = fs * 1.38;
    const bottom = H - Math.max(lb + 18, H * 0.1);
    let y = bottom - (lines.length - 1) * lh;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    if (who === 'lumen') {
      const p = V.pal ? V.pal() : {};
      ctx.font = F('800', Math.max(10, fs * 0.46));
      ctx.fillStyle = p.lumen || '#7fe3ff';
      const lbl = V.t ? V.t('from_lumen') : 'LUMEN';
      ctx.fillText(lbl, W / 2, y - fs * 1.15);
    }
    ctx.font = F('600', fs);
    ctx.shadowColor = 'rgba(0,0,0,0.95)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 2;
    ctx.fillStyle = who === 'lumen' ? '#e6f8ff' : '#fff6ea';
    for (const l of lines) { ctx.fillText(l, W / 2, y); y += lh; }
    ctx.restore();
  }
  function beatAlpha(b, t) {
    if (!b || t < b.t0 || t > b.t1) return 0;
    return Math.min(1, (t - b.t0) / 0.5, (b.t1 - t) / 0.5);
  }

  function draw(ctx, W, H, time, ox, oy) {
    const s = S;
    if (!s) return;
    const t = s.t;
    ox = ox || 0; oy = oy || 0;
    if (t < s.tBang) drawCollapse(ctx, W, H, time, ox, oy);
    // con la pantalla de victoria (abajo), el universo joven sube para que la mota siga a la vista
    else drawBang(ctx, W, H, time, ox, oy - (s.done ? H * 0.25 * sm((s.real - s.doneAt) / 1.8) : 0));

    const us = (V.uiScale || 1) * clamp(Math.min(W / 1280, H / 800), 0.85, 1.6);
    // franjas de cine (entran al empezar, salen con la pantalla de victoria)
    const bk = sm(s.real / 1.2) * (s.done ? 1 - sm((s.real - s.doneAt) / 1.2) : 1);
    const lb = Math.round(H * 0.085 * bk);
    if (lb > 0) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, lb); ctx.fillRect(0, H - lb, W, lb); }

    // subtítulos
    if (!s.hold) {
      for (const b of s.beats) { const a = beatAlpha(b, t); if (a > 0) subtitle(ctx, W, H, b.text, a, 'lumen', us, lb); }
      if (s.epi && !s.done) subtitle(ctx, W, H, s.epi.text, beatAlpha(s.epi, t), 'void', us, lb);
      else if (s.epi && s.done) subtitle(ctx, W, H, s.epi.text, beatAlpha(s.epi, t) * (1 - sm((s.real - s.doneAt) / 0.6)), 'void', us, lb);
      // título del Big Bang
      const ta = beatAlpha(s.title, t);
      if (ta > 0 && s.title.text) {
        ctx.save();
        ctx.globalAlpha = ta;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (!RF()) { ctx.shadowColor = 'rgba(255,240,220,0.9)'; ctx.shadowBlur = 28; } else { ctx.shadowColor = 'rgba(0,0,0,0.95)'; ctx.shadowBlur = 14; }
        ctx.fillStyle = '#ffffff';
        V.Render.fitText(ctx, s.title.text, W / 2, H * 0.36, W - 60, '300', clamp(46 * us, 24, 70), 14);
        ctx.restore();
      }
    }
    // pista de salto (en la franja inferior) con el progreso de "mantener"
    if (!s.done && !s.hold && s.real > 0.8) {
      const a = s.hintT > 0 || s.press ? 0.9 : 0.42;
      const txt = V.t ? V.t('cineSkip') : 'Hold to skip';
      ctx.save();
      ctx.globalAlpha = a;
      const fs = clamp(12.5 * us, 11, 18);
      ctx.font = F('700', fs);
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      const y = H - Math.max(lb / 2, fs + 6), x = W - 20;
      ctx.fillStyle = '#cfc8ee';
      ctx.fillText(txt, x, y);
      const tw = ctx.measureText(txt).width, rx = x - tw - fs * 0.9, rr = fs * 0.5;
      ctx.beginPath(); ctx.arc(rx, y, rr, 0, TAU); ctx.strokeStyle = 'rgba(207,200,238,0.35)'; ctx.lineWidth = 2; ctx.stroke();
      if (s.press && s.holdT > 0.05) {
        ctx.beginPath(); ctx.arc(rx, y, rr, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(s.holdT / HOLD_SKIP, 0, 1));
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.stroke();
      }
      ctx.restore();
    }
  }

  V.Cine = {
    start,
    stop() { S = null; },
    update,
    draw,
    press, release, skip,
    padHold(on) {
      if (!S || S.done) return;
      // un botón que ya venía pulsado de la pelea no cuenta hasta soltarlo
      if (S.real < LOCK) { S.padLock = on; return; }
      if (S.padLock) { if (!on) S.padLock = false; return; }
      if (on && !S.padDown) { S.padDown = true; press(); }
      else if (!on && S.padDown) { S.padDown = false; release(); }
    },
    get active() { return !!S && !S.done; },
    get running() { return !!S; },
    get waiting() { return !!S && S.hold; },
    // Para pruebas y herramientas: estado legible de la secuencia
    info() {
      if (!S) return null;
      const t = S.t, b = S.beats.find((x) => t >= x.t0 && t <= x.t1);
      const sub = b ? b.text : S.epi && t >= S.epi.t0 && t <= S.epi.t1 ? S.epi.text : S.title && t >= S.title.t0 && t <= S.title.t1 ? S.title.text : '';
      return { t, real: S.real, phase: S.done ? 'done' : t >= S.tBang ? 'bang' : t >= S.tCrunch ? 'crunch' : 'collapse', sub, banged: S.banged, done: S.done, tBang: S.tBang, tEnd: S.tEnd, tLumen: S.tLumen, hold: S.hold };
    },
  };
})();
