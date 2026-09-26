// Composições prontas para 1920×1080. Escolha UMA por trecho do vídeo e use as
// zonas: o texto vai na zona de texto, o protagonista na zona do herói — eles
// não se sobrepõem. Isso evita os dois erros mais comuns: protagonista
// minúsculo e texto por cima do desenho.
//
//   import { LAYOUTS, fitFrame } from './lib/layout.js';
//   const L = LAYOUTS.split;                                 // texto à esquerda, herói à direita
//   makeText({ ..., x: L.text.x, maxW: L.text.maxW, align: L.text.align, y: L.text.y });
//   const cam = makeCamera([{ t: 0, ...fitFrame(L.hero, 420) }]);  // 420 = altura do herói no MUNDO
//
// fitFrame(zona, altura, largura) calcula a escala para que um protagonista de
// `heroH` × `heroW` (unidades do mundo, desenhado em torno de (0,0)) ocupe
// `hero.fill` da altura da tela SEM passar da largura da zona (hero.maxW).
// Sempre informe a largura quando o protagonista for mais largo que alto.

import { frame } from './camera.js';

export const LAYOUTS = {
  // texto à esquerda (coluna de 780 px), herói à direita
  split: { text: { x: 100, y: 540, maxW: 780, align: 'left' }, hero: { sx: 1380, sy: 540, fill: 0.62, maxW: 880 } },
  // herói à esquerda, texto à direita
  splitRight: { text: { x: 1080, y: 540, maxW: 740, align: 'left' }, hero: { sx: 540, sy: 540, fill: 0.62, maxW: 860 } },
  // herói grande em cima, texto centralizado embaixo (bom para dados curtos)
  stack: { text: { x: 960, y: 900, maxW: 1500, align: 'center' }, hero: { sx: 960, sy: 430, fill: 0.55, maxW: 1600 } },
  // só texto, centralizado (pergunta, frase-choque): o herói sai ou vira fantasma
  text: { text: { x: 960, y: 540, maxW: 1500, align: 'center' }, hero: { sx: 960, sy: 540, fill: 0.9, maxW: 1720 } },
  // só herói, tela cheia (momento do conceito, sem texto)
  hero: { text: null, hero: { sx: 960, sy: 540, fill: 0.78, maxW: 1720 } },
};

export function fitFrame(hero, heroH, heroW = 0, H = 1080) {
  const s = Math.min((H * hero.fill) / heroH, heroW ? (hero.maxW || 1720) / heroW : Infinity);
  return frame(s, 0, 0, hero.sx, hero.sy);
}
