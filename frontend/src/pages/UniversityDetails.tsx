import {
  ArrowLeft,
  MapPin,
  Star,
  Globe,
  BookOpen,
  Users,
  Award,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../layouts";
import { universityService } from "../services/api";
import type { University } from "../types";

export const UniversityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [uni, setUni] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniversity = async () => {
      if (!id) return;
      try {
        const response = await universityService.getUniversityById(id);
        if (response.success && response.data) {
          setUni(response.data);
        } else {
          console.warn('University API returned no data for id', id);
        }
      } catch (err) {
        console.warn('Failed to load university detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversity();

    // Track view after 15 seconds
    const trackingTimer = setTimeout(async () => {
      if (id) {
        try {
          await universityService.trackView(id);
        } catch (err) {
          console.warn("Tracking view failed:", err);
        }
      }
    }, 15000);

    return () => {
      clearTimeout(trackingTimer);
    };
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-40">
          <Loader2 className="animate-spin text-primary-600" size={40} />
        </div>
      </DashboardLayout>
    );
  }

  if (!uni) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-slate-500">
            Không tìm thấy thông tin trường học này.
          </p>
          <button
            onClick={() => navigate("/explore")}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg"
          >
            Quay lại
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-primary-600 font-bold transition-all group"
        >
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-primary-50">
            <ArrowLeft size={18} />
          </div>
          Quay lại danh sách
        </button>

        <header className="relative group">
          <div className="h-64 md:h-80 w-full rounded-[3.5rem] overflow-hidden relative shadow-premium">
            <img
              src={uni.logo || "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=2000"}
              alt={uni.name}
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=2000";
              }}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 p-10 md:p-14 w-full flex flex-col md:flex-row items-end justify-between gap-8 z-10">
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="px-4 py-1.5 bg-primary-600 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                  {uni.ranking}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-bold text-slate-200">
                  <MapPin size={16} />
                  {uni.location}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-bold text-slate-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                  <Users size={14} />
                  {uni.views || 0} lượt quan tâm
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-black leading-tight">
                {uni.name}
              </h1>
            </div>

            <div className="flex gap-4">
              <a
                href={uni.website}
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-xl text-xs"
              >
                Ghé thăm Website
                <ExternalLink size={18} />
              </a>
              <button className="p-4 bg-primary-600 text-white rounded-2xl shadow-xl hover:bg-primary-500 transition-all">
                <Star size={24} fill="white" />
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section className="space-y-6">
              <h2 className="text-3xl font-bold">Về trường Đại học</h2>
              <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                {uni.name} là tổ chức giáo dục đại học danh tiếng hàng đầu thế
                giới được đặt tại {uni.location}. Nổi tiếng với chất lượng đào
                tạo xuất sắc, cơ sở vật chất hiện đại, và tỷ lệ cựu sinh viên
                thành công vượt trội trong các ngành kinh tế, khoa học kỹ thuật
                và thiết kế.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-6 glass rounded-3xl border-none shadow-premium text-center bg-white dark:bg-slate-900">
                  <Users size={24} className="mx-auto mb-3 text-primary-600" />
                  <div className="font-black text-xl">17.2k</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Sinh viên
                  </div>
                </div>
                <div className="p-6 glass rounded-3xl border-none shadow-premium text-center bg-white dark:bg-slate-900">
                  <BookOpen
                    size={24}
                    className="mx-auto mb-3 text-secondary-600"
                  />
                  <div className="font-black text-xl">4%</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Tỉ lệ Tuyển
                  </div>
                </div>
                <div className="p-6 glass rounded-3xl border-none shadow-premium text-center bg-white dark:bg-slate-900">
                  <Globe size={24} className="mx-auto mb-3 text-accent-600" />
                  <div className="font-black text-xl">#1</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Sáng tạo
                  </div>
                </div>
                <div className="p-6 glass rounded-3xl border-none shadow-premium text-center bg-white dark:bg-slate-900">
                  <Award size={24} className="mx-auto mb-3 text-emerald-600" />
                  <div className="font-black text-xl">84%</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Có việc làm
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-3xl font-bold">Ngành đào tạo thế mạnh</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(uni.programs || []).map((program) => (
                  <div
                    key={program}
                    className="flex items-center justify-between p-6 glass rounded-2xl border-none shadow-premium group hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all cursor-pointer bg-white dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                        <BookOpen size={18} className="text-primary-600" />
                      </div>
                      <span className="font-bold text-sm">{program}</span>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-slate-300 group-hover:text-primary-600 transition-all"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-3xl font-bold">
                Thông tin Tuyển sinh & Học phí
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 glass rounded-3xl border-none shadow-premium bg-white dark:bg-slate-900 space-y-3">
                  <div className="flex items-center gap-3 text-primary-600 font-bold">
                    <Award size={20} />
                    <span>Học bổng</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    {uni.scholarships ||
                      "Học bổng đa dạng dựa trên thành tích học tập xuất sắc và hoạt động ngoại khóa."}
                  </p>
                </div>

                <div className="p-6 glass rounded-3xl border-none shadow-premium bg-white dark:bg-slate-900 space-y-3">
                  <div className="flex items-center gap-3 text-secondary-600 font-bold">
                    <BookOpen size={20} />
                    <span>Phương thức xét tuyển</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    {uni.admissions ||
                      "Xét tuyển kết hợp học bạ THPT, điểm thi tốt nghiệp và kỳ thi Đánh giá năng lực."}
                  </p>
                </div>

                <div className="p-6 glass rounded-3xl border-none shadow-premium bg-white dark:bg-slate-900 md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-emerald-600 font-bold">
                      <Star size={20} />
                      <span>Học phí dự kiến</span>
                    </div>
                    <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-black text-base rounded-2xl">
                      {uni.tuitionFee
                        ? typeof uni.tuitionFee === "number"
                          ? new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(uni.tuitionFee) + " / năm"
                          : uni.tuitionFee
                        : "Đang cập nhật"}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Học phí có thể thay đổi tùy thuộc vào chương trình đào tạo
                    cụ thể (chương trình đại trà, chương trình liên kết hoặc
                    chất lượng cao) và số lượng tín chỉ đăng ký theo kỳ học.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="glass p-8 rounded-[2.5rem] border-none shadow-premium space-y-6 bg-white dark:bg-slate-900">
              <h3 className="font-bold text-xl">Cơ hội Trúng tuyển</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Độ phù hợp</span>
                  <span className="text-emerald-600">Khớp Cao (85%)</span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[85%] premium-gradient rounded-full" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dựa trên hồ sơ học tập và định hướng của bạn, bạn có năng lực
                  cực tốt để nộp hồ sơ xét tuyển học thuật tại đây.
                </p>
              </div>
              <button className="w-full py-4 premium-gradient text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 hover:scale-105 transition-all text-xs">
                Nhận hướng dẫn tuyển sinh
              </button>
            </section>

            <section className="bg-slate-950 dark:bg-white p-10 rounded-[3rem] text-white dark:text-slate-900 shadow-2xl space-y-6">
              <div className="w-14 h-14 bg-white/10 dark:bg-slate-100 rounded-2xl flex items-center justify-center text-primary-500">
                <MessageCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold">Hỏi đáp Cựu sinh viên</h3>
              <p className="text-sm opacity-70 leading-relaxed">
                Kết nối với các sinh viên khóa trên hoặc cựu sinh viên thành đạt
                từ trường đại học này để được chia sẻ trải nghiệm thực tế.
              </p>
              <button className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-500 transition-all shadow-xl shadow-primary-600/20 text-xs">
                Yêu cầu kết nối
              </button>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
