// Planta ≠ Mapa — vídeo-convite da Temporada 0 do Clube dos Agentes de Mudança.
// Tudo o que aparece na tela é desenhado aqui, quadro a quadro, a partir do
// tempo t. Nenhum estado sobrevive entre quadros: renderFrame(t) é uma função
// pura do tempo, o que permite renderizar em paralelo e com motion blur real.

import { T, WIDTH as W, HEIGHT as H } from './timeline.mjs';

const C = {
  paper: '#F2EFEB', ink: '#1E1E1E', teal: '#256675', mid: '#4B8C99', light: '#7AB5BC',
  graphite: '#34373a',
};

// ───────────────────────── matemática ─────────────────────────
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  io: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  out3: (x) => 1 - Math.pow(1 - x, 3),
  in3: (x) => x * x * x,
  in2: (x) => x * x,
  outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  sine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
  outBack: (x) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
};
// Mola amortecida em forma fechada: x = segundos desde o gatilho.
function spring(x, zeta = 0.5, omega = 13) {
  if (x <= 0) return 0;
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * omega * x) * (Math.cos(wd * x) + ((zeta * omega) / wd) * Math.sin(wd * x));
}
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp(pa >> 16, pb >> 16, t)), g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t)), bl = Math.round(lerp(pa & 255, pb & 255, t));
  return `rgb(${r},${g},${bl})`;
}

// ───────────────────────── caminhos ─────────────────────────
function mkPath(pts) {
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, L, len: L[L.length - 1] };
}
// Ponto, e normal unitária, à distância d do início (extrapola nas pontas).
function pointAt(P, d) {
  const { pts, L } = P;
  let i = 1;
  if (d <= 0) i = 1;
  else if (d >= P.len) i = pts.length - 1;
  else { let lo = 1, hi = pts.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (L[m] < d) lo = m + 1; else hi = m; } i = lo; }
  const a = pts[i - 1], b = pts[i];
  const seg = L[i] - L[i - 1] || 1e-6;
  const f = (d - L[i - 1]) / seg;
  const dx = (b[0] - a[0]) / seg, dy = (b[1] - a[1]) / seg;
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, -dy, dx];
}
function resample(P, n) { const out = []; for (let i = 0; i < n; i++) { const q = pointAt(P, (P.len * i) / (n - 1)); out.push([q[0], q[1]]); } return out; }
function catmull(points, per = 10) {
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
const circlePts = (x, y, r, n = 48, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [x + Math.cos(a) * r, y + Math.sin(a) * r]; });
const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];

// Traço: técnico (amp = 0, exato) ou lápis (ruído ao longo da normal, que
// "ferve" a 12 quadros por segundo, como animação desenhada à mão).
function stroke(ctx, P, o) {
  const frac = clamp(o.frac ?? 1);
  const end = P.len * frac;
  if (end <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= o.alpha ?? 1;
  ctx.strokeStyle = o.color || C.ink;
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

// ───────────────────────── recursos ─────────────────────────
const IMG = {};
let paperTex, grainTex, hatchPattern, coverClean, coverBg, STAMPS;

function loadImage(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
async function loadFonts() {
  const faces = [
    new FontFace('Anton', 'url(node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2)'),
    new FontFace('Roboto', 'url(node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff2)', { weight: '400' }),
    new FontFace('Roboto', 'url(node_modules/@fontsource/roboto/files/roboto-latin-700-normal.woff2)', { weight: '700' }),
  ];
  for (const f of faces) { await f.load(); document.fonts.add(f); }
}
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

function makePaper() {
  const c = canvas(W + 160, H + 160), g = c.getContext('2d');
  g.fillStyle = C.paper; g.fillRect(0, 0, c.width, c.height);
  const id = g.getImageData(0, 0, c.width, c.height), d = id.data, r = rng(11);
  for (let i = 0; i < d.length; i += 4) { const v = (r() - 0.5) * 7; d[i] += v; d[i + 1] += v; d[i + 2] += v * 0.9; }
  g.putImageData(id, 0, 0);
  g.lineCap = 'round';
  for (let i = 0; i < 2600; i++) {
    const x = r() * c.width, y = r() * c.height, a = r() * Math.PI * 2, l = 6 + r() * 26;
    g.strokeStyle = `rgba(40,36,30,${0.02 + r() * 0.035})`; g.lineWidth = 0.6 + r() * 0.8;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.6, y + Math.sin(a + 0.6) * l * 0.6, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  return c;
}
function makeGrain() {
  const c = canvas(W + 160, H + 160), g = c.getContext('2d');
  const id = g.createImageData(c.width, c.height), d = id.data, r = rng(23);
  for (let i = 0; i < d.length; i += 4) { const v = 255 - Math.pow(r(), 6) * 70; d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255; }
  g.putImageData(id, 0, 0);
  return c;
}
function makeHatch(ctx) {
  const c = canvas(12, 12), g = c.getContext('2d');
  g.strokeStyle = C.ink; g.lineWidth = 1.3;
  for (const o of [-12, 0, 12]) { g.beginPath(); g.moveTo(o, 12); g.lineTo(o + 12, 0); g.stroke(); }
  return ctx.createPattern(c, 'repeat');
}

// Carimbos: texto em Anton dentro de moldura dupla, com falhas de tinta.
function makeStamp(text, color, seed) {
  const size = 62, pad = 30, probe = canvas(10, 10).getContext('2d');
  probe.font = `${size}px Anton`;
  const tw = probe.measureText(text).width, cap = probe.measureText('H').actualBoundingBoxAscent;
  const w = Math.ceil(tw + pad * 2), h = Math.ceil(cap + pad * 2);
  const c = canvas(w, h), g = c.getContext('2d');
  g.strokeStyle = color; g.fillStyle = color;
  g.lineWidth = 7; g.strokeRect(5, 5, w - 10, h - 10);
  g.lineWidth = 2; g.strokeRect(15, 15, w - 30, h - 30);
  g.font = `${size}px Anton`; g.textBaseline = 'alphabetic'; g.fillText(text, pad, pad + cap);
  const r = rng(seed);
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 900; i++) { g.globalAlpha = 0.4 + r() * 0.6; g.beginPath(); g.arc(r() * w, r() * h, 0.4 + Math.pow(r(), 3) * 3.2, 0, 7); g.fill(); }
  for (let i = 0; i < 14; i++) { g.globalAlpha = 0.25 + r() * 0.4; g.lineWidth = 0.6 + r() * 1.6; const y = r() * h; g.beginPath(); g.moveTo(r() * w * 0.4, y); g.lineTo(w * (0.5 + r() * 0.5), y + (r() - 0.5) * 4); g.stroke(); }
  for (let i = 0; i < 6; i++) { g.globalAlpha = 0.18; g.beginPath(); g.arc(r() * w, r() * h, 20 + r() * 50, 0, 7); g.fill(); }
  return { c, w, h };
}

// Capa: remove as linhas de título (serão reveladas uma a uma) e guarda as
// fatias originais para a animação tipográfica.
const COVER_SCALE = W / 1672;
const TITLE_ROWS = [
  { poly: [[85, 486], [605, 486], [605, 542], [85, 542]] },                                   // CLUBE DOS AGENTES DE MUDANÇA
  { poly: [[85, 542], [380, 542], [380, 561], [85, 561]], wipe: true },                       // sublinhado teal
  { poly: [[85, 561], [742, 561], [742, 692], [85, 692]] },                                   // SAÚDE MENTAL
  { poly: [[85, 692], [952, 692], [952, 829], [85, 829]] },                                   // NAS ORGANIZAÇÕES
  { poly: [[85, 829], [312, 829], [312, 874], [85, 874]] },                                   // TEMPORADA 0
];
function makeCoverClean() {
  const c = canvas(W, H), g = c.getContext('2d');
  g.drawImage(IMG.cover, 0, 0, W, H);
  // cor média do papel numa área limpa da capa
  const s = g.getImageData(Math.round(60 * COVER_SCALE), Math.round(900 * COVER_SCALE), 200, 20).data;
  let r = 0, gg = 0, b = 0; for (let i = 0; i < s.length; i += 4) { r += s[i]; gg += s[i + 1]; b += s[i + 2]; }
  const n = s.length / 4;
  coverBg = `rgb(${Math.round(r / n)},${Math.round(gg / n)},${Math.round(b / n)})`;
  g.fillStyle = coverBg;
  for (const row of TITLE_ROWS) { g.beginPath(); row.poly.forEach(([x, y], i) => (i ? g.lineTo(x * COVER_SCALE, y * COVER_SCALE) : g.moveTo(x * COVER_SCALE, y * COVER_SCALE))); g.closePath(); g.fill(); }
  return c;
}

// ───────────────────────── câmera ─────────────────────────
const P = { x: 120, y: -150 }; // centro da planta no mundo
const planAt = (s, sx, sy = 540) => ({ cx: P.x - (sx - 960) / s, cy: P.y - (sy - 540) / s, s });
const HEADVIEW = { cx: -860, cy: 360, s: 0.4 };
const CAM = [
  { t: 0, ...planAt(0.7, 1360) },
  { t: T.pullStart, ...planAt(0.745, 1360), e: 'lin' },
  { t: T.pullEnd, ...HEADVIEW, e: 'zoom' },
  { t: 19.2, cx: -860, cy: 330, s: 0.43, e: 'io' },
  { t: T.unfreeze, cx: -860, cy: 330, s: 0.43 },
  { t: T.flyEnd, ...planAt(0.72, 1360), e: 'zoom' },
  { t: T.recenter[0], ...planAt(0.73, 1360), e: 'lin' },
  { t: T.recenter[1], ...planAt(0.92, 960, 560), e: 'io' },
  { t: T.shiftRight[0], ...planAt(0.94, 960, 560), e: 'lin' },
  { t: T.shiftRight[1], ...planAt(0.62, 1420), e: 'io' },
  { t: T.unravel[1], ...planAt(0.64, 1420), e: 'lin' },
];
function camera(t) {
  if (t <= CAM[0].t) return CAM[0];
  for (let i = 1; i < CAM.length; i++) {
    const a = CAM[i - 1], b = CAM[i];
    if (t <= b.t) {
      const x = prog(t, a.t, b.t);
      if (b.e === 'lin') return { cx: lerp(a.cx, b.cx, x), cy: lerp(a.cy, b.cy, x), s: lerp(a.s, b.s, x) };
      const k = E.io(x);
      if (b.e === 'zoom') {
        // zoom em espaço logarítmico, com o foco acompanhando a escala
        const s = Math.exp(lerp(Math.log(a.s), Math.log(b.s), k));
        const w = (1 / s - 1 / a.s) / (1 / b.s - 1 / a.s || 1);
        return { cx: lerp(a.cx, b.cx, w), cy: lerp(a.cy, b.cy, w), s };
      }
      return { cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), s: lerp(a.s, b.s, k) };
    }
  }
  return CAM[CAM.length - 1];
}
const toScreen = (cam, x, y) => [(x - cam.cx) * cam.s + 960, (y - cam.cy) * cam.s + 540];

function shake(t) {
  let x = 0, y = 0;
  const hits = [...T.stamps.map((h, i) => [h, 13, i]), [T.emblem, 6, 9]];
  for (const [h, a, i] of hits) {
    const d = t - h; if (d < 0 || d > 0.8) continue;
    const k = a * Math.exp(-d * 9);
    x += k * Math.sin(d * 44 + i * 2.1); y += k * Math.cos(d * 37 + i * 1.3);
  }
  return [x, y];
}

// ───────────────────────── planta ─────────────────────────
// Coordenadas locais da planta (centro em 0,0), em "centímetros" de desenho.
const PLAN = (() => {
  const walls = [], doors = [], furn = [];
  const seq = (list, t0, speed, th, kind) => {
    let t = t0;
    for (const [a, b] of list) { const d = Math.hypot(b[0] - a[0], b[1] - a[1]) / speed; walls.push({ a, b, th, t0: t, t1: t + d, kind }); t += d; }
    return t;
  };
  // paredes externas, desenhadas num único gesto contínuo
  seq([
    [[-550, -330], [550, -330]], [[550, -330], [550, -150]], [[550, -30], [550, 60]], [[550, 180], [550, 330]],
    [[550, 330], [-260, 330]], [[-360, 330], [-550, 330]], [[-550, 330], [-550, -330]],
  ], T.outer[0], 2300, 16, 'outer');
  // divisórias internas
  const inner = [
    [[-200, -330], [-200, -240]], [[-200, -150], [-200, -60]], [[-550, -60], [-290, -60]],
    [[-550, 120], [-300, 120]], [[-300, 120], [-300, 180]], [[-300, 270], [-300, 330]],
  ];
  inner.forEach(([a, b], i) => { const t0 = T.inner[i]; walls.push({ a, b, th: 8, t0, t1: t0 + 0.34, kind: 'inner' }); });
  // portas: dobradiça, ângulo fechado, ângulo aberto, folha
  const D = Math.PI / 2;
  doors.push({ h: [-360, 330], a0: 0, a1: -D, L: 100, tA: 2.3, tC: T.doorClose[0], th: 16 });
  doors.push({ h: [-290, -60], a0: 0, a1: D, L: 90, tA: T.inner[2] + 0.2, tC: T.doorClose[1], th: 8 });
  doors.push({ h: [-300, 270], a0: -D, a1: 0, L: 90, tA: T.inner[5] + 0.2, tC: T.doorClose[2], th: 8 });
  doors.push({ h: [-200, -150], a0: -D, a1: 0, L: 90, tA: T.inner[1] + 0.2, tC: T.doorClose[3], th: 8 });
  // cubículos: tudo, menos a célula da pessoa
  const cub = [
    [[-60, -330], [-60, 330]], [[110, -330], [110, -130]], [[290, -330], [290, -130]], [[110, 50], [110, 330]],
    [[290, 50], [290, 330]], [[-60, -130], [110, -130]], [[290, -130], [550, -130]], [[-60, 50], [110, 50]], [[290, 50], [550, 50]],
  ];
  cub.forEach(([a, b], i) => { const t0 = T.cubicles[i]; walls.push({ a, b, th: 6, t0, t1: t0 + 0.22, kind: 'cub' }); });
  const cell = [[[110, -130], [290, -130]], [[290, -130], [290, 50]], [[290, 50], [110, 50]], [[110, 50], [110, -130]]];
  cell.forEach(([a, b], i) => { const t0 = T.cellClose[i]; walls.push({ a, b, th: 9, t0, t1: t0 + 0.13, kind: 'cell' }); });
  // mobiliário
  let ft = T.furniture;
  const add = (pts, dt = 0.05) => { furn.push({ P: mkPath(pts), t0: ft }); ft += dt; };
  add(rectPts(-470, -250, 190, 110));
  for (const [x, y] of [[-430, -270], [-375, -270], [-320, -270], [-430, -120], [-375, -120], [-320, -120]]) add(circlePts(x, y, 13, 20), 0.02);
  for (const cx of [25, 200, 420]) for (const rc of [-230, -40, 190]) { add(rectPts(cx - 55, rc - 50, 110, 46), 0.03); add(circlePts(cx, rc + 26, 14, 20), 0.02); }
  add(rectPts(-540, 130, 50, 190)); add(circlePts(-515, 220, 14, 20)); add(rectPts(-440, 260, 100, 56));
  return { walls, doors, furn };
})();
const CELL = { x0: 110, x1: 290, y0: -130, y1: 50 };
const TOUCH = [470, 250]; // onde o lápis encosta na planta (local)

function morphAt(t, x, y) {
  if (t < T.touch) return 0;
  return clamp(((t - T.touch) * 1150 - Math.hypot(x - TOUCH[0], y - TOUCH[1])) / 320);
}
const morphAll = (t) => E.io(prog(t, T.touch, T.touch + 1.55));

function drawWall(ctx, w, t, boil) {
  const raw = prog(t, w.t0, w.t1);
  if (raw <= 0) return;
  const p = w.kind === 'cell' ? E.outExpo(raw) : E.sine(raw);
  const [ax, ay] = w.a, [bx, by] = w.b;
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux, h = w.th / 2;
  const sx = ax - ux * h, sy = ay - uy * h, ex = ax + dx * p + ux * h * p, ey = ay + dy * p + uy * h * p;
  const m = morphAt(t, (ax + bx) / 2, (ay + by) / 2);
  const poly = [[sx + nx * h, sy + ny * h], [ex + nx * h, ey + ny * h], [ex - nx * h, ey - ny * h], [sx - nx * h, sy - ny * h]];
  ctx.save();
  ctx.globalAlpha *= 1 - 0.82 * m;
  ctx.fillStyle = w.kind === 'outer' || w.kind === 'cell' || w.kind === 'door' ? C.ink : hatchPattern;
  ctx.beginPath(); poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill();
  ctx.restore();
  const col = m > 0 ? mixHex(C.ink, C.graphite, m) : C.ink;
  const o = { width: 2.2 + m * 0.8, color: col, amp: 5.5 * m, overshoot: 14 * m, passes: m > 0.02 ? 2 : 1, seed: w.a[0] * 0.01 + w.a[1] * 0.013, boil, alpha: 1 - 0.15 * m };
  stroke(ctx, mkPath([poly[0], poly[1]]), o);
  stroke(ctx, mkPath([poly[3], poly[2]]), { ...o, seed: o.seed + 3 });
  if (m < 0.02) { stroke(ctx, mkPath([poly[1], poly[2]]), o); stroke(ctx, mkPath([poly[0], poly[3]]), o); }
}

function drawDoor(ctx, d, t, boil) {
  const a = prog(t, d.tA, d.tA + 0.35);
  if (a <= 0) return;
  const c = E.in3(prog(t, d.tC, d.tC + 0.3));
  const ang = lerp(d.a1, d.a0, c);
  const m = morphAt(t, d.h[0], d.h[1]);
  ctx.save(); ctx.globalAlpha *= a;
  const tip = [d.h[0] + Math.cos(ang) * d.L, d.h[1] + Math.sin(ang) * d.L];
  if (c < 1) {
    stroke(ctx, mkPath([d.h, tip]), { width: 3, color: C.ink, amp: 3 * m, boil, seed: d.h[0] });
    const arc = circlePts(d.h[0], d.h[1], d.L, 18, ang, d.a0);
    stroke(ctx, mkPath(arc), { width: 1.4, color: C.ink, alpha: 0.7, amp: 3 * m, boil, seed: d.h[1] });
  }
  ctx.restore();
  if (c >= 1) {
    const b = [d.h[0] + Math.cos(d.a0) * d.L, d.h[1] + Math.sin(d.a0) * d.L];
    drawWall(ctx, { a: d.h, b, th: d.th, t0: d.tC + 0.3, t1: d.tC + 0.36, kind: 'door' }, t, boil);
  }
}

function dotLocal(t) {
  const n = (k, s) => noise1(t * s + k);
  const close = E.io(prog(t, 7.4, 10.25));
  const b0 = { x0: -30, x1: 530, y0: -300, y1: 310 };
  const b1 = { x0: CELL.x0 + 26, x1: CELL.x1 - 26, y0: CELL.y0 + 26, y1: CELL.y1 - 26 };
  const bx0 = lerp(b0.x0, b1.x0, close), bx1 = lerp(b0.x1, b1.x1, close), by0 = lerp(b0.y0, b1.y0, close), by1 = lerp(b0.y1, b1.y1, close);
  const speed = lerp(0.28, 0.9, close);
  let x = lerp(bx0, bx1, 0.5 + 0.48 * n(3.1, speed)), y = lerp(by0, by1, 0.5 + 0.48 * n(8.7, speed * 1.1));
  // Ato III: a pessoa vai até a porta rascunhada e esbarra na parede real.
  const go = E.io(prog(t, 40.3, 41.5));
  if (go > 0) {
    x = lerp(x, 200, go); y = lerp(y, CELL.y1 - 17, go);
    const hit = t - 41.5; if (hit > 0) y -= 9 * Math.exp(-hit * 5) * Math.abs(Math.sin(hit * 11));
  }
  return [x, y];
}

// Perfil da cabeça, no mesmo traço técnico da planta.
const HEAD = mkPath(catmull([
  [540, 1620], [520, 1260], [540, 960], [640, 720], [830, 440], [900, 120], [870, -220], [730, -520], [470, -740], [130, -840],
  [-220, -790], [-480, -610], [-615, -370], [-665, -120], [-690, 50], [-676, 140], [-712, 232], [-800, 372], [-884, 492],
  [-858, 540], [-774, 566], [-752, 626], [-790, 676], [-766, 712], [-742, 730], [-786, 772], [-762, 826], [-722, 862],
  [-748, 938], [-722, 1006], [-630, 1052], [-470, 1070], [-330, 1110], [-280, 1260], [-270, 1620], [-268, 2100],
], 9));
const EYE = mkPath(catmull([[-628, 176], [-590, 196], [-548, 198], [-512, 186]], 8));
const LASHES = [[-600, 193, -608, 218], [-578, 198, -582, 224], [-556, 198, -556, 224], [-534, 194, -530, 219]];

function drawWorld(ctx, t, cam, boil) {
  const M = morphAll(t);
  ctx.save();
  // cabeça (no mundo)
  const hp = E.sine(prog(t, T.headDraw[0], T.headDraw[1]));
  if (hp > 0) {
    const ha = 1 - prog(t, 33.2, 34.2);
    stroke(ctx, HEAD, { frac: hp, width: 6.5, color: C.ink, alpha: ha });
    const ep = prog(t, 14.2, 14.9);
    stroke(ctx, EYE, { frac: E.out3(ep), width: 5, color: C.ink, alpha: ha });
    LASHES.forEach(([x0, y0, x1, y1], i) => stroke(ctx, mkPath([[x0, y0], [x1, y1]]), { frac: E.out3(prog(t, 14.6 + i * 0.05, 14.8 + i * 0.05)), width: 3.2, color: C.ink, alpha: ha }));
  }
  ctx.translate(P.x, P.y);
  // cotas
  const dimA = clamp(prog(t, T.dims, T.dims + 0.6) - prog(t, T.pullStart, T.pullStart + 0.7) + prog(t, 33.0, 33.8) - M * 1.2);
  if (dimA > 0) {
    ctx.save(); ctx.globalAlpha *= dimA * 0.6;
    const dp = E.out3(prog(t, T.dims, T.dims + 0.6));
    stroke(ctx, mkPath([[-550, -395], [550, -395]]), { frac: dp, width: 1.4 });
    stroke(ctx, mkPath([[-615, 330], [-615, -330]]), { frac: dp, width: 1.4 });
    for (const [x, y] of [[-550, -395], [550, -395], [-615, 330], [-615, -330]]) stroke(ctx, mkPath([[x - 9, y + 9], [x + 9, y - 9]]), { width: 2 });
    for (const x of [-550, 550]) stroke(ctx, mkPath([[x, -350], [x, -410]]), { width: 1 });
    for (const y of [-330, 330]) stroke(ctx, mkPath([[-570, y], [-630, y]]), { width: 1 });
    ctx.fillStyle = C.ink; ctx.font = '400 26px Roboto'; ctx.textAlign = 'center';
    ctx.fillText('11,00', 0, -408);
    ctx.save(); ctx.translate(-630, 0); ctx.rotate(-Math.PI / 2); ctx.fillText('6,60', 0, 0); ctx.restore();
    ctx.restore();
  }
  // mobiliário
  for (const f of PLAN.furn) {
    const p = prog(t, f.t0, f.t0 + 0.3);
    if (p <= 0) continue;
    const m = morphAt(t, f.P.pts[0][0], f.P.pts[0][1]);
    stroke(ctx, f.P, { frac: E.out3(p), width: 1.7, color: C.ink, alpha: 0.75, amp: 3.2 * m, boil, seed: f.P.pts[0][0] * 0.03, step: 7 });
  }
  // rótulos
  const la = prog(t, T.furniture + 0.2, T.furniture + 0.8) * (1 - 0.6 * M);
  if (la > 0) {
    ctx.save(); ctx.globalAlpha *= la * 0.6; ctx.fillStyle = C.ink; ctx.font = '700 22px Roboto'; ctx.letterSpacing = '5px'; ctx.textAlign = 'left';
    ctx.fillText('REUNIÃO', -530, -85); ctx.fillText('COPA', -470, 305); ctx.fillText('OPEN SPACE', -40, 312);
    ctx.restore();
  }
  for (const w of PLAN.walls) drawWall(ctx, w, t, boil);
  for (const d of PLAN.doors) drawDoor(ctx, d, t, boil);
  // marca do lápis
  const mk = prog(t, T.touch, T.touch + 0.6);
  if (mk > 0) stroke(ctx, mkPath(catmull([[470, 250], [455, 226], [470, 205], [448, 184], [430, 190]], 6)), { frac: E.out3(mk), width: 4, color: C.graphite, amp: 2, boil, passes: 2, alpha: 0.85 });
  // a pessoa
  const da = spring(t - T.dotIn, 0.35, 16) * (1 - prog(t, T.unravel[0], T.unravel[0] + 0.4));
  if (da > 0) {
    const [x, y] = dotLocal(t);
    ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(x, y, 15 * da, 0, 7); ctx.fill();
  }
  ctx.restore();
}

// ───────────────────────── tipografia ─────────────────────────
// Marcação: *palavra = marcador teal claro por trás; ^palavra = cor teal.
function parse(lines) { return lines.map((l) => l.split(' ').map((w) => ({ mark: w.includes('*'), teal: w.includes('^'), w: w.replace(/[*^]/g, '') }))); }
const TEXTS = [
  { lines: ['A GENTE DESENHA', 'ORGANIZAÇÕES.'], size: 118, tIn: T.text1In, tOut: T.text1Out },
  { lines: ['DEPOIS, ELAS', 'DESENHAM', '*A *GENTE.'], size: 118, tIn: T.text2In, tOut: T.text2Out, mark: T.text2In + 1.3 },
  { lines: ['E SE O PROBLEMA', 'NÃO ESTIVER *SÓ', 'EM VOCÊ?'], size: 158, tIn: T.qIn, tOut: T.qOut, mark: T.qMark, maxW: 1100 },
  { lines: ['QUEM TENTA MUDAR', 'ORGANIZAÇÕES', 'TAMBÉM ^ADOECE', '^NELAS.'], size: 104, tIn: T.adoeceIn, tOut: 32.7, maxW: 760, freeze: true },
  { lines: ['MAS TODA PLANTA', 'JÁ FOI UM', '*RASCUNHO.'], size: 118, tIn: T.rascIn, tOut: T.rascOut, mark: T.rascMark, maxW: 780 },
  { lines: ['A GENTE EXPLORA', 'JUNTO OUTROS', 'DESENHOS', '*POSSÍVEIS.'], size: 112, tIn: T.exploraIn, tOut: T.exploraOut, mark: T.exploraMark, maxW: 800 },
].map((d) => ({ x: 100, stagger: 0.07, ...d, words: parse(d.lines) }));

function layoutText(ctx, d) {
  if (d.layout) return d.layout;
  let size = d.size;
  ctx.font = `${size}px Anton`;
  const widest = Math.max(...d.words.map((ws) => ctx.measureText(ws.map((w) => w.w).join(' ')).width));
  if (d.maxW && widest > d.maxW) size = Math.floor((size * d.maxW) / widest);
  ctx.font = `${size}px Anton`;
  const cap = ctx.measureText('H').actualBoundingBoxAscent, sp = ctx.measureText(' ').width, lh = size * 1.2;
  const y0 = 540 - ((d.words.length - 1) * lh) / 2 + cap / 2;
  const lines = d.words.map((ws, li) => { let x = d.x; return ws.map((w) => { const width = ctx.measureText(w.w).width; const o = { ...w, x, width, y: y0 + li * lh }; x += width + sp; return o; }); });
  return (d.layout = { size, cap, lines });
}

function drawText(ctx, d, t) {
  if (t < d.tIn - 0.1 || t > d.tOut + 1.2) return;
  if (d.freeze && t > T.freeze && t < T.unfreeze) t = T.freeze;
  const { size, cap, lines } = layoutText(ctx, d);
  ctx.save();
  ctx.font = `${size}px Anton`; ctx.textBaseline = 'alphabetic';
  let k = 0;
  lines.forEach((ws) => {
    const y = ws[0].y;
    ctx.save();
    ctx.beginPath(); ctx.rect(d.x - 60, y - size * 1.25, 1900, size * 1.25 + size * 0.32); ctx.clip();
    const anim = ws.map(() => {
      const kk = k++;
      const pin = E.outExpo(prog(t, d.tIn + kk * d.stagger, d.tIn + kk * d.stagger + 0.85));
      const pout = E.in3(prog(t, d.tOut + kk * 0.035, d.tOut + kk * 0.035 + 0.42));
      return (1 - pin) * size * 1.2 - pout * size * 1.6;
    });
    ws.forEach((w, i) => {
      if (!w.mark || d.mark == null) return;
      const mp = E.io(prog(t, d.mark + i * 0.12, d.mark + i * 0.12 + 0.42));
      if (mp <= 0) return;
      const yo = anim[i], nxt = ws[i + 1] && ws[i + 1].mark, x0 = w.x - (i > 0 && ws[i - 1].mark ? 2 : size * 0.06), x1 = x0 + (w.width + (nxt ? ws[i + 1].x - w.x - w.width + 4 : size * 0.14)) * mp;
      const top = y - cap * 0.58 + yo, bot = y + size * 0.07 + yo;
      ctx.fillStyle = C.light; ctx.beginPath();
      ctx.moveTo(x0, top + 3);
      for (let s = 0; s <= 8; s++) { const xx = lerp(x0, x1, s / 8); ctx.lineTo(xx, top + noise1(xx * 0.05 + 3) * 3); }
      ctx.lineTo(x1 + 4, lerp(top, bot, 0.5));
      for (let s = 8; s >= 0; s--) { const xx = lerp(x0, x1, s / 8); ctx.lineTo(xx, bot + noise1(xx * 0.05 + 9) * 3); }
      ctx.closePath(); ctx.fill();
    });
    ws.forEach((w, i) => { ctx.fillStyle = w.teal ? C.teal : C.ink; ctx.fillText(w.w, w.x, y + anim[i]); });
    ctx.restore();
  });
  ctx.restore();
}

// ───────────────────────── carimbos ─────────────────────────
const STAMP_DEFS = [
  { text: 'RESILIÊNCIA', color: C.teal, x: 1230, y: 330, rot: -7 },
  { text: 'MINDFULNESS', color: C.ink, x: 1420, y: 505, rot: 5 },
  { text: 'APP DE MEDITAÇÃO', color: C.teal, x: 1250, y: 665, rot: -3 },
  { text: 'FRUTA NA COPA', color: C.ink, x: 1450, y: 815, rot: 8 },
];
function drawStamps(ctx, t) {
  STAMP_DEFS.forEach((s, i) => {
    const th = T.stamps[i], d = t - th;
    if (d < -0.13) return;
    const tp = T.peel + i * 0.16, dp = t - tp;
    if (dp > 1.0) return;
    let sc, a, rot = s.rot, x = s.x, y = s.y, shadow = 0;
    if (d < 0) { const q = 1 + d / 0.13; sc = lerp(1.45, 1, E.in2(q)); a = q; shadow = (1 - q) * 22; }
    else { sc = 1 - 0.05 * Math.exp(-d * 16) * Math.cos(d * 42); a = 1; }
    if (dp > 0) {
      const lift = E.out3(prog(dp, 0, 0.18)), fly = E.in3(prog(dp, 0.1, 0.85));
      sc *= 1 + 0.06 * lift; shadow = 16 * lift;
      const dir = [[-0.5, -1], [1, -0.4], [-0.7, 0.8], [0.9, 0.9]][i];
      x += dir[0] * fly * 1300; y += dir[1] * fly * 1000; rot += (i % 2 ? 1 : -1) * fly * 45;
    }
    const st = STAMPS[i];
    ctx.save(); ctx.translate(x, y); ctx.rotate((rot * Math.PI) / 180); ctx.scale(sc, sc); ctx.globalAlpha = a;
    if (shadow > 0.5) { ctx.save(); ctx.globalAlpha = 0.1 * a; ctx.fillStyle = C.ink; ctx.fillRect(-st.w / 2 + shadow * 0.5, -st.h / 2 + shadow, st.w, st.h); ctx.restore(); }
    if (dp > 0) { ctx.fillStyle = 'rgba(242,239,235,0.92)'; ctx.fillRect(-st.w / 2, -st.h / 2, st.w, st.h); }
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(st.c, -st.w / 2, -st.h / 2);
    ctx.restore();
  });
}

// ───────────────────────── ciclo de realimentação ─────────────────────────
const LOOP_NODES = ['PRESSÃO', 'URGÊNCIA', 'MENOS PAUSA', 'MAIS ERRO'];
function loopPhase(tt) {
  const d = Math.max(0, tt - T.spin);
  const w0 = 0.9, k = (8.5 - w0) / Math.pow(T.freeze - T.spin, 2);
  return { phi: -Math.PI / 3 + w0 * d + (k * d * d * d) / 3, omega: w0 + k * d * d };
}
function drawLoop(ctx, t) {
  if (t < T.loopDraw[0] || t > 33.3) return;
  const tt = Math.min(t, T.freeze);
  const alpha = 1 - prog(t, T.unfreeze, T.unfreeze + 0.5);
  const cx = lerp(960, 1390, E.io(prog(tt, T.loopShift, T.loopShift + 0.9))), cy = 560;
  const R = 270 - 26 * E.in2(prog(tt, T.spin, T.freeze));
  const { phi, omega } = loopPhase(tt);
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.font = '700 30px Roboto'; ctx.letterSpacing = '3px';
  const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
  const boxes = LOOP_NODES.map((n) => ({ w: ctx.measureText(n).width + 34, h: 54 }));
  const gaps = angles.map((a, i) => (i % 2 === 0 ? Math.asin(Math.min(0.95, boxes[i].w / 2 / R)) : Math.asin(Math.min(0.95, boxes[i].h / 2 / R))) + 0.06);
  const span = T.loopDraw[1] - T.loopDraw[0];
  // arcos com seta e polaridade
  for (let i = 0; i < 4; i++) {
    const a0 = angles[i] + gaps[i], a1 = angles[(i + 1) % 4] + (i === 3 ? Math.PI * 2 : 0) - gaps[(i + 1) % 4];
    const p = E.io(prog(tt, T.loopDraw[0] + (i * span) / 4.6, T.loopDraw[0] + ((i + 1) * span) / 4.6));
    if (p <= 0) continue;
    const ae = lerp(a0, a1, p);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, R, a0, ae); ctx.stroke();
    if (p > 0.98) {
      const hx = cx + Math.cos(a1) * R, hy = cy + Math.sin(a1) * R, tx = -Math.sin(a1), ty = Math.cos(a1);
      ctx.fillStyle = C.ink; ctx.beginPath();
      ctx.moveTo(hx + tx * 6, hy + ty * 6); ctx.lineTo(hx - tx * 20 + Math.cos(a1) * 11, hy - ty * 20 + Math.sin(a1) * 11); ctx.lineTo(hx - tx * 20 - Math.cos(a1) * 11, hy - ty * 20 - Math.sin(a1) * 11); ctx.closePath(); ctx.fill();
      const pa = a1 - 0.2;
      ctx.font = '700 30px Roboto'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('+', cx + Math.cos(pa) * (R + 30), cy + Math.sin(pa) * (R + 30));
    }
  }
  // fluxo tracejado
  const fa = prog(tt, T.spin, T.spin + 0.6);
  if (fa > 0) {
    const d = Math.max(0, tt - T.spin), w0 = 0.9, k = (8.5 - w0) / Math.pow(T.freeze - T.spin, 2);
    const flow = (w0 * d + (k * d * d * d) / 3) * R;
    ctx.save(); ctx.globalAlpha *= fa * 0.9; ctx.strokeStyle = C.mid; ctx.lineWidth = 3.5; ctx.setLineDash([2, 24]); ctx.lineDashOffset = -flow;
    ctx.beginPath(); ctx.arc(cx, cy, R - 16, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  // nós
  LOOP_NODES.forEach((n, i) => {
    const pa = spring(tt - (T.loopDraw[0] + (i * span) / 4.6), 0.45, 15);
    if (pa <= 0) return;
    const a = angles[i];
    let dist = Math.abs(((((phi - a) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    const pulse = tt > T.spin ? Math.exp(-dist * dist * 40) : 0;
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R, sc = pa * (1 + 0.12 * pulse);
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    ctx.fillStyle = C.paper; ctx.fillRect(-boxes[i].w / 2, -boxes[i].h / 2, boxes[i].w, boxes[i].h);
    ctx.fillStyle = pulse > 0.3 ? C.teal : C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '700 30px Roboto'; ctx.letterSpacing = '3px';
    ctx.fillText(n, 2, 2);
    ctx.restore();
  });
  // símbolo de reforço
  const rp = E.out3(prog(tt, T.loopDraw[1] - 0.3, T.loopDraw[1] + 0.3));
  if (rp > 0) {
    ctx.save(); ctx.translate(cx, cy);
    ctx.globalAlpha *= rp; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    const rot = tt > T.spin ? (phi + Math.PI / 3) * 0.25 : 0;
    ctx.rotate(rot);
    ctx.beginPath(); ctx.arc(0, 0, 62, 0.5, 0.5 + 5.2 * rp); ctx.stroke();
    const ea = 0.5 + 5.2 * rp, hx = Math.cos(ea) * 62, hy = Math.sin(ea) * 62, tx = -Math.sin(ea), ty = Math.cos(ea);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(hx + tx * 8, hy + ty * 8); ctx.lineTo(hx - tx * 8 + Math.cos(ea) * 10, hy - ty * 8 + Math.sin(ea) * 10); ctx.lineTo(hx - tx * 8 - Math.cos(ea) * 10, hy - ty * 8 - Math.sin(ea) * 10); ctx.fill();
    ctx.rotate(-rot);
    ctx.font = '76px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText('R', 0, 28);
    ctx.restore();
  }
  // a pessoa, arrastada pelo ciclo
  const dIn = spring(tt - 25.3, 0.4, 14);
  if (dIn > 0) {
    const go = E.io(prog(tt, T.dotToLoop, T.spin));
    const px = lerp(cx, cx + Math.cos(phi) * R, go), py = lerp(cy, cy + Math.sin(phi) * R, go);
    if (tt > T.spin) {
      const tail = Math.min(2.6, omega * 0.22);
      for (let j = 12; j >= 1; j--) {
        const a = phi - (tail * j) / 12;
        ctx.fillStyle = C.teal; ctx.globalAlpha = alpha * 0.5 * (1 - j / 13);
        ctx.beginPath(); ctx.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 13 * (1 - j / 16), 0, 7); ctx.fill();
      }
      ctx.globalAlpha = alpha;
    }
    ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(px, py, 14 * dIn, 0, 7); ctx.fill();
  }
  ctx.restore();
}

// ───────────────────────── lápis ─────────────────────────
function drawPencil(ctx, x, y, ang, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalAlpha *= a;
  const hw = 17;
  ctx.fillStyle = 'rgba(30,30,30,0.1)'; ctx.fillRect(40, -hw + 14, 620, hw * 2);
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(20, -5); ctx.lineTo(20, 5); ctx.fill();
  ctx.fillStyle = C.paper; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(18, -5); ctx.lineTo(70, -hw); ctx.lineTo(70, hw); ctx.lineTo(18, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.ink; ctx.fillRect(70, -hw, 500, hw * 2);
  ctx.fillStyle = C.teal; ctx.fillRect(570, -hw - 1, 38, hw * 2 + 2);
  ctx.fillStyle = C.ink; ctx.fillRect(608, -hw + 1, 48, hw * 2 - 2);
  ctx.restore();
}
function pencilPose(t, cam) {
  const [tx, ty] = toScreen(cam, TOUCH[0] + P.x, TOUCH[1] + P.y);
  const inP = E.out3(prog(t, T.pencilIn, T.touch));
  const outP = E.in3(prog(t, 36.4, 37.3));
  const off = (1 - inP) * 1100 + outP * 1200;
  // enquanto encosta, o lápis segue a marca que está fazendo
  const mk = E.out3(prog(t, T.touch, T.touch + 0.6));
  return { x: tx - 40 * mk * cam.s + Math.cos(0.62) * off, y: ty - 60 * mk * cam.s + Math.sin(0.62) * off, ang: 0.62, a: 1 };
}

// ───────────────────────── papel manteiga ─────────────────────────
const STYLES = {
  graphite: { color: C.graphite, width: 5, amp: 2.6, passes: 2, alpha: 0.9 },
  tealDash: { color: C.teal, width: 4.5, amp: 1.4, passes: 1, dash: [16, 11] },
  fine: { color: C.ink, width: 2.2, amp: 2, passes: 2, alpha: 0.85 },
  marker: { color: C.light, width: 15, amp: 1.2, passes: 1, alpha: 0.85, cap: 'round' },
};
const arrowHead = (x, y, ang, s = 26) => [[[x, y], [x - Math.cos(ang - 0.5) * s, y - Math.sin(ang - 0.5) * s]], [[x, y], [x - Math.cos(ang + 0.5) * s, y - Math.sin(ang + 0.5) * s]]];
const SHEETS = (() => {
  const r = rng(99);
  const cal = [];
  const gx = -520, gy = 50, cw = 48, ch = 44;
  for (let i = 0; i <= 7; i++) cal.push([[gx + i * cw, gy], [gx + i * cw, gy + ch * 4]]);
  for (let j = 0; j <= 4; j++) cal.push([[gx, gy + j * ch], [gx + cw * 7, gy + j * ch]]);
  for (let i = 0; i < 7; i++) for (let j = 0; j < 4; j++) if (i !== 3 && r() < 0.55) { const x = gx + i * cw + 12, y = gy + j * ch + 10; cal.push([[x, y], [x + 24, y + 24]]); cal.push([[x + 24, y], [x, y + 24]]); }
  const chairs = Array.from({ length: 8 }, (_, i) => circlePts(320 + Math.cos((i / 8) * 6.283) * 185, 90 + Math.sin((i / 8) * 6.283) * 185, 17, 16));
  const net = [[25, -230], [200, -230], [420, -230], [420, -40], [25, -40]].map(([x, y]) => catmull([[200, -30], [(200 + x) / 2 + 30, (-30 + y) / 2 - 20], [x, y]], 8));
  return [
    { cx: 130, cy: 0, w: 640, h: 440, rot: -3.5, from: [-1500, -900], tIn: T.sheets[0], draw: T.sheetDraw[0], style: 'graphite',
      strokes: [[[165, 50], [165, 122]], circlePts(165, 50, 72, 14, Math.PI / 2, 0), catmull([[200, -20], [212, 92], [100, 118], [-20, 100], [-150, 122]], 8), ...arrowHead(-150, 122, Math.PI - 0.1)],
      note: { text: 'E SE…?', x: -175, y: 190 } },
    { cx: 330, cy: 95, w: 520, h: 450, rot: 3, from: [1700, 150], tIn: T.sheets[1], draw: T.sheetDraw[1], style: 'tealDash', out: T.sheet2Out,
      strokes: [circlePts(320, 90, 140, 56), ...chairs], note: { text: 'RODA', x: 450, y: -95 } },
    { cx: -330, cy: 170, w: 460, h: 330, rot: -2.5, from: [0, 1200], tIn: T.sheets[2], draw: T.sheetDraw[2], style: 'fine',
      strokes: [...cal, [[-352, 285], [-352, 242]], ...arrowHead(-352, 242, -Math.PI / 2, 16)], note: { text: 'PAUSA?', x: -330, y: 300 } },
    { cx: -300, cy: -190, w: 460, h: 300, rot: 4.5, from: [-1700, 0], tIn: T.sheets[3], draw: T.sheetDraw[3], style: 'marker',
      strokes: [circlePts(-380, -190, 80, 40, -2.4, 3.6), [[-300, -190], [-185, -222]], circlePts(-150, -230, 34, 24)], note: { text: 'OUTRO ELO?', x: -505, y: -70 }, q: [-150, -230] },
    { cx: 370, cy: -170, w: 500, h: 330, rot: -5.5, from: [1100, -1100], tIn: T.sheet5, draw: T.sheet5Draw, style: 'graphite',
      strokes: net, note: { text: 'JUNTO?', x: 460, y: -290 } },
  ].map((s) => ({ ...s, paths: s.strokes.map(mkPath) }));
})();
const CROSS = [mkPath(catmull([[90, -120], [300, 80], [570, 300]], 6)), mkPath(catmull([[570, -115], [340, 90], [95, 305]], 6))];

function sheetPose(s, t) {
  const e = spring(t - s.tIn, 0.62, 9);
  let x = s.cx + s.from[0] * (1 - e), y = s.cy + s.from[1] * (1 - e), rot = s.rot + (1 - e) * (s.from[0] > 0 ? 9 : -9);
  if (s.out && t > s.out) { const o = E.in3(prog(t, s.out, s.out + 0.6)); x += o * 1700; y -= o * 120; rot += o * 10; }
  return { x, y, rot, e };
}
function drawSheets(ctx, t, boil) {
  const fade = 1 - prog(t, T.unravel[0], T.unravel[0] + 0.5);
  if (fade <= 0) return;
  ctx.save(); ctx.translate(P.x, P.y); ctx.globalAlpha *= fade;
  for (const s of SHEETS) {
    if (t < s.tIn) continue;
    const pose = sheetPose(s, t);
    if (s.out && t > s.out + 0.7) continue;
    ctx.save();
    ctx.translate(pose.x, pose.y); ctx.rotate((pose.rot * Math.PI) / 180);
    ctx.shadowColor = 'rgba(30,30,30,0.09)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 8;
    ctx.fillStyle = 'rgba(247,245,241,0.58)'; ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h);
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(30,30,30,0.2)'; ctx.lineWidth = 1.6; ctx.strokeRect(-s.w / 2, -s.h / 2, s.w, s.h);
    ctx.restore();
    // desenhos alinhados à planta; acompanham a folha quando ela sai
    ctx.save();
    ctx.translate(pose.x, pose.y); ctx.rotate(((pose.rot - s.rot) * Math.PI) / 180); ctx.translate(-s.cx, -s.cy);
    const st = STYLES[s.style];
    const total = s.paths.reduce((a, p) => a + p.len, 0);
    const dp = E.sine(prog(t, s.draw[0], s.draw[1])) * total;
    let acc = 0, head = null;
    s.paths.forEach((p, i) => {
      const f = clamp((dp - acc) / p.len); acc += p.len;
      if (f <= 0) return;
      stroke(ctx, p, { ...st, frac: f, boil, seed: i * 1.7 + s.cx * 0.01 });
      if (f < 1) head = pointAt(p, p.len * f);
    });
    if (head) { ctx.fillStyle = st.color; ctx.beginPath(); ctx.arc(head[0], head[1], 5, 0, 7); ctx.fill(); }
    const np = prog(t, s.draw[1] - 0.15, s.draw[1] + 0.35);
    if (np > 0) {
      const txt = s.note.text.slice(0, Math.ceil(s.note.text.length * np));
      ctx.font = '700 30px Roboto'; ctx.letterSpacing = '4px'; ctx.fillStyle = s.style === 'marker' ? C.teal : st.color; ctx.textAlign = 'left';
      ctx.fillText(txt, s.note.x, s.note.y);
    }
    if (s.q && np > 0) { ctx.font = '48px Anton'; ctx.fillStyle = C.teal; ctx.textAlign = 'center'; ctx.globalAlpha *= np; ctx.fillText('?', s.q[0], s.q[1] + 17); }
    if (s.out) {
      CROSS.forEach((c, i) => { const f = E.out3(prog(t, T.crossOut[0] + i * 0.18, T.crossOut[0] + i * 0.18 + 0.22)); if (f > 0) stroke(ctx, c, { ...STYLES.graphite, width: 8, amp: 4, frac: f, boil, seed: 40 + i }); });
    }
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── desenrolar: linhas → cabelo ─────────────────────────
const HAIR_C = catmull([[-80, 150], [287, 214], [574, 282], [861, 340], [1148, 410], [1378, 492], [1608, 600], [1770, 720]].map(([x, y]) => [x, y]), 10);
const HAIR_P = mkPath(HAIR_C);
const HAIR_COLORS = [C.ink, C.teal, C.ink, C.mid, C.ink, C.light, C.ink, '#d9d4cc'];
let UNRAVEL;
function buildUnravel(t0) {
  const cam = camera(t0);
  const src = [];
  for (const w of PLAN.walls) src.push([w.a, w.b].map(([x, y]) => toScreen(cam, x + P.x, y + P.y)));
  for (const s of SHEETS) if (!s.out) for (const p of s.paths) src.push(p.pts.map(([x, y]) => toScreen(cam, x + P.x, y + P.y)));
  const N = 96, M = 70, lines = [];
  for (let i = 0; i < N; i++) {
    const S = mkPath(src[(i * 13) % src.length]);
    const from = resample(S, M);
    const off = (i / (N - 1) - 0.5);
    lines.push({ from, off, color: HAIR_COLORS[i % HAIR_COLORS.length], width: 2.5 + (i % 5) * 1.2, delay: hash(i * 3.3) * 0.75 });
  }
  return lines;
}
function hairPoint(u, off, t, i, spread = 1) {
  const q = pointAt(HAIR_P, HAIR_P.len * u);
  const band = lerp(330, 150, u);
  const wave = Math.sin(u * 18 - t * 2.2 + off * 2.5) * 34 + Math.sin(u * 7 + i * 0.3 - t * 0.8) * 12;
  const o = off * band * spread + wave;
  return [q[0] + q[2] * o, q[1] + q[3] * o];
}
function drawUnravel(ctx, t) {
  if (t < T.unravel[0] || t > T.coverReveal[1] + 0.2) return;
  UNRAVEL ||= buildUnravel(T.unravel[0]);
  const fade = 1 - prog(t, T.coverReveal[0] + 0.6, T.coverReveal[1]);
  ctx.save(); ctx.globalAlpha = fade; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  UNRAVEL.forEach((l, i) => {
    const p = E.io(prog(t, T.unravel[0] + l.delay, T.unravel[0] + l.delay + 1.6));
    ctx.strokeStyle = p > 0.5 ? l.color : C.ink; ctx.lineWidth = lerp(2.2, l.width, p);
    ctx.beginPath();
    l.from.forEach(([x, y], k) => {
      const u = k / (l.from.length - 1);
      const [hx, hy] = hairPoint(u, l.off, t, i);
      const X = lerp(x, hx, p), Y = lerp(y, hy, p);
      k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
    });
    ctx.stroke();
  });
  ctx.restore();
}

// ───────────────────────── capa ─────────────────────────
function hairAmp(x, y) {
  // longe do rosto, do texto e da borda inferior; forte na faixa do cabelo
  const face = Math.hypot((x - 1640) / 260, (y - 820) / 300);
  const text = x < 1100 && y > 540 ? 0 : 1;
  const top = clamp((820 - y) / 200);
  return clamp(face - 0.9) * text * top;
}
function drawCover(ctx, t, mask) {
  const push = 1 + 0.035 * E.sine(prog(t, T.coverReveal[0], T.endSheet + 1));
  ctx.save();
  ctx.translate(960, 540); ctx.scale(push, push); ctx.translate(-960, -540);
  const g = mask ? mask.getContext('2d') : ctx;
  // imagem base + ondulação do cabelo em ladrilhos
  g.drawImage(coverClean, 0, 0);
  const tw = 12, th = 30;
  for (let y = 0; y < H; y += th) for (let x = 0; x < W; x += tw) {
    const a = hairAmp(x, y);
    if (a < 0.05) continue;
    const dy = a * 3.2 * Math.sin(x * 0.012 - t * 1.6 + y * 0.004), dx = a * 1.6 * Math.sin(y * 0.02 - t * 1.1);
    g.drawImage(coverClean, x, y, tw, th, x + dx, y + dy, tw, th);
  }
  // títulos: cada linha sobe de dentro da sua própria máscara
  TITLE_ROWS.forEach((row, i) => {
    const tt = T.titles[Math.min(3, i === 0 || i === 1 ? 0 : i - 1)] + (i === 1 ? 0.25 : 0);
    const p = E.outExpo(prog(t, tt, tt + 0.95));
    if (p <= 0) return;
    const ys = row.poly.map((q) => q[1] * COVER_SCALE), xs = row.poly.map((q) => q[0] * COVER_SCALE);
    const y0 = Math.min(...ys), y1 = Math.max(...ys), x0 = Math.min(...xs), x1 = Math.max(...xs);
    g.save();
    g.beginPath(); row.poly.forEach(([x, y], k) => (k ? g.lineTo(x * COVER_SCALE, y * COVER_SCALE) : g.moveTo(x * COVER_SCALE, y * COVER_SCALE))); g.closePath(); g.clip();
    g.fillStyle = coverBg; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    if (row.wipe) { g.beginPath(); g.rect(x0, y0, (x1 - x0) * p, y1 - y0); g.clip(); g.drawImage(IMG.cover, 0, 0, W, H); }
    else g.drawImage(IMG.cover, 0, (1 - p) * (y1 - y0) * 1.1, W, H);
    g.restore();
  });
  ctx.restore();
}
let coverLayer, maskLayer;
function drawCoverReveal(ctx, t) {
  if (t < T.coverReveal[0]) return;
  const r = prog(t, T.coverReveal[0], T.coverReveal[1]);
  if (r >= 1) { drawCover(ctx, t); return; }
  coverLayer ||= canvas(W, H); maskLayer ||= canvas(W, H);
  const cg = coverLayer.getContext('2d'); cg.setTransform(1, 0, 0, 1, 0, 0); cg.clearRect(0, 0, W, H);
  drawCover(cg, t);
  const mg = maskLayer.getContext('2d'); mg.setTransform(1, 0, 0, 1, 0, 0); mg.clearRect(0, 0, W, H);
  mg.strokeStyle = '#000'; mg.lineCap = 'round'; mg.lineJoin = 'round';
  // o cabelo engrossa e se espalha até cobrir o quadro; borda levemente suave
  mg.filter = `blur(${lerp(1, 10, r)}px)`;
  const wdt = lerp(4, 120, E.in2(r)), spread = 1 + 5.5 * E.in3(r);
  UNRAVEL.forEach((l, i) => {
    mg.lineWidth = wdt * (0.6 + hash(i) * 0.8); mg.beginPath();
    for (let k = 0; k <= 40; k++) { const [x, y] = hairPoint(k / 40, l.off, t, i, spread); k ? mg.lineTo(x, y) : mg.moveTo(x, y); }
    mg.stroke();
  });
  mg.filter = 'none';
  cg.globalCompositeOperation = 'destination-in'; cg.drawImage(maskLayer, 0, 0); cg.globalCompositeOperation = 'source-over';
  ctx.drawImage(coverLayer, 0, 0);
}

// ───────────────────────── cartão final ─────────────────────────
const ROUTE = mkPath(catmull([[520, 700], [560, 820], [720, 905], [930, 912], [1130, 880], [1330, 930], [1560, 915], [1760, 960]], 12));
function lineReveal(ctx, t0, t, draw, h, y) {
  const p = E.outExpo(prog(t, t0, t0 + 0.9));
  if (p <= 0) return;
  ctx.save(); ctx.beginPath(); ctx.rect(0, y - h, W, h * 1.35); ctx.clip();
  ctx.translate(0, (1 - p) * h * 1.2); draw(); ctx.restore();
}
function drawEnd(ctx, t, boil) {
  if (t < T.endSheet) return;
  const e = spring(t - T.endSheet, 0.7, 7.5);
  const x = (1 - e) * 2150, rot = (1 - e) * 0.09;
  ctx.save();
  ctx.translate(x + 960, 540); ctx.rotate(rot); ctx.translate(-960, -540);
  ctx.shadowColor = 'rgba(30,30,30,0.18)'; ctx.shadowBlur = 40; ctx.shadowOffsetX = -12;
  ctx.fillStyle = 'rgba(243,240,236,0.95)'; ctx.fillRect(-40, -80, W + 400, H + 160);
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(30,30,30,0.18)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-40, -80); ctx.lineTo(-40, H + 80); ctx.stroke();
  ctx.restore();
  if (e < 0.6) return;
  // emblema: o carimbo que convida (rima com os carimbos do ato II)
  const d = t - T.emblem;
  if (d > -0.13) {
    let sc, a;
    if (d < 0) { const q = 1 + d / 0.13; sc = lerp(1.5, 1, E.in2(q)); a = q; } else { sc = 1 - 0.05 * Math.exp(-d * 14) * Math.cos(d * 40); a = 1; }
    const size = 360;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(520, 500); ctx.scale(sc, sc);
    ctx.drawImage(IMG.emblem, -size / 2, -size / 2, size, size);
    ctx.restore();
  }
  const X = 830;
  ctx.save();
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  lineReveal(ctx, T.endText, t, () => { ctx.font = '700 28px Roboto'; ctx.letterSpacing = '5px'; ctx.fillStyle = C.teal; ctx.fillText('ABERTURA DA TEMPORADA 0', X, 350); }, 30, 350);
  lineReveal(ctx, T.endText + 0.12, t, () => { ctx.font = '124px Anton'; ctx.letterSpacing = '0px'; ctx.fillStyle = C.ink; ctx.fillText('7 DE OUTUBRO · 20H', X - 4, 490); }, 128, 490);
  lineReveal(ctx, T.endText + 0.3, t, () => { ctx.font = '400 34px Roboto'; ctx.letterSpacing = '0px'; ctx.fillStyle = C.ink; ctx.fillText('Uma temporada para investigar juntos,', X, 575); }, 36, 575);
  lineReveal(ctx, T.endText + 0.38, t, () => { ctx.font = '400 34px Roboto'; ctx.fillStyle = C.ink; ctx.fillText('em encontros, conversas e experimentos.', X, 623); }, 36, 623);
  lineReveal(ctx, T.endText + 0.5, t, () => { ctx.font = '400 24px Roboto'; ctx.letterSpacing = '1px'; ctx.fillStyle = 'rgba(30,30,30,0.7)'; ctx.fillText('Encontro online · horário de Brasília', X, 680); }, 26, 680);
  lineReveal(ctx, T.endText + 0.65, t, () => { ctx.font = '72px Anton'; ctx.letterSpacing = '1px'; ctx.fillStyle = C.teal; ctx.fillText('CLUBE.TARGETTEAL.COM', X - 2, 790); }, 74, 790);
  const la = prog(t, T.endText + 0.9, T.endText + 1.5);
  if (la > 0) { const lw = 190, lh = (lw * 249) / 800; ctx.globalAlpha = la; ctx.drawImage(IMG.logo, 1820 - lw, 980 - lh, lw, lh); ctx.globalAlpha = 1; }
  ctx.restore();
  // a rota que não fecha
  const rp = prog(t, T.route[0], T.route[1]);
  if (rp > 0) {
    const f = 0.64 * E.sine(rp);
    stroke(ctx, ROUTE, { frac: f, color: C.teal, width: 5, dash: [18, 14], amp: 1.6, boil, seed: 5 });
    const lift = prog(t, T.route[1] - 0.1, T.route[1] + 0.4);
    const hd = pointAt(ROUTE, ROUTE.len * f);
    ctx.save(); ctx.globalAlpha = 1 - lift; ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(hd[0], hd[1], 6, 0, 7); ctx.fill(); ctx.restore();
  }
}

// ───────────────────────── quadro ─────────────────────────
function drawFrame(ctx, t) {
  const frozen = t >= T.freeze && t < T.unfreeze;
  const ft = frozen ? T.freeze : t;
  const boil = Math.floor(ft * 12);
  const cam = camera(t);
  const [sx, sy] = shake(t);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const gx = hash(boil) * 120, gy = hash(boil + 0.5) * 120;
  ctx.drawImage(paperTex, -gx * 0.3 - 20, -gy * 0.3 - 20);

  // mundo: planta, cabeça, pessoa, folhas
  const worldA = clamp(1 - 0.84 * prog(t, 20.6, 21.3) - 0.125 * prog(t, 24.4, 25.0) + 0.94 * prog(t, T.unfreeze, T.unfreeze + 0.9)) * (1 - prog(t, T.unravel[0], T.unravel[0] + 0.5));
  if (worldA > 0.001) {
    ctx.save();
    ctx.globalAlpha = worldA;
    ctx.setTransform(cam.s, 0, 0, cam.s, 960 - cam.cx * cam.s + sx, 540 - cam.cy * cam.s + sy);
    drawWorld(ctx, t, cam, boil);
    drawSheets(ctx, t, boil);
    ctx.restore();
  }
  ctx.setTransform(1, 0, 0, 1, sx, sy);
  drawStamps(ctx, t);
  drawLoop(ctx, t);
  for (const d of TEXTS) drawText(ctx, d, t);
  if (t > T.pencilIn && t < 37.4) { const p = pencilPose(t, cam); drawPencil(ctx, p.x, p.y, p.ang, p.a); }
  drawUnravel(ctx, t);
  drawCoverReveal(ctx, t);
  drawEnd(ctx, t, boil);

  // grão por cima de tudo, fervendo junto com o traço
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.28;
  ctx.drawImage(grainTex, -gx, -gy); ctx.restore();
}

// ───────────────────────── API para o renderizador ─────────────────────────
const out = document.getElementById('c');
const octx = out.getContext('2d');
let acc, accCtx, buf, bufCtx;

window.ready = (async () => {
  await loadFonts();
  [IMG.cover, IMG.emblem, IMG.logo] = await Promise.all(['assets/cover.png', 'assets/emblem.png', 'assets/tt-logo-dark.png'].map(loadImage));
  paperTex = makePaper(); grainTex = makeGrain(); hatchPattern = makeHatch(octx);
  coverClean = makeCoverClean();
  STAMPS = STAMP_DEFS.map((s, i) => makeStamp(s.text, s.color, 100 + i));
  buf = canvas(W, H); bufCtx = buf.getContext('2d');
  acc = canvas(W, H); accCtx = acc.getContext('2d');
  return true;
})();

// samples > 1: motion blur por acumulação (obturador de 180°).
window.renderFrame = (t, samples = 1, fps = 30) => {
  if (samples <= 1) { drawFrame(octx, t); return; }
  accCtx.setTransform(1, 0, 0, 1, 0, 0); accCtx.globalAlpha = 1; accCtx.clearRect(0, 0, W, H);
  for (let i = 0; i < samples; i++) {
    const ts = t + ((i / samples) - 0.5) * (0.5 / fps);
    drawFrame(bufCtx, ts);
    accCtx.globalAlpha = 1 / (i + 1);
    accCtx.drawImage(buf, 0, 0);
  }
  octx.setTransform(1, 0, 0, 1, 0, 0); octx.drawImage(acc, 0, 0);
};
