import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  Briefcase,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Settings,
  LayoutDashboard,
  Zap,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: 'Bảng điều khiển', path: '/admin/analytics', color: 'text-primary-400' },
    { icon: Briefcase,       label: 'Ngành nghề',       path: '/admin/careers',   color: 'text-emerald-400' },
    { icon: Settings,        label: 'Cấu hình',         path: '/admin/settings',  color: 'text-amber-400' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex text-slate-900 dark:text-slate-100" style={{ background: 'var(--bg-base, #f1f5f9)' }}>
      {/* ─── Sidebar ─── */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen z-40 transition-all duration-300 flex flex-col',
          'bg-[#0f1729] border-r border-white/5',
          isCollapsed ? 'w-[68px]' : 'w-[220px]'
        )}
      >
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-500 via-violet-500 to-primary-500" />

        <div className="flex flex-col h-full py-4 pt-5">
          {/* Logo row */}
          <div className={cn('flex items-center px-3 mb-8', isCollapsed ? 'justify-center' : 'justify-between')}>
            {!isCollapsed && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <GraduationCap size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-white tracking-tight leading-none">EduMatch</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <ShieldCheck size={9} className="text-violet-400" /> Admin Portal
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                'p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all',
                isCollapsed && 'mx-auto'
              )}
            >
              {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-[13px] font-semibold group',
                    isActive
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-white/5 hover:text-slate-200',
                    isCollapsed && 'justify-center px-0'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={17}
                      className={cn('shrink-0 transition-colors', isActive ? item.color : 'text-slate-500 group-hover:text-slate-300')}
                    />
                    {!isCollapsed && <span>{item.label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Info + Logout */}
          <div className="px-2 mt-4 pt-4 border-t border-white/5 space-y-2">
            {!isCollapsed && user && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-white truncate leading-none">{user.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{user.email}</p>
                </div>
                <Zap size={12} className="text-amber-400 shrink-0 ml-auto" />
              </div>
            )}

            <button
              onClick={handleLogout}
              title={isCollapsed ? 'Đăng xuất' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-[13px] font-semibold text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all',
                isCollapsed && 'justify-center px-0'
              )}
            >
              <LogOut size={17} />
              {!isCollapsed && <span>Đăng xuất</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main content area ─── */}
      <main
        className={cn(
          'flex-1 transition-all duration-300 min-h-screen bg-slate-50 dark:bg-slate-900',
          isCollapsed ? 'ml-[68px]' : 'ml-[220px]'
        )}
      >
        <div className="p-6 max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
