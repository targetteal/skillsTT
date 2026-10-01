# Fase 3 · Direção visual

**Nunca anime antes de travar a estética.** No caso real, o primeiro protótipo, sem direção de arte ("paleta do relatório aplicada literalmente"), foi chamado de "horrível" e tudo foi refeito.

## Passos
1. Pergunte a família estética (editorial de revista, cartografia antiga, escuro cinematográfico, identidade da marca…).
2. Monte `direcoes.html` (molde no template): **3 direções bem diferentes** dentro da família escolhida, cada uma com **os mesmos 2 planos-assinatura** para comparar. Fotografe com `node scripts/shoot-frames.cjs direcoes.html estudos/` e mostre a folha.
3. Diga o que cada direção faz em movimento (a mesma imagem estática pode pedir motion calmo ou agressivo).
4. Recomende uma (pode misturar peças).
5. Trave em `identidade.json` (ver `identidade.md`), rode `baixar-fontes.mjs` e `aplicar-identidade.mjs`.

## O que diferencia filme de slide (use na crítica das direções)
Composição com escala dramática e assimetria; tipografia de título de filme (contraste extremo de tamanho e peso); materialidade (grão, fios, papel, luz); um acento de cor que dirige o olhar; nada de "dashboard" genérico.

## Fontes
Evite as genéricas (Inter, Roboto, Noto, Playfair, Poppins…). Baixe do Google Fonts para `fonts/` (o render precisa delas locais).

**Portão:** usuário escolhe a direção.
