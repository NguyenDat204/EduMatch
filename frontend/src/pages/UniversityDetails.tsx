import {
  ArrowLeft, MapPin, Globe, BookOpen, Users, Award,
  ChevronRight, ExternalLink, MessageCircle, Loader2,
  GraduationCap, Phone, Star, TrendingUp, Eye,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../layouts";
import { universityService } from "../services/api";
import type { University } from "../types";

// Gradient colors cycling for stat cards
const STAT_COLORS = [
  { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-600', icon: 'text-indigo-500' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600', icon: 'text-emerald-500' },
  { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600', icon: 'text-amber-500' },
  { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600', icon: 'text-rose-500' },
];

export const UniversityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [uni, setUni] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);
  const [views, setViews] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchAndTrack = async () => {
      try {
        // 1. Fetch university data
        const response = await universityService.getUniversityById(id);
        if (response.success && response.data) {
          setUni(response.data);
          setViews(response.data.views || 0);
        }
      } catch (err) {
        console.warn('Failed to load university detail:', err);
      } finally {
        setLoading(false);
      }

      // Views hiển thị từ dữ liệu thực, không tự track khi load trang
    };

    fetchAndTrack();
  }, [id]);

  const handleVisitWebsite = async () => {
    if (!id || !uni?.website) return;
    const url = uni.website.startsWith('http') ? uni.website : `https://${uni.website}`;
    window.open(url, '_blank', 'noreferrer');
    // Optimistic update
    setViews((v) => v + 1);
    try {
      const trackRes = await universityService.trackView(id);
      if (trackRes?.data?.views !== undefined) {
        setViews(trackRes.data.views);
      }
    } catch {
      // silent fail
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-40">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      </DashboardLayout>
    );
  }

  if (!uni) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 dark:bg-navy-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={28} className="text-slate-400" />
          </div>
          <p className="text-slate-500 mb-4">Không tìm thấy thông tin trường học này.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm"
          >
            Quay lại
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const tuitionDisplay = uni.tuitionFee
    ? typeof uni.tuitionFee === "number"
      ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(uni.tuitionFee) + " / năm"
      : uni.tuitionFee
    : "Đang cập nhật";

  const quickStats = [
    { label: "Sinh viên", value: "17.2k+", icon: Users },
    { label: "Tỷ lệ tuyển", value: "~25%", icon: TrendingUp },
    { label: "Xếp hạng", value: uni.ranking || "—", icon: Award },
    { label: "Có việc làm", value: "84%", icon: Star },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-20 space-y-6 animate-fade-in">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium group"
        >
          <span className="w-8 h-8 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg flex items-center justify-center shadow-sm group-hover:border-indigo-300 transition-colors">
            <ArrowLeft size={15} />
          </span>
          Quay lại danh sách
        </button>

        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg bg-slate-900">
          <div className="h-52 md:h-64 w-full relative">
            <img
              src={uni.logo || "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=2000"}
              alt={uni.name}
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=2000";
              }}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          </div>

          {/* Overlaid info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[11px] font-bold uppercase tracking-wider">
                {uni.ranking || "Trường ĐH"}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm text-white rounded-full text-xs font-semibold border border-white/20">
                <MapPin size={12} /> {uni.location}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm text-white rounded-full text-xs font-semibold border border-white/20">
                <Eye size={12} /> {views.toLocaleString()} lượt quan tâm
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{uni.name}</h1>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {uni.website && (
            <button
              onClick={handleVisitWebsite}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
            >
              <Globe size={15} /> Ghé thăm Website <ExternalLink size={13} />
            </button>
          )}
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 hover:border-indigo-300 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-sm transition-colors shadow-sm">
            <Star size={15} className="text-amber-500" /> Lưu yêu thích
          </button>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickStats.map((stat, i) => {
            const color = STAT_COLORS[i % STAT_COLORS.length];
            return (
              <div key={stat.label} className={`${color.bg} rounded-xl p-4 flex items-center gap-3`}>
                <div className={`w-9 h-9 bg-white dark:bg-navy-900 rounded-lg flex items-center justify-center shrink-0 shadow-sm`}>
                  <stat.icon size={17} className={color.icon} />
                </div>
                <div>
                  <p className={`font-black text-lg leading-none ${color.text}`}>{stat.value}</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Main info */}
          <div className="lg:col-span-2 space-y-6">

            {/* About */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 shadow-card">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <GraduationCap size={18} className="text-indigo-500" /> Về trường
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {uni.name} là cơ sở giáo dục đại học uy tín đặt tại {uni.location}. Nổi tiếng
                với chất lượng đào tạo và tỷ lệ sinh viên có việc làm sau tốt nghiệp cao,
                trường cung cấp môi trường học tập năng động với đội ngũ giảng viên chuyên nghiệp.
              </p>
            </div>

            {/* Programs */}
            {(uni.programs || []).length > 0 && (
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 shadow-card">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen size={18} className="text-emerald-500" /> Ngành đào tạo thế mạnh
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(uni.programs || []).map((program) => (
                    <div
                      key={program}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-xl group hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-200 border border-transparent transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-white dark:bg-navy-700 rounded-lg flex items-center justify-center shadow-sm">
                          <BookOpen size={13} className="text-emerald-500" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{program}</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admissions & Tuition */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 shadow-card space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award size={18} className="text-amber-500" /> Tuyển sinh & Học phí
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award size={13} /> Học bổng
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {uni.scholarships || "Học bổng đa dạng từ 20–100% học phí dựa trên thành tích và hoạt động ngoại khóa."}
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen size={13} /> Phương thức xét tuyển
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {uni.admissions || "Kết hợp điểm thi THPT Quốc gia, xét học bạ và kỳ thi đánh giá năng lực."}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Học phí dự kiến</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Có thể thay đổi tùy ngành và chương trình đào tạo</p>
                </div>
                <span className="text-lg font-black text-amber-700 dark:text-amber-400 whitespace-nowrap ml-4">
                  {tuitionDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-5">

            {/* Admission Match */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-5 shadow-card">
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Cơ hội trúng tuyển</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Độ phù hợp</span>
                  <span className="font-bold text-emerald-600">Tốt (78%)</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-navy-700 rounded-full overflow-hidden">
                  <div className="h-full w-[78%] bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-700" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dựa trên hồ sơ học tập và định hướng của bạn, khả năng trúng tuyển ở mức tốt.
                </p>
              </div>
              <button className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm">
                Nhận hướng dẫn tuyển sinh
              </button>
            </div>

            {/* Contact box */}
            <div className="bg-slate-900 dark:bg-white rounded-2xl p-5 text-white dark:text-slate-900 shadow-lg">
              <div className="w-10 h-10 bg-white/10 dark:bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                <MessageCircle size={20} className="text-indigo-400 dark:text-indigo-600" />
              </div>
              <h3 className="font-bold text-base mb-2">Hỏi đáp & Tư vấn</h3>
              <p className="text-sm opacity-70 leading-relaxed mb-4">
                Kết nối với tư vấn viên hoặc cựu sinh viên để được chia sẻ kinh nghiệm thực tế.
              </p>
              <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors">
                Yêu cầu tư vấn
              </button>
            </div>

            {/* Quick contact info */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-5 shadow-card space-y-3">
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wider">Thông tin liên hệ</h3>
              <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                <MapPin size={15} className="text-indigo-500 shrink-0" />
                <span>{uni.location}</span>
              </div>
              {uni.website && (
                <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                  <Globe size={15} className="text-emerald-500 shrink-0" />
                  <button
                    onClick={handleVisitWebsite}
                    className="text-indigo-600 hover:underline truncate text-left"
                  >
                    {uni.website}
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                <Phone size={15} className="text-amber-500 shrink-0" />
                <span>Hotline tuyển sinh: 1800-xxxx</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
