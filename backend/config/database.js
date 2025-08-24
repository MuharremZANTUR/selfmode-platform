const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'selfmode_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        birth_date DATE NOT NULL,
        phone VARCHAR(20),
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create packages table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS packages (
        id VARCHAR(50) PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        level VARCHAR(50) NOT NULL,
        age_group ENUM('MIDDLE', 'HIGH', 'PRO') NOT NULL,
        price_amount DECIMAL(10,2) NOT NULL,
        price_currency VARCHAR(10) DEFAULT 'TRY',
        original_price_amount DECIMAL(10,2),
        duration VARCHAR(100) NOT NULL,
        features JSON,
        is_popular BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_age_group (age_group),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create assessments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS assessments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        package_id VARCHAR(50) NOT NULL,
        status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
        payment_status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
        results JSON,
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (package_id) REFERENCES packages(id),
        INDEX idx_user_id (user_id),
        INDEX idx_package_id (package_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create user_sessions table for JWT token management
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_token_hash (token_hash),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create user_activity table for admin tracking
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_activity (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        last_login TIMESTAMP NULL,
        login_count INT DEFAULT 0,
        test_completed BOOLEAN DEFAULT FALSE,
        test_completed_at TIMESTAMP NULL,
        report_generated BOOLEAN DEFAULT FALSE,
        report_generated_at TIMESTAMP NULL,
        report_downloaded BOOLEAN DEFAULT FALSE,
        report_downloaded_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_test_completed (test_completed),
        INDEX idx_report_downloaded (report_downloaded)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create user_reports table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_reports (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        assessment_id INT,
        assessment_result JSON,
        personality_type VARCHAR(100),
        career_suggestions JSON,
        report_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_assessment_id (assessment_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Database tables initialized successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
};

// Insert default packages data
const insertDefaultPackages = async () => {
  try {
    const connection = await pool.getConnection();
    
    const packages = [
      // MIDDLE (14-18) packages
      {
        id: 'middle_basic',
        category: 'MIDDLE',
        level: 'BASIC',
        age_group: 'MIDDLE',
        price_amount: 500.00,
        original_price_amount: 1000.00,
        duration: '45 dakika',
        features: JSON.stringify([
          '5 Temel Yetenek Testi',
          'Kişilik Analizi',
          'Temel Meslek Önerileri',
          'PDF Rapor'
        ]),
        is_popular: false
      },
      {
        id: 'middle_plus',
        category: 'MIDDLE',
        level: 'PLUS',
        age_group: 'MIDDLE',
        price_amount: 1000.00,
        original_price_amount: 2000.00,
        duration: '75 dakika',
        features: JSON.stringify([
          '8 Detaylı Yetenek Testi',
          'Kapsamlı Kişilik Analizi',
          'Lise Branş Önerileri',
          'Üniversite Bölüm Rehberi',
          'Detaylı PDF Rapor',
          '30 Dakika Online Danışmanlık'
        ]),
        is_popular: true
      },
      {
        id: 'middle_max',
        category: 'MIDDLE',
        level: 'MAX',
        age_group: 'MIDDLE',
        price_amount: 2000.00,
        original_price_amount: 4000.00,
        duration: '120 dakika',
        features: JSON.stringify([
          '12 Kapsamlı Test',
          'AI Destekli Analiz',
          'Gelecek Meslek Trendleri',
          'Üniversite Tercih Rehberi',
          'Premium PDF + Video Rapor',
          '60 Dakika Uzman Danışmanlığı',
          '3 Ay Takip Desteği'
        ]),
        is_popular: false
      },
      // HIGH (19-25) packages
      {
        id: 'high_basic',
        category: 'HIGH',
        level: 'BASIC',
        age_group: 'HIGH',
        price_amount: 1000.00,
        original_price_amount: 2000.00,
        duration: '60 dakika',
        features: JSON.stringify([
          '6 Üniversite Odaklı Test',
          'Kariyer Yönlendirme',
          'Staj & İş Önerileri',
          'PDF Rapor'
        ]),
        is_popular: false
      },
      {
        id: 'high_plus',
        category: 'HIGH',
        level: 'PLUS',
        age_group: 'HIGH',
        price_amount: 2500.00,
        original_price_amount: 5000.00,
        duration: '90 dakika',
        features: JSON.stringify([
          '10 Profesyonel Test',
          'Sektör Analizi',
          'CV & LinkedIn Optimizasyonu',
          'Mülakat Hazırlık Rehberi',
          'Detaylı PDF Rapor',
          '45 Dakika Kariyer Danışmanlığı'
        ]),
        is_popular: true
      },
      {
        id: 'high_max',
        category: 'HIGH',
        level: 'MAX',
        age_group: 'HIGH',
        price_amount: 5000.00,
        original_price_amount: 10000.00,
        duration: '150 dakika',
        features: JSON.stringify([
          '15 Kapsamlı Test',
          'AI Kariyer Rehberi',
          'Kişisel Marka Stratejisi',
          'Network Önerileri',
          'Premium Rapor Paketi',
          '90 Dakika Uzman Mentorluk',
          '6 Ay Kariyer Takibi'
        ]),
        is_popular: false
      },
      // PRO (26+) packages
      {
        id: 'pro_basic',
        category: 'PRO',
        level: 'BASIC',
        age_group: 'PRO',
        price_amount: 2500.00,
        original_price_amount: 5000.00,
        duration: '75 dakika',
        features: JSON.stringify([
          '7 Profesyonel Değerlendirme',
          'Kariyer Geçiş Analizi',
          'Leadership Potansiyeli',
          'PDF Rapor'
        ]),
        is_popular: false
      },
      {
        id: 'pro_plus',
        category: 'PRO',
        level: 'PLUS',
        age_group: 'PRO',
        price_amount: 5000.00,
        original_price_amount: 10000.00,
        duration: '105 dakika',
        features: JSON.stringify([
          '12 Executive Test',
          'Yöneticilik Değerlendirmesi',
          'Girişimcilik Analizi',
          'Kariyer Pivot Stratejisi',
          'Premium PDF Rapor',
          '60 Dakika Executive Coaching'
        ]),
        is_popular: true
      },
      {
        id: 'pro_max',
        category: 'PRO',
        level: 'MAX',
        age_group: 'PRO',
        price_amount: 10000.00,
        original_price_amount: 20000.00,
        duration: '180 dakika',
        features: JSON.stringify([
          '18 Kapsamlı Değerlendirme',
          'AI Executive Analiz',
          'C-Suite Hazırlık',
          'Personal Branding Strategy',
          'VIP Rapor Paketi',
          '120 Dakika C-Level Mentorluk',
          '12 Ay Premium Takip'
        ]),
        is_popular: false
      }
    ];

    // Insert packages with INSERT IGNORE to avoid duplicates
    for (const pkg of packages) {
      await connection.execute(`
        INSERT IGNORE INTO packages (
          id, category, level, age_group, price_amount, original_price_amount,
          duration, features, is_popular, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        pkg.id, pkg.category, pkg.level, pkg.age_group,
        pkg.price_amount, pkg.original_price_amount, pkg.duration,
        pkg.features, pkg.is_popular, true
      ]);
    }

    console.log('✅ Default packages inserted successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Failed to insert default packages:', error.message);
    return false;
  }
};

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Check if admin already exists
    const [existingAdmin] = await connection.execute(
      'SELECT id FROM users WHERE role = "admin" LIMIT 1'
    );
    
    if (existingAdmin.length > 0) {
      console.log('✅ Admin user already exists');
      connection.release();
      return true;
    }
    
    // Create default admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await connection.execute(`
      INSERT INTO users (email, password, first_name, last_name, birth_date, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      'admin@selfmode.app',
      hashedPassword,
      'Admin',
      'User',
      '1990-01-01',
      'admin'
    ]);
    
    console.log('✅ Default admin user created: admin@selfmode.app / admin123');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  query: async (sql, params) => {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  testConnection,
  initializeDatabase,
  insertDefaultPackages,
  createDefaultAdmin
};