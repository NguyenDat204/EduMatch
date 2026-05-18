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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 premium-gradient rounded-2xl animate-spin" />
          <p className="text-sm font-bold text-slate-500 animate-pulse">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Route protection
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex text-slate-900 dark:text-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 ml-64 transition-all duration-300">
        <header className="h-16 glass border-b flex items-center px-8 sticky top-0 z-30 justify-between">
          <h1 className="text-lg font-semibold text-slate-800 dark:text-white">EduMatch Workspace</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary-500 shadow-sm shrink-0">
              <img 
                src={user.avatar || "https://i.pravatar.cc/150?u=student"} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-bold">{user.name}</span>
            {user.role === 'admin' && (
              <button 
                onClick={() => navigate('/admin/analytics')}
                className="text-xs font-black bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Admin Panel
              </button>
            )}
          </div>
        </header>
        <main className="p-8">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {/* Supports both children (legacy) and Outlet (nested routing) */}
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};
