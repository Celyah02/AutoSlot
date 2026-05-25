import { createContext, useEffect, useState } from 'react';
import { apiRequest, ApiError } from '../lib/api';

const AUTH_STORAGE_KEY = 'xwz-auth-session';

export const AuthContext = createContext(null);

const readStoredSession = () => {
  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => readStoredSession());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrapSession = async () => {
      if (!session?.token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const response = await apiRequest('/api/auth/me', {
          token: session.token
        });

        const nextSession = {
          token: session.token,
          user: response.user
        };

        setSession(nextSession);
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          window.localStorage.removeItem(AUTH_STORAGE_KEY);
          setSession(null);
        }
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrapSession();
  }, []);

  const persistSession = (nextSession) => {
    setSession(nextSession);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
  };

  const signup = async (payload) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: payload
    });

  const login = async (payload) => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: payload
    });

    persistSession({
      token: response.token,
      user: response.user
    });

    return response;
  };

  const logout = () => {
    setSession(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const authenticatedRequest = async (path, options = {}) => {
    try {
      const response = await apiRequest(path, {
        ...options,
        token: session?.token
      });

      return response;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
      }

      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(session?.token),
        isBootstrapping,
        token: session?.token || null,
        user: session?.user || null,
        signup,
        login,
        logout,
        authenticatedRequest
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
