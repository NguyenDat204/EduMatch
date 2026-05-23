import { useState, useEffect } from 'react';
import { Search, Trash2, Shield, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export const Users = () => {
  const { user: currentAdmin }  = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers();
      if (res.success && res.data) setUsersList(res.data);
    } catch {
      setError('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleToggle = async (user: any) => {
    setError(null); setSuccess(null);
    if (user._id === currentAdmin?._id) { setError('Bạn không thể tự hạ quyền của chính mình.'); return; }
    const newRole = user.role === 'admin' ? 'student' : 'admin';
    try {
      const res = await adminService.updateUser(user._id, user.name, user.email, newRole, user.isPro);
      if (res.success) {
        setUsersList((prev) => prev.map((u) => u._id === user._id ? { ...u, role: newRole } : u));
        setSuccess(`Đã đổi quyền ${user.name} → ${newRole.toUpperCase()}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cập nhật quyền thất bại.');
    }
  };

  const handleDeleteUser = async (user: any) => {
    setError(null); setSuccess(null);
    if (user._id === currentAdmin?._id) { setError('Không thể xóa tài khoản đang đăng nhập.'); return; }
    if (!window.confirm(`Xóa vĩnh viễn tài khoản ${user.name}?`)) return;
    try {
      const res = await adminService.deleteUser(user._id);
      if (res.success) {
        setUsersList((prev) => prev.filter((u) => u._id !== user._id));
        setSuccess(`Đã xóa tài khoản ${user.name}.`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Xóa người dùng thất bại.');
    }
  };

  const filtered = usersList.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fmt = (d: string) => {
    if (!d) return '—';
    const dt = new Date(d);
    return `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý người dùng</h1>
          <p className="text-sm text-slate-500 mt-0.5">Xem và quản lý tài khoản trên hệ thống.</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 dark:border-navy-600 rounded-lg bg-white dark:bg-navy-800 focus:ring-2 focus:ring-primary-500 outline-none w-56 text-sm transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-2.5 text-sm border border-red-100 dark:border-red-900/30">
          <AlertCircle size={15} className="shrink-0 mt-0.5" /> <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3.5 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-xl flex items-start gap-2.5 text-sm border border-green-100 dark:border-green-900/30">
          <CheckCircle2 size={15} className="shrink-0 mt-0.5" /> <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      ) : (
        <div className="bg-white dark:bg-navy-800 rounded-xl border border-slate-200 dark:border-navy-700 overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-900/50 border-b border-slate-200 dark:border-navy-700 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Tên</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Vai trò</th>
                  <th className="px-5 py-3.5">Ngày đăng ký</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700">
                {filtered.map((user: any) => (
                  <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-navy-700/50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">{user.name}</td>
                    <td className="px-5 py-3.5 text-slate-500">{user.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        user.role === 'admin'
                          ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                          : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{fmt(user.createdAt)}</td>
                    <td className="px-5 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleRoleToggle(user)}
                        title="Đổi vai trò"
                        className="p-1.5 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors"
                      >
                        {user.role === 'admin' ? <User size={15} /> : <Shield size={15} />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        title="Xóa tài khoản"
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-400 text-sm">
                      Không tìm thấy tài khoản phù hợp.
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
