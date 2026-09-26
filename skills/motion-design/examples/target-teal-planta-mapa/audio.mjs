// Trilha e desenho de som, sintetizados amostra a amostra a partir da mesma
// partitura do filme (timeline.mjs). Saída: out/audio.wav (48 kHz, estéreo).
//
// Ideia musical: os atos I e II são só ruído, ritmo e grave — a planta e o
// ciclo. O piano entra quando o papel manteiga aparece e termina num acorde
// suspenso, que não resolve: o filme acaba aberto, e a harmonia também.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { T, CHORDS, DURATION } from './timeline.mjs';

const SR = 48000;
const N = Math.ceil(DURATION * SR);
const dry = [new Float32Array(N), new Float32Array(N)];
const wet = [new Float32Array(N), new Float32Array(N)];
const TAU = Math.PI * 2;

let seed = 1234567;
const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const white = () => rand() * 2 - 1;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const db = (d) => Math.pow(10, d / 20);

function put(i, v, pan = 0, send = 0) {
  if (i < 0 || i >= N) return;
  const l = Math.cos((pan + 1) * Math.PI / 4), r = Math.sin((pan + 1) * Math.PI / 4);
  dry[0][i] += v * l * (1 - send * 0.3); dry[1][i] += v * r * (1 - send * 0.3);
  if (send) { wet[0][i] += v * l * send; wet[1][i] += v * r * send; }
}

class Biquad {
  constructor(type, f, q = 0.707) { this.type = type; this.x1 = this.x2 = this.y1 = this.y2 = 0; this.set(f, q); }
  set(f, q = this.q) {
    this.q = q; const w = TAU * clamp(f, 10, SR * 0.45) / SR, c = Math.cos(w), s = Math.sin(w), a = s / (2 * q);
    let b0, b1, b2; const a0 = 1 + a, a1 = -2 * c, a2 = 1 - a;
    if (this.type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
    else if (this.type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
    else { b0 = a; b1 = 0; b2 = -a; }
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = a1 / a0; this.a2 = a2 / a0;
  }
  p(x) { const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2; this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y; return y; }
}

// Ruído filtrado com envelope arbitrário.
function noiseEvent({ t0, t1, type = 'bp', f = 1000, fEnd, q = 0.8, gain = 0.1, attack = 0.01, release = 0.05, pan = 0, send = 0, mod = null }) {
  const flt = new Biquad(type, f, q), flt2 = new Biquad(type, f, q);
  const i0 = Math.floor(t0 * SR), i1 = Math.floor((t1 + release) * SR);
  for (let i = i0; i < i1; i++) {
    const t = i / SR, u = (t - t0) / Math.max(1e-3, t1 - t0);
    if (fEnd && (i & 63) === 0) { const ff = f * Math.pow(fEnd / f, clamp(u)); flt.set(ff); flt2.set(ff); }
    let env = t < t0 + attack ? (t - t0) / attack : t > t1 ? Math.max(0, 1 - (t - t1) / release) : 1;
    if (mod) env *= mod(t, u);
    put(i, flt2.p(flt.p(white())) * gain * env, pan, send);
  }
}
// Batida grave com queda de altura (carimbos, portas).
function thump({ t, f0 = 120, f1 = 42, decay = 0.28, gain = 0.6, click = 0.2, pan = 0, send = 0.15 }) {
  let ph = 0; const i0 = Math.floor(t * SR), len = Math.floor(decay * 4 * SR);
  const hp = new Biquad('hp', 1800, 0.7);
  for (let k = 0; k < len; k++) {
    const x = k / SR, f = f1 + (f0 - f1) * Math.exp(-x * 28);
    ph += (TAU * f) / SR;
    const body = Math.sin(ph) * Math.exp(-x / decay);
    const c = hp.p(white()) * Math.exp(-x * 120) * click;
    put(i0 + k, Math.tanh((body + c) * 1.4) * gain, pan, send);
  }
}
function click(t, gain = 0.1, f = 3000, pan = 0) {
  const b = new Biquad('bp', f, 2.5), i0 = Math.floor(t * SR);
  for (let k = 0; k < SR * 0.02; k++) put(i0 + k, b.p(white()) * Math.exp(-(k / SR) * 400) * gain, pan, 0.05);
}
// Traço de caneta técnica sobre papel.
const pen = (t0, t1, gain = 0.05, pan = 0) => {
  const fl = new Biquad('lp', 18, 0.7);
  noiseEvent({ t0, t1, f: 2300, q: 0.7, gain: gain * 2, attack: 0.012, release: 0.04, pan, send: 0.08, mod: () => 0.75 + 0.5 * Math.abs(fl.p(white()) * 30) });
};
// Grafite: mais agudo, granulado.
const graphite = (t0, t1, gain = 0.06, pan = 0) => {
  let g = 1, cnt = 0;
  noiseEvent({ t0, t1, f: 4200, q: 0.9, gain: gain * 1.8, attack: 0.01, release: 0.05, pan, send: 0.1, mod: () => { if (cnt-- <= 0) { cnt = 60 + rand() * 120; g = rand() < 0.35 ? 1.4 : 0.45; } return g; } });
};
const swoosh = (t0, dur, gain = 0.08, pan = 0, fA = 500, fB = 2600) => noiseEvent({ t0, t1: t0 + dur, type: 'bp', f: fA, fEnd: fB, q: 0.6, gain, attack: dur * 0.6, release: dur * 0.5, pan, send: 0.2 });
const marker = (t, gain = 0.05) => noiseEvent({ t0: t, t1: t + 0.42, f: 5200, q: 1.2, gain, attack: 0.02, release: 0.08, pan: -0.4, send: 0.1, mod: (_, u) => 0.6 + 0.4 * Math.sin(u * 20) });

function tone(t0, dur, f, gain, { attack = 0.01, release = 0.3, harm = [1, 0.3, 0.1], pan = 0, send = 0.3, vib = 0 } = {}) {
  const i0 = Math.floor(t0 * SR), len = Math.floor((dur + release) * SR);
  const ph = harm.map(() => rand() * TAU);
  for (let k = 0; k < len; k++) {
    const x = k / SR, env = (x < attack ? x / attack : 1) * (x > dur ? Math.max(0, 1 - (x - dur) / release) : 1);
    let v = 0; const ff = f * (1 + vib * Math.sin(x * 5.1));
    harm.forEach((a, h) => { ph[h] += (TAU * ff * (h + 1)) / SR; v += Math.sin(ph[h]) * a; });
    put(i0 + k, v * env * gain, pan, send);
  }
}
// Piano sintético: parciais levemente inarmônicos, decaimento por parcial, martelo de feltro.
function piano(t0, f, vel = 0.3, pan = 0, sustain = 4) {
  const i0 = Math.floor(t0 * SR), len = Math.floor((sustain + 1.5) * SR), B = 0.00035;
  const parts = [1, 2, 3, 4, 5, 6, 7].map((k) => ({ f: k * f * Math.sqrt(1 + B * k * k), a: Math.pow(k, -1.45) * (k === 1 ? 1 : 0.8), d: (sustain * 0.9) / Math.pow(k, 0.75), ph: 0 }));
  const lp = new Biquad('lp', Math.min(9000, f * 9), 0.6), ham = new Biquad('bp', f * 3, 1.2);
  for (let k = 0; k < len; k++) {
    const x = k / SR;
    let v = 0;
    for (const p of parts) { if (p.f > 16000) continue; p.ph += (TAU * p.f) / SR; v += Math.sin(p.ph) * p.a * Math.exp(-x / p.d); }
    v += ham.p(white()) * Math.exp(-x * 90) * 0.4;
    const env = Math.min(1, x / 0.004);
    put(i0 + k, lp.p(v) * env * vel * 0.22, pan, 0.45);
  }
}
const NOTE = (n) => { const m = n.match(/^([A-G])(#|b)?(\d)$/); const s = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); return 440 * Math.pow(2, (s + (+m[3] + 1) * 12 - 69) / 12); };

// ───────────────────────── partitura sonora ─────────────────────────
// ambiente: tom de sala
{ const lp = new Biquad('lp', 700, 0.5); let b = 0; for (let i = 0; i < N; i++) { b = 0.997 * b + white() * 0.05; put(i, lp.p(b) * 0.05, 0, 0); } }

// I. a planta se fecha
click(T.dotIn, 0.12, 900);
tone(T.dotIn, 0.05, 587.33, 0.05, { release: 0.8, harm: [1, 0.2], send: 0.5 });
// paredes: um gesto contínuo de caneta
pen(T.outer[0], 2.42, 0.07, 0.2);
pen(T.dims, T.dims + 0.6, 0.03, -0.3);
T.inner.forEach((t, i) => pen(t, t + 0.34, 0.05, -0.2 + i * 0.1));
for (let k = 0; k < 40; k++) { const t = T.furniture + k * 0.035; noiseEvent({ t0: t, t1: t + 0.04, f: 2600, q: 0.8, gain: 0.025, pan: rand() - 0.5 }); }
T.doorClose.forEach((t, i) => { thump({ t: t + 0.3, f0: 150, f1: 55, decay: 0.2, gain: 0.35 + i * 0.05, click: 0.5, pan: -0.3 + i * 0.1 }); });
T.cubicles.forEach((t, i) => { pen(t, t + 0.22, 0.05, 0.3 - i * 0.05); });
T.cellClose.forEach((t, i) => thump({ t: t + 0.08, f0: 220, f1: 70, decay: 0.12 + i * 0.03, gain: 0.3 + i * 0.12, click: 0.8, pan: 0.2 }));
// relógio que acelera e para no último fechamento
{ let t = 5.4, dt = 0.5, n = 0; const stop = T.cellClose[3] + 0.08; while (t < stop) { click(t, 0.09, n % 2 ? 2600 : 3400, 0.35); t += dt; dt = Math.max(0.1, dt * 0.9); n++; } }
// zumbido de luz fluorescente
{ const i0 = Math.floor(5.9 * SR), i1 = Math.floor(10.28 * SR); for (let i = i0; i < i1; i++) { const t = i / SR, u = (t - 5.9) / 4.38, s = Math.sin(TAU * 120 * t) + 0.4 * Math.sin(TAU * 240 * t) + 0.25 * Math.sign(Math.sin(TAU * 120 * t)) * 0.3; put(i, s * 0.018 * Math.pow(u, 1.5) * (0.9 + 0.1 * Math.sin(t * 37)), 0.1, 0); } }
// recuo da câmera: ar e grave
swoosh(T.pullStart, T.pullEnd - T.pullStart, 0.05, 0, 180, 1400);
tone(T.pullStart + 0.4, 5.6, 73.42, 0.09, { attack: 2.5, release: 2.5, harm: [1, 0.25, 0.08], send: 0.3 });
tone(T.pullStart + 1.2, 4.8, 110, 0.04, { attack: 2.5, release: 2.5, harm: [1, 0.15], send: 0.4, pan: 0.2 });
pen(T.headDraw[0], T.headDraw[1], 0.035, 0.3);
marker(T.text2In + 1.3); marker(T.text2In + 1.42, 0.03);

// II. a pergunta errada
T.stamps.forEach((t, i) => {
  swoosh(t - 0.14, 0.13, 0.05, i % 2 ? 0.4 : -0.3, 900, 2500);
  thump({ t, f0: 130, f1: 38, decay: 0.34, gain: 0.8, click: 0.6, pan: i % 2 ? 0.35 : -0.25, send: 0.2 });
  noiseEvent({ t0: t, t1: t + 0.03, f: 1500, q: 0.6, gain: 0.25, release: 0.06, pan: i % 2 ? 0.35 : -0.25, send: 0.2 });
});
T.stamps.forEach((_, i) => { const t = T.peel + i * 0.16; let g = 1, c = 0; noiseEvent({ t0: t, t1: t + 0.32, f: 3000, fEnd: 1400, q: 0.7, gain: 0.08, attack: 0.02, release: 0.12, pan: [-0.5, 0.6, -0.6, 0.6][i], send: 0.15, mod: () => { if (c-- <= 0) { c = 40 + rand() * 200; g = rand(); } return g; } }); swoosh(t + 0.1, 0.5, 0.05, [-0.6, 0.7, -0.7, 0.7][i]); });
thump({ t: T.qIn, f0: 90, f1: 36, decay: 0.9, gain: 0.55, click: 0.1, send: 0.35 });
tone(T.qIn, 3.2, 73.42, 0.07, { attack: 0.02, release: 1.8, harm: [1, 0.35, 0.12, 0.05], send: 0.4 });
marker(T.qMark + 0.24, 0.06);
// o ciclo: traços, depois pulso e zumbido que aceleram até o corte seco
[0, 1, 2, 3].forEach((i) => { const span = (T.loopDraw[1] - T.loopDraw[0]) / 4.6; pen(T.loopDraw[0] + i * span, T.loopDraw[0] + (i + 1) * span, 0.05, [0, 0.4, 0, -0.4][i]); });
click(25.3, 0.1, 900);
{
  const w0 = 0.9, k = (8.5 - w0) / Math.pow(T.freeze - T.spin, 2);
  let last = Math.floor((-Math.PI / 3 + Math.PI / 2) / (Math.PI / 2));
  for (let t = T.spin; t < T.freeze; t += 0.0005) {
    const d = t - T.spin, phi = -Math.PI / 3 + w0 * d + (k * d * d * d) / 3;
    const c = Math.floor((phi + Math.PI / 2) / (Math.PI / 2));
    if (c !== last) { last = c; const pan = [0, 0.5, 0, -0.5][((c % 4) + 4) % 4]; thump({ t, f0: 95, f1: 45, decay: 0.16, gain: 0.5 + 0.3 * (d / 4.8), click: 0.3, pan, send: 0.1 }); }
  }
  let ph = 0; const lp = new Biquad('lp', 400, 0.9);
  for (let i = Math.floor(T.spin * SR); i < Math.floor(T.freeze * SR); i++) {
    const t = i / SR, d = t - T.spin, w = w0 + k * d * d; ph += (TAU * (55 + 22 * w)) / SR;
    if ((i & 63) === 0) lp.set(300 + 260 * w);
    const s = Math.tanh((Math.sin(ph) + 0.5 * Math.sin(ph * 2.01) + 0.25 * Math.sin(ph * 3.02)) * 1.8);
    put(i, lp.p(s) * 0.16 * Math.pow(w / 8.5, 1.3), 0, 0.05);
  }
  noiseEvent({ t0: T.spin + 1.5, t1: T.freeze, type: 'bp', f: 600, fEnd: 5000, q: 0.5, gain: 0.07, attack: 3, release: 0.001, mod: (_, u) => u * u });
}

// III. papel manteiga
swoosh(T.unfreeze + 0.05, 1.6, 0.06, 0.2, 300, 1800);
swoosh(T.pencilIn, 1.2, 0.04, 0.6, 400, 1200);
click(T.touch, 0.16, 1800, 0.5);
graphite(T.touch, T.touch + 0.6, 0.07, 0.5);
for (let k = 0; k < 220; k++) { const t = T.touch + 0.1 + Math.pow(rand(), 0.8) * 1.6; noiseEvent({ t0: t, t1: t + 0.012 + rand() * 0.03, f: 3000 + rand() * 3000, q: 1, gain: 0.02 + rand() * 0.03, release: 0.02, pan: rand() * 1.6 - 0.8, send: 0.2 }); }
marker(T.rascMark, 0.06);
T.sheets.forEach((t, i) => swoosh(t, 0.7, 0.07, [-0.6, 0.7, 0, -0.8][i], 250, 1600));
T.sheetDraw.forEach(([a, b], i) => (i === 1 ? pen(a, b, 0.045, 0.4) : graphite(a, b, 0.055, [-0.3, 0.4, -0.5, -0.6][i])));
graphite(T.crossOut[0], T.crossOut[0] + 0.22, 0.12, 0.4); graphite(T.crossOut[0] + 0.18, T.crossOut[0] + 0.4, 0.12, 0.4);
swoosh(T.sheet2Out, 0.6, 0.07, 0.8, 1500, 400);
swoosh(T.sheet5, 0.7, 0.06, 0.6, 250, 1600);
graphite(T.sheet5Draw[0], T.sheet5Draw[1], 0.05, 0.4);
thump({ t: 41.5, f0: 70, f1: 50, decay: 0.08, gain: 0.12, click: 0.1 }); // a pessoa esbarra na parede real
marker(T.exploraMark, 0.06);

// música: piano que entra com o papel manteiga
CHORDS.forEach((c, ci) => {
  const next = CHORDS[ci + 1] ? CHORDS[ci + 1].t : DURATION;
  const last = ci === CHORDS.length - 1;
  c.notes.forEach((n, k) => piano(c.t + k * (last ? 0.07 : 0.035), NOTE(n), (last ? 0.34 : 0.26) * (k === 0 ? 1.2 : 1), -0.3 + (k / c.notes.length) * 0.6, last ? 5 : Math.min(4, next - c.t + 1)));
  // cama de cordas bem baixa
  c.notes.slice(0, 3).forEach((n, k) => tone(c.t, next - c.t, NOTE(n), 0.012, { attack: 0.9, release: 1.2, harm: [1, 0.2, 0.05], send: 0.6, pan: -0.4 + k * 0.4, vib: 0.002 }));
});
// linhas viram cabelo: arpejo ascendente em ré pentatônico
['D4', 'E4', 'F#4', 'A4', 'B4', 'D5', 'E5', 'F#5', 'A5', 'B5', 'D6'].forEach((n, i) => piano(T.unravel[0] + 0.15 + i * 0.12, NOTE(n), 0.12, -0.6 + i * 0.12, 2.2));
swoosh(T.unravel[0], 2.4, 0.05, 0, 300, 4000);
T.titles.forEach((t, i) => thump({ t, f0: 110, f1: 60, decay: 0.1, gain: 0.12, click: 0.15, pan: -0.3 }));
// fecho
swoosh(T.endSheet - 0.1, 0.9, 0.08, 0.7, 1800, 300);
thump({ t: T.emblem, f0: 100, f1: 40, decay: 0.45, gain: 0.55, click: 0.3, send: 0.3 });
// rota tracejada: o lápis some antes de fechar
graphite(T.route[0], T.route[1], 0.05, 0.2);
click(T.route[1] + 0.02, 0.06, 2200, 0.3);

// ───────────────────────── reverb (Freeverb) e mix ─────────────────────────
function freeverb(inp, spread) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((d) => ({ b: new Float32Array(Math.round((d + spread) * SR / 44100)), i: 0, f: 0 }));
  const aps = [556, 441, 341, 225].map((d) => ({ b: new Float32Array(Math.round((d + spread) * SR / 44100)), i: 0 }));
  const out = new Float32Array(N), fb = 0.86, damp = 0.35;
  for (let n = 0; n < N; n++) {
    const x = inp[n] * 0.015; let y = 0;
    for (const c of combs) { const o = c.b[c.i]; c.f = o * (1 - damp) + c.f * damp; c.b[c.i] = x + c.f * fb; if (++c.i >= c.b.length) c.i = 0; y += o; }
    for (const a of aps) { const o = a.b[a.i]; const v = -y + o; a.b[a.i] = y + o * 0.5; if (++a.i >= a.b.length) a.i = 0; y = v; }
    out[n] = y;
  }
  return out;
}
const rv = [freeverb(wet[0], 0), freeverb(wet[1], 23)];
const master = [new Float32Array(N), new Float32Array(N)];
const f0 = Math.floor(T.freeze * SR), f1 = Math.floor(T.unfreeze * SR);
let peak = 0;
for (let c = 0; c < 2; c++) for (let i = 0; i < N; i++) {
  let v = dry[c][i] + rv[c][i] * 1.4;
  if (i >= f0 && i < f1) v = 0;                                             // silêncio absoluto no congelamento
  const t = i / SR; if (t > DURATION - 1.4) v *= Math.max(0, (DURATION - t) / 1.4);
  master[c][i] = v; peak = Math.max(peak, Math.abs(v));
}
// compressor suave (RMS), para aproximar o sussurro da caneta e a batida do carimbo
{
  let env = 0; const att = Math.exp(-1 / (0.005 * SR)), rel = Math.exp(-1 / (0.18 * SR)), thr = peak * db(-20), ratio = 3;
  peak = 0;
  for (let i = 0; i < N; i++) {
    const x = Math.max(Math.abs(master[0][i]), Math.abs(master[1][i]));
    env = x > env ? att * env + (1 - att) * x : rel * env + (1 - rel) * x;
    const gr = env > thr ? Math.pow(env / thr, 1 / ratio - 1) : 1;
    master[0][i] *= gr; master[1][i] *= gr; peak = Math.max(peak, Math.abs(master[0][i]), Math.abs(master[1][i]));
  }
}
const g = db(-1.5) / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) for (let c = 0; c < 2; c++) buf.writeInt16LE(Math.round(Math.tanh(master[c][i] * g * 1.1) / Math.tanh(1.1) * 32767 * 0.98), 44 + i * 4 + c * 2);
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out', 'audio.wav');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, buf);
console.log(`ok → ${out} (pico normalizado ${(20 * Math.log10(peak)).toFixed(1)} dB → -1.5 dB)`);
