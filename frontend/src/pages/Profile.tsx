import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Mail, GraduationCap, Star, Save, X, Loader2,
  AlertCircle, CheckCircle2, Pencil, ShieldCheck,
  BookOpen, Target, MapPin,
} from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/api';
import { PROVINCES, parseSchool, joinSchool } from '../lib/provinces';

export const Profile = () => {
  const { user, isLoading: authLoading, updateUserInState } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);

  const [formData, setFormData] = useState({
    name: '', schoolName: '', province: '', grade: '12', majorInterest: '',
  });

  useEffect(() => {
    if (user) {
      const { schoolName, province } = parseSchool(user.academicInfo?.school || '');
      setFormData({
        name:          user.name || '',
        schoolName,
        province,
        grade:         user.academicInfo?.grade || '12',
        majorInterest: user.academicInfo?.majorInterest || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  const handleSave = async () => {
    if (!formData.name.trim()) { setError('Họ và tên không được bỏ trống.'); return; }
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const schoolFull = joinSchool(formData.schoolName, formData.province);
      const response = await profileService.updateProfile(
        formData.name, schoolFull, formData.grade, formData.majorInterest
      );
      if (response.success && response.data) {
        updateUserInState(response.data);
        setSuccess(true);
        setIsEditing(false);
      } else {
        throw new Error(response.message || 'Cập nhật thất bại');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Lưu thay đổi thất bại.');
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

  const inputCls = 'w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">

        {/* Alerts */}
        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-2.5 text-sm border border-red-100 dark:border-red-900/30">
            <AlertCircle size={16} className="shrink-0 mt-0.5" /><span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3.5 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-xl flex items-start gap-2.5 text-sm border border-green-100 dark:border-green-900/30">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" /><span>Cập nhật hồ sơ thành công!</span>
          </div>
        )}

        {/* ── Profile Header ── */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 shadow-card">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <img
              src={user.avatar || `https://i.pravatar.cc/80?u=${user.email}`}
              alt={user.name}
              className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200 dark:border-navy-600 shrink-0"
            />
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Họ và tên</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-base font-bold bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button disabled={isLoading} onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50">
                      {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Lưu
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-200 dark:hover:bg-navy-700 transition-colors">
                      <X size={14} /> Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
                    {user.isPro
                      ? <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"><Star size={10} fill="currentColor" /> Pro</span>
                      : <span className="badge bg-slate-100 dark:bg-navy-800 text-slate-500">Miễn phí</span>}
                  </div>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-4">
                    <Mail size={13} />{user.email}
                  </p>
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold text-sm hover:bg-primary-700 transition-colors">
                    <Pencil size={13} /> Chỉnh sửa hồ sơ
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Thông tin học tập ── */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap size={17} className="text-primary-600" />
              Thông tin học tập
            </h3>
            {!isEditing && (
              <button onClick={() => navigate('/academic-profile')} className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors">
                Cập nhật →
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              {/* Tên trường */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Trường học</label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="THPT Phan Đình Phùng"
                  className={inputCls}
                />
              </div>

              {/* Tỉnh/thành + Khối lớp */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-500 block mb-1">Tỉnh / Thành phố</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                    <select
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className={`${inputCls} pl-8 appearance-none`}
                    >
                      <option value="">-- Chọn tỉnh/thành --</option>
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Khối lớp</label>
                  <select value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })} className={inputCls}>
                    <option value="10">Lớp 10</option>
                    <option value="11">Lớp 11</option>
                    <option value="12">Lớp 12</option>
                  </select>
                </div>
              </div>

              {/* Ngành yêu thích */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">
                  Ngành yêu thích
                  <span className="ml-1 text-slate-400 font-normal">(tùy chọn)</span>
                </label>
                <input
                  type="text"
                  value={formData.majorInterest}
                  onChange={(e) => setFormData({ ...formData, majorInterest: e.target.value })}
                  placeholder="Công nghệ thông tin"
                  className={inputCls}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Trường học',      value: formData.schoolName || 'Chưa cập nhật', icon: <GraduationCap size={13} /> },
                { label: 'Tỉnh / Thành phố', value: formData.province   || 'Chưa cập nhật', icon: <MapPin size={13} /> },
                { label: 'Khối lớp',         value: `Lớp ${formData.grade}`,                icon: null },
                { label: 'Ngành yêu thích',  value: formData.majorInterest || 'Chưa thiết lập', icon: null },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 dark:bg-navy-800 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    {item.icon}{item.label}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Quick Links ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => navigate('/academic-profile')} className="flex items-center gap-3 p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl hover:border-primary-300 dark:hover:border-primary-700 transition-colors text-left shadow-card">
            <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
              <BookOpen size={16} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Hồ sơ học tập</p>
              <p className="text-xs text-slate-500">Cập nhật điểm số 8 môn</p>
            </div>
          </button>
          <button onClick={() => navigate('/skill-evaluation')} className="flex items-center gap-3 p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl hover:border-primary-300 dark:hover:border-primary-700 transition-colors text-left shadow-card">
            <div className="w-9 h-9 bg-accent-50 dark:bg-accent-900/30 rounded-lg flex items-center justify-center shrink-0">
              <Target size={16} className="text-accent-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Đánh giá kỹ năng</p>
              <p className="text-xs text-slate-500">Tự đánh giá 5 kỹ năng cốt lõi</p>
            </div>
          </button>
        </div>

        {/* ── Bảo mật ── */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 shadow-card">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <ShieldCheck size={17} className="text-green-500" />
            Bảo mật tài khoản
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Mật khẩu</span>
              <button className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors">Đổi mật khẩu</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Vai trò tài khoản</span>
              <span className="text-xs font-semibold text-slate-500 capitalize">{user.role}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
