import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Building2, Package, AlertCircle } from 'lucide-react';
import { useERP } from '../../../context/ERPContext';
import { PurchaseRequestItem, PRPriority, PRSourceType } from '../../../types/procurement';

interface CreatePurchaseRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePurchaseRequestModal: React.FC<CreatePurchaseRequestModalProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    createPurchaseRequest, 
    customProjects, 
    materials, 
    suppliers,
    branches,
    currentUser,
    purchaseRequests
  } = useERP();

  const [sourceType, setSourceType] = useState<PRSourceType>('manual_general');
  const [projectId, setProjectId] = useState<string>('');
  const [requiredDate, setRequiredDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<PRPriority>('normal');
  const [branchId, setBranchId] = useState<string>(branches[0]?.id || 'branch_1');
  const [warehouseId, setWarehouseId] = useState<string>('wh_main');
  const [suggestedSupplierId, setSuggestedSupplierId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [items, setItems] = useState<Array<{
    itemId: string;
    itemCode: string;
    itemName: string;
    uom: string;
    quantity: number;
    estimatedUnitPrice?: number;
    specifications?: string;
  }>>([
    {
      itemId: '',
      itemCode: '',
      itemName: '',
      uom: 'متر مربع',
      quantity: 10,
      estimatedUnitPrice: 0,
      specifications: ''
    }
  ]);

  if (!isOpen) return null;

  const handleItemSelect = (index: number, itemId: string) => {
    const selectedItem = materials.find(i => i.id === itemId);
    const updated = [...items];
    if (selectedItem) {
      updated[index] = {
        ...updated[index],
        itemId: selectedItem.id,
        itemCode: selectedItem.code || selectedItem.id,
        itemName: selectedItem.name,
        uom: selectedItem.unit || 'قطعة',
        estimatedUnitPrice: selectedItem.currentReferenceCost || 0
      };
    }
    setItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...items];
    updated[index].quantity = qty;
    setItems(updated);
  };

  const handlePriceChange = (index: number, price: number) => {
    const updated = [...items];
    updated[index].estimatedUnitPrice = price;
    setItems(updated);
  };

  const handleSpecChange = (index: number, spec: string) => {
    const updated = [...items];
    updated[index].specifications = spec;
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        itemId: '',
        itemCode: '',
        itemName: '',
        uom: 'قطعة',
        quantity: 1,
        estimatedUnitPrice: 0,
        specifications: ''
      }
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items.filter(i => i.itemId && i.quantity > 0);
    if (validItems.length === 0) {
      alert('يرجى اختيار صنف واحد على الأقل وتحديد كميته');
      return;
    }

    const selectedProj = customProjects.find((p) => p.id === projectId);
    const selectedSup = suppliers.find(s => s.id === suggestedSupplierId);
    const selectedBranch = branches.find(b => b.id === branchId);
    const totalEst = validItems.reduce((acc, curr) => acc + (curr.estimatedUnitPrice || 0) * curr.quantity, 0);

    const prNumber = `PR-${new Date().getFullYear()}-${String(purchaseRequests.length + 1).padStart(4, '0')}`;

    createPurchaseRequest({
      prNumber,
      requestDate: new Date().toISOString().split('T')[0],
      requiredDate,
      priority,
      status: 'pending_approval',
      requesterId: currentUser?.id || 'usr_1',
      requesterName: currentUser?.fullName || 'مسؤول المشتريات',
      department: 'warehouse',
      sourceType,
      projectId: projectId || undefined,
      projectName: selectedProj?.projectName,
      customerName: selectedProj?.customerName,
      branchId,
      branchName: selectedBranch?.name || 'الفرع الرئيسي',
      warehouseId,
      warehouseName: 'مستودع الخامات الرئيسي',
      items: validItems.map((item, idx) => ({
        id: `pr-item-${Date.now()}-${idx}`,
        itemId: item.itemId,
        itemType: 'material',
        itemCode: item.itemCode,
        itemName: item.itemName,
        itemCategory: 'خامات ومستلزمات',
        quantity: item.quantity,
        uom: item.uom,
        estimatedUnitCost: item.estimatedUnitPrice || 0,
        estimatedTotalCost: (item.estimatedUnitPrice || 0) * item.quantity,
        specifications: item.specifications,
        requiredDate: requiredDate,
        processedQuantity: 0,
        remainingQuantity: item.quantity,
        status: 'pending'
      })),
      totalEstimatedValue: totalEst,
      suggestedSupplierId: suggestedSupplierId || undefined,
      suggestedSupplierName: selectedSup?.name,
      rfqIds: [],
      rfqNumbers: [],
      poIds: [],
      poNumbers: [],
      revisions: [],
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <form 
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">إنشاء طلب شراء جديد (Purchase Request)</h3>
            <p className="text-xs text-slate-500">تسجيل طلب توريد خامات أو إكسسوارات مع ربطها بالمشروع والمستودع</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {/* Basic Meta Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">مصدر الطلب *</label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as PRSourceType)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            >
              <option value="manual_general">طلب شراء عام للمخزن</option>
              <option value="manual_project">طلب مخصص لمشروع تفصيل</option>
              <option value="planning_proposal">مقترح تخطيط الاحتياجات (MRP)</option>
              <option value="safety_stock">تعويض حد الأمان للمخزون (Safety Stock)</option>
              <option value="production_shortage">نقص تشغيل بالورشة والإنتاج</option>
              <option value="maintenance">صيانة وقطع غيار</option>
              <option value="admin">طلب إداري</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">المشروع المرتبط</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            >
              <option value="">-- عام للمخزن (بدون مشروع مخصص) --</option>
              {customProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.projectName} ({p.customerName})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">تاريخ الاحتياج المطلوب *</label>
            <input
              type="date"
              required
              value={requiredDate}
              onChange={(e) => setRequiredDate(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">الأولوية</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PRPriority)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            >
              <option value="normal">عادية (Standard)</option>
              <option value="high">عالية (High)</option>
              <option value="urgent">طوارئ / عاجل جداً (Urgent)</option>
            </select>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">المورد المقترح (اختياري)</label>
            <select
              value={suggestedSupplierId}
              onChange={(e) => setSuggestedSupplierId(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            >
              <option value="">-- بدون مورد مقترح --</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800">بنود الأصناف المطلوبة *</label>
            <button
              type="button"
              onClick={addItemRow}
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
                  <th className="py-2.5 px-3">الصنف من الدليل</th>
                  <th className="py-2.5 px-3">الكمية</th>
                  <th className="py-2.5 px-3">الوحدة</th>
                  <th className="py-2.5 px-3">السعر التقديري</th>
                  <th className="py-2.5 px-3">المواصفات الفنية</th>
                  <th className="py-2.5 px-2 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
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
                        onChange={(e) => handleQuantityChange(idx, parseFloat(e.target.value) || 0)}
                        className="w-full p-1.5 border border-slate-200 rounded-lg font-mono text-center text-xs focus:ring-1 focus:ring-[#C87A38]"
                      />
                    </td>
                    <td className="p-2 w-20 text-slate-600 text-center font-medium">
                      {item.uom}
                    </td>
                    <td className="p-2 w-28">
                      <input
                        type="number"
                        min="0"
                        value={item.estimatedUnitPrice || ''}
                        onChange={(e) => handlePriceChange(idx, parseFloat(e.target.value) || 0)}
                        placeholder="ج.م"
                        className="w-full p-1.5 border border-slate-200 rounded-lg font-mono text-xs focus:ring-1 focus:ring-[#C87A38]"
                      />
                    </td>
                    <td className="p-2 min-w-[150px]">
                      <input
                        type="text"
                        value={item.specifications || ''}
                        onChange={(e) => handleSpecChange(idx, e.target.value)}
                        placeholder="سمك، كود لون، نوع تشطيب..."
                        className="w-full p-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-[#C87A38]"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
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
          <label className="block text-xs font-semibold text-slate-700 mb-1">ملاحظات ومبررات الطلب</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أدخل أي تفاصيل إضافية أو متطلبات خاصة بالمشتريات..."
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
            حفظ وإرسال للاعتماد
          </button>
        </div>
      </form>
    </div>
  );
};
