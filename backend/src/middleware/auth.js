const jwt = require('jsonwebtoken');
const db = require('../db');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

/**
 * requireAuth - Express middleware to require a valid JWT and active user.
 * Adds req.user = { id, email, full_name, role, active, created_at }
 */
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = auth.split(' ')[1];
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  // verify user exists and is active
  db.get('SELECT id, email, full_name, role, active, created_at FROM users WHERE id = ?', [payload.id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (user.active === 0) return res.status(403).json({ error: 'User is not active' });
    req.user = user;
    next();
  });
}

/**
 * requireRole(role) - returns middleware that ensures req.user.role === role
 */
function requireRole(role) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden: insufficient role' });
    next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};