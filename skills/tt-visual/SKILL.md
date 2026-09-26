---
name: tt-visual
description: Cria, adapta e revisa peças visuais da Target Teal e do Clube com sua gramática editorial. Aciona-se para ilustrações, composição, carrosséis e mudanças de arte; preserva copy aprovada e não publica.
metadata:
  version: "0.1.0"
  language: "pt-BR"
---

# TT visual

Aplique linguagem, não um cenário obrigatório. A arte deve comunicar a ideia e pertencer à família TT/Clube sem inventar um novo repertório de slogans.

## Referências por necessidade

- Em uma nova peça: [gramatica-operacional.md](references/gramatica-operacional.md).
- Antes de ilustrar ou diagramar: abra visualmente as páginas pertinentes de [gramatica-visual.pdf](assets/gramatica-visual.pdf). Para consulta rápida: [página 7](assets/gramatica-p07.png) e [página 9](assets/gramatica-p09.png). Ler só o texto do PDF não basta para conhecer o desenho.
- Em geração, edição localizada ou revisão: [geracao-e-revisao.md](references/geracao-e-revisao.md).
- Para distinguir funções das capas e observar o caso histórico: [caso-clube.md](references/caso-clube.md), [capa clara do post](assets/capa-post-clara-referencia.jpg), [capa teal do post](assets/capa-post-teal-referencia.jpg) e [capa da temporada](assets/capa-temporada-referencia.jpg).
- Para especificar a execução: [plano-visual.md](assets/plano-visual.md) e [tokens.json](assets/tokens.json).

## Procedimento

1. **Identifique o alvo e o escopo.** Abra o roteiro, os assets reais e a decisão mais recente. Distingua capa do post, slides internos e capa da temporada. Se pediram editar uma imagem, confirme que o arquivo existe e examine-o antes de qualquer ferramenta de edição. ID opaco ou caminho suposto não são imagem disponível.
2. **Leia a gramática e olhe a referência.** Recupere documentos atuais fornecidos para esta marca. O PDF incluído é a referência histórica do Clube, com decisões abertas; um material mais recente do projeto pode substituí-lo quando isso estiver explícito. Não escolha “um estilo parecido” pela memória.
3. **Escolha o recurso para a mensagem.** Tipografia, objeto, cena ou relação abstrata. Não use tudo junto nem repita o mesmo cartaz em todas as telas. Varie o ritmo sem perder consistência. A cor da capa é uma decisão do projeto/grade, não propriedade fixa de toda campanha.
4. **Separe arte de copy.** Para produção, gere a ilustração sem letras, números, legendas ou logo; componha os textos aprovados e o logo original em camada independente. Use as ferramentas realmente disponíveis no ambiente. Não improvise o nome ou o schema de um gerador. Sem compositor preciso, entregue ilustração e plano de composição como protótipo, não como peça final tipograficamente garantida.
5. **Em edição localizada, preserve o restante.** “Só o fundo teal” conserva imagem, objeto, posição, enquadramento e palavras; adapte apenas as cores indispensáveis à leitura. Não substitua o desenho pela capa da temporada. Reutilize o asset em vez de regenerá-lo quando a tarefa não exigir mudança no desenho.
6. **Verifique o conjunto e o tamanho de uso.** Inspecione cada saída renderizada e uma visão geral ordenada. Compare copy, acentos, marca, contraste, margens e metáfora. Confira também em escala de celular. Se não conseguiu ver a imagem, diga isso: não declare revisão visual a partir de OCR ou captions.
7. **Entregue e registre.** Preserve fonte editável, ilustração, exportação e aprovação por versão. Passe a `tt-instagram` a ordem e os arquivos exatos. Não altere o roteiro para consertar um problema de composição sem voltar à revisão editorial.

## Contornos essenciais

Anton 400 para títulos; Roboto para leitura. Papel #F2EFEB, charcoal #1E1E1E e teals #256675, #4B8C99, #7AB5BC. Desenho editorial 2D manual, linha irregular controlada, hachura fina e cor restrita. Sem stock corporativo, textura pesada sob texto, 3D, gradientes, objetos motivacionais ou náutica decorativa. A gramática não obriga ilustração em toda peça nem texto sempre à esquerda.

Não distribua arquivos de fontes. Não reconstrua o logo a partir de imagem gerada. Se faltar o original, solicite-o ou marque a assinatura como pendente em uma prova; não invente marca oficial.

## Conclua somente com evidência

Liste o que foi gerado, o que foi apenas planejado e qualquer limitação. Este pacote não inclui um motor de renderização nem instala um gerador de imagens. `scripts/contrast.py` calcula contraste de cores sólidas; não substitui inspeção da peça.
