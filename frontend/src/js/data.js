import rioImg from '../assets/images/rio.jpg';
import londonImg from '../assets/images/london.jpg';
import noronhaImg from '../assets/images/noronha.jpg';
import gramadoImg from '../assets/images/gramado.jpg';
import avatarImg from '../assets/images/avatar.jpg';

export const LOGO_ICON_SRC = '/assets/logo.png';

export const ASSETS = {
  rioImg,
  londonImg,
  noronhaImg,
  gramadoImg,
  avatarImg,
};

// Fotos extras dos destinos: basta colocar o arquivo em src/assets/images/destinos/
// (ex.: salvador.jpg, porto-seguro.jpg). Veja o LEIA-ME.txt dessa pasta.
let destinationFiles = {};
try {
  destinationFiles = import.meta.glob('../assets/images/destinos/*.{jpg,jpeg,png,webp}', {
    eager: true,
    import: 'default',
  });
} catch {
  destinationFiles = {};
}
const destinationImages = {};
for (const [filePath, url] of Object.entries(destinationFiles)) {
  const slug = filePath.split('/').pop().replace(/\.[^.]+$/, '');
  destinationImages[slug] = url;
}

export function slugify(text = '') {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function destinationFileImage(name) {
  const full = slugify(name);
  if (destinationImages[full]) return destinationImages[full];
  const first = slugify(String(name).split(',')[0]);
  if (destinationImages[first]) return destinationImages[first];
  const key = Object.keys(destinationImages).find((slug) => full === slug || full.startsWith(`${slug}-`) || full.endsWith(`-${slug}`));
  return key ? destinationImages[key] : '';
}

export function resolveDestinationImage(destinationName = '') {
  const lower = destinationName.toLowerCase();
  if (lower.includes('londres') || lower.includes('london')) return londonImg;
  if (lower.includes('noronha')) return noronhaImg;
  if (lower.includes('gramado')) return gramadoImg;
  if (/\brio\b/.test(lower)) return rioImg;
  // foto colocada na pasta destinos/; se não houver, a tela mostra um fundo neutro com o nome
  return destinationFileImage(destinationName);
}

export function sanitizeImageUrl(url, contextName = '') {
  if (!url) return resolveDestinationImage(contextName);
  const isExternalLegacy =
    url.includes('images.unsplash.com') ||
    url.includes('lh3.googleusercontent.com') ||
    url.includes('picsum.photos');
  if (isExternalLegacy) {
    return resolveDestinationImage(contextName || url);
  }
  return url;
}

export const INITIAL_TRIPS = [
  {
    id: 'rio-adventure',
    name: 'Aventura no Rio',
    destination: 'Rio, Brasil',
    startDate: '2026-07-12',
    endDate: '2026-07-20',
    countdownDays: 14,
    bannerImage: rioImg,
    budgetLimit: 3500,
    travelersAdults: 2,
    travelersChildren: 0,
    tripStyle: 'Solo',
    budgetLevel: 'Econômico',
    tasks: [
      { id: 't1', title: 'Conferir passaportes', completed: true },
      { id: 't2', title: 'Reservar transfer', completed: true },
      { id: 't3', title: 'Arrumar roupas de verão', completed: false },
      { id: 't4', title: 'Notificar o banco', completed: false },
      { id: 't5', title: 'Confirmar hotel', completed: true },
      { id: 't6', title: 'Fazer check-in do voo', completed: false },
    ],
    itinerary: [
      {
        dayNumber: 1,
        dateStr: '15 de Outubro, Terça',
        activities: [
          {
            id: 'act1',
            time: '09:00',
            title: 'Cristo Redentor',
            description: 'Visita ao Corcovado para apreciar a vista panorâmica deslumbrante da cidade maravilhosa.',
            icon: 'compass',
          },
          {
            id: 'act2',
            time: '14:30',
            title: 'Pão de Açúcar',
            description: 'Passeio de bondinho e pôr do sol espetacular sobre a Baía de Guanabara na Urca.',
            icon: 'activity',
          },
        ],
      },
      {
        dayNumber: 2,
        dateStr: '16 de Outubro, Quarta',
        activities: [
          {
            id: 'act3',
            time: '08:00',
            title: 'Praia de Copacabana',
            description: 'Caminhada matinal no calçadão icônico de pedras portuguesas e mergulho relaxante no mar.',
            icon: 'sun',
          },
          {
            id: 'act4',
            time: '16:00',
            title: 'Santa Teresa',
            description: 'Explorar as ladeiras cheias de história, bondinho, ateliês artísticos locais e o Parque das Ruínas.',
            icon: 'mapPin',
          },
        ],
      },
    ],
    expenses: [
      {
        id: 'exp1',
        description: 'Jantar Restaurante Aprazível',
        category: 'Alimentação',
        value: 210.5,
        dateStr: '14 de Julho, 2026',
      },
      {
        id: 'exp2',
        description: 'Tarifa Transfer / Táxi Executivo',
        category: 'Transporte',
        value: 120.0,
        dateStr: '14 de Julho, 2026',
      },
      {
        id: 'exp3',
        description: 'Hospedagem Copacabana Palace',
        category: 'Hospedagem',
        value: 750.0,
        dateStr: '13 de Julho, 2026',
      },
      {
        id: 'exp4',
        description: 'Ingressos Corcovado Trem',
        category: 'Atividades',
        value: 119.5,
        dateStr: '14 de Julho, 2026',
      },
    ],
  },
  {
    id: 'london-adventure',
    name: 'Aventura Londres',
    destination: 'Londres, Reino Unido',
    startDate: '2026-09-12',
    endDate: '2026-09-20',
    countdownDays: 78,
    bannerImage: londonImg,
    budgetLimit: 15000,
    travelersAdults: 2,
    travelersChildren: 0,
    tripStyle: 'Casal',
    budgetLevel: 'Luxo',
    tasks: [
      { id: 't201', title: 'Comprar cachecóis', completed: false },
      { id: 't202', title: 'Trocar moedas para GBP', completed: true },
      { id: 't203', title: 'Fazer reserva no The Shard', completed: false },
      { id: 't204', title: 'Emitir vistos aplicáveis', completed: true },
    ],
    itinerary: [
      {
        dayNumber: 1,
        dateStr: '12 de Setembro, Sexta',
        activities: [
          {
            id: 'act201',
            time: '10:00',
            title: 'British Museum Tour',
            description: 'Exploração cultural guiada para ver tesouros ancestrais do mundo inteiro.',
            icon: 'compass',
          },
          {
            id: 'act202',
            time: '15:00',
            title: 'Voo Panorâmico London Eye',
            description: 'Subir na icônica roda gigante de Londres às margens do Rio Tâmisa.',
            icon: 'activity',
          },
        ],
      },
      {
        dayNumber: 2,
        dateStr: '13 de Setembro, Sábado',
        activities: [
          {
            id: 'act203',
            time: '12:00',
            title: 'Almoço no Borough Market',
            description: 'Saborear tradicionais quitutes artesanais em uma autêntica feira londrina.',
            icon: 'receipt',
          },
        ],
      },
    ],
    expenses: [
      {
        id: 'ex201',
        description: 'Dishoom Shoreditch',
        category: 'Alimentação',
        value: 610.5,
        dateStr: '14 de Julho, 2026',
      },
      {
        id: 'ex202',
        description: 'Recarga Oyster Card',
        category: 'Transporte',
        value: 145.0,
        dateStr: '14 de Julho, 2026',
      },
      {
        id: 'ex203',
        description: 'The Hoxton Holborn',
        category: 'Hospedagem',
        value: 1520.0,
        dateStr: '13 de Julho, 2026',
      },
    ],
  },
];

export const POPULAR_DESTINATIONS = [
  { name: 'Rio de Janeiro', image: rioImg, country: 'Brasil' },
  { name: 'Fernando de Noronha', image: noronhaImg, country: 'Brasil' },
  { name: 'Gramado', image: gramadoImg, country: 'Brasil' },
  { name: 'Londres', image: londonImg, country: 'Reino Unido' },
  { name: 'Salvador', image: destinationFileImage('Salvador') || null, country: 'Brasil' },
  { name: 'Florianópolis', image: destinationFileImage('Florianópolis') || null, country: 'Brasil' },
  { name: 'Porto Seguro', image: destinationFileImage('Porto Seguro') || null, country: 'Brasil' },
  { name: 'Foz do Iguaçu', image: destinationFileImage('Foz do Iguaçu') || null, country: 'Brasil' },
  { name: 'Bonito', image: destinationFileImage('Bonito') || null, country: 'Brasil' },
  { name: 'Paris', image: destinationFileImage('Paris') || null, country: 'França' },
  { name: 'Lisboa', image: destinationFileImage('Lisboa') || null, country: 'Portugal' },
  { name: 'Buenos Aires', image: destinationFileImage('Buenos Aires') || null, country: 'Argentina' },
];

// Lista usada na busca de destino (autocomplete) do assistente de nova viagem.
export const CITY_SUGGESTIONS = [
  { name: 'Rio de Janeiro', country: 'Brasil' },
  { name: 'São Paulo', country: 'Brasil' },
  { name: 'Salvador', country: 'Brasil' },
  { name: 'Florianópolis', country: 'Brasil' },
  { name: 'Porto Seguro', country: 'Brasil' },
  { name: 'Foz do Iguaçu', country: 'Brasil' },
  { name: 'Bonito', country: 'Brasil' },
  { name: 'Fernando de Noronha', country: 'Brasil' },
  { name: 'Gramado', country: 'Brasil' },
  { name: 'Canela', country: 'Brasil' },
  { name: 'Curitiba', country: 'Brasil' },
  { name: 'Belo Horizonte', country: 'Brasil' },
  { name: 'Ouro Preto', country: 'Brasil' },
  { name: 'Brasília', country: 'Brasil' },
  { name: 'Fortaleza', country: 'Brasil' },
  { name: 'Recife', country: 'Brasil' },
  { name: 'Olinda', country: 'Brasil' },
  { name: 'Natal', country: 'Brasil' },
  { name: 'João Pessoa', country: 'Brasil' },
  { name: 'Maceió', country: 'Brasil' },
  { name: 'São Luís', country: 'Brasil' },
  { name: 'Lençóis Maranhenses', country: 'Brasil' },
  { name: 'Belém', country: 'Brasil' },
  { name: 'Manaus', country: 'Brasil' },
  { name: 'Porto Alegre', country: 'Brasil' },
  { name: 'Búzios', country: 'Brasil' },
  { name: 'Paraty', country: 'Brasil' },
  { name: 'Angra dos Reis', country: 'Brasil' },
  { name: 'Ilhabela', country: 'Brasil' },
  { name: 'Campos do Jordão', country: 'Brasil' },
  { name: 'Jericoacoara', country: 'Brasil' },
  { name: 'Porto de Galinhas', country: 'Brasil' },
  { name: 'Morro de São Paulo', country: 'Brasil' },
  { name: 'Arraial do Cabo', country: 'Brasil' },
  { name: 'Chapada Diamantina', country: 'Brasil' },
  { name: 'Chapada dos Veadeiros', country: 'Brasil' },
  { name: 'Balneário Camboriú', country: 'Brasil' },
  { name: 'Goiânia', country: 'Brasil' },
  { name: 'Cuiabá', country: 'Brasil' },
  { name: 'Vitória', country: 'Brasil' },
  { name: 'Aracaju', country: 'Brasil' },
  { name: 'Teresina', country: 'Brasil' },
  { name: 'Eunápolis', country: 'Brasil' },
  { name: 'Trancoso', country: 'Brasil' },
  { name: 'Caraíva', country: 'Brasil' },
  { name: 'Londres', country: 'Reino Unido' },
  { name: 'Paris', country: 'França' },
  { name: 'Lisboa', country: 'Portugal' },
  { name: 'Porto', country: 'Portugal' },
  { name: 'Madri', country: 'Espanha' },
  { name: 'Barcelona', country: 'Espanha' },
  { name: 'Roma', country: 'Itália' },
  { name: 'Veneza', country: 'Itália' },
  { name: 'Florença', country: 'Itália' },
  { name: 'Milão', country: 'Itália' },
  { name: 'Berlim', country: 'Alemanha' },
  { name: 'Amsterdã', country: 'Holanda' },
  { name: 'Atenas', country: 'Grécia' },
  { name: 'Santorini', country: 'Grécia' },
  { name: 'Istambul', country: 'Turquia' },
  { name: 'Dubai', country: 'Emirados Árabes' },
  { name: 'Nova York', country: 'Estados Unidos' },
  { name: 'Miami', country: 'Estados Unidos' },
  { name: 'Orlando', country: 'Estados Unidos' },
  { name: 'Los Angeles', country: 'Estados Unidos' },
  { name: 'Las Vegas', country: 'Estados Unidos' },
  { name: 'Cancún', country: 'México' },
  { name: 'Cidade do México', country: 'México' },
  { name: 'Buenos Aires', country: 'Argentina' },
  { name: 'Bariloche', country: 'Argentina' },
  { name: 'Ushuaia', country: 'Argentina' },
  { name: 'Santiago', country: 'Chile' },
  { name: 'Montevidéu', country: 'Uruguai' },
  { name: 'Punta del Este', country: 'Uruguai' },
  { name: 'Cusco', country: 'Peru' },
  { name: 'Lima', country: 'Peru' },
  { name: 'Bogotá', country: 'Colômbia' },
  { name: 'Cartagena', country: 'Colômbia' },
  { name: 'Tóquio', country: 'Japão' },
  { name: 'Kyoto', country: 'Japão' },
  { name: 'Seul', country: 'Coreia do Sul' },
  { name: 'Bangkok', country: 'Tailândia' },
  { name: 'Bali', country: 'Indonésia' },
  { name: 'Cairo', country: 'Egito' },
  { name: 'Cidade do Cabo', country: 'África do Sul' },
  { name: 'Sydney', country: 'Austrália' },
  { name: 'Toronto', country: 'Canadá' },
  { name: 'Punta Cana', country: 'República Dominicana' },
  { name: 'Havana', country: 'Cuba' },
];

export function searchCities(query, limit = 6) {
  const q = slugify(query).replace(/-/g, ' ');
  if (!q) return [];
  const norm = (c) => slugify(c.name).replace(/-/g, ' ');
  const starts = CITY_SUGGESTIONS.filter((c) => norm(c).startsWith(q));
  const words = CITY_SUGGESTIONS.filter((c) => !norm(c).startsWith(q) && norm(c).includes(q));
  return [...starts, ...words].slice(0, limit);
}


// Sugestões do botão "Sugerir Roteiro", por destino. Horários em 24h.
const SUGGESTED_ITINERARIES = {
  'rio-de-janeiro': [
    { time: '10:00', title: 'Passeio do Bondinho de Santa Teresa', location: 'Santa Teresa', description: 'Andar de bondinho amarelo histórico por cima dos arcos da Lapa.' },
    { time: '13:00', title: 'Almoço na Confeitaria Colombo', location: 'Centro', description: 'Saborear pratos e doces tradicionais em ambiente histórico.' },
    { time: '17:00', title: 'Pôr do sol no Arpoador', location: 'Ipanema', description: 'Apreciar o pôr do sol à beira-mar com vista para o Morro Dois Irmãos.' },
  ],
  'londres': [
    { time: '09:00', title: 'Torre de Londres e Big Ben', location: 'Londres', description: 'Visitar a histórica fortaleza e fotografar os monumentos às margens do Tâmisa.' },
    { time: '13:00', title: 'Chá da tarde clássico inglês', location: 'Centro de Londres', description: 'Provar doces e chás tradicionais em uma casa de chá.' },
    { time: '16:00', title: 'Caminhada por Covent Garden', location: 'Covent Garden', description: 'Ver apresentações de rua e lojas artesanais.' },
  ],
  'salvador': [
    { time: '09:00', title: 'Passeio pelo Pelourinho', location: 'Pelourinho', description: 'Caminhar pelo centro histórico, igrejas barrocas e casarões coloridos.' },
    { time: '13:00', title: 'Almoço com moqueca baiana', location: 'Salvador', description: 'Experimentar a culinária típica baiana.' },
    { time: '17:00', title: 'Pôr do sol no Farol da Barra', location: 'Farol da Barra', description: 'Assistir ao pôr do sol na Baía de Todos os Santos.' },
  ],
  'florianopolis': [
    { time: '09:00', title: 'Praia da Joaquina e dunas', location: 'Joaquina', description: 'Curtir a praia e as dunas, com opção de sandboard.' },
    { time: '13:00', title: 'Almoço com frutos do mar', location: 'Santo Antônio de Lisboa', description: 'Provar ostras e frutos do mar frescos à beira da baía.' },
    { time: '18:00', title: 'Ponte Hercílio Luz ao entardecer', location: 'Centro', description: 'Ver a ponte iluminada no fim do dia.' },
  ],
  'porto-seguro': [
    { time: '09:00', title: 'Passeio pela Cidade Histórica', location: 'Cidade Histórica', description: 'Conhecer a Igreja Nossa Senhora da Pena e o Marco do Descobrimento.' },
    { time: '13:00', title: 'Almoço em barraca de praia', location: 'Praia de Taperapuã', description: 'Almoçar com pés na areia e música ao vivo.' },
    { time: '16:00', title: 'Balsa para Arraial d\'Ajuda', location: 'Arraial d\'Ajuda', description: 'Atravessar o rio e passear pela vila ao fim da tarde.' },
  ],
  'foz-do-iguacu': [
    { time: '08:30', title: 'Cataratas do Iguaçu (lado brasileiro)', location: 'Parque Nacional do Iguaçu', description: 'Trilha com vista panorâmica das quedas d\'água.' },
    { time: '13:00', title: 'Almoço no centro de Foz', location: 'Foz do Iguaçu', description: 'Pausa para o almoço e descanso.' },
    { time: '16:30', title: 'Marco das Três Fronteiras', location: 'Marco das Três Fronteiras', description: 'Ver o encontro entre Brasil, Argentina e Paraguai no pôr do sol.' },
  ],
  'bonito': [
    { time: '08:30', title: 'Flutuação no Rio Sucuri', location: 'Rio Sucuri', description: 'Flutuar em águas cristalinas observando peixes.' },
    { time: '13:00', title: 'Almoço de comida regional', location: 'Bonito', description: 'Provar pratos típicos do Pantanal e do cerrado.' },
    { time: '15:30', title: 'Gruta do Lago Azul', location: 'Gruta do Lago Azul', description: 'Visitar a gruta com o grande lago de águas azuis.' },
  ],
  'paris': [
    { time: '09:30', title: 'Torre Eiffel', location: 'Champ de Mars', description: 'Subir na torre e aproveitar a vista da cidade.' },
    { time: '13:30', title: 'Museu do Louvre', location: 'Louvre', description: 'Visitar as obras mais famosas do museu.' },
    { time: '19:00', title: 'Passeio de barco pelo Rio Sena', location: 'Rio Sena', description: 'Ver os monumentos iluminados da água.' },
  ],
  'lisboa': [
    { time: '09:30', title: 'Torre de Belém e Mosteiro dos Jerónimos', location: 'Belém', description: 'Conhecer os principais monumentos manuelinos.' },
    { time: '13:00', title: 'Pastéis de Belém', location: 'Belém', description: 'Provar o pastel de nata na casa mais tradicional.' },
    { time: '17:00', title: 'Elétrico 28 e Alfama', location: 'Alfama', description: 'Passear pelos bairros antigos e ver o pôr do sol em um miradouro.' },
  ],
  'buenos-aires': [
    { time: '09:30', title: 'Plaza de Mayo e Casa Rosada', location: 'Plaza de Mayo', description: 'Conhecer o coração histórico e político da cidade.' },
    { time: '13:00', title: 'Almoço em uma parrilla', location: 'Buenos Aires', description: 'Experimentar o tradicional churrasco argentino.' },
    { time: '16:30', title: 'Cemitério da Recoleta e Obelisco', location: 'Recoleta', description: 'Passear pelo bairro e terminar no Obelisco.' },
  ],
  'fernando-de-noronha': [
    { time: '09:00', title: 'Baía do Sancho', location: 'Baía do Sancho', description: 'Trilha, praia e mergulho em uma das praias mais premiadas.' },
    { time: '13:00', title: 'Almoço na Vila dos Remédios', location: 'Vila dos Remédios', description: 'Almoçar frutos do mar na vila principal.' },
    { time: '17:30', title: 'Pôr do sol no Forte dos Remédios', location: 'Forte dos Remédios', description: 'Assistir ao pôr do sol com vista para a ilha.' },
  ],
  'gramado': [
    { time: '09:30', title: 'Lago Negro', location: 'Lago Negro', description: 'Passeio de pedalinho e caminhada pelo parque.' },
    { time: '14:00', title: 'Chocolates e Rua Coberta', location: 'Centro de Gramado', description: 'Visitar fábricas de chocolate e lojas do centro.' },
    { time: '19:30', title: 'Jantar de fondue', location: 'Gramado', description: 'Fondue de queijo ou chocolate, típico da serra gaúcha.' },
  ],
  'sao-paulo': [
    { time: '10:00', title: 'Avenida Paulista e MASP', location: 'Avenida Paulista', description: 'Visitar o museu e caminhar pela avenida.' },
    { time: '13:00', title: 'Mercado Municipal', location: 'Centro', description: 'Almoçar o famoso sanduíche de mortadela.' },
    { time: '16:00', title: 'Parque Ibirapuera', location: 'Ibirapuera', description: 'Passeio ao ar livre e visita aos pavilhões.' },
  ],
};

// Devolve 3 atividades sugeridas para o destino; sem lista própria, usa um roteiro genérico com o nome da cidade.
export function getSuggestedActivities(destination = '') {
  const full = slugify(destination);
  const first = slugify(String(destination).split(',')[0]);
  const key = Object.keys(SUGGESTED_ITINERARIES).find(
    (k) => k === first || k === full || full.startsWith(`${k}-`)
  );
  const stamp = Date.now();
  if (key) {
    return SUGGESTED_ITINERARIES[key].map((a, i) => ({ id: `ai-${i + 1}-${stamp}`, icon: 'compass', ...a }));
  }
  const city = String(destination).split(',')[0].trim() || 'a cidade';
  return [
    { time: '09:30', title: `Passeio pelo centro de ${city}`, location: city, description: 'Conhecer a região central, praças e pontos históricos.' },
    { time: '13:00', title: 'Almoço com culinária local', location: city, description: 'Experimentar um prato típico da região.' },
    { time: '17:00', title: `Pôr do sol em um mirante de ${city}`, location: city, description: 'Terminar o dia em um bom ponto de vista.' },
  ].map((a, i) => ({ id: `ai-${i + 1}-${stamp}`, icon: 'compass', ...a }));
}
