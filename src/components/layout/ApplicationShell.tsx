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

      case 'production':
        return <ProductionListPage />;

      case 'installation':
        return <InstallationsListPage />;

      case 'products':
        return <ProductsListPage />;

      case 'materials':
        return <MaterialsListPage />;

      case 'inventory':
        return <InventoryPage />;

      case 'suppliers':
        return <SuppliersListPage />;

      case 'finance':
        return <FinanceDashboardPage />;

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
                    ? 'bg-[#1C352D] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-4 h-4 text-[#E06F28]" />
                <span>إعدادات الشركة والنشاط</span>
              </button>

              <button
                onClick={() => setSettingsSubTab('branches')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black transition-all ${
                  settingsSubTab === 'branches'
                    ? 'bg-[#1C352D] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-4 h-4 text-[#E06F28]" />
                <span>هيكل الفروع والمقرات</span>
              </button>

              <button
                onClick={() => setSettingsSubTab('users')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black transition-all ${
                  settingsSubTab === 'users'
                    ? 'bg-[#1C352D] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <UsersIcon className="w-4 h-4 text-[#E06F28]" />
                <span>إدارة الموظفين والمستخدمين</span>
              </button>

              <button
                onClick={() => setSettingsSubTab('roles')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black transition-all ${
                  settingsSubTab === 'roles'
                    ? 'bg-[#1C352D] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#E06F28]" />
                <span>الأدوار ومصفوفة الصلاحيات</span>
              </button>

              <button
                onClick={() => setSettingsSubTab('audit')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black transition-all ${
                  settingsSubTab === 'audit'
                    ? 'bg-[#1C352D] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <History className="w-4 h-4 text-[#E06F28]" />
                <span>سجل المراجعة والأمان (Audit Log)</span>
              </button>

              <button
                onClick={() => setSettingsSubTab('security')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black transition-all ${
                  settingsSubTab === 'security'
                    ? 'bg-[#E06F28] text-white shadow-md'
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F7F5] font-sans text-slate-800">
      
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
