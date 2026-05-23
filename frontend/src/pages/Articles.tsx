// import { useState, useEffect } from 'react';
// import { BookOpen, Calendar, ChevronRight, Loader2 } from 'lucide-react';
// import { DashboardLayout } from '../layouts';
// import { articleService } from '../services/api';

// export const Articles = () => {
//   const [articles, setArticles] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchArticles = async () => {
//       try {
//         const response = await articleService.getArticles();
//         if (response.success && response.data) {
//           setArticles(response.data);
//         }
//       } catch (err) {
//         console.warn("Failed to fetch articles from backend:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchArticles();
//   }, []);

//   const formatDate = (dateStr: string) => {
//     const d = new Date(dateStr);
//     return `Ngày ${d.getDate()} tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
//   };

//   return (
//     <DashboardLayout>
//       <div className="max-w-6xl mx-auto animate-fade-in">
//         <div className="mb-10 animate-slide-up flex justify-between items-end">
//           <div>
//             <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-2xl mb-4">
//               <BookOpen size={24} />
//             </div>
//             <h1 className="text-3xl font-display font-bold mb-2">Bài viết & Cẩm nang</h1>
//             <p className="text-slate-500">Cập nhật tin tức thị trường và mẹo hay cho con đường sự nghiệp của bạn.</p>
//           </div>
//         </div>

//         {loading ? (
//           <div className="flex justify-center items-center py-20">
//             <Loader2 className="animate-spin text-primary-600" size={32} />
//           </div>
//         ) : articles.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
//             {articles.map((article: any) => (
//               <article key={article._id} className="glass rounded-[2rem] overflow-hidden border-none shadow-premium group cursor-pointer hover:-translate-y-2 transition-transform duration-300 bg-white dark:bg-slate-900">
//                 <div className="relative h-48 overflow-hidden">
//                   <img 
//                     src={article.image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'} 
//                     alt={article.title} 
//                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                   />
//                   <div className="absolute top-4 left-4">
//                     <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg text-xs font-bold text-primary-600">
//                       {article.category || 'Hướng nghiệp'}
//                     </span>
//                   </div>
//                 </div>
                
//                 <div className="p-6">
//                   <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
//                     <Calendar size={14} />
//                     <span>{formatDate(article.createdAt)}</span>
//                     <span className="bullet shrink-0">•</span>
//                     <span>{article.readTime || '5 phút đọc'}</span>
//                   </div>
//                   <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
//                     {article.title}
//                   </h3>
//                   <p className="text-sm text-slate-500 line-clamp-3 mb-6">
//                     {article.content}
//                   </p>
//                   <div className="flex items-center text-primary-600 font-bold text-sm">
//                     Đọc tiếp <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
//                   </div>
//                 </div>
//               </article>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
//             <p className="text-slate-500">Chưa có bài viết cẩm nang hướng nghiệp nào được đăng tải.</p>
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };
