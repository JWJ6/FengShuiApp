const pool = require('./db');

const initDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        apple_id VARCHAR(255) UNIQUE,
        name VARCHAR(100),
        language VARCHAR(10) DEFAULT 'zh',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS verification_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        image_urls TEXT[] NOT NULL,
        overall_score INTEGER,
        quick_data JSONB,
        report_data JSONB,
        analysis_status VARCHAR(20) DEFAULT 'quick',
        is_paid BOOLEAN DEFAULT FALSE,
        language VARCHAR(10) DEFAULT 'zh',
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Add columns if table already exists (safe migration)
      DO $$ BEGIN
        ALTER TABLE reports ADD COLUMN IF NOT EXISTS quick_data JSONB;
        ALTER TABLE reports ADD COLUMN IF NOT EXISTS analysis_status VARCHAR(20) DEFAULT 'quick';
      EXCEPTION WHEN OTHERS THEN NULL;
      END $$;

      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
        apple_transaction_id VARCHAR(255),
        product_id VARCHAR(100),
        amount DECIMAL(10,2),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Performance indexes
      CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
      CREATE INDEX IF NOT EXISTS idx_reports_user_created ON reports(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_reports_analysis_status ON reports(analysis_status);
      CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
      CREATE INDEX IF NOT EXISTS idx_payments_report_id ON payments(report_id);
      CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email, expires_at);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_apple_id ON users(apple_id);
    `);
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = initDatabase;
