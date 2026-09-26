// Superfície: papel com fibra, grão por cima de tudo e hachura de desenho técnico.
// O grão é o que faz o vídeo parecer "impresso" e não "renderizado": não tire.

import { rng, hash, canvas } from './core.js';

export function makePaper(W, H, color = '#F2EFEB', seed = 11) {
  const c = canvas(W + 160, H + 160), g = c.getContext('2d');
  g.fillStyle = color; g.fillRect(0, 0, c.width, c.height);
  const id = g.getImageData(0, 0, c.width, c.height), d = id.data, r = rng(seed);
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

export function makeGrain(W, H, seed = 23) {
  const c = canvas(W + 160, H + 160), g = c.getContext('2d');
  const id = g.createImageData(c.width, c.height), d = id.data, r = rng(seed);
  for (let i = 0; i < d.length; i += 4) { const v = 255 - Math.pow(r(), 6) * 70; d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255; }
  g.putImageData(id, 0, 0);
  return c;
}

export function makeHatch(ctx, color = '#1E1E1E', size = 12) {
  const c = canvas(size, size), g = c.getContext('2d');
  g.strokeStyle = color; g.lineWidth = 1.3;
  for (const o of [-size, 0, size]) { g.beginPath(); g.moveTo(o, size); g.lineTo(o + size, 0); g.stroke(); }
  return ctx.createPattern(c, 'repeat');
}

// Fundo: o papel desliza um pouco a cada "boil" (12 fps), como filme.
export function drawPaper(ctx, tex, boil) {
  const gx = hash(boil) * 120, gy = hash(boil + 0.5) * 120;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(tex, -gx * 0.3 - 20, -gy * 0.3 - 20);
}
// Grão: SEMPRE a última coisa desenhada no quadro.
export function drawGrain(ctx, tex, boil, strength = 0.28) {
  const gx = hash(boil) * 120, gy = hash(boil + 0.5) * 120;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = strength;
  ctx.drawImage(tex, -gx, -gy); ctx.restore();
}
