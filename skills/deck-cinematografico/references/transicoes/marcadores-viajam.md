# Marcadores viajam

**Ideia:** os pontos coloridos de um diagrama (vértices, legendas) deixam o diagrama e pousam como marcadores de uma lista/índice na próxima página.
**Serve para:** visão geral → índice/detalhe ("três categorias viram as colunas de um índice").
**Origem:** filme de workshop com cliente, 2026.

## Anatomia
- Objeto: os círculos SVG dos vértices (atributos cx, cy, r).
- Câmera: pan para a nova região com inclinação no meio (rx ~20°).
- Tempo: 1,9 s de voo; a lista entra depois.

## Código
```js
["e", "c", "r"].forEach((k, i) => c.tl.to(`.vdot[data-k=${k}]`, { attr: { cx: DEST[k][0], cy: DEST[k][1], r: 9 }, duration: 1.9, ease: "power3.inOut" }, t + .3 + i * .08));
c.camK(t + .2, [[{ cx: 1080, cy: 1150, s: .78, rx: 22, ry: 6 }, 1, "power2.in"], [{ cx: 960, cy: 1840, s: 1 }, 1.1, "power2.out"]]);
c.tl.fromTo(".linha-do-indice", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .7, stagger: .07 }, t + 2.1);
```

## Variações
- Logos de clientes que viram marcadores de uma timeline.
- Ícones que viram bullets.

## Cuidados
- O destino precisa existir no mesmo mundo (coordenadas absolutas da nova região).
