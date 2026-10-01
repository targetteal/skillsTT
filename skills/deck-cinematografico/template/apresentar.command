#!/bin/bash
# Duplo clique: serve o deck em http://127.0.0.1:PORTA e abre o modo apresentação no Chrome.
# O Chrome bloqueia arquivos locais (file://), por isso o servidor.
cd "$(dirname "$0")"
PORT=${PORT:-8765}
if ! lsof -i :$PORT >/dev/null 2>&1; then python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1 & sleep 1; fi
URL="http://127.0.0.1:$PORT/index.html?present&v=$(date +%s)"
open -a "Google Chrome" "$URL" 2>/dev/null || open "$URL"
echo "Deck aberto em $URL · deixe esta janela aberta durante a apresentação."
wait
