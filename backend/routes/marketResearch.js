import express from 'express';
import { body, param, query } from 'express-validator';
import { MarketResearchController } from '../controllers/marketResearchController.js';
import { requirePlan } from '../middleware/auth.js';

const router = express.Router();

// Validações
const createResearchValidation = [
  body('product_name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome do produto deve ter entre 2 e 255 caracteres'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Categoria deve ter no máximo 100 caracteres'),
  body('search_data')
    .optional()
    .isObject()
    .withMessage('Dados de pesquisa devem ser um objeto válido')
];

const updateResearchValidation = [
  param('id')
    .isUUID()
    .withMessage('ID inválido'),
  ...createResearchValidation
];

const getResearchValidation = [
  param('id')
    .isUUID()
    .withMessage('ID inválido')
];

const listResearchesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),
  query('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Categoria deve ter no máximo 100 caracteres')
];

// Rotas
router.post('/', createResearchValidation, MarketResearchController.createResearch);
router.get('/', listResearchesValidation, MarketResearchController.getResearches);
router.get('/trends', MarketResearchController.getMarketTrends);
router.get('/:id', getResearchValidation, MarketResearchController.getResearchById);
router.put('/:id', updateResearchValidation, MarketResearchController.updateResearch);
router.delete('/:id', getResearchValidation, MarketResearchController.deleteResearch);

export default router;
