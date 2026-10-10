import React, { useEffect, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ProductionOrder } from '../../types/erp';
import {
  WorkOrder,
  ScrapClaimRecord,
  OffCutReturnRecord,
  QualityGateInspection
} from '../../types/production';
import {
  applyWorkOrderUpdate,
  buildPackagesFor,
  CAPTURE_MODES,
  CaptureMode,
  WorkOrderUpdate
} from '../../services/shopFloor';

// Modals
import { ProductionOrderDetailsModal } from '../../components/production/ProductionOrderDetailsModal';
import { JobCardPrintModal } from '../../components/production/JobCardPrintModal';
import { PackageLabelPrintModal } from '../../components/production/PackageLabelPrintModal';
import { CreateScrapClaimModal } from '../../components/production/CreateScrapClaimModal';
import { OffCutReturnModal } from '../../components/production/OffCutReturnModal';
import { QualityInspectionModal } from '../../components/production/QualityInspectionModal';
import { StationUpdateModal } from '../../components/production/StationUpdateModal';

// Sub Views
import { ManufacturingDashboardView } from './ManufacturingDashboardView';
import { ManufacturingOrdersView } from './ManufacturingOrdersView';
import { WorkCentersAndOrdersView } from './WorkCentersAndOrdersView';
import { ShopfloorKioskView } from './ShopfloorKioskView';
import { JobCardsAndPackagesView } from './JobCardsAndPackagesView';
import { ScrapAndRequisitionsView } from './ScrapAndRequisitionsView';
import { QualityGatesView } from './QualityGatesView';
import { DailyProductionBoardView } from './DailyProductionBoardView';
import { RemakeOrdersView } from './RemakeOrdersView';
import { WorkforceView } from './WorkforceView';

// Icons
import {
  LayoutDashboard,
  Boxes,
  Cpu,
  Zap,
  Printer,
  AlertTriangle,
  ShieldCheck,
  ClipboardList,
  RotateCcw,
  Users,
  Smartphone,
  Tablet,
  UserCog
} from 'lucide-react';

interface ManufacturingWorkspaceProps {
  initialTab?: string;
}

const CAPTURE_MODE_KEY = 'fl-shopfloor-capture-mode';
const MODE_ICONS = { manager: UserCog, supervisor: Smartphone, kiosk: Tablet };

export const ManufacturingWorkspace: React.FC<ManufacturingWorkspaceProps> = ({
  initialTab = 'mfg_dashboard'
}) => {
  const {
    productionOrders,
    materials,
    availableBranches,
    completeProductionOrder,
    showToast,
    startProductionOrder,
    workCenters,
    workOrders,
    setWorkOrders,
    scrapClaims,
    setScrapClaims,
    offCutReturns,
    setOffCutReturns,
    manufacturingPackages: packages,
    setManufacturingPackages: setPackages,
    qualityInspections,
    setQualityInspections,
    shopWorkers,
    postSubcontractCost,
    issueScrapReplacement,
    technicalProjects,
    technicalBOMs,
    currentUser
  } = useERP();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  // The sidebar links reuse this component, so follow them when they change
  useEffect(() => setActiveTab(initialTab), [initialTab]);

  // How this factory reports shop-floor work. It changes who is recorded as the source, not the rules.
  const [captureMode, setCaptureModeState] = useState<CaptureMode>(() => {
    try {
      return (localStorage.getItem(CAPTURE_MODE_KEY) as CaptureMode) || 'manager';
    } catch {
      return 'manager';
    }
  });
  const setCaptureMode = (mode: CaptureMode) => {
    setCaptureModeState(mode);
    try {
      localStorage.setItem(CAPTURE_MODE_KEY, mode);
    } catch {
      // private window: the choice lasts for this visit only
    }
  };

  // Modals state
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<ProductionOrder | null>(null);
  const [selectedOrderForJobCard, setSelectedOrderForJobCard] = useState<ProductionOrder | null>(null);
  const [selectedOrderForLabels, setSelectedOrderForLabels] = useState<ProductionOrder | null>(null);
  const [selectedOrderForScrap, setSelectedOrderForScrap] = useState<ProductionOrder | null>(null);
  const [selectedOrderForOffCut, setSelectedOrderForOffCut] = useState<ProductionOrder | null>(null);
  const [selectedOrderForQuality, setSelectedOrderForQuality] = useState<ProductionOrder | null>(null);
  const [stationToUpdate, setStationToUpdate] = useState<WorkOrder | null>(null);

  const authorizedOrders = productionOrders.filter(p => availableBranches.some(b => b.id === p.branchId));

  // Bespoke orders ship flat: when packing finishes, one box per cabinet + fronts + fillers + hardware bag
  const createPackagesFor = (mo: ProductionOrder, stations: WorkOrder[]) => {
    if (packages.some(p => p.manufacturingOrderId === mo.id)) return;
    const tp = technicalProjects.find(t => t.salesProjectId === mo.projectId || t.salesProjectNumber === mo.projectNumber);
    const boms = tp ? technicalBOMs.filter(b => b.technicalProjectId === tp.id) : [];
    const bom = boms.find(b => b.status === 'released') || boms.find(b => b.status === 'approved') || boms[0];
    const units = (bom?.units || []).map(u => ({
      unitCode: u.unitCode,
      unitName: u.unitName,
      quantity: u.quantity || 1,
      partsCount: u.cuttingParts.reduce((s, p) => s + p.quantity, 0),
      hardware: u.hardwareParts.map(h => `${h.itemName} × ${h.quantity}`),
      widthMm: u.dimensions?.widthMm ?? u.widthMm,
      heightMm: u.dimensions?.heightMm ?? u.heightMm,
      depthMm: u.dimensions?.depthMm ?? u.depthMm
    }));
    const boxes = buildPackagesFor(mo, units, stations);
    setPackages(prev => [...boxes, ...prev]);
    showToast(`📦 اتعمل ${boxes.length} طرد لـ ${mo.customerName} بباركود - جاهزين للتحميل`, 'success');
  };

  /** Every way of reporting (tablet, supervisor phone, manager board) goes through here. */
  const handleStationUpdate = (woId: string, update: Omit<WorkOrderUpdate, 'source' | 'recordedBy'> & { source?: WorkOrderUpdate['source'] }): boolean => {
    const target = workOrders.find(w => w.id === woId);
    if (!target) return false;
    const mo = productionOrders.find(o => o.id === target.manufacturingOrderId);
    const result = applyWorkOrderUpdate(workOrders, woId, { ...update, source: update.source || captureMode, recordedBy: currentUser.fullName }, mo);
    if (!result.ok || !result.next || !result.updated) {
      showToast(result.message, 'error');
      return false;
    }
    // The first station of an order issues its materials (refused while any are short)
    if (result.startsOrder && mo && !startProductionOrder(mo.id)) return false;

    let next = result.next;
    const updated = result.updated;
    if (update.action === 'received_back' && updated.subcontract && !updated.subcontract.costPosted && mo) {
      postSubcontractCost(mo.id, updated.subcontract.vendorName, updated.subcontract.agreedCost, updated.operationName);
      next = next.map(w => (w.id === updated.id ? { ...w, subcontract: { ...w.subcontract!, costPosted: true } } : w));
    }
    setWorkOrders(next);
    if (updated.status === 'completed' && updated.operationCategory === 'packaging_qc' && mo) {
      createPackagesFor(mo, next.filter(w => w.manufacturingOrderId === mo.id));
    }
    showToast(result.message, result.tone);
    return true;
  };

  // Simple start / pause / finish buttons (work-center table and tablet)
  const handleUpdateWOStatus = (woId: string, newStatus: WorkOrder['status'], source?: CaptureMode) => {
    const wo = workOrders.find(w => w.id === woId);
    if (!wo) return;
    const action: WorkOrderUpdate['action'] = newStatus === 'paused' ? 'pause'
      : newStatus === 'completed' ? 'complete'
      : wo.status === 'paused' || wo.status === 'blocked' ? 'resume' : 'start';
    handleStationUpdate(woId, { action, source });
  };

  const handleAddScrapClaim = (claimData: Partial<ScrapClaimRecord>) => {
    const moId = claimData.manufacturingOrderId || authorizedOrders[0]?.id || '';
    const qty = claimData.scrapQuantity || 1;
    const cost = claimData.estimatedCost || 1250;
    // The replacement leaves stock and is charged to the same order, so the job cost shows the loss
    const gin = issueScrapReplacement(moId, claimData.materialCode || 'MDF-WHITE-18', qty, cost);
    const newClaim: ScrapClaimRecord = {
      id: `scr-${Date.now()}`,
      claimNumber: `SCR-2026-${String(scrapClaims.length + 1).padStart(3, '0')}`,
      manufacturingOrderId: moId,
      manufacturingOrderNumber: claimData.manufacturingOrderNumber || '',
      workOrderId: claimData.workOrderId,
      workCenterName: claimData.workCenterName || 'ماكينة CNC',
      materialId: claimData.materialId || 'mat-1',
      materialCode: claimData.materialCode || 'MAT-MDF-001',
      materialName: claimData.materialName || 'MDF أبيض',
      unit: claimData.unit || 'Sheet',
      scrapQuantity: qty,
      reason: claimData.reason || 'machine_defect',
      reasonDescription: claimData.reasonDescription || 'تلف أثناء التشغيل',
      estimatedCost: cost,
      reportedBy: claimData.reportedBy || 'مشرف الورشة',
      reportedAt: claimData.reportedAt || new Date().toISOString().substring(0, 16).replace('T', ' '),
      status: 'replacement_issued',
      replacementGINNumber: gin,
      wipPosted: true
    };
    setScrapClaims(prev => [newClaim, ...prev]);
    showToast(`تم تسجيل التلف وصرف بديل (${gin}): المخزن نقص، والتكلفة اتحملت على ${newClaim.manufacturingOrderNumber}`, 'success');
  };

  const handleAddOffCutReturn = (offcutData: Partial<OffCutReturnRecord>) => {
    const newReturn: OffCutReturnRecord = {
      id: `off-${Date.now()}`,
      returnNumber: `OFF-2026-${String(offCutReturns.length + 1).padStart(3, '0')}`,
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
    showToast('تم تسجيل البواقي في مخزن الفضلات. تقدر تستخدمها في أوامر النواقص ✅', 'success');
  };

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

  const remakeCount = authorizedOrders.filter(o => o.kind === 'remake' && o.status !== 'completed').length;
  const tabs = [
    { id: 'mfg_dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'mfg_daily', label: 'يومية الإنتاج', icon: ClipboardList },
    { id: 'mfg_orders', label: 'أوامر التصنيع', icon: Boxes, badge: authorizedOrders.length },
    { id: 'mfg_work_orders', label: 'المحطات والماكينات', icon: Cpu, badge: workCenters.length },
    { id: 'mfg_shopfloor', label: 'تابلت الورشة', icon: Zap },
    { id: 'mfg_job_cards', label: 'الطرود والتحميل', icon: Printer },
    { id: 'mfg_remake', label: 'النواقص وإعادة التصنيع', icon: RotateCcw, badge: remakeCount || undefined },
    { id: 'mfg_workforce', label: 'الصنايعية والحساب', icon: Users },
    { id: 'mfg_scrap', label: 'الهالك والبواقي', icon: AlertTriangle, badge: scrapClaims.length },
    { id: 'mfg_qc', label: 'الجودة', icon: ShieldCheck }
  ];
  const mode = CAPTURE_MODES.find(m => m.id === captureMode)!;

  return (
    <div className="space-y-4">

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 p-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
                  isActive ? 'bg-[#361D13] text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C87A38]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-[#C87A38] text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Capture mode: who types shop-floor events in this factory */}
      <div className="bg-[#FBF7F2] rounded-2xl border border-[#E9D9C7] px-4 py-3 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="shrink-0">
          <span className="text-[11px] font-black text-[#361D13] block">مين بيسجل شغل الورشة؟</span>
          <span className="text-[10px] text-slate-500">النظام شغال في الحالات التلاتة بنفس القواعد</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CAPTURE_MODES.map(m => {
            const Icon = MODE_ICONS[m.id];
            const on = m.id === captureMode;
            return (
              <button
                key={m.id}
                onClick={() => setCaptureMode(m.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 transition-all ${
                  on ? 'bg-[#C87A38] text-white border-[#C87A38] shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-[#C87A38]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {m.title}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed lg:border-r lg:border-[#E9D9C7] lg:pr-3">
          <strong className="text-slate-800">{mode.how}.</strong> {mode.tradeoff}.
        </p>
      </div>

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

        {activeTab === 'mfg_daily' && (
          <DailyProductionBoardView
            orders={authorizedOrders}
            workCenters={workCenters}
            workOrders={workOrders}
            captureMode={captureMode}
            onOpenStation={setStationToUpdate}
            onSelectOrder={setSelectedOrderForDetails}
            onStationUpdate={handleStationUpdate}
            onCompleteOrder={order => completeProductionOrder(order.id, [])}
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
            onCompleteOrder={order => completeProductionOrder(order.id, [])}
          />
        )}

        {activeTab === 'mfg_work_orders' && (
          <WorkCentersAndOrdersView
            workCenters={workCenters}
            workOrders={workOrders}
            orders={authorizedOrders}
            onUpdateWOStatus={(id, status) => handleUpdateWOStatus(id, status)}
            onSelectOrder={setSelectedOrderForDetails}
            onOpenStation={setStationToUpdate}
          />
        )}

        {activeTab === 'mfg_shopfloor' && (
          <ShopfloorKioskView
            workCenters={workCenters}
            workOrders={workOrders}
            orders={authorizedOrders}
            captureMode={captureMode}
            onUpdateWOStatus={(id, status) => handleUpdateWOStatus(id, status, 'kiosk')}
            onOpenScrapModal={setSelectedOrderForScrap}
            onOpenQualityModal={setSelectedOrderForQuality}
            onGoToDailyBoard={() => setActiveTab('mfg_daily')}
          />
        )}

        {activeTab === 'mfg_job_cards' && (
          <JobCardsAndPackagesView
            orders={authorizedOrders}
            packages={packages}
            setPackages={setPackages}
            onOpenJobCard={setSelectedOrderForJobCard}
            onOpenPackageLabels={setSelectedOrderForLabels}
            onSelectOrder={setSelectedOrderForDetails}
          />
        )}

        {activeTab === 'mfg_remake' && (
          <RemakeOrdersView
            orders={authorizedOrders}
            workOrders={workOrders}
            onSelectOrder={setSelectedOrderForDetails}
          />
        )}

        {activeTab === 'mfg_workforce' && (
          <WorkforceView workers={shopWorkers} workOrders={workOrders} workCenters={workCenters} captureMode={captureMode} />
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

      {/* Modals */}
      {stationToUpdate && (
        <StationUpdateModal
          workOrder={workOrders.find(w => w.id === stationToUpdate.id) || stationToUpdate}
          workOrders={workOrders}
          workCenters={workCenters}
          workers={shopWorkers}
          captureMode={captureMode}
          onClose={() => setStationToUpdate(null)}
          onSubmit={update => handleStationUpdate(stationToUpdate.id, update)}
        />
      )}

      {selectedOrderForDetails && (
        <ProductionOrderDetailsModal
          isOpen={!!selectedOrderForDetails}
          onClose={() => setSelectedOrderForDetails(null)}
          order={productionOrders.find(o => o.id === selectedOrderForDetails.id) || selectedOrderForDetails}
          workCenters={workCenters}
          workOrders={workOrders}
          scrapClaims={scrapClaims}
          onOpenJobCardPrint={setSelectedOrderForJobCard}
          onOpenPackageLabelsPrint={setSelectedOrderForLabels}
          onOpenScrapModal={setSelectedOrderForScrap}
          onOpenQualityModal={setSelectedOrderForQuality}
          onCompleteOrder={order => completeProductionOrder(order.id, [])}
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
          packages={packages.filter(p => !p.manufacturingOrderId || p.manufacturingOrderId === selectedOrderForLabels.id)}
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
