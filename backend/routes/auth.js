const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');

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

// Register endpoint
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('birthDate').isISO8601().withMessage('Valid birth date is required'),
  body('phone').optional().isMobilePhone()
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, birthDate, phone } = req.body;

    // Calculate age and validate minimum age (14)
    const age = calculateAge(birthDate);
    if (age < 14) {
      return res.status(400).json({
        success: false,
        message: 'Minimum age requirement is 14 years'
      });
    }

    if (age > 100) {
      return res.status(400).json({
        success: false,
        message: 'Maximum age limit is 100 years'
      });
    }

    const connection = await pool.getConnection();

    try {
      // Check if user already exists
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const [result] = await connection.execute(`
        INSERT INTO users (email, password, first_name, last_name, birth_date, phone)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [email, hashedPassword, firstName, lastName, birthDate, phone || null]);

      const userId = result.insertId;

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId, 
          email,
          ageGroup: getAgeGroup(age)
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Store session
      const tokenHash = await bcrypt.hash(token, 10);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await connection.execute(`
        INSERT INTO user_sessions (user_id, token_hash, expires_at)
        VALUES (?, ?, ?)
      `, [userId, tokenHash, expiresAt]);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: userId,
            email,
            firstName,
            lastName,
            birthDate,
            phone,
            ageGroup: getAgeGroup(age)
          },
          token
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// Login endpoint
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
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

    const { email, password } = req.body;
    const connection = await pool.getConnection();

    try {
      // Find user by email
      const [users] = await connection.execute(`
        SELECT id, email, password, first_name, last_name, birth_date, phone, is_active
        FROM users WHERE email = ? AND is_active = TRUE
      `, [email]);

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Calculate age group
      const age = calculateAge(user.birth_date);
      const ageGroup = getAgeGroup(age);

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          ageGroup
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Store session
      const tokenHash = await bcrypt.hash(token, 10);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await connection.execute(`
        INSERT INTO user_sessions (user_id, token_hash, expires_at)
        VALUES (?, ?, ?)
      `, [user.id, tokenHash, expiresAt]);

      // Clean old sessions
      await connection.execute(`
        DELETE FROM user_sessions 
        WHERE user_id = ? AND expires_at < NOW()
      `, [user.id]);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            birthDate: user.birth_date,
            phone: user.phone,
            ageGroup
          },
          token
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const connection = await pool.getConnection();
      
      try {
        // Remove session
        const tokenHash = await bcrypt.hash(token, 10);
        await connection.execute(`
          DELETE FROM user_sessions 
          WHERE user_id = ? AND token_hash = ?
        `, [decoded.userId, tokenHash]);
      } finally {
        connection.release();
      }
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const connection = await pool.getConnection();

    try {
      // Get user details
      const [users] = await connection.execute(`
        SELECT id, email, first_name, last_name, birth_date, phone, is_active
        FROM users WHERE id = ? AND is_active = TRUE
      `, [decoded.userId]);

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = users[0];
      const age = calculateAge(user.birth_date);
      const ageGroup = getAgeGroup(age);

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
            ageGroup
          }
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;