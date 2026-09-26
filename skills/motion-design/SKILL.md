---
name: motion-design
description: Cria vídeos de motion design (MP4 com som) inteiramente em código — canvas 2D renderizado quadro a quadro num Chromium sem janela, com trilha e efeitos sonoros sintetizados — seguindo um método de conceito, partitura, construção por primitivas testadas e verificação por quadros. Use sempre que o usuário pedir um vídeo animado, vinheta, teaser, trailer, convite em vídeo, explainer, abertura, animação para redes (Reels, Stories, YouTube), tipografia cinética ou "um vídeo com motion design feito com código", mesmo que não diga "motion design", e também quando pedir para animar uma arte, capa ou identidade visual existente. Não use para GIFs de interface, animações CSS de site ou edição de vídeo gravado.
version: 1.1.0
author: Ravi Resck (Target Teal)
license: proprietary
platforms: [macos, linux]
metadata:
  hermes:
    tags: [video, motion-design, animacao, canvas, ffmpeg, audio-sintetizado, tipografia-cinetica, mp4, render, playwright]
    related_skills: [hyperframes, generative-video-composition, p5js]
    requires_toolsets: [terminal, file]
    upstream: https://github.com/targetteal/c.a.m/tree/main/.claude/skills/motion-design
---

# Motion design em código

Você vai produzir um vídeo de verdade — conceito, imagem em movimento, som,
MP4 — sem nenhum programa de edição. A técnica está pronta em `template/`.
O que decide a qualidade é o **método**: pensar antes de desenhar, e olhar
quadros de perto antes de entregar. Este método foi extraído de um vídeo real
(`examples/target-teal-planta-mapa/`), incluindo os erros que ele cometeu.

## Como a coisa funciona (leia uma vez)

- `scene.js` desenha **um quadro** num `<canvas>` 1920×1080 a partir do tempo `t`.
  É uma **função pura de `t`**: sem estado entre quadros, sem `Math.random()`
  (use `rng(seed)`), sem relógio. Isso permite renderizar em paralelo e com motion blur.
- `timeline.mjs` é a **partitura**: todos os tempos do filme. A cena e o som leem dela.
- `audio.mjs` gera `out/audio.wav` com `audio/synth.mjs` (caneta, grafite, impactos, piano...).
- `render.mjs` abre a cena no Chromium, captura os quadros e monta o MP4 com ffmpeg.
- `lib/` são as primitivas testadas. **Monte o vídeo com elas**; não reescreva.

## As seis fases

Cada fase termina num **portão**. Não pule portões: cada um existe porque,
no caso real, pulá-lo teria custado horas de retrabalho ou um vídeo pior.

### Fase 0 — Ambiente
```bash
bash <caminho-da-skill>/scripts/new-video.sh <pasta-do-projeto>/video
```
Copia o template, instala dependências e roda `--check` na demo.
**Portão**: `check ok`. Se falhar, resolva o ambiente agora (Chromium: defina
`CHROME_PATH`; fontes: `npm install`). Opcional: `npm run contact` e abra
`out/contact.png` para ver o que a demo faz.

### Fase 1 — Pesquisa
Leia o material real do cliente: manual de marca, cores e fontes, textos do
site, ilustrações, estudos, fotos, datas e dados concretos do que será anunciado.
Olhe as imagens (abra-as), não só os nomes dos arquivos.
**Portão**: uma lista escrita com (a) paleta e fontes, (b) imagens utilizáveis e
o que cada uma sugere, (c) fatos que precisam aparecer (data, hora, URL, nome),
(d) regras da marca que afetam movimento (ex.: "sem gradiente", "não rotacionar o logo").

### Fase 2 — Conceito
Leia `references/conceito.md`. Escreva **três conceitos diferentes**, cada um com
tese, recurso formal, virada e final. Recomende um.
**Portão**: apresente ao usuário e **espere a escolha**. Não escreva código antes.
O erro mais provável aqui é o *tour* (percorrer o site/produto em ordem); o
arquivo explica como evitá-lo.

### Fase 3 — Roteiro e partitura
Leia `references/roteiro.md`. Escreva as frases da tela e aplique o **teste da
cadeia de texto**. Monte a tabela tempo × imagem × texto × som.
**Portão**: mostre as frases e a tabela resumida ao usuário e espere o "vai".
Depois, traduza a tabela para `timeline.mjs`.

### Fase 4 — Construção (ato por ato)
1. Preencha `brand.js` com a identidade (cores por **papel**: paper, ink, accent, marker, mid).
   Copie as imagens do cliente para `assets/` e declare-as em `images` no `boot(...)`.
2. Reescreva `scene.js` mantendo a **estrutura** da demo (camadas na ordem:
   papel → mundo com câmera → tela → imagens cheias/cartão → grão).
3. **Composição por layout, não por coordenada solta.** Para cada trecho, escolha
   um layout de `lib/layout.js` (`split`, `splitRight`, `stack`, `text`, `hero`):
   o texto recebe `...L.text`, a câmera recebe `fitFrame(L.hero, alturaNoMundo, larguraNoMundo)`.
   Assim o protagonista fica grande e o texto nunca cai em cima dele.
4. Para cada gesto, procure a receita em `references/receitas.md` e use a primitiva.
   Regras de texto em `references/tipografia.md`.
5. **Depois de cada ato**: `node render.mjs --stills <tempos do ato>` (acrescente
   `--debug` para ver grade, margem e origem do mundo), abra os PNGs,
   aplique o checklist de `references/qa.md`, amplie detalhes com `tools/zoom.mjs`,
   corrija. Só então passe ao próximo ato.

**Portão**: todos os atos com stills conferidos.

### Fase 5 — Som
Leia `references/som.md`. Escreva `audio.mjs` com um som para cada gesto
relevante, amarrado a `T.*`. Rode `node audio.mjs && node tools/loudness.mjs out/audio.wav`.
**Portão**: integrada entre −20 e −14 LUFS, LRA < 11, nenhum trecho ativo abaixo de −30.

### Fase 6 — Verificação final e entrega
```bash
node render.mjs --check      # MEDE: movimento e área desenhada a cada 0,5 s, bordas, fontes, erros; lista ALERTAS
node render.mjs --contact    # abra out/contact.png: a história se lê em sequência?
node render.mjs --draft      # rápido, para conferir ritmo
node render.mjs              # final: out/final.mp4 (≈ 15–20 min por minuto de vídeo em 4 núcleos; rode em segundo plano)
node render.mjs --preview    # out/preview.mp4 ≤ 28 MB, para enviar por chat
node render.mjs --report     # out/medicoes.md: check + loudness num arquivo, para colar no relatório
```
Extraia 2–3 quadros do `final.mp4` em momentos de movimento rápido e confira.
**Portão**: relatório ao usuário contendo:
- a **descrição quadro a quadro da folha de contato** (uma linha por quadro: o que
  se vê, onde está o protagonista, qual texto aparece) — é a prova de que você olhou;
- o arquivo `out/medicoes.md` (de `--report`) colado inteiro, e o que você fez com cada ALERTA;
- as linhas **APROVADO/REPROVADO** de `node tools/loudness.mjs out/audio.wav` copiadas
  literalmente (não resuma números com palavras suas: copie);
- o que não foi verificado (você não ouviu o som: mediu) e qualquer dado inferido
  que precise de confirmação.

## Erros típicos (vistos em testes com modelos menores — confira antes de entregar)

1. **O protagonista sumiu ou ficou minúsculo.** Coordenadas de mundo confundidas
   com as de tela na câmera. Desenhe o protagonista em torno de (0,0) do mundo e
   use `frame(s, 0, 0, telaX, telaY)`. Na dúvida: `node render.mjs --stills 3 --debug`
   mostra a grade da tela, a margem e a cruz azul da origem do mundo. O protagonista
   do conceito deve ocupar **30–60% da altura do quadro** nos momentos dele.
2. **Texto cortado ou fora da tela.** `makeText` usa `x` como borda esquerda
   (padrão) — para centralizar, `align: 'center'` com `x: 960`. Nunca `x: W/2` sem `align`.
3. **"Congelamento" feito com um véu escuro por cima.** Congelar é *parar o tempo*
   (`ft = T.freeze` para tudo que se move) + `S.silence(...)`. Nada de sobreposição.
4. **Textos que nunca saem** (título que fica o vídeo inteiro). Uma frase por vez;
   todo texto tem `tOut`, e o próximo entra depois que o anterior saiu.
5. **Trechos mudos.** `node audio.mjs` imprime o nível por segundo e acusa trechos
   mudos. Isso é medição — funciona sem ouvir, aqui mesmo. Mantenha `S.roomTone()`.
6. **"Verificado" sem ter olhado.** Rodar um comando não é olhar. Só conta como
   verificado o quadro que você **abriu com a ferramenta de leitura de imagem**.
7. **Conceito que não virou imagem.** Se a tese é "a peça torta é bonita", a peça
   precisa estar lá, grande, desenhada com cuidado (receita 20: objetos por perfil),
   e a transformação precisa ser visível na folha de contato.

8. **Trechos parados.** Mais de 3 s sem nada se mover (fora dos 2 s finais) mata o
   ritmo. O `--check` aponta "PARADO de X a Y". Deriva de câmera `'lin'`, traço que
   ferve, o próximo gesto mais cedo — ou encurte o vídeo.
9. **Autoavaliação otimista.** Em teste, um modelo escreveu "protagonista ocupa
   40–50% da altura" quando ocupava 5%. Miniaturas enganam. Para tamanho e ritmo,
   **confie nos números** do `--check` e no `fitFrame`, não na sua impressão.

10. **Laço infinito.** Intervalo que encolhe sem piso (`dt *= 0.9`) pode nunca
    chegar ao fim do trecho. Use `S.accel(t0, t1)` no som e o mesmo padrão com piso
    na cena. Os comandos têm vigia e abortam com mensagem se travarem.
11. **Dados ilegíveis no fim.** Data, horário e URL são o que o espectador precisa
    ler: use `drawEndCard()` (lib/text.js), que já vem com tamanhos certos.
12. **Deformação agressiva.** "Torto e bonito" é deformação *orgânica*: 2–5 ondulações
    lentas (`noise1` em baixa frequência), amplitude ≤ 10% do tamanho — não zigue-zague.

## Regras que valem sempre (e por quê)

- **Função pura de `t`.** Estado entre quadros quebra o render paralelo e o
  motion blur de formas difíceis de diagnosticar.
- **Todo tempo mora na partitura.** Assim som e imagem nunca se desalinham.
- **Olhe os quadros.** Código "certo" produz defeitos visíveis (acento cortado,
  lasca de máscara). Você só os vê abrindo a imagem — e ampliando.
- **Menos texto, maior.** Uma frase por vez, ≤ 8 palavras, tempo de leitura
  mínimo 0,9 s + 0,3 s/palavra.
- **Um foco por quadro.** Tudo o mais é fundo (deriva lenta, tremor de traço, grão).
- **Identidade como função.** Cor de destaque para o que importa (a pessoa, a
  palavra-chave, a URL); papel e tinta para o resto. Sem gradientes/brilhos se a
  marca não usa. Nunca redesenhe, distorça ou recolora o logo do cliente.
- **Não prometa pelo cliente.** Verbos de solução ("transformar", "resolver")
  quase sempre prometem demais; ver `conceito.md`.
- **Seja franco no relatório.** O que foi medido, o que foi olhado, o que ficou por conferir.

## Mapa de arquivos

```
SKILL.md                      este roteiro
references/conceito.md        briefing → conceito; catálogo de recursos formais; teste da cadeia
references/roteiro.md         estrutura, tempo de leitura, ritmo, modelo de partitura
references/receitas.md        21 receitas de movimento com código e armadilhas
references/tipografia.md      escolhas, tamanhos, regras nascidas de defeitos reais
references/som.md             mapa gesto→som, música, silêncio, medição
references/qa.md              ciclo de verificação, checklist, defeitos e correções
template/                     projeto pronto (demo de 14,5 s) — copie com new-video.sh
  lib/                        core, path, paper, text, camera, layout, fx, engine
  audio/synth.mjs             síntese de som
  tools/                      zoom.mjs, bounds.mjs, loudness.mjs
examples/target-teal-planta-mapa/   caso real completo (61,5 s) e sua história
scripts/new-video.sh          inicia um projeto novo
```

Quando tiver dúvida sobre *como* fazer um gesto, abra `receitas.md`. Quando
tiver dúvida sobre *se* o vídeo está bom, abra `qa.md` e um still.
