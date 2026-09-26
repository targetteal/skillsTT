// PARTITURA: a única fonte de tempos do filme. scene.js e audio.mjs importam
// daqui. Se um gesto visual existe, o seu tempo mora aqui — e o som dele
// também é agendado a partir daqui. Nunca escreva um tempo "solto" na cena.
//
// Este arquivo é o do vídeo de demonstração (~14 s). Substitua pelos tempos
// do seu roteiro (references/roteiro.md mostra como chegar neles).

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION = 14.5;

export const T = {
  dotIn: 0.4,
  box: [0.8, 2.4],          // o quadrado técnico se desenha em volta do ponto
  text1In: 1.2, text1Mark: 2.3, text1Out: 4.6,
  pull: [3.4, 5.4],         // recuo de câmera: eram muitas caixas
  stamp: 5.6, peel: 6.9,
  touch: 7.3,               // o lápis encosta; o traço técnico vira rascunho
  sheet: 8.0, sheetDraw: [8.6, 9.6],
  text2In: 8.2, text2Mark: 9.4, text2Out: 10.4,
  morph: [10.5, 12.0],      // as linhas viram uma faixa
  endIn: 12.6,
  end: 14.5,
};

// Acordes (usados pelo áudio). Notação científica: 'D3', 'F#4'...
export const CHORDS = [
  { t: 8.0, notes: ['D3', 'A3', 'E4', 'F#4'] },
  { t: 10.5, notes: ['B2', 'F#3', 'D4', 'A4'] },
  { t: 12.6, notes: ['G2', 'D3', 'B3', 'E4', 'A4'] },
];
