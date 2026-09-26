# motion-design — skill de motion design feito em código

Skill para agentes (Claude Code e similares) produzirem vídeos de motion
design completos — conceito, animação, som e MP4 — **só com código**: canvas 2D
renderizado quadro a quadro num Chromium sem janela, trilha sintetizada, ffmpeg.

Nasceu da engenharia reversa do vídeo "Planta ≠ Mapa" (convite da Temporada 0
do Clube dos Agentes de Mudança, Target Teal) e foi escrita para que mesmo
modelos menores cheguem a um resultado parecido: o método tem portões de
aprovação, primitivas testadas e um ciclo de verificação por quadros.

## Instalação

A partir deste repositório, como skill de agente:

```bash
npx skills add targetteal/skillsTT --skill motion-design -g -y
hermes skills install targetteal/skillsTT/skills/motion-design --yes
```

Ou copie a pasta para o diretório de skills do seu agente:

```bash
git clone https://github.com/targetteal/skillsTT /tmp/skillsTT
cp -R /tmp/skillsTT/skills/motion-design ~/.claude/skills/motion-design
```

Existe também uma cópia de uso interno, dentro do repositório privado da landing
do Clube, como skill de projeto. Esta aqui é a versão de distribuição para
sócios e colaboradores.

## Uso direto (sem agente)

```bash
bash scripts/new-video.sh ~/meu-video
cd ~/meu-video
npm run contact     # folha de contato da demo em out/contact.png
node audio.mjs && node render.mjs --draft
```

Requisitos: Node 18+, um Chromium (o do Playwright serve; ou defina `CHROME_PATH`).
O ffmpeg vem pelo pacote `ffmpeg-static`.

## Conteúdo

- `SKILL.md` — o método em seis fases, com portões.
- `references/` — conceito, roteiro, receitas de movimento, tipografia, som, verificação.
- `template/` — projeto executável (demo de 14,5 s) com `lib/` de primitivas.
- `examples/target-teal-planta-mapa/` — o caso real completo e a história das correções.
