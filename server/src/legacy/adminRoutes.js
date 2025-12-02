// src/legacy/adminRoutes.js
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = new Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = path.join(__dirname, 'data', 'users.json');

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

// GET /api/admin/users
router.get('/users', (req, res) => {
  res.json(read());
});

// POST /api/admin/users/add
router.post('/users/add', (req, res) => {
  const { name, email, role } = req.body;

  const arr = read();
  const user = {
    id: Date.now(),
    name,
    email,
    role,
  };

  arr.unshift(user);
  write(arr);

  res.json({ message: 'user added', user });
});

export default router;
