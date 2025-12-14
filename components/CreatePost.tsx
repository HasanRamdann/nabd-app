
import React, { useState, useRef, useEffect } from 'react';
import { generateCreativePost, generateImageDescription, moderateContent } from '../services/geminiService';
import { Post, Page, User } from '../types';
import * as Icons from './Icons';

interface CreatePostProps {
  onPost: (post: Post) => void;
  userPages?: Page[]; // Optional prop to pass user's pages
  currentUser: User; // Added currentUser prop
}

type Tab = 'text' | 'image' | 'video' | 'audio';

const CreatePost: React.FC<CreatePostProps> = ({ onPost, userPages = [], currentUser }) => {
  const [activeTab, setActiveTab] = useState<Tab>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Identity State (Posting as User or Page)
  const [postingAs, setPostingAs] = useState<'user' | string>('user');

  // Text State
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mood, setMood] = useState('مرح');
  
  // Media State
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(''); 
  const [uploadedImage, setUploadedImage] = useState(''); 
  const [uploadedVideo, setUploadedVideo] = useState(''); 
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioBase64, setAudioBase64] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Exclusive Content State
  const [isExclusive, setIsExclusive] = useState(false);
  const [unlockPrice, setUnlockPrice] = useState(50);

  // Common State
  const [isModerating, setIsModerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // --- Audio Functions ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        
        // Convert to Base64 for storage
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
           setAudioBase64(reader.result as string);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone", err);
      setErrorMsg("لا يمكن الوصول للميكروفون. تأكد من السماح بالأذونات.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const deleteRecording = () => {
     setAudioBlob(null);
     setAudioUrl('');
     setAudioBase64('');
     setRecordingDuration(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- Helper: Read File as Base64 ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('حجم الملف كبير جداً. يرجى اختيار ملف أقل من 5 ميجابايت.');
        return;
    }
    setErrorMsg('');

    const reader = new FileReader();
    reader.onloadend = () => {
        const result = reader.result as string;
        if (activeTab === 'image') {
            setUploadedImage(result);
            setGeneratedImage('');
        } else if (activeTab === 'video') {
            setUploadedVideo(result);
        }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
          fileInputRef.current.click();
      }
  };

  // --- AI Functions ---
  const handleGenerateText = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setErrorMsg('');
    const generated = await generateCreativePost(topic, mood);
    setContent(generated);
    setIsGenerating(false);
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    setIsGeneratingImage(true);
    setUploadedImage('');
    
    // Use local helper to simulate delay/process
    const searchTerm = await generateImageDescription(imagePrompt);
    
    // Use Pollinations.ai for prompt-based generation (No API Key needed)
    // Encodes the prompt into the URL directly
    const encodedPrompt = encodeURIComponent(searchTerm);
    const resultUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
    
    // Simulate loading time for realism
    setTimeout(() => {
        setGeneratedImage(resultUrl);
        setIsGeneratingImage(false);
    }, 2500);
  };

  const handlePost = async () => {
    const textToCheck = content || imagePrompt || 'media content';
    const hasMedia = generatedImage || uploadedImage || uploadedVideo || audioBase64;
    
    if (!content && !hasMedia) return;

    setIsModerating(true);
    if (content || imagePrompt) {
        const moderation = await moderateContent(textToCheck);
        if (!moderation.safe) {
            setIsModerating(false);
            setErrorMsg(`⚠️ لا يمكن نشر هذا المحتوى: ${moderation.reason || 'مخالف لسياسات المجتمع'}`);
            return;
        }
    }
    setIsModerating(false);

    // Determine Identity - Default to logged-in user (currentUser) instead of hardcoded CURRENT_USER
    let postUser: User = currentUser;
    
    if (postingAs !== 'user') {
        const selectedPage = userPages.find(p => p.id === postingAs);
        if (selectedPage) {
            // Mock a User object for the Page
            postUser = {
                ...currentUser, // Use current user as base
                id: selectedPage.id,
                name: selectedPage.name,
                username: selectedPage.handle.replace('@', ''),
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPage.name)}&background=random&bold=true`,
                isVerified: !!selectedPage.isPromoted,
                role: 'creator',
            };
        }
    }

    const newPost: Post = {
      id: Date.now().toString(), // Unique ID based on time
      userId: postUser.id,
      user: postUser,
      content: content || imagePrompt || (uploadedVideo ? 'فيديو جديد 🎥' : audioBase64 ? 'نبض صوتي 🎙️' : 'صورة جديدة 📷'),
      image: generatedImage || uploadedImage || undefined,
      video: uploadedVideo || undefined,
      audio: audioBase64 || undefined,
      audioDuration: audioBase64 ? formatTime(recordingDuration) : undefined,
      likes: 0, // Ensure new posts start with 0 likes
      comments: [],
      commentsCount: 0,
      shares: 0,
      timestamp: 'الآن',
      isAI: !!generatedImage || (!!topic && !uploadedImage && !uploadedVideo && !audioBase64),
      type: uploadedVideo ? 'reel' : audioBase64 ? 'audio' : 'post',
      isLocked: isExclusive,
      unlockPrice: isExclusive ? unlockPrice : undefined
    };

    onPost(newPost);
    
    // Reset State
    setContent('');
    setTopic('');
    setGeneratedImage('');
    setUploadedImage('');
    setUploadedVideo('');
    setImagePrompt('');
    setIsExclusive(false);
    setUnlockPrice(50);
    deleteRecording();
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-20 md:pb-0 animate-fadeIn">
      <input 
        type="file" 
        ref={fileInputRef}
        accept={activeTab === 'image' ? "image/*" : "video/*"}
        className="hidden" 
        onChange={handleFileChange}
      />

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
             <Icons.PlusSquare className="text-primary-500" />
             نشر جديد
           </h2>
           
           {/* Identity Switcher */}
           <div className="relative">
              <select 
                value={postingAs}
                onChange={(e) => setPostingAs(e.target.value)}
                className="appearance-none bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 pl-3 pr-8 py-2 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="user">ملفي الشخصي</option>
                {userPages.map(page => (
                    <option key={page.id} value={page.id}>صفحة: {page.name}</option>
                ))}
              </select>
              <Icons.User className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
           </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700/50">
           {['text', 'image', 'video', 'audio'].map(tab => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab as Tab)}
               className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === tab ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-600 ring-1 ring-gray-100 dark:ring-slate-700' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-800'}`}
             >
               {tab === 'text' && <><Icons.MessageCircle size={16} /> نص</>}
               {tab === 'image' && <><Icons.ImageIcon size={16} /> صورة</>}
               {tab === 'video' && <><Icons.Video size={16} /> فيديو</>}
               {tab === 'audio' && <><Icons.Mic size={16} /> صوت</>}
             </button>
           ))}
        </div>

        {/* --- TEXT TAB --- */}
        {activeTab === 'text' && (
            <>
                <div className="bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700/50 p-4 rounded-xl mb-6 border border-primary-100 dark:border-slate-600">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-primary-700 dark:text-primary-300 font-bold flex items-center gap-2">
                        <Icons.Sparkles size={18} />
                        مساعد الكتابة الذكي
                        </span>
                    </div>
                    <div className="flex flex-col gap-3">
                        <input 
                            type="text" 
                            placeholder="عن ماذا تريد أن تتحدث؟"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-primary-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                {['مرح', 'رسمي', 'عميق'].map(m => (
                                    <button key={m} onClick={() => setMood(mood === m ? '' : m)} className={`px-2 py-1 text-xs rounded-full border transition-colors ${mood === m ? 'bg-primary-500 text-white border-primary-500' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 hover:bg-gray-50'}`}>{m}</button>
                                ))}
                            </div>
                            <button 
                                onClick={handleGenerateText}
                                disabled={isGenerating || !topic}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                            >
                                {isGenerating ? 'جاري الكتابة...' : 'توليد النص ✨'}
                            </button>
                        </div>
                    </div>
                </div>

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`اكتب ما يدور في ذهنك${postingAs !== 'user' ? ' (باسم الصفحة)...' : '...'}`}
                    className="w-full h-40 p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none text-lg mb-4"
                ></textarea>
            </>
        )}

        {/* ... (Existing Image, Video, Audio Tabs logic remains the same) ... */}
        {activeTab === 'image' && (
             <div className="space-y-4 mb-6">
                 <div className="flex flex-col gap-4">
                     <div 
                        onClick={triggerFileUpload}
                        className="cursor-pointer border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
                     >
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                            <Icons.Camera size={24} />
                        </div>
                        <h3 className="font-bold text-gray-700 dark:text-gray-300">اختر صورة من جهازك</h3>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG حتى 5MB</p>
                     </div>

                     <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-slate-800 text-gray-500">أو استخدم الذكاء الاصطناعي (مجاناً)</span>
                        </div>
                     </div>

                     <div className="bg-gradient-to-br from-accent-50 to-purple-50 dark:from-slate-700 dark:to-slate-800 p-4 rounded-xl border border-accent-100 dark:border-slate-600">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={imagePrompt}
                                onChange={(e) => setImagePrompt(e.target.value)}
                                placeholder="صف الصورة الخيالية (مثال: مدينة مستقبلية، قطة ترتدي قبعة)"
                                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
                            />
                            <button 
                                onClick={handleGenerateImage}
                                disabled={!imagePrompt || isGeneratingImage}
                                className="bg-accent-500 hover:bg-accent-600 text-white px-4 rounded-xl font-bold flex items-center gap-2 transition-colors"
                            >
                                {isGeneratingImage ? <span className="animate-spin">⌛</span> : <Icons.Sparkles size={20} />}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2">يتم التوليد باستخدام Pollinations AI</p>
                     </div>
                 </div>
                 {(generatedImage || uploadedImage) && (
                    <div className="w-full h-[300px] bg-black rounded-xl overflow-hidden relative shadow-md animate-fadeIn mt-4 group">
                        <div 
                            className="absolute inset-0 bg-cover bg-center opacity-50 blur-xl scale-110"
                            style={{ backgroundImage: `url(${generatedImage || uploadedImage})` }}
                        ></div>
                        <img src={generatedImage || uploadedImage} alt="Preview" className="relative w-full h-full object-contain z-10" />
                        
                        <button 
                            onClick={() => { setGeneratedImage(''); setUploadedImage(''); }}
                            className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white p-2 rounded-full transition-colors z-20"
                        >
                            <Icons.X size={16} />
                        </button>
                    </div>
                 )}
             </div>
        )}

        {/* --- VIDEO TAB --- */}
        {activeTab === 'video' && (
            <div className="space-y-4 mb-6">
                {!uploadedVideo ? (
                    <div 
                        onClick={triggerFileUpload}
                        className="h-64 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group"
                    >
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Icons.Video size={32} />
                        </div>
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 text-lg">اضغط لرفع فيديو</h3>
                        <p className="text-sm text-gray-400 mt-2">MP4, WebM (Max 5MB)</p>
                    </div>
                ) : (
                    <div className="w-full rounded-xl overflow-hidden bg-black relative animate-fadeIn h-[350px]">
                        <video controls src={uploadedVideo} className="w-full h-full object-contain"></video>
                        <button 
                            onClick={() => setUploadedVideo('')}
                            className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-colors z-10"
                        >
                            <Icons.X size={20} />
                        </button>
                    </div>
                )}
                
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="اكتب وصفاً للفيديو..."
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none text-sm"
                ></textarea>
            </div>
        )}

        {/* --- AUDIO TAB --- */}
        {activeTab === 'audio' && (
            <div className="space-y-4 mb-6 text-center py-8">
               {!audioUrl ? (
                 <div className="flex flex-col items-center justify-center gap-6 animate-fadeIn">
                   <div className="relative">
                     {isRecording && (
                       <span className="absolute -inset-4 rounded-full bg-red-500/20 animate-ping"></span>
                     )}
                     <button 
                       onClick={isRecording ? stopRecording : startRecording}
                       className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${isRecording ? 'bg-red-600 text-white' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
                     >
                       {isRecording ? <Icons.Square size={32} fill="currentColor" /> : <Icons.Mic size={40} />}
                     </button>
                   </div>
                   
                   <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                        {isRecording ? 'جاري التسجيل...' : 'اضغط للتسجيل'}
                      </h3>
                      <p className={`font-mono text-lg ${isRecording ? 'text-red-500' : 'text-gray-400'}`}>
                        {formatTime(recordingDuration)}
                      </p>
                   </div>
                 </div>
               ) : (
                 <div className="w-full bg-gray-50 dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 animate-fadeIn">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600">
                          <Icons.Mic size={24} />
                       </div>
                       <div className="flex-1">
                          <div className="h-8 w-full bg-gray-200 dark:bg-slate-700 rounded-md overflow-hidden flex items-center gap-1 px-1">
                             {/* Fake Waveform */}
                             {Array.from({ length: 20 }).map((_, i) => (
                               <div key={i} className="flex-1 bg-primary-500 rounded-full" style={{ height: `${Math.random() * 100}%`, opacity: 0.7 }}></div>
                             ))}
                          </div>
                       </div>
                       <span className="font-mono text-sm text-gray-500">{formatTime(recordingDuration)}</span>
                    </div>
                    
                    <audio controls src={audioUrl} className="w-full mb-4 hidden" />
                    
                    <div className="flex justify-center gap-4">
                       <button onClick={() => { const a = new Audio(audioUrl); a.play(); }} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
                          <Icons.Play size={16} fill="currentColor" /> استماع
                       </button>
                       <button onClick={deleteRecording} className="px-6 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2">
                          <Icons.Trash2 size={16} /> حذف
                       </button>
                    </div>
                 </div>
               )}
               
               <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="اكتب وصفاً للرسالة الصوتية..."
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none text-sm text-right mt-4"
                ></textarea>
            </div>
        )}

        {/* --- EXCLUSIVE CONTENT TOGGLE --- */}
        <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-200 dark:border-yellow-900/30">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icons.Lock className="text-yellow-600 dark:text-yellow-500" size={20} />
                    <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">محتوى حصري (مدفوع)</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">اربح العملات من المشاهدات</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isExclusive} onChange={(e) => setIsExclusive(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
            </div>
            
            {isExclusive && (
                <div className="mt-3 animate-fadeIn flex items-center gap-2">
                    <span className="text-sm font-bold">سعر الفتح:</span>
                    <input 
                        type="number" 
                        value={unlockPrice}
                        onChange={(e) => setUnlockPrice(Math.max(10, parseInt(e.target.value)))}
                        className="w-20 px-2 py-1 rounded border dark:bg-slate-900 dark:border-slate-600 text-center font-bold"
                    />
                    <span className="text-sm">عملة 🪙</span>
                </div>
            )}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg flex items-center gap-2 border border-red-100 dark:border-red-900/30">
             <Icons.ShieldCheck size={16} />
             {errorMsg}
          </div>
        )}

        <button 
          onClick={handlePost}
          disabled={(!content && !generatedImage && !uploadedImage && !uploadedVideo && !audioBase64) || isModerating}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isModerating ? 'جاري الفحص الأمني...' : 'نشر المحتوى'}
          {!isModerating && <Icons.Send size={18} className="rtl:rotate-180" />}
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
