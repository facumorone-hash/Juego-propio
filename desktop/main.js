// Proceso principal de Electron para la versión de escritorio (Steam) de Voidling.
//
// - Ventana a pantalla completa por defecto; F11 o Alt+Enter alternan ventana / pantalla completa.
// - Sin menú, icono propio, título fijo "Voidling", cierre limpio (guarda antes de salir).
// - Carga dist/steam/index.html (o dist/demo/ en el build de la demo). Con --dev carga el index.html de la raíz.
// - Guardado espejo en <userData>/save/voidling_save.json para Steam Auto-Cloud (ver docs/BUILD.md).
// - Steamworks (steamworks.js): logros y tienda. Si Steam no está abierto, el juego funciona igual.
//
// Variables de entorno útiles (desarrollo / pruebas):
//   VOIDLING_STEAM_APPID=480   fuerza el AppID      VOIDLING_GAME_DIR=<carpeta>  carga otro build
//   VOIDLING_NO_STEAM=1        no inicia Steamworks  VOIDLING_USERDATA=<carpeta>  otra carpeta de datos
//   VOIDLING_NO_SANDBOX=1      desactiva el sandbox de Chromium (Proton/Wine)
//   VOIDLING_SMOKE=<archivo>   prueba automática: carga, comprueba, escribe un JSON con el resultado y sale
'use strict';
const { app, BrowserWindow, ipcMain, shell, Menu, screen } = require('electron');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..'); // raíz de la app (dentro de app.asar si está empaquetada)
const DEV = process.argv.includes('--dev') || process.env.VOIDLING_DEV === '1';
const SMOKE = process.env.VOIDLING_SMOKE || '';
const PKG = readJson(path.join(ROOT, 'package.json')) || {};
const VERSION = PKG.version || app.getVersion();

function readJson(file) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return null; } }
function log(...a) { if (DEV || SMOKE) console.log('[voidling]', ...a); }

// ---------- Rutas de datos ----------
// userData fijo = %APPDATA%\Voidling (Windows). Se fija a mano para que no dependa del nombre del paquete.
// La demo comparte la carpeta a propósito: el progreso de la demo continúa en el juego completo.
app.setName('Voidling');
app.setPath('userData', process.env.VOIDLING_USERDATA || path.join(app.getPath('appData'), 'Voidling'));
const USER_DATA = app.getPath('userData');
const SAVE_DIR = path.join(USER_DATA, 'save');
const SAVE_FILE = path.join(SAVE_DIR, 'voidling_save.json');
const WINDOW_FILE = path.join(USER_DATA, 'window.json');

// ---------- Qué build del juego cargar ----------
function resolveGame() {
  if (DEV) return { dir: ROOT, target: 'dev' };
  const candidates = [];
  if (process.env.VOIDLING_GAME_DIR) candidates.push({ dir: path.resolve(process.env.VOIDLING_GAME_DIR), target: 'custom' });
  candidates.push({ dir: path.join(ROOT, 'dist', 'steam'), target: 'steam' });
  candidates.push({ dir: path.join(ROOT, 'dist', 'demo'), target: 'demo' });
  for (const c of candidates) if (fs.existsSync(path.join(c.dir, 'index.html'))) return c;
  // Sin build: en desarrollo se usa la raíz (avisando); empaquetado sería un error de empaquetado.
  console.warn('[voidling] No hay dist/steam ni dist/demo: ejecuta "npm run build:steam". Cargando la raíz.');
  return { dir: ROOT, target: 'dev' };
}
const GAME = resolveGame();
const IS_DEMO = GAME.target === 'demo' || (GAME.target === 'custom' && /demo/i.test(GAME.dir));
const INDEX = path.join(GAME.dir, 'index.html');

// ---------- Proton / Wine (Steam Deck) ----------
// Chromium bajo Wine suele fallar con su sandbox de Windows: se desactiva solo en ese caso.
function underWine() {
  const e = process.env;
  if (e.WINEPREFIX || e.STEAM_COMPAT_DATA_PATH || e.SteamDeck === '1' || e.WINELOADERNOEXEC) return true;
  try { return process.platform === 'win32' && fs.existsSync('Z:\\usr\\bin') && fs.existsSync('Z:\\proc'); } catch (err) { return false; }
}
const WINE = underWine();
if (WINE || process.env.VOIDLING_NO_SANDBOX === '1') app.commandLine.appendSwitch('no-sandbox');
// El audio generativo arranca sin esperar un clic (en escritorio no hace falta el gesto de usuario).
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
// La partida se pausa sola al perder el foco (main.js), así que no hace falta frenar el renderizado en segundo plano.
app.commandLine.appendSwitch('disable-renderer-backgrounding');

// ---------- Steamworks ----------
const steamCfg = readJson(path.join(__dirname, 'steam.json')) || {};
function readAppIdFile() {
  const dirs = [path.dirname(process.execPath), process.cwd(), ROOT, __dirname];
  for (const d of dirs) {
    try {
      const n = parseInt(fs.readFileSync(path.join(d, 'steam_appid.txt'), 'utf8').trim(), 10);
      if (n > 0) return n;
    } catch (e) { /* no existe */ }
  }
  return 0;
}
function resolveAppId() {
  const env = parseInt(process.env.VOIDLING_STEAM_APPID || '', 10);
  if (env > 0) return env; // forzado a mano
  const file = readAppIdFile();
  if (file) return file; // steam_appid.txt (solo en desarrollo; no se sube a Steam)
  const fromSteam = parseInt(process.env.SteamAppId || '', 10);
  if (fromSteam > 0) return fromSteam; // Steam lo define al lanzar el juego desde la biblioteca
  const cfg = parseInt(IS_DEMO ? steamCfg.demoAppId : steamCfg.appId, 10);
  return cfg > 0 ? cfg : 480; // 480 = Spacewar (pruebas)
}
const APP_ID = resolveAppId();
const STORE_APP_ID = parseInt(steamCfg.appId, 10) > 0 ? parseInt(steamCfg.appId, 10) : APP_ID; // la tienda es la del juego completo

let steamworks = null; // módulo
let steam = null; // cliente iniciado (null si Steam no está disponible)
let steamDeck = process.env.SteamDeck === '1';
if (process.env.VOIDLING_NO_STEAM !== '1') {
  try {
    steamworks = require('steamworks.js');
    if (steamCfg.restartViaSteam && app.isPackaged && APP_ID !== 480 && !readAppIdFile()) {
      // Si el exe se abrió fuera de Steam, Steam lo vuelve a lanzar con su contexto y salimos.
      if (steamworks.restartAppIfNecessary(APP_ID)) { app.exit(0); }
    }
    steam = steamworks.init(APP_ID);
    try { steamDeck = steamDeck || !!steam.utils.isSteamRunningOnSteamDeck(); } catch (e) { /* versión sin esta API */ }
    // El overlay de Steam en Electron necesita estos ajustes antes de 'ready'.
    try { steamworks.electronEnableSteamOverlay(); } catch (e) { log('overlay de Steam no disponible', e.message); }
    log('Steamworks iniciado, AppID', APP_ID, steamDeck ? '(Steam Deck)' : '');
  } catch (e) {
    steam = null;
    log('Steam no disponible (el juego sigue sin logros):', e && e.message);
  }
}

// ---------- Guardado espejo (Steam Auto-Cloud) ----------
function validSave(obj) {
  if (!obj || typeof obj.data !== 'string' || obj.data.length < 2) return null;
  try { JSON.parse(obj.data); } catch (e) { return null; }
  return { t: Number(obj.t) || 0, data: obj.data };
}
function readSave() {
  for (const f of [SAVE_FILE, SAVE_FILE + '.bak']) {
    const s = validSave(readJson(f));
    if (s) return s;
  }
  return null;
}
function writeSave(payload) {
  const s = validSave(payload);
  if (!s) return false;
  if (s.data.length > 8 * 1024 * 1024) return false; // límite de seguridad
  try {
    fs.mkdirSync(SAVE_DIR, { recursive: true });
    const text = JSON.stringify({ format: 1, game: 'voidling', version: VERSION, t: s.t || Date.now(), data: s.data });
    const tmp = SAVE_FILE + '.tmp';
    fs.writeFileSync(tmp, text);
    // Copia de seguridad del guardado anterior (no la sincroniza Steam Cloud: no termina en .json)
    try { if (fs.existsSync(SAVE_FILE)) fs.copyFileSync(SAVE_FILE, SAVE_FILE + '.bak'); } catch (e) { /* no crítico */ }
    try { fs.renameSync(tmp, SAVE_FILE); } catch (e) { fs.writeFileSync(SAVE_FILE, text); try { fs.unlinkSync(tmp); } catch (e2) {} }
    return true;
  } catch (e) {
    console.error('[voidling] no se pudo escribir el guardado', e);
    return false;
  }
}

// ---------- Ventana ----------
let win = null;
let crashes = 0;
const winState = Object.assign({ fullscreen: true }, readJson(WINDOW_FILE) || {});
function saveWinState() {
  try {
    if (!win || win.isDestroyed()) return;
    winState.fullscreen = win.isFullScreen();
    if (!winState.fullscreen && !win.isMaximized()) winState.bounds = win.getBounds();
    fs.mkdirSync(USER_DATA, { recursive: true });
    fs.writeFileSync(WINDOW_FILE, JSON.stringify(winState));
  } catch (e) { /* no crítico */ }
}
function toggleFullscreen() {
  if (!win || win.isDestroyed()) return;
  win.setFullScreen(!win.isFullScreen());
}

function boundsOnScreen(b) {
  if (!b || !(b.width > 200) || !(b.height > 150)) return null;
  const area = screen.getDisplayMatching(b).workArea;
  const visible = b.x < area.x + area.width && b.x + b.width > area.x && b.y < area.y + area.height && b.y + b.height > area.y;
  return visible ? b : null;
}

function createWindow() {
  const icon = path.join(__dirname, process.platform === 'win32' ? 'icon.ico' : 'icon.png');
  const b = boundsOnScreen(winState.bounds) || { width: 1280, height: 800 };
  win = new BrowserWindow(Object.assign({}, b, {
    minWidth: 800, minHeight: 500,
    fullscreen: winState.fullscreen !== false,
    fullscreenable: true,
    backgroundColor: '#05030d',
    title: IS_DEMO ? 'Voidling Demo' : 'Voidling',
    icon: fs.existsSync(icon) ? icon : undefined,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false, // la partida se pausa sola al perder el foco; el menú/árbol sigue fluido
      spellcheck: false,
      devTools: DEV || process.env.VOIDLING_DEVTOOLS === '1',
    },
  }));
  win.removeMenu();
  win.once('ready-to-show', () => { win.show(); win.focus(); });
  // Título fijo (la página no lo cambia)
  win.on('page-title-updated', (e) => e.preventDefault());

  const wc = win.webContents;
  wc.setVisualZoomLevelLimits(1, 1).catch(() => {});

  // Teclas globales: F11 / Alt+Enter = pantalla completa; en desarrollo F12 = herramientas y Ctrl+R = recargar.
  wc.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11' || (input.key === 'Enter' && input.alt)) { e.preventDefault(); toggleFullscreen(); return; }
    if (input.key === 'F4' && input.alt) { e.preventDefault(); win.close(); return; }
    if (DEV && input.key === 'F12') { e.preventDefault(); wc.toggleDevTools(); return; }
    if (DEV && input.control && input.key.toLowerCase() === 'r') { e.preventDefault(); wc.reload(); }
  });

  // Seguridad: la ventana nunca navega fuera del juego; los enlaces https se abren en el navegador.
  wc.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//i.test(url)) shell.openExternal(url).catch(() => {});
    return { action: 'deny' };
  });
  wc.on('will-navigate', (e, url) => {
    if (url.split('#')[0] !== wc.getURL().split('#')[0]) {
      e.preventDefault();
      if (/^https:\/\//i.test(url)) shell.openExternal(url).catch(() => {});
    }
  });

  // Si el proceso de la página se cae, se recarga (máximo 3 veces); el guardado está en disco.
  wc.on('render-process-gone', (e, details) => {
    console.error('[voidling] render-process-gone', details && details.reason);
    if (details && details.reason !== 'clean-exit' && crashes++ < 3 && !win.isDestroyed()) wc.reload();
  });

  if (DEV || SMOKE) {
    wc.on('console-message', (...args) => {
      // Electron >= 35 entrega un objeto de evento con level/message; antes, argumentos sueltos.
      const ev = args[0] || {};
      const level = ev.level !== undefined ? ev.level : args[1];
      const message = ev.message !== undefined ? ev.message : args[2];
      smokeLog.push({ level, message: String(message) });
      log('[página]', level, message);
    });
  }

  win.on('enter-full-screen', saveWinState);
  win.on('leave-full-screen', saveWinState);
  win.on('close', saveWinState);
  win.on('closed', () => { win = null; });

  win.loadFile(INDEX).catch((e) => console.error('[voidling] no se pudo cargar', INDEX, e));
  if (SMOKE) runSmoke();
}

// ---------- IPC (puente con preload.js) ----------
function fromGame(e) {
  // Solo se aceptan mensajes de la página del juego (file://)
  try { return !!(e.senderFrame && /^file:/i.test(e.senderFrame.url)); } catch (err) { return false; }
}
ipcMain.on('voidling:info', (e) => {
  e.returnValue = {
    version: VERSION, steam: !!steam, steamDeck, appId: steam ? APP_ID : 0,
    dev: DEV, demo: IS_DEMO, savePath: SAVE_FILE, platform: process.platform, wine: WINE,
  };
});
ipcMain.on('voidling:save-read', (e) => { e.returnValue = fromGame(e) ? readSave() : null; });
ipcMain.on('voidling:save-write-sync', (e, payload) => { e.returnValue = fromGame(e) ? writeSave(payload) : false; });
ipcMain.handle('voidling:save-write', (e, payload) => (fromGame(e) ? writeSave(payload) : false));
ipcMain.handle('voidling:achievement', (e, id) => {
  if (!fromGame(e) || !steam || typeof id !== 'string' || !/^[A-Za-z0-9_]{1,64}$/.test(id)) return false;
  try {
    if (steam.achievement.isActivated(id)) return true;
    const ok = steam.achievement.activate(id);
    try { steam.stats.store(); } catch (err) { /* activate ya guarda en la mayoría de versiones */ }
    log('logro', id, ok ? 'desbloqueado' : 'NO existe en Steamworks');
    return !!ok;
  } catch (err) { log('error de logro', id, err.message); return false; }
});
ipcMain.handle('voidling:open-store', async (e) => {
  if (!fromGame(e)) return false;
  const url = `https://store.steampowered.com/app/${STORE_APP_ID}/`;
  // Steam Deck: el overlay es lo más cómodo en modo juego. Windows: el cliente de Steam (steam://).
  if (steam && steamDeck) {
    try { steam.overlay.activateToStore(STORE_APP_ID, 0); return 'overlay'; } catch (err) { /* sigue */ }
  }
  if (steam) {
    try { await shell.openExternal(`steam://store/${STORE_APP_ID}`); return 'steam'; } catch (err) { /* sigue */ }
  }
  try { await shell.openExternal(url); return 'browser'; } catch (err) { return false; }
});
ipcMain.on('voidling:toggle-fullscreen', (e) => { if (fromGame(e)) toggleFullscreen(); });
ipcMain.on('voidling:quit', (e) => { if (fromGame(e)) app.quit(); });

// ---------- Prueba automática (VOIDLING_SMOKE) ----------
const smokeLog = [];
function runSmoke() {
  const wc = win.webContents;
  const finish = (result) => {
    try { fs.writeFileSync(SMOKE, JSON.stringify(result, null, 2)); } catch (e) { console.error(e); }
    app.exit(result.ok ? 0 : 1);
  };
  const timeout = setTimeout(() => finish({ ok: false, error: 'timeout', console: smokeLog }), 30000);
  wc.once('did-finish-load', () => {
    setTimeout(async () => {
      try {
        const page = await wc.executeJavaScript(`(function(){
          var V = window.V || {};
          var before = V.Save && V.Save.data ? V.Save.data.runs : null;
          if (V.Save && V.Save.save) V.Save.save();
          return {
            hasV: !!window.V, state: V.game && V.game.state, config: V.CONFIG,
            platform: V.Platform && { name: V.Platform.name, isDesktop: V.Platform.isDesktop, isSteam: V.Platform.isSteam,
              isSteamDeck: V.Platform.isSteamDeck, canOpenStore: V.Platform.canOpenStore,
              api: ['init','gameplayStart','gameplayStop','loadingStop','midgameAd','rewardedAd','openStore','unlockAchievement']
                .filter(function(k){ return typeof V.Platform[k] !== 'function'; }) },
            bridge: !!window.voidlingDesktop, info: window.voidlingDesktop && window.voidlingDesktop.info,
            runs: before, matter: V.Save && V.Save.data ? V.Save.data.matter : null, w: innerWidth, h: innerHeight
          };
        })()`);
        await new Promise((r) => setTimeout(r, 900)); // espera la escritura agrupada (400 ms)
        const file = readSave();
        const errors = smokeLog.filter((m) => m.level === 3 || m.level === 'error');
        try { fs.writeFileSync(SMOKE.replace(/\.json$/i, '') + '.png', (await wc.capturePage()).toPNG()); } catch (e) { /* captura opcional */ }
        finish({
          ok: !!(page.hasV && page.bridge && page.platform && page.platform.api.length === 0 && file && errors.length === 0),
          index: INDEX, appId: APP_ID, steam: !!steam, fullscreen: win.isFullScreen(), page,
          saveFile: SAVE_FILE, saveFileOk: !!file, errors, console: smokeLog,
        });
      } catch (e) { finish({ ok: false, error: String(e && e.stack || e), console: smokeLog }); }
      finally { clearTimeout(timeout); }
    }, 2500);
  });
}

// ---------- Ciclo de vida ----------
if (!SMOKE && !app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });
  Menu.setApplicationMenu(null);
  app.whenReady().then(createWindow);
  app.on('window-all-closed', () => app.quit());
  app.on('activate', () => { if (!win) createWindow(); });
}
