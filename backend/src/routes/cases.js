const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Protect all case routes (staff/admin)
router.use(requireAuth);

/**
 * GET /api/cases/search?q=...&limit=..&show_deleted=1
 * - by default excludes deleted rows (deleted = 0)
 * - if show_deleted=1 (or true), includes deleted rows
 */
router.get('/search', (req, res) => {
  const q = req.query.q || '';
  const limit = parseInt(req.query.limit || '50', 10);
  const showDeleted = req.query.show_deleted === '1' || req.query.show_deleted === 'true';
  let sql;
  let params;

  const likeQ = `%${q}%`;

  if (showDeleted) {
    // include deleted rows (both deleted=0 and deleted=1), but still apply filter if q provided
    sql = `SELECT * FROM cases WHERE (phone_number LIKE ? OR contact_name LIKE ?) ORDER BY created_at DESC LIMIT ?`;
    params = [likeQ, likeQ, limit];
  } else {
    // default: exclude deleted rows
    sql = `SELECT * FROM cases WHERE deleted = 0 AND (phone_number LIKE ? OR contact_name LIKE ?) ORDER BY created_at DESC LIMIT ?`;
    params = [likeQ, likeQ, limit];
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ results: rows });
  });
});

/**
 * GET /api/cases/history?phone=...
 * Returns all cases for a given phone number (past visit history), newest first.
 * The phone parameter is normalized (non-digits removed) and compared to a normalized phone_number column.
 * This ensures searches like "904-555-1234" and "(904) 555 1234" match the same records.
 */
router.get('/history', (req, res) => {
  const phone = req.query.phone || '';
  if (!phone || phone.trim() === '') {
    return res.status(400).json({ error: 'phone query parameter is required' });
  }

  // Normalize incoming phone: strip non-digits
  const normalized = phone.replace(/\D/g, '');

  // Build SQL that normalizes stored phone_number by removing common separators before comparison.
  // We apply nested REPLACE calls to strip '-', ' ', '(', ')', '+' characters.
  const sql = `
    SELECT *
    FROM cases
    WHERE
      (
        REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone_number, '-', ''), ' ', ''), '(', ''), ')', ''), '+', '')
      ) = ?
    ORDER BY datetime(created_at) DESC
  `;

  db.all(sql, [normalized], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ results: rows });
  });
});

// POST /api/cases (create)
router.post('/', (req, res) => {
  const data = req.body;
  const stmt = `INSERT INTO cases (case_id, contact_name, phone_number, pet_name, pet_species, pet_breed, initial_request, source_system, status, outcome, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const caseId = data.case_id || require('uuid').v4();
  db.run(
    stmt,
    [
      caseId,
      data.contact_name || '',
      data.phone_number || '',
      data.pet_name || '',
      data.pet_species || '',
      data.pet_breed || '',
      data.initial_request || '',
      data.source_system || 'manual',
      data.status || 'open',
      data.outcome || '',
      data.notes || ''
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT * FROM cases WHERE id = ?', [this.lastID], (e, row) => {
        if (e) return res.status(500).json({ error: e.message });
        res.json({ case: row });
      });
    }
  );
});

// GET /api/cases/:caseId
router.get('/:caseId', (req, res) => {
  const caseId = req.params.caseId;
  db.get('SELECT * FROM cases WHERE case_id = ?', [caseId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ case: row });
  });
});

// PUT /api/cases/:caseId
router.put('/:caseId', (req, res) => {
  const caseId = req.params.caseId;
  const data = req.body;
  const sql = `UPDATE cases SET contact_name=?, phone_number=?, pet_name=?, pet_species=?, pet_breed=?, initial_request=?, status=?, outcome=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE case_id=?`;
  db.run(
    sql,
    [
      data.contact_name || '',
      data.phone_number || '',
      data.pet_name || '',
      data.pet_species || '',
      data.pet_breed || '',
      data.initial_request || '',
      data.status || '',
      data.outcome || '',
      data.notes || '',
      caseId
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT * FROM cases WHERE case_id = ?', [caseId], (e, row) => {
        if (e) return res.status(500).json({ error: e.message });
        res.json({ case: row });
      });
    }
  );
});

// DELETE /api/cases/:caseId (soft delete)
router.delete('/:caseId', (req, res) => {
  const caseId = req.params.caseId;
  const sql = `UPDATE cases SET deleted = 1, updated_at=CURRENT_TIMESTAMP WHERE case_id = ?`;
  db.run(sql, [caseId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: true, caseId });
  });
});

// POST /api/cases/:caseId/recover
router.post('/:caseId/recover', (req, res) => {
  const caseId = req.params.caseId;
  const sql = `UPDATE cases SET deleted = 0, updated_at=CURRENT_TIMESTAMP WHERE case_id = ?`;
  db.run(sql, [caseId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ recovered: true, caseId });
  });
});

module.exports = router;