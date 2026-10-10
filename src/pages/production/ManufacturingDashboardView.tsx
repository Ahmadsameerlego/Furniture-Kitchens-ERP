import React from 'react';
import { ProductionOrder } from '../../types/erp';
import { WorkCenter, WorkOrder, ScrapClaimRecord } from '../../types/production';
import { ProductionService } from '../../services/productionService';
import { freshnessLabel, orderLastActivity, STOP_REASONS } from '../../services/shopFloor';
import {
  Factory,
  Boxes,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Package,
  Truck
} from 'lucide-react';

interface ManufacturingDashboardViewProps {
  orders: ProductionOrder[];
  workCenters: WorkCenter[];
  workOrders: WorkOrder[];
  scrapClaims: ScrapClaimRecord[];
  onSelectOrder: (order: ProductionOrder) => void;
  onNavigateToTab: (tab: string) => void;
}

export const ManufacturingDashboardView: React.FC<ManufacturingDashboardViewProps> = ({
  orders,
  workCenters,
  workOrders,
  scrapClaims,
  onSelectOrder,
  onNavigateToTab
}) => {
  // KPI metrics
  const activeOrdersCount = orders.filter(o => o.status === 'in_production').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const readyToInstallCount = orders.filter(o => o.status === 'ready_installation' || o.status === 'completed').length;

  const totalScrapCost = scrapClaims.reduce((acc, s) => acc + (s.estimatedCost || 0), 0);
  const activeWOs = workOrders.filter(w => w.status === 'in_progress');
  const avgEfficiency = Math.round(workCenters.reduce((acc, wc) => acc + wc.efficiencyRate, 0) / (workCenters.length || 1));

  // What the production manager has to act on today
  const liveIds = new Set(orders.filter(o => o.status === 'pending' || o.status === 'in_production').map(o => o.id));
  const blockedWOs = workOrders.filter(w => w.status === 'blocked' && liveIds.has(w.manufacturingOrderId));
  const outsideWOs = workOrders.filter(w => w.subcontract?.sentAt && !w.subcontract.receivedAt);
  const staleOrders = orders.filter(o => o.status === 'in_production' && freshnessLabel(orderLastActivity(o.id, workOrders)).tone !== 'fresh');
  const remakeOpen = orders.filter(o => o.kind === 'remake' && o.status !== 'completed');
  const attention = [
    ...blockedWOs.map(w => ({ key: w.id, tone: 'rose', text: `⛔ ${w.customerName}: ${ProductionService.getCategoryInfo(w.operationCategory).short} واقف (${w.stopReason ? STOP_REASONS[w.stopReason] : 'مستني خامة'})`, tab: 'mfg_daily' })),
    ...outsideWOs.map(w => ({ key: w.id + 'o', tone: 'orange', text: `🚚 ${w.customerName}: عند ${w.subcontract!.vendorName}، راجع ${w.subcontract!.expectedBackAt}`, tab: 'mfg_daily' })),
    ...staleOrders.map(o => ({ key: o.id + 's', tone: 'amber', text: `🕒 ${o.customerName}: محدش حدّثه ${freshnessLabel(orderLastActivity(o.id, workOrders)).label}`, tab: 'mfg_daily' })),
    ...remakeOpen.map(o => ({ key: o.id + 'r', tone: 'rose', text: `🔁 نواقص ${o.customerName} (${o.productionNumber}) لسه في الورشة`, tab: 'mfg_remake' }))
  ];

  // Station stages for Kanban overview
  const stages = [
    { id: 'cutting', title: 'عنبر التقطيع والـ CNC', cat: 'cutting_cnc', color: 'border-sky-500 bg-sky-50/50' },
    { id: 'edge', title: 'عنبر شريط الحرف (القشاط)', cat: 'edge_banding', color: 'border-indigo-500 bg-indigo-50/50' },
    { id: 'paint', title: 'الدهانات والرش الحراري', cat: 'paint_finishing', color: 'border-amber-500 bg-amber-50/50' },
    { id: 'assembly', title: 'التجميع والتركيبات', cat: 'assembly', color: 'border-emerald-500 bg-emerald-50/50' },
    { id: 'packaging', title: 'الجودة والتغليف (جاهز للشحن)', cat: 'packaging_qc', color: 'border-teal-500 bg-teal-50/50' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Quick Actions */}
      <div className="p-6 rounded-3xl bg-gradient-to-l from-slate-900 via-[#26150D] to-[#361D13] text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#C87A38]/20 border border-[#C87A38]/40 text-[#C87A38] flex items-center justify-center font-bold">
            <Factory className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#C87A38]/30 text-[#C87A38] text-[11px] font-bold border border-[#C87A38]/40">
                مجمع إدارة الورش وعنابر التشغيل
              </span>
              <span className="text-xs text-slate-300">معدل كفاءة الورش: {avgEfficiency}% OEE</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              لوحة تحكم الإنتاج والتصنيع الفعلي
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateToTab('mfg_daily')}
            className="px-4 py-2.5 bg-[#C87A38] hover:bg-[#DB8D48] text-white rounded-xl text-xs font-black shadow-lg shadow-[#C87A38]/30 transition-all flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4" />
            <span>يومية الإنتاج</span>
          </button>
          <button
            onClick={() => onNavigateToTab('mfg_work_orders')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5"
          >
            <Cpu className="w-4 h-4 text-[#C87A38]" />
            <span>مراكز العمل والماكينات</span>
          </button>
        </div>
      </div>

      {attention.length > 0 && (
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-black text-slate-900 block mb-2">محتاج انتباهك النهارده ({attention.length})</span>
          <div className="flex flex-wrap gap-2">
            {attention.map(a => (
              <button key={a.key} onClick={() => onNavigateToTab(a.tab)} className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border ${a.tone === 'rose' ? 'bg-rose-50 text-rose-800 border-rose-200' : a.tone === 'orange' ? 'bg-orange-50 text-orange-800 border-orange-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                {a.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Factory className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {activeWOs.length} مرحلة نشطة
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3 font-mono">{activeOrdersCount}</div>
          <p className="text-xs font-bold text-slate-600 mt-0.5">أوامر جارية بالورشة (WIP)</p>
          <span className="text-[11px] text-slate-400 block mt-1">من إجمالي {orders.length} مشاريع معتمدة</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              جاهز للتركيبات
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3 font-mono">{completedOrdersCount}</div>
          <p className="text-xs font-bold text-slate-600 mt-0.5">أوامر مكتملة ومغلفة</p>
          <span className="text-[11px] text-slate-400 block mt-1">تم فحص الجودة وتكوين الطرود</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              {scrapClaims.length} بلاغات تلف
            </span>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-3 font-mono">{totalScrapCost.toLocaleString()} ج.م</div>
          <p className="text-xs font-bold text-slate-600 mt-0.5">تكلفة الهدر والتوالف الفعلية</p>
          <span className="text-[11px] text-slate-400 block mt-1">تم صرف بدائل فورية من المخزن</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              كفاءة ممتازة
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3 font-mono">{avgEfficiency}%</div>
          <p className="text-xs font-bold text-slate-600 mt-0.5">معدل كفاءة تشغيل الماكينات (OEE)</p>
          <span className="text-[11px] text-slate-400 block mt-1">عبر 6 مراكز تشغيل رئيسية</span>
        </div>
      </div>

      {/* Live Workflow Kanban by Work Center */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-black text-slate-900">متابعة مسار المشاريع عبر العنابر (Live Workflow)</h3>
            <p className="text-xs text-slate-500">حركة المطابخ والأثاث بين ماكينات التقطيع، الشريط، الدهانات، والتجميع</p>
          </div>
          <button
            onClick={() => onNavigateToTab('mfg_orders')}
            className="text-xs font-bold text-[#C87A38] hover:underline flex items-center gap-1"
          >
            <span>عرض جدول الأوامر</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {stages.map((stage) => {
            const matchingWOs = workOrders.filter(w => w.operationCategory === stage.cat && (w.status === 'in_progress' || w.status === 'ready'));
            return (
              <div key={stage.id} className={`p-4 rounded-2xl border-t-4 ${stage.color} space-y-3`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-900">{stage.title}</span>
                  <span className="w-5 h-5 rounded-full bg-white font-mono text-[11px] font-black text-slate-700 flex items-center justify-center border border-slate-200 shadow-sm">
                    {matchingWOs.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {matchingWOs.length > 0 ? (
                    matchingWOs.map(wo => {
                      const parentOrder = orders.find(o => o.id === wo.manufacturingOrderId);
                      return (
                        <div
                          key={wo.id}
                          onClick={() => parentOrder && onSelectOrder(parentOrder)}
                          className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-sm hover:border-[#C87A38] cursor-pointer transition-all space-y-1.5"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-mono font-bold text-[#C87A38] bg-amber-50 px-1.5 py-0.5 rounded">
                              {wo.manufacturingOrderNumber}
                            </span>
                            <span className={`w-2 h-2 rounded-full ${wo.status === 'in_progress' ? 'bg-blue-600 animate-pulse' : 'bg-amber-500'}`} />
                          </div>
                          <h5 className="font-bold text-xs text-slate-900 truncate">
                            {wo.customerName}
                          </h5>
                          <p className="text-[10px] text-slate-500 truncate">
                            {wo.operationName}
                          </p>
                          <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                            <span>الفني: {wo.assignedTechnicians[0]?.split(' ')[1] || 'فني'}</span>
                            <span className="font-mono font-bold text-slate-700">{wo.progressPercentage}%</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-[11px] bg-white/50 rounded-xl border border-dashed border-slate-200">
                      لا يوجد تشغيل حالياً
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Work Centers Capacity & Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900">حالة وجاهزية مراكز التشغيل والماكينات</h3>
              <p className="text-xs text-slate-500">الطاقة الإنتاجية والاستيعاب اليومي لكل عنبر</p>
            </div>
            <button
              onClick={() => onNavigateToTab('mfg_work_orders')}
              className="text-xs font-bold text-[#C87A38] hover:underline"
            >
              إدارة المحطات
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {workCenters.map(wc => {
              const statusColor = wc.status === 'busy' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
              return (
                <div key={wc.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 hover:bg-slate-50 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500">{wc.code}</span>
                      <h4 className="font-black text-xs text-slate-900 mt-0.5">{wc.name}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}>
                      {wc.status === 'busy' ? 'مشغولة الآن' : 'متاحة للتشغيل'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                    <span>المشرف: <strong className="text-slate-800">{wc.supervisorName.split(' ')[0]} {wc.supervisorName.split(' ')[1]}</strong></span>
                    <span className="font-mono font-bold text-emerald-700">{wc.efficiencyRate}% OEE</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Integration Hub: Financial & Inventory touchpoints */}
        <div className="p-6 bg-gradient-to-b from-[#361D13] to-[#26150D] text-white rounded-3xl shadow-md space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C87A38]" />
            <h3 className="text-sm font-black text-white">الترابط الآلي مع باقي النظام</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            موديول الورش يغذي المالية والمخازن والتركيبات لحظياً بدون أي تدخل يدوي:
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-start gap-2.5">
              <span className="text-[#C87A38] font-bold text-sm">✓</span>
              <div>
                <strong className="text-white block">حسابات التكلفة (Job Costing):</strong>
                <span className="text-slate-300 text-[11px]">تحويل خامات WIP إلى بضاعة تامة وتوليد القيود المحاسبية.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-start gap-2.5">
              <span className="text-[#C87A38] font-bold text-sm">✓</span>
              <div>
                <strong className="text-white block">صرف الهدر وتدوير الفضلات:</strong>
                <span className="text-slate-300 text-[11px]">أذونات صرف تعويضية (GIN) وإرجاع فضلات الخشب للمخزن.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-start gap-2.5">
              <span className="text-[#C87A38] font-bold text-sm">✓</span>
              <div>
                <strong className="text-white block">تنسيق التركيبات بالموقع:</strong>
                <span className="text-slate-300 text-[11px]">إرسال أرقام الطرود وملصقات الباركود لمهندس التركيب.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
