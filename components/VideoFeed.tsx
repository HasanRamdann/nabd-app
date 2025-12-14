
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Post, User, ReactionType } from '../types';
import { REALISTIC_USERS } from '../constants';
import * as Icons from './Icons';
import { LikesListModal, REACTIONS } from './Feed'; 

interface VideoFeedProps {
    posts: Post[];
    onAddComment: (postId: string, text: string) => void;
    onLike?: (postId: string, reaction: ReactionType | null) => void;
    onFollow?: (userId: string) => void;
    currentUser?: User; // Pass current user to check following status
}

const VideoFeed: React.FC<VideoFeedProps> = ({ posts, onAddComment, onLike, onFollow, currentUser }) => {
    const videoPosts = posts.filter(p => p.video || p.type === 'reel');
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Likes Modal State
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [activePostForLikes, setActivePostForLikes] = useState<Post | null>(null);

    // Reactions
    const [activeReactionId, setActiveReactionId] = useState<string | null>(null); 
    
    // Follow State Map (Local Optimistic UI)
    const [followedUsers, setFollowedUsers] = useState<Record<string, boolean>>({});

    // Initialize follow state based on currentUser
    useEffect(() => {
        if(currentUser?.followingIds) {
            const initialMap: Record<string, boolean> = {};
            currentUser.followingIds.forEach(id => initialMap[id] = true);
            setFollowedUsers(prev => ({ ...prev, ...initialMap }));
        }
    }, [currentUser]);

    const handleScroll = () => {
        if (containerRef.current) {
            const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
            if (index !== currentIndex) {
                setCurrentIndex(index);
                setActiveReactionId(null); 
            }
        }
    };

    const handleShowLikes = (post: Post) => {
        setActivePostForLikes(post);
        setShowLikesModal(true);
    };
    
    const toggleFollow = (userId: string) => {
        setFollowedUsers(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
        if (onFollow) {
            onFollow(userId);
        }
    };

    const getLikers = (post: Post) => {
        const list: User[] = [];
        if (post.isLiked || post.currentReaction) {
             list.push({ 
              id: 'u1', name: 'أنت', username: 'me', 
              avatar: 'https://ui-avatars.com/api/?name=Me&background=random', 
              isVerified: false, role: 'user', coins: 0, followers: 0, following: 0 
          });
        }
        const needed = Math.min(20, post.likes - (post.isLiked ? 1 : 0));
        for (let i = 0; i < needed; i++) {
            list.push(REALISTIC_USERS[i % REALISTIC_USERS.length]);
        }
        return list;
    };

    if (videoPosts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-gray-400">
                <Icons.Video size={64} className="mb-4 opacity-50" />
                <h3 className="text-xl font-bold">لا توجد فيديوهات حالياً</h3>
                <p>كن أول من ينشر فيديو في المنصة!</p>
            </div>
        );
    }

    return (
        <div 
            ref={containerRef}
            className="w-full h-[calc(100vh-80px)] md:h-[85vh] overflow-y-scroll snap-y snap-mandatory no-scrollbar rounded-none md:rounded-3xl bg-black"
            onScroll={handleScroll}
        >
            {showLikesModal && activePostForLikes && (
                <LikesListModal 
                    customUsers={getLikers(activePostForLikes)} 
                    onClose={() => setShowLikesModal(false)} 
                />
            )}

            {videoPosts.map((post, index) => {
                const isReacted = post.isLiked || !!post.currentReaction;
                const isFollowed = followedUsers[post.userId] || false;
                const isMe = currentUser?.id === post.userId;

                return (
                <div key={post.id} className="w-full h-full snap-start relative flex items-center justify-center bg-gray-900">
                    <VideoPlayer 
                        src={post.video!} 
                        isActive={index === currentIndex} 
                        poster={post.image}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none"></div>
                    
                    {/* Right Side Actions */}
                    <div className="absolute bottom-20 right-4 z-20 flex flex-col gap-6 items-center text-white">
                        
                        <div className="flex flex-col items-center gap-1 relative">
                            {/* Rich Reaction Selector Bubble */}
                            {activeReactionId === post.id && (
                                <div className="absolute right-14 top-0 bg-black/70 backdrop-blur-xl rounded-full p-2 flex gap-3 animate-scaleIn border border-white/10 z-30">
                                    {REACTIONS.map(r => (
                                        <button 
                                            key={r.type}
                                            onClick={() => {
                                                let newReaction: ReactionType | null = null;
                                                if (post.currentReaction === r.type) {
                                                    post.currentReaction = null;
                                                    post.isLiked = false;
                                                    post.likes--;
                                                    newReaction = null;
                                                } else {
                                                    if (!post.currentReaction) post.likes++;
                                                    post.currentReaction = r.type;
                                                    post.isLiked = true; 
                                                    newReaction = r.type;
                                                }
                                                setActiveReactionId(null);
                                                if(onLike) onLike(post.id, newReaction);
                                            }}
                                            className="text-2xl hover:scale-125 transition-transform"
                                            title={r.label}
                                        >
                                            {r.icon}
                                        </button>
                                    ))}
                                </div>
                            )}
                            
                            {/* Main Trigger Button */}
                            <div 
                                className="p-3 bg-gray-800/50 backdrop-blur-md rounded-full hover:bg-gray-700 transition-colors cursor-pointer active:scale-90"
                                onClick={() => setActiveReactionId(activeReactionId === post.id ? null : post.id)}
                            >
                                {post.currentReaction ? (
                                    <span className="text-2xl animate-scaleIn">{REACTIONS.find(r => r.type === post.currentReaction)?.icon}</span>
                                ) : (
                                    <Icons.Heart size={28} className={isReacted ? 'fill-red-500 text-red-500' : 'text-white'} />
                                )}
                            </div>
                            <span 
                                className="text-xs font-bold shadow-black drop-shadow-md cursor-pointer hover:text-red-400"
                                onClick={() => handleShowLikes(post)}
                            >
                                {post.likes}
                            </span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <div className="p-3 bg-gray-800/50 backdrop-blur-md rounded-full hover:bg-blue-500/80 transition-colors cursor-pointer active:scale-90">
                                <Icons.MessageCircle size={28} />
                            </div>
                            <span className="text-xs font-bold shadow-black drop-shadow-md">{post.commentsCount}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="p-3 bg-gray-800/50 backdrop-blur-md rounded-full hover:bg-green-500/80 transition-colors cursor-pointer active:scale-90">
                                <Icons.Share2 size={28} />
                            </div>
                            <span className="text-xs font-bold shadow-black drop-shadow-md">{post.shares}</span>
                        </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-8 left-4 right-16 z-20 text-white text-right">
                         <div className="flex items-center gap-3 mb-3">
                             <img src={post.user.avatar} className="w-10 h-10 rounded-full border-2 border-white" alt="" />
                             <div>
                                 <h3 className="font-bold text-sm flex items-center gap-1 shadow-black drop-shadow-md">
                                     {post.user.name} 
                                     {post.user.isVerified && <Icons.ShieldCheck size={14} className="text-blue-400" />}
                                 </h3>
                                 {!isMe && (
                                     <button 
                                         onClick={() => toggleFollow(post.userId)}
                                         className={`text-[10px] px-3 py-1 rounded-md font-bold mt-1 transition-colors ${isFollowed ? 'bg-white text-black' : 'bg-red-600 text-white'}`}
                                     >
                                         {isFollowed ? 'تتابع' : 'متابعة'}
                                     </button>
                                 )}
                             </div>
                         </div>
                         <p className="text-sm font-medium leading-relaxed drop-shadow-md line-clamp-2">{post.content}</p>
                         <div className="flex items-center gap-2 mt-3 text-xs opacity-80">
                             <Icons.Activity size={12} />
                             <span>الصوت الأصلي - {post.user.name}</span>
                         </div>
                    </div>
                </div>
            )})}
        </div>
    );
};

const VideoPlayer: React.FC<{ src: string, isActive: boolean, poster?: string }> = ({ src, isActive, poster }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().catch(() => {});
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    const togglePlay = () => {
        if (videoRef.current?.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center cursor-pointer" onClick={togglePlay}>
            <video 
                ref={videoRef}
                src={src}
                className="w-full h-full object-cover"
                loop
                playsInline
                poster={poster}
            />
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20">
                    <Icons.Play size={64} className="text-white/80" fill="white" />
                </div>
            )}
        </div>
    );
};

export default VideoFeed;
