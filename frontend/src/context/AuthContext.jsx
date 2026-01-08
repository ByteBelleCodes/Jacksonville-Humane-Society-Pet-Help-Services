import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * AuthContext
 * - Provides: user, token, isAuthenticated, login(token, user), logout()
 * - Persists token and user to localStorage so page refresh preserves auth.
 * - Components subscribe to this context to react immediately on login/logout.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || null;
    } catch (e) {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const j = localStorage.getItem('user');
      return j ? JSON.parse(j) : null;
    } catch (e) {
      return null;
    }
  });

  // derived
  const isAuthenticated = !!token;

  // persist changes to localStorage
  useEffect(() => {
    try {
      if (token) localStorage.setItem('token', token);
      else localStorage.removeItem('token');
    } catch (e) {}
  }, [token]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem('user', JSON.stringify(user));
      else localStorage.removeItem('user');
    } catch (e) {}
  }, [user]);

  function login(newToken, newUser) {
    setToken(newToken || null);
    setUser(newUser || null);
  }

  function logout() {
    setToken(null);
    setUser(null);
    // localStorage cleanup handled by effects above
  }

  const value = {
    token,
    user,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}