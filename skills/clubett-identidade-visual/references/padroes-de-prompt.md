# Padrões de prompt recuperados da produção da landing

Estes exemplos foram preservados porque mostram três modos diferentes de
trabalhar com Image Gen. Eles não são uma receita universal e não dispensam a
imagem de referência indicada.

## 1. Composição editorial nova a partir de uma referência

Referência: `assets/narrative/storm-paper.webp` representa o resultado e a
linguagem final. O prompt de produção partiu de uma cena anterior de temporal.

> Use case: illustration-story / composition edit. Edit target: the supplied
> sea/storm/kraken illustration for the Clube dos Agentes de Mudança. Create a
> newly COMPOSED wide desktop background, 16:9, ideally 2048x1152. This is one
> full-bleed illustrated page, not a mockup on a table. No text anywhere; HTML
> text will be placed afterward.
>
> Preserve the expressive hand-inked charcoal outlines, petrol teal ink, the
> SAME style of sea waves, rain clouds and kraken tentacle. NO ship, boat, sail,
> mast, human, face or character.
>
> New composition: the storm is now on the LEFT. A massive sculpted wave and
> ONE recognizable curling tentacle rise from the bottom-left through the
> left-center. Storm clouds flow diagonally across upper-left, black hatching
> and oblique rain connect clouds to sea. Waves sweep across the entire lower
> third, with a strong deep petrol-teal ink mass #256675 owning the bottom and
> left, and lighter teal ink #4B8C99 and #7AB5BC delineating water.
>
> Reserve a calm warm off-white paper region on the RIGHT, where a large
> four-line headline will be typeset later. This area must be truly quiet and
> light with no lines behind text. It should be organically part of the same
> page, bounded by the sweeping wave below and weather to the left, NOT a
> rectangle or card.
>
> Material: contemporary cotton drawing paper #F2EFEB, very fine subtle fibers
> across the whole composition, not aged brown parchment. Consistent rough ink
> with deliberate crosshatching and dry-brush edges. Tiny physically natural
> paper variation, no vignette, no generic gradient, no coffee stains, no
> decorative dots, no gratuitous distress.
>
> Art direction: authored editorial print illustration, bold asymmetrical
> tension, ink invading a navigation notebook page. Use only off-white,
> charcoal and these teal shades. No captions, lettering, frames, inset
> picture, UI, logos, compass or new symbols.

O que esse exemplo ensina:

- começar pela função da imagem e pelo modo de edição;
- localizar massa visual e espaço de texto com precisão;
- diferenciar vazio orgânico de um retângulo artificial;
- descrever material e processo, não somente estilo;
- listar sujeitos e acabamentos proibidos.

## 2. Restauração de objeto mestre

Resultado: `assets/narrative/map-master.webp`.

> Use case: precise-object-edit / high-resolution restoration. Edit target: the
> supplied close crop of a hand-drawn map, currently held by two grey hands.
> Create the single MASTER ART for this exact same sheet, to be used at all
> scales in an animation. One landscape image, aspect ratio about 1.576, at
> high resolution.
>
> Preserve this map's exact visual structure and relative positions. A teal
> dashed route crosses through a black outlined circle before rising toward a
> teal X. The route MUST remain visible inside the circle. No new symbols. Keep
> every route bend, every landmark and the relative spacing faithful to the
> supplied image. This is restoration, not a redesigned treasure map.
>
> Keep the same irregular folded-paper silhouette registered to the image
> edges and keep the thin broken charcoal crease strokes in their existing
> positions, with delicate crease shadows. Matte warm ivory paper, subtle
> visible fiber texture. Crisp, organic black and muted petrol-teal ink,
> matching the reference. Preserve the original small imperfection of the ink;
> no blurry upscale, no heavy artificial grain.
>
> Remove both hands and all people, clothes, rail and background completely.
> Reconstruct the tiny paper areas previously hidden by the fingers. Outside
> the sheet use a plain near-white background, not a scene. The paper occupies
> exactly the same crop coordinates: DO NOT recenter, add padding, zoom,
> straighten into a rectangle or change the map's perspective. No text,
> compass, question mark, added paths, extra X or additional circles. Output
> only this restored map as one standalone master illustration.

O que esse exemplo ensina:

- declarar que existe uma única arte mestre;
- preservar coordenadas, silhueta, defeitos bons e relações espaciais;
- remover somente o contexto indesejado;
- proibir explicitamente o impulso do modelo de “melhorar” ou redesenhar.

## 3. Edição localizada com preservação de identidade

Referência visual: `assets/narrative/ship-release.webp`. A placa anterior era a
hero com a mesma câmera, navio e tripulação.

> Use case: precise-object-edit / identity-preserve. Edit the provided canonical
> illustration to create a single release-pose background plate, NOT a
> storyboard.
>
> Keep the full wide composition, all six crew, boat, waves, sail, flag,
> graphite line quality, grey and teal colors, faces, head positions, clothes
> and every background detail unchanged.
>
> Change ONLY the small paper map held by the central bearded man wearing a
> teal bandana and dark charcoal jacket. The map has just blown away. Remove
> that map entirely, revealing the man's existing white shirt and charcoal
> jacket behind it. His own two hands are now empty and have just relaxed their
> grip: keep them at approximately their original positions, attached naturally
> to their original arms and sleeves, only slightly lower and open with fingers
> curved, palms angled inward. Both wrists must clearly connect to his jacket
> sleeves. Restrained surprised gesture, not hands raised beside his head, not
> waving, no extra fingers, no detached hands. Do not change his head or
> expression, or enlarge him.
>
> Do not change the other man holding his organizational diagram: that second
> rectangular diagram stays in his hands. Do not draw a new flying map
> anywhere, no loose paper, no added wind streaks, no text, no new props. The
> flying sheet will be composited separately. The output is the same original
> wide illustration with only the central held map gone and its owner's two
> hands in a natural just-released pose.

O que esse exemplo ensina:

- chamar a referência de placa canônica;
- repetir o que deve permanecer travado;
- identificar a pessoa por aparência e posição, não por nome inventado;
- especificar conexões anatômicas e o que ocorre com objetos semelhantes;
- explicar quais elementos serão compostados em outra camada.

## 4. Geração de nova cena com o mesmo elenco

O prompt completo está incorporado separadamente como
`reference/prompt-example-belonging.md`. Use
`assets/narrative/travessia-hero.webp` como referência de entrada para as seis
identidades; `assets/narrative/pertencimento.webp` é o resultado aprovado.

Esse exemplo é o mais importante para novas imagens do Clube porque combina:

- continuidade dos seis personagens;
- descrição individual do elenco;
- ação relacional, sem pose frontal;
- poucos objetos com função narrativa;
- composição horizontal e área de respiro;
- regras anatômicas explícitas;
- paleta e material bloqueados;
- proibições contra sala genérica, decoração, texto, 3D e fotorrealismo.
