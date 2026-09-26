# Verificação visual (QA)

Você não vê o vídeo rodando. Você vê **quadros**. Por isso a qualidade depende
de olhar quadros certos, de perto, a cada etapa. No caso real, quatro defeitos
só apareceram assim — nenhum teria sido notado "lendo o código".

## Ciclo de trabalho

A cada ato construído:
1. `node render.mjs --stills <3–6 tempos do ato>` (use `--debug` para ver a grade, a margem de segurança e a origem do mundo) — escolha: início do gesto,
   meio, fim, e o momento em que cada texto está inteiro.
2. **Abra cada PNG** (ferramenta de leitura de imagem) e percorra o checklist.
3. Detalhes suspeitos: `node tools/zoom.mjs out/stills/tXXX.png x y w h` e abra o zoom.
4. Corrija e renderize os mesmos tempos de novo. Só então passe ao próximo ato.

Ao final de tudo:
5. `node render.mjs --check` (erros de página, quadros vazios, fontes, tempos).
6. `node render.mjs --contact` e abra `out/contact.png`: a sequência lê como história?
7. `node render.mjs --draft` (rápido), depois `node render.mjs` (final) e `--preview`.
8. Extraia 2–3 quadros do MP4 final (movimento rápido) para confirmar o motion blur.

## Checklist por quadro

- [ ] **O protagonista do conceito está visível e grande** (30–60% da altura) nos momentos dele? Um estranho reconheceria o objeto?
- [ ] Texto inteiro legível; nenhum acento/cedilha cortado; nada encostando na linha de cima.
- [ ] Texto a ≥ 100 px das bordas (margem de segurança).
- [ ] Nenhum resto de elemento que já deveria ter saído (lascas de marcador, fragmentos de máscara).
- [ ] Texto não compete com o desenho (sobreposição só se intencional).
- [ ] Hierarquia clara: um foco por quadro.
- [ ] Cores só da paleta do `brand.js`; destaque usado com parcimônia.
- [ ] Transições sem bordas duras não intencionais.
- [ ] Logo e emblema do cliente sem distorção, sem recolorir, sem redesenhar.
- [ ] No cartão final: data, horário, URL e nome corretos e iguais aos do material do cliente.

## Defeitos conhecidos e correções

| Sintoma | Causa | Correção |
|---|---|---|
| Marca estranha sob uma letra da linha de cima ("Ş") | acento da linha de baixo encostando (entrelinha curta) | entrelinha 1,2 |
| Acento ou cedilha cortados | máscara de linha apertada | 1,25× acima / 0,32× abaixo (já no `text.js`) |
| Faixa fina colorida onde havia texto | marcador não saiu inteiro da máscara | saída sobe 1,6× corpo (já no `text.js`) |
| Fragmentos de letras ao revelar título de uma arte | regiões estimadas a olho | medir com `tools/bounds.mjs`; ampliar 10–20 px |
| Corte reto atravessando a imagem na revelação | varrido geométrico | revelar só pelas linhas, com `blur` na máscara |
| Fundo translúcido do cartão final "suja" o texto | opacidade baixa | ≥ 0,94 |
| Diagrama sobreposto a um desenho fantasma poluído | fantasma forte demais | alpha do mundo ≤ 0,06 atrás de diagramas |
| Texto em fonte padrão (Times/Arial) | fonte não carregou | `npm run check` lista fontes; conferir caminhos em `brand.js` |
| Vídeo "tremido" / diferente entre renders | `Math.random()` ou estado entre quadros | `rng(seed)` e funções puras de `t` |
| Quadros pretos | erro de JS na página | `npm run check` mostra o erro |
| Protagonista ausente ou num canto | `frame()` recebeu coordenadas de tela | desenhe em torno de (0,0) do mundo; confira com `--debug` |
| Texto começa no meio da tela e é cortado à direita | `x: 960` sem `align: 'center'` | `align: 'center'` |
| Quadro "escurecido" no congelamento | véu por cima em vez de parar o tempo | receita 12 |

## O que reportar ao entregar

- **Descrição quadro a quadro da folha de contato** (uma linha por quadro). Sem isso, não houve verificação.
- O que foi verificado e como (stills, zoom, folha de contato, loudness medida).
- O que **não** foi verificado (ex.: "não ouvi o áudio; medi loudness por trecho").
- Qualquer informação do cartão final que foi inferida e precisa de confirmação.
- Arquivos: final (alta qualidade) e prévia (≤ 28 MB), com caminhos.
