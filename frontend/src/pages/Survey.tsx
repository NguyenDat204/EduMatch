import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { QuestionCard } from '../components/ui';
import { mockQuestions } from '../mock/data';
import { useAuth } from '../hooks/useAuth';

export const Survey = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const totalSteps = mockQuestions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 premium-gradient rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  const getSectionName = (step: number) => {
    if (step < 5) return 'Phần I: Học thuật & Thích ứng Công nghệ';
    if (step < 10) return 'Phần II: Tư duy Sáng tạo & Xử lý Số liệu';
    return 'Phần III: Kỹ năng Tương tác & Thích ứng Thực tế';
  };

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [mockQuestions[currentStep].id]: option });
    // Auto advance if not the last question
    if (currentStep < totalSteps - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    }
  };

  const handleScale = (value: number) => {
    setAnswers({ ...answers, [mockQuestions[currentStep].id]: value });
    // Auto advance if not the last question
    if (currentStep < totalSteps - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    }
  };

  const handleRestart = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nháp và làm lại bài khảo sát từ câu hỏi đầu tiên không?")) {
      setAnswers({});
      setCurrentStep(0);
    }
  };

  const handleComplete = () => {
    navigate('/result', { state: { answers } });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-10 animate-fade-in">
        <div className="mb-10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs font-black text-primary-600 uppercase tracking-widest mb-1.5">
                {getSectionName(currentStep)}
              </p>
              <h1 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-100">
                Câu hỏi {currentStep + 1} <span className="text-slate-350 dark:text-slate-500 font-normal">/ {totalSteps}</span>
              </h1>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-slate-300 dark:text-slate-700">{Math.round(progress)}%</span>
              <button 
                onClick={handleRestart}
                className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors mt-1"
              >
                Bắt đầu lại
              </button>
            </div>
          </div>
          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full premium-gradient transition-all duration-500 ease-out rounded-full shadow-lg" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        <div className="min-h-[380px]">
          <QuestionCard
            question={mockQuestions[currentStep]}
            selectedOption={answers[mockQuestions[currentStep].id]}
            onSelect={handleSelect}
            onScaleChange={handleScale}
          />
        </div>

        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 font-bold text-slate-400 hover:text-primary-600 disabled:opacity-0 transition-all"
          >
            <ArrowLeft size={20} />
            Quay lại câu trước
          </button>

          {currentStep === totalSteps - 1 ? (
            <button
              onClick={handleComplete}
              disabled={!answers[mockQuestions[currentStep].id]}
              className="flex items-center gap-2 px-10 py-4 premium-gradient text-white rounded-2xl font-bold shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-50 btn-transition"
            >
              <Zap size={20} fill="currentColor" />
              Xem kết quả phân tích AI
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(prev => Math.min(totalSteps - 1, prev + 1))}
              disabled={!answers[mockQuestions[currentStep].id]}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-primary-600 hover:text-white transition-all disabled:opacity-50"
            >
              Tiếp theo
              <ArrowRight size={20} />
            </button>
          )}
        </div>

        <div className="mt-16 p-8 glass rounded-3xl border-none shadow-premium flex items-start gap-6 relative overflow-hidden group bg-white dark:bg-slate-900">
          <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">AI phân tích điều này như thế nào?</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Câu trả lời của bạn sẽ được nạp trực tiếp vào động cơ phân tích kết hợp MBTI và RIASEC của AI để lập bản đồ năng lực cá nhân, gợi ý lộ trình học tập tối ưu và kết nối với các trường đại học hàng đầu Việt Nam.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 premium-gradient opacity-0 group-hover:opacity-5 transition-opacity blur-3xl rounded-full" />
        </div>
      </div>
    </DashboardLayout>
  );
};
