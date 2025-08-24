const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper function to calculate age
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Helper function to get age group
const getAgeGroup = (age) => {
  if (age >= 14 && age <= 18) return 'MIDDLE';
  if (age >= 19 && age <= 25) return 'HIGH';
  if (age >= 26) return 'PRO';
  return null;
};

// Get all packages
router.get('/packages', async (req, res) => {
  try {
    const connection = await pool.getConnection();

    try {
      const [packages] = await connection.execute(`
        SELECT * FROM packages 
        WHERE is_active = TRUE 
        ORDER BY 
          CASE age_group 
            WHEN 'MIDDLE' THEN 1 
            WHEN 'HIGH' THEN 2 
            WHEN 'PRO' THEN 3 
          END,
          CASE level 
            WHEN 'BASIC' THEN 1 
            WHEN 'PLUS' THEN 2 
            WHEN 'MAX' THEN 3 
          END
      `);

      const formattedPackages = packages.map(pkg => ({
        id: pkg.id,
        category: pkg.category,
        level: pkg.level,
        ageGroup: pkg.age_group,
        price: `${pkg.price_amount} ${pkg.price_currency}`,
        originalPrice: pkg.original_price_amount ? `${pkg.original_price_amount} ${pkg.price_currency}` : null,
        duration: pkg.duration,
        features: JSON.parse(pkg.features || '[]'),
        popular: pkg.is_popular
      }));

      res.json({
        success: true,
        data: { packages: formattedPackages }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get packages filtered by user's age group
router.get('/packages/filtered', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    try {
      // Get user's birth date
      const [users] = await connection.execute(`
        SELECT birth_date FROM users WHERE id = ? AND is_active = TRUE
      `, [req.user.userId]);

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const age = calculateAge(users[0].birth_date);
      const ageGroup = getAgeGroup(age);

      if (!ageGroup) {
        return res.status(400).json({
          success: false,
          message: 'Invalid age group'
        });
      }

      // Get packages for user's age group
      const [packages] = await connection.execute(`
        SELECT * FROM packages 
        WHERE age_group = ? AND is_active = TRUE 
        ORDER BY 
          CASE level 
            WHEN 'BASIC' THEN 1 
            WHEN 'PLUS' THEN 2 
            WHEN 'MAX' THEN 3 
          END
      `, [ageGroup]);

      const formattedPackages = packages.map(pkg => ({
        id: pkg.id,
        category: pkg.category,
        level: pkg.level,
        ageGroup: pkg.age_group,
        price: `${pkg.price_amount} ${pkg.price_currency}`,
        originalPrice: pkg.original_price_amount ? `${pkg.original_price_amount} ${pkg.price_currency}` : null,
        duration: pkg.duration,
        features: JSON.parse(pkg.features || '[]'),
        popular: pkg.is_popular
      }));

      res.json({
        success: true,
        data: { 
          packages: formattedPackages,
          userAge: age,
          ageGroup
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Get filtered packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific package details
router.get('/packages/:packageId', async (req, res) => {
  try {
    const { packageId } = req.params;
    const connection = await pool.getConnection();

    try {
      const [packages] = await connection.execute(`
        SELECT * FROM packages WHERE id = ? AND is_active = TRUE
      `, [packageId]);

      if (packages.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      const pkg = packages[0];
      const formattedPackage = {
        id: pkg.id,
        category: pkg.category,
        level: pkg.level,
        ageGroup: pkg.age_group,
        price: `${pkg.price_amount} ${pkg.price_currency}`,
        priceAmount: pkg.price_amount,
        priceCurrency: pkg.price_currency,
        originalPrice: pkg.original_price_amount ? `${pkg.original_price_amount} ${pkg.price_currency}` : null,
        originalPriceAmount: pkg.original_price_amount,
        duration: pkg.duration,
        features: JSON.parse(pkg.features || '[]'),
        popular: pkg.is_popular
      };

      res.json({
        success: true,
        data: { package: formattedPackage }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Get package details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new assessment (select package)
router.post('/create', authenticateToken, [
  body('packageId').notEmpty().withMessage('Package ID is required')
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

    const { packageId } = req.body;
    const connection = await pool.getConnection();

    try {
      // Verify package exists and is active
      const [packages] = await connection.execute(`
        SELECT * FROM packages WHERE id = ? AND is_active = TRUE
      `, [packageId]);

      if (packages.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      const selectedPackage = packages[0];

      // Verify user's age group matches package
      const [users] = await connection.execute(`
        SELECT birth_date FROM users WHERE id = ? AND is_active = TRUE
      `, [req.user.userId]);

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const age = calculateAge(users[0].birth_date);
      const userAgeGroup = getAgeGroup(age);

      if (userAgeGroup !== selectedPackage.age_group) {
        return res.status(400).json({
          success: false,
          message: 'Selected package is not suitable for your age group'
        });
      }

      // Check if user already has a pending or in-progress assessment
      const [existingAssessments] = await connection.execute(`
        SELECT id FROM assessments 
        WHERE user_id = ? AND status IN ('PENDING', 'IN_PROGRESS')
      `, [req.user.userId]);

      if (existingAssessments.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'You already have a pending or in-progress assessment'
        });
      }

      // Create new assessment
      const [result] = await connection.execute(`
        INSERT INTO assessments (user_id, package_id, status, payment_status)
        VALUES (?, ?, 'PENDING', 'PENDING')
      `, [req.user.userId, packageId]);

      const assessmentId = result.insertId;

      res.status(201).json({
        success: true,
        message: 'Assessment created successfully',
        data: {
          assessmentId,
          package: {
            id: selectedPackage.id,
            category: selectedPackage.category,
            level: selectedPackage.level,
            price: `${selectedPackage.price_amount} ${selectedPackage.price_currency}`,
            duration: selectedPackage.duration,
            features: JSON.parse(selectedPackage.features || '[]')
          }
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's assessments
router.get('/my-assessments', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    try {
      const [assessments] = await connection.execute(`
        SELECT 
          a.id,
          a.package_id,
          a.status,
          a.payment_status,
          a.results,
          a.started_at,
          a.completed_at,
          a.created_at,
          p.category,
          p.level,
          p.age_group,
          p.price_amount,
          p.price_currency,
          p.duration,
          p.features
        FROM assessments a
        JOIN packages p ON a.package_id = p.id
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC
      `, [req.user.userId]);

      const formattedAssessments = assessments.map(assessment => ({
        id: assessment.id,
        packageId: assessment.package_id,
        packageName: `${assessment.category} ${assessment.level}`,
        ageGroup: assessment.age_group,
        status: assessment.status,
        paymentStatus: assessment.payment_status,
        price: `${assessment.price_amount} ${assessment.price_currency}`,
        duration: assessment.duration,
        features: JSON.parse(assessment.features || '[]'),
        results: assessment.results,
        startedAt: assessment.started_at,
        completedAt: assessment.completed_at,
        createdAt: assessment.created_at
      }));

      res.json({
        success: true,
        data: { assessments: formattedAssessments }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Get user assessments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update assessment status
router.put('/:assessmentId/status', authenticateToken, [
  body('status').isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).withMessage('Invalid status')
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

    const { assessmentId } = req.params;
    const { status } = req.body;
    const connection = await pool.getConnection();

    try {
      // Verify assessment belongs to user
      const [assessments] = await connection.execute(`
        SELECT id, status as current_status FROM assessments 
        WHERE id = ? AND user_id = ?
      `, [assessmentId, req.user.userId]);

      if (assessments.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
      }

      const currentStatus = assessments[0].current_status;

      // Update status with appropriate timestamps
      let updateQuery = 'UPDATE assessments SET status = ?, updated_at = CURRENT_TIMESTAMP';
      let updateValues = [status];

      if (status === 'IN_PROGRESS' && currentStatus === 'PENDING') {
        updateQuery += ', started_at = CURRENT_TIMESTAMP';
      } else if (status === 'COMPLETED' && currentStatus === 'IN_PROGRESS') {
        updateQuery += ', completed_at = CURRENT_TIMESTAMP';
      }

      updateQuery += ' WHERE id = ? AND user_id = ?';
      updateValues.push(assessmentId, req.user.userId);

      await connection.execute(updateQuery, updateValues);

      res.json({
        success: true,
        message: 'Assessment status updated successfully'
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Update assessment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Save assessment results
router.put('/:assessmentId/results', authenticateToken, [
  body('results').isObject().withMessage('Results must be an object')
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

    const { assessmentId } = req.params;
    const { results } = req.body;
    const connection = await pool.getConnection();

    try {
      // Verify assessment belongs to user
      const [assessments] = await connection.execute(`
        SELECT id FROM assessments 
        WHERE id = ? AND user_id = ?
      `, [assessmentId, req.user.userId]);

      if (assessments.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
      }

      // Update results
      await connection.execute(`
        UPDATE assessments 
        SET results = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `, [JSON.stringify(results), assessmentId, req.user.userId]);

      res.json({
        success: true,
        message: 'Assessment results saved successfully'
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Save assessment results error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;