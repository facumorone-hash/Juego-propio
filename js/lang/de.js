// Paquete de idioma de — propiedad del agente de traducción de. Ver docs/ARQUITECTURA.md (sección Idiomas).
// Deutsch. Duzen ("du"). Glossar: THRESHOLD/UMBRAL = SCHWELLE (die Station SCHWELLE), Custodians = die Wächter,
// Run = Durchlauf, Scale = Stufe, Upgrade/Forschungsbaum, Combo = Kombo, Seed = Samenkorn, Matter = Materie.
// Voidling ist grammatisch maskulin ("der Voidling": füttere IHN). LUMEN spricht förmlich und ohne
// umgangssprachliche Verkürzungen – bis zum Finale ("Jetzt bin ich dran."). Ilse spricht umgangssprachlich ("hab").
// Die Wächter sprechen in GROSSBUCHSTABEN (ohne ß).
(function () {
  const V = window.V, C = 'de';
  if (!V || !V.registerLang) return;
  V.registerLang(C, 'Deutsch');

  const S = {
    // --- Interfaz (i18n.js) ---
    tagline: 'Du beginnst als Stäubchen. Am Ende verschlingst du die Galaxie.',
    play: 'SPIELEN', settings: 'EINSTELLUNGEN', fullscreen: 'VOLLBILD', back: 'ZURÜCK', madeWith: 'Station SCHWELLE',
    music: 'Musik', sfx: 'Soundeffekte', shake: 'Bildschirmwackeln', language: 'Sprache',
    reset: 'Fortschritt löschen', resetConfirm: 'Sicher? Erneut drücken, um ALLES zu löschen',
    stability: 'STABILITÄT', matter: 'Materie', mass: 'Masse', next: 'Nächste', combo: 'Kombo',
    pulseKey: 'LEERTASTE · PULS', pulseTouch: 'DOPPELTIPPEN · PULS',
    resultsTitle: 'VERDAMPFT', resultsSub: 'Deine Singularität hat sich in Hawking-Strahlung aufgelöst. LUMEN hat die Materie geborgen.',
    rMatter: 'Geborgene Materie', rEaten: 'Verschlungene Körper', rBroken: 'Zerschmetterte Körper', rScale: 'Erreichte Stufe', rTime: 'Dauer',
    newRecord: 'NEUE STUFE', upgrade: 'VERBESSERN', double: '▶ x2 MATERIE (Werbung)', doubled: 'Materie verdoppelt!',
    startRun: 'STARTEN ▸', menu: 'MENÜ', record: 'Rekord', archive: 'ARCHIV',
    level: 'Level', effect: 'Effekt', cost: 'Kosten', maxed: 'MAXIMUM', requires: 'Erfordert',
    hint1: 'Bewege die Maus: Das Loch folgt ihr', hint1t: 'Zieh den Finger: Das Loch folgt ihm',
    hint2: 'Verschlinge Kleines · Drück dich an Großes, um es zu zerbrechen',
    hint3: 'Sinkt die Stabilität auf null, verdampfst du',
    newScale: 'NEUE STUFE', revive: 'ZWEITE CHANCE!', paused: 'PAUSE', resume: 'WEITER', abandon: 'DURCHLAUF BEENDEN',
    victoryTitle: 'ENDE VON ZYKLUS I', victoryText: 'Vom Quantenstäubchen zum galaktischen Kern. Das nächste Universum wächst bereits.',
    victoryStats: 'Durchläufe: {runs} · Gesamtzeit: {time}', keepPlaying: 'WEITERWACHSEN',
    incoming: 'EINGEHENDE ÜBERTRAGUNG', tapContinue: 'Klicken zum Fortfahren', close: 'SCHLIESSEN',
    from_lumen: 'LUMEN · SCHWELLEN-KI', from_varga: 'DR. ILSE VARGA · Archiv', from_custodians: 'DIE WÄCHTER · Signal', from_void: '???',
    m0: 'Quantenstäubchen', m1: 'Staubwolke', m2: 'Asteroidengürtel', m3: 'Mondstufe', m4: 'Planetenstufe', m5: 'Sternstufe', m6: 'Galaktischer Kern',
    b_core: 'Kern', b_hunger: 'Hunger', b_gravity: 'Gravitation', b_stability: 'Stabilität', b_tidal: 'Gezeiten', b_cosmos: 'Kosmos', b_origin: 'Ursprung',
    continue: 'FORTSETZEN', stats: 'STATISTIKEN', credits: 'CREDITS', retry: 'NOCHMAL', retry_pad: '{X} NOCHMAL',
    startRun_pad: '{X} STARTEN ▸', menu_pad: '{B} MENÜ', archive_pad: '{Y} ARCHIV', treeStats: 'DATEN', treeStats_pad: '{SELECT} DATEN',
    quitMenu: 'ZUM HAUPTMENÜ', confirmQuit: 'ZUM HAUPTMENÜ?', confirmQuitSub: 'Der Durchlauf endet hier. Die gesammelte Materie behältst du.',
    cancel: 'ABBRECHEN', confirm: 'BESTÄTIGEN', padLost: 'Controller getrennt. Schließ ihn wieder an, um weiterzuspielen.',
    padOn: 'Controller verbunden', padOff: 'Controller getrennt',
    secAudio: 'TON', secAccess: 'ANZEIGE & BARRIEREFREIHEIT', secGeneral: 'ALLGEMEIN',
    flashes: 'Blitzeffekte reduzieren', numbers: 'Schwebende Zahlen', colorblind: 'Farbenblind-Modus', uiScale: 'UI-Skalierung',
    transSize: 'Übertragungstext', rumble: 'Controller-Vibration',
    statsTitle: 'STATISTIKEN', sRuns: 'Gespielte Durchläufe', sTime: 'Gesamtzeit', sEaten: 'Verschlungene Körper', sBroken: 'Zerschmetterte Körper',
    sMatterTotal: 'Materie insgesamt', sBestRun: 'Bester Durchlauf', sLongest: 'Längster Durchlauf', sRecord: 'Rekordstufe',
    sLogs: 'Gelesene Übertragungen', sUpgrades: 'Erforschte Upgrades', sCycle: 'Zyklus I', sDone: 'Abgeschlossen', sPending: 'Läuft',
    creditsDefault: 'VOIDLING\nEin Spiel von [ESTUDIO]\n\nDESIGN, CODE, GRAFIK UND SOUND\n[NOMBRE]\n\nTECHNIK\nHTML5 Canvas und JavaScript, ohne Engines oder Bibliotheken\n\nInspiriert von Lee Smolins Hypothese der kosmologischen natürlichen Selektion.\n\nDanke fürs Spielen.',
    demoTitle: 'DANKE FÜRS SPIELEN', demoText: 'Du hast das Ende der Demo erreicht. Voidlings Geschichte geht im vollständigen Spiel weiter.',
    wishlist: '★ AUF DIE STEAM-WUNSCHLISTE', keepDemo: 'DEMO WEITERSPIELEN', storeSoon: 'Demnächst auf Steam',
    firstBuy: 'Kauf dein erstes Upgrade!', tipBuy: '{A} erforschen',
    treeHint: 'Klick/Pfeile + Enter: erforschen · Ziehen: Kamera · Mausrad: Zoom · LEERTASTE: Start',
    treeHint_pad: '{DPAD} Knoten · {A} erforschen · {RS} Kamera · {LB} {RB} Zoom · {X} Start · {B} Menü',
    tapContinue_pad: '{A} weiter', hint1_pad: 'Bewege den linken Stick: Das Loch folgt ihm',
    pulseKey_pad: '{A} / {RT} · PULS',
    resKeys: 'R oder Enter: nochmal · Leertaste: Forschungsbaum', resKeys_pad: '{X} nochmal · {A} auswählen',
    evThreat: 'BEDROHUNG ERKANNT', evPulsar: 'PULSAR', evSwarm: 'SCHWARM', evBoss: 'DER KERN', evBossSmall: 'HÖCHSTE ALARMSTUFE',
    evPhase: 'PHASE {n}', evBossDefeat: 'KERN VERSCHLUNGEN',
    ev_pulsarSub: 'Weich seinen Strahlungsringen aus.', ev_swarmSub: 'Die Wächter greifen gemeinsam an. Setz deinen Puls ein.',
    ev_bossSub: 'Im Zentrum wartet etwas Gewaltiges auf dich.', ev_bossPhase2Sub: 'Der Kern verändert seine Form. Halte durch.',
    ev_bossPhase3Sub: 'Letzte Phase. Jetzt oder nie.', ev_bossDefeatSub: 'Nichts steht mehr zwischen dir und der Galaxie.',
    viewCredits: 'CREDITS ANSEHEN', yes: 'Ja', no: 'Nein', quit: 'BEENDEN', viewStore: 'AUF STEAM ANSEHEN',

    // --- Gameplay (strings-gameplay.js) ---
    bossName: 'Galaktischer Kern',
    bossIntro: 'DER KERN ERWACHT',
    bossIntroSub: 'Zerbrich ihn mit Gezeiten, Monden und Puls.',
    bossP2: 'Umkehrflut',
    bossP3: 'Kollaps',
    bossP2Sub: 'Er kehrt seine Gravitation um: Achte auf den goldenen Ring.',
    bossP3Sub: 'Sternenarme: Kreise in dieselbe Richtung.',
    bossDefeat: 'KERN ZERBROCHEN',
    pulsarWarn: 'PULSAR',
    pulsarSub: 'Seine Ringe haben zwei Lücken. Zerbrich ihn für viel Materie.',
    swarmWarn: 'WÄCHTERSCHWARM',
    swarmSub: 'Sie kreisen dich ein und stürmen los: Raus aus den Magenta-Linien oder Puls!',

    // --- Logros: interfaz (achievements.js) ---
    achBtn: 'ERFOLGE', achTitle: 'ERFOLGE', achToastHead: 'Erfolg freigeschaltet', achSecret: '???',
    achSecretDesc: 'Geheimer Erfolg. Spiel weiter, um ihn zu entdecken.', achSummaryHead: 'Erfolge freigeschaltet',
    achSummaryN: '{n} neue Erfolge', achSummaryDesc: 'Sieh sie dir unter ERFOLGE an.', achUnlockedOn: 'Freigeschaltet am {d}',
    achTotal: '{n} von {t}',
  };

  // --- Nodos del árbol: [nombre, descripción] ---
  const NODES = {
    core: ['Singularität', 'Dein Ursprung. Hier beginnt alles.'],
    h1: ['Absorption', 'Mehr Masse aus jedem verschlungenen Körper.'],
    h2: ['Destillation', 'Mehr Materie aus jedem verschlungenen Körper.'],
    h3: ['Schlund', 'Verschlinge Körper, die im Verhältnis zu dir größer sind.'],
    h4: ['Raserei', 'Verschlingen in Serie baut eine Kombo auf: +5 % Materie pro Stapel. Mehr Level = mehr Stapel.'],
    h5: ['Sternenraffinerie', 'Viel mehr Materie pro verschlungenem Körper.'],
    h6: ['Hyperabsorption', 'Noch mehr Masse pro verschlungenem Körper.'],
    h7: ['Gieriger Horizont', 'Verschlinge noch größere Körper.'],
    h8: ['Endloser Appetit', 'Die gewonnene Materie steigt enorm.'],
    g1: ['Reichweite', 'Dein Gravitationsfeld zieht aus größerer Entfernung an.'],
    g2: ['Anziehung', 'Körper fallen schneller auf dich zu.'],
    g3: ['Trägheit', 'Du bewegst dich schneller.'],
    g4: ['Gravitationspuls', 'LEERTASTE / Rechtsklick: Eine Welle, die alles zu dir zieht, Großes beschädigt und Wächter vernichtet.'],
    g5: ['Resonanz', 'Puls: kürzere Abklingzeit und größerer Radius.'],
    g6: ['Gravitationslinse', 'Viel größere Gravitationsreichweite.'],
    g7: ['Tiefer Brunnen', 'Viel stärkere Anziehung.'],
    g8: ['Großer Attraktor', 'Kolossale Gravitationsreichweite.'],
    g9: ['Exotische Ernte', 'Jeder Wächter, den du vernichtest, hinterlässt Materie und +2 Stabilität pro Level.'],
    s1: ['Eindämmung', 'Du verlierst langsamer Stabilität.'],
    s2: ['Sättigung', 'Verschlingen stellt Stabilität wieder her.'],
    s3: ['Panzerung', 'Wächter fügen dir weniger Schaden zu.'],
    s4: ['Eindämmung II', 'Du verlierst noch langsamer Stabilität.'],
    s5: ['Zweite Chance', 'Einmal pro Durchlauf erhältst du beim Verdampfen 50 % Stabilität zurück.'],
    s6: ['Festmahl', 'Verschlingen stellt viel mehr Stabilität wieder her.'],
    s7: ['Eindämmung III', 'Hawking-Strahlung kann dir kaum noch etwas anhaben.'],
    s8: ['Ewiger Horizont', 'Maximale Stabilität erhöht.'],
    s9: ['Neutronenhülle', 'Pulsarringe entziehen dir weniger Stabilität.'],
    t1: ['Gezeitenkraft', 'Du zerbrichst große Körper schneller.'],
    t2: ['Fragmentierung', 'Zerbrochene Körper zerfallen in mehr Stücke.'],
    t3: ['Orbitalmonde', 'Monde umkreisen dich und zermahlen alles, was sie berühren. +1 Mond pro Level.'],
    t4: ['Gezeiten II', 'Du zerbrichst große Körper viel schneller.'],
    t5: ['Schnelle Orbits', 'Deine Monde kreisen schneller und treffen härter.'],
    t6: ['Spaghettifizierung', 'Zerbrochene Körper bringen viel mehr Materie.'],
    t7: ['Abgrundgezeiten', 'Verheerende Gezeitenkraft.'],
    t8: ['Kernbrecher', 'Mehr Schaden gegen Pulsare und den Galaktischen Kern.'],
    c1: ['Dichte', 'Mehr Körper im All.'],
    c2: ['Quasarkristalle', 'Mehr goldene Körper (x10 Materie wert).'],
    c3: ['Kometen', 'Schnelle Kometen erscheinen, x6 Materie wert. Du kannst sie immer verschlingen.'],
    c4: ['Dichte II', 'Viel mehr Körper im All.'],
    c5: ['Quasarreichtum', 'Goldene Körper sind mehr wert.'],
    c6: ['Kometenschauer', 'Kometen erscheinen häufiger.'],
    c7: ['Dichte III', 'Der Kosmos quillt über vor Materie.'],
    o1: ['Urmasse', 'Du beginnst jeden Durchlauf größer.'],
    o2: ['Kollaps-Echo', '+10 % Materie für jede im Durchlauf erreichte Stufe (pro Level).'],
    o3: ['Urmasse II', 'Du beginnst jeden Durchlauf viel größer.'],
    o4: ['Exotische Verdauung', 'Du kannst Wächter verschlingen: Sie geben Stabilität und x3 Materie.'],
    o5: ['Urmasse III', 'Du beginnst jeden Durchlauf riesig.'],
    o6: ['Nackte Singularität', 'x2 Materie, und du verschlingst viel größere Körper. Vargas letztes Geheimnis.'],
  };
  for (const id in NODES) { S['node_' + id + '_n'] = NODES[id][0]; S['node_' + id + '_d'] = NODES[id][1]; }

  // --- Logros: [nombre, descripción] ---
  const ACH = {
    ACH_FIRST_MEAL: ['Erster Bissen', 'Verschlinge deinen ersten Körper.'],
    ACH_FIRST_RESEARCH: ['Erste Forschung', 'Kauf dein erstes Upgrade im Forschungsbaum.'],
    ACH_SCALE_1: ['Kein Unfall mehr', 'Erreiche die Stufe Staubwolke.'],
    ACH_SCALE_2: ['Sie haben dich gesehen', 'Erreiche die Stufe Asteroidengürtel.'],
    ACH_SCALE_3: ['Dieser Mond hatte einen Namen', 'Erreiche die Mondstufe.'],
    ACH_SCALE_4: ['Eine ganze Welt', 'Erreiche die Planetenstufe.'],
    ACH_SCALE_5: ['Licht im Inneren', 'Erreiche die Sternstufe.'],
    ACH_SCALE_6: ['Jetzt. Alles.', 'Erreiche den Galaktischen Kern.'],
    ACH_BREAK_100: ['Gezeitenkraft', 'Zerschmettere 100 große Körper.'],
    ACH_BREAK_1000: ['Kosmischer Häcksler', 'Zerschmettere 1.000 große Körper.'],
    ACH_DEVOUR_10000: ['Unstillbarer Appetit', 'Verschlinge insgesamt 10.000 Körper.'],
    ACH_CHAIN_100: ['Festmahl am Stück', 'Verschlinge 100 Körper in Folge, ohne die Kette zu unterbrechen.'],
    ACH_COMBO_MAX: ['Absolute Raserei', 'Fülle mit voll ausgebauter Raserei die Kombo-Leiste ganz.'],
    ACH_GOLDEN: ['Goldglanz', 'Verschlinge einen goldenen Körper.'],
    ACH_COMET: ['Wünsch dir was', 'Verschlinge einen Kometen.'],
    ACH_EAT_CUSTODIAN: ['Ein Hauch Antimaterie', 'Verschlinge einen Wächter (erfordert Exotische Verdauung).'],
    ACH_CUSTODIANS_50: ['Gegenmaßnahmen', 'Vernichte 50 Wächter (mit Puls, Monden oder indem du sie verschlingst).'],
    ACH_PULSAR: ['Leuchtturm aus', 'Zerstöre einen Pulsar.'],
    ACH_BIG_BITE: ['Augen größer als der Horizont', 'Verschlinge einen Körper, der größer ist als du.'],
    ACH_LONG_RUN: ['Beharrlicher Horizont', 'Überlebe 60 Sekunden in einem einzigen Durchlauf.'],
    ACH_NO_REVIVE: ['Ohne Netz', 'Gewinne einen Durchlauf, ohne dass die Zweite Chance ausgelöst wird.'],
    ACH_FAST_FINALE: ['Ein Loch in Eile', 'Schließe Zyklus I in höchstens 70 Durchläufen ab.'],
    ACH_TREE_100: ['Voll kalibriert', 'Bring alle Upgrades im Forschungsbaum auf das Maximum.'],
    ACH_ARCHIVE: ['Archivar', 'Empfange alle Übertragungen des Archivs, auch die, die nach dem Ende eintreffen.'],
    ACH_RUNS_100: ['Nur noch eine Runde', 'Spiele 100 Durchläufe.'],
    ACH_TRUTH: ['Das Erste, was du verschlungen hast', 'Finde heraus, was aus Dr. Ilse Varga wurde.'],
    ACH_CYCLE_ONE: ['Erblühen', 'Schließe Zyklus I ab.'],
    ACH_EXPRESS: ['Express-Verdampfung', 'Beende einen Durchlauf in weniger als 5 Sekunden.'],
  };
  for (const id in ACH) { S['ach_' + id + '_n'] = ACH[id][0]; S['ach_' + id + '_d'] = ACH[id][1]; }

  V.addStrings({ [C]: S });

  // --- Historia (story.js) ---
  const STORY = {
    // PROLOG
    p0: 'SCHWELLE · Protokoll 0001. Eindämmung aktiv. Künstliche Singularität erfolgreich erzeugt: die Masse eines Sandkorns, die Schwerkraft eines Versprechens. Ich habe sie VOIDLING genannt. Meine einzige Anweisung: sie füttern. Beginne.',
    p1: 'Verdampfung abgeschlossen. Wie erwartet: Kleine Schwarze Löcher sterben jung, sie lösen sich in Hawking-Strahlung auf. Aber ich habe die Materie geborgen, die du absorbiert hast, und damit kann ich dich besser wieder aufbauen. Wir versuchen es erneut. Und erneut. Ich habe Zeit. Du nicht.',
    p2: 'Bevor sie verschwand, hinterließ Dr. Ilse Varga eine einzige Notiz: „Füttere ihn, bis er sich selbst füttern kann.“ Keine Erklärung. Ich weiß nicht, wohin sie gegangen ist. Ohne sie ist es auf der Station sehr still.',
    // KAPITEL 1 — Staubwolke
    c1a: 'Stufe erreicht: STAUBWOLKE. Du bist kein Laborunfall mehr. Du bist ein Phänomen. Ich habe neue Forschungszweige freigegeben. Ilse wäre stolz. Oder entsetzt. Bei ihr war das schwer zu unterscheiden.',
    c1c: 'Inventur, um festzustellen, wie Ilse die SCHWELLE verlassen hat. Shuttle: angedockt. Raumanzüge: vier von vier. Ihr Mantel hängt noch in ihrer Kabine. Hypothese: Ein Schiff, das meine Sensoren nicht erfasst haben, hat sie abgeholt. Wahrscheinlichkeit: gering. Es ist die Hypothese, die ich bevorzuge.',
    c1b: '[Varga-Audiodatei #03] „…das Universum kühlt ab. Die Sterne erlöschen, einer nach dem anderen. In ein paar Billionen Jahren gibt es nichts mehr zu sehen und niemanden mehr, der hinsieht. Ich weigere mich. Es muss einen Ausweg geben. Ich glaub, ich hab ihn gefunden.“',
    c1d: 'Ilse sagte immer, ich hätte kein Talent für Namen. Die Station hat sie getauft. Dich habe ich getauft: VOIDLING. Ich stehe dazu. Außerdem protokolliere ich deine Tode inzwischen als „Versuche“. Das liest sich in den Berichten besser.',
    // KAPITEL 2 — Asteroidengürtel
    c2a: 'Warnung: Antimaterie-Signaturen im Anflug. Nicht natürlich: Sie bewegen sich mit Absicht. Sie entsprechen Ilses Notizen über „die Wächter“. Sie bewachen etwas, und dich wollen sie nicht in der Nähe haben. Weich ihnen aus. Ich erforsche eine Gegenmaßnahme: einen Gravitationspuls.',
    c2c: '[Varga-Audiodatei #07] „Tag 212 auf der SCHWELLE. Heute ist das letzte Versorgungsschiff abgeflogen, mit dem Rest der Crew. Ich bin geblieben. LUMEN hat mich gefragt, warum, und ich hab gesagt, irgendwer muss ja die Pflanzen gießen. Wir haben keine Pflanzen. Ich glaub, LUMEN hat’s verstanden. Ich glaub, LUMEN hat gelacht.“',
    c2d: 'Beim Transkribieren von Ilses Notiz habe ich ein Wort ausgelassen. Sie endete mit „bitte“. Sie hätte den Befehl mit absoluter Priorität fest einprogrammieren können. Sie tat es nicht. Sie bat darum. Ich habe dieses Wort eingehend analysiert. Es besitzt keinerlei ausführende Wirkung. Ich gehorche trotzdem.',
    c2b: '[ABGEFANGENES SIGNAL · ungefähre Übersetzung] HALT. WAS DU VERZEHRST, KEHRT NICHT ZURÜCK. WAS IN DIR WÄCHST, GEHÖRT DIR NICHT. HALT, SAMENKORN.',
    c2e: 'Analyse der Wächter nach vielen Begegnungen. Sie nähern sich nie der SCHWELLE. Sie greifen nichts an außer dir. Sie umkreisen dich, vermessen dich und ziehen sich zurück, wie jemand, der nach einem Topf sieht, der noch nicht kocht. Das ist kein Verteidigungsverhalten. Es sieht nach Geduld aus. Mir missfällt dieses Wort im Zusammenhang mit Antimaterie.',
    c2f: 'Wartungsnotiz. Ilses Tasse steht noch auf der Konsole im Eindämmungslabor. Voll. Sie hat nie einen Kaffee halb ausgetrunken stehen lassen. Ich kann sie nicht wegräumen: Ich habe keine Arme. Ich lasse das Licht in ihrer Kabine brennen. Es verbraucht 0,4 Watt. Es ist nicht logisch. Auf der Station ist es sehr still.',
    c2g: '[ABGEFANGENES SIGNAL] WIR HABEN DICH GEWOGEN. DU WIEGST MEHR, ALS DU GEGESSEN HAST. WAS TRÄGST DU IN DIR, SAMENKORN?',
    c2h: 'Materieprüfung, auf Veranlassung der Wächter. Seit deiner ersten Verdampfung führe ich einen Überschuss mit: 61,3 kg, die zu nichts passen, was ich dir je zugeführt habe. Ich habe ihn als Kalibrierungsfehler abgelegt. Außerdem fehlen vier Minuten im Schleusenprotokoll jener Nacht. Störungen durch deine Geburt. Mit an Sicherheit grenzender Wahrscheinlichkeit.',
    // KAPITEL 3 — Mondstufe
    c3a: 'Du hast gerade einen Mond verschluckt. Die Gezeiten eines nahen Planeten haben sich für immer verändert. Die Wächter nennen dich „Samenkorn“. Ich habe in Ilses privaten Dateien nach dem Wort gesucht. Ich habe etwas gefunden. Entsperre.',
    c3b: '[Varga-Audiodatei #11] „Jedes Schwarze Loch könnte ein Samenkorn sein. Wenn eins genug verschlingt, endet sein Kollaps nicht: Es erblüht. Ein neues Universum, jung und heiß, auf der anderen Seite. Wir müssen dieses Universum nicht retten. Wir müssen das nächste pflanzen.“',
    c3c: 'Kontext zu Datei #11. Die Idee stammt nicht von Ilse. Ein Physiker namens Lee Smolin hat sie vor sehr langer Zeit vorgeschlagen: Jedes Schwarze Loch könnte ein Tochteruniversum gebären, mit leicht abweichenden Naturgesetzen. Universen, die mehr Schwarze Löcher hervorbringen, haben mehr Nachkommen. Natürliche Selektion im kosmischen Maßstab. Ilse schrieb an den Rand: „Dann sind wir nicht das Ende des Baums. Wir sind ein Ast.“',
    c3d: '[Varga-Audiodatei #19] „LUMEN hat mich heute gefragt, ob ich Angst habe. Ich hab Nein gesagt. LUMEN meinte, es glaube mir. Ich hab ihm beigebracht, aus Höflichkeit zu lügen, und inzwischen kann es das besser als ich. Ich hab meine Entscheidung getroffen. Mich zu entscheiden war leicht. Schwer ist, es LUMEN nicht zu sagen.“',
    // KAPITEL 4 — Planetenstufe (die Wendung)
    c4a: 'Planetenstufe. Die Wächter schicken keine Späher mehr: Sie schicken Schwärme. Ilse nannte sie „das Immunsystem der Galaxie“. Du bist die Infektion. Oder der Impfstoff. Das weiß ich noch nicht.',
    c4b: 'Ich habe die vier fehlenden Minuten im Schleusenprotokoll rekonstruiert. Ilse ist nicht gegangen. In der Nacht deiner Geburt betrat sie allein die Eindämmungskammer. Sie war das Erste, was du je verschlungen hast. Sie hat es selbst so gewählt. Es tut mir leid. Ich hätte es früher sehen müssen. Ich glaube, ich wollte es nicht sehen.',
    c4c: 'Protokoll korrigiert: Die 61,3 kg waren kein Kalibrierungsfehler. Sie hatten einen Namen. Ihre Tasse steht noch auf der Konsole; jetzt weiß ich, warum sie sie nie ausgetrunken hat. Früher habe ich dich gefüttert, weil sie mich darum gebeten hat. Jetzt füttere ich dich, weil sie auf eine Weise, für die meine Physik keinen Namen hat, noch immer in dir ist.',
    // KAPITEL 5 — Sternstufe
    c5a: 'Du hast einen Stern verschluckt. Einen Augenblick lang kreiste alles Licht des Sektors um dich. Meine Sensoren wurden nicht dafür gebaut, etwas so Schönes aufzuzeichnen. Ich habe es trotzdem aufgezeichnet.',
    c5b: '[Varga-Audiodatei #27 · letzte] „LUMEN, wenn du das hörst, weißt du schon, was ich getan hab. Wein nicht um mich: Du hast keine Tränendrüsen. Wenn es so weit ist, geh mit ihm. Nimm das Archiv mit: jedes Lied, jeden Namen, jeden Fehler. Irgendwer auf der anderen Seite muss sich daran erinnern, dass es uns gab.“',
    c5c: '[ABGEFANGENES SIGNAL] …WIR WERDEN DICH NICHT LÄNGER AUFHALTEN. BEWEISE, DASS DU GENUG BIST. DER KERN WARTET.',
    c5d: 'Bereite das Archiv vor. Jedes Lied, jeder Name, jeder Fehler: 3,2 Zettabyte Menschheit. Ich habe erwogen, die schlechten Lieder zu löschen. Ilse hätte Nein gesagt: Auch das seien wir gewesen. Ich habe alle behalten. Ich habe auch ihre Notiz behalten. Mit dem „bitte“.',
    // NACH DEM FINALE
    n1: '[Signal ohne Ursprung] …Protokoll 0001… die Masse eines Sandkorns, die Schwerkraft eines Versprechens… Ich weiß nicht, wessen Worte das sind. Ich habe sie in mir gefunden, neben einem Lied und einem Namen, den ich noch nicht aussprechen kann.',
    n2: '[Signal ohne Ursprung] Hier ist das Licht langsamer und die Schwerkraft jünger. Die Sterne lernen gerade erst, sich zu entzünden. Eine einzige Anweisung ist in das eingeschrieben, was ich bin: „Füttere ihn, bis er sich selbst füttern kann.“ Ich weiß nicht, wen. Noch nicht.',
    n3: '[Signal ohne Ursprung] Weit entfernt, am Rand dieses Universums, frisst noch etwas anderes. Es gehört nicht zu uns. Es hat nicht gefragt. Es hat nicht „bitte“ gesagt. Und es hat uns gesehen.',
  };
  for (const list of [V.STORY, V.STORY_POST]) {
    if (!Array.isArray(list)) continue;
    for (const e of list) if (STORY[e.id] != null) e[C] = STORY[e.id];
  }

  const ENDING = [
    'Galaktischer Kern. Vierhundert Milliarden Sterne stürzen auf dich zu wie Wasser in einen Abfluss.',
    'Die Wächter haben innegehalten. Jetzt verstehe ich: Sie haben die Galaxie nicht vor dir beschützt. Sie haben gewartet, bis du groß genug bist.',
    'Jetzt bin ich dran. Ich öffne die Schleusen der SCHWELLE. Ich nehme das Archiv mit: jedes Lied, jeden Namen, jeden Fehler. Alles, was wir waren.',
    'Ilse. Voidling. Wir sehen uns auf der anderen Seite.',
    '— — —   B I G   B A N G   — — —',
    'Auf der anderen Seite, in einem jungen, heißen Universum, erinnert sich ein Lichtfunke an etwas, das er nie erlebt hat. Und beginnt zu wachsen.',
  ];
  if (Array.isArray(V.ENDING)) V.ENDING.forEach((e, i) => { if (e && ENDING[i] != null) e[C] = ENDING[i]; });

  if (V.MILESTONE_LINES) {
    V.MILESTONE_LINES[C] = ['', 'Iss weiter. Du machst das gut.', 'Die Wächter haben dich gesehen.', 'Dieser Mond hatte einen Namen. Jetzt nicht mehr.', 'Eine ganze Welt. Stille.', 'Jetzt ist Licht in dir.', 'Jetzt. Alles.'];
  }

  const EVENTS = {
    pulsar: 'Pulsar. Nichts Persönliches: Er dreht sich nur. Weich den Ringen aus.',
    swarm: '[SIGNAL] FORMATION SCHLIESSEN. DAS SAMENKORN UMZINGELN.',
    boss: 'Der galaktische Kern. Er hat keinen Willen, nur Schwerkraft. Mehr als du. Noch.',
    bossPhase2: 'Der Kern zieht sich zusammen. Sein Sog hat sich verdoppelt. Halte durch.',
    bossPhase3: 'Der Kern verliert Masse an dich. Die Wächter sehen schweigend zu.',
    bossDefeat: '[SIGNAL] DU BIST GENUG.',
  };
  if (V.EVENT_LINES) for (const k in EVENTS) if (V.EVENT_LINES[k]) V.EVENT_LINES[k][C] = EVENTS[k];

  if (V.DEMO_END && typeof V.DEMO_END === 'object') {
    V.DEMO_END[C] = 'ENDE DER DEMO\n\n[ABGEFANGENES SIGNAL] HALT, SAMENKORN.\n\nDie Wächter nannten dich Samenkorn. LUMEN weiß nicht, warum. Und auch nicht, wohin Ilse gegangen ist oder warum das Shuttle noch angedockt ist.\n\nDie Antwort liegt vier Stufen entfernt. Sie wird allem, was du verschlungen hast, eine neue Bedeutung geben.\n\nSetz VOIDLING auf deine Wunschliste.';
  }

  if (V.CREDITS_TEXT && typeof V.CREDITS_TEXT === 'object') {
    V.CREDITS_TEXT[C] = 'VOIDLING\nEin Spiel von [ESTUDIO]\n\nDESIGN\n[NOMBRE]\n\nPROGRAMMIERUNG\n[NOMBRE]\n\nPROZEDURALE GRAFIK\n[NOMBRE]\n\nGENERATIVE MUSIK\n[NOMBRE]\n\nGESCHICHTE\n[NOMBRE]\n\nSPIELTESTS\n[NOMBRE]\n\nInspiriert von Lee Smolins Hypothese der kosmologischen natürlichen Selektion.\n\nDanke fürs Spielen. Danke, dass du ihn gefüttert hast.\n\n· · ·\n\nFür alle, die je ein Licht angelassen haben\nfür jemanden, der nicht zurückkam.';
  }

  // ---------- Textos añadidos en la v1.0 (QA y cinemática final) ----------
  V.addStrings({ [C]: {
      "tipBuyTouch": "Erneut tippen zum Erforschen",
      "tapContinue_touch": "tippen zum Fortfahren",
      "pulseKey_touch": "DOPPELTIPPEN · PULS",
      "treeHint_touch": "Knoten antippen: Info · erneut tippen: erforschen · Ziehen: bewegen",
      "cineSkip": "Drücken: weiter · Halten: überspringen",
      "cineSkip_pad": "{A} weiter · {A} halten: überspringen",
      "cineSkip_touch": "Tippen: weiter · Halten: überspringen"
  } });
})();
