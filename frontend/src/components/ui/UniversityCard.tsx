import { useNavigate } from 'react-router-dom';
import { MapPin, ExternalLink } from 'lucide-react';
import type { University } from '../../types';

interface UniversityCardProps {
  university: University;
}

export const UniversityCard: React.FC<UniversityCardProps> = ({ university }) => {
  const navigate = useNavigate();

  return (
    <div
      className="group bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl overflow-hidden hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-card-hover transition-all duration-200 cursor-pointer shadow-card flex flex-col h-full"
      onClick={() => navigate(`/universities/${university.id}`)}
    >
      {/* Logo area */}
      <div className="h-44 sm:h-48 bg-slate-50 dark:bg-navy-800 overflow-hidden border-b border-slate-100 dark:border-navy-700">
        <img
          src={university.logo}
          alt={university.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Ranking badge */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors leading-snug flex-1 mr-2">
            {university.name}
          </h3>
          <span className="text-[10px] font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
            {university.ranking}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <MapPin size={12} />
          <span>{university.location}</span>
        </div>

        {/* Programs */}
        <div className="flex flex-wrap gap-1 mb-4">
          {university.programs.slice(0, 3).map((program) => (
            <span key={program} className="px-2 py-0.5 border border-slate-200 dark:border-navy-600 rounded-md text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {program}
            </span>
          ))}
          {university.programs.length > 3 && (
            <span className="px-2 py-0.5 border border-slate-200 dark:border-navy-600 rounded-md text-[10px] font-medium text-slate-400">
              +{university.programs.length - 3}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100 dark:border-navy-700">
          <span className="text-xs font-medium text-primary-600 flex items-center gap-1">
            Xem chi tiết
            <ExternalLink size={11} />
          </span>
          {university.tuitionFee && (
            <span className="text-xs text-slate-500">
              {(university.tuitionFee / 1_000_000).toFixed(0)}tr/năm
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
