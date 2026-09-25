// ====================================================
// REWAQ ERP — DAFTRA-INSPIRED CHART OF ACCOUNTS & JOURNALS
// Comprehensive Hierarchical Structure for Furniture Manufacturing
// ====================================================

import {
  Account,
  Journal,
  JournalEntry,
  FiscalPeriod,
  CostCenter,
  PDCRecord,
  SalesInvoice,
  VendorBill,
  CustomerAdvance
} from '../types/accounting';

export const initialChartOfAccounts: Account[] = [
  // ====================================================
  // 1. الأصول (ASSETS)
  // ====================================================
  { id: 'acc-1', code: '1', name: 'Assets', nameAr: 'الأصول', type: 'asset', level: 1, allowManualEntries: false, isActive: true },

  // 11 الأصول المتداولة (Current Assets)
  { id: 'acc-11', code: '11', name: 'Current Assets', nameAr: 'الأصول المتداولة', type: 'asset', parentId: 'acc-1', level: 2, allowManualEntries: false, isActive: true },

  // 111 النقدية وما في حكمها
  { id: 'acc-111', code: '111', name: 'Cash and Cash Equivalents', nameAr: 'النقدية وما في حكمها', type: 'asset', parentId: 'acc-11', level: 3, allowManualEntries: false, isActive: true },
  
  // 1111 الصناديق والخزائن
  { id: 'acc-1111', code: '1111', name: 'Cash on Hand', nameAr: 'الصناديق والخزائن النقدية', type: 'asset', parentId: 'acc-111', level: 4, allowManualEntries: false, isActive: true },
  { id: 'acc-11111', code: '11111', name: 'Main Showroom Cash (Cairo)', nameAr: 'خزينة المعرض الرئيسي (القاهرة)', type: 'asset', parentId: 'acc-1111', level: 5, allowManualEntries: true, isActive: true, openingBalanceDebit: 120000, description: 'الخزينة الرئيسية لمعرض القاهرة' },
  { id: 'acc-11112', code: '11112', name: 'Workshop Petty Cash (Obour)', nameAr: 'عهدة وخزينة ورشة ومصنع العبور', type: 'asset', parentId: 'acc-1111', level: 5, allowManualEntries: true, isActive: true, openingBalanceDebit: 15000, description: 'مصاريف ونثريات المصنع' },
  { id: 'acc-11113', code: '11113', name: 'Alexandria Showroom Cash', nameAr: 'خزينة فرع الإسكندرية', type: 'asset', parentId: 'acc-1111', level: 5, allowManualEntries: true, isActive: true, openingBalanceDebit: 25000, description: 'خزينة مبيعات فرع الإسكندرية' },

  // 1112 الحسابات البنكية
  { id: 'acc-1112', code: '1112', name: 'Bank Accounts', nameAr: 'الحسابات الجارية بالبنوك', type: 'asset', parentId: 'acc-111', level: 4, allowManualEntries: false, isActive: true },
  { id: 'acc-11121', code: '11121', name: 'National Bank of Egypt (NBE)', nameAr: 'حساب البنك الأهلي المصري (NBE)', type: 'asset', parentId: 'acc-1112', level: 5, allowManualEntries: true, isActive: true, openingBalanceDebit: 210000, description: 'الحساب البنكي الرئيسي للتحويلات والإيداعات' },
  { id: 'acc-11122', code: '11122', name: 'Commercial International Bank (CIB)', nameAr: 'حساب البنك التجاري الدولي (CIB)', type: 'asset', parentId: 'acc-1112', level: 5, allowManualEntries: true, isActive: true, openingBalanceDebit: 100000, description: 'حساب فرعي للعمليات وبطاقات POS' },

  // 1113 شيكات برسم التحصيل
  { id: 'acc-1113', code: '1113', name: 'PDC Checks Under Collection', nameAr: 'شيكات وأوراق قبض برسم التحصيل (PDC)', type: 'asset', parentId: 'acc-111', level: 4, isReconcilable: true, allowManualEntries: true, isActive: true, description: 'الشيكات المستلمة من العملاء لحين ورودها في كشف حساب البنك' },

  // 112 العملاء والمدينون
  { id: 'acc-112', code: '112', name: 'Accounts Receivable', nameAr: 'العملاء والمدينون (AR)', type: 'asset', parentId: 'acc-11', level: 3, allowManualEntries: false, isActive: true },
  { id: 'acc-1121', code: '1121', name: 'Trade Customers (Shared AR)', nameAr: 'حساب العملاء التجاريين العام المشترك', type: 'asset', parentId: 'acc-112', level: 4, isReconcilable: true, allowManualEntries: true, isActive: true, openingBalanceDebit: 180000, description: 'حساب الأستاذ المساعد الموحد لجميع العملاء' },
  { id: 'acc-1122', code: '1122', name: 'Notes Receivable', nameAr: 'أوراق قبض تجارية مؤجلة', type: 'asset', parentId: 'acc-112', level: 4, isReconcilable: true, allowManualEntries: true, isActive: true },

  // 113 المخزون وحسابات التصنيع
  { id: 'acc-113', code: '113', name: 'Inventory & Stock', nameAr: 'المخزون وخامات التصنيع', type: 'asset', parentId: 'acc-11', level: 3, allowManualEntries: false, isActive: true },
  { id: 'acc-1131', code: '1131', name: 'Raw Materials (MDF, Wood, HPL)', nameAr: 'مخزون الخامات والألواح والأخشاب', type: 'asset', parentId: 'acc-113', level: 4, allowManualEntries: true, isActive: true, openingBalanceDebit: 250000, description: 'ألواح MDF، خشب زان، بولي لاك، قواطع HPL' },
  { id: 'acc-1132', code: '1132', name: 'Hardware & Accessories Stock', nameAr: 'مخزون الإكسسوارات والمفصلات والمقابض', type: 'asset', parentId: 'acc-113', level: 4, allowManualEntries: true, isActive: true, openingBalanceDebit: 80000, description: 'مفصلات بلوم، مجاري أدراج، ليد بروفايل' },
  { id: 'acc-1133', code: '1133', name: 'Work in Progress (WIP Workshop)', nameAr: 'إنتاج تحت التشغيل بورش التصنيع (WIP)', type: 'asset', parentId: 'acc-113', level: 4, allowManualEntries: true, isActive: true, openingBalanceDebit: 60000, description: 'أوامر تصنيع المطابخ والدريسينج الجاري تشغيلها بالورشة' },
  { id: 'acc-1134', code: '1134', name: 'Finished Goods Inventory', nameAr: 'مخزون الإنتاج التام والجاهز للتسليم', type: 'asset', parentId: 'acc-113', level: 4, allowManualEntries: true, isActive: true, openingBalanceDebit: 180000, description: 'مطابخ وأثاث تم تصنيعه وجاهز للتركيب بالمعرض أو موقع العميل' },
  { id: 'acc-1135', code: '1135', name: 'Scrap & Material Waste', nameAr: 'هالك ومخلفات وتوالف الإنتاج', type: 'asset', parentId: 'acc-113', level: 4, allowManualEntries: true, isActive: true, description: 'توالف الألواح وفواقد القص' },

  // 114 أرصدة مدينة أخرى وضرائب
  { id: 'acc-114', code: '114', name: 'Other Current Assets & Taxes', nameAr: 'أرصدة مدينة أخرى وضرائب', type: 'asset', parentId: 'acc-11', level: 3, allowManualEntries: false, isActive: true },
  { id: 'acc-1141', code: '1141', name: 'Input VAT (14% Purchases)', nameAr: 'ضريبة القيمة المضافة على المدخلات (14%)', type: 'asset', parentId: 'acc-114', level: 4, isReconcilable: true, allowManualEntries: true, isActive: true, description: 'ضريبة المدخلات المخصومة من فواتير مشتريات الموردين' },
  { id: 'acc-1142', code: '1142', name: 'Prepaid Expenses', nameAr: 'مصروفات تشغيلية مدفوعة مقدماً', type: 'asset', parentId: 'acc-114', level: 4, allowManualEntries: true, isActive: true },
  { id: 'acc-1143', code: '1143', name: 'Employee Advances & Custodies', nameAr: 'سلف وعهد مؤقتة للعاملين', type: 'asset', parentId: 'acc-114', level: 4, allowManualEntries: true, isActive: true },

  // 12 الأصول غير المتداولة / الثابتة (Fixed Assets)
  { id: 'acc-12', code: '12', name: 'Fixed Assets', nameAr: 'الأصول غير المتداولة (الثابتة)', type: 'asset', parentId: 'acc-1', level: 2, allowManualEntries: false, isActive: true },
  { id: 'acc-121', code: '121', name: 'CNC & Workshop Machinery', nameAr: 'ماكينات الـ CNC ومعدات الورشة', type: 'asset', parentId: 'acc-12', level: 3, allowManualEntries: true, isActive: true, openingBalanceDebit: 850000, description: 'ماكينة CNC 3D روتر، ماكينة شريط شاط إيطالي، كمبروسر 500 لتر' },
  { id: 'acc-122', code: '122', name: 'Logistics & Delivery Vans', nameAr: 'سيارات النقل والتركيبات الميدانية', type: 'asset', parentId: 'acc-12', level: 3, allowManualEntries: true, isActive: true, openingBalanceDebit: 220000, description: 'سيارات جامبو لنقل وتوصيل المطابخ' },
  { id: 'acc-123', code: '123', name: 'Engineering Computers & CAD/CAM', nameAr: 'أجهزة كمبيوتر وبرامج التصميم الهندسي', type: 'asset', parentId: 'acc-12', level: 3, allowManualEntries: true, isActive: true, openingBalanceDebit: 60000 },
  { id: 'acc-124', code: '124', name: 'Showroom Decoration & Fixtures', nameAr: 'تجهيزات وديكورات المعارض', type: 'asset', parentId: 'acc-12', level: 3, allowManualEntries: true, isActive: true, openingBalanceDebit: 90000 },
  { id: 'acc-129', code: '129', name: 'Accumulated Depreciation', nameAr: 'مجمع إهلاك الأصول الثابتة', type: 'asset', parentId: 'acc-12', level: 3, allowManualEntries: true, isActive: true, openingBalanceCredit: 120000, description: 'مجمع الإهلاك التراكمي للماكينات والسيارات' },

  // ====================================================
  // 2. الخصوم والالتزامات (LIABILITIES)
  // ====================================================
  { id: 'acc-2', code: '2', name: 'Liabilities', nameAr: 'الخصوم والالتزامات', type: 'liability', level: 1, allowManualEntries: false, isActive: true },

  // 21 الالتزامات المتداولة (Current Liabilities)
  { id: 'acc-21', code: '21', name: 'Current Liabilities', nameAr: 'الالتزامات المتداولة (قصيرة الأجل)', type: 'liability', parentId: 'acc-2', level: 2, allowManualEntries: false, isActive: true },

  // 211 الموردون والدائنون
  { id: 'acc-211', code: '211', name: 'Accounts Payable', nameAr: 'الموردون والدائنون (AP)', type: 'liability', parentId: 'acc-21', level: 3, allowManualEntries: false, isActive: true },
  { id: 'acc-2111', code: '2111', name: 'Trade Suppliers (Shared AP)', nameAr: 'حساب الموردين التجاريين العام المشترك', type: 'liability', parentId: 'acc-211', level: 4, isReconcilable: true, allowManualEntries: true, isActive: true, openingBalanceCredit: 190000, description: 'حساب الأستاذ المساعد الموحد لجميع الموردين' },
  { id: 'acc-2112', code: '2112', name: 'Notes Payable (Issued Checks)', nameAr: 'أوراق دفع وشيكات صادرة للموردين', type: 'liability', parentId: 'acc-211', level: 4, isReconcilable: true, allowManualEntries: true, isActive: true },

  // 212 دفعات مقدمة وعرابين من العملاء
  { id: 'acc-212', code: '212', name: 'Customer Advances & Deposits', nameAr: 'دفعات مقدمة وعرابين تعاقدات العملاء', type: 'liability', parentId: 'acc-21', level: 3, isReconcilable: true, allowManualEntries: true, isActive: true, openingBalanceCredit: 85000, description: 'عربين التعاقد المستلمة من العملاء قبل إصدار الفاتورة أو التسليم' },

  // 213 وسيط استلام بضاعة غير مفوتورة
  { id: 'acc-213', code: '213', name: 'Stock Interim / GR-IR Clearing', nameAr: 'وسيط استلام خامات غير مفوتورة (GR/IR)', type: 'liability', parentId: 'acc-21', level: 3, isReconcilable: true, allowManualEntries: true, isActive: true, description: 'تسوية حركة استلام الخامات بالمخزن مع توقيت ورود فاتورة المورد' },

  // 214 مصلحة الضرائب
  { id: 'acc-214', code: '214', name: 'Taxes Payable Authority', nameAr: 'مصلحة الضرائب والرسوم المستحقة', type: 'liability', parentId: 'acc-21', level: 3, allowManualEntries: false, isActive: true },
  { id: 'acc-2141', code: '2141', name: 'Output VAT (14% Sales)', nameAr: 'ضريبة القيمة المضافة على المبيعات (14%)', type: 'liability', parentId: 'acc-214', level: 4, isReconcilable: true, allowManualEntries: true, isActive: true, description: 'ضريبة المخرجات المحصلة من فواتير مبيعات العملاء' },
  { id: 'acc-2142', code: '2142', name: 'Withholding Tax (1% Raw Materials)', nameAr: 'ضريبة الخصم والتحصيل أرباح تجارية (1%)', type: 'liability', parentId: 'acc-214', level: 4, isReconcilable: true, allowManualEntries: true, isActive: true, description: 'ضريبة الخصم المستقطعة من دفعات الموردين للتوريد للضرائب' },

  // 215 مصروفات ومرتبات مستحقة
  { id: 'acc-215', code: '215', name: 'Accrued Expenses & Salaries', nameAr: 'مصروفات تشغيل وأجور مستحقة', type: 'liability', parentId: 'acc-21', level: 3, allowManualEntries: true, isActive: true, openingBalanceCredit: 5000 },

  // 22 الالتزامات غير المتداولة
  { id: 'acc-22', code: '22', name: 'Non-Current Liabilities', nameAr: 'الالتزامات طويلة الأجل والقروض', type: 'liability', parentId: 'acc-2', level: 2, allowManualEntries: true, isActive: true },

  // ====================================================
  // 3. حقوق الملكية (EQUITY)
  // ====================================================
  { id: 'acc-3', code: '3', name: 'Equity', nameAr: 'حقوق الملكية ورأس المال', type: 'equity', level: 1, allowManualEntries: false, isActive: true },
  { id: 'acc-31', code: '31', name: 'Paid-in Share Capital', nameAr: 'رأس المال المصدر والمدفوع', type: 'equity', parentId: 'acc-3', level: 2, allowManualEntries: true, isActive: true, openingBalanceCredit: 1600000, description: 'رأس مال الشركاء والمؤسسين' },
  { id: 'acc-32', code: '32', name: 'Retained Earnings', nameAr: 'الأرباح المبقاة والمحتجزة من سنوات سابقة', type: 'equity', parentId: 'acc-3', level: 2, allowManualEntries: true, isActive: true, openingBalanceCredit: 440000 },
  { id: 'acc-33', code: '33', name: 'Partners Current Accounts', nameAr: 'جاري الشركاء والمساهمين', type: 'equity', parentId: 'acc-3', level: 2, allowManualEntries: true, isActive: true },
  { id: 'acc-34', code: '34', name: 'Current Year Profit & Loss', nameAr: 'أرباح وخسائر العام المالي الجاري', type: 'equity', parentId: 'acc-3', level: 2, allowManualEntries: false, isActive: true, description: 'صافي أرباح قائمة الدخل للعام الحالي' },

  // ====================================================
  // 4. الإيرادات والمبيعات (REVENUE)
  // ====================================================
  { id: 'acc-4', code: '4', name: 'Revenue', nameAr: 'الإيرادات والمبيعات', type: 'revenue', level: 1, allowManualEntries: false, isActive: true },

  // 41 إيرادات النشاط الرئيسي
  { id: 'acc-41', code: '41', name: 'Operating Sales Revenues', nameAr: 'إيرادات المبيعات والنشاط التشغيلي الرئيسي', type: 'revenue', parentId: 'acc-4', level: 2, allowManualEntries: false, isActive: true },
  { id: 'acc-411', code: '411', name: 'Custom Kitchens Sales', nameAr: 'إيرادات مبيعات وتصنيع المطابخ المخصصة', type: 'revenue', parentId: 'acc-41', level: 3, allowManualEntries: true, isActive: true, description: 'مطابخ بولي لاك، HPL، خشب طبيعي، أكليريك' },
  { id: 'acc-412', code: '412', name: 'Dressing Rooms & Wardrobes Sales', nameAr: 'إيرادات مبيعات الدريسينج والتجاليد', type: 'revenue', parentId: 'acc-41', level: 3, allowManualEntries: true, isActive: true },
  { id: 'acc-413', code: '413', name: 'Ready-made Furniture Sales', nameAr: 'إيرادات مبيعات الأثاث الجاهز بالمعارض', type: 'revenue', parentId: 'acc-41', level: 3, allowManualEntries: true, isActive: true },
  { id: 'acc-414', code: '414', name: 'Installation & Delivery Services', nameAr: 'إيرادات خدمات النقل والتركيبات المباشرة', type: 'revenue', parentId: 'acc-41', level: 3, allowManualEntries: true, isActive: true },

  // 42 إيرادات تشغيلية وأخرى
  { id: 'acc-42', code: '42', name: 'Other Operating Income', nameAr: 'إيرادات تشغيلية وأخرى متنوعة', type: 'revenue', parentId: 'acc-4', level: 2, allowManualEntries: true, isActive: true },

  // ====================================================
  // 5. المصروفات وتكلفة المبيعات (COGS & EXPENSES)
  // ====================================================
  { id: 'acc-5', code: '5', name: 'Expenses & COGS', nameAr: 'المصروفات وتكلفة المبيعات', type: 'expense', level: 1, allowManualEntries: false, isActive: true },

  // 51 تكلفة المبيعات والإنتاج (COGS)
  { id: 'acc-51', code: '51', name: 'Cost of Goods Sold (COGS)', nameAr: 'تكلفة المبيعات والتصنيع المباشرة (COGS)', type: 'cogs', parentId: 'acc-5', level: 2, allowManualEntries: false, isActive: true },
  { id: 'acc-511', code: '511', name: 'Direct Raw Materials Consumed', nameAr: 'تكلفة الخامات المستهلكة في أوامر الإنتاج', type: 'cogs', parentId: 'acc-51', level: 3, allowManualEntries: true, isActive: true, description: 'ألواح MDF، خشب زان، قواطع HPL، مقابض ومفصلات' },
  { id: 'acc-512', code: '512', name: 'Direct Workshop Labor Allocation', nameAr: 'أجور عمالة وفنيين ورش التصنيع المباشرة', type: 'cogs', parentId: 'acc-51', level: 3, allowManualEntries: true, isActive: true },
  { id: 'acc-513', code: '513', name: 'Manufacturing Overheads Allocation', nameAr: 'مصاريف تشغيل صناعية غير مباشرة (ورشة)', type: 'cogs', parentId: 'acc-51', level: 3, allowManualEntries: true, isActive: true },
  { id: 'acc-514', code: '514', name: 'COGS - Delivered Products', nameAr: 'تكلفة البضاعة المباعة المسلمة للعملاء', type: 'cogs', parentId: 'acc-51', level: 3, allowManualEntries: true, isActive: true },

  // 52 المصروفات البيعية والتسويقية
  { id: 'acc-52', code: '52', name: 'Selling & Marketing Expenses', nameAr: 'المصروفات البيعية والتسويقية', type: 'expense', parentId: 'acc-5', level: 2, allowManualEntries: false, isActive: true },
  { id: 'acc-521', code: '521', name: 'Digital Advertising & Marketing', nameAr: 'حملات التسويق الرقمي والإعلانات الممولة', type: 'expense', parentId: 'acc-52', level: 3, allowManualEntries: true, isActive: true },
  { id: 'acc-522', code: '522', name: 'Sales Commissions & Incentives', nameAr: 'عمولات وبونص مبيعات مهندسي المعارض', type: 'expense', parentId: 'acc-52', level: 3, allowManualEntries: true, isActive: true },
  { id: 'acc-523', code: '523', name: 'Exhibitions & Catalogs', nameAr: 'معارض وكتالوجات ومطبوعات تسويقية', type: 'expense', parentId: 'acc-52', level: 3, allowManualEntries: true, isActive: true },

  // 53 المصروفات الإدارية والعمومية
  { id: 'acc-53', code: '53', name: 'General & Administrative Expenses', nameAr: 'المصروفات الإدارية والعمومية', type: 'expense', parentId: 'acc-5', level: 2, allowManualEntries: false, isActive: true },
  { id: 'acc-531', code: '531', name: 'Showroom & Factory Rent', nameAr: 'إيجار مقرات المعارض والمصنع', type: 'expense', parentId: 'acc-53', level: 3, allowManualEntries: true, isActive: true },
  { id: 'acc-532', code: '532', name: 'Admin Staff Salaries', nameAr: 'مرتبات الإدارة والمكتب الفني والمحاسبة', type: 'expense', parentId: 'acc-53', level: 3, allowManualEntries: true, isActive: true },
  { id: 'acc-533', code: '533', name: 'Electricity, Water & Utilities', nameAr: 'كهرباء ومياه ومرافق المعرض والمصنع', type: 'expense', parentId: 'acc-53', level: 3, allowManualEntries: true, isActive: true },
  { id: 'acc-534', code: '534', name: 'Machinery Maintenance & Repairs', nameAr: 'صيانة ماكينات الـ CNC ومعدات الورشة', type: 'expense', parentId: 'acc-53', level: 3, allowManualEntries: true, isActive: true },
  { id: 'acc-535', code: '535', name: 'Fixed Assets Depreciation', nameAr: 'مصروف إهلاك الأصول الثابتة', type: 'expense', parentId: 'acc-53', level: 3, allowManualEntries: true, isActive: true },
  { id: 'acc-536', code: '536', name: 'Office Supplies & Hospitality', nameAr: 'نثريات وضيافة وأدوات مكتبية', type: 'expense', parentId: 'acc-53', level: 3, allowManualEntries: true, isActive: true }
];

export const initialJournals: Journal[] = [
  {
    id: 'jrn-sales',
    code: 'SAL',
    name: 'Customer Sales Journal',
    nameAr: 'دفتر يومية المبيعات والفواتير',
    type: 'sales',
    defaultDebitAccountId: 'acc-1121',
    defaultCreditAccountId: 'acc-411',
    sequencePrefix: 'INV-2026-',
    isActive: true,
    description: 'تسجيل فواتير مبيعات المطابخ والأثاث والخدمات'
  },
  {
    id: 'jrn-pur',
    code: 'PUR',
    name: 'Vendor Bills & Purchases Journal',
    nameAr: 'دفتر يومية المشتريات وفواتير الموردين',
    type: 'purchase',
    defaultDebitAccountId: 'acc-213',
    defaultCreditAccountId: 'acc-2111',
    sequencePrefix: 'BILL-2026-',
    isActive: true,
    description: 'تسجيل فواتير الموردين ومشتريات الخامات وإقفال GR/IR'
  },
  {
    id: 'jrn-csh',
    code: 'CSH',
    name: 'Cash Receipts & Payments Journal',
    nameAr: 'دفتر يومية الخزائن والنقدية',
    type: 'cash',
    defaultDebitAccountId: 'acc-11111',
    defaultCreditAccountId: 'acc-11111',
    sequencePrefix: 'CSH-2026-',
    isActive: true,
    description: 'سندات القبض والصرف النقدي والعهد'
  },
  {
    id: 'jrn-bnk',
    code: 'BNK',
    name: 'Bank Transactions Journal',
    nameAr: 'دفتر يومية البنوك والشيكات',
    type: 'bank',
    defaultDebitAccountId: 'acc-11121',
    defaultCreditAccountId: 'acc-11121',
    sequencePrefix: 'BNK-2026-',
    isActive: true,
    description: 'التحويلات البنكية والإيداعات وسداد الشيكات'
  },
  {
    id: 'jrn-gen',
    code: 'GEN',
    name: 'General & Operations Journal',
    nameAr: 'دفتر العمليات العامة والتشغيلية والمخزون',
    type: 'general',
    sequencePrefix: 'JE-2026-',
    isActive: true,
    description: 'تسويات المخزون، صرف الخامات للـ WIP، الإهلاك، والقيود اليدوية'
  }
];

export const initialFiscalPeriods: FiscalPeriod[] = [
  { id: 'per-2026-07', year: 2026, periodNumber: 7, name: 'يوليو 2026', startDate: '2026-07-01', endDate: '2026-07-31', isClosed: true, closedAt: '2026-08-05 14:00', closedByUserName: 'أحمد محمود (المدير المالي)' },
  { id: 'per-2026-08', year: 2026, periodNumber: 8, name: 'أغسطس 2026', startDate: '2026-08-01', endDate: '2026-08-31', isClosed: false },
  { id: 'per-2026-09', year: 2026, periodNumber: 9, name: 'سبتمبر 2026', startDate: '2026-09-01', endDate: '2026-09-30', isClosed: false },
  { id: 'per-2026-10', year: 2026, periodNumber: 10, name: 'أكتوبر 2026', startDate: '2026-10-01', endDate: '2026-10-31', isClosed: false }
];

export const initialCostCenters: CostCenter[] = [
  { id: 'cc-1', code: 'CC-CNC', name: 'CNC & Routing Workshop', nameAr: 'قسم تقطيع الـ CNC وشريط الشاط', category: 'workshop', isActive: true },
  { id: 'cc-2', code: 'CC-CARP', name: 'Carpentry & Assembly', nameAr: 'قسم التجميع والنجارة اليدوية', category: 'workshop', isActive: true },
  { id: 'cc-3', code: 'CC-PAINT', name: 'Painting & Finishing', nameAr: 'قسم الدهانات والتشطيب والدوكو', category: 'workshop', isActive: true },
  { id: 'cc-4', code: 'CC-INST', name: 'Site Installation Team', nameAr: 'فرق التركيبات الخارجية والمعاينات', category: 'service', isActive: true },
  { id: 'cc-5', code: 'CC-SHOW', name: 'Showroom Sales Cairo', nameAr: 'معرض القاهرة الرئيسي', category: 'sales', isActive: true },
  { id: 'cc-6', code: 'CC-ADMIN', name: 'General Administration', nameAr: 'الإدارة العامة والمكتب الفني', category: 'admin', isActive: true }
];

export const initialPDCRecords: PDCRecord[] = [
  {
    id: 'pdc-1',
    checkNumber: 'CHK-994821',
    type: 'receivable',
    partnerId: 'cust-1',
    partnerName: 'محمد حسن',
    bankName: 'البنك التجاري الدولي CIB',
    branchName: 'فرع المعادي',
    amount: 50000,
    issueDate: '2026-08-20',
    dueDate: '2026-09-30',
    status: 'under_collection',
    notes: 'شيك الدفعة الختامية لعقد المطبخ',
    createdDate: '2026-08-20'
  },
  {
    id: 'pdc-2',
    checkNumber: 'CHK-110294',
    type: 'payable',
    partnerId: 'sup-1',
    partnerName: 'شركة الرواد لخامات الأثاث',
    bankName: 'البنك الأهلي المصري',
    amount: 70000,
    issueDate: '2026-08-15',
    dueDate: '2026-09-15',
    status: 'cleared',
    notes: 'شيك سداد فاتورة توريد ألواح HPL وجود وود',
    createdDate: '2026-08-15'
  }
];

export const initialCustomerAdvances: CustomerAdvance[] = [
  {
    id: 'adv-101',
    advanceNumber: 'ADV-2026-0001',
    customerId: 'cust-1',
    customerName: 'محمد حسن',
    orderId: 'ord-101',
    orderNumber: 'ORD-2026-0018',
    projectId: 'prj-101',
    projectNumber: 'PRJ-2026-001',
    amount: 100000,
    appliedAmount: 0,
    remainingAmount: 100000,
    paymentMethod: 'bank_transfer',
    accountId: 'acc-11121',
    date: '2026-08-25',
    journalEntryId: 'je-adv-101',
    status: 'active',
    notes: 'عربون مقدم تعاقد تصنيع مطبخ رويال HPL',
    receivedByUserName: 'أحمد محمود (المالية)'
  }
];

export const initialSalesInvoices: SalesInvoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-2026-0001',
    customerId: 'cust-1',
    customerName: 'محمد حسن',
    orderId: 'ord-101',
    orderNumber: 'ORD-2026-0018',
    projectId: 'prj-101',
    projectNumber: 'PRJ-2026-001',
    date: '2026-08-25',
    dueDate: '2026-09-25',
    items: [
      { id: 'it-1', description: 'مطبخ مودرن رويال HPL وشاسيه جود وود كامل', itemType: 'custom_kitchen', quantity: 1, unitPrice: 220000, discount: 0, subtotal: 220000, taxRate: 14, taxAmount: 30800, total: 250800 },
      { id: 'it-2', description: 'إكسسوارات بلوم ووحدات إضاءة ليد بروفايل', itemType: 'material', quantity: 1, unitPrice: 30000, discount: 0, subtotal: 30000, taxRate: 14, taxAmount: 4200, total: 34200 }
    ],
    subtotal: 250000,
    taxAmount: 35000,
    discountAmount: 0,
    totalAmount: 285000,
    advanceAppliedAmount: 0,
    netReceivableAmount: 285000,
    paidAmount: 0,
    balanceDue: 285000,
    status: 'posted',
    journalEntryId: 'je-inv-101',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    notes: 'فاتورة ضريبية إلكترونية - توريد وتركيب مطبخ',
    createdDate: '2026-08-25'
  }
];

export const initialVendorBills: VendorBill[] = [
  {
    id: 'bill-101',
    billNumber: 'BILL-2026-0001',
    vendorInvoiceNumber: 'INV-RAW-9921',
    supplierId: 'sup-1',
    supplierName: 'شركة الرواد لخامات الأثاث',
    purchaseOrderId: 'po-101',
    poNumber: 'PO-2026-001',
    billType: 'stock_purchase',
    date: '2026-08-20',
    dueDate: '2026-09-20',
    items: [
      { id: 'bi-1', description: 'توريد 100 لوح MDF مستورد إسباني 18مم', itemType: 'stock_material', quantity: 100, unitPrice: 1000, subtotal: 100000, taxRate: 14, taxAmount: 14000, total: 114000 }
    ],
    subtotal: 100000,
    taxAmount: 14000,
    withholdingTaxRate: 1,
    withholdingTaxAmount: 1000,
    totalAmount: 114000,
    netPayableAmount: 113000,
    paidAmount: 0,
    balanceDue: 113000,
    status: 'posted',
    journalEntryId: 'je-bill-101',
    branchId: 'branch-1',
    branchName: 'المخزن الرئيسي ومصنع العبور',
    notes: 'فاتورة توريد خامات مسجلة مع إذن استلام مخزني GR/IR',
    createdDate: '2026-08-20'
  }
];

export const initialJournalEntries: JournalEntry[] = [
  // 0. Initial Sales Invoice (محمد حسن 285,000)
  {
    id: 'je-inv-101',
    entryNumber: 'JE-2026-000100',
    date: '2026-08-25',
    periodId: 'per-2026-08',
    journalId: 'jrn-sal',
    journalName: 'دفتر يومية المبيعات والفواتير',
    sourceDocument: 'INV-2026-0001',
    sourceType: 'sales_invoice',
    reference: 'فاتورة مبيعات INV-2026-0001',
    description: 'إثبات استحقاق مبيعات مطبخ رويال شاملة 14% ضريبة القيمة المضافة',
    lines: [
      {
        id: 'line-inv-1',
        accountId: 'acc-1121',
        accountCode: '1121',
        accountName: 'حساب العملاء التجاريين العام المشترك',
        partnerId: 'cust-1',
        partnerType: 'customer',
        partnerName: 'محمد حسن',
        debit: 285000,
        credit: 0,
        description: 'مديونية العميل محمد حسن عن فاتورة مطبخ رويال'
      },
      {
        id: 'line-inv-2',
        accountId: 'acc-411',
        accountCode: '411',
        accountName: 'إيرادات مبيعات وتصنيع المطابخ المخصصة',
        debit: 0,
        credit: 250000,
        description: 'إيراد توريد وتصنيع مطبخ رويال قبل الضريبة'
      },
      {
        id: 'line-inv-3',
        accountId: 'acc-2141',
        accountCode: '2141',
        accountName: 'ضريبة القيمة المضافة على المبيعات (14%)',
        debit: 0,
        credit: 35000,
        description: 'ضريبة القيمة المضافة 14% المحصلة لصالح مصلحة الضرائب'
      }
    ],
    totalDebit: 285000,
    totalCredit: 285000,
    status: 'posted',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    createdAt: '2026-08-25 12:00:00',
    createdByUserName: 'أحمد محمود (المالية)',
    postedAt: '2026-08-25 12:00:00',
    postedByUserName: 'أحمد محمود (المالية)'
  },
  // 1. Initial Advance from Customer (محمد حسن 100,000)
  {
    id: 'je-adv-101',
    entryNumber: 'JE-2026-000101',
    date: '2026-08-25',
    periodId: 'per-2026-08',
    journalId: 'jrn-bnk',
    journalName: 'دفتر يومية البنوك والشيكات',
    sourceDocument: 'ADV-2026-0001',
    sourceType: 'customer_advance',
    reference: 'عربون تعاقد مطبخ محمد حسن',
    description: 'استلام دفعة مقدمة بحساب البنك الأهلي لعقد مطبخ العميل محمد حسن',
    lines: [
      {
        id: 'line-adv-1',
        accountId: 'acc-11121',
        accountCode: '11121',
        accountName: 'حساب البنك الأهلي المصري (NBE)',
        debit: 100000,
        credit: 0,
        description: 'إيداع بنكي لعربون العقد'
      },
      {
        id: 'line-adv-2',
        accountId: 'acc-212',
        accountCode: '212',
        accountName: 'دفعات مقدمة وعرابين تعاقدات العملاء',
        partnerId: 'cust-1',
        partnerType: 'customer',
        partnerName: 'محمد حسن',
        debit: 0,
        credit: 100000,
        description: 'دفعة مقدمة والتزام على الشركة حتى التصنيع والفوترة'
      }
    ],
    totalDebit: 100000,
    totalCredit: 100000,
    status: 'posted',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    createdAt: '2026-08-25 10:00:00',
    createdByUserName: 'أحمد محمود (المالية)',
    postedAt: '2026-08-25 10:00:00',
    postedByUserName: 'أحمد محمود (المالية)'
  },

  // 2. Initial Raw Material Goods Receipt (MDF 100,000)
  {
    id: 'je-gr-101',
    entryNumber: 'JE-2026-000102',
    date: '2026-08-20',
    periodId: 'per-2026-08',
    journalId: 'jrn-gen',
    journalName: 'دفتر العمليات العامة والتشغيلية والمخزون',
    sourceDocument: 'PO-2026-001',
    sourceType: 'stock_receipt',
    reference: 'إذن استلام مخزني ألواح خشب MDF',
    description: 'استلام شحنة ألواح MDF بالمخزن لحساب أمر الشراء PO-2026-001',
    lines: [
      {
        id: 'line-gr-1',
        accountId: 'acc-1131',
        accountCode: '1131',
        accountName: 'مخزون الخامات والألواح والأخشاب',
        debit: 100000,
        credit: 0,
        description: 'إضافة 100 لوح MDF لمخزن الخامات'
      },
      {
        id: 'line-gr-2',
        accountId: 'acc-213',
        accountCode: '213',
        accountName: 'وسيط استلام خامات غير مفوتورة (GR/IR)',
        partnerId: 'sup-1',
        partnerType: 'supplier',
        partnerName: 'شركة الرواد لخامات الأثاث',
        debit: 0,
        credit: 100000,
        description: 'إثبات استلام بضاعة وسيطة لحين وصول فاتورة المورد'
      }
    ],
    totalDebit: 100000,
    totalCredit: 100000,
    status: 'posted',
    branchId: 'branch-1',
    branchName: 'المخزن الرئيسي ومصنع العبور',
    createdAt: '2026-08-20 11:30:00',
    createdByUserName: 'مسؤول المخازن',
    postedAt: '2026-08-20 11:30:00',
    postedByUserName: 'أحمد محمود (المالية)'
  },

  // 3. Vendor Bill Posting (Clearing GR/IR + Input VAT + AP)
  {
    id: 'je-bill-101',
    entryNumber: 'JE-2026-000103',
    date: '2026-08-20',
    periodId: 'per-2026-08',
    journalId: 'jrn-pur',
    journalName: 'دفتر يومية المشتريات وفواتير الموردين',
    sourceDocument: 'BILL-2026-0001',
    sourceType: 'vendor_bill',
    reference: 'فاتورة مورد شركة الرواد INV-RAW-9921',
    description: 'إثبات فاتورة المورد شركة الرواد ومطابقتها مع إذن الاستلام المخزني',
    lines: [
      {
        id: 'line-bill-1',
        accountId: 'acc-213',
        accountCode: '213',
        accountName: 'وسيط استلام خامات غير مفوتورة (GR/IR)',
        debit: 100000,
        credit: 0,
        description: 'إقفال حساب وسيط الاستلام المخزني'
      },
      {
        id: 'line-bill-2',
        accountId: 'acc-1141',
        accountCode: '1141',
        accountName: 'ضريبة القيمة المضافة على المدخلات (14%)',
        debit: 14000,
        credit: 0,
        description: 'ضريبة مدخلات قابلة للخصم 14%'
      },
      {
        id: 'line-bill-3',
        accountId: 'acc-2111',
        accountCode: '2111',
        accountName: 'حساب الموردين التجاريين العام المشترك',
        partnerId: 'sup-1',
        partnerType: 'supplier',
        partnerName: 'شركة الرواد لخامات الأثاث',
        debit: 0,
        credit: 114000,
        description: 'استحقاق مالي للمورد شركة الرواد'
      }
    ],
    totalDebit: 114000,
    totalCredit: 114000,
    status: 'posted',
    branchId: 'branch-1',
    branchName: 'المخزن الرئيسي ومصنع العبور',
    createdAt: '2026-08-20 14:00:00',
    createdByUserName: 'أحمد محمود (المالية)',
    postedAt: '2026-08-20 14:00:00',
    postedByUserName: 'أحمد محمود (المالية)'
  },

  // 4. Material Issue to WIP (MDF 70k + Accessories 20k = 90k)
  {
    id: 'je-wip-101',
    entryNumber: 'JE-2026-000104',
    date: '2026-08-22',
    periodId: 'per-2026-08',
    journalId: 'jrn-gen',
    journalName: 'دفتر العمليات العامة والتشغيلية والمخزون',
    sourceDocument: 'PROD-2026-0012',
    sourceType: 'material_issue_wip',
    reference: 'صرف خامات لأمر تصنيع مطبخ PROD-2026-0012',
    description: 'صرف ألواح MDF وإكسسوارات ومفصلات بلوم من المخزن للورشة',
    lines: [
      {
        id: 'line-wip-1',
        accountId: 'acc-1133',
        accountCode: '1133',
        accountName: 'إنتاج تحت التشغيل بورش التصنيع (WIP)',
        costCenterId: 'cc-1',
        costCenterName: 'قسم تقطيع الـ CNC وشريط الشاط',
        debit: 90000,
        credit: 0,
        description: 'تحميل خامات أمر تصنيع مطبخ رويال'
      },
      {
        id: 'line-wip-2',
        accountId: 'acc-1131',
        accountCode: '1131',
        accountName: 'مخزون الخامات والألواح والأخشاب',
        debit: 0,
        credit: 90000,
        description: 'خصم الخامات المنصرفة من رصيد المخزن'
      }
    ],
    totalDebit: 90000,
    totalCredit: 90000,
    status: 'posted',
    branchId: 'branch-1',
    branchName: 'ورشة تصنيع العبور',
    createdAt: '2026-08-22 09:00:00',
    createdByUserName: 'مدير الإنتاج',
    postedAt: '2026-08-22 09:00:00',
    postedByUserName: 'أحمد محمود (المالية)'
  },

  // 5. Direct Labor Allocation to WIP (30,000)
  {
    id: 'je-wip-labor-101',
    entryNumber: 'JE-2026-000105',
    date: '2026-08-24',
    periodId: 'per-2026-08',
    journalId: 'jrn-gen',
    journalName: 'دفتر العمليات العامة والتشغيلية والمخزون',
    sourceDocument: 'PROD-2026-0012',
    sourceType: 'material_issue_wip',
    reference: 'تحميل مصنعيات تصنيع مطبخ رويال',
    description: 'تحميل أجور الفنيين ومصنعية الـ CNC والتشطيب على أمر الشغل',
    lines: [
      {
        id: 'line-wl-1',
        accountId: 'acc-1133',
        accountCode: '1133',
        accountName: 'إنتاج تحت التشغيل بورش التصنيع (WIP)',
        costCenterId: 'cc-2',
        costCenterName: 'قسم التجميع والنجارة اليدوية',
        debit: 30000,
        credit: 0,
        description: 'تحميل مصنعيات عمالة وفنيين على الـ WIP'
      },
      {
        id: 'line-wl-2',
        accountId: 'acc-512',
        accountCode: '512',
        accountName: 'أجور عمالة وفنيين ورش التصنيع المباشرة',
        debit: 0,
        credit: 30000,
        description: 'توزيع تكلفة مصنعيات مباشرة على الإنتاج'
      }
    ],
    totalDebit: 30000,
    totalCredit: 30000,
    status: 'posted',
    branchId: 'branch-1',
    branchName: 'ورشة تصنيع العبور',
    createdAt: '2026-08-24 16:00:00',
    createdByUserName: 'أحمد محمود (المالية)',
    postedAt: '2026-08-24 16:00:00',
    postedByUserName: 'أحمد محمود (المالية)'
  },

  // 6. Monthly Rent Expense Posting (40,000)
  {
    id: 'je-exp-101',
    entryNumber: 'JE-2026-000106',
    date: '2026-08-01',
    periodId: 'per-2026-08',
    journalId: 'jrn-bnk',
    journalName: 'دفتر يومية البنوك والشيكات',
    sourceDocument: 'EXP-2026-001',
    sourceType: 'manual',
    reference: 'سداد إيجار المعرض شهر أغسطس',
    description: 'تحويل بنكي لسداد إيجار مقر معرض القاهرة الرئيسي',
    lines: [
      {
        id: 'line-exp-1',
        accountId: 'acc-531',
        accountCode: '531',
        accountName: 'إيجار مقرات المعارض والمصنع',
        costCenterId: 'cc-5',
        costCenterName: 'معرض القاهرة الرئيسي',
        debit: 40000,
        credit: 0,
        description: 'إيجار شهر أغسطس 2026'
      },
      {
        id: 'line-exp-2',
        accountId: 'acc-11121',
        accountCode: '11121',
        accountName: 'حساب البنك الأهلي المصري (NBE)',
        debit: 0,
        credit: 40000,
        description: 'خصم من حساب البنك الأهلي'
      }
    ],
    totalDebit: 40000,
    totalCredit: 40000,
    status: 'posted',
    branchId: 'branch-1',
    branchName: 'معرض القاهرة الرئيسي',
    createdAt: '2026-08-01 10:00:00',
    createdByUserName: 'أحمد محمود (المالية)',
    postedAt: '2026-08-01 10:00:00',
    postedByUserName: 'أحمد محمود (المالية)'
  }
];
