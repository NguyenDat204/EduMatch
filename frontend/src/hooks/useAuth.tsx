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
      if (!token) {
        setState(s => ({ ...s, isLoading: false }));
        return;
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
          // Clean up invalid session
          localStorage.removeItem('edumatch_token');
          setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (err) {
        console.warn("Session restore failed, cleaning up credentials:", err);
        localStorage.removeItem('edumatch_token');
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
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
