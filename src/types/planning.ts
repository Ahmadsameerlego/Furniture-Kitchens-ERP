import { ProjectType, ModuleId } from './erp';

export type DemandSourceType = 
  | 'custom_project'              // طلب ناتج عن مشروع تفصيل/مطبخ معتمد (Technical Release)
  | 'production_order'           // طلب ناتج عن تجميعة أو أمر إنتاج (Subassembly)
  | 'safety_stock_replenishment' // تعويض الحد الأدنى لمخزون الأمان (Reorder Point)
  | 'forecast_mps'               // طلب متوقع ضمن الخطة الرئيسية للإنتاج (MPS)
  | 'manual';                    // طلب تخطيطي يدوي مباشر

export type PlanningDemandStatus = 
  | 'open'                       // مفتوح وقيد التخطيط
  | 'planned'                    // تم توليد مقترح توريد/تصنيع له
  | 'partially_supplied'         // مغطى جزئياً بالمخزون/التوريد
  | 'fully_supplied'             // مغطى بالكامل ومحجوز بالمخزن
  | 'in_production'              // دخل خط الإنتاج الفعلي
  | 'closed'                     // مكتمل ومنفذ
  | 'cancelled';                 // ملغي

export type PlanningPriority = 'normal' | 'high' | 'urgent';

export type SupplyProposalType = 
  | 'purchase_requisition'       // مقترح طلب شراء لمسؤول المشتريات (Procurement)
  | 'planned_production'        // مقترح أمر تصنيع/تشغيل لعنبر الإنتاج (Production)
  | 'inter_warehouse_transfer';  // مقترح تحويل بين المستودعات والفروع (Transfer)

export type SupplyProposalStatus = 
  | 'draft'                      // مسودة مقترح
  | 'under_review'               // قيد مراجعة مدير التخطيط
  | 'approved'                   // معتمد ومحول للقسم المختص (Procurement / Production)
  | 'converted_to_po'            // تم تحويله لأمر شراء فعلي بالمشتريات
  | 'converted_to_mo'            // تم تحويله لأمر إنتاج بالورش
  | 'rejected'                   // مرفوض
  | 'cancelled';                 // ملغي

export type RequirementCoverageStatus = 
  | 'covered'                    // الرصيد الحر متاح ويغطي الطلب بالكامل
  | 'shortage'                   // يوجد عجز صافي يتطلب تدبير (Shortage)
  | 'date_risk'                  // الكمية قادمة في أمر شراء لكن بعد تاريخ الحاجة (Risk)
  | 'safety_breach'              // الكمية تغطي لكنها ستكسر حد الأمان للمخزن
  | 'allocated';                 // محجوز بالكامل للمشروع

// ----------------------------------------------------
// 1. PLANNING DEMAND LINE (بند الطلب والاحتياج التخطيطي)
// ----------------------------------------------------

export interface PlanningDemand {
  id: string;
  demandNumber: string;          // e.g. "DEM-2026-001"
  sourceType: DemandSourceType;
  sourceId: string;              // TechnicalProject.id / CustomProject.id / ProductionOrder.id
  sourceNumber: string;          // e.g. "TECH-2026-001" / "PRJ-2026-001"
  projectId?: string;
  projectNumber?: string;
  projectName?: string;
  customerName?: string;
  
  // Item details
  itemId: string;                // Material.id / ItemMasterCard.id
  itemCode: string;              // e.g. "MDF-WHITE-18", "BLUM-CLIP-110", "HPL-812-BEIGE"
  itemName: string;
  itemCategory: 'raw_wood' | 'edge_banding' | 'hardware' | 'appliance' | 'paint' | 'accessory' | 'unit_subassembly';
  
  // Quantity & Time
  quantityRequired: number;
  uom: string;                   // "لوح", "متر طولي", "قطعة", "طقم"
  requiredDate: string;          // YYYY-MM-DD
  suggestedStartDate?: string;   // Calculated via backward scheduling
  leadTimeDays: number;
  
  // Warehouse & Priority
  warehouseId: string;
  warehouseName: string;
  priority: PlanningPriority;
  status: PlanningDemandStatus;
  
  // Technical Reference
  bomRevision?: string;          // e.g. "REV-01"
  unitCode?: string;             // e.g. "BASE-90-SINK"
  notes?: string;
  createdAt: string;
  lastCalculatedAt?: string;
}

// ----------------------------------------------------
// 2. MRP NET REQUIREMENT ROW (تحليل صافي الاحتياجات)
// ----------------------------------------------------

export interface MRPNetRequirement {
  itemId: string;
  itemCode: string;
  itemName: string;
  itemCategory: string;
  uom: string;
  
  // Quantities Balance
  grossDemandQty: number;        // إجمالي المطلوب لجميع المشاريع
  currentStockOnHand: number;    // الرصيد الفعلي بالمخزن (Physical Stock)
  reservedStockQty: number;      // الرصيد المحجوز لمشاريع أخرى (Reserved)
  availableFreeStock: number;    // الرصيد الحر المتاح (Free Available = OnHand - Reserved)
  incomingPOQty: number;         // كميات في أوامر شراء مفتوحة (On Order)
  incomingPOExpectedDate?: string;
  
  // Net Balance
  netShortageQty: number;        // العجز الصافي المطلوب تدبيره (Shortage)
  safetyStockLevel: number;      // حد الأمان المخزني (Safety Stock)
  leadTimeDays: number;          // فترة التوريد/التصنيع بالأيام
  
  // Diagnosis & Supply Strategy
  suggestedSupplyType: SupplyProposalType;
  coverageStatus: RequirementCoverageStatus;
  
  // Traceability
  demandSources: {
    demandId: string;
    projectNumber?: string;
    customerName?: string;
    qty: number;
    requiredDate: string;
    priority: PlanningPriority;
  }[];
}

// ----------------------------------------------------
// 3. SUPPLY PROPOSAL (مقترح التوريد أو التصنيع المخطط)
// ----------------------------------------------------

export interface SupplyProposal {
  id: string;
  proposalNumber: string;        // e.g. "PROP-PO-2026-001" or "PROP-MO-2026-001"
  proposalType: SupplyProposalType;
  
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  uom: string;
  
  targetWarehouseId: string;
  targetWarehouseName: string;
  sourceWarehouseId?: string;    // If inter-warehouse transfer
  
  requiredDate: string;          // تاريخ الاحتياج بالمصنع
  suggestedOrderDate: string;    // تاريخ بدء الشراء = requiredDate - leadTime
  leadTimeDays: number;
  
  priority: PlanningPriority;
  status: SupplyProposalStatus;
  
  // Demands Linked
  demandIds: string[];
  projectIds: string[];
  projectNumbers: string[];
  customerNames: string[];
  
  // Supplier / WorkCenter hints
  estimatedUnitCostEGP?: number;
  estimatedTotalCostEGP?: number;
  suggestedSupplierId?: string;
  suggestedSupplierName?: string;
  targetWorkCenterId?: string;
  targetWorkCenterName?: string;
  
  notes?: string;
  createdDate: string;
  createdByUserName: string;
  approvedDate?: string;
  approvedByUserName?: string;
  convertedDocumentRef?: string; // e.g. "PO-2026-042" or "MO-2026-018"
}

// ----------------------------------------------------
// 4. WORK CENTER CAPACITY (مراكز العمل والطاقة الاستيعابية)
// ----------------------------------------------------

export interface WorkCenterCapacity {
  id: string;
  centerCode: string;            // e.g. "WC-CNC-01", "WC-SAW-01", "WC-EDGE-01"
  name: string;
  nameAr: string;
  category: 'cutting' | 'cnc' | 'edge_banding' | 'drilling' | 'assembly' | 'painting' | 'finishing';
  
  dailyStandardHours: number;    // ساعات العمل اليومية القياسية (مثلاً 8 ساعات)
  workingDaysPerWeek: number;    // 6 أيام عمل بالأسبوع
  efficiencyRate: number;        // نسبة الكفاءة الفعلية (مثلاً 90%)
  
  totalCapacityWeeklyHours: number; // الطاقة الأسبوعية المتاحة = standardHours * days * efficiency
  allocatedHours: number;        // الساعات المحجوزة للمشاريع المخططة
  availableHours: number;        // الساعات المتبقية
  
  utilizationPercentage: number; // نسبة التحميل الحالية (allocated / total * 100)
  loadStatus: 'underloaded' | 'optimal' | 'near_capacity' | 'overloaded';
  
  machineSpecs?: string;         // e.g. "Holz-Her CNC 5 Axis 2024"
  operatorCount: number;
  maintenanceScheduleNotes?: string;
}

// ----------------------------------------------------
// 5. PROJECT PLANNING READINESS (جاهزية المشروع للإنتاج)
// ----------------------------------------------------

export interface ProjectPlanningReadiness {
  projectId: string;
  projectNumber: string;
  customerName: string;
  projectName: string;
  projectType: ProjectType;
  techReleaseNumber?: string;
  
  // Dates
  targetDeliveryDate: string;
  plannedManufacturingStartDate: string;
  plannedManufacturingEndDate: string;
  plannedSiteInstallationDate: string;
  
  // Readiness Radar
  overallReadiness: 'ready' | 'partially_ready' | 'blocked_materials' | 'blocked_capacity' | 'pending_planning';
  readinessPercentage: number;  // 0 - 100%
  
  // Material Readiness Matrix
  totalMaterialDemandsCount: number;
  coveredMaterialsCount: number;
  shortageMaterialsCount: number;
  criticalShortages: {
    itemCode: string;
    itemName: string;
    shortageQty: number;
    uom: string;
    status: RequirementCoverageStatus;
  }[];
  
  // Capacity & Hours
  estimatedTotalWorkCenterHours: number;
  isCapacityFeasible: boolean;
  capacityBottlenecks?: string[];
  
  // Status
  activeProposalsCount: number;
  priority: PlanningPriority;
  notes?: string;
}

// ----------------------------------------------------
// 6. PLANNING RUN RECORD (سجل دورة تشغيل الـ MRP)
// ----------------------------------------------------

export interface PlanningRun {
  id: string;
  runNumber: string;            // e.g. "MRP-RUN-2026-001"
  runDate: string;
  executedByUserName: string;
  planningHorizonDays: number;   // e.g. 30, 60, 90 days
  warehousesIncluded: string[];
  
  demandsEvaluatedCount: number;
  shortagesIdentifiedCount: number;
  purchaseProposalsGeneratedCount: number;
  productionProposalsGeneratedCount: number;
  capacityOverloadsCount: number;
  totalEstimatedPurchaseCostEGP: number;
  
  status: 'draft' | 'approved' | 'partially_executed' | 'executed';
  notes?: string;
}

// ----------------------------------------------------
// 7. MASTER PRODUCTION SCHEDULE (MPS) BUCKETS
// ----------------------------------------------------

export interface MPSWeeklyBucket {
  weekLabel: string;             // e.g. "أسبوع 40 (01-07 أكتوبر)"
  weekNumber: number;
  forecastDemandQty: number;
  actualOrdersDemandQty: number;
  totalDemandQty: number;
  plannedProductionQty: number;
  projectedEndingInventoryQty: number;
}

export interface MPSItemRow {
  id: string;
  itemCode: string;
  itemName: string;
  uom: string;
  category: 'finished_unit' | 'standard_cabinet' | 'board_sheet';
  safetyStock: number;
  leadTimeWeeks: number;
  buckets: MPSWeeklyBucket[];
}

// ----------------------------------------------------
// 8. PLANNING AUDIT LOG (سجل التدقيق والتعديلات التخطيطية)
// ----------------------------------------------------

export interface PlanningAuditEntry {
  id: string;
  timestamp: string;
  userName: string;
  action: string;
  actionEn: string;
  category: 'mrp_run' | 'proposal_generated' | 'proposal_approved' | 'reschedule' | 'capacity_overload' | 'tech_revision_sync';
  targetReference: string;
  details: string;
  impactNotes?: string;
}
