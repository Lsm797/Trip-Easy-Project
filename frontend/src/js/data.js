import rioImg from '../assets/images/rio.jpg';
import londonImg from '../assets/images/london.jpg';
import noronhaImg from '../assets/images/noronha.jpg';
import gramadoImg from '../assets/images/gramado.jpg';
import mapImg from '../assets/images/mapa.jpg';
import avatarImg from '../assets/images/avatar.jpg';

export const LOGO_ICON_SRC = '/assets/logo.png';

export const ASSETS = {
  rioImg,
  londonImg,
  noronhaImg,
  gramadoImg,
  mapImg,
  avatarImg,
};

export function resolveDestinationImage(destinationName = '') {
  const lower = destinationName.toLowerCase();
  if (lower.includes('londres') || lower.includes('london')) return londonImg;
  if (lower.includes('noronha')) return noronhaImg;
  if (lower.includes('gramado')) return gramadoImg;
  if (/\brio\b/.test(lower)) return rioImg;
  // sem foto para este destino: a tela mostra o nome com um ícone de local
  return '';
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
            time: '09:00 AM',
            title: 'Cristo Redentor',
            description: 'Visita ao Corcovado para apreciar a vista panorâmica deslumbrante da cidade maravilhosa.',
            icon: 'compass',
          },
          {
            id: 'act2',
            time: '02:30 PM',
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
            time: '08:00 AM',
            title: 'Praia de Copacabana',
            description: 'Caminhada matinal no calçadão icônico de pedras portuguesas e mergulho relaxante no mar.',
            icon: 'sun',
          },
          {
            id: 'act4',
            time: '04:00 PM',
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
            time: '10:00 AM',
            title: 'British Museum Tour',
            description: 'Exploração cultural guiada para ver tesouros ancestrais do mundo inteiro.',
            icon: 'compass',
          },
          {
            id: 'act202',
            time: '03:00 PM',
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
            time: '12:00 PM',
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
  { name: 'Salvador', image: null, country: 'Brasil' },
  { name: 'Florianópolis', image: null, country: 'Brasil' },
  { name: 'Porto Seguro', image: null, country: 'Brasil' },
  { name: 'Foz do Iguaçu', image: null, country: 'Brasil' },
  { name: 'Bonito', image: null, country: 'Brasil' },
  { name: 'Paris', image: null, country: 'França' },
  { name: 'Lisboa', image: null, country: 'Portugal' },
  { name: 'Buenos Aires', image: null, country: 'Argentina' },
];
