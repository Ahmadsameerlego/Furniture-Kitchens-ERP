import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Building2, DollarSign, Calculator, Percent } from 'lucide-react';
import { useERP } from '../../../context/ERPContext';
import { SupplierQuotationItem } from '../../../types/procurement';

interface RecordSupplierQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRfqId?: string;
  defaultSupplierId?: string;
}

export const RecordSupplierQuotationModal: React.FC<RecordSupplierQuotationModalProps> = ({
  isOpen,
  onClose,
  defaultRfqId,
  defaultSupplierId
}) => {
  const { 
    recordSupplierQuotation, 
    rfqs, 
    suppliers, 
    materials,
    currentUser
  } = useERP();

  const [rfqId, setRfqId] = useState<string>(defaultRfqId || '');
  const [supplierId, setSupplierId] = useState<string>(defaultSupplierId || '');
  const [quotationNumber, setQuotationNumber] = useState<string>(`QUO-${Date.now().toString().slice(-4)}`);
  const [quotationDate, setQuotationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState<string>(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [paymentTerms, setPaymentTerms] = useState<string>('سداد 30 يوم من الاستلام');
  const [leadTimeDays, setLeadTimeDays] = useState<number>(5);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const [items, setItems] = useState<Array<{
    itemId: string;
    itemCode: string;
    itemName: string;
    quantity: number;
    uom: string;
    unitPrice: number;
    discountPercent: number;
    taxRate: number;
  }>>([
    {
      itemId: '',
      itemCode: '',
      itemName: '',
      quantity: 1,
      uom: 'قطعة',
      unitPrice: 0,
      discountPercent: 0,
      taxRate: 14
    }
  ]);

  if (!isOpen) return null;

  const handleRfqChange = (selectedRfqId: string) => {
    setRfqId(selectedRfqId);
    const rfq = rfqs.find(r => r.id === selectedRfqId);
    if (rfq) {
      if (rfq.targetSuppliers.length > 0 && !supplierId) {
        setSupplierId(rfq.targetSuppliers[0].supplierId);
      }
      const loadedItems = rfq.items.map(item => ({
        itemId: item.itemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        quantity: item.quantity,
        uom: item.uom,
        unitPrice: 0,
        discountPercent: 0,
        taxRate: 14
      }));
      setItems(loadedItems);
    }
  };

  const handlePriceChange = (index: number, price: number) => {
    const updated = [...items];
    updated[index].unitPrice = price;
    setItems(updated);
  };

  const handleDiscountChange = (index: number, disc: number) => {
    const updated = [...items];
    updated[index].discountPercent = disc;
    setItems(updated);
  };

  const handleTaxChange = (index: number, tax: number) => {
    const updated = [...items];
    updated[index].taxRate = tax;
    setItems(updated);
  };

  // Calculations
  const calculatedItems: SupplierQuotationItem[] = items.map((item, idx) => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = (subtotal * item.discountPercent) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * item.taxRate) / 100;
    const lineTotal = taxableAmount + taxAmount;

    return {
      id: `quo-item-${Date.now()}-${idx}`,
      itemId: item.itemId,
      itemCode: item.itemCode,
      itemName: item.itemName,
      quantity: item.quantity,
      uom: item.uom,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      discountAmount,
      taxPercent: item.taxRate,
      taxAmount,
      lineTotal,
      leadTimeDays
    };
  });

  const subtotal = calculatedItems.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
  const totalDiscount = calculatedItems.reduce((acc, curr) => acc + curr.discountAmount, 0);
  const taxTotal = calculatedItems.reduce((acc, curr) => acc + curr.taxAmount, 0);
  const grandTotal = subtotal - totalDiscount + taxTotal + shippingCost + otherCharges;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === supplierId);
    if (!sup) {
      alert('يرجى اختيار المورد مقدم العرض');
      return;
    }

    const rfq = rfqs.find(r => r.id === rfqId);

    recordSupplierQuotation({
      quotationNumber,
      vendorQuoteReference: quotationNumber,
      rfqId: rfq?.id,
      rfqNumber: rfq?.rfqNumber,
      purchaseRequestId: rfq?.purchaseRequestId,
      purchaseRequestNumber: rfq?.purchaseRequestNumber,
      supplierId: sup.id,
      supplierName: sup.name,
      supplierContactPerson: sup.companyName || sup.phone,
      supplierPhone: sup.phone,
      quotationDate,
      validUntil,
      currency: 'EGP',
      exchangeRate: 1,
      items: calculatedItems,
      subtotal,
      totalDiscount,
      taxTotal,
      shippingCost,
      otherCharges,
      grandTotal,
      paymentTerms,
      deliveryLeadTimeDays: leadTimeDays,
      expectedDeliveryDate: new Date(Date.now() + leadTimeDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      shippingTerms: 'شامل التوصيل لمخازن العاشر من رمضان',
      status: 'received',
      notes,
      createdByUserName: currentUser?.fullName || 'مسؤول المشتريات',
      createdAt: new Date().toISOString()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <form 
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">تسجيل عرض سعر مورد (Supplier Quotation)</h3>
            <p className="text-xs text-slate-500">إدخال الأسعار، الخصومات، والضرائب (14% VAT) وشروط التوريد للعرض المقدم</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {/* RFQ & Supplier selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">طلب التسعير المرتبط (RFQ)</label>
            <select
              value={rfqId}
              onChange={(e) => handleRfqChange(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            >
              <option value="">-- تسجيل عرض مباشر بدون RFQ --</option>
              {rfqs.map(r => (
                <option key={r.id} value={r.id}>
                  {r.rfqNumber} ({r.items.length} أصناف)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">المورد مقدم العرض *</label>
            <select
              required
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            >
              <option value="">-- اختر المورد --</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">رقم عرض المورد (من وثيقته) *</label>
            <input
              type="text"
              required
              value={quotationNumber}
              onChange={(e) => setQuotationNumber(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            />
          </div>
        </div>

        {/* Commercial Terms */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">تاريخ العرض *</label>
            <input
              type="date"
              required
              value={quotationDate}
              onChange={(e) => setQuotationDate(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">صلاحية العرض حتى *</label>
            <input
              type="date"
              required
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">مدة التوريد (أيام) *</label>
            <input
              type="number"
              min="1"
              required
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 1)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">شروط الدفع المعروضة</label>
            <input
              type="text"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            />
          </div>
        </div>

        {/* Line Items Pricing */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">تفاصيل أسعار البنود والضرائب</label>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">الصنف</th>
                  <th className="py-2.5 px-3">الكمية</th>
                  <th className="py-2.5 px-3">سعر الوحدة (ج.م) *</th>
                  <th className="py-2.5 px-3">خصم %</th>
                  <th className="py-2.5 px-3">ضريبة 14%</th>
                  <th className="py-2.5 px-3">الإجمالي الشامل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => {
                  const sub = item.quantity * item.unitPrice;
                  const disc = (sub * item.discountPercent) / 100;
                  const tax = ((sub - disc) * item.taxRate) / 100;
                  const lineTotal = sub - disc + tax;

                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2">
                        <div className="font-semibold text-slate-800">{item.itemName || 'صنف غير محدد'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.itemCode}</div>
                      </td>
                      <td className="p-2 font-mono font-medium text-slate-700">
                        {item.quantity} {item.uom}
                      </td>
                      <td className="p-2 w-32">
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          required
                          value={item.unitPrice || ''}
                          onChange={(e) => handlePriceChange(idx, parseFloat(e.target.value) || 0)}
                          placeholder="سعر الوحدة"
                          className="w-full p-1.5 border border-slate-200 rounded-lg font-mono text-xs focus:ring-1 focus:ring-[#C87A38]"
                        />
                      </td>
                      <td className="p-2 w-20">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercent}
                          onChange={(e) => handleDiscountChange(idx, parseFloat(e.target.value) || 0)}
                          className="w-full p-1.5 border border-slate-200 rounded-lg font-mono text-center text-xs focus:ring-1 focus:ring-[#C87A38]"
                        />
                      </td>
                      <td className="p-2 w-20">
                        <input
                          type="number"
                          min="0"
                          value={item.taxRate}
                          onChange={(e) => handleTaxChange(idx, parseFloat(e.target.value) || 0)}
                          className="w-full p-1.5 border border-slate-200 rounded-lg font-mono text-center text-xs focus:ring-1 focus:ring-[#C87A38]"
                        />
                      </td>
                      <td className="p-2 font-mono font-bold text-slate-900">
                        {lineTotal.toLocaleString()} ج.م
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Charges & Totals Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">مصاريف الشحن والتوصيل (إن وجدت)</label>
              <input
                type="number"
                min="0"
                value={shippingCost}
                onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">مصاريف ورسوم إضافية</label>
              <input
                type="number"
                min="0"
                value={otherCharges}
                onChange={(e) => setOtherCharges(parseFloat(e.target.value) || 0)}
                className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200 text-xs font-medium">
            <div className="flex justify-between text-slate-600">
              <span>المجموع قبل الخصم:</span>
              <span className="font-mono">{subtotal.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between text-rose-600">
              <span>إجمالي الخصومات:</span>
              <span className="font-mono">-{totalDiscount.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>ضريبة القيمة المضافة 14%:</span>
              <span className="font-mono">+{taxTotal.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>الشحن والإضافي:</span>
              <span className="font-mono">+{(shippingCost + otherCharges).toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-100 pt-2">
              <span>الإجمالي النهائي للعرض:</span>
              <span className="font-mono text-[#C87A38]">{grandTotal.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs hover:bg-slate-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-[#361D13] text-white rounded-xl text-xs font-semibold hover:bg-[#4a281b] shadow-sm"
          >
            حفظ وتسجيل عرض السعر
          </button>
        </div>
      </form>
    </div>
  );
};
