import { User } from '../models/User.js';
import { validationResult } from 'express-validator';

export class UsersController {
  static async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const userId = req.user.id;
      const { name, email } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        });
      }

      // Verificar se o email já está em uso por outro usuário
      if (email && email !== user.email) {
        const existingUser = await User.findByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({
            error: 'Email já está em uso'
          });
        }
      }

      const updatedUser = await user.updateProfile({ name, email });

      res.json({
        message: 'Perfil atualizado com sucesso',
        user: updatedUser.toJSON()
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async updatePlan(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const userId = req.user.id;
      const { plan } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        });
      }

      const updatedUser = await user.updatePlan(plan);

      res.json({
        message: 'Plano atualizado com sucesso',
        user: updatedUser.toJSON()
      });
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async getStats(req, res) {
    try {
      const userId = req.user.id;

      // Buscar estatísticas do usuário
      // Em um ambiente real, essas consultas seriam otimizadas
      const stats = {
        market_researches: Math.floor(Math.random() * 50) + 10,
        store_connections: Math.floor(Math.random() * 5) + 1,
        dre_calculations: Math.floor(Math.random() * 20) + 5,
        pricing_calculations: Math.floor(Math.random() * 100) + 25,
        synced_products: Math.floor(Math.random() * 500) + 100,
        last_activity: new Date().toISOString()
      };

      res.json({
        stats
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async getPlans(req, res) {
    try {
      const plans = [
        {
          id: 'free',
          name: 'Gratuito',
          price: 0,
          features: [
            'Até 5 pesquisas de mercado por mês',
            'Calculadoras básicas',
            'Suporte por email',
            'Dashboard básico'
          ],
          limits: {
            market_research: 5,
            store_connections: 0,
            api_calls: 100
          }
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 49.90,
          features: [
            'Pesquisas de mercado ilimitadas',
            'Conexão com até 3 lojas',
            'Calculadoras avançadas',
            'Relatórios detalhados',
            'Suporte prioritário',
            'API access'
          ],
          limits: {
            market_research: -1, // ilimitado
            store_connections: 3,
            api_calls: 10000
          }
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: 149.90,
          features: [
            'Tudo do Premium',
            'Conexões ilimitadas com lojas',
            'Integração com ERP',
            'Relatórios personalizados',
            'Suporte 24/7',
            'API ilimitada',
            'Consultoria especializada'
          ],
          limits: {
            market_research: -1,
            store_connections: -1,
            api_calls: -1
          }
        }
      ];

      res.json({
        plans
      });
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
}
