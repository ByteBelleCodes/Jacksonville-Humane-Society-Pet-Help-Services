import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

/**
 * CreateCase - manual form to create a single Case (no CSV required)
 *
 * Fields:
 *  - contact_name
 *  - phone_number
 *  - pet_species
 *  - initial_request
 *  - notes
 *  - status
 *
 * Requirements:
 *  - allow creating a case from UI only
 *  - require at least contact_name OR phone_number before submit
 *  - on success navigate to the Case Editor for the created case
 */
export default function CreateCase() {
  const [form, setForm] = useState({
    contact_name: '',
    phone_number: '',
    pet_species: '',
    initial_request: '',
    notes: '',
    status: 'open'
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  const isDisabled = !form.contact_name.trim() && !form.phone_number.trim();

  async function handleSubmit(e) {
    e && e.preventDefault();
    setError(null);
    if (isDisabled) {
      setError('Please provide at least Contact Name or Phone Number before creating the case.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        contact_name: form.contact_name.trim(),
        phone_number: form.phone_number.trim(),
        pet_species: form.pet_species.trim(),
        initial_request: form.initial_request.trim(),
        notes: form.notes.trim(),
        status: form.status || 'open'
      };
      const res = await API.post('/cases', payload);
      const created = res.data.case;
      setMessage('Case created successfully.');
      setTimeout(() => setMessage(null), 3000);
      // navigate to the case editor for the newly created case
      if (created && created.case_id) {
        navigate(`/cases/${created.case_id}`);
      } else {
        // fallback: go back to cases list
        navigate('/cases');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack" style={{ maxWidth: 760 }}>
      <h2>Create New Case</h2>

      {message ? (
        <div className="notice notice-success" role="status" aria-live="polite">
          <div className="notice-title">Success</div>
          <div>{message}</div>
        </div>
      ) : null}

      {error ? (
        <div className="notice notice-error" role="alert">
          <div className="notice-title">Couldn’t create case</div>
          <div>{error}</div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="card form-grid" aria-busy={saving}>
        <div>
          <label htmlFor="create-contact">Contact name</label>
          <input
            id="create-contact"
            type="text"
            value={form.contact_name}
            onChange={e => updateField('contact_name', e.target.value)}
            style={{ width: '100%' }}
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label htmlFor="create-phone">Phone</label>
          <input
            id="create-phone"
            type="tel"
            value={form.phone_number}
            onChange={e => updateField('phone_number', e.target.value)}
            style={{ width: '100%' }}
            placeholder="9045551234"
          />
        </div>

        <div>
          <label htmlFor="create-species">Pet species</label>
          <input
            id="create-species"
            type="text"
            value={form.pet_species}
            onChange={e => updateField('pet_species', e.target.value)}
            style={{ width: '100%' }}
            placeholder="Dog / Cat"
          />
        </div>

        <div>
          <label htmlFor="create-request">Request</label>
          <input
            id="create-request"
            type="text"
            value={form.initial_request}
            onChange={e => updateField('initial_request', e.target.value)}
            style={{ width: '100%' }}
            placeholder="Needs food assistance"
          />
        </div>

        <div>
          <label htmlFor="create-notes">Notes</label>
          <textarea
            id="create-notes"
            value={form.notes}
            onChange={e => updateField('notes', e.target.value)}
            style={{ width: '100%', minHeight: 100 }}
            placeholder="Optional notes..."
          />
        </div>

        <div>
          <label htmlFor="create-status">Status</label>
          <select
            id="create-status"
            value={form.status}
            onChange={e => updateField('status', e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {isDisabled ? (
          <div className="notice notice-warn" role="status" aria-live="polite">
            <div className="notice-title">Required</div>
            <div>Please provide at least Contact Name or Phone Number before creating.</div>
          </div>
        ) : null}

        <div className="row">
          <button type="submit" disabled={saving || isDisabled}>
            {saving ? 'Creating…' : 'Create Case'}
          </button>
          <div className="spacer" />
          <button type="button" className="btn-outline" onClick={() => navigate('/cases')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}