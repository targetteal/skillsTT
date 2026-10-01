#!/usr/bin/env node
// Baixa do Google Fonts (subconjunto latino, woff2) as fontes declaradas em identidade.json
// e registra os arquivos em fontes.<papel>.arquivos. Uso: node scripts/baixar-fontes.mjs
import fs from "node:fs";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const id = JSON.parse(fs.readFileSync("identidade.json", "utf8"));
fs.mkdirSync("fonts", { recursive: true });
const cache = {};
for (const [papel, f] of Object.entries(id.fontes)) {
  if (!f.google) { console.log(`${papel}: sem "google"; mantenha "arquivos" manualmente`); continue; }
  if (!cache[f.google]) {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${f.google}&display=block`, { headers: { "User-Agent": UA } })).text();
    const blocos = [...css.matchAll(/\/\* latin \*\/\s*@font-face\s*\{([^}]*)\}/g)].map(m => m[1]);
    if (!blocos.length) throw new Error(`Nenhum bloco latino para ${f.google}. Confira o nome no Google Fonts.`);
    const slug = f.familia.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const arquivos = [];
    for (const b of blocos) {
      const url = b.match(/url\(([^)]+)\)/)[1], estilo = (b.match(/font-style:\s*([^;]+)/) || [, "normal"])[1].trim();
      const peso = (b.match(/font-weight:\s*([^;]+)/) || [, "400"])[1].trim(), estiramento = (b.match(/font-stretch:\s*([^;]+)/) || [])[1]?.trim();
      const nome = `${slug}-${estilo}${peso.includes(" ") ? "" : "-" + peso}.woff2`;
      fs.writeFileSync("fonts/" + nome, Buffer.from(await (await fetch(url)).arrayBuffer()));
      arquivos.push({ arquivo: nome, estilo, peso, ...(estiramento ? { estiramento } : {}) });
    }
    cache[f.google] = arquivos;
  }
  f.arquivos = cache[f.google];
  console.log(`${papel}: ${f.familia} → ${f.arquivos.map(a => a.arquivo).join(", ")}`);
}
fs.writeFileSync("identidade.json", JSON.stringify(id, null, 2) + "\n");
