// Motor: carrega fontes e imagens, expõe window.ready e window.renderFrame(t)
// para o renderizador (render.mjs), com motion blur por acumulação.
//
// Contrato que torna tudo possível: draw(ctx, t) é uma FUNÇÃO PURA DO TEMPO.
// Nada de estado que muda entre quadros, nada de Math.random(), nada de
// Date.now(). Se precisar de algo "que aconteceu antes", recalcule a partir de t.

import { canvas } from './core.js';

export function boot({ fonts = [], images = {}, setup = async () => {}, draw, W = 1920, H = 1080 }) {
  const out = document.getElementById('c');
  out.width = W; out.height = H;
  const octx = out.getContext('2d');
  const IMG = {};
  // ?debug=1 (ou render.mjs --stills --debug): grade, margem de segurança e
  // origem do mundo desenhadas por cima. Use sempre que algo "sumiu" da tela.
  window.DEBUG = new URLSearchParams(location.search).has('debug');
  let buf, bufCtx, acc, accCtx;

  window.ready = (async () => {
    for (const f of fonts) { const face = new FontFace(f.family, `url(${f.url})`, { weight: String(f.weight || 400) }); await face.load(); document.fonts.add(face); }
    await Promise.all(Object.entries(images).map(([k, src]) => new Promise((res, rej) => { const i = new Image(); i.onload = () => { IMG[k] = i; res(); }; i.onerror = () => rej(new Error('imagem não carregou: ' + src)); i.src = src; })));
    await setup({ ctx: octx, IMG, W, H });
    buf = canvas(W, H); bufCtx = buf.getContext('2d');
    acc = canvas(W, H); accCtx = acc.getContext('2d');
    return true;
  })();

  // samples > 1: motion blur real (obturador de 180°). 4 é um bom valor final.
  window.renderFrame = (t, samples = 1, fps = 30) => {
    if (samples <= 1) { octx.setTransform(1, 0, 0, 1, 0, 0); draw(octx, t, IMG); if (window.DEBUG) debugOverlay(octx, W, H, t); return; }
    accCtx.setTransform(1, 0, 0, 1, 0, 0); accCtx.globalAlpha = 1; accCtx.clearRect(0, 0, W, H);
    for (let i = 0; i < samples; i++) {
      const ts = t + (i / samples - 0.5) * (0.5 / fps);
      bufCtx.setTransform(1, 0, 0, 1, 0, 0); bufCtx.globalAlpha = 1;
      draw(bufCtx, ts, IMG);
      accCtx.globalAlpha = 1 / (i + 1);
      accCtx.drawImage(buf, 0, 0);
    }
    octx.setTransform(1, 0, 0, 1, 0, 0); octx.drawImage(acc, 0, 0);
  };
  return IMG;
}

function debugOverlay(g, W, H, t) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.strokeStyle = 'rgba(255,0,120,0.35)'; g.lineWidth = 1; g.font = '14px monospace'; g.fillStyle = 'rgba(255,0,120,0.8)';
  for (let x = 0; x <= W; x += 192) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); g.fillText(String(x), x + 3, 14); }
  for (let y = 0; y <= H; y += 108) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); g.fillText(String(y), 3, y - 3); }
  g.strokeStyle = 'rgba(255,0,120,0.9)'; g.setLineDash([10, 8]); g.strokeRect(100, 100, W - 200, H - 200);
  g.setLineDash([]); g.fillText(`t=${t.toFixed(2)}s  (tracejado = margem de segurança 100px)`, 110, H - 110);
  g.restore();
}
