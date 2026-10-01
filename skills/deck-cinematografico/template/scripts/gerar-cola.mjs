#!/usr/bin/env node
// Gera COLA-DE-CLIQUES.md a partir de roteiro.js (um clique por beat, na ordem). Uso: node scripts/gerar-cola.mjs
import fs from "node:fs"; import vm from "node:vm";
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync("roteiro.js", "utf8"), ctx);
const R = ctx.window.ROTEIRO; let n = 0;
const linhas = [`# Cola de cliques · ${R.titulo}`, "", "Duplo clique em `apresentar.command` (servidor local + Chrome). Não abra o index.html pelo Finder: o Chrome bloqueia `file://`.",
  "**→ / espaço / clique / passador** avança · **←** volta · **Home** início · **F** tela cheia · **R** reentrada (se configurada).", "", "| Clique | Tela | Fala |", "|---|---|---|", "| 0 | Papel vazio | (espera o grupo) |"];
for (const p of R.planos) {
  if (p.pausa) linhas.push(`| | **${p.pausa}** | |`);
  p.beats.forEach((b, i) => { n++; const tela = (b.copy || []).map(c => c[0]).join(" · ") || b.desc || ""; linhas.push(`| ${n} | ${p.numero ? p.numero + " · " : ""}${tela.replace(/\|/g, "/")} | ${(b.fala || (i === 0 ? p.fala : "") || "").replace(/\|/g, "/")} |`); });
}
fs.writeFileSync("COLA-DE-CLIQUES.md", linhas.join("\n") + "\n"); console.log("COLA-DE-CLIQUES.md:", n, "cliques");
