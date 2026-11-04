// Mando / Steam Deck / accesibilidad de entrada — propiedad del agente de UX. Ver docs/ARQUITECTURA.md
//
// - Gamepad API (mapeo estándar: Xbox / Steam Deck / PlayStation).
// - Navegación de menús con cruceta, stick o flechas del teclado: foco visible, A/Enter activa, B/Esc vuelve.
// - Modo de entrada (V.inputMode: 'mouse' | 'key' | 'pad' | 'touch') → glifos de mando en las pistas.
// - Partida: stick izquierdo mueve (V.game.setTarget), A o RT = Pulso, Start = pausa.
// - Árbol: cruceta/stick selecciona el nodo visible más cercano en esa dirección, A compra, X/Start inicia.
//
// Atributos de pantalla que entiende la navegación (en el elemento .screen):
//   data-focus="id"  botón con el foco inicial      data-back="id"  botón que pulsa B / Esc
//   data-enter="id"  botón que pulsa Enter (teclado) data-x="id"     botón que pulsa X en el mando
(function () {
  const V = window.V;
  const $ = (id) => document.getElementById(id);
  const DZ = 0.22; // zona muerta radial del stick izquierdo
  const NAV_DZ = 0.55; // umbral del stick para navegar menús
  const NAV_DELAY = 0.36, NAV_REPEAT = 0.11; // repetición al mantener una dirección
  const B = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, SELECT: 8, START: 9, LS: 10, RS: 11, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };

  const I = {
    mode: 'mouse', connected: false, padId: '', padStyle: 'xbox',
    stick: { x: 0, y: 0, mag: 0 }, rstick: { x: 0, y: 0 },
    prev: [], navKey: null, navT: 0, layerKey: null, mouseAcc: 0,
  };
  V.Input = I;

  // ---------- Modo de entrada ----------
  function setMode(m) {
    if (I.mode === m) return;
    I.mode = m; V.inputMode = m;
    document.documentElement.dataset.input = m;
    if (V.game && V.game.applyI18n) V.game.applyI18n();
    V.bus.emit('input:mode', m);
  }
  I.setMode = setMode;
  document.documentElement.dataset.input = I.mode;
  V.inputMode = I.mode;

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch' || I.mode === 'mouse') return;
    // ignorar micro-movimientos (trackpads del Steam Deck, vibraciones)
    I.mouseAcc += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
    if (I.mouseAcc > 24) { I.mouseAcc = 0; setMode('mouse'); }
  }, true);
  window.addEventListener('pointerdown', (e) => { I.mouseAcc = 0; setMode(e.pointerType === 'touch' ? 'touch' : 'mouse'); }, true);

  // ---------- Capas de UI ----------
  const visible = (el) => !!el && !el.classList.contains('hidden') && el.offsetParent !== null && !el.closest('.hidden');
  // Devuelve la capa que recibe la entrada: confirmación > transmisión > pantalla DOM > árbol > partida.
  function activeLayer() {
    const g = V.game;
    if (!g) return { kind: 'none' };
    const conf = $('confirm');
    if (conf && !conf.classList.contains('hidden')) return { kind: 'dom', el: conf };
    if (g.transActive && g.transActive()) return { kind: 'trans' };
    const scr = document.querySelectorAll('#ui > .screen');
    for (let i = scr.length - 1; i >= 0; i--) {
      const el = scr[i];
      if (!el.classList.contains('hidden') && el.id !== 'confirm' && getComputedStyle(el).display !== 'none') return { kind: 'dom', el };
    }
    if (g.state === 'tree') return { kind: 'tree' };
    if (g.state === 'run' || g.state === 'ending') return { kind: 'run' };
    if (g.cineActive && g.cineActive()) return { kind: 'cine' };
    return { kind: 'none' };
  }
  I.activeLayer = activeLayer;

  function focusables(root) {
    return [...root.querySelectorAll('button, input, select, [data-nav]')].filter(
      (el) => !el.disabled && visible(el) && getComputedStyle(el).visibility !== 'hidden'
    );
  }
  function defaultFocus(root) {
    let el = root.dataset.focus && $(root.dataset.focus);
    if (!el || !visible(el) || el.disabled) el = [...root.querySelectorAll('button.primary')].find((b) => visible(b) && !b.disabled);
    return el || focusables(root)[0] || null;
  }
  function focusEl(el) {
    if (!el) return;
    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
    if (el.scrollIntoView) el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  // Garantiza que haya un elemento con foco dentro de la capa. Devuelve [elemento, recienEnfocado].
  function ensureFocus(root) {
    const a = document.activeElement;
    if (a && a !== document.body && root.contains(a) && visible(a)) return [a, false];
    const el = defaultFocus(root);
    focusEl(el);
    return [el, true];
  }

  function center(el) { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function tick() { try { V.Audio && V.Audio.ctx && V.Audio.tone(1100, 0.025, 'sine', 0.03); } catch (e) {} }

  // Navegación direccional por proximidad espacial.
  function navMove(root, dx, dy) {
    const [cur, fresh] = ensureFocus(root);
    if (!cur || fresh) return;
    // controles que se ajustan con izquierda/derecha
    if (dx && cur.type === 'range') {
      const st = +cur.step || 1, mn = +cur.min || 0, mx = cur.max === '' ? 100 : +cur.max;
      const v = V.clamp(Math.round((+cur.value + dx * st) / st) * st, mn, mx);
      if (v !== +cur.value) { cur.value = v; cur.dispatchEvent(new Event('input', { bubbles: true })); cur.dispatchEvent(new Event('change', { bubbles: true })); tick(); }
      return;
    }
    if (dx && cur.tagName === 'SELECT') {
      const n = cur.options.length;
      cur.selectedIndex = (cur.selectedIndex + dx + n) % n;
      cur.dispatchEvent(new Event('change', { bubbles: true })); tick();
      return;
    }
    // listas con scroll (archivo, créditos, estadísticas)
    if (dy && cur.hasAttribute('data-scroll')) {
      const before = cur.scrollTop;
      cur.scrollTop += dy * 90;
      if (cur.scrollTop !== before) return;
    }
    const c0 = center(cur);
    let best = null, bs = Infinity, wrap = null, ws = Infinity;
    for (const el of focusables(root)) {
      if (el === cur) continue;
      const c = center(el), vx = c.x - c0.x, vy = c.y - c0.y;
      const along = vx * dx + vy * dy, perp = Math.abs(vx * dy - vy * dx);
      if (along > 4) {
        const s = along + perp * 2.5;
        if (s < bs) { bs = s; best = el; }
      } else if (along < -4 && perp < 60) {
        // candidato para dar la vuelta (el más lejano en sentido contrario y alineado)
        const s = along + perp * 2.5;
        if (s < ws) { ws = s; wrap = el; }
      }
    }
    const to = best || wrap;
    if (to) { focusEl(to); tick(); }
  }

  function activate(root, viaEnter) {
    if (viaEnter && root.dataset.enter) {
      const b = $(root.dataset.enter);
      if (b && visible(b) && !b.disabled) { b.click(); return; }
    }
    const [cur] = ensureFocus(root);
    if (!cur || cur.type === 'range') return;
    if (cur.tagName === 'SELECT') { cur.selectedIndex = (cur.selectedIndex + 1) % cur.options.length; cur.dispatchEvent(new Event('change', { bubbles: true })); return; }
    if (cur.hasAttribute('data-scroll')) return;
    cur.click();
  }
  function clickData(root, attr) {
    const id = root.dataset[attr], b = id && $(id);
    if (b && visible(b) && !b.disabled) { b.click(); return true; }
    return false;
  }
  function back(root) {
    if (clickData(root, 'back')) return;
    // pantallas de otros módulos (p. ej. logros): buscar un botón "volver/cerrar/cancelar"
    const b = [...root.querySelectorAll('button')].find((x) => visible(x) && /^(back|close|cancel)$/.test(x.dataset.i18n || ''));
    if (b) b.click();
  }
  I.back = () => { const L = activeLayer(); if (L.kind === 'dom') back(L.el); };

  // ---------- Teclado (fase de captura: tiene prioridad sobre main.js) ----------
  const ARROWS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
  const WASD = { KeyW: [0, -1], KeyS: [0, 1], KeyA: [-1, 0], KeyD: [1, 0] };
  const consume = (e) => { e.preventDefault(); e.stopPropagation(); };
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const L = activeLayer();
    const g = V.game;
    if (L.kind === 'dom') {
      const d = ARROWS[e.code];
      if (d) { setMode('key'); navMove(L.el, d[0], d[1]); consume(e); return; }
      if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') {
        if (e.repeat) { consume(e); return; }
        setMode('key'); activate(L.el, e.code !== 'Space'); consume(e); return;
      }
      if (e.code === 'Escape' || e.code === 'Backspace') { back(L.el); consume(e); return; }
      if (e.code === 'Tab') setMode('key');
    } else if (L.kind === 'trans') {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter') { if (!e.repeat) g.advanceTrans(); consume(e); }
    } else if (L.kind === 'tree') {
      const d = ARROWS[e.code] || WASD[e.code];
      if (d) { setMode('key'); g.tree.move(d[0], d[1]); consume(e); return; }
      if (e.code === 'Enter' || e.code === 'NumpadEnter') { setMode('key'); g.tree.buy(); consume(e); return; }
      if (e.code === 'Escape') { g.goMenu(); consume(e); return; }
    }
  }, true);
  // Evita que Espacio/Enter "suelten" un clic nativo sobre el botón con foco (ya lo gestionamos en keydown).
  window.addEventListener('keyup', (e) => {
    if ((e.code === 'Space' || e.code === 'Enter') && activeLayer().kind === 'dom') e.preventDefault();
  }, true);

  // ---------- Mando ----------
  function pickPad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    let any = null;
    for (const p of pads) {
      if (!p || !p.connected) continue;
      if (p.mapping === 'standard') return p;
      any = any || p;
    }
    return any;
  }
  function styleFor(id) { return /054c|playstation|dualshock|dualsense|wireless controller/i.test(id || '') ? 'ps' : 'xbox'; }

  function onConnect(p) {
    I.connected = true; I.padId = p.id;
    I.padStyle = V.padStyle = styleFor(p.id);
    I.prev = p.buttons.map((b) => b.pressed); // no disparar con botones ya pulsados
    V.game && V.game.toast && V.game.toast(V.t('padOn'));
    V.bus.emit('input:pad', { connected: true, id: p.id });
  }
  function onDisconnect() {
    I.connected = false; I.stick = { x: 0, y: 0, mag: 0 }; I.prev = [];
    const g = V.game;
    if (g) {
      // si se desconecta durante una partida, pausar
      if (g.state === 'run' && !g.paused && g.pause) g.pause(true, V.t('padLost'));
      else g.toast && g.toast(V.t('padOff'));
    }
    if (I.mode === 'pad') setMode('mouse');
    V.bus.emit('input:pad', { connected: false });
  }
  window.addEventListener('gamepadconnected', () => { const p = pickPad(); if (p && !I.connected) onConnect(p); });
  window.addEventListener('gamepaddisconnected', () => { if (I.connected && !pickPad()) onDisconnect(); });

  // Vibración (si el mando y el navegador la soportan y el ajuste está activo)
  I.rumble = function (strong, weak, ms) {
    const g = V.game;
    if (!I.connected || I.mode !== 'pad' || !g || !g.save.settings.rumble) return;
    const p = pickPad(), act = p && p.vibrationActuator;
    if (act && act.playEffect) act.playEffect('dual-rumble', { duration: ms || 120, strongMagnitude: strong, weakMagnitude: weak }).catch(() => {});
  };
  V.bus.on('run:hit', () => I.rumble(0.7, 0.4, 160));
  V.bus.on('run:pulse', () => I.rumble(0.25, 0.5, 90));
  V.bus.on('run:milestone', () => I.rumble(0.3, 0.6, 260));
  V.bus.on('run:bossPhase', () => I.rumble(0.8, 0.8, 300));

  function readDir(now, s) {
    if (now[B.UP]) return [0, -1];
    if (now[B.DOWN]) return [0, 1];
    if (now[B.LEFT]) return [-1, 0];
    if (now[B.RIGHT]) return [1, 0];
    if (Math.abs(s.x) < NAV_DZ && Math.abs(s.y) < NAV_DZ) return null;
    return Math.abs(s.x) > Math.abs(s.y) ? [Math.sign(s.x), 0] : [0, Math.sign(s.y)];
  }

  function fireDir(L, d) {
    if (L.kind === 'dom') navMove(L.el, d[0], d[1]);
    else if (L.kind === 'tree') V.game.tree.move(d[0], d[1]);
  }

  function poll(dt) {
    const p = pickPad();
    if (!p) { if (I.connected) onDisconnect(); return; }
    if (!I.connected) onConnect(p);
    const now = [];
    for (let i = 0; i < 17; i++) { const b = p.buttons[i]; now[i] = !!(b && (b.pressed || b.value > 0.5)); }
    const prev = I.prev;
    const hit = (i) => now[i] && !prev[i]; // flanco de subida
    I.prev = now;

    // sticks con zona muerta radial reescalada
    const ax = p.axes[0] || 0, ay = p.axes[1] || 0, m = Math.hypot(ax, ay);
    if (m > DZ) { const k = Math.min(1, (m - DZ) / (1 - DZ)); I.stick = { x: (ax / m) * k, y: (ay / m) * k, mag: k }; }
    else I.stick = { x: 0, y: 0, mag: 0 };
    const rx = p.axes[2] || 0, ry = p.axes[3] || 0;
    I.rstick = { x: Math.abs(rx) > 0.2 ? rx : 0, y: Math.abs(ry) > 0.2 ? ry : 0 };

    let active = I.stick.mag > 0.3 || I.rstick.x || I.rstick.y;
    for (let i = 0; i < now.length; i++) if (hit(i)) active = true;
    if (active) setMode('pad');
    if (I.mode !== 'pad') { I.navKey = null; return; }

    const g = V.game;
    if (!g) return;
    const L = activeLayer();

    // repetición direccional (cruceta o stick)
    const d = readDir(now, I.stick);
    const key = d ? d.join(',') : null;
    if (key !== I.navKey) { I.navKey = key; I.navT = NAV_DELAY; if (d) fireDir(L, d); }
    else if (d) { I.navT -= dt; if (I.navT <= 0) { I.navT = NAV_REPEAT; fireDir(L, d); } }

    if (L.kind === 'dom') {
      const root = L.el;
      // al cambiar de pantalla, poner el foco en su botón por defecto
      const lk = root.id || 'dom';
      if (lk !== I.layerKey) { I.layerKey = lk; ensureFocus(root); }
      if (hit(B.A)) { V.Audio && V.Audio.ensure && V.Audio.ensure(); activate(root, false); }
      else if (hit(B.B)) back(root);
      else if (hit(B.START)) { if (root.id === 'pause') back(root); else activate(root, false); }
      else if (hit(B.X)) clickData(root, 'x');
      else if (hit(B.Y)) clickData(root, 'y');
    } else {
      I.layerKey = L.kind;
      if (L.kind === 'trans') {
        if (hit(B.A) || hit(B.B) || hit(B.X) || hit(B.START)) g.advanceTrans();
      } else if (L.kind === 'tree') {
        if (hit(B.A)) g.tree.buy();
        else if (hit(B.X) || hit(B.START)) g.requestRunFromTree();
        else if (hit(B.B)) g.goMenu();
        else if (hit(B.Y)) { const b = $('treeArchive'); b && b.click(); }
        else if (hit(B.SELECT)) { const b = $('treeStats'); b && b.click(); }
        if (now[B.LB] || now[B.LT]) g.tree.zoom(Math.exp(-dt * 1.6));
        if (now[B.RB] || now[B.RT]) g.tree.zoom(Math.exp(dt * 1.6));
        if (I.rstick.x || I.rstick.y) g.tree.pan(I.rstick.x * 700 * dt, I.rstick.y * 700 * dt);
      } else if (L.kind === 'cine') {
        // cinemática del final: A/B/X/START = avanzar (pulsación) o saltar (mantener)
        g.cinePad(!!(now[B.A] || now[B.B] || now[B.X] || now[B.START]));
      } else if (L.kind === 'run') {
        const run = g.run;
        if (run && !g.paused && g.state === 'run' && (hit(B.A) || hit(B.RT))) run.pulse();
        if (hit(B.START) || hit(B.SELECT)) g.pause(true);
      }
    }
  }

  // Dirección del agujero con el stick (main.js llama a esto en cada fotograma de la partida).
  // En modo mando: con el stick en reposo el agujero se detiene (no sigue al cursor olvidado).
  function setTarget(run) {
    if (I.mode !== 'pad' || !I.connected) return null;
    const s = I.stick;
    if (s.mag <= 0) return { tx: run.x, ty: run.y };
    // velocidad analógica: dist*5 = velocidad deseada (ver run.js), 112 = 560/5
    const reach = (s.mag * 118 * ((run.st && run.st.speed) || 1)) / run.zoom;
    return { tx: run.x + (s.x / s.mag) * reach, ty: run.y + (s.y / s.mag) * reach };
  }

  V.bus.on('boot', () => {
    V.game.setTarget = setTarget;
    const p = pickPad();
    if (p) { I.connected = true; I.padId = p.id; I.padStyle = V.padStyle = styleFor(p.id); I.prev = p.buttons.map((b) => b.pressed); }
  });
  V.bus.on('frame', (dt) => {
    poll(dt);
    // con teclado, mantener el foco dentro de la pantalla activa
    if (I.mode === 'key') {
      const L = activeLayer();
      if (L.kind === 'dom') { const lk = L.el.id || 'dom'; if (lk !== I.layerKey) { I.layerKey = lk; ensureFocus(L.el); } }
      else I.layerKey = L.kind;
    }
  });
})();
