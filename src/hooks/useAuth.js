import { useState, useCallback } from 'react';

/**
 * Stub authentication hook.
 * Provides token management and login/logout helpers.
 * To be expanded when JWT auth is added to the backend.
 */
export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('sdn_auth_token'));
  const [user, setUser] = useState(null);

  const isAuthenticated = !!token;

  const login = useCallback(async (username, password) => {
    // TODO: Replace with actual API call when backend adds JWT auth
    // const response = await api.post('/api/auth/login/', { username, password });
    // const { access } = response.data;
    const mockToken = 'stub-jwt-token';
    localStorage.setItem('sdn_auth_token', mockToken);
    setToken(mockToken);
    setUser({ username });
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sdn_auth_token');
    setToken(null);
    setUser(null);
  }, []);

  return { token, user, isAuthenticated, login, logout };
}
