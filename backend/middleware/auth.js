import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso requerido'
      });
    }

    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário no Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: 'Token inválido ou usuário não encontrado'
      });
    }

    // Verificar se o usuário está ativo
    if (!user.active) {
      return res.status(403).json({
        error: 'Conta desativada'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado'
      });
    }

    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

export const requirePlan = (requiredPlan) => {
  return (req, res, next) => {
    const userPlan = req.user.plan || 'free';
    
    const planHierarchy = {
      'free': 0,
      'premium': 1,
      'enterprise': 2
    };

    if (planHierarchy[userPlan] < planHierarchy[requiredPlan]) {
      return res.status(403).json({
        error: `Plano ${requiredPlan} requerido`,
        currentPlan: userPlan,
        requiredPlan: requiredPlan
      });
    }

    next();
  };
};
