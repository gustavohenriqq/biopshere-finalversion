// app.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// esses 3 servem pra simular __dirname em ESModule
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 força carregar o .env que está exatamente na pasta "server"
dotenv.config({ path: path.join(__dirname, '.env') });

// DEBUG: só pra ver se está vindo mesmo
console.log('DEBUG TOKEN_SECRET (startup) =>', process.env.TOKEN_SECRET);

import './src/database/index.js';

import express from 'express';
import cors from 'cors';

import homeRoutes from './src/routes/homeRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import tokenRoutes from './src/routes/tokenRoutes.js';
import consultaRoutes from './src/routes/consultaRoutes.js';
import exameRoutes from './src/routes/exameRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';

// rotas reaproveitadas do backend antigo
import financeiroRoutes from './src/legacy/financeiroRoutes.js';
import adminRoutes from './src/legacy/adminRoutes.js';

class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(cors()); // libera requisições do front
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
  }

  routes() {
    // rotas originais
    this.app.use('/', homeRoutes);
    this.app.use('/users', userRoutes);
    this.app.use('/tokens', tokenRoutes);

    // 🔹 rotas de consultas (agendamentos)
    // aqui atendemos tanto /consultas quanto /api/consultas
    this.app.use('/consultas', consultaRoutes);
    this.app.use('/api/consultas', consultaRoutes);

    // 🔹 rotas de exames
    this.app.use('/api/exames', exameRoutes);

    // 🔹 rotas de dashboard
    this.app.use('/api/dashboard', dashboardRoutes);

    // rotas do backend antigo integradas
    this.app.use('/api/financeiro', financeiroRoutes);
    this.app.use('/api/admin', adminRoutes);
  }
}

export default new App().app;