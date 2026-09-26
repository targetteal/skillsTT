// Amplia um pedaço de um still para inspecionar detalhe (acento cortado,
// lasca de máscara, borda serrilhada). Olhe SEMPRE os detalhes de texto assim.
//   node tools/zoom.mjs out/stills/t012.50.png x y largura altura [escala=2]
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const [src, x, y, w, h, s = 2] = process.argv.slice(2);
if (!h) { console.error('uso: node tools/zoom.mjs imagem.png x y largura altura [escala]'); process.exit(1); }
const out = src.replace(/\.png$/, `-zoom-${x}-${y}.png`);
const r = spawnSync(ffmpeg, ['-loglevel', 'error', '-y', '-i', src, '-vf', `crop=${w}:${h}:${x}:${y},scale=iw*${s}:-1:flags=neighbor`, out], { stdio: 'inherit' });
if (r.status === 0) console.log(out);
