import { useState, useEffect, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { CareerCard } from '../components/ui';
import { UniversityCard } from '../components/ui';
import { careerService, universityService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Career, University } from '../types';

const normalizeText = (value?: string) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

const normalizeTitle = normalizeText;

const extractHollandCode = (result: any) => {
  const directCode = String(result?.hollandCode || '').toUpperCase().replace(/[^RIASEC]/g, '');
  if (directCode.length >= 2) return directCode.slice(0, 3);

  const fromArchetype = String(result?.archetype || '').toUpperCase().match(/\b[RIASEC]{2,3}\b/);
  return fromArchetype ? fromArchetype[0] : '';
};

const getLetterWeight = (hollandCode: string, letter: string) => {
  const index = hollandCode.indexOf(letter);
  if (index === 0) return 1;
  if (index === 1) return 0.82;
  if (index === 2) return 0.68;
  return 0.18;
};

const estimateCareerSuitability = (career: Career, hollandCode: string, maxEstimatedScore: number) => {
  if (!hollandCode || maxEstimatedScore <= 0) return undefined;

  const category = normalizeText(career.category);
  const title = normalizeText(career.title);
  const text = `${category} ${title} ${(career.skills || []).map(normalizeText).join(' ')}`;
  const r = getLetterWeight(hollandCode, 'R');
  const i = getLetterWeight(hollandCode, 'I');
  const a = getLetterWeight(hollandCode, 'A');
  const s = getLetterWeight(hollandCode, 'S');
  const e = getLetterWeight(hollandCode, 'E');
  const c = getLetterWeight(hollandCode, 'C');

  let affinity = 0.3;
  if (text.includes('cong nghe') || text.includes('phan mem')) affinity = r * 0.25 + i * 0.45 + c * 0.2 + a * 0.1;
  else if (text.includes('tri tue') || text.includes('ai') || text.includes('du lieu')) affinity = i * 0.6 + r * 0.2 + c * 0.15 + a * 0.05;
  else if (text.includes('dien') || text.includes('vien thong') || text.includes('tu dong') || text.includes('ban dan') || text.includes('oto') || text.includes('hang khong') || text.includes('dong tau')) affinity = r * 0.45 + i * 0.35 + c * 0.15 + e * 0.05;
  else if (text.includes('thiet ke') || text.includes('nghe thuat')) affinity = a * 0.6 + s * 0.2 + i * 0.1 + r * 0.1;
  else if (text.includes('kinh te') || text.includes('kinh doanh') || text.includes('quan ly') || text.includes('marketing') || text.includes('du lich')) affinity = e * 0.5 + s * 0.25 + c * 0.15 + a * 0.1;
  else if (text.includes('luat')) affinity = e * 0.35 + c * 0.3 + s * 0.2 + i * 0.15;
  else if (text.includes('y te') || text.includes('bac si') || text.includes('sinh hoc') || text.includes('thuc pham') || text.includes('nong lam')) affinity = i * 0.45 + s * 0.25 + r * 0.2 + c * 0.1;
  else if (text.includes('giao duc') || text.includes('su pham') || text.includes('xa hoi')) affinity = s * 0.55 + a * 0.2 + e * 0.15 + c * 0.1;
  else if (text.includes('van hoa') || text.includes('lich su') || text.includes('ngon ngu')) affinity = a * 0.4 + s * 0.25 + i * 0.2 + c * 0.15;

  const estimated = Math.round(30 + affinity * 45);
  return Math.max(30, Math.min(maxEstimatedScore, estimated));
};

export const Explore = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab]       = useState<'careers' | 'universities'>('careers');
  const [searchTerm, setSearchTerm]     = useState('');
  const [careers, setCareers]           = useState<Career[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const personalizedResult = useMemo(() => {
    const uid = user?._id || user?.email;
    if (!uid) return { hasResult: false, hollandCode: '', maxScore: 0, maxEstimatedScore: 0, scores: new Map<string, number>() };

    try {
      const cachedRaw = localStorage.getItem(`edumatch_result_cache_${uid}`);
      if (!cachedRaw) return { hasResult: false, hollandCode: '', maxScore: 0, maxEstimatedScore: 0, scores: new Map<string, number>() };

      const cached = JSON.parse(cachedRaw);
      const scores = new Map<string, number>();
      const hollandCode = extractHollandCode(cached);
      let maxScore = Number(cached.suitabilityScore) || 0;
      let minTopScore = maxScore;
      if (Array.isArray(cached.careers)) {
        const careerScores: number[] = [];
        cached.careers.forEach((career: any) => {
          const title = normalizeTitle(career.title);
          const suitability = Number(career.suitability);
          if (title && Number.isFinite(suitability) && suitability > 0) {
            const roundedScore = Math.round(suitability);
            scores.set(title, roundedScore);
            careerScores.push(roundedScore);
            maxScore = Math.max(maxScore, roundedScore);
          }
        });
        const topScores = [...careerScores].sort((a, b) => b - a).slice(0, 5);
        minTopScore = topScores.length ? Math.min(...topScores) : maxScore;
      }

      return {
        hasResult: scores.size > 0 || Number(cached.suitabilityScore) > 0,
        hollandCode,
        maxScore,
        maxEstimatedScore: Math.max(30, minTopScore - 1),
        scores,
      };
    } catch {
      return { hasResult: false, hollandCode: '', maxScore: 0, maxEstimatedScore: 0, scores: new Map<string, number>() };
    }
  }, [user?._id, user?.email]);

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
                careers.map((career) => {
                  const personalizedScore = personalizedResult.scores.get(normalizeTitle(career.title));
                  const suitability = personalizedScore ?? estimateCareerSuitability(
                    career,
                    personalizedResult.hollandCode,
                    personalizedResult.maxEstimatedScore,
                  );

                  return (
                    <CareerCard
                      key={career.id}
                      career={{ ...career, suitability }}
                      showSuitability={personalizedResult.hasResult}
                    />
                  );
                })
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
