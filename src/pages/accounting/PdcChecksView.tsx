// ====================================================
// REWAQ ERP — POST-DATED CHECKS (PDC) VIEW (أوراق القبض والدفع)
// Full Check Lifecycle: Received -> Under Collection -> Cleared / Bounced
// ====================================================

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { PDCRecord, CheckStatus } from '../../types/accounting';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Landmark,
  ShieldCheck,
  RefreshCw,
  Building2
} from 'lucide-react';

export const PdcChecksView: React.FC = () => {
  const {
    pdcRecords,
    updatePdcStatus,
    showToast,
    setActiveModule
  } = useERP();

  const [activeTab, setActiveTab] = useState<'receivable' | 'payable'>('receivable');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // KPIs
  const totalReceivables = pdcRecords.filter(c => c.type === 'receivable').reduce((s, c) => s + c.amount, 0);
  const totalPayables = pdcRecords.filter(c => c.type === 'payable').reduce((s, c) => s + c.amount, 0);
  const pendingCollection = pdcRecords.filter(c => c.type === 'receivable' && (c.status === 'received' || c.status === 'under_collection')).reduce((s, c) => s + c.amount, 0);

  // Status Action Handler
  const handleStatusChange = (checkId: string, newStatus: CheckStatus) => {
    updatePdcStatus(checkId, newStatus);
    showToast(`تم تحديث حالة الشيك إلى (${
      newStatus === 'under_collection' ? 'برسم التحصيل' :
      newStatus === 'cleared' ? 'محصل بنكياً' :
      newStatus === 'bounced' ? 'مرتد ومرفوض' : 'مستلم'
    }) بنجاح`, 'success');
  };

  const filteredChecks = pdcRecords.filter(c => {
    const matchesType = c.type === activeTab;
    const matchesSearch =
      !searchQuery ||
      c.checkNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.partnerName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl">
      {/* 1. HEADER */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <CreditCard className="w-3.5 h-3.5" />
            <span>حقيبة الشيكات والأوراق المالية — Post-Dated Checks Portfolio</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-[#C87A38]" />
            <span>إدارة أوراق القبض والدفع (الشيكات الآجلة)</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            متابعة دورة حياة الشيكات البنكية من الاستلام والإيداع برسم التحصيل (حساب 1113) وحتى المقاصة النهائية في البنك أو الارتداد.
          </p>
        </div>

        <button
          onClick={() => setActiveModule('acc_entries')}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-amber-100 font-bold text-xs rounded-2xl border border-white/20 transition-all shadow-lg"
        >
          <Landmark className="w-4 h-4 text-amber-300" />
          <span>قيود المقاصة البنكية</span>
        </button>
      </div>

      {/* 2. KPI SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">إجمالي شيكات أوراق القبض (1122)</span>
          <div className="text-2xl font-black font-mono text-blue-700">
            {totalReceivables.toLocaleString()} <span className="text-xs font-bold text-slate-400">EGP</span>
          </div>
          <div className="text-[11px] text-blue-600 font-bold">مستلمة من عملاء المشاريع والتفصيل</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">شيكات تحت التحصيل بالبنك (1113)</span>
          <div className="text-2xl font-black font-mono text-emerald-700">
            {pendingCollection.toLocaleString()} <span className="text-xs font-bold text-slate-400">EGP</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold">مودعة برسم المقاصة البنكية</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">شيكات أوراق الدفع للموردين (2112)</span>
          <div className="text-2xl font-black font-mono text-rose-600">
            {totalPayables.toLocaleString()} <span className="text-xs font-bold text-slate-400">EGP</span>
          </div>
          <div className="text-[11px] text-rose-500 font-bold">تستحق الصرف من البنك</div>
        </div>
      </div>

      {/* 3. TOOLBAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('receivable')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'receivable'
                ? 'bg-[#361D13] text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>شيكات أوراق القبض ({pdcRecords.filter(c => c.type === 'receivable').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payable')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'payable'
                ? 'bg-[#361D13] text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-rose-400" />
            <span>شيكات أوراق الدفع ({pdcRecords.filter(c => c.type === 'payable').length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم الشيك، اسم البنك، أو الطرف..."
            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
          />
        </div>
      </div>

      {/* 4. CHECKS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80">
                <th className="py-3.5 px-3 whitespace-nowrap min-w-[80px]">رقم الشيك</th>
                <th className="py-3.5 px-3 min-w-[100px]">البنك المسحوب عليه</th>
                <th className="py-3.5 px-3 min-w-[110px]">اسم الطرف / العميل</th>
                <th className="py-3.5 px-3 whitespace-nowrap min-w-[70px]">تاريخ الاستحقاق</th>
                <th className="py-3.5 px-3 whitespace-nowrap min-w-[80px] text-left">قيمة الشيك</th>
                <th className="py-3.5 px-3 whitespace-nowrap min-w-[80px] text-center">الحالة الحالية</th>
                <th className="py-3.5 px-3 whitespace-nowrap min-w-[100px] text-center">إجراءات دورة الحياة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredChecks.map(check => (
                <tr key={check.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">{check.checkNumber}</td>
                  <td className="py-3.5 px-3 font-sans font-bold text-slate-800">{check.bankName}</td>
                  <td className="py-3.5 px-3 font-sans text-slate-700">{check.partnerName}</td>
                  <td className="py-3.5 px-3 text-slate-600 font-mono text-xs whitespace-nowrap">{check.dueDate}</td>
                  <td className="py-3.5 px-3 text-left font-black text-slate-900 whitespace-nowrap">{check.amount.toLocaleString()} EGP</td>
                  <td className="py-3.5 px-3 text-center font-sans whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black shadow-2xs whitespace-nowrap ${
                      check.status === 'cleared' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      check.status === 'under_collection' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      check.status === 'bounced' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {check.status === 'received' && 'مستلم بالخزينة'}
                      {check.status === 'under_collection' && 'برسم التحصيل بالبنك'}
                      {check.status === 'cleared' && 'تم التحصيل والمقاصة'}
                      {check.status === 'bounced' && 'مرتد ومرفوض'}
                      {check.status === 'returned' && 'مرجع للطرف'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-sans whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                      {check.status === 'received' && check.type === 'receivable' && (
                        <button
                          onClick={() => handleStatusChange(check.id, 'under_collection')}
                          className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 text-[11px] font-bold border border-blue-200 shadow-2xs whitespace-nowrap"
                        >
                          إيداع للتحصيل
                        </button>
                      )}

                      {(check.status === 'under_collection' || check.status === 'received') && (
                        <button
                          onClick={() => handleStatusChange(check.id, 'cleared')}
                          className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[11px] font-bold border border-emerald-200 shadow-2xs whitespace-nowrap"
                        >
                          تحصيل بنكي ✓
                        </button>
                      )}

                      {check.status !== 'cleared' && check.status !== 'bounced' && (
                        <button
                          onClick={() => handleStatusChange(check.id, 'bounced')}
                          className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-800 hover:bg-rose-100 text-[11px] font-bold border border-rose-200 shadow-2xs whitespace-nowrap"
                        >
                          ارتداد الشيك ✕
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
  );
};
