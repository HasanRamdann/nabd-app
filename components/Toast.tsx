
import React, { useEffect } from 'react';
import * as Icons from './Icons';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'error' | 'notification';
  title?: string;
  message: string;
  icon?: any;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const getIcon = () => {
      if (toast.icon) {
          const Icon = toast.icon;
          return <Icon size={20} />;
      }
      switch(toast.type) {
          case 'success': return <Icons.CheckCircle size={20} />;
          case 'error': return <Icons.Info size={20} />;
          case 'notification': return <Icons.Bell size={20} />;
          default: return <Icons.Info size={20} />;
      }
  };

  const getColors = () => {
      switch(toast.type) {
          case 'success': return 'bg-green-600 border-green-700';
          case 'error': return 'bg-red-600 border-red-700';
          case 'notification': return 'bg-blue-600 border-blue-700';
          default: return 'bg-slate-800 border-slate-900';
      }
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl border text-white mb-3 animate-slideUp w-full max-w-xs md:w-80 backdrop-blur-md bg-opacity-95 ${getColors()}`}>
        <div className="shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1">
            {toast.title && <h4 className="font-bold text-sm mb-0.5">{toast.title}</h4>}
            <p className="text-xs opacity-95 leading-relaxed font-medium">{toast.message}</p>
        </div>
        <button onClick={() => onRemove(toast.id)} className="opacity-70 hover:opacity-100 p-1"><Icons.X size={16} /></button>
    </div>
  );
};

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-20 left-4 right-4 md:right-auto z-[300] flex flex-col items-start pointer-events-none">
        <div className="pointer-events-auto w-full md:w-auto">
            {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={onRemove} />)}
        </div>
    </div>
  );
};
