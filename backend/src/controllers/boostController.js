const { query } = require('../config/database');
const logger = require('../utils/logger');

const BOOST_COSTS = {
  1: 200,  // 1 hour = 200 pearls
  2: 300   // 2 hours = 300 pearls
};

exports.activateBoost = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { duration_hours, payment_method = 'PEARLS' } = req.validatedBody;

    const pearlCost = BOOST_COSTS[duration_hours];
    if (!pearlCost) {
      return res.status(400).json({
        success: false,
        error: { code: 'BOOST_001', message: 'Invalid duration' }
      });
    }

    // Get pearl balance
    const balanceResult = await query(
      `SELECT SUM(CASE WHEN transaction_type IN ('PURCHASE', 'BONUS') THEN amount ELSE -amount END) as balance
       FROM pearls WHERE user_id = $1`,
      [userId]
    );
    const balance = parseInt(balanceResult.rows[0]?.balance) || 0;

    if (balance < pearlCost) {
      return res.status(400).json({
        success: false,
        error: { code: 'PEARL_001', message: 'Insufficient pearls' }
      });
    }

    // Deduct pearls
    await query(
      'INSERT INTO pearls (user_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4)',
      [userId, -pearlCost, 'USE', `Profile boost for ${duration_hours} hour(s)`]
    );

    // Create boost record
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration_hours * 60 * 60 * 1000);

    const boostResult = await query(
      `INSERT INTO profile_boosts (user_id, boost_duration_hours, pearl_cost, started_at, expires_at, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id`,
      [userId, duration_hours, pearlCost, now, expiresAt]
    );

    res.json({
      success: true,
      data: {
        boost_id: boostResult.rows[0].id,
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        remaining_pearls: balance - pearlCost
      }
    });
  } catch (error) {
    logger.error('Activate boost error:', error);
    next(error);
  }
};

exports.getActiveBoost = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const boostResult = await query(
      `SELECT expires_at FROM profile_boosts
       WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
       ORDER BY expires_at DESC LIMIT 1`,
      [userId]
    );

    if (boostResult.rows.length === 0) {
      return res.json({
        success: true,
        data: { is_boosted: false }
      });
    }

    const expiresAt = new Date(boostResult.rows[0].expires_at);
    const timeRemaining = Math.floor((expiresAt - new Date()) / 1000 / 60);

    res.json({
      success: true,
      data: {
        is_boosted: true,
        expires_at: expiresAt.toISOString(),
        time_remaining_minutes: timeRemaining
      }
    });
  } catch (error) {
    logger.error('Get active boost error:', error);
    next(error);
  }
};
