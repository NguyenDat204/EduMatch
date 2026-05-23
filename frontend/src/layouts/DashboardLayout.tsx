import { type ReactNode, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../hooks/useAuth';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex text-slate-900 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 ml-60 transition-all duration-300 min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-white dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800 flex items-center px-6 sticky top-0 z-30 justify-between">
          <h1 className="text-sm font-semibold text-slate-500 dark:text-slate-400">EduMatch</h1>
          <div className="flex items-center gap-3">
            {user.isPro && (
              <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Pro
              </span>
            )}
            {user.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/analytics')}
                className="text-xs font-semibold bg-primary-600 text-white px-3 py-1.5 rounded-md hover:bg-primary-700 transition-colors"
              >
                Admin
              </button>
            )}
            <img
              src={user.avatar || `https://i.pravatar.cc/32?u=${user.email}`}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-primary-200 dark:border-primary-800"
            />
          </div>
        </header>

        <main className="p-6">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};
