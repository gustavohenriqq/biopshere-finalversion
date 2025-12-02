// src/controllers/TokenController.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

class TokenController {
  async store(req, res) {
    try {
      const { email = '', password = '' } = req.body;

      if (!email || !password) {
        return res.status(401).json({
          errors: ['Credenciais inválidas.'],
        });
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({
          errors: ['Usuário não encontrado.'],
        });
      }

      // Verificação de senha:
      let senhaValida = false;

      if (typeof user.passwordIsValid === 'function') {
        senhaValida = await user.passwordIsValid(password);
      } else if (user.password) {
        senhaValida = user.password === password;
      } else if (user.password_hash) {
        console.error('⚠️ Model User tem password_hash mas não tem método passwordIsValid.');
        return res.status(500).json({
          errors: ['Erro na configuração de senha do usuário.'],
        });
      }

      if (!senhaValida) {
        return res.status(401).json({
          errors: ['Senha inválida.'],
        });
      }

      // ✅ checando status de aprovação
      if (user.status === 'pendente') {
        return res.status(401).json({
          errors: ['Cadastro em análise. Aguarde aprovação do administrador.'],
        });
      }

      if (user.status === 'rejeitado') {
        return res.status(401).json({
          errors: ['Cadastro rejeitado. Entre em contato com o suporte.'],
        });
      }

      const { id, nome_completo, role, status } = user;

      const secret = process.env.TOKEN_SECRET;
      if (!secret) {
        console.error('❌ TOKEN_SECRET não definido no .env');
        return res.status(500).json({
          errors: ['Erro de configuração no servidor (TOKEN_SECRET ausente).'],
        });
      }

      const token = jwt.sign(
        { id, email, role, status },
        secret,
        {
          expiresIn: process.env.TOKEN_EXPIRATION || '7d',
        },
      );

      return res.json({
        token,
        user: {
          id,
          nome_completo,
          email,
          role,
          status, // 👈 devolvendo status pro front
        },
      });
    } catch (e) {
      console.error('ERRO AO GERAR TOKEN >>>', e);
      return res.status(500).json({
        errors: ['Erro interno ao gerar token.'],
      });
    }
  }
}

export default new TokenController();
