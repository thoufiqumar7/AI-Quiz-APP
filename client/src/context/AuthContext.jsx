import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getProfile, loginUser, logoutSession, registerUser } from '../services/authService';
import { clearAuthData, getStoredToken, getStoredUser, setAuthData } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    clearAuthData();
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const response = await getProfile();
    const currentToken = getStoredToken();
    setToken(currentToken);
    setUser(response.user);
    setAuthData(currentToken, response.user);
    return response.user;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function bootstrapAuth() {
      if (!getStoredToken()) {
        setLoading(false);
        return;
      }

      try {
        const response = await getProfile();
        if (mounted) {
          const currentToken = getStoredToken();
          setToken(currentToken);
          setUser(response.user);
          setAuthData(currentToken, response.user);
        }
      } catch (_error) {
        if (mounted) clearSession();
      } finally {
        if (mounted) setLoading(false);
      }
    }

    function handleExpiredSession() {
      if (mounted) clearSession();
    }

    window.addEventListener('smartquiz:session-expired', handleExpiredSession);
    bootstrapAuth();

    return () => {
      mounted = false;
      window.removeEventListener('smartquiz:session-expired', handleExpiredSession);
    };
  }, [clearSession]);

  const login = useCallback(async (payload) => {
    const response = await loginUser(payload);
    const accessToken = response.accessToken || response.token;
    setAuthData(accessToken, response.user, response.csrfToken);
    setToken(accessToken);
    setUser(response.user);
    return response;
  }, []);

  const register = useCallback(async (payload) => {
    const response = await registerUser(payload);
    const accessToken = response.accessToken || response.token;
    setAuthData(accessToken, response.user, response.csrfToken);
    setToken(accessToken);
    setUser(response.user);
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutSession();
    } catch (_error) {
      // Local session cleanup still prevents stale client access.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshProfile,
    }),
    [token, user, loading, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
}
