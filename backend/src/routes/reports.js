const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

/**
 * Reports routes (protected)
 * - GET /api/reports/outcomes            => JSON { rows: [{ outcome, count }] }
 * - GET /api/reports/outcomes.csv        => CSV download
 * - GET /api/reports/species             => JSON { rows: [{ species, count }] }
 * - GET /api/reports/species.csv         => CSV download
 *
 * Note: these endpoints exclude soft-deleted cases (deleted = 1).
 */

router.use(requireAuth);

// Helper to generate CSV safely (simple escaping)
function toCSV(rows, headers) {
  // headers: array of strings
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [];
  lines.push(headers.join(','));
  for (const r of rows) {
    const vals = headers.map(h => escape(r[h] ?? r[h.toLowerCase()]));
    lines.push(vals.join(','));
  }
  return lines.join('\n');
}

// GET JSON: outcomes
router.get('/outcomes', (req, res) => {
  const sql = `
    SELECT COALESCE(outcome, '') AS outcome, COUNT(*) AS count
    FROM cases
    WHERE deleted = 0
    GROUP BY outcome
    ORDER BY count DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ rows });
  });
});


// GET JSON: summary/dashboard
// Returns a small set of KPIs used for the dashboard:
// - total_cases_this_month
// - total_cases_all
// - open_cases
// - top_requests_this_month: [{ request, count }]
// - cases_by_source: [{ source, count }]
router.get('/summary', (req, res) => {
  // total cases this month (exclude deleted)
  const totalThisMonthSql = `
    SELECT COUNT(*) AS total
    FROM cases
    WHERE deleted = 0
      AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
  `;

  // total cases overall
  const totalAllSql = `SELECT COUNT(*) AS total FROM cases WHERE deleted = 0`;

  // open cases
  const openSql = `SELECT COUNT(*) AS total FROM cases WHERE deleted = 0 AND (status IS NULL OR status = '' OR status = 'open')`;

  // top requests this month (group by initial_request)
  const topReqSql = `
    SELECT COALESCE(initial_request, '(unspecified)') AS request, COUNT(*) AS count
    FROM cases
    WHERE deleted = 0
      AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    GROUP BY request
    ORDER BY count DESC
    LIMIT 8
  `;

  // cases by source
  const bySourceSql = `
    SELECT COALESCE(source_system, '(unknown)') AS source, COUNT(*) AS count
    FROM cases
    WHERE deleted = 0
    GROUP BY source
    ORDER BY count DESC
  `;

  const dbTasks = [
    { sql: totalThisMonthSql },
    { sql: totalAllSql },
    { sql: openSql },
    { sql: topReqSql },
    { sql: bySourceSql }
  ];

  // Execute queries in series and assemble response
  db.serialize(() => {
    try {
      db.get(totalThisMonthSql, [], (err, row1) => {
        if (err) return res.status(500).json({ error: err.message });
        db.get(totalAllSql, [], (err2, row2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          db.get(openSql, [], (err3, row3) => {
            if (err3) return res.status(500).json({ error: err3.message });
            db.all(topReqSql, [], (err4, topRows) => {
              if (err4) return res.status(500).json({ error: err4.message });
              db.all(bySourceSql, [], (err5, srcRows) => {
                if (err5) return res.status(500).json({ error: err5.message });
                res.json({
                  total_cases_this_month: row1?.total || 0,
                  total_cases_all: row2?.total || 0,
                  open_cases: row3?.total || 0,
                  top_requests_this_month: (topRows || []).map(r => ({ request: r.request, count: r.count })),
                  cases_by_source: (srcRows || []).map(r => ({ source: r.source, count: r.count }))
                });
              });
            });
          });
        });
      });
    } catch (ex) {
      console.error('Summary failed', ex);
      res.status(500).json({ error: ex.message });
    }
  });
});

// GET CSV: outcomes
router.get('/outcomes.csv', (req, res) => {
  const sql = `
    SELECT COALESCE(outcome, '') AS outcome, COUNT(*) AS count
    FROM cases
    WHERE deleted = 0
    GROUP BY outcome
    ORDER BY count DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const csv = toCSV(rows, ['outcome', 'count']);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="outcomes_report.csv"');
    res.send(csv);
  });
});

// GET JSON: species
router.get('/species', (req, res) => {
  const sql = `
    SELECT COALESCE(pet_species, '') AS species, COUNT(*) AS count
    FROM cases
    WHERE deleted = 0
    GROUP BY species
    ORDER BY count DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // normalize key name to "species" in result rows
    const mapped = rows.map(r => ({ species: r.species, count: r.count }));
    res.json({ rows: mapped });
  });
});

// GET CSV: species
router.get('/species.csv', (req, res) => {
  const sql = `
    SELECT COALESCE(pet_species, '') AS species, COUNT(*) AS count
    FROM cases
    WHERE deleted = 0
    GROUP BY species
    ORDER BY count DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const csvRows = rows.map(r => ({ species: r.species, count: r.count }));
    const csv = toCSV(csvRows, ['species', 'count']);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="species_report.csv"');
    res.send(csv);
  });
});

module.exports = router;