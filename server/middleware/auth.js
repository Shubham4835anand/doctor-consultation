const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate the JWT token from the Request headers.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing or invalid' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey12345', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token is expired or invalid' });
    }
    // Attach decoded user payload to request
    req.user = user;
    next();
  });
}

/**
 * Middleware factory to enforce role-based access control.
 * @param {string|string[]} roles - Allowed role(s) for the route
 */
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: forbidden for this user role' });
    }
    
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};
