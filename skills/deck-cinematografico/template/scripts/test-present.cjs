// Percorre todas as paradas no modo apresentação (clique toca, ← volta) e testa a reentrada (R).
const abrir = require("./_pagina.cjs");
(async () => {
  const { b, p, erros } = await abrir("?present", { width: 1440, height: 900 });
  const H = await p.evaluate(() => window.__HOLDS);
  const agora = () => p.evaluate(() => +window.__timelines.main.time().toFixed(2));
  let ok = 0;
  for (let i = 1; i < H.length - 1; i++) { await p.keyboard.press("ArrowRight"); await p.keyboard.press("ArrowRight"); await p.keyboard.press("ArrowLeft"); await p.waitForTimeout(40);
    if (Math.abs((await agora()) - H[i]) < .05) ok++; else console.log("parada", i, "esperado", H[i], "obtido", await agora()); }
  console.log(`paradas ok: ${ok}/${H.length - 2} (a última não tem próxima)`);
  await p.keyboard.press("Home"); await p.keyboard.press("PageDown"); const t0 = await agora(); await p.waitForTimeout(200);
  console.log("latência do clique: avançou", (await agora()) - t0 > .1 ? "na hora" : "COM ATRASO");
  console.log("erros:", erros.length ? erros : "nenhum"); await b.close();
})();
