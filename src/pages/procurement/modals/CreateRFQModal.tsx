import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Building2, Send, Clock, Layers } from 'lucide-react';
import { useERP } from '../../../context/ERPContext';
import { RFQItem, RFQSupplierInvitation } from '../../../types/procurement';

interface CreateRFQModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPrId?: string;
}

export const CreateRFQModal: React.FC<CreateRFQModalProps> = ({
  isOpen,
  onClose,
  defaultPrId
}) => {
  const { 
    createRFQ, 
    purchaseRequests, 
    materials, 
    suppliers,
    rfqs,
    currentUser,
    branches
  } = useERP();

  const [selectedPrId, setSelectedPrId] = useState<string>(defaultPrId || '');
  const [responseDeadline, setResponseDeadline] = useState<string>(
    new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [requiredDeliveryDate, setRequiredDeliveryDate] = useState<string>(
    new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [paymentTermsRequested, setPaymentTermsRequested] = useState<string>('سداد 30 يوم من تاريخ الفاتورة');
  const [deliveryTermsRequested, setDeliveryTermsRequested] = useState<string>('التوريد لمخزن مصنع العاشر من رمضان');
  const [notes, setNotes] = useState<string>('');

  // Selected suppliers for RFQ
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);

  // Items
  const [items, setItems] = useState<Array<{
    itemId: string;
    itemCode: string;
    itemName: string;
    quantity: number;
    uom: string;
    specifications: string;
  }>>([
    {
      itemId: '',
      itemCode: '',
      itemName: '',
      quantity: 10,
      uom: 'متر',
      specifications: ''
    }
  ]);

  if (!isOpen) return null;

  const handlePrChange = (prId: string) => {
    setSelectedPrId(prId);
    const pr = purchaseRequests.find(p => p.id === prId);
    if (pr) {
      if (pr.requiredDate) setRequiredDeliveryDate(pr.requiredDate);
      
      const prItems = pr.items.map(item => ({
        itemId: item.itemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        quantity: item.remainingQuantity > 0 ? item.remainingQuantity : item.quantity,
        uom: item.uom,
        specifications: item.specifications || ''
      }));
      setItems(prItems);

      if (pr.suggestedSupplierId) {
        setSelectedSupplierIds([pr.suggestedSupplierId]);
      }
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
        uom: selectedItem.unit || 'قطعة'
      };
    }
    setItems(updated);
  };

  const toggleSupplier = (supId: string) => {
    if (selectedSupplierIds.includes(supId)) {
      setSelectedSupplierIds(selectedSupplierIds.filter(id => id !== supId));
    } else {
      setSelectedSupplierIds([...selectedSupplierIds, supId]);
    }
  };

  const handleCreateRFQ = (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items.filter(i => i.itemId && i.quantity > 0);
    if (validItems.length === 0) {
      alert('يرجى إضافة صنف واحد على الأقل للطلب');
      return;
    }

    if (selectedSupplierIds.length === 0) {
      alert('يرجى اختيار مورد واحد على الأقل لإرسال طلب عرض الأسعار إليه');
      return;
    }

    const pr = purchaseRequests.find(p => p.id === selectedPrId);
    const rfqNumber = `RFQ-${new Date().getFullYear()}-${String(rfqs.length + 1).padStart(4, '0')}`;

    const targetSuppliers: RFQSupplierInvitation[] = selectedSupplierIds.map(supId => {
      const s = suppliers.find(sup => sup.id === supId);
      return {
        supplierId: supId,
        supplierName: s?.name || 'مورد',
        supplierCode: s?.id,
        contactPerson: s?.companyName || s?.phone,
        email: s?.email,
        phone: s?.phone,
        invitedDate: new Date().toISOString().split('T')[0],
        sentDate: new Date().toISOString().split('T')[0],
        invitationStatus: 'invited'
      };
    });

    createRFQ({
      rfqNumber,
      issueDate: new Date().toISOString().split('T')[0],
      responseDeadline,
      requiredDeliveryDate,
      purchaseRequestId: pr?.id,
      purchaseRequestNumber: pr?.prNumber,
      projectId: pr?.projectId,
      projectName: pr?.projectName,
      customerName: pr?.customerName,
      branchId: pr?.branchId || branches[0]?.id || 'branch_1',
      branchName: pr?.branchName || 'الفرع الرئيسي',
      warehouseId: pr?.warehouseId || 'wh_main',
      warehouseName: pr?.warehouseName || 'مستودع الخامات الرئيسي',
      items: validItems.map((item, idx) => ({
        id: `rfq-item-${Date.now()}-${idx}`,
        itemId: item.itemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        quantity: item.quantity,
        uom: item.uom,
        technicalSpecs: item.specifications,
        requiredDeliveryDate,
        deliveryLocation: deliveryTermsRequested
      })),
      targetSuppliers,
      paymentTermsRequested,
      deliveryTermsRequested,
      status: 'draft',
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
        onSubmit={handleCreateRFQ}
        className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">إنشاء طلب عروض أسعار (RFQ)</h3>
            <p className="text-xs text-slate-500">دعوة الموردين لتقديم عروض الأسعار والشروط التجارية للمقارنة</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {/* PR Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">طلب الشراء المصدر (PR)</label>
          <select
            value={selectedPrId}
            onChange={(e) => handlePrChange(e.target.value)}
            className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
          >
            <option value="">-- بدون طلب شراء مسبق (طلب حر) --</option>
            {purchaseRequests
              .filter(pr => ['approved', 'partially_processed'].includes(pr.status))
              .map(pr => (
                <option key={pr.id} value={pr.id}>
                  {pr.prNumber} - {pr.projectName || 'عام'} ({pr.items.length} أصناف)
                </option>
              ))}
          </select>
        </div>

        {/* Deadlines & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">الموعد النهائي لتلقي العروض *</label>
            <input
              type="date"
              required
              value={responseDeadline}
              onChange={(e) => setResponseDeadline(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">تاريخ التوريد المطلوب</label>
            <input
              type="date"
              value={requiredDeliveryDate}
              onChange={(e) => setRequiredDeliveryDate(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">شروط الدفع المطلوبة</label>
            <input
              type="text"
              value={paymentTermsRequested}
              onChange={(e) => setPaymentTermsRequested(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            />
          </div>
        </div>

        {/* Suppliers selection */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2">
            الموردين المدعوين لتقديم العروض ({selectedSupplierIds.length} محددين) *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
            {suppliers.map(sup => {
              const isChecked = selectedSupplierIds.includes(sup.id);
              return (
                <label
                  key={sup.id}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border transition ${
                    isChecked
                      ? 'bg-amber-50/80 border-amber-300 text-amber-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSupplier(sup.id)}
                    className="rounded text-[#C87A38] focus:ring-[#C87A38]"
                  />
                  <span className="truncate">{sup.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800">الأصناف والكميات المطلوبة</label>
            <button
              type="button"
              onClick={() => setItems([...items, { itemId: '', itemCode: '', itemName: '', quantity: 1, uom: 'قطعة', specifications: '' }])}
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
                  <th className="py-2.5 px-3">الوحدة</th>
                  <th className="py-2.5 px-3">المواصفات الفنية المطلوبة</th>
                  <th className="py-2.5 px-2 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 min-w-[200px]">
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
                    <td className="p-2 w-20 text-slate-600 text-center font-medium">
                      {item.uom}
                    </td>
                    <td className="p-2 min-w-[180px]">
                      <input
                        type="text"
                        value={item.specifications || ''}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].specifications = e.target.value;
                          setItems(updated);
                        }}
                        placeholder="سمك، مواصفة، كود..."
                        className="w-full p-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-[#C87A38]"
                      />
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">شروط وملاحظات إضافية للتوريد</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="شروط التوصيل، التغليف، مواعيد الاستلام بالمصنع..."
            className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
          />
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
            حفظ وإنشاء طلب RFQ
          </button>
        </div>
      </form>
    </div>
  );
};
