import { useState } from 'react';
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
  X
} from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { mockCurrentUser } from '../mock/data';

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: mockCurrentUser.name,
    email: mockCurrentUser.email,
    city: 'Hanoi, VN',
    school: mockCurrentUser.academicInfo?.school || '',
    grade: mockCurrentUser.academicInfo?.grade || 12,
    majorInterest: mockCurrentUser.academicInfo?.majorInterest || ''
  });

  const handleSave = () => {
    // In real app, call API to save
    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row items-start gap-8 glass p-10 rounded-[3rem] border-none shadow-premium relative overflow-hidden">
          <div className="relative group shrink-0">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
              <img src={mockCurrentUser.avatar} alt={formData.name} className="w-full h-full object-cover" />
            </div>
            <button className="absolute -bottom-2 -right-2 p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-primary-600 shadow-lg hover:scale-110 transition-transform">
              <Camera size={18} />
            </button>
          </div>

          <div className="flex-1 w-full text-center md:text-left">
            {isEditing ? (
              <div className="space-y-4 max-w-md mx-auto md:mx-0">
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full text-2xl font-display font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input 
                  type="text" 
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="flex gap-3 pt-2 justify-center md:justify-start">
                  <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all">
                    <Save size={16} /> Save
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
                  {mockCurrentUser.isPro ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-200 dark:border-amber-900/30">
                      <Star size={12} fill="currentColor" />
                      Pro Member
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-xs font-bold uppercase tracking-widest">
                      Free Plan
                    </span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-4 mb-6">
                  <span className="flex items-center gap-1.5"><Mail size={16} />{formData.email}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={16} />{formData.city}</span>
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-500/20 hover:scale-105 transition-all">
                    Edit Profile
                  </button>
                  <button className="px-5 py-2.5 glass rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-none">Upgrade to Pro</button>
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
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Current School</label>
                    <input 
                      type="text" 
                      value={formData.school}
                      onChange={e => setFormData({...formData, school: e.target.value})}
                      className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Grade Level</label>
                    <input 
                      type="number" 
                      value={formData.grade}
                      onChange={e => setFormData({...formData, grade: Number(e.target.value)})}
                      className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Major Interest</label>
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
                    <span className="font-bold text-slate-700 dark:text-slate-200">{formData.school}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Grade Level</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">Grade {formData.grade}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Major Interest</span>
                    <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg font-bold text-sm">
                      {formData.majorInterest}
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
              <h3 className="text-xl font-bold">Security & Billing</h3>
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
