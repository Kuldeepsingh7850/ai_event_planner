const db = require('../config/db');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json(notifications);
  } catch (error) {
    console.error('Fetch notifications error:', error.message);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

// @desc    Mark all notifications as read for logged in user
// @route   PUT /api/notifications/read
// @access  Private
const markNotificationsRead = async (req, res) => {
  try {
    await db.query(
      "UPDATE notifications SET status = 'read' WHERE user_id = ?",
      [req.user.id]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Update notifications error:', error.message);
    res.status(500).json({ message: 'Server error updating notifications' });
  }
};

// @desc    Add a notification (useful for custom actions like frontend-managed venues/vendors additions)
// @route   POST /api/notifications/add
// @access  Private
const createNotification = async (req, res) => {
  const { message, targetRole } = req.body;
  if (!message) {
    return res.status(450).json({ message: 'Please provide a message' });
  }

  try {
    if (targetRole === 'admin') {
      const admins = await db.query("SELECT id FROM users WHERE role = 'admin'");
      for (const admin of admins) {
        await db.query(
          "INSERT INTO notifications (user_id, message, status) VALUES (?, ?, 'unread')",
          [admin.id, message]
        );
      }
    } else {
      await db.query(
        "INSERT INTO notifications (user_id, message, status) VALUES (?, ?, 'unread')",
        [req.user.id, message]
      );
    }
    res.status(201).json({ message: 'Notification created successfully' });
  } catch (error) {
    console.error('Create notification error:', error.message);
    res.status(500).json({ message: 'Server error creating notification' });
  }
};

// @desc    Delete multiple notifications for logged in user
// @route   POST /api/notifications/delete
// @access  Private
const deleteNotifications = async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Invalid notifications list' });
  }

  try {
    await db.query(
      'DELETE FROM notifications WHERE user_id = ? AND id IN (?)',
      [req.user.id, ids]
    );
    res.json({ message: 'Notifications deleted successfully' });
  } catch (error) {
    console.error('Delete notifications error:', error.message);
    res.status(500).json({ message: 'Server error deleting notifications' });
  }
};

module.exports = {
  getNotifications,
  markNotificationsRead,
  createNotification,
  deleteNotifications
};
