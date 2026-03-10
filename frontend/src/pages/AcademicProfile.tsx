import React, { useState } from 'react';
import { BookOpen, Calculator, Target, Award, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { useNavigate } from 'react-router-dom';

export const AcademicProfile = () => {
  const [formData, setFormData] = useState({
    gpa: '',
    favoriteSubjects: [] as string[],
    weakSubjects: [] as string[],
    examCombination: ''
  });
  const navigate = useNavigate();

  const subjects = ['Toán', 'Vật lý', 'Hóa học', 'Sinh học', 'Ngữ văn', 'Lịch sử', 'Địa lý', 'Tiếng Anh', 'Tin học'];
  const combinations = ['A00 (Toán, Lý, Hóa)', 'A01 (Toán, Lý, Anh)', 'B00 (Toán, Hóa, Sinh)', 'C00 (Văn, Sử, Địa)', 'D01 (Toán, Văn, Anh)'];

  const toggleSubject = (type: 'favorite' | 'weak', subject: string) => {
    setFormData(prev => {
      const list = type === 'favorite' ? prev.favoriteSubjects : prev.weakSubjects;
      if (list.includes(subject)) {
        return { ...prev, [type === 'favorite' ? 'favoriteSubjects' : 'weakSubjects']: list.filter(item => item !== subject) };
      }
      return { ...prev, [type === 'favorite' ? 'favoriteSubjects' : 'weakSubjects']: [...list, subject] };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    navigate('/profile');
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl mb-4">
            <BookOpen size={24} />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">Hồ sơ học tập</h1>
          <p className="text-slate-500">Cập nhật thông tin học tập của bạn để AI có thể phân tích và đề xuất ngành học phù hợp nhất.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* GPA */}
          <section className="glass p-8 rounded-[2rem] border-none shadow-premium">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
              <Calculator size={20} className="text-primary-600" /> Điểm trung bình (GPA)
            </h2>
            <div className="max-w-xs">
              <label className="text-sm font-bold text-slate-700 block mb-2">Điểm tổng kết năm trước</label>
              <input 
                type="number" 
                step="0.1" 
                min="0" 
                max="10" 
                required
                value={formData.gpa}
                onChange={e => setFormData({...formData, gpa: e.target.value})}
                placeholder="Ví dụ: 8.5"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </section>

          {/* Subjects */}
          <section className="glass p-8 rounded-[2rem] border-none shadow-premium">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
              <Target size={20} className="text-primary-600" /> Môn học
            </h2>
            
            <div className="space-y-8">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-3">Môn học yêu thích / Thế mạnh</label>
                <div className="flex flex-wrap gap-3">
                  {subjects.map(subject => (
                    <button
                      type="button"
                      key={`fav-${subject}`}
                      onClick={() => toggleSubject('favorite', subject)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        formData.favoriteSubjects.includes(subject)
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-3">Môn học cảm thấy yếu / Không thích</label>
                <div className="flex flex-wrap gap-3">
                  {subjects.map(subject => (
                    <button
                      type="button"
                      key={`weak-${subject}`}
                      onClick={() => toggleSubject('weak', subject)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        formData.weakSubjects.includes(subject)
                          ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Exam Combination */}
          <section className="glass p-8 rounded-[2rem] border-none shadow-premium">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
              <Award size={20} className="text-primary-600" /> Tổ hợp xét tuyển dự kiến
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {combinations.map(combo => (
                <button
                  type="button"
                  key={combo}
                  onClick={() => setFormData({...formData, examCombination: combo})}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    formData.examCombination === combo
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 font-bold shadow-md shadow-primary-500/10'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-300'
                  }`}
                >
                  {combo}
                </button>
              ))}
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <button type="submit" className="flex items-center gap-2 px-8 py-4 premium-gradient text-white rounded-2xl font-bold shadow-xl shadow-primary-500/20 hover:scale-[1.02] transition-transform">
              Lưu hồ sơ học tập <ArrowRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
