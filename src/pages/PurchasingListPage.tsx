import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { PurchaseOrder, ItemType } from '../types/erp';
import { InventoryService } from '../services/inventoryService';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  PackageCheck,
  Truck,
  DollarSign,
  Eye,
  Building,
  CheckCircle2,
  X,
  FileText,
  Trash2
} from 'lucide-react';
import { ReceiveGoodsModal } from '../components/modals/ReceiveGoodsModal';

export const PurchasingListPage: React.FC = () => {
  const {
    purchaseOrders,
    suppliers,
    materials,
    products,
    availableBranches,
    createPurchaseOrder,
    receivePurchaseItems,
    checkPermission
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceivingStatus, setSelectedReceivingStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);

  // New PO Form State
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || 'sup-m1');
  const [branchId, setBranchId] = useState<string>(availableBranches[0]?.id || 'branch-2');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>('2026-09-05');
  const [paidAmount, setPaidAmount] = useState<number>(10000);
  const [notes, setNotes] = useState<string>('');

  // PO Items Cart Builder
  const [poItems, setPoItems] = useState<{
    itemId: string;
    itemType: ItemType;
    itemName: string;
    itemCode: string;
    quantity: number;
    unitCost: number;
    unit: string;
  }[]>([
    {
      itemId: materials[0]?.id || 'mat-1',
      itemType: 'material',
      itemName: materials[0]?.name || 'MDF أبيض 18مم اسباني',
      itemCode: materials[0]?.code || 'MAT-MDF-W18',
      quantity: 20,
      unitCost: materials[0]?.currentReferenceCost || 1250,
      unit: materials[0]?.unit || 'Sheet'
    }
  ]);

  const [selectedItemType, setSelectedItemType] = useState<ItemType>('material');
  const [selectedItemId, setSelectedItemId] = useState<string>(materials[0]?.id || 'mat-1');
  const [itemQty, setItemQty] = useState<number>(10);
  const [itemCost, setItemCost] = useState<number>(1250);

  const canCreate = checkPermission('inventory', 'create');

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          po.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedReceivingStatus === 'all' || po.receivingStatus === selectedReceivingStatus;

    return matchesSearch && matchesStatus;
  });

  const handleAddItemToCart = () => {
    if (selectedItemType === 'material') {
      const mat = materials.find(m => m.id === selectedItemId);
      if (!mat) return;
      setPoItems(prev => [
        ...prev,
        {
          itemId: mat.id,
          itemType: 'material',
          itemName: mat.name,
          itemCode: mat.code,
          quantity: itemQty,
          unitCost: itemCost || mat.currentReferenceCost,
          unit: mat.unit
        }
      ]);
    } else {
      const prod = products.find(p => p.id === selectedItemId);
      if (!prod) return;
      setPoItems(prev => [
        ...prev,
        {
          itemId: prod.id,
          itemType: 'product',
          itemName: prod.name,
          itemCode: prod.code,
          quantity: itemQty,
          unitCost: itemCost || prod.defaultPurchaseCost,
          unit: 'قطعة'
        }
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setPoItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0) return;

    const supplier = suppliers.find(s => s.id === supplierId) || suppliers[0];
    const branch = availableBranches.find(b => b.id === branchId) || availableBranches[0];

    const formattedItems = poItems.map((item, idx) => {
      const qty = Number(item.quantity) || 1;
      const unitCost = Number(item.unitCost) || 0;
      return {
        id: `poi-${Date.now()}-${idx}`,
        itemId: item.itemId,
        itemType: item.itemType,
        itemName: item.itemName,
        itemCode: item.itemCode,
        quantity: qty,
        receivedQuantity: 0,
        unit: item.unit || 'وحدة',
        unitCost,
        totalCost: qty * unitCost
      };
    });

    const totalAmount = formattedItems.reduce((sum, item) => sum + item.totalCost, 0);
    const validPaid = Math.min(totalAmount, Math.max(0, Number(paidAmount) || 0));

    createPurchaseOrder({
      supplierId: supplier?.id || 'sup-1',
      supplierName: supplier?.name || 'مورد عام',
      branchId: branch?.id || 'branch-1',
      branchName: branch?.name || 'المخزن الرئيسي',
      expectedDeliveryDate,
      items: formattedItems,
      totalAmount,
      paidAmount: validPaid,
      balanceDue: totalAmount - validPaid,
      notes
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">أوامر الشراء والتوريد (Purchasing & Material Receiving)</h1>
            <span className="bg-[#C87A38]/15 text-[#C87A38] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#C87A38]/30">
              {filteredPOs.length} أمر توريد
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة فواتير الشراء، استلام الخامات والمنتجات بالمخازن، وتأثيرها المالي في كشوف الموردين
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-[#361D13] hover:bg-[#23120A] text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4 text-[#C87A38]" />
            <span>إنشاء أمر شراء وتوريد جديد</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم أمر الشراء أو اسم المورد..."
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30"
            />
          </div>

          <div>
            <select
              value={selectedReceivingStatus}
              onChange={(e) => setSelectedReceivingStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">كل حالات الاستلام الفعلي</option>
              <option value="pending">في انتظار الاستلام</option>
              <option value="partially_received">استلام جزئي للمخزن</option>
              <option value="fully_received">تم الاستلام بالكامل</option>
            </select>
          </div>

        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#361D13] text-white font-bold border-b border-emerald-900/50">
              <tr>
                <th className="p-4 min-w-[180px] text-right whitespace-nowrap">رقم الأمر والمورد</th>
                <th className="p-4 min-w-[150px] text-right whitespace-nowrap">المخزن المستهدف</th>
                <th className="p-4 min-w-[130px] text-left whitespace-nowrap">إجمالي الإذن</th>
                <th className="p-4 min-w-[130px] text-left whitespace-nowrap">المسدد والمتبقي</th>
                <th className="p-4 min-w-[150px] text-center whitespace-nowrap">حالة الاستلام المخزني</th>
                <th className="p-4 min-w-[150px] text-center whitespace-nowrap">الإجراءات السريعة</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredPOs.map(po => {
                const receivingMeta = InventoryService.getReceivingStatusMeta(po.receivingStatus);

                return (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="p-4 whitespace-nowrap">
                      <div>
                        <p className="font-black text-slate-900 text-sm">{po.poNumber}</p>
                        <p className="text-[11px] text-slate-500 font-bold">{po.supplierName}</p>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-slate-800 whitespace-nowrap">
                      {po.branchName}
                    </td>

                    <td className="p-4 text-left font-black text-slate-900 font-mono text-sm whitespace-nowrap">
                      {po.totalAmount.toLocaleString('ar-EG')} ج.م
                    </td>

                    <td className="p-4 text-left font-mono whitespace-nowrap">
                      <p className="text-emerald-700 font-bold">مسدد: {po.paidAmount.toLocaleString('ar-EG')} ج.م</p>
                      {po.balanceDue > 0 && (
                        <p className="text-rose-700 font-bold text-[10px]">متبقي: {po.balanceDue.toLocaleString('ar-EG')} ج.م</p>
                      )}
                    </td>

                    <td className="p-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black border whitespace-nowrap ${receivingMeta.bgClass}`}>
                        {receivingMeta.label}
                      </span>
                    </td>

                    <td className="p-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {po.receivingStatus !== 'fully_received' && (
                          <button
                            onClick={() => setReceivingPO(po)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs flex items-center gap-1 shrink-0"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>إثبات استلام</span>
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add PO Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">إصدار أمر شراء جديد (خامات / منتجات جاهزة)</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المورد *</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.companyName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المخزن / المقر المستلم *</label>
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
              </div>

              {/* CART ITEM BUILDER */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <p className="font-black text-slate-900">إضافة أصناف لأمر الشراء:</p>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">نوع الصنف:</label>
                    <select
                      value={selectedItemType}
                      onChange={(e) => {
                        const nextType = e.target.value as ItemType;
                        setSelectedItemType(nextType);
                        if (nextType === 'material') {
                          setSelectedItemId(materials[0]?.id || '');
                          setItemCost(materials[0]?.currentReferenceCost || 1000);
                        } else {
                          setSelectedItemId(products[0]?.id || '');
                          setItemCost(products[0]?.defaultPurchaseCost || 10000);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="material">خامة تصنيع</option>
                      <option value="product">منتج أثاث جاهز</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">الصنف المطلوب:</label>
                    <select
                      value={selectedItemId}
                      onChange={(e) => {
                        setSelectedItemId(e.target.value);
                        if (selectedItemType === 'material') {
                          const m = materials.find(x => x.id === e.target.value);
                          if (m) setItemCost(m.currentReferenceCost);
                        } else {
                          const p = products.find(x => x.id === e.target.value);
                          if (p) setItemCost(p.defaultPurchaseCost);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold"
                    >
                      {selectedItemType === 'material' ? (
                        materials.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                        ))
                      ) : (
                        products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">الكمية:</label>
                    <input
                      type="number"
                      min={1}
                      value={itemQty}
                      onChange={(e) => setItemQty(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-center"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-bold">سعر الشراء الفردي:</span>
                    <input
                      type="number"
                      value={itemCost}
                      onChange={(e) => setItemCost(Number(e.target.value))}
                      className="w-28 px-2.5 py-1 bg-white border border-amber-300 rounded-xl font-bold dir-ltr text-left"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItemToCart}
                    className="px-4 py-1.5 bg-[#361D13] text-white font-black rounded-xl"
                  >
                    + إضافة الصنف للأمر
                  </button>
                </div>

                {/* Items Table */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  {poItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] font-bold">
                      <span>• {item.itemName} ({item.quantity} {item.unit})</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-amber-900">{(item.quantity * item.unitCost).toLocaleString('ar-EG')} ج.م</span>
                        <button type="button" onClick={() => handleRemoveItem(idx)} className="text-rose-600 hover:text-rose-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FINANCIAL SUMMARY */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المدفوع للمورد حالياً (ج.م)</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold dir-ltr text-left"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الاستلام المتوقع</label>
                  <input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold dir-ltr text-left"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded-xl font-bold text-slate-700">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2 bg-[#361D13] text-white font-black rounded-xl shadow-md">
                  تأكيد وتأطير أمر الشراء
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Receive Goods Modal */}
      {receivingPO && (
        <ReceiveGoodsModal
          isOpen={!!receivingPO}
          po={receivingPO}
          onConfirm={(receivedMap, notes) => {
            receivePurchaseItems(receivingPO.id, receivedMap, notes);
            setReceivingPO(null);
          }}
          onClose={() => setReceivingPO(null)}
        />
      )}

    </div>
  );
};
