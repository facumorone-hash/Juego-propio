// Genera el icono de la aplicación (desktop/icon.png 256x256 y desktop/icon.ico multi-tamaño) sin dependencias.
// Dibujo procedural: agujero negro con disco de acreción naranja-violeta (colores del logo).
// Uso: node desktop/make-icon.js   — si el equipo de arte entrega un icono definitivo, basta con reemplazar
// icon.png / icon.ico por los suyos (el .ico debe incluir al menos 16, 32, 48 y 256 px).
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  if (zlib.crc32) return zlib.crc32(buf) >>> 0;
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function png(size, rgba) {
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0; // 8 bits, RGBA
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filtro "none"
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}

const clamp = (v) => Math.max(0, Math.min(1, v));
const mix = (a, b, t) => a + (b - a) * t;

// Color (premultiplicado) de un punto en coordenadas normalizadas [-1, 1].
function sample(x, y) {
  const r = Math.hypot(x, y);
  // Fondo: círculo violeta muy oscuro (el icono es redondo, con transparencia fuera)
  const bgA = clamp((0.98 - r) * 60);
  let cr = 0.035, cg = 0.02, cb = 0.09;
  // Halo violeta
  const halo = Math.exp(-Math.pow((r - 0.62) / 0.28, 2)) * 0.55;
  cr += 0.45 * halo; cg += 0.22 * halo; cb += 0.95 * halo;
  // Disco de acreción inclinado (elipse) en naranja, más brillante abajo
  const ey = y / 0.42, ex = x;
  const er = Math.hypot(ex, ey);
  const ring = Math.exp(-Math.pow((er - 0.72) / 0.13, 2));
  const bright = 0.75 + 0.5 * clamp(y + 0.5);
  cr += 1.0 * ring * bright; cg += 0.55 * ring * bright; cb += 0.18 * ring * bright;
  // Anillo de fotones (borde del horizonte)
  const photon = Math.exp(-Math.pow((r - 0.36) / 0.035, 2));
  cr += 1.0 * photon; cg += 0.85 * photon; cb += 0.7 * photon;
  // Horizonte de sucesos: negro (tapa el disco por delante solo en la mitad superior para dar volumen)
  const hole = clamp((0.34 - r) * 40);
  const front = y > 0.05 && Math.abs(ey) < 1 ? ring * 0.9 : 0; // el disco pasa por delante en la parte inferior
  const k = hole * (1 - front);
  cr = mix(cr, 0, k); cg = mix(cg, 0, k); cb = mix(cb, 0, k);
  return [clamp(cr) * bgA, clamp(cg) * bgA, clamp(cb) * bgA, bgA];
}

function render(size) {
  const ss = 4; // supermuestreo para bordes suaves
  const buf = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < ss; sy++) for (let sx = 0; sx < ss; sx++) {
        const x = ((px + (sx + 0.5) / ss) / size) * 2 - 1;
        const y = ((py + (sy + 0.5) / ss) / size) * 2 - 1;
        const c = sample(x, y);
        r += c[0]; g += c[1]; b += c[2]; a += c[3];
      }
      const n = ss * ss; a /= n;
      const i = (py * size + px) * 4;
      // des-premultiplicar
      buf[i] = a > 0 ? Math.round(clamp(r / n / a) * 255) : 0;
      buf[i + 1] = a > 0 ? Math.round(clamp(g / n / a) * 255) : 0;
      buf[i + 2] = a > 0 ? Math.round(clamp(b / n / a) * 255) : 0;
      buf[i + 3] = Math.round(a * 255);
    }
  }
  return png(size, buf);
}

function ico(images) { // images: [{size, data(PNG)}]
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + dir.length;
  images.forEach((im, i) => {
    const o = i * 16;
    dir[o] = im.size >= 256 ? 0 : im.size; dir[o + 1] = im.size >= 256 ? 0 : im.size;
    dir[o + 2] = 0; dir[o + 3] = 0;
    dir.writeUInt16LE(1, o + 4); dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(im.data.length, o + 8); dir.writeUInt32LE(offset, o + 12);
    offset += im.data.length;
  });
  return Buffer.concat([header, dir, ...images.map((im) => im.data)]);
}

const sizes = [16, 24, 32, 48, 64, 128, 256];
const imgs = sizes.map((s) => ({ size: s, data: render(s) }));
fs.writeFileSync(path.join(__dirname, 'icon.png'), imgs[imgs.length - 1].data);
fs.writeFileSync(path.join(__dirname, 'icon.ico'), ico(imgs));
console.log('Icono generado: desktop/icon.png y desktop/icon.ico (' + sizes.join(', ') + ' px)');
