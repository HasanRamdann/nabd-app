
import React from 'react';
import { AudioRoom, User } from '../types';
import * as Icons from './Icons';
import { MOCK_AUDIO_ROOMS } from '../constants';

const MajlisView: React.FC = () => {
    return (
        <div className="w-full pb-20 md:pb-0 animate-fadeIn space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">المجلس الصوتي 🎙️</h2>
                    <p className="text-gray-500 text-sm">نقاشات حية ومواضيع ساخنة الآن</p>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2">
                    <Icons.PlusSquare size={18} /> إنشاء مجلس
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {MOCK_AUDIO_ROOMS.map(room => (
                    <div key={room.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-green-500/30 transition-all cursor-pointer">
                        {room.isLive && (
                            <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                <span className="w-1.5 h-1.5 bg-white rounded-full"></span> مباشر
                            </div>
                        )}
                        
                        <div className="flex items-start gap-4 mb-4">
                            <div className="relative">
                                <img src={room.host.avatar} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                                <div className="absolute -bottom-2 -right-2 bg-gray-900 text-white p-1 rounded-lg">
                                    <Icons.Mic size={12} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-1">{room.title}</h3>
                                <div className="flex gap-2 text-xs font-bold text-gray-500">
                                    <span className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-md">{room.category}</span>
                                    <span className="flex items-center gap-1 text-green-500"><Icons.Users size={12} /> {room.listeners} مستمع</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                            <div className="flex -space-x-2 rtl:space-x-reverse">
                                {room.speakers.map((s, i) => (
                                    <img key={i} src={s.avatar} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800" alt="" />
                                ))}
                            </div>
                            <span className="text-xs text-gray-400 font-medium">+ {room.speakers.length} متحدثين</span>
                            
                            <button className="mr-auto bg-gray-100 dark:bg-slate-700 hover:bg-green-600 hover:text-white text-gray-700 dark:text-gray-300 px-6 py-2 rounded-xl font-bold transition-colors">
                                استماع
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MajlisView;
