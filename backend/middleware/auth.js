const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware 1: Strict Auth - Sirf logged-in users ke liye (e.g. /api/history)
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, token missing',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'onestop-super-secret-key-32-chars-long');
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User belonging to token no longer exists' });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or has expired',
    });
  }
};

// Middleware 2: Optional Auth - Guest users allow karta hai (e.g. Placement / Scholarship / College)
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null; // Guest user
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'onestop-super-secret-key-32-chars-long');
    req.user = await User.findById(decoded.id).select('-password');
  } catch (error) {
    req.user = null; // Token corrupt/expired hone par bhi guest ki tarah chalne do
  }

  next();
};

module.exports = { protect, optionalAuth };
