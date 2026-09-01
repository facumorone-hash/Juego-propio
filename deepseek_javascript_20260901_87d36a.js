import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class Player {
  constructor(scene, physics) {
    this.scene = scene;
    this.physics = physics;
    this.health = 100;
    this.maxHealth = 100;
    this.money = 1000;
    this.wanted = 0;
    this.weapon = 'pistol';
    this.ammo = { pistol: 30, rifle: 20, shotgun: 15 };
    this.inVehicle = null;
    
    this.speed = CONFIG.player.speed;
    this.jumpForce = CONFIG.player.jumpForce;
    this.radius = CONFIG.player.radius;
    
    this.x = 0;
    this.z = 0;
    this.y = 0;
    this.angle = 0;
    this.velocity = new THREE.Vector3();
    this.isGrounded = false;

    // Crear mesh
    this.mesh = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(this.radius, this.radius, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x33ccff, emissive: 0x004466 })
    );
    body.position.y = 0.6;
    body.castShadow = true;
    this.mesh.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffcc99 })
    );
    head.position.y = 1.4;
    head.castShadow = true;
    this.mesh.add(head);

    this.gun = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    this.gun.position.set(0.4, 0.3, 0.6);
    this.mesh.add(this.gun);

    this.scene.add(this.mesh);
    this.mesh.position.set(0, 0, 0);

    // Physics body
    this.body = this.physics.createSphere(this.radius, { x: 0, y: 0, z: 0 }, 1);
    this.body.fixedRotation = true;
  }

  update(delta, controls) {
    // Movimiento
    let forward = 0, right = 0;
    if (controls.keys['w']) forward = 1;
    if (controls.keys['s']) forward = -1;
    if (controls.keys['a']) right = -1;
    if (controls.keys['d']) right = 1;

    if (controls.isLocked) {
      this.angle -= controls.mouseX * 0.002;
    }

    const sin = Math.sin(this.angle);
    const cos = Math.cos(this.angle);
    const moveX = (forward * sin + right * cos) * this.speed * delta;
    const moveZ = (forward * cos - right * sin) * this.speed * delta;

    // Saltar
    if (controls.keys[' '] && this.isGrounded) {
      this.body.velocity.y = this.jumpForce;
      this.isGrounded = false;
    }

    // Aplicar movimiento (en física)
    this.body.position.x += moveX;
    this.body.position.z += moveZ;

    // Sincronizar mesh
    this.x = this.body.position.x;
    this.z = this.body.position.z;
    this.y = this.body.position.y;
    this.mesh.position.set(this.x, this.y, this.z);
    this.mesh.rotation.y = this.angle;

    // Verificar suelo
    this.isGrounded = Math.abs(this.body.velocity.y) < 0.1 && this.y <= 0.5;
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health < 0) this.health = 0;
    if (this.health === 0) {
      this.respawn();
    }
  }

  respawn() {
    this.health = this.maxHealth;
    this.money = Math.max(0, this.money - 100);
    this.x = 0;
    this.z = 0;
    this.body.position.set(0, 0, 0);
    this.mesh.position.set(0, 0, 0);
  }

  getPosition() {
    return { x: this.x, y: this.y, z: this.z };
  }
}