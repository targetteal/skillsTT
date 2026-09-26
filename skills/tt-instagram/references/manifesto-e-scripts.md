# Manifesto, exportação e validação

Os comandos abaixo rodam **a partir da pasta desta skill**. O caminho do manifesto pertence à campanha, não à instalação da skill. Use `python3` quando esse for o executável disponível.

## O manifesto é a ordem

Copie `assets/manifest.example.json` para uma pasta de campanha e preencha. O modelo não tem arquivos reais nem aprovação; falhar na validação dele é esperado.

Campos:

| Campo | Função |
|---|---|
| `schema_version` | `1.0`, formato local deste pacote |
| `campaign_id` | Identificação da peça/campanha |
| `account_username` | Conta sem `@`, confirmada na ferramenta antes de acesso |
| `target` | Largura, altura e cor de fundo da prancheta escolhida |
| `caption` | Legenda exata, editável |
| `slides` | Lista na ordem final, não um conjunto a ordenar por nome |
| `position` | Inteiro consecutivo a partir de 1, igual à posição na lista |
| `id` | Código estável em kebab-case |
| `role` | Função editorial, não estilo de desenho |
| `file` | Caminho relativo à pasta do manifesto, sem sair dela |
| `copy_text` | Transcrição da copy para comparação humana com a arte |
| `alt_text` | Texto alternativo revisado |
| `copy_status` | `pending` ou `approved`, conforme decisão real |

Papéis aceitos: `post_cover`, `context`, `argument`, `qualification`, `closure`, `club_bridge`, `season_closing`, `service`. Há exatamente uma `post_cover`, na primeira posição. Quando existir, `season_closing` fica no fim deste fluxo. Não há número fixo de slides, nem necessidade de usar todos os papéis.

## Dependência

Python 3.10+ e Pillow 11+. Veja `requirements.txt`. Os scripts são locais: não possuem credenciais, SDK de Instagram ou chamadas HTTP.

## Comandos

```bash
python scripts/carousel.py validate /caminho/campanha/manifest.json
python scripts/carousel.py export /caminho/campanha/manifest.json --out /caminho/campanha/export-v01
python scripts/carousel.py preview /caminho/campanha/export-v01/manifest.json --out /caminho/campanha/revisao-v01
python scripts/carousel.py validate /caminho/campanha/export-v01/manifest.json --strict --require-target
python scripts/carousel.py fingerprint /caminho/campanha/export-v01/manifest.json
python scripts/carousel.py package /caminho/campanha/export-v01/manifest.json --out /caminho/campanha/carrossel-v01.zip
```

Os caminhos de exemplo devem ser substituídos pelos reais. O script nunca sobrescreve uma pasta ou ZIP existente. Escolha uma nova versão de destino. Para empacotar uma revisão ainda pendente de copy/conta, acrescente `--draft` ao comando `package`; isso marca o pacote como rascunho local.

## O que a exportação faz

Lê os arquivos exatamente na ordem do manifesto, orienta por EXIF, respeita perfil ICC quando existente e exporta JPEG RGB com perfil sRGB. Fontes RGB/cinza sem perfil são interpretadas como sRGB, com aviso na validação. CMYK/LAB sem perfil ou ICC inválido causam falha, não uma conversão silenciosa.

O padrão exige praticamente a mesma proporção e redimensiona proporcionalmente, podendo acrescentar uma margem mínima de arredondamento. Uma arte de proporção muito diferente deve ser recomposta. `--fit contain` autoriza explicitamente bordas, sem recortar a arte. Não há modo stretch nem crop automático. `--allow-upscale` permite ampliação quando autorizada, com aviso de revisão; não recupera detalhe perdido.

Arquivos saem como `01-capa-post.jpg`, `02-argumento.jpg` etc. Saem também manifesto atualizado, legenda, alt texts e um relatório. A imagem de origem nunca é sobrescrita.

## Limites da API

Depois de verificar os valores atuais, passe-os a `validate` pelos parâmetros `--max-items`, `--max-bytes`, `--caption-limit` e `--alt-limit`. Não copie números históricos como se fossem os limites atuais. O script não consulta a plataforma e não valida todos os seus requisitos.

Códigos de saída: `0` verificação aprovada; `1` reprovação de validação/consistência; `2` erro de entrada ou execução. Aviso não é aprovação visual. Um limite de memória local evita imagens enormes; ele não é uma restrição do Instagram.

## Permissão e impressão digital

`fingerprint` resume conta, ordem, papéis, pixels, copy, alt texts, legenda e prancheta em um SHA-256. Renomear o mesmo arquivo sem mudar conteúdo não altera a impressão digital. Aprovação editorial é conferida separadamente.

Só depois de autorização explícita, registre-a em um arquivo baseado em `assets/approval.example.json`: `status: authorized`, conta, impressão digital, quem autorizou, data com fuso, instrução exata e momento. Não invente esses campos.

```bash
python scripts/carousel.py check-approval /caminho/campanha/export-v01/manifest.json /caminho/campanha/approval.json
```

Esse comando detecta divergência entre o conteúdo e o registro, mas não prova que a fala foi realmente dada. O agente precisa conferir a evidência de autorização e os controles do conector antes de publicar. Nenhum script publica.

## O que ainda exige olhar humano/agente com visão

O script não lê a imagem por OCR, não descobre fonte tipográfica, não julga qualidade narrativa, não reconhece a capa semanticamente a partir dos pixels e não detecta todo erro de texto gerado. `copy_text` e `role` declarados precisam ser confrontados visualmente com os arquivos. Abra a prévia e as imagens, não apenas o JSON verde.
