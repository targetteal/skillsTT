// Biblioteca de som sintetizado. Nada de samples: tudo nasce de ruído e senos.
//
// Uso:
//   const S = createMix(DURATION);
//   S.pen(1.0, 2.4);                 // traço de caneta entre 1.0 s e 2.4 s
//   S.thump({ t: 5.6 });             // impacto grave (carimbo, porta)
//   S.piano(8.0, S.NOTE('D4'), 0.3);
//   S.silence(31.4, 32.6);           // silêncio absoluto (é um evento!)
//   S.finish('out/audio.wav');
//
// Mapa de gestos → sons (references/som.md tem o raciocínio):
//   traço técnico/caneta → pen      lápis/grafite → graphite    marcador → marker
//   algo entra/sai rápido → swoosh  impacto/fechamento → thump  tique/toque → click
//   tom sustentado/drone → tone     harmonia → piano (+ tone baixo como cama)

import fs from 'node:fs';
import path from 'node:path';

const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const db = (d) => Math.pow(10, d / 20);

export function createMix(DURATION, SR = 48000) {
  // Vigia: a síntese inteira leva segundos. Se passar de 3 min, há um laço infinito no seu audio.mjs.
  const watchdog = setTimeout(() => { console.error('ERRO: audio.mjs rodando há 3 min — quase certamente um laço infinito (ex.: intervalo que encolhe sem piso). Use S.accel().'); process.exit(2); }, 180000);
  watchdog.unref();
  const N = Math.ceil(DURATION * SR);
  const dry = [new Float32Array(N), new Float32Array(N)];
  const wet = [new Float32Array(N), new Float32Array(N)];
  const silences = [];
  let seed = 1234567;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const white = () => rand() * 2 - 1;

  // pan: -1 esquerda … 1 direita. send: quanto vai para o reverb (0..1).
  function put(i, v, pan = 0, send = 0) {
    if (i < 0 || i >= N) return;
    const l = Math.cos(((pan + 1) * Math.PI) / 4), r = Math.sin(((pan + 1) * Math.PI) / 4);
    dry[0][i] += v * l * (1 - send * 0.3); dry[1][i] += v * r * (1 - send * 0.3);
    if (send) { wet[0][i] += v * l * send; wet[1][i] += v * r * send; }
  }

  class Biquad {
    constructor(type, f, q = 0.707) { this.type = type; this.x1 = this.x2 = this.y1 = this.y2 = 0; this.set(f, q); }
    set(f, q = this.q) {
      this.q = q; const w = (TAU * clamp(f, 10, SR * 0.45)) / SR, c = Math.cos(w), s = Math.sin(w), a = s / (2 * q);
      let b0, b1, b2; const a0 = 1 + a, a1 = -2 * c, a2 = 1 - a;
      if (this.type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
      else if (this.type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
      else { b0 = a; b1 = 0; b2 = -a; }
      this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = a1 / a0; this.a2 = a2 / a0;
    }
    p(x) { const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2; this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y; return y; }
  }

  // Ruído filtrado com envelope. fEnd faz varredura de filtro (whoosh).
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
  // Impacto grave com queda de altura. Mais grave e longo = mais peso.
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
  const pen = (t0, t1, gain = 0.1, pan = 0) => {
    const fl = new Biquad('lp', 18, 0.7);
    noiseEvent({ t0, t1, f: 2300, q: 0.7, gain, attack: 0.012, release: 0.04, pan, send: 0.08, mod: () => 0.75 + 0.5 * Math.abs(fl.p(white()) * 30) });
  };
  const graphite = (t0, t1, gain = 0.1, pan = 0) => {
    let g = 1, cnt = 0;
    noiseEvent({ t0, t1, f: 4200, q: 0.9, gain, attack: 0.01, release: 0.05, pan, send: 0.1, mod: () => { if (cnt-- <= 0) { cnt = 60 + rand() * 120; g = rand() < 0.35 ? 1.4 : 0.45; } return g; } });
  };
  const swoosh = (t0, dur, gain = 0.08, pan = 0, fA = 500, fB = 2600) => noiseEvent({ t0, t1: t0 + dur, type: 'bp', f: fA, fEnd: fB, q: 0.6, gain, attack: dur * 0.6, release: dur * 0.5, pan, send: 0.2 });
  const marker = (t, gain = 0.05) => noiseEvent({ t0: t, t1: t + 0.42, f: 5200, q: 1.2, gain, attack: 0.02, release: 0.08, pan: -0.4, send: 0.1, mod: (_, u) => 0.6 + 0.4 * Math.sin(u * 20) });
  // Papel rasgando/descolando: ruído com estalos.
  const peel = (t, gain = 0.08, pan = 0) => { let g = 1, c = 0; noiseEvent({ t0: t, t1: t + 0.32, f: 3000, fEnd: 1400, q: 0.7, gain, attack: 0.02, release: 0.12, pan, send: 0.15, mod: () => { if (c-- <= 0) { c = 40 + rand() * 200; g = rand(); } return g; } }); };

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
  // Piano sintético: parciais levemente inarmônicos, decaimento por parcial, martelo.
  function piano(t0, f, vel = 0.3, pan = 0, sustain = 4) {
    const i0 = Math.floor(t0 * SR), len = Math.floor((sustain + 1.5) * SR), B = 0.00035;
    const parts = [1, 2, 3, 4, 5, 6, 7].map((k) => ({ f: k * f * Math.sqrt(1 + B * k * k), a: Math.pow(k, -1.45) * (k === 1 ? 1 : 0.8), d: (sustain * 0.9) / Math.pow(k, 0.75), ph: 0 }));
    const lp = new Biquad('lp', Math.min(9000, f * 9), 0.6), ham = new Biquad('bp', f * 3, 1.2);
    for (let k = 0; k < len; k++) {
      const x = k / SR;
      let v = 0;
      for (const p of parts) { if (p.f > 16000) continue; p.ph += (TAU * p.f) / SR; v += Math.sin(p.ph) * p.a * Math.exp(-x / p.d); }
      v += ham.p(white()) * Math.exp(-x * 90) * 0.4;
      put(i0 + k, lp.p(v) * Math.min(1, x / 0.004) * vel * 0.22, pan, 0.45);
    }
  }
  const NOTE = (n) => { const m = n.match(/^([A-G])(#|b)?(-?\d)$/); const s = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); return 440 * Math.pow(2, (s + (+m[3] + 1) * 12 - 69) / 12); };
  // Acorde: notas com leve arpejo (roll) e uma cama de cordas baixinha por baixo.
  function chord(t, notes, { vel = 0.26, roll = 0.035, sustain = 4, pad = 0.012, padDur = 3 } = {}) {
    notes.forEach((n, k) => piano(t + k * roll, NOTE(n), vel * (k === 0 ? 1.2 : 1), -0.3 + (k / notes.length) * 0.6, sustain));
    if (pad) notes.slice(0, 3).forEach((n, k) => tone(t, padDur, NOTE(n), pad, { attack: 0.9, release: 1.2, harm: [1, 0.2, 0.05], send: 0.6, pan: -0.4 + k * 0.4, vib: 0.002 }));
  }
  // Tom de sala: ruído grave quase inaudível. Sem ele, o silêncio "digital" soa quebrado.
  function roomTone(gain = 0.05) { const lp = new Biquad('lp', 700, 0.5); let b = 0; for (let i = 0; i < N; i++) { b = 0.997 * b + white() * 0.05; put(i, lp.p(b) * gain, 0, 0); } }
  const silence = (a, b) => silences.push([a, b]);
  // Tempos que ACELERAM entre t0 e t1 (relógio, pulsos, cliques de urgência).
  // Garante que termina: o intervalo nunca fica menor que minDt. Nunca escreva
  // for (t...; t += dt) { dt *= 0.9 } à mão: a soma geométrica pode não chegar
  // a t1 e o laço vira infinito (aconteceu em teste).
  function accel(t0, t1, dt0 = 0.5, ratio = 0.9, minDt = 0.08) {
    const out = []; let t = t0, dt = dt0;
    while (t < t1 && out.length < 2000) { out.push(t); t += dt; dt = Math.max(minDt, dt * ratio); }
    return out;
  }

  function freeverb(inp, spread) {
    const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((d) => ({ b: new Float32Array(Math.round(((d + spread) * SR) / 44100)), i: 0, f: 0 }));
    const aps = [556, 441, 341, 225].map((d) => ({ b: new Float32Array(Math.round(((d + spread) * SR) / 44100)), i: 0 }));
    const out = new Float32Array(N), fb = 0.86, damp = 0.35;
    for (let n = 0; n < N; n++) {
      const x = inp[n] * 0.015; let y = 0;
      for (const c of combs) { const o = c.b[c.i]; c.f = o * (1 - damp) + c.f * damp; c.b[c.i] = x + c.f * fb; if (++c.i >= c.b.length) c.i = 0; y += o; }
      for (const a of aps) { const o = a.b[a.i]; const v = -y + o; a.b[a.i] = y + o * 0.5; if (++a.i >= a.b.length) a.i = 0; y = v; }
      out[n] = y;
    }
    return out;
  }

  // Mixagem: reverb, silêncios absolutos, fade final, compressor suave (aproxima
  // o sussurro da caneta e a batida do carimbo), normalização e WAV 16 bits.
  function finish(file, { fadeOut = 1.4 } = {}) {
    const rv = [freeverb(wet[0], 0), freeverb(wet[1], 23)];
    const m = [new Float32Array(N), new Float32Array(N)];
    let peak = 0;
    for (let c = 0; c < 2; c++) for (let i = 0; i < N; i++) {
      let v = dry[c][i] + rv[c][i] * 1.4;
      const t = i / SR;
      if (silences.some(([a, b]) => t >= a && t < b)) v = 0;
      if (t > DURATION - fadeOut) v *= Math.max(0, (DURATION - t) / fadeOut);
      m[c][i] = v; peak = Math.max(peak, Math.abs(v));
    }
    let env = 0; const att = Math.exp(-1 / (0.005 * SR)), rel = Math.exp(-1 / (0.18 * SR)), thr = peak * db(-20), ratio = 3;
    let p2 = 0;
    for (let i = 0; i < N; i++) {
      const x = Math.max(Math.abs(m[0][i]), Math.abs(m[1][i]));
      env = x > env ? att * env + (1 - att) * x : rel * env + (1 - rel) * x;
      const gr = env > thr ? Math.pow(env / thr, 1 / ratio - 1) : 1;
      m[0][i] *= gr; m[1][i] *= gr; p2 = Math.max(p2, Math.abs(m[0][i]), Math.abs(m[1][i]));
    }
    // Normalização por nível médio dos trechos com som (não pelo pico): mira
    // ~ -17 LUFS; os picos que passarem são domados pelo limitador suave (tanh).
    let e = 0, cnt = 0;
    for (let s0 = 0; s0 + 1 <= DURATION; s0 += 1) {
      const a = Math.floor(s0 * SR), b = Math.floor((s0 + 1) * SR); let w = 0;
      for (let i = a; i < b; i++) { const v = (m[0][i] + m[1][i]) * 0.5; w += v * v; }
      w /= b - a; if (w > 1e-9) { e += w; cnt++; }
    }
    const rms = Math.sqrt(e / Math.max(1, cnt));
    const g = Math.min(db(-17) / (rms || 1), db(3) / (p2 || 1));
    const buf = Buffer.alloc(44 + N * 4);
    buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
    buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
    buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
    for (let i = 0; i < N; i++) for (let c = 0; c < 2; c++) buf.writeInt16LE(Math.round(Math.tanh(m[c][i] * g) * 32767 * 0.97), 44 + i * 4 + c * 2);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, buf);
    console.log(`ok → ${file}`);
    // Relatório de nível por segundo (RMS em dBFS, depois da normalização).
    // Isto é MEDIÇÃO: não precisa ouvir. Trechos mudos fora de S.silence() são defeito.
    const warn = [];
    let line = '';
    for (let s0 = 0; s0 < DURATION; s0 += 1) {
      const a = Math.floor(s0 * SR), b = Math.min(N, Math.floor((s0 + 1) * SR));
      let e = 0; for (let i = a; i < b; i++) { const v = (m[0][i] + m[1][i]) * 0.5 * g; e += v * v; }
      const dbv = 10 * Math.log10(e / Math.max(1, b - a) + 1e-12); // aproximado (antes do limitador)
      line += `${String(s0).padStart(3)}s ${dbv.toFixed(0).padStart(4)} dB${s0 % 6 === 5 ? '\n' : ' |'}`;
      const inSilence = silences.some(([x, y]) => s0 + 0.5 >= x && s0 + 0.5 < y);
      if (!inSilence && dbv < -50 && s0 < DURATION - fadeOut) warn.push(`${s0}–${s0 + 1}s`);
    }
    console.log('nível por segundo:\n' + line);
    if (warn.length) console.log(`ATENÇÃO: quase mudo em ${warn.join(', ')} — todo gesto visual nesses trechos precisa de som (e roomTone() deve estar ligado).`);
    else console.log('nível ok: nenhum trecho mudo fora dos silêncios intencionais.');
  }

  return { SR, N, put, rand, white, Biquad, noiseEvent, thump, click, pen, graphite, swoosh, marker, peel, tone, piano, NOTE, chord, roomTone, silence, accel, finish };
}
