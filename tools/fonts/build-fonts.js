// Genera fuentes CJK recortadas (solo los caracteres que usa el juego) para Steam Deck / Linux,
// donde puede no haber fuentes chinas o japonesas instaladas.
// Uso: node tools/fonts/build-fonts.js   (volver a ejecutar si cambian los textos de js/lang/*.js)
// Fuentes origen (OFL 1.1, Google Fonts): tools/fonts/src/NotoSansSC.ttf y NotoSansJP.ttf
//   https://github.com/google/fonts/tree/main/ofl/notosanssc  ·  .../ofl/notosansjp
// Requiere el paquete npm "subset-font" (NODE_PATH o instalado en tools/fonts/node_modules).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
let subsetFont;
try { subsetFont = require('subset-font'); } catch (e) { subsetFont = require(path.join(__dirname, 'node_modules', 'subset-font')); }

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const ASCII = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('');
const EXTRA = '·—–…◆▶▸◂✓×→←↑↓«»“”„‘’¡¿°%';
function chars(...files) {
  const set = new Set(ASCII + EXTRA);
  for (const f of files) for (const ch of read(f)) if (ch.codePointAt(0) >= 32) set.add(ch);
  return [...set].join('');
}

const jobs = [
  // SC: chino + todo lo demás (latín extendido y cirílico) como respaldo universal
  { src: 'NotoSansSC.ttf', out: 'voidling-sc.woff2', text: chars('js/lang/zh-CN.js', 'js/lang/ru.js', 'js/lang/de.js', 'js/lang/pt-BR.js', 'js/i18n.js', 'js/story.js') },
  { src: 'NotoSansJP.ttf', out: 'voidling-jp.woff2', text: chars('js/lang/ja.js') },
];

(async () => {
  fs.mkdirSync(path.join(ROOT, 'fonts'), { recursive: true });
  for (const j of jobs) {
    const buf = fs.readFileSync(path.join(__dirname, 'src', j.src));
    const out = await subsetFont(buf, j.text, { targetFormat: 'woff2' });
    fs.writeFileSync(path.join(ROOT, 'fonts', j.out), out);
    console.log(j.out, (out.length / 1024).toFixed(0) + ' KB', j.text.length + ' caracteres');
  }
  fs.copyFileSync(path.join(__dirname, 'OFL.txt'), path.join(ROOT, 'fonts', 'OFL.txt'));
})().catch((e) => { console.error(e); process.exit(1); });
