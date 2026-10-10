import React, { useMemo, useState } from 'react';
import { X, Play, CheckCircle2, Pause, Ban, Truck, PackageCheck, TrendingUp, Clock, History, RotateCcw } from 'lucide-react';
import type { ShopWorker, StopReason, WorkCenter, WorkOrder } from '../../types/production';
import { ProductionService } from '../../services/productionService';
import {
  CAPTURE_SOURCES,
  CaptureMode,
  nowStamp,
  predecessorsOf,
  siblingsOf,
  STOP_REASONS,
  WorkOrderAction,
  WorkOrderUpdate
} from '../../services/shopFloor';
import { daysFromToday } from '../../mock/scenario';

interface Props {
  workOrder: WorkOrder;
  workOrders: WorkOrder[];
  workCenters: WorkCenter[];
  workers: ShopWorker[];
  captureMode: CaptureMode;
  onClose: () => void;
  onSubmit: (update: Omit<WorkOrderUpdate, 'source' | 'recordedBy'>) => boolean;
}

interface Choice {
  action: WorkOrderAction;
  label: string;
  hint: string;
  icon: React.ElementType;
  tone: string;
}

const toInput = (stamp: string) => stamp.replace(' ', 'T');
const fromInput = (v: string) => v.replace('T', ' ').substring(0, 16);

/** The one screen the production manager needs: what happened, when, how much, and who did it. */
export const StationUpdateModal: React.FC<Props> = ({ workOrder: wo, workOrders, workCenters, workers, captureMode, onClose, onSubmit }) => {
  const siblings = siblingsOf(wo, workOrders);
  const preds = predecessorsOf(wo, siblings);
  const wc = workCenters.find(c => c.id === wo.workCenterId);
  const isOut = !!wo.subcontract?.sentAt && !wo.subcontract.receivedAt;

  const choices: Choice[] = useMemo(() => {
    const list: Choice[] = [];
    if (isOut) {
      list.push({ action: 'received_back', label: 'رجعت من الورشة الخارجية', hint: 'استلمنا الشغل، وبتتحمل التكلفة المتفق عليها', icon: PackageCheck, tone: 'emerald' });
      return list;
    }
    if (wo.status === 'ready' || wo.status === 'pending') {
      list.push({ action: 'start', label: 'بدأت', hint: wo.status === 'pending' ? 'بدء متداخل: اللي قبلها لسه شغالة' : 'المحطة اشتغلت', icon: Play, tone: 'blue' });
      list.push({ action: 'complete', label: 'خلصت كلها', hint: 'اتعملت بالكامل (حتى لو امبارح)', icon: CheckCircle2, tone: 'emerald' });
      list.push({ action: 'sent_out', label: 'اتبعتت بره', hint: 'ورشة دهانات / زجاج / CNC خارجي', icon: Truck, tone: 'orange' });
      list.push({ action: 'stop', label: 'مش هتبدأ - في عائق', hint: 'عطل / خامة / رسمة / غياب', icon: Ban, tone: 'rose' });
    } else if (wo.status === 'in_progress') {
      list.push({ action: 'progress', label: 'خلص جزء', hint: 'سجّل عدد القطع اللي خلصت', icon: TrendingUp, tone: 'blue' });
      list.push({ action: 'complete', label: 'خلصت كلها', hint: 'تتقفل وتفتح اللي بعدها', icon: CheckCircle2, tone: 'emerald' });
      list.push({ action: 'pause', label: 'وقفت مؤقت', hint: 'بريك / ورديّة خلصت', icon: Pause, tone: 'slate' });
      list.push({ action: 'stop', label: 'وقفت لسبب', hint: 'عطل / خامة / قرار', icon: Ban, tone: 'rose' });
    } else if (wo.status === 'paused' || wo.status === 'blocked') {
      list.push({ action: 'resume', label: 'رجعت تشتغل', hint: 'العائق اتحل', icon: RotateCcw, tone: 'blue' });
      if (wo.status === 'paused') list.push({ action: 'complete', label: 'خلصت كلها', hint: 'تتقفل وتفتح اللي بعدها', icon: CheckCircle2, tone: 'emerald' });
    }
    return list;
  }, [wo.status, isOut]);

  const [action, setAction] = useState<WorkOrderAction | undefined>(choices[0]?.action);
  const [at, setAt] = useState(nowStamp());
  const sectionCrew = workers.filter(w => w.section === wo.operationCategory).map(w => w.name);
  const [crew, setCrew] = useState<string[]>(wo.assignedTechnicians.filter(n => workers.some(w => w.name === n)).length ? wo.assignedTechnicians : sectionCrew.slice(0, 2));
  const [partsDone, setPartsDone] = useState<number>(Math.min(wo.partsToProcessCount, wo.partsCompletedCount + Math.max(1, Math.round(wo.partsToProcessCount / 3))));
  const [stopReason, setStopReason] = useState<StopReason>('machine_breakdown');
  const [vendor, setVendor] = useState(wc?.commonSubcontractors?.[0] || '');
  const [cost, setCost] = useState<number>(Math.round(wo.partsToProcessCount * 380));
  const [backDate, setBackDate] = useState(daysFromToday(4));
  const [rejected, setRejected] = useState(0);
  const [note, setNote] = useState('');

  const today = nowStamp().substring(0, 10);
  const yesterday = daysFromToday(-1);
  const quickTimes = [
    { label: 'دلوقتي', value: nowStamp() },
    { label: 'النهارده 9 الصبح', value: `${today} 09:00` },
    { label: 'النهارده 3 العصر', value: `${today} 15:00` },
    { label: 'امبارح آخر اليوم', value: `${yesterday} 16:30` }
  ].filter(q => q.value <= nowStamp()); // a time that has not come yet would be refused
  const isBackfill = at.substring(0, 13) < nowStamp().substring(0, 13);

  const submit = () => {
    if (!action) return;
    const ok = onSubmit({
      action,
      at,
      crew,
      note: note || undefined,
      partsDone: action === 'progress' ? partsDone : undefined,
      stopReason: action === 'stop' ? stopReason : undefined,
      subcontract: action === 'sent_out' ? { vendorName: vendor || 'ورشة خارجية', agreedCost: cost, expectedBackAt: backDate } : undefined,
      rejectedQty: action === 'received_back' ? rejected : undefined
    });
    if (ok) onClose();
  };

  const statusInfo = ProductionService.getWorkOrderStatusInfo(wo.status);
  const toneClass = (tone: string, on: boolean) => on
    ? { blue: 'bg-blue-600 text-white border-blue-600', emerald: 'bg-emerald-600 text-white border-emerald-600', orange: 'bg-orange-500 text-white border-orange-500', rose: 'bg-rose-600 text-white border-rose-600', slate: 'bg-slate-700 text-white border-slate-700' }[tone]
    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full sm:max-w-2xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto custom-scrollbar">
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3 sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] font-bold text-[#C87A38] bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">{wo.workOrderNumber}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bg}`}>{statusInfo.label}</span>
              <span className="text-[10px] text-slate-400">بيتسجل كـ: {CAPTURE_SOURCES[captureMode]}</span>
            </div>
            <h3 className="text-base font-black text-slate-900 mt-1">{wo.customerName} · {ProductionService.getCategoryInfo(wo.operationCategory).short}</h3>
            <p className="text-xs text-slate-500">{wo.operationName} — {wo.partsCompletedCount} من {wo.partsToProcessCount} قطعة خلصت</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl" aria-label="إغلاق"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-5">
          {preds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="text-slate-500">قبلها:</span>
              {preds.map(p => (
                <span key={p.id} className={`px-2 py-0.5 rounded-lg border font-bold ${p.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  {ProductionService.getCategoryInfo(p.operationCategory).short} {p.status === 'completed' ? '✓' : `${p.progressPercentage}%`}
                </span>
              ))}
            </div>
          )}

          {wo.status === 'completed' ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm font-bold text-emerald-800">المحطة دي خلصت {wo.completedAt}.</div>
          ) : (
            <>
              <div>
                <span className="text-xs font-black text-slate-800 block mb-2">1. إيه اللي حصل؟</span>
                <div className="grid grid-cols-2 gap-2">
                  {choices.map(c => {
                    const Icon = c.icon;
                    const on = action === c.action;
                    return (
                      <button key={c.action} onClick={() => setAction(c.action)} className={`p-3 rounded-2xl border text-right transition-all ${toneClass(c.tone, on)}`}>
                        <span className="flex items-center gap-1.5 text-sm font-black"><Icon className="w-4 h-4" />{c.label}</span>
                        <span className={`text-[10px] block mt-0.5 ${on ? 'text-white/80' : 'text-slate-400'}`}>{c.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {action === 'progress' && (
                <label className="block">
                  <span className="text-xs font-black text-slate-800 block mb-1.5">كام قطعة خلصت لحد دلوقتي؟ (من {wo.partsToProcessCount})</span>
                  <input type="number" min={wo.partsCompletedCount} max={wo.partsToProcessCount} value={partsDone} onChange={e => setPartsDone(Number(e.target.value))} className="w-40 px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono font-bold" />
                </label>
              )}

              {action === 'stop' && (
                <div>
                  <span className="text-xs font-black text-slate-800 block mb-1.5">السبب</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(STOP_REASONS) as StopReason[]).filter(r => r !== 'waiting_previous').map(r => (
                      <button key={r} onClick={() => setStopReason(r)} className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border ${stopReason === r ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-700 border-slate-200'}`}>
                        {STOP_REASONS[r]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {action === 'sent_out' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-orange-50/60 border border-orange-200">
                  <label className="sm:col-span-3">
                    <span className="text-[11px] font-black text-orange-900 block mb-1">الورشة الخارجية</span>
                    <input list="subcontractors" value={vendor} onChange={e => setVendor(e.target.value)} className="w-full px-3 py-2 border border-orange-200 rounded-xl text-xs font-bold bg-white" />
                    <datalist id="subcontractors">{(wc?.commonSubcontractors || []).map(v => <option key={v} value={v} />)}</datalist>
                  </label>
                  <label>
                    <span className="text-[11px] font-black text-orange-900 block mb-1">التكلفة المتفق عليها</span>
                    <input type="number" value={cost} onChange={e => setCost(Number(e.target.value))} className="w-full px-3 py-2 border border-orange-200 rounded-xl text-xs font-mono font-bold bg-white" />
                  </label>
                  <label>
                    <span className="text-[11px] font-black text-orange-900 block mb-1">مرجعة يوم</span>
                    <input type="date" value={backDate} onChange={e => setBackDate(e.target.value)} className="w-full px-3 py-2 border border-orange-200 rounded-xl text-xs font-mono bg-white" />
                  </label>
                  <p className="text-[10px] text-orange-800 self-end">{wo.partsToProcessCount} قطعة هتخرج بإذن خروج، ومش هتتحسب مصنعية داخلية عليها.</p>
                </div>
              )}

              {action === 'received_back' && wo.subcontract && (
                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-2">
                  <p className="text-emerald-900">من <strong>{wo.subcontract.vendorName}</strong> · اتبعتت {wo.subcontract.sentAt} · متفق على <strong className="font-mono">{wo.subcontract.agreedCost.toLocaleString()} ج.م</strong></p>
                  <label className="flex items-center gap-2">
                    <span className="font-bold text-emerald-900">قطع مرفوضة (لون / خدش):</span>
                    <input type="number" min={0} value={rejected} onChange={e => setRejected(Number(e.target.value))} className="w-20 px-2 py-1 border border-emerald-200 rounded-lg font-mono" />
                  </label>
                  {rejected > 0 && <p className="text-rose-700 font-bold">القطع المرفوضة ترجع للورشة الخارجية على حسابها. لو محتاجة تتعمل من جديد، اعمل أمر نواقص.</p>}
                </div>
              )}

              {action && action !== 'pause' && (
                <div>
                  <span className="text-xs font-black text-slate-800 block mb-1.5">2. إمتى؟ <span className="text-slate-400 font-normal">(لو بتسجل من الورق آخر اليوم، اختار الوقت الحقيقي)</span></span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {quickTimes.map(q => (
                      <button key={q.label} onClick={() => setAt(q.value)} className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border ${at === q.value ? 'bg-[#361D13] text-white border-[#361D13]' : 'bg-white text-slate-600 border-slate-200'}`}>
                        {q.label}
                      </button>
                    ))}
                    <input type="datetime-local" value={toInput(at)} onChange={e => e.target.value && setAt(fromInput(e.target.value))} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-[11px] font-mono" />
                  </div>
                  {isBackfill && (
                    <p className="text-[10px] text-amber-700 mt-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> هيتسجل إنه حصل {at} واتكتب دلوقتي، والفرق بيبان في السجل.</p>
                  )}
                </div>
              )}

              {action && !['pause', 'stop', 'sent_out', 'received_back'].includes(action) && (
                <div>
                  <span className="text-xs font-black text-slate-800 block mb-1.5">3. مين اشتغل؟ <span className="text-slate-400 font-normal">(عشان حساب القطعة واليومية)</span></span>
                  <div className="flex flex-wrap gap-1.5">
                    {workers.filter(w => w.section === wo.operationCategory || crew.includes(w.name)).map(w => {
                      const on = crew.includes(w.name);
                      return (
                        <button key={w.id} onClick={() => setCrew(on ? crew.filter(n => n !== w.name) : [...crew, w.name])} className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border ${on ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                          {w.name} <span className={on ? 'text-white/70' : 'text-slate-400'}>· {w.payBasis === 'piece' ? `${w.pieceRate} ج/${w.pieceUnit}` : w.payBasis === 'daily' ? 'يومية' : 'شهري'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <input value={note} onChange={e => setNote(e.target.value)} placeholder="ملاحظة (اختياري): مثلاً الضلفة 3 فيها خدش" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs" />
            </>
          )}

          {wo.log && wo.log.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-2"><History className="w-4 h-4 text-slate-400" /> سجل المحطة</span>
              <div className="space-y-1.5">
                {[...wo.log].reverse().map(l => {
                  const lagHours = (new Date(l.recordedAt.replace(' ', 'T')).getTime() - new Date(l.at.replace(' ', 'T')).getTime()) / 3600000;
                  return (
                    <div key={l.id} className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-600 bg-slate-50 rounded-xl px-3 py-1.5">
                      <span className="font-mono text-slate-800">{l.at}</span>
                      <span className="font-bold">{{ start: 'بدأ', progress: `+${l.qtyDelta || 0} قطعة`, pause: 'توقف مؤقت', stop: `وقف: ${l.stopReason ? STOP_REASONS[l.stopReason] : ''}`, resume: 'رجع يشتغل', complete: 'خلص', sent_out: 'اتبعت بره', received_back: 'رجع من بره' }[l.action]}</span>
                      <span className="text-slate-400">· {CAPTURE_SOURCES[l.source]} ({l.recordedBy})</span>
                      {lagHours >= 2 && <span className="text-amber-700 font-bold">· اتكتب بعدها بـ {Math.round(lagHours)} ساعة</span>}
                      {l.note && <span className="text-slate-500">· {l.note}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {wo.status !== 'completed' && (
          <div className="p-4 border-t border-slate-100 flex justify-end gap-2 sticky bottom-0 bg-white">
            <button onClick={onClose} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">إلغاء</button>
            <button onClick={submit} disabled={!action} className="px-6 py-2.5 bg-[#361D13] hover:bg-[#26150D] disabled:opacity-40 text-white text-xs font-black rounded-xl shadow-md">
              سجّل
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
