const mysql = require('mysql2/promise');
require('dotenv').config();

const testDatabaseConnection = async () => {
  console.log('🔍 Testing database connection...');
  console.log('Host:', process.env.DB_HOST);
  console.log('Port:', process.env.DB_PORT);
  console.log('Database:', process.env.DB_NAME);
  console.log('User:', process.env.DB_USER);
  console.log('Password:', process.env.DB_PASSWORD ? '***' : 'NOT SET');

  const configs = [
    // Test 1: With cPanel prefix
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      name: 'cPanel prefixed'
    },
    // Test 2: Without cPanel prefix
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: 'selfmode_app',
      password: process.env.DB_PASSWORD,
      database: 'selfmode_app',
      name: 'without prefix'
    },
    // Test 3: Just connection without database
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      name: 'connection only'
    }
  ];

  for (const config of configs) {
    try {
      console.log(`\n🧪 Testing ${config.name}...`);
      const connection = await mysql.createConnection(config);
      console.log(`✅ ${config.name} connection successful!`);
      
      if (config.database) {
        const [databases] = await connection.execute('SHOW DATABASES');
        console.log('Available databases:', databases.map(db => db.Database).join(', '));
      }
      
      await connection.end();
      return true;
    } catch (error) {
      console.error(`❌ ${config.name} failed:`, error.message);
    }
  }

  return false;
};

testDatabaseConnection().then(() => {
  console.log('\n🏁 Connection test completed');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});