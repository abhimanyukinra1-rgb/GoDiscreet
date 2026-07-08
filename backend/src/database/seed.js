const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'godiscreet',
  user: process.env.DB_USER || 'godiscreet_user',
  password: process.env.DB_PASSWORD || 'secure_password_here',
  max: 2,
});

const run = async () => {
  try {
    logger.info('Seeding database...');

    const sampleUserId = uuidv4();
    const passwordHash = await bcrypt.hash('password123', 10);

    // Insert sample user if not exists
    await pool.query(`
      INSERT INTO users (id, email, password_hash, anonymous_username, verification_status)
      SELECT $1, $2, $3, $4, $5
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = $2)
    `, [sampleUserId, 'demo@godiscreet.local', passwordHash, 'Mask_1000', 'VERIFIED']);

    // Add some interests
    await pool.query(`
      INSERT INTO user_interests (user_id, interest_name, is_custom)
      SELECT $1, 'Music', false
      WHERE NOT EXISTS (SELECT 1 FROM user_interests WHERE user_id = $1 AND interest_name = 'Music')
    `, [sampleUserId]);

    logger.info('Seeding completed');
  } catch (err) {
    logger.error('Seeding failed', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

if (require.main === module) {
  run().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { run };
