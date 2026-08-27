import React, { useState } from 'react';
import { DeliveryStatus } from '../../types/erp';
import { Truck, CheckCircle2, X, AlertTriangle, PackageCheck } from 'lucide-react';

interface OrderDeliveryModalProps {
  isOpen: boolean;
  orderNumber: string;
  customerName: string;
  currentDeliveryStatus: DeliveryStatus;
  onSave: (status: DeliveryStatus, actualDate?: string, notes?: string) => void;
  onClose: () => void;
}

export const OrderDeliveryModal: React.FC<OrderDeliveryModalProps> = ({
  isOpen,
  orderNumber,
  customerName,
  currentDeliveryStatus,
  onSave,
  onClose
}) => {
  const [status, setStatus] = useState<DeliveryStatus>(currentDeliveryStatus || 'ready_for_delivery');
  const [actualDate, setActualDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(status, actualDate, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold border border-indigo-200">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">تحديث حالة التسليم والتوصيل</h3>
              <p className="text-xs text-slate-500">الطلب: {orderNumber} — العميل: {customerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Status Selection Buttons */}
          <div>
            <label className="block font-bold text-slate-700 mb-2">اختر حالة التسليم *</label>
            <div className="space-y-2">
              
              {/* Option 1: Ready for Delivery */}
              <label className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                status === 'ready_for_delivery'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}>
                <input
                  type="radio"
                  name="deliveryStatus"
                  checked={status === 'ready_for_delivery'}
                  onChange={() => setStatus('ready_for_delivery')}
                  className="accent-indigo-600 mt-1"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-indigo-600" />
                    <span className="font-black text-sm">جاهز للتسليم (Ready for Delivery)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-normal leading-relaxed">
                    المنتج جاهز بالكامل بالمخزن أو المعرض ولكن لم يتم تسليمه للعميل بعد (المخزون محجوز).
                  </p>
                </div>
              </label>

              {/* Option 2: Delivered */}
              <label className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                status === 'delivered'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}>
                <input
                  type="radio"
                  name="deliveryStatus"
                  checked={status === 'delivered'}
                  onChange={() => setStatus('delivered')}
                  className="accent-emerald-600 mt-1"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-black text-sm text-emerald-900">تم التسليم الفعلي للعميل (Delivered)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-normal leading-relaxed">
                    استلم العميل المنتجات بالموقع بالفعل (سيتم تحويل الكمية المحجوزة لخروج فعلي وتخفيض المخزون).
                  </p>
                </div>
              </label>

            </div>
          </div>

          {status === 'delivered' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">تاريخ الاستلام والتسليم الفعلي *</label>
              <input
                type="date"
                required
                value={actualDate}
                onChange={(e) => setActualDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">ملاحظات فريق التوصيل والتركيب</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تم التركيب بالكامل بدون أي ملاحظات مع استلام شهادة الضمان..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#1C352D] hover:bg-[#142921] text-white font-black shadow-lg transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#E06F28]" />
              <span>تأكيد حالة التسليم</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
