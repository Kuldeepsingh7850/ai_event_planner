const mysql = require('mysql2/promise');
require('dotenv').config();

async function makeAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error('Please specify an email address. E.g. node make_admin.js email@example.com');
    process.exit(1);
  }

  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ai_event_planner'
  };

  try {
    const conn = await mysql.createConnection(connectionConfig);
    console.log('Connected to MySQL database.');

    const [users] = await conn.query('SELECT id, name, role FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      console.log(`❌ User with email "${email}" not found in database. Please log in or sign up first on the website so the account syncs to MySQL.`);
      await conn.end();
      return;
    }

    const user = users[0];
    if (user.role === 'admin') {
      console.log(`ℹ️ User "${user.name}" (${email}) is already an Admin.`);
    } else {
      await conn.query('UPDATE users SET role = "admin" WHERE id = ?', [user.id]);
      console.log(`✅ Success! User "${user.name}" (${email}) is now an Admin!`);
    }

    await conn.end();
  } catch (error) {
    console.error('❌ Error setting user to admin:', error.message);
  }
}

makeAdmin();
