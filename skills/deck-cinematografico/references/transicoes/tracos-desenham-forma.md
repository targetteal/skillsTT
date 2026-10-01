# Traços desenham a forma

**Ideia:** marcas de contagem (uma por pessoa, dado, fonte) voam e se alinham no contorno de uma forma, que então se desenha por cima.
**Serve para:** dados brutos → estrutura ("98 vozes formam um modo de olhar").
**Origem:** filme de workshop com cliente, 2026. **Estado:** estável. Exemplo completo: `template/planos/0*-exemplo-*.js`.

## Anatomia
- Objeto que atravessa: os N traços do contador (criados no plano anterior, guardados em `c.shared`).
- Câmera: inclina (rx 16°, ry −12°) e recua (s .86) no meio; volta a plano no fim.
- Tempo: 3,6 s (voo 1,9 s escalonado; forma desenha a partir de 1,9 s).

## Código
```js
// alvo de cada traço no perímetro, com a rotação da aresta (calcule no build)
const alvos = c.shared.tracos.map((el, i) => { const u = i / N * 3, si = Math.floor(u), f = u - si, [a, b] = lados[si];
  return { el, dx: a[0] + (b[0] - a[0]) * f - x0(el), dy: a[1] + (b[1] - a[1]) * f - y0(el), rot: Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI }; });
// no beat
alvos.forEach((a, i) => c.tl.to(a.el, { x: a.dx, y: a.dy, rotation: a.rot, duration: 1.9, ease: "power3.inOut" }, t + .35 + i * .007));
c.tl.to(forma, { attr: { "stroke-dashoffset": 0 }, duration: 1.5, ease: "power2.inOut" }, t + 1.9);
c.tl.to(alvos.map(a => a.el), { opacity: .4, duration: .8 }, t + 2.6);   // viram marcas de escala
c.camK(t, [[{ cx: 1120, cy: 640, s: .86, rx: 16, ry: -12, r: -1.5 }, 1.8], [{ cx: 972, cy: 540, s: 1 }, 1.8]]);
```

## Variações
- Os traços formam um gráfico, uma palavra, um mapa do país, um organograma.
- Pontos de um mapa de calor que se reagrupam em categorias.
- O número do contador explode (`scale 2.2 + blur`) no mesmo instante em que os traços voam.

## Cuidados
- Mantenha a ordem de chegada contínua (i/N ao longo do perímetro), senão vira ruído.
- Os traços continuam visíveis como marcas de escala: é a memória do dado.
