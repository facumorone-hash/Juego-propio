#!/usr/bin/env node
// Build de Voidling para cada destino. Sin dependencias (solo Node >= 18).
//
//   node tools/build.js <web|crazygames|demo|steam|all|check>
//
// Para cada destino:
//   1. Copia el juego (index.html, js/ y carpetas de recursos si existen) a dist/<destino>/.
//      Nunca copia docs/, tools/, desktop/, marketing/, node_modules/, dist/ ni out/.
//   2. Reescribe dist/<destino>/js/config.js con build, demo, version y buildDate (el original no se toca).
//   3. crazygames: descomenta en la COPIA de index.html el <script> del SDK v3 de CrazyGames.
//   4. Valida que todos los <script src> activos del index existan, que cada JS compile y que V.CONFIG sea correcto.
//   5. Genera dist/voidling-<destino>-<version>.zip (index.html en la raíz del zip).
// 'check' valida el index.html del proyecto (modo desarrollo) sin generar nada.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const TARGETS = {
  web: { build: 'web', demo: false, zip: true }, // itch.io / galaxy.click
  crazygames: { build: 'crazygames', demo: false, zip: true, crazySdk: true },
  demo: { build: 'demo', demo: true, zip: true }, // demo de Steam Next Fest (se empaqueta con Electron)
  steam: { build: 'steam', demo: false, zip: true }, // juego completo (se empaqueta con Electron)
};
// Qué se copia del proyecto. Las carpetas de recursos se incluyen solo si existen.
const COPY_FILES = ['index.html', 'favicon.ico', 'favicon.png', 'manifest.json'];
const COPY_DIRS = ['js', 'assets', 'audio', 'img', 'images', 'fonts', 'sfx', 'music'];
const CRAZY_SDK = 'https://sdk.crazygames.com/crazygames-sdk-v3.js';

const log = (...a) => console.log(...a);
const fail = (msg) => { console.error('\n[build] ERROR: ' + msg); process.exit(1); };

// ---------- utilidades ----------
function rmrf(p) { fs.rmSync(p, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue; // .DS_Store, .gitkeep, etc.
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else if (e.isFile()) fs.copyFileSync(s, d);
  }
}
function walk(dir, base = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, base, out);
    else if (e.isFile()) out.push(path.relative(base, p).split(path.sep).join('/'));
  }
  return out.sort();
}
function dirSize(dir) { return walk(dir).reduce((s, f) => s + fs.statSync(path.join(dir, f)).size, 0); }
const kb = (n) => (n / 1024).toFixed(1) + ' KB';

// Lee V.CONFIG del config.js original ejecutándolo en un contexto aislado.
function readConfig(file) {
  const ctx = { globalThis: null };
  ctx.globalThis = ctx;
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
  if (!ctx.V || !ctx.V.CONFIG) throw new Error('config.js no define V.CONFIG');
  return ctx.V.CONFIG;
}

// Quita los comentarios HTML para buscar solo los <script> activos.
const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');
function scriptSrcs(html) {
  const out = [];
  const re = /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(stripComments(html)))) out.push(m[1]);
  return out;
}

// ---------- zip (formato ZIP estándar, deflate, sin dependencias) ----------
function crc32(buf) {
  if (zlib.crc32) return zlib.crc32(buf) >>> 0;
  let crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    let c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function dosTime(d) {
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { time, date };
}
function makeZip(srcDir, zipFile) {
  const files = walk(srcDir);
  const locals = [], centrals = [];
  let offset = 0;
  const { time, date } = dosTime(new Date());
  for (const rel of files) {
    const data = fs.readFileSync(path.join(srcDir, rel));
    const name = Buffer.from(rel, 'utf8');
    const deflated = zlib.deflateRawSync(data, { level: 9 });
    const store = deflated.length >= data.length; // si no comprime, se guarda sin comprimir
    const body = store ? data : deflated;
    const crc = crc32(data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); // UTF-8
    lh.writeUInt16LE(store ? 0 : 8, 8); lh.writeUInt16LE(time, 10); lh.writeUInt16LE(date, 12);
    lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(body.length, 18); lh.writeUInt32LE(data.length, 22);
    lh.writeUInt16LE(name.length, 26); lh.writeUInt16LE(0, 28);
    locals.push(lh, name, body);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8);
    ch.writeUInt16LE(store ? 0 : 8, 10); ch.writeUInt16LE(time, 12); ch.writeUInt16LE(date, 14);
    ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(body.length, 20); ch.writeUInt32LE(data.length, 24);
    ch.writeUInt16LE(name.length, 28); ch.writeUInt16LE(0, 30); ch.writeUInt16LE(0, 32);
    ch.writeUInt16LE(0, 34); ch.writeUInt16LE(0, 36); ch.writeUInt32LE(0, 38); ch.writeUInt32LE(offset, 42);
    centrals.push(ch, name);
    offset += lh.length + name.length + body.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  fs.writeFileSync(zipFile, Buffer.concat([...locals, cd, end]));
  return files.length;
}

// ---------- validación ----------
function validate(dir, opts = {}) {
  const errors = [];
  const indexFile = path.join(dir, 'index.html');
  if (!fs.existsSync(indexFile)) return ['falta index.html'];
  const html = fs.readFileSync(indexFile, 'utf8');
  const srcs = scriptSrcs(html);
  if (!srcs.length) errors.push('index.html no referencia ningún <script src>');
  const local = [];
  for (const src of srcs) {
    if (/^https?:\/\//i.test(src)) {
      if (src !== CRAZY_SDK) errors.push('script externo no esperado: ' + src);
      else if (!opts.crazySdk) errors.push('el SDK de CrazyGames solo debe estar activo en el build crazygames');
      continue;
    }
    const f = path.join(dir, src.split('?')[0]);
    if (!fs.existsSync(f)) { errors.push('falta el script ' + src); continue; }
    local.push(src);
    try { new vm.Script(fs.readFileSync(f, 'utf8'), { filename: src }); } // comprobación de sintaxis
    catch (e) { errors.push('error de sintaxis en ' + src + ': ' + e.message); }
  }
  if (opts.crazySdk && !srcs.includes(CRAZY_SDK)) errors.push('el SDK de CrazyGames no quedó activo en index.html');
  if (local[0] !== 'js/config.js') errors.push('js/config.js debe ser el primer script local (es: ' + local[0] + ')');
  if (!local.includes('js/platform.js')) errors.push('index.html no carga js/platform.js');
  // Scripts de js/ que existen pero el index no carga (aviso, no error: puede ser intencional)
  const jsDir = path.join(dir, 'js');
  if (fs.existsSync(jsDir)) {
    for (const f of fs.readdirSync(jsDir).filter((n) => n.endsWith('.js'))) {
      if (!local.includes('js/' + f)) log('  aviso: js/' + f + ' existe pero index.html no lo carga');
    }
  }
  if (opts.expect) {
    try {
      const c = readConfig(path.join(dir, 'js', 'config.js'));
      for (const k of Object.keys(opts.expect)) {
        if (c[k] !== opts.expect[k]) errors.push(`config.js: ${k} = ${JSON.stringify(c[k])}, se esperaba ${JSON.stringify(opts.expect[k])}`);
      }
    } catch (e) { errors.push('config.js inválido: ' + e.message); }
  }
  return errors;
}

// ---------- build de un destino ----------
function buildTarget(name, baseConfig, version) {
  const t = TARGETS[name];
  const out = path.join(DIST, name);
  log(`\n== ${name} → dist/${name}/`);
  rmrf(out);
  fs.mkdirSync(out, { recursive: true });
  for (const f of COPY_FILES) if (fs.existsSync(path.join(ROOT, f))) fs.copyFileSync(path.join(ROOT, f), path.join(out, f));
  for (const d of COPY_DIRS) if (fs.existsSync(path.join(ROOT, d))) copyDir(path.join(ROOT, d), path.join(out, d));

  // config.js de la copia: se conservan todas las claves del original y se sobrescriben las del destino.
  const cfg = Object.assign({}, baseConfig, { version, build: t.build, demo: t.demo, buildDate: new Date().toISOString() });
  const cfgSrc =
    `// GENERADO por tools/build.js (${name}). No editar: los cambios van en js/config.js del proyecto.\n` +
    `(function () {\n  const V = (globalThis.V = globalThis.V || {});\n  V.CONFIG = ${JSON.stringify(cfg, null, 2).replace(/\n/g, '\n  ')};\n})();\n`;
  fs.writeFileSync(path.join(out, 'js', 'config.js'), cfgSrc);

  // index.html de la copia
  let html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
  if (t.crazySdk) {
    const re = /<!--\s*(<script\s+src=["']https:\/\/sdk\.crazygames\.com\/crazygames-sdk-v3\.js["']\s*>\s*<\/script>)\s*-->/i;
    if (re.test(html)) html = html.replace(re, '$1');
    else if (!scriptSrcs(html).includes(CRAZY_SDK)) {
      // Si alguien quitó la línea comentada, se inserta antes del primer script del juego.
      log('  aviso: no se encontró la línea comentada del SDK; se inserta antes de js/config.js');
      html = html.replace(/<script\s+src=["']js\/config\.js["']/i, `<script src="${CRAZY_SDK}"></script>\n$&`);
    }
  }
  if (t.demo) html = html.replace(/<title>([^<]*)<\/title>/i, (m, s) => (/demo/i.test(s) ? m : `<title>${s} Demo</title>`));
  fs.writeFileSync(path.join(out, 'index.html'), html);

  const errors = validate(out, { crazySdk: !!t.crazySdk, expect: { build: t.build, demo: t.demo, version } });
  if (errors.length) fail(`destino ${name}:\n  - ` + errors.join('\n  - '));
  const nScripts = scriptSrcs(html).length;
  log(`  ok: ${nScripts} scripts validados, ${walk(out).length} archivos, ${kb(dirSize(out))}`);

  if (t.zip) {
    const zipFile = path.join(DIST, `voidling-${name}-${version}.zip`);
    const n = makeZip(out, zipFile);
    log(`  zip: dist/${path.basename(zipFile)} (${n} archivos, ${kb(fs.statSync(zipFile).size)})`);
  }
}

// ---------- main ----------
function main() {
  const arg = (process.argv[2] || '').toLowerCase();
  const valid = Object.keys(TARGETS).concat(['all', 'check']);
  if (!valid.includes(arg)) {
    console.log('Uso: node tools/build.js <' + valid.join('|') + '>');
    process.exit(arg ? 1 : 0);
  }
  const baseConfig = readConfig(path.join(ROOT, 'js', 'config.js'));
  let version = baseConfig.version;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    if (pkg.version && pkg.version !== version) log(`aviso: package.json (${pkg.version}) y js/config.js (${version}) tienen versiones distintas; se usa la de config.js`);
  } catch (e) { /* sin package.json */ }

  if (arg === 'check') {
    const errors = validate(ROOT, {});
    if (errors.length) fail('index.html del proyecto:\n  - ' + errors.join('\n  - '));
    log('index.html del proyecto: ok (' + scriptSrcs(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')).length + ' scripts)');
    return;
  }
  log(`Voidling ${version} — build ${arg}`);
  const list = arg === 'all' ? Object.keys(TARGETS) : [arg];
  fs.mkdirSync(DIST, { recursive: true });
  for (const name of list) buildTarget(name, baseConfig, version);
  log('\nBuild terminado.');
}

if (require.main === module) main();
module.exports = { buildTarget, validate, makeZip, readConfig, TARGETS, DIST, ROOT };
