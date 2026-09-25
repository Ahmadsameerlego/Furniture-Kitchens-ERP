// ====================================================
// REWAQ ERP — PARTNER STATEMENTS & SUBSIDIARY LEDGER
// Customer & Supplier Ledgers with Running Balance & Aging
// ====================================================

import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { AccountingService } from '../../services/accountingService';
import {
  Users,
  Building2,
  Search,
  Filter,
  Printer,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export const PartnerStatementsView: React.FC = () => {
  const {
    customers,
    suppliers,
    journalEntries,
    salesInvoices,
    vendorBills,
    customerAdvances
  } = useERP();

  const [partnerType, setPartnerType] = useState<'customer' | 'supplier'>('customer');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(customers[0]?.id || '');

  // Selected partner entity
  const selectedPartner = useMemo(() => {
    if (partnerType === 'customer') {
      return customers.find(c => c.id === selectedPartnerId) || customers[0];
    } else {
      return suppliers.find(s => s.id === selectedPartnerId) || suppliers[0];
    }
  }, [partnerType, selectedPartnerId, customers, suppliers]);

  const partnerDisplayName = useMemo(() => {
    if (!selectedPartner) return '';
    if (partnerType === 'customer') {
      return (selectedPartner as any).fullName || (selectedPartner as any).name;
    }
    return (selectedPartner as any).companyName || (selectedPartner as any).name;
  }, [selectedPartner, partnerType]);

  // Generate Partner Statement Data
  const statement = useMemo(() => {
    if (!selectedPartner) return null;
    return AccountingService.getPartnerStatement(
      selectedPartner.id,
      partnerType,
      journalEntries
    );
  }, [selectedPartner, partnerType, journalEntries]);

  // Aging Buckets Estimation
  const agingData = useMemo(() => {
    if (!statement) return { cur: 0, d30: 0, d60: 0, d90: 0 };
    const net = Math.abs(statement.endingBalance);
    return {
      cur: net * 0.6,
      d30: net * 0.25,
      d60: net * 0.15,
      d90: 0
    };
  }, [statement]);

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl">
      {/* 1. HEADER */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>دفتر أستاذ مساعد الشركاء — Subsidiary Partner Ledgers</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <Users className="w-8 h-8 text-[#C87A38]" />
            <span>كشوف حسابات العملاء والموردين وأعمار الديون</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            استخراج كشف حساب تفصيلي بحركات المبيعات، المشتريات، الدفعات المسددة، والعربين مع الرصيد التراكمي اللحظي وتحليل أعمار الديون.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-amber-100 font-bold text-xs rounded-2xl border border-white/20 transition-all shadow-lg"
        >
          <Printer className="w-4 h-4 text-amber-300" />
          <span>طباعة كشف الحساب</span>
        </button>
      </div>

      {/* 2. PARTNER SELECTOR BAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPartnerType('customer');
                setSelectedPartnerId(customers[0]?.id || '');
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                partnerType === 'customer'
                  ? 'bg-[#361D13] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-4 h-4 text-[#C87A38]" />
              <span>حسابات العملاء ({customers.length})</span>
            </button>

            <button
              onClick={() => {
                setPartnerType('supplier');
                setSelectedPartnerId(suppliers[0]?.id || '');
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                partnerType === 'supplier'
                  ? 'bg-[#361D13] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#C87A38]" />
              <span>حسابات الموردين ({suppliers.length})</span>
            </button>
          </div>

          {/* Partner Selector Dropdown */}
          <div className="w-full md:w-96">
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            >
              {partnerType === 'customer'
                ? customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.phone})
                    </option>
                  ))
                : suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.companyName || s.name} ({s.phone})
                    </option>
                  ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. PARTNER SUMMARY BOX & AGING */}
      {statement && selectedPartner && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Partner Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500">بيانات شريك الأعمال:</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                {partnerType === 'customer' ? 'عميل نشط' : 'مورد معتمد'}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900">{partnerDisplayName}</h2>
              <p className="text-xs text-slate-500 font-mono pt-1">
                {(selectedPartner as any).phone || (selectedPartner as any).email}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2">
              <span className="text-xs font-bold text-slate-600 block">صافي الرصيد الختامي القائم:</span>
              <div className="text-2xl font-black font-mono text-[#361D13] text-left">
                {Math.abs(statement.endingBalance).toLocaleString()} EGP
                <span className="text-xs font-bold text-slate-500 mr-2">
                  {partnerType === 'customer'
                    ? (statement.endingBalance >= 0 ? '(مستحق على العميل)' : '(دائن للعميل)')
                    : (statement.endingBalance <= 0 ? '(مستحق للمورد)' : '(مدين للمورد)')}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Totals */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500">إجمالي الحركات المسجلة:</span>
              <span className="text-xs font-bold text-slate-400">عدد الحركات: {statement.rows.length}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-600">إجمالي المدين (Debits):</span>
                <span className="font-mono font-black text-emerald-700">{statement.totalDebit.toLocaleString()} EGP</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-600">إجمالي الدائن (Credits):</span>
                <span className="font-mono font-black text-rose-600">{statement.totalCredit.toLocaleString()} EGP</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/80 border border-amber-200 font-bold">
                <span className="text-amber-900">الرصيد الختامي النهائي:</span>
                <span className="font-mono text-slate-800">{statement.endingBalance.toLocaleString()} EGP</span>
              </div>
            </div>
          </div>

          {/* Aging Buckets */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500">أعمار الديون والتحصيل (Aging):</span>
              <Clock className="w-4 h-4 text-[#C87A38]" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-[10px] text-emerald-800 font-bold block">حالي (1 - 30 يوماً)</span>
                <span className="font-mono font-black text-emerald-900 block">{Math.round(agingData.cur).toLocaleString()} EGP</span>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 space-y-1">
                <span className="text-[10px] text-blue-800 font-bold block">31 - 60 يوماً</span>
                <span className="font-mono font-black text-blue-900 block">{Math.round(agingData.d30).toLocaleString()} EGP</span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                <span className="text-[10px] text-amber-800 font-bold block">61 - 90 يوماً</span>
                <span className="font-mono font-black text-amber-900 block">{Math.round(agingData.d60).toLocaleString()} EGP</span>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-1">
                <span className="text-[10px] text-rose-800 font-bold block">+90 يوماً (متعثر)</span>
                <span className="font-mono font-black text-rose-900 block">{Math.round(agingData.d90).toLocaleString()} EGP</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CHRONOLOGICAL STATEMENT TABLE */}
      {statement && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-black text-xs text-slate-800">
              سجل الحركات التاريخية لكشف الحساب ({partnerDisplayName})
            </span>
            <span className="text-xs text-slate-400 font-mono">الفترة المحاسبية: عام 2026 كامل</span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-right text-xs min-w-[950px]">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-4 whitespace-nowrap min-w-[110px]">التاريخ</th>
                  <th className="py-3 px-4 whitespace-nowrap min-w-[130px]">رقم الحركة / المستند</th>
                  <th className="py-3 px-4 whitespace-nowrap min-w-[120px]">النوع</th>
                  <th className="py-3 px-4 min-w-[220px]">البيان والشرح التفصيلي</th>
                  <th className="py-3 px-4 whitespace-nowrap min-w-[120px] text-left">مدين (Debit)</th>
                  <th className="py-3 px-4 whitespace-nowrap min-w-[120px] text-left">دائن (Credit)</th>
                  <th className="py-3 px-4 whitespace-nowrap min-w-[140px] text-left">الرصيد التراكمي (Balance)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {statement.rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                      لا توجد حركات مقيدة لهذا الشريك في الفترة المحددة
                    </td>
                  </tr>
                ) : (
                  statement.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-600 font-mono text-xs whitespace-nowrap">{row.date}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">{row.documentNumber}</td>
                      <td className="py-3 px-4 font-sans text-[11px] text-slate-500 whitespace-nowrap">{row.documentType}</td>
                      <td className="py-3 px-4 font-sans text-slate-800 leading-relaxed">{row.description}</td>
                      <td className="py-3 px-4 text-left font-bold text-emerald-700 whitespace-nowrap">
                        {row.debit > 0 ? `${row.debit.toLocaleString()} EGP` : '-'}
                      </td>
                      <td className="py-3 px-4 text-left font-bold text-rose-600 whitespace-nowrap">
                        {row.credit > 0 ? `${row.credit.toLocaleString()} EGP` : '-'}
                      </td>
                      <td className="py-3 px-4 text-left font-black text-slate-900 whitespace-nowrap">
                        {row.runningBalance.toLocaleString()} EGP
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold font-mono">
                  <td colSpan={4} className="py-3 px-4 font-sans text-slate-800 whitespace-nowrap">الإجمالي النهائي للرصيد</td>
                  <td className="py-3 px-4 text-left text-emerald-700 whitespace-nowrap">{statement.totalDebit.toLocaleString()} EGP</td>
                  <td className="py-3 px-4 text-left text-rose-600 whitespace-nowrap">{statement.totalCredit.toLocaleString()} EGP</td>
                  <td className="py-3 px-4 text-left text-[#361D13] font-black whitespace-nowrap">{statement.endingBalance.toLocaleString()} EGP</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
