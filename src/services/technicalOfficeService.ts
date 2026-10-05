import {
  TechnicalProjectStatus,
  TechnicalPriority,
  TechnicalBOM,
  TechnicalBOMUnit,
  TechnicalSiteSurvey,
  TechnicalProject,
  TechnicalReleasePackage,
  EngineeringChangeRequest,
  MaterialYieldSummary,
  HardwareSummary
} from '../types/technicalOffice';

export class TechnicalOfficeService {
  /**
   * Get metadata and styling for Technical Project Status
   */
  static getStatusMeta(status: TechnicalProjectStatus | string): {
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    bgColor: string;
    color: string;
    borderColor: string;
    stepIndex: number;
  } {
    switch (status) {
      case 'pending_handover':
        return {
          label: 'في انتظار قبول الاستلام',
          bgClass: 'bg-amber-50',
          textClass: 'text-amber-800',
          borderClass: 'border-amber-300',
          bgColor: 'bg-amber-50',
          color: 'text-amber-800',
          borderColor: 'border-amber-300',
          stepIndex: 1
        };
      case 'handover_accepted':
        return {
          label: 'تم قبول الاستلام - بدء العمل',
          bgClass: 'bg-blue-50',
          textClass: 'text-blue-800',
          borderClass: 'border-blue-300',
          bgColor: 'bg-blue-50',
          color: 'text-blue-800',
          borderColor: 'border-blue-300',
          stepIndex: 2
        };
      case 'site_survey_in_progress':
        return {
          label: 'جاري المعاينة والرفع المساحي',
          bgClass: 'bg-indigo-50',
          textClass: 'text-indigo-800',
          borderClass: 'border-indigo-300',
          bgColor: 'bg-indigo-50',
          color: 'text-indigo-800',
          borderColor: 'border-indigo-300',
          stepIndex: 3
        };
      case 'site_survey_completed':
        return {
          label: 'اكتملت المعاينة بالموقع',
          bgClass: 'bg-cyan-50',
          textClass: 'text-cyan-800',
          borderClass: 'border-cyan-300',
          bgColor: 'bg-cyan-50',
          color: 'text-cyan-800',
          borderColor: 'border-cyan-300',
          stepIndex: 4
        };
      case 'cad_design_in_progress':
      case 'designing':
        return {
          label: 'المخططات التنفيذية CAD',
          bgClass: 'bg-purple-50',
          textClass: 'text-purple-800',
          borderClass: 'border-purple-300',
          bgColor: 'bg-purple-50',
          color: 'text-purple-800',
          borderColor: 'border-purple-300',
          stepIndex: 5
        };
      case 'design_approved':
        return {
          label: 'تم اعتماد المخطط التنفيذي',
          bgClass: 'bg-teal-50',
          textClass: 'text-teal-800',
          borderClass: 'border-teal-300',
          bgColor: 'bg-teal-50',
          color: 'text-teal-800',
          borderColor: 'border-teal-300',
          stepIndex: 6
        };
      case 'bom_explosion_in_progress':
      case 'bom_drafting':
        return {
          label: 'تفجير الـ BOM وقوائم التقطيع',
          bgClass: 'bg-orange-50',
          textClass: 'text-orange-900',
          borderClass: 'border-orange-300',
          bgColor: 'bg-orange-50',
          color: 'text-orange-900',
          borderColor: 'border-orange-300',
          stepIndex: 7
        };
      case 'bom_under_review':
        return {
          label: 'الـ BOM قيد المراجعة الفنية',
          bgClass: 'bg-orange-50',
          textClass: 'text-orange-800',
          borderClass: 'border-orange-300',
          bgColor: 'bg-orange-50',
          color: 'text-orange-800',
          borderColor: 'border-orange-300',
          stepIndex: 8
        };
      case 'technically_approved':
        return {
          label: 'معتمد فنياً بالكامل',
          bgClass: 'bg-emerald-100',
          textClass: 'text-emerald-950',
          borderClass: 'border-emerald-400',
          bgColor: 'bg-emerald-100',
          color: 'text-emerald-950',
          borderColor: 'border-emerald-400',
          stepIndex: 9
        };
      case 'released_to_planning':
        return {
          label: 'أفرج عنه للتخطيط والإنتاج',
          bgClass: 'bg-emerald-600',
          textClass: 'text-white',
          borderClass: 'border-emerald-700',
          bgColor: 'bg-emerald-600',
          color: 'text-white',
          borderColor: 'border-emerald-700',
          stepIndex: 10
        };
      case 'in_production':
        return {
          label: 'قيد التصنيع بالورش',
          bgClass: 'bg-emerald-950',
          textClass: 'text-emerald-200',
          borderClass: 'border-emerald-800',
          bgColor: 'bg-emerald-950',
          color: 'text-emerald-200',
          borderColor: 'border-emerald-800',
          stepIndex: 11
        };
      case 'ecr_in_progress':
      case 'revision_required':
        return {
          label: 'أمر تعديل نشط (ECR)',
          bgClass: 'bg-rose-50',
          textClass: 'text-rose-800',
          borderClass: 'border-rose-300',
          bgColor: 'bg-rose-50',
          color: 'text-rose-800',
          borderColor: 'border-rose-300',
          stepIndex: 0
        };
      case 'on_hold':
        return {
          label: 'معلق مؤقتاً',
          bgClass: 'bg-slate-100',
          textClass: 'text-slate-800',
          borderClass: 'border-slate-300',
          bgColor: 'bg-slate-100',
          color: 'text-slate-800',
          borderColor: 'border-slate-300',
          stepIndex: 0
        };
      case 'cancelled':
      default:
        return {
          label: 'ملغي / غير محدد',
          bgClass: 'bg-slate-100',
          textClass: 'text-slate-700',
          borderClass: 'border-slate-300',
          bgColor: 'bg-slate-100',
          color: 'text-slate-700',
          borderColor: 'border-slate-300',
          stepIndex: 0
        };
    }
  }

  static getProjectStatusMeta(status: TechnicalProjectStatus | string) {
    return this.getStatusMeta(status);
  }

  /**
   * Priority metadata
   */
  static getPriorityMeta(priority: TechnicalPriority): { label: string; badgeClass: string } {
    switch (priority) {
      case 'urgent':
        return { label: 'عاجل جداً 🔥', badgeClass: 'bg-rose-500 text-white' };
      case 'high':
        return { label: 'أولوية عالية', badgeClass: 'bg-amber-500 text-white' };
      case 'normal':
      default:
        return { label: 'عادي', badgeClass: 'bg-slate-100 text-slate-700' };
    }
  }

  /**
   * Compute aggregate Technical Office Stats
   */
  static getTechnicalOfficeStats(
    projects: TechnicalProject[],
    surveys: TechnicalSiteSurvey[],
    boms: TechnicalBOM[],
    releases: TechnicalReleasePackage[],
    ecrs: EngineeringChangeRequest[]
  ) {
    return {
      activeProjects: projects.length,
      pendingHandovers: projects.filter(p => p.status === 'pending_handover').length,
      surveysPendingVerification: surveys.filter(s => s.status !== 'verified').length,
      bomsPendingApproval: boms.filter(b => b.status !== 'approved').length,
      releasedToPlanning: releases.length,
      openChangeRequests: ecrs.filter(e => e.status === 'submitted' || e.status === 'under_review').length,
      urgentProjects: projects.filter(p => p.priority === 'urgent' || p.priority === 'high').length
    };
  }

  /**
   * Calculate material sheet yield from unit cutting parts
   */
  static calculateMaterialYield(units: TechnicalBOMUnit[]): MaterialYieldSummary[] {
    const sheetArea = 2.9768; // 1.22m × 2.44m
    const map: Record<string, { name: string; code: string; area: number }> = {};

    units.forEach(unit => {
      unit.cuttingParts?.forEach(part => {
        const area = (part.lengthMm / 1000) * (part.widthMm / 1000) * (part.quantity || 1) * (unit.quantity || 1);
        const key = part.materialId || part.materialCode || part.materialName;
        if (!map[key]) {
          map[key] = {
            name: part.materialName,
            code: part.materialCode,
            area: 0
          };
        }
        map[key].area += area;
      });
    });

    return Object.entries(map).map(([matId, data]) => {
      const totalArea = Number(data.area.toFixed(1));
      const estimatedSheets = Math.ceil((totalArea * 1.1) / sheetArea);
      return {
        materialId: matId,
        materialName: data.name,
        materialCode: data.code,
        totalAreaSqMeters: totalArea,
        estimatedSheetsCount: Math.max(1, estimatedSheets),
        scrapPercentage: 10
      };
    });
  }

  /**
   * Calculate hardware summary from units
   */
  static calculateHardwareSummary(units: TechnicalBOMUnit[]): HardwareSummary[] {
    const map: Record<string, { name: string; code: string; qty: number; unit: string }> = {};

    units.forEach(unit => {
      unit.hardwareParts?.forEach(hw => {
        const key = hw.itemId || hw.itemCode || hw.itemName;
        const count = (hw.quantity || 1) * (unit.quantity || 1);
        if (!map[key]) {
          map[key] = {
            name: hw.itemName,
            code: hw.itemCode,
            qty: 0,
            unit: hw.unit || 'حبة'
          };
        }
        map[key].qty += count;
      });
    });

    return Object.entries(map).map(([itemId, data]) => ({
      itemId,
      itemName: data.name,
      itemCode: data.code,
      totalQuantity: data.qty,
      unit: data.unit
    }));
  }

  /**
   * Generate CSV format for OptiCut / CutList Plus CNC cutting
   */
  static generateCuttingListCSV(bom: TechnicalBOM, projectNumber: string): string {
    const headers = [
      'Unit Code',
      'Unit Name',
      'Part Name',
      'Material Name',
      'Material Code',
      'Length (mm)',
      'Width (mm)',
      'Thickness (mm)',
      'Quantity',
      'Grain Direction',
      'Edge Top',
      'Edge Bottom',
      'Edge Left',
      'Edge Right',
      'CNC Code'
    ];

    const rows: string[] = [];
    rows.push(`Project: ${projectNumber} - BOM Revision: ${bom.revisionCode}`);
    rows.push(headers.join(','));

    bom.units.forEach(unit => {
      unit.cuttingParts?.forEach(part => {
        const totalQty = (part.quantity || 1) * (unit.quantity || 1);
        const row = [
          `"${unit.unitCode}"`,
          `"${unit.unitName}"`,
          `"${part.partName}"`,
          `"${part.materialName}"`,
          `"${part.materialCode}"`,
          part.lengthMm,
          part.widthMm,
          part.thicknessMm,
          totalQty,
          `"${part.grainDirection}"`,
          `"${part.edgeBanding?.top || 'none'}"`,
          `"${part.edgeBanding?.bottom || 'none'}"`,
          `"${part.edgeBanding?.left || 'none'}"`,
          `"${part.edgeBanding?.right || 'none'}"`,
          `"${part.drillingCncCode || ''}"`
        ];
        rows.push(row.join(','));
      });
    });

    return rows.join('\n');
  }

  static exportCuttingListCsv(bom: TechnicalBOM, projectNumber: string): string {
    return this.generateCuttingListCSV(bom, projectNumber);
  }
}
