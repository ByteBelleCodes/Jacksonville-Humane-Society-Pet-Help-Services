import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

/**
 * UploadPreview (enhanced)
 *
 * Features:
 * - Upload multiple files (CSV/JSON)
 * - Preview parsed rows for each file
 * - Edit any preview row inline (contact_name, phone_number, pet_name, pet_species, initial_request, notes)
 * - Select / deselect rows to control which rows are committed
 * - Select All per file
 * - Validate required fields (contact_name OR phone_number) before commit
 * - Commit only the selected & edited rows to POST /api/ingest/commit
 *
 * Notes:
 * - The server-side endpoints remain unchanged (POST /api/ingest/preview and POST /api/ingest/commit).
 * - This component works with the preview response format: { previews: [{ filename, count, rows: [...] }, ...] }
 */
export default function UploadPreview() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]); // [{ filename, count, rows: [{ ...row, _selected, _edited }], ... }]
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // percent 0-100 for preview upload
  const [validationErrors, setValidationErrors] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function handleFiles(e) {
    setFiles(Array.from(e.target.files));
  }

  // Call preview endpoint and convert rows to editable format
  async function previewUpload() {
    if (files.length === 0) {
      setError('Select one or more files first.');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to upload. Redirecting to login…');
      navigate('/login');
      return;
    }
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    setLoading(true);
    setMessage(null);
    setError(null);
    setValidationErrors([]);
    try {
      const res = await API.post('/ingest/preview', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          try {
            if (progressEvent.total) {
              const pct = Math.round((progressEvent.loaded / progressEvent.total) * 100);
              setUploadProgress(pct);
            }
          } catch (e) {
            // ignore progress errors
          }
        }
      });
      const raw = res.data.previews || [];
      // Normalize rows: add UI fields _selected and _edited (shallow copy)
      const norm = raw.map(p => ({
        filename: p.filename,
        count: p.count,
        rows: p.rows.map(r => ({
          ...r,
          _selected: true, // default: include in commit
          _edited: false,  // set to true when user edits
        }))
      }));
      setPreviews(norm);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Preview failed');
    } finally {
      setLoading(false);
      // clear progress after a short delay so users can see 100%
      setTimeout(() => setUploadProgress(null), 800);
    }
  }

  // Update a single cell in a preview row
  function updateRow(fileIndex, rowIndex, field, value) {
    setPreviews(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const row = copy[fileIndex].rows[rowIndex];
      row[field] = value;
      row._edited = true;
      // optional: mark file as having unsaved edits (not needed separately)
      return copy;
    });
  }

  // Toggle selection for a row
  function toggleRowSelected(fileIndex, rowIndex) {
    setPreviews(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const row = copy[fileIndex].rows[rowIndex];
      row._selected = !row._selected;
      return copy;
    });
  }

  // Select / deselect all rows in a file
  function toggleSelectAll(fileIndex, value) {
    setPreviews(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy[fileIndex].rows.forEach(r => (r._selected = value));
      return copy;
    });
  }

  // Remove (exclude) a row from commit (alias for deselect)
  function removeRow(fileIndex, rowIndex) {
    toggleRowSelected(fileIndex, rowIndex);
  }

  // Validate a list of records (rows) - returns array of problems
  function validateRecords(records) {
    const problems = [];
    records.forEach((r, idx) => {
      // require at least contact_name OR phone_number
      const name = (r.contact_name || '').toString().trim();
      const phone = (r.phone_number || '').toString().trim();
      if (!name && !phone) {
        problems.push({ rowIndex: idx, error: 'Missing contact_name and phone_number' });
      }
    });
    return problems;
  }

  // Commit selected rows only
  async function commitSelected() {
    if (!previews || previews.length === 0) {
      setError('No preview to commit. Upload files and preview first.');
      return;
    }

    // Flatten selected rows across files
    const selectedRecords = previews.flatMap((p) =>
      (p.rows || []).filter(r => r._selected).map(r => {
        // Remove UI-only keys before sending
        const copy = { ...r };
        delete copy._selected;
        delete copy._edited;
        return copy;
      })
    );

    if (selectedRecords.length === 0) {
      setError('No rows selected to commit. Select rows or use “Select All” for a file.');
      return;
    }

    // Validate
    const problems = validateRecords(selectedRecords);
    if (problems.length > 0) {
      // Build readable validation errors (show first 50)
      const errs = problems.slice(0, 50).map(p => `Row #${p.rowIndex + 1}: ${p.error}`);
      setValidationErrors(errs);
      window.scrollTo(0, 0);
      return;
    }

    // Confirm commit
    if (!confirm(`Commit ${selectedRecords.length} row(s) to the database?`)) return;

    try {
      setLoading(true);
      setError(null);
      const res = await API.post('/ingest/commit', { records: selectedRecords });
      const inserted = res.data.inserted || 0;
      setMessage(`Inserted ${inserted} records.`);
      // clear previews that were committed (remove selected rows from UI)
      setPreviews(prev => {
        const copy = JSON.parse(JSON.stringify(prev));
        copy.forEach(p => {
          p.rows = p.rows.filter(r => !r._selected);
        });
        // Optionally remove files with zero rows
        return copy.filter(p => p.rows.length > 0);
      });
      setFiles([]);
      setValidationErrors([]);
      // clear message after short delay
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Commit failed');
    } finally {
      setLoading(false);
    }
  }

  // Helper: count selected rows
  function countSelected(file) {
    if (!file || !file.rows) return 0;
    return file.rows.reduce((s, r) => s + (r._selected ? 1 : 0), 0);
  }

  return (
    <div className="stack">
      <h2>Upload & Preview (Edit before Commit)</h2>

      {message ? (
        <div className="notice notice-success" role="status" aria-live="polite">
          <div className="notice-title">Success</div>
          <div>{message}</div>
        </div>
      ) : null}

      {error ? (
        <div className="notice notice-error" role="alert">
          <div className="notice-title">Action failed</div>
          <div>{error}</div>
        </div>
      ) : null}

      <div className="card row" style={{ marginBottom: 12 }} aria-busy={loading}>
        <input type="file" multiple onChange={handleFiles} />
        <button onClick={previewUpload} disabled={loading || files.length === 0}>
          {loading ? 'Previewing...' : 'Preview'}
        </button>
        <div className="muted">Select files, preview, edit rows, then commit.</div>
      </div>

      {uploadProgress !== null && (
        <div className="card">
          <div className="row" style={{ marginBottom: 8 }}>
            <strong>Upload progress</strong>
            <span className="muted">{uploadProgress}%</span>
          </div>
          <div className="progress" aria-label="Upload progress">
            <i style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {validationErrors && validationErrors.length > 0 && (
        <div className="notice notice-warn" role="status" aria-live="polite">
          <div className="notice-title">Validation errors</div>
          <div className="muted">Fix these before commit:</div>
          <ul>
            {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {previews && previews.length > 0 && (
        <>
          <h3>Preview</h3>

          {previews.map((p, fileIndex) => (
            <div key={fileIndex} className="card" style={{ marginBottom: 16 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <strong>{p.filename}</strong> — {p.count} rows (showing preview rows)
                </div>
                <div>
                  <button type="button" className="btn-outline" onClick={() => toggleSelectAll(fileIndex, true)}>Select All</button>
                  <button type="button" className="btn-outline" onClick={() => toggleSelectAll(fileIndex, false)} style={{ marginLeft: 8 }}>Deselect All</button>
                  <span style={{ marginLeft: 12 }}>{countSelected(p)} selected</span>
                </div>
              </div>

              <div style={{ maxHeight: 320, overflow: 'auto' }}>
                <table className="preview-table">
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      <th style={{ padding: 6 }}>Sel</th>
                      <th style={{ padding: 6 }}>#</th>
                      <th style={{ padding: 6 }}>Contact name</th>
                      <th style={{ padding: 6 }}>Phone</th>
                      <th style={{ padding: 6 }}>Pet</th>
                      <th style={{ padding: 6 }}>Species</th>
                      <th style={{ padding: 6 }}>Request</th>
                      <th style={{ padding: 6 }}>Notes</th>
                      <th style={{ padding: 6 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.rows.map((r, rowIndex) => (
                      <tr key={rowIndex} style={{ borderBottom: '1px solid #f1f1f1' }}>
                        <td style={{ padding: 6 }}>
                          <input type="checkbox" checked={!!r._selected} onChange={() => toggleRowSelected(fileIndex, rowIndex)} />
                        </td>
                        <td style={{ padding: 6 }}>{rowIndex + 1}</td>
                        <td style={{ padding: 6 }}>
                          <input
                            type="text"
                            value={r.contact_name || ''}
                            onChange={(e) => updateRow(fileIndex, rowIndex, 'contact_name', e.target.value)}
                            style={{ width: 200 }}
                          />
                        </td>
                        <td style={{ padding: 6 }}>
                          <input
                            type="text"
                            value={r.phone_number || ''}
                            onChange={(e) => updateRow(fileIndex, rowIndex, 'phone_number', e.target.value)}
                            style={{ width: 140 }}
                          />
                        </td>
                        <td style={{ padding: 6 }}>
                          <input
                            type="text"
                            value={r.pet_name || ''}
                            onChange={(e) => updateRow(fileIndex, rowIndex, 'pet_name', e.target.value)}
                            style={{ width: 140 }}
                          />
                        </td>
                        <td style={{ padding: 6 }}>
                          <input
                            type="text"
                            value={r.pet_species || ''}
                            onChange={(e) => updateRow(fileIndex, rowIndex, 'pet_species', e.target.value)}
                            style={{ width: 120 }}
                          />
                        </td>
                        <td style={{ padding: 6 }}>
                          <input
                            type="text"
                            value={r.initial_request || ''}
                            onChange={(e) => updateRow(fileIndex, rowIndex, 'initial_request', e.target.value)}
                            style={{ width: 240 }}
                          />
                        </td>
                        <td style={{ padding: 6 }}>
                          <input
                            type="text"
                            value={r.notes || ''}
                            onChange={(e) => updateRow(fileIndex, rowIndex, 'notes', e.target.value)}
                            style={{ width: 240 }}
                          />
                        </td>
                        <td style={{ padding: 6 }}>
                          <button type="button" className="btn-outline" onClick={() => removeRow(fileIndex, rowIndex)} title="Deselect / exclude this row">Exclude</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="row">
            <button onClick={commitSelected} disabled={loading || previews.length === 0}>
              {loading ? 'Committing...' : 'Commit selected rows to database'}
            </button>

            <button type="button" className="btn-outline" onClick={() => { setPreviews([]); setFiles([]); setValidationErrors([]); setError(null); }}>
              Clear preview
            </button>
          </div>
        </>
      )}
    </div>
  );
}