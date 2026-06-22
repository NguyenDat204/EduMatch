import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertCircle, Bot, Eye, Loader2, MessageSquare, Search, X } from 'lucide-react';
import { adminService } from '../../services/api';

const fmt = (date?: string) => date ? new Date(date).toLocaleString('vi-VN') : '--';

const Metric = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 flex items-center justify-center"><Icon size={18} /></div>
    <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="text-xl font-black text-slate-900 dark:text-white">{value}</p></div>
  </div>
);

export const AIChats = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    adminService.getChats()
      .then((res) => setItems(res.data || []))
      .catch(() => setError('Không thể tải dữ liệu AI chat.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return items.filter((item) => !q ||
      item.userId?.name?.toLowerCase().includes(q) ||
      item.userId?.email?.toLowerCase().includes(q) ||
      item.title?.toLowerCase().includes(q) ||
      item.messages?.some((m: any) => String(m.content || '').toLowerCase().includes(q))
    );
  }, [items, query]);

  const totalMessages = items.reduce((sum, item) => sum + Number(item.messages?.length || 0), 0);
  const totalTokens = items.reduce((sum, item) => sum + Number(item.totalTokens?.input || 0) + Number(item.totalTokens?.output || 0), 0);
  const activeUsers = new Set(items.map((item) => item.userId?._id).filter(Boolean)).size;

  return (
    <div className="space-y-5 animate-fade-in">
      <div><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">AI Chat</h1><p className="text-sm text-slate-500">Theo dõi hội thoại AI Advisor, usage và nội dung hỗ trợ.</p></div>
      {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Metric label="Hội thoại" value={items.length} icon={Bot} />
        <Metric label="Tin nhắn" value={totalMessages} icon={MessageSquare} />
        <Metric label="Active users" value={activeUsers} icon={Bot} />
        <Metric label="Tokens" value={totalTokens.toLocaleString('vi-VN')} icon={Bot} />
      </div>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm user, email, tiêu đề hoặc nội dung chat" className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm" /></div>
      </div>
      {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div> : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-400"><tr><th className="text-left px-4 py-3">User</th><th className="text-left px-4 py-3">Hội thoại</th><th className="text-left px-4 py-3">Messages</th><th className="text-left px-4 py-3">Tokens</th><th className="text-left px-4 py-3">Tin nhắn cuối</th><th className="text-left px-4 py-3">Cập nhật</th><th className="text-right px-4 py-3">Chi tiết</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((item) => {
                  const last = item.messages?.[item.messages.length - 1];
                  return (
                    <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 align-top">
                      <td className="px-4 py-3"><p className="font-semibold">{item.userId?.name || 'Ẩn danh'}</p><p className="text-xs text-slate-400">{item.userId?.email}</p></td>
                      <td className="px-4 py-3"><p className="font-semibold">{item.title || item.conversationId}</p><p className="text-xs text-slate-400">{item.modelVersion}</p></td>
                      <td className="px-4 py-3">{item.messages?.length || 0}</td>
                      <td className="px-4 py-3">{(Number(item.totalTokens?.input || 0) + Number(item.totalTokens?.output || 0)).toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-3 max-w-sm truncate">{last?.role}: {last?.content || '--'}</td>
                      <td className="px-4 py-3 text-slate-500">{fmt(item.lastMessageTime)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setSelected(item)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 text-xs font-bold">
                          <Eye size={13} /> Xem
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <DetailModal title="Chi tiết hội thoại AI" onClose={() => setSelected(null)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Info label="User" value={`${selected.userId?.name || 'Ẩn danh'} · ${selected.userId?.email || '--'}`} />
            <Info label="Conversation ID" value={selected.conversationId || '--'} />
            <Info label="Title" value={selected.title || '--'} />
            <Info label="Model" value={selected.modelVersion || '--'} />
            <Info label="Messages" value={selected.messages?.length || 0} />
            <Info label="Tokens" value={(Number(selected.totalTokens?.input || 0) + Number(selected.totalTokens?.output || 0)).toLocaleString('vi-VN')} />
            <Info label="Archived" value={selected.isArchived ? 'Yes' : 'No'} />
            <Info label="Last message" value={fmt(selected.lastMessageTime)} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2">Messages</h3>
            <div className="space-y-3">
              {(selected.messages || []).map((message: any, index: number) => (
                <div key={index} className={`p-3 rounded-lg border ${message.role === 'assistant' ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700'}`}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">{message.role}</span>
                    <span className="text-xs text-slate-400">{fmt(message.timestamp)}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{message.content}</p>
                </div>
              ))}
            </div>
          </div>
          <JsonBlock title="Context" data={selected.context} />
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
