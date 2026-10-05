import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { ProjectHandoverProtocol } from '../../../types/erp';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  FileText, 
  UserCheck,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface TechnicalHandoverReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  handover: ProjectHandoverProtocol;
}

export const TechnicalHandoverReviewModal: React.FC<TechnicalHandoverReviewModalProps> = ({
  isOpen,
  onClose,
  handover
}) => {
  const { acceptTechnicalHandover, rejectTechnicalHandover, users, currentUser } = useERP();

  const [engineerId, setEngineerId] = useState(currentUser.id);
  const [clarificationNotes, setClarificationNotes] = useState('');
  const [activeAction, setActiveAction] = useState<'accept' | 'reject'>('accept');

  if (!isOpen) return null;

  const selectedEngineer = users.find(u => u.id === engineerId);

  const handleAccept = () => {
    acceptTechnicalHandover(
      handover.id,
      engineerId,
      selectedEngineer ? selectedEngineer.fullName : currentUser.fullName
    );
    onClose();
  };

  const handleReject = () => {
    if (!clarificationNotes.trim()) return;
    rejectTechnicalHandover(handover.id, clarificationNotes);
    onClose();
  };

  const checklist = handover.checklist || {
    contractSigned: true,
    depositVerifiedInFinance: true,
    commercialSpecsLocked: true,
    approvedQuotationVersion: 1,
    approvedDesignVersion: 1,
    siteSurveyCompleted: true,
    surveyObstaclesChecked: true,
    technicalDocumentsAttached: true
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#C87A38]/30 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#1E110B] to-[#361D13] text-white flex items-center justify-between border-b border-[#C87A38]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C87A38]/20 border border-[#C87A38]/40 flex items-center justify-center text-[#E29555]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#C87A38]/30 text-[#E29555] font-black">
                  بوابة استلام المكتب الفني
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  {handover.projectNumber}
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-1">
                تدقيق محضر تسليم المشروع من المبيعات
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Handover summary */}
          <div className="p-4 rounded-2xl bg-[#FDF8F4] border border-[#C87A38]/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-500">اسم العميل:</span>
              <span className="font-black text-[#1E110B] text-sm">{handover.customerName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-500">مقدم من مسؤول المبيعات:</span>
              <span className="font-bold text-slate-800">{handover.submittedByUserName || 'مسؤول المبيعات'}</span>
            </div>
            {handover.notesForTechOffice && (
              <div className="pt-2 border-t border-[#C87A38]/20 text-slate-700">
                <span className="font-bold text-slate-900">ملاحظات المبيعات للمكتب الفني: </span>
                {handover.notesForTechOffice}
              </div>
            )}
          </div>

          {/* Checklist Verification */}
          <div className="space-y-2.5">
            <h4 className="font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#C87A38]" />
              <span>مراجعة بنود البوابة الذهبية (Golden Gate Verification)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${checklist.contractSigned ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                {checklist.contractSigned ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span className="font-bold">العقد موقّع ومعتمد</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${checklist.depositVerifiedInFinance ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                {checklist.depositVerifiedInFinance ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span className="font-bold">سداد العربون مؤكد بالمالية</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${checklist.commercialSpecsLocked ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                {checklist.commercialSpecsLocked ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span className="font-bold">المواصفات التجارية مقفلة</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${checklist.siteSurveyCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                {checklist.siteSurveyCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span className="font-bold">الرفع المساحي ومخطط المعاينة</span>
              </div>
            </div>
          </div>

          {/* Action Tabs */}
          <div className="flex rounded-2xl p-1 bg-slate-100 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveAction('accept')}
              className={`flex-1 py-2 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${
                activeAction === 'accept'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>قبول وبدء الأعمال الهندسية</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAction('reject')}
              className={`flex-1 py-2 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${
                activeAction === 'reject'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>إعادة للمبيعات للاستيضاح</span>
            </button>
          </div>

          {/* Accept Mode: Assign Engineer */}
          {activeAction === 'accept' ? (
            <div className="space-y-3">
              <div>
                <label className="block font-black text-slate-700 mb-1">
                  تعيين المهندس الفني المسؤول عن الـ BOM والتفجير:
                </label>
                <select
                  value={engineerId}
                  onChange={e => setEngineerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-hidden focus:border-[#C87A38]"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.title || 'مهندس مكتب فني'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                سيؤدي القبول إلى إدراج المشروع في مصفوفة المكتب الفني وتفعيل مسار إعداد الرفع المساحي المتقدم والـ BOM.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block font-black text-slate-700 mb-1">
                  أسباب الإعادة والنواقص المطلوب استيفاؤها من المبيعات:
                </label>
                <textarea
                  value={clarificationNotes}
                  onChange={e => setClarificationNotes(e.target.value)}
                  rows={3}
                  placeholder="مثال: يرجى تحديد كود لون الضلف بدقة أو إرفاق مواصفات ساقط حوض المطبخ..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 font-medium focus:outline-hidden focus:border-[#C87A38]"
                  required
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-black hover:bg-slate-50 transition-all"
            >
              إغلاق
            </button>

            {activeAction === 'accept' ? (
              <button
                type="button"
                onClick={handleAccept}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black hover:opacity-95 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>اعتماد وقبول المشروع</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReject}
                disabled={!clarificationNotes.trim()}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black transition-all ${
                  clarificationNotes.trim()
                    ? 'bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-md shadow-rose-600/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>إعادة للمبيعات مع الملاحظات</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
