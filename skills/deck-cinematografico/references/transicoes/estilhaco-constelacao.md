# Estilhaço em constelação

**Ideia:** uma frase ampla em letras enormes ("Temos um problema de colaboração") estilhaça; as letras viram fantasmas ao fundo e, dos estilhaços, nascem os itens concretos espalhados em profundidade.
**Serve para:** abstrato → granular; "o problema grande é feito de muitos pequenos".
**Origem:** filme de workshop com cliente, 2026. Assinatura daquele filme.

## Anatomia
- Letras: cada caractere num `<span class="ch">` (inline-block), marcado `data-layout-ignore`.
- Estilhaço: x/y aleatórios com semente, rotação ±70°, escala 1–2,4, opacidade final .06–.11.
- Itens: 3 profundidades (z +90, −260, −720) compensadas com `c.compensa(z)`; os de trás desfocados (1–2 px).
- Câmera: punch-in rápido (s 1.1 em .16 s) no estalo, depois recuo lento (s .9, r −1,2°).

## Código
```js
const sr = c.rng(6);
letras.forEach((l, i) => c.tl.to(l, { x: (sr() - .5) * 2000, y: (sr() - .5) * 1150, rotation: (sr() - .5) * 140, scale: 1 + sr() * 1.4, opacity: .06 + sr() * .05, duration: 2.2, ease: "power3.out" }, t + Math.abs(i - letras.length / 2) * .012));
c.tl.to("#camvars", { "--s": 1.1, duration: .16, ease: "power2.out" }, t);
itens.forEach((n, i) => c.tl.fromTo(n.el, { opacity: 0, scale: .75, filter: "blur(14px)", transformOrigin: "0% 0%" }, { opacity: n.op, scale: 1, filter: `blur(${n.blur}px)`, duration: 1.4, ease: "power3.out" }, t + .35 + i * .07));
c.tl.to(ligacoes, { scaleX: 1, duration: 1.6, ease: "power2.inOut", stagger: .08 }, t + 1.4);   // c.link3d
c.cam(t + .16, { cx: CX - 60, cy: CY + 10, s: .9, r: -1.2 }, 3.8);
```

## Variações
- Uma palavra-conceito que se desmonta nas suas definições.
- Um logo que estilhaça nos produtos.

## Cuidados
- 3–4 itens nítidos por enquadramento; o resto é textura (marque `data-layout-allow-overlap/occlusion`).
- Nada de itens sob o cabeçalho: ajuste `cy` da câmera ao entrar a headline.
