const db = require('../config/db');

// @desc    Get all tasks for an event
// @route   GET /api/tasks/:eventId
// @access  Private
const getTasks = async (req, res) => {
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

    const tasks = await db.query('SELECT * FROM tasks WHERE event_id = ? ORDER BY deadline ASC', [eventId]);
    res.json(tasks);
  } catch (error) {
    console.error('Fetch tasks error:', error.message);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

// @desc    Add a task
// @route   POST /api/task/add
// @access  Private
const addTask = async (req, res) => {
  const { eventId, title, deadline, status } = req.body;

  if (!eventId || !title || !deadline) {
    return res.status(400).json({ message: 'Please provide eventId, title, and deadline' });
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

    // Insert task
    const result = await db.query(
      'INSERT INTO tasks (event_id, title, deadline, status) VALUES (?, ?, ?, ?)',
      [eventId, title, deadline, status || 'pending']
    );

    res.status(201).json({
      id: result.insertId,
      event_id: eventId,
      title,
      deadline,
      status: status || 'pending'
    });
  } catch (error) {
    console.error('Add task error:', error.message);
    res.status(500).json({ message: 'Server error adding task' });
  }
};

// @desc    Update task status
// @route   PUT /api/task/:id
// @access  Private
const updateTask = async (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Please provide task status' });
  }

  try {
    // Find task
    const tasks = await db.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (tasks.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = tasks[0];
    const eventId = task.event_id;

    // Check event ownership
    const events = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Associated event not found' });
    }
    if (events[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update status
    await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, taskId]);

    // Send task notifications if completed
    if (status === 'completed') {
      await db.query(
        'INSERT INTO notifications (user_id, message, status) VALUES (?, ?, ?)',
        [
          req.user.id,
          `Task "${task.title}" for event "${events[0].title}" has been completed.`,
          'unread'
        ]
      );
    }

    res.json({ message: 'Task status updated successfully' });
  } catch (error) {
    console.error('Update task error:', error.message);
    res.status(500).json({ message: 'Server error updating task' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/task/:id
// @access  Private
const deleteTask = async (req, res) => {
  const taskId = req.params.id;

  try {
    // Find task
    const tasks = await db.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (tasks.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = tasks[0];
    const eventId = task.event_id;

    // Check event ownership
    const events = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Associated event not found' });
    }
    if (events[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete task
    await db.query('DELETE FROM tasks WHERE id = ?', [taskId]);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error.message);
    res.status(500).json({ message: 'Server error deleting task' });
  }
};

module.exports = {
  getTasks,
  addTask,
  updateTask,
  deleteTask
};
