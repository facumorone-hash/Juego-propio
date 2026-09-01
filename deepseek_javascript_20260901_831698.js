export const CONFIG = {
  worldSize: 40,      // 40x40 bloques
  blockSize: 10,
  player: {
    speed: 5,
    jumpForce: 6,
    radius: 0.6,
  },
  camera: {
    distance: 12,
    height: 7,
    smoothness: 0.06,
  },
  physics: {
    gravity: -20,
  },
  weapons: {
    pistol: { damage: 15, range: 50, fireRate: 0.2, ammo: 30 },
    rifle: { damage: 25, range: 80, fireRate: 0.1, ammo: 20 },
    shotgun: { damage: 20, range: 30, fireRate: 0.5, ammo: 15 },
  },
};