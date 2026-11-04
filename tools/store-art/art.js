// VOIDLING — biblioteca de arte de tienda.
// Compone imágenes a partir del render del juego (V.Render.init, sprites, drawHole, background)
// y añade capas de "arte clave" en alta resolución (gigante gaseoso, disco de acreción, corriente de marea, logo).
// Solo usa la API estable de render.js; si algo cambia, cae a dibujos propios.
(function () {
  const V = window.V;
  const TAU = Math.PI * 2;
  const A = {};

  A.FONT = '"Segoe UI Black","Segoe UI",system-ui,"Arial Black",sans-serif';
  A.TEXT = '"Segoe UI",system-ui,-apple-system,Roboto,sans-serif';
  A.LOGO_STOPS = [[0, '#ffffff'], [0.45, '#ffd2a8'], [0.7, '#ff8a3c'], [1, '#9b5cff']];
  A.TAGLINE = {
    es: 'Empiezas como una mota. Terminas devorando la galaxia.',
    en: 'You start as a speck. You end up devouring the galaxy.',
  };
  A.TILT = -0.35; // misma inclinación del disco que en el juego

  // ---------- Azar con semilla ----------
  A.prng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  A.withSeed = function (seed, fn) {
    const prev = Math.random;
    Math.random = A.prng(seed);
    try { return fn(); } finally { Math.random = prev; }
  };
  const gauss = (rnd) => (rnd() + rnd() + rnd() - 1.5) / 1.5;
  const smooth = (t) => t * t * (3 - 2 * t);
  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function mixHex(h1, h2, t) {
    const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
    const ch = (s) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t);
    return [ch(16), ch(8), ch(0)];
  }
  A.hexA = hexA;

  // ---------- Inicialización (sprites del juego con semilla fija) ----------
  let inited = false, disk0 = null;
  A.init = function () {
    if (inited) return;
    inited = true;
    A.withSeed(20270301, () => V.Render.init());
    const d = V.Render.disk;
    if (Array.isArray(d)) disk0 = d.map((p) => p.a);
  };
  function resetDisk() {
    const d = V.Render.disk;
    if (disk0 && d) for (let i = 0; i < d.length && i < disk0.length; i++) d[i].a = disk0[i];
  }
  A.sprite = function (type, variant) {
    const list = V.Render.sprites && V.Render.sprites[type];
    if (!list || !list.length) return null;
    return list[variant % list.length];
  };

  // ---------- Fondo ----------
  A.background = function (ctx, W, H, rnd, o) {
    o = o || {};
    const k = Math.max(1, Math.min(W, H) / 720) * (o.starScale || 1);
    const R = V.Render;
    if (R.bgOff) { R.bgOff.x = rnd() * 4096; R.bgOff.y = rnd() * 4096; }
    ctx.save();
    ctx.scale(k, k);
    try { R.background(ctx, W / k, H / k, 0, 0, o.tint); }
    catch (e) { ctx.fillStyle = '#07041a'; ctx.fillRect(0, 0, W / k, H / k); }
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const b of o.blobs || []) {
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, b.c);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    // estrellas brillantes con destello en cruz
    const n = o.bright == null ? Math.round((W * H) / 70000) : o.bright;
    for (let i = 0; i < n; i++) {
      const x = rnd() * W, y = rnd() * H, s = (0.7 + rnd() * 1.5) * k;
      const hue = [220, 40, 280, 200][(rnd() * 4) | 0];
      const g = ctx.createRadialGradient(x, y, 0, x, y, s * 7);
      g.addColorStop(0, 'hsla(' + hue + ',80%,92%,0.9)');
      g.addColorStop(0.25, 'hsla(' + hue + ',80%,80%,0.25)');
      g.addColorStop(1, 'hsla(' + hue + ',80%,70%,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - s * 7, y - s * 7, s * 14, s * 14);
      ctx.strokeStyle = 'hsla(' + hue + ',70%,90%,0.35)';
      ctx.lineWidth = Math.max(0.6, s * 0.35);
      ctx.beginPath();
      ctx.moveTo(x - s * 11, y); ctx.lineTo(x + s * 11, y);
      ctx.moveTo(x, y - s * 11); ctx.lineTo(x, y + s * 11);
      ctx.stroke();
    }
    ctx.restore();
  };

  A.vignette = function (ctx, W, H, k) {
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.62);
    g.addColorStop(0, 'rgba(5,3,13,0)');
    g.addColorStop(1, 'rgba(5,3,13,' + k + ')');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  };

  // ---------- Gigante gaseoso en alta resolución (misma paleta que el sprite del juego) ----------
  A.GAS_PAL = ['#d9a066', '#b5713f', '#efc690', '#8f5530', '#f3dcb0'];
  A.renderGasGiant = function (R, rnd, o) {
    o = o || {};
    const pal = o.pal || A.GAS_PAL;
    const tilt = o.tilt == null ? A.TILT : o.tilt;
    const S = Math.ceil(R * 4.1), c = S / 2;
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const g = cv.getContext('2d');
    const ring = (front) => {
      g.save();
      g.translate(c, c); g.rotate(tilt); g.scale(1, 0.26);
      const bands = [[1.27, 0.06, 0.32], [1.38, 0.1, 0.55], [1.5, 0.04, 0.2], [1.6, 0.12, 0.62], [1.78, 0.06, 0.3], [1.9, 0.03, 0.18]];
      for (const [rr, w, a] of bands) {
        g.beginPath();
        g.arc(0, 0, R * rr, front ? 0 : Math.PI, front ? Math.PI : TAU);
        g.lineWidth = R * w;
        g.strokeStyle = 'rgba(240,215,165,' + a * (front ? 1 : 0.7) + ')';
        g.stroke();
      }
      g.restore();
    };
    if (o.ring !== false) ring(false);
    // atmósfera
    const at = g.createRadialGradient(c, c, R * 0.96, c, c, R * 1.16);
    at.addColorStop(0, hexA(pal[2], 0.5));
    at.addColorStop(1, hexA(pal[2], 0));
    g.fillStyle = at;
    g.beginPath(); g.arc(c, c, R * 1.16, 0, TAU); g.fill();
    // cuerpo con bandas
    g.save();
    g.beginPath(); g.arc(c, c, R, 0, TAU); g.clip();
    g.fillStyle = pal[0]; g.fillRect(0, 0, S, S);
    g.translate(c, c); g.rotate(tilt);
    let yy = -R * 1.15;
    const step = R * 0.035;
    while (yy < R * 1.15) {
      const h = R * (0.025 + rnd() * 0.09);
      g.fillStyle = pal[(rnd() * pal.length) | 0];
      g.globalAlpha = 0.45 + rnd() * 0.45;
      const f1 = 2 + rnd() * 5, ph = rnd() * TAU, amp = R * (0.004 + rnd() * 0.014);
      g.beginPath();
      for (let xx = -R * 1.2; xx <= R * 1.2; xx += step) g.lineTo(xx, yy + Math.sin((xx / R) * f1 * 3 + ph) * amp);
      for (let xx = R * 1.2; xx >= -R * 1.2; xx -= step) g.lineTo(xx, yy + h + Math.sin((xx / R) * f1 * 2.3 + ph * 1.7) * amp);
      g.closePath(); g.fill();
      yy += h * (0.7 + rnd() * 0.3);
    }
    g.globalAlpha = 0.16;
    g.lineWidth = Math.max(1, R * 0.006);
    for (let i = 0; i < 46; i++) {
      const y0 = (rnd() * 2 - 1) * R;
      g.strokeStyle = rnd() < 0.5 ? '#fff3dc' : '#5a3418';
      g.beginPath();
      for (let xx = -R * 1.2; xx <= R * 1.2; xx += step) g.lineTo(xx, y0 + Math.sin((xx / R) * 6 + i) * R * 0.012);
      g.stroke();
    }
    // tormenta
    g.globalAlpha = 0.9;
    g.save();
    g.translate(R * (rnd() * 0.5 - 0.25), R * (0.22 + rnd() * 0.18));
    g.scale(1, 0.55);
    const sg = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.17);
    sg.addColorStop(0, '#f6e2c0'); sg.addColorStop(0.45, '#c56a3a'); sg.addColorStop(1, 'rgba(160,80,40,0)');
    g.fillStyle = sg;
    g.beginPath(); g.arc(0, 0, R * 0.17, 0, TAU); g.fill();
    g.restore();
    g.globalAlpha = 1;
    g.restore();
    // sombreado: la luz viene del disco de acreción (lightAng)
    const la = o.lightAng == null ? Math.PI : o.lightAng;
    const dx = Math.cos(la), dy = Math.sin(la);
    g.save();
    g.beginPath(); g.arc(c, c, R, 0, TAU); g.clip();
    const sh = g.createRadialGradient(c + dx * R * 0.5, c + dy * R * 0.5, R * 0.1, c - dx * R * 0.25, c - dy * R * 0.25, R * 1.5);
    sh.addColorStop(0, 'rgba(255,240,220,0.22)');
    sh.addColorStop(0.42, 'rgba(0,0,0,0)');
    sh.addColorStop(0.78, 'rgba(6,3,20,0.62)');
    sh.addColorStop(1, 'rgba(6,3,20,0.94)');
    g.fillStyle = sh; g.fillRect(0, 0, S, S);
    g.globalCompositeOperation = 'lighter';
    const rim = g.createRadialGradient(c - dx * R * 0.14, c - dy * R * 0.14, R * 0.9, c - dx * R * 0.14, c - dy * R * 0.14, R * 1.16);
    rim.addColorStop(0, 'rgba(255,170,90,0)');
    rim.addColorStop(1, 'rgba(255,175,95,0.75)');
    g.fillStyle = rim; g.fillRect(0, 0, S, S);
    g.restore();
    if (o.ring !== false) ring(true);
    return cv;
  };
  A.gasGiant = function (ctx, x, y, R, rnd, o) {
    o = o || {};
    const cv = A.renderGasGiant(R, rnd, o);
    ctx.save();
    ctx.translate(x, y);
    if (o.stretch) {
      ctx.rotate(o.stretchAng);
      ctx.scale(1 + o.stretch, 1 - o.stretch * 0.35);
      ctx.rotate(-o.stretchAng);
    }
    ctx.drawImage(cv, -cv.width / 2, -cv.height / 2);
    ctx.restore();
  };

  // ---------- Disco de acreción en alta resolución ----------
  A.disk = function (ctx, x, y, r, part, rnd, o) {
    o = o || {};
    const tilt = o.tilt == null ? A.TILT : o.tilt, sq = o.squash || 0.17;
    const rin = r * (o.inner || 1.12), rout = r * (o.outer || 3.3);
    ctx.save();
    ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(1, sq);
    ctx.beginPath();
    if (part === 'back') ctx.rect(-rout * 1.2, -rout * 1.2, rout * 2.4, rout * 1.2);
    else ctx.rect(-rout * 1.2, 0, rout * 2.4, rout * 1.2);
    ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    const ringPath = () => { ctx.beginPath(); ctx.arc(0, 0, rout, 0, TAU); ctx.arc(0, 0, rin, 0, TAU, true); };
    const g = ctx.createRadialGradient(0, 0, rin, 0, 0, rout);
    const I = o.intensity || 1;
    const F = part === 'front' ? 1.35 : 1; // el tramo que cruza por delante del horizonte brilla más
    g.addColorStop(0, 'rgba(255,240,220,' + Math.min(1, 0.85 * I * F) + ')');
    g.addColorStop(0.16, 'rgba(255,200,125,' + Math.min(1, 0.6 * I * F) + ')');
    g.addColorStop(0.38, 'rgba(255,125,55,' + 0.32 * I * F + ')');
    g.addColorStop(0.65, 'rgba(190,70,150,' + 0.1 * I + ')');
    g.addColorStop(1, 'rgba(120,60,255,0)');
    ctx.fillStyle = g; ringPath(); ctx.fill();
    // Doppler: el lado que se acerca (izquierda) brilla más
    const dg = ctx.createRadialGradient(-rout * 0.55, 0, 0, -rout * 0.55, 0, rout * 0.95);
    dg.addColorStop(0, 'rgba(255,225,180,' + 0.18 * I + ')');
    dg.addColorStop(1, 'rgba(255,150,80,0)');
    ctx.fillStyle = dg; ringPath(); ctx.fill();
    // vetas en órbita
    const n = o.n == null ? Math.round(500 + r * 7) : o.n;
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const u = rnd();
      const rr = rin + (rout - rin) * Math.pow(u, 1.7);
      const a = rnd() * TAU, s = Math.sin(a);
      if (part === 'back' ? s > 0.15 : s < -0.15) continue;
      const len = (0.05 + rnd() * 0.25) * (1.4 - u);
      const dop = 0.5 + 0.5 * -Math.cos(a);
      const L = 58 + (1 - u) * 34;
      ctx.strokeStyle = 'hsla(' + (16 + rnd() * 30) + ',100%,' + L + '%,' + (0.1 + 0.45 * dop * (1 - u * 0.6)) * I + ')';
      ctx.lineWidth = Math.max(0.6, r * (0.006 + rnd() * 0.022));
      ctx.beginPath(); ctx.arc(0, 0, rr, a, a + len); ctx.stroke();
    }
    ctx.restore();
  };

  // Arco de lente gravitatoria (el disco trasero curvado por encima del horizonte)
  A.lens = function (ctx, x, y, r, I) {
    I = I || 1;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const [rr, w, a] of [[1.1, 0.09, 0.6], [1.18, 0.2, 0.22], [1.32, 0.38, 0.08]]) {
      ctx.beginPath();
      ctx.ellipse(x, y, r * rr, r * rr * 0.97, A.TILT, Math.PI * 1.03, Math.PI * 1.97);
      ctx.lineWidth = r * w; ctx.strokeStyle = 'rgba(255,192,120,' + a * I + ')'; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(x, y, r * 1.07, 0, TAU);
    ctx.lineWidth = r * 0.05; ctx.strokeStyle = 'rgba(255,212,175,' + 0.25 * I + ')'; ctx.stroke();
    ctx.restore();
  };

  // Agujero completo: disco trasero + lente + drawHole del juego + disco delantero
  A.hole = function (ctx, x, y, r, rnd, o) {
    o = o || {};
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const halo = ctx.createRadialGradient(x, y, r, x, y, r * (o.halo || 6));
    halo.addColorStop(0, 'rgba(255,140,60,0.22)');
    halo.addColorStop(0.35, 'rgba(150,80,255,0.12)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(x, y, r * (o.halo || 6), 0, TAU); ctx.fill();
    ctx.restore();
    A.disk(ctx, x, y, r, 'back', rnd, o);
    A.lens(ctx, x, y, r, o.intensity);
    ctx.save();
    resetDisk();
    try {
      // En arte estático las partículas cuadradas del disco del juego se ven como bloques: se ocultan
      // (las sustituye el disco en alta resolución) y se conservan el halo, el núcleo y el anillo de fotones.
      const R = V.Render, saved = R.disk;
      if (Array.isArray(saved) && !o.gameDisk) R.disk = [];
      try { R.drawHole(ctx, x, y, r, { stab: 1, stabMax: 1, demo: true, headless: true, x: 0, y: 0, r: 1 }, 0); }
      finally { R.disk = saved; }
    } catch (e) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = '#000'; ctx.fill();
      ctx.lineWidth = Math.max(1.5, r * 0.09); ctx.strokeStyle = 'rgba(255,225,190,0.95)'; ctx.stroke();
    }
    ctx.restore();
    // núcleo limpio (el drawHole del juego ya lo pinta; esto garantiza negro puro)
    ctx.beginPath(); ctx.arc(x, y, r * 0.985, 0, TAU); ctx.fillStyle = '#000'; ctx.fill();
    A.disk(ctx, x, y, r, 'front', rnd, o);
  };

  // ---------- Corriente de marea: el planeta se deshace en espiral hacia el agujero ----------
  A.streamPath = function (P, hole, o) {
    const dx = P.x - hole.x, dy = P.y - hole.y;
    const d0 = Math.hypot(dx, dy), a0 = Math.atan2(dy, dx);
    const dir = o.dir || 1, turns = o.turns || 0.55;
    const start = Math.max(hole.r * 2, d0 - P.R * 0.9), end = hole.r * 1.5;
    const tilt = A.TILT, ct = Math.cos(tilt), st = Math.sin(tilt);
    return function (t) {
      const d = start * Math.pow(end / start, Math.pow(t, 0.85));
      const a = a0 + dir * turns * TAU * Math.pow(t, 1.3);
      const px = Math.cos(a) * d, py = Math.sin(a) * d;
      const lx = px * ct + py * st;
      let ly = -px * st + py * ct;
      ly *= 1 - smooth(t) * 0.7;
      return [hole.x + lx * ct - ly * st, hole.y + lx * st + ly * ct];
    };
  };
  A.stream = function (ctx, P, hole, rnd, o) {
    o = o || {};
    const pt = A.streamPath(P, hole, o);
    const pal = o.pal || A.GAS_PAL;
    const hot = '#ffd9a8';
    const wAt = (t) => P.R * 0.42 * Math.pow(1 - t, 1.2) + hole.r * 0.1;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const steps = 220;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, [x, y] = pt(t), w = wAt(t) * 1.3;
      const c = mixHex(pal[0], hot, smooth(t));
      const g = ctx.createRadialGradient(x, y, 0, x, y, w);
      g.addColorStop(0, 'rgba(' + c + ',' + (0.02 + 0.035 * t) + ')');
      g.addColorStop(1, 'rgba(' + c + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - w, y - w, w * 2, w * 2);
    }
    const n = o.n || 1600;
    const unit = Math.max(1, hole.r * 0.03);
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const t = Math.pow(rnd(), 0.75);
      const [x, y] = pt(t), [x2, y2] = pt(Math.min(1, t + 0.004));
      let tx = x2 - x, ty = y2 - y; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const off = gauss(rnd) * wAt(t) * 0.75;
      const px = x - ty * off, py = y + tx * off;
      const c = t < 0.55 ? mixHex(pal[(rnd() * pal.length) | 0], hot, t * 0.6) : mixHex(pal[2], hot, 0.4 + t * 0.6);
      const len = unit * (1 + rnd() * 3) * (1 + t * 4);
      ctx.strokeStyle = 'rgba(' + c + ',' + (0.22 + rnd() * 0.5) * (1 - t * 0.35) + ')';
      ctx.lineWidth = unit * (0.4 + rnd() * 1.1) * (1.2 - t * 0.6);
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + tx * len, py + ty * len); ctx.stroke();
    }
    ctx.restore();
    // fragmentos rocosos que se desprenden del planeta (sprites del juego)
    const chunks = o.chunks == null ? 14 : o.chunks;
    for (let i = 0; i < chunks; i++) {
      const t = 0.02 + Math.pow(rnd(), 1.4) * 0.45;
      const [x, y] = pt(t);
      const off = gauss(rnd) * wAt(t) * 0.8;
      const s = P.R * (0.025 + rnd() * 0.06) * (1 - t);
      const sp = A.sprite(rnd() < 0.5 ? 'asteroid' : 'rock', (rnd() * 6) | 0);
      if (!sp) continue;
      const sz = s * sp.scale;
      ctx.save();
      ctx.translate(x + off * 0.6, y - off * 0.6);
      ctx.rotate(rnd() * TAU);
      ctx.drawImage(sp.img, -sz / 2, -sz / 2, sz, sz);
      ctx.restore();
    }
  };

  // ---------- Escombros y polvo en espiral ----------
  A.debris = function (ctx, hole, rnd, o) {
    const n = o.n || 30, maxR = o.maxR, types = o.types || ['rock', 'asteroid', 'moon'];
    const arms = 3, arm0 = rnd() * TAU;
    for (let i = 0; i < n; i++) {
      const u = 0.12 + rnd() * 0.88;
      const d = hole.r * 3 + (maxR - hole.r * 3) * u;
      const a = arm0 + ((i % arms) * TAU) / arms + Math.log(d / hole.r) * 1.25 + gauss(rnd) * 0.35;
      let x = Math.cos(a) * d, y = Math.sin(a) * d;
      y *= 0.55 + 0.45 * u; // se aplanan al acercarse al plano del disco
      const ct = Math.cos(A.TILT), st = Math.sin(A.TILT);
      const X = hole.x + x * ct - y * st, Y = hole.y + x * st + y * ct;
      const type = types[(rnd() * types.length) | 0];
      const sp = A.sprite(type, (rnd() * 6) | 0);
      if (!sp) continue;
      const s = hole.r * (o.sMin + (o.sMax - o.sMin) * rnd()) * (0.4 + u * 0.8);
      const sz = s * sp.scale;
      // estela
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const ta = a + Math.PI / 2 + 0.35;
      const tl = s * (3 + 5 * (1 - u));
      const g = ctx.createLinearGradient(X, Y, X - Math.cos(ta) * tl, Y - Math.sin(ta) * tl);
      const col = (V.TYPE_COLORS && V.TYPE_COLORS[type]) || '#c9b8a0';
      g.addColorStop(0, hexA(col, 0.35)); g.addColorStop(1, hexA(col, 0));
      ctx.strokeStyle = g; ctx.lineWidth = s * 0.9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X - Math.cos(ta) * tl, Y - Math.sin(ta) * tl); ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.translate(X, Y); ctx.rotate(rnd() * TAU);
      ctx.globalAlpha = 0.85 + 0.15 * u;
      ctx.drawImage(sp.img, -sz / 2, -sz / 2, sz, sz);
      ctx.restore();
    }
  };

  A.spiralDust = function (ctx, hole, rnd, o) {
    const n = o.n || 600, maxR = o.maxR, minR = o.minR || hole.r * 1.6;
    const arms = o.arms || 3, arm0 = rnd() * TAU;
    const ct = Math.cos(A.TILT), st = Math.sin(A.TILT);
    const cols = o.cols || ['#ffb36b', '#ffd2a8', '#b98bff', '#9fb3d9', '#ff8a3c', '#e08bff'];
    const unit = Math.max(0.8, hole.r * 0.025);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const u = Math.pow(rnd(), 0.8);
      const d = minR + (maxR - minR) * u;
      const a = arm0 + ((i % arms) * TAU) / arms + Math.log(d / hole.r) * 1.25 + gauss(rnd) * 0.45 * (0.4 + u);
      const sq = 0.32 + 0.68 * smooth(Math.min(1, u * 1.4));
      const x = Math.cos(a) * d, y = Math.sin(a) * d * sq;
      if (o.front && Math.sin(a) < 0) continue;
      const X = hole.x + x * ct - y * st, Y = hole.y + x * st + y * ct;
      const ta = a + Math.PI / 2 + 0.3;
      const len = unit * (2 + rnd() * 6) * (1.6 - u);
      ctx.strokeStyle = hexA(cols[(rnd() * cols.length) | 0], 0.25 + rnd() * 0.6);
      ctx.lineWidth = unit * (0.5 + rnd() * 1.2);
      ctx.beginPath(); ctx.moveTo(X, Y);
      ctx.lineTo(X - Math.cos(ta) * len, Y - Math.sin(ta) * len * sq); ctx.stroke();
    }
    ctx.restore();
  };

  // ---------- Logo y frase ----------
  A.logo = function (ctx, cx, cy, maxW, maxH, o) {
    o = o || {};
    const txt = 'VOIDLING', sp = o.spacing == null ? 0.18 : o.spacing;
    ctx.save();
    ctx.font = '900 100px ' + A.FONT;
    const ws = [...txt].map((ch) => ctx.measureText(ch).width);
    const m = ctx.measureText(txt);
    const asc = m.actualBoundingBoxAscent || 72, desc = m.actualBoundingBoxDescent || 0;
    const total = ws.reduce((a, b) => a + b, 0) + sp * 100 * (txt.length - 1);
    let size = (maxW / total) * 100;
    if (maxH) size = Math.min(size, (maxH / (asc + desc)) * 100);
    const k = size / 100;
    ctx.font = '900 ' + size + 'px ' + A.FONT;
    const W = total * k, h = (asc + desc) * k, top = cy - h / 2, base = top + asc * k;
    const x0 = cx - W / 2;
    const grad = ctx.createLinearGradient(0, top, 0, top + h);
    for (const [s, c] of A.LOGO_STOPS) grad.addColorStop(s, c);
    const pass = (fn) => { let x = x0; for (let i = 0; i < txt.length; i++) { fn(txt[i], x); x += ws[i] * k + sp * size; } };
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.lineJoin = 'round';
    if (o.glow !== 0) {
      ctx.shadowColor = 'rgba(255,140,60,' + 0.6 * (o.glow || 1) + ')';
      ctx.shadowBlur = size * 0.45;
      ctx.fillStyle = grad;
      pass((ch, x) => ctx.fillText(ch, x, base));
      ctx.shadowColor = 'rgba(155,92,255,' + 0.35 * (o.glow || 1) + ')';
      ctx.shadowBlur = size * 0.9;
      pass((ch, x) => ctx.fillText(ch, x, base));
      ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
    }
    if (o.stroke !== 0) {
      ctx.strokeStyle = o.strokeColor || 'rgba(8,4,20,0.92)';
      ctx.lineWidth = size * (o.strokeW || 0.09);
      pass((ch, x) => ctx.strokeText(ch, x, base));
    }
    ctx.fillStyle = grad;
    pass((ch, x) => ctx.fillText(ch, x, base));
    ctx.restore();
    return { x: x0, y: top, w: W, h, size };
  };

  // Frase en una o dos líneas; la segunda mitad en color de acento.
  A.tagline = function (ctx, text, cx, y, maxW, size, o) {
    o = o || {};
    const cut = text.indexOf('. ');
    const p1 = cut > 0 ? text.slice(0, cut + 1) : text, p2 = cut > 0 ? text.slice(cut + 2) : '';
    ctx.save();
    ctx.textBaseline = 'top';
    const setF = (s) => { ctx.font = (o.weight || 700) + ' ' + s + 'px ' + A.TEXT; if ('letterSpacing' in ctx) ctx.letterSpacing = (s * 0.02).toFixed(2) + 'px'; };
    setF(size);
    let lines = o.lines || 'auto';
    const one = p1 + (p2 ? ' ' + p2 : '');
    if (lines === 'auto') lines = ctx.measureText(one).width <= maxW ? 1 : 2;
    const widest = lines === 1 ? ctx.measureText(one).width : Math.max(ctx.measureText(p1).width, ctx.measureText(p2).width);
    if (widest > maxW) { size *= maxW / widest; setF(size); }
    const c1 = o.color || '#f3efff', c2 = o.accent || '#ffb878';
    const lh = size * 1.28;
    const draw = (shadow) => {
      ctx.shadowColor = shadow ? 'rgba(4,2,12,0.95)' : 'transparent';
      ctx.shadowBlur = shadow ? size * 0.6 : 0;
      if (lines === 1) {
        const w1 = ctx.measureText(p1 + ' ').width, w = ctx.measureText(one).width;
        ctx.textAlign = 'left';
        ctx.fillStyle = c1; ctx.fillText(p1 + ' ', cx - w / 2, y);
        ctx.fillStyle = c2; ctx.fillText(p2, cx - w / 2 + w1, y);
      } else {
        ctx.textAlign = 'center';
        ctx.fillStyle = c1; ctx.fillText(p1, cx, y);
        ctx.fillStyle = c2; ctx.fillText(p2, cx, y + lh);
      }
    };
    draw(true); draw(true); draw(false);
    ctx.restore();
    return { bottom: y + lh * lines, size };
  };

  // ---------- Escenas por formato ----------
  // Todas las posiciones son relativas: x,y en fracción de W/H; radios en fracción de min(W,H).
  const LAYOUTS = {
    landscape: { hole: { x: 0.735, y: 0.5, r: 0.15 }, planet: { x: 0.95, y: 0.14, r: 0.3 }, logo: { cx: 0.31, cy: 0.42, cyNoTag: 0.5, w: 0.53 }, tag: { w: 0.56, size: 0.05, lines: 2 }, scrim: 'left' },
    small: { hole: { x: 0.885, y: 0.5, r: 0.2 }, planet: { x: 1.06, y: 0.02, r: 0.36 }, logo: { cx: 0.395, cy: 0.5, w: 0.72 }, scrim: 'left', noTag: true },
    vertical: { hole: { x: 0.47, y: 0.37, r: 0.15 }, planet: { x: 0.93, y: 0.11, r: 0.26 }, logo: { cx: 0.5, cy: 0.755, cyNoTag: 0.8, w: 0.86 }, tag: { w: 0.86, size: 0.05, lines: 2 }, scrim: 'bottom' },
    hero: { hole: { x: 0.6, y: 0.53, r: 0.15 }, planet: { x: 0.8, y: 0.3, r: 0.3 }, scrim: null },
    bg: { hole: { x: 0.86, y: 0.3, r: 0.075 }, planet: { x: 0.985, y: 0.12, r: 0.15 }, dim: 0.5, scrim: null },
    keyart: { hole: { x: 0.69, y: 0.5, r: 0.15 }, planet: { x: 0.93, y: 0.15, r: 0.3 }, logo: { cx: 0.3, cy: 0.43, cyNoTag: 0.5, w: 0.48 }, tag: { w: 0.5, size: 0.04, lines: 2 }, scrim: 'left' },
  };
  A.LAYOUTS = LAYOUTS;

  A.scene = function (ctx, W, H, L, rnd) {
    const md = Math.min(W, H);
    const hole = { x: L.hole.x * W, y: L.hole.y * H, r: L.hole.r * md };
    A.background(ctx, W, H, rnd, {
      blobs: [
        { x: hole.x, y: hole.y, r: md * 1.15, c: 'rgba(120,60,220,0.24)' },
        { x: hole.x, y: hole.y, r: md * 0.6, c: 'rgba(255,120,50,0.14)' },
        { x: W * 0.12, y: H * 0.85, r: md * 0.9, c: 'rgba(40,90,210,0.14)' },
        { x: W * 0.3, y: H * 0.05, r: md * 0.7, c: 'rgba(200,60,200,0.08)' },
      ],
    });
    A.spiralDust(ctx, hole, rnd, { n: Math.round(250 + (W * H) / 900), maxR: md * 1.1 });
    A.debris(ctx, hole, rnd, { n: Math.round(12 + (W * H) / 60000), maxR: md * 0.95, sMin: 0.08, sMax: 0.32 });
    if (L.planet) {
      const P = { x: L.planet.x * W, y: L.planet.y * H, R: L.planet.r * md };
      const ang = Math.atan2(hole.y - P.y, hole.x - P.x);
      A.stream(ctx, P, hole, rnd, { n: Math.round(900 + (W * H) / 500), turns: 0.55 });
      A.gasGiant(ctx, P.x, P.y, P.R, rnd, { lightAng: ang, stretch: 0.07, stretchAng: ang });
      // borde que se deshace: polvo saliendo del limbo cercano
      A.stream(ctx, P, hole, rnd, { n: 260, turns: 0.55, chunks: 0 });
    }
    A.hole(ctx, hole.x, hole.y, hole.r, rnd, {});
    A.spiralDust(ctx, hole, rnd, { n: Math.round(120 + (W * H) / 4000), maxR: hole.r * 4.5, minR: hole.r * 1.3, front: true, arms: 2 });
    A.vignette(ctx, W, H, 0.6);
    if (L.dim) { ctx.fillStyle = 'rgba(5,3,13,' + L.dim + ')'; ctx.fillRect(0, 0, W, H); }
    if (L.scrim === 'left') {
      const g = ctx.createLinearGradient(0, 0, W * 0.72, 0);
      g.addColorStop(0, 'rgba(5,3,13,0.62)'); g.addColorStop(0.6, 'rgba(5,3,13,0.3)'); g.addColorStop(1, 'rgba(5,3,13,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    } else if (L.scrim === 'bottom') {
      const g = ctx.createLinearGradient(0, H * 0.55, 0, H);
      g.addColorStop(0, 'rgba(5,3,13,0)'); g.addColorStop(0.45, 'rgba(5,3,13,0.6)'); g.addColorStop(1, 'rgba(5,3,13,0.85)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    return hole;
  };

  A.drawText = function (ctx, W, H, L, opts) {
    if (!L.logo) return;
    const md = Math.min(W, H);
    const withTag = opts.tagline && L.tag && !L.noTag;
    const cy = withTag || L.logo.cyNoTag == null ? L.logo.cy : L.logo.cyNoTag;
    const lg = A.logo(ctx, L.logo.cx * W, cy * H, L.logo.w * W, null, {});
    if (withTag) {
      A.tagline(ctx, A.TAGLINE[opts.lang] || A.TAGLINE.en, L.logo.cx * W, lg.y + lg.h + lg.size * 0.42, L.tag.w * W, L.tag.size * md, { lines: L.tag.lines });
    }
  };

  // Icono: versión simplificada para tamaños pequeños.
  A.icon = function (ctx, S, rnd, o) {
    o = o || {};
    if (!o.transparent) {
      const bg = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.75);
      bg.addColorStop(0, '#2a1250'); bg.addColorStop(0.55, '#100828'); bg.addColorStop(1, '#05030d');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, S, S);
      if (S >= 96) {
        for (let i = 0; i < S / 6; i++) {
          ctx.fillStyle = 'rgba(220,215,255,' + (0.2 + rnd() * 0.6) + ')';
          const s = 0.6 + rnd() * 1.4;
          ctx.fillRect(rnd() * S, rnd() * S, s, s);
        }
      }
    }
    const c = S / 2;
    if (S <= 48) {
      const r = S * 0.2;
      const gl = ctx.createRadialGradient(c, c, r * 0.9, c, c, S * 0.5);
      gl.addColorStop(0, 'rgba(255,150,70,0.55)'); gl.addColorStop(0.5, 'rgba(155,92,255,0.25)'); gl.addColorStop(1, 'rgba(155,92,255,0)');
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(c, c, S * 0.5, 0, TAU); ctx.fill();
      const ell = (a0, a1) => { ctx.beginPath(); ctx.ellipse(c, c, S * 0.43, S * 0.13, A.TILT, a0, a1); ctx.lineWidth = Math.max(1.5, S * 0.1); ctx.strokeStyle = '#ff9a3c'; ctx.stroke(); ctx.lineWidth = Math.max(0.8, S * 0.04); ctx.strokeStyle = '#ffe0b8'; ctx.stroke(); };
      ell(Math.PI, TAU);
      ctx.beginPath(); ctx.arc(c, c, r, 0, TAU); ctx.fillStyle = '#000'; ctx.fill();
      ctx.lineWidth = Math.max(1, S * 0.055); ctx.strokeStyle = '#ffe1be'; ctx.stroke();
      ell(0, Math.PI);
      return;
    }
    const r = S * (o.transparent ? 0.185 : 0.18);
    A.hole(ctx, c, c, r, rnd, { outer: 2.5, squash: 0.24, n: Math.round(S * 1.6), halo: o.transparent ? 2.6 : 5, intensity: 1.15 });
    if (o.transparent) { // borde suave: nada de halo cortado en las esquinas
      ctx.save();
      ctx.globalCompositeOperation = 'destination-in';
      const m = ctx.createRadialGradient(c, c, S * 0.4, c, c, S * 0.5);
      m.addColorStop(0, '#000'); m.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = m; ctx.fillRect(0, 0, S, S);
      ctx.restore();
    }
  };

  // ---------- Catálogo de imágenes ----------
  A.ASSETS = [
    { id: 'header', file: 'steam/header_capsule_920x430', w: 920, h: 430, name: 'Header capsule', where: 'Arriba a la derecha en la página de la tienda, listas, recomendaciones', layout: 'landscape', text: true },
    { id: 'small', file: 'steam/small_capsule_462x174', w: 462, h: 174, name: 'Small capsule', where: 'Resultados de búsqueda, listas "Más vendidos". Solo logo.', layout: 'small', logoOnly: true },
    { id: 'main', file: 'steam/main_capsule_1232x706', w: 1232, h: 706, name: 'Main capsule', where: 'Carrusel principal de la portada de Steam', layout: 'landscape', text: true },
    { id: 'vertical', file: 'steam/vertical_capsule_748x896', w: 748, h: 896, name: 'Vertical capsule', where: 'Rebajas de temporada y eventos (formato vertical)', layout: 'vertical', text: true },
    { id: 'library_capsule', file: 'steam/library_capsule_600x900', w: 600, h: 900, name: 'Library capsule', where: 'Biblioteca de Steam (cuadrícula)', layout: 'vertical', text: true },
    { id: 'library_hero', file: 'steam/library_hero_3840x1240', w: 3840, h: 1240, name: 'Library hero', where: 'Cabecera del juego en la biblioteca. Sin texto.', layout: 'hero' },
    { id: 'library_logo', file: 'steam/library_logo_1280x720', w: 1280, h: 720, name: 'Library logo', where: 'Se superpone al hero. PNG transparente.', logoAsset: true },
    { id: 'page_bg', file: 'steam/page_background_1438x810', w: 1438, h: 810, name: 'Page background', where: 'Fondo de la página de la tienda (oscuro, sutil)', layout: 'bg' },
    { id: 'community_icon', file: 'steam/community_icon_184x184', w: 184, h: 184, name: 'Community icon', where: 'Comunidad, chat, perfil', icon: 'opaque' },
    { id: 'app_icon', file: 'steam/app_icon_256x256', w: 256, h: 256, name: 'App icon', where: 'Icono del ejecutable / acceso directo (transparente). También .ico', icon: 'transparent', ico: true },
    { id: 'keyart', file: 'press/key_art_1920x1080', w: 1920, h: 1080, name: 'Key art (prensa)', where: 'Press kit, redes, itch.io, anuncios', layout: 'keyart', text: true, extra: true },
    { id: 'keyart_clean', file: 'press/key_art_clean_1920x1080', w: 1920, h: 1080, name: 'Key art sin texto', where: 'Fondos de vídeo, miniaturas de YouTube', layout: 'keyart', extra: true },
    { id: 'itch_cover', file: 'press/itch_cover_630x500', w: 630, h: 500, name: 'Portada itch.io', where: 'itch.io / galaxy.click', layout: 'vertical', text: true, extra: true },
  ];

  A.SEED = 7;
  A.render = function (asset, canvas, opts) {
    opts = Object.assign({ seed: A.SEED, lang: 'en', tagline: true }, opts || {});
    A.init();
    canvas.width = asset.w; canvas.height = asset.h;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, asset.w, asset.h);
    const rnd = A.prng(opts.seed * 7919 + asset.w * 31 + asset.h);
    return A.withSeed(opts.seed * 104729 + asset.w, () => {
      if (asset.icon) { A.icon(ctx, asset.w, rnd, { transparent: asset.icon === 'transparent' }); return; }
      if (asset.logoAsset) {
        A.logo(ctx, asset.w / 2, asset.h / 2, asset.w * 0.86, asset.h * 0.6, { glow: 0.9 });
        return;
      }
      const L = Object.assign({}, LAYOUTS[asset.layout]);
      if (!asset.text && !asset.logoOnly) { L.logo = null; if (asset.layout === 'keyart') L.scrim = null; }
      A.scene(ctx, asset.w, asset.h, L, rnd);
      A.drawText(ctx, asset.w, asset.h, L, { lang: opts.lang, tagline: opts.tagline && asset.text });
    });
  };

  A.renderIcon = function (S, seed) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const ctx = cv.getContext('2d');
    A.init();
    A.withSeed(seed || A.SEED, () => A.icon(ctx, S, A.prng((seed || A.SEED) + S), { transparent: true }));
    return cv;
  };

  // ---------- Archivos: ICO y ZIP (sin dependencias) ----------
  function canvasBytes(cv) {
    return new Promise((res) => cv.toBlob((b) => b.arrayBuffer().then((ab) => res(new Uint8Array(ab))), 'image/png'));
  }
  A.canvasBytes = canvasBytes;
  A.buildIco = async function (seed) {
    const sizes = [16, 24, 32, 48, 64, 128, 256];
    const pngs = [];
    for (const s of sizes) pngs.push(await canvasBytes(A.renderIcon(s, seed)));
    const headLen = 6 + 16 * sizes.length;
    const total = headLen + pngs.reduce((a, p) => a + p.length, 0);
    const out = new Uint8Array(total), dv = new DataView(out.buffer);
    dv.setUint16(0, 0, true); dv.setUint16(2, 1, true); dv.setUint16(4, sizes.length, true);
    let off = headLen;
    sizes.forEach((s, i) => {
      const e = 6 + 16 * i;
      out[e] = s >= 256 ? 0 : s; out[e + 1] = s >= 256 ? 0 : s; out[e + 2] = 0; out[e + 3] = 0;
      dv.setUint16(e + 4, 1, true); dv.setUint16(e + 6, 32, true);
      dv.setUint32(e + 8, pngs[i].length, true); dv.setUint32(e + 12, off, true);
      out.set(pngs[i], off); off += pngs[i].length;
    });
    return out;
  };

  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  // ZIP sin compresión (los PNG ya están comprimidos)
  A.buildZip = function (files) {
    const enc = new TextEncoder();
    const parts = [], central = [];
    let off = 0;
    for (const f of files) {
      const name = enc.encode(f.path), data = f.bytes, crc = crc32(data);
      const h = new Uint8Array(30 + name.length), dv = new DataView(h.buffer);
      dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0x0800, true); dv.setUint16(8, 0, true);
      dv.setUint16(10, 0, true); dv.setUint16(12, 0x21, true); dv.setUint32(14, crc, true);
      dv.setUint32(18, data.length, true); dv.setUint32(22, data.length, true); dv.setUint16(26, name.length, true); dv.setUint16(28, 0, true);
      h.set(name, 30);
      const c = new Uint8Array(46 + name.length), cv = new DataView(c.buffer);
      cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true);
      cv.setUint16(10, 0, true); cv.setUint16(12, 0, true); cv.setUint16(14, 0x21, true); cv.setUint32(16, crc, true);
      cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true); cv.setUint16(28, name.length, true);
      cv.setUint32(42, off, true); c.set(name, 46);
      parts.push(h, data); central.push(c);
      off += h.length + data.length;
    }
    const cenLen = central.reduce((a, c) => a + c.length, 0);
    const end = new Uint8Array(22), ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
    ev.setUint32(12, cenLen, true); ev.setUint32(16, off, true);
    return new Blob([...parts, ...central, end], { type: 'application/zip' });
  };

  // Lista completa de archivos a exportar: [{path, bytes}]
  A.exportList = async function (opts) {
    opts = opts || {};
    const seed = opts.seed || A.SEED;
    const out = [];
    for (const a of A.ASSETS) {
      if (opts.only && opts.only.indexOf(a.id) < 0) continue;
      // Versión base sin frase (cumple las reglas de cápsulas de Steam: solo arte + logo)
      // y, si el formato admite frase, variantes "_frase_en" / "_frase_es" para itch.io, redes y prensa.
      const vars = a.text ? [[false, 'en', ''], [true, 'en', '_frase_en'], [true, 'es', '_frase_es']] : [[false, 'en', '']];
      for (const [tag, lang, suf] of vars) {
        const cv = document.createElement('canvas');
        A.render(a, cv, { seed, lang, tagline: tag });
        out.push({ path: a.file + suf + '.png', bytes: await canvasBytes(cv) });
        await new Promise((r) => setTimeout(r, 0));
      }
      if (a.ico) out.push({ path: 'steam/voidling.ico', bytes: await A.buildIco(seed) });
    }
    return out;
  };

  window.StoreArt = A;
})();
