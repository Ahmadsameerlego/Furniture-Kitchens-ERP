// ====================================================
// REWAQ ERP — JOURNAL ENTRIES & GENERAL LEDGER VIEW
// Double-Entry Manual Entries, Validation & Audit Reversal
// ====================================================

import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { JournalEntry, JournalEntryLine } from '../../types/accounting';
import {
  Scale,
  Plus,
  Search,
  Filter,
  ArrowLeftRight,
  Printer,
  ChevronDown,
  ChevronUp,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  Users,
  Eye,
  Trash2,
  FolderTree
} from 'lucide-react';

export const JournalEntriesView: React.FC = () => {
  const {
    chartOfAccounts,
    journals,
    journalEntries,
    costCenters,
    customers,
    suppliers,
    currentUser,
    createManualJournalEntry,
    reverseJournalEntry,
    showToast,
    setActiveModule
  } = useERP();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedJournalFilter, setSelectedJournalFilter] = useState<string>('all');
  const [expandedEntryIds, setExpandedEntryIds] = useState<Set<string>>(new Set());

  // Modal States
  const [showNewEntryModal, setShowNewEntryModal] = useState<boolean>(false);
  const [showReverseModal, setShowReverseModal] = useState<boolean>(false);
  const [entryToReverse, setEntryToReverse] = useState<JournalEntry | null>(null);
  const [reverseReason, setReverseReason] = useState<string>('تصحيح توجيه محاسبي أو خطأ إجرائي');

  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [selectedEntryDetails, setSelectedEntryDetails] = useState<JournalEntry | null>(null);

  // Manual Entry Form State
  const [manualJournalId, setManualJournalId] = useState<string>(journals[4]?.id || 'jrn-gen');
  const [manualDate, setManualDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [manualReference, setManualReference] = useState<string>('قيد تسوية يدوي');
  const [manualDescription, setManualDescription] = useState<string>('إثبات تسوية محاسبية');
  const [manualLines, setManualLines] = useState<
    { accountId: string; debit: number; credit: number; description: string; partnerId?: string; partnerType?: 'customer' | 'supplier'; costCenterId?: string }[]
  >([
    { accountId: chartOfAccounts.find(a => a.code === '5140')?.id || chartOfAccounts[0]?.id || '', debit: 15000, credit: 0, description: 'طرف مدين' },
    { accountId: chartOfAccounts.find(a => a.code === '1110')?.id || chartOfAccounts[1]?.id || '', debit: 0, credit: 15000, description: 'طرف دائن' }
  ]);

  // Expand/collapse entry lines in table
  const toggleRowExpand = (id: string) => {
    const next = new Set(expandedEntryIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedEntryIds(next);
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return journalEntries.filter(entry => {
      const matchesJournal = selectedJournalFilter === 'all' || entry.journalId === selectedJournalFilter;
      const matchesSearch =
        !searchQuery ||
        entry.entryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.lines.some(l => l.accountCode.includes(searchQuery) || (l.accountName && l.accountName.toLowerCase().includes(searchQuery.toLowerCase())));

      return matchesJournal && matchesSearch;
    }).sort((a, b) => b.entryNumber.localeCompare(a.entryNumber));
  }, [journalEntries, selectedJournalFilter, searchQuery]);

  // Form Calculations
  const formTotalDebit = manualLines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const formTotalCredit = manualLines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const isFormBalanced = Math.abs(formTotalDebit - formTotalCredit) < 0.01 && formTotalDebit > 0;

  // Add line to manual entry
  const handleAddLine = () => {
    setManualLines([
      ...manualLines,
      { accountId: chartOfAccounts[0]?.id || '', debit: 0, credit: 0, description: manualDescription }
    ]);
  };

  // Remove line
  const handleRemoveLine = (index: number) => {
    if (manualLines.length <= 2) {
      showToast('يجب أن يحتوي القيد على سطرين على الأقل (طرف مدين وطرف دائن)', 'warning');
      return;
    }
    setManualLines(manualLines.filter((_, i) => i !== index));
  };

  // Handle line change
  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...manualLines];
    updated[index] = { ...updated[index], [field]: value };
    setManualLines(updated);
  };

  // Submit Manual Entry
  const handleCreateEntry = () => {
    if (!isFormBalanced) {
      showToast('القيد غير متوازن! يجب أن يتساوى إجمالي المدين مع إجمالي الدائن.', 'error');
      return;
    }

    const builtLines = manualLines.map((l, idx) => {
      const acc = chartOfAccounts.find(a => a.id === l.accountId);
      return {
        id: `line-${Date.now()}-${idx}`,
        accountId: l.accountId,
        accountCode: acc ? acc.code : '',
        accountName: acc ? (acc.nameAr || acc.name) : '',
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        description: l.description || manualDescription,
        partnerId: l.partnerId,
        partnerType: l.partnerType,
        costCenterId: l.costCenterId
      };
    });

    const res = createManualJournalEntry({
      journalId: manualJournalId,
      date: manualDate,
      periodId: 'per-2026-08',
      reference: manualReference,
      description: manualDescription,
      lines: builtLines
    });

    if (res && res.success) {
      setShowNewEntryModal(false);
      showToast(`تم ترحيل القيد المحاسبي (${res.entry?.entryNumber}) بنجاح`, 'success');
    }
  };

  // Execute Reversal
  const handleExecuteReverse = () => {
    if (!entryToReverse) return;
    const ok = reverseJournalEntry(entryToReverse.id, reverseReason);
    if (ok) {
      setShowReverseModal(false);
      setEntryToReverse(null);
      showToast('تم إنشاء القيد العكسي لتصحيح القيد الأصلي بنجاح', 'success');
    }
  };

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl">
      {/* 1. HEADER */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <Scale className="w-3.5 h-3.5" />
            <span>دفتر الأستاذ والقيود — Double-Entry Journal Ledger</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <Scale className="w-8 h-8 text-[#C87A38]" />
            <span>قيود اليومية العامة ودفتر الأستاذ</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            استعراض كافة القيود الآلية الناتجة عن دورة التصنيع والمبيعات والمشتريات، مع إمكانية إنشاء قيود تسوية يدوية متوازنة وتطبيق معيار عدم الحذف وإمكانية العكس المحاسبي (Reversal).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowNewEntryModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#C87A38] hover:bg-amber-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء قيد يدوي جديد</span>
          </button>

          <button
            onClick={() => setActiveModule('acc_coa')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-amber-100 font-bold text-xs rounded-2xl border border-white/20 transition-all"
          >
            <FolderTree className="w-4 h-4 text-amber-300" />
            <span>شجرة الحسابات</span>
          </button>
        </div>
      </div>

      {/* 2. FILTER & TOOLBAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Journal Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => setSelectedJournalFilter('all')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all ${
                selectedJournalFilter === 'all'
                  ? 'bg-[#361D13] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              كافة الدفاتر ({journalEntries.length})
            </button>
            {journals.map(j => (
              <button
                key={j.id}
                onClick={() => setSelectedJournalFilter(j.id)}
                className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all ${
                  selectedJournalFilter === j.id
                    ? 'bg-[#C87A38] text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {j.nameAr}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-bold">
            عدد القيود المعروضة: {filteredEntries.length}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم القيد، المرجع، البيان، أو رمز واسم الحساب..."
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
          />
        </div>
      </div>

      {/* 3. JOURNAL ENTRIES TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right text-xs min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80">
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">رقم القيد</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[110px]">التاريخ</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[180px]">الدفتر</th>
                <th className="py-3.5 px-4 min-w-[240px]">البيان والشرح</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[120px]">المرجع</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px] text-left">إجمالي القيد</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px] text-center">الحالة</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[110px] text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.map(entry => {
                const isExpanded = expandedEntryIds.has(entry.id);
                return (
                  <React.Fragment key={entry.id}>
                    <tr className="hover:bg-amber-50/40 transition-colors cursor-pointer" onClick={() => toggleRowExpand(entry.id)}>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap flex items-center gap-2">
                        <button className="text-slate-400 hover:text-slate-600">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <span>{entry.entryNumber}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs whitespace-nowrap">{entry.date}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-xl text-[11px] font-black bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs whitespace-nowrap">
                          {journals.find(j => j.id === entry.journalId)?.nameAr || entry.journalId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 leading-relaxed">
                        {entry.description}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">{entry.reference}</td>
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-left whitespace-nowrap">
                        {entry.totalDebit.toLocaleString()} EGP
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                          <span>مرحل بالكامل</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSelectedEntryDetails(entry);
                              setShowDetailsModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                            title="معاينة سند القيد"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {entry.status === 'posted' && !entry.reversalEntryId && (
                            <button
                              onClick={() => {
                                setEntryToReverse(entry);
                                setShowReverseModal(true);
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                              title="عكس القيد المحاسبي"
                            >
                              <ArrowLeftRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Breakdown of Lines */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 border-b border-slate-200">
                        <td colSpan={8} className="p-4">
                          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-600 border-b border-slate-100 pb-2">
                              <span>تفاصيل أطراف القيد المحاسبي:</span>
                              <span className="text-[11px] text-slate-400">بواسطة: {entry.createdByUserName} | التاريخ: {entry.date}</span>
                            </div>

                            <table className="w-full text-right text-xs">
                              <thead>
                                <tr className="text-slate-400 text-[11px] font-bold border-b border-slate-100 pb-1">
                                  <th className="py-1.5 px-2">رمز الحساب</th>
                                  <th className="py-1.5 px-2">اسم الحساب</th>
                                  <th className="py-1.5 px-2">البيان الفرعي</th>
                                  <th className="py-1.5 px-2">مركز التكلفة / الطرف</th>
                                  <th className="py-1.5 px-2 text-left">مدين (Debit)</th>
                                  <th className="py-1.5 px-2 text-left">دائن (Credit)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-mono">
                                {entry.lines.map((line, lidx) => (
                                  <tr key={lidx} className="hover:bg-slate-50">
                                    <td className="py-2 px-2 font-bold text-slate-700">{line.accountCode}</td>
                                    <td className="py-2 px-2 font-sans font-bold text-slate-900">{line.accountName}</td>
                                    <td className="py-2 px-2 font-sans text-slate-500 text-[11px]">{line.description}</td>
                                    <td className="py-2 px-2 font-sans text-slate-600 text-[11px]">
                                      {line.costCenterId ? `مركز: ${line.costCenterId}` : ''}
                                      {line.partnerId ? ` طرف: ${line.partnerId}` : ''}
                                      {!line.costCenterId && !line.partnerId ? '-' : ''}
                                    </td>
                                    <td className="py-2 px-2 text-left font-black text-emerald-700">
                                      {line.debit > 0 ? `${line.debit.toLocaleString()} EGP` : '-'}
                                    </td>
                                    <td className="py-2 px-2 text-left font-black text-rose-600">
                                      {line.credit > 0 ? `${line.credit.toLocaleString()} EGP` : '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="border-t-2 border-slate-300 font-bold bg-slate-50">
                                  <td colSpan={4} className="py-2 px-2 text-slate-700">الإجمالي المتوازن</td>
                                  <td className="py-2 px-2 text-left font-black text-emerald-700">
                                    {entry.totalDebit.toLocaleString()} EGP
                                  </td>
                                  <td className="py-2 px-2 text-left font-black text-rose-600">
                                    {entry.totalCredit.toLocaleString()} EGP
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL: CREATE MANUAL JOURNAL ENTRY */}
      {showNewEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Scale className="w-6 h-6 text-[#C87A38]" />
                <h3 className="font-black text-lg text-slate-900">إنشاء قيد يومية يدوي متوازن</h3>
              </div>
              <button
                onClick={() => setShowNewEntryModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Entry Header Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">دفتر اليومية:</label>
                <select
                  value={manualJournalId}
                  onChange={(e) => setManualJournalId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
                >
                  {journals.map(j => (
                    <option key={j.id} value={j.id}>{j.nameAr} ({j.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">تاريخ القيد:</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">المرجع / المستند المؤيد:</label>
                <input
                  type="text"
                  value={manualReference}
                  onChange={(e) => setManualReference(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
                  placeholder="مثال: إذن تسوية رقم 44"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block text-xs">البيان الرئيسي للقيد:</label>
              <input
                type="text"
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
                placeholder="شرح وتوجيه القيد المحاسبي..."
              />
            </div>

            {/* Entry Lines */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-slate-800">أطراف وسطور القيد (مدين / دائن):</span>
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة سطر قيد</span>
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {manualLines.map((line, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    {/* Account Selector (4 cols) */}
                    <div className="md:col-span-4">
                      <select
                        value={line.accountId}
                        onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
                      >
                        {chartOfAccounts.filter(a => a.allowManualEntries).map(a => (
                          <option key={a.id} value={a.id}>
                            {a.code} - {a.nameAr || a.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Line Description (3 cols) */}
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                        placeholder="بيان السطر"
                      />
                    </div>

                    {/* Debit (2 cols) */}
                    <div className="md:col-span-2">
                      <input
                        type="number"
                        min="0"
                        value={line.debit || ''}
                        onChange={(e) => {
                          handleLineChange(idx, 'debit', parseFloat(e.target.value) || 0);
                          if (parseFloat(e.target.value) > 0) {
                            handleLineChange(idx, 'credit', 0);
                          }
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-emerald-700 text-left text-xs"
                        placeholder="مدين 0.00"
                      />
                    </div>

                    {/* Credit (2 cols) */}
                    <div className="md:col-span-2">
                      <input
                        type="number"
                        min="0"
                        value={line.credit || ''}
                        onChange={(e) => {
                          handleLineChange(idx, 'credit', parseFloat(e.target.value) || 0);
                          if (parseFloat(e.target.value) > 0) {
                            handleLineChange(idx, 'debit', 0);
                          }
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-rose-600 text-left text-xs"
                        placeholder="دائن 0.00"
                      />
                    </div>

                    {/* Remove Action (1 col) */}
                    <div className="md:col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Balance Validation Bar */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  {isFormBalanced ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>القيد متوازن وجاهز للترحيل الفوري</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                      <AlertCircle className="w-5 h-5" />
                      <span>القيد غير متوازن! الفرق: {Math.abs(formTotalDebit - formTotalCredit).toLocaleString()} EGP</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6 font-mono text-sm">
                  <div>
                    <span className="text-slate-400 text-xs ml-1">إجمالي المدين:</span>
                    <span className="font-black text-emerald-400">{formTotalDebit.toLocaleString()} EGP</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs ml-1">إجمالي الدائن:</span>
                    <span className="font-black text-rose-400">{formTotalCredit.toLocaleString()} EGP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNewEntryModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleCreateEntry}
                disabled={!isFormBalanced}
                className={`px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-lg transition-all ${
                  isFormBalanced
                    ? 'bg-[#C87A38] hover:bg-amber-600 shadow-[#C87A38]/30 cursor-pointer'
                    : 'bg-slate-400 cursor-not-allowed opacity-50'
                }`}
              >
                اعتماد وترحيل القيد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: REVERSE ENTRY (العكس المحاسبي) */}
      {showReverseModal && entryToReverse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <ArrowLeftRight className="w-6 h-6" />
              <h3 className="font-black text-lg text-slate-900">عكس القيد المحاسبي ({entryToReverse.entryNumber})</h3>
            </div>

            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-1">
              <p className="font-bold">تنبيه المعايير المحاسبية:</p>
              <p className="text-[11px] leading-relaxed">
                وفقاً لمبادئ الرقابة المالية، لا يتم حذف القيود المرحلة نهائياً من قاعدة البيانات. سيقوم النظام بإنشاء قيد عكسي جديد يقلب المدين دائناً والدائن مديناً لإلغاء الأثر المالي مع الاحتفاظ بسجل المراجعة.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block text-xs">سبب وتبرير العكس المحاسبي:</label>
              <textarea
                value={reverseReason}
                onChange={(e) => setReverseReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="أدخل سبب عكس هذا القيد..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowReverseModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleExecuteReverse}
                className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition-all"
              >
                تأكيد إنشاء القيد العكسي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: ENTRY DETAILS VOUCHER PREVIEW */}
      {showDetailsModal && selectedEntryDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[11px] text-slate-400 font-bold block">سند قيد محاسبي رسمي</span>
                <h3 className="font-mono font-black text-lg text-slate-900">{selectedEntryDetails.entryNumber}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة السند</span>
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">التاريخ:</span>
                <span className="font-bold text-slate-800">{selectedEntryDetails.date}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">الدفتر:</span>
                <span className="font-bold text-slate-800">{selectedEntryDetails.journalName || selectedEntryDetails.journalId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">المرجع:</span>
                <span className="font-mono font-bold text-slate-800">{selectedEntryDetails.reference}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">المستخدم:</span>
                <span className="font-bold text-slate-800">{selectedEntryDetails.createdByUserName}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-xs block mb-1">البيان والشرح:</span>
              <p className="text-xs font-bold text-slate-800 p-2.5 bg-amber-50/50 rounded-xl border border-amber-200/50">
                {selectedEntryDetails.description}
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-xs text-slate-800 block">جدول سطور القيد:</span>
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold">
                    <th className="p-2">رمز الحساب</th>
                    <th className="p-2">اسم الحساب</th>
                    <th className="p-2 text-left">مدين</th>
                    <th className="p-2 text-left">دائن</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {selectedEntryDetails.lines.map((l, i) => (
                    <tr key={i}>
                      <td className="p-2 font-bold text-slate-700">{l.accountCode}</td>
                      <td className="p-2 font-sans font-bold text-slate-900">{l.accountName}</td>
                      <td className="p-2 text-left font-black text-emerald-700">{l.debit > 0 ? l.debit.toLocaleString() : '-'}</td>
                      <td className="p-2 text-left font-black text-rose-600">{l.credit > 0 ? l.credit.toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold bg-slate-100 border-t-2 border-slate-300">
                    <td colSpan={2} className="p-2">الإجمالي</td>
                    <td className="p-2 text-left font-black text-emerald-700">{selectedEntryDetails.totalDebit.toLocaleString()} EGP</td>
                    <td className="p-2 text-left font-black text-rose-600">{selectedEntryDetails.totalCredit.toLocaleString()} EGP</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>توقيع المحاسب: ..........................</span>
              <span>توقيع المدير المالي: ..........................</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
