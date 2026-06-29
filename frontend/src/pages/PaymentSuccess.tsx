import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Home, Calendar, CreditCard, User } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { useAuth } from '../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { profileService } from '../services/api';
import { trackEvent } from '../services/analytics';

export const PaymentSuccess = () => {
  const { updateUserInState } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const trackedRef = useRef(false);

  // Extract payment details from routing state
  const state = location.state || {};
  const orderCode = state.orderCode || 'N/A';
  const amount = state.amount || 49000;
  const paidAt = state.paidAt || new Date().toISOString();

  // Fetch updated profile on mount to sync isPro status globally across the frontend application
  useEffect(() => {
    if (!trackedRef.current) {
      trackedRef.current = true;
      trackEvent('payment_success', {
        order_code: String(orderCode),
        amount: Number(amount) || 0,
      });
    }

    const reloadProfile = async () => {
      try {
        const res = await profileService.getProfile();
        if (res.success && res.data) {
          updateUserInState(res.data);
        }
      } catch (err) {
        console.error('Failed to sync upgraded user profile:', err);
      }
    };
    reloadProfile();
  }, [updateUserInState]);

  // Calculate Pro subscription expiry date (30 days from paidAt date)
  const paidDate = new Date(paidAt);
  const expiryDate = new Date(paidDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto py-8 animate-fade-in">
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl shadow-modal overflow-hidden">
          
          {/* Header Accent Decorator */}
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-primary-600" />

          {/* Success Visual Banner */}
          <div className="flex flex-col items-center text-center p-8 pb-4 border-b border-slate-100 dark:border-navy-800">
            <div className="relative mb-4">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-900/20">
                <CheckCircle2 size={36} strokeWidth={2.2} />
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center animate-bounce shadow">
                <Sparkles size={13} fill="currentColor" />
              </div>
            </div>

            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2">
              Thanh Toán Thành Công!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[340px]">
              Gói tài khoản <span className="font-extrabold text-slate-800 dark:text-slate-200">Pro Hướng nghiệp</span> của bạn đã được kích hoạt thành công.
            </p>
          </div>

          {/* Invoice Information Details */}
          <div className="p-6 md:p-8 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Chi tiết giao dịch
            </h3>

            <div className="grid grid-cols-1 gap-3.5 text-sm">
              
              {/* Order Code */}
              <div className="flex justify-between items-center py-2.5 border-b border-dashed border-slate-100 dark:border-navy-850">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <CreditCard size={14} /> Mã đơn hàng
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {orderCode}
                </span>
              </div>

              {/* Amount */}
              <div className="flex justify-between items-center py-2.5 border-b border-dashed border-slate-100 dark:border-navy-850">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <CreditCard size={14} /> Số tiền đã thanh toán
                </span>
                <span className="font-black text-primary-600 dark:text-primary-400 text-base">
                  {formatCurrency(amount)}
                </span>
              </div>

              {/* Date Paid */}
              <div className="flex justify-between items-center py-2.5 border-b border-dashed border-slate-100 dark:border-navy-850">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Calendar size={14} /> Ngày thanh toán
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                  {formatDate(paidDate)}
                </span>
              </div>

              {/* Expiry Date */}
              <div className="flex justify-between items-center py-2.5 border-b border-dashed border-slate-100 dark:border-navy-850">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Calendar size={14} /> Thời hạn sử dụng Pro
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                  30 ngày (Đến {formatDate(expiryDate)})
                </span>
              </div>

              {/* Account Role / Status */}
              <div className="flex justify-between items-center py-2.5">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <User size={14} /> Trạng thái tài khoản
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                  <ShieldCheck size={11} strokeWidth={2.5} /> PRO Hướng Nghiệp
                </span>
              </div>

            </div>

            {/* Quick Benefits Highlight Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-100 dark:border-navy-800 flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-xl bg-primary-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles size={16} fill="currentColor" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Đã mở khóa mọi tính năng</h4>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Bạn có thể trò chuyện với AI không giới hạn, xem lộ trình sự nghiệp chi tiết và truy cập các báo cáo khoảng cách kỹ năng nâng cao.
                </p>
              </div>
            </div>

            {/* Navigation Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="py-2.5 px-4 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-750 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Home size={14} /> Về trang chủ
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="py-2.5 px-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-primary-500/20 active:scale-95"
              >
                Khám phá Pro <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
