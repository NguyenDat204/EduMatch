import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Loader2, RotateCcw, Lightbulb, History } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { CareerCard } from '../components/ui';
import { aiApiService, surveyHistoryService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useAIStatus } from '../hooks/useAIStatus';

interface IndustryResult {
  archetype: string;
  description: string;
  suitabilityScore: number;
  careers: any[];
  insights: string;
}

// Key lưu result vào localStorage theo user để giữ persist khi chuyển tab/thoát
const RESULT_STORAGE_KEY_BASE = 'edumatch_result_cache';
const RESULT_SAVED_FINGERPRINT = 'edumatch_result_saved_fp';

export const Result = () => {
  const { user, isLoading: authLoading, updateUserInState } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult]   = useState<IndustryResult | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [savedToHistory, setSavedToHistory] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);

  const fetchRef = useRef(false);
  const { setAIRunning } = useAIStatus();

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (fetchRef.current) return; // prevent double-fetch (StrictMode / remounts)
      fetchRef.current = true;

      // Build user-scoped storage key
      const uid = user?._id || user?.email || 'anon';
      const RESULT_STORAGE_KEY = `${RESULT_STORAGE_KEY_BASE}_${uid}`;

      // 1. Thử lấy từ localStorage trước (giữ persist khi đổi tab/thoát)
      const cached = typeof window !== 'undefined' ? localStorage.getItem(RESULT_STORAGE_KEY) : null;
      if (cached && !location.state) {
        try {
          const parsed = JSON.parse(cached);
          setResult(parsed);
          setLoading(false);
          setSavedToHistory(true); // đã lưu từ lần trước
          return;
        } catch { /* ignore */ }
      }

      // 2. Nếu có state mới từ Survey → gọi AI
      const surveyData = location.state;
      if (!surveyData) {
        // Không có state và không có cache → báo lỗi
        try {
          const uid = user?._id || user?.email || 'anon';
          const RESULT_STORAGE_KEY = `${RESULT_STORAGE_KEY_BASE}_${uid}`;
          const cached2 = typeof window !== 'undefined' ? localStorage.getItem(RESULT_STORAGE_KEY) : null;
          if (cached2) {
            try {
              setResult(JSON.parse(cached2));
              setSavedToHistory(true);
              setLoading(false);
              return;
            } catch { /* ignore */ }
          }
        } catch { /* ignore */ }
        setError('Không tìm thấy dữ liệu khảo sát. Vui lòng hoàn thành bài trắc nghiệm trước.');
        setLoading(false);
        return;
      }

      // Báo toàn hệ thống AI đang chạy (cross-tab)
      setAIRunning(true);
      try {
        const data = await aiApiService.getRecommendations(surveyData);
        setResult(data);
        // Lưu vào localStorage theo user để giữ persist khi đổi tab/thoát
        try {
          const uid = user?._id || user?.email || 'anon';
          const RESULT_STORAGE_KEY = `${RESULT_STORAGE_KEY_BASE}_${uid}`;
          localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(data));
        } catch { /* ignore */ }

        // Cập nhật auth context ngay lập tức để Dashboard / các trang khác
        // thấy kết quả mới mà không cần reload trang
        if (user && data) {
          updateUserInState({
            ...user,
            personalityTest: {
              archetype: data.archetype || '',
              description: data.description || '',
              suitabilityScore: data.suitabilityScore || 0,
              insights: data.insights || '',
              careers: data.careers || [],
              answers: surveyData.answers || surveyData,
              updatedAt: new Date(),
            },
          });
        }

        // Lưu vào DB (survey history) — but avoid duplicate saves using fingerprint
        try {
          const uid = user?._id || user?.email || 'anon';
          const fpPayload = { answers: surveyData.answers || surveyData, archetype: data?.archetype };
          const fingerprint = btoa(unescape(encodeURIComponent(JSON.stringify(fpPayload))));
          const existingFp = typeof window !== 'undefined' ? localStorage.getItem(`${RESULT_SAVED_FINGERPRINT}_${uid}`) : null;
          if (existingFp === fingerprint) {
            // already saved this exact result — skip
            setSavedToHistory(true);
            setSavedError(null);
          } else {
            await surveyHistoryService.save(surveyData.answers || surveyData, data);
            setSavedToHistory(true);
            setSavedError(null);
            try { localStorage.setItem(`${RESULT_SAVED_FINGERPRINT}_${uid}`, fingerprint); } catch { /* ignore */ }
          }
          // Xóa nháp (session/local) sau khi đã lưu vào DB, tránh khôi phục nháp cũ khi người dùng quay lại
          try {
            const getSessionKey = (userId: string) => `edumatch_survey_session_${userId}`;
            const getLocalKey = (userId: string) => `edumatch_survey_draft_${userId}`;
            const uid = user?._id || user?.email;
            if (uid) {
              try { sessionStorage.removeItem(getSessionKey(uid)); } catch { /* ignore */ }
              try { localStorage.removeItem(getLocalKey(uid)); } catch { /* ignore */ }
            }
          } catch { /* ignore */ }
        } catch (saveErr: any) {
          console.warn('Failed to save survey history', saveErr);
          setSavedToHistory(false);
          setSavedError('Lưu lịch sử trắc nghiệm thất bại. Kiểm tra kết nối và thử lại.');
        }
      } catch {
        setError('Phân tích AI thất bại. Vui lòng kiểm tra kết nối và thử lại.');
      } finally {
        setLoading(false);
        setAIRunning(false); // AI xong — tắt indicator trên mọi tab
      }
    };

    fetchRecommendations();
  }, [location.state]);

  const retrySave = async () => {
    if (!result) return;
    setSavedError(null);
    try {
      const surveyData = location.state || {};
      const uid = user?._id || user?.email || 'anon';
      const fpPayload = { answers: surveyData.answers || surveyData, archetype: result?.archetype };
      const fingerprint = btoa(unescape(encodeURIComponent(JSON.stringify(fpPayload))));
      const existingFp = typeof window !== 'undefined' ? localStorage.getItem(`${RESULT_SAVED_FINGERPRINT}_${uid}`) : null;
      if (existingFp === fingerprint) {
        setSavedToHistory(true);
      } else {
        await surveyHistoryService.save(surveyData.answers || surveyData, result);
        setSavedToHistory(true);
        try { localStorage.setItem(`${RESULT_SAVED_FINGERPRINT}_${uid}`, fingerprint); } catch { /* ignore */ }
      }
      // clear draft
      try {
        const getSessionKey = (userId: string) => `edumatch_survey_session_${userId}`;
        const getLocalKey = (userId: string) => `edumatch_survey_draft_${userId}`;
        const uid = user?._id || user?.email;
        if (uid) {
          try { sessionStorage.removeItem(getSessionKey(uid)); } catch { /* ignore */ }
          try { localStorage.removeItem(getLocalKey(uid)); } catch { /* ignore */ }
        }
      } catch { /* ignore */ }
    } catch (e) {
      console.warn('Retry save failed', e);
      setSavedError('Lưu lịch sử trắc nghiệm thất bại. Vui lòng thử lại.');
    }
  };

  if (loading || authLoading) {
    return (
      <DashboardLayout>
        {/* Skeleton — user vẫn thấy layout, có thể navigate tab khác thoải mái */}
        <div className="space-y-6 pb-10 animate-pulse">
          {/* Hero skeleton */}
          <div className="bg-navy-900/80 rounded-2xl p-7 md:p-9">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="space-y-3 flex-1">
                <div className="h-4 w-32 bg-white/10 rounded-full" />
                <div className="h-8 w-64 bg-white/10 rounded-xl" />
                <div className="h-4 w-full max-w-md bg-white/10 rounded" />
                <div className="h-4 w-3/4 bg-white/10 rounded" />
                <div className="flex gap-3 pt-2">
                  <div className="h-10 w-36 bg-white/10 rounded-lg" />
                  <div className="h-10 w-28 bg-white/10 rounded-lg" />
                </div>
              </div>
              <div className="w-32 h-32 rounded-full bg-white/10 shrink-0" />
            </div>
          </div>
          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-5 space-y-3">
                  <div className="h-10 w-10 bg-slate-200 dark:bg-navy-700 rounded-lg" />
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-navy-700 rounded" />
                  <div className="h-4 w-full bg-slate-100 dark:bg-navy-800 rounded" />
                  <div className="h-4 w-5/6 bg-slate-100 dark:bg-navy-800 rounded" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-5 h-32" />
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-5 h-40" />
            </div>
          </div>
          {/* Status text */}
          <div className="flex items-center justify-center gap-3 py-4">
            <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              AI đang phân tích hồ sơ... Bạn có thể chuyển tab khác, kết quả sẽ hiện ngay khi xong.
            </p>
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
            <button onClick={() => navigate('/survey')} className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors">
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
        {/* Saved badge */}
        {savedToHistory && (
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 px-4 py-2.5 rounded-xl w-fit">
            <History size={13} />
            Kết quả đã được lưu vào lịch sử trắc nghiệm
            <button onClick={() => navigate('/survey-history')} className="ml-1 font-semibold underline hover:no-underline">
              Xem lịch sử →
            </button>
          </div>
        )}

        {savedError && (
          <div className="flex items-center gap-2 text-xs text-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 px-4 py-2.5 rounded-xl">
            <span className="font-semibold">Lưu lịch sử thất bại:</span>
            <span className="text-xs">{savedError}</span>
            <div className="ml-3">
              <button onClick={retrySave} className="px-3 py-1 bg-yellow-600 text-white rounded text-xs font-semibold">Thử lại</button>
            </div>
          </div>
        )}

        {/* Result Hero */}
        <section className="bg-navy-900 text-white rounded-2xl p-7 md:p-9 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/15 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-600/20 border border-primary-500/30 text-primary-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
                <Sparkles size={12} /> Phân tích hoàn tất
              </div>
              <h1 className="text-2xl md:text-3xl font-black mb-3 leading-tight">
                Hình mẫu nghề nghiệp của bạn là{' '}
                <span className="text-primary-300">{result.archetype}</span>
              </h1>
              <p className="text-slate-300 text-sm md:text-base mb-6 leading-relaxed">{result.description}</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => navigate('/chat')} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition-colors text-sm">
                  Tư vấn với AI Advisor <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => {
                    try {
                      const uid = user?._id || user?.email || 'anon';
                      const RESULT_STORAGE_KEY = `${RESULT_STORAGE_KEY_BASE}_${uid}`;
                      localStorage.removeItem(RESULT_STORAGE_KEY);
                      localStorage.removeItem(`${RESULT_SAVED_FINGERPRINT}_${uid}`);
                      try { sessionStorage.removeItem(`edumatch_survey_session_${uid}`); } catch { /* ignore */ }
                      try { localStorage.removeItem(`edumatch_survey_draft_${uid}`); } catch { /* ignore */ }
                    } catch { /* ignore */ }
                    navigate('/survey');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  <RotateCcw size={14} /> Làm lại
                </button>
              </div>
            </div>
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
              {result.careers.slice(0, 5).map((career) => {
                const safeCareer = {
                  // Ưu tiên id từ DB, fallback sang title slug để CareerDetails tìm được
                  id: career.id || career._id || `title:${encodeURIComponent(career.title || '')}`,
                  title: career.title || career.name || 'Nghề nghiệp phù hợp',
                  description: career.description || career.summary || 'Thông tin nghề chưa có đầy đủ.',
                  salary: career.salary || 'Chưa xác định',
                  growth: career.growth || 'Ổn định',
                  skills: Array.isArray(career.skills) ? career.skills : [],
                  suitability: career.suitability || 0,
                  category: career.category || '',
                  // Truyền roadmap để CareerDetails hiển thị lộ trình AI
                  roadmap: Array.isArray(career.roadmap) ? career.roadmap : [],
                };
                return <CareerCard key={safeCareer.id} career={safeCareer} />;
              })}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-5 shadow-card">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Lightbulb size={16} className="text-amber-500" /> Nhận xét từ AI
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">"{result.insights}"</p>
            </div>

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

            <div className="bg-navy-900 text-white rounded-xl p-5 border border-navy-700">
              <h3 className="text-sm font-bold mb-2">Muốn phân tích sâu hơn?</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">Nâng cấp Pro để nhận phân tích kỹ năng chi tiết và tư vấn AI không giới hạn.</p>
              <button onClick={() => navigate('/upgrade')} className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5 transition-colors">
                Nâng cấp Pro <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
