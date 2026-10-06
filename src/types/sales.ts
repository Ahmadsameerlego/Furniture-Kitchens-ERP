import { ModuleId } from './erp';

export type VariationOrderStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'applied_to_production';

export interface VariationOrderItem {
  id: string;
  changeType: 'add_item' | 'remove_item' | 'upgrade_material' | 'dimension_change' | 'accessory_change';
  description: string;
  previousSpec?: string;
  newSpec: string;
  costImpact: number;      // فرق التكلفة (+ or -)
  priceImpact: number;     // فرق سعر البيع للعميل (+ or -)
}

export interface VariationOrder {
  id: string;
  orderNumber: string;     // e.g. "VAR-2026-001"
  contractId: string;
  contractNumber: string;  // e.g. "CNT-2026-001"
  projectId: string;
  projectNumber: string;   // e.g. "PRJ-2026-001"
  projectName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  branchId: string;
  branchName: string;
  requestedDate: string;
  requestedBy: 'customer' | 'site_engineer' | 'technical_office';
  requestedByName: string;
  reason: string;
  status: VariationOrderStatus;
  items: VariationOrderItem[];
  totalPriceImpact: number; // إجمالي الزيادة أو الخفض في سعر العقد
  totalCostImpact: number;
  deliveryDelayDays: number; // تأثير التعديل على مدة التسليم (أيام إضافية)
  approvedDate?: string;
  approvedByName?: string;
  notes?: string;
  annexPdfUrl?: string;
}

export interface SalesKPIData {
  totalSalesVolume: number;
  customProjectsVolume: number;
  readyPOSVolume: number;
  activeContractsCount: number;
  pendingQuotesCount: number;
  conversionRate: number;
  totalCollectedMilestones: number;
  pendingMilestonesToCollect: number;
  averageDealSize: number;
}
