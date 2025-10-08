import express from 'express';
import { body, param, query } from 'express-validator';
import { CalculatorsController } from '../controllers/calculatorsController.js';

const router = express.Router();

// Validações para DRE
const createDREValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome deve ter entre 2 e 255 caracteres'),
  body('period_start')
    .isISO8601()
    .withMessage('Data de início inválida'),
  body('period_end')
    .isISO8601()
    .withMessage('Data de fim inválida'),
  body('revenue')
    .isNumeric({ min: 0 })
    .withMessage('Receita deve ser um número positivo'),
  body('costs')
    .isObject()
    .withMessage('Custos devem ser um objeto válido'),
  body('expenses')
    .isObject()
    .withMessage('Despesas devem ser um objeto válido')
];

const quickDREValidation = [
  body('revenue')
    .isNumeric({ min: 0 })
    .withMessage('Receita deve ser um número positivo'),
  body('costs')
    .isObject()
    .withMessage('Custos devem ser um objeto válido'),
  body('expenses')
    .isObject()
    .withMessage('Despesas devem ser um objeto válido')
];

// Validações para Precificação
const createPricingValidation = [
  body('product_name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome do produto deve ter entre 2 e 255 caracteres'),
  body('cost_price')
    .isNumeric({ min: 0 })
    .withMessage('Preço de custo deve ser um número positivo'),
  body('desired_margin')
    .isNumeric({ min: 0, max: 100 })
    .withMessage('Margem desejada deve ser um número entre 0 e 100'),
  body('marketplace_fees')
    .optional()
    .isObject()
    .withMessage('Taxas do marketplace devem ser um objeto válido')
];

const quickPricingValidation = [
  body('cost_price')
    .isNumeric({ min: 0 })
    .withMessage('Preço de custo deve ser um número positivo'),
  body('desired_margin')
    .isNumeric({ min: 0, max: 100 })
    .withMessage('Margem desejada deve ser um número entre 0 e 100'),
  body('marketplace_fees')
    .optional()
    .isObject()
    .withMessage('Taxas do marketplace devem ser um objeto válido')
];

// Validações gerais
const getByIdValidation = [
  param('id')
    .isUUID()
    .withMessage('ID inválido')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100')
];

// Rotas DRE
router.post('/dre', createDREValidation, CalculatorsController.createDRE);
router.get('/dre', paginationValidation, CalculatorsController.getDREs);
router.get('/dre/:id', getByIdValidation, CalculatorsController.getDREById);
router.post('/dre/quick', quickDREValidation, CalculatorsController.quickDRECalculation);

// Rotas Precificação
router.post('/pricing', createPricingValidation, CalculatorsController.createPricingCalculation);
router.get('/pricing', paginationValidation, CalculatorsController.getPricingCalculations);
router.get('/pricing/:id', getByIdValidation, CalculatorsController.getPricingById);
router.post('/pricing/quick', quickPricingValidation, CalculatorsController.quickPricingCalculation);

export default router;
