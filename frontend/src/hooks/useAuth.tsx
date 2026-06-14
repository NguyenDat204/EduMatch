import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthState } from '../types';
import { authService, profileService } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, school?: string, role?: string, grade?: string, majorInterest?: string) => Promise<void>;
  loginViaGoogle: (token: string) => Promise<void>;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('edumatch_token'),
    isAuthenticated: false,
    isLoading: true,
  });

  // Verify and fetch profile on startup if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('edumatch_token');

      // No token → not authenticated, done immediately (no network call)
      if (!token) {
        setState(s => ({ ...s, isLoading: false }));
        return;
      }

      // Token is expired locally → clean up without hitting the network
      if (isTokenExpired(token)) {
        localStorage.removeItem('edumatch_token');
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Token looks valid — fetch fresh profile in the background.
      // We set isLoading: false immediately using the cached user stub from the
      // JWT payload so the UI is never blocked waiting for the network.
      const payload = decodeJwtPayload(token);
      if (payload?.id) {
        // Optimistically mark as authenticated so protected pages render instantly.
        // The full user object will be merged in once getProfile resolves.
        setState(s => ({ ...s, isAuthenticated: true, isLoading: false }));
      }

      try {
        const response = await profileService.getProfile();
        if (response.success && response.data) {
          setState({
            user: response.data,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          localStorage.removeItem('edumatch_token');
          setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      } catch {
        localStorage.removeItem('edumatch_token');
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
        localStorage.setItem('edumatch_token', response.token);
        setState({
          user: response.data,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || 'Login response invalid');
      }
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false }));
      throw new Error(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, school?: string, role?: string, grade?: string, majorInterest?: string) => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      const response = await authService.register(name, email, password, school, role, grade, majorInterest);
      if (response.success && response.data && response.token) {
        localStorage.setItem('edumatch_token', response.token);
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
        localStorage.setItem('edumatch_token', response.token);
        setState({
          user: response.data,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false }));
      throw new Error(err.response?.data?.message || err.message || 'Google Auth failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('edumatch_token');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateUserInState = (updatedUser: User) => {
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
