# VOIDLING

Incremental roguelite cósmico con historia. HTML5 + JavaScript puro, sin dependencias.

## Jugar
- Doble clic en `index.html` (funciona sin servidor), o
- `python -m http.server 8765` y abrir http://localhost:8765

**Controles:** ratón (el agujero va hacia el cursor) · WASD/flechas · ESPACIO o clic derecho = Pulso · ESC = pausa.

## Estructura
| Archivo | Contenido |
|---|---|
| `js/core.js` | Utilidades, escalas, curvas de balance (`GROWTH_ALPHA`, `DRAIN_BETA`) |
| `js/upgrades.js` | Árbol de mejoras: nodos, costes, estadísticas |
| `js/run.js` | Simulación de una partida (sin DOM, también corre en Node) |
| `js/story.js` | Historia: transmisiones, final, frases de LUMEN |
| `js/i18n.js` | Textos ES/EN |
| `js/render.js` | Sprites procedurales, fondo, agujero negro, HUD |
| `js/tree.js` | Pantalla del árbol |
| `js/audio.js` | Música generativa y efectos sintetizados |
| `js/platform.js` | Anuncios/SDK (CrazyGames); no-op en Steam |
| `js/main.js` | Estados, entrada, interfaz, bucle |
| `tools/balance-sim.js` | `node tools/balance-sim.js` — simula una partida completa con un bot |
| `docs/GDD.md` | Documento de diseño |
| `docs/LANZAMIENTO.md` | Plan de lanzamiento, dinero y fechas |

## Build para CrazyGames
Descomentar la línea del SDK en `index.html`. El juego detecta el SDK y activa los anuncios entre partidas y el anuncio opcional "x2 materia".
