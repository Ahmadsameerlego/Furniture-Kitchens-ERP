// ====================================================
// REWAQ ERP — ACCOUNTING ENGINE SERVICE
// Financial Backbone & Double-Entry Business Operations
// ====================================================

import {
  Account,
  Journal,
  JournalEntry,
  JournalEntryLine,
  FiscalPeriod,
  SalesInvoice,
  VendorBill,
  CustomerAdvance,
  PDCRecord,
  TrialBalanceItem,
  PartnerStatementRow,
  ProfitAndLossReport,
  BalanceSheetReport
} from '../types/accounting';

export class AccountingService {
  /**
   * Helper to round monetary amounts to 2 decimal places to avoid IEEE-754 drift
   */
  public static round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  /**
   * Validates if journal entry lines are balanced and non-zero
   */
  public static validateBalancedLines(lines: JournalEntryLine[]): { isValid: boolean; totalDebit: number; totalCredit: number; error?: string } {
    if (!lines || lines.length < 2) {
      return { isValid: false, totalDebit: 0, totalCredit: 0, error: 'يجب أن يحتوي القيد على سطرين على الأقل (طرف مدين وطرف دائن).' };
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of lines) {
      const debit = this.round(line.debit || 0);
      const credit = this.round(line.credit || 0);

      if (debit < 0 || credit < 0) {
        return { isValid: false, totalDebit, totalCredit, error: 'لا يمكن إدخال مبالغ سالبة في أطراف القيد.' };
      }

      if (debit === 0 && credit === 0) {
        return { isValid: false, totalDebit, totalCredit, error: 'سطر القيد لا يمكن أن يكون بصفر في الطرفين.' };
      }

      totalDebit += debit;
      totalCredit += credit;
    }

    totalDebit = this.round(totalDebit);
    totalCredit = this.round(totalCredit);

    const diff = Math.abs(totalDebit - totalCredit);
    if (diff > 0.001) {
      return {
        isValid: false,
        totalDebit,
        totalCredit,
        error: `القيد غير متوازن محاسبياً! إجمالي المدين (${totalDebit.toLocaleString('ar-EG')} ج.م) لا يساوي إجمالي الدائن (${totalCredit.toLocaleString('ar-EG')} ج.م). الفارق: ${diff}`
      };
    }

    return { isValid: true, totalDebit, totalCredit };
  }

  /**
   * Generates a unique Journal Entry Number
   */
  public static generateEntryNumber(prefix = 'JE-2026-'): string {
    const randomSeq = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}${randomSeq}`;
  }

  /**
   * Creates an immutable posted Journal Entry
   */
  public static createPostedEntry(
    data: {
      journal: Journal;
      date: string;
      periodId: string;
      reference: string;
      description: string;
      sourceDocument?: string;
      sourceType: JournalEntry['sourceType'];
      branchId?: string;
      branchName?: string;
      lines: Omit<JournalEntryLine, 'id'>[];
      userName: string;
    },
    periods: FiscalPeriod[]
  ): { entry?: JournalEntry; error?: string } {
    // Check if period is closed
    const period = periods.find(p => p.id === data.periodId);
    if (period && period.isClosed) {
      return { error: `الفترة المحاسبية (${period.name}) مغلقة ومعتمدة. لا يمكن الترحيل إليها بدون صلاحيات إدارية.` };
    }

    const linesWithIds: JournalEntryLine[] = data.lines.map((l, index) => ({
      ...l,
      id: `line-${Date.now()}-${index}`,
      debit: this.round(l.debit || 0),
      credit: this.round(l.credit || 0)
    }));

    const validation = this.validateBalancedLines(linesWithIds);
    if (!validation.isValid) {
      return { error: validation.error };
    }

    const entry: JournalEntry = {
      id: `je-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      entryNumber: this.generateEntryNumber(data.journal.sequencePrefix || 'JE-2026-'),
      date: data.date,
      periodId: data.periodId,
      journalId: data.journal.id,
      journalName: data.journal.nameAr,
      reference: data.reference,
      description: data.description,
      sourceDocument: data.sourceDocument,
      sourceType: data.sourceType,
      lines: linesWithIds,
      totalDebit: validation.totalDebit,
      totalCredit: validation.totalCredit,
      status: 'posted',
      branchId: data.branchId || 'branch-1',
      branchName: data.branchName || 'معرض ومصنع القاهرة الرئيسي',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      createdByUserName: data.userName,
      postedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      postedByUserName: data.userName
    };

    return { entry };
  }

  /**
   * Reverses an existing posted entry by generating an inverse entry
   */
  public static reverseEntry(
    originalEntry: JournalEntry,
    reason: string,
    userName: string,
    periodId: string,
    periods: FiscalPeriod[]
  ): { reversedOriginal: JournalEntry; reversalEntry: JournalEntry; error?: string } {
    if (originalEntry.status !== 'posted') {
      return { error: 'لا يمكن عكس قيد غير مرحل.', reversedOriginal: originalEntry, reversalEntry: originalEntry };
    }

    const period = periods.find(p => p.id === periodId);
    if (period && period.isClosed) {
      return { error: `الفترة المحاسبية (${period.name}) مغلقة. لا يمكن ترحيل القيد العكسي فيها.`, reversedOriginal: originalEntry, reversalEntry: originalEntry };
    }

    // Invert lines: Debit becomes Credit, Credit becomes Debit
    const invertedLines: JournalEntryLine[] = originalEntry.lines.map((line, index) => ({
      ...line,
      id: `rev-line-${Date.now()}-${index}`,
      debit: line.credit,
      credit: line.debit,
      description: `[قيد عكسي] ${line.description}`
    }));

    const reversalId = `je-rev-${Date.now()}`;
    const reversalEntry: JournalEntry = {
      id: reversalId,
      entryNumber: this.generateEntryNumber('REV-2026-'),
      date: new Date().toISOString().substring(0, 10),
      periodId,
      journalId: originalEntry.journalId,
      journalName: originalEntry.journalName,
      sourceDocument: originalEntry.entryNumber,
      sourceType: 'reversal',
      reference: `عكس القيد ${originalEntry.entryNumber}`,
      description: `قيد عكسي لتسوية: ${reason} (القيد الأصلي: ${originalEntry.entryNumber})`,
      lines: invertedLines,
      totalDebit: originalEntry.totalCredit,
      totalCredit: originalEntry.totalDebit,
      status: 'posted',
      reversedFromEntryId: originalEntry.id,
      branchId: originalEntry.branchId,
      branchName: originalEntry.branchName,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      createdByUserName: userName,
      postedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      postedByUserName: userName
    };

    const reversedOriginal: JournalEntry = {
      ...originalEntry,
      status: 'reversed',
      reversalEntryId: reversalId
    };

    return { reversedOriginal, reversalEntry };
  }

  // ====================================================
  // FINANCIAL REPORTS CALCULATION ENGINE
  // ====================================================

  /**
   * Generates a balanced Trial Balance (ميزان المراجعة)
   */
  public static calculateTrialBalance(
    accounts: Account[],
    entries: JournalEntry[],
    periodId?: string
  ): { items: TrialBalanceItem[]; totalDebit: number; totalCredit: number; isBalanced: boolean } {
    const postedEntries = entries.filter(e => e.status === 'posted' && (!periodId || periodId === 'all' || e.periodId === periodId));

    let totalDebitSum = 0;
    let totalCreditSum = 0;

    const items: TrialBalanceItem[] = accounts.map(acc => {
      let initialDebit = acc.openingBalanceDebit || 0;
      let initialCredit = acc.openingBalanceCredit || 0;

      let periodDebit = 0;
      let periodCredit = 0;

      for (const entry of postedEntries) {
        for (const line of entry.lines) {
          if (line.accountId === acc.id || line.accountCode === acc.code) {
            periodDebit += line.debit || 0;
            periodCredit += line.credit || 0;
          }
        }
      }

      periodDebit = this.round(periodDebit);
      periodCredit = this.round(periodCredit);

      // Ending Balance logic depending on account type nature
      const netChange = (initialDebit + periodDebit) - (initialCredit + periodCredit);
      let endingDebit = 0;
      let endingCredit = 0;

      if (['asset', 'cogs', 'expense'].includes(acc.type)) {
        if (netChange >= 0) endingDebit = netChange;
        else endingCredit = Math.abs(netChange);
      } else {
        // Liabilities, Equity, Revenue naturally Credit
        if (netChange <= 0) endingCredit = Math.abs(netChange);
        else endingDebit = netChange;
      }

      endingDebit = this.round(endingDebit);
      endingCredit = this.round(endingCredit);

      totalDebitSum += endingDebit;
      totalCreditSum += endingCredit;

      return {
        accountId: acc.id,
        accountCode: acc.code,
        accountNameAr: acc.nameAr,
        accountType: acc.type,
        level: acc.level,
        initialDebit,
        initialCredit,
        periodDebit,
        periodCredit,
        endingDebit,
        endingCredit
      };
    });

    totalDebitSum = this.round(totalDebitSum);
    totalCreditSum = this.round(totalCreditSum);

    const isBalanced = Math.abs(totalDebitSum - totalCreditSum) < 0.01;

    return { items, totalDebit: totalDebitSum, totalCredit: totalCreditSum, isBalanced };
  }

  /**
   * Generates Profit & Loss Statement (قائمة الدخل والأرباح والخسائر)
   */
  public static calculateProfitAndLoss(
    accounts: Account[],
    entries: JournalEntry[],
    periodId?: string
  ): ProfitAndLossReport {
    const trialBalance = this.calculateTrialBalance(accounts, entries, periodId).items;

    const revenueAccounts: { code: string; name: string; amount: number }[] = [];
    let totalRevenue = 0;

    const cogsAccounts: { code: string; name: string; amount: number }[] = [];
    let totalCOGS = 0;

    const expenseAccounts: { code: string; name: string; amount: number }[] = [];
    let totalExpenses = 0;

    for (const item of trialBalance) {
      if (item.accountType === 'revenue') {
        const net = item.endingCredit - item.endingDebit;
        if (net > 0 || item.level === 2) {
          revenueAccounts.push({ code: item.accountCode, name: item.accountNameAr, amount: net });
          totalRevenue += net;
        }
      } else if (item.accountType === 'cogs') {
        const net = item.endingDebit - item.endingCredit;
        if (net > 0 || item.level === 2) {
          cogsAccounts.push({ code: item.accountCode, name: item.accountNameAr, amount: net });
          totalCOGS += net;
        }
      } else if (item.accountType === 'expense') {
        const net = item.endingDebit - item.endingCredit;
        if (net > 0 || item.level === 2) {
          expenseAccounts.push({ code: item.accountCode, name: item.accountNameAr, amount: net });
          totalExpenses += net;
        }
      }
    }

    totalRevenue = this.round(totalRevenue);
    totalCOGS = this.round(totalCOGS);
    totalExpenses = this.round(totalExpenses);

    const grossProfit = this.round(totalRevenue - totalCOGS);
    const grossProfitMargin = totalRevenue > 0 ? this.round((grossProfit / totalRevenue) * 100) : 0;

    const netProfit = this.round(grossProfit - totalExpenses);
    const netProfitMargin = totalRevenue > 0 ? this.round((netProfit / totalRevenue) * 100) : 0;

    return {
      revenueAccounts,
      totalRevenue,
      cogsAccounts,
      totalCOGS,
      grossProfit,
      grossProfitMargin,
      expenseAccounts,
      totalExpenses,
      netProfit,
      netProfitMargin
    };
  }

  /**
   * Generates Balance Sheet (الميزانية العمومية والمركز المالي)
   */
  public static calculateBalanceSheet(
    accounts: Account[],
    entries: JournalEntry[],
    periodId?: string
  ): BalanceSheetReport {
    const trialBalance = this.calculateTrialBalance(accounts, entries, periodId).items;
    const pnl = this.calculateProfitAndLoss(accounts, entries, periodId);

    const currentAssets: { code: string; name: string; amount: number }[] = [];
    let totalCurrentAssets = 0;

    const nonCurrentAssets: { code: string; name: string; amount: number }[] = [];
    let totalNonCurrentAssets = 0;

    const currentLiabilities: { code: string; name: string; amount: number }[] = [];
    let totalCurrentLiabilities = 0;

    const longTermLiabilities: { code: string; name: string; amount: number }[] = [];
    let totalLongTermLiabilities = 0;

    const equityAccounts: { code: string; name: string; amount: number }[] = [];
    let totalEquity = 0;

    for (const item of trialBalance) {
      if (item.accountType === 'asset') {
        const val = item.endingDebit - item.endingCredit;
        if (item.accountCode.startsWith('15')) {
          nonCurrentAssets.push({ code: item.accountCode, name: item.accountNameAr, amount: val });
          totalNonCurrentAssets += val;
        } else {
          currentAssets.push({ code: item.accountCode, name: item.accountNameAr, amount: val });
          totalCurrentAssets += val;
        }
      } else if (item.accountType === 'liability') {
        const val = item.endingCredit - item.endingDebit;
        currentLiabilities.push({ code: item.accountCode, name: item.accountNameAr, amount: val });
        totalCurrentLiabilities += val;
      } else if (item.accountType === 'equity') {
        if (item.accountCode === '3300') continue; // Will be assigned from current P&L
        const val = item.endingCredit - item.endingDebit;
        equityAccounts.push({ code: item.accountCode, name: item.accountNameAr, amount: val });
        totalEquity += val;
      }
    }

    const currentYearEarnings = pnl.netProfit;
    totalEquity = this.round(totalEquity + currentYearEarnings);

    const totalAssets = this.round(totalCurrentAssets + totalNonCurrentAssets);
    const totalLiabilities = this.round(totalCurrentLiabilities + totalLongTermLiabilities);
    const totalLiabilitiesAndEquity = this.round(totalLiabilities + totalEquity);

    const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 1.0;

    return {
      currentAssets,
      totalCurrentAssets,
      nonCurrentAssets,
      totalNonCurrentAssets,
      totalAssets,
      currentLiabilities,
      totalCurrentLiabilities,
      longTermLiabilities,
      totalLongTermLiabilities,
      totalLiabilities,
      equityAccounts,
      currentYearEarnings,
      totalEquity,
      totalLiabilitiesAndEquity,
      isBalanced
    };
  }

  /**
   * Generates Partner Statement of Account (كشف حساب عميل أو مورد مفصل)
   */
  public static getPartnerStatement(
    partnerId: string,
    partnerType: 'customer' | 'supplier',
    entries: JournalEntry[]
  ): { rows: PartnerStatementRow[]; totalDebit: number; totalCredit: number; endingBalance: number } {
    const postedEntries = entries.filter(e => e.status === 'posted');
    const rows: PartnerStatementRow[] = [];

    let runningBalance = 0;
    let totalDebit = 0;
    let totalCredit = 0;

    for (const entry of postedEntries) {
      for (const line of entry.lines) {
        if (line.partnerId === partnerId || (line.partnerType === partnerType && line.partnerName?.includes(partnerId))) {
          const debit = line.debit || 0;
          const credit = line.credit || 0;

          if (partnerType === 'customer') {
            // AR: Debit increases balance owed by customer, Credit reduces it
            runningBalance += (debit - credit);
          } else {
            // AP: Credit increases balance owed to supplier, Debit reduces it
            runningBalance += (credit - debit);
          }

          totalDebit += debit;
          totalCredit += credit;

          rows.push({
            date: entry.date,
            documentNumber: entry.sourceDocument || entry.entryNumber,
            documentType: entry.journalName,
            description: line.description || entry.description,
            debit,
            credit,
            runningBalance: this.round(runningBalance)
          });
        }
      }
    }

    return {
      rows,
      totalDebit: this.round(totalDebit),
      totalCredit: this.round(totalCredit),
      endingBalance: this.round(runningBalance)
    };
  }
}
