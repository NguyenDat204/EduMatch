import { useState, useEffect } from 'react';
import { Star, Trash2, Loader2, Sparkles } from 'lucide-react';
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Phản hồi người dùng</h1>
        <p className="text-slate-500">Đọc và quản lý đánh giá thực tế gửi từ người dùng hệ thống.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      ) : feedbacks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedbacks.map((fb: any) => (
            <div key={fb._id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-slate-800 dark:text-slate-100">{fb.userName || fb.userEmail || 'Học sinh ẩn danh'}</span>
                <span className="text-xs text-slate-400 font-medium">{formatDate(fb.createdAt)}</span>
              </div>
              
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    size={16} 
                    className={star <= (fb.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'} 
                  />
                ))}
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 flex-1 mb-6">"{fb.content || 'Không có bình luận chi tiết.'}"</p>
              
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                <button 
                  onClick={() => handleDelete(fb._id)}
                  className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-bold transition-colors"
                >
                  <Trash2 size={16} /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
          <p className="text-slate-500 mb-2 font-medium">Chưa có phản hồi nào được ghi nhận.</p>
          <div className="inline-flex items-center justify-center w-12 h-12 text-slate-300">
            <Sparkles size={24} />
          </div>
        </div>
      )}
    </div>
  );
};
