# Órbita em profundidade

**Ideia:** itens distribuídos em z reais; a câmera orbita (ry 14–24°) e a paralaxe revela a profundidade. Linhas 3D (`c.link3d`) ligam os itens.
**Serve para:** relações, interdependência ("nenhum problema está isolado").
**Origem:** filme de workshop com cliente, 2026.

## Código
```js
// no build: gsap.set(item.el, { z }); posições compensadas: dx *= c.compensa(z)
c.tl.to(ligacoesDensas, { scaleX: 1, duration: 1.8, ease: "power2.inOut", stagger: .025 }, t + .4);
c.cam(t, { cx: CX - 40, cy: CY - 50, s: .76, r: -.6, rx: 6, ry: 14 }, 3.2);
// beat seguinte: continua orbitando
c.cam(t2, { cx: CX - 80, cy: CY - 50, s: .78, r: -.4, rx: 4, ry: 20 }, 4, "sine.inOut");
```

## Cuidados
- O grupo e seus pais precisam de `class="p3d"` (preserve-3d).
- Rotação 3D faz caixas se cruzarem: marque os itens com `data-layout-allow-overlap`.
- Antes de achatar em mapa, leve z → 0.
