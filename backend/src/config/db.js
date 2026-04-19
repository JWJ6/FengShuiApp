const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL
  ? {
      // Cloud database — strip sslmode from URL and set SSL manually
      connectionString: process.env.DATABASE_URL.replace(/[?&]sslmode=[^&]*/g, ''),
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: false,
    };

poolConfig.max = parseInt(process.env.DB_POOL_MAX || '20', 10);
poolConfig.idleTimeoutMillis = 30000;
poolConfig.connectionTimeoutMillis = 5000;

const pool = new Pool(poolConfig);

// Log pool errors instead of crashing
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

module.exports = pool;
