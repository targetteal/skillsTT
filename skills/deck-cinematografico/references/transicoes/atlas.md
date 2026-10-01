# Atlas

**Ideia:** entre dois atos, a câmera se afasta muito (s .3–.4) e, por um instante, mostra o filme inteiro como um mapa de páginas; depois mergulha no próximo ato.
**Serve para:** recapitular, mudar de ato, dar escala ("tudo isso é um mundo só").
**Origem:** filme de workshop com cliente, 2026.

## Código
```js
c.camK(t + .1, [[{ cx: meioDoMundo.x, cy: meioDoMundo.y, s: .36, rx: 18, ry: -4 }, 1, "power2.in"], [{ cx: CX, cy: CY, s: 1 }, .8, "power3.out"]]);
```

## Cuidados
- Só funciona se as regiões anteriores continuam visíveis (não apague as páginas antigas).
