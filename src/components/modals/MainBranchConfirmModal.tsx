import React from 'react';
import { Branch } from '../../types/erp';
import { AlertTriangle, Building, CheckCircle2, X } from 'lucide-react';

interface MainBranchConfirmModalProps {
  isOpen: boolean;
  targetBranch: Branch | null;
  currentMainBranch: Branch | null;
  onConfirm: () => void;
  onClose: () => void;
}

export const MainBranchConfirmModal: React.FC<MainBranchConfirmModalProps> = ({
  isOpen,
  targetBranch,
  currentMainBranch,
  onConfirm,
  onClose
}) => {
  if (!isOpen || !targetBranch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5 relative">
        
        {/* Header Icon */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
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
            تأكيد تغيير الفرع الرئيسي للشركة
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            هل أنت أمنياً متأكد من رغبتك في نقل صفة <strong className="text-[#E06F28]">"الفرع الرئيسي"</strong> للشركة؟
          </p>
        </div>

        {/* Branch Comparison */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-semibold">الفرع الرئيسي الحالي:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-500" />
              {currentMainBranch?.name || 'غير محدد'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-amber-700 font-bold">الفرع الرئيسي الجديد:</span>
            <span className="font-black text-[#1C352D] text-sm flex items-center gap-1.5 bg-emerald-100 px-3 py-1 rounded-xl text-emerald-900 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {targetBranch.name}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-50 text-amber-900 text-[11px] border border-amber-200 leading-relaxed font-medium">
          ⚠️ <strong>تنبيه هام:</strong> سيتم ربط حسابات العملاء الجدد وتسجيل المعاملات الافتراضية تحت الفرع الرئيسي الجديد بشكل تلقائي.
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            إلغاء الأمر
          </button>
          
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-[#E06F28] hover:bg-[#E06F28]/90 text-white text-xs font-black shadow-lg shadow-[#E06F28]/20 transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            تأكيد التغيير الآن
          </button>
        </div>

      </div>
    </div>
  );
};
