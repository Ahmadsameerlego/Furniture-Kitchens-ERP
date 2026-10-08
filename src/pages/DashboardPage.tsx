import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import {
  Sparkles,
  MapPin,
  ShieldCheck,
  Building2,
  Users,
  Compass,
  Ruler,
  Layers,
  Factory,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Eye,
  Boxes,
  Hammer,
  FileText,
  CreditCard,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileCheck,
  Activity,
  SlidersHorizontal,
  FolderKanban,
  Wrench
} from 'lucide-react';
import { ProjectType, ProjectStatus } from '../types/erp';
import { daysFromToday } from '../mock/scenario';

export const DashboardPage: React.FC = () => {
  const {
    currentUser,
    currentRole,
    currentBranch,
    branches,
    customProjects,
    customContracts,
    siteVisits,
    productionOrders,
    installationRecords,
    paymentReceipts,
    variationOrders,
    projectHandovers,
    materials,
    setActiveModule,
    setSelectedProjectId,
    setSelectedProductionOrderId
  } = useERP();

  const [projectTypeFilter, setProjectTypeFilter] = useState<'all' | ProjectType>('all');

  // --- Dynamic Computations for Custom / Commissioned Works ---

  // 1. Financial Contract Metrics
  const totalContractsValue = customContracts.reduce((sum, c) => sum + (c.totalValue || 0), 0);
  const totalCollectedReceipts = paymentReceipts.reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingCollection = Math.max(0, totalContractsValue - totalCollectedReceipts);
  const collectionRate = totalContractsValue > 0 ? Math.round((totalCollectedReceipts / totalContractsValue) * 100) : 0;

  // 2. Custom Project Pipeline Metrics
  const activeProjects = customProjects.filter(p => p.status !== 'completed' && p.status !== 'cancelled' && p.status !== 'rejected');
  
  // Pipeline Stage Groups
  const surveyStageCount = customProjects.filter(p => ['new', 'opportunity', 'visit_scheduled', 'measured'].includes(p.status)).length;
  const techOfficeStageCount = customProjects.filter(p => ['designing', 'design_review', 'design_approved', 'quotation', 'quotation_sent', 'customer_approval', 'approved', 'ready_for_handover', 'handed_over_to_tech_office'].includes(p.status)).length;
  const contractStageCount = customProjects.filter(p => ['contract_draft', 'contract_signed', 'deposit_verified'].includes(p.status)).length;
  const productionStageCount = customProjects.filter(p => ['ready_for_production', 'in_production', 'production_completed'].includes(p.status)).length;
  const installationStageCount = customProjects.filter(p => ['installation_scheduled', 'installed'].includes(p.status)).length;
  const completedStageCount = customProjects.filter(p => p.status === 'completed').length;

  // 3. Workshop & Production Orders
  const activeProductionOrders = productionOrders.filter(po => po.status !== 'completed' && po.status !== 'cancelled');
  const completedProdOrders = productionOrders.filter(po => po.status === 'completed');

  // 4. Site Visits & Installations
  const scheduledVisits = siteVisits.filter(sv => sv.status === 'scheduled');
  const activeInstallations = installationRecords.filter(ir => ir.status === 'scheduled' || ir.status === 'confirmed' || ir.status === 'in_progress');

  // 5. Critical Materials Alert
  const lowStockMaterials = materials.filter(m => (m.currentStock || 0) <= (m.minStockLevel || 0) + 2);

  // Filtered projects list for the Live Monitor
  const filteredProjects = customProjects.filter(p => {
    if (projectTypeFilter === 'all') return true;
    return p.projectType === projectTypeFilter;
  });

  // Helper for Project Type labels
  const getProjectTypeLabel = (type: ProjectType) => {
    switch (type) {
      case 'kitchen': return { label: 'مطبخ تفصيل', bg: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'bedroom': return { label: 'غرفة نوم مخصصة', bg: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
      case 'wardrobe': return { label: 'دريسنج روم / دواليب', bg: 'bg-blue-100 text-blue-900 border-blue-200' };
      case 'tv_unit': return { label: 'وحدة تلفزيون وتجاليد', bg: 'bg-purple-100 text-purple-900 border-purple-200' };
      case 'living': return { label: 'ليفينج وسفرة عمولة', bg: 'bg-indigo-100 text-indigo-900 border-indigo-200' };
      default: return { label: 'أثاث عمولة مخصص', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  // Helper for Project Status badge
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'new':
      case 'opportunity':
        return { text: 'طلب واستشارة جديدة', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'visit_scheduled':
        return { text: 'زيارة مقاسات مجدولة', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'measured':
        return { text: 'تم رفع المقاسات بالموقع', color: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'designing':
      case 'design_review':
      case 'design_approved':
        return { text: 'تصميم ومخططات 3D', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'quotation':
      case 'quotation_sent':
      case 'customer_approval':
      case 'approved':
        return { text: 'عرض سعر معتمد', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'contract_signed':
      case 'deposit_verified':
        return { text: 'عقد موقع ومقدم محصل', color: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'ready_for_production':
        return { text: 'مفرج للتخطيط - بانتظار الخامات', color: 'bg-orange-50 text-orange-800 border-orange-200' };
      case 'handed_over_to_tech_office':
        return { text: 'مستلم بالمكتب الفني', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
      case 'in_production':
        return { text: 'قيد التصنيع بالورشة', color: 'bg-amber-100 text-[#C87A38] border-[#C87A38]/30 font-black' };
      case 'production_completed':
        return { text: 'تم اكتمال التصنيع بالمصنع', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'installation_scheduled':
        return { text: 'توريد وتركيب مجدول', color: 'bg-violet-50 text-violet-800 border-violet-200' };
      case 'installed':
        return { text: 'تم التركيب بالموقع', color: 'bg-lime-50 text-lime-800 border-lime-300' };
      case 'completed':
        return { text: 'تم التسليم والاعتماد النهائي', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold' };
      default:
        return { text: status, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  // Helper for Project Progress Percentage
  const getProjectProgress = (status: ProjectStatus) => {
    switch (status) {
      case 'new':
      case 'opportunity': return 10;
      case 'visit_scheduled': return 20;
      case 'measured': return 30;
      case 'designing':
      case 'design_review':
      case 'design_approved': return 45;
      case 'quotation':
      case 'quotation_sent':
      case 'customer_approval': return 55;
      case 'contract_draft':
      case 'contract_signed':
      case 'deposit_verified': return 65;
      case 'handed_over_to_tech_office': return 70;
      case 'ready_for_production': return 75;
      case 'in_production': return 85;
      case 'production_completed': return 90;
      case 'installation_scheduled':
      case 'installed': return 95;
      case 'completed': return 100;
      default: return 15;
    }
  };

  const navigateToProject = (id: string) => {
    setSelectedProjectId(id);
    setActiveModule('custom_projects');
  };

  // 6. Action radar — derived from live records so it always matches the other screens
  const todayIso = daysFromToday(0);
  type RadarAlert = { key: string; tone: 'red' | 'amber' | 'blue' | 'purple'; title: string; meta: string; body: React.ReactNode; action: string; onClick: () => void };
  const radarAlerts: RadarAlert[] = [];

  productionOrders
    .filter(po => po.status !== 'completed' && po.materials?.some(m => m.status === 'shortage'))
    .forEach(po => {
      const short = po.materials.filter(m => m.status === 'shortage');
      radarAlerts.push({
        key: `short-${po.id}`,
        tone: 'red',
        title: 'أمر تصنيع متوقف بسبب عجز خامات',
        meta: 'عاجل',
        body: <><strong>{po.productionNumber}</strong> ({po.customerName}) ينتظر {short.map(m => `${Math.max(0, m.remainingQuantity - m.reservedQuantity)} ${m.unit === 'Sheet' ? 'لوح' : m.unit} ${m.materialName}`).join('، ')}.</>,
        action: 'متابعة طلب الشراء',
        onClick: () => setActiveModule('proc_requests')
      });
    });

  customContracts.forEach(contract => {
    const project = customProjects.find(p => p.id === contract.projectId);
    const shipping = contract.milestones.find(m => m.milestoneIndex === 2);
    if (project?.status === 'in_production' && shipping && shipping.status === 'pending') {
      radarAlerts.push({
        key: `pay-${contract.id}`,
        tone: 'amber',
        title: 'دفعة مستحقة قبل خروج التوريد',
        meta: `${shipping.percentage}%`,
        body: <>العميل <strong>{contract.customerName}</strong>: دفعة {shipping.amount.toLocaleString()} ج.م مستحقة قبل شحن {project.projectNumber}.</>,
        action: 'تسجيل إيصال سداد',
        onClick: () => navigateToProject(project.id)
      });
    }
  });

  installationRecords
    .filter(ir => ir.scheduledDate === todayIso && ir.status !== 'completed')
    .forEach(ir => radarAlerts.push({
      key: `inst-${ir.id}`,
      tone: 'blue',
      title: 'تركيب بموقع العميل اليوم',
      meta: ir.scheduledTime || '',
      body: <>{ir.installationNumber} للعميل <strong>{ir.customerName}</strong> - {ir.address}.</>,
      action: 'جدول التركيبات',
      onClick: () => setActiveModule('installation')
    }));

  variationOrders
    .filter(v => v.status === 'pending_approval')
    .forEach(v => radarAlerts.push({
      key: `var-${v.id}`,
      tone: 'purple',
      title: 'أمر تغيير بانتظار الاعتماد',
      meta: `+${v.totalPriceImpact.toLocaleString()} ج.م`,
      body: <><strong>{v.orderNumber}</strong> - {v.customerName}: {v.reason}.</>,
      action: 'مراجعة أمر التغيير',
      onClick: () => setActiveModule('sales_change_orders')
    }));

  projectHandovers
    .filter(h => h.status === 'submitted')
    .forEach(h => radarAlerts.push({
      key: `hnd-${h.id}`,
      tone: 'blue',
      title: 'محضر تسليم بانتظار المكتب الفني',
      meta: h.projectNumber,
      body: <>مشروع <strong>{h.customerName}</strong> وصل للمكتب الفني ولم يتم قبوله بعد.</>,
      action: 'فتح المكتب الفني',
      onClick: () => setActiveModule('tech_projects')
    }));

  const radarToneClasses: Record<RadarAlert['tone'], { border: string; title: string; dot: string; action: string }> = {
    red: { border: 'border-red-200', title: 'text-red-900', dot: 'bg-red-500', action: 'text-red-700' },
    amber: { border: 'border-amber-200', title: 'text-amber-900', dot: 'bg-amber-500', action: 'text-[#C87A38]' },
    blue: { border: 'border-blue-200', title: 'text-blue-900', dot: 'bg-blue-500', action: 'text-blue-700' },
    purple: { border: 'border-purple-200', title: 'text-purple-900', dot: 'bg-purple-500', action: 'text-purple-700' }
  };

  // 7. Collection health per contract milestone (40 / 40 / 20)
  const milestoneHealth = [1, 2, 3].map(index => {
    const rows = customContracts.flatMap(c => c.milestones.filter(m => m.milestoneIndex === index));
    const due = rows.reduce((sum, m) => sum + m.amount, 0);
    const paid = rows.reduce((sum, m) => sum + (m.paidAmount || 0), 0);
    return { index, title: rows[0]?.title || '', percentage: rows[0]?.percentage || 0, due, paid, rate: due > 0 ? Math.round((paid / due) * 100) : 0 };
  });
  const milestoneBarClasses = ['bg-emerald-500', 'bg-[#C87A38]', 'bg-blue-600'];

  const navigateToProduction = (id?: string) => {
    if (id) setSelectedProductionOrderId(id);
    setActiveModule('production');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. EXECUTIVE HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2A170E] via-[#1E110A] to-[#132A20] text-white p-6 md:p-8 shadow-2xl border border-emerald-900/40">
        <div className="absolute top-0 left-0 translate-x-[-20%] translate-y-[-20%] w-96 h-96 bg-[#C87A38]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-black">
              <Sparkles className="w-4 h-4 text-[#C87A38]" />
              <span>لوحة القيادة التنفيذية لمشاريع الأثاث والمطابخ والعمولة</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              أهلاً بك، {currentUser.fullName}
            </h1>

            <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed font-medium">
              متابعة حية وشاملة لمشاريع العمولة، دورة حياة المطابخ والتفصيل من المقايسة حتى تسليم الموقع، وحالة خطوط إنتاج الورش والمصنع.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold">
              <span className="bg-white/10 backdrop-blur-md text-emerald-200 px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C87A38]" />
                <span>الفرع النشط: {currentBranch.name}</span>
              </span>

              <span className="bg-white/10 backdrop-blur-md text-amber-200 px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>الدور: {currentRole.name}</span>
              </span>

              <span className="bg-white/10 backdrop-blur-md text-slate-300 px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>اليوم: {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </span>
            </div>
          </div>

          {/* Quick Operational Launchers */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => setActiveModule('custom_projects')}
              className="px-5 py-3 bg-gradient-to-r from-[#C87A38] to-[#df8e4d] hover:brightness-110 text-white font-black text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>مشروع تفصيل وعقد جديد</span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveModule('tech_office')}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/15 transition-all flex items-center justify-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-amber-300" />
                <span>المكتب الفني</span>
              </button>
              <button
                onClick={() => setActiveModule('production')}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/15 transition-all flex items-center justify-center gap-1.5"
              >
                <Factory className="w-3.5 h-3.5 text-emerald-300" />
                <span>ورش التصنيع</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TOP EXECUTIVE METRIC CARDS (5 Core Custom KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Active Custom Contracts Value */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي قيمة العقود النشطة</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#C87A38] flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5 text-[#C87A38]" />
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 tracking-tight">
              {totalContractsValue.toLocaleString()} <span className="text-xs font-medium text-slate-500">ج.م</span>
            </p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{customContracts.length} عقود معتمدة ومسجلة</span>
            </div>
          </div>
          <button
            onClick={() => setActiveModule('custom_projects')}
            className="text-[11px] font-bold text-[#361D13] hover:underline flex items-center gap-1 pt-1"
          >
            <span>سجل العقود والمشاريع</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* KPI 2: Active Projects in Pipeline */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">مشاريع تفصيل جارية</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1E3A2F] flex items-center justify-center font-bold">
              <FolderKanban className="w-5 h-5 text-[#1E3A2F]" />
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 tracking-tight">
              {activeProjects.length} <span className="text-xs font-medium text-slate-500">مشروع نشط</span>
            </p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 mt-1">
              <Activity className="w-3.5 h-3.5" />
              <span>{completedStageCount} مشروع مكتمل ومسلم</span>
            </div>
          </div>
          <button
            onClick={() => setActiveModule('custom_projects')}
            className="text-[11px] font-bold text-[#361D13] hover:underline flex items-center gap-1 pt-1"
          >
            <span>متابعة خط السير</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* KPI 3: Workshop Production Load */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">أوامر التشغيل بالمصنع</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Factory className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 tracking-tight">
              {activeProductionOrders.length} <span className="text-xs font-medium text-slate-500">أمر تشغيل</span>
            </p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 mt-1">
              <Hammer className="w-3.5 h-3.5" />
              <span>نجارة، تقطيع، ودهانات</span>
            </div>
          </div>
          <button
            onClick={() => setActiveModule('production')}
            className="text-[11px] font-bold text-[#361D13] hover:underline flex items-center gap-1 pt-1"
          >
            <span>إدارة خطوط الإنتاج</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* KPI 4: Field Visits & Installations */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">التركيبات والمعاينات</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 tracking-tight">
              {activeInstallations.length + scheduledVisits.length} <span className="text-xs font-medium text-slate-500">مهمة ميدانية</span>
            </p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700 mt-1">
              <Ruler className="w-3.5 h-3.5" />
              <span>{scheduledVisits.length} مقايسة + {activeInstallations.length} تركيب موقع</span>
            </div>
          </div>
          <button
            onClick={() => setActiveModule('installation')}
            className="text-[11px] font-bold text-[#361D13] hover:underline flex items-center gap-1 pt-1"
          >
            <span>جدول الفنيين الميداني</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* KPI 5: Milestone Collections */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">التحصيل ونسبة الدفعات</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5 text-teal-700" />
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 tracking-tight">
              {collectionRate}% <span className="text-xs font-medium text-slate-500">تم تحصيله</span>
            </p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>متبقي: {pendingCollection.toLocaleString()} ج.م</span>
            </div>
          </div>
          <button
            onClick={() => setActiveModule('finance')}
            className="text-[11px] font-bold text-[#361D13] hover:underline flex items-center gap-1 pt-1"
          >
            <span>دفعات ومستحقات العقود</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. END-TO-END PIPELINE STEPPER / STAGE FLOW */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#C87A38]" />
              <span>خريطة التدفق الحي لمشاريع العمولة والمطابخ (End-to-End Lifecycle)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              توزيع وتتبع كل مشروع عبر محطات العمل: من المعاينة والمكتب الفني إلى ورش التصنيع والتسليم النهائي
            </p>
          </div>
          <button
            onClick={() => setActiveModule('custom_projects')}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors shrink-0"
          >
            عرض المشاريع بالكامل
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {/* Stage 1: Measurements & Survey */}
          <div 
            onClick={() => setActiveModule('custom_projects')}
            className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 hover:border-amber-400 cursor-pointer transition-all hover:shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">1</span>
              <Ruler className="w-4 h-4 text-amber-700 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-xs font-black text-slate-900">المعاينة والمقاسات</p>
            <p className="text-[11px] text-slate-500 mt-0.5">مواعيد المعاينة بالموقع</p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-lg font-black text-amber-900">{surveyStageCount}</span>
              <span className="text-[10px] font-bold text-amber-700">مشاريع</span>
            </div>
          </div>

          {/* Stage 2: Tech Office & 3D */}
          <div 
            onClick={() => setActiveModule('tech_office')}
            className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 hover:border-purple-400 cursor-pointer transition-all hover:shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-900 font-black text-xs flex items-center justify-center">2</span>
              <Compass className="w-4 h-4 text-purple-700 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-xs font-black text-slate-900">المكتب الفني و3D</p>
            <p className="text-[11px] text-slate-500 mt-0.5">تصميم وتفجير الـ BOM</p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-lg font-black text-purple-900">{techOfficeStageCount}</span>
              <span className="text-[10px] font-bold text-purple-700">مشاريع</span>
            </div>
          </div>

          {/* Stage 3: Contracts & Deposits */}
          <div 
            onClick={() => setActiveModule('custom_projects')}
            className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 hover:border-teal-400 cursor-pointer transition-all hover:shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-xl bg-teal-100 text-teal-900 font-black text-xs flex items-center justify-center">3</span>
              <FileCheck className="w-4 h-4 text-teal-700 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-xs font-black text-slate-900">التعاقد والمقدمات</p>
            <p className="text-[11px] text-slate-500 mt-0.5">توقيع العقود والدفعات</p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-lg font-black text-teal-900">{contractStageCount}</span>
              <span className="text-[10px] font-bold text-teal-700">مشاريع</span>
            </div>
          </div>

          {/* Stage 4: Factory & Workshops */}
          <div 
            onClick={() => setActiveModule('production')}
            className="p-4 rounded-2xl bg-amber-50/80 border border-[#C87A38]/30 hover:border-[#C87A38] cursor-pointer transition-all hover:shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-xl bg-[#C87A38]/20 text-[#361D13] font-black text-xs flex items-center justify-center">4</span>
              <Factory className="w-4 h-4 text-[#C87A38] group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-xs font-black text-slate-900">تشغيل الورش والمصنع</p>
            <p className="text-[11px] text-slate-500 mt-0.5">تقطيع، تجميع، ودهان</p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-lg font-black text-[#361D13]">{productionStageCount}</span>
              <span className="text-[10px] font-bold text-[#C87A38]">مشاريع</span>
            </div>
          </div>

          {/* Stage 5: Field Installation */}
          <div 
            onClick={() => setActiveModule('installation')}
            className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 hover:border-indigo-400 cursor-pointer transition-all hover:shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-900 font-black text-xs flex items-center justify-center">5</span>
              <Truck className="w-4 h-4 text-indigo-700 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-xs font-black text-slate-900">التوريد والتركيبات</p>
            <p className="text-[11px] text-slate-500 mt-0.5">التركيب بموقع العميل</p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-lg font-black text-indigo-900">{installationStageCount}</span>
              <span className="text-[10px] font-bold text-indigo-700">مشاريع</span>
            </div>
          </div>

          {/* Stage 6: Final Handover */}
          <div 
            onClick={() => setActiveModule('custom_projects')}
            className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 hover:border-emerald-400 cursor-pointer transition-all hover:shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center">6</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-xs font-black text-slate-900">التسليم والضمان</p>
            <p className="text-[11px] text-slate-500 mt-0.5">محاضر الاستلام المعتمدة</p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-lg font-black text-emerald-900">{completedStageCount}</span>
              <span className="text-[10px] font-bold text-emerald-700">مكتمل</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN WORKSPACE GRID: 2 COLS LEFT + 1 COL RIGHT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT SECTION (Col Span 2) */}
        <div className="xl:col-span-2 space-y-6">

          {/* Block A: Live Custom Projects Monitor */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-[#361D13]" />
                  <span>رادار مشاريع العمولة والتفصيل النشطة</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">متابعة دقيقة لحالة تقدم كل مشروع والمهندس المسؤول</p>
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setProjectTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    projectTypeFilter === 'all'
                      ? 'bg-[#361D13] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  الكل ({customProjects.length})
                </button>
                <button
                  onClick={() => setProjectTypeFilter('kitchen')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    projectTypeFilter === 'kitchen'
                      ? 'bg-[#C87A38] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  مطابخ
                </button>
                <button
                  onClick={() => setProjectTypeFilter('bedroom')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    projectTypeFilter === 'bedroom'
                      ? 'bg-[#1E3A2F] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  غرف نوم
                </button>
                <button
                  onClick={() => setProjectTypeFilter('wardrobe')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    projectTypeFilter === 'wardrobe'
                      ? 'bg-blue-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  دريسنج
                </button>
              </div>
            </div>

            {/* Project List Cards */}
            <div className="space-y-3">
              {filteredProjects.slice(0, 5).map((project) => {
                const typeInfo = getProjectTypeLabel(project.projectType);
                const statusInfo = getStatusBadge(project.status);
                const progress = getProjectProgress(project.status);
                const contract = customContracts.find(c => c.projectId === project.id || c.projectNumber === project.projectNumber);

                return (
                  <div
                    key={project.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/40 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800">
                          {project.projectNumber}
                        </span>
                        <h4 className="font-black text-sm text-slate-900">{project.projectName}</h4>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${typeInfo.bg}`}>
                          {typeInfo.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                        <button
                          onClick={() => navigateToProject(project.id)}
                          className="p-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
                          title="فتح تفاصيل المشروع"
                        >
                          <Eye className="w-4 h-4 text-[#361D13]" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Meta */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>العميل: <strong className="text-slate-800 font-bold">{project.customerName}</strong> ({project.customerPhone})</span>
                        </span>
                        <span>
                          نسبة الإنجاز: <strong className="text-slate-900 font-bold">{progress}%</strong>
                        </span>
                      </div>

                      {/* Progress Track */}
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            progress === 100 ? 'bg-emerald-500' :
                            progress >= 70 ? 'bg-[#C87A38]' :
                            progress >= 40 ? 'bg-purple-600' : 'bg-amber-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <div className="flex items-center gap-3">
                        <span>المهندس المسؤول: <strong className="text-slate-700">{project.assignedUserName}</strong></span>
                        <span>•</span>
                        <span>الفرع: <strong className="text-slate-700">{project.branchName}</strong></span>
                      </div>
                      {contract && (
                        <span className="font-black text-slate-900">
                          قيمة العقد: <strong className="text-[#361D13] font-black">{contract.totalValue?.toLocaleString()} ج.م</strong>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setActiveModule('custom_projects')}
                className="inline-flex items-center gap-2 text-xs font-black text-[#361D13] hover:text-[#C87A38] transition-colors"
              >
                <span>الانتقال إلى جدول المشاريع الكامل وسجلات التعاقد</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Block B: Live Workshop & Production Queue */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Factory className="w-5 h-5 text-blue-600" />
                  <span>طابور تشغيل أوامر المصنع والورش</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">متابعة مراحل تصنيع الأخشاب، القص والكبس، والتجميع والدهانات</p>
              </div>
              <button
                onClick={() => setActiveModule('production')}
                className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors"
              >
                فتح صالة المصنع
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productionOrders.slice(0, 4).map((po) => (
                <div
                  key={po.id}
                  onClick={() => navigateToProduction(po.id)}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md cursor-pointer transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                          {po.productionNumber}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">{po.workshopLocation}</span>
                      </div>
                      <h5 className="font-black text-sm text-slate-900 mt-1">{po.customerName} - {po.projectNumber}</h5>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl shrink-0 ${
                      po.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      po.status === 'in_production' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {po.status === 'completed' ? 'جاهز للتسليم' : po.status === 'in_production' ? 'قيد التشغيل' : 'مجدول'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">تاريخ البدء:</span>
                      <strong className="text-slate-800 font-bold">{po.startDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">التسليم المتوقع:</span>
                      <strong className="text-slate-800 font-bold">{po.expectedCompletionDate}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-slate-400" />
                      <span>الفريق: {po.assignedTeam?.slice(0, 2).join('، ') || 'ورشة النجارة'}</span>
                    </span>
                    <span className="text-[#361D13] font-bold text-[11px] flex items-center gap-0.5">
                      <span>عرض تفاصيل الأمر</span>
                      <ChevronLeft className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Block C: Field Installation Schedule & Handover */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-600" />
                  <span>جدول التركيبات والتسليمات الميدانية بمواقع العملاء</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">حركة سيارات التوريد وفرق الفنيين الميدانية ومحاضر الاستلام</p>
              </div>
              <button
                onClick={() => setActiveModule('installation')}
                className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl transition-colors"
              >
                جدول التركيبات
              </button>
            </div>

            <div className="space-y-3">
              {installationRecords.slice(0, 3).map((inst) => (
                <div
                  key={inst.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                        {inst.installationNumber}
                      </span>
                      <span className="font-black text-sm text-slate-900">{inst.customerName}</span>
                      <span className="text-xs text-slate-400">({inst.projectNumber})</span>
                    </div>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{inst.address}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] font-bold text-slate-900 block flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{inst.scheduledDate} ({inst.scheduledTime})</span>
                      </span>
                      <span className="text-[10px] text-slate-500">
                        الفني: {inst.assignedTeamNames?.[0] || 'فريق التركيبات 1'}
                      </span>
                    </div>

                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl shrink-0 ${
                      inst.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      inst.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {inst.status === 'completed' ? 'تم التسليم' : inst.status === 'in_progress' ? 'جاري التركيب' : 'مجدول'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT SECTION (Col Span 1): Action Center, Bottlenecks & Material Health */}
        <div className="space-y-6">
          
          {/* Widget 1: Critical Bottlenecks & Action Radar */}
          <div className="bg-gradient-to-br from-amber-500/10 via-white to-red-500/5 rounded-3xl p-6 border-2 border-amber-300/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black animate-pulse">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">رادار التنبيهات والاختناقات</h3>
                  <p className="text-[11px] text-slate-500">مهام تتطلب تدخلاً عاجلاً</p>
                </div>
              </div>
              <span className="bg-red-100 text-red-700 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                {radarAlerts.length} إجراءات
              </span>
            </div>

            <div className="space-y-2.5">
              {radarAlerts.map(alert => {
                const tone = radarToneClasses[alert.tone];
                return (
                  <div key={alert.key} className={`p-3 rounded-2xl bg-white border ${tone.border} shadow-2xs space-y-1`}>
                    <div className={`flex items-center justify-between text-xs font-bold ${tone.title}`}>
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${tone.dot}`}></span>
                        <span>{alert.title}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-black">{alert.meta}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{alert.body}</p>
                    <button
                      onClick={alert.onClick}
                      className={`text-[10px] font-black ${tone.action} hover:underline flex items-center gap-1 pt-1`}
                    >
                      <span>{alert.action}</span>
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
              {radarAlerts.length === 0 && (
                <p className="text-[11px] text-slate-500 text-center py-4">لا توجد اختناقات تتطلب تدخلاً الآن.</p>
              )}
            </div>
          </div>

          {/* Widget 2: Milestone Payment Health */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>دورة تحصيل دفعات عقود التفصيل</span>
                </h3>
                <p className="text-[11px] text-slate-500">توزيع المستحقات حسب مراحل العقد</p>
              </div>
            </div>

            <div className="space-y-3">
              {milestoneHealth.map((m, i) => (
                <div key={m.index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{m.index}. {m.title} ({m.percentage}%)</span>
                    <span className="text-slate-600">{m.rate}% محصلة</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${milestoneBarClasses[i]}`} style={{ width: `${m.rate}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400">{m.paid.toLocaleString()} من {m.due.toLocaleString()} ج.م</p>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 font-medium space-y-1">
              <div className="flex items-center justify-between">
                <span>إجمالي التحصيلات الفعلية:</span>
                <strong className="font-black text-emerald-800">{totalCollectedReceipts.toLocaleString()} ج.م</strong>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>المتبقي قيد المراحل:</span>
                <strong className="font-bold text-slate-900">{pendingCollection.toLocaleString()} ج.م</strong>
              </div>
            </div>
          </div>

          {/* Widget 3: Critical Raw Materials & Hardware Stock */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-[#361D13]" />
                  <span>مخزون خامات التصنيع والإكسسوارات</span>
                </h3>
                <p className="text-[11px] text-slate-500">مستويات الألواح والمفصلات الحرجة</p>
              </div>
              <button
                onClick={() => setActiveModule('materials')}
                className="text-[11px] font-black text-[#C87A38] hover:underline"
              >
                المخازن
              </button>
            </div>

            <div className="space-y-3">
              {materials.slice(0, 4).map((mat) => {
                const isLow = (mat.currentStock || 0) <= (mat.minStockLevel || 0);

                return (
                  <div
                    key={mat.id}
                    className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-xs text-slate-900">{mat.name}</h5>
                      <span className="text-[10px] text-slate-500 font-mono">{mat.code}</span>
                    </div>

                    <div className="text-left shrink-0">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                        isLow ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {mat.currentStock} {mat.unit}
                      </span>
                      {isLow && (
                        <span className="block text-[9px] font-bold text-red-600 mt-0.5">
                          وصل لحد الطلب!
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setActiveModule('procurement')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <PackageCheck className="w-3.5 h-3.5 text-[#C87A38]" />
              <span>إصدار أمر شراء خامات للموردين</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
