import * as CANNON from 'cannon-es';
import { CONFIG } from '../config.js';

export class Physics {
  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, CONFIG.physics.gravity, 0);
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
    
    this.bodies = [];
  }

  createBody(shape, position, mass = 1) {
    const body = new CANNON.Body({ mass });
    body.addShape(shape);
    body.position.set(position.x, position.y, position.z);
    this.world.addBody(body);
    this.bodies.push(body);
    return body;
  }

  createSphere(radius, position, mass = 1) {
    const shape = new CANNON.Sphere(radius);
    return this.createBody(shape, position, mass);
  }

  createBox(width, height, depth, position, mass = 1) {
    const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
    return this.createBody(shape, position, mass);
  }

  createPlane(position, normal = new CANNON.Vec3(0, 1, 0)) {
    const body = new CANNON.Body({ mass: 0 });
    const shape = new CANNON.Plane();
    body.addShape(shape);
    body.quaternion.setFromUnitVectors(new CANNON.Vec3(0, 1, 0), normal);
    body.position.set(position.x, position.y, position.z);
    this.world.addBody(body);
    return body;
  }

  update() {
    this.world.step(1 / 60);
  }

  syncBody(mesh, body) {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  }

  applyForce(body, force, point = null) {
    if (point) {
      body.applyForce(force, point);
    } else {
      body.applyForce(force, body.position);
    }
  }
}