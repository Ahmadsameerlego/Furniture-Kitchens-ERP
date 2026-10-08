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
  Building,
  CreditCard,
  Plus,
  X,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Wallet,
  Calendar,
  Layers,
  LayoutGrid,
  List,
  Copy,
  Check,
  User,
  ArrowUpRight,
  Receipt,
  FileCheck2,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const SalesContractsPage: React.FC = () => {
  const {
    customContracts,
    customProjects,
    availableBranches,
    setSelectedProjectId,
    setActiveModule,
    updateContractStatus,
    recordMilestonePayment,
    verifyContractDeposit
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedDepositFilter, setSelectedDepositFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states
  const [selectedContractForView, setSelectedContractForView] = useState<CustomContract | null>(null);
  const [selectedMilestoneForPayment, setSelectedMilestoneForPayment] = useState<{ contract: CustomContract; milestone: PaymentMilestone } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'card' | 'check'>('bank_transfer');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Copy Contract ID helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter Contracts
  const filteredContracts = customContracts.filter(c => {
    const project = customProjects.find(p => p.id === c.projectId);
    const branchId = project?.branchId || '';

    const matchesSearch =
      c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.projectNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project?.projectName && project.projectName.toLowerCase().includes(searchQuery.toLowerCase()));

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
      totalPending += Math.max(0, m.amount - paid);
    });
  });

  const verifiedDepositsCount = filteredContracts.filter(c => c.isDepositVerified).length;
  const collectionRate = totalContractsValue > 0 ? Math.round((totalCollected / totalContractsValue) * 100) : 0;

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
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>موقّع وساري</span>
          </span>
        );
      case 'customer_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>مراجعة العميل</span>
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>مسودة عقد</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs">
            <X className="w-3.5 h-3.5 text-rose-600" />
            <span>ملغي</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const statusOptions = [
    { key: 'all', label: 'الكل', count: customContracts.length },
    { key: 'signed', label: 'موقّع وساري', count: customContracts.filter(c => c.status === 'signed').length },
    { key: 'customer_review', label: 'مراجعة العميل', count: customContracts.filter(c => c.status === 'customer_review').length },
    { key: 'draft', label: 'مسودة', count: customContracts.filter(c => c.status === 'draft').length },
  ];

  return (
    <div className="space-y-6 pb-16 font-sans antialiased text-slate-800">

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#2c170f] via-[#3d2015] to-[#2c170f] text-white rounded-3xl p-6 md:p-8 shadow-xl border border-[#4a281b]">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#C87A38]/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C87A38] to-[#8d4f1c] text-white flex items-center justify-center shadow-lg shadow-[#C87A38]/20 shrink-0 ring-4 ring-white/10">
              <FileCheck2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">سجل العقود والاتفاقيات الرسمية</h1>
                <span className="bg-[#C87A38]/20 text-[#e9a56c] border border-[#C87A38]/40 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> {filteredContracts.length} عقد مبرم
                </span>
              </div>
              <p className="text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
                متابعة العقود القانونية المعتمدة، جدولة الدفعات المرحلية، التحقق المالي من العربون لضمان انطلاق أوامر التشغيل للمصنع
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
            <button
              onClick={() => setActiveModule('custom_projects')}
              className="group flex items-center gap-2.5 bg-gradient-to-r from-[#C87A38] to-[#a85f23] hover:from-[#d58744] hover:to-[#b76827] text-white px-5 py-3 rounded-2xl text-xs font-black shadow-lg shadow-[#C87A38]/25 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
              <span>إبرام عقد من قمع المشاريع</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        
        {/* Card 1: Total Value */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">إجمالي قيمة العقود النشطة</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#C87A38] flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {totalContractsValue.toLocaleString('en-US')}
            </span>
            <span className="text-xs font-bold text-slate-500">ج.م</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {filteredContracts.length} عقود معتمدة
            </span>
            <span className="text-slate-400 font-medium">شامل البنود والمقايسات</span>
          </div>
        </div>

        {/* Card 2: Collected Amount */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">إجمالي الدفعات المحصلة</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono tracking-tight">
              {totalCollected.toLocaleString('en-US')}
            </span>
            <span className="text-xs font-bold text-slate-500">ج.م</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 font-medium">نسبة التحصيل الفعلي</span>
              <span className="font-black text-emerald-600 font-mono">{collectionRate}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${collectionRate}%` }} />
            </div>
          </div>
        </div>

        {/* Card 3: Pending Balance */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">المتبقي قيد الاستحقاق</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-blue-600 font-mono tracking-tight">
              {totalPending.toLocaleString('en-US')}
            </span>
            <span className="text-xs font-bold text-slate-500">ج.م</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-blue-700 font-bold">دفعات توريد وتسليم</span>
            <span className="text-slate-400 font-medium">مرتبطة بالإنجاز الفني</span>
          </div>
        </div>

        {/* Card 4: Verified Deposits */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">اعتماد العربون للمصنع</span>
            <div className="w-10 h-10 rounded-2xl bg-[#C87A38]/10 text-[#C87A38] flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#C87A38] font-mono tracking-tight">
              {verifiedDepositsCount} <span className="text-lg text-slate-400 font-normal">/ {filteredContracts.length}</span>
            </span>
            <span className="text-xs font-bold text-slate-400">عقد مكتمل</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> جاهزة للإفراج الفني
            </span>
            <span className="text-slate-400 font-mono">
              {filteredContracts.length > 0 ? Math.round((verifiedDepositsCount / filteredContracts.length) * 100) : 0}%
            </span>
          </div>
        </div>

      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
        
        {/* Top Row: Quick Tabs + Search + View Mode */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Quick Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl overflow-x-auto custom-scrollbar">
            {statusOptions.map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                  selectedStatus === tab.key
                    ? 'bg-[#361D13] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  selectedStatus === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar & View Mode */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث برقم العقد CNT، كود المشروع، اسم العميل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl pr-10 pl-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-[#C87A38] focus:bg-white focus:ring-3 focus:ring-[#C87A38]/10 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 shrink-0">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-[#361D13] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="عرض جدول"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-[#361D13] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="عرض بطاقات"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Secondary Filters Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Deposit filter */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C87A38]" />
              <span className="text-[11px] font-bold text-slate-500">العربون:</span>
              <select
                value={selectedDepositFilter}
                onChange={(e) => setSelectedDepositFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">الكل</option>
                <option value="verified">تم التحقق المالي (Verified)</option>
                <option value="pending">بانتظار سداد العربون</option>
              </select>
            </div>

            {/* Branch filter */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500">الفرع:</span>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">جميع الفروع</option>
                {availableBranches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filters reset */}
          {(searchQuery || selectedStatus !== 'all' || selectedBranch !== 'all' || selectedDepositFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
                setSelectedBranch('all');
                setSelectedDepositFilter('all');
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>إعادة تعيين الفلاتر</span>
            </button>
          )}

        </div>

      </div>

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-black text-slate-600 uppercase tracking-wider">
                  <th className="py-4 px-5">العقد والمشروع</th>
                  <th className="py-4 px-5">العميل والاعتماد</th>
                  <th className="py-4 px-5">القيمة وشروط الدفع</th>
                  <th className="py-4 px-5">سداد الدفعات المرحلية</th>
                  <th className="py-4 px-5">حالة العربون</th>
                  <th className="py-4 px-5">حالة العقد</th>
                  <th className="py-4 px-5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredContracts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300">
                        <FileText className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-black text-slate-700">لا توجد عقود مطابقة لمعايير البحث</p>
                      <p className="text-xs text-slate-400 mt-1">جرّب تغيير كلمات البحث أو إعادة ضبط خيارات التصفية</p>
                    </td>
                  </tr>
                ) : (
                  filteredContracts.map(c => {
                    const paidAmount = c.milestones?.reduce((s, m) => s + (m.paidAmount || (m.status === 'verified_in_finance' || m.status === 'paid' ? m.amount : 0)), 0) || 0;
                    const percentPaid = c.totalValue > 0 ? Math.round((paidAmount / c.totalValue) * 100) : 0;
                    const remainingBalance = Math.max(0, c.totalValue - paidAmount);
                    const project = customProjects.find(p => p.id === c.projectId);
                    const branch = availableBranches.find(b => b.id === project?.branchId);
                    const nextUnpaidMilestone = c.milestones?.find(m => m.status !== 'verified_in_finance' && m.status !== 'paid');

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                        
                        {/* 1. Contract & Project Details */}
                        <td className="py-4 px-5 align-top">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 font-mono text-sm tracking-tight whitespace-nowrap">{c.contractNumber}</span>
                            <button
                              onClick={() => handleCopy(c.contractNumber)}
                              className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors"
                              title="نسخ رقم العقد"
                            >
                              {copiedId === c.contractNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>

                          <div className="font-bold text-slate-800 mt-1 line-clamp-1">{project?.projectName || 'مشروع تفصيل مخصص'}</div>
                          
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                              {c.projectNumber}
                            </span>
                            {branch && (
                              <span className="text-[10px] text-slate-500 bg-stone-100 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                                <Building className="w-2.5 h-2.5 text-slate-400" /> {branch.name}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 2. Customer & Date */}
                        <td className="py-4 px-5 align-top">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#361D13] to-[#5a3222] text-[#C87A38] font-black text-xs flex items-center justify-center shrink-0">
                              {c.customerName.charAt(0) || <User className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-black text-slate-900 leading-snug">{c.customerName}</div>
                              <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span className="whitespace-nowrap">{c.contractDate}</span>
                              </div>
                            </div>
                          </div>

                          {c.signedByCustomerName && (
                            <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>الموقّع: {c.signedByCustomerName}</span>
                            </div>
                          )}
                        </td>

                        {/* 3. Total Value & Terms */}
                        <td className="py-4 px-5 align-top">
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-black text-slate-900 font-mono tracking-tight">
                              {c.totalValue?.toLocaleString('en-US')}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500">ج.م</span>
                          </div>
                          
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed max-w-[180px]">
                            {c.paymentTerms || 'عربون 40% + 40% قبل التوريد + 20% عند التسليم'}
                          </p>
                        </td>

                        {/* 4. Milestones Progress */}
                        <td className="py-4 px-5 align-top min-w-[220px]">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-slate-700 font-mono">
                                {paidAmount.toLocaleString('en-US')} <span className="text-slate-400 text-[10px]">من {c.totalValue?.toLocaleString('en-US')} ج.م</span>
                              </span>
                              <span className={`font-black font-mono px-1.5 py-0.5 rounded text-[10px] ${
                                percentPaid === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-50 text-blue-700'
                              }`}>
                                {percentPaid}%
                              </span>
                            </div>

                            {/* Overall progress bar */}
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  percentPaid === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                }`}
                                style={{ width: `${percentPaid}%` }}
                              />
                            </div>

                            {/* Milestone Pills */}
                            <div className="flex gap-1.5 pt-0.5">
                              {c.milestones?.map((m, idx) => {
                                const isPaid = m.status === 'verified_in_finance' || m.status === 'paid';
                                const isPartial = m.status === 'partially_paid';
                                return (
                                  <div
                                    key={idx}
                                    title={`${m.title}: ${m.percentage}% (${m.amount?.toLocaleString('en-US')} ج.م) - ${
                                      isPaid ? 'تم التحصيل المالي' : isPartial ? 'مسدد جزئياً' : 'قيد الاستحقاق'
                                    }`}
                                    className={`h-2 flex-1 rounded-full transition-all cursor-help ${
                                      isPaid ? 'bg-emerald-500 ring-1 ring-emerald-600/30' :
                                      isPartial ? 'bg-amber-400' : 'bg-slate-200'
                                    }`}
                                  />
                                );
                              })}
                            </div>

                            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                              <span>المتبقي: {remainingBalance.toLocaleString('en-US')} ج.م</span>
                              <span>{c.milestones?.length || 0} دفعات</span>
                            </div>
                          </div>
                        </td>

                        {/* 5. Deposit Status */}
                        <td className="py-4 px-5 align-top">
                          {c.isDepositVerified ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>تم التحقق المالي</span>
                              </span>
                              <span className="text-[10px] text-slate-400 block font-medium">معتمد للإنتاج</span>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs animate-pulse">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                <span>بانتظار العربون</span>
                              </span>
                              {verifyContractDeposit && (
                                <button
                                  onClick={() => verifyContractDeposit(c.id)}
                                  className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg block transition-colors cursor-pointer"
                                  title="تأكيد التحقق من استلام العربون"
                                >
                                  ✓ تأكيد العربون
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                        {/* 6. Contract Status */}
                        <td className="py-4 px-5 align-top">
                          {getStatusBadge(c.status)}
                        </td>

                        {/* 7. Actions */}
                        <td className="py-4 px-5 align-top text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            
                            {/* Preview Contract Sheet */}
                            <button
                              onClick={() => setSelectedContractForView(c)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-[#361D13] text-slate-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                              title="معاينة وطباعة بنود العقد الرسمي"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Record Milestone Payment */}
                            {nextUnpaidMilestone && (
                              <button
                                onClick={() => handleOpenPaymentModal(c, nextUnpaidMilestone)}
                                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white transition-all cursor-pointer shadow-2xs"
                                title={`تسجيل تحصيل: ${nextUnpaidMilestone.title}`}
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}

                            {/* Jump to Project Details */}
                            <button
                              onClick={() => {
                                setSelectedProjectId(c.projectId);
                                setActiveModule('custom_projects');
                              }}
                              className="p-2 rounded-xl bg-[#C87A38]/10 hover:bg-[#C87A38] text-[#C87A38] hover:text-white transition-all cursor-pointer shadow-2xs"
                              title="فتح ملف المشروع الفني الكامل"
                            >
                              <ArrowUpRight className="w-4 h-4" />
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
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredContracts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-bold text-slate-700">لا توجد عقود مطابقة لمعايير البحث</p>
            </div>
          ) : (
            filteredContracts.map(c => {
              const paidAmount = c.milestones?.reduce((s, m) => s + (m.paidAmount || (m.status === 'verified_in_finance' || m.status === 'paid' ? m.amount : 0)), 0) || 0;
              const percentPaid = c.totalValue > 0 ? Math.round((paidAmount / c.totalValue) * 100) : 0;
              const project = customProjects.find(p => p.id === c.projectId);
              const branch = availableBranches.find(b => b.id === project?.branchId);
              const nextUnpaidMilestone = c.milestones?.find(m => m.status !== 'verified_in_finance' && m.status !== 'paid');

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Contract # + Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 font-mono text-sm whitespace-nowrap">{c.contractNumber}</span>
                        <button
                          onClick={() => handleCopy(c.contractNumber)}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded"
                          title="نسخ رقم العقد"
                        >
                          {copiedId === c.contractNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      {getStatusBadge(c.status)}
                    </div>

                    {/* Project & Customer info */}
                    <div>
                      <h3 className="font-black text-slate-900 text-sm line-clamp-1">{project?.projectName || 'مشروع تفصيل مخصص'}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-700">{c.customerName}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                        {c.projectNumber}
                      </span>
                      {branch && (
                        <span className="text-[10px] text-slate-500 bg-stone-100 px-2 py-0.5 rounded-md font-medium">
                          {branch.name}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 whitespace-nowrap">
                        <Calendar className="w-3 h-3" /> {c.contractDate}
                      </span>
                    </div>

                    {/* Financial stats box */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-slate-500 font-medium">القيمة الإجمالية:</span>
                        <span className="text-base font-black text-slate-900 font-mono">
                          {c.totalValue?.toLocaleString('en-US')} <span className="text-xs font-normal text-slate-500">ج.م</span>
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">المحصل: {paidAmount.toLocaleString('en-US')} ج.م</span>
                          <span className="font-black text-emerald-700 font-mono">{percentPaid}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentPaid}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Deposit Verification Badge */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500 font-medium">حالة العربون:</span>
                      {c.isDepositVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" /> تم التحقق المالي
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertCircle className="w-3 h-3" /> بانتظار السداد
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedContractForView(c)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-[#361D13] text-slate-700 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>بنود العقد</span>
                    </button>

                    {nextUnpaidMilestone && (
                      <button
                        onClick={() => handleOpenPaymentModal(c, nextUnpaidMilestone)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>تحصيل دفعة</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedProjectId(c.projectId);
                        setActiveModule('custom_projects');
                      }}
                      className="p-2 rounded-xl bg-[#C87A38]/10 hover:bg-[#C87A38] text-[#C87A38] hover:text-white transition-all cursor-pointer"
                      title="فتح المشروع"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Contract Legal Preview Modal */}
      {selectedContractForView && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#361D13] to-[#5a3222] text-[#C87A38] flex items-center justify-center shadow-sm">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">عقد تصنيع وتوريد مخصص ملزم (Official Contract)</h3>
                  <span className="text-xs font-mono text-slate-500">رقم العقد: {selectedContractForView.contractNumber} | مشروع {selectedContractForView.projectNumber}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedContractForView(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Official Contract Document */}
            <div className="p-6 md:p-8 space-y-6 text-xs text-slate-700 official-quotation-sheet">
              
              {/* Document Letterhead */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-right">
                  <h2 className="text-base font-black text-slate-900">شركة المطابخ والأثاث الحديث للتصنيع والحلول الداخلية</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">سجل تجاري: 40382910 | بطاقة ضريبية: 920-112-401 | المصنع: المنطقة الصناعية</p>
                </div>
                <div className="text-center sm:text-left font-mono">
                  <span className="inline-block px-3 py-1 bg-white border border-stone-300 rounded-xl text-xs font-black text-slate-900 shadow-2xs">
                    {selectedContractForView.contractNumber}
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-1">تاريخ التوثيق: {selectedContractForView.contractDate}</span>
                </div>
              </div>

              {/* Top Identity Block */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-400 block mb-0.5 text-[11px] font-bold">الطرف الأول (المصنّع)</span>
                  <strong className="text-slate-900 text-xs">شركة الأثاث والمطابخ الحديثة</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-400 block mb-0.5 text-[11px] font-bold">الطرف الثاني (العميل)</span>
                  <strong className="text-slate-900 text-xs">{selectedContractForView.customerName}</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-400 block mb-0.5 text-[11px] font-bold">إجمالي قيمة العقد</span>
                  <strong className="text-[#C87A38] text-sm font-black font-mono">
                    {selectedContractForView.totalValue?.toLocaleString('en-US')} ج.م
                  </strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-400 block mb-0.5 text-[11px] font-bold">حالة التوثيق</span>
                  <div>{getStatusBadge(selectedContractForView.status)}</div>
                </div>
              </div>

              {/* Milestones Payment Schedule */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" /> جدول الدفعات والالتزامات المالية الرسمية
                </h4>
                <div className="space-y-2.5">
                  {selectedContractForView.milestones?.map((m, idx) => {
                    const isPaid = m.status === 'verified_in_finance' || m.status === 'paid';
                    return (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                            isPaid ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {m.milestoneIndex}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-slate-900 text-xs">{m.title}</strong>
                              <span className="text-[#C87A38] font-black font-mono">({m.percentage}%)</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{m.dueDateDescription}</p>
                          </div>
                        </div>

                        <div className="text-left shrink-0 pr-9 sm:pr-0">
                          <span className="font-black text-slate-900 font-mono text-sm block">
                            {m.amount?.toLocaleString('en-US')} ج.م
                          </span>
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md mt-0.5">
                              <CheckCircle2 className="w-3 h-3" /> تم السداد ({m.financialReceiptRef || 'إيصال مالي'})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md mt-0.5">
                              <Clock className="w-3 h-3" /> قيد الاستحقاق
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="p-4.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2 text-xs text-slate-700 leading-relaxed">
                <h5 className="font-black text-slate-900 text-xs">الشروط والبنود القانونية الملزمة:</h5>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                  <li>يلتزم الطرف الأول بتنفيذ وتوريد الأعمال طبقاً للمخططات والمقايسة الفنية رقم ({selectedContractForView.quotationId}) المعتمدة.</li>
                  <li>مدة التوريد والتركيب المتفق عليها: <strong>{selectedContractForView.deliveryTerms || '45 يوم عمل من اعتماد العربون والرسومات'}</strong>.</li>
                  <li>يعتبر سداد العربون والتحقق المالي منه شرطاً أساسياً وإلزامياً لانطلاق أمر التقطيع وتخصيص الخامات بالمصنع.</li>
                  <li>أي تعديل يطلبه العميل لاحقاً يخضع لـ "أمر تغيير مواصفات رسمي (Change Order)" ويُلحق بالعقد مع تسوية الفروق المالية ومواعيد التسليم.</li>
                </ol>
              </div>

              {/* Signatures & Seal Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-center">
                  <span className="text-slate-500 block mb-2 font-bold text-xs">توقيع واعتماد الطرف الأول (الشركة)</span>
                  <div className="h-12 border-b border-dashed border-slate-300 flex items-center justify-center font-black text-slate-800">
                    عمر فاروق (مدير المبيعات والمشاريع)
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1.5 block">ختم الإدارة التجارية والمبيعات</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-center">
                  <span className="text-slate-500 block mb-2 font-bold text-xs">توقيع واعتماد الطرف الثاني (العميل)</span>
                  <div className="h-12 border-b border-dashed border-slate-300 flex items-center justify-center font-black text-emerald-700">
                    ✓ {selectedContractForView.signedByCustomerName || selectedContractForView.customerName}
                  </div>
                  <span className="text-[10px] text-emerald-600 mt-1.5 block">توقيع إلكتروني موثق من بوابة العميل</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-2xs cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>طباعة العقد الرسمي (PDF)</span>
              </button>

              <button
                onClick={() => setSelectedContractForView(null)}
                className="bg-[#361D13] hover:bg-[#4a281b] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Record Milestone Payment Modal */}
      {selectedMilestoneForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">تسجيل تحصيل دفعة مرحلية</h3>
                  <span className="text-xs text-slate-500 font-mono">{selectedMilestoneForPayment.contract.contractNumber}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMilestoneForPayment(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4 text-xs">
              
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">الدفعة المستحقة:</span>
                  <span className="text-emerald-700 font-bold font-mono">
                    {selectedMilestoneForPayment.milestone.percentage}% من العقد
                  </span>
                </div>
                <p className="font-black text-slate-900 text-sm">{selectedMilestoneForPayment.milestone.title}</p>
                <span className="text-slate-600 font-mono block">
                  إجمالي قيمة الدفعة: {selectedMilestoneForPayment.milestone.amount?.toLocaleString('en-US')} ج.م
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">المبلغ المحصل الفعلي (ج.م) *</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  required
                  min={1}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base font-black text-slate-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-500/10 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">طريقة السداد المالي *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-600 focus:bg-white cursor-pointer"
                >
                  <option value="bank_transfer">تحويل بنكي رسمي (البنك الأهلي / CIB)</option>
                  <option value="cash">نقداً بخزينة المعرض</option>
                  <option value="card">بطاقة دفع إلكتروني (POS)</option>
                  <option value="check">شيك بنكي مقبول الدفع</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">ملاحظات التحصيل ورقم الإيصال</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="رقم مرجع التحويل أو اسم المودع..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedMilestoneForPayment(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-black shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
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
