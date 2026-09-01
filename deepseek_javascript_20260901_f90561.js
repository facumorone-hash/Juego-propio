import * as THREE from 'three';

export class TimeSystem {
  constructor(scene, sunLight, ambientLight) {
    this.scene = scene;
    this.sunLight = sunLight;
    this.ambientLight = ambientLight;
    this.timeOfDay = 0; // 0 a 2PI
    this.speed = 0.0005;
  }

  update(delta) {
    this.timeOfDay += this.speed * delta * 60;
    if (this.timeOfDay > Math.PI * 2) this.timeOfDay -= Math.PI * 2;

    const brightness = (Math.sin(this.timeOfDay) + 1) / 2; // 0 a 1
    const intensity = 0.3 + brightness * 0.9;

    this.sunLight.intensity = intensity;

    const r = 0.2 + brightness * 0.5;
    const g = 0.2 + brightness * 0.6;
    const b = 0.3 + brightness * 0.7;
    this.scene.background.setRGB(r, g, b);

    this.ambientLight.intensity = 0.2 + brightness * 0.4;

    const hours = Math.floor(6 + brightness * 12);
    const mins = Math.floor((brightness * 12 % 1) * 60);
    return {
      hour: hours,
      minute: mins,
      brightness
    };
  }
}