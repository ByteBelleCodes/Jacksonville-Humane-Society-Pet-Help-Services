const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { parseCSVContents, normalizeRecord } = require('../utils/fileparser');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
const upload = multer({ dest: uploadDir });

// Require authentication for upload/preview and commit
router.use(requireAuth);

// POST /api/ingest/preview
router.post('/preview', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const previews = [];
    for (const f of req.files) {
      const content = await fs.readFile(f.path, 'utf8');
      let records = [];
      if (f.mimetype === 'application/json' || f.originalname.endsWith('.json')) {
        try {
          const json = JSON.parse(content);
          if (Array.isArray(json)) records = json;
          else if (json.records) records = json.records;
          else records = [json];
        } catch (e) {
          await fs.unlink(f.path).catch(() => {});
          return res.status(400).json({ error: 'Invalid JSON in file ' + f.originalname });
        }
      } else {
        // assume CSV
        records = parseCSVContents(content);
      }
      const mapped = records.map(r => {
        const normalized = normalizeRecord(r, f.originalname);
        normalized.case_id = uuidv4();
        return normalized;
      });
      previews.push({
        filename: f.originalname,
        count: mapped.length,
        rows: mapped.slice(0, 200)
      });
      await fs.unlink(f.path).catch(() => {});
    }
    res.json({ previews });
  } catch (err) {
    console.error('Preview failed', err);
    res.status(500).json({ error: 'Preview failed', details: err.message });
  }
});

// POST /api/ingest/commit
router.post('/commit', async (req, res) => {
  const db = require('../db');
  const records = req.body.records;
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'No records to commit' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    try {
      const stmt = db.prepare(`INSERT OR IGNORE INTO cases
        (case_external_id, case_id, contact_name, phone_number, pet_name, pet_species, pet_breed, initial_request, source_system, status, outcome, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      for (const r of records) {
        stmt.run(
          r.case_external_id || null,
          r.case_id || uuidv4(),
          r.contact_name || '',
          r.phone_number || '',
          r.pet_name || '',
          r.pet_species || '',
          r.pet_breed || '',
          r.initial_request || '',
          r.source_system || '',
          r.status || 'open',
          r.outcome || '',
          r.notes || ''
        );
      }
      stmt.finalize();
      db.run('COMMIT', () => {
        res.json({ inserted: records.length });
      });
    } catch (err) {
      console.error('Commit failed', err);
      db.run('ROLLBACK', () => {
        res.status(500).json({ error: 'Commit failed', details: err.message });
      });
    }
  });
});

module.exports = router;