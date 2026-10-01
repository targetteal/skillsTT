# Fio-guia

**Ideia:** um item (a linha sob o primeiro item de um índice) se estica e vira um fio; a câmera segue o fio, que desce até o próximo assunto e termina num nó.
**Serve para:** categoria → caso concreto; "puxar o fio" de um tema.
**Origem:** filme de workshop com cliente, 2026.

## Anatomia
- Objeto: um `<path>` com `pathLength=1` que começa exatamente sob o item e termina no alvo.
- Câmera: 3 pontos de passagem (sobre o item, no meio do fio com inclinação, sobre o alvo).
- Tempo: ~3,1 s.

## Código
```js
// <path id="fio" d="M180 1916 L600 1916 C 1150 1916, 1350 2480, 960 2720 S 700 2960, 960 3028" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
c.tl.to("#fio", { attr: { "stroke-dashoffset": 0 }, duration: 3.1, ease: "power2.inOut" }, t + .15);
c.camK(t, [[{ cx: 380, cy: 1930, s: 1.45 }, .8, "power2.in"], [{ cx: 900, cy: 2480, s: .82, rx: 18, ry: -8, r: 2 }, 1.2, "none"], [{ cx: 960, cy: 3240, s: 1 }, 1.4, "power3.out"]]);
c.tl.to(".resto-da-pagina", { opacity: 0, duration: .7 }, t + .5);   // o item de origem some por último
```

## Variações
- Fios que se enroscam num nó (o nó é o problema).
- Vários fios saindo de itens diferentes e convergindo.
- O fio vira a costura entre duas fotos.

## Cuidados
- A câmera deve "andar" pelo fio: os pontos de passagem precisam ficar sobre o traçado.
- O fio fica na cena seguinte: ele é a prova da conexão.
