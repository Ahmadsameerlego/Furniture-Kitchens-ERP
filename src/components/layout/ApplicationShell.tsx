import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from './ToastContainer';

// Pages
import { DashboardPage } from '../../pages/DashboardPage';
import { CustomersListPage } from '../../pages/CustomersListPage';
import { CampaignsPage } from '../../pages/CampaignsPage';
import { ProductsListPage } from '../../pages/ProductsListPage';
import { MaterialsListPage } from '../../pages/MaterialsListPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { ReadyOrdersListPage } from '../../pages/ReadyOrdersListPage';
import { CustomProjectsListPage } from '../../pages/CustomProjectsListPage';
import { ProductionListPage } from '../../pages/ProductionListPage';
import { InstallationsListPage } from '../../pages/InstallationsListPage';
import { SuppliersListPage } from '../../pages/SuppliersListPage';
import { ReadySalesDashboardPage } from '../../pages/ReadySalesDashboardPage';
import { CompanySetupPage } from '../../pages/CompanySetupPage';
import { BranchesPage } from '../../pages/BranchesPage';
import { UsersPage } from '../../pages/UsersPage';
import { RolesPermissionsPage } from '../../pages/RolesPermissionsPage';
import { AuditLogPage } from '../../pages/AuditLogPage';
import { SecurityTestPage } from '../../pages/SecurityTestPage';
import { NotificationsPage } from '../../pages/NotificationsPage';
import { CustomerPortalPage } from '../../pages/CustomerPortalPage';
import { FinanceDashboardPage } from '../../pages/FinanceDashboardPage';
import { AccountingDashboardView } from '../../pages/accounting/AccountingDashboardView';
import { ChartOfAccountsView } from '../../pages/accounting/ChartOfAccountsView';
import { JournalEntriesView } from '../../pages/accounting/JournalEntriesView';
import { CustomerInvoicesAdvancesView } from '../../pages/accounting/CustomerInvoicesAdvancesView';
import { VendorBillsPurchasesView } from '../../pages/accounting/VendorBillsPurchasesView';
import { PartnerStatementsView } from '../../pages/accounting/PartnerStatementsView';
import { PdcChecksView } from '../../pages/accounting/PdcChecksView';
import { CostCentersView } from '../../pages/accounting/CostCentersView';
import { FinancialReportsView } from '../../pages/accounting/FinancialReportsView';
import { FiscalPeriodsView } from '../../pages/accounting/FiscalPeriodsView';

// Inventory Pages
import { InventoryDashboardView } from '../../pages/inventory/InventoryDashboardView';
import { ItemMasterCardsView } from '../../pages/inventory/ItemMasterCardsView';
import { GoodsReceiptNotesView } from '../../pages/inventory/GoodsReceiptNotesView';
import { GoodsIssueNotesView } from '../../pages/inventory/GoodsIssueNotesView';
import { StockCardLedgerView } from '../../pages/inventory/StockCardLedgerView';
import { StockTransfersView } from '../../pages/inventory/StockTransfersView';
import { StocktakingView } from '../../pages/inventory/StocktakingView';
import { WarehousesLocationsView } from '../../pages/inventory/WarehousesLocationsView';

// Technical Office Pages
import { TechnicalOfficeDashboardView } from '../../pages/technicalOffice/TechnicalOfficeDashboardView';
import { TechnicalProjectsListView } from '../../pages/technicalOffice/TechnicalProjectsListView';
import { TechnicalDesignsView } from '../../pages/technicalOffice/TechnicalDesignsView';
import { TechnicalBOMExplosionView } from '../../pages/technicalOffice/TechnicalBOMExplosionView';
import { TechnicalReleasesView } from '../../pages/technicalOffice/TechnicalReleasesView';
import { TechnicalECRView } from '../../pages/technicalOffice/TechnicalECRView';

// Planning & MRP Pages
import { PlanningPage } from '../../pages/planning/PlanningPage';

// Procurement & Purchasing Pages
import { ProcurementWorkspace } from '../../pages/procurement/ProcurementWorkspace';

import { PlaceholderModulePage } from '../../pages/PlaceholderModulePage';

import { Building2, MapPin, Users as UsersIcon, ShieldCheck, History, Terminal } from 'lucide-react';

export const ApplicationShell: React.FC = () => {
  const { activeModule } = useERP();
  const [settingsSubTab, setSettingsSubTab] = useState<'company' | 'branches' | 'users' | 'roles' | 'audit' | 'security'>('company');

  // If customer portal is active, render customer portal cleanly without the internal ERP app shell!
  if (activeModule === 'portal') {
    return (
      <div className="w-screen h-screen overflow-y-auto custom-scrollbar">
        <CustomerPortalPage />
        <ToastContainer />
      </div>
    );
  }

  // Render main content view based on active sidebar module
  const renderMainContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <DashboardPage />
            <div className="pt-6 border-t border-slate-200">
              <ReadySalesDashboardPage />
            </div>
          </div>
        );

      case 'customers':
        return <CustomersListPage />;

      case 'campaigns':
        return <CampaignsPage />;

      case 'sales':
        return <ReadyOrdersListPage />;

      case 'custom_projects':
        return <CustomProjectsListPage />;

      case 'tech_office':
      case 'tech_dashboard':
        return <TechnicalOfficeDashboardView />;

      case 'tech_projects':
      case 'tech_handovers':
      case 'tech_surveys':
        return <TechnicalProjectsListView />;

      case 'tech_designs':
        return <TechnicalDesignsView />;

      case 'tech_boms':
        return <TechnicalBOMExplosionView />;

      case 'tech_releases':
        return <TechnicalReleasesView />;

      case 'tech_ecr':
        return <TechnicalECRView />;

      case 'planning':
      case 'plan_dashboard':
        return <PlanningPage initialTab="plan_dashboard" />;

      case 'plan_demand':
        return <PlanningPage initialTab="plan_demand" />;

      case 'plan_mrp':
        return <PlanningPage initialTab="plan_mrp" />;

      case 'plan_shortages':
        return <PlanningPage initialTab="plan_shortages" />;

      case 'plan_proposals':
        return <PlanningPage initialTab="plan_proposals" />;

      case 'plan_capacity':
        return <PlanningPage initialTab="plan_capacity" />;

      case 'plan_schedule':
        return <PlanningPage initialTab="plan_schedule" />;

      case 'plan_mps':
        return <PlanningPage initialTab="plan_mps" />;

      case 'production':
        return <ProductionListPage />;

      case 'installation':
        return <InstallationsListPage />;

      case 'products':
        return <ProductsListPage />;

      case 'materials':
        return <MaterialsListPage />;

      case 'inventory':
      case 'inv_dashboard':
        return <InventoryDashboardView />;

      case 'inv_items':
        return <ItemMasterCardsView />;

      case 'inv_grn':
        return <GoodsReceiptNotesView />;

      case 'inv_gin':
        return <GoodsIssueNotesView />;

      case 'inv_stock_card':
        return <StockCardLedgerView />;

      case 'inv_transfers':
        return <StockTransfersView />;

      case 'inv_stocktaking':
        return <StocktakingView />;

      case 'inv_warehouses':
        return <WarehousesLocationsView />;

      case 'suppliers':
        return <SuppliersListPage />;

      case 'procurement':
      case 'proc_dashboard':
      case 'proc_requests':
      case 'proc_rfq':
      case 'proc_quotations':
      case 'proc_comparison':
      case 'proc_orders':
      case 'proc_deliveries':
      case 'proc_returns':
      case 'proc_prices':
      case 'proc_suppliers':
      case 'proc_reports':
        return <ProcurementWorkspace initialTab={activeModule} />;

      case 'finance':
      case 'acc_dashboard':
        return <AccountingDashboardView />;

      case 'acc_coa':
        return <ChartOfAccountsView />;

      case 'acc_entries':
        return <JournalEntriesView />;

      case 'acc_invoices':
        return <CustomerInvoicesAdvancesView />;

      case 'acc_bills':
        return <VendorBillsPurchasesView />;

      case 'acc_partners':
        return <PartnerStatementsView />;

      case 'acc_checks':
        return <PdcChecksView />;

      case 'acc_cost_centers':
        return <CostCentersView />;

      case 'acc_reports':
        return <FinancialReportsView />;

      case 'acc_periods':
        return <FiscalPeriodsView />;

      case 'notifications':
        return <NotificationsPage />;

      case 'settings':
        return (
          <div className="space-y-6">
            {/* Settings Sub-Tab Navigation Bar */}
            <div className="bg-white rounded-3xl p-2 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setSettingsSubTab('company')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black transition-all ${
                  settingsSubTab === 'company'
                    ? 'bg-[#361D13] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-4 h-4 text-[#C87A38]" />
                <span>إعدادات الشركة والنشاط</span>
              </button>

              <button
                onClick={() => setSettingsSubTab('branches')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black transition-all ${
                  settingsSubTab === 'branches'
                    ? 'bg-[#361D13] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-4 h-4 text-[#C87A38]" />
                <span>هيكل الفروع والمقرات</span>
              </button>

              <button
                onClick={() => setSettingsSubTab('users')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black transition-all ${
                  settingsSubTab === 'users'
                    ? 'bg-[#361D13] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <UsersIcon className="w-4 h-4 text-[#C87A38]" />
                <span>إدارة الموظفين والمستخدمين</span>
              </button>

              <button
                onClick={() => setSettingsSubTab('roles')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black transition-all ${
                  settingsSubTab === 'roles'
                    ? 'bg-[#361D13] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#C87A38]" />
                <span>الأدوار ومصفوفة الصلاحيات</span>
              </button>

              <button
                onClick={() => setSettingsSubTab('audit')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black transition-all ${
                  settingsSubTab === 'audit'
                    ? 'bg-[#361D13] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <History className="w-4 h-4 text-[#C87A38]" />
                <span>سجل المراجعة والأمان (Audit Log)</span>
              </button>

              <button
                onClick={() => setSettingsSubTab('security')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black transition-all ${
                  settingsSubTab === 'security'
                    ? 'bg-[#C87A38] text-white shadow-md'
                    : 'text-slate-600 hover:bg-amber-50'
                }`}
              >
                <Terminal className="w-4 h-4 text-white" />
                <span>منصة فحص أمان الـ API</span>
              </button>
            </div>

            {/* Sub-tab Views */}
            {settingsSubTab === 'company' && <CompanySetupPage />}
            {settingsSubTab === 'branches' && <BranchesPage />}
            {settingsSubTab === 'users' && <UsersPage />}
            {settingsSubTab === 'roles' && <RolesPermissionsPage />}
            {settingsSubTab === 'audit' && <AuditLogPage />}
            {settingsSubTab === 'security' && <SecurityTestPage />}
          </div>
        );

      default:
        return <PlaceholderModulePage moduleId={activeModule} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF7F2] font-sans text-slate-800">
      
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* Header */}
        <Header />

        {/* Scrollable Main Workspace Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-7xl w-full mx-auto animate-in fade-in duration-200">
            {renderMainContent()}
          </div>
        </main>

      </div>

      {/* Floating Toast Alert Notification Container */}
      <ToastContainer />

    </div>
  );
};
