const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

const privacySchema = Joi.object({
  ghost_mode_enabled: Joi.boolean(),
  show_location: Joi.boolean(),
  show_boost_status: Joi.boolean(),
  allow_incoming_calls: Joi.boolean()
});

router.get('/privacy', authMiddleware, settingsController.getPrivacySettings);
router.put('/privacy', authMiddleware, validate(privacySchema), settingsController.updatePrivacySettings);
router.get('/legal', settingsController.getLegalInfo);

module.exports = router;
