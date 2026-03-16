import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Compass, 
  GraduationCap, 
  MessageSquare, 
  User, 
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Scale,
  Heart,
  BookOpen,
  Book,
  Target,
  Sparkles
} from 'lucide-react';
import { cn } from '../utils';

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const navGroups = [
    {
      group: 'Khám phá',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Sparkles, label: 'Trắc nghiệm hướng nghiệp', path: '/survey' },
        { icon: Compass, label: 'Khám phá nghề nghiệp', path: '/explore' },
        { icon: Scale, label: 'So sánh nghề nghiệp', path: '/compare' },
        { icon: GraduationCap, label: 'Điểm sàn Đại học', path: '/universities' },
        { icon: MessageSquare, label: 'AI Advisor', path: '/chat' },
        { icon: BookOpen, label: 'Bài viết & Cẩm nang', path: '/articles' },
      ]
    },
    {
      group: 'Hồ sơ của tôi',
      items: [
        { icon: User, label: 'Hồ sơ cá nhân', path: '/profile' },
        { icon: Book, label: 'Hồ sơ học tập', path: '/academic-profile' },
        { icon: Target, label: 'Đánh giá kỹ năng', path: '/skill-evaluation' },
        { icon: Heart, label: 'Nghề nghiệp đã lưu', path: '/favorites' },
        { icon: CreditCard, label: 'Gói đăng ký', path: '/upgrade' },
      ]
    }
  ];

  const handleLogout = () => {
    // In the future this should clear AuthContext/tokens
    navigate('/');
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen glass border-r z-40 transition-all duration-300 flex flex-col overflow-y-auto",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col min-h-full py-6">
        <div className="px-6 mb-8 flex items-center justify-between shrink-0">
          {!isCollapsed && (
            <span className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 uppercase tracking-wider">
              EduMatch
            </span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary-600 transition-colors shrink-0 mx-auto"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-6 shrink-0">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              {!isCollapsed && (
                <div className="px-4 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {group.group}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => cn(
                      "flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all group",
                      isActive 
                        ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20" 
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-600"
                    )}
                  >
                    <item.icon size={20} className={cn("shrink-0", !isCollapsed && "group-hover:scale-110 transition-transform")} />
                    {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-4 mt-auto">
          <button 
            onClick={handleLogout}
            className={cn(
            "flex items-center gap-4 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-all",
            isCollapsed && "justify-center"
          )}>
            <LogOut size={22} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
