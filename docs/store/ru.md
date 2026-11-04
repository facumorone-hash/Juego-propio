# VOIDLING — Página de Steam en ruso (ru)

Traducción de `docs/STEAM_PAGE.md` (§2, §3 y §4). En Steamworks: **Store Page Admin → idioma "Russian"**. Las marcas **[verificar]** son las mismas que en el documento original: confírmalas antes de publicar.

Glosario usado (igual que en el juego, `js/lang/ru.js`): THRESHOLD/UMBRAL → **ПОРОГ** · Custodians → **Стражи** · matter → **материя** · run → **забег** · scale → **масштаб** · research tree → **древо исследований** · upgrade → **улучшение** · pulse → **импульс** · seed → **семя**. VOIDLING y LUMEN se quedan en latín. Al jugador se le trata de **ты**, como en el juego.


---

## 1. Descripción corta (máx. 300 caracteres)

**ru (251 caracteres):**
> Ты — чёрная дыра размером с песчинку. Поглощай пыль, луны, планеты и звёзды в забегах длиной в секунды, прокачивай свою сингулярность в древе из 48 узлов и узнай, зачем тебя создали. Космический инкрементальный роглайт с историей, которой ты не ждёшь.

*(Recuento con `node -e "console.log('...'.length)"`; Steam cuenta caracteres, no bytes.)*

---

## 2. Descripción larga (BBCode de Steam)

Los GIF son los mismos que en inglés (no llevan texto); si se hacen versiones localizadas, cambiar el nombre del archivo.

```
[img]{STEAM_APP_IMAGE}/extras/voidling_grow.gif[/img]

[h2]Ты начинаешь пылинкой, а заканчиваешь — пожирая галактику.[/h2]

Ты — [b]Voidling[/b], искусственная сингулярность с массой песчинки. Каждый забег длится считаные секунды: ты притягиваешь пыль, крушишь астероиды, растёшь... и испаряешься. LUMEN, ИИ, который тебя создал, собирает поглощённую тобой материю и воссоздаёт тебя чуть сильнее.

Забег за забегом ты проходишь путь от пыли до лун, от лун до планет, от планет до звёзд. Пока не останется лишь одно, что способно тебя насытить, — сердце галактики.

[img]{STEAM_APP_IMAGE}/extras/voidling_planet.gif[/img]

[h2]Инкрементал, который чувствуешь[/h2]
[list]
[*][b]Двигайся, притягивай, поглощай.[/b] Всё, что меньше тебя, по спирали падает за горизонт событий. Всё, что больше, приходится перемалывать приливной силой, пока оно не развалится на куски по размеру.
[*][b]Вселенная меняется вместе с тобой.[/b] Семь видов тел (пыль, камни, астероиды, луны, планеты, звёзды и галактики) и камера, которая всё отъезжает и отъезжает.
[*][b]Забеги по 15–90 секунд.[/b] Стабильность постоянно падает, и чем ты больше, тем быстрее распадаешься. Ещё один забег — без экранов загрузки.
[/list]

[h2]Огромное древо исследований[/h2]
[list]
[*][b]47 улучшений и 184 уровня[/b] в 6 ветвях: Голод, Гравитация, Стабильность, Прилив, Космос и Исток.
[*]Открывай [b]гравитационный импульс[/b], [b]орбитальные луны[/b], перемалывающие всё, чего касаются, [b]кометы[/b], [b]квазарные кристаллы[/b] и второй шанс при испарении.
[*]Самые глубокие ветви раскрываются по мере развития сюжета.
[/list]

[img]{STEAM_APP_IMAGE}/extras/voidling_tree.gif[/img]

[h2]Кто-то на тебя охотится[/h2]
Начиная с пояса астероидов появляются [b]Стражи[/b] — рой антиматерии, который движется с явным умыслом. Позже — пульсары. Уворачивайся, отбрасывай их импульсом... или научись их есть.

[h2]История, которой не ждёшь от игры про поедание всего подряд[/h2]
Вселенная остывает. Доктор Ильза Варга верила, что нашла выход, и ради него создала тебя. А потом исчезла, оставив одну-единственную инструкцию: [i]«Корми его, пока он не сможет кормиться сам».[/i]

Передачи LUMEN, утерянные записи Ильзы и перехваченные сигналы Стражей открываются по мере твоего роста. Шесть глав и финал. И вопрос, который возвращается каждый забег: что было первым, что ты поглотил?

[h2]Особенности[/h2]
[list]
[*]Весь сюжет — примерно за 1,5–2 часа; 100% древа — примерно за 3 часа.
[*]28 достижений Steam.
[*]Полностью процедурная графика в стиле космического неона — чёткая в любом разрешении.
[*]Генеративная эмбиент-музыка: твои комбо звучат как мелодия.
[*]Настройки доступности: громкость по каналам и отключение тряски камеры.
[*]Мышь или клавиатура. Геймпад и Steam Deck: [verify].
[*]Полностью на русском языке: интерфейс и субтитры.
[/list]
```

**Notas:**
- `[verify]` se deja igual que en el original inglés: hay que confirmarlo (o borrarlo) antes de publicar.
- La línea de idiomas del original ("English and Spanish") se adaptó: en la página rusa lo que importa es que el juego está en ruso. La lista completa de idiomas la muestra Steam aparte.
- Ajustes de accesibilidad: el original solo cita volumen por canal y temblor; la build actual tiene además modo daltónico, escala de interfaz, tamaño del texto de transmisiones, reducir destellos y números flotantes. Si se actualiza el original, añadir: «режим для дальтоников, масштаб интерфейса, размер текста, меньше вспышек».
- Sin citas de prensa ni premios (como en el original).

---

## 3. Etiquetas sugeridas (20, por importancia)

Las etiquetas de Steam son **globales** (se eligen en inglés en Steamworks y Steam las muestra traducidas al usuario ruso). Se mantiene el orden del original; entre paréntesis, cómo las verá el público ruso y por qué funcionan allí.

| # | Etiqueta (Steam EN) | Cómo se ve en ruso | Nota para el público ruso |
|---|---|---|---|
| 1 | Incremental | Инкрементальная | Género muy buscado en el Steam ruso (Nodebuster, Cell to Singularity) |
| 2 | Roguelite | Роглайт | «Забег» + прокачка: el bucle que buscan |
| 3 | Idler | Idle / Пассивная | Suele ir junto a Incremental |
| 4 | Bullet Heaven | Bullet Heaven | Lo conecta con Vampire Survivors / Brotato, muy populares en RU |
| 5 | Space | Космос | El tema |
| 6 | Story Rich | Сюжетная | La gran diferencia del nicho |
| 7 | Clicker | Кликер | Público amplio |
| 8 | Action Roguelike | Экшен-рогалик | Búsqueda frecuente |
| 9 | Casual | Казуальная игра | Partidas cortas |
| 10 | Short | Короткая | Compra por impulso (precio regional bajo) |
| 11 | Minimalist | Минимализм | Estética geométrica |
| 12 | Colorful | Красочная | Neón cósmico |
| 13 | Relaxing | Расслабляющая | Música generativa |
| 14 | Singleplayer | Для одного игрока | Filtro estándar |
| 15 | Indie | Инди | Filtro estándar |
| 16 | 2D | 2D | Filtro estándar |
| 17 | Atmospheric | Атмосферная | Tono de la historia |
| 18 | Sci-fi | Научная фантастика | Muy fuerte en Rusia (tradición de Стругацкие, Лем): conviene subirla por encima del puesto 18 si Steam lo permite sin desplazar a las 5 primeras |
| 19 | Procedural Generation | Процедурная генерация | Arte y música procedurales |
| 20 | Emotional | Эмоциональная | El giro de la historia |

Igual que en el original: si en la v1.0 hay buen soporte de mando, cambiar la 20 por **Controller** (Поддержка контроллера).

**Sugerencia extra para la comunidad rusa:** en los anuncios y en el texto de Steam (no como etiqueta), las palabras que más buscan los jugadores rusos de este nicho son «инкрементал», «рогалик», «прокачка», «залипательная» (adictiva). Esta última no se usa en la descripción oficial por ser coloquial, pero funciona muy bien en posts de VK/Telegram y DTF.
