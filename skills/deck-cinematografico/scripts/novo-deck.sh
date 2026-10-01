#!/bin/bash
# Cria um projeto de deck cinematográfico.
# Uso: bash novo-deck.sh <pasta> [preset: ensaio|manchete|suico|caminho.json] ["Título"] ["Cabeçalho esq."] ["Cabeçalho centro"]
set -e
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$1"; PRESET="${2:-ensaio}"; TITULO="${3:-Deck}"; CAB_ESQ="${4:-$TITULO}"; CAB_CENTRO="${5:-}"
[ -z "$DEST" ] && { echo "uso: novo-deck.sh <pasta> [preset] [título] [cab. esq.] [cab. centro]"; exit 1; }
[ -e "$DEST" ] && [ "$(ls -A "$DEST")" ] && { echo "a pasta $DEST já existe e não está vazia"; exit 1; }
PRESET_FILE="$PRESET"; [ -f "$PRESET_FILE" ] || PRESET_FILE="$SKILL/presets/$PRESET.json"
[ -f "$PRESET_FILE" ] || { echo "preset não encontrado: $PRESET"; exit 1; }

echo "1/6 · projeto HyperFrames"
HYPERFRAMES_SKIP_SKILLS=1 npx --yes hyperframes@latest init "$DEST" --example blank --non-interactive --skill general-video >/dev/null
echo "2/6 · template"
cp -R "$SKILL/template/." "$DEST/"
chmod +x "$DEST/apresentar.command"
cd "$DEST"
mkdir -p vendor fonts
# GSAP não é redistribuído pela skill: baixado na criação (fica local; o deck roda offline depois)
curl -fsSL -o vendor/gsap.min.js https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js || { echo "não consegui baixar o GSAP"; exit 1; }
echo "3/6 · identidade ($PRESET)"
node -e '
const fs=require("fs"); const id=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
id.projeto={titulo:process.argv[2],cabecalho_esq:process.argv[3],cabecalho_centro:process.argv[4]};
fs.writeFileSync("identidade.json",JSON.stringify(id,null,2)+"\n");' "$PRESET_FILE" "$TITULO" "$CAB_ESQ" "$CAB_CENTRO"
echo "4/6 · dependências de verificação (playwright)"
node -e 'require("playwright")' 2>/dev/null || npm install --no-audit --no-fund -D playwright >/dev/null
npx playwright install chromium >/dev/null 2>&1 || true
echo "5/6 · fontes e bloco de identidade"
node scripts/baixar-fontes.mjs
node scripts/aplicar-identidade.mjs
node scripts/ajustar-duracao.cjs
echo "6/6 · validação"
npx --yes hyperframes@latest check 2>&1 | grep -E "error\(s\)|Check (passed|failed)" || true
echo
echo "Pronto: $DEST"
echo "  deck ao vivo:  ./apresentar.command      revisão: revisao.html      storyboard: storyboard.html"
