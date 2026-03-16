import React from 'react';
import { MapPin, Star, ExternalLink } from 'lucide-react';
import type { University } from '../../lib/mockData';

interface UniversityCardProps {
  university: University;
}

export const UniversityCard: React.FC<UniversityCardProps> = ({ university }) => {
  return (
    <div className="group relative overflow-hidden glass rounded-2xl p-4 hover:shadow-premium-hover transition-all duration-500">
      <div className="aspect-[16/9] rounded-xl overflow-hidden mb-4 relative">
        <img 
          src={university.logo} 
          alt={university.name}
          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-2 right-2 px-3 py-1 glass rounded-full text-xs font-bold text-primary-600">
          {university.ranking}
        </div>
      </div>

      <div className="px-2 pb-2">
        <h3 className="font-bold text-lg mb-1 group-hover:text-primary-600 transition-colors">{university.name}</h3>
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm mb-4">
          <MapPin size={14} />
          {university.location}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {university.programs.map((program) => (
            <span key={program} className="px-2 py-0.5 border border-slate-200 dark:border-slate-800 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {program}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button className="text-primary-600 dark:text-primary-400 font-bold text-sm flex items-center gap-1.5 group/btn">
            Admission Details
            <ExternalLink size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
          </button>
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={14} fill="currentColor" />
            <span className="text-xs font-bold">4.8</span>
          </div>
        </div>
      </div>
    </div>
  );
};
