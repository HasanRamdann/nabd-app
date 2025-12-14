
export interface Achievement {
  id: string;
  icon: 'award' | 'star' | 'zap' | 'shield' | 'trend';
  title: string;
  description: string;
}

export interface Page {
  id: string;
  name: string;
  handle: string;
  category: string;
  followers: number;
  growth: number;
  color: string;
  description?: string;
  isPromoted?: boolean; 
}

export interface Tribe {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  totalXp: number;
  rank: number;
  logo: string;
  color: string;
}

export interface AudioRoom {
  id: string;
  title: string;
  host: User;
  listeners: number;
  speakers: User[];
  category: string;
  isLive: boolean;
}

export interface StoreItem {
  id: string;
  type: 'verification' | 'frame' | 'boost' | 'feature' | 'clothing' | 'watch' | 'electronics';
  name: string;
  description: string;
  price: number;
  icon: any;
  color: string;
  purchased?: boolean;
}

export interface AdminPermissions {
  manageUsers: boolean;   // Can edit, delete, verify users
  manageContent: boolean; // Can delete posts, moderate
  manageSystem: boolean;  // Can control bots, settings
  viewAnalytics: boolean; // Can view dashboard stats
}

export interface SystemSettings {
  blueTickPrice: number;
  goldTickPrice: number;
  verificationDescription: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  avatar: string;
  isVerified: boolean;
  verificationTier?: 'blue' | 'gold'; // New: Verification Level
  bio?: string;
  coins: number;
  followers: number;
  following: number;
  followingIds?: string[]; // Array of user IDs that this user follows
  role: 'user' | 'admin' | 'creator' | 'bot'; 
  adminPermissions?: AdminPermissions; 
  canBoost?: boolean; // New: Permission to use bot boosting (Rashq)
  level?: number; 
  xp?: number; 
  bioVideo?: string; 
  achievements?: Achievement[]; 
  inventory?: string[]; 
  activeFrame?: string; 
  tribeId?: string; 
  unlockedPosts?: string[]; 
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
  replies?: Comment[];
  audio?: string; // Base64 or URL
  audioDuration?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  
  // Media
  image?: string;       
  images?: string[];    
  video?: string;
  audio?: string;
  
  // Interactive Content
  pollOptions?: PollOption[];
  totalVotes?: number;
  userVotedOptionId?: string;

  likes: number;
  commentsCount: number; 
  comments: Comment[]; 
  shares: number;
  timestamp: string;
  
  isAI?: boolean;
  type?: 'post' | 'reel' | 'moment' | 'audio' | 'poll' | 'carousel';
  
  isLiked?: boolean; 
  currentReaction?: ReactionType | null; 
  
  isSaved?: boolean; 
  audioDuration?: string; 
  isPromoted?: boolean;
  
  // Premium Features
  isLocked?: boolean;
  unlockPrice?: number;
  location?: string; 
}

export interface Story {
  id: string;
  user: User;
  image: string;
  isViewed: boolean;
  views: number; // Added views property
}

export interface BotConfig {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isActive: boolean;
  autoLike: boolean;
  autoComment: boolean;
  personality: string;
  targetKeywords: string; 
  excludedKeywords: string; 
  minInterval: number; 
  maxInterval: number; 
  lastActionTime?: number; 
  totalInteractions: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatSession {
  userId: string; 
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export interface Notification {
  id: string;
  userId: string;
  sender: User;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system' | 'verify' | 'gift';
  text?: string;
  postId?: string;
  timestamp: string;
  isRead: boolean;
}

export type ViewState = 'login' | 'feed' | 'explore' | 'create' | 'profile' | 'admin' | 'chat' | 'pages' | 'leaderboard' | 'store' | 'notifications' | 'video' | 'tribes' | 'majlis' | 'studio' | 'map';

export interface ChartData {
  name: string;
  value: number;
}