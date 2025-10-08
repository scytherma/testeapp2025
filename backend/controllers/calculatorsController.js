import { supabaseAdmin } from '../config/supabase.js';
import { validationResult } from 'express-validator';

export class CalculatorsController {
  // DRE (Demonstração do Resultado do Exercício)
  static async createDRE(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { name, period_start, period_end, revenue, costs, expenses } = req.body;
      const user_id = req.user.id;

      // Calcular resultados do DRE
      const results = this.calculateDRE(revenue, costs, expenses);

      const { data, error } = await supabaseAdmin
        .from('dre_calculations')
        .insert([{
          user_id,
          name,
          period_start,
          period_end,
          revenue,
          costs,
          expenses,
          results
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.status(201).json({
        message: 'DRE criado com sucesso',
        dre: data
      });
    } catch (error) {
      console.error('Erro ao criar DRE:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async getDREs(req, res) {
    try {
      const user_id = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const { data, error, count } = await supabaseAdmin
        .from('dre_calculations')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        throw error;
      }

      res.json({
        dres: data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar DREs:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async getDREById(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('dre_calculations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'DRE não encontrado'
          });
        }
        throw error;
      }

      res.json({
        dre: data
      });
    } catch (error) {
      console.error('Erro ao buscar DRE:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Calculadora de Precificação
  static async createPricingCalculation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { product_name, cost_price, desired_margin, marketplace_fees } = req.body;
      const user_id = req.user.id;

      // Calcular preço sugerido
      const calculationData = this.calculatePricing(cost_price, desired_margin, marketplace_fees);

      const { data, error } = await supabaseAdmin
        .from('pricing_calculations')
        .insert([{
          user_id,
          product_name,
          cost_price,
          desired_margin,
          marketplace_fees,
          calculated_price: calculationData.final_price,
          calculation_data: calculationData
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.status(201).json({
        message: 'Cálculo de precificação criado com sucesso',
        pricing: data
      });
    } catch (error) {
      console.error('Erro ao criar cálculo de precificação:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async getPricingCalculations(req, res) {
    try {
      const user_id = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const { data, error, count } = await supabaseAdmin
        .from('pricing_calculations')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        throw error;
      }

      res.json({
        pricings: data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar cálculos de precificação:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async getPricingById(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('pricing_calculations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Cálculo de precificação não encontrado'
          });
        }
        throw error;
      }

      res.json({
        pricing: data
      });
    } catch (error) {
      console.error('Erro ao buscar cálculo de precificação:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Calculadoras rápidas (sem salvar no banco)
  static async quickDRECalculation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { revenue, costs, expenses } = req.body;
      const results = this.calculateDRE(revenue, costs, expenses);

      res.json({
        results
      });
    } catch (error) {
      console.error('Erro no cálculo rápido de DRE:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async quickPricingCalculation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { cost_price, desired_margin, marketplace_fees } = req.body;
      const results = this.calculatePricing(cost_price, desired_margin, marketplace_fees);

      res.json({
        results
      });
    } catch (error) {
      console.error('Erro no cálculo rápido de precificação:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Métodos auxiliares de cálculo
  static calculateDRE(revenue, costs, expenses) {
    const totalCosts = Object.values(costs).reduce((sum, cost) => sum + parseFloat(cost || 0), 0);
    const totalExpenses = Object.values(expenses).reduce((sum, expense) => sum + parseFloat(expense || 0), 0);
    
    const grossProfit = revenue - totalCosts;
    const netProfit = grossProfit - totalExpenses;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return {
      revenue: parseFloat(revenue),
      total_costs: totalCosts,
      total_expenses: totalExpenses,
      gross_profit: grossProfit,
      net_profit: netProfit,
      gross_margin: parseFloat(grossMargin.toFixed(2)),
      net_margin: parseFloat(netMargin.toFixed(2)),
      cost_percentage: revenue > 0 ? parseFloat(((totalCosts / revenue) * 100).toFixed(2)) : 0,
      expense_percentage: revenue > 0 ? parseFloat(((totalExpenses / revenue) * 100).toFixed(2)) : 0
    };
  }

  static calculatePricing(costPrice, desiredMargin, marketplaceFees = {}) {
    const cost = parseFloat(costPrice);
    const margin = parseFloat(desiredMargin) / 100;
    
    // Calcular taxas do marketplace
    const totalFeePercentage = Object.values(marketplaceFees).reduce((sum, fee) => {
      return sum + parseFloat(fee || 0);
    }, 0) / 100;

    // Preço base com margem desejada
    const basePrice = cost / (1 - margin);
    
    // Preço final considerando taxas do marketplace
    const finalPrice = basePrice / (1 - totalFeePercentage);
    
    // Cálculos adicionais
    const totalFees = finalPrice * totalFeePercentage;
    const actualProfit = finalPrice - cost - totalFees;
    const actualMargin = finalPrice > 0 ? (actualProfit / finalPrice) * 100 : 0;

    return {
      cost_price: cost,
      desired_margin: parseFloat(desiredMargin),
      marketplace_fees: marketplaceFees,
      total_fee_percentage: parseFloat((totalFeePercentage * 100).toFixed(2)),
      base_price: parseFloat(basePrice.toFixed(2)),
      final_price: parseFloat(finalPrice.toFixed(2)),
      total_fees: parseFloat(totalFees.toFixed(2)),
      actual_profit: parseFloat(actualProfit.toFixed(2)),
      actual_margin: parseFloat(actualMargin.toFixed(2)),
      markup: parseFloat(((finalPrice / cost - 1) * 100).toFixed(2))
    };
  }
}
