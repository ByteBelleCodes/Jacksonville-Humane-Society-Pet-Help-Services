import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - uses AuthContext instead of direct localStorage checks.
 * Props:
 *  - children: React node
 *  - requireAdmin: boolean
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const location = useLocation();
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    // Not logged in — redirect to login and preserve where user was going
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && (!auth.user || auth.user.role !== 'admin')) {
    // Logged in but not an admin — redirect to home (or show a 403 page)
    return <Navigate to="/" replace />;
  }

  return children;
}