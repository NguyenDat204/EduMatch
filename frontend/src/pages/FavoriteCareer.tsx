import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { CareerCard } from '../components/ui/CareerCard';
import { careerService } from '../services/api';

export const FavoriteCareer = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await careerService.getFavorites();
        if (response.success && response.data) {
          setFavorites(response.data);
        }
      } catch (err) {
        console.warn("Failed to load saved favorites from backend:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl mb-4">
            <Heart size={24} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">Ngành nghề yêu thích</h1>
          <p className="text-slate-500">Danh sách các ngành nghề bạn đã lưu lại để tìm hiểu thêm.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
            {favorites.map((career: any) => (
              <CareerCard 
                key={career._id || career.id} 
                career={{
                  id: career._id || career.id,
                  title: career.title,
                  description: career.description,
                  salary: career.salary,
                  growth: career.growth,
                  skills: career.skills,
                  suitability: career.suitability,
                  category: career.category,
                }} 
                showSuitability={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-slide-up bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 mb-6 font-medium">Bạn chưa lưu ngành nghề nào.</p>
            <a href="/explore" className="inline-flex px-8 py-3.5 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:scale-105 active:scale-95 transition-transform text-sm">
              Khám phá ngay
            </a>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
