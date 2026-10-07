import React, { useState } from 'react';
import { 
  Play, 
  Cpu, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  ShoppingCart, 
  Hammer, 
  Clock, 
  Calendar, 
  History, 
  RotateCcw, 
  Sparkles, 
  Search, 
  Filter,
  ArrowRightLeft,
  ChevronLeft,
  Box,
  TrendingDown,
  Info
} from 'lucide-react';
import { 
  MRPNetRequirement, 
  PlanningRun, 
  SupplyProposal 
} from '../../types/planning';
import { getShortageLevelBadge, calculateBackwardDate } from '../../services/planningService';

interface PlanningMRPEngineViewProps {
  netRequirements: MRPNetRequirement[];
  runs: PlanningRun[];
  onOpenMRPModal: () => void;
  onGenerateProposalFromShortage: (item: MRPNetRequirement) => void;
  onBatchGenerateProposals: () => void;
}

export const PlanningMRPEngineView: React.FC<PlanningMRPEngineViewProps> = ({
  netRequirements,
  runs,
  onOpenMRPModal,
  onGenerateProposalFromShortage,
  onBatchGenerateProposals,
}) => {
  const [activeTab, setActiveTab] = useState<'net_requirements' | 'run_history'>('net_requirements');
  const [filterType, setFilterType] = useState<'all' | 'shortages_only' | 'action_purchase' | 'action_produce'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequirements = netRequirements.filter(item => {
    const matchesSearch = 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCategory.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'shortages_only') return item.netShortageQty > 0;
    if (filterType === 'action_purchase') return item.suggestedSupplyType === 'purchase_requisition';
    if (filterType === 'action_produce') return item.suggestedSupplyType === 'planned_production';
    return true;
  });

  const totalShortagesCount = netRequirements.filter(r => r.netShortageQty > 0).length;
  const totalPurchaseActions = netRequirements.filter(r => r.suggestedSupplyType === 'purchase_requisition' && r.netShortageQty > 0).length;
  const totalProduceActions = netRequirements.filter(r => r.suggestedSupplyType === 'planned_production' && r.netShortageQty > 0).length;

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#361D13] to-[#1E110B] text-[#E29555] flex items-center justify-center shadow-md">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1E110B] flex items-center gap-2">
                محرك تخطيط متطلبات المواد (MRP Calculation Engine)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                حساب صافي الاحتياجات تلقائياً بناءً على أوامر المشاريع، المخزون الحر المتاح، والأوامر الجاري توريدها
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {totalShortagesCount > 0 && (
            <button
              onClick={onBatchGenerateProposals}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>توليد مقترحات توريد للنواقص ({totalShortagesCount})</span>
            </button>
          )}

          <button
            onClick={onOpenMRPModal}
            className="px-5 py-2.5 bg-gradient-to-r from-[#1E110B] to-[#361D13] text-[#E29555] hover:opacity-95 rounded-2xl font-black text-xs shadow-md shadow-[#1E110B]/20 border border-[#C87A38]/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4 fill-[#E29555]" />
            <span>تشغيل معالجة الـ MRP الآن</span>
          </button>
        </div>
      </div>

      {/* MRP Logic Formula & Live Summary Banner */}
      <div className="bg-gradient-to-br from-[#1E110B] via-[#2A170F] to-[#361D13] rounded-3xl p-5 text-white shadow-lg border border-[#C87A38]/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-[#E29555] uppercase tracking-wider px-3 py-1 rounded-full bg-[#C87A38]/20 border border-[#C87A38]/40 inline-flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                معادلة حساب صافي العجز المعتمدة (Standard MRP Formula)
              </span>
              <span className="text-xs text-slate-300 font-bold hidden sm:inline">
                وفقاً لمعايير APICS / ETO Manufacturing
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-black font-mono">
              <span className="px-3.5 py-1.5 bg-rose-500/25 text-rose-300 rounded-xl border border-rose-500/40 shadow-xs whitespace-nowrap">
                صافي العجز (Net Shortage)
              </span>
              <span className="text-[#E29555] font-black text-base px-1">=</span>
              <span className="px-3.5 py-1.5 bg-blue-500/25 text-blue-200 rounded-xl border border-blue-500/40 whitespace-nowrap">
                إجمالي الطلب (Gross Demand)
              </span>
              <span className="text-[#E29555] font-black text-base px-1">-</span>
              <span className="px-3.5 py-1.5 bg-emerald-500/25 text-emerald-200 rounded-xl border border-emerald-500/40 whitespace-nowrap">
                المخزون الحر (Free Stock)
              </span>
              <span className="text-[#E29555] font-black text-base px-1">-</span>
              <span className="px-3.5 py-1.5 bg-purple-500/25 text-purple-200 rounded-xl border border-purple-500/40 whitespace-nowrap">
                أوامر شراء بالطريق (Incoming POs)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15 shrink-0 self-start lg:self-center">
            <Clock className="w-6 h-6 text-[#E29555]" />
            <div className="text-xs">
              <span className="text-slate-300 block text-[11px] font-bold">آخر معالجة للمحرك</span>
              <span className="font-mono font-black text-white text-sm">{runs[0]?.runDate || 'اليوم'} - {runs[0]?.runNumber || 'MRP-AUTO'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <span className="text-xs text-slate-500 font-bold block">إجمالي البنود المطلوبة</span>
            <div className="text-2xl font-black text-[#1E110B] mt-1 font-mono">{netRequirements.length}</div>
            <span className="text-[10px] text-slate-400 font-medium">من كافة مشاريع الإفراج المعتمدة</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-rose-200 transition-colors">
          <div>
            <span className="text-xs text-rose-700 font-bold block">بنود بها عجز حرج</span>
            <div className="text-2xl font-black text-rose-600 mt-1 font-mono">{totalShortagesCount}</div>
            <span className="text-[10px] text-rose-500 font-medium">تحتاج إجراء توريد فوري</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-colors">
          <div>
            <span className="text-xs text-emerald-700 font-bold block">مقترحات شراء للموردين</span>
            <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">{totalPurchaseActions}</div>
            <span className="text-[10px] text-emerald-600 font-medium">أخشاب وإكسسوارات خام</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-purple-200 transition-colors">
          <div>
            <span className="text-xs text-purple-700 font-bold block">مقترحات تشغيل داخلي</span>
            <div className="text-2xl font-black text-purple-700 mt-1 font-mono">{totalProduceActions}</div>
            <span className="text-[10px] text-purple-600 font-medium">شاسيهات وتجميع بالمصنع</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-xs">
            <Hammer className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Navigation Tabs & Search/Filter Controls Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        
        {/* Main Segmented Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="inline-flex p-1.5 bg-slate-100/80 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('net_requirements')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'net_requirements'
                  ? 'bg-[#1E110B] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Layers className={`w-4 h-4 ${activeTab === 'net_requirements' ? 'text-[#E29555]' : 'text-slate-500'}`} />
              <span>مصفوفة صافي الاحتياجات والعجز (Net Matrix)</span>
              <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                activeTab === 'net_requirements' ? 'bg-[#C87A38] text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {netRequirements.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('run_history')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'run_history'
                  ? 'bg-[#1E110B] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <History className={`w-4 h-4 ${activeTab === 'run_history' ? 'text-[#E29555]' : 'text-slate-500'}`} />
              <span>سجل تشغيلات الـ MRP السابقة</span>
              <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                activeTab === 'run_history' ? 'bg-[#C87A38] text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {runs.length}
              </span>
            </button>
          </div>

          {/* Search Bar on same row */}
          {activeTab === 'net_requirements' && (
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="بحث بالبند، الكود، التصنيف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38] focus:bg-white transition-all shadow-2xs font-medium"
              />
            </div>
          )}
        </div>

        {/* Quick Filter Pill Buttons */}
        {activeTab === 'net_requirements' && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-500 ml-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              تصفية النتائج:
            </span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'all'
                  ? 'bg-[#361D13] text-[#E29555] shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              <span>الكل</span>
              <span className="px-1.5 py-0.2 rounded-md bg-black/15 text-[10px] font-mono">{netRequirements.length}</span>
            </button>
            <button
              onClick={() => setFilterType('shortages_only')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'shortages_only'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <span>النواقص والعجز فقط</span>
              <span className="px-1.5 py-0.2 rounded-md bg-rose-200/60 text-rose-900 text-[10px] font-mono">{totalShortagesCount}</span>
            </button>
            <button
              onClick={() => setFilterType('action_purchase')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'action_purchase'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <span>مقترحات شراء</span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-200/60 text-emerald-900 text-[10px] font-mono">{totalPurchaseActions}</span>
            </button>
            <button
              onClick={() => setFilterType('action_produce')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'action_produce'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <span>مقترحات تشغيل</span>
              <span className="px-1.5 py-0.2 rounded-md bg-purple-200/60 text-purple-900 text-[10px] font-mono">{totalProduceActions}</span>
            </button>
          </div>
        )}

      </div>

      {activeTab === 'net_requirements' ? (
        <div className="space-y-4">
          {/* Net Requirements Matrix Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#1E110B]/5 text-slate-700 font-black border-b border-slate-200/80">
                  <tr className="whitespace-nowrap">
                    <th className="px-5 py-4 min-w-[220px]">البند والكود</th>
                    <th className="px-4 py-4 min-w-[120px]">التصنيف</th>
                    <th className="px-4 py-4 text-center min-w-[110px]">إجمالي الطلب</th>
                    <th className="px-4 py-4 text-center min-w-[110px]">الرصيد الفعلي</th>
                    <th className="px-4 py-4 text-center min-w-[100px]">المحجوز</th>
                    <th className="px-4 py-4 text-center min-w-[100px]">المتاح الحر</th>
                    <th className="px-4 py-4 text-center min-w-[110px]">وارد بالطريق</th>
                    <th className="px-5 py-4 text-center min-w-[130px]">صافي العجز</th>
                    <th className="px-4 py-4 text-center min-w-[130px]">الإجراء المقترح</th>
                    <th className="px-4 py-4 text-center min-w-[110px]">تاريخ الأمر</th>
                    <th className="px-5 py-4 text-center min-w-[130px]">إجراء فوري</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredRequirements.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400 font-bold">
                        لا توجد بنود مطابقة لمعايير البحث والتصفية
                      </td>
                    </tr>
                  ) : (
                    filteredRequirements.map((row) => {
                      const earliestNeed = row.demandSources[0]?.requiredDate || new Date().toISOString().substring(0, 10);
                      const suggestedOrderDate = calculateBackwardDate(earliestNeed, row.leadTimeDays);

                      return (
                        <tr 
                          key={row.itemId} 
                          className={`hover:bg-amber-50/20 transition-colors ${row.netShortageQty > 0 ? 'bg-rose-50/15' : ''}`}
                        >
                          {/* Item & Code */}
                          <td className="px-5 py-4">
                            <div className="font-black text-[#1E110B] text-xs leading-relaxed">{row.itemName}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 tracking-wider">{row.itemCode}</div>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-4">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold whitespace-nowrap border border-slate-200/60 inline-block">
                              {row.itemCategory}
                            </span>
                          </td>

                          {/* Gross Demand */}
                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            <span className="font-mono font-black text-slate-900 text-xs">{row.grossDemandQty}</span>
                            <span className="text-[10px] text-slate-500 font-normal mr-1">{row.uom}</span>
                          </td>

                          {/* Actual On Hand */}
                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            <span className="font-mono font-bold text-slate-700 text-xs">{row.currentStockOnHand}</span>
                            <span className="text-[10px] text-slate-400 mr-1">{row.uom}</span>
                          </td>

                          {/* Reserved */}
                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            <span className="font-mono font-black text-amber-700 text-xs">{row.reservedStockQty}</span>
                            <span className="text-[10px] text-amber-600/70 mr-1">{row.uom}</span>
                          </td>

                          {/* Available Free Stock */}
                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            <span className="font-mono font-black text-emerald-700 text-xs">{row.availableFreeStock}</span>
                            <span className="text-[10px] text-emerald-600/70 mr-1">{row.uom}</span>
                          </td>

                          {/* Incoming PO */}
                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            <span className="font-mono font-black text-blue-700 text-xs">{row.incomingPOQty}</span>
                            <span className="text-[10px] text-blue-600/70 mr-1">{row.uom}</span>
                          </td>

                          {/* Net Shortage Badge (Fix: No wrapping, clean pill) */}
                          <td className="px-5 py-4 text-center whitespace-nowrap">
                            {row.netShortageQty > 0 ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 font-black text-xs border border-rose-200 shadow-2xs">
                                <span className="font-mono">{row.netShortageQty}</span>
                                <span>{row.uom}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>مكتمل (0)</span>
                              </span>
                            )}
                          </td>

                          {/* Suggested Action */}
                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            {row.suggestedSupplyType === 'purchase_requisition' ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                                <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                                <span>طلب شراء</span>
                              </span>
                            ) : row.suggestedSupplyType === 'planned_production' ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-black text-blue-800 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200 shadow-2xs">
                                <Hammer className="w-3.5 h-3.5 text-blue-600" />
                                <span>أمر تشغيل</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>متوفر بالمخزن</span>
                              </span>
                            )}
                          </td>

                          {/* Suggested Order Date */}
                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            <span className="text-amber-800 font-black font-mono text-xs px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-200/80 inline-block">
                              {suggestedOrderDate}
                            </span>
                          </td>

                          {/* Immediate Action Button */}
                          <td className="px-5 py-4 text-center whitespace-nowrap">
                            {row.netShortageQty > 0 ? (
                              <button
                                onClick={() => onGenerateProposalFromShortage(row)}
                                className="px-3.5 py-1.5 text-xs font-black text-white bg-gradient-to-r from-[#361D13] to-[#1E110B] hover:opacity-90 rounded-xl transition-all inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer border border-[#C87A38]/30 active:scale-95"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-[#E29555]" />
                                <span>إنشاء مقترح</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-bold">لا يتطلب إجراء</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Run History Tab */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {runs.map((run) => (
              <div key={run.id} className="p-6 hover:bg-slate-50/80 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-sm px-3.5 py-1 rounded-xl bg-[#361D13] text-[#E29555] shadow-xs">
                        {run.runNumber}
                      </span>
                      <span className="text-xs px-3 py-1 rounded-xl font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>مكتمل بنجاح (Completed)</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      تم التشغيل بواسطة: <strong className="text-slate-800">{run.executedByUserName}</strong> في <span className="font-mono text-slate-700 font-bold">{run.runDate}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-right bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200/70">
                    <div>
                      <span className="text-slate-400 block text-[11px] font-bold">الطلبات المعالجة</span>
                      <span className="font-black text-slate-900 text-sm font-mono">{run.demandsEvaluatedCount}</span>
                    </div>
                    <div className="border-r border-slate-200 pr-5">
                      <span className="text-slate-400 block text-[11px] font-bold">المقترحات الصادرة</span>
                      <span className="font-black text-[#C87A38] text-sm font-mono">
                        {(run.purchaseProposalsGeneratedCount || 0) + (run.productionProposalsGeneratedCount || 0)}
                      </span>
                    </div>
                    <div className="border-r border-slate-200 pr-5">
                      <span className="text-slate-400 block text-[11px] font-bold">أفق التخطيط</span>
                      <span className="font-black text-[#1E110B] text-sm font-mono">{run.planningHorizonDays} يوم</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

