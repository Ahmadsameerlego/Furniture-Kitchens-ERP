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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-indigo-600" />
            محرك تخطيط الاحتياجات (MRP Calculation Engine)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            حساب صافي الاحتياجات (Net Requirements) بدقة: إجمالي الطلب - المخزون الحر المتاح (الرصيد - المحجوز) - الوارد في الطريق
          </p>
        </div>

        <div className="flex items-center gap-2">
          {totalShortagesCount > 0 && (
            <button
              onClick={onBatchGenerateProposals}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              توليد مقترحات توريد لكافة النواقص ({totalShortagesCount})
            </button>
          )}

          <button
            onClick={onOpenMRPModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            تشغيل محرك الـ MRP الآن
          </button>
        </div>
      </div>

      {/* MRP Logic Formula Explainer Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              معادلة حساب صافي العجز المعتمدة بالمصنع (Standard MRP Logic)
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-bold font-mono">
              <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30">
                صافي العجز (Net Shortage)
              </span>
              <span className="text-slate-400">=</span>
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">
                إجمالي الطلب (Gross Demand)
              </span>
              <span className="text-slate-400">-</span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">
                المخزون الحر (On Hand - Reserved)
              </span>
              <span className="text-slate-400">-</span>
              <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30">
                أوامر شراء في الطريق (Incoming POs)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 shrink-0">
            <Clock className="w-4 h-4 text-indigo-300" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px]">تاريخ آخر معالجة</span>
              <span className="font-bold text-white">{runs[0]?.runDate || 'اليوم'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('net_requirements')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'net_requirements' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            نتائج صافي الاحتياجات والعجز (Net Requirements)
            <span className="mr-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
              {netRequirements.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('run_history')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'run_history' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            سجل تشغيلات الـ MRP السابقة (Run History)
            <span className="mr-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
              {runs.length}
            </span>
          </button>
        </div>

        {activeTab === 'net_requirements' && (
          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterType === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل ({netRequirements.length})
            </button>
            <button
              onClick={() => setFilterType('shortages_only')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterType === 'shortages_only' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              النواقص والعجز فقط ({totalShortagesCount})
            </button>
            <button
              onClick={() => setFilterType('action_purchase')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterType === 'action_purchase' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              مقترح شراء ({totalPurchaseActions})
            </button>
          </div>
        )}
      </div>

      {activeTab === 'net_requirements' ? (
        <div className="space-y-4">
          
          {/* Search Box */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث بالبند، الكود، التصنيف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
          </div>

          {/* Net Requirements Matrix Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/60">
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
                    <th className="px-4 py-3.5">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRequirements.map((row) => {
                    const earliestNeed = row.demandSources[0]?.requiredDate || new Date().toISOString().substring(0, 10);
                    const suggestedOrderDate = calculateBackwardDate(earliestNeed, row.leadTimeDays);

                    return (
                      <tr key={row.itemId} className={`hover:bg-slate-50/80 transition-colors ${row.netShortageQty > 0 ? 'bg-rose-50/20' : ''}`}>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{row.itemName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{row.itemCode}</div>
                        </td>

                        <td className="px-4 py-3.5 text-slate-600">
                          {row.itemCategory}
                        </td>

                        <td className="px-4 py-3.5 font-bold text-slate-900">
                          {row.grossDemandQty} {row.uom}
                        </td>

                        <td className="px-4 py-3.5 text-slate-700">
                          {row.currentStockOnHand} {row.uom}
                        </td>

                        <td className="px-4 py-3.5 text-rose-600 font-medium">
                          {row.reservedStockQty} {row.uom}
                        </td>

                        <td className="px-4 py-3.5 font-bold text-emerald-700">
                          {row.availableFreeStock} {row.uom}
                        </td>

                        <td className="px-4 py-3.5 text-blue-600 font-medium">
                          {row.incomingPOQty} {row.uom}
                        </td>

                        <td className="px-4 py-3.5 font-black">
                          {row.netShortageQty > 0 ? (
                            <span className="text-rose-600">
                              {row.netShortageQty} {row.uom}
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-semibold">مكتمل (0)</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          {row.suggestedSupplyType === 'purchase_requisition' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <ShoppingCart className="w-3 h-3" />
                              طلب شراء
                            </span>
                          ) : row.suggestedSupplyType === 'planned_production' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              <Hammer className="w-3 h-3" />
                              أمر تشغيل
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" />
                              متوفر
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-amber-700 font-medium text-[11px]">
                          {suggestedOrderDate}
                        </td>

                        <td className="px-4 py-3.5">
                          {row.netShortageQty > 0 ? (
                            <button
                              onClick={() => onGenerateProposalFromShortage(row)}
                              className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <span>إنشاء مقترح</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400">لا يحتاج</span>
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
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {runs.map((run) => (
              <div key={run.id} className="p-5 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-bold text-slate-900">{run.runNumber}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        مكتمل بنجاح (Completed)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      تم التشغيل بواسطة: <strong>{run.executedByUserName}</strong> في <strong>{run.runDate}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-right">
                    <div>
                      <span className="text-slate-400 block text-[10px]">الطلبات المعالجة</span>
                      <span className="font-bold text-slate-800 text-sm">{run.demandsEvaluatedCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">المقترحات الصادرة</span>
                      <span className="font-bold text-amber-600 text-sm">
                        {(run.purchaseProposalsGeneratedCount || 0) + (run.productionProposalsGeneratedCount || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">أفق التخطيط</span>
                      <span className="font-bold text-indigo-600 text-sm">{run.planningHorizonDays} يوم</span>
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
