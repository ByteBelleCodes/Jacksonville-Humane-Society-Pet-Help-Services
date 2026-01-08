import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutButton from './LogoutButton';

export default function Header() {
  const auth = useAuth();
  const user = auth.user;
  const isLoggedIn = auth.isAuthenticated;

  return (
    <header className="site-header">
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="brand">
            <div className="logo" aria-hidden="true" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 700, color: 'var(--brand)' }}>JHS PHCS</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Pet Help Center System</div>
            </div>
          </div>
        </div>

        <nav className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/">Dashboard</Link>
          <Link to="/upload">Upload</Link>
          <Link to="/cases">Cases</Link>
          <Link to="/reports">Reports</Link>
          {isLoggedIn && user && user.role === 'admin' && (
            <Link to="/admin/users">Admin</Link>
          )}

          
          {!isLoggedIn ? (
            <Link to="/login">Login</Link>
          ) : (
            <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="user-avatar" aria-hidden="true" />
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{user?.email}</div>
              <LogoutButton />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
