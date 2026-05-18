import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Mail, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  Star, 
  Settings, 
  Camera,
  ExternalLink,
  ShieldCheck,
  Save,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/api';

export const Profile = () => {
  const { user, isLoading: authLoading, updateUserInState } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: 'Hanoi, VN',
    school: '',
    grade: '12',
    majorInterest: ''
  });

  // Populate data when user hook finishes loading
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        city: 'Hanoi, VN',
        school: user.academicInfo?.school || '',
        grade: user.academicInfo?.grade || '12',
        majorInterest: user.academicInfo?.majorInterest || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Họ và tên không được bỏ trống.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await profileService.updateProfile(
        formData.name,
        formData.school,
        formData.grade,
        formData.majorInterest
      );

      if (response.success && response.data) {
        updateUserInState(response.data);
        setSuccess(true);
        setIsEditing(false);
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save changes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 premium-gradient rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl flex items-start gap-3 text-sm font-medium border border-red-100 dark:border-red-950/30">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-start gap-3 text-sm font-medium border border-emerald-100 dark:border-emerald-950/30">
            <Star size={18} className="shrink-0 mt-0.5" />
            <span>Cập nhật hồ sơ cá nhân thành công!</span>
          </div>
        )}

        <header className="flex flex-col md:flex-row items-start gap-8 glass p-10 rounded-[3rem] border-none shadow-premium relative overflow-hidden">
          <div className="relative group shrink-0">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
              <img src={user.avatar || "https://i.pravatar.cc/150?u=student"} alt={formData.name} className="w-full h-full object-cover" />
            </div>
            <button className="absolute -bottom-2 -right-2 p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-primary-600 shadow-lg hover:scale-110 transition-transform">
              <Camera size={18} />
            </button>
          </div>

          <div className="flex-1 w-full text-center md:text-left">
            {isEditing ? (
              <div className="space-y-4 max-w-md mx-auto md:mx-0">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full text-lg font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div className="flex gap-3 pt-2 justify-center md:justify-start">
                  <button 
                    disabled={isLoading}
                    onClick={handleSave} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Changes
                  </button>
                  <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    <X size={16} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                  <h2 className="text-3xl font-display font-bold">{formData.name}</h2>
                  {user.isPro ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-200 dark:border-amber-900/30">
                      <Star size={12} fill="currentColor" />
                      Pro Member
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-xs font-bold uppercase tracking-widest">
                      Student Account
                    </span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-4 mb-6 text-sm">
                  <span className="flex items-center gap-1.5"><Mail size={16} />{formData.email}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={16} />{formData.city}</span>
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-500/20 hover:scale-105 transition-all">
                    Edit Profile
                  </button>
                  <button className="px-5 py-2.5 glass rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-none">Get Premium Mentorship</button>
                </div>
              </>
            )}
          </div>
          
          <button className="absolute top-6 right-6 p-2 text-slate-400 hover:text-primary-600">
            <Settings size={20} />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Academic Info */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-xl flex items-center justify-center">
                <GraduationCap size={20} />
              </div>
              <h3 className="text-xl font-bold">Academic Status</h3>
            </div>
            
            <div className="glass p-8 rounded-[2rem] border-none shadow-premium space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Current School</label>
                    <input 
                      type="text" 
                      value={formData.school}
                      onChange={e => setFormData({...formData, school: e.target.value})}
                      className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Grade Level</label>
                    <select
                      value={formData.grade}
                      onChange={e => setFormData({...formData, grade: e.target.value})}
                      className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="10">Lớp 10</option>
                      <option value="11">Lớp 11</option>
                      <option value="12">Lớp 12</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Major Interest</label>
                    <input 
                      type="text" 
                      value={formData.majorInterest}
                      onChange={e => setFormData({...formData, majorInterest: e.target.value})}
                      className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Current School</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{formData.school || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Grade Level</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">Lớp {formData.grade}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Major Interest</span>
                    <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg font-bold text-sm">
                      {formData.majorInterest || 'Chưa thiết lập'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Account & Security */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-50 dark:bg-accent-900/20 text-accent-600 rounded-xl flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-xl font-bold">Security & Settings</h3>
            </div>
            
            <div className="glass p-8 rounded-[2rem] border-none shadow-premium space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center"><BookOpen size={16} /></div>
                  <span className="font-bold text-sm">Update Password</span>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center"><ExternalLink size={16} /></div>
                  <span className="font-bold text-sm">Connected Accounts</span>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

const ChevronRight = ({ size, className }: { size: number, className: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
)
