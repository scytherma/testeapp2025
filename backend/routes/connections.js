import express from 'express';
import { body, param, query } from 'express-validator';
import { ConnectionsController } from '../controllers/connectionsController.js';
import { requirePlan } from '../middleware/auth.js';

const router = express.Router();

// Validações
const createConnectionValidation = [
  body('store_type')
    .isIn(['shopee', 'mercadolivre', 'shein', 'amazon', 'aliexpress'])
    .withMessage('Tipo de loja inválido'),
  body('store_name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome da loja deve ter entre 2 e 255 caracteres'),
  body('api_credentials')
    .isObject()
    .withMessage('Credenciais da API devem ser um objeto válido'),
  body('api_credentials.api_key')
    .isLength({ min: 10 })
    .withMessage('Chave da API deve ter pelo menos 10 caracteres')
];

const updateConnectionValidation = [
  param('id')
    .isUUID()
    .withMessage('ID inválido'),
  body('store_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome da loja deve ter entre 2 e 255 caracteres'),
  body('api_credentials')
    .optional()
    .isObject()
    .withMessage('Credenciais da API devem ser um objeto válido'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('Status ativo deve ser um valor booleano')
];

const getConnectionValidation = [
  param('id')
    .isUUID()
    .withMessage('ID inválido')
];

const listConnectionsValidation = [
  query('store_type')
    .optional()
    .isIn(['shopee', 'mercadolivre', 'shein', 'amazon', 'aliexpress'])
    .withMessage('Tipo de loja inválido'),
  query('is_active')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Status ativo deve ser true ou false')
];

const syncedProductsValidation = [
  query('connection_id')
    .optional()
    .isUUID()
    .withMessage('ID da conexão inválido'),
  query('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Categoria deve ter no máximo 100 caracteres'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100')
];

// Rotas
router.post('/', requirePlan('premium'), createConnectionValidation, ConnectionsController.createConnection);
router.get('/', listConnectionsValidation, ConnectionsController.getConnections);
router.get('/products', syncedProductsValidation, ConnectionsController.getSyncedProducts);
router.get('/:id', getConnectionValidation, ConnectionsController.getConnectionById);
router.put('/:id', updateConnectionValidation, ConnectionsController.updateConnection);
router.delete('/:id', getConnectionValidation, ConnectionsController.deleteConnection);
router.post('/:id/sync', requirePlan('premium'), getConnectionValidation, ConnectionsController.syncConnection);

export default router;
