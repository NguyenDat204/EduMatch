import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, AuthState } from '../types';

// ─────────────────────────────────────────────────────────────
// Auth Context
// Provides authentication state and actions to the whole app.
// Ready to wire up JWT tokens once the backend is connected.
// ─────────────────────────────────────────────────────────────

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = async (email: string, _password: string) => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      // TODO: Replace with: const { data } = await axios.post('/api/auth/login', { email, password });
      //       setState({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      const mockUser: User = {
        name: 'Nguyen Van A',
        email,
        role: 'student',
        avatar: 'https://i.pravatar.cc/150?u=student',
        isPro: false,
      };
      setState({ user: mockUser, token: 'mock-token', isAuthenticated: true, isLoading: false });
    } catch {
      setState(s => ({ ...s, isLoading: false }));
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    // TODO: Also call: await axios.post('/api/auth/logout');
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  };

  const register = async (name: string, email: string, _password: string) => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      // TODO: Replace with: await axios.post('/api/auth/register', { name, email, password });
      const mockUser: User = { name, email, role: 'student', avatar: '', isPro: false };
      setState({ user: mockUser, token: 'mock-token', isAuthenticated: true, isLoading: false });
    } catch {
      setState(s => ({ ...s, isLoading: false }));
      throw new Error('Registration failed');
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
};
