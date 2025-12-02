import Sequelize, { Model } from 'sequelize';

export default class Exame extends Model {
  static init(sequelize) {
    super.init(
      {
        paciente_nome: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        tipo: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        data: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM('pendente', 'em_andamento', 'concluido', 'cancelado'),
          defaultValue: 'pendente',
        },
        resultado: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        biomedico_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        biomedico_nome: {
          type: Sequelize.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'exames',
      }
    );

    return this;
  }
}
