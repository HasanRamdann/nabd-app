
import { User, Post, BotConfig, Page, Notification, SystemSettings } from '../types';
import { MOCK_USERS, MOCK_POSTS, INITIAL_BOTS, MOCK_PAGES } from '../constants';

const KEYS = {
  USERS: 'nabd_users_db_v1',
  POSTS: 'nabd_posts_db_v1',
  BOTS: 'nabd_bots_config_v1',
  PAGES: 'nabd_pages_db_v1',
  NOTIFICATIONS: 'nabd_notifications_db_v1', 
  CURRENT_SESSION: 'nabd_session_user',
  SETTINGS: 'nabd_system_settings_v1'
};

// --- Helpers ---
const getFromStorage = <T>(key: string, initialValue: T): T => {
  if (typeof window === 'undefined') return initialValue;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Error parsing key ${key}`, e);
    }
  }
  // Initialize storage if empty
  localStorage.setItem(key, JSON.stringify(initialValue));
  return initialValue;
};

const saveToStorage = <T>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

// --- Database Services ---

export const db = {
  // Users
  getUsers: (): User[] => {
    return getFromStorage<User[]>(KEYS.USERS, MOCK_USERS);
  },
  
  saveUser: (newUser: User): User[] => {
    const users = db.getUsers();
    if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
      throw new Error('اسم المستخدم موجود بالفعل');
    }
    const updatedUsers = [...users, newUser];
    saveToStorage(KEYS.USERS, updatedUsers);
    return updatedUsers;
  },

  updateUser: (updatedUser: User): User[] => {
    const users = db.getUsers();
    const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    saveToStorage(KEYS.USERS, newUsers);
    
    // Update posts user info as well to keep sync
    const posts = db.getPosts();
    const updatedPosts = posts.map(p => p.userId === updatedUser.id ? { ...p, user: updatedUser } : p);
    saveToStorage(KEYS.POSTS, updatedPosts);

    // CRITICAL FIX: Update Session if the updated user is the current session user
    // This ensures that coin deductions, polls, and unlocked posts are persisted immediately
    const currentSessionStr = typeof window !== 'undefined' ? localStorage.getItem(KEYS.CURRENT_SESSION) : null;
    if (currentSessionStr) {
        try {
            const sessionUser = JSON.parse(currentSessionStr);
            if (sessionUser && sessionUser.id === updatedUser.id) {
                saveToStorage(KEYS.CURRENT_SESSION, updatedUser);
            }
        } catch (e) {
            console.error("Error updating session", e);
        }
    }
    
    return newUsers;
  },

  // --- Follow System ---
  followUser: (currentUserId: string, targetUserId: string): { updatedCurrentUser: User, updatedTargetUser: User } | null => {
    const users = db.getUsers();
    const currentUserIdx = users.findIndex(u => u.id === currentUserId);
    const targetUserIdx = users.findIndex(u => u.id === targetUserId);

    if (currentUserIdx === -1 || targetUserIdx === -1) return null;

    const currentUser = users[currentUserIdx];
    const targetUser = users[targetUserIdx];

    // Already following?
    if (currentUser.followingIds?.includes(targetUserId)) return null;

    // Update Current User
    const updatedCurrentUser = {
        ...currentUser,
        following: (currentUser.following || 0) + 1,
        followingIds: [...(currentUser.followingIds || []), targetUserId]
    };

    // Update Target User
    const updatedTargetUser = {
        ...targetUser,
        followers: (targetUser.followers || 0) + 1
    };

    // Save Logic (Calls updateUser to ensure sync)
    db.updateUser(updatedCurrentUser);
    db.updateUser(updatedTargetUser);

    return { updatedCurrentUser, updatedTargetUser };
  },

  unfollowUser: (currentUserId: string, targetUserId: string): { updatedCurrentUser: User, updatedTargetUser: User } | null => {
    const users = db.getUsers();
    const currentUserIdx = users.findIndex(u => u.id === currentUserId);
    const targetUserIdx = users.findIndex(u => u.id === targetUserId);

    if (currentUserIdx === -1 || targetUserIdx === -1) return null;

    const currentUser = users[currentUserIdx];
    const targetUser = users[targetUserIdx];

    // Not following?
    if (!currentUser.followingIds?.includes(targetUserId)) return null;

    // Update Current User
    const updatedCurrentUser = {
        ...currentUser,
        following: Math.max(0, (currentUser.following || 0) - 1),
        followingIds: (currentUser.followingIds || []).filter(id => id !== targetUserId)
    };

    // Update Target User
    const updatedTargetUser = {
        ...targetUser,
        followers: Math.max(0, (targetUser.followers || 0) - 1)
    };

    // Save Logic
    db.updateUser(updatedCurrentUser);
    db.updateUser(updatedTargetUser);

    return { updatedCurrentUser, updatedTargetUser };
  },

  // Posts
  getPosts: (): Post[] => {
    return getFromStorage<Post[]>(KEYS.POSTS, MOCK_POSTS);
  },

  savePost: (newPost: Post): Post[] => {
    const posts = db.getPosts();
    const updatedPosts = [newPost, ...posts];
    saveToStorage(KEYS.POSTS, updatedPosts);
    return updatedPosts;
  },

  updatePosts: (updatedPosts: Post[]) => {
    saveToStorage(KEYS.POSTS, updatedPosts);
  },

  // Bots
  getBots: (): BotConfig[] => {
    return getFromStorage<BotConfig[]>(KEYS.BOTS, INITIAL_BOTS);
  },

  updateBots: (bots: BotConfig[]) => {
    saveToStorage(KEYS.BOTS, bots);
  },

  // Pages
  getPages: (): Page[] => {
    return getFromStorage<Page[]>(KEYS.PAGES, MOCK_PAGES);
  },

  savePage: (newPage: Page): Page[] => {
    const pages = db.getPages();
    const updatedPages = [...pages, newPage];
    saveToStorage(KEYS.PAGES, updatedPages);
    return updatedPages;
  },

  updatePages: (updatedPages: Page[]) => {
    saveToStorage(KEYS.PAGES, updatedPages);
  },

  // Notifications
  getNotifications: (): Notification[] => {
    return getFromStorage<Notification[]>(KEYS.NOTIFICATIONS, []);
  },

  saveNotification: (notif: Notification) => {
    const notifications = db.getNotifications();
    const updated = [notif, ...notifications].slice(0, 100); // Keep last 100
    saveToStorage(KEYS.NOTIFICATIONS, updated);
  },

  markNotificationsRead: (userId: string): Notification[] => {
    const notifications = db.getNotifications();
    const updated = notifications.map(n => n.userId === userId ? { ...n, isRead: true } : n);
    saveToStorage(KEYS.NOTIFICATIONS, updated);
    return updated;
  },

  // System Settings
  getSystemSettings: (): SystemSettings => {
    return getFromStorage<SystemSettings>(KEYS.SETTINGS, {
        blueTickPrice: 5000,
        goldTickPrice: 15000,
        verificationDescription: 'احصل على الموثوقية والمزيد من الظهور في المنصة.'
    });
  },

  saveSystemSettings: (settings: SystemSettings) => {
    saveToStorage(KEYS.SETTINGS, settings);
  },

  // Auth
  login: (username: string, pass: string): User | null => {
    const users = db.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === pass);
    if (user) {
      saveToStorage(KEYS.CURRENT_SESSION, user);
      return user;
    }
    return null;
  },

  getSession: (): User | null => {
    return getFromStorage<User | null>(KEYS.CURRENT_SESSION, null);
  },

  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem(KEYS.CURRENT_SESSION);
  }
};