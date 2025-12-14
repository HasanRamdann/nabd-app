
import React, { useState, useEffect, useRef } from 'react';
import { User, Message, ChatSession } from '../types';
import * as Icons from './Icons';

interface ChatProps {
  currentUser: User;
  users: User[];
}

const MOCK_MESSAGES: Message[] = [
  { id: 'm1', senderId: 'u2', text: 'مرحباً! كيف حالك اليوم؟', timestamp: '10:30 ص', isRead: true },
  { id: 'm2', senderId: 'u1', text: 'أهلاً! أنا بخير، شكراً لسؤالك. ماذا عنك؟', timestamp: '10:32 ص', isRead: true },
  { id: 'm3', senderId: 'u2', text: 'بأفضل حال. هل رأيت التصميم الجديد للمنصة؟', timestamp: '10:33 ص', isRead: true },
  { id: 'm4', senderId: 'u1', text: 'نعم! يبدو رائعاً جداً وعصرياً.', timestamp: '10:35 ص', isRead: true },
];

const Chat: React.FC<ChatProps> = ({ currentUser, users }) => {
  // Filter out current user from contacts list
  const contacts = users.filter(u => u.id !== currentUser.id && u.role !== 'bot').slice(0, 10);
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChatId]);

  const activeUser = contacts.find(u => u.id === activeChatId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      text: inputText,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: 'numeric', minute: 'numeric' }),
      isRead: false
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate Reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        senderId: activeChatId,
        text: 'هذا رد تلقائي محاكي للمحادثة 😉',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: 'numeric', minute: 'numeric' }),
        isRead: false
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const selectChat = (userId: string) => {
    setActiveChatId(userId);
    setIsMobileListVisible(false);
  };

  return (
    <div className="fixed inset-0 pt-16 md:pt-24 pb-16 md:pb-6 px-0 md:px-6 z-30 bg-gray-50 dark:bg-[#020617] md:static md:h-[calc(100vh-100px)]">
      <div className="bg-white dark:bg-slate-900 w-full h-full md:rounded-3xl shadow-xl overflow-hidden flex border border-gray-100 dark:border-slate-800">
        
        {/* Contacts List (Sidebar) */}
        <div className={`w-full md:w-80 bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-slate-800 flex flex-col ${!isMobileListVisible ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 dark:border-slate-800">
             <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">الرسائل</h2>
             <div className="relative">
                <Icons.Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="بحث عن صديق..." 
                  className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
             {contacts.map(user => (
               <div 
                 key={user.id} 
                 onClick={() => selectChat(user.id)}
                 className={`p-4 flex items-center gap-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 ${activeChatId === user.id ? 'bg-primary-50 dark:bg-primary-900/10 border-r-4 border-primary-500' : ''}`}
               >
                  <div className="relative">
                     <img src={user.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
                     <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{user.name}</h4>
                        <span className="text-[10px] text-gray-400">10:30 ص</span>
                     </div>
                     <p className="text-xs text-gray-500 dark:text-gray-400 truncate">انقر لبدء المحادثة...</p>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-gray-50/50 dark:bg-[#0b1121] ${isMobileListVisible ? 'hidden md:flex' : 'flex'}`}>
           {activeUser ? (
             <>
               {/* Chat Header */}
               <div className="p-3 md:p-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center shadow-sm z-10">
                  <div className="flex items-center gap-3">
                     <button onClick={() => setIsMobileListVisible(true)} className="md:hidden text-gray-500 p-1">
                        <Icons.ArrowLeft className="rtl:rotate-180" />
                     </button>
                     <img src={activeUser.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                     <div>
                        <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-white flex items-center gap-1">
                           {activeUser.name}
                           {activeUser.isVerified && <Icons.ShieldCheck size={14} className="text-blue-500" />}
                        </h3>
                        <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                           <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> متصل الآن
                        </span>
                     </div>
                  </div>
                  <div className="flex gap-1 md:gap-3 text-primary-600">
                     <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"><Icons.Phone size={20} /></button>
                     <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"><Icons.Video size={20} /></button>
                     <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"><Icons.MoreVertical size={20} className="text-gray-400" /></button>
                  </div>
               </div>

               {/* Messages */}
               <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="text-center text-xs text-gray-400 my-4">اليوم</div>
                  {messages.map((msg, index) => {
                     const isMe = msg.senderId === currentUser.id;
                     return (
                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[80%] md:max-w-[70%] p-3 md:p-4 rounded-2xl relative shadow-sm ${
                              isMe 
                              ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-tl-none' 
                              : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-tr-none border border-gray-100 dark:border-slate-700'
                           }`}>
                              <p className="text-sm leading-relaxed">{msg.text}</p>
                              <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                                 {msg.timestamp}
                                 {isMe && <Icons.CheckCheck size={12} />}
                              </div>
                           </div>
                        </div>
                     );
                  })}
                  <div ref={messagesEndRef} />
               </div>

               {/* Input Area */}
               <div className="p-3 md:p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                     <button type="button" className="p-2 text-gray-400 hover:text-primary-500 transition-colors">
                        <Icons.PlusSquare size={24} />
                     </button>
                     <div className="flex-1 relative">
                        <input 
                          type="text" 
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="اكتب رسالة..." 
                          className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-full py-3 px-4 pl-10 text-sm focus:ring-2 focus:ring-primary-500 transition-all"
                        />
                        <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-500">
                           <Icons.Smile size={20} />
                        </button>
                     </div>
                     <button 
                       type="submit" 
                       disabled={!inputText.trim()}
                       className="p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:shadow-none"
                     >
                        <Icons.Send size={20} className="rtl:rotate-180" />
                     </button>
                  </form>
               </div>
             </>
           ) : (
             <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                   <Icons.MessageCircle size={40} className="text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">الرسائل الخاصة</h3>
                <p className="text-sm">اختر صديقاً من القائمة لبدء المحادثة</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
