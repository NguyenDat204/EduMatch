import { useState } from 'react';
import { AlertCircle, CheckCircle2, MessageSquare, Send, Star } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { useAuth } from '../hooks/useAuth';
import { feedbackService } from '../services/api';
import { trackEvent } from '../services/analytics';

export const Feedback = () => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await feedbackService.submitFeedback(user.name, user.email, message.trim(), rating);
      if (res.success) {
        trackEvent('feedback_submit', { rating });
        setSuccess(true);
        setMessage('');
        setRating(5);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gửi phản hồi thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-primary-600" size={24} />
            Đóng góp ý kiến
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Chia sẻ trải nghiệm của bạn để EduMatch cải thiện sản phẩm và chất lượng tư vấn AI.
          </p>
        </div>

        <section className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-6 shadow-card">
          {success ? (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-3 border border-green-100 dark:border-green-900/30 text-sm">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>Cảm ơn bạn đã gửi phản hồi. Ý kiến này sẽ được admin theo dõi trong hệ thống.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg flex items-start gap-2 text-xs border border-red-100 dark:border-red-900/30">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Đánh giá tổng thể
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                      aria-label={`${star} sao`}
                    >
                      <Star
                        size={26}
                        fill={star <= rating ? 'currentColor' : 'none'}
                        className={star <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-semibold text-slate-500">{rating}/5</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Nội dung phản hồi
                </label>
                <textarea
                  required
                  rows={7}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Bạn có thể góp ý về trải nghiệm sử dụng, kết quả hướng nghiệp, AI tư vấn, dữ liệu ngành nghề hoặc bất kỳ điểm nào cần cải thiện..."
                  className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                  {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};
