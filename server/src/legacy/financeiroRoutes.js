// src/legacy/financeiroRoutes.js
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = new Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = path.join(__dirname, 'data', 'financeiro.json');

function read() {
  try {
    return JSON.parse(fs.readFileSync(dbFile));
  } catch (e) {
    return [];
  }
}

function write(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

// GET /api/financeiro
router.get('/', (req, res) => {
  res.json(read());
});

// POST /api/financeiro/add
router.post('/add', (req, res) => {
  const { descricao, tipo, valor, data } = req.body;

  const arr = read();
  const item = {
    id: Date.now(),
    descricao,
    tipo,
    valor: Number(valor),
    data: data || new Date().toISOString(),
  };

  arr.unshift(item);
  write(arr);

  res.json({ message: 'ok', item });
});

// DELETE /api/financeiro/:id
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  let arr = read();
  arr = arr.filter((x) => x.id !== id);
  write(arr);
  res.json({ message: 'removed' });
});

export default router;
