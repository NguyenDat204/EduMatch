import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { mockCareers } from '../../mock/data';

export const Careers = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Quản lý Ngành nghề</h1>
          <p className="text-slate-500">Thêm, sửa, xóa dữ liệu ngành nghề trong hệ thống.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm ngành nghề..." 
              className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none w-64"
            />
          </div>
          <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-bold transition-colors">
            <Plus size={20} /> Thêm mới
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-sm font-bold text-slate-500">
                <th className="px-6 py-4">Tên ngành</th>
                <th className="px-6 py-4">Nhóm ngành</th>
                <th className="px-6 py-4">Mức lương tham khảo</th>
                <th className="px-6 py-4">Triển vọng</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {mockCareers.map(career => (
                <tr key={career.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">{career.title}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      {career.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-green-600 dark:text-green-400">{career.salary}</td>
                  <td className="px-6 py-4 text-slate-500">{career.growth}</td>
                  <td className="px-6 py-4 flex items-center justify-end gap-2">
                    <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
