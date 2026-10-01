#!/usr/bin/env node
// Gera o bloco IDENTIDADE do index.html a partir de identidade.json (cores, @font-face, classes de fonte)
// e atualiza título e cabeçalho. Rode de novo sempre que mudar a identidade.
import fs from "node:fs";
const id = JSON.parse(fs.readFileSync("identidade.json", "utf8"));
let html = fs.readFileSync("index.html", "utf8");
const c = id.cores, F = id.fontes;
const faces = [], vistas = new Set();
for (const f of Object.values(F)) for (const a of f.arquivos || []) {
  const k = f.familia + a.arquivo; if (vistas.has(k)) continue; vistas.add(k);
  faces.push(`@font-face { font-family: "${f.familia}"; src: url("fonts/${a.arquivo}") format("woff2"); font-style: ${a.estilo}; font-weight: ${a.peso};${a.estiramento ? ` font-stretch: ${a.estiramento};` : ""} font-display: block; }`);
}
const classe = (sel, f) => `${sel} { font-family: "${f.familia}", ${f.pilha};${f.peso ? ` font-weight: ${f.peso};` : ""}${f.estiramento ? ` font-stretch: ${f.estiramento};` : ""}${f.caixa ? ` text-transform: ${f.caixa};` : ""}${f.espacamento ? ` letter-spacing: ${f.espacamento};` : ""} }`;
const bloco = `<!-- IDENTIDADE:INICIO (gerado por scripts/aplicar-identidade.mjs; não editar à mão) -->
    <style>
      ${faces.join("\n      ")}
      :root { --papel: ${c.papel}; --papel-claro: ${c.papel_claro || c.papel}; --papel-escuro: ${c.papel_escuro || c.papel}; --tinta: ${c.tinta}; --suave: ${c.suave}; --acento: ${c.acento};${(c.categorias || []).map((x, i) => ` --c${i + 1}: ${x};`).join("")} --grao: ${id.textura?.grao ?? .5}; --resp: ${id.movimento?.respiracao ?? 1}; }
      #root { font-family: "${F.texto.familia}", ${F.texto.pilha}; }
      ${classe(".display", F.display)}
      ${classe(".texto", F.texto)}
      ${classe(".mono", F.mono)}
    </style>
    <!-- IDENTIDADE:FIM -->`;
html = html.replace(/<!-- IDENTIDADE:INICIO[\s\S]*?<!-- IDENTIDADE:FIM -->/, bloco);
const p = id.projeto || {};
if (p.titulo) html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${p.titulo}</title>`);
if (p.cabecalho_esq) html = html.replace(/(<span class="m" data-cab="esq">)[\s\S]*?(<\/span>)/, `$1${p.cabecalho_esq}$2`);
if (p.cabecalho_centro) html = html.replace(/(<span class="m" data-cab="centro">)[\s\S]*?(<\/span>)/, `$1${p.cabecalho_centro}$2`);
fs.writeFileSync("index.html", html);
console.log(`identidade "${id.nome}" aplicada: ${faces.length} @font-face, ${Object.keys(c).length} cores`);
