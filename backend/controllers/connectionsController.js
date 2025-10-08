import { supabaseAdmin } from '../config/supabase.js';
import { validationResult } from 'express-validator';

export class ConnectionsController {
  static async createConnection(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { store_type, store_name, api_credentials } = req.body;
      const user_id = req.user.id;

      // Verificar se já existe uma conexão ativa para este tipo de loja
      const { data: existingConnection } = await supabaseAdmin
        .from('store_connections')
        .select('id')
        .eq('user_id', user_id)
        .eq('store_type', store_type)
        .eq('is_active', true)
        .single();

      if (existingConnection) {
        return res.status(409).json({
          error: `Já existe uma conexão ativa com ${store_type}`
        });
      }

      // Simular validação das credenciais da API
      const isValidCredentials = await this.validateStoreCredentials(store_type, api_credentials);
      
      if (!isValidCredentials) {
        return res.status(400).json({
          error: 'Credenciais da API inválidas'
        });
      }

      const { data, error } = await supabaseAdmin
        .from('store_connections')
        .insert([{
          user_id,
          store_type,
          store_name,
          api_credentials,
          is_active: true,
          last_sync: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Remover credenciais sensíveis da resposta
      const responseData = { ...data };
      delete responseData.api_credentials;

      res.status(201).json({
        message: 'Conexão criada com sucesso',
        connection: responseData
      });
    } catch (error) {
      console.error('Erro ao criar conexão:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async getConnections(req, res) {
    try {
      const user_id = req.user.id;
      const { store_type, is_active } = req.query;

      let query = supabaseAdmin
        .from('store_connections')
        .select('id, user_id, store_type, store_name, is_active, last_sync, created_at, updated_at')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

      if (store_type) {
        query = query.eq('store_type', store_type);
      }

      if (is_active !== undefined) {
        query = query.eq('is_active', is_active === 'true');
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      res.json({
        connections: data
      });
    } catch (error) {
      console.error('Erro ao buscar conexões:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async getConnectionById(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('store_connections')
        .select('id, user_id, store_type, store_name, is_active, last_sync, created_at, updated_at')
        .eq('id', id)
        .eq('user_id', user_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Conexão não encontrada'
          });
        }
        throw error;
      }

      res.json({
        connection: data
      });
    } catch (error) {
      console.error('Erro ao buscar conexão:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async updateConnection(req, res) {
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
      const { store_name, api_credentials, is_active } = req.body;

      const updateData = {};
      if (store_name !== undefined) updateData.store_name = store_name;
      if (is_active !== undefined) updateData.is_active = is_active;
      
      if (api_credentials) {
        // Validar novas credenciais se fornecidas
        const { data: connection } = await supabaseAdmin
          .from('store_connections')
          .select('store_type')
          .eq('id', id)
          .eq('user_id', user_id)
          .single();

        if (connection) {
          const isValid = await this.validateStoreCredentials(connection.store_type, api_credentials);
          if (!isValid) {
            return res.status(400).json({
              error: 'Credenciais da API inválidas'
            });
          }
          updateData.api_credentials = api_credentials;
        }
      }

      const { data, error } = await supabaseAdmin
        .from('store_connections')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user_id)
        .select('id, user_id, store_type, store_name, is_active, last_sync, created_at, updated_at')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Conexão não encontrada'
          });
        }
        throw error;
      }

      res.json({
        message: 'Conexão atualizada com sucesso',
        connection: data
      });
    } catch (error) {
      console.error('Erro ao atualizar conexão:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async deleteConnection(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const { error } = await supabaseAdmin
        .from('store_connections')
        .delete()
        .eq('id', id)
        .eq('user_id', user_id);

      if (error) {
        throw error;
      }

      res.json({
        message: 'Conexão deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar conexão:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async syncConnection(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      // Buscar conexão
      const { data: connection, error: connectionError } = await supabaseAdmin
        .from('store_connections')
        .select('*')
        .eq('id', id)
        .eq('user_id', user_id)
        .eq('is_active', true)
        .single();

      if (connectionError || !connection) {
        return res.status(404).json({
          error: 'Conexão não encontrada ou inativa'
        });
      }

      // Simular sincronização de produtos
      const mockProducts = await this.simulateProductSync(connection.store_type);

      // Atualizar produtos sincronizados
      for (const product of mockProducts) {
        await supabaseAdmin
          .from('synced_products')
          .upsert({
            user_id,
            connection_id: id,
            external_id: product.external_id,
            name: product.name,
            price: product.price,
            stock_quantity: product.stock_quantity,
            category: product.category,
            product_data: product
          });
      }

      // Atualizar timestamp da última sincronização
      await supabaseAdmin
        .from('store_connections')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', id);

      res.json({
        message: 'Sincronização realizada com sucesso',
        synced_products: mockProducts.length
      });
    } catch (error) {
      console.error('Erro na sincronização:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async getSyncedProducts(req, res) {
    try {
      const user_id = req.user.id;
      const { connection_id, category, page = 1, limit = 20 } = req.query;

      let query = supabaseAdmin
        .from('synced_products')
        .select('*')
        .eq('user_id', user_id)
        .order('last_updated', { ascending: false });

      if (connection_id) {
        query = query.eq('connection_id', connection_id);
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        throw error;
      }

      res.json({
        products: data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar produtos sincronizados:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Métodos auxiliares
  static async validateStoreCredentials(storeType, credentials) {
    // Simular validação de credenciais
    // Em um ambiente real, aqui faria chamadas para as APIs das lojas
    return credentials && credentials.api_key && credentials.api_key.length > 10;
  }

  static async simulateProductSync(storeType) {
    // Simular produtos sincronizados
    const mockProducts = [];
    const productCount = Math.floor(Math.random() * 10) + 5;

    for (let i = 0; i < productCount; i++) {
      mockProducts.push({
        external_id: `${storeType}_${Date.now()}_${i}`,
        name: `Produto ${i + 1} - ${storeType}`,
        price: Math.floor(Math.random() * 200) + 20,
        stock_quantity: Math.floor(Math.random() * 100) + 1,
        category: ['Eletrônicos', 'Casa', 'Moda', 'Esportes'][Math.floor(Math.random() * 4)],
        description: `Descrição do produto ${i + 1}`,
        images: [`https://example.com/image${i + 1}.jpg`],
        sku: `SKU${Date.now()}${i}`
      });
    }

    return mockProducts;
  }
}
