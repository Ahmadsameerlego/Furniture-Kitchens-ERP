import React, { useState } from 'react';
import { LostReason } from '../../types/erp';
import { AlertOctagon, X, CheckCircle2 } from 'lucide-react';

interface LostReasonModalProps {
  isOpen: boolean;
  customerName: string;
  onConfirm: (reason: LostReason, note: string) => void;
  onClose: () => void;
}

export const LostReasonModal: React.FC<LostReasonModalProps> = ({
  isOpen,
  customerName,
  onConfirm,
  onClose
}) => {
  const [reason, setReason] = useState<LostReason>('price');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-900">
            تحديد سبب فقدان الفرصة (Lost Reason)
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            العميل: <strong className="text-slate-900 font-bold">{customerName}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 mb-2">اختر سبب فقدان الفرصة *</label>
            <div className="space-y-2">
              {[
                { id: 'price', label: 'السعر أعلى من الميزانية (Price)' },
                { id: 'competitor', label: 'شراء من منافس آخر (Competitor)' },
                { id: 'postponed', label: 'تأجيل شراء المشروع مؤقتاً (Postponed)' },
                { id: 'not_interested', label: 'عدم الاهتمام بعد التواصل (Not Interested)' },
                { id: 'could_not_contact', label: 'تعذر التواصل مع العميل (Could Not Contact)' },
                { id: 'changed_requirements', label: 'تغيير مواصفات ومتطلبات المشروع' },
                { id: 'other', label: 'أسباب أخرى (Other)' },
              ].map(opt => (
                <label
                  key={opt.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    reason === opt.id
                      ? 'bg-rose-50 text-rose-900 border-rose-300 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="lostReason"
                      checked={reason === opt.id}
                      onChange={() => setReason(opt.id as LostReason)}
                      className="accent-rose-600"
                    />
                    <span>{opt.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ملاحظة توضيحية إضافية (اختياري)</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="اكتب أي تفاصيل إضافية عن ميزانية العميل أو المنافس الذي اختاره..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/30"
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
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-lg transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد وتسجيل كفرصة مفقودة</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
