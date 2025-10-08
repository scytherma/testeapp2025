import { supabaseAdmin } from '../config/supabase.js';
import { validationResult } from 'express-validator';

export class MarketResearchController {
  static async createResearch(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { product_name, category, search_data } = req.body;
      const user_id = req.user.id;

      // Simular dados de pesquisa de mercado
      const mockResults = {
        average_price: Math.floor(Math.random() * 100) + 20,
        competitors_count: Math.floor(Math.random() * 50) + 5,
        market_trend: ['crescente', 'estável', 'decrescente'][Math.floor(Math.random() * 3)],
        demand_level: ['baixa', 'média', 'alta'][Math.floor(Math.random() * 3)],
        competition_level: ['baixa', 'média', 'alta'][Math.floor(Math.random() * 3)],
        suggested_price_range: {
          min: Math.floor(Math.random() * 50) + 10,
          max: Math.floor(Math.random() * 100) + 60
        },
        top_keywords: [
          `${product_name} barato`,
          `${product_name} promoção`,
          `${product_name} qualidade`,
          `melhor ${product_name}`,
          `${product_name} original`
        ],
        seasonal_data: {
          peak_months: ['novembro', 'dezembro', 'janeiro'],
          low_months: ['março', 'abril', 'maio']
        }
      };

      const { data, error } = await supabaseAdmin
        .from('market_research')
        .insert([{
          user_id,
          product_name,
          category,
          search_data,
          results: mockResults
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.status(201).json({
        message: 'Pesquisa de mercado criada com sucesso',
        research: data
      });
    } catch (error) {
      console.error('Erro ao criar pesquisa de mercado:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async getResearches(req, res) {
    try {
      const user_id = req.user.id;
      const { page = 1, limit = 10, category } = req.query;

      let query = supabaseAdmin
        .from('market_research')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        throw error;
      }

      res.json({
        researches: data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar pesquisas:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async getResearchById(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('market_research')
        .select('*')
        .eq('id', id)
        .eq('user_id', user_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Pesquisa não encontrada'
          });
        }
        throw error;
      }

      res.json({
        research: data
      });
    } catch (error) {
      console.error('Erro ao buscar pesquisa:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async updateResearch(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const user_id = req.user.id;
      const { product_name, category, search_data } = req.body;

      const { data, error } = await supabaseAdmin
        .from('market_research')
        .update({
          product_name,
          category,
          search_data
        })
        .eq('id', id)
        .eq('user_id', user_id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Pesquisa não encontrada'
          });
        }
        throw error;
      }

      res.json({
        message: 'Pesquisa atualizada com sucesso',
        research: data
      });
    } catch (error) {
      console.error('Erro ao atualizar pesquisa:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async deleteResearch(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const { error } = await supabaseAdmin
        .from('market_research')
        .delete()
        .eq('id', id)
        .eq('user_id', user_id);

      if (error) {
        throw error;
      }

      res.json({
        message: 'Pesquisa deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar pesquisa:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async getMarketTrends(req, res) {
    try {
      const { category, period = '30d' } = req.query;

      // Simular dados de tendências de mercado
      const mockTrends = {
        period,
        category: category || 'geral',
        trends: [
          {
            keyword: 'produto sustentável',
            growth: 45.2,
            volume: 12500
          },
          {
            keyword: 'entrega rápida',
            growth: 32.1,
            volume: 8900
          },
          {
            keyword: 'preço baixo',
            growth: -5.3,
            volume: 15600
          },
          {
            keyword: 'qualidade premium',
            growth: 28.7,
            volume: 7200
          }
        ],
        top_categories: [
          { name: 'Eletrônicos', growth: 23.4 },
          { name: 'Casa e Jardim', growth: 18.9 },
          { name: 'Moda', growth: 15.2 },
          { name: 'Esportes', growth: 12.7 }
        ]
      };

      res.json({
        trends: mockTrends
      });
    } catch (error) {
      console.error('Erro ao buscar tendências:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
}
