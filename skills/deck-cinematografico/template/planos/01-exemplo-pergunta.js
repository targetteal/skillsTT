/* Plano de exemplo · a pergunta e o contador.
 * Mostra: linhas mascaradas, odômetro, marcas (traços) que o próximo plano reaproveita.
 * Coordenadas: com a câmera em (960, 540, s=1), mundo = tela. regiao é o canto do "palco" deste plano. */
Deck.plano({
  id: "pergunta",
  numero: "01",
  regiao: [0, 0],
  build(c) {
    const h = c.div("w display", "", c.g, { left: "96px", top: "176px", width: "1760px", fontSize: "190px", lineHeight: ".93" });
    const linhas = c.lines(h, ["O que impede as pessoas de", "fazerem seu <em>melhor</em>", "<em>trabalho?</em>"]);
    const regua = c.div("w", "", c.g, { left: "96px", top: "850px", width: "1728px", height: "1.5px", background: "var(--tinta)", transformOrigin: "0 50%" });
    gsap.set(regua, { scaleX: 0 });
    const col = c.div("w", `<div class="display" style="font-size:104px;line-height:1"><span></span></div><div class="mono" style="font-size:16px;margin-top:12px;color:var(--suave)">entrevistas</div>`, c.g, { left: "96px", top: "876px", opacity: 0 });
    const rolar = c.odometro(col.querySelector("span"), 98, 104);
    // 98 traços de contagem: o plano seguinte os usa para desenhar a forma
    const tracos = Array.from({ length: 98 }, (_, i) => c.div("w", "", c.g, { left: 96 + i * 6.2 + "px", top: "1012px", width: "3px", height: "18px", background: (i + 1) % 5 ? "var(--tinta)" : "var(--acento)", opacity: 0 }));
    c.shared.tracos = tracos;
    return { linhas, regua, col, rolar, tracos };
  },
  beats: [
    { dur: 2.4, hold: 2.4, run(t, c) {
      const p = c.p.pergunta;
      c.reveal(p.linhas, t + .55, .14, 1.3);
      c.cam(t, { cx: 960, cy: 545, s: 1.008 }, 3, "sine.inOut");
    } },
    { dur: 3, hold: 2.6, run(t, c) {
      const p = c.p.pergunta;
      c.tl.to(p.regua, { scaleX: 1, duration: 1.1, ease: "power3.inOut" }, t);
      c.tl.to(p.col, { opacity: 1, duration: .5 }, t + .3);
      p.rolar(t + .35, 2.6);
      c.tl.fromTo(p.tracos, { opacity: 0, scaleY: 0 }, { opacity: 1, scaleY: 1, duration: .25, stagger: { amount: 2.4, ease: "power2.out" } }, t + .35);
    } }
  ]
});
