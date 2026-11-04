# VOIDLING — Steam-Shopseite (Deutsch)

Traducción al alemán de `docs/STEAM_PAGE.md` (§2, §3.2 y §4). Para pegar en **Steamworks → Store Page Admin → Deutsch**.
Las marcas **[prüfen]** equivalen a **[verificar]** del original: confirmar antes de publicar.

Glosario usado (igual que en el juego, `js/lang/de.js`): Run = Durchlauf/Run · Escala = Stufe · Custodios = die Wächter · UMBRAL/THRESHOLD = SCHWELLE · árbol = Forschungsbaum · materia = Materie · pulso = Gravitationspuls · logros = Erfolge.

---

## Kurzbeschreibung (máx. 300 caracteres)

**DE (299 caracteres, contado con `node -e "console.log('...'.length)"`):**

> Du bist ein Schwarzes Loch, so groß wie ein Sandkorn. Verschlinge Staub, Monde, Planeten und Sterne in Runs von Sekunden, verbessere deine Singularität in 48 Forschungsknoten und finde heraus, warum es dich gibt. Ein kosmisches Incremental-Roguelite mit einer Geschichte, die du nicht kommen siehst.

*(Si se edita, vuelve a contar: el límite es de 300 caracteres exactos.)*

---

## Ausführliche Beschreibung (BBCode)

Los GIF son los mismos que en la versión inglesa (`voidling_grow.gif`, `voidling_planet.gif`, `voidling_tree.gif`); no llevan texto, así que no hace falta regrabarlos.

```
[img]{STEAM_APP_IMAGE}/extras/voidling_grow.gif[/img]

[h2]Du beginnst als Stäubchen. Am Ende verschlingst du die Galaxie.[/h2]

Du bist [b]Voidling[/b], eine künstliche Singularität mit der Masse eines Sandkorns. Jeder Run dauert nur Sekunden: Du ziehst Staub an, zertrümmerst Asteroiden, wächst … und verdampfst. LUMEN, die KI, die dich erschaffen hat, birgt die Materie, die du absorbiert hast, und baut dich ein kleines bisschen stärker wieder auf.

Run für Run arbeitest du dich hoch: vom Staub zu den Monden, von den Monden zu den Planeten, von den Planeten zu den Sternen. Bis nur noch eines groß genug ist, um dich zu sättigen: das Herz der Galaxie.

[img]{STEAM_APP_IMAGE}/extras/voidling_planet.gif[/img]

[h2]Ein Incremental, das du spüren kannst[/h2]
[list]
[*][b]Bewegen, anziehen, verschlingen.[/b] Alles, was kleiner ist als du, stürzt spiralförmig in deinen Ereignishorizont. Alles, was größer ist, musst du mit Gezeitenkraft zermürben, bis es in mundgerechte Stücke zerbricht.
[*][b]Das Universum wächst mit dir.[/b] Sieben Arten von Himmelskörpern (Staub, Felsen, Asteroiden, Monde, Planeten, Sterne und Galaxien) und eine Kamera, die immer weiter zurückweicht.
[*][b]Runs von 15 bis 90 Sekunden.[/b] Deine Stabilität sinkt mit der Zeit, und je größer du wirst, desto schneller zerfällst du. Nur noch eine Runde – ganz ohne Ladebildschirme.
[/list]

[h2]Ein riesiger Forschungsbaum[/h2]
[list]
[*][b]47 Upgrades und 184 Stufen[/b] in 6 Zweigen: Hunger, Gravitation, Stabilität, Gezeiten, Kosmos und Ursprung.
[*]Schalte den [b]Gravitationspuls[/b] frei, [b]Orbitalmonde[/b], die alles zermahlen, was sie berühren, [b]Kometen[/b], [b]Quasarkristalle[/b] und eine zweite Chance, wenn du verdampfst.
[*]Die tiefsten Zweige öffnen sich erst im Laufe der Geschichte.
[/list]

[img]{STEAM_APP_IMAGE}/extras/voidling_tree.gif[/img]

[h2]Etwas ist hinter dir her[/h2]
Ab dem Asteroidengürtel tauchen die [b]Wächter[/b] auf: ein Schwarm aus Antimaterie, der sich mit Absicht bewegt. Später kommen Pulsare dazu. Weich ihnen aus, sprenge sie mit deinem Puls … oder lerne, sie zu fressen.

[h2]Eine Geschichte, die du von einem Spiel übers Fressen nicht erwartest[/h2]
Das Universum kühlt ab. Dr. Ilse Varga glaubte, einen Ausweg gefunden zu haben, und erschuf dich genau dafür. Dann verschwand sie und hinterließ nur eine einzige Anweisung: [i]„Füttere ihn, bis er sich selbst füttern kann.“[/i]

LUMENs Übertragungen, Ilses verschollene Aufnahmen und die abgefangenen Signale der Wächter schalten sich frei, während du wächst. Sechs Kapitel und ein Finale. Und eine Frage, die in jedem Run zurückkehrt: Was war das Erste, was du je verschlungen hast?

[h2]Features[/h2]
[list]
[*]Komplette Geschichte in ca. 1,5–2 Stunden; 100 % des Baums in ca. 3 Stunden.
[*]28 Steam-Erfolge.
[*]100 % prozedurale Grafik im kosmischen Neon-Look, gestochen scharf in jeder Auflösung.
[*]Generative Ambient-Musik: Deine Kombos klingen wie eine Melodie.
[*]Barrierefreiheit: Lautstärke pro Kanal, Bildschirmwackeln abschaltbar, Blitzeffekte reduzierbar, Farbenblind-Modus, skalierbare Oberfläche. [prüfen]
[*]Maus oder Tastatur. Controller und Steam Deck: [prüfen]
[*]Vollständig auf Deutsch, außerdem auf Englisch, Spanisch und weiteren Sprachen. [prüfen]
[/list]
```

Notas para el editor:
- "Run" se mantiene en la tienda (es lo habitual en la comunidad alemana de roguelites); en el juego la interfaz usa sobre todo "Durchlauf".
- La lista de accesibilidad se amplió con las opciones que ya existen en Ajustes (Reducir destellos, Modo daltónico, Escala de interfaz). Si alguna se retira, quítala de aquí.
- La línea de idiomas debe coincidir con los idiomas finalmente publicados en Steamworks.
- Sin citas de prensa ni premios inventados (misma regla que el original).

---

## Tags (20, nach Wichtigkeit)

En Steamworks las etiquetas se eligen de la lista oficial (en inglés); Steam las muestra traducidas automáticamente a los usuarios alemanes. Mismo orden que §4 del original, con una nota de por qué funcionan en el mercado alemán.

| # | Tag (Steamworks) | Anmerkung |
|---|---|---|
| 1 | Incremental | Kerngenre; Fans von Nodebuster und Cell to Singularity |
| 2 | Roguelite | Kurze Runs + permanente Progression |
| 3 | Idler | Wird oft zusammen mit Incremental gesucht |
| 4 | Bullet Heaven | Verbindung zu Vampire Survivors, Brotato, Ball x Pit |
| 5 | Space | Das Thema; Osmos- und Cell-to-Singularity-Publikum |
| 6 | Story Rich | Hauptunterschied zur Nische |
| 7 | Clicker | Breites „Number go up“-Publikum |
| 8 | Action Roguelike | Häufig gesuchte Variante |
| 9 | Casual | Kurze Runs, sanfte Lernkurve |
| 10 | Short | Respektiert die Zeit; fördert Impulskäufe (4,99 USD) |
| 11 | Minimalist | Klare, geometrische Ästhetik |
| 12 | Colorful | Kosmisches Neon |
| 13 | Relaxing | Generative Musik, hypnotischer Loop |
| 14 | Singleplayer | Standardfilter |
| 15 | Indie | Standardfilter |
| 16 | 2D | Standardfilter |
| 17 | Atmospheric | Ton der Geschichte |
| 18 | Sci-fi | KI, Raumstation, Singularität |
| 19 | Procedural Generation | Prozedurale Grafik und Musik |
| 20 | Emotional | Die Wendung der Geschichte; Publikum von A Dark Room / Universal Paperclips |

Wie im Original: Bei gutem Controller-Support in v1.0 Tag 20 durch **Controller** ersetzen. „Steam Deck“ nicht als Tag verwenden.
