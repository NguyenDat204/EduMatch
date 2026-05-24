import { useNavigate } from 'react-router-dom';
import { Briefcase, TrendingUp, ArrowRight } from 'lucide-react';
import type { Career } from '../../types';

interface CareerCardProps {
  career: Career;
}

export const CareerCard: React.FC<CareerCardProps> = ({ career }) => {
  const navigate = useNavigate();
  const skills = Array.isArray(career.skills) ? career.skills : [];
  const salary = career.salary || 'Chưa xác định';
  const growth = career.growth || 'Ổn định';
  const suitability = Number.isFinite(career.suitability) ? career.suitability : 0;

  return (
    <div className="group bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-5 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-card-hover transition-all duration-200 flex flex-col shadow-card">
      {/* Header — fixed height */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
          <Briefcase size={18} className="text-primary-600" />
        </div>
        <span className="text-xs font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-full whitespace-nowrap">
          {suitability}% phù hợp
        </span>
      </div>

      {/* Title — fixed 2-line height */}
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[3rem] leading-6">
        {career.title}
      </h3>

      {/* Description — fixed 2-line height */}
      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5rem] leading-5 mb-4">
        {career.description || 'Thông tin nghề nghiệp chưa có mô tả.'}
      </p>

      {/* Stats — fixed height */}
      <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-slate-100 dark:border-navy-700 mb-4">
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Mức lương</p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">{salary}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Tăng trưởng</p>
          <div className="flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400 leading-tight">
            <TrendingUp size={13} className="shrink-0" />
            <span className="line-clamp-1">{growth}</span>
          </div>
        </div>
      </div>

      {/* Skills — fixed 2-line height (flex-wrap với min-h) */}
      <div className="flex flex-wrap gap-1.5 min-h-[3.5rem] content-start mb-4">
        {skills.length > 0 ? (
          skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 bg-slate-100 dark:bg-navy-800 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 h-fit"
            >
              {skill}
            </span>
          ))
        ) : (
          <span className="px-2 py-1 bg-slate-100 dark:bg-navy-800 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 h-fit">
            Kỹ năng chưa rõ
          </span>
        )}
        {skills.length > 3 && (
          <span className="px-2 py-1 bg-slate-100 dark:bg-navy-800 rounded-md text-xs font-medium text-slate-500 h-fit">
            +{skills.length - 3}
          </span>
        )}
      </div>

      {/* CTA — luôn ở dưới cùng */}
      <button
        onClick={() => navigate(`/explore/${career.id}`)}
        className="mt-auto w-full py-2.5 bg-slate-900 dark:bg-primary-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors"
      >
        Xem lộ trình
        <ArrowRight size={14} />
      </button>
    </div>
  );
};
