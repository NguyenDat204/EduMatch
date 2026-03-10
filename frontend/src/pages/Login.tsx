import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Github, Sparkles } from 'lucide-react';
import { MainLayout } from '../layouts';

export const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    navigate('/dashboard');
  };

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">
          <div className="glass rounded-3xl p-8 md:p-10 shadow-premium">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 premium-gradient rounded-xl text-white shadow-lg mb-4">
                <Sparkles size={24} />
              </div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Continue your career discovery journey.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">Quên mật khẩu?</Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <Lock size={18} />
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
                Sign In
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold"><span className="px-3 bg-white dark:bg-slate-900 text-slate-400">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl text-sm font-bold transition-all border border-slate-100 dark:border-slate-700"
              >
                <div className="w-4 h-4 rounded-full bg-red-500 mr-1" /> Google
              </button>
              <button className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl text-sm font-bold transition-all border border-slate-100 dark:border-slate-700">
                <Github size={18} /> Github
              </button>
            </div>

            <p className="text-center mt-10 text-sm text-slate-500 dark:text-slate-400">
              Don't have an account? {' '}
              <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700 underline decoration-2 underline-offset-4">Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
