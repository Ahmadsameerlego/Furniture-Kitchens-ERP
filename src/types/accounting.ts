// ====================================================
// REWAQ ERP — ACCOUNTING MODULE TYPES
// Production-Ready Double-Entry Engine & Financial Models
// ====================================================

export type AccountType = 
  | 'asset' 
  | 'liability' 
  | 'equity' 
  | 'revenue' 
  | 'cogs' 
  | 'expense';

export interface Account {
  id: string;
  code: string;                  // e.g. "1110", "1300", "2100", "4100"
  name: string;                  // e.g. "Main Cash"
  nameAr: string;                // e.g. "الخزينة الرئيسية"
  type: AccountType;
  parentId?: string;
  isReconcilable?: boolean;      // For AR, AP, GR/IR, Checks
  allowManualEntries: boolean;
  isActive: boolean;
  level: number;
  description?: string;
  openingBalanceDebit?: number;
  openingBalanceCredit?: number;
}

export type JournalType = 'sales' | 'purchase' | 'cash' | 'bank' | 'general';

export interface Journal {
  id: string;
  code: string;                  // e.g. "SAL", "PUR", "CSH", "BNK", "GEN"
  name: string;
  nameAr: string;
  type: JournalType;
  defaultDebitAccountId?: string;
  defaultCreditAccountId?: string;
  sequencePrefix: string;        // e.g. "INV-", "BILL-", "CSH-", "JE-"
  isActive: boolean;
  description?: string;
}

export type EntryStatus = 'draft' | 'posted' | 'reversed';

export type EntrySourceType =
  | 'sales_invoice'
  | 'customer_advance'
  | 'vendor_bill'
  | 'customer_receipt'
  | 'vendor_payment'
  | 'cash_transfer'
  | 'stock_receipt'
  | 'material_issue_wip'
  | 'production_completion'
  | 'delivery_cogs'
  | 'stock_scrap'
  | 'stock_adjustment'
  | 'check_clearing'
  | 'depreciation'
  | 'manual'
  | 'reversal';

export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  partnerId?: string;            // Customer or Supplier ID
  partnerType?: 'customer' | 'supplier';
  partnerName?: string;
  debit: number;
  credit: number;
  description: string;
  costCenterId?: string;         // e.g. "workshop_cnc", "painting", "installation"
  costCenterName?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;           // e.g. "JE-2026-000001"
  date: string;
  periodId: string;
  journalId: string;
  journalName: string;
  sourceDocument?: string;       // e.g. "INV-2026-001", "PO-2026-004", "PRD-2026-0012"
  sourceType: EntrySourceType;
  reference: string;
  description: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  status: EntryStatus;
  reversalEntryId?: string;
  reversedFromEntryId?: string;
  branchId: string;
  branchName: string;
  createdAt: string;
  createdByUserName: string;
  postedAt?: string;
  postedByUserName?: string;
  attachments?: string[];
}

export interface FiscalPeriod {
  id: string;
  year: number;
  periodNumber: number;          // 1 to 12
  name: string;                  // e.g. "سبتمبر 2026"
  startDate: string;
  endDate: string;
  isClosed: boolean;
  closedAt?: string;
  closedByUserName?: string;
}

export interface CostCenter {
  id: string;
  code: string;                  // e.g. "CC-101"
  name: string;
  nameAr: string;
  category: 'workshop' | 'service' | 'admin' | 'sales' | 'project';
  isActive: boolean;
}

// ----------------------------------------------------
// INVOICING & ADVANCES
// ----------------------------------------------------

export interface SalesInvoiceItem {
  id: string;
  description: string;
  itemType: 'product' | 'custom_kitchen' | 'material' | 'installation_service';
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  taxRate: number;               // Default 14% VAT
  taxAmount: number;
  total: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;         // e.g. "INV-2026-0001"
  customerId: string;
  customerName: string;
  orderId?: string;
  orderNumber?: string;
  projectId?: string;
  projectNumber?: string;
  date: string;
  dueDate: string;
  items: SalesInvoiceItem[];
  subtotal: number;
  taxAmount: number;             // VAT 14%
  discountAmount: number;
  totalAmount: number;
  advanceAppliedAmount: number;  // Settled from Customer Advances (2200)
  netReceivableAmount: number;   // totalAmount - advanceAppliedAmount
  paidAmount: number;
  balanceDue: number;
  status: 'draft' | 'posted' | 'partially_paid' | 'paid' | 'cancelled';
  journalEntryId?: string;
  branchId: string;
  branchName: string;
  notes?: string;
  createdDate: string;
}

export interface CustomerAdvance {
  id: string;
  advanceNumber: string;         // e.g. "ADV-2026-0001"
  customerId: string;
  customerName: string;
  orderId?: string;
  orderNumber?: string;
  projectId?: string;
  projectNumber?: string;
  amount: number;
  appliedAmount: number;
  remainingAmount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'card';
  accountId: string;             // Cash/Bank account received into
  date: string;
  journalEntryId: string;
  status: 'active' | 'partially_applied' | 'fully_applied' | 'refunded';
  notes?: string;
  receivedByUserName: string;
}

export interface VendorBillItem {
  id: string;
  description: string;
  itemType: 'stock_material' | 'direct_expense' | 'fixed_asset' | 'service';
  accountId?: string;            // Direct Expense or Asset account
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxRate: number;               // 14% VAT
  taxAmount: number;
  total: number;
}

export interface VendorBill {
  id: string;
  billNumber: string;            // e.g. "BILL-2026-0001"
  vendorInvoiceNumber?: string;  // External supplier paper invoice no
  supplierId: string;
  supplierName: string;
  purchaseOrderId?: string;
  poNumber?: string;
  billType: 'stock_purchase' | 'direct_expense' | 'asset_purchase';
  date: string;
  dueDate: string;
  items: VendorBillItem[];
  subtotal: number;
  taxAmount: number;             // Input VAT (14%)
  withholdingTaxRate: number;    // e.g. 1% for raw materials
  withholdingTaxAmount: number;  // Calculated withholding tax
  totalAmount: number;
  netPayableAmount: number;      // totalAmount - withholdingTaxAmount
  paidAmount: number;
  balanceDue: number;
  status: 'draft' | 'posted' | 'partially_paid' | 'paid' | 'cancelled';
  journalEntryId?: string;
  branchId: string;
  branchName: string;
  notes?: string;
  createdDate: string;
}

// ----------------------------------------------------
// PDC / CHECKS LIFECYCLE
// ----------------------------------------------------

export type CheckStatus = 
  | 'received' 
  | 'under_collection' 
  | 'cleared' 
  | 'bounced' 
  | 'returned';

export interface PDCRecord {
  id: string;
  checkNumber: string;
  type: 'receivable' | 'payable';
  partnerId: string;
  partnerName: string;
  bankName: string;
  branchName?: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: CheckStatus;
  journalEntryId?: string;       // Recorded when cleared or bounced
  notes?: string;
  createdDate: string;
}

// ----------------------------------------------------
// FINANCIAL REPORTS STRUCTURES
// ----------------------------------------------------

export interface TrialBalanceItem {
  accountId: string;
  accountCode: string;
  accountNameAr: string;
  accountType: AccountType;
  level: number;
  initialDebit: number;
  initialCredit: number;
  periodDebit: number;
  periodCredit: number;
  endingDebit: number;
  endingCredit: number;
}

export interface PartnerStatementRow {
  date: string;
  documentNumber: string;
  documentType: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface ProfitAndLossReport {
  revenueAccounts: { code: string; name: string; amount: number }[];
  totalRevenue: number;
  cogsAccounts: { code: string; name: string; amount: number }[];
  totalCOGS: number;
  grossProfit: number;
  grossProfitMargin: number;
  expenseAccounts: { code: string; name: string; amount: number }[];
  totalExpenses: number;
  netProfit: number;
  netProfitMargin: number;
}

export interface BalanceSheetReport {
  currentAssets: { code: string; name: string; amount: number }[];
  totalCurrentAssets: number;
  nonCurrentAssets: { code: string; name: string; amount: number }[];
  totalNonCurrentAssets: number;
  totalAssets: number;

  currentLiabilities: { code: string; name: string; amount: number }[];
  totalCurrentLiabilities: number;
  longTermLiabilities: { code: string; name: string; amount: number }[];
  totalLongTermLiabilities: number;
  totalLiabilities: number;

  equityAccounts: { code: string; name: string; amount: number }[];
  currentYearEarnings: number;
  totalEquity: number;

  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
}
