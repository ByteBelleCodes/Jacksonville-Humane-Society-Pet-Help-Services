import React, { useEffect, useState } from 'react';
import API from '../api';

/**
 * Reports page
 * - Shows Outcome report and Species report (JSON) and provides Export CSV buttons for each.
 * - Uses API.get and API.get with responseType 'blob' to download CSV while preserving Authorization header.
 */
export default function Reports() {
  // Small inline horizontal bar chart for compact visualization (keeps dependency-free)
  function BarChart({ data = [], labelKey = 'request', valueKey = 'count' }) {
    if (!data || data.length === 0) return <div style={{ color: '#666' }}>No data</div>;
    const max = Math.max(...data.map(d => Number(d[valueKey] || 0)), 1);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.map((d, i) => {
          const value = Number(d[valueKey] || 0);
          const pct = Math.round((value / max) * 100);
          const label = d[labelKey] || '(unspecified)';
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 160, fontSize: 13, color: '#333' }}>{label}</div>
              <div style={{ flex: 1, background: '#f1f5f9', height: 18, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#4caf50,#2e7d32)' }} />
              </div>
              <div style={{ width: 48, textAlign: 'right', fontWeight: 600 }}>{value}</div>
            </div>
          );
        })}
      </div>
    );
  }

  const [outcomes, setOutcomes] = useState([]);
  const [species, setSpecies] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loadingOutcomes, setLoadingOutcomes] = useState(false);
  const [loadingSpecies, setLoadingSpecies] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadSummary();
    loadOutcomes();
    loadSpecies();
    // eslint-disable-next-line
  }, []);

  async function loadOutcomes() {
    setLoadingOutcomes(true);
    setError(null);
    try {
      const res = await API.get('/reports/outcomes');
      setOutcomes(res.data.rows || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load outcomes');
    } finally {
      setLoadingOutcomes(false);
    }
  }

  async function loadSpecies() {
    setLoadingSpecies(true);
    setError(null);
    try {
      const res = await API.get('/reports/species');
      setSpecies(res.data.rows || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load species');
    } finally {
      setLoadingSpecies(false);
    }
  }

  async function loadSummary() {
    setLoadingSummary(true);
    setError(null);
    try {
      const res = await API.get('/reports/summary');
      setSummary(res.data || null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load summary');
    } finally {
      setLoadingSummary(false);
    }
  }

  function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  async function exportCSV(path, filename) {
    try {
      setError(null);
      setMessage(null);
      const res = await API.get(path, { responseType: 'blob' });
      downloadBlob(res.data, filename);
      setMessage(`Downloaded ${filename}`);
      setTimeout(() => setMessage(null), 2500);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'CSV export failed');
    }
  }

  return (
    <div className="stack" style={{ maxWidth: 960 }}>
      <h2>Reports</h2>
      {message ? (
        <div className="notice notice-success" role="status" aria-live="polite">
          <div className="notice-title">Done</div>
          <div>{message}</div>
        </div>
      ) : null}

      {error ? (
        <div className="notice notice-error" role="alert">
          <div className="notice-title">Reports error</div>
          <div>{error}</div>
        </div>
      ) : null}

      <section style={{ marginBottom: 24 }}>
        <h3>Dashboard Summary</h3>
        <div className="row" style={{ marginBottom: 12 }}>
          <button onClick={loadSummary} disabled={loadingSummary}>{loadingSummary ? 'Refreshing…' : 'Refresh summary'}</button>
          <button className="btn-outline" onClick={() => loadOutcomes()} disabled={loadingOutcomes}>Refresh outcomes</button>
          <button className="btn-outline" onClick={() => loadSpecies()} disabled={loadingSpecies}>Refresh species</button>
        </div>

        {loadingSummary ? <div>Loading summary...</div> : (
          <div className="grid grid-cards" style={{ alignItems: 'start' }}>
            <div className="card card-quiet">
              <div className="kpi-sub">Total — This period</div>
              <div className="kpi">{summary ? summary.total_cases_this_month : '—'}</div>
              <div className="kpi-sub">All time: <strong style={{ color: 'var(--text)' }}>{summary ? summary.total_cases_all : '—'}</strong></div>
            </div>

            <div className="card card-quiet">
              <div className="kpi-sub">Open cases</div>
              <div className="kpi" style={{ color: 'var(--danger)' }}>{summary ? summary.open_cases : '—'}</div>
              <div className="kpi-sub">Active follow-ups</div>
            </div>

            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong>Top requests</strong>
                <span className="muted" style={{ fontSize: 12 }}>Period: this month</span>
              </div>
              <div style={{ marginTop: 12 }}>
                <BarChart data={summary?.top_requests_this_month || []} />
              </div>
            </div>

            <div className="card">
              <strong>Cases by source</strong>
              <div style={{ marginTop: 8 }}>
                {(summary?.cases_by_source || []).length === 0 && <div className="muted">None</div>}
                {(summary?.cases_by_source || []).map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i === (summary.cases_by_source.length - 1) ? 'none' : '1px dashed #eee' }}>
                    <div>{s.source}</div>
                    <div style={{ fontWeight: 700 }}>{s.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3>Outcome Report</h3>
        <div className="row" style={{ marginBottom: 8 }}>
          <button className="btn-outline" onClick={() => exportCSV('/reports/outcomes.csv', 'outcomes_report.csv')}>Export CSV</button>
          <button className="btn-outline" onClick={loadOutcomes} disabled={loadingOutcomes}>Refresh</button>
        </div>
        {loadingOutcomes ? <div className="muted">Loading…</div> : (
          <table>
            <thead>
              <tr>
                <th>Outcome</th>
                <th style={{ textAlign: 'right' }}>Count</th>
              </tr>
            </thead>
            <tbody>
              {outcomes.map((r, i) => (
                <tr key={i}>
                  <td>{r.outcome || '(unspecified)'}</td>
                  <td style={{ textAlign: 'right' }}>{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h3>Species Report</h3>
        <div className="row" style={{ marginBottom: 8 }}>
          <button className="btn-outline" onClick={() => exportCSV('/reports/species.csv', 'species_report.csv')}>Export CSV</button>
          <button className="btn-outline" onClick={loadSpecies} disabled={loadingSpecies}>Refresh</button>
        </div>
        {loadingSpecies ? <div className="muted">Loading…</div> : (
          <table>
            <thead>
              <tr>
                <th>Species</th>
                <th style={{ textAlign: 'right' }}>Count</th>
              </tr>
            </thead>
            <tbody>
              {species.map((r, i) => (
                <tr key={i}>
                  <td>{r.species || '(unspecified)'}</td>
                  <td style={{ textAlign: 'right' }}>{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}