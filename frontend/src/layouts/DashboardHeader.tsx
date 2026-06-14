import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, Sun, Moon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';

// Page title map
const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard':        { title: 'Tổng quan',                  subtitle: 'Xem tiến trình của bạn' },
  '/survey':           { title: 'Trắc nghiệm hướng nghiệp',   subtitle: 'Khám phá con đường phù hợp' },
  '/result':           { title: 'Kết quả phân tích',           subtitle: 'Gợi ý nghề nghiệp từ AI' },
  '/survey-history':   { title: 'Lịch sử trắc nghiệm',        subtitle: 'Các lần làm trắc nghiệm' },
  '/explore':          { title: 'Khám phá nghề nghiệp',        subtitle: 'Tìm kiếm nghề phù hợp' },
  '/chat':             { title: 'AI Career Advisor',           subtitle: 'Tư vấn hướng nghiệp thông minh' },
  '/profile':          { title: 'Hồ sơ cá nhân',              subtitle: 'Quản lý thông tin của bạn' },
  '/academic-profile': { title: 'Hồ sơ học tập',              subtitle: 'Thông tin học vấn & điểm số' },
  '/skill-evaluation': { title: 'Đánh giá kỹ năng',           subtitle: 'Tự đánh giá năng lực bản thân' },
  '/upgrade':          { title: 'Nâng cấp Pro',               subtitle: 'Mở khóa tính năng nâng cao' },
  '/compare':          { title: 'So sánh nghề nghiệp',        subtitle: 'Phân tích chi tiết các lựa chọn' },
  '/favorites':        { title: 'Nghề đã lưu',                subtitle: 'Danh sách yêu thích của bạn' },
  '/university/manage':{ title: 'Quản lý trường học',         subtitle: 'Thông tin & hồ sơ nhà trường' },
};

const DARK_KEY = 'edumatch_dark_mode';

export const DashboardHeader = () => {
  const location = useLocation();
  const { user } = useAuth();

  // ── Dark mode toggle ───────────────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem(DARK_KEY) === '1' || document.documentElement.classList.contains('dark'); }
    catch { return false; }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem(DARK_KEY, '1'); } catch { /* ignore */ }
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem(DARK_KEY, '0'); } catch { /* ignore */ }
    }
  }, [isDark]);

  // Resolve page info
  const pathname = location.pathname;
  // Handle dynamic routes like /explore/:id, /career-path/:id, /universities/:id
  const pageInfo =
    PAGE_TITLES[pathname] ||
    (pathname.startsWith('/explore/') ? { title: 'Chi tiết nghề nghiệp', subtitle: 'Lộ trình & thông tin nghề' } : null) ||
    (pathname.startsWith('/universities/') ? { title: 'Chi tiết trường', subtitle: 'Thông tin tuyển sinh' } : null) ||
    (pathname.startsWith('/career-path/') ? { title: 'Lộ trình nghề nghiệp', subtitle: 'Kế hoạch phát triển' } : null) ||
    { title: 'EduMatch', subtitle: '' };

  const isGoogleAvatar = user?.avatar && !user.avatar.includes('pravatar.cc');
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';
  const avatarColors = ['from-violet-500 to-indigo-600', 'from-emerald-500 to-teal-600', 'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600', 'from-sky-500 to-blue-600'];
  const colorIndex = (((user?.name?.charCodeAt(0) || 0) + (user?.email?.charCodeAt(0) || 0)) % avatarColors.length);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-navy-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-navy-800 shrink-0">
      <div className="flex items-center gap-3 px-4 sm:px-6 h-14">

        {/* ── Mobile: nút 3 gạch mở sidebar chính ── */}
        <button
          onClick={() => window.dispatchEvent(new Event('edumatch:open-sidebar'))}
          className="md:hidden p-2 -ml-1 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors shrink-0"
          aria-label="Mở menu điều hướng"
        >
          <Menu size={20} />
        </button>

        {/* ── Page title ── */}
        <div className="flex-1 min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate leading-tight">
            {pageInfo.title}
          </h1>
          {pageInfo.subtitle && (
            <p className="hidden sm:block text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight">
              {pageInfo.subtitle}
            </p>
          )}
        </div>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            aria-label={isDark ? 'Chuyển sáng' : 'Chuyển tối'}
            title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Notification placeholder */}
          <button
            className="hidden sm:flex p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors relative"
            aria-label="Thông báo"
            title="Thông báo"
          >
            <Bell size={17} />
          </button>

          {/* User avatar / name — link to profile */}
          <Link
            to="/profile"
            className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 dark:border-navy-700 ml-1 hover:opacity-80 transition-opacity"
            title="Hồ sơ cá nhân"
          >
            {isGoogleAvatar ? (
              <img
                src={user!.avatar}
                alt={user!.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-navy-700 shrink-0"
              />
            ) : (
              <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarColors[colorIndex]} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                {initial}
              </div>
            )}
            <span className="hidden sm:block text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
              {user?.name}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};
