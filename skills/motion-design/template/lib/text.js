// Tipografia cinética: cada linha é uma máscara; as palavras sobem de dentro
// dela uma a uma e saem pelo topo. Marcação nas palavras:
//   *palavra  → marcador (faixa de cor por trás, borda irregular)
//   ^palavra  → cor de destaque
// Palavras marcadas vizinhas recebem um único marcador contínuo.
//
// Lições que custaram retrabalho (não desfaça):
//   - entrelinha 1.2: acentos de maiúsculas (Ã, Õ, Ú, Ê) em fontes condensadas
//     como Anton sobem muito e encostam na linha de cima com entrelinha menor;
//   - a máscara vai de 1.25×size acima da linha de base até 0.32×size abaixo,
//     senão corta acento em cima e cedilha embaixo;
//   - a saída sobe 1.6×size: menos que isso deixa uma lasca do marcador visível.

import { E, prog, noise1 } from './core.js';

// x, y: posição na TELA (px). align: 'left' (x é a borda esquerda, padrão),
// 'center' (x é o centro de cada linha) ou 'right'. valign: 'middle' (o bloco
// fica centrado verticalmente em y, padrão) ou 'top' (y é a 1ª linha de base).
export function makeText({ lines, x = 100, y = 540, size = 110, font = 'Anton', tIn, tOut, mark = null, maxW = null, stagger = 0.07, colors, align = 'left', valign = 'middle' }) {
  const words = lines.map((l) => l.split(' ').map((w) => ({ mark: w.includes('*'), accent: w.includes('^'), w: w.replace(/[*^]/g, '') })));
  return { words, x, y, size, font, tIn, tOut, mark, maxW, stagger, colors, align, valign, layout: null };
}

function layoutText(ctx, d) {
  if (d.layout) return d.layout;
  let size = d.size;
  ctx.font = `${size}px ${d.font}`;
  const widest = Math.max(...d.words.map((ws) => ctx.measureText(ws.map((w) => w.w).join(' ')).width));
  if (d.maxW && widest > d.maxW) size = Math.floor((size * d.maxW) / widest);
  if (size < 28) console.warn(`texto com corpo ${size}px é pequeno demais para vídeo: "${d.words.map((ws) => ws.map((w) => w.w).join(' ')).join(' / ')}"`);
  ctx.font = `${size}px ${d.font}`;
  const cap = ctx.measureText('H').actualBoundingBoxAscent, sp = ctx.measureText(' ').width, lh = size * 1.2;
  const y0 = d.valign === 'top' ? d.y : d.y - ((d.words.length - 1) * lh) / 2 + cap / 2;
  const lines = d.words.map((ws, li) => {
    const lw = ctx.measureText(ws.map((w) => w.w).join(' ')).width;
    let x = d.align === 'center' ? d.x - lw / 2 : d.align === 'right' ? d.x - lw : d.x;
    return ws.map((w) => { const width = ctx.measureText(w.w).width; const o = { ...w, x, width, y: y0 + li * lh }; x += width + sp; return o; }); });
  return (d.layout = { size, cap, lines });
}

export function drawText(ctx, d, t) {
  if (t < d.tIn - 0.1 || t > d.tOut + 1.2) return;
  const { size, cap, lines } = layoutText(ctx, d);
  const C = d.colors;
  ctx.save();
  ctx.font = `${size}px ${d.font}`; ctx.textBaseline = 'alphabetic';
  let k = 0;
  lines.forEach((ws) => {
    const y = ws[0].y;
    ctx.save();
    ctx.beginPath(); ctx.rect(ws[0].x - 60, y - size * 1.25, 4000, size * 1.25 + size * 0.32); ctx.clip();
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
      const nxt = ws[i + 1] && ws[i + 1].mark;
      const yo = anim[i], x0 = w.x - (i > 0 && ws[i - 1].mark ? 2 : size * 0.06);
      const x1 = x0 + (w.width + (nxt ? ws[i + 1].x - w.x - w.width + 4 : size * 0.14)) * mp;
      const top = y - cap * 0.58 + yo, bot = y + size * 0.07 + yo;
      ctx.fillStyle = C.marker; ctx.beginPath();
      ctx.moveTo(x0, top + 3);
      for (let s = 0; s <= 8; s++) { const xx = x0 + ((x1 - x0) * s) / 8; ctx.lineTo(xx, top + noise1(xx * 0.05 + 3) * 3); }
      ctx.lineTo(x1 + 4, (top + bot) / 2);
      for (let s = 8; s >= 0; s--) { const xx = x0 + ((x1 - x0) * s) / 8; ctx.lineTo(xx, bot + noise1(xx * 0.05 + 9) * 3); }
      ctx.closePath(); ctx.fill();
    });
    ws.forEach((w, i) => { ctx.fillStyle = w.accent ? C.accent : C.ink; ctx.fillText(w.w, w.x, y + anim[i]); });
    ctx.restore();
  });
  ctx.restore();
}

// Uma linha isolada que sobe de dentro da própria máscara (cartões finais,
// legendas). draw() desenha a linha na posição final; h = altura da máscara.
export function lineReveal(ctx, t0, t, h, y, draw) {
  const p = E.outExpo(prog(t, t0, t0 + 0.9));
  if (p <= 0) return;
  ctx.save(); ctx.beginPath(); ctx.rect(0, y - h, 99999, h * 1.35); ctx.clip();
  ctx.translate(0, (1 - p) * h * 1.2); draw(); ctx.restore();
}

// Cartão final pronto (receita 17). Os tamanhos já são legíveis em celular;
// não diminua. Cada linha sobe da própria máscara, em cascata a partir de t0.
//   drawEndCard(ctx, t, T.endIn, {
//     label: 'OFICINA · INICIANTES',          // pequeno, cor de destaque, caixa alta
//     main: 'SÁBADO, 12 DE OUTUBRO',           // o dado principal, enorme (display)
//     sub: '14H ÀS 18H · 12 VAGAS',            // segunda linha em display, menor (opcional)
//     lines: ['Ateliê Barro Vivo, Belo Horizonte'],   // 0–2 linhas de apoio (texto)
//     url: 'BARROVIVO.COM.BR/OFICINA',         // display, cor de destaque
//   }, { colors: C, display: 'Anton', text: 'Roboto', x: 100, maxW: 1720 });
// x = borda esquerda da coluna (use 830 se um emblema/desenho ocupar a esquerda, com maxW 990).
export function drawEndCard(ctx, t, t0, { label, main, sub, lines = [], url }, { colors: C, display = 'Anton', text = 'Roboto', x = 100, maxW = 1720, y = 330 } = {}) {
  const fit = (font, size, str) => { ctx.font = `${size}px ${font}`; const w = ctx.measureText(str).width; return w > maxW ? Math.floor((size * maxW) / w) : size; };
  ctx.save(); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  let yy = y, k = 0;
  const step = () => t0 + 0.12 * k++;
  if (label) { const tt = step(), yl = yy; lineReveal(ctx, tt, t, 32, yl, () => { ctx.font = `700 30px ${text}`; ctx.letterSpacing = '5px'; ctx.fillStyle = C.accent; ctx.fillText(label, x, yl); }); yy += 40; }
  if (main) { const sz = fit(display, 140, main), tt = step(); yy += sz * 0.95; const ym = yy; lineReveal(ctx, tt, t, sz, ym, () => { ctx.font = `${sz}px ${display}`; ctx.letterSpacing = '0px'; ctx.fillStyle = C.ink; ctx.fillText(main, x - 4, ym); }); yy += 20; }
  if (sub) { const sz = fit(display, 80, sub), tt = step(); yy += sz * 1.0; const ys = yy; lineReveal(ctx, tt, t, sz, ys, () => { ctx.font = `${sz}px ${display}`; ctx.letterSpacing = '0px'; ctx.fillStyle = C.ink; ctx.fillText(sub, x - 2, ys); }); yy += 16; }
  for (const l of lines.slice(0, 2)) { const tt = step(); yy += 50; const yl2 = yy; lineReveal(ctx, tt, t, 40, yl2, () => { ctx.font = `400 38px ${text}`; ctx.letterSpacing = '0px'; ctx.fillStyle = C.ink; ctx.fillText(l, x, yl2); }); }
  if (url) { const sz = fit(display, 76, url), tt = step() + 0.1; yy += sz + 40; const yu = yy; lineReveal(ctx, tt, t, sz, yu, () => { ctx.font = `${sz}px ${display}`; ctx.letterSpacing = '1px'; ctx.fillStyle = C.accent; ctx.fillText(url, x - 2, yu); }); }
  ctx.restore();
  return yy; // y da última linha (para posicionar logo/rota abaixo)
}
