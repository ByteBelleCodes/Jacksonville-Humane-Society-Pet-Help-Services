import axios from 'axios';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';

/**
 * API instance + React hook
 *
 * - Uses Vite env var VITE_API_URL (set in .env as VITE_API_URL).
 * - Default: http://localhost:4000/api
 * - Attaches Authorization header by reading token from localStorage for compatibility,
 *   and useAPI keeps default header in sync with AuthContext token for instant updates.
 */

const baseURL = import.meta.env?.VITE_API_URL ?? 'http://localhost:4000/api';

const API = axios.create({
  baseURL,
  timeout: 20000,
});

// Attach token from localStorage for every request (compat approach).
API.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      } else if (config.headers) {
        delete config.headers.Authorization;
      }
    } catch (e) {
      // ignore localStorage errors in some browsers
    }
    return config;
  },
  (err) => Promise.reject(err)
);

/**
 * useAPI hook
 * - Keeps the axios default Authorization header synchronized with AuthContext token.
 * - Returns the shared API instance.
 */
export function useAPI() {
  const auth = useAuth();

  useEffect(() => {
    try {
      if (auth && auth.token) {
        API.defaults.headers = API.defaults.headers || {};
        API.defaults.headers.Authorization = `Bearer ${auth.token}`;
      } else if (API.defaults && API.defaults.headers) {
        delete API.defaults.headers.Authorization;
      }
    } catch (e) {
      // ignore
    }
  }, [auth?.token]);

  return API;
}

export default API;