import { WorkCenter, WorkOrder, ScrapClaimRecord, OffCutReturnRecord, ManufacturingPackageItem, QualityGateInspection, JobCostingBreakdown } from '../types/production';
import { ProductionOrder, Material } from '../types/erp';

export class ProductionService {
  /**
   * Calculate Job Costing summary for a production order
   */
  static calculateJobCosting(
    order: ProductionOrder,
    workOrders: WorkOrder[],
    scrapClaims: ScrapClaimRecord[],
    workCenters: WorkCenter[]
  ): JobCostingBreakdown {
    // 1. Raw Materials
    const rawMaterialsEstimated = order.totalEstimatedMaterialCost || 0;
    const rawMaterialsActual = order.materials.reduce((acc, m) => acc + (m.consumedQuantity * (m.actualUnitCost || m.estimatedUnitCost)), 0);

    // 2. Direct Labor & Machine Overhead from Work Orders
    const relatedWOs = workOrders.filter(wo => wo.manufacturingOrderId === order.id);
    
    let directLaborEstimated = 0;
    let directLaborActual = 0;
    let machineOverheadEstimated = 0;
    let machineOverheadActual = 0;

    relatedWOs.forEach(wo => {
      const wc = workCenters.find(c => c.id === wo.workCenterId);
      const laborRate = wc ? wc.hourlyLaborCost : 100;
      const machineRate = wc ? wc.hourlyMachineCost : 150;

      const plannedHours = (wo.plannedDurationMinutes || 60) / 60;
      const actualHours = (wo.actualDurationMinutes || wo.plannedDurationMinutes || 60) / 60;

      directLaborEstimated += plannedHours * laborRate;
      directLaborActual += actualHours * laborRate;

      machineOverheadEstimated += plannedHours * machineRate;
      machineOverheadActual += actualHours * machineRate;
    });

    // If no WOs yet, estimate from order totals
    if (relatedWOs.length === 0) {
      directLaborEstimated = rawMaterialsEstimated * 0.15;
      directLaborActual = order.status === 'completed' ? directLaborEstimated * 1.05 : 0;
      machineOverheadEstimated = rawMaterialsEstimated * 0.10;
      machineOverheadActual = order.status === 'completed' ? machineOverheadEstimated : 0;
    }

    // 3. Scrap Costs
    const relatedScrap = scrapClaims.filter(s => s.manufacturingOrderId === order.id);
    const scrapCostActual = relatedScrap.reduce((acc, s) => acc + (s.estimatedCost || 0), 0);

    const totalEstimatedCost = Math.round(rawMaterialsEstimated + directLaborEstimated + machineOverheadEstimated);
    const totalActualCost = Math.round(rawMaterialsActual + directLaborActual + machineOverheadActual + scrapCostActual);
    const varianceAmount = totalActualCost - totalEstimatedCost;
    const variancePercentage = totalEstimatedCost > 0 ? (varianceAmount / totalEstimatedCost) * 100 : 0;

    return {
      rawMaterialsEstimated,
      rawMaterialsActual,
      directLaborEstimated,
      directLaborActual,
      machineOverheadEstimated,
      machineOverheadActual,
      scrapCostActual,
      totalEstimatedCost,
      totalActualCost,
      varianceAmount,
      variancePercentage
    };
  }

  /**
   * Helper to format duration in hours and minutes (e.g., "2 ساعة و 15 دقيقة")
   */
  static formatDurationArabic(minutes: number): string {
    if (!minutes || minutes <= 0) return '0 دقيقة';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins} دقيقة`;
    if (mins === 0) return `${hrs} س`;
    return `${hrs} س و ${mins} د`;
  }

  /**
   * Get Arabic badge color and label for Work Order status
   */
  static getWorkOrderStatusInfo(status: WorkOrder['status']) {
    switch (status) {
      case 'ready':
        return { label: 'جاهز للتشغيل', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
      case 'in_progress':
        return { label: 'قيد التشغيل الآن', bg: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse', dot: 'bg-blue-600' };
      case 'paused':
        return { label: 'متوقف مؤقتاً', bg: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-500' };
      case 'completed':
        return { label: 'مكتمل ومسلّم', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-600' };
      case 'blocked':
        return { label: 'معطل (يوجد عائق)', bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-600' };
      case 'pending':
      default:
        return { label: 'بانتظار المرحلة السابقة', bg: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' };
    }
  }

  /**
   * Category icon helper and color
   */
  static getCategoryInfo(category: WorkCenter['category']) {
    switch (category) {
      case 'cutting_cnc':
        return { title: 'عنبر التقطيع والـ CNC', short: 'التقطيع', color: 'text-sky-600 bg-sky-50 border-sky-200' };
      case 'edge_banding':
        return { title: 'عنبر شريط الحرف (القشاط)', short: 'الشريط', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
      case 'drilling_routing':
        return { title: 'عنبر التخريم والفرز', short: 'التخريم', color: 'text-violet-600 bg-violet-50 border-violet-200' };
      case 'paint_finishing':
        return { title: 'كابينة الدهانات والدوكو', short: 'الدهانات', color: 'text-amber-600 bg-amber-50 border-amber-200' };
      case 'assembly':
        return { title: 'صالة التجميع والنجارة', short: 'التجميع', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      case 'packaging_qc':
        return { title: 'محطة الفحص والتغليف', short: 'التغليف', color: 'text-teal-600 bg-teal-50 border-teal-200' };
      default:
        return { title: 'عنبر التشغيل', short: 'عام', color: 'text-slate-600 bg-slate-50 border-slate-200' };
    }
  }
}
