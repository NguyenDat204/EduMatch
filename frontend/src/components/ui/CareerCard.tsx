import { Briefcase, TrendingUp, ChevronRight } from 'lucide-react';
import type { Career } from '../../types';


interface CareerCardProps {
  career: Career;
}

export const CareerCard: React.FC<CareerCardProps> = ({ career }) => {
  return (
    <div className="group glass p-6 rounded-2xl hover:shadow-premium-hover transition-all duration-500 border-none cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-500">
          <Briefcase size={24} />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full">
            {career.suitability}% Match
          </span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">{career.title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6">
        {career.description}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Salary</div>
          <div className="text-sm font-semibold">{career.salary}</div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-accent-500" />
          <div className="text-sm font-semibold text-accent-600">{career.growth}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {career.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">
            {skill}
          </span>
        ))}
        {career.skills.length > 3 && (
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">
            +{career.skills.length - 3}
          </span>
        )}
      </div>

      <button className="w-full py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 group-hover:bg-primary-600 group-hover:text-white transition-all">
        View Roadmap
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
