// ============================================================================
// Panel nesting (cutting optimisation) for a technical BOM.
//
// Guillotine packing: every cut runs edge to edge across the remaining piece,
// which is exactly how a panel saw works, so the layout is cuttable as drawn.
// Parts with wood grain keep their length along the sheet's 2440 mm side;
// plain parts may be rotated 90°.
// ============================================================================

import type { CuttingPart, TechnicalBOM } from '../types/technicalOffice';
import { resolveCatalogItem, SHEET_AREA_M2, DEFAULT_SHEET_WASTE } from './materialCatalog';

export const SHEET_LENGTH_MM = 2440;
export const SHEET_WIDTH_MM = 1220;
/** Saw blade width. */
export const KERF_MM = 4;
/** Factory edge trimmed off each side of a raw sheet. */
export const TRIM_MM = 10;
/** Smallest leftover worth returning to stock. */
const OFFCUT_MIN_SIDE_MM = 300;
const OFFCUT_MIN_AREA_M2 = 0.12;

export interface NestPiece {
  id: string;
  /** Unit code + part name, e.g. "B-90-SINK • جنب يمين وشمال". */
  label: string;
  unitCode: string;
  partName: string;
  lengthMm: number;
  widthMm: number;
  canRotate: boolean;
}

export interface Placement {
  piece: NestPiece;
  x: number;
  y: number;
  /** Size as laid on the sheet (after any rotation). */
  w: number;
  h: number;
  rotated: boolean;
}

export interface FreeRect { x: number; y: number; w: number; h: number }

export interface NestedSheet {
  index: number;
  placements: Placement[];
  offcuts: FreeRect[];
  usedAreaM2: number;
  utilisation: number;
}

export interface MaterialNesting {
  materialCode: string;
  materialName: string;
  thicknessMm: number;
  piecesCount: number;
  sheets: NestedSheet[];
  /** Parts too large for a single sheet. */
  oversize: NestPiece[];
  partsAreaM2: number;
  /** What the old area + 12% rule would have ordered. */
  estimatedSheets: number;
  utilisation: number;
  wasteAreaM2: number;
  offcutAreaM2: number;
}

/** Flatten a BOM into one piece per physical part, grouped by board material. */
export function piecesByMaterial(bom: TechnicalBOM): Map<string, { name: string; thickness: number; pieces: NestPiece[] }> {
  const groups = new Map<string, { name: string; thickness: number; pieces: NestPiece[] }>();
  bom.units.forEach(unit => {
    const unitQty = unit.quantity || 1;
    unit.cuttingParts.forEach((part: CuttingPart) => {
      const key = resolveCatalogItem(part.materialCode)?.key || part.materialCode;
      const g = groups.get(key) || { name: resolveCatalogItem(key)?.name || part.materialName, thickness: part.thicknessMm, pieces: [] };
      const total = (part.quantity || 1) * unitQty;
      for (let i = 0; i < total; i++) {
        // Lay every part with its long side first; grain parts keep their declared length direction
        const grain = part.grainDirection === 'length' || part.grainDirection === 'width';
        const lengthMm = grain ? (part.grainDirection === 'width' ? part.widthMm : part.lengthMm) : Math.max(part.lengthMm, part.widthMm);
        const widthMm = grain ? (part.grainDirection === 'width' ? part.lengthMm : part.widthMm) : Math.min(part.lengthMm, part.widthMm);
        g.pieces.push({
          id: `${unit.unitCode}-${part.id}-${i + 1}`,
          label: `${unit.unitCode} • ${part.partName}`,
          unitCode: unit.unitCode,
          partName: part.partName,
          lengthMm,
          widthMm,
          canRotate: !grain
        });
      }
      groups.set(key, g);
    });
  });
  return groups;
}

const usableL = SHEET_LENGTH_MM - 2 * TRIM_MM;
const usableW = SHEET_WIDTH_MM - 2 * TRIM_MM;

/** Try to fit a piece into a free rectangle; returns the oriented size or null. */
function orient(piece: NestPiece, r: FreeRect): { w: number; h: number; rotated: boolean } | null {
  const fits = (w: number, h: number) => w <= r.w && h <= r.h;
  const normal = fits(piece.lengthMm, piece.widthMm) ? { w: piece.lengthMm, h: piece.widthMm, rotated: false } : null;
  const turned = piece.canRotate && fits(piece.widthMm, piece.lengthMm) ? { w: piece.widthMm, h: piece.lengthMm, rotated: true } : null;
  if (normal && turned) {
    // Prefer the orientation that leaves the smaller short-side gap
    const gapN = Math.min(r.w - normal.w, r.h - normal.h);
    const gapT = Math.min(r.w - turned.w, r.h - turned.h);
    return gapT < gapN ? turned : normal;
  }
  return normal || turned;
}

type SplitRule = 'shorter' | 'longer';
type FitRule = 'area' | 'shortSide';

function packSheet(pieces: NestPiece[], index: number, split: SplitRule, fit: FitRule): { sheet: NestedSheet; rest: NestPiece[] } {
  let free: FreeRect[] = [{ x: TRIM_MM, y: TRIM_MM, w: usableL, h: usableW }];
  const placements: Placement[] = [];
  const rest: NestPiece[] = [];

  pieces.forEach(piece => {
    // Best-area-fit: the free rectangle that wastes the least area
    let best: { i: number; o: { w: number; h: number; rotated: boolean }; score: number } | null = null;
    free.forEach((r, i) => {
      const o = orient(piece, r);
      if (!o) return;
      const score = fit === 'area' ? r.w * r.h - o.w * o.h : Math.min(r.w - o.w, r.h - o.h) * 100000 + Math.max(r.w - o.w, r.h - o.h);
      if (!best || score < best.score) best = { i, o, score };
    });
    if (!best) { rest.push(piece); return; }
    const { i, o } = best as { i: number; o: { w: number; h: number; rotated: boolean } };
    const r = free[i];
    placements.push({ piece, x: r.x, y: r.y, w: o.w, h: o.h, rotated: o.rotated });

    // Guillotine split, accounting for the saw kerf
    const rightW = r.w - o.w - KERF_MM;
    const belowH = r.h - o.h - KERF_MM;
    const horizontalFirst = split === 'shorter' ? rightW < belowH : rightW >= belowH;
    const next: FreeRect[] = [];
    if (horizontalFirst) {
      if (rightW > 0) next.push({ x: r.x + o.w + KERF_MM, y: r.y, w: rightW, h: o.h });
      if (belowH > 0) next.push({ x: r.x, y: r.y + o.h + KERF_MM, w: r.w, h: belowH });
    } else {
      if (rightW > 0) next.push({ x: r.x + o.w + KERF_MM, y: r.y, w: rightW, h: r.h });
      if (belowH > 0) next.push({ x: r.x, y: r.y + o.h + KERF_MM, w: o.w, h: belowH });
    }
    free = [...free.slice(0, i), ...free.slice(i + 1), ...next];
  });

  return { sheet: finishSheet(index, placements, free), rest };
}

function finishSheet(index: number, placements: Placement[], free: FreeRect[]): NestedSheet {
  const usedAreaM2 = placements.reduce((s, p) => s + (p.w * p.h) / 1_000_000, 0);
  const offcuts = free
    .filter(r => Math.min(r.w, r.h) >= OFFCUT_MIN_SIDE_MM && (r.w * r.h) / 1_000_000 >= OFFCUT_MIN_AREA_M2)
    .sort((a, b) => b.w * b.h - a.w * a.h);
  return { index, placements, offcuts, usedAreaM2, utilisation: usedAreaM2 / SHEET_AREA_M2 };
}

/** Strategy A: free-form guillotine packing, sheet by sheet. */
function packGuillotine(pieces: NestPiece[], split: SplitRule, fit: FitRule): NestedSheet[] {
  const sheets: NestedSheet[] = [];
  let queue = pieces;
  while (queue.length > 0 && sheets.length < 200) {
    const { sheet, rest } = packSheet(queue, sheets.length + 1, split, fit);
    if (sheet.placements.length === 0) break;
    sheets.push(sheet);
    queue = rest;
  }
  return sheets;
}

/**
 * Strategy B: two-stage cutting, the way a panel saw is run in a cabinet shop.
 * Rip the sheet into strips across its width (one strip per part depth), then
 * cross-cut each strip into parts. Narrow parts can share a strip of a wider one.
 */
function packStrips(pieces: NestPiece[], shareRatio: number): NestedSheet[] {
  interface Strip { width: number; used: number; items: { piece: NestPiece; len: number; across: number; rotated: boolean }[] }
  const strips: Strip[] = [];
  const oriented = pieces.map(p => {
    // Across the strip goes the narrow side, unless the grain fixes the direction
    if (!p.canRotate || p.lengthMm >= p.widthMm) return { piece: p, len: p.lengthMm, across: p.widthMm, rotated: false };
    return { piece: p, len: p.widthMm, across: p.lengthMm, rotated: true };
  }).sort((a, b) => b.across - a.across || b.len - a.len);

  oriented.forEach(o => {
    let best: Strip | null = null;
    strips.forEach(st => {
      if (st.width < o.across || st.used + o.len > usableL) return;
      if (st.width - o.across > o.across * shareRatio) return; // too much strip wasted beside a narrow part
      if (!best || st.width - o.across < best.width - o.across) best = st;
    });
    const target: Strip = best || { width: o.across, used: 0, items: [] };
    if (!best) strips.push(target);
    target.items.push(o);
    target.used += o.len + KERF_MM;
  });

  // First-fit decreasing of strips onto sheets across the 1220 side
  const sheetsStrips: { strips: Strip[]; used: number }[] = [];
  [...strips].sort((a, b) => b.width - a.width).forEach(st => {
    const sh = sheetsStrips.find(s => s.used + st.width <= usableW);
    if (sh) { sh.strips.push(st); sh.used += st.width + KERF_MM; } else sheetsStrips.push({ strips: [st], used: st.width + KERF_MM });
  });

  return sheetsStrips.map((sh, idx) => {
    const placements: Placement[] = [];
    const free: FreeRect[] = [];
    let y = TRIM_MM;
    sh.strips.forEach(st => {
      let x = TRIM_MM;
      st.items.forEach(it => {
        placements.push({ piece: it.piece, x, y, w: it.len, h: it.across, rotated: it.rotated });
        if (st.width - it.across - KERF_MM > 0) free.push({ x, y: y + it.across + KERF_MM, w: it.len, h: st.width - it.across - KERF_MM });
        x += it.len + KERF_MM;
      });
      if (TRIM_MM + usableL - x > 0) free.push({ x, y, w: TRIM_MM + usableL - x, h: st.width });
      y += st.width + KERF_MM;
    });
    if (TRIM_MM + usableW - y > 0) free.push({ x: TRIM_MM, y, w: usableL, h: TRIM_MM + usableW - y });
    return finishSheet(idx + 1, placements, free);
  });
}

const sheetScore = (sheets: NestedSheet[]) =>
  // Fewer sheets first; then the emptiest last sheet (its leftover is a reusable offcut)
  sheets.length * 10 + (sheets.length ? sheets[sheets.length - 1].utilisation : 0);

export function nestMaterial(materialCode: string, materialName: string, thicknessMm: number, pieces: NestPiece[]): MaterialNesting {
  const fitsAtAll = (p: NestPiece) =>
    (p.lengthMm <= usableL && p.widthMm <= usableW) || (p.canRotate && p.widthMm <= usableL && p.lengthMm <= usableW);
  const oversize = pieces.filter(p => !fitsAtAll(p));
  const fitting = pieces.filter(fitsAtAll);

  // Run several orderings and both cutting strategies, keep the best layout
  const orders: ((a: NestPiece, b: NestPiece) => number)[] = [
    (a, b) => b.lengthMm * b.widthMm - a.lengthMm * a.widthMm,
    (a, b) => b.lengthMm - a.lengthMm || b.widthMm - a.widthMm,
    (a, b) => b.widthMm - a.widthMm || b.lengthMm - a.lengthMm,
    (a, b) => (b.lengthMm + b.widthMm) - (a.lengthMm + a.widthMm)
  ];
  let sheets: NestedSheet[] = packStrips(fitting, 0.35);
  [0, 0.15, 0.6, 1.5].forEach(ratio => { const c = packStrips(fitting, ratio); if (sheetScore(c) < sheetScore(sheets)) sheets = c; });
  orders.forEach(order => {
    const sorted = [...fitting].sort(order);
    (['shorter', 'longer'] as SplitRule[]).forEach(split => {
      (['area', 'shortSide'] as FitRule[]).forEach(fit => {
        const candidate = packGuillotine(sorted, split, fit);
        if (sheetScore(candidate) < sheetScore(sheets)) sheets = candidate;
      });
    });
  });
  sheets = sheets.map((s, i) => ({ ...s, index: i + 1 }));

  const partsAreaM2 = pieces.reduce((s, p) => s + (p.lengthMm * p.widthMm) / 1_000_000, 0);
  const totalSheetArea = sheets.length * SHEET_AREA_M2;
  const offcutAreaM2 = sheets.reduce((s, sh) => s + sh.offcuts.reduce((a, o) => a + (o.w * o.h) / 1_000_000, 0), 0);
  const used = sheets.reduce((s, sh) => s + sh.usedAreaM2, 0);
  return {
    materialCode,
    materialName,
    thicknessMm,
    piecesCount: pieces.length,
    sheets,
    oversize,
    partsAreaM2: Math.round(partsAreaM2 * 100) / 100,
    estimatedSheets: partsAreaM2 > 0 ? Math.ceil((partsAreaM2 * (1 + DEFAULT_SHEET_WASTE)) / SHEET_AREA_M2) : 0,
    utilisation: totalSheetArea > 0 ? used / totalSheetArea : 0,
    wasteAreaM2: Math.round((totalSheetArea - used - offcutAreaM2) * 100) / 100,
    offcutAreaM2: Math.round(offcutAreaM2 * 100) / 100
  };
}

/** Nest every board material of a BOM. */
export function nestBom(bom: TechnicalBOM): MaterialNesting[] {
  return Array.from(piecesByMaterial(bom).entries())
    .map(([code, g]) => nestMaterial(code, g.name, g.thickness, g.pieces))
    .sort((a, b) => b.partsAreaM2 - a.partsAreaM2);
}
