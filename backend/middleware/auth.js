const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if session exists and is valid
    const connection = await pool.getConnection();
    
    try {
      const [sessions] = await connection.execute(`
        SELECT s.*, u.is_active as user_active
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.user_id = ? AND s.expires_at > NOW() AND u.is_active = TRUE
      `, [decoded.userId]);

      if (sessions.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired session'
        });
      }

      // Clean expired sessions
      await connection.execute(`
        DELETE FROM user_sessions WHERE expires_at <= NOW()
      `);

      req.user = decoded;
      next();

    } finally {
      connection.release();
    }

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

module.exports = {
  authenticateToken
};