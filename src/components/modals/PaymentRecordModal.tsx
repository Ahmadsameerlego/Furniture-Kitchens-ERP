import React, { useState } from 'react';
import { CustomerPayment } from '../../types/erp';
import { DollarSign, CheckCircle2, X } from 'lucide-react';

interface PaymentRecordModalProps {
  isOpen: boolean;
  orderNumber: string;
  customerName: string;
  remainingBalance: number;
  onSave: (amount: number, method: CustomerPayment['paymentMethod'], receiptRef?: string, paymentType?: CustomerPayment['paymentType'], notes?: string) => void;
  onClose: () => void;
}

export const PaymentRecordModal: React.FC<PaymentRecordModalProps> = ({
  isOpen,
  orderNumber,
  customerName,
  remainingBalance,
  onSave,
  onClose
}) => {
  const [amount, setAmount] = useState<number>(Math.min(10000, remainingBalance || 10000));
  const [paymentMethod, setPaymentMethod] = useState<CustomerPayment['paymentMethod']>('cash');
  const [receiptRef, setReceiptRef] = useState<string>(`REC-${Date.now().toString().substring(7)}`);
  const [paymentType, setPaymentType] = useState<CustomerPayment['paymentType']>('installment');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    onSave(amount, paymentMethod, receiptRef, paymentType, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold border border-emerald-200">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">تسجيل دفعة / قسط جديد</h3>
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
          
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-500 font-bold">المتبقي المطلوب سداده بالطلب:</span>
            <span className="font-black text-rose-700 text-sm">{remainingBalance.toLocaleString('ar-EG')} ج.م</span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">المبلغ المحصل الآن (ج.م) *</label>
            <input
              type="number"
              required
              max={remainingBalance > 0 ? remainingBalance : undefined}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 dir-ltr text-left text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">طريقة التحصيل *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="cash">نقداً (Cash)</option>
                <option value="card">بطاقة ائتمان (Card)</option>
                <option value="bank_transfer">تحويل بنكي</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">نوع الدفعة</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="installment">سداد قسط</option>
                <option value="deposit">عربون إضافة</option>
                <option value="full_payment">تصفية الحساب بالكامل</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم الإيصال / المرجع البنكي</label>
            <input
              type="text"
              value={receiptRef}
              onChange={(e) => setReceiptRef(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-left"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ملاحظات التحصيل (اختياري)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب أي ملاحظات خاصة بالتحصيل أو الموظف المستلم..."
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
              className="px-6 py-2.5 rounded-xl bg-[#361D13] hover:bg-[#23120A] text-white font-black shadow-lg transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#C87A38]" />
              <span>تأكيد تسجيل السداد</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
