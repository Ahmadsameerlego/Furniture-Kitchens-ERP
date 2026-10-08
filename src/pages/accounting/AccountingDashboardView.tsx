// ====================================================
// REWAQ ERP — ACCOUNTING EXECUTIVE DASHBOARD VIEW
// Financial KPIs, Liquidity, Health Check, & Operations
// ====================================================

import React from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Landmark,
  Scale,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  FolderTree,
  FileText,
  Receipt,
  CreditCard,
  Building2,
  Users,
  ShieldCheck,
  Calendar,
  Sparkles,
  BarChart3,
  Layers,
  ArrowLeftRight
} from 'lucide-react';

export const AccountingDashboardView: React.FC = () => {
  const {
    chartOfAccounts,
    journalEntries,
    salesInvoices,
    vendorBills,
    customerAdvances,
    pdcRecords,
    setActiveModule
  } = useERP();

  // Financial Liquidity (Cash & Banks)
  const cashOnHand = (chartOfAccounts.find(a => a.code === '1111' || a.code === '1110')?.openingBalanceDebit || 0) +
    journalEntries.filter(e => e.status === 'posted').reduce((acc, e) => {
      const dr = e.lines.filter(l => l.accountCode.startsWith('1111') || l.accountCode === '1110').reduce((s, l) => s + l.debit, 0);
      const cr = e.lines.filter(l => l.accountCode.startsWith('1111') || l.accountCode === '1110').reduce((s, l) => s + l.credit, 0);
      return acc + (dr - cr);
    }, 0);

  const bankBalance = (chartOfAccounts.find(a => a.code === '1112' || a.code === '1200')?.openingBalanceDebit || 0) +
    journalEntries.filter(e => e.status === 'posted').reduce((acc, e) => {
      const dr = e.lines.filter(l => l.accountCode.startsWith('1112') || l.accountCode === '1200').reduce((s, l) => s + l.debit, 0);
      const cr = e.lines.filter(l => l.accountCode.startsWith('1112') || l.accountCode === '1200').reduce((s, l) => s + l.credit, 0);
      return acc + (dr - cr);
    }, 0);

  // Receivables & Payables
  const totalReceivablesAR = salesInvoices.reduce((acc, i) => acc + i.balanceDue, 0);
  const totalPayablesAP = vendorBills.reduce((acc, b) => acc + b.balanceDue, 0);
  const totalCustomerAdvances = customerAdvances.filter(a => a.status !== 'fully_applied').reduce((acc, a) => acc + a.remainingAmount, 0);

  // Checks in pipeline
  const incomingChecksUnderCollection = pdcRecords
    .filter(c => c.type === 'receivable' && (c.status === 'received' || c.status === 'under_collection'))
    .reduce((acc, c) => acc + c.amount, 0);

  const outgoingChecksPending = pdcRecords
    .filter(c => c.type === 'payable' && c.status !== 'cleared')
    .reduce((acc, c) => acc + c.amount, 0);

  // Double-Entry Balance Verification Check across all posted entries
  const totalDebits = journalEntries.filter(e => e.status === 'posted').reduce((s, e) => s + e.totalDebit, 0);
  const totalCredits = journalEntries.filter(e => e.status === 'posted').reduce((s, e) => s + e.totalCredit, 0);
  const isSystemBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  // Recent journal entries
  const recentEntries = [...journalEntries].reverse().slice(0, 6);

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl">
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <Scale className="w-3.5 h-3.5" />
            <span>نظام الحسابات العامة والقيد المزدوج — Double-Entry Financial Backbone</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <Landmark className="w-8 h-8 text-[#C87A38]" />
            <span>لوحة المؤشرات والرقابة المالية</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            متابعة السيولة النقدية، أرصدة البنوك، التحصيلات المستحقة، التزامات الموردين، وإثبات قيود اليومية الآلية واليدوية المتوافقة مع معايير المحاسبة المصرية والدولية.
          </p>
        </div>

        {/* System Integrity Balance Badge */}
        <div className="p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs flex items-center gap-3">
          {isSystemBalanced ? (
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/40 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="text-xs font-bold text-slate-200">سلامة وتوازن القيود (System Balance)</div>
            <div className={`text-sm font-black ${isSystemBalanced ? 'text-emerald-300' : 'text-rose-300'}`}>
              {isSystemBalanced ? 'القيود متوازنة تماماً (Σ مدين = Σ دائن)' : 'يوجد عدم اتزان في القيود!'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cash & Bank */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي السيولة (خزينة + بنوك)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {(cashOnHand + bankBalance).toLocaleString()} <span className="text-xs font-bold text-slate-400">EGP</span>
          </div>
          <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>الخزينة: {cashOnHand.toLocaleString()}</span>
            <span>البنك: {bankBalance.toLocaleString()}</span>
          </div>
        </div>

        {/* Receivables AR */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">مستحقات العملاء (AR - 1121)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-blue-700">
            {totalReceivablesAR.toLocaleString()} <span className="text-xs font-bold text-slate-400">EGP</span>
          </div>
          <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>شيكات تحت التحصيل:</span>
            <span className="font-mono text-slate-700">{incomingChecksUnderCollection.toLocaleString()} EGP</span>
          </div>
        </div>

        {/* Payables AP */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">التزامات الموردين (AP - 2111)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-rose-600">
            {totalPayablesAP.toLocaleString()} <span className="text-xs font-bold text-slate-400">EGP</span>
          </div>
          <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>شيكات آجلة مستحقة:</span>
            <span className="font-mono text-slate-700">{outgoingChecksPending.toLocaleString()} EGP</span>
          </div>
        </div>

        {/* Customer Advances Under Execution */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">عربين ودفعات مقدمة (2120)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-800">
            {totalCustomerAdvances.toLocaleString()} <span className="text-xs font-bold text-slate-400">EGP</span>
          </div>
          <div className="text-[11px] font-bold text-amber-700 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>التزام واجب التسوية عند التوريد</span>
          </div>
        </div>
      </div>

      {/* 3. QUICK NAVIGATION TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <button
          onClick={() => setActiveModule('acc_coa')}
          className="p-4 rounded-3xl bg-white hover:bg-amber-50/80 border border-slate-200/80 hover:border-[#C87A38]/40 transition-all text-right shadow-xs space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#C87A38] group-hover:bg-[#C87A38] group-hover:text-white flex items-center justify-center transition-colors">
            <FolderTree className="w-5 h-5" />
          </div>
          <div className="font-black text-xs md:text-sm text-slate-900 group-hover:text-[#361D13]">
            دليل وشجرة الحسابات
          </div>
          <p className="text-[11px] text-slate-400 font-medium">الهيكل الشجري والأرصدة المجمعة</p>
        </button>

        <button
          onClick={() => setActiveModule('acc_entries')}
          className="p-4 rounded-3xl bg-white hover:bg-amber-50/80 border border-slate-200/80 hover:border-[#C87A38]/40 transition-all text-right shadow-xs space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#C87A38] group-hover:bg-[#C87A38] group-hover:text-white flex items-center justify-center transition-colors">
            <Scale className="w-5 h-5" />
          </div>
          <div className="font-black text-xs md:text-sm text-slate-900 group-hover:text-[#361D13]">
            قيود اليومية والأستاذ
          </div>
          <p className="text-[11px] text-slate-400 font-medium">إنشاء القيود وعكس العمليات</p>
        </button>

        <button
          onClick={() => setActiveModule('acc_invoices')}
          className="p-4 rounded-3xl bg-white hover:bg-amber-50/80 border border-slate-200/80 hover:border-[#C87A38]/40 transition-all text-right shadow-xs space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#C87A38] group-hover:bg-[#C87A38] group-hover:text-white flex items-center justify-center transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <div className="font-black text-xs md:text-sm text-slate-900 group-hover:text-[#361D13]">
            المبيعات والعربين
          </div>
          <p className="text-[11px] text-slate-400 font-medium">الفواتير الضريبية 14% والدفعات</p>
        </button>

        <button
          onClick={() => setActiveModule('acc_bills')}
          className="p-4 rounded-3xl bg-white hover:bg-amber-50/80 border border-slate-200/80 hover:border-[#C87A38]/40 transition-all text-right shadow-xs space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#C87A38] group-hover:bg-[#C87A38] group-hover:text-white flex items-center justify-center transition-colors">
            <Receipt className="w-5 h-5" />
          </div>
          <div className="font-black text-xs md:text-sm text-slate-900 group-hover:text-[#361D13]">
            المشتريات و GR/IR
          </div>
          <p className="text-[11px] text-slate-400 font-medium">فواتير الموردين وخصم المنبع 1%</p>
        </button>

        <button
          onClick={() => setActiveModule('acc_reports')}
          className="p-4 rounded-3xl bg-white hover:bg-amber-50/80 border border-slate-200/80 hover:border-[#C87A38]/40 transition-all text-right shadow-xs space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#C87A38] group-hover:bg-[#C87A38] group-hover:text-white flex items-center justify-center transition-colors">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="font-black text-xs md:text-sm text-slate-900 group-hover:text-[#361D13]">
            القوائم والتقارير
          </div>
          <p className="text-[11px] text-slate-400 font-medium">ميزان المراجعة، الدخل، والميزانية</p>
        </button>
      </div>

      {/* 4. RECENT JOURNAL ENTRIES STREAM */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#C87A38]" />
            <h2 className="font-black text-sm text-slate-900">سجل أحدث قيود اليومية المرحّلة</h2>
          </div>
          <button
            onClick={() => setActiveModule('acc_entries')}
            className="text-xs font-black text-[#C87A38] hover:underline"
          >
            عرض كافة القيود ({journalEntries.length}) ←
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80">
                <th className="py-3.5 px-3 min-w-[80px]">رقم القيد</th>
                <th className="py-3.5 px-3 min-w-[70px]">التاريخ</th>
                <th className="py-3.5 px-3 min-w-[110px]">دفتر اليومية</th>
                <th className="py-3.5 px-3 min-w-[140px]">البيان والشرح</th>
                <th className="py-3.5 px-3 min-w-[70px]">المرجع</th>
                <th className="py-3.5 px-3 min-w-[80px] text-left">إجمالي القيد</th>
                <th className="py-3.5 px-3 min-w-[80px] text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">{entry.entryNumber}</td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono text-xs whitespace-nowrap">{entry.date}</td>
                  <td className="py-3.5 px-3">
                    <span className="inline-block px-2.5 py-1 rounded-xl text-[11px] font-black bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs leading-snug">
                      {entry.journalName || entry.journalId}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-800 leading-relaxed">{entry.description}</td>
                  <td className="py-3.5 px-3 text-slate-500 text-[11px] leading-relaxed">{entry.reference}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900 text-left whitespace-nowrap">
                    {entry.totalDebit.toLocaleString()} EGP
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>مرحل بالكامل</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
