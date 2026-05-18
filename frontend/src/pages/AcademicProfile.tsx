import React, { useState, useEffect } from 'react';
import { BookOpen, Calculator, Target, Award, ArrowRight, Loader2, Star } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/api';

export const AcademicProfile = () => {
  const { user, updateUserInState } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('12');
  const [majorInterest, setMajorInterest] = useState('');
  const [subjects, setSubjects] = useState({
    math: 8.0,
    physics: 8.0,
    chemistry: 8.0,
    english: 8.0,
    literature: 8.0,
    biology: 8.0,
    history: 8.0,
    geography: 8.0
  });

  useEffect(() => {
    if (user && user.academicInfo) {
      setSchool(user.academicInfo.school || '');
      setGrade(user.academicInfo.grade || '12');
      setMajorInterest(user.academicInfo.majorInterest || '');
      if (user.academicInfo.subjects) {
        setSubjects({
          math: user.academicInfo.subjects.math ?? 8.0,
          physics: user.academicInfo.subjects.physics ?? 8.0,
          chemistry: user.academicInfo.subjects.chemistry ?? 8.0,
          english: user.academicInfo.subjects.english ?? 8.0,
          literature: user.academicInfo.subjects.literature ?? 8.0,
          biology: user.academicInfo.subjects.biology ?? 8.0,
          history: user.academicInfo.subjects.history ?? 8.0,
          geography: user.academicInfo.subjects.geography ?? 8.0
        });
      }
    }
  }, [user]);

  const handleGradeChange = (key: string, value: number) => {
    setSubjects(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    try {
      const response = await profileService.updateAcademicProfile(
        school,
        grade,
        majorInterest,
        subjects
      );

      if (response.success && response.data) {
        // Sync auth state
        if (user) {
          const updatedUser = {
            ...user,
            academicInfo: {
              school,
              grade,
              majorInterest,
              subjects
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
      console.error("Save academic error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const subjectMeta = [
    { key: 'math', label: 'Toán học' },
    { key: 'physics', label: 'Vật lý' },
    { key: 'chemistry', label: 'Hóa học' },
    { key: 'english', label: 'Tiếng Anh' },
    { key: 'literature', label: 'Ngữ văn' },
    { key: 'biology', label: 'Sinh học' },
    { key: 'history', label: 'Lịch sử' },
    { key: 'geography', label: 'Địa lý' }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-2xl mb-4">
            <BookOpen size={24} />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">Hồ sơ học tập</h1>
          <p className="text-slate-500">Cập nhật kết quả học tập THPT giúp hệ thống AI lập sơ đồ thế mạnh và tối ưu hóa điểm số cho bạn.</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-start gap-3 text-sm font-medium border border-emerald-100 dark:border-emerald-950/30">
            <Star size={18} className="shrink-0 mt-0.5" />
            <span>Đã lưu hồ sơ học tập thành công! Đang chuyển hướng...</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* School & Major */}
          <section className="glass p-8 rounded-[2rem] border-none shadow-premium space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Calculator size={20} className="text-primary-600" /> Thông tin trường lớp
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Trường học</label>
                <input 
                  type="text" 
                  value={school} 
                  onChange={e => setSchool(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Khối lớp</label>
                <select
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                >
                  <option value="10">Lớp 10</option>
                  <option value="11">Lớp 11</option>
                  <option value="12">Lớp 12</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Ngành nghề yêu thích</label>
                <input 
                  type="text" 
                  value={majorInterest} 
                  onChange={e => setMajorInterest(e.target.value)}
                  placeholder="Ví dụ: Công nghệ thông tin"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                />
              </div>
            </div>
          </section>

          {/* Grades Slide Controls */}
          <section className="glass p-8 rounded-[2rem] border-none shadow-premium space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Target size={20} className="text-primary-600" /> Bảng điểm môn học (GPA)
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed uppercase tracking-widest font-black">
              Kéo thanh trượt để cập nhật điểm trung bình môn học hiện tại của bạn
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              {subjectMeta.map(sub => {
                const val = (subjects as any)[sub.key] ?? 8.0;
                return (
                  <div key={sub.key} className="space-y-2 bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{sub.label}</span>
                      <span className="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-lg text-sm font-black tracking-wider">
                        {val.toFixed(1)} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={val}
                      onChange={e => handleGradeChange(sub.key, parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <div className="flex justify-end pt-4">
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
                  Lưu hồ sơ học tập 
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
