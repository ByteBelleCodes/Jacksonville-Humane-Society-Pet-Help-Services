import React, { useEffect, useState } from 'react';
import API from '../api';

// Small inline bar chart used by Dashboard (dependency-free)
function SmallBarChart({ items = [], labelKey = 'type', valueKey = 'count' }) {
  if (!items || items.length === 0) return <div style={{ color: '#666' }}>No data</div>;
  const max = Math.max(...items.map(i => Number(i[valueKey] || 0)), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((it, idx) => {
        const value = Number(it[valueKey] || 0);
        const pct = Math.round((value / max) * 100);
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 160, fontSize: 13, color: '#333' }}>{it[labelKey]}</div>
            <div style={{ flex: 1, height: 16, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#4caf50,#2e7d32)' }} />
            </div>
            <div style={{ width: 48, textAlign: 'right', fontWeight: 600 }}>{value}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const [counts, setCounts] = useState({ totalThisMonth: '-', topRequestTypes: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // lightweight sample: fetch a set of recent cases and derive simple metrics
        const res = await API.get('/cases/search?q=&limit=200');
        const rows = res.data.results || [];

        // basic total this month calculation: if created_at present, filter by month
        const now = new Date();
        const thisMonthRows = rows.filter(r => {
          if (!r.created_at) return false;
          const d = new Date(r.created_at);
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        });

        // aggregate top request types
        const freq = {};
        rows.forEach(r => {
          const k = r.initial_request || 'Unknown';
          freq[k] = (freq[k] || 0) + 1;
        });
        const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => ({ type: k, count: v }));

        setCounts({ totalThisMonth: thisMonthRows.length, topRequestTypes: top });
      } catch (e) {
        setCounts({ totalThisMonth: '-', topRequestTypes: [] });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ maxWidth: 980 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <div style={{ fontSize: 13, color: '#666' }}>Overview of recent activity</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 18 }}>
        <div style={{ padding: 16, borderRadius: 10, background: 'linear-gradient(180deg,#fff,#fbfdff)', boxShadow: '0 6px 18px rgba(16,24,40,0.06)' }}>
          <div style={{ fontSize: 12, color: '#666' }}>Cases — This month</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{loading ? '…' : counts.totalThisMonth}</div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Sample from recent records</div>
        </div>

        <div style={{ padding: 16, borderRadius: 10, background: '#fff', boxShadow: '0 6px 18px rgba(16,24,40,0.06)' }}>
          <div style={{ fontSize: 12, color: '#666' }}>Actions</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a href="/upload" style={{ padding: '8px 10px', background: '#0366d6', color: '#fff', borderRadius: 6, textDecoration: 'none' }}>Upload</a>
            <a href="/cases" style={{ padding: '8px 10px', background: '#f1f5f9', color: '#111', borderRadius: 6, textDecoration: 'none', border: '1px solid #e6eef6' }}>Cases</a>
            <a href="/reports" style={{ padding: '8px 10px', background: '#f1f5f9', color: '#111', borderRadius: 6, textDecoration: 'none', border: '1px solid #e6eef6' }}>Reports</a>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={{ padding: 16, borderRadius: 10, background: '#fff', boxShadow: '0 6px 18px rgba(16,24,40,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: 15 }}>Top Request Types</strong>
            <span style={{ fontSize: 12, color: '#666' }}>Sample</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <SmallBarChart items={counts.topRequestTypes} labelKey="type" valueKey="count" />
          </div>
        </div>

        <div style={{ padding: 16, borderRadius: 10, background: '#fff', boxShadow: '0 6px 18px rgba(16,24,40,0.06)' }}>
          <strong style={{ fontSize: 15 }}>Notes</strong>
          <div style={{ marginTop: 8, color: '#666', fontSize: 13 }}>
            This dashboard displays lightweight sample metrics derived from recent cases. For accurate KPIs, use the Reports summary endpoint which can aggregate across the full dataset and support date ranges.
          </div>
        </div>
      </div>
    </div>
  );
}