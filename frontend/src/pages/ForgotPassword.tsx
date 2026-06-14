import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, ArrowRight, KeyRound, Sparkles, Lock, Loader2,
  AlertCircle, CheckCircle2, Eye, EyeOff, RotateCcw,
} from 'lucide-react';
import { authService } from '../services/api';

type Step = 1 | 2;

export const ForgotPassword = () => {
  const [step, setStep]               = useState<Step>(1);
  const [email, setEmail]             = useState('');
  const [otp, setOtp]                 = useState(['', '', '', '', '', '']);
  const otpRefs                       = useRef<(HTMLInputElement | null)[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [otpSending, setOtpSending]   = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError]             = useState<string | null>(null);
  const [successMsg, setSuccessMsg]   = useState<string | null>(null);
  const [isDone, setIsDone]           = useState(false);
  const navigate                      = useNavigate();

  // ── OTP input handlers ────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // ── Cooldown timer ────────────────────────────────────────
  const startCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown(c => {
        if (c <= 1) { clearInterval(t); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  // ── Step 1: gửi OTP ───────────────────────────────────────
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setSuccessMsg(
        res.devOtp
          ? `${res.message} Mã OTP (dev): ${res.devOtp}`
          : (res.message || 'Mã xác thực đã được gửi đến email của bạn!')
      );
      setOtp(['', '', '', '', '', '']);
      setStep(2);
      startCooldown();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không tìm thấy tài khoản với email này.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Gửi lại OTP ───────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setOtpSending(true);
    try {
      const res = await authService.forgotPassword(email);
      setSuccessMsg(
        res.devOtp
          ? `${res.message} Mã OTP (dev): ${res.devOtp}`
          : (res.message || 'Đã gửi lại mã OTP.')
      );
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      startCooldown();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi lại OTP. Vui lòng thử lại.');
    } finally {
      setOtpSending(false);
    }
  };

  // ── Step 2: đặt lại mật khẩu ─────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số OTP.');
      return;
    }
    if (!/^\d{6}$/.test(otpCode)) {
      setError('Mã OTP chỉ bao gồm 6 chữ số.');
      return;
    }
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
      const res = await authService.resetPassword(email, otpCode, newPassword);
      if (res.success) {
        setIsDone(true);
        setTimeout(() => navigate('/login'), 2500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  const otpCode = otp.join('');

  const inputCls = 'block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-sm';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md animate-slide-up">
        <div className="glass rounded-3xl p-8 md:p-10 shadow-premium border-none">

          {/* ── Header ── */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 premium-gradient rounded-xl text-white shadow-lg mb-4">
              <Sparkles size={24} />
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Khôi phục mật khẩu</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {step === 1
                ? 'Nhập email của bạn để nhận mã xác thực.'
                : `Nhập mã OTP gửi đến `}
              {step === 2 && <span className="font-semibold text-primary-600">{email}</span>}
            </p>
          </div>

          {/* ── Error / Success ── */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl flex items-start gap-3 text-sm font-medium border border-red-100 dark:border-red-950/30">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && step === 2 && !error && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-start gap-3 text-sm font-medium border border-emerald-100 dark:border-emerald-950/30">
              <Sparkles size={18} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ══════════════════════ STEP 1: Nhập email */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
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
                className="w-full py-4 premium-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading
                  ? <><Loader2 size={18} className="animate-spin" /> Đang xử lý...</>
                  : <><span>Gửi mã OTP</span><ArrowRight size={18} /></>}
              </button>
            </form>
          )}

          {/* ══════════════════════ STEP 2: OTP + mật khẩu mới */}
          {step === 2 && !isDone && (
            <form onSubmit={handleResetPassword} className="space-y-6">

              {/* 6 ô OTP */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 text-center">
                  <KeyRound size={16} className="inline mr-1.5 text-primary-500" />
                  Nhập mã xác thực
                </label>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 text-center text-xl font-bold bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-slate-900 dark:text-white"
                      style={{ height: '3.25rem' }}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                <p className="text-center text-xs text-slate-400 mt-3">
                  Kiểm tra hộp thư đến và thư mục Spam
                </p>
              </div>

              {/* Mật khẩu mới */}
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

              {/* Xác nhận mật khẩu */}
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
                disabled={isLoading || otpCode.length < 6}
                className="w-full py-4 premium-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading
                  ? <><Loader2 size={18} className="animate-spin" /> Đang cập nhật...</>
                  : <><span>Đặt lại mật khẩu</span><ArrowRight size={18} /></>}
              </button>

              {/* Quay lại + Gửi lại */}
              <div className="flex items-center justify-between text-sm pt-1">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(null); setSuccessMsg(null); setOtp(['','','','','','']); }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  ← Sửa email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || otpSending}
                  className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-semibold disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  {otpSending
                    ? <Loader2 size={13} className="animate-spin" />
                    : <RotateCcw size={13} />}
                  {resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : 'Gửi lại mã'}
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════ DONE */}
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
