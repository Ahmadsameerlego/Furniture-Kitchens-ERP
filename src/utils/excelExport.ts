// ====================================================
// REWAQ ERP — EXCEL & CSV EXPORT UTILITIES
// UTF-8 with BOM for 100% Arabic Support in MS Excel
// ====================================================

export interface ExcelColumn<T = any> {
  header: string;
  key?: keyof T | string;
  render?: (row: T) => string | number | boolean;
}

/**
 * Exports data to a CSV/Excel file with UTF-8 BOM so Arabic characters render perfectly in MS Excel.
 */
export const exportToExcel = <T>(
  filename: string,
  columns: ExcelColumn<T>[],
  data: T[]
) => {
  // 1. Create CSV header row
  const headers = columns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');

  // 2. Create data rows
  const rows = data.map(row => {
    return columns.map(col => {
      let val: any = '';
      if (col.render) {
        val = col.render(row);
      } else if (col.key && typeof col.key === 'string' && col.key in (row as any)) {
        val = (row as any)[col.key];
      }

      if (val === null || val === undefined) {
        val = '';
      }

      // Convert to string and escape quotes
      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    }).join(',');
  });

  // 3. Add UTF-8 BOM (\uFEFF) at the start for Microsoft Excel Arabic compatibility
  const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');

  // 4. Create blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const today = new Date().toISOString().substring(0, 10);
  const fullFilename = `${filename}_${today}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', fullFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ====================================================
// SPECIALIZED EXPORTERS FOR ACCOUNTING & INVENTORY
// ====================================================

/**
 * 1. Chart of Accounts Tree Exporter
 */
export const exportChartOfAccountsToExcel = (accounts: any[]) => {
  exportToExcel(
    'شجرة_الحسابات_رواق_ERP',
    [
      { header: 'كود الحساب', render: r => r.code },
      { header: 'اسم الحساب بالعربية', render: r => r.nameAr },
      { header: 'اسم الحساب بالإنجليزية', render: r => r.nameEn || '' },
      { header: 'النوع الرئيسي', render: r => r.type === 'asset' ? 'أصول' : r.type === 'liability' ? 'خصوم' : r.type === 'equity' ? 'حقوق ملكية' : r.type === 'revenue' ? 'إيرادات' : 'مصروفات' },
      { header: 'طبيعة الحساب', render: r => r.nature === 'debit' ? 'مدين' : 'دائن' },
      { header: 'المستوى', render: r => r.level },
      { header: 'يقبل القيد المباشر', render: r => r.allowDirectPosting ? 'نعم (حساب فرعي)' : 'لا (حساب تجميعي رئيسي)' },
      { header: 'يقبل التسوية والمطابقة', render: r => r.isReconciliationTarget ? 'نعم (مطابقة بنكية / عملاء وموردين)' : 'لا' },
      { header: 'الرصيد الدفتري الحالي (EGP)', render: r => Number(r.currentBalance || 0).toLocaleString('ar-EG') },
      { header: 'حالة الحساب', render: r => r.isActive ? 'نشط' : 'معطل' }
    ],
    accounts
  );
};

/**
 * 2. Trial Balance Exporter (ميزان المراجعة بالمجاميع والأرصدة)
 */
export const exportTrialBalanceToExcel = (rows: any[], periodName: string = '') => {
  exportToExcel(
    `ميزان_المراجعة_${periodName || 'العام'}`,
    [
      { header: 'كود الحساب', render: r => r.accountCode || r.code },
      { header: 'اسم الحساب', render: r => r.accountName || r.nameAr },
      { header: 'حركات مدينة (Debit)', render: r => Number(r.debitTotal || r.debit || 0) },
      { header: 'حركات دائنة (Credit)', render: r => Number(r.creditTotal || r.credit || 0) },
      { header: 'رصيد مدين نهائي (Ending Debit)', render: r => Number(r.endingDebit || 0) },
      { header: 'رصيد دائن نهائي (Ending Credit)', render: r => Number(r.endingCredit || 0) },
      { header: 'صافي الرصيد (Net Balance)', render: r => Number(r.netBalance || 0) }
    ],
    rows
  );
};

/**
 * 3. Income Statement Exporter (قائمة الدخل)
 */
export const exportIncomeStatementToExcel = (rows: any[], periodName: string = '') => {
  exportToExcel(
    `قائمة_الدخل_${periodName || 'العام'}`,
    [
      { header: 'البند المالي', render: r => r.category || r.name },
      { header: 'القيمة (EGP)', render: r => Number(r.amount || 0) },
      { header: 'النسبة من إجمالي المبيعات', render: r => r.percentage ? `${r.percentage}%` : '-' },
      { header: 'ملاحظات', render: r => r.notes || '' }
    ],
    rows
  );
};

/**
 * 4. Item Master Catalog Exporter (دليل وكروت الأصناف)
 */
export const exportItemCatalogToExcel = (items: any[]) => {
  exportToExcel(
    'دليل_الأصناف_والخامات_المخزنية',
    [
      { header: 'كود الصنف (SKU)', render: r => r.code },
      { header: 'الباركود الدولي', render: r => r.barcode },
      { header: 'اسم الصنف بالعربية', render: r => r.nameAr },
      { header: 'اسم الصنف بالإنجليزية', render: r => r.nameEn || '' },
      { header: 'التصنيف الرئيسي', render: r => r.categoryNameAr || r.category },
      { header: 'وحدة القياس', render: r => r.unitNameAr || r.unit },
      { header: 'المستودع الافتراضي', render: r => r.defaultWarehouseName || '' },
      { header: 'موقع التخزين (الممر والرف)', render: r => r.locationBin || '' },
      { header: 'الرصيد الفعلي الحالي', render: r => r.currentStock },
      { header: 'الرصيد المحجوز لأوامر شغل', render: r => r.reservedStock },
      { header: 'الرصيد المتاح للصرف', render: r => r.availableStock },
      { header: 'حد الأمان (Safety Stock)', render: r => r.minStockLevel },
      { header: 'حد إعادة الطلب (Reorder Point)', render: r => r.reorderPoint },
      { header: 'متوسط التكلفة المرجحة (WAC EGP)', render: r => r.weightedAvgCost },
      { header: 'سعر آخر شراء (EGP)', render: r => r.lastPurchasePrice || r.weightedAvgCost },
      { header: 'إجمالي تقييم المخزون (EGP)', render: r => (r.currentStock * r.weightedAvgCost).toLocaleString('ar-EG') },
      { header: 'حالة الرصيد', render: r => r.currentStock <= 0 ? 'نفد من المخزن' : r.currentStock <= r.reorderPoint ? 'وصل حد الطلب' : 'رصيد آمن' }
    ],
    items
  );
};

/**
 * 5. Stock Ledger Exporter (كارت الصنف وسجل الحركات)
 */
export const exportStockLedgerToExcel = (itemName: string, entries: any[]) => {
  exportToExcel(
    `كارت_صنف_${itemName.replace(/\s+/g, '_')}`,
    [
      { header: 'التاريخ', render: r => r.date },
      { header: 'نوع المستند', render: r => r.documentType === 'GRN' ? 'إذن إضافة' : r.documentType === 'GIN' ? 'إذن صرف' : r.documentType === 'TRANSFER' ? 'تحويل مخزني' : 'تسوية جردية' },
      { header: 'رقم المستند', render: r => r.documentNumber },
      { header: 'المستودع', render: r => r.warehouseName },
      { header: 'وارد (+)', render: r => r.qtyIn || 0 },
      { header: 'منصرف (-)', render: r => r.qtyOut || 0 },
      { header: 'الرصيد بعد الحركة', render: r => r.balanceAfter },
      { header: 'سعر الوحدة (EGP)', render: r => r.unitCost },
      { header: 'إجمالي القيمة (EGP)', render: r => r.totalCost },
      { header: 'المستخدم المسجل', render: r => r.userName },
      { header: 'ملاحظات الحركة', render: r => r.notes || '' }
    ],
    entries
  );
};

/**
 * 6. Stocktaking Report Exporter (تقرير الجرد الفعلي ومطابقة الفروق)
 */
export const exportStocktakingToExcel = (session: any) => {
  exportToExcel(
    `تقرير_جرد_${session.sessionNumber}`,
    [
      { header: 'كود الصنف', render: (r: any) => r.itemCode },
      { header: 'اسم الصنف', render: (r: any) => r.itemName },
      { header: 'التصنيف', render: (r: any) => r.category },
      { header: 'الوحدة', render: (r: any) => r.unit },
      { header: 'موقع التخزين', render: (r: any) => r.locationBin },
      { header: 'رصيد النظام الدفتري (System Qty)', render: (r: any) => r.systemQty },
      { header: 'الجرد الفعلي على الطبيعة (Counted Qty)', render: (r: any) => r.countedQty },
      { header: 'فرق الكمية (Variance Qty)', render: (r: any) => r.varianceQty },
      { header: 'تكلفة الوحدة (EGP)', render: (r: any) => r.unitCost },
      { header: 'فرق القيمة المالية (EGP)', render: (r: any) => r.varianceAmount },
      { header: 'حالة المطابقة', render: (r: any) => r.varianceQty === 0 ? 'مطابق 100%' : r.varianceQty > 0 ? 'زيادة جردية (+)' : 'عجز جردي (-)' },
      { header: 'ملاحظات الفحص', render: (r: any) => r.notes || '' }
    ],
    session.lines || []
  );
};

/**
 * 7. Journal Entries Exporter (قيود اليومية العامة)
 */
export const exportJournalEntriesToExcel = (entries: any[]) => {
  const flattenedRows: any[] = [];
  entries.forEach(e => {
    (e.lines || []).forEach((line: any, idx: number) => {
      flattenedRows.push({
        entryNumber: e.entryNumber,
        date: e.date,
        journalName: e.journalNameAr || e.journalName,
        reference: e.reference || '',
        description: e.description,
        sourceType: e.sourceType,
        sourceDocument: e.sourceDocument || '',
        status: e.status === 'posted' ? 'مرحل' : 'مسودة',
        lineIndex: idx + 1,
        accountCode: line.accountCode,
        accountName: line.accountName,
        debit: line.debit || 0,
        credit: line.credit || 0,
        costCenterName: line.costCenterName || '',
        lineDescription: line.description || '',
        userName: e.userName || ''
      });
    });
  });

  exportToExcel(
    'دفتر_اليومية_العامة',
    [
      { header: 'رقم القيد', render: r => r.entryNumber },
      { header: 'التاريخ', render: r => r.date },
      { header: 'دفتر اليومية', render: r => r.journalName },
      { header: 'المرجع', render: r => r.reference },
      { header: 'بيان القيد', render: r => r.description },
      { header: 'المستند المرتبط', render: r => r.sourceDocument },
      { header: 'كود الحساب', render: r => r.accountCode },
      { header: 'اسم الحساب', render: r => r.accountName },
      { header: 'مدين (Debit)', render: r => r.debit },
      { header: 'دائن (Credit)', render: r => r.credit },
      { header: 'مركز التكلفة', render: r => r.costCenterName },
      { header: 'شرح السطر', render: r => r.lineDescription },
      { header: 'المستخدم', render: r => r.userName },
      { header: 'حالة القيد', render: r => r.status }
    ],
    flattenedRows
  );
};

/**
 * 8. CRM Customers Master Exporter (تصدير سجل العملاء الشامل)
 */
export const exportCustomersToExcel = (customers: any[]) => {
  exportToExcel(
    'سجل_العملاء_رواق_ERP',
    [
      { header: 'كود العميل', render: r => r.code || r.id },
      { header: 'نوع العميل', render: r => r.customerType === 'commercial' ? 'تجاري / شركات' : 'فردي' },
      { header: 'اسم العميل / الشركة', render: r => r.fullName },
      { header: 'الاسم التجاري للمنشأة', render: r => r.companyName || '' },
      { header: 'الشخص المسؤول / المفوض', render: r => r.contactPerson || '' },
      { header: 'المسمى الوظيفي للمسؤول', render: r => r.contactRole || '' },
      { header: 'الرقم الضريبي', render: r => r.taxId || '' },
      { header: 'السجل التجاري', render: r => r.commercialRegister || '' },
      { header: 'رقم الهاتف الأساسي (WhatsApp)', render: r => r.phone },
      { header: 'رقم الهاتف الإضافي', render: r => r.altPhone || '' },
      { header: 'البريد الإلكتروني', render: r => r.email || '' },
      { header: 'المحافظة / المدينة', render: r => r.city },
      { header: 'المنطقة / الحي', render: r => r.area },
      { header: 'العنوان التفصيلي', render: r => r.address || '' },
      { header: 'نوع الاهتمام', render: r => r.interestType === 'kitchens' || r.interestType === 'custom' ? 'تفصيل وعمولة' : r.interestType === 'furniture' ? 'أثاث جاهز' : 'جاهز + تفصيل' },
      { header: 'حالة العميل (CRM Status)', render: r => r.status },
      { header: 'طريقة الفوترة المفضلة', render: r => r.billingMethod === 'electronic_tax' ? 'فاتورة إلكترونية ضريبية' : r.billingMethod === 'email' ? 'بريد إلكتروني PDF' : r.billingMethod === 'whatsapp' ? 'واتساب رقمي' : 'فاتورة ورقية مطبوعة' },
      { header: 'تصنيف العميل (Tier)', render: r => r.tier === 'vip' ? 'عميل VIP' : r.tier === 'wholesale' ? 'مشروعات / جملة' : 'عادي' },
      { header: 'مصدر الوصول', render: r => r.source },
      { header: 'الحملة الإعلانية', render: r => r.campaignName || '' },
      { header: 'الفرع المسؤول', render: r => r.branchName },
      { header: 'الموظف المسؤول', render: r => r.responsibleUserName || '' },
      { header: 'تاريخ التسجيل', render: r => r.createdDate },
      { header: 'آخر نشاط', render: r => r.lastActivityDate || '' },
      { header: 'إجمالي المشتريات (EGP)', render: r => r.orderAmount || r.quotationAmount || 0 },
      { header: 'ملاحظات العميل', render: r => r.notes || '' }
    ],
    customers
  );
};

/**
 * 9. Download Customer Import Sample CSV Template
 */
export const downloadCustomerImportTemplate = () => {
  const headers = [
    'نوع_العميل(فردي/تجاري)',
    'اسم_العميل',
    'الاسم_التجاري(للشركات)',
    'اسم_المسؤول',
    'رقم_الهاتف',
    'هاتف_إضافي',
    'البريد_الإلكتروني',
    'المدينة',
    'المنطقة',
    'العنوان',
    'نوع_الاهتمام(تفصيل/جاهز/كلاهما)',
    'طريقة_الفوترة(مطبوعة/إيميل/واتساب/ضريبية)',
    'المصدر',
    'ملاحظات'
  ];

  const sampleRows = [
    [
      'فردي',
      'حسام عبد العزيز',
      '',
      '',
      '01012345678',
      '01298765432',
      'hossam@example.com',
      'القاهرة',
      'التجمع الخامس',
      'شارع التسعين الشمالي',
      'تفصيل',
      'واتساب',
      'instagram',
      'مهتم بمطبخ مودرن بولاريس رمادي'
    ],
    [
      'تجاري',
      'شركة النور للتشطيبات',
      'مجموعة النور للهندسة والديكور',
      'م. خالد سليم',
      '01122334455',
      '0224567890',
      'info@alnoor-eg.com',
      'الجيزة',
      'الشيخ زايد',
      'مجمع البنوك مبنى 3',
      'كلاهما',
      'ضريبية',
      'referral',
      'طلب توريد وحدات غرف نوم ومطابخ لمشروع كمبوند'
    ]
  ];

  const csvRows = [
    headers.map(h => `"${h}"`).join(','),
    ...sampleRows.map(row => row.map(val => `"${val}"`).join(','))
  ];

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'نموذج_استيراد_العملاء_رواق_ERP.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 10. Simple Robust CSV String Parser
 */
export const parseCSVContent = (text: string): string[][] => {
  const lines: string[][] = [];
  let row: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  // Normalize line endings and strip BOM
  const cleanedText = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < cleanedText.length; i++) {
    const char = cleanedText[i];
    const nextChar = cleanedText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = '';
    } else if (char === '\n' && !inQuotes) {
      row.push(currentVal.trim());
      if (row.some(val => val.length > 0)) {
        lines.push(row);
      }
      row = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || row.length > 0) {
    row.push(currentVal.trim());
    if (row.some(val => val.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
};
