export function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

export function dist(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function angle(a, b) {
  return Math.atan2(b.z - a.z, b.x - a.x);
}

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}