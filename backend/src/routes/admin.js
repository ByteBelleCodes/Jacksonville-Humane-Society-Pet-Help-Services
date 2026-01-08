const express = require('express');
const db = require('../db');
const bcrypt = require('bcrypt');
const { requireAuth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Protect all admin routes: must be authenticated and admin role
router.use(requireAuth);
router.use(requireRole('admin'));

// GET /api/admin/users
router.get('/users', (req, res) => {
  db.all('SELECT id, email, full_name, role, active, created_at FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ users: rows });
  });
});

// POST /api/admin/users (create)
router.post('/users', async (req, res) => {
  const { email, full_name, role } = req.body;
  const password = req.body.password || 'ChangeMe123';
  try {
    const hash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (email, password_hash, full_name, role, active) VALUES (?, ?, ?, ?, ?)', [email, hash, full_name || '', role || 'staff', 1], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ created: true, id: this.lastID });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/users/:id/toggle
router.post('/users/:id/toggle', (req, res) => {
  const id = req.params.id;
  const active = req.body.active ? 1 : 0;
  db.run('UPDATE users SET active = ? WHERE id = ?', [active, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: true });
  });
});

// POST /api/admin/users/:id/reset-password
router.post('/users/:id/reset-password', async (req, res) => {
  const id = req.params.id;
  const newPassword = req.body.password || 'ChangeMe123';
  try {
    const hash = await bcrypt.hash(newPassword, 10);
    db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ reset: true });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;