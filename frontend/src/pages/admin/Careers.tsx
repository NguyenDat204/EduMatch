import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { careerService, adminService } from '../../services/api';

export const Careers = () => {
  const [careersList, setCareersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New Career Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Công nghệ');
  const [salary, setSalary] = useState('$80,000 - $120,000');
  const [growth, setGrowth] = useState('Steady (+12%)');
  const [description, setDescription] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchCareers = async () => {
    try {
      const res = await careerService.getCareers();
      if (res.success && res.data) {
        setCareersList(res.data);
      }
    } catch (err) {
      console.error("Failed to load careers:", err);
      setError("Không thể tải danh sách ngành nghề.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  const handleDelete = async (id: string, careerTitle: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ngành nghề "${careerTitle}"? Học sinh sẽ không thể thấy ngành này nữa.`)) return;
    try {
      const res = await adminService.deleteCareer(id);
      if (res.success) {
        setCareersList(prev => prev.filter(c => c._id !== id));
        setSuccess(`Đã xóa ngành nghề "${careerTitle}" khỏi cơ sở dữ liệu.`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Xóa ngành nghề thất bại.");
    }
  };

  const handleCreateCareer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Vui lòng điền đầy đủ Tên và Mô tả ngành nghề.");
      return;
    }

    setFormLoading(true);
    setError(null);
    setSuccess(null);

    const skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const res = await adminService.createCareer({
        title,
        category,
        salary,
        growth,
        description,
        skills
      });

      if (res.success && res.data) {
        setCareersList(prev => [res.data, ...prev]);
        setSuccess(`Đã tạo ngành nghề mới: "${title}"`);
        setShowAddForm(false);
        // Reset fields
        setTitle('');
        setCategory('Công nghệ');
        setSalary('$80,000 - $120,000');
        setGrowth('Steady (+12%)');
        setDescription('');
        setSkillsStr('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Tạo ngành nghề thất bại.");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredCareers = careersList.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Quản lý Ngành nghề</h1>
          <p className="text-slate-500">Xem danh sách, thêm ngành mới hoặc xóa dữ liệu ngành nghề trong hệ thống.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm ngành nghề..." 
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

      {/* Add New Career Modal Slide-Over Form */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg h-full bg-white dark:bg-slate-900 p-8 shadow-2xl overflow-y-auto space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold">Thêm ngành nghề mới</h3>
                <button onClick={() => setShowAddForm(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg bg-slate-50 dark:bg-slate-800">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateCareer} className="space-y-4 pt-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Tên ngành nghề</label>
                  <input 
                    type="text" 
                    required 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ví dụ: AI Engineer"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Nhóm ngành nghề</label>
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                  >
                    <option value="Công nghệ">Công nghệ & Kỹ thuật</option>
                    <option value="Kinh doanh">Kinh doanh & Quản lý</option>
                    <option value="Y tế">Y tế & Sức khỏe</option>
                    <option value="Xã hội">Khoa học Xã hội & Nhân văn</option>
                    <option value="Nghệ thuật">Nghệ thuật & Sáng tạo</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Mức lương TB</label>
                    <input 
                      type="text" 
                      value={salary}
                      onChange={e => setSalary(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Triển vọng tăng trưởng</label>
                    <input 
                      type="text" 
                      value={growth}
                      onChange={e => setGrowth(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Mô tả ngành</label>
                  <textarea 
                    rows={3}
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Mô tả tóm tắt về đặc thù công việc và nhiệm vụ chính..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Kỹ năng cốt lõi (Phân cách bằng dấu phẩy)</label>
                  <input 
                    type="text" 
                    value={skillsStr}
                    onChange={e => setSkillsStr(e.target.value)}
                    placeholder="Ví dụ: Python, Machine Learning, Analytics"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                  />
                </div>
              </form>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button 
                type="submit" 
                onClick={handleCreateCareer}
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
                  <th className="px-6 py-4">Tên ngành</th>
                  <th className="px-6 py-4">Nhóm ngành</th>
                  <th className="px-6 py-4">Mức lương tham khảo</th>
                  <th className="px-6 py-4">Triển vọng</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium">
                {filteredCareers.map((career: any) => (
                  <tr key={career._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-950 dark:text-slate-100">{career.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {career.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-green-600 dark:text-green-400">{career.salary}</td>
                    <td className="px-6 py-4 text-slate-500">{career.growth}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleDelete(career._id, career.title)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Xóa ngành"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCareers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium animate-pulse">
                      Không tìm thấy ngành nghề tương ứng.
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
