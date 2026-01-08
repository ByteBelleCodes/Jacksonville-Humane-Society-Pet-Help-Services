import React, { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ email: '', full_name: '', role: 'staff', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  function ensureLoggedIn() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      navigate('/login');
      return false;
    }
    const parsed = JSON.parse(user);
    if (parsed.role !== 'admin') {
      setError('Admin access required.');
      navigate('/');
      return false;
    }
    return true;
  }

  async function loadUsers() {
    if (!ensureLoggedIn()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Failed to load users');
      // if 401/403, redirect to login
      if (e.response?.status === 401 || e.response?.status === 403) navigate('/login');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); /* eslint-disable-next-line */ }, []);

  async function toggleUser(u) {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      await API.post(`/admin/users/${u.id}/toggle`, { active: u.active ? 0 : 1 });
      setMessage(`User ${u.active ? 'deactivated' : 'activated'}.`);
      loadUsers();
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Toggle failed');
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(u) {
    const p = prompt('Enter new password for ' + u.email, 'ChangeMe123');
    if (!p) return;
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      await API.post(`/admin/users/${u.id}/reset-password`, { password: p });
      setMessage('Password reset.');
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  }

  async function createUser(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      await API.post('/admin/users', form);
      setForm({ email: '', full_name: '', role: 'staff', password: '' });
      setMessage('User created.');
      loadUsers();
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <h2>Admin — Users</h2>
      {message ? (
        <div className="notice notice-success" role="status" aria-live="polite">
          <div className="notice-title">Done</div>
          <div>{message}</div>
        </div>
      ) : null}

      {error ? (
        <div className="notice notice-error" role="alert">
          <div className="notice-title">Admin action failed</div>
          <div>{error}</div>
        </div>
      ) : null}

      <form onSubmit={createUser} className="card row" style={{ marginBottom: 12 }} aria-busy={loading}>
        <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input type="text" placeholder="Full name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
          <option value="staff">staff</option>
          <option value="admin">admin</option>
        </select>
        <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <button type="submit" disabled={loading}>Create User</button>
      </form>

      {loading ? <div className="muted">Loading…</div> : null}

      <table>
        <thead>
          <tr><th>Email</th><th>Name</th><th>Role</th><th>Active</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.full_name}</td>
              <td>{u.role}</td>
              <td>{u.active ? 'Yes' : 'No'}</td>
              <td>
                <button className="btn-outline" onClick={() => toggleUser(u)} disabled={loading}>{u.active ? 'Deactivate' : 'Activate'}</button>
                <button className="btn-outline" onClick={() => resetPassword(u)} disabled={loading} style={{ marginLeft: 8 }}>Reset Password</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}