import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CompanyConfig, 
  Branch, 
  Role, 
  User, 
  AuditLog, 
  ModuleId, 
  PermissionActions,
  DemoPersonaId,
  ModulePermissions,
  ApiSecurityTestResult,
  Customer,
  CustomerStatus,
  LostReason,
  MarketingCampaign,
  CustomerActivity,
  CustomerReminder,
  CustomerDocument,
  AfterSalesRecord,
  Product,
  Supplier,
  SupplierPurchaseInvoice,
  SupplierPaymentRecord,
  ReadyOrder,
  OrderStatus,
  DeliveryStatus,
  CustomerPayment,
  PaymentSchedule,
  OrderReturn,
  Material,
  PurchaseOrder,
  PurchaseOrderItem,
  StockMovement,
  StockTransfer,
  SupplierReturn,
  SystemNotification,
  CustomProject,
  ProjectStatus,
  SiteVisit,
  ProjectMeasurement,
  ProjectDesign,
  ProjectQuotation,
  ProjectTimelineEvent,
  DesignStatus,
  QuotationStatus,
  CustomContract,
  PaymentReceipt,
  ProductionOrder,
  ProductionMaterialItem,
  ProductionOrderStatus,
  InstallationRecord,
  InstallationStatus,
  CompanyExpense,
  ExpenseCategory,
  FinancialAccount,
  FinancialTransaction,
  WarehouseLocation,
  ItemMasterCard,
  GoodsReceiptNote,
  GRNType,
  GRNLineItem,
  GoodsIssueNote,
  GINType,
  GINLineItem,
  MaterialRequisition,
  StocktakeSession,
  StocktakeLine,
  StockLedgerEntry
} from '../types/erp';
import {
  initialWarehouses,
  initialItemMasterCards,
  initialGoodsReceiptNotes,
  initialGoodsIssueNotes,
  initialMaterialRequisitions,
  initialStocktakeSessions,
  initialStockLedgerEntries
} from '../mock/inventoryData';
import { 
  initialCompany, 
  initialBranches, 
  initialRoles, 
  initialUsers, 
  initialAuditLogs,
  demoPersonas 
} from '../mock/initialData';
import {
  initialCustomers,
  initialCampaigns,
  initialActivities,
  initialReminders,
  initialDocuments,
  initialAfterSalesRecords
} from '../mock/crmData';
import {
  initialProducts,
  initialSuppliers,
  initialSupplierInvoices,
  initialSupplierPayments,
  initialOrders,
  initialPayments,
  initialPaymentSchedules,
  initialReturns
} from '../mock/readySalesData';
import {
  initialMaterials,
  initialPurchaseOrders,
  initialStockMovements,
  initialStockTransfers,
  initialSupplierReturns,
  initialNotifications
} from '../mock/materialsData';
import {
  initialCustomProjects,
  initialSiteVisits,
  initialProjectMeasurements,
  initialProjectDesigns,
  initialProjectQuotations,
  initialProjectTimelineEvents
} from '../mock/customProjectsData';
import {
  initialCustomContracts,
  initialPaymentReceipts,
  initialCommercialPaymentSchedules
} from '../mock/commercialData';
import {
  initialProductionOrders,
  initialInstallationRecords
} from '../mock/productionData';
import {
  initialFinancialAccounts,
  initialCompanyExpenses,
  initialFinancialTransactions
} from '../mock/financeData';
import {
  Account,
  Journal,
  JournalEntry,
  FiscalPeriod,
  CostCenter,
  SalesInvoice,
  VendorBill,
  CustomerAdvance,
  PDCRecord
} from '../types/accounting';
import {
  initialChartOfAccounts,
  initialJournals,
  initialFiscalPeriods,
  initialCostCenters,
  initialPDCRecords,
  initialCustomerAdvances,
  initialSalesInvoices,
  initialVendorBills,
  initialJournalEntries
} from '../mock/accountingData';
import { AccountingService } from '../services/accountingService';
import { BackendSecurityService } from '../services/backendSecurity';
import { CrmService } from '../services/crmService';
import { ReadySalesService } from '../services/readySalesService';
import { InventoryService } from '../services/inventoryService';
import { CustomProjectService } from '../services/customProjectService';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ERPContextType {
  company: CompanyConfig;
  branches: Branch[];
  users: User[];
  roles: Role[];
  auditLogs: AuditLog[];
  currentUser: User;
  currentRole: Role;
  currentBranch: Branch;
  availableBranches: Branch[];
  language: 'ar' | 'en';
  activeModule: ModuleId;
  isSidebarCollapsed: boolean;
  activePersonaId: DemoPersonaId;
  toasts: ToastState[];
  
  // CRM State & Navigation
  customers: Customer[];
  campaigns: MarketingCampaign[];
  activities: CustomerActivity[];
  reminders: CustomerReminder[];
  documents: CustomerDocument[];
  afterSalesRecords: AfterSalesRecord[];
  selectedCustomerId: string | null;

  // Ready Sales, Products & Suppliers State
  products: Product[];
  suppliers: Supplier[];
  supplierInvoices: SupplierPurchaseInvoice[];
  supplierPayments: SupplierPaymentRecord[];
  orders: ReadyOrder[];
  payments: CustomerPayment[];
  paymentSchedules: PaymentSchedule[];
  returns: OrderReturn[];
  selectedOrderId: string | null;
  selectedProductId: string | null;
  selectedSupplierId: string | null;

  // Prompt 4: Materials, Purchasing, Inventory & Notifications
  materials: Material[];
  purchaseOrders: PurchaseOrder[];
  stockMovements: StockMovement[];
  stockTransfers: StockTransfer[];
  supplierReturns: SupplierReturn[];
  notifications: SystemNotification[];
  selectedMaterialId: string | null;

  // Prompt 5 & 6: Custom Projects & Commercial Conversion State
  customProjects: CustomProject[];
  siteVisits: SiteVisit[];
  projectMeasurements: ProjectMeasurement[];
  projectDesigns: ProjectDesign[];
  projectQuotations: ProjectQuotation[];
  projectTimelineEvents: ProjectTimelineEvent[];
  customContracts: CustomContract[];
  paymentReceipts: PaymentReceipt[];
  selectedProjectId: string | null;
  portalCurrentCustomerId: string;

  // Prompt 7: Production & Installation State
  productionOrders: ProductionOrder[];
  installationRecords: InstallationRecord[];
  selectedProductionOrderId: string | null;

  // Prompt 8: Central Finance State
  expenses: CompanyExpense[];
  financialAccounts: FinancialAccount[];
  financialTransactions: FinancialTransaction[];

  // Production-Ready Accounting Module State
  chartOfAccounts: Account[];
  journals: Journal[];
  journalEntries: JournalEntry[];
  fiscalPeriods: FiscalPeriod[];
  costCenters: CostCenter[];
  salesInvoices: SalesInvoice[];
  vendorBills: VendorBill[];
  customerAdvances: CustomerAdvance[];
  pdcRecords: PDCRecord[];

  // Production-Ready Accounting Module Actions
  createManualJournalEntry: (entryData: {
    journalId: string;
    date: string;
    periodId: string;
    reference: string;
    description: string;
    lines: {
      accountId: string;
      accountCode: string;
      accountName: string;
      partnerId?: string;
      partnerType?: 'customer' | 'supplier';
      partnerName?: string;
      debit: number;
      credit: number;
      description: string;
      costCenterId?: string;
      costCenterName?: string;
    }[];
  }) => { success: boolean; entry?: JournalEntry; error?: string };
  reverseJournalEntry: (entryId: string, reason: string) => boolean;
  createSalesInvoice: (invoiceData: any) => SalesInvoice;
  recordCustomerAdvancePayment: (data: {
    customerId: string;
    amount: number;
    paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'card';
    accountId: string;
    orderId?: string;
    projectId?: string;
    notes?: string;
  }) => CustomerAdvance;
  applyCustomerAdvanceToInvoice: (invoiceId: string, advanceId: string, amountToApply: number) => boolean;
  createVendorBill: (billData: any) => VendorBill;
  recordVendorBillPayment: (billId: string, amount: number, paymentMethod: string, accountId: string, withholdingTaxRate?: number, notes?: string) => boolean;
  updatePdcStatus: (checkId: string, newStatus: PDCRecord['status'], clearanceAccountId?: string) => void;
  toggleFiscalPeriodLock: (periodId: string, reopenReason?: string) => void;
  addAccountToCoA: (accountData: Omit<Account, 'id'>) => void;
  recordInventoryWipMovement: (productionOrderId: string, totalMaterialCost: number, notes?: string) => void;
  recordProductionCompletionToFinishedGoods: (productionOrderId: string, finalTotalCost: number, notes?: string) => void;
  recordDeliveryCogsAccounting: (orderId: string, cogsAmount: number, notes?: string) => void;
  recordScrapWasteAccounting: (reason: string, scrapAmount: number, notes?: string) => void;

  // Global Navigation & Actions
  setActiveModule: (module: ModuleId) => void;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleLanguage: () => void;
  switchPersona: (personaId: DemoPersonaId) => void;
  setCurrentBranch: (branchId: string) => boolean;
  updateCompanyConfig: (updates: Partial<CompanyConfig>) => void;
  setMainBranch: (branchId: string) => void;
  addUser: (userData: Omit<User, 'id' | 'createdDate' | 'lastLogin'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  toggleUserStatus: (userId: string) => void;
  addRole: (roleData: Omit<Role, 'id'>) => void;
  updateRolePermissions: (roleId: string, permissions: ModulePermissions) => void;
  addBranch: (branchData: Omit<Branch, 'id' | 'createdDate'>) => void;
  updateBranch: (branchId: string, updates: Partial<Branch>) => void;
  checkPermission: (module: ModuleId, action: keyof PermissionActions) => boolean;
  checkBranchAccess: (branchId: string) => boolean;
  runApiSecurityTest: (
    endpoint: string,
    method: string,
    module: ModuleId,
    action: keyof PermissionActions,
    targetBranchId?: string
  ) => ApiSecurityTestResult;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp' | 'userId' | 'userName' | 'userRole'>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;

  // CRM Actions
  setSelectedCustomerId: (id: string | null) => void;
  addCustomer: (customerData: Omit<Customer, 'id' | 'createdDate' | 'lastActivityDate' | 'hasPurchased' | 'isAfterSales'>) => Customer;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void;
  updateCustomerStatus: (customerId: string, status: CustomerStatus, lostReason?: LostReason, lostNote?: string) => void;
  addCustomerActivity: (customerId: string, type: CustomerActivity['type'], title: string, note: string) => void;
  addCustomerReminder: (customerId: string, title: string, dueDate: string, dueTime?: string, priority?: 'normal' | 'high') => void;
  toggleReminderCompleted: (reminderId: string) => void;
  addCampaign: (campaignData: Omit<MarketingCampaign, 'id' | 'customersCount' | 'purchasedCount' | 'revenueAttributed'>) => void;
  updateCampaign: (campaignId: string, updates: Partial<MarketingCampaign>) => void;

  // Ready Sales Actions
  setSelectedOrderId: (id: string | null) => void;
  setSelectedProductId: (id: string | null) => void;
  setSelectedSupplierId: (id: string | null) => void;
  createReadyOrder: (orderData: any) => ReadyOrder;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  updateDeliveryStatus: (orderId: string, deliveryStatus: DeliveryStatus, actualDeliveryDate?: string, notes?: string) => void;
  recordCustomerPayment: (orderId: string, amount: number, method: CustomerPayment['paymentMethod'], receiptRef?: string, paymentType?: CustomerPayment['paymentType'], scheduleItemId?: string, notes?: string) => void;
  processOrderReturn: (orderId: string, productId: string, quantity: number, reason: string, refundAmount: number) => void;
  addProduct: (productData: Omit<Product, 'id' | 'createdDate'>) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  addSupplier: (supplierData: Omit<Supplier, 'id' | 'createdDate' | 'totalPurchases' | 'totalPaid' | 'balanceDue'>) => void;
  recordSupplierPayment: (supplierId: string, amount: number, paymentMethod: SupplierPaymentRecord['paymentMethod'], referenceNumber?: string, notes?: string) => void;

  // Prompt 4 Actions
  setSelectedMaterialId: (id: string | null) => void;
  addMaterial: (materialData: Omit<Material, 'id' | 'createdDate' | 'currentStock' | 'reservedStock' | 'availableStock'>) => void;
  updateMaterial: (materialId: string, updates: Partial<Material>) => void;
  createPurchaseOrder: (poData: any) => PurchaseOrder;
  receivePurchaseItems: (poId: string, receivedMap: Record<string, number>, notes?: string) => void;
  createStockTransfer: (transferData: any) => StockTransfer;
  updateTransferStatus: (transferId: string, nextStatus: StockTransfer['status']) => void;
  processStockAdjustment: (itemId: string, itemType: 'product' | 'material', branchId: string, quantityChange: number, reason: string) => void;
  processSupplierReturn: (returnOrderData: any) => SupplierReturn;
  markNotificationRead: (notificationId: string) => void;

  // Prompt 5 & 6 Custom Projects & Commercial Actions
  setSelectedProjectId: (id: string | null) => void;
  createCustomProject: (projectData: any) => CustomProject;
  updateProjectStatus: (projectId: string, newStatus: ProjectStatus) => void;
  scheduleSiteVisit: (projectId: string, visitData: any) => SiteVisit;
  completeSiteVisit: (visitId: string, siteData: any) => void;
  addProjectMeasurement: (projectId: string, items: any[], reason?: string, sitePhotos?: string[], siteVideos?: string[], technicalNotes?: string) => ProjectMeasurement;
  addProjectDesign: (projectId: string, designData: any) => ProjectDesign;
  updateDesignStatus: (designId: string, status: DesignStatus, rejectionReason?: string) => void;
  addDesignComment: (designId: string, text: string, isCustomer?: boolean) => void;
  createProjectQuotation: (projectId: string, quotationData: any) => ProjectQuotation;
  updateQuotationStatus: (quotationId: string, status: QuotationStatus, rejectionReason?: string) => void;
  acceptQuotation: (quotationId: string) => void;
  createContractFromQuotation: (quotationId: string, paymentTerms: string, deliveryTerms: string, notes?: string) => CustomContract;
  signContract: (contractId: string) => void;
  convertQuotationToOrder: (quotationId: string, depositAmount: number, installmentsCount?: number) => ReadyOrder;
  loginAsPortalCustomer: (customerId: string) => void;

  // Prompt 7 Actions
  setSelectedProductionOrderId: (id: string | null) => void;
  createProductionOrderFromCustomOrder: (orderId: string, workshopLocation: string, startDate: string, expectedDate: string, assignedTeam: string[]) => ProductionOrder;
  reserveProductionMaterials: (productionOrderId: string, materialId: string, qtyToReserve: number) => void;
  consumeProductionMaterials: (productionOrderId: string, materialId: string, qtyToConsume: number, notes?: string) => void;
  completeProductionOrder: (productionOrderId: string, completionPhotos: string[], notes?: string) => void;
  scheduleInstallation: (productionOrderId: string, scheduledDate: string, scheduledTime: string, address: string, assignedTeamIds: string[], notes?: string) => InstallationRecord;
  completeInstallation: (installationId: string, afterPhotos: string[], notes?: string) => void;
  completeHandover: (installationId: string, notes?: string) => void;

  // Prompt 8 Actions
  addCompanyExpense: (expenseData: any) => CompanyExpense;
  transferBetweenFinancialAccounts: (fromAccountId: string, toAccountId: string, amount: number, notes?: string) => void;
  recordSupplierPaymentFromFinance: (supplierId: string, amount: number, method: 'cash' | 'bank_transfer' | 'check', accountId: string, notes?: string) => void;

  // Enterprise Warehouses & Inventory State
  warehouses: WarehouseLocation[];
  itemMasterCards: ItemMasterCard[];
  goodsReceiptNotes: GoodsReceiptNote[];
  goodsIssueNotes: GoodsIssueNote[];
  materialRequisitions: MaterialRequisition[];
  stocktakeSessions: StocktakeSession[];
  stockLedgerEntries: StockLedgerEntry[];
  selectedItemCardId: string | null;
  setSelectedItemCardId: (id: string | null) => void;

  // Enterprise Warehouses & Inventory Actions
  createGoodsReceiptNote: (data: any) => GoodsReceiptNote;
  createGoodsIssueNote: (data: any) => GoodsIssueNote;
  createItemMasterCard: (data: any) => ItemMasterCard;
  updateItemMasterCard: (id: string, data: any) => void;
  createWarehouse: (data: any) => WarehouseLocation;
  createStocktakeSession: (data: any) => StocktakeSession;
  postStocktakeAdjustment: (sessionId: string) => boolean;
  createMaterialRequisition: (data: any) => MaterialRequisition;
  approveMaterialRequisition: (requisitionId: string) => void;
  rejectMaterialRequisition: (requisitionId: string, reason?: string) => void;
  confirmWarehouseTransfer: (transferId: string) => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<CompanyConfig>(initialCompany);
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  
  // CRM State
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(initialCampaigns);
  const [activities, setActivities] = useState<CustomerActivity[]>(initialActivities);
  const [reminders, setReminders] = useState<CustomerReminder[]>(initialReminders);
  const [documents, setDocuments] = useState<CustomerDocument[]>(initialDocuments);
  const [afterSalesRecords, setAfterSalesRecords] = useState<AfterSalesRecord[]>(initialAfterSalesRecords);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Ready Sales & Suppliers State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [supplierInvoices, setSupplierInvoices] = useState<SupplierPurchaseInvoice[]>(initialSupplierInvoices);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPaymentRecord[]>(initialSupplierPayments);
  const [orders, setOrders] = useState<ReadyOrder[]>(initialOrders);
  const [payments, setPayments] = useState<CustomerPayment[]>(initialPayments);
  const [paymentSchedules, setPaymentSchedules] = useState<PaymentSchedule[]>(initialCommercialPaymentSchedules);
  const [returns, setReturns] = useState<OrderReturn[]>(initialReturns);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  // Prompt 4 State
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialStockMovements);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(initialStockTransfers);
  const [supplierReturns, setSupplierReturns] = useState<SupplierReturn[]>(initialSupplierReturns);
  const [notifications, setNotifications] = useState<SystemNotification[]>(initialNotifications);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);

  // Prompt 5 & 6 State
  const [customProjects, setCustomProjects] = useState<CustomProject[]>(initialCustomProjects);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>(initialSiteVisits);
  const [projectMeasurements, setProjectMeasurements] = useState<ProjectMeasurement[]>(initialProjectMeasurements);
  const [projectDesigns, setProjectDesigns] = useState<ProjectDesign[]>(initialProjectDesigns);
  const [projectQuotations, setProjectQuotations] = useState<ProjectQuotation[]>(initialProjectQuotations);
  const [projectTimelineEvents, setProjectTimelineEvents] = useState<ProjectTimelineEvent[]>(initialProjectTimelineEvents);
  const [customContracts, setCustomContracts] = useState<CustomContract[]>(initialCustomContracts);
  const [paymentReceipts, setPaymentReceipts] = useState<PaymentReceipt[]>(initialPaymentReceipts);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [portalCurrentCustomerId, setPortalCurrentCustomerId] = useState<string>('cust-1');

  // Prompt 7 State
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(initialProductionOrders);
  const [installationRecords, setInstallationRecords] = useState<InstallationRecord[]>(initialInstallationRecords);
  const [selectedProductionOrderId, setSelectedProductionOrderId] = useState<string | null>(null);

  // Prompt 8 Finance State
  const [expenses, setExpenses] = useState<CompanyExpense[]>(initialCompanyExpenses);
  const [financialAccounts, setFinancialAccounts] = useState<FinancialAccount[]>(initialFinancialAccounts);
  const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>(initialFinancialTransactions);

  // Production-Ready Accounting Module State
  const [chartOfAccounts, setChartOfAccounts] = useState<Account[]>(initialChartOfAccounts);
  const [journals, setJournals] = useState<Journal[]>(initialJournals);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(initialJournalEntries);
  const [fiscalPeriods, setFiscalPeriods] = useState<FiscalPeriod[]>(initialFiscalPeriods);
  const [costCenters, setCostCenters] = useState<CostCenter[]>(initialCostCenters);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>(initialSalesInvoices);
  const [vendorBills, setVendorBills] = useState<VendorBill[]>(initialVendorBills);
  const [customerAdvances, setCustomerAdvances] = useState<CustomerAdvance[]>(initialCustomerAdvances);
  const [pdcRecords, setPdcRecords] = useState<PDCRecord[]>(initialPDCRecords);

  // Enterprise Warehouses & Inventory State
  const [warehouses, setWarehouses] = useState<WarehouseLocation[]>(initialWarehouses);
  const [itemMasterCards, setItemMasterCards] = useState<ItemMasterCard[]>(initialItemMasterCards);
  const [goodsReceiptNotes, setGoodsReceiptNotes] = useState<GoodsReceiptNote[]>(initialGoodsReceiptNotes);
  const [goodsIssueNotes, setGoodsIssueNotes] = useState<GoodsIssueNote[]>(initialGoodsIssueNotes);
  const [materialRequisitions, setMaterialRequisitions] = useState<MaterialRequisition[]>(initialMaterialRequisitions);
  const [stocktakeSessions, setStocktakeSessions] = useState<StocktakeSession[]>(initialStocktakeSessions);
  const [stockLedgerEntries, setStockLedgerEntries] = useState<StockLedgerEntry[]>(initialStockLedgerEntries);
  const [selectedItemCardId, setSelectedItemCardId] = useState<string | null>(null);

  // URL Hash to ModuleId Mapping
  const moduleToRouteMap: Record<ModuleId, string> = {
    dashboard: '/dashboard',
    customers: '/crm/customers',
    campaigns: '/crm/campaigns',
    sales: '/sales/ready-orders',
    custom_projects: '/sales/custom-projects',
    products: '/catalog/products',
    materials: '/catalog/materials',
    inventory: '/inventory/dashboard',
    inv_dashboard: '/inventory/dashboard',
    inv_items: '/inventory/items',
    inv_grn: '/inventory/grn',
    inv_gin: '/inventory/gin',
    inv_stock_card: '/inventory/stock-card',
    inv_transfers: '/inventory/transfers',
    inv_stocktaking: '/inventory/stocktaking',
    inv_warehouses: '/inventory/warehouses',
    production: '/operations/production',
    installation: '/operations/installation',
    suppliers: '/operations/suppliers',
    finance: '/accounting/dashboard',
    acc_dashboard: '/accounting/dashboard',
    acc_coa: '/accounting/chart-of-accounts',
    acc_entries: '/accounting/journal-entries',
    acc_invoices: '/accounting/invoices',
    acc_bills: '/accounting/bills',
    acc_partners: '/accounting/partners',
    acc_checks: '/accounting/checks',
    acc_cost_centers: '/accounting/cost-centers',
    acc_reports: '/accounting/reports',
    acc_periods: '/accounting/periods',
    reports: '/reports',
    notifications: '/notifications',
    settings: '/settings',
    portal: '/portal'
  };

  const routeToModuleMap: Record<string, ModuleId> = {
    '/dashboard': 'dashboard',
    '/crm/customers': 'customers',
    '/customers': 'customers',
    '/crm/campaigns': 'campaigns',
    '/campaigns': 'campaigns',
    '/sales/ready-orders': 'sales',
    '/sales': 'sales',
    '/sales/custom-projects': 'custom_projects',
    '/custom_projects': 'custom_projects',
    '/catalog/products': 'products',
    '/products': 'products',
    '/catalog/materials': 'materials',
    '/materials': 'materials',
    '/operations/inventory': 'inv_dashboard',
    '/inventory': 'inv_dashboard',
    '/inventory/dashboard': 'inv_dashboard',
    '/inventory/items': 'inv_items',
    '/inventory/grn': 'inv_grn',
    '/inventory/gin': 'inv_gin',
    '/inventory/stock-card': 'inv_stock_card',
    '/inventory/transfers': 'inv_transfers',
    '/inventory/stocktaking': 'inv_stocktaking',
    '/inventory/warehouses': 'inv_warehouses',
    '/operations/production': 'production',
    '/production': 'production',
    '/operations/installation': 'installation',
    '/installation': 'installation',
    '/operations/suppliers': 'suppliers',
    '/suppliers': 'suppliers',
    '/accounting/dashboard': 'acc_dashboard',
    '/accounting/chart-of-accounts': 'acc_coa',
    '/accounting/coa': 'acc_coa',
    '/accounting/journal-entries': 'acc_entries',
    '/accounting/entries': 'acc_entries',
    '/accounting/invoices': 'acc_invoices',
    '/accounting/invoices-advances': 'acc_invoices',
    '/accounting/bills': 'acc_bills',
    '/accounting/vendor-bills': 'acc_bills',
    '/accounting/partners': 'acc_partners',
    '/accounting/partner-statements': 'acc_partners',
    '/accounting/checks': 'acc_checks',
    '/accounting/pdc-checks': 'acc_checks',
    '/accounting/cost-centers': 'acc_cost_centers',
    '/accounting/reports': 'acc_reports',
    '/accounting/financial-statements': 'acc_reports',
    '/accounting/periods': 'acc_periods',
    '/accounting/fiscal-periods': 'acc_periods',
    '/finance': 'acc_dashboard',
    '/reports': 'reports',
    '/notifications': 'notifications',
    '/settings': 'settings',
    '/portal': 'portal'
  };

  const getModuleFromHash = (): ModuleId => {
    if (typeof window === 'undefined') return 'dashboard';
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return 'dashboard';
    const cleanPath = hash.startsWith('/') ? hash : '/' + hash;
    if (routeToModuleMap[cleanPath]) {
      return routeToModuleMap[cleanPath];
    }
    const rawId = cleanPath.replace(/^\//, '') as ModuleId;
    if (moduleToRouteMap[rawId]) {
      return rawId;
    }
    return 'dashboard';
  };

  // Session state
  const [currentUserId, setCurrentUserId] = useState<string>('user-1');
  const [currentBranchId, setCurrentBranchId] = useState<string>('branch-1');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [activeModule, setActiveModuleState] = useState<ModuleId>(() => getModuleFromHash());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [activePersonaId, setActivePersonaId] = useState<DemoPersonaId>('ahmed_owner');
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const setActiveModule = (moduleId: ModuleId) => {
    setActiveModuleState(moduleId);
    if (typeof window !== 'undefined') {
      const targetPath = moduleToRouteMap[moduleId] || ('/' + moduleId);
      const currentHash = window.location.hash.replace(/^#/, '');
      if (currentHash !== targetPath) {
        window.location.hash = targetPath;
      }
    }
  };

  // Synchronize browser history / URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const detected = getModuleFromHash();
      if (detected) {
        setActiveModuleState(detected);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    // Initial hash sync
    if (!window.location.hash) {
      window.location.hash = moduleToRouteMap[activeModule] || ('/' + activeModule);
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Sync document direction
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const currentRole = roles.find(r => r.id === currentUser.roleId) || roles[0];
  const currentBranch = branches.find(b => b.id === currentBranchId) || branches[0];
  const availableBranches = branches.filter(b => currentUser.assignedBranchIds.includes(b.id));

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addAuditLog = (logData: Omit<AuditLog, 'id' | 'timestamp' | 'userId' | 'userName' | 'userRole'>) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentRole.name,
      ...logData
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addTimelineEvent = (projectId: string, title: string, description: string, type: ProjectTimelineEvent['type']) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newEvent: ProjectTimelineEvent = {
      id: `tle-${Date.now()}-${Math.random()}`,
      projectId,
      title,
      description,
      timestamp,
      userName: currentUser.fullName,
      type
    };
    setProjectTimelineEvents(prev => [newEvent, ...prev]);
  };

  const switchPersona = (personaId: DemoPersonaId) => {
    const persona = demoPersonas.find(p => p.id === personaId);
    if (!persona) return;

    const targetUser = users.find(u => u.id === persona.userId);
    if (!targetUser) return;

    setCurrentUserId(targetUser.id);
    setActivePersonaId(personaId);

    if (!targetUser.assignedBranchIds.includes(currentBranchId)) {
      const firstAuthBranch = targetUser.assignedBranchIds[0];
      if (firstAuthBranch) {
        setCurrentBranchId(firstAuthBranch);
      }
    }

    addAuditLog({
      category: 'security',
      action: 'تبديل السيناريو والتجسيد',
      actionEn: 'Demo Persona Switched',
      target: persona.name,
      details: `تم الانتقال لتجربة السيناريو كـ: ${persona.roleTitle}`,
      status: 'success'
    });

    showToast(`تم التبديل إلى سيناريو: ${persona.name} (${persona.roleTitle})`, 'success');
  };

  const setCurrentBranch = (branchId: string): boolean => {
    const securityCheck = BackendSecurityService.checkBranchAccess(currentUser, branchId);
    
    if (!securityCheck.isAllowed) {
      addAuditLog({
        category: 'security',
        action: 'محاولة التبديل لفرع غير مصرح به',
        actionEn: 'Unauthorized Branch Switch Attempt',
        target: branchId,
        details: securityCheck.reason,
        status: 'denied'
      });
      showToast(securityCheck.reason, 'error');
      return false;
    }

    const targetBranch = branches.find(b => b.id === branchId);
    setCurrentBranchId(branchId);

    addAuditLog({
      category: 'branch',
      action: 'تغيير الفرع النشط',
      actionEn: 'Active Branch Switched',
      target: targetBranch ? targetBranch.name : branchId,
      details: `تم تبديل الفرع النشط في الشاشة الرئيسية إلى: ${targetBranch?.name}`,
      status: 'success'
    });

    showToast(`تم التغيير إلى الفرع: ${targetBranch?.name}`, 'info');
    return true;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const updateCompanyConfig = (updates: Partial<CompanyConfig>) => {
    setCompany(prev => ({ ...prev, ...updates }));
    addAuditLog({
      category: 'company',
      action: 'تحديث بيانات الشركة الأساسية',
      actionEn: 'Company Config Updated',
      target: company.name,
      details: `تحديث إعدادات النشاط (${updates.businessType || company.businessType}) ونموذج العمل (${updates.businessModel || company.businessModel})`,
      status: 'success'
    });
    showToast('تم حفظ إعدادات الشركة بنجاح', 'success');
  };

  const setMainBranch = (branchId: string) => {
    const targetBranch = branches.find(b => b.id === branchId);
    if (!targetBranch) return;

    setBranches(prev => prev.map(b => ({
      ...b,
      isMain: b.id === branchId
    })));

    setCompany(prev => ({ ...prev, mainBranchId: branchId }));

    addAuditLog({
      category: 'branch',
      action: 'تعيين الفرع الرئيسي للشركة',
      actionEn: 'Main Branch Set',
      target: targetBranch.name,
      details: `تم اعتماد فرع "${targetBranch.name}" كفرع رئيسي معتمد للشركة`,
      status: 'success'
    });

    showToast(`تم اعتماد "${targetBranch.name}" كفرع رئيسي للشركة`, 'success');
  };

  const addUser = (userData: Omit<User, 'id' | 'createdDate' | 'lastLogin'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdDate: new Date().toISOString().substring(0, 10),
      lastLogin: 'لم يسجل دخول بعد'
    };
    setUsers(prev => [...prev, newUser]);
    addAuditLog({
      category: 'user',
      action: 'إضافة مستخدم جديد',
      actionEn: 'User Created',
      target: newUser.fullName,
      details: `تمت إضافة المستخدم (${newUser.email}) وتكليفه بـ ${newUser.assignedBranchIds.length} فروع`,
      status: 'success'
    });
    showToast(`تمت إضافة المستخدم ${newUser.fullName} بنجاح`, 'success');
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    const targetUser = users.find(u => u.id === userId);
    addAuditLog({
      category: 'user',
      action: 'تحديث بيانات مستخدم',
      actionEn: 'User Updated',
      target: targetUser ? targetUser.fullName : userId,
      details: `تحديث بيانات الحساب وتوزيع الفروع الصلاحية`,
      status: 'success'
    });
    showToast('تم تحديث بيانات المستخدم بنجاح', 'success');
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'inactive' : 'active';
        addAuditLog({
          category: 'user',
          action: nextStatus === 'active' ? 'تنشيط حساب مستخدم' : 'تعطيل حساب مستخدم',
          actionEn: nextStatus === 'active' ? 'User Activated' : 'User Deactivated',
          target: u.fullName,
          details: `تم تغيير حالة الحساب إلى: ${nextStatus === 'active' ? 'نشط' : 'معطل'}`,
          status: 'warning'
        });
        return { ...u, status: nextStatus };
      }
      return u;
    }));
    showToast('تم تغيير حالة حساب المستخدم', 'info');
  };

  const addRole = (roleData: Omit<Role, 'id'>) => {
    const newRole: Role = {
      ...roleData,
      id: `role-custom-${Date.now()}`
    };
    setRoles(prev => [...prev, newRole]);
    addAuditLog({
      category: 'role',
      action: 'إنشاء دور مخصص جديد',
      actionEn: 'Custom Role Created',
      target: newRole.name,
      details: `تحديد مصفوفة الصلاحيات الخاصة بدور: ${newRole.name}`,
      status: 'success'
    });
    showToast(`تم إنشاء الدور المخصص "${newRole.name}" بنجاح`, 'success');
  };

  const updateRolePermissions = (roleId: string, permissions: ModulePermissions) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions } : r));
    const role = roles.find(r => r.id === roleId);
    addAuditLog({
      category: 'role',
      action: 'تعديل مصفوفة الصلاحيات للدور',
      actionEn: 'Role Permissions Updated',
      target: role ? role.name : roleId,
      details: `تم حفظ مصفوفة الصلاحيات الجديدة على الوحدات`,
      status: 'success'
    });
    showToast('تم حفظ مصفوفة الصلاحيات المحدثة', 'success');
  };

  const addBranch = (branchData: Omit<Branch, 'id' | 'createdDate'>) => {
    const newBranch: Branch = {
      ...branchData,
      id: `branch-${Date.now()}`,
      createdDate: new Date().toISOString().substring(0, 10)
    };
    setBranches(prev => [...prev, newBranch]);
    setUsers(prev => prev.map(u => {
      const role = roles.find(r => r.id === u.roleId);
      if (role?.isSystem && role.id === 'role-superadmin') {
        return { ...u, assignedBranchIds: [...u.assignedBranchIds, newBranch.id] };
      }
      return u;
    }));

    addAuditLog({
      category: 'branch',
      action: 'إضافة مقرات وفرع جديد',
      actionEn: 'Branch Created',
      target: newBranch.name,
      details: `نوع المنشأة: ${newBranch.type} | العنوان: ${newBranch.address}`,
      status: 'success'
    });
    showToast(`تمت إضافة الفرع الجديد "${newBranch.name}"`, 'success');
  };

  const updateBranch = (branchId: string, updates: Partial<Branch>) => {
    setBranches(prev => prev.map(b => b.id === branchId ? { ...b, ...updates } : b));
    const targetBranch = branches.find(b => b.id === branchId);
    addAuditLog({
      category: 'branch',
      action: 'تعديل بيانات فرع/مقر',
      actionEn: 'Branch Updated',
      target: targetBranch ? targetBranch.name : branchId,
      details: `تحديث تفاصيل المنشأة أو المدير المسؤول`,
      status: 'success'
    });
    showToast('تم تعديل بيانات الفرع بنجاح', 'success');
  };

  const checkPermission = (module: ModuleId, action: keyof PermissionActions): boolean => {
    const res = BackendSecurityService.checkModulePermission(currentUser, currentRole, module, action);
    return res.isAllowed;
  };

  const checkBranchAccess = (branchId: string): boolean => {
    const res = BackendSecurityService.checkBranchAccess(currentUser, branchId);
    return res.isAllowed;
  };

  const runApiSecurityTest = (
    endpoint: string,
    method: string,
    module: ModuleId,
    action: keyof PermissionActions,
    targetBranchId?: string
  ): ApiSecurityTestResult => {
    const result = BackendSecurityService.simulateApiCall(
      currentUser,
      currentRole,
      endpoint,
      method,
      module,
      action,
      targetBranchId
    );

    addAuditLog({
      category: 'security',
      action: `اختبار API: ${method} ${endpoint}`,
      actionEn: `Api Security Test: ${method} ${endpoint}`,
      target: endpoint,
      details: result.isAllowed ? `200 OK: ${result.reason}` : `${result.statusCode} Forbidden: ${result.reason}`,
      status: result.isAllowed ? 'success' : 'denied'
    });

    return result;
  };

  // CRM Actions
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdDate' | 'lastActivityDate' | 'hasPurchased' | 'isAfterSales'>): Customer => {
    const today = new Date().toISOString().substring(0, 10);
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      createdDate: today,
      lastActivityDate: timestamp,
      hasPurchased: customerData.status === 'won' || customerData.status === 'customer' || customerData.status === 'completed',
      isAfterSales: customerData.status === 'completed'
    };

    setCustomers(prev => [newCustomer, ...prev]);
    showToast(`تمت إضافة العميل ${newCustomer.fullName} بنجاح`, 'success');
    return newCustomer;
  };

  const updateCustomer = (customerId: string, updates: Partial<Customer>) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...updates, lastActivityDate: timestamp } : c));
    showToast('تم تحديث بيانات العميل بنجاح', 'success');
  };

  const updateCustomerStatus = (customerId: string, newStatus: CustomerStatus, lostReason?: LostReason, lostNote?: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, status: newStatus, lostReason, lostNote, lastActivityDate: timestamp } : c));
    showToast('تمت تحديث حالة العميل', 'success');
  };

  const addCustomerActivity = (customerId: string, type: CustomerActivity['type'], title: string, note: string) => {
    const today = new Date().toISOString().substring(0, 10);
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newActivity: CustomerActivity = {
      id: `act-${Date.now()}`,
      customerId,
      type,
      title,
      note,
      date: today,
      timestamp,
      userId: currentUser.id,
      userName: currentUser.fullName
    };

    setActivities(prev => [newActivity, ...prev]);
    showToast('تم تسجيل النشاط بسجل العميل', 'success');
  };

  const addCustomerReminder = (customerId: string, title: string, dueDate: string, dueTime?: string, priority: 'normal' | 'high' = 'normal') => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const newReminder: CustomerReminder = {
      id: `rem-${Date.now()}`,
      customerId,
      customerName: customer.fullName,
      customerPhone: customer.phone,
      title,
      dueDate,
      dueTime: dueTime || '12:00',
      assignedUserId: currentUser.id,
      assignedUserName: currentUser.fullName,
      isCompleted: false,
      createdDate: new Date().toISOString().substring(0, 10),
      priority
    };

    setReminders(prev => [newReminder, ...prev]);
    showToast(`تم جدول التذكير لمتابعة ${customer.fullName}`, 'success');
  };

  const toggleReminderCompleted = (reminderId: string) => {
    setReminders(prev => prev.map(r => r.id === reminderId ? { ...r, isCompleted: !r.isCompleted } : r));
    showToast('تمت تحديث حالة التذكير', 'info');
  };

  const addCampaign = (campaignData: Omit<MarketingCampaign, 'id' | 'customersCount' | 'purchasedCount' | 'revenueAttributed'>) => {
    const newCampaign: MarketingCampaign = {
      ...campaignData,
      id: `cmp-${Date.now()}`,
      customersCount: 0,
      purchasedCount: 0,
      revenueAttributed: 0
    };
    setCampaigns(prev => [...prev, newCampaign]);
    showToast(`تمت إضافة الحملة الإعلانية "${newCampaign.name}"`, 'success');
  };

  const updateCampaign = (campaignId: string, updates: Partial<MarketingCampaign>) => {
    setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, ...updates } : c));
    showToast('تم حفظ تعديلات الحملة الإعلانية', 'success');
  };

  // Ready Sales Actions
  const createReadyOrder = (orderData: any): ReadyOrder => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const orderNumber = `ORD-2026-${Math.floor(100 + Math.random() * 900)}`;

    const { subtotal, totalDiscount, orderTotal, totalPurchaseCost, grossProfit } = ReadySalesService.calculateOrderTotals(orderData.items);
    const depositAmount = Number(orderData.depositAmount || 0);

    const newOrder: ReadyOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      branchId: orderData.branchId,
      branchName: orderData.branchName,
      salesUserId: currentUser.id,
      salesUserName: currentUser.fullName,
      items: orderData.items,
      subtotal,
      totalDiscount,
      orderTotal,
      totalPurchaseCost,
      grossProfit,
      paymentStatus: depositAmount >= orderTotal ? 'fully_paid' : depositAmount > 0 ? 'deposit_paid' : 'unpaid',
      depositAmount,
      paidAmount: depositAmount,
      remainingBalance: Math.max(0, orderTotal - depositAmount),
      orderStatus: 'confirmed',
      deliveryInfo: {
        deliveryStatus: 'preparing',
        scheduledDate: orderData.scheduledDeliveryDate || new Date(Date.now() + 604800000).toISOString().substring(0, 10),
        deliveryAddress: orderData.deliveryAddress || 'عنوان العميل',
        city: orderData.city || 'القاهرة',
        area: orderData.area || 'التجمع'
      },
      createdDate: timestamp,
      lastUpdatedDate: timestamp
    };

    setOrders(prev => [newOrder, ...prev]);
    showToast(`تم إنشاء طلب المبيعات (${newOrder.orderNumber})`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
    showToast('تم تحديث حالة الطلب', 'success');
  };

  const updateDeliveryStatus = (orderId: string, deliveryStatus: DeliveryStatus, actualDeliveryDate?: string, notes?: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryInfo: { ...o.deliveryInfo, deliveryStatus, actualDeliveryDate, deliveryNotes: notes } } : o));
    showToast('تم تحديث حالة التوصيل', 'success');
  };

  const recordCustomerPayment = (
    orderId: string,
    amount: number,
    method: CustomerPayment['paymentMethod'],
    receiptRef?: string,
    paymentType: CustomerPayment['paymentType'] = 'installment',
    scheduleItemId?: string,
    notes?: string
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    if (amount > targetOrder.remainingBalance && targetOrder.remainingBalance > 0) {
      showToast(`⚠️ تحذير: المبلغ المدفوع (${amount.toLocaleString('ar-EG')} ج.م) يتجاوز الرصيد المتبقي على العميل (${targetOrder.remainingBalance.toLocaleString('ar-EG')} ج.م)`, 'warning');
    }

    const receiptNumber = receiptRef || `RCP-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newPayment: CustomerPayment = {
      id: `pay-${Date.now()}`,
      orderId,
      orderNumber: targetOrder.orderNumber,
      customerId: targetOrder.customerId,
      customerName: targetOrder.customerName,
      amount,
      paymentDate: timestamp,
      paymentMethod: method,
      receiptRef: receiptNumber,
      receivedByUserId: currentUser.id,
      receivedByUserName: currentUser.fullName,
      notes,
      paymentType
    };

    const newReceipt: PaymentReceipt = {
      id: `rcp-${Date.now()}`,
      receiptNumber,
      orderId,
      orderNumber: targetOrder.orderNumber,
      customerId: targetOrder.customerId,
      customerName: targetOrder.customerName,
      amount,
      paymentDate: timestamp,
      paymentMethod: method,
      paymentType,
      receivedByUserName: currentUser.fullName,
      notes
    };
    setPaymentReceipts(prev => [newReceipt, ...prev]);
    setPayments(prev => [newPayment, ...prev]);

    // Financial Transaction Entry for Central Finance
    const acc = financialAccounts.find(a => method === 'cash' ? a.type === 'cash' : a.type === 'bank') || financialAccounts[0];
    const newFinancialTx: FinancialTransaction = {
      id: `ft-${Date.now()}`,
      refNumber: receiptNumber,
      timestamp,
      type: 'income',
      category: 'تحصيل دفعات عملاء',
      description: `تحصيل دفعة مالية لحساب الطلب (${targetOrder.orderNumber})`,
      amount,
      direction: 'in',
      branchId: targetOrder.branchId,
      branchName: targetOrder.branchName,
      accountId: acc.id,
      accountName: acc.name,
      customerId: targetOrder.customerId,
      customerName: targetOrder.customerName,
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      projectId: targetOrder.projectId,
      createdByUserName: currentUser.fullName,
      notes
    };
    setFinancialTransactions(prev => [newFinancialTx, ...prev]);

    // Increase target Financial Account Balance
    setFinancialAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, currentBalance: a.currentBalance + amount } : a));

    const newPaidAmount = targetOrder.paidAmount + amount;
    const newRemainingBalance = Math.max(0, targetOrder.orderTotal - newPaidAmount);

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          paidAmount: newPaidAmount,
          remainingBalance: newRemainingBalance,
          paymentStatus: newRemainingBalance === 0 ? 'fully_paid' : newPaidAmount > 0 ? 'partially_paid' : 'unpaid'
        };
      }
      return o;
    }));

    if (scheduleItemId) {
      setPaymentSchedules(prev => prev.map(sch => {
        if (sch.id === scheduleItemId) {
          const nextPaid = (sch.paidAmount || 0) + amount;
          const nextRem = Math.max(0, sch.amount - nextPaid);
          return {
            ...sch,
            paidAmount: nextPaid,
            remainingAmount: nextRem,
            status: nextRem === 0 ? 'paid' : 'partially_paid',
            paidDate: timestamp.substring(0, 10),
            paymentRef: receiptNumber
          };
        }
        return sch;
      }));
    }

    showToast(`تم تحصيل ${amount.toLocaleString('ar-EG')} ج.م وإصدار الإيصال رقم (${receiptNumber})`, 'success');
  };

  const processOrderReturn = (orderId: string, productId: string, quantity: number, reason: string, refundAmount: number) => {
    showToast('تم معالجة مرتجع الطلب', 'info');
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdDate'>) => {
    const newProduct: Product = { ...productData, id: `prod-${Date.now()}`, createdDate: new Date().toISOString().substring(0, 10) };
    setProducts(prev => [newProduct, ...prev]);
    showToast(`تمت إضافة المنتج ${newProduct.name}`, 'success');
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
    showToast('تم تحديث بيانات المنتج', 'success');
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'createdDate' | 'totalPurchases' | 'totalPaid' | 'balanceDue'>) => {
    const newSupplier: Supplier = { ...supplierData, id: `sup-${Date.now()}`, totalPurchases: 0, totalPaid: 0, balanceDue: 0, createdDate: new Date().toISOString().substring(0, 10) };
    setSuppliers(prev => [...prev, newSupplier]);
    showToast(`تمت إضافة المورد ${newSupplier.name}`, 'success');
  };

  const recordSupplierPayment = (supplierId: string, amount: number, paymentMethod: SupplierPaymentRecord['paymentMethod'], referenceNumber?: string, notes?: string) => {
    setSuppliers(prev => prev.map(s => s.id === supplierId ? { ...s, totalPaid: s.totalPaid + amount, balanceDue: Math.max(0, s.totalPurchases - (s.totalPaid + amount)) } : s));
    showToast(`تم تسجيل سداد مبلغ للمورد`, 'success');
  };

  // Prompt 4 Actions
  const addMaterial = (materialData: Omit<Material, 'id' | 'createdDate' | 'currentStock' | 'reservedStock' | 'availableStock'>) => {
    const newMaterial: Material = { ...materialData, id: `mat-${Date.now()}`, currentStock: 0, reservedStock: 0, availableStock: 0, createdDate: new Date().toISOString().substring(0, 10) };
    setMaterials(prev => [newMaterial, ...prev]);
    showToast(`تمت إضافة الخامة ${newMaterial.name}`, 'success');
  };

  const updateMaterial = (materialId: string, updates: Partial<Material>) => {
    setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, ...updates } : m));
    showToast('تم تحديث بيانات الخامة', 'success');
  };

  const createPurchaseOrder = (poData: any): PurchaseOrder => {
    const poNumber = poData.poNumber || `PO-2026-${Math.floor(100 + Math.random() * 900)}`;

    const items: PurchaseOrderItem[] = (poData.items || []).map((it: any, idx: number) => {
      const qty = Number(it.quantity) || 1;
      const unitCost = Number(it.unitCost) || 0;
      const totalCost = Number(it.totalCost) || (qty * unitCost);
      return {
        id: it.id || `poi-${Date.now()}-${idx}`,
        itemId: it.itemId || `item-${idx}`,
        itemType: it.itemType || 'material',
        itemName: it.itemName || 'صنف غير محدد',
        itemCode: it.itemCode || 'CODE',
        quantity: qty,
        receivedQuantity: Number(it.receivedQuantity) || 0,
        unit: it.unit || 'وحدة',
        unitCost,
        totalCost
      };
    });

    const calculatedTotal = items.reduce((sum, item) => sum + item.totalCost, 0);
    const totalAmount = Number(poData.totalAmount) >= 0 ? Number(poData.totalAmount) : calculatedTotal;
    const paidAmount = Number(poData.paidAmount) || 0;
    const balanceDue = Number(poData.balanceDue) >= 0 ? Number(poData.balanceDue) : Math.max(0, totalAmount - paidAmount);

    let paymentStatus: 'unpaid' | 'partially_paid' | 'paid' = 'unpaid';
    if (paidAmount >= totalAmount && totalAmount > 0) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partially_paid';
    }

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      supplierId: poData.supplierId || '',
      supplierName: poData.supplierName || 'مورد عام',
      branchId: poData.branchId || '',
      branchName: poData.branchName || 'المخزن الرئيسي',
      orderDate: poData.orderDate || new Date().toISOString().substring(0, 10),
      expectedDeliveryDate: poData.expectedDeliveryDate || new Date().toISOString().substring(0, 10),
      items,
      totalAmount,
      paidAmount,
      balanceDue,
      receivingStatus: poData.receivingStatus || 'pending',
      paymentStatus: poData.paymentStatus || paymentStatus,
      createdByUserName: currentUser.fullName,
      notes: poData.notes || ''
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    showToast(`تم إصدار أمر الشراء رقم ${poNumber}`, 'success');
    return newPO;
  };

  const receivePurchaseItems = (poId: string, receivedMap: Record<string, number>, notes?: string) => {
    setPurchaseOrders(prevPOs => prevPOs.map(po => {
      if (po.id !== poId) return po;

      let allFullyReceived = true;
      let anyReceived = false;

      const updatedItems = po.items.map(item => {
        const newlyReceived = Number(receivedMap[item.id]) || 0;
        const totalReceived = Math.min(item.quantity, (item.receivedQuantity || 0) + newlyReceived);

        if (newlyReceived > 0) {
          anyReceived = true;
          if (item.itemType === 'material') {
            setMaterials(prevMats => prevMats.map(m => {
              if (m.id === item.itemId) {
                const newStock = m.currentStock + newlyReceived;
                return {
                  ...m,
                  currentStock: newStock,
                  availableStock: newStock - m.reservedStock
                };
              }
              return m;
            }));
          } else if (item.itemType === 'product') {
            setProducts(prevProds => prevProds.map(p => {
              if (p.id === item.itemId) {
                const updatedLocations = (p.stockByLocation || []).map(loc => ({
                  ...loc,
                  onHand: loc.onHand + newlyReceived,
                  available: loc.available + newlyReceived
                }));
                return {
                  ...p,
                  stockByLocation: updatedLocations
                };
              }
              return p;
            }));
          }
        }

        if (totalReceived < item.quantity) {
          allFullyReceived = false;
        }

        return {
          ...item,
          receivedQuantity: totalReceived
        };
      });

      const nextReceivingStatus = allFullyReceived ? 'fully_received' : (anyReceived ? 'partially_received' : po.receivingStatus);

      return {
        ...po,
        items: updatedItems,
        receivingStatus: nextReceivingStatus,
        notes: notes ? `${po.notes || ''} | استلام: ${notes}` : po.notes
      };
    }));

    showToast('تم إثبات استلام الشحنة وتحديث المخزون بالمخازن', 'success');
  };

  const createStockTransfer = (transferData: any): StockTransfer => {
    const transferNumber = `TRF-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newTransfer: StockTransfer = { ...transferData, id: `trf-${Date.now()}`, transferNumber, status: 'requested', requestedDate: new Date().toISOString().substring(0, 10), requestedByUserId: currentUser.id, requestedByUserName: currentUser.fullName };
    setStockTransfers(prev => [...prev, newTransfer]);
    showToast(`تم إنشاء طلب تحويل ${transferNumber}`, 'success');
    return newTransfer;
  };

  const updateTransferStatus = (transferId: string, nextStatus: StockTransfer['status']) => {
    setStockTransfers(prev => prev.map(t => t.id === transferId ? { ...t, status: nextStatus } : t));
    showToast('تم تحديث حالة طلب التحويل', 'success');
  };

  const processStockAdjustment = (itemId: string, itemType: 'product' | 'material', branchId: string, quantityChange: number, reason: string) => {
    showToast('تمت تسوية رصيد المخزون', 'success');
  };

  const processSupplierReturn = (returnOrderData: any): SupplierReturn => {
    const returnNumber = `PRET-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newReturn: SupplierReturn = { ...returnOrderData, id: `sret-${Date.now()}`, returnNumber, returnDate: new Date().toISOString().substring(0, 10), processedByUserName: currentUser.fullName };
    setSupplierReturns(prev => [...prev, newReturn]);
    showToast(`تم إثبات مرتجع المورد (${returnNumber})`, 'success');
    return newReturn;
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  };

  // Custom Projects Actions
  const createCustomProject = (projectData: any): CustomProject => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const today = timestamp.substring(0, 10);
    const projectNumber = `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newProject: CustomProject = {
      id: `prj-${Date.now()}`,
      projectNumber,
      projectName: projectData.projectName,
      customerId: projectData.customerId,
      customerName: projectData.customerName,
      customerPhone: projectData.customerPhone,
      branchId: projectData.branchId,
      branchName: projectData.branchName,
      projectType: projectData.projectType,
      assignedUserId: currentUser.id,
      assignedUserName: currentUser.fullName,
      status: 'new',
      createdDate: today,
      lastUpdatedDate: timestamp,
      notes: projectData.notes
    };

    setCustomProjects(prev => [newProject, ...prev]);
    showToast(`تم إنشاء مشروع التفصيل (${newProject.projectNumber}) بنجاح`, 'success');
    return newProject;
  };

  const updateProjectStatus = (projectId: string, newStatus: ProjectStatus) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setCustomProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, status: newStatus, lastUpdatedDate: timestamp };
      }
      return p;
    }));

    const statusMeta = CustomProjectService.getProjectStatusMeta(newStatus);
    addTimelineEvent(projectId, `تحديث حالة المشروع إلى "${statusMeta.label}"`, `تم تغيير مرحلة المشروع بموافقة وتتبع النظام`, 'system');
    showToast(`تمت تحديث حالة المشروع إلى: ${statusMeta.label}`, 'success');
  };

  const scheduleSiteVisit = (projectId: string, visitData: any): SiteVisit => {
    const targetProject = customProjects.find(p => p.id === projectId);
    if (!targetProject) throw new Error('Project not found');

    const newVisit: SiteVisit = {
      id: `vis-${Date.now()}`,
      projectId,
      projectNumber: targetProject.projectNumber,
      customerName: targetProject.customerName,
      date: visitData.date,
      time: visitData.time || '16:00',
      address: visitData.address,
      assignedUserId: visitData.assignedUserId || currentUser.id,
      assignedUserName: visitData.assignedUserName || currentUser.fullName,
      status: 'scheduled',
      notes: visitData.notes,
      photos: []
    };

    setSiteVisits(prev => [...prev, newVisit]);
    updateProjectStatus(projectId, 'visit_scheduled');
    showToast(`تم جدول موعد المعاينة لمشروع (${targetProject.projectNumber})`, 'success');
    return newVisit;
  };

  const completeSiteVisit = (visitId: string, siteData: any) => {
    const targetVisit = siteVisits.find(v => v.id === visitId);
    if (!targetVisit) return;

    setSiteVisits(prev => prev.map(v => v.id === visitId ? { ...v, status: 'completed', notes: siteData.notes || v.notes, photos: siteData.photos || v.photos, siteConditions: siteData.siteConditions || v.siteConditions } : v));
    updateProjectStatus(targetVisit.projectId, 'measured');
    showToast('تمت توثيق المعاينة الميدانية بنجاح', 'success');
  };

  const addProjectMeasurement = (
    projectId: string,
    items: any[],
    reason?: string,
    sitePhotos?: string[],
    siteVideos?: string[],
    technicalNotes?: string
  ): ProjectMeasurement => {
    const today = new Date().toISOString().substring(0, 10);
    const existingMeas = projectMeasurements.filter(m => m.projectId === projectId);
    const nextVersion = existingMeas.length + 1;

    const newMeasurement: ProjectMeasurement = {
      id: `meas-${Date.now()}`,
      projectId,
      version: nextVersion,
      createdDate: today,
      createdByUserName: currentUser.fullName,
      reasonForUpdate: reason || (nextVersion === 1 ? 'رفع المقاسات الأولي بالموقع' : `تحديث المقاسات نسق V${nextVersion}`),
      items: items.map((it, idx) => ({
        id: `mi-${Date.now()}-${idx}`,
        name: it.name,
        value: Number(it.value),
        unit: it.unit || 'cm',
        notes: it.notes,
        photoUrl: it.photoUrl
      })),
      sitePhotos: sitePhotos || [],
      siteVideos: siteVideos || [],
      technicalNotes: technicalNotes || ''
    };

    setProjectMeasurements(prev => [...prev, newMeasurement]);
    updateProjectStatus(projectId, 'designing');
    showToast(`تمت إضافة نسخة المقاسات V${nextVersion} للمشروع مع المرفقات والتجهيزات الفنية`, 'success');
    return newMeasurement;
  };

  const addProjectDesign = (projectId: string, designData: any): ProjectDesign => {
    const today = new Date().toISOString().substring(0, 10);
    const existingDesigns = projectDesigns.filter(d => d.projectId === projectId);
    const nextVersion = existingDesigns.length + 1;

    const newDesign: ProjectDesign = {
      id: `dsg-${Date.now()}`,
      projectId,
      designName: designData.designName || `تصميم 3D نسق V${nextVersion}`,
      version: nextVersion,
      images: designData.images || ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600'],
      pdfUrl: designData.pdfUrl,
      notes: designData.notes,
      createdByUserName: currentUser.fullName,
      createdDate: today,
      status: 'sent_to_customer',
      comments: []
    };

    setProjectDesigns(prev => [...prev, newDesign]);
    updateProjectStatus(projectId, 'design_review');
    showToast(`تم إرسال تصميم V${nextVersion} لمراجعة العميل`, 'success');
    return newDesign;
  };

  const updateDesignStatus = (designId: string, status: DesignStatus, rejectionReason?: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const targetDesign = projectDesigns.find(d => d.id === designId);
    if (!targetDesign) return;

    setProjectDesigns(prev => prev.map(d => {
      if (d.id === designId) {
        return {
          ...d,
          status,
          rejectionReason: status === 'rejected' ? rejectionReason : d.rejectionReason,
          approvedAt: status === 'approved' ? timestamp : d.approvedAt,
          approvedByCustomerName: status === 'approved' ? 'محمد حسن (العميل)' : d.approvedByCustomerName
        };
      }
      return d;
    }));

    if (status === 'approved') {
      updateProjectStatus(targetDesign.projectId, 'quotation');
    }

    showToast(`تمت تحديث حالة التصميم V${targetDesign.version} إلى: ${CustomProjectService.getDesignStatusMeta(status).label}`, status === 'approved' ? 'success' : 'warning');
  };

  const addDesignComment = (designId: string, text: string, isCustomer: boolean = false) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const comment = { id: `comm-${Date.now()}`, userName: isCustomer ? 'العميل' : currentUser.fullName, text, date: timestamp, isCustomer };

    setProjectDesigns(prev => prev.map(d => d.id === designId ? { ...d, comments: [...d.comments, comment] } : d));
    showToast('تم تسجيل الملاحظة على التصميم', 'info');
  };

  const createProjectQuotation = (projectId: string, quotationData: any): ProjectQuotation => {
    const today = new Date().toISOString().substring(0, 10);
    const existingQuotes = projectQuotations.filter(q => q.projectId === projectId);
    const nextVersion = existingQuotes.length + 1;

    const { subtotalSelling, subtotalCost, totalSelling, totalCost, estimatedProfit } = CustomProjectService.calculateQuotationTotals(quotationData.items);

    const newQuotation: ProjectQuotation = {
      id: `qte-${Date.now()}`,
      projectId,
      version: nextVersion,
      createdDate: today,
      createdByUserName: currentUser.fullName,
      status: 'sent',
      items: quotationData.items,
      subtotalSelling,
      subtotalCost,
      discount: Number(quotationData.discount || 0),
      totalSelling: totalSelling - Number(quotationData.discount || 0),
      totalCost,
      estimatedProfit: estimatedProfit - Number(quotationData.discount || 0),
      notes: quotationData.notes
    };

    setProjectQuotations(prev => [...prev, newQuotation]);
    updateProjectStatus(projectId, 'customer_approval');
    showToast(`تم إرسال عرض السعر V${nextVersion} بمبلغ ${newQuotation.totalSelling.toLocaleString('ar-EG')} ج.م`, 'success');
    return newQuotation;
  };

  const updateQuotationStatus = (quotationId: string, status: QuotationStatus, rejectionReason?: string) => {
    setProjectQuotations(prev => prev.map(q => q.id === quotationId ? { ...q, status, rejectionReason: status === 'rejected' ? rejectionReason : q.rejectionReason } : q));
    showToast(`تم تحديث حالة عرض السعر إلى: ${CustomProjectService.getQuotationStatusMeta(status).label}`, 'info');
  };

  const acceptQuotation = (quotationId: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const targetQuotation = projectQuotations.find(q => q.id === quotationId);
    if (!targetQuotation) return;

    setProjectQuotations(prev => prev.map(q => q.id === quotationId ? { ...q, status: 'accepted', acceptedAt: timestamp, acceptedByCustomerName: 'العميل المعتمد' } : q));
    updateProjectStatus(targetQuotation.projectId, 'approved');
    showToast(`🎉 تم اعتماد موافقة العميل على عرض السعر V${targetQuotation.version} وتفعيل عقد المشروع!`, 'success');
  };

  const createContractFromQuotation = (quotationId: string, paymentTerms: string, deliveryTerms: string, notes?: string): CustomContract => {
    const today = new Date().toISOString().substring(0, 10);
    const targetQuotation = projectQuotations.find(q => q.id === quotationId);
    if (!targetQuotation) throw new Error('Quotation not found');

    const targetProject = customProjects.find(p => p.id === targetQuotation.projectId);
    if (!targetProject) throw new Error('Project not found');

    const contractNumber = `CNT-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newContract: CustomContract = {
      id: `cnt-${Date.now()}`,
      contractNumber,
      projectId: targetProject.id,
      projectNumber: targetProject.projectNumber,
      customerId: targetProject.customerId,
      customerName: targetProject.customerName,
      quotationId: targetQuotation.id,
      quotationVersion: targetQuotation.version,
      contractDate: today,
      totalValue: targetQuotation.totalSelling,
      paymentTerms,
      deliveryTerms,
      status: 'signed',
      signedAt: `${today} 18:00`,
      signedByCustomerName: targetProject.customerName,
      notes
    };

    setCustomContracts(prev => [newContract, ...prev]);
    showToast(`تم توقيع وإصدار عقد التفصيل (${contractNumber}) بنجاح`, 'success');
    return newContract;
  };

  const signContract = (contractId: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setCustomContracts(prev => prev.map(c => c.id === contractId ? { ...c, status: 'signed', signedAt: timestamp, signedByCustomerName: 'العميل المعتمد' } : c));
    showToast('تم اعتماد توقيع العقد رسمياً', 'success');
  };

  const convertQuotationToOrder = (quotationId: string, depositAmount: number, installmentsCount: number = 4): ReadyOrder => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const targetQuotation = projectQuotations.find(q => q.id === quotationId);
    if (!targetQuotation) throw new Error('Quotation not found');

    const targetProject = customProjects.find(p => p.id === targetQuotation.projectId);
    if (!targetProject) throw new Error('Project not found');

    const orderNumber = `ORD-2026-${Math.floor(100 + Math.random() * 900)}`;
    const contract = customContracts.find(c => c.quotationId === quotationId);

    const orderItems = targetQuotation.items.map(i => ({
      id: `oi-${Date.now()}-${Math.random()}`,
      productId: i.materialId,
      productName: i.materialName,
      productCode: i.itemType === 'material' ? 'MAT-CODE' : 'ITEM-CODE',
      quantity: i.quantity,
      unitSellingPrice: i.unitSellingPrice,
      actualPurchaseCost: i.unitCost,
      discountAmount: 0,
      totalSellingPrice: i.totalSellingPrice,
      totalPurchaseCost: i.totalCost,
      itemGrossProfit: i.totalSellingPrice - i.totalCost
    }));

    const orderTotal = targetQuotation.totalSelling;
    const totalPurchaseCost = targetQuotation.totalCost;
    const grossProfit = targetQuotation.estimatedProfit;
    const remainingBalance = Math.max(0, orderTotal - depositAmount);

    const newOrder: ReadyOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: targetProject.customerId,
      customerName: targetProject.customerName,
      customerPhone: targetProject.customerPhone,
      branchId: targetProject.branchId,
      branchName: targetProject.branchName,
      salesUserId: currentUser.id,
      salesUserName: currentUser.fullName,
      projectId: targetProject.id,
      contractId: contract?.id,
      quotationId: targetQuotation.id,
      items: orderItems,
      subtotal: targetQuotation.subtotalSelling,
      totalDiscount: targetQuotation.discount,
      orderTotal,
      totalPurchaseCost,
      grossProfit,
      paymentStatus: depositAmount >= orderTotal ? 'fully_paid' : depositAmount > 0 ? 'deposit_paid' : 'unpaid',
      depositAmount,
      paidAmount: depositAmount,
      remainingBalance,
      orderStatus: 'preparing_production',
      deliveryInfo: {
        deliveryStatus: 'preparing',
        scheduledDate: new Date(Date.now() + 2592000000).toISOString().substring(0, 10),
        deliveryAddress: 'موقع العميل المعاين بالمشروع',
        city: 'القاهرة',
        area: 'التجمع الخامس'
      },
      createdDate: timestamp,
      lastUpdatedDate: timestamp
    };

    setOrders(prev => [newOrder, ...prev]);

    createProductionOrderFromCustomOrder(
      newOrder.id,
      'ورشة تصنيع العبور الرئيسية',
      timestamp.substring(0, 10),
      new Date(Date.now() + 1296000000).toISOString().substring(0, 10),
      ['الفني مصطفى كمال', 'الفني شريف فاروق']
    );

    updateProjectStatus(targetProject.id, 'ready_for_production');
    showToast(`🎉 تم تحويل عرض السعر إلى أمر مبيعات وإنتاج (${orderNumber}) بنجاح!`, 'success');
    return newOrder;
  };

  const loginAsPortalCustomer = (customerId: string) => {
    setPortalCurrentCustomerId(customerId);
    setActiveModule('portal');
    const cust = customers.find(c => c.id === customerId);
    showToast(`تم تسجيل الدخول ببوابة العملاء كـ: ${cust?.fullName}`, 'info');
  };

  // Production & Installation Actions
  const createProductionOrderFromCustomOrder = (
    orderId: string,
    workshopLocation: string,
    startDate: string,
    expectedDate: string,
    assignedTeam: string[]
  ): ProductionOrder => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) throw new Error('Order not found');

    const targetProject = customProjects.find(p => p.id === targetOrder.projectId);

    const productionNumber = `PROD-2026-${Math.floor(100 + Math.random() * 900)}`;

    const bomItems: ProductionMaterialItem[] = targetOrder.items.map((it, idx) => {
      const mat = materials.find(m => m.id === it.productId) || materials[0];
      const reqQty = it.quantity || 8;
      const estCost = mat ? mat.currentReferenceCost : 1250;

      return {
        id: `pm-${Date.now()}-${idx}`,
        productionOrderId: `prod-${Date.now()}`,
        materialId: mat.id,
        materialName: mat.name,
        materialCode: mat.code,
        unit: mat.unit,
        requiredQuantity: reqQty,
        reservedQuantity: 0,
        consumedQuantity: 0,
        remainingQuantity: reqQty,
        estimatedUnitCost: estCost,
        estimatedTotalCost: estCost * reqQty,
        actualUnitCost: estCost,
        actualTotalCost: 0,
        status: mat.availableStock < reqQty ? 'shortage' : 'pending'
      };
    });

    const totalEstimatedMaterialCost = bomItems.reduce((acc, i) => acc + i.estimatedTotalCost, 0);

    const newProdOrder: ProductionOrder = {
      id: `prod-${Date.now()}`,
      productionNumber,
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      projectId: targetProject?.id || 'prj-101',
      projectNumber: targetProject?.projectNumber || 'PRJ-2026-001',
      customerId: targetOrder.customerId,
      customerName: targetOrder.customerName,
      customerPhone: targetOrder.customerPhone,
      branchId: targetOrder.branchId,
      branchName: targetOrder.branchName,
      workshopLocation,
      startDate,
      expectedCompletionDate: expectedDate,
      assignedTeam,
      status: 'in_production',
      notes: `أمر تصنيع مباشر لمشروع (${targetProject?.projectName || targetOrder.orderNumber})`,
      completionPhotos: [],
      materials: bomItems,
      totalEstimatedMaterialCost,
      totalActualMaterialCost: 0,
      materialVariance: 0,
      createdDate: timestamp
    };

    setProductionOrders(prev => [newProdOrder, ...prev]);

    if (targetProject) {
      updateProjectStatus(targetProject.id, 'in_production');
    }

    showToast(`تم إنشاء أمر التصنيع (${productionNumber}) وتوجيهه للورشة`, 'success');
    return newProdOrder;
  };

  const reserveProductionMaterials = (productionOrderId: string, materialId: string, qtyToReserve: number) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const targetProd = productionOrders.find(p => p.id === productionOrderId);
    if (!targetProd) return;

    const targetMat = materials.find(m => m.id === materialId);
    if (!targetMat) return;

    setMaterials(prev => prev.map(m => {
      if (m.id === materialId) {
        const nextReserved = m.reservedStock + qtyToReserve;
        const nextAvailable = Math.max(0, m.currentStock - nextReserved);
        return { ...m, reservedStock: nextReserved, availableStock: nextAvailable };
      }
      return m;
    }));

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      itemId: targetMat.id,
      itemType: 'material',
      itemName: targetMat.name,
      itemCode: targetMat.code,
      quantity: qtyToReserve,
      sourceBranchId: targetProd.branchId,
      sourceBranchName: targetProd.branchName,
      movementType: 'reservation',
      referenceNumber: targetProd.productionNumber,
      timestamp,
      userId: currentUser.id,
      userName: currentUser.fullName,
      notes: `حجز خامات لأمر التصنيع (${targetProd.productionNumber})`
    };
    setStockMovements(prev => [newMovement, ...prev]);

    setProductionOrders(prev => prev.map(po => {
      if (po.id === productionOrderId) {
        const updatedBOM = po.materials.map(m => {
          if (m.materialId === materialId) {
            return { ...m, reservedQuantity: m.reservedQuantity + qtyToReserve, status: 'reserved' as const };
          }
          return m;
        });
        return { ...po, materials: updatedBOM };
      }
      return po;
    }));

    showToast(`✓ تم حجز ${qtyToReserve} ${targetMat.unit} من خام (${targetMat.name}) بمخزن الفرع`, 'success');
  };

  const consumeProductionMaterials = (productionOrderId: string, materialId: string, qtyToConsume: number, notes?: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const targetProd = productionOrders.find(p => p.id === productionOrderId);
    if (!targetProd) return;

    const targetMat = materials.find(m => m.id === materialId);
    if (!targetMat) return;

    const actualCostUnit = targetMat.currentReferenceCost;
    const actualCostTotal = actualCostUnit * qtyToConsume;

    setMaterials(prev => prev.map(m => {
      if (m.id === materialId) {
        const nextStock = Math.max(0, m.currentStock - qtyToConsume);
        const nextReserved = Math.max(0, m.reservedStock - qtyToConsume);
        const nextAvailable = Math.max(0, nextStock - nextReserved);
        return { ...m, currentStock: nextStock, reservedStock: nextReserved, availableStock: nextAvailable };
      }
      return m;
    }));

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      itemId: targetMat.id,
      itemType: 'material',
      itemName: targetMat.name,
      itemCode: targetMat.code,
      quantity: qtyToConsume,
      sourceBranchId: targetProd.branchId,
      sourceBranchName: targetProd.branchName,
      movementType: 'material_consumption',
      referenceNumber: targetProd.productionNumber,
      timestamp,
      userId: currentUser.id,
      userName: currentUser.fullName,
      notes: notes || `صرف واستهلاك خامات فعلي بالورشة لأمر التصنيع (${targetProd.productionNumber})`
    };
    setStockMovements(prev => [newMovement, ...prev]);

    setProductionOrders(prev => prev.map(po => {
      if (po.id === productionOrderId) {
        const updatedBOM = po.materials.map(m => {
          if (m.materialId === materialId) {
            const nextConsumed = m.consumedQuantity + qtyToConsume;
            const nextRemaining = Math.max(0, m.requiredQuantity - nextConsumed);
            const actualTotal = m.actualTotalCost + actualCostTotal;
            return {
              ...m,
              consumedQuantity: nextConsumed,
              remainingQuantity: nextRemaining,
              actualTotalCost: actualTotal,
              status: nextRemaining === 0 ? ('consumed' as const) : ('partially_consumed' as const)
            };
          }
          return m;
        });

        const totalActualCost = updatedBOM.reduce((acc, i) => acc + i.actualTotalCost, 0);
        const variance = totalActualCost - po.totalEstimatedMaterialCost;

        return {
          ...po,
          materials: updatedBOM,
          totalActualMaterialCost: totalActualCost,
          materialVariance: variance
        };
      }
      return po;
    }));

    showToast(`✓ تم خصم ${qtyToConsume} ${targetMat.unit} من المخزون وتوثيق التكلفة الفعلية (${actualCostTotal.toLocaleString('ar-EG')} ج.م)`, 'success');
  };

  const completeProductionOrder = (productionOrderId: string, completionPhotos: string[], notes?: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const targetProd = productionOrders.find(p => p.id === productionOrderId);
    if (!targetProd) return;

    setProductionOrders(prev => prev.map(p => {
      if (p.id === productionOrderId) {
        return {
          ...p,
          status: 'completed',
          actualCompletionDate: timestamp,
          completionPhotos: completionPhotos.length > 0 ? completionPhotos : p.completionPhotos,
          notes: notes || p.notes
        };
      }
      return p;
    }));

    const targetProject = customProjects.find(p => p.id === targetProd.projectId);
    if (targetProject) {
      updateProjectStatus(targetProject.id, 'production_completed');
    }

    showToast(`🎉 تم إكتمال تصنيع أمر الإنتاج (${targetProd.productionNumber}) وجاهز للتركيب!`, 'success');
  };

  const scheduleInstallation = (
    productionOrderId: string,
    scheduledDate: string,
    scheduledTime: string,
    address: string,
    assignedTeamIds: string[],
    notes?: string
  ): InstallationRecord => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const targetProd = productionOrders.find(p => p.id === productionOrderId);
    if (!targetProd) throw new Error('Production Order not found');

    const installationNumber = `INST-2026-${Math.floor(100 + Math.random() * 900)}`;
    const teamNames = assignedTeamIds.map(id => users.find(u => u.id === id)?.fullName || 'فني تركيبات');

    const newInst: InstallationRecord = {
      id: `inst-${Date.now()}`,
      installationNumber,
      productionOrderId,
      orderId: targetProd.orderId,
      orderNumber: targetProd.orderNumber,
      projectId: targetProd.projectId,
      projectNumber: targetProd.projectNumber,
      customerId: targetProd.customerId,
      customerName: targetProd.customerName,
      customerPhone: targetProd.customerPhone,
      address,
      scheduledDate,
      scheduledTime,
      assignedTeam: assignedTeamIds,
      assignedTeamNames: teamNames,
      status: 'scheduled',
      notes,
      beforePhotos: [],
      afterPhotos: [],
      handoverStatus: 'pending'
    };

    setInstallationRecords(prev => [newInst, ...prev]);

    const targetProject = customProjects.find(p => p.id === targetProd.projectId);
    if (targetProject) {
      updateProjectStatus(targetProject.id, 'installation_scheduled');
    }

    showToast(`تم جدولة موعد التركيب (${installationNumber}) بتاريخ ${scheduledDate}`, 'success');
    return newInst;
  };

  const completeInstallation = (installationId: string, afterPhotos: string[], notes?: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const targetInst = installationRecords.find(i => i.id === installationId);
    if (!targetInst) return;

    setInstallationRecords(prev => prev.map(inst => {
      if (inst.id === installationId) {
        return {
          ...inst,
          status: 'completed',
          completionDate: timestamp,
          afterPhotos: afterPhotos.length > 0 ? afterPhotos : inst.afterPhotos,
          handoverStatus: 'ready_for_handover',
          notes: notes || inst.notes
        };
      }
      return inst;
    }));

    const targetProject = customProjects.find(p => p.id === targetInst.projectId);
    if (targetProject) {
      updateProjectStatus(targetProject.id, 'installed');
    }

    showToast(`✓ تم إتمام تركيبات الموقع بنجاح ورابط التسليم جاهز!`, 'success');
  };

  const completeHandover = (installationId: string, notes?: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const targetInst = installationRecords.find(i => i.id === installationId);
    if (!targetInst) return;

    setInstallationRecords(prev => prev.map(inst => {
      if (inst.id === installationId) {
        return { ...inst, handoverStatus: 'delivered', handoverDate: timestamp, notes: notes || inst.notes };
      }
      return inst;
    }));

    setOrders(prev => prev.map(o => {
      if (o.id === targetInst.orderId) {
        return {
          ...o,
          orderStatus: 'completed',
          deliveryInfo: { ...o.deliveryInfo, deliveryStatus: 'delivered', actualDeliveryDate: timestamp }
        };
      }
      return o;
    }));

    const targetProject = customProjects.find(p => p.id === targetInst.projectId);
    if (targetProject) {
      updateProjectStatus(targetProject.id, 'completed');
    }

    showToast(`🎉 تم تسليم المشروع بالكامل للعميل وإغلاق الملف بنجاح 100%!`, 'success');
  };

  // ----------------------------------------------------
  // PROMPT 8: CENTRAL FINANCE ACTIONS
  // ----------------------------------------------------

  const addCompanyExpense = (expenseData: any): CompanyExpense => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const today = timestamp.substring(0, 10);
    const expenseNumber = `EXP-2026-${Math.floor(100 + Math.random() * 900)}`;

    const categoryNames: Record<ExpenseCategory, string> = {
      rent: 'إيجار مقرات ومعارض',
      salaries: 'مرتبات وأجور الموظفين',
      utilities: 'كهرباء ومياه ومرافق',
      marketing: 'تسويق وإعلانات',
      transportation: 'نقل وشحن',
      maintenance: 'صيانة وتجهيزات',
      workshop: 'مصاريف تشغيل الورشة',
      delivery: 'مصاريف نقل وتركيبات للمشاريع',
      office: 'أدوات مكتبية وإدارية',
      other: 'مصروفات تشغيلية أخرى'
    };

    const newExpense: CompanyExpense = {
      id: `exp-${Date.now()}`,
      expenseNumber,
      category: expenseData.category,
      categoryName: categoryNames[expenseData.category as ExpenseCategory] || 'مصروفات تشغيلية',
      description: expenseData.description,
      amount: Number(expenseData.amount),
      date: expenseData.date || today,
      branchId: expenseData.branchId || currentBranch.id,
      branchName: expenseData.branchName || currentBranch.name,
      paymentMethod: expenseData.paymentMethod || 'cash',
      accountName: expenseData.accountName || 'خزينة المعرض الرئيسي',
      projectId: expenseData.projectId,
      projectNumber: expenseData.projectNumber,
      employeeId: expenseData.employeeId,
      employeeName: expenseData.employeeName,
      recordedByUserName: currentUser.fullName,
      notes: expenseData.notes
    };

    setExpenses(prev => [newExpense, ...prev]);

    // Create central Financial Transaction
    const acc = financialAccounts.find(a => a.name === newExpense.accountName) || financialAccounts[0];
    const newTx: FinancialTransaction = {
      id: `ft-${Date.now()}`,
      refNumber: expenseNumber,
      timestamp,
      type: 'expense',
      category: newExpense.categoryName,
      description: newExpense.description,
      amount: newExpense.amount,
      direction: 'out',
      branchId: newExpense.branchId,
      branchName: newExpense.branchName,
      accountId: acc.id,
      accountName: acc.name,
      projectId: newExpense.projectId,
      projectNumber: newExpense.projectNumber,
      createdByUserName: currentUser.fullName,
      notes: newExpense.notes
    };
    setFinancialTransactions(prev => [newTx, ...prev]);

    // Deduct from Financial Account
    setFinancialAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, currentBalance: Math.max(0, a.currentBalance - newExpense.amount) } : a));

    addAuditLog({
      category: 'finance',
      action: 'إثبات مصروف تشغيلي جديد',
      actionEn: 'Company Expense Recorded',
      target: expenseNumber,
      details: `البند: ${newExpense.categoryName} | المبلغ: ${newExpense.amount.toLocaleString('ar-EG')} ج.م | البيان: ${newExpense.description}`,
      status: 'success'
    });

    showToast(`✓ تم تسجيل المصروف (${expenseNumber}) بمبلغ ${newExpense.amount.toLocaleString('ar-EG')} ج.م`, 'success');
    return newExpense;
  };

  const transferBetweenFinancialAccounts = (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    notes?: string
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const fromAcc = financialAccounts.find(a => a.id === fromAccountId);
    const toAcc = financialAccounts.find(a => a.id === toAccountId);
    if (!fromAcc || !toAcc) return;

    if (fromAcc.currentBalance < amount) {
      showToast(`⚠️ رصيد الحساب المجهّز (${fromAcc.name}) غير كافٍ لإجراء التحويل`, 'warning');
      return;
    }

    // Update balances
    setFinancialAccounts(prev => prev.map(a => {
      if (a.id === fromAccountId) {
        return { ...a, currentBalance: a.currentBalance - amount };
      }
      if (a.id === toAccountId) {
        return { ...a, currentBalance: a.currentBalance + amount };
      }
      return a;
    }));

    const refNumber = `TRF-2026-${Math.floor(100 + Math.random() * 900)}`;

    // Single Transfer Ledger Entry (Not Income, Not Expense!)
    const transferTx: FinancialTransaction = {
      id: `ft-${Date.now()}`,
      refNumber,
      timestamp,
      type: 'transfer',
      category: 'تحويل بين الخزائن والبنوك',
      description: `تحويل مالية من (${fromAcc.name}) إلى (${toAcc.name})`,
      amount,
      direction: 'out',
      branchId: fromAcc.branchId,
      branchName: fromAcc.branchName,
      accountId: fromAcc.id,
      accountName: fromAcc.name,
      toAccountId: toAcc.id,
      toAccountName: toAcc.name,
      createdByUserName: currentUser.fullName,
      notes
    };
    setFinancialTransactions(prev => [transferTx, ...prev]);

    addAuditLog({
      category: 'finance',
      action: 'تحويل مالي بين الحسابات والخزائن',
      actionEn: 'Financial Transfer Executed',
      target: refNumber,
      details: `من: ${fromAcc.name} | إلى: ${toAcc.name} | المبلغ: ${amount.toLocaleString('ar-EG')} ج.م`,
      status: 'success'
    });

    showToast(`✓ تم نقل ${amount.toLocaleString('ar-EG')} ج.م من (${fromAcc.name}) إلى (${toAcc.name})`, 'success');
  };

  const recordSupplierPaymentFromFinance = (
    supplierId: string,
    amount: number,
    method: 'cash' | 'bank_transfer' | 'check',
    accountId: string,
    notes?: string
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const targetSup = suppliers.find(s => s.id === supplierId);
    if (!targetSup) return;

    const targetAcc = financialAccounts.find(a => a.id === accountId) || financialAccounts[0];

    // Deduct supplier payable in Suppliers module
    recordSupplierPayment(supplierId, amount, method, `PAY-2026-${Math.floor(100 + Math.random() * 900)}`, notes);

    // Deduct account balance
    setFinancialAccounts(prev => prev.map(a => a.id === targetAcc.id ? { ...a, currentBalance: Math.max(0, a.currentBalance - amount) } : a));

    // Create central Financial Transaction
    const refNumber = `PAY-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newTx: FinancialTransaction = {
      id: `ft-${Date.now()}`,
      refNumber,
      timestamp,
      type: 'expense',
      category: 'سداد مديونيات موردين',
      description: `سداد مستحقات للمورد (${targetSup.name})`,
      amount,
      direction: 'out',
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      accountId: targetAcc.id,
      accountName: targetAcc.name,
      supplierId: targetSup.id,
      supplierName: targetSup.name,
      createdByUserName: currentUser.fullName,
      notes
    };
    setFinancialTransactions(prev => [newTx, ...prev]);
  };

  // ----------------------------------------------------
  // REWAQ ACCOUNTING MODULE ENGINE ACTIONS
  // ----------------------------------------------------

  const createManualJournalEntry = (entryData: {
    journalId: string;
    date: string;
    periodId: string;
    reference: string;
    description: string;
    lines: {
      accountId: string;
      accountCode: string;
      accountName: string;
      partnerId?: string;
      partnerType?: 'customer' | 'supplier';
      partnerName?: string;
      debit: number;
      credit: number;
      description: string;
      costCenterId?: string;
      costCenterName?: string;
    }[];
  }) => {
    const journal = journals.find(j => j.id === entryData.journalId) || journals[4];
    const result = AccountingService.createPostedEntry({
      journal,
      date: entryData.date,
      periodId: entryData.periodId,
      reference: entryData.reference,
      description: entryData.description,
      sourceType: 'manual',
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      lines: entryData.lines,
      userName: currentUser.fullName
    }, fiscalPeriods);

    if (result.error || !result.entry) {
      showToast(result.error || 'فشل في حفظ وترحيل القيد', 'error');
      return { success: false, error: result.error };
    }

    setJournalEntries(prev => [result.entry!, ...prev]);

    addAuditLog({
      category: 'finance',
      action: 'ترحيل قيد يومية يدوي',
      actionEn: 'Manual Journal Entry Posted',
      target: result.entry.entryNumber,
      details: `البيان: ${result.entry.description} | إجمالي القيد: ${result.entry.totalDebit.toLocaleString('ar-EG')} ج.م`,
      status: 'success'
    });

    showToast(`✓ تم ترحيل القيد المحاسبي (${result.entry.entryNumber}) بنجاح`, 'success');
    return { success: true, entry: result.entry };
  };

  const reverseJournalEntry = (entryId: string, reason: string): boolean => {
    const targetEntry = journalEntries.find(e => e.id === entryId);
    if (!targetEntry) return false;

    const currentPeriod = fiscalPeriods.find(p => !p.isClosed) || fiscalPeriods[1];
    const result = AccountingService.reverseEntry(targetEntry, reason, currentUser.fullName, currentPeriod.id, fiscalPeriods);

    if (result.error) {
      showToast(result.error, 'error');
      return false;
    }

    setJournalEntries(prev => [
      result.reversalEntry,
      ...prev.map(e => e.id === entryId ? result.reversedOriginal : e)
    ]);

    addAuditLog({
      category: 'finance',
      action: 'عكس قيد محاسبي مرحل',
      actionEn: 'Journal Entry Reversed',
      target: targetEntry.entryNumber,
      details: `تم إنشاء القيد العكسي: ${result.reversalEntry.entryNumber} | السبب: ${reason}`,
      status: 'warning'
    });

    showToast(`✓ تم إنشاء القيد العكسي (${result.reversalEntry.entryNumber}) وعكس القيد الأصلي`, 'success');
    return true;
  };

  // Helper to safely get account from Chart of Accounts
  const getSafeAccount = (codePrefix: string, fallbackType?: string): Account => {
    const found = chartOfAccounts.find(a => a.code === codePrefix) ||
      chartOfAccounts.find(a => a.code.startsWith(codePrefix)) ||
      (fallbackType ? chartOfAccounts.find(a => a.type === fallbackType) : undefined) ||
      chartOfAccounts[0];
    return found;
  };

  const recordCustomerAdvancePayment = (data: {
    customerId: string;
    amount: number;
    paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'card';
    accountId: string;
    orderId?: string;
    projectId?: string;
    notes?: string;
  }): CustomerAdvance => {
    const targetCust = customers.find(c => c.id === data.customerId);
    const custName = targetCust?.fullName || 'عميل تعاقد';
    const advanceNumber = `ADV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().substring(0, 10);
    const currentPeriod = fiscalPeriods.find(p => !p.isClosed) || fiscalPeriods[1];
    const cashOrBankJournal = data.paymentMethod === 'cash' 
      ? (journals.find(j => j.type === 'cash') || journals[2])
      : (journals.find(j => j.type === 'bank') || journals[3]);

    const targetAcc = chartOfAccounts.find(a => a.id === data.accountId) || 
      (data.paymentMethod === 'cash' ? getSafeAccount('11111', 'asset') : getSafeAccount('11121', 'asset'));
    const advanceAcc = getSafeAccount('212', 'liability');

    const postResult = AccountingService.createPostedEntry({
      journal: cashOrBankJournal || journals[2],
      date: today,
      periodId: currentPeriod.id,
      reference: `عربون تعاقد العميل ${custName}`,
      description: `استلام عربون/دفعة مقدمة لعقد الأثاث والمطبخ (${advanceNumber})`,
      sourceDocument: advanceNumber,
      sourceType: 'customer_advance',
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      lines: [
        {
          accountId: targetAcc.id,
          accountCode: targetAcc.code,
          accountName: targetAcc.nameAr,
          debit: data.amount,
          credit: 0,
          description: `تحصيل نقدي/بنكي لعربون العقد (${custName})`
        },
        {
          accountId: advanceAcc.id,
          accountCode: advanceAcc.code,
          accountName: advanceAcc.nameAr,
          partnerId: data.customerId,
          partnerType: 'customer',
          partnerName: custName,
          debit: 0,
          credit: data.amount,
          description: `دفعة مقدمة معلقة لحساب العقد حتى إصدار الفاتورة`
        }
      ],
      userName: currentUser.fullName
    }, fiscalPeriods);

    const advanceRecord: CustomerAdvance = {
      id: `adv-${Date.now()}`,
      advanceNumber,
      customerId: data.customerId,
      customerName: custName,
      orderId: data.orderId,
      projectId: data.projectId,
      amount: data.amount,
      appliedAmount: 0,
      remainingAmount: data.amount,
      paymentMethod: data.paymentMethod,
      accountId: targetAcc.id,
      date: today,
      journalEntryId: postResult.entry?.id || '',
      status: 'active',
      notes: data.notes,
      receivedByUserName: currentUser.fullName
    };

    setCustomerAdvances(prev => [advanceRecord, ...prev]);
    if (postResult.entry) {
      setJournalEntries(prev => [postResult.entry!, ...prev]);
    }

    addAuditLog({
      category: 'finance',
      action: 'إثبات دفعة مقدمة من عميل (عربون)',
      actionEn: 'Customer Advance Deposit Recorded',
      target: advanceNumber,
      details: `العميل: ${custName} | المبلغ: ${data.amount.toLocaleString('ar-EG')} ج.م (التزام حتى إصدار الفاتورة)`,
      status: 'success'
    });

    showToast(`✓ تم تسجيل الدفعة المقدمة (${advanceNumber}) بمبلغ ${data.amount.toLocaleString('ar-EG')} ج.م كالتزام دائن`, 'success');
    return advanceRecord;
  };

  const createSalesInvoice = (invoiceData: any): SalesInvoice => {
    const today = new Date().toISOString().substring(0, 10);
    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const targetCust = customers.find(c => c.id === invoiceData.customerId);
    const custName = targetCust?.fullName || invoiceData.customerName || 'عميل';

    const subtotal = Number(invoiceData.subtotal || 0);
    const taxAmount = Number(invoiceData.taxAmount !== undefined ? invoiceData.taxAmount : Math.round(subtotal * 0.14));
    const discountAmount = Number(invoiceData.discountAmount || 0);
    const totalAmount = subtotal + taxAmount - discountAmount;
    const advanceApplied = Number(invoiceData.advanceAppliedAmount || 0);
    const netReceivable = Math.max(0, totalAmount - advanceApplied);

    const salesJournal = journals.find(j => j.type === 'sales') || journals[0];
    const currentPeriod = fiscalPeriods.find(p => !p.isClosed) || fiscalPeriods[1];

    const arAcc = getSafeAccount('1121', 'asset');
    const revAcc = getSafeAccount('411', 'revenue');
    const vatAcc = getSafeAccount('2141', 'liability');
    const advAcc = getSafeAccount('212', 'liability');

    const lines: any[] = [];

    // If advance applied, debit advance account
    if (advanceApplied > 0) {
      lines.push({
        accountId: advAcc.id,
        accountCode: advAcc.code,
        accountName: advAcc.nameAr,
        partnerId: invoiceData.customerId,
        partnerType: 'customer',
        partnerName: custName,
        debit: advanceApplied,
        credit: 0,
        description: `تسوية العربون والدفعة المقدمة المسددة مسبقاً`
      });
    }

    // Debit AR for the remaining balance
    if (netReceivable > 0) {
      lines.push({
        accountId: arAcc.id,
        accountCode: arAcc.code,
        accountName: arAcc.nameAr,
        partnerId: invoiceData.customerId,
        partnerType: 'customer',
        partnerName: custName,
        debit: netReceivable,
        credit: 0,
        description: `استحقاق مديونية فاتورة مبيعات على العميل ${custName}`
      });
    }

    // Credit Revenue
    lines.push({
      accountId: revAcc.id,
      accountCode: revAcc.code,
      accountName: revAcc.nameAr,
      debit: 0,
      credit: subtotal - discountAmount,
      description: `إيراد مبيعات تصنيع وتوريد أثاث/مطبخ (${invoiceNumber})`
    });

    // Credit VAT Payable if any
    if (taxAmount > 0) {
      lines.push({
        accountId: vatAcc.id,
        accountCode: vatAcc.code,
        accountName: vatAcc.nameAr,
        debit: 0,
        credit: taxAmount,
        description: `ضريبة القيمة المضافة المستحقة (14%)`
      });
    }

    const postResult = AccountingService.createPostedEntry({
      journal: salesJournal,
      date: invoiceData.date || today,
      periodId: currentPeriod.id,
      reference: `فاتورة مبيعات ${invoiceNumber}`,
      description: `فاتورة مبيعات للعميل (${custName}) - ${invoiceData.notes || 'توريد وتركيبات'}`,
      sourceDocument: invoiceNumber,
      sourceType: 'sales_invoice',
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      lines,
      userName: currentUser.fullName
    }, fiscalPeriods);

    const newInvoice: SalesInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      customerId: invoiceData.customerId,
      customerName: custName,
      orderId: invoiceData.orderId,
      orderNumber: invoiceData.orderNumber,
      projectId: invoiceData.projectId,
      projectNumber: invoiceData.projectNumber,
      date: invoiceData.date || today,
      dueDate: invoiceData.dueDate || today,
      items: invoiceData.items || [
        { id: `it-1`, description: 'توريد وتركيب مطبخ / أثاث حسب المواصفات الفنية', itemType: 'custom_kitchen', quantity: 1, unitPrice: subtotal, discount: discountAmount, subtotal, taxRate: 14, taxAmount, total: totalAmount }
      ],
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      advanceAppliedAmount: advanceApplied,
      netReceivableAmount: netReceivable,
      paidAmount: advanceApplied,
      balanceDue: netReceivable,
      status: netReceivable === 0 ? 'paid' : (advanceApplied > 0 ? 'partially_paid' : 'posted'),
      journalEntryId: postResult.entry?.id,
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      notes: invoiceData.notes,
      createdDate: today
    };

    setSalesInvoices(prev => [newInvoice, ...prev]);
    if (postResult.entry) {
      setJournalEntries(prev => [postResult.entry!, ...prev]);
    }

    // Deduct advance remaining if applied
    if (advanceApplied > 0 && invoiceData.advanceId) {
      setCustomerAdvances(prev => prev.map(a => {
        if (a.id === invoiceData.advanceId) {
          const newApplied = a.appliedAmount + advanceApplied;
          const newRemaining = Math.max(0, a.amount - newApplied);
          return {
            ...a,
            appliedAmount: newApplied,
            remainingAmount: newRemaining,
            status: newRemaining === 0 ? 'fully_applied' : 'partially_applied'
          };
        }
        return a;
      }));
    }

    addAuditLog({
      category: 'finance',
      action: 'إصدار وترحيل فاتورة مبيعات',
      actionEn: 'Sales Invoice Posted',
      target: invoiceNumber,
      details: `العميل: ${custName} | الإجمالي: ${totalAmount.toLocaleString('ar-EG')} ج.م | المسوى من العربون: ${advanceApplied.toLocaleString('ar-EG')} ج.م`,
      status: 'success'
    });

    showToast(`✓ تم إصدار الفاتورة (${invoiceNumber}) وترحيل القيد المحاسبي بنجاح`, 'success');
    return newInvoice;
  };

  const applyCustomerAdvanceToInvoice = (invoiceId: string, advanceId: string, amountToApply: number): boolean => {
    const inv = salesInvoices.find(i => i.id === invoiceId);
    const adv = customerAdvances.find(a => a.id === advanceId);
    if (!inv || !adv || amountToApply <= 0) return false;

    if (amountToApply > adv.remainingAmount) {
      showToast(`المبلغ المطلوب تسويته أكبر من الرصيد المتبقي في العربون (${adv.remainingAmount.toLocaleString('ar-EG')} ج.م)`, 'warning');
      return false;
    }

    const currentPeriod = fiscalPeriods.find(p => !p.isClosed) || fiscalPeriods[1];
    const genJournal = journals.find(j => j.type === 'general') || journals[4];
    const advAcc = getSafeAccount('212', 'liability');
    const arAcc = getSafeAccount('1121', 'asset');

    const postResult = AccountingService.createPostedEntry({
      journal: genJournal,
      date: new Date().toISOString().substring(0, 10),
      periodId: currentPeriod.id,
      reference: `تسوية عربون ${adv.advanceNumber} مع فاتورة ${inv.invoiceNumber}`,
      description: `تسوية دفعة مقدمة بمبلغ ${amountToApply.toLocaleString('ar-EG')} ج.م للعميل ${inv.customerName}`,
      sourceDocument: inv.invoiceNumber,
      sourceType: 'customer_advance',
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      lines: [
        {
          accountId: advAcc.id,
          accountCode: advAcc.code,
          accountName: advAcc.nameAr,
          partnerId: inv.customerId,
          partnerType: 'customer',
          partnerName: inv.customerName,
          debit: amountToApply,
          credit: 0,
          description: `تسوية رصيد الدفعة المقدمة`
        },
        {
          accountId: arAcc.id,
          accountCode: arAcc.code,
          accountName: arAcc.nameAr,
          partnerId: inv.customerId,
          partnerType: 'customer',
          partnerName: inv.customerName,
          debit: 0,
          credit: amountToApply,
          description: `تخفيض مديونية العميل بعد تطبيق العربون`
        }
      ],
      userName: currentUser.fullName
    }, fiscalPeriods);

    if (postResult.entry) {
      setJournalEntries(prev => [postResult.entry!, ...prev]);
    }

    setSalesInvoices(prev => prev.map(i => {
      if (i.id === invoiceId) {
        const newPaid = i.paidAmount + amountToApply;
        const newBalance = Math.max(0, i.totalAmount - newPaid);
        return {
          ...i,
          advanceAppliedAmount: i.advanceAppliedAmount + amountToApply,
          paidAmount: newPaid,
          balanceDue: newBalance,
          status: newBalance === 0 ? 'paid' : 'partially_paid'
        };
      }
      return i;
    }));

    setCustomerAdvances(prev => prev.map(a => {
      if (a.id === advanceId) {
        const newApplied = a.appliedAmount + amountToApply;
        const newRemaining = Math.max(0, a.amount - newApplied);
        return {
          ...a,
          appliedAmount: newApplied,
          remainingAmount: newRemaining,
          status: newRemaining === 0 ? 'fully_applied' : 'partially_applied'
        };
      }
      return a;
    }));

    showToast(`✓ تم تطبيق ${amountToApply.toLocaleString('ar-EG')} ج.م من العربون على الفاتورة (${inv.invoiceNumber})`, 'success');
    return true;
  };

  const createVendorBill = (billData: any): VendorBill => {
    const today = new Date().toISOString().substring(0, 10);
    const billNumber = `BILL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const targetSup = suppliers.find(s => s.id === billData.supplierId);
    const supName = targetSup?.name || billData.supplierName || 'مورد';

    const subtotal = Number(billData.subtotal || 0);
    const taxAmount = Number(billData.taxAmount !== undefined ? billData.taxAmount : Math.round(subtotal * 0.14));
    const withholdingTaxRate = Number(billData.withholdingTaxRate || 1);
    const withholdingTaxAmount = Number(billData.withholdingTaxAmount !== undefined ? billData.withholdingTaxAmount : Math.round(subtotal * (withholdingTaxRate / 100)));
    const totalAmount = subtotal + taxAmount;
    const netPayable = Math.max(0, totalAmount - withholdingTaxAmount);

    const purJournal = journals.find(j => j.type === 'purchase') || journals[1];
    const currentPeriod = fiscalPeriods.find(p => !p.isClosed) || fiscalPeriods[1];

    const grIrAcc = getSafeAccount('213', 'liability');
    const apAcc = getSafeAccount('2111', 'liability');
    const inputVatAcc = getSafeAccount('1141', 'asset');

    const debitAccId = billData.billType === 'direct_expense' && billData.expenseAccountId
      ? (chartOfAccounts.find(a => a.id === billData.expenseAccountId) || grIrAcc)
      : grIrAcc;

    const lines: any[] = [
      {
        accountId: debitAccId.id,
        accountCode: debitAccId.code,
        accountName: debitAccId.nameAr,
        debit: subtotal,
        credit: 0,
        description: billData.billType === 'stock_purchase'
          ? `إقفال حساب وسيط الاستلام المخزني GR/IR مقابل فاتورة المورد`
          : `إثبات مشتريات / مصروف مباشر من المورد ${supName}`
      },
      {
        accountId: inputVatAcc.id,
        accountCode: inputVatAcc.code,
        accountName: inputVatAcc.nameAr,
        debit: taxAmount,
        credit: 0,
        description: `ضريبة مدخلات قابلة للخصم (14% VAT)`
      },
      {
        accountId: apAcc.id,
        accountCode: apAcc.code,
        accountName: apAcc.nameAr,
        partnerId: billData.supplierId,
        partnerType: 'supplier',
        partnerName: supName,
        debit: 0,
        credit: totalAmount,
        description: `استحقاق مالي للمورد ${supName}`
      }
    ];

    const postResult = AccountingService.createPostedEntry({
      journal: purJournal,
      date: billData.date || today,
      periodId: currentPeriod.id,
      reference: `فاتورة مورد ${billNumber}`,
      description: `فاتورة توريد خامات/مشتريات من المورد (${supName}) - ${billData.vendorInvoiceNumber || ''}`,
      sourceDocument: billNumber,
      sourceType: 'vendor_bill',
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      lines,
      userName: currentUser.fullName
    }, fiscalPeriods);

    const newBill: VendorBill = {
      id: `bill-${Date.now()}`,
      billNumber,
      vendorInvoiceNumber: billData.vendorInvoiceNumber,
      supplierId: billData.supplierId,
      supplierName: supName,
      purchaseOrderId: billData.purchaseOrderId,
      poNumber: billData.poNumber,
      billType: billData.billType || 'stock_purchase',
      date: billData.date || today,
      dueDate: billData.dueDate || today,
      items: billData.items || [
        { id: `bi-1`, description: 'توريد خامات ومستلزمات إنتاج', itemType: 'stock_material', quantity: 1, unitPrice: subtotal, subtotal, taxRate: 14, taxAmount, total: totalAmount }
      ],
      subtotal,
      taxAmount,
      withholdingTaxRate,
      withholdingTaxAmount,
      totalAmount,
      netPayableAmount: netPayable,
      paidAmount: 0,
      balanceDue: totalAmount,
      status: 'posted',
      journalEntryId: postResult.entry?.id,
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      notes: billData.notes,
      createdDate: today
    };

    setVendorBills(prev => [newBill, ...prev]);
    if (postResult.entry) {
      setJournalEntries(prev => [postResult.entry!, ...prev]);
    }

    addAuditLog({
      category: 'finance',
      action: 'إثبات وترحيل فاتورة مورد',
      actionEn: 'Vendor Bill Posted',
      target: billNumber,
      details: `المورد: ${supName} | الإجمالي: ${totalAmount.toLocaleString('ar-EG')} ج.م | ضريبة الخصم 1%: ${withholdingTaxAmount.toLocaleString('ar-EG')} ج.م`,
      status: 'success'
    });

    showToast(`✓ تم تسجيل فاتورة المورد (${billNumber}) ومطابقتها محاسبياً بنجاح`, 'success');
    return newBill;
  };

  const recordVendorBillPayment = (
    billId: string,
    amount: number,
    paymentMethod: string,
    accountId: string,
    withholdingTaxRate = 1,
    notes?: string
  ): boolean => {
    const bill = vendorBills.find(b => b.id === billId);
    if (!bill || amount <= 0) return false;

    const currentPeriod = fiscalPeriods.find(p => !p.isClosed) || fiscalPeriods[1];
    const journal = paymentMethod === 'cash' 
      ? (journals.find(j => j.type === 'cash') || journals[2])
      : (journals.find(j => j.type === 'bank') || journals[3]);
    const apAcc = getSafeAccount('2111', 'liability');
    const targetAcc = chartOfAccounts.find(a => a.id === accountId) || 
      (paymentMethod === 'cash' ? getSafeAccount('11111', 'asset') : getSafeAccount('11121', 'asset'));
    const whtAcc = getSafeAccount('2142', 'liability');

    const whtAmount = Math.round(amount * (withholdingTaxRate / 100));
    const netCashOut = amount - whtAmount;

    const lines: any[] = [
      {
        accountId: apAcc.id,
        accountCode: apAcc.code,
        accountName: apAcc.nameAr,
        partnerId: bill.supplierId,
        partnerType: 'supplier',
        partnerName: bill.supplierName,
        debit: amount,
        credit: 0,
        description: `سداد مستحقات فاتورة المورد ${bill.billNumber}`
      },
      {
        accountId: targetAcc.id,
        accountCode: targetAcc.code,
        accountName: targetAcc.nameAr,
        debit: 0,
        credit: netCashOut,
        description: `صرف نقدي/بنكي مسدد للمورد (${bill.supplierName})`
      }
    ];

    if (whtAmount > 0) {
      lines.push({
        accountId: whtAcc.id,
        accountCode: whtAcc.code,
        accountName: whtAcc.nameAr,
        debit: 0,
        credit: whtAmount,
        description: `خصم ضريبة أرباح تجارية 1% لحساب مصلحة الضرائب`
      });
    }

    const postResult = AccountingService.createPostedEntry({
      journal: journal || journals[3],
      date: new Date().toISOString().substring(0, 10),
      periodId: currentPeriod.id,
      reference: `سداد فاتورة مورد ${bill.billNumber}`,
      description: `سداد مبلغ ${amount.toLocaleString('ar-EG')} ج.م للمورد (${bill.supplierName}) مع خصم ضريبي ${whtAmount} ج.م`,
      sourceDocument: bill.billNumber,
      sourceType: 'vendor_payment',
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      lines,
      userName: currentUser.fullName
    }, fiscalPeriods);

    if (postResult.entry) {
      setJournalEntries(prev => [postResult.entry!, ...prev]);
    }

    setVendorBills(prev => prev.map(b => {
      if (b.id === billId) {
        const newPaid = b.paidAmount + amount;
        const newBal = Math.max(0, b.totalAmount - newPaid);
        return {
          ...b,
          paidAmount: newPaid,
          balanceDue: newBal,
          status: newBal === 0 ? 'paid' : 'partially_paid'
        };
      }
      return b;
    }));

    showToast(`✓ تم سداد ${amount.toLocaleString('ar-EG')} ج.م لفاتورة المورد (${bill.billNumber}) وتوريد ضريبة الخصم`, 'success');
    return true;
  };

  const updatePdcStatus = (checkId: string, newStatus: PDCRecord['status'], clearanceAccountId?: string) => {
    const targetCheck = pdcRecords.find(c => c.id === checkId);
    if (!targetCheck) return;

    if (newStatus === 'cleared') {
      const currentPeriod = fiscalPeriods.find(p => !p.isClosed) || fiscalPeriods[1];
      const bankJournal = journals.find(j => j.type === 'bank') || journals[3];
      const bankAcc = chartOfAccounts.find(a => a.id === clearanceAccountId) || getSafeAccount('11121', 'asset');
      const pdcReceivableAcc = getSafeAccount('1113', 'asset');
      const notesPayableAcc = getSafeAccount('2112', 'liability');

      const lines = targetCheck.type === 'receivable'
        ? [
            {
              accountId: bankAcc.id,
              accountCode: bankAcc.code,
              accountName: bankAcc.nameAr,
              debit: targetCheck.amount,
              credit: 0,
              description: `تحصيل وإيداع الشيك البنكي رقم ${targetCheck.checkNumber}`
            },
            {
              accountId: pdcReceivableAcc.id,
              accountCode: pdcReceivableAcc.code,
              accountName: pdcReceivableAcc.nameAr,
              partnerId: targetCheck.partnerId,
              partnerType: 'customer' as const,
              partnerName: targetCheck.partnerName,
              debit: 0,
              credit: targetCheck.amount,
              description: `إقفال شيك تحت التحصيل بعد وروده في كشف حساب البنك`
            }
          ]
        : [
            {
              accountId: notesPayableAcc.id,
              accountCode: notesPayableAcc.code,
              accountName: notesPayableAcc.nameAr,
              partnerId: targetCheck.partnerId,
              partnerType: 'supplier' as const,
              partnerName: targetCheck.partnerName,
              debit: targetCheck.amount,
              credit: 0,
              description: `خصم الشيك الصادر للمورد ${targetCheck.partnerName} بعد الصرف`
            },
            {
              accountId: bankAcc.id,
              accountCode: bankAcc.code,
              accountName: bankAcc.nameAr,
              debit: 0,
              credit: targetCheck.amount,
              description: `خصم من رصيد البنك لسداد الشيك رقم ${targetCheck.checkNumber}`
            }
          ];

      const postResult = AccountingService.createPostedEntry({
        journal: bankJournal,
        date: new Date().toISOString().substring(0, 10),
        periodId: currentPeriod.id,
        reference: `مقاصة شيك ${targetCheck.checkNumber}`,
        description: `مقاصة وتحصيل الشيك رقم (${targetCheck.checkNumber}) للطرف (${targetCheck.partnerName})`,
        sourceDocument: targetCheck.checkNumber,
        sourceType: 'check_clearing',
        branchId: currentBranch.id,
        branchName: currentBranch.name,
        lines,
        userName: currentUser.fullName
      }, fiscalPeriods);

      if (postResult.entry) {
        setJournalEntries(prev => [postResult.entry!, ...prev]);
      }
    }

    setPdcRecords(prev => prev.map(c => c.id === checkId ? { ...c, status: newStatus } : c));
    showToast(`✓ تم تحديث حالة الشيك (${targetCheck.checkNumber}) إلى: ${newStatus}`, 'success');
  };

  const toggleFiscalPeriodLock = (periodId: string, reopenReason?: string) => {
    let targetName = '';
    let isReopening = false;

    setFiscalPeriods(prev => prev.map(p => {
      if (p.id === periodId) {
        const nextState = !p.isClosed;
        targetName = p.name;
        isReopening = !nextState; // if nextState is false, we are reopening
        return {
          ...p,
          isClosed: nextState,
          closedAt: nextState ? new Date().toISOString().replace('T', ' ').substring(0, 19) : undefined,
          closedByUserName: nextState ? currentUser.fullName : undefined
        };
      }
      return p;
    }));

    if (isReopening) {
      addAuditLog({
        category: 'finance',
        action: 'إعادة فتح فترة محاسبية',
        actionEn: 'reopen_fiscal_period',
        target: targetName,
        status: 'warning',
        details: `⚠️ قرار مدير مالي رقابي: إعادة فتح الفترة المحاسبية (${targetName}) بأثر رجعي. مبرر الإجراء: ${reopenReason || 'إعادة فتح استثنائية معتمدة من الإدارة المالية'}`
      });
      showToast(`⚠️ تم إعادة فتح الفترة (${targetName}) وتوثيق المسؤولية في سجل الرقابة المالي`, 'warning');
    } else {
      addAuditLog({
        category: 'finance',
        action: 'إقفال فترة محاسبية',
        actionEn: 'close_fiscal_period',
        target: targetName,
        status: 'success',
        details: `🔒 تم إقفال واعتماد الفترة المحاسبية (${targetName}) بواسطة ${currentUser.fullName}`
      });
      showToast(`✓ تم إقفال الفترة (${targetName}) بنجاح ومنع الترحيل الرجعي`, 'success');
    }
  };

  const addAccountToCoA = (accountData: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...accountData,
      id: `acc-${Date.now()}`
    };
    setChartOfAccounts(prev => [...prev, newAccount]);
    showToast(`✓ تم إضافة الحساب (${newAccount.code} - ${newAccount.nameAr}) إلى دليل الحسابات`, 'success');
  };

  // ----------------------------------------------------
  // MANUFACTURING & INVENTORY FINANCIAL INTEGRATION HOOKS
  // ----------------------------------------------------

  const recordInventoryWipMovement = (productionOrderId: string, totalMaterialCost: number, notes?: string) => {
    const currentPeriod = fiscalPeriods.find(p => !p.isClosed) || fiscalPeriods[1];
    const genJournal = journals.find(j => j.type === 'general') || journals[4];
    const wipAcc = getSafeAccount('1133', 'asset');
    const rawAcc = getSafeAccount('1131', 'asset');

    const postResult = AccountingService.createPostedEntry({
      journal: genJournal,
      date: new Date().toISOString().substring(0, 10),
      periodId: currentPeriod.id,
      reference: `صرف خامات لأمر الشغل ${productionOrderId}`,
      description: `صرف ألواح وخامات للورشة لأمر الشغل (${productionOrderId}) - ${notes || 'صرف وتصنيع'}`,
      sourceDocument: productionOrderId,
      sourceType: 'material_issue_wip',
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      lines: [
        {
          accountId: wipAcc.id,
          accountCode: wipAcc.code,
          accountName: wipAcc.nameAr,
          costCenterId: 'cc-1',
          costCenterName: 'قسم تقطيع الـ CNC وشريط الشاط',
          debit: totalMaterialCost,
          credit: 0,
          description: `تحميل تكلفة خامات منصرفة على الإنتاج تحت التشغيل WIP`
        },
        {
          accountId: rawAcc.id,
          accountCode: rawAcc.code,
          accountName: rawAcc.nameAr,
          debit: 0,
          credit: totalMaterialCost,
          description: `خصم من رصيد مخزون الخامات بالمستودع`
        }
      ],
      userName: currentUser.fullName
    }, fiscalPeriods);

    if (postResult.entry) {
      setJournalEntries(prev => [postResult.entry!, ...prev]);
    }
  };

  const recordProductionCompletionToFinishedGoods = (productionOrderId: string, finalTotalCost: number, notes?: string) => {
    const currentPeriod = fiscalPeriods.find(p => !p.isClosed) || fiscalPeriods[1];
    const genJournal = journals.find(j => j.type === 'general') || journals[4];
    const finAcc = getSafeAccount('1134', 'asset');
    const wipAcc = getSafeAccount('1133', 'asset');

    const postResult = AccountingService.createPostedEntry({
      journal: genJournal,
      date: new Date().toISOString().substring(0, 10),
      periodId: currentPeriod.id,
      reference: `إتمام تصنيع ${productionOrderId}`,
      description: `استلام منتج تام الصنع (مطبخ / أثاث جاهز) من الورشة (${productionOrderId}) - ${notes || ''}`,
      sourceDocument: productionOrderId,
      sourceType: 'production_completion',
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      lines: [
        {
          accountId: finAcc.id,
          accountCode: finAcc.code,
          accountName: finAcc.nameAr,
          debit: finalTotalCost,
          credit: 0,
          description: `إضافة منتج تام جاهز للتسليم إلى مخزون الإنتاج التام`
        },
        {
          accountId: wipAcc.id,
          accountCode: wipAcc.code,
          accountName: wipAcc.nameAr,
          debit: 0,
          credit: finalTotalCost,
          description: `إقفال حساب الإنتاج تحت التشغيل WIP بعد انتهاء التصنيع`
        }
      ],
      userName: currentUser.fullName
    }, fiscalPeriods);

    if (postResult.entry) {
      setJournalEntries(prev => [postResult.entry!, ...prev]);
    }
  };

  const recordDeliveryCogsAccounting = (orderId: string, cogsAmount: number, notes?: string) => {
    const currentPeriod = fiscalPeriods.find(p => !p.isClosed) || fiscalPeriods[1];
    const genJournal = journals.find(j => j.type === 'general') || journals[4];
    const cogsAcc = getSafeAccount('514', 'cogs');
    const finAcc = getSafeAccount('1134', 'asset');

    const postResult = AccountingService.createPostedEntry({
      journal: genJournal,
      date: new Date().toISOString().substring(0, 10),
      periodId: currentPeriod.id,
      reference: `تسليم طلب العميل ${orderId}`,
      description: `إثبات تكلفة البضاعة المباعة COGS عند تسليم المنتج النهائي للعميل (${orderId}) - ${notes || ''}`,
      sourceDocument: orderId,
      sourceType: 'delivery_cogs',
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      lines: [
        {
          accountId: cogsAcc.id,
          accountCode: cogsAcc.code,
          accountName: cogsAcc.nameAr,
          debit: cogsAmount,
          credit: 0,
          description: `تحميل تكلفة البضاعة المباعة (COGS) في قائمة الدخل`
        },
        {
          accountId: finAcc.id,
          accountCode: finAcc.code,
          accountName: finAcc.nameAr,
          debit: 0,
          credit: cogsAmount,
          description: `خصم البضاعة المسلمة من رصيد مخزون الإنتاج التام`
        }
      ],
      userName: currentUser.fullName
    }, fiscalPeriods);

    if (postResult.entry) {
      setJournalEntries(prev => [postResult.entry!, ...prev]);
    }
  };

  const recordScrapWasteAccounting = (reason: string, scrapAmount: number, notes?: string) => {
    const currentPeriod = fiscalPeriods.find(p => !p.isClosed) || fiscalPeriods[1];
    const genJournal = journals.find(j => j.type === 'general') || journals[4];
    const scrapAcc = getSafeAccount('1135', 'expense');
    const rawAcc = getSafeAccount('1131', 'asset');

    const postResult = AccountingService.createPostedEntry({
      journal: genJournal,
      date: new Date().toISOString().substring(0, 10),
      periodId: currentPeriod.id,
      reference: `تسوية هالك وخامات تالفة`,
      description: `إثبات هالك أخشاب/خامات بالورشة: ${reason} - ${notes || ''}`,
      sourceDocument: 'SCRAP-ADJ',
      sourceType: 'stock_scrap',
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      lines: [
        {
          accountId: scrapAcc.id,
          accountCode: scrapAcc.code,
          accountName: scrapAcc.nameAr,
          debit: scrapAmount,
          credit: 0,
          description: `إثبات خسارة هالك وتوالف خامات في الحسابات`
        },
        {
          accountId: rawAcc.id,
          accountCode: rawAcc.code,
          accountName: rawAcc.nameAr,
          debit: 0,
          credit: scrapAmount,
          description: `تسوية وتخفيض رصيد مخزون الخامات الفعلي`
        }
      ],
      userName: currentUser.fullName
    }, fiscalPeriods);

    if (postResult.entry) {
      setJournalEntries(prev => [postResult.entry!, ...prev]);
    }
  };

  // ====================================================
  // ENTERPRISE WAREHOUSE & INVENTORY ACTION HANDLERS
  // ====================================================

  const createGoodsReceiptNote = (data: {
    type: GRNType;
    supplierId?: string;
    purchaseOrderId?: string;
    productionOrderId?: string;
    warehouseId: string;
    items: {
      itemId: string;
      itemCode: string;
      itemName: string;
      unit: string;
      orderedQty: number;
      receivedQty: number;
      unitCost: number;
      locationBin?: string;
      notes?: string;
    }[];
    notes?: string;
  }): GoodsReceiptNote => {
    const today = new Date().toISOString().substring(0, 10);
    const grnNumber = `GRN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const targetWh = warehouses.find(w => w.id === data.warehouseId) || warehouses[0];
    const targetSup = suppliers.find(s => s.id === data.supplierId);
    const supName = targetSup?.name || (data.type === 'purchase_receipt' ? 'مورد خامات' : undefined);

    const lineItems: GRNLineItem[] = data.items.map((it, idx) => ({
      id: `grn-line-${Date.now()}-${idx}`,
      itemId: it.itemId,
      itemCode: it.itemCode,
      itemName: it.itemName,
      unit: it.unit,
      orderedQty: it.orderedQty,
      receivedQty: it.receivedQty,
      unitCost: it.unitCost,
      totalCost: it.receivedQty * it.unitCost,
      locationBin: it.locationBin || 'ممر 1 - رف A',
      notes: it.notes
    }));

    const totalAmount = lineItems.reduce((s, it) => s + it.totalCost, 0);

    // 1. Accounting Impact: Debit Inventory / Credit GR-IR Clearing or WIP
    const currentPeriod = fiscalPeriods.find(p => !p.isClosed) || fiscalPeriods[1];
    const genJournal = journals.find(j => j.type === 'general') || journals[4];
    const rawInvAcc = getSafeAccount('1131', 'asset');
    const fgInvAcc = getSafeAccount('1134', 'asset');
    const grIrAcc = getSafeAccount('213', 'liability');
    const wipAcc = getSafeAccount('1133', 'asset');
    const otherIncomeAcc = getSafeAccount('42', 'revenue');

    const debitAcc = data.type === 'production_receipt' ? fgInvAcc : rawInvAcc;
    const creditAcc = data.type === 'purchase_receipt' 
      ? grIrAcc 
      : (data.type === 'production_receipt' || data.type === 'order_return' ? wipAcc : otherIncomeAcc);

    const postResult = AccountingService.createPostedEntry({
      journal: genJournal,
      date: today,
      periodId: currentPeriod.id,
      reference: `إذن إضافة مخزني ${grnNumber}`,
      description: `إثبات استلام وتوريد بضاعة بالمستودع (${targetWh.name}): ${data.notes || ''}`,
      sourceDocument: grnNumber,
      sourceType: 'stock_receipt',
      branchId: targetWh.branchId,
      branchName: targetWh.branchName,
      lines: [
        {
          accountId: debitAcc.id,
          accountCode: debitAcc.code,
          accountName: debitAcc.nameAr,
          debit: totalAmount,
          credit: 0,
          description: `إضافة خامات/منتجات لرصيد المخزن الفعلي (${targetWh.name})`
        },
        {
          accountId: creditAcc.id,
          accountCode: creditAcc.code,
          accountName: creditAcc.nameAr,
          debit: 0,
          credit: totalAmount,
          description: `إثبات وسيط استلام خامات غير مفوترة أو إنتاج تام من الورشة`
        }
      ],
      userName: currentUser.fullName
    }, fiscalPeriods);

    const newGRN: GoodsReceiptNote = {
      id: `grn-${Date.now()}`,
      grnNumber,
      type: data.type,
      supplierId: data.supplierId,
      supplierName: supName,
      purchaseOrderId: data.purchaseOrderId,
      productionOrderId: data.productionOrderId,
      warehouseId: targetWh.id,
      warehouseName: targetWh.name,
      date: today,
      items: lineItems,
      totalAmount,
      status: 'posted',
      journalEntryId: postResult.entry?.id,
      createdByUserName: currentUser.fullName,
      approvedByUserName: 'أحمد محمود (المالية)',
      notes: data.notes
    };

    setGoodsReceiptNotes(prev => [newGRN, ...prev]);
    if (postResult.entry) {
      setJournalEntries(prev => [postResult.entry!, ...prev]);
    }

    // 2. Update stock in itemMasterCards
    setItemMasterCards(prev => prev.map(item => {
      const receiptLine = lineItems.find(l => l.itemId === item.id || l.itemCode === item.code);
      if (receiptLine) {
        const oldStock = item.currentStock;
        const addQty = receiptLine.receivedQty;
        const newStock = oldStock + addQty;
        const newAvgCost = oldStock + addQty > 0
          ? Math.round(((oldStock * item.weightedAvgCost) + (addQty * receiptLine.unitCost)) / newStock)
          : receiptLine.unitCost;
        
        return {
          ...item,
          currentStock: newStock,
          availableStock: item.availableStock + addQty,
          weightedAvgCost: newAvgCost,
          lastPurchasePrice: receiptLine.unitCost,
          status: newStock <= 0 ? 'out_of_stock' : (newStock < item.minStockLevel ? 'low_stock' : 'active')
        };
      }
      return item;
    }));

    // 3. Add to Stock Ledger History
    const ledgerEntries: StockLedgerEntry[] = lineItems.map((line, idx) => {
      const targetItem = itemMasterCards.find(i => i.id === line.itemId || i.code === line.itemCode);
      const newBal = (targetItem?.currentStock || 0) + line.receivedQty;
      return {
        id: `sle-${Date.now()}-${idx}`,
        itemId: line.itemId,
        itemCode: line.itemCode,
        itemName: line.itemName,
        date: today,
        documentType: 'GRN',
        documentNumber: grnNumber,
        warehouseId: targetWh.id,
        warehouseName: targetWh.name,
        qtyIn: line.receivedQty,
        qtyOut: 0,
        balanceAfter: newBal,
        unitCost: line.unitCost,
        totalCost: line.totalCost,
        userName: currentUser.fullName,
        notes: `إذن إضافة ${grnNumber} - ${data.notes || ''}`
      };
    });

    setStockLedgerEntries(prev => [...ledgerEntries, ...prev]);

    addAuditLog({
      category: 'inventory',
      action: 'إثبات وترحيل إذن إضافة مخزني (GRN)',
      actionEn: 'Goods Receipt Note Posted',
      target: grnNumber,
      details: `المستودع: ${targetWh.name} | القيمة: ${totalAmount.toLocaleString('ar-EG')} ج.م | عدد الأصناف: ${lineItems.length}`,
      status: 'success'
    });

    showToast(`✓ تم إنشاء وترحيل إذن الإضافة المخزني (${grnNumber}) بنجاح`, 'success');
    return newGRN;
  };

  const createGoodsIssueNote = (data: {
    type: GINType;
    productionOrderId?: string;
    productionOrderNumber?: string;
    costCenterId?: string;
    costCenterName?: string;
    machineName?: string;
    warehouseId: string;
    items: {
      itemId: string;
      itemCode: string;
      itemName: string;
      unit: string;
      requestedQty: number;
      issuedQty: number;
      unitCost: number;
      locationBin?: string;
      notes?: string;
    }[];
    notes?: string;
  }): GoodsIssueNote => {
    const today = new Date().toISOString().substring(0, 10);
    const ginNumber = `GIN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const targetWh = warehouses.find(w => w.id === data.warehouseId) || warehouses[0];

    // 0. Strict Negative Stock Prevention Check
    for (const item of data.items) {
      const card = itemMasterCards.find(c => c.id === item.itemId || c.code === item.itemCode);
      const available = card ? card.availableStock : 0;
      if (item.issuedQty > available) {
        const errorMsg = `عفواً: الكمية المتاحة للصنف [${card?.nameAr || item.itemName}] في المستودع هي (${available} ${card?.unitNameAr || item.unit}) فقط، ولا يمكن صرف (${item.issuedQty}).`;
        showToast(errorMsg, 'error');
        throw new Error(errorMsg);
      }
    }

    const lineItems: GINLineItem[] = data.items.map((it, idx) => ({
      id: `gin-line-${Date.now()}-${idx}`,
      itemId: it.itemId,
      itemCode: it.itemCode,
      itemName: it.itemName,
      unit: it.unit,
      requestedQty: it.requestedQty,
      issuedQty: it.issuedQty,
      unitCost: it.unitCost,
      totalCost: it.issuedQty * it.unitCost,
      locationBin: it.locationBin || 'ممر 1',
      notes: it.notes
    }));

    const totalAmount = lineItems.reduce((s, it) => s + it.totalCost, 0);

    // 1. Accounting Impact: Credit Raw Materials / Debit WIP, Maintenance, or Scrap
    const currentPeriod = fiscalPeriods.find(p => !p.isClosed) || fiscalPeriods[1];
    const genJournal = journals.find(j => j.type === 'general') || journals[4];
    const rawInvAcc = getSafeAccount('1131', 'asset');
    const wipAcc = getSafeAccount('1133', 'asset');
    const maintAcc = getSafeAccount('534', 'expense');
    const scrapAcc = getSafeAccount('1135', 'expense');
    const genExpAcc = getSafeAccount('536', 'expense');

    let debitAcc = wipAcc;
    let desc = `صرف خامات لأمر تصنيع (${data.productionOrderNumber || 'إنتاج'})`;

    if (data.type === 'maintenance_workshop') {
      debitAcc = maintAcc;
      desc = `صرف مهمات وقطع غيار لصيانة ماكينات الورشة (${data.machineName || 'ماكينات CNC'})`;
    } else if (data.type === 'scrap_waste') {
      debitAcc = scrapAcc;
      desc = `إثبات وصرف هالك وتوالف خامات أثناء التصنيع`;
    } else if (data.type === 'general_issue' || data.type === 'showroom_sample') {
      debitAcc = genExpAcc;
      desc = `صرف عينات ومهمات تشغيل عامة`;
    }

    const postResult = AccountingService.createPostedEntry({
      journal: genJournal,
      date: today,
      periodId: currentPeriod.id,
      reference: `إذن صرف مخزني ${ginNumber}`,
      description: desc,
      sourceDocument: ginNumber,
      sourceType: 'material_issue_wip',
      branchId: targetWh.branchId,
      branchName: targetWh.branchName,
      lines: [
        {
          accountId: debitAcc.id,
          accountCode: debitAcc.code,
          accountName: debitAcc.nameAr,
          costCenterId: data.costCenterId,
          costCenterName: data.costCenterName,
          debit: totalAmount,
          credit: 0,
          description: desc
        },
        {
          accountId: rawInvAcc.id,
          accountCode: rawInvAcc.code,
          accountName: rawInvAcc.nameAr,
          debit: 0,
          credit: totalAmount,
          description: `خصم خامات منصرفة من رصيد المستودع (${targetWh.name})`
        }
      ],
      userName: currentUser.fullName
    }, fiscalPeriods);

    const newGIN: GoodsIssueNote = {
      id: `gin-${Date.now()}`,
      ginNumber,
      type: data.type,
      productionOrderId: data.productionOrderId,
      productionOrderNumber: data.productionOrderNumber,
      costCenterId: data.costCenterId,
      costCenterName: data.costCenterName,
      machineName: data.machineName,
      warehouseId: targetWh.id,
      warehouseName: targetWh.name,
      date: today,
      items: lineItems,
      totalAmount,
      status: 'posted',
      journalEntryId: postResult.entry?.id,
      requestedByUserName: currentUser.fullName,
      issuedByUserName: targetWh.managerName || currentUser.fullName,
      notes: data.notes
    };

    setGoodsIssueNotes(prev => [newGIN, ...prev]);
    if (postResult.entry) {
      setJournalEntries(prev => [postResult.entry!, ...prev]);
    }

    // 2. Decrease Stock in itemMasterCards
    setItemMasterCards(prev => prev.map(item => {
      const issueLine = lineItems.find(l => l.itemId === item.id || l.itemCode === item.code);
      if (issueLine) {
        const newStock = Math.max(0, item.currentStock - issueLine.issuedQty);
        const newAvail = Math.max(0, item.availableStock - issueLine.issuedQty);
        return {
          ...item,
          currentStock: newStock,
          availableStock: newAvail,
          status: newStock <= 0 ? 'out_of_stock' : (newStock < item.minStockLevel ? 'low_stock' : 'active')
        };
      }
      return item;
    }));

    // 3. Add to Stock Ledger History
    const ledgerEntries: StockLedgerEntry[] = lineItems.map((line, idx) => {
      const targetItem = itemMasterCards.find(i => i.id === line.itemId || i.code === line.itemCode);
      const newBal = Math.max(0, (targetItem?.currentStock || 0) - line.issuedQty);
      return {
        id: `sle-${Date.now()}-${idx}`,
        itemId: line.itemId,
        itemCode: line.itemCode,
        itemName: line.itemName,
        date: today,
        documentType: 'GIN',
        documentNumber: ginNumber,
        warehouseId: targetWh.id,
        warehouseName: targetWh.name,
        qtyIn: 0,
        qtyOut: line.issuedQty,
        balanceAfter: newBal,
        unitCost: line.unitCost,
        totalCost: line.totalCost,
        userName: currentUser.fullName,
        notes: `إذن صرف ${ginNumber} - ${desc}`
      };
    });

    setStockLedgerEntries(prev => [...ledgerEntries, ...prev]);

    addAuditLog({
      category: 'inventory',
      action: 'إثبات وترحيل إذن صرف مخزني (GIN)',
      actionEn: 'Goods Issue Note Posted',
      target: ginNumber,
      details: `المستودع: ${targetWh.name} | القيمة: ${totalAmount.toLocaleString('ar-EG')} ج.م | الغرض: ${desc}`,
      status: 'success'
    });

    showToast(`✓ تم إنشاء وترحيل إذن الصرف المخزني (${ginNumber}) بنجاح`, 'success');
    return newGIN;
  };

  const createItemMasterCard = (itemData: any): ItemMasterCard => {
    const defaultWh = warehouses.find(w => w.id === itemData.defaultWarehouseId) || warehouses[0];
    const newCard: ItemMasterCard = {
      id: `item-${Date.now()}`,
      code: itemData.code || `RAW-${Math.floor(100 + Math.random() * 900)}`,
      barcode: itemData.barcode || `622100${Math.floor(100000 + Math.random() * 900000)}`,
      nameAr: itemData.nameAr,
      nameEn: itemData.nameEn || itemData.nameAr,
      category: itemData.category || 'wood_panels',
      categoryNameAr: itemData.categoryNameAr || 'خامات تصنيع',
      unit: itemData.unit || 'sheet',
      unitNameAr: itemData.unitNameAr || 'لوح',
      currentStock: Number(itemData.currentStock || 0),
      reservedStock: 0,
      availableStock: Number(itemData.currentStock || 0),
      minStockLevel: Number(itemData.minStockLevel || 10),
      reorderPoint: Number(itemData.reorderPoint || 20),
      maxStockLevel: Number(itemData.maxStockLevel || 100),
      weightedAvgCost: Number(itemData.weightedAvgCost || itemData.lastPurchasePrice || 0),
      lastPurchasePrice: Number(itemData.lastPurchasePrice || 0),
      sellingPrice: Number(itemData.sellingPrice || 0),
      defaultWarehouseId: defaultWh.id,
      defaultWarehouseName: defaultWh.name,
      locationBin: itemData.locationBin || 'ممر 1 - رف A',
      specifications: itemData.specifications || [],
      supplierId: itemData.supplierId,
      supplierName: itemData.supplierName,
      status: Number(itemData.currentStock || 0) <= 0 ? 'out_of_stock' : 'active'
    };

    setItemMasterCards(prev => [newCard, ...prev]);
    showToast(`✓ تم إضافة كارت الصنف (${newCard.nameAr}) بنجاح`, 'success');
    return newCard;
  };

  const updateItemMasterCard = (id: string, data: any) => {
    setItemMasterCards(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, ...data };
      }
      return item;
    }));
    showToast('✓ تم تحديث بيانات كارت الصنف بنجاح', 'success');
  };

  const createWarehouse = (data: any): WarehouseLocation => {
    const newWh: WarehouseLocation = {
      id: `wh-${Date.now()}`,
      code: data.code || `WH-${Math.floor(10 + Math.random() * 90)}`,
      name: data.name,
      nameEn: data.nameEn || data.name,
      branchId: data.branchId || currentBranch.id,
      branchName: data.branchName || currentBranch.name,
      type: data.type || 'raw_materials',
      managerName: data.managerName || currentUser.fullName,
      phone: data.phone || '01000000000',
      address: data.address || 'مجمع المصانع',
      capacityPercentage: data.capacityPercentage || 50,
      totalItemsCount: 0,
      totalValuation: 0,
      aisles: data.aisles || ['ممر A1', 'ممر A2'],
      isActive: true
    };

    setWarehouses(prev => [...prev, newWh]);
    showToast(`✓ تم تعريف المستودع (${newWh.name}) بنجاح`, 'success');
    return newWh;
  };

  const createStocktakeSession = (data: any): StocktakeSession => {
    const sessionNumber = `STK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().substring(0, 10);
    const targetWh = warehouses.find(w => w.id === data.warehouseId) || warehouses[0];

    const lines: StocktakeLine[] = (data.lines || []).map((l: any, idx: number) => ({
      id: `stk-line-${Date.now()}-${idx}`,
      itemId: l.itemId,
      itemCode: l.itemCode,
      itemName: l.itemName,
      category: l.category || 'wood_panels',
      unit: l.unit || 'لوح',
      locationBin: l.locationBin || 'ممر 1',
      systemQty: Number(l.systemQty || 0),
      countedQty: Number(l.countedQty || 0),
      varianceQty: Number(l.countedQty || 0) - Number(l.systemQty || 0),
      unitCost: Number(l.unitCost || 0),
      varianceAmount: (Number(l.countedQty || 0) - Number(l.systemQty || 0)) * Number(l.unitCost || 0),
      notes: l.notes
    }));

    const totalSystemValue = lines.reduce((s, l) => s + (l.systemQty * l.unitCost), 0);
    const totalCountedValue = lines.reduce((s, l) => s + (l.countedQty * l.unitCost), 0);
    const totalVarianceAmount = totalCountedValue - totalSystemValue;

    const newSession: StocktakeSession = {
      id: `stk-${Date.now()}`,
      sessionNumber,
      warehouseId: targetWh.id,
      warehouseName: targetWh.name,
      categoryFilter: data.categoryFilter,
      startDate: today,
      completionDate: today,
      status: 'completed',
      lines,
      totalSystemValue,
      totalCountedValue,
      totalVarianceAmount,
      conductedByUserName: currentUser.fullName,
      notes: data.notes
    };

    setStocktakeSessions(prev => [newSession, ...prev]);
    showToast(`✓ تم تسجيل جلسة الجرد المخزني (${sessionNumber}) بنجاح`, 'success');
    return newSession;
  };

  const postStocktakeAdjustment = (sessionId: string): boolean => {
    const session = stocktakeSessions.find(s => s.id === sessionId);
    if (!session || session.status === 'posted') return false;

    const currentPeriod = fiscalPeriods.find(p => !p.isClosed) || fiscalPeriods[1];
    const genJournal = journals.find(j => j.type === 'general') || journals[4];
    const rawInvAcc = getSafeAccount('1131', 'asset');
    const varianceLossAcc = getSafeAccount('1135', 'expense');
    const otherIncomeAcc = getSafeAccount('42', 'revenue');

    const netVariance = session.totalVarianceAmount;
    const absVariance = Math.abs(netVariance);

    if (absVariance > 0) {
      const lines = netVariance > 0
        ? [
            {
              accountId: rawInvAcc.id,
              accountCode: rawInvAcc.code,
              accountName: rawInvAcc.nameAr,
              debit: absVariance,
              credit: 0,
              description: `تسوية زيادة جردية فعلية بمستودع (${session.warehouseName})`
            },
            {
              accountId: otherIncomeAcc.id,
              accountCode: otherIncomeAcc.code,
              accountName: otherIncomeAcc.nameAr,
              debit: 0,
              credit: absVariance,
              description: `إثبات أرباح فروق جرد مخزني زائد`
            }
          ]
        : [
            {
              accountId: varianceLossAcc.id,
              accountCode: varianceLossAcc.code,
              accountName: varianceLossAcc.nameAr,
              debit: absVariance,
              credit: 0,
              description: `إثبات خسائر عجز جرد مخزني بمستودع (${session.warehouseName})`
            },
            {
              accountId: rawInvAcc.id,
              accountCode: rawInvAcc.code,
              accountName: rawInvAcc.nameAr,
              debit: 0,
              credit: absVariance,
              description: `تخفيض رصيد المخزون الفعلي بعد الجرد`
            }
          ];

      const postResult = AccountingService.createPostedEntry({
        journal: genJournal,
        date: new Date().toISOString().substring(0, 10),
        periodId: currentPeriod.id,
        reference: `تسوية جرد ${session.sessionNumber}`,
        description: `تسوية فروق الجرد الفعلي لجلسة (${session.sessionNumber}) بالمستودع (${session.warehouseName})`,
        sourceDocument: session.sessionNumber,
        sourceType: 'stock_adjustment',
        branchId: currentBranch.id,
        branchName: currentBranch.name,
        lines,
        userName: currentUser.fullName
      }, fiscalPeriods);

      if (postResult.entry) {
        setJournalEntries(prev => [postResult.entry!, ...prev]);
      }
    }

    // Update item stocks to match countedQty
    setItemMasterCards(prev => prev.map(item => {
      const stkLine = session.lines.find(l => l.itemId === item.id || l.itemCode === item.code);
      if (stkLine) {
        return {
          ...item,
          currentStock: stkLine.countedQty,
          availableStock: Math.max(0, stkLine.countedQty - item.reservedStock),
          status: stkLine.countedQty <= 0 ? 'out_of_stock' : (stkLine.countedQty < item.minStockLevel ? 'low_stock' : 'active')
        };
      }
      return item;
    }));

    setStocktakeSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          status: 'posted',
          approvedByUserName: currentUser.fullName
        };
      }
      return s;
    }));

    showToast(`✓ تم اعتماد وترحيل التسوية الجردية (${session.sessionNumber}) وتعديل الأرصدة والقيود المحاسبية بنجاح`, 'success');
    return true;
  };

  const createMaterialRequisition = (data: any): MaterialRequisition => {
    const requisitionNumber = `MRN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().substring(0, 10);
    const newMRN: MaterialRequisition = {
      id: `mrn-${Date.now()}`,
      requisitionNumber,
      purpose: data.purpose || 'production',
      productionOrderId: data.productionOrderId,
      productionOrderNumber: data.productionOrderNumber,
      department: data.department || 'ورشة التصنيع',
      requestedByUserName: currentUser.fullName,
      date: today,
      requiredDate: data.requiredDate || today,
      items: data.items || [],
      status: 'pending',
      notes: data.notes
    };

    setMaterialRequisitions(prev => [newMRN, ...prev]);
    showToast(`✓ تم تقديم طلب صرف الخامات (${requisitionNumber}) بنجاح`, 'success');
    return newMRN;
  };

  const approveMaterialRequisition = (requisitionId: string) => {
    const today = new Date().toISOString().substring(0, 10);
    setMaterialRequisitions(prev => prev.map(m => {
      if (m.id === requisitionId) {
        return {
          ...m,
          status: 'approved',
          approvedByUserName: currentUser.fullName,
          approvedDate: today
        };
      }
      return m;
    }));

    addAuditLog({
      category: 'inventory',
      action: 'اعتماد طلب صرف خامات (MRN)',
      actionEn: 'Material Requisition Approved',
      target: requisitionId,
      details: `تم اعتماد طلب الصرف من قِبل (${currentUser.fullName}) وأصبح جاهزاً للتسليم المخزني`,
      status: 'success'
    });

    showToast('✓ تم اعتماد طلب صرف الخامات بنجاح، وأصبح جاهزاً للصرف بالمستودع', 'success');
  };

  const rejectMaterialRequisition = (requisitionId: string, reason?: string) => {
    setMaterialRequisitions(prev => prev.map(m => {
      if (m.id === requisitionId) {
        return {
          ...m,
          status: 'rejected',
          notes: `${m.notes || ''} [سبب الرفض: ${reason || 'غير مطابق للمقايسة'}]`
        };
      }
      return m;
    }));

    showToast('تم رفض طلب صرف الخامات وإعادته للتعديل', 'info');
  };

  const confirmWarehouseTransfer = (transferId: string) => {
    setStockTransfers(prev => prev.map(t => {
      if (t.id === transferId) {
        return {
          ...t,
          status: 'received',
          receivedDate: new Date().toISOString().substring(0, 10),
          receivedByUserName: currentUser.fullName
        };
      }
      return t;
    }));
    showToast('✓ تم تأكيد استلام الشحنة والتحويل المخزني بنجاح', 'success');
  };

  return (
    <ERPContext.Provider
      value={{
        company,
        branches,
        users,
        roles,
        auditLogs,
        currentUser,
        currentRole,
        currentBranch,
        availableBranches,
        language,
        activeModule,
        isSidebarCollapsed,
        activePersonaId,
        toasts,
        customers,
        campaigns,
        activities,
        reminders,
        documents,
        afterSalesRecords,
        selectedCustomerId,
        products,
        suppliers,
        supplierInvoices,
        supplierPayments,
        orders,
        payments,
        paymentSchedules,
        returns,
        selectedOrderId,
        selectedProductId,
        selectedSupplierId,
        materials,
        purchaseOrders,
        stockMovements,
        stockTransfers,
        supplierReturns,
        notifications,
        selectedMaterialId,
        customProjects,
        siteVisits,
        projectMeasurements,
        projectDesigns,
        projectQuotations,
        projectTimelineEvents,
        customContracts,
        paymentReceipts,
        selectedProjectId,
        portalCurrentCustomerId,
        productionOrders,
        installationRecords,
        selectedProductionOrderId,
        expenses,
        financialAccounts,
        financialTransactions,
        chartOfAccounts,
        journals,
        journalEntries,
        fiscalPeriods,
        costCenters,
        salesInvoices,
        vendorBills,
        customerAdvances,
        pdcRecords,
        createManualJournalEntry,
        reverseJournalEntry,
        createSalesInvoice,
        recordCustomerAdvancePayment,
        applyCustomerAdvanceToInvoice,
        createVendorBill,
        recordVendorBillPayment,
        updatePdcStatus,
        toggleFiscalPeriodLock,
        addAccountToCoA,
        recordInventoryWipMovement,
        recordProductionCompletionToFinishedGoods,
        recordDeliveryCogsAccounting,
        recordScrapWasteAccounting,
        setActiveModule,
        setIsSidebarCollapsed,
        toggleLanguage,
        switchPersona,
        setCurrentBranch,
        updateCompanyConfig,
        setMainBranch,
        addUser,
        updateUser,
        toggleUserStatus,
        addRole,
        updateRolePermissions,
        addBranch,
        updateBranch,
        checkPermission,
        checkBranchAccess,
        runApiSecurityTest,
        addAuditLog,
        showToast,
        removeToast,
        setSelectedCustomerId,
        addCustomer,
        updateCustomer,
        updateCustomerStatus,
        addCustomerActivity,
        addCustomerReminder,
        toggleReminderCompleted,
        addCampaign,
        updateCampaign,
        setSelectedOrderId,
        setSelectedProductId,
        setSelectedSupplierId,
        createReadyOrder,
        updateOrderStatus,
        updateDeliveryStatus,
        recordCustomerPayment,
        processOrderReturn,
        addProduct,
        updateProduct,
        addSupplier,
        recordSupplierPayment,
        setSelectedMaterialId,
        addMaterial,
        updateMaterial,
        createPurchaseOrder,
        receivePurchaseItems,
        createStockTransfer,
        updateTransferStatus,
        processStockAdjustment,
        processSupplierReturn,
        markNotificationRead,
        setSelectedProjectId,
        createCustomProject,
        updateProjectStatus,
        scheduleSiteVisit,
        completeSiteVisit,
        addProjectMeasurement,
        addProjectDesign,
        updateDesignStatus,
        addDesignComment,
        createProjectQuotation,
        updateQuotationStatus,
        acceptQuotation,
        createContractFromQuotation,
        signContract,
        convertQuotationToOrder,
        loginAsPortalCustomer,
        setSelectedProductionOrderId,
        createProductionOrderFromCustomOrder,
        reserveProductionMaterials,
        consumeProductionMaterials,
        completeProductionOrder,
        scheduleInstallation,
        completeInstallation,
        completeHandover,
        addCompanyExpense,
        transferBetweenFinancialAccounts,
        recordSupplierPaymentFromFinance,
        warehouses,
        itemMasterCards,
        goodsReceiptNotes,
        goodsIssueNotes,
        materialRequisitions,
        stocktakeSessions,
        stockLedgerEntries,
        selectedItemCardId,
        setSelectedItemCardId,
        createGoodsReceiptNote,
        createGoodsIssueNote,
        createItemMasterCard,
        updateItemMasterCard,
        createWarehouse,
        createStocktakeSession,
        postStocktakeAdjustment,
        createMaterialRequisition,
        approveMaterialRequisition,
        rejectMaterialRequisition,
        confirmWarehouseTransfer
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
