# Builds y publicación — Voidling

Un solo código (`index.html` + `js/`) y cuatro destinos. Todo se genera con Node; no hay bundler.

| Destino | Comando | Salida | Para qué |
|---|---|---|---|
| web | `npm run build:web` | `dist/web/` + `dist/voidling-web-<ver>.zip` | itch.io, galaxy.click (sin anuncios) |
| crazygames | `npm run build:crazygames` | `dist/crazygames/` + zip | CrazyGames (SDK v3 activo, anuncios) |
| demo | `npm run build:demo` | `dist/demo/` + zip | Demo de Steam Next Fest (`V.CONFIG.demo = true`) |
| steam | `npm run build:steam` | `dist/steam/` + zip | Juego completo para Electron |
| todos | `npm run build:all` | los cuatro | — |
| ejecutable | `npm run dist:win` | `out/Voidling-win32-x64/Voidling.exe` | Subir a Steam |
| ejecutable demo | `npm run dist:win:demo` | `out/VoidlingDemo-win32-x64/VoidlingDemo.exe` | Subir la demo a Steam |

Otros: `npm start` (Electron en modo desarrollo, carga el `index.html` de la raíz; F12 = herramientas, Ctrl+R = recargar), `npm run start:steam` (construye `dist/steam` y lo abre en Electron como en producción), `npm run check` (valida el `index.html` del proyecto), `npm run icon` (regenera `desktop/icon.ico`/`icon.png`).

## Requisitos

- Node 18+ (probado con Node 24 / npm 11) en Windows 10/11 x64.
- `npm install` una vez. Instala `electron` y `@electron/packager` (desarrollo) y `steamworks.js` (va dentro del exe).
  - Si `npx electron` dice que falta el binario: `node node_modules/electron/install.js`.
  - La primera vez, `dist:win` descarga el zip de Electron (~110 MB) y lo deja en caché.

## Qué hace `tools/build.js`

`node tools/build.js <web|crazygames|demo|steam|all|check>`

1. Copia a `dist/<destino>/` solo lo que es juego: `index.html`, `js/` y, si existen, `assets/ audio/ img/ images/ fonts/ sfx/ music/` y `favicon.*`. Nunca copia `docs/`, `tools/`, `desktop/`, `marketing/`, `node_modules/`, `dist/`, `out/`.
2. Reescribe `dist/<destino>/js/config.js` (la copia): `build`, `demo`, `version` (de `js/config.js`) y `buildDate`. Conserva el resto de claves (`storeUrl`, `demoMaxMilestone`...). Avisa si `package.json` y `js/config.js` tienen versiones distintas: **súbelas juntas**.
3. `crazygames`: descomenta en la copia la línea `<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js">` de `index.html`. `demo`: añade "Demo" al `<title>`.
4. Valida cada destino: todos los `<script src>` activos existen y compilan, `js/config.js` va primero, `js/platform.js` está, ningún script externo salvo el SDK (y solo en crazygames), y `V.CONFIG` tiene los valores esperados. Si algo falla, el build termina con error.
5. Genera `dist/voidling-<destino>-<versión>.zip` con `index.html` en la raíz del zip (lo que piden itch.io y CrazyGames).

Si se añade una carpeta nueva de recursos con otro nombre, agrégala a `COPY_DIRS` en `tools/build.js`.

## Escritorio (Electron)

Archivos en `desktop/`:

| Archivo | Qué es |
|---|---|
| `main.js` | Proceso principal: ventana, teclas, guardado en archivo, Steamworks, tienda |
| `preload.js` | Expone `window.voidlingDesktop` al juego (contextIsolation + sandbox) |
| `steam.json` | AppIDs (`appId`, `demoAppId`, por defecto 480 = Spacewar) y `restartViaSteam` |
| `icon.ico` / `icon.png` | Icono provisional generado por `make-icon.js` (reemplazable por el arte final) |
| `package-win.js` | Empaquetado con @electron/packager |
| `steampipe/*.vdf` | Plantillas de SteamPipe |

Comportamiento:
- Arranca a **pantalla completa**; **F11** o **Alt+Enter** alternan con ventana (se recuerda en `%APPDATA%\Voidling\window.json`). Alt+F4 cierra. Sin menú, título "Voidling".
- Carga `dist/steam/index.html` (o `dist/demo/` en el exe de la demo). Con `--dev` (`npm start`) carga la raíz.
- No frena el renderizado en segundo plano (la partida ya se pausa sola al perder el foco).
- El audio arranca sin esperar un clic.
- Solo una instancia a la vez. Si la página se cuelga, se recarga (el guardado está en disco).
- La ventana nunca navega fuera del juego; los enlaces `https://` se abren en el navegador del sistema.
- Si se detecta Proton/Wine, se desactiva el sandbox de Chromium (`--no-sandbox`), que bajo Wine suele fallar.

API para el juego (`js/platform.js` la usa; los demás módulos deberían usar `V.Platform`):

```
window.voidlingDesktop.info               { version, steam, steamDeck, appId, dev, demo, savePath, platform, wine }
window.voidlingDesktop.saveRead()         -> { t, data } | null   (síncrono)
window.voidlingDesktop.saveWrite(data, t, sync)
window.voidlingDesktop.unlockAchievement(id) -> Promise<boolean>
window.voidlingDesktop.openStore()        -> Promise<'overlay'|'steam'|'browser'|false>
window.voidlingDesktop.toggleFullscreen() / quit()
```

`V.Platform` (web y escritorio): `init, gameplayStart, gameplayStop, loadingStop, midgameAd, rewardedAd, hasRewarded, name ('standalone'|'crazygames'|'desktop'), sdk` + `openStore(), unlockAchievement(id), isDesktop, isSteam, isSteamDeck, canOpenStore, toggleFullscreen(), quit()`. En web, `toggleFullscreen`/`quit` devuelven `false` sin hacer nada; en CrazyGames `openStore()` no hace nada (`canOpenStore = false`, sus normas no permiten enlaces a otras tiendas).

### Guardado y Steam Auto-Cloud

- El juego sigue guardando en `localStorage` (clave `voidling_save_v1`).
- En escritorio, `platform.js` envuelve `V.Save.save()` y copia el guardado (agrupando escrituras seguidas, y de forma síncrona al cerrar) a:

  **`%APPDATA%\Voidling\save\voidling_save.json`** (p. ej. `C:\Users\<usuario>\AppData\Roaming\Voidling\save\voidling_save.json`)

  Formato: `{ "format":1, "game":"voidling", "version":"0.2.0", "t":<ms>, "data":"<JSON del guardado>" }`. Se escribe en un `.tmp` y se renombra (atómico); el anterior queda como `voidling_save.json.bak` (no lo sincroniza Steam).
- Al arrancar (antes de que `main.js` cargue el guardado): si el archivo es **más nuevo** que el `localStorage` (marca `voidling_save_stamp`) o no hay guardado local, se restaura el archivo. Si el local es más nuevo, se copia al archivo.
- La demo usa la misma carpeta **a propósito**: el progreso de la demo continúa en el juego completo.

**Configurar Auto-Cloud** (Steamworks → App Admin → Cloud → Steam Cloud Settings):
1. *Byte quota per user*: `1048576` (1 MB) · *Number of files allowed per user*: `10`.
2. Auto-Cloud → *Root Paths* → añadir:
   - Root: **`WinAppDataRoaming`** · Subdirectory: **`Voidling/save`** · Pattern: **`*.json`** · OS: **Windows** · Recursive: no.
3. No hace falta *Root override* para Steam Deck: el juego corre bajo Proton y Proton mapea `WinAppDataRoaming` dentro de su prefijo.
4. Guardar y **publicar** los cambios de la app (Publish). Hacer lo mismo en la app de la demo si se quiere nube en la demo.
5. Probar: jugar en un PC, cerrar, comprobar en https://store.steampowered.com/account/remotestorage que aparece el archivo; abrir en otro PC / Deck.

### Steamworks (logros, tienda)

- Se usa `steamworks.js` en el proceso principal. Si Steam no está abierto (o no está instalado), se registra un aviso y el juego funciona igual, sin logros.
- **AppID** (orden de prioridad): variable `VOIDLING_STEAM_APPID` → `steam_appid.txt` (junto al exe, en el directorio actual o en la raíz del proyecto) → `SteamAppId` que define Steam al lanzar el juego → `desktop/steam.json` (`appId`, o `demoAppId` en la demo) → `480`.
- **`steam_appid.txt` es solo para desarrollo** (probar el exe fuera de Steam con tu AppID). No se sube: está en `.gitignore` y excluido en `depot_build.vdf`.
- Logros: `achievements.js` emite `V.bus.emit('ach:unlock', {id})`; `platform.js` llama a `unlockAchievement(id)` y el proceso principal hace `achievement.activate(id)` + `stats.store()`. Al arrancar se re-sincronizan los logros que figuren en el guardado (`save.achievements` como array u objeto `{id:true}`). **Los "API Name" en Steamworks deben ser idénticos a los IDs `ACH_*` de `V.ACHIEVEMENTS`.** Con el AppID 480 (Spacewar) los logros ACH_* no existen: es normal que `activate` devuelva false.
- Tienda (`V.Platform.openStore()`): en Steam Deck abre el overlay de Steam; en Windows con Steam abierto usa `steam://store/<appId>`; sin Steam abre `https://store.steampowered.com/app/<appId>/` en el navegador. Usa siempre `appId` de `steam.json` (el del juego completo, también desde la demo). En web usa `V.CONFIG.storeUrl` (**placeholder `000000` en `js/config.js`: cambiarlo al tener el AppID**).
- `restartViaSteam: true` en `steam.json` (solo con AppID real) hace que, si alguien abre `Voidling.exe` fuera de Steam, Steam lo relance. Opcional; no es DRM.

## Subir a Steam (SteamPipe)

Una vez, en Steamworks (partner.steamgames.com):
1. Crear la app (pagar Steam Direct). Anotar **AppID** y el **DepotID** de Windows (Steamworks crea uno: normalmente AppID+1).
2. Editar `desktop/steam.json` → `"appId": <AppID>` y `js/config.js` → `storeUrl` con el AppID. Cambiar `AppID`/`DepotID` en `desktop/steampipe/app_build.vdf` y `depot_build.vdf`.
3. **Installation → General**: *Launch Options* → Executable **`Voidling.exe`**, Launch type *Launch (Default)*, Operating System **Windows**, CPU 64-bit. Sin argumentos.
4. **SteamPipe → Depots**: el depot de Windows con *Operating System: Windows*, idioma *All languages*.
5. Configurar Auto-Cloud (arriba) y los **logros** (Stats & Achievements) con los mismos IDs `ACH_*`, iconos 256×256 (desbloqueado y gris).
6. Publicar los cambios de la app.

Cada versión:
```
npm run dist:win
# Descargar el SDK de Steamworks (sdk/tools/ContentBuilder/builder/steamcmd.exe)
steamcmd.exe +login <usuario_steamworks> +run_app_build "<ruta>\voidling\desktop\steampipe\app_build.vdf" +quit
```
Luego en Steamworks → SteamPipe → Builds: poner el build en la rama `default` (o en `beta` para probar) y publicar. Probar instalando desde la biblioteca de Steam (no desde la carpeta `out/`), en Windows y en Steam Deck.

**Demo (Next Fest):** en Steamworks se crea como app de demo asociada al juego (tiene su propio AppID y depot). Poner su AppID en `steam.json` → `demoAppId` y en `app_build_demo.vdf`; *Launch Option* → **`VoidlingDemo.exe`**. Construir con `npm run dist:win:demo`.

## Subir a CrazyGames

1. `npm run build:crazygames` → subir `dist/voidling-crazygames-<ver>.zip` en el portal de desarrolladores (Developer Portal → Submit game → HTML5). `index.html` está en la raíz del zip.
2. Requisitos que ya cumple el código: SDK **v3** cargado desde `https://sdk.crazygames.com/crazygames-sdk-v3.js`; `SDK.init()`, `game.loadingStop()`, `gameplayStart()`/`gameplayStop()` al empezar/terminar partidas; anuncio `midgame` entre partidas (cada 3) y `rewarded` opcional ("x2 materia"); audio silenciado durante el anuncio; sin enlaces a otras tiendas (`openStore` desactivado).
3. Revisar antes de enviar (cambian con el tiempo, mirar la documentación actual de CrazyGames): tamaño de descarga inicial pequeño (el juego pesa ~60 KB comprimido), funciona en 16:9 y en pantallas pequeñas, sin pedir datos personales, el jugador puede jugar sin cuenta, el guardado en `localStorage` (CrazyGames recomienda su `SDK.data` para nube; opcional).
4. Probar con el *QA tool* / modo preview del portal (los anuncios de prueba aparecen allí, no en localhost).

## Subir a itch.io y galaxy.click

- **itch.io:** `npm run build:web` → nuevo proyecto → *Kind of project: HTML* → subir `dist/voidling-web-<ver>.zip` → marcar **"This file will be played in the browser"**. Embed: 1280×720, activar *Fullscreen button*, *Mobile friendly* opcional, desactivar *Automatically start on page load* si se prefiere botón de inicio. Añadir el enlace a la página de Steam en la descripción.
- **galaxy.click:** acepta el mismo zip HTML5 (o un enlace a la página de itch). El público de incrementales está allí: incluir enlace a Steam.
- El botón "Ver en Steam" (si la UX lo muestra) usa `V.CONFIG.storeUrl`.

## Checklist de Steam Deck (Proton)

- [ ] En Steamworks, *Steam Deck Compatibility* → solicitar revisión cuando todo lo siguiente esté verificado.
- [ ] Usar el build de Windows bajo **Proton** (no hay build Linux nativo). Proton Experimental / estable recientes.
- [ ] Arranca a pantalla completa a **1280×800** (16:10); textos legibles a esa resolución (mínimo ~9 px de altura de x a 1280×800 según Valve) y sin UI cortada.
- [ ] **Mando** (lo implementa el agente de UX en `js/input.js`): todo el juego, menús, árbol, ajustes y pausa navegables sin ratón ni teclado; los iconos de botones deben mostrar los del mando (A/B/X/Y de Deck/Xbox) cuando se usa mando.
- [ ] Configuración de mando por defecto en Steamworks: *Gamepad with mouse trackpad* o "Gamepad" (el juego usa la Gamepad API, que bajo Proton ve un mando Xbox).
- [ ] No hace falta escribir texto; si algún día se pide, usar el teclado en pantalla de Steam.
- [ ] Botón **Salir** en el menú (en Deck no hay Alt+F4): `V.Platform.quit()` (solo escritorio).
- [ ] Guardado en la nube funcionando entre PC y Deck (Auto-Cloud con `WinAppDataRoaming`).
- [ ] Rendimiento: 60 fps estables, sin sobrecalentar; probar con el límite de 30/40 fps del Deck.
- [ ] Si hay pantalla negra o cierres al arrancar bajo Proton: el juego ya desactiva el sandbox al detectar Wine; como último recurso, opciones de lanzamiento `--no-sandbox --in-process-gpu` o `--disable-gpu`.
- [ ] Al suspender/reanudar el Deck, el juego vuelve en pausa (ya se pausa al perder el foco).

## Problemas conocidos

- **`Error loading V8 startup snapshot file`** al ejecutar Electron: ocurre si el proyecto vive en una carpeta virtualizada por una app de la Tienda de Windows (p. ej. `...\AppData\Local\Packages\...\LocalCache\...`). Copiar el proyecto (o la carpeta `out/...`) a una ruta normal como `C:\dev\voidling`. El exe instalado por Steam no tiene este problema.
- El aviso "Electron Security Warning (Insecure Content-Security-Policy)" solo aparece sin empaquetar; no afecta al juego.
- Tamaño: el exe de Electron 45 pesa ~250 MB y la carpeta completa ~320 MB (Steam la comprime: la descarga real es bastante menor). Es el coste de Electron.
- El exe no está firmado: Windows SmartScreen no se activa para juegos instalados por Steam, pero sí si se distribuye el exe suelto.

## Pruebas automáticas del ejecutable

`VOIDLING_SMOKE=<archivo.json>` hace que el exe cargue el juego, compruebe `V`, la API de `V.Platform`, el puente de escritorio y la escritura del guardado, guarde una captura (`<archivo>.png`) y salga (código 0 si todo va bien). Usar `VOIDLING_USERDATA=<carpeta temporal>` para no tocar el guardado real:

```
set VOIDLING_SMOKE=%TEMP%\voidling-smoke.json
set VOIDLING_USERDATA=%TEMP%\voidling-ud
out\Voidling-win32-x64\Voidling.exe
```
