# Achatar em mapa

**Ideia:** os itens soltos (em profundidade) pousam no plano (z → 0), encolhem e viram pontos de um gráfico; os eixos se desenham em volta.
**Serve para:** lista → mapa/avaliação ("cada item vira um hexágono do mapa").
**Origem:** filme de workshop com cliente, 2026.

## Código
```js
c.tl.to(itens.map(n => n.el), { z: 0, duration: 1, ease: "power2.inOut" }, t);
itens.forEach((n, i) => { const h = pontos[i];
  c.tl.to(n.el, { opacity: 0, scale: .4, filter: "blur(6px)", duration: .6, ease: "power2.in" }, t + i * .02);
  c.tl.fromTo(h.g, { attr: { transform: `translate(${n.ax} ${n.ay}) scale(0.2)` }, opacity: 0 }, { attr: { transform: `translate(${n.ax} ${n.ay}) scale(1)` }, opacity: 1, duration: .5, ease: "back.out(2)" }, t + .35 + i * .02);
  c.tl.to(h.g, { attr: { transform: `translate(${h.x} ${h.y}) scale(1)` }, duration: 1.7, ease: "power3.inOut" }, t + .9 + i * .03); });
c.tl.to(eixos, { opacity: 1, duration: 1.2 }, t + 1.2);
// beat seguinte: a variável (prioridade) colore os pontos em ordem aleatória com semente
```

## Cuidados
- Pontos ilustrativos precisam ser ditos como ilustrativos na fala.
- Rótulos de eixo em HTML (texto SVG com coordenadas grandes some no Chrome).
