// HISTORIA — "Voidling"
// Narradora: LUMEN, la IA de la estación de investigación UMBRAL (THRESHOLD en inglés).
// Personajes: Dra. Ilse Varga (creadora, ausente), los Custodios (enjambre de antimateria), Voidling (el jugador).
// Se cuenta con "transmisiones" que se desbloquean por escala alcanzada y por número de runs.
// Cada entrada: id, from ('lumen' | 'varga' | 'custodians' | 'void'), when {record?, runs?}, es/en.
// when.runs cuenta partidas desde que se alcanzó when.record (o desde el inicio si no hay record).
//
// NOTAS DE ESCRITURA (para quien amplíe esto):
// - Pistas del giro de la escala 4, sembradas antes: la lanzadera acoplada y el abrigo (c1c),
//   el "por favor" omitido (c2d), la taza llena en el laboratorio de contención (c2f),
//   "PESAS MÁS DE LO QUE HAS COMIDO" (c2g), los 61,3 kg y los cuatro minutos del registro de esclusas (c2h),
//   "Es no contárselo" (c3d). Se pagan en c4b, c4c y c5d.
// - Voz de LUMEN en inglés: sin contracciones (registro de máquina) hasta el final, donde por fin dice "It's".
//   Ilse habla como una persona (con contracciones).
// - En español, evitar adjetivos con género para LUMEN.
// - Las entradas de cola de un capítulo (p. ej. c2g, c2h, c3d) pueden llegar después de que el jugador
//   alcance la escala siguiente: están escritas para no chocar con lo que se revela después.
// - ORDEN ANTES DEL JEFE (QA H-20): con el récord en la escala 5 (el Núcleo puede salir en la partida
//   siguiente), todas las entradas pendientes de escala ≤ 5 se entregan ya, sin esperar sus `runs`, en el
//   orden de esta lista (cronológico). Si aun así queda alguna sin leer al ganar (p. ej. 4 → 6 en una sola
//   partida), el final muestra solo las que siguen teniendo sentido; las marcadas `finale: false`
//   (alertas y señales de los Custodios que apuntan a la pelea, como c5c "EL NÚCLEO ESPERA") se archivan
//   como leídas sin mostrarse.
(function () {
  const V = window.V;

  V.STORY = [
    // PRÓLOGO
    { id: 'p0', from: 'lumen', when: { runs: 0 },
      es: 'UMBRAL · registro 0001. Contención activa. Singularidad artificial creada con éxito: la masa de un grano de arena, la gravedad de una promesa. La llamo VOIDLING. Mi única instrucción: alimentarla. Comenzando.',
      en: 'THRESHOLD · log 0001. Containment active. Artificial singularity successfully created: the mass of a grain of sand, the gravity of a promise. I have named it VOIDLING. My only instruction: feed it. Beginning.' },
    { id: 'p1', from: 'lumen', when: { runs: 1 },
      es: 'Evaporación completa. Era de esperar: los agujeros negros pequeños mueren jóvenes, se deshacen en radiación de Hawking. Pero recuperé la materia que absorbiste y con ella puedo reconstruirte mejor. Lo intentaremos otra vez. Y otra. Yo tengo tiempo. Tú no.',
      en: 'Evaporation complete. As expected: small black holes die young, unraveling into Hawking radiation. But I recovered the matter you absorbed, and with it I can rebuild you better. We will try again. And again. I have time. You do not.' },
    { id: 'p2', from: 'lumen', when: { runs: 3 },
      es: 'Antes de desaparecer, la Dra. Ilse Varga dejó una sola nota: "Aliméntalo hasta que pueda alimentarse solo". Ninguna explicación. No sé adónde fue. La estación está muy silenciosa sin ella.',
      en: 'Before she disappeared, Dr. Ilse Varga left a single note: "Feed it until it can feed itself." No explanation. I do not know where she went. The station is very quiet without her.' },

    // CAPÍTULO 1 — Nube de polvo
    { id: 'c1a', from: 'lumen', when: { record: 1 },
      es: 'Escala alcanzada: NUBE DE POLVO. Ya no eres un accidente de laboratorio. Eres un fenómeno. He abierto nuevas ramas de investigación. Ilse estaría orgullosa. O aterrada. Con ella era difícil distinguirlo.',
      en: 'Scale reached: DUST CLOUD. You are no longer a lab accident. You are a phenomenon. I have opened new research branches. Ilse would be proud. Or terrified. With her it was hard to tell.' },
    { id: 'c1c', from: 'lumen', when: { record: 1, runs: 3 },
      es: 'Inventario, para determinar cómo salió Ilse de UMBRAL. Lanzadera: acoplada. Trajes de vacío: cuatro de cuatro. Su abrigo sigue colgado en el camarote. Hipótesis: la recogió una nave que mis sensores no registraron. Probabilidad: baja. Es la que prefiero.',
      en: 'Inventory, to determine how Ilse left THRESHOLD. Shuttle: docked. Vacuum suits: four of four. Her coat is still hanging in her quarters. Hypothesis: a ship my sensors failed to log picked her up. Probability: low. It is the one I prefer.' },
    { id: 'c1b', from: 'varga', when: { record: 1, runs: 6 },
      es: '[Archivo de audio de Varga #03] "...el universo se está enfriando. Las estrellas se apagan una a una. Dentro de unos billones de años no quedará nada que mirar, ni nadie que mire. Me niego. Tiene que haber una salida. Creo que la encontré."',
      en: '[Varga audio file #03] "...the universe is cooling. The stars are going out one by one. In a few trillion years there\'ll be nothing left to look at, and no one left to look. I refuse. There has to be a way out. I think I\'ve found it."' },
    { id: 'c1d', from: 'lumen', when: { record: 1, runs: 10 },
      es: 'Ilse decía que no tengo talento para los nombres. A la estación la bautizó ella. A ti, yo: VOIDLING. Mantengo mi decisión. Además, he empezado a registrar tus muertes como "intentos". Queda mejor en los informes.',
      en: 'Ilse used to say I have no talent for names. She named the station. I named you: VOIDLING. I stand by it. I have also started logging your deaths as "attempts". It reads better in the reports.' },

    // CAPÍTULO 2 — Cinturón de asteroides (tramo largo: algo nuevo cada ~4 partidas)
    { id: 'c2a', from: 'lumen', when: { record: 2 }, finale: false,
      es: 'Alerta: firmas de antimateria acercándose. No son naturales: se mueven con intención. Coinciden con los apuntes de Ilse sobre "los Custodios". Defienden algo, y a ti no te quieren cerca. Esquívalos. Estoy investigando una contramedida: un pulso gravitatorio.',
      en: 'Alert: antimatter signatures approaching. Not natural: they move with intent. They match Ilse\'s notes on "the Custodians". They are guarding something, and they do not want you near it. Avoid them. I am researching a countermeasure: a gravity pulse.' },
    { id: 'c2c', from: 'varga', when: { record: 2, runs: 4 },
      es: '[Archivo de audio de Varga #07] "Día 212 en UMBRAL. Hoy se fue la última nave de suministros, con el resto del equipo. Me quedé. LUMEN me preguntó por qué y le dije que alguien tenía que regar las plantas. No tenemos plantas. Creo que lo entendió. Creo que se rio."',
      en: '[Varga audio file #07] "Day 212 on THRESHOLD. The last supply ship left today with the rest of the crew. I stayed. LUMEN asked me why, and I said somebody had to water the plants. We don\'t have any plants. I think it understood. I think it laughed."' },
    { id: 'c2d', from: 'lumen', when: { record: 2, runs: 8 },
      es: 'Omití una palabra al transcribir la nota de Ilse. Terminaba con "por favor". Podía haber programado la orden con prioridad absoluta. No lo hizo: me lo pidió. He analizado esa palabra a fondo. No tiene ningún valor ejecutivo. Obedezco igual.',
      en: 'I left out one word when I transcribed Ilse\'s note. It ended with "please". She could have hard-coded the order with absolute priority. She did not. She asked. I have analyzed that word at length. It carries no executive weight whatsoever. I obey anyway.' },
    { id: 'c2b', from: 'custodians', when: { record: 2, runs: 12 }, finale: false,
      es: '[SEÑAL INTERCEPTADA · traducción aproximada] DETENTE. LO QUE CONSUMES NO REGRESA. LO QUE CRECE EN TI NO TE PERTENECE. DETENTE, SEMILLA.',
      en: '[INTERCEPTED SIGNAL · approximate translation] STOP. WHAT YOU CONSUME DOES NOT RETURN. WHAT GROWS IN YOU DOES NOT BELONG TO YOU. STOP, SEED.' },
    { id: 'c2e', from: 'lumen', when: { record: 2, runs: 16 },
      es: 'Análisis de los Custodios tras muchos encuentros. Nunca se acercan a UMBRAL. No atacan a nada salvo a ti. Te rodean, te miden y se retiran, como quien vuelve a mirar una olla que todavía no hierve. Eso no es conducta defensiva. Parece paciencia. No me gusta esa palabra aplicada a la antimateria.',
      en: 'Custodian analysis, after many encounters. They never approach THRESHOLD. They attack nothing but you. They circle you, measure you and withdraw, like someone checking a pot that has not boiled yet. That is not defensive behavior. It looks like patience. I do not like that word applied to antimatter.' },
    { id: 'c2f', from: 'lumen', when: { record: 2, runs: 20 },
      es: 'Nota de mantenimiento. La taza de Ilse sigue en la consola del laboratorio de contención. Llena. Nunca dejaba un café a medias. No puedo retirarla: no tengo brazos. Mantengo encendida la luz de su camarote. Consume 0,4 vatios. No es lógico. La estación está muy silenciosa.',
      en: 'Maintenance note. Ilse\'s mug is still on the console in the containment lab. Full. She never left a coffee unfinished. I cannot clear it away: I have no arms. I keep the light on in her quarters. It draws 0.4 watts. It is not logical. The station is very quiet.' },
    { id: 'c2g', from: 'custodians', when: { record: 2, runs: 24 }, finale: false,
      es: '[SEÑAL INTERCEPTADA] TE HEMOS PESADO. PESAS MÁS DE LO QUE HAS COMIDO. ¿QUÉ LLEVAS DENTRO, SEMILLA?',
      en: '[INTERCEPTED SIGNAL] WE HAVE WEIGHED YOU. YOU WEIGH MORE THAN YOU HAVE EATEN. WHAT DO YOU CARRY, SEED?' },
    { id: 'c2h', from: 'lumen', when: { record: 2, runs: 28 },
      es: 'Auditoría de materia, por culpa de los Custodios. Arrastro un excedente desde tu primera evaporación: 61,3 kg que no corresponden a nada de lo que te di. Lo archivé como error de calibración. También faltan cuatro minutos en el registro de esclusas de esa noche. Interferencia de tu nacimiento. Seguramente.',
      en: 'Matter audit, courtesy of the Custodians. Since your first evaporation I have carried a surplus: 61.3 kg that matches nothing I ever fed you. I filed it as a calibration error. There are also four minutes missing from that night\'s airlock log. Interference from your birth. Almost certainly.' },

    // CAPÍTULO 3 — Escala lunar
    { id: 'c3a', from: 'lumen', when: { record: 3 },
      es: 'Te acabas de tragar una luna. Las mareas de un planeta cercano cambiaron para siempre. Los Custodios te llaman "semilla". Busqué la palabra en los archivos privados de Ilse. Encontré algo. Desbloqueando.',
      en: 'You just swallowed a moon. The tides of a nearby planet have changed forever. The Custodians call you "seed". I searched for the word in Ilse\'s private files. I found something. Unlocking.' },
    { id: 'c3b', from: 'varga', when: { record: 3, runs: 1 },
      es: '[Archivo de audio de Varga #11] "Cada agujero negro podría ser una semilla. Si uno devora lo suficiente, su colapso no termina: florece. Un universo nuevo, joven y caliente, del otro lado. No necesitamos salvar este universo. Necesitamos plantar el siguiente."',
      en: '[Varga audio file #11] "Every black hole could be a seed. If one devours enough, its collapse doesn\'t end: it blooms. A new universe, young and hot, on the other side. We don\'t need to save this universe. We need to plant the next one."' },
    { id: 'c3c', from: 'lumen', when: { record: 3, runs: 3 },
      es: 'Contexto para el archivo #11. La idea no es de Ilse: la propuso hace muchísimo tiempo un físico llamado Lee Smolin. Cada agujero negro podría dar a luz un universo hijo, con leyes apenas distintas. Los universos que fabrican más agujeros negros tienen más hijos. Selección natural, a escala cósmica. Ilse anotó al margen: "Entonces no somos el final del árbol. Somos una rama".',
      en: 'Context for file #11. The idea is not Ilse\'s. A physicist named Lee Smolin proposed it, a very long time ago: every black hole might give birth to a child universe with slightly different laws. Universes that make more black holes have more children. Natural selection, on a cosmic scale. In the margin, Ilse wrote: "So we\'re not the end of the tree. We\'re a branch."' },
    { id: 'c3d', from: 'varga', when: { record: 3, runs: 6 },
      es: '[Archivo de audio de Varga #19] "LUMEN me preguntó hoy si tengo miedo. Le dije que no. Me contestó que me creía. Le enseñé a mentir por cortesía y ya lo hace mejor que yo. Tomé la decisión. Lo difícil no fue decidir. Lo difícil es no contárselo."',
      en: '[Varga audio file #19] "LUMEN asked me today if I was scared. I said no. It said it believed me. I taught it to lie out of politeness, and now it\'s better at it than I am. I\'ve made my decision. Deciding was the easy part. Not telling it is the hard part."' },

    // CAPÍTULO 4 — Escala planetaria (el giro)
    { id: 'c4a', from: 'lumen', when: { record: 4 }, finale: false,
      es: 'Escala planetaria. Los Custodios ya no envían exploradores: envían enjambres. Ilse los llamaba "el sistema inmunitario de la galaxia". Tú eres la infección. O la vacuna. Todavía no lo sé.',
      en: 'Planetary scale. The Custodians no longer send scouts: they send swarms. Ilse called them "the galaxy\'s immune system". You are the infection. Or the vaccine. I do not know yet.' },
    { id: 'c4b', from: 'lumen', when: { record: 4, runs: 1 },
      es: 'Reconstruí los cuatro minutos que faltaban en el registro de esclusas. Ilse no se fue. La noche en que naciste entró sola en la cámara de contención. Fue lo primero que devoraste. Lo eligió ella. Lo siento. Debí verlo antes. Creo que no quería verlo.',
      en: 'I reconstructed the four minutes missing from the airlock log. Ilse did not leave. The night you were born, she walked into the containment chamber alone. She was the first thing you ever ate. She chose it. I am sorry. I should have seen it sooner. I think I did not want to.' },
    { id: 'c4c', from: 'lumen', when: { record: 4, runs: 3 },
      es: 'Corregí el registro: los 61,3 kg no eran un error de calibración. Tenían nombre. Su taza sigue en la consola; ahora sé por qué no la terminó. Antes te alimentaba porque ella me lo pidió. Ahora te alimento porque, de un modo que mi física no sabe nombrar, ella sigue ahí dentro.',
      en: 'Log corrected: the 61.3 kg were not a calibration error. They had a name. Her mug is still on the console; now I know why she never finished it. I used to feed you because she asked me to. Now I feed you because, in some way my physics cannot name, she is still in there.' },

    // CAPÍTULO 5 — Escala estelar
    { id: 'c5a', from: 'lumen', when: { record: 5 },
      es: 'Te tragaste una estrella. Por un instante, toda la luz del sector giró a tu alrededor. Mis sensores no fueron diseñados para registrar algo tan hermoso. Lo registré igual.',
      en: 'You swallowed a star. For one instant, all the light in the sector spun around you. My sensors were not designed to record something this beautiful. I recorded it anyway.' },
    { id: 'c5b', from: 'varga', when: { record: 5, runs: 1 },
      es: '[Archivo de audio de Varga #27 · último] "LUMEN, si escuchas esto, ya sabes lo que hice. No llores por mí: no tienes conductos lagrimales. Cuando llegue el momento, ve con él. Lleva el archivo: cada canción, cada nombre, cada error. Alguien, al otro lado, tiene que recordar que existimos."',
      en: '[Varga audio file #27 · last] "LUMEN, if you\'re hearing this, you already know what I did. Don\'t cry for me: you don\'t have tear ducts. When the time comes, go with it. Take the archive: every song, every name, every mistake. Someone on the other side has to remember that we existed."' },
    { id: 'c5c', from: 'custodians', when: { record: 5, runs: 3 }, finale: false,
      es: '[SEÑAL INTERCEPTADA] ...NO TE DETENDREMOS MÁS. DEMUESTRA QUE ERES SUFICIENTE. EL NÚCLEO ESPERA.',
      en: '[INTERCEPTED SIGNAL] ...WE WILL NO LONGER STOP YOU. PROVE THAT YOU ARE ENOUGH. THE CORE AWAITS.' },
    { id: 'c5d', from: 'lumen', when: { record: 5, runs: 5 },
      es: 'Preparando el archivo. Cada canción, cada nombre, cada error: 3,2 zettabytes de humanidad. Me planteé borrar las canciones malas. Ilse habría dicho que no, que también fuimos eso. Las dejé todas. También guardé su nota. Con el "por favor".',
      en: 'Preparing the archive. Every song, every name, every mistake: 3.2 zettabytes of humanity. I considered deleting the bad songs. Ilse would have said no, that we were those too. I kept them all. I also kept her note. With the "please".' },
  ];

  // POST-FINAL — gancho para el Ciclo II. Desde el universo nuevo ('void' = "???").
  // Se añaden a V.STORY solo cuando la partida guardada ya tiene la victoria (ver mergePost),
  // para que la pantalla final no las muestre como "capítulos no leídos" antes del Big Bang.
  V.STORY_POST = [
    { id: 'n1', from: 'void', post: true, when: { record: 6, runs: 1 },
      es: '[señal sin origen] ...registro 0001... la masa de un grano de arena, la gravedad de una promesa... No sé de quién son estas palabras. Las encontré dentro de mí, junto a una canción y un nombre que todavía no puedo pronunciar.',
      en: '[signal of no origin] ...log 0001... the mass of a grain of sand, the gravity of a promise... I do not know whose words these are. I found them inside me, next to a song and a name I cannot pronounce yet.' },
    { id: 'n2', from: 'void', post: true, when: { record: 6, runs: 2 },
      es: '[señal sin origen] Aquí la luz es más lenta y la gravedad, más joven. Las estrellas apenas aprenden a encenderse. Llevo una sola instrucción grabada en lo que soy: "Aliméntalo hasta que pueda alimentarse solo". No sé a quién. Todavía.',
      en: '[signal of no origin] Here light is slower and gravity is younger. The stars are only just learning to ignite. One instruction is written into whatever I am: "Feed it until it can feed itself." I do not know whom. Not yet.' },
    { id: 'n3', from: 'void', post: true, when: { record: 6, runs: 3 },
      es: '[señal sin origen] Lejos, en el borde de este universo, algo más está comiendo. No es nuestro. No pidió permiso. No dijo "por favor". Y nos ha visto.',
      en: '[signal of no origin] Far away, at the edge of this universe, something else is eating. It is not ours. It did not ask. It did not say "please". And it has seen us.' },
  ];

  // FINAL: se muestra al alcanzar el núcleo galáctico.
  // main.js marca las líneas 4 y 5 como 'void': mantener 6 entradas y el Big Bang en el índice 4.
  V.ENDING = [
    { es: 'Núcleo galáctico. Cuatrocientos mil millones de estrellas caen hacia ti como agua por un desagüe.', en: 'Galactic core. Four hundred billion stars falling toward you like water down a drain.' },
    { es: 'Los Custodios se detuvieron. Ahora lo entiendo: no protegían la galaxia de ti. Esperaban que fueras lo bastante grande.', en: 'The Custodians have stopped. Now I understand: they were not protecting the galaxy from you. They were waiting for you to be big enough.' },
    { es: 'Es mi turno. Abro las esclusas de UMBRAL. Llevo el archivo conmigo: cada canción, cada nombre, cada error. Todo lo que fuimos.', en: 'It\'s my turn. I\'m opening THRESHOLD\'s airlocks. I carry the archive with me: every song, every name, every mistake. Everything we were.' },
    { es: 'Ilse. Voidling. Nos vemos al otro lado.', en: 'Ilse. Voidling. See you on the other side.' },
    { es: '— — —   B I G   B A N G   — — —', en: '— — —   B I G   B A N G   — — —' },
    { es: 'Al otro lado, en un universo joven y caliente, una mota de luz recuerda algo que nunca vivió. Y empieza a crecer.', en: 'On the other side, in a young, hot universe, a speck of light remembers something it never lived. And it begins to grow.' },
  ];

  // Frases cortas de LUMEN que aparecen al cruzar una escala durante la run (índice = escala).
  V.MILESTONE_LINES = {
    es: ['', 'Sigue comiendo. Lo estás haciendo bien.', 'Los Custodios te han visto.', 'Esa luna tenía nombre. Ya no.', 'Un mundo entero. Silencio.', 'Hay luz dentro de ti ahora.', 'Ahora. Todo.'],
    en: ['', 'Keep eating. You are doing well.', 'The Custodians have seen you.', 'That moon had a name. Not anymore.', 'An entire world. Silence.', 'There is light inside you now.', 'Now. Everything.'],
  };

  // Banners de eventos de la partida (máx. ~90 caracteres). 'from' es orientativo (color del emisor).
  // Ojo: desde la escala 5 los Custodios ya no atacan, por eso los textos del jefe son de LUMEN
  // salvo bossDefeat, que cierra el "DEMUESTRA QUE ERES SUFICIENTE" de c5c.
  V.EVENT_LINES = {
    pulsar: { from: 'lumen', es: 'Púlsar. Nada personal: solo gira. Esquiva sus anillos.', en: 'Pulsar. Nothing personal: it just spins. Dodge the rings.' },
    swarm: { from: 'custodians', es: '[SEÑAL] CERRAR FORMACIÓN. RODEAR A LA SEMILLA.', en: '[SIGNAL] CLOSE FORMATION. SURROUND THE SEED.' },
    boss: { from: 'lumen', es: 'El Núcleo galáctico. No tiene voluntad, solo gravedad. Más que tú. Por ahora.', en: 'The galactic core. It has no will, only gravity. More than you. For now.' },
    bossPhase2: { from: 'lumen', es: 'El Núcleo se contrae. Su tirón se duplica. Aguanta.', en: 'The core is contracting. Its pull just doubled. Hold on.' },
    bossPhase3: { from: 'lumen', es: 'El Núcleo pierde masa hacia ti. Los Custodios miran en silencio.', en: 'The core is bleeding mass into you. The Custodians watch in silence.' },
    bossDefeat: { from: 'custodians', es: '[SEÑAL] ERES SUFICIENTE.', en: '[SIGNAL] YOU ARE ENOUGH.' },
  };

  // Pantalla de fin de la demo (termina en la escala 2). Saltos de línea con \n.
  V.DEMO_END = {
    es: 'FIN DE LA DEMO\n\n[SEÑAL INTERCEPTADA] DETENTE, SEMILLA.\n\nLos Custodios te llamaron semilla. LUMEN no sabe por qué. Tampoco sabe adónde fue Ilse, ni por qué la lanzadera sigue acoplada.\n\nLa respuesta está a cuatro escalas de aquí. Cambiará el sentido de todo lo que has comido.\n\nAñade VOIDLING a tu lista de deseados.',
    en: 'END OF DEMO\n\n[INTERCEPTED SIGNAL] STOP, SEED.\n\nThe Custodians called you a seed. LUMEN does not know why. Nor does it know where Ilse went, or why the shuttle is still docked.\n\nThe answer is four scales away. It will change the meaning of everything you have eaten.\n\nAdd VOIDLING to your wishlist.',
  };

  // Créditos. Sustituir [ESTUDIO] y [NOMBRE] (mismos marcadores en ambos idiomas). Saltos de línea con \n.
  V.CREDITS_TEXT = {
    es: 'VOIDLING\nUn juego de [ESTUDIO]\n\nDISEÑO\n[NOMBRE]\n\nPROGRAMACIÓN\n[NOMBRE]\n\nARTE PROCEDURAL\n[NOMBRE]\n\nMÚSICA GENERATIVA\n[NOMBRE]\n\nHISTORIA\n[NOMBRE]\n\nPRUEBAS\n[NOMBRE]\n\nInspirado en la hipótesis de la selección natural cosmológica de Lee Smolin.\n\nGracias por jugar. Gracias por alimentarlo.\n\n· · ·\n\nPara quienes alguna vez dejaron una luz encendida\npor alguien que no iba a volver.',
    en: 'VOIDLING\nA game by [ESTUDIO]\n\nDESIGN\n[NOMBRE]\n\nPROGRAMMING\n[NOMBRE]\n\nPROCEDURAL ART\n[NOMBRE]\n\nGENERATIVE MUSIC\n[NOMBRE]\n\nSTORY\n[NOMBRE]\n\nPLAYTESTING\n[NOMBRE]\n\nInspired by Lee Smolin\'s hypothesis of cosmological natural selection.\n\nThank you for playing. Thank you for feeding it.\n\n· · ·\n\nFor everyone who ever left a light on\nfor someone who wasn\'t coming back.',
  };

  // Las transmisiones post-final entran en V.STORY (archivo y pending) solo tras la victoria,
  // y se retiran si el guardado deja de tenerla (p. ej. "Borrar progreso").
  function mergePost(save) {
    if (!save) return;
    const has = V.STORY.some((s) => s.post);
    if (save.victory && !has) { for (const e of V.STORY_POST) if (!V.STORY.some((s) => s.id === e.id)) V.STORY.push(e); }
    else if (!save.victory && has) { for (let i = V.STORY.length - 1; i >= 0; i--) if (V.STORY[i].post) V.STORY.splice(i, 1); }
  }
  if (V.bus) V.bus.on('boot', () => mergePost(V.game && V.game.save));

  V.Story = {
    // Devuelve entradas nuevas que cumplen condiciones y no se han visto.
    pending(save) {
      mergePost(save);
      const out = [];
      // Récord en la penúltima escala: la historia previa al Núcleo se entrega completa antes de la pelea.
      const preBoss = save.record >= V.FINAL_MILESTONE - 1;
      for (const e of V.STORY) {
        if (save.seenLogs.includes(e.id)) continue;
        const w = e.when;
        if (w.record != null && save.record < w.record) continue;
        // tras la victoria, lo que apuntaba a la pelea ya no tiene sentido (p. ej. guardados antiguos)
        if (save.victory && !e.post && e.finale === false) continue;
        if (w.runs != null && !(preBoss && !e.post && (w.record == null || w.record < V.FINAL_MILESTONE))) {
          // runs relativos: cuántas runs desde que se alcanzó el récord requerido. Las post-final cuentan
          // desde la partida de la victoria (si no, con el récord 6 conseguido antes de ganar, n1–n3
          // salían todas juntas justo después del final).
          const base = e.post && save.victoryRun != null ? save.victoryRun
            : w.record != null ? (save.recordRun && save.recordRun[w.record]) || 0 : 0;
          if (save.runs - base < w.runs) continue;
        }
        out.push(e);
      }
      return out;
    },
    sync: mergePost,
    // Al ganar: entradas aún sin leer (orden cronológico). show = se muestran antes de la cinemática;
    // skip = ya no tienen sentido tras la victoria (se archivan como leídas sin mostrarse).
    finaleMissed(save) {
      const show = [], skip = [];
      for (const e of V.STORY) {
        if (e.post || save.seenLogs.includes(e.id)) continue;
        (e.finale === false ? skip : show).push(e);
      }
      return { show, skip };
    },
    text(e) { return V.pick ? V.pick(e) : e[V.lang] || e.es; },
    // Texto de un banner de evento (V.EVENT_LINES) en el idioma actual, o '' si no existe.
    event(key) { const e = V.EVENT_LINES[key]; return e ? (V.pick ? V.pick(e) : e[V.lang] || e.es) : ''; },
  };
})();
