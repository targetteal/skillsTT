# Virar a página, inclinada

**Ideia:** pan entre regiões vizinhas (abaixo/ao lado) com a câmera recuando e inclinando no meio do caminho.
**Serve para:** passagem neutra entre seções. **Use pouco:** sozinha, lê-se como slide com transição bonita. Prefira transformar um objeto.
**Origem:** filme de workshop com cliente, 2026.

## Código
```js
c.camK(t, [[{ cx: X + 140, cy: meioY, s: .78, rx: 18, ry: -6 }, 1, "power2.in"], [{ cx: X, cy: Y, s: 1 }, 1, "power2.out"]]);
```

## Cuidados
- Coloque 1–2 objetos de primeiro plano no meio do trajeto; sem eles o movimento parece vazio.
