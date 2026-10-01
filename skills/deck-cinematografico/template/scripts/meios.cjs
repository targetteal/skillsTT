// Lista os tempos do meio de cada transição (entre o fim do respiro e a próxima parada) e fotografa.
// Uso: node scripts/meios.cjs [pasta]
const abrir = require("./_pagina.cjs");
(async () => {
  const out = process.argv[2] || "/tmp"; const { b, p, seek } = await abrir();
  const S = await p.evaluate(() => ({ H: window.__DECK.HOLDS, E: window.__DECK.HOLD_ENDS, N: window.__DECK.NOMES }));
  for (let i = 0; i + 1 < S.H.length; i++) { const t = +((S.E[i] + S.H[i + 1]) / 2).toFixed(2); await seek(t); await p.screenshot({ path: `${out}/m${String(i + 1).padStart(2, "0")}.png` }); console.log(`m${i + 1}`, t, "→", S.N[i + 1]); }
  await b.close();
})();
