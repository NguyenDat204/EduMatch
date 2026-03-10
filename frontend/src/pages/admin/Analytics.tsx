import { Users, Briefcase, MessageSquare, TrendingUp } from 'lucide-react';

export const Analytics = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Thống kê & Báo cáo</h1>
        <p className="text-slate-500">Tổng quan tình hình sử dụng hệ thống.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Users, label: 'Tổng người dùng', value: '12,543', trend: '+12%', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: Briefcase, label: 'Ngành nghề', value: '142', trend: '+5', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { icon: MessageSquare, label: 'Phản hồi', value: '892', trend: '+24', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { icon: TrendingUp, label: 'Lượt làm test', value: '45,210', trend: '+18%', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-bold font-display">{stat.value}</h3>
                  <span className="text-xs font-bold text-green-500">{stat.trend}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mock Chart Area */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-bold mb-6">Lượt đăng ký mới (30 ngày qua)</h3>
        <div className="h-64 flex items-end justify-between gap-2 overflow-hidden px-4">
          {/* Simple CSS-based bar chart representation */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={i} 
              className="w-full bg-primary-100 dark:bg-primary-900/30 rounded-t-sm hover:bg-primary-500 transition-colors cursor-pointer group relative"
              style={{ height: `${Math.random() * 80 + 20}%` }}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded font-bold whitespace-nowrap transition-opacity">
                Ngày {i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
