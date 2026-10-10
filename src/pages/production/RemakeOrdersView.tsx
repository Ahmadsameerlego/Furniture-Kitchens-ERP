import React, { useMemo, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ProductionOrder, RemakeChargeTo, RemakePart, RemakeReason, RemakeSource } from '../../types/erp';
import { WorkOrder } from '../../types/production';
import { MATERIAL_CATALOG } from '../../services/materialCatalog';
import { RotateCcw, Plus, Trash2, X, Factory, Truck, User, Recycle, AlertTriangle } from 'lucide-react';

export const REMAKE_SOURCES: Record<RemakeSource, string> = {
  factory_qc: 'اتكشف في الجودة بالمصنع',
  site_installation: 'اتكشف في الموقع أثناء التركيب',
  after_handover: 'بعد التسليم (ضمان / صيانة)'
};

export const REMAKE_REASONS: Record<RemakeReason, { label: string; defaultCharge: RemakeChargeTo }> = {
  transport_damage: { label: 'كسر أو خدش في النقل', defaultCharge: 'factory' },
  site_measure_error: { label: 'غلط في مقاس الموقع (المعاينة)', defaultCharge: 'factory' },
  manufacturing_defect: { label: 'عيب تصنيع (قشاط / تخريم / دهان)', defaultCharge: 'factory' },
  cutting_error: { label: 'غلط تقطيع أو قايمة تقطيع', defaultCharge: 'factory' },
  missing_part: { label: 'قطعة اتنسيت ومطلعتش', defaultCharge: 'factory' },
  customer_change: { label: 'العميل غيّر رأيه (لون / مقاس)', defaultCharge: 'customer' }
};

export const CHARGE_TO: Record<RemakeChargeTo, { label: string; icon: React.ElementType }> = {
  factory: { label: 'على المصنع (تكلفة جودة)', icon: Factory },
  customer: { label: 'على العميل (يتعمل أمر تغيير بالسعر)', icon: User },
  supplier: { label: 'على المورد (خامة معيبة)', icon: Truck },
  transport: { label: 'على شركة النقل', icon: Truck }
};

const BOARDS = MATERIAL_CATALOG.filter(m => m.category === 'board');
const PAINTED = new Set(['LACQUER-MDF-18', 'OAK-PLYWOOD-18']);

interface Props {
  orders: ProductionOrder[];
  workOrders: WorkOrder[];
  onSelectOrder: (order: ProductionOrder) => void;
}

export const RemakeOrdersView: React.FC<Props> = ({ orders, workOrders, onSelectOrder }) => {
  const [open, setOpen] = useState(false);
  const remakes = orders.filter(o => o.kind === 'remake');
  const done = remakes.filter(o => o.status === 'completed');
  const cost = (o: ProductionOrder) => (o.totalActualMaterialCost || o.totalEstimatedMaterialCost) + (o.totalLaborCost || 0);
  const poorQualityCost = done.filter(o => o.remake?.chargeTo !== 'customer').reduce((s, o) => s + cost(o), 0);
  const byReason = (Object.keys(REMAKE_REASONS) as RemakeReason[]).map(r => ({ r, n: remakes.filter(o => o.remake?.reason === r).length })).filter(x => x.n > 0);

  return (
    <div className="space-y-4">
      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0"><RotateCcw className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm font-black text-slate-900">النواقص وإعادة التصنيع</h3>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              ضلفة اتكسرت في العربية، جنب مقاسه غلط، قطعة اتنسيت. في مصانع التفصيل دي بتحصل كل أسبوع.
              هنا بتتعمل "أمر نواقص" صغير مربوط بالمشروع الأصلي، بيعدّي على المحطات اللي محتاجها بس، وتكلفته بتتسجل على اللي يتحملها.
            </p>
          </div>
        </div>
        <button onClick={() => setOpen(true)} className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-600/20 shrink-0">
          <Plus className="w-4 h-4" /> تسجيل نواقص / قطعة مكسورة
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200"><div className="text-xl font-black font-mono">{remakes.length}</div><div className="text-[11px] font-bold text-slate-500">أوامر نواقص</div></div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200"><div className="text-xl font-black font-mono">{remakes.length - done.length}</div><div className="text-[11px] font-bold text-slate-500">لسه في الورشة</div></div>
        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200"><div className="text-xl font-black font-mono text-rose-700">{poorQualityCost.toLocaleString()} ج.م</div><div className="text-[11px] font-bold text-rose-700">تكلفة الجودة الرديئة (على المصنع)</div></div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 mb-1">أكتر سبب</div>
          {byReason.length ? byReason.sort((a, b) => b.n - a.n).slice(0, 2).map(x => <div key={x.r} className="text-[11px] text-slate-800">• {REMAKE_REASONS[x.r].label} ({x.n})</div>) : <div className="text-[11px] text-slate-400">لسه مفيش</div>}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-xs text-right">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-3">الأمر</th>
              <th className="p-3">العميل</th>
              <th className="p-3">إيه اللي حصل</th>
              <th className="p-3">القطع</th>
              <th className="p-3">على حساب</th>
              <th className="p-3 text-center">المحطات</th>
              <th className="p-3 text-center">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {remakes.map(o => {
              const st = workOrders.filter(w => w.manufacturingOrderId === o.id);
              const doneSt = st.filter(w => w.status === 'completed').length;
              return (
                <tr key={o.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => onSelectOrder(o)}>
                  <td className="p-3 font-mono font-bold text-slate-900">{o.productionNumber}</td>
                  <td className="p-3 font-bold">{o.customerName}<span className="block text-[10px] text-slate-400 font-mono">{o.projectNumber}</span></td>
                  <td className="p-3">{o.remake ? REMAKE_REASONS[o.remake.reason].label : ''}<span className="block text-[10px] text-slate-400">{o.remake ? REMAKE_SOURCES[o.remake.source] : ''}</span></td>
                  <td className="p-3 text-[11px]">{o.remake?.parts.map(p => `${p.partName} (${p.quantity})`).join('، ')}{o.remake?.fromOffcuts && <span className="block text-emerald-700 text-[10px] font-bold">♻️ من البواقي</span>}</td>
                  <td className="p-3 text-[11px]">{o.remake ? CHARGE_TO[o.remake.chargeTo].label : ''}</td>
                  <td className="p-3 text-center font-mono">{doneSt}/{st.length}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${o.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : o.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {o.status === 'completed' ? 'جاهز لزيارة الاستكمال' : o.status === 'pending' ? 'مستني يبدأ' : 'في الورشة'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {remakes.length === 0 && (
              <tr><td colSpan={7} className="p-10 text-center text-slate-400">مفيش أوامر نواقص. لما يحصل كسر أو نقص، سجّله من الزرار اللي فوق.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && <RemakeOrderModal orders={orders} onClose={() => setOpen(false)} />}
    </div>
  );
};

// ----------------------------------------------------------------------------

const RemakeOrderModal: React.FC<{ orders: ProductionOrder[]; onClose: () => void }> = ({ orders, onClose }) => {
  const { createRemakeOrder, technicalProjects, technicalBOMs, currentUser, offCutReturns } = useERP();
  const mains = orders.filter(o => o.kind !== 'remake');
  const [moId, setMoId] = useState(mains.find(o => o.status === 'completed')?.id || mains[0]?.id || '');
  const mo = mains.find(o => o.id === moId);
  const [source, setSource] = useState<RemakeSource>('site_installation');
  const [reason, setReason] = useState<RemakeReason>('transport_damage');
  const [chargeTo, setChargeTo] = useState<RemakeChargeTo>('factory');
  const [parts, setParts] = useState<RemakePart[]>([]);
  // One or two broken parts usually come out of the offcut rack, not a new sheet
  const [fromOffcuts, setFromOffcuts] = useState(true);
  const [includesAssembly, setIncludesAssembly] = useState(false);
  const [notes, setNotes] = useState('');

  // The approved cutting list knows every part, so a broken door is picked, not re-measured
  const bomParts = useMemo(() => {
    if (!mo) return [];
    const tp = technicalProjects.find(t => t.salesProjectId === mo.projectId || t.salesProjectNumber === mo.projectNumber);
    const boms = tp ? technicalBOMs.filter(b => b.technicalProjectId === tp.id) : [];
    const bom = boms.find(b => b.status === 'released') || boms.find(b => b.status === 'approved') || boms[0];
    return (bom?.units || []).flatMap(u => u.cuttingParts.map(p => ({ key: `${u.unitCode}-${p.id}`, label: `${u.unitCode} · ${p.partName} ${p.lengthMm}×${p.widthMm}`, unit: u.unitCode, part: p })));
  }, [mo, technicalProjects, technicalBOMs]);

  const addFromBom = (key: string) => {
    const b = bomParts.find(x => x.key === key);
    if (!b) return;
    setParts(prev => [...prev, { partName: `${b.part.partName} (${b.unit})`, materialCode: b.part.materialCode, materialName: b.part.materialName, lengthMm: b.part.lengthMm, widthMm: b.part.widthMm, quantity: 1, needsPaint: PAINTED.has(b.part.materialCode) }]);
  };
  const addBlank = () => setParts(prev => [...prev, { partName: 'ضلفة', materialCode: BOARDS[0].key, materialName: BOARDS[0].name, lengthMm: 720, widthMm: 396, quantity: 1 }]);
  const update = (i: number, patch: Partial<RemakePart>) => setParts(prev => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const usableOffcuts = offCutReturns.filter(o => o.status === 'returned_to_stock').length;

  const submit = () => {
    if (!mo || parts.length === 0) return;
    const created = createRemakeOrder({ projectId: mo.projectId, parentProductionId: mo.id, source, reason, chargeTo, reportedBy: currentUser.fullName, parts, fromOffcuts, includesAssembly, notes: notes || undefined });
    if (created) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl my-auto">
        <div className="p-5 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h3 className="font-black text-slate-900 flex items-center gap-2"><RotateCcw className="w-5 h-5 text-rose-600" /> أمر نواقص / إعادة تصنيع</h3>
            <p className="text-xs text-slate-500">بيتعمل أمر صغير عاجل مربوط بالمشروع، بيعدي على المحطات اللازمة بس.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl" aria-label="إغلاق"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label>
              <span className="font-black text-slate-800 block mb-1">المشروع الأصلي</span>
              <select value={moId} onChange={e => { setMoId(e.target.value); setParts([]); }} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-bold">
                {mains.map(o => <option key={o.id} value={o.id}>{o.customerName} · {o.productionNumber}</option>)}
              </select>
            </label>
            <label>
              <span className="font-black text-slate-800 block mb-1">اتكشف فين؟</span>
              <select value={source} onChange={e => setSource(e.target.value as RemakeSource)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-bold">
                {(Object.keys(REMAKE_SOURCES) as RemakeSource[]).map(s => <option key={s} value={s}>{REMAKE_SOURCES[s]}</option>)}
              </select>
            </label>
          </div>

          <div>
            <span className="font-black text-slate-800 block mb-1.5">إيه السبب؟</span>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(REMAKE_REASONS) as RemakeReason[]).map(r => (
                <button key={r} onClick={() => { setReason(r); setChargeTo(REMAKE_REASONS[r].defaultCharge); }} className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border ${reason === r ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-700 border-slate-200'}`}>
                  {REMAKE_REASONS[r].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="font-black text-slate-800 block mb-1.5">على حساب مين؟</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
              {(Object.keys(CHARGE_TO) as RemakeChargeTo[]).map(c => {
                const Icon = CHARGE_TO[c].icon;
                return (
                  <button key={c} onClick={() => setChargeTo(c)} className={`p-2 rounded-xl text-[11px] font-bold border text-right flex items-center gap-1.5 ${chargeTo === c ? 'bg-[#361D13] text-white border-[#361D13]' : 'bg-white text-slate-700 border-slate-200'}`}>
                    <Icon className="w-3.5 h-3.5 shrink-0" />{CHARGE_TO[c].label}
                  </button>
                );
              })}
            </div>
            {chargeTo === 'customer' && <p className="text-[11px] text-amber-700 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> اعمل أمر تغيير للعميل من المبيعات بالسعر قبل ما تبدأ.</p>}
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-black text-slate-800">القطع المطلوبة</span>
              <div className="flex gap-1.5">
                {bomParts.length > 0 && (
                  <select value="" onChange={e => addFromBom(e.target.value)} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-[11px] font-bold bg-white max-w-[260px]">
                    <option value="">+ اختار من قايمة التقطيع ({bomParts.length} قطعة)</option>
                    {bomParts.map(b => <option key={b.key} value={b.key}>{b.label}</option>)}
                  </select>
                )}
                <button onClick={addBlank} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-[11px] font-bold bg-white">+ قطعة بمقاس يدوي</button>
              </div>
            </div>
            {parts.length === 0 && <p className="text-[11px] text-slate-400 py-2">اختار القطعة من قايمة التقطيع المعتمدة عشان المقاس والخامة يطلعوا مظبوطين من غير ما حد يقيس تاني.</p>}
            {parts.map((p, i) => (
              <div key={i} className="grid grid-cols-12 gap-1.5 items-center bg-white rounded-xl p-2 border border-slate-200">
                <input value={p.partName} onChange={e => update(i, { partName: e.target.value })} className="col-span-12 md:col-span-3 px-2 py-1.5 border border-slate-200 rounded-lg font-bold" />
                <select value={p.materialCode} onChange={e => { const m = BOARDS.find(b => b.key === e.target.value); update(i, { materialCode: e.target.value, materialName: m?.name || '', needsPaint: PAINTED.has(e.target.value) }); }} className="col-span-12 md:col-span-4 px-2 py-1.5 border border-slate-200 rounded-lg text-[11px]">
                  {BOARDS.map(b => <option key={b.key} value={b.key}>{b.name}</option>)}
                  {!BOARDS.some(b => b.key === p.materialCode) && <option value={p.materialCode}>{p.materialName}</option>}
                </select>
                <input type="number" value={p.lengthMm} onChange={e => update(i, { lengthMm: Number(e.target.value) })} className="col-span-3 md:col-span-1 px-1.5 py-1.5 border border-slate-200 rounded-lg font-mono" title="الطول مم" />
                <input type="number" value={p.widthMm} onChange={e => update(i, { widthMm: Number(e.target.value) })} className="col-span-3 md:col-span-1 px-1.5 py-1.5 border border-slate-200 rounded-lg font-mono" title="العرض مم" />
                <input type="number" min={1} value={p.quantity} onChange={e => update(i, { quantity: Number(e.target.value) })} className="col-span-2 md:col-span-1 px-1.5 py-1.5 border border-slate-200 rounded-lg font-mono" title="العدد" />
                <label className="col-span-3 md:col-span-1 flex items-center gap-1 text-[10px]"><input type="checkbox" checked={!!p.needsPaint} onChange={e => update(i, { needsPaint: e.target.checked })} />دهان</label>
                <button onClick={() => setParts(prev => prev.filter((_, idx) => idx !== i))} className="col-span-1 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg" aria-label="حذف"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 font-bold text-slate-700">
              <input type="checkbox" checked={fromOffcuts} onChange={e => setFromOffcuts(e.target.checked)} />
              <Recycle className="w-4 h-4 text-emerald-600" /> تتقطع من البواقي ({usableOffcuts} في مخزن الفضلات) - من غير لوح جديد
            </label>
            <label className="flex items-center gap-2 font-bold text-slate-700">
              <input type="checkbox" checked={includesAssembly} onChange={e => setIncludesAssembly(e.target.checked)} /> وحدة كاملة محتاجة تتجمع
            </label>
          </div>

          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="ملاحظة: مثلاً الضلفة اتكسرت عند باب الأسانسير" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl" />
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">إلغاء</button>
          <button onClick={submit} disabled={!mo || parts.length === 0} className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-black rounded-xl">اعمل أمر النواقص</button>
        </div>
      </div>
    </div>
  );
};
