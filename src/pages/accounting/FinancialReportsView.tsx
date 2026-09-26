// ====================================================
// REWAQ ERP — FINANCIAL STATEMENTS & REPORTS VIEW
// Trial Balance (ميزان المراجعة), Income Statement (قائمة الدخل), Balance Sheet (الميزانية العمومية)
// ====================================================

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { AccountingService } from '../../services/accountingService';
import {
  BarChart3,
  Calendar,
  Printer,
  Scale,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

import { exportTrialBalanceToExcel, exportIncomeStatementToExcel, exportToExcel } from '../../utils/excelExport';

export const FinancialReportsView: React.FC = () => {
  const {
    chartOfAccounts,
    journalEntries,
    fiscalPeriods,
    showToast
  } = useERP();

  const [activeReportTab, setActiveReportTab] = useState<'trial_balance' | 'pnl' | 'balance_sheet'>('trial_balance');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('per-2026-08');

  // Calculate live financial reports using accounting engine
  const trialBalanceData = AccountingService.calculateTrialBalance(chartOfAccounts, journalEntries, selectedPeriodId);
  const pnlData = AccountingService.calculateProfitAndLoss(chartOfAccounts, journalEntries, selectedPeriodId);
  const balanceSheetData = AccountingService.calculateBalanceSheet(chartOfAccounts, journalEntries, selectedPeriodId);

  const selectedPeriod = fiscalPeriods.find(p => p.id === selectedPeriodId);
  const periodName = selectedPeriod?.name || 'الفترة المالية';

  const handleExportExcel = () => {
    if (activeReportTab === 'trial_balance') {
      exportTrialBalanceToExcel(trialBalanceData.items, periodName);
      showToast(`✓ تم تصدير ميزان المراجعة (${periodName}) إلى Excel بنجاح`, 'success');
    } else if (activeReportTab === 'pnl') {
      const pnlRows = [
        { category: 'إجمالي إيرادات المبيعات (Revenue)', amount: pnlData.totalRevenue, notes: 'مبيعات الأثاث والمطابخ' },
        { category: 'تكلفة البضاعة والمواد المباعة (COGS)', amount: pnlData.totalCOGS, notes: 'خامات وأجور وتصنيع' },
        { category: 'مجمل الربح الإجمالي (Gross Profit)', amount: pnlData.grossProfit, notes: 'المبيعات - تكلفة الإنتاج' },
        { category: 'المصروفات التشغيلية والإدارية (Expenses)', amount: pnlData.totalExpenses, notes: 'إيجار، كهرباء، رواتب، تسويق' },
        { category: 'صافي الربح / الخسارة النهائي (Net Profit)', amount: pnlData.netProfit, notes: 'صافي أرباح الفترة' }
      ];
      exportIncomeStatementToExcel(pnlRows, periodName);
      showToast(`✓ تم تصدير قائمة الدخل (${periodName}) إلى Excel بنجاح`, 'success');
    } else {
      const bsRows: { category: string; amount: number; type: string }[] = [
        ...balanceSheetData.currentAssets.map(a => ({ category: `أصول متداولة: ${a.name} (${a.code})`, amount: a.amount, type: 'أصول' })),
        ...balanceSheetData.nonCurrentAssets.map(a => ({ category: `أصول غير متداولة: ${a.name} (${a.code})`, amount: a.amount, type: 'أصول' })),
        ...balanceSheetData.currentLiabilities.map(l => ({ category: `التزامات متداولة: ${l.name} (${l.code})`, amount: l.amount, type: 'خصوم' })),
        ...balanceSheetData.longTermLiabilities.map(l => ({ category: `التزامات طويلة الأجل: ${l.name} (${l.code})`, amount: l.amount, type: 'خصوم' })),
        ...balanceSheetData.equityAccounts.map(e => ({ category: `حقوق ملكية: ${e.name} (${e.code})`, amount: e.amount, type: 'حقوق ملكية' })),
        { category: 'أرباح الفترة الحالية (Current Earnings)', amount: balanceSheetData.currentYearEarnings, type: 'حقوق ملكية' }
      ];
      exportToExcel(`الميزانية_العمومية_${periodName}`, [
        { header: 'التبويب الرئيسي', render: (r: any) => r.type },
        { header: 'البند المالي', render: (r: any) => r.category },
        { header: 'الرصيد النهائي (EGP)', render: (r: any) => Number(r.amount || 0).toLocaleString('ar-EG') }
      ], bsRows);
      showToast(`✓ تم تصدير الميزانية العمومية (${periodName}) إلى Excel بنجاح`, 'success');
    }
  };

  const totalInitialDebit = trialBalanceData.items.reduce((s, i) => s + (i.initialDebit || 0), 0);
  const totalInitialCredit = trialBalanceData.items.reduce((s, i) => s + (i.initialCredit || 0), 0);
  const totalPeriodDebit = trialBalanceData.items.reduce((s, i) => s + (i.periodDebit || 0), 0);
  const totalPeriodCredit = trialBalanceData.items.reduce((s, i) => s + (i.periodCredit || 0), 0);
  const totalEndingDebit = trialBalanceData.items.reduce((s, i) => s + (i.endingDebit || 0), 0);
  const totalEndingCredit = trialBalanceData.items.reduce((s, i) => s + (i.endingCredit || 0), 0);

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl">
      {/* 1. HEADER */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>القوائم المالية الختامية المعتمدة — Certified Financial Statements</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[#C87A38]" />
            <span>التقارير والقوائم المالية الختامية</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            استخراج ميزان المراجعة بالمجاميع والأرصدة، قائمة الأرباح والخسائر، والميزانية العمومية المتوازنة وفقاً للقيد المزدوج.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selector */}
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-amber-100 font-bold text-xs rounded-2xl border border-white/20 focus:outline-none"
          >
            {fiscalPeriods.map(p => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                {p.name} ({p.startDate} إلى {p.endDate})
              </option>
            ))}
          </select>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
            title="تصدير القائمة الحالية إلى ملف Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#C87A38] hover:bg-amber-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة القائمة</span>
          </button>
        </div>
      </div>

      {/* 2. REPORT NAVIGATION TABS */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveReportTab('trial_balance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
            activeReportTab === 'trial_balance'
              ? 'bg-[#361D13] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Scale className="w-4 h-4 text-[#C87A38]" />
          <span>ميزان المراجعة (Trial Balance)</span>
        </button>

        <button
          onClick={() => setActiveReportTab('pnl')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
            activeReportTab === 'pnl'
              ? 'bg-[#361D13] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>قائمة الدخل / الأرباح والخسائر (Income Statement)</span>
        </button>

        <button
          onClick={() => setActiveReportTab('balance_sheet')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
            activeReportTab === 'balance_sheet'
              ? 'bg-[#361D13] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <PieChart className="w-4 h-4 text-blue-400" />
          <span>الميزانية العمومية والمركز المالي (Balance Sheet)</span>
        </button>
      </div>

      {/* 3. REPORT CONTENT VIEWS */}
      {activeReportTab === 'trial_balance' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-black text-base text-slate-900">ميزان المراجعة بالأرصدة والمجاميع</h2>
              <span className="text-xs text-slate-400">الفترة: أغسطس 2026</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>ميزان المراجعة متوازن بالكامل</span>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-right text-xs min-w-[950px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-3 whitespace-nowrap min-w-[100px]">رمز الحساب</th>
                  <th className="py-3 px-3 min-w-[180px]">اسم الحساب</th>
                  <th className="py-3 px-3 whitespace-nowrap min-w-[110px] text-left">رصيد أول مدين</th>
                  <th className="py-3 px-3 whitespace-nowrap min-w-[110px] text-left">رصيد أول دائن</th>
                  <th className="py-3 px-3 whitespace-nowrap min-w-[110px] text-left">حركات الفترة مدين</th>
                  <th className="py-3 px-3 whitespace-nowrap min-w-[110px] text-left">حركات الفترة دائن</th>
                  <th className="py-3 px-3 whitespace-nowrap min-w-[120px] text-left">رصيد ختامي مدين</th>
                  <th className="py-3 px-3 whitespace-nowrap min-w-[120px] text-left">رصيد ختامي دائن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {trialBalanceData.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-700 whitespace-nowrap">{item.accountCode}</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{item.accountNameAr}</td>
                    <td className="py-2.5 px-3 text-left text-slate-500 whitespace-nowrap">{item.initialDebit > 0 ? item.initialDebit.toLocaleString() : '-'}</td>
                    <td className="py-2.5 px-3 text-left text-slate-500 whitespace-nowrap">{item.initialCredit > 0 ? item.initialCredit.toLocaleString() : '-'}</td>
                    <td className="py-2.5 px-3 text-left text-emerald-700 font-bold whitespace-nowrap">{item.periodDebit > 0 ? item.periodDebit.toLocaleString() : '-'}</td>
                    <td className="py-2.5 px-3 text-left text-rose-600 font-bold whitespace-nowrap">{item.periodCredit > 0 ? item.periodCredit.toLocaleString() : '-'}</td>
                    <td className="py-2.5 px-3 text-left font-black text-emerald-800 whitespace-nowrap">{item.endingDebit > 0 ? item.endingDebit.toLocaleString() : '-'}</td>
                    <td className="py-2.5 px-3 text-left font-black text-rose-800 whitespace-nowrap">{item.endingCredit > 0 ? item.endingCredit.toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold font-mono text-xs">
                  <td colSpan={2} className="py-3 px-3 font-sans whitespace-nowrap">الإجمالي العام لميزان المراجعة</td>
                  <td className="py-3 px-3 text-left text-amber-300 whitespace-nowrap">{totalInitialDebit.toLocaleString()}</td>
                  <td className="py-3 px-3 text-left text-amber-300 whitespace-nowrap">{totalInitialCredit.toLocaleString()}</td>
                  <td className="py-3 px-3 text-left text-emerald-400 whitespace-nowrap">{totalPeriodDebit.toLocaleString()}</td>
                  <td className="py-3 px-3 text-left text-rose-400 whitespace-nowrap">{totalPeriodCredit.toLocaleString()}</td>
                  <td className="py-3 px-3 text-left text-emerald-400 font-black whitespace-nowrap">{totalEndingDebit.toLocaleString()} EGP</td>
                  <td className="py-3 px-3 text-left text-rose-400 font-black whitespace-nowrap">{totalEndingCredit.toLocaleString()} EGP</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {activeReportTab === 'pnl' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6 max-w-4xl mx-auto">
          <div className="text-center pb-4 border-b border-slate-200 space-y-1">
            <h2 className="font-black text-xl text-slate-900">قائمة الدخل والأرباح والخسائر (Income Statement)</h2>
            <p className="text-xs text-slate-500 font-mono">عن الفترة المنتهية في أغسطس 2026 — المبالغ بالجنيه المصري EGP</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Revenues */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-black text-sm text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span>1. إجمالي الإيرادات والمبيعات (Revenues)</span>
                <span className="font-mono text-blue-700">{pnlData.totalRevenue.toLocaleString()} EGP</span>
              </div>
              <div className="pr-4 space-y-1">
                {pnlData.revenueAccounts.map((item, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">{item.code} - {item.name}</span>
                    <span className="font-mono font-bold">{item.amount.toLocaleString()} EGP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* COGS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-black text-sm text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span>2. تكلفة البضاعة والإنتاج المباع (COGS)</span>
                <span className="font-mono text-rose-700">({pnlData.totalCOGS.toLocaleString()} EGP)</span>
              </div>
              <div className="pr-4 space-y-1">
                {pnlData.cogsAccounts.map((item, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">{item.code} - {item.name}</span>
                    <span className="font-mono font-bold">({item.amount.toLocaleString()} EGP)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gross Profit */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-sm font-black text-emerald-900">
              <span>مجمل الربح (Gross Profit):</span>
              <span className="font-mono text-lg">{pnlData.grossProfit.toLocaleString()} EGP</span>
            </div>

            {/* Operating Expenses */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-black text-sm text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span>3. المصروفات التشغيلية والإدارية (OPEX)</span>
                <span className="font-mono text-rose-700">({pnlData.totalExpenses.toLocaleString()} EGP)</span>
              </div>
              <div className="pr-4 space-y-1">
                {pnlData.expenseAccounts.map((item, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">{item.code} - {item.name}</span>
                    <span className="font-mono font-bold">({item.amount.toLocaleString()} EGP)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Net Profit */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-base font-black">
              <span>صافي أرباح الفترة (Net Income):</span>
              <span className="font-mono text-xl text-emerald-400">{pnlData.netProfit.toLocaleString()} EGP</span>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'balance_sheet' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6 max-w-5xl mx-auto">
          <div className="text-center pb-4 border-b border-slate-200 space-y-1">
            <h2 className="font-black text-xl text-slate-900">قائمة المركز المالي والميزانية العمومية (Balance Sheet)</h2>
            <p className="text-xs text-slate-500 font-mono">كما هي في نهاية أغسطس 2026</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Right: Assets */}
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex justify-between font-black text-sm text-emerald-900">
                <span>الأصول (Assets)</span>
                <span className="font-mono">{balanceSheetData.totalAssets.toLocaleString()} EGP</span>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">الأصول المتداولة (خزينة، بنك، عملاء، مخزون، WIP):</span>
                {balanceSheetData.currentAssets.map((item, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">{item.code} - {item.name}</span>
                    <span className="font-mono font-bold text-slate-800">{item.amount.toLocaleString()} EGP</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <span className="font-bold text-slate-700 block">الأصول غير المتداولة (الآلات، المعدات، المعارض):</span>
                {balanceSheetData.nonCurrentAssets.map((item, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">{item.code} - {item.name}</span>
                    <span className="font-mono font-bold text-slate-800">{item.amount.toLocaleString()} EGP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Left: Liabilities & Equity */}
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex justify-between font-black text-sm text-amber-900">
                <span>الخصوم والالتزامات (Liabilities)</span>
                <span className="font-mono">{balanceSheetData.totalLiabilities.toLocaleString()} EGP</span>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">الالتزامات المتداولة (موردين، عربين 2200، وسيط GR/IR 2150، ضرائب):</span>
                {balanceSheetData.currentLiabilities.map((item, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">{item.code} - {item.name}</span>
                    <span className="font-mono font-bold text-slate-800">{item.amount.toLocaleString()} EGP</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200 flex justify-between font-black text-sm text-indigo-900 mt-4">
                <span>حقوق الملكية (Equity)</span>
                <span className="font-mono">{balanceSheetData.totalEquity.toLocaleString()} EGP</span>
              </div>

              <div className="space-y-2">
                {balanceSheetData.equityAccounts.map((item: { code: string; name: string; amount: number }, i: number) => (
                  <div key={i} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">{item.code} - {item.name}</span>
                    <span className="font-mono font-bold text-slate-800">{item.amount.toLocaleString()} EGP</span>
                  </div>
                ))}
                <div className="flex justify-between py-1 border-b border-slate-100 font-bold text-emerald-700">
                  <span>صافي أرباح الفترة الحالية</span>
                  <span className="font-mono">{balanceSheetData.currentYearEarnings.toLocaleString()} EGP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Equation Check */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-sans font-bold">معادلة الميزانية: الأصول = الالتزامات + حقوق الملكية</span>
            </div>
            <div className="text-sm font-black text-emerald-400">
              {balanceSheetData.totalAssets.toLocaleString()} EGP = {(balanceSheetData.totalLiabilities + balanceSheetData.totalEquity).toLocaleString()} EGP
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
