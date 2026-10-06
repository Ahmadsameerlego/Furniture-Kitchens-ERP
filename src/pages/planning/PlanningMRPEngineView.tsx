import React, { useState } from 'react';
import { 
  Play, 
  Cpu, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  ShoppingCart, 
  Hammer, 
  ArrowRightLeft, 
  Clock, 
  Calendar, 
  History,
  RotateCcw,
  Sparkles,
  Search,
  Filter
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
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#361D13] text-[#E29555] flex items-center justify-center shadow-xs">
              <Cpu className="w-5 h-5" />
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

        <div className="flex flex-wrap items-center gap-2.5">
          {totalShortagesCount > 0 && (
            <button
              onClick={onBatchGenerateProposals}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white rounded-2xl font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>توليد مقترحات توريد للنواقص ({totalShortagesCount})</span>
            </button>
          )}

          <button
            onClick={onOpenMRPModal}
            className="px-5 py-2.5 bg-gradient-to-r from-[#1E110B] to-[#361D13] text-[#E29555] hover:opacity-95 rounded-2xl font-black text-xs shadow-md shadow-[#1E110B]/20 border border-[#C87A38]/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-[#E29555]" />
            <span>تشغيل معالجة الـ MRP الآن</span>
          </button>
        </div>
      </div>

      {/* MRP Logic Formula & Live Summary Banner */}
      <div className="bg-gradient-to-br from-[#1E110B] via-[#2A170F] to-[#361D13] rounded-3xl p-5 text-white shadow-md border border-[#C87A38]/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[#E29555] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#C87A38]/20 border border-[#C87A38]/40">
                معادلة حساب صافي العجز المعتمدة (Standard MRP Formula)
              </span>
              <span className="text-[11px] text-slate-300 font-bold hidden sm:inline">
                وفقاً لمعايير APICS / ETO Manufacturing
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-black font-mono">
              <span className="px-3 py-1.5 bg-rose-500/20 text-rose-300 rounded-xl border border-rose-500/30 shadow-xs">
                صافي العجز (Net Shortage)
              </span>
              <span className="text-[#E29555] font-black text-base">=</span>
              <span className="px-3 py-1.5 bg-blue-500/20 text-blue-200 rounded-xl border border-blue-500/30">
                إجمالي الطلب (Gross Demand)
              </span>
              <span className="text-[#E29555] font-black text-base">-</span>
              <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-200 rounded-xl border border-emerald-500/30">
                المخزون الحر (On Hand - Reserved)
              </span>
              <span className="text-[#E29555] font-black text-base">-</span>
              <span className="px-3 py-1.5 bg-purple-500/20 text-purple-200 rounded-xl border border-purple-500/30">
                أوامر شراء بالطريق (Incoming POs)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 shrink-0 self-start lg:self-center">
            <Clock className="w-5 h-5 text-[#E29555]" />
            <div className="text-xs">
              <span className="text-slate-300 block text-[10px] font-bold">آخر معالجة للمحرك</span>
              <span className="font-mono font-black text-white">{runs[0]?.runDate || 'اليوم'} - {runs[0]?.runNumber || 'MRP-AUTO'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold block">إجمالي البنود المطلوبة</span>
            <div className="text-2xl font-black text-[#1E110B] mt-1 font-mono">{netRequirements.length}</div>
            <span className="text-[10px] text-slate-400 font-medium">من كافة مشاريع الإفراج المعتمدة</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-700 font-bold block">بنود بها عجز حرج</span>
            <div className="text-2xl font-black text-rose-600 mt-1 font-mono">{totalShortagesCount}</div>
            <span className="text-[10px] text-rose-500 font-medium">تحتاج إجراء توريد فوري</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-700 font-bold block">مقترحات شراء للموردين</span>
            <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">{totalPurchaseActions}</div>
            <span className="text-[10px] text-emerald-600 font-medium">أخشاب وإكسسوارات خام</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-purple-700 font-bold block">مقترحات تشغيل داخلي</span>
            <div className="text-2xl font-black text-purple-700 mt-1 font-mono">{totalProduceActions}</div>
            <span className="text-[10px] text-purple-600 font-medium">شاسيهات وتجميع بالمصنع</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Hammer className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Navigation Tabs & Search/Filter Controls Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          
          {/* Main Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('net_requirements')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'net_requirements'
                  ? 'bg-[#1E110B] text-white shadow-md border border-[#C87A38]/30'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className={`w-4 h-4 ${activeTab === 'net_requirements' ? 'text-[#E29555]' : 'text-slate-400'}`} />
              <span>مصفوفة صافي الاحتياجات والعجز (Net Matrix)</span>
              <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
                activeTab === 'net_requirements' ? 'bg-[#C87A38] text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {netRequirements.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('run_history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'run_history'
                  ? 'bg-[#1E110B] text-white shadow-md border border-[#C87A38]/30'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <History className={`w-4 h-4 ${activeTab === 'run_history' ? 'text-[#E29555]' : 'text-slate-400'}`} />
              <span>سجل تشغيلات الـ MRP السابقة</span>
              <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
                activeTab === 'run_history' ? 'bg-[#C87A38] text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {runs.length}
              </span>
            </button>
          </div>

          {/* Quick Filter Buttons (When on Net Requirements Tab) */}
          {activeTab === 'net_requirements' && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-[#361D13] text-[#E29555] shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الكل ({netRequirements.length})
              </button>
              <button
                onClick={() => setFilterType('shortages_only')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  filterType === 'shortages_only'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                النواقص والعجز فقط ({totalShortagesCount})
              </button>
              <button
                onClick={() => setFilterType('action_purchase')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  filterType === 'action_purchase'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                مقترحات شراء ({totalPurchaseActions})
              </button>
              <button
                onClick={() => setFilterType('action_produce')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  filterType === 'action_produce'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                مقترحات تشغيل ({totalProduceActions})
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        {activeTab === 'net_requirements' && (
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث بالبند، الكود، التصنيف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38] focus:bg-white transition-all shadow-xs"
            />
          </div>
        )}

      </div>

      {activeTab === 'net_requirements' ? (
        <div className="space-y-4">
          {/* Net Requirements Matrix Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#1E110B]/5 text-slate-700 font-black border-b border-slate-200/80">
                  <tr>
                    <th className="px-4 py-3.5">البند والكود</th>
                    <th className="px-4 py-3.5">التصنيف</th>
                    <th className="px-4 py-3.5">إجمالي الطلب</th>
                    <th className="px-4 py-3.5">الرصيد الفعلي</th>
                    <th className="px-4 py-3.5">المحجوز</th>
                    <th className="px-4 py-3.5">المتاح الحر</th>
                    <th className="px-4 py-3.5">وارد بالطريق</th>
                    <th className="px-4 py-3.5">صافي العجز</th>
                    <th className="px-4 py-3.5">الإجراء المقترح</th>
                    <th className="px-4 py-3.5">تاريخ الأمر</th>
                    <th className="px-4 py-3.5 text-center">إجراء فوري</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredRequirements.map((row) => {
                    const earliestNeed = row.demandSources[0]?.requiredDate || new Date().toISOString().substring(0, 10);
                    const suggestedOrderDate = calculateBackwardDate(earliestNeed, row.leadTimeDays);

                    return (
                      <tr key={row.itemId} className={`hover:bg-slate-50/90 transition-colors ${row.netShortageQty > 0 ? 'bg-rose-50/20' : ''}`}>
                        <td className="px-4 py-3.5">
                          <div className="font-black text-[#1E110B]">{row.itemName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{row.itemCode}</div>
                        </td>

                        <td className="px-4 py-3.5 text-slate-600 font-bold">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px]">
                            {row.itemCategory}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 font-mono font-black text-slate-900">
                          {row.grossDemandQty} <span className="text-[10px] text-slate-500 font-normal">{row.uom}</span>
                        </td>

                        <td className="px-4 py-3.5 font-mono text-slate-700">
                          {row.currentStockOnHand} <span className="text-[10px] text-slate-400">{row.uom}</span>
                        </td>

                        <td className="px-4 py-3.5 font-mono text-rose-600 font-bold">
                          {row.reservedStockQty} <span className="text-[10px] text-rose-400">{row.uom}</span>
                        </td>

                        <td className="px-4 py-3.5 font-mono font-black text-emerald-700">
                          {row.availableFreeStock} <span className="text-[10px] text-emerald-500">{row.uom}</span>
                        </td>

                        <td className="px-4 py-3.5 font-mono text-blue-600 font-bold">
                          {row.incomingPOQty} <span className="text-[10px] text-blue-400">{row.uom}</span>
                        </td>

                        <td className="px-4 py-3.5 font-black font-mono">
                          {row.netShortageQty > 0 ? (
                            <span className="px-2.5 py-1 rounded-xl bg-rose-100 text-rose-700 font-black border border-rose-200">
                              {row.netShortageQty} {row.uom}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                              مكتمل (0)
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          {row.suggestedSupplyType === 'purchase_requisition' ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 shadow-xs">
                              <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                              طلب شراء
                            </span>
                          ) : row.suggestedSupplyType === 'planned_production' ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-blue-800 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200 shadow-xs">
                              <Hammer className="w-3.5 h-3.5 text-blue-600" />
                              أمر تشغيل
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              متوفر بالمخزن
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-amber-800 font-black font-mono text-[11px]">
                          {suggestedOrderDate}
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          {row.netShortageQty > 0 ? (
                            <button
                              onClick={() => onGenerateProposalFromShortage(row)}
                              className="px-3 py-1.5 text-[11px] font-black text-[#361D13] hover:text-white bg-amber-100 hover:bg-[#361D13] border border-amber-300 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer mx-auto"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#C87A38]" />
                              <span>إنشاء مقترح</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold">لا يتطلب إجراء</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
                      <span className="font-mono font-black text-sm px-3 py-1 rounded-xl bg-[#361D13] text-[#E29555] shadow-xs">
                        {run.runNumber}
                      </span>
                      <span className="text-[11px] px-3 py-0.5 rounded-full font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>مكتمل بنجاح (Completed)</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      تم التشغيل بواسطة: <strong className="text-slate-800">{run.executedByUserName}</strong> في <span className="font-mono text-slate-700 font-bold">{run.runDate}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-right bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">الطلبات المعالجة</span>
                      <span className="font-black text-slate-900 text-sm font-mono">{run.demandsEvaluatedCount}</span>
                    </div>
                    <div className="border-r border-slate-200 pr-4">
                      <span className="text-slate-400 block text-[10px] font-bold">المقترحات الصادرة</span>
                      <span className="font-black text-[#C87A38] text-sm font-mono">
                        {(run.purchaseProposalsGeneratedCount || 0) + (run.productionProposalsGeneratedCount || 0)}
                      </span>
                    </div>
                    <div className="border-r border-slate-200 pr-4">
                      <span className="text-slate-400 block text-[10px] font-bold">أفق التخطيط</span>
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
