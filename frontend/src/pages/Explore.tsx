import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { CareerCard } from '../components/ui';
import { UniversityCard } from '../components/ui';
import { careerService, universityService } from '../services/api';
import type { Career, University } from '../types';

export const Explore = () => {
  const [activeTab, setActiveTab]       = useState<'careers' | 'universities'>('careers');
  const [searchTerm, setSearchTerm]     = useState('');
  const [careers, setCareers]           = useState<Career[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (activeTab === 'careers') {
          const res = await careerService.getCareers(searchTerm);
          if (res.success && res.data) {
            setCareers(res.data.map((c: any) => ({ ...c, id: c._id || c.id || c.title })));
          }
        } else {
          const res = await universityService.getUniversities(searchTerm);
          if (res.success && res.data) {
            setUniversities(res.data.map((u: any) => ({ ...u, id: u._id || u.id || u.name })));
          }
        }
      } catch {
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 400);
    return () => clearTimeout(timer);
  }, [activeTab, searchTerm]);

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Khám phá</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Tìm kiếm ngành nghề và trường đại học phù hợp với bạn.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-slate-100 dark:bg-navy-800 p-1 rounded-xl w-fit border border-slate-200 dark:border-navy-700">
            {[
              { key: 'careers',      label: 'Ngành nghề' },
              { key: 'universities', label: 'Trường đại học' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key as any); setSearchTerm(''); }}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-white dark:bg-navy-700 text-primary-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'careers'
                ? 'Tìm kiếm ngành nghề (ví dụ: Software Engineer, AI...)'
                : 'Tìm kiếm trường học (ví dụ: FPT, Bách Khoa...)'
            }
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-400 shadow-card"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-center text-sm border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8 animate-fade-in">
            {activeTab === 'careers' ? (
              careers.length > 0 ? (
                careers.map((career) => <CareerCard key={career.id} career={career} />)
              ) : (
                <div className="col-span-full text-center py-16 text-slate-400 text-sm">
                  Không tìm thấy ngành nghề phù hợp.
                </div>
              )
            ) : universities.length > 0 ? (
              universities.map((uni) => <UniversityCard key={uni.id} university={uni} />)
            ) : (
              <div className="col-span-full text-center py-16 text-slate-400 text-sm">
                Không tìm thấy trường đại học phù hợp.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
