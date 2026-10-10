// ====================================================
// REWAQ ERP — PHYSICAL STOCKTAKING & RECONCILIATION VIEW
// Periodic Inventory Count Sessions, Variance Analysis & Automated Adjustments
// ====================================================

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { StocktakeSession, StocktakeLine } from '../../types/erp';
import {
  ClipboardList,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  FileCheck,
  Printer,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Eye,
  FileSpreadsheet,
  Info
} from 'lucide-react';
import { exportStocktakingToExcel } from '../../utils/excelExport';
import { stockAt } from '../../services/warehouseStock';

// Item families a count can be limited to
const COUNT_CATEGORIES: { id: string; label: string; match: string[] }[] = [
  { id: 'all', label: 'كل أصناف المستودع', match: [] },
  { id: 'wood_panels', label: 'ألواح وأخشاب', match: ['wood_panels'] },
  { id: 'veneers_hpl', label: 'HPL وتجاليد وقشاط', match: ['veneers_hpl'] },
  { id: 'hardware', label: 'مفصلات وإكسسوار', match: ['hardware_hinges', 'hardware_accessories'] },
  { id: 'spare_parts_tools', label: 'قطع غيار وشفرات', match: ['spare_parts_tools'] },
  { id: 'finished', label: 'تام الصنع', match: ['finished_kitchen', 'finished_furniture'] }
];

export const StocktakingView: React.FC = () => {
  const {
    stocktakeSessions,
    warehouses,
    itemMasterCards,
    createStocktakeSession,
    postStocktakeAdjustment,
    showToast
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionForView, setSelectedSessionForView] = useState<StocktakeSession | null>(
    stocktakeSessions[0] || null
  );
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);

  // New Session Form State
  const [sessionWarehouseId, setSessionWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [sessionCategory, setSessionCategory] = useState<string>('all');
  const [sessionNotes, setSessionNotes] = useState<string>('جرد دوري لمستودع الخامات والألواح');

  // Items counted in this session: the chosen family, held in (or belonging to) the chosen warehouse
  const categoryMatch = COUNT_CATEGORIES.find(c => c.id === sessionCategory)?.match || [];
  const eligibleItems = itemMasterCards.filter(i =>
    (categoryMatch.length === 0 || categoryMatch.includes(i.category)) &&
    (i.defaultWarehouseId === sessionWarehouseId || stockAt(i, sessionWarehouseId) > 0)
  );

  const [countedLines, setCountedLines] = useState<Record<string, number>>({});

  const handleInitCountModal = () => {
    setCountedLines({}); // every line starts at the warehouse's system quantity
    setShowNewSessionModal(true);
  };

  const handleCountChange = (itemId: string, val: number) => {
    setCountedLines(prev => ({ ...prev, [itemId]: val }));
  };

  const handleCreateSession = () => {
    if (eligibleItems.length === 0) {
      showToast('مفيش أصناف من النوع ده في المستودع المختار', 'warning');
      return;
    }
    const lines: any[] = eligibleItems.map(item => {
      const systemQty = stockAt(item, sessionWarehouseId);
      const counted = countedLines[item.id] !== undefined ? countedLines[item.id] : systemQty;
      return {
        itemId: item.id,
        itemCode: item.code,
        itemName: item.nameAr,
        category: item.category,
        unit: item.unitNameAr,
        locationBin: item.locationBin,
        systemQty,
        countedQty: counted,
        unitCost: item.weightedAvgCost,
        notes: counted !== systemQty ? 'تم رصد فرق أثناء العد الفعلي' : 'مطابق'
      };
    });

    const newSession = createStocktakeSession({
      warehouseId: sessionWarehouseId,
      categoryFilter: sessionCategory,
      lines,
      notes: sessionNotes
    });

    if (newSession) {
      setSelectedSessionForView(newSession);
      setShowNewSessionModal(false);
    }
  };

  const handlePostAdjustment = (sessionId: string) => {
    postStocktakeAdjustment(sessionId);
    const updated = stocktakeSessions.find(s => s.id === sessionId);
    if (updated) setSelectedSessionForView({ ...updated, status: 'posted' });
  };

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl">
      {/* 1. HEADER */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>الجرد والرقابة الدورية — Physical Stocktaking & Inventory Reconciliation</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-purple-400" />
            <span>الجرد الدوري والتسويات الجردية</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            مطابقة الرصيد الفعلي على أرض الواقع مع الرصيد الدفتري للنظام، ورصد العجز أو الفائض وتوليد قيود التسوية المحاسبية التلقائية.
          </p>
        </div>

        <button
          onClick={handleInitCountModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-700 hover:bg-purple-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>بدء جلسة جرد دوري</span>
        </button>
      </div>

      {/* 2. SESSIONS LIST CARDS */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-xs text-slate-700">جلسات الجرد المنفذة بالنظام:</h3>
          <span className="text-[11px] text-slate-400 font-bold">{stocktakeSessions.length} جلسات مسجلة</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stocktakeSessions.map(session => (
            <div
              key={session.id}
              onClick={() => setSelectedSessionForView(session)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                selectedSessionForView?.id === session.id
                  ? 'bg-purple-50/70 border-purple-300 shadow-sm'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 text-xs">{session.sessionNumber}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  session.status === 'posted'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {session.status === 'posted' ? 'مرحلة ومسواة محاسبياً' : 'مكتملة (في انتظار الترحيل)'}
                </span>
              </div>

              <div className="text-xs text-slate-700 font-bold">{session.warehouseName}</div>
              <p className="text-[11px] text-slate-500">{session.notes}</p>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 font-mono">
                <span className="text-slate-500">{session.startDate}</span>
                <span className={`font-black ${session.totalVarianceAmount < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  فروق الجرد: {session.totalVarianceAmount.toLocaleString()} EGP
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. ACTIVE SESSION DETAILS & ADJUSTMENT COMMIT */}
      {selectedSessionForView && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                  {selectedSessionForView.sessionNumber}
                </span>
                <h3 className="font-black text-base text-slate-900">
                  نتائج الجرد الفعلي — {selectedSessionForView.warehouseName}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                تاريخ الجرد: {selectedSessionForView.startDate} | المشرف: {selectedSessionForView.conductedByUserName}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  exportStocktakingToExcel(selectedSessionForView);
                  showToast(`✓ تم تصدير تقرير الجرد (${selectedSessionForView.sessionNumber}) إلى ملف Excel بنجاح`, 'success');
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
                title="تصدير تقرير الجرد والفروق إلى ملف Excel"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                <span>تصدير Excel</span>
              </button>

              {selectedSessionForView.status !== 'posted' ? (
                <button
                  onClick={() => handlePostAdjustment(selectedSessionForView.id)}
                  className="px-5 py-2.5 rounded-2xl bg-[#C87A38] hover:bg-amber-600 text-white font-black text-xs shadow-lg transition-all flex items-center gap-1.5"
                  title="تعديل رصيد النظام ليطابق الجرد الفعلي وترحيل قيد الفروق"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>اعتماد التسوية ومطابقة الأرصدة 100%</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>أرصدة النظام مطابقة للجرد الفعلي 100%</span>
                </span>
              )}

              <button
                onClick={() => window.print()}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                title="طباعة محضر الجرد"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Physical Count Rule Explanation Banner */}
          <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200/80 flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed">
            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-black block">ضابط الرقابة المخزنية وإقفال الجلسة:</span>
              <span>
                لا تُقفل جلسة الجرد إلا بعد اعتماد وترحيل التسوية؛ حيث يقوم النظام بـ <strong>تعديل كميات كروت الأصناف في المستودع فوراً لتتطابق تماماً مع الجرد الفعلي المعدود على الطبيعة (Counted Qty)</strong>، وإنشاء قيد الفروق الجردية في شجرة الحسابات تلقائياً.
              </span>
            </div>
          </div>

          {/* Session Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 font-bold block mb-0.5">القيمة الدفترية للنظام:</span>
              <span className="font-mono font-black text-slate-900 text-base">
                {selectedSessionForView.totalSystemValue.toLocaleString()} EGP
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 font-bold block mb-0.5">القيمة الفعلية المعدودة:</span>
              <span className="font-mono font-black text-slate-900 text-base">
                {selectedSessionForView.totalCountedValue.toLocaleString()} EGP
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl border ${
              selectedSessionForView.totalVarianceAmount < 0
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <span className="font-bold block mb-0.5">صافي فروق الجرد:</span>
              <span className="font-mono font-black text-base">
                {selectedSessionForView.totalVarianceAmount > 0 ? '+' : ''}
                {selectedSessionForView.totalVarianceAmount.toLocaleString()} EGP
              </span>
            </div>
          </div>

          {/* Lines Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">الصنف / الخامة</th>
                  <th className="py-3 px-4">موقع التخزين</th>
                  <th className="py-3 px-4 text-center">الرصيد الدفتري</th>
                  <th className="py-3 px-4 text-center">العد الفعلي</th>
                  <th className="py-3 px-4 text-center">فرق الكمية</th>
                  <th className="py-3 px-4 text-left">التكلفة</th>
                  <th className="py-3 px-4 text-left">قيمة الفرق</th>
                  <th className="py-3 px-4">ملاحظات الفحص</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {selectedSessionForView.lines.map(line => (
                  <tr key={line.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-sans font-bold text-slate-800">
                      <div>{line.itemName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">[{line.itemCode}]</span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600">{line.locationBin}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{line.systemQty} {line.unit}</td>
                    <td className="py-3 px-4 text-center font-black text-slate-900">{line.countedQty} {line.unit}</td>
                    <td className="py-3 px-4 text-center font-black">
                      <span className={`px-2 py-0.5 rounded-md ${
                        line.varianceQty === 0 ? 'bg-slate-100 text-slate-600' :
                        line.varianceQty < 0 ? 'bg-rose-100 text-rose-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {line.varianceQty > 0 ? `+${line.varianceQty}` : line.varianceQty} {line.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-left text-slate-600">{line.unitCost.toLocaleString()} EGP</td>
                    <td className="py-3 px-4 text-left font-black">
                      <span className={line.varianceAmount < 0 ? 'text-rose-700' : line.varianceAmount > 0 ? 'text-emerald-700' : 'text-slate-500'}>
                        {line.varianceAmount > 0 ? '+' : ''}{line.varianceAmount.toLocaleString()} EGP
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 text-[11px]">{line.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MODAL: START NEW STOCKTAKING SESSION */}
      {showNewSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-purple-700">
                <ClipboardList className="w-6 h-6" />
                <h3 className="font-black text-lg text-slate-900">بدء جلسة جرد دوري وتسجيل العد الفعلي</h3>
              </div>
              <button onClick={() => setShowNewSessionModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-rose-50 flex items-center justify-center">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">المستودع المستهدف للجرد *:</label>
                  <select
                    value={sessionWarehouseId}
                    onChange={(e) => { setSessionWarehouseId(e.target.value); setCountedLines({}); }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">نوع الأصناف المجرودة:</label>
                  <select
                    value={sessionCategory}
                    onChange={(e) => {
                      setSessionCategory(e.target.value);
                      setCountedLines({});
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {COUNT_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 mb-1 block">ملاحظات الجرد:</label>
                  <input
                    type="text"
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-black text-slate-900 text-xs block">
                  أدخل الكميات المعدودة فعلياً للأصناف بالمستودع:
                </span>

                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">الصنف / الرف</th>
                        <th className="py-2.5 px-3 text-center">الرصيد بالنظام</th>
                        <th className="py-2.5 px-3 text-center w-36">العد الفعلي (أدخل هنا)</th>
                        <th className="py-2.5 px-3 text-center">فرق الكمية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {eligibleItems.map(item => {
                        const currentVal = countedLines[item.id] !== undefined ? countedLines[item.id] : stockAt(item, sessionWarehouseId);
                        const diff = currentVal - stockAt(item, sessionWarehouseId);

                        return (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-sans">
                              <div className="font-bold text-slate-800">{item.nameAr}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{item.locationBin}</div>
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-slate-700">
                              {stockAt(item, sessionWarehouseId)} {item.unitNameAr}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <input
                                type="number"
                                value={currentVal}
                                onChange={(e) => handleCountChange(item.id, parseFloat(e.target.value) || 0)}
                                className="w-24 px-2 py-1 bg-white border border-slate-300 rounded-xl text-center font-black text-slate-900"
                              />
                            </td>
                            <td className="py-2 px-3 text-center font-black">
                              <span className={diff < 0 ? 'text-rose-600' : diff > 0 ? 'text-emerald-700' : 'text-slate-400'}>
                                {diff > 0 ? `+${diff}` : diff} {item.unitNameAr}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowNewSessionModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600">إلغاء</button>
              <button onClick={handleCreateSession} className="px-5 py-2 rounded-xl text-xs font-black bg-purple-700 hover:bg-purple-600 text-white shadow-lg">
                حفظ جلسة الجرد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
