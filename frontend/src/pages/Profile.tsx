import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Mail, GraduationCap, Star, Save, X, Loader2,
  AlertCircle, CheckCircle2, Pencil, ShieldCheck,
  BookOpen, Target, MapPin, Lock, Eye, EyeOff, KeyRound,
} from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { useAuth } from '../hooks/useAuth';
import { profileService, authService } from '../services/api';
import { PROVINCES, parseSchool, joinSchool } from '../lib/provinces';
import { cn } from '../lib/utils';

// ─── Avatar component: show Google photo or colorful initial ────────────────
const UserAvatar = ({
  avatar, name, email, size = 'lg',
}: { avatar?: string; name: string; email: string; size?: 'sm' | 'lg' }) => {
  const sizeClass = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-9 h-9 text-sm';
  const initial = name?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase() || '?';

  // Only use the avatar URL if it's a real Google photo (not a pravatar placeholder)
  const isGoogleAvatar = avatar && !avatar.includes('pravatar.cc');

  if (isGoogleAvatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={cn(sizeClass, 'rounded-xl object-cover border-2 border-slate-200 dark:border-navy-600 shrink-0')}
      />
    );
  }

  // Generate a deterministic gradient color from name/email
  const colors = [
    'from-violet-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-sky-500 to-blue-600',
    'from-fuchsia-500 to-purple-600',
  ];
  const colorIndex = (name.charCodeAt(0) + email.charCodeAt(0)) % colors.length;

  return (
    <div className={cn(
      sizeClass,
      'rounded-xl bg-gradient-to-br flex items-center justify-center font-bold text-white shrink-0',
      colors[colorIndex]
    )}>
      {initial}
    </div>
  );
};

// ─── Change Password Modal ────────────────────────────────────────────────────
const ChangePasswordModal = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.changePassword(form.currentPassword, form.newPassword);
      if ((res as any).success) {
        setSuccess(true);
        setTimeout(onClose, 1800);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-navy-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg flex items-center justify-center">
              <KeyRound size={17} className="text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Đổi mật khẩu</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors">
            <X size={17} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <p className="font-bold text-slate-900 dark:text-white">Đổi mật khẩu thành công!</p>
            <p className="text-sm text-slate-500">Đang đóng cửa sổ...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg flex items-start gap-2 text-sm border border-red-100 dark:border-red-900/30">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Current password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Mật khẩu hiện tại</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  placeholder="Nhập mật khẩu hiện tại"
                  className={inputCls}
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Mật khẩu mới</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="Ít nhất 6 ký tự"
                  className={inputCls}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.newPassword && (
                <div className="mt-1.5">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors', {
                        'bg-red-400': form.newPassword.length >= 1 && i === 0,
                        'bg-orange-400': form.newPassword.length >= 4 && i === 1,
                        'bg-yellow-400': form.newPassword.length >= 6 && i === 2,
                        'bg-emerald-500': form.newPassword.length >= 8 && i === 3,
                        'bg-slate-200 dark:bg-navy-700': !(form.newPassword.length >= [1,4,6,8][i]),
                      })} />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {form.newPassword.length < 4 ? 'Yếu' : form.newPassword.length < 6 ? 'Trung bình' : form.newPassword.length < 8 ? 'Khá' : 'Mạnh'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Nhập lại mật khẩu mới"
                  className={cn(inputCls, form.confirmPassword && (form.confirmPassword === form.newPassword ? 'border-emerald-300 focus:ring-emerald-400' : 'border-red-300 focus:ring-red-400'))}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.confirmPassword && form.confirmPassword !== form.newPassword && (
                <p className="text-xs text-red-500 mt-1">Mật khẩu không khớp</p>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 dark:border-navy-600 text-slate-600 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors">
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? <><Loader2 size={14} className="animate-spin" /> Đang lưu...</> : <><Save size={14} /> Lưu thay đổi</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ─── Main Profile Page ───────────────────────────────────────────────────────
export const Profile = () => {
  const { user, isLoading: authLoading, updateUserInState } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '', schoolName: '', province: '', grade: '12', majorInterest: '',
  });

  useEffect(() => {
    if (user) {
      const { schoolName, province } = parseSchool(user.academicInfo?.school || '');
      setFormData({
        name: user.name || '',
        schoolName,
        province,
        grade: user.academicInfo?.grade || '12',
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
        setTimeout(() => setSuccess(false), 3000);
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }
  if (!user) return null;

  const inputCls = 'w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all';

  return (
    <DashboardLayout>
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}

      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">

        {/* Alerts */}
        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-2.5 text-sm border border-red-100 dark:border-red-900/30">
            <AlertCircle size={16} className="shrink-0 mt-0.5" /><span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-start gap-2.5 text-sm border border-emerald-100 dark:border-emerald-900/30">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" /><span>Cập nhật hồ sơ thành công!</span>
          </div>
        )}

        {/* ── Profile Header ── */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 shadow-card">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <UserAvatar avatar={user.avatar} name={user.name} email={user.email} size="lg" />

            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Họ và tên</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-base font-bold bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button disabled={isLoading} onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50">
                      {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Lưu
                    </button>
                    <button onClick={() => { setIsEditing(false); setError(null); }} className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-200 dark:hover:bg-navy-700 transition-colors">
                      <X size={14} /> Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
                    {user.isPro
                      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-md text-[11px] font-bold"><Star size={10} fill="currentColor" /> Pro</span>
                      : <span className="px-2 py-0.5 bg-slate-100 dark:bg-navy-800 text-slate-500 rounded-md text-[11px] font-bold">Miễn phí</span>}
                    {user.role === 'admin' && (
                      <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-md text-[11px] font-bold uppercase">Admin</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-4">
                    <Mail size={13} />{user.email}
                  </p>
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors">
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
              <GraduationCap size={17} className="text-indigo-500" /> Thông tin học tập
            </h3>
            {!isEditing && (
              <button onClick={() => navigate('/academic-profile')} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                Cập nhật →
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Trường học</label>
                <input type="text" value={formData.schoolName} onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })} placeholder="THPT Phan Đình Phùng" className={inputCls} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Tỉnh / Thành phố</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                    <select value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value })} className={`${inputCls} pl-8 appearance-none`}>
                      <option value="">-- Chọn tỉnh/thành --</option>
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Khối lớp</label>
                  <select value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })} className={inputCls}>
                    <option value="10">Lớp 10</option>
                    <option value="11">Lớp 11</option>
                    <option value="12">Lớp 12</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Ngành yêu thích <span className="text-slate-400 font-normal">(tùy chọn)</span></label>
                <input type="text" value={formData.majorInterest} onChange={(e) => setFormData({ ...formData, majorInterest: e.target.value })} placeholder="Công nghệ thông tin" className={inputCls} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Trường học', value: formData.schoolName || 'Chưa cập nhật', icon: <GraduationCap size={13} /> },
                { label: 'Tỉnh / Thành phố', value: formData.province || 'Chưa cập nhật', icon: <MapPin size={13} /> },
                { label: 'Khối lớp', value: `Lớp ${formData.grade}`, icon: null },
                { label: 'Ngành yêu thích', value: formData.majorInterest || 'Chưa thiết lập', icon: null },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 dark:bg-navy-800 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">{item.icon}{item.label}</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Quick Links ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => navigate('/academic-profile')} className="flex items-center gap-3 p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-left shadow-card">
            <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center shrink-0">
              <BookOpen size={16} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Hồ sơ học tập</p>
              <p className="text-xs text-slate-500">Cập nhật điểm số 8 môn</p>
            </div>
          </button>
          <button onClick={() => navigate('/skill-evaluation')} className="flex items-center gap-3 p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-left shadow-card">
            <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
              <Target size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Đánh giá kỹ năng</p>
              <p className="text-xs text-slate-500">Tự đánh giá 5 kỹ năng cốt lõi</p>
            </div>
          </button>
        </div>

        {/* ── Bảo mật tài khoản ── */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 shadow-card">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <ShieldCheck size={17} className="text-emerald-500" /> Bảo mật tài khoản
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg">
              <div className="flex items-center gap-2.5">
                <Lock size={15} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Mật khẩu</span>
              </div>
              <button
                onClick={() => setShowChangePassword(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Đổi mật khẩu
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={15} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Vai trò tài khoản</span>
              </div>
              <span className={cn('text-xs font-bold px-2.5 py-1 rounded-lg', {
                'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400': user.role === 'admin',
                'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400': user.role === 'university',
                'bg-slate-100 dark:bg-navy-700 text-slate-600 dark:text-slate-400': user.role === 'student',
              })}>
                {user.role === 'admin' ? 'Quản trị viên' : user.role === 'university' ? 'Đại diện ĐH' : 'Học sinh'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
