const db = require('../config/db');

// @desc    Get budget and expenses summary for an event
// @route   GET /api/budget/:eventId
// @access  Private
const getBudgetSummary = async (req, res) => {
  const { eventId } = req.params;

  try {
    // Check event ownership
    const events = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (events[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get budget row
    const budgets = await db.query('SELECT * FROM budget WHERE event_id = ?', [eventId]);
    if (budgets.length === 0) {
      // If budget doesn't exist, create it (should not happen, but safeguard)
      await db.query(
        'INSERT INTO budget (event_id, total_budget, expenses, remaining_budget) VALUES (?, ?, 0, ?)',
        [eventId, events[0].budget, events[0].budget]
      );
      const newBudgets = await db.query('SELECT * FROM budget WHERE event_id = ?', [eventId]);
      return res.json({ budget: newBudgets[0], expenses: [] });
    }

    // Get all detailed expenses
    const expenses = await db.query('SELECT * FROM expenses WHERE event_id = ? ORDER BY date DESC', [eventId]);

    res.json({
      budget: budgets[0],
      expenses
    });
  } catch (error) {
    console.error('Fetch budget error:', error.message);
    res.status(500).json({ message: 'Server error fetching budget' });
  }
};

// @desc    Add an expense to an event
// @route   POST /api/expense/add
// @access  Private
const addExpense = async (req, res) => {
  const { eventId, title, amount, category, date } = req.body;

  if (!eventId || !title || !amount || !category || !date) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Check event ownership
    const events = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (events[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const amt = parseFloat(amount);

    // Insert into expenses
    const result = await db.query(
      'INSERT INTO expenses (event_id, title, amount, category, date) VALUES (?, ?, ?, ?, ?)',
      [eventId, title, amt, category, date]
    );

    // Update MySQL budget table if not running in mock database (mockDb handles it internally)
    if (!db.isMock()) {
      const budgetResult = await db.query('SELECT * FROM budget WHERE event_id = ?', [eventId]);
      if (budgetResult.length > 0) {
        const currentBudget = budgetResult[0];
        const newExpenses = parseFloat(currentBudget.expenses) + amt;
        const newRemaining = parseFloat(currentBudget.total_budget) - newExpenses;

        await db.query(
          'UPDATE budget SET expenses = ?, remaining_budget = ? WHERE event_id = ?',
          [newExpenses, newRemaining, eventId]
        );

        // Budget Alerts: Notify if expenses exceed total budget
        if (newRemaining < 0) {
          await db.query(
            'INSERT INTO notifications (user_id, message, status) VALUES (?, ?, ?)',
            [
              req.user.id,
              `⚠️ Alert: Your expenses for event "${events[0].title}" have exceeded the total allocated budget by ₹${Math.abs(newRemaining).toFixed(2)}!`,
              'unread'
            ]
          );
        }
      }
    } else {
      // In Mock mode, create alert notification manually
      const budgets = await db.query('SELECT * FROM budget WHERE event_id = ?', [eventId]);
      if (budgets.length > 0 && budgets[0].remaining_budget < 0) {
        await db.query(
          'INSERT INTO notifications (user_id, message, status) VALUES (?, ?, ?)',
          [
            req.user.id,
            `⚠️ Alert: Your expenses for event "${events[0].title}" have exceeded the total allocated budget by ₹${Math.abs(budgets[0].remaining_budget).toFixed(2)}!`,
            'unread'
          ]
        );
      }
    }

    res.status(201).json({
      id: result.insertId,
      event_id: eventId,
      title,
      amount: amt,
      category,
      date
    });
  } catch (error) {
    console.error('Add expense error:', error.message);
    res.status(500).json({ message: 'Server error adding expense' });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expense/:id
// @access  Private
const deleteExpense = async (req, res) => {
  const expenseId = req.params.id;

  try {
    // Get expense details
    const expenses = await db.query('SELECT * FROM expenses WHERE id = ?', [expenseId]);
    if (expenses.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const expense = expenses[0];
    const eventId = expense.event_id;

    // Check event ownership
    const events = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Associated event not found' });
    }
    if (events[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete expense
    await db.query('DELETE FROM expenses WHERE id = ?', [expenseId]);

    // Update budget table if MySQL (mockDb handles it internally)
    if (!db.isMock()) {
      const budgetResult = await db.query('SELECT * FROM budget WHERE event_id = ?', [eventId]);
      if (budgetResult.length > 0) {
        const currentBudget = budgetResult[0];
        const newExpenses = Math.max(0, parseFloat(currentBudget.expenses) - parseFloat(expense.amount));
        const newRemaining = parseFloat(currentBudget.total_budget) - newExpenses;

        await db.query(
          'UPDATE budget SET expenses = ?, remaining_budget = ? WHERE event_id = ?',
          [newExpenses, newRemaining, eventId]
        );
      }
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error.message);
    res.status(500).json({ message: 'Server error deleting expense' });
  }
};

module.exports = {
  getBudgetSummary,
  addExpense,
  deleteExpense
};
