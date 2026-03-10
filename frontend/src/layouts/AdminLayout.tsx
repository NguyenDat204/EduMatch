import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  BarChart, 
  MessageSquare, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../utils';

export const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { icon: Users, label: 'Quản lý Người dùng', path: '/admin/users' },
    { icon: Briefcase, label: 'Quản lý Nghề nghiệp', path: '/admin/careers' },
    { icon: BarChart, label: 'Thống kê & Báo cáo', path: '/admin/analytics' },
    { icon: MessageSquare, label: 'Phản hồi', path: '/admin/feedback' },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex text-slate-900 dark:text-slate-100 font-sans">
      {/* Admin Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-screen bg-slate-900 text-slate-300 border-r border-slate-800 z-40 transition-all duration-300 flex flex-col",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex flex-col h-full py-6">
          <div className="px-6 mb-10 flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2 text-white">
                <ShieldCheck className="text-primary-500" />
                <span className="text-xl font-bold tracking-wider">
                  Admin
                </span>
              </div>
            )}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                  isActive 
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20" 
                    : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon size={22} className={cn("shrink-0", !isCollapsed && "group-hover:scale-110 transition-transform")} />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="px-4 mt-auto">
            <button 
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-red-400 hover:bg-red-500/10 w-full",
                isCollapsed && "justify-center px-0"
              )}
            >
              <LogOut size={22} />
              {!isCollapsed && <span className="font-medium">Đăng xuất</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300 min-h-screen",
          isCollapsed ? "ml-20" : "ml-64"
        )}
      >
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
