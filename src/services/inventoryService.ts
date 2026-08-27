import {
  MaterialStockLocation,
  StockMovementType,
  StockTransferStatus,
  ReceivingStatus
} from '../types/erp';

export class InventoryService {

  static isLowStock(availableStock: number, minStockLevel: number): boolean {
    return availableStock < minStockLevel;
  }

  static getMovementTypeMeta(type: StockMovementType) {
    switch (type) {
      case 'purchase_receipt':
        return { label: 'استلام شراء وتوريد', bgClass: 'bg-emerald-100 text-emerald-900 border-emerald-300', sign: '+' };
      case 'sale':
        return { label: 'مبيعات وتسليم عميل', bgClass: 'bg-rose-100 text-rose-900 border-rose-300', sign: '-' };
      case 'material_consumption':
        return { label: 'استهلاك خامات بالإنتاج', bgClass: 'bg-amber-100 text-amber-900 border-amber-300', sign: '-' };
      case 'transfer_out':
        return { label: 'تحويل صادر', bgClass: 'bg-blue-100 text-blue-900 border-blue-300', sign: '-' };
      case 'transfer_in':
        return { label: 'تحويل وارد', bgClass: 'bg-teal-100 text-teal-900 border-teal-300', sign: '+' };
      case 'supplier_return':
        return { label: 'مرتجع للمورد', bgClass: 'bg-purple-100 text-purple-900 border-purple-300', sign: '-' };
      case 'customer_return':
        return { label: 'مرتجع من عميل', bgClass: 'bg-indigo-100 text-indigo-900 border-indigo-300', sign: '+' };
      case 'adjustment':
        return { label: 'تسوية رصيد المخزون', bgClass: 'bg-slate-100 text-slate-900 border-slate-300', sign: '±' };
      case 'reservation':
        return { label: 'حجز مؤقت', bgClass: 'bg-orange-100 text-orange-900 border-orange-300', sign: '🔒' };
      case 'reservation_release':
        return { label: 'فك حجز', bgClass: 'bg-gray-100 text-gray-900 border-gray-300', sign: '🔓' };
      default:
        return { label: 'حركة مخزون', bgClass: 'bg-slate-100 text-slate-800 border-slate-200', sign: '•' };
    }
  }

  static getTransferStatusMeta(status: StockTransferStatus) {
    switch (status) {
      case 'requested':
        return { label: 'مطلوب في انتظار الاعتماد', bgClass: 'bg-amber-50 text-amber-900 border-amber-300' };
      case 'approved':
        return { label: 'معتمد وجاري التجهيز', bgClass: 'bg-blue-50 text-blue-900 border-blue-300' };
      case 'sent':
        return { label: 'تم الشحن في الطريق', bgClass: 'bg-indigo-50 text-indigo-900 border-indigo-300' };
      case 'received':
        return { label: 'تم الاستلام بالمقر المستلم', bgClass: 'bg-emerald-50 text-emerald-900 border-emerald-300' };
      case 'cancelled':
        return { label: 'ملغي', bgClass: 'bg-rose-50 text-rose-900 border-rose-300' };
      default:
        return { label: status, bgClass: 'bg-slate-50 text-slate-800 border-slate-200' };
    }
  }

  static getReceivingStatusMeta(status: ReceivingStatus) {
    switch (status) {
      case 'pending':
        return { label: 'في انتظار الاستلام', bgClass: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'partially_received':
        return { label: 'استلام جزئي للمخزن', bgClass: 'bg-blue-100 text-blue-900 border-blue-200' };
      case 'fully_received':
        return { label: 'تم الاستلام بالكامل', bgClass: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
      default:
        return { label: status, bgClass: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  }
}
