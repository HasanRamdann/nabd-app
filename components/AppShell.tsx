
import React from 'react';
import { ViewState, User } from '../types';
import * as Icons from './Icons';
import { formatNumber } from '../constants';

interface AppShellProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isDark: boolean;
  toggleTheme: () => void;
  currentUser: User;
  unreadNotifications?: number; 
  onLogout?: () => void;
}

const AppShell: React.FC<AppShellProps> = ({ children, currentView, onChangeView, isDark, toggleTheme, currentUser, unreadNotifications = 0, onLogout }) => {
  
  const NavItem = ({ view, icon: Icon, label, alert }: { view: ViewState, icon: any, label: string, alert?: number }) => (
    <button
      onClick={() => onChangeView(view)}
      className={`relative flex flex-col items-center justify-center p-2 min-w-[64px] rounded-2xl transition-all duration-300 ease-out ${
        currentView === view 
          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 scale-105' 
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95'
      }`}
    >
      <div className="relative">
          <Icon size={24} strokeWidth={currentView === view ? 2.5 : 2} className={`transition-transform duration-300 ${currentView === view ? '-translate-y-1' : ''}`} />
          {alert && alert > 0 ? (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm animate-pulse">
                  {alert > 9 ? '9+' : alert}
              </span>
          ) : null}
      </div>
      <span className={`text-[9px] mt-1 font-bold transition-opacity duration-300 ${currentView === view ? 'opacity-100 text-primary-600 dark:text-primary-400' : 'opacity-0 hidden'}`}>{label}</span>
      {currentView === view && (
        <span className="absolute bottom-1 w-1 h-1 bg-primary-500 rounded-full animate-scaleIn"></span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full glass border-b border-gray-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onChangeView('feed')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/20 transform hover:rotate-12 transition-transform duration-300">
              ن
            </div>
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-600 tracking-tight">
              نبض
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
             {/* Gamification Badge */}
            <div onClick={() => onChangeView('store')} className="hidden sm:flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-900/40 transition-colors">
                 <Icons.Gem size={14} />
                 <span>{formatNumber(currentUser.coins)}</span>
            </div>

            <button 
              onClick={() => onChangeView('notifications')}
              className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <Icons.Bell size={22} />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse"></span>
              )}
            </button>
            
            <button 
              onClick={() => onChangeView('chat')}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors hidden sm:block"
            >
              <Icons.MessageCircle size={22} />
            </button>

            <button 
               onClick={toggleTheme}
               className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
               {isDark ? <Icons.Sun size={22} /> : <Icons.Moon size={22} />}
            </button>

            <div onClick={() => onChangeView('profile')} className="ml-1 cursor-pointer relative group">
                <div className={`absolute -inset-0.5 rounded-full blur opacity-50 transition duration-200 ${currentUser.isVerified ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                <img src={currentUser.avatar} alt="Profile" className="relative w-9 h-9 rounded-full object-cover border-2 border-white dark:border-slate-800" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 pb-24 md:pb-6 relative z-0">
         {children}
      </main>

      {/* Bottom Navigation (Super App Style - Scrollable) */}
      <nav className="fixed bottom-0 w-full z-50 glass border-t border-gray-200 dark:border-slate-800 md:hidden safe-area-bottom">
        <div className="flex items-center justify-between px-2 py-2 overflow-x-auto no-scrollbar gap-1">
          <NavItem view="feed" icon={Icons.Home} label="الرئيسية" />
          <NavItem view="explore" icon={Icons.Search} label="استكشاف" />
          <NavItem view="create" icon={Icons.PlusSquare} label="نشر" />
          {/* Added Store here explicitly for visibility */}
          <NavItem view="store" icon={Icons.ShoppingBag} label="المتجر" /> 
          <NavItem view="tribes" icon={Icons.Flag} label="القبائل" />
          
          {/* Admin Dashboard Button for Mobile */}
          {currentUser.role === 'admin' && <NavItem view="admin" icon={Icons.Settings} label="إدارة" />}
          
          <NavItem view="profile" icon={Icons.User} label="حسابي" />
        </div>
      </nav>

      {/* Desktop Sidebar (Optional enhancement for large screens) */}
      <nav className="hidden md:flex fixed right-0 top-16 bottom-0 w-20 flex-col items-center py-6 border-l border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-30 overflow-y-auto no-scrollbar gap-4">
          <NavItem view="feed" icon={Icons.Home} label="الرئيسية" />
          <NavItem view="explore" icon={Icons.Search} label="استكشاف" />
          <NavItem view="video" icon={Icons.Video} label="فيديو" />
          <NavItem view="create" icon={Icons.PlusSquare} label="نشر" />
          <div className="w-8 h-px bg-gray-200 dark:bg-slate-700 my-2"></div>
          <NavItem view="tribes" icon={Icons.Flag} label="القبائل" />
          <NavItem view="majlis" icon={Icons.Mic} label="المجلس" />
          <NavItem view="map" icon={Icons.MapPin} label="الخريطة" />
          <NavItem view="pages" icon={Icons.Layout} label="صفحات" />
          <div className="w-8 h-px bg-gray-200 dark:bg-slate-700 my-2"></div>
          <NavItem view="leaderboard" icon={Icons.Trophy} label="الأبطال" />
          <NavItem view="store" icon={Icons.ShoppingBag} label="المتجر" />
          <NavItem view="studio" icon={Icons.BarChart2} label="استوديو" />
          {currentUser.role === 'admin' && <NavItem view="admin" icon={Icons.Settings} label="إدارة" />}
          
          <div className="mt-auto">
             <button 
               onClick={onLogout}
               className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors"
               title="تسجيل الخروج"
             >
                <Icons.LogOut size={24} />
             </button>
          </div>
      </nav>
    </div>
  );
};

export default AppShell;
