import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * LogoutButton - calls AuthContext.logout and navigates to /login
 */
export default function LogoutButton({ label = 'Logout', className = '' }) {
  const auth = useAuth();
  const navigate = useNavigate();

  function doLogout() {
    auth.logout();
    // navigate to login page; no reload needed because AuthContext updates the UI
    navigate('/login');
  }

  return (
    <button onClick={doLogout} className={className} style={{ marginLeft: 8 }}>
      {label}
    </button>
  );
}