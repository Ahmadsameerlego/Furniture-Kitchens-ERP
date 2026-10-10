import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { ProjectQuotation, QuotationStatus } from '../types/erp';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Printer,
  TrendingUp,
  X,
  Send,
  Building,
  Ruler,
  Layers,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  User,
  Phone,
  Calendar,
  LayoutGrid,
  List,
  DollarSign,
  Percent,
  CheckCheck,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';

export const SalesQuotationsPage: React.FC = () => {
  const {
    projectQuotations,
    customProjects,
    availableBranches,
    setSelectedProjectId,
    setActiveModule,
    updateQuotationStatus
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedQuoteForModal, setSelectedQuoteForModal] = useState<ProjectQuotation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter Quotations
  const filteredQuotations = projectQuotations.filter(q => {
    const project = customProjects.find(p => p.id === q.projectId);
    const branchId = project?.branchId || '';

    const matchesSearch =
      (project?.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project?.projectNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project?.projectName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project?.customerPhone || '').includes(searchQuery) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || q.status === selectedStatus;
    const matchesBranch = selectedBranch === 'all' || branchId === selectedBranch;

    return matchesSearch && matchesStatus && matchesBranch;
  });

  // Aggregate Metrics
  const totalValue = filteredQuotations.reduce((sum, q) => sum + (q.totalSelling || 0), 0);
  const totalCost = filteredQuotations.reduce((sum, q) => sum + (q.totalCost || 0), 0);
  const totalProfit = totalValue - totalCost;
  const avgMargin = totalValue > 0 ? Math.round((totalProfit / totalValue) * 100) : 0;
  const acceptedCount = filteredQuotations.filter(q => q.status === 'accepted').length;

  const handleStatusChange = (quoteId: string, status: QuotationStatus) => {
    updateQuotationStatus(quoteId, status);
    if (selectedQuoteForModal && selectedQuoteForModal.id === quoteId) {
      setSelectedQuoteForModal({ ...selectedQuoteForModal, status });
    }
  };

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>معتمد من العميل</span>
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs">
            <Send className="w-3.5 h-3.5 text-blue-600" />
            <span>تم الإرسال للعميل</span>
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>قيد التفاوض والمراجعة</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>مرفوض / ملغي</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>مسودة تسعير</span>
          </span>
        );
    }
  };

  const statusOptions = [
    { key: 'all', label: 'الكل', count: projectQuotations.length },
    { key: 'accepted', label: 'معتمد', count: projectQuotations.filter(q => q.status === 'accepted').length },
    { key: 'under_review', label: 'قيد التفاوض', count: projectQuotations.filter(q => q.status === 'under_review').length },
    { key: 'sent', label: 'تم الإرسال', count: projectQuotations.filter(q => q.status === 'sent').length },
    { key: 'draft', label: 'مسودة', count: projectQuotations.filter(q => q.status === 'draft').length },
  ];

  return (
    <div className="space-y-6 pb-16 font-sans antialiased text-slate-800">

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#2c170f] via-[#3d2015] to-[#2c170f] text-white rounded-3xl p-6 md:p-8 shadow-xl border border-[#4a281b]">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#C87A38]/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C87A38] to-[#8d4f1c] text-white flex items-center justify-center shadow-lg shadow-[#C87A38]/20 shrink-0 ring-4 ring-white/10">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">سجل عروض الأسعار والمقايسات الفنية</h1>
                <span className="bg-[#C87A38]/20 text-[#e9a56c] border border-[#C87A38]/40 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> {filteredQuotations.length} مقايسة نشطة
                </span>
              </div>
              <p className="text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
                إدارة وحساب تكاليف المقايسات الفنية (BOQ)، تسعير الأمتار والخامات وإكسسوارات بلوم، ومتابعة اعتماد العروض وتحويلها لعقود
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
            <button
              onClick={() => setActiveModule('custom_projects')}
              className="group flex items-center gap-2.5 bg-gradient-to-r from-[#C87A38] to-[#a85f23] hover:from-[#d58744] hover:to-[#b76827] text-white px-5 py-3 rounded-2xl text-xs font-black shadow-lg shadow-[#C87A38]/25 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Ruler className="w-4 h-4 transition-transform group-hover:rotate-45 duration-300" />
              <span>إنشاء مقايسة من قمع المشاريع</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        
        {/* Card 1: Total Quotations */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">إجمالي المقايسات الصادرة</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#C87A38] flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {filteredQuotations.length}
            </span>
            <span className="text-xs font-bold text-slate-400">عرض سعر</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {acceptedCount} معتمد ومحول لعقود
            </span>
            <span className="text-slate-400 font-mono">
              {filteredQuotations.length > 0 ? Math.round((acceptedCount / filteredQuotations.length) * 100) : 0}% قبول
            </span>
          </div>
        </div>

        {/* Card 2: Total Selling Value */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">إجمالي القيمة البيعية للعروض</span>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {totalValue.toLocaleString('en-US')}
            </span>
            <span className="text-xs font-bold text-slate-500">ج.م</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">شامل الخامات والتركيبات</span>
            <span className="text-slate-400 font-medium font-mono">حسب مقايسات BOQ</span>
          </div>
        </div>

        {/* Card 3: Total Estimated Cost */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">إجمالي التكلفة المرجعية</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-700 font-mono tracking-tight">
              {totalCost.toLocaleString('en-US')}
            </span>
            <span className="text-xs font-bold text-slate-500">ج.م</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-blue-700 font-bold">تكلفة الخامات والمصنعيات</span>
            <span className="text-slate-400 font-medium">وفق جداول BOM</span>
          </div>
        </div>

        {/* Card 4: Profit Margin */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">متوسط هامش الربح التقديري</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono tracking-tight">
              +{avgMargin}%
            </span>
            <span className="text-xs font-bold text-emerald-700 font-mono">({totalProfit.toLocaleString('en-US')} ج.م)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, avgMargin * 2)}%` }} />
            </div>
          </div>
        </div>

      </div>

      {/* Filter & Search Bar */}
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
                placeholder="بحث برقم العرض QTE، المشروع، العميل، الهاتف..."
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
          {(searchQuery || selectedStatus !== 'all' || selectedBranch !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
                setSelectedBranch('all');
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
            <table className="w-full text-right border-collapse min-w-[980px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-black text-slate-600 uppercase tracking-wider">
                  <th className="py-4 px-5">المقايسة والمشروع</th>
                  <th className="py-4 px-5">العميل والتاريخ</th>
                  <th className="py-4 px-5">مواصفات الخامات والأمتار</th>
                  <th className="py-4 px-5">القيمة المالية والربحية</th>
                  <th className="py-4 px-5">حالة الاعتماد</th>
                  <th className="py-4 px-5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredQuotations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300">
                        <FileSpreadsheet className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-black text-slate-700">لا توجد مقايسات مطابقة لمعايير البحث الحالية</p>
                      <p className="text-xs text-slate-400 mt-1">جرّب تعديل كلمات البحث أو فلتر الحالة والفرع</p>
                    </td>
                  </tr>
                ) : (
                  filteredQuotations.map(q => {
                    const project = customProjects.find(p => p.id === q.projectId);
                    const branch = availableBranches.find(b => b.id === project?.branchId);
                    const marginPct = q.totalSelling > 0 ? Math.round(((q.totalSelling - q.totalCost) / q.totalSelling) * 100) : 0;
                    const profitVal = q.totalSelling - q.totalCost;
                    const breakdown = q.breakdown;

                    return (
                      <tr key={q.id} className="hover:bg-slate-50/80 transition-colors group">
                        
                        {/* 1. Quotation & Project Details */}
                        <td className="py-4 px-5 align-top">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 font-mono text-sm tracking-tight">{q.id.toUpperCase()}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#C87A38]/10 text-[#C87A38] font-mono">
                              v{q.version}
                            </span>
                            <button
                              onClick={() => handleCopy(q.id)}
                              className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors"
                              title="نسخ كود المقايسة"
                            >
                              {copiedId === q.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>

                          <div className="font-bold text-slate-800 mt-1 line-clamp-1">{project?.projectName || 'مشروع تفصيل مخصص'}</div>
                          
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                              {project?.projectNumber}
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
                              {(project?.customerName || 'ع').charAt(0)}
                            </div>
                            <div>
                              <div className="font-black text-slate-900 leading-snug">{project?.customerName || 'عميل'}</div>
                              {project?.customerPhone && (
                                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{project.customerPhone}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-2 text-[11px] text-slate-400 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="whitespace-nowrap">تاريخ العرض: {q.createdDate}</span>
                          </div>
                        </td>

                        {/* 3. Technical Specifications Summary */}
                        <td className="py-4 px-5 align-top max-w-sm">
                          {breakdown?.specifications ? (
                            <div className="space-y-1.5 text-[11px]">
                              <div className="flex items-start gap-1 text-slate-700">
                                <span className="font-bold text-slate-500 shrink-0">الضلف:</span>
                                <span className="line-clamp-1 font-medium text-slate-800" title={breakdown.specifications.doors}>
                                  {breakdown.specifications.doors}
                                </span>
                              </div>

                              <div className="flex items-start gap-1 text-slate-600">
                                <span className="font-bold text-slate-500 shrink-0">الشاسيه:</span>
                                <span className="line-clamp-1 font-medium" title={breakdown.specifications.carcass}>
                                  {breakdown.specifications.carcass}
                                </span>
                              </div>

                              {breakdown.meterage?.totalMeters ? (
                                <div className="pt-0.5 flex items-center gap-1.5 flex-wrap">
                                  <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md font-bold font-mono text-[10px]">
                                    <Ruler className="w-3 h-3 text-[#C87A38]" /> {breakdown.meterage.totalMeters} م.ط
                                  </span>
                                  {breakdown.meterage.pricePerMeter && (
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      @ {breakdown.meterage.pricePerMeter.toLocaleString('en-US')} ج.م/متر
                                    </span>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-medium italic">مواصفات قياسية معتمدة</span>
                          )}
                        </td>

                        {/* 4. Financial Value & Profitability */}
                        <td className="py-4 px-5 align-top">
                          <div className="space-y-1">
                            {/* Total Selling */}
                            <div className="flex items-baseline gap-1">
                              <span className="text-base font-black text-slate-900 font-mono tracking-tight">
                                {q.totalSelling?.toLocaleString('en-US')}
                              </span>
                              <span className="text-[11px] font-bold text-slate-500">ج.م</span>
                            </div>

                            {/* Estimated Cost */}
                            <div className="text-[11px] text-slate-500 font-mono">
                              التكلفة: <span className="text-slate-700 font-bold">{q.totalCost?.toLocaleString('en-US')} ج.م</span>
                            </div>

                            {/* Margin Badge */}
                            <div className="pt-0.5">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black font-mono ${
                                marginPct >= 40 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              }`}>
                                <TrendingUp className="w-3 h-3" />
                                <span>+{marginPct}% هامش ربح ({profitVal.toLocaleString('en-US')} ج.م)</span>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 5. Approval Status */}
                        <td className="py-4 px-5 align-top">
                          <div className="space-y-1">
                            {getStatusBadge(q.status)}
                            {q.acceptedAt && (
                              <div className="text-[10px] text-emerald-700 font-mono block font-bold">
                                تم الاعتماد: {q.acceptedAt}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 6. Actions */}
                        <td className="py-4 px-5 align-top text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            
                            {/* Preview BOQ */}
                            <button
                              onClick={() => setSelectedQuoteForModal(q)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-[#361D13] text-slate-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                              title="معاينة تفاصيل المقايسة الفنية BOQ"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Quick Convert / Accept Action if under review */}
                            {q.status !== 'accepted' && (
                              <button
                                onClick={() => handleStatusChange(q.id, 'accepted')}
                                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white transition-all cursor-pointer shadow-2xs"
                                title="اعتماد العرض من العميل"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Jump to Project Details */}
                            <button
                              onClick={() => {
                                setSelectedProjectId(q.projectId);
                                setActiveModule('custom_projects');
                              }}
                              className="p-2 rounded-xl bg-[#C87A38]/10 hover:bg-[#C87A38] text-[#C87A38] hover:text-white transition-all cursor-pointer shadow-2xs"
                              title="فتح ملف المشروع الكامل"
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
          {filteredQuotations.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-bold text-slate-700">لا توجد مقايسات مطابقة لمعايير البحث</p>
            </div>
          ) : (
            filteredQuotations.map(q => {
              const project = customProjects.find(p => p.id === q.projectId);
              const branch = availableBranches.find(b => b.id === project?.branchId);
              const marginPct = q.totalSelling > 0 ? Math.round(((q.totalSelling - q.totalCost) / q.totalSelling) * 100) : 0;
              const breakdown = q.breakdown;

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: QTE # + Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 font-mono text-sm">{q.id.toUpperCase()}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#C87A38]/10 text-[#C87A38] font-mono">
                          v{q.version}
                        </span>
                        <button
                          onClick={() => handleCopy(q.id)}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded"
                          title="نسخ كود المقايسة"
                        >
                          {copiedId === q.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      {getStatusBadge(q.status)}
                    </div>

                    {/* Project & Customer info */}
                    <div>
                      <h3 className="font-black text-slate-900 text-sm line-clamp-1">{project?.projectName || 'مشروع تفصيل مخصص'}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-700">{project?.customerName || 'عميل'}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                        {project?.projectNumber}
                      </span>
                      {branch && (
                        <span className="text-[10px] text-slate-500 bg-stone-100 px-2 py-0.5 rounded-md font-medium">
                          {branch.name}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 whitespace-nowrap">
                        <Calendar className="w-3 h-3" /> {q.createdDate}
                      </span>
                    </div>

                    {/* Materials Summary */}
                    {breakdown?.specifications && (
                      <div className="text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 space-y-1">
                        <p className="text-slate-700 line-clamp-1"><strong>الضلف:</strong> {breakdown.specifications.doors}</p>
                        <p className="text-slate-600 line-clamp-1"><strong>الشاسيه:</strong> {breakdown.specifications.carcass}</p>
                      </div>
                    )}

                    {/* Financial stats box */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-slate-500 font-medium">القيمة البيعية:</span>
                        <span className="text-base font-black text-slate-900 font-mono">
                          {q.totalSelling?.toLocaleString('en-US')} <span className="text-xs font-normal text-slate-500">ج.م</span>
                        </span>
                      </div>

                      <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                        <span>التكلفة: {q.totalCost?.toLocaleString('en-US')} ج.م</span>
                        <span className="font-black text-emerald-700">+{marginPct}% هامش</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedQuoteForModal(q)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-[#361D13] text-slate-700 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>تفاصيل المقايسة</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProjectId(q.projectId);
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

      {/* BOQ Breakdown Preview Modal */}
      {selectedQuoteForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#361D13] to-[#5a3222] text-[#C87A38] flex items-center justify-center shadow-sm">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">تفاصيل المقايسة الفنية الرسمية (BOQ Preview)</h3>
                  <span className="text-xs font-mono text-slate-500">{selectedQuoteForModal.id.toUpperCase()} - إصدار v{selectedQuoteForModal.version}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedQuoteForModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8 space-y-6 text-xs text-slate-700 official-quotation-sheet">
              
              {/* Top Details Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-bold text-[11px]">العميل</span>
                  <strong className="text-slate-900 text-sm">
                    {customProjects.find(p => p.id === selectedQuoteForModal.projectId)?.customerName || 'عميل'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-bold text-[11px]">تاريخ العرض</span>
                  <strong className="text-slate-800 font-mono">{selectedQuoteForModal.createdDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-bold text-[11px]">الإجمالي قبل الضريبة</span>
                  <strong className="text-[#C87A38] text-base font-black font-mono">
                    {selectedQuoteForModal.totalSelling?.toLocaleString('en-US')} ج.م
                  </strong>
                  <span className="block text-[11px] text-slate-500 font-mono">
                    شامل ضريبة 14%: {Math.round((selectedQuoteForModal.totalSelling || 0) * 1.14).toLocaleString('en-US')} ج.م
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-bold text-[11px]">الحالة الحالية</span>
                  <div>{getStatusBadge(selectedQuoteForModal.status)}</div>
                </div>
              </div>

              {/* Technical Specifications */}
              {selectedQuoteForModal.breakdown?.specifications && (
                <div className="space-y-3">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#C87A38]" /> مواصفات الخامات المعتمدة
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                      <span className="text-slate-500 font-bold block mb-1">الضلف والواجهات:</span>
                      <p className="text-slate-800 font-medium leading-relaxed">{selectedQuoteForModal.breakdown.specifications.doors}</p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                      <span className="text-slate-500 font-bold block mb-1">الشاسيه والهيكل:</span>
                      <p className="text-slate-800 font-medium leading-relaxed">{selectedQuoteForModal.breakdown.specifications.carcass}</p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                      <span className="text-slate-500 font-bold block mb-1">المفصلات والمجاري:</span>
                      <p className="text-slate-800 font-medium leading-relaxed">{selectedQuoteForModal.breakdown.specifications.hinges}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Meterage Breakdown */}
              {selectedQuoteForModal.breakdown?.meterage && (
                <div className="space-y-3">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-indigo-600" /> تفصيل الأمتار والوحدات
                  </h4>
                  <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200/70 space-y-2.5">
                    <div className="flex justify-between py-1 border-b border-slate-200/60 font-mono">
                      <span className="text-slate-600 font-sans">علب سفلية:</span>
                      <span className="font-bold text-slate-800">{selectedQuoteForModal.breakdown.meterage.baseUnitsMeters} م.ط</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60 font-mono">
                      <span className="text-slate-600 font-sans">علب علوية:</span>
                      <span className="font-bold text-slate-800">{selectedQuoteForModal.breakdown.meterage.upperUnitsMeters} م.ط</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60 font-mono">
                      <span className="text-slate-600 font-sans">سعر المتر الطولي المعتمد:</span>
                      <span className="font-bold text-slate-800">{selectedQuoteForModal.breakdown.meterage.pricePerMeter?.toLocaleString('en-US')} ج.م</span>
                    </div>
                    <div className="flex justify-between py-1 pt-2 font-black text-slate-900 text-sm font-mono">
                      <span className="font-sans">إجمالي قيمة الأمتار:</span>
                      <span>{selectedQuoteForModal.breakdown.meterage.totalPrice?.toLocaleString('en-US')} ج.م</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Blum Mechanisms & Additions */}
              {selectedQuoteForModal.breakdown?.mechanisms && selectedQuoteForModal.breakdown.mechanisms.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-emerald-600" /> الميكانيزمات والإكسسوارات الميكانيكية
                  </h4>
                  <div className="space-y-2">
                    {selectedQuoteForModal.breakdown.mechanisms.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                        <span className="font-bold text-slate-800">{m.name}</span>
                        <span className="font-mono font-black text-slate-900">{m.totalPrice?.toLocaleString('en-US')} ج.م</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Marble & Logistics */}
              {selectedQuoteForModal.breakdown?.marble && (
                <div className="space-y-3">
                  <h4 className="font-black text-slate-900 text-sm">مسطح الرخام / الكوارتز</h4>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{selectedQuoteForModal.breakdown.marble.typeName}</p>
                      <span className="text-slate-500 font-mono text-[11px]">{selectedQuoteForModal.breakdown.marble.meters} متر @ {selectedQuoteForModal.breakdown.marble.pricePerMeter?.toLocaleString('en-US')} ج.م</span>
                    </div>
                    <span className="font-mono font-black text-slate-900">{selectedQuoteForModal.breakdown.marble.totalPrice?.toLocaleString('en-US')} ج.م</span>
                  </div>
                </div>
              )}

              {/* Payment & Warranty Terms */}
              {selectedQuoteForModal.breakdown?.paymentTerms && (
                <div className="p-4.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2 text-amber-950">
                  <h5 className="font-black">شروط الدفع والتسليم والضمان المعتمدة:</h5>
                  <p>• جدول الدفعات: عربون {selectedQuoteForModal.breakdown.paymentTerms.downPaymentPercent}% عند التعاقد | {selectedQuoteForModal.breakdown.paymentTerms.productionPaymentPercent}% بدء التصنيع | {selectedQuoteForModal.breakdown.paymentTerms.deliveryPaymentPercent}% استلام وتركيب.</p>
                  <p>• مدة التوريد: {selectedQuoteForModal.breakdown.paymentTerms.deliveryDurationDays}.</p>
                  <p>• فترة الضمان الشامل: {selectedQuoteForModal.breakdown.paymentTerms.warrantyYears} سنوات ضد عيوب الصناعة.</p>
                </div>
              )}

            </div>

            {/* Modal Actions */}
            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatusChange(selectedQuoteForModal.id, 'accepted')}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>اعتماد العرض رسميّاً</span>
                </button>
                <button
                  onClick={() => handleStatusChange(selectedQuoteForModal.id, 'rejected')}
                  className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>رفض العرض</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>طباعة رسمية (PDF)</span>
                </button>
                <button
                  onClick={() => setSelectedQuoteForModal(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
