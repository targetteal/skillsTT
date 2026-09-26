// Partitura única do filme. Imagem (scene.js) e som (audio.mjs) leem os
// mesmos tempos, em segundos, para que cada gesto visual tenha o seu ruído.

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION = 61.5;

export const T = {
  // I. A planta se fecha
  dotIn: 0.5,
  outer: [1.0, 1.42, 1.84, 2.26, 2.62, 2.9],         // paredes externas, em sequência
  dims: 2.7,
  inner: [3.0, 3.35, 3.7, 4.0, 4.3, 4.6],             // divisórias internas
  furniture: 4.4,
  text1In: 3.7,
  text1Out: 10.3,
  doorClose: [5.9, 6.5, 7.0, 7.4],
  cubicles: [7.7, 8.05, 8.35, 8.6, 8.82, 9.0, 9.15, 9.28, 9.4],
  cellClose: [9.62, 9.84, 10.02, 10.18],
  pullStart: 10.7,
  pullEnd: 15.3,
  headDraw: [11.0, 14.9],
  text2In: 12.7,
  text2Out: 16.7,

  // II. A pergunta errada
  stamps: [17.3, 17.95, 18.5, 18.95],
  peel: 19.9,
  qIn: 20.9,
  qMark: 22.2,
  qOut: 24.5,
  loopDraw: [24.6, 26.6],
  dotToLoop: 26.2,
  spin: 26.6,
  loopShift: 27.5,
  adoeceIn: 28.0,
  freeze: 31.4,
  unfreeze: 32.6,

  // III. Papel manteiga
  flyEnd: 34.4,
  pencilIn: 33.4,
  touch: 35.3,
  rascIn: 34.2,
  rascMark: 36.1,
  rascOut: 37.8,
  recenter: [37.7, 38.7],
  sheets: [38.3, 39.3, 40.3, 41.2],
  sheetDraw: [[38.9, 40.1], [39.8, 40.9], [40.8, 41.9], [41.7, 42.6]],
  crossOut: [42.7, 43.1],
  sheet2Out: 43.25,
  sheet5: 43.5,
  sheet5Draw: [44.0, 44.9],
  shiftRight: [44.4, 45.3],
  exploraIn: 45.0,
  exploraMark: 46.3,
  exploraOut: 48.4,

  // Fecho
  unravel: [48.3, 50.9],
  coverReveal: [49.9, 51.5],
  titles: [51.7, 52.25, 52.65, 53.35],
  endSheet: 55.6,
  emblem: 56.6,
  endText: 57.0,
  route: [58.1, 60.1],
  end: 61.5,
};

// Acordes do fecho (usados pelo áudio). O último não resolve: termina aberto.
export const CHORDS = [
  { t: 38.3, notes: ['D3', 'A3', 'E4', 'F#4', 'C#5'] },
  { t: 41.2, notes: ['B2', 'F#3', 'D4', 'E4', 'A4'] },
  { t: 44.0, notes: ['G2', 'D3', 'F#4', 'A4', 'C#5'] },
  { t: 46.3, notes: ['E2', 'B2', 'D4', 'F#4', 'G4'] },
  { t: 49.9, notes: ['D3', 'A3', 'E4', 'F#4', 'B4'] },
  { t: 52.25, notes: ['B2', 'F#3', 'A3', 'D4', 'E4'] },
  { t: 56.6, notes: ['A2', 'E3', 'G3', 'B3', 'D4', 'F#4'] },
];
