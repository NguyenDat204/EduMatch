import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, GraduationCap, ShieldCheck, MessageSquare, Briefcase,
  Building2, RefreshCw, TrendingUp, Star, Calendar, Activity,
  FileText, Settings,
} from 'lucide-react';
import { adminService } from '../../services/api';

interface StatsData {
  counts: {
    users: number; students: number; admins: number;
    careers: number; universities: number; feedbacks: number;
  };
  averageRating: number;
  recentSignups: any[];
  recentFeedbacks: any[];
  recentSurveys: any[];
}

const StatCard = ({ label, value, icon: Icon, gradient, sub }: { label: string; value: number | string; icon: any; gradient: string; sub?: string }) => (
  <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white overflow-hidden shadow-lg`}>
    <div className="absolute top-3 right-3 opacity-20">
      <Icon size={40} />
    </div>
    <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-2">{label}</p>
    <p className="text-4xl font-black leading-none">{value}</p>
    {sub && <p className="text-xs opacity-70 mt-1.5 font-medium">{sub}</p>}
  </div>
);

const fmt = (d: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
};

export const Analytics = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await adminService.getSystemAnalytics();
      if (res.success && res.data) setStats(res.data as StatsData);
    } catch {
      setError('Không thể tải dữ liệu thống kê.');
    } finally {
      if (isRefresh) setRefreshing(false); else setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg animate-pulse">
        <Activity size={26} className="text-white" />
      </div>
      <p className="text-sm font-semibold text-slate-400">Đang tải dữ liệu...</p>
    </div>
  );

  const s = stats?.counts || { users: 0, students: 0, admins: 0, careers: 0, universities: 0, feedbacks: 0 };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-indigo-500 to-violet-600 text-white uppercase tracking-widest">
              ⚡ Admin Console
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Tổng quan hệ thống</h1>
          <p className="text-sm text-slate-500 mt-0.5">Dữ liệu thời gian thực từ EduMatch platform.</p>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Người dùng" value={s.users} icon={Users} gradient="from-sky-500 to-blue-600" sub={`${s.students} học sinh`} />
        <StatCard label="Học sinh" value={s.students} icon={GraduationCap} gradient="from-emerald-500 to-teal-600" sub="Đã đăng ký" />
        <StatCard label="Quản trị viên" value={s.admins} icon={ShieldCheck} gradient="from-violet-500 to-purple-600" sub="Toàn hệ thống" />
        <StatCard label="Ngành nghề" value={s.careers} icon={Briefcase} gradient="from-amber-500 to-orange-500" sub="Trong DB" />
        <StatCard label="Đại học" value={s.universities} icon={Building2} gradient="from-indigo-500 to-blue-700" sub="Đã thêm" />
        <StatCard label="Phản hồi" value={s.feedbacks} icon={MessageSquare} gradient="from-rose-500 to-pink-600" sub={`TB ${stats?.averageRating || 5.0}★`} />
      </div>

      {/* Recent data grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent signups */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Users size={15} className="text-sky-500" /> Đăng ký gần đây
            </h3>
            <span className="text-[11px] font-bold text-slate-400">{(stats?.recentSignups || []).length} người</span>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {(stats?.recentSignups || []).length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
            ) : (stats?.recentSignups || []).map((u: any) => (
              <div key={u._id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {u.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{u.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                  <Calendar size={10} /> {fmt(u.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent feedbacks */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={15} className="text-rose-500" /> Phản hồi mới nhất
            </h3>
            <span className="text-[11px] font-bold text-slate-400">{(stats?.recentFeedbacks || []).length} mục</span>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {(stats?.recentFeedbacks || []).length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Chưa có phản hồi</p>
            ) : (stats?.recentFeedbacks || []).map((fb: any) => (
              <div key={fb._id} className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{fb.name || 'Ẩn danh'}</p>
                  <div className="flex gap-0.5 shrink-0">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={10} className={s <= (fb.rating||5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 truncate">"{fb.message}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent surveys */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FileText size={15} className="text-amber-500" /> Trắc nghiệm gần đây
            </h3>
            <span className="text-[11px] font-bold text-slate-400">{(stats?.recentSurveys || []).length} bài</span>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {(stats?.recentSurveys || []).length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
            ) : (stats?.recentSurveys || []).map((sv: any) => (
              <div key={sv._id} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
                  <TrendingUp size={14} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {sv.userId?.name || 'Ẩn danh'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {sv.result?.archetype || 'Kết quả không có'}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {fmt(sv.completedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick nav cards — dùng Link để SPA navigation, không reload */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Quản lý người dùng', path: '/admin/users',        icon: Users,     color: 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400',       border: 'hover:border-sky-300 dark:hover:border-sky-700' },
          { label: 'Quản lý ngành nghề', path: '/admin/careers',      icon: Briefcase, color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400', border: 'hover:border-emerald-300 dark:hover:border-emerald-700' },
          { label: 'Quản lý đại học',    path: '/admin/universities', icon: Building2, color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400', border: 'hover:border-amber-300 dark:hover:border-amber-700' },
          { label: 'Cài đặt hệ thống',   path: '/admin/settings',     icon: Settings,  color: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400', border: 'hover:border-violet-300 dark:hover:border-violet-700' },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl ${item.border} transition-all shadow-sm`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
              <item.icon size={17} />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
