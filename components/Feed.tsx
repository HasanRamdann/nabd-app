
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Post, Story, Comment, ReactionType, User } from '../types';
import { REALISTIC_USERS, MALE_NAMES, FEMALE_NAMES, LAST_NAMES, formatNumber } from '../constants';
import { generateCreativePost } from '../services/geminiService';
import * as Icons from './Icons';

export interface FeedProps {
    posts: Post[];
    stories?: Story[];
    onAddComment: (postId: string, text: string) => void;
    onAddStory?: (imageData: string) => void;
    onPost?: (post: Post) => void;
    currentUser: User;
    onUnlockPost: (post: Post) => void;
    onViewProfile?: (user: User) => void;
    onSendGift?: (userId: string, gift: GiftOption) => void;
    onNavigateToStore?: () => void;
    onLike?: (postId: string, reaction: ReactionType | null) => void;
    onFollow?: (userId: string) => void;
    onLoadMore?: () => Promise<void>;
    onRefresh?: () => Promise<void>;
    onVote?: (postId: string, optionId: string) => void;
}

export interface GiftOption {
    id: string;
    name: string;
    icon: string;
    cost: number;
    color: string;
}

const GIFT_OPTIONS: GiftOption[] = [
    { id: 'g1', name: 'زهرة', icon: '🌹', cost: 10, color: 'bg-rose-100 text-rose-600 border-rose-200' },
    { id: 'g2', name: 'قهوة', icon: '☕', cost: 50, color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { id: 'g3', name: 'ماس', icon: '💎', cost: 100, color: 'bg-cyan-100 text-cyan-600 border-cyan-200' },
    { id: 'g4', name: 'سيارة', icon: '🏎️', cost: 500, color: 'bg-red-100 text-red-600 border-red-200' },
];

export const REACTIONS: { type: ReactionType; icon: string; label: string; color: string; bg: string }[] = [
    { type: 'like', icon: '👍', label: 'أعجبني', color: 'text-blue-600', bg: 'bg-blue-50' },
    { type: 'love', icon: '❤️', label: 'أحببته', color: 'text-red-500', bg: 'bg-red-50' },
    { type: 'haha', icon: '😂', label: 'مضحك', color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { type: 'wow', icon: '😮', label: 'واو', color: 'text-orange-500', bg: 'bg-orange-50' },
    { type: 'sad', icon: '😢', label: 'أحززني', color: 'text-blue-400', bg: 'bg-blue-50' },
    { type: 'angry', icon: '😡', label: 'أغضبني', color: 'text-red-700', bg: 'bg-red-50' },
];

// --- SMART USER GENERATOR (BATCH MODE) ---
export const generateReactorBatch = (post: Post, currentUser: User, startIndex: number, count: number): User[] => {
    const batch: User[] = [];
    let seed = 0;
    for (let i = 0; i < post.id.length; i++) {
        seed = (seed << 5) - seed + post.id.charCodeAt(i);
        seed |= 0;
    }
    seed = Math.abs(seed);

    for (let i = 0; i < count; i++) {
        const absoluteIndex = startIndex + i;
        if (absoluteIndex === 0 && (post.isLiked || post.currentReaction)) {
            batch.push(currentUser);
            continue;
        }
        const currentSeed = seed + absoluteIndex;
        const rand = (n: number) => (Math.sin(currentSeed * 9999 + n) * 10000) % 1;
        
        if (Math.abs(rand(1)) > 0.8) {
            const mockIndex = Math.floor(Math.abs(rand(2)) * REALISTIC_USERS.length);
            const mockUser = REALISTIC_USERS[mockIndex];
            if (mockUser.id !== currentUser.id) {
                batch.push({ ...mockUser, id: `${mockUser.id}_${post.id}_${absoluteIndex}` });
                continue;
            }
        }

        const isMale = rand(3) > 0.0;
        const firstNameList = isMale ? MALE_NAMES : FEMALE_NAMES;
        const fIndex = Math.floor(Math.abs(rand(4)) * firstNameList.length);
        const lIndex = Math.floor(Math.abs(rand(5)) * LAST_NAMES.length);
        const name = `${firstNameList[fIndex]} ${LAST_NAMES[lIndex]}`;
        const username = `${firstNameList[fIndex].toLowerCase()}_${LAST_NAMES[lIndex].toLowerCase()}_${Math.floor(Math.abs(rand(6)) * 999)}`;
        const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&seed=${currentSeed}`;

        batch.push({
            id: `gen_u_${post.id}_${absoluteIndex}`,
            name,
            username,
            avatar,
            isVerified: Math.abs(rand(8)) > 0.95,
            verificationTier: Math.abs(rand(10)) > 0.98 ? 'gold' : 'blue',
            role: 'user',
            coins: 0,
            followers: Math.floor(Math.abs(rand(11)) * 5000),
            following: 0,
        });
    }
    return batch;
};

// --- LIKES MODAL ---
export const LikesListModal: React.FC<{ post?: Post; customUsers?: User[]; onClose: () => void; title?: string; currentUser?: User }> = ({ post, customUsers, onClose, title, currentUser }) => {
    const [users, setUsers] = useState<User[]>([]);
    const totalCount = customUsers ? customUsers.length : (post ? post.likes : 0);

    useEffect(() => {
        if (customUsers) {
            setUsers(customUsers);
        } else if (post && currentUser) {
            const initialUsers = generateReactorBatch(post, currentUser, 0, Math.min(20, totalCount));
            setUsers(initialUsers);
        }
    }, [post, customUsers, currentUser]);

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm h-[70vh] rounded-3xl overflow-hidden shadow-2xl animate-scaleIn border border-gray-100 dark:border-slate-800 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {title || 'التفاعلات'} ({totalCount.toLocaleString()})
                    </h3>
                    <button onClick={onClose}><Icons.X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {users.map((user, idx) => (
                        <div key={`${user.id}_${idx}`} className="flex items-center gap-3 w-full">
                            <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border" alt="" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{user.name}</h4>
                                <span className="text-[10px] text-gray-500 block">@{user.username}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- SHARE MODAL ---
export const ShareModal: React.FC<{ post: Post; onClose: () => void }> = ({ post, onClose }) => {
    const shareLinks = [
        { name: 'نسخ الرابط', icon: Icons.Link, color: 'bg-gray-100 dark:bg-slate-700' },
        { name: 'واتساب', icon: Icons.MessageCircle, color: 'bg-green-100 text-green-600' },
        { name: 'تويتر', icon: Icons.Twitter, color: 'bg-blue-100 text-blue-500' },
        { name: 'فيسبوك', icon: Icons.Facebook, color: 'bg-blue-600 text-white' },
    ];

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full md:max-w-sm rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl animate-slideUp border-t md:border border-gray-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="w-12 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full mx-auto mb-6 md:hidden"></div>
                    <h3 className="font-bold text-lg text-center mb-6 dark:text-white">مشاركة المنشور</h3>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {shareLinks.map((link, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-sm ${link.color}`}>
                                    <link.icon size={24} />
                                </div>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{link.name}</span>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-center justify-between border border-gray-100 dark:border-slate-700">
                        <span className="text-xs text-gray-400 truncate w-48">https://nabd.app/p/{post.id}</span>
                        <button className="text-primary-600 font-bold text-xs hover:underline">نسخ</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- UNLOCK MODAL ---
const UnlockModal: React.FC<{ post: Post; userCoins: number; onClose: () => void; onConfirm: () => void }> = ({ post, userCoins, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scaleIn border border-gray-100 dark:border-slate-800 text-center" onClick={e => e.stopPropagation()}>
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icons.Lock size={32} className="text-yellow-600 dark:text-yellow-500" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">محتوى حصري</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    هذا المحتوى خاص بالمشتركين. لفتح القفل، يجب دفع مبلغ رمزي لصانع المحتوى.
                </p>
                
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">سعر الفتح</span>
                        <span className="font-bold text-yellow-600 dark:text-yellow-400">{post.unlockPrice || 50} 🪙</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-200 dark:border-slate-700 pt-2">
                        <span className="text-sm text-gray-500">رصيدك</span>
                        <span className="font-bold text-green-600">{userCoins} 🪙</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                    >
                        إلغاء
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={userCoins < (post.unlockPrice || 50)}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-yellow-500 hover:bg-yellow-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        تأكيد ودفع
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- SUPPORT MODAL ---
const SupportModal: React.FC<{ onClose: () => void; onSend: (gift: GiftOption) => void; userCoins: number; onGoToStore: () => void }> = ({ onClose, onSend, userCoins, onGoToStore }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scaleIn border border-gray-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                        <Icons.Gem className="text-yellow-500" /> إرسال هدية
                    </h3>
                    <button onClick={onClose}><Icons.X size={20} /></button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {GIFT_OPTIONS.map(gift => (
                        <div 
                            key={gift.id}
                            onClick={() => onSend(gift)} 
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-2 ${gift.color}`}
                        >
                            <span className="text-2xl">{gift.icon}</span>
                            <span className="font-bold text-sm">{gift.name}</span>
                            <span className="text-xs font-bold bg-white/50 px-2 py-1 rounded-full">{gift.cost} 🪙</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-800 p-3 rounded-xl">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">رصيدك: {formatNumber(userCoins)} 🪙</span>
                    <button onClick={onGoToStore} className="text-xs font-bold text-primary-600 hover:underline">شحن الرصيد</button>
                </div>
            </div>
        </div>
    );
};

// --- STORY VIEWER ---
const StoryViewer: React.FC<{ story: Story; onClose: () => void; onNext: () => void; onPrev: () => void }> = ({ story, onClose, onNext, onPrev }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    onNext();
                    return 0;
                }
                return prev + 1; // 5 seconds duration approx (100 * 50ms = 5000ms)
            });
        }, 50);

        return () => clearInterval(interval);
    }, [story.id, onNext]);

    return (
        <div className="fixed inset-0 z-[300] bg-black flex items-center justify-center">
            {/* Progress Bar */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
                <div className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden">
                    <div className="h-full bg-white transition-all ease-linear duration-75" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* Header */}
            <div className="absolute top-8 left-4 right-4 z-20 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                     <img src={story.user.avatar} className="w-10 h-10 rounded-full border-2 border-white" alt="" />
                     <span className="font-bold text-white shadow-black drop-shadow-md">{story.user.name}</span>
                 </div>
                 <button onClick={onClose} className="text-white p-2 rounded-full hover:bg-white/20"><Icons.X size={24} /></button>
            </div>

            {/* Content */}
            <div className="w-full h-full relative">
                <img src={story.image} className="w-full h-full object-contain" alt="" />
                
                {/* Navigation Zones */}
                <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={onPrev}></div>
                <div className="absolute inset-y-0 right-0 w-1/3 z-10" onClick={onNext}></div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex gap-4">
                <input 
                    type="text" 
                    placeholder="إرسال رسالة..." 
                    className="flex-1 bg-transparent border border-white/50 rounded-full px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:border-white backdrop-blur-sm" 
                />
                <button className="p-3 rounded-full hover:bg-white/20 text-white transition-colors">
                    <Icons.Heart size={28} />
                </button>
            </div>
        </div>
    );
};

// --- QUICK POST ---
const QuickPost: React.FC<{ currentUser: User; onPost: (post: Post) => void }> = ({ currentUser, onPost }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        const newPost: Post = {
            id: Date.now().toString(),
            userId: currentUser.id,
            user: currentUser,
            content: text,
            likes: 0,
            commentsCount: 0,
            shares: 0,
            comments: [],
            timestamp: 'الآن',
            type: 'post',
        };
        onPost(newPost);
        setText('');
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 mb-6 shadow-sm border border-gray-100 dark:border-slate-700 flex gap-4 items-center">
            <img src={currentUser.avatar} className="w-12 h-12 rounded-full border border-gray-200 dark:border-slate-700 object-cover" alt="" />
            <form onSubmit={handleSubmit} className="flex-1 relative">
                <input 
                    type="text" 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="بماذا تفكر؟" 
                    className="w-full bg-gray-50 dark:bg-slate-900 rounded-2xl py-3 px-5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                />
                <button 
                    type="submit" 
                    disabled={!text}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                    <Icons.Send size={20} className="rtl:rotate-180" />
                </button>
            </form>
            <button className="text-gray-400 hover:text-green-500 transition-colors"><Icons.ImageIcon size={24} /></button>
        </div>
    );
};

interface PostCardProps {
  post: Post;
  currentUser: User;
  onAddComment: (postId: string, text: string) => void;
  onSupport: () => void;
  onView: () => void;
  onShowLikes: () => void;
  onUnlock: () => void;
  onViewProfile?: () => void;
  onShare: () => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onMenuAction: (action: string) => void;
  onLike?: (postId: string, reaction: ReactionType | null) => void;
  onFollow?: (userId: string) => void;
  onVote?: (postId: string, optionId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onAddComment,
  onSupport,
  onView,
  onShowLikes,
  onUnlock,
  onViewProfile,
  onShare,
  isMenuOpen,
  onToggleMenu,
  onMenuAction,
  onLike,
  onFollow,
  onVote
}) => {
  const [commentText, setCommentText] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const isLocked = post.isLocked && !currentUser.unlockedPosts?.includes(post.id) && post.userId !== currentUser.id;

  const handleLikeClick = () => {
      if (onLike) {
          if (post.isLiked) {
              onLike(post.id, null); 
          } else {
              onLike(post.id, 'like'); 
          }
      }
  };

  const handleReaction = (reaction: ReactionType) => {
      if (onLike) onLike(post.id, reaction);
      setShowReactions(false);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
      e.preventDefault();
      if(commentText.trim()) {
          onAddComment(post.id, commentText);
          setCommentText('');
      }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 animate-fadeIn relative overflow-visible">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3 cursor-pointer" onClick={onViewProfile}>
                <div className="relative">
                    <img src={post.user.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-slate-700" alt="" />
                    {post.user.isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5">
                             {post.user.verificationTier === 'gold' ? (
                                 <Icons.Crown size={12} className="text-yellow-600 fill-yellow-500" />
                             ) : (
                                 <Icons.ShieldCheck size={12} className="text-blue-500" />
                             )}
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1">
                        {post.user.name}
                    </h4>
                    <span className="text-xs text-gray-500 block -mt-0.5">{post.timestamp}</span>
                </div>
            </div>
            <div className="relative">
                <button onClick={onToggleMenu} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <Icons.MoreVertical size={20} />
                </button>
                {isMenuOpen && (
                    <div className="absolute left-0 top-10 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-50 py-1 overflow-hidden animate-scaleIn">
                        <button onClick={() => onMenuAction('copy')} className="w-full text-right px-4 py-2 text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                            <Icons.Copy size={14} /> نسخ الرابط
                        </button>
                        <button onClick={() => onMenuAction('report')} className="w-full text-right px-4 py-2 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 flex items-center gap-2">
                            <Icons.Flag size={14} /> إبلاغ
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-800 dark:text-gray-200 mb-3 leading-relaxed whitespace-pre-wrap font-medium">
            {post.content}
        </p>

        {/* Media / Locked Content */}
        {isLocked ? (
            <div className="w-full h-64 bg-gray-900 rounded-2xl flex flex-col items-center justify-center text-white relative overflow-hidden mb-3 z-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>
                <Icons.Lock size={48} className="mb-4 text-yellow-500 relative z-10" />
                <h3 className="text-xl font-bold mb-1 relative z-10">محتوى حصري</h3>
                <p className="text-sm text-gray-400 mb-4 relative z-10">اشترك لفتح هذا المحتوى</p>
                
                {/* Unlock Button - Fixed Interaction */}
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onUnlock();
                    }}
                    className="relative z-20 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg cursor-pointer"
                >
                    <Icons.Unlock size={18} /> فتح مقابل {post.unlockPrice || 50} 🪙
                </button>
            </div>
        ) : (
            <div className="mb-3">
                 {/* Polls */}
                 {post.type === 'poll' && post.pollOptions && (
                    <div className="space-y-2 mb-3">
                        {post.pollOptions.map(option => {
                            const percent = post.totalVotes ? Math.round((option.votes / post.totalVotes) * 100) : 0;
                            const isVoted = post.userVotedOptionId === option.id;
                            return (
                                <div 
                                    key={option.id} 
                                    onClick={() => onVote && !post.userVotedOptionId && onVote(post.id, option.id)}
                                    className={`relative h-10 rounded-lg overflow-hidden cursor-pointer border ${isVoted ? 'border-primary-500' : 'border-gray-200 dark:border-slate-700'}`}
                                >
                                    <div className="absolute inset-y-0 left-0 bg-primary-100 dark:bg-primary-900/30 transition-all duration-500" style={{width: `${percent}%`}}></div>
                                    <div className="absolute inset-0 flex items-center justify-between px-4">
                                        <span className="text-sm font-bold z-10">{option.text}</span>
                                        <span className="text-xs font-medium z-10">{percent}%</span>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="text-xs text-gray-500 text-left px-1">{post.totalVotes} صوت</div>
                    </div>
                 )}

                 {/* Images/Video */}
                 {post.image && (
                     <div className="rounded-2xl overflow-hidden mb-2 cursor-pointer" onClick={onView}>
                         <img src={post.image} className="w-full h-auto object-cover max-h-[500px]" alt="Post" />
                     </div>
                 )}
                 {post.video && (
                     <div className="rounded-2xl overflow-hidden mb-2 relative bg-black">
                         <video src={post.video} controls className="w-full max-h-[500px]" />
                     </div>
                 )}
                 {post.audio && (
                    <div className="bg-gray-100 dark:bg-slate-900 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600">
                             <Icons.Mic size={20} />
                        </div>
                        <div className="flex-1">
                             <div className="h-1 bg-gray-300 dark:bg-slate-700 rounded-full mb-1"></div>
                             <div className="flex justify-between text-[10px] text-gray-500">
                                 <span>{post.audioDuration || '0:00'}</span>
                                 <span>رسالة صوتية</span>
                             </div>
                        </div>
                        <button className="p-2 bg-primary-600 text-white rounded-full">
                            <Icons.Play size={14} className="ml-0.5" fill="white" />
                        </button>
                    </div>
                 )}
            </div>
        )}

        {/* Stats & Actions */}
        <div className="flex items-center justify-between py-2 border-t border-gray-50 dark:border-slate-700/50">
             <div className="flex items-center gap-4">
                 <div className="relative">
                     {showReactions && (
                         <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-900 shadow-xl rounded-full p-2 flex gap-2 animate-scaleIn border border-gray-100 dark:border-slate-700 z-50">
                             {REACTIONS.map(r => (
                                 <button 
                                    key={r.type} 
                                    onClick={() => handleReaction(r.type)}
                                    className="hover:scale-125 transition-transform text-xl"
                                    title={r.label}
                                 >
                                     {r.icon}
                                 </button>
                             ))}
                         </div>
                     )}
                     <button 
                         className={`flex items-center gap-1.5 transition-colors ${post.isLiked ? (REACTIONS.find(r => r.type === post.currentReaction)?.color || 'text-blue-600') : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                         onClick={handleLikeClick}
                         onMouseEnter={() => setShowReactions(true)}
                         onMouseLeave={() => setTimeout(() => setShowReactions(false), 500)}
                     >
                         {post.currentReaction ? (
                             <span className="text-xl">{REACTIONS.find(r => r.type === post.currentReaction)?.icon}</span>
                         ) : (
                             <Icons.Heart size={20} className={post.isLiked ? 'fill-current' : ''} />
                         )}
                         <span className="text-xs font-bold" onClick={(e) => { e.stopPropagation(); onShowLikes(); }}>{formatNumber(post.likes)}</span>
                     </button>
                 </div>
                 
                 <button onClick={onView} className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors">
                     <Icons.MessageCircle size={20} />
                     <span className="text-xs font-bold">{formatNumber(post.commentsCount)}</span>
                 </button>
                 
                 <button onClick={onShare} className="flex items-center gap-1.5 text-gray-500 hover:text-green-500 transition-colors">
                     <Icons.Share2 size={20} />
                     <span className="text-xs font-bold">{formatNumber(post.shares)}</span>
                 </button>
             </div>
             
             <button 
                onClick={onSupport} 
                className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold hover:bg-yellow-100 transition-colors cursor-pointer"
             >
                 <Icons.Gem size={14} /> دعم
             </button>
        </div>

        {/* Comment Input */}
        <div className="mt-3 flex gap-2">
            <img src={currentUser.avatar} className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-700" alt="" />
            <form onSubmit={handleSubmitComment} className="flex-1 relative">
                <input 
                    type="text" 
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="أضف تعليقاً..." 
                    className="w-full bg-gray-100 dark:bg-slate-900 rounded-xl py-2 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {commentText && (
                    <button type="submit" className="absolute left-2 top-1/2 -translate-y-1/2 text-primary-600 font-bold text-xs hover:text-primary-700">
                        نشر
                    </button>
                )}
            </form>
        </div>
    </div>
  );
};

// --- POST DETAIL MODAL ---
export const PostDetailModal: React.FC<{ post: Post; onClose: () => void; onAddComment: (id: string, text: string) => void }> = ({ post, onClose, onAddComment }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl animate-scaleIn border border-gray-100 dark:border-slate-800 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950">
                    <h3 className="font-bold text-gray-900 dark:text-white">تفاصيل المنشور</h3>
                    <button onClick={onClose}><Icons.X size={20} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {/* Reusing PostCard components logic roughly for display, simplified */}
                    <div className="flex items-center gap-3 mb-4">
                        <img src={post.user.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                        <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{post.user.name}</h4>
                            <span className="text-xs text-gray-500">{post.timestamp}</span>
                        </div>
                    </div>
                    
                    <p className="text-sm text-gray-800 dark:text-gray-200 mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    
                    {post.image && <img src={post.image} className="w-full rounded-xl mb-4" alt="" />}
                    {post.video && <video src={post.video} controls className="w-full rounded-xl mb-4" />}
                    
                    {/* Comments Section */}
                    <div className="mt-6 border-t border-gray-100 dark:border-slate-800 pt-4">
                        <h4 className="font-bold text-sm mb-4">التعليقات ({post.commentsCount})</h4>
                        {post.comments && post.comments.length > 0 ? (
                            <div className="space-y-4">
                                {post.comments.map((comment, idx) => (
                                    <div key={idx} className="flex gap-3">
                                        <img src={comment.user.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                                        <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-2xl rounded-tr-none">
                                            <h5 className="font-bold text-xs text-gray-900 dark:text-white mb-0.5">{comment.user.name}</h5>
                                            <p className="text-xs text-gray-600 dark:text-gray-300">{comment.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-400 text-xs py-4">لا توجد تعليقات بعد. كن أول من يعلق!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Feed: React.FC<FeedProps> = ({ 
    posts, 
    stories = [], 
    onAddComment,
    onAddStory,
    onPost,
    currentUser, 
    onUnlockPost, 
    onViewProfile, 
    onSendGift, 
    onNavigateToStore,
    onLike,
    onFollow,
    onLoadMore,
    onRefresh,
    onVote
}) => {
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [viewPost, setViewPost] = useState<Post | null>(null);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [activePostForLikes, setActivePostForLikes] = useState<Post | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activePostForShare, setActivePostForShare] = useState<Post | null>(null);
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [activePostToUnlock, setActivePostToUnlock] = useState<Post | null>(null);
  
  // Pull-to-refresh vars...
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const touchStartY = useRef(0);
  const loadingMoreRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendGiftLocal = (gift: GiftOption) => {
      if (activePost && onSendGift) {
          onSendGift(activePost.userId, gift);
          setShowSupportModal(false);
      }
  };

  const handleUnlockClick = (post: Post) => {
      setActivePostToUnlock(post);
      setShowUnlockModal(true);
  };

  const handleUnlockConfirm = () => {
      if (activePostToUnlock) {
          onUnlockPost(activePostToUnlock);
          setShowUnlockModal(false);
          setActivePostToUnlock(null);
      }
  };

  const openStory = (story: Story) => setActiveStory(story);
  const handleNextStory = () => {
      if (!activeStory) return;
      const idx = stories.findIndex(s => s.id === activeStory.id);
      if (idx < stories.length - 1) setActiveStory(stories[idx + 1]);
      else setActiveStory(null);
  };
  const handlePrevStory = () => {
      if (!activeStory) return;
      const idx = stories.findIndex(s => s.id === activeStory.id);
      if (idx > 0) setActiveStory(stories[idx - 1]);
  };

  const handleStoryClick = () => { if (fileInputRef.current) fileInputRef.current.click(); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { alert('حجم الصورة كبير جداً.'); return; }
      const reader = new FileReader();
      reader.onloadend = () => { if (onAddStory) onAddStory(reader.result as string); };
      reader.readAsDataURL(file);
      e.target.value = '';
  };

  const handleTouchStart = (e: React.TouchEvent) => { if (window.scrollY <= 10) touchStartY.current = e.touches[0].clientY; };
  const handleTouchMove = (e: React.TouchEvent) => {
      if (touchStartY.current === 0) return;
      const diff = e.touches[0].clientY - touchStartY.current;
      if (window.scrollY <= 10 && diff > 0) { if (isRefreshing) return; setPullY(Math.min(diff * 0.4, 120)); }
  };
  const handleTouchEnd = async () => {
      touchStartY.current = 0;
      if (isRefreshing) return;
      if (pullY > 60) { setIsRefreshing(true); setPullY(60); if (onRefresh) await onRefresh(); setIsRefreshing(false); setPullY(0); } else { setPullY(0); }
  };

  useEffect(() => {
      if (!onLoadMore) return;
      const observer = new IntersectionObserver(async (entries) => {
          if (entries[0].isIntersecting && !loadingMoreRef.current) {
              loadingMoreRef.current = true;
              setIsLoadingMore(true);
              await onLoadMore();
              setIsLoadingMore(false);
              loadingMoreRef.current = false;
          }
      }, { threshold: 0.1 });
      if (bottomRef.current) observer.observe(bottomRef.current);
      return () => observer.disconnect();
  }, [onLoadMore, posts.length]);

  return (
    <div className="w-full max-w-2xl mx-auto pb-20 md:pb-0 animate-fadeIn relative" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div className="fixed top-20 left-0 right-0 z-30 flex justify-center pointer-events-none transition-transform duration-200" style={{ transform: `translateY(${pullY > 0 ? pullY - 40 : -100}px)` }}>
          <div className="bg-white dark:bg-slate-800 rounded-full p-2 shadow-lg border border-gray-100 dark:border-slate-700">
              <Icons.Loader className={`animate-spin text-primary-600 ${isRefreshing ? 'opacity-100' : 'opacity-70'}`} size={24} />
          </div>
      </div>

      {activeStory && <StoryViewer story={activeStory} onClose={() => setActiveStory(null)} onNext={handleNextStory} onPrev={handlePrevStory} />}
      {showSupportModal && <SupportModal onClose={() => setShowSupportModal(false)} onSend={handleSendGiftLocal} userCoins={currentUser.coins} onGoToStore={() => { setShowSupportModal(false); onNavigateToStore?.(); }} />}
      {viewPost && <PostDetailModal post={viewPost} onClose={() => setViewPost(null)} onAddComment={onAddComment} />}
      {showLikesModal && activePostForLikes && <LikesListModal post={activePostForLikes} currentUser={currentUser} onClose={() => setShowLikesModal(false)} title="المتفاعلون" />}
      {showShareModal && activePostForShare && <ShareModal post={activePostForShare} onClose={() => setShowShareModal(false)} />}
      
      {showUnlockModal && activePostToUnlock && (
          <UnlockModal 
              post={activePostToUnlock} 
              userCoins={currentUser.coins} 
              onClose={() => setShowUnlockModal(false)} 
              onConfirm={handleUnlockConfirm} 
          />
      )}

      <div style={{ transform: `translateY(${pullY * 0.3}px)`, transition: isRefreshing ? 'transform 0.2s' : 'none' }}>
          <div className="flex gap-3 overflow-x-auto pb-4 mb-4 no-scrollbar px-1 snap-x snap-mandatory">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            <div className="flex flex-col items-center gap-1 cursor-pointer group snap-start" onClick={handleStoryClick}>
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary-500 p-0.5 group-hover:bg-primary-50 transition-colors flex items-center justify-center relative">
                <img src={currentUser.avatar} className="w-full h-full rounded-full object-cover opacity-50" alt="" />
                <div className="absolute inset-0 flex items-center justify-center"><Icons.PlusSquare className="text-primary-600" size={24} /></div>
              </div>
              <span className="text-xs font-medium truncate w-16 text-center">قصتي</span>
            </div>
            {stories.map(story => (
              <div key={story.id} className="flex flex-col items-center gap-1 cursor-pointer group snap-start" onClick={() => openStory(story)}>
                <div className={`w-16 h-16 rounded-full p-0.5 ${story.isViewed ? 'bg-gray-200 dark:bg-slate-700' : 'bg-gradient-to-tr from-yellow-400 to-red-500'}`}>
                  <img src={story.image} className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-900 group-hover:scale-105 transition-transform" alt="" />
                </div>
                <span className="text-xs font-medium truncate w-16 text-center text-gray-700 dark:text-gray-300">{story.user.name}</span>
              </div>
            ))}
          </div>

          {onPost && <QuickPost currentUser={currentUser} onPost={onPost} />}

          <div className="space-y-6">
            {posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onAddComment={onAddComment} 
                onSupport={() => { setActivePost(post); setShowSupportModal(true); }}
                onView={() => setViewPost(post)}
                onShowLikes={() => { setActivePostForLikes(post); setShowLikesModal(true); }}
                currentUser={currentUser}
                onUnlock={() => handleUnlockClick(post)}
                onViewProfile={() => onViewProfile && onViewProfile(post.user)}
                onShare={() => { setActivePostForShare(post); setShowShareModal(true); }}
                isMenuOpen={activeMenuPostId === post.id}
                onToggleMenu={() => setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)}
                onMenuAction={(action) => {
                    if (action === 'report') alert('تم الإبلاغ');
                    if (action === 'copy') { navigator.clipboard.writeText('link'); alert('تم النسخ'); }
                    if (action === 'hide') alert('تم الإخفاء');
                    setActiveMenuPostId(null);
                }}
                onLike={onLike}
                onFollow={onFollow}
                onVote={onVote}
              />
            ))}
          </div>

          {onLoadMore && <div ref={bottomRef} className="py-8 flex justify-center w-full">{isLoadingMore && <Icons.Loader className="animate-spin text-primary-500" size={32} />}</div>}
      </div>
    </div>
  );
};

export default Feed;
