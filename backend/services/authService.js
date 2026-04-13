const jwt = require('jsonwebtoken');

class AuthService {
  /**
   * Generate JWT token for user
   * @param {Object} user - User object
   * @returns {string} - JWT token
   */
  generateToken(user) {
    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    const options = {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };

    return jwt.sign(payload, process.env.JWT_SECRET, options);
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} - Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Created user and token
   */
  async register(userData) {
    const User = require('../models/User');

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: userData.email },
        { username: userData.username }
      ]
    });

    if (existingUser) {
      const error = new Error('User already exists');
      error.statusCode = 400;
      throw error;
    }

    // Create new user
    const user = new User({
      username: userData.username,
      email: userData.email,
      password: userData.password
    });

    await user.save();

    // Generate token
    const token = this.generateToken(user);

    return {
      user: user.getPublicProfile(),
      token
    };
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - User and token
   */
  async login(email, password) {
    const User = require('../models/User');

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Check if user is active
    if (!user.isActive) {
      const error = new Error('Account is deactivated');
      error.statusCode = 403;
      throw error;
    }

    // Verify password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      user: user.getPublicProfile(),
      token
    };
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User profile
   */
  async getProfile(userId) {
    const User = require('../models/User');

    const user = await User.findById(userId).select('-password');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user.getPublicProfile();
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} - Updated user
   */
  async updateProfile(userId, updateData) {
    const User = require('../models/User');

    // Remove password from update data if present
    delete updateData.password;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user.getPublicProfile();
  }

  /**
   * Change password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} - Success status
   */
  async changePassword(userId, currentPassword, newPassword) {
    const User = require('../models/User');

    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 400;
      throw error;
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    return true;
  }
}

module.exports = new AuthService();
