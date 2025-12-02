// src/database/index.js
import { Sequelize } from 'sequelize';
import databaseConfig from '../config/database.js';

import User from '../models/User.js';
import Consulta from '../models/Consulta.js';
import Exame from '../models/Exame.js';

// ✅ TODOS os models DEVEM estar neste array
const models = [User, Consulta, Exame];

class Database {
  constructor() {
    this.init();
  }

  async init() {
    try {
      this.connection = new Sequelize(databaseConfig);

      // inicializa todos os models
      models.forEach((model) => model.init(this.connection));

      // associações (se existirem no futuro)
      models.forEach((model) => {
        if (typeof model.associate === 'function') {
          model.associate(this.connection.models);
        }
      });

      // testa conexão
      await this.connection.authenticate();
      console.log('✅ Conexão com o banco estabelecida.');

      // sincroniza tabelas (usa alter enquanto estiver em desenvolvimento)
      await this.connection.sync({ alter: true });
      console.log('✅ Tabelas sincronizadas com o banco de dados.');
    } catch (err) {
      console.error('❌ Erro ao conectar/sincronizar o banco:', err);
    }
  }
}

export default new Database();
