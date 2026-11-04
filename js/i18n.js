// Textos ES / EN
(function () {
  const V = globalThis.V;
  const S = {
    es: {
      tagline: 'Empiezas como una mota. Terminas devorando la galaxia.',
      play: 'JUGAR', settings: 'AJUSTES', fullscreen: 'PANTALLA COMPLETA', back: 'VOLVER', madeWith: 'Estación UMBRAL',
      music: 'Música', sfx: 'Efectos', shake: 'Temblor de pantalla', language: 'Idioma',
      reset: 'Borrar progreso', resetConfirm: '¿Seguro? Pulsa otra vez para borrar TODO',
      stability: 'ESTABILIDAD', matter: 'Materia', mass: 'Masa', next: 'Siguiente', combo: 'Combo',
      pulseKey: 'ESPACIO · PULSO', pulseTouch: 'DOBLE TOQUE · PULSO',
      resultsTitle: 'EVAPORADO', resultsSub: 'Tu singularidad se deshizo en radiación de Hawking. LUMEN recuperó la materia.',
      rMatter: 'Materia recuperada', rEaten: 'Cuerpos devorados', rBroken: 'Cuerpos destrozados', rScale: 'Escala alcanzada', rTime: 'Duración',
      newRecord: 'NUEVA ESCALA', upgrade: 'MEJORAR', double: '▶ x2 MATERIA (anuncio)', doubled: '¡Materia duplicada!',
      startRun: 'INICIAR ▸', menu: 'MENÚ', record: 'Récord', archive: 'ARCHIVO',
      level: 'Nivel', effect: 'Efecto', cost: 'Coste', maxed: 'MÁXIMO', requires: 'Requiere alcanzar',
      hint1: 'Mueve el ratón: el agujero va hacia él', hint1t: 'Arrastra el dedo: el agujero lo sigue',
      hint2: 'Devora lo pequeño · Pégate a lo grande para romperlo',
      hint3: 'Si la estabilidad llega a cero, te evaporas',
      newScale: 'NUEVA ESCALA', revive: '¡SEGUNDA OPORTUNIDAD!', paused: 'PAUSA', resume: 'CONTINUAR', abandon: 'TERMINAR PARTIDA',
      victoryTitle: 'FIN DEL CICLO I', victoryText: 'De una mota cuántica a un núcleo galáctico. El universo siguiente ya está creciendo.',
      victoryStats: 'Partidas: {runs} · Tiempo total: {time}', keepPlaying: 'SEGUIR CRECIENDO',
      incoming: 'TRANSMISIÓN ENTRANTE', tapContinue: 'clic para continuar', close: 'CERRAR',
      from_lumen: 'LUMEN · IA de UMBRAL', from_varga: 'DRA. ILSE VARGA · archivo', from_custodians: 'LOS CUSTODIOS · señal', from_void: '???',
      m0: 'Mota cuántica', m1: 'Nube de polvo', m2: 'Cinturón de asteroides', m3: 'Escala lunar', m4: 'Escala planetaria', m5: 'Escala estelar', m6: 'Núcleo galáctico',
      b_core: 'Núcleo', b_hunger: 'Hambre', b_gravity: 'Gravedad', b_stability: 'Estabilidad', b_tidal: 'Marea', b_cosmos: 'Cosmos', b_origin: 'Origen',
      // --- UX: menús, pantallas nuevas, ajustes, mando ---
      continue: 'CONTINUAR', stats: 'ESTADÍSTICAS', credits: 'CRÉDITOS', retry: 'REINTENTAR', retry_pad: '{X} REINTENTAR',
      startRun_pad: '{X} INICIAR ▸', menu_pad: '{B} MENÚ', archive_pad: '{Y} ARCHIVO', treeStats: 'DATOS', treeStats_pad: '{SELECT} DATOS',
      quitMenu: 'SALIR AL MENÚ', confirmQuit: '¿SALIR AL MENÚ?', confirmQuitSub: 'La partida termina aquí. Conservarás la materia recogida.',
      cancel: 'CANCELAR', confirm: 'CONFIRMAR', padLost: 'Mando desconectado. Vuelve a conectarlo para seguir.',
      padOn: 'Mando conectado', padOff: 'Mando desconectado',
      secAudio: 'SONIDO', secAccess: 'PANTALLA Y ACCESIBILIDAD', secGeneral: 'GENERAL',
      flashes: 'Reducir destellos', numbers: 'Números flotantes', colorblind: 'Modo daltónico', uiScale: 'Escala de interfaz',
      transSize: 'Texto de transmisiones', rumble: 'Vibración del mando',
      statsTitle: 'ESTADÍSTICAS', sRuns: 'Partidas jugadas', sTime: 'Tiempo total', sEaten: 'Cuerpos devorados', sBroken: 'Cuerpos destrozados',
      sMatterTotal: 'Materia total obtenida', sBestRun: 'Mejor partida', sLongest: 'Partida más larga', sRecord: 'Escala récord',
      sLogs: 'Transmisiones leídas', sUpgrades: 'Mejoras investigadas', sCycle: 'Ciclo I', sDone: 'Completado', sPending: 'En curso',
      creditsDefault: 'VOIDLING\nUn juego de [ESTUDIO]\n\nDISEÑO, PROGRAMACIÓN, ARTE Y SONIDO\n[NOMBRE]\n\nTECNOLOGÍA\nHTML5 Canvas y JavaScript, sin motores ni librerías\n\nInspirado en la hipótesis de la selección natural cosmológica de Lee Smolin.\n\nGracias por jugar.',
      demoTitle: 'GRACIAS POR JUGAR', demoText: 'Has llegado al final de la demo. La historia de Voidling continúa en el juego completo.',
      wishlist: '★ AÑADIR A DESEADOS EN STEAM', keepDemo: 'SEGUIR EN LA DEMO', storeSoon: 'Muy pronto en Steam',
      firstBuy: '¡Compra tu primera mejora!', tipBuy: '{A} investigar', tipBuyTouch: 'Toca otra vez para investigar',
      treeHint: 'Clic o flechas + Enter para investigar · Arrastra para moverte · Rueda para zoom · ESPACIO para iniciar',
      treeHint_pad: '{DPAD} elegir nodo · {A} investigar · {RS} mover · {LB} {RB} zoom · {X} iniciar · {B} menú',
      // cinemática del final: pista de la franja inferior (pulsar = avanzar, mantener = saltar)
      cineSkip: 'Pulsa: avanzar · Mantén: saltar', cineSkip_pad: '{A} avanzar · Mantén {A}: saltar', cineSkip_touch: 'Toca: avanzar · Mantén: saltar',
      tapContinue_pad: '{A} continuar', hint1_pad: 'Mueve el stick izquierdo: el agujero lo sigue',
      tapContinue_touch: 'toca para continuar', pulseKey_touch: 'DOBLE TOQUE · PULSO',
      treeHint_touch: 'Toca un nodo para ver qué hace y otra vez para investigarlo · Arrastra para moverte',
      pulseKey_pad: '{A} / {RT} · PULSO',
      resKeys: 'R o Enter: reintentar · Espacio: árbol de mejoras', resKeys_pad: '{X} reintentar · {A} elegir',
      evThreat: 'AMENAZA DETECTADA', evPulsar: 'PÚLSAR', evSwarm: 'ENJAMBRE', evBoss: 'EL NÚCLEO', evBossSmall: 'ALERTA MÁXIMA',
      evPhase: 'FASE {n}', evBossDefeat: 'NÚCLEO DEVORADO',
      ev_pulsarSub: 'Esquiva sus anillos de radiación.', ev_swarmSub: 'Los Custodios atacan en grupo. Usa el Pulso.',
      ev_bossSub: 'Algo enorme te espera en el centro.', ev_bossPhase2Sub: 'El Núcleo cambia de forma. Aguanta.',
      ev_bossPhase3Sub: 'Última fase. Ahora o nunca.', ev_bossDefeatSub: 'Nada se interpone ya entre tú y la galaxia.',
      viewCredits: 'VER CRÉDITOS', yes: 'Sí', no: 'No', quit: 'SALIR', viewStore: 'VER EN STEAM',
    },
    en: {
      tagline: 'You start as a speck. You end up devouring the galaxy.',
      play: 'PLAY', settings: 'SETTINGS', fullscreen: 'FULLSCREEN', back: 'BACK', madeWith: 'THRESHOLD Station',
      music: 'Music', sfx: 'Sound effects', shake: 'Screen shake', language: 'Language',
      reset: 'Erase progress', resetConfirm: 'Sure? Press again to erase EVERYTHING',
      stability: 'STABILITY', matter: 'Matter', mass: 'Mass', next: 'Next', combo: 'Combo',
      pulseKey: 'SPACE · PULSE', pulseTouch: 'DOUBLE TAP · PULSE',
      resultsTitle: 'EVAPORATED', resultsSub: 'Your singularity unravelled into Hawking radiation. LUMEN recovered the matter.',
      rMatter: 'Matter recovered', rEaten: 'Bodies devoured', rBroken: 'Bodies shattered', rScale: 'Scale reached', rTime: 'Duration',
      newRecord: 'NEW SCALE', upgrade: 'UPGRADE', double: '▶ x2 MATTER (ad)', doubled: 'Matter doubled!',
      startRun: 'START ▸', menu: 'MENU', record: 'Record', archive: 'ARCHIVE',
      level: 'Level', effect: 'Effect', cost: 'Cost', maxed: 'MAXED', requires: 'Requires reaching',
      hint1: 'Move the mouse: the hole moves toward it', hint1t: 'Drag your finger: the hole follows',
      hint2: 'Devour small things · Press against big ones to break them',
      hint3: 'If stability reaches zero, you evaporate',
      newScale: 'NEW SCALE', revive: 'SECOND CHANCE!', paused: 'PAUSED', resume: 'RESUME', abandon: 'END RUN',
      victoryTitle: 'END OF CYCLE I', victoryText: 'From a quantum speck to a galactic core. The next universe is already growing.',
      victoryStats: 'Runs: {runs} · Total time: {time}', keepPlaying: 'KEEP GROWING',
      incoming: 'INCOMING TRANSMISSION', tapContinue: 'click to continue', close: 'CLOSE',
      from_lumen: 'LUMEN · THRESHOLD AI', from_varga: 'DR. ILSE VARGA · archive', from_custodians: 'THE CUSTODIANS · signal', from_void: '???',
      m0: 'Quantum speck', m1: 'Dust cloud', m2: 'Asteroid belt', m3: 'Lunar scale', m4: 'Planetary scale', m5: 'Stellar scale', m6: 'Galactic core',
      b_core: 'Core', b_hunger: 'Hunger', b_gravity: 'Gravity', b_stability: 'Stability', b_tidal: 'Tide', b_cosmos: 'Cosmos', b_origin: 'Origin',
      // --- UX: menus, new screens, settings, controller ---
      continue: 'CONTINUE', stats: 'STATISTICS', credits: 'CREDITS', retry: 'RETRY', retry_pad: '{X} RETRY',
      startRun_pad: '{X} START ▸', menu_pad: '{B} MENU', archive_pad: '{Y} ARCHIVE', treeStats: 'STATS', treeStats_pad: '{SELECT} STATS',
      quitMenu: 'QUIT TO MENU', confirmQuit: 'QUIT TO MENU?', confirmQuitSub: 'The run ends here. You keep the matter you collected.',
      cancel: 'CANCEL', confirm: 'CONFIRM', padLost: 'Controller disconnected. Reconnect it to continue.',
      padOn: 'Controller connected', padOff: 'Controller disconnected',
      secAudio: 'SOUND', secAccess: 'DISPLAY & ACCESSIBILITY', secGeneral: 'GENERAL',
      flashes: 'Reduce flashes', numbers: 'Floating numbers', colorblind: 'Colorblind mode', uiScale: 'Interface scale',
      transSize: 'Transmission text', rumble: 'Controller vibration',
      statsTitle: 'STATISTICS', sRuns: 'Runs played', sTime: 'Total time', sEaten: 'Bodies devoured', sBroken: 'Bodies shattered',
      sMatterTotal: 'Total matter earned', sBestRun: 'Best run', sLongest: 'Longest run', sRecord: 'Record scale',
      sLogs: 'Transmissions read', sUpgrades: 'Upgrades researched', sCycle: 'Cycle I', sDone: 'Completed', sPending: 'In progress',
      creditsDefault: 'VOIDLING\nA game by [ESTUDIO]\n\nDESIGN, CODE, ART AND SOUND\n[NOMBRE]\n\nTECHNOLOGY\nHTML5 Canvas and JavaScript, no engines or libraries\n\nInspired by Lee Smolin\'s hypothesis of cosmological natural selection.\n\nThank you for playing.',
      demoTitle: 'THANK YOU FOR PLAYING', demoText: 'You have reached the end of the demo. Voidling\'s story continues in the full game.',
      wishlist: '★ WISHLIST ON STEAM', keepDemo: 'KEEP PLAYING THE DEMO', storeSoon: 'Coming soon to Steam',
      firstBuy: 'Buy your first upgrade!', tipBuy: '{A} research', tipBuyTouch: 'Tap again to research',
      treeHint: 'Click or arrows + Enter to research · Drag to move · Wheel to zoom · SPACE to start',
      treeHint_pad: '{DPAD} pick node · {A} research · {RS} move · {LB} {RB} zoom · {X} start · {B} menu',
      cineSkip: 'Press: advance · Hold: skip', cineSkip_pad: '{A} advance · Hold {A}: skip', cineSkip_touch: 'Tap: advance · Hold: skip',
      tapContinue_pad: '{A} continue', hint1_pad: 'Move the left stick: the hole follows it',
      tapContinue_touch: 'tap to continue', pulseKey_touch: 'DOUBLE TAP · PULSE',
      treeHint_touch: 'Tap a node to see what it does, tap again to research it · Drag to move',
      pulseKey_pad: '{A} / {RT} · PULSE',
      resKeys: 'R or Enter: retry · Space: upgrade tree', resKeys_pad: '{X} retry · {A} select',
      evThreat: 'THREAT DETECTED', evPulsar: 'PULSAR', evSwarm: 'SWARM', evBoss: 'THE CORE', evBossSmall: 'MAXIMUM ALERT',
      evPhase: 'PHASE {n}', evBossDefeat: 'CORE DEVOURED',
      ev_pulsarSub: 'Dodge its radiation rings.', ev_swarmSub: 'The Custodians attack as a group. Use your Pulse.',
      ev_bossSub: 'Something huge awaits you at the center.', ev_bossPhase2Sub: 'The Core is changing shape. Hold on.',
      ev_bossPhase3Sub: 'Final phase. Now or never.', ev_bossDefeatSub: 'Nothing stands between you and the galaxy now.',
      viewCredits: 'VIEW CREDITS', yes: 'Yes', no: 'No', quit: 'QUIT', viewStore: 'VIEW ON STEAM',
    },
  };

  const NODES = {
    core: ['Singularidad', 'Tu origen. Todo empieza aquí.', 'Singularity', 'Your origin. Everything begins here.'],
    h1: ['Absorción', 'Ganas más masa por cada cuerpo devorado.', 'Absorption', 'Gain more mass from every body you devour.'],
    h2: ['Destilación', 'Más materia por cada cuerpo devorado.', 'Distillation', 'More matter from every body you devour.'],
    h3: ['Fauces', 'Puedes devorar cuerpos más grandes respecto a tu tamaño.', 'Maw', 'Devour bodies that are larger relative to your size.'],
    h4: ['Frenesí', 'Devorar en cadena acumula combo: +5% de materia por pila. Más niveles = más pilas.', 'Frenzy', 'Devouring in a chain stacks combo: +5% matter per stack. More levels = more stacks.'],
    h5: ['Refinería estelar', 'Mucha más materia por cuerpo devorado.', 'Stellar Refinery', 'Much more matter per body devoured.'],
    h6: ['Hiperabsorción', 'Aún más masa por cuerpo devorado.', 'Hyperabsorption', 'Even more mass per body devoured.'],
    h7: ['Horizonte voraz', 'Devoras cuerpos todavía más grandes.', 'Ravenous Horizon', 'Devour even larger bodies.'],
    h8: ['Apetito infinito', 'La materia que obtienes aumenta enormemente.', 'Endless Appetite', 'The matter you obtain increases enormously.'],
    g1: ['Alcance', 'Tu campo gravitatorio atrae desde más lejos.', 'Reach', 'Your gravity field pulls from farther away.'],
    g2: ['Atracción', 'Los cuerpos caen hacia ti más rápido.', 'Attraction', 'Bodies fall toward you faster.'],
    g3: ['Inercia', 'Te mueves más rápido.', 'Inertia', 'You move faster.'],
    g4: ['Pulso gravitatorio', 'ESPACIO / clic derecho: una onda que arrastra todo hacia ti, daña lo grande y destruye Custodios.', 'Gravity Pulse', 'SPACE / right click: a wave that drags everything toward you, damages big bodies and destroys Custodians.'],
    g5: ['Resonancia', 'Pulso: menos recarga y más radio.', 'Resonance', 'Pulse: shorter cooldown and larger radius.'],
    g6: ['Lente gravitatoria', 'Alcance gravitatorio mucho mayor.', 'Gravitational Lens', 'Much greater gravity reach.'],
    g7: ['Pozo profundo', 'Atracción mucho más fuerte.', 'Deep Well', 'Much stronger attraction.'],
    g8: ['Gran Atractor', 'Alcance gravitatorio colosal.', 'Great Attractor', 'Colossal gravity reach.'],
    s1: ['Contención', 'Pierdes estabilidad más despacio.', 'Containment', 'Lose stability more slowly.'],
    s2: ['Nutrición', 'Recuperas estabilidad al devorar.', 'Nourishment', 'Recover stability when you devour.'],
    s3: ['Blindaje', 'Los Custodios te hacen menos daño.', 'Shielding', 'Custodians deal less damage to you.'],
    s4: ['Contención II', 'Pierdes estabilidad aún más despacio.', 'Containment II', 'Lose stability even more slowly.'],
    s5: ['Segunda oportunidad', 'Una vez por run, al evaporarte recuperas el 50% de estabilidad.', 'Second Chance', 'Once per run, when you evaporate you recover 50% stability.'],
    s6: ['Banquete', 'Recuperas mucha más estabilidad al devorar.', 'Feast', 'Recover much more stability when you devour.'],
    s7: ['Contención III', 'La radiación de Hawking apenas te afecta.', 'Containment III', 'Hawking radiation barely affects you.'],
    s8: ['Horizonte eterno', 'Estabilidad máxima aumentada.', 'Eternal Horizon', 'Maximum stability increased.'],
    t1: ['Fuerza de marea', 'Rompes cuerpos grandes más rápido.', 'Tidal Force', 'Break big bodies faster.'],
    t2: ['Fragmentación', 'Los cuerpos rotos se parten en más trozos.', 'Fragmentation', 'Broken bodies split into more pieces.'],
    t3: ['Lunas orbitales', 'Lunas que orbitan a tu alrededor y trituran lo que tocan. +1 luna por nivel.', 'Orbital Moons', 'Moons that orbit you and grind whatever they touch. +1 moon per level.'],
    t4: ['Marea II', 'Rompes cuerpos grandes mucho más rápido.', 'Tide II', 'Break big bodies much faster.'],
    t5: ['Órbitas veloces', 'Tus lunas giran más rápido y golpean más fuerte.', 'Swift Orbits', 'Your moons spin faster and hit harder.'],
    t6: ['Espaguetificación', 'Romper cuerpos da mucha más materia.', 'Spaghettification', 'Breaking bodies yields much more matter.'],
    t7: ['Marea abismal', 'Fuerza de marea devastadora.', 'Abyssal Tide', 'Devastating tidal force.'],
    c1: ['Densidad', 'Más cuerpos en el espacio.', 'Density', 'More bodies in space.'],
    c2: ['Cristales cuásar', 'Más cuerpos dorados (valen x10 materia).', 'Quasar Crystals', 'More golden bodies (worth x10 matter).'],
    c3: ['Cometas', 'Aparecen cometas veloces que valen x6 materia. Siempre puedes devorarlos.', 'Comets', 'Fast comets appear, worth x6 matter. You can always devour them.'],
    c4: ['Densidad II', 'Muchos más cuerpos en el espacio.', 'Density II', 'Many more bodies in space.'],
    c5: ['Riqueza cuásar', 'Los cuerpos dorados valen más.', 'Quasar Wealth', 'Golden bodies are worth more.'],
    c6: ['Lluvia de cometas', 'Los cometas aparecen más a menudo.', 'Comet Shower', 'Comets appear more often.'],
    c7: ['Densidad III', 'El cosmos rebosa de materia.', 'Density III', 'The cosmos overflows with matter.'],
    o1: ['Masa primordial', 'Empiezas cada run siendo más grande.', 'Primordial Mass', 'Start every run bigger.'],
    o2: ['Eco del colapso', '+10% de materia por cada escala alcanzada en la run (por nivel).', 'Collapse Echo', '+10% matter for every scale reached in the run (per level).'],
    o3: ['Masa primordial II', 'Empiezas cada run mucho más grande.', 'Primordial Mass II', 'Start every run much bigger.'],
    o4: ['Digestión exótica', 'Puedes devorar a los Custodios: dan estabilidad y x3 materia.', 'Exotic Digestion', 'You can devour Custodians: they give stability and x3 matter.'],
    o5: ['Masa primordial III', 'Empiezas cada run enorme.', 'Primordial Mass III', 'Start every run huge.'],
    o6: ['Singularidad desnuda', 'x2 materia y devoras cuerpos mucho más grandes. El último secreto de Varga.', 'Naked Singularity', 'x2 matter and you devour much larger bodies. Varga\'s last secret.'],
  };

  // Extensión: cada módulo registra sus propios textos con V.addStrings({ es: {...}, en: {...} }).
  V.addStrings = function (obj) {
    for (const l in obj) { S[l] = S[l] || {}; Object.assign(S[l], obj[l]); }
  };
  V.addNodeText = function (id, esName, esDesc, enName, enDesc) { NODES[id] = [esName, esDesc, enName, enDesc]; };
  V._S = S; // acceso para herramientas de verificación de traducciones (no usar en el juego)
  V.LANGS = [['es', 'Español'], ['en', 'English']];
  // Paquetes de idioma externos (js/lang/*.js) se registran con V.registerLang(code, nombreNativo).
  // Cadena de respaldo: idioma actual → inglés → español (el español solo cae al inglés si falta algo).
  V.registerLang = function (code, name) {
    if (!V.LANGS.some((l) => l[0] === code)) V.LANGS.push([code, name]);
    S[code] = S[code] || {};
  };
  // Elige el texto de un objeto {es, en, pt-BR, ...} según el idioma actual con respaldo.
  V.pick = function (o) {
    if (o == null || typeof o !== 'object') return o;
    if (o[V.lang] != null) return o[V.lang];
    if (V.lang !== 'es' && o.en != null) return o.en;
    return o.es != null ? o.es : o.en;
  };
  V.lang = 'es';
  // Pila de fuentes del canvas (la del CSS está en index.html). Con respaldo CJK: el navegador busca cada
  // glifo en la lista, así que "Segoe UI" dibuja el latín/cirílico y las fuentes CJK el chino/japonés.
  // En japonés va primero una fuente japonesa para que los kanji no salgan con la forma china.
  const STACK = '"Segoe UI",system-ui,-apple-system,Roboto,"Noto Sans","Microsoft YaHei","Yu Gothic UI","Noto Sans CJK SC","Voidling SC",sans-serif';
  const STACK_JA = '"Segoe UI","Yu Gothic UI","Meiryo","Noto Sans CJK JP",system-ui,"Microsoft YaHei","Noto Sans CJK SC","Voidling JP","Voidling SC",sans-serif';
  V.FONT = STACK;
  // V.font('900', 28) → '900 28px <pila>' (para ctx.font)
  V.font = (weight, px) => weight + ' ' + Math.round(px * 10) / 10 + 'px ' + V.FONT;
  // "Voidling SC/JP" son fuentes incluidas (fonts/, Noto Sans recortada, OFL) para sistemas sin fuentes CJK
  // (Steam Deck/Linux). Se precargan al elegir idioma para que el canvas no dibuje cuadrados vacíos.
  V.setLang = (l) => {
    V.lang = S[l] ? l : 'es'; V.FONT = V.lang === 'ja' ? STACK_JA : STACK;
    try { if (typeof document !== 'undefined' && document.fonts) { document.fonts.load('16px "Voidling SC"', '物'); if (V.lang === 'ja') document.fonts.load('16px "Voidling JP"', '物'); } } catch (e) {}
  };
  // ¿El idioma actual escribe sin espacios entre palabras? (corte de línea por carácter)
  V.isCJK = () => /^(zh|ja|ko)/.test(V.lang);

  // --- Glifos de mando ---
  // Una cadena puede tener una variante "<clave>_pad" que se usa cuando el último input fue un mando
  // (V.inputMode === 'pad', lo fija input.js). Los marcadores {A} {B} {X} {Y} {LB} {RB} {LT} {RT}
  // {START} {SELECT} {LS} {RS} {DPAD} se convierten en texto plano (V.t, para el canvas)
  // o en "píldoras" HTML (V.tHTML, para el DOM). V.padStyle: 'xbox' (por defecto, Steam Deck) | 'ps'.
  V.inputMode = V.inputMode || 'mouse';
  V.padStyle = V.padStyle || 'xbox';
  const GLYPHS = {
    xbox: { A: 'A', B: 'B', X: 'X', Y: 'Y', LB: 'LB', RB: 'RB', LT: 'LT', RT: 'RT', START: '☰', SELECT: '⧉', LS: 'L', RS: 'R', DPAD: '✥' },
    ps: { A: '✕', B: '○', X: '□', Y: '△', LB: 'L1', RB: 'R1', LT: 'L2', RT: 'R2', START: 'OPT', SELECT: 'SHR', LS: 'L', RS: 'R', DPAD: '✥' },
  };
  // Versión en texto plano para el canvas (no todas las fuentes tienen ☰ ⧉ ✥).
  const PLAIN = {
    xbox: { START: 'Start', SELECT: 'View', LS: 'L-Stick', RS: 'R-Stick', DPAD: '+' },
    ps: { START: 'Options', SELECT: 'Share', LS: 'L-Stick', RS: 'R-Stick', DPAD: '+' },
  };
  const GLYPH_RE = /\{(A|B|X|Y|LB|RB|LT|RT|START|SELECT|LS|RS|DPAD)\}/g;
  V.glyph = (tok) => (GLYPHS[V.padStyle] || GLYPHS.xbox)[tok] || tok;
  const plainGlyph = (tok) => (PLAIN[V.padStyle] || PLAIN.xbox)[tok] || V.glyph(tok);

  function raw(k) {
    const L = S[V.lang] || S.es;
    if (V.inputMode === 'pad' || V.inputMode === 'touch') {
      // variantes "<clave>_pad" (mando) y "<clave>_touch" (pantalla táctil)
      const pk = k + (V.inputMode === 'pad' ? '_pad' : '_touch');
      if (L[pk] != null) return L[pk];
      if (V.lang !== 'es' && S.en[pk] != null && L[k] == null) return S.en[pk];
    }
    if (L[k] != null) return L[k];
    if (V.lang !== 'es' && S.en[k] != null) return S.en[k];
    return S.es[k] != null ? S.es[k] : k;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const pill = (tok) => '<span class="gl g' + tok + ' ' + V.padStyle + '">' + esc(V.glyph(tok)) + '</span>';
  // Texto plano (canvas, textContent). Los marcadores no-glifo como {runs} se respetan.
  V.t = (k) => String(raw(k)).replace(GLYPH_RE, (m, tok) => plainGlyph(tok));
  // HTML seguro con glifos de mando como píldoras (lo usa applyI18n para [data-i18n]).
  V.tHTML = (k) => esc(raw(k)).replace(GLYPH_RE, (m, tok) => pill(tok));
  V.glyphHTML = pill;

  // Nombres de nodos: un paquete de idioma puede definir node_<id>_n / node_<id>_d con V.addStrings.
  V.nodeName = (id) => {
    const L = S[V.lang]; if (L && L['node_' + id + '_n'] != null) return L['node_' + id + '_n'];
    return NODES[id] ? NODES[id][V.lang === 'es' ? 0 : 2] : id;
  };
  V.nodeDesc = (id) => {
    const L = S[V.lang]; if (L && L['node_' + id + '_d'] != null) return L['node_' + id + '_d'];
    return NODES[id] ? NODES[id][V.lang === 'es' ? 1 : 3] : '';
  };
})();
