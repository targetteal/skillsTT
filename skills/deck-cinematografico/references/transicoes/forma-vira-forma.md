# Forma vira forma

**Ideia:** uma peça do plano atual (um hexágono do mapa) cresce, gira e atravessa a tela até virar o objeto do próximo plano (o anel do relógio), que se desenha no mesmo tamanho.
**Serve para:** resultado → próxima atividade; continuidade de objeto entre atos.
**Origem:** filme de workshop com cliente, 2026.

## Código
```js
// <polygon id="heroi" vector-effect="non-scaling-stroke"> na posição da peça escolhida
c.tl.set("#heroi", { opacity: 1 }, t + .1);
c.tl.to("#heroi", { attr: { transform: `translate(${alvo.x} ${alvo.y}) rotate(90) scale(${(raioAlvo / raioPeca).toFixed(2)})` }, duration: 2.1, ease: "power3.inOut" }, t + .15);
c.tl.to("#heroi", { attr: { "fill-opacity": 0 }, duration: 1.2 }, t + .6);
c.tl.to("#heroi", { opacity: 0, duration: .8 }, t + 2.1);            // o novo objeto já está se desenhando por baixo
c.camK(t + .2, [[{ cx: meio.x, cy: meio.y, s: .7, rx: 18, ry: -6 }, 1, "power2.in"], [{ cx: CX2, cy: CY2, s: 1 }, 1.1, "power2.out"]]);
```

## Variações
- Um card que vira a tela de um celular; uma bolha de fala que vira um balão de dados.

## Cuidados
- `vector-effect="non-scaling-stroke"` para o traço não engrossar com a escala.
