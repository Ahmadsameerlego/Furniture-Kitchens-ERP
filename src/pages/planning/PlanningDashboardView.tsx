import React from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Layers, 
  ShoppingCart, 
  Hammer, 
  Cpu, 
  Clock, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle2, 
  Play, 
  FileText, 
  ChevronLeft,
  Boxes,
  Gauge
} from 'lucide-react';
import { 
  PlanningDemand, 
  SupplyProposal, 
  WorkCenterCapacity, 
  ProjectPlanningReadiness, 
  PlanningRun 
} from '../../types/planning';
import { getReadinessBadge, getWorkCenterLoadBadge, getProposalTypeBadge, getProposalStatusBadge } from '../../services/planningService';

interface PlanningDashboardViewProps {
  demands: PlanningDemand[];
  proposals: SupplyProposal[];
  workCenters: WorkCenterCapacity[];
  readinessList: ProjectPlanningReadiness[];
  runs: PlanningRun[];
  onNavigate: (tab: string) => void;
  onOpenMRPModal: () => void;
  onOpenCreateProposalModal: () => void;
}

export const PlanningDashboardView: React.FC<PlanningDashboardViewProps> = ({
  demands,
  proposals,
  workCenters,
  readinessList,
  runs,
  onNavigate,
  onOpenMRPModal,
  onOpenCreateProposalModal,
}) => {
  // Compute Key Metrics
  const activeDemandsCount = demands.filter(d => d.status !== 'closed' && d.status !== 'cancelled').length;
  const pendingProposalsCount = proposals.filter(p => p.status === 'draft' || p.status === 'under_review').length;
  const approvedProposalsCount = proposals.filter(p => p.status === 'approved').length;
  
  const bottleneckCenters = workCenters.filter(wc => wc.utilizationPercentage >= 85);
  const criticalProjects = readinessList.filter(r => r.overallReadiness === 'blocked_materials' || r.overallReadiness === 'blocked_capacity');
  const readyProjects = readinessList.filter(r => r.overallReadiness === 'ready');
  
  const latestRun = runs[0];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-l from-indigo-900 via-slate-900 to-slate-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-500/30">
            <Cpu className="w-3.5 h-3.5" />
            <span>نظام تخطيط الاحتياجات وسلاسل الإمداد المتقدم (Enterprise MRP & Supply Planning)</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">لوحة تحكم التخطيط والجدولة والـ MRP</h2>
          <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
            متابعة الطلبات المعتمدة من المكتب الفني، حساب صافي الاحتياجات (Net Requirements)، كشف العجز في الخامات، إدارة مقترحات الشراء والتشغيل، ومراقبة سعة مراكز العمل الحساسة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenMRPModal}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            تشغيل محرك الـ MRP الآن
          </button>
          
          <button
            onClick={onOpenCreateProposalModal}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-bold text-xs border border-slate-700 transition-all flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            إنشاء مقترح توريد يدوي
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Demands */}
        <div 
          onClick={() => onNavigate('plan_demand')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">طلبات التخطيط النشطة</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{activeDemandsCount}</span>
            <span className="text-xs font-semibold text-blue-600">طلب مفتوح</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span>منها {readinessList.length} مشروع تعاقدي جاري تخطيطه</span>
          </p>
        </div>

        {/* Critical Shortages */}
        <div 
          onClick={() => onNavigate('plan_shortages')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">مشاريع في حالة عجز خامات</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{criticalProjects.length}</span>
            <span className="text-xs font-semibold text-rose-500">مشروع متوقف على توريد</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span>يتطلب اعتماد مقترحات شراء فورية</span>
          </p>
        </div>

        {/* Proposals Pending Approval */}
        <div 
          onClick={() => onNavigate('plan_proposals')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">مقترحات التوريد والإنتاج</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{pendingProposalsCount}</span>
            <span className="text-xs font-semibold text-amber-600">بانتظار الاعتماد</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span>{approvedProposalsCount} مقترح معتمد جاهز للمشتريات / الورش</span>
          </p>
        </div>

        {/* Work Center Bottlenecks */}
        <div 
          onClick={() => onNavigate('plan_capacity')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">مراكز العمل المختنقة (Load &gt; 85%)</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{bottleneckCenters.length}</span>
            <span className="text-xs font-semibold text-purple-600">مركز تشغيل حرج</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span>من إجمالي {workCenters.length} مراكز إنتاج رئيسية</span>
          </p>
        </div>

      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Project Readiness & Material Shortages */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Projects Material Readiness Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">جاهزية خامات المشاريع للإنتاج (Project Material Readiness)</h3>
                <p className="text-xs text-slate-400">تتبع نسبة توفر الخامات وبنود الـ BOM لكل مشروع تعاقدي معتمد</p>
              </div>
              <button 
                onClick={() => onNavigate('plan_demand')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>عرض الكل</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {readinessList.map((project) => {
                const badge = getReadinessBadge(project.overallReadiness);
                return (
                  <div key={project.projectId} className="p-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{project.projectNumber}</span>
                          <span className="text-xs text-slate-600 font-medium">- {project.projectName}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">العميل: {project.customerName} • التسليم المستهدف: {project.targetDeliveryDate}</p>
                      </div>

                      <div className="text-left">
                        <span className="text-xs font-black text-slate-800">{project.readinessPercentage}%</span>
                        <span className="text-[10px] text-slate-400 block">نسبة توفر الـ BOM</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2.5">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          project.readinessPercentage >= 100 
                            ? 'bg-emerald-500' 
                            : project.readinessPercentage >= 70 
                              ? 'bg-amber-500' 
                              : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(project.readinessPercentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-4">
                        <span>إجمالي البنود: <strong className="text-slate-700">{project.totalMaterialDemandsCount}</strong></span>
                        <span className="text-emerald-700">متوفر: <strong>{project.coveredMaterialsCount}</strong></span>
                        {project.shortageMaterialsCount > 0 && (
                          <span className="text-rose-600 font-bold">عجز خامات: {project.shortageMaterialsCount} بند</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-indigo-600 font-semibold cursor-pointer hover:underline" onClick={() => onNavigate('plan_shortages')}>
                        <span>فحص نواقص المشروع</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Supply Proposals */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">مقترحات التوريد العاجلة بانتظار الاعتماد</h3>
                <p className="text-xs text-slate-400">تحتاج موافقة التخطيط لإصدار طلبات الشراء وأوامر الورش</p>
              </div>
              <button 
                onClick={() => onNavigate('plan_proposals')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>إدارة كل المقترحات</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/60">
                  <tr>
                    <th className="px-4 py-3">الكود والنوع</th>
                    <th className="px-4 py-3">البند المطلوب</th>
                    <th className="px-4 py-3">الكمية المقترحة</th>
                    <th className="px-4 py-3">المشروع المرتبط</th>
                    <th className="px-4 py-3">تاريخ الأمر المقترح</th>
                    <th className="px-4 py-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {proposals.slice(0, 4).map((p) => {
                    const typeBadge = getProposalTypeBadge(p.proposalType);
                    const statusBadge = getProposalStatusBadge(p.status);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            {p.proposalType === 'purchase_requisition' ? (
                              <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Hammer className="w-3.5 h-3.5 text-blue-600" />
                            )}
                            <span>{p.proposalNumber}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{p.itemName}</div>
                          <div className="text-[10px] text-slate-400">{p.itemCode}</div>
                        </td>
                        <td className="px-4 py-3 font-bold text-indigo-700">
                          {p.quantity} {p.uom}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{p.projectNumbers.join(', ') || 'مخزون'}</td>
                        <td className="px-4 py-3 text-amber-700 font-medium">{p.suggestedOrderDate}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusBadge.color}`}>
                            {statusBadge.label}
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

        {/* Right Column: Capacity Overview & Latest MRP Run */}
        <div className="space-y-6">
          
          {/* Work Center Load Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Gauge className="w-4 h-4 text-purple-600" />
                سعة مراكز العمل الحالية
              </h3>
              <button 
                onClick={() => onNavigate('plan_capacity')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                التفاصيل
              </button>
            </div>

            <div className="space-y-3.5">
              {workCenters.map((wc) => {
                const loadBadge = getWorkCenterLoadBadge(wc.utilizationPercentage);
                return (
                  <div key={wc.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{wc.nameAr}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${loadBadge.color}`}>
                        {wc.utilizationPercentage}% ({loadBadge.label})
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          wc.utilizationPercentage >= 90 ? 'bg-rose-500' :
                          wc.utilizationPercentage >= 75 ? 'bg-amber-500' :
                          'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(wc.utilizationPercentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>الأحمال المحجوزة: {wc.allocatedHours} س</span>
                      <span>الطاقة المتاحة: {wc.totalCapacityWeeklyHours} س/أسبوع</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Last MRP Run Summary */}
          {latestRun && (
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-5 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">آخر تشغيل لمحرك الـ MRP</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  {latestRun.runNumber}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-slate-300">
                <p>تاريخ التشغيل: <strong className="text-white">{latestRun.runDate}</strong></p>
                <p>المنفذ: <strong className="text-white">{latestRun.executedByUserName}</strong></p>
                <p>أفق التخطيط: <strong className="text-white">{latestRun.planningHorizonDays} يوم عمل</strong></p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-center">
                <div className="p-2 bg-white/5 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">الطلبات المعالجة</span>
                  <span className="text-base font-bold text-white">{latestRun.demandsEvaluatedCount}</span>
                </div>
                <div className="p-2 bg-white/5 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">المقترحات المولدة</span>
                  <span className="text-base font-bold text-amber-400">
                    {(latestRun.purchaseProposalsGeneratedCount || 0) + (latestRun.productionProposalsGeneratedCount || 0)}
                  </span>
                </div>
              </div>

              <button
                onClick={onOpenMRPModal}
                className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>إعادة تشغيل MRP جديد</span>
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
