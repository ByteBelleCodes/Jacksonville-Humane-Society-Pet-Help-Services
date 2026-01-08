import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import CaseActions from './CaseActions';

export default function CaseEditor() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [inlineWarn, setInlineWarn] = useState(null);

  useEffect(() => {
    async function loadCase() {
      setLoading(true);
      try {
        const res = await API.get(`/cases/${caseId}`);
        setCaseData(res.data.case);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load case');
      } finally {
        setLoading(false);
      }
    }
    if (caseId) loadCase();
  }, [caseId]);

  function updateField(field, value) {
    setCaseData(prev => ({ ...prev, [field]: value }));
  }

  const isSaveDisabled = !caseData || (!caseData.contact_name && !caseData.phone_number);

  async function saveChanges() {
    if (!caseData) return;
    if (isSaveDisabled) {
      setError('Contact Name or Phone Number required before saving.');
      return;
    }
    setSaving(true);
    setMessage(null);
    setError(null);
    setInlineWarn(null);
    try {
      await API.put(`/cases/${caseId}`, caseData);
      setMessage('Saved successfully.');
      const res = await API.get(`/cases/${caseId}`);
      setCaseData(res.data.case);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Save failed');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  // Handler for CaseActions callback
  async function onCaseAction({ action, caseId: actedId }) {
    if (action === 'deleted') {
      // after delete, navigate back to cases list
      navigate('/cases');
    } else if (action === 'recovered') {
      // after recover, reload case details
      try {
        const res = await API.get(`/cases/${actedId}`);
        setCaseData(res.data.case);
        setMessage('Case restored.');
        setTimeout(() => setMessage(null), 3000);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to reload case after restore');
      }
    }
  }

  if (loading) return <div>Loading case...</div>;
  if (error && !caseData) {
    return (
      <div className="stack" style={{ maxWidth: 900 }}>
        <h2>Case Editor</h2>
        <div className="notice notice-error" role="alert">
          <div className="notice-title">Couldn’t load case</div>
          <div>{error}</div>
        </div>
        <div className="row">
          <button type="button" className="btn-outline" onClick={() => navigate('/cases')}>Back to Cases</button>
        </div>
      </div>
    );
  }
  if (!caseData) return <div>No case data found.</div>;

  function viewPastVisits() {
    const phone = caseData.phone_number || '';
    if (!phone) {
      setInlineWarn('No phone number available for this case.');
      return;
    }
    // navigate to PastVisits page with phone param
    navigate(`/visits?phone=${encodeURIComponent(phone)}`);
  }

  return (
    <div className="stack" style={{ maxWidth: 900 }}>
      <h2>Case Editor</h2>

      {message ? (
        <div className="notice notice-success" role="status" aria-live="polite">
          <div className="notice-title">Saved</div>
          <div>{message}</div>
        </div>
      ) : null}

      {error ? (
        <div className="notice notice-error" role="alert">
          <div className="notice-title">Couldn’t save</div>
          <div>{error}</div>
        </div>
      ) : null}

      {inlineWarn ? (
        <div className="notice notice-warn" role="status" aria-live="polite">
          <div className="notice-title">Note</div>
          <div>{inlineWarn}</div>
        </div>
      ) : null}

      <div className="card stack">
        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Case ID (canonical)</label>
          <div style={{ padding: 6, background: 'var(--surface)', borderRadius: 8 }}>{caseData.case_id}</div>
        </div>

        <label>
          Contact Name
          <input
            value={caseData.contact_name || ''}
            onChange={e => updateField('contact_name', e.target.value)}
            style={{ width: '100%' }}
          />
        </label>

        <label>
          Phone Number
          <input
            value={caseData.phone_number || ''}
            onChange={e => updateField('phone_number', e.target.value)}
            style={{ width: '100%' }}
          />
        </label>

        <label>
          Pet Name
          <input
            value={caseData.pet_name || ''}
            onChange={e => updateField('pet_name', e.target.value)}
            style={{ width: '100%' }}
          />
        </label>

        <label>
          Pet Species
          <input
            value={caseData.pet_species || ''}
            onChange={e => updateField('pet_species', e.target.value)}
            style={{ width: '100%' }}
          />
        </label>

        <label>
          Pet Breed
          <input
            value={caseData.pet_breed || ''}
            onChange={e => updateField('pet_breed', e.target.value)}
            style={{ width: '100%' }}
          />
        </label>

        <label>
          Initial Request
          <input
            value={caseData.initial_request || ''}
            onChange={e => updateField('initial_request', e.target.value)}
            style={{ width: '100%' }}
          />
        </label>

        <label>
          Source System
          <input
            value={caseData.source_system || ''}
            onChange={e => updateField('source_system', e.target.value)}
            style={{ width: '100%' }}
          />
        </label>

        <label>
          Status
          <select
            value={caseData.status || ''}
            onChange={(e) => updateField('status', e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">-- Select Status --</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </label>

        <label>
          Outcome
          <select
            value={caseData.outcome || ''}
            onChange={(e) => updateField('outcome', e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">-- Select Outcome --</option>
            <option value="pet_kept_in_home">Pet kept in home</option>
            <option value="referred_to_vet">Referred to vet</option>
            <option value="surrendered">Surrendered</option>
            <option value="returned_to_owner">Returned to owner</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label>
          Notes
          <textarea
            value={caseData.notes || ''}
            onChange={e => updateField('notes', e.target.value)}
            style={{ width: '100%', minHeight: 120 }}
          />
        </label>

        <div className="row" style={{ marginTop: 8 }}>
          <button onClick={saveChanges} disabled={saving || isSaveDisabled}>
            {saving ? 'Saving…' : 'Save'}
          </button>

          {/* Use the reusable CaseActions component for delete/restore */}
          <CaseActions
            caseId={caseData.case_id}
            deleted={caseData.deleted}
            onUpdated={onCaseAction}
          />

          <button onClick={viewPastVisits}>
            View Past Visits
          </button>

          <div className="spacer" />
          <button className="btn-outline" onClick={() => navigate('/cases')}>
            Back to Cases
          </button>
        </div>

        {isSaveDisabled ? (
          <div className="notice notice-warn" role="status" aria-live="polite">
            <div className="notice-title">Required</div>
            <div>Please provide at least Contact Name or Phone Number before saving.</div>
          </div>
        ) : null}

        <div className="muted" style={{ marginTop: 12, fontSize: 13 }}>
          <div>Created: {caseData.created_at}</div>
          <div>Updated: {caseData.updated_at}</div>
          <div>Deleted (soft): {caseData.deleted ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </div>
  );
}