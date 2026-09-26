// Matemática de animação. Tudo aqui é função pura: mesmo t, mesmo resultado.

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;

// Progresso normalizado de t entre a e b (0 antes, 1 depois). É o tijolo de
// toda a animação: prog(t, 3, 4) vai de 0 a 1 entre os segundos 3 e 4.
export const prog = (t, a, b) => clamp((t - a) / (b - a));

// Curvas de aceleração. Regra prática:
//   entrada de algo na tela → out3 / outExpo (chega rápido e assenta)
//   saída → in3 (sai acelerando)
//   deslocamento de câmera ou de objeto que já está na tela → io
//   traço sendo desenhado → sine (mão constante, sem tranco)
export const E = {
  lin: (x) => x,
  io: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  out3: (x) => 1 - Math.pow(1 - x, 3),
  in2: (x) => x * x,
  in3: (x) => x * x * x,
  outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  sine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
  outBack: (x) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
};

// Mola amortecida em forma fechada. x = segundos desde o gatilho.
// zeta < 1 passa do ponto e volta (vivo); zeta ~0.7 quase não oscila (sóbrio).
// omega maior = mais rápido. Use para coisas que "chegam" com peso físico.
export function spring(x, zeta = 0.5, omega = 13) {
  if (x <= 0) return 0;
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * omega * x) * (Math.cos(wd * x) + ((zeta * omega) / wd) * Math.sin(wd * x));
}

export function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

// Ruído suave 1D em [-1, 1]. Serve para tremor de traço, deriva de posição etc.
export function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }

// Gerador pseudoaleatório com semente: use em vez de Math.random(), sempre.
// Math.random() quebra o determinismo e o render em paralelo sai tremido.
export function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp(pa >> 16, pb >> 16, t)), g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t)), bl = Math.round(lerp(pa & 255, pb & 255, t));
  return `rgb(${r},${g},${bl})`;
}

export function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
