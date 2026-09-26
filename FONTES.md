# Fontes e procedência

Consulta documental: **26/09/2026**. Os links abaixo foram consultados nesta entrega. Não foram reutilizados como evidência os links não verificados de respostas anteriores.

## Base fornecida por Ravi

- **Esta sessão:** correções de tom; revisão antes da geração; tese como capa; capa da temporada no encerramento; manutenção de artes aprovadas; fundo da capa adequado à grade; três opções de legenda; preferência por uma pasta de lançamento; termo “temporada”. São decisões de trabalho, não regras universais da plataforma.
- **Gramática visual do Clube, v2, setembro/2026:** arquivo original em `skills/tt-visual/assets/gramatica-visual.pdf`. O próprio documento se identifica como proposta de guia e mantém decisões em aberto. Referências visuais e síntese não o convertem em política nova aprovada.
- **Carta do Clube, 15/09/2026:** apenas os contornos de voz e relação com as pessoas foram usados na síntese editorial. Não foram importadas ofertas ou regras de participação antigas.
- **Ensaio sobre loucura nas organizações:** fonte do caso histórico. Não virou conteúdo obrigatório de campanhas futuras.

Os prints derivados da gramática e as miniaturas das capas têm sua procedência em `skills/tt-visual/references/caso-clube.md`. São referências de estilo e de função editorial, não assets oficiais de marca nem novas promessas de campanha.

## Documentação externa consultada

**Agent Skills, especificação:** formato do `SKILL.md`, metadados, caminhos relativos, referências e scripts opcionais.
https://agentskills.io/specification

**Agent Skills, boas práticas:** unidades de trabalho coerentes; extração de procedimentos de tarefas reais; instruções enxutas; carregamento sob demanda; validação.
https://agentskills.io/skill-creation/best-practices

**Anthropic, boas práticas de autoria:** descrições acionáveis, contexto enxuto e avaliações com casos representativos.
https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**OpenAI, documentação de skills:** estrutura e uso. O endereço do Codex redirecionou para a documentação abaixo nesta consulta.
https://developers.openai.com/codex/skills/
https://learn.chatgpt.com/docs/build-skills

**OpenAI, exemplo de uso em projeto:** `.agents/skills/` como localização no repositório.
https://developers.openai.com/pt-BR/blog/skills-agents-sdk

**Claude Code, skills:** localização de projeto `.claude/skills/`, escopos e instalação dependentes do ambiente.
https://code.claude.com/docs/en/skills

**Composio, meta tools:** descoberta, conexão, execução e leitura dos schemas em tempo de execução.
https://docs.composio.dev/toolkits/meta-tools

**Composio, execução:** agrupar apenas chamadas independentes; conexão ativa; argumentos conforme schema.
https://docs.composio.dev/toolkits/meta-tools/multi_execute_tool

**Composio, catálogo Instagram:** ações e disponibilidade devem ser redescobertas na execução.
https://docs.composio.dev/toolkits/instagram

## O que não foi confirmado nesta entrega

A leitura direta das páginas da Meta sobre publicação e containers falhou nesta consulta, incluindo uma resposta HTTP 429. Por isso o pacote não fixa como universais o máximo de slides, a duração dos containers ou os limites da API. `tt-instagram` deve consultar a documentação e o schema efetivamente disponíveis no momento do uso.

As páginas a verificar quando necessário são:
https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing/
https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-container/

O acesso por Composio ocorrido nesta conversa é um antecedente, não comprovação de conexão atual em outro ambiente. A alegação anterior de inspeção visual completa do feed não deve ser tratada como evidência: o histórico contém tentativas frustradas de exibir as imagens. A skill exige abrir as imagens e registrar limites do que efetivamente foi observado.

## Decisões de implementação, não prescrições das fontes

A divisão em três skills, o manifesto, os scripts, o controle por impressão digital e os critérios editoriais foram projetados para este fluxo. Nenhuma fonte afirma que três seja o número ideal para todas as situações. Os exemplos não estabelecem novos slogans, personagens ou resultados garantidos.
