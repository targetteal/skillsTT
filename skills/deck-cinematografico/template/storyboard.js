/* Rascunhos do storyboard: uma entrada por beat, chave "<id do plano>.<nº do beat>".
 * Cada valor é uma função que recebe o kit K e devolve SVG (viewBox 480×270 = tela ÷ 4).
 * Desenhe o QUADRO DA PARADA (o estado final do beat) e anote o movimento com K.nota / K.camera / K.seta. */
window.SKETCH = {
  "pergunta.1": K => K.cabecalho("01") + K.titulo(24, 70, ["O que impede as pessoas de", "fazerem seu melhor", "trabalho?"], 44) + K.nota(300, 240, "linhas entram por máscara"),
  "pergunta.2": K => K.cabecalho("01") + K.titulo(24, 70, ["O que impede as pessoas de", "fazerem seu melhor", "trabalho?"], 44) +
    K.linha(24, 212, 456, 212) + K.texto(24, 240, "98", 26) + K.texto(150, 240, "100+", 26) + K.texto(290, 240, "100+", 26) +
    Array.from({ length: 30 }, (_, i) => K.linha(24 + i * 3.4, 252, 24 + i * 3.4, 258)).join("") + K.nota(330, 262, "98 rola (odômetro)"),
  "forma.1": K => K.cabecalho("02") + K.caminho("M330 54 L233 222 L427 222 Z") + K.circulo(330, 166, 48) +
    K.seta(90, 250, 220, 215, { acento: true }) + K.nota(24, 244, "os traços voam e viram marcas") + K.camera(40, 30, 400, 225, "câmera inclina 16° e volta"),
  "forma.2": K => K.cabecalho("02") + K.caminho("M330 54 L233 222 L427 222 Z") + K.circulo(330, 54, 5, { cheio: true }) + K.circulo(233, 222, 5, { cheio: true }) + K.circulo(427, 222, 5, { cheio: true, acento: true }) +
    K.texto(352, 52, "Processos", 16) + K.texto(190, 246, "Pessoas", 16) + K.texto(350, 246, "Decisões", 16) + K.nota(24, 120, "vértices acendem em sequência")
};
