// ====================================================
// Per-warehouse balances on an item card.
// currentStock stays the company-wide total; warehouseStock says where it sits.
// ====================================================

import { ItemMasterCard, WarehouseLocation } from '../types/erp';

// Catalog cards were once created with a warehouse id that does not exist
const LEGACY_WAREHOUSE_IDS: Record<string, string> = { 'wh-obr-02': 'wh-obr-acc' };

/** Quantity of the item on the shelves of one warehouse. */
export function stockAt(card: ItemMasterCard, warehouseId: string): number {
  if (card.warehouseStock) return card.warehouseStock[warehouseId] || 0;
  return warehouseId === card.defaultWarehouseId ? card.currentStock : 0;
}

/** Warehouses that hold the item, largest quantity first. */
export function stockLocations(card: ItemMasterCard): { warehouseId: string; qty: number }[] {
  const map = card.warehouseStock || { [card.defaultWarehouseId]: card.currentStock };
  return Object.entries(map)
    .filter(([, qty]) => qty > 0)
    .map(([warehouseId, qty]) => ({ warehouseId, qty }))
    .sort((a, b) => b.qty - a.qty);
}

/**
 * Add (or remove, with a negative delta) stock on the shelves of one warehouse.
 * currentStock is what sits on shelves, so goods in transit between warehouses are out of it until received.
 */
export function adjustWarehouseStock(card: ItemMasterCard, warehouseId: string, delta: number): ItemMasterCard {
  const map = { ...(card.warehouseStock || { [card.defaultWarehouseId]: card.currentStock }) };
  map[warehouseId] = Math.max(0, (map[warehouseId] || 0) + delta);
  const currentStock = Math.max(0, card.currentStock + delta);
  return {
    ...card,
    warehouseStock: map,
    currentStock,
    availableStock: Math.max(0, currentStock - (card.reservedStock || 0)),
    status: currentStock <= 0 ? 'out_of_stock' : (currentStock < card.minStockLevel ? 'low_stock' : 'active')
  };
}

/** Where to pick a quantity from: the item's home warehouse first, then wherever else it sits. */
export function pickFromWarehouses(card: ItemMasterCard, qty: number): { warehouseId: string; qty: number }[] {
  const order = [
    { warehouseId: card.defaultWarehouseId, qty: stockAt(card, card.defaultWarehouseId) },
    ...stockLocations(card).filter(l => l.warehouseId !== card.defaultWarehouseId)
  ];
  const picks: { warehouseId: string; qty: number }[] = [];
  let left = qty;
  for (const loc of order) {
    if (left <= 0) break;
    const take = Math.min(left, loc.qty);
    if (take > 0) picks.push({ warehouseId: loc.warehouseId, qty: take });
    left -= take;
  }
  // Anything the shelves can't cover is booked on the home warehouse (floored at zero)
  if (left > 0) picks.push({ warehouseId: card.defaultWarehouseId, qty: left });
  return picks;
}

/** Fix legacy warehouse ids and give every card a per-warehouse balance. */
export function normalizeItemCards(cards: ItemMasterCard[], warehouses: WarehouseLocation[]): ItemMasterCard[] {
  return cards.map(card => {
    const fixedId = LEGACY_WAREHOUSE_IDS[card.defaultWarehouseId] || card.defaultWarehouseId;
    const wh = warehouses.find(w => w.id === fixedId);
    const next = fixedId !== card.defaultWarehouseId
      ? { ...card, defaultWarehouseId: fixedId, defaultWarehouseName: wh?.name || card.defaultWarehouseName }
      : card;
    if (next.warehouseStock) {
      const legacy = Object.keys(next.warehouseStock).filter(id => LEGACY_WAREHOUSE_IDS[id]);
      if (legacy.length === 0) return next;
      const map = { ...next.warehouseStock };
      legacy.forEach(id => {
        map[LEGACY_WAREHOUSE_IDS[id]] = (map[LEGACY_WAREHOUSE_IDS[id]] || 0) + map[id];
        delete map[id];
      });
      return { ...next, warehouseStock: map };
    }
    return { ...next, warehouseStock: { [next.defaultWarehouseId]: next.currentStock } };
  });
}
