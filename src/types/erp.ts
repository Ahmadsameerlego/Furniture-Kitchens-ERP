export type BusinessType = 'furniture' | 'kitchens' | 'furniture_kitchens';
export type BusinessModel = 'ready_made' | 'custom_made' | 'ready_custom';
export type LocationType = 'showroom' | 'warehouse' | 'workshop';

export type ModuleId = 
  | 'dashboard'
  | 'customers'
  | 'campaigns'
  | 'sales'
  | 'custom_projects'
  | 'products'
  | 'materials'
  | 'inventory'
  | 'suppliers'
  | 'production'
  | 'installation'
  | 'finance'
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
  | 'large_expense';

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
  fileType: 'pdf' | 'image' | 'cad' | 'doc';
  fileName: string;
  fileSize: string;
  uploadedDate: string;
  uploadedByName: string;
  url?: string;
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

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  altPhone?: string;
  email?: string;
  city: string;
  area: string;
  address?: string;
  interestType: 'furniture' | 'kitchens' | 'both';
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
  avatar: string;
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
  | 'visit_scheduled'
  | 'measured'
  | 'designing'
  | 'design_review'
  | 'quotation'
  | 'customer_approval'
  | 'approved'
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

// ----------------------------------------------------
// CONTRACTS & COMMERCIAL CONVERSION (PROMPT 6)
// ----------------------------------------------------

export type CustomContractStatus = 'draft' | 'sent' | 'customer_review' | 'signed' | 'cancelled';

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
  status: CustomContractStatus;
  signedAt?: string;
  signedByCustomerName?: string;
  notes?: string;
  pdfUrl?: string;
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
