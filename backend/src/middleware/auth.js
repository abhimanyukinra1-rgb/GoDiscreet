const jwt = require('jwt-simple');
const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_001',
          message: 'No token provided'
        }
      });
    }

    const decoded = jwt.decode(token, process.env.JWT_SECRET);
    
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_002',
          message: 'Token expired'
        }
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_001',
        message: 'Invalid token'
      }
    });
  }
};

module.exports = authMiddleware;
