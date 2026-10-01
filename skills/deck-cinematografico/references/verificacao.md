# Fase 8 · Verificação

Rode tudo e olhe as imagens. Etiquete o que reportar como **MEDIDO**, **VISTO** ou **NÃO VERIFICADO**.

```bash
node scripts/ajustar-duracao.cjs                 # data-duration = duração real
npx hyperframes check                            # 0 erros (lint, layout, contraste)
node scripts/snap.cjs "" /tmp && python3 scripts/folha.py /tmp/folha.png /tmp/h*.png   # todas as paradas
node scripts/meios.cjs /tmp                      # meio de cada transição
node scripts/test-present.cjs                    # todas as paradas + latência do clique + erros
npx hyperframes render -q draft --workers 4 -o renders/rascunho.mp4
```
- Extraia 2–3 quadros do MP4 em transições rápidas (`ffmpeg -ss t -frames:v 1`) e compare com o navegador.
- Se houver QR: decodifique de um screenshot (jsqr) antes de afirmar que funciona.
- Falsos positivos do validador têm marcação certa (ver `armadilhas.md`); erro real se corrige.
