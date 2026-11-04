// Empaquetado para Windows x64 con @electron/packager (sin instalador: carpeta lista para SteamPipe).
//
//   node desktop/package-win.js steam   → out/Voidling-win32-x64/Voidling.exe
//   node desktop/package-win.js demo    → out/VoidlingDemo-win32-x64/VoidlingDemo.exe
//
// Pasos: 1) build del destino (tools/build.js), 2) empaqueta solo package.json, desktop/ (main, preload,
// icono, steam.json), dist/<destino>/ y las dependencias de producción (steamworks.js),
// 3) recorta locales de Chromium que no se usan y copia steam_api64.dll junto al exe.
// Variables: VOIDLING_OUT=<carpeta> cambia la carpeta de salida (por defecto out/).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const target = (process.argv[2] || 'steam').toLowerCase();
if (!['steam', 'demo'].includes(target)) {
  console.error('Uso: node desktop/package-win.js <steam|demo>');
  process.exit(1);
}
const OUT = path.resolve(process.env.VOIDLING_OUT || path.join(ROOT, 'out'));
const NAME = target === 'demo' ? 'VoidlingDemo' : 'Voidling';
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

// Locales de Chromium que se conservan (solo afectan a textos internos del navegador; el juego trae los suyos).
const KEEP_LOCALES = ['en-US', 'en-GB', 'es', 'es-419', 'pt-BR', 'pt-PT', 'fr', 'de', 'it', 'ru', 'pl', 'tr', 'ja', 'ko', 'zh-CN', 'zh-TW'];
// Archivos de desktop/ que NO van en el ejecutable (herramientas de build)
const DESKTOP_EXCLUDE = ['/desktop/make-icon.js', '/desktop/package-win.js'];

// Devuelve true si la ruta (relativa a la raíz, con '/' inicial) debe IGNORARSE.
function ignore(p) {
  if (!p || p === '/') return false;
  if (p === '/package.json') return false;
  if (p === '/desktop' || p.startsWith('/desktop/')) return DESKTOP_EXCLUDE.includes(p);
  if (p === '/dist') return false;
  if (p === '/dist/' + target || p.startsWith('/dist/' + target + '/')) return false;
  if (p === '/node_modules' || p.startsWith('/node_modules/')) {
    if (p.startsWith('/node_modules/.bin')) return true;
    // De steamworks.js solo se necesitan los binarios de Windows x64
    if (/^\/node_modules\/steamworks\.js\/dist\/(linux64|osx)(\/|$)/.test(p)) return true;
    if (/\.(lib|pdb|md|d\.ts)$/i.test(p)) return true;
    return false; // el resto lo decide el podado de devDependencies de packager
  }
  return true; // docs, tools, js/ sin compilar, marketing, out, etc.
}

async function main() {
  console.log(`== Build del juego (${target})`);
  execFileSync(process.execPath, [path.join(ROOT, 'tools', 'build.js'), target], { stdio: 'inherit' });

  const { packager } = await import('@electron/packager');
  console.log(`\n== Empaquetando ${NAME}.exe (win32-x64) en ${OUT}`);
  const paths = await packager({
    dir: ROOT,
    out: OUT,
    name: NAME,
    executableName: NAME,
    platform: 'win32',
    arch: 'x64',
    overwrite: true,
    prune: true,
    junk: true,
    ignore,
    icon: path.join(__dirname, 'icon.ico'),
    // .node y .dll fuera del asar: Windows no puede cargar DLL desde dentro de un archivo .asar
    asar: { unpack: '**/*.{node,dll}' },
    appVersion: pkg.version,
    buildVersion: pkg.version,
    appCopyright: `© ${new Date().getFullYear()} Voidling`,
    win32metadata: {
      CompanyName: pkg.author || 'Voidling',
      FileDescription: target === 'demo' ? 'Voidling Demo' : 'Voidling',
      ProductName: target === 'demo' ? 'Voidling Demo' : 'Voidling',
      InternalName: NAME,
      OriginalFilename: NAME + '.exe',
      'requested-execution-level': 'asInvoker',
    },
  });

  for (const appDir of paths) {
    // Recortar locales
    const loc = path.join(appDir, 'locales');
    if (fs.existsSync(loc)) {
      for (const f of fs.readdirSync(loc)) {
        if (f.endsWith('.pak') && !KEEP_LOCALES.includes(f.slice(0, -4))) fs.rmSync(path.join(loc, f), { force: true });
      }
    }
    // steam_api64.dll también junto al exe (búsqueda estándar de DLL de Windows; inofensivo si sobra)
    const dll = path.join(appDir, 'resources', 'app.asar.unpacked', 'node_modules', 'steamworks.js', 'dist', 'win64', 'steam_api64.dll');
    if (fs.existsSync(dll)) fs.copyFileSync(dll, path.join(appDir, 'steam_api64.dll'));
    else console.warn('aviso: no se encontró steam_api64.dll en el paquete (¿falta steamworks.js?)');

    const exe = path.join(appDir, NAME + '.exe');
    if (!fs.existsSync(exe)) throw new Error('No se generó ' + exe);
    const size = dirSize(appDir);
    console.log(`\nListo: ${exe}`);
    console.log(`Carpeta para SteamPipe: ${appDir} (${(size / 1048576).toFixed(1)} MB)`);
  }
}

function dirSize(dir) {
  let s = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    s += e.isDirectory() ? dirSize(p) : fs.statSync(p).size;
  }
  return s;
}

main().catch((e) => { console.error('\nERROR de empaquetado:', e && e.stack || e); process.exit(1); });
