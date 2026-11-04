// Orquestador: estados de juego, entrada, UI, historia y bucle principal.
(function () {
  const V = window.V;
  const T = V.t;
  const $ = (id) => document.getElementById(id);
  const cvs = $('c');
  const ctx = cvs.getContext('2d');
  let W = 0, H = 0, DPR = 1;

  // Ajustes de UX / accesibilidad y estadísticas extra (se fusionan con el guardado existente).
  V.Save.extendSettings({
    uiScale: null, // 80–140 (%); null = elegir según el dispositivo en el primer arranque
    transSize: 100, // 80–150 (%) tamaño del texto de las transmisiones
    colorblind: false, reduceFlash: false, showNumbers: true, rumble: true,
  });
  V.Save.extend({ totalMatter: 0, bestMatter: 0, totalBroken: 0, longestRun: 0, demoEndSeen: false, victoryRun: null });

  const save = V.Save.load();
  // Idioma inicial: el del sistema si hay paquete (código exacto o base, p. ej. 'pt' → 'pt-BR'); si no, inglés.
  if (!save.settings.lang) {
    const want = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    const low = want.toLowerCase(), base = low.split('-')[0];
    const codes = V.LANGS.map((l) => l[0]);
    save.settings.lang = codes.find((c) => c.toLowerCase() === low) || codes.find((c) => c.toLowerCase().split('-')[0] === base) || 'en';
  }
  if (save.settings.uiScale == null) save.settings.uiScale = isDeckLike() ? 120 : 100;
  V.setLang(save.settings.lang);

  let state = 'menu'; // menu | run | ending | results | tree | finale
  let paused = false;
  let run = null, demo = null;
  let time = 0, shake = 0, hurt = 0, banner = null, endT = 0, timeScale = 1;
  const bannerQ = [];
  let lastGain = 0;
  let isTouch = false, lastTap = 0;
  let demoEndPending = false;
  let prevCam = { x: 0, y: 0, z: 1 };
  const mouse = { x: 0, y: 0, moved: false, down: false, dragging: false, sx: 0, sy: 0, camx: 0, camy: 0 };
  const keys = {};

  // Steam Deck (1280x800) o similar: interfaz un poco más grande por defecto.
  function isDeckLike() {
    if (/Steam ?Deck|SteamOS/i.test(navigator.userAgent || '')) return true;
    const a = Math.max(screen.width, screen.height), b = Math.min(screen.width, screen.height);
    return a === 1280 && b === 800;
  }

  // ---------- Ajustes aplicados (variables globales para render.js y CSS) ----------
  function applySettings() {
    const s = save.settings;
    V.uiScale = V.clamp((+s.uiScale || 100) / 100, 0.8, 1.4);
    V.colorblind = !!s.colorblind;
    V.showNumbers = s.showNumbers !== false;
    V.reduceFlash = !!s.reduceFlash;
    const st = document.documentElement.style;
    st.setProperty('--ui', V.uiScale);
    st.setProperty('--tfs', V.clamp((+s.transSize || 100) / 100, 0.8, 1.5));
    document.documentElement.classList.toggle('cb', V.colorblind);
    document.documentElement.classList.toggle('rf', V.reduceFlash);
    V.bus.emit('settings:change', s);
  }
  applySettings();

  // ---------- UI ----------
  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach((el) => (el.innerHTML = V.tHTML(el.dataset.i18n)));
    // En la barra del árbol, el texto de cada botón va en un <span class="bt"> para poder ocultarlo
    // (dejando solo el glifo del mando) si la barra no cabe en una fila.
    document.querySelectorAll('#treebar button').forEach((b) => {
      for (const n of [...b.childNodes]) if (n.nodeType === 3 && n.textContent.trim()) { const s = document.createElement('span'); s.className = 'bt'; s.textContent = n.textContent; b.replaceChild(s, n); }
    });
    fitTreebar();
    document.documentElement.lang = V.lang;
    refreshPlayLabel();
    const c = V.CONFIG || {};
    $('verTag').textContent = 'v' + (c.version || '0') + (c.demo ? ' · DEMO' : '') + (c.build === 'dev' ? ' · dev' : '');
    if (state === 'tree') $('treeHint').classList.toggle('hidden', save.runs > 4 && V.inputMode !== 'pad');
  }
  function refreshPlayLabel() {
    const b = $('btnPlay');
    b.dataset.i18n = save.runs > 0 ? 'continue' : 'play';
    b.innerHTML = V.tHTML(b.dataset.i18n);
  }
  // Pantallas: todas las .screen hijas de #ui (incluidas las que crean otros módulos), salvo los overlays.
  function screenEls() { return document.querySelectorAll('#ui > .screen:not(.overlay)'); }
  // La barra del árbol debe caber en UNA fila (1280×800 con glifos de mando y textos un 30 % más largos):
  // se compacta por pasos y, solo si aun así no cabe (móvil), se permite una segunda fila.
  function fitTreebar() {
    const tb = $('treebar');
    if (!tb || tb.classList.contains('hidden')) return;
    tb.classList.remove('compact', 'tight', 'wrap');
    for (const c of ['compact', 'tight', 'wrap']) {
      if (tb.scrollWidth <= tb.clientWidth + 1) return;
      tb.classList.add(c);
    }
  }
  function show(id) {
    screenEls().forEach((el) => el.classList.toggle('hidden', el.id !== id));
    const tree = id === 'tree';
    $('treebar').classList.toggle('hidden', !tree);
    if (tree) fitTreebar();
    placeToast();
    $('treeHint').classList.toggle('hidden', !tree || (save.runs > 4 && V.inputMode !== 'pad'));
    if (!tree) $('tooltip').classList.add('hidden');
  }
  function anyScreenOpen() {
    if (!$('confirm').classList.contains('hidden')) return true;
    for (const el of screenEls()) if (!el.classList.contains('hidden')) return true;
    return false;
  }
  // Fundido breve a negro al cambiar de estado.
  function fade() {
    const f = $('fader');
    f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
  }
  function refreshTreebar() {
    $('tbMatter').textContent = '◆ ' + V.fmt(save.matter);
    $('tbRecord').textContent = T('m' + save.record);
    $('tbRecord').style.color = V.MILESTONES[save.record].color;
    fitTreebar();
  }
  function btn(id, fn) { $(id).addEventListener('click', (e) => { e.stopPropagation(); V.Audio.ensure(); V.Audio.click(); fn(e); }); }

  let toastT = null;
  // en el árbol, el aviso va debajo de la barra superior (si no, tapaba sus botones)
  function placeToast() {
    const t = $('toast'), tb = $('treebar');
    t.style.top = tb.classList.contains('hidden') ? '' : tb.offsetTop + tb.offsetHeight + 6 + 'px';
  }
  function toast(text, ms) {
    const t = $('toast');
    t.textContent = text; t.classList.remove('off');
    placeToast();
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.add('off'), ms || 2200);
  }

  // Texto localizado desde estructuras de otros módulos: string | {es, en} | [..] (elige uno al azar).
  function loc(v) {
    if (v == null) return null;
    if (typeof v === 'string') return v;
    if (Array.isArray(v)) return v.length ? loc(v[Math.floor(Math.random() * v.length)]) : null;
    if (typeof v === 'object') {
      if (v[V.lang] != null) return loc(v[V.lang]);
      if (V.lang !== 'es' && v.en != null) return loc(v.en);
      if (v.es != null) return loc(v.es);
      if (v.en != null) return loc(v.en);
      if (v.text != null) return loc(v.text);
    }
    return null;
  }
  const studio = () => (V.CONFIG && V.CONFIG.studio) || 'Voidling Team';

  // ---------- Confirmación genérica ----------
  let confirmCb = null;
  function confirmDialog(title, text, yesLabel, cb) {
    $('cfTitle').textContent = title;
    $('cfText').textContent = text || '';
    $('cfYes').textContent = yesLabel || T('confirm');
    confirmCb = cb;
    $('confirm').classList.remove('hidden');
  }
  btn('cfYes', () => { $('confirm').classList.add('hidden'); const c = confirmCb; confirmCb = null; c && c(); });
  btn('cfNo', () => { $('confirm').classList.add('hidden'); confirmCb = null; });

  // ---------- Transmisiones (historia) ----------
  // Color del emisor: LUMEN y Custodios salen de la paleta activa (cambian en modo daltónico).
  function fromCol(from) {
    const p = V.pal();
    return ({ lumen: p.lumen, varga: '#ffcf9e', custodians: p.custodians, void: '#ffffff' })[from] || '#ffffff';
  }
  // lock: segundos durante los que se ignora la entrada (al aparecer cada tarjeta y tras completar el
  // texto), para que encadenar partidas con ESPACIO no se salte la historia sin leerla.
  const TRANS_LOCK_OPEN = 0.6, TRANS_LOCK_FULL = 0.35, TRANS_LOCK_CLOSE = 0.45;
  const trans = { queue: [], cur: null, shown: 0, done: null, acc: 0, lock: 0, closedAt: -1 };
  function playTransmissions(list, done) {
    if (!list.length) { done && done(); return; }
    trans.queue = list.slice();
    trans.done = done;
    $('trans').classList.remove('hidden');
    $('tooltip').classList.add('hidden');
    nextTrans();
  }
  function nextTrans() {
    const e = trans.queue.shift();
    if (!e) {
      $('trans').classList.add('hidden');
      trans.cur = null; trans.closedAt = time;
      const d = trans.done; trans.done = null;
      d && d();
      return;
    }
    trans.cur = e; trans.shown = 0; trans.acc = 0; trans.lock = TRANS_LOCK_OPEN;
    $('tFrom').textContent = T('from_' + e.from);
    $('trans').style.setProperty('--tc', fromCol(e.from));
    $('tText').textContent = '';
  }
  function transText() { return trans.cur.text || V.Story.text(trans.cur); }
  // Se marca como leída cuando el texto completo está en pantalla (no al aparecer la tarjeta).
  function markSeen(e) {
    if (e && e.id && !save.seenLogs.includes(e.id)) { save.seenLogs.push(e.id); V.Save.save(); V.bus.emit('story:seen', e.id); }
  }
  function updateTrans(dt) {
    if (!trans.cur) return;
    if (trans.lock > 0) trans.lock -= dt;
    const full = transText();
    if (trans.shown >= full.length) return;
    trans.acc += dt * 60;
    const n = Math.floor(trans.acc);
    if (n > 0) {
      trans.acc -= n;
      trans.shown = Math.min(full.length, trans.shown + n);
      $('tText').textContent = full.slice(0, trans.shown);
      if (trans.shown >= full.length) { markSeen(trans.cur); trans.lock = Math.max(trans.lock, TRANS_LOCK_FULL); }
      if (Math.random() < 0.5) V.Audio.type();
    }
  }
  // Primer toque: muestra el texto completo. Segundo: siguiente transmisión.
  function advanceTrans() {
    if (!trans.cur || trans.lock > 0) return;
    const full = transText();
    if (trans.shown < full.length) { trans.shown = full.length; $('tText').textContent = full; markSeen(trans.cur); trans.lock = TRANS_LOCK_FULL; }
    else { V.Audio.click(); nextTrans(); }
  }
  $('trans').addEventListener('pointerdown', (e) => { e.stopPropagation(); advanceTrans(); });

  function openArchive() {
    const box = $('archList');
    box.innerHTML = '';
    for (const e of V.STORY) {
      if (!save.seenLogs.includes(e.id)) continue;
      const d = document.createElement('div');
      d.className = 'alog';
      d.style.setProperty('--tc', fromCol(e.from));
      const h = document.createElement('div'); h.className = 'afrom'; h.textContent = T('from_' + e.from);
      const p = document.createElement('div'); p.textContent = V.Story.text(e);
      d.append(h, p); box.append(d);
    }
    if (!box.children.length) { const d = document.createElement('div'); d.className = 'empty'; d.textContent = '—'; box.append(d); }
    show('archive');
    box.scrollTop = 0;
  }
  function backToTree() { show('tree'); refreshTreebar(); }

  // ---------- Estadísticas ----------
  let statsBack = 'menu';
  function openStats(from) {
    statsBack = from;
    let owned = 0, total = 0;
    for (const n of V.NODES) { if (n.id === 'core') continue; total += n.max; owned += Math.min(n.max, save.levels[n.id] || 0); }
    const logs = V.STORY.filter((e) => !e.post || save.victory);
    const read = save.seenLogs.filter((id) => logs.some((e) => e.id === id)).length;
    const rows = [
      [T('sRuns'), V.fmt(save.runs)],
      [T('sTime'), V.fmtTime(save.playTime)],
      [T('sEaten'), V.fmt(save.totalEaten)],
      [T('sBroken'), V.fmt(save.totalBroken || 0)],
      [T('sMatterTotal'), '◆ ' + V.fmt(save.totalMatter || 0)],
      [T('sBestRun'), '◆ ' + V.fmt(save.bestMatter || 0)],
      [T('sLongest'), V.fmtTime(save.longestRun || 0)],
      [T('sRecord'), T('m' + save.record), V.MILESTONES[save.record].color],
      [T('sLogs'), read + ' / ' + logs.length],
      [T('sUpgrades'), owned + ' / ' + total],
      [T('sCycle'), save.victory ? T('sDone') : T('sPending'), save.victory ? 'var(--good)' : null],
    ];
    const box = $('statsList');
    box.innerHTML = '';
    for (const [k, v, col] of rows) {
      const a = document.createElement('div'); a.className = 'k'; a.textContent = k;
      const b = document.createElement('div'); b.className = 'v'; b.textContent = v;
      if (col) b.style.color = col;
      box.append(a, b);
    }
    show('stats');
  }
  btn('btnStats', () => openStats('menu'));
  btn('treeStats', () => { if (!trans.cur) openStats('tree'); });
  btn('btnStatsBack', () => (statsBack === 'tree' ? backToTree() : show('menu')));

  // ---------- Créditos ----------
  let creditsBack = 'menu';
  function openCredits(from) {
    creditsBack = from;
    let data = V.CREDITS_TEXT;
    if (typeof data === 'function') { try { data = data(V.lang); } catch (e) { data = null; } }
    let text = loc(data) || T('creditsDefault');
    const st = studio();
    text = text.replace(/\[ESTUDIO\]|\{studio\}/g, st);
    // Sin nombres reales (V.CONFIG.creditNames), cada "ROL\n[NOMBRE]" repetía el estudio (×7): los roles
    // consecutivos se agrupan en una sola línea de encabezado y [NOMBRE] desaparece.
    const names = V.CONFIG && V.CONFIG.creditNames;
    if (names) text = text.replace(/\[NOMBRE\]/g, typeof names === 'string' ? names : st);
    else {
      const L = text.split('\n'), out = [];
      for (let i = 0; i < L.length; i++) {
        if (L[i + 1] != null && L[i + 1].trim() === '[NOMBRE]' && L[i].trim()) {
          const roles = [L[i].trim().replace(/^#\s*/, '')];
          i += 1;
          while (L[i + 1] != null && !L[i + 1].trim() && L[i + 3] != null && L[i + 3].trim() === '[NOMBRE]' && L[i + 2].trim()) { roles.push(L[i + 2].trim().replace(/^#\s*/, '')); i += 3; }
          out.push('# ' + roles.join(' · '));
        } else if (L[i].trim() !== '[NOMBRE]') out.push(L[i]);
      }
      text = out.join('\n');
    }
    const box = $('credList');
    box.innerHTML = '';
    text.split('\n').forEach((line, i) => {
      const d = document.createElement('div');
      let s = line.trim();
      // primera línea = título; encabezados de sección: líneas que empiezan por "# " (marcador explícito,
      // útil en chino/japonés, que no tienen mayúsculas) o líneas cortas en MAYÚSCULAS de cualquier alfabeto
      if (!s) d.className = 'sp';
      else if (/^#\s*/.test(s)) { s = s.replace(/^#\s*/, ''); d.className = i === 0 ? 'ct' : 'ch'; }
      else if (i === 0) d.className = 'ct';
      else if (s.length < 44 && s === s.toUpperCase() && /\p{Lu}/u.test(s) && s !== st.toUpperCase()) d.className = 'ch';
      else if (/^\S.*·/.test(s) && s === s.toUpperCase() && /\p{Lu}/u.test(s)) d.className = 'ch';
      else d.className = 'cl';
      d.textContent = s;
      box.append(d);
    });
    show('credits');
    box.scrollTop = 0;
  }
  btn('btnCredits', () => openCredits('menu'));
  btn('btnVictoryCredits', () => openCredits('victory'));
  btn('btnCredBack', () => show(creditsBack));

  // ---------- Fin de la demo ----------
  // Escala máxima de la demo (Infinity en el juego completo).
  function demoMax() {
    const c = V.CONFIG || {};
    if (!c.demo) return Infinity;
    return c.demoMaxMilestone != null ? c.demoMaxMilestone : V.FINAL_MILESTONE;
  }
  // La pantalla de fin de la demo sale la primera vez que se alcanza el tope y cada vez que una partida
  // choca contra él (antes salía tras CADA partida que llegaba a la escala 2: muy repetitivo).
  function demoEndDue(r) {
    const max = demoMax();
    if (max === Infinity) return false;
    return save.record >= max && (!save.demoEndSeen || !!(r && r.demoCapped));
  }
  // En la demo, cruzar la escala siguiente al tope termina la partida (antes se podía jugar el juego entero).
  function demoCap(r) {
    const max = demoMax();
    if (max === Infinity || r.over || r.milestone <= max) return;
    r.milestone = max; r.demoCapped = true; r.over = true;
    for (let i = r.events.length - 1; i >= 0; i--) if (r.events[i].t === 'milestone' && r.events[i].m > max) r.events.splice(i, 1);
    r.events.push({ t: 'end' });
  }
  function openDemoEnd() {
    demoEndPending = false;
    save.demoEndSeen = true; V.Save.save();
    const d = V.DEMO_END;
    const title = d && typeof d === 'object' && d.title ? loc(d.title) : null;
    $('demoTitle').textContent = title || T('demoTitle');
    $('demoText').textContent = (d && typeof d === 'object' && d.text ? loc(d.text) : loc(d)) || T('demoText');
    state = 'results'; run = null;
    show('demoEnd');
    V.bus.emit('demo:end');
  }
  btn('btnWishlist', () => {
    const P = V.Platform || {};
    let ok = false;
    if (typeof P.openStore === 'function') { try { ok = P.openStore() !== false; } catch (e) { ok = false; } }
    else if (V.CONFIG && V.CONFIG.storeUrl) { try { window.open(V.CONFIG.storeUrl, '_blank', 'noopener'); ok = true; } catch (e) { ok = false; } }
    if (!ok) toast(T('storeSoon'));
  });
  btn('btnDemoKeep', () => goTree());
  btn('btnDemoMenu', () => goMenu());

  // ---------- Flujo ----------
  function makeDemo() {
    const st = V.computeStats({ core: 1 });
    st.eatRatio = 0.9; st.density = 1.3; st.startR = 10; st.pullRange = 3.6;
    demo = new V.Run(st, { vw: W, vh: H, demo: true });
  }

  function goMenu() {
    V.bus.emit('menu:open');
    fade();
    if (V.Cine) V.Cine.stop();
    state = 'menu'; paused = false; run = null;
    if (!demo) makeDemo();
    show('menu');
    refreshPlayLabel();
    V.Audio.intensity(0.2);
  }

  // Nodo comprable más barato mientras el jugador no haya comprado nada (guía de la primera mejora).
  function updateGuide() {
    const bought = V.NODES.some((n) => n.id !== 'core' && (save.levels[n.id] || 0) > 0);
    let best = null, bc = Infinity;
    if (!bought) {
      for (const n of V.NODES) {
        if (n.id === 'core' || !V.isVisible(n, save.levels) || !V.isUnlocked(n, save.record)) continue;
        const l = save.levels[n.id] || 0;
        if (l >= n.max) continue;
        const c = V.cost(n, l);
        if (c < bc) { bc = c; best = n; }
      }
      if (best && save.matter < bc) best = null;
    }
    V.Tree.guide = best;
    return best;
  }

  // Márgenes del árbol: barra superior y caja de ayuda inferior (para no dejar nodos debajo).
  function treeInsets() {
    const tb = $('treebar'), hint = $('treeHint');
    return { top: tb.classList.contains('hidden') ? 70 : tb.offsetTop + tb.offsetHeight + 8, bottom: hint.classList.contains('hidden') ? 24 : hint.offsetHeight + 34 };
  }
  function goTree(afterStory) {
    fade();
    if (V.Cine) V.Cine.stop();
    state = 'tree'; run = null; paused = false;
    show('tree');
    refreshTreebar();
    V.Tree.fit(W, H, save.levels, treeInsets());
    const g = updateGuide();
    if (!V.Tree.sel || !V.isVisible(V.Tree.sel, save.levels)) V.Tree.sel = g || V.NODE.core;
    else if (g) V.Tree.sel = g;
    V.bus.emit('tree:open');
    V.Audio.intensity(0.1);
    const p = V.Story.pending(save);
    if (p.length) playTransmissions(p, afterStory);
  }

  function requestRun() {
    if (V.Platform.sdk && save.runs >= 3 && save.runs % 3 === 0) V.Platform.midgameAd(startRun);
    else startRun();
  }
  // (tras cerrar la última transmisión, un instante sin aceptar "iniciar": la tecla que la cerró no arranca la partida)
  function requestRunFromTree() { if (state === 'tree' && !trans.cur && !anyScreenOpen() && time - trans.closedAt > TRANS_LOCK_CLOSE) requestRun(); }

  function startRun() {
    V.Audio.ensure();
    fade();
    show(null);
    $('treebar').classList.add('hidden');
    const stats = V.computeStats(save.levels);
    run = new V.Run(stats, { vw: W, vh: H });
    state = 'run'; paused = false; timeScale = 1; banner = null; bannerQ.length = 0; hurt = 0;
    prevCam = { x: run.x, y: run.y, z: run.zoom };
    camReset(run);
    V.Platform.gameplayStart();
    V.Audio.intensity(0.55);
    V.bus.emit('run:start', run);
  }

  // opts.toMenu: la partida se cerró desde la pausa ("Salir al menú"): se suma la materia y se vuelve al menú.
  function finishRun(opts) {
    opts = opts || {};
    const r = run;
    if (!r) return;
    V.Platform.gameplayStop();
    const gain = Math.floor(r.matter);
    lastGain = gain;
    save.matter += gain;
    save.runs++;
    save.totalEaten += r.eaten;
    save.totalBroken = (save.totalBroken || 0) + (r.broken || 0);
    save.totalMatter = (save.totalMatter || 0) + gain;
    save.bestMatter = Math.max(save.bestMatter || 0, gain);
    save.longestRun = Math.max(save.longestRun || 0, r.t || 0);
    const oldRecord = save.record;
    const reached = Math.min(r.milestone, demoMax());
    if (reached > save.record) {
      for (let k = save.record + 1; k <= reached; k++) save.recordRun[k] = save.runs;
      save.record = reached;
    }
    V.Save.save();
    V.bus.emit('run:end', { run: r, gain, oldRecord });
    if (demoEndDue(r)) demoEndPending = true;
    if (r.demoCapped) { openDemoEnd(); return; }

    if (r.victory) {
      const first = !save.victory;
      save.victory = true;
      if (first) save.victoryRun = save.runs; // las transmisiones post-final cuentan partidas desde aquí
      V.Save.save();
      V.bus.emit('victory', { first });
      startFinale(first);
      return;
    }
    if (opts.toMenu) {
      if (demoEndPending) openDemoEnd(); else goMenu();
      return;
    }
    // resultados
    $('resStats').innerHTML = '';
    const rows = [
      [T('rMatter'), '◆ ' + V.fmt(gain), true],
      [T('rEaten'), V.fmt(r.eaten)],
      [T('rBroken'), V.fmt(r.broken)],
      [T('rScale'), T('m' + r.milestone)],
      [T('rTime'), V.fmtTime(r.t)],
    ];
    for (const [k, v, big] of rows) {
      const a = document.createElement('div'); a.className = 'k'; a.textContent = k;
      const b = document.createElement('div'); b.className = 'v' + (big ? ' big' : ''); b.textContent = v;
      $('resStats').append(a, b);
    }
    const badge = $('resBadge');
    if (r.milestone > oldRecord) { badge.textContent = T('newRecord') + ': ' + T('m' + r.milestone).toUpperCase(); badge.classList.remove('hidden'); }
    else badge.classList.add('hidden');
    const dbl = $('btnDouble');
    dbl.classList.toggle('hidden', !V.Platform.hasRewarded || gain < 10);
    dbl.disabled = false; dbl.textContent = T('double');
    state = 'results';
    show('results');
  }

  // El final es una cinemática en el canvas (js/finale.js): colapso, silencio, Big Bang y epílogo.
  // El bus 'victory' (logro y Big Bang de audio.js) se emite justo en el Big Bang, no al derrotar al Núcleo.
  function startFinale(first) {
    state = 'finale';
    let bang = false;
    const onBang = () => {
      if (bang) return;
      bang = true;
      V.bus.emit('victory', { first });
      addShake(V.reduceFlash ? 6 : 26);
    };
    const go = () => {
      if (!bang) onBang();
      $('victoryStats').textContent = T('victoryStats').replace('{runs}', save.runs).replace('{time}', V.fmtTime(save.playTime));
      show('victory');
    };
    // Capítulos que el jugador aún no leyó (si ganó muy rápido): van antes del final, en orden cronológico.
    // Los que ya no tienen sentido tras la victoria (c5c "EL NÚCLEO ESPERA", alertas de los Custodios) se
    // archivan como leídos sin mostrarse. Nunca las post-final (V.STORY_POST).
    let preRoll = null;
    if (first && V.Story.finaleMissed) {
      const m = V.Story.finaleMissed(save);
      for (const e of m.skip) if (!save.seenLogs.includes(e.id)) save.seenLogs.push(e.id);
      if (m.skip.length) V.Save.save();
      if (m.show.length) preRoll = (resume) => playTransmissions(m.show, resume);
    }
    V.Cine.start({ run, z: cam.z * camPop(), first, preRoll, onBang, onDone: go });
  }

  function setPaused(p, note) {
    if (state !== 'run' || !run) return;
    paused = !!p;
    show(paused ? 'pause' : null);
    const n = $('pauseNote');
    n.textContent = note || '';
    n.classList.toggle('hidden', !note);
  }

  // Después de los resultados: si toca, primero la pantalla de fin de la demo.
  function afterResults(next) { if (demoEndPending) openDemoEnd(); else next(); }
  function retry() { afterResults(() => requestRun()); }

  // ---------- Botones ----------
  btn('btnPlay', () => {
    V.Audio.ensure();
    if (save.runs === 0) {
      fade();
      show(null);
      state = 'menu';
      playTransmissions(V.Story.pending(save), startRun);
    } else goTree();
  });
  let settingsBack = 'menu';
  btn('btnSettings', () => { settingsBack = 'menu'; openSettings(); });
  btn('btnPauseSettings', () => { settingsBack = 'pause'; openSettings(); });
  btn('btnFull', () => {
    if (V.Platform.toggleFullscreen && V.Platform.toggleFullscreen()) return;
    const el = document.documentElement;
    if (!document.fullscreenElement) (el.requestFullscreen || el.webkitRequestFullscreen || (() => {})).call(el);
    else document.exitFullscreen();
  });
  // Botones de plataforma: SALIR solo en escritorio (en Steam Deck no hay Alt+F4); VER EN STEAM solo en web.
  function refreshPlatformButtons() {
    const P = V.Platform || {};
    $('btnQuit').classList.toggle('hidden', !(P.isDesktop && typeof P.quit === 'function'));
    $('btnStore').classList.toggle('hidden', !(P.canOpenStore && !P.isDesktop && typeof P.openStore === 'function'));
  }
  btn('btnQuit', () => { V.Save.save(); V.Platform.quit && V.Platform.quit(); });
  btn('btnStore', () => { if (V.Platform.openStore && V.Platform.openStore() === false) toast(T('storeSoon')); });
  btn('btnUpgrade', () => afterResults(() => goTree()));
  btn('btnRetry', () => retry());
  btn('btnDouble', () => {
    const b = $('btnDouble'); b.disabled = true;
    V.Platform.rewardedAd(() => { save.matter += lastGain; save.totalMatter = (save.totalMatter || 0) + lastGain; V.Save.save(); b.textContent = T('doubled'); }, () => { b.disabled = false; });
  });
  btn('treeStart', () => requestRunFromTree());
  btn('treeMenu', () => { if (!trans.cur) goMenu(); });
  btn('treeArchive', () => { if (!trans.cur) openArchive(); });
  btn('btnArchBack', () => backToTree());
  btn('btnResume', () => setPaused(false));
  btn('btnAbandon', () => { setPaused(false); run.stab = 0; run.st.revive = 0; });
  btn('btnQuitMenu', () => {
    confirmDialog(T('confirmQuit'), T('confirmQuitSub'), T('quitMenu'), () => {
      if (state !== 'run' || !run) return;
      paused = false; show(null);
      finishRun({ toMenu: true });
    });
  });
  btn('btnVictory', () => goTree());

  // ---------- Ajustes ----------
  function buildLangSelect() {
    const sel = $('setLang');
    sel.innerHTML = '';
    for (const [code, name] of V.LANGS || [['es', 'Español'], ['en', 'English']]) {
      const o = document.createElement('option'); o.value = code; o.textContent = name; sel.append(o);
    }
  }
  function syncSettingsUI() {
    const s = save.settings;
    $('setMusic').value = s.music; $('outMusic').textContent = Math.round(s.music * 100) + '%';
    $('setSfx').value = s.sfx; $('outSfx').textContent = Math.round(s.sfx * 100) + '%';
    $('setShake').checked = !!s.shake;
    $('setFlash').checked = !!s.reduceFlash;
    $('setNumbers').checked = s.showNumbers !== false;
    $('setColorblind').checked = !!s.colorblind;
    $('setRumble').checked = s.rumble !== false;
    $('setUiScale').value = s.uiScale; $('outUiScale').textContent = s.uiScale + '%';
    $('setTransSize').value = s.transSize; $('outTransSize').textContent = s.transSize + '%';
    $('setLang').value = V.lang;
  }
  function openSettings() {
    buildLangSelect();
    syncSettingsUI();
    $('btnReset').dataset.armed = '';
    $('btnReset').textContent = T('reset');
    $('btnReset').classList.toggle('hidden', settingsBack === 'pause');
    show('settings');
  }
  const setChange = (id, ev, fn) => $(id).addEventListener(ev, (e) => { fn(e.target); applySettings(); syncSettingsUI(); V.Save.save(); });
  setChange('setMusic', 'input', (el) => { save.settings.music = +el.value; V.Audio.setVol(save.settings.music, save.settings.sfx); });
  setChange('setSfx', 'input', (el) => { save.settings.sfx = +el.value; V.Audio.setVol(save.settings.music, save.settings.sfx); V.Audio.click(); });
  setChange('setShake', 'change', (el) => { save.settings.shake = el.checked; if (!el.checked) shake = 0; });
  setChange('setFlash', 'change', (el) => { save.settings.reduceFlash = el.checked; });
  setChange('setNumbers', 'change', (el) => { save.settings.showNumbers = el.checked; });
  setChange('setColorblind', 'change', (el) => { save.settings.colorblind = el.checked; });
  setChange('setRumble', 'change', (el) => { save.settings.rumble = el.checked; if (el.checked && V.Input) V.Input.rumble(0.4, 0.4, 120); });
  // la escala se aplica al soltar (change) para que el control no "salte" bajo el ratón mientras se arrastra
  $('setUiScale').addEventListener('input', (e) => { $('outUiScale').textContent = e.target.value + '%'; });
  $('setUiScale').addEventListener('change', (e) => { save.settings.uiScale = +e.target.value; applySettings(); V.Save.save(); requestAnimationFrame(() => e.target.scrollIntoView && e.target.scrollIntoView({ block: 'nearest' })); });
  setChange('setTransSize', 'input', (el) => { save.settings.transSize = +el.value; });
  setChange('setLang', 'change', (el) => { save.settings.lang = el.value; V.setLang(el.value); applyI18n(); if (state === 'tree') refreshTreebar(); });
  btn('btnReset', () => {
    const b = $('btnReset');
    if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = T('resetConfirm'); return; }
    // se borra el progreso pero se conservan los ajustes (volumen, accesibilidad, idioma)
    const fresh = V.Save.reset(save.settings);
    Object.keys(save).forEach((k) => delete save[k]);
    Object.assign(save, fresh);
    V.Save.data = save; V.Save.save();
    if (V.Story.sync) V.Story.sync(save); // retira las transmisiones post-final del archivo
    V.Tree.sel = null; V.Tree.guide = null;
    demoEndPending = false;
    goMenu();
  });
  btn('btnSetBack', () => { if (settingsBack === 'pause' && state === 'run') show('pause'); else { show('menu'); refreshPlayLabel(); } });

  // ---------- Banners de eventos de la partida ----------
  // Texto de V.EVENT_LINES (narrativa) si existe; si no, uno por defecto. pulsar/swarm/boss: solo la primera vez por partida.
  const evSeen = {};
  V.bus.on('run:start', () => { for (const k in evSeen) delete evSeen[k]; });
  function evLine(key) {
    if (V.Story && typeof V.Story.event === 'function') { const s = V.Story.event(key); if (s) return s; }
    return loc(V.EVENT_LINES && V.EVENT_LINES[key]);
  }
  function evColor(key, fallback) {
    const e = V.EVENT_LINES && V.EVENT_LINES[key];
    const p = V.pal();
    if (e && e.from === 'custodians') return p.custodians;
    if (e && e.from === 'lumen') return p.lumen;
    return fallback;
  }
  function eventBanner(key, text, small, color, dur) {
    queueBanner({ text, small, sub: evLine(key) || T('ev_' + key + 'Sub'), color: evColor(key, color), dur: dur || 3.6 });
  }
  const once = (k) => (evSeen[k] ? false : (evSeen[k] = true));
  V.bus.on('run:pulsar', () => { if (once('pulsar')) eventBanner('pulsar', T('evPulsar'), T('evThreat'), V.pal().pulsar); });
  V.bus.on('run:swarm', () => { if (once('swarm')) eventBanner('swarm', T('evSwarm'), T('evThreat'), V.pal().swarm); });
  V.bus.on('run:boss', () => { if (once('boss')) eventBanner('boss', T('evBoss'), T('evBossSmall'), V.pal().boss, 4.6); });
  V.bus.on('run:bossPhase', (e) => {
    const ph = (e && e.phase) || 2;
    if (once('bossPhase' + ph)) eventBanner('bossPhase' + ph, T('evPhase').replace('{n}', ph), T('evBoss'), V.pal().boss, 3.4);
  });
  V.bus.on('run:bossDefeat', () => { if (once('bossDefeat')) eventBanner('bossDefeat', T('evBossDefeat'), T('evBoss'), V.pal().boss, 4.6); });
  // Si hay un banner importante en pantalla (p. ej. nueva escala), el siguiente espera su turno.
  function queueBanner(b) {
    const nb = Object.assign({ t: 0, dur: 3 }, b);
    if (banner && banner.t < banner.dur * 0.55 && bannerQ.length < 4) bannerQ.push(nb);
    else banner = nb;
  }

  // ---------- Entrada ----------
  function resize() {
    // Ventana minimizada (0×0 en algunos sistemas): no tocar nada; un tamaño 0 dejaba el zoom en 0 → NaN.
    if (window.innerWidth < 2 || window.innerHeight < 2) return;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cvs.width = Math.round(W * DPR); cvs.height = Math.round(H * DPR);
    V.Render.dpr = DPR;
    cvs.style.width = W + 'px'; cvs.style.height = H + 'px';
    if (run) { run.vw = W; run.vh = H; }
    if (demo) { demo.vw = W; demo.vh = H; }
    fitTreebar();
  }
  window.addEventListener('resize', resize);

  // (input.js intercepta antes, en fase de captura, las teclas de navegación de menús, árbol y transmisiones)
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    // Cinemática del final: pulsar = avanzar, mantener = saltar, Esc = saltar ya
    if (state === 'finale' && V.Cine.active && !trans.cur && !anyScreenOpen()) {
      if (e.code === 'Escape') { e.preventDefault(); V.Cine.skip(); return; }
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter') { e.preventDefault(); if (!e.repeat) V.Cine.press(); return; }
    }
    if (e.code === 'Space') {
      e.preventDefault();
      if (trans.cur) { advanceTrans(); return; }
      if (state === 'run' && !paused) run.pulse();
      else if (state === 'tree') requestRunFromTree();
    }
    if (e.code === 'KeyR' && state === 'results' && !$('results').classList.contains('hidden') && !anyOverlay()) { e.preventDefault(); retry(); }
    if (e.code === 'Escape' && state === 'run' && !paused) setPaused(true);
  });
  function anyOverlay() { return !$('confirm').classList.contains('hidden') || !!trans.cur; }
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    if ((e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter') && V.Cine.active) V.Cine.release();
  });
  window.addEventListener('pointercancel', () => { if (V.Cine.active) V.Cine.release(); });
  window.addEventListener('blur', () => { if (state === 'run' && !paused) setPaused(true); for (const k in keys) keys[k] = false; });
  // Pestaña en segundo plano: el audio se suspende y la partida se pausa (el blur no siempre llega).
  document.addEventListener('visibilitychange', () => {
    V.Audio.suspend(document.hidden);
    if (document.hidden && state === 'run' && !paused) setPaused(true);
    last = performance.now();
  });
  cvs.addEventListener('contextmenu', (e) => { e.preventDefault(); if (state === 'run' && run && !paused) run.pulse(); });

  cvs.addEventListener('pointerdown', (e) => {
    V.Audio.ensure();
    isTouch = e.pointerType === 'touch';
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.moved = true;
    if (e.button === 2) return;
    if (state === 'finale' && V.Cine.active && !trans.cur) V.Cine.press();
    mouse.down = true; mouse.dragging = false;
    mouse.sx = e.clientX; mouse.sy = e.clientY; mouse.camx = V.Tree.cam.x; mouse.camy = V.Tree.cam.y;
    if (state === 'run' && isTouch && !paused) {
      const now = performance.now();
      if (now - lastTap < 300) run.pulse();
      lastTap = now;
    }
  });
  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.moved = true;
    if (state === 'tree' && mouse.down) {
      if (Math.hypot(e.clientX - mouse.sx, e.clientY - mouse.sy) > 6) mouse.dragging = true;
      if (mouse.dragging) {
        V.Tree.camGoal = null;
        V.Tree.cam.x = mouse.camx - (e.clientX - mouse.sx) / V.Tree.cam.z;
        V.Tree.cam.y = mouse.camy - (e.clientY - mouse.sy) / V.Tree.cam.z;
      }
    }
  });
  window.addEventListener('pointerup', (e) => {
    if (V.Cine.active) V.Cine.release();
    if (state === 'tree' && mouse.down && !mouse.dragging && e.target === cvs && !trans.cur && !anyScreenOpen()) {
      const nd = V.Tree.pick(e.clientX, e.clientY, W, H, save.levels);
      if (nd) {
        if (e.pointerType === 'touch' && V.Tree.sel !== nd) { V.Tree.sel = nd; V.Audio.click(); updateTooltip(true); }
        else { V.Tree.sel = nd; tryBuy(nd); }
      }
    }
    mouse.down = false; mouse.dragging = false;
  });
  cvs.addEventListener('wheel', (e) => {
    if (state !== 'tree') return;
    e.preventDefault();
    const before = V.Tree.toWorld(e.clientX, e.clientY, W, H);
    V.Tree.cam.z = V.clamp(V.Tree.cam.z * Math.exp(-e.deltaY * 0.0012), 0.35, 2);
    const after = V.Tree.toWorld(e.clientX, e.clientY, W, H);
    V.Tree.cam.x += before.x - after.x; V.Tree.cam.y += before.y - after.y;
    if (V.Tree.camGoal) V.Tree.camGoal = null;
  }, { passive: false });

  function tryBuy(nd) {
    const l = save.levels[nd.id] || 0;
    if (nd.id === 'core' || l >= nd.max || !V.isUnlocked(nd, save.record)) { V.Audio.deny(); return; }
    const c = V.cost(nd, l);
    if (save.matter < c) { V.Audio.deny(); return; }
    save.matter -= c;
    save.levels[nd.id] = l + 1;
    V.Save.save();
    // primera compra de un nodo: aparecen sus hijos → reencuadre suave si quedan bajo las barras
    if (l === 0 && V.NODES.some((n) => n.p === nd.id)) V.Tree.refit(W, H, save.levels, treeInsets(), true);
    V.Audio.buy();
    V.Tree.burst(nd);
    V.bus.emit('buy', { node: nd, level: l + 1 });
    refreshTreebar();
    updateGuide();
    updateTooltip(true);
  }

  // API del árbol para mando / teclado (input.js)
  const treeApi = {
    move(dx, dy) {
      if (state !== 'tree' || trans.cur || anyScreenOpen()) return;
      const nd = V.Tree.moveSel(dx, dy, save.levels, W, H);
      if (nd) V.Audio.click();
      updateTooltip(true);
    },
    buy() {
      if (state !== 'tree' || trans.cur || anyScreenOpen()) return;
      if (V.Tree.sel) tryBuy(V.Tree.sel);
    },
    zoom(f) { if (state === 'tree') V.Tree.cam.z = V.clamp(V.Tree.cam.z * f, 0.35, 2); },
    pan(dx, dy) { if (state !== 'tree') return; V.Tree.camGoal = null; V.Tree.cam.x += dx / V.Tree.cam.z; V.Tree.cam.y += dy / V.Tree.cam.z; },
  };

  let tipNode = null;
  function updateTooltip(force) {
    const tip = $('tooltip');
    // mando, teclado y táctil: el tooltip sigue al nodo seleccionado (en táctil no hay "pasar por encima")
    const nav = V.inputMode === 'pad' || V.inputMode === 'key' || V.inputMode === 'touch';
    if (state !== 'tree' || trans.cur || mouse.dragging || anyScreenOpen()) { tip.classList.add('hidden'); V.Tree.hover = null; tipNode = null; return; }
    const nd = nav ? V.Tree.sel : V.Tree.pick(mouse.x, mouse.y, W, H, save.levels);
    V.Tree.hover = nav ? null : nd;
    if (nd !== tipNode || force) {
      tipNode = nd;
      if (!nd) { tip.classList.add('hidden'); cvs.style.cursor = 'grab'; return; }
      cvs.style.cursor = 'pointer';
      const l = save.levels[nd.id] || 0;
      const col = V.BRANCHES[nd.b].color;
      let h = '<div class="tn" style="color:' + col + '">' + V.nodeName(nd.id) + '</div>';
      h += '<div class="tb">' + T('b_' + nd.b) + '</div>';
      h += '<div class="td">' + V.nodeDesc(nd.id) + '</div>';
      if (nd.id !== 'core') {
        h += '<div class="tl"><span>' + T('level') + '</span><b>' + l + ' / ' + nd.max + '</b></div>';
        const nxt = l < nd.max ? ' → <b>' + V.fxText(nd, l + 1) + '</b>' : '';
        h += '<div class="tl"><span>' + T('effect') + '</span><span><b>' + V.fxText(nd, l) + '</b>' + nxt + '</span></div>';
        if (!V.isUnlocked(nd, save.record)) h += '<div class="cost lock">🔒 ' + T('requires') + ': ' + T('m' + nd.req) + '</div>';
        else if (l >= nd.max) h += '<div class="cost ok">' + T('maxed') + '</div>';
        else {
          const c = V.cost(nd, l);
          const ok = save.matter >= c;
          h += '<div class="cost ' + (ok ? 'ok' : 'no') + '">◆ ' + V.fmt(c) + '</div>';
          if (ok && V.inputMode === 'pad') h += '<div class="tk">' + V.tHTML('tipBuy') + '</div>';
          else if (ok && V.inputMode === 'touch') h += '<div class="tk">' + V.tHTML('tipBuyTouch') + '</div>';
        }
      }
      tip.innerHTML = h;
      tip.classList.remove('hidden');
    }
    if (nd) {
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      let x, y;
      if (nav) {
        // junto al nodo seleccionado (a la derecha, o a la izquierda si no cabe)
        const p = V.Tree.screenPos(nd, W, H), r = V.Tree.radius() + 18;
        x = p.x + r; y = p.y - th / 2;
        if (x + tw > W - 8) x = p.x - r - tw;
      } else {
        x = mouse.x + 18; y = mouse.y + 18;
        if (x + tw > W - 8) x = mouse.x - tw - 18;
      }
      const top = $('treebar').offsetHeight + 4;
      y = V.clamp(y, top, H - th - 8);
      tip.style.left = Math.max(8, Math.min(x, W - tw - 8)) + 'px'; tip.style.top = Math.max(8, y) + 'px';
    }
  }

  // ---------- Eventos de la run ----------
  function handleEvents(r) {
    for (const e of r.events) {
      // El evento interno 'end' (te evaporaste) se publica como 'run:over': 'run:end' es el de finishRun
      // ({ run, gain, oldRecord }) y antes ambos llegaban con el mismo nombre a los oyentes.
      V.bus.emit(e.t === 'end' ? 'run:over' : 'run:' + e.t, e);
      switch (e.t) {
        case 'eat': V.Audio.eat(e.rel, e.chain, e.gold); break;
        case 'break': V.Audio.brk(e.rel); addShake(4 + e.rel * 4); break;
        case 'hit': V.Audio.hit(); if (e.src === 'star') { addShake(6); hurt = Math.max(hurt, 0.6); } else { addShake(14); hurt = 1; } break;
        case 'ring': addShake(10); hurt = Math.max(hurt, 0.8); break;
        case 'bossPhase': addShake(16); break;
        case 'bossWave': addShake(10); break;
        case 'bossDefeat': addShake(30); break;
        case 'pulse': V.Audio.pulse(); addShake(6); break;
        case 'revive': V.Audio.revive(); banner = { text: T('revive'), color: V.pal().good, t: 0, dur: 2.2 }; break;
        case 'milestone': {
          V.Audio.milestone();
          const first = e.m > save.record;
          const lines = V.MILESTONE_LINES && (V.MILESTONE_LINES[V.lang] || (V.lang !== 'es' && V.MILESTONE_LINES.en) || V.MILESTONE_LINES.es);
          banner = { text: T('m' + e.m).toUpperCase(), small: T('newScale'), sub: first && lines ? lines[e.m] : null, color: V.MILESTONES[e.m].color, t: 0, dur: first ? 4 : 2.6 };
          addShake(8);
          break;
        }
        case 'end': V.Audio.end(); break;
        case 'victory': addShake(30); break;
      }
    }
    r.events.length = 0;
  }
  function addShake(v) { if (save.settings.shake) shake = Math.min(V.reduceFlash ? 12 : 30, shake + v); }

  // ---------- Bucle ----------
  let last = performance.now();
  function frame(now) {
    // El primer timestamp de rAF puede ser anterior a 'last' (dt negativo): se acota a [0, 0.05].
    const dt = V.clamp((now - last) / 1000, 0, 0.05);
    last = now;
    time += dt;
    update(dt);
    draw(dt);
    requestAnimationFrame(frame);
  }

  // ---------- Cámara de render (QA H-33: "crecer" se ve en ti, no solo en el mundo) ----------
  // La simulación usa run.zoom (zona de aparición, densidad y balance: sin cambios). Aquí solo se decide
  // con qué zoom se DIBUJA: al crecer, la cámara se queda quieta y el agujero engorda en pantalla (hasta
  // ~1,45× su tamaño nominal); cuando dejas de crecer un momento —o te pasas— la cámara "respira" hacia atrás
  // con suavidad. Al cruzar una escala, alejamiento marcado con un pequeño rebote (pop).
  const CAM_QMAX = 1.42, CAM_QHARD = 1.6, CAM_CALM = 2.2;
  const cam = { z: 1, calm: 0, breath: false, lastR: 1, popT: 99, reveal: null, cx: 0, cy: 0 };
  function camReset(r) { Object.assign(cam, { z: r.zoom, calm: 0, breath: false, lastR: r.r, popT: 99, reveal: null, cx: r.x, cy: r.y }); }
  const sm01 = (x) => { x = V.clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  function camPop() {
    const t = cam.popT;
    if (t > 6) return 1;
    const env = t < 0.32 ? sm01(t / 0.32) : Math.exp(-(t - 0.32) * 1.25);
    return 1 - 0.1 * env * (V.reduceMotion ? 0.4 : 1);
  }
  function camUpdate(r, dt) {
    const zn = r.zoom;
    // "calma": segundos sin crecer (cada bocado la reinicia)
    if (r.r > cam.lastR * 1.01) { cam.calm = 0; cam.lastR = r.r; } else cam.calm += dt;
    if (cam.z > zn * CAM_QHARD) cam.z = zn * CAM_QHARD; // un bocado enorme no deja el agujero gigante
    const q = cam.z / zn;
    if (q <= 1) { cam.z = zn; cam.breath = false; }
    else {
      if (!cam.breath && ((q > 1.04 && cam.calm > CAM_CALM) || q > CAM_QMAX)) cam.breath = true;
      if (cam.breath) {
        cam.z += (zn - cam.z) * (1 - Math.exp(-dt * 1.7));
        if (cam.z / zn < 1.003) { cam.z = zn; cam.breath = false; }
      }
    }
    cam.popT += dt;
    // Entrada del Núcleo: ~2 s de cámara sobre él (a cámara lenta) y vuelta al agujero.
    if (cam.reveal) {
      const t = (cam.reveal.t += dt), b = r.boss;
      if (!b || b.dead || t > 2.6) cam.reveal = null;
      else {
        const k = t < 0.55 ? sm01(t / 0.55) : t < 1.95 ? 1 : 1 - sm01((t - 1.95) / 0.65);
        cam.reveal.k = k;
        cam.cx = V.lerp(r.x, b.x, 0.82 * k); cam.cy = V.lerp(r.y, b.y, 0.82 * k);
        return;
      }
    }
    cam.cx = r.x; cam.cy = r.y;
  }
  const revealK = () => (cam.reveal ? cam.reveal.k || 0 : 0);
  // zoom con el que se dibuja (incluye el pop de escala y el leve alejamiento de la entrada del jefe)
  const camZoom = () => cam.z * camPop() * (1 - 0.16 * revealK());
  V.bus.on('run:boss', () => { if (state === 'run' && run && !run.demo) cam.reveal = { t: 0, k: 0 }; });
  V.bus.on('run:milestone', () => { cam.breath = true; cam.popT = 0; });

  function steer(r) {
    if (cam.reveal) { r.tx = r.x; r.ty = r.y; return; } // durante la presentación del Núcleo
    if (V.game.setTarget) { const t = V.game.setTarget(r); if (t) { r.tx = t.tx; r.ty = t.ty; return; } }
    let kx = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
    let ky = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0);
    if (kx || ky) {
      const d = Math.hypot(kx, ky);
      r.tx = r.x + (kx / d) * (300 / r.zoom); r.ty = r.y + (ky / d) * (300 / r.zoom);
    } else if (mouse.moved && (!isTouch || mouse.down)) {
      // el punto bajo el cursor según la cámara de render (lo que ves es adonde vas)
      const z = camZoom();
      r.tx = r.x + (mouse.x - W / 2) / z; r.ty = r.y + (mouse.y - H / 2) / z;
    } else { r.tx = r.x; r.ty = r.y; }
  }

  function update(dt) {
    V.bus.emit('frame', dt);
    updateTrans(dt);
    shake *= Math.exp(-dt * 9);
    hurt = Math.max(0, hurt - dt * 2.5);
    if (banner) { banner.t += dt; if (banner.t > banner.dur) banner = null; }
    if (!banner && bannerQ.length) banner = bannerQ.shift();

    if (state === 'menu' && demo) {
      demo.bot();
      demo.update(dt);
      if (demo.r > 90) makeDemo();
      demo.events.length = 0;
    }
    if ((state === 'run' || state === 'ending') && run && !paused) {
      save.playTime += dt;
      if (state === 'run') steer(run);
      if (state === 'ending') { timeScale = Math.max(0.15, timeScale - dt * 1.5); endT += dt; }
      // presentación del Núcleo a cámara lenta (el Núcleo no ataca durante su entrada)
      const ts = state === 'run' && cam.reveal ? 0.3 : timeScale;
      run.update(dt * ts);
      if (state === 'run') demoCap(run);
      // durante el final la run está "over" pero seguimos animando partículas
      if (run.over) animateAfter(run, dt * timeScale);
      handleEvents(run);
      if (state === 'run') camUpdate(run, dt);
      if (run.over && state === 'run') {
        // victoria: se guarda ya y empieza la cinemática (la escena de la run sigue viva dentro de ella)
        if (run.victory) finishRun();
        else { state = 'ending'; endT = 0; }
      }
      if (state === 'ending' && endT > 1.1) finishRun();
    }
    updateHints(dt);
    if (state === 'finale') V.Cine.update(dt);
    if (state === 'tree') updateTooltip(false);
  }

  function animateAfter(r, dt) {
    for (let i = r.parts.length - 1; i >= 0; i--) {
      const p = r.parts[i]; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.life <= 0) r.parts.splice(i, 1);
    }
  }

  function draw(dt) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const sx = (Math.random() - 0.5) * shake, sy = (Math.random() - 0.5) * shake;
    // El HUD del canvas escala con la pantalla (a 1920×1080 era diminuto) además del ajuste de interfaz.
    const us = (V.uiScale || 1) * V.clamp(Math.min(W / 1280, H / 800), 0.85, 1.6), UW = W / us, UH = H / us;
    if ((state === 'run' || state === 'ending' || state === 'results') && run) {
      const z = camZoom();
      const dx = (cam.cx - prevCam.x) * z, dy = (cam.cy - prevCam.y) * z;
      prevCam.x = cam.cx; prevCam.y = cam.cy;
      V.Render.background(ctx, W, H, dx, dy);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (!V.showNumbers && run.texts) run.texts.length = 0;
      // banner: franja central donde los números flotantes se atenúan; allRings: anillo de "no comestible"
      // en todos los cuerpos visibles durante las primeras partidas (aprender qué se come)
      V.Render.drawRun(ctx, run, W, H, { sx, sy, time, z, cx: cam.cx, cy: cam.cy, pop: cam.popT, banner: banner && banner.t < banner.dur ? { y: H * 0.28, us } : null, allRings: save.runs < 3 });
      // HUD y banners escalados por la escala de interfaz: se dibujan en un lienzo lógico de W/us × H/us
      ctx.setTransform(DPR * us, 0, 0, DPR * us, 0, 0);
      V.Render.drawHUD(ctx, run, UW, UH, time, { hurt: V.reduceFlash ? hurt * 0.35 : hurt, touch: isTouch, pad: V.inputMode === 'pad', uiScaled: true });
      V.Render.banner(ctx, UW, UH, banner);
      drawHints(UW, UH);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (state === 'ending' || state === 'results') {
        const k = state === 'results' ? 1 : Math.min(1, endT / 1.1);
        ctx.fillStyle = 'rgba(5,3,13,' + k * 0.6 + ')';
        ctx.fillRect(0, 0, W, H);
      }
    } else if (state === 'menu' && demo) {
      const dx = (demo.x - prevCam.x) * demo.zoom, dy = (demo.y - prevCam.y) * demo.zoom;
      prevCam.x = demo.x; prevCam.y = demo.y;
      V.Render.background(ctx, W, H, dx, dy);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (demo.texts && !V.showNumbers) demo.texts.length = 0;
      V.Render.drawRun(ctx, demo, W, H, { sx: 0, sy: 0, time, decor: true });
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.fillStyle = 'rgba(5,3,13,0.45)'; ctx.fillRect(0, 0, W, H);
    } else if (state === 'finale' && V.Cine.running) {
      V.Cine.draw(ctx, W, H, time, sx, sy);
      // "[SEÑAL] ERES SUFICIENTE" (banner de la derrota del Núcleo) sigue sobre los primeros segundos
      if (banner) {
        ctx.setTransform(DPR * us, 0, 0, DPR * us, 0, 0);
        V.Render.banner(ctx, UW, UH, banner);
      }
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    } else {
      V.Render.background(ctx, W, H, 0.15, 0.05);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (state === 'tree' || state === 'results') V.Tree.draw(ctx, W, H, save, time, dt);
    }
  }

  // Pistas de las dos primeras partidas, guiadas por lo que hace el jugador (no por un temporizador):
  //  1 "muévete" hasta que se desplaza · 2 "devora / rompe" hasta 3 bocados o una rotura ·
  //  3 "estabilidad" cuando baja del 50 % (4 s). Cada pista se ve al menos 2,5 s y entra/sale con fundido.
  const hint = { run: null, i: -1, t: 0, a: 0, done3: false, x0: 0, y0: 0 };
  function hintTarget(r) {
    if (save.runs > 1 || r.over) return -1;
    if (hint.run !== r) Object.assign(hint, { run: r, i: 0, t: 0, a: 0, done3: false, x0: r.x, y0: r.y });
    const moved = Math.hypot(r.x - hint.x0, r.y - hint.y0) > r.r * 6;
    if (hint.i === 0 && moved && hint.t > 2.5) return 1;
    if (hint.i === 1 && (r.eaten >= 3 || r.broken > 0) && hint.t > 2.5) return 2;
    if (hint.i === 2) {
      if (!hint.done3 && r.stab < r.stabMax * 0.5) { hint.done3 = true; return 3; }
      return 2;
    }
    if (hint.i === 3 && hint.t > 4) return 4; // fin
    return hint.i;
  }
  function updateHints(dt) {
    if (!run || state !== 'run') { hint.a = Math.max(0, hint.a - dt * 4); return; }
    const want = hintTarget(run);
    hint.t += dt;
    if (want !== hint.i) {
      hint.a -= dt * 4; // fundido de salida antes de cambiar
      if (hint.a <= 0) { hint.a = 0; hint.i = want; hint.t = 0; }
    } else hint.a = Math.min(1, hint.a + dt * 3);
  }
  // índice 2 = esperar sin mostrar nada (entre "devora" y "estabilidad")
  const hintVisible = () => !!run && hint.run === run && hint.a > 0.02 && (hint.i === 0 || hint.i === 1 || hint.i === 3);
  function drawHints(w, h) {
    if (!hintVisible()) return;
    const msgs = { 0: isTouch ? T('hint1t') : T('hint1'), 1: T('hint2'), 3: T('hint3') };
    const txt = msgs[hint.i];
    ctx.globalAlpha = hint.a;
    ctx.textAlign = 'center';
    const px = Math.min(20, w * 0.04);
    V.Render.fitFont(ctx, txt, w - 60, '700', px, 11);
    const tw = ctx.measureText(txt).width, fs = V.Render.fontPx(ctx) || px;
    ctx.fillStyle = 'rgba(10,6,24,0.6)';
    V.Render.roundRect(ctx, w / 2 - tw / 2 - 14, h - 110 - fs - 6, tw + 28, fs + 18, 10); ctx.fill();
    ctx.fillStyle = hint.i === 3 ? V.pal().stabMid : '#ece8ff';
    ctx.fillText(txt, w / 2, h - 110);
    ctx.globalAlpha = 1;
  }

  // ---------- Inicio ----------
  // API para módulos externos (logros, entrada, accesibilidad, herramientas)
  V.game = {
    save,
    get state() { return state; },
    get run() { return run; },
    get paused() { return paused; },
    get size() { return { W, H, DPR }; },
    get renderZoom() { return camZoom(); }, // zoom con el que se dibuja la partida (run.zoom es el de la simulación)
    show, goTree, goMenu, requestRun, refreshTreebar, applyI18n, fitTreebar, addShake: (v) => addShake(v),
    setBanner: (b) => { banner = Object.assign({ t: 0, dur: 3 }, b); },
    setTarget: null, // input.js asigna una función (run) => {tx, ty} | null para dirigir el agujero
    // --- añadidos por UX (input.js y otros módulos) ---
    queueBanner, toast, applySettings, confirm: confirmDialog,
    pause: (p, note) => setPaused(p, note),
    transActive: () => !!trans.cur,
    // cinemática del final (input.js: mando)
    cineActive: () => state === 'finale' && V.Cine.active && !trans.cur && !anyScreenOpen(),
    cinePad: (held) => V.Cine.padHold(held),
    cineSkip: () => V.Cine.skip(),
    hintActive: () => hintVisible(),
    advanceTrans,
    requestRunFromTree,
    tree: treeApi,
    openStats, openCredits,
  };

  async function boot() {
    resize();
    buildLangSelect();
    applyI18n();
    V.Render.init();
    V.Audio.setVol(save.settings.music, save.settings.sfx);
    await V.Platform.init();
    V.Platform.loadingStop();
    refreshPlatformButtons();
    makeDemo();
    prevCam = { x: demo.x, y: demo.y, z: demo.zoom };
    goMenu();
    V.bus.emit('boot');
    requestAnimationFrame(frame);
  }
  boot();
})();
