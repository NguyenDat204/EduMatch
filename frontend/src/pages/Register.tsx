import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, GraduationCap, ArrowRight, AlertCircle, Loader2, Users, Building2 } from 'lucide-react';
import { MainLayout } from '../layouts';
import { useAuth } from '../hooks/useAuth';

export const Register = () => {
  const [role, setRole]                     = useState<'student' | 'university'>('student');
  const [name, setName]                     = useState('');
  const [school, setSchool]                 = useState('');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]                   = useState<string | null>(null);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    try {
      await register(name, email, password, school, role);
      navigate(role === 'university' ? '/university/manage' : '/survey');
    } catch (err: any) {
      setError(err.message || 'Đăng ký tài khoản thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <MainLayout>
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
                { value: 'student',    label: 'Học sinh',       icon: <Users size={15} /> },
                { value: 'university', label: 'Đại diện ĐH',    icon: <Building2 size={15} /> },
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
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg flex items-start gap-2.5 text-sm border border-red-100 dark:border-red-900/30">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Họ và tên</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {role === 'student' ? 'Trường THPT' : 'Tên trường ĐH'}
                  </label>
                  <div className="relative">
                    <GraduationCap size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder={role === 'student' ? 'THPT Phan Đình Phùng' : 'Đại học FPT'}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mật khẩu</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <input type="checkbox" required className="mt-0.5 w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300" />
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Tôi đồng ý với{' '}
                  <a href="#" className="font-semibold text-primary-600 hover:text-primary-700">Điều khoản dịch vụ</a>
                  {' '}và{' '}
                  <a href="#" className="font-semibold text-primary-600 hover:text-primary-700">Chính sách bảo mật</a>.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:pointer-events-none mt-1"
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Đang tạo tài khoản...</>
                ) : (
                  <><span>Đăng ký tài khoản</span><ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
