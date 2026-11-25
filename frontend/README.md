# TripEasy — Frontend

Aplicativo web de planejamento de viagens feito com HTML, CSS e JavaScript puro (Vite como servidor de desenvolvimento).

## Telas

- **Página inicial** com login e cadastro
- **Dashboard** da viagem
- **Itinerário** (roteiro por dia, com mapa real OpenStreetMap)
- **Checklist** (itens por categoria, progresso, busca e filtros)
- **Despesas**
- **Criar viagem**
- **Configurações**

Os dados (viagens, itinerário, checklist e despesas) ficam no **backend Spring Boot + MySQL**. O login e o cadastro também usam o backend (sessão por cookie).

> As configurações da plataforma (destinos em destaque e orçamentos padrão) ainda são locais, guardadas no navegador.

## Como rodar

Pré-requisitos: [Node.js](https://nodejs.org) 18 ou superior e o **backend rodando** em `http://localhost:8080` (veja o README da raiz do repositório).

```bash
npm install
npm run dev
```

O app abre em `http://localhost:5173`. O Vite encaminha as chamadas `/api` para o backend (`vite.config.js`), então não é preciso configurar CORS.

Regras que vêm do backend: a data de ida e a de volta de uma viagem não podem estar no passado.

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Visualiza o build localmente |

## Estrutura

```
index.html
public/assets/logo.png
src/
├── styles.css
├── assets/images/     # imagens das viagens e da página inicial
└── js/
    ├── main.js        # início do app e navegação
    ├── api.js         # chamadas ao backend (fetch)
    ├── sync.js        # converte dados entre frontend e API e envia as mudanças
    ├── dates.js       # datas, horários e validação do período da viagem
    ├── map.js         # mapa real (Leaflet + OpenStreetMap) e busca de coordenadas (Nominatim)
    ├── password.js    # regra de senha forte
    ├── store.js       # sessão e configurações locais (localStorage)
    ├── data.js        # dados de exemplo e imagens
    ├── utils.js, icons.js
    └── views/         # landing, dashboard, itinerario, checklist, despesas,
                       # creator, configuracoes
```
