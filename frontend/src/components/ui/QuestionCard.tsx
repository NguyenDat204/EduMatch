import React from 'react';
import { Question } from '../../lib/mockData';
import { cn } from '../../lib/utils';

interface QuestionCardProps {
  question: Question;
  selectedOption?: string;
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
    <div className="glass p-8 rounded-3xl animate-fade-in shadow-premium-hover border-none">
      <div className="mb-8">
        <span className="px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs font-bold uppercase tracking-widest">
          {question.category} Assessment
        </span>
        <h2 className="text-2xl font-bold mt-4 leading-tight">{question.text}</h2>
      </div>

      {question.type === 'choice' && question.options && (
        <div className="grid grid-cols-1 gap-4">
          {question.options.map((option) => (
            <button
              key={option}
              onClick={() => onSelect(option)}
              className={cn(
                "group w-full p-5 rounded-2xl text-left font-medium transition-all duration-300 border-2",
                selectedOption === option
                  ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20"
                  : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10"
              )}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  selectedOption === option ? "bg-white border-white" : "border-slate-200 dark:border-slate-700"
                )}>
                  {selectedOption === option && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-600 animate-fade-in" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {question.type === 'scale' && (
        <div className="space-y-8 py-4">
          <input 
            type="range" 
            min="1" 
            max="10" 
            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
            onChange={(e) => onScaleChange?.(parseInt(e.target.value))}
          />
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Least Interested</span>
            <span>Neutral</span>
            <span>Most Interested</span>
          </div>
        </div>
      )}
    </div>
  );
};
