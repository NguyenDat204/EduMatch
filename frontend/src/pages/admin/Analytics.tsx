import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, ShieldCheck, MessageSquare, Briefcase,
  Building2, RefreshCw, TrendingUp, Star, Activity,
  FileText, Settings, Crown, BarChart3, PieChart, School,
  CheckCircle2, AlertCircle, ArrowRight, DollarSign, Bot, Gauge,
  ThumbsUp, ThumbsDown, CreditCard,
} from 'lucide-react';
import { adminService } from '../../services/api';
import { getAnalyticsPageTitle } from '../../lib/pageTitles';

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
  amount?: number;
}

interface TopCareer {
  title: string;
  count: number;
  avgSuitability: number;
  category: string;
}

interface Ga4TrendPoint {
  date: string;
  label: string;
  activeUsers: number;
  sessions: number;
  pageViews: number;
  events: number;
}

interface Ga4Data {
  configured: boolean;
  propertyId?: string;
  error?: string;
  summary: {
    activeUsers: number;
    newUsers: number;
    sessions: number;
    pageViews: number;
    events: number;
    engagementRate: number;
    averageSessionDuration: number;
  } | null;
  realtime: {
    activeUsers: number;
    pageViews: number;
    events: number;
    pages?: {
      path: string;
      title?: string;
      activeUsers: number;
      pageViews: number;
    }[];
  };
  trends: Ga4TrendPoint[];
  topPages: {
    path: string;
    title: string;
    pageViews: number;
    activeUsers: number;
    events: number;
  }[];
  trafficChannels?: {
    channel: string;
    sessions: number;
    activeUsers: number;
    pageViews: number;
    events: number;
  }[];
  topEvents: {
    name: string;
    count: number;
    activeUsers: number;
  }[];
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
    recommendationFeedbacks: number;
    payments: number;
    chats: number;
    interactions: number;
  };
  averageRating: number;
  completionRate: number;
  period?: {
    key: AnalyticsPeriod;
    label: string;
    days: number;
    granularity: 'day';
    from: string;
    to: string;
  };
  quality: {
    avgSuitability: number;
    avgConfidence: number;
    highConfidenceCount: number;
    mediumConfidenceCount: number;
    exploratoryConfidenceCount: number;
    recommendationFeedbackCount: number;
    avgRecommendationAccuracy: number;
    avgSuitabilityAtFeedback: number;
    avgConfidenceAtFeedback: number;
    interestedCount: number;
    unsureCount: number;
    notInterestedCount: number;
  };
  monetization: {
    totalRevenue: number;
    paidCount: number;
    pendingCount: number;
    failedCount: number;
    conversionRate: number;
  };
  aiUsage: {
    chats: number;
    totalMessages: number;
    avgMessagesPerConversation: number;
    totalTokens: number;
    interactions: number;
  };
  distributions: {
    roles: DistributionPoint[];
    ratings: DistributionPoint[];
    careerCategories: DistributionPoint[];
    recommendationFit: DistributionPoint[];
    paymentStatuses: DistributionPoint[];
  };
  trends: {
    users: TrendPoint[];
    surveys: TrendPoint[];
    feedbacks: TrendPoint[];
    chats: TrendPoint[];
    recommendationFeedbacks: TrendPoint[];
    payments: TrendPoint[];
    revenue: TrendPoint[];
  };
  topRecommendedCareers: TopCareer[];
  recommendationFeedbackByCareer: {
    title: string;
    count: number;
    avgAccuracy: number;
    interestedCount: number;
    notInterestedCount: number;
  }[];
  ga4?: Ga4Data;
  recentSignups: any[];
  recentFeedbacks: any[];
  recentSurveys: any[];
  recentRecommendationFeedbacks: any[];
  recentPayments: any[];
}

type AnalyticsPeriod = 'week' | 'month' | 'year' | 'all';

const PERIOD_OPTIONS: { key: AnalyticsPeriod; label: string; description: string }[] = [
  { key: 'week', label: 'Tuần', description: '7 ngày' },
  { key: 'month', label: 'Tháng', description: '30 ngày' },
  { key: 'year', label: 'Năm', description: '365 ngày' },
  { key: 'all', label: 'Tất cả', description: 'Toàn thời gian' },
];

const fmt = (d: string) => {
  if (!d) return '--';
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
};

const percent = (value: number, total: number) => total > 0 ? Math.round((value / total) * 100) : 0;
const money = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
const duration = (seconds: number) => {
  if (!seconds) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

const trafficChannelLabel: Record<string, string> = {
  'Organic Social': 'Social tự nhiên',
  'Paid Social': 'Social trả phí',
  'Organic Search': 'Tìm kiếm tự nhiên',
  'Paid Search': 'Tìm kiếm trả phí',
  Direct: 'Trực tiếp',
  Referral: 'Giới thiệu',
  Email: 'Email',
  Affiliates: 'Tiếp thị liên kết',
  Display: 'Hiển thị',
  'Organic Video': 'Video tự nhiên',
  'Paid Video': 'Video trả phí',
  'Organic Shopping': 'Mua sắm tự nhiên',
  'Paid Shopping': 'Mua sắm trả phí',
  'Cross-network': 'Đa mạng',
  Unassigned: 'Chưa phân loại',
};

const getTrafficChannelLabel = (channel: string) => trafficChannelLabel[channel] || channel;

const eventNameLabel: Record<string, string> = {
  scroll: 'Cuộn trang',
  user_engagement: 'Tương tác người dùng',
  page_view: 'Xem trang',
  session_start: 'Bắt đầu phiên',
  first_visit: 'Lần truy cập đầu',
  form_start: 'Bắt đầu nhập biểu mẫu',
  form_submit: 'Gửi biểu mẫu',
  login: 'Đăng nhập',
  sign_up: 'Đăng ký',
  search: 'Tìm kiếm',
  survey_start: 'Bắt đầu khảo sát',
  survey_complete: 'Hoàn tất khảo sát',
  select_content: 'Chọn nội dung',
  click: 'Nhấp chuột',
};

const getEventNameLabel = (name: string) => eventNameLabel[name] || name;

const StatCard = ({ label, value, icon: Icon, accent, sub }: { label: string; value: number | string; icon: any; accent: string; sub?: string }) => (
  <div className="h-full min-h-[124px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
    <div className="flex h-full items-start justify-between gap-3">
      <div className="flex min-w-0 h-full flex-col">
        <p className="min-h-8 text-xs font-bold uppercase tracking-wider leading-4 text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 whitespace-nowrap text-3xl font-black leading-none text-slate-900 dark:text-white">{value}</p>
        {sub && <p className="mt-auto pt-3 text-xs leading-4 text-slate-500 dark:text-slate-400">{sub}</p>}
      </div>
      <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon size={18} />
      </div>
    </div>
  </div>
);

const LineChart = ({ title, data, color, periodLabel }: { title: string; data: TrendPoint[]; color: string; periodLabel: string }) => {
  const max = Math.max(1, ...data.map((item) => item.value));
  const width = 640;
  const height = 220;
  const padding = 32;
  const chartBottom = height - padding - 30;
  const chartHeight = chartBottom - padding;
  const labelEvery = data.length <= 10 ? 1 : data.length <= 31 ? 3 : data.length <= 120 ? 14 : 30;
  const step = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
  const points = data.map((item, index) => {
    const x = padding + index * step;
    const y = padding + (1 - item.value / max) * chartHeight;
    return { ...item, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp size={15} className={color} /> {title}
        </h3>
        <span className="text-xs text-slate-400">{periodLabel}</span>
      </div>
      <div className="pb-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
          {[0, 0.5, 1].map((ratio) => (
            <line
              key={ratio}
              x1={padding}
              x2={width - padding}
              y1={padding + ratio * chartHeight}
              y2={padding + ratio * chartHeight}
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-700"
              strokeWidth="1"
            />
          ))}
          {points.map((point, index) => index % labelEvery === 0 || index === points.length - 1 ? (
            <line
              key={`${point.date}-tick`}
              x1={point.x}
              x2={point.x}
              y1={chartBottom + 6}
              y2={chartBottom + 12}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-700"
              strokeWidth="1"
            />
          ) : null)}
          <path d={path} fill="none" stroke="currentColor" className={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point, index) => {
            const showLabel = index % labelEvery === 0 || index === points.length - 1;
            const showPoint = point.value > 0 || showLabel || data.length <= 31;
            return (
            <g key={point.date}>
              {showPoint && <circle cx={point.x} cy={point.y} r={point.value > 0 ? 4 : 3} fill="currentColor" className={color} />}
              <title>{`${point.label}: ${point.value}`}</title>
              {point.value > 0 && (
                <text x={point.x} y={point.y - 9} textAnchor="middle" className="fill-slate-500 dark:fill-slate-400" fontSize="10" fontWeight="700">
                  {point.value}
                </text>
              )}
              {showLabel && (
                <text
                  x={point.x}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-slate-400"
                  fontSize="10"
                  fontWeight="600"
                >
                  {point.label}
                </text>
              )}
            </g>
          );
          })}
        </svg>
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

const CompactBars = ({ title, data, icon: Icon }: { title: string; data: DistributionPoint[]; icon: any }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const labelMap: Record<string, string> = {
    interested: 'Muốn tìm hiểu',
    unsure: 'Chưa chắc',
    not_interested: 'Chưa phù hợp',
    PAID: 'Đã thanh toán',
    PENDING: 'Đang chờ',
    FAILED: 'Thất bại',
    CANCELLED: 'Đã hủy',
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
        <Icon size={15} className="text-indigo-500" /> {title}
      </h3>
      <div className="space-y-3">
        {data.length === 0 || total === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">Chưa có dữ liệu</p>
        ) : data.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-600 dark:text-slate-300">{labelMap[item.label] || item.label}</span>
              <span className="text-slate-400">{item.value} · {percent(item.value, total)}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.max(4, percent(item.value, total))}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const QualityPanel = ({ stats }: { stats: StatsData }) => {
  const q = stats.quality;
  const totalConfidence = q.highConfidenceCount + q.mediumConfidenceCount + q.exploratoryConfidenceCount;
  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Gauge size={15} className="text-emerald-500" /> Chất lượng AI Recommendation
        </h3>
        <span className="text-xs text-slate-400">{q.recommendationFeedbackCount} đánh giá AI</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <MiniMetric label="Suitability TB" value={`${q.avgSuitability}%`} />
        <MiniMetric label="Confidence TB" value={`${q.avgConfidence}/100`} />
        <MiniMetric label="Accuracy user" value={q.avgRecommendationAccuracy ? `${q.avgRecommendationAccuracy}/5` : '--'} />
        <MiniMetric label="Interested" value={`${percent(q.interestedCount, q.recommendationFeedbackCount)}%`} />
      </div>
      <div className="space-y-3">
        {[
          ['Cao', q.highConfidenceCount, 'bg-emerald-500'],
          ['Trung bình', q.mediumConfidenceCount, 'bg-amber-500'],
          ['Tham khảo', q.exploratoryConfidenceCount, 'bg-slate-400'],
        ].map(([label, value, color]) => (
          <div key={label as string}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-600 dark:text-slate-300">{label}</span>
              <span className="text-slate-400">{value as number} kết quả</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.max(4, percent(value as number, totalConfidence))}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MiniMetric = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-3">
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{value}</p>
  </div>
);

const TrafficChannelsPanel = ({ data }: { data: NonNullable<Ga4Data['trafficChannels']> }) => {
  const maxSessions = Math.max(1, ...data.map((item) => item.sessions));
  const organicSocial = data.find((item) => item.channel === 'Organic Social');

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp size={15} className="text-indigo-500" /> Kênh truy cập
        </h3>
        <span className="text-xs text-slate-400">
          Social tự nhiên: <span className="font-bold text-slate-700 dark:text-slate-200">{organicSocial?.sessions || 0}</span> phiên
        </span>
      </div>
      <div className="hidden md:grid grid-cols-[1fr_90px_100px_90px] gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-700/50 text-xs font-bold uppercase tracking-wider text-slate-500">
        <span>Kênh</span>
        <span>Phiên</span>
        <span>Người dùng</span>
        <span>Lượt xem</span>
      </div>
      <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">Chưa có dữ liệu kênh truy cập</p>
        ) : data.map((item) => (
          <div key={item.channel} className="grid grid-cols-1 md:grid-cols-[1fr_90px_100px_90px] gap-2 md:gap-4 px-5 py-3 items-center">
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{getTrafficChannelLabel(item.channel)}</p>
                <span className="md:hidden text-xs font-bold text-slate-500">{item.sessions} phiên</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={item.channel === 'Organic Social' ? 'h-full bg-indigo-500 rounded-full' : 'h-full bg-slate-300 dark:bg-slate-500 rounded-full'}
                  style={{ width: `${Math.max(4, (item.sessions / maxSessions) * 100)}%` }}
                />
              </div>
            </div>
            <p className="hidden md:block text-sm font-bold text-indigo-600">{item.sessions}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{item.activeUsers}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{item.pageViews}</p>
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

const Ga4Panel = ({ ga4, periodLabel }: { ga4?: Ga4Data; periodLabel: string }) => {
  if (!ga4) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">GA4 chưa có trong response</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Backend hiện tại chưa trả dữ liệu GA4. Hãy restart/deploy backend mới và kiểm tra VITE_API_URL đang trỏ đúng backend đó.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!ga4.configured || ga4.error) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">GA4 chưa sẵn sàng</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {ga4.error || 'Backend cần GA4_PROPERTY_ID và service account có quyền Viewer trên GA4 property.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const summary = ga4.summary;
  const pageViewTrend = ga4.trends.map((item) => ({
    date: item.date,
    label: item.label,
    value: item.pageViews,
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={18} className="text-indigo-500" /> Google Analytics 4
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Property {ga4.propertyId} · {periodLabel}</p>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {ga4.realtime.activeUsers} đang online
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <StatCard label="Lượt xem realtime" value={ga4.realtime.pageViews || 0} icon={Activity} accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" sub={`${ga4.realtime.events || 0} sự kiện / 30 phút`} />
        <StatCard label="Người dùng hoạt động" value={summary?.activeUsers || 0} icon={Users} accent="bg-sky-50 text-sky-600 dark:bg-sky-950/30" sub="Người dùng GA4" />
        <StatCard label="Người dùng mới" value={summary?.newUsers || 0} icon={Star} accent="bg-amber-50 text-amber-600 dark:bg-amber-950/30" sub="Người dùng mới" />
        <StatCard label="Phiên truy cập" value={summary?.sessions || 0} icon={Activity} accent="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30" sub="Phiên truy cập" />
        <StatCard label="Lượt xem trang" value={summary?.pageViews || 0} icon={FileText} accent="bg-teal-50 text-teal-600 dark:bg-teal-950/30" sub="Lượt xem trang" />
        <StatCard label="Sự kiện" value={summary?.events || 0} icon={Gauge} accent="bg-violet-50 text-violet-600 dark:bg-violet-950/30" sub="Tổng sự kiện" />
        <StatCard label="Tương tác" value={`${summary?.engagementRate || 0}%`} icon={TrendingUp} accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" sub="Tỷ lệ tương tác" />
        <StatCard label="Thời lượng phiên" value={duration(summary?.averageSessionDuration || 0)} icon={RefreshCw} accent="bg-rose-50 text-rose-600 dark:bg-rose-950/30" sub="Thời lượng TB" />
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Activity size={15} className="text-emerald-500" /> Trang realtime
          </h3>
        </div>
        <div className="hidden md:grid grid-cols-[1fr_140px_120px] gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-700/50 text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>Trang / màn hình</span>
          <span>Người xem</span>
          <span>Lượt xem</span>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
          {(ga4.realtime.pages || []).length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Chưa có page realtime</p>
          ) : ga4.realtime.pages?.map((page, index) => {
            const pageTitle = getAnalyticsPageTitle(page.path, page.title);
            return (
              <div key={`${page.path || page.title || 'realtime-page'}-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_140px_120px] gap-2 md:gap-4 px-5 py-3 items-center">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{pageTitle}</p>
                  {page.path && <p className="text-xs text-slate-400 truncate">{page.path}</p>}
                </div>
                <p className="text-sm text-emerald-600 font-bold">{page.activeUsers}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{page.pageViews}</p>
              </div>
            );
          })}
        </div>
      </div>

      <TrafficChannelsPanel data={ga4.trafficChannels || []} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <LineChart title="GA4 page views" data={pageViewTrend} color="text-indigo-500" periodLabel={periodLabel} />

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FileText size={15} className="text-teal-500" /> Trang xem nhiều
            </h3>
          </div>
          <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/50">
            {ga4.topPages.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Chưa có dữ liệu GA4</p>
            ) : ga4.topPages.map((page) => {
              const pageTitle = getAnalyticsPageTitle(page.path, page.title);
              return (
                <div key={`${page.path}-${page.title}`} className="grid grid-cols-[1fr_auto] gap-3 px-5 py-3 items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{pageTitle}</p>
                    <p className="text-xs text-slate-400 truncate">{page.path}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{page.pageViews}</p>
                    <p className="text-[11px] text-slate-400">{page.activeUsers} người xem</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Gauge size={15} className="text-violet-500" /> Sự kiện GA4
          </h3>
        </div>
        <div className="hidden md:grid grid-cols-[1fr_120px_120px] gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-700/50 text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>Sự kiện</span>
          <span>Số lần</span>
          <span>Người dùng</span>
        </div>
        <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/50">
          {ga4.topEvents.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Chưa có event GA4</p>
          ) : ga4.topEvents.map((event) => (
            <div key={event.name} className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px] gap-2 md:gap-4 px-5 py-3 items-center">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{getEventNameLabel(event.name)}</p>
                <p className="text-xs text-slate-400 truncate">{event.name}</p>
              </div>
              <p className="text-sm font-bold text-indigo-600">{event.count}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{event.activeUsers}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Analytics = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [period, setPeriod] = useState<AnalyticsPeriod>('month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await adminService.getSystemAnalytics(period);
      if (res.success && res.data) setStats(res.data as StatsData);
    } catch {
      setError('Không thể tải dữ liệu thống kê.');
    } finally {
      if (isRefresh) setRefreshing(false); else setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [period]);

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
    recommendationFeedbacks: 0, payments: 0, chats: 0, interactions: 0,
  };
  const systemChecks = [
    { label: 'Có dữ liệu ngành nghề', ok: s.careers > 0, hint: `${s.careers} ngành` },
    { label: 'Có dữ liệu trường đại học', ok: s.universities > 0, hint: `${s.universities} trường` },
    { label: 'Có phản hồi người dùng', ok: s.feedbacks > 0, hint: `${s.feedbacks} phản hồi` },
    { label: 'Có bài trắc nghiệm hoàn tất', ok: s.surveys > 0, hint: `${s.surveys} bài` },
    { label: 'Có feedback AI recommendation', ok: s.recommendationFeedbacks > 0, hint: `${s.recommendationFeedbacks} đánh giá` },
    { label: 'Có dữ liệu thanh toán', ok: s.payments > 0, hint: `${s.payments} giao dịch` },
    { label: 'Có dữ liệu AI chat', ok: s.chats > 0, hint: `${s.chats} hội thoại` },
  ];
  const periodLabel = stats?.period?.label || PERIOD_OPTIONS.find((item) => item.key === period)?.description || '30 ngày';

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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 shadow-sm">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setPeriod(option.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  period === option.key
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title={option.description}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>
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

      <Ga4Panel ga4={stats?.ga4} periodLabel={periodLabel} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Doanh thu"
          value={money(stats?.monetization.totalRevenue || 0)}
          icon={DollarSign}
          accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
          sub={`${stats?.monetization.paidCount || 0} giao dịch PAID`}
        />
        <StatCard
          label="AI Chat"
          value={stats?.aiUsage.chats || 0}
          icon={Bot}
          accent="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30"
          sub={`${stats?.aiUsage.totalMessages || 0} tin nhắn`}
        />
        <StatCard
          label="Confidence AI"
          value={`${stats?.quality.avgConfidence || 0}/100`}
          icon={Gauge}
          accent="bg-teal-50 text-teal-600 dark:bg-teal-950/30"
          sub={`${stats?.quality.highConfidenceCount || 0} kết quả confidence cao`}
        />
        <StatCard
          label="Accuracy phản hồi"
          value={stats?.quality.avgRecommendationAccuracy ? `${stats.quality.avgRecommendationAccuracy}/5` : '--'}
          icon={ThumbsUp}
          accent="bg-amber-50 text-amber-600 dark:bg-amber-950/30"
          sub={`${s.recommendationFeedbacks} đánh giá AI`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <LineChart title="User mới" data={stats?.trends.users || []} color="text-sky-500" periodLabel={periodLabel} />
        <LineChart title="Bài trắc nghiệm" data={stats?.trends.surveys || []} color="text-teal-500" periodLabel={periodLabel} />
        <LineChart title="Phản hồi" data={stats?.trends.feedbacks || []} color="text-rose-500" periodLabel={periodLabel} />
        <LineChart title="AI chat" data={stats?.trends.chats || []} color="text-indigo-500" periodLabel={periodLabel} />
        <LineChart title="Đánh giá AI" data={stats?.trends.recommendationFeedbacks || []} color="text-amber-500" periodLabel={periodLabel} />
        <LineChart title="Doanh thu" data={stats?.trends.revenue || []} color="text-emerald-500" periodLabel={periodLabel} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {stats && <QualityPanel stats={stats} />}
        <CompactBars title="Phản hồi ngành top" data={stats?.distributions.recommendationFit || []} icon={ThumbsUp} />
        <CompactBars title="Trạng thái thanh toán" data={stats?.distributions.paymentStatuses || []} icon={CreditCard} />
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

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Gauge size={15} className="text-amber-500" /> Hiệu quả recommendation theo feedback người dùng
          </h3>
          <span className="text-xs text-slate-400">Khách quan từ đánh giá sau khảo sát</span>
        </div>
        <div className="hidden md:grid grid-cols-[1.4fr_100px_120px_120px_120px] gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-700/50 text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>Ngành top</span>
          <span>Số đánh giá</span>
          <span>Accuracy TB</span>
          <span>Interested</span>
          <span>Not interested</span>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
          {(stats?.recommendationFeedbackByCareer || []).length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Chưa có feedback recommendation</p>
          ) : stats?.recommendationFeedbackByCareer.map((item) => (
            <div key={item.title} className="grid grid-cols-1 md:grid-cols-[1.4fr_100px_120px_120px_120px] gap-2 md:gap-4 px-5 py-3 items-center">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.title}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{item.count}</p>
              <p className="text-sm font-bold text-amber-600">{item.avgAccuracy}/5</p>
              <p className="text-sm text-emerald-600 flex items-center gap-1"><ThumbsUp size={13} /> {item.interestedCount}</p>
              <p className="text-sm text-red-500 flex items-center gap-1"><ThumbsDown size={13} /> {item.notInterestedCount}</p>
            </div>
          ))}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RecentList title="Feedback AI gần đây" icon={Gauge} items={stats?.recentRecommendationFeedbacks || []} render={(fb: any) => ({
          key: fb._id,
          title: fb.userId?.name || 'Ẩn danh',
          subtitle: `${fb.topCareerTitle || 'Không rõ ngành'} · ${fb.comment || 'Không có bình luận'}`,
          meta: `${fb.perceivedAccuracy || 0}/5`,
          badge: fb.topCareerFit || 'unsure',
        })} />
        <RecentList title="Thanh toán gần đây" icon={CreditCard} items={stats?.recentPayments || []} render={(payment: any) => ({
          key: payment._id,
          title: payment.user_id?.name || 'Không rõ user',
          subtitle: `${payment.plan_id?.name || payment.description || 'Gói dịch vụ'} · ${money(payment.amount || 0)}`,
          meta: fmt(payment.created_at),
          badge: payment.status,
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
