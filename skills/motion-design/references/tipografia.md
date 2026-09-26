# Tipografia em movimento

## Escolhas

- **Display** (frases na tela): condensada, caixa alta, pesada — Anton, Bebas Neue,
  Oswald, League Gothic. Use a da marca se houver. Cabe muita palavra em pouca largura.
- **Texto** (datas, legendas, anotações, rótulos de diagrama): sans legível
  (Roboto, Inter, a da marca), 24–36 px, peso 400/700.
- Rótulos de diagrama e anotações: 700, caixa alta, `letterSpacing` 3–5 px.
- Fontes locais via `@fontsource/<nome>` (npm), declaradas em `brand.js`.
  Rode `npm run check`: ele lista as fontes carregadas. "NENHUMA" = texto em fonte padrão.

## Tamanhos em 1920×1080

| Uso | Corpo |
|---|---|
| Pergunta/frase-choque (tela quase vazia) | 150–160 px |
| Frase principal ao lado de uma imagem | 100–120 px |
| Frase longa (4 linhas) | 86–104 px (use `maxW`) |
| Dado do cartão final (data) | 110–150 px |
| URL | 64–80 px |
| Apoio | 30–36 px |
| Rótulo pequeno | 24–30 px |

Coluna de texto: margem esquerda 100 px (margem de segurança), largura máxima
~780 px quando divide a tela com uma imagem. Imagem do outro lado.

## Regras que vieram de defeitos reais

1. **Entrelinha 1,2 em caixa alta com acentos.** Com 1,02 o til de "NÃO" e de
   "ORGANIZAÇÕES" encostou na linha de cima e parecia um defeito do "S" ("Ş").
2. **Máscara de linha generosa**: 1,25×corpo acima da linha de base e 0,32×
   abaixo. Menos que isso corta o acento em cima e a cedilha embaixo.
3. **Saída sobe 1,6×corpo.** Com 1,3× sobrou uma lasca do marcador na borda da máscara.
4. **Marcador: 1–2 palavras por frase.** Marcar duas linhas inteiras pesa demais
   (foi retirado no caso real: ficou só "POSSÍVEIS").
5. **Não dê zoom em texto** nem o coloque dentro do mundo com câmera em movimento.
6. **Uma cor de destaque por frase**, no máximo (`^palavra`).
7. **Confira cada frase em zoom** (`tools/zoom.mjs`) na primeira vez que ela aparece
   inteira: acentos, cedilhas, pontuação, quebra de linha.

## Quebra de linha

Quebre por sentido, não por largura: "QUEM TENTA MUDAR / ORGANIZAÇÕES / TAMBÉM
ADOECE / NELAS." — a palavra-choque sozinha na última linha. Evite deixar
artigo ou preposição no fim de linha.
