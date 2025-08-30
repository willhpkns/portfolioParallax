const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token and add user info to request
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check token type for access tokens
    if (decoded.type && decoded.type !== 'access') {
      return res.status(401).json({ message: 'Invalid token type for this operation' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', expired: true });
    }
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const isAdmin = (req, res, next) => {
  try {
    // First run the auth middleware
    auth(req, res, () => {
      // Check if user exists and is admin
      if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      next();
    });
  } catch (err) {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

module.exports = {
  auth,
  isAdmin
};
