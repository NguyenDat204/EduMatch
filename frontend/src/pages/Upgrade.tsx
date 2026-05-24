import { Check, Star, ShieldCheck, ArrowRight, X, CreditCard, QrCode, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import { profileService } from '../services/api';

export const Upgrade = () => {
  const { user, updateUserInState } = useAuth();
  const [showModal, setShowModal]   = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qr'>('qr');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName]     = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV]       = useState('');
  const [error, setError]           = useState<string | null>(null);

  const plans = [
    {
      name: 'Cơ bản',
      price: '0đ',
      desc: 'Trải nghiệm và khám phá ban đầu.',
      features: [
        'Đánh giá tính cách cơ bản',
        'Gợi ý top 3 ngành học',
        'Trò chuyện AI (5 tin/ngày)',
        'Xem thông tin trường công khai',
      ],
      current: !user?.isPro,
    },
    {
      name: 'Pro Hướng nghiệp',
      price: '49.000đ',
      period: '/tháng',
      desc: 'Làm chủ lộ trình sự nghiệp tương lai.',
      features: [
        'Trò chuyện AI không giới hạn',
        'Phân tích khoảng cách kỹ năng',
        'Lộ trình nghề nghiệp AI chuyên sâu',
        'Tư vấn tuyển sinh ưu tiên',
        'Hội thảo hướng nghiệp độc quyền',
        'Không quảng cáo',
      ],
      featured: true,
      current: !!user?.isPro,
    },
    {
      name: 'Nhà trường',
      price: 'Liên hệ',
      desc: 'Giải pháp toàn diện cho tổ chức giáo dục.',
      features: [
        'Tất cả tính năng Pro',
        'Theo dõi tiến độ học sinh',
        'Báo cáo phân tích nhóm',
        'Cấp tài khoản hàng loạt',
        'Hỗ trợ chuyên viên 24/7',
      ],
    },
  ];

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPaymentStep('processing');
    try {
      await new Promise((r) => setTimeout(r, 2000));
      const res = await profileService.upgradeToPro();
      if (res.success && res.data) {
        updateUserInState(res.data);
        setPaymentStep('success');
        setTimeout(() => setShowModal(false), 2500);
      } else {
        throw new Error(res.message || 'Giao dịch không thành công.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Giao dịch thất bại.');
      setPaymentStep('form');
    }
  };

  return (
    <DashboardLayout>
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

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-6 transition-all ${
                plan.featured
                  ? 'bg-navy-900 text-white border border-primary-600 shadow-modal scale-[1.02]'
                  : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-card'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Phổ biến nhất
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-base font-bold mb-2 ${plan.featured ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-3xl font-black ${plan.featured ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm ${plan.featured ? 'text-slate-400' : 'text-slate-500'}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={`text-xs leading-relaxed ${plan.featured ? 'text-slate-400' : 'text-slate-500'}`}>
                  {plan.desc}
                </p>
              </div>

              <ul className="flex-1 space-y-2.5 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      plan.featured ? 'bg-primary-500' : 'bg-primary-50 dark:bg-primary-900/30'
                    }`}>
                      <Check size={10} strokeWidth={3} className={plan.featured ? 'text-white' : 'text-primary-600'} />
                    </div>
                    <span className={`text-xs font-medium ${plan.featured ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={plan.featured && !plan.current ? () => { setError(null); setPaymentStep('form'); setShowModal(true); } : undefined}
                disabled={plan.current || plan.name === 'Nhà trường'}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all ${
                  plan.current
                    ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 cursor-default border border-green-200 dark:border-green-900/30'
                    : plan.name === 'Nhà trường'
                    ? 'bg-slate-100 dark:bg-navy-800 text-slate-500 cursor-pointer hover:bg-slate-200'
                    : 'bg-primary-600 text-white hover:bg-primary-500 active:scale-95'
                }`}
              >
                {plan.current
                  ? 'Gói hiện tại'
                  : plan.name === 'Nhà trường'
                  ? 'Liên hệ chúng tôi'
                  : <>Nâng cấp ngay <ArrowRight size={14} /></>}
              </button>
            </div>
          ))}
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

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl shadow-modal overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-navy-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Thanh toán Pro</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {paymentStep === 'form' && (
              <form onSubmit={handleProcessPayment} className="p-5 space-y-5">
                {error && (
                  <div className="p-3 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/30">
                    {error}
                  </div>
                )}

                {/* Amount */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">EduMatch Pro</p>
                    <p className="text-xs text-slate-400 mt-0.5">30 ngày (tự động gia hạn)</p>
                  </div>
                  <span className="text-lg font-black text-primary-600">49.000đ</span>
                </div>

                {/* Method tabs */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-navy-800 rounded-xl">
                  {[
                    { key: 'qr',   label: 'QR Code',    icon: <QrCode size={13} /> },
                    { key: 'card', label: 'Thẻ quốc tế', icon: <CreditCard size={13} /> },
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setPaymentMethod(m.key as any)}
                      className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        paymentMethod === m.key
                          ? 'bg-white dark:bg-navy-700 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'qr' ? (
                  <div className="flex flex-col items-center py-4 gap-3">
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <svg width="140" height="140" viewBox="0 0 160 160" className="text-slate-900">
                        <path d="M10,10 L50,10 L50,50 L10,50 Z" fill="none" stroke="currentColor" strokeWidth="6" />
                        <path d="M110,10 L150,10 L150,50 L110,50 Z" fill="none" stroke="currentColor" strokeWidth="6" />
                        <path d="M10,110 L50,110 L50,150 L10,150 Z" fill="none" stroke="currentColor" strokeWidth="6" />
                        <rect x="22" y="22" width="16" height="16" fill="currentColor" />
                        <rect x="122" y="22" width="16" height="16" fill="currentColor" />
                        <rect x="22" y="122" width="16" height="16" fill="currentColor" />
                        <rect x="70" y="30" width="20" height="20" fill="currentColor" />
                        <rect x="70" y="70" width="20" height="20" fill="currentColor" />
                        <rect x="110" y="70" width="30" height="20" fill="currentColor" />
                        <rect x="30" y="70" width="20" height="20" fill="currentColor" />
                        <rect x="70" y="110" width="20" height="30" fill="currentColor" />
                        <rect x="110" y="110" width="30" height="30" fill="currentColor" />
                        <circle cx="80" cy="80" r="14" fill="#2563eb" />
                        <polygon points="76,82 80,74 84,82" fill="white" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Quét mã để thanh toán</p>
                    <p className="text-xs text-slate-400 text-center max-w-[240px]">
                      Dùng ứng dụng ngân hàng hoặc ví điện tử để quét mã VietQR.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Tên trên thẻ</label>
                      <input type="text" required={paymentMethod === 'card'} value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="NGUYEN VAN A" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Số thẻ</label>
                      <input type="text" required={paymentMethod === 'card'} value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4111 2222 3333 4444" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Ngày hết hạn</label>
                        <input type="text" required={paymentMethod === 'card'} value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/YY" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">CVV</label>
                        <input type="password" required={paymentMethod === 'card'} value={cardCVV} onChange={(e) => setCardCVV(e.target.value)} placeholder="•••" maxLength={3} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
                  Xác nhận thanh toán <ArrowRight size={15} />
                </button>
              </form>
            )}

            {paymentStep === 'processing' && (
              <div className="flex flex-col items-center justify-center p-10 gap-4 text-center">
                <Loader2 className="animate-spin text-primary-600" size={40} />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Đang xử lý giao dịch...</p>
                  <p className="text-xs text-slate-400 mt-1">Vui lòng không đóng cửa sổ này.</p>
                </div>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="flex flex-col items-center justify-center p-10 gap-4 text-center animate-fade-in">
                <div className="w-14 h-14 bg-green-50 dark:bg-green-950/30 text-green-500 rounded-full flex items-center justify-center border border-green-100 dark:border-green-900/20">
                  <Check size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white">Nâng cấp thành công!</p>
                  <p className="text-xs text-slate-400 mt-1">Tài khoản Pro của bạn đã được kích hoạt.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
