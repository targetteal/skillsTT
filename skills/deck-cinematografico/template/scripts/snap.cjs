// Fotografa as paradas. Uso: node scripts/snap.cjs [0,3,5] [pasta]   (sem índices: todas)
const abrir = require("./_pagina.cjs");
(async () => {
  const out = process.argv[3] || "/tmp"; const { b, p, seek } = await abrir();
  const H = await p.evaluate(() => window.__HOLDS), N = await p.evaluate(() => window.__HOLD_NAMES);
  const quais = process.argv[2] ? process.argv[2].split(",").map(Number) : H.map((_, i) => i);
  for (const i of quais) { await seek(H[i]); await p.screenshot({ path: `${out}/h${String(i).padStart(2, "0")}.png` }); console.log(i, H[i], N[i]); }
  await b.close();
})();
