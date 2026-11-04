# VOIDLING — Plan de marketing (noviembre de 2026 → marzo de 2027)

**Objetivo:** 7.000–10.000 deseados (wishlists) el día del lanzamiento en Steam (propuesta: martes 9 de marzo de 2027).
**Embudo:** clips cortos + Reddit + versión web gratuita (CrazyGames, itch.io, galaxy.click) → página de Steam → deseado → demo en Next Fest → compra.
**Regla de oro:** cada pieza de contenido termina en un único llamado a la acción: *"Añádelo a tu lista de deseados"* con el enlace de Steam. Nada de pedir cinco cosas a la vez.

Lo que ya existe y se reutiliza: arte en `marketing/steam/` y `marketing/press/`, tráiler en `tools/store-art/trailer.html` (guion en `STEAM_PAGE.md` §8), textos de tienda en `STEAM_PAGE.md`, ficha de prensa en `PRESSKIT.md`.

> **Sobre las cifras:** este documento no inventa resultados. Las referencias de conversión son rangos orientativos habituales en el sector indie, con mucha variación entre juegos; sirven para detectar problemas, no como promesa.

---

## 1. Cuánto hace falta, en números

| Tramo | Fechas | Deseados acumulados (meta) | De dónde salen |
|---|---|---|---|
| Página recién publicada | ~20 nov – 31 dic | 1.000–1.500 | Reddit, primeros clips, itch.io/galaxy.click, amigos |
| Calentamiento | ene – mitad de feb | 3.000–4.000 | 3 clips/semana, creadores, CrazyGames, actualizaciones de la web |
| Steam Next Fest | ~22 feb – 1 mar | +2.500–5.000 | Demo, retransmisiones, visibilidad del festival |
| Cuenta atrás | 1 – 9 mar | 7.000–10.000 | Anuncio de fecha, creadores, clips del giro de la historia |

Si a mitad de enero hay menos de 2.000, hay que reaccionar (ver §9): cambiar la cápsula, el primer segundo del tráiler o el tipo de clip, no esperar a Next Fest.

---

## 2. Plan semana a semana

Semanas de lunes a domingo. **Tú** = tareas que solo puede hacer el dueño (cuentas, publicar, escribir a personas). Ritmo base: **3 clips por semana** desde diciembre (lunes, miércoles y viernes o sábado), mismas piezas en TikTok, YouTube Shorts e Instagram Reels.

### Noviembre de 2026 — cimientos

| Semana | Foco | Tareas |
|---|---|---|
| **S1 · 2–8 nov** | Cuentas y página | **Tú:** Steamworks + USD 100 + impuestos/banco (lo más urgente, ver `LANZAMIENTO.md`). Crear cuentas del juego: TikTok, YouTube, X/Bluesky, Instagram, Reddit (usar tu cuenta personal con historial, no una nueva), itch.io, CrazyGames. Reservar el nombre "voidling" donde se pueda. Revisar el arte de `marketing/steam/` y elegir semilla definitiva. |
| **S2 · 9–15 nov** | Pruebas | **Tú:** 5–10 testers. Mientras tanto, grabar 30–40 min de partida limpia a 1080p60 (material bruto para clips). Grabar el tráiler (ES y EN). Sacar las 8 capturas de `STEAM_PAGE.md` §6. |
| **S3 · 16–22 nov** | **Página "Próximamente"** | Enviar la página a revisión (~18 nov). Preparar 6 clips por adelantado (no publicar todavía). Crear un servidor de Discord mínimo (#anuncios, #feedback, #capturas). |
| **S4 · 23–29 nov** | **Página publicada** | Publicar la página en cuanto Valve la apruebe. Primer post en r/incremental_games y r/IndieDev (§4). Subir la versión web a itch.io y galaxy.click con el botón "Wishlist on Steam" bien visible. Enviar a CrazyGames (su revisión tarda 1–2 semanas). Primer clip. Ojo: semana del Black Friday y de las Rebajas de Otoño de Steam; hay mucho ruido, no gastes aquí los mejores clips. |

### Diciembre de 2026 — encontrar el clip que funciona

| Semana | Foco | Tareas |
|---|---|---|
| **S5 · 30 nov–6 dic** | Prueba de ganchos | 3 clips con ganchos distintos (crecimiento, giro de historia, "number go up") para ver cuál retiene. Responder **todos** los comentarios el primer día. |
| **S6 · 7–13 dic** | Creadores (ronda 1) | Lista de 40 creadores (§6). Enviar 15 correos con clave de la build actual (o enlace a la web). Clip ×3. |
| **S7 · 14–20 dic** | Web | CrazyGames publicado (si fue aprobado). Post en r/playmygame con la versión web. Clip ×3, repitiendo el formato que mejor fue. Steam Rebajas de Invierno empiezan hacia el 18–19 dic: no hay mucho que hacer en la página, aprovecha para producir clips. |
| **S8 · 21–27 dic** | Fiestas | Ritmo reducido: 2 clips programados. Mensaje de fin de año en Discord/redes con un GIF nuevo. |

### Enero de 2027 — crecer y preparar la demo

| Semana | Foco | Tareas |
|---|---|---|
| **S9 · 28 dic–3 ene** | Balance | Revisar métricas de diciembre (§8). Decidir si cambiar cápsula/tráiler. Clip ×2. |
| **S10 · 4–10 ene** | Next Fest | **Tú:** inscribir el juego en Steam Next Fest de febrero desde Steamworks (la inscripción suele cerrar semanas antes del festival; confirma la fecha límite exacta en Steamworks → Upcoming Events). Crear la app de la demo en Steamworks. Clip ×3. |
| **S11 · 11–17 ene** | Demo | Build de demo (`npm run dist:win:demo`), página de la demo, revisión de Valve. Creadores ronda 2: 15 correos más, con la demo. Post de devlog en r/IndieDev ("cómo hice todo el arte por código"). Clip ×3. |
| **S12 · 18–24 ene** | Prensa | Enviar el press kit (`PRESSKIT.md`) a 20–30 medios pequeños y blogs de indies/incrementales en ES y EN. Clip ×3. |
| **S13 · 25–31 ene** | Contenido de historia | Serie de 3 clips sobre la historia sin spoilers fuertes ("La IA que te creó escribe un diario"). Actualizar la web con lo aprendido. |

### Febrero de 2027 — Next Fest

| Semana | Foco | Tareas |
|---|---|---|
| **S14 · 1–7 feb** | Demo pulida | Demo final subida y aprobada. Ensayo de retransmisión (§7). Correos a creadores: "la demo sale en Next Fest el 22, ¿os mando una clave antes?" Clip ×3. |
| **S15 · 8–14 feb** | Calentamiento | Anunciar Next Fest en todas las redes. Programar 2 retransmisiones de Steam (Steamworks → Broadcasting). Tráiler de Next Fest (variante "DEMO GRATIS"). Clip ×3. |
| **S16 · 15–21 feb** | Última semana | Publicar la demo unos días antes del festival si Valve lo permite en las fechas de esa edición (dar tiempo a que la gente la juegue y la añada a deseados). Post en r/incremental_games anunciando la demo. Clip ×3. |
| **S17 · ~22 feb–1 mar** | **Steam Next Fest** | Plan del §7. Responder todo en el foro de Steam y en Discord. Clip diario. |

### Marzo de 2027 — lanzamiento

| Semana | Foco | Tareas |
|---|---|---|
| **S18 · 1–7 mar** | Cuenta atrás | Anuncio de fecha en la página de Steam (evento "Lanzamiento") y en todas las redes. Claves a creadores que jugaron la demo. Notas de "qué cambió desde la demo". Build final aprobada (la revisión de la build tarda ~3–5 días hábiles: subirla como muy tarde el 1–2 mar). |
| **S19 · 8–14 mar** | **Lanzamiento (9 mar)** | Checklist del §10. Post de lanzamiento en Reddit. Clip diario durante 5 días. |
| **S20 · 15–21 mar** | Primera semana | Responder reseñas (todas las negativas con una solución concreta). Primer parche si hace falta. Agradecer públicamente a los creadores que lo jugaron. |
| **S21 · 22–31 mar** | Cola larga | Anunciar el roadmap (Ciclo II, modo infinito, semilla diaria). Postmortem de cifras en r/IndieDev (la comunidad lo agradece y da visibilidad). |

---

## 3. 40 ideas de clips cortos (TikTok / Shorts / Reels)

Formato: vertical 1080×1920, 10–25 s, **el gancho en los 2 primeros segundos** (texto grande arriba + imagen que ya se mueve), subtítulos siempre, final con "Wishlist en Steam" + 1 s de logo. Grabar en horizontal 1080p y recortar el centro, o jugar en una ventana vertical (el juego se adapta a cualquier proporción). El tráiler (`trailer.html`) sirve como fuente para los clips de crecimiento: `?start=` salta a cualquier plano.

**Crecimiento (el gancho principal)**
1. "Este punto se va a comer la galaxia" — la mota de 1 s, luego time-lapse hasta el núcleo galáctico.
2. "Día 1 vs. día 30 de mi agujero negro" — pantalla partida: partida 1 contra partida 60.
3. "POV: eres un agujero negro con hambre" — primera persona, polvo → luna.
4. "Cuánto tardas en comerte una luna" — cronómetro en pantalla, de 0 a la primera luna.
5. "De grano de arena a estrella en 15 segundos" — el tráiler P1–P5 acelerado.
6. "La cámara no deja de alejarse" — zoom out continuo, sin cortes.
7. "Cada vez más grande. Cada vez más rápido." — montaje con música en crescendo.
8. "Esto es lo que pasa cuando un agujero negro se come un planeta" — el gigante gaseoso estirándose.

**Satisfacción / ASMR visual**
9. "El sonido de comerse 100 asteroides seguidos" — combo largo con el arpegio pentatónico, audio protagonista.
10. "Espaguetificación, explicada en 10 segundos" — planeta estirándose + un subtítulo científico.
11. "El pulso gravitatorio más satisfactorio" — enjambre magenta borrado por el anillo azul.
12. "Lunas orbitales: la trituradora" — tres lunas moliendo un planeta.
13. "No sabía que necesitaba ver esto" — galaxias espirales cayendo hacia el agujero en bucle perfecto.
14. "Cometa dorado = ×6" — persecución de un cometa y la cifra que salta.

**"Number go up" / progresión**
15. "Mi primera partida: 12 de materia. La número 50:" — corte al número enorme.
16. "Este árbol tiene 184 niveles de mejora" — barrido por la constelación entera.
17. "La mejora que lo rompe todo" — antes/después de Fauces o Pulso.
18. "Construí el agujero negro más estable posible" — build de Estabilidad, partida larguísima.
19. "Speedrun: núcleo galáctico en el menor número de partidas" — reto con contador.
20. "Compré solo una rama del árbol. Esto pasó." — reto de restricción.

**Historia (el diferencial)**
21. "La IA que me creó lleva un diario" — transmisión de LUMEN a máquina de escribir sobre el juego.
22. "En este juego, morir tiene explicación" — "Los agujeros pequeños se evaporan. LUMEN te reconstruye."
23. "¿Qué fue lo primero que te comiste?" — pregunta en pantalla, negro, logo. Sin respuesta.
24. "Un juego de comer cosas me hizo llorar (casi)" — reacción + frase del giro tapada.
25. "Los enemigos me llaman 'semilla'" — la señal interceptada de los Custodios.
26. "La teoría real detrás del juego" — la selección natural cosmológica de Lee Smolin, en 15 s.
27. "No leas el registro de esclusas" — el texto empieza a escribirse... corte.

**Desarrollo (para r/IndieDev y la audiencia de devs)**
28. "Todo el arte de mi juego es código" — los sprites generándose, cámara rápida.
29. "Mi juego pesa menos que esta foto" — comparación de tamaño (<100 KB de código).
30. "Un bot jugó mi juego 500 veces para balancearlo" — gráfico del simulador de balance.
31. "Así se ve mi juego sin efectos / con efectos" — antes/después del "juice".
32. "Cómo hice la música: nunca suena igual dos veces" — la música generativa explicada.
33. "Hice la cápsula de Steam con el motor del juego" — el generador de `tools/store-art` en acción.

**Comunidad / interacción**
34. "Comenta un número y me como ese planeta" — respuestas a comentarios con clips personalizados.
35. "Ponle nombre a esta luna antes de que me la coma" — engagement directo.
36. "Reaccionando a vuestros récords" — capturas que manda la comunidad.
37. "¿Polvo o asteroides? Elige mi próxima mejora" — encuesta.

**Comparación / referencias (con cuidado, sin usar material ajeno)**
38. "Si te gusta Nodebuster, prueba esto" — 10 s de partida + árbol.
39. "Osmos, pero tú eres el agujero negro" — mecánica de absorber en 5 s.
40. "Vampire Survivors al revés: todo viene hacia ti porque tú lo atraes" — el bucle explicado con imagen.

**Producción:** graba en lotes (1 tarde = 6 clips). Rota los formatos y repite el que mejor retenga; la métrica clave en los primeros días es el **porcentaje de visualización completa**, no los likes.

---

## 4. Reddit: borradores respetando la autopromoción

Reglas generales que aplican a todos: usa tu cuenta personal con historial real; participa en el subreddit antes y después de publicar (comenta otros juegos, responde a todos); **una publicación por subreddit cada varias semanas como máximo**; pon el flair correcto; nada de títulos en mayúsculas ni de "¡¡ÉPICO!!". Reddit aplica una regla informal de "no más de ~10 % de tu actividad es autopromoción". **Lee las reglas fijadas y la barra lateral de cada subreddit el mismo día de publicar**: cambian y los moderadores borran sin avisar.

### 4.1 r/incremental_games (EN)

Comunidad muy exigente y muy valiosa: quiere juegos **jugables** (enlace web) y desarrolladores que escuchan. Suele tener hilos semanales para feedback de juegos en desarrollo; si la regla vigente lo pide, publica ahí en lugar de un post propio. Flair típico: el de juego/web/Steam que corresponda.

> **Title:** I made a short incremental where you're a black hole that grows from a speck of dust to the galactic core (free web version + Steam page)
>
> Hi! I've been working on **Voidling**, an incremental roguelite where each run lasts 15–90 seconds: you pull in dust, shatter asteroids, grow, and eventually evaporate. The AI that made you rebuilds you stronger from the matter you absorbed.
>
> - 48-node / 184-level research tree across 6 branches
> - The universe changes as you grow: dust → rocks → asteroids → moons → planets → stars → galaxies
> - There's an actual story told through unlockable transmissions (no spoilers, but it goes somewhere)
> - Full story in ~1.5–2h, 100% in ~3h
>
> **Play it free in your browser:** [itch.io link]
> Steam page (wishlist if you like it, it helps a lot): [Steam link]
>
> I'm especially looking for feedback on **pacing between the asteroid belt and the lunar scale** — my balance bot says it's fine, but bots don't get bored. Where did you stall?

### 4.2 r/IndieDev (EN)

Acepta autopromoción con flair. Funciona mejor un **GIF/vídeo nativo** (subido a Reddit, no un enlace) y un título que cuente algo del desarrollo.

> **Title:** Every sprite in my game is generated by code at startup — here's a black hole eating a gas giant
>
> *(vídeo nativo: el plano P4 del tráiler, 10–15 s)*
>
> **Comentario propio (primero):** Voidling is an incremental roguelite in plain HTML5 Canvas + JavaScript, no engine, no art files: rocks, moons with craters, ringed gas giants, stars and spiral galaxies are all drawn procedurally when the game boots. Same for the music (generative) and sound effects (synthesized). Happy to answer anything about the approach. Steam page if you want to follow it: [link]

Otros títulos que funcionan en r/IndieDev: "I balanced my game by letting a bot play it 500 times", "My entire game is smaller than this GIF", "I made my Steam capsule art with my own game's renderer".

### 4.3 r/playmygame (EN)

Exige un juego **jugable gratis** y una descripción. Formato de título habitual con plataforma entre corchetes (confirma la plantilla vigente en las reglas).

> **Title:** [Browser] Voidling — grow from a speck of dust into a black hole that eats the galaxy
>
> **Game:** Voidling
> **Platform:** Browser (Windows build coming to Steam)
> **Link:** [itch.io link]
> **Description:** Short incremental roguelite. Move with the mouse; anything smaller than you falls in, anything bigger has to be ground down first. Runs last seconds; spend the matter you collect on a big upgrade tree and unlock the story.
> **Free to play:** Yes
> **Involvement:** Solo developer.
>
> I'd love to know the moment you stopped playing and why.

### 4.4 r/indiegaming (EN)

Más orientado a jugadores; autopromoción permitida con moderación (suele haber límite de frecuencia por desarrollador). Un post visual y directo:

> **Title:** You start as a speck. You end up devouring the galaxy. — my incremental roguelite about a black hole with a story
>
> *(tráiler de 30 s subido como vídeo nativo)*
>
> **Comentario propio:** Voidling comes to Steam in March 2027 (USD 4.99). There's a free demo for Next Fest in February and a free web version right now: [itch.io]. Wishlist: [Steam]. AMA about the game!

### 4.5 Comunidades en español

r/videojuegos, r/argentina (los domingos de "hice algo" o equivalentes, según reglas), r/devsarg o r/gamedevES: misma lógica, tono cercano, contar la historia del desarrollo. Los posts en español suelen tener menos alcance pero más conversión emocional y apoyo local.

### 4.6 Calendario de Reddit (máximo una vez por subreddit cada 3–4 semanas)

| Fecha aprox. | Subreddit | Ángulo |
|---|---|---|
| 24–26 nov | r/incremental_games | Lanzamiento de la web + página de Steam |
| 27–29 nov | r/IndieDev | Arte por código (vídeo) |
| 15–17 dic | r/playmygame | Versión web |
| 12–15 ene | r/IndieDev | Bot de balance |
| 19–22 ene | r/indiegaming | Tráiler |
| 18–20 feb | r/incremental_games | Demo de Next Fest |
| 9 mar | r/incremental_games, r/indiegaming | Lanzamiento |
| 25–31 mar | r/IndieDev, r/gamedev | Postmortem con cifras reales |

---

## 5. Email a creadores de contenido

Personaliza siempre la primera línea (menciona un vídeo concreto suyo). Asunto corto, sin mayúsculas ni signos de exclamación. Una clave por creador, registrada en la hoja de seguimiento. Envía desde un correo con el dominio del estudio si es posible. No pidas reseña positiva ni impongas condiciones.

### 5.1 Español

> **Asunto:** Voidling — clave de Steam para [NOMBRE DEL CANAL]
>
> Hola, [NOMBRE]:
>
> Vi tu vídeo de [JUEGO/VÍDEO CONCRETO] y me gustó [DETALLE REAL]. Por eso pensé que Voidling podría encajar en tu canal.
>
> Voidling es un incremental roguelite: eres un agujero negro del tamaño de un grano de arena y, partida a partida, creces hasta devorar el núcleo de la galaxia. Las partidas duran segundos, hay un árbol de 184 niveles de mejora y una historia con un giro que se va desbloqueando mientras juegas. Se juega entero en ~1,5–2 horas.
>
> - Tráiler (1 min): [ENLACE]
> - Página de Steam: [ENLACE]
> - Press kit con capturas y GIF: [ENLACE]
> - Tu clave de Steam: [CLAVE] *(o: "si te interesa, te mando una clave")*
>
> Sale el [FECHA] a USD 4,99. Puedes monetizar el vídeo sin problema. Si no es para ti, no hace falta que respondas.
>
> Gracias por tu tiempo,
> [NOMBRE] — [ESTUDIO]
> [CORREO] · [DISCORD]

### 5.2 English

> **Subject:** Voidling — Steam key for [CHANNEL NAME]
>
> Hi [NAME],
>
> I watched your video on [SPECIFIC GAME/VIDEO] and really liked [REAL DETAIL], so I thought Voidling might be a good fit for your channel.
>
> Voidling is an incremental roguelite where you're a black hole the size of a grain of sand that grows, run after run, until it devours the galactic core. Runs last seconds, there's a 184-level upgrade tree, and a story with a twist that unlocks as you play. You can finish it in about 1.5–2 hours.
>
> - Trailer (1 min): [LINK]
> - Steam page: [LINK]
> - Press kit with screenshots and GIFs: [LINK]
> - Your Steam key: [KEY] *(or: "happy to send a key if you're interested")*
>
> It launches on [DATE] for USD 4.99. Feel free to monetize any content. If it's not for you, no need to reply.
>
> Thanks for your time,
> [NAME] — [STUDIO]
> [EMAIL] · [DISCORD]

**Seguimiento:** un único recordatorio amable 7–10 días después, solo si no hubo respuesta y hay una novedad real (demo, fecha de lanzamiento). Nunca más de uno.

---

## 6. Cómo encontrar creadores de incrementales y roguelites

**Dónde buscar**
1. **YouTube:** busca "Nodebuster", "Ball x Pit", "Vampire Survivors like", "incremental game", "idle game", "Cell to Singularity", "Brotato" y filtra por "este mes". Apunta a canales de **1.000 a 100.000 suscriptores** que suban juegos nuevos con regularidad: responden más y su público prueba juegos baratos.
2. **Twitch:** directorio de categorías de juegos parecidos (Nodebuster, Vampire Survivors, Ball x Pit, Brotato) y la etiqueta "Incremental". Mira quién retransmite indies pequeños entre semana.
3. **TikTok/Shorts:** hashtags #incrementalgame #idlegame #indiegame #roguelite; cuentas que reseñan juegos de Steam baratos ("juegos de menos de 5 dólares", "hidden gems").
4. **Quién jugó a tus referentes:** en SullyGnome (Twitch) o en la sección de vídeos de la página de Steam de Nodebuster y similares se ve qué creadores los jugaron.
5. **Herramientas:** **Steam Curator Connect** (Steamworks, gratis: envía claves a curadores y creadores con perfil en Steam), **Keymailer** y **Lurkit** (plataformas de distribución de claves con plan gratuito o de pago; revisa condiciones vigentes).
6. **Español:** busca "juegos indie", "joyas ocultas de Steam", "incremental" en YouTube en español; hay muchos canales medianos de Latinoamérica y España que responden a correos personalizados.
7. **Canales grandes conocidos del género** (como Splattercat, Wanderbots, Retromation u Olexa, entre otros): reciben cientos de correos; escríbeles igualmente con un correo muy cuidado, pero que no sean la base del plan. Comprueba antes que sigan activos y qué tipo de juego cubren.

**Hoja de seguimiento** (Google Sheets): canal · plataforma · idioma · suscriptores · vídeo de referencia · correo/contacto · fecha de envío · clave · respuesta · fecha de publicación · enlace · visitas · deseados ese día (en Steamworks).

**Volumen:** 40–60 contactos en total entre diciembre y marzo. Lo normal es que responda una minoría y que publique una parte de esa minoría; por eso se envían bastantes y bien personalizados.

---

## 7. Plan para Steam Next Fest (febrero de 2027)

Valve organiza Next Fest tres veces al año; la de febrero de 2027 debería ser hacia el **22 de febrero – 1 de marzo** (confírmalo en Steamworks → Upcoming Events). Un juego solo puede participar **una vez**, y tiene que tener la página "Próximamente" publicada y una demo.

**Antes (enero)**
- Inscripción en Steamworks antes de la fecha límite (suele cerrar con bastante antelación: hazlo en la S10).
- Demo = prólogo + capítulos 1–2 (`V.CONFIG.demo = true`, termina en la escala 2). Tiene que terminar con una pantalla clara: "Gracias por jugar · Añádelo a tu lista de deseados" con botón a la tienda (lo gestiona el agente de UX/escritorio: confirmarlo).
- La demo tiene que ser **pulida, no larga**: 20–30 min de juego y que termine justo después del primer gancho de historia (los Custodios: "DETENTE, SEMILLA.").
- Guardado de la demo que se traslade al juego completo, si es viable (muy valorado por los jugadores; confirmarlo con el agente de escritorio).
- Página de Steam: añadir un evento "Demo disponible en Next Fest" y cambiar el tráiler a la variante de Next Fest.

**Durante (8 días)**
- **Retransmisión en la página de Steam:** Valve destaca los juegos que emiten. Programa 2–4 emisiones (1–2 h) en horarios de América y Europa: jugar la demo en directo, responder el chat, enseñar el árbol completo del juego final. Puede ser una emisión pregrabada en bucle si no puedes estar en directo (revisa las reglas de la edición).
- Publicar un clip al día y un post en r/incremental_games anunciando la demo.
- Responder en el foro de Steam de la demo cada día.
- Mirar a diario: jugadores de la demo, tiempo medio de juego, deseados del día.

**Después**
- Anunciar la fecha de lanzamiento dentro de la misma semana (aprovecha el impulso).
- Correo a los creadores que jugaron la demo con la clave del juego completo.
- Si el tiempo medio de juego de la demo es muy bajo (menos de 10–15 min), revisa el arranque antes del lanzamiento: es la señal más clara de un problema de onboarding.

---

## 8. Métricas a seguir

Todo está en Steamworks: **Wishlist Report** (deseados diarios, borrados, compras desde deseados), **UTM Analytics** (enlaces con `?utm_source=reddit&utm_campaign=web_launch` para saber qué canal trae visitas), **Store Traffic** (impresiones y visitas de la página), y en la demo, **Playtime**.

| Métrica | Dónde | Por qué importa | Referencia orientativa (varía mucho) |
|---|---|---|---|
| **Deseados por día** | Wishlist Report | La métrica principal; muestra qué acción funcionó | Picos claros el día de cada post/clip bueno; si un esfuerzo no mueve la curva, cambia de táctica |
| **Deseados netos acumulados** | Wishlist Report | Meta de 7.000–10.000 | ~1.500 a fin de diciembre, ~4.000 antes de Next Fest |
| **Tasa de borrado** | Wishlist Report | Deseados borrados / añadidos | Si sube mucho, la página promete algo distinto a lo que el juego es |
| **CTR de la cápsula** (impresiones → visitas) | Store Traffic | Mide la cápsula y el nombre | Si es bajo frente a juegos parecidos, prueba otra semilla/composición en el generador |
| **Conversión de la página** (visitas → deseados) | Store Traffic + Wishlist | Mide el tráiler, las capturas y la descripción | Si es baja, el problema es el tráiler o las primeras 4 capturas |
| **Visitas por canal** | UTM Analytics | Qué red merece tu tiempo | Corta lo que no trae visitas en 3 semanas |
| **Jugadores de la demo y tiempo medio** | Steamworks (demo) | Calidad del gancho | Tiempo medio bajo = problema de arranque |
| **Conversión deseados → compra** | Wishlist Report tras el lanzamiento | Ventas reales | Referencia habitual: una parte de los deseados compra en la primera semana (`LANZAMIENTO.md` usa 10–20 % como hipótesis) |
| **Reembolsos** | Steamworks → Sales | Expectativas vs. realidad | Si hay muchos con motivo "no es lo que esperaba", revisa el tráiler |
| **Reseñas: número y % positivo** | Página de Steam | Visibilidad del algoritmo a partir de 10 reseñas | Pide reseñas al final del juego (sin incentivos) |
| **Retención del clip** | TikTok/YouTube Analytics | Qué gancho funciona | Mira el % de visualización completa y el abandono en el segundo 2 |

Revisión: **todos los lunes** (15 min) con una hoja de cálculo simple: fecha · deseados del día · acumulado · acción de la semana · visitas por UTM. Decisión de la semana: qué repetir y qué dejar.

---

## 9. Si las cosas no van bien (plan B)

- **Menos de 2.000 deseados a mitad de enero:** cambiar la cápsula (probar 2–3 semillas del generador o encargar una a un artista), rehacer los 3 primeros segundos del tráiler, y concentrar todos los clips en el formato que mejor retuvo.
- **La demo no engancha (tiempo medio bajo):** acortar el arranque, adelantar el primer pulso gravitatorio o la primera transmisión.
- **Menos de ~3.000 deseados una semana antes del lanzamiento:** valorar mover el lanzamiento unas semanas para trabajar más el marketing (Steam permite cambiar la fecha mientras sea "Próximamente"; no la anuncies como definitiva hasta tener la build aprobada).

---

## 10. Checklist del día de lanzamiento

**La semana anterior**
- [ ] Build final subida a la rama `default` y **aprobada** por Valve (revisión de la build ~3–5 días hábiles).
- [ ] Logros, nube e idioma probados en la build de Steam (no solo en desarrollo).
- [ ] Precio, precios regionales y descuento de lanzamiento (15 %) configurados y **aprobados**.
- [ ] Página: tráiler definitivo ("YA DISPONIBLE"), capturas finales, descripción revisada, requisitos correctos.
- [ ] Evento de Steam "¡Ya disponible!" preparado (se publica el día del lanzamiento y notifica a quienes lo tienen en deseados).
- [ ] Claves para creadores enviadas 3–5 días antes, con fecha de embargo si la hay.
- [ ] Posts de Reddit, tuits, clips y mensaje de Discord escritos y programados.
- [ ] Press kit actualizado con la fecha y el precio.

**El día (martes 9 de marzo de 2027, propuesto)**
- [ ] Pulsar "Release" en Steamworks a la hora elegida (por ejemplo, 10:00 hora del Pacífico = 14:00 de Buenos Aires; la mayoría de lanzamientos de Steam salen a esa hora).
- [ ] Comprobar que la página muestra el botón de compra, el descuento y que se puede descargar.
- [ ] Comprar una copia de prueba desde otra cuenta / pedir a un amigo que confirme que funciona.
- [ ] Publicar el evento de Steam, los posts de Reddit (r/incremental_games, r/indiegaming), el clip y el mensaje en todas las redes.
- [ ] Actualizar itch.io, galaxy.click y CrazyGames: botón "Ya disponible en Steam".
- [ ] Responder cada comentario, mensaje y reseña durante el día (sobre todo las negativas: con calma y con una solución).
- [ ] Vigilar el foro de Steam y Discord por errores críticos; tener lista una build de parche.
- [ ] Anotar en la hoja: ventas, deseados convertidos, reembolsos y reseñas al final del día.

**Los días siguientes**
- [ ] Parche rápido para los errores que aparezcan (los jugadores valoran mucho la respuesta rápida).
- [ ] Clip diario durante 5 días.
- [ ] Agradecimiento público a creadores y comunidad.
- [ ] Planificar la primera actualización gratuita (genera un evento de Steam y vuelve a mostrar el juego a quienes lo tienen en deseados).
