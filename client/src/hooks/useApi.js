import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = '/api';

export function useApi() {
  const { token, logout } = useAuth();

  const request = useCallback(
    async (method, endpoint, body = null) => {
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const config = { method, headers };
      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const res = await fetch(`${API_BASE}${endpoint}`, config);

      if (res.status === 401) {
        logout();
        throw new Error('Session expired. Please log in again.');
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.error || `Request failed with status ${res.status}`);
      }

      return data;
    },
    [token, logout]
  );

  const get = useCallback((endpoint) => request('GET', endpoint), [request]);
  const post = useCallback((endpoint, body) => request('POST', endpoint, body), [request]);
  const put = useCallback((endpoint, body) => request('PUT', endpoint, body), [request]);
  const del = useCallback((endpoint) => request('DELETE', endpoint), [request]);

  return { get, post, put, del };
}
