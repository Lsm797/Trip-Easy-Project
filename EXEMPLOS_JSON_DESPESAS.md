# API de Despesas e Dashboard (TripEasy)

Para a Pessoa 5 (frontend). Base: `http://localhost:8080`

**Todas as rotas exigem usuário logado (sessão).** Faça o login em `/api/usuarios/login` antes e, no `fetch()`, use `credentials: "include"`. Sem login a API responde 403. Só é possível acessar despesas de viagens do próprio usuário.

Categorias válidas: `ALIMENTACAO`, `TRANSPORTE`, `HOSPEDAGEM`, `PASSEIOS`, `OUTROS`

---

## 1. Cadastrar despesa
`POST /api/viagens/{viagemId}/despesas`

Enviar:
```json
{
  "descricao": "Jantar no restaurante",
  "valor": 85.50,
  "data": "2026-12-10",
  "categoria": "ALIMENTACAO"
}
```

Resposta `201 Created`:
```json
{
  "id": 1,
  "viagemId": 3,
  "descricao": "Jantar no restaurante",
  "valor": 85.50,
  "data": "2026-12-10",
  "categoria": "ALIMENTACAO"
}
```

## 2. Listar despesas da viagem
`GET /api/viagens/{viagemId}/despesas` (mais recentes primeiro)

Resposta `200 OK`: lista de objetos no mesmo formato acima.

## 3. Buscar uma despesa
`GET /api/despesas/{id}`

## 4. Editar despesa
`PUT /api/despesas/{id}` (mesmo corpo do cadastro). Resposta `200 OK` com a despesa atualizada.

## 5. Excluir despesa
`DELETE /api/despesas/{id}`. Resposta `204 No Content` (sem corpo).

## 6. Resumo (Dashboard)
`GET /api/viagens/{viagemId}/despesas/resumo`

Resposta `200 OK`:
```json
{
  "orcamento": 2000.00,
  "totalGasto": 205.50,
  "saldoRestante": 1794.50,
  "orcamentoUltrapassado": false,
  "totalPorCategoria": {
    "ALIMENTACAO": 85.50,
    "TRANSPORTE": 120.00,
    "HOSPEDAGEM": 0,
    "PASSEIOS": 0,
    "OUTROS": 0
  }
}
```

Quando `orcamentoUltrapassado` for `true`, `saldoRestante` fica negativo. Mostrar alerta na tela.

---

## Erros (texto puro, não JSON)

Os erros voltam como **texto simples** com a mensagem. Use `await resposta.text()` (não `.json()`).

- `400`: dados inválidos. Ex.: "O valor deve ser maior que zero." / "A descrição da despesa é obrigatória." / mensagem de data ou categoria inválida.
- `404`: "Despesa não encontrada!" ou "Viagem não encontrada!" (também quando a viagem é de outro usuário).
- `403`: usuário não logado.
