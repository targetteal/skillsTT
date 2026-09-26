# Som

O som é metade da sensação de qualidade, e aqui ele é **gerado em código** pela
mesma partitura da imagem (`template/audio/synth.mjs`). Você não consegue ouvir o
resultado, então o trabalho se apoia em duas coisas: **regras de mapeamento** e
**medição** (`tools/loudness.mjs`).

## Princípio: o som é consequência da imagem

Todo gesto visual relevante tem um som no **mesmo instante** (mesmo `T.algo`).
Se um som não aponta para um gesto, apague-o. Se um gesto importante está mudo,
o espectador sente que "falta peso".

| Gesto visual | Som | Nível sugerido |
|---|---|---|
| traço técnico / caneta | `pen(t0, t1, 0.08–0.14)` | médio-baixo |
| lápis, grafite, rabisco | `graphite(t0, t1, 0.08–0.12)` | médio-baixo |
| marcador passando | `marker(t, 0.05–0.06)` | baixo |
| algo entra/sai deslizando | `swoosh(t, dur, 0.05–0.08, pan, fA, fB)` | baixo |
| impacto (carimbo, porta, estalo) | `thump({ t, gain: 0.3–0.8 })` + swoosh curto 0,14 s antes | alto |
| toque, pop, aparição de ponto | `click(t)` + nota aguda curta (`tone`) | baixo |
| papel descolando | `peel(t)` | médio |
| tensão sustentada | `tone` grave (D2, A2) com ataque lento | baixo |
| pressão que acelera | pulsos (`thump` curtos) nos eventos + zumbido cuja altura segue a velocidade | crescente |
| transformação mágica | arpejo ascendente de `piano` (pentatônica) + `swoosh` longo | médio |

Use `pan` (−1…1) seguindo a posição na tela: objeto à direita, som à direita.

## Estrutura musical

- **Atos de tensão sem música**: só ruído, ritmo e grave. A música que entra
  cedo demais explica a emoção em vez de deixá-la acontecer.
- **A música entra na virada** (no caso real: com o papel manteiga).
- **Harmonia espelha o conceito.** Final aberto ⇒ último acorde sem a tônica
  no baixo ou suspenso (ex.: sobre Lá num contexto de Ré, com 7ª e 9ª). Final
  afirmativo ⇒ tônica no baixo.
- Progressão segura e bonita (Ré maior, uma nota por acorde a cada ~2,5–3 s):
  `Dmaj9 → Bm11 → Gmaj7(#11) → Em9 → Dmaj9/A → …` — ver `CHORDS` do exemplo.
- `S.chord(t, notas)` já faz arpejo leve e cama de cordas.

## Silêncio

`S.silence(a, b)` zera tudo (inclusive o reverb) nesse intervalo. Use no
congelamento. Um segundo de silêncio absoluto depois de um crescendo é o
momento mais forte do filme. Fora disso, mantenha `roomTone()` ligado: silêncio
"digital" no meio de uma cena soa como falha.

## Medição (obrigatória: você não pode ouvir — e não precisa)

`node audio.mjs` já imprime o **nível por segundo** e avisa trechos mudos. Para a
loudness integrada: `node tools/loudness.mjs out/audio.wav 2`. As duas coisas são
*medições numéricas*: funcionam aqui, sem alto-falante. "Não dá para medir sem ouvir"
é um engano — meça sempre.
Metas:
- integrada entre **−20 e −14 LUFS** antes do `loudnorm` final (o render normaliza para −16);
- faixa dinâmica (LRA) **< 11 LU** — acima disso os trechos baixos somem no celular;
- nenhum trecho com imagem ativa abaixo de **−30 LUFS** (fora do silêncio intencional).

Se um trecho está baixo demais, aumente o ganho *dos sons daquele trecho* — não o master.
O caso real começou com a abertura em −33 LUFS e os carimbos em −10: subir a caneta
(+6 dB) e comprimir resolveu (LRA 17,5 → 7,7).

No relatório final, diga com franqueza que o som foi **medido, não ouvido**.
