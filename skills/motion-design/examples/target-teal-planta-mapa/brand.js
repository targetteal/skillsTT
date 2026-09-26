// Identidade Target Teal / Clube dos Agentes de Mudança, no formato do template.
// Fonte: docs/brand/design.md do repositório do Clube.
export const BRAND = {
  name: 'Clube dos Agentes de Mudança (Target Teal)',
  colors: {
    paper: '#F2EFEB',    // offwhite
    ink: '#1E1E1E',      // tinta, nunca preto puro
    accent: '#256675',   // teal escuro: a pessoa, destaques, URL
    marker: '#7AB5BC',   // teal claro: marca-texto atrás do Anton
    mid: '#4B8C99',      // teal médio: fluxos
    graphite: '#34373a',
  },
  fonts: {
    display: 'Anton',    // títulos, caixa alta
    text: 'Roboto',      // leitura, rótulos
    files: [
      { family: 'Anton', url: 'node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2' },
      { family: 'Roboto', weight: 400, url: 'node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff2' },
      { family: 'Roboto', weight: 700, url: 'node_modules/@fontsource/roboto/files/roboto-latin-700-normal.woff2' },
    ],
  },
  safe: 100,
  // Regras da marca que afetam motion: sem gradientes, sem brilho, sem 3D;
  // cores de produto (rosa, laranja...) só para categorias, nunca em arco-íris;
  // não redesenhar nem distorcer o logo; marcador teal claro só com Anton.
};
