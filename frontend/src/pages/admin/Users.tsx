import { useState, useEffect, useMemo } from 'react';
import {
  Search, Trash2, Shield, User, Loader2, CheckCircle2, AlertCircle,
  ShieldCheck, ChevronDown, Users as UsersIcon, X, Filter, Calendar,
} from 'lucide-react';
import { adminService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

const fmt = (d: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
};

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
  student: 'bg-sky-100 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800',
  university: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
};

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin', student: 'Học sinh', university: 'Đại học',
};

export const Users = () => {
  const { user: currentAdmin } = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin' | 'university'>('all');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers();
      if (res.success && res.data) setUsersList(res.data);
    } catch {
      setError('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => usersList.filter(u => {
    const q = searchQuery.toLowerCase();
    const matchQuery = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.academicInfo?.school?.toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchQuery && matchRole;
  }), [usersList, searchQuery, roleFilter]);

  const showFeedback = (msg: string, isError = false) => {
    if (isError) { setError(msg); setSuccess(null); }
    else { setSuccess(msg); setError(null); }
    setTimeout(() => { setError(null); setSuccess(null); }, 3500);
  };

  const handleRoleChange = async (user: any, newRole: string) => {
    if (user._id === currentAdmin?._id) { showFeedback('Bạn không thể tự thay đổi quyền của mình.', true); return; }
    setActionLoading(true);
    try {
      const res = await adminService.updateUser(user._id, user.name, user.email, newRole, user.isPro);
      if (res.success) {
        setUsersList(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u));
        if (selectedUser?._id === user._id) setSelectedUser((prev: any) => ({ ...prev, role: newRole }));
        showFeedback(`Đã cập nhật quyền: ${user.name} → ${ROLE_LABEL[newRole]}`);
      }
    } catch (err: any) {
      showFeedback(err.response?.data?.message || 'Cập nhật thất bại.', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePro = async (user: any) => {
    setActionLoading(true);
    try {
      const res = await adminService.updateUser(user._id, user.name, user.email, user.role, !user.isPro);
      if (res.success) {
        setUsersList(prev => prev.map(u => u._id === user._id ? { ...u, isPro: !u.isPro } : u));
        if (selectedUser?._id === user._id) setSelectedUser((prev: any) => ({ ...prev, isPro: !prev.isPro }));
        showFeedback(`Đã ${!user.isPro ? 'cấp' : 'thu hồi'} Pro cho ${user.name}`);
      }
    } catch {
      showFeedback('Thao tác thất bại.', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (user: any) => {
    if (user._id === currentAdmin?._id) { showFeedback('Không thể xóa tài khoản của chính bạn.', true); return; }
    if (!window.confirm(`Xóa vĩnh viễn tài khoản "${user.name}" (${user.email})? Hành động này không thể hoàn tác.`)) return;
    setActionLoading(true);
    try {
      const res = await adminService.deleteUser(user._id);
      if (res.success) {
        setUsersList(prev => prev.filter(u => u._id !== user._id));
        if (selectedUser?._id === user._id) setSelectedUser(null);
        showFeedback(`Đã xóa tài khoản ${user.name}.`);
      }
    } catch (err: any) {
      showFeedback(err.response?.data?.message || 'Xóa thất bại.', true);
    } finally {
      setActionLoading(false);
    }
  };

  const roleCounts = useMemo(() => ({
    all: usersList.length,
    student: usersList.filter(u => u.role === 'student').length,
    admin: usersList.filter(u => u.role === 'admin').length,
    university: usersList.filter(u => u.role === 'university').length,
  }), [usersList]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Quản lý người dùng</h1>
          <p className="text-sm text-slate-500 mt-0.5">{usersList.length} tài khoản trong hệ thống.</p>
        </div>
      </div>
      {/* Alert banners */}
      {error && (
        <div className="flex items-center gap-3 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-sm text-red-600 dark:text-red-400">
          <AlertCircle size={16} className="shrink-0" /><span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 size={16} className="shrink-0" /><span className="flex-1">{success}</span>
          <button onClick={() => setSuccess(null)}><X size={14} /></button>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên, email, trường học..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            />
          </div>
          {/* Role filter */}
          <div className="flex gap-1.5 flex-wrap">
            {(['all', 'student', 'admin', 'university'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap',
                  roleFilter === role
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                )}
              >
                <Filter size={11} />
                {role === 'all' ? 'Tất cả' : ROLE_LABEL[role]}
                <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] font-black', roleFilter === role ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500')}>
                  {roleCounts[role]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-3.5">Người dùng</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">Trường / Ngành</th>
                  <th className="px-5 py-3.5 hidden sm:table-cell">Ngày đăng ký</th>
                  <th className="px-5 py-3.5">Quyền</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filtered.map((user) => (
                  <tr
                    key={user._id}
                    className={cn('hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer', selectedUser?._id === user._id ? 'bg-indigo-50/50 dark:bg-indigo-950/10' : '')}
                    onClick={() => setSelectedUser(selectedUser?._id === user._id ? null : user)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 shrink-0">
                          {user.avatar && !user.avatar.includes('pravatar.cc') ? (
                            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                              {user.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                          {user.role === 'admin' && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-violet-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                              <ShieldCheck size={7} className="text-white" />
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{user.name}</p>
                          <p className="text-[11px] text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{user.academicInfo?.school || '—'}</p>
                      <p className="text-[11px] text-slate-400">{user.academicInfo?.majorInterest || 'Chưa chọn ngành'}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Calendar size={12} className="text-slate-300" /> {fmt(user.createdAt)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn('inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border', ROLE_BADGE[user.role] || ROLE_BADGE.student)}>
                        {ROLE_LABEL[user.role] || user.role}
                      </span>
                      {user.isPro && (
                        <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">Pro</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <div className="relative group">
                          <button
                            disabled={actionLoading || user._id === currentAdmin?._id}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg transition-colors disabled:opacity-30 flex items-center gap-1"
                            title="Đổi quyền"
                          >
                            {user.role === 'admin' ? <User size={14} /> : <Shield size={14} />}
                            <ChevronDown size={11} />
                          </button>
                          {/* Dropdown */}
                          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-36">
                            {['student', 'admin', 'university'].filter(r => r !== user.role).map(role => (
                              <button
                                key={role}
                                disabled={actionLoading}
                                onClick={() => handleRoleChange(user, role)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 transition-colors"
                              >
                                Đặt làm {ROLE_LABEL[role]}
                              </button>
                            ))}
                            <div className="border-t border-slate-100 dark:border-slate-700" />
                            <button
                              disabled={actionLoading}
                              onClick={() => handleTogglePro(user)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
                            >
                              {user.isPro ? 'Thu hồi Pro' : 'Cấp Pro'}
                            </button>
                          </div>
                        </div>
                        <button
                          disabled={actionLoading || user._id === currentAdmin?._id}
                          onClick={() => handleDelete(user)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors disabled:opacity-30"
                          title="Xóa tài khoản"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <UsersIcon size={28} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-slate-400 font-medium text-sm">Không tìm thấy tài khoản nào.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Expanded user detail */}
          {selectedUser && (
            <div className="border-t border-slate-100 dark:border-slate-700 p-5 bg-slate-50 dark:bg-slate-900/40 animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Chi tiết: {selectedUser.name}</h3>
                <button onClick={() => setSelectedUser(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X size={15} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {[
                  ['Email', selectedUser.email],
                  ['Vai trò', ROLE_LABEL[selectedUser.role] || selectedUser.role],
                  ['Gói', selectedUser.isPro ? 'Pro' : 'Miễn phí'],
                  ['Đăng ký', fmt(selectedUser.createdAt)],
                  ['Trường', selectedUser.academicInfo?.school || '—'],
                  ['Lớp', selectedUser.academicInfo?.grade ? `Lớp ${selectedUser.academicInfo.grade}` : '—'],
                  ['Ngành quan tâm', selectedUser.academicInfo?.majorInterest || '—'],
                  ['Holland', selectedUser.personalityTest?.archetype || 'Chưa làm trắc nghiệm'],
                ].map(([label, val]) => (
                  <div key={label} className="bg-white dark:bg-slate-800 rounded-lg p-2.5 border border-slate-100 dark:border-slate-700">
                    <p className="text-slate-400 mb-0.5 font-semibold uppercase tracking-wider text-[10px]">{label}</p>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold truncate">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-slate-400 text-right">
        Hiển thị {filtered.length} / {usersList.length} tài khoản
      </p>
    </div>
  );
};
