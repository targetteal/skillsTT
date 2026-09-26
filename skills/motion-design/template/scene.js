// CENA DE DEMONSTRAÇÃO (~14 s). Ela existe para duas coisas:
//   1. provar que o template renderiza de ponta a ponta antes de você mexer;
//   2. mostrar, num arquivo curto, como cada primitiva da lib é usada.
// Para um vídeo novo: copie a ESTRUTURA (camadas e ordem de desenho em
// drawFrame) e troque o conteúdo de cada camada pelo seu roteiro.
//
// Conceito da demo: "toda caixa foi desenhada — e pode ser desenhada de outro jeito".

import { T, WIDTH as W, HEIGHT as H } from './timeline.mjs';
import { BRAND } from './brand.js';
import { E, prog, spring, noise1 } from './lib/core.js';
import { mkPath, stroke, circlePts, catmull } from './lib/path.js';
import { makePaper, makeGrain, drawPaper, drawGrain } from './lib/paper.js';
import { makeText, drawText, drawEndCard } from './lib/text.js';
import { makeCamera, frame, applyCamera, shake, toScreen } from './lib/camera.js';
import { makeStamp, drawStamp, drawSheet, buildMorph, drawMorph, bandTarget, spreadFrom, drawPencil } from './lib/fx.js';
import { boot } from './lib/engine.js';
import { LAYOUTS, fitFrame } from './lib/layout.js';

const C = BRAND.colors, DISPLAY = BRAND.fonts.display, TEXT = BRAND.fonts.text;

// ── mundo: uma grade de caixas; a do centro tem a pessoa (ponto de cor) ──
const BOXES = [];
for (let j = -1; j <= 1; j++) for (let i = -2; i <= 2; i++) BOXES.push({ x: i * 260, y: j * 260, main: i === 0 && j === 0 });
const boxPath = (b) => mkPath([[b.x - 90, b.y - 90], [b.x + 90, b.y - 90], [b.x + 90, b.y + 90], [b.x - 90, b.y + 90], [b.x - 90, b.y - 90]]);
BOXES.forEach((b, k) => { b.P = boxPath(b); b.t0 = b.main ? T.box[0] : T.pull[0] + 0.3 + (k % 5) * 0.12 + Math.floor(k / 5) * 0.08; b.t1 = b.main ? T.box[1] : b.t0 + 0.6; });
const TOUCH = [130, 120];

// Composição: texto à esquerda, protagonista à direita (LAYOUTS.split).
// fitFrame(zona, alturaNoMundo) escolhe a escala para o protagonista ocupar a zona:
// primeiro a caixa sozinha (≈200 de altura no mundo), depois a grade inteira (≈720).
const L = LAYOUTS.split;
const cam = makeCamera([
  { t: 0, ...fitFrame(L.hero, 330) },
  { t: T.pull[0], ...fitFrame(L.hero, 310), e: 'lin' },   // deriva lenta: o plano parado continua vivo
  { t: T.pull[1], ...fitFrame(L.hero, 760, 1300), e: 'zoom' },  // recuo que revela: eram muitas caixas (grade 1300 × 760)
  { t: T.morph[1], ...fitFrame(L.hero, 720, 1240), e: 'lin' },
]);

const TEXTS = [
  makeText({ lines: ['TODA CAIXA', 'FOI *DESENHADA.'], ...L.text, size: 120, font: DISPLAY, tIn: T.text1In, tOut: T.text1Out, mark: T.text1Mark, colors: C }),
  makeText({ lines: ['E PODE SER', 'DESENHADA', 'DE ^OUTRO ^JEITO.'], ...L.text, size: 110, font: DISPLAY, tIn: T.text2In, tOut: T.text2Out, mark: T.text2Mark, colors: C }),
];

let paper, grain, STAMP, SHEET, MORPH;
const spine = mkPath(catmull([[-60, 760], [400, 700], [800, 560], [1200, 520], [1600, 380], [1990, 330]], 10));
const target = bandTarget(spine, { w0: 240, w1: 160, waves: 14, amp: 26 });

boot({
  W, H,
  fonts: BRAND.fonts.files,
  images: {},
  setup: async ({ ctx }) => {
    paper = makePaper(W, H, C.paper); grain = makeGrain(W, H);
    STAMP = { st: makeStamp('PADRÃO', C.accent, 7, DISPLAY, 120), x: 1260, y: 470, rot: -6, hit: T.stamp, peel: T.peel, dir: [0.8, -0.6] };
    SHEET = {
      cx: 0, cy: 0, w: 900, h: 640, rot: -3, from: [-1500, -900], tIn: T.sheet, draw: T.sheetDraw,
      style: { color: C.accent, width: 7, amp: 2, passes: 1, dash: [18, 12] },
      paths: [mkPath(circlePts(0, 0, 230, 64)), mkPath([[-260, 0], [260, 0]]), mkPath([[0, -260], [0, 260]])],
      note: { text: 'E SE…?', x: 250, y: -250, color: C.accent },
    };
    void ctx;
  },
  draw: (ctx, t) => {
    const boil = Math.floor(t * 12);          // traço "ferve" a 12 fps
    const c = cam(t);
    const [sx, sy] = shake(t, [[T.stamp, 14]]);
    drawPaper(ctx, paper, boil);

    // 1) MUNDO (com câmera): caixas, pessoa, folha
    const worldA = 1 - prog(t, T.morph[0], T.morph[0] + 0.4);
    if (worldA > 0) {
      ctx.save(); ctx.globalAlpha = worldA; applyCamera(ctx, c, sx, sy);
      for (const b of BOXES) {
        const p = E.sine(prog(t, b.t0, b.t1));
        if (p <= 0) continue;
        const m = spreadFrom(t, T.touch, TOUCH, b.x, b.y, 900, 300);   // contágio a partir do lápis
        stroke(ctx, b.P, { frac: p, width: b.main ? 7 : 5, color: C.ink, amp: 6 * m, passes: m > 0.02 ? 2 : 1, overshoot: 14 * m, boil, seed: b.x * 0.01 + b.y * 0.02 });
      }
      const da = spring(t - T.dotIn, 0.35, 16);
      if (da > 0) { ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(noise1(t * 0.6) * 30, noise1(t * 0.5 + 9) * 30, 22 * da, 0, 7); ctx.fill(); }
      drawSheet(ctx, SHEET, t, boil);
      ctx.restore();
    }

    // 2) TELA (sem câmera): carimbo, lápis, textos, transição, cartão final
    ctx.setTransform(1, 0, 0, 1, sx, sy);
    drawStamp(ctx, STAMP, t);
    if (t > T.touch - 0.9 && t < T.touch + 1.4) {
      const [tx, ty] = toScreen(c, TOUCH[0], TOUCH[1]);
      const off = (1 - E.out3(prog(t, T.touch - 0.9, T.touch))) * 1100 + E.in3(prog(t, T.touch + 0.6, T.touch + 1.4)) * 1200;
      drawPencil(ctx, tx + Math.cos(0.62) * off, ty + Math.sin(0.62) * off, 0.62, { band: C.accent });
    }
    for (const d of TEXTS) drawText(ctx, d, t);
    if (t > T.morph[0]) {
      MORPH ||= buildMorph(BOXES.map((b) => b.P.pts.map(([x, y]) => toScreen(cam(T.morph[0]), x, y))), { n: 70, colors: [C.ink, C.accent, C.ink, C.mid, C.ink, C.marker] });
      drawMorph(ctx, MORPH, t, T.morph[0], 1.3, target, 1 - prog(t, T.morph[1] + 0.2, T.morph[1] + 0.9));
    }
    // cartão final pronto (tamanhos legíveis garantidos)
    drawEndCard(ctx, t, T.endIn + 0.3, {
      label: 'MOTION DESIGN EM CÓDIGO',
      main: 'SEU TÍTULO AQUI',
      sub: 'DATA · HORÁRIO',
      lines: ['Uma linha de apoio, curta, em fonte de texto.'],
      url: 'SEUSITE.COM.BR',
    }, { colors: C, display: DISPLAY, text: TEXT });

    drawGrain(ctx, grain, boil);                 // sempre por último
  },
});
