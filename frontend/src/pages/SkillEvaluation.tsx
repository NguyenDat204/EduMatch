import React, { useState, useEffect } from 'react';
import { Target, ArrowRight, BrainCircuit, Lightbulb, MessageSquare, Briefcase, Users, Loader2, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/api';

const skills = [
  { id: 'analytical',    name: 'Tư duy logic & Phân tích', icon: BrainCircuit,  desc: 'Khả năng phân tích, xâu chuỗi vấn đề và suy luận logic.' },
  { id: 'creative',      name: 'Sáng tạo & Đột phá',       icon: Lightbulb,     desc: 'Nhiều ý tưởng mới lạ, nghĩ ra giải pháp khác biệt.' },
  { id: 'communication', name: 'Giao tiếp & Thấu cảm',     icon: MessageSquare, desc: 'Truyền đạt ý tưởng rõ ràng, lắng nghe hiệu quả.' },
  { id: 'leadership',    name: 'Lãnh đạo & Tổ chức',       icon: Briefcase,     desc: 'Dẫn dắt nhóm, phân công công việc, giải quyết xung đột.' },
  { id: 'technical',     name: 'Kỹ thuật & Công nghệ',     icon: Users,         desc: 'Làm việc tốt với máy tính, công cụ và quy trình kỹ thuật.' },
];

export const SkillEvaluation = () => {
  const { user, isLoading: authLoading, updateUserInState } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess]     = useState(false);

  const [ratings, setRatings] = useState<Record<string, number>>({
    analytical: 3, creative: 3, communication: 3, leadership: 3, technical: 3,
  });

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.skillEvaluation?.scores) {
      const s = user.skillEvaluation.scores;
      setRatings({
        analytical:    Math.max(1, Math.min(5, Math.round((s.analytical    ?? 50) / 20))),
        creative:      Math.max(1, Math.min(5, Math.round((s.creative      ?? 50) / 20))),
        communication: Math.max(1, Math.min(5, Math.round((s.communication ?? 50) / 20))),
        leadership:    Math.max(1, Math.min(5, Math.round((s.leadership    ?? 50) / 20))),
        technical:     Math.max(1, Math.min(5, Math.round((s.technical     ?? 50) / 20))),
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    const dbScores = {
      analytical:    ratings.analytical    * 20,
      creative:      ratings.creative      * 20,
      communication: ratings.communication * 20,
      leadership:    ratings.leadership    * 20,
      technical:     ratings.technical     * 20,
    };
    try {
      const response = await profileService.updateSkillEvaluation(dbScores);
      if (response.success && response.data) {
        if (user) {
          updateUserInState({ ...user, skillEvaluation: { scores: dbScores } });
        }
        setSuccess(true);
        setTimeout(() => navigate('/profile'), 1200);
      }
    } catch (err) {
      console.error('Save skills error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  const starLabels = ['Rất thấp', 'Thấp', 'Trung bình', 'Cao', 'Rất cao'];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <Target size={17} className="text-primary-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Tự đánh giá kỹ năng</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Đánh giá trung thực mức độ kỹ năng (1–5 sao) để AI nhận diện đúng năng lực cốt lõi.
          </p>
        </div>

        {success && (
          <div className="mb-5 p-3.5 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-xl flex items-center gap-2.5 text-sm border border-green-100 dark:border-green-900/30">
            <CheckCircle2 size={16} className="shrink-0" />
            Đã lưu kết quả đánh giá kỹ năng!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-5 shadow-card flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-navy-800 rounded-lg flex items-center justify-center shrink-0">
                    <skill.icon size={15} className="text-slate-600 dark:text-slate-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{skill.name}</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 pl-[42px]">{skill.desc}</p>
              </div>

              {/* Star rating */}
              <div className="flex items-center gap-1.5 shrink-0">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    title={starLabels[star - 1]}
                    onClick={() => setRatings({ ...ratings, [skill.id]: star })}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-base font-bold transition-all ${
                      ratings[skill.id] >= star
                        ? 'bg-amber-400 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-navy-800 text-slate-300 dark:text-slate-600 hover:bg-amber-100 hover:text-amber-400'
                    }`}
                  >
                    ★
                  </button>
                ))}
                <span className="text-xs text-slate-400 ml-1 w-16">
                  {starLabels[ratings[skill.id] - 1]}
                </span>
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm"
            >
              {isLoading ? (
                <><Loader2 size={15} className="animate-spin" /> Đang lưu...</>
              ) : (
                <><span>Hoàn tất đánh giá</span><ArrowRight size={15} /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
