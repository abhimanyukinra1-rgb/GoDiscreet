const { query } = require('../config/database');
const logger = require('../utils/logger');

exports.getUsers = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const users = await query(
      `SELECT id, email, anonymous_username, gender, verification_status, is_active, created_at
       FROM users
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      success: true,
      data: { users: users.rows }
    });
  } catch (error) {
    logger.error('Get users error:', error);
    next(error);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const { status = 'PENDING', limit = 50, offset = 0 } = req.query;

    const reports = await query(
      `SELECT * FROM user_reports
       WHERE report_status = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );

    res.json({
      success: true,
      data: { reports: reports.rows }
    });
  } catch (error) {
    logger.error('Get reports error:', error);
    next(error);
  }
};

exports.takeAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, admin_notes } = req.body;

    await query(
      'UPDATE user_reports SET report_status = $1, admin_notes = $2 WHERE id = $3',
      [action, admin_notes, id]
    );

    res.json({
      success: true,
      data: { message: 'Action taken' }
    });
  } catch (error) {
    logger.error('Take action error:', error);
    next(error);
  }
};
