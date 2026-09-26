# Receitas de movimento

Cada receita: **quando usar**, **código** (com as primitivas de `template/lib/`),
**armadilha**. Todas são funções de `t`: calcule tudo a partir do tempo.

Índice: 1 traço que se desenha · 2 lápis vs. técnico · 3 contágio · 4 mola ·
5 texto por máscara · 6 marcador · 7 carimbo · 8 tremor de câmera ·
9 câmera e recuo que revela · 10 fechamento acelerado · 11 ciclo que acelera ·
12 congelamento · 13 papel manteiga · 14 linhas que viram outra forma ·
15 imagem revelada por linhas · 16 título embutido numa arte · 17 cartão final ·
18 motion blur · 19 camadas e ordem de desenho · 20 desenhar objetos e figuras ·
21 composição (layouts)

---

## 1. Traço que se desenha sozinho
**Quando**: qualquer coisa que "nasce" na tela — paredes, rotas, perfis, diagramas.
```js
const P = mkPath(catmull(pontos, 9));          // ou rectPts / circlePts
stroke(ctx, P, { frac: E.sine(prog(t, 1.0, 2.4)), width: 4, color: C.ink });
```
Vários caminhos como uma mão só: `strokeSequence(ctx, paths, p, estilo)` (devolve a
cabeça do traço para desenhar a ponta do lápis ali).
**Armadilha**: velocidade. Desenhe a ~1500–2300 px/s de mundo; mais lento parece
carregamento, mais rápido parece piscar. Para sequências, calcule a duração pelo
comprimento (`P.len / velocidade`), não um valor fixo.

## 2. Técnico vs. lápis
**Quando**: o *caráter* da linha carrega sentido (norma × rascunho, máquina × mão).
```js
// técnico: exato
stroke(ctx, P, { width: 2.2, color: C.ink });
// lápis: tremor que ferve a 12 fps, traço duplo, passa da ponta
const boil = Math.floor(t * 12);
stroke(ctx, P, { width: 3, color: C.graphite, amp: 5.5, passes: 2, overshoot: 14, boil, seed: 3 });
```
**Armadilha**: `boil` a 30 fps vira vibração nervosa; a 12 fps parece animação
desenhada. Congele o `boil` quando a cena congelar.

## 3. Contágio (transformação que se espalha de um ponto)
**Quando**: uma mudança começa num lugar e toma o todo (o lápis encosta e a
planta vira rascunho; uma cor se espalha; uma rede acende).
```js
const m = (x, y) => spreadFrom(t, T.touch, [470, 250], x, y, 1150, 320);
stroke(ctx, P, { ampFn: (x, y) => 5.5 * m(x, y), passes: 2, boil });
// preenchimentos: use o m do ponto médio para desbotar (alpha *= 1 - 0.8*m)
```
**Armadilha**: esquecer de fazer os elementos "técnicos" (cotas, hachuras) sumirem
junto; o contágio parece incompleto.

## 4. Mola (chegada com peso)
**Quando**: algo aparece e "assenta" (ponto, emblema, folha, rótulo).
```js
const s = spring(t - T.dotIn, 0.35, 16);   // 0 → passa de 1 → assenta em 1
ctx.arc(x, y, 15 * s, 0, 7);
```
`zeta` 0,35–0,5 = vivo; 0,6–0,7 = sóbrio (folhas de papel). `omega` 7–9 = pesado; 14–16 = leve.
**Armadilha**: mola em texto. Texto entra com `outExpo` na máscara (receita 5), não com mola.

## 5. Texto que sobe de dentro da linha
**Quando**: toda frase de display. É o padrão.
```js
const txt = makeText({ lines: ['A GENTE DESENHA', 'ORGANIZAÇÕES.'], x: 100, size: 118,
  font: 'Anton', tIn: 3.7, tOut: 10.3, maxW: 780, colors: C });
// centralizado na tela: makeText({ ..., x: 960, align: 'center' })
// y é o centro vertical do bloco (valign: 'middle', padrão) ou a 1ª linha de base (valign: 'top')
drawText(ctx, txt, t);   // na camada de TELA, depois do mundo
```
Palavras entram uma a uma (stagger 0,07 s) e saem pelo topo. `maxW` reduz o corpo
automaticamente para caber. Ver `tipografia.md`.

## 6. Marcador atrás de palavras
**Quando**: uma ou duas palavras-chave por frase. Não mais.
```js
makeText({ lines: ['DEPOIS, ELAS', 'DESENHAM', '*A *GENTE.'], mark: T.text2In + 1.3, ... })
```
O marcador cresce da esquerda (0,42 s) depois que a frase já assentou —
é um segundo tempo de leitura, não parte da entrada. Palavras marcadas
vizinhas viram um marcador contínuo.

## 7. Carimbo
**Quando**: resposta pronta, rótulo, burocracia, "decisão de cima" — ou, no fim,
um selo que convida (rima!).
```js
const st = makeStamp('RESILIÊNCIA', C.accent, 101, 'Anton', 62);   // em setup
drawStamp(ctx, { st, x: 1230, y: 330, rot: -7, hit: T.stamps[0], peel: T.peel, dir: [-0.5, -1] }, t);
```
Três tempos: antecipação (0,13 s caindo de 1,45×), impacto (quique de 5%),
peso (tremor de câmera + batida grave **no mesmo quadro**). Vários carimbos:
acelere o intervalo (0,65 → 0,55 → 0,45 s). Para sair, `peel` descola e voa.
**Armadilha**: carimbo sem tremor e sem som parece adesivo.

## 8. Tremor de câmera
```js
const [sx, sy] = shake(t, [[T.stamps[0], 13], [T.stamps[1], 13], [T.emblem, 6]]);
applyCamera(ctx, c, sx, sy);            // mundo
ctx.setTransform(1, 0, 0, 1, sx, sy);   // tela
```
10–14 px para impactos fortes, 4–6 px para suaves. Nunca no grão.

## 9. Câmera e o recuo que revela
**Quando**: mostrar que o detalhe pertence a algo maior (a planta estava dentro de uma cabeça).
```js
const cam = makeCamera([
  { t: 0,    ...frame(0.70, planX, planY, 1360, 540) },            // objeto à direita
  { t: 10.7, ...frame(0.745, planX, planY, 1360, 540), e: 'lin' }, // deriva lenta = vida
  { t: 15.3, ...frame(0.40, headX, headY, 1300, 520), e: 'zoom' }, // recuo em escala log
]);
```
Desenhe o contexto (o perfil) **durante** o recuo, terminando junto com ele, para
que a revelação e o movimento sejam um gesto só.
**Armadilha**: interpolar escala linearmente em zoom grande (parece acelerar no fim).

## 10. Fechamento acelerado
**Quando**: pressão crescente (portas batendo, paredes subindo, relógio).
Tempos em progressão: `[5.9, 6.5, 7.0, 7.4]`, depois uma rajada `[7.7, 8.05, 8.35, 8.6, 8.82, 9.0, 9.15, 9.28, 9.4]`,
e o fechamento final com `E.outExpo` (estalo). Som: `S.accel(t0, t1, 0.5, 0.9)` (relógio que acelera, com piso — nunca `dt *= 0.9` sem piso: laço infinito) e que **para** no último estalo.

## 11. Ciclo que acelera (diagrama de realimentação vivo)
**Quando**: explicar um padrão sistêmico sem texto longo.
- Nós com rótulo em caixa de papel (cortam a linha do círculo); arcos com seta e polaridade "+"; um "R" no centro.
- Um ponto percorre o círculo com velocidade angular ω(t) = ω0 + k·d², logo φ(t) = φ0 + ω0·d + k·d³/3 (forma fechada: nada de somar quadro a quadro).
- O rótulo pulsa quando o ponto passa (`exp(-dist² · 40)`); o raio encolhe 10% (aperto).
- Trilha: 12 fantasmas atrás do ponto, comprimento proporcional a ω.
Código completo: `examples/target-teal-planta-mapa/scene.js`, função `drawLoop`.

## 12. Congelamento
**Quando**: logo antes da virada. É o momento mais forte que existe e custa zero.
```js
const frozen = t >= T.freeze && t < T.unfreeze;
const ft = frozen ? T.freeze : t;     // passe ft para tudo que se move, inclusive boil e grão
// no som: S.silence(T.freeze, T.unfreeze)  → zero absoluto, sem reverb
```

## 13. Papel manteiga
**Quando**: possibilidades, propostas, versões, "e se…" — sem prometer solução.
```js
drawSheet(ctx, { cx, cy, w, h, rot: -3.5, from: [-1500, -900], tIn, draw: [t0, t1],
  paths: [...], style: { color, width: 5, amp: 2.6, passes: 2 }, note: { text: 'E SE…?', x, y }, out }, t, boil);
```
Folhas de lados diferentes, traços diferentes (grafite, tracejado teal, fino trêmulo,
marcador) = mãos diferentes, sem desenhar pessoas. Os desenhos ficam alinhados ao que está por baixo.
Uma folha riscada e retirada (`out`) torna a exploração honesta. **Deixe o original visível por baixo.**

## 14. Linhas que viram outra forma
**Quando**: passagem entre mundos (a planta vira o cabelo da capa).
```js
const lines = buildMorph(origensEmTela, { n: 96, colors: [...] });   // polilinhas em coordenadas de TELA
const alvo = bandTarget(mkPath(catmull(espinha, 10)), { w0: 330, w1: 150 });
drawMorph(ctx, lines, t, T.unravel[0], 1.6, alvo, alpha);
```
As origens saem do desenho atual (paredes, traços das folhas) convertidas com
`toScreen(cam(t0), x, y)`. Esconda o mundo nos primeiros 0,4 s da transformação.
**Armadilha**: alvo que não corresponde à imagem seguinte — meça a espinha sobre a arte real.

## 15. Imagem revelada por dentro das linhas
**Quando**: a arte do cliente aparece como consequência do desenho.
```js
revealThroughLines(ctx, prog(t, a, b), (g) => g.drawImage(IMG.capa, 0, 0, W, H), lines, alvo, t);
```
As linhas engrossam e se espalham até cobrir o quadro, com borda levemente desfocada.
**Armadilha**: varrido geométrico (polígono) por cima — deixa borda dura. Use só as linhas.

## 16. Título embutido numa arte (animar tipografia que já está na imagem)
**Quando**: a arte do cliente traz o título desenhado e você quer que ele entre linha a linha.
1. **Meça** as linhas com `node tools/bounds.mjs arte.png x0 y0 x1 y1` (nunca a olho;
   no caso real, a estimativa a olho deixou acentos e o fim de um sublinhado de fora).
2. Crie uma cópia limpa da arte: pinte cada região de título com a cor média do papel
   da própria arte (amostre uma área vazia).
3. Para cada linha, recorte a região e desenhe a arte original deslocada para baixo,
   subindo com `outExpo` (mesma linguagem da receita 5). Sublinhados: varrido da esquerda.
Código: `examples/target-teal-planta-mapa/scene.js`, `TITLE_ROWS`, `makeCoverClean`, `drawCover`.

## 17. Cartão final
Use `drawEndCard(ctx, t, t0, { label, main, sub, lines, url }, { colors, display, text, x })` (lib/text.js): tamanhos legíveis garantidos. Para compor à mão:
Estrutura: selo/emblema (entra como carimbo) · rótulo pequeno em cor de destaque ·
dado principal enorme (data/hora) · 1–2 linhas de apoio em fonte de texto · URL em
display na cor de destaque · logo pequeno no canto. Cada linha com `lineReveal`,
em cascata de 0,1–0,15 s. Termine com um gesto que ecoe o conceito (rota que não fecha).
O fundo pode ser uma folha translúcida sobre a última imagem (opacidade ≥ 0,94, senão compete com o texto).

## 18. Motion blur
Já está no motor: `renderFrame(t, 4)` acumula 4 subquadros num obturador de 180°.
Só o render final usa (4× mais lento). Por isso a cena **tem** de ser função pura de `t`.

## 19. Camadas e ordem de desenho (por quadro)
1. papel (`drawPaper`)
2. **mundo** com câmera (`applyCamera`): desenhos, personagens, folhas
3. **tela** sem câmera: carimbos, diagramas de UI, textos, lápis, transições
4. imagens em tela cheia (capa) e cartão final
5. grão (`drawGrain`) — sempre por último

## 20. Desenhar objetos e figuras (o protagonista)
**Quando**: sempre que o conceito tem um "personagem" — um vaso, uma cadeira, uma
cabeça, uma casa, uma planta baixa. Ele precisa ser **grande** (30–60% da altura do
quadro no momento dele) e desenhado com o mesmo traço do resto.

Três técnicas, da mais simples à mais rica:
1. **Por perfil espelhado (objetos de torno)** — vasos, copos, garrafas, luminárias:
   ```js
   // metade do perfil, de cima para baixo: [raio, y]
   const perfil = [[70, -210], [80, -180], [165, -70], [175, 40], [120, 170], [90, 210]];
   // "entortar" a peça: some ruído ao raio, crescendo com o tempo
   const torto = perfil.map(([r, y], i) => [r + 40 * m * noise1(i * 1.7 + 3), y]);
   const P = mkPath(lathe(torto, 0, 0));
   ctx.fillStyle = C.marker; ctx.fill(path2d(P.pts));           // preenchimento chapado
   stroke(ctx, P, { width: 6, color: C.ink, amp: 2, passes: 2, boil });  // contorno
   ```
   Detalhes que dão vida: a boca como elipse (`circlePts` achatado com `ctx.scale(1, 0.25)`),
   2–3 linhas de torno horizontais seguindo o perfil, uma sombra chapada deslocada.
2. **Por pontos-chave + `catmull`** — perfis humanos, folhas, rotas, contornos
   orgânicos. Escreva 15–35 pontos à mão, renderize um still com `--debug` e ajuste.
   O perfil de cabeça do exemplo real tem 35 pontos (`examples/.../scene.js`, `HEAD`).
3. **Procedural** — plantas baixas, grades, calendários, redes: gere as linhas com
   laços e dados (paredes como segmentos com espessura; portas como arco + folha).

**Deformar com beleza**: ruído de baixa frequência (`noise1(i * 0.4 + t * 0.3)`), 2–5 ondulações, amplitude ≤ 10% do tamanho. Ruído de alta frequência vira zigue-zague agressivo.

**Armadilha**: desenhar um círculo e chamar de vaso. Se um estranho não reconhece o
objeto no still, o conceito não chegou à tela. Olhe o still e pergunte isso.

## 21. Composição (layouts)
**Quando**: sempre. Cada trecho do vídeo usa um layout de `lib/layout.js`.
```js
import { LAYOUTS, fitFrame } from './lib/layout.js';
const L = LAYOUTS.split;   // split | splitRight | stack | text | hero
const cam = makeCamera([
  { t: 0,  ...fitFrame(L.hero, 330) },              // protagonista com 330 de altura no mundo
  { t: 5,  ...fitFrame(L.hero, 760, 1300), e: 'zoom' }, // recuo: agora o conjunto tem 760 × 1300
]);
makeText({ lines: [...], ...L.text, size: 118, ... });  // x, y, maxW e align da zona de texto
```
- `split`: frase ao lado do desenho (o padrão para a maior parte do vídeo).
- `text`: pergunta ou frase-choque sozinha; o mundo some ou vira fantasma (alpha ≤ 0,15).
- `hero`: o gesto do conceito em tela cheia, sem texto.
- `stack`: desenho em cima, dados curtos embaixo (bom para o cartão final).
Troque de layout com uma chave de câmera nova (`e: 'io'`) **enquanto não há texto na tela**.
**Armadilha**: medir o protagonista errado. Meça a altura/largura dele no mundo
(maior y − menor y dos pontos) e passe as duas para `fitFrame`.
