# Mergulho no ponto

**Ideia:** push-in num ponto (centro do triângulo, "?" de uma pergunta) até atravessá-lo; no auge do zoom, um corte seco escondido leva a outra região, onde a câmera pousa.
**Serve para:** entrar num detalhe ou num mundo novo.
**Origem:** filme de workshop com cliente, 2026 (versão 1). **Estado:** estável, mas use pouco: é o recurso mais "fácil".

## Código
```js
c.cam(t, { cx: px, cy: py, s: 8 }, 1.6, "power3.in");
c.tl.to("#pl-origem", { opacity: 0, duration: .55, ease: "power1.in" }, t + 1);
c.corte(t + 1.6, { cx: CX, cy: CY, s: 1.7 });
c.cam(t + 1.6, { cx: CX, cy: CY, s: 1 }, 1.7, "power3.out");
```

## Cuidados
- Com câmera 3D, objetos do primeiro plano (z > 0) passam atrás da câmera em s alto: esconda-os.
