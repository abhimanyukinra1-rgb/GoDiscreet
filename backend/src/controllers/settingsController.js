const { query } = require('../config/database');
const logger = require('../utils/logger');

exports.getPrivacySettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT ghost_mode_enabled, show_location, show_boost_status, allow_incoming_calls
       FROM users WHERE id = $1`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Get privacy settings error:', error);
    next(error);
  }
};

exports.updatePrivacySettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { ghost_mode_enabled, show_location, show_boost_status, allow_incoming_calls } = req.validatedBody;

    await query(
      `UPDATE users SET 
       ghost_mode_enabled = COALESCE($1, ghost_mode_enabled),
       show_location = COALESCE($2, show_location),
       show_boost_status = COALESCE($3, show_boost_status),
       allow_incoming_calls = COALESCE($4, allow_incoming_calls),
       updated_at = NOW()
       WHERE id = $5`,
      [ghost_mode_enabled, show_location, show_boost_status, allow_incoming_calls, userId]
    );

    res.json({
      success: true,
      data: { message: 'Settings updated' }
    });
  } catch (error) {
    logger.error('Update privacy settings error:', error);
    next(error);
  }
};

exports.getLegalInfo = (req, res) => {
  res.json({
    success: true,
    data: {
      terms_of_use: 'https://godiscreet.com/terms',
      privacy_policy: 'https://godiscreet.com/privacy',
      cookie_policy: 'https://godiscreet.com/cookies'
    }
  });
};
