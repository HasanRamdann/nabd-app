
import React, { useState, useRef, useEffect } from 'react';
import { Post, User, ReactionType } from '../types';
import * as Icons from './Icons';
import { PostCard, LikesListModal, ShareModal } from './Feed'; 
import { formatNumber, REALISTIC_USERS } from '../constants';
import { db } from '../services/storage'; // Import DB to get settings

interface ProfileProps {
  posts: Post[];
  user: User; // The user profile being viewed
  currentUser: User; // The currently logged-in user
  onRequestVerify?: () => void;
  onUpdateUser?: (user: User) => void;
  onBack?: () => void;
  onLogout?: () => void;
  onFollow?: (userId: string) => void;
  onLike?: (postId: string, reaction: ReactionType | null) => void;
}

// --- Verification Plan Modal ---
const VerificationPlanModal: React.FC<{ onClose: () => void; onConfirm: () => void }> = ({ onClose, onConfirm }) => {
    const settings = db.getSystemSettings();
    const [selectedPlan, setSelectedPlan] = useState<'blue' | 'gold'>('blue');

    return (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-scaleIn border border-gray-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[50px]"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-[50px]"></div>
                    
                    <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                        <Icons.X size={20} />
                    </button>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md shadow-lg border border-white/10">
                            <Icons.ShieldCheck size={32} className="text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-black mb-2">كن مميزاً، كن موثقاً</h2>
                        <p className="text-slate-300 text-sm max-w-xs">{settings.verificationDescription}</p>
                    </div>
                </div>

                {/* Plans */}
                <div className="p-6 space-y-4">
                    {/* Blue Plan */}
                    <div 
                        onClick={() => setSelectedPlan('blue')}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${selectedPlan === 'blue' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-slate-700 hover:border-blue-300'}`}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                <Icons.ShieldCheck className="text-blue-500" /> الباقة القياسية
                            </h3>
                            <div className="text-right">
                                <span className="block font-black text-lg text-blue-600">{formatNumber(settings.blueTickPrice)} 🪙</span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase">/ شهرياً</span>
                            </div>
                        </div>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                            <li>شارة التوثيق الزرقاء بجوار اسمك</li>
                            <li>أولوية الظهور في التعليقات</li>
                            <li>دعم فني مباشر</li>
                        </ul>
                        {selectedPlan === 'blue' && (
                            <div className="absolute top-4 left-4 text-blue-500"><Icons.CheckCircle size={24} /></div>
                        )}
                    </div>

                    {/* Gold Plan */}
                    <div 
                        onClick={() => setSelectedPlan('gold')}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${selectedPlan === 'gold' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' : 'border-gray-200 dark:border-slate-700 hover:border-yellow-300'}`}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                <Icons.Crown className="text-yellow-500" /> باقة VIP
                            </h3>
                            <div className="text-right">
                                <span className="block font-black text-lg text-yellow-600">{formatNumber(settings.goldTickPrice)} 🪙</span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase">/ شهرياً</span>
                            </div>
                        </div>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                            <li>شارة التوثيق الذهبية الفاخرة</li>
                            <li>وصول أعلى للمنشورات (Boost تلقائي)</li>
                            <li>ميزات حصرية للمشاهير</li>
                        </ul>
                        {selectedPlan === 'gold' && (
                            <div className="absolute top-4 left-4 text-yellow-500"><Icons.CheckCircle size={24} /></div>
                        )}
                    </div>

                    <button 
                        onClick={onConfirm}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 mt-4 ${selectedPlan === 'gold' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-primary-600 hover:bg-primary-700'}`}
                    >
                        اشترك الآن <Icons.ArrowLeft className="rtl:rotate-180" size={18} />
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-2">سيتم خصم المبلغ من محفظتك وإرسال الطلب للمراجعة.</p>
                </div>
            </div>
        </div>
    );
};

// --- Settings Modal ---
const SettingsModal: React.FC<{ onClose: () => void; onLogout?: () => void }> = ({ onClose, onLogout }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scaleIn border border-gray-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                        <Icons.Settings className="text-gray-500" /> الإعدادات
                    </h3>
                    <button onClick={onClose}><Icons.X size={20} /></button>
                </div>
                
                <div className="space-y-2">
                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                        <div className="flex items-center gap-3">
                            <Icons.Bell size={20} className="text-blue-500" />
                            <span className="font-bold text-sm text-gray-700 dark:text-gray-200">الإشعارات</span>
                        </div>
                        <Icons.ArrowLeft size={16} className="text-gray-400 rtl:rotate-180" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                        <div className="flex items-center gap-3">
                            <Icons.Lock size={20} className="text-green-500" />
                            <span className="font-bold text-sm text-gray-700 dark:text-gray-200">الخصوصية والأمان</span>
                        </div>
                        <Icons.ArrowLeft size={16} className="text-gray-400 rtl:rotate-180" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                        <div className="flex items-center gap-3">
                            <Icons.Globe size={20} className="text-purple-500" />
                            <span className="font-bold text-sm text-gray-700 dark:text-gray-200">اللغة (Language)</span>
                        </div>
                        <span className="text-xs font-bold text-gray-400">العربية</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                        <div className="flex items-center gap-3">
                            <Icons.Info size={20} className="text-gray-500" />
                            <span className="font-bold text-sm text-gray-700 dark:text-gray-200">عن التطبيق</span>
                        </div>
                        <Icons.ArrowLeft size={16} className="text-gray-400 rtl:rotate-180" />
                    </button>
                    
                    <button 
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 p-4 mt-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <Icons.LogOut size={18} /> تسجيل الخروج
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Edit Profile Modal ---
const EditProfileModal: React.FC<{ user: User; onClose: () => void; onSave: (u: User) => void }> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({ ...user, name, bio, avatar });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-lg dark:text-white">تعديل الملف الشخصي</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"><Icons.X size={20} /></button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Avatar Edit */}
          <div className="flex flex-col items-center gap-3">
             <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img src={avatar} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-lg group-hover:brightness-75 transition-all" alt="" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Icons.Camera className="text-white drop-shadow-md" size={24} />
                </div>
             </div>
             <button onClick={() => fileInputRef.current?.click()} className="text-primary-600 text-sm font-bold">تغيير الصورة</button>
             <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="space-y-4">
             <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">الاسم</label>
               <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500" />
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">النبذة (Bio)</label>
               <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500" />
             </div>
          </div>

          <button onClick={handleSave} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg transition-colors">
             حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  );
};

const Profile: React.FC<ProfileProps> = ({ posts, user, currentUser, onRequestVerify, onUpdateUser, onBack, onLogout, onFollow, onLike }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false); // New state for Verify Modal
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'likes'>('posts');
  
  // Real follow status check
  const isFollowingInitial = currentUser.followingIds?.includes(user.id);
  const [isFollowed, setIsFollowed] = useState(!!isFollowingInitial); 
  
  // Update local state when prop changes
  useEffect(() => {
      setIsFollowed(!!currentUser.followingIds?.includes(user.id));
  }, [currentUser.followingIds, user.id]);

  // Likes Modal State
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [activePostForLikes, setActivePostForLikes] = useState<Post | null>(null);

  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [activePostForShare, setActivePostForShare] = useState<Post | null>(null);

  // Followers/Following Modal State
  const [showUserListModal, setShowUserListModal] = useState(false);
  const [userListTitle, setUserListTitle] = useState('');

  const userPosts = posts.filter(p => p.userId === user.id);
  const isOwner = user.id === currentUser.id;

  const handleFollowToggle = () => {
    setIsFollowed(!isFollowed);
    if (onFollow) {
        onFollow(user.id);
    }
  };

  const handleMessage = () => {
    alert(`فتح محادثة مع ${user.name}`);
  };

  const handleShowFollowers = () => {
      setUserListTitle('المتابعون');
      setShowUserListModal(true);
  };

  const handleShowFollowing = () => {
      setUserListTitle('يتابع');
      setShowUserListModal(true);
  };

  const handleVerifyConfirm = () => {
      if (onRequestVerify) onRequestVerify();
      setShowVerifyModal(false);
  };

  return (
    <div className="w-full space-y-6 pb-20 md:pb-0 animate-fadeIn relative">
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onLogout={onLogout} />}
      {showEdit && isOwner && <EditProfileModal user={user} onClose={() => setShowEdit(false)} onSave={(u) => onUpdateUser?.(u)} />}
      {showVerifyModal && <VerificationPlanModal onClose={() => setShowVerifyModal(false)} onConfirm={handleVerifyConfirm} />}
      
      {/* Reusing LikesListModal for Followers/Following using customUsers prop */}
      {showUserListModal && (
          <LikesListModal 
            customUsers={REALISTIC_USERS} // Mock data for followers/following list
            title={userListTitle}
            onClose={() => setShowUserListModal(false)} 
          />
      )}

      {/* Likes Modal */}
      {showLikesModal && activePostForLikes && (
          <LikesListModal 
            post={activePostForLikes}
            currentUser={currentUser}
            onClose={() => setShowLikesModal(false)} 
            title="المتفاعلون"
          />
      )}

      {/* Share Modal */}
      {showShareModal && activePostForShare && (
          <ShareModal 
            post={activePostForShare} 
            onClose={() => setShowShareModal(false)} 
          />
      )}

      {/* Profile Header */}
      <div className="relative">
         {/* Cover Photo (Simulated with gradient) */}
         <div className="h-40 md:h-56 w-full bg-gradient-to-r from-primary-600 via-purple-600 to-blue-600 rounded-b-[3rem] shadow-lg relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             {!isOwner && onBack && (
                 <button 
                    onClick={onBack}
                    className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                 >
                     <Icons.ArrowLeft size={24} className="rtl:rotate-180" />
                 </button>
             )}
             {isOwner && (
                 <div className="absolute top-4 left-4 flex gap-2">
                     <button onClick={() => setShowSettings(true)} className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors">
                         <Icons.Settings size={20} />
                     </button>
                 </div>
             )}
         </div>

         {/* Profile Info Card */}
         <div className="px-6 -mt-16 md:-mt-20 relative z-10">
            <div className="flex flex-col items-center">
               <div className="relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-white dark:bg-slate-900 shadow-2xl">
                     <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                  </div>
                  {user.isVerified && (
                     <div className="absolute bottom-2 right-2 bg-white dark:bg-slate-900 p-1.5 rounded-full border-2 border-transparent shadow-sm">
                        {user.verificationTier === 'gold' ? (
                            <Icons.Crown size={20} className="text-yellow-600 fill-yellow-500" />
                        ) : (
                            <Icons.ShieldCheck size={20} className="text-blue-500" />
                        )}
                     </div>
                  )}
               </div>

               <div className="text-center mt-3 mb-6">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center justify-center gap-2">
                     {user.name}
                  </h1>
                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium dir-ltr">@{user.username}</span>
                  
                  {user.bio && (
                      <p className="text-gray-600 dark:text-gray-300 mt-3 max-w-md mx-auto text-sm leading-relaxed">
                         {user.bio}
                      </p>
                  )}
                  
                  {user.role === 'admin' && (
                     <span className="inline-block mt-2 bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">
                        مسؤول النظام 🛡️
                     </span>
                  )}
                  
                  {user.canBoost && (
                     <span className="inline-block mt-2 mr-2 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                        صلاحية رشق 🚀
                     </span>
                  )}
               </div>

               {/* Stats Row */}
               <div className="flex items-center justify-center gap-8 md:gap-12 mb-8 w-full max-w-md">
                  <div className="text-center">
                     <span className="block font-black text-xl text-gray-900 dark:text-white">{userPosts.length}</span>
                     <span className="text-xs text-gray-500 font-bold uppercase">منشور</span>
                  </div>
                  <div className="w-px h-8 bg-gray-200 dark:bg-slate-700"></div>
                  <div className="text-center cursor-pointer hover:opacity-70 transition-opacity" onClick={handleShowFollowers}>
                     <span className="block font-black text-xl text-gray-900 dark:text-white">{formatNumber(user.followers)}</span>
                     <span className="text-xs text-gray-500 font-bold uppercase">متابع</span>
                  </div>
                  <div className="w-px h-8 bg-gray-200 dark:bg-slate-700"></div>
                  <div className="text-center cursor-pointer hover:opacity-70 transition-opacity" onClick={handleShowFollowing}>
                     <span className="block font-black text-xl text-gray-900 dark:text-white">{formatNumber(user.following)}</span>
                     <span className="text-xs text-gray-500 font-bold uppercase">يتابع</span>
                  </div>
               </div>

               {/* Action Buttons */}
               <div className="flex gap-3 w-full max-w-sm mb-8">
                  {isOwner ? (
                      <>
                        <button 
                            onClick={() => setShowEdit(true)}
                            className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2.5 rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
                        >
                            تعديل الملف
                        </button>
                        {!user.isVerified && onRequestVerify && (
                            <button 
                                onClick={() => setShowVerifyModal(true)} // Open Custom Modal
                                className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 py-2.5 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                            >
                                طلب التوثيق
                            </button>
                        )}
                      </>
                  ) : (
                      <>
                        <button 
                            onClick={handleFollowToggle}
                            className={`flex-1 py-2.5 rounded-xl font-bold shadow-lg transition-all ${isFollowed ? 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
                        >
                            {isFollowed ? 'تتابع' : 'متابعة'}
                        </button>
                        <button 
                            onClick={handleMessage}
                            className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            مراسلة
                        </button>
                      </>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* Content Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 sticky top-16 z-20 md:rounded-t-3xl shadow-sm">
         <div className="flex max-w-md mx-auto">
            <button 
               onClick={() => setActiveTab('posts')}
               className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'posts' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
            >
               المنشورات
            </button>
            <button 
               onClick={() => setActiveTab('media')}
               className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'media' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
            >
               الوسائط
            </button>
            {isOwner && (
                <button 
                onClick={() => setActiveTab('likes')}
                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'likes' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                >
                الإعجابات
                </button>
            )}
         </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 md:px-0">
          {activeTab === 'posts' && (
              <div className="space-y-6">
                  {userPosts.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                          <Icons.Layout size={48} className="mx-auto mb-2 opacity-30" />
                          <p>لا توجد منشورات بعد</p>
                      </div>
                  ) : (
                      userPosts.map(post => (
                          <PostCard 
                            key={post.id} 
                            post={post} 
                            currentUser={currentUser}
                            onAddComment={() => {}} 
                            onSupport={() => {}}
                            onView={() => {}}
                            onShowLikes={() => {
                                setActivePostForLikes(post);
                                setShowLikesModal(true);
                            }}
                            onUnlock={() => {}}
                            onShare={() => {
                                setActivePostForShare(post);
                                setShowShareModal(true);
                            }}
                            isMenuOpen={false}
                            onToggleMenu={() => {}}
                            onMenuAction={() => {}}
                            onLike={onLike}
                            onFollow={onFollow}
                          />
                      ))
                  )}
              </div>
          )}
          
          {activeTab === 'media' && (
             <div className="grid grid-cols-3 gap-1 md:gap-2">
                 {userPosts.filter(p => p.image || p.video).map(post => (
                     <div key={post.id} className="aspect-square bg-gray-100 dark:bg-slate-800 relative group cursor-pointer overflow-hidden rounded-lg">
                         {post.image ? (
                             <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                         ) : (
                             <video src={post.video} className="w-full h-full object-cover" />
                         )}
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold gap-1">
                             <Icons.Heart size={16} fill="white" /> {post.likes}
                         </div>
                     </div>
                 ))}
                 {userPosts.filter(p => p.image || p.video).length === 0 && (
                     <div className="col-span-full text-center py-12 text-gray-400">
                        <Icons.ImageIcon size={48} className="mx-auto mb-2 opacity-30" />
                        <p>لا توجد وسائط</p>
                     </div>
                 )}
             </div>
          )}

          {activeTab === 'likes' && (
              <div className="text-center py-12 text-gray-400">
                  <Icons.Heart size={48} className="mx-auto mb-2 opacity-30" />
                  <p>قائمة الإعجابات خاصة</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default Profile;