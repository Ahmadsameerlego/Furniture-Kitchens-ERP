import React from 'react';
import { QualityGateInspection } from '../../types/production';
import { ProductionOrder } from '../../types/erp';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  Camera,
  Calendar,
  User,
  Plus
} from 'lucide-react';

interface QualityGatesViewProps {
  inspections: QualityGateInspection[];
  orders: ProductionOrder[];
  onOpenQualityModal: (order: ProductionOrder) => void;
}

export const QualityGatesView: React.FC<QualityGatesViewProps> = ({
  inspections,
  orders,
  onOpenQualityModal
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-900">بوابات مراقبة الجودة والاعتماد الفني (Quality Gates)</h3>
          <p className="text-xs text-slate-500">فحص الأبعاد، جودة الدهان، سلاسة الإكسسوارات، ومطابقة التصميم قبل التغليف والتسليم</p>
        </div>
        <button
          onClick={() => onOpenQualityModal(orders[0])}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-teal-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>إجراء فحص جودة جديد</span>
        </button>
      </div>

      {/* Inspections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inspections.map(insp => (
          <div
            key={insp.id}
            className="p-6 rounded-3xl border border-slate-200 bg-white hover:border-teal-500 transition-all space-y-4 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono font-bold text-xs text-teal-700">{insp.gateNumber}</span>
                <h4 className="font-black text-sm text-slate-900 mt-0.5">{insp.stageTitle}</h4>
                <span className="text-xs text-slate-500 block">أمر الإنتاج: {insp.manufacturingOrderNumber}</span>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {insp.scorePercentage}% مطابقة ✅
                </span>
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-slate-700 block">بنود الفحص الميداني:</span>
              {insp.checklistResults.map((item, idx) => (
                <div key={idx} className="p-2 bg-slate-50 rounded-xl text-xs flex items-center justify-between">
                  <span className="text-slate-800">{item.itemTitle}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    مطابق
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-3 border-t border-slate-100">
              <span>الفاحص: <strong className="text-slate-700">{insp.inspectorName}</strong></span>
              <span>{insp.inspectionDate}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
