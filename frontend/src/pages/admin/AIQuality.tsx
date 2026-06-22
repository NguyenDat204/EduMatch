import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertCircle, Eye, Gauge, Loader2, Search, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { adminService } from '../../services/api';

const fmt = (date?: string) => date ? new Date(date).toLocaleString('vi-VN') : '--';

const Metric = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 flex items-center justify-center"><Icon size={18} /></div>
    <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="text-xl font-black text-slate-900 dark:text-white">{value}</p></div>
  </div>
);

export const AIQuality = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [fitFilter, setFitFilter] = useState('all');
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    adminService.getRecommendationFeedbacks()
      .then((res) => setItems(res.data || []))
      .catch(() => setError('Không thể tải feedback AI.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return items.filter((item) => {
      const matchFit = fitFilter === 'all' || item.topCareerFit === fitFilter;
      const matchQuery = !q ||
        item.userId?.name?.toLowerCase().includes(q) ||
        item.userId?.email?.toLowerCase().includes(q) ||
        item.topCareerTitle?.toLowerCase().includes(q) ||
        item.comment?.toLowerCase().includes(q);
      return matchFit && matchQuery;
    });
  }, [items, query, fitFilter]);

  const avgAccuracy = items.length ? (items.reduce((sum, item) => sum + Number(item.perceivedAccuracy || 0), 0) / items.length).toFixed(1) : '--';
  const interested = items.filter((item) => item.topCareerFit === 'interested').length;
  const notInterested = items.filter((item) => item.topCareerFit === 'not_interested').length;
  const avgConfidence = items.length ? Math.round(items.reduce((sum, item) => sum + Number(item.scoreSnapshot?.confidence?.score || 0), 0) / items.length) : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">AI Quality & Feedback</h1>
        <p className="text-sm text-slate-500">Theo dõi đánh giá khách quan của người dùng về kết quả AI recommendation.</p>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2"><AlertCircle size={16} />{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Metric label="Feedback AI" value={items.length} icon={Gauge} />
        <Metric label="Accuracy TB" value={`${avgAccuracy}/5`} icon={Gauge} />
        <Metric label="Interested" value={interested} icon={ThumbsUp} />
        <Metric label="Not interested" value={notInterested} icon={ThumbsDown} />
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm user, ngành top hoặc bình luận" className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm" />
        </div>
        <select value={fitFilter} onChange={(e) => setFitFilter(e.target.value)} className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm">
          <option value="all">Tất cả phản hồi</option>
          <option value="interested">Interested</option>
          <option value="unsure">Unsure</option>
          <option value="not_interested">Not interested</option>
        </select>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-amber-600" /></div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 text-xs text-slate-500 border-b border-slate-100 dark:border-slate-700">Confidence trung bình tại thời điểm feedback: <b>{avgConfidence}/100</b></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-400">
                <tr><th className="text-left px-4 py-3">User</th><th className="text-left px-4 py-3">Ngành top</th><th className="text-left px-4 py-3">Accuracy</th><th className="text-left px-4 py-3">Fit</th><th className="text-left px-4 py-3">Snapshot</th><th className="text-left px-4 py-3">Bình luận</th><th className="text-left px-4 py-3">Thời gian</th><th className="text-right px-4 py-3">Chi tiết</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3"><p className="font-semibold">{item.userId?.name || 'Ẩn danh'}</p><p className="text-xs text-slate-400">{item.userId?.email}</p></td>
                    <td className="px-4 py-3 font-semibold">{item.topCareerTitle || '--'}</td>
                    <td className="px-4 py-3 font-bold text-amber-600">{item.perceivedAccuracy}/5</td>
                    <td className="px-4 py-3">{item.topCareerFit}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.scoreSnapshot?.suitabilityScore || 0}% · {item.scoreSnapshot?.confidence?.score || 0}/100</td>
                    <td className="px-4 py-3 max-w-xs truncate">{item.comment || '--'}</td>
                    <td className="px-4 py-3 text-slate-500">{fmt(item.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelected(item)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 text-xs font-bold">
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
        <DetailModal title="Chi tiết feedback AI" onClose={() => setSelected(null)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Info label="Người dùng" value={`${selected.userId?.name || 'Ẩn danh'} · ${selected.userId?.email || '--'}`} />
            <Info label="Ngành top" value={selected.topCareerTitle || '--'} />
            <Info label="Accuracy user" value={`${selected.perceivedAccuracy}/5`} />
            <Info label="Top career fit" value={selected.topCareerFit || '--'} />
            <Info label="Archetype" value={selected.archetype || '--'} />
            <Info label="Holland Code" value={selected.hollandCode || '--'} />
            <Info label="Suitability snapshot" value={`${selected.scoreSnapshot?.suitabilityScore || 0}%`} />
            <Info label="Confidence snapshot" value={`${selected.scoreSnapshot?.confidence?.label || '--'} · ${selected.scoreSnapshot?.confidence?.score || 0}/100`} />
          </div>
          <Section title="Bình luận của người dùng">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {selected.comment || 'Không có bình luận.'}
            </div>
          </Section>
          <JsonBlock title="Score snapshot" data={selected.scoreSnapshot} />
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
    <pre className="max-h-80 overflow-auto rounded-lg bg-slate-950 text-slate-100 p-3 text-xs">{JSON.stringify(data || {}, null, 2)}</pre>
  </Section>
);
