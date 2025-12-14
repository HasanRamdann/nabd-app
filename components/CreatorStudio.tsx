
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import * as Icons from './Icons';

const data = [
  { name: 'Mon', views: 4000, likes: 2400 },
  { name: 'Tue', views: 3000, likes: 1398 },
  { name: 'Wed', views: 2000, likes: 9800 },
  { name: 'Thu', views: 2780, likes: 3908 },
  { name: 'Fri', views: 1890, likes: 4800 },
  { name: 'Sat', views: 2390, likes: 3800 },
  { name: 'Sun', views: 3490, likes: 4300 },
];

const CreatorStudio: React.FC = () => {
    return (
        <div className="w-full pb-20 md:pb-0 animate-fadeIn space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Icons.BarChart2 className="text-purple-600" /> استوديو المبدعين
                </h2>
                <div className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 px-3 py-1 rounded-full font-bold">PRO BETA</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'إجمالي الوصول', val: '124.5K', icon: Icons.Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'التفاعل', val: '+18%', icon: Icons.Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'الأرباح', val: '4,200 🪙', icon: Icons.Gem, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                    { label: 'متابعين جدد', val: '890', icon: Icons.UserPlus, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                        <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-2`}>
                            <stat.icon size={20} />
                        </div>
                        <h3 className="font-black text-2xl text-gray-900 dark:text-white">{stat.val}</h3>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 h-[300px]">
                <h3 className="font-bold mb-4 text-gray-800 dark:text-white">تحليل الأداء الأسبوعي</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                        <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '10px', color: '#fff'}} />
                        <Area type="monotone" dataKey="views" stroke="#8884d8" fillOpacity={1} fill="url(#colorViews)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
                 <h3 className="font-bold mb-4 text-gray-800 dark:text-white">أحدث النشاطات</h3>
                 <div className="space-y-4">
                     {[1,2,3].map(i => (
                         <div key={i} className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800 pb-3 last:border-0">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                                     <Icons.Trend size={18} className="text-gray-500" />
                                 </div>
                                 <div>
                                     <h4 className="text-sm font-bold text-gray-900 dark:text-white">منشورك وصل إلى الترند</h4>
                                     <p className="text-xs text-gray-500">قبل ساعتين</p>
                                 </div>
                             </div>
                             <span className="text-green-500 text-xs font-bold">+1500 مشاهدة</span>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
};

export default CreatorStudio;
