import { Star, Trash2 } from 'lucide-react';

const mockFeedbacks = [
  { id: 1, user: 'Nguyễn Văn A', rating: 5, content: 'Hệ thống rất hữu ích, giúp mình chọn đúng ngành IT.', date: '12/10/2023' },
  { id: 2, user: 'Trần Thị B', rating: 4, content: 'Bài test khá chính xác, nhưng giao diện cần mượt mà hơn ở điện thoại.', date: '11/10/2023' },
  { id: 3, user: 'Lê Văn C', rating: 5, content: 'Tuyệt vời! Gợi ý rất chi tiết.', date: '08/10/2023' },
];

export const Feedback = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Phản hồi người dùng</h1>
        <p className="text-slate-500">Đọc và quản lý đánh giá từ người dùng ứng dụng.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockFeedbacks.map(fb => (
          <div key={fb.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-slate-800 dark:text-slate-100">{fb.user}</span>
              <span className="text-xs text-slate-400 font-medium">{fb.date}</span>
            </div>
            
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  size={16} 
                  className={star <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'} 
                />
              ))}
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 flex-1 mb-6">"{fb.content}"</p>
            
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
              <button className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-bold transition-colors">
                <Trash2 size={16} /> Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
