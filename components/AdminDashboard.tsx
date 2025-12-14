
import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ADMIN_STATS } from '../constants';
import { User, Post, BotConfig, AdminPermissions, SystemSettings } from '../types';
import * as Icons from './Icons';
import { formatNumber } from '../constants';
import { db } from '../services/storage';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  posts: Post[];
  verificationRequests: string[];
  bots: BotConfig[];
  onUpdateBots: (bots: BotConfig[], speed?: number, prioritizeVerified?: boolean) => void;
  onVerifyUser: (userId: string, tier: 'blue' | 'gold') => void;
  onRejectVerification: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onDeletePost: (postId: string) => void;
  onUpdateUser: (user: User) => void;
  onBoostTarget?: (targetId: string, amount: number, type: 'like' | 'view') => void;
  onAddUser?: (user: Partial<User>) => void; 
}

// ... (Existing Modals: AddUserModal, VerificationModal, EditUserModal - Keep them as is)
// To save space, I will assume the previous modals are here. If the user copies this, they need the full file.
// Since I must output full file content, I'll include them.

// --- Add User Modal ---
const AddUserModal: React.FC<{ onClose: () => void; onAdd: (u: Partial<User>) => void }> = ({ onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'user' | 'admin' | 'bot'>('user');
    const [coins, setCoins] = useState(100);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !username || !password) return;
        onAdd({ name, username, password, role, coins });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-scaleIn">
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                        <Icons.UserPlus size={20} className="text-green-500" /> إضافة عضو جديد
                    </h3>
                    <button onClick={onClose}><Icons.X size={20} className="text-gray-500" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">الاسم</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-slate-900 dark:border-slate-600 dark:text-white" placeholder="الاسم الكامل" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">المعرف (Username)</label>
                        <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-slate-900 dark:border-slate-600 dark:text-white" placeholder="اسم المستخدم" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">كلمة المرور</label>
                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-slate-900 dark:border-slate-600 dark:text-white" placeholder="********" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">الصلاحية</label>
                            <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full p-2 rounded-lg border dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                                <option value="user">مستخدم عادي</option>
                                <option value="admin">مشرف (Admin)</option>
                                <option value="bot">بوت</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">الرصيد الابتدائي</label>
                            <input type="number" value={coins} onChange={e => setCoins(Number(e.target.value))} className="w-full p-2 rounded-lg border dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg mt-2">
                        إنشاء الحساب
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Verification Modal ---
const VerificationModal: React.FC<{ user: User; onClose: () => void; onConfirm: (tier: 'blue' | 'gold') => void }> = ({ user, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-scaleIn">
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                        <Icons.ShieldCheck size={20} className="text-blue-500" /> مراجعة طلب التوثيق
                    </h3>
                    <button onClick={onClose}><Icons.X size={20} className="text-gray-500" /></button>
                </div>
                
                <div className="p-6 text-center">
                    <img src={user.avatar} className="w-20 h-20 rounded-full mx-auto border-4 border-white dark:border-slate-700 shadow-md mb-4" alt="" />
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">{user.name}</h2>
                    <p className="text-sm text-gray-500 mb-6">{user.username}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => onConfirm('blue')}
                            className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-blue-100 dark:border-blue-900 hover:border-blue-500 bg-blue-50 dark:bg-blue-900/10 transition-all group"
                        >
                            <Icons.ShieldCheck size={32} className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-blue-700 dark:text-blue-400">توثيق قياسي</span>
                            <span className="text-[10px] text-gray-500">للأشخاص والنشاطات</span>
                        </button>
                        <button 
                            onClick={() => onConfirm('gold')}
                            className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-yellow-100 dark:border-yellow-900 hover:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 transition-all group"
                        >
                            <Icons.Crown size={32} className="text-yellow-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-yellow-700 dark:text-yellow-400">توثيق ذهبي (VIP)</span>
                            <span className="text-[10px] text-gray-500">للمشاهير والوزراء</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Edit User Modal ---
const EditUserModal: React.FC<{ user: User; currentUser: User; onClose: () => void; onSave: (u: User) => void }> = ({ user, currentUser, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...user });

  const handleChange = (field: keyof User, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-scaleIn">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
          <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
            <Icons.Settings size={20} /> تعديل المستخدم
          </h3>
          <button onClick={onClose}><Icons.X size={20} className="text-gray-500" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* ... Basic Fields ... */}
          <div className="flex items-center gap-4 mb-4">
             <img src={formData.avatar} className="w-16 h-16 rounded-full border-2 border-gray-200" alt="" />
             <div>
                <h4 className="font-bold dark:text-white">{formData.name}</h4>
                <p className="text-xs text-gray-500">{formData.id}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">الاسم</label>
                <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full p-2 rounded-lg border dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">المعرف</label>
                <input type="text" value={formData.username} onChange={e => handleChange('username', e.target.value)} className="w-full p-2 rounded-lg border dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
             </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
             <h4 className="font-bold text-sm mb-2 text-yellow-800 dark:text-yellow-500">اقتصاديات</h4>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold mb-1">الرصيد</label>
                    <input type="number" value={formData.coins} onChange={e => handleChange('coins', Number(e.target.value))} className="w-full p-2 rounded-lg border dark:bg-slate-900 dark:border-slate-600" />
                </div>
                <div>
                    <label className="block text-xs font-bold mb-1">XP</label>
                    <input type="number" value={formData.xp || 0} onChange={e => handleChange('xp', Number(e.target.value))} className="w-full p-2 rounded-lg border dark:bg-slate-900 dark:border-slate-600" />
                </div>
             </div>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-600">
             <h4 className="font-bold text-sm mb-3 dark:text-white flex items-center gap-2"><Icons.Lock size={14}/> الصلاحيات المتقدمة</h4>
             <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-sm dark:text-gray-300">توثيق الحساب</span>
                    <select 
                        value={formData.isVerified ? (formData.verificationTier || 'blue') : 'none'} 
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'none') {
                                handleChange('isVerified', false);
                                handleChange('verificationTier', undefined);
                            } else {
                                handleChange('isVerified', true);
                                handleChange('verificationTier', val);
                            }
                        }}
                        className="p-1 rounded bg-gray-100 dark:bg-slate-700 text-xs"
                    >
                        <option value="none">غير موثق</option>
                        <option value="blue">موثق (أزرق)</option>
                        <option value="gold">موثق (ذهبي)</option>
                    </select>
                 </div>
                 
                 <div className="flex items-center justify-between">
                    <span className="text-sm dark:text-gray-300 flex items-center gap-1">
                        <Icons.Zap size={14} className="text-red-500" /> إذن الرشق (Boost)
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.canBoost || false} onChange={e => handleChange('canBoost', e.target.checked)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                 </div>
             </div>
          </div>

          <button type="submit" className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg mt-2">
             حفظ التعديلات
          </button>
        </form>
      </div>
    </div>
  );
};

const Card: React.FC<{ title: string; value: string; trend: string; icon: any; color: string }> = ({ title, value, trend, icon: Icon, color }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
         <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
      <span className="text-green-500 text-sm font-bold flex items-center bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
        +{trend}% <Icons.BarChart2 size={12} className="mr-1" />
      </span>
    </div>
    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value}</h2>
  </div>
);

// --- Bot Control Panel Components ---
const BotTerminal: React.FC<{ bots: BotConfig[], isPriority: boolean }> = ({ bots, isPriority }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeBotsCount = bots.filter(b => b.isActive).length;

  useEffect(() => {
    if (activeBotsCount === 0) return;

    const actions = ["LIKED_POST", "VIEWED_STORY", "SCROLLED_FEED", "CHECKED_PROFILE"];
    
    const interval = setInterval(() => {
      const activeBots = bots.filter(b => b.isActive);
      if (activeBots.length === 0) return;
      
      const burst = Math.floor(Math.random() * 3) + 1;
      const newLines = [];
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second:'2-digit' });

      for(let i=0; i<burst; i++) {
          const randomBot = activeBots[Math.floor(Math.random() * activeBots.length)];
          const action = actions[Math.floor(Math.random() * actions.length)];
          const priorityTag = isPriority ? " [PRIORITY_TARGET]" : "";
          newLines.push(`[${timestamp}] [BOT#${randomBot.id.slice(0,6)}] ${action} ${priorityTag}`);
      }
      
      setLogs(prev => {
        const updated = [...prev, ...newLines];
        if (updated.length > 20) return updated.slice(-20);
        return updated;
      });
      
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 500);

    return () => clearInterval(interval);
  }, [bots, activeBotsCount, isPriority]);

  return (
    <div className="bg-[#0f172a] rounded-xl border border-slate-700 shadow-inner flex flex-col h-[250px] font-mono text-[10px] md:text-xs overflow-hidden">
      <div className="bg-slate-800 p-2 px-3 border-b border-slate-700 flex justify-between items-center text-slate-400">
        <div className="flex items-center gap-2">
           <Icons.Terminal size={14} />
           <span className="font-bold">SYSTEM LOGS ({activeBotsCount} Active Nodes)</span>
        </div>
        <div className="flex gap-1.5 animate-pulse">
           <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 p-3 overflow-y-auto space-y-1 text-green-400 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
         {activeBotsCount === 0 && <div className="text-red-500/50 mt-10 text-center">--- SYSTEM PAUSED ---</div>}
         {logs.map((log, i) => (
           <div key={i} className="border-b border-slate-800/50 pb-0.5 animate-fadeIn opacity-80">
             {log}
           </div>
         ))}
      </div>
    </div>
  );
};

// --- Monetization Settings Section ---
const MonetizationSettings: React.FC = () => {
    const [settings, setSettings] = useState<SystemSettings>(db.getSystemSettings());
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        db.saveSystemSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 shadow-sm animate-fadeIn">
            <h3 className="font-bold text-lg border-b border-gray-100 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
                <Icons.Gem className="text-yellow-500" /> إعدادات تحقيق الدخل
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <h4 className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-3">
                            <Icons.ShieldCheck /> التوثيق الأزرق (شهري)
                        </h4>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">السعر (عملة)</label>
                            <input 
                                type="number" 
                                value={settings.blueTickPrice} 
                                onChange={e => setSettings({...settings, blueTickPrice: Number(e.target.value)})} 
                                className="w-full p-2 rounded-lg border dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                        <h4 className="font-bold text-yellow-700 dark:text-yellow-400 flex items-center gap-2 mb-3">
                            <Icons.Crown /> التوثيق الذهبي (شهري)
                        </h4>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">السعر (عملة)</label>
                            <input 
                                type="number" 
                                value={settings.goldTickPrice} 
                                onChange={e => setSettings({...settings, goldTickPrice: Number(e.target.value)})} 
                                className="w-full p-2 rounded-lg border dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-6">
                <button 
                    onClick={handleSave} 
                    className={`w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${saved ? 'bg-green-600' : 'bg-primary-600 hover:bg-primary-700'}`}
                >
                    {saved ? <><Icons.Check size={20} /> تم الحفظ بنجاح</> : <><Icons.Settings size={20} /> حفظ الإعدادات</>}
                </button>
            </div>
        </div>
    );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  currentUser,
  users, 
  posts, 
  verificationRequests, 
  bots,
  onUpdateBots,
  onVerifyUser, 
  onRejectVerification,
  onDeleteUser, 
  onDeletePost,
  onUpdateUser,
  onBoostTarget,
  onAddUser
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'posts' | 'verification' | 'bot' | 'settings'>('overview');
  
  // Search State
  const [userSearch, setUserSearch] = useState('');

  // Editing & Creating State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [verifyingUser, setVerifyingUser] = useState<User | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Bot Control State
  const [botSpeed, setBotSpeed] = useState(1); 
  const [verifiedPriority, setVerifiedPriority] = useState(true);
  
  // Rashq State
  const [boostTargetId, setBoostTargetId] = useState('');
  const [boostAmount, setBoostAmount] = useState(100);

  const activeBotCount = bots.filter(b => b.isActive).length;

  // --- Permission Checks ---
  const canManageUsers = currentUser.adminPermissions?.manageUsers || false;
  const canManageContent = currentUser.adminPermissions?.manageContent || false;
  const canManageSystem = currentUser.adminPermissions?.manageSystem || false;
  const canViewAnalytics = currentUser.adminPermissions?.viewAnalytics || false;

  const handleGlobalToggle = (state: boolean) => {
    if (!canManageSystem) return;
    const updatedBots = bots.map(b => ({ ...b, isActive: state }));
    onUpdateBots(updatedBots, botSpeed, verifiedPriority);
  };

  const handleSpeedChange = (speed: number) => {
      if (!canManageSystem) return;
      setBotSpeed(speed);
      onUpdateBots(bots, speed, verifiedPriority);
  };

  const handlePriorityToggle = () => {
      if (!canManageSystem) return;
      const newState = !verifiedPriority;
      setVerifiedPriority(newState);
      onUpdateBots(bots, botSpeed, newState);
  };

  const handleBoost = () => {
      if(onBoostTarget && boostTargetId) {
          onBoostTarget(boostTargetId, boostAmount, 'like');
          setBoostTargetId('');
      }
  };

  // Filter Users based on search
  const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.id === userSearch
  );

  const renderBotControl = () => (
    <div className="flex flex-col gap-6 animate-fadeIn pb-10">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white border border-slate-700 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
            <h3 className="text-indigo-300 text-sm font-bold mb-1">إجمالي البوتات</h3>
            <h1 className="text-5xl font-black tracking-tight">{formatNumber(bots.length)}</h1>
            <p className="text-xs text-indigo-400 mt-2">بوت جاهز للعمل</p>
         </div>
         <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between">
                <div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold">الحالة الآن</h3>
                    <h2 className={`text-3xl font-black ${activeBotCount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {activeBotCount > 0 ? 'نشط' : 'متوقف'}
                    </h2>
                </div>
                <div className={`p-3 rounded-full ${activeBotCount > 0 ? 'bg-green-100 text-green-600 animate-pulse' : 'bg-red-100 text-red-600'}`}>
                    <Icons.Zap size={24} />
                </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${(activeBotCount / bots.length) * 100}%` }}></div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Control Panel */}
         <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-lg border-b border-gray-100 dark:border-slate-700 pb-2">لوحة التحكم المركزية</h3>
            <div className="flex gap-2">
               <button onClick={() => handleGlobalToggle(true)} className={`flex-1 py-4 rounded-xl font-black text-white shadow-lg transition-transform active:scale-95 ${activeBotCount > 0 ? 'bg-green-600 ring-2 ring-green-300 dark:ring-green-900' : 'bg-gray-300 dark:bg-slate-700'}`}>تشغيل الكل</button>
               <button onClick={() => handleGlobalToggle(false)} className={`flex-1 py-4 rounded-xl font-black text-white shadow-lg transition-transform active:scale-95 ${activeBotCount === 0 ? 'bg-red-600 ring-2 ring-red-300 dark:ring-red-900' : 'bg-gray-300 dark:bg-slate-700'}`}>إيقاف الطوارئ</button>
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-500 mb-2">سرعة التفاعل (Bot Intensity)</label>
               <div className="flex bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
                  {[1, 2, 5].map((s) => (
                      <button key={s} onClick={() => handleSpeedChange(s)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${botSpeed === s ? 'bg-white dark:bg-slate-900 shadow-md text-primary-600' : 'text-gray-500'}`}>{s === 1 ? 'طبيعي' : s === 2 ? 'سريع 🔥' : 'جنوني 🚀'}</button>
                  ))}
               </div>
            </div>
            
            {/* RASHQ (Targeted Boost) Panel */}
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3 text-red-700 dark:text-red-400 font-black">
                    <Icons.Crosshair size={18} /> غرفة عمليات الرشق
                </div>
                <div className="space-y-3">
                    <input 
                        type="text" 
                        placeholder="معرف المنشور (Post ID)"
                        value={boostTargetId}
                        onChange={(e) => setBoostTargetId(e.target.value)}
                        className="w-full text-xs p-2 rounded border border-red-200 dark:border-red-800 bg-white dark:bg-black font-mono text-center"
                    />
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            value={boostAmount}
                            onChange={(e) => setBoostAmount(Number(e.target.value))}
                            className="w-20 text-xs p-2 rounded border border-red-200 dark:border-red-800 bg-white dark:bg-black font-mono text-center"
                        />
                        <button 
                            onClick={handleBoost}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow-lg active:scale-95"
                        >
                            إطلاق {boostAmount} 🚀
                        </button>
                    </div>
                </div>
            </div>
         </div>
         
         <div className="lg:col-span-2 space-y-4">
             <BotTerminal bots={bots} isPriority={verifiedPriority} />
         </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6 animate-fadeIn">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="إجمالي المستخدمين" value={formatNumber(users.length)} trend="12.5" icon={Icons.User} color="bg-blue-500" />
        <Card title="إجمالي المنشورات" value={formatNumber(posts.length)} trend="5.2" icon={Icons.ImageIcon} color="bg-purple-500" />
        <Card title="طلبات التوثيق" value={formatNumber(verificationRequests.length)} trend="8.1" icon={Icons.ShieldCheck} color="bg-yellow-500" />
        <Card title="جيش البوتات" value={formatNumber(bots.length)} trend="0" icon={Icons.Zap} color={activeBotCount > 0 ? "bg-green-500" : "bg-gray-500"} />
      </div>
      
      {canViewAnalytics && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">تحليلات النمو</h3>
            <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ADMIN_STATS}>
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415550" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}} />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                </AreaChart>
            </ResponsiveContainer>
            </div>
        </div>
      )}
    </div>
  );

  const renderUsersList = () => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden animate-fadeIn">
      {/* Search Bar & Actions for Users */}
      <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex flex-col md:flex-row gap-4 justify-between items-center">
        <h3 className="font-bold text-lg">قاعدة بيانات الأعضاء ({users.length})</h3>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <Icons.Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                type="text" 
                placeholder="بحث بالاسم أو المعرف..." 
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl py-2 pr-10 pl-4 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
            </div>
            <button 
                onClick={() => setShowAddUserModal(true)}
                disabled={!canManageUsers}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white font-bold shadow-lg transition-all ${canManageUsers ? 'bg-green-600 hover:bg-green-700 active:scale-95' : 'bg-gray-400 cursor-not-allowed'}`}
            >
                <Icons.UserPlus size={18} />
                <span className="hidden md:inline">إضافة عضو</span>
            </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500">
            <tr>
              <th className="p-4">المستخدم</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">الرصيد</th>
              <th className="p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
               <tr><td colSpan={4} className="p-8 text-center text-gray-500">لا توجد نتائج مطابقة للبحث</td></tr>
            ) : (
                filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                    <div className="relative">
                        <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-800 ${user.role === 'bot' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                        {user.name} 
                        {user.isVerified && <Icons.ShieldCheck size={14} className={user.verificationTier === 'gold' ? 'text-yellow-500' : 'text-blue-500'} />}
                        </div>
                        <div className="text-xs text-gray-500">{user.username}</div>
                    </div>
                    </td>
                    <td className="p-4">
                    <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : user.role === 'bot' ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-600'}`}>
                            {user.role}
                        </span>
                        {user.canBoost && <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">راشق</span>}
                    </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-yellow-600 dark:text-yellow-400">
                    {formatNumber(user.coins)} 🪙
                    </td>
                    <td className="p-4">
                        <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                // Toggle boost permission directly
                                onUpdateUser({ ...user, canBoost: !user.canBoost });
                            }}
                            className={`p-2 rounded-lg transition-colors ${user.canBoost ? 'bg-red-50 text-red-600' : 'text-gray-300 hover:text-red-500'}`}
                            title="تبديل صلاحية الرشق"
                        >
                            <Icons.Zap size={18} />
                        </button>
                        <button 
                            onClick={() => setEditingUser(user)}
                            disabled={!canManageUsers}
                            className={`p-2 rounded-lg transition-colors ${canManageUsers ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500' : 'text-gray-300 cursor-not-allowed'}`}
                        >
                            <Icons.Settings size={18} />
                        </button>
                        <button 
                            onClick={() => {
                                if(confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) onDeleteUser(user.id);
                            }}
                            disabled={!canManageUsers}
                            className={`p-2 rounded-lg transition-colors ${canManageUsers ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500' : 'text-gray-300 cursor-not-allowed'}`}
                        >
                            <Icons.Trash2 size={18} />
                        </button>
                        </div>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPostsList = () => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden animate-fadeIn">
      <div className="p-6 border-b border-gray-100 dark:border-slate-700">
        <h3 className="font-bold text-lg">سجل المنشورات</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500">
            <tr>
              <th className="p-4">الناشر</th>
              <th className="p-4">المحتوى</th>
              <th className="p-4">إحصائيات</th>
              <th className="p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                <td className="p-4 font-bold">{post.user.name}</td>
                <td className="p-4">
                    <span className="text-[10px] text-gray-400 font-mono block mb-1">{post.id}</span>
                    {post.image ? <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-bold">صورة</span> : 
                     post.video ? <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">فيديو</span> :
                     <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">نص</span>}
                </td>
                <td className="p-4 text-xs font-mono text-gray-500">
                   L:{post.likes} | C:{post.commentsCount}
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => {
                      if(confirm('حذف المنشور؟')) onDeletePost(post.id);
                    }}
                    disabled={!canManageContent}
                    className={`text-xs font-bold ${canManageContent ? 'text-red-500 hover:underline' : 'text-gray-300 cursor-not-allowed'}`}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderVerification = () => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden animate-fadeIn">
      <div className="p-6 border-b border-gray-100 dark:border-slate-700">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Icons.ShieldCheck className="text-blue-500" />
          طلبات التوثيق
          {verificationRequests.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{verificationRequests.length}</span>}
        </h3>
      </div>
      
      {verificationRequests.length === 0 ? (
        <div className="p-10 text-center text-gray-500">
          <Icons.ShieldCheck size={48} className="mx-auto mb-3 opacity-30" />
          <p>لا توجد طلبات توثيق معلقة حالياً</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {verificationRequests.map(userId => {
            const user = users.find(u => u.id === userId);
            if (!user) return null;
            return (
              <div key={user.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-4 w-full md:w-auto">
                   <img src={user.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" alt="" />
                   <div>
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white">{user.name}</h4>
                      <span className="text-gray-500 text-sm block mb-1">{user.username}</span>
                      <div className="flex gap-4 text-xs text-gray-400">
                         <span>{formatNumber(user.followers)} متابع</span>
                         <span>{formatNumber(user.coins)} عملة</span>
                      </div>
                   </div>
                 </div>
                 
                 <div className="flex gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => setVerifyingUser(user)}
                      disabled={!canManageUsers}
                      className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${canManageUsers ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                      <Icons.ShieldCheck size={18} /> مراجعة
                    </button>
                    <button 
                      onClick={() => {
                          if(confirm('رفض الطلب؟')) onRejectVerification(user.id);
                      }}
                      disabled={!canManageUsers}
                      className={`flex-1 md:flex-none border px-4 py-2 rounded-lg font-bold transition-all ${canManageUsers ? 'border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}
                    >
                      رفض
                    </button>
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full space-y-6 pb-20 md:pb-0">
      {editingUser && (
          <EditUserModal 
            user={editingUser} 
            currentUser={currentUser}
            onClose={() => setEditingUser(null)} 
            onSave={(updatedUser) => {
                onUpdateUser(updatedUser);
                setEditingUser(null);
            }} 
          />
      )}

      {verifyingUser && (
          <VerificationModal
            user={verifyingUser}
            onClose={() => setVerifyingUser(null)}
            onConfirm={(tier) => {
                onVerifyUser(verifyingUser.id, tier);
                setVerifyingUser(null);
            }}
          />
      )}

      {showAddUserModal && onAddUser && (
          <AddUserModal 
            onClose={() => setShowAddUserModal(false)}
            onAdd={(newUser) => onAddUser(newUser)}
          />
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">لوحة القيادة</h2>
           <p className="text-gray-500 text-sm">أهلاً، <span className="font-bold text-primary-500">{currentUser.name}</span>. إدارة النظام.</p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 gap-1 overflow-x-auto max-w-full">
           <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-black dark:bg-white text-white dark:text-black shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>نظرة عامة</button>
           
           {canManageUsers && (
               <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-black dark:bg-white text-white dark:text-black shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>الأعضاء</button>
           )}
           
           {canManageContent && (
               <button onClick={() => setActiveTab('posts')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'posts' ? 'bg-black dark:bg-white text-white dark:text-black shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>المنشورات</button>
           )}
           
           {canManageUsers && (
               <button onClick={() => setActiveTab('verification')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'verification' ? 'bg-black dark:bg-white text-white dark:text-black shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                  التوثيق {verificationRequests.length > 0 && <span className="mr-1 bg-red-500 text-white text-[9px] px-1.5 rounded-full">{verificationRequests.length}</span>}
               </button>
           )}
           
           {canManageSystem && (
               <>
                <button onClick={() => setActiveTab('bot')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1 ${activeTab === 'bot' ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                    <Icons.Zap size={14} /> التحكم بالبوتات
                </button>
                <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1 ${activeTab === 'settings' ? 'bg-black dark:bg-white text-white dark:text-black shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                    <Icons.Settings size={14} /> الإعدادات
                </button>
               </>
           )}
        </div>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'users' && canManageUsers && renderUsersList()}
      {activeTab === 'posts' && canManageContent && renderPostsList()}
      {activeTab === 'verification' && canManageUsers && renderVerification()}
      {activeTab === 'bot' && canManageSystem && renderBotControl()}
      {activeTab === 'settings' && canManageSystem && <MonetizationSettings />}
    </div>
  );
};