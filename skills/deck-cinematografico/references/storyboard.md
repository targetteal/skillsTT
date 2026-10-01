# Fase 4 · Storyboard em rascunho

Depois da direção visual e antes do motor. Mudar um rascunho custa minutos; mudar um plano construído custa horas.

## O que fazer
- Escreva `storyboard.js`: **um quadro por beat** (o estado da parada), chave `"<plano>.<beat>"`, usando o kit `K` (texto, titulo, rabisco, caixa, linha, caminho, seta, circulo, pontos, pessoa, camera, nota, cabecalho). viewBox 480×270 = tela ÷ 4.
- Traço de **rascunho**: o objetivo é composição, ordem, texto na posição real e movimento. Não é arte.
- Anote o movimento: `K.camera()` (moldura azul tracejada com o que a câmera faz), `K.seta()` para trajetos, `K.nota()` para o que o desenho não mostra.
- A `transicao` de cada beat aparece em laranja sobre o quadro: confira que **cada passagem é uma transformação de objeto**.
- Abra `storyboard.html`, olhe cada quadro, rode o **Animatic** para sentir o ritmo (usa `dur` + respiro do roteiro).

## Checagens antes de mostrar
- Texto cortado ou encostado na borda? Tela vazia demais? Protagonista pequeno?
- O objeto protagonista aparece e muda de estado ao longo dos quadros?
- Alguma passagem é troca de página? Reescreva a transição.

## Portão
Mostre o link e uma linha por quadro. O usuário aprova/ajusta/corta e cola o resultado. Diga que a arte final segue a direção aprovada.
