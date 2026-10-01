// Mede a duração real da timeline e grava no data-duration do root (o render usa esse valor).
const fs = require("fs"), path = require("path"), abrir = require("./_pagina.cjs");
(async () => {
  const { b, p } = await abrir(); const T = await p.evaluate(() => window.__DECK.T); await b.close();
  const f = path.resolve(__dirname, "../index.html"); let h = fs.readFileSync(f, "utf8");
  h = h.replace(/(data-composition-id="main"[^>]*data-duration=")[^"]*(")/, `$1${T.toFixed(2)}$2`); fs.writeFileSync(f, h);
  console.log("data-duration =", T.toFixed(2));
})();
