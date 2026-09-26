# Do briefing ao conceito

Este é o passo que mais separa um vídeo memorável de um vídeo competente.
Técnica se aprende em uma tarde; conceito fraco não se salva com técnica.

## O erro mais comum: o tour

O primeiro impulso diante de "faça um vídeo apresentando X" é **percorrer X**:
mostrar o site, a lista de benefícios, os capítulos da landing, na ordem. Isso
produz um trailer do material existente, não uma ideia. No caso real que
originou esta skill, o primeiro roteiro fez exatamente isso (navio, mapa,
tempestade, porto — os atos da landing, em sequência) e o cliente respondeu:
"a narrativa tá fraca, tá só tentando apresentar o site em forma de vídeo".

Sinal de alerta: se o seu roteiro poderia ser escrito só lendo o site do
cliente, sem pensar, ele é um tour.

## O que é um conceito

Um conceito tem três partes. Escreva as três antes de qualquer outra coisa.

1. **Tese**: uma frase que o vídeo afirma. Não um tema ("saúde mental"), uma
   afirmação ("a gente desenha organizações, depois elas desenham a gente").
2. **Recurso formal**: um gesto visual que *é* a tese, não a ilustra. O
   espectador entende a ideia olhando a forma mudar, mesmo sem ler o texto.
3. **Virada**: o ponto em que o recurso muda de comportamento. É ali que o
   vídeo "diz" alguma coisa.

Exemplo (Planta ≠ Mapa):
- Tese: organizações são desenhadas e passam a desenhar as pessoas; mas todo
  desenho é um rascunho, e outros são possíveis.
- Recurso formal: **uma linha que desenha**. Começa técnica, perfeita, de
  régua (a planta baixa: feita para obedecer). Termina tremida, a lápis, em
  camadas (o rascunho: feito para explorar).
- Virada: um lápis encosta na planta e o traço técnico vira lápis, espalhando-se
  como contágio a partir do ponto de contato.

Teste do recurso: *se eu tirar o texto, o vídeo ainda diz algo?* Se não diz,
o recurso é decoração.

## Catálogo de recursos formais (ponto de partida, não cardápio fechado)

| Recurso | O que ele diz | Como se faz aqui |
|---|---|---|
| Traço muda de natureza (técnico → lápis) | o que parecia fixo era escolha | `stroke` com `ampFn` + `spreadFrom` |
| Recuo de câmera que revela contexto | o detalhe é parte de algo maior | câmera `'zoom'` log |
| Repetição que acelera até travar | pressão, ciclo, esgotamento | tempos em progressão geométrica; ciclo com ω(t) crescente |
| Congelamento total (imagem e som) | choque, tomada de consciência | clamp de t + `S.silence()` |
| Camadas translúcidas sobrepostas | pluralidade, possibilidades, não-solução | `drawSheet` |
| Carimbo | resposta pronta, rótulo imposto, burocracia | `drawStamp` |
| Linhas que se desfazem e viram outra forma | transformação, passagem entre mundos | `buildMorph` + `drawMorph` |
| Imagem revelada por dentro das linhas | a ideia "vira" a peça do cliente | `revealThroughLines` |
| Rima entre início e fim (o mesmo gesto, outro sentido) | o percurso mudou o significado | reutilize a mesma primitiva com outra intenção |
| Final que não fecha (rota interrompida, acorde suspenso) | abertura, convite, continuidade | traço até 60-70% + acorde sem tônica |

## Como gerar conceitos (faça por escrito)

1. **Pesquise o material real** antes de propor: manual de marca, textos do
   site, ilustrações, estudos, nomes de produtos. No caso real, os *estudos
   visuais da temporada* (escritório dentro da cabeça, cadeira com raízes,
   salas sem saída) continham o conceito — o site não.
2. Liste **5 tensões** do tema (ex.: "a solução oferecida é individual, o
   problema é organizacional").
3. Para cada tensão, pergunte: *que gesto visual encarna isso?*
4. Escolha **3 candidatos diferentes entre si** e escreva cada um com tese,
   recurso formal, virada e final. Apresente ao usuário e **espere a escolha**.

## Não prometa o que o cliente não promete

Na segunda rodada do caso real, o conceito dizia "o Clube é onde a gente
**redesenha** junto". O cliente corrigiu: "fica muito otimista. A gente não
redesenha junto. A gente **explora** junto outros desenhos possíveis."

Lição geral: verbos de solução (resolver, transformar, redesenhar, curar)
costumam prometer demais. Prefira verbos que o cliente pode sustentar
(explorar, investigar, experimentar, conversar). E deixe isso chegar à forma:
no vídeo, as folhas de papel manteiga não substituem a planta — a planta
continua visível por baixo, e uma das propostas é riscada.

## Teste da cadeia de texto

As frases na tela precisam formar uma cadeia: cada uma nasce da anterior.
Escreva-as em sequência e rotule a função de cada uma:

```
A GENTE DESENHA ORGANIZAÇÕES. / DEPOIS, ELAS DESENHAM A GENTE.     → tese
E SE O PROBLEMA NÃO ESTIVER SÓ EM VOCÊ?                            → deslocamento
QUEM TENTA MUDAR ORGANIZAÇÕES TAMBÉM ADOECE NELAS.                 → implicação
MAS TODA PLANTA JÁ FOI UM RASCUNHO.                                → virada (retoma a metáfora)
A GENTE EXPLORA JUNTO OUTROS DESENHOS POSSÍVEIS.                   → convite (conclui a virada)
```

Falha real que este teste pega: uma versão anterior tinha, em sequência,
"QUEM TENTA MUDAR ORGANIZAÇÕES TAMBÉM ADOECE NELAS." / "NÃO TEMOS A PLANTA
CERTA." / "A GENTE EXPLORA JUNTO…". O cliente: "vem com uma frase forte e
depois termina com algo desconexo". A frase 1 falava *de pessoas*, a 2 pulava
para *plantas* sem ponte. Correção: mover a frase forte para fechar o bloco
anterior e abrir o bloco novo com um conectivo ("MAS") que retoma a metáfora.

Perguntas do teste:
- Cada frase responde, contradiz ou aprofunda a anterior? (se só "muda de assunto", falhou)
- A metáfora central aparece nas frases de virada e de convite?
- A última frase conclui a virada, ou é um slogan colado?
- Alguma frase promete mais do que o cliente pode cumprir?

## Formato da proposta ao usuário

Para cada candidato:

```
### Conceito N — "<nome curto>"
Tese: ...
Recurso formal: ...
Virada: ...
Final: ...
Por que funciona para este cliente: ... (cite o material pesquisado)
```

Depois recomende um, com uma frase de motivo. Não escreva código antes da escolha.
