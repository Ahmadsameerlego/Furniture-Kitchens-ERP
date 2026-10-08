// ============================================================================
// Turns an approved technical BOM into the documents the factory works from:
// aggregated material requirements (one line per material, in purchasable
// units), and a standard station routing (work orders) for the shop floor.
// ============================================================================

import type { ItemMasterCard, Material, ProductionMaterialItem } from '../types/erp';
import type { TechnicalBOM } from '../types/technicalOffice';
import type { WorkCenter, WorkCenterCategory, WorkOrder } from '../types/production';
import { availableStockFor, resolveCatalogItem, sheetsForArea } from './materialCatalog';

export interface MaterialRequirement {
  code: string;
  name: string;
  unit: string;
  category: 'board' | 'hardware' | 'edge' | 'stone' | 'accessory';
  quantity: number;
  unitCost: number;
  available: number;
}

const FALLBACK_BOARD_COST = 1500;

/** Aggregate a BOM into one requirement per material, in sheets / pieces / meters. */
export function aggregateBomRequirements(
  bom: TechnicalBOM,
  itemMasterCards: ItemMasterCard[],
  materials: Material[]
): MaterialRequirement[] {
  const boardArea = new Map<string, { name: string; area: number }>();
  const hardware = new Map<string, { name: string; unit: string; qty: number }>();
  let edgeMeters = 0;

  bom.units.forEach(unit => {
    const unitQty = unit.quantity || 1;
    unit.cuttingParts.forEach(part => {
      const qty = part.quantity * unitQty;
      const prev = boardArea.get(part.materialCode) || { name: part.materialName, area: 0 };
      prev.area += (part.lengthMm * part.widthMm * qty) / 1_000_000;
      boardArea.set(part.materialCode, prev);
      const eb = part.edgeBanding;
      if (eb) {
        const edges = (eb.top ? part.lengthMm : 0) + (eb.bottom ? part.lengthMm : 0) + (eb.left ? part.widthMm : 0) + (eb.right ? part.widthMm : 0);
        edgeMeters += (edges * qty) / 1000;
      }
    });
    unit.hardwareParts.forEach(h => {
      const prev = hardware.get(h.itemCode) || { name: h.itemName, unit: h.unit, qty: 0 };
      prev.qty += h.quantity * unitQty;
      hardware.set(h.itemCode, prev);
    });
  });

  const lines: MaterialRequirement[] = [];
  const summarySheets = new Map((bom.materialsSummary || []).map(m => [m.materialCode, m.estimatedSheetsCount]));
  // An approved cutting plan knows the exact sheet count, so it replaces the area estimate
  const nestedSheets = new Map((bom.materialsSummary || []).filter(m => m.nestedSheetsCount).map(m => [resolveCatalogItem(m.materialCode)?.key || m.materialCode, m.nestedSheetsCount as number]));

  boardArea.forEach((v, code) => {
    const item = resolveCatalogItem(code);
    lines.push({
      code: item?.key || code,
      name: item?.name || v.name,
      unit: 'لوح',
      category: 'board',
      quantity: nestedSheets.get(item?.key || code) ?? Math.max(summarySheets.get(code) || 0, sheetsForArea(v.area)),
      unitCost: item?.unitCost || FALLBACK_BOARD_COST,
      available: item ? availableStockFor(item, itemMasterCards, materials) : 0
    });
  });

  if (edgeMeters > 0) {
    const item = resolveCatalogItem('PVC-EDGE-2')!;
    lines.push({
      code: item.key,
      name: item.name,
      unit: item.unit,
      category: 'edge',
      quantity: Math.ceil(edgeMeters * 1.1),
      unitCost: item.unitCost,
      available: availableStockFor(item, itemMasterCards, materials)
    });
  }

  hardware.forEach((v, code) => {
    const item = resolveCatalogItem(code);
    lines.push({
      code: item?.key || code,
      name: item?.name || v.name,
      unit: item?.unit || v.unit,
      category: item?.category || 'hardware',
      quantity: Math.round(v.qty * 100) / 100,
      unitCost: item?.unitCost || 0,
      available: item ? availableStockFor(item, itemMasterCards, materials) : 0
    });
  });

  return lines;
}

export function toProductionMaterials(productionOrderId: string, lines: MaterialRequirement[]): ProductionMaterialItem[] {
  return lines.map((line, i) => {
    const covered = line.available >= line.quantity;
    return {
      id: `${productionOrderId}-m${i + 1}`,
      productionOrderId,
      materialId: line.code,
      materialName: line.name,
      materialCode: line.code,
      unit: line.unit,
      requiredQuantity: line.quantity,
      reservedQuantity: Math.min(line.available, line.quantity),
      consumedQuantity: 0,
      remainingQuantity: line.quantity,
      estimatedUnitCost: line.unitCost,
      estimatedTotalCost: line.quantity * line.unitCost,
      actualUnitCost: line.unitCost,
      actualTotalCost: 0,
      status: covered ? 'reserved' : 'shortage'
    };
  });
}

const PAINTED_MATERIALS = new Set(['OAK-PLYWOOD-18', 'LACQUER-MDF-18']);

interface RoutingStep {
  category: WorkCenterCategory;
  name: string;
  minutes: number;
  parts: number;
  instructions: string;
}

/** Standard station routing for a bespoke kitchen / wardrobe order. */
export function buildStandardRouting(params: {
  productionOrderId: string;
  productionNumber: string;
  projectId: string;
  projectNumber: string;
  customerName: string;
  startDate: string;
  bom: TechnicalBOM;
  requirements: MaterialRequirement[];
  workCenters: WorkCenter[];
  firstWorkOrderSeq: number;
  blocked: boolean;
}): WorkOrder[] {
  const { bom, requirements } = params;
  const unitCount = bom.units.reduce((s, u) => s + (u.quantity || 1), 0);
  const partCount = bom.units.reduce((s, u) => s + u.cuttingParts.reduce((p, c) => p + c.quantity, 0) * (u.quantity || 1), 0);
  const sheets = requirements.filter(r => r.category === 'board').reduce((s, r) => s + r.quantity, 0);
  const paintedParts = bom.units.reduce((s, u) => s + u.cuttingParts
    .filter(c => PAINTED_MATERIALS.has(resolveCatalogItem(c.materialCode)?.key || ''))
    .reduce((p, c) => p + c.quantity, 0) * (u.quantity || 1), 0);

  const steps: RoutingStep[] = [
    { category: 'cutting_cnc', name: `تقطيع ونيستينج الألواح (${sheets} لوح)`, minutes: Math.max(60, sheets * 12), parts: partCount, instructions: 'الالتزام باتجاه الثمرة الموضح بقائمة التقطيع وترقيم القطع بملصقات الباركود' },
    { category: 'edge_banding', name: 'لزق شريط الحرف PVC وقشاط الحواف', minutes: Math.max(45, partCount * 3), parts: partCount, instructions: 'قشاط الحواف حسب الـ BOM - غراء مقاوم للرطوبة لكبائن الحوض' },
    { category: 'drilling_routing', name: 'تخريم المفصلات ومجاري الأدراج والكامات', minutes: Math.max(30, partCount * 2), parts: partCount, instructions: 'تخريم مفصلات Blum قطر 35مم عمق 12.5مم على نظام 32مم' }
  ];
  if (paintedParts > 0) {
    steps.push({ category: 'paint_finishing', name: `دهان وتشطيب الدلف (${paintedParts} قطعة)`, minutes: paintedParts * 15, parts: paintedParts, instructions: 'سيلر + طبقتين دهان، ومطابقة درجة اللون مع العينة المعتمدة' });
  }
  steps.push(
    { category: 'assembly', name: `تجميع الكبائن وتركيب الإكسسوارات (${unitCount} وحدة)`, minutes: Math.max(60, unitCount * 45), parts: unitCount, instructions: 'فحص استقامة الزوايا 90° وتجربة الأدراج والمفصلات' },
    { category: 'packaging_qc', name: 'الفحص النهائي والتغليف وتكوين الطرود', minutes: Math.max(30, unitCount * 10), parts: unitCount, instructions: 'كل وحدة في طرد مرقم بباركود، ومطابقة الطرود مع قائمة الشحن' }
  );

  const start = new Date(params.startDate);
  return steps.map((step, i) => {
    const wc = params.workCenters.find(w => w.category === step.category);
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const iso = day.toISOString().substring(0, 10);
    return {
      id: `${params.productionOrderId}-wo${i + 1}`,
      workOrderNumber: `WO-${new Date().getFullYear()}-${String(params.firstWorkOrderSeq + i).padStart(4, '0')}`,
      manufacturingOrderId: params.productionOrderId,
      manufacturingOrderNumber: params.productionNumber,
      projectId: params.projectId,
      projectNumber: params.projectNumber,
      customerName: params.customerName,
      sequenceOrder: i + 1,
      operationName: step.name,
      operationCategory: step.category,
      workCenterId: wc?.id || step.category,
      workCenterName: wc?.name || step.name,
      plannedDurationMinutes: step.minutes,
      actualDurationMinutes: 0,
      scheduledStartDate: `${iso} 09:00`,
      scheduledEndDate: `${iso} 17:00`,
      assignedTechnicians: [],
      status: i === 0 ? (params.blocked ? 'blocked' : 'ready') : 'pending',
      progressPercentage: 0,
      partsToProcessCount: step.parts,
      partsCompletedCount: 0,
      cutListReference: i === 0 ? `CUT-${params.projectNumber}-${bom.revisionCode}` : undefined,
      specialInstructions: i === 0 && params.blocked ? 'معلق لحين توريد الخامات الناقصة' : step.instructions
    };
  });
}
