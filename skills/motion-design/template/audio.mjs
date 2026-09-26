// Som da demo. Estrutura para copiar: um bloco por ato, cada linha amarrada a
// um tempo da partitura (T.algo). Se você não consegue apontar o gesto visual
// que justifica um som, apague o som.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { T, CHORDS, DURATION } from './timeline.mjs';
import { createMix } from './audio/synth.mjs';

const S = createMix(DURATION);
S.roomTone();

// abertura: o ponto aparece; o quadrado se desenha
S.click(T.dotIn, 0.12, 900);
S.tone(T.dotIn, 0.05, S.NOTE('D5'), 0.05, { release: 0.8, harm: [1, 0.2], send: 0.5 });
S.pen(T.box[0], T.box[1], 0.12, 0.2);
S.marker(T.text1Mark, 0.06);

// recuo: ar subindo + drone grave; as outras caixas se desenham em rajada
S.swoosh(T.pull[0], T.pull[1] - T.pull[0], 0.06, 0, 180, 1400);
S.tone(T.pull[0] + 0.3, 3, S.NOTE('D2'), 0.08, { attack: 1.5, release: 1.5, harm: [1, 0.25, 0.08] });
for (let k = 0; k < 14; k++) S.pen(T.pull[0] + 0.3 + (k % 5) * 0.12 + Math.floor(k / 5) * 0.08, T.pull[0] + 0.9 + (k % 5) * 0.12, 0.04, -0.6 + (k % 5) * 0.3);

// carimbo: whoosh curto antes, impacto grave no quadro exato, papel descolando depois
S.swoosh(T.stamp - 0.14, 0.13, 0.05, 0.3, 900, 2500);
S.thump({ t: T.stamp, f0: 130, f1: 38, decay: 0.34, gain: 0.8, click: 0.6, pan: 0.3, send: 0.2 });
S.peel(T.peel, 0.08, 0.5); S.swoosh(T.peel + 0.1, 0.5, 0.05, 0.7);

// lápis encosta: toque + grafite + nuvem de estalinhos enquanto o traço vira rascunho
S.swoosh(T.touch - 0.9, 0.9, 0.04, 0.6, 400, 1200);
S.click(T.touch, 0.16, 1800, 0.5);
for (let k = 0; k < 120; k++) { const t = T.touch + 0.1 + Math.pow(S.rand(), 0.8) * 1.2; S.noiseEvent({ t0: t, t1: t + 0.012 + S.rand() * 0.03, f: 3000 + S.rand() * 3000, q: 1, gain: 0.02 + S.rand() * 0.03, release: 0.02, pan: S.rand() * 1.6 - 0.8, send: 0.2 }); }

// folha entra, desenho tracejado nela; a música começa aqui
S.swoosh(T.sheet, 0.7, 0.07, -0.6, 250, 1600);
S.pen(T.sheetDraw[0], T.sheetDraw[1], 0.09, -0.2);
S.marker(T.text2Mark, 0.06);
CHORDS.forEach((c, i) => {
  const last = i === CHORDS.length - 1, next = CHORDS[i + 1] ? CHORDS[i + 1].t : DURATION;
  S.chord(c.t, c.notes, { vel: last ? 0.32 : 0.26, roll: last ? 0.07 : 0.035, sustain: last ? 4 : Math.min(4, next - c.t + 1), padDur: next - c.t });
});

// linhas viram faixa: arpejo ascendente + ar
['D4', 'E4', 'F#4', 'A4', 'B4', 'D5', 'E5', 'F#5', 'A5'].forEach((n, i) => S.piano(T.morph[0] + 0.15 + i * 0.11, S.NOTE(n), 0.12, -0.6 + i * 0.14, 2.2));
S.swoosh(T.morph[0], 1.8, 0.05, 0, 300, 4000);
S.thump({ t: T.endIn + 0.45, f0: 100, f1: 45, decay: 0.3, gain: 0.35, click: 0.2, send: 0.3 });

S.finish(path.join(path.dirname(fileURLToPath(import.meta.url)), 'out', 'audio.wav'));
