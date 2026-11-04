// Preload de Electron: puente mínimo y seguro entre el juego (página web) y el proceso principal.
// Se ejecuta con contextIsolation + sandbox: solo se expone window.voidlingDesktop, nunca Node.
// js/platform.js detecta el escritorio por la existencia de window.voidlingDesktop.
'use strict';
const { contextBridge, ipcRenderer } = require('electron');

let info = {};
try { info = ipcRenderer.sendSync('voidling:info') || {}; } catch (e) { info = {}; }

contextBridge.exposeInMainWorld('voidlingDesktop', {
  // { version, steam, steamDeck, appId, dev, demo, savePath, platform }
  info: Object.freeze(Object.assign({}, info)),

  // Lee el guardado espejo (SÍNCRONO, para poder restaurarlo antes de que main.js cargue el guardado).
  // Devuelve { t: <ms>, data: "<JSON>" } o null si no hay archivo válido.
  saveRead() {
    try { return ipcRenderer.sendSync('voidling:save-read'); } catch (e) { return null; }
  },

  // Escribe el guardado espejo en <userData>/save/voidling_save.json (Steam Auto-Cloud).
  // data: texto JSON tal cual está en localStorage; t: marca de tiempo en ms.
  // sync=true bloquea hasta escribir (se usa al cerrar la ventana); si no, devuelve una Promise.
  saveWrite(data, t, sync) {
    const payload = { data: String(data), t: Number(t) || Date.now() };
    if (sync) {
      try { return ipcRenderer.sendSync('voidling:save-write-sync', payload); } catch (e) { return false; }
    }
    return ipcRenderer.invoke('voidling:save-write', payload);
  },

  // Desbloquea un logro de Steam (ID tal cual está configurado en Steamworks, p. ej. ACH_FIRST_RUN).
  unlockAchievement(id) { return ipcRenderer.invoke('voidling:achievement', String(id)); },

  // Abre la página de la tienda de Voidling (overlay de Steam, cliente de Steam o navegador).
  openStore() { return ipcRenderer.invoke('voidling:open-store'); },

  // Alterna pantalla completa (igual que F11) y cierra el juego limpiamente.
  toggleFullscreen() { ipcRenderer.send('voidling:toggle-fullscreen'); },
  quit() { ipcRenderer.send('voidling:quit'); },
});
