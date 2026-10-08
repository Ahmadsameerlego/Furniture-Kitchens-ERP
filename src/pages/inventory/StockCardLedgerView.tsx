// ====================================================
// REWAQ ERP — STOCK CARD & MOVEMENT LEDGER VIEW
// Item Stock Ledger, Real-time Running Balance & Document Traceability
// ====================================================

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ItemMasterCard } from '../../types/erp';
import {
  History,
  Search,
  Filter,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  FileSpreadsheet,
  Building2,
  Barcode,
  Calendar,
  DollarSign,
  Boxes
} from 'lucide-react';

import { exportStockLedgerToExcel } from '../../utils/excelExport';

export const StockCardLedgerView: React.FC = () => {
  const {
    itemMasterCards,
    stockLedgerEntries,
    selectedItemCardId,
    setSelectedItemCardId,
    warehouses,
    showToast
  } = useERP();

  const [selectedItemId, setSelectedItemId] = useState<string>(
    selectedItemCardId || itemMasterCards[0]?.id || 'item-101'
  );
  const [selectedDocTypeFilter, setSelectedDocTypeFilter] = useState<string>('all');
  const [searchNotes, setSearchNotes] = useState<string>('');

  const currentItem = itemMasterCards.find(i => i.id === selectedItemId) || itemMasterCards[0];

  // Ledger entries for this item
  const itemEntries = stockLedgerEntries
    .filter(e => e.itemId === currentItem?.id || e.itemCode === currentItem?.code)
    .filter(e => selectedDocTypeFilter === 'all' || e.documentType === selectedDocTypeFilter)
    .filter(e => !searchNotes || (e.notes && e.notes.toLowerCase().includes(searchNotes.toLowerCase())) || e.documentNumber.includes(searchNotes));

  // Totals for this item
  const totalIn = itemEntries.reduce((s, e) => s + e.qtyIn, 0);
  const totalOut = itemEntries.reduce((s, e) => s + e.qtyOut, 0);

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl">
      {/* 1. HEADER */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <History className="w-3.5 h-3.5" />
            <span>بطاقة الصنف وحركات المخزون — Stock Card & Running Balance Ledger</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <History className="w-8 h-8 text-[#C87A38]" />
            <span>كارت الصنف وسجل الحركات التاريخي</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            التتبع الكامل لتدفق الصنف منذ رصيده الافتتاحي وتوريدات الشراء وأوامر الصرف والتحويلات والتسويات الجردية مع احتساب الرصيد اللحظي التراكمي.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              if (currentItem) {
                exportStockLedgerToExcel(currentItem.nameAr, itemEntries);
                showToast(`✓ تم تصدير سجل حركات (${currentItem.nameAr}) إلى ملف Excel بنجاح`, 'success');
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
            title="تصدير سجل حركات الصنف إلى ملف Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-2xl shadow-lg transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة كارت الصنف</span>
          </button>
        </div>
      </div>

      {/* 2. ITEM SELECTOR BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <span className="text-xs font-bold text-slate-700 shrink-0">اختر الصنف / الخامة:</span>
          <select
            value={selectedItemId}
            onChange={(e) => {
              setSelectedItemId(e.target.value);
              setSelectedItemCardId(e.target.value);
            }}
            className="w-full max-w-xl px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-[#C87A38]"
          >
            {itemMasterCards.map(item => (
              <option key={item.id} value={item.id}>
                [{item.code}] {item.nameAr} — ({item.categoryNameAr})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 shrink-0">
          <Barcode className="w-4 h-4" />
          <span>باركود: {currentItem?.barcode}</span>
        </div>
      </div>

      {/* 3. ITEM SUMMARY DASHBOARD TILE */}
      {currentItem && (
        <div className="bg-gradient-to-r from-amber-50/70 via-white to-slate-50 p-6 rounded-3xl border border-amber-200/60 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-200/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-[#C87A38] bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300/50">
                  {currentItem.code}
                </span>
                <h2 className="text-lg font-black text-slate-900">{currentItem.nameAr}</h2>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{currentItem.nameEn} | {currentItem.categoryNameAr}</p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="text-left">
                <span className="text-[10px] text-slate-400 font-bold block">المستودع والموقع:</span>
                <span className="font-bold text-slate-800">{currentItem.defaultWarehouseName} ({currentItem.locationBin})</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3 bg-white rounded-2xl border border-slate-200/70 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 block">الرصيد الفعلي الحالي:</span>
              <span className="text-lg font-black font-mono text-slate-900">{currentItem.currentStock}</span>{' '}
              <span className="text-[10px] text-slate-500">{currentItem.unitNameAr}</span>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200/70 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 block">الرصيد المتاح للتشغيل:</span>
              <span className="text-lg font-black font-mono text-emerald-700">{currentItem.availableStock}</span>{' '}
              <span className="text-[10px] text-slate-500">{currentItem.unitNameAr}</span>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200/70 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 block">الرصيد المحجوز لأوامر شغل:</span>
              <span className="text-lg font-black font-mono text-amber-800">{currentItem.reservedStock}</span>{' '}
              <span className="text-[10px] text-slate-500">{currentItem.unitNameAr}</span>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200/70 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 block">متوسط التكلفة المرجح:</span>
              <span className="text-lg font-black font-mono text-slate-800">{currentItem.weightedAvgCost.toLocaleString()}</span>{' '}
              <span className="text-[10px] text-slate-400">EGP</span>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200/70 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 block">حد الأمان (Safety Stock):</span>
              <span className="text-lg font-black font-mono text-rose-700">{currentItem.minStockLevel}</span>{' '}
              <span className="text-[10px] text-slate-500">{currentItem.unitNameAr}</span>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200/70 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 block">حد إعادة الطلب:</span>
              <span className="text-lg font-black font-mono text-blue-700">{currentItem.reorderPoint}</span>{' '}
              <span className="text-[10px] text-slate-500">{currentItem.unitNameAr}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. STOCK LEDGER TRANSACTIONS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4">
        {/* Table Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'كافة الحركات' },
              { id: 'GRN', label: 'أذونات إضافة (وارد +)' },
              { id: 'GIN', label: 'أذونات صرف (منصرف -)' },
              { id: 'TRANSFER', label: 'تحويلات مخزنية' },
              { id: 'ADJUSTMENT', label: 'تسويات جردية' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedDocTypeFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedDocTypeFilter === f.id
                    ? 'bg-[#361D13] text-white shadow-2xs font-black'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchNotes}
              onChange={(e) => setSearchNotes(e.target.value)}
              placeholder="ابحث برقم المستند أو البيان..."
              className="w-full pr-9 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80">
                <th className="py-3.5 px-3 whitespace-nowrap min-w-[70px]">التاريخ</th>
                <th className="py-3.5 px-3 whitespace-nowrap min-w-[80px]">نوع المستند</th>
                <th className="py-3.5 px-3 whitespace-nowrap min-w-[90px]">رقم السند</th>
                <th className="py-3.5 px-3 min-w-[100px]">المستودع</th>
                <th className="py-3.5 px-3 whitespace-nowrap min-w-[70px] text-center text-emerald-800">الوارد (+)</th>
                <th className="py-3.5 px-3 whitespace-nowrap min-w-[70px] text-center text-rose-700">المنصرف (-)</th>
                <th className="py-3.5 px-3 whitespace-nowrap min-w-[80px] text-center font-black">الرصيد بعد الحركة</th>
                <th className="py-3.5 px-3 whitespace-nowrap min-w-[70px] text-left">التكلفة</th>
                <th className="py-3.5 px-3 whitespace-nowrap min-w-[70px] text-left">إجمالي القيمة</th>
                <th className="py-3.5 px-3 min-w-[140px]">البيان / ملاحظات التشغيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {itemEntries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-sans">
                    لا توجد حركات مسجلة لهذا الصنف حتى الآن
                  </td>
                </tr>
              ) : (
                itemEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">{entry.date}</td>
                    <td className="py-3.5 px-3 font-sans whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                        entry.documentType === 'GRN' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                        entry.documentType === 'GIN' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                        'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}>
                        {entry.documentType === 'GRN' && 'إذن إضافة (GRN)'}
                        {entry.documentType === 'GIN' && 'إذن صرف (GIN)'}
                        {entry.documentType === 'TRANSFER_IN' && 'تحويل وارد'}
                        {entry.documentType === 'TRANSFER_OUT' && 'تحويل صادر'}
                        {entry.documentType === 'ADJUSTMENT_IN' && 'تسوية زيادة'}
                        {entry.documentType === 'ADJUSTMENT_OUT' && 'تسوية عجز'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">{entry.documentNumber}</td>
                    <td className="py-3.5 px-3 font-sans text-slate-700">{entry.warehouseName}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-emerald-700 whitespace-nowrap">
                      {entry.qtyIn > 0 ? `+${entry.qtyIn}` : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-rose-700 whitespace-nowrap">
                      {entry.qtyOut > 0 ? `-${entry.qtyOut}` : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-center font-black text-slate-900 text-sm whitespace-nowrap bg-slate-50/80">
                      {entry.balanceAfter} <span className="text-[10px] font-normal text-slate-400">{currentItem?.unitNameAr}</span>
                    </td>
                    <td className="py-3.5 px-3 text-left text-slate-700 whitespace-nowrap">{entry.unitCost.toLocaleString()} EGP</td>
                    <td className="py-3.5 px-3 text-left font-black text-slate-900 whitespace-nowrap">{entry.totalCost.toLocaleString()} EGP</td>
                    <td className="py-3.5 px-3 font-sans text-slate-600 text-xs">{entry.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
