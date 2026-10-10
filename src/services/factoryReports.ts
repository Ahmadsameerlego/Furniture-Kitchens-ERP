// ============================================================================
// Factory reports, worked out from the transactions the demo actually holds:
// contracts, production orders, station logs, scrap, remakes, packages.
// Every figure answers one of the owner's questions: am I making money, where
// is my cash, how is the factory running, where is money leaking.
// ============================================================================

import type { CustomContract, CustomProject, ProductionOrder, ProjectQuotation } from '../types/erp';
import type { ManufacturingPackageItem, ScrapClaimRecord, ShopWorker, StopReason, WorkCenter, WorkOrder } from '../types/production';
import { resolveCatalogItem } from './materialCatalog';
import { STOP_REASONS, nowStamp, stationCost, workingMinutesBetween } from './shopFloor';

/** Cost share assumed for a contract with no costed quote and no production plan yet. */
export const STANDARD_COST_RATIO = 0.6;

/** One extra truck + installer day when something is left behind. */
export const EXTRA_TRIP_COST = 1800;

const today = () => nowStamp().substring(0, 10);
const monthStart = () => `${today().substring(0, 7)}-01`;

// ----------------------------------------------------------------------------
// Project profitability and quote accuracy
// ----------------------------------------------------------------------------

export type CostBucket = 'boards' | 'hardware' | 'stone' | 'labor' | 'subcontract' | 'rework' | 'site';

/** Spent after the factory is done: hardware bought for site, the countertop, transport and fitting. */
const AFTER_FACTORY: CostBucket[] = ['hardware', 'stone', 'site'];

export const BUCKET_LABEL: Record<CostBucket, string> = {
  boards: 'ألواح وقشاط',
  hardware: 'إكسسوار ومفصلات',
  stone: 'رخام',
  labor: 'مصنعيات (عمالة + ماكينات)',
  subcontract: 'شغل بره (دهانات...)',
  rework: 'نواقص وهالك',
  site: 'نقل وتركيب'
};

export interface ProjectProfit {
  project: CustomProject;
  contract: CustomContract;
  contractValue: number;
  collected: number;
  quoted: Record<CostBucket, number>;
  actual: Record<CostBucket, number>;
  quotedTotal: number;
  actualTotal: number;
  /** Actual where it has happened, quote where it has not yet. */
  projectedTotal: number;
  quotedMargin: number;
  /** Where the "quoted" cost came from when there is no costed quotation. */
  quoteSource: 'quotation' | 'production_plan' | 'standard_ratio';
  projectedMargin: number;
  /** Production finished: the cost is final except the stone and site work. */
  isFinal: boolean;
  stage: 'not_started' | 'in_production' | 'finished';
  orders: ProductionOrder[];
}

const emptyBuckets = (): Record<CostBucket, number> => ({ boards: 0, hardware: 0, stone: 0, labor: 0, subcontract: 0, rework: 0, site: 0 });

/** Quote lines grouped like the factory spends: boards, hardware, stone, work. */
function quotedBuckets(q?: ProjectQuotation): Record<CostBucket, number> {
  const b = emptyBuckets();
  if (!q) return b;
  q.items.forEach(it => {
    const name = `${it.materialName} ${it.description || ''}`;
    if (it.itemType === 'work') {
      // Quotes often price "manufacturing + transport + fitting" as one line: split it
      const factory = /تصنيع|تقطيع|تجميع/.test(name);
      const site = /تركيب|نقل/.test(name);
      if (/دهان/.test(name) && !factory) b.subcontract += it.totalCost;
      else if (factory && site) { b.labor += it.totalCost / 2; b.site += it.totalCost / 2; }
      else if (site) b.site += it.totalCost;
      else b.labor += it.totalCost;
    }
    else if (it.itemType === 'accessory') b.hardware += it.totalCost;
    else if (/رخام|كوارتز|جرانيت/.test(name)) b.stone += it.totalCost;
    else b.boards += it.totalCost;
  });
  // A quote with no explicit work line still priced labor inside the totals
  const lines = Object.values(b).reduce((s, v) => s + v, 0);
  if (q.totalCost > lines) b.labor += q.totalCost - lines;
  return b;
}

function materialBucket(code: string): CostBucket {
  if (code.startsWith('OFFCUT-')) return 'boards';
  const cat = resolveCatalogItem(code)?.category;
  if (cat === 'hardware' || cat === 'accessory') return 'hardware';
  if (cat === 'stone') return 'stone';
  return 'boards';
}

function orderCost(mo: ProductionOrder, workOrders: WorkOrder[], workCenters: WorkCenter[], workers: ShopWorker[]): Record<CostBucket, number> {
  const b = emptyBuckets();
  mo.materials.forEach(m => {
    if (m.consumedQuantity > 0) b[materialBucket(m.materialCode)] += m.consumedQuantity * (m.actualUnitCost || m.estimatedUnitCost);
  });
  workOrders.filter(w => w.manufacturingOrderId === mo.id).forEach(w => {
    const started = w.status === 'completed' || w.status === 'in_progress' || w.status === 'paused' || !!w.subcontract?.sentAt;
    if (!started) return;
    const c = stationCost(w, workCenters.find(x => x.id === w.workCenterId), workers);
    b.labor += c.labor + c.machine;
    b.subcontract += w.subcontract?.receivedAt || w.subcontract?.sentAt ? c.subcontract : 0;
  });
  return b;
}

export function projectProfitability(input: {
  projects: CustomProject[];
  contracts: CustomContract[];
  quotations: ProjectQuotation[];
  orders: ProductionOrder[];
  workOrders: WorkOrder[];
  workCenters: WorkCenter[];
  workers: ShopWorker[];
  scrapClaims: ScrapClaimRecord[];
}): ProjectProfit[] {
  return input.contracts
    .filter(c => c.status !== 'cancelled')
    .map(contract => {
      const project = input.projects.find(p => p.id === contract.projectId);
      if (!project) return null;
      const quote = input.quotations.find(q => q.id === contract.quotationId)
        || input.quotations.filter(q => q.projectId === project.id && q.status === 'accepted').pop()
        || input.quotations.filter(q => q.projectId === project.id).pop();
      const orders = input.orders.filter(o => o.projectId === project.id);
      let quoted = quotedBuckets(quote);
      let quoteSource: ProjectProfit['quoteSource'] = 'quotation';
      if (Object.values(quoted).every(v => v === 0)) {
        // No costed quote on file: fall back to the production plan, else to a standard cost ratio
        const plan = orders.filter(o => o.kind !== 'remake');
        if (plan.length) {
          quoteSource = 'production_plan';
          quoted = emptyBuckets();
          plan.forEach(mo => {
            mo.materials.forEach(m => { quoted[materialBucket(m.materialCode)] += m.estimatedTotalCost; });
            input.workOrders.filter(w => w.manufacturingOrderId === mo.id).forEach(w => {
              const c = stationCost({ ...w, subcontract: undefined }, input.workCenters.find(x => x.id === w.workCenterId), input.workers, false);
              quoted.labor += c.labor + c.machine;
            });
          });
        } else {
          quoteSource = 'standard_ratio';
          const v = contract.totalValue * STANDARD_COST_RATIO;
          quoted = { boards: v * 0.4, hardware: v * 0.2, stone: v * 0.14, labor: v * 0.18, subcontract: 0, rework: 0, site: v * 0.08 };
        }
      }
      const actual = emptyBuckets();
      orders.forEach(mo => {
        const c = orderCost(mo, input.workOrders, input.workCenters, input.workers);
        if (mo.kind === 'remake') {
          // Parts made twice cost the factory unless the customer pays for the change
          if (mo.remake?.chargeTo !== 'customer') actual.rework += Object.values(c).reduce((s, v) => s + v, 0);
        } else {
          (Object.keys(c) as CostBucket[]).forEach(k => { actual[k] += c[k]; });
        }
      });
      actual.rework += input.scrapClaims.filter(s => orders.some(o => o.id === s.manufacturingOrderId)).reduce((s, x) => s + x.estimatedCost, 0);

      const mains = orders.filter(o => o.kind !== 'remake');
      const stage: ProjectProfit['stage'] = mains.length === 0 || mains.every(o => o.status === 'pending')
        ? 'not_started'
        : mains.every(o => o.status === 'completed') ? 'finished' : 'in_production';
      const projected = (Object.keys(quoted) as CostBucket[]).reduce((s, k) => {
        if (k === 'rework') return s + actual.rework;
        // Once production is over, a missing bucket is real (except stone, fitted on site later)
        // Once production is over, factory buckets are final; the rest still comes after the factory
        if (stage === 'finished' && !AFTER_FACTORY.includes(k)) return s + actual[k];
        return s + Math.max(actual[k], quoted[k]);
      }, 0);
      const actualTotal = Object.values(actual).reduce((s, v) => s + v, 0);
      const quotedTotal = Object.values(quoted).reduce((s, v) => s + v, 0);
      const value = contract.totalValue;
      return {
        project,
        contract,
        contractValue: value,
        collected: contract.milestones.reduce((s, m) => s + (m.paidAmount ?? (m.status === 'paid' || m.status === 'verified_in_finance' ? m.amount : 0)), 0),
        quoted,
        actual,
        quotedTotal,
        actualTotal: Math.round(actualTotal),
        projectedTotal: Math.round(projected),
        quotedMargin: value ? (value - quotedTotal) / value : 0,
        quoteSource,
        projectedMargin: value ? (value - projected) / value : 0,
        isFinal: stage === 'finished',
        stage,
        orders
      };
    })
    .filter((x): x is ProjectProfit => !!x);
}

export interface QuoteAccuracyRow {
  bucket: CostBucket;
  quoted: number;
  actual: number;
  variancePct: number;
}

/** Quoted vs actual, per cost bucket, over projects whose production is finished. */
export function quoteAccuracy(rows: ProjectProfit[]): QuoteAccuracyRow[] {
  const done = rows.filter(r => r.isFinal);
  return (['boards', 'labor', 'subcontract', 'rework'] as CostBucket[]).map(bucket => {
    const quoted = done.reduce((s, r) => s + r.quoted[bucket], 0);
    const actual = done.reduce((s, r) => s + r.actual[bucket], 0);
    return { bucket, quoted, actual, variancePct: quoted ? (actual - quoted) / quoted : actual ? 1 : 0 };
  });
}

// ----------------------------------------------------------------------------
// Where money leaks
// ----------------------------------------------------------------------------

export interface Leak {
  id: string;
  title: string;
  amount: number;
  count: number;
  detail: string;
  /** Measured from records, or estimated from a standard cost. */
  basis: 'measured' | 'estimated' | 'closed';
  fix: string;
  tab: string;
}

export function leakMap(input: {
  orders: ProductionOrder[];
  workOrders: WorkOrder[];
  workCenters: WorkCenter[];
  workers: ShopWorker[];
  scrapClaims: ScrapClaimRecord[];
  packages: ManufacturingPackageItem[];
  from?: string;
}): Leak[] {
  const from = input.from || monthStart();
  const inPeriod = (d?: string) => !!d && d.substring(0, 10) >= from;

  const scrap = input.scrapClaims.filter(s => inPeriod(s.reportedAt));
  const remakes = input.orders.filter(o => o.kind === 'remake' && inPeriod(o.createdDate));
  const remakeCost = (mo: ProductionOrder) => {
    const c = orderCost(mo, input.workOrders, input.workCenters, input.workers);
    return Object.values(c).reduce((s, v) => s + v, 0);
  };
  const factoryRemakes = remakes.filter(o => o.remake?.chargeTo !== 'customer' && o.remake?.reason !== 'missing_part');
  const missing = remakes.filter(o => o.remake?.reason === 'missing_part' || o.remake?.source === 'site_installation');
  const customerChanges = remakes.filter(o => o.remake?.chargeTo === 'customer');

  // Every order that left with boxes behind needs a second trip
  const heldOrders = new Set(input.packages.filter(p => p.heldBackReason).map(p => p.manufacturingOrderId));

  // Waiting: stop → resume pairs in the station log, plus stations still stopped now
  let waitHours = 0;
  let waitCost = 0;
  let stops = 0;
  input.workOrders.forEach(wo => {
    const wc = input.workCenters.find(w => w.id === wo.workCenterId);
    const rate = wc?.hourlyLaborCost ?? 120;
    let openStop: string | undefined;
    (wo.log || []).forEach(l => {
      if (l.action === 'stop') { openStop = l.at; stops += 1; }
      if ((l.action === 'resume' || l.action === 'start' || l.action === 'complete') && openStop) {
        const h = workingMinutesBetween(openStop, l.at) / 60;
        if (inPeriod(l.at)) { waitHours += h; waitCost += h * rate; }
        openStop = undefined;
      }
    });
    const stillStopped = wo.status === 'blocked' ? openStop || wo.scheduledStartDate : undefined;
    if (stillStopped) {
      if (!openStop) stops += 1;
      const startAt = stillStopped < from ? `${from} 08:00` : stillStopped;
      const h = workingMinutesBetween(startAt, nowStamp()) / 60;
      waitHours += h;
      waitCost += h * rate;
    }
  });

  const outside = input.workOrders.filter(w => w.subcontract?.sentAt && inPeriod(w.subcontract.sentAt));
  const rejected = outside.reduce((s, w) => s + (w.subcontract?.rejectedQty || 0), 0);
  const rejectedCost = outside.reduce((s, w) => s + (w.subcontract?.rejectedQty || 0) * (w.subcontract!.agreedCost / Math.max(1, w.partsToProcessCount)), 0);
  const lateOutside = outside.filter(w => (w.subcontract?.receivedAt || nowStamp()).substring(0, 10) > w.subcontract!.expectedBackAt);

  const overuse = input.orders.filter(o => o.kind !== 'remake' && inPeriod(o.startDate) && o.materialVariance > 0);

  return [
    {
      id: 'scrap', title: 'الهالك', amount: Math.round(scrap.reduce((s, x) => s + x.estimatedCost, 0)), count: scrap.length,
      detail: `${scrap.length} بلاغ تلف واتصرف لهم بديل من المخزن`, basis: 'measured',
      fix: 'شوف الهالك حسب المحطة والسبب: لو عطل ماكينة يبقى صيانة، ولو غلط تشغيل يبقى تدريب', tab: 'mfg_scrap'
    },
    {
      id: 'remake', title: 'إعادة التصنيع', amount: Math.round(factoryRemakes.reduce((s, o) => s + remakeCost(o), 0)), count: factoryRemakes.length,
      detail: `${factoryRemakes.length} أمر نواقص على حساب المصنع أو المورد أو النقل`, basis: 'measured',
      fix: 'أكتر سبب بيتكرر هو اللي يتصلح الأول (تغليف أحسن، أو مراجعة المقاسات قبل الإفراج)', tab: 'mfg_remake'
    },
    {
      id: 'trips', title: 'النواقص في الموقع (رحلات زيادة)', amount: (heldOrders.size + missing.length) * EXTRA_TRIP_COST, count: heldOrders.size + missing.length,
      detail: `${heldOrders.size} عربية خرجت ناقصة + ${missing.length} نواقص اتكشفت في الموقع، كل رحلة ≈ ${EXTRA_TRIP_COST.toLocaleString()} ج.م`, basis: 'estimated',
      fix: 'التحميل بالطرد والعربية مبتخرجش ناقصة من غير سبب', tab: 'mfg_job_cards'
    },
    {
      id: 'waiting', title: 'الانتظار (محطات واقفة)', amount: Math.round(waitCost), count: stops,
      detail: `${Math.round(waitHours)} ساعة وقوف × أجر ساعة المحطة`, basis: 'estimated',
      fix: 'أسباب الوقف في تقرير أداء الورشة: لو الخامة هي السبب، المشكلة في المشتريات مش الورشة', tab: 'mfg_daily'
    },
    {
      id: 'outside', title: 'الشغل اللي بره', amount: Math.round(rejectedCost), count: lateOutside.length + (rejected ? 1 : 0),
      detail: `${rejected} قطعة مرفوضة، و${lateOutside.length} شغلانة رجعت متأخرة`, basis: 'measured',
      fix: 'قارن الورش الخارجية ببعض: أسرع واحدة وأقل رفض', tab: 'mfg_daily'
    },
    {
      id: 'overuse', title: 'خامات زيادة عن المقايسة', amount: Math.round(overuse.reduce((s, o) => s + o.materialVariance, 0)), count: overuse.length,
      detail: `${overuse.length} أمر صرف أكتر من المقدّر`, basis: 'measured',
      fix: 'النيستينج المعتمد بيحدد عدد الألواح بالظبط قبل الصرف', tab: 'mfg_orders'
    },
    {
      id: 'customer', title: 'تعديلات العميل بعد التقطيع', amount: Math.round(customerChanges.reduce((s, o) => s + remakeCost(o), 0)), count: customerChanges.length,
      detail: 'على حساب العميل: لازم تتحصل بأمر تغيير', basis: 'measured',
      fix: 'كل تعديل بعد الإفراج يعدي على أمر تغيير بالسعر', tab: 'mfg_remake'
    },
    {
      id: 'wages', title: 'حساب الصنايعية بالورق', amount: 0, count: 0,
      detail: 'الكشف بقى طالع من يومية الإنتاج، مفيش ورقة بخط الإيد', basis: 'closed',
      fix: 'اتقفل', tab: 'mfg_workforce'
    }
  ];
}

// ----------------------------------------------------------------------------
// Workshop performance
// ----------------------------------------------------------------------------

export interface StationLoad {
  wc: WorkCenter;
  queuedMinutes: number;
  daysOfWork: number;
  inProgress: number;
  waiting: number;
}

export function stationLoad(workCenters: WorkCenter[], workOrders: WorkOrder[], liveOrderIds: Set<string>): StationLoad[] {
  return workCenters.map(wc => {
    const open = workOrders.filter(w => w.workCenterId === wc.id && w.status !== 'completed' && !w.subcontract?.sentAt && liveOrderIds.has(w.manufacturingOrderId));
    const queued = open.reduce((s, w) => s + w.plannedDurationMinutes * (1 - w.progressPercentage / 100), 0);
    return {
      wc,
      queuedMinutes: Math.round(queued),
      daysOfWork: queued / 60 / Math.max(1, wc.capacityHoursPerDay),
      inProgress: open.filter(w => w.status === 'in_progress').length,
      waiting: open.filter(w => w.status !== 'in_progress').length
    };
  }).sort((a, b) => b.daysOfWork - a.daysOfWork);
}

export function stopReasons(workOrders: WorkOrder[]): Array<{ reason: StopReason; label: string; count: number }> {
  const counts = new Map<StopReason, number>();
  workOrders.forEach(wo => {
    const logged = (wo.log || []).filter(l => l.action === 'stop' && l.stopReason);
    logged.forEach(l => counts.set(l.stopReason!, (counts.get(l.stopReason!) || 0) + 1));
    if (wo.status === 'blocked' && logged.length === 0) {
      const r = wo.stopReason || 'material_missing';
      counts.set(r, (counts.get(r) || 0) + 1);
    }
  });
  return Array.from(counts.entries()).map(([reason, count]) => ({ reason, label: STOP_REASONS[reason], count })).sort((a, b) => b.count - a.count);
}

export interface OnTime {
  finished: number;
  finishedOnTime: number;
  openLate: ProductionOrder[];
}

export function onTimeDelivery(orders: ProductionOrder[]): OnTime {
  const mains = orders.filter(o => o.kind !== 'remake');
  const finished = mains.filter(o => o.status === 'completed');
  return {
    finished: finished.length,
    finishedOnTime: finished.filter(o => (o.actualCompletionDate || '').substring(0, 10) <= o.expectedCompletionDate).length,
    openLate: mains.filter(o => o.status !== 'completed' && o.status !== 'cancelled' && o.expectedCompletionDate < today())
  };
}

export interface VendorRow {
  vendor: string;
  jobs: number;
  open: number;
  avgDays: number;
  late: number;
  rejected: number;
  cost: number;
}

export function subcontractorPerformance(workOrders: WorkOrder[]): VendorRow[] {
  const map = new Map<string, VendorRow & { days: number[] }>();
  workOrders.filter(w => w.subcontract?.sentAt).forEach(w => {
    const s = w.subcontract!;
    const row = map.get(s.vendorName) || { vendor: s.vendorName, jobs: 0, open: 0, avgDays: 0, late: 0, rejected: 0, cost: 0, days: [] };
    row.jobs += 1;
    row.cost += s.agreedCost;
    row.rejected += s.rejectedQty || 0;
    if (!s.receivedAt) row.open += 1;
    else row.days.push(Math.max(0, (new Date(s.receivedAt.substring(0, 10)).getTime() - new Date(s.sentAt!.substring(0, 10)).getTime()) / 86400000));
    if ((s.receivedAt || nowStamp()).substring(0, 10) > s.expectedBackAt) row.late += 1;
    map.set(s.vendorName, row);
  });
  return Array.from(map.values()).map(r => ({ ...r, avgDays: r.days.length ? r.days.reduce((a, b) => a + b, 0) / r.days.length : 0 }));
}

// ----------------------------------------------------------------------------
// How far to trust the numbers
// ----------------------------------------------------------------------------

export interface DataConfidence {
  entries: number;
  live: number;
  backfilled: number;
  bySource: Record<string, number>;
  score: number;
  note: string;
}

export function dataConfidence(workOrders: WorkOrder[], orders: ProductionOrder[]): DataConfidence {
  const logs = workOrders.flatMap(w => w.log || []);
  const lag = (l: { at: string; recordedAt: string }) => (new Date(l.recordedAt.replace(' ', 'T')).getTime() - new Date(l.at.replace(' ', 'T')).getTime()) / 3600000;
  const live = logs.filter(l => lag(l) < 2).length;
  const bySource: Record<string, number> = {};
  logs.forEach(l => { bySource[l.source] = (bySource[l.source] || 0) + 1; });
  const running = orders.filter(o => o.status === 'in_production');
  const withLogs = running.filter(o => workOrders.some(w => w.manufacturingOrderId === o.id && (w.log || []).length > 0));
  const coverage = running.length ? withLogs.length / running.length : 1;
  const liveShare = logs.length ? live / logs.length : 0;
  const score = Math.round((coverage * 0.6 + liveShare * 0.4) * 100);
  const note = logs.length === 0
    ? 'لسه مفيش تسجيل من الورشة: أرقام الوقت والمصنعية تقديرية'
    : score >= 75 ? 'التسجيل منتظم: الأرقام يعتمد عليها'
      : score >= 45 ? 'فيه تسجيل متأخر أو أوامر من غير تحديث: اعتبر الوقت تقريبي'
        : 'التسجيل ضعيف: الأرقام اتجاه عام مش رقم نهائي';
  return { entries: logs.length, live, backfilled: logs.length - live, bySource, score, note };
}

// ----------------------------------------------------------------------------
// Export
// ----------------------------------------------------------------------------

/** Excel opens UTF-8 CSV with Arabic correctly when it starts with a BOM. */
export function downloadCsv(fileName: string, header: string[], rows: Array<Array<string | number>>) {
  const esc = (v: string | number) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = '﻿' + [header, ...rows].map(r => r.map(esc).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

// ----------------------------------------------------------------------------
// Cash: bespoke contracts are paid on events, not on dates
// ----------------------------------------------------------------------------

export interface MilestoneDue {
  profit: ProjectProfit;
  title: string;
  remaining: number;
  trigger: 'signing' | 'production' | 'installation' | 'other';
  /** The event happened, so the money is due now. */
  triggered: boolean;
}

const INSTALLED: string[] = ['installed', 'completed'];

export function milestonesDue(rows: ProjectProfit[]): MilestoneDue[] {
  return rows.flatMap(r => r.contract.milestones.map(m => {
    const remaining = m.amount - (m.paidAmount ?? (m.status === 'paid' || m.status === 'verified_in_finance' ? m.amount : 0));
    // The title names the event; the description often mentions others ("before leaving for installation")
    const classify = (text: string): MilestoneDue['trigger'] => /عربون|تعاقد/.test(text) ? 'signing'
      : /شحن|خروج|تشغيل|تصنيع/.test(text) ? 'production'
        : /تركيب|استلام|التسليم/.test(text) ? 'installation' : 'other';
    const byTitle = classify(m.title);
    const trigger = byTitle !== 'other' ? byTitle : classify(m.dueDateDescription);
    const triggered = trigger === 'signing' ? r.contract.status === 'signed'
      : trigger === 'production' ? r.stage === 'finished'
        : trigger === 'installation' ? INSTALLED.includes(r.project.status) : false;
    return { profit: r, title: m.title, remaining, trigger, triggered };
  })).filter(x => x.remaining > 0);
}
