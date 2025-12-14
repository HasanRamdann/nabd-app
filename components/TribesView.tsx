
import React from 'react';
import { Tribe, User } from '../types';
import * as Icons from './Icons';
import { MOCK_TRIBES } from '../constants';
import { formatNumber } from '../constants';

interface TribesViewProps {
    currentUser: User;
    onJoinTribe: (tribeId: string) => void;
}

const TribesView: React.FC<TribesViewProps> = ({ currentUser, onJoinTribe }) => {
    return (
        <div className="w-full pb-20 md:pb-0 animate-fadeIn space-y-6">
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-600 rounded-full blur-[100px] opacity-50"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-2">
                        <Icons.Flag className="text-orange-500" /> القبائل
                    </h1>
                    <p className="text-gray-300 max-w-md">انضم إلى مجتمع يناسب اهتماماتك، تنافس مع القبائل الأخرى، وسيطر على الصدارة!</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_TRIBES.map((tribe, index) => (
                    <div key={tribe.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${tribe.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform`}></div>
                        
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className={`w-16 h-16 rounded-2xl ${tribe.color} flex items-center justify-center text-3xl shadow-lg`}>
                                {tribe.logo}
                            </div>
                            <div className="text-center bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-lg">
                                <span className="block font-black text-xl text-gray-900 dark:text-white">#{tribe.rank}</span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase">الترتيب</span>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{tribe.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 h-10">{tribe.description}</p>

                        <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-700 pt-4">
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 dark:text-white">{formatNumber(tribe.membersCount)}</span>
                                <span className="text-xs text-gray-500">عضو</span>
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-bold text-primary-500">{formatNumber(tribe.totalXp)}</span>
                                <span className="text-xs text-gray-500">XP إجمالي</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => onJoinTribe(tribe.id)}
                            className={`w-full mt-4 py-3 rounded-xl font-bold transition-colors ${currentUser.tribeId === tribe.id ? 'bg-gray-100 dark:bg-slate-700 text-gray-500 cursor-default' : 'bg-primary-600 hover:bg-primary-700 text-white'}`}
                        >
                            {currentUser.tribeId === tribe.id ? 'أنت عضو هنا' : 'انضمام للقبيلة'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TribesView;
