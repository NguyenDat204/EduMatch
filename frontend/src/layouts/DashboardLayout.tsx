import { useState, type ReactNode, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

interface DashboardLayoutProps {
  children?: ReactNode;
}

const SIDEBAR_STORAGE_KEY = 'edumatch_sidebar_collapsed';

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Sync sidebar collapsed state — persisted in localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1'; } catch { return false; }
  });

  // Listen for sidebar toggle changes from the Sidebar component
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SIDEBAR_STORAGE_KEY) {
        setSidebarCollapsed(e.newValue === '1');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Also poll localStorage on focus (same-tab updates won't trigger storage event)
  useEffect(() => {
    const onFocus = () => {
      try {
        const val = localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1';
        setSidebarCollapsed(val);
      } catch { /* ignore */ }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

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
      <Sidebar onCollapsedChange={setSidebarCollapsed} />

      {/* Main content — on mobile: full width (sidebar is a drawer overlay)
                       on desktop: shifts based on sidebar collapsed state */}
      <div className={cn(
        'flex-1 min-w-0 transition-all duration-300 w-full',
        // Mobile: no margin (sidebar is a drawer, not in flow)
        // Desktop: margin matches sidebar width
        'md:ml-0',
        sidebarCollapsed ? 'md:ml-16' : 'md:ml-60'
      )}>
        {/* Top Header */}
        <header className="h-14 bg-white dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800 flex items-center px-4 sm:px-6 sticky top-0 z-30 justify-between">
          <h1 className="text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">EduMatch</h1>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user.isPro && (
              <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hidden sm:inline-flex">
                Pro
              </span>
            )}
            {user.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/analytics')}
                className="text-xs font-semibold bg-primary-600 text-white px-2 sm:px-3 py-1.5 rounded-md hover:bg-primary-700 transition-colors"
              >
                Admin
              </button>
            )}
            <img
              src={user.avatar || `https://i.pravatar.cc/32?u=${user.email}`}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-primary-200 dark:border-primary-800 shrink-0"
            />
          </div>
        </header>

        <main className="p-4 sm:p-6 pt-14 md:pt-6">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};
