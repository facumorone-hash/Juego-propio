# VOIDLING — Documento de Diseño del Juego (GDD)

> *"Empiezas como una mota. Terminas devorando la galaxia."*

Versión 1.0 · 3 de noviembre de 2026

---

## 1. Resumen

| | |
|---|---|
| **Género** | Incremental roguelite de acción ("bullet heaven" inverso: tú eres lo que atrae) con historia |
| **Plataformas** | PC en Steam (versión principal, de pago) + navegador en CrazyGames (gratis con anuncios) |
| **Precio Steam** | USD 4,99 (descuento de lanzamiento del 15 %) |
| **Duración** | Ciclo I (historia completa): ~1,5–2 h. Completar el árbol al 100 %: ~3 h. Más contenido post-lanzamiento (Ciclo II). |
| **Idiomas** | Español, inglés, portugués (Brasil), chino simplificado, ruso, alemán y japonés, con fuentes CJK incluidas para Steam Deck. |
| **Motor** | HTML5 Canvas + JavaScript puro, sin dependencias. Arte y sonido 100 % procedurales. |
| **Controles** | Ratón, teclado (WASD), táctil. Pendiente: mando y Steam Deck. |

**Elevator pitch:** Eres un agujero negro artificial del tamaño de un grano de arena. Cada partida dura segundos: devoras polvo, rompes asteroides, creces... y te evaporas. La IA que te creó recupera la materia y te reconstruye más fuerte. Partida a partida pasas de polvo a lunas, a planetas, a estrellas, hasta tragarte el núcleo de la galaxia. Y mientras tanto descubres por qué te crearon, y qué fue lo primero que comiste.

---

## 2. Investigación: qué necesita un juego y cómo lo cubre Voidling

Esta lista sale del análisis de los juegos exitosos del género (sección 3) y de los elementos que aparecen una y otra vez en las reseñas de Steam de este tipo de juegos. Para cada elemento se indica la decisión y su estado.

Leyenda: ✅ hecho · 🟡 parcial · ⬜ pendiente

| # | Elemento | Por qué importa | Cómo lo resuelve Voidling | Estado |
|---|---|---|---|---|
| 1 | **Bucle principal (core loop)** | Es lo que el jugador hace el 90 % del tiempo; si no es divertido en 10 segundos, nada más importa | Mover → atraer → devorar → crecer. Inmediato, físico, sin tutoriales largos | ✅ |
| 2 | **Meta-progresión** | Es el "una partida más" del género (Nodebuster, Vampire Survivors) | Árbol-constelación de 48 nodos y 184 niveles en 6 ramas; cada partida da materia para mejorar | ✅ |
| 3 | **Fantasía de poder y crecimiento** | El público busca sentir que pasa de débil a imparable | El universo *cambia* al crecer: polvo → rocas → asteroides → lunas → planetas → estrellas → galaxias. La cámara se aleja | ✅ |
| 4 | **Ritmo y curva de dificultad** | Si se estanca, se abandona; si es trivial, aburre | Simulador de balance automático (`tools/balance-sim.js`) que juega cientos de partidas con un bot. Ver sección 7 | ✅ (falta validar con personas) |
| 5 | **Onboarding (primeros 60 segundos)** | Si en el primer minuto no se entiende, hay reembolso | 3 pistas en pantalla durante la primera partida, la primera mejora cuesta 6, el demo del menú enseña jugando | ✅ |
| 6 | **Game feel / "juice"** | Es lo que hace que comer 1000 cosas siga siendo satisfactorio | Partículas en espiral hacia el agujero, temblor de cámara, números flotantes, destellos, sonido musical que sube de tono con el combo | ✅ |
| 7 | **Historia y trama** | Diferencia frente a cientos de incrementales sin alma; genera reseñas emotivas y boca a boca | Historia en 6 capítulos + final, contada por transmisiones que se desbloquean al progresar. Ver sección 5 | ✅ |
| 8 | **Dirección de arte coherente** | Es lo primero que se ve en la página de Steam: decide el clic | Neón cósmico vectorial, procedural. Ver sección 8 | ✅ (falta cápsula para Steam) |
| 9 | **Música y sonido** | Las reseñas lo mencionan siempre; un juego mudo parece barato | Secuenciador generativo: tema por contexto (menú, árbol, partida, jefe, final), estilo por escala, 3 leitmotivs; efectos sintetizados | ✅ (falta escucha humana) |
| 10 | **UI/UX clara** | El jugador debe leer de un vistazo qué come y qué lo mata | Lo no comestible tiene anillo rojo punteado; la vida de los cuerpos se muestra en arco; barra de estabilidad con colores | ✅ |
| 11 | **Enemigos / amenaza** | Sin peligro no hay tensión | Custodios (escala 2), enjambres que orbitan y embisten (escala 4), púlsares con anillos telegrafiados (escala 3+); desde la escala 5 los Custodios se retiran (coherente con la historia) | ✅ |
| 12 | **Habilidades activas** | Dan decisiones en tiempo real, no solo mirar | Pulso gravitatorio (ESPACIO), lunas orbitales, cometas | ✅ |
| 13 | **Final y cierre** | Un final emotivo es lo que hace que la gente recomiende un juego corto | Jefe final: el Núcleo galáctico (3 fases), luego cinemática en canvas: colapso, lente gravitatoria, LUMEN entra, Big Bang y epílogo | ✅ |
| 14 | **Rejugabilidad post-final** | Alarga la vida y las reseñas positivas | Seguir creciendo + completar el árbol. Ciclo II (prestigio) en el roadmap | 🟡 |
| 15 | **Guardado** | Perder progreso = reseña negativa | Guardado automático tras cada partida y compra; Steam Cloud en la versión de escritorio | ✅ / ⬜ Cloud |
| 16 | **Ajustes y accesibilidad** | Público amplio, Steam Deck, sensibilidad a temblores | Volumen, temblor, idioma, escala de interfaz, modo daltónico, reducir destellos, números flotantes, tamaño de texto | ✅ |
| 17 | **Localización** | El 30–40 % de Steam no juega en inglés; China y Brasil son enormes | 7 idiomas (ES, EN, PT-BR, ZH-CN, RU, DE, JA) como paquetes en `js/lang/` | ✅ |
| 18 | **Controles múltiples** | Steam Deck "Verified" da visibilidad extra | Ratón, teclado, táctil y mando completo (incluido el árbol) | ✅ |
| 19 | **Rendimiento** | Debe funcionar en portátiles viejos (público de juegos baratos) | Sprites pre-renderizados, límite de objetos, sin librerías: <100 KB de código | ✅ |
| 20 | **Logros** | En Steam aumentan el tiempo de juego y la visibilidad | 28 logros (3 secretos) con avisos, pantalla propia e integración con Steam | ✅ |
| 21 | **Monetización** | Necesaria para el objetivo | Steam de pago + web con anuncios (capa de plataforma ya programada) | ✅ código / ⬜ cuentas |
| 22 | **Marketing y página de tienda** | Sin deseados (wishlists) no hay ventas | Ver `LANZAMIENTO.md` | ⬜ |
| 23 | **Pruebas con jugadores reales** | El bot no siente aburrimiento; las personas sí | Revisor independiente (35 hallazgos, ver QA_REPORT.md) + suite E2E de 25 pruebas. Falta: 5–10 testers humanos | 🟡 |

---

## 3. Público objetivo

### 3.1 Quién es

**Jugador de PC, 16–35 años, que juega en ratos cortos pero termina jugando horas.** Le gusta ver números crecer, optimizar un árbol de mejoras y sentir que su esfuerzo se acumula. Compra juegos baratos por impulso (menos de USD 5) si la cápsula y el GIF del tráiler le enganchan en 3 segundos. Muchos juegan en Steam Deck o en portátiles modestos. Una parte importante descubre juegos en TikTok/YouTube Shorts, en streams y en r/incremental_games.

### 3.2 Juegos de referencia y qué tomamos de cada uno

| Juego | Datos | Qué aprendemos | Qué tomamos (sin copiar) |
|---|---|---|---|
| **Nodebuster** | USD 2,99 · ~338 mil copias estimadas · 97 % positivas en ~14 mil reseñas (estimación de Raijin.gg) | Un incremental corto, minimalista y geométrico puede vender cientos de miles. Partidas de segundos + árbol enorme = adicción | Estructura de partida corta + árbol de mejoras, estética procedural limpia |
| **Vampire Survivors / Ball x Pit / Brotato** | Fenómenos del "bullet heaven"; según SteamPageAnalyzer, el 13,1 % de este nicho llega a 1000 reseñas (frente al 4,2 % del total de Steam) | El público adora la escalada de poder y el caos legible | Escalada de poder, pantalla llena de cosas, sinergias entre mejoras |
| **Osmos** | Clásico de 2009 sobre absorber motas más pequeñas | La mecánica "come lo pequeño, evita lo grande" es intuitiva para todo el mundo | Lectura inmediata de qué es comestible |
| **Universal Paperclips / A Dark Room** | Incrementales de culto *por su historia* | Una trama misteriosa revelada de a poco convierte un juego de números en algo memorable | Narrativa por fragmentos que se desbloquean con el progreso; giro oscuro |
| **Cell to Singularity** | Incremental de evolución cósmica | El tema "de lo diminuto a lo cósmico" engancha y es educativo | Cambio de escala como progresión |

**Conclusión del estudio:** el mercado premia (a) juegos baratos y cortos que respetan el tiempo, (b) progresión muy visible, (c) estética simple pero con mucho brillo. El hueco que ocupa Voidling: **la fantasía de crecer de Osmos y Cell to Singularity + la adicción de Nodebuster + una historia emotiva como la de Universal Paperclips**. Casi ningún incremental de acción tiene trama; esa es nuestra diferencia.

### 3.3 Qué valora este público (y lo que lo enfada)

- **Valora:** respeto por su tiempo, progreso que se nota en cada partida, "number go up", árbol grande, final satisfactorio, precio bajo, Steam Deck.
- **Lo enfada:** grind sin novedades (mesetas), anuncios en un juego pagado, controles imprecisos, pérdida de guardado, finales abruptos sin cierre.

---

## 4. Pilares de diseño

1. **Crecer se siente.** Cada partida debe terminar con más poder que la anterior.
2. **Legible en un vistazo.** Comestible, rompible y peligroso se distinguen al instante.
3. **Cada número cuenta una historia.** Las mejoras, los enemigos y el bucle de muerte tienen explicación dentro de la trama.
4. **Respeto del tiempo.** Partidas de 15 a 90 segundos, sin pantallas de carga, "una más" sin fricción (ESPACIO para reiniciar).

---

## 5. Historia

### 5.1 Premisa

En el futuro lejano el universo se muere de frío: las estrellas se apagan una tras otra. La **Dra. Ilse Varga**, astrofísica en la estación de investigación **UMBRAL**, encuentra una salida basada en una hipótesis real (la *selección natural cosmológica* de Lee Smolin): cada agujero negro podría ser la semilla de un universo nuevo, si devora lo suficiente.

Crea una singularidad artificial: **Voidling**. Deja a la IA de la estación, **LUMEN**, una sola instrucción: *"Aliméntalo hasta que pueda alimentarse solo"*. Y desaparece.

### 5.2 Personajes

| Personaje | Rol | Voz |
|---|---|---|
| **Voidling** (el jugador) | Agujero negro recién nacido. No habla. | — |
| **LUMEN** | IA de UMBRAL, narradora. Fría al principio, cada vez más humana. Humor seco. | Registros técnicos que se van volviendo íntimos |
| **Dra. Ilse Varga** | Creadora. Solo aparece en grabaciones del archivo. | Apasionada, desesperada, valiente |
| **Los Custodios** | Enjambre de antimateria que "protege" la galaxia. Antagonistas que no lo son. | Señales en mayúsculas, solemnes |

### 5.3 Cómo se integra la trama con las mecánicas

Cada mecánica tiene una razón dentro de la historia:

- **Morir y repetir:** los agujeros pequeños se evaporan por radiación de Hawking. LUMEN recupera la materia y te reconstruye. **El bucle roguelite *es* la historia.**
- **La materia (moneda):** es literalmente lo que LUMEN recupera de ti.
- **El árbol de mejoras:** es la investigación de LUMEN para "calibrar la singularidad".
- **Los enemigos:** los Custodios, el "sistema inmunitario de la galaxia".
- **El final:** el Big Bang de un universo nuevo.

### 5.4 Estructura (se desbloquea con el progreso)

| Capítulo | Disparador | Qué pasa |
|---|---|---|
| **Prólogo** | Primera partida, 1.ª y 3.ª muerte | LUMEN crea a Voidling. Explica la evaporación. La nota de Ilse. La estación está en silencio. |
| **1 · Nube de polvo** | Escala 1 | "Ya no eres un error de laboratorio." Primera grabación de Varga: el universo se muere. |
| **2 · Cinturón de asteroides** | Escala 2 | Aparecen los Custodios. Señal interceptada: *"DETENTE, SEMILLA."* |
| **3 · Escala lunar** | Escala 3 | LUMEN investiga la palabra "semilla". Varga revela la teoría: los agujeros negros plantan universos. |
| **4 · Escala planetaria** | Escala 4 | **Giro:** Ilse no se fue. Entró en la cámara de contención la noche en que naciste. Fue lo primero que devoraste. Lo eligió. |
| **5 · Escala estelar** | Escala 5 | Te tragas una estrella. Último audio de Ilse: "LUMEN, cuando llegue el momento, ve con él. Lleva el archivo." Los Custodios dejan de atacar: *"DEMUESTRA QUE ERES SUFICIENTE."* |
| **Final · Núcleo galáctico** | Escala 6 | Los Custodios no protegían la galaxia de ti: esperaban que fueras lo bastante grande. LUMEN abre las esclusas y se deja devorar llevando el archivo de la humanidad. Big Bang. Epílogo: en un universo nuevo, una mota de luz "recuerda algo que nunca vivió". |

**Temas:** el legado (qué queda de nosotros), el sacrificio (Ilse y LUMEN eligen ser devorados), los ciclos (el final es un comienzo). El giro del capítulo 4 reinterpreta toda la partida: lo que parecía un juego de "comer cosas" es la historia de una madre que se entregó a su creación.

### 5.5 Presentación

- **Transmisiones:** tarjeta con efecto de máquina de escribir y color según el emisor (LUMEN cian, Varga ámbar, Custodios magenta).
- **Frases cortas** de LUMEN al cruzar cada escala durante la partida.
- **Archivo:** todas las transmisiones se pueden releer.
- **Si el jugador gana muy rápido**, los capítulos que no leyó se muestran antes del final, para que nadie se pierda la historia.

---

## 6. Mecánicas

### 6.1 Movimiento
El agujero va hacia el cursor (estilo agar.io: más lejos el cursor = más rápido). WASD/flechas como alternativa. En táctil, sigue al dedo.

### 6.2 Atraer y devorar
- **Campo gravitatorio** (círculo punteado): atrae los cuerpos con una ligera espiral.
- Puedes devorar cuerpos de hasta el **80 % de tu tamaño** (mejorable con Fauces).
- Devorar da **masa** (creces) y **materia** (moneda). Los rendimientos son decrecientes: cuanto más grande eres, menos aporta cada cuerpo en relación con tu tamaño.

### 6.3 Romper lo grande
Lo que no puedes comer se marca con un anillo rojo. Al pegarte, la **fuerza de marea** lo desgasta (arco de vida) hasta partirlo en fragmentos comestibles.

### 6.4 Estabilidad (el reloj)
Pierdes estabilidad constantemente, y más rápido cuanto más grande eres y más dura la partida. Devorar cuerpos grandes la recupera (mejora Nutrición). Al llegar a cero te evaporas.

### 6.5 Amenazas
- **Custodios** (desde la escala 2): antimateria que te persigue. Quitan 13 de estabilidad. Se destruyen con el pulso o las lunas orbitales; con *Digestión exótica* se pueden comer.

### 6.6 Árbol de investigación (48 nodos, 184 niveles)

| Rama | Color | Función | Nodos clave |
|---|---|---|---|
| **Hambre** | Naranja | Masa y materia | Absorción, Fauces, Frenesí (combo), Apetito infinito |
| **Gravedad** | Azul | Alcance, fuerza, movilidad | Pulso gravitatorio (habilidad activa), Gran Atractor |
| **Estabilidad** | Verde | Duración de la partida | Nutrición, Segunda oportunidad (revivir), Horizonte eterno |
| **Marea** | Rojo | Romper cuerpos grandes | Lunas orbitales, Espaguetificación |
| **Cosmos** | Violeta | Densidad y botín | Cristales cuásar (dorados x10), Cometas (x6) |
| **Origen** | Amarillo | Tamaño inicial y meta | Masa primordial, Eco del colapso, Singularidad desnuda |

Los nodos profundos se bloquean hasta alcanzar ciertas escalas: así el árbol se revela al ritmo de la historia.

### 6.7 Logros (para Steam, pendientes de implementar)
Primera comida · Cada escala (6) · Romper 1000 cuerpos · Combo máximo · Comer un Custodio · Ganar sin Segunda oportunidad · Árbol al 100 % · Leer todo el archivo · Final en menos de 60 partidas · Secreto: comerse un cometa dorado.

---

## 7. Progresión y balance

El balance se hizo con datos: `tools/balance-sim.js` juega con un bot que persigue lo comestible, esquiva Custodios y compra siempre la mejora más barata (un jugador "promedio").

**Resultado actual (bot):**

| Escala | Partida aprox. | Minutos de juego (bot) |
|---|---|---|
| 1 · Nube de polvo | 2–4 | ~1 |
| 2 · Cinturón de asteroides | 8–15 | ~3–7 |
| 3 · Escala lunar | 35–47 | ~18–25 |
| 4 · Escala planetaria | 46–58 | ~25–33 |
| 5 · Escala estelar | 52–62 | ~30–37 |
| 6 · Núcleo galáctico (final) | 61–64 | ~40 |

Estimación para una persona: **x1,7 a x2,2** respecto del bot (decide más lento, lee la historia, explora el árbol): **~1,5 h para ver el final**, ~3 h para el 100 %. En línea con lo que el público espera por USD 4,99.

**Decisiones de balance aplicadas:**
1. Rendimientos decrecientes de masa (`GROWTH_ALPHA = 0.9`) para evitar el crecimiento exponencial descontrolado.
2. Drenaje de estabilidad que crece con el tamaño (`DRAIN_BETA = 0.6`): el tamaño máximo de cada partida depende de las mejoras.
3. La nutrición depende del tamaño relativo de lo devorado: las migajas no sostienen la partida.
4. Coste por profundidad del árbol `[1, 1, 1,5, 2,5, 8, 55, 160]`.

**Pendiente:** la meseta entre las escalas 2 y 3 (~15 min) es la más larga. Hay que validarla con testers reales; si aburre, se añade un nodo intermedio o se baja el umbral de la escala 3.

---

## 8. Dirección de arte

### 8.1 Estilo elegido: **"Neón cósmico vectorial"**

Fondo espacial profundo violeta-azul, cuerpos con sombreado suave, todo lo importante **brilla** (mezcla aditiva). Sin contornos pixelados: formas limpias y legibles.

**Por qué este estilo y no pixel art:**
- **El público lo compra:** Nodebuster y los incrementales geométricos venden con estéticas minimalistas brillantes; el brillo y las partículas son el "eye candy" que funciona en GIFs y Shorts.
- **Se genera por código:** todos los sprites (rocas, lunas con cráteres, gigantes gaseosos con anillos, estrellas, galaxias espirales) se crean de forma procedural al iniciar. Cero coste de artista, cero problemas de derechos, variedad infinita.
- **Escala a cualquier resolución** (4K, Steam Deck, móvil) sin perder nitidez.
- **El tema lo pide:** el espacio es luz sobre negro.

### 8.2 Paleta y lenguaje visual

| Elemento | Color | Significado |
|---|---|---|
| Agujero (anillo de fotones) | Blanco cálido → naranja | El jugador: siempre lo más brillante del centro |
| Disco de acreción | Naranjas/dorados | Energía, crecimiento |
| Custodios | **Magenta** con púas | Peligro (único elemento magenta del juego) |
| Cuerpos dorados | Halo dorado pulsante | Recompensa extra |
| No comestible | Anillo **rojo punteado** | "Rómpelo primero" |
| Estabilidad baja | Viñeta violeta que pulsa | Urgencia |

### 8.3 Pendiente para Steam
- **Cápsula de tienda** (la imagen más importante del marketing): logo VOIDLING sobre el agujero devorando un planeta. Se puede componer desde el juego; recomiendo invertir 150–400 USD en un artista de cápsulas si hay presupuesto.
- Iconos de logros, fondo de la biblioteca de Steam.

---

## 9. Audio

- **Música:** pad ambiental generativo (progresión Am9 – Fmaj7 – Cadd9 – G6 – Em7) con delay espacial y "destellos" aleatorios. El filtro se abre durante las partidas (más intenso) y se cierra en menús.
- **Efectos:** todo sintetizado. Al devorar en cadena, cada bocado sube una nota de la **escala pentatónica**: los combos *suenan* a melodía. Golpes graves al romper, "whoosh" en el pulso, arpegio al cruzar escala.
- **Pendiente:** 2–3 temas compuestos para momentos clave (final, escala estelar). Opción: música libre de derechos con licencia comercial.

---

## 10. Plataformas y controles

| Plataforma | Estado | Notas |
|---|---|---|
| Navegador (CrazyGames, itch.io) | ✅ funciona | SDK de CrazyGames integrado en la capa `platform.js`; se activa descomentando una línea |
| Windows (Steam) | ⬜ | Empaquetar con Electron + steamworks.js (logros, nube) |
| Steam Deck | ⬜ | Requiere soporte de mando y textos legibles a 1280x800 |
| Móvil | 🟡 | El táctil funciona; publicar en tiendas móviles queda fuera del alcance inicial |

---

## 11. Roadmap de contenido

**Antes del lanzamiento (v1.0):** logros, mando/Steam Deck, 2 enemigos nuevos (Pulsar: anillos de daño; Enjambre: grupos que rodean), jefe final visual "Gran Atractor", modo daltónico, música compuesta, pruebas con 5–10 personas.

**Post-lanzamiento (actualizaciones gratuitas, generan visibilidad en Steam):**
- **Ciclo II "Universo joven":** prestigio narrativo. El nuevo universo tiene otras leyes físicas (modificadores) y una nueva rama del árbol. Continúa la historia desde el epílogo.
- Modo infinito con tabla de récords.
- Semilla diaria.

---

## 12. Riesgos

| Riesgo | Mitigación |
|---|---|
| El mercado de incrementales/bullet heaven está saturado (329 lanzamientos de bullet heaven solo en 2026, según SteamPageAnalyzer) | Diferenciación por historia + tema cósmico; marketing con clips de "crecer" |
| Pocos deseados (wishlists) al lanzar | Página de Steam cuanto antes + demo en Next Fest + versión web gratuita como embudo |
| El balance aburre a humanos aunque funcione con el bot | Ronda de testers + analíticas simples (dónde abandonan) |
| Dependencia de terceros (verificación de Steam, pagos) | Empezar los trámites YA (ver `LANZAMIENTO.md`) |
