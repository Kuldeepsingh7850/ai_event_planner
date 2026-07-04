const mysql = require('mysql2/promise');
require('dotenv').config();

let pool = null;
let useMock = false;

// Mock database storage to allow the app to run without MySQL setup
const mockDb = {
  users: [
    { id: 1, name: 'System Administrator', email: 'admin@eventplanner.com', password: '$2a$10$oD6mhCiS4LjXcvohp09.5utMn8Pw2s9FlJ5/QBmTUEnC9.Jru/Gly', role: 'admin', status: 'active', avatar: null, created_at: new Date() },
    { id: 2, name: 'John Doe', email: 'john@gmail.com', password: '$2a$10$m0GWB4B8r/XXzJ0tusxemOiFmlLRZUUmUf73wIETwvwYWIkZEktV.', role: 'user', status: 'active', avatar: null, created_at: new Date() }
  ],
  events: [
    { id: 1, user_id: 2, title: 'Annual College Farewell 2026', event_type: 'Farewell', date: '2026-06-15', time: '16:00:00', location: 'Main Campus Auditorium', budget: 50000.00, guest_count: 200, status: 'planning', theme: 'Royal / Traditional', created_at: new Date() }
  ],
  guests: [
    { id: 1, event_id: 1, guest_name: 'Prof. Alan Turing', email: 'turing@univ.edu', status: 'confirmed' },
    { id: 2, event_id: 1, guest_name: 'Dr. Grace Hopper', email: 'hopper@univ.edu', status: 'pending' },
    { id: 3, event_id: 1, guest_name: 'Steve Jobs', email: 'steve@apple.com', status: 'declined' }
  ],
  budget: [
    { id: 1, event_id: 1, total_budget: 50000.00, expenses: 15000.00, remaining_budget: 35000.00 }
  ],
  expenses: [
    { id: 1, event_id: 1, title: 'Auditorium Booking Deposit', amount: 10000.00, category: 'Venue', date: '2026-05-20' },
    { id: 2, event_id: 1, title: 'Stage Decoration Advance', amount: 5000.00, category: 'Decor', date: '2026-05-21' }
  ],
  tasks: [
    { id: 1, event_id: 1, title: 'Book caterer for dinner buffet', deadline: '2026-06-01', status: 'pending' },
    { id: 2, event_id: 1, title: 'Send digital invitations to seniors', deadline: '2026-05-30', status: 'completed' },
    { id: 3, event_id: 1, title: 'Coordinate playlist with photographer/DJ', deadline: '2026-06-10', status: 'pending' }
  ],
  vendors: [
    { id: 1, event_id: 1, vendor_name: 'Delicious Bites Catering', category: 'Caterer', contact: '+1-555-0199', cost: 25000.00, status: 'contacted' },
    { id: 2, event_id: 1, vendor_name: 'Epic Moments Photography', category: 'Photographer', contact: '+1-555-0188', cost: 12000.00, status: 'hired' }
  ],
  feedback: [
    { id: 1, user_id: 2, rating: 5, comment: 'Absolutely love the AI generation features! Saved me hours of timeline drafting.', created_at: new Date() }
  ],
  notifications: [
    { id: 1, user_id: 2, message: 'Your budget for Annual College Farewell 2026 has been successfully updated.', status: 'unread', created_at: new Date() },
    { id: 2, user_id: 2, message: 'Reminder: Task "Send digital invitations to seniors" has been marked completed.', status: 'unread', created_at: new Date() }
  ]
};

// Auto-increment counters
const counters = {
  users: 3,
  events: 2,
  guests: 4,
  budget: 2,
  expenses: 3,
  tasks: 4,
  vendors: 3,
  feedback: 2,
  notifications: 3
};

// Check database connection and initialize
const initDb = async () => {
  if (process.env.FORCE_MOCK_DB === 'true') {
    console.warn('⚠️ FORCE_MOCK_DB is enabled. Running with in-memory Mock Database.');
    useMock = true;
    return;
  }

  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ai_event_planner',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test the connection
    const conn = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully!');
    
    // Auto-update schema to support reset token
    try {
      const [columns] = await conn.query("SHOW COLUMNS FROM `users` LIKE 'reset_token'");
      if (columns.length === 0) {
        await conn.query("ALTER TABLE `users` ADD COLUMN `reset_token` VARCHAR(255) DEFAULT NULL");
        await conn.query("ALTER TABLE `users` ADD COLUMN `reset_token_expiry` TIMESTAMP NULL DEFAULT NULL");
        console.log("✅ Successfully updated users table schema for password resets");
      }
    } catch (schemaErr) {
      console.warn("⚠️ Could not auto-verify or alter users table schema:", schemaErr.message);
    }

    // Auto-update schema to support phone number on users
    try {
      const [columns] = await conn.query("SHOW COLUMNS FROM `users` LIKE 'phone'");
      if (columns.length === 0) {
        await conn.query("ALTER TABLE `users` ADD COLUMN `phone` VARCHAR(50) DEFAULT NULL");
        console.log("✅ Successfully updated users table schema for phone contact");
      }
    } catch (schemaErr) {
      console.warn("⚠️ Could not auto-verify or alter users table schema for phone:", schemaErr.message);
    }

    // Auto-update schema to support avatar on users
    try {
      const [columns] = await conn.query("SHOW COLUMNS FROM `users` LIKE 'avatar'");
      if (columns.length === 0) {
        await conn.query("ALTER TABLE `users` ADD COLUMN `avatar` VARCHAR(255) DEFAULT NULL");
        console.log("✅ Successfully updated users table schema for avatar column");
      }
    } catch (schemaErr) {
      console.warn("⚠️ Could not auto-verify or alter users table schema for avatar:", schemaErr.message);
    }

    try {
      const [columns] = await conn.query("SHOW COLUMNS FROM `guests` LIKE 'phone'");
      if (columns.length === 0) {
        await conn.query("ALTER TABLE `guests` ADD COLUMN `phone` VARCHAR(50) DEFAULT NULL");
        console.log("✅ Successfully updated guests table schema for phone contact");
      }
    } catch (schemaErr) {
      console.warn("⚠️ Could not auto-verify or alter guests table schema:", schemaErr.message);
    }

    try {
      const [columns] = await conn.query("SHOW COLUMNS FROM `events` LIKE 'theme'");
      if (columns.length === 0) {
        await conn.query("ALTER TABLE `events` ADD COLUMN `theme` VARCHAR(255) DEFAULT 'Royal / Traditional'");
        console.log("✅ Successfully updated events table schema for theme column");
      }
    } catch (schemaErr) {
      console.warn("⚠️ Could not auto-verify or alter events table schema:", schemaErr.message);
    }

    // Auto-update schema to drop created_at columns from expenses, guests, tasks, vendors
    const tablesToDropCreatedAt = ['expenses', 'guests', 'tasks', 'vendors'];
    for (const tableName of tablesToDropCreatedAt) {
      try {
        const [columns] = await conn.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE 'created_at'`);
        if (columns.length > 0) {
          await conn.query(`ALTER TABLE \`${tableName}\` DROP COLUMN \`created_at\``);
          console.log(`✅ Successfully dropped created_at column from ${tableName} table`);
        }
      } catch (dropErr) {
        console.warn(`⚠️ Could not drop created_at from ${tableName}:`, dropErr.message);
      }
    }
    
    conn.release();
  } catch (error) {
    console.warn('⚠️ Failed to connect to MySQL database:', error.message);
    console.warn('⚠️ Falling back to in-memory Mock Database. Event creation, tasks, guests, budgets, vendors, notifications, and feedbacks will persist in-memory while the server runs.');
    useMock = true;
  }
};

// Standard query runner
const query = async (sql, params = []) => {
  if (useMock) {
    return handleMockQuery(sql, params);
  }

  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (err) {
    console.error('Database query error:', err.message);
    throw err;
  }
};

// Handle in-memory database queries by basic regex matching
const handleMockQuery = (sql, params) => {
  const normalizedSql = sql.replace(/\s+/g, ' ').trim().toLowerCase();

  // 1. SELECT operations
  if (normalizedSql.startsWith('select')) {
    // USERS select
    if (normalizedSql.includes('from users')) {
      if (normalizedSql.includes('where email = ?')) {
        const email = params[0];
        const user = mockDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        return user ? [user] : [];
      }
      if (normalizedSql.includes('where id = ?')) {
        const id = parseInt(params[0]);
        const user = mockDb.users.find(u => u.id === id);
        return user ? [user] : [];
      }
      if (normalizedSql.includes('where reset_token = ?')) {
        const token = params[0];
        const user = mockDb.users.find(u => u.reset_token === token);
        return user ? [user] : [];
      }
      return mockDb.users;
    }

    // EVENTS select
    if (normalizedSql.includes('from events')) {
      const getEnhancedEvent = (e) => {
        const b = mockDb.budget.find(bg => bg.event_id === e.id);
        const u = mockDb.users.find(usr => usr.id === e.user_id);
        return {
          ...e,
          user_name: u ? u.name : 'Unknown User',
          user_email: u ? u.email : '',
          expenses: b ? parseFloat(b.expenses) : 0.00,
          remaining_budget: b ? parseFloat(b.remaining_budget) : parseFloat(e.budget)
        };
      };
      if (normalizedSql.includes('user_id = ?')) {
        const userId = parseInt(params[0]);
        return mockDb.events.filter(e => e.user_id === userId).map(getEnhancedEvent);
      }
      if (normalizedSql.includes('where id = ?')) {
        const id = parseInt(params[0]);
        const event = mockDb.events.find(e => e.id === id);
        return event ? [getEnhancedEvent(event)] : [];
      }
      return mockDb.events.map(getEnhancedEvent);
    }

    // GUESTS select
    if (normalizedSql.includes('from guests')) {
      if (normalizedSql.includes('where event_id = ?')) {
        const eventId = parseInt(params[0]);
        return mockDb.guests.filter(g => g.event_id === eventId);
      }
      return mockDb.guests;
    }

    // BUDGET select
    if (normalizedSql.includes('from budget')) {
      if (normalizedSql.includes('where event_id = ?')) {
        const eventId = parseInt(params[0]);
        const b = mockDb.budget.find(b => b.event_id === eventId);
        return b ? [b] : [];
      }
      return mockDb.budget;
    }

    // EXPENSES select
    if (normalizedSql.includes('from expenses')) {
      if (normalizedSql.includes('where event_id = ?')) {
        const eventId = parseInt(params[0]);
        return mockDb.expenses.filter(ex => ex.event_id === eventId);
      }
      return mockDb.expenses;
    }

    // TASKS select
    if (normalizedSql.includes('from tasks')) {
      if (normalizedSql.includes('where event_id = ?')) {
        const eventId = parseInt(params[0]);
        return mockDb.tasks.filter(t => t.event_id === eventId);
      }
      return mockDb.tasks;
    }

    // VENDORS select
    if (normalizedSql.includes('from vendors')) {
      if (normalizedSql.includes('where event_id = ?')) {
        const eventId = parseInt(params[0]);
        return mockDb.vendors.filter(v => v.event_id === eventId);
      }
      return mockDb.vendors;
    }

    // FEEDBACK select
    if (normalizedSql.includes('from feedback')) {
      // Return details with user names
      return mockDb.feedback.map(f => {
        const user = mockDb.users.find(u => u.id === f.user_id);
        return {
          ...f,
          name: user ? user.name : 'Unknown User',
          email: user ? user.email : ''
        };
      });
    }

    // NOTIFICATIONS select
    if (normalizedSql.includes('from notifications')) {
      if (normalizedSql.includes('user_id = ?')) {
        const userId = parseInt(params[0]);
        return mockDb.notifications
          .filter(n => n.user_id === userId)
          .sort((a, b) => b.created_at - a.created_at);
      }
      return mockDb.notifications;
    }
  }

  // 2. INSERT operations
  if (normalizedSql.startsWith('insert into')) {
    // USERS insert
    if (normalizedSql.includes('insert into users')) {
      const newUser = {
        id: counters.users++,
        name: params[0],
        email: params[1],
        password: params[2],
        role: params[3] || 'user',
        status: 'active',
        avatar: null,
        created_at: new Date()
      };
      mockDb.users.push(newUser);
      return { insertId: newUser.id, affectedRows: 1 };
    }

    // EVENTS insert
    if (normalizedSql.includes('insert into events')) {
      const newEvent = {
        id: counters.events++,
        user_id: parseInt(params[0]),
        title: params[1],
        event_type: params[2],
        date: params[3],
        time: params[4],
        location: params[5],
        budget: parseFloat(params[6]),
        guest_count: parseInt(params[7]),
        status: params[8] || 'planning',
        theme: params[9] || 'Royal / Traditional',
        created_at: new Date()
      };
      mockDb.events.push(newEvent);

      // Automatically create budget entry when event is created
      const newBudget = {
        id: counters.budget++,
        event_id: newEvent.id,
        total_budget: newEvent.budget,
        expenses: 0.00,
        remaining_budget: newEvent.budget
      };
      mockDb.budget.push(newBudget);

      return { insertId: newEvent.id, affectedRows: 1 };
    }

    // GUESTS insert
    if (normalizedSql.includes('insert into guests')) {
      const newGuest = {
        id: counters.guests++,
        event_id: parseInt(params[0]),
        guest_name: params[1],
        email: params[2],
        phone: params[3] || null,
        status: params[4] || 'pending'
      };
      mockDb.guests.push(newGuest);
      return { insertId: newGuest.id, affectedRows: 1 };
    }

    // BUDGET insert
    if (normalizedSql.includes('insert into budget')) {
      const newBudget = {
        id: counters.budget++,
        event_id: parseInt(params[0]),
        total_budget: parseFloat(params[1]),
        expenses: parseFloat(params[2] || 0),
        remaining_budget: parseFloat(params[3])
      };
      mockDb.budget.push(newBudget);
      return { insertId: newBudget.id, affectedRows: 1 };
    }

    // EXPENSES insert
    if (normalizedSql.includes('insert into expenses')) {
      const eventId = parseInt(params[0]);
      const newExpense = {
        id: counters.expenses++,
        event_id: eventId,
        title: params[1],
        amount: parseFloat(params[2]),
        category: params[3],
        date: params[4]
      };
      mockDb.expenses.push(newExpense);

      // Recalculate total budget remaining
      const bIdx = mockDb.budget.findIndex(b => b.event_id === eventId);
      if (bIdx !== -1) {
        mockDb.budget[bIdx].expenses = parseFloat(mockDb.budget[bIdx].expenses) + newExpense.amount;
        mockDb.budget[bIdx].remaining_budget = mockDb.budget[bIdx].total_budget - mockDb.budget[bIdx].expenses;
      }

      return { insertId: newExpense.id, affectedRows: 1 };
    }

    // TASKS insert
    if (normalizedSql.includes('insert into tasks')) {
      const newTask = {
        id: counters.tasks++,
        event_id: parseInt(params[0]),
        title: params[1],
        deadline: params[2],
        status: params[3] || 'pending'
      };
      mockDb.tasks.push(newTask);
      return { insertId: newTask.id, affectedRows: 1 };
    }

    // VENDORS insert
    if (normalizedSql.includes('insert into vendors')) {
      const newVendor = {
        id: counters.vendors++,
        event_id: parseInt(params[0]),
        vendor_name: params[1],
        category: params[2],
        contact: params[3],
        cost: parseFloat(params[4] || 0),
        status: params[5] || 'contacted'
      };
      mockDb.vendors.push(newVendor);
      return { insertId: newVendor.id, affectedRows: 1 };
    }

    // FEEDBACK insert
    if (normalizedSql.includes('insert into feedback')) {
      const newFeedback = {
        id: counters.feedback++,
        user_id: parseInt(params[0]),
        rating: parseInt(params[1]),
        comment: params[2],
        created_at: new Date()
      };
      mockDb.feedback.push(newFeedback);
      return { insertId: newFeedback.id, affectedRows: 1 };
    }

    // NOTIFICATIONS insert
    if (normalizedSql.includes('insert into notifications')) {
      const newNotif = {
        id: counters.notifications++,
        user_id: parseInt(params[0]),
        message: params[1],
        status: params[2] || 'unread',
        created_at: new Date()
      };
      mockDb.notifications.push(newNotif);
      return { insertId: newNotif.id, affectedRows: 1 };
    }
  }

  // 3. UPDATE operations
  if (normalizedSql.startsWith('update')) {
    // USERS role update
    if (normalizedSql.includes('update users set role = ?')) {
      const role = params[0];
      const id = parseInt(params[1]);
      const idx = mockDb.users.findIndex(u => u.id === id);
      if (idx !== -1) {
        mockDb.users[idx].role = role;
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // USERS status update
    if (normalizedSql.includes('update users set status = ?')) {
      const status = params[0];
      const id = parseInt(params[1]);
      const idx = mockDb.users.findIndex(u => u.id === id);
      if (idx !== -1) {
        mockDb.users[idx].status = status;
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // USERS avatar update
    if (normalizedSql.includes('update users set avatar = ?')) {
      const avatar = params[0];
      const id = parseInt(params[1]);
      const idx = mockDb.users.findIndex(u => u.id === id);
      if (idx !== -1) {
        mockDb.users[idx].avatar = avatar;
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // USERS reset token update
    if (normalizedSql.includes('update users set reset_token = ?, reset_token_expiry = ?')) {
      const reset_token = params[0];
      const reset_token_expiry = params[1];
      const id = parseInt(params[2]);
      const idx = mockDb.users.findIndex(u => u.id === id);
      if (idx !== -1) {
        mockDb.users[idx].reset_token = reset_token;
        mockDb.users[idx].reset_token_expiry = reset_token_expiry;
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // USERS password update from reset token
    if (normalizedSql.includes('update users set password = ?, reset_token = null, reset_token_expiry = null')) {
      const password = params[0];
      const id = parseInt(params[1]);
      const idx = mockDb.users.findIndex(u => u.id === id);
      if (idx !== -1) {
        mockDb.users[idx].password = password;
        mockDb.users[idx].reset_token = null;
        mockDb.users[idx].reset_token_expiry = null;
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // USERS profile update (name and phone)
    if (normalizedSql.includes('update users set name = ?, phone = ?')) {
      const name = params[0];
      const phone = params[1];
      const id = parseInt(params[2]);
      const idx = mockDb.users.findIndex(u => u.id === id);
      if (idx !== -1) {
        mockDb.users[idx].name = name;
        mockDb.users[idx].phone = phone;
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // USERS profile update (name only)
    if (normalizedSql.includes('update users set name = ? where id = ?')) {
      const name = params[0];
      const id = parseInt(params[1]);
      const idx = mockDb.users.findIndex(u => u.id === id);
      if (idx !== -1) {
        mockDb.users[idx].name = name;
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // USERS password update (profile password update)
    if (normalizedSql.includes('update users set password = ? where id = ?')) {
      const password = params[0];
      const id = parseInt(params[1]);
      const idx = mockDb.users.findIndex(u => u.id === id);
      if (idx !== -1) {
        mockDb.users[idx].password = password;
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }
    // EVENTS update
    if (normalizedSql.includes('update events')) {
      // UPDATE events SET title=?, event_type=?, date=?, time=?, location=?, budget=?, guest_count=?, status=?, theme=? WHERE id=?
      const title = params[0];
      const event_type = params[1];
      const date = params[2];
      const time = params[3];
      const location = params[4];
      const budget = parseFloat(params[5]);
      const guest_count = parseInt(params[6]);
      const status = params[7];
      const theme = params[8];
      const id = parseInt(params[9]);

      const idx = mockDb.events.findIndex(e => e.id === id);
      if (idx !== -1) {
        mockDb.events[idx] = {
          ...mockDb.events[idx],
          title, event_type, date, time, location, budget, guest_count, status, theme
        };
        // Update total budget in budget table too
        const bIdx = mockDb.budget.findIndex(b => b.event_id === id);
        if (bIdx !== -1) {
          mockDb.budget[bIdx].total_budget = budget;
          mockDb.budget[bIdx].remaining_budget = budget - mockDb.budget[bIdx].expenses;
        }
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // GUESTS update
    if (normalizedSql.includes('update guests')) {
      const idx = mockDb.guests.findIndex(g => g.id === parseInt(params[params.length - 1]));
      if (idx !== -1) {
        if (params.length === 5) {
          mockDb.guests[idx] = {
            ...mockDb.guests[idx],
            guest_name: params[0],
            email: params[1],
            phone: params[2],
            status: params[3]
          };
        } else {
          mockDb.guests[idx] = {
            ...mockDb.guests[idx],
            guest_name: params[0],
            email: params[1],
            status: params[2]
          };
        }
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // BUDGET update
    if (normalizedSql.includes('update budget')) {
      const total_budget = parseFloat(params[0]);
      const expenses = parseFloat(params[1]);
      const remaining_budget = parseFloat(params[2]);
      const event_id = parseInt(params[3]);

      const idx = mockDb.budget.findIndex(b => b.event_id === event_id);
      if (idx !== -1) {
        mockDb.budget[idx] = { ...mockDb.budget[idx], total_budget, expenses, remaining_budget };
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // TASKS update
    if (normalizedSql.includes('update tasks set status = ?')) {
      const status = params[0];
      const id = parseInt(params[1]);

      const idx = mockDb.tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        mockDb.tasks[idx].status = status;
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // VENDORS update
    if (normalizedSql.includes('update vendors set status = ?')) {
      const status = params[0];
      const id = parseInt(params[1]);

      const idx = mockDb.vendors.findIndex(v => v.id === id);
      if (idx !== -1) {
        mockDb.vendors[idx].status = status;
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // NOTIFICATIONS update (mark all read)
    if (normalizedSql.includes('update notifications set status = ? where user_id = ?')) {
      const status = params[0];
      const userId = parseInt(params[1]);
      let affected = 0;
      mockDb.notifications.forEach(n => {
        if (n.user_id === userId && n.status !== status) {
          n.status = status;
          affected++;
        }
      });
      return { affectedRows: affected };
    }
  }

  // 4. DELETE operations
  if (normalizedSql.startsWith('delete')) {
    // USERS delete
    if (normalizedSql.includes('delete from users')) {
      const id = parseInt(params[0]);
      const lenBefore = mockDb.users.length;
      mockDb.users = mockDb.users.filter(u => u.id !== id);
      // Cascade delete feedbacks and notifications
      mockDb.feedback = mockDb.feedback.filter(f => f.user_id !== id);
      mockDb.notifications = mockDb.notifications.filter(n => n.user_id !== id);
      // Cascade delete events and their details
      const userEvents = mockDb.events.filter(e => e.user_id === id);
      userEvents.forEach(ev => {
        mockDb.guests = mockDb.guests.filter(g => g.event_id !== ev.id);
        mockDb.budget = mockDb.budget.filter(b => b.event_id !== ev.id);
        mockDb.expenses = mockDb.expenses.filter(ex => ex.event_id !== ev.id);
        mockDb.tasks = mockDb.tasks.filter(t => t.event_id !== ev.id);
        mockDb.vendors = mockDb.vendors.filter(v => v.event_id !== ev.id);
      });
      mockDb.events = mockDb.events.filter(e => e.user_id !== id);
      return { affectedRows: lenBefore - mockDb.users.length };
    }
    // EVENTS delete
    if (normalizedSql.includes('delete from events')) {
      const id = parseInt(params[0]);
      const lenBefore = mockDb.events.length;
      mockDb.events = mockDb.events.filter(e => e.id !== id);
      // Cascade delete manually in mock
      mockDb.guests = mockDb.guests.filter(g => g.event_id !== id);
      mockDb.budget = mockDb.budget.filter(b => b.event_id !== id);
      mockDb.expenses = mockDb.expenses.filter(ex => ex.event_id !== id);
      mockDb.tasks = mockDb.tasks.filter(t => t.event_id !== id);
      mockDb.vendors = mockDb.vendors.filter(v => v.event_id !== id);
      return { affectedRows: lenBefore - mockDb.events.length };
    }

    // GUESTS delete
    if (normalizedSql.includes('delete from guests')) {
      const id = parseInt(params[0]);
      const lenBefore = mockDb.guests.length;
      mockDb.guests = mockDb.guests.filter(g => g.id !== id);
      return { affectedRows: lenBefore - mockDb.guests.length };
    }

    // EXPENSES delete
    if (normalizedSql.includes('delete from expenses')) {
      const id = parseInt(params[0]);
      const expense = mockDb.expenses.find(ex => ex.id === id);
      if (expense) {
        const eventId = expense.event_id;
        mockDb.expenses = mockDb.expenses.filter(ex => ex.id !== id);

        // Recalculate remaining budget
        const bIdx = mockDb.budget.findIndex(b => b.event_id === eventId);
        if (bIdx !== -1) {
          mockDb.budget[bIdx].expenses = Math.max(0, parseFloat(mockDb.budget[bIdx].expenses) - expense.amount);
          mockDb.budget[bIdx].remaining_budget = mockDb.budget[bIdx].total_budget - mockDb.budget[bIdx].expenses;
        }
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    // TASKS delete
    if (normalizedSql.includes('delete from tasks')) {
      const id = parseInt(params[0]);
      const lenBefore = mockDb.tasks.length;
      mockDb.tasks = mockDb.tasks.filter(t => t.id !== id);
      return { affectedRows: lenBefore - mockDb.tasks.length };
    }

    // VENDORS delete
    if (normalizedSql.includes('delete from vendors')) {
      const id = parseInt(params[0]);
      const lenBefore = mockDb.vendors.length;
      mockDb.vendors = mockDb.vendors.filter(v => v.id !== id);
      return { affectedRows: lenBefore - mockDb.vendors.length };
    }

    // NOTIFICATIONS delete
    if (normalizedSql.includes('delete from notifications')) {
      if (normalizedSql.includes('id in') || normalizedSql.includes('id =') || normalizedSql.includes('id = ?')) {
        // Find parameter containing the array of IDs
        const idsParam = params.find(p => Array.isArray(p));
        const ids = idsParam 
          ? idsParam.map(x => parseInt(x)) 
          : params.map(x => parseInt(x)).filter(x => !isNaN(x));
        const lenBefore = mockDb.notifications.length;
        mockDb.notifications = mockDb.notifications.filter(n => !ids.includes(n.id));
        return { affectedRows: lenBefore - mockDb.notifications.length };
      }
      const userId = parseInt(params[0]);
      const lenBefore = mockDb.notifications.length;
      mockDb.notifications = mockDb.notifications.filter(n => n.user_id !== userId);
      return { affectedRows: lenBefore - mockDb.notifications.length };
    }
  }

  console.warn(`⚠️ Mock DB could not match SQL pattern: "${sql}". Returning empty array.`);
  return [];
};

module.exports = {
  initDb,
  query,
  isMock: () => useMock
};
