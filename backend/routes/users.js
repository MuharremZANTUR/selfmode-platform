const express = require('express');
const bcrypt = require('bcryptjs');
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

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    try {
      const [users] = await connection.execute(`
        SELECT id, email, first_name, last_name, birth_date, phone, created_at
        FROM users WHERE id = ? AND is_active = TRUE
      `, [req.user.userId]);

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = users[0];
      const age = calculateAge(user.birth_date);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            birthDate: user.birth_date,
            phone: user.phone,
            age,
            ageGroup: getAgeGroup(age),
            memberSince: user.created_at
          }
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
  body('lastName').optional().trim().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
  body('phone').optional().isMobilePhone(),
  body('birthDate').optional().isISO8601().withMessage('Valid birth date is required')
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

    const { firstName, lastName, phone, birthDate } = req.body;
    const connection = await pool.getConnection();

    try {
      const updates = [];
      const values = [];

      if (firstName !== undefined) {
        updates.push('first_name = ?');
        values.push(firstName);
      }
      if (lastName !== undefined) {
        updates.push('last_name = ?');
        values.push(lastName);
      }
      if (phone !== undefined) {
        updates.push('phone = ?');
        values.push(phone || null);
      }
      if (birthDate !== undefined) {
        const age = calculateAge(birthDate);
        if (age < 14 || age > 100) {
          return res.status(400).json({
            success: false,
            message: 'Age must be between 14 and 100 years'
          });
        }
        updates.push('birth_date = ?');
        values.push(birthDate);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      values.push(req.user.userId);

      await connection.execute(`
        UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND is_active = TRUE
      `, values);

      // Get updated user data
      const [users] = await connection.execute(`
        SELECT id, email, first_name, last_name, birth_date, phone, created_at
        FROM users WHERE id = ? AND is_active = TRUE
      `, [req.user.userId]);

      const user = users[0];
      const age = calculateAge(user.birth_date);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            birthDate: user.birth_date,
            phone: user.phone,
            age,
            ageGroup: getAgeGroup(age),
            memberSince: user.created_at
          }
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Change password
router.put('/password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
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

    const { currentPassword, newPassword } = req.body;
    const connection = await pool.getConnection();

    try {
      // Get current password hash
      const [users] = await connection.execute(`
        SELECT password FROM users WHERE id = ? AND is_active = TRUE
      `, [req.user.userId]);

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await connection.execute(`
        UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND is_active = TRUE
      `, [hashedNewPassword, req.user.userId]);

      // Invalidate all sessions except current one
      await connection.execute(`
        DELETE FROM user_sessions WHERE user_id = ?
      `, [req.user.userId]);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    try {
      // Get user assessments
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
          p.price_amount,
          p.price_currency,
          p.duration
        FROM assessments a
        JOIN packages p ON a.package_id = p.id
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC
      `, [req.user.userId]);

      // Get assessment statistics
      const [stats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_assessments,
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_assessments,
          COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as in_progress_assessments,
          COUNT(CASE WHEN payment_status = 'PAID' THEN 1 END) as paid_assessments
        FROM assessments
        WHERE user_id = ?
      `, [req.user.userId]);

      res.json({
        success: true,
        data: {
          assessments: assessments.map(assessment => ({
            id: assessment.id,
            packageId: assessment.package_id,
            packageName: `${assessment.category} ${assessment.level}`,
            status: assessment.status,
            paymentStatus: assessment.payment_status,
            price: `${assessment.price_amount} ${assessment.price_currency}`,
            duration: assessment.duration,
            results: assessment.results,
            startedAt: assessment.started_at,
            completedAt: assessment.completed_at,
            createdAt: assessment.created_at
          })),
          statistics: stats[0] || {
            total_assessments: 0,
            completed_assessments: 0,
            in_progress_assessments: 0,
            paid_assessments: 0
          }
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete user account
router.delete('/account', authenticateToken, [
  body('password').notEmpty().withMessage('Password is required for account deletion')
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

    const { password } = req.body;
    const connection = await pool.getConnection();

    try {
      // Verify password
      const [users] = await connection.execute(`
        SELECT password FROM users WHERE id = ? AND is_active = TRUE
      `, [req.user.userId]);

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const isValidPassword = await bcrypt.compare(password, users[0].password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Password is incorrect'
        });
      }

      // Soft delete user (set is_active to false)
      await connection.execute(`
        UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [req.user.userId]);

      // Delete all sessions
      await connection.execute(`
        DELETE FROM user_sessions WHERE user_id = ?
      `, [req.user.userId]);

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;