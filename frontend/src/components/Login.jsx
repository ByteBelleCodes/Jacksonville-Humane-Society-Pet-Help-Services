import React, { useState } from 'react';
import API from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Login - uses AuthContext.login to set auth state without reloading the page.
 * On success we store token & user via the context (context will persist to localStorage).
 */
export default function Login() {
  const [email, setEmail] = useState('admin@jhs.local');
  const [password, setPassword] = useState('AdminPass123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  async function doLogin(e) {
    e && e.preventDefault();
    setError(null);
    const trimmedEmail = (email || '').trim();
    if (!trimmedEmail) {
      setError('Please enter your email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email: trimmedEmail, password });
      const token = res.data.token;
      const user = res.data.user || { email: trimmedEmail };
      // update context (and context will persist)
      auth.login(token, user);
      // navigate back to original page
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function doLogout() {
    auth.logout();
    navigate('/login');
  }

  const loggedIn = auth.isAuthenticated;
  const user = auth.user;

  return (
    <div className="stack" style={{ maxWidth: 520 }}>
      <h2>Login</h2>

      {loggedIn ? (
        <div className="notice notice-warn" role="status" aria-live="polite">
          <div className="notice-title">Already signed in</div>
          <div>You are currently logged in{user?.email ? ` as ${user.email}` : ''}.</div>
          <div className="row" style={{ marginTop: 10 }}>
            <button type="button" onClick={doLogout} className="btn-outline">Logout</button>
            <div className="muted">Log out to sign in as a different user.</div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="notice notice-error" role="alert">
          <div className="notice-title">Login failed</div>
          <div>{error}</div>
        </div>
      ) : null}

      <form onSubmit={doLogin} className="card form-grid" aria-busy={loading}>
        <div>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%' }}
            autoComplete="username"
          />
        </div>

        <div>
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%' }}
            autoComplete="current-password"
          />
        </div>

        <div className="row">
          <button type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
        </div>
      </form>
    </div>
  );
}