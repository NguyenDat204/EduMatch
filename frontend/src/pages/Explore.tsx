import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { CareerCard } from '../components/ui';
import { UniversityCard } from '../components/ui';
import { careerService, universityService } from '../services/api';
import type { Career, University } from '../types';

export const Explore = () => {
  const [activeTab, setActiveTab] = useState<'careers' | 'universities'>('careers');
  const [searchTerm, setSearchTerm] = useState('');
  const [careers, setCareers] = useState<Career[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (activeTab === 'careers') {
          const res = await careerService.getCareers(searchTerm);
          if (res.success && res.data) {
            // Map _id to id if needed for types consistency
            const formatted = res.data.map((c: any) => ({
              ...c,
              id: c._id || c.id || c.title
            }));
            setCareers(formatted);
          }
        } else {
          const res = await universityService.getUniversities(searchTerm);
          if (res.success && res.data) {
            const formatted = res.data.map((u: any) => ({
              ...u,
              id: u._id || u.id || u.name
            }));
            setUniversities(formatted);
          }
        }
      } catch (err: any) {
        console.error("Fetch explore error:", err);
        setError("Không thể tải dữ liệu thời gian thực từ máy chủ.");
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [activeTab, searchTerm]);

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Động cơ Khám phá</h1>
            <p className="text-slate-500 dark:text-slate-400">Tìm kiếm và tra cứu các ngành nghề & trường học.</p>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
            <button 
              onClick={() => {
                setActiveTab('careers');
                setSearchTerm('');
              }}
              className={`px-6 py-2.5 rounded-[1.1rem] text-sm font-bold transition-all ${activeTab === 'careers' ? 'bg-white dark:bg-slate-900 shadow-lg text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Ngành nghề
            </button>
            <button 
              onClick={() => {
                setActiveTab('universities');
                setSearchTerm('');
              }}
              className={`px-6 py-2.5 rounded-[1.1rem] text-sm font-bold transition-all ${activeTab === 'universities' ? 'bg-white dark:bg-slate-900 shadow-lg text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Trường đại học
            </button>
          </div>
        </header>

        <section className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeTab === 'careers' ? "Tìm kiếm ngành nghề (ví dụ: Software Architect, AI Engineer...)" : "Tìm kiếm trường học (ví dụ: FPT University, Stanford...)"}
              className="w-full pl-12 pr-4 py-4 glass rounded-2xl border-none shadow-premium focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-4 glass rounded-2xl border-none shadow-premium font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <SlidersHorizontal size={20} />
            Bộ lọc
          </button>
        </section>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Đang truy vấn dữ liệu từ database...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-3xl text-center font-semibold border border-red-100 dark:border-red-950/30">
            {error}
          </div>
        ) : (
          <>
            {activeTab === 'careers' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12 animate-fade-in">
                {careers.length > 0 ? (
                  careers.map(career => (
                    <CareerCard key={career.id} career={career} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16 text-slate-400 font-medium">
                    Không tìm thấy ngành nghề nào khớp với từ khóa tìm kiếm.
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12 animate-fade-in">
                {universities.length > 0 ? (
                  universities.map(uni => (
                    <UniversityCard key={uni.id} university={uni} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16 text-slate-400 font-medium">
                    Không tìm thấy trường đại học nào khớp với từ khóa tìm kiếm.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};
