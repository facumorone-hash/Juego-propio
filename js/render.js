// Render procedural: sprites generados al iniciar, fondo con paralaje, agujero negro y HUD.
(function () {
  const V = window.V;
  const TAU = V.TAU;

  function mk(size) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    return { c, g: c.getContext('2d') };
  }
  function hsl(h, s, l, a) { return 'hsla(' + h + ',' + s + '%,' + l + '%,' + (a == null ? 1 : a) + ')'; }

  // ---------- Paleta accesible ----------
  // save.js define V.pal() (normal o daltónica). Respaldo: los colores originales del juego.
  const PAL0 = {
    danger: '#ff5a6e', enemy: '#ff4fd8', swarm: '#ff4fd8', pulsar: '#7fe3ff', boss: '#ffd27a', gold: '#ffd25a',
    stabHigh: '#47f0a0', stabMid: '#ffd23c', stabLow: '#ff5470', hurt: '#ff2878', lowStab: '#9640ff', pulse: '#4fb3ff',
  };
  function pc(k) { const p = V.pal ? V.pal() : null; return (p && p[k]) || PAL0[k]; }
  const rgbCache = {};
  function rgb(hex) { // '#rrggbb' → 'r,g,b'
    let v = rgbCache[hex];
    if (v) return v;
    let h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h, 16) || 0;
    v = rgbCache[hex] = ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255);
    return v;
  }
  const ca = (hex, a) => 'rgba(' + rgb(hex) + ',' + a + ')';
  const RF = () => !!V.reduceFlash; // "reducir destellos"
  // Fuente del canvas con respaldo CJK (V.font la define i18n.js; respaldo por si se carga sin él).
  const F = (w, px) => (V.font ? V.font(w, px) : w + ' ' + px + 'px "Segoe UI",system-ui,sans-serif');

  // Fija ctx.font al mayor tamaño ≤ px con el que `text` cabe en maxW (mínimo minPx).
  // Así los idiomas largos (alemán, ruso) no se salen del HUD. Resultado cacheado por texto.
  const fitCache = new Map();
  function fitFont(ctx, text, maxW, weight, px, minPx) {
    minPx = minPx || Math.max(8, Math.round(px * 0.6));
    const key = weight + '|' + px + '|' + Math.round(maxW) + '|' + V.FONT + '|' + text;
    let size = fitCache.get(key);
    if (size == null) {
      size = px;
      ctx.font = F(weight, size);
      const w = ctx.measureText(text).width;
      if (w > maxW && w > 0) {
        size = Math.max(minPx, Math.floor(px * (maxW / w) * 10) / 10);
        ctx.font = F(weight, size);
        while (size > minPx && ctx.measureText(text).width > maxW) { size = Math.max(minPx, size - 0.5); ctx.font = F(weight, size); }
      }
      if (fitCache.size > 400) fitCache.clear();
      fitCache.set(key, size);
    }
    ctx.font = F(weight, size);
    return size;
  }
  function fitText(ctx, text, x, y, maxW, weight, px, minPx) {
    fitFont(ctx, text, maxW, weight, px, minPx);
    ctx.fillText(text, x, y);
  }

  const R = {
    sprites: {}, // type -> [{img, scale}] (scale = tamaño de dibujo / radio del cuerpo)
    bgOff: { x: 0, y: 0 },
    disk: [],
  };

  function shade(g, c, R0, k) {
    const sh = g.createRadialGradient(c - R0 * 0.45, c - R0 * 0.45, R0 * 0.1, c, c, R0 * 1.05);
    sh.addColorStop(0, 'rgba(255,255,255,' + 0.18 * k + ')');
    sh.addColorStop(0.5, 'rgba(0,0,0,0)');
    sh.addColorStop(1, 'rgba(0,0,0,' + 0.75 * k + ')');
    g.fillStyle = sh;
    g.fill();
  }

  function rockSprite(v, craters, big) {
    const S = 128, c = S / 2, R0 = 54;
    const { c: cv, g } = mk(S);
    const hue = [28, 35, 20, 210, 0, 45][v], sat = [22, 30, 18, 10, 6, 35][v];
    const n = big ? 14 : 10;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU, rr = R0 * V.rand(big ? 0.82 : 0.72, 1);
      pts.push([c + Math.cos(a) * rr, c + Math.sin(a) * rr]);
    }
    g.beginPath();
    pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
    g.closePath();
    g.fillStyle = hsl(hue, sat, big ? 42 : 48);
    g.fill();
    g.save();
    g.clip();
    for (let i = 0; i < (craters ? 7 : 3); i++) {
      const x = c + V.rand(-R0, R0) * 0.6, y = c + V.rand(-R0, R0) * 0.6, rr = V.rand(5, craters ? 14 : 8);
      g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fillStyle = hsl(hue, sat, 30, 0.7); g.fill();
      g.beginPath(); g.arc(x - 1.5, y - 1.5, rr * 0.8, 0, TAU); g.fillStyle = hsl(hue, sat, 36, 0.6); g.fill();
    }
    g.restore();
    g.beginPath();
    pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
    g.closePath();
    shade(g, c, R0, 1);
    g.strokeStyle = hsl(hue, sat, 70, 0.25); g.lineWidth = 1.5; g.stroke();
    return { img: cv, scale: S / R0 };
  }

  function dustSprite(v) {
    const S = 64, c = 32;
    const { c: cv, g } = mk(S);
    const hue = [210, 190, 30, 260, 180, 0][v];
    const gr = g.createRadialGradient(c, c, 0, c, c, 30);
    gr.addColorStop(0, hsl(hue, 40, 92));
    gr.addColorStop(0.35, hsl(hue, 45, 70, 0.9));
    gr.addColorStop(1, hsl(hue, 50, 50, 0));
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
    return { img: cv, scale: S / 14 };
  }

  function moonSprite(v) {
    const S = 128, c = 64, R0 = 54;
    const { c: cv, g } = mk(S);
    const pal = [[220, 6, 70], [35, 25, 66], [200, 30, 78], [15, 30, 55], [260, 12, 62], [90, 10, 60]][v];
    g.beginPath(); g.arc(c, c, R0, 0, TAU); g.fillStyle = hsl(pal[0], pal[1], pal[2]); g.fill();
    g.save(); g.clip();
    for (let i = 0; i < 12; i++) {
      const x = c + V.rand(-R0, R0), y = c + V.rand(-R0, R0), rr = V.rand(3, 12);
      g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fillStyle = hsl(pal[0], pal[1], pal[2] - 14, 0.6); g.fill();
      g.beginPath(); g.arc(x + 1, y + 1, rr * 0.75, 0, TAU); g.fillStyle = hsl(pal[0], pal[1], pal[2] - 6, 0.5); g.fill();
    }
    g.restore();
    g.beginPath(); g.arc(c, c, R0, 0, TAU); shade(g, c, R0, 1);
    return { img: cv, scale: S / R0 };
  }

  function planetSprite(v) {
    const S = 160, c = 80, R0 = 54;
    const { c: cv, g } = mk(S);
    const pals = [
      ['#d9a066', '#b5713f', '#efc690', '#8f5530'], // gigante gaseoso
      ['#2f7fd1', '#3fa34d', '#2563b0', '#5fbf6a'], // oceánico
      ['#c4553a', '#e07a4f', '#9c3b28', '#f0a070'], // desértico
      ['#9ae6f0', '#d8f6fa', '#6cc7d8', '#ffffff'], // helado
      ['#8a5cd6', '#c08cf0', '#5d3aa0', '#e0b0ff'], // exótico
      ['#e8c85a', '#d4a63c', '#f5e08f', '#b88a2a'], // anillado
    ][v];
    // anillo trasero
    if (v === 5 || v === 0) {
      g.save(); g.translate(c, c); g.rotate(-0.35); g.scale(1, 0.28);
      g.beginPath(); g.arc(0, 0, R0 * 1.42, Math.PI, TAU); g.lineWidth = 10; g.strokeStyle = 'rgba(240,220,170,0.55)'; g.stroke();
      g.restore();
    }
    // atmósfera
    const at = g.createRadialGradient(c, c, R0 * 0.95, c, c, R0 * 1.25);
    at.addColorStop(0, pals[2] + 'aa'); at.addColorStop(1, pals[2] + '00');
    g.fillStyle = at; g.beginPath(); g.arc(c, c, R0 * 1.25, 0, TAU); g.fill();
    g.save();
    g.beginPath(); g.arc(c, c, R0, 0, TAU); g.clip();
    g.fillStyle = pals[0]; g.fillRect(0, 0, S, S);
    if (v === 1) {
      for (let i = 0; i < 7; i++) {
        g.beginPath();
        const x = c + V.rand(-R0, R0), y = c + V.rand(-R0, R0);
        for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU, rr = V.rand(6, 18); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
        g.fillStyle = pals[1]; g.fill();
      }
    } else {
      let y = c - R0;
      while (y < c + R0) {
        const h = V.rand(4, 14);
        g.fillStyle = pals[(Math.random() * 4) | 0];
        g.globalAlpha = V.rand(0.5, 0.9);
        g.beginPath(); g.moveTo(0, y);
        for (let x = 0; x <= S; x += 10) g.lineTo(x, y + Math.sin(x * 0.08 + y) * 2);
        g.lineTo(S, y + h); g.lineTo(0, y + h); g.fill();
        y += h;
      }
      g.globalAlpha = 1;
    }
    g.restore();
    g.beginPath(); g.arc(c, c, R0, 0, TAU); shade(g, c, R0, 1);
    if (v === 5 || v === 0) {
      g.save(); g.translate(c, c); g.rotate(-0.35); g.scale(1, 0.28);
      g.beginPath(); g.arc(0, 0, R0 * 1.42, 0, Math.PI); g.lineWidth = 10; g.strokeStyle = 'rgba(240,220,170,0.7)'; g.stroke();
      g.restore();
    }
    return { img: cv, scale: S / R0 };
  }

  function starSprite(v) {
    const S = 192, c = 96, R0 = 36;
    const { c: cv, g } = mk(S);
    const h = [48, 25, 210, 0, 5, 180][v], sat = [100, 100, 80, 0, 90, 70][v];
    const gl = g.createRadialGradient(c, c, R0 * 0.5, c, c, c);
    gl.addColorStop(0, hsl(h, sat, 75, 0.9)); gl.addColorStop(0.35, hsl(h, sat, 60, 0.35)); gl.addColorStop(1, hsl(h, sat, 50, 0));
    g.fillStyle = gl; g.fillRect(0, 0, S, S);
    const core = g.createRadialGradient(c - 6, c - 6, 0, c, c, R0);
    core.addColorStop(0, '#ffffff'); core.addColorStop(0.6, hsl(h, sat, 82)); core.addColorStop(1, hsl(h, sat, 62));
    g.beginPath(); g.arc(c, c, R0, 0, TAU); g.fillStyle = core; g.fill();
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = hsl(h, sat, 85, 0.25); g.lineWidth = 2;
    for (let i = 0; i < 4; i++) { const a = (i / 4) * TAU + 0.4; g.beginPath(); g.moveTo(c + Math.cos(a) * R0 * 0.8, c + Math.sin(a) * R0 * 0.8); g.lineTo(c + Math.cos(a) * c * 0.95, c + Math.sin(a) * c * 0.95); g.stroke(); }
    return { img: cv, scale: S / R0 };
  }

  function nebulaSprite(v) {
    const S = 192, c = 96, R0 = 70;
    const { c: cv, g } = mk(S);
    const h1 = [300, 200, 30, 260, 170, 340][v], h2 = (h1 + 60) % 360;
    const gl = g.createRadialGradient(c, c, 0, c, c, c);
    gl.addColorStop(0, hsl(h1, 80, 85, 0.9)); gl.addColorStop(0.2, hsl(h1, 70, 60, 0.35)); gl.addColorStop(1, hsl(h2, 70, 40, 0));
    g.fillStyle = gl; g.fillRect(0, 0, S, S);
    g.globalCompositeOperation = 'lighter';
    for (let arm = 0; arm < 2; arm++) {
      for (let i = 0; i < 220; i++) {
        const t = Math.random();
        const a = arm * Math.PI + t * 4.2;
        const rr = 6 + t * R0 * 1.05;
        const x = c + Math.cos(a) * rr + V.rand(-6, 6) * (0.4 + t), y = c + Math.sin(a) * rr + V.rand(-6, 6) * (0.4 + t);
        g.fillStyle = hsl(Math.random() < 0.5 ? h1 : h2, 80, V.rand(60, 90), V.rand(0.25, 0.8));
        g.fillRect(x, y, V.rand(1, 2.4), V.rand(1, 2.4));
      }
    }
    return { img: cv, scale: S / R0 };
  }

  function antiSprite(col) {
    col = col || '#ff4fd8';
    const S = 128, c = 64, R0 = 40;
    const { c: cv, g } = mk(S);
    const gl = g.createRadialGradient(c, c, 0, c, c, c);
    gl.addColorStop(0, ca(col, 0.6)); gl.addColorStop(1, ca(col, 0));
    g.fillStyle = gl; g.fillRect(0, 0, S, S);
    g.beginPath();
    for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU, rr = i % 2 ? R0 * 0.45 : R0; g.lineTo(c + Math.cos(a) * rr, c + Math.sin(a) * rr); }
    g.closePath();
    g.fillStyle = '#1a0016'; g.fill();
    if (V.colorblind) { g.lineWidth = 7; g.strokeStyle = '#ffffff'; g.stroke(); } // forma, no solo color
    g.lineWidth = 3; g.strokeStyle = col; g.stroke();
    g.beginPath(); g.arc(c, c, R0 * 0.22, 0, TAU); g.fillStyle = col; g.fill();
    g.fillStyle = 'rgba(255,255,255,0.72)'; g.fill();
    return { img: cv, scale: S / R0 };
  }

  // Púlsar: estrella de neutrones blanco-cian. 1 unidad de s = 40 px (núcleo visible ≈ 0,6 s).
  function pulsarSprite(col) {
    col = col || '#7fe3ff';
    const S = 160, c = 80;
    const { c: cv, g } = mk(S);
    const gl = g.createRadialGradient(c, c, 0, c, c, c);
    gl.addColorStop(0, 'rgba(240,252,255,0.95)'); gl.addColorStop(0.3, ca(col, 0.45));
    gl.addColorStop(0.6, ca(col, 0.12)); gl.addColorStop(1, ca(col, 0));
    g.fillStyle = gl; g.fillRect(0, 0, S, S);
    const core = g.createRadialGradient(c - 4, c - 4, 0, c, c, 24);
    core.addColorStop(0, '#ffffff'); core.addColorStop(0.55, '#f2fcff'); core.addColorStop(1, col);
    g.beginPath(); g.arc(c, c, 24, 0, TAU); g.fillStyle = core; g.fill();
    g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,0.8)'; g.stroke();
    return { img: cv, scale: S / 40 };
  }
  // Haz del púlsar: franja luminosa horizontal que se dibuja girada.
  function beamSprite(col) {
    col = col || '#a0ebff';
    const W = 256, Hh = 32;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = Hh;
    const g = cv.getContext('2d');
    for (let x = 0; x < W; x++) {
      const k = 1 - Math.abs(x - W / 2) / (W / 2);
      const gr = g.createLinearGradient(0, 0, 0, Hh);
      gr.addColorStop(0, ca(col, 0)); gr.addColorStop(0.35, ca(col, k * k * 0.5)); gr.addColorStop(0.5, 'rgba(240,252,255,' + (k * k * 0.9) + ')');
      gr.addColorStop(0.65, ca(col, k * k * 0.5)); gr.addColorStop(1, ca(col, 0));
      g.fillStyle = gr; g.fillRect(x, 0, 1, Hh);
    }
    return cv;
  }
  // Núcleo galáctico: corazón blanco-dorado con cuatro brazos espirales violetas. 1 s = 230 px.
  function bossSprite() {
    const S = 512, c = 256, R0 = 230;
    const { c: cv, g } = mk(S);
    const haze = g.createRadialGradient(c, c, 0, c, c, c);
    haze.addColorStop(0, 'rgba(255,240,200,0.9)'); haze.addColorStop(0.18, 'rgba(255,200,120,0.5)');
    haze.addColorStop(0.45, 'rgba(150,80,230,0.22)'); haze.addColorStop(1, 'rgba(80,30,160,0)');
    g.fillStyle = haze; g.fillRect(0, 0, S, S);
    g.globalCompositeOperation = 'lighter';
    for (let arm = 0; arm < 4; arm++) {
      for (let i = 0; i < 520; i++) {
        const t = Math.pow(Math.random(), 0.8);
        const a = (arm * TAU) / 4 + t * 5.2;
        const rr = R0 * (0.12 + t * 0.95);
        const sp = (4 + t * 16) * (Math.random() - 0.5);
        const x = c + Math.cos(a) * rr + sp, y = c + Math.sin(a) * rr + sp;
        const hot = t < 0.4;
        g.fillStyle = hot ? hsl(V.rand(36, 50), 100, V.rand(72, 94), V.rand(0.5, 1)) : hsl(V.rand(268, 292), 85, V.rand(60, 82), V.rand(0.35, 0.85));
        const z = V.rand(1.2, 3.4) * (1.2 - t * 0.6);
        g.fillRect(x - z / 2, y - z / 2, z, z);
      }
    }
    // Anillo de acreción dorado: distingue al Núcleo de las nebulosas comunes.
    g.globalCompositeOperation = 'lighter';
    g.beginPath(); g.arc(c, c, R0 * 0.42, 0, TAU); g.lineWidth = 6; g.strokeStyle = 'rgba(255,215,130,0.55)'; g.stroke();
    g.beginPath(); g.arc(c, c, R0 * 0.42, 0, TAU); g.lineWidth = 18; g.strokeStyle = 'rgba(255,190,100,0.18)'; g.stroke();
    const core = g.createRadialGradient(c, c, 0, c, c, R0 * 0.32);
    core.addColorStop(0, 'rgba(255,255,255,1)'); core.addColorStop(0.35, 'rgba(255,240,190,0.95)');
    core.addColorStop(0.7, 'rgba(255,200,110,0.5)'); core.addColorStop(1, 'rgba(255,170,80,0)');
    g.fillStyle = core; g.beginPath(); g.arc(c, c, R0 * 0.32, 0, TAU); g.fill();
    return { img: cv, scale: S / R0 };
  }

  // Estrella que dispara el Núcleo: halo dorado y destello en cruz (64 px, radio útil 10 px).
  function shotSprite(col) {
    col = col || '#ffd27a';
    const S = 64, c = 32;
    const { c: cv, g } = mk(S);
    const gl = g.createRadialGradient(c, c, 0, c, c, c);
    gl.addColorStop(0, 'rgba(255,250,230,1)'); gl.addColorStop(0.18, ca(col, 0.9));
    gl.addColorStop(0.45, ca(col, 0.3)); gl.addColorStop(1, ca(col, 0));
    g.fillStyle = gl; g.fillRect(0, 0, S, S);
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = 'rgba(255,245,210,0.85)';
    g.beginPath(); g.moveTo(c, 2); g.lineTo(c + 3, c); g.lineTo(c, S - 2); g.lineTo(c - 3, c); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(2, c); g.lineTo(c, c + 3); g.lineTo(S - 2, c); g.lineTo(c, c - 3); g.closePath(); g.fill();
    return { img: cv, scale: S / 10 };
  }

  function glowSprite(col) {
    const S = 128, c = 64;
    const { c: cv, g } = mk(S);
    const gl = g.createRadialGradient(c, c, 0, c, c, c);
    gl.addColorStop(0, col.replace('A', '0.9')); gl.addColorStop(0.4, col.replace('A', '0.35')); gl.addColorStop(1, col.replace('A', '0'));
    g.fillStyle = gl; g.fillRect(0, 0, S, S);
    return cv;
  }

  function starTile(n, size, maxA) {
    const { c: cv, g } = mk(1024);
    for (let i = 0; i < n; i++) {
      const x = Math.random() * 1024, y = Math.random() * 1024;
      const h = [220, 40, 0, 200, 280][(Math.random() * 5) | 0];
      g.fillStyle = hsl(h, 60, 88, V.rand(0.3, maxA));
      const s = V.rand(0.6, size);
      g.fillRect(x, y, s, s);
    }
    return cv;
  }
  function nebulaTile() {
    const S = 1024;
    const { c: cv, g } = mk(S);
    for (let i = 0; i < 14; i++) {
      const x = Math.random() * S, y = Math.random() * S, rr = V.rand(150, 420);
      const h = [270, 230, 300, 200, 320][(Math.random() * 5) | 0];
      for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
        const gr = g.createRadialGradient(x + ox * S, y + oy * S, 0, x + ox * S, y + oy * S, rr);
        gr.addColorStop(0, hsl(h, 60, 30, 0.22)); gr.addColorStop(1, hsl(h, 60, 20, 0));
        g.fillStyle = gr; g.fillRect(0, 0, S, S);
      }
    }
    return cv;
  }

  // Anillo punteado de "no comestible" pre-renderizado. Antes cada cuerpo hacía un stroke con setLineDash:
  // Skia teselaba cada trazo en cada fotograma y, con ~30 cuerpos grandes en pantalla (escala 6 + jefe),
  // la GPU bajaba a ~30 FPS a 1080p. Ahora es un drawImage del tamaño más cercano (el trazo queda ~1,5 px).
  const RING_R = [12, 24, 48, 96, 192, 384];
  function dashRingSprite(col, R0) {
    const S = Math.ceil(R0 * 2 + 6), c = S / 2;
    const cv = document.createElement('canvas'); cv.width = cv.height = S;
    const g = cv.getContext('2d');
    const n = Math.max(6, Math.round((TAU * R0) / 8)), seg = (TAU * R0) / n;
    g.setLineDash([seg * 0.375, seg * 0.625]);
    g.beginPath(); g.arc(c, c, R0, 0, TAU);
    g.strokeStyle = ca(col, 0.55); g.lineWidth = 1.6; g.stroke();
    return { img: cv, R0, S };
  }
  function drawDashRing(ctx, x, y, rad) {
    const rs = R.dashRings;
    let k = 0;
    while (k < rs.length - 1 && rs[k].R0 * 1.4 < rad) k++;
    const sp = rs[k], s = (sp.S * rad) / sp.R0;
    ctx.drawImage(sp.img, x - s / 2, y - s / 2, s, s);
  }

  // Sprites que dependen de la paleta: se regeneran al activar/desactivar el modo daltónico.
  function buildPalSprites() {
    R.dashRings = RING_R.map((r) => dashRingSprite(pc('danger'), r));
    R.palCB = !!V.colorblind;
    R.anti = antiSprite(pc('enemy'));
    R.antiSw = pc('swarm') === pc('enemy') ? R.anti : antiSprite(pc('swarm'));
    R.gold = glowSprite('rgba(' + rgb(pc('gold')) + ',A)');
    R.pulsar = pulsarSprite(pc('pulsar'));
    R.beam = beamSprite(pc('pulsar'));
    R.shot = shotSprite(pc('boss'));
  }
  if (V.bus) V.bus.on('settings:change', () => { if (R.anti && R.palCB !== !!V.colorblind) buildPalSprites(); });

  R.init = function () {
    const types = { dust: dustSprite, rock: (v) => rockSprite(v, false, false), asteroid: (v) => rockSprite(v, true, true), moon: moonSprite, planet: planetSprite, star: starSprite, nebula: nebulaSprite };
    for (const t in types) { R.sprites[t] = []; for (let v = 0; v < 6; v++) R.sprites[t].push(types[t](v)); }
    R.boss = bossSprite();
    R.violet = glowSprite('rgba(190,120,255,A)');
    buildPalSprites();
    R.glowW = glowSprite('rgba(255,255,255,A)');
    R.stars = [starTile(260, 1.6, 0.5), starTile(140, 2.2, 0.8), starTile(50, 2.8, 1)];
    R.neb = nebulaTile();
    R.disk.length = 0;
    for (let i = 0; i < 90; i++) {
      const rad = V.rand(1.25, 2.4);
      // velocidad angular kepleriana (antes se avanzaba por fotograma: giraba más rápido a más FPS)
      R.disk.push({ a: Math.random() * TAU, rad, w: 4.2 / (rad * rad), sz: V.rand(0.03, 0.08), col: hsl(V.rand(15, 45) | 0, 100, V.rand(55, 85) | 0) });
    }
  };

  function tileDraw(ctx, img, ox, oy, W, H) {
    const S = 1024;
    let sx = -(((ox % S) + S) % S), sy = -(((oy % S) + S) % S);
    for (let x = sx; x < W; x += S) for (let y = sy; y < H; y += S) ctx.drawImage(img, x, y);
  }

  R.background = function (ctx, W, H, dxScreen, dyScreen, tint) {
    // Un salto enorme (cambio de partida, NaN) no debe desplazar el fondo a coordenadas imposibles.
    if (isFinite(dxScreen) && isFinite(dyScreen) && Math.abs(dxScreen) < 4000 && Math.abs(dyScreen) < 4000) {
      // 102400 = periodo común de las 4 capas (×0.03, ×0.08, ×0.18, ×0.35 dan múltiplos de 1024): sin saltos al envolver
      R.bgOff.x = (R.bgOff.x + dxScreen) % 102400; R.bgOff.y = (R.bgOff.y + dyScreen) % 102400;
    }
    const key = H + '|' + (tint || '');
    if (!R.bgGrad || R.bgGrad.key !== key || R.bgGrad.ctx !== ctx) {
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#07041a'); bg.addColorStop(1, tint || '#0d0722');
      R.bgGrad = { key, ctx, g: bg };
    }
    ctx.fillStyle = R.bgGrad.g; ctx.fillRect(0, 0, W, H);
    tileDraw(ctx, R.neb, R.bgOff.x * 0.03, R.bgOff.y * 0.03, W, H);
    tileDraw(ctx, R.stars[0], R.bgOff.x * 0.08, R.bgOff.y * 0.08, W, H);
    tileDraw(ctx, R.stars[1], R.bgOff.x * 0.18, R.bgOff.y * 0.18, W, H);
    tileDraw(ctx, R.stars[2], R.bgOff.x * 0.35, R.bgOff.y * 0.35, W, H);
  };

  R.dpr = 1;
  function rotDraw(ctx, img, x, y, rot, sz) {
    const d = R.dpr, c = Math.cos(rot) * d, s = Math.sin(rot) * d;
    ctx.setTransform(c, s, -s, c, x * d, y * d);
    ctx.drawImage(img, -sz / 2, -sz / 2, sz, sz);
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }

  // Imagen rectangular girada alrededor de su centro (haces del púlsar).
  function rotRect(ctx, img, x, y, rot, w, h) {
    const d = R.dpr, c = Math.cos(rot) * d, s = Math.sin(rot) * d;
    ctx.setTransform(c, s, -s, c, x * d, y * d);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }

  // Arco de un anillo de púlsar dejando sus dos huecos.
  function gappedRing(ctx, x, y, rad, gap, hw) {
    ctx.beginPath(); ctx.arc(x, y, rad, gap + hw, gap + Math.PI - hw);
    ctx.moveTo(x + Math.cos(gap + Math.PI + hw) * rad, y + Math.sin(gap + Math.PI + hw) * rad);
    ctx.arc(x, y, rad, gap + Math.PI + hw, gap + TAU - hw);
  }

  function drawPulsar(ctx, o, sx, sy, sr, time) {
    const P = V.PULSAR;
    const fade = Math.min(1, o.age / 0.8);
    const rf = RF(), col = pc('pulsar');
    const charge = (o.ringT < P.charge ? 1 - o.ringT / P.charge : 0) * (rf ? 0.45 : 1);
    ctx.globalCompositeOperation = 'lighter';
    // Haces giratorios
    // haces siempre bien visibles: es lo que lo distingue de una estrella normal
    ctx.globalAlpha = (0.7 + 0.3 * charge) * fade;
    const L = sr * 11, bw = sr * (0.55 + 0.3 * charge);
    rotRect(ctx, R.beam, sx, sy, o.rot, L, bw);
    ctx.globalAlpha = 0.25 * fade;
    rotRect(ctx, R.beam, sx, sy, o.rot, L * 0.6, bw * 2.4);
    // Carga: anillo que se contrae hacia el núcleo justo antes de cada emisión (aviso)
    if (charge > 0) {
      ctx.globalAlpha = charge * fade;
      ctx.beginPath(); ctx.arc(sx, sy, V.lerp(sr * 2.2, sr * 0.6, charge), 0, TAU);
      ctx.strokeStyle = ca(col, 0.9); ctx.lineWidth = 2 + 3 * charge; ctx.stroke();
    }
    ctx.globalAlpha = fade;
    const pul = 1 + 0.06 * Math.sin(time * 9 + o.x) + 0.3 * charge;
    const sz = sr * R.pulsar.scale * pul;
    ctx.drawImage(R.pulsar.img, sx - sz / 2, sy - sz / 2, sz, sz);
    if (o.hitT > 0) {
      ctx.globalAlpha = rf ? 0.15 : 0.5;
      ctx.drawImage(R.glowW, sx - sr * 1.2, sy - sr * 1.2, sr * 2.4, sr * 2.4);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    // Al aparecer: anillos que se cierran sobre él durante 3 s ("¡aquí!")
    if (o.age < 3) {
      const k = (o.age * 1.5) % 1;
      ctx.beginPath(); ctx.arc(sx, sy, V.lerp(sr * 4, sr * 1.2, k), 0, TAU);
      ctx.strokeStyle = ca(col, (1 - k) * (1 - o.age / 3) * 0.9); ctx.lineWidth = 3; ctx.stroke();
    }
    // Marca de "no comestible" + vida
    ctx.beginPath(); ctx.arc(sx, sy, sr * 0.78, 0, TAU);
    ctx.strokeStyle = ca(pc('danger'), 0.45 * fade); ctx.lineWidth = 1.5; ctx.setLineDash([3, 5]); ctx.stroke(); ctx.setLineDash([]);
    if (o.hp < o.maxHp) {
      ctx.beginPath(); ctx.arc(sx, sy, sr * 0.9, -Math.PI / 2, -Math.PI / 2 + TAU * (o.hp / o.maxHp));
      ctx.strokeStyle = ca(col, 0.9); ctx.lineWidth = 3; ctx.stroke();
    }
  }

  // Núcleo galáctico. Identidad propia frente a las galaxias comunes (QA H-11): corona de rayos y halo en
  // su color (V.pal().boss), anillo de horizonte grueso que late, corazón blanco pulsante y una sombra
  // oscura alrededor que lo separa del fondo.
  function drawBoss(ctx, b, sx, sy, z, time) {
    const B = V.BOSS;
    const intro = Math.min(1, b.age / 1.6);
    const sr = b.s * z * (0.6 + 0.4 * intro);
    const rf = RF(), col = pc('boss');
    const beatW = b.phase === 3 ? 7 : b.phase === 2 ? 4.5 : 3;
    const beat = rf ? 0.5 : 0.5 + 0.5 * Math.sin(time * beatW);
    // Aviso de "atracción inversa": anillo que se cierra sobre el Núcleo y marca el alcance.
    if (b.warn > 0) {
      const rr = (b.s + B.rep.R * (b.k || b.r0)) * z;
      ctx.beginPath(); ctx.arc(sx, sy, rr, 0, TAU);
      ctx.setLineDash([10, 10]); ctx.strokeStyle = ca(col, 0.35 * b.warn); ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(sx, sy, V.lerp(rr, sr * 0.6, b.warn), 0, TAU);
      ctx.strokeStyle = ca(col, 0.8 * b.warn); ctx.lineWidth = 3 + 5 * b.warn; ctx.stroke();
    }
    // sombra: separa al Núcleo de lo que tiene detrás
    if (!R.bossShade) R.bossShade = glowSprite('rgba(4,2,12,A)');
    ctx.globalAlpha = intro * 0.85;
    const sh = sr * 2.6;
    ctx.drawImage(R.bossShade, sx - sh, sy - sh, sh * 2, sh * 2);
    ctx.globalCompositeOperation = 'lighter';
    // corona de rayos en el color del jefe (gira despacio; más rápida en cada fase)
    const nr = 14, rot = time * (0.12 + 0.06 * b.phase) * (rf ? 0.5 : 1);
    ctx.globalAlpha = intro * (0.16 + 0.08 * beat + 0.04 * b.phase);
    ctx.fillStyle = col;
    ctx.beginPath();
    for (let i = 0; i < nr; i++) {
      const a = rot + (i / nr) * TAU, L = sr * (i % 2 ? 1.55 : 2.05) * (1 + 0.06 * beat), w = i % 2 ? 0.07 : 0.1;
      ctx.moveTo(sx + Math.cos(a - w) * sr * 0.55, sy + Math.sin(a - w) * sr * 0.55);
      ctx.lineTo(sx + Math.cos(a) * L, sy + Math.sin(a) * L);
      ctx.lineTo(sx + Math.cos(a + w) * sr * 0.55, sy + Math.sin(a + w) * sr * 0.55);
    }
    ctx.fill();
    ctx.globalAlpha = intro * 0.55;
    const hz = sr * 3.2;
    ctx.drawImage(R.violet, sx - hz, sy - hz, hz * 2, hz * 2);
    ctx.globalAlpha = intro;
    const sz = sr * R.boss.scale;
    rotDraw(ctx, R.boss.img, sx, sy, b.rot, sz);
    // Segunda capa girando al revés: da profundidad a los brazos sin coste extra.
    ctx.globalAlpha = intro * 0.35;
    rotDraw(ctx, R.boss.img, sx, sy, -b.rot * 0.6 + 1, sz * 0.82);
    ctx.globalAlpha = intro * (0.45 + 0.25 * beat + (b.phase - 1) * 0.1);
    const cz = sr * (1.05 + 0.12 * beat);
    ctx.drawImage(R.gold, sx - cz, sy - cz, cz * 2, cz * 2);
    // corazón blanco pulsante
    ctx.globalAlpha = intro * (0.75 + 0.25 * beat);
    const wz = sr * (0.42 + 0.1 * beat);
    ctx.drawImage(R.glowW, sx - wz, sy - wz, wz * 2, wz * 2);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath(); ctx.arc(sx, sy, Math.max(2, sr * (0.06 + 0.02 * beat)), 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill();
    // anillo de horizonte: grueso, en el color del jefe, con contorno oscuro (se lee sobre galaxias y estrellas)
    const hr = sr * 1.02;
    ctx.globalAlpha = intro;
    ctx.beginPath(); ctx.arc(sx, sy, hr, 0, TAU);
    ctx.lineWidth = Math.max(4, sr * 0.07) + 3; ctx.strokeStyle = 'rgba(8,5,20,0.6)'; ctx.stroke();
    ctx.lineWidth = Math.max(2.5, sr * 0.05) * (1 + 0.25 * beat); ctx.strokeStyle = ca(col, 0.75 + 0.25 * beat); ctx.stroke();
    // arcos que giran sobre el anillo (marca de "esto es el jefe")
    ctx.lineWidth = Math.max(1.5, sr * 0.025); ctx.strokeStyle = 'rgba(255,250,235,0.85)';
    for (let i = 0; i < 3; i++) {
      const a0 = -rot * 2.2 + (i * TAU) / 3;
      ctx.beginPath(); ctx.arc(sx, sy, hr * 1.1, a0, a0 + 0.9); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (b.hitT > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = rf ? 0.08 : 0.3;
      ctx.drawImage(R.glowW, sx - sr * 0.7, sy - sr * 0.7, sr * 1.4, sr * 1.4);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  // Flecha en el borde de la pantalla hacia algo importante que está fuera de vista.
  function edgeArrow(ctx, W, H, px, py, col, scale, ring) {
    const cx = W / 2, cy = H / 2, dx = px - cx, dy = py - cy;
    const mx = W / 2 - 34, my = H / 2 - 34;
    const k = Math.min(mx / (Math.abs(dx) || 1e-6), my / (Math.abs(dy) || 1e-6));
    if (k >= 1) return; // está en pantalla
    const ex = cx + dx * k, ey = Math.max(104, cy + dy * k); // no tapar el HUD superior
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(Math.atan2(dy, dx));
    if (scale) ctx.scale(scale, scale);
    if (ring) { // contorno oscuro + halo: se lee sobre cualquier fondo
      ctx.beginPath(); ctx.arc(-2, 0, 15, 0, TAU); ctx.fillStyle = 'rgba(8,5,20,0.55)'; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = ca(col, 0.7); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-8, -10); ctx.lineTo(-3, 0); ctx.lineTo(-8, 10); ctx.closePath();
    ctx.fillStyle = col; ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ---------- Números flotantes ----------
  // run.addText ya agrupa los valores cercanos en tiempo y espacio. Aquí:
  //  · tamaño según el valor relativo a "un bocado de tu tamaño" (lo grande destaca),
  //  · disposición sin solapes (los más valiosos se colocan primero; el resto se aparta hacia arriba),
  //  · "pop" al crecer, subida suave y contorno oscuro para leerse sobre cualquier fondo.
  const textItems = [];
  function drawTexts(ctx, run, W, H, z, ox, oy, hx, hy, hr, band) {
    const st = run.st, us = V.uiScale || 1;
    const ref = Math.max(1, V.value(run.r) * (st.matterMul || 1) * (1 + (st.echo || 0) * run.milestone));
    textItems.length = 0;
    for (const t of run.texts) {
      const rel = t.val / ref;
      const fs = V.clamp(13 + 6 * Math.log2(1 + rel * 1.5), 13, 34) * us;
      t.rise = (t.rise || 0) + ((Math.min(1, t.fresh / 0.8) * 34 * us) - (t.rise || 0)) * 0.25;
      let sx, sy;
      if (t.follow) { sx = hx; sy = hy - hr - 12 * us - fs * 0.5; } // sobre el agujero: el contador del combo
      else { sx = t.x * z + ox; sy = t.y * z + oy; }
      sy -= t.rise;
      if (sx < -200 || sy < -100 || sx > W + 200 || sy > H + 100) { t.ly = null; continue; }
      const w = fs * 0.62 * t.txt.length + 8, h = fs * 1.05;
      textItems.push({ t, sx, sy, w, h, fs, rel });
    }
    textItems.sort((a, b) => b.t.val - a.t.val);
    for (let i = 0; i < textItems.length; i++) {
      const it = textItems[i];
      let y = it.sy;
      for (let tries = 0; tries < 8; tries++) {
        let hit = null;
        for (let j = 0; j < i; j++) {
          const p = textItems[j];
          if (Math.abs(it.sx - p.sx) < (it.w + p.w) / 2 && Math.abs(y - p.y) < (it.h + p.h) / 2) { hit = p; break; }
        }
        if (!hit) break;
        y = hit.y - (hit.h + it.h) / 2 - 2;
      }
      it.y = y;
      const t = it.t;
      t.ly = t.ly == null ? y : t.ly + (y - t.ly) * 0.3; // sin saltos al reordenarse
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    for (let i = textItems.length - 1; i >= 0; i--) { // los pequeños primero, los grandes encima
      const it = textItems[i], t = it.t;
      let a = Math.min(1, t.life * 3.5);
      // con un banner en pantalla (jefe, fases, escala), los números de su franja casi desaparecen
      // la franja cubre la línea pequeña, el título y el subtítulo (más abajo); se cuenta el alto del propio número
      if (band && t.ly + it.h / 2 > band.y - 90 * band.us && t.ly - it.h / 2 < band.y + 140 * band.us) a *= 0.15;
      const fs = it.fs * (1 + 0.32 * t.pop * t.pop);
      const big = t.big || it.rel >= 6;
      if (big) {
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * (RF() ? 0.18 : 0.35);
        const gw = it.w * 1.3, gh = fs * 2.2;
        ctx.drawImage(R.glowW, it.sx - gw / 2, t.ly - gh / 2, gw, gh);
        ctx.globalCompositeOperation = 'source-over';
      }
      // tamaños en pasos de 2 px: la caché de glifos se reutiliza (el "pop" no rasteriza fuentes nuevas)
      ctx.font = F(big ? '900' : '800', Math.round(fs / 2) * 2);
      // sombra desplazada en lugar de strokeText (los contornos de texto no se cachean y son caros)
      const off = Math.max(1.5, fs * 0.08);
      ctx.globalAlpha = a * 0.85; ctx.fillStyle = 'rgba(8,5,20,1)';
      ctx.fillText(t.txt, it.sx + off * 0.6, t.ly + off);
      ctx.globalAlpha = a; ctx.fillStyle = t.col;
      ctx.fillText(t.txt, it.sx, t.ly);
    }
    ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'miter';
  }

  // opt.z / opt.cx / opt.cy: cámara de render (main.js). Por defecto, la de la simulación (run.zoom, centrada).
  R.drawRun = function (ctx, run, W, H, opt) {
    const z = opt.z || run.zoom;
    const camX = opt.cx != null ? opt.cx : run.x, camY = opt.cy != null ? opt.cy : run.y;
    const ox = W / 2 + (opt.sx || 0) - camX * z, oy = H / 2 + (opt.sy || 0) - camY * z;
    const time = opt.time;
    const eatMax = run.r * run.st.eatRatio;
    const pullR = run.r * run.st.pullRange;

    // anillos de pulso
    for (const rg of run.rings) {
      const k = rg.t / 0.6;
      ctx.beginPath(); ctx.arc(rg.x * z + ox, rg.y * z + oy, rg.R * z * (1 - k * 0.85), 0, TAU);
      ctx.strokeStyle = 'rgba(120,190,255,' + (1 - k) * 0.6 + ')'; ctx.lineWidth = 3 + 10 * (1 - k); ctx.stroke();
    }

    // ondas visuales (aparición, repulsión, cambio de fase, destrucción)
    if (run.waves) for (const w of run.waves) {
      const k = w.t / w.dur, e = 1 - (1 - k) * (1 - k);
      ctx.beginPath(); ctx.arc(w.x * z + ox, w.y * z + oy, V.lerp(w.R0, w.R1, e) * z, 0, TAU);
      ctx.strokeStyle = 'rgba(' + w.col + ',' + (1 - k) * (RF() ? 0.3 : 0.7) + ')'; ctx.lineWidth = 2 + 8 * (1 - k); ctx.stroke();
    }


    const hx = run.x * z + ox, hy = run.y * z + oy, hr = run.r * z;
    // campo gravitatorio
    ctx.beginPath(); ctx.arc(hx, hy, pullR * z, 0, TAU);
    ctx.setLineDash([4, 12]); ctx.strokeStyle = 'rgba(160,140,255,0.13)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);

    // Con el Núcleo vivo, las nebulosas comunes se apagan y se enfrían: no compiten con él (QA H-11)
    const bossLive = run.boss && !run.boss.dead ? run.boss : null;
    const nebDim = bossLive ? 1 - 0.68 * Math.min(1, bossLive.age / 1.5) : 1;
    // cuerpos
    const ringsDanger = R._rd || (R._rd = []), ringsHp = R._rh || (R._rh = []);
    ringsDanger.length = 0; ringsHp.length = 0;
    for (const o of run.objs) {
      const sx = o.x * z + ox, sy = o.y * z + oy, sr = o.s * z;
      if (sx + sr * 3 < 0 || sy + sr * 3 < 0 || sx - sr * 3 > W || sy - sr * 3 > H) continue;
      if (o.kind === 'boss') continue;
      if (o.kind === 'pulsar') continue; // se dibujan encima, junto a sus anillos
      if (o.kind === 'anti') {
        const a = Math.min(1, o.life);
        if (o.swarm && o.st === 1) {
          // Telegrafiado de la embestida: línea magenta que parpadea antes del ataque.
          const L = run.swarmOrbitR() * 2.6 * z;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + o.ax * L, sy + o.ay * L);
          ctx.setLineDash([8, 8]); ctx.strokeStyle = ca(pc('swarm'), RF() ? 0.6 : 0.35 + 0.35 * Math.sin(time * 30));
          ctx.lineWidth = Math.max(2, sr * 0.5); ctx.stroke(); ctx.setLineDash([]);
        } else if (o.swarm && o.st === 2) {
          const sp = Math.hypot(o.vx, o.vy) || 1, tl = sr * 6;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - (o.vx / sp) * tl, sy - (o.vy / sp) * tl);
          ctx.strokeStyle = ca(pc('swarm'), 0.45); ctx.lineWidth = sr * 1.2; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineCap = 'butt';
        }
        const pul = 1 + Math.sin(time * 10 + o.x) * 0.08;
        const spr = o.swarm ? R.antiSw : R.anti;
        // Los del enjambre son pequeños: se dibujan algo mayores para que se lean (sin cambiar su colisión).
        const sz = sr * spr.scale * pul * (o.swarm ? 1.4 : 1);
        ctx.globalAlpha = a;
        rotDraw(ctx, spr.img, sx, sy, o.rot, sz);
        ctx.globalAlpha = 1;
        continue;
      }
      if (o.kind === 'comet') {
        const sp = Math.hypot(o.vx, o.vy) || 1;
        const tl = Math.min(sr * 14, 260);
        const g = ctx.createLinearGradient(sx, sy, sx - (o.vx / sp) * tl, sy - (o.vy / sp) * tl);
        g.addColorStop(0, 'rgba(160,230,255,0.9)'); g.addColorStop(1, 'rgba(160,230,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = sr * 1.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - (o.vx / sp) * tl, sy - (o.vy / sp) * tl); ctx.stroke();
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(R.glowW, sx - sr * 2.5, sy - sr * 2.5, sr * 5, sr * 5);
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath(); ctx.arc(sx, sy, sr * 0.7, 0, TAU); ctx.fillStyle = '#eafaff'; ctx.fill();
        continue;
      }
      const sp = R.sprites[o.type][o.variant];
      const sz = sr * sp.scale;
      const dimNeb = nebDim < 1 && o.type === 'nebula';
      if (dimNeb) ctx.globalAlpha = nebDim;
      if (o.gold) {
        ctx.globalCompositeOperation = 'lighter';
        const gs = sr * (3.2 + Math.sin(time * 5 + o.x) * 0.3);
        ctx.drawImage(R.gold, sx - gs, sy - gs, gs * 2, gs * 2);
        ctx.globalCompositeOperation = 'source-over';
      }
      if (o.rot) {
        rotDraw(ctx, sp.img, sx, sy, o.rot, sz);
      } else ctx.drawImage(sp.img, sx - sz / 2, sy - sz / 2, sz, sz);
      if (dimNeb) ctx.globalAlpha = 1;
      if (o.gold) {
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35;
        ctx.drawImage(sp.img, sx - sz / 2, sy - sz / 2, sz, sz);
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      }
      if (o.hitT > 0) {
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = RF() ? 0.2 : 0.5;
        ctx.drawImage(R.glowW, sx - sr * 1.3, sy - sr * 1.3, sr * 2.6, sr * 2.6);
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      }
      if (o.s > eatMax && sr > 5 && !opt.decor) { // decor: demo del menú, sin indicadores de juego
        const d = Math.hypot(o.x - run.x, o.y - run.y);
        if (opt.allRings || d < pullR * 2.2) ringsDanger.push(sx, sy, sr * 1.12);
        if (o.hp < o.maxHp) ringsHp.push(sx, sy, sr * 1.22, o.hp / o.maxHp);
      }
    }
    // Marcas de "no comestible" (sprites) y arcos de vida (un solo trazo para todos)
    // (con el Núcleo vivo, las marcas de los demás cuerpos bajan de tono: el anillo dorado es solo suyo)
    if (bossLive) ctx.globalAlpha = 0.45;
    for (let i = 0; i < ringsDanger.length; i += 3) drawDashRing(ctx, ringsDanger[i], ringsDanger[i + 1], ringsDanger[i + 2]);
    ctx.globalAlpha = 1;
    if (ringsHp.length) {
      ctx.beginPath();
      for (let i = 0; i < ringsHp.length; i += 4) {
        const a0 = -Math.PI / 2, a1 = a0 + TAU * ringsHp[i + 3];
        ctx.moveTo(ringsHp[i] + Math.cos(a0) * ringsHp[i + 2], ringsHp[i + 1] + Math.sin(a0) * ringsHp[i + 2]);
        ctx.arc(ringsHp[i], ringsHp[i + 1], ringsHp[i + 2], a0, a1);
      }
      ctx.strokeStyle = bossLive ? 'rgba(255,200,150,0.3)' : 'rgba(255,200,150,0.85)'; ctx.lineWidth = bossLive ? 2 : 3; ctx.stroke();
    }

    if (bossLive) drawBoss(ctx, bossLive, bossLive.x * z + ox, bossLive.y * z + oy, z, time);

    // púlsares: zona de peligro, anillos con sus dos huecos y la estrella, por encima de los cuerpos
    if (run.prings && run.prings.length) {
      const hw = V.PULSAR.gapW / 2, pcol = pc('pulsar');
      ctx.lineCap = 'butt';
      for (const g of run.prings) {
        const k = g.R / g.max, a = (g.hit ? 0.45 : 1) * (1 - k * k * k * 0.8);
        const gx = g.x * z + ox, gy = g.y * z + oy, gr = g.R * z;
        const lw = Math.max(3, g.w * 2 * z);
        gappedRing(ctx, gx, gy, gr, g.gap, hw);
        ctx.strokeStyle = ca(pcol, a * 0.28); ctx.lineWidth = lw * 2.6; ctx.stroke();
        ctx.strokeStyle = ca(pcol, a * 0.95); ctx.lineWidth = lw; ctx.stroke();
        ctx.strokeStyle = 'rgba(245,253,255,' + a * 0.8 + ')'; ctx.lineWidth = Math.max(1.5, lw * 0.35); ctx.stroke();
      }
    }
    for (const o of run.objs) {
      if (o.kind !== 'pulsar' || o.dead) continue;
      const P = V.PULSAR, charge = o.ringT < P.charge ? 1 - o.ringT / P.charge : 0;
      const sx = o.x * z + ox, sy = o.y * z + oy, sr = o.s * z;
      ctx.beginPath(); ctx.arc(sx, sy, o.s * P.range * z, 0, TAU);
      ctx.setLineDash([6, 10]); ctx.strokeStyle = ca(pc('pulsar'), (0.3 + 0.4 * charge) * Math.min(1, o.age));
      ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
      if (sx + sr * 6 < 0 || sy + sr * 6 < 0 || sx - sr * 6 > W || sy - sr * 6 > H) continue;
      drawPulsar(ctx, o, sx, sy, sr, time);
    }

    // partículas
    ctx.globalCompositeOperation = 'lighter';
    let lastCol = null;
    for (const p of run.parts) {
      const s = Math.max(1.2, p.size * z), px = p.x * z + ox, py = p.y * z + oy;
      if (px < -s || py < -s || px > W + s || py > H + s) continue;
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      if (p.col !== lastCol) { ctx.fillStyle = p.col; lastCol = p.col; } // las partículas de una ráfaga comparten color
      ctx.fillRect(px - s / 2, py - s / 2, s, s);
    }
    // estrellas del Núcleo: halo dorado + centro blanco
    if (run.shots) for (const s of run.shots) {
      const px = s.x * z + ox, py = s.y * z + oy, pr = Math.max(2.5, s.s * z);
      if (px < -pr * 3 || py < -pr * 3 || px > W + pr * 3 || py > H + pr * 3) continue;
      ctx.globalAlpha = Math.min(1, s.life * 2);
      const ss = pr * R.shot.scale * 0.5;
      ctx.drawImage(R.shot.img, px - ss, py - ss, ss * 2, ss * 2);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // "pop" al cruzar una escala: el agujero late y suelta un anillo (va con el alejamiento de la cámara)
    const pop = opt.pop != null && opt.pop < 1 ? opt.pop : -1;
    R.drawHole(ctx, hx, hy, pop >= 0 ? hr * (1 + 0.22 * Math.sin(Math.min(1, pop / 0.45) * Math.PI) * (1 - pop)) : hr, run, time);
    if (pop >= 0) {
      const e = 1 - (1 - pop) * (1 - pop);
      ctx.beginPath(); ctx.arc(hx, hy, hr * (1.2 + 5 * e), 0, TAU);
      ctx.strokeStyle = ca(V.MILESTONES[run.milestone].color, (1 - pop) * (RF() ? 0.35 : 0.8)); ctx.lineWidth = 2 + 7 * (1 - pop); ctx.stroke();
    }

    // lunas orbitales
    if (run.st.orbitals) {
      for (const p of run.orbPositions()) {
        const px = p.x * z + ox, py = p.y * z + oy, pr = p.s * z;
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(R.gold, px - pr * 2.5, py - pr * 2.5, pr * 5, pr * 5);
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath(); ctx.arc(px, py, pr, 0, TAU); ctx.fillStyle = '#ffe9c9'; ctx.fill();
      }
    }

    // números flotantes (agrupados en run.addText; aquí: tamaño por valor, sin solapes y con "pop")
    if (run.texts.length && !opt.decor) drawTexts(ctx, run, W, H, z, ox, oy, hx, hy, hr, opt.banner);

    // indicadores de borde: Núcleo (dorado) y púlsares (cian) fuera de pantalla
    if (bossLive) edgeArrow(ctx, W, H, bossLive.x * z + ox, bossLive.y * z + oy, pc('boss'), 1.55 + (RF() ? 0 : 0.18 * Math.sin(time * 6)), true);
    for (const o of run.objs) if (o.kind === 'pulsar' && !o.dead) edgeArrow(ctx, W, H, o.x * z + ox, o.y * z + oy, pc('pulsar'));
    if (!run.demo) {
      const near = R._near || (R._near = []); near.length = 0;
      const lim = run.viewRad() * 1.3;
      for (const o of run.objs) {
        if (o.kind !== 'anti' || o.dead || o.fade || (o.swarm && o.st === 0)) continue;
        const px = o.x * z + ox, py = o.y * z + oy;
        if (px >= 0 && py >= 0 && px <= W && py <= H) continue;
        const d = Math.hypot(o.x - run.x, o.y - run.y);
        if (d < lim) near.push(d, px, py);
      }
      for (let n = 0; n < 5 && near.length; n++) {
        let bi = 0;
        for (let i = 3; i < near.length; i += 3) if (near[i] < near[bi]) bi = i;
        edgeArrow(ctx, W, H, near[bi + 1], near[bi + 2], pc('enemy'), 0.75);
        near.splice(bi, 3);
      }
    }
  };

  R.drawHole = function (ctx, x, y, r, run, time) {
    const low = run.stab / run.stabMax < 0.25;
    const flick = low ? (RF() ? 0.85 : 0.6 + Math.random() * 0.4) : 1;
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 3.4);
    g.addColorStop(0, 'rgba(255,160,80,' + 0.32 * flick + ')');
    g.addColorStop(0.3, 'rgba(170,90,255,0.10)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3.4, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    const tilt = -0.35, ct = Math.cos(tilt), stt = Math.sin(tilt);
    const drawDisk = (front) => {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.55 * flick;
      for (const p of R.disk) {
        const ang = p.a + time * p.w;
        const s = Math.sin(ang);
        if (front ? s < 0 : s >= 0) continue;
        const ex = Math.cos(ang) * p.rad * r, ey = s * p.rad * r * 0.3;
        const px = x + ex * ct - ey * stt, py = y + ex * stt + ey * ct;
        const sz = Math.max(1.5, p.sz * r * 1.6);
        ctx.fillStyle = p.col;
        ctx.fillRect(px - sz / 2, py - sz / 2, sz * 1.8, sz);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };
    drawDisk(false);
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = '#000'; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r * 1.02, 0, TAU);
    ctx.lineWidth = Math.max(1.5, r * 0.09); ctx.strokeStyle = 'rgba(255,225,190,' + 0.95 * flick + ')'; ctx.stroke();
    ctx.lineWidth = Math.max(3, r * 0.22); ctx.strokeStyle = 'rgba(255,150,70,' + 0.22 * flick + ')'; ctx.stroke();
    drawDisk(true);
    // (las chispas de estabilidad baja se generan en run.update, no aquí: dibujar no debe cambiar la simulación)
  };

  // HUD
  R.drawHUD = function (ctx, run, W, H, t, opt) {
    const T = V.t;
    const pad = 18;
    ctx.textBaseline = 'alphabetic';
    // Estabilidad
    const bw = Math.min(460, W * 0.5), bx = (W - bw) / 2, by = 22;
    const sideW = Math.max(60, bx - pad - 14); // ancho libre a cada lado de la barra central
    const f = V.clamp(run.stab / run.stabMax, 0, 1);
    ctx.fillStyle = 'rgba(10,6,24,0.7)'; roundRect(ctx, bx - 3, by - 3, bw + 6, 16, 8); ctx.fill();
    const col = f > 0.5 ? pc('stabHigh') : f > 0.25 ? pc('stabMid') : pc('stabLow');
    ctx.fillStyle = col; roundRect(ctx, bx, by, Math.max(0, bw * f), 10, 5); ctx.fill();
    ctx.textAlign = 'center';
    const st0 = T('stability') + ' · ' + V.fmtTime(run.t), sw0 = textW(ctx, st0, bw, '700', 11, 9);
    plate(ctx, W / 2 - sw0 / 2 - 8, by + 18, sw0 + 16, 17);
    ctx.fillStyle = 'rgba(236,232,255,0.8)';
    fitText(ctx, st0, W / 2, by + 30, bw, '700', 11, 9);

    // Jefe: barra de vida bajo la estabilidad, con marcas de fase (66 % y 33 %)
    const boss = run.boss;
    if (boss) {
      const bf = V.clamp(boss.hp / boss.maxHp, 0, 1);
      const yb = by + 54;
      ctx.globalAlpha = Math.min(1, boss.age / 1.2);
      ctx.textAlign = 'center';
      ctx.fillStyle = pc('boss');
      fitText(ctx, T('bossName').toUpperCase() + (boss.phase > 1 ? '  ·  ' + T('bossP' + boss.phase) : ''), W / 2, yb - 7, bw, '900', 13, 9);
      ctx.fillStyle = 'rgba(10,6,24,0.75)'; roundRect(ctx, bx - 3, yb - 3, bw + 6, 14, 7); ctx.fill();
      if (!R.bossGrad || R.bossGrad.k !== bx + '|' + bw || R.bossGrad.ctx !== ctx) {
        const gr = ctx.createLinearGradient(bx, 0, bx + bw, 0);
        gr.addColorStop(0, '#fff3c4'); gr.addColorStop(0.5, '#ffc861'); gr.addColorStop(1, '#b77bff');
        R.bossGrad = { k: bx + '|' + bw, ctx, g: gr };
      }
      ctx.fillStyle = R.bossGrad.g; roundRect(ctx, bx, yb, Math.max(0, bw * bf), 8, 4); ctx.fill();
      if (boss.hitT > 0) { ctx.fillStyle = 'rgba(255,255,255,0.45)'; roundRect(ctx, bx, yb, Math.max(0, bw * bf), 8, 4); ctx.fill(); }
      ctx.fillStyle = 'rgba(10,6,24,0.9)';
      ctx.fillRect(bx + bw * 0.33 - 1, yb - 2, 2, 12); ctx.fillRect(bx + bw * 0.66 - 1, yb - 2, 2, 12);
      ctx.globalAlpha = 1;
    }

    // Materia (con placa: sin ella el texto desaparecía sobre cuerpos brillantes)
    ctx.textAlign = 'left';
    const l1 = T('matter').toUpperCase(), l2 = '◆ ' + V.fmt(run.matter);
    const l3 = run.combo > 1 ? T('combo') + ' x' + run.combo + '  (+' + run.combo * 5 + '%)' : null;
    const lw = Math.max(textW(ctx, l1, sideW, '600', 12, 9), textW(ctx, l2, sideW, '900', 28, 16), l3 ? textW(ctx, l3, sideW, '900', 16, 10) : 0);
    plate(ctx, pad - 10, 10, lw + 20, l3 ? 82 : 60);
    ctx.fillStyle = 'rgba(200,190,240,0.8)';
    fitText(ctx, l1, pad, 28, sideW, '600', 12, 9);
    ctx.fillStyle = '#ff9a3c';
    fitText(ctx, l2, pad, 58, sideW, '900', 28, 16);
    if (l3) {
      ctx.fillStyle = pc('gold');
      fitText(ctx, l3, pad, 82, sideW, '900', 16, 10);
    }

    // Escala
    ctx.textAlign = 'right';
    const m = run.milestone, ms = V.MILESTONES;
    const r1 = T('mass').toUpperCase() + ' ' + V.fmt(run.mass), r2 = T('m' + m);
    const r3 = m < V.FINAL_MILESTONE ? T('next') + ': ' + T('m' + (m + 1)) : null;
    const rw = Math.max(textW(ctx, r1, sideW, '600', 12, 9), textW(ctx, r2, sideW, '900', 18, 11), r3 ? Math.max(textW(ctx, r3, sideW, '600', 11, 8), Math.min(170, sideW)) : 0);
    plate(ctx, W - pad - rw - 10, 10, rw + 20, r3 ? 82 : 52);
    ctx.fillStyle = 'rgba(200,190,240,0.8)';
    fitText(ctx, r1, W - pad, 28, sideW, '600', 12, 9);
    ctx.fillStyle = ms[m].color;
    fitText(ctx, r2, W - pad, 52, sideW, '900', 18, 11);
    if (m < V.FINAL_MILESTONE) {
      const a = ms[m].r, b = ms[m + 1].r;
      const k = V.clamp((run.r - a) / (b - a), 0, 1);
      const w = Math.min(170, sideW);
      ctx.fillStyle = 'rgba(10,6,24,0.7)'; roundRect(ctx, W - pad - w, 60, w, 6, 3); ctx.fill();
      ctx.fillStyle = ms[m + 1].color; roundRect(ctx, W - pad - w, 60, w * k, 6, 3); ctx.fill();
      ctx.fillStyle = 'rgba(200,190,240,0.8)';
      fitText(ctx, r3, W - pad, 82, sideW, '600', 11, 8);
    }

    // Pulso
    if (run.st.pulse) {
      const cx = W / 2, cy = H - 46, rr = 20;
      const k = run.pulseT > 0 ? 1 - run.pulseT / run.st.pulseCd : 1;
      ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU); ctx.fillStyle = 'rgba(10,6,24,0.7)'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, rr, -Math.PI / 2, -Math.PI / 2 + TAU * k);
      ctx.strokeStyle = k >= 1 ? pc('pulse') : ca(pc('pulse'), 0.5); ctx.lineWidth = 4; ctx.stroke();
      ctx.textAlign = 'center';
      const pl = opt.touch ? T('pulseTouch') : T('pulseKey'), pw = textW(ctx, pl, Math.min(W - 40, 320), '800', 11, 8);
      plate(ctx, cx - pw / 2 - 8, cy + rr + 4, pw + 16, 17);
      ctx.fillStyle = k >= 1 ? '#cfe8ff' : 'rgba(207,232,255,0.6)';
      fitText(ctx, pl, cx, cy + rr + 16, Math.min(W - 40, 320), '800', 11, 8);
    }

    // Golpe recibido
    if (opt.hurt > 0) {
      const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.7);
      g.addColorStop(0, ca(pc('hurt'), 0)); g.addColorStop(1, ca(pc('hurt'), opt.hurt * 0.5));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    // Estabilidad baja
    if (f < 0.25 && !run.over) {
      const a = (0.25 - f) * 1.6 * (RF() ? 0.7 : 0.6 + 0.4 * Math.sin(t * 8));
      const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
      g.addColorStop(0, ca(pc('lowStab'), 0)); g.addColorStop(1, ca(pc('lowStab'), a));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
  };

  function plate(ctx, x, y, w, h) { ctx.fillStyle = 'rgba(8,5,20,0.5)'; roundRect(ctx, x, y, w, h, 8); ctx.fill(); }
  function textW(ctx, text, maxW, weight, px, minPx) { fitFont(ctx, text, maxW, weight, px, minPx); return ctx.measureText(text).width; }

  R.banner = function (ctx, W, H, b) {
    if (!b) return;
    const k = b.t / b.dur;
    const a = k < 0.12 ? k / 0.12 : k > 0.75 ? (1 - k) / 0.25 : 1;
    ctx.globalAlpha = V.clamp(a, 0, 1);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const y = H * 0.28, maxW = Math.min(900, W - 40);
    // placa oscura detrás de todo el banner
    {
      const bfs = Math.min(44, W * 0.06);
      fitFont(ctx, b.text, maxW, '900', bfs, 18);
      const tw = Math.min(maxW, Math.max(ctx.measureText(b.text).width, b.sub ? Math.min(640, W - 40) * 0.8 : 0));
      const top = y - Math.max(34, bfs) - (b.small ? 22 : 8), bot = y + (b.sub ? 34 + 22 * Math.max(1, Math.ceil(b.sub.length / 70)) : 14);
      ctx.fillStyle = 'rgba(8,5,20,0.42)';
      roundRect(ctx, W / 2 - tw / 2 - 28, top, tw + 56, bot - top, 16); ctx.fill();
    }
    // Texto grande primero para medir su altura real: en CJK los glifos llenan toda la caja y la línea
    // pequeña (a y−34 fijo) se solapaba con ellos.
    ctx.fillStyle = b.color || '#fff';
    if (!RF()) { ctx.shadowColor = b.color || '#fff'; ctx.shadowBlur = 24; }
    fitText(ctx, b.text, W / 2, y, maxW, '900', Math.min(44, W * 0.06), 18);
    ctx.shadowBlur = 0;
    if (b.small) {
      const m = ctx.measureText(b.text);
      const asc = m.actualBoundingBoxAscent || R.fontPx(ctx) * 0.75;
      ctx.fillStyle = 'rgba(200,190,240,0.9)';
      fitText(ctx, b.small, W / 2, y - Math.max(34, asc + 12), maxW, '700', 13, 9);
    }
    if (b.sub) {
      ctx.font = F('italic 600', Math.min(17, W * 0.032)); ctx.fillStyle = 'rgba(220,214,250,0.92)';
      wrapText(ctx, b.sub, W / 2, y + 34, Math.min(640, W - 40), 22);
    }
    ctx.globalAlpha = 1;
  };

  // Ajuste de línea para el canvas. Corta por espacios y, en chino/japonés (o palabras más largas que
  // la línea), por carácter. No deja la puntuación de cierre CJK al principio de una línea.
  const CJK_CLASS = '\\u2E80-\\u9FFF\\uAC00-\\uD7AF\\uF900-\\uFAFF\\uFF00-\\uFFEF';
  const NO_START = /^[、。，．,.!?！？：；:;）)」』】〕〉》…ー々ぁぃぅぇぉっゃゅょァィゥェォッャュョ]/;
  function breakChars(ctx, word, maxW, out) {
    let line = '';
    for (const c of word) {
      if (line && ctx.measureText(line + c).width > maxW && !NO_START.test(c)) { out.push(line); line = c; } else line += c;
    }
    return line;
  }
  function wrapLines(ctx, text, maxW) {
    const out = [];
    for (const para of String(text).split('\n')) {
      // fichas: palabras latinas enteras o caracteres CJK sueltos; sp = había espacio antes
      const re = new RegExp('(\\s+)|([' + CJK_CLASS + '])|([^\\s' + CJK_CLASS + ']+)', 'g');
      const toks = [];
      let mm, sp = false;
      while ((mm = re.exec(para))) { if (mm[1]) { sp = true; continue; } toks.push({ s: mm[2] || mm[3], sp }); sp = false; }
      let line = '';
      for (const tk of toks) {
        if (line) {
          const test = line + (tk.sp ? ' ' : '') + tk.s;
          if (ctx.measureText(test).width <= maxW || NO_START.test(tk.s)) { line = test; continue; }
          out.push(line);
        }
        line = tk.s;
        // palabra más larga que la línea entera: cortar por carácter
        if (ctx.measureText(line).width > maxW) line = breakChars(ctx, line, maxW, out);
      }
      if (line) out.push(line);
    }
    return out;
  }
  function wrapText(ctx, text, x, y, maxW, lh) {
    const lines = wrapLines(ctx, text, maxW);
    for (const l of lines) { ctx.fillText(l, x, y); y += lh; }
    return lines.length;
  }
  R.wrapText = wrapText;
  R.wrapLines = wrapLines;
  R.fitText = fitText;
  // tamaño en px de la fuente actual del contexto ('800 13px ...' → 13; parseFloat devolvía el peso)
  R.fontPx = (ctx) => { const m = /(\d+(?:\.\d+)?)px/.exec(ctx.font); return m ? +m[1] : 12; };
  R.fitFont = fitFont;

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, h / 2, Math.max(0, w) / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  R.roundRect = roundRect;

  V.Render = R;
})();
