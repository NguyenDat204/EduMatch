import { useState } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Compass, GraduationCap, MessageSquare,
  User, CreditCard, LogOut, ChevronLeft, ChevronRight,
  Target, Sparkles, BookOpen, Building2, History,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const location = useLocation();
  const RESULT_STORAGE_KEY_BASE = 'edumatch_result_cache';

  const navGroups = [
    {
      group: 'Khám phá',
      items: [
        { icon: LayoutDashboard, label: 'Tổng quan',                path: '/dashboard' },
        { icon: Sparkles,        label: 'Trắc nghiệm hướng nghiệp', path: '/survey' },
        { icon: History,         label: 'Lịch sử trắc nghiệm',      path: '/survey-history' },
        { icon: Compass,         label: 'Khám phá',                 path: '/explore' },
        { icon: MessageSquare,   label: 'AI Tư vấn',                path: '/chat' },
      ],
    },
    {
      group: 'Hồ sơ',
      items: [
        { icon: User,       label: 'Hồ sơ cá nhân',    path: '/profile' },
        { icon: BookOpen,   label: 'Hồ sơ học tập',    path: '/academic-profile' },
        { icon: Target,     label: 'Đánh giá kỹ năng', path: '/skill-evaluation' },
        { icon: CreditCard, label: 'Nâng cấp Pro',      path: '/upgrade' },
      ],
    },
  ];

  if (user?.role === 'university') {
    navGroups.push({
      group: 'Quản lý',
      items: [{ icon: Building2, label: 'Quản lý trường học', path: '/university/manage' }],
    });
  }

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-navy-950 border-r border-navy-800 z-40 transition-all duration-300 flex flex-col overflow-y-auto no-scrollbar',
      isCollapsed ? 'w-16' : 'w-60'
    )}>
      <div className="flex flex-col min-h-full py-4">

        {/* Logo */}
        <div className={cn('flex items-center mb-6 px-3', isCollapsed ? 'justify-center' : 'justify-between')}>
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-primary-600 rounded-md flex items-center justify-center shrink-0">
                <GraduationCap size={15} className="text-white" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">EduMatch</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-navy-800 transition-colors shrink-0',
              isCollapsed && 'mx-auto'
            )}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 px-2 space-y-5">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {!isCollapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                  {group.group}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const pathname = location.pathname || '';
                  // Treat /result as part of survey flow so sidebar keeps Survey highlighted
                  const active = pathname === item.path || (item.path === '/survey' && pathname === '/result');
                  if (item.path === '/survey') {
                    const handleClick = () => {
                      try {
                        const uid = user?._id || user?.email || 'anon';
                        const RESULT_STORAGE_KEY = `${RESULT_STORAGE_KEY_BASE}_${uid}`;
                        const cached = typeof window !== 'undefined' ? localStorage.getItem(RESULT_STORAGE_KEY) : null;
                        if (cached) {
                          navigate('/result');
                          return;
                        }
                      } catch { /* ignore */ }
                      navigate('/survey');
                    };

                    return (
                      <button
                        key={item.path}
                        onClick={handleClick}
                        title={isCollapsed ? item.label : undefined}
                        className={cn(
                          'w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
                          active
                            ? 'bg-primary-600 text-white'
                            : 'text-slate-400 hover:bg-navy-800 hover:text-white',
                          isCollapsed && 'justify-center px-0'
                        )}
                      >
                        <item.icon size={18} className="shrink-0" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </button>
                    );
                  }
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={isCollapsed ? item.label : undefined}
                      className={() => cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
                        active
                          ? 'bg-primary-600 text-white'
                          : 'text-slate-400 hover:bg-navy-800 hover:text-white',
                        isCollapsed && 'justify-center px-0'
                      )}
                    >
                      <item.icon size={18} className="shrink-0" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User info + Logout */}
        <div className="px-2 mt-4 pt-4 border-t border-navy-800 space-y-1">
          {!isCollapsed && user && (
            <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
              <img
                src={user.avatar || `https://i.pravatar.cc/32?u=${user.email}`}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-navy-700 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => { logout(); navigate('/'); }}
            title={isCollapsed ? 'Đăng xuất' : undefined}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors',
              isCollapsed && 'justify-center px-0'
            )}
          >
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
