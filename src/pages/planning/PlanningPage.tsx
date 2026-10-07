import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  Cpu, 
  LayoutDashboard, 
  Boxes, 
  AlertTriangle, 
  ShoppingCart, 
  Gauge, 
  Calendar, 
  SlidersHorizontal,
  Play,
  Plus,
  RefreshCw,
  PackageX
} from 'lucide-react';

// Subviews
import { PlanningDashboardView } from './PlanningDashboardView';
import { PlanningDemandView } from './PlanningDemandView';
import { PlanningMRPEngineView } from './PlanningMRPEngineView';
import { PlanningShortagesView } from './PlanningShortagesView';
import { PlanningProposalsView } from './PlanningProposalsView';
import { PlanningCapacityView } from './PlanningCapacityView';
import { PlanningScheduleGanttView } from './PlanningScheduleGanttView';
import { PlanningMPSView } from './PlanningMPSView';

// Modals
import { ExecuteMRPRunModal } from './modals/ExecuteMRPRunModal';
import { CreateSupplyProposalModal } from './modals/CreateSupplyProposalModal';
import { ProposalDetailsModal } from './modals/ProposalDetailsModal';
import { RescheduleProjectModal } from './modals/RescheduleProjectModal';

import { SupplyProposal, ProjectPlanningReadiness, MRPNetRequirement } from '../../types/planning';
import { calculateNetRequirements } from '../../services/planningService';

interface PlanningPageProps {
  initialTab?: string;
}

export const PlanningPage: React.FC<PlanningPageProps> = ({ initialTab = 'plan_dashboard' }) => {
  const {
    planningDemands,
    supplyProposals,
    workCenterCapacities,
    projectReadinessList,
    planningRuns,
    mpsWeeklyBuckets,
    mpsItems,
    executeMRPRun,
    createSupplyProposal,
    approveSupplyProposal,
    convertProposalToProcurement,
    convertProposalToProduction,
    cancelSupplyProposal,
    rescheduleProjectTimeline,
    updateWorkCenterCapacityHours,
    batchGenerateProposalsFromShortages,
    itemMasterCards,
    setActiveModule
  } = useERP();

  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Modals state
  const [isMRPModalOpen, setIsMRPModalOpen] = useState(false);
  const [isCreateProposalOpen, setIsCreateProposalOpen] = useState(false);
  const [isProposalDetailsOpen, setIsProposalDetailsOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<SupplyProposal | null>(null);

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedProjectToReschedule, setSelectedProjectToReschedule] = useState<ProjectPlanningReadiness | null>(null);

  // Calculate Net Requirements on current demands
  const netRequirements = calculateNetRequirements(planningDemands, itemMasterCards);

  const handleOpenProposalDetails = (proposal: SupplyProposal) => {
    setSelectedProposal(proposal);
    setIsProposalDetailsOpen(true);
  };

  const handleOpenReschedule = (project: ProjectPlanningReadiness) => {
    setSelectedProjectToReschedule(project);
    setIsRescheduleModalOpen(true);
  };

  const handleGenerateProposalFromShortage = (item: MRPNetRequirement) => {
    const unitCost = item.itemCode.includes('MDF') ? 1450 : item.itemCode.includes('BLUM') ? 180 : item.itemCode.includes('HPL') ? 2200 : 350;
    const earliestNeed = item.demandSources[0]?.requiredDate || new Date().toISOString().substring(0, 10);
    const suggestedOrder = new Date(new Date(earliestNeed).getTime() - item.leadTimeDays * 86400000).toISOString().substring(0, 10);

    createSupplyProposal({
      proposalType: item.suggestedSupplyType,
      itemId: item.itemId,
      itemCode: item.itemCode,
      itemName: item.itemName,
      quantity: item.netShortageQty,
      uom: item.uom,
      targetWarehouseId: 'wh-main',
      targetWarehouseName: 'المستودع الرئيسي لخامات الأخشاب والمسطحات - A1',
      requiredDate: earliestNeed,
      suggestedOrderDate: suggestedOrder,
      leadTimeDays: item.leadTimeDays,
      priority: item.coverageStatus === 'shortage' ? 'urgent' : 'high',
      demandIds: item.demandSources.map(d => d.demandId),
      projectIds: [],
      projectNumbers: Array.from(new Set(item.demandSources.map(d => d.projectNumber).filter(Boolean))) as string[],
      customerNames: Array.from(new Set(item.demandSources.map(d => d.customerName).filter(Boolean))) as string[],
      estimatedUnitCostEGP: unitCost,
      estimatedTotalCostEGP: item.netShortageQty * unitCost,
      suggestedSupplierName: item.suggestedSupplyType === 'purchase_requisition' ? 'الشركة الهندسية للتجارة والتوريدات' : undefined,
      targetWorkCenterName: item.suggestedSupplyType === 'planned_production' ? 'ماكينة التقطيع الرئيسية (SCM Beam Saw)' : undefined,
      notes: `تم التوليد بناء على تشغيل MRP لكشف العجز (${item.itemName})`
    });
  };

  const navigationTabs = [
    { id: 'plan_dashboard', label: 'لوحة التحكم والـ KPIs', icon: LayoutDashboard },
    { id: 'plan_demand', label: 'طلبات التخطيط والمشاريع', icon: Boxes },
    { id: 'plan_mrp', label: 'محرك الـ MRP وحساب الاحتياج', icon: Cpu },
    { id: 'plan_shortages', label: 'مصفوفة عجز الخامات', icon: PackageX },
    { id: 'plan_proposals', label: 'مقترحات الشراء والتشغيل', icon: ShoppingCart },
    { id: 'plan_capacity', label: 'طاقة وسعة مراكز العمل', icon: Gauge },
    { id: 'plan_schedule', label: 'الجدولة العكسية (Gantt)', icon: Calendar },
    { id: 'plan_mps', label: 'جدول الإنتاج الرئيسي (MPS)', icon: SlidersHorizontal },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Navigation Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        {navigationTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (setActiveModule) {
                  setActiveModule(tab.id as any);
                }
              }}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div>
        {activeTab === 'plan_dashboard' && (
          <PlanningDashboardView
            demands={planningDemands}
            proposals={supplyProposals}
            workCenters={workCenterCapacities}
            readinessList={projectReadinessList}
            runs={planningRuns}
            onNavigate={(targetTab) => setActiveTab(targetTab)}
            onOpenMRPModal={() => setIsMRPModalOpen(true)}
            onOpenCreateProposalModal={() => setIsCreateProposalOpen(true)}
          />
        )}

        {activeTab === 'plan_demand' && (
          <PlanningDemandView
            demands={planningDemands}
            readinessList={projectReadinessList}
            onOpenMRPModal={() => setIsMRPModalOpen(true)}
            onNavigateToMRP={() => setActiveTab('plan_mrp')}
          />
        )}

        {activeTab === 'plan_mrp' && (
          <PlanningMRPEngineView
            netRequirements={netRequirements}
            runs={planningRuns}
            onOpenMRPModal={() => setIsMRPModalOpen(true)}
            onGenerateProposalFromShortage={handleGenerateProposalFromShortage}
            onBatchGenerateProposals={batchGenerateProposalsFromShortages}
          />
        )}

        {activeTab === 'plan_shortages' && (
          <PlanningShortagesView
            netRequirements={netRequirements}
            onGenerateProposal={handleGenerateProposalFromShortage}
            onBatchGenerateProposals={batchGenerateProposalsFromShortages}
          />
        )}

        {activeTab === 'plan_proposals' && (
          <PlanningProposalsView
            proposals={supplyProposals}
            onOpenCreateModal={() => setIsCreateProposalOpen(true)}
            onSelectProposal={handleOpenProposalDetails}
            onApproveProposal={approveSupplyProposal}
            onConvertToProcurement={convertProposalToProcurement}
            onConvertToProduction={convertProposalToProduction}
          />
        )}

        {activeTab === 'plan_capacity' && (
          <PlanningCapacityView
            workCenters={workCenterCapacities}
            onUpdateCapacityHours={updateWorkCenterCapacityHours}
          />
        )}

        {activeTab === 'plan_schedule' && (
          <PlanningScheduleGanttView
            projects={projectReadinessList}
            onOpenRescheduleModal={handleOpenReschedule}
          />
        )}

        {activeTab === 'plan_mps' && (
          <PlanningMPSView
            mpsItems={mpsItems}
            weeklyBuckets={mpsWeeklyBuckets}
          />
        )}
      </div>

      {/* Modals */}
      <ExecuteMRPRunModal
        isOpen={isMRPModalOpen}
        onClose={() => setIsMRPModalOpen(false)}
        onRunExecuted={(horizonDays, warehouseIds) => {
          executeMRPRun({
            planningHorizonDays: horizonDays,
            targetWarehouse: warehouseIds.join(', ')
          });
        }}
      />

      <CreateSupplyProposalModal
        isOpen={isCreateProposalOpen}
        onClose={() => setIsCreateProposalOpen(false)}
        onSave={(data) => {
          createSupplyProposal(data as any);
        }}
      />

      <ProposalDetailsModal
        isOpen={isProposalDetailsOpen}
        onClose={() => setIsProposalDetailsOpen(false)}
        proposal={selectedProposal}
        onApprove={approveSupplyProposal}
        onConvertToProcurement={convertProposalToProcurement}
        onConvertToProduction={convertProposalToProduction}
        onCancelProposal={cancelSupplyProposal}
      />

      <RescheduleProjectModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        project={selectedProjectToReschedule}
        onReschedule={rescheduleProjectTimeline}
      />

    </div>
  );
};
