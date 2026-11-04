// VOIDLING — modo tráiler. Secuencia guionada de ~56 s para grabar con OBS.
// Usa la simulación real del juego (V.Run + run.bot()) con estadísticas aumentadas y un crecimiento guionado,
// y el render del juego (sprites, fondo, drawHole). Sin HUD. Todo determinista: misma semilla = misma toma.
//
// GUION (tiempos en segundos desde el primer fotograma; ver docs/STEAM_PAGE.md §8):
//  P1  0.0– 6.0  MOTA       agujero diminuto (r 8→15) devorando polvo, primer plano.  Tarjeta "Devora." 0.9–3.2
//  P2  6.0–12.0  ROCAS      crece a asteroides (r 15→58).                              Tarjeta "Crece."  6.6–8.9
//  P3 12.0–18.0  LUNAS      r 58→160. Llegan Custodios (12.0), pulso gravitatorio los borra (~15–17).
//                           Transmisión LUMEN "Esa luna tenía nombre. Ya no." 13.8–17.6
//  P4 18.0–25.0  PLANETAS   r 160→430. Gigante gaseoso (18.4) triturado por marea y devorado. Cometas.
//                           Tarjeta "Descubre por qué existes." 24.0–27.6 (juego atenuado)
//  P5 25.0–30.9  ESTRELLAS  r 430→1100, lunas orbitales. LUMEN "Hay luz dentro de ti ahora." 27.6–30.6
//  P6 30.9–36.0  NEGRO      corte seco. "LUMEN · REGISTRO DE ESCLUSAS" + "Fue lo primero que devoraste." (máquina de escribir)
//  P7 36.0–43.6  GALAXIA    corte seco al clímax: r 1180→5200, nebulosas en espiral, temblor creciente, destello (42.6)
//  P8 43.6–56.0  CIERRE     blanco → logo VOIDLING (44.8), frase (46.2), "Añádelo a tu lista de deseados" (48.0). Fin 56.0
(function () {
  const V = window.V, A = window.StoreArt, TAU = Math.PI * 2;
  const Q = new URLSearchParams(location.search);
  let LANG = Q.get('lang') === 'en' ? 'en' : 'es';
  const SEED = +Q.get('seed') || 11;
  const FIX = { 720: [1280, 720], 1080: [1920, 1080], 1440: [2560, 1440], 2160: [3840, 2160] }[Q.get('res')];
  const DT = 1 / 60, END = 56, PREROLL = 1.0;

  const TXT = {
    devour: { es: 'Devora.', en: 'Devour.' },
    grow: { es: 'Crece.', en: 'Grow.' },
    why: { es: 'Descubre por qué existes.', en: 'Discover why you exist.' },
    firstHead: { es: 'LUMEN · REGISTRO DE ESCLUSAS', en: 'LUMEN · AIRLOCK RECORDS' },
    first: { es: 'Fue lo primero que devoraste.', en: 'She was the first thing you ever ate.' },
    moon: { es: 'Esa luna tenía nombre. Ya no.', en: 'That moon had a name. Not anymore.' },
    light: { es: 'Hay luz dentro de ti ahora.', en: 'There is light inside you now.' },
    wish: { es: 'Añádelo a tu lista de deseados', en: 'Add it to your wishlist' },
    steam: { es: 'PRÓXIMAMENTE EN STEAM', en: 'COMING SOON ON STEAM' },
  };
  const tx = (k) => TXT[k][LANG];

  // Crecimiento guionado: [tiempo, radio]. Interpolación logarítmica (crecimiento exponencial por tramo).
  const GROW = [[0, 8], [1.2, 8.4], [6, 15], [12, 58], [18, 160], [25, 430], [31, 1100], [36, 1180], [43.6, 5200], [99, 5200]];
  // Multiplicador de zoom respecto a la cámara del juego (>1 = más cerca)
  const ZOOM = [[0, 2.6], [6, 2.25], [12, 2.0], [18, 1.75], [25, 1.65], [31, 1.55], [36, 1.6], [43.6, 1.15], [99, 1.15]];
  function curve(K, t, log) {
    for (let i = 0; i < K.length - 1; i++) {
      const [t0, a] = K[i], [t1, b] = K[i + 1];
      if (t <= t1) {
        const u = V.clamp((t - t0) / (t1 - t0), 0, 1);
        return log ? a * Math.pow(b / a, u) : a + (b - a) * u;
      }
    }
    return K[K.length - 1][1];
  }

  // ---------- Lienzo ----------
  const cvs = document.getElementById('c');
  const ctx = cvs.getContext('2d');
  let W = 0, H = 0;
  function resize() {
    if (FIX) { W = FIX[0]; H = FIX[1]; }
    else { const d = Math.min(2, window.devicePixelRatio || 1); W = Math.round(innerWidth * d); H = Math.round(innerHeight * d); }
    cvs.width = W; cvs.height = H;
    const s = Math.min(innerWidth / W, innerHeight / H);
    cvs.style.width = W * s + 'px'; cvs.style.height = H * s + 'px';
    if (run) { run.vw = W; run.vh = H; }
  }

  // ---------- Simulación ----------
  let run = null, T = 0, cam = { x: 0, y: 0 }, prevCam = { x: 0, y: 0 }, zCur = 1, flags = {}, hero = null, heroImg = null, lastPulse = -9;
  const GAS = A.GAS_PAL;

  function stats() {
    const st = V.computeStats({ core: 1 });
    Object.assign(st, {
      massGain: 0, // el crecimiento lo marca el guion; comer sigue ocurriendo (partículas, roturas)
      eatRatio: 0.9, density: 1.5, pullRange: 3.8, pullStr: 1.8, speed: 1.35,
      goldChance: 0.035, tidal: 1, pulse: 0, pulseCd: 1.2, pulseRad: 1.3, orbitals: 0, comets: 0, cometRate: 1,
    });
    return st;
  }

  function reset() {
    A.init();
    Math.random = A.prng(SEED); // toda la aleatoriedad del juego queda determinada por la semilla
    run = new V.Run(stats(), { vw: W, vh: H, demo: true });
    run.victory = true; // nunca termina por "victoria" aunque cambie la semántica de demo
    T = 0; flags = {}; hero = null; lastPulse = -9;
    cam = { x: run.x, y: run.y }; prevCam = { x: run.x, y: run.y };
    zCur = V.zoomFor(run.r, Math.min(W, H)) * curve(ZOOM, 0);
    run.zoom = zCur;
    run.objs = run.objs.filter((o) => o.s < run.r * 1.6); // el primer plano: polvo y rocas, no muros
    for (const o of run.objs) { o._b = -9; o._seen = true; }
    if (!heroImg) heroImg = A.withSeed(5, () => A.renderGasGiant(200, A.prng(5), { lightAng: Math.PI * 0.8 }));
  }

  function custodians(n) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + V.rand(-0.3, 0.3), d = run.r * V.rand(10, 12);
      const o = run.makeObj(run.x + Math.cos(a) * d, run.y + Math.sin(a) * d, run.r * V.rand(0.3, 0.42), { kind: 'anti', type: 'anti', life: 15, vr: 3 });
      o._b = T;
    }
  }
  const once = (k, t) => { if (!flags[k] && T >= t) { flags[k] = true; return true; } return false; };

  function step() {
    T += DT;
    const st = run.st;
    // --- eventos del guion ---
    // Custodios: dos oleadas que aparecen ya en pantalla y se cierran sobre el agujero
    if (once('anti1', 12.4)) custodians(7);
    if (once('anti2', 15.2)) custodians(6);
    if (once('pulseOn', 12.0)) st.pulse = 1;
    if (once('giant', 18.2)) {
      // Gigante gaseoso: se crea como "planeta" (el tipo depende del tamaño al nacer) y luego se agranda.
      const a = Math.atan2(run.vy, run.vx) || -0.6, d = run.r * 5;
      hero = run.makeObj(run.x + Math.cos(a) * d, run.y + Math.sin(a) * d, 240, { variant: 0, rot: 0, vr: 0, gold: false });
      hero.s = run.r * 2.3; hero.hp = hero.maxHp = hero.s * hero.s;
      hero.hero = true; hero._b = T; st.tidal = 0.8;
    }
    if (once('comets', 19.5)) { st.comets = 1; st.cometRate = 2.2; run.cometT = 0.4; }
    if (once('orbit', 25.0)) { st.orbitals = 3; st.orbSpeed = 1.6; }
    if (once('climax', 36.0)) { st.pullRange = 5.2; st.pullStr = 3; st.density = 2.2; st.cometRate = 4; st.goldChance = 0.06; }

    // --- control: bot del juego, salvo cuando el guion fija el objetivo ---
    if (hero && !hero.dead && run.objs.indexOf(hero) >= 0) { run.tx = hero.x; run.ty = hero.y; }
    else { hero = null; run.bot(); }
    // el pulso solo cuando un Custodio está cerca (en lugar del pulso automático del bot)
    run.pulseT = 1;
    if (st.pulse && T - lastPulse > 1.2) {
      for (const o of run.objs) {
        if (o.kind === 'anti' && !o.dead && Math.hypot(o.x - run.x, o.y - run.y) < run.r * 3.8) { run.pulseT = 0; run.pulse(); lastPulse = T; break; }
      }
    }

    run.update(DT);
    run.stab = run.stabMax; run.over = false; run.events.length = 0;
    // Mientras el gigante gaseoso es el protagonista, no entran estrellas enormes que le roben el plano
    for (const o of run.objs) {
      if (o._seen) continue;
      o._seen = true;
      if (T > 16.8 && T < 21.5 && o.kind === 'obj' && !o.hero && o.s > run.r * 1.4) o.dead = true;
    }

    // --- crecimiento guionado ---
    const rt = curve(GROW, T, true);
    if (run.r < rt) { run.mass = rt * rt; run.updateR(); run.events.length = 0; run.over = false; }

    // --- corriente de marea del gigante gaseoso (partículas del propio juego que caen en espiral) ---
    if (hero && !hero.dead) {
      const dx = run.x - hero.x, dy = run.y - hero.y, d = Math.hypot(dx, dy) || 1;
      if (d < run.r * 1.2 + hero.s * 1.3 && run.parts.length < 680) {
        for (let i = 0; i < 6; i++) {
          const a = Math.atan2(dy, dx) + V.rand(-0.7, 0.7);
          run.parts.push({ x: hero.x + Math.cos(a) * hero.s * 0.95, y: hero.y + Math.sin(a) * hero.s * 0.95,
            vx: -dy / d * run.r * 2, vy: dx / d * run.r * 2, life: 1.4, max: 1.4, col: GAS[(Math.random() * 4) | 0],
            size: hero.s * V.rand(0.04, 0.09), mode: 1 });
        }
      }
    }

    // --- cámara ---
    const zt = V.zoomFor(run.r, Math.min(W, H)) * curve(ZOOM, T);
    zCur += (zt - zCur) * Math.min(1, DT * 3);
    run.zoom = zCur;
    const k = Math.min(1, DT * 5);
    cam.x += (run.x - cam.x) * k; cam.y += (run.y - cam.y) * k;

    // --- densidad en pantalla: si el crecimiento vacía la vista, aparecen cuerpos dentro (con fundido) ---
    const vr = run.viewRad();
    let vis = 0;
    for (const o of run.objs) if (o.kind === 'obj' && o.s > run.r * 0.07 && Math.hypot(o.x - run.x, o.y - run.y) < vr * 0.9) vis++;
    const want = Math.round(55 * st.density);
    for (let i = 0; i < 4 && vis + i < want && run.objs.length < 330; i++) { const o = run.spawnObj(true); o._b = T; }
  }

  // ---------- Dibujo ----------
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  function shakeAt(amp) { return { x: (Math.sin(T * 91.3) + Math.sin(T * 57.7)) * amp, y: (Math.sin(T * 73.1) + Math.cos(T * 49.3)) * amp }; }

  function drawWorld(sh) {
    const R = V.Render, z = run.zoom;
    const ox = W / 2 - cam.x * z + sh.x, oy = H / 2 - cam.y * z + sh.y;
    const S = H / 1080;
    // fondo con paralaje (estrellas a escala de 1080p)
    ctx.save(); ctx.scale(S, S);
    R.background(ctx, W / S, H / S, ((cam.x - prevCam.x) * z) / S, ((cam.y - prevCam.y) * z) / S, T > 36 && T < 44 ? '#1d0b33' : undefined);
    ctx.restore();
    prevCam.x = cam.x; prevCam.y = cam.y;
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    for (const rg of run.rings) {
      const k = rg.t / 0.6;
      ctx.beginPath(); ctx.arc(rg.x * z + ox, rg.y * z + oy, rg.R * z * (1 - k * 0.85), 0, TAU);
      ctx.strokeStyle = 'rgba(120,190,255,' + (1 - k) * 0.6 + ')'; ctx.lineWidth = (3 + 10 * (1 - k)) * S; ctx.stroke();
    }

    for (const o of run.objs) {
      const sx = o.x * z + ox, sy = o.y * z + oy, sr = o.s * z;
      if (o.dead || sx + sr * 3 < 0 || sy + sr * 3 < 0 || sx - sr * 3 > W || sy - sr * 3 > H) continue;
      const fade = o._b == null ? 1 : V.clamp((T - o._b) / 0.5, 0, 1);
      if (fade <= 0) continue;
      ctx.globalAlpha = fade;
      if (o.kind === 'anti') {
        if (R.anti) {
          const sz = sr * R.anti.scale * (1 + Math.sin(T * 10 + o.x) * 0.08);
          ctx.globalAlpha = fade * Math.min(1, o.life);
          ctx.save(); ctx.translate(sx, sy); ctx.rotate(o.rot); ctx.drawImage(R.anti.img, -sz / 2, -sz / 2, sz, sz); ctx.restore();
        }
      } else if (o.kind === 'comet') {
        const sp = Math.hypot(o.vx, o.vy) || 1, tl = Math.min(sr * 14, 260 * S);
        const g = ctx.createLinearGradient(sx, sy, sx - (o.vx / sp) * tl, sy - (o.vy / sp) * tl);
        g.addColorStop(0, 'rgba(160,230,255,0.9)'); g.addColorStop(1, 'rgba(160,230,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = sr * 1.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - (o.vx / sp) * tl, sy - (o.vy / sp) * tl); ctx.stroke();
        ctx.globalCompositeOperation = 'lighter';
        if (R.glowW) ctx.drawImage(R.glowW, sx - sr * 2.5, sy - sr * 2.5, sr * 5, sr * 5);
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath(); ctx.arc(sx, sy, sr * 0.7, 0, TAU); ctx.fillStyle = '#eafaff'; ctx.fill();
      } else if (o.hero) {
        const k = heroImg.width / 200, dmg = 1 - V.clamp(o.hp / o.maxHp, 0, 1);
        const a = Math.atan2(run.y - o.y, run.x - o.x), sz = sr * k;
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(a); ctx.scale(1 + dmg * 0.22, 1 - dmg * 0.1); ctx.rotate(-a);
        ctx.drawImage(heroImg, -sz / 2, -sz / 2, sz, sz);
        if (o.hitT > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.25; ctx.drawImage(heroImg, -sz / 2, -sz / 2, sz, sz); }
        ctx.restore();
      } else {
        const list = R.sprites[o.type];
        const sp = list && list[o.variant % list.length];
        if (sp) {
          const sz = sr * sp.scale;
          if (o.gold && R.gold) {
            ctx.globalCompositeOperation = 'lighter';
            const gs = sr * (3.2 + Math.sin(T * 5 + o.x) * 0.3);
            ctx.drawImage(R.gold, sx - gs, sy - gs, gs * 2, gs * 2);
            ctx.globalCompositeOperation = 'source-over';
          }
          if (o.rot) { ctx.save(); ctx.translate(sx, sy); ctx.rotate(o.rot); ctx.drawImage(sp.img, -sz / 2, -sz / 2, sz, sz); ctx.restore(); }
          else ctx.drawImage(sp.img, sx - sz / 2, sy - sz / 2, sz, sz);
          if (o.hitT > 0 && R.glowW) {
            ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5 * fade;
            ctx.drawImage(R.glowW, sx - sr * 1.3, sy - sr * 1.3, sr * 2.6, sr * 2.6);
            ctx.globalCompositeOperation = 'source-over';
          }
        } else {
          // tipos nuevos que el agente de gameplay pueda añadir: halo genérico
          ctx.globalCompositeOperation = 'lighter';
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 2);
          g.addColorStop(0, 'rgba(255,90,220,0.8)'); g.addColorStop(1, 'rgba(255,90,220,0)');
          ctx.fillStyle = g; ctx.fillRect(sx - sr * 2, sy - sr * 2, sr * 4, sr * 4);
          ctx.globalCompositeOperation = 'source-over';
        }
      }
      ctx.globalAlpha = 1;
    }

    ctx.globalCompositeOperation = 'lighter';
    for (const p of run.parts) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.col;
      const s = Math.max(1.2 * S, p.size * z);
      ctx.fillRect(p.x * z + ox - s / 2, p.y * z + oy - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    const hx = run.x * z + ox, hy = run.y * z + oy;
    ctx.save();
    try { R.drawHole(ctx, hx, hy, run.r * z, run, T); } catch (e) { ctx.beginPath(); ctx.arc(hx, hy, run.r * z, 0, TAU); ctx.fillStyle = '#000'; ctx.fill(); }
    ctx.restore();

    if (run.st.orbitals) {
      for (const p of run.orbPositions()) {
        const px = p.x * z + ox, py = p.y * z + oy, pr = p.s * z;
        if (R.gold) { ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(R.gold, px - pr * 2.5, py - pr * 2.5, pr * 5, pr * 5); ctx.globalCompositeOperation = 'source-over'; }
        ctx.beginPath(); ctx.arc(px, py, pr, 0, TAU); ctx.fillStyle = '#ffe9c9'; ctx.fill();
      }
    }
    A.vignette(ctx, W, H, 0.55);
  }

  function setFont(px, weight, family) {
    ctx.font = (weight || 900) + ' ' + px + 'px ' + (family || A.FONT);
  }
  function spacing(px) { if ('letterSpacing' in ctx) ctx.letterSpacing = px + 'px'; }

  // Tarjeta de texto grande: fundido + leve acercamiento
  function card(text, t0, t1, o) {
    if (T < t0 || T > t1) return;
    const fi = o.fade || 0.3;
    const a = V.clamp(Math.min((T - t0) / fi, (t1 - T) / fi), 0, 1);
    const sc = 1 + 0.06 * ((T - t0) / (t1 - t0));
    if (o.dim) { ctx.fillStyle = 'rgba(5,3,13,' + o.dim * a + ')'; ctx.fillRect(0, 0, W, H); }
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(W / 2, o.y * H); ctx.scale(sc, sc);
    const px = o.size * H;
    setFont(px, 900); spacing(px * (o.track || 0.08));
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let mw = ctx.measureText(text).width;
    if (mw > W * 0.86) { const f = (W * 0.86) / mw; ctx.scale(f, f); }
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = px * 0.5;
    ctx.fillStyle = '#fff'; ctx.fillText(text, 0, 0);
    ctx.shadowColor = o.glow || 'rgba(255,140,60,0.75)'; ctx.shadowBlur = px * 0.6;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  // Transmisión de LUMEN (mismo estilo que las tarjetas del juego: cian, máquina de escribir)
  function transmission(text, t0, t1) {
    if (T < t0 || T > t1) return;
    const a = V.clamp(Math.min((T - t0) / 0.3, (t1 - T) / 0.3), 0, 1);
    const n = Math.floor((T - t0 - 0.35) * 26);
    const shown = text.slice(0, V.clamp(n, 0, text.length));
    const px = H * 0.03, w = Math.min(W * 0.62, px * 26), h = px * 3.6;
    const x = (W - w) / 2, y = H * 0.82;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(8,6,20,0.88)'; ctx.strokeStyle = '#7fe3ff'; ctx.lineWidth = Math.max(1, H / 900);
    ctx.shadowColor = 'rgba(127,227,255,0.35)'; ctx.shadowBlur = px;
    roundRect(x, y, w, h, px * 0.5); ctx.fill(); ctx.shadowBlur = 0; ctx.stroke();
    ctx.fillStyle = '#7fe3ff';
    ctx.beginPath(); ctx.arc(x + px * 0.9, y + px * 0.95, px * 0.22, 0, TAU);
    ctx.globalAlpha = a * (0.6 + 0.4 * Math.sin(T * 6)); ctx.fill(); ctx.globalAlpha = a;
    setFont(px * 0.55, 800, A.TEXT); spacing(px * 0.1);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('LUMEN', x + px * 1.4, y + px * 0.97);
    setFont(px, 500, '"Cascadia Mono","Consolas",ui-monospace,monospace'); spacing(0);
    ctx.fillStyle = '#ece8ff';
    ctx.fillText(shown + (n < text.length + 8 && Math.floor(T * 3) % 2 ? '▌' : ''), x + px * 0.9, y + px * 2.35);
    ctx.restore();
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function blackCard() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const S = H / 1080;
    const ha = V.clamp(Math.min((T - 31.2) / 0.6, (35.8 - T) / 0.3), 0, 1);
    if (ha > 0) {
      ctx.save(); ctx.globalAlpha = ha;
      setFont(22 * S, 800, A.TEXT); spacing(6 * S);
      ctx.fillStyle = '#7fe3ff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(tx('firstHead'), W / 2, H * 0.42);
      ctx.restore();
    }
    const txt = tx('first');
    const n = Math.floor((T - 31.7) * 17);
    if (n > 0 && T < 35.9) {
      const a = V.clamp((35.9 - T) / 0.3, 0, 1);
      ctx.save(); ctx.globalAlpha = a;
      const px = 64 * S;
      setFont(px, 800, A.TEXT); spacing(px * 0.02);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const full = ctx.measureText(txt).width;
      if (full > W * 0.88) { const f = (W * 0.88) / full; setFont(px * f, 800, A.TEXT); }
      // se mide la frase completa para que no "baile" mientras se escribe
      const fw = ctx.measureText(txt).width;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fff1e2';
      ctx.shadowColor = 'rgba(255,170,90,0.55)'; ctx.shadowBlur = px * 0.5;
      ctx.fillText(txt.slice(0, Math.min(n, txt.length)), W / 2 - fw / 2, H * 0.52);
      ctx.restore();
    }
  }

  function endScene() {
    const S = H / 1080, md = Math.min(W, H);
    ctx.save(); ctx.scale(S, S);
    V.Render.background(ctx, W / S, H / S, 0.35, 0.12);
    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // el agujero, ya en calma, detrás del logo
    const k = easeOut(V.clamp((T - 44) / 6, 0, 1));
    const hr = md * (0.05 + 0.012 * k);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(W / 2, H * 0.33, 0, W / 2, H * 0.33, md * 0.6);
    g.addColorStop(0, 'rgba(150,80,255,0.22)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    try { V.Render.drawHole(ctx, W / 2, H * 0.3, hr, { stab: 1, stabMax: 1, demo: true, headless: true }, T); } catch (e) { /* sin agujero */ }
    A.vignette(ctx, W, H, 0.6);
    const la = V.clamp((T - 44.8) / 0.9, 0, 1);
    if (la > 0) {
      ctx.save(); ctx.globalAlpha = la;
      const sc = 1.06 - 0.06 * easeOut(la);
      ctx.translate(W / 2, H * 0.52); ctx.scale(sc, sc);
      A.logo(ctx, 0, 0, W * 0.58, H * 0.2, {});
      ctx.restore();
    }
    const ta = V.clamp((T - 46.2) / 0.8, 0, 1);
    if (ta > 0) {
      ctx.save(); ctx.globalAlpha = ta;
      A.tagline(ctx, A.TAGLINE[LANG], W / 2, H * 0.62, W * 0.7, H * 0.036, { lines: 1 });
      ctx.restore();
    }
    const ca = V.clamp((T - 48.0) / 0.6, 0, 1);
    if (ca > 0) {
      ctx.save(); ctx.globalAlpha = ca;
      const px = H * 0.034;
      setFont(px, 800, A.TEXT); spacing(px * 0.04);
      const label = tx('wish');
      const w = ctx.measureText(label).width + px * 2.6, h = px * 2.2, x = W / 2 - w / 2, y = H * 0.73;
      const pulse = 0.5 + 0.5 * Math.sin((T - 48) * 3);
      ctx.shadowColor = 'rgba(255,130,50,' + (0.35 + 0.3 * pulse) + ')'; ctx.shadowBlur = px * 1.2;
      const bg = ctx.createLinearGradient(0, y, 0, y + h);
      bg.addColorStop(0, '#ff9a3c'); bg.addColorStop(1, '#e8622a');
      ctx.fillStyle = bg; roundRect(x, y, w, h, h * 0.28); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#1a0b02'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(label, W / 2, y + h / 2 + px * 0.04);
      setFont(px * 0.6, 700, A.TEXT); spacing(px * 0.25);
      ctx.fillStyle = '#c9c2ec';
      ctx.fillText(tx('steam'), W / 2, y + h + px * 1.3);
      ctx.restore();
    }
  }

  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    if (T >= 30.9 && T < 36.0) { blackCard(); return; }
    if (T >= 43.6) {
      endScene();
      const wa = 1 - V.clamp((T - 44.0) / 1.0, 0, 1);
      if (wa > 0) { ctx.fillStyle = 'rgba(255,250,245,' + wa + ')'; ctx.fillRect(0, 0, W, H); }
      return;
    }
    let amp = 0;
    if (T > 36) amp = (2 + 10 * V.clamp((T - 36) / 7, 0, 1)) * (H / 1080);
    if (T > 36 && T < 36.4) amp += 18 * (H / 1080) * (1 - (T - 36) / 0.4);
    drawWorld(shakeAt(amp));
    // fundido de entrada
    if (T < 0.7) { ctx.fillStyle = 'rgba(0,0,0,' + (1 - T / 0.7) + ')'; ctx.fillRect(0, 0, W, H); }
    // destello del corte al clímax
    if (T >= 36 && T < 36.25) { ctx.fillStyle = 'rgba(255,240,225,' + (1 - (T - 36) / 0.25) * 0.8 + ')'; ctx.fillRect(0, 0, W, H); }
    card(tx('devour'), 0.9, 3.2, { y: 0.8, size: 0.11 });
    card(tx('grow'), 6.6, 8.9, { y: 0.8, size: 0.11 });
    transmission(tx('moon'), 13.8, 17.6);
    card(tx('why'), 24.0, 27.6, { y: 0.5, size: 0.075, dim: 0.45, track: 0.04, glow: 'rgba(155,92,255,0.8)' });
    transmission(tx('light'), 27.6, 30.6);
    // Big Bang
    if (T > 42.6) {
      const k = V.clamp((T - 42.6) / 1.0, 0, 1);
      const R = Math.hypot(W, H) * (0.05 + 1.1 * k * k);
      const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, R);
      g.addColorStop(0, 'rgba(255,255,255,' + (0.6 + 0.4 * k) + ')');
      g.addColorStop(0.5, 'rgba(255,230,200,' + k + ')');
      g.addColorStop(1, 'rgba(255,200,150,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (k > 0.85) { ctx.fillStyle = 'rgba(255,250,245,' + (k - 0.85) / 0.15 + ')'; ctx.fillRect(0, 0, W, H); }
    }
  }

  // ---------- Bucle y controles ----------
  const help = document.getElementById('help'), clock = document.getElementById('clock');
  let playing = false, started = false, pre = 0, acc = 0, last = 0, shotMode = Q.get('shot') === '1';
  function seek(t) {
    reset();
    const target = V.clamp(t, 0, END);
    while (T < target - 1e-9) step();
    render();
  }
  function info() { document.getElementById('langInfo').textContent = 'Idioma de las tarjetas: ' + (LANG === 'es' ? 'Español' : 'English') + ' · semilla ' + SEED + ' · ' + W + '×' + H; }
  function start() {
    help.classList.add('hidden'); document.body.classList.add('rec');
    if (!started) { started = true; pre = T > 0 ? 0 : PREROLL; }
    playing = true;
  }
  function frame(now) {
    const realDt = Math.min(0.1, (now - (last || now)) / 1000);
    last = now;
    if (playing) {
      if (pre > 0) { pre -= realDt; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
      else {
        acc += realDt;
        let n = 0;
        while (acc >= DT && n < 6) { if (T < END) step(); else { T += DT; } acc -= DT; n++; }
        if (n >= 6) acc = 0;
        render();
      }
    }
    clock.textContent = T.toFixed(2) + ' s';
    requestAnimationFrame(frame);
  }
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); if (playing) { playing = false; help.classList.remove('hidden'); document.body.classList.remove('rec'); } else start(); }
    else if (e.code === 'KeyR') { started = false; playing = false; seek(0); help.classList.remove('hidden'); document.body.classList.remove('rec'); }
    else if (e.code === 'KeyF') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {}); }
    else if (e.code === 'KeyH') help.classList.toggle('hidden');
    else if (e.code === 'KeyT') clock.classList.toggle('hidden');
    else if (e.code === 'KeyL') { LANG = LANG === 'es' ? 'en' : 'es'; info(); render(); }
    else if (e.code === 'ArrowRight') { seek(T + 5); started = true; }
    else if (e.code === 'ArrowLeft') { seek(T - 5); started = true; }
  });
  cvs.addEventListener('click', () => { if (!playing) start(); });
  window.addEventListener('resize', () => { resize(); if (!playing) render(); });

  resize();
  seek(+Q.get('start') || 0);
  info();
  if (T === 0) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
  window.Trailer = { seek, render, step, advanceTo(t) { while (T < t - 1e-9) step(); render(); }, get T() { return T; }, get run() { return run; }, get hero() { return hero; }, END, setLang(l) { LANG = l; } };
  if (shotMode) { help.classList.add('hidden'); window.Trailer.ready = true; return; }
  if (Q.get('autostart') === '1') start();
  requestAnimationFrame(frame);
  window.Trailer.ready = true;
})();
