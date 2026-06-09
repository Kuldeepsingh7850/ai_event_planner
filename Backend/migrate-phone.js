const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ai_event_planner'
  };

  try {
    const conn = await mysql.createConnection(connectionConfig);
    console.log('✅ Connected to database.');

    // Check if column exists
    const [columns] = await conn.query("SHOW COLUMNS FROM `guests` LIKE 'phone'");
    if (columns.length === 0) {
      await conn.query("ALTER TABLE `guests` ADD COLUMN `phone` VARCHAR(50) DEFAULT NULL");
      console.log('✅ Successfully added phone column to guests table!');
    } else {
      console.log('ℹ️ phone column already exists in guests table.');
    }

    await conn.end();
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  }
}

run();
