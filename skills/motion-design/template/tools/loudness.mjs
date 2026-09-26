// Mede o som sem precisar ouvir: loudness integrada, faixa dinâmica e perfil
// a cada N segundos. Metas: integrada entre -18 e -14 LUFS; LRA < 11 LU;
// nenhum trecho com som (fora de silêncios intencionais) abaixo de -30 LUFS.
//   node tools/loudness.mjs out/audio.wav [passo=2]
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const [src = 'out/audio.wav', step = 2] = process.argv.slice(2);
const r = spawnSync(ffmpeg, ['-hide_banner', '-i', src, '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' });
const txt = r.stderr;
const I = txt.match(/I:\s+(-?[\d.]+) LUFS/g)?.pop(), LRA = txt.match(/LRA:\s+(-?[\d.]+) LU/g)?.pop();
let last = -99;
for (const m of txt.matchAll(/t:\s*([\d.]+)\s+TARGET.*?M:\s*(-?[\d.inf]+)\s+S:\s*(-?[\d.inf]+)/g)) {
  const t = +m[1]; if (t - last < +step) continue; last = t;
  const s = parseFloat(m[3]);
  const bar = Number.isFinite(s) && s > -60 ? '█'.repeat(Math.max(0, Math.round((s + 45) / 1.5))) : '';
  console.log(`${t.toFixed(1).padStart(5)}s  S ${Number.isFinite(s) ? s.toFixed(1).padStart(6) : '  -inf'}  ${bar}`);
}
console.log(`integrada ${I?.replace(/\s+/g, ' ')}   faixa dinâmica ${LRA?.replace(/\s+/g, ' ')}`);
const iv = parseFloat(I?.match(/-?[\d.]+/)?.[0]), lv = parseFloat(LRA?.match(/-?[\d.]+/)?.[0]);
console.log(iv >= -20 && iv <= -14 ? `APROVADO: integrada ${iv} está entre -20 e -14 LUFS.` : `REPROVADO: integrada ${iv} LUFS está FORA de -20..-14 (${iv > -14 ? 'alta demais: baixe os ganhos' : 'baixa demais: suba os ganhos dos sons'}).`);
console.log(lv < 11 ? `APROVADO: faixa dinâmica ${lv} LU < 11.` : `REPROVADO: faixa dinâmica ${lv} LU ≥ 11 (trechos baixos vão sumir no celular).`);
