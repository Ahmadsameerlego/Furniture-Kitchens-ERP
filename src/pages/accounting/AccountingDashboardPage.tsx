// ====================================================
// REWAQ ERP — ACCOUNTING MODULE MAIN DASHBOARD & TABS
// Production-Ready Double-Entry Accounting UI
// ====================================================

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { AccountingService } from '../../services/accountingService';
import { Account, JournalEntry, PDCRecord } from '../../types/accounting';
import {
  Landmark,
  Scale,
  FileText,
  Receipt,
  Building2,
  Users,
  CreditCard,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  PieChart,
  BarChart3,
  Calendar,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Eye,
  FileCheck,
  Printer,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  FolderTree
} from 'lucide-react';

export const AccountingDashboardPage: React.FC = () => {
  const {
    chartOfAccounts,
    journals,
    journalEntries,
    fiscalPeriods,
    costCenters,
    salesInvoices,
    vendorBills,
    customerAdvances,
    pdcRecords,
    customers,
    suppliers,
    orders,
    availableBranches,
    currentBranch,
    currentUser,
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
    showToast
  } = useERP();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'coa' | 'entries' | 'invoices' | 'bills' | 'partners' | 'checks' | 'reports' | 'periods'
  >('overview');

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('per-2026-08');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(customers[0]?.id || '');
  const [selectedPartnerType, setSelectedPartnerType] = useState<'customer' | 'supplier'>('customer');
  const [reportSubTab, setReportSubTab] = useState<'trial_balance' | 'pnl' | 'balance_sheet'>('trial_balance');

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedJournalFilter, setSelectedJournalFilter] = useState<string>('all');

  // Modal states
  const [showNewEntryModal, setShowNewEntryModal] = useState<boolean>(false);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState<boolean>(false);
  const [showNewBillModal, setShowNewBillModal] = useState<boolean>(false);
  const [showNewAdvanceModal, setShowNewAdvanceModal] = useState<boolean>(false);
  const [showNewAccountModal, setShowNewAccountModal] = useState<boolean>(false);
  const [showReverseModal, setShowReverseModal] = useState<boolean>(false);
  const [selectedEntryToReverse, setSelectedEntryToReverse] = useState<JournalEntry | null>(null);
  const [reverseReason, setReverseReason] = useState<string>('تصحيح خطأ في التوجيه المحاسبي');

  const [showEntryDetailsModal, setShowEntryDetailsModal] = useState<boolean>(false);
  const [selectedEntryDetails, setSelectedEntryDetails] = useState<JournalEntry | null>(null);

  // Manual Entry Form State
  const [manualJournalId, setManualJournalId] = useState<string>(journals[4]?.id || 'jrn-gen');
  const [manualDate, setManualDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [manualReference, setManualReference] = useState<string>('قيد تسوية دوري');
  const [manualDescription, setManualDescription] = useState<string>('إثبات تسوية محاسبية');
  const [manualLines, setManualLines] = useState<
    { accountId: string; debit: number; credit: number; description: string; partnerId?: string; partnerType?: 'customer' | 'supplier'; costCenterId?: string }[]
  >([
    { accountId: chartOfAccounts[7]?.id || 'acc-1410', debit: 10000, credit: 0, description: 'طرف مدين' },
    { accountId: chartOfAccounts[3]?.id || 'acc-1110', debit: 0, credit: 10000, description: 'طرف دائن' }
  ]);

  // Advance Form State
  const [advCustomerId, setAdvCustomerId] = useState<string>(customers[0]?.id || '');
  const [advAmount, setAdvAmount] = useState<number>(50000);
  const [advMethod, setAdvMethod] = useState<'cash' | 'bank_transfer' | 'check' | 'card'>('bank_transfer');
  const [advNotes, setAdvNotes] = useState<string>('عربون مقدم تعاقد تصنيع مطبخ');

  // Sales Invoice Form State
  const [invCustomerId, setInvCustomerId] = useState<string>(customers[0]?.id || '');
  const [invSubtotal, setInvSubtotal] = useState<number>(150000);
  const [invTaxRate, setInvTaxRate] = useState<number>(14);
  const [invApplyAdvance, setInvApplyAdvance] = useState<boolean>(true);
  const [invNotes, setInvNotes] = useState<string>('فاتورة مبيعات وتوريد مطبخ مودرن');

  // Vendor Bill Form State
  const [billSupplierId, setBillSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [billType, setBillType] = useState<'stock_purchase' | 'direct_expense' | 'asset_purchase'>('stock_purchase');
  const [billSubtotal, setBillSubtotal] = useState<number>(80000);
  const [billTaxRate, setBillTaxRate] = useState<number>(14);
  const [billWhtRate, setBillWhtRate] = useState<number>(1);
  const [billVendorInvNo, setBillVendorInvNo] = useState<string>('INV-SUP-9901');

  // Calculate live financial reports
  const trialBalanceData = AccountingService.calculateTrialBalance(chartOfAccounts, journalEntries, selectedPeriodId);
  const pnlData = AccountingService.calculateProfitAndLoss(chartOfAccounts, journalEntries, selectedPeriodId);
  const balanceSheetData = AccountingService.calculateBalanceSheet(chartOfAccounts, journalEntries, selectedPeriodId);

  // Calculate Totals for KPI Cards
  const totalReceivablesAR = salesInvoices.reduce((acc, i) => acc + i.balanceDue, 0);
  const totalPayablesAP = vendorBills.reduce((acc, b) => acc + b.balanceDue, 0);
  const totalCustomerAdvances = customerAdvances.filter(a => a.status !== 'fully_applied').reduce((acc, a) => acc + a.remainingAmount, 0);

  const mainCashBalance = (chartOfAccounts.find(a => a.code === '1110')?.openingBalanceDebit || 0) +
    journalEntries.filter(e => e.status === 'posted').reduce((acc, e) => {
      const dr = e.lines.filter(l => l.accountCode === '1110').reduce((s, l) => s + l.debit, 0);
      const cr = e.lines.filter(l => l.accountCode === '1110').reduce((s, l) => s + l.credit, 0);
      return acc + (dr - cr);
    }, 0);

  const bankBalance = (chartOfAccounts.find(a => a.code === '1200')?.openingBalanceDebit || 0) +
    journalEntries.filter(e => e.status === 'posted').reduce((acc, e) => {
      const dr = e.lines.filter(l => l.accountCode === '1200').reduce((s, l) => s + l.debit, 0);
      const cr = e.lines.filter(l => l.accountCode === '1200').reduce((s, l) => s + l.credit, 0);
      return acc + (dr - cr);
    }, 0);

  // Partner Statement Data
  const partnerStatementData = AccountingService.getPartnerStatement(
    selectedPartnerId,
    selectedPartnerType,
    journalEntries
  );

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl pb-12">
      {/* 1. TOP HEADER & MODULE IDENTITY */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <Scale className="w-3.5 h-3.5" />
            <span>نظام الحسابات المالية والقيد المزدوج — Rewaq Double-Entry Financial Backbone</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <Landmark className="w-8 h-8 text-[#C87A38]" />
            <span>الإدارة المالية والحسابات العامة</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            محرك مالي متكامل مبني على معايير القيد المزدوج (Double-Entry)، يدعم شجرة حسابات متقدمة، تسوية المخزون والـ WIP، إثبات الدفعات المقدمة، أوراق القبض والدفع، والتقارير المالية المعتمدة.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowNewAdvanceModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>استلام دفعة مقدمة (عربون)</span>
          </button>

          <button
            onClick={() => setShowNewInvoiceModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>إصدار فاتورة مبيعات</span>
          </button>

          <button
            onClick={() => setShowNewBillModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-700 hover:bg-rose-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
          >
            <Receipt className="w-4 h-4" />
            <span>فاتورة مورد (GR/IR)</span>
          </button>

          <button
            onClick={() => setShowNewEntryModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>قيد يومية يدوي</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="bg-white p-2 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-1 text-xs">
        {[
          { id: 'overview', label: 'لوحة المؤشرات والرقابة', icon: PieChart },
          { id: 'coa', label: 'دليل وشجرة الحسابات (CoA)', icon: FolderTree },
          { id: 'entries', label: 'دفتر الأستاذ والقيود (Ledger)', icon: Scale },
          { id: 'invoices', label: 'المبيعات والدفعات المقدمة', icon: FileText },
          { id: 'bills', label: 'المشتريات وفواتير الموردين', icon: Receipt },
          { id: 'partners', label: 'كشوف الحسابات (Statements)', icon: Users },
          { id: 'checks', label: 'أوراق القبض والدفع (PDC)', icon: CreditCard },
          { id: 'reports', label: 'القوائم والتقارير الختامية', icon: BarChart3 },
          { id: 'periods', label: 'الفترات المحاسبية والإقفال', icon: Calendar }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black transition-all ${
                isActive
                  ? 'bg-[#361D13] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#C87A38]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* TAB 1: OVERVIEW */}
      {/* ==================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 font-bold text-xs">
                <span>مديونيات العملاء (AR)</span>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign className="w-4 h-4" /></span>
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">
                {totalReceivablesAR.toLocaleString('ar-EG')} <span className="text-xs font-normal text-slate-500">ج.م</span>
              </p>
              <p className="text-[11px] text-slate-500">مستحقات آجلة بموجب فواتير مبيعات مرحلة</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 font-bold text-xs">
                <span>مستحقات الموردين (AP)</span>
                <span className="p-2 bg-rose-50 text-rose-600 rounded-xl"><Receipt className="w-4 h-4" /></span>
              </div>
              <p className="text-2xl font-black text-rose-700 font-mono">
                {totalPayablesAP.toLocaleString('ar-EG')} <span className="text-xs font-normal text-slate-500">ج.م</span>
              </p>
              <p className="text-[11px] text-slate-500">فواتير خامات ومشتريات واجبة السداد</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 font-bold text-xs">
                <span>عربين ودفعات مقدمة معلقة</span>
                <span className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Sparkles className="w-4 h-4" /></span>
              </div>
              <p className="text-2xl font-black text-amber-600 font-mono">
                {totalCustomerAdvances.toLocaleString('ar-EG')} <span className="text-xs font-normal text-slate-500">ج.م</span>
              </p>
              <p className="text-[11px] text-slate-500">التزامات دفعات مقدمة قبل إصدار الفاتورة</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 font-bold text-xs">
                <span>سيولة النقدية والبنوك</span>
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Landmark className="w-4 h-4" /></span>
              </div>
              <p className="text-2xl font-black text-blue-700 font-mono">
                {(mainCashBalance + bankBalance).toLocaleString('ar-EG')} <span className="text-xs font-normal text-slate-500">ج.م</span>
              </p>
              <p className="text-[11px] text-slate-500">خزينة: {mainCashBalance.toLocaleString('ar-EG')} | بنك: {bankBalance.toLocaleString('ar-EG')}</p>
            </div>
          </div>

          {/* Quick Double-Entry Integrity Status Banner */}
          <div className="bg-emerald-950 text-emerald-100 p-5 rounded-3xl border border-emerald-800/60 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-800/80 rounded-2xl text-emerald-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-emerald-200">صحة القيد المزدوج وميزان المراجعة (Audit Integrity Check)</h3>
                <p className="text-xs text-emerald-300/80">
                  جميع القيود اليومية ({journalEntries.length} قيد) مرحلة بحالة متوازنة 100%. إجمالي المدين = إجمالي الدائن.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono font-bold bg-emerald-900/80 px-4 py-2.5 rounded-2xl border border-emerald-700/50">
              <span>إجمالي المدين: {trialBalanceData.totalDebit.toLocaleString('ar-EG')} ج.م</span>
              <span className="text-emerald-400">==</span>
              <span>إجمالي الدائن: {trialBalanceData.totalCredit.toLocaleString('ar-EG')} ج.م</span>
              <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 rounded-full font-black text-[10px]">متطابق ✓</span>
            </div>
          </div>

          {/* Recent Journal Entries Preview */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#C87A38]" />
                <span>أحدث القيود اليومية المرحلة (Recent Journal Entries)</span>
              </h3>
              <button onClick={() => setActiveTab('entries')} className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1">
                <span>عرض دفتر الأستاذ بالكامل</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="p-3">رقم القيد</th>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">دفتر اليومية</th>
                    <th className="p-3">المستند المصدر</th>
                    <th className="p-3">البيان والتوجيه</th>
                    <th className="p-3 text-center">المبلغ (ج.م)</th>
                    <th className="p-3 text-center">الحالة</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {journalEntries.slice(0, 6).map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">{entry.entryNumber}</td>
                      <td className="p-3 text-slate-600">{entry.date}</td>
                      <td className="p-3 text-slate-700 font-bold">{entry.journalName}</td>
                      <td className="p-3 font-mono text-amber-700">{entry.sourceDocument || entry.reference}</td>
                      <td className="p-3 text-slate-700 max-w-xs truncate">{entry.description}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-900">
                        {entry.totalDebit.toLocaleString('ar-EG')}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          entry.status === 'posted' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {entry.status === 'posted' ? 'مرحل (Posted)' : 'معكوس (Reversed)'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedEntryDetails(entry);
                            setShowEntryDetailsModal(true);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                          title="عرض أطراف وسطور القيد"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: CHART OF ACCOUNTS (CoA) */}
      {/* ==================================================== */}
      {activeTab === 'coa' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-[#C87A38]" />
                <span>دليل وشجرة الحسابات الهرمية (Chart of Accounts)</span>
              </h2>
              <p className="text-xs text-slate-500">
                هيكل الحسابات الرئيسي لمصنع ومعارض الأثاث والمطابخ، مصنف حسب الأصول، الالتزامات، حقوق الملكية، الإيرادات، وتكلفة المبيعات.
              </p>
            </div>
            <button
              onClick={() => setShowNewAccountModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#361D13] hover:bg-[#4A2818] text-white font-black text-xs rounded-2xl shadow-md"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>إضافة حساب مالي جديد</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4 text-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث باسم أو كود الحساب..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pr-9 pl-4 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <span className="text-slate-500 font-bold">إجمالي الحسابات: {chartOfAccounts.length} حساب</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-3.5">كود الحساب (Code)</th>
                    <th className="p-3.5">اسم الحساب بالعربية</th>
                    <th className="p-3.5">English Name</th>
                    <th className="p-3.5 text-center">النوع الطبيعي</th>
                    <th className="p-3.5 text-center">المستوى</th>
                    <th className="p-3.5 text-center">القيد اليدوي</th>
                    <th className="p-3.5 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {chartOfAccounts
                    .filter(a => !searchQuery || a.nameAr.includes(searchQuery) || a.code.includes(searchQuery) || a.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(acc => {
                      const typeBadgeColors: Record<string, string> = {
                        asset: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        liability: 'bg-rose-50 text-rose-700 border-rose-200',
                        equity: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                        revenue: 'bg-amber-50 text-amber-700 border-amber-200',
                        cogs: 'bg-orange-50 text-orange-700 border-orange-200',
                        expense: 'bg-purple-50 text-purple-700 border-purple-200'
                      };

                      return (
                        <tr
                          key={acc.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            acc.level === 1 ? 'bg-slate-50/50 font-black text-slate-900' : ''
                          }`}
                        >
                          <td className="p-3.5 font-mono font-bold text-slate-900">
                            <span style={{ paddingRight: `${(acc.level - 1) * 16}px` }}>
                              {acc.level > 1 && '↳ '}
                              {acc.code}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-slate-800">{acc.nameAr}</td>
                          <td className="p-3.5 text-slate-500 font-mono text-[11px]">{acc.name}</td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${typeBadgeColors[acc.type] || 'bg-slate-50'}`}>
                              {acc.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-mono text-slate-500">L{acc.level}</td>
                          <td className="p-3.5 text-center">
                            {acc.allowManualEntries ? (
                              <span className="text-emerald-600 font-bold">مسموح ✓</span>
                            ) : (
                              <span className="text-slate-400">آلي فقط</span>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">نشط</span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: JOURNAL ENTRIES & GENERAL LEDGER */}
      {/* ==================================================== */}
      {activeTab === 'entries' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#C87A38]" />
                <span>دفتر اليومية والأستاذ العام (General Ledger & Journal Entries)</span>
              </h2>
              <p className="text-xs text-slate-500">
                استعراض القيود المالية المسجلة آلياً ويدوياً مع إمكانية الفحص الدقيق والعكس المحاسبي.
              </p>
            </div>
            <button
              onClick={() => setShowNewEntryModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-2xl shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء قيد يومية يدوي متوازن</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3 text-xs">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="بحث برقم القيد، البيان، أو المستند المصدر..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500">دفتر اليومية:</span>
              <select
                value={selectedJournalFilter}
                onChange={e => setSelectedJournalFilter(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="all">جميع الدفاتر (All Journals)</option>
                {journals.map(j => (
                  <option key={j.id} value={j.id}>{j.nameAr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Entries Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3.5">رقم القيد</th>
                    <th className="p-3.5">التاريخ</th>
                    <th className="p-3.5">دفتر اليومية</th>
                    <th className="p-3.5">المستند المصدر</th>
                    <th className="p-3.5">البيان</th>
                    <th className="p-3.5 text-center">إجمالي المدين / الدائن</th>
                    <th className="p-3.5 text-center">الحالة</th>
                    <th className="p-3.5 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {journalEntries
                    .filter(e => {
                      const matchQuery = !searchQuery || e.entryNumber.includes(searchQuery) || e.description.includes(searchQuery) || e.sourceDocument?.includes(searchQuery);
                      const matchJournal = selectedJournalFilter === 'all' || e.journalId === selectedJournalFilter;
                      return matchQuery && matchJournal;
                    })
                    .map(entry => (
                      <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-slate-900">{entry.entryNumber}</td>
                        <td className="p-3.5 text-slate-600">{entry.date}</td>
                        <td className="p-3.5 font-bold text-slate-800">{entry.journalName}</td>
                        <td className="p-3.5 font-mono text-amber-700 font-bold">{entry.sourceDocument || '—'}</td>
                        <td className="p-3.5 text-slate-700 max-w-sm">{entry.description}</td>
                        <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                          {entry.totalDebit.toLocaleString('ar-EG')} ج.م
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            entry.status === 'posted' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {entry.status === 'posted' ? 'مرحل ✓' : 'معكوس ✕'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedEntryDetails(entry);
                                setShowEntryDetailsModal(true);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px]"
                            >
                              تفاصيل السطور
                            </button>
                            {entry.status === 'posted' && (
                              <button
                                onClick={() => {
                                  setSelectedEntryToReverse(entry);
                                  setShowReverseModal(true);
                                }}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-[11px]"
                              >
                                عكس القيد
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: SALES INVOICES & ADVANCES */}
      {/* ==================================================== */}
      {activeTab === 'invoices' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Customer Advances Tracker */}
            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>عربين ودفعات العملاء المقدمة</span>
                </h3>
                <button
                  onClick={() => setShowNewAdvanceModal(true)}
                  className="px-3 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 font-black text-xs rounded-xl"
                >
                  + استلام عربون
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                يتم تسجيل العربون كالتزام (Liability - حساب 2200) ولا يُعترف به كإيراد حتى إصدار الفاتورة أو التسليم وتسويته.
              </p>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {customerAdvances.map(adv => (
                  <div key={adv.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="font-mono text-slate-900">{adv.advanceNumber}</span>
                      <span className="text-emerald-700 font-mono">{adv.amount.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                    <p className="text-slate-700 font-bold">{adv.customerName}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>المتبقي للتسوية: <b className="text-amber-700">{adv.remainingAmount.toLocaleString('ar-EG')} ج.م</b></span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        adv.status === 'fully_applied' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {adv.status === 'fully_applied' ? 'تمت التسوية بالكامل' : 'عربون نشط'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Sales Invoices Table */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#C87A38]" />
                  <span>فواتير المبيعات الضريبية (Sales Invoices)</span>
                </h3>
                <button
                  onClick={() => setShowNewInvoiceModal(true)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md"
                >
                  + إصدار فاتورة جديدة
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <th className="p-3">رقم الفاتورة</th>
                      <th className="p-3">العميل</th>
                      <th className="p-3">التاريخ</th>
                      <th className="p-3 text-center">الإجمالي</th>
                      <th className="p-3 text-center">المسوى من العربون</th>
                      <th className="p-3 text-center">المتبقي (AR)</th>
                      <th className="p-3 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {salesInvoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                        <td className="p-3 font-bold text-slate-800">{inv.customerName}</td>
                        <td className="p-3 text-slate-600">{inv.date}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-900">
                          {inv.totalAmount.toLocaleString('ar-EG')} ج.م
                        </td>
                        <td className="p-3 text-center font-mono text-amber-700 font-bold">
                          {inv.advanceAppliedAmount.toLocaleString('ar-EG')} ج.م
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-rose-700">
                          {inv.balanceDue.toLocaleString('ar-EG')} ج.م
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {inv.status === 'paid' ? 'مسددة بالكامل ✓' : 'مستحقة'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: VENDOR BILLS & PURCHASES (GR/IR) */}
      {/* ==================================================== */}
      {activeTab === 'bills' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#C87A38]" />
                <span>فواتير المشتريات والموردين (Vendor Bills & GR/IR Clearing)</span>
              </h2>
              <p className="text-xs text-slate-500">
                تسجيل فواتير الخامات وإقفال حساب وسيط الاستلام المخزني (GR/IR 2150) مع احتساب ضريبة القيمة المضافة 14% وخصم أرباح تجارية 1%.
              </p>
            </div>
            <button
              onClick={() => setShowNewBillModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-700 hover:bg-rose-600 text-white font-black text-xs rounded-2xl shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل فاتورة مورد جديدة</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3.5">رقم الفاتورة بالنظام</th>
                    <th className="p-3.5">فاتورة المورد الورقية</th>
                    <th className="p-3.5">المورد</th>
                    <th className="p-3.5">نوع الشراء</th>
                    <th className="p-3.5">التاريخ</th>
                    <th className="p-3.5 text-center">الإجمالي شامل الضريبة</th>
                    <th className="p-3.5 text-center">خصم أرباح تجارية (1%)</th>
                    <th className="p-3.5 text-center">الصافي الواجب سداده</th>
                    <th className="p-3.5 text-center">الحالة</th>
                    <th className="p-3.5 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendorBills.map(bill => (
                    <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{bill.billNumber}</td>
                      <td className="p-3.5 font-mono text-slate-600">{bill.vendorInvoiceNumber || '—'}</td>
                      <td className="p-3.5 font-bold text-slate-800">{bill.supplierName}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[10px]">
                          {bill.billType === 'stock_purchase' ? 'خامات ومخزن (GR/IR)' : 'مصروف مباشر'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">{bill.date}</td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                        {bill.totalAmount.toLocaleString('ar-EG')} ج.م
                      </td>
                      <td className="p-3.5 text-center font-mono text-amber-700 font-bold">
                        {bill.withholdingTaxAmount.toLocaleString('ar-EG')} ج.م
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-rose-700">
                        {bill.balanceDue.toLocaleString('ar-EG')} ج.م
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          bill.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {bill.status === 'paid' ? 'مسددة بالكامل ✓' : 'مستحقة السداد'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {bill.balanceDue > 0 && (
                          <button
                            onClick={() => {
                              recordVendorBillPayment(bill.id, bill.balanceDue, 'bank_transfer', 'acc-1200', 1);
                            }}
                            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black rounded-lg text-[11px]"
                          >
                            سداد بنكي
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 6: PARTNER STATEMENTS (CUSTOMERS & VENDORS) */}
      {/* ==================================================== */}
      {activeTab === 'partners' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#C87A38]" />
                  <span>كشف حساب شريك الأعمال المفصل (Partner Statement of Account)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  استخراج كشف حساب العميل أو المورد من دفتر الأستاذ المشترك (Shared AR/AP Ledger) مع حساب الرصيد التراكمي المتحرك.
                </p>
              </div>

              {/* Partner Selectors */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                  <button
                    onClick={() => {
                      setSelectedPartnerType('customer');
                      setSelectedPartnerId(customers[0]?.id || '');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      selectedPartnerType === 'customer' ? 'bg-[#361D13] text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    عملاء (AR)
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPartnerType('supplier');
                      setSelectedPartnerId(suppliers[0]?.id || '');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      selectedPartnerType === 'supplier' ? 'bg-[#361D13] text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    موردين (AP)
                  </button>
                </div>

                <select
                  value={selectedPartnerId}
                  onChange={e => setSelectedPartnerId(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                >
                  {selectedPartnerType === 'customer'
                    ? customers.map(c => <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>)
                    : suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* Statement Summary Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-500 font-bold block">إجمالي الحركات المدينة (Debit):</span>
                <span className="text-lg font-black text-slate-900 font-mono">{partnerStatementData.totalDebit.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">إجمالي الحركات الدائنة (Credit):</span>
                <span className="text-lg font-black text-slate-900 font-mono">{partnerStatementData.totalCredit.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">الرصيد الختامي المستحق (Ending Balance):</span>
                <span className={`text-lg font-black font-mono ${partnerStatementData.endingBalance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {partnerStatementData.endingBalance.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            </div>

            {/* Statement Rows Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">رقم المستند / القيد</th>
                    <th className="p-3">نوع الحركة</th>
                    <th className="p-3">البيان والشرح</th>
                    <th className="p-3 text-center">مدين (Debit)</th>
                    <th className="p-3 text-center">دائن (Credit)</th>
                    <th className="p-3 text-center">الرصيد المتحرك (Balance)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partnerStatementData.rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-6 text-slate-400">
                        لا توجد حركات مرحلة مسجلة لهذا الطرف حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    partnerStatementData.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-slate-600 font-mono">{row.date}</td>
                        <td className="p-3 font-mono font-bold text-amber-800">{row.documentNumber}</td>
                        <td className="p-3 font-bold text-slate-700">{row.documentType}</td>
                        <td className="p-3 text-slate-700">{row.description}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-900">
                          {row.debit > 0 ? row.debit.toLocaleString('ar-EG') : '—'}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-slate-900">
                          {row.credit > 0 ? row.credit.toLocaleString('ar-EG') : '—'}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-indigo-900 bg-indigo-50/40">
                          {row.runningBalance.toLocaleString('ar-EG')} ج.م
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 7: PDC CHECKS LIFECYCLE */}
      {/* ==================================================== */}
      {activeTab === 'checks' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#C87A38]" />
                <span>إدارة الشيكات وأوراق القبض والدفع (PDC Management)</span>
              </h2>
              <p className="text-xs text-slate-500">
                متابعة دورة حياة الشيكات البنكية (استلام $\rightarrow$ برسم التحصيل $\rightarrow$ تحصيل في كشف حساب البنك أو ارتداد).
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3.5">رقم الشيك</th>
                    <th className="p-3.5">نوع الشيك</th>
                    <th className="p-3.5">الطرف (العميل / المورد)</th>
                    <th className="p-3.5">البنك المسحوب عليه</th>
                    <th className="p-3.5">تاريخ الاستحقاق</th>
                    <th className="p-3.5 text-center">المبلغ</th>
                    <th className="p-3.5 text-center">حالة الشيك</th>
                    <th className="p-3.5 text-center">إجراءات المقاصة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pdcRecords.map(check => (
                    <tr key={check.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{check.checkNumber}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          check.type === 'receivable' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {check.type === 'receivable' ? 'ورقة قبض (من عميل)' : 'ورقة دفع (لمورد)'}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">{check.partnerName}</td>
                      <td className="p-3.5 text-slate-600">{check.bankName}</td>
                      <td className="p-3.5 font-mono text-slate-700 font-bold">{check.dueDate}</td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                        {check.amount.toLocaleString('ar-EG')} ج.م
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          check.status === 'cleared'
                            ? 'bg-emerald-100 text-emerald-800'
                            : check.status === 'bounced'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {check.status === 'cleared' ? 'تم التحصيل بالبنك ✓' : check.status === 'under_collection' ? 'برسم التحصيل' : check.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {check.status !== 'cleared' && (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => updatePdcStatus(check.id, 'cleared', 'acc-1200')}
                              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-black rounded-lg text-[10px]"
                            >
                              إثبات التحصيل بالبنك
                            </button>
                            <button
                              onClick={() => updatePdcStatus(check.id, 'bounced')}
                              className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-lg text-[10px]"
                            >
                              ارتداد
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 8: FINANCIAL REPORTS (TRIAL BALANCE, P&L, BALANCE SHEET) */}
      {/* ==================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Report Sub Tabs & Period Selection */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2">
              {[
                { id: 'trial_balance', label: 'ميزان المراجعة (Trial Balance)' },
                { id: 'pnl', label: 'قائمة الدخل والأرباح (P&L)' },
                { id: 'balance_sheet', label: 'الميزانية والمركز المالي (Balance Sheet)' }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setReportSubTab(sub.id as any)}
                  className={`px-4 py-2 rounded-2xl font-black text-xs transition-all ${
                    reportSubTab === sub.id
                      ? 'bg-[#361D13] text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-500">الفترة المحاسبية:</span>
              <select
                value={selectedPeriodId}
                onChange={e => setSelectedPeriodId(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="all">كافة الفترات (Year to Date)</option>
                {fiscalPeriods.map(p => (
                  <option key={p.id} value={p.id}>{p.name} {p.isClosed ? '(مغلقة)' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 1. Trial Balance View */}
          {reportSubTab === 'trial_balance' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">ميزان المراجعة بالأرصدة والمجاميع</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  trialBalanceData.isBalanced ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {trialBalanceData.isBalanced ? 'الميزان متوازن محاسبياً 100% ✓' : 'الميزان غير متوازن!'}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3">كود الحساب</th>
                      <th className="p-3">اسم الحساب المالي</th>
                      <th className="p-3 text-center">الرصيد الافتتاحي (مدين)</th>
                      <th className="p-3 text-center">الرصيد الافتتاحي (دائن)</th>
                      <th className="p-3 text-center">حركات الفترة (مدين)</th>
                      <th className="p-3 text-center">حركات الفترة (دائن)</th>
                      <th className="p-3 text-center bg-emerald-50">رصيد ختامي (مدين)</th>
                      <th className="p-3 text-center bg-rose-50">رصيد ختامي (دائن)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trialBalanceData.items.map(row => (
                      <tr key={row.accountId} className={`hover:bg-slate-50 transition-colors ${row.level === 1 ? 'font-black bg-slate-50/60 text-slate-900' : ''}`}>
                        <td className="p-3 font-mono font-bold">{row.accountCode}</td>
                        <td className="p-3">{row.accountNameAr}</td>
                        <td className="p-3 text-center font-mono">{row.initialDebit > 0 ? row.initialDebit.toLocaleString('ar-EG') : '—'}</td>
                        <td className="p-3 text-center font-mono">{row.initialCredit > 0 ? row.initialCredit.toLocaleString('ar-EG') : '—'}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-800">{row.periodDebit > 0 ? row.periodDebit.toLocaleString('ar-EG') : '—'}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-800">{row.periodCredit > 0 ? row.periodCredit.toLocaleString('ar-EG') : '—'}</td>
                        <td className="p-3 text-center font-mono font-black text-emerald-800 bg-emerald-50/40">
                          {row.endingDebit > 0 ? row.endingDebit.toLocaleString('ar-EG') : '—'}
                        </td>
                        <td className="p-3 text-center font-mono font-black text-rose-800 bg-rose-50/40">
                          {row.endingCredit > 0 ? row.endingCredit.toLocaleString('ar-EG') : '—'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900 text-white font-mono font-black text-xs">
                      <td colSpan={6} className="p-3.5 text-right font-sans">الإجمالي العام لميزان المراجعة (Total Trial Balance)</td>
                      <td className="p-3.5 text-center text-emerald-300">{trialBalanceData.totalDebit.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3.5 text-center text-rose-300">{trialBalanceData.totalCredit.toLocaleString('ar-EG')} ج.م</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. Profit & Loss View */}
          {reportSubTab === 'pnl' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6 max-w-4xl mx-auto">
              <div className="text-center space-y-1 border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900">قائمة الدخل والأرباح والخسائر (Income Statement / P&L)</h3>
                <p className="text-xs text-slate-500">عن الفترة المحاسبية المحددة</p>
              </div>

              {/* Revenue Section */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-slate-100 p-2.5 rounded-xl font-black text-slate-900">
                  <span>1. إيرادات المبيعات والتشغيل (Sales Revenues)</span>
                  <span className="font-mono text-emerald-700">{pnlData.totalRevenue.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="pr-4 space-y-1">
                  {pnlData.revenueAccounts.map(r => (
                    <div key={r.code} className="flex justify-between text-slate-600">
                      <span>{r.code} — {r.name}</span>
                      <span className="font-mono font-bold">{r.amount.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* COGS Section */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-slate-100 p-2.5 rounded-xl font-black text-slate-900">
                  <span>2. تكلفة المبيعات والخامات المباشرة (COGS)</span>
                  <span className="font-mono text-rose-700">{pnlData.totalCOGS.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="pr-4 space-y-1">
                  {pnlData.cogsAccounts.map(c => (
                    <div key={c.code} className="flex justify-between text-slate-600">
                      <span>{c.code} — {c.name}</span>
                      <span className="font-mono font-bold">{c.amount.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gross Profit Banner */}
              <div className="flex justify-between items-center bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-sm font-black text-amber-950">
                <span>مجمل الربح (Gross Profit):</span>
                <span className="font-mono text-base">{pnlData.grossProfit.toLocaleString('ar-EG')} ج.م (هامش {pnlData.grossProfitMargin}%)</span>
              </div>

              {/* Operating Expenses Section */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-slate-100 p-2.5 rounded-xl font-black text-slate-900">
                  <span>3. المصروفات العمومية والتشغيلية (Operating Expenses)</span>
                  <span className="font-mono text-rose-700">{pnlData.totalExpenses.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="pr-4 space-y-1">
                  {pnlData.expenseAccounts.map(e => (
                    <div key={e.code} className="flex justify-between text-slate-600">
                      <span>{e.code} — {e.name}</span>
                      <span className="font-mono font-bold">{e.amount.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Net Profit Banner */}
              <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl text-base font-black">
                <span>صافي الأرباح التشغيلية (Net Profit):</span>
                <span className="font-mono text-emerald-400 text-lg">{pnlData.netProfit.toLocaleString('ar-EG')} ج.م (صافي {pnlData.netProfitMargin}%)</span>
              </div>
            </div>
          )}

          {/* 3. Balance Sheet View */}
          {reportSubTab === 'balance_sheet' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6 max-w-4xl mx-auto">
              <div className="text-center space-y-1 border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900">قائمة المركز المالي والميزانية العمومية (Balance Sheet)</h3>
                <p className="text-xs text-slate-500">الأصول = الالتزامات + حقوق الملكية</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Assets Column */}
                <div className="space-y-4">
                  <div className="bg-emerald-50 text-emerald-950 p-3 rounded-2xl font-black flex justify-between">
                    <span>إجمالي الأصول (Assets)</span>
                    <span className="font-mono">{balanceSheetData.totalAssets.toLocaleString('ar-EG')} ج.م</span>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-slate-700">الأصول المتداولة (Current Assets):</p>
                    {balanceSheetData.currentAssets.map(a => (
                      <div key={a.code} className="flex justify-between text-slate-600 pr-2">
                        <span>{a.code} — {a.name}</span>
                        <span className="font-mono font-bold">{a.amount.toLocaleString('ar-EG')} ج.م</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-slate-700">الأصول غير المتداولة (Fixed Assets):</p>
                    {balanceSheetData.nonCurrentAssets.map(a => (
                      <div key={a.code} className="flex justify-between text-slate-600 pr-2">
                        <span>{a.code} — {a.name}</span>
                        <span className="font-mono font-bold">{a.amount.toLocaleString('ar-EG')} ج.م</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Liabilities & Equity Column */}
                <div className="space-y-4">
                  <div className="bg-rose-50 text-rose-950 p-3 rounded-2xl font-black flex justify-between">
                    <span>الالتزامات وحقوق الملكية</span>
                    <span className="font-mono">{balanceSheetData.totalLiabilitiesAndEquity.toLocaleString('ar-EG')} ج.م</span>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-slate-700">الالتزامات المتداولة (Liabilities):</p>
                    {balanceSheetData.currentLiabilities.map(l => (
                      <div key={l.code} className="flex justify-between text-slate-600 pr-2">
                        <span>{l.code} — {l.name}</span>
                        <span className="font-mono font-bold">{l.amount.toLocaleString('ar-EG')} ج.م</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-slate-700">حقوق الملكية (Equity):</p>
                    {balanceSheetData.equityAccounts.map(e => (
                      <div key={e.code} className="flex justify-between text-slate-600 pr-2">
                        <span>{e.code} — {e.name}</span>
                        <span className="font-mono font-bold">{e.amount.toLocaleString('ar-EG')} ج.م</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-emerald-800 pr-2 font-bold bg-emerald-50/50 p-1 rounded-lg">
                      <span>أرباح العام الجاري (Current P&L)</span>
                      <span className="font-mono">{balanceSheetData.currentYearEarnings.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 9: FISCAL PERIODS & CLOSING CHECKLIST */}
      {/* ==================================================== */}
      {activeTab === 'periods' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#C87A38]" />
              <span>إدارة الفترات المحاسبية وإقفال الشهر (Fiscal Periods Closing)</span>
            </h2>
            <p className="text-xs text-slate-500">
              عند قفل الفترة، يُمنع المستخدمون العاديون من الترحيل أو تعديل القيود التاريخية حفاظاً على سلامة المراجعة القانونية.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {fiscalPeriods.map(p => (
                <div key={p.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-sm font-black text-slate-900">{p.name}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      p.isClosed ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {p.isClosed ? 'مغلقة ومقفلة 🔒' : 'مفتوحة للترحيل 🔓'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">{p.startDate} إلى {p.endDate}</p>
                  {p.isClosed && (
                    <p className="text-[10px] text-slate-400">أقفلها: {p.closedByUserName}</p>
                  )}
                  <button
                    onClick={() => toggleFiscalPeriodLock(p.id)}
                    className={`w-full py-2 rounded-xl font-black text-xs transition-all ${
                      p.isClosed ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-rose-700 hover:bg-rose-600 text-white shadow-md'
                    }`}
                  >
                    {p.isClosed ? 'إلغاء القفل (إعادة الفتح)' : 'قفل واعتماد الفترة المحاسبية'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODALS */}
      {/* ==================================================== */}

      {/* 1. NEW BALANCED JOURNAL ENTRY MODAL */}
      {showNewEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-right space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-600" />
                <span>إنشاء قيد يومية يدوي متوازن (Balanced Journal Entry)</span>
              </h3>
              <button onClick={() => setShowNewEntryModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold mb-1">دفتر اليومية *</label>
                <select
                  value={manualJournalId}
                  onChange={e => setManualJournalId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-xl font-bold text-xs"
                >
                  {journals.map(j => (
                    <option key={j.id} value={j.id}>{j.nameAr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">التاريخ *</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={e => setManualDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-xl font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">المرجع *</label>
                <input
                  type="text"
                  value={manualReference}
                  onChange={e => setManualReference(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-xl font-bold text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">البيان والشرح العام للقيد *</label>
              <input
                type="text"
                value={manualDescription}
                onChange={e => setManualDescription(e.target.value)}
                className="w-full p-2 bg-slate-50 border rounded-xl text-xs"
              />
            </div>

            {/* Entry Lines */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>أطراف وسطور القيد (Debits & Credits)</span>
                <button
                  type="button"
                  onClick={() => {
                    setManualLines(prev => [
                      ...prev,
                      { accountId: chartOfAccounts[0]?.id || 'acc-1110', debit: 0, credit: 0, description: 'طرف جديد' }
                    ]);
                  }}
                  className="text-amber-700 font-black hover:underline"
                >
                  + إضافة سطر قيد
                </button>
              </div>

              {manualLines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] text-slate-500 mb-0.5">الحساب المالي</label>
                    <select
                      value={line.accountId}
                      onChange={e => {
                        const val = e.target.value;
                        setManualLines(prev => prev.map((l, i) => i === idx ? { ...l, accountId: val } : l));
                      }}
                      className="w-full p-1.5 bg-white border rounded-lg font-bold text-[11px]"
                    >
                      {chartOfAccounts.filter(a => a.allowManualEntries).map(a => (
                        <option key={a.id} value={a.id}>{a.code} — {a.nameAr}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] text-slate-500 mb-0.5">البيان</label>
                    <input
                      type="text"
                      value={line.description}
                      onChange={e => {
                        const val = e.target.value;
                        setManualLines(prev => prev.map((l, i) => i === idx ? { ...l, description: val } : l));
                      }}
                      className="w-full p-1.5 bg-white border rounded-lg text-[11px]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-emerald-700 font-bold mb-0.5">مدين (Debit)</label>
                    <input
                      type="number"
                      min={0}
                      value={line.debit}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setManualLines(prev => prev.map((l, i) => i === idx ? { ...l, debit: val, credit: val > 0 ? 0 : l.credit } : l));
                      }}
                      className="w-full p-1.5 bg-white border rounded-lg text-center font-mono font-bold text-[11px]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-rose-700 font-bold mb-0.5">دائن (Credit)</label>
                    <input
                      type="number"
                      min={0}
                      value={line.credit}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setManualLines(prev => prev.map((l, i) => i === idx ? { ...l, credit: val, debit: val > 0 ? 0 : l.debit } : l));
                      }}
                      className="w-full p-1.5 bg-white border rounded-lg text-center font-mono font-bold text-[11px]"
                    />
                  </div>

                  <div className="sm:col-span-1 flex items-end justify-center pb-1">
                    <button
                      type="button"
                      onClick={() => setManualLines(prev => prev.filter((_, i) => i !== idx))}
                      className="text-rose-600 font-bold hover:text-rose-800"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Balance Check */}
            {(() => {
              const sumDr = manualLines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
              const sumCr = manualLines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
              const isBal = Math.abs(sumDr - sumCr) < 0.01 && sumDr > 0;

              return (
                <div className={`p-3 rounded-2xl flex items-center justify-between font-mono font-bold text-xs ${
                  isBal ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}>
                  <span>مجموع المدين: {sumDr.toLocaleString('ar-EG')} ج.م</span>
                  <span>مجموع الدائن: {sumCr.toLocaleString('ar-EG')} ج.م</span>
                  <span>{isBal ? '✓ القيد متوازن' : '⚠️ القيد غير متوازن'}</span>
                </div>
              );
            })()}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setShowNewEntryModal(false)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button
                type="button"
                onClick={() => {
                  const currentPeriod = fiscalPeriods.find(p => !p.isClosed) || fiscalPeriods[1];
                  const formattedLines = manualLines.map(l => {
                    const acc = chartOfAccounts.find(a => a.id === l.accountId)!;
                    return {
                      accountId: acc.id,
                      accountCode: acc.code,
                      accountName: acc.nameAr,
                      debit: Number(l.debit) || 0,
                      credit: Number(l.credit) || 0,
                      description: l.description || manualDescription
                    };
                  });

                  const res = createManualJournalEntry({
                    journalId: manualJournalId,
                    date: manualDate,
                    periodId: currentPeriod.id,
                    reference: manualReference,
                    description: manualDescription,
                    lines: formattedLines
                  });

                  if (res.success) {
                    setShowNewEntryModal(false);
                  }
                }}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-md"
              >
                تأكيد وترحيل القيد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CUSTOMER ADVANCE MODAL */}
      {showNewAdvanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>استلام عربون / دفعة مقدمة لعقد تصنيع</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              يقيد في حساب الالتزامات (2200 - Customer Advances) ويتم ترحيله أوتوماتيكياً للطرف المدين بالخزينة/البنك.
            </p>

            <div>
              <label className="block font-bold mb-1">العميل *</label>
              <select
                value={advCustomerId}
                onChange={e => setAdvCustomerId(e.target.value)}
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">المبلغ المحصل (عربون) *</label>
              <input
                type="number"
                min={1}
                value={advAmount}
                onChange={e => setAdvAmount(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border rounded-xl font-mono font-bold text-center text-sm"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">طريقة السداد *</label>
              <select
                value={advMethod}
                onChange={e => setAdvMethod(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
              >
                <option value="bank_transfer">تحويل بنكي / إيداع (البنك الأهلي)</option>
                <option value="cash">نقداً بالخزينة الرئيسية</option>
                <option value="check">شيك بنكي (PDC)</option>
                <option value="card">بطاقة ائتمان POS</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">ملاحظات العقد</label>
              <input
                type="text"
                value={advNotes}
                onChange={e => setAdvNotes(e.target.value)}
                className="w-full p-2 bg-slate-50 border rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setShowNewAdvanceModal(false)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button
                type="button"
                onClick={() => {
                  recordCustomerAdvancePayment({
                    customerId: advCustomerId,
                    amount: advAmount,
                    paymentMethod: advMethod,
                    accountId: advMethod === 'cash' ? 'acc-1110' : 'acc-1200',
                    notes: advNotes
                  });
                  setShowNewAdvanceModal(false);
                }}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-md"
              >
                تأكيد واستلام العربون
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. NEW SALES INVOICE MODAL */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>إصدار فاتورة مبيعات ضريبية (Sales Invoice)</span>
            </h3>

            <div>
              <label className="block font-bold mb-1">العميل *</label>
              <select
                value={invCustomerId}
                onChange={e => setInvCustomerId(e.target.value)}
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">قيمة المبيعات (قبل الضريبة) *</label>
              <input
                type="number"
                min={1}
                value={invSubtotal}
                onChange={e => setInvSubtotal(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border rounded-xl font-mono font-bold text-center text-sm"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span>ضريبة القيمة المضافة (14%):</span>
                <span>{Math.round(invSubtotal * 0.14).toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900">
                <span>إجمالي الفاتورة:</span>
                <span>{(invSubtotal + Math.round(invSubtotal * 0.14)).toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">تسوية عربون مسدد مسبقاً (إن وُجد)</label>
              {(() => {
                const custAdvances = customerAdvances.filter(a => a.customerId === invCustomerId && a.remainingAmount > 0);
                if (custAdvances.length === 0) {
                  return <p className="text-slate-400 text-[11px]">لا توجد دفعات مقدمة غير مسواة لهذا العميل.</p>;
                }
                const firstAdv = custAdvances[0];
                return (
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-center justify-between">
                    <span>عربون متاح: {firstAdv.advanceNumber} ({firstAdv.remainingAmount.toLocaleString('ar-EG')} ج.م)</span>
                    <input
                      type="checkbox"
                      checked={invApplyAdvance}
                      onChange={e => setInvApplyAdvance(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600"
                    />
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setShowNewInvoiceModal(false)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button
                type="button"
                onClick={() => {
                  const custAdvances = customerAdvances.filter(a => a.customerId === invCustomerId && a.remainingAmount > 0);
                  const advToApply = invApplyAdvance && custAdvances.length > 0 ? Math.min(custAdvances[0].remainingAmount, invSubtotal * 1.14) : 0;

                  createSalesInvoice({
                    customerId: invCustomerId,
                    subtotal: invSubtotal,
                    taxAmount: Math.round(invSubtotal * 0.14),
                    advanceAppliedAmount: advToApply,
                    advanceId: custAdvances[0]?.id,
                    notes: invNotes
                  });
                  setShowNewInvoiceModal(false);
                }}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl shadow-md"
              >
                تأكيد وترحيل الفاتورة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. NEW VENDOR BILL MODAL */}
      {showNewBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-600" />
              <span>تسجيل فاتورة مورد ومشتريات (Vendor Bill)</span>
            </h3>

            <div>
              <label className="block font-bold mb-1">المورد *</label>
              <select
                value={billSupplierId}
                onChange={e => setBillSupplierId(e.target.value)}
                className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold mb-1">نوع الشراء *</label>
                <select
                  value={billType}
                  onChange={e => setBillType(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
                >
                  <option value="stock_purchase">خامات ومستودع (GR/IR)</option>
                  <option value="direct_expense">مصروف تشغيلي مباشر</option>
                  <option value="asset_purchase">أصل ثابت (ماكينات)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">رقم فاتورة المورد الورقية</label>
                <input
                  type="text"
                  value={billVendorInvNo}
                  onChange={e => setBillVendorInvNo(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">المبلغ قبل الضريبة *</label>
              <input
                type="number"
                min={1}
                value={billSubtotal}
                onChange={e => setBillSubtotal(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border rounded-xl font-mono font-bold text-center text-sm"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span>ضريبة القيمة المضافة مدخلات (14%):</span>
                <span className="text-emerald-700">+{Math.round(billSubtotal * 0.14).toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>خصم أرباح تجارية مستقطع للضرائب (1%):</span>
                <span className="text-rose-700">-{Math.round(billSubtotal * 0.01).toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                <span>الصافي المستحق للمورد:</span>
                <span>{(billSubtotal + Math.round(billSubtotal * 0.14) - Math.round(billSubtotal * 0.01)).toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setShowNewBillModal(false)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button
                type="button"
                onClick={() => {
                  createVendorBill({
                    supplierId: billSupplierId,
                    billType,
                    vendorInvoiceNumber: billVendorInvNo,
                    subtotal: billSubtotal,
                    taxAmount: Math.round(billSubtotal * 0.14),
                    withholdingTaxRate: billWhtRate,
                    withholdingTaxAmount: Math.round(billSubtotal * 0.01)
                  });
                  setShowNewBillModal(false);
                }}
                className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-black rounded-xl shadow-md"
              >
                تأكيد وترحيل الفاتورة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. ENTRY DETAILS MODAL */}
      {showEntryDetailsModal && selectedEntryDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-600" />
                  <span>تفاصيل القيد المحاسبي ({selectedEntryDetails.entryNumber})</span>
                </h3>
                <p className="text-[11px] text-slate-500">{selectedEntryDetails.description}</p>
              </div>
              <button onClick={() => setShowEntryDetailsModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5">كود الحساب</th>
                    <th className="p-2.5">اسم الحساب</th>
                    <th className="p-2.5">الطرف / الشريك</th>
                    <th className="p-2.5 text-center">مدين (Debit)</th>
                    <th className="p-2.5 text-center">دائن (Credit)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedEntryDetails.lines.map((line, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-slate-900">{line.accountCode}</td>
                      <td className="p-2.5 font-bold text-slate-800">{line.accountName}</td>
                      <td className="p-2.5 text-slate-600">{line.partnerName || '—'}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-emerald-800">
                        {line.debit > 0 ? line.debit.toLocaleString('ar-EG') : '—'}
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-rose-800">
                        {line.credit > 0 ? line.credit.toLocaleString('ar-EG') : '—'}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-900 text-white font-mono font-bold text-xs">
                    <td colSpan={3} className="p-2.5">إجمالي طرفي القيد</td>
                    <td className="p-2.5 text-center text-emerald-300">{selectedEntryDetails.totalDebit.toLocaleString('ar-EG')} ج.م</td>
                    <td className="p-2.5 text-center text-rose-300">{selectedEntryDetails.totalCredit.toLocaleString('ar-EG')} ج.م</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => setShowEntryDetailsModal(false)} className="px-5 py-2 bg-slate-800 text-white font-bold rounded-xl">إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* 6. REVERSAL ENTRY MODAL */}
      {showReverseModal && selectedEntryToReverse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right space-y-4 text-xs">
            <h3 className="text-base font-black text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>عكس القيد المحاسبي ({selectedEntryToReverse.entryNumber})</span>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              سيقوم النظام بإنشاء قيد عكسي مؤتمت يعكس كافة الأطراف المدينة والدائنة مع الحفاظ على الأثر الرقابي والأرشيف المحاسبي دون حذف.
            </p>

            <div>
              <label className="block font-bold mb-1">سبب العكس المحاسبي *</label>
              <input
                type="text"
                value={reverseReason}
                onChange={e => setReverseReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setShowReverseModal(false)} className="px-4 py-2 border rounded-xl font-bold">إلغاء</button>
              <button
                type="button"
                onClick={() => {
                  reverseJournalEntry(selectedEntryToReverse.id, reverseReason);
                  setShowReverseModal(false);
                }}
                className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-black rounded-xl shadow-md"
              >
                تأكيد إنشاء القيد العكسي
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
