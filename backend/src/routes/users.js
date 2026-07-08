const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

const updateProfileSchema = Joi.object({
  bio: Joi.string().max(500),
  city: Joi.string(),
  interests: Joi.array().items(Joi.string())
});

router.get('/:id', authMiddleware, userController.getProfile);
router.put('/:id', authMiddleware, validate(updateProfileSchema), userController.updateProfile);
router.post('/:id/upload-picture', authMiddleware, userController.uploadPicture);
router.post('/:id/interests', authMiddleware, userController.addInterests);
router.delete('/:id', authMiddleware, userController.deleteAccount);

module.exports = router;
