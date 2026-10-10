import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ProductionOrder } from '../../types/erp';
import { WorkCenter, WorkCenterCategory, WorkOrder } from '../../types/production';
import { ProductionService } from '../../services/productionService';
import {
  CAPTURE_MODES,
  CaptureMode,
  dailySummaryText,
  freshnessLabel,
  nowStamp,
  orderLastActivity,
  predecessorsOf,
  siblingsOf,
  STOP_REASONS,
  WorkOrderUpdate
} from '../../services/shopFloor';
import {
  ClipboardList,
  Printer,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Ban,
  Clock,
  Smartphone,
  Play,
  Plus,
  X,
  Copy
} from 'lucide-react';

const STATIONS: Array<{ cat: WorkCenterCategory; short: string }> = [
  { cat: 'cutting_cnc', short: 'تقطيع' },
  { cat: 'edge_banding', short: 'قشاط' },
  { cat: 'drilling_routing', short: 'تخريم' },
  { cat: 'paint_finishing', short: 'دهان' },
  { cat: 'assembly', short: 'تجميع' },
  { cat: 'packaging_qc', short: 'تغليف' }
];

interface Props {
  orders: ProductionOrder[];
  workCenters: WorkCenter[];
  workOrders: WorkOrder[];
  captureMode: CaptureMode;
  onOpenStation: (wo: WorkOrder) => void;
  onSelectOrder: (order: ProductionOrder) => void;
  onStationUpdate: (woId: string, update: Omit<WorkOrderUpdate, 'source' | 'recordedBy'> & { source?: WorkOrderUpdate['source'] }) => boolean;
  onCompleteOrder: (order: ProductionOrder) => void;
}

const cellStyle = (wo: WorkOrder) => {
  if (wo.subcontract?.sentAt && !wo.subcontract.receivedAt) return 'bg-orange-50 border-orange-300 text-orange-800';
  switch (wo.status) {
    case 'completed': return 'bg-emerald-50 border-emerald-300 text-emerald-800';
    case 'in_progress': return 'bg-blue-50 border-blue-300 text-blue-800';
    case 'paused': return 'bg-slate-100 border-slate-300 text-slate-700';
    case 'blocked': return 'bg-rose-50 border-rose-300 text-rose-800';
    case 'ready': return 'bg-amber-50 border-amber-300 text-amber-800';
    default: return 'bg-white border-slate-200 text-slate-400';
  }
};

const cellText = (wo: WorkOrder) => {
  if (wo.subcontract?.sentAt && !wo.subcontract.receivedAt) return { top: '🚚 بره', sub: `راجع ${wo.subcontract.expectedBackAt.substring(5)}` };
  switch (wo.status) {
    case 'completed': return { top: '✓ خلص', sub: wo.completedAt?.substring(5, 10) || '' };
    case 'in_progress': return { top: `${wo.progressPercentage}%`, sub: `${wo.partsCompletedCount}/${wo.partsToProcessCount}` };
    case 'paused': return { top: '⏸ متوقف', sub: '' };
    case 'blocked': return { top: '⛔ واقف', sub: wo.stopReason ? STOP_REASONS[wo.stopReason].split(' ').slice(0, 2).join(' ') : 'خامة' };
    case 'ready': return { top: 'جاهز', sub: 'يبدأ' };
    default: return { top: 'مستني', sub: '' };
  }
};

export const DailyProductionBoardView: React.FC<Props> = ({ orders, workCenters, workOrders, captureMode, onOpenStation, onSelectOrder, onStationUpdate, onCompleteOrder }) => {
  const [showSheet, setShowSheet] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [phoneStation, setPhoneStation] = useState<WorkCenterCategory>('assembly');
  const today = nowStamp().substring(0, 10);

  const active = useMemo(() => orders
    .filter(o => o.status === 'pending' || o.status === 'in_production')
    .sort((a, b) => (a.kind === 'remake' ? -1 : 0) - (b.kind === 'remake' ? -1 : 0) || a.expectedCompletionDate.localeCompare(b.expectedCompletionDate)), [orders]);

  const todayLogs = workOrders.flatMap(w => (w.log || []).filter(l => l.at.startsWith(today)).map(l => ({ l, w })));
  const doneToday = todayLogs.filter(x => x.l.action === 'complete' || x.l.action === 'received_back').length;
  const piecesToday = todayLogs.reduce((s, x) => s + (x.l.qtyDelta || 0), 0);
  const blocked = workOrders.filter(w => w.status === 'blocked' && active.some(o => o.id === w.manufacturingOrderId));
  const outside = workOrders.filter(w => w.subcontract?.sentAt && !w.subcontract.receivedAt);
  const stale = active.filter(o => o.status === 'in_production' && ['stale', 'old', 'none'].includes(freshnessLabel(orderLastActivity(o.id, workOrders)).tone));
  const mode = CAPTURE_MODES.find(m => m.id === captureMode)!;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-l from-slate-900 via-[#26150D] to-[#361D13] text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C87A38]/20 border border-[#C87A38]/40 text-[#C87A38] flex items-center justify-center"><ClipboardList className="w-6 h-6" /></div>
          <div>
            <span className="text-[11px] text-amber-200/80 font-bold">يومية الإنتاج · {today}</span>
            <h2 className="text-xl font-black">كل مطبخ واقف فين، في شاشة واحدة</h2>
            <p className="text-[11px] text-slate-300 mt-0.5">دوس على أي خانة عشان تسجل اللي حصل فيها (بأثر رجعي لو من الورق)</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowSheet(true)} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <Printer className="w-4 h-4 text-[#C87A38]" /> ورقة شغل اليوم (لكل عنبر)
          </button>
          <button onClick={() => setShowSummary(true)} className="px-4 py-2.5 bg-[#C87A38] hover:bg-[#DB8D48] rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-[#C87A38]/30">
            <MessageCircle className="w-4 h-4" /> ملخص اليوم لصاحب المصنع
          </button>
        </div>
      </div>

      {/* Today in numbers */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'محطات خلصت النهارده', value: doneToday, icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-50' },
          { label: 'قطع اتسجلت النهارده', value: piecesToday, icon: Plus, cls: 'text-blue-600 bg-blue-50' },
          { label: 'محطات واقفة', value: blocked.length, icon: Ban, cls: 'text-rose-600 bg-rose-50' },
          { label: 'شغل بره المصنع', value: outside.length, icon: Truck, cls: 'text-orange-600 bg-orange-50' },
          { label: 'محتاج تحديث', value: stale.length, icon: Clock, cls: 'text-amber-600 bg-amber-50' }
        ].map(k => (
          <div key={k.label} className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.cls}`}><k.icon className="w-5 h-5" /></div>
            <div>
              <div className="text-xl font-black font-mono text-slate-900">{k.value}</div>
              <div className="text-[11px] font-bold text-slate-500">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* The risk of manager-only reporting, said out loud */}
      {stale.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <strong className="block mb-0.5">بيانات قديمة: محدش حدّث الأوامر دي من أكتر من يوم</strong>
            {stale.map(o => (
              <span key={o.id} className="inline-block ml-3">• {o.customerName} ({freshnessLabel(orderLastActivity(o.id, workOrders)).label})</span>
            ))}
            <span className="block text-amber-700 mt-1">لما التسجيل بيبقى على مدير الإنتاج لوحده، النظام بينبهك قبل ما الرقم يبقى غلط.</span>
          </div>
        </div>
      )}

      <div className={`grid gap-4 ${captureMode === 'supervisor' ? 'xl:grid-cols-[1fr_340px]' : ''}`}>
        {/* Matrix */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right min-w-[760px]">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3 w-56">الأمر / العميل</th>
                  {STATIONS.map(s => <th key={s.cat} className="p-3 text-center">{s.short}</th>)}
                  <th className="p-3 text-center">آخر تحديث</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {active.map(o => {
                  const stations = workOrders.filter(w => w.manufacturingOrderId === o.id);
                  const allDone = stations.length > 0 && stations.every(w => w.status === 'completed');
                  const fresh = freshnessLabel(orderLastActivity(o.id, workOrders));
                  const late = o.expectedCompletionDate < today;
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/60">
                      <td className="p-3">
                        <button onClick={() => onSelectOrder(o)} className="text-right">
                          <span className="font-black text-slate-900 hover:text-[#C87A38] block">{o.customerName}</span>
                          <span className="text-[10px] font-mono text-slate-400">{o.productionNumber}</span>
                          {o.kind === 'remake' && <span className="mr-1.5 px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-black">نواقص</span>}
                          <span className={`block text-[10px] mt-0.5 ${late ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>التسليم {o.expectedCompletionDate}{late ? ' (متأخر)' : ''}</span>
                        </button>
                      </td>
                      {STATIONS.map(s => {
                        const wo = stations.find(w => w.operationCategory === s.cat);
                        if (!wo) return <td key={s.cat} className="p-2 text-center text-slate-300">—</td>;
                        const t = cellText(wo);
                        return (
                          <td key={s.cat} className="p-2 text-center">
                            <button onClick={() => onOpenStation(wo)} title={wo.operationName} className={`w-full min-h-[52px] rounded-xl border px-1.5 py-1.5 hover:shadow-md transition-all ${cellStyle(wo)}`}>
                              <span className="block text-[12px] font-black">{t.top}</span>
                              {t.sub && <span className="block text-[10px] opacity-80 font-mono">{t.sub}</span>}
                            </button>
                          </td>
                        );
                      })}
                      <td className="p-3 text-center">
                        {allDone ? (
                          <button onClick={() => onCompleteOrder(o)} className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black">اعتمد الانتهاء</button>
                        ) : (
                          <span className={`text-[11px] font-bold ${fresh.tone === 'fresh' ? 'text-emerald-600' : fresh.tone === 'stale' ? 'text-amber-600' : 'text-rose-600'}`}>{fresh.label}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {active.length === 0 && (
                  <tr><td colSpan={8} className="p-10 text-center text-slate-400">مفيش أوامر شغالة دلوقتي.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3 text-[10px] text-slate-500">
            {[['bg-amber-50 border-amber-300', 'جاهزة تبدأ'], ['bg-blue-50 border-blue-300', 'شغالة'], ['bg-emerald-50 border-emerald-300', 'خلصت'], ['bg-rose-50 border-rose-300', 'واقفة'], ['bg-orange-50 border-orange-300', 'عند ورشة بره'], ['bg-white border-slate-200', 'مستنية اللي قبلها'], ['', '— المحطة مش مطلوبة للأمر ده']].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1">{c && <span className={`w-3 h-3 rounded border ${c}`} />}{l}</span>
            ))}
          </div>
        </div>

        {/* Supervisor's phone: one section, big buttons */}
        {captureMode === 'supervisor' && (
          <SupervisorPhone station={phoneStation} setStation={setPhoneStation} orders={active} workOrders={workOrders} onStationUpdate={onStationUpdate} onOpenStation={onOpenStation} />
        )}
      </div>

      <p className="text-[11px] text-slate-500 px-1">
        <strong className="text-slate-700">الوضع الحالي: {mode.title}.</strong> {mode.who}. {captureMode === 'kiosk' ? 'التابلت بيسجل لحظة بلحظة، واللوحة دي للمتابعة والتصحيح.' : 'أي تسجيل هنا بيتعلّم باسم اللي سجّل وإمتى، عشان تفرق بين اللي حصل واللي اتكتب.'}
      </p>

      {showSheet && <DailySheetModal today={today} orders={active} workOrders={workOrders} workCenters={workCenters} onClose={() => setShowSheet(false)} />}
      {showSummary && <SummaryModal text={dailySummaryText({ date: today, orders, workOrders, factoryName: 'Furniture Land' })} onClose={() => setShowSummary(false)} />}
    </div>
  );
};

// ----------------------------------------------------------------------------

const SupervisorPhone: React.FC<{
  station: WorkCenterCategory;
  setStation: (c: WorkCenterCategory) => void;
  orders: ProductionOrder[];
  workOrders: WorkOrder[];
  onStationUpdate: Props['onStationUpdate'];
  onOpenStation: (wo: WorkOrder) => void;
}> = ({ station, setStation, orders, workOrders, onStationUpdate, onOpenStation }) => {
  const queue = workOrders.filter(w => w.operationCategory === station && w.status !== 'completed' && orders.some(o => o.id === w.manufacturingOrderId))
    .filter(w => w.status !== 'pending' || predecessorsOf(w, siblingsOf(w, workOrders)).some(p => p.status === 'in_progress' || p.status === 'completed'));
  return (
    <div className="mx-auto w-full max-w-[340px] rounded-[2.2rem] border-[10px] border-slate-900 bg-slate-100 shadow-2xl overflow-hidden self-start">
      <div className="bg-slate-900 text-white px-4 pt-1 pb-3">
        <div className="w-16 h-1.5 bg-slate-700 rounded-full mx-auto mb-2" />
        <div className="flex items-center gap-2 text-[11px] text-amber-200"><Smartphone className="w-3.5 h-3.5" /> موبايل مشرف العنبر</div>
        <select value={station} onChange={e => setStation(e.target.value as WorkCenterCategory)} className="mt-1.5 w-full bg-slate-800 text-white text-sm font-black rounded-lg px-2 py-1.5 border border-slate-700">
          {STATIONS.map(s => <option key={s.cat} value={s.cat}>عنبر {s.short}</option>)}
        </select>
      </div>
      <div className="p-3 space-y-2.5 max-h-[520px] overflow-y-auto">
        {queue.length === 0 && <p className="text-center text-xs text-slate-400 py-8">مفيش شغل على العنبر ده دلوقتي</p>}
        {queue.map(wo => (
          <div key={wo.id} className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <strong className="text-sm text-slate-900">{wo.customerName}</strong>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ProductionService.getWorkOrderStatusInfo(wo.status).bg}`}>{ProductionService.getWorkOrderStatusInfo(wo.status).label}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{wo.operationName}</p>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden"><div className="h-full bg-[#C87A38]" style={{ width: `${wo.progressPercentage}%` }} /></div>
            <div className="grid grid-cols-3 gap-1.5 mt-2.5">
              {wo.status === 'in_progress' ? (
                <>
                  <button onClick={() => onOpenStation(wo)} className="py-2.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-black border border-blue-200">+ قطع</button>
                  <button onClick={() => onStationUpdate(wo.id, { action: 'complete', source: 'supervisor' })} className="py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black">خلص</button>
                  <button onClick={() => onOpenStation(wo)} className="py-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-black border border-rose-200">وقف</button>
                </>
              ) : (
                <>
                  <button onClick={() => onStationUpdate(wo.id, { action: wo.status === 'paused' || wo.status === 'blocked' ? 'resume' : 'start', source: 'supervisor' })} className="col-span-2 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black flex items-center justify-center gap-1"><Play className="w-3.5 h-3.5" /> ابدأ</button>
                  <button onClick={() => onOpenStation(wo)} className="py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black border border-slate-200">تفاصيل</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// Morning sheet per section: the paper half of the "no tablets" workflow

const DailySheetModal: React.FC<{ today: string; orders: ProductionOrder[]; workOrders: WorkOrder[]; workCenters: WorkCenter[]; onClose: () => void }> = ({ today, orders, workOrders, workCenters, onClose }) => {
  useEffect(() => {
    document.body.classList.add('printing-sheet');
    return () => document.body.classList.remove('printing-sheet');
  }, []);
  const sheets = workCenters.map(wc => ({
    wc,
    rows: workOrders.filter(w => w.workCenterId === wc.id && w.status !== 'completed' && orders.some(o => o.id === w.manufacturingOrderId))
      .filter(w => w.status !== 'pending' || predecessorsOf(w, siblingsOf(w, workOrders)).some(p => p.status === 'in_progress' || p.status === 'completed'))
  })).filter(s => s.rows.length > 0);

  return createPortal(
    <div className="print-sheet-portal fixed inset-0 z-[60] bg-slate-950/70 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 print:rounded-none print:p-0">
        <div className="no-print flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
          <div>
            <h3 className="font-black text-slate-900">ورقة شغل اليوم - {today}</h3>
            <p className="text-xs text-slate-500">ورقة لكل عنبر. المشرف بيعلّم عليها طول اليوم، وآخر اليوم بتتسجل في يومية الإنتاج.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="px-4 py-2 bg-[#C87A38] text-white rounded-xl text-xs font-black flex items-center gap-1.5"><Printer className="w-4 h-4" /> اطبع ({sheets.length} ورقة)</button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl" aria-label="إغلاق"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="space-y-8">
          {sheets.map(({ wc, rows }) => (
            <div key={wc.id} className="sheet-page">
              <div className="flex justify-between items-end border-b-2 border-slate-900 pb-2 mb-3">
                <div>
                  <span className="text-[10px] text-slate-500">Furniture Land · ورقة شغل اليوم</span>
                  <h4 className="text-lg font-black text-slate-900">{wc.name}</h4>
                  <span className="text-[11px] text-slate-600">المشرف: {wc.supervisorName}</span>
                </div>
                <div className="text-left text-xs font-mono">{today}</div>
              </div>
              <table className="w-full text-[11px] border border-slate-400 border-collapse">
                <thead className="bg-slate-100">
                  <tr>
                    {['العميل / الأمر', 'الشغلانة', 'قطع', 'تعليمات', 'بدأ الساعة', 'خلص الساعة', 'خلص كام', 'مين اشتغل', 'وقف؟ ليه'].map(h => <th key={h} className="border border-slate-400 p-1.5 text-right">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(w => (
                    <tr key={w.id} className="h-12 align-top">
                      <td className="border border-slate-400 p-1.5"><strong>{w.customerName}</strong><br /><span className="font-mono text-[9px]">{w.workOrderNumber}</span></td>
                      <td className="border border-slate-400 p-1.5">{w.operationName}</td>
                      <td className="border border-slate-400 p-1.5 text-center font-mono">{w.partsCompletedCount}/{w.partsToProcessCount}</td>
                      <td className="border border-slate-400 p-1.5 text-[10px]">{w.specialInstructions || ''}</td>
                      <td className="border border-slate-400 p-1.5" />
                      <td className="border border-slate-400 p-1.5" />
                      <td className="border border-slate-400 p-1.5" />
                      <td className="border border-slate-400 p-1.5" />
                      <td className="border border-slate-400 p-1.5" />
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between text-[10px] text-slate-500 mt-3">
                <span>توقيع المشرف: ____________</span>
                <span>اتسجلت على السيستم بواسطة: ____________ الساعة: ______</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

const SummaryModal: React.FC<{ text: string; onClose: () => void }> = ({ text, onClose }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h3 className="font-black text-slate-900 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-emerald-600" /> ملخص اليوم</h3>
            <p className="text-xs text-slate-500">اتكتب لوحده من اللي اتسجل. انسخه وابعته على جروب الإدارة.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl" aria-label="إغلاق"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 bg-[#ECE5DD]">
          <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed bg-[#DCF8C6] text-slate-900 rounded-2xl rounded-tr-sm p-4 shadow-sm max-h-[50vh] overflow-y-auto">{text}</pre>
        </div>
        <div className="p-4 flex justify-end gap-2">
          <button onClick={copy} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5">
            <Copy className="w-4 h-4" /> {copied ? 'اتنسخ ✓' : 'انسخ الرسالة'}
          </button>
        </div>
      </div>
    </div>
  );
};
