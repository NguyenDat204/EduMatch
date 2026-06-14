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
  const googleBtnRef = useRef<HTMLDivElement>(null);

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

  // Stable callback passed to Google SDK
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
  }, []);

  useEffect(() => {
    if (!googleClientId) {
      setGoogleConfigured(false);
      return;
    }

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return false;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      window._googleInitialized = true;
      setGoogleReady(true);

      if (googleBtnRef.current) {
        (window.google.accounts.id as any).renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: googleBtnRef.current.offsetWidth || 400,
          text: 'signin_with',
          locale: 'vi',
        });
      }
      return true;
    };

    // Thử init ngay nếu script đã load sẵn
    if (initGoogle()) return;

    // Lắng nghe cả event và polling để đảm bảo catch được trên mọi trình duyệt/thiết bị
    const onReady = () => { initGoogle(); };
    window.addEventListener('google-gsi-ready', onReady);

    // Polling dự phòng với timeout dài hơn cho mobile
    const interval = window.setInterval(() => {
      if (initGoogle()) window.clearInterval(interval);
    }, 300);

    // Dừng sau 15 giây nếu vẫn không load được
    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
    }, 15000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
      window.removeEventListener('google-gsi-ready', onReady);
    };
  }, [googleClientId, handleGoogleCredentialResponse]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const userData = await login(email, password);
      if (userData && (userData as any).role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác.');
    }
  }, [email, password, login, navigate]);

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

            {/* Google Sign-In button — rendered bởi Google SDK, hoạt động trên mọi thiết bị */}
            {googleConfigured ? (
              <div className="relative w-full" style={{ minHeight: '44px' }}>
                {/* Google SDK render button vào đây */}
                <div ref={googleBtnRef} className="w-full flex justify-center" />
                {/* Spinner chỉ hiện khi chưa render xong */}
                {!googleReady && (
                  <div className="absolute inset-0 flex items-center justify-center gap-2 py-2.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg text-sm text-slate-400">
                    <Loader2 size={14} className="animate-spin" /> Đang tải Google Sign-In...
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-rose-500 text-center">
                Google Sign-In chưa được cấu hình.
              </p>
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
