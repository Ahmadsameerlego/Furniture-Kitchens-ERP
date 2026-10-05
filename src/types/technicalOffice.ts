import { ProjectType, ModuleId } from './erp';

export type TechnicalProjectStatus =
  | 'pending_handover'         // في انتظار مراجعة وقبول محضر الاستلام من المبيعات
  | 'handover_accepted'        // تم قبول الاستلام - جاري بدء الأعمال الفنية
  | 'site_survey_in_progress'  // جاري المعاينة والرفع المساحي الهندسي بالموقع
  | 'site_survey_completed'    // اكتملت المعاينة ومطابقة المعوقات
  | 'cad_design_in_progress'   // جاري إعداد الرسومات والمخططات الهندسية CAD/3D
  | 'designing'                // جاري إعداد الرسومات والمخططات الهندسية CAD/3D
  | 'design_approved'          // تم اعتماد التصميم الهندسي الداخلي
  | 'bom_explosion_in_progress'// جاري تفجير بنود الـ BOM وتوليد قوائم التقطيع
  | 'bom_drafting'             // جاري تفجير بنود الـ BOM وتوليد قوائم التقطيع
  | 'bom_under_review'         // جدول المواد وقوائم التقطيع قيد المراجعة الفنية
  | 'technically_approved'     // تم الاعتماد الفني النهائي لباكيج المشروع
  | 'released_to_planning'     // تم الإفراج الهندسي وتسليمه للتخطيط
  | 'in_production'            // تم بدء التصنيع الفعلي بالورش
  | 'ecr_in_progress'          // مطلوب تعديل هندسي (ECR)
  | 'revision_required'        // مطلوب تعديل هندسي (ECR)
  | 'on_hold'                  // معلق مؤقتاً
  | 'cancelled';               // ملغي

export type TechnicalPriority = 'normal' | 'high' | 'urgent';

export interface TechnicalProject {
  id: string;
  projectNumber: string;         // e.g. "TECH-2026-001"
  salesProjectId: string;        // Reference to CustomProject.id
  salesProjectNumber: string;    // e.g. "PRJ-2026-001"
  projectName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  contractId?: string;
  contractNumber?: string;
  branchId: string;
  branchName: string;
  projectType: ProjectType;
  status: TechnicalProjectStatus;
  priority: TechnicalPriority;
  responsibleEngineerId: string;
  responsibleEngineerName: string;
  designerEngineerName?: string;
  createdDate: string;
  lastUpdatedDate: string;
  targetReleaseDate: string;
  activeDesignVersion: number;
  activeBomRevision: string;     // e.g. "REV-A", "REV-01"
  handoverId: string;
  technicalNotes?: string;
  commercialScopeSummary?: string;
}

// ----------------------------------------------------
// TECHNICAL SITE SURVEY (الرفع المساحي والمعاينة التفصيلية)
// ----------------------------------------------------

export interface WallDimension {
  id: string;
  wallName: string;             // e.g. "الجدار A (الرئيسي - حوض وشفاط)", "الجدار B (عمود وثلاجة)"
  lengthCm: number;
  heightCm: number;
  angleDegrees?: number;        // e.g. 90
  plasterQuality: 'straight' | 'tilted' | 'rough' | 'wavy';
  notes?: string;
}

export interface OpeningDimension {
  id: string;
  type: 'door' | 'window' | 'arch' | 'balcony';
  location: string;
  widthCm: number;
  heightCm: number;
  distanceFromFloorCm: number;
  distanceFromCornerCm: number;
  notes?: string;
}

export interface ElectricalPoint {
  id: string;
  purpose: string;              // e.g. "مأخذ شفاط 220V", "مأخذ غسالة أطباق", "ليد بروفايل علوي"
  locationWall: string;
  heightFromFloorCm: number;
  distanceFromCornerCm: number;
  status: 'ok' | 'needs_relocation' | 'pending';
  notes?: string;
}

export interface ApplianceSpec {
  id: string;
  applianceType: 'refrigerator' | 'built_in_oven' | 'gas_hob' | 'dishwasher' | 'hood' | 'microwave' | 'sink' | 'other';
  name: string;                 // e.g. "شفاط هرمي 90 سم Bosch"
  brand?: string;
  model?: string;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  supplyType: 'electric' | 'gas' | 'water_drain' | 'none';
  supplyStatus: 'customer_provided' | 'factory_supplied' | 'specified_by_designer';
  notes?: string;
}

export interface TechnicalSiteSurvey {
  id: string;
  technicalProjectId: string;
  surveyNumber: string;         // e.g. "SRV-2026-001"
  surveyDate: string;
  surveyorName: string;
  status: 'draft' | 'verified' | 'revision_needed';
  ceilingHeightCm: number;
  flooringLevelStatus: 'perfect' | 'slight_slope' | 'high_slope';
  flooringVarianceMm: number;
  walls: WallDimension[];
  openings: OpeningDimension[];
  electricalPoints: ElectricalPoint[];
  plumbing: {
    waterSupplyLocation: string;
    waterDrainageLocation: string;
    hotColdDistanceCm: number;
    drainDiameterInch: number;
    status: 'ok' | 'needs_modification';
    notes?: string;
  };
  gas: {
    hasNaturalGas: boolean;
    valveLocation: string;
    valveHeightCm: number;
    status: 'ok' | 'needs_extension';
    notes?: string;
  };
  ventilation: {
    hasDuctHole: boolean;
    ductDiameterCm: number;
    ductHeightFromFloorCm: number;
    ductLocation: string;
  };
  appliances: ApplianceSpec[];
  obstaclesAndConstraints: {
    hasConcreteColumn: boolean;
    columnSpecs?: string;
    hasCeilingBeams: boolean;
    beamSpecs?: string;
    accessRestrictions?: string; // e.g. "سلم ضيق - الدور الرابع بدون أسانسير"
  };
  sitePhotos: string[];
  siteVideos?: string[];
  sketches?: string[];
  verifiedByEngineerName?: string;
  verifiedAt?: string;
  notes?: string;
  generalNotes?: string;
  straightnessVerified?: boolean;
  diagonal1Mm?: number;
  diagonal2Mm?: number;
}

// ----------------------------------------------------
// TECHNICAL DRAWINGS & 3D DESIGNS (المخططات والتصاميم)
// ----------------------------------------------------

export interface CadFileAttachment {
  id: string;
  name: string;
  fileType: 'dwg' | 'dxf' | 'pdf' | 'render' | 'cutlist';
  fileSize: string;
  url?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TechnicalDesignRevision {
  id: string;
  technicalProjectId: string;
  versionNumber: number;        // e.g. 1, 2, 3
  versionCode: string;          // e.g. "DWG-V1.0", "DWG-V2.0"
  title: string;
  designerName: string;
  cadFiles?: CadFileAttachment[];
  attachments?: CadFileAttachment[];
  renders?: string[];
  changeDescription?: string;
  status: 'draft' | 'under_review' | 'approved' | 'superseded' | 'rejected';
  rejectionReason?: string;
  approvedBy?: string;
  approvedByEngineerName?: string;
  approvedAt?: string;
  customerApproved?: boolean;
  approvalHistory?: any[];
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
}

// ----------------------------------------------------
// EXPLODED BILL OF MATERIALS & CUTTING LISTS (BOM والتفجير)
// ----------------------------------------------------

export type UnitType =
  | 'base_cabinet'
  | 'upper_cabinet'
  | 'tall_cabinet'
  | 'drawer_unit'
  | 'sink_unit'
  | 'corner_unit'
  | 'island'
  | 'wardrobe_module'
  | 'bed_frame'
  | 'shelf_unit'
  | 'decorative_cladding';

export interface CuttingPart {
  id: string;
  partName: string;             // e.g. "جنب يمين", "جنب شمال", "قاع علبة", "برنيطة علوية", "ضلفة", "ظهر 6مم"
  materialId: string;           // Link to Material Master
  materialName: string;         // e.g. "MDF 18mm حشو أبيض جود وود"
  materialCode: string;
  lengthMm: number;             // الطول بالمليمتر
  widthMm: number;              // العرض بالمليمتر
  thicknessMm: number;          // السمك بالمليمتر (18mm, 6mm, 12mm)
  quantity: number;             // العدد
  grainDirection: 'length' | 'width' | 'none'; // اتجاه الثمرة
  edgeBanding?: {
    top?: string;               // e.g. "PVC 2mm أبيض"
    bottom?: string;
    left?: string;
    right?: string;
  };
  edgeBandingL1Mm?: number;
  edgeBandingL2Mm?: number;
  edgeBandingW1Mm?: number;
  edgeBandingW2Mm?: number;
  totalCostEstimate?: number;
  drillingCncCode?: string;     // كود التخريم والراوتر CNC
  notes?: string;
}

export interface HardwarePart {
  id: string;
  itemId: string;               // Link to Item Master / Hardware
  itemName: string;             // e.g. "مفصلة بلوم كليب توب سوفت كلوز 110°"
  itemCode: string;
  quantity: number;
  unit: string;                 // e.g. "طقم", "حبة", "متر"
  unitCostEstimate?: number;
  totalCostEstimate?: number;
  notes?: string;
}

export interface TechnicalBOMUnit {
  id: string;
  unitCode: string;             // e.g. "B-80-2D", "W-60-1D", "TALL-60-OVEN"
  unitName: string;             // e.g. "علبة سفلية درفتين 80 سم"
  unitType?: UnitType;
  dimensions?: {
    widthMm: number;
    heightMm: number;
    depthMm: number;
  };
  widthMm?: number;
  heightMm?: number;
  depthMm?: number;
  quantity: number;
  cuttingParts: CuttingPart[];
  hardwareParts: HardwarePart[];
  notes?: string;
}

export interface MaterialYieldSummary {
  materialId: string;
  materialName: string;
  materialCode: string;
  totalAreaSqMeters: number;
  estimatedSheetsCount: number; // تقدير عدد الألواح (لوح 122×244 = 2.97 م²)
  scrapPercentage: number;      // نسبة الهالك التقديرية e.g. 12%
}

export interface HardwareSummary {
  itemId: string;
  itemName: string;
  itemCode: string;
  totalQuantity: number;
  unit: string;
}

export interface TechnicalBOM {
  id: string;
  technicalProjectId: string;
  bomNumber?: string;
  revisionCode: string;         // e.g. "REV-A", "REV-B", "REV-01"
  revisionNumber?: number;
  designRevisionVersion?: number;
  title?: string;
  status: 'draft' | 'under_review' | 'approved' | 'superseded' | 'released';
  createdBy?: string;
  createdDate?: string;
  createdAt?: string;
  updatedAt?: string;
  preparedByEngineerName?: string;
  approvedBy?: string;
  approvedByEngineerName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  revisionNotes?: string;
  units: TechnicalBOMUnit[];
  materialsSummary?: MaterialYieldSummary[];
  hardwareSummary?: HardwareSummary[];
  totalPartsCount?: number;
  totalHardwareCount?: number;
  totalEstimatedCost?: number;
  totalEstimatedMaterialCost?: number;
  notes?: string;
}

// ----------------------------------------------------
// TECHNICAL RELEASE PACKAGE TO PLANNING (الإفراج الهندسي للتخطيط)
// ----------------------------------------------------

export interface TechnicalReleasePackage {
  id: string;
  releaseNumber: string;        // e.g. "REL-2026-001"
  technicalProjectId: string;
  projectNumber: string;
  customerName: string;
  contractNumber?: string;
  approvedDesignVersion: number;
  approvedBomRevision: string;
  releasedByUserName: string;
  releasedAt: string;
  targetProductionStartDate: string;
  targetFactoryCompletionDate: string;
  targetSiteInstallationDate: string;
  planningStatus: 'pending_planning' | 'materials_allocated' | 'shortages_identified' | 'work_orders_scheduled' | 'received_by_planning';
  planningReceivedBy?: string;
  planningReceivedAt?: string;
  planningNotes?: string;
  technicalSpecificationsSummary: string;
  specialManufacturingInstructions?: string;
}

// ----------------------------------------------------
// ENGINEERING CHANGE REQUEST - ECR (إدارة التغييرات الهندسية)
// ----------------------------------------------------

export type EcrSource =
  | 'customer_request'
  | 'site_obstruction'
  | 'site_condition'
  | 'material_discontinued'
  | 'designer_correction'
  | 'factory_feedback'
  | 'manufacturing_defect'
  | 'engineering_optimization';

export interface EngineeringChangeRequest {
  id: string;
  ecrNumber: string;            // e.g. "ECR-2026-001"
  technicalProjectId: string;
  projectNumber: string;
  customerName: string;
  title: string;
  reason: string;
  source: EcrSource;
  requestedByUserName: string;
  requestedDate: string;
  createdAt?: string;
  previousBomRevision: string;
  targetNewBomRevision: string;
  affectedUnits: string[];
  impactAssessment: {
    costImpact: number;         // فرق التكلفة بالجنيه (+/-)
    scheduleDelayDays: number;  // عدد أيام التأخير المتوقعة
    materialsWasted: string;    // هل تسبب في هالك؟
    customerApprovalRequired: boolean;
  };
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'implemented';
  reviewedByUserName?: string;
  reviewedAt?: string;
  resolutionNotes?: string;
}

// ----------------------------------------------------
// TECHNICAL OFFICE DASHBOARD STATS
// ----------------------------------------------------

export interface TechnicalOfficeStats {
  newHandoversCount: number;
  surveysPendingCount: number;
  inDesigningCount: number;
  bomReviewPendingCount: number;
  approvedReadyForReleaseCount: number;
  releasedToPlanningCount: number;
  activeEcrCount: number;
  urgentProjectsCount: number;
}
