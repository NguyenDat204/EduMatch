import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Target,
  ArrowRight,
  Sparkles,
  Zap,
  Compass,
  Star,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { CareerCard } from '../components/ui/CareerCard';
import { useAuth } from '../hooks/useAuth';
import { useAIStatus } from '../hooks/useAIStatus';
import { careerService } from '../services/api';
import { feedbackService } from '../services/api';

export const Dashboard = () => {
  const { user, isLoading, updateUserInState } = useAuth();
  const { isAIRunning } = useAIStatus();
  const navigate = useNavigate();

  // Redirect admin to their portal
  useEffect(() => {
    if (!isLoading && user && user.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const [rating, setRating]                         = useState(5);
  const [message, setMessage]                       = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess]       = useState(false);
  const [feedbackError, setFeedbackError]           = useState<string | null>(null);
  // ✅ Moved above all early returns — hooks must always be called unconditionally
  const [recommendedCareers, setRecommendedCareers] = useState<any[]>([]);

  const testResults    = user?.personalityTest || {};
  const hasTakenSurvey = !!testResults.archetype;

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;
    setSubmittingFeedback(true);
    setFeedbackError(null);
    try {
      const res = await feedbackService.submitFeedback(user.name, user.email, message, rating);
      if (res.success) {
        setFeedbackSuccess(true);
        setMessage('');
        setRating(5);
      }
    } catch (err: any) {
      setFeedbackError(err.response?.data?.message || 'Gửi phản hồi thất bại.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) navigate('/login');
  }, [user, isLoading, navigate]);

  // ✅ Moved above early returns — always runs, guards internally
  useEffect(() => {
    if (!user) return;
    const loadFallbackCareers = async () => {
      // Lấy roadmap từ localStorage cache (được lưu bởi trang Result)
      const uid = user._id || user.email || 'anon';
      let cachedCareers: any[] = [];
      try {
        const cachedRaw = localStorage.getItem(`edumatch_result_cache_${uid}`);
        if (cachedRaw) cachedCareers = JSON.parse(cachedRaw).careers || [];
      } catch { /* ignore */ }

      const mergeRoadmap = (career: any) => {
        const match = cachedCareers.find(
          (c: any) => c.title?.toLowerCase() === career.title?.toLowerCase()
        );
        return { ...career, roadmap: match?.roadmap || career.roadmap || [] };
      };

      if (hasTakenSurvey && testResults.careers && testResults.careers.length > 0) {
        setRecommendedCareers(testResults.careers.slice(0, 2).map(mergeRoadmap));
        return;
      }
      try {
        const res = await careerService.getCareers();
        if (res.success && res.data) setRecommendedCareers(res.data.slice(0, 2).map(mergeRoadmap));
      } catch (err) {
        console.warn('Failed to load careers for dashboard:', err);
        setRecommendedCareers([]);
      }
    };
    loadFallbackCareers();
  }, [user, hasTakenSurvey, testResults]);

  // Cross-tab sync: khi AI result được lưu vào localStorage từ tab /result,
  // cập nhật user context ngay lập tức — không cần reload trang
  useEffect(() => {
    if (!user) return;
    const uid = user._id || user.email || 'anon';
    const resultKey = `edumatch_result_cache_${uid}`;

    const onStorage = (e: StorageEvent) => {
      if (e.key === resultKey && e.newValue) {
        try {
          const fresh = JSON.parse(e.newValue);
          if (fresh?.archetype) {
            updateUserInState({
              ...user,
              personalityTest: {
                archetype: fresh.archetype || '',
                description: fresh.description || '',
                suitabilityScore: fresh.suitabilityScore || 0,
                insights: fresh.insights || '',
                careers: fresh.careers || [],
                updatedAt: new Date(),
              },
            });
          }
        } catch { /* ignore */ }
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user, updateUserInState]);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  // Skill radar data
  const skillScores = user.skillEvaluation?.scores || {
    technical: 60, creative: 50, communication: 70, analytical: 80, leadership: 55,
  };
  const center    = 120;
  const maxRadius = 80;
  const skillKeys   = ['technical', 'creative', 'communication', 'analytical', 'leadership'];
  const skillLabels = ['Kỹ thuật', 'Sáng tạo', 'Giao tiếp', 'Phân tích', 'Lãnh đạo'];

  const getPoints = () =>
    skillKeys.map((key, i) => {
      const score = (skillScores as any)[key] ?? 50;
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const r     = (score / 100) * maxRadius;
      return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle), label: skillLabels[i], value: score };
    });

  const getGrid = () =>
    [0.25, 0.5, 0.75, 1.0].map((scale) =>
      skillKeys
        .map((_, i) => {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const r     = scale * maxRadius;
          return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
        })
        .join(' ')
    );

  const points      = getPoints();
  const polygonPath = points.map((p) => `${p.x},${p.y}`).join(' ');
  const gridLines   = getGrid();

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">

        {/* ── AI Running Banner — hiện khi AI đang xử lý (kể cả từ tab khác) ── */}
        {isAIRunning && (
          <div
            onClick={() => navigate('/result')}
            className="cursor-pointer flex items-center gap-3 px-4 py-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/50 rounded-xl animate-pulse"
          >
            <Loader2 size={16} className="text-primary-600 animate-spin shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                AI đang phân tích hồ sơ của bạn...
              </p>
              <p className="text-xs text-primary-500 dark:text-primary-400 truncate">
                Bạn có thể dùng các trang khác. Kết quả sẽ tự cập nhật khi xong.
              </p>
            </div>
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 shrink-0">
              Xem kết quả →
            </span>
          </div>
        )}

        {/* ── Welcome Banner ── */}
        <section className="relative overflow-hidden rounded-2xl bg-navy-900 text-white p-7 md:p-9">
          {/* Subtle dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
              <Sparkles size={12} />
              EduMatch AI
            </div>

            {hasTakenSurvey ? (
              <>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Chào {user.name}, bạn là:
                </h2>
                <h3 className="text-xl md:text-2xl font-black text-primary-300 mb-3 uppercase tracking-wide">
                  {testResults.archetype} 🌟
                </h3>
                <p className="text-slate-300 text-sm md:text-base mb-6 leading-relaxed max-w-lg">
                  "{testResults.description}"
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/chat')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition-colors text-sm"
                  >
                    Trò chuyện với AI Advisor
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => navigate('/survey')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-lg transition-colors text-sm"
                  >
                    Làm lại trắc nghiệm
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Chào mừng, {user.name}! 👋</h2>
                <p className="text-slate-300 text-sm md:text-base mb-6 leading-relaxed max-w-lg">
                  Hoàn thành bài trắc nghiệm tính cách hướng nghiệp để kích hoạt bản đồ nghề nghiệp AI cá nhân hóa.
                </p>
                <button
                  onClick={() => navigate('/survey')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Làm trắc nghiệm ngay
                  <ArrowRight size={16} />
                </button>
              </>
            )}
          </div>
        </section>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <Trophy size={20} className="text-amber-500" />,
              bg: 'bg-amber-50 dark:bg-amber-900/20',
              value: hasTakenSurvey ? `${testResults.suitabilityScore}%` : '—',
              label: 'Độ phù hợp nghề',
            },
            {
              icon: <Target size={20} className="text-primary-600" />,
              bg: 'bg-primary-50 dark:bg-primary-900/20',
              value: user.favorites?.length || 0,
              label: 'Nghề đã lưu',
            },
            {
              icon: <Zap size={20} className="text-accent-500" />,
              bg: 'bg-accent-50 dark:bg-accent-900/20',
              value: hasTakenSurvey ? 'Cấp 4' : 'Cấp 2',
              label: 'Hoàn thiện hồ sơ',
            },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-5 flex items-center gap-4 shadow-card">
              <div className={`w-11 h-11 ${stat.bg} rounded-lg flex items-center justify-center shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Career Recommendations */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Compass size={18} className="text-primary-600" />
                Gợi ý nghề nghiệp
              </h3>
              <Link to="/explore" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                Xem thêm →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedCareers.slice(0, 2).map((career: any, index: number) => (
                <CareerCard
                  key={career._id || career.id || index}
                  career={{
                    id:          career._id || career.id || `title:${encodeURIComponent(career.title || '')}`,
                    title:       career.title,
                    description: career.description,
                    salary:      career.salary || '$100k - $120k',
                    growth:      career.growth || 'Ổn định (+10%)',
                    skills:      career.skills || [],
                    suitability: career.suitability || 85,
                    category:    career.category || 'Công nghệ',
                    roadmap:     Array.isArray(career.roadmap) ? career.roadmap : [],
                  }}
                />
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => navigate('/academic-profile')}
                className="flex items-center gap-3 p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl hover:border-primary-300 dark:hover:border-primary-700 transition-colors text-left group shadow-card"
              >
                <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen size={16} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Hồ sơ học tập</p>
                  <p className="text-xs text-slate-500">Cập nhật điểm số</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/skill-evaluation')}
                className="flex items-center gap-3 p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl hover:border-primary-300 dark:hover:border-primary-700 transition-colors text-left group shadow-card"
              >
                <div className="w-9 h-9 bg-accent-50 dark:bg-accent-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <Target size={16} className="text-accent-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Đánh giá kỹ năng</p>
                  <p className="text-xs text-slate-500">Tự đánh giá năng lực</p>
                </div>
              </button>
            </div>
          </div>

          {/* Skill Radar */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Star size={18} className="text-amber-500" />
              Sơ đồ kỹ năng
            </h3>
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-5 shadow-card flex flex-col items-center">
              <svg width="240" height="240" className="w-full h-auto overflow-visible">
                {/* Grid */}
                {gridLines.map((path, i) => (
                  <polygon key={i} points={path} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="1" />
                ))}
                {/* Axes */}
                {skillKeys.map((_, i) => {
                  const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                  return (
                    <line
                      key={i}
                      x1={center} y1={center}
                      x2={center + maxRadius * Math.cos(angle)}
                      y2={center + maxRadius * Math.sin(angle)}
                      stroke="rgba(148,163,184,0.2)"
                      strokeWidth="1"
                    />
                  );
                })}
                {/* Score polygon */}
                <defs>
                  <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(37,99,235,0.25)" />
                    <stop offset="100%" stopColor="rgba(37,99,235,0.08)" />
                  </linearGradient>
                </defs>
                <polygon
                  points={polygonPath}
                  fill="url(#radarFill)"
                  stroke="rgba(37,99,235,0.7)"
                  strokeWidth="2"
                />
                {/* Data points */}
                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#2563eb" stroke="white" strokeWidth="1.5" />
                ))}
                {/* Labels */}
                {points.map((p, i) => {
                  const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                  const lx    = center + (maxRadius + 18) * Math.cos(angle);
                  const ly    = center + (maxRadius + 18) * Math.sin(angle);
                  return (
                    <text
                      key={i}
                      x={lx} y={ly}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-500 dark:fill-slate-400"
                      fontSize="9"
                      fontWeight="600"
                    >
                      {p.label}
                    </text>
                  );
                })}
              </svg>
              <button
                onClick={() => navigate('/skill-evaluation')}
                className="mt-3 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Cập nhật kỹ năng →
              </button>
            </div>
          </div>
        </div>

        {/* ── Feedback ── */}
        <section className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-6 shadow-card">
          <h3 className="text-base font-bold flex items-center gap-2 mb-1 text-slate-900 dark:text-white">
            <MessageSquare size={17} className="text-primary-600" />
            Đóng góp ý kiến
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            Chia sẻ cảm nhận để giúp chúng tôi cải thiện hệ thống.
          </p>

          {feedbackSuccess ? (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-3 border border-green-100 dark:border-green-900/30 text-sm">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>Cảm ơn bạn đã gửi phản hồi!</span>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              {feedbackError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg flex items-start gap-2 text-xs border border-red-100 dark:border-red-900/30">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{feedbackError}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 mr-1">Đánh giá:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={20}
                      fill={star <= rating ? 'currentColor' : 'none'}
                      className={star <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}
                    />
                  </button>
                ))}
              </div>

              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập ý kiến đóng góp của bạn..."
                className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
              />

              <button
                type="submit"
                disabled={submittingFeedback}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {submittingFeedback ? 'Đang gửi...' : 'Gửi phản hồi'}
              </button>
            </form>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};
