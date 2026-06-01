import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, GraduationCap, ArrowRight,
  AlertCircle, Loader2, Users, Building2, MapPin,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { PROVINCES, joinSchool } from '../lib/provinces';

export const Register = () => {
  const [role, setRole]                       = useState<'student' | 'university'>('student');
  const [name, setName]                       = useState('');
  const [school, setSchool]                   = useState('');
  const [province, setProvince]               = useState('');
  const [grade, setGrade]                     = useState('12');
  const [majorInterest, setMajorInterest]     = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]                     = useState<string | null>(null);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError('Họ và tên không được bỏ trống.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Email không hợp lệ.'); return; }
    if (password.length < 6) { setError('Mật khẩu phải chứa ít nhất 6 ký tự.'); return; }
    if (password !== confirmPassword) { setError('Mật khẩu xác nhận không trùng khớp.'); return; }
    if (!school.trim()) {
      setError(role === 'university' ? 'Vui lòng nhập tên trường đại học.' : 'Vui lòng nhập tên trường THPT.');
      return;
    }
    if (role === 'student' && !province) { setError('Vui lòng chọn tỉnh/thành phố của trường.'); return; }

    try {
      const schoolFull = joinSchool(school, province);
      await register(name, email, password, schoolFull, role, grade, majorInterest);
      navigate(role === 'university' ? '/university/manage' : '/survey');
    } catch (err: any) {
      setError(err.message || 'Đăng ký tài khoản thất bại. Vui lòng thử lại.');
    }
  };

  const inputCls = 'w-full py-2.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-400';

  return (
      <div className="min-h-[90vh] flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-lg animate-fade-in">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-8 shadow-card">

            {/* Header */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-11 h-11 bg-primary-600 rounded-xl text-white mb-4">
                <GraduationCap size={22} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Tạo tài khoản</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Bắt đầu hành trình định hướng nghề nghiệp của bạn.</p>
            </div>

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

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg flex items-start gap-2.5 text-sm border border-red-100 dark:border-red-900/30">
                <AlertCircle size={16} className="shrink-0 mt-0.5" /><span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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

              {/* Row 2: Tên trường (full width) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {role === 'student' ? 'Trường THPT' : 'Tên trường Đại học'}
                </label>
                <div className="relative">
                  <GraduationCap size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input type="text" required autoComplete="organization" value={school} onChange={(e) => setSchool(e.target.value)} placeholder={role === 'student' ? 'THPT Phan Đình Phùng' : 'Đại học FPT'} className={`${inputCls} pl-9 pr-3`} />
                </div>
              </div>

              {/* Row 3 (student): Tỉnh/thành [2/3] + Khối lớp [1/3] */}
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

              {/* Row 4 (student): Ngành yêu thích — optional */}
              {role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Ngành yêu thích
                    <span className="ml-1.5 text-xs font-normal text-slate-400">(tùy chọn)</span>
                  </label>
                  <input type="text" autoComplete="off" value={majorInterest} onChange={(e) => setMajorInterest(e.target.value)} placeholder="Chưa biết — AI sẽ giúp bạn khám phá" className={`${inputCls} px-3`} />
                </div>
              )}

              {/* Row 5: Mật khẩu + Xác nhận */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mật khẩu</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`${inputCls} pl-9 pr-3`} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input type="password" required autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className={`${inputCls} pl-9 pr-3`} />
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

              <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:pointer-events-none">
                {isLoading
                  ? <><Loader2 size={16} className="animate-spin" /> Đang tạo tài khoản...</>
                  : <><span>Đăng ký tài khoản</span><ArrowRight size={16} /></>}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">Đăng nhập ngay</Link>
            </p>
          </div>
        </div>
      </div>
  );
};
