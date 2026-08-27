import React, { useState } from 'react';
import { PurchaseOrder } from '../../types/erp';
import { PackageCheck, X, CheckCircle2 } from 'lucide-react';

interface ReceiveGoodsModalProps {
  isOpen: boolean;
  po: PurchaseOrder;
  onConfirm: (receivedMap: Record<string, number>, notes: string) => void;
  onClose: () => void;
}

export const ReceiveGoodsModal: React.FC<ReceiveGoodsModalProps> = ({ isOpen, po, onConfirm, onClose }) => {
  const [receivedMap, setReceivedMap] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    po.items.forEach(item => {
      const remainingToReceive = Math.max(0, item.quantity - item.receivedQuantity);
      initial[item.id] = remainingToReceive;
    });
    return initial;
  });

  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (itemId: string, val: number) => {
    setReceivedMap(prev => ({
      ...prev,
      [itemId]: Math.max(0, val)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(receivedMap, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">إثبات استلام خامات/منتجات بالمخزن</h3>
              <p className="text-xs text-slate-500">أمر شراء: {po.poNumber} — الفرع: {po.branchName}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar p-1">
            {po.items.map(item => {
              const remaining = Math.max(0, item.quantity - item.receivedQuantity);
              const currentInput = receivedMap[item.id] ?? remaining;

              return (
                <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{item.itemName}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{item.itemCode}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                    <span>المطلوب بالأمر: <strong>{item.quantity} {item.unit}</strong></span>
                    <span>تم استلامه سابقاً: <strong className="text-emerald-700">{item.receivedQuantity} {item.unit}</strong></span>
                    <span>المتبقي: <strong className="text-amber-800">{remaining} {item.unit}</strong></span>
                  </div>

                  {remaining > 0 ? (
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <label className="font-bold text-slate-700">الكمية المستلمة الآن بالمخزن:</label>
                      <input
                        type="number"
                        min={0}
                        max={remaining}
                        value={currentInput}
                        onChange={(e) => handleInputChange(item.id, Number(e.target.value))}
                        className="w-28 px-3 py-1.5 bg-white border border-emerald-300 rounded-xl font-bold font-mono text-center text-emerald-900"
                      />
                    </div>
                  ) : (
                    <p className="text-emerald-800 font-bold text-[11px] pt-1">✓ تم استلام هذا الصنف بالكامل سابقاً</p>
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ملاحظات الاستلام والفحص الفني (اختياري)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تم الفحص الفني والحالة ممتازة وبدون أي كسر"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl font-bold text-slate-700">
              إلغاء
            </button>
            <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md">
              تأكيد الاستلام وتزويد المخزون
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
