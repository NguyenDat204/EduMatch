import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthState } from '../types';
import { authService, profileService } from '../services/api';

const TOKEN_STORAGE_KEY = 'edumatch_token';
const USER_STORAGE_KEY = 'edumatch_user';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  register: (name: string, email: string, password: string, school?: string, role?: string, grade?: string, majorInterest?: string) => Promise<void>;
  loginViaGoogle: (token: string) => Promise<any>;
  updateUserInState: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Decode JWT payload without a library (base64url → JSON)
const decodeJwtPayload = (token: string): Record<string, any> | null => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() / 1000 > payload.exp;
};

const getCachedUser = (): User | null => {
  try {
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

const persistSession = (token: string, user: User) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const cachedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  const cachedUser = cachedToken ? getCachedUser() : null;

  const [state, setState] = useState<AuthState>({
    user: cachedUser,
    token: cachedToken,
    isAuthenticated: Boolean(cachedToken && cachedUser && !isTokenExpired(cachedToken)),
    isLoading: Boolean(cachedToken && !cachedUser),
  });

  // Verify and fetch profile on startup if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      const cachedUser = token ? getCachedUser() : null;

      // No token → not authenticated, done immediately (no network call)
      if (!token) {
        setState(s => ({ ...s, isLoading: false }));
        return;
      }

      // Token is expired locally → clean up without hitting the network
      if (isTokenExpired(token)) {
        clearSession();
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Token looks valid. Use cached user immediately, then refresh in background.
      if (cachedUser) {
        setState({ user: cachedUser, token, isAuthenticated: true, isLoading: false });
      } else {
        setState(s => ({ ...s, token, isAuthenticated: true, isLoading: true }));
      }

      try {
        const response = await profileService.getProfile();
        if (response.success && response.data) {
          persistSession(token, response.data);
          setState({
            user: response.data,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          clearSession();
          setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      } catch {
        // Token invalid (expired, wrong secret, etc.) — clear and redirect to login
        clearSession();
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      const response = await authService.login(email, password);
      if (response.success && response.data && response.token) {
        persistSession(response.token, response.data);
        setState({
          user: response.data,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
        });
        // Return user data so callers can redirect based on role
        return response.data;
      } else {
        throw new Error(response.message || 'Login response invalid');
      }
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false }));
      // Normalize axios/BE errors to avoid noisy console stacks in UI.
      const message = err?.response?.data?.message || err?.message || 'Email hoặc mật khẩu không chính xác.';
      throw new Error(message);
    }
  };

  const register = async (name: string, email: string, password: string, school?: string, role?: string, grade?: string, majorInterest?: string) => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      const response = await authService.register(name, email, password, school, role, grade, majorInterest);
      if (response.success && response.data && response.token) {
        persistSession(response.token, response.data);
        setState({
          user: response.data,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || 'Registration response invalid');
      }
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false }));
      throw new Error(err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  const loginViaGoogle = async (token: string) => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      const response = await authService.loginViaGoogle(token);
      if (response.success && response.data && response.token) {
        persistSession(response.token, response.data);
        setState({
          user: response.data,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
        });
        // Return user data so callers can redirect based on role
        return response.data;
      }
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false }));
      throw new Error(err.response?.data?.message || err.message || 'Google Auth failed');
    }
  };

  const logout = () => {
    clearSession();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateUserInState = (updatedUser: User) => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch {
      // Ignore storage quota/private-mode failures; in-memory state still updates.
    }
    setState(s => ({ ...s, user: updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register, loginViaGoogle, updateUserInState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
};
