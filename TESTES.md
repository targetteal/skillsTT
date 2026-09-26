# Verificação desta entrega

**Pacote:** TT Skills 0.1.0  
**Data:** 26/09/2026

## Executado

**43 testes técnicos passaram.** Execução local com Python 3.13.5, Pillow 12.3.0 e PyYAML 6.0.3. Os testes usam arquivos sintéticos e não fazem chamadas à conta do Instagram.

Foram conferidos: três pastas de skill; frontmatter e nomes; referências diretas existentes; presença dos assets; ordem explícita; papéis de capa e encerramento; caminhos ausentes, absolutos e fora da pasta; duplicatas; campos inválidos; copy e marcadores pendentes; limites parametrizados; orientação EXIF; transparência e perfis de cor; exportação sem crop; ampliação somente explícita; preservação dos originais; ausência de sobrescrita; prévia HTML; ordem do ZIP; impressão digital e detecção de mudança após autorização registrada.

O script de contraste foi testado com cores iguais, preto/branco, pares teal/papel e entrada inválida. Os scripts de preparação não importam bibliotecas de rede.

A cópia da gramática PDF foi comparada por SHA-256 com o arquivo fornecido. As referências da capa do post e da temporada foram identificadas separadamente; as páginas de referência foram renderizadas a partir do PDF.

## Não executado

- Instalação ou acionamento das skills em Codex, Claude Code, Hermes ou outro agente.
- Os 19 cenários de comportamento em `evals/casos.json`, ou comparação de resultados com e sem as skills.
- Geração de novas artes usando estas skills já instaladas.
- Autenticação, criação de rascunhos, containers, agendamentos ou publicação no Instagram.
- Teste de um importador específico de ZIP.

## Como interpretar

Testes técnicos não provam que o agente terá bom julgamento editorial, que reconhecerá o estilo ou que uma API externa aceitará o conteúdo. Os cenários de comportamento e a revisão em tamanho de uso cobrem justamente o que não é possível comprovar só por código.

A versão 0.1.0 é uma primeira implementação completa para experimentar e refinar, não uma alegação de desempenho medido em produção. Nenhum status de aprovação de campanha foi criado nesta entrega.

## Reproduzir

Na raiz do pacote, instale as dependências de teste no ambiente apropriado e execute:

```bash
python -m pip install -r requirements-dev.txt
python -m unittest discover -s tests -v
```
