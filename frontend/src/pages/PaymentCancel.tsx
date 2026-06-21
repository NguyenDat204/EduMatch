import { AlertTriangle, Home, RefreshCw, XCircle } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { useNavigate } from 'react-router-dom';

export const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto py-12 animate-fade-in">
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl shadow-modal overflow-hidden">
          
          {/* Header Accent Decorator */}
          <div className="h-2 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />

          {/* Cancel Visual Banner */}
          <div className="flex flex-col items-center text-center p-8 pb-4 border-b border-slate-100 dark:border-navy-800">
            <div className="relative mb-4">
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-full flex items-center justify-center border border-rose-100 dark:border-rose-900/20">
                <XCircle size={36} strokeWidth={2.2} />
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-full flex items-center justify-center shadow">
                <AlertTriangle size={12} strokeWidth={2.5} />
              </div>
            </div>

            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2">
              Thanh Toán Chưa Hoàn Tất
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[340px]">
              Giao dịch nâng cấp tài khoản Pro đã bị đóng hoặc chưa hoàn thành.
            </p>
          </div>

          {/* Description Section */}
          <div className="p-6 md:p-8 space-y-6">
            
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/60 dark:border-amber-900/20 text-xs text-amber-800 dark:text-amber-400 leading-relaxed space-y-2">
              <h4 className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
                Lưu ý:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                <li>Tài khoản của bạn hiện vẫn ở gói <span className="font-bold">Cơ bản</span> (chưa nâng cấp).</li>
                <li>Không có khoản tiền nào bị trừ khỏi tài khoản của bạn cho giao dịch chưa hoàn tất này.</li>
                <li>Nếu gặp lỗi hệ thống từ ngân hàng, vui lòng liên hệ bộ phận hỗ trợ EduMatch.</li>
              </ul>
            </div>

            {/* Navigation Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="py-2.5 px-4 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-750 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Home size={14} /> Về trang chủ
              </button>
              <button
                onClick={() => navigate('/upgrade')}
                className="py-2.5 px-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-primary-500/20 active:scale-95"
              >
                <RefreshCw size={14} /> Thử thanh toán lại
              </button>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
