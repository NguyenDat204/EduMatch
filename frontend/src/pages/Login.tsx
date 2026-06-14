import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, GraduationCap, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

declare global {
  interface Window {
    _googleInitialized?: boolean;
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleConfigured, setGoogleConfigured] = useState(true);
  const { login, loginViaGoogle, isLoading } = useAuth();
  const navigate = useNavigate();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Refs to always hold the latest navigate/loginViaGoogle without re-initializing Google SDK
  const navigateRef = useRef(navigate);
  const loginViaGoogleRef = useRef(loginViaGoogle);
  const setErrorRef = useRef(setError);

  // Keep refs in sync with latest values on every render
  useEffect(() => {
    navigateRef.current = navigate;
    loginViaGoogleRef.current = loginViaGoogle;
    setErrorRef.current = setError;
  });

  // Stable callback passed to Google SDK — never changes identity, always uses latest refs
  const handleGoogleCredentialResponse = useCallback(async (response: { credential?: string }) => {
    if (!response?.credential) {
      setErrorRef.current('Đăng nhập Google không thành công. Vui lòng thử lại.');
      return;
    }

    setErrorRef.current(null);
    try {
      await loginViaGoogleRef.current(response.credential);
      navigateRef.current('/dashboard');
    } catch (err: any) {
      setErrorRef.current(err.message || 'Đăng nhập Google thất bại.');
    }
  }, []); // empty deps — identity is stable for the lifetime of the component // empty deps — identity is stable for the lifetime of the component

  useEffect(() => {
    if (!googleClientId) {
      setGoogleConfigured(false);
      return;
    }

    // Already initialized — just mark ready, no need to re-initialize SDK
    if (window._googleInitialized) {
      setGoogleReady(true);
      return;
    }

    const initGoogle = () => {
      if (window._googleInitialized) {
        setGoogleReady(true);
        return;
      }

      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          // Stable reference — Google SDK holds this callback for the session lifetime.
          // Using useCallback + refs ensures it always calls the latest navigate/loginViaGoogle
          // without needing to re-initialize the SDK on every render.
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window._googleInitialized = true;
        setGoogleReady(true);
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
      return;
    }

    // Poll until Google GSI script finishes loading
    const interval = window.setInterval(() => {
      if (window.google?.accounts?.id) {
        initGoogle();
        window.clearInterval(interval);
      }
    }, 200);

    return () => {
      window.clearInterval(interval);
    };
  }, [googleClientId, handleGoogleCredentialResponse]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const userData = await login(email, password);
      // Redirect based on role
      if (userData && (userData as any).role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác.');
    }
  }, [email, password, login, navigate]);

  const handleGoogleLogin = useCallback(() => {
    setError(null);
    if (!googleConfigured) {
      setError('Google Sign-In chưa được cấu hình. Vui lòng thêm VITE_GOOGLE_CLIENT_ID vào .env.');
      return;
    }

    if (!googleReady || !window.google?.accounts?.id) {
      setError('Google Sign-In chưa sẵn sàng. Vui lòng thử lại sau.');
      return;
    }

    window.google.accounts.id.prompt();
  }, [googleConfigured, googleReady]);

  return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-8 shadow-card">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-11 h-11 bg-primary-600 rounded-xl text-white mb-4">
                <GraduationCap size={22} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Chào mừng trở lại</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tiếp tục hành trình định hướng nghề nghiệp của bạn.</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg flex items-start gap-2.5 text-sm border border-red-100 dark:border-red-900/30">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@edumatch.vn"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mật khẩu</label>
                  <Link to="/forgot-password" className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors">
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:pointer-events-none mt-2"
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Đang đăng nhập...</>
                ) : (
                  <><span>Đăng nhập</span><ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-navy-700" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white dark:bg-navy-900 text-xs text-slate-400 uppercase tracking-wider">
                  hoặc
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-slate-50 dark:bg-navy-800 hover:bg-slate-100 dark:hover:bg-navy-700 border border-slate-200 dark:border-navy-600 rounded-lg text-sm font-medium transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng nhập với Google
            </button>
            {!googleConfigured && (
              <p className="mt-2 text-xs text-rose-500">Google Sign-In chưa được cấu hình. Thêm VITE_GOOGLE_CLIENT_ID vào .env.</p>
            )}

            <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
  );
};
