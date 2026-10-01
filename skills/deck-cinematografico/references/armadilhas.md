# Armadilhas (custaram tempo no caso real)

| Sintoma | Causa | Correção |
|---|---|---|
| "Unsafe attempt to load URL file://" no Chrome do usuário | Chrome trata cada arquivo local como origem isolada | Entregar sempre por http: `apresentar.command` |
| Clique demora 2–3 s para começar | Tocava o respiro do vídeo antes da animação | Já resolvido no motor (`HOLD_ENDS`); não mexer |
| Deck nativo do HyperFrames pula direto ao fim de cada parada | O slideshow faz seek, não play | Por isso existe o modo `?present` do motor |
| Playwright trava num `evaluate` | Retornou `tl.seek()` (serializa a timeline) | `p.evaluate(t => { tl.seek(t); })` com chaves |
| Headless Chromium trava rodando em primeiro plano no shell | ambiente | Rodar via scripts do template; em último caso `&` + `sleep` |
| Palavra por linha em bloco de texto | `div` absoluto dentro de pai com largura 0 | Sempre dar `width` (ou `white-space: nowrap`) |
| Texto SVG some em coordenadas grandes | Chrome recorta `<text>` longe da origem | Rótulos em HTML |
| Validador: `content_overlap`/`text_occluded` em linhas mascaradas, dígitos de odômetro, grão | Caixas escondidas continuam no lugar | Motor marca `.ln` e odômetro; grão fica **abaixo** do conteúdo; decorativos com `data-layout-ignore`; itens 3D com `data-layout-allow-overlap` |
| `gsap_non_transform_motion` | Animar `letterSpacing`/layout | Animar só transform/opacidade |
| `gsap_css_transform_conflict` | CSS `transform` + tween GSAP no mesmo elemento | Estado inicial no `fromTo`; transform estático só em elementos que o GSAP não anima |
| Duas composições na raiz | Backup `.html` com `data-composition-id` na raiz | Guardar backups em `arquivo/` |
| Linha inteira sumiu depois de edição | `sed '/padrão/d'` apaga a linha toda | Editar por substituição exata com asserção (python) |
| Contraste 4,4:1 | acento claro em texto pequeno ou fundo tingido | Escurecer um grau; tingimento ≤ 4% |
| Objetos de primeiro plano aparecem nas paradas | posicionados perto demais das regiões | Colocar no MEIO dos trajetos (≥ 700 px das paradas em y/x) |
| Mudança grande quebra o que funcionava | — | Congelar cópia (`<projeto>-v1/`, lançador em outra porta) antes |
