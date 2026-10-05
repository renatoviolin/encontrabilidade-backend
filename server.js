// Back da loja modelo — Express, limpo e didático.
// Roda local: npm install && npm start (PORT=3111)
// Fonte: ./data/products.json (cópia espelhada do front; o audit_store acusa divergência)
//   GET  /health
//   GET  /api/products?q=&category=&sort=menor|maior|avaliacao
//   GET  /api/products/:id
//   GET  /api/feed  (alias autoritativo)
//   POST /api/checkout  {id, qty} ou {items:{id:qty}}
//   POST /api/reset (restaura estoque do JSON, só para sala)

const express = require('express');
const cors = require('cors');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT || 3111);
const DATA_FILE = path.join(__dirname, 'data', 'products.json');

const loadData = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
let products = loadData();

// --- services (regras puras, fáceis de testar em sala) ---
function filterProducts({ q = '', category = '', sort = '' } = {}) {
  const termo = q.toLowerCase();
  let items = products.filter((p) => {
    if (category && p.category !== category) return false;
    if (termo && !(p.name + ' ' + p.short + ' ' + p.battery + ' ' + p.category).toLowerCase().includes(termo)) return false;
    return true;
  });
  if (sort === 'menor') items = [...items].sort((a, b) => a.price - b.price);
  if (sort === 'maior') items = [...items].sort((a, b) => b.price - a.price);
  if (sort === 'avaliacao') items = [...items].sort((a, b) => b.rating - a.rating);
  return items;
}

function checkout(items) {
  let total = 0;
  for (const [id, qty] of Object.entries(items)) {
    const p = products.find((x) => x.id === id);
    if (!p) return { error: 'NOT_FOUND', id, status: 404 };
    if (!Number.isInteger(qty) || qty <= 0) return { error: 'INVALID_QTY', id, status: 400 };
    if (qty > p.stock) {
      return { error: 'OUT_OF_STOCK', id, stock: p.stock, status: 409, alternatives: products.filter((x) => x.stock > 0).map((x) => x.id) };
    }
    total += p.price * qty;
  }
  for (const [id, qty] of Object.entries(items)) {
    products.find((x) => x.id === id).stock -= qty;
  }
  total = Math.round(total * 100) / 100;
  return { order_id: 'PED-' + Math.floor(Math.random() * 90000 + 10000), total, status: 'mock_confirmado' };
}

// --- app ---
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true, products: products.length }));

app.get(['/api/products', '/api/feed'], (req, res) => res.json(filterProducts(req.query)));

app.get('/api/products/:id', (req, res) => {
  const p = products.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'NOT_FOUND', id: req.params.id });
  return res.json(p);
});

app.post('/api/checkout', (req, res) => {
  const items = req.body.items || (req.body.id ? { [req.body.id]: req.body.qty ?? 1 } : {});
  if (!Object.keys(items).length) return res.status(400).json({ error: 'EMPTY_CART' });
  const out = checkout(items);
  if (out.error) return res.status(out.status).json(out);
  return res.json(out);
});

app.post('/api/reset', (_req, res) => {
  products = loadData();
  return res.json({ ok: true, products: products.length });
});

// 404 das rotas da API (não confundir com 404 do front estático)
app.use('/api', (_req, res) => res.status(404).json({ error: 'NOT_FOUND', hint: 'GET /api/products, POST /api/checkout' }));

if (require.main === module) {
  app.listen(PORT, () => console.log(`back (express) ok :${PORT} (${products.length} produtos)`));
}

module.exports = { app, filterProducts, checkout };
