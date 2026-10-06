import React, { useState } from 'react';
import { ProductionOrder, Material } from '../../types/erp';
import { ScrapClaimRecord } from '../../types/production';
import {
  AlertOctagon,
  X,
  Layers,
  ArrowRight,
  Sparkles,
  FileText,
  Building2,
  DollarSign
} from 'lucide-react';

interface CreateScrapClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ProductionOrder;
  materials: Material[];
  onSubmit: (claim: Partial<ScrapClaimRecord>) => void;
}

export const CreateScrapClaimModal: React.FC<CreateScrapClaimModalProps> = ({
  isOpen,
  onClose,
  order,
  materials,
  onSubmit
}) => {
  const [selectedMatId, setSelectedMatId] = useState<string>(order.materials[0]?.materialId || '');
  const [scrapQty, setScrapQty] = useState<number>(1);
  const [reason, setReason] = useState<ScrapClaimRecord['reason']>('machine_defect');
  const [workCenterName, setWorkCenterName] = useState<string>('ماكينة CNC التقطيع والنيستينج');
  const [reasonDesc, setReasonDesc] = useState<string>('انحراف سلاح القص أثناء عمل المجرى أدى لشرخ في لوح الخشب');

  if (!isOpen) return null;

  const targetMat = order.materials.find(m => m.materialId === selectedMatId) || order.materials[0];
  const unitCost = targetMat?.estimatedUnitCost || 1250;
  const estimatedTotalScrapCost = scrapQty * unitCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      manufacturingOrderId: order.id,
      manufacturingOrderNumber: order.productionNumber,
      workCenterName,
      materialId: targetMat?.materialId || 'mat-1',
      materialCode: targetMat?.materialCode || 'MAT-MDF-001',
      materialName: targetMat?.materialName || 'MDF 18مم اسباني',
      unit: targetMat?.unit || 'Sheet',
      scrapQuantity: scrapQty,
      reason,
      reasonDescription: reasonDesc,
      estimatedCost: estimatedTotalScrapCost,
      reportedBy: 'مشرف الورشة',
      reportedAt: new Date().toISOString().substring(0, 16).replace('T', ' '),
      status: 'replacement_issued',
      replacementGINNumber: `GIN-2026-00${Math.floor(10 + Math.random() * 89)}`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">تسجيل هدر / تلف خامات وطلب بديل فوري</h3>
              <p className="text-xs text-slate-500">لأمر التصنيع: <span className="font-bold text-slate-800">{order.productionNumber}</span> ({order.customerName})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Work Center Station */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              عنبر أو مركز التشغيل الذي حدث فيه التلف:
            </label>
            <select
              value={workCenterName}
              onChange={e => setWorkCenterName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            >
              <option value="ماكينة CNC التقطيع والنيستينج">ماكينة CNC التقطيع والنيستينج Biesse</option>
              <option value="ماكينة لزق وقشاط الحرف Homag">ماكينة لزق وقشاط الحرف Homag</option>
              <option value="ماكينة التخريم والفرز Vitap">ماكينة التخريم والفرز Vitap</option>
              <option value="كابينة الدهانات والدوكو">كابينة الدهانات وأفران الرش</option>
              <option value="صالة التجميع والنجارة">صالة التجميع والنجارة</option>
              <option value="صالة التغليف والشحن">صالة التغليف والتحميل</option>
            </select>
          </div>

          {/* Damaged Material */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الخامة التالفة المطلوب صرف بديل لها:
            </label>
            <select
              value={selectedMatId}
              onChange={e => setSelectedMatId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            >
              {order.materials.map(m => (
                <option key={m.materialId} value={m.materialId}>
                  {m.materialName} ({m.materialCode}) — الوحدة: {m.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Reason */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الكمية التالفة ({targetMat?.unit || 'قطعة'}):
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={scrapQty}
                onChange={e => setScrapQty(parseFloat(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                سبب التلف / الهدر:
              </label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
              >
                <option value="machine_defect">عطل أو خطأ ميكانيكي بالماكينة</option>
                <option value="operator_error">خطأ فني غير مقصود من الصنايعي</option>
                <option value="material_flaw">عيب خامة مصنعية من المورد (سوسة/تقوس)</option>
                <option value="measurement_mismatch">خطأ في مقاس الرسم الفني</option>
                <option value="transit_damage">كسر أو خدش أثناء النقل الداخلي</option>
              </select>
            </div>
          </div>

          {/* Detailed Reason description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              شرح تفصيلي لسبب التلف (لتحديد المسؤولية):
            </label>
            <textarea
              rows={2}
              value={reasonDesc}
              onChange={e => setReasonDesc(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
              required
            />
          </div>

          {/* Cost Impact Notice */}
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-rose-900 block">التكلفة الإضافية للهدر:</span>
              <span className="text-[11px] text-rose-700">سيتم إصدار إذن صرف تعويضي (GIN) وقيد خسارة هدر في الحسابات</span>
            </div>
            <div className="text-right font-bold text-rose-700 font-mono text-sm">
              {estimatedTotalScrapCost.toLocaleString()} ج.م
            </div>
          </div>

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
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>اعتماد التلف وصرف بديل من المخزن</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
