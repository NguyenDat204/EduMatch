import { useState, useEffect, useMemo } from 'react';
import {
  Star, Trash2, Loader2, Sparkles, MessageSquare, TrendingUp, Users,
  Eye, Search, X, Mail, Calendar, User, Filter, AlertCircle,
} from 'lucide-react';
import { adminService } from '../../services/api';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const Stars = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(star => (
      <Star
        key={star}
        size={size}
        className={star <= (rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}
      />
    ))}
  </div>
);

export const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getFeedbackLogs();
      if (res.success && res.data) {
        setFeedbacks(res.data);
      }
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
      setError('Không thể tải phản hồi người dùng.');
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
        setSelectedFeedback(null);
      }
    } catch (err) {
      console.error("Delete feedback failed:", err);
      setError('Xóa phản hồi thất bại.');
    }
  };

  const filteredFeedbacks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return feedbacks.filter((fb) => {
      const matchesQuery = !q ||
        String(fb.name || '').toLowerCase().includes(q) ||
        String(fb.email || '').toLowerCase().includes(q) ||
        String(fb.message || '').toLowerCase().includes(q);
      const matchesRating = ratingFilter === 'all' || Number(fb.rating || 5) === Number(ratingFilter);
      return matchesQuery && matchesRating;
    });
  }, [feedbacks, query, ratingFilter]);

  const totalCount = feedbacks.length;
  const avgRating = totalCount > 0
    ? (feedbacks.reduce((sum, fb) => sum + (fb.rating || 5), 0) / totalCount).toFixed(1)
    : '--';
  const fiveStarCount = feedbacks.filter(fb => (fb.rating || 5) === 5).length;
  const lowRatingCount = feedbacks.filter(fb => (fb.rating || 5) <= 2).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">Phản hồi người dùng</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Theo dõi cảm nhận, vấn đề và góp ý trực tiếp từ người dùng.</p>
        </div>
        <button
          onClick={fetchFeedbacks}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:border-primary-300 transition-colors"
        >
          Làm mới
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {!loading && totalCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Rating TB</p>
            </div>
          </div>
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-4 flex items-center gap-3 shadow-card">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center shrink-0">
              <MessageSquare size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white">{fiveStarCount}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">5 sao</p>
            </div>
          </div>
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-4 flex items-center gap-3 shadow-card">
            <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center shrink-0">
              <AlertCircle size={18} className="text-red-500" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white">{lowRatingCount}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Cần chú ý</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-4 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên, email hoặc nội dung phản hồi"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
            >
              <option value="all">Tất cả rating</option>
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>{rating} sao</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      ) : filteredFeedbacks.length > 0 ? (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl shadow-card overflow-hidden">
          <div className="hidden md:grid grid-cols-[1.2fr_120px_1.6fr_140px_110px] gap-4 px-5 py-3 bg-slate-50 dark:bg-navy-800 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Người gửi</span>
            <span>Rating</span>
            <span>Nội dung</span>
            <span>Thời gian</span>
            <span className="text-right">Thao tác</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-navy-700">
            {filteredFeedbacks.map((fb: any) => (
              <div key={fb._id} className="grid grid-cols-1 md:grid-cols-[1.2fr_120px_1.6fr_140px_110px] gap-3 md:gap-4 px-5 py-4 items-center hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{fb.name || 'Ẩn danh'}</p>
                  <p className="text-xs text-slate-400 truncate">{fb.email || ''}</p>
                </div>
                <div>
                  <Stars rating={fb.rating || 5} />
                  <p className="text-[11px] text-amber-500 font-semibold mt-1">{fb.rating || 5}/5</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {fb.message || 'Không có bình luận chi tiết.'}
                </p>
                <span className="text-xs text-slate-400">{formatDate(fb.createdAt)}</span>
                <div className="flex justify-start md:justify-end gap-2">
                  <button
                    onClick={() => setSelectedFeedback(fb)}
                    className="p-2 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(fb._id)}
                    className="p-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-700 shadow-card">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-navy-800 rounded-full mb-3">
            <Sparkles size={22} className="text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">Không tìm thấy phản hồi phù hợp.</p>
          <p className="text-xs text-slate-400 mt-1">Thử đổi từ khóa hoặc bộ lọc rating.</p>
        </div>
      )}

      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-slate-950/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-navy-700">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={17} className="text-primary-600" /> Chi tiết phản hồi
              </h2>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              >
                <X size={17} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-navy-800 rounded-lg">
                  <User size={16} className="text-primary-600" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">Người gửi</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{selectedFeedback.name || 'Ẩn danh'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-navy-800 rounded-lg">
                  <Mail size={16} className="text-primary-600" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{selectedFeedback.email || '--'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-navy-800 rounded-lg">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                  <div>
                    <p className="text-xs text-slate-400">Đánh giá</p>
                    <div className="flex items-center gap-2">
                      <Stars rating={selectedFeedback.rating || 5} size={15} />
                      <span className="text-sm font-bold text-amber-500">{selectedFeedback.rating || 5}/5</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-navy-800 rounded-lg">
                  <Calendar size={16} className="text-primary-600" />
                  <div>
                    <p className="text-xs text-slate-400">Thời gian gửi</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatDate(selectedFeedback.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Nội dung phản hồi</p>
                <div className="min-h-32 p-4 rounded-lg bg-slate-50 dark:bg-navy-800 border border-slate-100 dark:border-navy-700">
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {selectedFeedback.message || 'Không có bình luận chi tiết.'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-navy-800 text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Đóng
                </button>
                <button
                  onClick={() => handleDelete(selectedFeedback._id)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  Xóa phản hồi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
