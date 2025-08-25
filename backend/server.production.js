const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const https = require('https');
const fs = require('fs');
require('dotenv').config({ path: '.env.production' });

const app = express();
const PORT = process.env.PORT || 5000;

// Import database configuration
const { testConnection, initializeDatabase, insertDefaultPackages, createDefaultAdmin } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const assessmentRoutes = require('./routes/assessments');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');

// Enhanced security middleware for production
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.iyzipay.com"],
      frameSrc: ["'self'", "https://sandbox-iframe.iyzipay.com", "https://iframe.iyzipay.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Enhanced rate limiting for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Stricter CORS for production
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'https://yourdomain.com', // Add your actual domain
    'https://www.yourdomain.com' // Add your actual domain with www
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware with stricter limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// For any non-API request, serve the React app
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SelfMode Backend is running in production mode',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.1'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`${new Date().toISOString()} - Error:`, err.stack);
  
  // Don't expose error details in production
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found' 
  });
});

// Start server based on SSL configuration
const startServer = async () => {
  try {
    // Initialize database (optional for testing)
    if (process.env.DB_HOST && process.env.DB_HOST !== 'your_mysql_host') {
      console.log('\n🔄 Initializing production database...');
      const dbConnected = await testConnection();
      
      if (dbConnected) {
        const dbInitialized = await initializeDatabase();
        if (dbInitialized) {
          console.log('🔄 Inserting default packages...');
          await insertDefaultPackages();
          console.log('🔄 Creating default admin user...');
          await createDefaultAdmin();
          console.log('✅ Production database setup completed successfully!\n');
        } else {
          console.log('❌ Production database initialization failed!\n');
          process.exit(1);
        }
      } else {
        console.log('❌ Production database connection failed! Please check your configuration.\n');
        process.exit(1);
      }
    } else {
      console.log('⚠️ Database connection skipped - using placeholder values\n');
    }

    // Check if SSL certificates exist
    if (process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
      const privateKey = fs.readFileSync(process.env.SSL_KEY_PATH, 'utf8');
      const certificate = fs.readFileSync(process.env.SSL_CERT_PATH, 'utf8');
      const credentials = { key: privateKey, cert: certificate };

      const httpsServer = https.createServer(credentials, app);
      httpsServer.listen(PORT, () => {
        console.log(`🚀 SelfMode Production Backend (HTTPS) is running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV}`);
        console.log(`🔗 Health check: https://localhost:${PORT}/api/health`);
        console.log(`🔒 SSL: Enabled`);
      });
    } else {
      // Start HTTP server (recommended to use reverse proxy like nginx for SSL)
      app.listen(PORT, () => {
        console.log(`🚀 SelfMode Production Backend (HTTP) is running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
        console.log(`⚠️  SSL: Disabled - Use reverse proxy for production SSL`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to start production server:', error);
    process.exit(1);
  }
};

startServer();
