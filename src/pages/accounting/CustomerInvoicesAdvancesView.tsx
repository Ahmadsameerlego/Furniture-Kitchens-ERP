// ====================================================
// REWAQ ERP — SALES INVOICES & CUSTOMER ADVANCES VIEW
// Revenue Recognition, VAT 14%, and Advance Liability Management
// ====================================================

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { SalesInvoice, CustomerAdvance } from '../../types/accounting';
import {
  FileText,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Users,
  DollarSign,
  Printer,
  Calendar,
  Layers,
  ArrowLeftRight,
  Clock
} from 'lucide-react';

export const CustomerInvoicesAdvancesView: React.FC = () => {
  const {
    salesInvoices,
    customerAdvances,
    customers,
    orders,
    createSalesInvoice,
    recordCustomerAdvancePayment,
    applyCustomerAdvanceToInvoice,
    showToast,
    setActiveModule
  } = useERP();

  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'advances'>('invoices');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState<boolean>(false);
  const [showNewAdvanceModal, setShowNewAdvanceModal] = useState<boolean>(false);
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [selectedInvoiceForApply, setSelectedInvoiceForApply] = useState<SalesInvoice | null>(null);
  const [selectedAdvanceId, setSelectedAdvanceId] = useState<string>('');
  const [applyAmount, setApplyAmount] = useState<number>(0);

  // Sales Invoice Form
  const [invCustomerId, setInvCustomerId] = useState<string>(customers[0]?.id || '');
  const [invOrderId, setInvOrderId] = useState<string>('');
  const [invSubtotal, setInvSubtotal] = useState<number>(120000);
  const [invTaxRate, setInvTaxRate] = useState<number>(14);
  const [invApplyAdvance, setInvApplyAdvance] = useState<boolean>(true);
  const [invNotes, setInvNotes] = useState<string>('فاتورة مبيعات أثاث ومطابخ مخصصة');

  // Advance Payment Form
  const [advCustomerId, setAdvCustomerId] = useState<string>(customers[0]?.id || '');
  const [advAmount, setAdvAmount] = useState<number>(40000);
  const [advMethod, setAdvMethod] = useState<'cash' | 'bank_transfer' | 'check' | 'card'>('bank_transfer');
  const [advNotes, setAdvNotes] = useState<string>('عربون مقدم تعاقد تصنيع مطبخ خشب كونتر');

  // KPIs
  const totalInvoiced = salesInvoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalBalanceDue = salesInvoices.reduce((s, i) => s + i.balanceDue, 0);
  const totalActiveAdvances = customerAdvances.filter(a => a.status !== 'fully_applied').reduce((s, a) => s + a.remainingAmount, 0);

  // Submit Invoice
  const handleCreateInvoice = () => {
    if (!invCustomerId || invSubtotal <= 0) {
      showToast('يرجى اختيار العميل وتحديد قيمة الفاتورة', 'warning');
      return;
    }

    const availableAdv = customerAdvances.find(a => a.customerId === invCustomerId && a.remainingAmount > 0);
    const advanceToApply = (invApplyAdvance && availableAdv) ? Math.min(availableAdv.remainingAmount, invSubtotal * 1.14) : 0;

    const inv = createSalesInvoice({
      customerId: invCustomerId,
      orderId: invOrderId || undefined,
      date: new Date().toISOString().substring(0, 10),
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
      subtotal: Number(invSubtotal),
      taxAmount: Math.round(Number(invSubtotal) * (Number(invTaxRate) / 100)),
      advanceAppliedAmount: advanceToApply,
      advanceId: availableAdv?.id,
      notes: invNotes
    });

    if (inv) {
      setShowNewInvoiceModal(false);
      showToast(`تم إنشاء وترحيل فاتورة المبيعات (${inv.invoiceNumber}) بنجاح`, 'success');
    }
  };

  // Submit Advance
  const handleCreateAdvance = () => {
    if (!advCustomerId || advAmount <= 0) {
      showToast('يرجى اختيار العميل وتحديد قيمة العربون المقدم', 'warning');
      return;
    }

    const adv = recordCustomerAdvancePayment({
      customerId: advCustomerId,
      amount: Number(advAmount),
      paymentMethod: advMethod,
      accountId: advMethod === 'cash' ? 'acc-11111' : 'acc-11121',
      notes: advNotes
    });

    if (adv) {
      setShowNewAdvanceModal(false);
      showToast(`تم استلام وتسجيل العربون المقدم (${adv.advanceNumber}) كالتزام (حساب 212) بنجاح`, 'success');
    }
  };

  // Open apply modal
  const handleOpenApplyModal = (inv: SalesInvoice) => {
    setSelectedInvoiceForApply(inv);
    const availableAdv = customerAdvances.find(a => a.customerId === inv.customerId && a.remainingAmount > 0);
    if (availableAdv) {
      setSelectedAdvanceId(availableAdv.id);
      setApplyAmount(Math.min(availableAdv.remainingAmount, inv.balanceDue));
      setShowApplyModal(true);
    } else {
      showToast('لا توجد دفعات مقدمة متاحة لهذا العميل', 'warning');
    }
  };

  // Submit Apply
  const handleApplyAdvance = () => {
    if (!selectedInvoiceForApply || !selectedAdvanceId || applyAmount <= 0) return;

    applyCustomerAdvanceToInvoice(selectedInvoiceForApply.id, selectedAdvanceId, applyAmount);
    setShowApplyModal(false);
    showToast(`تمت تسوية مبلغ ${applyAmount.toLocaleString()} EGP من الدفعة المقدمة بنجاح`, 'success');
  };

  return (
    <div className="space-y-6 text-slate-800 text-right dir-rtl">
      {/* 1. HEADER */}
      <div className="bg-gradient-to-l from-[#361D13] via-[#4A2818] to-[#1E0F0A] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <FileText className="w-3.5 h-3.5" />
            <span>المبيعات الضريبية وإدارة العربين — Revenue Recognition & Advance Liabilities</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100 flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#C87A38]" />
            <span>فواتير المبيعات والدفعات المقدمة</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            إصدار الفواتير الضريبية (ضريبة القيمة المضافة 14%)، وإدارة عربين العملاء واحتجازها كالتزام (حساب 212) حتى التسليم والتسوية المحاسبية مع الفواتير.
          </p>
        </div>

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
            className="flex items-center gap-2 px-4 py-2.5 bg-[#C87A38] hover:bg-amber-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء فاتورة مبيعات</span>
          </button>
        </div>
      </div>

      {/* 2. KPI SUMMARY BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">إجمالي الفواتير الصادرة</span>
          <div className="text-2xl font-black font-mono text-slate-900">
            {totalInvoiced.toLocaleString()} <span className="text-xs font-bold text-slate-400">EGP</span>
          </div>
          <div className="text-[11px] text-slate-400 font-bold">شاملة ضريبة القيمة المضافة 14%</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">مستحقات التحصيل المتبقية (AR)</span>
          <div className="text-2xl font-black font-mono text-blue-700">
            {totalBalanceDue.toLocaleString()} <span className="text-xs font-bold text-slate-400">EGP</span>
          </div>
          <div className="text-[11px] text-blue-600 font-bold">صافي المديونية القائمة على العملاء</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">العربين المحتجزة كالتزام (حساب 212)</span>
          <div className="text-2xl font-black font-mono text-amber-800">
            {totalActiveAdvances.toLocaleString()} <span className="text-xs font-bold text-slate-400">EGP</span>
          </div>
          <div className="text-[11px] text-amber-700 font-bold">دفعات غير مسواة تحت التنفيذ</div>
        </div>
      </div>

      {/* 3. SUB-TABS & SEARCH */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('invoices')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                activeSubTab === 'invoices'
                  ? 'bg-[#361D13] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              فواتير المبيعات ({salesInvoices.length})
            </button>

            <button
              onClick={() => setActiveSubTab('advances')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                activeSubTab === 'advances'
                  ? 'bg-amber-700 text-white shadow-md'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              الدفعات المقدمة والعربين ({customerAdvances.length})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم الفاتورة أو اسم العميل..."
              className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
            />
          </div>
        </div>
      </div>

      {/* 4. CONTENT VIEW: INVOICES OR ADVANCES */}
      {activeSubTab === 'invoices' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-right text-xs min-w-[1050px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80">
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">رقم الفاتورة</th>
                  <th className="py-3.5 px-4 min-w-[180px]">العميل</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[110px]">تاريخ الإصدار</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[120px] text-left">المبلغ الأساسي</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[120px] text-left">ضريبة VAT 14%</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[120px] text-left">الإجمالي</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[120px] text-left">العربون المسوى</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px] text-left">المتبقي للتحصيل</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[120px] text-center">الحالة</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[110px] text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {salesInvoices
                  .filter(inv =>
                    !searchQuery ||
                    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    inv.customerName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{inv.invoiceNumber}</td>
                      <td className="py-3.5 px-4 font-sans font-bold text-slate-800">{inv.customerName}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-xs whitespace-nowrap">{inv.date}</td>
                      <td className="py-3.5 px-4 text-left text-slate-700 whitespace-nowrap">{inv.subtotal.toLocaleString()} EGP</td>
                      <td className="py-3.5 px-4 text-left text-slate-500 whitespace-nowrap">{inv.taxAmount.toLocaleString()} EGP</td>
                      <td className="py-3.5 px-4 text-left font-black text-slate-900 whitespace-nowrap">{inv.totalAmount.toLocaleString()} EGP</td>
                      <td className="py-3.5 px-4 text-left font-bold text-amber-700 whitespace-nowrap">
                        {inv.advanceAppliedAmount > 0 ? `-${inv.advanceAppliedAmount.toLocaleString()} EGP` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-left font-black text-blue-700 whitespace-nowrap">{inv.balanceDue.toLocaleString()} EGP</td>
                      <td className="py-3.5 px-4 text-center font-sans whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black shadow-2xs whitespace-nowrap ${
                          inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          inv.status === 'partially_paid' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {inv.status === 'paid' && 'مدفوعة بالكامل'}
                          {inv.status === 'partially_paid' && 'مسددة جزئياً'}
                          {inv.status === 'posted' && 'مستحقة السداد'}
                          {inv.status === 'draft' && 'مسودة'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-sans whitespace-nowrap">
                        {inv.balanceDue > 0 && (
                          <button
                            onClick={() => handleOpenApplyModal(inv)}
                            className="px-3 py-1 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 text-[11px] font-bold border border-amber-200 shadow-2xs whitespace-nowrap"
                            title="تسوية دفعة مقدمة مع هذه الفاتورة"
                          >
                            تسوية عربون
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ADVANCES TABLE */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-amber-50/70 border-b border-amber-200/60 flex items-center gap-2 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-[#C87A38]" />
            <span className="font-bold">
              المعالجة المحاسبية للعربين: تسجل الدفعة كالتزام دائن (حساب 212) ولا تسجل كإيراد إلا عند إصدار فاتورة المبيعات وتسليم المنتجات.
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-right text-xs min-w-[950px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80">
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">رقم السند</th>
                  <th className="py-3.5 px-4 min-w-[180px]">العميل</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[110px]">تاريخ الاستلام</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">طريقة السداد</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[120px] text-left">قيمة العربون</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[120px] text-left">المبلغ المسوى</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px] text-left">المتبقي كالتزام</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[120px] text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {customerAdvances
                  .filter(adv =>
                    !searchQuery ||
                    adv.advanceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    adv.customerName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(adv => (
                    <tr key={adv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{adv.advanceNumber}</td>
                      <td className="py-3.5 px-4 font-sans font-bold text-slate-800">{adv.customerName}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-xs whitespace-nowrap">{adv.date}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-700 whitespace-nowrap">
                        {adv.paymentMethod === 'bank_transfer' && 'تحويل بنكي'}
                        {adv.paymentMethod === 'cash' && 'نقدية بالخزينة'}
                        {adv.paymentMethod === 'check' && 'شيك بنكي'}
                        {adv.paymentMethod === 'card' && 'بطاقة بنكية POS'}
                      </td>
                      <td className="py-3.5 px-4 text-left font-black text-slate-900 whitespace-nowrap">{adv.amount.toLocaleString()} EGP</td>
                      <td className="py-3.5 px-4 text-left font-bold text-emerald-700 whitespace-nowrap">{adv.appliedAmount.toLocaleString()} EGP</td>
                      <td className="py-3.5 px-4 text-left font-black text-amber-800 whitespace-nowrap">{adv.remainingAmount.toLocaleString()} EGP</td>
                      <td className="py-3.5 px-4 text-center font-sans whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black shadow-2xs whitespace-nowrap ${
                          adv.status === 'fully_applied' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                          adv.status === 'partially_applied' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {adv.status === 'active' && 'متاح للتسوية'}
                          {adv.status === 'partially_applied' && 'مسوى جزئياً'}
                          {adv.status === 'fully_applied' && 'مسوى بالكامل'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MODAL: CREATE SALES INVOICE */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#C87A38]" />
                <h3 className="font-black text-lg text-slate-900">إنشاء فاتورة مبيعات ضريبية</h3>
              </div>
              <button onClick={() => setShowNewInvoiceModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-rose-50 flex items-center justify-center">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">العميل المستفيد:</label>
                <select
                  value={invCustomerId}
                  onChange={(e) => setInvCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">قيمة المنتجات (قبل الضريبة):</label>
                  <input
                    type="number"
                    value={invSubtotal}
                    onChange={(e) => setInvSubtotal(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-left"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">نسبة ضريبة القيمة المضافة:</label>
                  <select
                    value={invTaxRate}
                    onChange={(e) => setInvTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value={14}>14% (الضريبة العامة المعتمدة)</option>
                    <option value={0}>0% (معفى من الضريبة)</option>
                  </select>
                </div>
              </div>

              {/* Calculated Breakdown */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>قيمة الضريبة (14% VAT):</span>
                  <span className="font-mono font-bold">{((invSubtotal * invTaxRate) / 100).toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1 text-sm">
                  <span>إجمالي الفاتورة المستحق:</span>
                  <span className="font-mono font-black text-emerald-700">
                    {(invSubtotal + (invSubtotal * invTaxRate) / 100).toLocaleString()} EGP
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={invApplyAdvance}
                  onChange={(e) => setInvApplyAdvance(e.target.checked)}
                  className="rounded text-[#C87A38]"
                />
                <span className="font-bold text-slate-800">
                  خصم وتسوية العربون المتاح للعميل تلقائياً من إجمالي الفاتورة
                </span>
              </label>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">ملاحظات الفاتورة:</label>
                <input
                  type="text"
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowNewInvoiceModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600">إلغاء</button>
              <button onClick={handleCreateInvoice} className="px-5 py-2 rounded-xl text-xs font-black bg-[#C87A38] text-white shadow-lg">إصدار وترحيل الفاتورة</button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: RECEIVE CUSTOMER ADVANCE */}
      {showNewAdvanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#C87A38]" />
                <h3 className="font-black text-lg text-slate-900">استلام دفعة مقدمة (عربون تعاقد)</h3>
              </div>
              <button onClick={() => setShowNewAdvanceModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">العميل الدافع:</label>
                <select
                  value={advCustomerId}
                  onChange={(e) => setAdvCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">قيمة العربون:</label>
                  <input
                    type="number"
                    value={advAmount}
                    onChange={(e) => setAdvAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-left text-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">طريقة الاستلام:</label>
                  <select
                    value={advMethod}
                    onChange={(e) => setAdvMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="bank_transfer">تحويل بنكي (حساب 11121)</option>
                    <option value="cash">نقدية بالخزينة (حساب 11111)</option>
                    <option value="check">شيك ورقة قبض (حساب 1113)</option>
                    <option value="card">بطاقة بنكية POS</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs">
                سيقوم النظام تلقائياً بتوليد قيد مزدوج:
                <br />
                <strong>مدين:</strong> الخزينة أو البنك (1111 / 1112)
                <br />
                <strong>دائن:</strong> دفعات مقدمة من العملاء (212) كالتزام.
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">البيان / الملاحظات:</label>
                <input
                  type="text"
                  value={advNotes}
                  onChange={(e) => setAdvNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowNewAdvanceModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600">إلغاء</button>
              <button onClick={handleCreateAdvance} className="px-5 py-2 rounded-xl text-xs font-black bg-[#C87A38] text-white shadow-lg">إثبات استلام العربون</button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: APPLY ADVANCE TO INVOICE */}
      {showApplyModal && selectedInvoiceForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-lg text-slate-900">تسوية عربون مع الفاتورة ({selectedInvoiceForApply.invoiceNumber})</h3>
              <button onClick={() => setShowApplyModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">العميل:</span>
                  <span className="font-bold text-slate-800">{selectedInvoiceForApply.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">المتبقي المطلوب بالفاتورة:</span>
                  <span className="font-mono font-bold text-blue-700">{selectedInvoiceForApply.balanceDue.toLocaleString()} EGP</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">اختر سند العربون المتاح:</label>
                <select
                  value={selectedAdvanceId}
                  onChange={(e) => {
                    setSelectedAdvanceId(e.target.value);
                    const adv = customerAdvances.find(a => a.id === e.target.value);
                    if (adv) {
                      setApplyAmount(Math.min(adv.remainingAmount, selectedInvoiceForApply.balanceDue));
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {customerAdvances
                    .filter(a => a.customerId === selectedInvoiceForApply.customerId && a.remainingAmount > 0)
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.advanceNumber} — المتاح: {a.remainingAmount.toLocaleString()} EGP ({a.date})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">المبلغ المراد خصمه وتسويته:</label>
                <input
                  type="number"
                  value={applyAmount}
                  onChange={(e) => setApplyAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-700 text-left"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowApplyModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600">إلغاء</button>
              <button onClick={handleApplyAdvance} className="px-5 py-2 rounded-xl text-xs font-black bg-emerald-700 text-white shadow-lg">تأكيد التسوية</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
