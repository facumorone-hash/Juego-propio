import * as THREE from 'three';
import { CONFIG } from './config.js';
import { City } from './scenes/City.js';
import { Physics } from './systems/Physics.js';
import { Controls } from './systems/Controls.js';
import { Player } from './components/Player.js';
import { TimeSystem } from './systems/TimeSystem.js';

// Escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 150, 300);

// Cámara
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialiasing: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.prepend(renderer.domElement);

// Luces
const ambient = new THREE.AmbientLight(0x404060, 0.4);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffeedd, 1.2);
sun.position.set(60, 120, 40);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
const d = 120;
sun.shadow.camera.left = -d;
sun.shadow.camera.right = d;
sun.shadow.camera.top = d;
sun.shadow.camera.bottom = -d;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 250;
scene.add(sun);

const hemi = new THREE.HemisphereLight(0x87CEEB, 0x3a7a4a, 0.3);
scene.add(hemi);

// Ciudad
const city = new City(scene);

// Física
const physics = new Physics();
physics.createPlane({ x: 0, y: 0, z: 0 });

// Controles
const controls = new Controls(renderer.domElement);

// Jugador
const player = new Player(scene, physics);

// Sistema de Día/Noche
const timeSystem = new TimeSystem(scene, sun, ambient);

// HUD
const healthDisplay = document.getElementById('healthDisplay');
const healthFill = document.getElementById('healthFill');
const moneyDisplay = document.getElementById('moneyDisplay');
const weaponDisplay = document.getElementById('weaponDisplay');
const wantedDisplay = document.getElementById('wantedDisplay');
const missionDisplay = document.getElementById('missionDisplay');
const timeDisplay = document.getElementById('timeDisplay');

// Bucle principal
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);

  // Actualizar física
  physics.update();

  // Actualizar jugador
  player.update(delta, controls);

  // Actualizar Día/Noche
  const time = timeSystem.update(delta);
  timeDisplay.textContent = `🌞 ${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;

  // Cámara
  const targetPos = new THREE.Vector3(player.x, player.y + 1.5, player.z);
  const off = new THREE.Vector3(0, CONFIG.camera.height, -CONFIG.camera.distance);
  const a = player.angle;
  const rotOff = new THREE.Vector3(
    off.x * Math.cos(a) - off.z * Math.sin(a),
    off.y,
    off.x * Math.sin(a) + off.z * Math.cos(a)
  );
  const desired = targetPos.clone().add(rotOff);
  camera.position.lerp(desired, CONFIG.camera.smoothness);
  camera.lookAt(targetPos);

  // HUD
  healthDisplay.textContent = Math.round(player.health);
  healthFill.style.width = (player.health / player.maxHealth * 100) + '%';
  moneyDisplay.textContent = player.money;
  weaponDisplay.textContent = player.weapon;
  wantedDisplay.textContent = player.wanted;
  missionDisplay.textContent = 'Sin misión';

  // Render
  renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log('🚗 GTA VI - Proyecto Base iniciado!');
console.log('📋 Controles: WASD moverse, Espacio saltar, E entrar coche');