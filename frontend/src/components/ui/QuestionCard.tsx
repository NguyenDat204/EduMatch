import React from 'react';
import type { Question } from '../../types';
import { cn } from '../../lib/utils';

interface QuestionCardProps {
  question: Question;
  selectedOption?: string | number;
  onSelect: (option: string) => void;
  onScaleChange?: (value: number) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  selectedOption, 
  onSelect,
  onScaleChange 
}) => {
  return (
    <div className="glass p-8 rounded-3xl animate-fade-in shadow-premium-hover border-none bg-white dark:bg-slate-900">
      <div className="mb-8">
        <span className="px-4 py-1.5 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-full text-xs font-bold uppercase tracking-widest">
          Phần: {question.category === 'personality' ? 'Tính cách' : question.category === 'interest' ? 'Sở thích' : 'Kỹ năng'}
        </span>
        <h2 className="text-2xl font-bold mt-4 leading-tight text-slate-800 dark:text-slate-100">{question.text}</h2>
      </div>

      {question.type === 'choice' && question.options && (
        <div className="grid grid-cols-1 gap-4">
          {question.options.map((option) => {
            const isSelected = selectedOption === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(option)}
                className={cn(
                  "group w-full p-5 rounded-2xl text-left font-medium transition-all duration-300 border-2",
                  isSelected
                    ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20 scale-[1.01]"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:border-primary-450 hover:bg-primary-50/30 dark:hover:bg-primary-900/10"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{option}</span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected ? "bg-white border-white" : "border-slate-200 dark:border-slate-600"
                  )}>
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-600 animate-fade-in" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'scale' && (
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((val) => {
              const labels = ['Rất thấp', 'Thấp', 'Trung bình', 'Cao', 'Rất cao'];
              const isSelected = String(selectedOption) === String(val);
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => onScaleChange?.(val)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 font-bold",
                    isSelected
                      ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20 scale-105"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700/60 text-slate-550 dark:text-slate-400 hover:border-primary-400 hover:bg-primary-50/30"
                  )}
                >
                  <span className="text-xl mb-1">{val}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{labels[val - 1]}</span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
            <span>Rất thấp / Không có</span>
            <span>Rất cao / Vững vàng</span>
          </div>
        </div>
      )}
    </div>
  );
};
