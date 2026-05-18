import React, { useState, useEffect } from 'react';
import { Target, ArrowRight, BrainCircuit, Users, Lightbulb, MessageSquare, Briefcase, Loader2, Star } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/api';

const skills = [
  { id: 'analytical', name: 'Tư duy logic & Phân tích', icon: BrainCircuit, description: 'Khả năng phân tích, xâu chuỗi vấn đề và suy luận logic.' },
  { id: 'creative', name: 'Sáng tạo & Đột phá', icon: Lightbulb, description: 'Nhiều ý tưởng mới lạ, nghĩ ra giải pháp khác biệt.' },
  { id: 'communication', name: 'Giao tiếp & Thấu cảm', icon: MessageSquare, description: 'Truyền đạt ý tưởng rõ ràng, trình bày tốt, lắng nghe hiệu quả.' },
  { id: 'leadership', name: 'Lãnh đạo & Tổ chức', icon: Briefcase, description: 'Khả năng dẫn dắt nhóm, phân công công việc, giải quyết xung đột.' },
  { id: 'technical', name: 'Kỹ thuật & Công nghệ', icon: Users, description: 'Khả năng làm việc tốt với máy tính, công cụ và quy trình kỹ thuật.' },
];

export const SkillEvaluation = () => {
  const { user, isLoading: authLoading, updateUserInState } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [ratings, setRatings] = useState<Record<string, number>>({
    analytical: 3,
    creative: 3,
    communication: 3,
    leadership: 3,
    technical: 3
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && user.skillEvaluation && user.skillEvaluation.scores) {
      const scores = user.skillEvaluation.scores;
      // Convert 0-100 scores from database back into 1-5 star ratings
      setRatings({
        analytical: Math.max(1, Math.min(5, Math.round((scores.analytical ?? 50) / 20))),
        creative: Math.max(1, Math.min(5, Math.round((scores.creative ?? 50) / 20))),
        communication: Math.max(1, Math.min(5, Math.round((scores.communication ?? 50) / 20))),
        leadership: Math.max(1, Math.min(5, Math.round((scores.leadership ?? 50) / 20))),
        technical: Math.max(1, Math.min(5, Math.round((scores.technical ?? 50) / 20))),
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    // Convert 1-5 ratings back to 0-100 scores
    const dbScores = {
      analytical: ratings.analytical * 20,
      creative: ratings.creative * 20,
      communication: ratings.communication * 20,
      leadership: ratings.leadership * 20,
      technical: ratings.technical * 20,
    };

    try {
      const response = await profileService.updateSkillEvaluation(dbScores);
      if (response.success && response.data) {
        // Sync context
        if (user) {
          const updatedUser = {
            ...user,
            skillEvaluation: {
              scores: dbScores,
              updatedAt: new Date()
            }
          };
          updateUserInState(updatedUser);
        }
        setSuccess(true);
        setTimeout(() => {
          navigate('/profile');
        }, 1200);
      }
    } catch (err) {
      console.error("Save skills error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 premium-gradient rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-2xl mb-4">
            <Target size={24} />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">Tự đánh giá kỹ năng</h1>
          <p className="text-slate-500">Đánh giá trung thực mức độ kỹ năng của bạn (từ 1 đến 5 sao) để phần mềm nhận diện đúng năng lực cốt lõi bổ trợ cho lựa chọn ngành nghề.</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-start gap-3 text-sm font-medium border border-emerald-100 dark:border-emerald-950/30 animate-fade-in">
            <Star size={18} className="shrink-0 mt-0.5 animate-spin" />
            <span>Đã lưu kết quả đánh giá kỹ năng! Đang chuyển hướng...</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {skills.map(skill => (
            <div key={skill.id} className="glass p-6 md:p-8 rounded-[2rem] border-none shadow-premium flex flex-col md:flex-row md:items-center gap-6 animate-slide-up">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                    <skill.icon size={20} />
                  </div>
                  <h3 className="text-lg font-bold">{skill.name}</h3>
                </div>
                <p className="text-sm text-slate-500 pl-[44px]">{skill.description}</p>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl w-fit xl:ml-auto">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRatings({...ratings, [skill.id]: star})}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${
                      ratings[skill.id] >= star
                        ? 'bg-amber-400 text-white shadow-md shadow-amber-400/30 rotate-[360deg]'
                        : 'bg-white dark:bg-slate-700 text-slate-300 hover:bg-amber-100 hover:text-amber-400'
                    }`}
                    style={{ transitionDuration: '500ms' }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-6">
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-4 premium-gradient text-white rounded-2xl font-bold shadow-xl shadow-primary-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  Hoàn tất đánh giá 
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
