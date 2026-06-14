import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
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
        // Case 1: id là MongoDB ObjectId → gọi API bình thường
        if (!id.startsWith('title:')) {
          const response = await careerService.getCareerById(id);
          if (response.success && response.data) {
            setCareer(response.data);
            if (user?.favorites) {
              const hasFavorite = (response.data._id && user.favorites.includes(response.data._id)) || user.favorites.includes(response.data.title);
              setIsSaved(!!hasFavorite);
            }
            setLoading(false);
            return;
          }
        }

        // Case 2: id là "title:<CareerTitle>" (từ AI result không có DB id)
        // Tìm trong DB theo title, và fallback sang AI cache trong localStorage
        const titleParam = id.startsWith('title:') ? decodeURIComponent(id.slice(6)) : id;

        // Thử tìm theo title trong danh sách careers
        try {
          const allRes = await careerService.getCareers();
          if (allRes.success && allRes.data) {
            const matched = allRes.data.find(
              (c: any) => c.title?.toLowerCase() === titleParam.toLowerCase()
            );
            if (matched) {
              setCareer(matched);
              if (user?.favorites) {
                const hasFavorite = (matched._id && user.favorites.includes(matched._id)) || user.favorites.includes(matched.title);
                setIsSaved(!!hasFavorite);
              }
              setLoading(false);
              return;
            }
          }
        } catch { /* ignore — fallback below */ }

        // Fallback: dùng roadmap từ AI result cache trong localStorage
        const uid = user?._id || user?.email || 'anon';
        const cachedRaw = localStorage.getItem(`edumatch_result_cache_${uid}`);
        if (cachedRaw) {
          try {
            const cached = JSON.parse(cachedRaw);
            const aiCareer = (cached.careers || []).find(
              (c: any) => c.title?.toLowerCase() === titleParam.toLowerCase()
            );
            if (aiCareer) {
              setCareer({ ...aiCareer, _id: null });
              setLoading(false);
              return;
            }
          } catch { /* ignore */ }
        }

        // Không tìm được gì → để career = null, UI sẽ hiển thị not found
      } catch (err) {
        console.warn('Failed to load career detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCareer();
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!career || !user) return;
    // AI-only careers (không có DB id) không hỗ trợ favorite
    const targetId = career._id || career.id;
    if (!targetId || id?.startsWith('title:')) {
      return;
    }
    setSaveLoading(true);
    try {
      const response = await careerService.toggleFavorite(targetId);
      if (response.success && response.data) {
        const hasFavorite = response.data.includes(targetId);
        setIsSaved(hasFavorite);
        updateUserInState({ ...user, favorites: response.data });
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

        <header className="relative p-8 md:p-12 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-card overflow-hidden">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="flex-1">
              {career.category && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
                  {career.category}
                </div>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight text-slate-900 dark:text-white">{career.title}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-2xl">
                {career.description}
              </p>
            </div>

            <div className="flex flex-row md:flex-col items-center gap-3 shrink-0">
              <div className="p-5 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40 rounded-2xl text-center min-w-[120px]">
                <div className="text-3xl font-black text-primary-600">{career.suitability || 90}%</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Độ tương thích</div>
              </div>

              <button
                onClick={handleToggleFavorite}
                disabled={saveLoading}
                className={`py-3 px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 border ${
                  isSaved
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 border-slate-200 dark:border-navy-700'
                }`}
              >
                {saveLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Heart size={15} fill={isSaved ? "currentColor" : "none"} />
                )}
                {isSaved ? 'Đã lưu' : 'Lưu nghề nghiệp'}
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Career Metrics */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-5 rounded-2xl shadow-card flex flex-col items-center text-center">
                <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl flex items-center justify-center mb-3"><DollarSign size={20} /></div>
                <div className="text-base font-bold text-slate-900 dark:text-white">{career.salary}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Mức lương TB</div>
              </div>
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-5 rounded-2xl shadow-card flex flex-col items-center text-center">
                <div className="w-11 h-11 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl flex items-center justify-center mb-3"><TrendingUp size={20} /></div>
                <div className="text-base font-bold text-slate-900 dark:text-white">{career.growth}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Tiềm năng tăng trưởng</div>
              </div>
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-5 rounded-2xl shadow-card flex flex-col items-center text-center">
                <div className="w-11 h-11 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-xl flex items-center justify-center mb-3"><Clock size={20} /></div>
                <div className="text-base font-bold text-slate-900 dark:text-white">Linh hoạt</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Cân bằng cuộc sống</div>
              </div>
            </section>

            {/* Preparation Roadmap */}
            <section className="space-y-5">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Lộ trình học tập & Phát triển</h2>
              <div className="space-y-4 relative before:absolute before:left-[1.6rem] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100 dark:before:bg-navy-700">
                {career.roadmap && career.roadmap.length > 0 ? (
                  career.roadmap.map((step: any, index: number) => (
                    <div key={index} className="relative pl-14">
                      <div className="absolute left-0 top-1 w-12 h-12 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl flex items-center justify-center font-bold text-base text-slate-600 dark:text-slate-300 shadow-sm">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-6 rounded-2xl shadow-card">
                        <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest block mb-1">{step.phase} ({step.duration})</span>
                        <h4 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{step.title}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-3">{step.description}</p>
                        {step.skillsToAcquire && step.skillsToAcquire.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {step.skillsToAcquire.map((s: string) => (
                              <span key={s} className="px-2.5 py-1 bg-slate-50 dark:bg-navy-800 border border-slate-100 dark:border-navy-700 rounded-lg text-[10px] font-semibold text-slate-500">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="relative pl-14">
                    <div className="absolute left-0 top-1 w-12 h-12 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl flex items-center justify-center font-bold text-base text-slate-600 dark:text-slate-300 shadow-sm">
                      01
                    </div>
                    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-6 rounded-2xl shadow-card">
                      <h4 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">High School Foundation</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">Focus on Advanced Mathematics, Physics, and Computer Science electives. Aim for a high GPA.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-10">
            <section className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-6 rounded-2xl shadow-card space-y-5">
               <h3 className="font-bold text-base text-slate-900 dark:text-white">Required Skills</h3>
               <div className="space-y-3">
                  {(career.skills || []).map((skill: string) => (
                    <div key={skill} className="flex items-center gap-3">
                       <CheckCircle2 size={16} className="text-primary-600 shrink-0" />
                       <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{skill}</span>
                    </div>
                  ))}
               </div>
               <button onClick={() => navigate('/skill-evaluation')} className="w-full py-2.5 bg-slate-100 dark:bg-navy-800 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 hover:bg-primary-600 hover:text-white transition-all">
                  Take Skill Test
               </button>
            </section>

            <section className="bg-primary-600 p-6 rounded-2xl text-white shadow-lg space-y-4">
               <h3 className="text-base font-bold">Hỏi AI Tư vấn về ngành này</h3>
               <p className="text-sm text-primary-100 leading-relaxed">
                  "Học ngành này có khó xin việc không?", "Lương thực tập là bao nhiêu?"
               </p>
               <button onClick={() => navigate('/chat')} className="w-full py-2.5 bg-white text-primary-600 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-50 transition-all">
                  Hỏi AI ngay
                  <ArrowRight size={15} />
               </button>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
