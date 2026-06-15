import { Check, Star, ShieldCheck, ArrowRight, X, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect, useRef } from 'react';
import { paymentService, planService } from '../services/api';
import type { PaymentCreateResponse } from '../services/api';
import type { SubscriptionPlan } from '../types';
import { useNavigate } from 'react-router-dom';

export const Upgrade = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Payment states
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false); // Creating transaction
  const [paymentData, setPaymentData] = useState<PaymentCreateResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes in seconds
  const [pollingActive, setPollingActive] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false); // Verifying payment Loader
  const [error, setError] = useState<string | null>(null);

  // Active dynamic plans state
  const [activePlans, setActivePlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const pollingRef = useRef<any>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch active plans on load
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await planService.getActivePlans();
        if (res.success && Array.isArray(res.data)) {
          setActivePlans(res.data);
        }
      } catch (err: any) {
        console.error('Failed to fetch active plans:', err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const getFeatures = (plan: SubscriptionPlan) => {
    if (plan.slug === 'pro') {
      return [
        'Trò chuyện AI không giới hạn',
        'Phân tích khoảng cách kỹ năng',
        'Lộ trình nghề nghiệp AI chuyên sâu',
        'Tư vấn tuyển sinh ưu tiên',
        'Hội thảo hướng nghiệp độc quyền',
        'Không quảng cáo',
      ];
    }
    if (plan.description) {
      return plan.description.split(/[.,;\n]+/).map((f) => f.trim()).filter(Boolean);
    }
    return ['Đầy đủ tính năng cao cấp', 'Hỗ trợ hướng nghiệp chuyên sâu'];
  };

  // Countdown timer for 15 minutes
  useEffect(() => {
    if (!showModal || !paymentData || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPollingActive(false); // Stop polling when expired
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showModal, paymentData, timeLeft]);

  // Polling to verify payment status
  useEffect(() => {
    if (showModal && paymentData && timeLeft > 0 && pollingActive) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await paymentService.checkStatus(paymentData.orderCode);
          if (res.status === 'PAID') {
            // Stop polling immediately
            setPollingActive(false);
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }

            setCheckingStatus(true);
            showToast('Thanh toán thành công! Đang đồng bộ tài khoản...', 'success');

            // Fetch latest user profile to update application state
            setTimeout(() => {
              // Redirect to success page
              navigate('/payment/success', {
                state: {
                  orderCode: paymentData.orderCode,
                  amount: paymentData.amount,
                  paidAt: new Date().toISOString()
                }
              });
            }, 1800);
          } else if (res.status === 'CANCELLED' || res.status === 'FAILED') {
            setPollingActive(false);
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            showToast('Giao dịch thanh toán đã bị hủy hoặc thất bại.', 'error');
            setTimeout(() => setShowModal(false), 2000);
          }
        } catch (err: any) {
          console.warn('Polling error, retrying...', err);
        }
      }, 1500);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [showModal, paymentData, timeLeft, pollingActive, navigate]);

  const handleCreatePaymentTransaction = async (plan: SubscriptionPlan) => {
    setError(null);
    setLoading(true);
    setSelectedPlan(plan);
    try {
      const res = await paymentService.createPayment(plan._id);
      setPaymentData(res);
      setTimeLeft(900); // 15 mins
      setPollingActive(true);
      setCheckingStatus(false);
      setShowModal(true);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Không thể kết nối cổng thanh toán.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPollingActive(false);
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardLayout>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-fade-in flex items-center gap-2.5 px-4 py-3 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl shadow-modal">
          {toast.type === 'success' ? (
            <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center text-white shrink-0">
              <Check size={12} strokeWidth={3} />
            </div>
          ) : (
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shrink-0">
              <X size={12} strokeWidth={3} />
            </div>
          )}
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{toast.message}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-10 pb-10 animate-fade-in">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto pt-4">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3">
            Chọn gói phù hợp với bạn
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Nâng cấp Pro để nhận phân tích chi tiết và tư vấn AI không giới hạn.
          </p>
        </div>

        {/* Error message banner */}
        {error && (
          <div className="max-w-xl mx-auto p-3.5 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Free Plan */}
          <div className="relative flex flex-col rounded-2xl p-6 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-card">
            <div className="mb-6">
              <h3 className="text-slate-900 dark:text-white text-base font-bold mb-2">Cơ bản</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-slate-900 dark:text-white text-3xl font-black">0đ</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">Trải nghiệm và khám phá ban đầu.</p>
            </div>
            <ul className="flex-1 space-y-2.5 mb-6">
              {['Đánh giá tính cách cơ bản', 'Gợi ý top 3 ngành học', 'Trò chuyện AI (5 tin/ngày)', 'Xem thông tin trường công khai'].map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-primary-50 dark:bg-primary-900/30">
                    <Check size={10} strokeWidth={3} className="text-primary-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/30 disabled:opacity-100 animate-fade-in"
            >
              {!user?.isPro ? 'Gói hiện tại' : 'Gói mặc định'}
            </button>
          </div>

          {/* 2. Dynamic Plans */}
          {loadingPlans ? (
            <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl shadow-card min-h-[300px]">
              <Loader2 className="animate-spin text-primary-600" size={24} />
              <p className="text-xs text-slate-400 mt-2">Đang tải các gói dịch vụ...</p>
            </div>
          ) : (
            activePlans.map((plan) => {
              const isCurrent = !!user?.isPro && (user?.plan_id === plan._id || user?.subscription?.plan === plan.slug);
              const isProFeatured = plan.slug === 'pro';
              const planFeatures = getFeatures(plan);
              
              return (
                <div
                  key={plan._id}
                  className={`relative flex flex-col rounded-2xl p-6 transition-all ${
                    isProFeatured
                      ? 'bg-navy-900 text-white border border-primary-600 shadow-modal scale-[1.02]'
                      : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-card'
                  }`}
                >
                  {isProFeatured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Phổ biến nhất
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className={`text-base font-bold mb-2 ${isProFeatured ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className={`text-3xl font-black ${isProFeatured ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {plan.price.toLocaleString('vi-VN')}đ
                      </span>
                      <span className={`text-sm ${isProFeatured ? 'text-slate-400' : 'text-slate-500'}`}>
                        / {plan.duration_days} ngày
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${isProFeatured ? 'text-slate-400' : 'text-slate-500'}`}>
                      {plan.description}
                    </p>
                  </div>

                  <ul className="flex-1 space-y-2.5 mb-6">
                    {planFeatures.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          isProFeatured ? 'bg-primary-500' : 'bg-primary-50 dark:bg-primary-900/30'
                        }`}>
                          <Check size={10} strokeWidth={3} className={isProFeatured ? 'text-white' : 'text-primary-600'} />
                        </div>
                        <span className={`text-xs font-medium ${isProFeatured ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleCreatePaymentTransaction(plan)}
                    disabled={isCurrent || (loading && selectedPlan?._id === plan._id)}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all ${
                      isCurrent
                        ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 cursor-default border border-green-200 dark:border-green-900/30'
                        : 'bg-primary-600 text-white hover:bg-primary-500 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed'
                    }`}
                  >
                    {isCurrent ? (
                      'Gói hiện tại'
                    ) : loading && selectedPlan?._id === plan._id ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Đang tạo giao dịch...
                      </>
                    ) : (
                      <>Nâng cấp ngay <ArrowRight size={14} /></>
                    )}
                  </button>
                </div>
              );
            })
          )}

          {/* 3. Enterprise Plan */}
          <div className="relative flex flex-col rounded-2xl p-6 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-card">
            <div className="mb-6">
              <h3 className="text-slate-900 dark:text-white text-base font-bold mb-2">Nhà trường</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-slate-900 dark:text-white text-3xl font-black">Liên hệ</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">Giải pháp toàn diện cho tổ chức giáo dục.</p>
            </div>
            <ul className="flex-1 space-y-2.5 mb-6">
              {['Tất cả tính năng Pro', 'Theo dõi tiến độ học sinh', 'Báo cáo phân tích nhóm', 'Cấp tài khoản hàng loạt', 'Hỗ trợ chuyên viên 24/7'].map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-primary-50 dark:bg-primary-900/30">
                    <Check size={10} strokeWidth={3} className="text-primary-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => showToast('Vui lòng liên hệ support@edumatch.vn để nhận báo giá.', 'success')}
              className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all bg-slate-100 dark:bg-navy-800 text-slate-500 hover:bg-slate-200 cursor-pointer"
            >
              Liên hệ chúng tôi
            </button>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl shadow-card">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-950/30 rounded-lg flex items-center justify-center shrink-0">
              <ShieldCheck size={20} className="text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">Thanh toán bảo mật</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Mã hóa SSL 256-bit cho mọi giao dịch.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl shadow-card">
            <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
              <Star size={20} className="text-primary-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">Cam kết hoàn tiền</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Hoàn 100% trong 14 ngày nếu không hài lòng.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment QR Modal */}
      {showModal && paymentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl shadow-modal overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-navy-700">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Quét mã thanh toán VietQR</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-semibold">Đơn hàng #{paymentData.orderCode}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              
              {/* Product Info & Amount */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedPlan?.name || "EduMatch Pro Hướng nghiệp"}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Thời hạn: {selectedPlan?.duration_days || 30} ngày sử dụng</p>
                </div>
                <span className="text-lg font-black text-primary-600 dark:text-primary-400">
                  {selectedPlan ? `${selectedPlan.price.toLocaleString('vi-VN')}đ` : "49.000đ"}
                </span>
              </div>

              {/* QR display section */}
              {checkingStatus ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <Loader2 className="animate-spin text-primary-600" size={32} />
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Đã nhận thanh toán</p>
                  <p className="text-xs text-slate-400">Đang đồng bộ hóa tài khoản Pro của bạn...</p>
                </div>
              ) : timeLeft > 0 ? (
                <div className="flex flex-col items-center py-1 gap-3">
                  
                  {/* QR Image with server server backup and elegant skeleton */}
                  <div className="relative p-3 bg-white rounded-xl border border-slate-200 shadow-sm w-[210px] h-[210px] flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentData.qrCode)}`}
                      alt={`VietQR Code for payment of ${selectedPlan?.price || 49000} VND`}
                      className="w-[190px] h-[190px] object-contain transition-opacity duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Countdown Timer */}
                  <div className="text-center space-y-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
                      Giao dịch hết hạn sau: <span className="font-bold text-slate-700 dark:text-slate-200">{formatTime(timeLeft)}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 text-center max-w-[280px] leading-relaxed">
                      Mở ứng dụng Mobile Banking quét mã VietQR để thanh toán tự động, không cần nhập thông tin chuyển khoản.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center border border-red-100 dark:border-red-900/20">
                    <X size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Giao dịch đã hết hạn</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[260px] leading-relaxed">
                      Mỗi mã QR chỉ có hiệu lực thanh toán trong 15 phút. Vui lòng tạo giao dịch mới để tiếp tục.
                    </p>
                  </div>
                  <button
                    onClick={() => selectedPlan && handleCreatePaymentTransaction(selectedPlan)}
                    className="mt-2 px-4 py-2 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw size={12} /> Tạo lại giao dịch
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              {timeLeft > 0 && !checkingStatus && (
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-navy-800">
                  <a
                    href={paymentData.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Thanh toán qua cổng PayOS <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={handleCloseModal}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-navy-800 dark:hover:bg-navy-750 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
