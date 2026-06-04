import { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  Loader2,
  GraduationCap,
  ShieldCheck,
  Search,
  Trash2,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Activity,
  History,
  School,
  Star,
  Plus,
  X,
  FileText,
  Database,
  Calendar,
  RefreshCw,
  ExternalLink,
  Eye,
  Heart,
  HeartOff,
  GitCompare,
  Share2,
  Send,
  BookOpen,
} from 'lucide-react';
import { adminService, universityService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export const Analytics = () => {
  const { user: currentAdmin } = useAuth();

  // Data States
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [unisList, setUnisList] = useState<any[]>([]);

  // Loading & UI States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'feedback' | 'surveys' | 'charts' | 'logs' | 'unis'>('users');
  const [refreshing, setRefreshing] = useState(false);

  // User Activity States
  const [selectedActivityUser, setSelectedActivityUser] = useState<any | null>(null);
  const [activityData, setActivityData] = useState<any | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activitySearchQuery, setActivitySearchQuery] = useState('');

  // Filtering & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter] = useState<'all' | 'student' | 'admin'>('all');

  // Add University Form States
  const [showAddUniForm, setShowAddUniForm] = useState(false);
  const [uniName, setUniName] = useState('');
  const [uniLocation, setUniLocation] = useState('Hà Nội, Việt Nam');
  const [uniRanking, setUniRanking] = useState('#1 Việt Nam');
  const [uniLogo, setUniLogo] = useState('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=200&auto=format&fit=crop');
  const [uniProgramsStr, setUniProgramsStr] = useState('Kỹ thuật phần mềm, Trí tuệ nhân tạo');
  const [uniWebsite, setUniWebsite] = useState('https://');

  // Selected Survey Detail Modal
  const [selectedSurvey, setSelectedSurvey] = useState<any | null>(null);

  // Fetch all data, each endpoint isolated so one failure doesn't crash the whole dashboard
  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    // 1. Analytics stats
    try {
      const res = await adminService.getSystemAnalytics();
      if (res.success && res.data) setStats(res.data);
    } catch (e) {
      console.warn('Could not load analytics stats:', e);
    }

    // 2. Users list
    try {
      const res = await adminService.getUsers();
      if (res.success && res.data) setUsersList(res.data);
    } catch (e) {
      console.warn('Could not load users:', e);
    }

    // 3. Feedbacks
    try {
      const res = await adminService.getFeedbackLogs();
      if (res.success && res.data) setFeedbacks(res.data);
    } catch (e) {
      console.warn('Could not load feedbacks:', e);
    }

    // 4. Surveys (may not exist on deployed backend yet – silent fail)
    try {
      const res = await adminService.getAllSurveys();
      if (res.success && res.data) setSurveys(res.data);
    } catch (e) {
      console.warn('Survey endpoint not available (404 ok):', e);
      setSurveys([]);
    }

    // 5. Universities
    try {
      const res = await universityService.getUniversities();
      if (res.success && res.data) setUnisList(res.data);
    } catch (e) {
      console.warn('Could not load universities:', e);
    }

    if (isRefresh) setRefreshing(false);
    else setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  // const handleRoleChange = async (user: any, newRole: string) => {
  //   if (user._id === currentAdmin?._id) { setError('Bạn không thể tự hạ quyền của chính mình.'); return; }
  //   setActionLoading(true);
  //   setError(null); setSuccess(null);
  //   try {
  //     const res = await adminService.updateUser(user._id, user.name, user.email, newRole, user.isPro);
  //     if (res.success) {
  //       setUsersList(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u));
  //       setSuccess(`Đã cập nhật quyền của ${user.name} → ${newRole.toUpperCase()}`);
  //       setTimeout(() => setSuccess(null), 3000);
  //     }
  //   } catch (e: any) {
  //     setError(e.response?.data?.message || 'Cập nhật vai trò thất bại.');
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  const handleDeleteUser = async (user: any) => {
    if (user._id === currentAdmin?._id) { setError('Không thể xóa tài khoản của chính bạn.'); return; }
    if (!window.confirm(`Xóa vĩnh viễn tài khoản "${user.name}"?`)) return;
    setActionLoading(true); setError(null); setSuccess(null);
    try {
      const res = await adminService.deleteUser(user._id);
      if (res.success) {
        setUsersList(prev => prev.filter(u => u._id !== user._id));
        setSuccess(`Đã xóa tài khoản ${user.name}.`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Xóa tài khoản thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm('Xóa phản hồi này?')) return;
    setActionLoading(true); setError(null); setSuccess(null);
    try {
      const res = await adminService.deleteFeedback(id);
      if (res.success) {
        setFeedbacks(prev => prev.filter(fb => fb._id !== id));
        setSuccess('Đã xóa phản hồi.');
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch {
      setError('Xóa phản hồi thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uniName.trim() || !uniLocation.trim()) { setError('Vui lòng điền đầy đủ tên và địa điểm.'); return; }
    setActionLoading(true); setError(null); setSuccess(null);
    try {
      const res = await adminService.createUniversity({
        name: uniName, location: uniLocation, ranking: uniRanking,
        logo: uniLogo, programs: uniProgramsStr.split(',').map(p => p.trim()).filter(Boolean), website: uniWebsite,
      });
      if (res.success && res.data) {
        setUnisList(prev => [res.data, ...prev]);
        setSuccess(`Đã thêm trường "${uniName}" thành công.`);
        setShowAddUniForm(false);
        setUniName(''); setUniLocation('Hà Nội, Việt Nam'); setUniRanking('#1 Việt Nam');
        setUniLogo('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=200&auto=format&fit=crop');
        setUniProgramsStr('Kỹ thuật phần mềm, Trí tuệ nhân tạo'); setUniWebsite('https://');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Thêm trường học thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUni = async (id: string, name: string) => {
    if (!window.confirm(`Xóa trường đại học "${name}"?`)) return;
    setActionLoading(true); setError(null); setSuccess(null);
    try {
      const res = await adminService.deleteUniversity(id);
      if (res.success) {
        setUnisList(prev => prev.filter(u => u._id !== id));
        setSuccess(`Đã xóa trường ${name}.`);
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch {
      setError('Xóa trường học thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered lists
  const filteredUsers = usersList.filter(u => {
    const q = searchQuery.toLowerCase();
    const ok = u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.academicInfo?.school?.toLowerCase().includes(q);
    return roleFilter === 'all' ? ok : ok && u.role === roleFilter;
  });

  const filteredFeedbacks = feedbacks.filter(fb =>
    (fb.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (fb.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (fb.message || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSurveys = surveys.filter(sv =>
    (sv.userId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sv.userId?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sv.result?.archetype || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sv.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUnis = unisList.filter(uni =>
    uni.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uni.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActivityUsers = usersList.filter(u => {
    const q = activitySearchQuery.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const actionLabel: Record<string, string> = {
    view: 'Xem trang',
    save_favorite: 'Lưu yêu thích',
    remove_favorite: 'Bỏ yêu thích',
    compare: 'So sánh',
    chat_about: 'Chat về',
    share: 'Chia sẻ',
    inquire: 'Tư vấn',
    bookmark_article: 'Lưu bài viết'
  };

  const loadUserActivity = async (user: any) => {
    setSelectedActivityUser(user);
    setActivityLoading(true);
    try {
      const res = await adminService.getUserActivity(user._id);
      if (res.success && res.data) {
        setActivityData(res.data);
      } else {
        setActivityData({ interactions: [], favouriteUnis: [], surveys: [] });
      }
    } catch (e) {
      console.error(e);
      setActivityData({ interactions: [], favouriteUnis: [], surveys: [] });
    } finally {
      setActivityLoading(false);
    }
  };

  const getActionIconAndColor = (action: string) => {
    switch (action) {
      case 'view':
        return { icon: Eye, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950/20' };
      case 'save_favorite':
        return { icon: Heart, color: 'text-rose-500', bgColor: 'bg-rose-50 dark:bg-rose-950/20' };
      case 'remove_favorite':
        return { icon: HeartOff, color: 'text-slate-400', bgColor: 'bg-slate-100 dark:bg-navy-700' };
      case 'compare':
        return { icon: GitCompare, color: 'text-indigo-500', bgColor: 'bg-indigo-50 dark:bg-indigo-950/20' };
      case 'chat_about':
        return { icon: MessageSquare, color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-950/20' };
      case 'share':
        return { icon: Share2, color: 'text-cyan-500', bgColor: 'bg-cyan-50 dark:bg-cyan-950/20' };
      case 'inquire':
        return { icon: Send, color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-950/20' };
      case 'bookmark_article':
        return { icon: BookOpen, color: 'text-violet-500', bgColor: 'bg-violet-50 dark:bg-violet-950/20' };
      default:
        return { icon: Activity, color: 'text-slate-500', bgColor: 'bg-slate-50 dark:bg-navy-800' };
    }
  };

  const getActionTargetName = (item: any) => {
    if (item.universityId) {
      return `Trường đại học: ${item.universityId.name || '—'}`;
    }
    if (item.careerId) {
      return `Ngành học: ${item.careerId.title || '—'}`;
    }
    if (item.articleId) {
      return `Bài viết: ${item.articleId.title || '—'}`;
    }
    if (item.metadata?.targetName) {
      return item.metadata.targetName;
    }
    return 'Hệ thống';
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse">
          <Database size={28} className="text-white" />
        </div>
        <p className="text-sm font-semibold text-slate-400">Đang tải dữ liệu quản trị...</p>
      </div>
    );
  }

  const s = stats?.counts || { users: 0, students: 0, admins: 0, feedbacks: 0, careers: 0, universities: 0 };
  const ratingVal = stats?.averageRating || 5.0;

  const statCards = [
    { label: 'Tổng người dùng', value: s.users, icon: Users, gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50 text-blue-600', trend: '+12%' },
    { label: 'Học sinh', value: s.students, icon: GraduationCap, gradient: 'from-emerald-500 to-teal-600', light: 'bg-emerald-50 text-emerald-600', trend: '+8%' },
    { label: 'Quản trị viên', value: s.admins, icon: ShieldCheck, gradient: 'from-violet-500 to-purple-600', light: 'bg-violet-50 text-violet-600', trend: '0%' },
    { label: 'Phản hồi nhận được', value: s.feedbacks, icon: MessageSquare, gradient: 'from-orange-500 to-amber-500', light: 'bg-orange-50 text-orange-600', trend: `${ratingVal}★` },
  ];

  const tabConfig = [
    { id: 'users', label: 'Người dùng', icon: Users, count: usersList.length },
    { id: 'feedback', label: 'Tư vấn', icon: MessageSquare, count: feedbacks.length },
    { id: 'surveys', label: 'Đánh giá', icon: FileText, count: surveys.length },
    { id: 'charts', label: 'Hoạt động', icon: Activity, count: null },
    { id: 'logs', label: 'Nhật ký', icon: History, count: null },
    { id: 'unis', label: 'Đại học', icon: School, count: unisList.length },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-violet-500 to-purple-600 text-white uppercase tracking-widest shadow">
              ⚡ ADMIN CONSOLE
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Quản trị hệ thống
          </h1>
          <p className="text-sm text-slate-500 mt-1">Theo dõi hồ sơ, phân quyền và xử lý dữ liệu tài khoản EduMatch.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-primary-400 hover:text-primary-600 transition-all shadow-sm"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Làm mới
          </button>

          {/* DB Status */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-navy-800 border border-emerald-200 dark:border-emerald-900/40 rounded-xl shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">MongoDB · Online</span>
          </div>
        </div>
      </div>

      {/* ── 4 Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="relative bg-white dark:bg-navy-800 rounded-2xl border border-slate-200/80 dark:border-navy-700 shadow-sm overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            {/* Gradient top bar */}
            <div className={`h-1 w-full bg-gradient-to-r ${card.gradient}`} />
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{card.label}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.light}`}>{card.trend}</span>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black text-slate-900 dark:text-white">{card.value}</p>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.light} bg-opacity-60`}>
                  <card.icon size={20} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Alert banners ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-sm text-red-600 dark:text-red-400">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded-lg"><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto p-1 hover:bg-emerald-100 rounded-lg"><X size={14} /></button>
        </div>
      )}

      {/* ── Tab Navigation ── */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-sm overflow-hidden">
        {/* Tab Bar */}
        <div className="flex border-b border-slate-100 dark:border-navy-700 overflow-x-auto scrollbar-hide">
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-5 py-4 text-xs font-bold whitespace-nowrap border-b-2 transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 bg-primary-50/50 dark:bg-primary-950/10'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-700/50'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
              {tab.count !== null && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 dark:bg-navy-700 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div className="p-5">

          {/* Search + Filter row */}
          {activeTab !== 'charts' && activeTab !== 'logs' && (
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>

              {activeTab === 'unis' && (
                <button
                  onClick={() => setShowAddUniForm(true)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all active:scale-95"
                >
                  <Plus size={15} /> Thêm trường mới
                </button>
              )}
            </div>
          )}

          {/* ═══ TAB 1: Users ═══ */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-navy-700">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-navy-900/60 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    <th className="px-4 py-3">Người dùng</th>
                    <th className="px-4 py-3">Hồ sơ học tập</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                    <th className="px-4 py-3">Quyền</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-navy-700/50">
                  {filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-slate-50/60 dark:hover:bg-navy-700/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 shrink-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm uppercase overflow-hidden">
                              {user.avatar
                                ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />
                                : user.name?.charAt(0)}
                            </div>
                            {user.role === 'admin' && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-violet-500 rounded-full border-2 border-white dark:border-navy-800 flex items-center justify-center">
                                <ShieldCheck size={7} className="text-white" />
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{user.academicInfo?.school || '—'}</p>
                        <p className="text-[10px] text-slate-400">{user.academicInfo?.majorInterest || 'Chưa chọn ngành'}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-medium">
                        <div className="flex items-center gap-1">
                          <Calendar size={11} className="text-slate-300" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          user.role === 'admin'
                            ? 'bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400'
                            : 'bg-slate-50 dark:bg-navy-700 border border-slate-200 dark:border-navy-600 text-slate-700 dark:text-slate-300'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'Học sinh'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          disabled={actionLoading || user._id === currentAdmin?._id}
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors disabled:opacity-30"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={5} className="py-16 text-center text-slate-400 font-medium">Không tìm thấy tài khoản nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ═══ TAB 2: Feedback ═══ */}
          {activeTab === 'feedback' && (
            <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-navy-700">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-navy-900/60 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    <th className="px-4 py-3">Học sinh</th>
                    <th className="px-4 py-3">Nội dung phản hồi</th>
                    <th className="px-4 py-3">Đánh giá</th>
                    <th className="px-4 py-3">Ngày gửi</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-navy-700/50">
                  {filteredFeedbacks.map(fb => (
                    <tr key={fb._id} className="hover:bg-slate-50/60 dark:hover:bg-navy-700/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 dark:text-white">{fb.name || 'Ẩn danh'}</p>
                        <p className="text-[10px] text-slate-400">{fb.email}</p>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="text-slate-600 dark:text-slate-300 truncate">"{fb.message}"</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={12} className={s <= (fb.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{formatDate(fb.createdAt)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button disabled={actionLoading} onClick={() => handleDeleteFeedback(fb._id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredFeedbacks.length === 0 && (
                    <tr><td colSpan={5} className="py-16 text-center text-slate-400 font-medium">Chưa có phản hồi nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ═══ TAB 3: Surveys / Đánh giá ═══ */}
          {activeTab === 'surveys' && (
            surveys.length === 0
              ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-14 h-14 bg-slate-100 dark:bg-navy-700 rounded-2xl flex items-center justify-center">
                    <FileText size={24} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-400">Chưa có dữ liệu trắc nghiệm.</p>
                  <p className="text-xs text-slate-300">Endpoint /api/admin/surveys cần được deploy lên server.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-navy-700">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-navy-900/60 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                        <th className="px-4 py-3">Học sinh</th>
                        <th className="px-4 py-3">Tên bài kiểm tra</th>
                        <th className="px-4 py-3">Holland</th>
                        <th className="px-4 py-3">Độ phù hợp</th>
                        <th className="px-4 py-3">Ngày làm</th>
                        <th className="px-4 py-3 text-right">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-navy-700/50">
                      {filteredSurveys.map(sv => (
                        <tr key={sv._id} className="hover:bg-slate-50/60 dark:hover:bg-navy-700/30 transition-colors">
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-slate-900 dark:text-white">{sv.userId?.name || 'Ẩn danh'}</p>
                            <p className="text-[10px] text-slate-400">{sv.userId?.email}</p>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-medium">{sv.title}</td>
                          <td className="px-4 py-3.5">
                            <span className="px-2 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 font-bold text-[10px] uppercase">
                              {sv.result?.archetype || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-slate-100 dark:bg-navy-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full" style={{ width: `${sv.result?.suitabilityScore || 0}%` }} />
                              </div>
                              <span className="font-bold text-slate-700 dark:text-slate-300">{sv.result?.suitabilityScore || 0}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-500">{formatDate(sv.completedAt)}</td>
                          <td className="px-4 py-3.5 text-right">
                            <button onClick={() => setSelectedSurvey(sv)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg transition-colors">
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
          )}

          {/* ═══ TAB 4: Charts / Hoạt động ═══ */}
          {activeTab === 'charts' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
              {/* Left Panel - Users List (4 cols) */}
              <div className="lg:col-span-4 border-r border-slate-100 dark:border-navy-700 pr-0 lg:pr-6 flex flex-col h-[600px]">
                <div className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Chọn học sinh</h3>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm tên hoặc email..."
                      value={activitySearchQuery}
                      onChange={e => setActivitySearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-navy-750">
                  {filteredActivityUsers.map((user) => {
                    const isSelected = selectedActivityUser?._id === user._id;
                    return (
                      <button
                        key={user._id}
                        onClick={() => loadUserActivity(user)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-primary-50 dark:bg-primary-950/20 border-primary-200 dark:border-primary-800 shadow-sm'
                            : 'bg-white dark:bg-navy-800 border-slate-100 dark:border-navy-700/60 hover:bg-slate-50 dark:hover:bg-navy-700/40'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs uppercase overflow-hidden shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />
                          ) : (
                            user.name?.charAt(0)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-primary-700 dark:text-primary-400' : 'text-slate-800 dark:text-white'}`}>
                            {user.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          user.role === 'admin' 
                            ? 'bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400' 
                            : 'bg-slate-100 dark:bg-navy-700 text-slate-500'
                        }`}>
                          {user.role === 'admin' ? 'AD' : 'ST'}
                        </span>
                      </button>
                    );
                  })}
                  {filteredActivityUsers.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-8">Không tìm thấy người dùng nào.</p>
                  )}
                </div>
              </div>

              {/* Right Panel - Activity Details (8 cols) */}
              <div className="lg:col-span-8 flex flex-col h-[600px]">
                {!selectedActivityUser ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/40 dark:bg-navy-900/10 rounded-2xl border border-dashed border-slate-200 dark:border-navy-700">
                    <Activity className="w-12 h-12 text-slate-300 dark:text-navy-600 mb-3 animate-pulse" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Chưa chọn học sinh</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Vui lòng chọn một tài khoản ở danh sách bên trái để xem chi tiết lịch sử tương tác, trắc nghiệm và trường yêu thích.
                    </p>
                  </div>
                ) : activityLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                    <p className="text-xs font-semibold text-slate-400">Đang tải hoạt động...</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-6 pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-navy-750">
                    {/* User Profile Header Summary */}
                    <div className="bg-slate-50 dark:bg-navy-900/40 p-4 rounded-2xl border border-slate-200/60 dark:border-navy-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white font-black text-sm uppercase overflow-hidden shrink-0">
                          {selectedActivityUser.avatar ? (
                            <img src={selectedActivityUser.avatar} alt={selectedActivityUser.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />
                          ) : (
                            selectedActivityUser.name?.charAt(0)
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                            {selectedActivityUser.name}
                            <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-200 dark:bg-navy-700 rounded-full text-slate-500">
                              Lớp {selectedActivityUser.academicInfo?.grade || '—'}
                            </span>
                          </h4>
                          <p className="text-xs text-slate-400">{selectedActivityUser.email}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Trường: <span className="font-semibold text-slate-600 dark:text-slate-400">{selectedActivityUser.academicInfo?.school || 'Chưa cập nhật'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-[10px] text-slate-400 block">Ngành học quan tâm</span>
                        <span className="inline-block mt-0.5 px-2.5 py-1 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 font-bold rounded-lg border border-primary-100 dark:border-primary-900/40">
                          {selectedActivityUser.academicInfo?.majorInterest || 'Chưa chọn'}
                        </span>
                      </div>
                    </div>

                    {/* Quick activity counts */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-navy-800 p-3 rounded-xl border border-slate-100 dark:border-navy-750/60 text-center">
                        <span className="text-[18px] font-black text-blue-600 block">{activityData?.interactions?.length || 0}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tương tác</span>
                      </div>
                      <div className="bg-white dark:bg-navy-800 p-3 rounded-xl border border-slate-100 dark:border-navy-750/60 text-center">
                        <span className="text-[18px] font-black text-rose-600 block">{activityData?.favouriteUnis?.length || 0}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Trường yêu thích</span>
                      </div>
                      <div className="bg-white dark:bg-navy-800 p-3 rounded-xl border border-slate-100 dark:border-navy-750/60 text-center">
                        <span className="text-[18px] font-black text-purple-600 block">{activityData?.surveys?.length || 0}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Làm trắc nghiệm</span>
                      </div>
                    </div>

                    {/* Timeline & Details tabbed sections */}
                    <div className="space-y-6">
                      {/* Section 1: Timeline */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <History size={13} className="text-slate-400" />
                          Nhật ký tương tác chi tiết
                        </h4>
                        {activityData?.interactions?.length === 0 ? (
                          <div className="p-6 bg-slate-50/40 dark:bg-navy-900/10 rounded-xl border border-slate-100 dark:border-navy-700/60 text-center text-slate-400 text-xs">
                            Không tìm thấy lịch sử tương tác nào của học sinh này.
                          </div>
                        ) : (
                          <div className="relative border-l-2 border-slate-100 dark:border-navy-700 ml-3 pl-5 space-y-4">
                            {activityData?.interactions?.map((item: any, idx: number) => {
                              const iconInfo = getActionIconAndColor(item.action);
                              const targetName = getActionTargetName(item);
                              return (
                                <div key={idx} className="relative">
                                  {/* Bullet point icon */}
                                  <span className={`absolute -left-[29px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${iconInfo.bgColor} shadow-sm border border-white dark:border-navy-900`}>
                                    <iconInfo.icon size={8} className={iconInfo.color} />
                                  </span>
                                  <div className="text-xs">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-bold text-slate-850 dark:text-slate-200">
                                        {actionLabel[item.action] || item.action}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-medium">
                                        {formatDate(item.timestamp)}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      {targetName}
                                      {item.duration && (
                                        <span className="text-slate-400 ml-1.5">({item.duration} giây)</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Section 2: Favourite Universities */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <School size={13} className="text-slate-400" />
                          Trường đại học yêu thích
                        </h4>
                        {activityData?.favouriteUnis?.length === 0 ? (
                          <div className="p-6 bg-slate-50/40 dark:bg-navy-900/10 rounded-xl border border-slate-100 dark:border-navy-700/60 text-center text-slate-400 text-xs">
                            Học sinh chưa lưu trường đại học yêu thích nào.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {activityData?.favouriteUnis?.map((item: any, idx: number) => {
                              const uni = item.universityId;
                              if (!uni) return null;
                              return (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-navy-800 border border-slate-100 dark:border-navy-750/60 rounded-xl hover:shadow-sm transition-all">
                                  <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 overflow-hidden flex items-center justify-center shrink-0">
                                    <img src={uni.logo} alt={uni.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=200&auto=format&fit=crop'; }} />
                                  </div>
                                  <div className="min-w-0">
                                    <h5 className="text-xs font-bold text-slate-850 dark:text-white line-clamp-1">{uni.name}</h5>
                                    <p className="text-[10px] text-slate-400 line-clamp-1">{uni.location}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Section 3: Surveys Taken */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <FileText size={13} className="text-slate-400" />
                          Lịch sử làm trắc nghiệm hướng nghiệp
                        </h4>
                        {activityData?.surveys?.length === 0 ? (
                          <div className="p-6 bg-slate-50/40 dark:bg-navy-900/10 rounded-xl border border-slate-100 dark:border-navy-700/60 text-center text-slate-400 text-xs">
                            Học sinh chưa hoàn thành bài trắc nghiệm nào.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {activityData?.surveys?.map((sv: any) => (
                              <div key={sv._id} className="flex items-center justify-between p-3 bg-white dark:bg-navy-800 border border-slate-100 dark:border-navy-750/60 rounded-xl hover:shadow-sm transition-all text-xs">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400">
                                      {sv.result?.archetype || 'N/A'}
                                    </span>
                                    <span className="font-bold text-slate-800 dark:text-white">{sv.title}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-1">Độ phù hợp: {sv.result?.suitabilityScore || 0}% · Ngày làm: {formatDate(sv.completedAt)}</p>
                                </div>
                                <button
                                  onClick={() => setSelectedSurvey(sv)}
                                  className="p-1.5 bg-slate-50 dark:bg-navy-900 text-slate-400 hover:text-primary-500 rounded-lg transition-colors"
                                >
                                  <Eye size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ TAB 5: Activity Logs ═══ */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Sự kiện gần đây nhất</p>

              {/* Recent signups */}
              {stats?.recentSignups?.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-1"><UserIcon size={11} /> Đăng ký mới</p>
                  <div className="space-y-2">
                    {stats.recentSignups.map((u: any) => (
                      <div key={u._id} className="flex items-center gap-3 p-3 bg-blue-50/60 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/20 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{u.academicInfo?.school || 'Chưa cập nhật'}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{formatDate(u.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent feedbacks */}
              {stats?.recentFeedbacks?.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-1"><MessageSquare size={11} /> Phản hồi mới</p>
                  <div className="space-y-2">
                    {stats.recentFeedbacks.map((fb: any) => (
                      <div key={fb._id} className="flex items-center gap-3 p-3 bg-orange-50/60 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/20 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shrink-0">
                          <MessageSquare size={14} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{fb.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">"{fb.message}"</p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= (fb.rating||5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent surveys */}
              {stats?.recentSurveys?.length > 0 && (
                <div>
                  <p className="text-[10px] font-extrabold text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-1"><FileText size={11} /> Trắc nghiệm mới</p>
                  <div className="space-y-2">
                    {stats.recentSurveys.map((sv: any) => (
                      <div key={sv._id} className="flex items-center gap-3 p-3 bg-purple-50/60 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/20 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shrink-0">
                          <FileText size={14} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{sv.userId?.name || 'Ẩn danh'}</p>
                          <p className="text-[10px] text-slate-400">{sv.result?.archetype} · {sv.result?.suitabilityScore}%</p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{formatDate(sv.completedAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!stats?.recentSignups?.length && !stats?.recentFeedbacks?.length && !stats?.recentSurveys?.length && (
                <div className="py-16 text-center text-slate-400 text-sm">Chưa có sự kiện nào được ghi nhận.</div>
              )}
            </div>
          )}

          {/* ═══ TAB 6: Universities ═══ */}
          {activeTab === 'unis' && (
            <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-navy-700">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-navy-900/60 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    <th className="px-4 py-3">Tên trường</th>
                    <th className="px-4 py-3">Địa điểm</th>
                    <th className="px-4 py-3">Thứ hạng</th>
                    <th className="px-4 py-3">Chương trình trọng điểm</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-navy-700/50">
                  {filteredUnis.map(uni => (
                    <tr key={uni._id} className="hover:bg-slate-50/60 dark:hover:bg-navy-700/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-700 overflow-hidden border border-slate-200 dark:border-navy-600 shrink-0">
                            <img src={uni.logo} alt={uni.name} className="w-full h-full object-cover"
                              onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=200&auto=format&fit=crop'; }} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{uni.name}</p>
                            {uni.website && (
                              <a href={uni.website} target="_blank" rel="noreferrer" className="text-[10px] text-primary-500 flex items-center gap-0.5 hover:underline">
                                <ExternalLink size={9} /> Website
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{uni.location}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 px-2 py-1 rounded-lg">{uni.ranking}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {uni.programs?.slice(0,2).map((p: string, i: number) => (
                            <span key={i} className="text-[9px] bg-slate-100 dark:bg-navy-700 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">{p}</span>
                          ))}
                          {uni.programs?.length > 2 && <span className="text-[9px] text-slate-400">+{uni.programs.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button disabled={actionLoading} onClick={() => handleDeleteUni(uni._id, uni.name)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUnis.length === 0 && (
                    <tr><td colSpan={5} className="py-16 text-center text-slate-400 font-medium">Chưa có trường đại học nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* ── Add University Drawer ── */}
      {showAddUniForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-white dark:bg-navy-900 border-l border-slate-200 dark:border-navy-700 shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-navy-700 bg-slate-50 dark:bg-navy-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Thêm trường đại học</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Thêm đối tác giáo dục mới vào hệ thống</p>
              </div>
              <button onClick={() => setShowAddUniForm(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 dark:hover:bg-navy-700 transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUni} className="flex-1 p-5 space-y-4">
              {[
                { label: 'Tên trường đại học', key: 'name', val: uniName, set: setUniName, required: true, placeholder: 'Ví dụ: Đại học Bách Khoa Hà Nội' },
                { label: 'Địa điểm', key: 'location', val: uniLocation, set: setUniLocation, required: true, placeholder: 'Ví dụ: Hà Nội, Việt Nam' },
                { label: 'Thứ hạng / Đặc trưng', key: 'ranking', val: uniRanking, set: setUniRanking, required: false, placeholder: '#1 Việt Nam' },
                { label: 'Logo URL', key: 'logo', val: uniLogo, set: setUniLogo, required: false, placeholder: 'https://...' },
                { label: 'Website', key: 'website', val: uniWebsite, set: setUniWebsite, required: false, placeholder: 'https://...' },
                { label: 'Chương trình đào tạo (cách nhau bằng dấu phẩy)', key: 'programs', val: uniProgramsStr, set: setUniProgramsStr, required: false, placeholder: 'Kỹ thuật phần mềm, AI, ...' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">{field.label}</label>
                  <input
                    type="text"
                    required={field.required}
                    value={field.val}
                    onChange={e => field.set(e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary-400"
                  />
                </div>
              ))}

              <div className="pt-4 flex gap-3">
                <button type="submit" disabled={actionLoading} className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow transition-all active:scale-95 disabled:opacity-50 text-sm">
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Thêm mới
                </button>
                <button type="button" onClick={() => setShowAddUniForm(false)} className="flex-1 py-3 bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-200 transition-all">
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Survey Detail Modal ── */}
      {selectedSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-navy-700 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-navy-700">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedSurvey.title}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{selectedSurvey.userId?.name} ({selectedSurvey.userId?.email})</p>
              </div>
              <button onClick={() => setSelectedSurvey(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-700 transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 font-black text-sm uppercase tracking-wide">
                  {selectedSurvey.result?.archetype}
                </span>
                <span className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                  <div className="w-24 h-2 bg-slate-100 dark:bg-navy-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-emerald-400 rounded-full" style={{ width: `${selectedSurvey.result?.suitabilityScore || 0}%` }} />
                  </div>
                  {selectedSurvey.result?.suitabilityScore || 0}%
                </span>
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Mô tả</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-navy-800 p-3.5 rounded-xl border border-slate-100 dark:border-navy-700">
                  {selectedSurvey.result?.description || 'Không có mô tả.'}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Phân tích AI</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-navy-800 p-3.5 rounded-xl border border-slate-100 dark:border-navy-700 font-mono text-xs">
                  {selectedSurvey.result?.insights || 'Không có phân tích.'}
                </p>
              </div>

              {selectedSurvey.result?.careers?.length > 0 && (
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Ngành nghề gợi ý</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedSurvey.result.careers.map((c: any, i: number) => (
                      <div key={i} className="p-3 border border-slate-100 dark:border-navy-700 rounded-xl bg-slate-50 dark:bg-navy-800">
                        <p className="text-xs font-bold text-primary-600 dark:text-primary-400">{c.title || c.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{c.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-navy-700 flex justify-end">
              <button onClick={() => setSelectedSurvey(null)} className="px-5 py-2 bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
