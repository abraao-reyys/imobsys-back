import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { login as loginRequest } from '../api/auth.js';
import { AUTH_STORAGE_KEY, USER_STORAGE_KEY } from '../api/axios.js';

const AuthContext = createContext(null);

function readStoredUser() {
  const raw = sessionStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    sessionStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [authHeader, setAuthHeader] = useState(() => sessionStorage.getItem(AUTH_STORAGE_KEY));
  const [user, setUser] = useState(() => readStoredUser());

  const login = useCallback(async ({ email, senha }) => {
    const response = await loginRequest({ email, senha });
    const basic = `Basic ${window.btoa(`${email}:${senha}`)}`;
    const storedUser = {
      corretorId: response.corretorId,
      nome: response.nome,
      email: response.email
    };

    sessionStorage.setItem(AUTH_STORAGE_KEY, basic);
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(storedUser));
    setAuthHeader(basic);
    setUser(storedUser);

    return response;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    setAuthHeader(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      authHeader,
      user,
      isAuthenticated: Boolean(authHeader),
      login,
      logout
    }),
    [authHeader, user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
