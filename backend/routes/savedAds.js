import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Listar anúncios salvos do usuário
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('saved_ads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar anúncios salvos:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }

    res.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Erro ao listar anúncios salvos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// Salvar novo anúncio
router.post('/', async (req, res) => {
  try {
    console.log('=== INÍCIO DO SALVAMENTO DE ANÚNCIO ===');
    console.log('User ID:', req.user?.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const userId = req.user.id;
    const {
      nome,
      tipo_calculadora,
      dados_calculo,
      foto_url,
      comentario,
      tags
    } = req.body;

    // Validar dados obrigatórios
    if (!nome || !tipo_calculadora || !dados_calculo) {
      console.log('Erro: Dados obrigatórios não fornecidos');
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos',
        required: ['nome', 'tipo_calculadora', 'dados_calculo']
      });
    }

    console.log('Dados validados, tentando inserir no Supabase...');
    
    const insertData = {
      user_id: userId,
      nome,
      tipo_calculadora,
      dados_calculo,
      foto_url: foto_url || null,
      comentario: comentario || null,
      tags: tags || []
    };
    
    console.log('Dados para inserção:', JSON.stringify(insertData, null, 2));

    const { data, error } = await supabase
      .from('saved_ads')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Erro do Supabase ao salvar anúncio:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }

    console.log('Anúncio salvo com sucesso:', data);
    console.log('=== FIM DO SALVAMENTO DE ANÚNCIO ===');

    res.status(201).json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Erro geral ao salvar anúncio:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// Carregar anúncio específico
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const adId = req.params.id;

    const { data, error } = await supabase
      .from('saved_ads')
      .select('*')
      .eq('id', adId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Anúncio não encontrado'
        });
      }
      console.error('Erro ao carregar anúncio:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Erro ao carregar anúncio:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// Atualizar anúncio
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const adId = req.params.id;
    const {
      nome,
      dados_calculo,
      foto_url,
      comentario,
      tags
    } = req.body;

    const updateData = {};
    if (nome !== undefined) updateData.nome = nome;
    if (dados_calculo !== undefined) updateData.dados_calculo = dados_calculo;
    if (foto_url !== undefined) updateData.foto_url = foto_url;
    if (comentario !== undefined) updateData.comentario = comentario;
    if (tags !== undefined) updateData.tags = tags;

    const { data, error } = await supabase
      .from('saved_ads')
      .update(updateData)
      .eq('id', adId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Anúncio não encontrado'
        });
      }
      console.error('Erro ao atualizar anúncio:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Erro ao atualizar anúncio:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// Excluir anúncio
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const adId = req.params.id;

    const { error } = await supabase
      .from('saved_ads')
      .delete()
      .eq('id', adId)
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao excluir anúncio:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }

    res.json({
      success: true,
      message: 'Anúncio excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir anúncio:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

export default router;
