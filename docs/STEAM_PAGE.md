# VOIDLING — Página de Steam

Todo lo que hay que cargar en **Steamworks → Store Page Admin**, listo para copiar y pegar. Las marcas **[verificar]** son datos que dependen de cómo quede la v1.0 (mando, Steam Deck, nube): confírmalos antes de publicar, porque Valve y los jugadores castigan las promesas que no se cumplen.

Arte: `marketing/steam/` (generado con `tools/store-art/`, ver §10). Tráiler: `tools/store-art/trailer.html` (§8).

---

## 1. Datos básicos

| Campo | Valor |
|---|---|
| Nombre | VOIDLING (en Steamworks: `Voidling`) |
| Género (Steam) | Casual, Indie, Simulation *(opcional)*. Principal: **Indie + Casual** |
| Desarrollador / Editor | [NOMBRE DEL ESTUDIO] / [NOMBRE DEL ESTUDIO] |
| Fecha | "Marzo de 2027" mientras sea *Próximamente*; fecha exacta cuando haya build aprobada (propuesta: **martes 9 de marzo de 2027**, ver `MARKETING.md` §6) |
| Precio | USD 4,99 · descuento de lanzamiento 15 % (1 semana) |
| Idiomas | Español (interfaz + subtítulos), Inglés (interfaz + subtítulos). Sin voces. |
| Funciones de Steam | Logros (28), un jugador, Steam Cloud **[verificar]**, compatibilidad parcial/total con mando **[verificar]** |
| Demo | Sí, para Steam Next Fest de febrero de 2027 (prólogo + capítulos 1–2) |

---

## 2. Descripción corta (máx. 300 caracteres)

**ES (265 caracteres):**
> Eres un agujero negro del tamaño de un grano de arena. Devora polvo, lunas, planetas y estrellas en partidas de segundos, mejora tu singularidad en un árbol de 48 nodos y descubre por qué te crearon. Un incremental roguelite cósmico con una historia que no esperas.

**EN (269 caracteres):**
> You are a black hole the size of a grain of sand. Devour dust, moons, planets and stars in runs that last seconds, upgrade your singularity across a 48-node research tree, and find out why you were made. A cosmic incremental roguelite with a story you won't see coming.

*(Recuento hecho con `node -e "console.log('...'.length)"`; Steam cuenta caracteres, no bytes.)*

---

## 3. Descripción larga (formato BBCode de Steam)

Los GIF van como imágenes subidas en **Store Page Admin → Description → Upload images**; Steam las referencia con `{STEAM_APP_IMAGE}/extras/<archivo>`. Ancho recomendado de GIF: 616 px, < 5 MB, 6–10 s en bucle. Cómo grabarlos: ver §7.

### 3.1 Español

```
[img]{STEAM_APP_IMAGE}/extras/voidling_crecer.gif[/img]

[h2]Empiezas como una mota. Terminas devorando la galaxia.[/h2]

Eres [b]Voidling[/b], una singularidad artificial con la masa de un grano de arena. Cada partida dura segundos: atraes polvo, rompes asteroides, creces... y te evaporas. LUMEN, la IA que te creó, recupera la materia que absorbiste y te reconstruye un poco más fuerte.

Partida a partida pasas del polvo a las lunas, de las lunas a los planetas, de los planetas a las estrellas. Hasta que lo único lo bastante grande para alimentarte es el núcleo de la galaxia.

[img]{STEAM_APP_IMAGE}/extras/voidling_planeta.gif[/img]

[h2]Un incremental que se siente físico[/h2]
[list]
[*][b]Mueve, atrae, devora.[/b] Lo que es más pequeño que tú cae en espiral hacia tu horizonte de sucesos. Lo que es más grande hay que desgastarlo con fuerza de marea hasta partirlo en pedazos comestibles.
[*][b]El universo cambia mientras creces.[/b] Siete escalas de cuerpos —polvo, rocas, asteroides, lunas, planetas, estrellas y galaxias— y una cámara que se aleja sin parar.
[*][b]Partidas de 15 a 90 segundos.[/b] Pierdes estabilidad con el tiempo; cuanto más grande eres, más rápido te deshaces. "Una más" sin pantallas de carga.
[/list]

[h2]Un árbol de investigación enorme[/h2]
[list]
[*][b]47 mejoras y 184 niveles[/b] en 6 ramas: Hambre, Gravedad, Estabilidad, Marea, Cosmos y Origen.
[*]Desbloquea el [b]pulso gravitatorio[/b], [b]lunas orbitales[/b] que trituran lo que tocan, [b]cometas[/b], [b]cristales cuásar[/b] y una segunda oportunidad cuando te evaporas.
[*]Las ramas profundas se revelan al ritmo de la historia.
[/list]

[img]{STEAM_APP_IMAGE}/extras/voidling_arbol.gif[/img]

[h2]Algo te persigue[/h2]
Desde el cinturón de asteroides aparecen los [b]Custodios[/b], un enjambre de antimateria que se mueve con intención. Más tarde llegan los púlsares. Esquívalos, destrúyelos con el pulso... o aprende a comértelos.

[h2]Una historia que no esperas de un juego de comer cosas[/h2]
El universo se está enfriando. La doctora Ilse Varga creyó encontrar una salida y te creó para eso. Después desapareció, y dejó una sola instrucción: [i]"Aliméntalo hasta que pueda alimentarse solo"[/i].

Las transmisiones de LUMEN, los audios perdidos de Ilse y las señales interceptadas de los Custodios se desbloquean a medida que creces. Seis capítulos y un final. Y una pregunta que vuelve en cada partida: ¿qué fue lo primero que devoraste?

[h2]Características[/h2]
[list]
[*]Historia completa en ~1,5–2 horas; árbol al 100 % en ~3 horas.
[*]28 logros de Steam.
[*]Arte 100 % procedural de neón cósmico, nítido en cualquier resolución.
[*]Música ambiental generativa: tus combos suenan como una melodía.
[*]Opciones de accesibilidad: volumen por canal y desactivar el temblor de cámara.
[*]Ratón o teclado. Mando y Steam Deck: [verificar].
[*]Español e inglés.
[/list]
```

### 3.2 English

```
[img]{STEAM_APP_IMAGE}/extras/voidling_grow.gif[/img]

[h2]You start as a speck. You end up devouring the galaxy.[/h2]

You are [b]Voidling[/b], an artificial singularity with the mass of a grain of sand. Each run lasts seconds: you pull in dust, shatter asteroids, grow... and evaporate. LUMEN, the AI that made you, recovers the matter you absorbed and rebuilds you a little stronger.

Run after run you go from dust to moons, from moons to planets, from planets to stars. Until the only thing big enough to feed you is the heart of the galaxy.

[img]{STEAM_APP_IMAGE}/extras/voidling_planet.gif[/img]

[h2]An incremental you can feel[/h2]
[list]
[*][b]Move, pull, devour.[/b] Anything smaller than you spirals into your event horizon. Anything bigger has to be ground down by tidal force until it breaks into bite-sized pieces.
[*][b]The universe changes as you grow.[/b] Seven kinds of bodies (dust, rocks, asteroids, moons, planets, stars and galaxies) and a camera that never stops pulling back.
[*][b]Runs of 15 to 90 seconds.[/b] You lose stability over time, and the bigger you get, the faster you fall apart. One more run, no loading screens.
[/list]

[h2]A huge research tree[/h2]
[list]
[*][b]47 upgrades and 184 levels[/b] across 6 branches: Hunger, Gravity, Stability, Tide, Cosmos and Origin.
[*]Unlock the [b]gravity pulse[/b], [b]orbiting moons[/b] that grind whatever they touch, [b]comets[/b], [b]quasar crystals[/b] and a second chance when you evaporate.
[*]The deepest branches open up as the story unfolds.
[/list]

[img]{STEAM_APP_IMAGE}/extras/voidling_tree.gif[/img]

[h2]Something is hunting you[/h2]
From the asteroid belt onwards come the [b]Custodians[/b], an antimatter swarm that moves with intent. Later, pulsars. Dodge them, blast them with your pulse... or learn to eat them.

[h2]A story you don't expect from a game about eating things[/h2]
The universe is cooling down. Dr. Ilse Varga believed she had found a way out, and she made you for it. Then she vanished, leaving a single instruction: [i]"Feed it until it can feed itself."[/i]

LUMEN's transmissions, Ilse's lost recordings and the Custodians' intercepted signals unlock as you grow. Six chapters and an ending. And one question that comes back every run: what was the first thing you ever ate?

[h2]Features[/h2]
[list]
[*]Full story in ~1.5–2 hours; 100% of the tree in ~3 hours.
[*]28 Steam achievements.
[*]100% procedural cosmic-neon art, crisp at any resolution.
[*]Generative ambient music: your combos play like a melody.
[*]Accessibility options: per-channel volume and camera shake toggle.
[*]Mouse or keyboard. Controller and Steam Deck: [verify].
[*]English and Spanish.
[/list]
```

**Notas de estilo:** no hay citas de reseñas ni premios (todavía no existen; nunca inventarlos). Cuando haya citas reales de prensa o creadores, van arriba del todo de la descripción larga, no en las cápsulas.

---

## 4. Etiquetas recomendadas (20, por importancia)

Steam usa las primeras etiquetas para decidir a quién te muestra. Las 5 primeras pesan más: deben describir **qué hace el jugador**, no el tema.

| # | Etiqueta (Steam EN) | Por qué |
|---|---|---|
| 1 | Incremental | El género central; es lo que buscan los fans de Nodebuster |
| 2 | Roguelite | Bucle de partidas cortas + progresión permanente |
| 3 | Idler | Muy buscada junto a Incremental (aunque no es un idle puro) |
| 4 | Bullet Heaven | Lo conecta con Vampire Survivors / Ball x Pit / Brotato |
| 5 | Space | El tema; atrae a los fans de Osmos y Cell to Singularity |
| 6 | Story Rich | La diferencia principal frente al resto del nicho |
| 7 | Clicker | Público amplio de juegos "number go up" |
| 8 | Action Roguelike | Variante de búsqueda frecuente |
| 9 | Casual | Partidas cortas, curva suave |
| 10 | Short | Respeta el tiempo; atrae compras por impulso |
| 11 | Minimalist | Estética geométrica limpia |
| 12 | Colorful | Neón cósmico |
| 13 | Relaxing | Música generativa; el bucle es hipnótico |
| 14 | Singleplayer | Filtro estándar |
| 15 | Indie | Filtro estándar |
| 16 | 2D | Filtro estándar |
| 17 | Atmospheric | Tono de la historia |
| 18 | Sci-fi | Tema de la historia (IA, estación, singularidad) |
| 19 | Procedural Generation | Arte y música procedurales |
| 20 | Emotional | El giro de la historia; atrae al público de A Dark Room / Universal Paperclips |

Si en la v1.0 hay buen soporte de mando, cambia la 20 por **Controller**. No uses "Steam Deck" como etiqueta: la verificación de Deck se muestra aparte.

---

## 5. Requisitos del sistema

El juego es HTML5 Canvas 2D dentro de Electron (Chromium). Pesa poco y corre en portátiles modestos; lo que más consume es Chromium, no el juego. **[verificar]** con el tamaño real del `.exe` empaquetado (`npm run dist:win`).

| | Mínimos | Recomendados |
|---|---|---|
| SO | Windows 10 de 64 bits | Windows 10/11 de 64 bits |
| Procesador | Doble núcleo a 2 GHz | Cuatro núcleos a 2,5 GHz |
| Memoria | 4 GB de RAM | 8 GB de RAM |
| Gráficos | Gráficos integrados compatibles con DirectX 11 (Intel HD 4000 o equivalente) | Cualquier gráfica dedicada de 1 GB o integrada moderna (Intel Iris Xe, Radeon Vega) |
| Almacenamiento | 400 MB de espacio disponible | 400 MB de espacio disponible |
| Notas | Resolución mínima 1280×720 | 1920×1080 a 60 FPS |

EN (para la casilla en inglés): *OS: Windows 10 64-bit · Processor: Dual-core 2 GHz · Memory: 4 GB RAM · Graphics: DirectX 11 compatible integrated graphics (Intel HD 4000 or equivalent) · Storage: 400 MB available space.* Recomendados: *Quad-core 2.5 GHz · 8 GB RAM · any 1 GB dedicated GPU or modern integrated graphics (Intel Iris Xe, Radeon Vega)*.

---

## 6. Capturas de pantalla (5–8)

Steam pide al menos 5. Reglas de Valve: **tienen que ser del juego** (nada de arte conceptual ni montajes con texto). Las primeras 4 se ven en la parte superior de la página y en las vistas previas al pasar el ratón: son las más importantes. Formato: 1920×1080, PNG, juego en pantalla completa.

| # | Escala / momento | Qué tiene que verse | Cómo conseguirlo |
|---|---|---|---|
| 1 | **Escala planetaria**, devorando un gigante gaseoso | El agujero pegado a un planeta grande con el arco de vida a medias, fragmentos saliendo, partículas en espiral, HUD visible | Partida con la Escala 4 desbloqueada; esperar a un planeta con anillo marcado en rojo y quedarse encima |
| 2 | **Polvo → primera escala** (minuto 1 del juego) | El agujero diminuto, nube de polvo cayendo en espiral, combo activo con números flotantes | Primera o segunda partida de un guardado nuevo |
| 3 | **Árbol de investigación** a media partida | La constelación con 3–4 ramas iluminadas y el tooltip de un nodo potente (Pulso gravitatorio o Lunas orbitales) | Pantalla del árbol con ~25 nodos comprados; pasar el ratón sobre un nodo |
| 4 | **Escala estelar** con lunas orbitales | Estrellas enormes, lunas orbitales triturando, cometa cruzando | Partida tardía con Lunas orbitales y Cometas |
| 5 | **Custodios + pulso** | Enjambre magenta rodeando el agujero y el anillo azul del pulso en plena expansión | Escala 2–3, esperar a 4+ Custodios cerca y pulsar ESPACIO (captura con F12 de Steam o Win+Alt+PrtScn justo después) |
| 6 | **Transmisión de la historia** | La tarjeta de LUMEN o el audio de Varga (ámbar) sobre el juego. Ideal: el registro de esclusas de la Escala 4 **sin** revelar la frase final (captúralo a media escritura) | Archivo → releer, o al desbloquearse |
| 7 | **Núcleo galáctico** | Galaxias espirales cayendo hacia el agujero, la pantalla llena | Partida final |
| 8 | **Pantalla de resultados** con récord nuevo | "Number go up": materia ganada grande y la insignia de récord | Al terminar una partida que bata récord |

Consejo: haz 20–30 capturas por momento y quédate con la mejor. No uses capturas con el cursor del sistema visible.

---

## 7. GIF para la descripción

Grábalos con OBS a 1080p y conviértelos con ffmpeg (ancho 616 px, 15–20 fps, paleta optimizada):

```
ffmpeg -ss 0 -t 8 -i clip.mp4 -vf "fps=18,scale=616:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" voidling_crecer.gif
```

| Archivo | Contenido (6–10 s) | Fuente |
|---|---|---|
| `voidling_crecer.gif` / `voidling_grow.gif` | De mota a planeta acelerado | `trailer.html?start=0` (plano P1–P4) |
| `voidling_planeta.gif` / `voidling_planet.gif` | El gigante gaseoso estirándose y rompiéndose | `trailer.html?start=17.5` o partida real |
| `voidling_arbol.gif` / `voidling_tree.gif` | Comprar 3–4 nodos seguidos en el árbol | Partida real |

Si un GIF pasa de 5 MB, baja a 14 fps o a 100 colores.

---

## 8. Tráiler (45–60 s)

### 8.1 Cómo grabarlo

1. Abre `tools/store-art/trailer.html` en Chrome o Edge (doble clic; funciona sin servidor). Para fijar la resolución: `trailer.html?res=1080` (o `1440`, `2160`). Inglés: `?lang=en`.
2. En OBS: fuente **Captura de ventana** del navegador (o captura de pantalla), lienzo y salida a 1920×1080, 60 FPS, CQP 18–20 (o bitrate 20 000 kbps).
3. Empieza a grabar en OBS, pulsa **F** (pantalla completa) y después **ESPACIO**. Hay 1 s de negro antes del primer plano; el tráiler termina a los ~56 s congelado en la tarjeta final. Para la grabación.
4. Graba una toma en español y otra en inglés. Steam permite subir tráileres por idioma.
5. Ensayo: **←/→** saltan ±5 s, **R** reinicia, **T** muestra el reloj, **L** cambia de idioma. `?start=20` empieza en el segundo 20. `?seed=N` cambia la toma (misma semilla = mismo resultado, fotograma a fotograma).
6. Si el PC no llega a 60 FPS estables, usa `?res=1080` en una pantalla de 1080p y cierra otras pestañas; la simulación usa paso fijo, así que una caída de rendimiento ralentiza la toma en vez de saltar planos (afectaría a la sincronía con la música).
7. `node tools/store-art/trailer-shots.js` saca un storyboard de fotogramas clave a `marketing/trailer/storyboard/` para revisar el guion sin grabar.

**Audio:** la página no tiene sonido. En el editor (DaVinci Resolve gratis, Shotcut, CapCut):
- Música: graba 60–90 s de la música generativa del propio juego desde una partida, o usa una pista con licencia comercial. Busca un tema que tenga un "vacío" de 5 s para el plano en negro (P6).
- Efectos: graba 30 s de partida con sonido para tener "bocados" con el arpegio pentatónico y el golpe del pulso; colócalos en P1, P3 (pulso ~14 s y ~16 s) y P4 (rotura del planeta ~20 s).
- En el corte a negro (30,9 s): silencio total o un único tono grave. En el corte al clímax (36,0 s): golpe fuerte + música a tope.

### 8.2 Guion plano a plano

Todos los planos usan la simulación real del juego (`V.Run` con el bot `run.bot()`), con estadísticas aumentadas y el crecimiento acelerado por guion. Sin HUD. Los tiempos están en `tools/store-art/trailer.js` (tablas `GROW` y `ZOOM` y la función `render`).

| Plano | Tiempo | Imagen | Texto en pantalla (ES / EN) | Audio sugerido |
|---|---|---|---|---|
| P1 · Mota | 0,0–6,0 | Fundido desde negro. Agujero diminuto en primer plano devorando polvo; radio 8 → 15 | 0,9–3,2: **"Devora." / "Devour."** (tercio inferior) | Arranque de la música; bocados que suben de tono |
| P2 · Rocas | 6,0–12,0 | Rocas y asteroides; la cámara empieza a alejarse (r 15 → 58) | 6,6–8,9: **"Crece." / "Grow."** | La música suma percusión |
| P3 · Lunas y Custodios | 12,0–18,0 | Lunas (r 58 → 160). Dos oleadas de Custodios (12,4 y 15,2) se cierran sobre el agujero; el pulso los borra (~14 s y ~16 s) | 13,8–17,6: transmisión de LUMEN **"Esa luna tenía nombre. Ya no." / "That moon had a name. Not anymore."** | Golpe del pulso ×2 |
| P4 · Gigante gaseoso | 18,0–25,0 | Aparece un gigante gaseoso con anillos (18,2); el agujero se pega y la marea lo estira y lo rompe (~20 s). Entran cometas | 24,0–27,6: **"Descubre por qué existes." / "Discover why you exist."** (centro, juego atenuado) | Rotura grave en ~20 s |
| P5 · Estrellas | 25,0–30,9 | Escala estelar (r 430 → 1100), lunas orbitales | 27,6–30,6: LUMEN **"Hay luz dentro de ti ahora." / "There is light inside you now."** | La música crece |
| P6 · El giro | 30,9–36,0 | **Corte seco a negro.** "LUMEN · REGISTRO DE ESCLUSAS" en cian y, a máquina de escribir: | **"Fue lo primero que devoraste." / "She was the first thing you ever ate."** | Silencio o un solo tono |
| P7 · Galaxia | 36,0–43,6 | **Corte seco** con destello al clímax: galaxias espirales cayendo, temblor creciente, r 1180 → 5200. Destello de Big Bang desde 42,6 | — | Música al máximo; impacto en 36,0 |
| P8 · Cierre | 43,6–56,0 | Blanco → campo de estrellas con el agujero en calma. Logo (44,8), frase (46,2), botón (48,0). Se mantiene hasta el final | Logo **VOIDLING** · *"Empiezas como una mota. Terminas devorando la galaxia."* · **"Añádelo a tu lista de deseados" / "Add it to your wishlist"** · "PRÓXIMAMENTE EN STEAM" | Acorde final que se apaga |

**Por qué este orden:** Steam reproduce el tráiler sin sonido en la página y mucha gente lo deja a los 3–5 s, así que el primer segundo ya es juego (nada de logos de estudio) y el crecimiento se entiende sin audio. El texto es mínimo y grande para que se lea en el reproductor pequeño. El giro de la historia aparece como gancho, sin explicarlo.

**Variante corta (30 s) para redes y anuncios:** P1 (0–4), P4 (18–22), P6 (31–35), P7 (38–43), P8 (44–50). Se monta en el editor con la grabación completa.

**Cuando cambie la fecha:** al lanzar, sustituye "PRÓXIMAMENTE EN STEAM" por "YA DISPONIBLE EN STEAM" (`TXT.steam` en `trailer.js`) y "Añádelo a tu lista de deseados" por "Disponible ahora" (`TXT.wish`). Para Next Fest, una variante con "DEMO GRATIS EN STEAM NEXT FEST".

**Honestidad:** el crecimiento del tráiler está acelerado (en el juego real, pasar de mota a núcleo galáctico lleva ~1,5 h de partidas). Es una práctica habitual y aceptada, pero no digas "en una sola partida" en los textos.

---

## 9. Precio regional sugerido

Recomendación: **acepta los precios recomendados de Valve** para USD 4,99 (Steamworks → Precios → "Usar precios recomendados"). Valve los ajusta por poder adquisitivo y los revisa periódicamente; desviarse suele generar quejas en regiones baratas o pérdida de ventas en caras. La tabla es **orientativa** (redondeada a lo que Steam suele proponer; los valores exactos los da la herramienta y cambian con el tiempo):

| Región / moneda | Precio orientativo | Nota |
|---|---|---|
| Estados Unidos (USD) | 4,99 | Precio base |
| Zona euro (EUR) | 4,99 € | Habitual para juegos de USD 4,99 |
| Reino Unido (GBP) | 4,29 £ | |
| Canadá (CAD) | 6,49 | |
| Australia (AUD) | 7,50 | |
| Japón (JPY) | ~¥600 | |
| Brasil (BRL) | ~R$ 18,99 | Mercado importante para incrementales; vale la pena traducir al portugués después |
| México (MXN) | ~MX$ 75 | |
| Latinoamérica y Argentina (región "LATAM – USD") | ~USD 2,99 | Desde 2023, Argentina y gran parte de Latinoamérica pagan en dólares con precio regional |
| Turquía y Oriente Medio ("MENA – USD") | ~USD 2,99 | |
| China (CNY) | ~¥22 | Si se localiza al chino, revisar |
| India (INR) | ~₹199 | |
| Rusia (RUB) | Precio recomendado de Valve | Medios de pago limitados en la región |

**Descuento de lanzamiento:** 15 % durante la primera semana (USD 4,24). Ten en cuenta la regla de enfriamiento de Valve: tras un descuento hay que esperar unas semanas antes del siguiente (consulta la regla vigente en Steamworks → Descuentos). Si lanzas el 9 de marzo, probablemente no podrás entrar en las Rebajas de Primavera de Steam de ese mes; es un coste aceptable a cambio de lanzar justo después de Next Fest.

---

## 10. Arte de tienda: qué subir y dónde

Todo se genera con `tools/store-art/` y ya está exportado en `marketing/steam/` (semilla 7). **Steam solo permite arte y el logo en las cápsulas**: nada de frases, citas, premios ni textos de descuento. Por eso los archivos para Steam son los que **no** llevan `_frase_` en el nombre.

| Steamworks (Store Page Admin → Graphical Assets) | Archivo |
|---|---|
| Header Capsule (920×430) | `marketing/steam/header_capsule_920x430.png` |
| Small Capsule (462×174) | `marketing/steam/small_capsule_462x174.png` |
| Main Capsule (1232×706) | `marketing/steam/main_capsule_1232x706.png` |
| Vertical Capsule (748×896) | `marketing/steam/vertical_capsule_748x896.png` |
| Page Background (1438×810) | `marketing/steam/page_background_1438x810.png` |
| Library Capsule (600×900) | `marketing/steam/library_capsule_600x900.png` |
| Library Hero (3840×1240) | `marketing/steam/library_hero_3840x1240.png` |
| Library Logo (1280×720, PNG transparente) | `marketing/steam/library_logo_1280x720.png` (al subirlo, Steam pide colocar el logo sobre el hero: abajo a la izquierda) |
| Community Icon (184×184) | `marketing/steam/community_icon_184x184.png` (Steamworks lo pide en JPG: conviértelo o súbelo si acepta PNG) |
| Client Icon (.ico) / icono del ejecutable | `marketing/steam/voidling.ico` (16–256 px) y `app_icon_256x256.png`. Para el ejecutable de Electron, el agente de escritorio usa `desktop/icon.ico`: copia este `.ico` ahí si lo queréis como icono final |

Extras con frase (itch.io, galaxy.click, redes, prensa): `marketing/steam/*_frase_es.png`, `*_frase_en.png` y `marketing/press/` (key art 1920×1080 con y sin texto, portada de itch.io 630×500).

### Cómo usar el generador

- **Interactivo:** abre `tools/store-art/index.html` con doble clic (Chrome/Edge). Cada imagen tiene su botón de descarga y "Descargar todo (.zip)" baja el lote completo. "Otra semilla" genera otra composición (posición de escombros, bandas del planeta, estrellas); la misma semilla siempre produce la misma imagen. Abajo, la **prueba de miniatura** muestra cada imagen al tamaño real en que la enseña Steam, sobre el azul de Steam.
- **Automático:** `cd tools/store-art && npm install && node export.js [--seed 7] [--only header,small]`. Usa `playwright-core` (instalado solo en `tools/store-art/node_modules`, no toca el `package.json` raíz) con el Edge o Chrome que ya tiene Windows; no descarga navegadores. Escribe en `marketing/steam/` y `marketing/press/` en unos 10 s.
- **Qué usa del juego:** `V.Render.init()` (sprites procedurales con semilla fija), `V.Render.sprites` (rocas, asteroides, lunas para los escombros), `V.Render.background` (nebulosa y estrellas) y `V.Render.drawHole` (halo, núcleo y anillo de fotones). Encima añade en alta resolución el disco de acreción, la lente gravitatoria, el gigante gaseoso (misma paleta que el sprite del juego) y la corriente de marea. Si otro agente cambia `render.js`, el generador cae a dibujos propios en lugar de romperse.

**Recomendación:** este arte es sólido para la página "Próximamente" y para Next Fest. Si hay presupuesto (USD 150–400, ver `GDD.md` §8.3), un artista de cápsulas puede usarlo como referencia de composición y paleta.

---

## 11. Checklist de envío de la página

- [ ] Descripciones corta y larga en ES y EN (Steam → idiomas de la página: añadir español).
- [ ] 20 etiquetas, en el orden de §4.
- [ ] Todas las cápsulas de §10 (Steam rechaza la revisión si falta alguna obligatoria).
- [ ] 5–8 capturas (§6) y al menos un tráiler (§8). El tráiler puede llegar después del primer envío, pero la página convierte mucho mejor con él.
- [ ] Requisitos del sistema (§5).
- [ ] Cuestionario de contenido, incluida la **divulgación del uso de IA**: declara con honestidad lo que corresponda según la definición vigente de Valve (por ejemplo, textos de la historia o de la tienda redactados con ayuda de IA). Ocultarlo puede costar la retirada de la página.
- [ ] Clasificación por edades (cuestionario IARC en Steamworks).
- [ ] Enlaces: web/itch.io, Discord, redes (cuando existan).
- [ ] Enviar a revisión: Valve tarda ~3–5 días hábiles. La página tiene que estar visible como "Próximamente" al menos 2 semanas antes del lanzamiento.
