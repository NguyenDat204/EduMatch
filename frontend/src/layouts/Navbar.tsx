import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, GraduationCap, LayoutDashboard, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAIStatus } from '../hooks/useAIStatus';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { isAIRunning } = useAIStatus();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-navy-800 bg-white/95 dark:bg-navy-950/95 backdrop-blur-sm shadow-nav">
      {/* AI running indicator — thin animated bar at very top of navbar */}
      {isAIRunning && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-200 dark:bg-navy-800 overflow-hidden">
          <div className="h-full bg-primary-500 animate-[shimmer_1.5s_ease-in-out_infinite]"
            style={{ width: '40%', animation: 'ai-progress 1.5s ease-in-out infinite' }} />
          <style>{`
            @keyframes ai-progress {
              0%   { transform: translateX(-100%); }
              100% { transform: translateX(350%); }
            }
          `}</style>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              EduMatch
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="/#problem" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Vấn đề
            </a>
            <a href="/#how-it-works" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Cách hoạt động
            </a>
            <a href="/#universities" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Nhà trường
            </a>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* AI processing badge — clickable, navigates to /result */}
            {isAIRunning && isAuthenticated && (
              <Link
                to="/result"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800/50 text-primary-600 dark:text-primary-400 rounded-full text-xs font-semibold animate-pulse"
              >
                <Loader2 size={12} className="animate-spin" />
                AI đang phân tích...
              </Link>
            )}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-600 transition-colors"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <div className="w-px h-5 bg-slate-200 dark:bg-navy-700" />
                <div className="flex items-center gap-2">
                  <img
                    src={user.avatar || `https://i.pravatar.cc/40?u=${user.email}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-primary-200 object-cover"
                  />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                  Bắt đầu ngay
                </Link>
              </>
            )}
          </div>

          {/* Mobile right side */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile AI badge */}
            {isAIRunning && isAuthenticated && (
              <Link to="/result" className="flex items-center gap-1 px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800/50 text-primary-600 rounded-full text-xs font-semibold animate-pulse">
                <Loader2 size={10} className="animate-spin" />
                AI
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-navy-950 border-t border-slate-100 dark:border-navy-800 animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            <a href="/#problem" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 hover:bg-slate-50 dark:hover:bg-navy-900 rounded-lg transition-colors">
              Vấn đề
            </a>
            <a href="/#how-it-works" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 hover:bg-slate-50 dark:hover:bg-navy-900 rounded-lg transition-colors">
              Cách hoạt động
            </a>
            <a href="/#universities" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 hover:bg-slate-50 dark:hover:bg-navy-900 rounded-lg transition-colors">
              Nhà trường
            </a>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-navy-800 space-y-2">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <img
                      src={user.avatar || `https://i.pravatar.cc/40?u=${user.email}`}
                      alt={user.name}
                      className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 hover:bg-slate-50 dark:hover:bg-navy-900 rounded-lg transition-colors">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors">
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 hover:bg-slate-50 dark:hover:bg-navy-900 rounded-lg transition-colors">
                    Đăng nhập
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-sm font-bold text-center bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Bắt đầu ngay
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
