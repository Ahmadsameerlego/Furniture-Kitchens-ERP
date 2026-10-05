import {
  ProjectStatus,
  ProjectType,
  DesignStatus,
  QuotationStatus,
  QuotationLineItem,
  CustomProject,
  SiteVisit,
  ProjectMeasurement,
  ProjectDesign,
  ProjectQuotation,
  CustomContract,
  ProjectHandoverProtocol
} from '../types/erp';

export class CustomProjectService {

  static getProjectStatusMeta(status: ProjectStatus) {
    switch (status) {
      case 'new':
      case 'opportunity':
        return { label: 'فرصة بيعية جديدة (Opportunity)', bgClass: 'bg-blue-100 text-blue-900 border-blue-200', step: 1 };
      case 'visit_scheduled':
        return { label: 'موعد معاينة مجدول بالموقع', bgClass: 'bg-amber-100 text-amber-900 border-amber-200', step: 2 };
      case 'measured':
        return { label: 'تمت المعاينة والرفع الميداني', bgClass: 'bg-indigo-100 text-indigo-900 border-indigo-200', step: 3 };
      case 'designing':
        return { label: 'قيد إعداد التصميم 3D', bgClass: 'bg-purple-100 text-purple-900 border-purple-200', step: 4 };
      case 'design_review':
        return { label: 'مراجعة التصميم 3D مع العميل', bgClass: 'bg-orange-100 text-orange-900 border-orange-200', step: 5 };
      case 'design_approved':
        return { label: '✓ تم اعتماد التصميم 3D', bgClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold', step: 6 };
      case 'quotation':
      case 'quotation_sent':
      case 'customer_approval':
        return { label: 'دراسة ومفاوضة عرض السعر', bgClass: 'bg-yellow-100 text-yellow-900 border-yellow-200', step: 7 };
      case 'approved':
        return { label: '✓ قبول عرض السعر (Quote Approved)', bgClass: 'bg-teal-100 text-teal-900 border-teal-300 font-bold', step: 8 };
      case 'contract_draft':
        return { label: 'مسودة العقد وجدول الدفعات', bgClass: 'bg-cyan-100 text-cyan-900 border-cyan-200', step: 9 };
      case 'contract_signed':
        return { label: '✓ العقد موقع رسمياً (Contract Signed)', bgClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold', step: 10 };
      case 'deposit_verified':
        return { label: '✓ تم تأكيد سداد العربون مالياً', bgClass: 'bg-green-100 text-green-900 border-green-300 font-bold', step: 11 };
      case 'ready_for_handover':
        return { label: 'جاهز لمحضر التسليم للمكتب الفني', bgClass: 'bg-indigo-100 text-indigo-900 border-indigo-300 font-black', step: 12 };
      case 'handed_over_to_tech_office':
        return { label: '✓ تم التسليم للمكتب الفني (Tech Office)', bgClass: 'bg-[#361D13] text-white border-amber-500 font-black shadow-sm', step: 13 };
      case 'ready_for_production':
        return { label: 'جاهز لأمر الإنتاج بالمصنع', bgClass: 'bg-teal-100 text-teal-900 border-teal-300 font-black', step: 14 };
      case 'in_production':
        return { label: 'قيد التصنيع بالورش والمصنع', bgClass: 'bg-blue-100 text-blue-900 border-blue-300 font-black', step: 15 };
      case 'production_completed':
        return { label: 'تم انتهاء التصنيع والتغليف', bgClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black', step: 16 };
      case 'installation_scheduled':
        return { label: 'مجدول للتركيب بالموقع', bgClass: 'bg-purple-100 text-purple-900 border-purple-300 font-black', step: 17 };
      case 'installed':
      case 'completed':
        return { label: '✓ تم التركيب والتسليم النهائي', bgClass: 'bg-emerald-100 text-emerald-900 border-emerald-400 font-black', step: 18 };
      case 'rejected':
        return { label: 'مرفوض من العميل', bgClass: 'bg-rose-100 text-rose-900 border-rose-300', step: 0 };
      case 'cancelled':
        return { label: 'ملغي', bgClass: 'bg-slate-100 text-slate-700 border-slate-300', step: 0 };
      default:
        return { label: status, bgClass: 'bg-slate-100 text-slate-800 border-slate-200', step: 1 };
    }
  }

  static getProjectTypeLabel(type: ProjectType): string {
    switch (type) {
      case 'kitchen':
        return 'مطبخ تفصيل (Custom Kitchen)';
      case 'bedroom':
        return 'غرفة نوم تفصيل (Custom Bedroom)';
      case 'wardrobe':
        return 'دريسنج ودولاب تفصيل (Custom Wardrobe)';
      case 'tv_unit':
        return 'وحدة تلفزيون مودرن (TV Unit)';
      case 'living':
        return 'أنتريه / ركنة تفصيل (Custom Living)';
      case 'furniture':
        return 'قطع أثاث مخصصة';
      default:
        return 'مشروع تفصيل مخصص';
    }
  }

  static getDesignStatusMeta(status: DesignStatus) {
    switch (status) {
      case 'draft':
        return { label: 'مسودة تصميم مبدئية', bgClass: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'sent_to_customer':
        return { label: 'مرسل للعميل للمراجعة', bgClass: 'bg-blue-100 text-blue-900 border-blue-200' };
      case 'under_review':
        return { label: 'قيد الدراسة والمراجعة', bgClass: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'approved':
        return { label: '✓ معتمد وموافق عليه من العميل', bgClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black' };
      case 'rejected':
        return { label: '✕ مرفوض من العميل (يتطلب تعديل)', bgClass: 'bg-rose-100 text-rose-900 border-rose-300 font-bold' };
      default:
        return { label: status, bgClass: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  }

  static getQuotationStatusMeta(status: QuotationStatus) {
    switch (status) {
      case 'draft':
        return { label: 'مسودة عرض سعر', bgClass: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'sent':
        return { label: 'مرسل للعميل', bgClass: 'bg-blue-100 text-blue-900 border-blue-200' };
      case 'under_review':
        return { label: 'قيد المفاوضة والمراجعة', bgClass: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'accepted':
        return { label: '✓ مقبول وموافق عليه من العميل (Accepted)', bgClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black' };
      case 'rejected':
        return { label: '✕ مرفوض من العميل', bgClass: 'bg-rose-100 text-rose-900 border-rose-300' };
      case 'expired':
        return { label: 'منتهي الصلاحية', bgClass: 'bg-gray-100 text-gray-700 border-gray-300' };
      default:
        return { label: status, bgClass: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  }

  static calculateQuotationTotals(items: QuotationLineItem[]) {
    let subtotalSelling = 0;
    let subtotalCost = 0;

    items.forEach(item => {
      subtotalSelling += item.quantity * item.unitSellingPrice;
      subtotalCost += item.quantity * item.unitCost;
    });

    const totalSelling = subtotalSelling;
    const totalCost = subtotalCost;
    const estimatedProfit = totalSelling - totalCost;

    return {
      subtotalSelling,
      subtotalCost,
      totalSelling,
      totalCost,
      estimatedProfit
    };
  }

  // ==========================================
  // BUSINESS STAGE GATES & EXIT CONDITIONS
  // ==========================================

  static canSubmitDesign(project: CustomProject, siteVisits: SiteVisit[], measurements: ProjectMeasurement[]) {
    const hasCompletedVisit = siteVisits.some(v => v.projectId === project.id && v.status === 'completed');
    const hasMeasurements = measurements.some(m => m.projectId === project.id && m.items.length > 0);
    return {
      allowed: hasCompletedVisit || hasMeasurements,
      reason: hasCompletedVisit || hasMeasurements ? '' : 'يتطلب إتمام المعاينة الميدانية أو تسجيل أبعاد المقاسات الأولية أولاً'
    };
  }

  static canCreateQuotation(project: CustomProject, designs: ProjectDesign[], measurements: ProjectMeasurement[]) {
    const hasApprovedDesign = designs.some(d => d.projectId === project.id && d.status === 'approved');
    const hasMeasurements = measurements.some(m => m.projectId === project.id && m.items.length > 0);
    return {
      allowed: hasApprovedDesign || hasMeasurements,
      reason: hasApprovedDesign || hasMeasurements ? '' : 'يتطلب رفع مقاسات أو اعتماد تصميم 3D أولي لحساب بنود المقايسة'
    };
  }

  static canGenerateContract(project: CustomProject, quotations: ProjectQuotation[]) {
    const approvedQuote = quotations.find(q => q.projectId === project.id && q.status === 'accepted');
    return {
      allowed: !!approvedQuote,
      approvedQuote,
      reason: approvedQuote ? '' : 'يتطلب موافقة واعتماد العميل على نسخة من عرض السعر أولاً'
    };
  }

  static canInitiateHandover(
    project: CustomProject,
    contract?: CustomContract,
    approvedQuote?: ProjectQuotation,
    approvedDesign?: ProjectDesign,
    latestVisit?: SiteVisit,
    measurements?: ProjectMeasurement[]
  ) {
    const hasValidMeasurements = (latestVisit?.status === 'completed') || (measurements && measurements.length > 0 && measurements.some(m => m.items && m.items.length > 0));

    const checks = {
      contractSigned: contract?.status === 'signed',
      depositVerified: !!(contract?.isDepositVerified || contract?.milestones.some(m => m.milestoneIndex === 1 && (m.status === 'paid' || m.status === 'verified_in_finance'))),
      quoteApproved: !!approvedQuote,
      designApproved: !!approvedDesign,
      surveyCompleted: !!hasValidMeasurements
    };

    const isReady = checks.contractSigned && checks.depositVerified && checks.quoteApproved && checks.designApproved && checks.surveyCompleted;

    return {
      isReady,
      checks,
      reasons: [
        !checks.contractSigned && 'العقد غير موقع رسمياً',
        !checks.depositVerified && 'لم يتم التحقق من سداد عربون التعاقد في الحسابات',
        !checks.quoteApproved && 'لا يوجد عرض سعر معتمد ومغلق المواصفات',
        !checks.designApproved && 'لا يوجد تصميم 3D معتمد من العميل',
        !checks.surveyCompleted && 'المعاينة الميدانية أو أبعاد الليزر غير موثقة'
      ].filter(Boolean) as string[]
    };
  }
}

