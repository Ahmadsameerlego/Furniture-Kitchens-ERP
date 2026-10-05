import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { TechnicalProject } from '../../../types/technicalOffice';
import { X, GitPullRequest, DollarSign, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CreateECRModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: TechnicalProject;
}

export const CreateECRModal: React.FC<CreateECRModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const { createEngineeringChangeRequest, currentUser } = useERP();

  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [source, setSource] = useState<'customer_request' | 'site_condition' | 'manufacturing_defect' | 'engineering_optimization'>('customer_request');
  const [affectedUnits, setAffectedUnits] = useState('');
  const [targetRevision, setTargetRevision] = useState('REV-B');
  const [costImpact, setCostImpact] = useState<number>(0);
  const [scheduleDelayDays, setScheduleDelayDays] = useState<number>(0);
  const [materialsWasted, setMaterialsWasted] = useState('لا يوجد هالك - تم إيقاف التقطيع في الوقت المناسب');
  const [customerApprovalRequired, setCustomerApprovalRequired] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reason.trim()) return;

    createEngineeringChangeRequest({
      technicalProjectId: project.id,
      projectNumber: project.projectNumber,
      customerName: project.customerName,
      title,
      reason,
      source,
      requestedByUserName: currentUser.fullName,
      requestedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      previousBomRevision: project.activeBomRevision,
      targetNewBomRevision: targetRevision,
      affectedUnits: affectedUnits.split(',').map(u => u.trim()).filter(Boolean),
      impactAssessment: {
        costImpact: Number(costImpact),
        scheduleDelayDays: Number(scheduleDelayDays),
        materialsWasted,
        customerApprovalRequired
      }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#C87A38]/30 max-w-xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#1E110B] to-[#361D13] text-white flex items-center justify-between border-b border-[#C87A38]/20 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C87A38]/20 border border-[#C87A38]/40 flex items-center justify-center text-[#E29555]">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                طلب تعديل هندسي رسمي (Engineering Change Request - ECR)
              </h3>
              <p className="text-xs text-slate-300">
                مشروع: {project.customerName} ({project.projectNumber})
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div>
            <label className="block font-black text-slate-700 mb-1">
              عنوان التعديل الهندسي المطلوب:
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: تغيير عرض وحدة الفرن وتعديل مكان مخرج الكهرباء"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-hidden focus:border-[#C87A38]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1">مصدر التعديل:</label>
              <select
                value={source}
                onChange={e => setSource(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:outline-hidden focus:border-[#C87A38]"
              >
                <option value="customer_request">طلب من العميل</option>
                <option value="site_condition">ظروف ومستجدات بالموقع</option>
                <option value="manufacturing_defect">ملاحظة تصنيع / ورشة</option>
                <option value="engineering_optimization">تحسين وتطوير هندسي</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">كود الـ BOM المستهدف:</label>
              <input
                type="text"
                value={targetRevision}
                onChange={e => setTargetRevision(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black font-mono focus:outline-hidden focus:border-[#C87A38]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-black text-slate-700 mb-1">
              شرح تفصيلي لسبب وموجبات التعديل:
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="اكتب أسباب التعديل الفنية ومواصفات الأجهزة أو الأبعاد الجديدة..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 font-medium focus:outline-hidden focus:border-[#C87A38]"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">
              العلب والوحدات المتأثرة (مفصولة بفواصل):
            </label>
            <input
              type="text"
              value={affectedUnits}
              onChange={e => setAffectedUnits(e.target.value)}
              placeholder="مثال: TALL-60-OVEN, BASE-90-SINK"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono focus:outline-hidden focus:border-[#C87A38]"
            />
          </div>

          {/* Impact Assessment Card */}
          <div className="p-4 rounded-2xl bg-[#FDF8F4] border border-[#C87A38]/30 space-y-3">
            <h4 className="font-black text-[#1E110B] flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-[#C87A38]" />
              <span>تقييم الأثر المالي والزمني (Impact Assessment)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">الأثر المالي المباشر (ج.م):</label>
                <input
                  type="number"
                  value={costImpact}
                  onChange={e => setCostImpact(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black focus:outline-hidden focus:border-[#C87A38]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">تأخير جدول التسليم (أيام):</label>
                <input
                  type="number"
                  value={scheduleDelayDays}
                  onChange={e => setScheduleDelayDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black focus:outline-hidden focus:border-[#C87A38]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">تقييم الهالك من الخامات المقصوصة:</label>
              <input
                type="text"
                value={materialsWasted}
                onChange={e => setMaterialsWasted(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:outline-hidden focus:border-[#C87A38]"
              />
            </div>

            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={customerApprovalRequired}
                onChange={e => setCustomerApprovalRequired(e.target.checked)}
                className="rounded text-[#C87A38] focus:ring-[#C87A38]"
              />
              <span className="font-bold text-slate-800">
                يتطلب موافقة العميل وتوقيع ملحق العقد المالي
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-black hover:bg-slate-50 transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C87A38] to-[#E29555] text-white font-black hover:opacity-95 shadow-md shadow-[#C87A38]/20 transition-all cursor-pointer"
            >
              <GitPullRequest className="w-4 h-4" />
              <span>تسجيل أمر التعديل الهيكلي (ECR)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
