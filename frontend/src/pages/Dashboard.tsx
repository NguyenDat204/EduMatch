import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Target, 
  ArrowRight, 
  Sparkles,
  Zap,
  CheckCircle2,
  Compass,
  Star,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { CareerCard } from '../components/ui/CareerCard';
import { useAuth } from '../hooks/useAuth';
import { mockCareers } from '../mock/data';
import { feedbackService } from '../services/api';

export const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

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
      setFeedbackError(err.response?.data?.message || "Gửi phản hồi thất bại.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 premium-gradient rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  // Read personality results or fallback
  const testResults = user.personalityTest || {};
  const hasTakenSurvey = !!testResults.archetype;
  
  // Dynamic careers list
  const recommendedCareers = hasTakenSurvey && testResults.careers && testResults.careers.length > 0
    ? testResults.careers
    : mockCareers.slice(0, 2);

  // Skill Scores for Radar
  const skillScores = user.skillEvaluation?.scores || {
    technical: 60,
    creative: 50,
    communication: 70,
    analytical: 80,
    leadership: 55
  };

  // SVG Radar Coordinates Calculation
  // Center is (150, 150), Max radius is 100.
  const center = 150;
  const maxRadius = 100;
  const skillKeys = ['technical', 'creative', 'communication', 'analytical', 'leadership'];
  const skillLabels = ['Công nghệ', 'Sáng tạo', 'Giao tiếp', 'Logic/Phân tích', 'Lãnh đạo'];

  const getCoordinates = () => {
    return skillKeys.map((key, i) => {
      const score = (skillScores as any)[key] ?? 50;
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2; // Subtract Math.PI/2 to start from top
      const r = (score / 100) * maxRadius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y, label: skillLabels[i], value: score };
    });
  };

  const points = getCoordinates();
  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  // Get background grid lines (5 concentrics pentagons for 20%, 40%, 60%, 80%, 100%)
  const getGridPentagons = () => {
    return [0.2, 0.4, 0.6, 0.8, 1.0].map(scale => {
      const r = scale * maxRadius;
      return skillKeys.map((_, i) => {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ');
    });
  };

  const gridPentagons = getGridPentagons();

  return (
    <DashboardLayout>
      <div className="space-y-10 animate-fade-in">
        {/* Welcome / Call-To-Action Banner */}
        <section className="relative overflow-hidden premium-gradient rounded-[2.5rem] p-10 md:p-12 text-white shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={14} />
              EduMatch AI Workspace
            </div>
            
            {hasTakenSurvey ? (
              <>
                <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Chào {user.name}, bạn là:</h2>
                <h3 className="text-2xl md:text-3xl font-black text-amber-300 mb-4 tracking-wide uppercase drop-shadow-sm">
                  {testResults.archetype} 🌟
                </h3>
                <p className="text-primary-100 text-base md:text-lg mb-8 leading-relaxed">
                  "{testResults.description}"
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => navigate('/chat')}
                    className="px-8 py-4 bg-white text-primary-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-50 transition-all shadow-xl shadow-black/10 active:scale-95 text-sm"
                  >
                    Trò chuyện với AI Advisor
                    <ArrowRight size={18} />
                  </button>
                  <button 
                    onClick={() => navigate('/survey')}
                    className="px-6 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/20 transition-all text-sm"
                  >
                    Làm lại trắc nghiệm
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Chào mừng, {user.name}! 👋</h2>
                <p className="text-primary-100 text-lg mb-8 leading-relaxed">
                  Hãy hoàn thành bài kiểm tra trắc nghiệm tính cách hướng nghiệp 10 câu hỏi để kích hoạt bản đồ nghề nghiệp AI cá nhân hóa!
                </p>
                <button 
                  onClick={() => navigate('/survey')}
                  className="px-8 py-4 bg-white text-primary-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-50 transition-all shadow-xl shadow-black/10 active:scale-95"
                >
                  Làm trắc nghiệm AI ngay
                  <ArrowRight size={18} />
                </button>
              </>
            )}
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-10 w-48 h-48 bg-secondary-400/20 rounded-full translate-y-1/2 blur-2xl" />
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-8 rounded-3xl flex items-center gap-6 group hover:border-primary-500/30 transition-all border-none shadow-premium bg-white dark:bg-slate-900">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Trophy size={28} />
            </div>
            <div>
              <div className="text-2xl font-black">{hasTakenSurvey ? `${testResults.suitabilityScore}%` : 'Chưa có'}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Độ phù hợp nghề</div>
            </div>
          </div>
          
          <div className="glass p-8 rounded-3xl flex items-center gap-6 group hover:border-primary-500/30 transition-all border-none shadow-premium bg-white dark:bg-slate-900">
            <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 text-primary-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Target size={28} />
            </div>
            <div>
              <div className="text-2xl font-black">{user.favorites?.length || 0}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Nghề đã lưu</div>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl flex items-center gap-6 group hover:border-primary-500/30 transition-all border-none shadow-premium bg-white dark:bg-slate-900">
            <div className="w-14 h-14 bg-accent-50 dark:bg-accent-900/20 text-accent-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Zap size={28} />
            </div>
            <div>
              <div className="text-2xl font-black">{hasTakenSurvey ? 'Cấp độ 4' : 'Cấp độ 2'}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Độ hoàn thiện hồ sơ</div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Recommended Careers */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Compass size={22} className="text-primary-500" />
                Gợi ý nghề nghiệp hàng đầu
              </h3>
              <Link to="/explore" className="text-sm font-bold text-primary-600 hover:underline">Khám phá thêm</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendedCareers.slice(0, 2).map((career: any, index: number) => (
                <CareerCard 
                  key={career._id || career.id || index} 
                  career={{
                    id: career._id || career.id || `career-${index}`,
                    title: career.title,
                    description: career.description,
                    salary: career.salary || '$100k - $120k',
                    growth: career.growth || 'Steady (+10%)',
                    skills: career.skills || [],
                    suitability: career.suitability || 85,
                    category: career.category || 'Công nghệ',
                  }} 
                />
              ))}
            </div>
          </div>

          {/* SVG Skills Radar Chart Column */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Star size={22} className="text-amber-500" />
              Sơ đồ kỹ năng
            </h3>
            
            <div className="glass rounded-[2rem] p-6 border-none shadow-premium bg-white dark:bg-slate-900 flex flex-col items-center">
              {/* Custom SVG Radar Chart */}
              <svg width="300" height="300" className="w-full h-auto overflow-visible">
                {/* Background Concentric pentagons */}
                {gridPentagons.map((path, i) => (
                  <polygon
                    key={`grid-${i}`}
                    points={path}
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.15)"
                    strokeWidth="1"
                  />
                ))}

                {/* Concentric grid lines from center to corners */}
                {skillKeys.map((_, i) => {
                  const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                  const x = center + maxRadius * Math.cos(angle);
                  const y = center + maxRadius * Math.sin(angle);
                  return (
                    <line
                      key={`axis-${i}`}
                      x1={center}
                      y1={center}
                      x2={x}
                      y2={y}
                      stroke="rgba(148, 163, 184, 0.15)"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Score Area Polygon with Premium Gradient */}
                <defs>
                  <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(99, 102, 241, 0.1)" />
                    <stop offset="100%" stopColor="rgba(99, 102, 241, 0.45)" />
                  </radialGradient>
                </defs>
                <polygon
                  points={polygonPath}
                  fill="url(#radarGrad)"
                  stroke="rgba(99, 102, 241, 0.85)"
                  strokeWidth="2.5"
                  className="transition-all duration-500"
                />

                {/* Active Data Points */}
                {points.map((p, i) => (
                  <circle
                    key={`point-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r="4.5"
                    className="fill-primary-600 stroke-white dark:stroke-slate-900 stroke-2 shadow-lg"
                  />
                ))}

                {/* Skill Labels */}
                {points.map((p, i) => {
                  const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                  // Push labels slightly outside the maximum radius
                  const offsetR = maxRadius + 22;
                  const lx = center + offsetR * Math.cos(angle);
                  const ly = center + offsetR * Math.sin(angle);

                  return (
                    <text
                      key={`label-${i}`}
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-600 dark:fill-slate-300 text-[10px] font-black uppercase tracking-wider"
                    >
                      {p.label} ({p.value})
                    </text>
                  );
                })}
              </svg>

              <div className="w-full text-center mt-4">
                <button 
                  onClick={() => navigate('/skill-evaluation')}
                  className="text-xs font-bold text-primary-600 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl hover:bg-primary-100 transition-colors w-full"
                >
                  Điều chỉnh Kỹ năng tự đánh giá
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Feedback Section */}
        <section className="glass rounded-[2.5rem] p-8 md:p-10 border-none shadow-premium bg-white dark:bg-slate-900 relative overflow-hidden">
          <div className="max-w-3xl">
            <h3 className="text-2xl font-bold flex items-center gap-2 mb-2">
              <MessageSquare size={22} className="text-primary-500" />
              Đóng góp ý kiến & Phản hồi
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              EduMatch luôn nỗ lực cải thiện trải nghiệm học tập và định hướng của bạn. Hãy chia sẻ cảm nhận hoặc góp ý của bạn để giúp chúng tôi hoàn thiện hơn!
            </p>

            {feedbackSuccess ? (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-4 border border-emerald-100 dark:border-emerald-950/30">
                <CheckCircle2 size={32} className="shrink-0 animate-bounce" />
                <div>
                  <h4 className="font-bold text-base mb-0.5">Gửi ý kiến thành công!</h4>
                  <p className="text-xs opacity-90">Cảm ơn bạn đã đóng góp phản hồi quý giá để xây dựng hệ thống.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                {feedbackError && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-2 text-xs font-semibold">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{feedbackError}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 mr-2">Đánh giá của bạn:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-amber-400 hover:scale-115 transition-transform"
                      >
                        <Star
                          size={24}
                          fill={star <= rating ? "currentColor" : "none"}
                          className={star <= rating ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Nhập ý kiến đóng góp hoặc trải nghiệm của bạn về hệ thống..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs hover:bg-primary-600 dark:hover:bg-primary-600 hover:text-white transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingFeedback ? "Đang gửi..." : "Gửi phản hồi"}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};
