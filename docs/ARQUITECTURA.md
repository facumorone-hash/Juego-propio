# Arquitectura y reglas de trabajo en paralelo

Varios agentes trabajan **a la vez en la misma carpeta**. Para no pisarse: **cada archivo tiene UN dueño**. Solo editas los archivos de tu fila. Si necesitas algo de otro archivo, usa el bus de eventos o la API `V.game`; si es imposible, déjalo anotado en tu informe final (lo integra el coordinador).

## Dueños de archivos

| Área (agente) | Archivos que PUEDE editar/crear |
|---|---|
| **Gameplay** (enemigos, jefe, balance) | `js/run.js`, `js/render.js`, `js/upgrades.js`, `js/core.js` (solo constantes de balance/tablas), `js/strings-gameplay.js`, `tools/balance-sim.js` |
| **UX** (mando, Steam Deck, accesibilidad, menús, ajustes, pantallas) | `js/main.js`, `index.html`, `js/input.js`, `js/i18n.js`, `js/tree.js`, `js/save.js` |
| **Logros** | `js/achievements.js` |
| **Audio** | `js/audio.js` |
| **Escritorio / Steam / builds** | `desktop/**`, `tools/build.js`, `package.json`, `js/platform.js`, `js/config.js`, `.gitignore` |
| **Tienda / marketing** | `tools/store-art/**`, `marketing/**`, `docs/STEAM_PAGE.md`, `docs/PRESSKIT.md`, `docs/MARKETING.md` |
| **Narrativa** | `js/story.js` |
| Coordinador | todo lo demás (`docs/GDD.md`, `docs/LANZAMIENTO.md`, `README.md`, `docs/ARQUITECTURA.md`) |

**No ejecutes servidores en el puerto 8765** (lo usa el coordinador). Verifica con `node --check archivo.js` y, si puedes, con scripts de Node.

## Orden de carga (index.html)
`config.js → core.js → i18n.js → strings-gameplay.js → upgrades.js → run.js → story.js → save.js → audio.js → platform.js → render.js → tree.js → input.js → achievements.js → main.js`

Todo es JavaScript clásico (sin módulos ES, sin bundler) bajo el espacio global `V`. Debe funcionar abriendo `index.html` con doble clic (file://). `core.js`, `upgrades.js` y `run.js` también se cargan en Node (`tools/balance-sim.js`): no pueden usar `window` ni `document`.

## Puntos de extensión

- **Textos:** `V.addStrings({ es: {clave: '...'}, en: {clave: '...'} })` y `V.t('clave')`. Idioma actual: `V.lang`. Siempre ES + EN.
- **Guardado:** `V.Save.extend({ miCampo: valorPorDefecto })` y `V.Save.extendSettings({ miAjuste: valor })`, llamados al cargar el script (antes de `main.js`). El objeto guardado vive en `V.game.save` (o `V.Save.data`); persistir con `V.Save.save()`.
- **API de juego** (disponible tras `boot`): `V.game.save`, `V.game.state` (`menu|run|ending|results|tree|finale`), `V.game.run` (la `V.Run` activa o null), `V.game.paused`, `V.game.size` `{W,H,DPR}`, `V.game.show(screenId|null)`, `V.game.goTree()`, `V.game.goMenu()`, `V.game.requestRun()`, `V.game.refreshTreebar()`, `V.game.applyI18n()`, `V.game.addShake(n)`, `V.game.setBanner({text, small, sub, color, dur})`, `V.game.setTarget = (run) => ({tx, ty}) | null` (para mando).
- **Plataforma:** `V.Platform` (`js/platform.js`).
- **Config de build:** `V.CONFIG` (`js/config.js`): `version`, `build`, `demo`, `demoMaxMilestone`.

## Bus de eventos — `V.bus.on(evento, fn)` / `V.bus.emit(evento, datos)`

| Evento | Datos | Cuándo |
|---|---|---|
| `boot` | — | Juego inicializado |
| `frame` | `dt` | Cada fotograma |
| `menu:open`, `tree:open` | — | Al entrar en esas pantallas |
| `run:start` | `run` | Empieza una partida |
| `run:end` | `{ run, gain, oldRecord }` | Termina una partida (ya sumada la materia) |
| `run:<tipo>` | evento de la run | Cada evento que la simulación emite (ver abajo) |
| `buy` | `{ node, level }` | Compra en el árbol |
| `story:seen` | `id` | Se mostró una transmisión |
| `victory` | `{ first }` | Final alcanzado |
| `ach:unlock` | `{ id }` | Logro desbloqueado (lo emite achievements.js) |

**Eventos de la run** (`run.emit({t: ...})` en `run.js`, llegan como `run:<t>`):
`eat {rel, chain, gold}`, `break {rel}`, `hit`, `pulse`, `revive`, `milestone {m}`, `end`, `victory`.
El agente de gameplay añadirá: `pulsar` (aparece un púlsar), `ring` (onda de púlsar te golpea), `swarm` (aparece un enjambre), `kill {kind}` (destruyes un enemigo: `'anti'|'swarm'|'pulsar'`), `boss` (aparece el Núcleo), `bossHit`, `bossPhase {phase}`, `bossDefeat`.
`run.eaten`, `run.broken`, `run.combo`, `run.maxR`, `run.milestone`, `run.t`, `run.stab`, `run.stabMax`, `run.reviveUsed`, `run.victory` son legibles desde fuera.

## Pantallas (index.html)
`#menu`, `#results`, `#settings`, `#pause`, `#victory`, `#archive`, `#trans` (transmisiones), `#treebar`, `#tooltip`. Los módulos que necesiten su propia pantalla la crean por JS (añadiendo nodos al `#ui`) e inyectan su CSS con un `<style>` propio, siguiendo el estilo existente (`.screen .dim .card button.primary`).


---

## OLA 2 — dueños de archivos

| Área | Archivos |
|---|---|
| **Traducción `<code>`** (pt-BR, zh-CN, ru, de, ja) | `js/lang/<code>.js`, `docs/store/<code>.md` |
| **QA y pulido** | todo `js/*.js` (excepto `js/lang/`), `index.html`, `tools/balance-sim.js`, `tools/e2e/**` |
| **Revisor/playtester** | solo lectura del juego; escribe `docs/QA_REPORT.md` y scripts propios en `tools/qa/**` |
| Coordinador | docs restantes, `desktop/**`, `tools/build.js`, `package.json` |

## Idiomas (paquetes externos)

Cada idioma vive en `js/lang/<code>.js` (ya enlazado en index.html, carga después de achievements.js y antes de main.js). Estructura:

```js
(function () {
  const V = window.V, C = 'pt-BR';
  V.registerLang(C, 'Português (Brasil)');        // aparece en el selector de idioma
  V.addStrings({ [C]: { /* TODAS las claves de interfaz */ } });
  // Nodos del árbol: claves node_<id>_n y node_<id>_d dentro de addStrings.
  // Logros: claves ach_<ID>_n y ach_<ID>_d dentro de addStrings.
  // Historia: añadir la propiedad [C] a cada entrada de V.STORY y V.STORY_POST (por id),
  //           a cada línea de V.ENDING (por índice), a V.EVENT_LINES[k], V.DEMO_END, V.CREDITS_TEXT,
  //           y V.MILESTONE_LINES[C] = [7 frases].
})();
```

Respaldo automático: idioma → inglés → español (`V.t`, `V.pick`, `V.nodeName`). `V._S` expone la tabla de textos para verificar cobertura (comparar claves de `V._S.en` con `V._S[code]`). Los marcadores `{A}`, `{runs}`, `{time}`, `[ESTUDIO]`, etc. deben conservarse tal cual. Las claves `*_pad` son variantes para mando.

## Cambios tras la QA (ola 2)

- **Eventos:** el evento interno de fin de partida de la simulación (`{t:'end'}`) se publica en el bus como **`run:over`**; `run:end {run, gain, oldRecord}` lo emite solo `finishRun`.
- **Fuentes:** `V.FONT` y `V.font(peso, px)` (`i18n.js`) devuelven la pila de fuentes con respaldo CJK (específica para japonés). En CSS: `--font` y `--mono`.
- **Texto en canvas:** `V.Render.fitText`, `fitFont`, `fontPx` y `wrapLines` (corta por carácter en CJK).
- **API de juego:** `V.game.hintActive` y `V.game.fitTreebar`.
- **Historia:** `V.Story.sync` sincroniza las transmisiones post-final con `save.victory`.
- **Créditos:** `V.CONFIG.creditNames` permite nombres reales.
- **Pruebas:** `node tools/e2e/run.js` (suite E2E, 25 pruebas; `--shots`, `--list`, filtro por nombre) y `node tools/balance-sim.js` (falla si la victoria del bot cae fuera de 40–55 min).
