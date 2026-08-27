import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ItemType } from '../../types/erp';
import { Truck, X, Plus, Trash2 } from 'lucide-react';

interface StockTransferModalProps {
  isOpen: boolean;
  onSave: (transferData: any) => void;
  onClose: () => void;
}

export const StockTransferModal: React.FC<StockTransferModalProps> = ({ isOpen, onSave, onClose }) => {
  const { availableBranches, materials, products } = useERP();

  const [sourceBranchId, setSourceBranchId] = useState<string>(availableBranches[0]?.id || 'branch-2');
  const [destinationBranchId, setDestinationBranchId] = useState<string>(availableBranches[1]?.id || 'branch-3');
  const [notes, setNotes] = useState<string>('');

  const [transferItems, setTransferItems] = useState<{
    itemId: string;
    itemType: ItemType;
    itemName: string;
    itemCode: string;
    quantity: number;
    unit: string;
  }[]>([
    {
      itemId: materials[0]?.id || 'mat-1',
      itemType: 'material',
      itemName: materials[0]?.name || 'MDF أبيض 18مم اسباني',
      itemCode: materials[0]?.code || 'MAT-MDF-W18',
      quantity: 5,
      unit: materials[0]?.unit || 'Sheet'
    }
  ]);

  const [selectedItemType, setSelectedItemType] = useState<ItemType>('material');
  const [selectedItemId, setSelectedItemId] = useState<string>(materials[0]?.id || 'mat-1');
  const [itemQty, setItemQty] = useState<number>(5);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (selectedItemType === 'material') {
      const mat = materials.find(m => m.id === selectedItemId);
      if (!mat) return;
      setTransferItems(prev => [
        ...prev,
        {
          itemId: mat.id,
          itemType: 'material',
          itemName: mat.name,
          itemCode: mat.code,
          quantity: itemQty,
          unit: mat.unit
        }
      ]);
    } else {
      const prod = products.find(p => p.id === selectedItemId);
      if (!prod) return;
      setTransferItems(prev => [
        ...prev,
        {
          itemId: prod.id,
          itemType: 'product',
          itemName: prod.name,
          itemCode: prod.code,
          quantity: itemQty,
          unit: 'قطعة'
        }
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setTransferItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceBranchId === destinationBranchId || transferItems.length === 0) return;

    const sourceBranch = availableBranches.find(b => b.id === sourceBranchId) || availableBranches[0];
    const destinationBranch = availableBranches.find(b => b.id === destinationBranchId) || availableBranches[1];

    onSave({
      sourceBranchId: sourceBranch.id,
      sourceBranchName: sourceBranch.name,
      destinationBranchId: destinationBranch.id,
      destinationBranchName: destinationBranch.name,
      items: transferItems,
      notes
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5">
        
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">إنشاء طلب تحويل مخزون بين الفروع</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">من (المقر المحول منه) *</label>
              <select
                value={sourceBranchId}
                onChange={(e) => setSourceBranchId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                {availableBranches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">إلى (المقر المستلم) *</label>
              <select
                value={destinationBranchId}
                onChange={(e) => setDestinationBranchId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                {availableBranches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ITEM ADDER */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <p className="font-black text-slate-800">إضافة أصناف للتحويل:</p>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <select
                  value={selectedItemType}
                  onChange={(e) => setSelectedItemType(e.target.value as ItemType)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl font-bold"
                >
                  <option value="material">خامة تصنيع</option>
                  <option value="product">منتج أثاث جاهز</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl font-bold"
                >
                  {selectedItemType === 'material' ? (
                    materials.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))
                  ) : (
                    products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={itemQty}
                  onChange={(e) => setItemQty(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-center font-bold"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 bg-[#1C352D] text-white font-bold rounded-xl shrink-0"
                >
                  + إضافة
                </button>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              {transferItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-[11px] font-bold">
                  <span>• {item.itemName} ({item.quantity} {item.unit})</span>
                  <button type="button" onClick={() => handleRemoveItem(idx)} className="text-rose-500 hover:text-rose-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">سبب / ملاحظات التحويل</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl font-bold text-slate-700">
              إلغاء
            </button>
            <button type="submit" className="px-5 py-2 bg-[#1C352D] text-white font-black rounded-xl">
              تأكيد وإرسال طلب التحويل
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
