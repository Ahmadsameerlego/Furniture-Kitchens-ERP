export type BusinessType = 'furniture' | 'kitchens' | 'furniture_kitchens';
export type BusinessModel = 'ready_made' | 'custom_made' | 'ready_custom';
export type LocationType = 'showroom' | 'warehouse' | 'workshop';

export type ModuleId = 
  | 'dashboard'
  | 'analytics'
  | 'customers'
  | 'campaigns'
  | 'sales'
  | 'sales_dashboard'
  | 'sales_quotations'
  | 'sales_contracts'
  | 'sales_change_orders'
  | 'custom_projects'
  | 'tech_office'
  | 'tech_dashboard'
  | 'tech_projects'
  | 'tech_handovers'
  | 'tech_surveys'
  | 'tech_designs'
  | 'tech_boms'
  | 'tech_releases'
  | 'tech_ecr'
  | 'planning'
  | 'plan_dashboard'
  | 'plan_demand'
  | 'plan_mrp'
  | 'plan_shortages'
  | 'plan_proposals'
  | 'plan_capacity'
  | 'plan_schedule'
  | 'plan_mps'
  | 'products'
  | 'materials'
  | 'inventory'
  | 'inv_dashboard'
  | 'inv_items'
  | 'inv_grn'
  | 'inv_gin'
  | 'inv_stock_card'
  | 'inv_transfers'
  | 'inv_stocktaking'
  | 'inv_warehouses'
  | 'suppliers'
  | 'procurement'
  | 'proc_dashboard'
  | 'proc_requests'
  | 'proc_rfq'
  | 'proc_quotations'
  | 'proc_comparison'
  | 'proc_orders'
  | 'proc_deliveries'
  | 'proc_returns'
  | 'proc_suppliers'
  | 'proc_prices'
  | 'proc_reports'
  | 'production'
  | 'mfg_dashboard'
  | 'mfg_orders'
  | 'mfg_work_orders'
  | 'mfg_shopfloor'
  | 'mfg_job_cards'
  | 'mfg_scrap'
  | 'mfg_qc'
  | 'installation'
  | 'finance'
  | 'acc_dashboard'
  | 'acc_coa'
  | 'acc_entries'
  | 'acc_invoices'
  | 'acc_bills'
  | 'acc_partners'
  | 'acc_checks'
  | 'acc_cost_centers'
  | 'acc_reports'
  | 'acc_periods'
  | 'reports'
  | 'notifications'
  | 'settings'
  | 'portal';

export interface PermissionActions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  export: boolean;
}

export type ModulePermissions = Partial<Record<ModuleId, PermissionActions>>;

export interface Role {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  isSystem: boolean;
  permissions: ModulePermissions;
}

export interface Branch {
  id: string;
  name: string;
  nameEn: string;
  type: LocationType;
  address: string;
  phone: string;
  isMain: boolean;
  status: 'active' | 'inactive';
  managerName?: string;
  createdDate: string;
  capacity?: string;
}

export interface CompanyConfig {
  name: string;
  nameEn: string;
  taxNumber: string;
  commercialReg: string;
  businessType: BusinessType;
  businessModel: BusinessModel;
  phone: string;
  email: string;
  address: string;
  currency: string;
  mainBranchId: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  roleId: string;
  assignedBranchIds: string[];
  status: 'active' | 'inactive';
  lastLogin: string;
  createdDate: string;
  title?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  category: 'user' | 'role' | 'branch' | 'company' | 'security' | 'system' | 'customer' | 'sales' | 'inventory' | 'product' | 'supplier' | 'finance' | 'material' | 'purchasing' | 'custom_project' | 'contract' | 'payment' | 'production' | 'installation';
  action: string;
  actionEn: string;
  target: string;
  details: string;
  status: 'success' | 'denied' | 'warning';
  ipAddress?: string;
}

// ----------------------------------------------------
// SYSTEM NOTIFICATIONS & ALERTS
// ----------------------------------------------------

export type NotificationType =
  | 'low_stock'
  | 'out_of_stock'
  | 'pending_transfer'
  | 'transfer_received'
  | 'purchase_received'
  | 'payment_due'
  | 'payment_overdue'
  | 'supplier_return'
  | 'site_visit'
  | 'design_review'
  | 'quotation_review'
  | 'contract_signed'
  | 'order_converted'
  | 'production_created'
  | 'material_shortage'
  | 'production_completed'
  | 'installation_scheduled'
  | 'handover_completed'
  | 'cost_overrun'
  | 'large_expense'
  | 'pr_approval'
  | 'rfq_deadline'
  | 'po_approval'
  | 'quotation_received'
  | 'delivery_due'
  | 'delivery_delayed'
  | 'price_mismatch'
  | 'qty_mismatch';

export interface SystemNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  targetModule: ModuleId;
  targetId?: string;
  branchId?: string;
  branchName?: string;
  customerId?: string;
}

// ----------------------------------------------------
// FINANCE MODULE TYPES (PROMPT 8)
// ----------------------------------------------------

export type ExpenseCategory =
  | 'rent'
  | 'salaries'
  | 'utilities'
  | 'marketing'
  | 'transportation'
  | 'maintenance'
  | 'workshop'
  | 'delivery'
  | 'office'
  | 'other';

export interface CompanyExpense {
  id: string;
  expenseNumber: string; // e.g. "EXP-2026-004"
  category: ExpenseCategory;
  categoryName: string;
  description: string;
  amount: number;
  date: string;
  branchId: string;
  branchName: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'card';
  accountName: string;
  projectId?: string;
  projectNumber?: string;
  employeeId?: string;
  employeeName?: string;
  recordedByUserName: string;
  notes?: string;
  attachmentUrl?: string;
}

export interface FinancialAccount {
  id: string;
  name: string; // e.g. "خزينة المعرض الرئيسي" or "حساب البنك الأهلي"
  type: 'cash' | 'bank' | 'card';
  branchId: string;
  branchName: string;
  openingBalance: number;
  currentBalance: number;
  accountNumber?: string;
  bankName?: string;
  status: 'active' | 'inactive';
}

export type FinancialTransactionType = 'income' | 'expense' | 'transfer';

export interface FinancialTransaction {
  id: string;
  refNumber: string; // e.g. "PAY-2026-0045" or "EXP-2026-004"
  timestamp: string;
  type: FinancialTransactionType;
  category: string;
  description: string;
  amount: number;
  direction: 'in' | 'out';
  branchId: string;
  branchName: string;
  accountId: string;
  accountName: string;
  toAccountId?: string;
  toAccountName?: string;
  customerId?: string;
  customerName?: string;
  supplierId?: string;
  supplierName?: string;
  orderId?: string;
  orderNumber?: string;
  projectId?: string;
  projectNumber?: string;
  createdByUserName: string;
  notes?: string;
}

// ----------------------------------------------------
// CRM & CUSTOMER 360 TYPES (PROMPT 2)
// ----------------------------------------------------

export type CustomerStatus =
  | 'new'
  | 'contacted'
  | 'interested'
  | 'measurement_scheduled'
  | 'measured'
  | 'quotation'
  | 'won'
  | 'customer'
  | 'completed'
  | 'lost';

export type LostReason =
  | 'price'
  | 'competitor'
  | 'not_interested'
  | 'postponed'
  | 'could_not_contact'
  | 'changed_requirements'
  | 'other';

export type CustomerSource =
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'website'
  | 'whatsapp'
  | 'walk_in'
  | 'phone'
  | 'referral'
  | 'other';

export type ActivityType =
  | 'note'
  | 'phone_call'
  | 'whatsapp'
  | 'meeting'
  | 'status_change'
  | 'measurement'
  | 'quotation_created'
  | 'order_created'
  | 'payment_received'
  | 'system';

export interface CustomerActivity {
  id: string;
  customerId: string;
  type: ActivityType;
  title: string;
  note: string;
  date: string;
  timestamp: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  metadata?: Record<string, any>;
}

export interface CustomerReminder {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  title: string;
  dueDate: string;
  dueTime?: string;
  assignedUserId: string;
  assignedUserName: string;
  isCompleted: boolean;
  createdDate: string;
  priority: 'normal' | 'high';
}

export interface MarketingCampaign {
  id: string;
  name: string;
  nameEn: string;
  platform: CustomerSource;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'paused';
  budget: number;
  externalId?: string;
  customersCount: number;
  purchasedCount: number;
  revenueAttributed: number;
  notes?: string;
}

export interface CustomerDocument {
  id: string;
  customerId: string;
  title: string;
  category?: 'national_id' | 'site_photos' | 'sketch_drawing' | 'signed_contract' | 'payment_receipt' | 'other';
  fileType: 'pdf' | 'image' | 'cad' | 'doc';
  fileName: string;
  fileSize: string;
  uploadedDate: string;
  uploadedByName: string;
  url?: string;
  notes?: string;
}

export interface AfterSalesRecord {
  id: string;
  customerId: string;
  completedDate: string;
  itemDescription: string;
  warrantyPeriod: string;
  lastServiceCheck?: string;
  satisfactionRating: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export type CustomerInterestType = 'furniture' | 'kitchens' | 'both' | 'custom';
export type CustomerType = 'individual' | 'commercial';
export type CustomerBillingMethod = 'printed' | 'email' | 'whatsapp' | 'electronic_tax';
export type CustomerTier = 'standard' | 'vip' | 'wholesale';

export interface CustomerAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: string;
  uploadedAt: string;
}

export interface Customer {
  id: string;
  code: string; // e.g. "CUST-2026-0001"
  customerType: CustomerType; // 'individual' | 'commercial'
  fullName: string;
  companyName?: string; // For commercial clients (الاسم التجاري)
  contactPerson?: string; // For commercial clients (اسم المسؤول / المفوض)
  contactRole?: string; // For commercial clients (المسمى الوظيفي)
  taxId?: string; // الرقم الضريبي / البطاقة الضريبية
  commercialRegister?: string; // السجل التجاري
  billingMethod: CustomerBillingMethod; // 'printed' | 'email' | 'whatsapp' | 'electronic_tax'
  tier?: CustomerTier; // 'standard' | 'vip' | 'wholesale'
  nationalId?: string; // الرقم القومي للأفراد (اختياري)
  phone: string;
  altPhone?: string;
  email?: string;
  city: string;
  area: string;
  address?: string;
  interestType: CustomerInterestType;
  status: CustomerStatus;
  lostReason?: LostReason;
  lostNote?: string;
  source: CustomerSource;
  campaignId?: string;
  campaignName?: string;
  branchId: string;
  branchName: string;
  responsibleUserId?: string;
  responsibleUserName?: string;
  notes?: string;
  avatar?: string;
  initialAttachments?: CustomerAttachment[];
  createdDate: string;
  lastActivityDate: string;
  
  hasPurchased: boolean;
  isAfterSales: boolean;
  
  quotationRef?: string;
  quotationAmount?: number;
  orderRef?: string;
  orderAmount?: number;
  paidAmount?: number;
  measurementDate?: string;
}

// ----------------------------------------------------
// CUSTOM PROJECTS WORKFLOW TYPES (PROMPTS 5 & 6)
// ----------------------------------------------------

export type ProjectType =
  | 'kitchen'
  | 'bedroom'
  | 'wardrobe'
  | 'tv_unit'
  | 'living'
  | 'furniture'
  | 'other';

export type ProjectStatus =
  | 'new'
  | 'opportunity'
  | 'visit_scheduled'
  | 'measured'
  | 'designing'
  | 'design_review'
  | 'design_approved'
  | 'quotation'
  | 'quotation_sent'
  | 'customer_approval'
  | 'approved'
  | 'contract_draft'
  | 'contract_signed'
  | 'deposit_verified'
  | 'ready_for_handover'
  | 'handed_over_to_tech_office'
  | 'ready_for_production'
  | 'in_production'
  | 'production_completed'
  | 'installation_scheduled'
  | 'installed'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export interface CustomProject {
  id: string;
  projectNumber: string; // e.g. "PRJ-2026-001"
  projectName: string;   // e.g. "مطبخ مودرن رويل HPL"
  customerId: string;
  customerName: string;
  customerPhone: string;
  branchId: string;
  branchName: string;
  projectType: ProjectType;
  assignedUserId: string;
  assignedUserName: string;
  status: ProjectStatus;
  createdDate: string;
  lastUpdatedDate: string;
  contractId?: string;
  approvedQuotationId?: string;
  approvedDesignId?: string;
  handoverId?: string;
  notes?: string;
}

export type SiteVisitStatus = 'scheduled' | 'completed' | 'cancelled';

export interface SiteVisit {
  id: string;
  projectId: string;
  projectNumber: string;
  customerName: string;
  date: string;
  time: string;
  address: string;
  assignedUserId: string;
  assignedUserName: string;
  status: SiteVisitStatus;
  notes?: string;
  photos: string[];
  videos?: string[];
  siteConditions?: {
    hasColumn?: boolean;
    columnDetails?: string;
    windowLocation?: string;
    electricalPoints?: string;
    waterConnection?: string;
    gasConnection?: string;
    ceilingHeight?: string;
    wallStraightness?: string;
    flooringLevel?: string;
    customerPreferences?: string;
  };
}

export interface MeasurementItem {
  id: string;
  name: string;
  value: number;
  unit: 'cm' | 'mm' | 'meter';
  notes?: string;
  photoUrl?: string;
  videoUrl?: string;
}

export interface ProjectMeasurement {
  id: string;
  projectId: string;
  version: number;
  createdDate: string;
  createdByUserName: string;
  reasonForUpdate?: string;
  items: MeasurementItem[];
  sitePhotos?: string[];
  siteVideos?: string[];
  technicalNotes?: string;
}

export interface ProjectRequirements {
  colorPreference?: string;
  style?: string;
  materialPreference?: string;
  storageRequirements?: string;
  drawersCount?: number;
  appliances?: string;
  budgetExpectation?: number;
  specialNotes?: string;
}

export type DesignStatus = 'draft' | 'sent_to_customer' | 'under_review' | 'approved' | 'rejected';

export interface DesignComment {
  id: string;
  userName: string;
  text: string;
  date: string;
  isCustomer: boolean;
}

export interface ProjectDesign {
  id: string;
  projectId: string;
  designName: string;
  version: number;
  images: string[];
  pdfUrl?: string;
  notes?: string;
  createdByUserName: string;
  createdDate: string;
  status: DesignStatus;
  rejectionReason?: string;
  comments: DesignComment[];
  approvedAt?: string;
  approvedByCustomerName?: string;
}

export type QuotationStatus = 'draft' | 'sent' | 'under_review' | 'accepted' | 'rejected' | 'expired';

export interface QuotationLineItem {
  id: string;
  materialId?: string;
  materialName: string;
  itemType: 'material' | 'product' | 'work' | 'accessory';
  description?: string;
  quantity: number;
  unit: string;
  unitCost: number;          // Internal reference cost
  unitSellingPrice: number;  // Customer selling price
  totalCost: number;
  totalSellingPrice: number;
}

export interface QuotationSpecification {
  doors: string;           // توصيف الضلف (e.g. بولي لاك تركي لامع كود 812)
  carcass: string;         // توصيف الشاسيه (e.g. جود وود 18مم معالج HPL ضد المياه)
  hinges: string;          // المفصلات ومجرى الأدراج (e.g. بلوم نمساوي أصلي Soft-Close)
  notes?: string;          // ملاحظات فنية
}

export interface QuotationMeterage {
  baseUnitsMeters: number;      // علب سفلية (م.ط)
  upperUnitsMeters: number;     // علب علوية (م.ط)
  tallUnitsMeters: number;      // دواليب طولية (م.ط)
  totalMeters: number;          // إجمالي عدد الأمتار
  pricePerMeter: number;        // سعر المتر
  totalPrice: number;           // الإجمالي
}

export interface QuotationAdditions {
  handles: { description: string; price: number };      // مقابض
  ledProfile: { description: string; price: number };   // ليد بروفايل
  glassFrames: { description: string; price: number };  // زجاج
  cladding: { description: string; price: number };     // تجاليد
  totalPrice: number;
}

export interface QuotationTableRow {
  id?: string;
  name: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  totalPrice: number;
  notes?: string;
}

export interface QuotationMarble {
  typeName: string;
  meters: number;
  pricePerMeter: number;
  totalPrice: number;
}

export interface QuotationLogistics {
  location: string;
  floor: string;
  notes?: string;
  totalPrice: number;
}

export interface QuotationPaymentTerms {
  downPaymentPercent: number;        // 40%
  productionPaymentPercent: number;  // 40%
  deliveryPaymentPercent: number;    // 20%
  deliveryDurationDays: string;      // 25 - 35 يوم عمل
  warrantyYears: number;             // 5 سنوات
}

export interface QuotationBreakdown {
  quoteType?: 'kitchen' | 'dressing' | 'furniture' | 'decor';
  specifications: QuotationSpecification;
  meterage: QuotationMeterage;
  additions: QuotationAdditions;
  mechanisms: QuotationTableRow[];
  accessories: QuotationTableRow[];
  marble: QuotationMarble;
  otherWorks: QuotationTableRow[];
  logistics: QuotationLogistics;
  grandTotal: number;
  paymentTerms: QuotationPaymentTerms;
}

export interface ProjectQuotation {
  id: string;
  projectId: string;
  version: number;
  createdDate: string;
  createdByUserName: string;
  status: QuotationStatus;
  rejectionReason?: string;
  items: QuotationLineItem[];
  subtotalSelling: number;
  subtotalCost: number;
  discount: number;
  totalSelling: number;
  totalCost: number;
  estimatedProfit: number;
  notes?: string;
  acceptedAt?: string;
  acceptedByCustomerName?: string;
  breakdown?: QuotationBreakdown;
}

export interface ProjectTimelineEvent {
  id: string;
  projectId: string;
  title: string;
  description: string;
  timestamp: string;
  userName: string;
  type: 'created' | 'visit' | 'measurement' | 'design' | 'quotation' | 'approval' | 'contract' | 'order' | 'payment' | 'production' | 'installation' | 'handover' | 'system';
}

// ----------------------------------------------------
// PRODUCTION & INSTALLATION TYPES (PROMPT 7)
// ----------------------------------------------------

export type ProductionOrderStatus =
  | 'pending'
  | 'in_production'
  | 'completed'
  | 'ready_installation'
  | 'on_hold'
  | 'cancelled';

export interface ProductionMaterialItem {
  id: string;
  productionOrderId: string;
  materialId: string;
  materialName: string;
  materialCode: string;
  unit: string;
  requiredQuantity: number;
  reservedQuantity: number;
  consumedQuantity: number;
  remainingQuantity: number;
  estimatedUnitCost: number;
  estimatedTotalCost: number;
  actualUnitCost: number;
  actualTotalCost: number;
  status: 'pending' | 'reserved' | 'partially_consumed' | 'consumed' | 'shortage';
}

export interface ProductionOrder {
  id: string;
  productionNumber: string; // e.g. "PROD-2026-0012"
  orderId: string;
  orderNumber: string;
  projectId: string;
  projectNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  branchId: string;
  branchName: string;
  workshopLocation: string; // e.g. "ورشة تصنيع العبور"
  startDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  assignedTeam: string[]; // Team employee names
  status: ProductionOrderStatus;
  notes?: string;
  completionPhotos: string[];
  materials: ProductionMaterialItem[];
  totalEstimatedMaterialCost: number;
  totalActualMaterialCost: number;
  materialVariance: number;
  createdDate: string;
}

export type InstallationStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';

export interface InstallationRecord {
  id: string;
  installationNumber: string; // e.g. "INST-2026-005"
  productionOrderId: string;
  orderId: string;
  orderNumber: string;
  projectId: string;
  projectNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  scheduledDate: string;
  scheduledTime: string;
  assignedTeam: string[]; // User IDs
  assignedTeamNames: string[];
  status: InstallationStatus;
  completionDate?: string;
  notes?: string;
  beforePhotos: string[];
  afterPhotos: string[];
  handoverStatus: 'pending' | 'ready_for_handover' | 'delivered';
  handoverDate?: string;
}

export type CustomContractStatus = 'draft' | 'sent' | 'customer_review' | 'signed' | 'cancelled';

export interface PaymentMilestone {
  id: string;
  milestoneIndex: number;
  title: string; // e.g. "عربون وتأكيد التعاقد", "دفعة بدء التشغيل قبل الشحن", "دفعة الاستلام النهائي والتركيب"
  percentage: number; // e.g. 40
  amount: number; // e.g. 184000
  dueDateDescription: string; // e.g. "عند توقيع العقد", "قبل خروج البضاعة من المصنع", "خلال 48 ساعة من انتهاء التركيب"
  status: 'pending' | 'partially_paid' | 'paid' | 'verified_in_finance';
  paidAmount?: number;
  financialReceiptRef?: string;
  paymentDate?: string;
  notes?: string;
}

export interface CustomContract {
  id: string;
  contractNumber: string; // e.g. "CNT-2026-001"
  projectId: string;
  projectNumber: string;
  customerId: string;
  customerName: string;
  quotationId: string;
  quotationVersion: number;
  contractDate: string;
  totalValue: number;
  paymentTerms: string;
  deliveryTerms: string;
  milestones: PaymentMilestone[];
  status: CustomContractStatus;
  signedAt?: string;
  signedByCustomerName?: string;
  isDepositVerified?: boolean;
  notes?: string;
  pdfUrl?: string;
}

export interface ProjectHandoverChecklist {
  contractSigned: boolean;
  contractNumber?: string;
  depositVerifiedInFinance: boolean;
  depositReceiptNumber?: string;
  depositAmount?: number;
  approvedQuotationVersion: number;
  commercialSpecsLocked: boolean;
  approvedDesignVersion: number;
  siteSurveyCompleted: boolean;
  surveyObstaclesChecked: boolean;
  technicalDocumentsAttached: boolean;
}

export interface ProjectHandoverProtocol {
  id: string;
  projectId: string;
  projectNumber: string;
  customerName: string;
  status: 'pending' | 'submitted' | 'accepted_by_tech_office' | 'returned_for_clarification';
  submittedDate?: string;
  submittedByUserName?: string;
  acceptedDate?: string;
  acceptedByUserName?: string;
  checklist: ProjectHandoverChecklist;
  notesForTechOffice?: string;
  clarificationRequests?: string;
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string; // e.g. "RCP-2026-089"
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'card' | 'check' | 'other' | string;
  paymentType: 'deposit' | 'installment' | 'full_payment';
  receivedByUserName: string;
  notes?: string;
}

// ----------------------------------------------------
// MATERIALS LIBRARY & PURCHASING (PROMPT 4)
// ----------------------------------------------------

export type MaterialCategory =
  | 'mdf'
  | 'hdf'
  | 'plywood'
  | 'hpl'
  | 'acrylic'
  | 'edge_band'
  | 'hinges'
  | 'handles'
  | 'drawers'
  | 'rails'
  | 'screws'
  | 'glue'
  | 'aluminum'
  | 'glass'
  | 'marble'
  | 'fabric'
  | 'foam'
  | 'accessories'
  | 'other';

export interface MaterialSpecification {
  key: string;
  value: string;
}

export interface MaterialSupplierPricing {
  supplierId: string;
  supplierName: string;
  purchaseCost: number;
  lastPurchaseDate: string;
  supplierCode?: string;
  isPreferred?: boolean;
  notes?: string;
}

export interface MaterialStockLocation {
  branchId: string;
  branchName: string;
  onHand: number;
  reserved: number;
  available: number;
}

export interface Material {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  category: MaterialCategory;
  categoryName: string;
  unit: string;
  description?: string;
  specifications: MaterialSpecification[];
  image?: string;
  minStockLevel: number;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  status: 'active' | 'inactive';
  currentReferenceCost: number;
  suppliers: MaterialSupplierPricing[];
  stockByLocation: MaterialStockLocation[];
  createdDate: string;
}

export type ItemType = 'product' | 'material';

export interface PurchaseOrderItem {
  id: string;
  itemId: string;
  itemType: ItemType;
  itemName: string;
  itemCode: string;
  quantity: number;
  receivedQuantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export type ReceivingStatus = 'pending' | 'partially_received' | 'fully_received';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  branchName: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  receivingStatus: ReceivingStatus;
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid';
  createdByUserName: string;
  notes?: string;
}

export type StockMovementType =
  | 'purchase_receipt'
  | 'sale'
  | 'material_consumption'
  | 'transfer_out'
  | 'transfer_in'
  | 'supplier_return'
  | 'customer_return'
  | 'adjustment'
  | 'reservation'
  | 'reservation_release';

export interface StockMovement {
  id: string;
  itemId: string;
  itemType: ItemType;
  itemName: string;
  itemCode: string;
  quantity: number;
  sourceBranchId?: string;
  sourceBranchName?: string;
  destinationBranchId?: string;
  destinationBranchName?: string;
  movementType: StockMovementType;
  referenceNumber: string;
  timestamp: string;
  userId: string;
  userName: string;
  notes?: string;
}

export type StockTransferStatus = 'requested' | 'approved' | 'sent' | 'received' | 'cancelled';

export interface StockTransferItem {
  itemId: string;
  itemType: ItemType;
  itemName: string;
  itemCode: string;
  quantity: number;
  unit: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  sourceBranchId: string;
  sourceBranchName: string;
  destinationBranchId: string;
  destinationBranchName: string;
  status: StockTransferStatus;
  items: StockTransferItem[];
  requestedDate: string;
  sentDate?: string;
  receivedDate?: string;
  requestedByUserId: string;
  requestedByUserName: string;
  approvedByUserName?: string;
  receivedByUserName?: string;
  notes?: string;
}

export interface SupplierReturnItem {
  itemId: string;
  itemType: ItemType;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface SupplierReturn {
  id: string;
  returnNumber: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  branchName: string;
  purchaseOrderNumber?: string;
  items: SupplierReturnItem[];
  reason: string;
  returnDate: string;
  totalRefundAmount: number;
  processedByUserName: string;
  notes?: string;
}

// ----------------------------------------------------
// READY-MADE SALES, PRODUCTS & SUPPLIERS TYPES (PROMPT 3)
// ----------------------------------------------------

export type ProductCategory = 
  | 'sofas'
  | 'bedrooms'
  | 'dining'
  | 'living'
  | 'tv_units'
  | 'wardrobes'
  | 'kitchen_ready'
  | 'kitchen_acc';

export interface ProductVariant {
  id: string;
  name: string;
  color?: string;
  size?: string;
  fabric?: string;
  sku: string;
  additionalPrice?: number;
}

export interface SupplierProductPricing {
  supplierId: string;
  supplierName: string;
  purchaseCost: number;
  lastPurchaseDate: string;
  isPreferred?: boolean;
}

export interface ProductStockLocation {
  branchId: string;
  branchName: string;
  onHand: number;
  reserved: number;
  available: number;
  delivered: number;
}

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  sku: string;
  category: ProductCategory;
  categoryName: string;
  type: 'furniture' | 'kitchen';
  model: string;
  description: string;
  images: string[];
  status: 'active' | 'discontinued' | 'out_of_stock';
  sellingPrice: number;
  defaultPurchaseCost: number;
  variants: ProductVariant[];
  suppliers: SupplierProductPricing[];
  stockByLocation: ProductStockLocation[];
  createdDate: string;
}

export interface SupplierPurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }[];
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid';
  notes?: string;
}

export interface SupplierPaymentRecord {
  id: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'check';
  referenceNumber?: string;
  processedByUserName: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  specialty: string;
  totalPurchases: number;
  totalPaid: number;
  balanceDue: number;
  paymentTerms: string;
  rating: number;
  createdDate: string;
}

export type OrderStatus =
  | 'draft'
  | 'confirmed'
  | 'preparing'
  | 'preparing_production'
  | 'in_production'
  | 'ready_for_delivery'
  | 'ready_installation'
  | 'installation_scheduled'
  | 'installed'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type DeliveryStatus =
  | 'pending'
  | 'preparing'
  | 'ready_for_delivery'
  | 'in_transit'
  | 'delivered';

export type OrderPaymentStatus =
  | 'unpaid'
  | 'deposit_paid'
  | 'partially_paid'
  | 'fully_paid';

export interface OrderItem {
  id: string;
  productId?: string;
  productName: string;
  productCode: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitSellingPrice: number;
  actualPurchaseCost: number;
  discountAmount: number;
  totalSellingPrice: number;
  totalPurchaseCost: number;
  itemGrossProfit: number;
  stockAvailability?: 'available' | 'partially_available' | 'out_of_stock';
  notes?: string;
}

export interface CustomerPayment {
  id: string;
  orderId: string;
  orderNumber?: string;
  customerId?: string;
  customerName?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'card' | 'check' | 'other' | string;
  receiptReference?: string;
  receiptRef?: string;
  receivedByUserName?: string;
  receivedByUserId?: string;
  notes?: string;
  paymentType?: 'deposit' | 'installment' | 'full_payment';
}

export interface PaymentSchedule {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  installmentNumber: number;
  amount: number;
  paidAmount?: number;
  remainingAmount?: number;
  dueDate: string;
  status: 'paid' | 'partially_paid' | 'upcoming' | 'due' | 'overdue' | 'cancelled';
  paidDate?: string;
  paymentRef?: string;
  notes?: string;
}

export interface OrderDeliveryInfo {
  deliveryStatus: DeliveryStatus;
  scheduledDate?: string;
  actualDeliveryDate?: string;
  deliveryAddress: string;
  city: string;
  area: string;
  deliveryNotes?: string;
  deliveredByTeam?: string;
  recipientName?: string;
  recipientPhone?: string;
}

export interface OrderReturn {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  reason: string;
  returnDate: string;
  condition: 'like_new' | 'damaged' | 'refurbished';
  stockAction: 'returned_to_stock' | 'sent_to_workshop' | 'scrapped';
  refundAmount: number;
  processedByUserName: string;
  notes?: string;
}

export interface ReadyOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  branchId: string;
  branchName: string;
  salesUserId: string;
  salesUserName: string;
  projectId?: string;
  contractId?: string;
  quotationId?: string;
  items: OrderItem[];
  subtotal: number;
  totalDiscount: number;
  orderTotal: number;
  totalPurchaseCost: number;
  grossProfit: number;
  paymentStatus: OrderPaymentStatus;
  depositAmount: number;
  paidAmount: number;
  remainingBalance: number;
  orderStatus: OrderStatus;
  deliveryInfo: OrderDeliveryInfo;
  createdDate: string;
  lastUpdatedDate: string;
  notes?: string;
  paymentSchedules?: PaymentSchedule[];
}

export type DemoPersonaId = 'ahmed_owner' | 'omar_moderator' | 'sara_accountant';

export interface DemoPersona {
  id: DemoPersonaId;
  name: string;
  nameEn: string;
  roleTitle: string;
  roleId: string;
  userId: string;
  assignedBranchNames: string[];
  restrictedBranchNames: string[];
  description: string;
  descriptionEn: string;
  keyTests: string[];
}

export interface ApiSecurityTestResult {
  endpoint: string;
  method: string;
  module: ModuleId;
  requiredAction: keyof PermissionActions;
  targetBranchId?: string;
  timestamp: string;
  isAllowed: boolean;
  reason: string;
  reasonEn: string;
  statusCode: number;
}

// ====================================================
// ENTERPRISE WAREHOUSES & INVENTORY MODULE INTERFACES
// ====================================================

export type WarehouseCategoryType =
  | 'raw_materials'
  | 'finished_goods'
  | 'wip_workshop'
  | 'hardware_accessories'
  | 'spare_parts_tools'
  | 'scrap_waste'
  | 'showroom_floor';

export interface WarehouseLocation {
  id: string;
  code: string; // e.g. "WH-OBR-01"
  name: string; // e.g. "مستودع الخامات الرئيسي - مجمع العبور"
  nameEn: string;
  branchId: string;
  branchName: string;
  type: WarehouseCategoryType;
  managerName: string;
  phone: string;
  address: string;
  capacityPercentage: number;
  totalItemsCount: number;
  totalValuation: number;
  aisles: string[]; // e.g. ["A1", "A2", "B1", "B2"]
  isActive: boolean;
}

export type ItemCardCategory =
  | 'wood_panels'           // ألواح خشب (MDF, HDF, كاونتر, زان)
  | 'veneers_hpl'            // تجاليد وبولي لاك وHPL وقواطع
  | 'hardware_hinges'        // مفصلات ومجاري أدراج ومقابض
  | 'hardware_accessories'   // إكسسوارات ومفصلات ومقابض
  | 'paints_adhesives'       // دهانات، غراء، وسيليكون
  | 'glass_marble'           // زجاج ورخام وكوارتز
  | 'spare_parts_tools'      // قطع غيار وشفرات CNC وزيوت
  | 'finished_kitchen'       // مطابخ تامة الصنع
  | 'finished_furniture'     // غرف وأثاث تام الصنع
  | 'semi_finished';         // هياكل نصف مصنعة

export interface ItemMasterCard {
  id: string;
  code: string; // SKU: "RAW-MDF-18"
  barcode: string; // "622100492811"
  nameAr: string;
  nameEn: string;
  category: ItemCardCategory;
  categoryNameAr: string;
  unit: 'sheet' | 'm_linear' | 'm2' | 'kg' | 'set' | 'pcs' | 'can';
  unitNameAr: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minStockLevel: number; // Safety stock
  reorderPoint: number;  // Reorder trigger level
  maxStockLevel: number;
  weightedAvgCost: number; // EGP
  lastPurchasePrice: number; // EGP
  sellingPrice: number;    // EGP
  defaultWarehouseId: string;
  defaultWarehouseName: string;
  locationBin: string;     // e.g. "ممر 2 - رف B - خانة 04"
  specifications: { key: string; value: string }[];
  supplierId?: string;
  supplierName?: string;
  status: 'active' | 'low_stock' | 'out_of_stock' | 'discontinued';
  image?: string;
}

export type GRNType =
  | 'purchase_receipt'           // استلام مشتريات خامات من مورد
  | 'production_receipt'         // استلام إنتاج تام من الورشة
  | 'order_return'               // إرجاع خامات متبقية من أمر إنتاج
  | 'stock_adjustment_surplus';  // تسوية زيادة جردية

export interface GRNLineItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: string;
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
  totalCost: number;
  locationBin: string;
  notes?: string;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string; // e.g. "GRN-2026-0089"
  type: GRNType;
  supplierId?: string;
  supplierName?: string;
  purchaseOrderId?: string;
  poNumber?: string;
  productionOrderId?: string;
  productionOrderNumber?: string;
  warehouseId: string;
  warehouseName: string;
  date: string;
  items: GRNLineItem[];
  totalAmount: number;
  status: 'draft' | 'posted' | 'cancelled';
  journalEntryId?: string;
  createdByUserName: string;
  approvedByUserName?: string;
  notes?: string;
}

export type GINType =
  | 'production_mo'              // صرف خامات لأمر تصنيع
  | 'maintenance_workshop'       // صرف مهمات وصيانة للماكينات
  | 'scrap_waste'                // صرف وتكهين هالك وتوالف
  | 'showroom_sample'            // صرف عينات وتجهيز معارض
  | 'general_issue';             // صرف عام

export interface GINLineItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: string;
  requestedQty: number;
  issuedQty: number;
  unitCost: number;
  totalCost: number;
  locationBin: string;
  notes?: string;
}

export interface GoodsIssueNote {
  id: string;
  ginNumber: string; // e.g. "GIN-2026-0045"
  type: GINType;
  productionOrderId?: string;
  productionOrderNumber?: string;
  costCenterId?: string;
  costCenterName?: string;
  machineName?: string; // e.g. "ماكينة CNC روتر 3D"
  warehouseId: string;
  warehouseName: string;
  date: string;
  items: GINLineItem[];
  totalAmount: number;
  status: 'draft' | 'posted' | 'cancelled';
  journalEntryId?: string;
  requestedByUserName: string;
  approvedByUserName?: string;
  issuedByUserName: string;
  notes?: string;
}

export interface MaterialRequisition {
  id: string;
  requisitionNumber: string; // e.g. "MRN-2026-0033"
  purpose: 'production' | 'maintenance' | 'sample';
  productionOrderId?: string;
  productionOrderNumber?: string;
  department: string;
  requestedByUserName: string;
  approvedByUserName?: string;
  approvedDate?: string;
  date: string;
  requiredDate: string;
  items: {
    itemId: string;
    itemCode: string;
    itemName: string;
    unit: string;
    requestedQty: number;
    notes?: string;
  }[];
  status: 'pending' | 'approved' | 'partially_issued' | 'fully_issued' | 'rejected';
  ginId?: string;
  notes?: string;
}

export interface StocktakeLine {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  category: ItemCardCategory;
  unit: string;
  locationBin: string;
  systemQty: number;
  countedQty: number;
  varianceQty: number;
  unitCost: number;
  varianceAmount: number; // positive = surplus, negative = deficit
  notes?: string;
}

export interface StocktakeSession {
  id: string;
  sessionNumber: string; // e.g. "STK-2026-0004"
  warehouseId: string;
  warehouseName: string;
  categoryFilter?: string;
  startDate: string;
  completionDate?: string;
  status: 'in_progress' | 'completed' | 'posted' | 'cancelled';
  lines: StocktakeLine[];
  totalSystemValue: number;
  totalCountedValue: number;
  totalVarianceAmount: number;
  postedJournalEntryId?: string;
  conductedByUserName: string;
  approvedByUserName?: string;
  notes?: string;
}

export interface StockLedgerEntry {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  date: string;
  documentType: 'GRN' | 'GIN' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'RETURN';
  documentNumber: string;
  warehouseId: string;
  warehouseName: string;
  qtyIn: number;
  qtyOut: number;
  balanceAfter: number;
  unitCost: number;
  totalCost: number;
  userName: string;
  notes?: string;
}

export * from './procurement';
export * from './sales';
