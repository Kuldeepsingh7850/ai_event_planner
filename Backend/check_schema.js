const db = require('./config/db');

async function run() {
  await db.initDb();
  try {
    const tables = ['users', 'events', 'guests', 'budget', 'expenses', 'tasks', 'vendors', 'feedback', 'notifications'];
    for (const table of tables) {
      const columns = await db.query(`SHOW COLUMNS FROM \`${table}\``);
      console.log(`Table: ${table}`);
      console.log(columns.map(c => c.Field));
      console.log('-----------------------------');
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}
run();
