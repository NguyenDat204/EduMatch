import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Globe, 
  BookOpen, 
  Users, 
  Award,
  ChevronRight,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts';
import { mockUniversities } from '../mock/data';

export const UniversityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const uni = mockUniversities.find(u => u.id === id) || mockUniversities[0];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-primary-600 font-bold transition-all group"
        >
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-primary-50">
            <ArrowLeft size={18} />
          </div>
          Back to Search
        </button>

        <header className="relative group">
          <div className="h-64 md:h-80 w-full rounded-[3.5rem] overflow-hidden relative">
            <img 
              src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=2000" 
              alt={uni.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 p-10 md:p-14 w-full flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-1.5 bg-primary-600 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                  Ranked #{uni.ranking} Worldwide
                </span>
                <span className="flex items-center gap-1.5 text-sm font-bold text-slate-200">
                  <MapPin size={16} />
                  {uni.location}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-black leading-tight">{uni.name}</h1>
            </div>
            
            <div className="flex gap-4">
              <a 
                href={uni.website} 
                target="_blank" 
                rel="noreferrer"
                className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-xl"
              >
                Visit Website
                <ExternalLink size={18} />
              </a>
              <button className="p-4 bg-primary-600 text-white rounded-2xl shadow-xl hover:bg-primary-500 transition-all">
                <Star size={24} fill="white" />
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section className="space-y-6">
              <h2 className="text-3xl font-bold">About the Institution</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                {uni.name} is a world-renowned private research university in {uni.location}. It is known for its academic strength, wealth, proximity to Silicon Valley, and ranking as one of the world's top universities.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 <div className="p-6 glass rounded-3xl border-none shadow-premium text-center">
                    <Users size={24} className="mx-auto mb-3 text-primary-600" />
                    <div className="font-black text-xl">17.2k</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Students</div>
                 </div>
                 <div className="p-6 glass rounded-3xl border-none shadow-premium text-center">
                    <BookOpen size={24} className="mx-auto mb-3 text-secondary-600" />
                    <div className="font-black text-xl">4%</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Acceptance</div>
                 </div>
                 <div className="p-6 glass rounded-3xl border-none shadow-premium text-center">
                    <Globe size={24} className="mx-auto mb-3 text-accent-600" />
                    <div className="font-black text-xl">#1</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Innovation</div>
                 </div>
                 <div className="p-6 glass rounded-3xl border-none shadow-premium text-center">
                    <Award size={24} className="mx-auto mb-3 text-emerald-600" />
                    <div className="font-black text-xl">84%</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Employment</div>
                 </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-3xl font-bold">Top Programs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uni.programs.map(program => (
                  <div key={program} className="flex items-center justify-between p-6 glass rounded-2xl border-none shadow-premium group hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                        <BookOpen size={18} className="text-primary-600" />
                      </div>
                      <span className="font-bold">{program}</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-600 transition-all" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="glass p-8 rounded-[2.5rem] border-none shadow-premium space-y-6">
              <h3 className="font-bold text-xl">Admission Chances</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                   <span>Your Match</span>
                   <span className="text-emerald-600">High Match</span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full w-[85%] premium-gradient rounded-full" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Based on your academic profile and interests, you have a strong likelihood of admission to the {uni.programs[0]} program.
                </p>
              </div>
              <button className="w-full py-4 premium-gradient text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 hover:scale-105 transition-all">
                Apply Guidance
              </button>
            </section>

            <section className="bg-slate-900 dark:bg-white p-10 rounded-[3rem] text-white dark:text-slate-900 shadow-2xl space-y-6">
               <div className="w-14 h-14 bg-white/10 dark:bg-slate-100 rounded-2xl flex items-center justify-center text-primary-500">
                  <MessageCircle size={32} />
               </div>
               <h3 className="text-2xl font-bold">Speak with an Alumnus</h3>
               <p className="text-sm opacity-70 leading-relaxed">
                  Connect with current students or alumni from {uni.name} to get firsthand insights into campus life.
               </p>
               <button className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-500 transition-all shadow-xl shadow-primary-600/20">
                  Request Connection
               </button>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
