// Capa de plataforma: la misma base de código sirve para Steam (escritorio, sin anuncios) y portales web
// (CrazyGames con anuncios; itch.io / galaxy.click sin anuncios).
// - Web/CrazyGames: si index.html incluye el SDK v3 de CrazyGames, se activan los anuncios; si no, todo es no-op.
// - Escritorio (Electron, ver desktop/preload.js): existe window.voidlingDesktop. Se usa para:
//     · reflejar el guardado en un archivo JSON (Steam Auto-Cloud) y restaurarlo al arrancar,
//     · desbloquear logros de Steam (evento 'ach:unlock' del bus),
//     · abrir la página de la tienda.
// Sin window.voidlingDesktop el juego funciona exactamente igual que antes.
// IMPORTANTE: este script carga ANTES que main.js; la restauración del guardado ocurre aquí, de forma
// síncrona, para que V.Save.load() (en main.js) ya lea el localStorage restaurado.
(function () {
  const V = window.V;
  const CFG = V.CONFIG || {};
  const D = (typeof window.voidlingDesktop === 'object' && window.voidlingDesktop) || null;
  const SAVE_KEY_DEFAULT = 'voidling_save_v1'; // misma clave que js/save.js
  const STAMP_KEY = 'voidling_save_stamp'; // marca de tiempo (ms) del último guardado local
  const saveKey = () => (V.Save && V.Save.KEY) || SAVE_KEY_DEFAULT;

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }

  // ---------- Guardado espejo en archivo (solo escritorio) ----------
  // Formato del archivo (lo escribe desktop/main.js): { t: <ms>, data: "<JSON del guardado tal cual en localStorage>" }
  function desktopPayload() {
    let data = lsGet(saveKey());
    if (!data && V.Save && V.Save.data) { try { data = JSON.stringify(V.Save.data); } catch (e) { data = null; } }
    return data;
  }

  function restoreFromFile() {
    if (!D || typeof D.saveRead !== 'function') return;
    try {
      const file = D.saveRead(); // síncrono: { t, data } | null
      const local = lsGet(saveKey());
      const localT = +lsGet(STAMP_KEY) || 0;
      const fileOk = file && typeof file.data === 'string' && file.data.length > 2 && isJson(file.data);
      if (fileOk && (!local || (+file.t || 0) > localT)) {
        // El archivo es más nuevo (p. ej. Steam Cloud lo bajó de otro PC) o no hay guardado local: restaurar.
        lsSet(saveKey(), file.data);
        lsSet(STAMP_KEY, String(+file.t || Date.now()));
      } else if (local && (!fileOk || localT > (+file.t || 0))) {
        // El guardado local es más nuevo que el archivo (o no hay archivo): sincronizar hacia el archivo.
        const t = localT || Date.now();
        lsSet(STAMP_KEY, String(t));
        D.saveWrite(local, t, false);
      }
    } catch (e) { console.warn('[platform] no se pudo restaurar el guardado de escritorio', e); }
  }

  function isJson(s) { try { JSON.parse(s); return true; } catch (e) { return false; } }

  let pendingWrite = null;
  function flushSave(sync) {
    if (!pendingWrite) return;
    clearTimeout(pendingWrite.timer);
    const t = pendingWrite.t;
    pendingWrite = null;
    const data = desktopPayload();
    if (!data) return;
    try {
      const r = D.saveWrite(data, t, !!sync);
      if (r && typeof r.catch === 'function') r.catch((e) => console.warn('[platform] fallo al escribir el guardado', e));
    } catch (e) { console.warn('[platform] fallo al escribir el guardado', e); }
  }

  function hookSave() {
    if (!D || typeof D.saveWrite !== 'function' || !V.Save || typeof V.Save.save !== 'function') return;
    const original = V.Save.save;
    // Envolvemos V.Save.save sin tocar save.js: tras escribir en localStorage, se programa la copia al archivo.
    // Se agrupan los guardados seguidos (sliders de volumen, etc.) en una sola escritura.
    V.Save.save = function () {
      const r = original.apply(this, arguments);
      const t = Date.now();
      lsSet(STAMP_KEY, String(t));
      if (pendingWrite) clearTimeout(pendingWrite.timer);
      pendingWrite = { t, timer: setTimeout(() => flushSave(false), 400) };
      return r;
    };
    // Al cerrar la ventana, escritura síncrona para no perder el último guardado.
    window.addEventListener('pagehide', () => flushSave(true));
    window.addEventListener('beforeunload', () => flushSave(true));
  }

  if (D) { restoreFromFile(); hookSave(); }

  // ---------- API de plataforma ----------
  const info = (D && D.info) || {};
  const P = {
    name: D ? 'desktop' : 'standalone', // 'standalone' | 'crazygames' | 'desktop'
    sdk: null,
    hasRewarded: false,
    isDesktop: !!D,
    isSteam: !!(D && info.steam), // true si el cliente de Steam respondió (Steamworks iniciado)
    isSteamDeck: !!(D && info.steamDeck),
    // En CrazyGames no se permiten enlaces a otras tiendas: allí openStore() no hace nada.
    // Mientras storeUrl sea el placeholder (/app/000000/) no se muestra el botón de tienda.
    canOpenStore: !!D || (CFG.build !== 'crazygames' && !!CFG.storeUrl && !/\/app\/0+\//.test(CFG.storeUrl)),

    async init() {
      if (D) return; // Escritorio (Steam): nunca hay anuncios ni SDK web.
      try {
        if (window.CrazyGames && window.CrazyGames.SDK) {
          this.sdk = window.CrazyGames.SDK;
          await this.sdk.init();
          this.name = 'crazygames';
          this.hasRewarded = true;
          this.canOpenStore = false;
        }
      } catch (e) { console.warn('SDK de plataforma no disponible', e); this.sdk = null; }
    },
    gameplayStart() { try { this.sdk && this.sdk.game.gameplayStart(); } catch (e) {} },
    gameplayStop() { try { this.sdk && this.sdk.game.gameplayStop(); } catch (e) {} },
    loadingStop() { try { this.sdk && this.sdk.game.loadingStop && this.sdk.game.loadingStop(); } catch (e) {} },
    _ad(type, ok, fail) {
      if (!this.sdk) { fail && fail(); return; }
      try {
        this.sdk.ad.requestAd(type, {
          adStarted: () => V.Audio.mute(true),
          adFinished: () => { V.Audio.mute(false); ok && ok(); },
          adError: () => { V.Audio.mute(false); fail && fail(); },
        });
      } catch (e) { V.Audio.mute(false); fail && fail(); }
    },
    midgameAd(done) { if (!this.sdk) return done(); this._ad('midgame', done, done); },
    rewardedAd(ok, fail) { this._ad('rewarded', ok, fail); },

    // Abre la página de Voidling en la tienda de Steam. Devuelve true si se intentó abrir.
    openStore() {
      try {
        if (D && typeof D.openStore === 'function') { const r = D.openStore(); r && r.catch && r.catch(() => {}); return true; }
        if (!this.canOpenStore) return false;
        const w = window.open(CFG.storeUrl, '_blank', 'noopener');
        if (w) try { w.opener = null; } catch (e) {}
        return true;
      } catch (e) { console.warn('[platform] openStore', e); return false; }
    },

    // Desbloquea un logro de Steam (IDs ACH_* de V.ACHIEVEMENTS). Sin Steam no hace nada.
    unlockAchievement(id) {
      if (!D || typeof D.unlockAchievement !== 'function') return false;
      if (typeof id !== 'string' || !/^[A-Za-z0-9_]{1,64}$/.test(id)) return false;
      try { const r = D.unlockAchievement(id); r && r.catch && r.catch(() => {}); return true; } catch (e) { return false; }
    },

    // Solo escritorio: alternar pantalla completa (F11 también lo hace) y salir del juego.
    toggleFullscreen() { if (D && D.toggleFullscreen) { D.toggleFullscreen(); return true; } return false; },
    quit() { if (D && D.quit) { flushSave(true); D.quit(); return true; } return false; },
  };
  V.Platform = P;

  // ---------- Logros ----------
  if (D && V.bus && typeof V.bus.on === 'function') {
    V.bus.on('ach:unlock', (e) => P.unlockAchievement(e && e.id));
    // Al arrancar, re-sincroniza los logros ya ganados (p. ej. conseguidos mientras Steam no estaba abierto).
    // Steam ignora los que ya estén desbloqueados. Se aceptan varios formatos posibles del guardado.
    V.bus.on('boot', () => {
      try {
        const s = (V.game && V.game.save) || (V.Save && V.Save.data) || {};
        const a = s.achievements || s.ach || null;
        let ids = [];
        if (Array.isArray(a)) ids = a;
        else if (a && typeof a === 'object') ids = Object.keys(a).filter((k) => a[k]);
        ids.forEach((id) => P.unlockAchievement(id));
      } catch (e) { /* sin logros que sincronizar */ }
    });
  }
})();
