import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import {
  TrendingUp,
  Ruler,
  ShoppingBag,
  FileSpreadsheet,
  FileText,
  History,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Filter,
  Calendar,
  Building,
  Sparkles,
  ChevronLeft,
  Users,
  Target,
  Percent
} from 'lucide-react';

export const SalesDashboardPage: React.FC = () => {
  const {
    customProjects,
    projectQuotations,
    customContracts,
    variationOrders,
    orders,
    availableBranches,
    setSelectedProjectId,
    setActiveModule
  } = useERP();

  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'month' | 'quarter' | 'year'>('month');

  // Filter by branch
  const filteredProjects = customProjects.filter(p => selectedBranch === 'all' || p.branchId === selectedBranch);
  const filteredContracts = customContracts.filter(c => {
    const prj = customProjects.find(p => p.id === c.projectId);
    return selectedBranch === 'all' || (prj && prj.branchId === selectedBranch);
  });
  const filteredOrders = orders.filter(o => selectedBranch === 'all' || o.branchId === selectedBranch);

  // Financial Calculations
  const totalCustomContractsValue = filteredContracts.reduce((sum, c) => sum + (c.totalValue || 0), 0);
  const totalReadySalesValue = filteredOrders.reduce((sum, o) => sum + (o.orderTotal || 0), 0);
  const totalSalesRevenue = totalCustomContractsValue + totalReadySalesValue;

  // Milestone collections
  let totalCollectedMilestones = 0;
  let totalPendingMilestones = 0;
  filteredContracts.forEach(c => {
    c.milestones?.forEach(m => {
      const paid = m.paidAmount || (m.status === 'verified_in_finance' || m.status === 'paid' ? m.amount : 0);
      totalCollectedMilestones += paid;
      totalPendingMilestones += (m.amount - paid);
    });
  });

  // Quotation metrics
  const totalQuotes = projectQuotations.length;
  const acceptedQuotes = projectQuotations.filter(q => q.status === 'accepted').length;
  const winRate = totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0;
  const pendingQuotes = projectQuotations.filter(q => q.status === 'under_review' || q.status === 'sent' || q.status === 'draft');

  // Pipeline stages count
  const pipelineCounts = {
    visits: filteredProjects.filter(p => p.status === 'visit_scheduled').length,
    surveys: filteredProjects.filter(p => p.status === 'measured').length,
    design: filteredProjects.filter(p => p.status === 'designing' || p.status === 'design_review' || p.status === 'design_approved').length,
    quotation: filteredProjects.filter(p => p.status === 'quotation' || p.status === 'quotation_sent' || p.status === 'customer_approval' || p.status === 'approved').length,
    contract: filteredProjects.filter(p => p.status === 'contract_draft' || p.status === 'contract_signed' || p.status === 'deposit_verified').length,
    production: filteredProjects.filter(p => p.status === 'ready_for_production' || p.status === 'handed_over_to_tech_office' || p.status === 'in_production' || p.status === 'production_completed').length,
    completed: filteredProjects.filter(p => p.status === 'installation_scheduled' || p.status === 'installed' || p.status === 'completed').length,
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#361D13] to-[#5a3222] text-[#C87A38] flex items-center justify-center shadow-md">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">لوحة تحكم ومؤشرات المبيعات (Sales Dashboard)</h1>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                متابعة الأداء الحي لمشاريع التفصيل المخصص، عروض الأسعار، العقود، ومبيعات صالة الأثاث الجاهز
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Branch filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2">
            <Building className="w-4 h-4 text-slate-500" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              aria-label="تصفية حسب الفرع"
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">جميع الفروع والمعارض</option>
              {availableBranches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Time range */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${timeFilter === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              هذا الشهر
            </button>
            <button
              onClick={() => setTimeFilter('quarter')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${timeFilter === 'quarter' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              الربع الحالي
            </button>
            <button
              onClick={() => setTimeFilter('year')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${timeFilter === 'year' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              السنة
            </button>
          </div>

          {/* Quick POS action */}
          <button
            onClick={() => setActiveModule('sales')}
            className="flex items-center gap-2 bg-[#361D13] hover:bg-[#4a281b] text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#C87A38]" />
            <span>كاشير المعرض (POS)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (4 Key Highlights) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Sales Volume */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-[#C87A38]/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#C87A38]/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي حجم المبيعات المحققة</span>
            <div className="w-10 h-10 rounded-2xl bg-[#C87A38]/10 text-[#C87A38] flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {totalSalesRevenue.toLocaleString('ar-EG')} <span className="text-xs font-bold text-slate-500">ج.م</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> 18.5%
              </span>
              <span>مقارنة بالشهر السابق</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>تفصيل مخصص: <strong className="text-slate-800">{totalCustomContractsValue.toLocaleString('ar-EG')}</strong></span>
              <span>جاهز POS: <strong className="text-slate-800">{totalReadySalesValue.toLocaleString('ar-EG')}</strong></span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Contracts & Win Rate */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">العقود المبرمة ونسبة الإغلاق</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{filteredContracts.length}</span>
              <span className="text-xs font-bold text-slate-500">عقود رسمية موقعة</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-xl w-fit">
              <Percent className="w-3.5 h-3.5" />
              <span>معدل تحويل المقايسات: <strong>{winRate}%</strong></span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>عروض أسعار جارية: <strong className="text-slate-800">{pendingQuotes.length}</strong></span>
              <button onClick={() => setActiveModule('sales_contracts')} className="text-[#C87A38] font-bold hover:underline">عرض العقود ←</button>
            </div>
          </div>
        </div>

        {/* Card 3: Milestone Collections */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">المتحصلات النقدية والدفعات</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {totalCollectedMilestones.toLocaleString('ar-EG')} <span className="text-xs font-bold text-slate-500">ج.م مُحصل</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-xl w-fit">
              <Clock className="w-3.5 h-3.5" />
              <span>متبقي قيد الاستحقاق: <strong>{totalPendingMilestones.toLocaleString('ar-EG')} ج.م</strong></span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>نسبة التحصيل: <strong className="text-slate-800">{totalCustomContractsValue > 0 ? Math.round((totalCollectedMilestones / totalCustomContractsValue) * 100) : 0}%</strong></span>
              <span className="text-slate-400">مربوط بالخزينة</span>
            </div>
          </div>
        </div>

        {/* Card 4: Change Orders & Variations */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">أوامر التغيير والتعديلات (Variation)</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{variationOrders.length}</span>
              <span className="text-xs font-bold text-slate-500">أوامر تغيير مسجلة</span>
            </div>
            <div className="mt-2 text-xs font-medium text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-xl w-fit">
              <span>صافي فرق القيمة المضافة: <strong>+{variationOrders.reduce((sum, v) => sum + (v.totalPriceImpact || 0), 0).toLocaleString('ar-EG')} ج.م</strong></span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>قيد المراجعة: <strong className="text-amber-600">{variationOrders.filter(v => v.status === 'pending_approval').length}</strong></span>
              <button onClick={() => setActiveModule('sales_change_orders')} className="text-[#C87A38] font-bold hover:underline">إدارة التعديلات ←</button>
            </div>
          </div>
        </div>

      </div>

      {/* Projects Pipeline Funnel Strip */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#C87A38]" />
            <h2 className="text-base font-black text-slate-900">قمع مراحل دورة مشاريع التفصيل المخصص (Pipeline Funnel)</h2>
          </div>
          <button
            onClick={() => setActiveModule('custom_projects')}
            className="text-xs font-bold text-[#C87A38] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>فتح قمع المشاريع التفصيلي</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 text-center hover:bg-slate-100/80 transition-all cursor-pointer" onClick={() => setActiveModule('custom_projects')}>
            <span className="text-xs font-bold text-slate-500 block mb-1">1. المعاينة الميدانية</span>
            <span className="text-xl font-black text-slate-900">{pipelineCounts.visits}</span>
            <span className="text-[11px] text-slate-400 block mt-1">مواعيد مجدولة</span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 text-center hover:bg-slate-100/80 transition-all cursor-pointer" onClick={() => setActiveModule('custom_projects')}>
            <span className="text-xs font-bold text-slate-500 block mb-1">2. الرفع المساحي</span>
            <span className="text-xl font-black text-indigo-600">{pipelineCounts.surveys}</span>
            <span className="text-[11px] text-slate-400 block mt-1">مقاسات الموقع</span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 text-center hover:bg-slate-100/80 transition-all cursor-pointer" onClick={() => setActiveModule('custom_projects')}>
            <span className="text-xs font-bold text-slate-500 block mb-1">3. تصميم الـ 3D</span>
            <span className="text-xl font-black text-purple-600">{pipelineCounts.design}</span>
            <span className="text-[11px] text-slate-400 block mt-1">مخططات ثلاثية</span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 text-center hover:bg-slate-100/80 transition-all cursor-pointer" onClick={() => setActiveModule('sales_quotations')}>
            <span className="text-xs font-bold text-slate-500 block mb-1">4. المقايسة والتسعير</span>
            <span className="text-xl font-black text-blue-600">{pipelineCounts.quotation}</span>
            <span className="text-[11px] text-slate-400 block mt-1">عروض أسعار BOQ</span>
          </div>

          <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 text-center hover:bg-emerald-100/60 transition-all cursor-pointer" onClick={() => setActiveModule('sales_contracts')}>
            <span className="text-xs font-bold text-emerald-800 block mb-1">5. التعاقد والمقدم</span>
            <span className="text-xl font-black text-emerald-700">{pipelineCounts.contract}</span>
            <span className="text-[11px] text-emerald-600 block mt-1">عقود رسمية</span>
          </div>

          <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 text-center hover:bg-amber-100/60 transition-all cursor-pointer" onClick={() => setActiveModule('custom_projects')}>
            <span className="text-xs font-bold text-amber-800 block mb-1">6. التصنيع بالورشة</span>
            <span className="text-xl font-black text-amber-700">{pipelineCounts.production}</span>
            <span className="text-[11px] text-amber-600 block mt-1">أوامر تشغيل</span>
          </div>

          <div className="bg-teal-50/70 rounded-2xl p-4 border border-teal-200 text-center hover:bg-teal-100/60 transition-all cursor-pointer" onClick={() => setActiveModule('custom_projects')}>
            <span className="text-xs font-bold text-teal-800 block mb-1">7. التسليم والتركيب</span>
            <span className="text-xl font-black text-teal-700">{pipelineCounts.completed}</span>
            <span className="text-[11px] text-teal-600 block mt-1">محاضر معتمدة</span>
          </div>

        </div>
      </div>

      {/* Two Column Section: Recent Contracts & Pending Quotations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Contracts Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-slate-900 text-base">أحدث العقود المبرمة وجداول الدفعات</h3>
            </div>
            <button
              onClick={() => setActiveModule('sales_contracts')}
              className="text-xs font-bold text-[#C87A38] hover:underline"
            >
              عرض الكل ({filteredContracts.length})
            </button>
          </div>

          <div className="space-y-3">
            {filteredContracts.slice(0, 4).map(c => {
              const paidAmount = c.milestones?.reduce((s, m) => s + (m.paidAmount || (m.status === 'verified_in_finance' ? m.amount : 0)), 0) || 0;
              const percentPaid = c.totalValue > 0 ? Math.round((paidAmount / c.totalValue) * 100) : 0;
              
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedProjectId(c.projectId);
                    setActiveModule('custom_projects');
                  }}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 font-mono">{c.contractNumber}</span>
                      <span className="text-xs font-bold text-slate-700">{c.customerName}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{c.paymentTerms}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${percentPaid}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700">{percentPaid}% تم تحصيله</span>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <div className="text-sm font-black text-slate-900">
                      {c.totalValue.toLocaleString('ar-EG')} <span className="text-[10px] font-normal text-slate-500">ج.م</span>
                    </div>
                    <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {c.status === 'signed' ? 'موقع ومعتمد' : c.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Quotations Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <h3 className="font-black text-slate-900 text-base">عروض الأسعار والمقايسات قيد التفاوض</h3>
            </div>
            <button
              onClick={() => setActiveModule('sales_quotations')}
              className="text-xs font-bold text-[#C87A38] hover:underline"
            >
              عرض الكل ({projectQuotations.length})
            </button>
          </div>

          <div className="space-y-3">
            {projectQuotations.slice(0, 4).map(q => {
              const project = customProjects.find(p => p.id === q.projectId);
              
              return (
                <div
                  key={q.id}
                  onClick={() => setActiveModule('sales_quotations')}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 font-mono">عرض إصدار v{q.version}</span>
                      <span className="text-xs font-bold text-slate-700">{project?.customerName || 'عميل'}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {project?.projectName || 'مشروع تفصيل'} - {q.breakdown?.specifications?.doors || 'مواصفات قياسية'}
                    </p>
                    <span className="text-[11px] text-slate-400 block mt-1">تاريخ الإنشاء: {q.createdDate}</span>
                  </div>

                  <div className="text-left shrink-0">
                    <div className="text-sm font-black text-slate-900">
                      {q.totalSelling.toLocaleString('ar-EG')} <span className="text-[10px] font-normal text-slate-500">ج.م</span>
                    </div>
                    <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      q.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      q.status === 'sent' || q.status === 'under_review' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {q.status === 'accepted' ? 'تم القبول' : q.status === 'sent' ? 'مرسل للعميل' : q.status === 'under_review' ? 'قيد المراجعة' : 'مسودة'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
