import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ProductionOrder } from '../../types/erp';
import {
  WorkCenter,
  WorkOrder,
  ScrapClaimRecord,
  OffCutReturnRecord,
  ManufacturingPackageItem,
  QualityGateInspection
} from '../../types/production';

// Modals
import { ProductionOrderDetailsModal } from '../../components/production/ProductionOrderDetailsModal';
import { JobCardPrintModal } from '../../components/production/JobCardPrintModal';
import { PackageLabelPrintModal } from '../../components/production/PackageLabelPrintModal';
import { CreateScrapClaimModal } from '../../components/production/CreateScrapClaimModal';
import { OffCutReturnModal } from '../../components/production/OffCutReturnModal';
import { QualityInspectionModal } from '../../components/production/QualityInspectionModal';

// Sub Views
import { ManufacturingDashboardView } from './ManufacturingDashboardView';
import { ManufacturingOrdersView } from './ManufacturingOrdersView';
import { WorkCentersAndOrdersView } from './WorkCentersAndOrdersView';
import { ShopfloorKioskView } from './ShopfloorKioskView';
import { JobCardsAndPackagesView } from './JobCardsAndPackagesView';
import { ScrapAndRequisitionsView } from './ScrapAndRequisitionsView';
import { QualityGatesView } from './QualityGatesView';

// Icons
import {
  Factory,
  LayoutDashboard,
  Boxes,
  Cpu,
  Zap,
  Printer,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles
} from 'lucide-react';

interface ManufacturingWorkspaceProps {
  initialTab?: string;
}

export const ManufacturingWorkspace: React.FC<ManufacturingWorkspaceProps> = ({
  initialTab = 'mfg_dashboard'
}) => {
  const {
    productionOrders,
    materials,
    availableBranches,
    completeProductionOrder,
    recordInventoryWipMovement,
    recordProductionCompletionToFinishedGoods,
    showToast,
    startProductionOrder,
    workCenters,
    setWorkCenters,
    workOrders,
    setWorkOrders,
    scrapClaims,
    setScrapClaims,
    offCutReturns,
    setOffCutReturns,
    manufacturingPackages: packages,
    setManufacturingPackages: setPackages,
    qualityInspections,
    setQualityInspections
  } = useERP();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Modals state
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<ProductionOrder | null>(null);
  const [selectedOrderForJobCard, setSelectedOrderForJobCard] = useState<ProductionOrder | null>(null);
  const [selectedOrderForLabels, setSelectedOrderForLabels] = useState<ProductionOrder | null>(null);
  const [selectedOrderForScrap, setSelectedOrderForScrap] = useState<ProductionOrder | null>(null);
  const [selectedOrderForOffCut, setSelectedOrderForOffCut] = useState<ProductionOrder | null>(null);
  const [selectedOrderForQuality, setSelectedOrderForQuality] = useState<ProductionOrder | null>(null);

  // Filter authorized orders
  const authorizedOrders = productionOrders.filter(p => availableBranches.some(b => b.id === p.branchId));

  // Handler: Update Work Order status (Start / Pause / Complete)
  const handleUpdateWOStatus = (woId: string, newStatus: WorkOrder['status']) => {
    const target = workOrders.find(wo => wo.id === woId);
    if (!target) return;

    // The first station to start issues the order's materials (blocked while any are short)
    if (newStatus === 'in_progress') {
      const mo = productionOrders.find(o => o.id === target.manufacturingOrderId);
      if (mo && mo.status === 'pending' && !startProductionOrder(mo.id)) return;
    }

    const nowStr = new Date().toISOString().substring(0, 16).replace('T', ' ');
    const isDone = newStatus === 'completed';
    const siblings = workOrders
      .filter(wo => wo.manufacturingOrderId === target.manufacturingOrderId)
      .sort((x, y) => x.sequenceOrder - y.sequenceOrder);
    const next = siblings.find(wo => wo.sequenceOrder > target.sequenceOrder);

    setWorkOrders(prev =>
      prev.map(wo => {
        if (wo.id === woId) {
          const startedAt = newStatus === 'in_progress' && !wo.startedAt ? nowStr : wo.startedAt;
          const elapsed = isDone && startedAt ? Math.round((Date.now() - new Date(startedAt.replace(' ', 'T')).getTime()) / 60000) : 0;
          return {
            ...wo,
            status: newStatus,
            progressPercentage: isDone ? 100 : newStatus === 'in_progress' ? Math.max(wo.progressPercentage, 10) : wo.progressPercentage,
            partsCompletedCount: isDone ? wo.partsToProcessCount : wo.partsCompletedCount,
            // Demo runs finish in seconds, so fall back to the planned time for costing
            actualDurationMinutes: isDone ? (elapsed > 5 ? elapsed : wo.plannedDurationMinutes) : wo.actualDurationMinutes,
            completedAt: isDone ? nowStr : wo.completedAt,
            startedAt
          };
        }
        // Completing a station releases the next one in the routing
        if (isDone && next && wo.id === next.id && wo.status === 'pending') {
          return { ...wo, status: 'ready' };
        }
        return wo;
      })
    );

    if (isDone) {
      const remaining = siblings.filter(wo => wo.id !== woId && wo.status !== 'completed').length;
      const nextLabel = next ? ' (' + next.workCenterName + ')' : '';
      showToast(remaining === 0
        ? '✅ اكتملت كل محطات ' + target.manufacturingOrderNumber + ' - يمكن إنهاء أمر التصنيع وتحويله للتركيبات'
        : '✅ تم إنجاز "' + target.operationName + '" وتحويل الشغل للمحطة التالية' + nextLabel, 'success');
    } else if (newStatus === 'in_progress') {
      showToast('⚡ بدأ التشغيل على ' + target.workCenterName, 'info');
    }
  };

  // Handler: Add Scrap Claim
  const handleAddScrapClaim = (claimData: Partial<ScrapClaimRecord>) => {
    const newClaim: ScrapClaimRecord = {
      id: `scr-${Date.now()}`,
      claimNumber: `SCR-2026-00${scrapClaims.length + 1}`,
      manufacturingOrderId: claimData.manufacturingOrderId || 'prod-101',
      manufacturingOrderNumber: claimData.manufacturingOrderNumber || 'PROD-2026-0012',
      workCenterName: claimData.workCenterName || 'ماكينة CNC',
      materialId: claimData.materialId || 'mat-1',
      materialCode: claimData.materialCode || 'MAT-MDF-001',
      materialName: claimData.materialName || 'MDF أبيض',
      unit: claimData.unit || 'Sheet',
      scrapQuantity: claimData.scrapQuantity || 1,
      reason: claimData.reason || 'machine_defect',
      reasonDescription: claimData.reasonDescription || 'تلف أثناء التشغيل',
      estimatedCost: claimData.estimatedCost || 1250,
      reportedBy: claimData.reportedBy || 'مشرف الورشة',
      reportedAt: claimData.reportedAt || new Date().toISOString().substring(0, 16).replace('T', ' '),
      status: 'replacement_issued',
      replacementGINNumber: claimData.replacementGINNumber || 'GIN-2026-0050'
    };

    setScrapClaims(prev => [newClaim, ...prev]);
    showToast(`تم تسجيل التلف وصرف إذن بديل فوري (${newClaim.replacementGINNumber}) من المخزن ✅`, 'success');
  };

  // Handler: Add Off-cut return
  const handleAddOffCutReturn = (offcutData: Partial<OffCutReturnRecord>) => {
    const newReturn: OffCutReturnRecord = {
      id: `off-${Date.now()}`,
      returnNumber: `OFF-2026-00${offCutReturns.length + 1}`,
      manufacturingOrderId: offcutData.manufacturingOrderId || 'prod-101',
      manufacturingOrderNumber: offcutData.manufacturingOrderNumber || 'PROD-2026-0012',
      materialId: offcutData.materialId || 'mat-1',
      materialName: offcutData.materialName || 'MDF 18مم',
      dimensions: offcutData.dimensions || '120x80 سم',
      quantity: offcutData.quantity || 1,
      unit: offcutData.unit || 'لوح فضلات',
      condition: offcutData.condition || 'excellent',
      targetWarehouseName: offcutData.targetWarehouseName || 'مستودع فضلات وخامات الورشة',
      returnedBy: offcutData.returnedBy || 'فني الورشة',
      date: offcutData.date || new Date().toISOString().substring(0, 10),
      status: 'returned_to_stock'
    };

    setOffCutReturns(prev => [newReturn, ...prev]);
    showToast('تم تسجيل إرجاع فضلات الخشب وإضافتها لرصيد مخزن الورشة ✅', 'success');
  };

  // Handler: Add QC inspection
  const handleAddQualityInspection = (inspData: Partial<QualityGateInspection>) => {
    const newInsp: QualityGateInspection = {
      id: `qg-${Date.now()}`,
      gateNumber: `QG-2026-0${qualityInspections.length + 10}`,
      manufacturingOrderId: inspData.manufacturingOrderId || 'prod-101',
      manufacturingOrderNumber: inspData.manufacturingOrderNumber || 'PROD-2026-0012',
      stage: inspData.stage || 'carpentry_assembly',
      stageTitle: inspData.stageTitle || 'فحص الجودة الشامل',
      inspectorName: inspData.inspectorName || 'م. وليد عبد الحميد (مدير الجودة)',
      inspectionDate: inspData.inspectionDate || new Date().toISOString().substring(0, 16).replace('T', ' '),
      passed: inspData.passed ?? true,
      scorePercentage: inspData.scorePercentage || 95,
      checklistResults: inspData.checklistResults || [],
      photos: inspData.photos || [],
      correctiveAction: inspData.correctiveAction
    };

    setQualityInspections(prev => [newInsp, ...prev]);
    showToast('تم اعتماد تقرير فحص الجودة وتسجيل النتيجة بالنظام ✅', 'success');
  };

  // Navigation tabs configuration
  const tabs = [
    { id: 'mfg_dashboard', label: 'لوحة التحكم والـ KPIs', icon: LayoutDashboard },
    { id: 'mfg_orders', label: 'أوامر التصنيع (MOs)', icon: Boxes, badge: authorizedOrders.length },
    { id: 'mfg_work_orders', label: 'مراكز العمل والماكينات', icon: Cpu, badge: workCenters.length },
    { id: 'mfg_shopfloor', label: 'كشك الورشة (Kiosk)', icon: Zap },
    { id: 'mfg_job_cards', label: 'كروت التشغيل والطرود', icon: Printer },
    { id: 'mfg_scrap', label: 'الهدر والفضلات (Scrap)', icon: AlertTriangle, badge: scrapClaims.length },
    { id: 'mfg_qc', label: 'بوابات الجودة (QC)', icon: ShieldCheck }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Navigation Tabs Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#361D13] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C87A38]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-[#C87A38] text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Render Area */}
      <div>
        {activeTab === 'mfg_dashboard' && (
          <ManufacturingDashboardView
            orders={authorizedOrders}
            workCenters={workCenters}
            workOrders={workOrders}
            scrapClaims={scrapClaims}
            onSelectOrder={setSelectedOrderForDetails}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'mfg_orders' && (
          <ManufacturingOrdersView
            orders={authorizedOrders}
            workCenters={workCenters}
            workOrders={workOrders}
            scrapClaims={scrapClaims}
            onSelectOrder={setSelectedOrderForDetails}
            onOpenJobCard={setSelectedOrderForJobCard}
            onOpenPackageLabels={setSelectedOrderForLabels}
            onOpenScrapModal={setSelectedOrderForScrap}
            onOpenQualityModal={setSelectedOrderForQuality}
            onCompleteOrder={order => {
              completeProductionOrder(order.id, ['https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=600']);
            }}
          />
        )}

        {activeTab === 'mfg_work_orders' && (
          <WorkCentersAndOrdersView
            workCenters={workCenters}
            workOrders={workOrders}
            orders={authorizedOrders}
            onUpdateWOStatus={handleUpdateWOStatus}
            onSelectOrder={setSelectedOrderForDetails}
          />
        )}

        {activeTab === 'mfg_shopfloor' && (
          <ShopfloorKioskView
            workCenters={workCenters}
            workOrders={workOrders}
            orders={authorizedOrders}
            onUpdateWOStatus={handleUpdateWOStatus}
            onOpenScrapModal={setSelectedOrderForScrap}
            onOpenQualityModal={setSelectedOrderForQuality}
          />
        )}

        {activeTab === 'mfg_job_cards' && (
          <JobCardsAndPackagesView
            orders={authorizedOrders}
            packages={packages}
            onOpenJobCard={setSelectedOrderForJobCard}
            onOpenPackageLabels={setSelectedOrderForLabels}
            onSelectOrder={setSelectedOrderForDetails}
          />
        )}

        {activeTab === 'mfg_scrap' && (
          <ScrapAndRequisitionsView
            scrapClaims={scrapClaims}
            offCutReturns={offCutReturns}
            orders={authorizedOrders}
            onOpenScrapModal={setSelectedOrderForScrap}
            onOpenOffCutModal={setSelectedOrderForOffCut}
          />
        )}

        {activeTab === 'mfg_qc' && (
          <QualityGatesView
            inspections={qualityInspections}
            orders={authorizedOrders}
            onOpenQualityModal={setSelectedOrderForQuality}
          />
        )}
      </div>

      {/* Modals & Drawers */}
      {selectedOrderForDetails && (
        <ProductionOrderDetailsModal
          isOpen={!!selectedOrderForDetails}
          onClose={() => setSelectedOrderForDetails(null)}
          order={selectedOrderForDetails}
          workCenters={workCenters}
          workOrders={workOrders}
          scrapClaims={scrapClaims}
          onOpenJobCardPrint={setSelectedOrderForJobCard}
          onOpenPackageLabelsPrint={setSelectedOrderForLabels}
          onOpenScrapModal={setSelectedOrderForScrap}
          onOpenQualityModal={setSelectedOrderForQuality}
          onCompleteOrder={order => {
            completeProductionOrder(order.id, ['https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=600']);
          }}
        />
      )}

      {selectedOrderForJobCard && (
        <JobCardPrintModal
          isOpen={!!selectedOrderForJobCard}
          onClose={() => setSelectedOrderForJobCard(null)}
          order={selectedOrderForJobCard}
          workOrders={workOrders}
        />
      )}

      {selectedOrderForLabels && (
        <PackageLabelPrintModal
          isOpen={!!selectedOrderForLabels}
          onClose={() => setSelectedOrderForLabels(null)}
          order={selectedOrderForLabels}
          packages={packages}
        />
      )}

      {selectedOrderForScrap && (
        <CreateScrapClaimModal
          isOpen={!!selectedOrderForScrap}
          onClose={() => setSelectedOrderForScrap(null)}
          order={selectedOrderForScrap}
          materials={materials}
          onSubmit={handleAddScrapClaim}
        />
      )}

      {selectedOrderForOffCut && (
        <OffCutReturnModal
          isOpen={!!selectedOrderForOffCut}
          onClose={() => setSelectedOrderForOffCut(null)}
          order={selectedOrderForOffCut}
          onSubmit={handleAddOffCutReturn}
        />
      )}

      {selectedOrderForQuality && (
        <QualityInspectionModal
          isOpen={!!selectedOrderForQuality}
          onClose={() => setSelectedOrderForQuality(null)}
          order={selectedOrderForQuality}
          onSubmit={handleAddQualityInspection}
        />
      )}

    </div>
  );
};
