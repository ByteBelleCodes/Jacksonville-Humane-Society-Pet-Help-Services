import React, { useState } from 'react';
import API from '../api';

/**
 * CaseActions
 * Props:
 *  - caseId: canonical case_id (string) (required)
 *  - deleted: boolean (true if case is currently soft-deleted)
 *  - onUpdated: optional callback ({ action, caseId }) => void called after successful delete/recover
 *  - confirmText: optional string for delete confirmation
 */
export default function CaseActions({ caseId, deleted = false, onUpdated, confirmText }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  async function handleDelete() {
    if (!confirm(confirmText || 'Soft delete this case? This will hide it from normal searches but it can be recovered.')) return;
    setProcessing(true);
    setError(null);
    try {
      await API.delete(`/cases/${caseId}`);
      setProcessing(false);
      if (typeof onUpdated === 'function') onUpdated({ action: 'deleted', caseId });
    } catch (err) {
      setProcessing(false);
      setError(err.response?.data?.error || err.message || 'Delete failed');
    }
  }

  async function handleRecover() {
    if (!confirm('Restore this case from soft-delete?')) return;
    setProcessing(true);
    setError(null);
    try {
      await API.post(`/cases/${caseId}/recover`);
      setProcessing(false);
      if (typeof onUpdated === 'function') onUpdated({ action: 'recovered', caseId });
    } catch (err) {
      setProcessing(false);
      setError(err.response?.data?.error || err.message || 'Recover failed');
    }
  }

  return (
    <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!deleted ? (
        <button
          onClick={handleDelete}
          disabled={processing}
          style={{ background: '#f8d7da', border: '1px solid #f5c6cb', padding: '6px 10px' }}
          title="Soft delete this case"
        >
          {processing ? 'Deleting...' : 'Delete (soft)'}
        </button>
      ) : (
        <button
          onClick={handleRecover}
          disabled={processing}
          style={{ background: '#d4edda', border: '1px solid #c3e6cb', padding: '6px 10px' }}
          title="Restore this case"
        >
          {processing ? 'Restoring...' : 'Restore case'}
        </button>
      )}
    </div>
  );
}