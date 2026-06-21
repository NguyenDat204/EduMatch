import { useState, useEffect, useMemo } from 'react';
import {
  CreditCard, Plus, Edit2, Trash2, Check, X, Loader2,
  DollarSign, Activity, Users, Award, TrendingUp, BarChart2,
  AlertCircle, CheckCircle2, ToggleLeft, ToggleRight
} from 'lucide-react';
import { adminPlanService } from '../../services/api';
import type { SubscriptionPlan, DashboardMetrics } from '../../types';

export const Plans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Feedback States
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal / Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    duration_days: 30,
    is_active: true,
  });

  const showFeedback = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setSuccess(null);
    } else {
      setSuccess(msg);
      setError(null);
    }
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, dashboardRes] = await Promise.all([
        adminPlanService.getPlans(),
        adminPlanService.getDashboard(),
      ]);

      if (plansRes.success) setPlans(plansRes.data);
      if (dashboardRes.success) setMetrics(dashboardRes.data);
    } catch (err: any) {
      showFeedback('Có lỗi xảy ra khi tải dữ liệu từ máy chủ.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: 49000,
      duration_days: 30,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      price: plan.price,
      duration_days: plan.duration_days,
      is_active: plan.is_active,
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    setActionLoading(true);
    try {
      const updatedStatus = !plan.is_active;
      const res = await adminPlanService.updatePlan(plan._id, { is_active: updatedStatus });
      if (res.success) {
        setPlans(prev => prev.map(p => p._id === plan._id ? { ...p, is_active: updatedStatus } : p));
        showFeedback(`Đã chuyển đổi trạng thái gói "${plan.name}" sang ${updatedStatus ? 'Hoạt động' : 'Tắt'}.`);
      }
    } catch (err: any) {
      showFeedback(err.response?.data?.message || 'Không thể cập nhật trạng thái.', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      showFeedback('Vui lòng nhập tên gói và mã gói.', true);
      return;
    }
    if (formData.price < 0 || formData.duration_days <= 0) {
      showFeedback('Giá gói và thời hạn phải là số dương hợp lệ.', true);
      return;
    }

    setActionLoading(true);
    try {
      if (editingPlan) {
        // Update
        const res = await adminPlanService.updatePlan(editingPlan._id, formData);
        if (res.success) {
          setPlans(prev => prev.map(p => p._id === editingPlan._id ? res.data : p));
          showFeedback(`Cập nhật gói "${formData.name}" thành công.`);
          setIsModalOpen(false);
        }
      } else {
        // Create
        const res = await adminPlanService.createPlan(formData);
        if (res.success) {
          setPlans(prev => [res.data, ...prev]);
          showFeedback(`Đã tạo gói dịch vụ "${formData.name}" thành công.`);
          setIsModalOpen(false);
        }
      }
      
      // Reload dashboard stats as plans pricing could affect metrics later
      adminPlanService.getDashboard().then(r => {
        if (r.success) setMetrics(r.data);
      });
    } catch (err: any) {
      showFeedback(err.response?.data?.message || 'Không thể lưu gói dịch vụ.', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePlan = async (plan: SubscriptionPlan) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa gói "${plan.name}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await adminPlanService.deletePlan(plan._id);
      if (res.success) {
        setPlans(prev => prev.filter(p => p._id !== plan._id));
        showFeedback(`Đã xóa gói dịch vụ "${plan.name}" thành công.`);
      }
    } catch (err: any) {
      showFeedback(err.response?.data?.message || 'Không thể xóa gói đã phát sinh giao dịch.', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper for rendering badges
  const bestSeller = useMemo(() => {
    if (!metrics || !metrics.bestSellingPlans || metrics.bestSellingPlans.length === 0) return null;
    return metrics.bestSellingPlans[0];
  }, [metrics]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard size={24} className="text-indigo-500" />
            Quản lý gói dịch vụ & Doanh thu
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">CRUD các gói dịch vụ và xem thống kê kinh doanh thời gian thực.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
        >
          <Plus size={14} /> Thêm gói mới
        </button>
      </div>

      {/* Alert banners */}
      {error && (
        <div className="flex items-center gap-3 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-sm text-red-600 dark:text-red-400">
          <AlertCircle size={16} className="shrink-0" />
          <span className="flex-1 font-medium">{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 size={16} className="shrink-0" />
          <span className="flex-1 font-medium">{success}</span>
          <button onClick={() => setSuccess(null)}><X size={14} /></button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin text-indigo-500" size={36} />
          <span className="text-sm font-semibold text-slate-400">Đang đồng bộ dữ liệu...</span>
        </div>
      ) : (
        <>
          {/* Key metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <DollarSign size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tổng doanh thu</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1 truncate">
                  {metrics?.totalRevenue.toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>

            {/* Total Transactions */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Activity size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Giao dịch thành công</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1 truncate">
                  {metrics?.successfulTxCount} GD
                </p>
              </div>
            </div>

            {/* Pro Accounts */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                <Users size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Người dùng Pro</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1 truncate">
                  {metrics?.proUsersCount} học sinh
                </p>
              </div>
            </div>

            {/* Best Selling Plan */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Award size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Gói bán chạy nhất</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-2 truncate">
                  {bestSeller ? `${bestSeller.name} (${bestSeller.salesCount} lượt)` : 'Chưa có dữ liệu'}
                </p>
              </div>
            </div>
          </div>

          {/* Revenue distribution details and Month metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Monthly Chart Card */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <BarChart2 size={16} className="text-indigo-500" />
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Doanh thu 6 tháng gần nhất</h3>
              </div>
              <div className="space-y-3.5 pt-2">
                {metrics?.monthlyRevenue && metrics.monthlyRevenue.length > 0 ? (
                  metrics.monthlyRevenue.map((item, index) => {
                    const maxVal = Math.max(...metrics.monthlyRevenue.map(m => m.revenue), 1);
                    const percent = Math.round((item.revenue / maxVal) * 100);
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500 dark:text-slate-400">{item.monthStr}</span>
                          <span className="text-slate-800 dark:text-slate-100">
                            {item.revenue.toLocaleString('vi-VN')}đ ({item.count} GD)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">Chưa có giao dịch phát sinh theo tháng.</p>
                )}
              </div>
            </div>

            {/* Sales breakdown by plan */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-500" />
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Phân chia theo gói</h3>
              </div>
              <div className="space-y-3 pt-2">
                {metrics?.bestSellingPlans && metrics.bestSellingPlans.length > 0 ? (
                  metrics.bestSellingPlans.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">slug: {item.slug}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">{item.salesCount} lượt bán</p>
                        <p className="text-[10px] text-indigo-500 font-semibold mt-0.5">{item.totalRevenue.toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">Chưa có doanh số gói dịch vụ.</p>
                )}
              </div>
            </div>
          </div>

          {/* Package Configuration CRUD table */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Cấu hình gói dịch vụ</h3>
              <span className="text-xs bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg font-bold">
                {plans.length} gói cấu hình
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    <th className="px-5 py-3.5">Tên & Slug</th>
                    <th className="px-5 py-3.5">Mô tả</th>
                    <th className="px-5 py-3.5">Giá tiền</th>
                    <th className="px-5 py-3.5">Thời hạn</th>
                    <th className="px-5 py-3.5">Trạng thái</th>
                    <th className="px-5 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {plans.map((plan) => (
                    <tr key={plan._id} className="hover:bg-slate-50 dark:hover:bg-slate-750/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{plan.name}</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">slug: <span className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-indigo-500 font-mono text-[9px]">{plan.slug}</span></p>
                      </td>
                      <td className="px-5 py-3.5 max-w-[250px]">
                        <p className="text-xs text-slate-600 dark:text-slate-450 line-clamp-2" title={plan.description}>
                          {plan.description || 'Không có mô tả.'}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-extrabold text-slate-800 dark:text-slate-250 text-sm">
                          {plan.price.toLocaleString('vi-VN')}đ
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-600 dark:text-slate-400 text-xs">
                          {plan.duration_days} ngày
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleToggleActive(plan)}
                          className="focus:outline-none transition-colors"
                          title={plan.is_active ? 'Nhấn để vô hiệu hóa' : 'Nhấn để kích hoạt'}
                        >
                          {plan.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                              <Check size={8} strokeWidth={3} /> Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800">
                               Vô hiệu hóa
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            disabled={actionLoading}
                            onClick={() => handleOpenEditModal(plan)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg transition-colors"
                            title="Sửa thông tin"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleDeletePlan(plan)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                            title="Xóa gói"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {plans.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                        Chưa có gói dịch vụ nào được cấu hình trong hệ thống.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal create/edit Package */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-modal overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingPlan ? 'Chỉnh sửa gói dịch vụ' : 'Thêm gói dịch vụ mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              {/* Tên gói */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tên gói dịch vụ</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Pro Hướng nghiệp"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-slate-950 dark:text-white"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mã gói (Slug - unique, lowercase)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: pro, premium"
                  disabled={!!editingPlan} // Freeze slug on edit
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                  className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-slate-955 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mô tả chi tiết</label>
                <textarea
                  placeholder="Nhập các quyền lợi của gói, phân cách bằng dấu phẩy hoặc dòng mới..."
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-slate-955 dark:text-white resize-none"
                />
              </div>

              {/* Price & Duration Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Giá tiền (VND)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-slate-955 dark:text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thời hạn (ngày)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.duration_days}
                    onChange={e => setFormData({ ...formData, duration_days: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-slate-955 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Status Switch */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-xl mt-2">
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-350">Kích hoạt hoạt động</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Người dùng chỉ mua được các gói đang kích hoạt.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 focus:outline-none transition-colors"
                >
                  {formData.is_active ? (
                    <ToggleRight size={28} className="text-indigo-600" />
                  ) : (
                    <ToggleLeft size={28} />
                  )}
                </button>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-700 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  {actionLoading && <Loader2 size={12} className="animate-spin" />}
                  {editingPlan ? 'Cập nhật' : 'Tạo gói'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
