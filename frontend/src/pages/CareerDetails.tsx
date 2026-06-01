import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Heart,
  Loader2
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts';
import { useAuth } from '../hooks/useAuth';
import { careerService } from '../services/api';

export const CareerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUserInState } = useAuth();
  
  const [career, setCareer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchCareer = async () => {
      if (!id) return;
      try {
        const response = await careerService.getCareerById(id);
        if (response.success && response.data) {
          setCareer(response.data);
          
          // Check if already in student's favorites list
          if (user && user.favorites) {
            const hasFavorite = response.data._id && user.favorites.includes(response.data._id) || user.favorites.includes(response.data.title);
            setIsSaved(!!hasFavorite);
          }
        } else {
          console.warn('Career API returned no data for id', id);
        }
      } catch (err) {
        console.warn('Failed to load career detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCareer();
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!id || !career || !user) return;
    setSaveLoading(true);
    try {
      // Send career ID or title
      const targetId = career._id || career.id || id;
      const response = await careerService.toggleFavorite(targetId);
      if (response.success && response.data) {
        // Update local state and auth context array
        const hasFavorite = response.data.includes(targetId);
        setIsSaved(hasFavorite);
        updateUserInState({
          ...user,
          favorites: response.data
        });
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-40">
          <Loader2 className="animate-spin text-primary-600" size={40} />
        </div>
      </DashboardLayout>
    );
  }

  if (!career) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-slate-500">Không tìm thấy thông tin ngành nghề này.</p>
          <button onClick={() => navigate('/explore')} className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg">Quay lại</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-fade-in">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-primary-600 font-bold transition-all group"
        >
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-primary-50">
            <ArrowLeft size={18} />
          </div>
          Khám phá ngành nghề
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
              <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed max-w-2xl">
                {career.description}
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div className="glass p-6 rounded-[2.5rem] border-none shadow-premium text-center min-w-[160px]">
                 <div className="text-4xl font-black text-primary-600">{career.suitability || 90}%</div>
                 <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Độ tương thích</div>
              </div>
              
              <button
                onClick={handleToggleFavorite}
                disabled={saveLoading}
                className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                  isSaved 
                    ? 'bg-red-500 text-white shadow-red-500/20' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 border border-slate-100 dark:border-slate-700'
                }`}
              >
                {saveLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
                )}
                {isSaved ? 'Đã lưu nghề nghiệp' : 'Lưu nghề nghiệp'}
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 premium-gradient opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Career Metrics */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass p-6 rounded-[2rem] border-none shadow-premium flex flex-col items-center text-center bg-white dark:bg-slate-900">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl flex items-center justify-center mb-4"><DollarSign size={24} /></div>
                <div className="text-lg font-bold">{career.salary}</div>
                <div className="text-xs font-bold text-slate-400 uppercase">Mức lương TB</div>
              </div>
              <div className="glass p-6 rounded-[2rem] border-none shadow-premium flex flex-col items-center text-center bg-white dark:bg-slate-900">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl flex items-center justify-center mb-4"><TrendingUp size={24} /></div>
                <div className="text-lg font-bold">{career.growth}</div>
                <div className="text-xs font-bold text-slate-400 uppercase">Tiềm năng tăng trưởng</div>
              </div>
              <div className="glass p-6 rounded-[2rem] border-none shadow-premium flex flex-col items-center text-center bg-white dark:bg-slate-900">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-xl flex items-center justify-center mb-4"><Clock size={24} /></div>
                <div className="text-lg font-bold">Linh hoạt</div>
                <div className="text-xs font-bold text-slate-400 uppercase">Cân bằng cuộc sống</div>
              </div>
            </section>

            {/* Preparation Roadmap */}
            <section className="space-y-8">
              <h2 className="text-3xl font-bold">Lộ trình học tập & Phát triển</h2>
              <div className="space-y-6 relative before:absolute before:left-[1.75rem] before:top-4 before:bottom-4 before:w-1 before:bg-slate-100 dark:before:bg-slate-800">
                {career.roadmap && career.roadmap.length > 0 ? (
                  career.roadmap.map((step: any, index: number) => (
                    <div key={index} className="relative pl-16 group">
                      <div className="absolute left-0 top-1 w-14 h-14 glass rounded-2xl flex items-center justify-center border-none shadow-premium group-hover:bg-primary-600 group-hover:text-white transition-all bg-white dark:bg-slate-900 font-display font-black text-xl">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="glass p-8 rounded-[2rem] border-none shadow-premium bg-white dark:bg-slate-900">
                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest block mb-1">{step.phase} ({step.duration})</span>
                        <h4 className="font-bold text-xl mb-2">{step.title}</h4>
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">{step.description}</p>
                        {step.skillsToAcquire && step.skillsToAcquire.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {step.skillsToAcquire.map((s: string) => (
                              <span key={s} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-[10px] font-bold uppercase text-slate-500 border border-slate-100 dark:border-slate-800">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="relative pl-16 group">
                      <div className="absolute left-0 top-1 w-14 h-14 glass rounded-2xl flex items-center justify-center border-none shadow-premium group-hover:bg-primary-600 group-hover:text-white transition-all bg-white dark:bg-slate-900 font-display font-black text-xl">
                        01
                      </div>
                      <div className="glass p-8 rounded-[2rem] border-none shadow-premium bg-white dark:bg-slate-900">
                        <h4 className="font-bold text-xl mb-2">High School Foundation</h4>
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">Focus on Advanced Mathematics, Physics, and Computer Science electives. Aim for a high GPA.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-10">
            <section className="glass p-8 rounded-[2.5rem] border-none shadow-premium space-y-6 bg-white dark:bg-slate-900">
               <h3 className="font-bold text-xl">Required Skills</h3>
               <div className="space-y-4">
                  {(career.skills || []).map((skill: string) => (
                    <div key={skill} className="flex items-center gap-3">
                       <CheckCircle2 size={18} className="text-primary-600" />
                       <span className="text-sm font-semibold">{skill}</span>
                    </div>
                  ))}
               </div>
               <button onClick={() => navigate('/skill-evaluation')} className="w-full py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold text-sm hover:bg-primary-600 hover:text-white transition-all">
                  Take Skill Test
               </button>
            </section>

            <section className="premium-gradient p-10 rounded-[2.5rem] text-white shadow-2xl space-y-6">
               <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><Sparkles size={24} /></div>
               <h3 className="text-xl font-bold">Hỏi AI Advisor về ngành này</h3>
               <p className="text-sm text-primary-50 opacity-80 leading-relaxed">
                  "Học ngành này có khó xin việc không?", "Lương thực tập là bao nhiêu?", "Trường nào đào tạo tốt nhất ở VN?"
               </p>
               <button onClick={() => navigate('/chat')} className="w-full py-4 bg-white text-primary-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-50 transition-all shadow-xl shadow-black/10">
                  Hỏi AI ngay
                  <ArrowRight size={18} />
               </button>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
