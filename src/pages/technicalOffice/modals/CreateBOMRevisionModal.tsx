import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { TechnicalBOM } from '../../../types/technicalOffice';
import { X, GitBranch, History, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CreateBOMRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBom: TechnicalBOM;
}

export const CreateBOMRevisionModal: React.FC<CreateBOMRevisionModalProps> = ({
  isOpen,
  onClose,
  currentBom
}) => {
  const { createBOMRevision } = useERP();

  // Suggest next revision code
  const getNextRevCode = (code: string) => {
    if (code.startsWith('REV-0')) {
      const num = parseInt(code.replace('REV-0', '')) || 1;
      return `REV-0${num + 1}`;
    }
    if (code === 'REV-A') return 'REV-B';
    if (code === 'REV-B') return 'REV-C';
    return `${code}-NEW`;
  };

  const [newRevisionCode, setNewRevisionCode] = useState(getNextRevCode(currentBom.revisionCode));
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    createBOMRevision(currentBom.id, newRevisionCode, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#C87A38]/30 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#1E110B] to-[#361D13] text-white flex items-center justify-between border-b border-[#C87A38]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C87A38]/20 border border-[#C87A38]/40 flex items-center justify-center text-[#E29555]">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                إنشاء إصدار تفجير هندسي جديد (New BOM Revision)
              </h3>
              <p className="text-xs text-slate-300">
                الحفاظ على الإصدار السابق وتفريغ نسخة عمل جديدة قابلة للتعديل
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">الإصدار الحالي: </span>
              <span className="font-black text-[#1E110B] font-mono">{currentBom.revisionCode}</span> ({currentBom.status === 'approved' ? 'معتمد ومغلق' : 'مسودة'}).
              سيتم استنساخ كافة العلب وقوائم التقطيع ({currentBom.totalPartsCount} قطعة) للإصدار الجديد.
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">
              كود الإصدار الجديد (Revision Code):
            </label>
            <input
              type="text"
              value={newRevisionCode}
              onChange={e => setNewRevisionCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-black focus:outline-hidden focus:border-[#C87A38] font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">
              سبب إنشاء الإصدار والملاحظات الهندسية:
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-hidden focus:border-[#C87A38]"
              placeholder="مثال: تعديل عمق علب الجزيرة بعد اعتماد العميل لساقط الرخام، أو استبدال مفصلات..."
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-black hover:bg-slate-50 transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C87A38] to-[#E29555] text-white text-xs font-black hover:opacity-95 shadow-md shadow-[#C87A38]/20 transition-all"
            >
              <GitBranch className="w-4 h-4" />
              <span>إنشاء الإصدار الجديد</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
