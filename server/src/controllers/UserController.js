// src/controllers/UserController.js
import User from '../models/User.js';

class UserController {
  // CREATE
  // CREATE
async create(req, res) {
  try {
    console.log('CHEGOU NO CREATE >>>', req.body); // pra ver o que está chegando
    const novoUser = await User.create(req.body);
    return res.json(novoUser);
  } catch (e) {
    console.error('ERRO AO CRIAR USUÁRIO >>>', e);

    if (e.errors && Array.isArray(e.errors)) {
      // Erros de validação do Sequelize (nome, email, senha, etc.)
      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }

    // Erros de banco (NOT NULL, etc.)
    return res.status(400).json({
      errors: [e.message || 'Erro ao criar usuário'],
    });
  }
}

  // INDEX - lista todos
  async index(req, res) {
    try {
      const users = await User.findAll({
        attributes: ['id', 'nome_completo', 'email', 'cpf', 'telefone'],
      });
      return res.json(users);
    } catch (e) {
      return res.json(null);
    }
  }

  // SHOW - 1 usuário
  async show(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ errors: ['Usuário não encontrado'] });
      }
      return res.json(user);
    } catch (e) {
      return res.json(null);
    }
  }

  // UPDATE
  async update(req, res) {
    try {
      if (!req.params.id) {
        return res.status(400).json({
          errors: ['ID não enviado.'],
        });
      }

      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(400).json({
          errors: ['Usuário não existe.'],
        });
      }

      const novosDados = await user.update(req.body);
      return res.json(novosDados);
    } catch (e) {
      return res.status(400).json({
        errors: e.errors ? e.errors.map((err) => err.message) : ['Erro ao atualizar usuário'],
      });
    }
  }

  // DELETE
  async delete(req, res) {
    try {
      if (!req.params.id) {
        return res.status(400).json({
          errors: ['ID não enviado.'],
        });
      }

      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(400).json({
          errors: ['Usuário não existe.'],
        });
      }

      await user.destroy();
      return res.json({ deleted: true });
    } catch (e) {
      return res.status(400).json({
        errors: e.errors ? e.errors.map((err) => err.message) : ['Erro ao deletar usuário'],
      });
    }
  }
}

export default new UserController();
