const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// Import controllers
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  updateProfileAvatar,
  createUserAdmin,
  googleLoginUser,
  updateUserProfile,
  updatePassword
} = require('../controllers/authController');

const {
  getEvents,
  getAdminEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getPublicStats
} = require('../controllers/eventController');

const {
  getBudgetSummary,
  addExpense,
  deleteExpense
} = require('../controllers/budgetController');

const {
  getGuests,
  addGuest,
  updateGuest,
  deleteGuest
} = require('../controllers/guestController');

const {
  getTasks,
  addTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const {
  getVendors,
  addVendor,
  updateVendor,
  deleteVendor
} = require('../controllers/vendorController');

const {
  getFeedbacks,
  addFeedback
} = require('../controllers/feedbackController');

const {
  getNotifications,
  markNotificationsRead,
  createNotification,
  deleteNotifications
} = require('../controllers/notificationController');

const {
  getAISuggestions,
  chatWithAI
} = require('../controllers/aiController');

const jwt = require('jsonwebtoken');

// --- DEBUG MODULE ---
router.get('/test-jwt', (req, res) => {
  const secret = process.env.JWT_SECRET || 'supersecretjwttokenforeventplanner2026';
  try {
    const token = jwt.sign({ id: 999 }, secret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, secret);
    res.json({
      success: true,
      secretLength: secret.length,
      prefix: secret.substring(0, 3) + '...',
      hasEnvSecret: !!process.env.JWT_SECRET,
      decodedId: decoded.id,
      nodeVersion: process.version
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      secretLength: secret.length
    });
  }
});

// --- AUTHENTICATION MODULE ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/login/google', googleLoginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getUserProfile);
router.get('/auth/sync', protect, getUserProfile);
router.put('/profile/avatar', protect, updateProfileAvatar);
router.put('/profile', protect, updateUserProfile);
router.put('/profile/password', protect, updatePassword);

// --- EVENT MODULE ---
router.get('/public-stats', getPublicStats);
router.get('/events', protect, getEvents);
router.get('/events/:id', protect, getEventById);
router.post('/create-event', protect, createEvent);
router.put('/update-event/:id', protect, updateEvent);
router.delete('/delete-event/:id', protect, deleteEvent);

// --- BUDGET MODULE ---
router.get('/budget/:eventId', protect, getBudgetSummary);
router.post('/expense/add', protect, addExpense);
router.delete('/expense/:id', protect, deleteExpense);

// --- GUEST MODULE ---
router.get('/guests/:eventId', protect, getGuests);
router.post('/guest/add', protect, addGuest);
router.put('/guest/:id', protect, updateGuest);
router.delete('/guest/:id', protect, deleteGuest);

// --- TASK MODULE ---
router.get('/tasks/:eventId', protect, getTasks);
router.post('/task/add', protect, addTask);
router.put('/task/:id', protect, updateTask);
router.delete('/task/:id', protect, deleteTask);

// --- VENDOR MODULE ---
router.get('/vendors/:eventId', protect, getVendors);
router.post('/vendor/add', protect, addVendor);
router.put('/vendor/:id', protect, updateVendor);
router.delete('/vendor/:id', protect, deleteVendor);

// --- FEEDBACK MODULE ---
router.get('/feedback', protect, getFeedbacks);
router.post('/feedback/add', protect, addFeedback);

// --- NOTIFICATION MODULE ---
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);
router.post('/notifications/add', protect, createNotification);
router.post('/notifications/delete', protect, deleteNotifications);

// --- AI RECOMMENDATION MODULE ---
router.post('/ai/suggestions', protect, getAISuggestions);
router.post('/ai/chat', protect, chatWithAI);

// --- ADMIN MODULE ---
router.get('/admin/users', protect, admin, getAllUsers);
router.post('/admin/users', protect, admin, createUserAdmin);
router.put('/admin/users/:id/role', protect, admin, updateUserRole);
router.put('/admin/users/:id/status', protect, admin, updateUserStatus);
router.delete('/admin/users/:id', protect, admin, deleteUser);
router.get('/admin/events', protect, admin, getAdminEvents);

module.exports = router;
