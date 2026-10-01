# Motor (`template/motor.js`)

## Estrutura do projeto
```
index.html          esqueleto + bloco IDENTIDADE + lista de <script src="planos/…">
motor.js            não editar por projeto (melhorias voltam para a skill)
planos/NN-nome.js   um plano por arquivo: Deck.plano({ ... })
identidade.json     cores, fontes, cabeçalho
roteiro.js          roteiro (revisão, storyboard, cola)
storyboard.js       rascunhos
```

## Plano
```js
Deck.plano({
  id: "constelacao", numero: "06", regiao: [3840, 0], p3d: true,     // p3d se usar z
  build(c) { /* cria elementos em c.g (grupo do plano, no mundo) ou c.hud (tela) */ return { ... }; },   // vira c.p.constelacao
  beats: [ { dur: 4, hold: 3, run(t, c) { /* tweens a partir de t */ } } ]
});
```
Mundo: com a câmera em `{ cx: 960, cy: 540, s: 1 }`, mundo = tela. Cada plano vive numa **região** (ex.: 1920×1080 a partir de `regiao`); centro = `c.centro(id)`. Planos podem compartilhar objetos (`c.shared`, `c.p.<id>`) para match cuts: a ordem dos scripts importa.

## API (`c`)
| | |
|---|---|
| `c.tl` | a timeline GSAP (pausada) |
| `c.cam(t, {cx,cy,s,rx,ry,r}, dur, ease)` | move a câmera; omitidos voltam a 0/1 |
| `c.camK(t, [[alvo, dur, ease], …])` | vários pontos de passagem |
| `c.corte(t, alvo)` / `c.tremor(t, força)` | corte seco / tremor de impacto |
| `c.lines(el, ["linha", "<em>ênfase</em>"])` | linhas mascaradas (retorna spans) |
| `c.reveal(spans, t, stagger, dur)` / `c.conceal(spans, t)` | entrada/saída por máscara |
| `c.odometro(el, 98, altura)` → `rolar(t, dur)` | número que rola |
| `c.link3d(a, b, opacidade, pai)` | linha 3D entre `{x,y,z}`; anime `scaleX` 0→1 |
| `c.compensa(z)` | fator para posicionar quem está em z |
| `c.fundo(html)` / `c.poeira(regioes)` / `c.primeiroPlano(itens)` | camadas de profundidade |
| `c.div / c.svg / c.rng / c.hexPts / c.decor` | utilitários (decor = `data-layout-ignore`) |
| `c.numero(t, "07")` | troca o Nº do cabeçalho (automático no 1º beat se o plano tem `numero`) |

## Iniciar
`Deck.iniciar({ reentrada: { ate: "<plano>-<beat>", segundos: 60 }, cabecalho: true })` no fim do `index.html`. Depois de mudar tempos: `node scripts/ajustar-duracao.cjs`.

## Ao vivo (`?present`)
→/espaço/PageDown/clique avança tocando a animação (o respiro do vídeo é pulado); ← volta; Home; F tela cheia; R reentrada.
