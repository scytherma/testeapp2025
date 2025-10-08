import { AuthService } from '../services/authService.js';
import { validationResult } from 'express-validator';

export class AuthController {
  static async register(req, res) {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { email, password, name } = req.body;

      const result = await AuthService.register({
        email,
        password,
        name
      });

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        ...result
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      
      if (error.message === 'Email já está em uso') {
        return res.status(409).json({
          error: error.message
        });
      }

      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async login(req, res) {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      res.json({
        message: 'Login realizado com sucesso',
        ...result
      });
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.message === 'Credenciais inválidas' || error.message === 'Conta desativada') {
        return res.status(401).json({
          error: error.message
        });
      }

      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async refreshToken(req, res) {
    try {
      const userId = req.user.id;

      const result = await AuthService.refreshToken(userId);

      res.json({
        message: 'Token renovado com sucesso',
        ...result
      });
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      
      res.status(401).json({
        error: 'Não foi possível renovar o token'
      });
    }
  }

  static async logout(req, res) {
    try {
      // No caso de JWT, o logout é feito no frontend removendo o token
      // Aqui podemos implementar uma blacklist de tokens se necessário
      
      res.json({
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = req.user;

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          active: user.active,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
}
