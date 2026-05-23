import React, { useState, useEffect } from 'react';
import { BookOpen, Calculator, Target, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/api';

const subjectMeta = [
  { key: 'math',       label: 'Toán học' },
  { key: 'physics',    label: 'Vật lý' },
  { key: 'chemistry',  label: 'Hóa học' },
  { key: 'english',    label: 'Tiếng Anh' },
  { key: 'literature', label: 'Ngữ văn' },
  { key: 'biology',    label: 'Sinh học' },
  { key: 'history',    label: 'Lịch sử' },
  { key: 'geography',  label: 'Địa lý' },
];

export const AcademicProfile = () => {
  const { user, updateUserInState } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess]     = useState(false);

  const [school, setSchool]               = useState('');
  const [grade, setGrade]                 = useState('12');
  const [majorInterest, setMajorInterest] = useState('');
  const [subjects, setSubjects] = useState({
    math: 8.0, physics: 8.0, chemistry: 8.0, english: 8.0,
    literature: 8.0, biology: 8.0, history: 8.0, geography: 8.0,
  });

  useEffect(() => {
    if (user?.academicInfo) {
      setSchool(user.academicInfo.school || '');
      setGrade(user.academicInfo.grade || '12');
      setMajorInterest(user.academicInfo.majorInterest || '');
      if (user.academicInfo.subjects) {
        setSubjects({
          math:       user.academicInfo.subjects.math       ?? 8.0,
          physics:    user.academicInfo.subjects.physics    ?? 8.0,
          chemistry:  user.academicInfo.subjects.chemistry  ?? 8.0,
          english:    user.academicInfo.subjects.english    ?? 8.0,
          literature: user.academicInfo.subjects.literature ?? 8.0,
          biology:    user.academicInfo.subjects.biology    ?? 8.0,
          history:    user.academicInfo.subjects.history    ?? 8.0,
          geography:  user.academicInfo.subjects.geography  ?? 8.0,
        });
      }
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    try {
      const response = await profileService.updateAcademicProfile(school, grade, majorInterest, subjects);
      if (response.success && response.data) {
        if (user) {
          updateUserInState({ ...user, academicInfo: { school, grade, majorInterest, subjects } });
        }
        setSuccess(true);
        setTimeout(() => navigate('/profile'), 1200);
      }
    } catch (err) {
      console.error('Save academic error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (val: number) => {
    if (val >= 8.5) return 'text-green-600 dark:text-green-400';
    if (val >= 6.5) return 'text-primary-600 dark:text-primary-400';
    return 'text-amber-600 dark:text-amber-400';
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <BookOpen size={17} className="text-primary-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Hồ sơ học tập</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cập nhật kết quả học tập để AI phân tích chính xác hơn.
          </p>
        </div>

        {success && (
          <div className="mb-5 p-3.5 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-xl flex items-center gap-2.5 text-sm border border-green-100 dark:border-green-900/30">
            <CheckCircle2 size={16} className="shrink-0" />
            Đã lưu hồ sơ học tập thành công!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* School Info */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-5 shadow-card">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Calculator size={15} className="text-primary-600" />
              Thông tin trường lớp
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">Trường học</label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="THPT Phan Đình Phùng"
                  className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">Khối lớp</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="10">Lớp 10</option>
                  <option value="11">Lớp 11</option>
                  <option value="12">Lớp 12</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">Ngành yêu thích</label>
                <input
                  type="text"
                  value={majorInterest}
                  onChange={(e) => setMajorInterest(e.target.value)}
                  placeholder="Công nghệ thông tin"
                  className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Grades */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-5 shadow-card">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Target size={15} className="text-primary-600" />
              Điểm trung bình các môn
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjectMeta.map((sub) => {
                const val = (subjects as any)[sub.key] ?? 8.0;
                return (
                  <div key={sub.key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{sub.label}</span>
                      <span className={`text-sm font-bold ${getScoreColor(val)}`}>
                        {val.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={val}
                      onChange={(e) =>
                        setSubjects((prev) => ({ ...prev, [sub.key]: parseFloat(e.target.value) }))
                      }
                      className="w-full h-1.5 bg-slate-200 dark:bg-navy-700 rounded-full appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm"
            >
              {isLoading ? (
                <><Loader2 size={15} className="animate-spin" /> Đang lưu...</>
              ) : (
                <><span>Lưu hồ sơ</span><ArrowRight size={15} /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
