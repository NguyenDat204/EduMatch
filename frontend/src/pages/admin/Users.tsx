import { Search, Ban, CheckCircle2, MoreVertical } from 'lucide-react';

const users = [
  { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', role: 'Student', status: 'Active', date: '12/10/2023' },
  { id: 2, name: 'Trần Thị B', email: 'tranthib@gmail.com', role: 'Student', status: 'Blocked', date: '11/10/2023' },
  { id: 3, name: 'Lê Văn C', email: 'levanc@gmail.com', role: 'Premium', status: 'Active', date: '05/10/2023' },
];

export const Users = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Quản lý người dùng</h1>
          <p className="text-slate-500">Xem và quản lý danh sách tài khoản người dùng hệ thống.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm người dùng..." 
            className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none w-64"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-sm font-bold text-slate-500">
                <th className="px-6 py-4">Tên</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Trang thái</th>
                <th className="px-6 py-4">Ngày đăng ký</th>
                <th className="px-6 py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">{user.name}</td>
                  <td className="px-6 py-4 text-slate-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.status === 'Active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-600 dark:bg-green-900/20">
                        <CheckCircle2 size={14} /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-600 dark:bg-red-900/20">
                        <Ban size={14} /> Bị khóa
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{user.date}</td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <MoreVertical size={18} />
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
