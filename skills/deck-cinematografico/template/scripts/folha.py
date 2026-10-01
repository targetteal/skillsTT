# Junta PNGs numa folha de contato. Uso: python3 scripts/folha.py saida.png arq1.png arq2.png ... [--colunas 4]
import sys
from PIL import Image
args = sys.argv[1:]; cols = 4
if "--colunas" in args: i = args.index("--colunas"); cols = int(args[i + 1]); del args[i:i + 2]
out, files = args[0], args[1:]
w, h = 480, 270; rows = (len(files) + cols - 1) // cols
W = Image.new("RGB", (w * cols, h * rows), "#555")
for k, f in enumerate(files): W.paste(Image.open(f).resize((w, h)), ((k % cols) * w, (k // cols) * h))
W.save(out); print(out, len(files), "quadros")
