# Cards fluem

**Ideia:** cartões de um quadro (A fazer, Em curso, Bloqueado, Feito) andam entre colunas em arco, com leve rotação; a meta de cada um (progresso, bloqueio, concluído) aparece ao pousar.
**Serve para:** processo, fluxo de trabalho, portfólio.
**Origem:** filme de workshop com cliente, 2026 (portfólio de intervenções).

## Código
```js
ordem.forEach((ci, k) => { const card = cards[ci], t0 = t + k * .45;
  c.tl.to(card.el, { keyframes: { x: [0, card.dx * .5, card.dx], y: [0, card.dy * .5 - 40, card.dy], rotation: [0, -3, 0] }, duration: 1, ease: "power2.inOut" }, t0);
  c.tl.to(card.meta, { opacity: 1, duration: .4 }, t0 + .9); });
```

## Cuidados
- Esvazie a coluna de destino antes de ocupá-la (mova primeiro quem sai).
