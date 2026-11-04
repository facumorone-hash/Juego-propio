// Pantalla del árbol de investigación de LUMEN (constelación de mejoras).
(function () {
  const V = window.V;
  const TAU = V.TAU;
  const NR = 24;

  const T = {
    cam: { x: 0, y: 0, z: 1 },
    hover: null, // nodo bajo el ratón
    sel: null, // nodo seleccionado con mando/teclado
    guide: null, // nodo resaltado para "¡Compra tu primera mejora!" (lo decide main.js)
    camGoal: null, // destino suave de la cámara al seguir la selección
    bursts: [],
    radius() { return NR * this.cam.z; },
    screenPos(nd, W, H) { return { x: (nd.x - this.cam.x) * this.cam.z + W / 2, y: (nd.y - this.cam.y) * this.cam.z + H / 2 }; },
    // Selecciona un nodo y mueve la cámara si queda fuera de la zona central de la pantalla.
    select(nd, W, H) {
      this.sel = nd;
      if (!nd || !W) return;
      const p = this.screenPos(nd, W, H);
      if (p.x < W * 0.22 || p.x > W * 0.78 || p.y < H * 0.24 || p.y > H * 0.8) this.camGoal = { x: nd.x, y: nd.y };
    },
    // Mueve la selección al nodo visible más cercano en la dirección (dx, dy). Devuelve el nodo o null.
    moveSel(dx, dy, levels, W, H) {
      const cur = this.sel || V.NODE.core;
      if (!this.sel) { this.select(cur, W, H); return cur; }
      const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
      let best = null, bs = Infinity;
      for (const nd of V.NODES) {
        if (nd === cur || !V.isVisible(nd, levels)) continue;
        const vx = nd.x - cur.x, vy = nd.y - cur.y;
        const along = vx * dx + vy * dy;
        if (along <= 4) continue;
        const perp = Math.abs(vx * dy - vy * dx);
        if (perp > along * 2.2) continue; // fuera del cono de ~65° en esa dirección
        const score = along + perp * 1.8;
        if (score < bs) { bs = score; best = nd; }
      }
      if (best) this.select(best, W, H);
      return best;
    },
    // Encuadra todos los nodos visibles dentro del área libre (descontando la barra superior y la ayuda
    // inferior: inset {top, bottom} en px). Con smooth, la cámara va hasta ahí suavemente.
    fitView(W, H, levels, inset) {
      inset = inset || { top: 70, bottom: 24 };
      let minX = -150, maxX = 150, minY = -150, maxY = 150;
      for (const nd of V.NODES) {
        if (!V.isVisible(nd, levels)) continue;
        minX = Math.min(minX, nd.x); maxX = Math.max(maxX, nd.x);
        minY = Math.min(minY, nd.y); maxY = Math.max(maxY, nd.y);
      }
      const availH = Math.max(120, H - inset.top - inset.bottom);
      const w = maxX - minX + 160, h = maxY - minY + 150; // margen: radio, contador "0/5" y etiqueta de rama
      const z = V.clamp(Math.min(W / w, availH / h), 0.45, 1.25);
      // centro del área libre en pantalla → desplazamiento de la cámara
      const cy = (inset.top + (H - inset.bottom)) / 2;
      return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 + 12 - (cy - H / 2) / z, z };
    },
    fit(W, H, levels, inset) {
      this.camGoal = null;
      const f = this.fitView(W, H, levels, inset);
      this.cam.x = f.x; this.cam.y = f.y; this.cam.z = f.z;
    },
    // Tras una compra que revela nodos: reencuadra solo si alguno queda fuera del área libre.
    refit(W, H, levels, inset, smooth) {
      const f = this.fitView(W, H, levels, inset);
      let out = false;
      for (const nd of V.NODES) {
        if (!V.isVisible(nd, levels)) continue;
        const p = this.screenPos(nd, W, H), r = this.radius() + 26;
        if (p.x - r < 0 || p.x + r > W || p.y - r < inset.top || p.y + r > H - inset.bottom) { out = true; break; }
      }
      if (!out) return;
      if (smooth) this.camGoal = f; else { this.cam.x = f.x; this.cam.y = f.y; this.cam.z = f.z; }
    },
    toWorld(mx, my, W, H) { return { x: (mx - W / 2) / this.cam.z + this.cam.x, y: (my - H / 2) / this.cam.z + this.cam.y }; },
    pick(mx, my, W, H, levels) {
      const p = this.toWorld(mx, my, W, H);
      for (const nd of V.NODES) {
        if (!V.isVisible(nd, levels)) continue;
        if (Math.hypot(p.x - nd.x, p.y - nd.y) < NR + 6) return nd;
      }
      return null;
    },
    burst(nd) { this.bursts.push({ nd, t: 0 }); },

    drawBranchLabels(ctx, lv, sx, sy, z, us) {
      // Cada etiqueta va justo FUERA del primer nodo de su rama (en la dirección opuesta al núcleo), con un
      // fondo oscuro sutil. Alrededor del núcleo no cabían 6 nombres largos sin pisarse ni pisar los
      // contadores "0/5". Hacia abajo deja sitio al contador; los nombres largos se reducen (máx. ~120 px).
      const r = NR * z, cfs = Math.max(10, 11 * z) * us, counterH = (8 + 10 * z) * us + cfs * 0.4;
      for (const b in V.BRANCHES) {
        if (b === 'core') continue;
        const first = V.NODES.find((n) => n.b === b && n.d === 1);
        if (!first || !V.isVisible(first, lv)) continue;
        if (this.guide === first && !(lv[first.id] > 0)) continue; // la flecha de "primera mejora" ocupa ese sitio
        const a = (V.BRANCHES[b].angle * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
        const name = V.t('b_' + b).toUpperCase();
        const px = Math.max(10, 13 * z) * us;
        if (V.Render && V.Render.fitFont) V.Render.fitFont(ctx, name, 120 * z * us, '800', px, 8);
        else ctx.font = V.font('800', px);
        const w = ctx.measureText(name).width, h = V.Render && V.Render.fontPx ? V.Render.fontPx(ctx) : px;
        // distancia desde el centro del nodo hasta el centro de la etiqueta, a lo largo de la rama
        const extent = Math.abs(ca) * (w / 2 + 4) + Math.abs(sa) * (h / 2 + 3);
        const down = sa > 0.2 ? counterH * sa + 4 : 0; // el contador está debajo del nodo
        const d = r + 7 * z + extent + down;
        const cx = sx(first.x) + ca * d, cy = sy(first.y) + sa * d;
        ctx.fillStyle = 'rgba(8,5,20,0.55)';
        if (V.Render && V.Render.roundRect) { V.Render.roundRect(ctx, cx - w / 2 - 5, cy - h / 2 - 3, w + 10, h + 6, 6); ctx.fill(); }
        ctx.fillStyle = hexA(V.BRANCHES[b].color, 0.85);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(name, cx, cy + 0.5);
        ctx.textBaseline = 'alphabetic';
      }
    },

    draw(ctx, W, H, save, time, dt) {
      const lv = save.levels;
      // la cámara sigue suavemente a la selección del mando
      if (this.camGoal) {
        const k = 1 - Math.exp(-dt * 7);
        this.cam.x += (this.camGoal.x - this.cam.x) * k; this.cam.y += (this.camGoal.y - this.cam.y) * k;
        if (this.camGoal.z) this.cam.z += (this.camGoal.z - this.cam.z) * k;
        if (Math.hypot(this.camGoal.x - this.cam.x, this.camGoal.y - this.cam.y) < 0.5 && (!this.camGoal.z || Math.abs(this.camGoal.z - this.cam.z) < 0.003)) this.camGoal = null;
      }
      const z = this.cam.z;
      const us = V.uiScale || 1;
      const navMode = V.inputMode === 'pad' || V.inputMode === 'key' || V.inputMode === 'touch';
      const sx = (x) => (x - this.cam.x) * z + W / 2, sy = (y) => (y - this.cam.y) * z + H / 2;

      // aristas
      for (const nd of V.NODES) {
        if (!nd.p || !V.isVisible(nd, lv)) continue;
        const pa = V.NODE[nd.p];
        const owned = (lv[nd.id] || 0) > 0;
        ctx.beginPath(); ctx.moveTo(sx(pa.x), sy(pa.y)); ctx.lineTo(sx(nd.x), sy(nd.y));
        const col = V.BRANCHES[nd.b].color;
        ctx.strokeStyle = owned ? col : 'rgba(170,150,255,0.25)';
        ctx.globalAlpha = owned ? 0.75 : 1;
        ctx.lineWidth = owned ? 3 * z : 1.5 * z;
        if (!owned) ctx.setLineDash([5 * z, 7 * z]);
        ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      }

      // nodos
      for (const nd of V.NODES) {
        if (!V.isVisible(nd, lv)) continue;
        const x = sx(nd.x), y = sy(nd.y), r = NR * z;
        const l = lv[nd.id] || 0;
        const col = V.BRANCHES[nd.b].color;
        const unlocked = V.isUnlocked(nd, save.record);
        const maxed = l >= nd.max;
        const afford = unlocked && !maxed && save.matter >= V.cost(nd, l);

        if (nd.id === 'core') {
          const g = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 3);
          g.addColorStop(0, 'rgba(255,160,80,0.4)'); g.addColorStop(1, 'rgba(255,160,80,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, TAU); ctx.fill();
          ctx.beginPath(); ctx.arc(x, y, r * 1.1, 0, TAU); ctx.fillStyle = '#000'; ctx.fill();
          ctx.lineWidth = 3 * z; ctx.strokeStyle = '#ffe1be'; ctx.stroke();
          continue;
        }

        if (afford) {
          const pul = 0.5 + 0.5 * Math.sin(time * 4 + nd.x);
          const g = ctx.createRadialGradient(x, y, r, x, y, r * 2.1);
          g.addColorStop(0, hexA(col, 0.45 * pul + 0.2)); g.addColorStop(1, hexA(col, 0));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.1, 0, TAU); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
        ctx.fillStyle = !unlocked ? '#120e22' : l > 0 ? hexA(col, 0.28) : '#151030';
        ctx.fill();
        ctx.lineWidth = 2 * z;
        ctx.strokeStyle = !unlocked ? 'rgba(120,110,160,0.4)' : l > 0 || afford ? col : hexA(col, 0.45);
        ctx.stroke();
        if (l > 0) {
          ctx.beginPath(); ctx.arc(x, y, r + 5 * z, -Math.PI / 2, -Math.PI / 2 + TAU * (l / nd.max));
          ctx.lineWidth = 3.5 * z; ctx.strokeStyle = col; ctx.stroke();
        }
        if (maxed) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.beginPath(); ctx.arc(x, y, r + 5 * z, 0, TAU);
          ctx.lineWidth = 8 * z; ctx.strokeStyle = hexA(col, 0.25); ctx.stroke();
          ctx.globalCompositeOperation = 'source-over';
        }
        drawIcon(ctx, nd, x, y, r, unlocked ? (l > 0 ? '#fff' : col) : 'rgba(150,140,190,0.6)');
        ctx.textAlign = 'center';
        ctx.font = V.font('700', Math.max(10, 11 * z) * us);
        ctx.fillStyle = unlocked ? 'rgba(236,232,255,0.8)' : 'rgba(150,140,190,0.6)';
        ctx.fillText(unlocked ? l + '/' + nd.max : '🔒', x, y + r + (8 + 10 * z) * us);
        if (this.hover === nd && !navMode) {
          ctx.beginPath(); ctx.arc(x, y, r + 10 * z, 0, TAU);
          ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.stroke();
        }
      }

      // selección con mando / teclado: anillo giratorio y corchetes
      if (navMode && this.sel && V.isVisible(this.sel, lv)) {
        const p = this.screenPos(this.sel, W, H), r = NR * z * (this.sel.id === 'core' ? 1.25 : 1) + 11 * z;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.shadowColor = '#fff'; ctx.shadowBlur = 12;
        ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 2.5;
        ctx.setLineDash([7, 6]); ctx.lineDashOffset = -time * 18;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
        ctx.setLineDash([]);
        const b = r + 7, c = 9;
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath(); ctx.moveTo(b - c, -b); ctx.lineTo(b, -b); ctx.lineTo(b, -b + c); ctx.stroke();
        }
        ctx.restore();
      }

      // guía de la primera compra: flecha que rebota + texto
      if (this.guide && V.isVisible(this.guide, lv) && !(lv[this.guide.id] > 0)) {
        const p = this.screenPos(this.guide, W, H), r = NR * z;
        const bob = Math.sin(time * 5) * 6;
        const pul = 0.5 + 0.5 * Math.sin(time * 5);
        ctx.beginPath(); ctx.arc(p.x, p.y, r + (14 + pul * 10) * z, 0, TAU);
        ctx.strokeStyle = 'rgba(255,154,60,' + (0.9 - pul * 0.6) + ')'; ctx.lineWidth = 3; ctx.stroke();
        const ay = p.y - r - 22 * z - 10 + bob;
        ctx.fillStyle = '#ff9a3c'; ctx.shadowColor = '#ff9a3c'; ctx.shadowBlur = 16;
        ctx.beginPath(); ctx.moveTo(p.x, ay); ctx.lineTo(p.x - 11, ay - 14); ctx.lineTo(p.x - 4, ay - 14); ctx.lineTo(p.x - 4, ay - 28);
        ctx.lineTo(p.x + 4, ay - 28); ctx.lineTo(p.x + 4, ay - 14); ctx.lineTo(p.x + 11, ay - 14); ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.textAlign = 'center';
        const label = V.t('firstBuy');
        // el texto se reduce si no cabe (idiomas largos / pantallas estrechas)
        if (V.Render && V.Render.fitFont) V.Render.fitFont(ctx, label, W - 48, '900', 17 * us, 11);
        else ctx.font = V.font('900', 17 * us);
        const tw = ctx.measureText(label).width;
        const lx = V.clamp(p.x, tw / 2 + 12, W - tw / 2 - 12), ly = ay - 38;
        ctx.fillStyle = 'rgba(10,7,24,0.85)';
        if (V.Render && V.Render.roundRect) { V.Render.roundRect(ctx, lx - tw / 2 - 12, ly - 20 * us, tw + 24, 30 * us, 10); ctx.fill(); }
        ctx.fillStyle = '#ffd2a8';
        ctx.fillText(label, lx, ly);
      }

      // explosiones de compra
      for (let i = this.bursts.length - 1; i >= 0; i--) {
        const b = this.bursts[i];
        b.t += dt;
        const k = b.t / 0.6;
        if (k >= 1) { this.bursts.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(sx(b.nd.x), sy(b.nd.y), (NR + 60 * k) * z, 0, TAU);
        ctx.strokeStyle = hexA(V.BRANCHES[b.nd.b].color, 1 - k); ctx.lineWidth = 4 * (1 - k) + 1; ctx.stroke();
      }

      // nombres de rama: se colocan donde no pisen nodos, contadores "0/5" ni otras etiquetas
      if (z >= 0.75) this.drawBranchLabels(ctx, lv, sx, sy, z, us);
    },
  };

  // Iconos vectoriales por mejora (QA H-05): un glifo según lo que hace el nodo (stat), no uno por rama.
  // Los nodos que añaden una mecánica nueva llevan además cuatro marcas alrededor (ver SPECIAL).
  const SPECIAL = new Set(['h4', 'g4', 'g9', 's5', 's9', 't3', 't8', 'c3', 'o4', 'o6']);
  function star(ctx, n, ro, ri, rot) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = rot + (i / (n * 2)) * TAU, rr = i % 2 ? ri : ro; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath();
  }
  function diamond(ctx, cx, cy, w, h) { ctx.beginPath(); ctx.moveTo(cx, cy - h); ctx.lineTo(cx + w, cy); ctx.lineTo(cx, cy + h); ctx.lineTo(cx - w, cy); ctx.closePath(); }
  function chevron(ctx, x, y, s, dir) { ctx.beginPath(); ctx.moveTo(x - s * 0.5 * dir, y - s); ctx.lineTo(x + s * 0.5 * dir, y); ctx.lineTo(x - s * 0.5 * dir, y + s); ctx.stroke(); }
  const GLYPH = {
    // HAMBRE
    massGainMul(ctx, s) { ctx.beginPath(); ctx.arc(0, s * 0.2, s * 0.55, 0, TAU); ctx.fill(); chevron(ctx, 0, -s * 0.7, s * 0.35, 0); ctx.beginPath(); ctx.moveTo(-s * 0.4, -s * 0.45); ctx.lineTo(0, -s * 0.9); ctx.lineTo(s * 0.4, -s * 0.45); ctx.stroke(); },
    matterMul(ctx, s) { diamond(ctx, 0, 0, s * 0.62, s * 0.9); ctx.fill(); },
    eatRatio(ctx, s) { ctx.beginPath(); ctx.arc(0, 0, s, 0.55, TAU - 0.55); ctx.lineTo(0, 0); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.arc(s * 0.85, 0, s * 0.18, 0, TAU); ctx.fill(); },
    combo(ctx, s) { ctx.beginPath(); ctx.ellipse(-s * 0.35, 0, s * 0.55, s * 0.36, 0, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.ellipse(s * 0.35, 0, s * 0.55, s * 0.36, 0, 0, TAU); ctx.stroke(); },
    // GRAVEDAD
    pullRange(ctx, s) { ctx.beginPath(); ctx.arc(0, 0, s * 0.22, 0, TAU); ctx.fill(); ctx.setLineDash([s * 0.3, s * 0.25]); ctx.beginPath(); ctx.arc(0, 0, s, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.beginPath(); ctx.arc(0, 0, s * 0.6, 0, TAU); ctx.stroke(); },
    pullStr(ctx, s) { ctx.beginPath(); ctx.arc(0, 0, s * 0.2, 0, TAU); ctx.fill(); for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate((i * TAU) / 4 + Math.PI / 4); chevron(ctx, s * 0.75, 0, s * 0.25, -1); ctx.restore(); } },
    speed(ctx, s) { chevron(ctx, -s * 0.3, 0, s * 0.6, 1); chevron(ctx, s * 0.35, 0, s * 0.6, 1); },
    pulse(ctx, s) { ctx.beginPath(); ctx.arc(0, 0, s * 0.25, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, s * 0.62, 0, TAU); ctx.stroke(); for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * s * 0.8, Math.sin(a) * s * 0.8); ctx.lineTo(Math.cos(a) * s * 1.05, Math.sin(a) * s * 1.05); ctx.stroke(); } },
    pulseLv(ctx, s) { ctx.beginPath(); ctx.arc(0, 0, s * 0.22, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, s * 0.55, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, s * 0.95, 0, TAU); ctx.stroke(); },
    antiLoot(ctx, s) { star(ctx, 6, s * 0.75, s * 0.32, 0); ctx.stroke(); diamond(ctx, s * 0.62, s * 0.62, s * 0.22, s * 0.32); ctx.fill(); },
    // ESTABILIDAD
    drainMul(ctx, s) { ctx.beginPath(); ctx.moveTo(-s * 0.6, -s * 0.9); ctx.lineTo(s * 0.6, -s * 0.9); ctx.lineTo(-s * 0.6, s * 0.9); ctx.lineTo(s * 0.6, s * 0.9); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-s * 0.3, s * 0.75); ctx.lineTo(s * 0.3, s * 0.75); ctx.lineTo(0, s * 0.3); ctx.closePath(); ctx.fill(); },
    feed(ctx, s) { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + Math.PI / 6; ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s); } ctx.closePath(); ctx.stroke(); ctx.fillRect(-s * 0.45, -s * 0.11, s * 0.9, s * 0.22); ctx.fillRect(-s * 0.11, -s * 0.45, s * 0.22, s * 0.9); },
    armor(ctx, s) { ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.8, -s * 0.6); ctx.quadraticCurveTo(s * 0.75, s * 0.55, 0, s); ctx.quadraticCurveTo(-s * 0.75, s * 0.55, -s * 0.8, -s * 0.6); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -s * 0.55); ctx.lineTo(0, s * 0.55); ctx.stroke(); },
    revive(ctx, s) { ctx.beginPath(); ctx.arc(0, 0, s * 0.75, -0.3, TAU - 1.3); ctx.stroke(); const a = TAU - 1.3, x = Math.cos(a) * s * 0.75, y = Math.sin(a) * s * 0.75; ctx.beginPath(); ctx.moveTo(x + s * 0.35, y - s * 0.05); ctx.lineTo(x - s * 0.05, y - s * 0.4); ctx.lineTo(x - s * 0.15, y + s * 0.15); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, s * 0.2, 0, TAU); ctx.fill(); },
    stabMax(ctx, s) { ctx.strokeRect(-s * 0.45, -s * 0.85, s * 0.9, s * 1.7); ctx.fillRect(-s * 0.2, -s * 1.05, s * 0.4, s * 0.2); for (let i = 0; i < 3; i++) ctx.fillRect(-s * 0.3, s * 0.45 - i * s * 0.48, s * 0.6, s * 0.3); },
    ringArmor(ctx, s) { ctx.beginPath(); ctx.arc(0, 0, s * 0.95, 0.5, Math.PI - 0.5); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, s * 0.95, Math.PI + 0.5, TAU - 0.5); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, s * 0.3, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, s * 0.55, 0, TAU); ctx.stroke(); },
    // MAREA
    tidal(ctx, s) { star(ctx, 4, s, s * 0.35, 0); ctx.stroke(); },
    frags(ctx, s) { for (let i = 0; i < 3; i++) { ctx.save(); ctx.rotate((i * TAU) / 3 - Math.PI / 2); ctx.translate(s * 0.55, 0); ctx.beginPath(); ctx.moveTo(s * 0.35, 0); ctx.lineTo(-s * 0.2, -s * 0.28); ctx.lineTo(-s * 0.2, s * 0.28); ctx.closePath(); ctx.fill(); ctx.restore(); } },
    orbitals(ctx, s) { ctx.beginPath(); ctx.arc(0, 0, s * 0.3, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, s * 0.8, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(s * 0.57, -s * 0.57, s * 0.22, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(-s * 0.57, s * 0.57, s * 0.22, 0, TAU); ctx.fill(); },
    orbSpeed(ctx, s) { ctx.beginPath(); ctx.arc(0, 0, s * 0.8, -2.2, 0.6); ctx.stroke(); ctx.beginPath(); ctx.arc(Math.cos(0.6) * s * 0.8, Math.sin(0.6) * s * 0.8, s * 0.22, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, s * 0.25, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, s * 0.55, -1.8, -0.2); ctx.stroke(); },
    breakBonus(ctx, s) { diamond(ctx, 0, 0, s * 0.65, s * 0.95); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-s * 0.2, -s * 0.65); ctx.lineTo(s * 0.12, -s * 0.15); ctx.lineTo(-s * 0.12, s * 0.15); ctx.lineTo(s * 0.2, s * 0.65); ctx.stroke(); },
    bossDmg(ctx, s) { ctx.beginPath(); ctx.arc(0, 0, s * 0.7, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, s * 0.18, 0, TAU); ctx.fill(); for (let i = 0; i < 4; i++) { const a = (i * TAU) / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * s * 0.45, Math.sin(a) * s * 0.45); ctx.lineTo(Math.cos(a) * s * 1.05, Math.sin(a) * s * 1.05); ctx.stroke(); } },
    // COSMOS
    density(ctx, s) { for (const [x, y, rr] of [[0, 0, 0.22], [-0.6, -0.45, 0.17], [0.6, -0.4, 0.15], [-0.45, 0.6, 0.15], [0.55, 0.55, 0.19], [0, -0.85, 0.12]]) { ctx.beginPath(); ctx.arc(x * s, y * s, rr * s, 0, TAU); ctx.fill(); } },
    goldChance(ctx, s) { star(ctx, 4, s, s * 0.22, -Math.PI / 2); ctx.fill(); },
    comets(ctx, s) { ctx.beginPath(); ctx.arc(s * 0.45, -s * 0.45, s * 0.3, 0, TAU); ctx.fill(); for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(s * 0.3 + i * s * 0.12, -s * 0.3 - i * s * -0.12); ctx.lineTo(-s * 0.85 + i * s * 0.12, s * 0.85 + i * s * 0.12); ctx.stroke(); } },
    cometRate(ctx, s) { for (const o of [-0.35, 0.35]) { ctx.beginPath(); ctx.arc(s * 0.55 + o * s, -s * 0.5 + o * s * 0.2, s * 0.2, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(s * 0.4 + o * s, -s * 0.35 + o * s * 0.2); ctx.lineTo(-s * 0.6 + o * s, s * 0.65 + o * s * 0.2); ctx.stroke(); } },
    goldMul(ctx, s) { star(ctx, 4, s * 0.75, s * 0.18, -Math.PI / 2); ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, s, 0, TAU); ctx.stroke(); },
    // ORIGEN
    startR(ctx, s) { ctx.beginPath(); ctx.arc(0, 0, s * 0.35, 0, TAU); ctx.fill(); for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate((i * TAU) / 4 + Math.PI / 4); chevron(ctx, s * 0.82, 0, s * 0.22, 1); ctx.restore(); } },
    echo(ctx, s) { ctx.beginPath(); ctx.arc(-s * 0.55, 0, s * 0.22, 0, TAU); ctx.fill(); for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(-s * 0.55, 0, s * 0.42 * i, -0.75, 0.75); ctx.stroke(); } },
    antiEat(ctx, s) { ctx.beginPath(); ctx.arc(-s * 0.2, 0, s * 0.85, 0.6, TAU - 0.6); ctx.lineTo(-s * 0.2, 0); ctx.closePath(); ctx.stroke(); ctx.save(); ctx.translate(s * 0.7, 0); star(ctx, 5, s * 0.32, s * 0.14, 0); ctx.fill(); ctx.restore(); },
    naked(ctx, s) { ctx.beginPath(); ctx.arc(0, 0, s * 0.45, 0, TAU); ctx.fill(); for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + 0.2, L = i % 2 ? 0.8 : 1.05; ctx.beginPath(); ctx.moveTo(Math.cos(a) * s * 0.58, Math.sin(a) * s * 0.58); ctx.lineTo(Math.cos(a) * s * L, Math.sin(a) * s * L); ctx.stroke(); } },
  };
  function drawIcon(ctx, nd, x, y, r, col) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = Math.max(1.2, r * 0.08); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const s = r * 0.45;
    const key = nd.stat ? nd.stat.replace(/\d+$/, '') : '';
    const g = GLYPH[key];
    if (g) g(ctx, s);
    ctx.restore();
    // nodos que añaden una mecánica: cuatro marcas en diagonal
    if (SPECIAL.has(nd.id)) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = col;
      for (let i = 0; i < 4; i++) { const a = Math.PI / 4 + (i * TAU) / 4, d = r * 1.32; diamond(ctx, Math.cos(a) * d, Math.sin(a) * d, r * 0.09, r * 0.09); ctx.fill(); }
      ctx.restore();
    }
  }

  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  V.hexA = hexA;
  V.Tree = T;
})();
