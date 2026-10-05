import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Building2, ShoppingCart, Percent, DollarSign } from 'lucide-react';
import { useERP } from '../../../context/ERPContext';
import { PurchaseOrderLineItem } from '../../../types/procurement';

interface CreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSupplierId?: string;
  defaultPrId?: string;
}

export const CreatePurchaseOrderModal: React.FC<CreatePurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  defaultSupplierId,
  defaultPrId
}) => {
  const { 
    createEnterprisePurchaseOrder, 
    suppliers, 
    materials, 
    customProjects, 
    branches,
    purchaseRequests,
    enterprisePurchaseOrders,
    currentUser
  } = useERP();

  const [supplierId, setSupplierId] = useState<string>(defaultSupplierId || '');
  const [purchaseRequestId, setPurchaseRequestId] = useState<string>(defaultPrId || '');
  const [projectId, setProjectId] = useState<string>('');
  const [branchId, setBranchId] = useState<string>(branches[0]?.id || 'branch_1');
  const [warehouseId, setWarehouseId] = useState<string>('wh_main');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [paymentTerms, setPaymentTerms] = useState<string>('سداد 30 يوم من الاستلام ومطابقة الفاتورة');
  const [shippingTerms, setShippingTerms] = useState<string>('التسليم بمخازن مصنع العاشر من رمضان (DDP)');
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const [items, setItems] = useState<Array<{
    itemId: string;
    itemCode: string;
    itemName: string;
    itemCategory: string;
    specifications: string;
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
      itemCategory: 'خامات ومستلزمات',
      specifications: '',
      quantity: 10,
      uom: 'متر',
      unitPrice: 0,
      discountPercent: 0,
      taxRate: 14
    }
  ]);

  if (!isOpen) return null;

  const handlePrChange = (prId: string) => {
    setPurchaseRequestId(prId);
    const pr = purchaseRequests.find(p => p.id === prId);
    if (pr) {
      if (pr.projectId) setProjectId(pr.projectId);
      if (pr.branchId) setBranchId(pr.branchId);
      if (pr.warehouseId) setWarehouseId(pr.warehouseId);
      if (pr.suggestedSupplierId && !supplierId) setSupplierId(pr.suggestedSupplierId);
      if (pr.requiredDate) setExpectedDeliveryDate(pr.requiredDate);

      const prItems = pr.items.map(item => ({
        itemId: item.itemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        itemCategory: item.itemCategory || 'خامات ومستلزمات',
        specifications: item.specifications || '',
        quantity: item.remainingQuantity > 0 ? item.remainingQuantity : item.quantity,
        uom: item.uom,
        unitPrice: item.estimatedUnitCost || 0,
        discountPercent: 0,
        taxRate: 14
      }));
      setItems(prItems);
    }
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const selectedItem = materials.find(i => i.id === itemId);
    const updated = [...items];
    if (selectedItem) {
      updated[index] = {
        ...updated[index],
        itemId: selectedItem.id,
        itemCode: selectedItem.code || selectedItem.id,
        itemName: selectedItem.name,
        itemCategory: selectedItem.categoryName || 'خامات ومستلزمات',
        uom: selectedItem.unit || 'قطعة',
        unitPrice: selectedItem.currentReferenceCost || 0
      };
    }
    setItems(updated);
  };

  // Calculations
  const calculatedItems: PurchaseOrderLineItem[] = items.map((item, idx) => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = (subtotal * item.discountPercent) / 100;
    const netUnitPrice = item.unitPrice - (item.unitPrice * item.discountPercent) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * item.taxRate) / 100;
    const totalAmount = taxableAmount + taxAmount;

    return {
      id: `po-item-${Date.now()}-${idx}`,
      itemId: item.itemId,
      itemType: 'material',
      itemCode: item.itemCode,
      itemName: item.itemName,
      itemCategory: item.itemCategory,
      specifications: item.specifications,
      quantity: item.quantity,
      receivedQuantity: 0,
      remainingQuantity: item.quantity,
      returnedQuantity: 0,
      uom: item.uom,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      discountAmount,
      netUnitPrice,
      taxRate: item.taxRate,
      taxAmount,
      totalAmount,
      requiredDate: expectedDeliveryDate,
      projectId: projectId || undefined
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
      alert('يرجى اختيار المورد لأمر الشراء');
      return;
    }

    const validItems = calculatedItems.filter(i => i.itemId && i.quantity > 0);
    if (validItems.length === 0) {
      alert('يرجى إضافة صنف واحد على الأقل وتحديد الكمية');
      return;
    }

    const pr = purchaseRequests.find(p => p.id === purchaseRequestId);
    const selectedProj = customProjects.find((p) => p.id === projectId);
    const selectedBranch = branches.find(b => b.id === branchId);
    const poNumber = `PO-${new Date().getFullYear()}-${String(enterprisePurchaseOrders.length + 1).padStart(4, '0')}`;

    createEnterprisePurchaseOrder({
      poNumber,
      poDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate,
      supplierId: sup.id,
      supplierName: sup.name,
      supplierContactPerson: sup.companyName || sup.phone,
      supplierPhone: sup.phone,
      branchId,
      branchName: selectedBranch?.name || 'الفرع الرئيسي',
      warehouseId,
      warehouseName: 'مستودع الخامات الرئيسي',
      buyerId: currentUser?.id || 'usr_1',
      buyerName: currentUser?.fullName || 'مسؤول المشتريات',
      currency: 'EGP',
      exchangeRate: 1,
      paymentTerms,
      shippingTerms,
      purchaseRequestId: pr?.id,
      purchaseRequestNumber: pr?.prNumber,
      projectId: projectId || undefined,
      projectName: selectedProj?.projectName,
      customerName: selectedProj?.customerName,
      items: validItems,
      subtotal,
      totalDiscount,
      taxTotal,
      shippingCost,
      otherCharges,
      grandTotal,
      paidAmount: 0,
      balanceDue: grandTotal,
      status: 'pending_approval',
      receivingStatus: 'pending',
      paymentStatus: 'unpaid',
      receiptNotes: [],
      vendorBills: [],
      revisions: [],
      notes,
      createdByUserName: currentUser?.fullName || 'مسؤول المشتريات',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
            <h3 className="text-lg font-bold text-slate-800">إنشاء أمر شراء رسمي (Enterprise Purchase Order)</h3>
            <p className="text-xs text-slate-500">إصدار التزام الشراء القانوني المعتمد للمورد والربط مع المشروع والمستودع</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {/* Suppliers & References */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">المورد المعتمد *</label>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">طلب الشراء المرجعي (PR)</label>
            <select
              value={purchaseRequestId}
              onChange={(e) => handlePrChange(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            >
              <option value="">-- أمر شراء مباشر (بدون PR) --</option>
              {purchaseRequests
                .filter(p => ['approved', 'partially_processed'].includes(p.status))
                .map(p => (
                  <option key={p.id} value={p.id}>{p.prNumber} - {p.projectName || 'عام'}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">المشروع المرتبط</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            >
              <option value="">-- مخزون عام (بدون مشروع) --</option>
              {customProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.projectName} ({p.customerName})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Warehouse, Branch & Delivery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">تاريخ التوريد المتوقع *</label>
            <input
              type="date"
              required
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">الفرع / المصنع</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">شروط الدفع المتفق عليها</label>
            <input
              type="text"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800">بنود وتفاصيل أمر الشراء *</label>
            <button
              type="button"
              onClick={() => setItems([...items, { itemId: '', itemCode: '', itemName: '', itemCategory: 'خامات ومستلزمات', specifications: '', quantity: 1, uom: 'قطعة', unitPrice: 0, discountPercent: 0, taxRate: 14 }])}
              className="text-xs text-[#C87A38] font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة صنف</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">الصنف</th>
                  <th className="py-2.5 px-3">الكمية</th>
                  <th className="py-2.5 px-3">سعر الوحدة</th>
                  <th className="py-2.5 px-3">خصم %</th>
                  <th className="py-2.5 px-3">ضريبة 14%</th>
                  <th className="py-2.5 px-3">الإجمالي</th>
                  <th className="py-2.5 px-2 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => {
                  const sub = item.quantity * item.unitPrice;
                  const disc = (sub * item.discountPercent) / 100;
                  const tax = ((sub - disc) * item.taxRate) / 100;
                  const lineTotal = sub - disc + tax;

                  return (
                    <tr key={idx}>
                      <td className="p-2 min-w-[180px]">
                        <select
                          required
                          value={item.itemId}
                          onChange={(e) => handleItemSelect(idx, e.target.value)}
                          className="w-full p-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-[#C87A38]"
                        >
                          <option value="">-- اختر الصنف --</option>
                          {materials.map(i => (
                            <option key={i.id} value={i.id}>{i.name} ({i.code || i.id})</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 w-24">
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          required
                          value={item.quantity || ''}
                          onChange={(e) => {
                            const updated = [...items];
                            updated[idx].quantity = parseFloat(e.target.value) || 0;
                            setItems(updated);
                          }}
                          className="w-full p-1.5 border border-slate-200 rounded-lg font-mono text-center text-xs focus:ring-1 focus:ring-[#C87A38]"
                        />
                      </td>
                      <td className="p-2 w-28">
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          required
                          value={item.unitPrice || ''}
                          onChange={(e) => {
                            const updated = [...items];
                            updated[idx].unitPrice = parseFloat(e.target.value) || 0;
                            setItems(updated);
                          }}
                          className="w-full p-1.5 border border-slate-200 rounded-lg font-mono text-xs focus:ring-1 focus:ring-[#C87A38]"
                        />
                      </td>
                      <td className="p-2 w-16">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercent}
                          onChange={(e) => {
                            const updated = [...items];
                            updated[idx].discountPercent = parseFloat(e.target.value) || 0;
                            setItems(updated);
                          }}
                          className="w-full p-1.5 border border-slate-200 rounded-lg font-mono text-center text-xs focus:ring-1 focus:ring-[#C87A38]"
                        />
                      </td>
                      <td className="p-2 w-16">
                        <input
                          type="number"
                          min="0"
                          value={item.taxRate}
                          onChange={(e) => {
                            const updated = [...items];
                            updated[idx].taxRate = parseFloat(e.target.value) || 0;
                            setItems(updated);
                          }}
                          className="w-full p-1.5 border border-slate-200 rounded-lg font-mono text-center text-xs focus:ring-1 focus:ring-[#C87A38]"
                        />
                      </td>
                      <td className="p-2 font-mono font-bold text-slate-800">
                        {lineTotal.toLocaleString()} ج.م
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => items.length > 1 && setItems(items.filter((_, i) => i !== idx))}
                          disabled={items.length <= 1}
                          className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">شروط الشحن والتسليم</label>
              <input
                type="text"
                value={shippingTerms}
                onChange={(e) => setShippingTerms(e.target.value)}
                className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ملاحظات وشروط إضافية</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl"
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
            <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-100 pt-2">
              <span>إجمالي قيمة أمر الشراء (PO Total):</span>
              <span className="font-mono text-[#C87A38] text-base">{grandTotal.toLocaleString()} ج.م</span>
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
            إصدار أمر الشراء (إرسال للاعتماد)
          </button>
        </div>
      </form>
    </div>
  );
};
