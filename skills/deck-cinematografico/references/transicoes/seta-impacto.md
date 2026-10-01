# Seta com impacto

**Ideia:** uma seta nasce de um texto ("→ onde queremos chegar"), atravessa o mundo com a câmera correndo atrás e se quebra na próxima frase, que entra empurrada com um tremor.
**Serve para:** contraste, virada de argumento ("o jeito de sempre bate de frente com a realidade").
**Origem:** filme de workshop com cliente, 2026.

## Anatomia
- Objeto: `<path>` terracota com ponta (`polygon`) no fim.
- Câmera: whip longo (s .4, r −6°, rx/ry ~10°) e pouso; `c.tremor()` no impacto.
- Primeiro plano: 2–3 objetos grandes e desfocados no meio do trajeto dão velocidade.
- Tempo: ~3,6 s; letras entram com `expo.out` e deslocamento x negativo.

## Código
```js
c.tl.to("#seta", { attr: { "stroke-dashoffset": 0 }, duration: 2.2, ease: "power2.in" }, t + .25);
c.tl.to("#ponta", { opacity: 1, duration: .1 }, t + 2.4);
c.camK(t, [[{ cx: 520, cy: 4560, s: 1.2 }, .55, "power2.in"], [{ cx: 2500, cy: 2500, s: .4, rx: 12, ry: 10, r: -6 }, 1.1, "power1.inOut"], [{ cx: CX, cy: CY, s: 1 }, 1.1, "power3.out"]]);
c.tl.fromTo(letras, { opacity: 0, x: -140, yPercent: 20 }, { opacity: 1, x: 0, yPercent: 0, duration: .75, ease: "expo.out", stagger: .014 }, t + 2.45);
c.tl.to(["#seta", "#ponta"], { opacity: 0, duration: .5 }, t + 2.6);
c.tremor(t + 2.76);
```

## Variações
- Linha de prazo que colide com um obstáculo.
- Flecha de "meta" que erra o alvo.

## Cuidados
- Não use mais de uma vez por filme: o impacto perde força.
