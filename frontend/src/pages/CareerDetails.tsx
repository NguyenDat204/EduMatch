import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  Zap,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts';
import { mockCareers } from '../mock/data';

export const CareerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const career = mockCareers.find(c => c.id === id) || mockCareers[0];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-primary-600 font-bold transition-all group"
        >
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-primary-50">
            <ArrowLeft size={18} />
          </div>
          Back to Explore
        </button>

        <header className="relative p-10 md:p-14 glass rounded-[3.5rem] border-none shadow-premium overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
            <div className="w-24 h-24 md:w-32 md:h-32 premium-gradient rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shrink-0">
               <Sparkles size={48} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                {career.category}
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-black mb-4 leading-tight">{career.title}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-2xl">
                {career.description}
              </p>
            </div>
            <div className="glass p-8 rounded-[2.5rem] border-none shadow-premium text-center min-w-[200px]">
               <div className="text-4xl font-black text-primary-600">95%</div>
               <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Suitability Score</div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 premium-gradient opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Career Metrics */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass p-6 rounded-[2rem] border-none shadow-premium flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4"><DollarSign size={24} /></div>
                <div className="text-lg font-bold">{career.salary}</div>
                <div className="text-xs font-bold text-slate-400 uppercase">Avg. Salary</div>
              </div>
              <div className="glass p-6 rounded-[2rem] border-none shadow-premium flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><TrendingUp size={24} /></div>
                <div className="text-lg font-bold">{career.growth}</div>
                <div className="text-xs font-bold text-slate-400 uppercase">Job Growth</div>
              </div>
              <div className="glass p-6 rounded-[2rem] border-none shadow-premium flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4"><Clock size={24} /></div>
                <div className="text-lg font-bold">Flexible</div>
                <div className="text-xs font-bold text-slate-400 uppercase">Work Life</div>
              </div>
            </section>

            {/* Career Roadmap */}
            <section className="space-y-8">
              <h2 className="text-3xl font-bold">Preparation Roadmap</h2>
              <div className="space-y-6 relative before:absolute before:left-[1.75rem] before:top-4 before:bottom-4 before:w-1 before:bg-slate-100 dark:before:bg-slate-800">
                <div className="relative pl-16 group">
                   <div className="absolute left-0 top-1 w-14 h-14 glass rounded-2xl flex items-center justify-center border-none shadow-premium group-hover:bg-primary-600 group-hover:text-white transition-all">
                      <span className="font-display font-black text-xl">01</span>
                   </div>
                   <div className="glass p-8 rounded-[2rem] border-none shadow-premium">
                      <h4 className="font-bold text-xl mb-2">High School Foundation</h4>
                      <p className="text-slate-500 text-sm leading-relaxed mb-4">Focus on Advanced Mathematics, Physics, and Computer Science electives. Aim for a GPA above 3.8.</p>
                      <div className="flex gap-2">
                         <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold uppercase">Critical</span>
                         <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold uppercase">Academic</span>
                      </div>
                   </div>
                </div>

                <div className="relative pl-16 group">
                   <div className="absolute left-0 top-1 w-14 h-14 glass rounded-2xl flex items-center justify-center border-none shadow-premium group-hover:bg-primary-600 group-hover:text-white transition-all">
                      <span className="font-display font-black text-xl">02</span>
                   </div>
                   <div className="glass p-8 rounded-[2rem] border-none shadow-premium">
                      <h4 className="font-bold text-xl mb-2">Bachelor's Degree</h4>
                      <p className="text-slate-500 text-sm leading-relaxed mb-4">Major in Computer Science or Software Engineering. Join coding clubs and tech communities.</p>
                      <div className="flex justify-between items-center text-xs text-primary-600 font-bold">
                         <span>Recommended Majors: CS, IT, SE</span>
                         <Link to="/universities" className="flex items-center gap-1 hover:underline">Best Unis <ChevronRight size={14}/></Link>
                      </div>
                   </div>
                </div>

                <div className="relative pl-16 group">
                   <div className="absolute left-0 top-1 w-14 h-14 glass rounded-2xl flex items-center justify-center border-none shadow-premium group-hover:bg-primary-600 group-hover:text-white transition-all">
                      <span className="font-display font-black text-xl">03</span>
                   </div>
                   <div className="glass p-8 rounded-[2rem] border-none shadow-premium opacity-50 relative group/pro">
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center glass rounded-[2rem] border-none">
                         <Zap size={24} className="text-amber-500 mb-2" fill="currentColor" />
                         <span className="font-bold text-sm">Unlock with Pro</span>
                      </div>
                      <h4 className="font-bold text-xl mb-2">Specialization & Internships</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">Focus on cloud architecture and distributed systems.</p>
                   </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-10">
            <section className="glass p-8 rounded-[2.5rem] border-none shadow-premium space-y-6">
               <h3 className="font-bold text-xl">Required Skills</h3>
               <div className="space-y-4">
                  {career.skills.map(skill => (
                    <div key={skill} className="flex items-center gap-3">
                       <CheckCircle2 size={18} className="text-primary-600" />
                       <span className="text-sm font-semibold">{skill}</span>
                    </div>
                  ))}
               </div>
               <button className="w-full py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold text-sm hover:bg-primary-600 hover:text-white transition-all">
                  Take Skill Test
               </button>
            </section>

            <section className="premium-gradient p-10 rounded-[2.5rem] text-white shadow-2xl space-y-6">
               <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><Sparkles size={24} /></div>
               <h3 className="text-xl font-bold">Ask AI about this career</h3>
               <p className="text-sm text-primary-50 opacity-80 leading-relaxed">
                  "Is a Software Architect role stressful?" or "What's the best university in Vietnam for this?"
               </p>
               <button onClick={() => navigate('/chat')} className="w-full py-4 bg-white text-primary-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-50 transition-all shadow-xl shadow-black/10">
                  Start Chatting
                  <ArrowRight size={18} />
               </button>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
