/* Plano de exemplo · os traços desenham uma forma (transição "tracos-desenham-forma").
 * Mostra: match cut com elementos de outro plano (c.shared), SVG com pathLength, camK com inclinação 3D,
 * rótulos por categoria (--c1..--c3), fundo/poeira/primeiro plano. */
Deck.plano({
  id: "forma",
  numero: "02",
  regiao: [0, 0],
  build(c) {
    const V = [[1320, 214], [932, 886], [1708, 886]];
    const s = c.svg("svg", { class: "w", width: 1, height: 1 }, c.g);
    const tri = c.svg("path", { d: `M${V[0]} L${V[1]} L${V[2]} Z`, fill: "none", stroke: "var(--tinta)", "stroke-width": 1.8, pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1 }, s);
    const orbita = c.svg("circle", { cx: 1320, cy: 662, r: 190, fill: "none", stroke: "var(--tinta)", opacity: .35, pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1 }, s);
    const pontos = V.map((v, i) => { const e = c.svg("circle", { cx: v[0], cy: v[1], r: 15, fill: `var(--c${i + 1})` }, s); gsap.set(e, { scale: 0, transformOrigin: "50% 50%" }); return e; });
    const nomes = ["Processos", "Pessoas", "Decisões"], pos = [[1410, 176], [760, 914], [1400, 914]];
    const rotulos = nomes.map((n, i) => c.lines(c.div("w display", "", c.g, { left: pos[i][0] + "px", top: pos[i][1] + "px", width: "520px", whiteSpace: "nowrap", fontSize: "66px", lineHeight: "1" }), [n]));
    // alvo de cada traço no perímetro do triângulo, com a rotação da aresta
    const lados = [[V[0], V[1]], [V[1], V[2]], [V[2], V[0]]];
    const alvos = c.shared.tracos.map((el, i) => {
      const u = i / 98 * 3, si = Math.floor(u), f = u - si, [a, b] = lados[si];
      const x0 = parseFloat(el.style.left) + 1.5, y0 = parseFloat(el.style.top) + 9;
      return { el, dx: a[0] + (b[0] - a[0]) * f - x0, dy: a[1] + (b[1] - a[1]) * f - y0, rot: Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI };
    });
    // profundidade: desenho gigante ao fundo, poeira, um hexágono passando rente à câmera no meio do movimento
    c.fundo(`<svg viewBox="-2500 -2000 6000 5000" width="6000" height="5000" style="position:absolute;left:-2500px;top:-2000px" fill="none" stroke="var(--tinta)"><path d="M1320 -1600 L-672 1850 L3312 1850 Z" stroke-width="4" opacity=".12"></path><circle cx="1320" cy="700" r="1500" stroke-width="3" opacity=".07"></circle></svg>`);
    c.poeira([[960, 540]]);
    c.primeiroPlano([[1750, 900, 520, `<svg viewBox="-340 -340 680 680" width="680" height="680"><polygon points="${c.hexPts(330)}" fill="none" stroke="var(--tinta)" stroke-width="3"></polygon></svg>`, 7, .25]]);
    return { tri, orbita, pontos, rotulos, alvos };
  },
  beats: [
    { dur: 3.6, hold: 2.2, run(t, c) {
      const p = c.p.forma, q = c.p.pergunta;
      c.conceal(q.linhas, t);
      c.tl.to(q.col, { opacity: 0, duration: .5 }, t + .1);
      c.tl.to(q.regua, { scaleX: 0, transformOrigin: "100% 50%", duration: .8, ease: "power3.in" }, t + .1);
      p.alvos.forEach((a, i) => c.tl.to(a.el, { x: a.dx, y: a.dy, rotation: a.rot, duration: 1.9, ease: "power3.inOut" }, t + .35 + i * .007));
      c.tl.to(p.tri, { attr: { "stroke-dashoffset": 0 }, duration: 1.5, ease: "power2.inOut" }, t + 1.9);
      c.tl.to(p.orbita, { attr: { "stroke-dashoffset": 0 }, duration: 1.6, ease: "power2.out" }, t + 2.3);
      c.tl.to(p.alvos.map(a => a.el), { opacity: .4, duration: .8 }, t + 2.6);
      c.camK(t, [[{ cx: 1120, cy: 640, s: .86, rx: 16, ry: -12, r: -1.5 }, 1.8], [{ cx: 972, cy: 540, s: 1 }, 1.8]]);
    } },
    { dur: 2.6, hold: 3, run(t, c) {
      const p = c.p.forma;
      p.pontos.forEach((pt, i) => { c.tl.to(pt, { scale: 1, duration: .7, ease: "back.out(2.4)" }, t + i * .6); c.reveal(p.rotulos[i], t + .15 + i * .6, .1, 1); });
      c.cam(t, { cx: 978, cy: 542, s: 1.006 }, 2.8, "sine.inOut");
    } }
  ]
});
