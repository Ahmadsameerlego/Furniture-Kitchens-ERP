// ====================================================
// REWAQ ERP — GOODS ISSUE NOTES (GIN) & REQUISITIONS VIEW
// Production Issue (WIP 1133), CNC Maintenance (534) & Scrap Issue (1135)
// ====================================================

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { GoodsIssueNote, GINType, MaterialRequisition } from '../../types/erp';
import { stockAt } from '../../services/warehouseStock';
import {
  ArrowUpRight,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  Wrench,
  Factory,
  Trash2,
  FileText,
  Printer,
  ShieldCheck,
  Eye,
  Clock
} from 'lucide-react';

export const GoodsIssueNotesView: React.FC = () => {
  const {
    goodsIssueNotes,
    materialRequisitions,
    warehouses,
    itemMasterCards,
    productionOrders,
    costCenters,
    createGoodsIssueNote,
    createMaterialRequisition,
    approveMaterialRequisition,
    rejectMaterialRequisition,
    showToast
  } = useERP();

  const [activeSubTab, setActiveSubTab] = useState<'gins' | 'mrns'>('gins');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRequisitionModal, setShowRequisitionModal] = useState(false);
  const [selectedGINForView, setSelectedGINForView] = useState<GoodsIssueNote | null>(null);
  // The approved workshop request this issue fulfils (set when opened from the requests tab)
  const [issuingRequisitionId, setIssuingRequisitionId] = useState<string | null>(null);

  // New GIN Form State
  const [formType, setFormType] = useState<GINType>('production_mo');
  const [formProdOrderId, setFormProdOrderId] = useState<string>(productionOrders[0]?.id || '');
  const [formCostCenterId, setFormCostCenterId] = useState<string>(costCenters[0]?.id || '');
  const [formMachineName, setFormMachineName] = useState<string>('ماكينة CNC روتر 3D - خط 1');
  const [formWarehouseId, setFormWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [formNotes, setFormNotes] = useState<string>('صرف خامات ومستلزمات تصنيع');

  // Line items state
  const [formItems, setFormItems] = useState<{
    itemId: string;
    itemCode: string;
    itemName: string;
    unit: string;
    requestedQty: number;
    issuedQty: number;
    unitCost: number;
    locationBin: string;
    notes?: string;
  }[]>([
    {
      itemId: itemMasterCards[0]?.id || 'item-101',
      itemCode: itemMasterCards[0]?.code || 'RAW-MDF-18',
      itemName: itemMasterCards[0]?.nameAr || 'لوح خشب MDF إسباني',
      unit: itemMasterCards[0]?.unitNameAr || 'لوح',
      requestedQty: 10,
      issuedQty: 10,
      unitCost: itemMasterCards[0]?.weightedAvgCost || 1000,
      locationBin: itemMasterCards[0]?.locationBin || 'ممر A1',
      notes: 'صرف للورشة'
    }
  ]);

  // MRN Form State
  const [mrnPurpose, setMrnPurpose] = useState<'production' | 'maintenance' | 'sample'>('production');
  const [mrnProdOrderId, setMrnProdOrderId] = useState<string>(productionOrders[0]?.id || '');
  const [mrnDepartment, setMrnDepartment] = useState<string>('قسم النجارة والتجميع');
  const [mrnRequiredDate, setMrnRequiredDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [mrnNotes, setMrnNotes] = useState<string>('طلب صرف خامات عاجل لأمر الشغل');

  // MRN Line items state
  const [mrnItems, setMrnItems] = useState<{
    itemId: string;
    itemCode: string;
    itemName: string;
    unit: string;
    requestedQty: number;
    notes?: string;
  }[]>([
    {
      itemId: itemMasterCards[0]?.id || 'item-101',
      itemCode: itemMasterCards[0]?.code || 'RAW-MDF-18',
      itemName: itemMasterCards[0]?.nameAr || 'لوح خشب MDF إسباني',
      unit: itemMasterCards[0]?.unitNameAr || 'لوح',
      requestedQty: 10,
      notes: ''
    }
  ]);

  const handleAddMrnItemRow = () => {
    const defaultItem = itemMasterCards[0];
    setMrnItems(prev => [
      ...prev,
      {
        itemId: defaultItem?.id || '',
        itemCode: defaultItem?.code || '',
        itemName: defaultItem?.nameAr || '',
        unit: defaultItem?.unitNameAr || 'لوح',
        requestedQty: 5,
        notes: ''
      }
    ]);
  };

  const handleRemoveMrnItemRow = (index: number) => {
    if (mrnItems.length === 1) {
      showToast('يجب أن يحتوي طلب الصرف على صنف واحد على الأقل', 'warning');
      return;
    }
    setMrnItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleMrnItemSelect = (index: number, itemId: string) => {
    const targetItem = itemMasterCards.find(i => i.id === itemId);
    if (!targetItem) return;

    setMrnItems(prev => prev.map((row, idx) => {
      if (idx === index) {
        return {
          ...row,
          itemId: targetItem.id,
          itemCode: targetItem.code,
          itemName: targetItem.nameAr,
          unit: targetItem.unitNameAr
        };
      }
      return row;
    }));
  };

  const handleMrnItemQtyChange = (index: number, qty: number) => {
    setMrnItems(prev => prev.map((row, idx) => {
      if (idx === index) {
        return { ...row, requestedQty: qty };
      }
      return row;
    }));
  };

  const handleAddItemRow = () => {
    const defaultItem = itemMasterCards[0];
    setFormItems(prev => [
      ...prev,
      {
        itemId: defaultItem.id,
        itemCode: defaultItem.code,
        itemName: defaultItem.nameAr,
        unit: defaultItem.unitNameAr,
        requestedQty: 5,
        issuedQty: 5,
        unitCost: defaultItem.weightedAvgCost,
        locationBin: defaultItem.locationBin,
        notes: ''
      }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (formItems.length === 1) {
      showToast('يجب أن يحتوي إذن الصرف على صنف واحد على الأقل', 'warning');
      return;
    }
    setFormItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const targetItem = itemMasterCards.find(i => i.id === itemId);
    if (!targetItem) return;
    // The first item decides the issuing warehouse: where that item lives
    if (index === 0) setFormWarehouseId(targetItem.defaultWarehouseId);

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
        return { ...row, requestedQty: qty, issuedQty: qty };
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

  const formTotalAmount = formItems.reduce((s, it) => s + (it.issuedQty * it.unitCost), 0);

  // Free stock of an item on the shelves of the issuing warehouse
  const availableHere = (itemId: string) => {
    const card = itemMasterCards.find(c => c.id === itemId);
    return card ? Math.min(card.availableStock, stockAt(card, formWarehouseId)) : 0;
  };

  const handleSubmitGIN = () => {
    if (formItems.length === 0 || formTotalAmount <= 0) {
      showToast('يرجى إضافة أصناف وتحديد الكميات المنصرفة', 'warning');
      return;
    }

    const targetPO = productionOrders.find(p => p.id === formProdOrderId);
    const targetCC = costCenters.find(c => c.id === formCostCenterId);

    let gin: GoodsIssueNote | null = null;
    try {
    gin = createGoodsIssueNote({
      type: formType,
      productionOrderId: formType === 'production_mo' ? formProdOrderId : undefined,
      productionOrderNumber: formType === 'production_mo' ? (targetPO?.productionNumber || 'PROD-2026-0012') : undefined,
      costCenterId: targetCC?.id,
      costCenterName: targetCC?.nameAr,
      machineName: formType === 'maintenance_workshop' ? formMachineName : undefined,
      warehouseId: formWarehouseId,
      requisitionId: issuingRequisitionId || undefined,
      items: formItems,
      notes: formNotes
    });
    } catch {
      return; // the stock check already explained why in a toast
    }

    if (gin) {
      setShowAddModal(false);
      setIssuingRequisitionId(null);
    }
  };

  const handleSubmitMRN = () => {
    if (mrnItems.length === 0) {
      showToast('يرجى إضافة صنف واحد على الأقل وتحديد الكميات المطلوبة', 'warning');
      return;
    }

    const hasInvalidQty = mrnItems.some(it => !it.requestedQty || it.requestedQty <= 0);
    if (hasInvalidQty) {
      showToast('يرجى التأكد من كتابة كميات صحيحة أكبر من الصفر لكافة الأصناف', 'warning');
      return;
    }

    const targetPO = productionOrders.find(p => p.id === mrnProdOrderId);
    createMaterialRequisition({
      purpose: mrnPurpose,
      productionOrderId: mrnPurpose === 'production' ? mrnProdOrderId : undefined,
      productionOrderNumber: mrnPurpose === 'production' ? (targetPO?.productionNumber || 'PROD-2026-0012') : undefined,
      department: mrnDepartment,
      requiredDate: mrnRequiredDate,
      items: mrnItems,
      notes: mrnNotes
    });
    setShowRequisitionModal(false);
  };

  // Filtered GINs
  const filteredGINs = goodsIssueNotes.filter(gin => {
    const matchesSearch =
      !searchQuery ||
      gin.ginNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (gin.productionOrderNumber && gin.productionOrderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      gin.warehouseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (gin.notes && gin.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedTypeFilter === 'all' || gin.type === selectedTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl">
      {/* 1. HEADER */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>حركات المنصرف المخزني — Goods Issue Notes (GIN) & Material Consumption</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <ArrowUpRight className="w-8 h-8 text-rose-500" />
            <span>أذونات وطلبات الصرف المخزني</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            صرف الخامات لأوامر التصنيع (تحميل WIP 1133)، صرف مهمات صيانة ماكينات الـ CNC (حساب 534)، وصرف هالك الورشة، مع خصم فوري من رصيد كروت الأصناف.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowRequisitionModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
          >
            <Clock className="w-4 h-4" />
            <span>طلب صرف خامات (MRN)</span>
          </button>

          <button
            onClick={() => { setIssuingRequisitionId(null); setShowAddModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-700 hover:bg-rose-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إصدار إذن صرف فوري</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-TABS & SEARCH */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('gins')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeSubTab === 'gins'
                  ? 'bg-[#361D13] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              أذونات الصرف المنفذة ({goodsIssueNotes.length})
            </button>

            <button
              onClick={() => setActiveSubTab('mrns')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeSubTab === 'mrns'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              طلبات الصرف من الورشة ({materialRequisitions.length})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم إذن الصرف أو أمر الشغل..."
              className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600"
            />
          </div>
        </div>

        {activeSubTab === 'gins' && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            {[
              { id: 'all', label: 'كافة أنواع الصرف' },
              { id: 'production_mo', label: 'صرف لأمر إنتاج (WIP)' },
              { id: 'maintenance_workshop', label: 'صيانة ماكينات الورشة' },
              { id: 'scrap_waste', label: 'هالك وتوالف' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTypeFilter(t.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedTypeFilter === t.id
                    ? 'bg-rose-800 text-white shadow-2xs font-black'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. CONTENT: GIN LIST OR MRN LIST */}
      {activeSubTab === 'gins' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80">
                  <th className="py-3.5 px-3 min-w-[90px]">رقم إذن الصرف</th>
                  <th className="py-3.5 px-3 min-w-[70px]">التاريخ</th>
                  <th className="py-3.5 px-3 min-w-[100px]">نوع الصرف والتوجيه</th>
                  <th className="py-3.5 px-3 min-w-[110px]">الجهة / أمر الشغل</th>
                  <th className="py-3.5 px-3 min-w-[110px]">المستودع المنصرف منه</th>
                  <th className="py-3.5 px-3 min-w-[60px] text-center">عدد الأصناف</th>
                  <th className="py-3.5 px-3 min-w-[80px] text-left">إجمالي التكلفة</th>
                  <th className="py-3.5 px-3 min-w-[70px] text-center">الحالة</th>
                  <th className="py-3.5 px-3 min-w-[60px] text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredGINs.map(gin => (
                  <tr key={gin.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {gin.ginNumber}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 font-mono whitespace-nowrap">
                      {gin.date}
                    </td>
                    <td className="py-3.5 px-3 font-sans text-xs">
                      <span className={`px-2.5 py-1 rounded-xl font-bold border ${
                        gin.type === 'production_mo' ? 'bg-amber-50 text-amber-900 border-amber-200' :
                        gin.type === 'maintenance_workshop' ? 'bg-blue-50 text-blue-900 border-blue-200' :
                        'bg-rose-50 text-rose-900 border-rose-200'
                      }`}>
                        {gin.type === 'production_mo' && 'صرف لأمر إنتاج (WIP 1133)'}
                        {gin.type === 'maintenance_workshop' && 'صيانة ماكينات CNC (534)'}
                        {gin.type === 'scrap_waste' && 'هالك وتوالف خامات (1135)'}
                        {gin.type === 'general_issue' && 'صرف عام'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-sans font-bold text-slate-800">
                      {gin.productionOrderNumber || gin.machineName || gin.costCenterName || 'ورشة التصنيع'}
                    </td>
                    <td className="py-3.5 px-3 font-sans text-slate-700 font-bold">
                      {gin.warehouseName}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                      {gin.items.length} صنف
                    </td>
                    <td className="py-3.5 px-3 text-left font-black text-rose-700 whitespace-nowrap">
                      {gin.totalAmount.toLocaleString()} EGP
                    </td>
                    <td className="py-3.5 px-3 text-center font-sans">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>منصرف ومرحل</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-sans">
                      <button
                        onClick={() => setSelectedGINForView(gin)}
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
      ) : (
        /* MRN REQUISITIONS LIST */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-amber-50/70 border-b border-amber-200/60 flex items-center gap-2 text-xs text-amber-900 font-bold">
            <Clock className="w-4 h-4 text-[#C87A38]" />
            <span>طلبات صرف الخامات (MRN): يقدمها مهندس الورشة ليتم مراجعتها وصرفها فعلياً من قِبل أمين المخزن.</span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80">
                  <th className="py-3.5 px-3 min-w-[90px]">رقم طلب الصرف</th>
                  <th className="py-3.5 px-3 min-w-[70px]">تاريخ الطلب</th>
                  <th className="py-3.5 px-3 min-w-[110px]">القسم الطالب</th>
                  <th className="py-3.5 px-3 min-w-[110px]">أمر الإنتاج / الغرض</th>
                  <th className="py-3.5 px-3 min-w-[60px] text-center">الأصناف</th>
                  <th className="py-3.5 px-3 min-w-[70px] text-center">الحالة</th>
                  <th className="py-3.5 px-3 min-w-[70px] text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {materialRequisitions.map(mrn => (
                  <tr key={mrn.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-900">{mrn.requisitionNumber}</td>
                    <td className="py-3.5 px-3 text-slate-500">{mrn.date}</td>
                    <td className="py-3.5 px-3 font-sans font-bold text-slate-800">{mrn.department} ({mrn.requestedByUserName})</td>
                    <td className="py-3.5 px-3 font-sans text-slate-700 font-bold">{mrn.productionOrderNumber || mrn.notes || 'طلب تشغيل'}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-900">{mrn.items.length} صنف</td>
                    <td className="py-3.5 px-3 text-center font-sans">
                      {mrn.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                          <span>في انتظار اعتماد مدير الإنتاج</span>
                        </span>
                      )}
                      {mrn.status === 'approved' && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>معتمد — جاهز للصرف</span>
                          </span>
                          {mrn.approvedByUserName && (
                            <p className="text-[9px] text-slate-400 font-sans">اعتمد بواسطة: {mrn.approvedByUserName}</p>
                          )}
                        </div>
                      )}
                      {mrn.status === 'fully_issued' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>تم الصرف الفعلي {mrn.ginNumber || '(GIN)'}</span>
                        </span>
                      )}
                      {mrn.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-800 border border-rose-200">
                          <span>مرفوض</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center font-sans">
                      <div className="flex items-center justify-center gap-1.5">
                        {mrn.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveMaterialRequisition(mrn.id)}
                              className="px-2.5 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold shadow-2xs transition-all flex items-center gap-1"
                              title="اعتماد الطلب بواسطة مدير الإنتاج"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>اعتماد</span>
                            </button>
                            <button
                              onClick={() => rejectMaterialRequisition(mrn.id)}
                              className="px-2 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition-all"
                              title="رفض الطلب"
                            >
                              رفض
                            </button>
                          </>
                        )}
                        {mrn.status === 'approved' && (
                          <button
                            onClick={() => {
                              setIssuingRequisitionId(mrn.id);
                              setFormType(mrn.purpose === 'maintenance' ? 'maintenance_workshop' : mrn.purpose === 'sample' ? 'general_issue' : 'production_mo');
                              setFormNotes(`صرف طلب الورشة ${mrn.requisitionNumber}${mrn.productionOrderNumber ? ` لأمر ${mrn.productionOrderNumber}` : ''}`);
                              const firstCard = itemMasterCards.find(c => c.id === mrn.items[0]?.itemId || c.code === mrn.items[0]?.itemCode);
                              if (firstCard) setFormWarehouseId(firstCard.defaultWarehouseId);
                              setFormProdOrderId(mrn.productionOrderId || '');
                              if (mrn.items.length > 0) {
                                setFormItems(mrn.items.map(it => {
                                  const card = itemMasterCards.find(c => c.id === it.itemId || c.code === it.itemCode);
                                  return {
                                    itemId: it.itemId,
                                    itemCode: it.itemCode,
                                    itemName: it.itemName,
                                    unit: it.unit,
                                    requestedQty: it.requestedQty,
                                    issuedQty: it.requestedQty,
                                    unitCost: card?.weightedAvgCost || 1000,
                                    locationBin: card?.locationBin || 'ممر 1',
                                    notes: `صرف لطلب ${mrn.requisitionNumber}`
                                  };
                                }));
                              }
                              setShowAddModal(true);
                            }}
                            className="px-3 py-1 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-[11px] font-black shadow-sm flex items-center gap-1 animate-pulse"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>صرف وتسليم المخزن</span>
                          </button>
                        )}
                        {mrn.status === 'fully_issued' && (
                          <span className="text-[11px] text-slate-400 font-bold">مكتمل</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MODAL: CREATE GIN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-700">
                <ArrowUpRight className="w-6 h-6" />
                <h3 className="font-black text-lg text-slate-900">إصدار وترحيل إذن صرف مخزني (GIN)</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-rose-50 flex items-center justify-center">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              {issuingRequisitionId && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                  صرف لطلب الورشة {materialRequisitions.find(m => m.id === issuingRequisitionId)?.requisitionNumber}: الطلب هيتقفل "تم الصرف" بعد اعتماد الإذن.
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">نوع وتوجيه الصرف:</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as GINType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="production_mo">صرف خامات لأمر تصنيع (تحميل WIP 1133)</option>
                    <option value="maintenance_workshop">صرف مهمات وصيانة ماكينات الورشة (534)</option>
                    <option value="scrap_waste">إثبات وصرف هالك وتوالف خامات (1135)</option>
                    <option value="general_issue">صرف عام ومهمات تشغيل</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">المستودع المنصرف منه *:</label>
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

                {formType === 'production_mo' && (
                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">أمر الإنتاج المستفيد *:</label>
                    <select
                      value={formProdOrderId}
                      onChange={(e) => setFormProdOrderId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      {productionOrders.map(p => (
                        <option key={p.id} value={p.id}>{p.productionNumber} ({p.customerName})</option>
                      ))}
                    </select>
                  </div>
                )}

                {formType === 'maintenance_workshop' && (
                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">الماكينة المستفيدة:</label>
                    <input
                      type="text"
                      value={formMachineName}
                      onChange={(e) => setFormMachineName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Dynamic Line Items Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-xs">الأصناف والخامات المراد صرفها:</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 hover:bg-rose-100 text-[11px] font-black flex items-center gap-1 border border-rose-200/60"
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
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">الصنف المنصرف:</label>
                        <select
                          value={row.itemId}
                          onChange={(e) => handleItemSelect(idx, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-[11px]"
                        >
                          {itemMasterCards.map(item => (
                            <option key={item.id} value={item.id}>
                              [{item.code}] {item.nameAr} (متاح هنا: {availableHere(item.id)} {item.unitNameAr})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        {(() => {
                          const avail = availableHere(row.itemId);
                          const isOver = row.issuedQty > avail;

                          return (
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                الكمية المنصرفة ({row.unit}):
                              </label>
                              <input
                                type="number"
                                min="1"
                                max={avail}
                                value={row.issuedQty}
                                onChange={(e) => handleRowQtyChange(idx, parseFloat(e.target.value) || 0)}
                                className={`w-full px-2.5 py-1.5 bg-white border rounded-xl font-mono font-bold text-center ${
                                  isOver ? 'border-rose-500 text-rose-700 bg-rose-50' : 'border-slate-200 text-slate-800'
                                }`}
                              />
                              {isOver && (
                                <span className="text-[9px] font-bold text-rose-600 block mt-0.5">
                                  ⚠️ تجاوز المتاح ({avail})!
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">تكلفة الوحدة (EGP):</label>
                        <input
                          type="number"
                          value={row.unitCost}
                          onChange={(e) => handleRowCostChange(idx, parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-left"
                        />
                      </div>

                      <div className="sm:col-span-2 text-left">
                        <span className="text-[10px] font-bold text-slate-500 block mb-0.5">الإجمالي:</span>
                        <span className="font-mono font-black text-rose-700">
                          {(row.issuedQty * row.unitCost).toLocaleString()} EGP
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
                <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-between text-xs font-bold">
                  <span className="text-rose-900">إجمالي تكلفة الخامات المنصرفة:</span>
                  <span className="font-mono font-black text-rose-900 text-base">
                    {formTotalAmount.toLocaleString()} EGP
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">ملاحظات الصرف والتشغيل:</label>
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
              <button onClick={handleSubmitGIN} className="px-5 py-2 rounded-xl text-xs font-black bg-rose-700 hover:bg-rose-600 text-white shadow-lg">
                اعتماد وترحيل إذن الصرف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: CREATE MATERIAL REQUISITION (MRN) */}
      {showRequisitionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-800">
                <Clock className="w-6 h-6" />
                <div>
                  <h3 className="font-black text-lg text-slate-900">تقديم طلب صرف خامات جديد (MRN)</h3>
                  <p className="text-[11px] text-slate-500 font-sans">تحديد أمر التصنيع والخامات والكميات المطلوبة لاعتمادها من مدير الإنتاج</p>
                </div>
              </div>
              <button onClick={() => setShowRequisitionModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Request Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">الغرض من الصرف *:</label>
                  <select
                    value={mrnPurpose}
                    onChange={(e) => setMrnPurpose(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="production">صرف لأمر تصنيع مطبخ / أثاث</option>
                    <option value="maintenance">صرف لصيانة ماكينات الورشة</option>
                    <option value="sample">صرف عينات وتجهيز معرض</option>
                  </select>
                </div>

                {mrnPurpose === 'production' ? (
                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">أمر التصنيع / العميل *:</label>
                    <select
                      value={mrnProdOrderId}
                      onChange={(e) => setMrnProdOrderId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      {productionOrders.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.productionNumber} ({p.customerName})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">تاريخ الاحتياج المطلوب:</label>
                    <input
                      type="date"
                      value={mrnRequiredDate}
                      onChange={(e) => setMrnRequiredDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">القسم / الورشة الطالبة:</label>
                  <input
                    type="text"
                    value={mrnDepartment}
                    onChange={(e) => setMrnDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    placeholder="مثال: قسم النجارة، ورشة التقطيع..."
                  />
                </div>
              </div>

              {/* Dynamic Line Items Section for Requisition */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-black text-slate-900 text-xs">الأصناف والخامات المطلوبة من المخزن:</span>
                    <p className="text-[10px] text-slate-500">اختر الخامات وحدد الكمية المطلوبة بالوحدة المحددة</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMrnItemRow}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 text-[11px] font-black flex items-center gap-1 border border-amber-200/80 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-700" />
                    <span>إضافة صنف آخر للطلب</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {mrnItems.map((row, idx) => {
                    const targetCard = itemMasterCards.find(c => c.id === row.itemId);
                    const avail = targetCard ? targetCard.availableStock : 0;

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                      >
                        <div className="sm:col-span-6">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">الصنف والخامة المطلوبة:</label>
                          <select
                            value={row.itemId}
                            onChange={(e) => handleMrnItemSelect(idx, e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-[11px]"
                          >
                            {itemMasterCards.map(item => (
                              <option key={item.id} value={item.id}>
                                [{item.code}] {item.nameAr} (متاح بالمخزن: {item.availableStock} {item.unitNameAr})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            الكمية المطلوبة ({row.unit}):
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={row.requestedQty}
                            onChange={(e) => handleMrnItemQtyChange(idx, parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-center"
                          />
                        </div>

                        <div className="sm:col-span-2 text-center">
                          <span className="text-[10px] font-bold text-slate-400 block mb-0.5">الرصيد المتاح:</span>
                          <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-lg border ${
                            avail > 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {avail} {row.unit}
                          </span>
                        </div>

                        <div className="sm:col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveMrnItemRow(idx)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                            title="حذف هذا السطر"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">ملاحظات ومواصفات الطلب:</label>
                <input
                  type="text"
                  value={mrnNotes}
                  onChange={(e) => setMrnNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="ملاحظات توضيحية لمدير الإنتاج وأمين المخزن..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowRequisitionModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
                إلغاء
              </button>
              <button
                onClick={handleSubmitMRN}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-amber-700 hover:bg-amber-600 text-white shadow-lg transition-all flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4" />
                <span>إرسال طلب الصرف للاعتماد والمخازن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: VIEW GIN DETAILS */}
      {selectedGINForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">إذن صرف رسمي</span>
                <h3 className="font-black text-lg text-slate-900 mt-1">{selectedGINForView.ginNumber}</h3>
              </div>
              <button onClick={() => setSelectedGINForView(null)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">✕</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-bold block">المستودع:</span>
                <span className="font-bold text-slate-800">{selectedGINForView.warehouseName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">التاريخ:</span>
                <span className="font-mono font-bold text-slate-800">{selectedGINForView.date}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">الجهة / أمر الشغل:</span>
                <span className="font-bold text-slate-800">{selectedGINForView.productionOrderNumber || selectedGINForView.machineName || 'الورشة'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">أمين المخزن المنفذ:</span>
                <span className="font-bold text-slate-800">{selectedGINForView.issuedByUserName}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-black text-xs text-slate-900 block">تفاصيل الأصناف المنصرفة:</span>
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
                    {selectedGINForView.items.map(it => (
                      <tr key={it.id}>
                        <td className="py-2.5 px-3 font-sans font-bold text-slate-800">{it.itemName}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">{it.issuedQty} {it.unit}</td>
                        <td className="py-2.5 px-3 text-left text-slate-600">{it.unitCost.toLocaleString()} EGP</td>
                        <td className="py-2.5 px-3 text-left font-black text-rose-700">{it.totalCost.toLocaleString()} EGP</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-bold">ملاحظات: {selectedGINForView.notes || 'لا توجد'}</span>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة إذن الصرف</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
