import {
  PlanningDemand,
  MRPNetRequirement,
  SupplyProposal,
  WorkCenterCapacity,
  ProjectPlanningReadiness,
  PlanningPriority,
  RequirementCoverageStatus,
  SupplyProposalStatus,
  SupplyProposalType,
  DemandSourceType,
  PlanningDemandStatus
} from '../types/planning';
import { ItemMasterCard } from '../types/erp';

// Helper Badge Functions
export const getPriorityBadge = (priority: PlanningPriority) => {
  switch (priority) {
    case 'urgent':
      return { label: 'طوارئ / عاجل', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    case 'high':
      return { label: 'أولوية مرتفعة', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'normal':
    default:
      return { label: 'عادية', color: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
};

export const getDemandSourceBadge = (sourceType: DemandSourceType) => {
  switch (sourceType) {
    case 'custom_project':
      return { label: 'مشروع تفصيل معتمد', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'production_order':
      return { label: 'طلب إنتاج داخلي', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'safety_stock_replenishment':
      return { label: 'تعويض حد الأمان', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'forecast_mps':
      return { label: 'خطة MPS', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    default:
      return { label: 'يدوي مباشر', color: 'bg-slate-50 text-slate-700 border-slate-200' };
  }
};

export const getDemandStatusBadge = (status: PlanningDemandStatus) => {
  switch (status) {
    case 'open':
      return { label: 'مفتوح للـ MRP', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'planned':
      return { label: 'تم التخطيط', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'partially_supplied':
      return { label: 'مغطى جزئياً', color: 'bg-orange-50 text-orange-700 border-orange-200' };
    case 'fully_supplied':
      return { label: 'مكتمل ومحجوز', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'in_production':
      return { label: 'قيد التصنيع', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'closed':
      return { label: 'منفذ ومغلق', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    case 'cancelled':
      return { label: 'ملغي', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    default:
      return { label: status, color: 'bg-slate-50 text-slate-700 border-slate-200' };
  }
};

export const getProposalTypeBadge = (type: SupplyProposalType) => {
  switch (type) {
    case 'purchase_requisition':
      return { label: 'طلب شراء خارجي (PR)', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    case 'planned_production':
      return { label: 'أمر تصنيع داخلي (MO)', color: 'bg-blue-50 text-blue-800 border-blue-200' };
    case 'inter_warehouse_transfer':
      return { label: 'تحويل بين المستودعات', color: 'bg-purple-50 text-purple-800 border-purple-200' };
    default:
      return { label: type, color: 'bg-slate-50 text-slate-700 border-slate-200' };
  }
};

export const getProposalStatusBadge = (status: SupplyProposalStatus) => {
  switch (status) {
    case 'draft':
      return { label: 'مسودة مقترح', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    case 'under_review':
      return { label: 'قيد مراجعة التخطيط', color: 'bg-amber-100 text-amber-900 border-amber-300' };
    case 'approved':
      return { label: 'معتمد للتنفيذ', color: 'bg-blue-50 text-blue-800 border-blue-200' };
    case 'converted_to_po':
      return { label: 'أمر شراء صادر', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    case 'converted_to_mo':
      return { label: 'أمر تصنيع صادر', color: 'bg-purple-100 text-purple-900 border-purple-300' };
    case 'rejected':
      return { label: 'مرفوض', color: 'bg-rose-50 text-rose-800 border-rose-200' };
    case 'cancelled':
      return { label: 'ملغي', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    default:
      return { label: status, color: 'bg-slate-50 text-slate-700 border-slate-200' };
  }
};

export const getShortageLevelBadge = (level: string) => {
  switch (level) {
    case 'critical':
    case 'shortage':
      return { label: 'عجز حرج (Critical)', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    case 'date_risk':
      return { label: 'خطر تأخر المورد', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'safety_breach':
      return { label: 'كسر حد الأمان', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    case 'covered':
    default:
      return { label: 'متوفر ومغطى', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  }
};

export const getReadinessBadge = (status: ProjectPlanningReadiness['overallReadiness']) => {
  switch (status) {
    case 'ready':
      return { label: 'جاهز للتصنيع 100%', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    case 'partially_ready':
      return { label: 'جاهز جزئياً (> 50%)', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'blocked_materials':
      return { label: 'متوقف على عجز خامات', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    case 'blocked_capacity':
      return { label: 'اختناق في خطوط القص/CNC', color: 'bg-purple-100 text-purple-800 border-purple-300' };
    case 'pending_planning':
    default:
      return { label: 'قيد فحص التخطيط', color: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
};

export const getWorkCenterLoadBadge = (utilizationRate: number) => {
  if (utilizationRate >= 90) {
    return { label: 'عنق زجاجة حرج', color: 'bg-rose-100 text-rose-800 border-rose-300' };
  }
  if (utilizationRate >= 75) {
    return { label: 'إشغال مرتفع', color: 'bg-amber-100 text-amber-800 border-amber-300' };
  }
  return { label: 'طاقة استيعابية آمنة', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
};

export const calculateBackwardDate = (deliveryDateStr: string, daysBefore: number): string => {
  const d = new Date(deliveryDateStr);
  d.setDate(d.getDate() - daysBefore);
  return d.toISOString().substring(0, 10);
};

/**
 * Net Requirements Calculation Engine
 */
export const calculateNetRequirements = (
  demands: PlanningDemand[],
  itemMasterCards: ItemMasterCard[] = [],
  openIncomingPOs: { itemCode: string; quantity: number; expectedDeliveryDate: string }[] = []
): MRPNetRequirement[] => {
  const itemMap = new Map<string, {
    demands: PlanningDemand[];
    grossQty: number;
  }>();

  demands.filter(d => d.status !== 'closed' && d.status !== 'cancelled').forEach(d => {
    const existing = itemMap.get(d.itemCode) || { demands: [], grossQty: 0 };
    existing.demands.push(d);
    existing.grossQty += d.quantityRequired;
    itemMap.set(d.itemCode, existing);
  });

  const netRequirements: MRPNetRequirement[] = [];

  itemMap.forEach((entry, itemCode) => {
    const firstDemand = entry.demands[0];
    const itemCard = itemMasterCards.find(c => c.code === itemCode || c.id === firstDemand.itemId);

    const currentStockOnHand = itemCard?.currentStock || (itemCode.includes('MDF') ? 14 : itemCode.includes('BLUM') ? 40 : itemCode.includes('HPL') ? 8 : 20);
    const reservedStockQty = itemCard?.reservedStock || (itemCode.includes('MDF') ? 10 : itemCode.includes('BLUM') ? 32 : itemCode.includes('HPL') ? 6 : 8);
    const availableFreeStock = Math.max(0, currentStockOnHand - reservedStockQty);
    
    const poEntries = openIncomingPOs.filter(po => po.itemCode === itemCode);
    const incomingPOQty = poEntries.reduce((acc, po) => acc + po.quantity, 0);
    const earliestPODate = poEntries[0]?.expectedDeliveryDate;

    const totalEffectiveSupply = availableFreeStock + incomingPOQty;
    const netShortageQty = Math.max(0, entry.grossQty - totalEffectiveSupply);
    const safetyStockLevel = itemCard?.minStockLevel || 10;
    const leadTimeDays = firstDemand.leadTimeDays || 7;

    let coverageStatus: RequirementCoverageStatus = 'covered';
    if (netShortageQty > 0) {
      coverageStatus = 'shortage';
    } else if (incomingPOQty > 0 && earliestPODate) {
      const earliestDemandDate = entry.demands.reduce((min, d) => d.requiredDate < min ? d.requiredDate : min, entry.demands[0].requiredDate);
      if (earliestPODate > earliestDemandDate) {
        coverageStatus = 'date_risk';
      } else if (availableFreeStock + incomingPOQty - entry.grossQty < safetyStockLevel) {
        coverageStatus = 'safety_breach';
      }
    } else if (availableFreeStock - entry.grossQty < safetyStockLevel && availableFreeStock >= entry.grossQty) {
      coverageStatus = 'safety_breach';
    }

    const isManufactured = firstDemand.itemCategory === 'unit_subassembly';
    const suggestedSupplyType: SupplyProposalType = isManufactured ? 'planned_production' : 'purchase_requisition';

    netRequirements.push({
      itemId: itemCard?.id || firstDemand.itemId,
      itemCode,
      itemName: itemCard?.nameAr || firstDemand.itemName,
      itemCategory: itemCard?.categoryNameAr || firstDemand.itemCategory,
      uom: firstDemand.uom,
      grossDemandQty: entry.grossQty,
      currentStockOnHand,
      reservedStockQty,
      availableFreeStock,
      incomingPOQty,
      incomingPOExpectedDate: earliestPODate,
      netShortageQty,
      safetyStockLevel,
      leadTimeDays,
      suggestedSupplyType,
      coverageStatus,
      demandSources: entry.demands.map(d => ({
        demandId: d.id,
        projectNumber: d.projectNumber,
        customerName: d.customerName,
        qty: d.quantityRequired,
        requiredDate: d.requiredDate,
        priority: d.priority
      }))
    });
  });

  return netRequirements.sort((a, b) => b.netShortageQty - a.netShortageQty);
};

export const generateSupplyProposalsFromShortages = (
  netRequirements: MRPNetRequirement[],
  createdByName: string,
  createdByUserId: string
): SupplyProposal[] => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const shortages = netRequirements.filter(r => r.netShortageQty > 0);

  return shortages.map((req, idx) => {
    const prefix = req.suggestedSupplyType === 'purchase_requisition' ? 'PROP-PR' : 'PROP-MO';
    const proposalNumber = `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const earliestNeedDate = req.demandSources.reduce((min, d) => d.requiredDate < min ? d.requiredDate : min, req.demandSources[0]?.requiredDate || new Date().toISOString().substring(0, 10));
    const suggestedOrderDate = calculateBackwardDate(earliestNeedDate, req.leadTimeDays);

    const highestPriority = req.demandSources.some(d => d.priority === 'urgent') ? 'urgent' : req.demandSources.some(d => d.priority === 'high') ? 'high' : 'normal';

    const unitCost = req.itemCode.includes('MDF') ? 1450 : req.itemCode.includes('BLUM') ? 180 : req.itemCode.includes('HPL') ? 2200 : 350;

    return {
      id: `prop-${Date.now()}-${idx}`,
      proposalNumber,
      proposalType: req.suggestedSupplyType,
      itemId: req.itemId,
      itemCode: req.itemCode,
      itemName: req.itemName,
      quantity: req.netShortageQty,
      uom: req.uom,
      targetWarehouseId: 'wh-main',
      targetWarehouseName: 'المستودع الرئيسي لخامات الأخشاب والمسطحات - A1',
      requiredDate: earliestNeedDate,
      suggestedOrderDate,
      leadTimeDays: req.leadTimeDays,
      priority: highestPriority,
      status: 'draft',
      demandIds: req.demandSources.map(d => d.demandId),
      projectIds: [],
      projectNumbers: Array.from(new Set(req.demandSources.map(d => d.projectNumber).filter(Boolean))) as string[],
      customerNames: Array.from(new Set(req.demandSources.map(d => d.customerName).filter(Boolean))) as string[],
      estimatedUnitCostEGP: unitCost,
      estimatedTotalCostEGP: req.netShortageQty * unitCost,
      suggestedSupplierName: req.suggestedSupplyType === 'purchase_requisition' ? 'الشركة الهندسية للتجارة والتوريدات' : undefined,
      targetWorkCenterName: req.suggestedSupplyType === 'planned_production' ? 'ماكينة التقطيع الرئيسية (SCM Beam Saw)' : undefined,
      notes: `توليد تلقائي من محرك الـ MRP لتغطية عجز قدره ${req.netShortageQty} ${req.uom}`,
      createdDate: timestamp,
      createdByUserName: createdByName
    };
  });
};

export const evaluateProjectReadiness = (
  projectId: string,
  projectNumber: string,
  customerName: string,
  projectName: string,
  targetDeliveryDate: string,
  projectDemands: PlanningDemand[],
  netRequirements: MRPNetRequirement[],
  workCenters: WorkCenterCapacity[],
  techReleaseNumber?: string
): ProjectPlanningReadiness => {
  const totalDemands = projectDemands.length;
  if (totalDemands === 0) {
    return {
      projectId,
      projectNumber,
      customerName,
      projectName,
      projectType: 'kitchen',
      techReleaseNumber,
      targetDeliveryDate,
      plannedManufacturingStartDate: calculateBackwardDate(targetDeliveryDate, 14),
      plannedManufacturingEndDate: calculateBackwardDate(targetDeliveryDate, 3),
      plannedSiteInstallationDate: calculateBackwardDate(targetDeliveryDate, 1),
      overallReadiness: 'pending_planning',
      readinessPercentage: 0,
      totalMaterialDemandsCount: 0,
      coveredMaterialsCount: 0,
      shortageMaterialsCount: 0,
      criticalShortages: [],
      estimatedTotalWorkCenterHours: 0,
      isCapacityFeasible: true,
      activeProposalsCount: 0,
      priority: 'normal'
    };
  }

  let coveredCount = 0;
  const criticalShortages: {
    itemCode: string;
    itemName: string;
    shortageQty: number;
    uom: string;
    status: RequirementCoverageStatus;
  }[] = [];

  projectDemands.forEach(d => {
    const netReq = netRequirements.find(nr => nr.itemCode === d.itemCode);
    if (netReq) {
      if (netReq.netShortageQty === 0 && netReq.coverageStatus === 'covered') {
        coveredCount++;
      } else {
        criticalShortages.push({
          itemCode: d.itemCode,
          itemName: d.itemName,
          shortageQty: netReq.netShortageQty > 0 ? Math.min(d.quantityRequired, netReq.netShortageQty) : 0,
          uom: d.uom,
          status: netReq.coverageStatus
        });
      }
    } else {
      coveredCount++;
    }
  });

  const readinessPercentage = Math.round((coveredCount / totalDemands) * 100);
  const shortageCount = totalDemands - coveredCount;

  const estimatedTotalWorkCenterHours = Math.round(totalDemands * 1.8);
  const cncCenter = workCenters.find(w => w.centerCode.includes('CNC'));
  const isCncOverloaded = cncCenter ? cncCenter.loadStatus === 'overloaded' : false;

  let overallReadiness: ProjectPlanningReadiness['overallReadiness'] = 'ready';
  if (readinessPercentage === 100 && !isCncOverloaded) {
    overallReadiness = 'ready';
  } else if (shortageCount > 0 && readinessPercentage > 50) {
    overallReadiness = 'partially_ready';
  } else if (shortageCount > 0) {
    overallReadiness = 'blocked_materials';
  } else if (isCncOverloaded) {
    overallReadiness = 'blocked_capacity';
  }

  const priority = projectDemands.some(d => d.priority === 'urgent') ? 'urgent' : projectDemands.some(d => d.priority === 'high') ? 'high' : 'normal';

  return {
    projectId,
    projectNumber,
    customerName,
    projectName,
    projectType: 'kitchen',
    techReleaseNumber,
    targetDeliveryDate,
    plannedManufacturingStartDate: calculateBackwardDate(targetDeliveryDate, 14),
    plannedManufacturingEndDate: calculateBackwardDate(targetDeliveryDate, 3),
    plannedSiteInstallationDate: calculateBackwardDate(targetDeliveryDate, 1),
    overallReadiness,
    readinessPercentage,
    totalMaterialDemandsCount: totalDemands,
    coveredMaterialsCount: coveredCount,
    shortageMaterialsCount: shortageCount,
    criticalShortages,
    estimatedTotalWorkCenterHours,
    isCapacityFeasible: !isCncOverloaded,
    capacityBottlenecks: isCncOverloaded ? ['Holz-Her 5-Axis CNC'] : [],
    activeProposalsCount: shortageCount > 0 ? 1 : 0,
    priority
  };
};

export class PlanningService {
  static getPriorityBadge = getPriorityBadge;
  static getDemandSourceBadge = getDemandSourceBadge;
  static getDemandStatusBadge = getDemandStatusBadge;
  static getProposalTypeBadge = getProposalTypeBadge;
  static getProposalStatusBadge = getProposalStatusBadge;
  static getShortageLevelBadge = getShortageLevelBadge;
  static getReadinessBadge = getReadinessBadge;
  static getWorkCenterLoadBadge = getWorkCenterLoadBadge;
  static calculateBackwardDate = calculateBackwardDate;
  static calculateNetRequirements = calculateNetRequirements;
  static generateSupplyProposalsFromShortages = generateSupplyProposalsFromShortages;
  static evaluateProjectReadiness = evaluateProjectReadiness;
}
