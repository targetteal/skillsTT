// Câmera 2D por quadros-chave. O "mundo" tem coordenadas próprias; a câmera
// diz qual ponto do mundo (cx, cy) aparece no centro da tela e com que escala s.
//
// Cada chave: { t, cx, cy, s, e } — e é a curva do trecho que TERMINA nela:
//   'lin'  deriva lenta (dá vida a planos parados: 0.70 → 0.745 em 10 s)
//   'io'   deslocamento normal
//   'zoom' mudança grande de escala: interpola em escala logarítmica,
//          senão o zoom parece acelerar no fim (é assim que se faz um "recuo
//          que revela" convincente)
import { E, prog, lerp } from './core.js';

export function makeCamera(keys, W = 1920, H = 1080) {
  const cam = (t) => {
    if (t <= keys[0].t) return keys[0];
    for (let i = 1; i < keys.length; i++) {
      const a = keys[i - 1], b = keys[i];
      if (t > b.t) continue;
      const x = prog(t, a.t, b.t);
      if (b.e === 'lin') return { cx: lerp(a.cx, b.cx, x), cy: lerp(a.cy, b.cy, x), s: lerp(a.s, b.s, x) };
      const k = E.io(x);
      if (b.e === 'zoom') {
        const s = Math.exp(lerp(Math.log(a.s), Math.log(b.s), k));
        const w = (1 / s - 1 / a.s) / (1 / b.s - 1 / a.s || 1);
        return { cx: lerp(a.cx, b.cx, w), cy: lerp(a.cy, b.cy, w), s };
      }
      return { cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), s: lerp(a.s, b.s, k) };
    }
    return keys[keys.length - 1];
  };
  cam.W = W; cam.H = H;
  return cam;
}

// Chave que põe o ponto do MUNDO (wx, wy) na posição de TELA (sx, sy) com escala s.
// Desenhe o protagonista em torno da origem do mundo (0,0) e use:
//   frame(1, 0, 0)             → (0,0) do mundo no centro da tela, tamanho real
//   frame(0.7, 0, 0, 1360, 540) → protagonista à direita, espaço para texto à esquerda
//   frame(2, 0, 0)             → aproximado (2×)
// ERRO COMUM: passar coordenadas de tela como wx, wy (ex.: frame(1.5, 960, 540)):
// isso centraliza o ponto (960,540) DO MUNDO e o seu desenho em (0,0) some da tela.
export const frame = (s, wx, wy, sx = 960, sy = 540, W = 1920, H = 1080) => ({ cx: wx - (sx - W / 2) / s, cy: wy - (sy - H / 2) / s, s });

export const toScreen = (c, x, y, W = 1920, H = 1080) => [(x - c.cx) * c.s + W / 2, (y - c.cy) * c.s + H / 2];

// Aplica a câmera (e um tremor opcional) ao contexto.
export function applyCamera(ctx, c, shx = 0, shy = 0, W = 1920, H = 1080) {
  ctx.setTransform(c.s, 0, 0, c.s, W / 2 - c.cx * c.s + shx, H / 2 - c.cy * c.s + shy);
  if (typeof window !== 'undefined' && window.DEBUG) {
    // cruz na origem do mundo (0,0) e eixos a cada 100 unidades
    ctx.save(); ctx.strokeStyle = 'rgba(0,120,255,0.8)'; ctx.lineWidth = 2 / c.s; ctx.font = `${14 / c.s}px monospace`; ctx.fillStyle = 'rgba(0,120,255,0.9)';
    ctx.beginPath(); ctx.moveTo(-60 / c.s, 0); ctx.lineTo(60 / c.s, 0); ctx.moveTo(0, -60 / c.s); ctx.lineTo(0, 60 / c.s); ctx.stroke();
    ctx.fillText('mundo (0,0)', 6 / c.s, -6 / c.s); ctx.restore();
  }
}

// Tremor de impacto: hits = [[tempo, amplitude_px], ...]. Decai em ~0.5 s.
export function shake(t, hits) {
  let x = 0, y = 0;
  hits.forEach(([h, a], i) => {
    const d = t - h; if (d < 0 || d > 0.8) return;
    const k = a * Math.exp(-d * 9);
    x += k * Math.sin(d * 44 + i * 2.1); y += k * Math.cos(d * 37 + i * 1.3);
  });
  return [x, y];
}
