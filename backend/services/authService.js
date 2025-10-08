import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export class AuthService {
  static generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  static async register(userData) {
    try {
      const { email, password, name } = userData;

      // Verificar se o usuário já existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new Error('Email já está em uso');
      }

      // Criar novo usuário
      const user = await User.create({
        email,
        password,
        name,
        plan: 'free'
      });

      // Gerar token
      const token = this.generateToken(user.id);

      return {
        user: user.toJSON(),
        token
      };
    } catch (error) {
      throw error;
    }
  }

  static async login(email, password) {
    try {
      // Buscar usuário
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error('Credenciais inválidas');
      }

      // Verificar se a conta está ativa
      if (!user.active) {
        throw new Error('Conta desativada');
      }

      // Validar senha
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        throw new Error('Credenciais inválidas');
      }

      // Gerar token
      const token = this.generateToken(user.id);

      return {
        user: user.toJSON(),
        token
      };
    } catch (error) {
      throw error;
    }
  }

  static async refreshToken(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.active) {
        throw new Error('Usuário não encontrado ou inativo');
      }

      const token = this.generateToken(user.id);

      return {
        user: user.toJSON(),
        token
      };
    } catch (error) {
      throw error;
    }
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw error;
    }
  }
}
