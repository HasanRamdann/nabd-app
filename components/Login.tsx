
import React, { useState } from 'react';
import * as Icons from './Icons';

interface LoginProps {
  onLogin: (username: string, pass: string) => void;
  onRegister: (name: string, username: string, pass: string) => void;
  error?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, error }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      if (isRegister) {
        onRegister(name, username, password);
      } else {
        onLogin(username, password);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] dark:bg-[#020617] p-4 relative overflow-hidden transition-colors duration-500">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary-500/10 rounded-full blur-[100px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent-500/10 rounded-full blur-[100px] animate-float" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative z-10 border border-white/20 dark:border-slate-700/50 animate-scaleIn">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-600 flex items-center justify-center text-white font-bold text-5xl mb-4 shadow-xl shadow-primary-500/30 transform hover:scale-110 hover:rotate-6 transition-all duration-500">
            ن
          </div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-600 tracking-tight animate-pulse-slow">
            نبض
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-center font-medium">
            الجيل الجديد من التواصل الاجتماعي العربي
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister && (
             <div className="group animate-slideUp">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 transition-colors group-focus-within:text-primary-600">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all shadow-sm"
                    placeholder="الاسم الذي سيظهر للناس"
                    required
                  />
                  <Icons.Smile className="absolute left-3.5 top-3.5 text-gray-400 transition-colors group-focus-within:text-primary-500" size={20} />
                </div>
              </div>
          )}

          <div className="group">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 transition-colors group-focus-within:text-primary-600">
              {isRegister ? 'اختر اسم مستخدم' : 'اسم المستخدم'}
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all shadow-sm"
                placeholder="username"
                required
              />
              <Icons.User className="absolute left-3.5 top-3.5 text-gray-400 transition-colors group-focus-within:text-primary-500" size={20} />
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 transition-colors group-focus-within:text-primary-600">كلمة المرور</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all shadow-sm"
                placeholder="••••••••"
                required
              />
              <Icons.ShieldCheck className="absolute left-3.5 top-3.5 text-gray-400 transition-colors group-focus-within:text-primary-500" size={20} />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm font-bold text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg animate-fadeIn">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isRegister ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}{' '}
            <button 
              onClick={() => { setIsRegister(!isRegister); if(error) {/* Clear error logic if needed */} }}
              className="text-primary-600 dark:text-primary-400 font-bold hover:underline transition-colors"
            >
              {isRegister ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
