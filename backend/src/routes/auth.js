const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  gender: Joi.string().valid('MALE', 'FEMALE').required(),
  date_of_birth: Joi.date().required(),
  country: Joi.string().default('India'),
  city: Joi.string().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const googleOAuthSchema = Joi.object({
  google_id_token: Joi.string().required(),
  gender: Joi.string().valid('MALE', 'FEMALE'),
  date_of_birth: Joi.date()
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/oauth/google', validate(googleOAuthSchema), authController.googleOAuth);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;
