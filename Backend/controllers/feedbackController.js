const db = require('../config/db');

// @desc    Get all feedbacks (Admin panel check or global lists)
// @route   GET /api/feedback
// @access  Private
const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await db.query(
      'SELECT f.*, u.name, u.email FROM feedback f JOIN users u ON f.user_id = u.id ORDER BY f.created_at DESC'
    );
    res.json(feedbacks);
  } catch (error) {
    console.error('Fetch feedback error:', error.message);
    res.status(500).json({ message: 'Server error fetching feedback' });
  }
};

// @desc    Submit user feedback
// @route   POST /api/feedback/add
// @access  Private
const addFeedback = async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating) {
    return res.status(400).json({ message: 'Please provide a rating (1-5)' });
  }

  const rateVal = parseInt(rating);
  if (rateVal < 1 || rateVal > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    const result = await db.query(
      'INSERT INTO feedback (user_id, rating, comment) VALUES (?, ?, ?)',
      [req.user.id, rateVal, comment || '']
    );

    res.status(201).json({
      id: result.insertId,
      user_id: req.user.id,
      rating: rateVal,
      comment: comment || ''
    });
  } catch (error) {
    console.error('Add feedback error:', error.message);
    res.status(500).json({ message: 'Server error adding feedback' });
  }
};

module.exports = {
  getFeedbacks,
  addFeedback
};
