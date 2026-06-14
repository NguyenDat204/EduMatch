import { useState, type ReactNode, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

interface DashboardLayoutProps {
  children?: ReactNode;
  noPadding?: boolean;
}

const SIDEBAR_STORAGE_KEY = 'edumatch_sidebar_collapsed';

export const DashboardLayout = ({ children, noPadding }: DashboardLayoutProps) => {
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
        'flex-1 min-w-0 transition-all duration-300 w-full flex flex-col h-full',
        'md:ml-0',
        sidebarCollapsed ? 'md:ml-16' : 'md:ml-60'
      )}>
        {noPadding ? (
          // Fullscreen pages tự quản lý layout riêng
          <div className="h-full overflow-hidden animate-fade-in">
            {children ?? <Outlet />}
          </div>
        ) : (
          // Tất cả trang — hiện DashboardHeader + scrollable content
          <>
            <DashboardHeader />
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
              <div className="max-w-6xl mx-auto animate-fade-in">
                {children ?? <Outlet />}
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
};
