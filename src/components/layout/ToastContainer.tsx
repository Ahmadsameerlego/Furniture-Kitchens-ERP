import React from 'react';
import { useERP } from '../../context/ERPContext';
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast, language } = useERP();

  if (toasts.length === 0) return null;

  return (
    <div className={`fixed bottom-6 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none ${
      language === 'ar' ? 'left-6' : 'right-6'
    }`}>
      {toasts.map((toast) => {
        const bgColors = {
          success: 'bg-[#361D13] text-white border-emerald-500/50',
          error: 'bg-rose-950 text-rose-100 border-rose-600/50',
          warning: 'bg-amber-950 text-amber-100 border-amber-500/50',
          info: 'bg-slate-900 text-slate-100 border-slate-700'
        };

        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          error: <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-400 shrink-0" />
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${bgColors[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 text-xs font-medium leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
