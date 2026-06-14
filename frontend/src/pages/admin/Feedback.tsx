import { useState, useEffect } from 'react';
import { Star, Trash2, Loader2, Sparkles, MessageSquare, TrendingUp, Users } from 'lucide-react';
import { adminService } from '../../services/api';

export const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    try {
      const res = await adminService.getFeedbackLogs();
      if (res.success && res.data) {
        setFeedbacks(res.data);
      }
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phản hồi này không?")) return;
    try {
      const res = await adminService.deleteFeedback(id);
      if (res.success) {
        setFeedbacks(prev => prev.filter(fb => fb._id !== id));
      }
    } catch (err) {
      console.error("Delete feedback failed:", err);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  // ── Stats ─────────────────────────────────────────────────
  const totalCount   = feedbacks.length;
  const avgRating    = totalCount > 0
    ? (feedbacks.reduce((sum, fb) => sum + (fb.rating || 5), 0) / totalCount).toFixed(1)
    : '—';
  const fiveStarCount = feedbacks.filter(fb => (fb.rating || 5) === 5).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-2xl font-bold mb-1">Phản hồi người dùng</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Đọc và quản lý đánh giá thực tế gửi từ người dùng hệ thống.</p>
      </div>

      {/* ── Stats cards ── */}
      {!loading && totalCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-4 flex items-center gap-3 shadow-card">
            <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
              <Users size={18} className="text-primary-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white">{totalCount}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Tổng phản hồi</p>
            </div>
          </div>
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-4 flex items-center gap-3 shadow-card">
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp size={18} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white">{avgRating} <span className="text-sm font-semibold text-amber-400">★</span></p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Đánh giá trung bình</p>
            </div>
          </div>
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-4 flex items-center gap-3 shadow-card">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center shrink-0">
              <MessageSquare size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white">{fiveStarCount}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Đánh giá 5 sao</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      ) : feedbacks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feedbacks.map((fb: any) => (
            <div
              key={fb._id}
              className="bg-white dark:bg-navy-900 p-5 rounded-xl shadow-card border border-slate-200 dark:border-navy-700 flex flex-col hover:shadow-card-hover transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  {/* Backend stores name & email fields */}
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                    {fb.name || 'Ẩn danh'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{fb.email || ''}</p>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0 mt-0.5">{formatDate(fb.createdAt)}</span>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={14}
                    className={star <= (fb.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}
                  />
                ))}
                <span className="ml-1.5 text-[11px] font-semibold text-amber-500">{fb.rating || 5}/5</span>
              </div>

              {/* Message — backend field is `message` */}
              <p className="text-sm text-slate-600 dark:text-slate-400 flex-1 leading-relaxed mb-4 line-clamp-4">
                "{fb.message || 'Không có bình luận chi tiết.'}"
              </p>

              {/* Footer */}
              <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-navy-700">
                <button
                  onClick={() => handleDelete(fb._id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 size={13} /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-700 shadow-card">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-navy-800 rounded-full mb-3">
            <Sparkles size={22} className="text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">Chưa có phản hồi nào được ghi nhận.</p>
          <p className="text-xs text-slate-400 mt-1">Phản hồi từ người dùng sẽ xuất hiện tại đây.</p>
        </div>
      )}
    </div>
  );
};
