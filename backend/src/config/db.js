const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  // Support DATABASE_URL (Railway/Render) or individual vars
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
  port: process.env.DATABASE_URL ? undefined : (process.env.DB_PORT || 5432),
  database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,
  user: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
  // Connection pool limits
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  // SSL for cloud databases (Neon/Railway/Render require it)
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Log pool errors instead of crashing
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

module.exports = pool;
