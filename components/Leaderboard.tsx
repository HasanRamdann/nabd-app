
import React from 'react';
import { User } from '../types';
import * as Icons from './Icons';
import { formatNumber } from '../constants';

interface LeaderboardProps {
  users: User[];
  currentUser: User;
  onViewProfile?: (user: User) => void;
}

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1) return <Icons.Crown size={24} className="text-yellow-500 fill-yellow-500 animate-bounce" />;
  if (rank === 2) return <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-700 text-xs shadow-md">2</div>;
  if (rank === 3) return <div className="w-6 h-6 rounded-full bg-orange-300 flex items-center justify-center font-bold text-orange-800 text-xs shadow-md">3</div>;
  return <span className="font-bold text-gray-400 text-sm">#{rank}</span>;
};

const Leaderboard: React.FC<LeaderboardProps> = ({ users, currentUser, onViewProfile }) => {
  // Sort users by XP (highest first)
  const sortedUsers = [...users].sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const topThree = sortedUsers.slice(0, 3);
  const restUsers = sortedUsers.slice(3, 10); // Show up to top 10

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-purple-500 rounded-full blur-[80px] opacity-50"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
            <h1 className="text-4xl font-black mb-2 flex items-center gap-2">
                <Icons.Flame className="text-orange-500 fill-orange-500" size={36} />
                ساحة الأبطال
            </h1>
            <p className="text-indigo-200 text-sm max-w-md">تنافس مع صناع المحتوى، اجمع النقاط، وتصدر القائمة لتحصل على مكافآت حصرية!</p>
            
            <div className="mt-6 flex gap-4 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10">
                <div className="px-4 py-2 text-center border-l border-white/10">
                    <span className="block font-bold text-xl text-yellow-400">{formatNumber(currentUser.coins)}</span>
                    <span className="text-[10px] text-gray-300 uppercase">عملاتك</span>
                </div>
                <div className="px-4 py-2 text-center">
                    <span className="block font-bold text-xl text-green-400">{formatNumber(currentUser.xp)}</span>
                    <span className="text-[10px] text-gray-300 uppercase">نقاط XP</span>
                </div>
                <div className="px-4 py-2 text-center border-r border-white/10">
                    <span className="block font-bold text-xl text-blue-400">#{sortedUsers.findIndex(u => u.id === currentUser.id) + 1}</span>
                    <span className="text-[10px] text-gray-300 uppercase">ترتيبك</span>
                </div>
            </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 items-end mt-8 mb-8 px-2">
         {/* 2nd Place */}
         <div className="flex flex-col items-center cursor-pointer" onClick={() => onViewProfile && onViewProfile(topThree[1])}>
            <div className="relative mb-2">
                <img src={topThree[1].avatar} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-gray-300 object-cover shadow-lg" alt="" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-800 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">2</div>
            </div>
            <h3 className="font-bold text-sm text-gray-800 dark:text-white truncate max-w-full">{topThree[1].name}</h3>
            <span className="text-xs text-primary-500 font-bold">{formatNumber(topThree[1].xp)} XP</span>
            <div className="w-full h-24 bg-gradient-to-t from-gray-200 to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-t-2xl mt-2"></div>
         </div>

         {/* 1st Place */}
         <div className="flex flex-col items-center relative -top-4 cursor-pointer" onClick={() => onViewProfile && onViewProfile(topThree[0])}>
            <Icons.Crown className="text-yellow-500 fill-yellow-500 mb-1 animate-float" size={32} />
            <div className="relative mb-2">
                <img src={topThree[0].avatar} className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-yellow-400 object-cover shadow-xl ring-4 ring-yellow-400/30" alt="" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">1</div>
            </div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white truncate max-w-full">{topThree[0].name}</h3>
            <span className="text-xs text-primary-500 font-bold">{formatNumber(topThree[0].xp)} XP</span>
            <div className="w-full h-32 bg-gradient-to-t from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-slate-900 rounded-t-2xl mt-2 border-t-4 border-yellow-400"></div>
         </div>

         {/* 3rd Place */}
         <div className="flex flex-col items-center cursor-pointer" onClick={() => onViewProfile && onViewProfile(topThree[2])}>
            <div className="relative mb-2">
                <img src={topThree[2].avatar} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-orange-300 object-cover shadow-lg" alt="" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-300 text-orange-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">3</div>
            </div>
            <h3 className="font-bold text-sm text-gray-800 dark:text-white truncate max-w-full">{topThree[2].name}</h3>
            <span className="text-xs text-primary-500 font-bold">{formatNumber(topThree[2].xp)} XP</span>
            <div className="w-full h-20 bg-gradient-to-t from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-slate-900 rounded-t-2xl mt-2"></div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* The List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 dark:text-white">باقي المتصدرين</h3>
                <span className="text-xs text-gray-500">يتحدث كل ساعة</span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {restUsers.map((user, idx) => (
                    <div key={user.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer" onClick={() => onViewProfile && onViewProfile(user)}>
                        <span className="font-mono font-bold text-gray-400 w-6 text-center">{idx + 4}</span>
                        <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1">
                                {user.name}
                                {user.isVerified && <Icons.ShieldCheck size={12} className="text-blue-500" />}
                            </h4>
                            <span className="text-[10px] text-gray-500">{user.username}@</span>
                        </div>
                        <div className="text-right">
                            <span className="block font-bold text-primary-600 dark:text-primary-400 text-sm">{formatNumber(user.xp)} XP</span>
                            <span className="text-[10px] text-gray-400">Level {user.level}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Daily Quests */}
        <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold flex items-center gap-2">
                        <Icons.Target className="text-red-500" />
                        مهام يومية
                    </h3>
                    <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full">تجدد بعد 12س</span>
                </div>
                
                <div className="space-y-3">
                    {[
                        { title: 'انشر منشور جديد', progress: 1, total: 1, reward: 50, done: true },
                        { title: 'علق على 5 منشورات', progress: 3, total: 5, reward: 30, done: false },
                        { title: 'شارك القصة', progress: 0, total: 1, reward: 20, done: false }
                    ].map((quest, i) => (
                        <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
                            <div className="flex justify-between text-sm mb-2">
                                <span className={quest.done ? 'line-through opacity-50' : ''}>{quest.title}</span>
                                <span className="font-bold text-yellow-400 flex items-center gap-1">
                                    +{quest.reward} <Icons.Gem size={10} />
                                </span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${quest.done ? 'bg-green-500' : 'bg-primary-500'}`} style={{ width: `${(quest.progress / quest.total) * 100}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <button className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors">
                    عرض كل المهام
                </button>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-2xl p-5">
                <h3 className="font-bold text-yellow-800 dark:text-yellow-500 mb-2 flex items-center gap-2">
                    <Icons.Gem /> متجر الجوائز
                </h3>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-3">استبدل عملاتك بمميزات حصرية وتوثيق للحساب.</p>
                <button className="text-xs font-bold bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 w-full">
                    زيارة المتجر
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
