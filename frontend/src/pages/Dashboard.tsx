import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Target, 
  ArrowRight, 
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { CareerCard } from '../components/ui/CareerCard';
import { mockCareers, mockCurrentUser } from '../mock/data';

export const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Welcome Banner */}
        <section className="relative overflow-hidden premium-gradient rounded-[2.5rem] p-10 md:p-12 text-white shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={14} />
              Personalized for you
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Hello, {mockCurrentUser.name}! 👋</h2>
            <p className="text-primary-100 text-lg mb-8 leading-relaxed">
              You've completed 2 of 3 assessments. Finish your skill evaluation to unlock your full career roadmap.
            </p>
            <button className="px-8 py-4 bg-white text-primary-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-50 transition-all shadow-xl shadow-black/10 active:scale-95">
              Complete Skill Test
              <ArrowRight size={18} />
            </button>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-10 w-48 h-48 bg-secondary-400/20 rounded-full translate-y-1/2 blur-2xl" />
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-8 rounded-3xl flex items-center gap-6 group hover:border-primary-500/30 transition-all border-none shadow-premium">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy size={28} />
            </div>
            <div>
              <div className="text-2xl font-bold">Top 5%</div>
              <div className="text-sm font-medium text-slate-500">Logical Reasoning</div>
            </div>
          </div>
          
          <div className="glass p-8 rounded-3xl flex items-center gap-6 group hover:border-primary-500/30 transition-all border-none shadow-premium">
            <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 text-primary-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target size={28} />
            </div>
            <div>
              <div className="text-2xl font-bold">128</div>
              <div className="text-sm font-medium text-slate-500">Career Matches</div>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl flex items-center gap-6 group hover:border-primary-500/30 transition-all border-none shadow-premium">
            <div className="w-14 h-14 bg-accent-50 dark:bg-accent-900/20 text-accent-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap size={28} />
            </div>
            <div>
              <div className="text-2xl font-bold">Level 4</div>
              <div className="text-sm font-medium text-slate-500">Profile Strength</div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content: Careers */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Recommended for You</h3>
              <Link to="/explore" className="text-sm font-bold text-primary-600 hover:underline">View All</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockCareers.slice(0, 2).map(career => (
                <CareerCard key={career.id} career={career} />
              ))}
            </div>
          </div>

          {/* Sidebar: Next Up & Activity */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold">Daily Path</h3>
            <div className="glass rounded-[2rem] p-8 border-none shadow-premium divide-y divide-slate-100 dark:divide-slate-800">
              <div className="pb-6">
                <div className="flex items-center gap-3 mb-2 text-primary-600">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-bold uppercase tracking-wider">Completed</span>
                </div>
                <h4 className="font-bold text-lg">Interest Assessment</h4>
                <p className="text-sm text-slate-500">Analyzed your 12 core interests.</p>
              </div>
              
              <div className="py-6">
                <div className="flex items-center gap-3 mb-2 text-slate-300">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Next Step</span>
                </div>
                <h4 className="font-bold text-lg">Skill Gap Analysis</h4>
                <p className="text-sm text-slate-500">Compare your skills with top careers.</p>
                <div className="mt-4 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 premium-gradient rounded-full" />
                </div>
              </div>

              <div className="pt-6">
                <h4 className="font-bold text-lg mb-4 text-slate-400">Upcoming events</h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Mar</span>
                      <span className="text-lg font-bold">12</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold">Stanford Webinar</div>
                      <div className="text-xs text-slate-500">Admission Q&A Session</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
