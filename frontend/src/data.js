import rioBanner from './assets/images/rio.jpg';
import londonBanner from './assets/images/london.jpg';

export const INITIAL_TRIPS = [
  {
    id: 'rio-adventure',
    name: 'Aventura no Rio',
    destination: 'Rio de Janeiro, Brasil',
    startDate: '12/07/2026',
    endDate: '20/07/2026',
    countdownDays: 14,
    bannerImage: rioBanner,
    budgetLimit: 3500,
    travelersAdults: 2,
    tripStyle: 'Casal',
    budgetLevel: 'Moderado',
    tasks: [
      { id: 't1', title: 'Conferir documentos de identificação', completed: true, category: 'Documentos' },
      { id: 't2', title: 'Confirmar reserva do hotel em Copacabana', completed: true, category: 'Reservas' },
      { id: 't3', title: 'Separar roupas leves e protetor solar', completed: false, category: 'Bagagem' },
      { id: 't4', title: 'Comprar ingressos antecipados do Cristo Redentor', completed: false, category: 'Reservas' },
      { id: 't5', title: 'Montar kit básico de farmácia', completed: true, category: 'Saúde' },
      { id: 't6', title: 'Fazer check-in online do voo', completed: false, category: 'Documentos' }
    ],
    itinerary: [
      {
        dayNumber: 1,
        dateStr: '12 de Julho, Domingo',
        activities: [
          {
            id: 'act1',
            time: '09:00',
            title: 'Cristo Redentor via Trem do Corcovado',
            description: 'Subida matinal para evitar filas e aproveitar a vista panorâmica da cidade.',
            category: 'Passeio'
          },
          {
            id: 'act2',
            time: '13:00',
            title: 'Almoço em Santa Teresa',
            description: 'Refeição típica no Restaurante Aprazível com vista para a Baía de Guanabara.',
            category: 'Gastronomia'
          },
          {
            id: 'act3',
            time: '16:30',
            title: 'Bondinho do Pão de Açúcar',
            description: 'Subida no fim da tarde para acompanhar o pôr do sol na Urca.',
            category: 'Passeio'
          }
        ]
      },
      {
        dayNumber: 2,
        dateStr: '13 de Julho, Segunda-feira',
        activities: [
          {
            id: 'act4',
            time: '08:30',
            title: 'Caminhada na Praia de Copacabana',
            description: 'Passeio pelo calçadão até o Forte de Copacabana para café da manhã.',
            category: 'Lazer'
          },
          {
            id: 'act5',
            time: '14:30',
            title: 'Jardim Botânico do Rio de Janeiro',
            description: 'Visita guiada às palmeiras imperiais e ao orquidário.',
            category: 'Passeio'
          }
        ]
      },
      {
        dayNumber: 3,
        dateStr: '14 de Julho, Terça-feira',
        activities: [
          {
            id: 'act6',
            time: '10:00',
            title: 'Museu do Amanhã & Boulevard Olímpico',
            description: 'Exploração da zona portuária revitalizada e visita à exposição principal.',
            category: 'Passeio'
          }
        ]
      }
    ],
    expenses: [
      {
        id: 'exp1',
        description: 'Hospedagem Copacabana (diária inicial)',
        category: 'Hospedagem',
        value: 750.0,
        dateStr: '12/07/2026'
      },
      {
        id: 'exp2',
        description: 'Almoço Restaurante Aprazível',
        category: 'Alimentação',
        value: 210.5,
        dateStr: '12/07/2026'
      },
      {
        id: 'exp3',
        description: 'Transfer Aeroporto Galeão para Hotel',
        category: 'Transporte',
        value: 120.0,
        dateStr: '12/07/2026'
      },
      {
        id: 'exp4',
        description: 'Ingressos Trem do Corcovado',
        category: 'Atividades',
        value: 185.0,
        dateStr: '12/07/2026'
      }
    ]
  },
  {
    id: 'london-adventure',
    name: 'Roteiro em Londres',
    destination: 'Londres, Reino Unido',
    startDate: '12/09/2026',
    endDate: '20/09/2026',
    countdownDays: 78,
    bannerImage: londonBanner,
    budgetLimit: 15000,
    travelersAdults: 2,
    tripStyle: 'Casal',
    budgetLevel: 'Luxo',
    tasks: [
      { id: 't201', title: 'Verificar validade do passaporte', completed: true, category: 'Documentos' },
      { id: 't202', title: 'Separar casacos impermeáveis', completed: false, category: 'Bagagem' },
      { id: 't203', title: 'Reservar entrada no The Shard', completed: false, category: 'Reservas' },
      { id: 't204', title: 'Contratar seguro viagem internacional', completed: true, category: 'Saúde' }
    ],
    itinerary: [
      {
        dayNumber: 1,
        dateStr: '12 de Setembro, Sábado',
        activities: [
          {
            id: 'act201',
            time: '10:00',
            title: 'British Museum',
            description: 'Visita às galerias históricas principais e à Pedra de Roseta.',
            category: 'Passeio'
          },
          {
            id: 'act202',
            time: '15:00',
            title: 'London Eye & Margem do Tâmisa',
            description: 'Caminhada pela South Bank com vista panorâmica do Parlamento.',
            category: 'Passeio'
          }
        ]
      },
      {
        dayNumber: 2,
        dateStr: '13 de Setembro, Domingo',
        activities: [
          {
            id: 'act203',
            time: '12:00',
            title: 'Almoço no Borough Market',
            description: 'Degustação de gastronomia artesanal local no mercado histórico.',
            category: 'Gastronomia'
          }
        ]
      }
    ],
    expenses: [
      {
        id: 'ex201',
        description: 'Hotel The Hoxton Holborn',
        category: 'Hospedagem',
        value: 1520.0,
        dateStr: '12/09/2026'
      },
      {
        id: 'ex202',
        description: 'Jantar Dishoom Shoreditch',
        category: 'Alimentação',
        value: 410.5,
        dateStr: '12/09/2026'
      },
      {
        id: 'ex203',
        description: 'Recarga Oyster Card (Metrô)',
        category: 'Transporte',
        value: 145.0,
        dateStr: '12/09/2026'
      }
    ]
  }
];
