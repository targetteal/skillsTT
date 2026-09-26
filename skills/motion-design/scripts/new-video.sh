#!/usr/bin/env bash
# Cria um projeto de vídeo novo a partir do template e confere o ambiente.
#   bash <skill>/scripts/new-video.sh <pasta-destino>
set -euo pipefail
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:?uso: new-video.sh <pasta-destino>}"
if [ -e "$DEST" ] && [ -n "$(ls -A "$DEST" 2>/dev/null)" ]; then echo "erro: $DEST já existe e não está vazia" >&2; exit 1; fi
mkdir -p "$DEST"
cp -r "$SKILL/template/." "$DEST/"
rm -rf "$DEST/node_modules" "$DEST/out"
mkdir -p "$DEST/assets"
cd "$DEST"
npm install --silent
echo "── conferindo o ambiente com a cena de demonstração ──"
node render.mjs --check
echo
echo "pronto: $DEST"
echo "próximo passo: ler $SKILL/references/conceito.md e propor 3 conceitos ao usuário."
