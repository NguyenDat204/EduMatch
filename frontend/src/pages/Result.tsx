import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Loader2, RotateCcw, Lightbulb } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { CareerCard } from '../components/ui';
import { aiApiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface IndustryResult {
  archetype: string;
  description: string;
  suitabilityScore: number;
  careers: any[];
  insights: string;
}

export const Result = () => {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult]   = useState<IndustryResult | null>(null);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const surveyData = location.state;
        if (!surveyData) {
          setError('Không tìm thấy dữ liệu khảo sát. Vui lòng hoàn thành bài trắc nghiệm trước.');
          setLoading(false);
          return;
        }
        const data = await aiApiService.getRecommendations(surveyData);
        setResult(data);
      } catch (err) {
        setError('Phân tích AI thất bại. Vui lòng kiểm tra kết nối và thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [location.state]);

  if (loading || authLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">AI đang phân tích hồ sơ của bạn...</h2>
            <p className="text-sm text-slate-500">Đang đối chiếu với hàng triệu điểm dữ liệu nghề nghiệp.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-7 rounded-2xl mb-6">
            <h2 className="text-lg font-bold mb-3">Phân tích bị gián đoạn</h2>
            <p className="text-sm mb-5">{error}</p>
            <button
              onClick={() => navigate('/survey')}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!result) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10 animate-fade-in">
        {/* Result Hero */}
        <section className="bg-navy-900 text-white rounded-2xl p-7 md:p-9 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/15 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-600/20 border border-primary-500/30 text-primary-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
                <Sparkles size={12} />
                Phân tích hoàn tất
              </div>
              <h1 className="text-2xl md:text-3xl font-black mb-3 leading-tight">
                Hình mẫu nghề nghiệp của bạn là{' '}
                <span className="text-primary-300">{result.archetype}</span>
              </h1>
              <p className="text-slate-300 text-sm md:text-base mb-6 leading-relaxed">
                {result.description}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/chat')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Tư vấn với AI Advisor
                  <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => navigate('/survey')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  <RotateCcw size={14} />
                  Làm lại
                </button>
              </div>
            </div>

            {/* Score circle */}
            <div className="shrink-0">
              <div className="w-32 h-32 rounded-full border-4 border-primary-500/40 bg-primary-600/10 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-black text-primary-300">{result.suitabilityScore}%</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Phù hợp</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Career Cards */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nghề nghiệp phù hợp nhất</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.careers.map((career, idx) => (
                <CareerCard key={idx} career={{ ...career, id: String(idx) }} />
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* AI Insights */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-5 shadow-card">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Lightbulb size={16} className="text-amber-500" />
                Nhận xét từ AI
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                "{result.insights}"
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-5 shadow-card">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Bước tiếp theo</h3>
              <ul className="space-y-2.5">
                {[
                  'Xem chi tiết các trường đại học phù hợp',
                  'Cập nhật hồ sơ học tập của bạn',
                  'Trò chuyện với AI Advisor để tư vấn sâu hơn',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-5 h-5 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-primary-600">{i + 1}</span>
                    </div>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* Upgrade CTA */}
            <div className="bg-navy-900 text-white rounded-xl p-5 border border-navy-700">
              <h3 className="text-sm font-bold mb-2">Muốn phân tích sâu hơn?</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Nâng cấp Pro để nhận phân tích kỹ năng chi tiết và tư vấn AI không giới hạn.
              </p>
              <button
                onClick={() => navigate('/upgrade')}
                className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                Nâng cấp Pro
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
