
import React, { useState } from 'react';
import { Post, User } from '../types';
import * as Icons from './Icons';

interface ExploreViewProps {
  posts: Post[];
  users: User[];
  onAddComment: (postId: string, text: string, parentId?: string) => void;
  onViewProfile?: (user: User) => void;
}

const ExploreView: React.FC<ExploreViewProps> = ({ posts, users, onAddComment, onViewProfile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'users'>('users');

  // Filter Logic
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPosts = posts.filter(p => 
    p.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 pb-20 md:pb-0 animate-fadeIn">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 -mx-4 md:mx-0 md:rounded-2xl border-b border-gray-100 dark:border-slate-800 shadow-sm">
         <div className="relative mb-4">
             <Icons.Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
             <input 
               type="text" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="ابحث عن أشخاص، منشورات، أو هاشتاق..." 
               className="w-full bg-gray-100 dark:bg-slate-800 rounded-2xl py-3 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
             />
         </div>
         
         <div className="flex gap-2">
            <button 
               onClick={() => setActiveTab('users')}
               className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'users' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300'}`}
            >
               الأشخاص ({filteredUsers.length})
            </button>
            <button 
               onClick={() => setActiveTab('posts')}
               className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'posts' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300'}`}
            >
               المنشورات ({filteredPosts.length})
            </button>
         </div>
      </div>

      {/* Results */}
      {activeTab === 'users' && (
         <div className="space-y-4">
            {filteredUsers.map(user => (
               <div key={user.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => onViewProfile && onViewProfile(user)}>
                  <div className="flex items-center gap-3">
                     <img src={user.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
                     <div>
                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                           {user.name}
                           {user.isVerified && <Icons.ShieldCheck size={14} className="text-blue-500" />}
                        </h4>
                        <span className="text-xs text-gray-500 block">{user.username}@</span>
                        <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 max-w-[200px]">{user.bio}</p>
                     </div>
                  </div>
                  <button className="bg-gray-100 dark:bg-slate-700 hover:bg-primary-500 hover:text-white text-gray-700 dark:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors">
                     ملف الشخصي
                  </button>
               </div>
            ))}
            {filteredUsers.length === 0 && (
               <div className="text-center py-10 text-gray-400">
                  <Icons.Search size={40} className="mx-auto mb-2 opacity-50" />
                  <p>لم يتم العثور على مستخدمين</p>
               </div>
            )}
         </div>
      )}

      {activeTab === 'posts' && (
         <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {filteredPosts.map(post => (
               <div key={post.id} className="aspect-square bg-gray-100 dark:bg-slate-800 rounded-xl overflow-hidden relative group cursor-pointer border border-gray-200 dark:border-slate-700">
                  {post.image ? (
                     <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  ) : post.video ? (
                     <video src={post.video} className="w-full h-full object-cover" />
                  ) : (
                     <div className="p-4 h-full flex items-center justify-center text-center text-xs font-bold text-gray-600 dark:text-gray-300">
                        {post.content.slice(0, 100)}...
                     </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold backdrop-blur-sm">
                     <span className="flex items-center gap-1"><Icons.Heart size={16} /> {post.likes}</span>
                  </div>
               </div>
            ))}
            {filteredPosts.length === 0 && (
               <div className="col-span-full text-center py-10 text-gray-400">
                  <Icons.ImageIcon size={40} className="mx-auto mb-2 opacity-50" />
                  <p>لم يتم العثور على منشورات</p>
               </div>
            )}
         </div>
      )}
    </div>
  );
};

export default ExploreView;
