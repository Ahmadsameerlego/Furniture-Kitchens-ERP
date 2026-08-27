import {
  ProjectStatus,
  ProjectType,
  DesignStatus,
  QuotationStatus,
  QuotationLineItem
} from '../types/erp';

export class CustomProjectService {

  static getProjectStatusMeta(status: ProjectStatus) {
    switch (status) {
      case 'new':
        return { label: 'مشروع جديد', bgClass: 'bg-blue-100 text-blue-900 border-blue-200', step: 1 };
      case 'visit_scheduled':
        return { label: 'موعد معاينة مجدول', bgClass: 'bg-amber-100 text-amber-900 border-amber-200', step: 2 };
      case 'measured':
        return { label: 'تمت المعاينة والمقاسات', bgClass: 'bg-indigo-100 text-indigo-900 border-indigo-200', step: 3 };
      case 'designing':
        return { label: 'قيد التصميم 3D', bgClass: 'bg-purple-100 text-purple-900 border-purple-200', step: 4 };
      case 'design_review':
        return { label: 'مراجعة التصميم مع العميل', bgClass: 'bg-orange-100 text-orange-900 border-orange-200', step: 5 };
      case 'quotation':
        return { label: 'عرض السعر قيد الدراسة', bgClass: 'bg-yellow-100 text-yellow-900 border-yellow-200', step: 6 };
      case 'customer_approval':
        return { label: 'في انتظار موافقة العميل', bgClass: 'bg-[#E06F28]/20 text-[#E06F28] border-[#E06F28]/40', step: 7 };
      case 'approved':
        return { label: 'موافق عليه ومفعل (Approved)', bgClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black', step: 8 };
      case 'ready_for_production':
        return { label: 'جاهز لأمر التصنيع والإنتاج', bgClass: 'bg-teal-100 text-teal-900 border-teal-300 font-black', step: 9 };
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
}
