import React, { useMemo } from 'react';
import { X, Printer, Tag } from 'lucide-react';
import type { TechnicalBOM, CuttingPart } from '../../types/technicalOffice';
import { code39Svg } from '../../utils/code39';
import { nestBom } from '../../services/nesting';

interface Props {
  bom: TechnicalBOM;
  projectNumber: string;
  customerName: string;
  onClose: () => void;
}

export interface PartLabel {
  code: string;
  unitCode: string;
  unitName: string;
  partName: string;
  lengthMm: number;
  widthMm: number;
  thicknessMm: number;
  materialName: string;
  edges: string;
  grain: string;
  sheet?: string;
}

const edgeText = (p: CuttingPart) => {
  const eb = p.edgeBanding || {};
  const sides = [eb.top && 'أعلى', eb.bottom && 'أسفل', eb.right && 'يمين', eb.left && 'شمال'].filter(Boolean);
  return sides.length === 4 ? 'قشاط 4 جهات' : sides.length ? `قشاط: ${sides.join(' + ')}` : 'بدون قشاط';
};

/** One label per physical part, numbered in cutting order, with the sheet it is cut from. */
export function buildPartLabels(bom: TechnicalBOM, projectNumber: string): PartLabel[] {
  const sheetOf = new Map<string, string>();
  nestBom(bom).forEach(m => m.sheets.forEach(s => s.placements.forEach(p => sheetOf.set(p.piece.id, `${m.materialName.split(' ')[0]} لوح ${s.index}`))));
  const prefix = projectNumber.replace(/[^0-9]/g, '').slice(-3).padStart(3, '0');
  const labels: PartLabel[] = [];
  let n = 0;
  bom.units.forEach(unit => {
    const unitQty = unit.quantity || 1;
    unit.cuttingParts.forEach(part => {
      const total = (part.quantity || 1) * unitQty;
      for (let i = 0; i < total; i++) {
        n += 1;
        labels.push({
          code: `P${prefix}-${String(n).padStart(4, '0')}`,
          unitCode: unit.unitCode,
          unitName: unit.unitName,
          partName: part.partName,
          lengthMm: part.lengthMm,
          widthMm: part.widthMm,
          thicknessMm: part.thicknessMm,
          materialName: part.materialName,
          edges: edgeText(part),
          grain: part.grainDirection === 'length' ? '↕ ثمرة بالطول' : part.grainDirection === 'width' ? '↔ ثمرة بالعرض' : '',
          sheet: sheetOf.get(`${unit.unitCode}-${part.id}-${i + 1}`)
        });
      }
    });
  });
  return labels;
}

const labelHtml = (l: PartLabel, projectNumber: string, customerName: string) => `
  <div class="label">
    <div class="top"><span>${projectNumber}</span><span>${customerName}</span></div>
    <div class="part">${l.partName}</div>
    <div class="unit">${l.unitCode} — ${l.unitName}</div>
    <div class="dims" dir="ltr">${l.lengthMm} × ${l.widthMm} × ${l.thicknessMm} mm</div>
    <div class="meta"><span>${l.materialName}</span></div>
    <div class="meta"><span>${l.edges}</span><span>${l.grain}</span>${l.sheet ? `<span>${l.sheet}</span>` : ''}</div>
    <div class="bc">${code39Svg(l.code, { height: 30 })}</div>
    <div class="code" dir="ltr">${l.code}</div>
  </div>`;

export const PartLabelsModal: React.FC<Props> = ({ bom, projectNumber, customerName, onClose }) => {
  const labels = useMemo(() => buildPartLabels(bom, projectNumber), [bom, projectNumber]);

  const print = () => {
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    w.document.write(`<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>ملصقات القطع ${projectNumber}</title>
      <style>
        @page { size: A4; margin: 8mm; }
        body { font-family: Cairo, Tajawal, Arial, sans-serif; margin: 0; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; }
        .label { border: 1px dashed #999; padding: 2.5mm 3mm; height: 44mm; box-sizing: border-box; page-break-inside: avoid; font-size: 8.5pt; display: flex; flex-direction: column; gap: 0.6mm; }
        .top { display: flex; justify-content: space-between; font-size: 7pt; color: #555; }
        .part { font-weight: 800; font-size: 10pt; }
        .unit { font-size: 7.5pt; color: #333; }
        .dims { font-weight: 800; font-size: 11pt; text-align: center; }
        .meta { display: flex; gap: 2mm; flex-wrap: wrap; font-size: 7pt; color: #333; }
        .bc { height: 9mm; padding: 0 4mm; } .bc svg { width: 100%; height: 100%; }
        .code { text-align: center; font-family: monospace; font-size: 8pt; letter-spacing: 1px; }
      </style></head><body><div class="grid">${labels.map(l => labelHtml(l, projectNumber, customerName)).join('')}</div>
      <script>window.onload = () => setTimeout(() => window.print(), 300);</script></body></html>`);
    w.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-right">
        <div className="px-6 py-4 bg-[#1E110B] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-[#C87A38]" />
            <div>
              <h3 className="font-black">ملصقات باركود للقطع — {projectNumber}</h3>
              <p className="text-[11px] text-amber-100/80">{labels.length} ملصق (ملصق لكل قطعة) • باركود Code 39 • بيتلزق على القطعة بعد التقطيع مباشرة</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={print} className="px-4 py-2 rounded-xl bg-[#C87A38] hover:bg-[#b06325] font-black text-xs flex items-center gap-1.5"><Printer className="w-4 h-4" /> طباعة كل الملصقات (A4)</button>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center"><X className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="p-5 overflow-y-auto custom-scrollbar">
          <p className="text-xs text-slate-500 mb-3">معاينة أول 12 ملصق. كل ملصق فيه: القطعة والوحدة، والمقاس، والخامة، والقشاط، والثمرة، ورقم اللوح من خطة التقطيع، وباركود القطعة.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {labels.slice(0, 12).map(l => (
              <div key={l.code} className="border border-dashed border-slate-300 rounded-lg p-2.5 text-[11px] space-y-0.5">
                <div className="flex justify-between text-[10px] text-slate-500"><span>{projectNumber}</span><span>{customerName}</span></div>
                <div className="font-black text-sm text-slate-900">{l.partName}</div>
                <div className="text-[10px] text-slate-600">{l.unitCode} — {l.unitName}</div>
                <div className="font-black text-base text-center font-mono" dir="ltr">{l.lengthMm} × {l.widthMm} × {l.thicknessMm} mm</div>
                <div className="text-[10px] text-slate-600">{l.materialName}</div>
                <div className="flex flex-wrap gap-x-2 text-[10px] text-slate-600"><span>{l.edges}</span>{l.grain && <span>{l.grain}</span>}{l.sheet && <span className="font-bold text-[#C87A38]">{l.sheet}</span>}</div>
                <div className="h-8 px-3 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: code39Svg(l.code, { height: 30 }) }} />
                <div className="text-center font-mono text-[10px] tracking-wider" dir="ltr">{l.code}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
