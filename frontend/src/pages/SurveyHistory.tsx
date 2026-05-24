import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History, Loader2, Trash2, Pencil, Check, X,
  ChevronDown, ChevronUp, Sparkles, ArrowRight,
  ClipboardList,
} from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { surveyHistoryService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface HistoryRecord {
  _id: string;
  title: string;
  completedAt: string;
  result: {
    archetype?: string;
    suitabilityScore?: number;
    description?: string;
    insights?: string;
    careers?: any[];
  };
}

export const SurveyHistory = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords]     = useState<HistoryRecord[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editTitle, setEditTitle]   = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    surveyHistoryService.getAll()
      .then((res) => { if (res.success) setRecords(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) return;
    try {
      await surveyHistoryService.rename(id, editTitle.trim());
      setRecords((prev) => prev.map((r) => r._id === id ? { ...r, title: editTitle.trim() } : r));
    } catch { /* silent */ }
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await surveyHistoryService.delete(id);
      setRecords((prev) => prev.filter((r) => r._id !== id));
    } catch { /* silent */ }
    setDeletingId(null);
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh] gap-3 text-slate-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Đang tải lịch sử...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History size={20} className="text-primary-600" />
              Lịch sử trắc nghiệm
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {records.length > 0 ? `${records.length} lần làm trắc nghiệm` : 'Chưa có lịch sử'}
            </p>
          </div>
          <button
            onClick={() => navigate('/survey')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            <ClipboardList size={15} />
            Làm trắc nghiệm mới
          </button>
        </div>

        {/* Empty state */}
        {records.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl shadow-card">
            <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={24} className="text-primary-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Chưa có lịch sử</h3>
            <p className="text-sm text-slate-500 mb-5">Hoàn thành bài trắc nghiệm để xem kết quả tại đây.</p>
            <button
              onClick={() => navigate('/survey')}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-lg text-sm hover:bg-primary-700 transition-colors mx-auto"
            >
              Bắt đầu ngay <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* Records list */}
        <div className="space-y-3">
          {records.map((record) => {
            const isExpanded = expandedId === record._id;
            const isEditing  = editingId  === record._id;
            const isDeleting = deletingId === record._id;

            return (
              <div
                key={record._id}
                className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl shadow-card overflow-hidden"
              >
                {/* Row header */}
                <div className="flex items-center gap-3 p-4">
                  {/* Archetype badge */}
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Sparkles size={17} className="text-primary-600" />
                  </div>

                  {/* Title + meta */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleRename(record._id); if (e.key === 'Escape') setEditingId(null); }}
                          className="flex-1 text-sm font-semibold bg-slate-50 dark:bg-navy-800 border border-primary-400 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button onClick={() => handleRename(record._id)} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg transition-colors">
                          <Check size={15} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg transition-colors">
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{record.title}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px] text-slate-400">{fmt(record.completedAt)}</span>
                          {record.result?.archetype && (
                            <span className="text-[10px] font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">
                              {record.result.archetype}
                            </span>
                          )}
                          {record.result?.suitabilityScore != null && (
                            <span className="text-[10px] font-semibold text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full">
                              {record.result.suitabilityScore}% phù hợp
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => { setEditingId(record._id); setEditTitle(record.title); }}
                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
                        title="Đổi tên"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingId(record._id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : record._id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
                        title={isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                      >
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Delete confirm */}
                {isDeleting && (
                  <div className="px-4 pb-4 flex items-center justify-between bg-red-50 dark:bg-red-950/10 border-t border-red-100 dark:border-red-900/30 py-3">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">Xóa kết quả này? Không thể hoàn tác.</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(record._id)} className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors">Xóa</button>
                      <button onClick={() => setDeletingId(null)} className="px-3 py-1 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-600 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors">Hủy</button>
                    </div>
                  </div>
                )}

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-navy-700 p-4 space-y-4 animate-fade-in">
                    {record.result?.description && (
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Mô tả hình mẫu</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{record.result.description}</p>
                      </div>
                    )}

                    {record.result?.insights && (
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Nhận xét AI</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">"{record.result.insights}"</p>
                      </div>
                    )}

                    {record.result?.careers && record.result.careers.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Nghề nghiệp gợi ý</p>
                        <div className="flex flex-wrap gap-2">
                          {record.result.careers.slice(0, 5).map((c: any, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-lg">
                              {c.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};
