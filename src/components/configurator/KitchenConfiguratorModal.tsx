import React, { useEffect, useMemo, useState } from 'react';
import {
  X, Ruler, Palette, Calculator, CheckCircle2, AlertTriangle, Trash2, RotateCcw, Sparkles, Info, Layers, ChevronLeft, ChevronRight
} from 'lucide-react';
import type { CustomProject, ProjectMeasurement, QuotationBreakdown, QuotationLineItem } from '../../types/erp';
import type { ConfiguratorOptions, ConfiguratorWall, FinishTier, KitchenConfiguration, KitchenLayout } from '../../types/configurator';
import {
  COUNTERTOP_OPTIONS, FRONT_OPTIONS, LAYOUT_LABELS, MIN_MARGIN_PERCENT, TIER_PRESETS, VAT_RATE,
  buildConfiguration, defaultOptions, layoutKitchen, priceConfiguration, suggestLayout, wallsFromMeasurement
} from '../../services/kitchenConfigurator';
import { renderElevationSvg, renderPlanSvg } from '../../utils/kitchenDrawing';

export interface ConfiguratorQuotePayload {
  items: QuotationLineItem[];
  discount: number;
  notes: string;
  breakdown: QuotationBreakdown;
  configuration: KitchenConfiguration;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project: CustomProject;
  measurement?: ProjectMeasurement;
  nextVersion: number;
  onIssue?: (payload: ConfiguratorQuotePayload) => void;
  /** View a configuration already attached to a quotation (no editing). */
  readOnlyConfig?: KitchenConfiguration;
}

const fmt = (n: number) => Math.round(n).toLocaleString();

const LayoutIcon: React.FC<{ layout: KitchenLayout; active: boolean }> = ({ layout, active }) => {
  const c = active ? '#C87A38' : '#8F857C';
  const paths: Record<KitchenLayout, string> = {
    straight: 'M6 8 H42',
    l_shape: 'M6 8 H42 V40',
    u_shape: 'M6 40 V8 H42 V40',
    parallel: 'M6 8 H42 M6 40 H42'
  };
  return <svg viewBox="0 0 48 48" className="w-10 h-10"><path d={paths[layout]} stroke={c} strokeWidth="6" fill="none" strokeLinecap="square" /></svg>;
};

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${checked ? 'bg-[#361D13] text-white border-[#361D13]' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
  >
    {checked ? '✓ ' : ''}{label}
  </button>
);

const Svg: React.FC<{ svg: string; className?: string }> = ({ svg, className }) => (
  <div className={className} dangerouslySetInnerHTML={{ __html: svg }} />
);

export const KitchenConfiguratorModal: React.FC<Props> = ({ isOpen, onClose, project, measurement, nextVersion, onIssue, readOnlyConfig }) => {
  const initial = useMemo(() => wallsFromMeasurement(measurement), [measurement]);
  const [step, setStep] = useState<1 | 2 | 3>(readOnlyConfig ? 3 : 1);
  const [layout, setLayout] = useState<KitchenLayout>(readOnlyConfig?.layout || suggestLayout(initial.walls.length));
  const [tier, setTier] = useState<FinishTier>(readOnlyConfig?.tier || 'standard');
  const [walls, setWalls] = useState<ConfiguratorWall[]>(readOnlyConfig?.walls || initial.walls);
  const [ceiling, setCeiling] = useState<number>(readOnlyConfig?.ceilingHeightCm || initial.ceilingHeightCm);
  const [options, setOptions] = useState<ConfiguratorOptions>(readOnlyConfig?.options || defaultOptions('standard'));
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [activeWall, setActiveWall] = useState(0);

  const neededWalls = LAYOUT_LABELS[layout].walls;
  const activeWalls = useMemo(() => {
    const list = [...walls];
    while (list.length < neededWalls) {
      list.push({ id: `wall-${list.length + 1}`, name: `الحائط ${String.fromCharCode(65 + list.length)}`, lengthCm: 300, hasSink: false, hasHob: false, hasDishwasher: false, hasFridge: false, hasOvenTower: false, windowWidthCm: 0 });
    }
    return list.slice(0, neededWalls);
  }, [walls, neededWalls]);

  const result = useMemo(
    () => (readOnlyConfig ? { units: readOnlyConfig.units, metrics: readOnlyConfig.metrics, warnings: [] as string[] } : layoutKitchen(layout, activeWalls, options, ceiling)),
    [readOnlyConfig, layout, activeWalls, options, ceiling]
  );

  // Manual removals only make sense for the layout they were made on
  useEffect(() => { setRemoved(new Set()); }, [layout, activeWalls, ceiling, options.islandLengthCm, options.liftUpWallDoors]);

  const config = useMemo(() => buildConfiguration({
    layout,
    tier,
    walls: activeWalls,
    options,
    ceilingHeightCm: ceiling,
    units: result.units.filter(u => !removed.has(u.id)),
    sourceMeasurementVersion: measurement?.version
  }), [layout, tier, activeWalls, options, ceiling, result.units, removed, measurement?.version]);

  const pricing = useMemo(() => priceConfiguration(readOnlyConfig || config), [readOnlyConfig, config]);
  const view = readOnlyConfig || config;

  // Price of the same kitchen in each finish level, for the tier cards
  const tierPrices = useMemo(() => {
    const out = {} as Record<FinishTier, number>;
    (Object.keys(TIER_PRESETS) as FinishTier[]).forEach(t => {
      const o: ConfiguratorOptions = { ...options, ...TIER_PRESETS[t].options };
      const r = layoutKitchen(layout, activeWalls, o, ceiling);
      out[t] = priceConfiguration(buildConfiguration({ layout, tier: t, walls: activeWalls, options: o, ceilingHeightCm: ceiling, units: r.units })).netSelling;
    });
    return out;
  }, [layout, activeWalls, options, ceiling]);

  if (!isOpen) return null;

  const updateWall = (idx: number, patch: Partial<ConfiguratorWall>) => {
    setWalls(prev => {
      const list = [...activeWalls];
      list[idx] = { ...list[idx], ...patch };
      return [...list, ...prev.slice(list.length)];
    });
  };
  const setOpt = <K extends keyof ConfiguratorOptions>(key: K, value: ConfiguratorOptions[K]) => setOptions(prev => ({ ...prev, [key]: value }));
  const chooseTier = (t: FinishTier) => {
    setTier(t);
    setOptions(prev => ({ ...prev, ...TIER_PRESETS[t].options }));
  };

  const marginLow = pricing.marginPercent < MIN_MARGIN_PERCENT;
  const canIssue = !readOnlyConfig && onIssue && pricing.lines.length > 0 && view.units.length > 0;

  const issue = () => {
    if (!onIssue) return;
    onIssue({
      items: pricing.lines,
      discount: pricing.discountAmount,
      notes: notes || `عرض سعر محسوب بالـ Configurator من مقاسات المعاينة V${measurement?.version ?? '-'} • ${LAYOUT_LABELS[layout].label} • مستوى ${TIER_PRESETS[tier].label}`,
      breakdown: pricing.breakdown,
      configuration: config
    });
  };

  const steps: { n: 1 | 2 | 3; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { n: 1, label: 'المقاسات والتوزيع', icon: Ruler },
    { n: 2, label: 'مستوى التشطيب والخامات', icon: Palette },
    { n: 3, label: 'الوحدات والرسومات والسعر', icon: Calculator }
  ];

  const wallForTab = view.walls[Math.min(activeWall, view.walls.length - 1)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-[#FAF7F2] rounded-3xl w-full max-w-[1280px] h-[94vh] shadow-2xl flex flex-col overflow-hidden text-right">

        {/* Header */}
        <div className="bg-[#1E110B] text-white px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C87A38] flex items-center justify-center"><Sparkles className="w-5 h-5" /></div>
            <div>
              <h2 className="text-base font-black">
                {readOnlyConfig ? 'توزيع الوحدات المعتمد في عرض السعر' : `مُكوِّن المطبخ (Configurator) — عرض سعر V${nextVersion}`}
              </h2>
              <p className="text-[11px] text-amber-100/80">
                {project.projectNumber} • {project.projectName} • {project.customerName}
              </p>
            </div>
          </div>
          {!readOnlyConfig && (
            <div className="hidden md:flex items-center gap-1.5">
              {steps.map(s => {
                const Icon = s.icon;
                return (
                  <button key={s.n} onClick={() => setStep(s.n)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${step === s.n ? 'bg-[#C87A38] text-white' : 'text-amber-100/80 hover:bg-white/10'}`}>
                    <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center ${step === s.n ? 'bg-white text-[#C87A38]' : 'bg-white/10'}`}>{s.n}</span>
                    <Icon className="w-3.5 h-3.5" />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          )}
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col lg:flex-row">

          {/* Main column */}
          <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar p-5 space-y-5">

            {result.warnings.length > 0 && !readOnlyConfig && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                {result.warnings.map((w, i) => <p key={i} className="flex items-center gap-1.5 font-bold"><AlertTriangle className="w-3.5 h-3.5 shrink-0" />{w}</p>)}
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && !readOnlyConfig && (
              <>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 text-xs">
                  <Info className="w-4 h-4 text-[#C87A38] shrink-0 mt-0.5" />
                  <p className="text-slate-600 leading-relaxed">
                    {measurement
                      ? <>الحوائط والسقف متقريين أوتوماتيك من <strong className="text-slate-900">مقاسات المعاينة V{measurement.version}</strong> ({measurement.createdDate} — {measurement.createdByUserName}). أي تعديل هنا للتسعير بس، ومش بيغيّر المعاينة الأصلية.</>
                      : <>مفيش مقاسات معاينة مسجلة للمشروع ده، فاتحطت مقاسات افتراضية. الأفضل تسجل المعاينة الأول من تبويب "المعاينة والمقاسات".</>}
                  </p>
                </div>

                <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                  <h3 className="text-sm font-black text-slate-900">1. شكل المطبخ</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(Object.keys(LAYOUT_LABELS) as KitchenLayout[]).map(l => (
                      <button key={l} onClick={() => setLayout(l)}
                        className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${layout === l ? 'border-[#C87A38] bg-amber-50/60' : 'border-slate-200 hover:border-slate-300'}`}>
                        <LayoutIcon layout={l} active={layout === l} />
                        <span className="text-xs font-black text-slate-800">{LAYOUT_LABELS[l].label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                    <label className="flex items-center gap-2 font-bold text-slate-700">
                      ارتفاع السقف (سم)
                      <input type="number" value={ceiling} onChange={e => setCeiling(Number(e.target.value) || 0)} className="w-20 p-1.5 border border-slate-200 rounded-lg text-center font-mono" />
                    </label>
                    <label className="flex items-center gap-2 font-bold text-slate-700">
                      جزيرة في النص (سم، 0 = بدون)
                      <input type="number" value={options.islandLengthCm} onChange={e => setOpt('islandLengthCm', Number(e.target.value) || 0)} className="w-20 p-1.5 border border-slate-200 rounded-lg text-center font-mono" />
                    </label>
                  </div>
                </section>

                <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                  <h3 className="text-sm font-black text-slate-900">2. الحوائط والأجهزة اللي على كل حائط</h3>
                  <div className="space-y-3">
                    {activeWalls.map((w, idx) => (
                      <div key={w.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="w-6 h-6 rounded-lg bg-[#361D13] text-white text-[11px] font-black flex items-center justify-center">{String.fromCharCode(65 + idx)}</span>
                          <input value={w.name} onChange={e => updateWall(idx, { name: e.target.value })} className="flex-1 min-w-[180px] p-1.5 border border-slate-200 rounded-lg font-bold bg-white" />
                          <label className="flex items-center gap-1.5 font-bold text-slate-600">الطول
                            <input type="number" value={w.lengthCm} onChange={e => updateWall(idx, { lengthCm: Number(e.target.value) || 0 })} className="w-20 p-1.5 border border-slate-200 rounded-lg text-center font-mono bg-white" />
                            سم
                          </label>
                          <label className="flex items-center gap-1.5 font-bold text-slate-600">شباك بعرض
                            <input type="number" value={w.windowWidthCm} onChange={e => updateWall(idx, { windowWidthCm: Number(e.target.value) || 0 })} className="w-16 p-1.5 border border-slate-200 rounded-lg text-center font-mono bg-white" />
                            سم
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <Toggle checked={w.hasSink} onChange={v => updateWall(idx, { hasSink: v })} label="حوض" />
                          <Toggle checked={w.hasHob} onChange={v => updateWall(idx, { hasHob: v })} label="بوتاجاز وشفاط" />
                          <Toggle checked={w.hasDishwasher} onChange={v => updateWall(idx, { hasDishwasher: v })} label="غسالة أطباق بلت إن" />
                          <Toggle checked={w.hasFridge} onChange={v => updateWall(idx, { hasFridge: v })} label="دولاب ثلاجة 90" />
                          <Toggle checked={w.hasOvenTower} onChange={v => updateWall(idx, { hasOvenTower: v })} label="برج فرن ومايكرويف" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && !readOnlyConfig && (
              <>
                <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                  <h3 className="text-sm font-black text-slate-900">مستوى التشطيب — نفس المطبخ بـ 3 أسعار</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(Object.keys(TIER_PRESETS) as FinishTier[]).map(t => (
                      <button key={t} onClick={() => chooseTier(t)}
                        className={`p-4 rounded-2xl border-2 text-right transition-all ${tier === t ? 'border-[#C87A38] bg-amber-50/60 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-slate-900">{TIER_PRESETS[t].label}</span>
                          {tier === t && <CheckCircle2 className="w-4 h-4 text-[#C87A38]" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed min-h-[32px]">{TIER_PRESETS[t].description}</p>
                        <p className="mt-2 text-lg font-black text-[#361D13] font-mono">{fmt(tierPrices[t])} <span className="text-xs">ج.م</span></p>
                        <p className="text-[10px] text-slate-400">قبل الضريبة</p>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-xs">
                  <h3 className="text-sm font-black text-slate-900">تخصيص الخامات (اختياري)</h3>
                  <div>
                    <p className="font-bold text-slate-700 mb-1.5">خامة الضلف والواجهات</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {FRONT_OPTIONS.map(f => (
                        <button key={f.key} onClick={() => setOpt('frontKey', f.key)}
                          className={`p-2.5 rounded-xl border text-right ${options.frontKey === f.key ? 'border-[#C87A38] bg-amber-50/60 ring-1 ring-[#C87A38]' : 'border-slate-200 hover:border-slate-300'}`}>
                          <span className="font-black text-slate-800 block">{f.label}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{fmt(f.pricePerMeter.base)} ج.م / م.ط سفلي</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-bold text-slate-700 mb-1.5">سطح الرخامة</p>
                      <div className="flex gap-2">
                        {COUNTERTOP_OPTIONS.map(c => (
                          <button key={c.key} onClick={() => setOpt('countertopKey', c.key)}
                            className={`flex-1 p-2.5 rounded-xl border text-right ${options.countertopKey === c.key ? 'border-[#C87A38] bg-amber-50/60 ring-1 ring-[#C87A38]' : 'border-slate-200'}`}>
                            <span className="font-black text-slate-800 block">{c.label}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{fmt(c.sellPerMeter)} ج.م / م.ط</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 mb-1.5">المقابض</p>
                      <div className="flex gap-2">
                        <button onClick={() => setOpt('handleStyle', 'bar')} className={`flex-1 p-2.5 rounded-xl border font-black ${options.handleStyle === 'bar' ? 'border-[#C87A38] bg-amber-50/60 ring-1 ring-[#C87A38]' : 'border-slate-200'}`}>مقابض ألومنيوم 16 سم</button>
                        <button onClick={() => setOpt('handleStyle', 'gola')} className={`flex-1 p-2.5 rounded-xl border font-black ${options.handleStyle === 'gola' ? 'border-[#C87A38] bg-amber-50/60 ring-1 ring-[#C87A38]' : 'border-slate-200'}`}>جولا بدون مقابض</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center pt-1">
                    <Toggle checked={options.liftUpWallDoors} onChange={v => setOpt('liftUpWallDoors', v)} label="ضلف علوية قلاب Blum Aventos" />
                    <Toggle checked={options.ledUnderWallUnits} onChange={v => setOpt('ledUnderWallUnits', v)} label="ليد تحت الوحدات العلوية" />
                    <Toggle checked={options.includeInstallation} onChange={v => setOpt('includeInstallation', v)} label="شامل التركيب بالموقع" />
                    <label className="flex items-center gap-1.5 font-bold text-slate-600 mr-2">الدور
                      <input type="number" min={0} value={options.siteFloor} onChange={e => setOpt('siteFloor', Number(e.target.value) || 0)} className="w-14 p-1.5 border border-slate-200 rounded-lg text-center font-mono" />
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-400">الشاسيه: MDF ملامين أبيض 18مم اسباني • المفصلات والمجاري: Blum سوفت كلوز في كل المستويات.</p>
                </section>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900">المسقط الأفقي والواجهات</h3>
                    <span className="text-[11px] text-slate-400">الخط المتقطع = الوحدات العلوية</span>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
                    <Svg svg={renderPlanSvg(view)} className="xl:col-span-2 rounded-xl border border-slate-200 overflow-hidden bg-white [&>svg]:w-full [&>svg]:h-auto" />
                    <div className="xl:col-span-3 space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {view.walls.map((w, i) => (
                          <button key={w.id} onClick={() => setActiveWall(i)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${activeWall === i ? 'bg-[#361D13] text-white' : 'bg-slate-100 text-slate-600'}`}>
                            واجهة {String.fromCharCode(65 + i)} ({w.lengthCm} سم)
                          </button>
                        ))}
                      </div>
                      {wallForTab && <Svg svg={renderElevationSvg(view, wallForTab.id, { title: true })} className="rounded-xl border border-slate-200 overflow-hidden bg-white [&>svg]:w-full [&>svg]:h-auto" />}
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2"><Layers className="w-4 h-4 text-[#C87A38]" /> الوحدات اللي اتولدت ({view.units.filter(u => u.role !== 'filler').length} وحدة)</h3>
                    {!readOnlyConfig && removed.size > 0 && (
                      <button onClick={() => setRemoved(new Set())} className="text-[11px] font-bold text-[#C87A38] flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> رجّع التوزيع التلقائي</button>
                    )}
                  </div>
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-[#361D13] text-white">
                        <tr>
                          <th className="px-3 py-2 text-right">الكود</th>
                          <th className="px-3 py-2 text-right">الوحدة</th>
                          <th className="px-3 py-2 text-center">الحائط</th>
                          <th className="px-3 py-2 text-center">عرض × ارتفاع × عمق (سم)</th>
                          <th className="px-3 py-2 text-center">ضلف / أدراج</th>
                          {!readOnlyConfig && <th className="px-3 py-2"></th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {result.units.map(u => {
                          const isRemoved = removed.has(u.id);
                          if (readOnlyConfig && isRemoved) return null;
                          const wallIdx = view.walls.findIndex(w => w.id === u.wallId);
                          return (
                            <tr key={u.id} className={isRemoved ? 'opacity-40 line-through' : 'hover:bg-amber-50/30'}>
                              <td className="px-3 py-2 font-mono font-bold text-slate-800 whitespace-nowrap">{u.code}</td>
                              <td className="px-3 py-2 font-bold text-slate-700">{u.name}</td>
                              <td className="px-3 py-2 text-center">{u.wallId === 'island' ? 'جزيرة' : String.fromCharCode(65 + Math.max(0, wallIdx))}</td>
                              <td className="px-3 py-2 text-center font-mono whitespace-nowrap" dir="ltr">{u.widthCm} × {u.heightCm} × {u.depthCm}</td>
                              <td className="px-3 py-2 text-center font-mono">{u.doors} / {u.drawers}</td>
                              {!readOnlyConfig && (
                                <td className="px-3 py-2 text-center">
                                  <button
                                    onClick={() => setRemoved(prev => { const n = new Set(prev); if (n.has(u.id)) n.delete(u.id); else n.add(u.id); return n; })}
                                    className="text-slate-400 hover:text-rose-600" title={isRemoved ? 'إرجاع' : 'شيل الوحدة دي'}>
                                    {isRemoved ? <RotateCcw className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>

                {!readOnlyConfig && (
                  <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                    <h3 className="text-sm font-black text-slate-900">بنود عرض السعر (اللي العميل هيشوفها)</h3>
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-bold">
                          <tr>
                            <th className="px-3 py-2 text-right">البند</th>
                            <th className="px-3 py-2 text-center">الكمية</th>
                            <th className="px-3 py-2 text-left">سعر الوحدة</th>
                            <th className="px-3 py-2 text-left">الإجمالي</th>
                            <th className="px-3 py-2 text-left text-slate-400">التكلفة (داخلي)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pricing.lines.map(l => (
                            <tr key={l.id}>
                              <td className="px-3 py-2"><span className="font-bold text-slate-800">{l.materialName}</span>{l.description && <span className="block text-[10px] text-slate-400">{l.description}</span>}</td>
                              <td className="px-3 py-2 text-center font-mono whitespace-nowrap">{l.quantity} {l.unit}</td>
                              <td className="px-3 py-2 text-left font-mono whitespace-nowrap">{fmt(l.unitSellingPrice)}</td>
                              <td className="px-3 py-2 text-left font-mono font-black whitespace-nowrap">{fmt(l.totalSellingPrice)}</td>
                              <td className="px-3 py-2 text-left font-mono text-slate-400 whitespace-nowrap">{fmt(l.totalCost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <p className="font-black text-slate-800 mb-1">التكلفة محسوبة منين؟</p>
                        {[
                          ['ألواح (بالمساحة الفعلية + 12% هالك)', pricing.cost.boardsCost],
                          ['شريط قشاط PVC', pricing.cost.edgeCost],
                          ['مفصلات ومجاري ومقابض ورجول', pricing.cost.hardwareCost],
                          ['مصنعيات الورشة', pricing.cost.labourCost],
                          ['دهان لاكيه', pricing.cost.paintCost],
                          ['مصاريف تشغيل المصنع (12%)', pricing.cost.overheadCost]
                        ].filter(([, v]) => Number(v) > 0).map(([k, v]) => (
                          <div key={String(k)} className="flex justify-between"><span className="text-slate-500">{k}</span><span className="font-mono font-bold">{fmt(Number(v))}</span></div>
                        ))}
                        <p className="text-[10px] text-slate-400 pt-1">+ الرخام والميكانيزمات والتركيب بتكلفتهم في الجدول.</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <p className="font-black text-slate-800 mb-1">الألواح اللي المصنع هيقطعها</p>
                        {pricing.sheets.map(s => (
                          <div key={s.key} className="flex justify-between"><span className="text-slate-500">{s.name}</span><span className="font-mono font-bold">{s.sheets} لوح <span className="text-slate-400 font-normal">({s.areaM2} م²)</span></span></div>
                        ))}
                        <p className="text-[10px] text-slate-400 pt-1">نفس الأرقام دي هتطلع في الـ BOM عند المكتب الفني بعد العقد.</p>
                      </div>
                    </div>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="ملاحظات على العرض (اختياري)" className="w-full p-2.5 border border-slate-200 rounded-xl text-xs" />
                  </section>
                )}
              </>
            )}
          </div>

          {/* Live summary */}
          <aside className="lg:w-[320px] shrink-0 border-t lg:border-t-0 lg:border-r border-slate-200 bg-white p-5 overflow-y-auto custom-scrollbar space-y-4 text-xs">
            <div>
              <p className="text-[11px] font-bold text-slate-400">ملخص المطبخ</p>
              <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                {[['سفلي', view.metrics.baseMeters], ['علوي', view.metrics.wallMeters], ['طولي', view.metrics.tallMeters]].map(([k, v]) => (
                  <div key={String(k)} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold">{k}</p>
                    <p className="font-black font-mono text-slate-900">{v}</p>
                    <p className="text-[10px] text-slate-400">م.ط</p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-slate-500 text-center">
                {view.metrics.unitsCount} وحدة • {view.metrics.doorsCount} ضلفة • {view.metrics.drawersCount} درج • رخامة {view.metrics.countertopMeters} م.ط
              </p>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-100">
              <div className="flex justify-between"><span className="text-slate-500">إجمالي البنود</span><span className="font-mono font-bold">{fmt(pricing.subtotalSelling)}</span></div>
              {!readOnlyConfig && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">خصم %</span>
                  <input type="number" min={0} max={30} value={options.discountPercent} onChange={e => setOpt('discountPercent', Math.max(0, Math.min(30, Number(e.target.value) || 0)))}
                    className="w-16 p-1 border border-slate-200 rounded-lg text-center font-mono" />
                </div>
              )}
              {pricing.discountAmount > 0 && <div className="flex justify-between text-rose-600"><span>الخصم</span><span className="font-mono font-bold">-{fmt(pricing.discountAmount)}</span></div>}
              <div className="flex justify-between pt-1.5 border-t border-slate-100"><span className="font-bold text-slate-700">الإجمالي قبل الضريبة</span><span className="font-mono font-black">{fmt(pricing.netSelling)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">ضريبة القيمة المضافة {Math.round(VAT_RATE * 100)}%</span><span className="font-mono font-bold">{fmt(pricing.vatAmount)}</span></div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#361D13] text-white mt-1">
                <span className="font-bold">الإجمالي شامل الضريبة</span>
                <span className="font-mono font-black text-base">{fmt(pricing.totalWithVat)} <span className="text-[10px]">ج.م</span></span>
              </div>
            </div>

            <div className={`p-3 rounded-xl border space-y-1 ${marginLow ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <p className="text-[10px] font-bold text-slate-500">داخلي — مش بيظهر للعميل</p>
              <div className="flex justify-between"><span className="text-slate-600">التكلفة التقديرية</span><span className="font-mono font-bold">{fmt(pricing.totalCost)}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">الربح المتوقع</span><span className="font-mono font-black">{fmt(pricing.profit)}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">هامش الربح</span><span className={`font-mono font-black ${marginLow ? 'text-rose-700' : 'text-emerald-700'}`}>{pricing.marginPercent}%</span></div>
              {marginLow && <p className="text-[11px] font-bold text-rose-700 pt-1 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> الهامش أقل من {MIN_MARGIN_PERCENT}% — الخصم ده محتاج موافقة مدير المبيعات.</p>}
            </div>

            {!readOnlyConfig && (
              <div className="space-y-2 pt-1">
                <div className="flex gap-2">
                  {step > 1 && <button onClick={() => setStep((step - 1) as 1 | 2)} className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 flex items-center justify-center gap-1"><ChevronRight className="w-4 h-4" /> السابق</button>}
                  {step < 3 && <button onClick={() => setStep((step + 1) as 2 | 3)} className="flex-1 py-2.5 rounded-xl bg-[#361D13] text-white font-black flex items-center justify-center gap-1">التالي <ChevronLeft className="w-4 h-4" /></button>}
                </div>
                {step === 3 && (
                  <button onClick={issue} disabled={!canIssue}
                    className="w-full py-3 rounded-xl bg-[#C87A38] hover:bg-[#b06325] disabled:opacity-40 text-white font-black flex items-center justify-center gap-1.5 shadow-md">
                    <CheckCircle2 className="w-4 h-4" /> إصدار عرض السعر V{nextVersion}
                  </button>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};
