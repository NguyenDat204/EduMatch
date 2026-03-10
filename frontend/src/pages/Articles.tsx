import { BookOpen, Calendar, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '../layouts';

const articles = [
  {
    id: 1,
    title: 'Top 5 ngành nghề CNTT hot nhất năm 2024',
    category: 'Thị trường',
    date: '10 Tháng 10, 2023',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop',
    excerpt: 'Khám phá những vị trí công việc trong lĩnh vực Công nghệ thông tin có mức lương hấp dẫn và nhu cầu tuyển dụng cao nhất hiện nay...',
  },
  {
    id: 2,
    title: 'Làm thế nào để chọn đúng trường Đại học?',
    category: 'Cẩm nang',
    date: '05 Tháng 10, 2023',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop',
    excerpt: 'Những tiêu chí quan trọng học sinh THPT cần biết trước khi nộp hồ sơ xét tuyển đại học. Tầm quan trọng của văn hóa trường học...',
  },
  {
    id: 3,
    title: 'Phát triển kỹ năng mềm cho sinh viên Y Dược',
    category: 'Kỹ năng',
    date: '28 Tháng 9, 2023',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop',
    excerpt: 'Bên cạnh kiến thức chuyên môn, kỹ năng giao tiếp và thấu cảm là yếu tố quyết định sự nghiệp của một bác sĩ tương lai...',
  }
];

export const Articles = () => {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 animate-slide-up flex justify-between items-end">
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl mb-4">
              <BookOpen size={24} />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">Bài viết & Cẩm nang</h1>
            <p className="text-slate-500">Cập nhật tin tức thị trường và mẹo hay cho con đường sự nghiệp của bạn.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {articles.map(article => (
            <article key={article.id} className="glass rounded-[2rem] overflow-hidden border-none shadow-premium group cursor-pointer hover:-translate-y-2 transition-transform duration-300">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg text-xs font-bold text-primary-600">
                    {article.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  <Calendar size={14} />
                  <span>{article.date}</span>
                </div>
                <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-3 mb-6">
                  {article.excerpt}
                </p>
                <div className="flex items-center text-primary-600 font-bold text-sm">
                  Đọc tiếp <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
