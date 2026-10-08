import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingCart, FileText, ArrowRightLeft, 
  Truck, RotateCcw, DollarSign, Building2, BarChart3, 
  Plus, GitMerge, FileSpreadsheet, ShieldCheck, Clock
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ProcurementDashboardView } from './ProcurementDashboardView';
import { PurchaseRequestsView } from './PurchaseRequestsView';
import { RFQListView } from './RFQListView';
import { QuotationComparisonView } from './QuotationComparisonView';
import { PurchaseOrdersView } from './PurchaseOrdersView';
import { ExpectedDeliveriesView } from './ExpectedDeliveriesView';
import { SupplierReturnsView } from './SupplierReturnsView';
import { SupplierPriceListsView } from './SupplierPriceListsView';
import { ProcurementSuppliersView } from './ProcurementSuppliersView';
import { ProcurementReportsView } from './ProcurementReportsView';
import { ProcurementTraceabilityModal } from './modals/ProcurementTraceabilityModal';
import { CreatePurchaseRequestModal } from './modals/CreatePurchaseRequestModal';
import { CreateRFQModal } from './modals/CreateRFQModal';
import { RecordSupplierQuotationModal } from './modals/RecordSupplierQuotationModal';
import { CreatePurchaseOrderModal } from './modals/CreatePurchaseOrderModal';

interface ProcurementWorkspaceProps {
  initialTab?: string;
}

export const ProcurementWorkspace: React.FC<ProcurementWorkspaceProps> = ({ initialTab }) => {
  const { 
    activeModule, 
    setActiveModule,
    purchaseRequests,
    rfqs,
    supplierQuotations,
    enterprisePurchaseOrders,
    procurementSupplierReturns
  } = useERP();

  // Internal tab state syncing with activeModule if it's a proc_ tab
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (initialTab && initialTab.startsWith('proc_')) return initialTab;
    if (activeModule && activeModule.startsWith('proc_')) return activeModule;
    return 'proc_dashboard';
  });

  // Selected state for modals
  const [selectedPrId, setSelectedPrId] = useState<string | undefined>(undefined);
  const [selectedRfqId, setSelectedRfqId] = useState<string | undefined>(undefined);

  // Modals state
  const [isTraceabilityOpen, setIsTraceabilityOpen] = useState(false);
  const [isPrModalOpen, setIsPrModalOpen] = useState(false);
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);

  useEffect(() => {
    if (activeModule && (activeModule.startsWith('proc_') || activeModule === 'procurement')) {
      setActiveTab(activeModule === 'procurement' ? 'proc_dashboard' : activeModule);
    }
  }, [activeModule]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (setActiveModule) {
      setActiveModule(tabId as any);
    }
  };

  // Badge Counts
  const pendingPRs = purchaseRequests.filter(p => p.status === 'pending_approval').length;
  const quotesToCompare = rfqs.filter(r => supplierQuotations.filter(q => q.rfqId === r.id).length >= 2).length;
  const pendingPOs = enterprisePurchaseOrders.filter(p => p.status === 'pending_approval').length;
  const pendingReturns = procurementSupplierReturns.filter(r => r.status === 'pending_approval').length;

  const tabs = [
    {
      id: 'proc_dashboard',
      label: 'نظرة عامة ومؤشرات الأداء',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'proc_requests',
      label: 'طلبات الشراء (PR)',
      icon: FileText,
      badge: pendingPRs > 0 ? pendingPRs : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'proc_rfq',
      label: 'طلبات الأسعار (RFQ)',
      icon: ArrowRightLeft,
      badge: null
    },
    {
      id: 'proc_comparison',
      label: 'مقارنة العروض والترسية',
      icon: GitMerge,
      badge: quotesToCompare > 0 ? quotesToCompare : null,
      badgeColor: 'bg-purple-500 text-white'
    },
    {
      id: 'proc_orders',
      label: 'أوامر الشراء (PO)',
      icon: ShoppingCart,
      badge: pendingPOs > 0 ? pendingPOs : null,
      badgeColor: 'bg-blue-600 text-white'
    },
    {
      id: 'proc_deliveries',
      label: 'متابعة التوريدات',
      icon: Truck,
      badge: null
    },
    {
      id: 'proc_returns',
      label: 'مرتجعات الموردين',
      icon: RotateCcw,
      badge: pendingReturns > 0 ? pendingReturns : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'proc_prices',
      label: 'قوائم الأسعار والسجل',
      icon: DollarSign,
      badge: null
    },
    {
      id: 'proc_suppliers',
      label: 'دليل الموردين',
      icon: Building2,
      badge: null
    },
    {
      id: 'proc_reports',
      label: 'التقارير والمطابقة الثلاثية',
      icon: BarChart3,
      badge: null
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header with Quick Action Bar */}
      <div className="bg-gradient-to-r from-[#361D13] via-[#4a281b] to-[#361D13] px-5 py-4 rounded-2xl text-white shadow-md flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white">المشتريات وسلاسل التوريد</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            من احتياج التخطيط حتى الاستلام المخزني والتسوية المحاسبية
          </p>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setIsTraceabilityOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition border border-white/10"
            title="عرض مسار الدورة الكاملة من التخطيط حتى الصرف"
          >
            <GitMerge className="w-3.5 h-3.5 text-amber-300" />
            <span>مخطط دورة المشتريات</span>
          </button>

          <button
            onClick={() => {
              setSelectedPrId(undefined);
              setIsPrModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-[#361D13] hover:bg-amber-50 text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#C87A38]" />
            <span>طلب شراء (PR)</span>
          </button>

          <button
            onClick={() => {
              setSelectedPrId(undefined);
              setIsRfqModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition border border-white/10"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-300" />
            <span>طلب أسعار (RFQ)</span>
          </button>

          <button
            onClick={() => {
              setSelectedRfqId(undefined);
              setIsQuoteModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition border border-white/10"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-300" />
            <span>تسجيل عرض مورد</span>
          </button>

          <button
            onClick={() => {
              setSelectedPrId(undefined);
              setIsPoModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#C87A38] hover:bg-[#d98947] text-white text-xs font-bold transition shadow-sm"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>أمر شراء جديد (PO)</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-[#361D13] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab.badgeColor || 'bg-amber-500 text-white'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Rendering */}
      <div>
        {activeTab === 'proc_dashboard' && (
          <ProcurementDashboardView
            onNavigateTab={handleTabChange}
            onOpenCreatePR={() => setIsPrModalOpen(true)}
            onOpenCreateRFQ={() => setIsRfqModalOpen(true)}
            onOpenCreatePO={() => setIsPoModalOpen(true)}
            onOpenTraceability={() => setIsTraceabilityOpen(true)}
          />
        )}
        {activeTab === 'proc_requests' && (
          <PurchaseRequestsView
            onOpenCreatePR={() => setIsPrModalOpen(true)}
            onOpenCreateRFQFromPR={(pr) => {
              setSelectedPrId(pr.id);
              setIsRfqModalOpen(true);
            }}
            onOpenCreatePOFromPR={(pr) => {
              setSelectedPrId(pr.id);
              setIsPoModalOpen(true);
            }}
            onOpenTraceability={() => setIsTraceabilityOpen(true)}
          />
        )}
        {activeTab === 'proc_rfq' && (
          <RFQListView
            onOpenCreateRFQ={() => setIsRfqModalOpen(true)}
            onOpenComparison={(rfq) => {
              setSelectedRfqId(rfq.id);
              handleTabChange('proc_comparison');
            }}
            onOpenRecordQuote={(rfq) => {
              setSelectedRfqId(rfq.id);
              setIsQuoteModalOpen(true);
            }}
          />
        )}
        {activeTab === 'proc_comparison' && (
          <QuotationComparisonView
            onOpenRecordQuote={(rfq) => {
              setSelectedRfqId(rfq?.id);
              setIsQuoteModalOpen(true);
            }}
            onNavigateToPO={() => handleTabChange('proc_orders')}
            onOpenTraceability={() => setIsTraceabilityOpen(true)}
          />
        )}
        {activeTab === 'proc_orders' && (
          <PurchaseOrdersView
            onOpenCreatePO={() => setIsPoModalOpen(true)}
            onOpenTraceability={() => setIsTraceabilityOpen(true)}
          />
        )}
        {activeTab === 'proc_deliveries' && (
          <ExpectedDeliveriesView
            onOpenReceiveGoodsModal={() => alert('يمكنك تأكيد إذن الاستلام المخزني من قسم المخازن')}
            onNavigateToPO={() => handleTabChange('proc_orders')}
          />
        )}
        {activeTab === 'proc_returns' && <SupplierReturnsView />}
        {activeTab === 'proc_prices' && <SupplierPriceListsView />}
        {activeTab === 'proc_suppliers' && <ProcurementSuppliersView />}
        {activeTab === 'proc_reports' && <ProcurementReportsView />}
      </div>

      {/* Modals */}
      <ProcurementTraceabilityModal
        isOpen={isTraceabilityOpen}
        onClose={() => setIsTraceabilityOpen(false)}
      />

      <CreatePurchaseRequestModal
        isOpen={isPrModalOpen}
        onClose={() => {
          setIsPrModalOpen(false);
          setSelectedPrId(undefined);
        }}
      />

      <CreateRFQModal
        isOpen={isRfqModalOpen}
        onClose={() => {
          setIsRfqModalOpen(false);
          setSelectedPrId(undefined);
        }}
        defaultPrId={selectedPrId}
      />

      <RecordSupplierQuotationModal
        isOpen={isQuoteModalOpen}
        onClose={() => {
          setIsQuoteModalOpen(false);
          setSelectedRfqId(undefined);
        }}
        defaultRfqId={selectedRfqId}
      />

      <CreatePurchaseOrderModal
        isOpen={isPoModalOpen}
        onClose={() => {
          setIsPoModalOpen(false);
          setSelectedPrId(undefined);
        }}
        defaultPrId={selectedPrId}
      />
    </div>
  );
};
