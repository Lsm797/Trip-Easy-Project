# TripEasy — Frontend (Pessoa 5)

Telas de planejamento de viagem do TripEasy, feitas com HTML, CSS e JavaScript puro (Vite como servidor de desenvolvimento).

## Telas

- **Dashboard**: resumo da viagem, contagem regressiva, saldo planejado editável, indicadores e prévias
- **Roteiro**: atividades organizadas por dia, com horário, categoria e filtro por dia
- **Checklist**: itens por categoria, progresso, busca e marcar/desmarcar todos
- **Despesas**: gastos por categoria, resumo do orçamento (com edição do saldo planejado) e filtros

Os dados ficam salvos no navegador (`localStorage`); ainda não há integração com o backend.

## Como rodar

Pré-requisito: [Node.js](https://nodejs.org) 18 ou superior.

```bash
npm install
npm run dev
```

O app abre em `http://localhost:5173`.

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Visualiza o build localmente |

## Estrutura

```
index.html          # estrutura das 4 telas
public/assets/      # logotipo
src/
├── app.js          # lógica, estado e renderização
├── data.js         # viagens de exemplo
├── styles.css      # estilos
└── assets/images/  # banners das viagens
```
