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

    // Enable pgcrypto for gen_random_uuid if available
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

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

    // Conversations and messages (fully featured)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY,
        user_a_id UUID REFERENCES users(id),
        user_b_id UUID REFERENCES users(id),
        is_unlocked BOOLEAN DEFAULT false,
        unlock_type TEXT,
        unlock_cost INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY,
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES users(id),
        message_text TEXT,
        message_type TEXT,
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
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

    // Swipes and profile views
    await pool.query(`
      CREATE TABLE IF NOT EXISTS swipes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        target_user_id UUID REFERENCES users(id),
        swipe_type TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS profile_views (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        viewer_id UUID REFERENCES users(id),
        viewed_user_id UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Matches with mutual flags
    await pool.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_a_id UUID REFERENCES users(id),
        user_b_id UUID REFERENCES users(id),
        user_a_liked BOOLEAN DEFAULT false,
        user_b_liked BOOLEAN DEFAULT false,
        is_mutual_match BOOLEAN DEFAULT false,
        matched_at TIMESTAMP
      );
    `);

    // Blocking, reports
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blocked_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        blocker_id UUID REFERENCES users(id),
        blocked_id UUID REFERENCES users(id),
        block_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reporter_id UUID REFERENCES users(id),
        reported_user_id UUID REFERENCES users(id),
        reason TEXT,
        report_status TEXT DEFAULT 'OPEN',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Economy: pearls and payments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pearls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        amount NUMERIC,
        transaction_type TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        amount NUMERIC,
        currency TEXT,
        payment_method TEXT,
        pearl_amount INTEGER,
        razorpay_order_id TEXT,
        payment_status TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Profile boosts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profile_boosts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        boost_duration_hours INTEGER,
        pearl_cost INTEGER,
        started_at TIMESTAMP,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT false
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
