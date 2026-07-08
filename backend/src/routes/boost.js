const express = require('express');
const router = express.Router();
const boostController = require('../controllers/boostController');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

const activateBoostSchema = Joi.object({
  duration_hours: Joi.number().valid(1, 2).required(),
  payment_method: Joi.string().default('PEARLS')
});

router.post('/activate', authMiddleware, validate(activateBoostSchema), boostController.activateBoost);
router.get('/active', authMiddleware, boostController.getActiveBoost);

module.exports = router;
