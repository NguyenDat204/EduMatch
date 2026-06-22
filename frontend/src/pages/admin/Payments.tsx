import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertCircle, CreditCard, DollarSign, Eye, Loader2, Search, X } from 'lucide-react';
import { adminService } from '../../services/api';

const fmt = (date?: string) => date ? new Date(date).toLocaleString('vi-VN') : '--';
const money = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);

const Metric = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center"><Icon size={18} /></div>
    <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="text-xl font-black text-slate-900 dark:text-white">{value}</p></div>
  </div>
);

export const Payments = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    adminService.getPayments()
      .then((res) => setItems(res.data || []))
      .catch(() => setError('Không thể tải dữ liệu thanh toán.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return items.filter((item) => {
      const matchStatus = status === 'all' || item.status === status;
      const matchQuery = !q ||
        item.user_id?.name?.toLowerCase().includes(q) ||
        item.user_id?.email?.toLowerCase().includes(q) ||
        String(item.order_code || '').includes(q) ||
        item.plan_id?.name?.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [items, query, status]);

  const revenue = items.filter((item) => item.status === 'PAID').reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const paid = items.filter((item) => item.status === 'PAID').length;
  const pending = items.filter((item) => item.status === 'PENDING').length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Thanh toán</h1><p className="text-sm text-slate-500">Theo dõi giao dịch, trạng thái thanh toán và doanh thu.</p></div>
      {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Metric label="Tổng giao dịch" value={items.length} icon={CreditCard} />
        <Metric label="Doanh thu paid" value={money(revenue)} icon={DollarSign} />
        <Metric label="Paid" value={paid} icon={CreditCard} />
        <Metric label="Pending" value={pending} icon={CreditCard} />
      </div>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm user, email, order code hoặc gói" className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm" /></div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"><option value="all">Tất cả trạng thái</option><option value="PAID">PAID</option><option value="PENDING">PENDING</option><option value="FAILED">FAILED</option><option value="CANCELLED">CANCELLED</option></select>
      </div>
      {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div> : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-400"><tr><th className="text-left px-4 py-3">Order</th><th className="text-left px-4 py-3">User</th><th className="text-left px-4 py-3">Gói</th><th className="text-left px-4 py-3">Số tiền</th><th className="text-left px-4 py-3">Trạng thái</th><th className="text-left px-4 py-3">Tạo lúc</th><th className="text-left px-4 py-3">Paid at</th><th className="text-right px-4 py-3">Chi tiết</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-mono text-xs">{item.order_code}</td>
                    <td className="px-4 py-3"><p className="font-semibold">{item.user_id?.name || '--'}</p><p className="text-xs text-slate-400">{item.user_id?.email}</p></td>
                    <td className="px-4 py-3">{item.plan_id?.name || item.description || '--'}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">{money(item.amount)}</td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="px-4 py-3 text-slate-500">{fmt(item.created_at)}</td>
                    <td className="px-4 py-3 text-slate-500">{fmt(item.paid_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelected(item)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 text-xs font-bold">
                        <Eye size={13} /> Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <DetailModal title="Chi tiết thanh toán" onClose={() => setSelected(null)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Info label="Order code" value={selected.order_code || '--'} />
            <Info label="Trạng thái" value={selected.status || '--'} />
            <Info label="Số tiền" value={money(selected.amount)} />
            <Info label="Mô tả" value={selected.description || '--'} />
            <Info label="User" value={`${selected.user_id?.name || '--'} · ${selected.user_id?.email || '--'}`} />
            <Info label="Gói" value={`${selected.plan_id?.name || '--'} · ${selected.plan_id?.slug || '--'}`} />
            <Info label="Tạo lúc" value={fmt(selected.created_at)} />
            <Info label="Paid at" value={fmt(selected.paid_at)} />
            <Info label="Last verified" value={fmt(selected.last_verified_at)} />
            <Info label="Payment link id" value={selected.payment_link_id || '--'} />
          </div>
          {selected.checkout_url && (
            <a href={selected.checkout_url} target="_blank" rel="noreferrer" className="inline-flex px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold">
              Mở checkout URL
            </a>
          )}
          <JsonBlock title="Raw payment" data={selected} />
        </DetailModal>
      )}
    </div>
  );
};

const DetailModal = ({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl">
      <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-5 py-4 flex items-center justify-between">
        <h2 className="font-black text-slate-900 dark:text-white">{title}</h2>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X size={17} /></button>
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  </div>
);

const Info = ({ label, value }: { label: string; value: string | number }) => (
  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white break-words">{value}</p>
  </div>
);

const JsonBlock = ({ title, data }: { title: string; data: any }) => (
  <div>
    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2">{title}</h3>
    <pre className="max-h-80 overflow-auto rounded-lg bg-slate-950 text-slate-100 p-3 text-xs">{JSON.stringify(data || {}, null, 2)}</pre>
  </div>
);
