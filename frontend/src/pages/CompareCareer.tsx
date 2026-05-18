import { useState, useEffect } from 'react';
import { Scale, TrendingUp, DollarSign, Briefcase, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { careerService } from '../services/api';
import type { Career } from '../types';

export const CompareCareer = () => {
  const [allCareers, setAllCareers] = useState<Career[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string>('');
  const [selectedRight, setSelectedRight] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const response = await careerService.getCareers();
        if (response.success && response.data) {
          setAllCareers(response.data);
          if (response.data.length > 0) {
            setSelectedLeft(response.data[0]._id || response.data[0].id || '');
          }
          if (response.data.length > 1) {
            setSelectedRight(response.data[1]._id || response.data[1].id || '');
          } else if (response.data.length > 0) {
            setSelectedRight(response.data[0]._id || response.data[0].id || '');
          }
        }
      } catch (err) {
        console.warn("Failed to load careers for comparison from database:", err);
        setError("Không thể tải danh sách ngành nghề từ cơ sở dữ liệu để thực hiện so sánh.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCareers();
  }, []);

  const leftCareer = allCareers.find(c => (c._id || c.id) === selectedLeft);
  const rightCareer = allCareers.find(c => (c._id || c.id) === selectedRight);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-2xl mb-4">
            <Scale size={24} />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">So sánh nghề nghiệp</h1>
          <p className="text-slate-500">So sánh trực quan các nhóm ngành từ cơ sở dữ liệu để tìm ra con đường phù hợp nhất.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        ) : error ? (
          <div className="p-8 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-3xl text-center font-semibold border border-red-100 dark:border-red-950/30">
            {error}
          </div>
        ) : allCareers.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 font-medium">Không có dữ liệu ngành nghề trong cơ sở dữ liệu để so sánh.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Career Selector Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-xs font-black uppercase text-slate-400 block mb-2 ml-1">Ngành thứ nhất</label>
                <select
                  value={selectedLeft}
                  onChange={(e) => setSelectedLeft(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 font-bold text-sm"
                >
                  {allCareers.map(c => (
                    <option key={c._id || c.id} value={c._id || c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 block mb-2 ml-1">Ngành thứ hai</label>
                <select
                  value={selectedRight}
                  onChange={(e) => setSelectedRight(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 font-bold text-sm"
                >
                  {allCareers.map(c => (
                    <option key={c._id || c.id} value={c._id || c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              {leftCareer ? (
                <div className="glass p-8 rounded-[2.5rem] border-none shadow-premium bg-white dark:bg-slate-900 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 premium-gradient opacity-5 blur-2xl rounded-full" />
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600 shrink-0">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{leftCareer.category}</span>
                      <h3 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100">{leftCareer.title}</h3>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-950/10 rounded-2xl flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850">
                      <DollarSign className="text-emerald-600 dark:text-emerald-400 shrink-0" size={24} />
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Mức lương dự kiến</div>
                        <div className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">{leftCareer.salary}</div>
                      </div>
                    </div>

                    <div className="p-6 bg-blue-50 dark:bg-blue-950/10 rounded-2xl flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850">
                      <TrendingUp className="text-blue-600 dark:text-blue-400 shrink-0" size={24} />
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Triển vọng tương lai</div>
                        <div className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">{leftCareer.growth}</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
                      <h4 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-4 ml-1">Kỹ năng cốt lõi</h4>
                      <div className="flex flex-wrap gap-2">
                        {leftCareer.skills.map(skill => (
                          <span key={skill} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Right Column */}
              {rightCareer ? (
                <div className="glass p-8 rounded-[2.5rem] border-none shadow-premium bg-white dark:bg-slate-900 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 premium-gradient opacity-5 blur-2xl rounded-full" />
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl text-secondary-600 shrink-0">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{rightCareer.category}</span>
                      <h3 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100">{rightCareer.title}</h3>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-950/10 rounded-2xl flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850">
                      <DollarSign className="text-emerald-600 dark:text-emerald-400 shrink-0" size={24} />
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Mức lương dự kiến</div>
                        <div className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">{rightCareer.salary}</div>
                      </div>
                    </div>

                    <div className="p-6 bg-blue-50 dark:bg-blue-950/10 rounded-2xl flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850">
                      <TrendingUp className="text-blue-600 dark:text-blue-400 shrink-0" size={24} />
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Triển vọng tương lai</div>
                        <div className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">{rightCareer.growth}</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
                      <h4 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-4 ml-1">Kỹ năng cốt lõi</h4>
                      <div className="flex flex-wrap gap-2">
                        {rightCareer.skills.map(skill => (
                          <span key={skill} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
