import React, { useState } from 'react';
import { Target, ArrowRight, BrainCircuit, Users, Lightbulb, MessageSquare, Briefcase } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { useNavigate } from 'react-router-dom';

const skills = [
  { id: 'logic', name: 'Tư duy logic', icon: BrainCircuit, description: 'Khả năng phân tích, xâu chuỗi vấn đề và suy luận logic.' },
  { id: 'creative', name: 'Sáng tạo', icon: Lightbulb, description: 'Nhiều ý tưởng mới lạ, nghĩ ra giải pháp khác biệt.' },
  { id: 'communication', name: 'Giao tiếp', icon: MessageSquare, description: 'Truyền đạt ý tưởng rõ ràng, trình bày tốt, lắng nghe hiệu quả.' },
  { id: 'leadership', name: 'Lãnh đạo', icon: Briefcase, description: 'Khả năng dẫn dắt nhóm, phân công công việc, giải quyết xung đột.' },
  { id: 'teamwork', name: 'Làm việc nhóm', icon: Users, description: 'Phối hợp tốt với người khác, sẵn sàng hỗ trợ đồng đội.' },
];

export const SkillEvaluation = () => {
  const [ratings, setRatings] = useState<Record<string, number>>({
    logic: 3,
    creative: 3,
    communication: 3,
    leadership: 3,
    teamwork: 3
  });
  const navigate = useNavigate();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/profile');
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl mb-4">
            <Target size={24} />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">Tự đánh giá kỹ năng</h1>
          <p className="text-slate-500">Đánh giá trung thực mức độ kỹ năng của bạn (từ 1 đến 5 sao) để phần mềm nhận diện đúng năng lực cốt lõi bổ trợ cho lựa chọn ngành nghề.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {skills.map(skill => (
            <div key={skill.id} className="glass p-6 md:p-8 rounded-[2rem] border-none shadow-premium flex flex-col md:flex-row md:items-center gap-6">
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
            <button type="submit" className="flex items-center gap-2 px-8 py-4 premium-gradient text-white rounded-2xl font-bold shadow-xl shadow-primary-500/20 hover:scale-[1.02] transition-transform">
              Hoàn tất đánh giá <ArrowRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
