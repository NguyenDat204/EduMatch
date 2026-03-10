import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { QuestionCard } from '../components/ui';
import { mockQuestions } from '../mock/data';

export const Survey = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const navigate = useNavigate();

  const totalSteps = mockQuestions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [mockQuestions[currentStep].id]: option });
    // Auto advance for choice questions if it's not the last one
    if (currentStep < totalSteps - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    }
  };

  const handleScale = (value: number) => {
    setAnswers({ ...answers, [mockQuestions[currentStep].id]: value });
  };

  const handleComplete = () => {
    navigate('/result');
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-10">
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-1">Career Assessment</p>
              <h1 className="text-3xl font-display font-bold">Step {currentStep + 1} of {totalSteps}</h1>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-200">{Math.round(progress)}%</span>
            </div>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full premium-gradient transition-all duration-700 ease-out rounded-full shadow-lg shadow-primary-500/20" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        <div className="min-h-[400px]">
          <QuestionCard
            question={mockQuestions[currentStep]}
            selectedOption={answers[mockQuestions[currentStep].id] as string}
            onSelect={handleSelect}
            onScaleChange={handleScale}
          />
        </div>

        <div className="mt-12 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 font-bold text-slate-400 hover:text-primary-600 disabled:opacity-0 transition-all"
          >
            <ArrowLeft size={20} />
            Previous
          </button>

          {currentStep === totalSteps - 1 ? (
            <button
              onClick={handleComplete}
              disabled={!answers[mockQuestions[currentStep].id]}
              className="flex items-center gap-2 px-10 py-4 premium-gradient text-white rounded-2xl font-bold shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-50 btn-transition"
            >
              <Zap size={20} fill="currentColor" />
              Generate My Results
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(prev => Math.min(totalSteps - 1, prev + 1))}
              disabled={!answers[mockQuestions[currentStep].id]}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-primary-600 hover:text-white transition-all disabled:opacity-50"
            >
              Next Question
              <ArrowRight size={20} />
            </button>
          )}
        </div>

        <div className="mt-20 p-8 glass rounded-3xl border-none shadow-premium flex items-start gap-6 relative overflow-hidden group">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2">Why this matters?</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Your answers are used by our AI engine to map your personality traits against millions of successful career paths and university requirements.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 premium-gradient opacity-0 group-hover:opacity-5 transition-opacity blur-3xl rounded-full" />
        </div>
      </div>
    </DashboardLayout>
  );
};
