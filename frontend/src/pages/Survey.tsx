import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Zap, RotateCcw } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { QuestionCard } from '../components/ui';
import { mockQuestions } from '../mock/data';
import { useAuth } from '../hooks/useAuth';

export const Survey = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep]   = useState(0);
  const [answers, setAnswers]           = useState<Record<string, string | number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  const totalSteps = mockQuestions.length;
  const progress   = ((currentStep + 1) / totalSteps) * 100;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  const getSectionName = (step: number) => {
    if (step < 5)  return 'Phần I — Học thuật & Công nghệ';
    if (step < 10) return 'Phần II — Tư duy & Sáng tạo';
    return 'Phần III — Kỹ năng & Thích ứng';
  };

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [mockQuestions[currentStep].id]: option });
    if (currentStep < totalSteps - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 280);
    }
  };

  const handleScale = (value: number) => {
    setAnswers({ ...answers, [mockQuestions[currentStep].id]: value });
    if (currentStep < totalSteps - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 280);
    }
  };

  const handleRestart = () => {
    if (window.confirm('Bạn có chắc muốn làm lại từ đầu?')) {
      setAnswers({});
      setCurrentStep(0);
    }
  };

  const handleComplete = () => {
    navigate('/result', { state: { answers } });
  };

  const currentAnswer = answers[mockQuestions[currentStep].id];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-6 animate-fade-in">
        {/* Progress Header */}
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
              <span className="text-2xl font-black text-slate-200 dark:text-navy-700">
                {Math.round(progress)}%
              </span>
              <button
                onClick={handleRestart}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                title="Làm lại"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-slate-200 dark:bg-navy-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="min-h-[340px]">
          <QuestionCard
            question={mockQuestions[currentStep]}
            selectedOption={currentAnswer}
            onSelect={handleSelect}
            onScaleChange={handleScale}
          />
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-primary-600 disabled:opacity-0 transition-colors"
          >
            <ArrowLeft size={16} />
            Câu trước
          </button>

          {currentStep === totalSteps - 1 ? (
            <button
              onClick={handleComplete}
              disabled={!currentAnswer}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm"
            >
              <Zap size={16} />
              Xem kết quả AI
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep((p) => Math.min(totalSteps - 1, p + 1))}
              disabled={!currentAnswer}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-semibold rounded-lg hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white transition-colors disabled:opacity-50 text-sm"
            >
              Tiếp theo
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* Info note */}
        <div className="mt-8 p-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl shadow-card flex items-start gap-4">
          <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
            <Zap size={16} className="text-primary-600" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">AI phân tích như thế nào?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Câu trả lời của bạn được phân tích theo mô hình MBTI và RIASEC để lập bản đồ năng lực cá nhân, gợi ý lộ trình học tập và kết nối với các trường đại học phù hợp.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
