const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const appleSignin = require('apple-signin-auth');
const pool = require('../config/db');
const { sendVerificationCode } = require('../services/emailService');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Strict rate limits for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { error: 'Too many attempts, please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Even stricter for email sending (prevent spam)
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 emails per hour per IP
  message: { error: 'Too many verification emails requested, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Send verification code
router.post('/send-code', emailLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query(
      'INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)',
      [email, code, expiresAt]
    );

    await sendVerificationCode(email, code);

    res.json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('Send code error:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Register with email
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, code, name } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!code) {
      return res.status(400).json({ error: 'Verification code is required' });
    }

    // Verify code
    const codeResult = await pool.query(
      `SELECT * FROM verification_codes
       WHERE email = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, code]
    );

    if (codeResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // Mark code as used
    await pool.query(
      'UPDATE verification_codes SET used = TRUE WHERE id = $1',
      [codeResult.rows[0].id]
    );

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, passwordHash, name || email.split('@')[0]]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login with email
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT id, email, name, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    delete user.password_hash;

    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Apple Sign In
router.post('/apple', authLimiter, async (req, res) => {
  try {
    const { identityToken, fullName } = req.body;

    const payload = await appleSignin.verifyIdToken(identityToken, {
      audience: process.env.APPLE_CLIENT_ID,
      ignoreExpiration: false,
    });

    const appleId = payload.sub;
    const email = payload.email;

    // Check if user exists
    let result = await pool.query('SELECT id, email, name FROM users WHERE apple_id = $1', [appleId]);

    if (result.rows.length === 0) {
      // Create new user
      const name = fullName
        ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
        : (email ? email.split('@')[0] : 'User');

      result = await pool.query(
        'INSERT INTO users (apple_id, email, name) VALUES ($1, $2, $3) RETURNING id, email, name',
        [appleId, email, name]
      );
    }

    const user = result.rows[0];
    const token = generateToken(user.id);

    res.json({ user, token });
  } catch (error) {
    console.error('Apple sign-in error:', error);
    res.status(500).json({ error: 'Apple sign-in failed' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, language, created_at FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// Update user language
router.patch('/language', authMiddleware, async (req, res) => {
  try {
    const { language } = req.body;
    const validLanguages = ['zh', 'en', 'ja', 'ko', 'fr'];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    await pool.query('UPDATE users SET language = $1, updated_at = NOW() WHERE id = $2', [
      language,
      req.userId,
    ]);

    res.json({ message: 'Language updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update language' });
  }
});

module.exports = router;
