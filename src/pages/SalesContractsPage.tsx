import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { CustomContract, CustomContractStatus, PaymentMilestone } from '../types/erp';
import {
  FileText,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Printer,
  DollarSign,
  Building,
  CreditCard,
  Plus,
  X,
  Send,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export const SalesContractsPage: React.FC = () => {
  const {
    customContracts,
    customProjects,
    availableBranches,
    setSelectedProjectId,
    setActiveModule,
    updateContractStatus,
    recordMilestonePayment
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedDepositFilter, setSelectedDepositFilter] = useState<string>('all');

  // Modal states
  const [selectedContractForView, setSelectedContractForView] = useState<CustomContract | null>(null);
  const [selectedMilestoneForPayment, setSelectedMilestoneForPayment] = useState<{ contract: CustomContract; milestone: PaymentMilestone } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'card' | 'check'>('bank_transfer');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Filter Contracts
  const filteredContracts = customContracts.filter(c => {
    const project = customProjects.find(p => p.id === c.projectId);
    const branchId = project?.branchId || '';

    const matchesSearch =
      c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.projectNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    const matchesBranch = selectedBranch === 'all' || branchId === selectedBranch;
    const matchesDeposit =
      selectedDepositFilter === 'all' ||
      (selectedDepositFilter === 'verified' && c.isDepositVerified) ||
      (selectedDepositFilter === 'pending' && !c.isDepositVerified);

    return matchesSearch && matchesStatus && matchesBranch && matchesDeposit;
  });

  // Aggregated KPIs
  const totalContractsValue = filteredContracts.reduce((sum, c) => sum + (c.totalValue || 0), 0);
  let totalCollected = 0;
  let totalPending = 0;
  filteredContracts.forEach(c => {
    c.milestones?.forEach(m => {
      const paid = m.paidAmount || (m.status === 'verified_in_finance' || m.status === 'paid' ? m.amount : 0);
      totalCollected += paid;
      totalPending += (m.amount - paid);
    });
  });

  const handleOpenPaymentModal = (contract: CustomContract, milestone: PaymentMilestone) => {
    setSelectedMilestoneForPayment({ contract, milestone });
    const remaining = milestone.amount - (milestone.paidAmount || 0);
    setPaymentAmount(remaining > 0 ? remaining : milestone.amount);
    setPaymentNotes(`سداد ${milestone.title} لمشروع ${contract.projectNumber}`);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestoneForPayment || paymentAmount <= 0) return;

    recordMilestonePayment(
      selectedMilestoneForPayment.contract.id,
      selectedMilestoneForPayment.milestone.id,
      paymentAmount,
      paymentMethod,
      paymentNotes
    );

    setSelectedMilestoneForPayment(null);
  };

  const getStatusBadge = (status: CustomContractStatus) => {
    switch (status) {
      case 'signed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> موقع وساري</span>;
      case 'customer_review':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200"><Clock className="w-3.5 h-3.5" /> مراجعة العميل</span>;
      case 'draft':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">مسودة عقد</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">ملغي</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#361D13] to-[#5a3222] text-[#C87A38] flex items-center justify-center shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">سجل العقود والاتفاقيات الرسمية (Contracts & Milestones)</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              إدارة العقود القانونية المعتمدة، جداول الدفعات المستحقة، التحقق المالي من العربون، ومطابقة شروط التوريد
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveModule('custom_projects')}
          className="flex items-center gap-2 bg-[#361D13] hover:bg-[#4a281b] text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#C87A38]" />
          <span>إبرام عقد من قمع المشاريع</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي قيمة العقود النشطة</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalContractsValue.toLocaleString('ar-EG')}</span>
            <span className="text-xs text-slate-500 font-bold">ج.م</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-bold block mt-1">✓ {filteredContracts.length} عقود مبرمة</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي الدفعات المحصلة</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{totalCollected.toLocaleString('ar-EG')}</span>
            <span className="text-xs text-slate-500 font-bold">ج.م</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">مربوطة بالخزينة والحسابات البنكية</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">المتبقي قيد الاستحقاق والتحصيل</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">{totalPending.toLocaleString('ar-EG')}</span>
            <span className="text-xs text-slate-500 font-bold">ج.م</span>
          </div>
          <span className="text-[11px] text-blue-700 font-medium block mt-1">دفعات مرحلية مرتبطة بالإنجاز</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">العقود المكتملة العربون</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#C87A38]">
              {filteredContracts.filter(c => c.isDepositVerified).length} / {filteredContracts.length}
            </span>
          </div>
          <span className="text-[11px] text-[#C87A38] font-bold block mt-1">جاهزة للإفراج الفني للمصنع</span>
        </div>

      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث برقم العقد CNT، كود المشروع، اسم العميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pr-10 pl-4 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-[#C87A38] focus:bg-white transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="تصفية حسب الحالة"
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">جميع حالات العقد</option>
              <option value="signed">موقع وساري (Signed)</option>
              <option value="customer_review">مراجعة العميل</option>
              <option value="draft">مسودة</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>

          {/* Deposit filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDepositFilter}
              onChange={(e) => setSelectedDepositFilter(e.target.value)}
              aria-label="تصفية حسب التحقق من العربون"
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">التحقق من العربون: الكل</option>
              <option value="verified">تم التحقق المالي (Verified)</option>
              <option value="pending">عربون معلق</option>
            </select>
          </div>

          {/* Branch filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2">
            <Building className="w-4 h-4 text-slate-400" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              aria-label="تصفية حسب الفرع"
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">جميع الفروع</option>
              {availableBranches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-black text-slate-600 uppercase tracking-wider">
                <th className="py-4 px-5">رقم العقد والمشروع</th>
                <th className="py-4 px-5">العميل وتاريخ التعاقد</th>
                <th className="py-4 px-5">القيمة الإجمالية</th>
                <th className="py-4 px-5">تقدم سداد الدفعات المرحلية</th>
                <th className="py-4 px-5">حالة العربون</th>
                <th className="py-4 px-5">حالة العقد</th>
                <th className="py-4 px-5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="font-bold">لا توجد عقود مطابقة لمعايير البحث</p>
                  </td>
                </tr>
              ) : (
                filteredContracts.map(c => {
                  const paidAmount = c.milestones?.reduce((s, m) => s + (m.paidAmount || (m.status === 'verified_in_finance' ? m.amount : 0)), 0) || 0;
                  const percentPaid = c.totalValue > 0 ? Math.round((paidAmount / c.totalValue) * 100) : 0;
                  const project = customProjects.find(p => p.id === c.projectId);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* Contract # & Project */}
                      <td className="py-4 px-5">
                        <div className="font-black text-slate-900 font-mono text-sm">{c.contractNumber}</div>
                        <div className="text-slate-600 font-bold mt-0.5">{project?.projectName || 'مشروع تفصيل'}</div>
                        <span className="text-[11px] font-mono text-slate-400 block">{c.projectNumber}</span>
                      </td>

                      {/* Customer & Date */}
                      <td className="py-4 px-5">
                        <div className="font-black text-slate-900">{c.customerName}</div>
                        <span className="text-[11px] text-slate-500 font-mono block mt-0.5">تاريخ العقد: {c.contractDate}</span>
                        {c.signedByCustomerName && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded block mt-1 w-fit">
                            الموقع: {c.signedByCustomerName}
                          </span>
                        )}
                      </td>

                      {/* Total Value */}
                      <td className="py-4 px-5">
                        <div className="text-base font-black text-slate-900 font-mono">
                          {c.totalValue?.toLocaleString('ar-EG')} <span className="text-xs font-normal text-slate-500">ج.م</span>
                        </div>
                        <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{c.paymentTerms}</span>
                      </td>

                      {/* Milestones Progress */}
                      <td className="py-4 px-5 min-w-[200px]">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-bold text-slate-700">{paidAmount.toLocaleString('ar-EG')} ج.م</span>
                            <span className="font-bold text-emerald-700">{percentPaid}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${percentPaid}%` }} />
                          </div>
                          <div className="flex gap-1 mt-1">
                            {c.milestones?.map((m, idx) => (
                              <span
                                key={idx}
                                title={`${m.title}: ${m.percentage}% (${m.amount} ج.م) - ${m.status}`}
                                className={`h-1.5 flex-1 rounded-full ${
                                  m.status === 'verified_in_finance' || m.status === 'paid' ? 'bg-emerald-500' :
                                  m.status === 'partially_paid' ? 'bg-amber-400' : 'bg-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Deposit Verification */}
                      <td className="py-4 px-5">
                        {c.isDepositVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" /> تم التحقق المالي
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle className="w-3 h-3" /> بانتظار سداد العربون
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        {getStatusBadge(c.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedContractForView(c)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-[#361D13] hover:text-white text-slate-700 transition-all cursor-pointer"
                            title="معاينة بنود العقد الرسمي"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {c.milestones?.some(m => m.status !== 'verified_in_finance' && m.status !== 'paid') && (
                            <button
                              onClick={() => {
                                const nextPending = c.milestones?.find(m => m.status !== 'verified_in_finance' && m.status !== 'paid');
                                if (nextPending) handleOpenPaymentModal(c, nextPending);
                              }}
                              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 transition-all cursor-pointer"
                              title="تسجيل تحصيل دفعة مرحلية"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedProjectId(c.projectId);
                              setActiveModule('custom_projects');
                            }}
                            className="p-2 rounded-xl bg-[#C87A38]/10 hover:bg-[#C87A38] hover:text-white text-[#C87A38] transition-all cursor-pointer"
                            title="فتح ملف المشروع الكامل"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Legal Preview Modal */}
      {selectedContractForView && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#361D13] to-[#5a3222] text-[#C87A38] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">عقد تصنيع وتوريد مخصص ملزم (Official Contract)</h3>
                  <span className="text-xs font-mono text-slate-500">رقم العقد: {selectedContractForView.contractNumber} | مشروع {selectedContractForView.projectNumber}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedContractForView(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs text-slate-700">
              
              {/* Top Identity Block */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 block mb-0.5">الطرف الأول (المصنع)</span>
                  <strong className="text-slate-900 text-sm">شركة الأثاث والمطابخ الحديثة</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">الطرف الثاني (العميل)</span>
                  <strong className="text-slate-900 text-sm">{selectedContractForView.customerName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">إجمالي قيمة العقد</span>
                  <strong className="text-[#C87A38] text-base font-black">
                    {selectedContractForView.totalValue?.toLocaleString('ar-EG')} ج.م
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">تاريخ التوقيع</span>
                  <strong className="text-slate-800 font-mono">{selectedContractForView.contractDate}</strong>
                </div>
              </div>

              {/* Milestones Table */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" /> جدول الدفعات والالتزامات المالية
                </h4>
                <div className="space-y-2">
                  {selectedContractForView.milestones?.map((m, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                            {m.milestoneIndex}
                          </span>
                          <strong className="text-slate-900">{m.title}</strong>
                          <span className="text-slate-500 font-bold">({m.percentage}%)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{m.dueDateDescription}</p>
                      </div>

                      <div className="text-left shrink-0">
                        <span className="font-black text-slate-900 font-mono text-sm block">
                          {m.amount?.toLocaleString('ar-EG')} ج.م
                        </span>
                        {m.status === 'verified_in_finance' || m.status === 'paid' ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                            ✓ تم السداد ({m.financialReceiptRef})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                            قيد الاستحقاق
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                <h5 className="font-black text-slate-900">البنود والشروط العامة:</h5>
                <p>1. يلتزم الطرف الأول بتنفيذ الأعمال طبقاً للمخططات والمقايسة الفنية رقم ({selectedContractForView.quotationId}) المعتمدة.</p>
                <p>2. مدة التوريد: {selectedContractForView.deliveryTerms}.</p>
                <p>3. يعتبر سداد العربون والتحقق المالي منه شرطاً أساسياً لبدء أمر التقطيع والتصنيع بالمصنع.</p>
                <p>4. أي تعديل يطلبه العميل بعد توقيع هذا العقد يخضع لـ "أمر تغيير رسمي" يُلحق بالعقد وتُحتسب فروق التكلفة والتسليم بناءً عليه.</p>
              </div>

              {/* Signature section */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-center">
                  <span className="text-slate-500 block mb-2 font-bold">توقيع واعتماد الطرف الأول (الشركة)</span>
                  <div className="h-10 border-b border-dashed border-slate-300 flex items-center justify-center font-bold text-slate-800">
                    أحمد سمير (مدير المبيعات)
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">ختم وتوقيع الإدارة</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-center">
                  <span className="text-slate-500 block mb-2 font-bold">توقيع واعتماد الطرف الثاني (العميل)</span>
                  <div className="h-10 border-b border-dashed border-slate-300 flex items-center justify-center font-bold text-emerald-700">
                    ✓ {selectedContractForView.signedByCustomerName || selectedContractForView.customerName}
                  </div>
                  <span className="text-[10px] text-emerald-600 mt-1 block">توقيع إلكتروني موثق</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة العقد الرسمي</span>
              </button>

              <button
                onClick={() => setSelectedContractForView(null)}
                className="bg-[#361D13] hover:bg-[#4a281b] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Record Milestone Payment Modal */}
      {selectedMilestoneForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">تسجيل تحصيل دفعة مرحلية</h3>
                  <span className="text-xs text-slate-500 font-mono">{selectedMilestoneForPayment.contract.contractNumber}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMilestoneForPayment(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4 text-xs">
              
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-1">
                <span className="text-slate-500 font-bold block">الدفعة المستحقة:</span>
                <p className="font-black text-slate-900 text-sm">{selectedMilestoneForPayment.milestone.title}</p>
                <span className="text-slate-500 block">إجمالي قيمة الدفعة: {selectedMilestoneForPayment.milestone.amount?.toLocaleString('ar-EG')} ج.م</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">المبلغ المحصل الفعلي (ج.م) *</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  required
                  min={1}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">طريقة السداد *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-600"
                >
                  <option value="bank_transfer">تحويل بنكي (البنك الأهلي / CIB)</option>
                  <option value="cash">نقداً بخزينة المعرض</option>
                  <option value="card">بطاقة دفع إلكتروني (POS)</option>
                  <option value="check">شيك بنكي مقبول الدفع</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ملاحظات التحصيل والإيصال</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="رقم مرجع التحويل أو اسم المودع..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMilestoneForPayment(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-black shadow-md transition-all"
                >
                  تأكيد التحصيل وإصدار الإيصال
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
