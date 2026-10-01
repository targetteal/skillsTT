---
name: deck-cinematografico
description: Cria apresentações com linguagem de motion design cinematográfico que funcionam ao vivo (deck por clique, cada clique toca a animação) e viram vídeo MP4 do mesmo arquivo. Conduz terreno, ideação, roteiro por planos com página de revisão, três direções visuais, storyboard em rascunho com animatic, motor com câmera 3D, passe cinematográfico, verificação, entrega e colheita de transições novas para uma biblioteca que cresce. Use quando pedirem "apresentação com motion design", "deck que vira vídeo", "transforma esse roteiro/workshop/relatório em motion", "abertura animada para um encontro", ou quiserem um deck "tipo filme", com qualquer identidade visual. Não use para vídeo puro sem apresentação ao vivo (use motion-design) nem para slides estáticos.
version: 1.0.0
author: Ravi Resck (Target Teal)
license: proprietary
platforms: [macos, linux]
metadata:
  related_skills: [hyperframes, hyperframes-core, motion-design, clubett-identidade-visual]
  requires: [node>=20, python3+Pillow, npx hyperframes, playwright]
---

# Deck cinematográfico

Uma apresentação que **se apresenta como filme**: um mundo só, uma câmera 3D, objetos que se transformam de uma ideia na outra, cena que respira enquanto a pessoa fala. O mesmo arquivo roda ao vivo (`?present`, clique toca até a próxima parada) e renderiza em MP4 (HyperFrames).

Método extraído de um filme real de abertura e fechamento de workshop com cliente (set. 2026), incluindo os erros que ele cometeu: estão em `references/armadilhas.md`, no checklist da fase 7 e no CHANGELOG.

**Princípio:** o que decide a qualidade é a ordem das decisões. Estética antes de animar; storyboard antes do motor; crítica "slide × filme" antes de mostrar.

## Como a coisa funciona (leia uma vez)
- `template/motor.js`: biblioteca (câmera 3D por variáveis CSS, paradas, modo apresentação, respiração, camadas, primitivas). Não se edita por projeto; melhorias voltam para a skill.
- `template/planos/*.js`: um arquivo por plano, `Deck.plano({ id, numero, regiao, build, beats })`. API em `references/motor.md`.
- `identidade.json`: cores, fontes, cabeçalho. Aplicado no `index.html` por script. Presets em `presets/`.
- `roteiro.js`: fonte única da revisão (`revisao.html`), do storyboard (`storyboard.html` + `storyboard.js`) e da cola de cliques.
- Transições: `references/transicoes/` é uma **biblioteca viva**. Inspira, não limita; cresce a cada projeto.

## Interação com a pessoa usuária
- Em cada **Portão**, pare e espere a decisão. Não avance por conta própria.
- Decisões de gosto: perguntas de múltipla escolha com a recomendação primeiro.
- Revisões longas (roteiro, storyboard): pela página HTML com "Copiar resultado"; a pessoa cola no chat.
- Mantenha a pessoa informada a cada entregável (o que ficou pronto, o que foi verificado).

## As fases

### Fase 0 · Terreno
Leia `references/terreno.md`. Leia todas as fontes; entregue `terreno.md`.
**Portão:** arco e restrições confirmados.

### Fase 1 · Ideação
Leia `references/ideacao.md`. Proponha 3–5 conceitos por caminhos diferentes (tese, objeto protagonista, metáfora do espaço, momento-assinatura), recomende um. Registre em `conceito.md`, com a **transição original candidata** e as regras do filme.
**Portão:** conceito escolhido.

### Fase 2 · Roteiro por planos
Crie o projeto: `bash <skill>/scripts/novo-deck.sh <pasta> <preset> "<Título>" "<Cabeçalho esq.>" "<Cabeçalho centro>"` (preset provisório; troca na fase 3). Leia `references/roteiro-por-planos.md`. Escreva `roteiro.js` (beats com copy, transição, fala, dur/hold). Abra `revisao.html` para a pessoa aprovar/ajustar/cortar.
**Portão:** roteiro aprovado (resultado colado e incorporado).

### Fase 3 · Direção visual
Leia `references/direcao-visual.md` e `references/identidade.md`. Três direções em `direcoes.html` com os 2 planos-assinatura; folha de comparação. Trave `identidade.json`; `node scripts/baixar-fontes.mjs && node scripts/aplicar-identidade.mjs`.
**Portão:** direção escolhida. **Nunca animar antes disso.**

### Fase 4 · Storyboard em rascunho
Leia `references/storyboard.md`. `storyboard.js` com um quadro de rascunho por beat (kit `K`), transição anotada em cada passagem, animatic para ritmo.
**Portão:** storyboard aprovado (resultado colado e incorporado; roteiro atualizado se mudou).

### Fase 5 · Teste de viabilidade
Construa **os 2 planos-assinatura** no motor (leia `references/motor.md` e as fichas de `references/transicoes/` pertinentes). Confira: deck ao vivo (`./apresentar.command`), `node scripts/test-present.cjs`, render rascunho curto.
**Portão:** a pessoa vê em movimento e aprova a linguagem.

### Fase 6 · Construção
Todos os planos, na ordem de impacto (assinaturas → planos de ligação → fechamento). Para cada passagem, primeiro pergunte *que objeto deste conteúdo vira o próximo?*; depois consulte a biblioteca. Depois de cada 2–3 planos: `snap.cjs` + `meios.cjs` e olhe.

### Fase 7 · Passe cinematográfico
Leia `references/passe-cinematografico.md` e aplique o checklist slide × filme a todos os planos **antes** de mostrar. Corrija o que falhar.

### Fase 8 · Verificação
Leia `references/verificacao.md`: duração, `npx hyperframes check` com 0 erros, folha das paradas, meios das transições, `test-present.cjs`, render, quadros do MP4. Consulte `references/armadilhas.md` para cada alerta.
**Portão:** relatório com MEDIDO / VISTO / NÃO VERIFICADO.

### Fase 9 · Entrega
- `node scripts/gerar-cola.mjs` → `COLA-DE-CLIQUES.md` (revise as falas).
- `apresentar.command` (http; o Chrome bloqueia `file://`). Abra para a pessoa com `open`.
- Vídeo em `renders/`. Antes de mudanças grandes pedidas depois: **congele uma cópia** (`<pasta>-v1/`, lançador em outra porta: `PORT=8764`).

### Fase 10 · Colheita (a biblioteca cresce)
Para cada transição **nova** deste projeto: crie a ficha em `references/transicoes/` a partir de `_modelo.md` (ideia, serve para, origem, anatomia, código, variações, cuidados) e adicione à tabela de `INDEX.md`. Anote transições que funcionaram mal ("evitar: por quê"). Melhorias no motor e novos presets de identidade também voltam para a skill. Registre tudo em `CHANGELOG.md`.

## Regras gerais
- Um mundo só; nenhuma troca de página sem transformação de objeto (máx. 2 pans puros por filme).
- A cena nunca congela; há sempre fundo, meio e primeiro plano.
- Pelo menos uma transição original por projeto; nenhuma transição 3+ vezes.
- Copy de tela: afirmações completas, uma ideia por beat; o resto vai para a fala.
- Respeite nomes proibidos e preferências de escrita registradas na memória do projeto.
- Tudo local e offline (fontes, GSAP); só o render de nuvem exigiria rede.
