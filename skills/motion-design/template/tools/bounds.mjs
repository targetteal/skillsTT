// Mede onde há "tinta" numa imagem (ex.: título embutido numa arte que você
// precisa esconder/revelar). Não estime máscaras a olho: meça.
//   node tools/bounds.mjs assets/capa.png x0 y0 x1 y1 [limiar=330]
// Imprime blocos de linhas contínuas com tinta e o x mínimo/máximo de cada um.
// Limiar: soma R+G+B abaixo disso conta como tinta (330 ≈ cinza escuro).
import fs from 'node:fs';
import { chromium } from 'playwright-core';
const [src, x0, y0, x1, y1, thr = 330] = process.argv.slice(2);
if (!y1) { console.error('uso: node tools/bounds.mjs imagem x0 y0 x1 y1 [limiar]'); process.exit(1); }
const exe = process.env.CHROME_PATH || [chromium.executablePath?.(), ...fs.readdirSync('/opt/pw-browsers').map((d) => `/opt/pw-browsers/${d}/chrome-linux/chrome`)].find((p) => p && fs.existsSync(p));
const b = await chromium.launch({ executablePath: exe });
const p = await b.newPage();
const data = `data:image/${src.endsWith('.png') ? 'png' : 'jpeg'};base64,` + fs.readFileSync(src).toString('base64');
const rows = await p.evaluate(async ([src, x0, y0, x1, y1, thr]) => {
  const i = new Image(); i.src = src; await i.decode();
  const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data, out = [];
  for (let y = y0; y < y1; y++) { let a = 1e9, z = -1; for (let x = x0; x < x1; x++) { const k = (y * c.width + x) * 4; if (d[k] + d[k + 1] + d[k + 2] < thr) { a = Math.min(a, x); z = Math.max(z, x); } } if (z >= 0) out.push([y, a, z]); }
  return { rows: out, w: i.width, h: i.height };
}, [data, +x0, +y0, +x1, +y1, +thr]);
console.log(`imagem ${rows.w}×${rows.h}`);
let seg = null;
for (const [y, a, z] of rows.rows) {
  if (!seg || y - seg.y1 > 2) { if (seg) console.log(seg); seg = { y0: y, y1: y, x0: a, x1: z }; } else { seg.y1 = y; seg.x0 = Math.min(seg.x0, a); seg.x1 = Math.max(seg.x1, z); }
}
if (seg) console.log(seg);
await b.close();
