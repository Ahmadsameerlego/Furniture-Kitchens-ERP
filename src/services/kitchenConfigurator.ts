// ============================================================================
// Kitchen configurator engine
//
// 1. layoutKitchen()      walls + options  -> cabinet units placed along each wall
// 2. explodeToBomUnits()  units            -> cutting parts + hardware (technical BOM)
// 3. priceConfiguration() units + options  -> quotation lines, breakdown and margin
//
// Customers are quoted by the linear meter (how the Egyptian market buys kitchens);
// the cost side comes from the exploded panels and hardware, so the margin shown on
// the quotation is the margin the factory will actually make.
// ============================================================================

import type {
  CabinetRole,
  CabinetZone,
  ConfiguratorOptions,
  ConfiguratorWall,
  ConfiguredUnit,
  FinishTier,
  KitchenConfiguration,
  KitchenLayout,
  ConfiguratorMetrics
} from '../types/configurator';
import type { QuotationBreakdown, QuotationLineItem, ProjectMeasurement } from '../types/erp';
import type { CuttingPart, HardwarePart, TechnicalBOMUnit } from '../types/technicalOffice';
import { resolveCatalogItem, SHEET_AREA_M2, DEFAULT_SHEET_WASTE } from './materialCatalog';

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

export const VAT_RATE = 0.14;

const STANDARD_WIDTHS = [90, 80, 60, 45, 40, 30];
const BASE_HEIGHT = 72;
const LEG_HEIGHT = 10;
const BACKSPLASH_GAP = 63; // worktop to underside of wall cabinets
const BASE_DEPTH = 60;
const WALL_DEPTH = 35;
const CORNER_WIDTH = 100;
const HOOD_HEIGHT = 40;

export interface FrontOption {
  key: string;
  label: string;
  /** Selling price per linear meter by cabinet zone (EGP, before VAT). */
  pricePerMeter: Record<CabinetZone, number>;
  woodGrain: boolean;
  painted: boolean;
}

export const FRONT_OPTIONS: FrontOption[] = [
  { key: 'HPL-WHITE-MATT', label: 'HPL أبيض مط', pricePerMeter: { base: 10500, wall: 8000, tall: 18000 }, woodGrain: false, painted: false },
  { key: 'HPL-812-BEIGE', label: 'HPL تركي 812 بيج مط', pricePerMeter: { base: 10500, wall: 8000, tall: 18000 }, woodGrain: false, painted: false },
  { key: 'HPL-GRAPHITE', label: 'HPL رمادي جرافيت مط', pricePerMeter: { base: 11000, wall: 8400, tall: 19000 }, woodGrain: false, painted: false },
  { key: 'HPL-OAK-IND', label: 'HPL خشابي أرو هندي', pricePerMeter: { base: 11000, wall: 8400, tall: 19000 }, woodGrain: true, painted: false },
  { key: 'ACRYLIC-WHITE-GLOSS', label: 'أكريليك أبيض لامع', pricePerMeter: { base: 12200, wall: 9000, tall: 20500 }, woodGrain: false, painted: false },
  { key: 'LACQUER-MDF-18', label: 'بولي لاك (دهان لاكيه)', pricePerMeter: { base: 13200, wall: 10000, tall: 23000 }, woodGrain: false, painted: true },
  { key: 'OAK-PLYWOOD-18', label: 'قشرة أرو طبيعي', pricePerMeter: { base: 15500, wall: 11800, tall: 26500 }, woodGrain: true, painted: true }
];

export const CARCASS_OPTIONS = [
  { key: 'MDF-WHITE-18', label: 'MDF ملامين أبيض 18مم اسباني' }
];

export const COUNTERTOP_OPTIONS = [
  { key: 'MARBLE-GALAXY', label: 'رخام جالاكسي أسود اسباني', sellPerMeter: 4800 },
  { key: 'QUARTZ-WHITE', label: 'كوارتز أسباني أبيض', sellPerMeter: 6900 }
];

/** Selling price of extras (EGP, before VAT). Cost comes from the material catalog. */
const EXTRA_SELL: Record<string, number> = {
  'CORNER-MAGIC': 9500,
  'BOTTLE-PULLOUT-30': 2800,
  'BLUM-AVENTOS-HF': 6200,
  'LED-PROFILE': 650,
  'HANDLE-GOLA-BLACK': 480
};
const EXTRA_CODES = new Set(Object.keys(EXTRA_SELL));

/** Workshop labour per unit (cut, edge, drill, assemble), EGP. */
const LABOUR_PER_UNIT: Record<CabinetZone, number> = { base: 950, wall: 750, tall: 1600 };
/** Factory overhead (power, rent, machine depreciation) on direct cost. */
const OVERHEAD_RATE = 0.12;
const PAINT_COST_PER_M2 = 450;
const INSTALL_COST_PER_M = 220;
const INSTALL_SELL_PER_M = 400;

export const TIER_PRESETS: Record<FinishTier, { label: string; description: string; options: Partial<ConfiguratorOptions> }> = {
  economy: {
    label: 'اقتصادي',
    description: 'HPL مط + رخام جالاكسي + مقابض ألومنيوم',
    options: { frontKey: 'HPL-WHITE-MATT', countertopKey: 'MARBLE-GALAXY', handleStyle: 'bar', liftUpWallDoors: false, ledUnderWallUnits: false }
  },
  standard: {
    label: 'متوسط',
    description: 'أكريليك لامع + رخام جالاكسي + جولا + ليد',
    options: { frontKey: 'ACRYLIC-WHITE-GLOSS', countertopKey: 'MARBLE-GALAXY', handleStyle: 'gola', liftUpWallDoors: false, ledUnderWallUnits: true }
  },
  premium: {
    label: 'فاخر',
    description: 'بولي لاك + كوارتز + جولا + قلابات Aventos + ليد',
    options: { frontKey: 'LACQUER-MDF-18', countertopKey: 'QUARTZ-WHITE', handleStyle: 'gola', liftUpWallDoors: true, ledUnderWallUnits: true }
  }
};

export const LAYOUT_LABELS: Record<KitchenLayout, { label: string; walls: number }> = {
  straight: { label: 'مستقيم (حائط واحد)', walls: 1 },
  l_shape: { label: 'حرف L (حائطين)', walls: 2 },
  u_shape: { label: 'حرف U (3 حوائط)', walls: 3 },
  parallel: { label: 'متوازي (حائطين متقابلين)', walls: 2 }
};

const ROLE_LABELS: Record<CabinetRole, string> = {
  standard: 'وحدة',
  sink: 'وحدة حوض',
  hob: 'وحدة بوتاجاز بأدراج',
  drawers: 'وحدة أدراج',
  dishwasher: 'وش غسالة أطباق',
  corner: 'وحدة ركنة',
  bottle: 'سلة زجاجات',
  filler: 'فيلر تقفيل',
  hood: 'وحدة شفاط',
  fridge: 'دولاب ثلاجة',
  oven: 'دولاب فرن ومايكرويف',
  pantry: 'دولاب مؤن',
  island: 'وحدة جزيرة بأدراج'
};

const ZONE_LABELS: Record<CabinetZone, string> = { base: 'سفلية', wall: 'علوية', tall: 'طولية' };

export const frontOption = (key: string) => FRONT_OPTIONS.find(f => f.key === key) || FRONT_OPTIONS[0];
export const countertopOption = (key: string) => COUNTERTOP_OPTIONS.find(c => c.key === key) || COUNTERTOP_OPTIONS[0];

export const defaultOptions = (tier: FinishTier = 'standard'): ConfiguratorOptions => ({
  carcassKey: 'MDF-WHITE-18',
  frontKey: 'ACRYLIC-WHITE-GLOSS',
  countertopKey: 'MARBLE-GALAXY',
  handleStyle: 'gola',
  liftUpWallDoors: false,
  ledUnderWallUnits: true,
  islandLengthCm: 0,
  includeInstallation: true,
  siteFloor: 3,
  discountPercent: 0,
  ...TIER_PRESETS[tier].options
});

// ---------------------------------------------------------------------------
// Reading the sales measurement
// ---------------------------------------------------------------------------

const toCm = (value: number, unit: string) => (unit === 'mm' ? value / 10 : unit === 'meter' ? value * 100 : value);

/**
 * Walls and ceiling height from the latest measurement version.
 * Wall rows are recognised by "جدار" / "حائط" in their name; hints in the name or notes
 * (حوض، بوتاجاز، شفاط، غسالة، ثلاجة، فرن، شباك) pre-tick the matching options.
 */
export function wallsFromMeasurement(measurement?: ProjectMeasurement): { walls: ConfiguratorWall[]; ceilingHeightCm: number } {
  const items = measurement?.items || [];
  const wallItems = items.filter(i => /جدار|حائط|حيطة/.test(i.name));
  const ceiling = items.find(i => /سقف/.test(i.name));
  const windowItem = items.find(i => /شباك|نافذة/.test(i.name));
  const windowWidth = windowItem ? (Number((windowItem.notes || '').match(/عرض\D*(\d+)/)?.[1]) || 100) : 0;

  const walls = wallItems.slice(0, 3).map((item, idx): ConfiguratorWall => {
    const text = `${item.name} ${item.notes || ''}`;
    return {
      id: `wall-${idx + 1}`,
      name: item.name,
      lengthCm: Math.round(toCm(item.value, item.unit)),
      hasSink: /حوض|صرف/.test(text),
      hasHob: /بوتاجاز|شفاط|مسطح/.test(text),
      hasDishwasher: /غسالة/.test(text),
      hasFridge: /ثلاجة/.test(text),
      hasOvenTower: /فرن/.test(text),
      windowWidthCm: 0
    };
  });

  if (walls.length === 0) {
    walls.push(
      { id: 'wall-1', name: 'الحائط A', lengthCm: 400, hasSink: true, hasHob: false, hasDishwasher: false, hasFridge: false, hasOvenTower: false, windowWidthCm: 0 },
      { id: 'wall-2', name: 'الحائط B', lengthCm: 300, hasSink: false, hasHob: true, hasDishwasher: false, hasFridge: false, hasOvenTower: false, windowWidthCm: 0 }
    );
  }
  // A window usually sits above the sink
  const sinkWall = walls.find(w => w.hasSink);
  if (sinkWall && windowWidth) sinkWall.windowWidthCm = windowWidth;
  // Make sure the kitchen has at least a sink and a hob somewhere
  if (!walls.some(w => w.hasSink)) walls[0].hasSink = true;
  if (!walls.some(w => w.hasHob)) (walls[1] || walls[0]).hasHob = true;

  return { walls, ceilingHeightCm: ceiling ? Math.round(toCm(ceiling.value, ceiling.unit)) : 270 };
}

export const suggestLayout = (wallCount: number): KitchenLayout =>
  wallCount >= 3 ? 'u_shape' : wallCount === 2 ? 'l_shape' : 'straight';

// ---------------------------------------------------------------------------
// 1. Layout: place units along the walls
// ---------------------------------------------------------------------------

/** Exact fill of a run with standard widths, leaving the smallest possible gap (closed by a filler). */
function fillRun(length: number): { widths: number[]; filler: number } {
  const len = Math.max(0, Math.floor(length));
  if (len < 30) return { widths: [], filler: len };
  const best: (number[] | null)[] = new Array(len + 1).fill(null);
  best[0] = [];
  for (let l = 1; l <= len; l++) {
    for (const w of STANDARD_WIDTHS) {
      const prev = l - w >= 0 ? best[l - w] : null;
      if (prev && (!best[l] || prev.length + 1 < best[l]!.length)) best[l] = [...prev, w];
    }
  }
  for (let l = len; l >= 0; l--) {
    if (best[l]) return { widths: [...best[l]!].sort((a, b) => b - a), filler: len - l };
  }
  return { widths: [], filler: len };
}

interface Heights { wall: number; tall: number; wallBottom: number }

export function cabinetHeights(ceilingHeightCm: number): Heights {
  const wall = ceilingHeightCm >= 275 ? 90 : 72;
  const wallBottom = BASE_HEIGHT + LEG_HEIGHT + 3 + BACKSPLASH_GAP; // 148 cm from floor
  return { wall, tall: wallBottom + wall - LEG_HEIGHT, wallBottom };
}

function unitCode(zone: CabinetZone, role: CabinetRole, width: number, doors: number, drawers: number) {
  const z = zone === 'base' ? 'B' : zone === 'wall' ? 'W' : 'T';
  const suffix: Partial<Record<CabinetRole, string>> = {
    sink: 'SINK', hob: 'HOB', drawers: `${drawers}DR`, dishwasher: 'DW', corner: 'CORNER', bottle: 'BOTTLE',
    filler: 'FILL', hood: 'HOOD', fridge: 'FRIDGE', oven: 'OVEN', pantry: 'PANTRY', island: `ISL-${drawers}DR`
  };
  return `${z}-${width}-${suffix[role] || `${doors}D`}`;
}

function makeUnit(
  wallId: string, zone: CabinetZone, role: CabinetRole, widthCm: number, offsetCm: number,
  heights: Heights, options: ConfiguratorOptions, seq: { n: number }
): ConfiguredUnit {
  const heightCm = zone === 'base' ? BASE_HEIGHT : zone === 'tall' ? heights.tall : role === 'hood' ? HOOD_HEIGHT : heights.wall;
  const depthCm = zone === 'wall' ? WALL_DEPTH : BASE_DEPTH;
  let doors = 0;
  let drawers = 0;
  switch (role) {
    case 'drawers': case 'hob': case 'island': drawers = 3; break;
    case 'sink': doors = widthCm >= 60 ? 2 : 1; break;
    case 'corner': doors = 1; break;
    case 'fridge': doors = 1; break;
    case 'oven': doors = 1; drawers = 1; break;
    case 'pantry': doors = widthCm >= 60 ? 4 : 2; break;
    case 'dishwasher': case 'bottle': case 'filler': break;
    default:
      doors = zone === 'wall' && options.liftUpWallDoors && widthCm >= 80 ? 1 : widthCm >= 60 ? 2 : 1;
  }
  seq.n += 1;
  const width = Math.round(widthCm);
  const label = role === 'standard'
    ? `وحدة ${ZONE_LABELS[zone]} ${doors === 1 && zone === 'wall' && options.liftUpWallDoors && width >= 80 ? 'قلاب' : `${doors} ضلفة`} ${width} سم`
    : `${ROLE_LABELS[role]} ${width} سم`;
  return {
    id: `u-${seq.n}`,
    wallId,
    zone,
    role,
    code: unitCode(zone, role, width, doors, drawers),
    name: label,
    widthCm: width,
    heightCm,
    depthCm,
    doors,
    drawers,
    offsetCm: Math.round(offsetCm)
  };
}

export interface LayoutResult {
  units: ConfiguredUnit[];
  metrics: ConfiguratorMetrics;
  warnings: string[];
}

export function layoutKitchen(
  layout: KitchenLayout,
  wallsInput: ConfiguratorWall[],
  options: ConfiguratorOptions,
  ceilingHeightCm: number
): LayoutResult {
  const warnings: string[] = [];
  const heights = cabinetHeights(ceilingHeightCm);
  const walls = wallsInput.slice(0, LAYOUT_LABELS[layout].walls);
  const seq = { n: 0 };
  const units: ConfiguredUnit[] = [];
  let drawerUnitPlaced = false;
  let bottlePlaced = false;

  if (ceilingHeightCm < heights.wallBottom + heights.wall) {
    warnings.push(`ارتفاع السقف ${ceilingHeightCm} سم أقل من المطلوب للوحدات العلوية — راجع المقاس.`);
  }

  walls.forEach((wall, idx) => {
    // Corner handling: the wall that "owns" a corner ends with a corner unit; the next wall
    // loses the first 60 cm (base depth) and 35 cm (wall-unit depth) to it.
    const ownsCorner = (layout === 'l_shape' && idx === 0) || (layout === 'u_shape' && idx < 2);
    const deadBase = (layout === 'l_shape' && idx === 1) || (layout === 'u_shape' && idx > 0) ? BASE_DEPTH : 0;
    const deadWall = deadBase ? WALL_DEPTH : 0;

    // ---- Base run ----
    let cursor = deadBase;
    const talls: ConfiguredUnit[] = [];
    if (wall.hasFridge) { talls.push(makeUnit(wall.id, 'tall', 'fridge', 90, cursor, heights, options, seq)); cursor += 90; }
    if (wall.hasOvenTower) { talls.push(makeUnit(wall.id, 'tall', 'oven', 60, cursor, heights, options, seq)); cursor += 60; }
    const tallEnd = cursor;
    units.push(...talls);

    const runEnd = wall.lengthCm - (ownsCorner ? CORNER_WIDTH : 0);
    const fixedBase: { role: CabinetRole; width: number }[] = [];
    if (wall.hasSink) fixedBase.push({ role: 'sink', width: 90 });
    if (wall.hasDishwasher) fixedBase.push({ role: 'dishwasher', width: 60 });
    const fixedWidth = fixedBase.reduce((s, f) => s + f.width, 0);
    let free = runEnd - tallEnd - fixedWidth;
    const hobWidth = wall.hasHob ? (free >= 210 ? 90 : 60) : 0;
    free -= hobWidth;
    const wantsDrawers = !drawerUnitPlaced && free >= 120;
    if (wantsDrawers) { free -= 60; drawerUnitPlaced = true; }

    if (free < 0) {
      warnings.push(`${wall.name}: الطول ${wall.lengthCm} سم لا يكفي للأجهزة المطلوبة عليه — تم تقليل الوحدات.`);
      free = 0;
    }
    const fill = fillRun(free);
    const half = Math.ceil(fill.widths.length / 2);
    const sequence: { role: CabinetRole; width: number }[] = [
      ...(wantsDrawers ? [{ role: 'drawers' as CabinetRole, width: 60 }] : []),
      ...fixedBase,
      ...fill.widths.slice(0, half).map(w => ({ role: 'standard' as CabinetRole, width: w })),
      ...(hobWidth ? [{ role: 'hob' as CabinetRole, width: hobWidth }] : []),
      ...fill.widths.slice(half).map(w => ({ role: 'standard' as CabinetRole, width: w })),
      ...(fill.filler >= 3 ? [{ role: 'filler' as CabinetRole, width: fill.filler }] : [])
    ];
    let pos = tallEnd;
    let hobOffset = -1;
    let sinkOffset = -1;
    sequence.forEach(item => {
      if (pos + item.width > runEnd + 0.5) return;
      let role = item.role;
      if (role === 'standard' && item.width === 30 && !bottlePlaced) { role = 'bottle'; bottlePlaced = true; }
      if (role === 'hob') hobOffset = pos;
      if (role === 'sink') sinkOffset = pos;
      units.push(makeUnit(wall.id, 'base', role, item.width, pos, heights, options, seq));
      pos += item.width;
    });
    if (ownsCorner) {
      units.push(makeUnit(wall.id, 'base', 'corner', CORNER_WIDTH, runEnd, heights, options, seq));
    }

    // ---- Wall-cabinet run: blocked above tall units, a window and the hood ----
    const blocked: { from: number; to: number; role?: CabinetRole }[] = [];
    if (hobOffset >= 0) blocked.push({ from: hobOffset, to: hobOffset + hobWidth, role: 'hood' });
    if (wall.windowWidthCm > 0) {
      const centre = sinkOffset >= 0 ? sinkOffset + 45 : (tallEnd + wall.lengthCm) / 2;
      blocked.push({ from: Math.max(tallEnd, centre - wall.windowWidthCm / 2), to: Math.min(wall.lengthCm, centre + wall.windowWidthCm / 2) });
    }
    blocked.sort((a, b) => a.from - b.from);
    const wallStart = Math.max(tallEnd, deadWall);
    let wpos = wallStart;
    const placeFill = (from: number, to: number) => {
      const f = fillRun(to - from);
      let p = from;
      f.widths.forEach(w => { units.push(makeUnit(wall.id, 'wall', 'standard', w, p, heights, options, seq)); p += w; });
      if (f.filler >= 3) units.push(makeUnit(wall.id, 'wall', 'filler', f.filler, p, heights, options, seq));
    };
    blocked.forEach(b => {
      if (b.from > wpos) placeFill(wpos, b.from);
      if (b.role === 'hood') units.push(makeUnit(wall.id, 'wall', 'hood', b.to - b.from, b.from, heights, options, seq));
      wpos = Math.max(wpos, b.to);
    });
    if (wall.lengthCm > wpos) placeFill(wpos, wall.lengthCm);
  });

  // ---- Island ----
  if (options.islandLengthCm >= 60) {
    const f = fillRun(options.islandLengthCm);
    let p = 0;
    f.widths.forEach(w => { units.push(makeUnit('island', 'base', w >= 60 ? 'island' : 'standard', w, p, heights, options, seq)); p += w; });
    if (f.filler >= 3) units.push(makeUnit('island', 'base', 'filler', f.filler, p, heights, options, seq));
  }

  if (!units.some(u => u.role === 'sink')) warnings.push('لا توجد وحدة حوض — حدد الحائط اللي عليه الحوض.');
  if (!units.some(u => u.role === 'hob')) warnings.push('لا توجد وحدة بوتاجاز — حدد الحائط اللي عليه البوتاجاز.');

  return { units, metrics: computeMetrics(units, options), warnings };
}

export function computeMetrics(units: ConfiguredUnit[], options: ConfiguratorOptions): ConfiguratorMetrics {
  const meters = (zone: CabinetZone) => Math.round(units.filter(u => u.zone === zone).reduce((s, u) => s + u.widthCm, 0)) / 100;
  const baseMeters = meters('base');
  return {
    baseMeters,
    wallMeters: meters('wall'),
    tallMeters: meters('tall'),
    countertopMeters: Math.round((baseMeters + (options.islandLengthCm >= 60 ? 0.2 : 0)) * 100) / 100,
    unitsCount: units.filter(u => u.role !== 'filler').length,
    doorsCount: units.reduce((s, u) => s + u.doors, 0),
    drawersCount: units.reduce((s, u) => s + u.drawers, 0)
  };
}

export function buildConfiguration(params: {
  layout: KitchenLayout;
  tier: FinishTier;
  walls: ConfiguratorWall[];
  options: ConfiguratorOptions;
  ceilingHeightCm: number;
  units: ConfiguredUnit[];
  sourceMeasurementVersion?: number;
}): KitchenConfiguration {
  return {
    layout: params.layout,
    tier: params.tier,
    ceilingHeightCm: params.ceilingHeightCm,
    walls: params.walls.slice(0, LAYOUT_LABELS[params.layout].walls),
    options: params.options,
    units: params.units,
    metrics: computeMetrics(params.units, params.options),
    sourceMeasurementVersion: params.sourceMeasurementVersion,
    generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
}

// ---------------------------------------------------------------------------
// 2. Explosion: units -> cutting parts + hardware
// ---------------------------------------------------------------------------

const EDGE = 'PVC 2mm';

function part(
  id: string, name: string, key: string, lengthMm: number, widthMm: number, thicknessMm: number,
  quantity: number, grain: CuttingPart['grainDirection'], edges: (keyof NonNullable<CuttingPart['edgeBanding']>)[]
): CuttingPart {
  const item = resolveCatalogItem(key);
  const edgeBanding: CuttingPart['edgeBanding'] = {};
  edges.forEach(e => { edgeBanding[e] = EDGE; });
  return {
    id,
    partName: name,
    materialId: item?.key || key,
    materialCode: item?.key || key,
    materialName: item?.name || key,
    lengthMm: Math.round(lengthMm),
    widthMm: Math.round(widthMm),
    thicknessMm,
    quantity,
    grainDirection: grain,
    edgeBanding: edges.length ? edgeBanding : undefined,
    totalCostEstimate: Math.round(((lengthMm * widthMm * quantity) / 1_000_000) * (1 + DEFAULT_SHEET_WASTE) / SHEET_AREA_M2 * (item?.unitCost || 1500))
  };
}

function hw(id: string, key: string, quantity: number): HardwarePart {
  const item = resolveCatalogItem(key);
  return {
    id,
    itemId: item?.key || key,
    itemCode: item?.key || key,
    itemName: item?.name || key,
    quantity: Math.round(quantity * 100) / 100,
    unit: item?.unit || 'قطعة',
    unitCostEstimate: item?.unitCost,
    totalCostEstimate: item ? Math.round(item.unitCost * quantity) : undefined
  };
}

const hingesFor = (doorHeightMm: number) => (doorHeightMm > 1500 ? 4 : doorHeightMm > 900 ? 3 : 2);

/** Panels and hardware for a single configured unit. */
export function explodeUnit(unit: ConfiguredUnit, options: ConfiguratorOptions): { parts: CuttingPart[]; hardware: HardwarePart[] } {
  const W = unit.widthCm * 10;
  const H = unit.heightCm * 10;
  const D = unit.zone === 'wall' ? 320 : 560;
  const T = 18;
  const C = options.carcassKey;
  const F = options.frontKey;
  const fGrain: CuttingPart['grainDirection'] = frontOption(F).woodGrain ? 'length' : 'none';
  const p: CuttingPart[] = [];
  const h: HardwarePart[] = [];
  const id = (s: string) => `${unit.id}-${s}`;
  const inner = W - 2 * T;
  const liftUp = unit.zone === 'wall' && unit.role === 'standard' && options.liftUpWallDoors && unit.widthCm >= 80;

  if (unit.role === 'filler') {
    p.push(part(id('fill'), 'فيلر تقفيل', F, H, W, T, 1, fGrain, ['top', 'bottom']));
    return { parts: p, hardware: h };
  }
  if (unit.role === 'dishwasher') {
    p.push(part(id('dwf'), 'وش غسالة أطباق', F, H - 4, W - 4, T, 1, fGrain, ['top', 'bottom', 'left', 'right']));
    h.push(hw(id('dwk'), 'DW-DOOR-KIT', 1));
    if (options.handleStyle === 'bar') h.push(hw(id('hdl'), 'HANDLE-BAR-160', 1));
    return { parts: p, hardware: h };
  }

  // ---- Carcass ----
  p.push(part(id('side'), 'جنب يمين وشمال', C, H, D, T, 2, 'none', ['top']));
  p.push(part(id('bot'), unit.role === 'sink' ? 'قاع معالج ضد الرطوبة' : 'قاع', C, inner, D, T, 1, 'none', ['top']));
  if (unit.zone === 'base') p.push(part(id('rail'), 'برنيطة أمامية وخلفية', C, inner, 100, T, 2, 'none', ['top']));
  else p.push(part(id('top'), 'سقف', C, inner, D, T, 1, 'none', ['top']));
  p.push(part(id('back'), 'ظهر HDF', 'HDF-BACK-6', W - 4, H - 4, 6, 1, 'none', []));

  const shelves =
    unit.role === 'pantry' ? 4 :
    unit.role === 'oven' ? 2 :
    unit.role === 'fridge' ? 1 :
    unit.zone === 'wall' && unit.role !== 'hood' ? (H >= 900 ? 2 : 1) :
    unit.role === 'standard' || unit.role === 'corner' ? 1 : 0;
  if (shelves) p.push(part(id('shelf'), 'رف داخلي', C, inner, D - 20, T, shelves, 'none', ['top']));

  // ---- Fronts ----
  const fronts: { name: string; h: number; w: number; qty: number; hinged: boolean }[] = [];
  if (unit.role === 'corner') {
    fronts.push({ name: 'ضلفة ركنة', h: H - 4, w: 446, qty: 1, hinged: true });
    p.push(part(id('blind'), 'تقفيلة الركنة (عمياء)', F, H - 4, W - 450 - 4, T, 1, fGrain, ['left', 'right']));
    h.push(hw(id('magic'), 'CORNER-MAGIC', 1));
  } else if (unit.role === 'bottle') {
    fronts.push({ name: 'وش سلة الزجاجات', h: H - 4, w: W - 4, qty: 1, hinged: false });
    h.push(hw(id('pull'), 'BOTTLE-PULLOUT-30', 1));
  } else if (unit.role === 'fridge') {
    const top = 400;
    fronts.push({ name: 'ضلفة علوية فوق الثلاجة', h: top - 4, w: W - 4, qty: 1, hinged: true });
  } else if (unit.role === 'oven') {
    const drawerFront = 300;
    const niche = 600;
    fronts.push({ name: 'وش درج سفلي', h: drawerFront - 4, w: W - 4, qty: 1, hinged: false });
    fronts.push({ name: 'ضلفة علوية', h: H - drawerFront - niche - 8, w: W - 4, qty: 1, hinged: true });
    h.push(hw(id('tdo'), 'BLUM-TANDEM-500', 1));
  } else if (unit.role === 'pantry') {
    const perDoorW = W / 2 - 3;
    fronts.push({ name: 'ضلفة دولاب مؤن', h: H / 2 - 3, w: perDoorW, qty: 4, hinged: true });
  } else if (unit.drawers > 0) {
    const f1 = Math.round((H - 12) * 0.25);
    const f2 = Math.round((H - 12 - f1) / 2);
    fronts.push({ name: 'وش درج علوي', h: f1, w: W - 4, qty: 1, hinged: false });
    fronts.push({ name: 'وش درج عميق', h: f2, w: W - 4, qty: 2, hinged: false });
    p.push(part(id('dbot'), 'قاع درج', C, W - 75, 470, T, unit.drawers, 'none', []));
    p.push(part(id('dback'), 'ظهر درج', C, W - 87, 160, T, unit.drawers, 'none', ['top']));
    h.push(hw(id('tdm'), 'BLUM-TANDEM-500', unit.drawers));
  } else if (unit.doors > 0) {
    const doorW = unit.doors === 1 ? W - 4 : W / unit.doors - 3;
    fronts.push({ name: liftUp ? 'ضلفة قلاب' : unit.doors === 1 ? 'ضلفة' : 'ضلفة (زوج)', h: H - 4, w: doorW, qty: unit.doors, hinged: !liftUp });
    if (liftUp) h.push(hw(id('avt'), 'BLUM-AVENTOS-HF', 1));
  }

  let hinges = 0;
  let handleCount = 0;
  fronts.forEach((f, i) => {
    p.push(part(id(`f${i}`), f.name, F, f.h, f.w, T, f.qty, fGrain, ['top', 'bottom', 'left', 'right']));
    if (f.hinged) hinges += hingesFor(f.h) * f.qty;
    handleCount += f.qty;
  });
  if (hinges) h.push(hw(id('hng'), 'BLUM-HINGE-110', hinges));

  if (options.handleStyle === 'bar' || unit.zone === 'tall') {
    if (handleCount && !liftUp) h.push(hw(id('hdl'), 'HANDLE-BAR-160', handleCount));
  } else if (unit.zone === 'base') {
    h.push(hw(id('gola'), 'HANDLE-GOLA-BLACK', unit.widthCm / 100));
  }

  if (unit.zone !== 'wall') h.push(hw(id('legs'), 'LEG-ADJ-100', unit.widthCm >= 80 ? 6 : 4));
  if (unit.zone === 'wall' && options.ledUnderWallUnits && unit.role !== 'hood') h.push(hw(id('led'), 'LED-PROFILE', unit.widthCm / 100));

  return { parts: p, hardware: h };
}

/** Technical-office BOM units: identical cabinets are grouped, plus a worktop line. */
export function explodeToBomUnits(config: KitchenConfiguration): TechnicalBOMUnit[] {
  const groups = new Map<string, { unit: ConfiguredUnit; qty: number }>();
  config.units.forEach(u => {
    const key = `${u.code}|${u.heightCm}`;
    const g = groups.get(key);
    if (g) g.qty += 1; else groups.set(key, { unit: u, qty: 1 });
  });

  const typeOf = (u: ConfiguredUnit): TechnicalBOMUnit['unitType'] =>
    u.role === 'sink' ? 'sink_unit' : u.role === 'corner' ? 'corner_unit' : u.drawers > 0 && u.zone === 'base' ? 'drawer_unit' :
    u.wallId === 'island' ? 'island' : u.zone === 'wall' ? 'upper_cabinet' : u.zone === 'tall' ? 'tall_cabinet' : 'base_cabinet';

  const bomUnits: TechnicalBOMUnit[] = Array.from(groups.values()).map(({ unit, qty }, i) => {
    const { parts, hardware } = explodeUnit(unit, config.options);
    return {
      id: `bom-u-${i + 1}`,
      unitCode: unit.code,
      unitName: unit.name,
      unitType: typeOf(unit),
      widthMm: unit.widthCm * 10,
      heightMm: unit.heightCm * 10,
      depthMm: (unit.zone === 'wall' ? 32 : 56) * 10,
      dimensions: { widthMm: unit.widthCm * 10, heightMm: unit.heightCm * 10, depthMm: (unit.zone === 'wall' ? 32 : 56) * 10 },
      quantity: qty,
      cuttingParts: parts,
      hardwareParts: hardware,
      notes: unit.role === 'sink' ? 'وحدة حوض: سيليكون عزل حول فتحات المواسير' : undefined
    };
  });

  const top = countertopOption(config.options.countertopKey);
  bomUnits.push({
    id: `bom-u-${bomUnits.length + 1}`,
    unitCode: 'TOP-STONE',
    unitName: `سطح ${top.label} (${config.metrics.countertopMeters} م.ط)`,
    quantity: 1,
    cuttingParts: [],
    hardwareParts: [hw('top-stone', top.key, config.metrics.countertopMeters)],
    notes: 'يُقص بالمقاس النهائي بعد تركيب الوحدات السفلية — فتحات الحوض والبوتاجاز حسب الأجهزة'
  });
  return bomUnits;
}

// ---------------------------------------------------------------------------
// 3. Pricing
// ---------------------------------------------------------------------------

export interface CostDetail {
  boardsCost: number;
  edgeCost: number;
  hardwareCost: number;
  labourCost: number;
  paintCost: number;
  overheadCost: number;
}

export interface ConfiguratorPricing {
  lines: QuotationLineItem[];
  breakdown: QuotationBreakdown;
  subtotalSelling: number;
  discountAmount: number;
  netSelling: number;
  vatAmount: number;
  totalWithVat: number;
  totalCost: number;
  profit: number;
  marginPercent: number;
  cost: CostDetail;
  /** Board sheets the factory will consume, by catalog key. */
  sheets: { key: string; name: string; areaM2: number; sheets: number }[];
}

/** Cost of one unit's own panels, edge, hardware (extras excluded) and labour. */
function unitCost(unit: ConfiguredUnit, options: ConfiguratorOptions) {
  const { parts, hardware } = explodeUnit(unit, options);
  let boards = 0;
  let edge = 0;
  let paint = 0;
  const painted = frontOption(options.frontKey).painted;
  parts.forEach(pt => {
    const area = (pt.lengthMm * pt.widthMm * pt.quantity) / 1_000_000;
    const item = resolveCatalogItem(pt.materialCode);
    boards += (area * (1 + DEFAULT_SHEET_WASTE) / SHEET_AREA_M2) * (item?.unitCost || 1500);
    if (pt.edgeBanding) {
      const eb = pt.edgeBanding;
      const mm = (eb.top ? pt.lengthMm : 0) + (eb.bottom ? pt.lengthMm : 0) + (eb.left ? pt.widthMm : 0) + (eb.right ? pt.widthMm : 0);
      edge += (mm * pt.quantity / 1000) * 1.1 * (resolveCatalogItem('PVC-EDGE-2')?.unitCost || 18);
    }
    if (painted && pt.materialCode === options.frontKey) paint += area * PAINT_COST_PER_M2;
  });
  const hardwareCost = hardware
    .filter(x => !EXTRA_CODES.has(x.itemCode))
    .reduce((s, x) => s + (resolveCatalogItem(x.itemCode)?.unitCost || 0) * x.quantity, 0);
  const labour = unit.role === 'filler' ? 50 : unit.role === 'dishwasher' ? 150 : LABOUR_PER_UNIT[unit.zone];
  return { boards, edge, paint, hardwareCost, labour, extras: hardware.filter(x => EXTRA_CODES.has(x.itemCode)) };
}

const round = (n: number) => Math.round(n);
const r2 = (n: number) => Math.round(n * 100) / 100;

export function priceConfiguration(config: KitchenConfiguration): ConfiguratorPricing {
  const { options, metrics } = config;
  const front = frontOption(options.frontKey);
  const top = countertopOption(options.countertopKey);
  const carcass = CARCASS_OPTIONS.find(c => c.key === options.carcassKey) || CARCASS_OPTIONS[0];

  const zoneCost: Record<CabinetZone, number> = { base: 0, wall: 0, tall: 0 };
  const cost: CostDetail = { boardsCost: 0, edgeCost: 0, hardwareCost: 0, labourCost: 0, paintCost: 0, overheadCost: 0 };
  const extrasQty = new Map<string, number>();
  config.units.forEach(u => {
    const c = unitCost(u, options);
    zoneCost[u.zone] += (c.boards + c.edge + c.paint + c.hardwareCost + c.labour) * (1 + OVERHEAD_RATE);
    cost.boardsCost += c.boards;
    cost.edgeCost += c.edge;
    cost.paintCost += c.paint;
    cost.hardwareCost += c.hardwareCost;
    cost.labourCost += c.labour;
    cost.overheadCost += (c.boards + c.edge + c.paint + c.hardwareCost + c.labour) * OVERHEAD_RATE;
    c.extras.forEach(x => extrasQty.set(x.itemCode, (extrasQty.get(x.itemCode) || 0) + x.quantity));
  });

  const lines: QuotationLineItem[] = [];
  const add = (l: Omit<QuotationLineItem, 'id' | 'totalCost' | 'totalSellingPrice'>) => {
    if (l.quantity <= 0) return;
    lines.push({
      ...l,
      id: `cfg-${lines.length + 1}`,
      unitCost: round(l.unitCost),
      unitSellingPrice: round(l.unitSellingPrice),
      totalCost: round(l.unitCost * l.quantity),
      totalSellingPrice: round(l.unitSellingPrice * l.quantity)
    });
  };

  const zoneMeters: Record<CabinetZone, number> = { base: metrics.baseMeters, wall: metrics.wallMeters, tall: metrics.tallMeters };
  (['base', 'wall', 'tall'] as CabinetZone[]).forEach(zone => {
    const m = zoneMeters[zone];
    if (m <= 0) return;
    const count = config.units.filter(u => u.zone === zone && u.role !== 'filler').length;
    add({
      materialName: `وحدات ${ZONE_LABELS[zone]} — ${front.label}`,
      itemType: 'product',
      description: `${count} وحدة • شاسيه ${carcass.label} • ${zone === 'base' ? 'أدراج Blum Tandembox + ' : ''}مفصلات Blum سوفت كلوز`,
      quantity: m,
      unit: 'م.ط',
      unitCost: zoneCost[zone] / m,
      unitSellingPrice: front.pricePerMeter[zone]
    });
  });

  const topCost = resolveCatalogItem(top.key)?.unitCost || 3200;
  add({
    materialName: `سطح ${top.label}`,
    materialId: top.key,
    itemType: 'material',
    description: 'شامل فتحة الحوض والبوتاجاز وتلميع الحرف',
    quantity: metrics.countertopMeters,
    unit: 'م.ط',
    unitCost: topCost,
    unitSellingPrice: top.sellPerMeter
  });

  const extraLabels: Record<string, string> = {
    'CORNER-MAGIC': 'ميكانيزم ركنة ماجيك كورنر',
    'BOTTLE-PULLOUT-30': 'سلة زجاجات سحب 30 سم',
    'BLUM-AVENTOS-HF': 'ميكانيزم قلاب Blum Aventos HF',
    'LED-PROFILE': 'ليد بروفايل تحت الوحدات العلوية',
    'HANDLE-GOLA-BLACK': 'بروفايل جولا ألومنيوم أسود (بدون مقابض)'
  };
  extrasQty.forEach((qty, code) => {
    const item = resolveCatalogItem(code);
    add({
      materialName: extraLabels[code] || item?.name || code,
      materialId: code,
      itemType: 'accessory',
      quantity: r2(qty),
      unit: item?.unit || 'قطعة',
      unitCost: item?.unitCost || 0,
      unitSellingPrice: EXTRA_SELL[code] || 0
    });
  });

  const cabinetMeters = r2(metrics.baseMeters + metrics.wallMeters + metrics.tallMeters);
  if (options.includeInstallation) {
    add({ materialName: 'تركيب وضبط بالموقع', itemType: 'work', description: 'فك وتغليف ونقل داخلي وتركيب وضبط الضلف والأدراج', quantity: cabinetMeters, unit: 'م.ط', unitCost: INSTALL_COST_PER_M, unitSellingPrice: INSTALL_SELL_PER_M });
  }
  const floor = Math.max(0, options.siteFloor || 0);
  add({ materialName: `نقل وتحميل للموقع (الدور ${floor})`, itemType: 'work', quantity: 1, unit: 'نقلة', unitCost: 900 + floor * 100, unitSellingPrice: 1500 + floor * 150 });

  const subtotalSelling = lines.reduce((s, l) => s + l.totalSellingPrice, 0);
  const totalCost = lines.reduce((s, l) => s + l.totalCost, 0);
  const discountAmount = round(subtotalSelling * (Math.max(0, Math.min(30, options.discountPercent || 0)) / 100));
  const netSelling = subtotalSelling - discountAmount;
  const vatAmount = round(netSelling * VAT_RATE);
  const profit = netSelling - totalCost;

  // ---- Official quotation sheet breakdown ----
  const sumBy = (pred: (l: QuotationLineItem) => boolean) => lines.filter(pred).reduce((s, l) => s + l.totalSellingPrice, 0);
  const cabinetsSell = sumBy(l => l.itemType === 'product');
  const extraRow = (code: string) => lines.find(l => l.materialId === code);
  const gola = extraRow('HANDLE-GOLA-BLACK');
  const led = extraRow('LED-PROFILE');
  const topLine = lines.find(l => l.itemType === 'material');
  const install = lines.find(l => l.materialName.startsWith('تركيب'));
  const transport = lines.find(l => l.materialName.startsWith('نقل'));

  const breakdown: QuotationBreakdown = {
    quoteType: 'kitchen',
    specifications: {
      doors: `${front.label}${options.handleStyle === 'gola' ? ' بنظام جولا بدون مقابض' : ' + مقابض ألومنيوم أسود 16 سم'}`,
      carcass: `${carcass.label} — وحدة الحوض معالجة ضد الرطوبة، ظهر HDF 6مم`,
      hinges: 'مفصلات Blum Clip-Top سوفت كلوز 110° + مجاري أدراج Blum Tandembox',
      notes: `${LAYOUT_LABELS[config.layout].label} • ${metrics.unitsCount} وحدة • ${metrics.doorsCount} ضلفة • ${metrics.drawersCount} درج • ارتفاع الوحدات العلوية ${cabinetHeights(config.ceilingHeightCm).wall} سم`
    },
    meterage: {
      baseUnitsMeters: metrics.baseMeters,
      upperUnitsMeters: metrics.wallMeters,
      tallUnitsMeters: metrics.tallMeters,
      totalMeters: cabinetMeters,
      pricePerMeter: cabinetMeters > 0 ? round(cabinetsSell / cabinetMeters) : 0,
      totalPrice: cabinetsSell
    },
    additions: {
      handles: { description: gola ? `بروفايل جولا ${gola.quantity} م.ط` : 'مقابض ألومنيوم 16 سم (مشمولة)', price: gola?.totalSellingPrice || 0 },
      ledProfile: { description: led ? `ليد بروفايل ${led.quantity} م.ط` : 'بدون', price: led?.totalSellingPrice || 0 },
      glassFrames: { description: 'بدون', price: 0 },
      cladding: { description: 'بدون', price: 0 },
      totalPrice: (gola?.totalSellingPrice || 0) + (led?.totalSellingPrice || 0)
    },
    mechanisms: lines
      .filter(l => l.itemType === 'accessory' && l.materialId !== 'HANDLE-GOLA-BLACK' && l.materialId !== 'LED-PROFILE')
      .map(l => ({ id: l.id, name: l.materialName, quantity: l.quantity, unit: l.unit, unitPrice: l.unitSellingPrice, totalPrice: l.totalSellingPrice })),
    accessories: [],
    marble: { typeName: top.label, meters: metrics.countertopMeters, pricePerMeter: top.sellPerMeter, totalPrice: topLine?.totalSellingPrice || 0 },
    otherWorks: install ? [{ id: install.id, name: install.materialName, quantity: install.quantity, unit: install.unit, unitPrice: install.unitSellingPrice, totalPrice: install.totalSellingPrice }] : [],
    logistics: { location: 'موقع العميل', floor: `الدور ${floor}`, totalPrice: transport?.totalSellingPrice || 0 },
    grandTotal: netSelling,
    paymentTerms: { downPaymentPercent: 40, productionPaymentPercent: 40, deliveryPaymentPercent: 20, deliveryDurationDays: '25 - 35 يوم عمل', warrantyYears: 5 }
  };

  // ---- Sheets the factory will cut ----
  const area = new Map<string, number>();
  config.units.forEach(u => explodeUnit(u, options).parts.forEach(pt => {
    area.set(pt.materialCode, (area.get(pt.materialCode) || 0) + (pt.lengthMm * pt.widthMm * pt.quantity) / 1_000_000);
  }));
  const sheets = Array.from(area.entries()).map(([key, a]) => ({
    key,
    name: resolveCatalogItem(key)?.name || key,
    areaM2: r2(a),
    sheets: Math.ceil((a * (1 + DEFAULT_SHEET_WASTE)) / SHEET_AREA_M2)
  }));

  return {
    lines,
    breakdown,
    subtotalSelling,
    discountAmount,
    netSelling,
    vatAmount,
    totalWithVat: netSelling + vatAmount,
    totalCost,
    profit,
    marginPercent: netSelling > 0 ? Math.round((profit / netSelling) * 1000) / 10 : 0,
    cost: {
      boardsCost: round(cost.boardsCost),
      edgeCost: round(cost.edgeCost),
      hardwareCost: round(cost.hardwareCost),
      labourCost: round(cost.labourCost),
      paintCost: round(cost.paintCost),
      overheadCost: round(cost.overheadCost)
    },
    sheets
  };
}

/** Margin below which a discount needs a sales manager's approval. */
export const MIN_MARGIN_PERCENT = 25;
