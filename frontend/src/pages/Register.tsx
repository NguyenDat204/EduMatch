import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { MainLayout } from '../layouts';

export const Register = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate register
    navigate('/survey');
  };

  return (
    <MainLayout>
      <div className="min-h-[90vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl animate-slide-up">
          <div className="glass rounded-[2rem] p-8 md:p-12 shadow-premium">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 premium-gradient rounded-xl text-white shadow-lg mb-4">
                <Sparkles size={24} />
              </div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Discover Your Future</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Join thousands of students finding their path.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      required 
                      placeholder="John Doe"
                      className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Current School</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                      <GraduationCap size={18} />
                    </div>
                    <input 
                      type="text" 
                      required 
                      placeholder="High School Name"
                      className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    required 
                    placeholder="student@example.com"
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      type="password" 
                      required 
                      placeholder="••••••••"
                      className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      type="password" 
                      required 
                      placeholder="••••••••"
                      className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 py-2">
                <input type="checkbox" required className="mt-1 w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  I agree to the <a href="#" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">Terms of Service</a> and <a href="#" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">Privacy Policy</a>.
                </p>
              </div>

              <button 
                type="submit"
                className="w-full py-4 premium-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 btn-transition mt-4"
              >
                Create Account
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="text-center mt-10 text-sm text-slate-500 dark:text-slate-400">
              Already have an account? {' '}
              <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 underline decoration-2 underline-offset-4">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
