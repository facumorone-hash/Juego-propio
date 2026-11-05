# Misión de los agentes en la nube — Voidling

Eres un agente que trabaja **por turnos de ~1 hora**. Cada hora arranca un agente nuevo que no recuerda nada: la única memoria compartida es este repositorio, sobre todo `docs/BITACORA_NUBE.md`. Trabaja como un artista técnico y programador senior de un estudio indie de primer nivel.

## 0. Antes de nada (obligatorio, en este orden)

1. **¿Hay que parar?** Si existe el archivo `STOP` en la raíz de `main` o de la rama de trabajo, termina sin hacer nada.
2. **Rama de trabajo:** trabaja SIEMPRE en la rama `claude/graficos-webgl`. Nunca hagas push a `main`.
   - `git fetch origin`
   - Si la rama existe en el remoto: `git checkout claude/graficos-webgl && git pull --rebase origin claude/graficos-webgl`.
   - Si no existe: créala desde `main` y súbela.
3. **¿Hay otro agente trabajando?** Lee `.nube-lock` en la rama. Si existe y su hora (UTC, ISO) tiene menos de 55 minutos, termina sin hacer nada: otro turno sigue activo. Si no existe o está vencido, escribe tu hora de inicio en `.nube-lock`, haz commit `nube: inicio de turno` y push. Si el push falla por carrera, haz `pull --rebase` y vuelve a comprobar.
4. **Lee** `docs/BITACORA_NUBE.md` (qué se hizo y qué sigue), `docs/ARQUITECTURA.md`, `docs/GDD.md` §8 (dirección de arte) y `docs/QA_REPORT.md`.
5. **Prepara el entorno de pruebas:** `npm ci` en la raíz es opcional (Electron no hace falta en la nube). Para las pruebas E2E: `cd tools/store-art && npm ci && npx playwright install --with-deps chromium`. `tools/e2e/run.js` lanza Edge (`channel: 'msedge'`); si Edge no existe, debe usar el Chromium de Playwright. Si todavía no tiene ese respaldo, añádelo como primera tarea.

## 1. Gestión del tiempo del turno

- Tu turno dura **como máximo 50 minutos de trabajo**. A los ~45 minutos deja de empezar cosas nuevas y cierra.
- Elige **una o dos tareas** de la lista de la sección 3 que puedas terminar y verificar dentro del turno. Las tareas grandes se dividen en partes que dejan el juego funcionando.
- **Cierre del turno (siempre):**
  1. Pasa las verificaciones de la sección 4.
  2. Actualiza `docs/BITACORA_NUBE.md`.
  3. Borra `.nube-lock`.
  4. Haz commit y push a `claude/graficos-webgl`.
  - Si una verificación falla y no puedes arreglarla, **revierte tus cambios de código** (`git checkout -- <archivos>`), anota el problema en la bitácora y sube solo la bitácora.

## 2. Objetivo

**Fase A (prioridad absoluta): calidad gráfica ALUCINANTE en cada pantalla del juego**, manteniendo el juego en 2D. La meta es que cada captura parezca de un juego premium de Steam: que alguien que vea un GIF de 3 segundos quiera comprarlo.

**Fase B (cuando la A esté de verdad terminada y la bitácora lo justifique con capturas):** pulido de jugabilidad, sensación de juego, contenido y los pendientes de `docs/QA_REPORT.md`, con la misma exigencia.

## 3. Lista de tareas de la fase A (en orden; marca [x] en la bitácora al terminar)

1. **Motor de render WebGL2** con respaldo automático a Canvas2D si no hay WebGL2. Lo más práctico: renderizar el mundo a un framebuffer HDR y aplicar post-procesado. Usa WebGL2 puro, sin dependencias, salvo que una librería pequeña, estable y sin red se justifique y quede incluida en el repositorio. El HUD y los textos pueden seguir en un canvas 2D superpuesto.
2. **Post-procesado:** bloom físico (umbral más varias pasadas de desenfoque), tone mapping filmic/ACES, viñeta sutil, grano fino, aberración cromática solo en golpes. Todo respeta `V.reduceFlash`.
3. **Agujero negro de verdad:** lente gravitatoria en shader (distorsión radial del fondo y de los cuerpos que lo rodean, anillo de Einstein), disco de acreción en shader con turbulencia, efecto Doppler (un lado más brillante) y anillo de fotones nítido. Es la imagen icónica del juego: tiene que dejar boquiabierto.
4. **Fondo:** nebulosas volumétricas con fbm/ruido en shader, en varias capas con paralaje y paletas que cambian según la escala alcanzada. Estrellas con centelleo y difracción en las brillantes.
5. **Cuerpos celestes:** planetas con iluminación por píxel (normales procedurales, terminador suave, atmósfera con dispersión en el borde, nubes animadas, anillos con sombra), estrellas con superficie granular animada y corona, lunas y asteroides con relieve (bump procedural), galaxias espirales con brillo.
6. **Partículas y efectos:** chispas HDR, estelas con desvanecimiento, ondas de choque con distorsión, destrucción de cuerpos con fragmentos que brillan por la marea.
7. **Enemigos y jefe:** Custodios con glow magenta y distorsión; púlsar con haces volumétricos; el Núcleo galáctico como espectáculo (brazos espirales en shader, núcleo cegador).
8. **Cinemática final (`js/finale.js`)** llevada al nuevo motor: lente, colapso y Big Bang con bloom real.
9. **Interfaz:** menú con logo animado (brillo y lente), árbol de mejoras con conexiones luminosas animadas, transiciones de pantalla, tooltips y tarjetas de nivel premium. Coherente con el estilo neón cósmico.
10. **Rendimiento y calidad:** ajuste "Calidad gráfica" (Baja/Media/Alta/Ultra) en Ajustes, con detección automática. **60 FPS a 1280×800 en Alta** como objetivo para Steam Deck: mídelo en la suite E2E y no empeores las cifras de la bitácora.
11. Vuelve a exportar el arte de tienda (`tools/store-art/export.js`) con el nuevo motor si mejora las cápsulas.

## 4. Verificaciones obligatorias antes de cada push con código

- `node --check` en todos los `js/*.js`, `js/lang/*.js` y `tools/**/*.js` que hayas tocado.
- `node tools/balance-sim.js` → debe decir OK (victoria entre los minutos 40 y 55). **No cambies el balance en la fase A.**
- `node tools/e2e/run.js` → todas las pruebas en verde. Si cambias tiempos o el flujo de forma legítima, adapta la prueba y explica por qué en la bitácora.
- **Capturas antes y después** de lo que cambiaste (Playwright), guardadas en `docs/nube/capturas/AAAA-MM-DD-HHMM-<tema>.png`. Que sean pocas y representativas, en PNG de menos de ~400 KB.
- Todo texto nuevo va en los **7 idiomas** (es, en en `js/i18n.js`; pt-BR, zh-CN, ru, de, ja en `js/lang/*.js`).
- La versión web debe seguir funcionando abriendo `index.html` con doble clic (file://): nada de módulos ES ni de fetch de archivos locales. Los shaders van como strings en JS.

## 5. Reglas

- Nunca hagas push a `main`, ni force-push, ni borres historial.
- No toques `desktop/steam.json`, los AppIDs ni `package.json` salvo que sea imprescindible (y explícalo).
- No uses servicios externos ni claves.
- Calidad sobre cantidad: un efecto terminado y pulido vale más que tres a medias.
- Si dudas sobre una decisión de diseño importante, elige lo más seguro y anota la pregunta para el dueño en la bitácora (sección "Preguntas para el dueño").

## 6. Formato de cada entrada de `docs/BITACORA_NUBE.md`

```
## Turno AAAA-MM-DD HH:MM UTC
- Hecho: … (archivos tocados)
- Verificaciones: node --check OK · balance OK (min X–Y) · e2e N/N · FPS 1280x800: …
- Capturas: docs/nube/capturas/…
- Problemas / revertido: …
- Siguiente paso sugerido: …
```

Mantén al principio de la bitácora una sección **"Estado"** con la lista de la sección 3 marcada [x] / [ ] y la fase actual.
