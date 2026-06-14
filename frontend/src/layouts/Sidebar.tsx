import { useState } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Compass, GraduationCap, MessageSquare,
  User, CreditCard, LogOut, ChevronLeft, ChevronRight,
  Target, Sparkles, BookOpen, Building2, History, Menu, X,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

const SIDEBAR_STORAGE_KEY = 'edumatch_sidebar_collapsed';

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const Sidebar = ({ onCollapsedChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1'; } catch { return false; }
  });
  // Mobile drawer open state
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const location = useLocation();
  const RESULT_STORAGE_KEY_BASE = 'edumatch_result_cache';

  const toggleCollapsed = (next: boolean) => {
    setIsCollapsed(next);
    try { localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0'); } catch { /* ignore */ }
    onCollapsedChange?.(next);
  };

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

  // Shared nav content rendered inside both desktop sidebar and mobile drawer
  const NavContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <div className="flex flex-col min-h-full py-4">
      {/* Logo row */}
      <div className={cn(
        'flex items-center mb-6 px-3',
        isCollapsed && !mobileOpen ? 'justify-center' : 'justify-between'
      )}>
        {(!isCollapsed || mobileOpen) && (
          <Link to="/dashboard" className="flex items-center gap-2.5" onClick={onNavClick}>
            <div className="w-7 h-7 bg-primary-600 rounded-md flex items-center justify-center shrink-0">
              <GraduationCap size={15} className="text-white" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">EduMatch</span>
          </Link>
        )}
        {/* Desktop collapse toggle (hidden on mobile drawer) */}
        {!mobileOpen && (
          <button
            onClick={() => toggleCollapsed(!isCollapsed)}
            className={cn(
              'p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-navy-800 transition-colors shrink-0',
              isCollapsed && 'mx-auto'
            )}
            aria-label={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
        {/* Mobile close button */}
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-navy-800 transition-colors"
            aria-label="Đóng menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-2 space-y-5 overflow-y-auto">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {(!isCollapsed || mobileOpen) && (
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                {group.group}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const pathname = location.pathname || '';
                const active = pathname === item.path || (item.path === '/survey' && pathname === '/result');

                if (item.path === '/survey') {
                  const handleClick = () => {
                    onNavClick?.();
                    try {
                      const uid = user?._id || user?.email || 'anon';
                      const key = `${RESULT_STORAGE_KEY_BASE}_${uid}`;
                      if (typeof window !== 'undefined' && localStorage.getItem(key)) {
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
                      title={isCollapsed && !mobileOpen ? item.label : undefined}
                      className={cn(
                        'w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
                        active ? 'bg-primary-600 text-white' : 'text-slate-400 hover:bg-navy-800 hover:text-white',
                        isCollapsed && !mobileOpen && 'justify-center px-0'
                      )}
                    >
                      <item.icon size={18} className="shrink-0" />
                      {(!isCollapsed || mobileOpen) && <span>{item.label}</span>}
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={isCollapsed && !mobileOpen ? item.label : undefined}
                    onClick={onNavClick}
                    className={() => cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
                      active ? 'bg-primary-600 text-white' : 'text-slate-400 hover:bg-navy-800 hover:text-white',
                      isCollapsed && !mobileOpen && 'justify-center px-0'
                    )}
                  >
                    <item.icon size={18} className="shrink-0" />
                    {(!isCollapsed || mobileOpen) && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="px-2 mt-4 pt-4 border-t border-navy-800 space-y-1">
        {(!isCollapsed || mobileOpen) && user && (
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
          onClick={() => { onNavClick?.(); logout(); navigate('/'); }}
          title={isCollapsed && !mobileOpen ? 'Đăng xuất' : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors',
            isCollapsed && !mobileOpen && 'justify-center px-0'
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {(!isCollapsed || mobileOpen) && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile hamburger button (visible only on small screens) ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-navy-950 text-slate-400 hover:text-white border border-navy-800 shadow-lg"
        aria-label="Mở menu"
      >
        <Menu size={20} />
      </button>

      {/* ── Mobile overlay backdrop ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer (slides in from left) ── */}
      <div className={cn(
        'md:hidden fixed left-0 top-0 h-screen w-64 bg-navy-950 border-r border-navy-800 z-50 flex flex-col overflow-y-auto no-scrollbar transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <NavContent onNavClick={() => setMobileOpen(false)} />
      </div>

      {/* ── Desktop sidebar (always visible on md+) ── */}
      <aside className={cn(
        'hidden md:flex fixed left-0 top-0 h-screen bg-navy-950 border-r border-navy-800 z-40 transition-all duration-300 flex-col overflow-y-auto no-scrollbar',
        isCollapsed ? 'w-16' : 'w-60'
      )}>
        <NavContent />
      </aside>
    </>
  );
};
