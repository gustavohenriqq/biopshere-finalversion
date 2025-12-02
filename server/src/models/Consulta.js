import Sequelize, { Model } from 'sequelize';

export default class Consulta extends Model {
  static init(sequelize) {
    super.init(
      {
        data: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        hora: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM(
            'pendente',
            'aceita',
            'recusada',
            'cancelada',
            'concluida'
          ),
          defaultValue: 'pendente',
        },
        paciente_nome: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        paciente_email: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        profissional_nome: {
          type: Sequelize.STRING,
        },
        profissional_id: {
          type: Sequelize.INTEGER,
        },
        laudoEmitido: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        exame: {
          type: Sequelize.STRING,
          allowNull: true,
},

      },
      {
        sequelize,
        tableName: 'consultas',
      }
    );

    return this;
  }
}
