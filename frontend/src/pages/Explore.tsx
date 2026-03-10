import { useState } from 'react';
import { Search, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { CareerCard } from '../components/ui';
import { UniversityCard } from '../components/ui';
import { mockCareers, mockUniversities } from '../mock/data';

export const Explore = () => {
  const [activeTab, setActiveTab] = useState<'careers' | 'universities'>('careers');

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Discovery Engine</h1>
            <p className="text-slate-500 dark:text-slate-400">Search and filter through 100+ careers and universities.</p>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveTab('careers')}
              className={`px-6 py-2.5 rounded-[1.1rem] text-sm font-bold transition-all ${activeTab === 'careers' ? 'bg-white dark:bg-slate-900 shadow-lg text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Careers
            </button>
            <button 
              onClick={() => setActiveTab('universities')}
              className={`px-6 py-2.5 rounded-[1.1rem] text-sm font-bold transition-all ${activeTab === 'universities' ? 'bg-white dark:bg-slate-900 shadow-lg text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Universities
            </button>
          </div>
        </header>

        <section className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder={activeTab === 'careers' ? "Search careers (e.g. Software Engineer)" : "Search universities (e.g. Stanford)"}
              className="w-full pl-12 pr-4 py-4 glass rounded-2xl border-none shadow-premium focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-4 glass rounded-2xl border-none shadow-premium font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <SlidersHorizontal size={20} />
            Filters
          </button>
        </section>

        {activeTab === 'careers' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {mockCareers.map(career => (
              <CareerCard key={career.id} career={career} />
            ))}
            {/* Simulation of more data */}
            {mockCareers.map(career => (
              <CareerCard key={`${career.id}-dup`} career={career} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {mockUniversities.map(uni => (
              <UniversityCard key={uni.id} university={uni} />
            ))}
            {mockUniversities.map(uni => (
              <UniversityCard key={`${uni.id}-dup`} university={uni} />
            ))}
          </div>
        )}

        <div className="flex justify-center pb-20">
          <button className="px-8 py-4 glass rounded-2xl font-bold flex items-center gap-2 border-none shadow-premium hover:scale-105 transition-all">
            Load More Results
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};
