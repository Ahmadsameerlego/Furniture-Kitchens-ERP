// ====================================================
// REWAQ ERP — GOODS RECEIPT NOTES (GRN) VIEW
// Inward Stock Receiving, PO Matching, GR/IR Clearing & Costing
// ====================================================

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { GoodsReceiptNote, GRNType } from '../../types/erp';
import {
  ArrowDownLeft,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Building2,
  Calendar,
  Layers,
  FileText,
  Printer,
  ShieldCheck,
  Eye,
  Trash2
} from 'lucide-react';

export const GoodsReceiptNotesView: React.FC = () => {
  const {
    goodsReceiptNotes,
    warehouses,
    suppliers,
    itemMasterCards,
    createGoodsReceiptNote,
    showToast
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGRNForView, setSelectedGRNForView] = useState<GoodsReceiptNote | null>(null);

  // New GRN Form State
  const [formType, setFormType] = useState<GRNType>('purchase_receipt');
  const [formSupplierId, setFormSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [formWarehouseId, setFormWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [formPoNumber, setFormPoNumber] = useState<string>('PO-2026-0045');
  const [formNotes, setFormNotes] = useState<string>('استلام وتوريد شحنة خامات خشب ومفصلات');
  
  // Line items state
  const [formItems, setFormItems] = useState<{
    itemId: string;
    itemCode: string;
    itemName: string;
    unit: string;
    orderedQty: number;
    receivedQty: number;
    unitCost: number;
    locationBin: string;
    notes?: string;
  }[]>([
    {
      itemId: itemMasterCards[0]?.id || 'item-101',
      itemCode: itemMasterCards[0]?.code || 'RAW-MDF-18',
      itemName: itemMasterCards[0]?.nameAr || 'لوح خشب MDF إسباني',
      unit: itemMasterCards[0]?.unitNameAr || 'لوح',
      orderedQty: 50,
      receivedQty: 50,
      unitCost: itemMasterCards[0]?.weightedAvgCost || 1000,
      locationBin: itemMasterCards[0]?.locationBin || 'ممر A1',
      notes: 'تم فحص الشحنة ومطابقة الأبعاد'
    }
  ]);

  const handleAddItemRow = () => {
    const defaultItem = itemMasterCards[0];
    setFormItems(prev => [
      ...prev,
      {
        itemId: defaultItem.id,
        itemCode: defaultItem.code,
        itemName: defaultItem.nameAr,
        unit: defaultItem.unitNameAr,
        orderedQty: 10,
        receivedQty: 10,
        unitCost: defaultItem.weightedAvgCost,
        locationBin: defaultItem.locationBin,
        notes: ''
      }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (formItems.length === 1) {
      showToast('يجب أن يحتوي إذن الإضافة على صنف واحد على الأقل', 'warning');
      return;
    }
    setFormItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const targetItem = itemMasterCards.find(i => i.id === itemId);
    if (!targetItem) return;

    setFormItems(prev => prev.map((row, idx) => {
      if (idx === index) {
        return {
          ...row,
          itemId: targetItem.id,
          itemCode: targetItem.code,
          itemName: targetItem.nameAr,
          unit: targetItem.unitNameAr,
          unitCost: targetItem.weightedAvgCost,
          locationBin: targetItem.locationBin
        };
      }
      return row;
    }));
  };

  const handleRowQtyChange = (index: number, qty: number) => {
    setFormItems(prev => prev.map((row, idx) => {
      if (idx === index) {
        return { ...row, orderedQty: qty, receivedQty: qty };
      }
      return row;
    }));
  };

  const handleRowCostChange = (index: number, cost: number) => {
    setFormItems(prev => prev.map((row, idx) => {
      if (idx === index) {
        return { ...row, unitCost: cost };
      }
      return row;
    }));
  };

  const formTotalAmount = formItems.reduce((s, it) => s + (it.receivedQty * it.unitCost), 0);

  const handleSubmitGRN = () => {
    if (formItems.length === 0 || formTotalAmount <= 0) {
      showToast('يرجى إضافة أصناف وتحديد الكميات المستلمة', 'warning');
      return;
    }

    const grn = createGoodsReceiptNote({
      type: formType,
      supplierId: formType === 'purchase_receipt' ? formSupplierId : undefined,
      purchaseOrderId: formType === 'purchase_receipt' ? formPoNumber : undefined,
      warehouseId: formWarehouseId,
      items: formItems,
      notes: formNotes
    });

    if (grn) {
      setShowAddModal(false);
    }
  };

  // Filtered GRNs
  const filteredGRNs = goodsReceiptNotes.filter(grn => {
    const matchesSearch =
      !searchQuery ||
      grn.grnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (grn.supplierName && grn.supplierName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      grn.warehouseName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedTypeFilter === 'all' || grn.type === selectedTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl">
      {/* 1. HEADER */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>حركات الوارد والاستلام — Goods Receipt Notes (GRN) & Inward Stock</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <ArrowDownLeft className="w-8 h-8 text-emerald-500" />
            <span>أذونات الإضافة والاستلام المخزني</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            إثبات دخول الخامات والمشتريات والإنتاج التام للمستودعات، وتحديث أرصدة كروت الأصناف فورياً وتوليد القيود المحاسبية التلقائية (إقفال وسيط GR/IR 213).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء إذن إضافة جديد</span>
        </button>
      </div>

      {/* 2. FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'كافة أذونات الإضافة' },
            { id: 'purchase_receipt', label: 'استلام شراء وتوريد' },
            { id: 'production_receipt', label: 'استلام إنتاج تام من الورشة' },
            { id: 'order_return', label: 'مرتجع خامات من أمر تشغيل' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTypeFilter(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTypeFilter === t.id
                  ? 'bg-emerald-800 text-white shadow-xs font-black'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم الإذن أو المورد أو المستودع..."
            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* 3. GRN LIST TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right text-xs min-w-[1050px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80">
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">رقم إذن الإضافة</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[110px]">التاريخ</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">نوع الإضافة</th>
                <th className="py-3.5 px-4 min-w-[180px]">المصدر / المورد</th>
                <th className="py-3.5 px-4 min-w-[180px]">المستودع المستلم</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[100px] text-center">عدد الأصناف</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px] text-left">إجمالي القيمة</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[110px] text-center">الحالة</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[100px] text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredGRNs.map(grn => (
                <tr key={grn.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {grn.grnNumber}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono whitespace-nowrap">
                    {grn.date}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-xs whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60">
                      {grn.type === 'purchase_receipt' && 'شراء وتوريد خامات'}
                      {grn.type === 'production_receipt' && 'إنتاج تام من الورشة'}
                      {grn.type === 'order_return' && 'مرتجع من أمر شغل'}
                      {grn.type === 'stock_adjustment_surplus' && 'تسوية زيادة جردية'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-800">
                    {grn.supplierName || grn.productionOrderNumber || 'تسوية داخلية'}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-700 font-bold">
                    {grn.warehouseName}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                    {grn.items.length} صنف
                  </td>
                  <td className="py-3.5 px-4 text-left font-black text-emerald-800 whitespace-nowrap">
                    {grn.totalAmount.toLocaleString()} EGP
                  </td>
                  <td className="py-3.5 px-4 text-center font-sans whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>مرحل ومقيد</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-sans whitespace-nowrap">
                    <button
                      onClick={() => setSelectedGRNForView(grn)}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-[#361D13] text-slate-700 hover:text-white text-[11px] font-bold transition-all shadow-2xs"
                    >
                      عرض وتفاصيل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL: CREATE GOODS RECEIPT NOTE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-700">
                <ArrowDownLeft className="w-6 h-6" />
                <h3 className="font-black text-lg text-slate-900">تسجيل إذن إضافة واستلام مخزني (GRN)</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-rose-50 flex items-center justify-center">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">نوع إذن الإضافة:</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as GRNType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="purchase_receipt">استلام توريد خامات من مورد (أمر شراء)</option>
                    <option value="production_receipt">استلام منتجات تامة من ورشة التصنيع (أمر تشغيل)</option>
                    <option value="order_return">مرتجع خامات متبقية من ورشة التصنيع</option>
                    <option value="stock_adjustment_surplus">تسوية زيادة جردية فعلية بالمستودع</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">المستودع المستلم *:</label>
                  <select
                    value={formWarehouseId}
                    onChange={(e) => setFormWarehouseId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                {formType === 'purchase_receipt' && (
                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">المورد المورد *:</label>
                    <select
                      value={formSupplierId}
                      onChange={(e) => setFormSupplierId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name || s.companyName}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Dynamic Line Items Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-xs">الأصناف والخامات المستلمة:</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[11px] font-black flex items-center gap-1 border border-emerald-200/60"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة صنف آخر</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formItems.map((row, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                    >
                      <div className="sm:col-span-5">
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">الصنف:</label>
                        <select
                          value={row.itemId}
                          onChange={(e) => handleItemSelect(idx, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-[11px]"
                        >
                          {itemMasterCards.map(item => (
                            <option key={item.id} value={item.id}>
                              [{item.code}] {item.nameAr}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">الكمية المستلمة ({row.unit}):</label>
                        <input
                          type="number"
                          value={row.receivedQty}
                          onChange={(e) => handleRowQtyChange(idx, parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-center"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">سعر التكلفة (EGP):</label>
                        <input
                          type="number"
                          value={row.unitCost}
                          onChange={(e) => handleRowCostChange(idx, parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-left"
                        />
                      </div>

                      <div className="sm:col-span-2 text-left">
                        <span className="text-[10px] font-bold text-slate-500 block mb-0.5">الإجمالي:</span>
                        <span className="font-mono font-black text-emerald-800">
                          {(row.receivedQty * row.unitCost).toLocaleString()} EGP
                        </span>
                      </div>

                      <div className="sm:col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Bar */}
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs font-bold">
                  <span className="text-emerald-900">إجمالي قيمة إذن الإضافة المخزني:</span>
                  <span className="font-mono font-black text-emerald-900 text-base">
                    {formTotalAmount.toLocaleString()} EGP
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">ملاحظات الفحص والاستلام:</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600">إلغاء</button>
              <button onClick={handleSubmitGRN} className="px-5 py-2 rounded-xl text-xs font-black bg-emerald-700 hover:bg-emerald-600 text-white shadow-lg">
                اعتماد وترحيل إذن الإضافة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: VIEW GRN DETAILS */}
      {selectedGRNForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">إذن إضافة رسمي</span>
                <h3 className="font-black text-lg text-slate-900 mt-1">{selectedGRNForView.grnNumber}</h3>
              </div>
              <button onClick={() => setSelectedGRNForView(null)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">✕</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-bold block">المستودع:</span>
                <span className="font-bold text-slate-800">{selectedGRNForView.warehouseName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">التاريخ:</span>
                <span className="font-mono font-bold text-slate-800">{selectedGRNForView.date}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">المورد / الجهة:</span>
                <span className="font-bold text-slate-800">{selectedGRNForView.supplierName || 'داخلي'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">مسؤول الاستلام:</span>
                <span className="font-bold text-slate-800">{selectedGRNForView.createdByUserName}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-black text-xs text-slate-900 block">تفاصيل الأصناف المستلمة:</span>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">الصنف</th>
                      <th className="py-2.5 px-3 text-center">الكمية</th>
                      <th className="py-2.5 px-3 text-left">التكلفة</th>
                      <th className="py-2.5 px-3 text-left">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {selectedGRNForView.items.map(it => (
                      <tr key={it.id}>
                        <td className="py-2.5 px-3 font-sans font-bold text-slate-800">{it.itemName}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">{it.receivedQty} {it.unit}</td>
                        <td className="py-2.5 px-3 text-left text-slate-600">{it.unitCost.toLocaleString()} EGP</td>
                        <td className="py-2.5 px-3 text-left font-black text-emerald-800">{it.totalCost.toLocaleString()} EGP</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-bold">ملاحظات: {selectedGRNForView.notes || 'لا توجد'}</span>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة إذن الاستلام</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
