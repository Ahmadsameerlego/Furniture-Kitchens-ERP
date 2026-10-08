// ====================================================
// REWAQ ERP — ITEM MASTER CARDS & MATERIALS CATALOG VIEW
// Complete SKU, Barcode, Reorder Levels, Bins & Unit Cost Management
// ====================================================

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ItemMasterCard, ItemCardCategory } from '../../types/erp';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  Barcode,
  Building2,
  DollarSign,
  FileSpreadsheet,
  Tag,
  ShieldCheck,
  History,
  TrendingDown
} from 'lucide-react';
import { exportItemCatalogToExcel } from '../../utils/excelExport';

export const ItemMasterCardsView: React.FC = () => {
  const {
    itemMasterCards,
    warehouses,
    suppliers,
    createItemMasterCard,
    updateItemMasterCard,
    setSelectedItemCardId,
    setActiveModule,
    showToast
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemMasterCard | null>(null);
  const [showOnlyReorder, setShowOnlyReorder] = useState(false);

  // Form State
  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategory, setFormCategory] = useState<ItemCardCategory>('wood_panels');
  const [formUnit, setFormUnit] = useState<'sheet' | 'm_linear' | 'm2' | 'kg' | 'set' | 'pcs' | 'can'>('sheet');
  const [formUnitNameAr, setFormUnitNameAr] = useState('لوح');
  const [formInitialStock, setFormInitialStock] = useState<number>(50);
  const [formCost, setFormCost] = useState<number>(1000);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(1400);
  const [formMinStock, setFormMinStock] = useState<number>(20);
  const [formReorderPoint, setFormReorderPoint] = useState<number>(35);
  const [formWarehouseId, setFormWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [formLocationBin, setFormLocationBin] = useState<string>('ممر 1 - رف A');
  const [formSupplierId, setFormSupplierId] = useState<string>(suppliers[0]?.id || '');

  // Filter items
  const filteredItems = itemMasterCards.filter(item => {
    const matchesSearch =
      !searchQuery ||
      item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barcode.includes(searchQuery) ||
      item.locationBin.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesWarehouse = selectedWarehouseFilter === 'all' || item.defaultWarehouseId === selectedWarehouseFilter;
    const matchesReorder = !showOnlyReorder || item.currentStock <= item.reorderPoint;

    return matchesSearch && matchesCategory && matchesWarehouse && matchesReorder;
  });

  const reorderAlertsCount = itemMasterCards.filter(i => i.currentStock <= i.reorderPoint).length;

  const handleSaveItem = () => {
    if (!formNameAr) {
      showToast('يرجى كتابة اسم الصنف بالعربي', 'warning');
      return;
    }

    const targetSup = suppliers.find(s => s.id === formSupplierId);

    if (editingItem) {
      updateItemMasterCard(editingItem.id, {
        nameAr: formNameAr,
        nameEn: formNameEn,
        category: formCategory,
        unit: formUnit,
        unitNameAr: formUnitNameAr,
        weightedAvgCost: Number(formCost),
        sellingPrice: Number(formSellingPrice),
        minStockLevel: Number(formMinStock),
        reorderPoint: Number(formReorderPoint),
        defaultWarehouseId: formWarehouseId,
        defaultWarehouseName: warehouses.find(w => w.id === formWarehouseId)?.name || '',
        locationBin: formLocationBin,
        supplierId: formSupplierId,
        supplierName: targetSup?.name
      });
      setEditingItem(null);
    } else {
      createItemMasterCard({
        nameAr: formNameAr,
        nameEn: formNameEn || formNameAr,
        code: formCode || undefined,
        category: formCategory,
        unit: formUnit,
        unitNameAr: formUnitNameAr,
        currentStock: Number(formInitialStock),
        weightedAvgCost: Number(formCost),
        lastPurchasePrice: Number(formCost),
        sellingPrice: Number(formSellingPrice),
        minStockLevel: Number(formMinStock),
        reorderPoint: Number(formReorderPoint),
        defaultWarehouseId: formWarehouseId,
        locationBin: formLocationBin,
        supplierId: formSupplierId,
        supplierName: targetSup?.name
      });
      setShowAddModal(false);
    }
  };

  const handleOpenEdit = (item: ItemMasterCard) => {
    setEditingItem(item);
    setFormNameAr(item.nameAr);
    setFormNameEn(item.nameEn);
    setFormCode(item.code);
    setFormCategory(item.category);
    setFormUnit(item.unit);
    setFormUnitNameAr(item.unitNameAr);
    setFormCost(item.weightedAvgCost);
    setFormSellingPrice(item.sellingPrice);
    setFormMinStock(item.minStockLevel);
    setFormReorderPoint(item.reorderPoint);
    setFormWarehouseId(item.defaultWarehouseId);
    setFormLocationBin(item.locationBin);
    setFormSupplierId(item.supplierId || '');
  };

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl">
      {/* 1. HEADER */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>سجل ودليل الخامات الرئيسي — Item Master & Reorder Points</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <Layers className="w-8 h-8 text-[#C87A38]" />
            <span>كروت الأصناف ودليل الخامات</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            التحكم الشامل في بيانات الأصناف، كود الـ SKU والباركود، التكلفة المرجحة، وتحديد مواقع التخزين (الممر، الرف، الخانة) وحد الأمان وإعادة الطلب.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              exportItemCatalogToExcel(filteredItems);
              showToast('✓ تم تصدير دليل كروت الأصناف والخامات إلى ملف Excel بنجاح', 'success');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
            title="تصدير كروت الأصناف المعروضة إلى ملف Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setFormNameAr('');
              setFormNameEn('');
              setFormCode(`RAW-${Math.floor(100 + Math.random() * 900)}`);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#C87A38] hover:bg-amber-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة كارت صنف جديد</span>
          </button>
        </div>
      </div>

      {/* 2. CATEGORY TABS & SEARCH BAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
          {[
            { id: 'all', label: 'كافة التصنيفات' },
            { id: 'wood_panels', label: 'ألواح وأخشاب' },
            { id: 'veneers_hpl', label: 'HPL وتجاليد' },
            { id: 'hardware_accessories', label: 'مفصلات وإكسسوار' },
            { id: 'spare_parts_tools', label: 'قطع غيار وشفرات CNC' },
            { id: 'finished_kitchen', label: 'مطابخ تامة الصنع' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setShowOnlyReorder(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id && !showOnlyReorder
                  ? 'bg-[#361D13] text-white shadow-xs font-black'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <button
            onClick={() => setShowOnlyReorder(!showOnlyReorder)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 mr-auto ${
              showOnlyReorder
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>تنبيهات حد الطلب والأمان ({reorderAlertsCount})</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الصنف، كود SKU، الباركود، أو الرف..."
              className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
            <span className="text-slate-500 font-bold shrink-0">المستودع الافتراضي:</span>
            <select
              value={selectedWarehouseFilter}
              onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
            >
              <option value="all">كل المستودعات</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. ITEM MASTER CARDS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80">
                <th className="py-3.5 px-2 min-w-[90px]">كود الصنف / SKU</th>
                <th className="py-3.5 px-2 min-w-[130px]">اسم الصنف والوصف</th>
                <th className="py-3.5 px-2 min-w-[90px]">المستودع والموقع المادي</th>
                <th className="py-3.5 px-2 min-w-[60px] text-center">الرصيد الفعلي</th>
                <th className="py-3.5 px-2 min-w-[60px] text-center">المحجوز</th>
                <th className="py-3.5 px-2 min-w-[60px] text-center">المتاح للطلب</th>
                <th className="py-3.5 px-2 min-w-[70px] text-left">متوسط التكلفة</th>
                <th className="py-3.5 px-2 min-w-[80px] text-left">إجمالي القيمة</th>
                <th className="py-3.5 px-2 min-w-[70px] text-center">الحالة</th>
                <th className="py-3.5 px-2 min-w-[70px] text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredItems.map(item => {
                const totalVal = item.currentStock * item.weightedAvgCost;
                const isReorderTriggered = item.currentStock <= item.reorderPoint;

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-2">
                      <div className="font-bold text-slate-900 whitespace-nowrap">{item.code}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 whitespace-nowrap">
                        <Barcode className="w-3 h-3" />
                        <span>{item.barcode}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-2 font-sans">
                      <div className="font-black text-slate-800 text-xs">{item.nameAr}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.nameEn}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                        {item.categoryNameAr}
                      </span>
                    </td>

                    <td className="py-3.5 px-2 font-sans text-xs">
                      <div className="font-bold text-slate-700">{item.defaultWarehouseName}</div>
                      <div className="text-[10px] text-amber-700 font-mono bg-amber-50 px-1.5 py-0.5 rounded inline-block mt-0.5 border border-amber-200/50 whitespace-nowrap">
                        {item.locationBin}
                      </div>
                    </td>

                    <td className="py-3.5 px-2 text-center font-black text-slate-900 text-sm">
                      {item.currentStock} <span className="text-[11px] font-normal text-slate-500">{item.unitNameAr}</span>
                    </td>

                    <td className="py-3.5 px-2 text-center font-bold text-amber-700">
                      {item.reservedStock} <span className="text-[10px] text-slate-400">{item.unitNameAr}</span>
                    </td>

                    <td className="py-3.5 px-2 text-center">
                      <span className={`font-black text-sm ${item.availableStock <= 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {item.availableStock}
                      </span>{' '}
                      <span className="text-[10px] text-slate-400">{item.unitNameAr}</span>
                    </td>

                    <td className="py-3.5 px-2 text-left font-bold text-slate-700 whitespace-nowrap">
                      {item.weightedAvgCost.toLocaleString()} EGP
                    </td>

                    <td className="py-3.5 px-2 text-left font-black text-slate-900 whitespace-nowrap">
                      {totalVal.toLocaleString()} EGP
                    </td>

                    <td className="py-3.5 px-2 text-center font-sans">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black shadow-2xs ${
                        item.currentStock === 0 ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        isReorderTriggered ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {item.currentStock === 0 && 'نفذ من المخزن'}
                        {item.currentStock > 0 && isReorderTriggered && 'طلب إعادة شراء'}
                        {item.currentStock > item.reorderPoint && 'رصيد آمن'}
                      </span>
                    </td>

                    <td className="py-3.5 px-2 text-center font-sans">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedItemCardId(item.id);
                            setActiveModule('inv_stock_card');
                          }}
                          className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-[#361D13] hover:text-white transition-colors"
                          title="عرض كارت الصنف وسجل الحركات"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-[#C87A38] hover:text-white transition-colors"
                          title="تعديل بيانات كارت الصنف"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL: ADD / EDIT ITEM MASTER CARD */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-6 h-6 text-[#C87A38]" />
                <h3 className="font-black text-lg text-slate-900">
                  {editingItem ? 'تعديل كارت الصنف' : 'إضافة كارت صنف / خامة جديدة'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-rose-50 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">اسم الصنف بالعربي *:</label>
                  <input
                    type="text"
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    placeholder="مثال: لوح MDF إسباني 18مم"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">الاسم بالإنجليزي:</label>
                  <input
                    type="text"
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    placeholder="e.g. Spanish MDF Panel 18mm"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">كود الصنف / SKU:</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">التصنيف:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ItemCardCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="wood_panels">ألواح وأخشاب طبيعية وصناعية</option>
                    <option value="veneers_hpl">تجاليد وقواطع وHPL</option>
                    <option value="hardware_accessories">مفصلات وإكسسوارات ومقابض</option>
                    <option value="spare_parts_tools">قطع غيار وصيانة ومهمات ماكينات</option>
                    <option value="finished_kitchen">مطابخ تامة الصنع</option>
                    <option value="finished_furniture">أثاث وغرف تامة الصنع</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">وحدة القياس:</label>
                  <select
                    value={formUnit}
                    onChange={(e) => {
                      const u = e.target.value as any;
                      setFormUnit(u);
                      const unitNames: Record<string, string> = {
                        sheet: 'لوح',
                        m_linear: 'متر طولي',
                        m2: 'متر مربع',
                        kg: 'كجم',
                        set: 'طقم',
                        pcs: 'قطعة',
                        can: 'عبوة/بستلة'
                      };
                      setFormUnitNameAr(unitNames[u] || 'وحدة');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="sheet">لوح (Sheet)</option>
                    <option value="pcs">قطعة (Pcs)</option>
                    <option value="set">طقم (Set)</option>
                    <option value="m_linear">متر طولي (M.L)</option>
                    <option value="m2">متر مربع (M2)</option>
                    <option value="kg">كيلوجرام (Kg)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">المستودع الافتراضي:</label>
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

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">موقع التخزين (الممر - الرف - الخانة):</label>
                  <input
                    type="text"
                    value={formLocationBin}
                    onChange={(e) => setFormLocationBin(e.target.value)}
                    placeholder="مثال: ممر A1 - باكية 02"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {!editingItem && (
                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">الرصيد الافتتاحي:</label>
                    <input
                      type="number"
                      value={formInitialStock}
                      onChange={(e) => setFormInitialStock(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-left"
                    />
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">سعر التكلفة (EGP):</label>
                  <input
                    type="number"
                    value={formCost}
                    onChange={(e) => setFormCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-left"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">حد الأمان (Safety Stock):</label>
                  <input
                    type="number"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-left"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">حد إعادة الطلب (Reorder Trigger):</label>
                  <input
                    type="number"
                    value={formReorderPoint}
                    onChange={(e) => setFormReorderPoint(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-left"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">المورد المفضل:</label>
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
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveItem}
                className="px-5 py-2 rounded-xl text-xs font-black bg-[#C87A38] text-white shadow-lg hover:bg-amber-600 transition-all"
              >
                {editingItem ? 'حفظ التعديلات' : 'إنشاء كارت الصنف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
