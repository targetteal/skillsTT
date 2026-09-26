# Inventário-fonte do brandbook do Clube

Status: levantamento editorial para handoff. Este documento descreve o que já
existe e o que ainda precisa ser decidido; ele não é o brandbook final.

Base observada: checkout canônico do Clube, branch `main`, SHA curto `b6df97a`,
em 17 de setembro de 2026.

## 1. Relação entre Target Teal e Clube

O Clube herda da Target Teal:

- a paleta central de teal, off-white e ink;
- Anton como voz editorial de display e Roboto como tipografia funcional;
- composição de alto contraste, hierarquia forte e alinhamento
  predominantemente à esquerda;
- intervenções manuais, desenho expressivo, irreverência controlada e
  ausência de acabamento corporativo genérico;
- formas retas, pouco ou nenhum arredondamento e uso pontual das cores de
  produto.

O Clube acrescenta um universo narrativo próprio:

- travessia em mar aberto;
- navio e tripulação;
- mapa incompleto, rota tracejada, bússola e leme;
- tempestade, calmaria, monstros marinhos e papel que se rompe;
- porto seguro, encontro entre pares e experimentação em torno da mesa;
- pirataria como independência e coragem para desobedecer fórmulas, não como
  agressividade ou fantasia infantil.

Hipótese editorial para o brandbook: o Clube é uma expressão da Target Teal,
não uma marca visual desconectada. A identidade TT fornece o sistema gráfico;
o Clube fornece personagens, metáforas, objetos e situações recorrentes.

## 2. Identidade visual observada

### Paleta

| Papel | Cor | Uso observado |
|---|---|---|
| Teal escuro | `#256675` | campo principal, água, roupa, títulos e ações |
| Teal médio | `#4B8C99` | variação tonal e superfícies de apoio |
| Teal claro | `#7AB5BC` | detalhes, nuvens, marcações e destaque |
| Off-white | `#F2EFEB` | papel, fundo e espaço de respiração |
| Ink | `#1E1E1E` | contorno, tipografia, estrutura e contraste |
| Laranja | `#ED6337` | foco, ação ou detalhe excepcional; não domina |

As ilustrações canônicas restringem a maior parte da cor a teal, cinza/ink e
off-white. A paleta secundária completa da Target Teal existe para produtos e
categorias, mas não aparece como arco-íris dentro do universo narrativo do
Clube.

### Tipografia

- **Anton 400:** títulos grandes, curtos, em caixa alta, com ritmo de pôster.
- **Roboto 400/500/700:** corpo, metadados, controles e explicações.
- **Soda Cream:** prevista no sistema Target Teal como anotação controlada,
  mas não carregada pela landing atual. O brandbook precisa decidir se ela
  continua autorizada para peças do Clube.

### Linguagem da ilustração

- desenho editorial plano, feito à mão;
- contornos pretos/charcoal confiantes, com pequenas irregularidades;
- hachura fina, textura de grafite e aquarela restrita;
- papel contemporâneo off-white, nunca pergaminho antigo;
- surrealismo legível e desproporção com propósito;
- pouca decoração e bastante espaço negativo para texto;
- personagens expressivos, em ação ou relação, nunca posando como stock;
- tecnologia aparece como mapa, diagrama, carta ou ferramenta simples, e não
  como holograma ou dispositivo futurista;
- sem 3D, fotorrealismo, brilho, gradiente, neon ou acabamento glossy.

### Composição

- assimetria forte com massa visual de um lado e área editorial calma do outro;
- cenas horizontais próximas de 16:9 para a narrativa;
- texto é aplicado em HTML ou no layout final, não gerado dentro da imagem;
- o espaço negativo é solicitado explicitamente nos prompts;
- personagens, mãos, objetos e horizonte precisam manter continuidade entre
  imagens relacionadas;
- quando uma imagem será animada, usa-se uma arte mestre e edições localizadas,
  evitando regenerar todo o quadro.

## 3. Marcas e assinaturas

### Emblema do Clube

O favicon e ícone de aplicação usam um emblema hexagonal teal/ink/off-white
sobre ossos cruzados. O núcleo hexagonal deriva da marca Target Teal; os ossos
introduzem a camada pirata do Clube.

Arquivos de produção:

- `public/icon.png`, 512 × 512: mestre raster mais útil para documentação;
- `public/apple-icon.png`, 180 × 180;
- `public/favicon.ico`, 48 × 48.

No pacote portátil, o mestre aparece como `assets/identity/club-emblem.png`.

O repositório ainda não contém uma especificação formal de área de proteção,
tamanho mínimo, fundos autorizados, versões monocromáticas ou construção
vetorial desse emblema. Isso é uma lacuna do futuro brandbook.

### Ilustração-símbolo do Clube

`public/Clube da Mudança Logo.png`, 900 × 900, mostra navio, bandeira e sete
personagens. Ela funciona como ilustração-símbolo no painel administrativo,
mas não é uma assinatura tipográfica completa.

No pacote portátil: `assets/identity/club-crew-mark.png`.

### Relação com a marca Target Teal

A landing usa lockups escuro e claro da Target Teal no header/footer. Eles
permanecem assinaturas institucionais; não devem ser redesenhados como parte do
brandbook do Clube.

## 4. Elenco visual

A narrativa principal usa seis personagens recorrentes:

1. mulher negra com cabelo afro, bandana e jaqueta teal;
2. homem negro com bandana pontilhada e barba;
3. homem branco de cabelo escuro e blazer charcoal;
4. homem negro jovem de cabelo cacheado e roupa teal;
5. pessoa alta de moicano teal, óculos redondos e roupa teal;
6. mulher de cabelo curto teal e moletom cinza.

A ilustração-símbolo quadrada contém uma sétima personagem, de cabelo teal e
óculos, que não aparece no conjunto recorrente da landing. O brandbook precisa
decidir explicitamente se:

- os sete formam o elenco canônico completo e a landing mostra apenas seis; ou
- os personagens são arquétipos variáveis, não mascotes com continuidade
  obrigatória.

Até essa decisão, novas cenas que dão continuidade à landing devem preservar
os seis personagens da narrativa, cada um apenas uma vez.

## 5. Inventário dos assets

### Referências essenciais anexadas ao handoff

| Asset lógico | Dimensão | Estado | Papel no sistema |
|---|---:|---|---|
| `assets/identity/club-emblem.png` | 512 × 512 | produção | emblema/favikon do Clube |
| `assets/identity/club-crew-mark.png` | 900 × 900 | produção | ilustração-símbolo com navio e elenco |
| `assets/identity/target-teal-logo-dark.png` | 800 × 249 | produção | assinatura institucional sobre fundo claro |
| `assets/identity/target-teal-logo-light.png` | 966 × 341 | produção | assinatura institucional sobre fundo teal |
| `assets/narrative/travessia-hero.webp` | 1672 × 941 | produção | abertura, tripulação, navio, bandeira e espaço negativo |
| `assets/narrative/map-master.webp` | 1575 × 999 | produção | objeto mestre do mapa e continuidade da rota |
| `assets/narrative/storm-paper.webp` | 1672 × 941 | produção | tempestade, monstro e espaço editorial |
| `assets/narrative/crack-paper.webp` | 1672 × 941 | produção | ruptura material do papel; composição em camadas |
| `assets/narrative/porto-seguro.webp` | 1672 × 941 | produção | grupo reunido no barco como comunidade |
| `assets/narrative/pertencimento.webp` | 1659 × 948 | produção | conversa, escuta e experimento coletivo |
| `assets/narrative/ship-release.webp` | 1672 × 941 | produção | edição localizada e continuidade dos personagens |
| `assets/navigation/compass.png` | 1254 × 1254 | produção | gatilho de navegação e objeto isolado |
| `assets/navigation/club-map.png` | 1536 × 1024 | produção | mapa de navegação do site |
| `assets/navigation/wheel.webp` | 900 × 900 | produção | leme associado aos movimentos do Clube |
| `assets/applications/social-card.png` | 1200 × 630 | produção | aplicação pronta de imagem, título e assinatura visual |

### Assets de runtime não anexados individualmente

Estes arquivos continuam importantes para a animação, mas são variações ou
camadas técnicas e não acrescentam vocabulário visual suficiente para o
handoff editorial:

- `held-paper-clean-v1.webp`;
- `ship-notice-v1.webp`;
- `ship-reach-v2.webp`;
- `storm-empty-v1.webp`;
- `masks/planes.png`.

Eles demonstram uma regra de produção relevante: para animação, preservar a
imagem inteira e alterar apenas pose, mão, objeto ou expressão explicitamente
delimitados.

### Variantes preservadas, mas não canônicas para novas peças

- `comunidade-porto-seguro.webp`: versão anterior à correção usada atualmente;
- `travessia-poster-paper-v2.webp`: variante de pôster sem referência no
  runtime atual;
- `travessia-cartografia.webp`: fallback/arte compacta e fonte histórica da
  travessia;
- `stop-motion-v2/`: 168 frames locais não rastreados, cerca de 390 MB,
  associados a um experimento interrompido. Foram deliberadamente excluídos do
  handoff e não devem ser tratados como cânone aprovado.

## 6. Gramática visual extraída

### Mais Clube

- pessoas tentando compreender ou transformar algo juntas;
- gestos de apontar, observar, desenhar, conversar e navegar;
- objetos simples com carga narrativa: mapa, bússola, carta, leme, mesa;
- tensão entre risco e acolhimento;
- desenho manual, teal concentrado e papel respirando;
- humor e irreverência sem caricatura infantil;
- cenas que parecem um instante de uma história maior.

### Menos Clube

- equipe comemorando para a câmera;
- sala de reunião, post-its e aperto de mãos como atalho para colaboração;
- robôs, cérebros com circuitos, hologramas e futurismo genérico;
- pirata realista, violência, armas ou fantasia histórica;
- excesso de ícones, símbolos flutuantes ou decoração náutica;
- navio detalhado como fetiche visual sem relação com a cena;
- textura vintage marrom, pergaminho envelhecido ou grunge gratuito;
- paleta arco-íris, neon, gradientes e sombras brilhantes;
- texto gerado dentro da imagem;
- mãos defeituosas, elenco duplicado ou personagens sem continuidade.

## 7. Sistema recomendado para prompts

Um prompt do Clube deve combinar:

1. tipo de tarefa: geração nova, edição precisa ou preservação de identidade;
2. uso final e proporção;
3. cena concreta e ação das pessoas;
4. personagens que precisam permanecer iguais;
5. composição e área reservada para texto;
6. material, linha, textura e paleta;
7. objetos permitidos;
8. lista explícita do que não pode aparecer;
9. verificação anatômica e de continuidade.

Bloco de DNA reutilizável:

> Ilustração editorial 2D desenhada à mão, com contornos charcoal expressivos,
> hachura fina e aquarela restrita. Papel contemporâneo off-white #F2EFEB,
> tinta #1E1E1E e teals #256675, #4B8C99 e #7AB5BC. Assimetria forte, espaço
> negativo real para tipografia e sensação humana, curiosa e irreverente. Sem
> fotorrealismo, 3D, gradientes, neon, aparência de stock, texto dentro da
> imagem ou futurismo genérico.

Para cenas com o elenco, acrescentar:

> Preserve rigorosamente as identidades, rostos, cabelos, roupas, escala e
> quantidade dos seis personagens de referência. Cada pessoa aparece uma única
> vez. Mãos completas devem ter exatamente quatro dedos e um polegar, ligados a
> um único pulso; ocultar naturalmente uma mão é melhor do que inventar uma
> anatomia ambígua.

Para uma edição localizada, acrescentar:

> Trate a imagem fornecida como placa canônica. Mantenha câmera, enquadramento,
> fundo, elenco, linework, paleta e todos os pixels narrativamente relevantes.
> Altere somente o elemento delimitado. Isto é uma correção, não um redesign.

## 8. O que o brandbook final precisa resolver

1. Definir a essência do Clube em uma frase operacional.
2. Formalizar a relação hierárquica Clube ↔ Target Teal.
3. Decidir se o emblema do favicon é a marca principal, um selo ou apenas um
   ícone digital.
4. Criar regras do emblema: construção, redução, área de proteção, fundos e
   versões monocromáticas.
5. Decidir o status do elenco de seis/sete personagens.
6. Separar símbolos estruturais de decoração temática.
7. Definir proporções e áreas seguras para social, evento, capa, thumbnail e
   apresentação.
8. Criar uma biblioteca modular de prompts, não apenas prompts isolados.
9. Incluir exemplos aprovados, contraprovas e critérios de rejeição.
10. Documentar acessibilidade, texto alternativo, licenciamento, créditos e
    rastreabilidade das imagens geradas.
11. Criar um checklist rápido para tealers não designers.
12. Definir quem pode aprovar mudanças no sistema e como novas imagens entram
    no cânone.

## 9. Critério de sucesso

O sistema estará completo quando um tealer que não participou da criação da
landing conseguir produzir três peças diferentes — por exemplo, capa de
evento, post social e ilustração editorial — que sejam reconhecíveis como
Clube, sem copiar literalmente uma composição existente e sem se afastar da
identidade Target Teal.
