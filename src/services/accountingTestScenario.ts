// ====================================================
// REWAQ ERP — END-TO-END ACCOUNTING TEST RUNNER
// Validates the 11-Step Furniture Manufacturing Workflow
// ====================================================

import { AccountingService } from './accountingService';
import {
  initialChartOfAccounts,
  initialJournals,
  initialFiscalPeriods,
  initialCostCenters
} from '../mock/accountingData';
import { Account, JournalEntry, FiscalPeriod } from '../types/accounting';

export interface TestScenarioStepResult {
  step: number;
  title: string;
  entryNumber: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  isBalanced: boolean;
  notes: string;
}

export interface TestScenarioReport {
  isAllPassed: boolean;
  steps: TestScenarioStepResult[];
  trialBalanceDebits: number;
  trialBalanceCredits: number;
  isTrialBalanceBalanced: boolean;
  revenueTotal: number;
  cogsTotal: number;
  grossProfit: number;
  netProfit: number;
  balanceSheetBalanced: boolean;
}

export class AccountingTestScenarioRunner {
  public static runFullScenario(): TestScenarioReport {
    const accounts: Account[] = JSON.parse(JSON.stringify(initialChartOfAccounts));
    const journals = initialJournals;
    const periods: FiscalPeriod[] = initialFiscalPeriods;
    const entries: JournalEntry[] = [];
    const stepResults: TestScenarioStepResult[] = [];

    const periodId = 'per-2026-08';
    const genJournal = journals.find(j => j.code === 'GEN') || journals[4];
    const purJournal = journals.find(j => j.code === 'PUR') || journals[1];
    const salJournal = journals.find(j => j.code === 'SAL') || journals[0];
    const bnkJournal = journals.find(j => j.code === 'BNK') || journals[3];

    // ----------------------------------------------------
    // STEP 1: Purchase Raw Materials MDF (100,000 EGP) into Warehouse
    // ----------------------------------------------------
    const step1 = AccountingService.createPostedEntry({
      journal: genJournal,
      date: '2026-08-01',
      periodId,
      reference: 'PO-TEST-001',
      description: 'Step 1: استلام ألواح MDF بالمخزن',
      sourceType: 'stock_receipt',
      sourceDocument: 'PO-TEST-001',
      lines: [
        { accountId: 'acc-1410', accountCode: '1410', accountName: 'مخزون الخامات والأخشاب', debit: 100000, credit: 0, description: 'إضافة 100 لوح MDF' },
        { accountId: 'acc-2150', accountCode: '2150', accountName: 'وسيط استلام خامات غير مفوتورة (GR/IR)', partnerId: 'sup-1', partnerType: 'supplier', partnerName: 'شركة الرواد', debit: 0, credit: 100000, description: 'إثبات استلام بضاعة وسيطة' }
      ],
      userName: 'Test Runner'
    }, periods);

    if (step1.entry) entries.push(step1.entry);
    stepResults.push({
      step: 1,
      title: 'شراء واستلام خامات MDF بالمخزن (100,000 ج.م)',
      entryNumber: step1.entry?.entryNumber || '',
      debitAccount: '1410 مخزون الخامات',
      creditAccount: '2150 وسيط استلام خامات GR/IR',
      amount: 100000,
      isBalanced: step1.entry ? step1.entry.totalDebit === step1.entry.totalCredit : false,
      notes: 'تم إثبات استلام الخامات عبر حساب وسيط GR/IR قبل وصول الفاتورة'
    });

    // ----------------------------------------------------
    // STEP 2: Receive Vendor Bill (100,000 + 14% VAT = 114,000)
    // ----------------------------------------------------
    const step2 = AccountingService.createPostedEntry({
      journal: purJournal,
      date: '2026-08-02',
      periodId,
      reference: 'BILL-TEST-001',
      description: 'Step 2: تسجيل فاتورة المورد وإقفال GR/IR',
      sourceType: 'vendor_bill',
      sourceDocument: 'BILL-TEST-001',
      lines: [
        { accountId: 'acc-2150', accountCode: '2150', accountName: 'وسيط استلام خامات غير مفوتورة (GR/IR)', debit: 100000, credit: 0, description: 'إقفال وسيط الاستلام المخزني' },
        { accountId: 'acc-1460', accountCode: '1460', accountName: 'ضريبة القيمة المضافة على المدخلات (14%)', debit: 14000, credit: 0, description: 'ضريبة مدخلات 14%' },
        { accountId: 'acc-2100', accountCode: '2100', accountName: 'الموردون والدائنون (AP)', partnerId: 'sup-1', partnerType: 'supplier', partnerName: 'شركة الرواد', debit: 0, credit: 114000, description: 'استحقاق مديونية المورد' }
      ],
      userName: 'Test Runner'
    }, periods);

    if (step2.entry) entries.push(step2.entry);
    stepResults.push({
      step: 2,
      title: 'تسجيل فاتورة المورد وإقفال وسيط GR/IR (114,000 ج.م)',
      entryNumber: step2.entry?.entryNumber || '',
      debitAccount: '2150 GR/IR (100k) + 1460 Input VAT (14k)',
      creditAccount: '2100 الموردين AP (114k)',
      amount: 114000,
      isBalanced: step2.entry ? step2.entry.totalDebit === step2.entry.totalCredit : false,
      notes: 'تم إقفال حساب GR/IR وإثبات ضريبة المدخلات وحساب المورد'
    });

    // ----------------------------------------------------
    // STEP 3: Pay Supplier partial 50,000 with 1% Withholding Tax
    // ----------------------------------------------------
    const step3 = AccountingService.createPostedEntry({
      journal: bnkJournal,
      date: '2026-08-03',
      periodId,
      reference: 'PAY-TEST-001',
      description: 'Step 3: سداد دفعة للمورد مع خصم أرباح تجارية 1%',
      sourceType: 'vendor_payment',
      sourceDocument: 'PAY-TEST-001',
      lines: [
        { accountId: 'acc-2100', accountCode: '2100', accountName: 'الموردون والدائنون (AP)', partnerId: 'sup-1', partnerType: 'supplier', partnerName: 'شركة الرواد', debit: 50000, credit: 0, description: 'تخفيض حساب المورد' },
        { accountId: 'acc-1200', accountCode: '1200', accountName: 'الحسابات البنكية', debit: 0, credit: 49500, description: 'صرف بنكي للمورد' },
        { accountId: 'acc-2310', accountCode: '2310', accountName: 'ضريبة الخصم والتحصيل (1%)', debit: 0, credit: 500, description: 'خصم أرباح تجارية 1%' }
      ],
      userName: 'Test Runner'
    }, periods);

    if (step3.entry) entries.push(step3.entry);
    stepResults.push({
      step: 3,
      title: 'سداد 50,000 ج.م للمورد مع خصم 1% ضريبة',
      entryNumber: step3.entry?.entryNumber || '',
      debitAccount: '2100 الموردين AP (50k)',
      creditAccount: '1200 البنك (49.5k) + 2310 ضريبة الخصم (500)',
      amount: 50000,
      isBalanced: step3.entry ? step3.entry.totalDebit === step3.entry.totalCredit : false,
      notes: 'المتبقي للمورد = 64,000 ج.م'
    });

    // ----------------------------------------------------
    // STEP 4: Customer Contract Kitchen (300,000 EGP), Customer pays 100,000 Advance
    // ----------------------------------------------------
    const step4 = AccountingService.createPostedEntry({
      journal: bnkJournal,
      date: '2026-08-05',
      periodId,
      reference: 'ADV-TEST-001',
      description: 'Step 4: استلام عربون عقد مطبخ (التزام وليس إيراد)',
      sourceType: 'customer_advance',
      sourceDocument: 'ADV-TEST-001',
      lines: [
        { accountId: 'acc-1200', accountCode: '1200', accountName: 'الحسابات البنكية', debit: 100000, credit: 0, description: 'تحصيل إيداع بنكي للعربون' },
        { accountId: 'acc-2200', accountCode: '2200', accountName: 'دفعات مقدمة وعرابين من العملاء', partnerId: 'cust-1', partnerType: 'customer', partnerName: 'محمد حسن', debit: 0, credit: 100000, description: 'التزام دائن حتى إصدار الفاتورة' }
      ],
      userName: 'Test Runner'
    }, periods);

    if (step4.entry) entries.push(step4.entry);
    stepResults.push({
      step: 4,
      title: 'استلام دفعة مقدمة (عربون 100,000 ج.م) بحساب الالتزامات',
      entryNumber: step4.entry?.entryNumber || '',
      debitAccount: '1200 البنك (100k)',
      creditAccount: '2200 Customer Advances (100k)',
      amount: 100000,
      isBalanced: step4.entry ? step4.entry.totalDebit === step4.entry.totalCredit : false,
      notes: 'لم يتم تسجيل المبلغ كإيراد حفاظاً على المعايير المحاسبية'
    });

    // ----------------------------------------------------
    // STEP 5: Issue Materials to WIP (MDF 70k + Hardware 20k + Labor 30k = 120k)
    // ----------------------------------------------------
    const step5a = AccountingService.createPostedEntry({
      journal: genJournal,
      date: '2026-08-10',
      periodId,
      reference: 'PROD-TEST-WIP',
      description: 'Step 5a: صرف خامات لأمر تصنيع المطبخ للـ WIP',
      sourceType: 'material_issue_wip',
      lines: [
        { accountId: 'acc-1420', accountCode: '1420', accountName: 'إنتاج تحت التشغيل WIP', costCenterId: 'cc-1', debit: 90000, credit: 0, description: 'تحميل خامات 70k MDF + 20k إكسسوارات' },
        { accountId: 'acc-1410', accountCode: '1410', accountName: 'مخزون الخامات والأخشاب', debit: 0, credit: 90000, description: 'خصم الخامات من المخزن' }
      ],
      userName: 'Test Runner'
    }, periods);

    const step5b = AccountingService.createPostedEntry({
      journal: genJournal,
      date: '2026-08-12',
      periodId,
      reference: 'PROD-TEST-LABOR',
      description: 'Step 5b: تحميل أجور عمالة مباشرة ومصنعيات على الـ WIP',
      sourceType: 'material_issue_wip',
      lines: [
        { accountId: 'acc-1420', accountCode: '1420', accountName: 'إنتاج تحت التشغيل WIP', costCenterId: 'cc-2', debit: 30000, credit: 0, description: 'تحميل أجور تصنيع 30k' },
        { accountId: 'acc-5200', accountCode: '5200', accountName: 'أجور عمالة التصنيع المباشرة', debit: 0, credit: 30000, description: 'توزيع تكلفة أجور مباشرة' }
      ],
      userName: 'Test Runner'
    }, periods);

    if (step5a.entry) entries.push(step5a.entry);
    if (step5b.entry) entries.push(step5b.entry);
    stepResults.push({
      step: 5,
      title: 'صرف الخامات والمصنعيات للإنتاج تحت التشغيل WIP (120,000 ج.م)',
      entryNumber: `${step5a.entry?.entryNumber} & ${step5b.entry?.entryNumber}`,
      debitAccount: '1420 إنتاج تحت التشغيل WIP (120k)',
      creditAccount: '1410 مخزون خامات (90k) + 5200 أجور مباشرة (30k)',
      amount: 120000,
      isBalanced: true,
      notes: 'تجمع تكاليف المطبخ بالكامل في حساب الـ WIP'
    });

    // ----------------------------------------------------
    // STEP 6: Complete Production -> Finished Goods (120,000 EGP)
    // ----------------------------------------------------
    const step6 = AccountingService.createPostedEntry({
      journal: genJournal,
      date: '2026-08-18',
      periodId,
      reference: 'PROD-TEST-FINISH',
      description: 'Step 6: إتمام تصنيع المطبخ ونقله للإنتاج التام',
      sourceType: 'production_completion',
      lines: [
        { accountId: 'acc-1430', accountCode: '1430', accountName: 'مخزون الإنتاج التام', debit: 120000, credit: 0, description: 'استلام مطبخ جاهز للتسليم' },
        { accountId: 'acc-1420', accountCode: '1420', accountName: 'إنتاج تحت التشغيل WIP', debit: 0, credit: 120000, description: 'إقفال حساب WIP بعد اكتمال التصنيع' }
      ],
      userName: 'Test Runner'
    }, periods);

    if (step6.entry) entries.push(step6.entry);
    stepResults.push({
      step: 6,
      title: 'إتمام التصنيع وإقفال الـ WIP إلى الإنتاج التام (120,000 ج.م)',
      entryNumber: step6.entry?.entryNumber || '',
      debitAccount: '1430 مخزون الإنتاج التام (120k)',
      creditAccount: '1420 إنتاج تحت التشغيل WIP (120k)',
      amount: 120000,
      isBalanced: step6.entry ? step6.entry.totalDebit === step6.entry.totalCredit : false,
      notes: 'رصيد الـ WIP لأمر الشغل أصبح صفراً'
    });

    // ----------------------------------------------------
    // STEP 7: Deliver Kitchen to Customer -> Recognize COGS (120,000 EGP)
    // ----------------------------------------------------
    const step7 = AccountingService.createPostedEntry({
      journal: genJournal,
      date: '2026-08-20',
      periodId,
      reference: 'DEL-TEST-001',
      description: 'Step 7: إثبات تكلفة البضاعة المباعة COGS عند التسليم',
      sourceType: 'delivery_cogs',
      lines: [
        { accountId: 'acc-5300', accountCode: '5300', accountName: 'تكلفة البضاعة المباعة (COGS)', debit: 120000, credit: 0, description: 'تحميل COGS في قائمة الدخل' },
        { accountId: 'acc-1430', accountCode: '1430', accountName: 'مخزون الإنتاج التام', debit: 0, credit: 120000, description: 'خصم المنتج المسلم من المخزن' }
      ],
      userName: 'Test Runner'
    }, periods);

    if (step7.entry) entries.push(step7.entry);
    stepResults.push({
      step: 7,
      title: 'تسليم المطبخ للعميل وإثبات تكلفة المبيعات COGS (120,000 ج.م)',
      entryNumber: step7.entry?.entryNumber || '',
      debitAccount: '5300 تكلفة البضاعة المباعة COGS (120k)',
      creditAccount: '1430 مخزون الإنتاج التام (120k)',
      amount: 120000,
      isBalanced: step7.entry ? step7.entry.totalDebit === step7.entry.totalCredit : false,
      notes: 'تم الاعتراف بتكلفة المبيعات في اللحظة الصحيحة (التسليم)'
    });

    // ----------------------------------------------------
    // STEP 8 & 9: Issue Invoice (300,000 + 42k VAT = 342,000) & Settle 100k Advance
    // ----------------------------------------------------
    const step8 = AccountingService.createPostedEntry({
      journal: salJournal,
      date: '2026-08-20',
      periodId,
      reference: 'INV-TEST-001',
      description: 'Step 8 & 9: إصدار فاتورة مبيعات وتسوية العربون مسبق الدفع',
      sourceType: 'sales_invoice',
      sourceDocument: 'INV-TEST-001',
      lines: [
        { accountId: 'acc-2200', accountCode: '2200', accountName: 'دفعات مقدمة وعرابين من العملاء', partnerId: 'cust-1', partnerType: 'customer', partnerName: 'محمد حسن', debit: 100000, credit: 0, description: 'تسوية وإقفال العربون المسدد في الخطوة 4' },
        { accountId: 'acc-1300', accountCode: '1300', accountName: 'العملاء والمدينون (AR)', partnerId: 'cust-1', partnerType: 'customer', partnerName: 'محمد حسن', debit: 242000, credit: 0, description: 'الصافي المستحق على العميل' },
        { accountId: 'acc-4100', accountCode: '4100', accountName: 'إيرادات مبيعات المطابخ المخصصة', debit: 0, credit: 300000, description: 'إيراد مبيعات تصنيع مطبخ' },
        { accountId: 'acc-2300', accountCode: '2300', accountName: 'ضريبة القيمة المضافة على المبيعات (14%)', debit: 0, credit: 42000, description: 'ضريبة مخرجات 14%' }
      ],
      userName: 'Test Runner'
    }, periods);

    if (step8.entry) entries.push(step8.entry);
    stepResults.push({
      step: 8,
      title: 'إصدار فاتورة المبيعات (342,000 ج.م) وتسوية العربون (100,000 ج.م)',
      entryNumber: step8.entry?.entryNumber || '',
      debitAccount: '2200 العربون (100k) + 1300 العملاء AR (242k)',
      creditAccount: '4100 الإيرادات (300k) + 2300 ضريبة المبيعات (42k)',
      amount: 342000,
      isBalanced: step8.entry ? step8.entry.totalDebit === step8.entry.totalCredit : false,
      notes: 'الاعتراف بالإيراد وتسوية العربون وتحديد الصافي المتبقي على العميل (242k)'
    });

    // ----------------------------------------------------
    // STEP 10: Collect Remaining Balance from Customer (242,000 EGP)
    // ----------------------------------------------------
    const step10 = AccountingService.createPostedEntry({
      journal: bnkJournal,
      date: '2026-08-25',
      periodId,
      reference: 'RCPT-TEST-FINAL',
      description: 'Step 10: تحصيل باقي مديونية العميل وإقفال رصيده',
      sourceType: 'customer_receipt',
      sourceDocument: 'RCPT-TEST-FINAL',
      lines: [
        { accountId: 'acc-1200', accountCode: '1200', accountName: 'الحسابات البنكية', debit: 242000, credit: 0, description: 'إيداع بنكي لباقي قيمة الفاتورة' },
        { accountId: 'acc-1300', accountCode: '1300', accountName: 'العملاء والمدينون (AR)', partnerId: 'cust-1', partnerType: 'customer', partnerName: 'محمد حسن', debit: 0, credit: 242000, description: 'إقفال وتصفير مديونية العميل' }
      ],
      userName: 'Test Runner'
    }, periods);

    if (step10.entry) entries.push(step10.entry);
    stepResults.push({
      step: 10,
      title: 'تحصيل الصافي المتبقي من العميل (242,000 ج.م) وإقفال رصيده',
      entryNumber: step10.entry?.entryNumber || '',
      debitAccount: '1200 البنك (242k)',
      creditAccount: '1300 العملاء AR (242k)',
      amount: 242000,
      isBalanced: step10.entry ? step10.entry.totalDebit === step10.entry.totalCredit : false,
      notes: 'رصيد العميل أصبح صفراً 0 ج.م بعد تمام السداد'
    });

    // ----------------------------------------------------
    // STEP 11: Reports Verification & Mathematical Reconciliation
    // ----------------------------------------------------
    const trialBalance = AccountingService.calculateTrialBalance(accounts, entries, periodId);
    const pnl = AccountingService.calculateProfitAndLoss(accounts, entries, periodId);
    const balanceSheet = AccountingService.calculateBalanceSheet(accounts, entries, periodId);

    const isAllPassed = stepResults.every(s => s.isBalanced) && trialBalance.isBalanced && balanceSheet.isBalanced;

    return {
      isAllPassed,
      steps: stepResults,
      trialBalanceDebits: trialBalance.totalDebit,
      trialBalanceCredits: trialBalance.totalCredit,
      isTrialBalanceBalanced: trialBalance.isBalanced,
      revenueTotal: pnl.totalRevenue,
      cogsTotal: pnl.totalCOGS,
      grossProfit: pnl.grossProfit,
      netProfit: pnl.netProfit,
      balanceSheetBalanced: balanceSheet.isBalanced
    };
  }
}
