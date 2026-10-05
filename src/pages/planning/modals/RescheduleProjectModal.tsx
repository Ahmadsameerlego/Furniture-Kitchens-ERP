import React, { useState } from 'react';
import { X, Calendar, AlertTriangle, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ProjectPlanningReadiness } from '../../../types/planning';

interface RescheduleProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectPlanningReadiness | null;
  onReschedule: (projectId: string, newDeliveryDate: string, reason: string) => void;
}

export const RescheduleProjectModal: React.FC<RescheduleProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onReschedule
}) => {
  if (!isOpen || !project) return null;

  const [newDeliveryDate, setNewDeliveryDate] = useState(project.targetDeliveryDate);
  const [reason, setReason] = useState('تأخر توريد مستلزمات الإنتاج (Shortage in Raw Materials)');
  const [recalculateMilestones, setRecalculateMilestones] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeliveryDate) return;
    onReschedule(project.projectId, newDeliveryDate, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">إعادة جدولة المشروع (Reschedule Timeline)</h3>
              <p className="text-xs text-amber-100">{project.projectNumber} - {project.projectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">تأثير إعادة الجدولة التلقائي (Backward Scheduling):</p>
              <p className="text-amber-800 leading-relaxed">
                تعديل موعد التسليم النهائي للعميل سيعيد حساب التواريخ العكسية لـ (التركيب ← التجميع ← التشغيل والقص ← توفير الخامات بالمصنع) تلقائياً.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block mb-1">الموعد المستهدف الحالي</span>
            <span className="font-semibold text-slate-800">{project.targetDeliveryDate}</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              موعد التسليم المقترح الجديد (New Target Delivery Date) *
            </label>
            <input
              type="date"
              value={newDeliveryDate}
              onChange={(e) => setNewDeliveryDate(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              سبب إعادة الجدولة (Reschedule Reason) *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium bg-white"
            >
              <option value="تأخر توريد مستلزمات الإنتاج (Shortage in Raw Materials)">تأخر توريد مستلزمات الإنتاج (Shortage in Raw Materials)</option>
              <option value="تعديل في التصميم الفني من العميل (Customer Design Change)">تعديل في التصميم الفني من العميل (Customer Design Change)</option>
              <option value="اختناق في خطوط الإنتاج والقص (Work Center Bottleneck)">اختناق في خطوط الإنتاج والقص (Work Center Bottleneck)</option>
              <option value="عدم جاهزية موقع العميل للتركيب (Site Not Ready)">عدم جاهزية موقع العميل للتركيب (Site Not Ready)</option>
              <option value="طلب استعجال رسمي من الإدارة (Management Expedited)">طلب استعجال رسمي من الإدارة (Management Expedited)</option>
              <option value="أخرى">سبب آخر (يُذكر في الملاحظات)</option>
            </select>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
              <input
                type="checkbox"
                checked={recalculateMilestones}
                onChange={(e) => setRecalculateMilestones(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
              <span>إعادة احتساب وتحديث فترات التوريد والتصنيع تلقائياً (Lead-Time Auto Calc)</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-sm shadow-amber-200 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              تأكيد وإعادة الجدولة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
