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

module.exports = {
  getNotifications,
  markNotificationsRead
};
