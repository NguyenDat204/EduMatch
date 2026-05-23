import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  Users,
  Briefcase,
  BarChart2,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  School,
  GraduationCap,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { icon: BarChart2,     label: 'Thống kê',          path: '/admin/analytics' },
    { icon: Users,         label: 'Người dùng',         path: '/admin/users' },
    { icon: Briefcase,     label: 'Ngành nghề',         path: '/admin/careers' },
    { icon: School,        label: 'Trường học',         path: '/admin/universities' },
    { icon: MessageSquare, label: 'Phản hồi',           path: '/admin/feedback' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-navy-950 flex text-slate-900 dark:text-slate-100">
      {/* Admin Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-navy-950 border-r border-navy-800 z-40 transition-all duration-300 flex flex-col',
          isCollapsed ? 'w-16' : 'w-56'
        )}
      >
        <div className="flex flex-col h-full py-4">
          {/* Logo */}
          <div className={cn('flex items-center mb-6 px-3', isCollapsed ? 'justify-center' : 'justify-between')}>
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary-600 rounded-md flex items-center justify-center">
                  <GraduationCap size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-none">EduMatch</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <ShieldCheck size={10} /> Admin
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                'p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-navy-800 transition-colors',
                isCollapsed && 'mx-auto'
              )}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-400 hover:bg-navy-800 hover:text-white',
                    isCollapsed && 'justify-center px-0'
                  )
                }
              >
                <item.icon size={18} className="shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="px-2 mt-4 pt-4 border-t border-navy-800">
            <button
              onClick={handleLogout}
              title={isCollapsed ? 'Đăng xuất' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors',
                isCollapsed && 'justify-center px-0'
              )}
            >
              <LogOut size={18} />
              {!isCollapsed && <span>Đăng xuất</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn('flex-1 transition-all duration-300 min-h-screen', isCollapsed ? 'ml-16' : 'ml-56')}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
