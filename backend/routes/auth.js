const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { protect } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and password are required'
      });
    }

    // Register user
    const result = await authService.register({
      username,
      email,
      password
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      ...result
    });
  } catch (error) {
    console.error('Register error:', error.message);
    
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Login user
    const result = await authService.login(email, password);

    res.json({
      success: true,
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    console.error('Login error:', error.message);
    
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', protect, async (req, res) => {
  try {
    const profile = await authService.getProfile(req.user.id);

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', protect, async (req, res) => {
  try {
    const { username, email } = req.body;

    const profile = await authService.updateProfile(req.user.id, {
      username,
      email
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/auth/change-password
 * Change password
 */
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    await authService.changePassword(req.user.id, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error.message);
    
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/auth/verify
 * Verify token validity
 */
router.get('/verify', protect, async (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
});

module.exports = router;
