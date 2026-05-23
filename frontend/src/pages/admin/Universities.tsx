import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { universityService, adminService } from '../../services/api';

export const Universities = () => {
  const [unisList, setUnisList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New University Form Fields
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Hà Nội, Việt Nam');
  const [ranking, setRanking] = useState('#1 Việt Nam');
  const [logo, setLogo] = useState('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=200&auto=format&fit=crop');
  const [programsStr, setProgramsStr] = useState('Kỹ thuật phần mềm, Trí tuệ nhân tạo');
  const [website, setWebsite] = useState('https://');
  const [formLoading, setFormLoading] = useState(false);

  const fetchUnis = async () => {
    try {
      const res = await universityService.getUniversities();
      if (res.success && res.data) {
        setUnisList(res.data);
      }
    } catch (err) {
      console.error("Failed to load universities:", err);
      setError("Không thể tải danh sách trường học.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnis();
  }, []);

  const handleDelete = async (id: string, uniName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa trường "${uniName}" khỏi cơ sở dữ liệu?`)) return;
    try {
      const res = await adminService.deleteUniversity(id);
      if (res.success) {
        setUnisList(prev => prev.filter(u => u._id !== id));
        setSuccess(`Đã xóa trường "${uniName}" khỏi cơ sở dữ liệu.`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Xóa trường học thất bại.");
    }
  };

  const handleCreateUni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      setError("Vui lòng điền đầy đủ Tên trường và Địa chỉ.");
      return;
    }

    setFormLoading(true);
    setError(null);
    setSuccess(null);

    const programs = programsStr.split(',').map(p => p.trim()).filter(Boolean);

    try {
      const res = await adminService.createUniversity({
        name,
        location,
        ranking,
        logo,
        programs,
        website
      });

      if (res.success && res.data) {
        setUnisList(prev => [res.data, ...prev]);
        setSuccess(`Đã thêm trường đại học mới: "${name}"`);
        setShowAddForm(false);
        // Reset fields
        setName('');
        setLocation('Hà Nội, Việt Nam');
        setRanking('#1 Việt Nam');
        setLogo('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=200&auto=format&fit=crop');
        setProgramsStr('Kỹ thuật phần mềm, Trí tuệ nhân tạo');
        setWebsite('https://');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Thêm trường học thất bại.");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredUnis = unisList.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Quản lý Trường học</h1>
          <p className="text-slate-500">Xem danh sách, thêm trường mới hoặc xóa các đối tác giáo dục.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm trường học..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none w-64 text-sm font-semibold"
            />
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
          >
            <Plus size={20} /> Thêm mới
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl flex items-start gap-3 text-sm font-medium border border-red-100 dark:border-red-950/30">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-start gap-3 text-sm font-medium border border-emerald-100 dark:border-emerald-950/30">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Add New University Slide-Over */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg h-full bg-white dark:bg-slate-900 p-8 shadow-2xl overflow-y-auto space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold">Thêm trường đại học mới</h3>
                <button onClick={() => setShowAddForm(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg bg-slate-50 dark:bg-slate-800">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateUni} className="space-y-4 pt-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Tên trường</label>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ví dụ: Đại học Bách Khoa"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Địa điểm</label>
                  <input 
                    type="text" 
                    required
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Thứ hạng/Đặc trưng</label>
                    <input 
                      type="text" 
                      value={ranking}
                      onChange={e => setRanking(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Logo URL</label>
                    <input 
                      type="text" 
                      value={logo}
                      onChange={e => setLogo(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Ngành đào tạo trọng điểm (Dấu phẩy phân cách)</label>
                  <input 
                    type="text" 
                    value={programsStr}
                    onChange={e => setProgramsStr(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Website URL</label>
                  <input 
                    type="text" 
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                  />
                </div>
              </form>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button 
                type="submit" 
                onClick={handleCreateUni}
                disabled={formLoading}
                className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {formLoading ? <Loader2 size={18} className="animate-spin" /> : "Thêm mới"}
              </button>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary-600" size={36} />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4">Tên trường</th>
                  <th className="px-6 py-4">Địa điểm</th>
                  <th className="px-6 py-4">Đặc trưng</th>
                  <th className="px-6 py-4">Trọng điểm</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium">
                {filteredUnis.map((uni: any) => (
                  <tr key={uni._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-955 dark:text-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={uni.logo} alt={uni.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=200&auto=format&fit=crop'; }} />
                      </div>
                      <span className="line-clamp-1">{uni.name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{uni.location}</td>
                    <td className="px-6 py-4 text-primary-600 dark:text-primary-400 font-black">{uni.ranking}</td>
                    <td className="px-6 py-4 text-slate-500">
                      <span className="line-clamp-1">{uni.programs?.join(', ')}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(uni._id, uni.name)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Xóa trường"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUnis.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium animate-pulse">
                      Không tìm thấy đối tác giáo dục tương ứng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
