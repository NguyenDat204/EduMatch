import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, ArrowRight, Sparkles, Lock, Loader2,
  AlertCircle, CheckCircle2, Eye, EyeOff,
} from 'lucide-react';
import { authService, apiClient } from '../services/api';

type Step = 1 | 2;

export const ForgotPassword = () => {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const navigate = useNavigate();

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await authService.forgotPassword(email);
      setSuccessMsg(res.message || 'Email hợp lệ. Bạn có thể đặt mật khẩu mới.');
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không tìm thấy tài khoản với email này.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/reset-password', { email, newPassword });
      if (res.data.success) {
        setIsDone(true);
        setTimeout(() => navigate('/login'), 2500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = 'block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-sm';
  const primaryButtonCls = 'w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95 transition-all disabled:bg-blue-400 disabled:opacity-80 disabled:pointer-events-none';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md animate-slide-up">
        <div className="glass rounded-3xl p-8 md:p-10 shadow-premium border-none">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 premium-gradient rounded-xl text-white shadow-lg mb-4">
              <Sparkles size={24} />
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Khôi phục mật khẩu</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {step === 1 ? 'Nhập email đã đăng ký để tiếp tục.' : 'Đặt mật khẩu mới cho '}
              {step === 2 && <span className="font-semibold text-primary-600">{email}</span>}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl flex items-start gap-3 text-sm font-medium border border-red-100 dark:border-red-950/30">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && step === 2 && !error && !isDone && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-start gap-3 text-sm font-medium border border-emerald-100 dark:border-emerald-950/30">
              <Sparkles size={18} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleCheckEmail} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Địa chỉ Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@edumatch.vn"
                    className={inputCls}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={primaryButtonCls}
              >
                {isLoading
                  ? <><Loader2 size={18} className="animate-spin" /> Đang kiểm tra...</>
                  : <><span>Tiếp tục</span><ArrowRight size={18} /></>}
              </button>
            </form>
          )}

          {step === 2 && !isDone && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Mật khẩu mới</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputCls} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(v => !v)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Xác nhận mật khẩu mới</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputCls} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={primaryButtonCls}
              >
                {isLoading
                  ? <><Loader2 size={18} className="animate-spin" /> Đang cập nhật...</>
                  : <><span>Đặt lại mật khẩu</span><ArrowRight size={18} /></>}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError(null);
                  setSuccessMsg(null);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="w-full text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Sửa email
              </button>
            </form>
          )}

          {isDone && (
            <div className="text-center py-6 space-y-4 animate-scale-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-full border border-emerald-100 dark:border-emerald-950/50 mb-2">
                <CheckCircle2 size={36} className="animate-pulse" />
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Thành công!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                Mật khẩu đã được đặt lại thành công. Hệ thống sẽ tự động chuyển hướng về trang Đăng nhập...
              </p>
              <div className="flex justify-center items-center gap-1.5 text-xs font-semibold text-primary-500 pt-2">
                <Loader2 size={14} className="animate-spin" />
                <span>Đang chuyển hướng...</span>
              </div>
            </div>
          )}

          <p className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
            Trở lại trang{' '}
            <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 underline decoration-2 underline-offset-4">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
