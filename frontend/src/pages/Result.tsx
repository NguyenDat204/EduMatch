import { 
  Sparkles, 
  ArrowRight, 
  Download, 
  Share2, 
  Target, 
  Cpu, 
  Briefcase,
  Zap
} from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { CareerCard } from '../components/ui';
import { mockCareers } from '../mock/data';

export const Result = () => {
  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20">
        {/* Result Hero */}
        <header className="relative py-16 px-10 glass rounded-[3rem] border-none shadow-premium overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                <Zap size={14} fill="currentColor" />
                Analysis Complete
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-6 leading-tight">
                Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">Career Archetype</span> is The Architect.
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 leading-relaxed">
                You excel at logical structure, complex problem solving, and long-term planning. Based on your profile, we've identified 3 high-suitability career paths.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button className="px-8 py-4 premium-gradient text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-primary-500/20 active:scale-95 transition-all">
                  <Download size={18} />
                  Download Report
                </button>
                <button className="px-8 py-4 glass rounded-2xl font-bold flex items-center gap-2 border-none transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 premium-gradient rounded-full blur-3xl opacity-20 animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="glass w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center border-none shadow-premium relative">
                <div className="text-center">
                  <div className="text-5xl md:text-7xl font-display font-black text-primary-600">92%</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">Logistics Score</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Top Recommendations</h2>
              <button className="flex items-center gap-2 text-primary-600 font-bold hover:underline">
                Recalculate
                <Sparkles size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mockCareers.map(career => (
                <CareerCard key={career.id} career={career} />
              ))}
            </div>
          </div>

          {/* Side Analysis */}
          <div className="space-y-10">
            <h2 className="text-3xl font-bold">Skill Breakdown</h2>
            <div className="glass p-8 rounded-[2.5rem] border-none shadow-premium space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="flex items-center gap-2"><Target size={16} className="text-primary-600" /> Logical Analysis</span>
                  <span className="text-primary-600">95%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[95%] premium-gradient rounded-full shadow-lg" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="flex items-center gap-2"><Cpu size={16} className="text-secondary-600" /> Technical Design</span>
                  <span className="text-secondary-600">88%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[88%] bg-gradient-to-r from-secondary-600 to-secondary-400 rounded-full shadow-lg" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="flex items-center gap-2"><Briefcase size={16} className="text-accent-600" /> Leadership</span>
                  <span className="text-accent-600">72%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[72%] bg-gradient-to-r from-accent-600 to-accent-400 rounded-full shadow-lg" />
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold mb-4">AI Insight</h4>
                <p className="text-sm text-slate-500 italic leading-relaxed">
                  "Your high logical analysis score correlates strongly with Software Architecture and Data Science roles. Consider taking Advanced Calculus to further strengthen this profile."
                </p>
              </div>
            </div>

            <div className="premium-gradient p-1 rounded-[2.5rem] shadow-xl group">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.4rem] h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-4">Want more insights?</h3>
                  <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                    Unlock deep-dive skill analysis and unlimited AI advisor interaction with EduMatch Pro.
                  </p>
                </div>
                <button className="w-full py-4 premium-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:scale-105 transition-all">
                  Go Pro
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
