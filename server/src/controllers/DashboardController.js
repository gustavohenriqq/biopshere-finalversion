import User from '../models/User.js';
import Consulta from '../models/Consulta.js';
import Exame from '../models/Exame.js';
import Sequelize from 'sequelize';
const { Op } = Sequelize;

class DashboardController {
  async index(req, res) {
    try {
      // 1. Pacientes cadastrados (todos os usuários com role 'paciente')
      const pacientesCadastrados = await User.count({
        where: { role: 'paciente' },
      });

      // 2. Exames em andamento (status 'pendente' ou 'em_andamento')
      const examesAndamento = await Exame.count({
        where: {
          status: {
            [Op.in]: ['pendente', 'em_andamento'],
          },
        },
      });

      // 3. Laudos prontos (status 'concluido')
      const laudosProntos = await Exame.count({
        where: { status: 'concluido' },
      });

      // 4. Exames pendentes (status 'pendente')
      const examesPendentes = await Exame.count({
        where: { status: 'pendente' },
      });

      // 5. Exames recentes (os 10 últimos)
      const examesRecentes = await Exame.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'data', 'paciente_nome', 'tipo', 'status'],
      });

      // Formata para o frontend
      const formatados = examesRecentes.map((ex) => ({
        id: ex.id,
        data: ex.data,
        paciente: ex.paciente_nome,
        exame: ex.tipo,
        status: this.formatStatus(ex.status),
      }));

      return res.json({
        pacientesCadastrados,
        examesAndamento,
        laudosProntos,
        examesPendentes,
        examesRecentes: formatados,
      });
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      return res.status(500).json({
        errors: ['Erro interno ao buscar dados do dashboard'],
      });
    }
  }

  formatStatus(status) {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'em_andamento':
        return 'Em andamento';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  }
}

export default new DashboardController();
