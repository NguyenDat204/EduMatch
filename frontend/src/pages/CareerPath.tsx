import {
  ArrowLeft, Map, Briefcase, GraduationCap, Award, Star,
  Clock, ChevronDown, ChevronUp, Loader2, CheckCircle2,
  TrendingUp, Sparkles, ArrowRight, BookOpen, Layers,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts';
import { useParams, useNavigate } from 'react-router-dom';
import { careerService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

// ── Mỗi giai đoạn dùng 1 bộ màu nhất quán, dễ đọc trên nền trắng/tối ──
const PHASE_CONFIG = [
  {
    step: '01',
    dotBg: 'bg-indigo-500',
    dotRing: 'ring-indigo-100 dark:ring-indigo-900/60',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    skillBg: 'bg-indigo-50 dark:bg-indigo-950/30',
    skillText: 'text-indigo-700 dark:text-indigo-300',
    skillBorder: 'border-indigo-100 dark:border-indigo-900/40',
    barColor: 'bg-indigo-500',
  },
  {
    step: '02',
    dotBg: 'bg-emerald-500',
    dotRing: 'ring-emerald-100 dark:ring-emerald-900/60',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    skillBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    skillText: 'text-emerald-700 dark:text-emerald-300',
    skillBorder: 'border-emerald-100 dark:border-emerald-900/40',
    barColor: 'bg-emerald-500',
  },
  {
    step: '03',
    dotBg: 'bg-amber-500',
    dotRing: 'ring-amber-100 dark:ring-amber-900/60',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    iconText: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    skillBg: 'bg-amber-50 dark:bg-amber-950/30',
    skillText: 'text-amber-700 dark:text-amber-300',
    skillBorder: 'border-amber-100 dark:border-amber-900/40',
    barColor: 'bg-amber-500',
  },
  {
    step: '04',
    dotBg: 'bg-rose-500',
    dotRing: 'ring-rose-100 dark:ring-rose-900/60',
    iconBg: 'bg-rose-50 dark:bg-rose-950/40',
    iconText: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    skillBg: 'bg-rose-50 dark:bg-rose-950/30',
    skillText: 'text-rose-700 dark:text-rose-300',
    skillBorder: 'border-rose-100 dark:border-rose-900/40',
    barColor: 'bg-rose-500',
  },
];

const PHASE_ICONS = [GraduationCap, Briefcase, Award, Star];

const FALLBACK_ROADMAP = [
  {
    phase: 'Giai đoạn 1', title: 'Xây dựng nền tảng', duration: 'Năm 1 – 2 Đại học',
    description: 'Nắm vững kiến thức cốt lõi của ngành, tham gia câu lạc bộ chuyên môn, kết nối với mentor và cộng đồng học thuật.',
    skillsToAcquire: ['Kiến thức nền tảng', 'Tư duy phân tích', 'Networking'],
  },
  {
    phase: 'Giai đoạn 2', title: 'Tích lũy kinh nghiệm', duration: 'Năm 3 – 4 Đại học',
    description: 'Thực tập doanh nghiệp, tham gia dự án thực chiến, xây dựng portfolio cá nhân ấn tượng để cạnh tranh trên thị trường.',
    skillsToAcquire: ['Kinh nghiệm thực tế', 'Xây dựng portfolio', 'Kỹ năng mềm'],
  },
  {
    phase: 'Giai đoạn 3', title: 'Phát triển chuyên sâu', duration: '1 – 3 năm đầu đi làm',
    description: 'Rèn luyện chuyên môn theo chiều sâu, học hỏi từ đồng nghiệp Senior, xây dựng thương hiệu cá nhân trong ngành.',
    skillsToAcquire: ['Chuyên môn nâng cao', 'Quản lý dự án', 'Giao tiếp kỹ thuật'],
  },
  {
    phase: 'Giai đoạn 4', title: 'Trở thành chuyên gia', duration: '3+ năm kinh nghiệm',
    description: 'Dẫn dắt nhóm và dự án lớn, mentoring thành viên mới, đóng góp chiến lược và xây dựng uy tín trong lĩnh vực.',
    skillsToAcquire: ['Tư duy chiến lược', 'Mentoring', 'Leadership'],
  },
];

export const CareerPath = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [career, setCareer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number>(0);

  useEffect(() => {
    if (!id) { setLoading(false); return; }

    const load = async () => {
      try {
        if (!id.startsWith('title:')) {
          const res = await careerService.getCareerById(id);
          if (res.success && res.data) { setCareer(res.data); setLoading(false); return; }
        }
        const titleParam = id.startsWith('title:') ? decodeURIComponent(id.slice(6)) : id;
        try {
          const allRes = await careerService.getCareers();
          if (allRes.success) {
            const matched = allRes.data.find((c: any) =>
              c.title?.toLowerCase() === titleParam.toLowerCase()
            );
            if (matched) { setCareer(matched); setLoading(false); return; }
          }
        } catch { /* ignore */ }
        const uid = user?._id || user?.email || 'anon';
        const raw = localStorage.getItem(`edumatch_result_cache_${uid}`);
        if (raw) {
          const cached = JSON.parse(raw);
          const aiCareer = (cached.careers || []).find(
            (c: any) => c.title?.toLowerCase() === titleParam.toLowerCase()
          );
          if (aiCareer) { setCareer({ ...aiCareer, _id: null }); setLoading(false); return; }
        }
      } catch (err) {
        console.warn('CareerPath load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  const roadmap: any[] = career?.roadmap?.length > 0 ? career.roadmap : FALLBACK_ROADMAP;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-40">
          <Loader2 className="animate-spin text-indigo-500" size={36} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto pb-16 space-y-6 animate-fade-in">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors text-sm font-medium group"
        >
          <span className="w-8 h-8 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg flex items-center justify-center shadow-sm group-hover:border-slate-300 transition-colors">
            <ArrowLeft size={15} />
          </span>
          Quay lại
        </button>

        {/* ── Hero card ── */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl shadow-card overflow-hidden">
          {/* Top colour bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400" />
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center shrink-0">
                <Map size={22} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-indigo-500 mb-1.5">
                  Lộ trình phát triển
                </span>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-snug mb-2">
                  {career?.title || 'Lộ trình nghề nghiệp'}
                </h1>
                {career?.description && (
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    {career.description}
                  </p>
                )}
              </div>
            </div>

            {/* Meta tags */}
            {career && (
              <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-slate-100 dark:border-navy-700">
                {career.salary && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <TrendingUp size={12} className="text-emerald-500" /> {career.salary}
                  </span>
                )}
                {career.growth && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <Star size={12} className="text-amber-500" /> {career.growth}
                  </span>
                )}
                {career.category && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <Briefcase size={12} className="text-indigo-500" /> {career.category}
                  </span>
                )}
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <Layers size={12} className="text-violet-500" /> {roadmap.length} giai đoạn
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Progress tracker ── */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-5 shadow-card">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tiến trình lộ trình</p>
          <div className="flex gap-2">
            {roadmap.map((_: any, i: number) => {
              const cfg = PHASE_CONFIG[i % PHASE_CONFIG.length];
              const isActive = openIndex === i;
              return (
                <button
                  key={i}
                  onClick={() => setOpenIndex(i)}
                  className="flex-1 group"
                  title={roadmap[i]?.title}
                >
                  <div className={cn(
                    'h-2 rounded-full transition-all duration-200',
                    cfg.barColor,
                    isActive ? 'opacity-100' : 'opacity-25 group-hover:opacity-50'
                  )} />
                  <p className={cn(
                    'text-center text-[10px] font-bold mt-1.5 transition-colors',
                    isActive ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'
                  )}>
                    {i + 1}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Timeline list ── */}
        <div className="space-y-3">
          {roadmap.map((step: any, index: number) => {
            const cfg = PHASE_CONFIG[index % PHASE_CONFIG.length];
            const PhaseIcon = PHASE_ICONS[index % PHASE_ICONS.length];
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={cn(
                  'bg-white dark:bg-navy-900 border rounded-2xl shadow-card overflow-hidden transition-all duration-200',
                  isOpen
                    ? 'border-slate-300 dark:border-navy-600 shadow-md'
                    : 'border-slate-200 dark:border-navy-700'
                )}
              >
                {/* Card header — always visible */}
                <button
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                >
                  {/* Step icon */}
                  <div className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                    isOpen ? `${cfg.iconBg}` : 'bg-slate-100 dark:bg-navy-800'
                  )}>
                    <PhaseIcon size={18} className={isOpen ? cfg.iconText : 'text-slate-400 dark:text-slate-500'} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Phase label + duration */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={cn(
                        'text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md',
                        isOpen ? `${cfg.badgeBg} ${cfg.badgeText}` : 'bg-slate-100 dark:bg-navy-800 text-slate-500'
                      )}>
                        {step.phase || `Giai đoạn ${index + 1}`}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Clock size={10} />
                        {step.duration}
                      </span>
                    </div>
                    {/* Title */}
                    <h3 className={cn(
                      'font-bold text-[15px] leading-snug transition-colors',
                      isOpen ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                    )}>
                      {step.title}
                    </h3>
                  </div>

                  {/* Toggle icon */}
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    isOpen ? `${cfg.iconBg} ${cfg.iconText}` : 'text-slate-400'
                  )}>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Expanded body */}
                {isOpen && (
                  <div className="px-5 pb-5 space-y-4 border-t border-slate-100 dark:border-navy-700">
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed pt-4">
                      {step.description}
                    </p>

                    {step.skillsToAcquire?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-500" />
                          Kỹ năng cần đạt được
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {step.skillsToAcquire.map((skill: string) => (
                            <span
                              key={skill}
                              className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border',
                                cfg.skillBg, cfg.skillText, cfg.skillBorder
                              )}
                            >
                              <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Nav to next phase */}
                    {index < roadmap.length - 1 && (
                      <button
                        onClick={() => setOpenIndex(index + 1)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors mt-1"
                      >
                        Xem giai đoạn tiếp theo
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-5 shadow-card flex flex-col sm:flex-row items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles size={19} className="text-indigo-500" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-bold text-slate-900 dark:text-white text-sm">Muốn tìm hiểu sâu hơn?</p>
            <p className="text-slate-500 text-xs mt-0.5">AI Advisor sẵn sàng trả lời mọi câu hỏi về lộ trình và ngành nghề này.</p>
          </div>
          <button
            onClick={() => navigate('/chat')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm whitespace-nowrap"
          >
            <BookOpen size={14} />
            Hỏi AI ngay
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
};
