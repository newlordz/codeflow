import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const API_BASE = '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('codeflow-token');
    const storedUser = localStorage.getItem('codeflow-user');

    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsed);
      } catch {
        localStorage.removeItem('codeflow-token');
        localStorage.removeItem('codeflow-user');
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        setLoading(false);
      }, 4000);

      fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error('Invalid token');
          return res.json();
        })
        .then((data) => {
          const authUser = data.user || data;
          setUser(authUser);
          localStorage.setItem('codeflow-user', JSON.stringify(authUser));
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setUser(null);
            setToken(null);
            localStorage.removeItem('codeflow-token');
            localStorage.removeItem('codeflow-user');
          }
        })
        .finally(() => {
          clearTimeout(timeoutId);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    const authToken = data.token;
    const authUser = data.user || { id: data.id, email: data.email, username: data.username };
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('codeflow-token', authToken);
    localStorage.setItem('codeflow-user', JSON.stringify(authUser));
    return authUser;
  }, []);

  const signup = useCallback(async (username, email, password) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Signup failed');
    const authToken = data.token;
    const authUser = data.user || { id: data.id, email: data.email, username: data.username };
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('codeflow-token', authToken);
    localStorage.setItem('codeflow-user', JSON.stringify(authUser));
    return authUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('codeflow-token');
    localStorage.removeItem('codeflow-user');
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, loading, login, signup, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
