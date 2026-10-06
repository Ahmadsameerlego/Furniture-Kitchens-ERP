import React from 'react';
import { ScrapClaimRecord, OffCutReturnRecord } from '../../types/production';
import { ProductionOrder } from '../../types/erp';
import {
  AlertTriangle,
  Recycle,
  Layers,
  ArrowRight,
  Warehouse,
  CheckCircle2,
  DollarSign,
  Plus,
  Building2,
  FileText
} from 'lucide-react';

interface ScrapAndRequisitionsViewProps {
  scrapClaims: ScrapClaimRecord[];
  offCutReturns: OffCutReturnRecord[];
  orders: ProductionOrder[];
  onOpenScrapModal: (order: ProductionOrder) => void;
  onOpenOffCutModal: (order: ProductionOrder) => void;
}

export const ScrapAndRequisitionsView: React.FC<ScrapAndRequisitionsViewProps> = ({
  scrapClaims,
  offCutReturns,
  orders,
  onOpenScrapModal,
  onOpenOffCutModal
}) => {
  const totalScrapCost = scrapClaims.reduce((acc, s) => acc + (s.estimatedCost || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* 1. Scrap Claims & Requisitions */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900">سجل التوالف والهدر وطلبات الصرف التعويضية (Scrap & Damage Claims)</h3>
            <p className="text-xs text-slate-500">حصر الخامات التالفة بالورشة، تحديد سبب التلف، وإصدار أذونات صرف بديلة (GIN)</p>
          </div>
          <button
            onClick={() => onOpenScrapModal(orders[0])}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل هدر / تلف جديد</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scrapClaims.map(s => (
            <div
              key={s.id}
              className="p-5 rounded-2xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 transition-all space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-bold text-xs text-rose-700">{s.claimNumber}</span>
                  <h4 className="font-black text-xs text-slate-900 mt-0.5">{s.materialName} ({s.scrapQuantity} {s.unit})</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  تم صرف البديل ({s.replacementGINNumber})
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-rose-100 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-900 block">سبب التلف:</span>
                <p className="text-slate-600">{s.reasonDescription}</p>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-rose-100">
                <span>المركز: <strong className="text-slate-800">{s.workCenterName}</strong></span>
                <span className="font-mono font-bold text-rose-700">التكلفة: {s.estimatedCost.toLocaleString()} ج.م</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Reusable Off-Cuts Returned to Warehouse */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900">إرجاع فضلات الخشب الصالحة للمخزن (Reusable Off-Cuts & Remnants)</h3>
            <p className="text-xs text-slate-500">حفظ وتدوير بقايا الألواح السليمة لتقليل الهدر واستخدامها في مشاريع أخرى</p>
          </div>
          <button
            onClick={() => onOpenOffCutModal(orders[0])}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Recycle className="w-4 h-4" />
            <span>تسجيل إرجاع فضلات خشب</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offCutReturns.map(off => (
            <div
              key={off.id}
              className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 transition-all space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-bold text-xs text-emerald-700">{off.returnNumber}</span>
                  <h4 className="font-black text-xs text-slate-900 mt-0.5">{off.materialName} ({off.quantity} {off.unit})</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  تمت الإضافة للمخزون ✅
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-100 text-xs text-slate-700 flex justify-between items-center">
                <span>المقاسات: <strong className="text-slate-900 font-mono">{off.dimensions}</strong></span>
                <span>الحالة: <strong className="text-emerald-700">{off.condition === 'excellent' ? 'ممتازة' : 'جيدة'}</strong></span>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-emerald-100">
                <span>المستودع: <strong className="text-slate-800">{off.targetWarehouseName}</strong></span>
                <span>سجل بواسطة: <strong className="text-slate-800">{off.returnedBy}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
