/* Roteiro por planos: fonte única da revisão (revisao.html), do storyboard (storyboard.html)
 * e da cola de cliques (scripts/gerar-cola.mjs). Um beat = um clique no deck.
 * copy: [texto, ehHeadline]  ·  transicao: como este beat nasce do anterior (objeto que se transforma)
 * dur: segundos de animação · hold: respiro no vídeo · pausa: título de uma pausa ao vivo ANTES do plano */
window.ROTEIRO = {
  titulo: "Exemplo",
  planos: [
    {
      id: "pergunta", numero: "01", titulo: "A pergunta", secao: "Abertura",
      funcao: "Abrir pela investigação, não pelo método.",
      camera: "Fixa; leve deriva para a frente.",
      fala: "Essa foi a pergunta que nos trouxe até aqui.",
      beats: [
        { desc: "Papel vazio. A pergunta entra linha a linha, por máscara.", copy: [["O que impede as pessoas de fazerem seu melhor trabalho?", 1]], transicao: "Abertura: o cabeçalho se desenha.", dur: 2.4, hold: 2.4 },
        { desc: "Régua se desenha; o 98 rola como odômetro; 98 traços de contagem aparecem.", copy: [["98 entrevistas", 0]], transicao: "A régua nasce sob a pergunta.", dur: 3, hold: 2.6, fala: "Foram 98 conversas." }
      ],
      pendencias: []
    },
    {
      id: "forma", numero: "02", titulo: "Três dimensões", secao: "Abertura", assinatura: true,
      funcao: "Mostrar que as vozes formam um modo de olhar.",
      camera: "Inclina 16° enquanto os traços voam; volta a plano.",
      fala: "É um recurso didático para organizar a leitura.",
      beats: [
        { desc: "Os 98 traços voam e desenham o triângulo.", copy: [], transicao: "Traços de contagem viram as marcas de escala das arestas.", dur: 3.6, hold: 2.2 },
        { desc: "Os três vértices acendem com nome.", copy: [["Processos · Pessoas · Decisões", 0]], transicao: "Cada vértice acende em sequência.", dur: 2.6, hold: 3 }
      ],
      pendencias: ["Confirmar os nomes das categorias"]
    }
  ]
};
