// Configuración de build. tools/build.js reescribe este archivo en cada COPIA de dist/<destino>/
// (cambia build, demo y buildDate; conserva el resto de claves). El original queda en modo 'dev'.
(function () {
  const V = (globalThis.V = globalThis.V || {});
  V.CONFIG = {
    version: '1.0.0', // mantener igual que "version" en package.json (build.js avisa si difieren)
    build: 'dev', // dev | web | crazygames | demo | steam
    demo: false, // true en la demo de Steam Next Fest
    demoMaxMilestone: 2, // la demo termina al alcanzar esta escala
    // Página de la tienda de Steam para el botón "Ver en Steam" en las versiones web.
    // PLACEHOLDER: reemplazar 000000 por el AppID real cuando Valve lo asigne.
    storeUrl: 'https://store.steampowered.com/app/000000/Voidling/',
    buildDate: null, // la rellena build.js (ISO 8601)
  };
})();
