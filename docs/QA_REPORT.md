# VOIDLING — Informe de QA / playtest independiente

Revisor externo · build `v0.2.0 dev` · 3-nov-2026 · Edge (Chromium) sin cabeza vía playwright-core.
Scripts en `tools/qa/` (no tocan el juego). Capturas en `tools/qa/shots/`.
Servidor de prueba: `python -m http.server 8820 --directory voidling`.

> **Estado: COMPLETO.** Los hallazgos detallados están agrupados por área; el resumen de abajo los ordena por gravedad.

## Cómo reproducir mis pruebas
- `node tools/qa/s1_first5.js` — primer arranque y primera partida jugada con el ratón (sin bot).
- `node tools/qa/s2_tree.js [ancho alto]` — 6 primeras partidas + compras en el árbol con clics reales.
- `node tools/qa/gen_saves.js` — genera `tools/qa/saves.json` con guardados realistas al alcanzar cada escala (mismo bot y misma política de compra que `balance-sim.js`).
- `node tools/qa/dump_nodes.js` — lista los 48 nodos con efecto por nivel y coste.
- `node tools/qa/s3_mid.js <1|2|3|4|5|boss|win> [seg] [ancho] [alto]` — run desde un guardado realista, captura en cada evento (escala, púlsar, enjambre, jefe, fase).
- `node tools/qa/s4_boss.js [ancho] [alto] [kill|fight]` — jefe, final, créditos y post-final.
- `node tools/qa/probe_stab.js 1 2 3 4 5 boss` — curva de estabilidad por etapa (simulación en Node).
- `node tools/qa/s5_edges.js`, `s6_lang.js` — casos límite (pausa, dobles pulsaciones, redimensionar, idioma).
- `node tools/qa/s7_mobile.js` — 375x812 táctil. `s8_fps.js` — fps orientativos. `s9_demo.js` — fin de la demo. `s10_treecam.js` — encuadre del árbol. `s11_screens.js`, `s12_ach.js` — daltónico, logros, datos.

---

## Resumen ejecutivo (ordenado por gravedad)

| ID | Gravedad | Hallazgo |
|---|---|---|
| H-24 | BLOQUEANTE si se publica así | `js/lang/ja.js` no compila (220 `undefined（（？`); lanza excepción al cargar |
| H-18 | ALTA | El final/Big Bang es solo texto en la caja de transmisiones, sin espectáculo |
| H-19 | ALTA | 4 avisos de logro tapan el jefe y el final |
| H-10 | ALTA | Banners del jefe y de las fases ilegibles bajo los números flotantes |
| H-11 | ALTA | El Núcleo (jefe) no se distingue de las galaxias del fondo en fases 1–2 |
| H-25 | MEDIA | Encadenar runs con ESPACIO salta las transmisiones sin leerlas |
| H-20 | MEDIA | Tras vencer al Núcleo sale "EL NÚCLEO ESPERA"; capítulos atrasados se amontonan en el final |
| H-33 | MEDIA | El agujero casi no crece en pantalla; la fantasía de crecer se diluye |
| H-02 | MEDIA | Qué es comestible no se lee en el primer minuto (anillo rojo solo de cerca y al 32 %) |
| H-01 | MEDIA | Pistas del tutorial: 3 en 10 s con temporizador fijo, a la vez que un logro |
| H-16 | MEDIA | Estabilidad binaria al final: 100 % casi siempre y muertes en 2–4 s |
| H-34 | MEDIA | Modo daltónico: Custodios naranjas que se confunden con todo; sin indicador fuera de pantalla |
| H-12 | MEDIA | HUD sin placa: ilegible sobre cuerpos brillantes |
| H-13 | MEDIA | HUD diminuto a 1920x1080 |
| H-14 | MEDIA | Números flotantes gigantes tapan el centro |
| H-15 | MEDIA | Púlsar y estrellas normales se parecen; el aviso no señala dónde |
| H-27 | MEDIA | En táctil, tocar un nodo lo compra sin ver la información |
| H-29 | MEDIA | c2a manda "destrúyelos con el pulso" cuando el jugador aún no tiene el pulso |
| H-04 | MEDIA | El árbol no se reencuadra tras comprar: nodos bajo la barra superior/ayuda |
| H-05 | MEDIA | Mismo icono para todos los nodos de una rama |
| H-21 | MEDIA | Créditos: "Voidling Team" ×7 |
| resto | BAJA / IDEA | H-03, H-06, H-07, H-08, H-09, H-17, H-22, H-23, H-28, H-30, H-31, H-32, H-35 y tabla de ideas al final |

Lo que funciona bien (no tocar): la historia y su ritmo de entrega, el bucle de 10–60 s, la guía de la primera compra, el árbol como constelación, la robustez ante pausas/redimensionado/dobles pulsaciones (H-26), la pantalla de fin de demo.

---

## Hallazgos detallados (por área)

### Primeros 5 minutos

**H-01 · MEDIA · Las pistas del tutorial pasan demasiado rápido (3 pistas en 10 s) y compiten con el logro**
- Pasos: partida nueva → JUGAR → saltar transmisión → mirar la parte baja de la pantalla.
- Esperado: cada pista se queda hasta que el jugador hace lo que dice (moverse, comer 3 cosas, romper algo) o, al menos, ~5 s.
- Obtenido: `drawHints` muestra cada pista 3,4 s en ciclo fijo y desaparecen a los 10 s, aunque el jugador no se haya movido. La primera partida dura ~11 s, así que la 3.ª pista ("Si la estabilidad llega a cero, te evaporas") aparece cuando ya casi has muerto. El aviso de logro "Primer bocado" sale a la vez en la esquina inferior derecha.
- Capturas: `tools/qa/shots/s1_run1_t1.png`, `s1_run1_t4.png`.
- Sugerencia barata: pistas guiadas por eventos (`run:eat`, `run:break`) y retrasar los avisos de logro de la primera partida a la pantalla de resultados.

**H-02 · MEDIA · Qué se come y qué no, no se lee al instante en el primer minuto**
- Pasos: primera partida, primer segundo (`s1_run1_t1.png`).
- Esperado (GDD §4 pilar 2 y §8.2): lo no comestible lleva un anillo rojo punteado; se distingue sin pensar.
- Obtenido: el anillo rojo solo se dibuja si el cuerpo está a menos de 1,4× tu radio de atracción y con 32 % de opacidad (`render.js` ~l.568); en la captura del segundo 1 no hay ni un solo anillo visible. La pantalla está dominada por asteroides grandes (no comestibles) mientras que lo comestible son puntitos brillantes que se confunden con el bokeh de estrellas del fondo. El jugador nuevo tiende a ir hacia la roca grande (que es lo más "interesante"), se pega y no pasa nada visible hasta que aparece el arco de vida.
- Sugerencia: en las 2–3 primeras partidas, anillo rojo en todos los cuerpos no comestibles visibles (o un tinte apagado/desaturado) y un leve resalte cálido en los comestibles; subir la opacidad a ~0,55.

**H-03 · BAJA · La primera partida da ~45–95 de materia y la primera mejora cuesta 6: la primera compra no "pesa"**
- Pasos: primera partida (yo con ratón: ◆43; bot: ◆96) → MEJORAR.
- Obtenido: con ◆96 se compran ~10 niveles de golpe (`s2_1280_04_tree_after_buy_0.png`). Es generoso y está bien para enganchar, pero el momento "primera mejora" se diluye: no hay un "antes/después" claro. El GDD habla de "la primera mejora cuesta 6" como hito.
- Sugerencia: es una decisión de diseño válida (Nodebuster hace lo mismo). Lo barato que sí ayuda: al empezar la 2.ª partida mostrar 1 línea "Absorción +12 % · Alcance +15 %…" con lo comprado, para que se note la mejora.

### Árbol de mejoras

**H-04 · MEDIA · Tras la primera compra, los nodos nuevos quedan debajo de la barra superior y de la barra de ayuda**
- Pasos: partida nueva → 1.ª run → MEJORAR → comprar varios nodos de primer anillo.
- Obtenido: el árbol se expande pero la cámara no se reencuadra; nodos de segundo anillo quedan tapados por MENÚ/DATOS (y≈95) y por la caja de ayuda inferior; un "0/3" queda cortado en el borde (y≈795 a 1280x800). El aviso de logro tapa la caja de ayuda. Captura: `tools/qa/shots/s2_1280_04_tree_after_buy_0.png`. En la 6.ª visita sí está bien encuadrado (`s2_1280_04_tree_after_buy_5.png`), así que solo falla el reencuadre tras comprar.
- Sugerencia: llamar a `V.Tree.fit()` (suavizado) cuando una compra revela nodos nuevos.

**H-05 · MEDIA · Todos los nodos de una rama tienen el mismo icono**
- Obtenido: las 8–9 mejoras de Hambre muestran el mismo "comecocos", las de Gravedad la misma espiral, etc. (`s2_1280_04_tree_after_buy_5.png`). Sin pasar el ratón no se sabe qué es cada nodo; en mando/táctil es peor. Los nodos "especiales" (Pulso gravitatorio, Lunas orbitales, Cometas, Segunda oportunidad, Digestión exótica, Singularidad desnuda) no destacan frente a "+7 %".
- Sugerencia: icono propio (aunque sea un glifo simple) al menos para los 8–10 nodos que añaden una mecánica, y un borde/tamaño mayor para ellos.

**H-06 · BAJA · Etiquetas de rama solapadas con nodos y líneas**
- "GRAVEDAD" se monta con el "2/5" del nodo, "ESTABILIDAD" cruza la línea verde, "HAMBRE" queda debajo del "5/5". Capturas `s2_1280_02_tree_first.png`, `s2_1280_04_tree_after_buy_5.png`.

**H-07 · BAJA · Efectos de nodo con unidades ambiguas en el tooltip**
- `Resonancia` muestra "+1 → +2" (¿segundos? ¿%?); `Frenesí` "+5 → +10" (son pilas); `Nutrición` "+0.5" (usa punto decimal en español, el resto del juego usa coma); `Riqueza cuásar` "+x5". Ver `node tools/qa/dump_nodes.js`.
- Costes internos con "+1" de redondeo (123200001, 22308001, 15401, 7701…). No se ven gracias a `V.fmt`, pero conviene redondear con `Math.round` antes de sumar.

**H-08 · BAJA · Nodos de valor dudoso**
- `Cosecha exótica` (g9) se desbloquea en la escala 4, pero los Custodios desaparecen a partir de la escala 5 (`CUSTODIANS.lastM = 4`): solo sirve durante el primer tramo de cada run. `Blindaje` sigue apareciendo después de que la historia diga que los Custodios ya no atacan.
- Muchos nodos son "X II / X III" con el mismo texto más fuerte (Contención II/III, Masa primordial II/III, Densidad II/III, Marea II). Es normal en el género, pero ver H-IDEA sobre sinergias.

### Varios

**H-09 · BAJA · Error 404 en consola al cargar (favicon)**
- Dos `Failed to load resource: 404` en la primera carga de cada contexto (no en recargas). Probablemente `/favicon.ico`. Sin impacto en Steam; en la versión web queda una pestaña sin icono.

### Partida media (escalas 2–5)

**H-10 · ALTA · Los banners de evento (jefe, fases, púlsar) quedan tapados por los números flotantes**
- Pasos: `node tools/qa/s4_boss.js 1280 800 kill` (o jugar hasta el jefe). Mirar el texto central al aparecer el Núcleo y en cada cambio de fase.
- Esperado: "EL NÚCLEO / FASE 2 / FASE 3" y la frase de LUMEN se leen completas; son el momento épico del juego.
- Obtenido: los números flotantes gigantes (+3.78M, +1.31M…) se dibujan encima, justo en la misma franja (y≈250–330), y la frase de LUMEN es ilegible ("El Núcleo se contra… …n se duplica"). Además, a la vez salen avisos de logro.
- Capturas: `tools/qa/shots/s4_1280_02_boss_intro_2.png`, `s3_kwin_1280_ev_bossPhase_53.png`, `s4_1280_04_phase3.png`.
- Sugerencia: dibujar los banners después de los textos flotantes y con placa oscura; mientras haya banner, agrupar/desplazar los números o atenuarlos.

**H-11 · ALTA · El jefe final no se distingue del fondo en sus fases 1–2**
- Pasos: igual que H-10.
- Obtenido: al aparecer, el Núcleo es una galaxia más entre decenas de galaxias con anillos color melocotón (el mismo color que el arco de vida de cualquier cuerpo rompible). No hay contorno, color propio ni indicador de "esto es el jefe". Solo la barra superior dice que existe. En la fase 3 (`s4_1920_03_fight_8.png`) ya se ve mejor porque la pantalla se vacía.
- Capturas: `s3_kwin_1280_ev_boss_39.png`, `s3_kwin_1280_t49.png`, `s4_1280_02_boss_intro_2.png`.
- Sugerencia: al aparecer el jefe, limpiar/atenuar los cuerpos de alrededor 2–3 s (ya se hace con los púlsares), darle un anillo dorado grueso propio (`PALETTE.boss`) y una flecha en el borde mientras esté fuera de pantalla.

**H-12 · MEDIA · El HUD no tiene placa de fondo: se vuelve ilegible sobre estrellas y gigantes brillantes**
- Obtenido: "Materia 21.7M", "Nube de polvo", "Siguiente: …" y "ESPACIO · PULSO" desaparecen cuando pasa un cuerpo brillante detrás (mezcla aditiva). Pasa constantemente desde la escala 3.
- Capturas: `s3_k2_1280_t25.png` (arriba a la derecha), `s3_kwin_1280_t49.png` y `s4_1280_11_postgame_run.png` (arriba a la izquierda).
- Sugerencia: sombra de texto fuerte (`shadowBlur` 6–8 negro) o una placa semitransparente detrás de cada bloque de HUD.

**H-13 · MEDIA · A 1920x1080 el HUD es diminuto**
- Obtenido: "MATERIA", "ESTABILIDAD · 0:22", "Siguiente: Escala planetaria", "ESPACIO · PULSO" miden ~10–11 px de alto en 1080p (`s3_k4_1920_ev_pulsar_22.png`). El HUD parece no escalar con la resolución (solo con el ajuste "escala de interfaz"). En un monitor de 24" o en la TV (Big Picture) se lee mal.
- Sugerencia: escalar el HUD del canvas por `min(W/1280, H/800)` además de `uiScale`.

**H-14 · MEDIA · Los números flotantes enormes tapan el centro de la pantalla (justo lo que el jugador mira)**
- Obtenido: desde la escala 3 hay casi siempre dos números de 40–60 px ("+22.7K", "+119K") pegados encima del agujero, tapando lo que viene de frente. `s4_1280_11_postgame_run.png`, `s3_k4_1920_ev_pulsar_22.png`.
- Sugerencia: limitar tamaño máximo, desplazarlos hacia el contador de materia (como "vuelo" al HUD) o mostrar solo el total del combo.

**H-15 · MEDIA · Púlsares y estrellas normales se parecen (ambos son bolas azul-blancas con destellos)**
- Obtenido: a la escala 3–4 hay estrellas comestibles/rompibles con rayos de difracción y el púlsar (peligroso) también es una esfera cian con haces. El aviso "AMENAZA DETECTADA" sale, pero no señala dónde está. `s3_k4_1920_ev_pulsar_22.png`.
- Sugerencia: flecha/marcador temporal desde el banner hasta el púlsar, o su anillo de peligro siempre visible desde que aparece.

**H-16 · MEDIA · La estabilidad es "binaria" en la segunda mitad: casi siempre al 100 % y luego cae a 0 en 2–4 s**
- Pasos: `node tools/qa/probe_stab.js 3 4 5 boss` (misma simulación que el juego; muestrea la estabilidad cada 2 s).
- Obtenido: en las escalas 4–6 la barra pasa la mayor parte del tiempo en 95–100 % y tiene caídas del 60–90 % en 2 s (por ejemplo `k4: … 100 81 58 43 68 38 37 32 31 100 22`; `boss: … 100 75 12 95 …`). En la partida real a escala 4 (`s3_k4_1920_*`) pasé de 94 % a evaporarme en ~6 s, con Segunda oportunidad incluida. El jugador no percibe un reloj sino muertes repentinas, y en la escala 5 no hay tensión ninguna (`k5`: 86–91 s casi siempre al 100 %).
- Sugerencia: suavizar la ganancia por nutrición (tope por segundo) y el drenaje por tamaño; o mostrar el ritmo de drenaje (flecha/parpadeo) para anticipar la caída.

**H-17 · BAJA · "PULSAR" sin tilde en el banner español**
- La historia y la descripción del nodo dicen "púlsar", pero el banner de amenaza muestra "PULSAR". `s3_k4_1920_ev_pulsar_22.png`.

### Jefe, final y créditos

**H-18 · ALTA · El final (Big Bang) se presenta como una transmisión más, sobre una pantalla casi vacía**
- Pasos: `node tools/qa/s4_boss.js 1280 800 kill`.
- Esperado (GDD §5): "Big Bang" y epílogo que emocionen; es lo que genera reseñas.
- Obtenido: destello blanco → pantalla gris/oscura con un puntito de luz → 8 tarjetas de texto iguales que las del árbol. "— — — B I G B A N G — — —" es una línea de texto dentro de la caja de transmisión (`s4_1280_07_final_trans_6.png`). No hay expansión, color ni partículas en las capturas. Luego "FIN DEL CICLO I" en una tarjeta estándar (`s4_1280_08_victory_screen.png`).
- Sugerencia de bajo coste: animación procedural de 6–8 s (el agujero se contrae a un punto, silencio, explosión radial de partículas con los colores de todas las escalas, fondo que pasa de negro a azul joven) y mostrar las líneas finales centradas en grande sin caja, una a una, sobre ese fondo. Reutiliza `waves`/`sparks`.

**H-19 · ALTA · Los avisos de logro interrumpen el jefe y el final**
- Obtenido: durante el destello de victoria y las transmisiones del final saltan 4 avisos seguidos ("Ahora. Todo.", "Ojos más grandes que el horizonte", "Pide un deseo", "Agujero con prisa"). En el momento más emotivo del juego hay un rectángulo con un rayo amarillo. `s4_1280_05_defeat_moment.png`, `s4_1280_06_finale_0.png`, `s4_1280_06_finale_5.png`, `s4_1280_07_final_trans_6.png`.
- Sugerencia: poner los avisos en cola mientras `state` sea `finale`/`ending` o haya jefe vivo, y soltarlos en la pantalla de victoria.

**H-20 · MEDIA · Orden de la historia: tras vencer al Núcleo, los Custodios dicen "EL NÚCLEO ESPERA"**
- Pasos: llegar a la escala 5 y vencer al jefe en pocas runs (habitual: el bot pasa de escala 5 a victoria en 4–7 runs y en mi partida real crucé escalas 4→5→6 en la misma run).
- Obtenido: `startFinale` mete delante del final las entradas no leídas, en este caso c5c ("…DEMUESTRA QUE ERES SUFICIENTE. EL NÚCLEO ESPERA.") y c5d, **después** de haber derrotado al Núcleo y del banner "ERES SUFICIENTE". Rompe la escena. Si el jugador es rápido, también c4b/c4c (el giro) y c5b (el último audio de Ilse) llegan amontonados aquí, sin espacio para respirar.
- Sugerencia: entregar las entradas pendientes de capítulos ≤ 5 en el árbol antes de la run del jefe (p. ej. al alcanzar la escala 6 por primera vez, o reducir sus `runs` cuando `record` ya es mayor), y en el final omitir c5c.

**H-21 · MEDIA · Créditos con relleno genérico ("Voidling Team" ×7)**
- Obtenido: la pantalla de créditos muestra "Un juego de Voidling Team / DISEÑO Voidling Team / PROGRAMACIÓN Voidling Team / …" (el fuente aún tiene `[ESTUDIO]`/`[NOMBRE]`). Parece un juego sin terminar. `s4_1280_09_credits.png`.
- Sugerencia: nombres reales o una sola línea "Hecho por X"; y agradecimientos.

**H-22 · BAJA · "Runs" en la pantalla de victoria en español**
- "Runs: 66 · Tiempo total: 41:30". En el resto se mezclan "run" y "partida" ("TERMINAR RUN", "Una vez por run", "Completa el Ciclo I en 70 partidas o menos"). Unificar en "partidas".

**H-23 · IDEA · El jefe no da información de progreso al perder**
- Si mueres contra el Núcleo, la pantalla de resultados es la genérica "EVAPORADO" (`s3_kwin_1280_end.png`). Mostrar "Núcleo: 45 % restante" (y el mejor intento) motiva a reintentar.

### Bugs técnicos

**H-24 · BLOQUEANTE (si se publica así) · `js/lang/ja.js` tiene sintaxis inválida en este momento**
- `node --check js/lang/ja.js` falla en la línea 13; el archivo contiene 220 secuencias `undefined（（？` (parece una sustitución automática fallida). En el navegador lanza `Invalid or unexpected token` al cargar. El juego sigue funcionando porque es un script aparte, pero el japonés no existe. Puede ser un estado intermedio del traductor: **revisar antes de cualquier build** y añadir `node --check` de todos los `js/**/*.js` a `tools/build.js`.

**H-25 · MEDIA · Pulsar ESPACIO repetido (el bucle "una más") se salta la historia sin leerla**
- Pasos: `node tools/qa/s5_edges.js` (paso 1). Con transmisiones pendientes en el árbol, pulsar ESPACIO 6 veces rápido.
- Esperado: el jugador que encadena runs con ESPACIO (lo que el propio juego enseña: "Espacio: árbol de mejoras" → "ESPACIO para iniciar") no pierde transmisiones.
- Obtenido: la 1.ª pulsación completa el texto, la 2.ª lo cierra, la 3.ª arranca la run. En menos de medio segundo la transmisión se "leyó" y se marcó como vista (`seenLogs`); solo queda en el Archivo. La historia es el diferenciador del juego y el jugador más enganchado es el que más la pierde.
- Sugerencia: ignorar ESPACIO/Enter/clic durante ~0,5 s tras completar el texto (y tras abrirse la tarjeta); y que la tecla de "iniciar run" no funcione mientras haya transmisiones en cola (ya está protegido para la siguiente, falta el tiempo muerto).

**H-26 · BAJA · Redimensionar, pausar, abrir ajustes desde la pausa, cambiar idioma y volver: sin fallos**
- `node tools/qa/s5_edges.js` y `node tools/qa/s6_lang.js`: doble clic en INICIAR, Esc en pausa/ajustes, Esc+Espacio+R durante la animación de muerte, R y Esc seguidos, TERMINAR RUN, SALIR AL MENÚ, perder el foco, redimensionar en plena partida a 800x600, 1920x1080 y 375x812: no hay excepciones ni estados colgados. Capturas `s5_06_resize_run_*.png`. Bien resuelto.

### Móvil web (375x812, táctil)

**H-27 · MEDIA · En táctil, tocar un nodo lo compra sin haber visto qué hace**
- Pasos: `node tools/qa/s7_mobile.js`. Primer árbol, tocar el nodo guía una vez.
- Obtenido: la materia baja de 82 a 76 con un solo toque; el tooltip aparece *después* y se queda fijo tapando media pantalla del árbol (`s7_07_tree_after_tap.png`). No hay forma de leer un nodo sin comprarlo.
- Sugerencia: en táctil, primer toque = seleccionar y mostrar info; segundo toque sobre el mismo nodo (o botón "Investigar" en el tooltip) = comprar.

**H-28 · BAJA · Textos de escritorio en táctil y solapes de HUD en vertical**
- "clic para continuar" en las transmisiones, "Clic o flechas + Enter para investigar…" en el árbol y "ESPACIO · PULSO" en la partida, aunque el dispositivo es táctil (`s7_02_trans.png`, `s7_07_tree_after_tap.png`, `s7_10_run_late.png`). El pulso en táctil es doble toque y no se explica en ningún sitio.
- En 375 px, "ESTABILIDAD · 0:14" se monta con "Cinturón de asteroides" (`s7_10_run_late.png`). Los avisos de logro tapan la ayuda y la parte baja del árbol. En el árbol avanzado hay nodos cortados en los bordes (`s7_09_tree_late.png`).

### Historia (lectura completa de `js/story.js` + simulación de entrega)

Valoración general: **es lo mejor del juego.** Voz de LUMEN muy lograda (humor seco que se va quebrando), pistas del giro bien sembradas (taza llena, "por favor" omitido, 61,3 kg, cuatro minutos del registro de esclusas) y el pago en c4b/c4c funciona: lo leí en orden y el giro golpea. c2f ("No puedo retirarla: no tengo brazos") y c5d ("Me planteé borrar las canciones malas") son de reseña. Longitudes razonables (95–377 caracteres); la más larga es c3c (Smolin, 377) y es la que más suena a clase.

**H-29 · MEDIA · c2a dice "destrúyelos con el pulso" cuando el jugador casi nunca tiene el pulso**
- Con la compra "más barata primero", al llegar a la escala 2 (run ~12–15) el jugador tiene ~300 de materia y el Pulso cuesta 881 (`saves.json["2"]`: `g4 = 0`). La orden apunta a una habilidad que no existe en su partida, y pulsar ESPACIO no hace nada (sin feedback).
- Sugerencia: "Esquívalos. Hay una investigación nueva que podría servir: Pulso gravitatorio." + resaltar el nodo en el árbol (como la guía de la primera compra).

**H-30 · BAJA · Detalles de texto**
- c5b: Ilse dice "ve con **él**" mientras LUMEN usa siempre "la singularidad / alimentar**la**" (p0). Puede ser intencionado (Ilse lo ve como un hijo), pero choca un poco al leerlo seguido.
- n3 (post-final) promete "algo más está comiendo… Y nos ha visto": anuncia un Ciclo II que todavía no existe. Bien como gancho de actualización, pero si no llega pronto saldrán reseñas tipo "el final te deja colgado". Considerar añadir "Ciclo II · próximamente" en la pantalla de victoria para que sea explícito.
- El Archivo es una lista plana sin capítulos ni marca de "nuevo"; con 30+ entradas cuesta encontrar algo (`s5_10_treeArchive.png`). Agrupar por capítulo con un subtítulo (Prólogo, I Nube de polvo…) es barato.

### Demo (Next Fest)

**H-31 · BAJA · La demo termina bien, pero dura poco y el texto da por hecha una señal que el jugador no oyó**
- `node tools/qa/s9_demo.js` (fuerza `CONFIG.demo = true`). Al alcanzar la escala 2 aparece primero la pantalla de resultados y, al pulsar MEJORAR, "GRACIAS POR JUGAR" (`s9_01_demo_end.png`). Funciona y el texto engancha.
- "Los Custodios te llamaron semilla" se presenta como algo ya vivido, pero en la demo c2b ("DETENTE, SEMILLA") no se ha entregado nunca (pide 12 runs después de la escala 2). Funciona igual porque la línea anterior lo cita, pero se puede reescribir como "Una señal te acaba de llamar semilla."
- Escala 2 ≈ 7 min de bot ≈ 12–15 min de persona: corto para Next Fest (las demos que convierten suelen durar 30–60 min). Valorar `demoMaxMilestone: 3`, que además incluiría el primer giro de la trama (c3b) como gancho.

### Game feel y accesibilidad

**H-33 · MEDIA · El agujero casi no crece en pantalla: el "crecer" se ve en el mundo, no en ti**
- `V.zoomFor` mantiene el tamaño en pantalla del agujero ∝ r^0,1: de r=8 a r=3000 pasa de ~25 px a ~45 px en toda la partida, y dentro de una run apenas cambia (comparar `s3_k4_1920_t1.png` con `s3_k4_1920_t38.png`). En la primera run el radio pasa de 8 a 9,7 y no se nota nada.
- Los referentes (Katamari, Donut County, Osmos, agar.io) hacen lo contrario: tú creces visiblemente y la cámara "respira" hacia atrás por escalones. Es la sensación que vende el tráiler.
- Sugerencia barata: que la cámara siga al zoom con retraso (o por escalones al cruzar umbrales), para que el agujero engorde en pantalla 1,5–2× antes de que la cámara se aleje con un pequeño "whoosh". Es solo cambiar la interpolación de `prevCam.z`.

**H-34 · MEDIA · Modo daltónico: los Custodios pasan a naranja y se confunden con asteroides, combos y el disco del agujero**
- Pasos: `node tools/qa/s11_screens.js` (activa el modo daltónico y genera Custodios cerca).
- Obtenido: en `PALETTE_CB` `enemy = #ff6d1f` (naranja). Casi todo el resto de la escena ya es naranja/marrón (asteroides, textos de combo, materia, disco de acreción, arcos de vida melocotón). En `s11_03_colorblind_custodians.png` apenas se distingue un Custodio; en modo normal (`s11_04_normal_custodians.png`) se ven como estrellitas magenta… pero de solo ~15 px.
- Sugerencia: en daltónico usar para el enemigo un color sin competencia (blanco puro con contorno negro o azul cielo) y, en ambos modos, darle forma inconfundible (púas grandes) y más tamaño mínimo en pantalla. Añadir indicadores en el borde para Custodios fuera de pantalla (llegan desde fuera: `spawnAnti` los crea a 1,0–1,2× el radio visible).

**H-35 · BAJA · "ESTABILIDAD · 0:22": el número parece tiempo restante y es tiempo transcurrido**
- Bajo la barra de estabilidad se muestra el cronómetro de la run. Leído junto a "ESTABILIDAD" parece una cuenta atrás. Separarlo (icono de reloj) o quitarlo.

### Rendimiento

**H-32 · BAJA · Para verificar en Steam Deck: 40–50 fps en Edge sin cabeza durante la partida tardía**
- `node tools/qa/s8_fps.js`: 1280x800 → 44–52 fps; 1920x1080 → 42–60 fps, p95 de 25–51 ms con ~300 objetos. Es render por software en una máquina cargada con otros agentes, así que solo es orientativo; pero conviene medir en el Deck real la run del jefe (máximo de galaxias + partículas).

---

## Comparación con el mercado: qué falta para "Muy positivas"

Lo que ya está al nivel de los referentes: bucle corto y legible tipo Nodebuster, árbol bonito y con buen ritmo de desbloqueo (la meseta 2→3 está bien rellenada con transmisiones cada 4 runs), historia muy superior a la media del género, arte procedural coherente, opciones de accesibilidad, mando, logros. Por 4,99 USD la duración (~40 min de bot, ~1,5 h de persona) es correcta, aunque al límite: Nodebuster ronda 3–5 h por 2,99.

Lo que separa "Positivas" de "Muy positivas" en este nicho, ordenado por impacto/coste:

| # | Idea | Por qué | Coste |
|---|---|---|---|
| IDEA-1 | **Final con espectáculo** (H-18) + cola de logros (H-19) | El Big Bang es el clip que la gente graba y la escena de la reseña. Hoy es texto en una caja. | Bajo (1 día) |
| IDEA-2 | **Crecer en pantalla** (H-33) | Es la fantasía del juego; ahora se siente más "zoom out" que "engordar". | Bajo |
| IDEA-3 | **Nodos que cambian la forma de jugar**, no solo +%: p. ej. "los cuerpos rotos explotan en cadena", "el combo deja una estela que atrae", "cada 10 bocados, mini-pulso automático", "los cometas te persiguen". 4–6 nodos así repartidos en el árbol. | Ball x Pit / Vampire Survivors / Brotato viven de sinergias y "builds"; el árbol actual es casi todo "X II / X III". | Medio |
| IDEA-4 | **Desafío post-final**: "Ciclo II" mínimo como modificadores (mitad de estabilidad, Custodios en todas las escalas, árbol con techo) + récord de tiempo por run hasta el Núcleo. | Las reseñas negativas del género se concentran en "se acaba y no hay nada más"; el epílogo además promete más (n3). | Medio |
| IDEA-5 | **Mostrar el progreso**: al terminar cada run, una línea "Récord de masa: 1.2K → 1.9K" y una barra de "próxima escala" en el árbol. | "Number go up" visible entre runs, no solo durante. | Bajo |
| IDEA-6 | **Pistas guiadas por eventos** (H-01) y anillos de no-comestible visibles al principio (H-02) | Reduce reembolsos de los 2 primeros minutos. | Bajo |
| IDEA-7 | **Jefe legible** (H-10, H-11) y marcador de amenaza (H-15, H-34) | "Caos legible" es exactamente lo que este público alaba en Vampire Survivors. | Bajo |
| IDEA-8 | Iconos distintos para nodos clave (H-05) | Las capturas del árbol son material de tienda; hoy parecen 6 iconos repetidos. | Bajo |
| IDEA-9 | Modo "zen"/sin estabilidad tras ganar (estilo Osmos) para quien solo quiere comer planetas | Muy pedido en incrementales relajados; alarga la vida en Steam Deck. | Bajo |
| IDEA-10 | Ampliar la demo a la escala 3 (H-31) | Llevar al jugador hasta "Somos una rama" (c3b/c3c) deja el gancho de la historia antes del "añadir a deseados". | Trivial |
