import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface ReminderFormModalProps {
  isOpen: boolean;
  customerName: string;
  onSave: (title: string, dueDate: string, dueTime?: string, priority?: 'normal' | 'high') => void;
  onClose: () => void;
}

export const ReminderFormModal: React.FC<ReminderFormModalProps> = ({
  isOpen,
  customerName,
  onSave,
  onClose
}) => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().substring(0, 10);

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(tomorrow);
  const [dueTime, setDueTime] = useState('12:00');
  const [priority, setPriority] = useState<'normal' | 'high'>('normal');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    onSave(title, dueDate, dueTime, priority);
    onClose();
    setTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              جدولة تذكير ومتابعة للعميل
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              العميل: <strong className="text-slate-900 font-bold">{customerName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 mb-1">عنوان التذكير / المطلوب توجيهه *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: الاتصال بالعميل لمتابعة عرض سعر المطبخ"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">تاريخ المتابعة *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30 font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">توقيت المتابعة</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30 font-bold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2">درجة الأهمية (Priority)</label>
            <div className="flex items-center gap-3">
              <label className={`flex-1 p-3 rounded-2xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                priority === 'normal'
                  ? 'bg-slate-900 text-white border-slate-900 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                <input
                  type="radio"
                  name="reminderPriority"
                  checked={priority === 'normal'}
                  onChange={() => setPriority('normal')}
                  className="accent-[#1C352D]"
                />
                <span>عادية (Normal)</span>
              </label>

              <label className={`flex-1 p-3 rounded-2xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                priority === 'high'
                  ? 'bg-[#E06F28] text-white border-[#E06F28] font-bold shadow-md'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                <input
                  type="radio"
                  name="reminderPriority"
                  checked={priority === 'high'}
                  onChange={() => setPriority('high')}
                  className="accent-[#E06F28]"
                />
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>عالية الأهمية</span>
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#1C352D] hover:bg-[#142921] text-white font-black shadow-lg transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#E06F28]" />
              <span>حفظ جدول التذكير</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
