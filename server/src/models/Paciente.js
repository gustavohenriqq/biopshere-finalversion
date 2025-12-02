// src/models/Paciente.js
import Sequelize, { Model } from 'sequelize';

export default class Paciente extends Model {
  static init(sequelize) {
    super.init(
      {
        nome_completo: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        cpf: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        idade: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        genero: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        endereco: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        numero: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'pacientes',
      },
    );

    return this;
  }
}
