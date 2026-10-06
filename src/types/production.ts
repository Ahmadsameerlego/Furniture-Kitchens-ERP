import { ModuleId } from './erp';

// ----------------------------------------------------
// 1. WORK CENTER DEFINITIONS (مراكز العمل وعنابر التشغيل)
// ----------------------------------------------------

export type WorkCenterCategory = 
  | 'cutting_cnc'        // مركز التقطيع والـ CNC والنيستينج (Cutting & Nesting)
  | 'edge_banding'       // مركز شريط الحرف والقشاط (Edge Banding)
  | 'drilling_routing'   // مركز التخريم والتفريز (Drilling & Routing)
  | 'paint_finishing'    // مركز الدهان والرش والكبس الحراري (Paint, Spray & Membrane)
  | 'assembly'           // مركز التجميع والتركيب الميكانيكي (Carpentry Assembly)
  | 'packaging_qc';      // محطة الفحص النهائي والتغليف والطرود (QC & Packaging)

export type WorkCenterStatus = 'active' | 'busy' | 'maintenance' | 'offline';

export interface WorkCenter {
  id: string;
  code: string;                  // e.g. "WC-CNC-01", "WC-EDG-01", "WC-PNT-01"
  name: string;                  // e.g. "ماكينة CNC التقطيع والنيستينج Biesse"
  nameEn: string;
  category: WorkCenterCategory;
  workshopLocation: string;      // e.g. "عنبر النجارة والتقطيع - مصنع العبور"
  supervisorName: string;        // e.g. "الأسطى محمود الشافعي"
  capacityHoursPerDay: number;   // e.g. 16 (وردية عمل)
  hourlyLaborCost: number;       // e.g. 120 EGP/hr
  hourlyMachineCost: number;     // e.g. 250 EGP/hr (كهرباء + استهلاك ماكينة)
  status: WorkCenterStatus;
  currentActiveWOCount: number;  // عدد أوامر الشغل الجارية حالياً
  efficiencyRate: number;        // OEE % معدل الكفاءة التشغيلية
  maintenanceNextDate?: string;
  supportedMaterials?: string[]; // e.g. ["MDF", "HPL", "Acrylic", "Solid Wood"]
}

// ----------------------------------------------------
// 2. WORK ORDER / OPERATION (أمر الشغل والمرحلة التشغيلية)
// ----------------------------------------------------

export type WorkOrderStatus = 
  | 'pending'        // بانتظار بدء التشغيل
  | 'ready'          // جاهز (المرحلة السابقة اكتملت والخامات متوفرة)
  | 'in_progress'    // جاري العمل على الماكينة حالياً
  | 'paused'         // متوقف مؤقتاً (استراحة / استفسار فني)
  | 'completed'      // منجز وتم تسليمه للمرحلة التالية
  | 'blocked';       // معطل (نقص خامة / عطل ماكينة / طلب تعديل فني)

export interface WorkOrder {
  id: string;
  workOrderNumber: string;       // e.g. "WO-2026-0101"
  manufacturingOrderId: string;  // e.g. "prod-101"
  manufacturingOrderNumber: string; // e.g. "PROD-2026-0012"
  projectId: string;
  projectNumber: string;
  customerName: string;
  
  // Operation details
  sequenceOrder: number;         // 1: التقطيع, 2: الشريط, 3: التخريم, 4: الدهان, 5: التجميع, 6: التغليف
  operationName: string;         // e.g. "تقطيع وتفصيل ألواح المطبخ (CNC Nesting)"
  operationCategory: WorkCenterCategory;
  workCenterId: string;
  workCenterName: string;
  
  // Schedule & Execution
  plannedDurationMinutes: number; // e.g. 180 min
  actualDurationMinutes: number;  // e.g. 195 min
  scheduledStartDate: string;
  scheduledEndDate: string;
  startedAt?: string;
  completedAt?: string;
  
  // Assignees & Tracking
  assignedTechnicians: string[];  // e.g. ["مصطفى كمال (مشغل CNC)", "كريم عادل"]
  status: WorkOrderStatus;
  progressPercentage: number;     // 0 - 100%
  
  // Shopfloor instructions & parts
  partsToProcessCount: number;    // عدد الألواح أو الضلف
  partsCompletedCount: number;
  cutListReference?: string;      // e.g. "CUT-MDF-18MM-V2"
  specialInstructions?: string;   // "مراعاة اتجاه تجزيع خشب الجوز في الضلف العلوية"
  
  // Quality & Scrap in this step
  qualityCheckPassed?: boolean;
  qualityInspectorName?: string;
  scrapGeneratedCount?: number;   // عدد الألواح أو الأمتار المهدرة في هذه المرحلة
}

// ----------------------------------------------------
// 3. MANUFACTURING ORDER EXTENSION (أمر التصنيع المتكامل)
// ----------------------------------------------------

export type ManufacturingPriority = 'normal' | 'high' | 'urgent';

export interface ManufacturingOrderRoutingStage {
  stageId: string;
  category: WorkCenterCategory;
  title: string;
  status: WorkOrderStatus;
  workCenterName: string;
  progress: number;
  durationMins: number;
}

export interface ManufacturingPackageItem {
  id: string;
  packageCode: string;           // e.g. "PKG-101-01"
  title: string;                 // e.g. "كرتونة 1/6 - شاسيه حوض + مفصلات Blum"
  dimensions: string;            // "90x60x85 سم"
  weightKg: number;
  status: 'packed' | 'staged' | 'shipped';
  qrCode: string;
  itemsContained: string[];      // ["شاسيه حوض 90سم", "مفصلة بلوم 4 قطع", "رجلاش سفلي 4 قطع"]
}

export interface ScrapClaimRecord {
  id: string;
  claimNumber: string;           // e.g. "SCR-2026-001"
  manufacturingOrderId: string;
  manufacturingOrderNumber: string;
  workOrderId?: string;
  workCenterName: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  scrapQuantity: number;
  reason: 'machine_defect' | 'operator_error' | 'transit_damage' | 'material_flaw' | 'measurement_mismatch';
  reasonDescription: string;
  estimatedCost: number;
  reportedBy: string;
  reportedAt: string;
  status: 'pending_warehouse' | 'replacement_issued' | 'rejected';
  replacementGINNumber?: string; // إذن الصرف التعويضي من المخازن
}

export interface OffCutReturnRecord {
  id: string;
  returnNumber: string;          // e.g. "OFF-2026-001"
  manufacturingOrderId: string;
  manufacturingOrderNumber: string;
  materialId: string;
  materialName: string;
  dimensions: string;            // e.g. "140 × 80 سم (سمك 18مم)"
  quantity: number;
  unit: string;
  condition: 'excellent' | 'good';
  targetWarehouseName: string;   // e.g. "مستودع فضلات وخامات التشغيل - العبور"
  returnedBy: string;
  date: string;
  status: 'pending' | 'returned_to_stock';
}

export interface QualityGateInspection {
  id: string;
  gateNumber: string;            // e.g. "QG-2026-012"
  manufacturingOrderId: string;
  manufacturingOrderNumber: string;
  stage: 'cutting_edge' | 'paint_surface' | 'carpentry_assembly' | 'final_packaging';
  stageTitle: string;
  inspectorName: string;
  inspectionDate: string;
  passed: boolean;
  scorePercentage: number;
  checklistResults: {
    itemTitle: string;
    passed: boolean;
    notes?: string;
  }[];
  photos: string[];
  correctiveAction?: string;
}

// ----------------------------------------------------
// 4. MANUFACTURING JOB COSTING (تحليل التكلفة الفعلية)
// ----------------------------------------------------

export interface JobCostingBreakdown {
  rawMaterialsEstimated: number;
  rawMaterialsActual: number;
  directLaborEstimated: number;
  directLaborActual: number;
  machineOverheadEstimated: number;
  machineOverheadActual: number;
  scrapCostActual: number;
  totalEstimatedCost: number;
  totalActualCost: number;
  varianceAmount: number;
  variancePercentage: number;
}
