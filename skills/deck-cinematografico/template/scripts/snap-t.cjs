// Fotografa tempos arbitrários (meio das transições). Uso: node scripts/snap-t.cjs 12.6,27.4 [pasta]
const abrir = require("./_pagina.cjs");
(async () => {
  const out = process.argv[3] || "/tmp"; const { b, p, seek } = await abrir();
  for (const t of process.argv[2].split(",").map(Number)) { await seek(t); await p.screenshot({ path: `${out}/t${t}.png` }); console.log(t); }
  await b.close();
})();
