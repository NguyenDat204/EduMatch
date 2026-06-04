import { useState, useEffect } from 'react';
import { Sliders, HelpCircle, Save, Loader2, CheckCircle2, AlertCircle, Cpu, ShieldAlert, Sparkles } from 'lucide-react';
import { adminService } from '../../services/api';

export const Settings = () => {
  const [settings, setSettings] = useState<any>({
    maintenanceMode: false,
    allowRegistration: true,
    appTitle: 'EduMatch',
    aiModel: 'gemini-1.5-flash',
    maxChatHistory: 50,
    surveyThreshold: 70,
    systemPromptTemplate: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'system' | 'ai' | 'limits'>('system');

  useEffect(() => {
    adminService.getSettings()
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Không thể tải cấu hình hệ thống.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await adminService.updateSettings(settings);
      if (res.success && res.data) {
        setSettings(res.data);
        setSuccess('Đã lưu cấu hình hệ thống thành công.');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Không thể lưu cấu hình hệ thống.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  const tabs = [
    { id: 'system', label: 'Cơ bản & Hệ thống', icon: Sliders },
    { id: 'ai', label: 'Trí tuệ nhân tạo (AI)', icon: Cpu },
    { id: 'limits', label: 'Giới hạn & Điểm số', icon: ShieldAlert },
  ] as const;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="text-primary-600" />
          Cài đặt hệ thống
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Cấu hình các thông số vận hành và hành vi của AI hướng nghiệp.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3 text-sm border border-red-100 dark:border-red-900/30">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-xl flex items-start gap-3 text-sm border border-green-100 dark:border-green-900/30">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="flex border-b border-slate-200 dark:border-navy-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-navy-800 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-sm p-6 space-y-6">
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Tiêu đề ứng dụng
              </label>
              <input
                type="text"
                required
                value={settings.appTitle}
                onChange={(e) => handleChange('appTitle', e.target.value)}
                className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-900/50 rounded-xl">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Chế độ bảo trì hệ thống</h4>
                <p className="text-xs text-slate-500 mt-0.5">Khi kích hoạt, người dùng sẽ không thể truy cập các chức năng chính ngoại trừ Admin.</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('maintenanceMode', !settings.maintenanceMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                  settings.maintenanceMode ? 'bg-red-500' : 'bg-slate-300 dark:bg-navy-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-900/50 rounded-xl">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Mở đăng ký tài khoản mới</h4>
                <p className="text-xs text-slate-500 mt-0.5">Cho phép người dùng tự do đăng ký tài khoản học sinh trên trang chủ.</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('allowRegistration', !settings.allowRegistration)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                  settings.allowRegistration ? 'bg-primary-600' : 'bg-slate-300 dark:bg-navy-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.allowRegistration ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                Lựa chọn Mô hình AI (Model){' '}
                <span title="Hệ thống sẽ gọi API mô hình này để hướng nghiệp" className="cursor-pointer">
                  <HelpCircle size={13} className="text-slate-400" />
                </span>
              </label>
              <select
                value={settings.aiModel}
                onChange={(e) => handleChange('aiModel', e.target.value)}
                className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Khuyên dùng - Nhanh & Tối ưu chi phí)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Thông minh - Xử lý tư duy phức tạp)</option>
                <option value="gpt-4o-mini">GPT-4o Mini (OpenAI - Ổn định)</option>
                <option value="gpt-4o">GPT-4o (OpenAI - Cao cấp)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                System Prompt Template <Sparkles size={13} className="text-amber-500" />
              </label>
              <textarea
                rows={8}
                value={settings.systemPromptTemplate}
                onChange={(e) => handleChange('systemPromptTemplate', e.target.value)}
                placeholder="Ví dụ: Bạn là một chuyên gia tư vấn hướng nghiệp..."
                className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Prompt này là khung cấu hình gốc gửi cho AI để điều chỉnh phong cách tư vấn, tính cách, cũng như cách nó đưa ra lời khuyên hướng nghiệp.</p>
            </div>
          </div>
        )}

        {activeTab === 'limits' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Số lượng lịch sử chat lưu trữ tối đa
                </label>
                <input
                  type="number"
                  min={5}
                  max={200}
                  required
                  value={settings.maxChatHistory}
                  onChange={(e) => handleChange('maxChatHistory', Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                />
                <p className="text-[10px] text-slate-400 mt-1">Số lượng tin nhắn hội thoại tối đa được lưu trữ giữa học sinh và AI tư vấn.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Điểm số phù hợp tối thiểu để gợi ý ngành (%)
                </label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  required
                  value={settings.surveyThreshold}
                  onChange={(e) => handleChange('surveyThreshold', Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                />
                <p className="text-[10px] text-slate-400 mt-1">Học sinh phải đạt tối thiểu % độ phù hợp này để AI liệt kê ngành đó vào danh sách gợi ý trọng tâm.</p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-navy-700 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
};
