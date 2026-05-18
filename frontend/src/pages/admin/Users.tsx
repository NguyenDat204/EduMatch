import { useState, useEffect } from 'react';
import { Search, Trash2, Shield, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export const Users = () => {
  const { user: currentAdmin } = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers();
      if (res.success && res.data) {
        setUsersList(res.data);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (user: any) => {
    setError(null);
    setSuccess(null);
    const newRole = user.role === 'admin' ? 'student' : 'admin';
    
    if (user._id === currentAdmin?._id) {
      setError("Bạn không thể tự hạ quyền quản trị của chính mình.");
      return;
    }

    try {
      const res = await adminService.updateUser(user._id, user.name, user.email, newRole, user.isPro);
      if (res.success && res.data) {
        setUsersList(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u));
        setSuccess(`Đã thay đổi quyền của ${user.name} thành ${newRole.toUpperCase()}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Cập nhật quyền thất bại.");
    }
  };

  const handleDeleteUser = async (user: any) => {
    setError(null);
    setSuccess(null);

    if (user._id === currentAdmin?._id) {
      setError("Bạn không thể xóa tài khoản Admin đang đăng nhập.");
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của ${user.name}? Action này không thể hoàn tác.`)) {
      return;
    }

    try {
      const res = await adminService.deleteUser(user._id);
      if (res.success) {
        setUsersList(prev => prev.filter(u => u._id !== user._id));
        setSuccess(`Đã xóa tài khoản ${user.name} thành công.`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Xóa người dùng thất bại.");
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Chưa rõ';
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Quản lý người dùng</h1>
          <p className="text-slate-500">Xem, chỉnh sửa vai trò, và quản lý các tài khoản đăng ký trên hệ thống.</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, email..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none w-64 text-sm font-semibold shadow-sm transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl flex items-start gap-3 text-sm font-medium border border-red-100 dark:border-red-950/30">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-start gap-3 text-sm font-medium border border-emerald-100 dark:border-emerald-950/30">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary-600" size={36} />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4">Tên</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Ngày đăng ký</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium">
                {filteredUsers.map((user: any) => (
                  <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-950 dark:text-slate-100">{user.name}</td>
                    <td className="px-6 py-4 text-slate-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                        user.role === 'admin' 
                          ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-500' 
                          : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      }`}>
                        {user.role?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleRoleToggle(user)}
                        title="Đổi vai trò người dùng"
                        className="p-2 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        {user.role === 'admin' ? <User size={16} /> : <Shield size={16} />}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        title="Xóa tài khoản"
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                      Không tìm thấy tài khoản người dùng phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
