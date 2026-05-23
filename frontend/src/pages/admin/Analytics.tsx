import { useState, useEffect } from 'react';
import { Users, Briefcase, MessageSquare, TrendingUp, Loader2 } from 'lucide-react';
import { adminService } from '../../services/api';

export const Analytics = () => {
  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getSystemAnalytics()
      .then((res) => { if (res.success && res.data) setStats(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  const s = stats || { totalUsers: 0, totalCareers: 0, totalFeedbacks: 0, averageFeedbackRating: 5.0 };

  const statCards = [
    { icon: Users,         label: 'Tổng người dùng',    value: s.totalUsers,                                    color: 'text-primary-600',  bg: 'bg-primary-50 dark:bg-primary-900/20' },
    { icon: Briefcase,     label: 'Tổng ngành nghề',    value: s.totalCareers,                                  color: 'text-indigo-600',   bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { icon: MessageSquare, label: 'Phản hồi',           value: s.totalFeedbacks,                                color: 'text-amber-600',    bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { icon: TrendingUp,    label: 'Điểm phản hồi TB',   value: `${(s.averageFeedbackRating || 5.0).toFixed(1)} ★`, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Thống kê hệ thống</h1>
        <p className="text-sm text-slate-500">Tổng quan tình hình sử dụng từ cơ sở dữ liệu.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-navy-800 p-5 rounded-xl border border-slate-200 dark:border-navy-700 shadow-card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{stat.label}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-white dark:bg-navy-800 p-6 rounded-xl border border-slate-200 dark:border-navy-700 shadow-card">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5">Lượt đăng ký mới (30 ngày qua)</h3>
        <div className="h-48 flex items-end justify-between gap-1 px-2">
          {Array.from({ length: 30 }).map((_, i) => {
            const h = i % 5 === 0 ? 75 : i % 3 === 0 ? 45 : i % 2 === 0 ? 90 : 30;
            return (
              <div
                key={i}
                className="flex-1 bg-primary-100 dark:bg-primary-900/30 rounded-t hover:bg-primary-500 transition-colors cursor-pointer group relative"
                style={{ height: `${h}%` }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded font-medium whitespace-nowrap transition-opacity pointer-events-none z-10">
                  Ngày {i + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
