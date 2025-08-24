const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Admin middleware - sadece admin kullanıcılar erişebilir
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Admin erişimi gerekli' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const adminUser = await query('SELECT * FROM users WHERE id = ? AND role = "admin"', [decoded.userId]);
    
    if (!adminUser || adminUser.length === 0) {
      return res.status(403).json({ success: false, message: 'Admin yetkisi yok' });
    }

    req.user = adminUser[0];
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Geçersiz admin token' });
  }
};

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Admin kullanıcıyı bul
    const adminUsers = await query('SELECT * FROM users WHERE email = ? AND role = "admin"', [email]);
    
    if (!adminUsers || adminUsers.length === 0) {
      return res.status(401).json({ success: false, message: 'Admin kullanıcı bulunamadı' });
    }

    const adminUser = adminUsers[0];
    
    // Şifre kontrolü
    const isValidPassword = await bcrypt.compare(password, adminUser.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Hatalı şifre' });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { userId: adminUser.id, role: 'admin' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Admin girişi başarılı',
      token,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Admin giriş hatası' });
  }
});

// Admin token verify
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token bulunamadı' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const adminUser = await query('SELECT * FROM users WHERE id = ? AND role = "admin"', [decoded.userId]);
    
    if (!adminUser || adminUser.length === 0) {
      return res.status(403).json({ success: false, message: 'Admin yetkisi yok' });
    }

    res.json({
      success: true,
      user: {
        id: adminUser[0].id,
        email: adminUser[0].email,
        role: adminUser[0].role
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Geçersiz token' });
  }
});

// Tüm kullanıcıları getir (admin yetkisi gerekli)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await query(`
      SELECT 
        u.*,
        ua.last_login,
        ua.login_count,
        ua.test_completed,
        ua.test_completed_at,
        ua.report_generated,
        ua.report_generated_at,
        ua.report_downloaded,
        ua.report_downloaded_at,
        ua.created_at as user_created_at
      FROM users u
      LEFT JOIN user_activity ua ON u.id = ua.user_id
      WHERE u.role != 'admin'
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      users: users || [],
      total: users?.length || 0
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ success: false, message: 'Kullanıcılar getirilemedi' });
  }
});

// Kullanıcı detayını getir
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const userDetails = await query(`
      SELECT 
        u.*,
        ua.*,
        ur.assessment_result,
        ur.personality_type,
        ur.career_suggestions,
        ur.report_data
      FROM users u
      LEFT JOIN user_activity ua ON u.id = ua.user_id
      LEFT JOIN user_reports ur ON u.id = ur.user_id
      WHERE u.id = ? AND u.role != 'admin'
    `, [id]);

    if (!userDetails || userDetails.length === 0) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    res.json({
      success: true,
      user: userDetails[0]
    });
  } catch (error) {
    console.error('Admin get user detail error:', error);
    res.status(500).json({ success: false, message: 'Kullanıcı detayı getirilemedi' });
  }
});

// Dashboard istatistikleri
router.get('/dashboard/stats', adminAuth, async (req, res) => {
  try {
    // Toplam kullanıcı sayısı
    const totalUsers = await query('SELECT COUNT(*) as count FROM users WHERE role != "admin"');
    
    // Aktif kullanıcılar (son 30 gün)
    const activeUsers = await query(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM user_activity 
      WHERE last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    // Test tamamlayan kullanıcılar
    const testCompleted = await query(`
      SELECT COUNT(*) as count 
      FROM user_activity 
      WHERE test_completed = 1
    `);
    
    // Rapor indiren kullanıcılar
    const reportDownloaded = await query(`
      SELECT COUNT(*) as count 
      FROM user_activity 
      WHERE report_downloaded = 1
    `);

    // Son 7 günün kayıt istatistikleri
    const recentRegistrations = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users 
      WHERE role != 'admin' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers[0]?.count || 0,
        activeUsers: activeUsers[0]?.count || 0,
        testCompleted: testCompleted[0]?.count || 0,
        reportDownloaded: reportDownloaded[0]?.count || 0,
        recentRegistrations: recentRegistrations || []
      }
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'İstatistikler getirilemedi' });
  }
});

// Kullanıcı aktivitesini güncelle
router.put('/users/:id/activity', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { test_completed, report_downloaded } = req.body;

    await query(`
      UPDATE user_activity 
      SET 
        test_completed = ?,
        test_completed_at = CASE WHEN ? = 1 THEN NOW() ELSE test_completed_at END,
        report_downloaded = ?,
        report_downloaded_at = CASE WHEN ? = 1 THEN NOW() ELSE report_downloaded_at END
      WHERE user_id = ?
    `, [test_completed, test_completed, report_downloaded, report_downloaded, id]);

    res.json({
      success: true,
      message: 'Kullanıcı aktivitesi güncellendi'
    });
  } catch (error) {
    console.error('Admin update user activity error:', error);
    res.status(500).json({ success: false, message: 'Kullanıcı aktivitesi güncellenemedi' });
  }
});

module.exports = router;