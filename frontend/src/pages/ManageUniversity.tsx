import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  GraduationCap, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Save, 
  Globe, 
  Calendar, 
  Loader2, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { universityService } from '../services/api';
import type { University } from '../types';

export const ManageUniversity = () => {
  const [uni, setUni] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [ranking, setRanking] = useState('');
  const [tuitionFee, setTuitionFee] = useState<number | string>('');
  const [scholarships, setScholarships] = useState('');
  const [admissions, setAdmissions] = useState('');
  const [programsInput, setProgramsInput] = useState('');

  useEffect(() => {
    const fetchMyUniversity = async () => {
      try {
        const res = await universityService.getMyUniversity();
        if (res.success && res.data) {
          setUni(res.data);
          // Prefill form
          setName(res.data.name || '');
          setLocation(res.data.location || '');
          setWebsite(res.data.website || '');
          setRanking(res.data.ranking || '');
          setTuitionFee(res.data.tuitionFee || '');
          setScholarships(res.data.scholarships || '');
          setAdmissions(res.data.admissions || '');
          setProgramsInput((res.data.programs || []).join(', '));
        } else {
          setError("Không thể lấy dữ liệu trường đại học.");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Lỗi tải thông tin đại diện đại học.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyUniversity();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const programs = programsInput
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const updatedData = {
      name,
      location,
      website,
      ranking,
      tuitionFee: Number(tuitionFee) || 0,
      scholarships,
      admissions,
      programs
    };

    try {
      const res = await universityService.updateMyUniversity(updatedData);
      if (res.success && res.data) {
        setUni(res.data);
        setSuccess("Cập nhật thông tin trường đại học thành công!");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setSuccess(null), 4000);
      } else {
        setError("Không thể lưu thông tin.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi lưu thông tin trường học.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-40">
          <Loader2 className="animate-spin text-primary-600" size={40} />
        </div>
      </DashboardLayout>
    );
  }

  // Generate a premium SVG background representing views activity over the last days
  const viewsHistory = [12, 19, 15, 25, 32, 45, (uni?.views || 50)];
  const maxView = Math.max(...viewsHistory, 10);
  const svgWidth = 500;
  const svgHeight = 120;
  const points = viewsHistory.map((val, index) => {
    const x = (index / (viewsHistory.length - 1)) * svgWidth;
    const y = svgHeight - (val / maxView) * (svgHeight - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-wider mb-2">
              <ShieldCheck size={16} />
              Cổng quản trị Đại diện Đại học
            </div>
            <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white">
              Quản lý thông tin Trường học
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {uni?.name || 'Trường đại học đại diện'} • Quản lý tin tuyển sinh, học phí và xem danh sách học sinh quan tâm.
            </p>
          </div>
        </div>

        {/* Status Notifications */}
        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-3 text-sm font-semibold border border-emerald-100 dark:border-emerald-950/30 animate-scale-in">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 text-sm font-semibold border border-red-100 dark:border-red-950/30 animate-scale-in">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT: UPDATE FORM CARD */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass p-8 rounded-[2rem] border-none shadow-premium bg-white dark:bg-slate-900 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <Building2 className="text-primary-600" size={24} />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Thông tin giới thiệu & Tuyển sinh</h2>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tên trường đại học</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Địa chỉ / Tỉnh thành</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Địa chỉ Website</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500">
                        <Globe size={16} />
                      </div>
                      <input
                        type="url"
                        required
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://fpt.edu.vn"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Xếp hạng / Phân hiệu</label>
                    <input
                      type="text"
                      required
                      value={ranking}
                      onChange={(e) => setRanking(e.target.value)}
                      placeholder="Top 1 Sáng Tạo, Khóa 20"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Học phí dự kiến hàng năm (VND)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500">
                      <DollarSign size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      value={tuitionFee}
                      onChange={(e) => setTuitionFee(e.target.value)}
                      placeholder="50000000 hoặc '50 triệu / năm'"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chính sách học bổng</label>
                  <textarea
                    rows={3}
                    required
                    value={scholarships}
                    onChange={(e) => setScholarships(e.target.value)}
                    placeholder="Học bổng từ 10% - 100% cho học sinh có điểm GPA lớp 12 trên 8.5..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phương thức tuyển sinh đại học</label>
                  <textarea
                    rows={3}
                    required
                    value={admissions}
                    onChange={(e) => setAdmissions(e.target.value)}
                    placeholder="Xét tuyển điểm thi THPT, xét tuyển học bạ 3 môn, điểm đánh giá năng lực ĐHQG..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Ngành đào tạo nổi bật (Phân tách bởi dấu phẩy)
                  </label>
                  <input
                    type="text"
                    required
                    value={programsInput}
                    onChange={(e) => setProgramsInput(e.target.value)}
                    placeholder="Kỹ thuật Phần mềm, Quản trị Kinh doanh, Thiết kế đồ họa"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 premium-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20 hover:scale-[1.01] transition-all disabled:opacity-50 active:scale-95 text-xs"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Đang lưu thông tin...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Lưu và xuất bản thông tin
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: ANALYTICS & VISITOR LOGS */}
          <div className="space-y-10">
            {/* Analytics Card */}
            <div className="glass p-6 rounded-[2rem] border-none shadow-premium bg-slate-900 text-white space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
                  <TrendingUp size={14} />
                  Hiệu quả hiển thị
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold">
                  +12% tuần này
                </span>
              </div>

              <div>
                <span className="text-5xl font-black">{uni?.views || 0}</span>
                <p className="text-xs text-slate-400 mt-2">Tổng số lượt quan tâm của Học sinh đến trường</p>
              </div>

              {/* Sparkline chart SVG */}
              <div className="pt-2">
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height={svgHeight} className="overflow-visible">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Fill path */}
                  <path
                    d={`M0,${svgHeight} L${points} L${svgWidth},${svgHeight} Z`}
                    fill="url(#chartGradient)"
                  />
                  {/* Stroke path */}
                  <path
                    d={`M ${points}`}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* ViewLogs Cards */}
            <div className="glass p-6 rounded-[2rem] border-none shadow-premium bg-white dark:bg-slate-900 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
                  <Users className="text-secondary-600" size={18} />
                  <span>Học sinh quan tâm gần đây</span>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {uni?.viewLogs?.length || 0} hồ sơ
                </span>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {(!uni?.viewLogs || uni.viewLogs.length === 0) ? (
                  <div className="text-center py-10">
                    <p className="text-xs text-slate-400">Chưa có học sinh nào xem thông tin trường của bạn.</p>
                  </div>
                ) : (
                  uni.viewLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 transition-all hover:bg-slate-100/50"
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-800 dark:text-white">{log.userName || 'Học sinh ẩn danh'}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <GraduationCap size={10} />
                          <span>{log.userSchool || 'THPT Phan Đình Phùng'}</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="flex items-center gap-0.5 text-[9px] text-slate-400 font-medium">
                          <Calendar size={8} />
                          {new Date(log.timestamp).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="flex items-center gap-0.5 text-[9px] text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
