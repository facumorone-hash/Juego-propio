# VOIDLING — Logros para Steamworks

La fuente de verdad es `js/achievements.js` (`V.ACHIEVEMENTS`). Esta tabla se copia tal cual en **Steamworks → Edit Steamworks Settings → Stats & Achievements → Achievements**. El **API name** tiene que coincidir exactamente con el `id`: `js/platform.js` desbloquea en Steam con ese nombre cuando el bus emite `ach:unlock`, y al arrancar vuelve a sincronizar todos los logros ya ganados (Steam ignora los repetidos).

Total: **28 logros**, de los cuales **3 son secretos** (*hidden*). Ninguno es imposible. El bot de balance (`tools/balance-sim.js`, un jugador "promedio") consigue 26 en ~110 partidas; los otros dos son `ACH_TREE_100` (unas 30 partidas más tarde) y, según la partida, `ACH_FAST_FINALE`.

## Tabla para Steamworks

| API name | Nombre (EN) | Descripción (EN) | Nombre (ES) | Descripción (ES) | Hidden | Glifo del icono |
|---|---|---|---|---|---|---|
| `ACH_FIRST_MEAL` | First Bite | Devour your first body. | Primer bocado | Devora tu primer cuerpo. | No | meal |
| `ACH_FIRST_RESEARCH` | First Research | Buy your first upgrade in the research tree. | Primera investigación | Compra tu primera mejora en el árbol. | No | research |
| `ACH_SCALE_1` | No Longer an Accident | Reach the Dust Cloud scale. | Ya no eres un error | Alcanza la escala Nube de polvo. | No | scale I |
| `ACH_SCALE_2` | They Have Seen You | Reach the Asteroid Belt scale. | Te han visto | Alcanza la escala Cinturón de asteroides. | No | scale II |
| `ACH_SCALE_3` | That Moon Had a Name | Reach the Lunar scale. | Esa luna tenía nombre | Alcanza la Escala lunar. | No | scale III |
| `ACH_SCALE_4` | An Entire World | Reach the Planetary scale. | Un mundo entero | Alcanza la Escala planetaria. | No | scale IV |
| `ACH_SCALE_5` | Light Within | Reach the Stellar scale. | Luz interior | Alcanza la Escala estelar. | No | scale V |
| `ACH_SCALE_6` | Now. Everything. | Reach the Galactic Core. | Ahora. Todo. | Alcanza el Núcleo galáctico. | No | scale VI |
| `ACH_BREAK_100` | Tidal Force | Shatter 100 large bodies. | Fuerza de marea | Destroza 100 cuerpos grandes. | No | shatter |
| `ACH_BREAK_1000` | Cosmic Grinder | Shatter 1,000 large bodies. | Trituradora cósmica | Destroza 1000 cuerpos grandes. | No | shatter |
| `ACH_DEVOUR_10000` | Insatiable Appetite | Devour 10,000 bodies in total. | Apetito insaciable | Devora 10 000 cuerpos en total. | No | devour |
| `ACH_CHAIN_100` | Chain Feast | Devour 100 bodies in a row without breaking the chain. | Banquete en cadena | Devora 100 cuerpos seguidos sin romper la cadena. | No | chain |
| `ACH_COMBO_MAX` | Absolute Frenzy | With Frenzy fully upgraded, fill the combo meter completely. | Frenesí absoluto | Con Frenesí al nivel máximo, llena el combo por completo. | No | combo |
| `ACH_GOLDEN` | Golden Glow | Devour a golden body. | Brillo dorado | Devora un cuerpo dorado. | No | gold |
| `ACH_COMET` | Make a Wish | Devour a comet. | Pide un deseo | Devora un cometa. | No | comet |
| `ACH_EAT_CUSTODIAN` | A Taste of Antimatter | Devour a Custodian (requires Exotic Digestion). | Sabor a antimateria | Devora un Custodio (requiere Digestión exótica). | No | eatCustodian |
| `ACH_CUSTODIANS_50` | Countermeasures | Destroy 50 Custodians (with your pulse, your moons or by devouring them). | Contramedidas | Destruye 50 Custodios (con el pulso, las lunas o devorándolos). | No | custodians |
| `ACH_PULSAR` | Lighthouse Out | Destroy a pulsar. | Faro apagado | Destruye un púlsar. | No | pulsar |
| `ACH_BIG_BITE` | Eyes Bigger Than the Horizon | Devour a body larger than yourself. | Ojos más grandes que el horizonte | Devora un cuerpo más grande que tú. | No | bigbite |
| `ACH_LONG_RUN` | Lingering Horizon | Survive for 60 seconds in a single run. | Horizonte persistente | Sobrevive 60 segundos en una sola partida. | No | clock |
| `ACH_NO_REVIVE` | No Safety Net | Finish a winning run without Second Chance kicking in. | Sin red | Completa una partida victoriosa sin que se active Segunda oportunidad. | No | shield |
| `ACH_FAST_FINALE` | In a Hurry | Complete Cycle I in 70 runs or fewer. | Agujero con prisa | Completa el Ciclo I en 70 partidas o menos. | No | bolt |
| `ACH_TREE_100` | Fully Calibrated | Max out every upgrade in the research tree. | Calibración total | Lleva todas las mejoras del árbol a su nivel máximo. | No | tree |
| `ACH_ARCHIVE` | Archivist | Receive every transmission in the archive, even those that arrive after the ending. | Archivista | Recibe todas las transmisiones del archivo, incluso las que llegan después del final. | No | archive |
| `ACH_RUNS_100` | Just One More | Play 100 runs. | Una más | Juega 100 partidas. | No | loop |
| `ACH_TRUTH` | The First Thing You Ate | Learn what became of Dr. Ilse Varga. | Lo primero que devoraste | Descubre qué fue de la Dra. Ilse Varga. | **Sí** | ember |
| `ACH_CYCLE_ONE` | Bloom | Complete Cycle I. | Florecer | Completa el Ciclo I. | **Sí** | bigbang |
| `ACH_EXPRESS` | Express Evaporation | End a run in less than 5 seconds. | Evaporación exprés | Termina una partida en menos de 5 segundos. | **Sí** | express |

En Steamworks, el idioma base es **English**. Los textos en español se cargan en la pestaña de localización: *Spanish - Spain*, y conviene copiarlos también en *Spanish - Latin America*.

## Cuándo salta cada uno (para QA)

| API name | Condición exacta en el código | Momento aproximado (bot) |
|---|---|---|
| `ACH_FIRST_MEAL` | `save.totalEaten` + cuerpos devorados en la partida actual ≥ 1 | partida 1 |
| `ACH_FIRST_RESEARCH` | algún nodo distinto de `core` con nivel > 0 | partida 1 |
| `ACH_SCALE_1…6` | récord o escala de la partida actual ≥ N (salta al cruzar la escala) | 8 / 14 / 43 / 57 / 61 / 63 |
| `ACH_BREAK_100/1000` | `achStats.broken` + `run.broken` (incluye púlsares rotos) | 13 / 52 |
| `ACH_DEVOUR_10000` | `save.totalEaten` + `run.eaten` | 47 |
| `ACH_CHAIN_100` | cadena (`chain` de `run:eat`) ≥ 100 | 9 |
| `ACH_COMBO_MAX` | `run.combo` ≥ suma `per × max` de los nodos con estadística `combo` (hoy 15) | 25 |
| `ACH_GOLDEN` / `ACH_COMET` | se devora un objeto con `gold` / de tipo `comet` | 7 / 19 |
| `ACH_EAT_CUSTODIAN` | se devora un objeto de tipo `anti` (requiere el nodo `o4`) | 40 |
| `ACH_CUSTODIANS_50` | Custodios destruidos acumulados (pulso, lunas o devorados) | 45 |
| `ACH_PULSAR` | evento `run:kill {kind:'pulsar'}` | 56 |
| `ACH_BIG_BITE` | se devora un cuerpo con `rel = s / r ≥ 1` (requiere Fauces + Hambre profunda, o Singularidad desnuda) | 64 |
| `ACH_LONG_RUN` | `run.t ≥ 60` | 62 |
| `ACH_NO_REVIVE` | partida victoriosa sin `run:revive` ni `run.reviveUsed` | 66 |
| `ACH_FAST_FINALE` | partida victoriosa con `save.runs ≤ 70` (constante `FAST_FINALE_RUNS`) | el bot gana entre la 59 y la 67 |
| `ACH_TREE_100` | todos los niveles de `V.NODES` al máximo | ~140 |
| `ACH_ARCHIVE` | todas las entradas de `V.STORY` y `V.STORY_POST` en `save.seenLogs` | 3 partidas después del final |
| `ACH_RUNS_100` | `save.runs ≥ 100` | 100 |
| `ACH_TRUTH` | se vio la transmisión `c4b` (si la narrativa cambia el id: al ganar) | 53–59 |
| `ACH_CYCLE_ONE` | evento `victory`, `run:bossDefeat` o `save.victory` | 59–67 |
| `ACH_EXPRESS` | partida no victoriosa con `run.t < 5` s (solo es posible con PAUSA → TERMINAR RUN) | — |

Al cargar un guardado antiguo se comprueban todos los logros que dependen del guardado (escalas, totales, árbol, archivo, final…). Si salen más de 3 a la vez, se muestra un único toast de resumen.

## Iconos

Steam pide **dos imágenes por logro**:

- **Achieved** (desbloqueado): **256 × 256 px**.
- **Unachieved** (bloqueado): **256 × 256 px**, la misma imagen en **escala de grises**. Steam no la genera sola.
- Formato: JPG (o PNG). Confirmar el formato aceptado en el panel al subir. El cliente de Steam los reduce a 64 × 64 y 32 × 32: los glifos están pensados para leerse a esos tamaños.

Los iconos se generan por código con el mismo estilo del juego (neón sobre violeta profundo, borde del color del logro):

```js
// En la consola del navegador con el juego abierto (index.html):
V.Achievements.downloadIcons(256);   // descarga 56 PNG: ACH_X.png y ACH_X_locked.png
// o, para un script de build o tienda:
V.achievementIcon('ACH_COMET', 256, true);   // → <canvas> 256×256 desbloqueado
V.achievementIcon('ACH_COMET', 256, false);  // → versión bloqueada (gris)
V.Achievements.exportIcons(256);             // → [{ id, unlocked: dataURL, locked: dataURL }, …]
```

Para JPG: `canvas.toDataURL('image/jpeg', 0.95)`. Las esquinas son transparentes, así que en JPG quedan negras, lo cual encaja con el fondo de Steam.

## Notas de integración

- Evento del bus: `ach:unlock { id }`. Lo escuchan `js/platform.js` (Steam) y el audio. Además, `ach:open` y `ach:close` se emiten al abrir y cerrar la pantalla de logros.
- Guardado: `save.achievements = { ID: timestampMs }` y `save.achStats` (contadores acumulados). Steam Cloud los sincroniza junto con el resto del guardado.
- Posición de las notificaciones: Steam muestra su propia notificación abajo a la derecha, en el mismo sitio que nuestro toast. Recomendado en el build de Steam: `SteamUtils()->SetOverlayNotificationPosition(k_EPositionTopRight)`, o el equivalente en steamworks.js.
- La demo de Next Fest es otra app de Steam. Si se quieren logros en la demo, hay que darlos de alta allí también. Solo se pueden conseguir los de las escalas 1 y 2 y los primeros.
