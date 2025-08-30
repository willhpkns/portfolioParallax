const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Admin = require('../models/admin');
const router = express.Router();

// Enhanced rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Simple rate limiting - store attempts in memory (for production, use Redis)
const loginAttempts = new Map();
const MAX_ATTEMPTS = parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5;
const LOCKOUT_TIME = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes

// Rate limiting middleware
const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (loginAttempts.has(ip)) {
    const attempts = loginAttempts.get(ip);
    
    // Clean up old attempts
    attempts.timestamps = attempts.timestamps.filter(timestamp => 
      now - timestamp < LOCKOUT_TIME
    );
    
    if (attempts.timestamps.length >= MAX_ATTEMPTS) {
      return res.status(429).json({ 
        message: 'Too many login attempts. Please try again later.',
        retryAfter: Math.ceil((LOCKOUT_TIME - (now - attempts.timestamps[0])) / 1000)
      });
    }
  }
  
  next();
};

// Generate tokens helper
const generateTokens = (admin) => {
  const accessToken = jwt.sign(
    { 
      id: admin._id,
      isAdmin: admin.isAdmin,
      type: 'access'
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { 
      id: admin._id,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// Login route with enhanced rate limiting
router.post('/login', authLimiter, rateLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // Track login attempt
    if (!loginAttempts.has(ip)) {
      loginAttempts.set(ip, { timestamps: [] });
    }
    loginAttempts.get(ip).timestamps.push(Date.now());

    // Find admin user
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Clear failed attempts on successful login
    loginAttempts.delete(ip);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(admin);

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: admin._id,
        username: admin.username
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Refresh token route
router.post('/refresh', authLimiter, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    // Find admin user
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(admin);

    res.json({
      token: accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: admin._id,
        username: admin.username
      }
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Verify token route
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token' });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check token type
    if (verified.type && verified.type !== 'access') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    const admin = await Admin.findById(verified.id).select('-password');
    
    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    res.json({
      user: {
        id: admin._id,
        username: admin.username
      }
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', expired: true });
    }
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// Logout route (optional - for clearing client-side tokens)
router.post('/logout', (req, res) => {
  // In a more advanced setup, you might maintain a blacklist of tokens
  // For now, we'll just return success and let the client clear the tokens
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
