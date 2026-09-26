# Roteiro e partitura

Depois do conceito aprovado, transforme-o em **partitura**: uma tabela de
tempos que vira `timeline.mjs`. A imagem e o som leem da mesma partitura.

## Estrutura que funciona para 45–75 s

| Bloco | Duração | Função |
|---|---|---|
| Ato I | ~25–30% | instala o mundo e a tese; ritmo crescente |
| Ato II | ~25–30% | complica: deslocamento + implicação; termina no pico de tensão |
| (corte) | 1–1,5 s | congelamento / silêncio / respiro antes da virada |
| Ato III | ~25% | virada e convite; ritmo mais calmo, música entra |
| Fecho | ~15–20% | a peça do cliente + dados concretos (data, local, URL) + gesto final |

Vídeos de 15–20 s (redes): um ato só (tese → virada → dados), mesmo princípio.

## Tempo de leitura (texto na tela)

- Tempo mínimo em tela de uma frase: **0,9 s + 0,3 s por palavra**, contado
  a partir do fim da entrada. "QUEM TENTA MUDAR ORGANIZAÇÕES TAMBÉM ADOECE
  NELAS" (7 palavras) ⇒ ≥ 3 s parada.
- No máximo **~8 palavras por frase na tela** e **uma frase por vez**.
- Nunca mostre texto enquanto a câmera faz um movimento grande: o olho não
  consegue ler e seguir ao mesmo tempo. Texto entra depois que a câmera
  assenta, ou a câmera deriva devagar (`'lin'`).

## Ritmo

- **Acelere antes de cortar**: tempos que se aproximam em progressão
  geométrica (portas fechando em 5.9, 6.5, 7.0, 7.4; relógio com intervalo
  × 0,9 a cada tique, **sempre com piso**: `S.accel()` no som) criam urgência sem pedir nada ao espectador.
- **O corte seco é mais forte que o fade** em momentos de choque.
- **Silêncio é um evento**: 1–1,5 s de nada (imagem congelada, som zero)
  antes da virada faz a virada existir.
- **Respiros de 0,3–0,6 s** entre a saída de um texto e a entrada do próximo.
- Um gesto visual por vez no centro da atenção. Dois ao mesmo tempo, só se
  um deles for fundo (deriva lenta, grão, tremor do traço).

## Modelo de partitura (preencha antes de codar)

```
| t (s)  | Imagem                                    | Texto na tela                    | Som                      |
|--------|-------------------------------------------|----------------------------------|--------------------------|
| 0.5    | ponto (a pessoa) aparece com mola         | —                                | clique suave + nota aguda|
| 1.0–2.4| paredes externas se desenham, caneta      | —                                | caneta contínua          |
| 3.7    |                                           | A GENTE DESENHA / ORGANIZAÇÕES.  |                          |
| 5.9…7.4| portas fecham, cada vez mais rápido       |                                  | batidas + relógio acelera|
| ...    |                                           |                                  |                          |
```

Regras da tabela:
- **Todo gesto visual tem uma linha de som** (mesmo que seja "—, de propósito").
- Tempos com **duas casas** no máximo; arredonde para o quadro (1/30 s) não importa.
- Marque os momentos de **silêncio** e de **congelamento** explicitamente.

## De tabela para `timeline.mjs`

- Um nome por gesto (`doorClose`, `stamps`, `touch`...). Listas para gestos
  repetidos (`stamps: [17.3, 17.95, 18.5, 18.95]`), pares para intervalos
  (`headDraw: [11.0, 14.9]`).
- Acordes em `CHORDS`, com `t` e `notes` (ver `som.md`).
- Nada de tempo "solto" dentro de `scene.js` além de pequenas defasagens
  relativas (`T.stamp - 0.13`). Se você está digitando `23.7` na cena, ele
  deveria estar na partitura.

## Apresente o roteiro ao usuário

Mostre a sequência de frases (com o teste da cadeia de `conceito.md`) e a
tabela resumida por ato. Espere o "vai" antes de construir: mudar uma frase
depois do render custa minutos; mudar o roteiro depois da cena pronta custa horas.
