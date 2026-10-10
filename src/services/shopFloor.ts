// ============================================================================
// Shop-floor rules shared by every way of reporting work: the station tablet,
// the section supervisor's phone, and the production manager's end-of-day
// board. One state machine, so the numbers agree whoever typed them.
// ============================================================================

import type { ProductionOrder } from '../types/erp';
import type {
  CaptureSource,
  ShopWorker,
  StopReason,
  SubcontractInfo,
  WorkCenter,
  WorkOrder,
  WorkOrderLogEntry,
  ManufacturingPackageItem
} from '../types/production';

export const STOP_REASONS: Record<StopReason, string> = {
  machine_breakdown: 'عطل في الماكينة',
  material_missing: 'مستني خامة / إكسسوار',
  waiting_drawing: 'مستني رسمة أو قرار من المكتب الفني',
  waiting_previous: 'مستني المحطة اللي قبلها',
  no_workers: 'مفيش عمالة كفاية (غياب)',
  customer_hold: 'العميل طلب يوقف / بيعدّل',
  other: 'سبب تاني'
};

export const CAPTURE_SOURCES: Record<CaptureSource, string> = {
  kiosk: 'تابلت المحطة',
  supervisor: 'موبايل المشرف',
  manager: 'مدير الإنتاج (تسجيل لاحق)'
};

export type CaptureMode = CaptureSource;

export const CAPTURE_MODES: Array<{ id: CaptureMode; title: string; who: string; how: string; tradeoff: string }> = [
  {
    id: 'manager',
    title: 'مدير الإنتاج بس',
    who: 'مفيش تابلت ولا موبايلات. شخص واحد بيفتح النظام',
    how: 'الصبح بيطبع "ورقة شغل اليوم" لكل عنبر، وآخر اليوم بيسجّل اللي اتعمل من الورق على لوحة اليومية',
    tradeoff: 'أرخص وأسهل بداية. البيانات بتتأخر لآخر اليوم، والوقت تقريبي'
  },
  {
    id: 'supervisor',
    title: 'مشرف لكل عنبر بموبايله',
    who: 'كل مشرف عنبر معاه موبايل عادي بإنترنت',
    how: 'المشرف بيفتح شاشة عنبره بس ويدوس "بدأ / خلص / وقف" لكل مطبخ',
    tradeoff: 'البيانات لحظية تقريباً من غير ما تشتري أجهزة. محتاج مشرف ملتزم'
  },
  {
    id: 'kiosk',
    title: 'تابلت عند كل محطة',
    who: 'تابلت ثابت عند كل ماكينة',
    how: 'العامل نفسه بيمسح الكارت ويدوس "ابدأ" و"خلّصت"',
    tradeoff: 'أدق وقت وأدق تكلفة. محتاج أجهزة وتدريب'
  }
];

export const nowStamp = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const parseStamp = (s?: string) => (s ? new Date(s.replace(' ', 'T')) : undefined);

const SHIFT_START = 8;
const SHIFT_END = 17;
const SHIFT_MINUTES = (SHIFT_END - SHIFT_START) * 60;

/** Minutes of working shift between two stamps, so a job left overnight isn't billed for the night. */
export function workingMinutesBetween(from: string, to: string): number {
  const a = parseStamp(from);
  const b = parseStamp(to);
  if (!a || !b || isNaN(a.getTime()) || isNaN(b.getTime()) || b <= a) return 0;
  let total = 0;
  const day = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  while (day <= b) {
    const shiftStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), SHIFT_START);
    const shiftEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), SHIFT_END);
    const s = Math.max(shiftStart.getTime(), a.getTime());
    const e = Math.min(shiftEnd.getTime(), b.getTime());
    if (e > s) total += (e - s) / 60000;
    day.setDate(day.getDate() + 1);
  }
  return Math.round(total);
}

// ----------------------------------------------------------------------------
// Routing order
// ----------------------------------------------------------------------------

export function siblingsOf(wo: WorkOrder, all: WorkOrder[]): WorkOrder[] {
  return all.filter(w => w.manufacturingOrderId === wo.manufacturingOrderId).sort((x, y) => x.sequenceOrder - y.sequenceOrder);
}

export function predecessorsOf(wo: WorkOrder, siblings: WorkOrder[]): WorkOrder[] {
  if (wo.predecessorIds) return siblings.filter(s => wo.predecessorIds!.includes(s.id));
  const prev = siblings.filter(s => s.sequenceOrder < wo.sequenceOrder).pop();
  return prev ? [prev] : [];
}

/** Pending stations whose predecessors are all done become ready. */
export function releaseReadyStations(all: WorkOrder[], moId: string): { next: WorkOrder[]; released: WorkOrder[] } {
  const siblings = all.filter(w => w.manufacturingOrderId === moId);
  const released: WorkOrder[] = [];
  const next = all.map(w => {
    if (w.manufacturingOrderId !== moId || w.status !== 'pending') return w;
    const preds = predecessorsOf(w, siblings);
    if (preds.length > 0 && preds.every(p => p.status === 'completed')) {
      const r = { ...w, status: 'ready' as const };
      released.push(r);
      return r;
    }
    return w;
  });
  return { next, released };
}

// ----------------------------------------------------------------------------
// Updating a station
// ----------------------------------------------------------------------------

export type WorkOrderAction = WorkOrderLogEntry['action'];

export interface WorkOrderUpdate {
  action: WorkOrderAction;
  source: CaptureSource;
  recordedBy: string;
  /** When it happened on the floor; defaults to now. Lets the manager record yesterday's work. */
  at?: string;
  /** Total pieces finished so far (absolute), for partial progress. */
  partsDone?: number;
  crew?: string[];
  note?: string;
  stopReason?: StopReason;
  subcontract?: SubcontractInfo;
  rejectedQty?: number;
}

export interface WorkOrderUpdateResult {
  ok: boolean;
  message: string;
  tone: 'success' | 'info' | 'warning' | 'error';
  next?: WorkOrder[];
  updated?: WorkOrder;
  released?: WorkOrder[];
  /** The first station of an order started, so materials have to be issued. */
  startsOrder?: boolean;
  /** Every station of the order is now done. */
  orderStationsDone?: boolean;
}

const fail = (message: string): WorkOrderUpdateResult => ({ ok: false, message, tone: 'error' });

/**
 * Applies one shop-floor event. The tablet is strict (it follows the routing);
 * the manager and supervisors may overlap stations, because in a real shop the
 * edge bander starts on the first parts while the saw is still cutting.
 */
export function applyWorkOrderUpdate(all: WorkOrder[], woId: string, u: WorkOrderUpdate, mo?: ProductionOrder): WorkOrderUpdateResult {
  const wo = all.find(w => w.id === woId);
  if (!wo) return fail('أمر الشغل غير موجود');
  const siblings = siblingsOf(wo, all);
  const preds = predecessorsOf(wo, siblings);
  const recordedAt = nowStamp();
  const at = u.at || recordedAt;
  const strict = u.source === 'kiosk';
  // Work done by an outside shop is not credited to anyone on our payroll
  const outside = u.action === 'sent_out' || u.action === 'received_back' || !!wo.subcontract;
  const crew = outside ? [] : u.crew && u.crew.length ? u.crew : wo.assignedTechnicians;

  if (wo.status === 'completed' && u.action !== 'progress') return fail(`المحطة "${wo.workCenterName}" خلصت بالفعل`);
  if (u.at && u.at > recordedAt) return fail('مينفعش تسجل حاجة لسه محصلتش (التاريخ في المستقبل)');
  if (u.at && wo.startedAt && u.action !== 'start' && u.at < wo.startedAt) return fail('التاريخ ده قبل بداية المحطة');

  let patch: Partial<WorkOrder> = {};
  let message = '';
  let tone: WorkOrderUpdateResult['tone'] = 'success';
  let qtyDelta: number | undefined;
  let startsOrder = false;

  switch (u.action) {
    case 'start':
    case 'resume':
    case 'sent_out': {
      if (wo.status === 'in_progress') return fail('المحطة شغالة بالفعل');
      if (wo.status === 'blocked' && wo.stopReason === 'material_missing' && mo?.materials.some(m => m.status === 'shortage')) {
        return fail('المحطة واقفة على خامة لسه موصلتش المخزن');
      }
      if (wo.status === 'pending') {
        const notStarted = preds.filter(p => p.status !== 'completed' && !(p.status === 'in_progress' && p.partsCompletedCount > 0));
        if (strict && preds.some(p => p.status !== 'completed')) {
          return fail(`لازم "${preds.map(p => p.workCenterName).join('، ')}" تخلص الأول. لو هتشتغلوا بالتوازي، المشرف أو المدير يقدر يبدأها`);
        }
        if (notStarted.length > 0) {
          return fail(`مينفعش تبدأ قبل ما "${notStarted.map(p => p.workCenterName).join('، ')}" تطلّع أول قطع. سجّل كمية منجزة عليها الأول`);
        }
        tone = 'info';
        message = '↔️ بدء متداخل: المحطة بدأت على أول القطع قبل ما اللي قبلها تخلص';
      }
      startsOrder = !!mo && mo.status === 'pending';
      patch = {
        status: 'in_progress',
        startedAt: wo.startedAt || at,
        stopReason: undefined,
        progressPercentage: Math.max(wo.progressPercentage, 5),
        assignedTechnicians: crew
      };
      if (u.action === 'sent_out') {
        if (!u.subcontract) return fail('اختار الورشة الخارجية والتكلفة المتفق عليها');
        patch.subcontract = { ...u.subcontract, sentAt: at };
        message = `🚚 ${wo.operationName} اتبعتت لـ "${u.subcontract.vendorName}" - مرجعها ${u.subcontract.expectedBackAt}`;
        tone = 'info';
      } else if (!message) {
        message = u.action === 'resume' ? `▶️ رجع التشغيل على ${wo.workCenterName}` : `⚡ بدأ التشغيل على ${wo.workCenterName}`;
        tone = 'info';
      }
      break;
    }
    case 'progress': {
      if (wo.status !== 'in_progress' && wo.status !== 'paused') return fail('سجّل بداية المحطة الأول');
      const total = wo.partsToProcessCount || 1;
      const done = Math.max(wo.partsCompletedCount, Math.min(total, u.partsDone ?? wo.partsCompletedCount));
      qtyDelta = done - wo.partsCompletedCount;
      if (done >= total) return applyWorkOrderUpdate(all, woId, { ...u, action: 'complete' }, mo);
      patch = { partsCompletedCount: done, progressPercentage: Math.max(5, Math.round((done / total) * 100)), assignedTechnicians: crew };
      message = `📈 ${wo.workCenterName}: ${done} من ${total} خلصوا`;
      tone = 'info';
      break;
    }
    case 'pause':
      if (wo.status !== 'in_progress') return fail('المحطة مش شغالة');
      patch = { status: 'paused' };
      message = `⏸ توقف مؤقت على ${wo.workCenterName}`;
      tone = 'info';
      break;
    case 'stop':
      if (!u.stopReason) return fail('اختار سبب الوقف');
      patch = { status: 'blocked', stopReason: u.stopReason };
      message = `⛔ ${wo.workCenterName} واقفة: ${STOP_REASONS[u.stopReason]}`;
      tone = 'warning';
      break;
    case 'complete':
    case 'received_back': {
      if (strict && wo.status !== 'in_progress') return fail('لازم تدوس "ابدأ" الأول عشان الوقت يتحسب');
      if (wo.status === 'pending' && preds.some(p => p.status !== 'completed')) {
        return fail(`مينفعش تقفل المحطة دي و"${preds.filter(p => p.status !== 'completed').map(p => p.workCenterName).join('، ')}" لسه مخلصتش`);
      }
      if (wo.status === 'blocked') return fail('المحطة واقفة. سجّل إنها رجعت تشتغل الأول');
      if (u.action === 'received_back' && !wo.subcontract) return fail('المحطة دي مش متبعتة بره');
      const startedAt = wo.startedAt || at;
      const worked = workingMinutesBetween(startedAt, at);
      startsOrder = !!mo && mo.status === 'pending';
      qtyDelta = (wo.partsToProcessCount || 0) - wo.partsCompletedCount;
      patch = {
        status: 'completed',
        startedAt,
        completedAt: at,
        progressPercentage: 100,
        partsCompletedCount: wo.partsToProcessCount,
        // A demo click lasts seconds, and a backfill with no start time has no duration: use the plan then
        actualDurationMinutes: worked > 5 ? worked : wo.plannedDurationMinutes,
        assignedTechnicians: crew,
        stopReason: undefined
      };
      if (u.action === 'received_back' && wo.subcontract) {
        patch.subcontract = { ...wo.subcontract, receivedAt: at, rejectedQty: u.rejectedQty || 0 };
        patch.actualDurationMinutes = 0;
      }
      break;
    }
  }

  const entry: WorkOrderLogEntry = {
    id: `log-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    at,
    recordedAt,
    action: u.action,
    qtyDelta: qtyDelta && qtyDelta > 0 ? qtyDelta : undefined,
    crew: crew.length ? crew : undefined,
    source: u.source,
    recordedBy: u.recordedBy,
    note: u.note,
    stopReason: u.stopReason
  };
  const updated: WorkOrder = { ...wo, ...patch, log: [...(wo.log || []), entry] };
  let next = all.map(w => (w.id === woId ? updated : w));
  let released: WorkOrder[] = [];

  if (updated.status === 'completed') {
    const r = releaseReadyStations(next, wo.manufacturingOrderId);
    next = r.next;
    released = r.released;
    const remaining = next.filter(w => w.manufacturingOrderId === wo.manufacturingOrderId && w.status !== 'completed');
    const late = u.at && u.at.substring(0, 10) < recordedAt.substring(0, 10) ? ' (اتسجلت بتاريخ ' + u.at.substring(0, 10) + ')' : '';
    if (remaining.length === 0) {
      message = `✅ كل محطات ${wo.manufacturingOrderNumber} خلصت${late}. افتح الأمر واعتمد الانتهاء`;
    } else if (u.action === 'received_back') {
      message = `📥 استلمنا ${wo.operationName} من "${wo.subcontract?.vendorName}"${u.rejectedQty ? ` - مرفوض ${u.rejectedQty} قطعة` : ''}${released.length ? ' ← اتفتحت: ' + released.map(w => w.workCenterName).join('، ') : ''}`;
    } else {
      message = `✅ "${wo.operationName}" خلصت${late}${released.length ? ' ← اتفتحت: ' + released.map(w => w.workCenterName).join('، ') : ''}`;
    }
    tone = 'success';
    return { ok: true, message, tone, next, updated, released, startsOrder, orderStationsDone: remaining.length === 0 };
  }

  return { ok: true, message, tone, next, updated, released, startsOrder };
}

// ----------------------------------------------------------------------------
// Cost of a station
// ----------------------------------------------------------------------------

export interface StationCost {
  minutes: number;
  labor: number;
  machine: number;
  subcontract: number;
  /** How the labor was worked out, for the cost breakdown. */
  basis: string;
}

/**
 * Labor follows how each crew member is actually paid: a piece worker earns
 * his rate per piece, a day worker costs his share of the day. With no crew
 * recorded, the station's standard hourly rate is used.
 */
export function stationCost(wo: WorkOrder, wc: WorkCenter | undefined, workers: ShopWorker[], useActual = true): StationCost {
  if (wo.subcontract) {
    return { minutes: 0, labor: 0, machine: 0, subcontract: wo.subcontract.agreedCost, basis: `تشغيل خارجي لدى ${wo.subcontract.vendorName}` };
  }
  const minutes = (useActual ? wo.actualDurationMinutes : 0) || wo.plannedDurationMinutes || 60;
  const machine = (minutes / 60) * (wc?.hourlyMachineCost ?? 150);
  const crew = wo.assignedTechnicians.map(n => workers.find(w => w.name === n)).filter((w): w is ShopWorker => !!w);
  if (!useActual || crew.length === 0) {
    return { minutes, labor: (minutes / 60) * (wc?.hourlyLaborCost ?? 120), machine, subcontract: 0, basis: 'سعر الساعة القياسي للمحطة' };
  }
  const pieces = wo.partsCompletedCount || wo.partsToProcessCount;
  let labor = 0;
  const parts: string[] = [];
  crew.forEach(w => {
    if (w.payBasis === 'piece') {
      const share = (pieces * (w.pieceRate || 0)) / crew.filter(c => c.payBasis === 'piece').length;
      labor += share;
      parts.push(`${w.name.split(' ').slice(-2).join(' ')} بالقطعة`);
    } else {
      labor += (minutes / SHIFT_MINUTES) * (w.dailyWage || 0);
      parts.push(`${w.name.split(' ').slice(-2).join(' ')} ${w.payBasis === 'daily' ? 'باليومية' : 'شهري'}`);
    }
  });
  return { minutes, labor, machine, subcontract: 0, basis: parts.join(' + ') };
}

// ----------------------------------------------------------------------------
// Data freshness: the risk when only the manager types
// ----------------------------------------------------------------------------

export function lastActivityOf(wo: WorkOrder): string | undefined {
  const stamps = [wo.startedAt, wo.completedAt, ...(wo.log || []).map(l => l.recordedAt)].filter(Boolean) as string[];
  return stamps.sort().pop();
}

export function orderLastActivity(moId: string, all: WorkOrder[]): string | undefined {
  return all.filter(w => w.manufacturingOrderId === moId).map(lastActivityOf).filter(Boolean).sort().pop() as string | undefined;
}

export function hoursSince(stamp?: string): number | undefined {
  const d = parseStamp(stamp);
  if (!d || isNaN(d.getTime())) return undefined;
  return (Date.now() - d.getTime()) / 3600000;
}

export function freshnessLabel(stamp?: string): { label: string; tone: 'fresh' | 'stale' | 'old' | 'none' } {
  const h = hoursSince(stamp);
  if (h === undefined) return { label: 'لم يُسجَّل', tone: 'none' };
  if (h < 1) return { label: 'من دقايق', tone: 'fresh' };
  if (h < 24) return { label: `من ${Math.round(h)} ساعة`, tone: 'fresh' };
  const days = Math.floor(h / 24);
  return { label: days === 1 ? 'من يوم' : `من ${days} أيام`, tone: days >= 2 ? 'old' : 'stale' };
}

// ----------------------------------------------------------------------------
// Workers' week
// ----------------------------------------------------------------------------

export interface WorkerWeek {
  worker: ShopWorker;
  pieces: number;
  activeDays: number;
  earnings: number;
  jobs: string[];
}

export function startOfWeek(): string {
  // The Egyptian work week starts on Saturday
  const d = new Date();
  const back = (d.getDay() + 1) % 7;
  d.setDate(d.getDate() - back);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** What each worker produced and earned since `from`, built from the station log. */
export function workersWeek(workers: ShopWorker[], all: WorkOrder[], from: string): WorkerWeek[] {
  const rows = new Map<string, WorkerWeek>(workers.map(w => [w.name, { worker: w, pieces: 0, activeDays: 0, earnings: 0, jobs: [] }]));
  const days = new Map<string, Set<string>>();
  const credit = (names: string[], qty: number, day: string, job: string) => {
    const known = names.filter(n => rows.has(n));
    known.forEach(n => {
      const row = rows.get(n)!;
      const pieceCrew = known.filter(k => rows.get(k)!.worker.payBasis === 'piece').length || 1;
      if (row.worker.payBasis === 'piece') row.pieces += qty / pieceCrew;
      if (!row.jobs.includes(job)) row.jobs.push(job);
      if (!days.has(n)) days.set(n, new Set());
      days.get(n)!.add(day);
    });
  };

  all.forEach(wo => {
    if (wo.subcontract) return;
    const job = `${wo.customerName.split(' ').slice(-2).join(' ')} · ${wo.workCenterName.split(' ').slice(0, 2).join(' ')}`;
    if (wo.log && wo.log.length) {
      wo.log.forEach(l => {
        if (l.at.substring(0, 10) < from) return;
        credit(l.crew || wo.assignedTechnicians, l.qtyDelta || 0, l.at.substring(0, 10), job);
      });
    } else if (wo.completedAt && wo.completedAt.substring(0, 10) >= from) {
      credit(wo.assignedTechnicians, wo.partsCompletedCount, wo.completedAt.substring(0, 10), job);
    }
  });

  rows.forEach((row, name) => {
    row.activeDays = days.get(name)?.size || 0;
    row.pieces = Math.round(row.pieces);
    row.earnings = row.worker.payBasis === 'piece'
      ? Math.round(row.pieces * (row.worker.pieceRate || 0))
      : Math.round(row.activeDays * (row.worker.dailyWage || 0));
  });
  return Array.from(rows.values());
}

// ----------------------------------------------------------------------------
// End-of-day message for the owner
// ----------------------------------------------------------------------------

export function dailySummaryText(params: {
  date: string;
  orders: ProductionOrder[];
  workOrders: WorkOrder[];
  factoryName: string;
}): string {
  const { date, orders, workOrders } = params;
  const lines: string[] = [`🏭 ملخص إنتاج ${params.factoryName} - ${date}`, ''];
  const done: string[] = [];
  const progress: string[] = [];
  const station = (wo: WorkOrder) => ({ cutting_cnc: 'التقطيع', edge_banding: 'القشاط', drilling_routing: 'التخريم', paint_finishing: 'الدهان', assembly: 'التجميع', packaging_qc: 'التغليف' }[wo.operationCategory]);
  workOrders.forEach(wo => {
    const who = wo.customerName + (wo.manufacturingOrderNumber.startsWith('RMK') ? ' (نواقص)' : '');
    (wo.log || []).filter(l => l.at.startsWith(date)).forEach(l => {
      if (l.action === 'received_back') done.push(`📥 ${who}: ${station(wo)} رجع من ${wo.subcontract?.vendorName || 'بره'}`);
      else if (l.action === 'complete') done.push(`✅ ${who}: خلص ${station(wo)}`);
      else if (l.action === 'progress' && l.qtyDelta) progress.push(`📈 ${who}: ${l.qtyDelta} قطعة في ${station(wo)}`);
    });
  });
  lines.push(done.length ? 'اللي خلص النهارده:' : 'مفيش محطات خلصت النهارده.');
  lines.push(...done);
  if (progress.length) lines.push('', 'شغل ماشي:', ...progress);

  const blocked = workOrders.filter(w => w.status === 'blocked');
  if (blocked.length) {
    lines.push('', '⛔ واقف ومحتاج قرار:');
    blocked.forEach(w => lines.push(`- ${w.customerName}${w.manufacturingOrderNumber.startsWith('RMK') ? ' (نواقص)' : ''} / ${station(w)}: ${w.stopReason ? STOP_REASONS[w.stopReason] : 'مستني خامة'}`));
  }
  const out = workOrders.filter(w => w.subcontract && !w.subcontract.receivedAt && w.subcontract.sentAt);
  if (out.length) {
    lines.push('', '🚚 شغل بره المصنع:');
    out.forEach(w => lines.push(`- ${w.customerName}: عند ${w.subcontract!.vendorName}، راجع ${w.subcontract!.expectedBackAt}`));
  }
  const active = orders.filter(o => o.status === 'in_production');
  const ready = orders.filter(o => o.status === 'completed');
  lines.push('', `📊 جوه الورشة: ${active.length} أمر شغال، ${ready.length} جاهز للتركيب.`);
  return lines.join('\n');
}

// ----------------------------------------------------------------------------
// Packages: a bespoke kitchen ships flat, so every unit becomes its own box
// ----------------------------------------------------------------------------

export interface BomUnitLite {
  unitCode: string;
  unitName: string;
  quantity: number;
  partsCount: number;
  hardware: string[];
  widthMm?: number;
  heightMm?: number;
  depthMm?: number;
}

/**
 * One box per cabinet, a separate box for painted fronts (they travel wrapped in
 * foam), the plinths and fillers that installers always find missing, and one
 * sealed hardware bag.
 */
export function buildPackagesFor(mo: ProductionOrder, units: BomUnitLite[], stations: WorkOrder[]): ManufacturingPackageItem[] {
  const suffix = mo.productionNumber.split('-').pop() || mo.id;
  const boxes: Array<Omit<ManufacturingPackageItem, 'id' | 'packageCode' | 'qrCode' | 'status'>> = [];

  if (mo.kind === 'remake') {
    boxes.push({ title: 'طرد نواقص - مكتوب عليه "نواقص" باسم العميل', dimensions: 'حسب القطع', weightKg: 8, itemsContained: (mo.remake?.parts || []).map(p => `${p.partName} ${p.lengthMm}×${p.widthMm} × ${p.quantity}`), manufacturingOrderId: mo.id, kind: 'remake' });
  } else {
    const list: BomUnitLite[] = units.length ? units : Array.from({ length: Math.max(1, stations.find(s => s.operationCategory === 'packaging_qc')?.partsToProcessCount || 4) }, (_, i) => ({ unitCode: `U${i + 1}`, unitName: `وحدة ${i + 1}`, quantity: 1, partsCount: 8, hardware: [] }));
    list.forEach(u => {
      for (let i = 0; i < (u.quantity || 1); i++) {
        const dims = u.widthMm ? `${Math.round(u.widthMm / 10)} × ${Math.round((u.depthMm || 600) / 10)} × ${Math.round((u.heightMm || 720) / 10)} سم` : 'حسب الوحدة';
        boxes.push({ title: `${u.unitCode} - ${u.unitName}${u.quantity > 1 ? ` (${i + 1}/${u.quantity})` : ''}`, dimensions: dims, weightKg: Math.round(8 + u.partsCount * 2.2), itemsContained: [`${u.partsCount} قطعة هيكل مرقمة بأرقام القطع`, 'كيس مسامير التجميع متدبس على الكرتونة'], manufacturingOrderId: mo.id, kind: 'carcass' });
      }
    });
    const paint = stations.find(s => s.operationCategory === 'paint_finishing');
    if (paint) {
      boxes.push({ title: `ضلف ${paint.subcontract ? 'راجعة من ' + paint.subcontract.vendorName : 'مدهونة'} (${paint.partsToProcessCount} ضلفة) ملفوفة فوم`, dimensions: 'رصة مسطحة', weightKg: Math.round(paint.partsToProcessCount * 3.5), itemsContained: ['ضلف مرقمة بأرقام الوحدات', 'زوايا فوم', 'ورق فاصل بين كل ضلفة'], manufacturingOrderId: mo.id, kind: 'fronts' });
    }
    boxes.push({ title: 'الوزر والبرانيط والتقفيلات (الحاجات اللي بتتنسي)', dimensions: '250 × 20 × 15 سم', weightKg: 12, itemsContained: ['وزرة سفلية', 'بروفايلات تقفيل للحيطة', 'برنيطة علوية', 'جنب تجميلي'], manufacturingOrderId: mo.id, kind: 'fillers' });
    const hardware = Array.from(new Set(list.flatMap(u => u.hardware))).slice(0, 6);
    boxes.push({ title: 'شنطة الإكسسوار والمسامير (مقفولة ومختومة)', dimensions: '40 × 30 × 20 سم', weightKg: 7, itemsContained: [...(hardware.length ? hardware : ['مفصلات ومجاري حسب الـ BOM', 'مقابض', 'رجول ضبط']), 'رسمة تركيب مطبوعة'], manufacturingOrderId: mo.id, kind: 'hardware_kit' });
  }

  return boxes.map((b, i) => ({
    ...b,
    id: `pkg-${mo.id}-${i + 1}`,
    packageCode: `PKG-${suffix}-${String(i + 1).padStart(2, '0')}`,
    qrCode: `QR-${mo.productionNumber}-${i + 1}`,
    title: `طرد ${i + 1}/${boxes.length} - ${b.title}`,
    status: 'packed' as const
  }));
}
