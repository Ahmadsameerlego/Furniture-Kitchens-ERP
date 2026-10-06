import React, { useState } from 'react';
import { ProductionOrder } from '../../types/erp';
import { OffCutReturnRecord } from '../../types/production';
import {
  Recycle,
  X,
  Layers,
  Ruler,
  Warehouse,
  CheckCircle2
} from 'lucide-react';

interface OffCutReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ProductionOrder;
  onSubmit: (offcut: Partial<OffCutReturnRecord>) => void;
}

export const OffCutReturnModal: React.FC<OffCutReturnModalProps> = ({
  isOpen,
  onClose,
  order,
  onSubmit
}) => {
  const [materialName, setMaterialName] = useState<string>('MDF أبيض 18مم اسباني');
  const [dimensions, setDimensions] = useState<string>('120 × 70 سم (سمك 18مم)');
  const [quantity, setQuantity] = useState<number>(2);
  const [condition, setCondition] = useState<'excellent' | 'good'>('excellent');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      manufacturingOrderId: order.id,
      manufacturingOrderNumber: order.productionNumber,
      materialId: 'mat-1',
      materialName,
      dimensions,
      quantity,
      unit: 'لوح فضلات سليم',
      condition,
      targetWarehouseName: 'مستودع فضلات وخامات الورشة - العبور',
      returnedBy: 'فني التقطيع والـ CNC',
      date: new Date().toISOString().substring(0, 10),
      status: 'returned_to_stock'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Recycle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">إرجاع فضلات خشب صالحة للمخزن</h3>
              <p className="text-xs text-slate-500">من أمر الإنتاج: <span className="font-bold text-slate-800">{order.productionNumber}</span></p>
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
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              نوع الخشب المتبقي:
            </label>
            <input
              type="text"
              value={materialName}
              onChange={e => setMaterialName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                أبعاد لوح الفضلات (سم):
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={e => setDimensions(e.target.value)}
                placeholder="مثال: 140 × 80 سم"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                عدد الألواح:
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              حالة اللوح وصلاحيته للاستخدام:
            </label>
            <select
              value={condition}
              onChange={e => setCondition(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            >
              <option value="excellent">ممتازة (بدون أي تجريح أو خدوش - صالح لكبائن كاملة)</option>
              <option value="good">جيدة (صالح لأرفف داخلية وقواطع)</option>
            </select>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800">
            <Warehouse className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>سيتم إضافة هذه القطع فوراً في كارت صنف (مستودع فضلات وخامات الورشة) لاستخدامها في مشاريع قادمة وتقليل الهدر.</span>
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تسجيل الإرجاع للمخزن</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
