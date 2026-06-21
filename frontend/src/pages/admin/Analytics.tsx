import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, ShieldCheck, MessageSquare, Briefcase,
  Building2, RefreshCw, TrendingUp, Star, Activity,
  FileText, Settings, Crown, BarChart3, PieChart, School,
  CheckCircle2, AlertCircle, ArrowRight,
} from 'lucide-react';
import { adminService } from '../../services/api';

interface TrendPoint {
  date: string;
  label: string;
  value: number;
}

interface DistributionPoint {
  label: string;
  value: number;
  recommendationCount?: number;
  avgSuitability?: number | null;
}

interface TopCareer {
  title: string;
  count: number;
  avgSuitability: number;
  category: string;
}

interface StatsData {
  counts: {
    users: number;
    students: number;
    admins: number;
    universityUsers: number;
    proUsers: number;
    careers: number;
    universities: number;
    articles: number;
    feedbacks: number;
    surveys: number;
  };
  averageRating: number;
  completionRate: number;
  distributions: {
    roles: DistributionPoint[];
    ratings: DistributionPoint[];
    careerCategories: DistributionPoint[];
  };
  trends: {
    users: TrendPoint[];
    surveys: TrendPoint[];
    feedbacks: TrendPoint[];
  };
  topRecommendedCareers: TopCareer[];
  recentSignups: any[];
  recentFeedbacks: any[];
  recentSurveys: any[];
}

const fmt = (d: string) => {
  if (!d) return '--';
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
};

const percent = (value: number, total: number) => total > 0 ? Math.round((value / total) * 100) : 0;

const StatCard = ({ label, value, icon: Icon, accent, sub }: { label: string; value: number | string; icon: any; accent: string; sub?: string }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon size={18} />
      </div>
    </div>
  </div>
);

const LineChart = ({ title, data, color }: { title: string; data: TrendPoint[]; color: string }) => {
  const max = Math.max(1, ...data.map((item) => item.value));
  const width = 520;
  const height = 180;
  const padding = 22;
  const step = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
  const points = data.map((item, index) => {
    const x = padding + index * step;
    const y = height - padding - (item.value / max) * (height - padding * 2);
    return { ...item, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp size={15} className={color} /> {title}
        </h3>
        <span className="text-xs text-slate-400">14 ngày</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44">
        {[0, 0.5, 1].map((ratio) => (
          <line
            key={ratio}
            x1={padding}
            x2={width - padding}
            y1={padding + ratio * (height - padding * 2)}
            y2={padding + ratio * (height - padding * 2)}
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-700"
            strokeWidth="1"
          />
        ))}
        <path d={path} fill="none" stroke="currentColor" className={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point) => (
          <g key={point.date}>
            <circle cx={point.x} cy={point.y} r="4" fill="currentColor" className={color} />
            {point.value > 0 && (
              <text x={point.x} y={point.y - 9} textAnchor="middle" className="fill-slate-500 dark:fill-slate-400" fontSize="10" fontWeight="700">
                {point.value}
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-slate-400">
        <span>{data[0]?.label || '--'}</span>
        <span>{data[data.length - 1]?.label || '--'}</span>
      </div>
    </div>
  );
};

const HorizontalBars = ({ title, data, icon: Icon }: { title: string; data: DistributionPoint[]; icon: any }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
        <Icon size={15} className="text-indigo-500" /> {title}
      </h3>
      <div className="space-y-3">
        {data.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">Chưa có dữ liệu</p>
        ) : data.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-600 dark:text-slate-300 truncate">{item.label}</span>
              <span className="text-slate-400">{item.value} · {percent(item.value, total)}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RatingDistribution = ({ data }: { data: DistributionPoint[] }) => {
  const max = Math.max(1, ...data.map((item) => item.value));
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
        <Star size={15} className="text-amber-500 fill-amber-500" /> Phân bố đánh giá
      </h3>
      <div className="flex items-end gap-3 h-40">
        {data.map((item, index) => (
          <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
            <div className="text-[11px] font-bold text-slate-500">{item.value}</div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-lg overflow-hidden flex items-end" style={{ height: 104 }}>
              <div className="w-full bg-amber-400 rounded-t-lg" style={{ height: `${Math.max(4, (item.value / max) * 100)}%` }} />
            </div>
            <div className="flex items-center gap-0.5 text-[11px] text-slate-500">
              {index + 1}<Star size={9} className="fill-amber-400 text-amber-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CareerCategoryCoverage = ({ data }: { data: DistributionPoint[] }) => {
  const totalCareers = data.reduce((sum, item) => sum + item.value, 0);
  const maxCareers = Math.max(1, ...data.map((item) => item.value));

  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 size={15} className="text-indigo-500" /> Phủ dữ liệu ngành theo lĩnh vực
        </h3>
        <span className="text-xs text-slate-400">{totalCareers} ngành</span>
      </div>
      <div className="space-y-4">
        {data.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">Chưa có dữ liệu ngành</p>
        ) : data.map((item) => {
          const coverage = percent(item.value, totalCareers);
          return (
            <div key={item.label} className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-3 md:items-center">
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{item.label}</p>
                  <span className="text-xs text-slate-400">{item.value} ngành · {coverage}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.max(4, (item.value / maxCareers) * 100)}%` }} />
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-200">{item.recommendationCount || 0}</span> lượt đề xuất
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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
      <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm animate-pulse">
        <Activity size={26} className="text-white" />
      </div>
      <p className="text-sm font-semibold text-slate-400">Đang tải dữ liệu...</p>
    </div>
  );

  const s = stats?.counts || {
    users: 0, students: 0, admins: 0, universityUsers: 0, proUsers: 0,
    careers: 0, universities: 0, articles: 0, feedbacks: 0, surveys: 0,
  };
  const systemChecks = [
    { label: 'Có dữ liệu ngành nghề', ok: s.careers > 0, hint: `${s.careers} ngành` },
    { label: 'Có dữ liệu trường đại học', ok: s.universities > 0, hint: `${s.universities} trường` },
    { label: 'Có phản hồi người dùng', ok: s.feedbacks > 0, hint: `${s.feedbacks} phản hồi` },
    { label: 'Có bài trắc nghiệm hoàn tất', ok: s.surveys > 0, hint: `${s.surveys} bài` },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white uppercase tracking-widest">
              Admin Console
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Tổng quan hệ thống</h1>
          <p className="text-sm text-slate-500 mt-0.5">Theo dõi tăng trưởng, chất lượng dữ liệu và hành vi người dùng.</p>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm"
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

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <StatCard label="Người dùng" value={s.users} icon={Users} accent="bg-sky-50 text-sky-600 dark:bg-sky-950/30" sub={`${s.students} học sinh`} />
        <StatCard label="PRO" value={s.proUsers} icon={Crown} accent="bg-amber-50 text-amber-600 dark:bg-amber-950/30" sub={`${percent(s.proUsers, s.users)}% user`} />
        <StatCard label="Admin" value={s.admins} icon={ShieldCheck} accent="bg-violet-50 text-violet-600 dark:bg-violet-950/30" sub="Quản trị" />
        <StatCard label="Đại diện trường" value={s.universityUsers} icon={School} accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" sub="Tài khoản" />
        <StatCard label="Ngành nghề" value={s.careers} icon={Briefcase} accent="bg-orange-50 text-orange-600 dark:bg-orange-950/30" sub="Trong DB" />
        <StatCard label="Đại học" value={s.universities} icon={Building2} accent="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30" sub="Đã thêm" />
        <StatCard label="Trắc nghiệm" value={s.surveys} icon={FileText} accent="bg-teal-50 text-teal-600 dark:bg-teal-950/30" sub={`${stats?.completionRate || 0}% user`} />
        <StatCard label="Rating" value={`${stats?.averageRating || 5.0}★`} icon={MessageSquare} accent="bg-rose-50 text-rose-600 dark:bg-rose-950/30" sub={`${s.feedbacks} phản hồi`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <LineChart title="User mới" data={stats?.trends.users || []} color="text-sky-500" />
        <LineChart title="Bài trắc nghiệm" data={stats?.trends.surveys || []} color="text-teal-500" />
        <LineChart title="Phản hồi" data={stats?.trends.feedbacks || []} color="text-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <HorizontalBars title="Phân bố vai trò" data={stats?.distributions.roles || []} icon={PieChart} />
        <RatingDistribution data={stats?.distributions.ratings || []} />
        <CareerCategoryCoverage data={stats?.distributions.careerCategories || []} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase size={15} className="text-orange-500" /> Top ngành được AI đề xuất
            </h3>
            <Link to="/admin/careers" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Quản lý ngành <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {(stats?.topRecommendedCareers || []).length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Chưa có dữ liệu đề xuất</p>
            ) : stats?.topRecommendedCareers.map((career, index) => (
              <div key={career.title} className="grid grid-cols-[32px_1fr_auto] gap-3 px-5 py-3 items-center">
                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-600 flex items-center justify-center text-xs font-black">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{career.title}</p>
                  <p className="text-xs text-slate-400 truncate">{career.category || 'Chưa phân loại'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 dark:text-white">{career.count}</p>
                  <p className="text-[11px] text-slate-400">lượt đề xuất</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Activity size={15} className="text-emerald-500" /> Tình trạng hệ thống
          </h3>
          <div className="space-y-3">
            {systemChecks.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                {item.ok ? (
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.hint}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link to="/admin/settings" className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 text-center">
              Cài đặt
            </Link>
            <Link to="/admin/feedback" className="px-3 py-2 rounded-lg bg-indigo-600 text-xs font-bold text-white text-center">
              Feedback
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <RecentList title="Đăng ký gần đây" icon={Users} items={stats?.recentSignups || []} render={(u: any) => ({
          key: u._id,
          title: u.name,
          subtitle: u.email,
          meta: fmt(u.createdAt),
          badge: u.role,
        })} />
        <RecentList title="Phản hồi mới" icon={MessageSquare} items={stats?.recentFeedbacks || []} render={(fb: any) => ({
          key: fb._id,
          title: fb.name || 'Ẩn danh',
          subtitle: fb.message || 'Không có bình luận',
          meta: `${fb.rating || 5}★`,
          badge: fmt(fb.createdAt),
        })} />
        <RecentList title="Trắc nghiệm gần đây" icon={FileText} items={stats?.recentSurveys || []} render={(sv: any) => ({
          key: sv._id,
          title: sv.userId?.name || 'Ẩn danh',
          subtitle: sv.result?.archetype || 'Kết quả không có',
          meta: fmt(sv.completedAt),
          badge: `${sv.result?.suitabilityScore || 0}%`,
        })} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Người dùng', path: '/admin/users', icon: Users },
          { label: 'Ngành nghề', path: '/admin/careers', icon: Briefcase },
          { label: 'Đại học', path: '/admin/universities', icon: Building2 },
          { label: 'Cài đặt', path: '/admin/settings', icon: Settings },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center justify-between gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm"
          >
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
            <item.icon size={17} className="text-indigo-500" />
          </Link>
        ))}
      </div>
    </div>
  );
};

const RecentList = ({ title, icon: Icon, items, render }: { title: string; icon: any; items: any[]; render: (item: any) => any }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
      <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
        <Icon size={15} className="text-indigo-500" /> {title}
      </h3>
      <span className="text-[11px] font-bold text-slate-400">{items.length} mục</span>
    </div>
    <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
      ) : items.map((raw) => {
        const item = render(raw);
        return (
          <div key={item.key} className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
            <div className="flex items-center justify-between gap-3 mb-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.title}</p>
              <span className="text-[10px] text-slate-400 shrink-0">{item.meta}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 shrink-0">
                {item.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
