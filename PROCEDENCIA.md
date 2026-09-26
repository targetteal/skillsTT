# Procedência

De onde vem cada skill deste repositório, o que foi adaptado e o que foi
verificado antes de publicar.

## Origem por skill

| Skill | Origem | Versão | Adaptações nesta publicação |
|---|---|---|---|
| `tt-editorial` | Pacote **TT Skills 0.1.0** (`TT_Skills_v0.1.0.zip`, 26/09/2026), `skills/tt-editorial` | 0.1.0 | Nenhuma. Arquivos idênticos aos da entrega |
| `tt-visual` | Mesmo pacote, `skills/tt-visual` | 0.1.0 | Nenhuma |
| `tt-instagram` | Mesmo pacote, `skills/tt-instagram` | 0.1.0 | Nenhuma |
| `motion-design` | Instalação de agente da skill que vive no repositório privado `targetteal/c.a.m`, em `.claude/skills/motion-design/`, commit `08e076a` | 1.1.0 | Removida a maquinaria interna (ver abaixo) e atualizada a seção de instalação do `README.md` |
| `clubett-identidade-visual` | Repositório público `targetteal/clubett-identidade-visual`, commit `3dc5ed9` | sem versão declarada | Nenhuma. Cópia idêntica |

## Verificação do pacote TT Skills 0.1.0

Antes de publicar, o pacote foi conferido contra o próprio manifesto:

- 39 de 39 arquivos com SHA-256 idêntico ao `MANIFEST.json` da entrega.
- 43 de 43 testes técnicos aprovados com Python 3.11.3 e Pillow 12.2.0.
- Execução real de ponta a ponta do `carousel.py` (validate, export, preview,
  fingerprint) sobre arquivos sintéticos, confirmando que o script funciona
  depois de instalado.

Os arquivos das três skills `tt-*` publicados aqui são byte a byte os daquele
pacote. `FONTES.md`, `TESTES.md`, `evals/`, `tests/` e `requirements-dev.txt`
vieram do mesmo pacote.

## O que foi adaptado no repositório

1. **`README.md` da raiz**: substitui o README do pacote TT Skills 0.1.0, que
   descrevia apenas as três skills editoriais. O texto novo cobre as cinco e
   mantém as seções de limites, ferramentas e verificação.
2. **`tests/test_bundle.py`**: no pacote original uma verificação exigia que
   `skills/` contivesse exatamente as três skills `tt-*`. Aqui as verificações de
   frontmatter e de links ficam restritas a essas três, e uma verificação nova
   confirma que as cinco skills existem. Nenhuma verificação de conteúdo foi
   relaxada e `tests/test_scripts.py` segue inalterado.
3. **`skills/motion-design/README.md`**: a seção de instalação apontava para o
   repositório interno. Agora aponta para este repositório.
4. **`MANIFEST.json`**: gerado para este repositório, com o SHA-256 de cada
   arquivo versionado. O manifesto do pacote original descrevia outra árvore.

### Arquivos de `motion-design` não publicados

Três arquivos existem somente na instalação local do agente e ficaram fora deste
repositório por serem maquinaria interna, com caminhos absolutos da máquina e
detalhes de sincronização entre repositórios:

| Arquivo | Por que ficou fora |
|---|---|
| `PROVENANCE.md` | Registro da instalação local do agente, com caminho absoluto da máquina e o contrato de sincronização com o repositório privado |
| `scripts/sync-from-cam.sh` | Script que espelha a skill a partir do repositório privado, específico da instalação local |
| `scripts/hermes-frontmatter.yaml` | Sidecar de metadados do Hermes, reaplicado pelo script acima |

O método, as referências, o template, o exemplo e o `scripts/new-video.sh`
publicados são os do repositório upstream, sem alteração de conteúdo.

## Manutenção

`clubett-identidade-visual` e `motion-design` também existem nos seus
repositórios de origem. Ao mudar uma dessas skills, mude na origem e traga a
cópia atualizada para cá, para que as duas versões não divirjam em silêncio.
As três skills `tt-*` têm este repositório como origem.

## Terceiros

O template de vídeo declara dependências de Node (`package.json` e
`package-lock.json`) com as licenças dos respectivos autores. Nenhum arquivo de
fonte tipográfica é distribuído aqui.
