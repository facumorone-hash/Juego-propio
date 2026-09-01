import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class City {
  constructor(scene) {
    this.scene = scene;
    this.buildings = [];
    this.trees = [];
    this.map = [];
    this.WORLD_SIZE = CONFIG.worldSize;
    this.BLOCK = CONFIG.blockSize;
    this.HALF = (this.WORLD_SIZE * this.BLOCK) / 2;

    this.generateMap();
    this.build();
  }

  generateMap() {
    for (let z = 0; z < this.WORLD_SIZE; z++) {
      this.map[z] = [];
      for (let x = 0; x < this.WORLD_SIZE; x++) {
        // Calles cada 5 bloques
        if (x % 5 === 0 || z % 5 === 0) {
          this.map[z][x] = 0; // calle
        } else {
          this.map[z][x] = 1; // edificio
        }
      }
    }
    // Parque central
    for (let z = 19; z <= 21; z++) {
      for (let x = 19; x <= 21; x++) {
        this.map[z][x] = 2;
      }
    }
  }

  build() {
    const matRoad = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.9 });
    const matGrass = new THREE.MeshStandardMaterial({ color: 0x3a7a4a, roughness: 0.8 });
    const matBuilding = new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.6, metalness: 0.2 });
    const matRoof = new THREE.MeshStandardMaterial({ color: 0x555566 });

    for (let z = 0; z < this.WORLD_SIZE; z++) {
      for (let x = 0; x < this.WORLD_SIZE; x++) {
        const cx = x * this.BLOCK - this.HALF;
        const cz = z * this.BLOCK - this.HALF;
        const type = this.map[z][x];

        // Suelo
        const ground = new THREE.Mesh(
          new THREE.BoxGeometry(this.BLOCK, 0.4, this.BLOCK),
          type === 0 ? matRoad : (type === 2 ? matGrass : matBuilding)
        );
        ground.position.set(cx, -0.2, cz);
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Edificios
        if (type === 1) {
          const h = 2 + Math.random() * 7;
          const build = new THREE.Mesh(
            new THREE.BoxGeometry(this.BLOCK * 0.85, h, this.BLOCK * 0.85),
            matBuilding
          );
          build.position.set(cx, h / 2 - 0.2, cz);
          build.castShadow = true;
          build.receiveShadow = true;
          this.scene.add(build);
          this.buildings.push(build);

          const roof = new THREE.Mesh(
            new THREE.BoxGeometry(this.BLOCK * 0.9, 0.15, this.BLOCK * 0.9),
            matRoof
          );
          roof.position.set(cx, h - 0.2, cz);
          roof.castShadow = true;
          this.scene.add(roof);
        }
      }
    }

    // Árboles
    const matTrunk = new THREE.MeshStandardMaterial({ color: 0x8B5A2B });
    const matLeaf = new THREE.MeshStandardMaterial({ color: 0x2E8B57 });
    for (let i = 0; i < 80; i++) {
      let x, z, valid;
      for (let t = 0; t < 20; t++) {
        const ix = Math.floor(Math.random() * this.WORLD_SIZE);
        const iz = Math.floor(Math.random() * this.WORLD_SIZE);
        if (this.map[iz] && (this.map[iz][ix] === 0 || this.map[iz][ix] === 2)) {
          x = ix * this.BLOCK - this.HALF + (Math.random() - 0.5) * 3;
          z = iz * this.BLOCK - this.HALF + (Math.random() - 0.5) * 3;
          valid = true;
          break;
        }
      }
      if (valid) {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.5), matTrunk);
        trunk.position.set(x, 0.5, z);
        trunk.castShadow = true;
        this.scene.add(trunk);

        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 6), matLeaf);
        leaf.position.set(x, 1.5, z);
        leaf.castShadow = true;
        this.scene.add(leaf);
        this.trees.push(leaf);
      }
    }
  }

  getMap() {
    return this.map;
  }

  getBlock(x, z) {
    const ix = Math.floor((x + this.HALF) / this.BLOCK);
    const iz = Math.floor((z + this.HALF) / this.BLOCK);
    if (ix < 0 || ix >= this.WORLD_SIZE || iz < 0 || iz >= this.WORLD_SIZE) return 1;
    return this.map[iz][ix];
  }
}