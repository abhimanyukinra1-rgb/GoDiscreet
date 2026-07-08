const { query } = require('../config/database');
const { redisAsync } = require('../config/redis');
const logger = require('../utils/logger');
const s3Service = require('../services/s3Service');

exports.getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Try cache first
    let user = await redisAsync.get(`user:${id}`);
    if (!user) {
      const result = await query(
        `SELECT id, email, anonymous_username, gender, bio, city, profile_picture_url, 
                verification_status, ghost_mode_enabled, created_at
         FROM users WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'USER_001', message: 'User not found' }
        });
      }
      user = result.rows[0];
      await redisAsync.set(`user:${id}`, user);
    }

    // Get interests
    const interestsResult = await query(
      'SELECT interest_name FROM user_interests WHERE user_id = $1',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...user,
        interests: interestsResult.rows.map(r => r.interest_name)
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bio, city, interests } = req.validatedBody;

    // Verify ownership
    if (req.user.userId !== id) {
      return res.status(403).json({
        success: false,
        error: { code: 'USER_002', message: 'Cannot modify user profile' }
      });
    }

    // Update profile
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (bio) {
      updates.push(`bio = $${paramCount++}`);
      values.push(bio);
    }
    if (city) {
      updates.push(`city = $${paramCount++}`);
      values.push(city);
    }

    if (updates.length > 0) {
      values.push(id);
      await query(
        `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramCount}`,
        values
      );
    }

    // Update interests if provided
    if (interests && interests.length > 0) {
      await query('DELETE FROM user_interests WHERE user_id = $1', [id]);
      for (const interest of interests) {
        await query(
          'INSERT INTO user_interests (user_id, interest_name) VALUES ($1, $2)',
          [id, interest]
        );
      }
    }

    // Invalidate cache
    await redisAsync.del(`user:${id}`);

    res.json({ success: true, data: { message: 'Profile updated' } });
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
};

exports.uploadPicture = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Implement file upload to S3
    // const url = await s3Service.uploadFile(req.file);
    
    res.json({
      success: true,
      data: {
        picture_url: 'https://example.com/picture.jpg',
        uploaded_at: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Upload picture error:', error);
    next(error);
  }
};

exports.addInterests = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { interests, custom_interests } = req.body;

    if (req.user.userId !== id) {
      return res.status(403).json({
        success: false,
        error: { code: 'USER_002', message: 'Cannot modify user profile' }
      });
    }

    // Clear existing interests
    await query('DELETE FROM user_interests WHERE user_id = $1', [id]);

    // Add new interests
    const allInterests = [...(interests || []), ...(custom_interests || [])];
    for (const interest of allInterests) {
      await query(
        'INSERT INTO user_interests (user_id, interest_name, is_custom) VALUES ($1, $2, $3)',
        [id, interest, custom_interests.includes(interest)]
      );
    }

    res.json({
      success: true,
      data: { interests: allInterests }
    });
  } catch (error) {
    logger.error('Add interests error:', error);
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.userId !== id) {
      return res.status(403).json({
        success: false,
        error: { code: 'USER_002', message: 'Cannot modify user profile' }
      });
    }

    // Soft delete
    const deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await query(
      'UPDATE users SET deleted_at = $1, is_active = false WHERE id = $2',
      [deletionDate, id]
    );

    await redisAsync.del(`user:${id}`);

    res.json({
      success: true,
      data: {
        message: 'Account scheduled for deletion',
        deletion_date: deletionDate.toISOString()
      }
    });
  } catch (error) {
    logger.error('Delete account error:', error);
    next(error);
  }
};
