import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, KeyRound, Sparkles } from 'lucide-react';

export const ForgotPassword = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const navigate = useNavigate();

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate password reset
    navigate('/login');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="glass rounded-3xl p-8 md:p-10 shadow-premium">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 premium-gradient rounded-xl text-white shadow-lg mb-4">
              <Sparkles size={24} />
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Khôi phục mật khẩu</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {step === 1 ? 'Nhập email của bạn để nhận mã xác thực.' : 'Nhập mã OTP và mật khẩu mới của bạn.'}
            </p>
          </div>

          {step === 1 ? (
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
                    placeholder="student@example.com"
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 premium-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 btn-transition mt-8"
              >
                Gửi mã OTP
                <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Mã OTP</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <KeyRound size={18} />
                  </div>
                  <input 
                    type="text" 
                    required 
                    placeholder="123456"
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Mật khẩu mới</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <KeyRound size={18} />
                  </div>
                  <input 
                    type="password" 
                    required 
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 premium-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 btn-transition mt-8"
              >
                Đặt lại mật khẩu
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          <p className="text-center mt-10 text-sm text-slate-500 dark:text-slate-400">
            Trở lại trang {' '}
            <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 underline decoration-2 underline-offset-4">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
