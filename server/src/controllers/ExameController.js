import Exame from '../models/Exame.js';

class ExameController {
  // Criar novo exame (biomédico registra)
  async store(req, res) {
    try {
      const { paciente, tipo, data } = req.body;

      if (!paciente || !tipo || !data) {
        return res.status(400).json({
          errors: ['Paciente, tipo e data são obrigatórios'],
        });
      }

      const exame = await Exame.create({
        paciente_nome: paciente,
        tipo,
        data,
        status: 'pendente',
      });

      return res.json(exame);
    } catch (err) {
      console.error('Erro ao criar exame:', err);
      return res.status(400).json({
        errors: ['Erro ao criar exame'],
      });
    }
  }

  // Listar todos os exames
  async index(req, res) {
    try {
      const exames = await Exame.findAll({
        order: [['created_at', 'DESC']],
      });
      return res.json(exames);
    } catch (err) {
      console.error('Erro ao listar exames:', err);
      return res.status(500).json({
        errors: ['Erro ao listar exames'],
      });
    }
  }

  // Atualizar exame (status, resultado, etc.)
  async update(req, res) {
    try {
      const exame = await Exame.findByPk(req.params.id);
      
      if (!exame) {
        return res.status(404).json({ 
          errors: ['Exame não encontrado'] 
        });
      }

      await exame.update(req.body);
      return res.json(exame);
    } catch (err) {
      console.error('Erro ao atualizar exame:', err);
      return res.status(400).json({
        errors: ['Erro ao atualizar exame'],
      });
    }
  }

  // Lançar resultado do exame
  async lancarResultado(req, res) {
    try {
      const exame = await Exame.findByPk(req.params.id);
      
      if (!exame) {
        return res.status(404).json({ 
          errors: ['Exame não encontrado'] 
        });
      }

      const { texto } = req.body;

      if (!texto) {
        return res.status(400).json({
          errors: ['Texto do resultado é obrigatório'],
        });
      }

      await exame.update({
        resultado: texto,
        status: 'concluido',
      });

      return res.json(exame);
    } catch (err) {
      console.error('Erro ao lançar resultado:', err);
      return res.status(400).json({
        errors: ['Erro ao lançar resultado'],
      });
    }
  }

  // Deletar exame
  async delete(req, res) {
    try {
      const exame = await Exame.findByPk(req.params.id);
      
      if (!exame) {
        return res.status(404).json({ 
          errors: ['Exame não encontrado'] 
        });
      }

      await exame.destroy();
      return res.json({ 
        message: 'Exame deletado com sucesso' 
      });
    } catch (err) {
      console.error('Erro ao deletar exame:', err);
      return res.status(400).json({
        errors: ['Erro ao deletar exame'],
      });
    }
  }
}

export default new ExameController();
