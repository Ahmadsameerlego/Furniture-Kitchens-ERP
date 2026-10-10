import React, { useState } from 'react';
import { ProductionOrder } from '../../types/erp';
import { ManufacturingPackageItem } from '../../types/production';
import { useERP } from '../../context/ERPContext';
import { nowStamp } from '../../services/shopFloor';
import { Printer, Package, Truck, CheckSquare, Square, AlertTriangle, QrCode } from 'lucide-react';

interface JobCardsAndPackagesViewProps {
  orders: ProductionOrder[];
  packages: ManufacturingPackageItem[];
  setPackages: React.Dispatch<React.SetStateAction<ManufacturingPackageItem[]>>;
  onOpenJobCard: (order: ProductionOrder) => void;
  onOpenPackageLabels: (order: ProductionOrder) => void;
  onSelectOrder: (order: ProductionOrder) => void;
}

const KIND_LABEL: Record<NonNullable<ManufacturingPackageItem['kind']>, { label: string; cls: string }> = {
  carcass: { label: 'هيكل وحدة', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  fronts: { label: 'ضلف', cls: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' },
  fillers: { label: 'وزر وتقفيلات', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  hardware_kit: { label: 'شنطة إكسسوار', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  remake: { label: 'نواقص', cls: 'bg-rose-50 text-rose-700 border-rose-200' }
};

const HOLD_REASONS = ['الضلف لسه في الدهان / عند الورشة الخارجية', 'ناقص إكسسوار من المورد', 'العربية مكفتش', 'العميل طالب التركيب على مرحلتين', 'سبب تاني'];

export const JobCardsAndPackagesView: React.FC<JobCardsAndPackagesViewProps> = ({
  orders,
  packages,
  setPackages,
  onOpenJobCard,
  onOpenPackageLabels,
  onSelectOrder
}) => {
  const { showToast } = useERP();
  const [holdReason, setHoldReason] = useState<Record<string, string>>({});

  const groups = orders
    .map(o => ({ order: o, boxes: packages.filter(p => p.manufacturingOrderId === o.id) }))
    .filter(g => g.boxes.length > 0)
    .sort((a, b) => Number(a.boxes.every(p => p.status === 'shipped')) - Number(b.boxes.every(p => p.status === 'shipped')));

  const toggleLoaded = (pkg: ManufacturingPackageItem) => {
    if (pkg.status === 'shipped') return;
    setPackages(prev => prev.map(p => p.id !== pkg.id ? p : p.status === 'staged'
      ? { ...p, status: 'packed', loadedAt: undefined }
      : { ...p, status: 'staged', loadedAt: nowStamp(), heldBackReason: undefined }));
  };

  const dispatchTruck = (order: ProductionOrder, boxes: ManufacturingPackageItem[]) => {
    const loaded = boxes.filter(p => p.status === 'staged');
    const left = boxes.filter(p => p.status === 'packed');
    if (loaded.length === 0) {
      showToast('علّم على الطرود اللي اتحملت الأول', 'warning');
      return;
    }
    if (left.length > 0 && !holdReason[order.id]) {
      showToast(`فيه ${left.length} طرد لسه محملش. اختار سبب التأخير قبل ما العربية تخرج`, 'warning');
      return;
    }
    const stamp = nowStamp();
    setPackages(prev => prev.map(p => {
      if (p.manufacturingOrderId !== order.id) return p;
      if (p.status === 'staged') return { ...p, status: 'shipped', shippedAt: stamp };
      if (p.status === 'packed') return { ...p, heldBackReason: holdReason[order.id] };
      return p;
    }));
    showToast(left.length
      ? `🚚 خرجت عربية ${order.customerName} بـ ${loaded.length} طرد - ${left.length} طرد متأخر (${holdReason[order.id]}). فريق التركيب عارف إن فيه رحلة تانية`
      : `🚚 خرجت عربية ${order.customerName} بكل الطرود (${loaded.length}) - مفيش حاجة ناقصة`, left.length ? 'warning' : 'success');
  };

  return (
    <div className="space-y-6">

      {/* Loading bay */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2"><Truck className="w-4 h-4 text-[#C87A38]" /> التحميل وخروج العربية</h3>
          <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
            المطبخ بيخرج مفكك في طرود. أشهر مشكلة في التركيب: "الوزرة اتنسيت" أو "شنطة المفصلات مش في العربية". هنا كل طرد بيتعلّم عليه وهو بيطلع العربية،
            والعربية مبتخرجش وفيه طرد ناقص إلا لو حد كتب السبب، فالتركيبات تعرف من الأول إن فيه رحلة تانية.
          </p>
        </div>

        {groups.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            الطرود بتتعمل لوحدها لما محطة التغليف تخلص في أي أمر.
          </div>
        )}

        <div className="space-y-4">
          {groups.map(({ order, boxes }) => {
            const shipped = boxes.filter(p => p.status === 'shipped').length;
            const loaded = boxes.filter(p => p.status === 'staged').length;
            const held = boxes.filter(p => p.status === 'packed' && p.heldBackReason);
            const allShipped = shipped === boxes.length;
            return (
              <div key={order.id} className={`rounded-2xl border ${allShipped ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'}`}>
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100">
                  <button onClick={() => onSelectOrder(order)} className="text-right">
                    <span className="font-black text-sm text-slate-900">{order.customerName}</span>
                    <span className="text-[11px] text-slate-400 font-mono mr-2">{order.productionNumber}</span>
                    {order.kind === 'remake' && <span className="mr-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-black">نواقص</span>}
                  </button>
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="px-2 py-1 rounded-lg bg-slate-100 font-bold">{boxes.length} طرد</span>
                    <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold">اتحمل {loaded}</span>
                    <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold">خرج {shipped}</span>
                    <button onClick={() => onOpenPackageLabels(order)} className="px-2.5 py-1 rounded-lg border border-slate-200 font-bold flex items-center gap-1"><QrCode className="w-3.5 h-3.5" /> الملصقات</button>
                  </div>
                </div>

                {held.length > 0 && (
                  <div className="mx-4 mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    {held.length} طرد لسه في المصنع: {held[0].heldBackReason}. محتاجين رحلة تانية للموقع.
                  </div>
                )}

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {boxes.map(p => {
                    const kind = p.kind ? KIND_LABEL[p.kind] : undefined;
                    return (
                      <button key={p.id} onClick={() => toggleLoaded(p)} disabled={p.status === 'shipped'} className={`p-3 rounded-xl border text-right flex items-start gap-2.5 transition-all ${p.status === 'shipped' ? 'bg-emerald-50 border-emerald-200 cursor-default' : p.status === 'staged' ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200 hover:border-[#C87A38]'}`}>
                        {p.status === 'packed' ? <Square className="w-5 h-5 text-slate-300 shrink-0" /> : <CheckSquare className={`w-5 h-5 shrink-0 ${p.status === 'shipped' ? 'text-emerald-600' : 'text-blue-600'}`} />}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] font-bold text-slate-500">{p.packageCode}</span>
                            {kind && <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${kind.cls}`}>{kind.label}</span>}
                            {p.status === 'shipped' && <span className="text-[10px] text-emerald-700 font-bold">خرج {p.shippedAt?.substring(5)}</span>}
                          </div>
                          <span className="text-xs font-bold text-slate-900 block truncate">{p.title}</span>
                          <span className="text-[10px] text-slate-500 block truncate">{p.itemsContained.join(' · ')}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {!allShipped && (
                  <div className="px-4 pb-4 flex flex-col sm:flex-row sm:items-center justify-end gap-2">
                    {boxes.some(p => p.status === 'packed') && loaded > 0 && (
                      <select value={holdReason[order.id] || ''} onChange={e => setHoldReason(prev => ({ ...prev, [order.id]: e.target.value }))} className="px-3 py-2 border border-amber-300 bg-amber-50 rounded-xl text-[11px] font-bold">
                        <option value="">ليه فيه طرود مش هتطلع؟</option>
                        {HOLD_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    )}
                    <button onClick={() => dispatchTruck(order, boxes)} className="px-4 py-2 bg-[#361D13] hover:bg-[#26150D] text-white rounded-xl text-xs font-black flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#C87A38]" /> العربية خرجت
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Job cards */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-900">كروت التشغيل الورقية</h3>
          <p className="text-xs text-slate-500">كارت بيمشي مع الخامات من محطة لمحطة، عليه قايمة التقطيع والتعليمات. مفيد جداً لو مفيش تابلت.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {orders.filter(o => o.status !== 'completed').map(order => (
            <div key={order.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex justify-between items-start">
                <span className="font-mono font-bold text-xs text-[#C87A38] bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">{order.productionNumber}</span>
                <span className="text-[10px] text-slate-400 font-mono">{order.projectNumber}</span>
              </div>
              <div>
                <h4 className="font-black text-xs text-slate-900">{order.customerName}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{order.notes || 'تجهيز المطبخ طبقاً للمقايسة المعتمدة'}</p>
              </div>
              <button onClick={() => onOpenJobCard(order)} className="w-full py-2 bg-[#361D13] hover:bg-[#26150D] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                <Printer className="w-4 h-4 text-[#C87A38]" /> طباعة كارت التشغيل
              </button>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-slate-400 flex items-center gap-1"><Package className="w-3.5 h-3.5" /> كل طرد له باركود. لو المصنع مفيهوش طابعة ملصقات، الكود بيتكتب بالماركر على الكرتونة وبيتعلّم عليه هنا.</p>
    </div>
  );
};
