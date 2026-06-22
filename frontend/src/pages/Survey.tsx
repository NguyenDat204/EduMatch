import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Zap, RotateCcw, Save } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { QuestionCard } from '../components/ui';
import { surveyService } from '../services/api';
import type { Question } from '../types';
import { useAuth } from '../hooks/useAuth';

// ── Storage helpers ────────────────────────────────────────────
// sessionStorage: tồn tại suốt phiên trình duyệt, không mất khi chuyển tab
// localStorage:   tồn tại lâu dài, dùng làm backup
const getSessionKey = (userId: string) => `edumatch_survey_session_${userId}`;
const getLocalKey   = (userId: string) => `edumatch_survey_draft_${userId}`;

interface SurveyDraft {
  answers:     Record<string, string | number>;
  currentStep: number;
  savedAt:     string;
}

const readDraft = (userId: string): SurveyDraft | null => {
  // Ưu tiên sessionStorage (chuyển tab không mất)
  for (const storage of [sessionStorage, localStorage]) {
    try {
      const key = storage === sessionStorage ? getSessionKey(userId) : getLocalKey(userId);
      const raw = storage.getItem(key);
      if (raw) {
        const d: SurveyDraft = JSON.parse(raw);
        if (d.answers && Object.keys(d.answers).length > 0) return d;
      }
    } catch { /* ignore */ }
  }
  return null;
};

const writeDraft = (userId: string, draft: SurveyDraft) => {
  const key = getSessionKey(userId);
  const str = JSON.stringify(draft);
  try { sessionStorage.setItem(key, str); } catch { /* ignore */ }
  try { localStorage.setItem(getLocalKey(userId), str); } catch { /* ignore */ }
};

const clearDraftStorage = (userId: string) => {
  try { sessionStorage.removeItem(getSessionKey(userId)); } catch { /* ignore */ }
  try { localStorage.removeItem(getLocalKey(userId)); }   catch { /* ignore */ }
};

export const Survey = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep]   = useState(0);
  const [answers, setAnswers]           = useState<Record<string, string | number>>({});
  const [hasDraft, setHasDraft]         = useState(false);
  const [questions, setQuestions]       = useState<Question[]>([]);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState<string | null>(null);
  const navigate = useNavigate();

  const totalSteps    = questions.length;
  const progress      = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  // ── Restore draft khi mount ────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const draft = readDraft(user._id || user.email);
    if (draft) {
      setAnswers(draft.answers);
      setCurrentStep(draft.currentStep || 0);
      setHasDraft(true);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const loadQuestions = async () => {
      try {
        const response = await surveyService.getQuestions();
        setQuestions(response.data);
      } catch (error) {
        console.error('Load survey questions failed:', error);
        setFetchError('Không tải được câu hỏi khảo sát. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [user]);

  // ── Auto-save mỗi khi answers/step thay đổi ───────────────
  const saveDraft = useCallback(
    (newAnswers: Record<string, string | number>, step: number) => {
      if (!user) return;
      writeDraft(user._id || user.email, {
        answers:     newAnswers,
        currentStep: step,
        savedAt:     new Date().toISOString(),
      });
    },
    [user]
  );

  const clearDraft = useCallback(() => {
    if (!user) return;
    clearDraftStorage(user._id || user.email);
    setHasDraft(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  if (fetchError) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
          <p className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Không thể tải dữ liệu khảo sát</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!questions.length) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="rounded-3xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 shadow-card p-10 text-center">
            <p className="text-base font-medium text-slate-900 dark:text-white">Chưa có câu hỏi khảo sát nào.</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Vui lòng kiểm tra lại kết nối hoặc liên hệ quản trị viên.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getSectionName = (step: number) => {
    if (step < 5)  return 'Phần I — Học thuật & Công nghệ';
    if (step < 10) return 'Phần II — Tư duy & Sáng tạo';
    return 'Phần III — Kỹ năng & Thích ứng';
  };

  const currentQuestion = questions[currentStep];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  const advanceAfterAnswer = (newAnswers: Record<string, string | number>) => {
    const nextStep = Math.min(totalSteps - 1, currentStep + 1);
    if (nextStep !== currentStep) {
      setCurrentStep(nextStep);
    }
    saveDraft(newAnswers, nextStep);
  };

  const handleSelect = (option: string) => {
    if (!currentQuestion) return;
    const newAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(newAnswers);
    advanceAfterAnswer(newAnswers);
    setHasDraft(true);
  };

  const handleScale = (value: number) => {
    if (!currentQuestion) return;
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    advanceAfterAnswer(newAnswers);
    setHasDraft(true);
  };

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
    saveDraft(answers, newStep);
  };

  const handleRestart = () => {
    if (window.confirm('Bạn có chắc muốn xóa nháp và làm lại từ đầu?')) {
      clearDraft();
      setAnswers({});
      setCurrentStep(0);
    }
  };

  const handleComplete = () => {
    // Navigate tới /result ngay lập tức — AI chạy background ở đó
    // Giữ draft trong sessionStorage cho đến khi Result load xong
    navigate('/result', { state: { answers } });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-6 animate-fade-in">

        {/* ── Draft banner ── */}
        {hasDraft && answeredCount > 0 && (
          <div className="mb-5 flex items-center justify-between p-3.5 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/50 rounded-xl animate-fade-in">
            <div className="flex items-center gap-2.5">
              <Save size={14} className="text-primary-600 shrink-0" />
              <p className="text-xs font-medium text-primary-700 dark:text-primary-300">
                Đã khôi phục nháp — <strong>{answeredCount}/{totalSteps}</strong> câu đã trả lời.
                Chuyển tab không mất dữ liệu.
              </p>
            </div>
            <button onClick={handleRestart} className="text-xs font-semibold text-primary-600 hover:text-red-500 transition-colors ml-3 shrink-0 whitespace-nowrap">
              Làm lại
            </button>
          </div>
        )}

        {/* ── Progress ── */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">
                {getSectionName(currentStep)}
              </p>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Câu {currentStep + 1}
                <span className="text-slate-400 font-normal"> / {totalSteps}</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-slate-200 dark:text-navy-700">{Math.round(progress)}%</span>
              <button onClick={handleRestart} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors" title="Làm lại từ đầu">
                <RotateCcw size={15} />
              </button>
            </div>
          </div>

          <div className="h-1.5 bg-slate-200 dark:bg-navy-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary-600 transition-all duration-500 ease-out rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 text-right">
            {answeredCount} / {totalSteps} câu đã trả lời
            {hasDraft && <span className="ml-2 text-primary-500">· Đã lưu tự động</span>}
          </p>
        </div>

        {/* ── Question ── */}
        <div className="min-h-[340px]">
          <QuestionCard
            question={currentQuestion}
            selectedOption={currentAnswer}
            onSelect={handleSelect}
            onScaleChange={handleScale}
          />
        </div>

        {/* ── Navigation ── */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => handleStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-primary-600 disabled:opacity-0 transition-colors"
          >
            <ArrowLeft size={16} /> Câu trước
          </button>

          {currentStep === totalSteps - 1 ? (
            <button
              onClick={handleComplete}
              disabled={!currentAnswer}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm"
            >
              <Zap size={16} /> Xem kết quả AI
            </button>
          ) : (
            <button
              onClick={() => handleStepChange(Math.min(totalSteps - 1, currentStep + 1))}
              disabled={!currentAnswer}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-semibold rounded-lg hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white transition-colors disabled:opacity-50 text-sm"
            >
              Tiếp theo <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* ── Dot navigator ── */}
        <div className="mt-6 flex flex-wrap justify-center gap-1.5">
          {questions.map((q, i) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent  = i === currentStep;
            return (
              <button
                key={i}
                onClick={() => handleStepChange(i)}
                title={`Câu ${i + 1}${isAnswered ? ' ✓' : ''}`}
                className={`w-6 h-6 rounded-full text-[10px] font-bold transition-all ${
                  isCurrent
                    ? 'bg-primary-600 text-white scale-110'
                    : isAnswered
                    ? 'bg-primary-200 dark:bg-primary-800 text-primary-700 dark:text-primary-300 hover:bg-primary-300'
                    : 'bg-slate-200 dark:bg-navy-700 text-slate-400 hover:bg-slate-300'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* ── Info note ── */}
        <div className="mt-6 p-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl shadow-card flex items-start gap-4">
          <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
            <Zap size={16} className="text-primary-600" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">AI phân tích như thế nào?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Câu trả lời được phân tích theo mô hình Holland RIASEC, ARCS, học lực và kỹ năng tự đánh giá. Nháp lưu tự động vào bộ nhớ phiên —
              chuyển tab, thu nhỏ cửa sổ đều không mất dữ liệu. Chỉ ấn <strong>"Làm lại"</strong> mới xóa nháp.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
