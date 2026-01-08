import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../api';

/**
 * PastVisits
 * - Reads ?phone= from query string
 * - Calls GET /api/cases/history?phone=<phone>
 * - Displays all matching cases sorted newest-first (backend ensures order)
 */
export default function PastVisits() {
  const [searchParams] = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      if (!phone) return;
      setLoading(true);
      setError(null);
      try {
        const res = await API.get('/cases/history', { params: { phone } });
        setVisits(res.data.results || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load past visits');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [phone]);

  return (
    <div>
      <h2>Past Visit History</h2>
      {!phone && <div>Please provide a phone number in the URL, e.g. <code>?phone=9045551234</code></div>}
      {phone && <div>Showing past visits for phone: <strong>{phone}</strong></div>}

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {!loading && visits.length === 0 && phone && <div>No past visits found for this phone number.</div>}

      {visits.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 6 }}>Date</th>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 6 }}>Contact</th>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 6 }}>Phone</th>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 6 }}>Pet</th>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 6 }}>Request</th>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 6 }}>Status</th>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 6 }}>Outcome</th>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 6 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visits.map(v => (
              <tr key={v.case_id}>
                <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{v.created_at}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{v.contact_name}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{v.phone_number}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{v.pet_name} ({v.pet_species})</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{v.initial_request}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{v.status}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{v.outcome}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>
                  <Link to={`/cases/${v.case_id}`}>Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}