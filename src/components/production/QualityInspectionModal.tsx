import React, { useState } from 'react';
import { ProductionOrder } from '../../types/erp';
import { QualityGateInspection } from '../../types/production';
import {
  ShieldCheck,
  X,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Award,
  Sparkles
} from 'lucide-react';

interface QualityInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ProductionOrder;
  onSubmit: (inspection: Partial<QualityGateInspection>) => void;
}

export const QualityInspectionModal: React.FC<QualityInspectionModalProps> = ({
  isOpen,
  onClose,
  order,
  onSubmit
}) => {
  const [stage, setStage] = useState<QualityGateInspection['stage']>('carpentry_assembly');
  const [checklist, setChecklist] = useState<{ id: number; title: string; passed: boolean; note?: string }[]>([
    { id: 1, title: 'مطابقة الأبعاد الكلية مع الرسم التنفيذي المعتمد (العمق، الارتفاع، العرض)', passed: true },
    { id: 2, title: 'استقامة الزوايا القائمة 90 درجة وعدم وجود أي فتل في الشاسيهات', passed: true },
    { id: 3, title: 'سلاسة حركة مجاري الأدراج التلسكوبية والمفصلات الهيدروليك بدون احتكاك', passed: true },
    { id: 4, title: 'نظافة الأسطح وخلو طبقة الأكريليك/HPL من أي خدوش أو بقع غراء', passed: true },
    { id: 5, title: 'اكتمال حقيبة الإكسسوارات والرجلاش والمسامير وتطابقها مع كود المشروع', passed: true }
  ]);
  const [correctiveAction, setCorrectiveAction] = useState<string>('');

  if (!isOpen) return null;

  const toggleChecklistItem = (id: number) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, passed: !item.passed } : item));
  };

  const passedCount = checklist.filter(c => c.passed).length;
  const scorePercentage = Math.round((passedCount / checklist.length) * 100);
  const isOverallPassed = scorePercentage >= 80;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      manufacturingOrderId: order.id,
      manufacturingOrderNumber: order.productionNumber,
      stage,
      stageTitle: 'فحص جودة التجميع والتشطيب الشامل',
      inspectorName: 'م. وليد عبد الحميد (مدير الجودة)',
      inspectionDate: new Date().toISOString().substring(0, 16).replace('T', ' '),
      passed: isOverallPassed,
      scorePercentage,
      checklistResults: checklist.map(c => ({ itemTitle: c.title, passed: c.passed, notes: c.note })),
      photos: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600'],
      correctiveAction: !isOverallPassed ? correctiveAction : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">بوابة فحص الجودة واعتماد التغليف (QC Gate)</h3>
              <p className="text-xs text-slate-500">أمر الإنتاج: <span className="font-bold text-slate-800">{order.productionNumber}</span> ({order.customerName})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Banner */}
        <div className={`p-4 rounded-2xl border mb-5 flex items-center justify-between ${
          isOverallPassed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <Award className={`w-6 h-6 ${isOverallPassed ? 'text-emerald-600' : 'text-rose-600'}`} />
            <div>
              <span className="text-xs font-bold block">نسبة المطابقة الفنية للجودة:</span>
              <span className="text-sm font-black">{passedCount} من {checklist.length} بنود مطابقة ({scorePercentage}%)</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-xl text-xs font-black ${
            isOverallPassed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            {isOverallPassed ? 'مقبول ومعتمد ✅' : 'مرفوض ويحتاج معالجة ⚠️'}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Checklist Items */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              قائمة التحقق والفحص الميداني:
            </label>
            {checklist.map(item => (
              <div
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                  item.passed ? 'bg-emerald-50/50 border-emerald-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-white text-[10px] font-bold ${
                    item.passed ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}>
                    {item.passed ? '✓' : ''}
                  </div>
                  <span className={item.passed ? 'font-bold' : ''}>{item.title}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  item.passed ? 'text-emerald-700 bg-emerald-100' : 'text-slate-500 bg-slate-200'
                }`}>
                  {item.passed ? 'مطابق' : 'غير مطابق'}
                </span>
              </div>
            ))}
          </div>

          {!isOverallPassed && (
            <div>
              <label className="block text-xs font-bold text-rose-700 mb-1.5">
                الإجراء التصحيحي المطلوب من عنبر النجارة قبل الإفراج:
              </label>
              <textarea
                rows={2}
                value={correctiveAction}
                onChange={e => setCorrectiveAction(e.target.value)}
                placeholder="مثال: إعادة ضبط رجلاش الأدراج وإزالة زوائد الغراء من ضلفة الحوض"
                className="w-full px-3.5 py-2 bg-rose-50/40 border border-rose-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>اعتماد تقرير فحص الجودة</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
