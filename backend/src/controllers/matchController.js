const { query } = require('../config/database');
const logger = require('../utils/logger');

exports.getSuggestions = async (req, res, next) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const userId = req.user.userId;

    // Get user preferences
    const prefResult = await query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    );
    const prefs = prefResult.rows[0];

    // Get user gender
    const userResult = await query(
      'SELECT gender, city FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    // Get suggestions (opposite gender, matching preferences)
    const oppositeGender = user.gender === 'MALE' ? 'FEMALE' : 'MALE';
    const suggestions = await query(
      `SELECT u.id, u.anonymous_username, u.profile_picture_url, u.bio, u.city, u.gender,
              (SELECT COUNT(*) FROM profile_boosts WHERE user_id = u.id AND is_active = true) as is_boosted
       FROM users u
       WHERE u.gender = $1 AND u.deleted_at IS NULL AND u.is_active = true
       AND u.id NOT IN (SELECT target_user_id FROM swipes WHERE user_id = $2)
       LIMIT $3 OFFSET $4`,
      [oppositeGender, userId, limit, offset]
    );

    res.json({
      success: true,
      data: {
        profiles: suggestions.rows.map(p => ({
          ...p,
          is_boosted: parseInt(p.is_boosted) > 0
        })),
        total: suggestions.rows.length,
        has_more: suggestions.rows.length === parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Get suggestions error:', error);
    next(error);
  }
};

exports.swipe = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { target_user_id, swipe_type } = req.validatedBody;

    // Check if already swiped
    const existingSwipe = await query(
      'SELECT id FROM swipes WHERE user_id = $1 AND target_user_id = $2',
      [userId, target_user_id]
    );

    if (existingSwipe.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'MATCH_001', message: 'User already swiped' }
      });
    }

    // Record swipe
    await query(
      'INSERT INTO swipes (user_id, target_user_id, swipe_type) VALUES ($1, $2, $3)',
      [userId, target_user_id, swipe_type]
    );

    // Record profile view
    await query(
      'INSERT INTO profile_views (viewer_id, viewed_user_id) VALUES ($1, $2)',
      [userId, target_user_id]
    );

    // Check for mutual match
    let isMatch = false;
    let matchId = null;

    if (swipe_type === 'LIKE') {
      const reverseSwipe = await query(
        'SELECT id FROM swipes WHERE user_id = $1 AND target_user_id = $2 AND swipe_type = $3',
        [target_user_id, userId, 'LIKE']
      );

      if (reverseSwipe.rows.length > 0) {
        isMatch = true;
        const matchResult = await query(
          `INSERT INTO matches (user_a_id, user_b_id, user_a_liked, user_b_liked, is_mutual_match, matched_at)
           VALUES ($1, $2, true, true, true, NOW())
           RETURNING id`,
          [userId, target_user_id]
        );
        matchId = matchResult.rows[0].id;

        // Create conversation
        await query(
          'INSERT INTO conversations (user_a_id, user_b_id, is_unlocked, unlock_type) VALUES ($1, $2, true, $3)',
          [userId, target_user_id, 'MATCH']
        );
      }
    }

    res.json({
      success: true,
      data: {
        is_match: isMatch,
        match_id: matchId,
        message: isMatch ? "It's a match!" : 'Swipe recorded'
      }
    });
  } catch (error) {
    logger.error('Swipe error:', error);
    next(error);
  }
};

exports.getMutualMatches = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { limit = 20 } = req.query;

    const matches = await query(
      `SELECT m.id as match_id, m.matched_at,
              CASE WHEN m.user_a_id = $1 THEN m.user_b_id ELSE m.user_a_id END as user_id,
              u.anonymous_username, u.profile_picture_url
       FROM matches m
       JOIN users u ON (
         CASE WHEN m.user_a_id = $1 THEN m.user_b_id ELSE m.user_a_id END = u.id
       )
       WHERE (m.user_a_id = $1 OR m.user_b_id = $1) AND m.is_mutual_match = true
       ORDER BY m.matched_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    res.json({
      success: true,
      data: { matches: matches.rows }
    });
  } catch (error) {
    logger.error('Get mutual matches error:', error);
    next(error);
  }
};

exports.getProfileVisitors = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { limit = 20 } = req.query;

    const visitors = await query(
      `SELECT pv.viewer_id as id, pv.viewed_at, COUNT(*) as view_count,
              u.anonymous_username
       FROM profile_views pv
       JOIN users u ON pv.viewer_id = u.id
       WHERE pv.viewed_user_id = $1
       GROUP BY pv.viewer_id, pv.viewed_at, u.anonymous_username
       ORDER BY pv.viewed_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    res.json({
      success: true,
      data: { visitors: visitors.rows }
    });
  } catch (error) {
    logger.error('Get profile visitors error:', error);
    next(error);
  }
};
