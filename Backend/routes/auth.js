const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken, rateLimitAuth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Register a new user
const register = async (req, res) => {
  try {
    const { username, email, password, role, firstName, lastName, bio } = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message: 'All required fields must be provided',
        error: 'MISSING_FIELDS'
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken',
        error: 'USER_EXISTS'
      });
    }

    const user = new User({
      username,
      email,
      password,
      role: role || 'student',
      firstName,
      lastName,
      bio: bio || ''
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        bio: user.bio
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Username or email already exists',
        error: 'DUPLICATE_KEY'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        error: 'VALIDATION_ERROR',
        details: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      message: 'Registration failed',
      error: 'REGISTRATION_ERROR'
    });
  }
};

// Login user
router.post('/login', rateLimitAuth, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required',
        error: 'MISSING_CREDENTIALS'
      });
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS'
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        message: 'Account is deactivated',
        error: 'ACCOUNT_DEACTIVATED'
      });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        bio: user.bio
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: 'LOGIN_ERROR'
    });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses', 'title description instructor')
      .populate('createdCourses', 'title description enrolledStudents');

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        bio: user.bio,
        enrolledCourses: user.enrolledCourses,
        createdCourses: user.createdCourses,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      message: 'Failed to fetch profile',
      error: 'PROFILE_FETCH_ERROR'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, bio, username, email } = req.body;
    const userId = req.user._id;

    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(409).json({
          message: 'Username already taken',
          error: 'USERNAME_EXISTS'
        });
      }
    }

    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(409).json({
          message: 'Email already registered',
          error: 'EMAIL_EXISTS'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName: firstName || req.user.firstName,
        lastName: lastName || req.user.lastName,
        bio: bio !== undefined ? bio : req.user.bio,
        username: username || req.user.username,
        email: email || req.user.email
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        fullName: updatedUser.fullName,
        bio: updatedUser.bio
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        error: 'VALIDATION_ERROR',
        details: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      message: 'Profile update failed',
      error: 'PROFILE_UPDATE_ERROR'
    });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required',
        error: 'MISSING_PASSWORDS'
      });
    }

    const user = await User.findById(req.user._id);
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        message: 'Current password is incorrect',
        error: 'INVALID_CURRENT_PASSWORD'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        error: 'VALIDATION_ERROR',
        details: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      message: 'Password change failed',
      error: 'PASSWORD_CHANGE_ERROR'
    });
  }
});

// Verify token
router.get('/verify-token', authenticateToken, (req, res) => {
  res.json({
    message: 'Token is valid',
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      fullName: req.user.fullName
    }
  });
});

// Register route added here
router.post('/register', register);

module.exports = router;
