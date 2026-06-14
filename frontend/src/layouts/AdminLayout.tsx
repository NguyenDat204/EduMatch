import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, Building2,
  MessageSquare, Settings, LogOut, ChevronLeft, ChevronRight,
  ShieldCheck, Zap, Menu, X, Bell,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Tổng quan',       path: '/admin/analytics',    color: 'text-sky-400' },
  { icon: Users,           label: 'Người dùng',       path: '/admin/users',        color: 'text-violet-400' },
  { icon: Briefcase,       label: 'Ngành nghề',       path: '/admin/careers',      color: 'text-emerald-400' },
  { icon: Building2,       label: 'Đại học',          path: '/admin/universities', color: 'text-amber-400' },
  { icon: MessageSquare,   label: 'Phản hồi',         path: '/admin/feedback',     color: 'text-rose-400' },
  { icon: Settings,        label: 'Cài đặt hệ thống', path: '/admin/settings',     color: 'text-slate-400' },
];

export const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, isLoading } = useAuth();

  // Guard: redirect non-admins
  useEffect(() => {
    if (!isLoading && user && user.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
    if (!isLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  const initial = user.name?.charAt(0)?.toUpperCase() || 'A';

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 z-10" />

      {/* Logo row */}
      <div className={cn(
        'flex items-center px-4 pt-6 pb-4 shrink-0',
        !isMobile && isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        {(!isCollapsed || isMobile) && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0">
              <img src="/edumatch_logo.jpg" alt="EduMatch" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white leading-none tracking-tight">EduMatch</p>
              <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                <ShieldCheck size={9} className="text-violet-400" /> Admin Portal
              </p>
            </div>
          </div>
        )}
        {isMobile ? (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={17} />
          </button>
        ) : (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all shrink-0',
              isCollapsed && 'mx-auto'
            )}
          >
            {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {(!isCollapsed || isMobile) && (
          <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">Quản trị</p>
        )}
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed && !isMobile ? item.label : undefined}
              onClick={() => isMobile && setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-[13px] font-semibold group',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                !isCollapsed || isMobile ? '' : 'justify-center px-2'
              )}
            >
              <item.icon
                size={17}
                className={cn(
                  'shrink-0 transition-colors',
                  active ? item.color : 'text-slate-500 group-hover:text-slate-300'
                )}
              />
              {(!isCollapsed || isMobile) && <span className="flex-1">{item.label}</span>}
              {active && (!isCollapsed || isMobile) && (
                <span className="w-1.5 h-1.5 rounded-full bg-white opacity-70 shrink-0" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer: user info + logout */}
      <div className="shrink-0 px-2 pb-4 pt-3 border-t border-white/5 space-y-1.5">
        {(!isCollapsed || isMobile) && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-white truncate leading-none">{user.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">{user.email}</p>
            </div>
            <Zap size={12} className="text-amber-400 shrink-0" />
          </div>
        )}
        <button
          onClick={handleLogout}
          title={isCollapsed && !isMobile ? 'Đăng xuất' : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-[13px] font-semibold text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all',
            !isCollapsed || isMobile ? '' : 'justify-center px-2'
          )}
        >
          <LogOut size={17} />
          {(!isCollapsed || isMobile) && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  );

  // Current page label for topbar
  const currentNav = NAV_ITEMS.find(n =>
    location.pathname === n.path || location.pathname.startsWith(n.path + '/')
  );

  return (
    // Root: full-height flex row, no overflow issues
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      {/* ── Mobile hamburger ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-[#0d1526] text-slate-400 hover:text-white border border-white/10 shadow-lg"
      >
        <Menu size={18} />
      </button>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div className={cn(
        'md:hidden fixed left-0 top-0 h-screen w-64 bg-[#0d1526] border-r border-white/5 z-50 flex flex-col transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent isMobile />
      </div>

      {/* ── Desktop sidebar: fixed, no relative, no flex-shrink ── */}
      <aside className={cn(
        'hidden md:block fixed left-0 top-0 h-screen bg-[#0d1526] border-r border-white/5 z-40 transition-all duration-300',
        isCollapsed ? 'w-[68px]' : 'w-[220px]'
      )}>
        {/* Inner flex col fills the fixed container */}
        <div className="relative flex flex-col h-full">
          <SidebarContent />
        </div>
      </aside>

      {/* ── Main area: offset by sidebar width via margin ── */}
      <div className={cn(
        'transition-all duration-300',
        isCollapsed ? 'md:ml-[68px]' : 'md:ml-[220px]'
      )}>
        {/* Sticky topbar */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 ml-10 md:ml-0">
            {currentNav ? (
              <>
                <currentNav.icon size={16} className={currentNav.color} />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{currentNav.label}</span>
              </>
            ) : (
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Admin</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-full text-[11px] font-bold border border-emerald-200 dark:border-emerald-900/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
            </span>
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell size={16} />
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              {initial}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 max-w-[1400px] mx-auto min-h-[calc(100vh-3.5rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
