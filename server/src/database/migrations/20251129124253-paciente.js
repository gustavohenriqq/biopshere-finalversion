/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('users', {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    nome_completo: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    cpf: {
      type: Sequelize.STRING,
      unique: true,
    },

    email: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },

    telefone: {
      type: Sequelize.STRING,
    },

    idade: {
      type: Sequelize.STRING,
    },

    genero: {
      type: Sequelize.STRING,
    },

    endereco: {
      type: Sequelize.STRING,
    },

    numero: {
      type: Sequelize.STRING,
    },

    role: {
      type: Sequelize.ENUM('paciente', 'medico', 'biomedico', 'admin'),
      defaultValue: 'paciente',
    },

    status: {
      type: Sequelize.ENUM('pendente', 'aprovado', 'rejeitado'),
      defaultValue: 'aprovado',
    },

    password_hash: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },

    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('users');
}
