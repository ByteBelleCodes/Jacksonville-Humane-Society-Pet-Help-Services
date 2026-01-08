import React, { useState } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';
import CaseActions from './CaseActions';

/**
 * CaseList - supports toggling "Show deleted" to list soft-deleted cases.
 */
export default function CaseList() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function doSearch(e) {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      setError(null);
      setHasSearched(true);
      const params = { q };
      if (showDeleted) params.show_deleted = 1;
      const res = await API.get('/cases/search', { params });
      setResults(res.data.results || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  function onCaseActionCallback() {
    // refresh list after delete/recover
    doSearch();
  }

  return (
    <div className="stack">
      <h2>Cases</h2>
      {error ? (
        <div className="notice notice-error" role="alert">
          <div className="notice-title">Search failed</div>
          <div>{error}</div>
        </div>
      ) : null}

      <form onSubmit={doSearch} className="card row" style={{ marginBottom: 12 }} aria-busy={loading}>
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by phone or name"
          style={{ flex: 1, minWidth: 220 }}
        />
        <button type="submit" disabled={loading}>{loading ? 'Searching…' : 'Search'}</button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 0 }}>
          <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} />
          {' '}Show deleted
        </label>
      </form>

      {loading ? <div className="muted">Loading…</div> : null}

      {hasSearched && !loading && results.length === 0 ? (
        <div className="empty">No cases found.</div>
      ) : null}

      <ul>
        {results.map(r => (
          <li key={r.case_id} style={{ marginBottom: 8 }}>
            <Link to={`/cases/${r.case_id}`}>{r.contact_name || 'Unknown'} — {r.phone_number} — {r.pet_species}</Link>
            <span style={{ marginLeft: 12 }}>
              <CaseActions
                caseId={r.case_id}
                deleted={!!r.deleted}
                onUpdated={onCaseActionCallback}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}