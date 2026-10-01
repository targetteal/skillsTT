# Identidade (`identidade.json`)

O motor não conhece marca nenhuma: tudo vem deste arquivo, aplicado no `index.html` por `scripts/aplicar-identidade.mjs` (bloco entre `IDENTIDADE:INICIO/FIM`).

```json
{
  "nome": "…", "descricao": "…",
  "cores": { "papel", "papel_claro", "papel_escuro", "tinta", "suave", "acento", "categorias": ["…", "…", "…"] },
  "fontes": {
    "display": { "familia", "google", "pilha", "peso?", "estiramento?", "caixa?", "espacamento?" },
    "texto":   { "familia", "google", "pilha" },
    "mono":    { "familia", "google", "pilha" }
  },
  "textura": { "grao": 0..1 }, "movimento": { "respiracao": 0..1.5 },
  "projeto": { "titulo", "cabecalho_esq", "cabecalho_centro" }
}
```
No CSS: `var(--papel) var(--tinta) var(--suave) var(--acento) var(--c1..)`; classes `.display .texto .mono`. `em` usa o acento.

## De onde vem
- **Preset:** `presets/ensaio.json` (revista de ensaio), `manchete.json` (capa escura condensada), `suico.json` (grade e grotesca).
- **Projeto existente:** leia tokens CSS / `design.md` e traduza.
- **Skill de marca:** ex. `clubett-identidade-visual` para Target Teal e Clube. Leia a skill e preencha o JSON.
- **Nova direção criada na fase 3:** salve como preset novo em `presets/` para reusar (e registre no CHANGELOG).

Contraste: o validador exige 4,5:1 em texto pequeno. Se o acento reprovar, escureça um grau (no caso real: #B5482F → #A63F28).

**Pilha de reserva (`pilha`):** use só genéricos (`serif`, `sans-serif`, `monospace`) ou nomes que o HyperFrames reconhece (Georgia, Helvetica Neue, Arial…). Nomes fora da lista (ex.: "Arial Narrow") reprovam no `check` com `font_family_without_font_face`.
