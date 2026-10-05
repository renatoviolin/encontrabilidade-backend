# Encontrabilidade — back

API Express da loja modelo **fatec·shop** (disciplina Projetos de Encontrabilidade, Fatec/SI).
Fonte de dados: `./data/products.json` (20 produtos; espelha `frontend/data/products.json`
do repo [`encontrabilidade`](https://github.com/renatoviolin/encontrabilidade)).

## Rodar local

```bash
npm install
npm start   # :3111 — back ok (20 produtos)
```

## Endpoints

| Método | Rota | Resposta |
|---|---|---|
| `GET` | `/health` | `{ok, products}` |
| `GET` | `/api/products?q=&category=&sort=` | lista (`sort`: `menor`\|`maior`\|`avaliacao`) |
| `GET` | `/api/products/:id` | detalhe ou `NOT_FOUND` 404 |
| `GET` | `/api/feed` | catálogo completo (autoritativo p/ agentes) |
| `POST` | `/api/checkout` `{id, qty}` ou `{items}` | `{order_id, total}` ou `OUT_OF_STOCK` 409 |
| `POST` | `/api/reset` | restaura o estoque do JSON (sala) |

## Deploy (Render, free, sem cartão)

Render Dashboard → New → Blueprint → este repo (`render.yaml`) —
ou Web Service com Build `npm install`, Start `npm start`.
Dorme após 15 min idle (~60s para acordar): aqueça com `GET /health` antes da demo.
