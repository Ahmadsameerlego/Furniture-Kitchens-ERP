// ====================================================
// REWAQ ERP — INVENTORY & WAREHOUSES DASHBOARD
// Enterprise Stock Valuation, Reorder Alerts, Capacity & Operational KPIs
// ====================================================

import React from 'react';
import { useERP } from '../../context/ERPContext';
import { stockAt } from '../../services/warehouseStock';
import {
  Boxes,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  Building2,
  ShieldCheck,
  TrendingUp,
  Package,
  ArrowLeftRight,
  ClipboardList,
  Sparkles,
  CheckCircle2,
  Plus,
  ChevronLeft,
  History
} from 'lucide-react';

export const InventoryDashboardView: React.FC = () => {
  const {
    warehouses,
    itemMasterCards,
    goodsReceiptNotes,
    goodsIssueNotes,
    stocktakeSessions,
    stockTransfers,
    setActiveModule,
    setSelectedItemCardId
  } = useERP();

  // Metrics
  const totalStockValuation = itemMasterCards.reduce((s, i) => s + (i.currentStock * i.weightedAvgCost), 0);
  const totalItemsCount = itemMasterCards.length;
  const lowStockItems = itemMasterCards.filter(i => i.currentStock <= i.reorderPoint);
  const outOfStockItems = itemMasterCards.filter(i => i.currentStock === 0);
  const totalGRNsValue = goodsReceiptNotes.reduce((s, g) => s + g.totalAmount, 0);
  const totalGINsValue = goodsIssueNotes.reduce((s, g) => s + g.totalAmount, 0);
  const pendingTransfers = stockTransfers.filter(t => t.status === 'requested' || t.status === 'sent').length;

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl">
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <Boxes className="w-3.5 h-3.5" />
            <span>نظام إدارة المخازن المتقدمة والمستودعات — Enterprise WMS & Stock Valuation</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <Boxes className="w-8 h-8 text-[#C87A38]" />
            <span>لوحة التحكم والرقابة المخزنية</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            مراقبة لحظية لحركة الخامات، التقييم المالي للمخزون بالمتوسط المرجح، مستويات الأمان وحدود إعادة الطلب، وأذونات الإضافة والصرف المخزني.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveModule('inv_grn')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>إذن إضافة (GRN)</span>
          </button>

          <button
            onClick={() => setActiveModule('inv_gin')}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-700 hover:bg-rose-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>إذن صرف (GIN)</span>
          </button>

          <button
            onClick={() => setActiveModule('inv_items')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#C87A38] hover:bg-amber-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>كارت صنف جديد</span>
          </button>
        </div>
      </div>

      {/* 2. TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Stock Valuation */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>التقييم المالي الإجمالي للمخزون</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {totalStockValuation.toLocaleString()} <span className="text-xs font-bold text-slate-400">EGP</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>محسوب بالمتوسط المرجح (Weighted Avg)</span>
          </div>
        </div>

        {/* Card 2: Total Items */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>دليل كروت الأصناف والخامات</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-blue-700">
            {totalItemsCount} <span className="text-xs font-bold text-slate-400">كارت صنف</span>
          </div>
          <div className="text-[11px] text-slate-500 font-bold">
            موزعة على {warehouses.length} مستودعات ومواقع تخزين
          </div>
        </div>

        {/* Card 3: Critical & Low Stock */}
        <div className={`p-5 rounded-3xl border shadow-xs space-y-2 ${
          lowStockItems.length > 0 ? 'bg-rose-50/70 border-rose-200 text-rose-950' : 'bg-white border-slate-200/80'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className={lowStockItems.length > 0 ? 'text-rose-800' : 'text-slate-500'}>
              الأصناف الحرجة وتحت حد الأمان
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-rose-700">
            {lowStockItems.length} <span className="text-xs font-bold text-rose-500">صنف بحاجة لشراء</span>
          </div>
          <div className="text-[11px] text-rose-600 font-bold">
            منها {outOfStockItems.length} صنف رصيده صفر بالكامل
          </div>
        </div>

        {/* Card 4: Operations Flow */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>إجمالي الوارد والمنصرف هذا الشهر</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-black font-mono text-slate-800 flex items-center justify-between pt-1">
            <span className="text-emerald-700">وارد: {totalGRNsValue.toLocaleString()} EGP</span>
            <span className="text-rose-600">منصرف: {totalGINsValue.toLocaleString()} EGP</span>
          </div>
          <div className="text-[11px] text-slate-400 font-bold">
            {goodsReceiptNotes.length} إذن إضافة | {goodsIssueNotes.length} إذن صرف
          </div>
        </div>
      </div>

      {/* 3. WAREHOUSES STATUS CARDS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#C87A38]" />
            <h3 className="font-black text-sm text-slate-900">حالة المستودعات ومواقع التخزين ({warehouses.length} مستودع)</h3>
          </div>
          <button
            onClick={() => setActiveModule('inv_warehouses')}
            className="text-xs font-black text-[#C87A38] hover:text-amber-700 flex items-center gap-1"
          >
            <span>إدارة المستودعات والأرفف</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map(wh => {
            const whItems = itemMasterCards.filter(i => stockAt(i, wh.id) > 0);
            const whValuation = whItems.reduce((s, i) => s + (stockAt(i, wh.id) * i.weightedAvgCost), 0);

            return (
              <div
                key={wh.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-[#C87A38]/50 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 px-2 py-0.5 bg-white rounded-md border border-slate-200">
                      {wh.code}
                    </span>
                    <h4 className="font-black text-xs text-slate-900 mt-1">{wh.name}</h4>
                    <p className="text-[11px] text-slate-500">{wh.branchName}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    wh.type === 'raw_materials' ? 'bg-amber-100 text-amber-900' :
                    wh.type === 'finished_goods' ? 'bg-emerald-100 text-emerald-900' :
                    wh.type === 'scrap_waste' ? 'bg-rose-100 text-rose-900' :
                    'bg-blue-100 text-blue-900'
                  }`}>
                    {wh.type === 'raw_materials' && 'خامات رئيسية'}
                    {wh.type === 'finished_goods' && 'إنتاج تام'}
                    {wh.type === 'hardware_accessories' && 'إكسسوارات وعدد'}
                    {wh.type === 'showroom_floor' && 'صالة عرض'}
                    {wh.type === 'scrap_waste' && 'هالك وتوالف'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">قيمة المخزون:</span>
                    <span className="font-mono font-black text-slate-800">{whValuation.toLocaleString()} EGP</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">عدد الأصناف:</span>
                    <span className="font-mono font-bold text-slate-700">{whItems.length} صنف</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>نسبة الإشغال:</span>
                    <span className="font-mono">{wh.capacityPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        wh.capacityPercentage > 85 ? 'bg-rose-500' : wh.capacityPercentage > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${wh.capacityPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. CRITICAL LOW STOCK TABLE & RECENT VOUCHERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="font-black text-sm text-slate-900">تنبيهات النواقص وحد إعادة الطلب</h3>
            </div>
            <button
              onClick={() => setActiveModule('inv_items')}
              className="text-xs font-black text-[#C87A38] hover:text-amber-700 flex items-center gap-1"
            >
              <span>عرض كل الأصناف</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-bold">
              جميع الأصناف والخامات في مستويات أمان ممتازة
            </div>
          ) : (
            <div className="space-y-2.5">
              {lowStockItems.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200/70 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                        {item.code}
                      </span>
                      <span className="font-black text-slate-900 truncate">{item.nameAr}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{item.defaultWarehouseName} — {item.locationBin}</p>
                  </div>

                  <div className="text-left shrink-0">
                    <div className="font-mono font-black text-rose-700 text-sm">
                      {item.currentStock} / {item.reorderPoint} <span className="text-[10px]">{item.unitNameAr}</span>
                    </div>
                    <span className="text-[10px] font-bold text-rose-500">حد إعادة الطلب</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent GRN / GIN Activity Feed */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#C87A38]" />
              <h3 className="font-black text-sm text-slate-900">سجل أحدث أذونات الإضافة والصرف المخزني</h3>
            </div>
            <button
              onClick={() => setActiveModule('inv_stock_card')}
              className="text-xs font-black text-[#C87A38] hover:text-amber-700 flex items-center gap-1"
            >
              <span>كارت الصنف والسجل الكامل</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* GRN items */}
            {goodsReceiptNotes.slice(0, 2).map(grn => (
              <div
                key={grn.id}
                className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-900">{grn.grnNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">إذن إضافة</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{grn.notes || grn.warehouseName}</p>
                  </div>
                </div>
                <div className="text-left font-mono shrink-0">
                  <span className="font-black text-emerald-800 text-sm block">+{grn.totalAmount.toLocaleString()} EGP</span>
                  <span className="text-[10px] text-slate-400">{grn.date}</span>
                </div>
              </div>
            ))}

            {/* GIN items */}
            {goodsIssueNotes.slice(0, 2).map(gin => (
              <div
                key={gin.id}
                className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200/70 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-900">{gin.ginNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        {gin.type === 'production_mo' ? 'صرف إنتاج' : gin.type === 'maintenance_workshop' ? 'صرف صيانة' : 'صرف هالك'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{gin.notes || gin.warehouseName}</p>
                  </div>
                </div>
                <div className="text-left font-mono shrink-0">
                  <span className="font-black text-rose-800 text-sm block">-{gin.totalAmount.toLocaleString()} EGP</span>
                  <span className="text-[10px] text-slate-400">{gin.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
