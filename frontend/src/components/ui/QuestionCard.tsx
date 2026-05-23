import React from 'react';
import type { Question } from '../../types';
import { cn } from '../../lib/utils';

interface QuestionCardProps {
  question: Question;
  selectedOption?: string | number;
  onSelect: (option: string) => void;
  onScaleChange?: (value: number) => void;
}

const categoryLabel: Record<string, string> = {
  personality: 'Tính cách',
  interest:    'Sở thích',
  skill:       'Kỹ năng',
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  onSelect,
  onScaleChange,
}) => {
  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-7 shadow-card animate-fade-in">
      {/* Category badge */}
      <span className="inline-flex items-center px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
        {categoryLabel[question.category] || question.category}
      </span>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 leading-snug">
        {question.text}
      </h2>

      {/* Choice type */}
      {question.type === 'choice' && question.options && (
        <div className="space-y-2.5">
          {question.options.map((option) => {
            const isSelected = selectedOption === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(option)}
                className={cn(
                  'w-full p-4 rounded-xl text-left text-sm font-medium transition-all duration-200 border-2 flex items-center justify-between',
                  isSelected
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-slate-50 dark:bg-navy-800 border-slate-200 dark:border-navy-600 text-slate-700 dark:text-slate-300 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
                )}
              >
                <span>{option}</span>
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                    isSelected ? 'border-white bg-white' : 'border-slate-300 dark:border-navy-500'
                  )}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-primary-600" />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Scale type */}
      {question.type === 'scale' && (
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((val) => {
              const labels    = ['Rất thấp', 'Thấp', 'TB', 'Cao', 'Rất cao'];
              const isSelected = String(selectedOption) === String(val);
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => onScaleChange?.(val)}
                  className={cn(
                    'flex flex-col items-center justify-center py-3.5 rounded-xl border-2 transition-all duration-200 font-bold',
                    isSelected
                      ? 'bg-primary-600 border-primary-600 text-white scale-105'
                      : 'bg-slate-50 dark:bg-navy-800 border-slate-200 dark:border-navy-600 text-slate-600 dark:text-slate-400 hover:border-primary-400'
                  )}
                >
                  <span className="text-lg">{val}</span>
                  <span className="text-[9px] uppercase font-semibold tracking-wider mt-0.5 opacity-80">
                    {labels[val - 1]}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-xs font-medium text-slate-400 px-1">
            <span>Rất thấp</span>
            <span>Rất cao</span>
          </div>
        </div>
      )}
    </div>
  );
};
