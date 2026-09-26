# Caso: "Planta ≠ Mapa" — convite da Temporada 0 do Clube dos Agentes de Mudança

Vídeo de 61,5 s (1920×1080, 30 fps, som) feito só com código, que deu origem a
esta skill. Aqui está o código completo da cena (`scene.js`), da partitura
(`timeline.mjs`) e do som (`audio.mjs`), e a identidade no formato do template
(`brand.js`). As imagens do cliente (capa da temporada, emblema, logo) não estão
incluídas; o código as carrega de `assets/`.

> Este código é anterior à extração da `lib/`: as mesmas primitivas estão
> definidas dentro de `scene.js`. Para um vídeo novo, use o template; leia este
> arquivo para ver as receitas aplicadas em escala real.

## O briefing

"Como poderia ser um vídeo de motion design apresentando o Clube com toda a
identidade dele e a proposta dele e convidando para a primeira temporada?"
Cliente: designer organizacional, exigente com conceito. Temporada 0: saúde
mental nas organizações. Abertura: 7 de outubro, 20h.

## Como o conceito chegou lá (três correções do cliente)

1. **Versão 1 — tour pelo site.** Roteiro seguindo os atos da landing (navio,
   mapa, tempestade, porto, tripulação). Resposta: *"a narrativa tá meio fraca,
   tá só tentando apresentar o site em forma de vídeo. Eu esperava algo mais conceitual."*
   → A pesquisa nos **estudos visuais da temporada** (escritório dentro da cabeça,
   cadeira com raízes, salas sem saída, rosto como planta baixa) revelou a tese:
   a organização se instala na pessoa.
2. **Versão 2 — "redesenhar junto".** Resposta: *"fica muito otimista. A gente
   não redesenha junto. A gente explora junto outros desenhos possíveis."*
   → Troca do verbo e da forma: as folhas de papel manteiga não substituem a
   planta; ela continua por baixo; uma proposta é riscada.
3. **Versão 3 — frase desconexa.** Resposta: *"vem com uma frase forte e depois
   termina com algo desconexo."* → teste da cadeia de texto (ver
   `references/conceito.md`); a frase forte passou a fechar o ato II e o ato III
   abriu com "MAS TODA PLANTA JÁ FOI UM RASCUNHO".

## Estrutura final

| Ato | Tempo | Recurso | Texto |
|---|---|---|---|
| I. A planta se fecha | 0–17 s | caneta técnica desenha planta com cotas; portas batem cada vez mais rápido; cubículos; a célula da pessoa (ponto teal) fecha com estalo; recuo de câmera revela que a planta está dentro de um perfil humano de olhos fechados | A GENTE DESENHA ORGANIZAÇÕES. / DEPOIS, ELAS DESENHAM A GENTE. |
| II. A pergunta errada | 17–33 s | carimbos RESILIÊNCIA, MINDFULNESS, APP DE MEDITAÇÃO, FRUTA NA COPA; descolam; ciclo de realimentação (pressão → urgência → menos pausa → mais erro, "R") arrasta a pessoa, acelerando; **congelamento com silêncio absoluto** | E SE O PROBLEMA NÃO ESTIVER SÓ EM VOCÊ? / QUEM TENTA MUDAR ORGANIZAÇÕES TAMBÉM ADOECE NELAS. |
| III. Papel manteiga | 33–48 s | lápis encosta; o traço técnico vira lápis em onda a partir do ponto; cotas somem; folhas translúcidas com propostas em traços diferentes (porta, roda, calendário com pausas, outro elo); uma riscada e trocada; a pessoa vai até a porta rascunhada e esbarra na parede real | MAS TODA PLANTA JÁ FOI UM RASCUNHO. / A GENTE EXPLORA JUNTO OUTROS DESENHOS POSSÍVEIS. |
| Fecho | 48–61,5 s | as linhas da planta viram as ondas de cabelo da capa; a capa é revelada por dentro delas; títulos da própria arte sobem linha a linha; folha translúcida com o emblema entrando como carimbo (rima com os carimbos do ato II), data, URL; rota tracejada que não fecha | 7 DE OUTUBRO · 20H · CLUBE.TARGETTEAL.COM |

Som: atos I–II só ruído, ritmo e grave (caneta, portas, relógio acelerando,
zumbido fluorescente, carimbos, pulso do ciclo). Piano entra com o papel manteiga.
Último acorde sobre Lá, sem resolver — o final aberto também na harmonia.

## Defeitos encontrados na verificação (e como)

| Defeito | Como foi visto | Correção |
|---|---|---|
| til de "ORGANIZAÇÕES" cortado e encostando na linha de cima | still + zoom | entrelinha 1,2; máscara maior |
| fantasma da planta poluindo o rótulo "PRESSÃO" | still | alpha do mundo 0,03 durante o diagrama |
| lascas de marcador na saída do texto | still da transição | saída 1,6× |
| fragmentos do título original na revelação da capa | still + `bounds` | regiões medidas por pixel |
| borda dura do varrido diagonal | still | revelar só pelas linhas, máscara com blur |
| sublinhado teal maior que o medido | still | região ampliada |
| cartão final com a capa competindo | still | opacidade da folha 0,95 |
| abertura −33 LUFS vs. carimbos −10 | medição de loudness | +6 dB na caneta, compressor (LRA 17,5 → 7,7) |

## Números

- Rascunho (15 fps, sem blur): 2,5 min. Final (30 fps, 4 subquadros): 17 min em 4 núcleos.
- Master: 277 MB (o grão do papel pesa no encoder) → entrega 88 MB (CRF 21) → prévia 28 MB (2 passadas, 3,5 Mbps).
