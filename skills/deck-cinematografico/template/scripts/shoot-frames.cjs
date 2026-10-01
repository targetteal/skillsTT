// Fotografa cada <section class="frame"> de um HTML de estudo (direcoes.html). Uso: node scripts/shoot-frames.cjs direcoes.html pasta
const path = require("path"); const { chromium } = require("playwright");
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2000, height: 1200 } });
  await p.goto("file://" + path.resolve(process.argv[2])); await p.evaluate(() => document.fonts.ready.then(() => 0));
  for (const el of await p.$$("section.frame")) { const id = await el.getAttribute("id"); await el.screenshot({ path: `${process.argv[3]}/${id}.png` }); console.log(id); }
  await b.close(); })();
