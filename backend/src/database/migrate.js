const { Pool } = require('pg');
const logger = require('../utils/logger');

// Create a dedicated pool for migration using same env vars
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
    logger.info('Running database migrations...');

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE,
        password_hash TEXT,
        google_id TEXT,
        anonymous_username TEXT,
        gender TEXT,
        date_of_birth TIMESTAMP,
        country TEXT,
        city TEXT,
        verification_status TEXT,
        ghost_mode_enabled BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // User interests
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_interests (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        interest_name TEXT,
        is_custom BOOLEAN DEFAULT false
      );
    `);

    // Conversations and messages (minimal)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY,
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES users(id),
        content TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Preferences (minimal)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        key TEXT,
        value TEXT
      );
    `);

    // Matches minimal
    await pool.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY,
        user_a UUID REFERENCES users(id),
        user_b UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    logger.info('Migrations completed successfully');
  } catch (err) {
    logger.error('Migration failed', err);
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
