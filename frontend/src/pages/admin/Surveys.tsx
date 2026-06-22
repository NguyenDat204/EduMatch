import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertCircle, Eye, FileText, Gauge, Loader2, Search, Users, X } from 'lucide-react';
import { adminService } from '../../services/api';

const fmt = (date?: string) => date ? new Date(date).toLocaleString('vi-VN') : '--';

const Metric = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 flex items-center justify-center"><Icon size={18} /></div>
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export const Surveys = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    adminService.getAllSurveys()
      .then((res) => setItems(res.data || []))
      .catch(() => setError('Không thể tải lịch sử khảo sát.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return items.filter((item) => !q ||
      item.userId?.name?.toLowerCase().includes(q) ||
      item.userId?.email?.toLowerCase().includes(q) ||
      item.result?.archetype?.toLowerCase().includes(q) ||
      item.result?.careers?.[0]?.title?.toLowerCase().includes(q)
    );
  }, [items, query]);

  const avgScore = items.length ? Math.round(items.reduce((sum, item) => sum + Number(item.result?.suitabilityScore || 0), 0) / items.length) : 0;
  const avgConfidence = items.length ? Math.round(items.reduce((sum, item) => sum + Number(item.result?.confidence?.score || 0), 0) / items.length) : 0;
  const uniqueUsers = new Set(items.map((item) => item.userId?._id).filter(Boolean)).size;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Lịch sử khảo sát</h1>
        <p className="text-sm text-slate-500">Theo dõi toàn bộ bài khảo sát, kết quả AI, confidence và ngành top.</p>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2"><AlertCircle size={16} />{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Metric label="Tổng khảo sát" value={items.length} icon={FileText} />
        <Metric label="User đã làm" value={uniqueUsers} icon={Users} />
        <Metric label="Suitability TB" value={`${avgScore}%`} icon={Gauge} />
        <Metric label="Confidence TB" value={`${avgConfidence}/100`} icon={Gauge} />
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo user, email, archetype hoặc ngành top" className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-400">
                <tr><th className="text-left px-4 py-3">User</th><th className="text-left px-4 py-3">Kết quả</th><th className="text-left px-4 py-3">Top ngành</th><th className="text-left px-4 py-3">Điểm</th><th className="text-left px-4 py-3">Confidence</th><th className="text-left px-4 py-3">Thời gian</th><th className="text-right px-4 py-3">Chi tiết</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3"><p className="font-semibold text-slate-900 dark:text-white">{item.userId?.name || 'Ẩn danh'}</p><p className="text-xs text-slate-400">{item.userId?.email}</p></td>
                    <td className="px-4 py-3"><p className="font-semibold">{item.result?.archetype || '--'}</p><p className="text-xs text-slate-400">{item.result?.hollandCode || '--'}</p></td>
                    <td className="px-4 py-3">{item.result?.careers?.[0]?.title || '--'}</td>
                    <td className="px-4 py-3 font-bold text-indigo-600">{item.result?.suitabilityScore || 0}%</td>
                    <td className="px-4 py-3">{item.result?.confidence?.label || '--'} · {item.result?.confidence?.score || 0}/100</td>
                    <td className="px-4 py-3 text-slate-500">{fmt(item.completedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelected(item)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 text-xs font-bold">
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
        <DetailModal title="Chi tiết khảo sát" onClose={() => setSelected(null)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Info label="Người dùng" value={`${selected.userId?.name || 'Ẩn danh'} · ${selected.userId?.email || '--'}`} />
            <Info label="Hoàn thành" value={fmt(selected.completedAt)} />
            <Info label="Archetype" value={selected.result?.archetype || '--'} />
            <Info label="Holland Code" value={selected.result?.hollandCode || '--'} />
            <Info label="Suitability" value={`${selected.result?.suitabilityScore || 0}%`} />
            <Info label="Confidence" value={`${selected.result?.confidence?.label || '--'} · ${selected.result?.confidence?.score || 0}/100`} />
          </div>
          <Section title="Top ngành đề xuất">
            <div className="space-y-2">
              {(selected.result?.careers || []).map((career: any, index: number) => (
                <div key={`${career.title}-${index}`} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-slate-900 dark:text-white">{index + 1}. {career.title}</p>
                    <span className="text-sm font-black text-indigo-600">{career.suitability || 0}%</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{career.category || '--'}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{career.description || '--'}</p>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Confidence reasons">
            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
              {(selected.result?.confidence?.reasons || []).map((reason: string) => <li key={reason}>{reason}</li>)}
            </ul>
          </Section>
          <JsonBlock title="RIASEC scores" data={selected.result?.riasecScores} />
          <JsonBlock title="Score breakdown" data={selected.result?.scoreBreakdown} />
          <JsonBlock title="Answers" data={selected.answers} />
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

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div><h3 className="text-sm font-black text-slate-900 dark:text-white mb-2">{title}</h3>{children}</div>
);

const JsonBlock = ({ title, data }: { title: string; data: any }) => (
  <Section title={title}>
    <pre className="max-h-72 overflow-auto rounded-lg bg-slate-950 text-slate-100 p-3 text-xs">{JSON.stringify(data || {}, null, 2)}</pre>
  </Section>
);
