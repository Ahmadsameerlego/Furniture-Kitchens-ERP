import React, { useMemo, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ModuleId } from '../../types/erp';
import {
  BUCKET_LABEL,
  CostBucket,
  dataConfidence,
  downloadCsv,
  leakMap,
  milestonesDue,
  onTimeDelivery,
  projectProfitability,
  ProjectProfit,
  quoteAccuracy,
  stationLoad,
  stopReasons,
  subcontractorPerformance
} from '../../services/factoryReports';
import { freshnessLabel, nowStamp, orderLastActivity, CAPTURE_SOURCES } from '../../services/shopFloor';
import { ProductionService } from '../../services/productionService';
import { daysFromToday } from '../../mock/scenario';
import {
  BarChart3, Crown, TrendingUp, Droplets, Factory, AlertTriangle, MessageCircle, Download,
  ChevronDown, ChevronUp, X, Copy, ShieldCheck, Wallet, Clock, Truck, ArrowLeft
} from 'lucide-react';

type Tab = 'owner' | 'profit' | 'leaks' | 'workshop';

const egp = (n: number) => `${Math.round(n).toLocaleString('en-US')} ج.م`;
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const STAGE: Record<ProjectProfit['stage'], { label: string; cls: string }> = {
  not_started: { label: 'لسه مدخلش الورشة', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  in_production: { label: 'في الورشة', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  finished: { label: 'التصنيع خلص', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
};
const marginTone = (m: number) => (m < 0.2 ? 'text-rose-600' : m < 0.3 ? 'text-amber-600' : 'text-emerald-600');

export const FactoryReportsPage: React.FC = () => {
  const erp = useERP();
  const [tab, setTab] = useState<Tab>('owner');
  const [showPack, setShowPack] = useState(false);
  const [leakFrom, setLeakFrom] = useState<'month' | 'quarter'>('month');

  const profits = useMemo(() => projectProfitability({
    projects: erp.customProjects,
    contracts: erp.customContracts,
    quotations: erp.projectQuotations,
    orders: erp.productionOrders,
    workOrders: erp.workOrders,
    workCenters: erp.workCenters,
    workers: erp.shopWorkers,
    scrapClaims: erp.scrapClaims
  }), [erp.customProjects, erp.customContracts, erp.projectQuotations, erp.productionOrders, erp.workOrders, erp.workCenters, erp.shopWorkers, erp.scrapClaims]);

  const leaks = useMemo(() => leakMap({
    orders: erp.productionOrders,
    workOrders: erp.workOrders,
    workCenters: erp.workCenters,
    workers: erp.shopWorkers,
    scrapClaims: erp.scrapClaims,
    packages: erp.manufacturingPackages,
    from: daysFromToday(leakFrom === 'month' ? -30 : -90)
  }), [erp.productionOrders, erp.workOrders, erp.workCenters, erp.shopWorkers, erp.scrapClaims, erp.manufacturingPackages, leakFrom]);

  const confidence = useMemo(() => dataConfidence(erp.workOrders, erp.productionOrders), [erp.workOrders, erp.productionOrders]);
  const dues = useMemo(() => milestonesDue(profits), [profits]);
  const onTime = useMemo(() => onTimeDelivery(erp.productionOrders), [erp.productionOrders]);
  const go = (m: string) => erp.setActiveModule(m as ModuleId);

  const tabs: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
    { id: 'owner', label: 'صفحة صاحب المصنع', icon: Crown },
    { id: 'profit', label: 'ربحية المشاريع ودقة المقايسة', icon: TrendingUp },
    { id: 'leaks', label: 'خريطة التسريبات', icon: Droplets },
    { id: 'workshop', label: 'أداء الورشة', icon: Factory }
  ];

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-3xl bg-gradient-to-l from-slate-900 via-[#26150D] to-[#361D13] text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C87A38]/20 border border-[#C87A38]/40 text-[#C87A38] flex items-center justify-center"><BarChart3 className="w-6 h-6" /></div>
          <div>
            <span className="text-[11px] text-amber-200/80 font-bold">مركز تقارير المصنع · محسوب من الحركات الفعلية</span>
            <h1 className="text-xl font-black">4 أسئلة بيسألها صاحب المصنع، وإجابتها بالأرقام</h1>
            <p className="text-[11px] text-slate-300">بكسب ولا لأ؟ فلوسي فين؟ المصنع ماشي إزاي؟ الفلوس بتضيع فين؟ وكل رقم بيوديك على مصدره.</p>
          </div>
        </div>
        <ConfidenceChip score={confidence.score} note={confidence.note} />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-2 shadow-sm flex flex-wrap gap-1.5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${tab === t.id ? 'bg-[#361D13] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <t.icon className={`w-4 h-4 ${tab === t.id ? 'text-[#C87A38]' : 'text-slate-400'}`} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'owner' && <OwnerView profits={profits} dues={dues} leaks={leaks} onTime={onTime} go={go} setTab={setTab} onPack={() => setShowPack(true)} />}
      {tab === 'profit' && <ProfitView profits={profits} go={go} />}
      {tab === 'leaks' && <LeaksView leaks={leaks} period={leakFrom} setPeriod={setLeakFrom} go={go} />}
      {tab === 'workshop' && <WorkshopView onTime={onTime} confidence={confidence} />}

      {showPack && <WeeklyPack text={weeklyPackText(profits, dues, leaks, onTime, confidence.note)} onClose={() => setShowPack(false)} />}
    </div>
  );
};

// ----------------------------------------------------------------------------

const ConfidenceChip: React.FC<{ score: number; note: string }> = ({ score, note }) => (
  <div className={`px-4 py-3 rounded-2xl border max-w-sm ${score >= 75 ? 'bg-emerald-500/15 border-emerald-400/40' : score >= 45 ? 'bg-amber-500/15 border-amber-400/40' : 'bg-rose-500/15 border-rose-400/40'}`}>
    <span className="text-[11px] font-bold text-white/80 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> درجة الثقة في الأرقام: <span className="font-mono text-base text-white">{score}%</span></span>
    <span className="text-[11px] text-white/70 block mt-0.5">{note}</span>
  </div>
);

const Kpi: React.FC<{ label: string; value: string; sub?: string; tone?: string; onClick?: () => void }> = ({ label, value, sub, tone = 'text-slate-900', onClick }) => (
  <button onClick={onClick} disabled={!onClick} className="p-4 bg-white rounded-2xl border border-slate-200 text-right hover:border-[#C87A38] disabled:hover:border-slate-200 transition-all">
    <span className="text-[11px] font-bold text-slate-500 block">{label}</span>
    <span className={`text-xl font-black font-mono block mt-1 ${tone}`}>{value}</span>
    {sub && <span className="text-[10px] text-slate-400 block mt-0.5">{sub}</span>}
  </button>
);

const Bar: React.FC<{ value: number; max: number; cls?: string }> = ({ value, max, cls = 'bg-[#C87A38]' }) => (
  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
    <div className={`h-full rounded-full ${cls}`} style={{ width: `${max > 0 ? Math.min(100, (value / max) * 100) : 0}%` }} />
  </div>
);

// ----------------------------------------------------------------------------
// 1. Owner's one page

const OwnerView: React.FC<{
  profits: ProjectProfit[];
  dues: ReturnType<typeof milestonesDue>;
  leaks: ReturnType<typeof leakMap>;
  onTime: ReturnType<typeof onTimeDelivery>;
  go: (m: string) => void;
  setTab: (t: Tab) => void;
  onPack: () => void;
}> = ({ profits, dues, leaks, onTime, go, setTab, onPack }) => {
  const { workOrders, productionOrders } = useERP();
  const active = profits.filter(p => p.contract.status === 'signed');
  const value = active.reduce((s, p) => s + p.contractValue, 0);
  const collected = active.reduce((s, p) => s + p.collected, 0);
  const dueNow = dues.filter(d => d.triggered);
  const dueLater = dues.filter(d => !d.triggered);
  const inShop = profits.filter(p => p.stage !== 'not_started');
  const weighted = inShop.reduce((s, p) => s + p.contractValue, 0);
  const avgMargin = weighted ? inShop.reduce((s, p) => s + p.projectedMargin * p.contractValue, 0) / weighted : 0;
  const leakTotal = leaks.reduce((s, l) => s + l.amount, 0);
  const wip = productionOrders.filter(o => o.status === 'in_production').reduce((s, o) => s + o.totalActualMaterialCost, 0);

  const blocked = workOrders.filter(w => w.status === 'blocked' && productionOrders.some(o => o.id === w.manufacturingOrderId && o.status !== 'completed'));
  const outsideLate = workOrders.filter(w => w.subcontract?.sentAt && !w.subcontract.receivedAt && w.subcontract.expectedBackAt < nowStamp().substring(0, 10));
  const stale = productionOrders.filter(o => o.status === 'in_production' && freshnessLabel(orderLastActivity(o.id, workOrders)).tone !== 'fresh');
  const decisions = [
    ...inShop.filter(p => p.projectedMargin < 0.2).map(p => ({ k: p.project.id + 'm', tone: 'rose', text: `📉 ${p.project.customerName}: الهامش المتوقع ${pct(p.projectedMargin)} (المقايسة كانت ${pct(p.quotedMargin)})`, action: () => setTab('profit') })),
    ...dueNow.map(d => ({ k: d.profit.project.id + d.title, tone: 'amber', text: `💰 ${d.profit.project.customerName}: ${egp(d.remaining)} مستحقة دلوقتي (${d.title})`, action: () => go('sales_contracts') })),
    ...onTime.openLate.map(o => ({ k: o.id + 'l', tone: 'rose', text: `⏰ ${o.customerName}: متأخر عن ميعاد المصنع (${o.expectedCompletionDate})`, action: () => go('mfg_daily') })),
    ...blocked.map(w => ({ k: w.id, tone: 'rose', text: `⛔ ${w.customerName}: ${ProductionService.getCategoryInfo(w.operationCategory).short} واقف`, action: () => go('mfg_daily') })),
    ...outsideLate.map(w => ({ k: w.id + 'o', tone: 'amber', text: `🚚 ${w.customerName}: ${w.subcontract!.vendorName} متأخرة عن ${w.subcontract!.expectedBackAt}`, action: () => go('mfg_daily') })),
    ...stale.map(o => ({ k: o.id + 's', tone: 'amber', text: `🕒 ${o.customerName}: محدش حدّثه في الورشة`, action: () => go('mfg_daily') }))
  ];
  const ranked = [...inShop].sort((a, b) => b.projectedMargin - a.projectedMargin);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <Kpi label="عقود شغالة" value={egp(value)} sub={`${active.length} عقد`} onClick={() => go('sales_contracts')} />
        <Kpi label="اتحصّل منها" value={value ? pct(collected / value) : '-'} sub={egp(collected)} />
        <Kpi label="مستحق دلوقتي (الحدث حصل)" value={egp(dueNow.reduce((s, d) => s + d.remaining, 0))} sub={`${dueNow.length} دفعة`} tone="text-amber-600" />
        <Kpi label="جاي بأحداث (شحن / تركيب)" value={egp(dueLater.reduce((s, d) => s + d.remaining, 0))} sub={`${dueLater.length} دفعة`} />
        <Kpi label="متوسط الهامش المتوقع" value={inShop.length ? pct(avgMargin) : '-'} sub="للمشاريع اللي دخلت الورشة" tone={marginTone(avgMargin)} onClick={() => setTab('profit')} />
        <Kpi label="تسريبات آخر 30 يوم" value={egp(leakTotal)} sub={`وفي الورشة ${egp(wip)} خامات تحت التشغيل`} tone="text-rose-600" onClick={() => setTab('leaks')} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-black text-slate-900">قرارات محتاجاك ({decisions.length})</h3>
            <button onClick={onPack} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> باقة الخميس على الواتساب</button>
          </div>
          {decisions.length === 0 ? <p className="text-xs text-slate-400 py-6 text-center">مفيش حاجة محتاجة قرار النهارده 👌</p> : (
            <div className="space-y-1.5">
              {decisions.map(d => (
                <button key={d.k} onClick={d.action} className={`w-full px-3 py-2 rounded-xl text-[12px] font-bold border text-right flex items-center justify-between gap-2 ${d.tone === 'rose' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                  <span>{d.text}</span><ArrowLeft className="w-4 h-4 shrink-0 opacity-50" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200">
          <h3 className="text-sm font-black text-slate-900 mb-3">المشاريع بالهامش المتوقع</h3>
          {ranked.length === 0 && <p className="text-xs text-slate-400">لسه مفيش مشروع دخل الورشة.</p>}
          <div className="space-y-2.5">
            {ranked.map(p => (
              <div key={p.project.id}>
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-slate-800 truncate">{p.project.customerName}</span>
                  <span className={`font-mono font-black ${marginTone(p.projectedMargin)}`}>{pct(p.projectedMargin)}</span>
                </div>
                <Bar value={Math.max(0, p.projectedMargin)} max={0.5} cls={p.projectedMargin < 0.2 ? 'bg-rose-500' : p.projectedMargin < 0.3 ? 'bg-amber-500' : 'bg-emerald-500'} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#FBF7F2] border border-[#E9D9C7] text-xs text-slate-700 leading-relaxed">
        <strong className="text-[#361D13]">الصفحة دي معمولة للموبايل:</strong> 6 أرقام وقايمة قرارات. م. عمرو مش محتاج يفتح تقرير عشان يعرف يعمل إيه النهارده.
        والدفعات محسوبة <strong>بالأحداث</strong> مش بالتواريخ: دفعة "قبل الشحن" بتبقى مستحقة لما المصنع يخلص، مش في يوم في الكالندر.
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// 2. Profitability and quote accuracy

const ProfitView: React.FC<{ profits: ProjectProfit[]; go: (m: string) => void }> = ({ profits, go }) => {
  const [open, setOpen] = useState<string | null>(null);
  const accuracy = quoteAccuracy(profits);
  const finished = profits.filter(p => p.isFinal);
  // Advice targets buckets that were priced; costs the quote never had are called out separately
  const worst = [...accuracy].filter(a => a.quoted > 0).sort((a, b) => b.variancePct - a.variancePct)[0];
  const unplanned = accuracy.filter(a => a.quoted === 0 && a.actual > 0);
  const exportRows = () => downloadCsv('ربحية-المشاريع.csv',
    ['المشروع', 'العميل', 'المرحلة', 'قيمة العقد', 'تكلفة المقايسة', 'هامش المقايسة', 'التكلفة الفعلية لحد دلوقتي', 'التكلفة المتوقعة', 'الهامش المتوقع', 'المحصل'],
    profits.map(p => [p.project.projectNumber, p.project.customerName, STAGE[p.stage].label, p.contractValue, Math.round(p.quotedTotal), pct(p.quotedMargin), p.actualTotal, p.projectedTotal, pct(p.projectedMargin), p.collected]));

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900">ربحية كل مشروع: المقايسة قصاد الحقيقة</h3>
            <p className="text-[11px] text-slate-500">التكلفة الفعلية = خامات اتصرفت + مصنعية حسب كل صنايعي + شغل بره + نواقص وهالك. و"المتوقعة" = الفعلي اللي حصل + المقايسة للي لسه محصلش.</p>
          </div>
          <button onClick={exportRows} className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"><Download className="w-4 h-4" /> Excel</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right min-w-[900px]">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3">المشروع</th><th className="p-3">المرحلة</th><th className="p-3 text-center">قيمة العقد</th>
                <th className="p-3 text-center">هامش المقايسة</th><th className="p-3 text-center">الفعلي لحد دلوقتي</th>
                <th className="p-3 text-center">الهامش المتوقع</th><th className="p-3 text-center">الفرق</th><th className="p-3 text-center">المحصّل</th><th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profits.map(p => {
                const diff = p.projectedMargin - p.quotedMargin;
                const isOpen = open === p.project.id;
                return (
                  <React.Fragment key={p.project.id}>
                    <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => setOpen(isOpen ? null : p.project.id)}>
                      <td className="p-3"><strong className="text-slate-900">{p.project.customerName}</strong><span className="block text-[10px] text-slate-400">{p.project.projectNumber} · {p.project.projectName}</span></td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${STAGE[p.stage].cls}`}>{STAGE[p.stage].label}</span></td>
                      <td className="p-3 text-center font-mono">{egp(p.contractValue)}</td>
                      <td className="p-3 text-center font-mono">{pct(p.quotedMargin)}{p.quoteSource !== 'quotation' && <span className="block text-[9px] text-amber-600 font-sans font-bold">{p.quoteSource === 'production_plan' ? 'من خطة الإنتاج (مفيش مقايسة مفصلة)' : 'تقدير قياسي 60%'}</span>}</td>
                      <td className="p-3 text-center font-mono">{p.actualTotal ? egp(p.actualTotal) : '-'}</td>
                      <td className={`p-3 text-center font-mono font-black ${marginTone(p.projectedMargin)}`}>{pct(p.projectedMargin)}</td>
                      <td className={`p-3 text-center font-mono font-bold ${diff < -0.005 ? 'text-rose-600' : diff > 0.005 ? 'text-emerald-600' : 'text-slate-400'}`}>{diff > 0 ? '+' : ''}{(diff * 100).toFixed(1)} نقطة</td>
                      <td className="p-3 text-center font-mono">{p.contractValue ? pct(p.collected / p.contractValue) : '-'}</td>
                      <td className="p-3 text-slate-400">{isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={9} className="p-4">
                          <BucketBreakdown p={p} />
                          <div className="flex gap-2 mt-3">
                            <button onClick={() => go('mfg_orders')} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold">أوامر التصنيع بتاعته</button>
                            <button onClick={() => go('sales_contracts')} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold">العقد والدفعات</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-5 bg-white rounded-3xl border border-slate-200">
        <h3 className="text-sm font-black text-slate-900">دقة المقايسة: إحنا بنسعّر صح؟</h3>
        <p className="text-[11px] text-slate-500 mb-4">على المشاريع اللي تصنيعها خلص ({finished.length}). لو بند بيطلع أغلى من المقايسة كل مرة، يبقى السعر في الـ Configurator محتاج يتعدّل.</p>
        {finished.length === 0 ? (
          <p className="text-xs text-slate-400 bg-slate-50 rounded-2xl p-5 text-center">لسه مفيش مشروع خلص تصنيعه. اقفل مطبخ طارق من <strong>يومية الإنتاج</strong> وارجع هنا.</p>
        ) : (
          <>
            <div className="space-y-3">
              {accuracy.map(a => {
                const max = Math.max(...accuracy.map(x => Math.max(x.quoted, x.actual)), 1);
                return (
                  <div key={a.bucket} className="grid grid-cols-12 items-center gap-3 text-[11px]">
                    <span className="col-span-3 font-bold text-slate-700">{BUCKET_LABEL[a.bucket]}</span>
                    <div className="col-span-6 space-y-1">
                      <div className="flex items-center gap-2"><span className="w-12 text-slate-400">مقايسة</span><Bar value={a.quoted} max={max} cls="bg-slate-400" /></div>
                      <div className="flex items-center gap-2"><span className="w-12 text-slate-400">فعلي</span><Bar value={a.actual} max={max} cls={a.actual > a.quoted ? 'bg-rose-500' : 'bg-emerald-500'} /></div>
                    </div>
                    <span className="col-span-2 font-mono text-slate-500">{egp(a.quoted)} ← {egp(a.actual)}</span>
                    <span className={`col-span-1 font-mono font-black ${a.variancePct > 0.02 ? 'text-rose-600' : 'text-emerald-600'}`}>{a.quoted ? `${a.variancePct > 0 ? '+' : ''}${Math.round(a.variancePct * 100)}%` : 'جديد'}</span>
                  </div>
                );
              })}
            </div>
            {worst && worst.variancePct > 0.02 && (
              <p className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-[12px] text-rose-900 font-bold">
                💡 "{BUCKET_LABEL[worst.bucket]}" طالع أغلى من المقايسة بـ {Math.round(worst.variancePct * 100)}%. لو اتكرر في المشاريع الجاية، عدّل تكلفته في الـ Configurator.
              </p>
            )}
            {worst && worst.variancePct <= 0.02 && (
              <p className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-900 font-bold">💡 مفيش بند طالع أغلى من المقايسة. ممكن تبقى بتسعّر أعلى من اللازم في بنود، وده مساحة تنافس بيها في السعر.</p>
            )}
            {unplanned.length > 0 && (
              <p className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[12px] text-amber-900 font-bold">
                💡 فيه {egp(unplanned.reduce((s, a) => s + a.actual, 0))} اتصرفوا على حاجات مكانتش في المقايسة أصلاً ({unplanned.map(a => BUCKET_LABEL[a.bucket]).join(' + ')}). ضيف لها بند احتياطي في التسعير.
              </p>
            )}
            <p className="mt-2 text-[10px] text-slate-400">المقارنة على بنود المصنع بس. الإكسسوار والرخام والنقل والتركيب بيتصرفوا بعد ما المصنع يخلص، فبيدخلوا المقارنة لما المشروع يتسلّم.</p>
          </>
        )}
      </div>
    </div>
  );
};

const BucketBreakdown: React.FC<{ p: ProjectProfit }> = ({ p }) => {
  const keys = Object.keys(BUCKET_LABEL) as CostBucket[];
  const max = Math.max(...keys.map(k => Math.max(p.quoted[k], p.actual[k])), 1);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
      {keys.map(k => (
        <div key={k} className="text-[11px]">
          <div className="flex justify-between">
            <span className="font-bold text-slate-700">{BUCKET_LABEL[k]}</span>
            <span className="font-mono text-slate-500">مقايسة {egp(p.quoted[k])} · فعلي {p.actual[k] ? egp(p.actual[k]) : (k === 'stone' || k === 'site' ? 'بعد المصنع' : p.isFinal ? '0' : 'لسه')}</span>
          </div>
          <div className="space-y-0.5 mt-1">
            <Bar value={p.quoted[k]} max={max} cls="bg-slate-300" />
            <Bar value={p.actual[k]} max={max} cls={p.actual[k] > p.quoted[k] ? 'bg-rose-500' : 'bg-[#C87A38]'} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ----------------------------------------------------------------------------
// 3. Leak map

const LeaksView: React.FC<{ leaks: ReturnType<typeof leakMap>; period: 'month' | 'quarter'; setPeriod: (p: 'month' | 'quarter') => void; go: (m: string) => void }> = ({ leaks, period, setPeriod, go }) => {
  const sorted = [...leaks].sort((a, b) => b.amount - a.amount);
  const total = leaks.reduce((s, l) => s + l.amount, 0);
  const max = Math.max(...leaks.map(l => l.amount), 1);
  return (
    <div className="space-y-4">
      <div className="p-5 bg-white rounded-3xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-900">الفلوس بتضيع فين؟</h3>
          <p className="text-[11px] text-slate-500">الـ 8 تسريبات اللي في أي ورشة مطابخ، وكل واحدة بالجنيه. "مقاس" = من سجلات حقيقية، "تقديري" = عدد × تكلفة قياسية.</p>
        </div>
        <div className="flex items-center gap-2">
          {(['month', 'quarter'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border ${period === p ? 'bg-[#361D13] text-white border-[#361D13]' : 'bg-white text-slate-600 border-slate-200'}`}>{p === 'month' ? 'آخر 30 يوم' : 'آخر 90 يوم'}</button>
          ))}
          <button onClick={() => downloadCsv('خريطة-التسريبات.csv', ['التسريب', 'المبلغ', 'العدد', 'التفاصيل', 'القياس', 'الحل'], sorted.map(l => [l.title, l.amount, l.count, l.detail, l.basis === 'measured' ? 'مقاس' : l.basis === 'estimated' ? 'تقديري' : 'اتقفل', l.fix]))} className="px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-bold flex items-center gap-1"><Download className="w-3.5 h-3.5" /> Excel</button>
        </div>
      </div>

      <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-between">
        <span className="text-sm font-black text-rose-900">إجمالي التسريبات في {period === 'month' ? 'آخر 30 يوم' : 'آخر 90 يوم'}</span>
        <span className="text-2xl font-black font-mono text-rose-700">{egp(total)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {sorted.map(l => (
          <div key={l.id} className={`p-4 rounded-2xl border bg-white ${l.basis === 'closed' ? 'border-emerald-200' : 'border-slate-200'}`}>
            <div className="flex justify-between items-start gap-2">
              <div>
                <span className="text-sm font-black text-slate-900">{l.title}</span>
                <span className={`mr-2 px-1.5 py-0.5 rounded text-[9px] font-black ${l.basis === 'measured' ? 'bg-slate-100 text-slate-600' : l.basis === 'estimated' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{l.basis === 'measured' ? 'مقاس' : l.basis === 'estimated' ? 'تقديري' : '✓ اتقفل'}</span>
              </div>
              <span className={`font-mono font-black ${l.amount ? 'text-rose-600' : 'text-slate-300'}`}>{l.basis === 'closed' ? '—' : egp(l.amount)}</span>
            </div>
            {l.basis !== 'closed' && <div className="mt-2"><Bar value={l.amount} max={max} cls="bg-rose-400" /></div>}
            <p className="text-[11px] text-slate-500 mt-2">{l.detail}</p>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 gap-2">
              <p className="text-[11px] text-slate-700"><strong>يتقفل إزاي:</strong> {l.fix}</p>
              <button onClick={() => go(l.tab)} className="px-2.5 py-1 bg-slate-100 hover:bg-[#361D13] hover:text-white rounded-lg text-[10px] font-bold shrink-0">المصدر</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// 4. Workshop performance

const WorkshopView: React.FC<{ onTime: ReturnType<typeof onTimeDelivery>; confidence: ReturnType<typeof dataConfidence> }> = ({ onTime, confidence }) => {
  const { workCenters, workOrders, productionOrders } = useERP();
  const live = new Set(productionOrders.filter(o => o.status === 'pending' || o.status === 'in_production').map(o => o.id));
  const load = stationLoad(workCenters, workOrders, live);
  const reasons = stopReasons(workOrders.filter(w => live.has(w.manufacturingOrderId) || (w.log || []).some(l => l.action === 'stop')));
  const vendors = subcontractorPerformance(workOrders);
  const maxLoad = Math.max(...load.map(l => l.daysOfWork), 0.1);
  const maxReason = Math.max(...reasons.map(r => r.count), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="التسليم في ميعاد المصنع" value={onTime.finished ? pct(onTime.finishedOnTime / onTime.finished) : '-'} sub={`${onTime.finishedOnTime} من ${onTime.finished} أمر خلص`} tone="text-emerald-600" />
        <Kpi label="أوامر متأخرة دلوقتي" value={String(onTime.openLate.length)} sub={onTime.openLate.map(o => o.customerName).join('، ') || 'مفيش'} tone={onTime.openLate.length ? 'text-rose-600' : 'text-slate-900'} />
        <Kpi label="عنق الزجاجة" value={load[0] ? ProductionService.getCategoryInfo(load[0].wc.category).short : '-'} sub={load[0] ? `${load[0].daysOfWork.toFixed(1)} يوم شغل متراكم` : ''} tone="text-amber-600" />
        <Kpi label="شغل عند ورش بره" value={String(vendors.reduce((s, v) => s + v.open, 0))} sub={`${vendors.length} ورشة اتعامل معاها`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200">
          <h3 className="text-sm font-black text-slate-900 mb-1">الحمل على المحطات</h3>
          <p className="text-[11px] text-slate-500 mb-3">الشغل المتبقي ÷ ساعات المحطة في اليوم = كام يوم شغل مستنيها. أعلى واحدة هي اللي بتأخر المصنع كله.</p>
          <div className="space-y-2.5">
            {load.map((l, i) => (
              <div key={l.wc.id} className="text-[11px]">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-800">{ProductionService.getCategoryInfo(l.wc.category).short} {i === 0 && l.daysOfWork > 0 && <span className="text-amber-600">← عنق الزجاجة</span>}</span>
                  <span className="font-mono text-slate-500">{l.daysOfWork.toFixed(1)} يوم · {l.inProgress} شغال · {l.waiting} مستني</span>
                </div>
                <Bar value={l.daysOfWork} max={maxLoad} cls={i === 0 ? 'bg-amber-500' : 'bg-[#C87A38]'} />
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200">
          <h3 className="text-sm font-black text-slate-900 mb-1">ليه الشغل بيقف؟</h3>
          <p className="text-[11px] text-slate-500 mb-3">من سجل الوقف في يومية الإنتاج. لو "مستني خامة" فوق، المشكلة في المشتريات مش في الورشة.</p>
          {reasons.length === 0 ? <p className="text-xs text-slate-400">مفيش وقف متسجل.</p> : (
            <div className="space-y-2.5">
              {reasons.map(r => (
                <div key={r.reason} className="text-[11px]">
                  <div className="flex justify-between"><span className="font-bold text-slate-800">{r.label}</span><span className="font-mono text-slate-500">{r.count} مرة</span></div>
                  <Bar value={r.count} max={maxReason} cls="bg-rose-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-5 bg-white rounded-3xl border border-slate-200">
        <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2"><Truck className="w-4 h-4 text-orange-500" /> الورش الخارجية</h3>
        {vendors.length === 0 ? <p className="text-xs text-slate-400">لسه مفيش شغل اتبعت بره. سجّل "اتبعتت بره" من يومية الإنتاج.</p> : (
          <table className="w-full text-xs text-right">
            <thead className="text-slate-500 border-b border-slate-200"><tr><th className="p-2">الورشة</th><th className="p-2 text-center">شغلانات</th><th className="p-2 text-center">لسه عندها</th><th className="p-2 text-center">متوسط أيام الرجوع</th><th className="p-2 text-center">اتأخرت</th><th className="p-2 text-center">قطع مرفوضة</th><th className="p-2 text-center">التكلفة</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {vendors.map(v => (
                <tr key={v.vendor}><td className="p-2 font-bold">{v.vendor}</td><td className="p-2 text-center font-mono">{v.jobs}</td><td className="p-2 text-center font-mono">{v.open}</td><td className="p-2 text-center font-mono">{v.avgDays.toFixed(1)}</td><td className={`p-2 text-center font-mono ${v.late ? 'text-rose-600 font-bold' : ''}`}>{v.late}</td><td className={`p-2 text-center font-mono ${v.rejected ? 'text-rose-600 font-bold' : ''}`}>{v.rejected}</td><td className="p-2 text-center font-mono">{egp(v.cost)}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="p-5 bg-white rounded-3xl border border-slate-200">
        <h3 className="text-sm font-black text-slate-900 mb-1 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> الأرقام دي جاية منين؟</h3>
        <p className="text-[11px] text-slate-500 mb-3">{confidence.note}. {confidence.entries} تسجيل من الورشة: {confidence.live} اتسجل وقتها، و{confidence.backfilled} اتسجل بعدها بساعتين أو أكتر.</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(confidence.bySource).map(([s, n]) => (
            <span key={s} className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">{CAPTURE_SOURCES[s as keyof typeof CAPTURE_SOURCES] || s}: <strong className="font-mono">{n}</strong></span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// Thursday pack for the owner

function weeklyPackText(profits: ProjectProfit[], dues: ReturnType<typeof milestonesDue>, leaks: ReturnType<typeof leakMap>, onTime: ReturnType<typeof onTimeDelivery>, trust: string): string {
  const inShop = profits.filter(p => p.stage !== 'not_started');
  const dueNow = dues.filter(d => d.triggered);
  const topLeaks = [...leaks].filter(l => l.amount > 0).sort((a, b) => b.amount - a.amount).slice(0, 3);
  const low = inShop.filter(p => p.projectedMargin < 0.2);
  return [
    `📊 تقرير الأسبوع - Furniture Land - ${nowStamp().substring(0, 10)}`,
    '',
    `💼 ${profits.filter(p => p.contract.status === 'signed').length} عقد شغال بقيمة ${egp(profits.filter(p => p.contract.status === 'signed').reduce((s, p) => s + p.contractValue, 0))}`,
    `💰 مستحق دلوقتي: ${egp(dueNow.reduce((s, d) => s + d.remaining, 0))}${dueNow.length ? ' (' + dueNow.map(d => d.profit.project.customerName).join('، ') + ')' : ''}`,
    '',
    '📈 الهامش المتوقع:',
    ...inShop.map(p => `- ${p.project.customerName}: ${pct(p.projectedMargin)} (المقايسة ${pct(p.quotedMargin)})`),
    ...(low.length ? ['', `⚠️ تحت 20%: ${low.map(p => p.project.customerName).join('، ')}`] : []),
    '',
    `🏭 التسليم في الميعاد: ${onTime.finished ? pct(onTime.finishedOnTime / onTime.finished) : '-'}${onTime.openLate.length ? ` · متأخر: ${onTime.openLate.map(o => o.customerName).join('، ')}` : ''}`,
    '',
    `💧 أكبر تسريبات آخر 30 يوم: ${topLeaks.length ? topLeaks.map(l => `${l.title} ${egp(l.amount)}`).join(' · ') : 'مفيش'}`,
    '',
    `🔎 ${trust}`
  ].join('\n');
}

const WeeklyPack: React.FC<{ text: string; onClose: () => void }> = ({ text, onClose }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h3 className="font-black text-slate-900 flex items-center gap-2"><Wallet className="w-5 h-5 text-emerald-600" /> باقة الخميس لصاحب المصنع</h3>
            <p className="text-xs text-slate-500">صفحة واحدة بتلخص الأسبوع: الفلوس، والهامش، والميعاد، والتسريبات.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl" aria-label="إغلاق"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 bg-[#ECE5DD]">
          <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed bg-[#DCF8C6] text-slate-900 rounded-2xl rounded-tr-sm p-4 shadow-sm max-h-[55vh] overflow-y-auto">{text}</pre>
        </div>
        <div className="p-4 flex justify-end">
          <button onClick={async () => { try { await navigator.clipboard.writeText(text); setCopied(true); } catch { setCopied(false); } }} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5">
            <Copy className="w-4 h-4" /> {copied ? 'اتنسخ ✓' : 'انسخ الرسالة'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FactoryReportsPage;
