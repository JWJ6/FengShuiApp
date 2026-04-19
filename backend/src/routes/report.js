const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { analyzeQuick, analyzeDetailed } = require('../services/fengShuiService');

const router = express.Router();

// Rate limit report creation (expensive AI calls)
const createReportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 reports per hour
  message: { error: 'Too many reports created, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and HEIC images are allowed'));
    }
  },
});

// Phase 2: Run detailed analysis in background
const runDetailedAnalysis = async (reportId, imagePaths, language, quickResult) => {
  try {
    const detailed = await analyzeDetailed(imagePaths, language, quickResult);

    await pool.query(
      `UPDATE reports SET report_data = $1, analysis_status = 'complete' WHERE id = $2`,
      [JSON.stringify(detailed), reportId]
    );
    console.log(`Detailed analysis complete for report ${reportId}`);
  } catch (error) {
    console.error(`Detailed analysis failed for report ${reportId}:`, error);
    await pool.query(
      `UPDATE reports SET analysis_status = 'failed' WHERE id = $1`,
      [reportId]
    );
  }
};

// Create new report (Phase 1: quick analysis, then background detailed)
router.post('/', authMiddleware, createReportLimiter, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }

    const imagePaths = req.files.map((f) => f.path);
    const imageUrls = req.files.map((f) => `/uploads/${f.filename}`);

    // Get user language preference
    const userResult = await pool.query('SELECT language FROM users WHERE id = $1', [req.userId]);
    const language = req.body.language || userResult.rows[0]?.language || 'zh';

    // Phase 1: Quick analysis (fast, ~3-5 seconds)
    const quickResult = await analyzeQuick(imagePaths, language);

    // Save report with quick data
    const result = await pool.query(
      `INSERT INTO reports (user_id, image_urls, overall_score, quick_data, analysis_status, language)
       VALUES ($1, $2, $3, $4, 'analyzing', $5)
       RETURNING id, overall_score, created_at`,
      [req.userId, imageUrls, quickResult.overall_score, JSON.stringify(quickResult), language]
    );

    const report = result.rows[0];

    // Return quick result immediately
    res.status(201).json({
      id: report.id,
      overall_score: quickResult.overall_score,
      overall_summary: quickResult.overall_summary,
      areas: quickResult.areas,
      analysis_status: 'analyzing',
      is_paid: false,
      created_at: report.created_at,
    });

    // Phase 2: Kick off detailed analysis in background (don't await)
    runDetailedAnalysis(report.id, imagePaths, language, quickResult);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// Check analysis status (for polling)
router.get('/:id/status', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, analysis_status FROM reports WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ id: result.rows[0].id, analysis_status: result.rows[0].analysis_status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check status' });
  }
});

// Get report by ID (respects paid status)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reports WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const report = result.rows[0];
    const isComplete = report.analysis_status === 'complete';
    const analysis = isComplete ? report.report_data : report.quick_data;

    if (!analysis) {
      return res.json({
        id: report.id,
        overall_score: report.overall_score,
        analysis_status: report.analysis_status,
        is_paid: report.is_paid,
        image_urls: report.image_urls,
        created_at: report.created_at,
      });
    }

    if (report.is_paid && isComplete) {
      // Full report
      res.json({
        id: report.id,
        overall_score: analysis.overall_score,
        overall_summary: analysis.overall_summary,
        areas: analysis.areas,
        general_tips: analysis.general_tips,
        analysis_status: report.analysis_status,
        is_paid: true,
        image_urls: report.image_urls,
        created_at: report.created_at,
      });
    } else if (isComplete) {
      // Free portion of detailed report
      res.json({
        id: report.id,
        overall_score: analysis.overall_score,
        overall_summary: analysis.overall_summary,
        first_area: analysis.areas[0]
          ? {
              name: analysis.areas[0].name,
              score: analysis.areas[0].score,
              issues: analysis.areas[0].issues.map((issue) => ({
                description: issue.description,
                impact: issue.impact,
                severity: issue.severity,
                solution: issue.solution,
              })),
              positives: analysis.areas[0].positives,
            }
          : null,
        total_areas: analysis.areas.length,
        locked_areas: analysis.areas.slice(1).map((a) => ({
          name: a.name,
          score: a.score,
          issue_count: a.issues?.length || 0,
          preview: a.issues?.[0]?.description ? a.issues[0].description.slice(0, 80) + '...' : '',
        })),
        analysis_status: report.analysis_status,
        is_paid: false,
        image_urls: report.image_urls,
        created_at: report.created_at,
      });
    } else {
      // Quick data only (still analyzing or failed)
      res.json({
        id: report.id,
        overall_score: analysis.overall_score,
        overall_summary: analysis.overall_summary,
        areas: analysis.areas,
        analysis_status: report.analysis_status,
        is_paid: false,
        image_urls: report.image_urls,
        created_at: report.created_at,
      });
    }
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to get report' });
  }
});

// Get all reports for user (list view, paginated)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const [countResult, result] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM reports WHERE user_id = $1', [req.userId]),
      pool.query(
        `SELECT id, overall_score, is_paid, analysis_status, language, image_urls, created_at
         FROM reports WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [req.userId, limit, offset]
      ),
    ]);

    res.json({
      reports: result.rows,
      pagination: { page, limit, total: parseInt(countResult.rows[0].count) },
    });
  } catch (error) {
    console.error('List reports error:', error);
    res.status(500).json({ error: 'Failed to list reports' });
  }
});

// Unlock report — disabled until Apple receipt verification is implemented
// Web payments are handled via Stripe webhook (routes/stripe.js)
router.post('/:id/unlock', authMiddleware, async (req, res) => {
  res.status(501).json({ error: 'Apple IAP unlock not available. Please use web checkout.' });
});

module.exports = router;
