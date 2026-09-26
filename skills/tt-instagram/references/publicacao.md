# Preparação não é publicação

Procedimento conservador para as ferramentas disponíveis no momento do uso. Verifique a documentação atual antes de agir; não execute endpoints ou campos inventados.

## Estados diferentes

**Prévia local:** pasta, HTML ou folha de contato. Só existe onde foi salva.

**Rascunho visível no aplicativo:** só prometa quando o método atual oferecer explicitamente esse recurso. Não deduza a partir do nome “draft”.

**Container de API:** preparação técnica ainda não publicada. Não é promessa de rascunho editável/visível no aplicativo nem armazenamento durável. Verifique validade e processamento no endpoint atual.

**Agendamento:** instrução futura que requer recurso próprio e horário/fuso confirmados. Container não agenda sozinho.

**Post publicado:** precisa de sucesso de publicação e verificação do recurso/permalink, não apenas de um ID de preparação.

## Antes de criar containers

Confirme conta, arquivos e versão; compare a prévia com o manifesto; confira a legenda e textos alternativos. Verifique formatos/MIME aceitos pelo método atual, proporções, tamanho de arquivo, quantidade de itens, limites de texto, quota, status e validade de preparação. Não confunda recursos do app com os da API.

Os scripts entregam JPEGs RGB com perfil sRGB, em uma prancheta configurável, por conveniência operacional. Os valores da API não estão hardcoded neles: devem ser obtidos no schema/documentação e passados à validação quando pertinente. Se esses limites não puderem ser confirmados, entregue o pacote local e registre a pendência; não chame isso de publicação pronta.

## Autorização

A permissão precisa vincular **conta + conteúdo/versão + ordem + legenda + momento**. Uma mensagem explícita que já identifique isso basta; não crie um ciclo burocrático de confirmação. “Gostei da arte”, “podemos usar” ou “salve um rascunho” não autorizam publicação pública.

Após qualquer mudança nesses itens, verifique se a autorização ainda abrange a versão. `fingerprint` e `check-approval` ajudam a detectar diferença. Não geram consentimento. Não preencha o modelo de aprovação atribuindo uma fala inexistente à pessoa.

## Publicação de carrossel

1. Confirme identidade e acesso na ferramenta.
2. Disponibilize os arquivos pelo meio exigido, explicando qualquer hospedagem intermediária que amplie acesso. Não exponha relatos privados por conveniência de upload.
3. Crie/precesse cada child conforme schema atual. Preserve o vínculo `posição → arquivo → child_id`, inclusive se as respostas chegarem fora de ordem.
4. Confira estado de processamento e crie o parent com a lista na ordem do manifesto. Anexe legenda ao lugar correto no schema; alt text aos itens quando suportado.
5. Antes da chamada pública, revalide autorização e impressão digital dos arquivos/copy.
6. Publique uma vez. Em falha ambígua ou timeout, consulte o status e a conta antes de repetir. Evite posts duplicados.
7. Leia o recurso publicado, obtenha permalink e confira sequência/capa/legenda. Não publique um segundo post para corrigir o primeiro sem discutir a ação.

Armazene só IDs operacionais necessários, horários, estado e evidência da autorização no projeto. Não registre tokens. Não crie containers dias antes da publicação sem conhecer sua validade. Se uma ação não estiver disponível, descreva a limitação e não prometa fazê-la.

## Estado documental deste pacote

Na preparação desta entrega, as páginas da Meta sobre publicação/containers não puderam ser abertas. Por isso este documento ensina a verificar condições, não reproduz uma especificação técnica supostamente atual. O catálogo Composio é ponto de descoberta, não garantia de suporte da conta.

https://docs.composio.dev/toolkits/instagram
https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing/
