
import { Post, Story, User, BotConfig, Page, Tribe, AudioRoom } from './types';

// --- Utility Functions ---
export const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
};

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Hasan Ramdan',
  username: 'admin',
  password: '123',
  avatar: 'https://e.top4top.io/p_36333l5qq1.jpg', 
  isVerified: true,
  bio: 'مؤسس المنصة | المدير العام 🛡️',
  coins: 5000000,
  followers: 9900000,
  following: 10,
  followingIds: [],
  role: 'admin',
  // Full permissions for the main admin
  adminPermissions: {
    manageUsers: true,
    manageContent: true,
    manageSystem: true,
    viewAnalytics: true
  },
  level: 100,
  xp: 9990,
  achievements: [
    { id: 'a1', icon: 'shield', title: 'الأمان', description: 'حساب مشرف موثق' },
    { id: 'a2', icon: 'zap', title: 'السرعة', description: 'أداء عالي' },
  ],
  tribeId: 't1',
  unlockedPosts: []
};

// --- Generated Realistic Users (Base Users) ---
export const REALISTIC_USERS: User[] = [
  { id: 'u2', name: 'د. هدى العمر', username: 'dr_huda', password: '123', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&fit=crop', isVerified: true, bio: 'طبيبة أطفال 🩺 | مهتمة بصحة الطفل والأسرة', coins: 1200, followers: 45000, following: 120, followingIds: [], role: 'user', level: 12, xp: 400 },
  { id: 'u3', name: 'الشيف عمر', username: 'chef_omar', password: '123', avatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&fit=crop', isVerified: false, bio: 'أطبخ بحب 🍳 | وصفات شرقية وغربية', coins: 300, followers: 8900, following: 300, followingIds: [], role: 'user', level: 5, xp: 150 },
  { id: 'u4', name: 'ليلى المصممة', username: 'layla_des', password: '123', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&fit=crop', isVerified: true, bio: 'UX/UI Designer 🎨 | أشارك أعمالي وتصاميمي', coins: 800, followers: 15200, following: 400, followingIds: [], role: 'user', level: 8, xp: 320 },
  { id: 'u5', name: 'ياسر جيمر', username: 'yasser_play', password: '123', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&fit=crop', isVerified: false, bio: 'بث مباشر كل يوم 🎮 | PUBG & FIFA', coins: 150, followers: 3200, following: 50, followingIds: [], role: 'user', level: 3, xp: 80 },
  { id: 'u6', name: 'سارة القحطاني', username: 'sara_q', password: '123', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&fit=crop', isVerified: false, bio: 'يوميات طالبة طب 📚', coins: 200, followers: 1200, following: 200, followingIds: [], role: 'user', level: 2, xp: 60 },
  { id: 'u7', name: 'فهد التقني', username: 'fahad_tech', password: '123', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&fit=crop', isVerified: true, bio: 'مراجعات أجهزة وهواتف ذكية 📱', coins: 2500, followers: 67000, following: 10, followingIds: [], role: 'user', level: 15, xp: 800 },
  { id: 'u8', name: 'نورة لايف ستايل', username: 'noura_life', password: '123', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&fit=crop', isVerified: false, bio: 'أزياء | جمال | سفر ✈️', coins: 400, followers: 22000, following: 150, followingIds: [], role: 'user', level: 6, xp: 200 },
  { id: 'u9', name: 'كابتن ماجد', username: 'majed_fit', password: '123', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&fit=crop', isVerified: false, bio: 'مدرب شخصي 💪 | نصائح تغذية', coins: 350, followers: 5600, following: 80, followingIds: [], role: 'user', level: 4, xp: 120 },
  { id: 'u10', name: 'المسافر العربي', username: 'arab_traveler', password: '123', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop', isVerified: true, bio: 'أكتشف العالم 🌍', coins: 1500, followers: 33000, following: 90, followingIds: [], role: 'user', level: 10, xp: 550 },
  { id: 'u11', name: 'ريم الرسامة', username: 'reem_art', password: '123', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop', isVerified: false, bio: 'أرسم بالألوان الزيتية 🖌️', coins: 220, followers: 4100, following: 300, followingIds: [], role: 'user', level: 3, xp: 90 },
  { id: 'u12', name: 'أحمد المبرمج', username: 'ahmed_dev', password: '123', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&fit=crop', isVerified: false, bio: 'Full Stack Dev 💻', coins: 600, followers: 2800, following: 400, followingIds: [], role: 'user', level: 5, xp: 180 },
  { id: 'u13', name: 'عشاق الكتب', username: 'books_lover', password: '123', avatar: 'https://images.unsplash.com/photo-1491349174775-aaafddd81942?w=400&fit=crop', isVerified: false, bio: 'اقتباسات ومراجعات كتب 📖', coins: 180, followers: 9500, following: 20, followingIds: [], role: 'user', level: 4, xp: 130 },
  { id: 'u14', name: 'فيصل العقاري', username: 'faisal_home', password: '123', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&fit=crop', isVerified: true, bio: 'مستشار عقاري بالرياض 🏘️', coins: 900, followers: 11000, following: 500, followingIds: [], role: 'user', level: 7, xp: 250 },
  { id: 'u15', name: 'عالم السيارات', username: 'cars_world', password: '123', avatar: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&fit=crop', isVerified: false, bio: 'تغطية معارض السيارات 🏎️', coins: 450, followers: 18000, following: 60, followingIds: [], role: 'user', level: 6, xp: 210 },
  { id: 'u16', name: 'منى الميكب', username: 'mona_mua', password: '123', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&fit=crop', isVerified: false, bio: 'Makeup Artist 💄', coins: 330, followers: 7500, following: 220, followingIds: [], role: 'user', level: 4, xp: 140 },
  { id: 'u17', name: 'سلطان الكوميدي', username: 'sultan_fun', password: '123', avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&fit=crop', isVerified: true, bio: 'مقاطع مضحكة وسكتشات 😂', coins: 3000, followers: 150000, following: 10, followingIds: [], role: 'user', level: 20, xp: 1500 },
  { id: 'u18', name: 'المهندس طارق', username: 'tariq_eng', password: '123', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&fit=crop', isVerified: false, bio: 'هندسة معمارية وتصميم داخلي 📐', coins: 550, followers: 6200, following: 110, followingIds: [], role: 'user', level: 5, xp: 190 },
  { id: 'u19', name: 'نادي السينما', username: 'cinema_club', password: '123', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&fit=crop', isVerified: false, bio: 'توصيات أفلام ومسلسلات 🎬', coins: 280, followers: 14000, following: 40, followingIds: [], role: 'user', level: 5, xp: 160 },
  { id: 'u20', name: 'عشاق القطط', username: 'cats_fans', password: '123', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&fit=crop', isVerified: false, bio: 'صور ومقاطع لطيفة للقطط 🐱', coins: 400, followers: 25000, following: 0, followingIds: [], role: 'user', level: 6, xp: 220 },
];

export const MOCK_USERS: User[] = [CURRENT_USER, ...REALISTIC_USERS];

// --- EXTENDED DATA FOR REALISTIC GENERATION ---
export const MALE_NAMES = [
    'محمد', 'أحمد', 'علي', 'عمر', 'خالد', 'عبدالله', 'يوسف', 'إبراهيم', 'سعد', 'فهد',
    'سلمان', 'عبدالعزيز', 'فيصل', 'تركي', 'بدر', 'ناصر', 'راشد', 'ماجد', 'سلطان', 'نواف',
    'وليد', 'طارق', 'زياد', 'سامي', 'مشاري', 'معاذ', 'يزيد', 'هشام', 'حاتم', 'فراس',
    'باسل', 'ريان', 'أنس', 'حمزة', 'أسامة', 'عمار', 'أيمن', 'مهند', 'كريم', 'جاسم',
    'حمد', 'خليفة', 'زايد', 'منصور', 'سعيد', 'مبارك', 'سالم', 'غانم', 'مروان', 'عادل'
];

export const FEMALE_NAMES = [
    'سارة', 'نورة', 'ريم', 'منى', 'فاطمة', 'عائشة', 'مريم', 'زينب', 'لجين', 'هند',
    'أمل', 'مها', 'ندى', 'العنود', 'الجوهرة', 'دانة', 'شهد', 'غيداء', 'روان', 'ليان',
    'جود', 'لمى', 'حلا', 'رغد', 'بيان', 'أسماء', 'خديجة', 'سمية', 'دلال', 'منال',
    'هديل', 'سعاد', 'نوال', 'بشاير', 'أروى', 'تغريد', 'جميلة', 'لطيفة', 'هياء', 'وفاء',
    'مي', 'يارا', 'سلمى', 'لمياء', 'نوف', 'وضحى', 'شيخة', 'ميثاء', 'علياء', 'فجر'
];

export const LAST_NAMES = [
    'السعيد', 'الغامدي', 'العتيبي', 'القحطاني', 'العمري', 'الحربي', 'الدوسري', 'المطيري', 'العازمي', 'الشمري',
    'العنزي', 'المالكي', 'الزهراني', 'الشهري', 'السبيعي', 'الخالدي', 'التميمي', 'الرشيدي', 'الحارثي', 'العسيري',
    'اليامي', 'الشهراني', 'النجار', 'الحداد', 'كامل', 'حسن', 'إسماعيل', 'جمعة', 'عبدالرحمن', 'صالح',
    'المنصوري', 'الفلاسي', 'النعيمي', 'الظاهري', 'الكتبي', 'العامري', 'المري', 'الهلالي', 'الصباح', 'آل نهيان'
];

export const JOB_TITLES = [
    'مهندس برمجيات', 'طبيب عام', 'معلم', 'مصمم جرافيك', 'محاسب', 'مدير مبيعات', 'طالب جامعي', 'رائد أعمال',
    'مسوق رقمي', 'كاتب محتوى', 'صيدلي', 'مدرب رياضي', 'محامي', 'مصور فوتوغرافي', 'مهندس مدني', 'ممرض',
    'مترجم', 'مدون', 'صانع محتوى', 'تاجر', 'موظف حكومي', 'فنان تشكيلي', 'مخرج', 'مذيع', 'طيار'
];

export const BIO_QUOTES = [
    'أحب الحياة والقهوة ☕️', 'مهتم بالتقنية والمستقبل 🚀', 'عشقي للسفر لا ينتهي ✈️', ' قارئ نهم 📚',
    'مصمم يصنع الجمال 🎨', 'طموحي يعانق السماء ✨', 'أبحث عن الهدوء في عالم صاخب', 'كرة القدم هي حياتي ⚽️',
    'أمي هي جنتي ❤️', 'صانع محتوى بسيط', 'لا شيء مستحيل', 'كن أنت التغيير الذي تريده',
    'النجاح رحلة وليس وجهة', 'متذوق للشعر والأدب 🖋️', 'جيمر محترف 🎮'
];

// --- MASSIVE BOT GENERATION ---
const generateBots = (count: number): BotConfig[] => {
  const bots: BotConfig[] = [];
  
  REALISTIC_USERS.forEach(u => {
    bots.push({
      id: u.id,
      name: u.name,
      username: u.username,
      avatar: u.avatar,
      isActive: true,
      autoLike: true,
      autoComment: Math.random() > 0.6,
      personality: u.bio || 'تفاعلي',
      targetKeywords: '',
      excludedKeywords: '',
      minInterval: 10,
      maxInterval: 60,
      totalInteractions: 0,
      lastActionTime: 0
    });
  });

  const remaining = count - bots.length;
  for (let i = 0; i < remaining; i++) {
     const isMale = Math.random() > 0.5;
     const firstName = isMale 
        ? MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)] 
        : FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)];
     const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
     const name = `${firstName} ${lastName}`;
     const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Math.floor(Math.random() * 9999)}`;
     
     bots.push({
       id: `bot_${i}`,
       name: name,
       username: username,
       avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`,
       isActive: true,
       autoLike: true,
       autoComment: Math.random() > 0.9,
       personality: 'داعم',
       targetKeywords: '',
       excludedKeywords: '',
       minInterval: 5,
       maxInterval: 300,
       totalInteractions: 0,
       lastActionTime: 0
     });
  }
  return bots;
};

export const INITIAL_BOTS: BotConfig[] = generateBots(7582);

export const MOCK_PAGES: Page[] = [
  { id: 'pg1', name: 'عشاق القهوة', handle: '@coffee_lovers', category: 'مجتمع', followers: 12500, growth: 12, color: 'bg-amber-700', description: 'كل ما يخص القهوة المختصة.' },
  { id: 'pg2', name: 'تصاميم عصرية', handle: '@modern_art', category: 'فن وتصميم', followers: 8200, growth: 5, color: 'bg-pink-600', description: 'إلهام يومي للمصممين.' },
  { id: 'pg3', name: 'أخبار التقنية', handle: '@tech_news', category: 'تكنولوجيا', followers: 25000, growth: 22, color: 'bg-blue-600', description: 'تغطية شاملة لأحدث التقنيات.' }
];

export const MOCK_STORIES: Story[] = [
  { id: 's1', user: REALISTIC_USERS[0], image: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=400&h=800&fit=crop', isViewed: false, views: 342 },
  { id: 's2', user: REALISTIC_USERS[2], image: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=400&h=800&fit=crop', isViewed: false, views: 1205 },
  { id: 's3', user: REALISTIC_USERS[8], image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=800&fit=crop', isViewed: true, views: 85 },
  { id: 's4', user: REALISTIC_USERS[6], image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=800&fit=crop', isViewed: false, views: 2400 },
];

export const MOCK_TRIBES: Tribe[] = [
    { id: 't1', name: 'نخبة المصممين', description: 'مجتمع يجمع أفضل المصممين العرب.', membersCount: 15400, totalXp: 85000, rank: 1, logo: '🎨', color: 'bg-pink-600' },
    { id: 't2', name: 'عشاق البرمجة', description: 'نكتب الكود لنصنع المستقبل.', membersCount: 12300, totalXp: 72000, rank: 2, logo: '💻', color: 'bg-blue-600' },
    { id: 't3', name: 'أبطال الجيمينج', description: 'مجتمع اللاعبين المحترفين.', membersCount: 22000, totalXp: 69000, rank: 3, logo: '🎮', color: 'bg-purple-600' },
    { id: 't4', name: 'رواد الأعمال', description: 'نناقش الأفكار والمشاريع.', membersCount: 8900, totalXp: 54000, rank: 4, logo: '💼', color: 'bg-emerald-600' },
];

export const MOCK_AUDIO_ROOMS: AudioRoom[] = [
    { id: 'room1', title: 'نقاش حول مستقبل الذكاء الاصطناعي', host: REALISTIC_USERS[5], listeners: 342, speakers: [REALISTIC_USERS[5], REALISTIC_USERS[10], REALISTIC_USERS[1]], category: 'تقنية', isLive: true },
    { id: 'room2', title: 'أمسية شعرية مفتوحة 📜', host: REALISTIC_USERS[11], listeners: 128, speakers: [REALISTIC_USERS[11], REALISTIC_USERS[4]], category: 'أدب', isLive: true },
    { id: 'room3', title: 'تحليل نهائي دوري الأبطال ⚽️', host: REALISTIC_USERS[3], listeners: 850, speakers: [REALISTIC_USERS[3], REALISTIC_USERS[7], REALISTIC_USERS[8]], category: 'رياضة', isLive: true },
];

export const MOCK_POSTS: Post[] = [
  // ... (keeping existing posts) ...
  {
      id: 'p_locked_1',
      userId: 'u4',
      user: REALISTIC_USERS[2],
      content: 'مشروع التصميم الجديد للهوية البصرية لشركة كبرى.. التفاصيل الكاملة وملفات المصدر متاحة للمشتركين فقط 🔒✨',
      image: 'https://images.unsplash.com/photo-1626785774573-4b799314348d?w=800&fit=crop',
      likes: 45,
      commentsCount: 12,
      shares: 0,
      timestamp: 'منذ ساعتين',
      comments: [],
      type: 'post',
      isLocked: true,
      unlockPrice: 50,
      location: 'الرياض، المملكة العربية السعودية'
  },
  {
    id: 'p_poll_1',
    userId: 'u7',
    user: REALISTIC_USERS[5],
    content: 'ما هو أفضل نظام تشغيل للموبايل برأيكم؟ 📱🤔',
    type: 'poll',
    pollOptions: [
      { id: 'opt1', text: 'iOS 🍎', votes: 150 },
      { id: 'opt2', text: 'Android 🤖', votes: 120 },
      { id: 'opt3', text: 'HarmonyOS 🌐', votes: 20 }
    ],
    totalVotes: 290,
    likes: 45,
    commentsCount: 30,
    shares: 5,
    timestamp: 'منذ 30 دقيقة',
    comments: [],
    isAI: false,
    location: 'دبي، الإمارات العربية المتحدة'
  },
  {
    id: 'p_carousel_1',
    userId: 'u10',
    user: REALISTIC_USERS[8],
    content: 'رحلتي إلى جزر المالديف.. جنة الله في أرضه! 🏝️🌊 #سفر #طبيعة',
    type: 'carousel',
    images: [
      'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&fit=crop',
      'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&fit=crop',
      'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800&fit=crop'
    ],
    likes: 3200,
    commentsCount: 150,
    shares: 400,
    timestamp: 'منذ ساعة',
    comments: [],
    isAI: false,
    location: 'جزر المالديف'
  },
  {
    id: 'p1', userId: 'u2', user: REALISTIC_USERS[0], 
    content: 'نصيحة طبية: لا تهمل شرب الماء بكميات كافية، خصوصاً في الصيف. 💧☀️ #صحة #نصائح',
    likes: 120, commentsCount: 5, shares: 10, timestamp: 'منذ ساعتين', comments: [], type: 'post'
  },
  {
    id: 'p2', userId: 'u3', user: REALISTIC_USERS[1], 
    content: 'اليوم طبخت كبسة على الطريقة التقليدية.. الريحة ولا غلطة! 😋🥘 مين يبي الوصفة؟',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop',
    likes: 850, commentsCount: 40, shares: 20, timestamp: 'منذ 4 ساعات', comments: [], type: 'post'
  },
  {
    id: 'p3', userId: 'u4', user: REALISTIC_USERS[2], 
    content: 'آخر تصاميمي لتطبيق جوال.. ركزت على البساطة والوضوح. رأيكم يهمني! 🎨📱',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&h=600&fit=crop',
    likes: 543, commentsCount: 15, shares: 45, timestamp: 'منذ يوم', comments: [], type: 'post'
  },
  {
    id: 'p4', userId: 'u10', user: REALISTIC_USERS[8], 
    content: 'منظر الغروب من جبال الألب.. سبحان الخالق. 🏔️✨ #سفر #طبيعة',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop',
    likes: 2100, commentsCount: 88, shares: 150, timestamp: 'منذ يومين', comments: [], type: 'post'
  },
  {
    id: 'p5', userId: 'u7', user: REALISTIC_USERS[5], 
    content: 'مراجعة سريعة للايفون الجديد.. هل يستحق الترقية؟ الفيديو كامل في البايو. 📱📹',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smart-phone-with-green-screen-mockup-43229-large.mp4',
    likes: 3400, commentsCount: 120, shares: 300, timestamp: 'منذ 5 ساعات', comments: [], type: 'reel'
  },
  {
    id: 'p6', userId: 'u13', user: REALISTIC_USERS[11], 
    content: '"القراءة هي تذكرة سفر لكل مكان دون أن تغادر مقعدك." 📚 ما هو كتابكم المفضل؟',
    likes: 400, commentsCount: 60, shares: 30, timestamp: 'منذ 3 ساعات', comments: [], type: 'post'
  },
  {
    id: 'p7', userId: 'u15', user: REALISTIC_USERS[13], 
    content: 'مرسيدس تكشف عن سيارتها الاختبارية الجديدة.. تصميم من المستقبل! 🏎️💨',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=600&fit=crop',
    likes: 900, commentsCount: 25, shares: 60, timestamp: 'منذ 6 ساعات', comments: [], type: 'post'
  },
  {
    id: 'p8', userId: 'u20', user: REALISTIC_USERS[18], 
    content: 'قطتي "لوزة" قررت تنام على اللابتوب وأنا أشتغل.. كيف أقنعها تقوم؟ 😹😽',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=600&fit=crop',
    likes: 5000, commentsCount: 200, shares: 500, timestamp: 'منذ ساعة', comments: [], type: 'post'
  },
  {
    id: 'p9', userId: 'u1', user: CURRENT_USER, 
    content: 'سعيد جداً بتفاعلكم في المنصة.. قريباً إطلاق ميزات جديدة ستذهلكم! 🚀🌟',
    likes: 1500, commentsCount: 100, shares: 50, timestamp: 'منذ 10 دقائق', comments: [], type: 'post'
  },
  {
    id: 'p10', userId: 'u9', user: REALISTIC_USERS[7], 
    content: 'تمرين الضغط (Push-up) هو الأفضل لتقوية الجزء العلوي من الجسم. ابدأ بـ 10 عدات يومياً. 💪🏋️',
    likes: 300, commentsCount: 10, shares: 5, timestamp: 'منذ 8 ساعات', comments: [], type: 'post'
  },
  {
    id: 'p11', userId: 'u11', user: REALISTIC_USERS[9], 
    content: 'رسمتي الأخيرة.. استغرقت مني 15 ساعة عمل. أتمنى تعجبكم 🎨🖼️',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb39279c0f?w=800&h=600&fit=crop',
    likes: 670, commentsCount: 45, shares: 22, timestamp: 'منذ يوم', comments: [], type: 'post'
  },
  {
    id: 'p12', userId: 'u17', user: REALISTIC_USERS[15], 
    content: 'لما تحاول تسوي دايت وأهلك طالبين شاورما.. 😭💔 #كوميديا #دايت',
    likes: 2200, commentsCount: 150, shares: 80, timestamp: 'منذ 30 دقيقة', comments: [], type: 'post'
  }
];

export const ADMIN_STATS = [
  { name: 'يناير', value: 1200 },
  { name: 'فبراير', value: 1900 },
  { name: 'مارس', value: 2400 },
  { name: 'أبريل', value: 3100 },
  { name: 'مايو', value: 3800 },
  { name: 'يونيو', value: 4600 },
  { name: 'يوليو', value: 5800 },
];
