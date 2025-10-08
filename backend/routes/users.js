import express from 'express';
import { body } from 'express-validator';
import { UsersController } from '../controllers/usersController.js';

const router = express.Router();

// Validações
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome deve ter entre 2 e 255 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido')
];

const updatePlanValidation = [
  body('plan')
    .isIn(['free', 'premium', 'enterprise'])
    .withMessage('Plano inválido')
];

// Rotas
router.put('/profile', updateProfileValidation, UsersController.updateProfile);
router.put('/plan', updatePlanValidation, UsersController.updatePlan);
router.get('/stats', UsersController.getStats);
router.get('/plans', UsersController.getPlans);

export default router;
