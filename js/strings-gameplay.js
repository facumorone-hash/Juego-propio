// Textos de enemigos/jefe — propiedad del agente de gameplay. Usa V.addStrings({ es: {...}, en: {...} }).
// Se carga antes de upgrades.js y run.js. En Node (simulador) no existe V.addStrings: todo va protegido.
(function () {
  const V = globalThis.V;
  if (!V) return;

  if (V.addStrings) {
    V.addStrings({
      es: {
        // Jefe final
        bossName: 'Núcleo galáctico',
        bossIntro: 'EL NÚCLEO DESPIERTA',
        bossIntroSub: 'Rómpelo con tu marea, tus lunas y tu pulso.',
        bossP2: 'Marea inversa',
        bossP3: 'Colapso',
        bossP2Sub: 'Invierte su gravedad: atento al anillo dorado.',
        bossP3Sub: 'Brazos de estrellas: gira en su mismo sentido.',
        bossDefeat: 'NÚCLEO ROTO',
        // Peligros
        pulsarWarn: 'PÚLSAR',
        pulsarSub: 'Sus anillos tienen dos huecos. Rómpelo y suelta mucha materia.',
        swarmWarn: 'ENJAMBRE DE CUSTODIOS',
        swarmSub: 'Te rodean y embisten: sal de las líneas magenta o usa el pulso.',
      },
      en: {
        bossName: 'Galactic Core',
        bossIntro: 'THE CORE AWAKENS',
        bossIntroSub: 'Break it with your tide, your moons and your pulse.',
        bossP2: 'Inverse Tide',
        bossP3: 'Collapse',
        bossP2Sub: 'It reverses its gravity: watch the golden ring.',
        bossP3Sub: 'Arms of stars: circle in the same direction.',
        bossDefeat: 'CORE BROKEN',
        pulsarWarn: 'PULSAR',
        pulsarSub: 'Its rings have two gaps. Break it for a lot of matter.',
        swarmWarn: 'CUSTODIAN SWARM',
        swarmSub: 'They surround you and charge: leave the magenta lines or pulse.',
      },
    });
  }

  // Nodos nuevos del árbol (upgrades.js): g9, s9, t8.
  // V.addNodeText lo define i18n.js; upgrades.js se carga después, pero los textos se registran por id.
  if (V.addNodeText) {
    V.addNodeText('g9', 'Cosecha exótica', 'Cada Custodio que destruyes suelta materia y +2 de estabilidad por nivel.',
      'Exotic Harvest', 'Each Custodian you destroy drops matter and +2 stability per level.');
    V.addNodeText('s9', 'Cáscara de neutrones', 'Los anillos de los púlsares te quitan menos estabilidad.',
      'Neutron Shell', 'Pulsar rings drain less of your stability.');
    V.addNodeText('t8', 'Rompenúcleos', 'Más daño a púlsares y al Núcleo galáctico.',
      'Corebreaker', 'More damage to pulsars and to the Galactic Core.');
  }
})();
