const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

const swiperSchema = Joi.object({
  target_user_id: Joi.string().required(),
  swipe_type: Joi.string().valid('LIKE', 'PASS', 'SUPER_LIKE').required()
});

router.get('/suggestions', authMiddleware, matchController.getSuggestions);
router.post('/swipe', authMiddleware, validate(swiperSchema), matchController.swipe);
router.get('/mutuals', authMiddleware, matchController.getMutualMatches);
router.get('/profile-visitors', authMiddleware, matchController.getProfileVisitors);

module.exports = router;
