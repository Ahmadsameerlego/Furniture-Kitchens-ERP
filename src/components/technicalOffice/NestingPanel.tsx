import React, { useMemo, useState } from 'react';
import { Scissors, CheckCircle2, Info, Recycle, AlertTriangle } from 'lucide-react';
import type { TechnicalBOM } from '../../types/technicalOffice';
import { nestBom, SHEET_LENGTH_MM, SHEET_WIDTH_MM, KERF_MM, TRIM_MM, type MaterialNesting, type NestedSheet } from '../../services/nesting';

interface Props {
  bom: TechnicalBOM;
  onApprove: (plan: { materialCode: string; sheets: number; offcutAreaSqMeters: number; scrapPercentage: number }[]) => void;
}

const PALETTE = ['#E8C9A6', '#C9D8C5', '#D6CBE3', '#F1D5A8', '#C7DCE6', '#E6C7C2', '#D9D4B8', '#CFE0D8', '#E9D8C9', '#D2D7E8'];
const colorFor = (key: string) => PALETTE[[...key].reduce((s, c) => s + c.charCodeAt(0), 0) % PALETTE.length];

const SheetSvg: React.FC<{ sheet: NestedSheet }> = ({ sheet }) => (
  <svg viewBox={`0 0 ${SHEET_LENGTH_MM} ${SHEET_WIDTH_MM}`} className="w-full h-auto bg-[#F6F1EA] rounded-lg border border-[#C9BBAA]">
    <defs>
      <pattern id={`hatch-${sheet.index}`} width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="40" height="40" fill="#E3F1E4" />
        <line x1="0" y1="0" x2="0" y2="40" stroke="#7FB58A" strokeWidth="6" />
      </pattern>
    </defs>
    {/* Trim margin */}
    <rect x={TRIM_MM} y={TRIM_MM} width={SHEET_LENGTH_MM - 2 * TRIM_MM} height={SHEET_WIDTH_MM - 2 * TRIM_MM} fill="#EDE5DA" />
    {sheet.offcuts.map((o, i) => (
      <g key={`o${i}`}>
        <rect x={o.x} y={o.y} width={o.w} height={o.h} fill={`url(#hatch-${sheet.index})`} stroke="#4E8A5C" strokeWidth="4" />
        {o.w > 380 && o.h > 160 && (
          <text x={o.x + o.w / 2} y={o.y + o.h / 2 + 22} fontSize="64" textAnchor="middle" fill="#2F6B3D" fontWeight="700">{Math.round(o.w)}×{Math.round(o.h)}</text>
        )}
      </g>
    ))}
    {sheet.placements.map((p, i) => (
      <g key={i}>
        <rect x={p.x} y={p.y} width={p.w} height={p.h} fill={colorFor(p.piece.unitCode)} stroke="#5B4636" strokeWidth="4" />
        {p.w > 260 && p.h > 130 && (
          <>
            <text x={p.x + p.w / 2} y={p.y + p.h / 2 - 8} fontSize={Math.min(70, p.h / 3)} textAnchor="middle" fill="#361D13" fontWeight="800">{p.piece.lengthMm}×{p.piece.widthMm}</text>
            <text x={p.x + p.w / 2} y={p.y + p.h / 2 + Math.min(70, p.h / 3)} fontSize={Math.min(52, p.h / 4)} textAnchor="middle" fill="#5B4636">{p.piece.unitCode}</text>
          </>
        )}
      </g>
    ))}
  </svg>
);

export const NestingPanel: React.FC<Props> = ({ bom, onApprove }) => {
  const results = useMemo(() => nestBom(bom), [bom]);
  const [active, setActive] = useState(0);
  const mat: MaterialNesting | undefined = results[Math.min(active, results.length - 1)];

  const totals = results.reduce((s, r) => ({ planned: s.planned + r.sheets.length, estimate: s.estimate + r.estimatedSheets, offcut: s.offcut + r.offcutAreaM2 }), { planned: 0, estimate: 0, offcut: 0 });
  const approved = bom.materialsSummary?.some(m => m.nestedSheetsCount);

  const approve = () => onApprove(results.map(r => ({
    materialCode: r.materialCode,
    sheets: r.sheets.length,
    offcutAreaSqMeters: r.offcutAreaM2,
    scrapPercentage: Math.round(r.sheets.length > 0 ? (r.wasteAreaM2 / (r.sheets.length * (SHEET_LENGTH_MM * SHEET_WIDTH_MM) / 1_000_000)) * 100 : 0)
  })));

  if (results.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-black text-[#1E110B] flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#C87A38]" /> خطة التقطيع على الألواح (Nesting)
          </h4>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            لوح {SHEET_LENGTH_MM / 10}×{SHEET_WIDTH_MM / 10} سم • سمك المنشار {KERF_MM} مم • تشذيب {TRIM_MM} مم من كل حرف • قطع الثمرة مبتتلفش • قص مستقيم من حرف لحرف (جاهز للمنشار)
          </p>
        </div>
        {approved ? (
          <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-4 h-4" /> خطة التقطيع معتمدة {bom.nestingApprovedAt ? `(${bom.nestingApprovedAt} — ${bom.nestingApprovedBy})` : ''}
          </div>
        ) : (
          <button onClick={approve} className="px-5 py-2.5 rounded-xl bg-[#361D13] hover:bg-[#23120A] text-white font-black text-xs flex items-center gap-1.5 shrink-0 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-[#C87A38]" /> اعتماد خطة التقطيع ({totals.planned} لوح) للتخطيط
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <p className="text-slate-500 font-bold">الألواح حسب خطة التقطيع الفعلية</p>
          <p className="text-2xl font-black text-[#1E110B] font-mono mt-1">{totals.planned} <span className="text-xs">لوح</span></p>
          <p className="text-[11px] text-slate-500 mt-1">التقدير بالمساحة + 12% هالك كان: <span className="font-mono font-bold">{totals.estimate}</span> لوح</p>
        </div>
        <div className={`p-4 rounded-2xl border ${totals.planned > totals.estimate ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <p className="text-slate-600 font-bold">الفرق عن التقدير</p>
          <p className={`text-2xl font-black font-mono mt-1 ${totals.planned > totals.estimate ? 'text-amber-800' : 'text-emerald-700'}`}>
            {totals.planned > totals.estimate ? '+' : ''}{totals.planned - totals.estimate} <span className="text-xs">لوح</span>
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            {totals.planned > totals.estimate
              ? 'التقدير بالمساحة كان هيطلب أقل من اللازم، والورشة كانت هتقف مستنية ألواح.'
              : totals.planned < totals.estimate ? 'خطة التقطيع وفّرت ألواح عن التقدير.' : 'خطة التقطيع مطابقة للتقدير.'}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <p className="text-slate-600 font-bold flex items-center gap-1"><Recycle className="w-3.5 h-3.5" /> بواقي صالحة ترجع المخزن</p>
          <p className="text-2xl font-black text-emerald-800 font-mono mt-1">{totals.offcut.toFixed(2)} <span className="text-xs">م²</span></p>
          <p className="text-[11px] text-slate-600 mt-1">قطع أكبر من 30 سم في الاتجاهين، تتسجل في مستودع الفضلات بمقاسها.</p>
        </div>
      </div>

      {/* Material tabs */}
      <div className="flex flex-wrap gap-2">
        {results.map((r, i) => (
          <button key={r.materialCode} onClick={() => setActive(i)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${i === active ? 'bg-[#361D13] text-white border-[#361D13]' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'}`}>
            {r.materialName} <span className="font-mono opacity-80">({r.sheets.length} لوح • {Math.round(r.utilisation * 100)}%)</span>
          </button>
        ))}
      </div>

      {mat && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-4 text-xs text-slate-600">
            <span>عدد القطع: <strong className="font-mono text-slate-900">{mat.piecesCount}</strong></span>
            <span>مساحة القطع: <strong className="font-mono text-slate-900">{mat.partsAreaM2} م²</strong></span>
            <span>نسبة الاستغلال: <strong className="font-mono text-slate-900">{Math.round(mat.utilisation * 100)}%</strong></span>
            <span>بواقي صالحة: <strong className="font-mono text-emerald-700">{mat.offcutAreaM2} م²</strong></span>
            <span>هالك (نشارة وشرايح صغيرة): <strong className="font-mono text-rose-700">{mat.wasteAreaM2} م²</strong></span>
          </div>
          {mat.oversize.length > 0 && (
            <p className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> {mat.oversize.length} قطعة أكبر من اللوح — محتاجة لوح مقاس خاص أو تقسيم: {mat.oversize.map(p => `${p.label} (${p.lengthMm}×${p.widthMm})`).join('، ')}
            </p>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mat.sheets.map(sheet => (
              <div key={sheet.index} className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span>لوح {sheet.index} من {mat.sheets.length} — {sheet.placements.length} قطعة</span>
                  <span className={sheet.utilisation >= 0.8 ? 'text-emerald-700' : 'text-amber-700'}>استغلال {Math.round(sheet.utilisation * 100)}%</span>
                </div>
                <SheetSvg sheet={sheet} />
              </div>
            ))}
          </div>
          {mat.sheets.some(s => s.offcuts.length) && (
            <div className="rounded-xl border border-emerald-200 overflow-hidden">
              <div className="bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-900">قائمة البواقي — {mat.materialName}</div>
              <div className="p-3 flex flex-wrap gap-2 text-xs">
                {mat.sheets.flatMap(s => s.offcuts.map((o, i) => (
                  <span key={`${s.index}-${i}`} className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 font-mono" dir="ltr">
                    {Math.round(o.w)} × {Math.round(o.h)} mm <span className="text-slate-400">(لوح {s.index})</span>
                  </span>
                )))}
              </div>
            </div>
          )}
          <p className="text-[11px] text-slate-400">الألوان حسب الوحدة • المربعات المخططة بالأخضر = بواقي صالحة • الخلفية الرمادية = هالك.</p>
        </div>
      )}
    </div>
  );
};
