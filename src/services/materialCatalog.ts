// ============================================================================
// Material catalog — one canonical item per physical material.
//
// The original modules each invented their own item codes for the same board
// (e.g. white MDF 18mm is "MDF-WHITE-18" in technical office, "MAT-MDF-W18" in
// procurement, "RAW-MDF-18" in inventory and "MAT-MDF-001" in production).
// Everything that needs to cost, plan or check stock for a material resolves it
// through this catalog first.
// ============================================================================

import type { ItemMasterCard, Material } from '../types/erp';

export type CatalogCategory = 'board' | 'hardware' | 'edge' | 'stone' | 'accessory';

export interface CatalogItem {
  key: string;
  name: string;
  unit: string;
  category: CatalogCategory;
  /** Standard purchase cost in EGP per unit, used for estimates. */
  unitCost: number;
  /** Every code or id other modules use for this material. */
  aliases: string[];
}

/** Standard sheet size 122 × 244 cm. */
export const SHEET_AREA_M2 = 1.22 * 2.44;
/** Default cutting waste applied when converting part area to sheets. */
export const DEFAULT_SHEET_WASTE = 0.12;

export const MATERIAL_CATALOG: CatalogItem[] = [
  { key: 'MDF-WHITE-18', name: 'MDF ملامين أبيض 18مم اسباني', unit: 'لوح', category: 'board', unitCost: 1650, aliases: ['MDF-WHITE-18', 'MAT-MDF-W18', 'RAW-MDF-18', 'MAT-MDF-001', 'mat-1'] },
  { key: 'HPL-OAK-IND', name: 'ألواح HPL خشابي أرو هندي', unit: 'لوح', category: 'board', unitCost: 1400, aliases: ['HPL-OAK-IND', 'MAT-HPL-OAK', 'MAT-HPL-003', 'mat-3'] },
  { key: 'HPL-812-BEIGE', name: 'HPL تركي كود 812 بيج مط', unit: 'لوح', category: 'board', unitCost: 1300, aliases: ['HPL-812-BEIGE', 'RAW-HPL-ROYAL'] },
  { key: 'HPL-WHITE-MATT', name: 'ألواح HPL أبيض مط', unit: 'لوح', category: 'board', unitCost: 1300, aliases: ['HPL-WHITE-MATT', 'MAT-HPL-WHT', 'mat-4'] },
  { key: 'HPL-GRAPHITE', name: 'ألواح HPL رمادي جرافيت مط', unit: 'لوح', category: 'board', unitCost: 1350, aliases: ['HPL-GRAPHITE'] },
  { key: 'ACRYLIC-WHITE-GLOSS', name: 'ألواح أكريليك أبيض لامع', unit: 'لوح', category: 'board', unitCost: 3200, aliases: ['ACRYLIC-WHITE-GLOSS', 'MAT-ACR-WHT', 'mat-9'] },
  { key: 'LACQUER-MDF-18', name: 'MDF خام 18مم للدهان لاكيه', unit: 'لوح', category: 'board', unitCost: 1450, aliases: ['LACQUER-MDF-18', 'MDF-RAW-18'] },
  { key: 'OAK-PLYWOOD-18', name: 'أبلكاج كونتر قشرة أرو طبيعي 18مم', unit: 'لوح', category: 'board', unitCost: 2300, aliases: ['OAK-PLYWOOD-18'] },
  { key: 'HDF-BACK-6', name: 'ظهر HDF أبيض 6مم', unit: 'لوح', category: 'board', unitCost: 520, aliases: ['HDF-BACK-6'] },
  { key: 'PVC-EDGE-2', name: 'شريط قشاط PVC 22/2مم', unit: 'متر', category: 'edge', unitCost: 18, aliases: ['PVC-EDGE-2', 'PVC-EDGE-WHITE-2', 'PVC-EDGE-BEIGE-2', 'MAT-EDG-005', 'MAT-EDGE-WHT', 'mat-5'] },
  { key: 'BLUM-HINGE-110', name: 'مفصلة Blum Clip-Top سوفت كلوز 110°', unit: 'قطعة', category: 'hardware', unitCost: 210, aliases: ['BLUM-HINGE-110', 'BLUM-HINGE-CLIP-110', 'BLUM-CLIP-110', 'ACC-BLUM-HINGE-CLIP', 'MAT-HNG-006', 'MAT-HNG-BLUM', 'mat-6'] },
  { key: 'BLUM-TANDEM-500', name: 'مجرى درج Blum Tandembox سوفت كلوز 50سم', unit: 'طقم', category: 'hardware', unitCost: 1350, aliases: ['BLUM-TANDEM-500', 'MAT-RAL-007', 'MAT-DRW-BLUM', 'mat-7'] },
  { key: 'BLUM-AVENTOS-HF', name: 'ميكانيزم قلاب Blum Aventos HF', unit: 'طقم', category: 'hardware', unitCost: 4300, aliases: ['BLUM-AVENTOS-HF'] },
  { key: 'LEG-ADJ-100', name: 'رجل ضبط مطبخ 10سم + كلبس وزرة', unit: 'طقم', category: 'hardware', unitCost: 45, aliases: ['LEG-ADJ-100'] },
  { key: 'HANDLE-GOLA-BLACK', name: 'بروفايل مقبض جولا ألومنيوم أسود', unit: 'متر', category: 'hardware', unitCost: 260, aliases: ['HANDLE-GOLA-BLACK'] },
  { key: 'HANDLE-BAR-160', name: 'مقبض ألومنيوم أسود مط 16سم', unit: 'قطعة', category: 'hardware', unitCost: 65, aliases: ['HANDLE-BAR-160', 'MAT-HND-006', 'MAT-HDL-BLK', 'mat-8'] },
  { key: 'WARDROBE-RAIL', name: 'ماسورة شماعات ألومنيوم + كوابيل', unit: 'متر', category: 'hardware', unitCost: 140, aliases: ['WARDROBE-RAIL'] },
  { key: 'ALUM-PROF-BLACK', name: 'بروفايل ألومنيوم أسود مط لدلف الزجاج', unit: 'متر', category: 'hardware', unitCost: 320, aliases: ['ALUM-PROF-BLACK'] },
  { key: 'CORNER-MAGIC', name: 'ميكانيزم ركنة ماجيك كورنر (Kesseböhmer)', unit: 'طقم', category: 'accessory', unitCost: 6500, aliases: ['CORNER-MAGIC'] },
  { key: 'BOTTLE-PULLOUT-30', name: 'سلة زجاجات سحب جانبي 30سم', unit: 'طقم', category: 'accessory', unitCost: 1800, aliases: ['BOTTLE-PULLOUT-30'] },
  { key: 'LED-PROFILE', name: 'ليد بروفايل ألومنيوم + شريط 24V', unit: 'متر', category: 'accessory', unitCost: 350, aliases: ['LED-PROFILE'] },
  { key: 'DW-DOOR-KIT', name: 'طقم تركيب وش غسالة أطباق بلت إن', unit: 'طقم', category: 'hardware', unitCost: 450, aliases: ['DW-DOOR-KIT'] },
  { key: 'MARBLE-GALAXY', name: 'رخام جالاكسي أسود اسباني', unit: 'متر', category: 'stone', unitCost: 3200, aliases: ['MARBLE-GALAXY', 'MAT-MRB-BLK', 'mat-14'] },
  { key: 'QUARTZ-WHITE', name: 'كوارتز أسباني أبيض', unit: 'متر', category: 'stone', unitCost: 4800, aliases: ['QUARTZ-WHITE'] }
];

const byAlias = new Map<string, CatalogItem>();
MATERIAL_CATALOG.forEach(item => item.aliases.forEach(a => byAlias.set(a.toUpperCase(), item)));

/** Resolve any module's code (or material id) to its canonical catalog item. */
export const resolveCatalogItem = (codeOrId?: string): CatalogItem | undefined =>
  codeOrId ? byAlias.get(codeOrId.toUpperCase()) : undefined;

/** Free stock for a catalog item, read from inventory item cards first, then the legacy materials list. */
export const availableStockFor = (
  item: CatalogItem,
  itemMasterCards: ItemMasterCard[],
  materials: Material[]
): number => {
  const aliasSet = new Set(item.aliases.map(a => a.toUpperCase()));
  const card = itemMasterCards.find(c => aliasSet.has(c.code.toUpperCase()));
  if (card) return Math.max(0, card.availableStock ?? card.currentStock - (card.reservedStock || 0));
  const legacy = materials.find(m => aliasSet.has(String(m.code || '').toUpperCase()) || aliasSet.has(String(m.id).toUpperCase()));
  return legacy ? Math.max(0, legacy.currentStock || 0) : 0;
};

/** Sheets needed for a total part area, including cutting waste. */
export const sheetsForArea = (areaM2: number, waste = DEFAULT_SHEET_WASTE) =>
  areaM2 <= 0 ? 0 : Math.ceil((areaM2 * (1 + waste)) / SHEET_AREA_M2);

// Opening stock for catalog items that the inventory module has no card for yet.
// Oak veneer plywood is deliberately short: it is what blocks PRJ-2026-003.
const OPENING_STOCK: Record<string, number> = {
  'HPL-OAK-IND': 26,
  'HPL-WHITE-MATT': 14,
  'HPL-GRAPHITE': 12,
  'ACRYLIC-WHITE-GLOSS': 10,
  'LACQUER-MDF-18': 24,
  'OAK-PLYWOOD-18': 4,
  'HDF-BACK-6': 40,
  'PVC-EDGE-2': 900,
  'BLUM-TANDEM-500': 34,
  'BLUM-AVENTOS-HF': 6,
  'LEG-ADJ-100': 160,
  'HANDLE-GOLA-BLACK': 60,
  'HANDLE-BAR-160': 220,
  'WARDROBE-RAIL': 48,
  'ALUM-PROF-BLACK': 30,
  'CORNER-MAGIC': 3,
  'BOTTLE-PULLOUT-30': 8,
  'LED-PROFILE': 80,
  'DW-DOOR-KIT': 10
};

const CARD_CATEGORY: Record<CatalogCategory, { category: ItemMasterCard['category']; label: string }> = {
  board: { category: 'wood_panels', label: 'ألواح وأخشاب طبيعية وصناعية' },
  edge: { category: 'veneers_hpl', label: 'تجاليد وقشاط وHPL' },
  hardware: { category: 'hardware_hinges', label: 'مفصلات ومجاري أدراج ومقابض' },
  accessory: { category: 'hardware_accessories', label: 'إكسسوارات' },
  stone: { category: 'glass_marble', label: 'زجاج ورخام وكوارتز' }
};

const CARD_UNIT: Record<string, ItemMasterCard['unit']> = { 'لوح': 'sheet', 'متر': 'm_linear', 'طقم': 'set', 'قطعة': 'pcs' };

/** Add an inventory item card for every catalog material that doesn't have one yet. */
export function ensureCatalogItemCards(cards: ItemMasterCard[]): ItemMasterCard[] {
  const known = new Set(cards.map(c => c.code.toUpperCase()));
  const extra = MATERIAL_CATALOG
    .filter(item => item.key in OPENING_STOCK && !item.aliases.some(a => known.has(a.toUpperCase())))
    .map((item, i): ItemMasterCard => {
      const stock = OPENING_STOCK[item.key];
      const cat = CARD_CATEGORY[item.category];
      const isBoard = item.category === 'board';
      return {
        id: `item-cat-${i + 1}`,
        code: item.key,
        barcode: `6221005${String(1000 + i)}`,
        nameAr: item.name,
        nameEn: item.key,
        category: cat.category,
        categoryNameAr: cat.label,
        unit: CARD_UNIT[item.unit] || 'pcs',
        unitNameAr: item.unit,
        currentStock: stock,
        reservedStock: 0,
        availableStock: stock,
        minStockLevel: isBoard ? 8 : 20,
        reorderPoint: isBoard ? 12 : 40,
        maxStockLevel: isBoard ? 80 : 500,
        weightedAvgCost: item.unitCost,
        lastPurchasePrice: item.unitCost,
        sellingPrice: Math.round(item.unitCost * 1.5),
        defaultWarehouseId: isBoard ? 'wh-obr-01' : 'wh-obr-02',
        defaultWarehouseName: isBoard ? 'مستودع الخامات والألواح الرئيسي' : 'مخزن الإكسسوارات والمفصلات',
        locationBin: isBoard ? `ممر A${(i % 4) + 1} - باكية ${String(i + 3).padStart(2, '0')}` : `رف H${(i % 6) + 1}`,
        specifications: [],
        status: stock <= (isBoard ? 8 : 20) ? 'low_stock' : 'active'
      };
    });
  return [...cards, ...extra];
}
