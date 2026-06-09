const db = require('./config/db');
async function check() {
  await db.initDb();
  try {
    const notifications = await db.query('SELECT * FROM notifications');
    console.log('Notifications in Database:', JSON.stringify(notifications, null, 2));
  } catch (e) {
    console.error('Error fetching notifications:', e.message);
  }
  process.exit(0);
}
check();
