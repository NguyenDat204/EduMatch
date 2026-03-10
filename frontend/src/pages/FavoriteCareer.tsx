import { Heart } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { CareerCard } from '../components/ui/CareerCard';
import { mockCareers } from '../mock/data';

export const FavoriteCareer = () => {
  const favorites = mockCareers.slice(0, 2); // Simulating saved favorites

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-50 text-red-500 rounded-2xl mb-4">
            <Heart size={24} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">Ngành nghề yêu thích</h1>
          <p className="text-slate-500">Danh sách các ngành nghề bạn đã lưu lại để tìm hiểu thêm.</p>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {favorites.map(career => (
              <CareerCard key={career.id} career={career} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-slide-up">
            <p className="text-slate-500 mb-4">Bạn chưa lưu ngành nghề nào.</p>
            <a href="/explore" className="inline-flex px-6 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:scale-105 transition-transform">
              Khám phá ngay
            </a>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
