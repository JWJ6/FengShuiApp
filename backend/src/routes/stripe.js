const express = require('express');
const Stripe = require('stripe');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const REPORT_PRICE_CENTS = 999; // $9.99
const WEB_BASE_URL = process.env.WEB_BASE_URL || 'http://localhost:3001';

// Create Stripe Checkout session for unlocking a report
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const { reportId } = req.body;
    if (!reportId) {
      return res.status(400).json({ error: 'reportId is required' });
    }

    // Verify report exists and belongs to user
    const reportResult = await pool.query(
      'SELECT id, is_paid FROM reports WHERE id = $1 AND user_id = $2',
      [reportId, req.userId]
    );
    if (reportResult.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    if (reportResult.rows[0].is_paid) {
      return res.status(400).json({ error: 'Report already unlocked' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Full Feng Shui Report',
              description: 'Unlock all areas, detailed solutions, and general tips',
            },
            unit_amount: REPORT_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${WEB_BASE_URL}/report/${reportId}?payment=success`,
      cancel_url: `${WEB_BASE_URL}/report/${reportId}?payment=cancelled`,
      metadata: {
        reportId,
        userId: req.userId,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Stripe webhook — called by Stripe when payment completes
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { reportId, userId } = session.metadata;

    if (reportId && userId) {
      try {
        // Record payment
        await pool.query(
          `INSERT INTO payments (user_id, report_id, apple_transaction_id, product_id, amount, status)
           VALUES ($1, $2, $3, $4, $5, 'completed')`,
          [userId, reportId, session.payment_intent, 'stripe_checkout', REPORT_PRICE_CENTS / 100]
        );

        // Unlock report
        await pool.query('UPDATE reports SET is_paid = TRUE WHERE id = $1', [reportId]);
        console.log(`Report ${reportId} unlocked via Stripe`);
      } catch (dbErr) {
        console.error('Failed to unlock report after payment:', dbErr);
      }
    }
  }

  res.json({ received: true });
});

module.exports = router;
