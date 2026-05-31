const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Protected route middleware using custom JWT
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwttokenforeventplanner2026');

      // Fetch user details from database (including role, status, avatar)
      const users = await db.query('SELECT id, name, email, role, status, avatar FROM users WHERE id = ?', [decoded.id]);
      if (users.length === 0) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      const user = users[0];

      // Check status
      if (user.status === 'blocked') {
        return res.status(403).json({ message: 'Your account has been blocked by the Administrator.' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Authentication middleware error:', error.message);
      return res.status(401).json({ message: 'Not authorized, session validation failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Admin route middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an administrator' });
  }
};

module.exports = { protect, admin };
