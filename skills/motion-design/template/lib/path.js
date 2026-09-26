// Caminhos e traços. Um caminho é uma polilinha com comprimentos acumulados,
// o que permite desenhar "até a fração f" (o traço que se desenha sozinho)
// e achar ponto + normal em qualquer distância (tremor de lápis, cabeça do traço).

import { clamp, noise1 } from './core.js';

export function mkPath(pts) {
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, L, len: L[L.length - 1] };
}

// [x, y, nx, ny] à distância d do início. Extrapola além das pontas.
export function pointAt(P, d) {
  const { pts, L } = P;
  let i;
  if (d <= 0) i = 1;
  else if (d >= P.len) i = pts.length - 1;
  else { let lo = 1, hi = pts.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (L[m] < d) lo = m + 1; else hi = m; } i = lo; }
  const a = pts[i - 1], b = pts[i];
  const seg = L[i] - L[i - 1] || 1e-6;
  const f = (d - L[i - 1]) / seg;
  const dx = (b[0] - a[0]) / seg, dy = (b[1] - a[1]) / seg;
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, -dy, dx];
}

export function resample(P, n) { const out = []; for (let i = 0; i < n; i++) { const q = pointAt(P, (P.len * i) / (n - 1)); out.push([q[0], q[1]]); } return out; }

// Curva suave passando por todos os pontos (Catmull-Rom). Ótima para perfis,
// rotas e qualquer forma "desenhada à mão" a partir de poucos pontos.
export function catmull(points, per = 10) {
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  out.push(points[points.length - 1]);
  return out;
}
export const circlePts = (x, y, r, n = 48, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [x + Math.cos(a) * r, y + Math.sin(a) * r]; });
export const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
export const arrowHead = (x, y, ang, s = 26) => [[[x, y], [x - Math.cos(ang - 0.5) * s, y - Math.sin(ang - 0.5) * s]], [[x, y], [x - Math.cos(ang + 0.5) * s, y - Math.sin(ang + 0.5) * s]]];

// Desenha um caminho.
//   frac       fração desenhada (0..1): anime isto para o traço se desenhar
//   amp        tremor em px ao longo da normal (0 = traço técnico, exato)
//   ampFn      (x, y) => amp; tremor que varia no espaço (ex.: contágio a partir de um ponto)
//   boil       inteiro que muda ~12 vezes por segundo: faz o tremor "ferver"
//   passes     2 = traço duplo levemente desencontrado (lápis)
//   overshoot  px além das pontas (esboço de arquiteto)
//   dash, dashOffset, width, color, alpha, cap, seed, step
export function stroke(ctx, P, o = {}) {
  const frac = clamp(o.frac ?? 1);
  const end = P.len * frac;
  if (end <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= o.alpha ?? 1;
  ctx.strokeStyle = o.color || '#1E1E1E';
  ctx.lineWidth = o.width || 2;
  ctx.lineCap = o.cap || 'round';
  ctx.lineJoin = 'round';
  if (o.dash) { ctx.setLineDash(o.dash); ctx.lineDashOffset = o.dashOffset || 0; }
  const jittery = (o.amp || 0) > 0.01 || o.ampFn;
  const passes = jittery ? o.passes || 1 : 1;
  for (let p = 0; p < passes; p++) {
    ctx.beginPath();
    if (!jittery) {
      ctx.moveTo(P.pts[0][0], P.pts[0][1]);
      let i = 1;
      while (i < P.pts.length && P.L[i] <= end) { ctx.lineTo(P.pts[i][0], P.pts[i][1]); i++; }
      if (i < P.pts.length) { const q = pointAt(P, end); ctx.lineTo(q[0], q[1]); }
    } else {
      const step = o.step || 9;
      const os = frac >= 1 ? o.overshoot || 0 : 0;
      const start = -(o.overshoot || 0), stop = end + os;
      const seed = (o.seed || 0) * 7.77 + p * 31.3 + (o.boil || 0) * 5.13;
      for (let d = start, first = true; ; d += step) {
        const dd = Math.min(d, stop);
        const q = pointAt(P, dd);
        const a = o.ampFn ? o.ampFn(q[0], q[1]) : o.amp;
        const n = noise1(dd * 0.012 + seed) * 0.8 + noise1(dd * 0.07 + seed * 1.3) * 0.2;
        const x = q[0] + q[2] * a * n, y = q[1] + q[3] * a * n;
        if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
        if (dd >= stop) break;
      }
    }
    ctx.stroke();
  }
  ctx.restore();
}

// Desenha vários caminhos em sequência, como uma única mão: a fração global
// p (0..1) é distribuída pelos comprimentos. Devolve a cabeça do traço [x, y]
// (ou null) para você desenhar a ponta do lápis ali.
export function strokeSequence(ctx, paths, p, style) {
  const total = paths.reduce((a, q) => a + q.len, 0);
  const dp = clamp(p) * total;
  let acc = 0, head = null;
  paths.forEach((q, i) => {
    const f = clamp((dp - acc) / q.len); acc += q.len;
    if (f <= 0) return;
    stroke(ctx, q, { ...style, frac: f, seed: (style.seed || 0) + i * 1.7 });
    if (f < 1) head = pointAt(q, q.len * f);
  });
  return head;
}

// Objeto de torno (vaso, copo, garrafa, lâmpada, peão...): você dá METADE do
// perfil, de cima para baixo, como [raio, y] — e recebe a silhueta fechada,
// espelhada em torno de x = cx. Deforme o perfil (some ruído ao raio) para
// "entortar" a peça. Desenhe com stroke() e/ou preencha com ctx.fill(path2d(...)).
//   const perfil = [[60, -200], [70, -170], [150, -60], [160, 40], [110, 160], [80, 200]];
//   const P = mkPath(lathe(perfil, 0, 0));
export function lathe(profile, cx = 0, cy = 0, per = 8) {
  const side = catmull(profile.map(([r, y]) => [cx + r, cy + y]), per);
  const other = side.map(([x, y]) => [2 * cx - x, y]).reverse();
  return [...side, ...other, side[0]];
}
// Converte pontos em Path2D para preencher (ctx.fill(path2d(pts))).
export function path2d(pts) { const p = new Path2D(); pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath(); return p; }
