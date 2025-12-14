
import React from 'react';
import { Notification } from '../types';
import * as Icons from './Icons';

interface NotificationsViewProps {
    notifications: Notification[];
    onMarkRead: () => void;
    onFollow?: (userId: string) => void; // Added onFollow prop
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications, onMarkRead, onFollow }) => {
    
    const getIcon = (type: string) => {
        switch(type) {
            case 'like': return <Icons.Heart className="text-white fill-current" size={14} />;
            case 'comment': return <Icons.MessageCircle className="text-white fill-current" size={14} />;
            case 'follow': return <Icons.UserPlus className="text-white" size={14} />;
            case 'verify': return <Icons.ShieldCheck className="text-white" size={14} />;
            case 'gift': return <Icons.Gem className="text-white" size={14} />;
            default: return <Icons.Bell className="text-white" size={14} />;
        }
    };

    const getBgColor = (type: string) => {
        switch(type) {
            case 'like': return 'bg-red-500';
            case 'comment': return 'bg-blue-500';
            case 'follow': return 'bg-green-500';
            case 'verify': return 'bg-blue-600';
            case 'gift': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto pb-20 md:pb-0 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between mb-4 px-2 pt-4">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Icons.Bell className="text-primary-500" />
                    الإشعارات
                </h2>
                {notifications.some(n => !n.isRead) && (
                    <button onClick={onMarkRead} className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 dark:bg-slate-800 px-4 py-2 rounded-xl transition-colors shadow-sm">
                        تحديد الكل كمقروء
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center border border-gray-100 dark:border-slate-700 shadow-sm mt-10">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icons.BellOff size={40} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">لا توجد إشعارات جديدة</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">سوف نبلغك عند وجود أي تفاعل جديد.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800">
                    {notifications.map((notif) => (
                        <div 
                            key={notif.id} 
                            className={`p-4 border-b border-gray-50 dark:border-slate-800 flex gap-4 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50 ${!notif.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                        >
                            <div className="relative shrink-0">
                                <img src={notif.sender.avatar} className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-slate-700" alt="" />
                                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${getBgColor(notif.type)}`}>
                                    {getIcon(notif.type)}
                                </div>
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                        {notif.sender.name}
                                        <span className="font-normal text-gray-600 dark:text-gray-400 mx-1 text-xs">
                                            {notif.type === 'like' && 'أعجب بمنشورك:'}
                                            {notif.type === 'comment' && 'علق على منشورك:'}
                                            {notif.type === 'follow' && 'بدأ بمتابعتك'}
                                            {notif.type === 'gift' && 'أرسل لك هدية 🎁'}
                                            {notif.type === 'verify' && 'تم توثيق حسابك بنجاح'}
                                            {notif.type === 'system' && 'إشعار من النظام'}
                                        </span>
                                    </h4>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{notif.timestamp}</span>
                                </div>
                                
                                {notif.text && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 bg-gray-50 dark:bg-slate-800 p-2 rounded-lg inline-block max-w-full">
                                        "{notif.text}"
                                    </p>
                                )}
                                
                                {notif.type === 'follow' && onFollow && (
                                    <button 
                                        onClick={() => onFollow(notif.sender.id)}
                                        className="mt-2 text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary-700 transition-colors"
                                    >
                                        رد المتابعة
                                    </button>
                                )}
                            </div>
                            
                            {!notif.isRead && (
                                <div className="self-center">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full ring-2 ring-white dark:ring-slate-900"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsView;
