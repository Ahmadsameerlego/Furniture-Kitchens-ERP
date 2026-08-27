import React, { useState } from 'react';
import { ActivityType } from '../../types/erp';
import { FileText, Phone, MessageSquare, Users, CheckCircle2, X } from 'lucide-react';

interface ActivityFormModalProps {
  isOpen: boolean;
  customerName: string;
  onSave: (type: ActivityType, title: string, note: string) => void;
  onClose: () => void;
}

export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  isOpen,
  customerName,
  onSave,
  onClose
}) => {
  const [type, setType] = useState<ActivityType>('note');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(type, title, note);
    onClose();
    setTitle('');
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              تسجيل نشاط جديد بسجل العميل
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
          
          {/* Activity Type Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-2">نوع النشاط *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => { setType('note'); setTitle('ملاحظة تتبع'); }}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  type === 'note'
                    ? 'bg-[#1C352D] text-white border-[#1C352D] font-bold shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-xs">ملاحظة</span>
              </button>

              <button
                type="button"
                onClick={() => { setType('phone_call'); setTitle('مكالمة هاتفية'); }}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  type === 'phone_call'
                    ? 'bg-[#1C352D] text-white border-[#1C352D] font-bold shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span className="text-xs">مكالمة</span>
              </button>

              <button
                type="button"
                onClick={() => { setType('whatsapp'); setTitle('تواصل واتساب'); }}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  type === 'whatsapp'
                    ? 'bg-[#1C352D] text-white border-[#1C352D] font-bold shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs">واتساب</span>
              </button>

              <button
                type="button"
                onClick={() => { setType('meeting'); setTitle('مقابلة بالمعرض'); }}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  type === 'meeting'
                    ? 'bg-[#1C352D] text-white border-[#1C352D] font-bold shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="text-xs">اجتماع</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">عنوان الإجراء / الملخص *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تواصل واتساب لإرسال عينات المطابخ"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">تفاصيل وملاحظات الإجراء</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="اكتب رد فعل العميل والتفاصيل الناجمة عن المكالمة أو التواصل..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30"
            ></textarea>
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
              <span>إضافة السجل للتتبع</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
