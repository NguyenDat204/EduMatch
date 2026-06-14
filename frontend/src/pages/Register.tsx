import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, GraduationCap, ArrowRight,
  AlertCircle, Loader2, Users, Building2, MapPin, Eye, EyeOff,
  KeyRound, CheckCircle2, RotateCcw,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/api';
import { PROVINCES, joinSchool } from '../lib/provinces';

type Step = 'form' | 'otp' | 'done';

export const Register = () => {
  // ── Step ─────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('form');

  // ── Form fields ───────────────────────────────────────────
  const [role, setRole]                       = useState<'student' | 'university'>('student');
  const [name, setName]                       = useState('');
  const [school, setSchool]                   = useState('');
  const [province, setProvince]               = useState('');
  const [grade, setGrade]                     = useState('12');
  const [majorInterest, setMajorInterest]     = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── OTP ───────────────────────────────────────────────────
  const [otp, setOtp]                 = useState(['', '', '', '', '', '']);
  const otpRefs                       = useRef<(HTMLInputElement | null)[]>([]);
  const [otpSending, setOtpSending]   = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── State ─────────────────────────────────────────────────
  const [error, setError]   = useState<string | null>(null);
  const [info, setInfo]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();

  const inputCls = 'w-full py-2.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-400';

  // ── Step 1: validate form & send OTP ─────────────────────
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim())  { setError('Họ và tên không được bỏ trống.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Email không hợp lệ.'); return; }
    if (password.length < 6) { setError('Mật khẩu phải chứa ít nhất 6 ký tự.'); return; }
    if (password !== confirmPassword) { setError('Mật khẩu xác nhận không trùng khớp.'); return; }
    if (!school.trim()) {
      setError(role === 'university' ? 'Vui lòng nhập tên trường đại học.' : 'Vui lòng nhập tên trường THPT.');
      return;
    }
    if (role === 'student' && !province) { setError('Vui lòng chọn tỉnh/thành phố của trường.'); return; }

    setOtpSending(true);
    try {
      const res = await authService.sendVerifyOTP(email, name);
      setInfo(res.message || 'Mã OTP đã được gửi đến email của bạn.');
      setStep('otp');
      startCooldown();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại.');
    } finally {
      setOtpSending(false);
    }
  };

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

  // ── Cooldown for resend ───────────────────────────────────
  const startCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown(c => {
        if (c <= 1) { clearInterval(t); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setOtpSending(true);
    try {
      const res = await authService.sendVerifyOTP(email, name);
      setInfo(res.message || 'Đã gửi lại mã OTP.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      startCooldown();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi lại OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  // ── Step 2: verify OTP & register ────────────────────────
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const otpCode = otp.join('');
    if (otpCode.length < 6) { setError('Vui lòng nhập đủ 6 chữ số OTP.'); return; }

    setOtpVerifying(true);
    try {
      // 1. Verify OTP
      await authService.verifyEmailOTP(email, otpCode);

      // 2. Register
      setIsLoading(true);
      const schoolFull = joinSchool(school, province);
      await register(name, email, password, schoolFull, role, grade, majorInterest);
      setStep('done');
      setTimeout(() => navigate(role === 'university' ? '/university/manage' : '/survey'), 1800);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Xác thực thất bại. Vui lòng thử lại.');
    } finally {
      setOtpVerifying(false);
      setIsLoading(false);
    }
  };

  const otpCode = otp.join('');

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-8 shadow-card">

          {/* ── Header ── */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center mb-4">
              <img src="/edumatch_logo.jpg" alt="EduMatch" className="w-16 h-16 rounded-xl object-cover" />
            </div>
            {step === 'form' && (
              <>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Tạo tài khoản</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Bắt đầu hành trình định hướng nghề nghiệp của bạn.</p>
              </>
            )}
            {step === 'otp' && (
              <>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Xác thực email</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Nhập mã 6 chữ số đã gửi đến <span className="font-semibold text-primary-600">{email}</span>
                </p>
              </>
            )}
            {step === 'done' && (
              <>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Đăng ký thành công!</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Đang chuyển hướng...</p>
              </>
            )}
          </div>

          {/* ── Step indicator ── */}
          <div className="flex items-center gap-2 mb-6">
            {(['form', 'otp', 'done'] as Step[]).map((s, i) => (
              <React.Fragment key={s}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s ? 'bg-primary-600 text-white' :
                  (step === 'otp' && s === 'form') || step === 'done' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' :
                  'bg-slate-100 dark:bg-navy-800 text-slate-400'
                }`}>
                  {(step === 'otp' && s === 'form') || step === 'done' && s !== 'done'
                    ? <CheckCircle2 size={14} />
                    : i + 1}
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 rounded transition-colors ${
                  (step === 'otp' && i === 0) || step === 'done' ? 'bg-primary-400' : 'bg-slate-200 dark:bg-navy-700'
                }`} />}
              </React.Fragment>
            ))}
          </div>

          {/* ── Error / Info ── */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg flex items-start gap-2.5 text-sm border border-red-100 dark:border-red-900/30">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}
          {info && !error && step === 'otp' && (
            <div className="mb-5 p-3.5 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-lg flex items-start gap-2.5 text-sm border border-green-100 dark:border-green-900/30">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" /><span>{info}</span>
            </div>
          )}

          {/* ══════════════════════════════════════ STEP 1: FORM */}
          {step === 'form' && (
            <>
              {/* Role Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-navy-800 rounded-xl mb-6">
                {[
                  { value: 'student',    label: 'Học sinh',    icon: <Users size={15} /> },
                  { value: 'university', label: 'Đại diện ĐH', icon: <Building2 size={15} /> },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value as 'student' | 'university')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      role === opt.value
                        ? 'bg-white dark:bg-navy-700 text-primary-600 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {opt.icon}{opt.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Row 1: Họ tên + Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Họ và tên</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" className={`${inputCls} pl-9 pr-3`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" className={`${inputCls} pl-9 pr-3`} />
                    </div>
                  </div>
                </div>

                {/* Row 2: Tên trường */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {role === 'student' ? 'Trường THPT' : 'Tên trường Đại học'}
                  </label>
                  <div className="relative">
                    <GraduationCap size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input type="text" required autoComplete="organization" value={school} onChange={(e) => setSchool(e.target.value)} placeholder={role === 'student' ? 'THPT Phan Đình Phùng' : 'Đại học FPT'} className={`${inputCls} pl-9 pr-3`} />
                  </div>
                </div>

                {/* Row 3 (student): Tỉnh/thành + Khối lớp */}
                {role === 'student' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tỉnh / Thành phố</label>
                      <div className="relative">
                        <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                        <select required value={province} onChange={(e) => setProvince(e.target.value)} className={`${inputCls} pl-9 pr-3 appearance-none`}>
                          <option value="">-- Chọn tỉnh/thành --</option>
                          {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Khối lớp</label>
                      <select value={grade} onChange={(e) => setGrade(e.target.value)} className={`${inputCls} px-3`}>
                        <option value="10">Lớp 10</option>
                        <option value="11">Lớp 11</option>
                        <option value="12">Lớp 12</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Row 4 (student): Ngành yêu thích */}
                {role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Ngành yêu thích <span className="ml-1 text-xs font-normal text-slate-400">(tùy chọn)</span>
                    </label>
                    <input type="text" autoComplete="off" value={majorInterest} onChange={(e) => setMajorInterest(e.target.value)} placeholder="Chưa biết — AI sẽ giúp bạn khám phá" className={`${inputCls} px-3`} />
                  </div>
                )}

                {/* Row 5: Mật khẩu */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mật khẩu</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type={showPassword ? 'text' : 'password'} required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`${inputCls} pl-9 pr-9`} />
                      <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Xác nhận mật khẩu</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type={showConfirmPassword ? 'text' : 'password'} required autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className={`${inputCls} pl-9 pr-9`} />
                      <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                <label htmlFor="register-terms" className="flex items-start gap-2.5 pt-1 cursor-pointer">
                  <input id="register-terms" type="checkbox" required className="mt-0.5 w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 shrink-0" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Tôi đồng ý với{' '}
                    <a href="#" className="font-semibold text-primary-600 hover:text-primary-700">Điều khoản dịch vụ</a>
                    {' '}và{' '}
                    <a href="#" className="font-semibold text-primary-600 hover:text-primary-700">Chính sách bảo mật</a>.
                  </span>
                </label>

                <button type="submit" disabled={otpSending} className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:pointer-events-none">
                  {otpSending
                    ? <><Loader2 size={16} className="animate-spin" /> Đang gửi mã OTP...</>
                    : <><span>Tiếp tục</span><ArrowRight size={16} /></>}
                </button>
              </form>
            </>
          )}

          {/* ══════════════════════════════════════ STEP 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyAndRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 text-center">
                  <KeyRound size={16} className="inline mr-1.5 text-primary-500" />
                  Nhập mã xác thực
                </label>

                {/* 6-digit OTP boxes */}
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
                      className="w-11 h-13 text-center text-xl font-bold bg-slate-50 dark:bg-navy-800 border-2 border-slate-200 dark:border-navy-600 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-slate-900 dark:text-white"
                      style={{ height: '3.25rem' }}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                <p className="text-center text-xs text-slate-400 mt-3">
                  Kiểm tra hộp thư đến (và thư mục Spam) của <span className="font-medium text-slate-600 dark:text-slate-300">{email}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={otpCode.length < 6 || otpVerifying || isLoading}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                {otpVerifying || isLoading
                  ? <><Loader2 size={16} className="animate-spin" /> Đang xác thực...</>
                  : <><CheckCircle2 size={16} /> Xác thực & Đăng ký</>}
              </button>

              {/* Resend + back */}
              <div className="flex items-center justify-between text-sm pt-1">
                <button
                  type="button"
                  onClick={() => { setStep('form'); setError(null); setOtp(['','','','','','']); }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  ← Sửa thông tin
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

          {/* ══════════════════════════════════════ STEP 3: DONE */}
          {step === 'done' && (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 dark:bg-green-950/20 rounded-full mb-4">
                <CheckCircle2 size={36} className="text-green-500" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">Email đã xác thực thành công!</p>
              <div className="flex justify-center items-center gap-1.5 text-xs text-primary-500 font-semibold">
                <Loader2 size={13} className="animate-spin" /> Đang chuyển hướng...
              </div>
            </div>
          )}

          {step !== 'done' && (
            <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">Đăng nhập ngay</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
