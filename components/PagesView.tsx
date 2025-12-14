
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Page, User, Post, ReactionType } from '../types';
import * as Icons from './Icons';
import { formatNumber } from '../constants';
import { PostCard, LikesListModal, ShareModal, PostDetailModal } from './Feed';

interface PagesViewProps {
  pages: Page[];
  posts: Post[]; // Added posts prop
  onCreatePage: (page: Page) => void;
  currentUser: User;
  onPromotePage: (pageId: string, cost: number) => void;
  onLike: (postId: string, reaction: ReactionType | null) => void;
  onAddComment: (postId: string, text: string) => void;
  onUnlockPost: (post: Post) => void;
  onFollow: (userId: string) => void;
}

// Generate cumulative chart data to show constant growth
const generateChartData = (pageId: string, isPromoted?: boolean) => {
  const seed = pageId.charCodeAt(0) + pageId.charCodeAt(pageId.length - 1);
  const multiplier = isPromoted ? 3 : 1; 
  
  // Start with a base number derived from ID
  let currentTotal = 500 + (seed * 10); 

  const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  return days.map((day, i) => {
    // Generate a pseudo-random positive growth increment
    // Logic ensures numbers ONLY go up (Cumulative)
    const growth = Math.floor(((seed + i * 17) % 50 + 20) * multiplier);
    currentTotal += growth;
    
    return { name: day, value: currentTotal };
  });
};

const PageCard: React.FC<{ page: Page; isSelected: boolean; onClick: () => void; onView: () => void }> = ({ page, isSelected, onClick, onView }) => (
  <div 
    onClick={onClick}
    className={`p-4 rounded-xl border shadow-sm flex items-center justify-between group cursor-pointer transition-all duration-300 relative overflow-hidden ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 ring-1 ring-primary-500' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-primary-300'}`}
  >
    {page.isPromoted && (
        <div className="absolute top-0 left-0 bg-yellow-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg z-10">
            مروج
        </div>
    )}
    <div className="flex items-center gap-4 relative z-0">
      <div className={`w-12 h-12 rounded-full ${page.color} flex items-center justify-center text-white font-bold text-xl shadow-md relative`}>
         {page.name[0]}
         {page.isPromoted && (
             <span className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-0.5 border-2 border-white dark:border-slate-800">
                 <Icons.Zap size={10} fill="white" className="text-white" />
             </span>
         )}
      </div>
      <div>
         <h4 className={`font-bold transition-colors ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white group-hover:text-primary-500'}`}>{page.name}</h4>
         <p className="text-xs text-gray-500">{page.category}</p>
         <button onClick={(e) => { e.stopPropagation(); onView(); }} className="text-[10px] text-blue-500 hover:underline mt-1 font-bold">عرض الصفحة</button>
      </div>
    </div>
    <div className="text-left">
       <span className="block font-bold text-gray-800 dark:text-gray-200">{formatNumber(page.followers)}</span>
       <span className={`text-xs font-bold flex items-center gap-1 ${page.growth > 0 ? 'text-green-500' : 'text-gray-400'}`}>
          <Icons.Trend size={10} /> +{page.growth}%
       </span>
    </div>
  </div>
);

const PromoteModal: React.FC<{ page: Page; userCoins: number; onClose: () => void; onConfirm: (cost: number) => void }> = ({ page, userCoins, onClose, onConfirm }) => {
    const packages = [
        { id: 1, name: 'دفعة سريعة', duration: '24 ساعة', cost: 500, boost: '2x' },
        { id: 2, name: 'حملة أسبوعية', duration: '7 أيام', cost: 3000, boost: '5x' },
        { id: 3, name: 'سيطرة كاملة', duration: '30 يوم', cost: 10000, boost: '10x' },
    ];
    const [selectedPkg, setSelectedPkg] = useState(packages[0]);

    return (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-scaleIn border border-gray-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Icons.Zap className="text-yellow-500 fill-yellow-500" /> ترويج الصفحة
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"><Icons.X /></button>
                </div>

                <div className="mb-6 p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl text-white text-center">
                    <p className="opacity-90 text-sm mb-1">الصفحة المستهدفة</p>
                    <h2 className="text-2xl font-bold">{page.name}</h2>
                    <div className="mt-2 text-xs bg-white/20 inline-block px-3 py-1 rounded-full">
                        رصيدك الحالي: {formatNumber(userCoins)} 🪙
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    {packages.map(pkg => (
                        <div 
                            key={pkg.id}
                            onClick={() => setSelectedPkg(pkg)} 
                            className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all ${selectedPkg.id === pkg.id ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-100 dark:border-slate-700 hover:border-gray-300'}`}
                        >
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{pkg.name}</h4>
                                <p className="text-xs text-gray-500">{pkg.duration} • وصول مضاعف {pkg.boost}</p>
                            </div>
                            <div className="font-bold text-yellow-600 dark:text-yellow-400">
                                {formatNumber(pkg.cost)} 🪙
                            </div>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={() => onConfirm(selectedPkg.cost)}
                    disabled={userCoins < selectedPkg.cost}
                    className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-yellow-500 hover:bg-yellow-600"
                >
                    {userCoins < selectedPkg.cost ? 'رصيد غير كافي' : `تأكيد ودفع ${formatNumber(selectedPkg.cost)} عملة`}
                </button>
            </div>
        </div>
    );
};

const CreatePageModal: React.FC<{ onClose: () => void; onSubmit: (data: any) => void }> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('مجتمع');
  const [color, setColor] = useState('bg-blue-600');
  const [handle, setHandle] = useState('');

  const colors = [
    'bg-blue-600', 'bg-red-600', 'bg-green-600', 'bg-purple-600', 
    'bg-yellow-500', 'bg-pink-600', 'bg-slate-800', 'bg-indigo-600'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !handle) return;
    onSubmit({ name, handle: handle.startsWith('@') ? handle : `@${handle}`, category, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-scaleIn border border-gray-100 dark:border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Icons.PlusSquare className="text-primary-500" /> إنشاء صفحة جديدة
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"><Icons.X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">اسم الصفحة</label>
            <input 
              required
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="مثال: عشاق السفر" 
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">المعرف (Handle)</label>
            <input 
              required
              type="text" 
              value={handle} 
              onChange={e => setHandle(e.target.value)}
              placeholder="travel_lovers@" 
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none ltr" 
              dir="ltr"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">الفئة</label>
               <select 
                 value={category} 
                 onChange={e => setCategory(e.target.value)}
                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none"
               >
                 <option>مجتمع</option>
                 <option>تكنولوجيا</option>
                 <option>فن وتصميم</option>
                 <option>أعمال</option>
                 <option>ترفيه</option>
                 <option>تعليم</option>
               </select>
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">لون الشعار</label>
               <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
                  {colors.map(c => (
                    <button 
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full ${c} ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                    ></button>
                  ))}
               </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg mt-4">
             إطلاق الصفحة 🚀
          </button>
        </form>
      </div>
    </div>
  );
};

const PagesView: React.FC<PagesViewProps> = ({ 
    pages, 
    posts, 
    onCreatePage, 
    currentUser, 
    onPromotePage,
    onLike,
    onAddComment,
    onUnlockPost,
    onFollow
}) => {
  const [selectedPageId, setSelectedPageId] = useState<string>(pages[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [viewingPage, setViewingPage] = useState<Page | null>(null);

  // Modal states for Post interaction
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [activePostForLikes, setActivePostForLikes] = useState<Post | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activePostForShare, setActivePostForShare] = useState<Post | null>(null);
  const [viewPost, setViewPost] = useState<Post | null>(null);

  // Derive selected page data
  const selectedPage = pages.find(p => p.id === selectedPageId) || pages[0];
  const chartData = useMemo(() => selectedPage ? generateChartData(selectedPage.id, selectedPage.isPromoted) : [], [selectedPage?.id, selectedPage?.isPromoted]);

  const handleCreate = (data: any) => {
    const newPage: Page = {
      id: `pg_${Date.now()}`,
      name: data.name,
      handle: data.handle,
      category: data.category,
      color: data.color,
      followers: 0,
      growth: 0,
      description: 'صفحة جديدة'
    };
    onCreatePage(newPage);
    setSelectedPageId(newPage.id); // Auto select new page
  };

  const handlePromoteConfirm = (cost: number) => {
     if (selectedPage) {
         onPromotePage(selectedPage.id, cost);
         setShowPromoteModal(false);
     }
  };

  // Filter posts for viewingPage
  const pagePosts = viewingPage ? posts.filter(p => p.userId === viewingPage.id) : [];

  if (viewingPage) {
      return (
          <div className="w-full animate-slideUp pb-20 md:pb-0">
              {showLikesModal && activePostForLikes && (
                  <LikesListModal 
                    post={activePostForLikes}
                    currentUser={currentUser}
                    onClose={() => setShowLikesModal(false)} 
                    title="المتفاعلون"
                  />
              )}
              
              {showShareModal && activePostForShare && <ShareModal post={activePostForShare} onClose={() => setShowShareModal(false)} />}
              
              {viewPost && <PostDetailModal post={viewPost} onClose={() => setViewPost(null)} onAddComment={onAddComment} />}

              <div className="mb-4">
                  <button onClick={() => setViewingPage(null)} className="flex items-center gap-2 text-primary-600 font-bold hover:underline">
                      <Icons.ArrowLeft className="rtl:rotate-180" /> عودة للوحة التحكم
                  </button>
              </div>
              <div className={`w-full h-48 rounded-t-3xl ${viewingPage.color} relative overflow-hidden shadow-lg`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-6 right-6 flex items-end gap-4">
                      <div className="w-24 h-24 rounded-2xl bg-white shadow-xl flex items-center justify-center text-4xl font-bold text-gray-800">
                          {viewingPage.name[0]}
                      </div>
                      <div className="text-white mb-2">
                          <h1 className="text-3xl font-black">{viewingPage.name}</h1>
                          <p className="opacity-90 dir-ltr text-right">{viewingPage.handle}</p>
                      </div>
                  </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-8 rounded-b-3xl shadow-sm mb-6 border border-gray-100 dark:border-slate-700">
                  <div className="flex justify-between">
                      <div className="flex gap-6">
                          <div>
                              <span className="block font-black text-2xl dark:text-white">{formatNumber(viewingPage.followers)}</span>
                              <span className="text-xs text-gray-500 uppercase font-bold">متابع</span>
                          </div>
                          <div>
                              <span className="block font-black text-2xl text-green-500">+{viewingPage.growth}%</span>
                              <span className="text-xs text-gray-500 uppercase font-bold">نمو</span>
                          </div>
                      </div>
                      <button className="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-colors">متابعة</button>
                  </div>
                  <p className="mt-6 text-gray-600 dark:text-gray-300">{viewingPage.description || 'لا يوجد وصف للصفحة حالياً.'}</p>
              </div>

              {/* Posts Section */}
              <div className="space-y-6">
                  <h3 className="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2">
                      <Icons.Layout className="text-primary-500" /> المنشورات
                  </h3>
                  
                  {pagePosts.length === 0 ? (
                      <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
                          <Icons.Layout size={48} className="mx-auto mb-2 opacity-30" />
                          <p>لا توجد منشورات بعد</p>
                      </div>
                  ) : (
                      pagePosts.map(post => (
                          <PostCard 
                            key={post.id} 
                            post={post} 
                            currentUser={currentUser}
                            onAddComment={onAddComment} 
                            onSupport={() => {}} // Could implement if needed
                            onView={() => setViewPost(post)}
                            onShowLikes={() => {
                                setActivePostForLikes(post);
                                setShowLikesModal(true);
                            }}
                            onUnlock={() => onUnlockPost(post)}
                            onShare={() => {
                                setActivePostForShare(post);
                                setShowShareModal(true);
                            }}
                            isMenuOpen={activeMenuPostId === post.id}
                            onToggleMenu={() => setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)}
                            onMenuAction={(action) => {
                                if(action === 'hide') alert('تم إخفاء المنشور');
                                setActiveMenuPostId(null);
                            }}
                            onLike={onLike}
                            onFollow={onFollow}
                          />
                      ))
                  )}
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-fadeIn relative">
       {showCreateModal && <CreatePageModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreate} />}
       {showPromoteModal && selectedPage && <PromoteModal page={selectedPage} userCoins={currentUser.coins} onClose={() => setShowPromoteModal(false)} onConfirm={handlePromoteConfirm} />}

       {/* Hero Section */}
       <div className={`rounded-3xl p-8 text-white relative overflow-hidden shadow-xl transition-all duration-500 ${selectedPage ? selectedPage.color : 'bg-primary-600'}`}>
          {selectedPage?.isPromoted && (
             <div className="absolute top-0 right-0 p-3 bg-white/20 backdrop-blur-md rounded-bl-2xl">
                 <span className="flex items-center gap-1 font-bold text-yellow-300"><Icons.Zap fill="currentColor" size={16}/> مروج لها</span>
             </div>
          )}
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
             <div>
                <div className="flex items-center gap-2 mb-2 opacity-80 text-sm font-bold uppercase tracking-wider">
                   <Icons.BarChart2 size={16} /> مركز النمو
                </div>
                <h2 className="text-4xl font-black mb-1 flex items-center gap-2">
                    {selectedPage?.name || 'صفحاتك'}
                    {selectedPage?.isPromoted && <Icons.CheckCheck className="text-white" size={24} />}
                </h2>
                <p className="opacity-90 text-lg font-mono ltr">{selectedPage?.handle}</p>
             </div>
             <div className="flex gap-3">
                <button 
                    onClick={() => setViewingPage(selectedPage)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-5 py-2 rounded-xl font-bold transition-colors flex items-center gap-2"
                >
                   <Icons.Layout size={18} /> عرض
                </button>
                <button 
                    onClick={() => setShowPromoteModal(true)}
                    className="bg-white text-gray-900 px-5 py-2 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2 hover:scale-105 transform duration-200"
                >
                   <Icons.Zap size={18} className="text-yellow-500 fill-yellow-500" /> ترويج
                </button>
             </div>
          </div>
          {/* Decorative BG Icon */}
          <Icons.Activity className="absolute -bottom-6 -left-6 text-white opacity-10 w-48 h-48 rotate-12" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Section */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col h-[400px]">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-lg flex items-center gap-2 text-gray-800 dark:text-white">
                 <Icons.Trend className="text-green-500" /> نمو المتابعين (تراكمي)
               </h3>
               <div className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-lg">آخر 7 أيام</div>
             </div>
             
             {selectedPage ? (
               <div className="flex-1 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData}>
                     <defs>
                       <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="currentColor" className={selectedPage.isPromoted ? 'text-yellow-500' : 'text-primary-500'} stopOpacity={0.8}/>
                         <stop offset="95%" stopColor="currentColor" className={selectedPage.isPromoted ? 'text-yellow-500' : 'text-primary-500'} stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415550" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                     <Tooltip 
                        contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} 
                        itemStyle={{color: '#fff'}}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={selectedPage.isPromoted ? '#eab308' : '#8b5cf6'} 
                        fillOpacity={1} 
                        fill="url(#colorGrowth)" 
                        strokeWidth={4} 
                        animationDuration={1500}
                     />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
             ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">لا توجد بيانات</div>
             )}
          </div>

          {/* List & Create Section */}
          <div className="flex flex-col h-[400px]">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">إدارة الصفحات</h3>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="text-primary-600 hover:text-primary-700 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
                >
                  <Icons.PlusSquare size={16} /> إنشاء صفحة
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                {pages.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
                      <Icons.Layout size={40} className="mb-2 opacity-30" />
                      <p>ليس لديك صفحات بعد</p>
                      <button onClick={() => setShowCreateModal(true)} className="text-primary-500 font-bold mt-2">أنشئ أول صفحة</button>
                   </div>
                ) : (
                   pages.map(page => (
                      <PageCard 
                        key={page.id} 
                        page={page} 
                        isSelected={selectedPageId === page.id} 
                        onClick={() => setSelectedPageId(page.id)}
                        onView={() => setViewingPage(page)}
                      />
                   ))
                )}
             </div>

             {/* Quick Tip */}
             <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/20 flex gap-3 items-start">
                <Icons.Zap className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" size={18} />
                <div>
                   <h5 className="font-bold text-sm text-yellow-800 dark:text-yellow-300">زيادة الوصول</h5>
                   <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                      قم بترويج صفحتك الآن لمضاعفة عدد المتابعين المحتملين وزيادة التفاعل.
                   </p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default PagesView;