// ====================================================
// REWAQ ERP — PROCUREMENT & PURCHASING MODULE TYPES
// Enterprise-Grade Sourcing, RFQ, Quotes, PO, Deliveries & 3-Way Match
// ====================================================

import { ModuleId, ItemType } from './erp';

// ----------------------------------------------------
// 1. PURCHASE REQUEST (PR)
// ----------------------------------------------------

export type PRSourceType = 
  | 'planning_proposal'        // مقترح تخطيط قادم من MRP
  | 'production_shortage'      // نقص أثناء أمر تصنيع بالورشة
  | 'safety_stock'             // تعويض الحد الأدنى للمخزون
  | 'maintenance'              // صيانة وقطع غيار
  | 'admin'                    // طلب إداري
  | 'manual_project'           // طلب يدوي مباشر لمشروع تفصيل
  | 'manual_general';          // طلب شراء عام

export type PRStatus = 
  | 'draft'                    // مسودة
  | 'pending_approval'         // بانتظار اعتماد مدير المشتريات
  | 'approved'                 // معتمد وجاهز للتسعير والشراء
  | 'partially_processed'      // تم إنشاء RFQ أو أمر شراء جزئي
  | 'fully_processed'          // تم إصدار أوامر شراء لجميع البنود
  | 'rejected'                 // مرفوض
  | 'cancelled';               // ملغي

export type PRPriority = 'normal' | 'high' | 'urgent';

export interface PurchaseRequestItem {
  id: string;
  itemId: string;              // Material.id or ItemMasterCard.id
  itemCode: string;
  itemName: string;
  itemCategory: string;
  quantity: number;
  uom: string;                 // وحدة القياس (لوح، متر، طقم، قطعة)
  estimatedUnitCost: number;   // EGP
  estimatedTotalCost: number;  // EGP
  suggestedSupplierId?: string;
  suggestedSupplierName?: string;
  requiredDate: string;        // YYYY-MM-DD
  specifications?: string;
  notes?: string;
  
  // Traceability link
  demandId?: string;
  projectId?: string;
  projectNumber?: string;
  projectName?: string;
  customerName?: string;

  // Processing tracker
  processedQuantity: number;
  remainingQuantity: number;
  status: 'pending' | 'rfq_created' | 'po_created' | 'cancelled';
}

export interface PurchaseRequestRevision {
  revisionNumber: number;
  modifiedDate: string;
  modifiedByUserName: string;
  reason: string;
  changesSummary: string;
}

export interface PurchaseRequest {
  id: string;
  prNumber: string;            // e.g. "PR-2026-001"
  requestDate: string;
  requiredDate: string;
  priority: PRPriority;
  status: PRStatus;
  
  requesterId: string;
  requesterName: string;
  department: 'planning' | 'production' | 'warehouse' | 'sales' | 'maintenance' | 'admin';
  
  sourceType: PRSourceType;
  sourceReference?: string;    // e.g. "PROP-PO-2026-001" or "PRJ-2026-001"
  
  // Project Traceability
  projectId?: string;
  projectNumber?: string;
  projectName?: string;
  customerName?: string;
  contractNumber?: string;
  technicalReleaseNumber?: string;

  warehouseId: string;
  warehouseName: string;
  branchId: string;
  branchName: string;
  
  items: PurchaseRequestItem[];
  totalEstimatedValue: number;
  
  suggestedSupplierId?: string;
  suggestedSupplierName?: string;
  
  notes?: string;
  attachments?: string[];
  
  // Approval
  approvedByUserName?: string;
  approvedDate?: string;
  rejectionReason?: string;
  
  // Linked downstream documents
  rfqIds: string[];
  rfqNumbers: string[];
  poIds: string[];
  poNumbers: string[];
  
  revisions: PurchaseRequestRevision[];
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// 2. REQUEST FOR QUOTATION (RFQ)
// ----------------------------------------------------

export type RFQStatus = 
  | 'draft'                    // مسودة
  | 'sent'                     // تم الإرسال للموردين
  | 'partially_responded'      // وردت بعض العروض
  | 'fully_responded'          // وردت عروض من جميع الموردين المدعوين
  | 'comparison_completed'     // تمت المقارنة واختيار العرض الفائز
  | 'closed'                   // مغلق ومحول لأمر شراء
  | 'cancelled';               // ملغي

export interface RFQSupplierInvitation {
  supplierId: string;
  supplierName: string;
  supplierCode?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  invitationStatus: 'invited' | 'viewed' | 'quoted' | 'declined' | 'expired';
  quotationId?: string;
  quotationNumber?: string;
  sentDate: string;
  responseDate?: string;
  notes?: string;
}

export interface RFQItem {
  id: string;
  prItemId?: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  uom: string;
  technicalSpecs?: string;
  requiredDeliveryDate: string;
  deliveryLocation: string;
  targetBudgetUnitPrice?: number;
}

export interface RequestForQuotation {
  id: string;
  rfqNumber: string;           // e.g. "RFQ-2026-001"
  issueDate: string;
  responseDeadline: string;    // YYYY-MM-DD
  requiredDeliveryDate: string;
  
  purchaseRequestId?: string;
  purchaseRequestNumber?: string;
  
  projectId?: string;
  projectNumber?: string;
  projectName?: string;
  customerName?: string;
  
  warehouseId: string;
  warehouseName: string;
  branchId: string;
  branchName: string;
  
  items: RFQItem[];
  targetSuppliers: RFQSupplierInvitation[];
  
  paymentTermsRequested: string; // e.g. "آجل 30 يوم" / "50% مقدم و 50% عند التوريد"
  deliveryTermsRequested: string; // e.g. "التسليم داخل مخزن الشركة بالعاشر من رمضان شامل النقل"
  
  status: RFQStatus;
  notes?: string;
  attachments?: string[];
  
  selectedQuotationId?: string;
  selectedSupplierName?: string;
  selectionReason?: string;
  
  createdByUserName: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// 3. SUPPLIER QUOTATION
// ----------------------------------------------------

export type SupplierQuotationStatus = 
  | 'received'                 // عرض سعر مستلم
  | 'under_review'             // قيد المراجعة الفنية والتجارية
  | 'selected'                 // تم اختياره وتأكيده للشراء
  | 'rejected'                 // مستبعد / لم يقع عليه الاختيار
  | 'expired';                 // منتهي الصلاحية

export interface SupplierQuotationItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  uom: string;
  unitPrice: number;           // السعر قبل الخصم والضريبة
  discountPercent: number;     // نسبة الخصم %
  discountAmount: number;      // قيمة الخصم
  taxPercent: number;          // ضريبة القيمة المضافة (افتراضي 14%)
  taxAmount: number;           // قيمة الضريبة
  lineTotal: number;           // الإجمالي = (unitPrice - discount) * qty + tax
  leadTimeDays: number;        // مدة التوريد بالأيام
  warrantyMonths?: number;     // شهور الضمان
  brandOrOrigin?: string;      // الماركة / بلد المنشأ
  notes?: string;
}

export interface SupplierQuotation {
  id: string;
  quotationNumber: string;     // رقم عرض المورد أو رقم داخلي e.g. "SQ-2026-001"
  vendorQuoteReference?: string; // رقم الفاتورة المبدئية أو عرض المورد الفعلي
  
  rfqId?: string;
  rfqNumber?: string;
  purchaseRequestId?: string;
  purchaseRequestNumber?: string;
  
  supplierId: string;
  supplierName: string;
  supplierContactPerson?: string;
  supplierPhone?: string;
  
  quotationDate: string;
  validUntil: string;          // تاريخ انتهاء صلاحية العرض
  currency: 'EGP' | 'USD' | 'EUR';
  exchangeRate: number;        // 1.0 for EGP
  
  items: SupplierQuotationItem[];
  
  subtotal: number;
  totalDiscount: number;
  taxTotal: number;            // VAT 14%
  shippingCost: number;        // تكاليف الشحن والنقل
  otherCharges: number;        // رسوم تحميل/تعتيق/تأمين
  grandTotal: number;          // المبلغ الإجمالي النهائي بالجنيه
  
  paymentTerms: string;        // شروط السداد (نقداً، آجل 30 يوم، دفعة 50%..)
  deliveryLeadTimeDays: number;
  expectedDeliveryDate: string;
  shippingTerms: string;       // e.g. "شامل التوصيل لمصنع دمياط"
  warrantyTerms?: string;
  
  status: SupplierQuotationStatus;
  
  // Selection Info
  selectionReason?: string;
  selectedByUserName?: string;
  selectedDate?: string;
  
  convertedToPoId?: string;
  convertedToPoNumber?: string;
  
  notes?: string;
  attachments?: string[];
  createdByUserName: string;
  createdAt: string;
}

// ----------------------------------------------------
// 4. QUOTATION COMPARISON MATRIX ROW
// ----------------------------------------------------

export interface QuotationComparisonColumn {
  quotationId: string;
  quotationNumber: string;
  supplierId: string;
  supplierName: string;
  rating: number;
  deliveryLeadTimeDays: number;
  expectedDeliveryDate: string;
  paymentTerms: string;
  shippingCost: number;
  otherCharges: number;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  status: SupplierQuotationStatus;
  isSelected: boolean;
  itemPrices: Record<string, {
    unitPrice: number;
    discountPercent: number;
    taxPercent: number;
    lineTotal: number;
    leadTimeDays: number;
  }>;
}

// ----------------------------------------------------
// 5. PURCHASE ORDER (PO) — ENTERPRISE SCHEMA
// ----------------------------------------------------

export type POStatus = 
  | 'draft'                    // مسودة قيد الإعداد
  | 'pending_approval'         // بانتظار اعتماد مدير المشتريات / المدير المالي
  | 'approved'                 // معتمد رسمياً
  | 'sent_to_supplier'         // تم إرسال أمر الشراء للمورد
  | 'partially_received'       // تم استلام جزء من الكميات بالمخزن
  | 'fully_received'           // تم استلام كامل الكميات بنجاح
  | 'partially_invoiced'       // تم تسجيل فاتورة مورد جزئية
  | 'fully_invoiced'           // تمت فوترة الأمر بالكامل
  | 'closed'                   // أمر مكتمل ومغلق
  | 'cancelled';               // ملغي

export type POReceivingStatus = 'pending' | 'partially_received' | 'fully_received';
export type POPaymentStatus = 'unpaid' | 'partially_paid' | 'paid';

export interface PurchaseOrderLineItem {
  id: string;
  itemId: string;
  itemType: ItemType;          // 'material' | 'product'
  itemCode: string;
  itemName: string;
  itemCategory: string;
  specifications?: string;
  
  quantity: number;            // الكمية المطلوبة
  receivedQuantity: number;    // الكمية المستلمة فعلياً
  remainingQuantity: number;   // الكمية المتبقية
  returnedQuantity: number;    // الكمية المرتجعة
  uom: string;
  
  unitPrice: number;           // سعر الوحدة الأساسي
  discountPercent: number;
  discountAmount: number;
  netUnitPrice: number;        // بعد الخصم
  taxRate: number;             // % (14% VAT)
  taxAmount: number;
  totalAmount: number;         // netUnitPrice * quantity + taxAmount
  
  requiredDate: string;
  expectedDate?: string;
  
  // Traceability link
  demandId?: string;
  projectId?: string;
  projectNumber?: string;
  projectName?: string;
  customerName?: string;
}

export interface PurchaseOrderRevision {
  revisionNumber: number;
  modifiedDate: string;
  modifiedByUserName: string;
  reason: string;
  previousTotal: number;
  newTotal: number;
  changesSummary: string;
}

export interface PurchaseOrderReceiptRef {
  grnId: string;
  grnNumber: string;
  grnDate: string;
  receivedQty: number;
  warehouseName: string;
  receivedByUserName: string;
}

export interface PurchaseOrderBillRef {
  billId: string;
  billNumber: string;
  billDate: string;
  vendorInvoiceNumber: string;
  amount: number;
  status: string;
}

export interface EnterprisePurchaseOrder {
  id: string;
  poNumber: string;            // e.g. "PO-2026-001"
  poDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  
  supplierId: string;
  supplierName: string;
  supplierCode?: string;
  supplierContactPerson?: string;
  supplierPhone?: string;
  supplierTaxNumber?: string;
  
  branchId: string;
  branchName: string;
  warehouseId: string;
  warehouseName: string;
  
  buyerId: string;
  buyerName: string;           // موظف المشتريات المسؤول
  
  currency: 'EGP' | 'USD' | 'EUR';
  exchangeRate: number;
  paymentTerms: string;
  shippingTerms: string;
  
  // Upstream Traceability
  purchaseRequestId?: string;
  purchaseRequestNumber?: string;
  rfqId?: string;
  rfqNumber?: string;
  supplierQuotationId?: string;
  supplierQuotationNumber?: string;
  
  projectId?: string;
  projectNumber?: string;
  projectName?: string;
  customerName?: string;
  contractNumber?: string;
  
  items: PurchaseOrderLineItem[];
  
  subtotal: number;
  totalDiscount: number;
  taxTotal: number;
  shippingCost: number;
  otherCharges: number;
  grandTotal: number;
  
  paidAmount: number;
  balanceDue: number;
  
  status: POStatus;
  receivingStatus: POReceivingStatus;
  paymentStatus: POPaymentStatus;
  
  // Approval
  approvedByUserName?: string;
  approvedDate?: string;
  rejectionReason?: string;
  
  // Downstream tracking
  receiptNotes: PurchaseOrderReceiptRef[];
  vendorBills: PurchaseOrderBillRef[];
  revisions: PurchaseOrderRevision[];
  
  notes?: string;
  attachments?: string[];
  
  createdByUserName: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// 6. SUPPLIER PRICE LIST & PRICE HISTORY
// ----------------------------------------------------

export interface SupplierItemPrice {
  id: string;
  supplierId: string;
  supplierName: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  itemCategory: string;
  uom: string;
  unitPrice: number;
  currency: string;
  minQuantity: number;
  leadTimeDays: number;
  paymentTerms: string;
  effectiveDate: string;       // YYYY-MM-DD
  expiryDate?: string;         // YYYY-MM-DD
  isActive: boolean;
  notes?: string;
  priceHistory: {
    price: number;
    effectiveDate: string;
    changedByUserName: string;
    reason: string;
  }[];
}

// ----------------------------------------------------
// 7. SUPPLIER RETURN (PURCHASE RETURN)
// ----------------------------------------------------

export type SupplierReturnStatus = 
  | 'draft'                    // مسودة
  | 'pending_approval'         // بانتظار اعتماد مدير المشتريات
  | 'approved'                 // معتمد للصرف وإرجاع البضاعة
  | 'shipped_to_supplier'      // تم خروج البضاعة من المخزن للمورد
  | 'credited_by_vendor'       // تم تسجيل إشعار خصم أو استرداد نقدي بالحسابات
  | 'cancelled';               // ملغي

export interface ProcurementSupplierReturnItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  uom: string;
  unitCost: number;
  totalCost: number;
  defectReason: string;
}

export interface ProcurementSupplierReturn {
  id: string;
  returnNumber: string;        // e.g. "PRET-2026-001"
  returnDate: string;
  
  supplierId: string;
  supplierName: string;
  
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  goodsReceiptNoteId?: string;
  grnNumber?: string;
  
  branchId: string;
  branchName: string;
  warehouseId: string;
  warehouseName: string;
  
  items: ProcurementSupplierReturnItem[];
  totalRefundAmount: number;
  reason: string;
  status: SupplierReturnStatus;
  
  approvedByUserName?: string;
  approvedDate?: string;
  
  inventoryMovementId?: string; // إذن صرف مرتجع للمورد بالمخازن
  vendorDebitNoteId?: string;   // إشعار مدين / تسوية بالحسابات
  
  notes?: string;
  attachments?: string[];
  processedByUserName: string;
  createdAt: string;
}

// ----------------------------------------------------
// 8. THREE-WAY MATCHING (PO + GRN + INVOICE)
// ----------------------------------------------------

export type MatchingResultStatus = 
  | 'matched'                  // متطابق 100%
  | 'price_mismatch'           // اختلاف في سعر الوحدة
  | 'qty_mismatch'             // اختلاف في الكمية المفوترة عن المستلمة
  | 'missing_grn'              // الفاتورة مسجلة دون إذن إضافة مخزني
  | 'over_invoiced'            // الفاتورة تتجاوز أمر الشراء
  | 'pending_invoice';         // بانتظار ورود فاتورة المورد

export interface ThreeWayMatchingLine {
  itemCode: string;
  itemName: string;
  
  // PO
  poQty: number;
  poUnitPrice: number;
  poTotal: number;
  
  // GRN
  grnQty: number;
  grnReceivedDate?: string;
  
  // Invoice
  invoiceQty: number;
  invoiceUnitPrice: number;
  invoiceTotal: number;
  
  // Variance
  qtyVariance: number;         // invoiceQty - grnQty
  priceVariance: number;       // invoiceUnitPrice - poUnitPrice
  totalVariance: number;
  
  status: MatchingResultStatus;
  notes?: string;
}

export interface ThreeWayMatchingRecord {
  id: string;
  matchNumber: string;
  poId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  grnNumbers: string[];
  invoiceNumber?: string;
  invoiceDate?: string;
  
  poTotal: number;
  receivedValue: number;
  invoicedValue: number;
  varianceValue: number;
  
  overallStatus: MatchingResultStatus;
  lines: ThreeWayMatchingLine[];
  checkedAt: string;
  checkedByUserName: string;
  accountingReviewStatus: 'approved_for_payment' | 'held_for_discrepancy' | 'pending';
}

// ----------------------------------------------------
// 9. PROCUREMENT DASHBOARD KPIS & STATS
// ----------------------------------------------------

export interface ProcurementDashboardKPIs {
  openPurchaseRequests: number;
  pendingPRApprovals: number;
  activeRFQs: number;
  quotesAwaitingComparison: number;
  posAwaitingApproval: number;
  openPurchaseOrders: number;
  expectedDeliveriesThisWeek: number;
  delayedPurchaseOrders: number;
  partiallyReceivedPOs: number;
  completedPurchasesMonth: number;
  totalSpendMonthEGP: number;
  totalSpendYearEGP: number;
  averageLeadTimeDays: number;
  onTimeDeliveryRatePercent: number;
}
