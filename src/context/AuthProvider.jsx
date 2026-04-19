import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMe } from '../api/authApi.js';
import { AuthContext } from './auth-context.js';
import { clearToken, getToken, setToken } from '../utils/authStorage.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(() => !getToken());

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getMe()
      .then((res) => setUser(res.data?.user ?? null))
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const loginSuccess = useCallback((payload) => {
    const token = payload?.token;
    const nextUser = payload?.user ?? null;
    if (token) setToken(token);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      loginSuccess,
      logout,
    }),
    [user, ready, loginSuccess, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
