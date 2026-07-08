const express = require('express');
const router = express.Router();
const pearlController = require('../controllers/pearlController');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

const purchaseSchema = Joi.object({
  package: Joi.string().valid('BASIC', 'STANDARD', 'PREMIUM', 'ELITE').required(),
  payment_method: Joi.string().required()
});

router.get('/balance', authMiddleware, pearlController.getBalance);
router.post('/purchase', authMiddleware, validate(purchaseSchema), pearlController.purchasePearls);
router.get('/transactions', authMiddleware, pearlController.getTransactions);
router.post('/use', authMiddleware, pearlController.usePearls);

module.exports = router;
