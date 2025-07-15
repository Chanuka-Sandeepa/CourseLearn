const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token is required',
        error: 'MISSING_TOKEN' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user and attach to request
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid token - user not found',
        error: 'INVALID_TOKEN' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated',
        error: 'ACCOUNT_DEACTIVATED' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired',
        error: 'TOKEN_EXPIRED' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        error: 'INVALID_TOKEN' 
      });
    }

    console.error('Authentication error:', error);
    res.status(500).json({ 
      message: 'Authentication failed',
      error: 'AUTH_ERROR' 
    });
  }
};

// Check if user is an instructor
const requireInstructor = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ 
      message: 'Access denied. Instructor role required.',
      error: 'INSUFFICIENT_PERMISSIONS' 
    });
  }
  next();
};

// Check if user is a student
const requireStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      message: 'Access denied. Student role required.',
      error: 'INSUFFICIENT_PERMISSIONS' 
    });
  }
  next();
};

// Check if user is either instructor or student (authenticated user)
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required',
      error: 'NOT_AUTHENTICATED' 
    });
  }
  next();
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Rate limiting for authentication attempts
const authRateLimit = {};

const rateLimitAuth = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (!authRateLimit[clientIP]) {
    authRateLimit[clientIP] = {
      count: 1,
      resetTime: now + windowMs
    };
  } else {
    if (now > authRateLimit[clientIP].resetTime) {
      authRateLimit[clientIP] = {
        count: 1,
        resetTime: now + windowMs
      };
    } else {
      authRateLimit[clientIP].count++;
      
      if (authRateLimit[clientIP].count > maxAttempts) {
        return res.status(429).json({
          message: 'Too many authentication attempts. Please try again later.',
          error: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((authRateLimit[clientIP].resetTime - now) / 1000)
        });
      }
    }
  }

  next();
};

module.exports = {
  authenticateToken,
  requireInstructor,
  requireStudent,
  requireAuth,
  optionalAuth,
  rateLimitAuth
};
