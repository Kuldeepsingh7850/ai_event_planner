const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwttokenforeventplanner2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check if user exists
    const userExists = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (userExists.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user (default role is 'user')
    const result = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user']
    );

    const newUserId = result.insertId;

    res.status(201).json({
      id: newUserId,
      name,
      email,
      role: 'user',
      token: generateToken(newUserId)
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Find user
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is blocked
    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Your account has been blocked by the Administrator.' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || null,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Forgot Password Request
// @route   POST /api/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please provide email' });
  }

  try {
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const user = users[0];

    // Generate secure reset token
    const token = crypto.randomBytes(20).toString('hex');
    
    // Set token expiry (1 hour from now)
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);

    // Save token and expiry in DB
    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [token, expiry, user.id]
    );

    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || '"JAGAH AI Event Planner" <noreply@jagah.com>',
      to: user.email,
      subject: 'JAGAH AI Event Planner - Password Reset Request',
      text: `Hello ${user.name},\n\nYou requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nJAGAH Udaipur Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #5c3db5; text-align: center;">JAGAH AI Event Planner</h2>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>We received a request to reset the password for your JAGAH account.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #5c3db5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </p>
          <p style="font-size: 12px; color: #666;">Or copy and paste this link in your browser:</p>
          <p style="font-size: 12px; color: #5c3db5; word-break: break-all;">${resetUrl}</p>
          <p style="font-size: 12px; color: #999; margin-top: 20px;">This link will expire in 1 hour. If you did not request this password reset, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 11px; color: #999; text-align: center;">© 2026 JAGAH Udaipur. All rights reserved.</p>
        </div>
      `
    };

    let transporter;
    let testAccount = null;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      if (!global.etherealAccount) {
        global.etherealAccount = await nodemailer.createTestAccount();
      }
      testAccount = global.etherealAccount;
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    const info = await transporter.sendMail(mailOptions);
    let etherealUrl = '';
    if (testAccount) {
      etherealUrl = nodemailer.getTestMessageUrl(info);
      console.log(`✉️ Ethereal Email sent: ${etherealUrl}`);
    }

    res.json({
      message: 'Password reset link sent to your email.',
      resetLink: resetUrl,
      etherealUrl: etherealUrl
    });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ message: 'Server error sending reset link' });
  }
};

// @desc    Reset Password
// @route   POST /api/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required' });
  }

  try {
    const users = await db.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > CURRENT_TIMESTAMP',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    const user = users[0];

    // In-memory mock DB secondary check
    if (user.reset_token_expiry && new Date(user.reset_token_expiry) < new Date()) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password, clear token
    await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ message: 'Server error resetting password' });
  }
};

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const users = await db.query('SELECT id, name, email, role, avatar, phone, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(users[0]);
  } catch (error) {
    console.error('Profile fetch error:', error.message);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// @desc    Get system users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await db.query('SELECT id, name, email, role, status, phone, avatar, created_at FROM users');
    res.json(users);
  } catch (error) {
    console.error('Admin user fetch error:', error.message);
    res.status(500).json({ message: 'Server error fetching all users' });
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || (role !== 'admin' && role !== 'user')) {
    return res.status(400).json({ message: 'Invalid role. Must be admin or user.' });
  }

  try {
    const result = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Update user role error:', error.message);
    res.status(500).json({ message: 'Server error updating user role' });
  }
};

// @desc    Update user status (block/unblock) (Admin only)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || (status !== 'active' && status !== 'blocked')) {
    return res.status(400).json({ message: 'Invalid status. Must be active or blocked.' });
  }

  try {
    const result = await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: `User account status updated to ${status}` });
  } catch (error) {
    console.error('Update user status error:', error.message);
    res.status(500).json({ message: 'Server error updating user status' });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Administrators cannot delete their own accounts.' });
    }

    const result = await db.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

// @desc    Update user profile avatar
// @route   PUT /api/profile/avatar
// @access  Private
const updateProfileAvatar = async (req, res) => {
  const { avatar } = req.body;

  if (avatar === undefined) {
    return res.status(400).json({ message: 'Please provide avatar data' });
  }

  try {
    const result = await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatar, req.user.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Profile avatar updated successfully', avatar });
  } catch (error) {
    console.error('Update avatar error:', error.message);
    res.status(500).json({ message: 'Server error updating profile photo' });
  }
};

// @desc    Create user (Admin only)
// @route   POST /api/admin/users
// @access  Private/Admin
const createUserAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check if user exists
    const userExists = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (userExists.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const result = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'user']
    );

    const newUserId = result.insertId;

    res.status(201).json({
      id: newUserId,
      name,
      email,
      role: role || 'user',
      status: 'active',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create user admin error:', error.message);
    res.status(500).json({ message: 'Server error during user creation' });
  }
};

// @desc    Authenticate user using Google ID Token
// @route   POST /api/login/google
// @access  Public
const googleLoginUser = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'Please provide Google ID Token' });
  }

  try {
    // 1. Verify token by calling Google's tokeninfo API
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google token verification failed response:', errorText);
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const payload = await response.json();
    const { email, name, picture, aud } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Email address not provided by Google' });
    }

    // 2. Check if user already exists
    let users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;

    if (users.length > 0) {
      user = users[0];

      // Check if user is blocked
      if (user.status === 'blocked') {
        return res.status(403).json({ message: 'Your account has been blocked by the Administrator.' });
      }

      // If user has no avatar or we want to update it
      if (!user.avatar && picture) {
        await db.query('UPDATE users SET avatar = ? WHERE id = ?', [picture, user.id]);
        user.avatar = picture;
      }
    } else {
      // 3. Register user with Google details
      const result = await db.query(
        'INSERT INTO users (name, email, password, role, status, avatar) VALUES (?, ?, ?, ?, ?, ?)',
        [name || 'Google User', email, null, 'user', 'active', picture || null]
      );
      
      const newUserId = result.insertId;
      const newUsers = await db.query('SELECT * FROM users WHERE id = ?', [newUserId]);
      user = newUsers[0];
    }

    // 4. Respond with user info and system JWT token
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || null,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(500).json({ message: 'Server error during Google sign-in' });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const { name, phone } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Please provide name' });
  }

  try {
    const result = await db.query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone || null, req.user.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Profile updated successfully', name, phone });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Update user password
// @route   PUT /api/profile/password
// @access  Private
const updatePassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'Please provide both password fields' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const result = await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error.message);
    res.status(500).json({ message: 'Server error updating password' });
  }
};

module.exports = {
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
};


