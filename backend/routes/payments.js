const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { createPaymentForm, verifyPayment, createRefund, getPaymentStatus } = require('../services/iyzico');
const { authenticateToken } = require('../middleware/auth');
const Iyzipay = require('iyzipay');

const router = express.Router();

// Create payment form
router.post('/create', [
  authenticateToken,
  body('packageId').notEmpty().withMessage('Package ID is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('paidPrice').isNumeric().withMessage('Paid price must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { packageId, price, paidPrice } = req.body;
    const userId = req.user.userId;

    // Get user information
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Get package information
    const [packages] = await pool.execute(
      'SELECT * FROM packages WHERE id = ?',
      [packageId]
    );

    if (packages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    const package = packages[0];

    // Create conversation ID
    const conversationId = `payment_${userId}_${Date.now()}`;
    const basketId = `basket_${userId}_${Date.now()}`;

    // Prepare payment data
    const paymentData = {
      conversationId,
      price: price.toString(),
      paidPrice: paidPrice.toString(),
      basketId,
      userId,
      buyerName: user.first_name,
      buyerSurname: user.last_name,
      buyerPhone: user.phone || '+905000000000',
      buyerEmail: user.email,
      buyerIdentityNumber: '11111111111', // Default value
      buyerAddress: 'Turkey', // Default value
      buyerIp: req.ip || '127.0.0.1',
      buyerCity: 'Istanbul', // Default value
      buyerCountry: 'Turkey',
      buyerZipCode: '34000',
      shippingContactName: `${user.first_name} ${user.last_name}`,
      shippingCity: 'Istanbul',
      shippingCountry: 'Turkey',
      shippingAddress: 'Turkey',
      shippingZipCode: '34000',
      billingContactName: `${user.first_name} ${user.last_name}`,
      billingCity: 'Istanbul',
      billingCountry: 'Turkey',
      billingAddress: 'Turkey',
      billingZipCode: '34000',
      basketItems: [
        {
          id: package.id,
          name: `${package.category} - ${package.level}`,
          category1: package.category,
          category2: package.level,
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: price.toString()
        }
      ]
    };

    // Create payment form
    const result = await createPaymentForm(paymentData);

    if (result.status === 'success') {
      // Create assessment record
      await pool.execute(`
        INSERT INTO assessments (user_id, package_id, status, payment_status, created_at)
        VALUES (?, ?, 'PENDING', 'PENDING', NOW())
      `, [userId, packageId]);

      res.json({
        success: true,
        data: {
          paymentFormHtml: result.checkoutFormContent,
          token: result.token,
          conversationId
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment form creation failed',
        error: result.errorMessage
      });
    }
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify payment callback
router.post('/callback', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    // Verify payment with iyzico
    const result = await verifyPayment(token);

    if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
      // Update assessment status
      await pool.execute(`
        UPDATE assessments 
        SET status = 'IN_PROGRESS', 
            payment_status = 'PAID',
            started_at = NOW(),
            updated_at = NOW()
        WHERE id = (
          SELECT id FROM assessments 
          WHERE user_id = ? 
          ORDER BY created_at DESC 
          LIMIT 1
        )
      `, [result.buyerId]);

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          paymentId: result.paymentId,
          status: result.paymentStatus
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        error: result.errorMessage
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get payment status
router.get('/status/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.userId;

    // Get assessment information
    const [assessments] = await pool.execute(`
      SELECT a.*, p.category, p.level, p.age_group
      FROM assessments a
      JOIN packages p ON a.package_id = p.id
      WHERE a.id = ? AND a.user_id = ?
    `, [paymentId, userId]);

    if (assessments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    const assessment = assessments[0];

    res.json({
      success: true,
      data: {
        assessment,
        paymentStatus: assessment.payment_status,
        status: assessment.status
      }
    });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create refund
router.post('/refund/:paymentId', [
  authenticateToken,
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('reason').optional().isString().withMessage('Reason must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { paymentId } = req.params;
    const { amount, reason } = req.body;
    const userId = req.user.userId;

    // Verify user owns this payment
    const [assessments] = await pool.execute(`
      SELECT * FROM assessments WHERE id = ? AND user_id = ?
    `, [paymentId, userId]);

    if (assessments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    const assessment = assessments[0];

    if (assessment.payment_status !== 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Payment must be completed to request refund'
      });
    }

    // Create refund with iyzico
    const result = await createRefund(paymentId, amount, reason);

    if (result.status === 'success') {
      // Update assessment status
      await pool.execute(`
        UPDATE assessments 
        SET payment_status = 'REFUNDED',
            updated_at = NOW()
        WHERE id = ?
      `, [paymentId]);

      res.json({
        success: true,
        message: 'Refund created successfully',
        data: {
          refundId: result.paymentId,
          amount: result.price
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Refund creation failed',
        error: result.errorMessage
      });
    }
  } catch (error) {
    console.error('Refund creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
