// Identidade do vídeo. Troque tudo aqui ANTES de mexer na cena.
// Preencha a partir do manual de marca do cliente (design.md, brandbook,
// site). Veja examples/target-teal-planta-mapa/brand.js para um caso real.
//
// Papéis de cor (não são "cores bonitas", são funções):
//   paper   fundo; quase branco quente. Evite branco puro (#FFF) — parece tela.
//   ink     texto e traço; quase preto. Evite preto puro (#000).
//   accent  UMA cor viva da marca, usada com parcimônia (destaque, pessoa, CTA)
//   marker  cor clara da marca para a faixa de marca-texto atrás de palavras
//   mid     variação intermediária do accent (fluxos, linhas secundárias)
//   graphite traço de lápis (um cinza escuro levemente frio)

export const BRAND = {
  name: 'Exemplo',
  colors: {
    paper: '#F3EFE8',
    ink: '#1C1C1C',
    accent: '#B5462F',
    marker: '#F0C75E',
    mid: '#D07A5F',
    graphite: '#34373a',
  },
  // Display: condensada e em caixa alta para frases curtas (Anton, Bebas Neue,
  // Oswald...). Texto: legível para datas, legendas e anotações.
  fonts: {
    display: 'Anton',
    text: 'Roboto',
    files: [
      { family: 'Anton', url: 'node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2' },
      { family: 'Roboto', weight: 400, url: 'node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff2' },
      { family: 'Roboto', weight: 700, url: 'node_modules/@fontsource/roboto/files/roboto-latin-700-normal.woff2' },
    ],
  },
  // Margem de segurança: nada de texto a menos disso da borda (1920×1080).
  safe: 100,
};
