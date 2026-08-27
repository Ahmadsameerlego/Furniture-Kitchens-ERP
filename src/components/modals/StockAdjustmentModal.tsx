import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ItemType } from '../../types/erp';
import { AlertTriangle, X } from 'lucide-react';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onSave: (itemId: string, itemType: ItemType, branchId: string, quantityChange: number, reason: string) => void;
  onClose: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ isOpen, onSave, onClose }) => {
  const { availableBranches, materials, products } = useERP();

  const [itemType, setItemType] = useState<ItemType>('material');
  const [itemId, setItemId] = useState<string>(materials[0]?.id || 'mat-1');
  const [branchId, setBranchId] = useState<string>(availableBranches[0]?.id || 'branch-2');
  const [quantityChange, setQuantityChange] = useState<number>(-2);
  const [reason, setReason] = useState<string>('تلف خامات أثناء النقل/التخزين');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || quantityChange === 0) return;

    onSave(itemId, itemType, branchId, quantityChange, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-black text-slate-900">تسوية رصيد مخزون (Authorized Adjustment)</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 mb-1">نوع الصنف المراد تسويته *</label>
            <select
              value={itemType}
              onChange={(e) => {
                const nextType = e.target.value as ItemType;
                setItemType(nextType);
                if (nextType === 'material') {
                  setItemId(materials[0]?.id || '');
                } else {
                  setItemId(products[0]?.id || '');
                }
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
            >
              <option value="material">خامة تصنيع</option>
              <option value="product">منتج أثاث جاهز</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">الصنف المستهدف *</label>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
            >
              {itemType === 'material' ? (
                materials.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.code}) — رصيده: {m.currentStock} {m.unit}</option>
                ))
              ) : (
                products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">المخزن / المقر *</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
            >
              {availableBranches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">مقدار التعديل بالنقص (-) أو الزيادة (+) *</label>
            <input
              type="number"
              required
              value={quantityChange}
              onChange={(e) => setQuantityChange(Number(e.target.value))}
              placeholder="مثال: -2 للتخريد أو +5 للفروقات"
              className="w-full px-3 py-2 bg-amber-50 border border-amber-300 rounded-xl font-bold font-mono text-center text-amber-950 text-sm"
            />
            <span className="text-[10px] text-slate-500 block mt-1">اكتب رقماً سالباً (مثال -2) للنقص والتخريد، أو رقماً موجباً للزيادة.</span>
          </div>

          <div>
            <label className="block font-bold text-rose-800 mb-1">سبب التسوية الإلزامي (Mandatory Reason) *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-rose-50 border border-rose-300 rounded-xl font-bold text-rose-950 mb-2"
            >
              <option value="تلف خامات أثناء النقل/التخزين">تلف خامات أثناء النقل/التخزين (Damaged)</option>
              <option value="فروقات جرد مخزني دوري">فروقات جرد مخزني دوري (Inventory Counting)</option>
              <option value="فقد أو سرقة صنف">فقد أو سرقة صنف (Lost Item)</option>
              <option value="تصحيح بيانات مدخلات سابقة">تصحيح بيانات مدخلات سابقة (Data Correction)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl font-bold text-slate-700">
              إلغاء
            </button>
            <button type="submit" className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-black rounded-xl shadow-md">
              تأكيد التسوية المخزنية
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
