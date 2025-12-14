
import React, { useState, useCallback, useEffect, useRef } from 'react';
import AppShell from './components/AppShell';
import Feed from './components/Feed';
import CreatePost from './components/CreatePost';
import { AdminDashboard } from './components/AdminDashboard';
import Profile from './components/Profile';
import Login from './components/Login';
import PagesView from './components/PagesView'; 
import Chat from './components/Chat';
import Leaderboard from './components/Leaderboard'; 
import StoreView from './components/StoreView'; 
import ExploreView from './components/ExploreView'; 
import NotificationsView from './components/NotificationsView'; 
import VideoFeed from './components/VideoFeed';
import TribesView from './components/TribesView';
import MajlisView from './components/MajlisView';
import CreatorStudio from './components/CreatorStudio';
import MapView from './components/MapView';
import { ToastContainer, ToastMessage } from './components/Toast';
import * as Icons from './components/Icons';

import { ViewState, Post, Comment, User, BotConfig, Page, StoreItem, Notification, ReactionType, Story } from './types';
import { INITIAL_BOTS, MOCK_PAGES, MOCK_STORIES } from './constants';
import { db } from './services/storage';

interface GiftOption {
    id: string;
    name: string;
    icon: string;
    cost: number;
    color: string;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('login');
  
  // Initialize theme from localStorage or default to true (Dark)
  const [isDark, setIsDark] = useState(() => {
      if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('nabd_theme');
          return saved ? saved === 'dark' : true;
      }
      return true;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Global State
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null); 
  const [viewingUser, setViewingUser] = useState<User | null>(null); // New state for public profiles
  const [stories, setStories] = useState<Story[]>([]);
  
  // Refs for Bot Engine to access latest state without triggering re-renders
  const currentUserRef = useRef<User | null>(null);
  const postsRef = useRef<Post[]>([]);

  const [verificationRequests, setVerificationRequests] = useState<string[]>([]);
  const [pages, setPages] = useState<Page[]>([]); 
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]); 
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const botEngineConfig = useRef({
      speed: 1, 
      prioritizeVerified: true,
      batchSize: 5 
  });

  // Keep Refs Synced
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);
  useEffect(() => { postsRef.current = posts; }, [posts]);

  // --- Theme Effect ---
  // Apply the class to the HTML element for global Tailwind Dark Mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
        root.classList.add('dark');
        localStorage.setItem('nabd_theme', 'dark');
    } else {
        root.classList.remove('dark');
        localStorage.setItem('nabd_theme', 'light');
    }
  }, [isDark]);

  // --- Initialization ---
  useEffect(() => {
    setUsers(db.getUsers());
    setPosts(db.getPosts());
    setStories(MOCK_STORIES);
    
    const storedBots = db.getBots();
    if (storedBots.length < 100) { 
        setBots(INITIAL_BOTS);
        db.updateBots(INITIAL_BOTS);
    } else {
        setBots(storedBots);
    }

    setPages(db.getPages()); 

    const session = db.getSession();
    if (session) {
      setCurrentUser(session);
      setIsLoggedIn(true);
      setCurrentView('feed');
      setNotifications(db.getNotifications().filter(n => n.userId === session.id));
    }
  }, []);

  const toggleTheme = useCallback(() => setIsDark(prev => !prev), []);

  const handleChangeView = (view: ViewState) => {
      // If clicking profile from nav, show my own profile
      if (view === 'profile') {
          setViewingUser(null);
      }
      setCurrentView(view);
  };

  const handleViewProfile = (user: User) => {
      setViewingUser(user);
      setCurrentView('profile');
  };

  const addToast = (message: string, type: ToastMessage['type'] = 'info', title?: string, icon?: any) => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message, type, title, icon }]);
  };

  const removeToast = (id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Auth Logic ---
  const handleLogin = useCallback((username: string, pass: string) => {
    const user = db.login(username, pass);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setLoginError('');
      setCurrentView('feed');
      setNotifications(db.getNotifications().filter(n => n.userId === user.id));
      // Welcome toast is fine to keep
      addToast(`أهلاً بك مجدداً، ${user.name}`, 'success', 'تسجيل الدخول');
    } else {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  }, []);

  const handleLogout = useCallback(() => {
      db.logout();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setViewingUser(null);
      setCurrentView('login');
      setNotifications([]);
  }, []);

  const handleRegister = useCallback((name: string, username: string, pass: string) => {
    try {
      const isAdmin = username.toLowerCase().startsWith('admin');
      
      const newUser: User = {
        id: `u_${Date.now()}`,
        name: name,
        username: username,
        password: pass,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        isVerified: isAdmin,
        verificationTier: isAdmin ? 'gold' : undefined,
        bio: isAdmin ? 'مشرف جديد في المنصة 🛡️' : 'مستخدم جديد في منصة نبض 👋',
        coins: isAdmin ? 10000 : 100, 
        followers: 0,
        following: 0,
        followingIds: [],
        role: isAdmin ? 'admin' : 'user',
        adminPermissions: isAdmin ? {
            manageUsers: true,
            manageContent: true,
            manageSystem: true,
            viewAnalytics: true
        } : undefined,
        level: 1,
        xp: 0
      };
      
      const updatedUsers = db.saveUser(newUser);
      setUsers(updatedUsers);
      
      db.login(username, pass);
      setCurrentUser(newUser);
      setIsLoggedIn(true);
      setLoginError('');
      setCurrentView('feed');
      setNotifications([]);
      addToast('تم إنشاء الحساب بنجاح', 'success');
    } catch (e: any) {
      setLoginError(e.message || 'حدث خطأ أثناء التسجيل');
    }
  }, []);

  // --- Content Logic ---
  const handleAddPost = useCallback((newPost: Post) => {
    const updatedPosts = db.savePost(newPost);
    setPosts(updatedPosts);
    
    if (currentUser) {
        const updatedUser = { 
            ...currentUser, 
            coins: currentUser.coins + 10,
            xp: (currentUser.xp || 0) + 20 
        };
        db.updateUser(updatedUser);
        setCurrentUser(updatedUser);
        // REMOVED TOAST: addToast('تم نشر مشاركتك!', 'success');
        setCurrentView('feed'); 
    }
  }, [currentUser]);

  const handleAddStory = (imageData: string) => {
      if (!currentUser) return;
      const newStory: Story = {
          id: `story_${Date.now()}`,
          user: currentUser,
          image: imageData,
          isViewed: false,
          views: 0
      };
      setStories(prev => [newStory, ...prev]);
      // REMOVED TOAST: addToast('تم إضافة قصتك بنجاح!', 'success');
  };

  const handleVote = (postId: string, optionId: string) => {
      if (!currentUser) return;

      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex === -1) return;

      const post = posts[postIndex];
      if (post.userVotedOptionId) return;

      const updatedPollOptions = post.pollOptions?.map(opt => 
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      );

      const updatedPost = {
          ...post,
          pollOptions: updatedPollOptions,
          totalVotes: (post.totalVotes || 0) + 1,
          userVotedOptionId: optionId
      };

      const newPosts = [...posts];
      newPosts[postIndex] = updatedPost;
      
      setPosts(newPosts);
      db.updatePosts(newPosts);
      // REMOVED TOAST: addToast('تم تسجيل صوتك بنجاح ✅', 'success');
  };

  const handleAddComment = (postId: string, text: string) => {
    if (!currentUser) return;
    
    const posts = db.getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      user: currentUser,
      text,
      timestamp: 'الآن'
    };

    const updatedPost = {
      ...posts[postIndex],
      comments: [...posts[postIndex].comments, newComment],
      commentsCount: posts[postIndex].commentsCount + 1
    };

    const newPosts = [...posts];
    newPosts[postIndex] = updatedPost;
    
    db.updatePosts(newPosts);
    setPosts(newPosts);

    if (updatedPost.userId !== currentUser.id) {
        const notif: Notification = {
            id: Date.now().toString(),
            userId: updatedPost.userId,
            sender: currentUser,
            type: 'comment',
            postId: updatedPost.id,
            text: text,
            timestamp: 'الآن',
            isRead: false
        };
        db.saveNotification(notif);
        if (currentUser.id === updatedPost.userId) {
             setNotifications(prev => [notif, ...prev]);
        }
    }
  };

  const handleLike = (postId: string, reaction: ReactionType | null) => {
      if (!currentUser) return;
      
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex === -1) return;
      
      const post = posts[postIndex];
      const updatedPost = { ...post };
      let isNewLike = false;

      if (reaction) {
          updatedPost.currentReaction = reaction;
          if (!post.isLiked) {
               updatedPost.likes = post.likes + 1;
               updatedPost.isLiked = true;
               isNewLike = true;
          }
      } else {
          updatedPost.currentReaction = null;
          if (post.isLiked) {
              updatedPost.likes = Math.max(0, post.likes - 1);
              updatedPost.isLiked = false;
          }
      }
      
      const newPosts = [...posts];
      newPosts[postIndex] = updatedPost;
      
      setPosts(newPosts);
      db.updatePosts(newPosts);

      if (isNewLike && post.userId !== currentUser.id) {
           const notif: Notification = {
              id: `l_${Date.now()}`,
              userId: post.userId,
              sender: currentUser,
              type: 'like',
              postId: post.id,
              text: reaction === 'like' ? 'أعجب بمنشورك' : `تفاعل بـ ${reaction} على منشورك`,
              timestamp: 'الآن',
              isRead: false
          };
          db.saveNotification(notif);
      }
  };

  const handleFollow = (targetUserId: string) => {
      if (!currentUser || targetUserId === currentUser.id) return;

      const isFollowing = currentUser.followingIds?.includes(targetUserId);
      let result;

      if (isFollowing) {
          result = db.unfollowUser(currentUser.id, targetUserId);
      } else {
          result = db.followUser(currentUser.id, targetUserId);
          if (result) {
              const notif: Notification = {
                  id: `f_${Date.now()}`,
                  userId: targetUserId,
                  sender: currentUser,
                  type: 'follow',
                  text: 'بدأ بمتابعتك',
                  timestamp: 'الآن',
                  isRead: false
              };
              db.saveNotification(notif);
          }
      }

      if (result) {
          setCurrentUser(result.updatedCurrentUser);
          if (viewingUser && viewingUser.id === targetUserId) {
              setViewingUser(result.updatedTargetUser);
          }
          setUsers(db.getUsers());
      }
  };

  // --- FIXED UNLOCK POST LOGIC ---
  const handleUnlockPost = (post: Post) => {
      if (!currentUser) return;
      
      const price = post.unlockPrice || 50; // Fallback price

      if (currentUser.coins >= price) {
           // 1. Update User State
           const updatedUnlockedPosts = [...(currentUser.unlockedPosts || []), post.id];
           const updatedUser = {
               ...currentUser,
               coins: currentUser.coins - price,
               unlockedPosts: updatedUnlockedPosts
           };
           
           // 2. Persist User Update
           db.updateUser(updatedUser);
           setCurrentUser(updatedUser);

           // 3. Update Creator (Economy)
           const creator = users.find(u => u.id === post.userId);
           if (creator) {
               const updatedCreator = {
                   ...creator,
                   coins: creator.coins + Math.floor(price * 0.8) // 80% commission
               };
               db.updateUser(updatedCreator);
           }

           addToast('تم فتح المحتوى بنجاح! 🎉', 'success');
      } else {
          addToast(`رصيدك غير كافي! تحتاج ${price} عملة.`, 'error');
      }
  };

  // --- Financial Transaction Logic (Sending Gifts) ---
  const handleSendGift = (receiverId: string, gift: GiftOption) => {
      if (!currentUser) return;

      if (currentUser.coins < gift.cost) {
          addToast('عذراً، رصيدك غير كافي! قم بزيارة المتجر للشحن.', 'error');
          setCurrentView('store');
          return;
      }

      // 1. Deduct from Sender
      const updatedSender = {
          ...currentUser,
          coins: currentUser.coins - gift.cost,
          xp: (currentUser.xp || 0) + 10 // Award XP for generosity
      };
      db.updateUser(updatedSender);
      setCurrentUser(updatedSender);

      // 2. Add to Receiver (Content Creator)
      const usersList = db.getUsers();
      const receiver = usersList.find(u => u.id === receiverId);
      
      if (receiver) {
          const rewardAmount = Math.floor(gift.cost * 0.7);
          const updatedReceiver = {
              ...receiver,
              coins: receiver.coins + rewardAmount,
              xp: (receiver.xp || 0) + 20 
          };
          
          const newUsersList = db.updateUser(updatedReceiver);
          setUsers(newUsersList); 

          // 3. Notify Receiver
          db.saveNotification({
              id: Date.now().toString(),
              userId: receiverId,
              sender: updatedSender,
              type: 'gift',
              text: `أرسل لك ${gift.name} (${gift.icon}) +${rewardAmount} عملة`,
              timestamp: 'الآن',
              isRead: false
          });

          addToast(`تم إرسال ${gift.name} بنجاح!`, 'success');
      }
  };

  const handleCreatePage = (page: Page) => {
      if (!currentUser) return;
      const updatedPages = db.savePage(page);
      setPages(updatedPages);
      addToast('تم إنشاء الصفحة بنجاح! 🎉', 'success');
  };

  const handlePromotePage = (pageId: string, cost: number) => {
      if (!currentUser || currentUser.coins < cost) return;
      
      const updatedPages = pages.map(p => p.id === pageId ? { ...p, isPromoted: true } : p);
      setPages(updatedPages);
      db.updatePages(updatedPages);

      const updatedUser = { ...currentUser, coins: currentUser.coins - cost };
      db.updateUser(updatedUser);
      setCurrentUser(updatedUser);
      addToast('تم ترويج الصفحة بنجاح! 🚀', 'success');
  };

  const handlePurchase = (item: StoreItem) => {
      if (!currentUser) return;
      
      const updatedUser = {
          ...currentUser,
          coins: currentUser.coins - item.price,
          inventory: [...(currentUser.inventory || []), item.id]
      };
      
      if (item.type === 'verification') {
          updatedUser.isVerified = true;
          if (item.id === 'ver_gold') updatedUser.verificationTier = 'gold';
          else updatedUser.verificationTier = 'blue';
      }
      if (item.type === 'frame') updatedUser.activeFrame = item.id;

      db.updateUser(updatedUser);
      setCurrentUser(updatedUser);
      addToast(`مبروك! تم شراء ${item.name} وتفعيله بنجاح 🎉`, 'success');
  };

  const handleJoinTribe = (tribeId: string) => {
      if(!currentUser) return;
      const updatedUser = { ...currentUser, tribeId };
      db.updateUser(updatedUser);
      setCurrentUser(updatedUser);
      addToast('تم الانضمام للقبيلة بنجاح! 🚩', 'success');
  };

  const handleMarkNotificationsRead = () => {
      if (currentUser) {
          db.markNotificationsRead(currentUser.id);
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
  };

  // --- Admin Actions ---
  const handleUpdateBots = (updatedBots: BotConfig[], speed = 1, prioritizeVerified = true) => {
      setBots(updatedBots);
      db.updateBots(updatedBots);
      botEngineConfig.current = { speed, prioritizeVerified, batchSize: Math.ceil(5 * speed) };
      addToast('تم تحديث إعدادات البوتات', 'info');
  };

  const handleVerifyUser = (userId: string, tier: 'blue' | 'gold' = 'blue') => {
      const targetUser = users.find(u => u.id === userId);
      if (targetUser) {
          const updatedUser = { ...targetUser, isVerified: true, verificationTier: tier };
          const newUsersList = db.updateUser(updatedUser);
          setUsers(newUsersList);
          
          setVerificationRequests(prev => prev.filter(id => id !== userId));
          
          db.saveNotification({
              id: Date.now().toString(),
              userId: targetUser.id,
              sender: currentUser!, 
              type: 'verify',
              text: `تم توثيق حسابك بالعلامة ${tier === 'gold' ? 'الذهبية' : 'الزرقاء'}!`,
              timestamp: 'الآن',
              isRead: false
          });
          addToast(`تم توثيق حساب ${targetUser.name} (${tier === 'gold' ? 'ذهبي' : 'أزرق'})`, 'success');
      }
  };

  const handleDeleteUser = (userId: string) => {
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('nabd_users_db_v1', JSON.stringify(updatedUsers)); 
      setUsers(db.getUsers());
      addToast('تم حذف المستخدم', 'error');
  };

  const handleAddUserAdmin = (userData: Partial<User>) => {
      try {
          const newUser: User = {
              id: `u_${Date.now()}`,
              name: userData.name || 'عضو جديد',
              username: userData.username || `user_${Date.now()}`,
              password: userData.password || '123456',
              role: userData.role || 'user',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'New')}&background=random`,
              isVerified: false,
              coins: userData.coins || 100,
              followers: 0,
              following: 0,
              followingIds: [],
              level: 1,
              xp: 0
          };
          const updatedUsers = db.saveUser(newUser);
          setUsers(updatedUsers);
          addToast('تم إضافة العضو بنجاح', 'success');
      } catch (error: any) {
          addToast(error.message || 'حدث خطأ', 'error');
      }
  };

  const handleDeletePost = (postId: string) => {
      const updatedPosts = posts.filter(p => p.id !== postId);
      setPosts(updatedPosts);
      db.updatePosts(updatedPosts);
      addToast('تم حذف المنشور', 'error');
  };

  const handleUpdateUserAdmin = (updatedUser: User) => {
      db.updateUser(updatedUser);
      setUsers(db.getUsers());
      addToast('تم تحديث بيانات المستخدم', 'success');
  };

  const handleBoostTarget = (targetId: string, amount: number, type: 'like' | 'view') => {
      addToast(`جاري بدء عملية الرشق... (${amount} ${type === 'like' ? 'لايك' : 'مشاهدة'})`, 'info');
      setTimeout(() => {
          if (type === 'like') {
              const updatedPosts = posts.map(p => {
                  if (p.id === targetId) {
                      return { ...p, likes: p.likes + amount };
                  }
                  return p;
              });
              setPosts(updatedPosts);
              db.updatePosts(updatedPosts);
          }
          addToast('تم تنفيذ عملية الرشق بنجاح! 🚀', 'success');
      }, 3000);
  };

  const handleLoadMore = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const basePosts = db.getPosts().slice(0, 5); 
      const newPosts = basePosts.map((p, i) => ({
          ...p,
          id: `p_older_${Date.now()}_${i}`,
          timestamp: 'منذ يومين',
          likes: Math.floor(Math.random() * 500) + 50,
          content: p.content + ' (أرشيف)'
      }));
      const updated = [...posts, ...newPosts];
      setPosts(updated);
  };

  const handleRefresh = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const currentPosts = [...posts];
      for (let i = currentPosts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [currentPosts[i], currentPosts[j]] = [currentPosts[j], currentPosts[i]];
      }
      setPosts(currentPosts);
  };

  // --- BOT ENGINE (Simulated) ---
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
        const currentBots = db.getBots().filter(b => b.isActive);
        if (currentBots.length === 0) return;

        const currentPosts = postsRef.current;
        const currentU = currentUserRef.current;
        const batchSize = botEngineConfig.current.batchSize;
        
        const activeBots = [];
        for(let i=0; i<batchSize; i++) {
            activeBots.push(currentBots[Math.floor(Math.random() * currentBots.length)]);
        }

        const updatedPosts = [...currentPosts];
        let hasChanges = false;

        activeBots.forEach(bot => {
            let targetPost;
            if (botEngineConfig.current.prioritizeVerified) {
               const verifiedPosts = currentPosts.filter(p => p.user.isVerified);
               if (verifiedPosts.length > 0 && Math.random() > 0.3) {
                   targetPost = verifiedPosts[Math.floor(Math.random() * verifiedPosts.length)];
               }
            }
            
            if (!targetPost) {
                targetPost = currentPosts[Math.floor(Math.random() * currentPosts.length)];
            }

            if (!targetPost) return;

            const postTime = parseInt(targetPost.id.replace(/\D/g, '').substring(0, 13)); 
            if (!isNaN(postTime) && (Date.now() - postTime < 10000)) {
                return;
            }

            const postIndex = updatedPosts.findIndex(p => p.id === targetPost.id);
            if (postIndex === -1) return;

            if (bot.autoLike && Math.random() > 0.5) {
                updatedPosts[postIndex] = {
                    ...updatedPosts[postIndex],
                    likes: updatedPosts[postIndex].likes + 1
                };
                hasChanges = true;

                if (currentU && targetPost.userId === currentU.id) {
                    const notif: Notification = {
                        id: `sys_l_${Date.now()}_${bot.id}`,
                        userId: currentU.id,
                        sender: { ...currentU, name: bot.name, avatar: bot.avatar, id: bot.id, isVerified: false, role: 'bot', username: bot.username, coins:0, followers:0, following:0 }, 
                        type: 'like',
                        postId: targetPost.id,
                        text: 'أعجب بمنشورك',
                        timestamp: 'الآن',
                        isRead: false
                    };
                    
                    if (Math.random() > 0.7) {
                        db.saveNotification(notif);
                        setNotifications(prev => [notif, ...prev]);
                    }
                }
            }
        });

        if (hasChanges) {
            setPosts(updatedPosts);
        }

    }, 2000 / botEngineConfig.current.speed);

    return () => clearInterval(interval);
  }, [isLoggedIn]);


  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} error={loginError} />;
  }

  if (!currentUser) return null;

  return (
    <AppShell 
      currentView={currentView} 
      onChangeView={handleChangeView} 
      isDark={isDark} 
      toggleTheme={toggleTheme}
      currentUser={currentUser}
      unreadNotifications={notifications.filter(n => !n.isRead).length}
      onLogout={handleLogout}
    >
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {currentView === 'feed' && (
        <Feed 
          posts={posts} 
          stories={stories}
          onAddStory={handleAddStory}
          onAddComment={handleAddComment} 
          onPost={handleAddPost}
          currentUser={currentUser} 
          onUnlockPost={handleUnlockPost}
          onVote={handleVote}
          onViewProfile={handleViewProfile}
          onSendGift={handleSendGift}
          onNavigateToStore={() => setCurrentView('store')}
          onLike={handleLike}
          onFollow={handleFollow}
          onLoadMore={handleLoadMore}
          onRefresh={handleRefresh}
        />
      )}
      
      {/* ... Other Views (create, pages, admin, etc) ... */}
      {currentView === 'create' && <CreatePost onPost={handleAddPost} userPages={pages.filter(p => p.id)} currentUser={currentUser} />}
      {currentView === 'pages' && <PagesView pages={pages} posts={posts} onCreatePage={handleCreatePage} currentUser={currentUser} onPromotePage={handlePromotePage} onLike={handleLike} onAddComment={handleAddComment} onUnlockPost={handleUnlockPost} onFollow={handleFollow} />}
      {currentView === 'admin' && (currentUser.role === 'admin' ? <AdminDashboard currentUser={currentUser} users={users} posts={posts} verificationRequests={verificationRequests} bots={bots} onUpdateBots={handleUpdateBots} onVerifyUser={handleVerifyUser} onRejectVerification={(id) => setVerificationRequests(prev => prev.filter(r => r !== id))} onDeleteUser={handleDeleteUser} onDeletePost={handleDeletePost} onUpdateUser={handleUpdateUserAdmin} onBoostTarget={handleBoostTarget} onAddUser={handleAddUserAdmin} /> : <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-fadeIn"><div className="bg-red-100 dark:bg-red-900/20 p-6 rounded-full mb-4"><Icons.Lock size={48} className="text-red-500" /></div><h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">منطقة محظورة</h2><button onClick={() => setCurrentView('feed')} className="mt-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-bold shadow-lg">العودة للرئيسية</button></div>)}
      {currentView === 'profile' && <Profile posts={posts} user={viewingUser || currentUser} currentUser={currentUser} onRequestVerify={() => setVerificationRequests(prev => [...prev, currentUser.id])} onUpdateUser={(u) => { db.updateUser(u); setCurrentUser(u); addToast('تم حفظ التعديلات', 'success'); }} onBack={viewingUser ? () => { setViewingUser(null); setCurrentView('feed'); } : undefined} onLogout={handleLogout} onFollow={handleFollow} onLike={handleLike} />}
      {currentView === 'chat' && <Chat currentUser={currentUser} users={users} />}
      {currentView === 'leaderboard' && <Leaderboard users={users} currentUser={currentUser} onViewProfile={handleViewProfile} />}
      {currentView === 'store' && <StoreView currentUser={currentUser} onPurchase={handlePurchase} />}
      {currentView === 'explore' && <ExploreView posts={posts} users={users} onAddComment={handleAddComment} onViewProfile={handleViewProfile} />}
      {currentView === 'notifications' && <NotificationsView notifications={notifications} onMarkRead={handleMarkNotificationsRead} onFollow={handleFollow} />}
      {currentView === 'video' && <VideoFeed posts={posts} onAddComment={handleAddComment} onLike={handleLike} onFollow={handleFollow} />}
      {currentView === 'tribes' && <TribesView currentUser={currentUser} onJoinTribe={handleJoinTribe} />}
      {currentView === 'majlis' && <MajlisView />}
      {currentView === 'studio' && <CreatorStudio />}
      {currentView === 'map' && <MapView />}

    </AppShell>
  );
};

export default App;
