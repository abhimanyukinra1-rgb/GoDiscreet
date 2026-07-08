const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { redisAsync } = require('../config/redis');
const logger = require('../utils/logger');

const generateAnonymousUsername = () => {
  return `Mask_${Math.floor(Math.random() * 1000000)}`;
};

const generateTokens = (userId) => {
  const now = Math.floor(Date.now() / 1000);
  const access_token = jwt.encode({
    userId,
    exp: now + parseInt(process.env.JWT_EXPIRY || 900)
  }, process.env.JWT_SECRET);
  
  const refresh_token = jwt.encode({
    userId,
    type: 'refresh',
    exp: now + parseInt(process.env.REFRESH_TOKEN_EXPIRY || 2592000)
  }, process.env.JWT_SECRET);

  return { access_token, refresh_token };
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, gender, date_of_birth, country, city } = req.validatedBody;

    // Check if email exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'AUTH_003',
          message: 'Email already registered'
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const anonymousUsername = generateAnonymousUsername();

    // Create user
    await query(
      `INSERT INTO users 
       (id, email, password_hash, gender, date_of_birth, country, city, anonymous_username, verification_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [userId, email, hashedPassword, gender, date_of_birth, country, city, anonymousUsername, 'UNVERIFIED']
    );

    // Generate tokens
    const { access_token, refresh_token } = generateTokens(userId);

    // Cache user in Redis
    await redisAsync.set(`user:${userId}`, {
      id: userId,
      email,
      anonymous_username: anonymousUsername,
      gender
    }, 86400);

    res.status(201).json({
      success: true,
      data: {
        id: userId,
        email,
        anonymous_username: anonymousUsername,
        access_token,
        refresh_token
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;

    // Find user
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_001',
          message: 'Invalid credentials'
        }
      });
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_001',
          message: 'Invalid credentials'
        }
      });
    }

    // Generate tokens
    const { access_token, refresh_token } = generateTokens(user.id);

    // Cache user
    await redisAsync.set(`user:${user.id}`, {
      id: user.id,
      email: user.email,
      anonymous_username: user.anonymous_username,
      gender: user.gender
    }, 86400);

    res.json({
      success: true,
      data: {
        access_token,
        refresh_token,
        user: {
          id: user.id,
          anonymous_username: user.anonymous_username,
          gender: user.gender
        }
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

exports.googleOAuth = async (req, res, next) => {
  try {
    const { google_id_token, gender, date_of_birth } = req.validatedBody;
    // TODO: Verify Google token with Google API
    // For now, assume token is valid
    const googleEmail = 'user@gmail.com'; // Extract from token

    let user = await query('SELECT * FROM users WHERE google_id = $1', [google_id_token]);
    let isNewUser = false;

    if (user.rows.length === 0) {
      isNewUser = true;
      const userId = uuidv4();
      const anonymousUsername = generateAnonymousUsername();
      const userGender = gender || 'MALE';
      const userDOB = date_of_birth || new Date();

      await query(
        `INSERT INTO users 
         (id, email, google_id, gender, date_of_birth, anonymous_username, verification_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, googleEmail, google_id_token, userGender, userDOB, anonymousUsername, 'VERIFIED']
      );
      user = { rows: [{ id: userId, email: googleEmail, anonymous_username: anonymousUsername, gender: userGender }] };
    }

    const { access_token, refresh_token } = generateTokens(user.rows[0].id);

    res.json({
      success: true,
      data: {
        access_token,
        refresh_token,
        user: {
          id: user.rows[0].id,
          anonymous_username: user.rows[0].anonymous_username
        },
        is_new_user: isNewUser
      }
    });
  } catch (error) {
    logger.error('Google OAuth error:', error);
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    const decoded = jwt.decode(refresh_token, process.env.JWT_SECRET);
    
    const { access_token } = generateTokens(decoded.userId);
    res.json({ success: true, data: { access_token } });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_002',
        message: 'Invalid refresh token'
      }
    });
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (error) {
    next(error);
  }
};
