const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const initDatabase = require('./config/initDb');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/report');
const stripeRoutes = require('./routes/stripe');

// --- Validate required env vars ---
const REQUIRED_ENV = ['JWT_SECRET', 'DB_HOST', 'DB_NAME', 'ANTHROPIC_API_KEY'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}
if (process.env.NODE_ENV === 'production') {
  for (const key of ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']) {
    if (!process.env[key] || process.env[key].includes('your_')) {
      console.error(`Missing or placeholder Stripe env var: ${key}`);
      process.exit(1);
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// --- Trust proxy (needed for rate limiting behind Railway/Render proxy) ---
app.set('trust proxy', 1);

// --- Stripe webhook needs raw body — mount BEFORE express.json() ---
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// --- Security Middleware ---
app.use(helmet({
  contentSecurityPolicy: isProduction ? undefined : false, // Disable CSP in dev
  crossOriginEmbedderPolicy: false,
}));

// CORS — restrict to allowed origins
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3001'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// HTTP Parameter Pollution protection
app.use(hpp());

// Global rate limit — 100 requests per 15 minutes per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
}));

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Static uploads — restrict file types served
app.use('/uploads', express.static(uploadsDir, {
  dotfiles: 'deny',
  index: false,
  setHeaders: (res) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cache-Control', 'public, max-age=86400');
  },
}));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stripe', stripeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// --- Global error handler (prevents stack trace leaks) ---
app.use((err, req, res, _next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS: origin not allowed' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: isProduction ? 'Internal server error' : err.message });
});

// --- Graceful shutdown ---
let server;
const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
    // Force exit after 10s
    setTimeout(() => process.exit(1), 10000);
  } else {
    process.exit(0);
  }
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start server
const start = async () => {
  try {
    await initDatabase();
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} [${isProduction ? 'production' : 'development'}]`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
