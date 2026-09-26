# skillsTT

Skills de agente da **Target Teal** e do **Clube dos Agentes de Mudança**.

Cada pasta em `skills/` é uma skill completa: um arquivo de instruções
(`SKILL.md`) e os arquivos de apoio que ela carrega quando precisa. O formato
`SKILL.md` é lido por Codex, Claude Code, OpenCode e Hermes Agent.

Instale só as que você vai usar. Cada pasta funciona sozinha.

## As cinco skills

| Skill | Para que serve | O que não faz |
|---|---|---|
| `tt-editorial` | Desenvolver tese, argumento, arco, e-mail, carrossel e legenda a partir de um material-fonte | Não gera imagem e não publica |
| `tt-visual` | Dar forma visual: gramática TT/Clube, ilustração, composição e revisão de arte | Não reescreve texto aprovado e não opera conta |
| `tt-instagram` | Ler referências e a grade, ordenar, exportar e preparar publicação autorizada | Não decide a tese e não publica por conta própria |
| `motion-design` | Produzir vídeo de motion design (MP4 com som) inteiramente em código: conceito, animação, áudio e render | Não faz GIF de interface, animação CSS de site nem edição de vídeo gravado |
| `clubett-identidade-visual` | Criar e revisar peças visuais com a identidade oficial e a gramática do Clube | Não inventa dado, evento, citação ou autorização de uso |

## Instalar

Com Node.js e npm, usando o gerenciador de skills:

```bash
npx skills add targetteal/skillsTT --skill tt-editorial -g -y
npx skills add targetteal/skillsTT --skill tt-visual -g -y
npx skills add targetteal/skillsTT --skill tt-instagram -g -y
npx skills add targetteal/skillsTT --skill motion-design -g -y
npx skills add targetteal/skillsTT --skill clubett-identidade-visual -g -y
```

No Hermes Agent:

```bash
hermes skills install targetteal/skillsTT/skills/tt-editorial --yes
hermes skills install targetteal/skillsTT/skills/tt-visual --yes
hermes skills install targetteal/skillsTT/skills/tt-instagram --yes
hermes skills install targetteal/skillsTT/skills/motion-design --yes
hermes skills install targetteal/skillsTT/skills/clubett-identidade-visual --yes
```

Para instalar apenas em um projeto, retire o `-g`. Para escolher o agente,
acrescente `-a codex`, `-a claude-code` ou outro suportado.

Sem gerenciador, copie a pasta inteira (não só o `SKILL.md`) para o diretório de
skills do agente. Em Claude Code e OpenCode é `.claude/skills/`; em projetos
Codex, `.agents/skills/`.

```bash
git clone https://github.com/targetteal/skillsTT /tmp/skillsTT
cp -R /tmp/skillsTT/skills/tt-editorial ~/.claude/skills/
```

Depois peça ao agente pelo nome: *"Use tt-editorial. A partir deste ensaio,
proponha uma tese e um arco para um carrossel."*

## Como as skills passam trabalho entre si

A passagem é por arquivos reais e versões identificadas, não por suposição:

```
tt-editorial  --roteiro aprovado-->  tt-visual  --manifesto e arquivos-->  tt-instagram
```

`tt-editorial` entrega a versão do roteiro, a ordem e os textos congelados.
`tt-visual` recebe esses textos aprovados e devolve a arte e o plano de
composição. `tt-instagram` recebe a ordem e os arquivos exatos e cuida da
exportação e, só com autorização explícita, da publicação.

`motion-design` e `clubett-identidade-visual` são independentes e não dependem
desse encadeamento. Um pedido pequeno, como revisar uma legenda, não precisa
disparar a produção inteira.

## Ferramentas incluídas

| Script | O que faz | Requisitos |
|---|---|---|
| `skills/tt-instagram/scripts/carousel.py` | Valida ordem e arquivos, exporta JPEG sRGB sem deformação, gera prévia HTML e folha de contato, calcula impressão digital do conteúdo e monta um ZIP | Python 3.10+ e Pillow 11+ |
| `skills/tt-visual/scripts/contrast.py` | Calcula o contraste WCAG entre duas cores sólidas | Só biblioteca padrão do Python |
| `skills/motion-design/template/` | Projeto executável de vídeo (demo de 14,5 s) com as primitivas de animação | Node 18+, um Chromium e ffmpeg |

O `carousel.py` **não faz requisições de rede e não publica**. O `contrast.py`
não avalia a legibilidade de uma arte inteira. Nenhum script guarda credenciais.

## Verificação

```bash
python -m pip install -r requirements-dev.txt
python -m unittest discover -s tests -v
```

Os técnicos cobrem frontmatter, links entre arquivos, presença dos assets,
ordem explícita, papéis de capa e encerramento, perfis de cor, transparência,
proporção, ampliação, prévia, empacotamento e impressão digital. Detalhes em
`TESTES.md` e `tests/README.md`.

Os cenários de comportamento em `evals/casos.json` (acionamento indevido, editar
a capa errada, publicar sem autorização) **ainda não foram executados** em
nenhum ambiente de agente e estão marcados como tal. Teste técnico não prova
julgamento editorial.

`MANIFEST.json` traz o SHA-256 de cada arquivo do repositório:

```bash
python - <<'PY'
import hashlib, json, pathlib
root = pathlib.Path('.').resolve()
man = json.loads((root / 'MANIFEST.json').read_text())
bad = [f['path'] for f in man['files']
       if hashlib.sha256((root / f['path']).read_bytes()).hexdigest() != f['sha256']]
print('divergentes:', bad or 'nenhum')
PY
```

## O que não vem neste repositório

- Credenciais, tokens, identificadores de conta e sessões de ferramenta.
- Acesso ou conexão com o Instagram. O conector precisa ser configurado no seu
  ambiente; a skill orienta o uso, não cria o acesso.
- Arquivos de fonte tipográfica, por licenciamento.
- Um gerador de imagem ou motor de renderização próprio. As skills usam o que
  existir no seu ambiente e dizem o que não puderam verificar.
- Cópias do feed, links temporários de mídia e dados privados de conta.

## Licença e marca

Conteúdo proprietário da Target Teal. Repositório público para consulta e
instalação, sem licença aberta de reuso. Leia `LICENSE.md`.

## Procedência

Origem de cada skill, o que foi adaptado e a verificação feita na publicação
estão em `PROCEDENCIA.md`.
