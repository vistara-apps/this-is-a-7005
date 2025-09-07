import express from 'express';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/init.js';
import { validatePaymentRequest } from '../utils/validation.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent for token deployment
router.post('/create-intent', async (req, res) => {
  try {
    const { error, value } = validatePaymentRequest(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const { tokenConfig, userAddress } = value;
    const db = getDatabase();

    // Create or get user
    let user = await db.getAsync(
      'SELECT * FROM users WHERE walletAddress = ?',
      [userAddress]
    );

    if (!user) {
      const userId = uuidv4();
      await db.runAsync(
        'INSERT INTO users (userId, walletAddress) VALUES (?, ?)',
        [userId, userAddress]
      );
      user = { userId, walletAddress: userAddress };
    }

    // Create deployment record
    const deploymentId = uuidv4();
    await db.runAsync(`
      INSERT INTO token_deployments (
        deploymentId, userId, tokenName, tokenSymbol, 
        totalSupply, decimals, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `, [
      deploymentId,
      user.userId,
      tokenConfig.name,
      tokenConfig.symbol,
      tokenConfig.totalSupply,
      tokenConfig.decimals
    ]);

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2500, // $25.00 in cents
      currency: 'usd',
      metadata: {
        deploymentId,
        userId: user.userId,
        tokenName: tokenConfig.name,
        tokenSymbol: tokenConfig.symbol,
        userAddress
      },
      description: `Token deployment: ${tokenConfig.name} (${tokenConfig.symbol})`
    });

    // Create payment session record
    const sessionId = uuidv4();
    await db.runAsync(`
      INSERT INTO payment_sessions (
        sessionId, userId, deploymentId, stripePaymentIntentId,
        amount, currency, status, paymentMethod
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      sessionId,
      user.userId,
      deploymentId,
      paymentIntent.id,
      2500,
      'usd',
      'pending',
      'stripe'
    ]);

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      deploymentId,
      sessionId,
      amount: 2500
    });

  } catch (error) {
    console.error('Payment intent creation failed:', error);
    res.status(500).json({
      error: 'Payment Intent Creation Failed',
      message: error.message
    });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const db = getDatabase();

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const { deploymentId, userId } = paymentIntent.metadata;

        // Update payment session status
        await db.runAsync(
          'UPDATE payment_sessions SET status = ? WHERE stripePaymentIntentId = ?',
          ['completed', paymentIntent.id]
        );

        // Update deployment status to paid
        await db.runAsync(
          'UPDATE token_deployments SET status = ?, paymentIntentId = ? WHERE deploymentId = ?',
          ['paid', paymentIntent.id, deploymentId]
        );

        console.log(`✅ Payment succeeded for deployment ${deploymentId}`);
        
        // Trigger deployment process (this would typically be a queue job)
        // For now, we'll just log it
        console.log(`🚀 Triggering deployment for ${deploymentId}`);
        
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        const failedDeploymentId = failedPayment.metadata.deploymentId;

        // Update payment session status
        await db.runAsync(
          'UPDATE payment_sessions SET status = ? WHERE stripePaymentIntentId = ?',
          ['failed', failedPayment.id]
        );

        // Update deployment status to failed
        await db.runAsync(
          'UPDATE token_deployments SET status = ? WHERE deploymentId = ?',
          ['payment_failed', failedDeploymentId]
        );

        console.log(`❌ Payment failed for deployment ${failedDeploymentId}`);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get payment status
router.get('/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const db = getDatabase();

    const session = await db.getAsync(`
      SELECT ps.*, td.tokenName, td.tokenSymbol, td.status as deploymentStatus
      FROM payment_sessions ps
      LEFT JOIN token_deployments td ON ps.deploymentId = td.deploymentId
      WHERE ps.sessionId = ?
    `, [sessionId]);

    if (!session) {
      return res.status(404).json({
        error: 'Session Not Found',
        message: 'Payment session not found'
      });
    }

    res.status(200).json({
      success: true,
      session: {
        sessionId: session.sessionId,
        status: session.status,
        amount: session.amount,
        currency: session.currency,
        deploymentId: session.deploymentId,
        deploymentStatus: session.deploymentStatus,
        tokenName: session.tokenName,
        tokenSymbol: session.tokenSymbol,
        createdAt: session.createdAt
      }
    });

  } catch (error) {
    console.error('Payment status check failed:', error);
    res.status(500).json({
      error: 'Status Check Failed',
      message: error.message
    });
  }
});

export default router;
