// Efeitos compostos. Cada um é uma receita testada no vídeo "Planta ≠ Mapa".

import { E, prog, lerp, spring, rng, hash, canvas, clamp } from './core.js';
import { mkPath, resample, pointAt, stroke, strokeSequence } from './path.js';

// ─── Carimbo ────────────────────────────────────────────────────────────────
// Antecipação (cai de 1.45× em 0.13 s) → impacto com quique → peso (tremor de
// câmera no mesmo instante, som grave no mesmo instante). Textura com falhas
// de tinta e blend 'multiply' para parecer tinta no papel, não adesivo.
export function makeStamp(text, color, seed = 1, font = 'Anton', size = 62) {
  const pad = 30, probe = canvas(10, 10).getContext('2d');
  probe.font = `${size}px ${font}`;
  const tw = probe.measureText(text).width, cap = probe.measureText('H').actualBoundingBoxAscent;
  const w = Math.ceil(tw + pad * 2), h = Math.ceil(cap + pad * 2);
  const c = canvas(w, h), g = c.getContext('2d');
  g.strokeStyle = color; g.fillStyle = color;
  g.lineWidth = 7; g.strokeRect(5, 5, w - 10, h - 10);
  g.lineWidth = 2; g.strokeRect(15, 15, w - 30, h - 30);
  g.font = `${size}px ${font}`; g.fillText(text, pad, pad + cap);
  const r = rng(seed);
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 900; i++) { g.globalAlpha = 0.4 + r() * 0.6; g.beginPath(); g.arc(r() * w, r() * h, 0.4 + Math.pow(r(), 3) * 3.2, 0, 7); g.fill(); }
  for (let i = 0; i < 14; i++) { g.globalAlpha = 0.25 + r() * 0.4; g.lineWidth = 0.6 + r() * 1.6; const y = r() * h; g.beginPath(); g.moveTo(r() * w * 0.4, y); g.lineTo(w * (0.5 + r() * 0.5), y + (r() - 0.5) * 4); g.stroke(); }
  for (let i = 0; i < 6; i++) { g.globalAlpha = 0.18; g.beginPath(); g.arc(r() * w, r() * h, 20 + r() * 50, 0, 7); g.fill(); }
  return { c, w, h };
}
// s = { st: makeStamp(...), x, y, rot (graus), hit (s), peel (s, opcional), dir: [dx, dy] }
export function drawStamp(ctx, s, t, paper = 'rgba(242,239,235,0.92)') {
  const d = t - s.hit;
  if (d < -0.13) return;
  const dp = s.peel != null ? t - s.peel : -1;
  if (dp > 1.0) return;
  let sc, a, rot = s.rot, x = s.x, y = s.y, shadow = 0;
  if (d < 0) { const q = 1 + d / 0.13; sc = lerp(1.45, 1, E.in2(q)); a = q; shadow = (1 - q) * 22; }
  else { sc = 1 - 0.05 * Math.exp(-d * 16) * Math.cos(d * 42); a = 1; }
  if (dp > 0) {
    const lift = E.out3(prog(dp, 0, 0.18)), fly = E.in3(prog(dp, 0.1, 0.85));
    sc *= 1 + 0.06 * lift; shadow = 16 * lift;
    const dir = s.dir || [0, -1];
    x += dir[0] * fly * 1300; y += dir[1] * fly * 1000; rot += (dir[0] >= 0 ? 1 : -1) * fly * 45;
  }
  const st = s.st;
  ctx.save(); ctx.translate(x, y); ctx.rotate((rot * Math.PI) / 180); ctx.scale(sc, sc); ctx.globalAlpha *= a;
  if (shadow > 0.5) { ctx.save(); ctx.globalAlpha *= 0.1; ctx.fillStyle = '#1E1E1E'; ctx.fillRect(-st.w / 2 + shadow * 0.5, -st.h / 2 + shadow, st.w, st.h); ctx.restore(); }
  if (dp > 0) { ctx.fillStyle = paper; ctx.fillRect(-st.w / 2, -st.h / 2, st.w, st.h); }
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(st.c, -st.w / 2, -st.h / 2);
  ctx.restore();
}

// ─── Folha de papel manteiga ────────────────────────────────────────────────
// Folha translúcida que entra deslizando com mola e recebe um desenho.
// sheet = { cx, cy, w, h, rot, from: [dx, dy], tIn, draw: [t0, t1], paths: [mkPath...],
//           style: {color, width, amp, passes, dash}, note: {text, x, y}, out (s, opcional) }
// Os desenhos ficam em coordenadas do plano de baixo (alinhados ao que está sob a folha).
export function sheetPose(s, t) {
  const e = spring(t - s.tIn, 0.62, 9);
  let x = s.cx + s.from[0] * (1 - e), y = s.cy + s.from[1] * (1 - e), rot = s.rot + (1 - e) * (s.from[0] > 0 ? 9 : -9);
  if (s.out != null && t > s.out) { const o = E.in3(prog(t, s.out, s.out + 0.6)); x += o * 1700; y -= o * 120; rot += o * 10; }
  return { x, y, rot };
}
export function drawSheet(ctx, s, t, boil, noteFont = '700 30px Roboto') {
  if (t < s.tIn || (s.out != null && t > s.out + 0.7)) return;
  const pose = sheetPose(s, t);
  ctx.save();
  ctx.translate(pose.x, pose.y); ctx.rotate((pose.rot * Math.PI) / 180);
  ctx.shadowColor = 'rgba(30,30,30,0.09)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 8;
  ctx.fillStyle = 'rgba(247,245,241,0.58)'; ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h);
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(30,30,30,0.2)'; ctx.lineWidth = 1.6; ctx.strokeRect(-s.w / 2, -s.h / 2, s.w, s.h);
  ctx.restore();
  ctx.save();
  ctx.translate(pose.x, pose.y); ctx.rotate(((pose.rot - s.rot) * Math.PI) / 180); ctx.translate(-s.cx, -s.cy);
  const head = strokeSequence(ctx, s.paths, E.sine(prog(t, s.draw[0], s.draw[1])), { ...s.style, boil });
  if (head) { ctx.fillStyle = s.style.color; ctx.beginPath(); ctx.arc(head[0], head[1], 5, 0, 7); ctx.fill(); }
  const np = prog(t, s.draw[1] - 0.15, s.draw[1] + 0.35);
  if (np > 0 && s.note) {
    ctx.font = noteFont; ctx.letterSpacing = '4px'; ctx.fillStyle = s.note.color || s.style.color;
    ctx.fillText(s.note.text.slice(0, Math.ceil(s.note.text.length * np)), s.note.x, s.note.y);
  }
  if (s.extra) s.extra(ctx, t, boil);
  ctx.restore();
}

// ─── Linhas que viram outra forma ───────────────────────────────────────────
// buildMorph: pega N polilinhas de origem (em coordenadas de TELA) e as
// reamostra para M pontos. drawMorph: interpola cada ponto até target(i, u, t),
// com atraso aleatório por linha — o desenho "se desfaz" e se reorganiza.
// Use para transições conceituais: planta → cabelo, texto → rio, mapa → rede.
export function buildMorph(sources, { n = 96, m = 70, colors = ['#1E1E1E'], widths = [2.5, 7], spread = 0.75 } = {}) {
  const lines = [];
  for (let i = 0; i < n; i++) {
    const S = mkPath(sources[(i * 13) % sources.length]);
    lines.push({ from: resample(S, m), off: i / (n - 1) - 0.5, color: colors[i % colors.length], width: lerp(widths[0], widths[1], (i % 5) / 4), delay: hash(i * 3.3) * spread });
  }
  return lines;
}
export function drawMorph(ctx, lines, t, t0, dur, target, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  lines.forEach((l, i) => {
    const p = E.io(prog(t, t0 + l.delay, t0 + l.delay + dur));
    ctx.strokeStyle = p > 0.5 ? l.color : '#1E1E1E'; ctx.lineWidth = lerp(2.2, l.width, p);
    ctx.beginPath();
    l.from.forEach(([x, y], k) => {
      const [hx, hy] = target(i, k / (l.from.length - 1), t, l.off);
      const X = lerp(x, hx, p), Y = lerp(y, hy, p);
      k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
    });
    ctx.stroke();
  });
  ctx.restore();
}
// Alvo pronto: faixa ondulada ao longo de uma espinha (caminho) com largura variável.
export function bandTarget(spinePath, { w0 = 330, w1 = 150, waves = 18, amp = 34, speed = 2.2 } = {}) {
  return (i, u, t, off, spread = 1) => {
    const q = pointAt(spinePath, spinePath.len * u);
    const band = lerp(w0, w1, u);
    const wave = Math.sin(u * waves - t * speed + off * 2.5) * amp + Math.sin(u * 7 + i * 0.3 - t * 0.8) * 12;
    const o = off * band * spread + wave;
    return [q[0] + q[2] * o, q[1] + q[3] * o];
  };
}

// ─── Revelar uma imagem por dentro de linhas ───────────────────────────────
// Desenha `drawImageLayer(g)` numa camada e a recorta pelas mesmas linhas,
// que engrossam e se espalham até cobrir o quadro (r de 0 a 1). Borda com
// leve desfoque. Transição muito mais bonita que um fade.
let _layer, _mask;
export function revealThroughLines(ctx, r, drawImageLayer, lines, target, t, W = 1920, H = 1080) {
  if (r >= 1) { drawImageLayer(ctx); return; }
  if (r <= 0) return;
  _layer ||= canvas(W, H); _mask ||= canvas(W, H);
  const cg = _layer.getContext('2d'); cg.setTransform(1, 0, 0, 1, 0, 0); cg.clearRect(0, 0, W, H);
  drawImageLayer(cg);
  const mg = _mask.getContext('2d'); mg.setTransform(1, 0, 0, 1, 0, 0); mg.clearRect(0, 0, W, H);
  mg.strokeStyle = '#000'; mg.lineCap = 'round'; mg.lineJoin = 'round';
  mg.filter = `blur(${lerp(1, 10, r)}px)`;
  const wdt = lerp(4, 120, E.in2(r)), spread = 1 + 5.5 * E.in3(r);
  lines.forEach((l, i) => {
    mg.lineWidth = wdt * (0.6 + hash(i) * 0.8); mg.beginPath();
    for (let k = 0; k <= 40; k++) { const [x, y] = target(i, k / 40, t, l.off, spread); k ? mg.lineTo(x, y) : mg.moveTo(x, y); }
    mg.stroke();
  });
  mg.filter = 'none';
  cg.globalCompositeOperation = 'destination-in'; cg.drawImage(_mask, 0, 0); cg.globalCompositeOperation = 'source-over';
  ctx.drawImage(_layer, 0, 0);
}

// ─── Contágio: uma transformação que se espalha a partir de um ponto ───────
// Devolve m ∈ [0,1] para um ponto (x, y): 0 = ainda não foi atingido.
// Use com stroke({ ampFn: (x, y) => 6 * spreadFrom(...) }) para o traço
// técnico virar lápis em onda a partir de onde o lápis encostou.
export function spreadFrom(t, t0, origin, x, y, speed = 1150, soft = 320) {
  if (t < t0) return 0;
  return clamp(((t - t0) * speed - Math.hypot(x - origin[0], y - origin[1])) / soft);
}

// ─── Lápis (silhueta chapada) ───────────────────────────────────────────────
export function drawPencil(ctx, x, y, ang, { ink = '#1E1E1E', paper = '#F2EFEB', band = '#256675' } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  const hw = 17;
  ctx.fillStyle = 'rgba(30,30,30,0.1)'; ctx.fillRect(40, -hw + 14, 620, hw * 2);
  ctx.fillStyle = ink; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(20, -5); ctx.lineTo(20, 5); ctx.fill();
  ctx.fillStyle = paper; ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(18, -5); ctx.lineTo(70, -hw); ctx.lineTo(70, hw); ctx.lineTo(18, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = ink; ctx.fillRect(70, -hw, 500, hw * 2);
  ctx.fillStyle = band; ctx.fillRect(570, -hw - 1, 38, hw * 2 + 2);
  ctx.fillStyle = ink; ctx.fillRect(608, -hw + 1, 48, hw * 2 - 2);
  ctx.restore();
}

export { stroke };
