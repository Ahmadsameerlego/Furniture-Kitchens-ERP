import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import { ModuleId } from '../../types/erp';
import { BrandLogo } from '../branding/BrandLogo';
import { BackendSecurityService } from '../../services/backendSecurity';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  ShoppingBag,
  Ruler,
  Package,
  Layers,
  Boxes,
  Truck,
  Factory,
  Landmark,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Building2,
  Lock,
  Globe,
  FolderTree,
  Scale,
  FileText,
  Receipt,
  CreditCard,
  Calendar,
  PieChart,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ClipboardCheck,
  History,
  Warehouse
} from 'lucide-react';

interface SidebarItem {
  id: ModuleId;
  label: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarSection {
  title: string;
  titleEn: string;
  items: SidebarItem[];
}

interface AccountingSubItem {
  id: ModuleId;
  label: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
}

const accountingSubPages: AccountingSubItem[] = [
  { id: 'acc_dashboard', label: 'لوحة التحكم والرقابة المالية', labelEn: 'Financial Dashboard', icon: LayoutDashboard },
  { id: 'acc_coa', label: 'دليل وشجرة الحسابات', labelEn: 'Chart of Accounts Tree', icon: FolderTree },
  { id: 'acc_entries', label: 'قيود اليومية ودفتر الأستاذ', labelEn: 'Journal Entries & Ledger', icon: Scale },
  { id: 'acc_invoices', label: 'فواتير المبيعات والعربين (VAT 14%)', labelEn: 'Sales & Advances', icon: FileText },
  { id: 'acc_bills', label: 'فواتير المشتريات ومطابقة GR/IR', labelEn: 'Vendor Bills & GR/IR', icon: Receipt },
  { id: 'acc_partners', label: 'كشوف الحسابات وأعمار الديون', labelEn: 'Partner Statements & Aging', icon: Users },
  { id: 'acc_checks', label: 'أوراق القبض والدفع (الشيكات)', labelEn: 'PDC Checks Lifecycle', icon: CreditCard },
  { id: 'acc_cost_centers', label: 'مراكز التكلفة والورش', labelEn: 'Cost Centers & Workshops', icon: Building2 },
  { id: 'acc_reports', label: 'القوائم والتقارير الختامية', labelEn: 'Financial Statements', icon: BarChart3 },
  { id: 'acc_periods', label: 'الفترات المحاسبية وإقفال الشهر', labelEn: 'Fiscal Periods & Closing', icon: Calendar }
];

interface InventorySubItem {
  id: ModuleId;
  label: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
}

const inventorySubPages: InventorySubItem[] = [
  { id: 'inv_dashboard', label: 'لوحة تحكم وتقييم المخزون', labelEn: 'Inventory Dashboard', icon: LayoutDashboard },
  { id: 'inv_items', label: 'كروت ودليل الأصناف والخامات', labelEn: 'Item Master Catalog', icon: Package },
  { id: 'inv_grn', label: 'أذونات الإضافة المخزنية (GRN)', labelEn: 'Goods Receipt Notes', icon: ArrowDownToLine },
  { id: 'inv_gin', label: 'أذونات وطلبات الصرف (GIN/MRN)', labelEn: 'Goods Issue & Requisitions', icon: ArrowUpFromLine },
  { id: 'inv_stock_card', label: 'كارت الصنف وسجل الحركات', labelEn: 'Stock Card & Ledger', icon: History },
  { id: 'inv_transfers', label: 'التحويلات بين المخازن', labelEn: 'Inter-Warehouse Transfers', icon: ArrowLeftRight },
  { id: 'inv_stocktaking', label: 'الجرد الدوري والتسويات الجردية', labelEn: 'Stocktaking & Adjustments', icon: ClipboardCheck },
  { id: 'inv_warehouses', label: 'إدارة المستودعات والأرفف', labelEn: 'Warehouses & Locations', icon: Warehouse }
];

const sidebarSections: SidebarSection[] = [
  {
    title: 'نظرة عامة',
    titleEn: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'لوحة التحكم والمؤشرات', labelEn: 'Dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'إدارة العملاء CRM',
    titleEn: 'CUSTOMERS',
    items: [
      { id: 'customers', label: 'العملاء وCRM', labelEn: 'Customers & CRM', icon: Users },
      { id: 'portal', label: 'بوابة العملاء (Customer Portal)', labelEn: 'Customer Portal', icon: Globe },
      { id: 'campaigns', label: 'الحملات والتسويق', labelEn: 'Marketing Campaigns', icon: Sparkles }
    ]
  },
  {
    title: 'المبيعات والعقود',
    titleEn: 'SALES',
    items: [
      { id: 'sales', label: 'مبيعات الأثاث الجاهز', labelEn: 'Ready Sales', icon: ShoppingBag },
      { id: 'custom_projects', label: 'المشاريع والتفصيل', labelEn: 'Custom Projects', icon: Ruler }
    ]
  },
  {
    title: 'الكتالوج والخامات',
    titleEn: 'CATALOG',
    items: [
      { id: 'products', label: 'المنتجات الجاهزة', labelEn: 'Products Catalog', icon: Package },
      { id: 'materials', label: 'مكتبة الخامات', labelEn: 'Materials Library', icon: Layers }
    ]
  },
  {
    title: 'التشغيل والورش',
    titleEn: 'OPERATIONS',
    items: [
      { id: 'production', label: 'الإنتاج والورش', labelEn: 'Production & Workshop', icon: Factory },
      { id: 'installation', label: 'التركيبات والتسليم', labelEn: 'Installation & Handover', icon: Truck },
      { id: 'suppliers', label: 'الموردين والشركات', labelEn: 'Suppliers', icon: Building2 }
    ]
  },
  {
    title: 'إدارة المخازن والمستودعات والمخزون',
    titleEn: 'INVENTORY',
    items: []
  },
  {
    title: 'الحسابات العامة والمالية',
    titleEn: 'ACCOUNTING',
    items: []
  },
  {
    title: 'التقارير والتحليلات',
    titleEn: 'REPORTS',
    items: [
      { id: 'reports', label: 'التقارير التحليلية الشاملة', labelEn: 'Analytical Reports', icon: BarChart3 }
    ]
  },
  {
    title: 'إدارة النظام',
    titleEn: 'SYSTEM',
    items: [
      { id: 'notifications', label: 'الإشعارات والتنبيهات', labelEn: 'Notifications', icon: Bell },
      { id: 'settings', label: 'إعدادات النظام', labelEn: 'Settings', icon: Settings }
    ]
  }
];

export const Sidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    checkPermission,
    currentRole,
    company,
    language,
    notifications
  } = useERP();

  const isAccountingModuleActive = activeModule === 'finance' || activeModule.startsWith('acc_');
  const [isAccountingOpen, setIsAccountingOpen] = useState<boolean>(true);

  const isInventoryModuleActive = activeModule === 'inventory' || activeModule.startsWith('inv_');
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(true);

  // Keep open when entering an accounting sub-page
  useEffect(() => {
    if (isAccountingModuleActive) {
      setIsAccountingOpen(true);
    }
  }, [isAccountingModuleActive]);

  // Keep open when entering an inventory sub-page
  useEffect(() => {
    if (isInventoryModuleActive) {
      setIsInventoryOpen(true);
    }
  }, [isInventoryModuleActive]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const isFinanceAllowed = checkPermission('finance', 'view');
  const isInventoryAllowed = checkPermission('inventory', 'view');

  // Filter visible modules: Visible = Business Configuration + Role Permissions + Branch Access
  const accessibleSections = sidebarSections.map(section => {
    if (section.titleEn === 'ACCOUNTING') {
      return isFinanceAllowed ? section : null;
    }
    if (section.titleEn === 'INVENTORY') {
      return isInventoryAllowed ? section : null;
    }

    const visibleItems = section.items.filter(item => {
      const isSupportedByBusiness = BackendSecurityService.isModuleSupportedByCompany(company, item.id);
      if (!isSupportedByBusiness) return false;

      const isAllowedByRole = checkPermission(item.id, 'view');
      return isAllowedByRole;
    });

    if (visibleItems.length === 0) return null;
    return { ...section, items: visibleItems };
  }).filter((s): s is SidebarSection => s !== null);

  return (
    <aside
      className={`h-full flex-shrink-0 z-30 flex flex-col bg-[#361D13] text-white transition-all duration-300 shadow-2xl border-l border-white/10 ${
        isSidebarCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-white/10 bg-[#23120A] shrink-0">
        {!isSidebarCollapsed ? (
          <BrandLogo size="md" variant="dark" showSubtext={true} />
        ) : (
          <div className="mx-auto">
            <BrandLogo size="sm" variant="dark" showSubtext={false} hideText={true} />
          </div>
        )}

        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-xl bg-white/10 text-amber-200 hover:bg-[#C87A38] hover:text-white transition-all shadow-sm shrink-0"
          title={isSidebarCollapsed ? 'توسيع القائمة' : 'طَي القائمة'}
        >
          {isSidebarCollapsed ? (
            language === 'ar' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
          ) : (
            language === 'ar' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Dynamic Business Scope Badge */}
      {!isSidebarCollapsed && (
        <div className="mx-4 my-3 px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#C87A38]" />
            <span className="text-xs font-bold text-amber-100">
              {company.businessType === 'furniture_kitchens' && 'أثاث ومطابخ'}
              {company.businessType === 'furniture' && 'أثاث فقط'}
              {company.businessType === 'kitchens' && 'مطابخ فقط'}
            </span>
          </div>
          <span className="text-[10px] font-black text-[#C87A38] bg-[#C87A38]/15 px-2 py-0.5 rounded-lg border border-[#C87A38]/30">
            {company.businessModel === 'ready_custom' && 'جاهز + تفصيل'}
            {company.businessModel === 'ready_made' && 'جاهز فقط'}
            {company.businessModel === 'custom_made' && 'تفصيل فقط'}
          </span>
        </div>
      )}

      {/* Sectioned Module Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar">
        
        {/* Sections loop */}
        {accessibleSections.map((section, idx) => {
          // Check if this is dedicated Inventory or Accounting section
          const isAccountingSection = section.titleEn === 'ACCOUNTING';
          const isInventorySection = section.titleEn === 'INVENTORY';

          return (
            <div key={idx} className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-black tracking-wider text-amber-200/50 uppercase">
                  {language === 'ar' ? section.title : section.titleEn}
                </div>
              )}

              {/* DEDICATED COLLAPSIBLE INVENTORY ACCORDION */}
              {isInventorySection && isInventoryAllowed && (
                <div className="space-y-1">
                  {/* Master Dropdown Toggle Button */}
                  <button
                    onClick={() => {
                      if (isSidebarCollapsed) {
                        setActiveModule('inv_dashboard');
                        setIsSidebarCollapsed(false);
                      } else {
                        setIsInventoryOpen(!isInventoryOpen);
                      }
                    }}
                    className={`w-full group relative flex items-center justify-between transition-all duration-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold ${
                      isInventoryModuleActive
                        ? 'bg-[#4A2818] text-white border border-[#C87A38]/50 shadow-md'
                        : 'text-amber-100/90 hover:bg-white/10 hover:text-white'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-3'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Boxes
                        className={`transition-transform duration-200 shrink-0 ${
                          isInventoryModuleActive ? 'scale-110 text-amber-300' : 'group-hover:scale-105 text-[#C87A38]'
                        } ${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`}
                      />

                      {!isSidebarCollapsed && (
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-xs font-black tracking-wide truncate">
                            {language === 'ar' ? 'المخازن والمستودعات' : 'Inventory & Warehouse'}
                          </span>
                        </div>
                      )}
                    </div>

                    {!isSidebarCollapsed && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-[#C87A38]/30 text-amber-200">
                          8
                        </span>
                        {isInventoryOpen ? (
                          <ChevronDown className="w-4 h-4 text-amber-300 transition-transform" />
                        ) : (
                          <ChevronLeft className="w-4 h-4 text-amber-300 transition-transform" />
                        )}
                      </div>
                    )}

                    {isSidebarCollapsed && (
                      <div className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {language === 'ar' ? 'المخازن والمستودعات' : 'Inventory & Warehouse'}
                      </div>
                    )}
                  </button>

                  {/* Accordion Sub-pages Tree */}
                  {isInventoryOpen && !isSidebarCollapsed && (
                    <div className="mt-1 mr-3 pr-2.5 border-r-2 border-[#C87A38]/40 space-y-1 animate-in fade-in duration-200">
                      {inventorySubPages.map(sub => {
                        const SubIcon = sub.icon;
                        const isSubActive = activeModule === sub.id || (sub.id === 'inv_dashboard' && activeModule === 'inventory');

                        return (
                          <button
                            key={sub.id}
                            onClick={() => setActiveModule(sub.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-right ${
                              isSubActive
                                ? 'bg-[#C87A38] text-white shadow-md font-black'
                                : 'text-amber-100/70 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <SubIcon className={`w-4 h-4 shrink-0 ${isSubActive ? 'text-white' : 'text-amber-300/80'}`} />
                            <span className="truncate flex-1 text-[11px] leading-tight">
                              {language === 'ar' ? sub.label : sub.labelEn}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* DEDICATED COLLAPSIBLE ACCOUNTING ACCORDION */}
              {isAccountingSection && isFinanceAllowed && (
                <div className="space-y-1">
                  {/* Master Dropdown Toggle Button */}
                  <button
                    onClick={() => {
                      if (isSidebarCollapsed) {
                        setActiveModule('acc_dashboard');
                        setIsSidebarCollapsed(false);
                      } else {
                        setIsAccountingOpen(!isAccountingOpen);
                      }
                    }}
                    className={`w-full group relative flex items-center justify-between transition-all duration-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold ${
                      isAccountingModuleActive
                        ? 'bg-[#4A2818] text-white border border-[#C87A38]/50 shadow-md'
                        : 'text-amber-100/90 hover:bg-white/10 hover:text-white'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-3'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Landmark
                        className={`transition-transform duration-200 shrink-0 ${
                          isAccountingModuleActive ? 'scale-110 text-amber-300' : 'group-hover:scale-105 text-[#C87A38]'
                        } ${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`}
                      />

                      {!isSidebarCollapsed && (
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-xs font-black tracking-wide truncate">
                            {language === 'ar' ? 'الحسابات العامة والمالية' : 'Accounting & Finance'}
                          </span>
                        </div>
                      )}
                    </div>

                    {!isSidebarCollapsed && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-[#C87A38]/30 text-amber-200">
                          10
                        </span>
                        {isAccountingOpen ? (
                          <ChevronDown className="w-4 h-4 text-amber-300 transition-transform" />
                        ) : (
                          <ChevronLeft className="w-4 h-4 text-amber-300 transition-transform" />
                        )}
                      </div>
                    )}

                    {isSidebarCollapsed && (
                      <div className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {language === 'ar' ? 'الحسابات العامة والمالية' : 'Accounting & Finance'}
                      </div>
                    )}
                  </button>

                  {/* Accordion Sub-pages Tree */}
                  {isAccountingOpen && !isSidebarCollapsed && (
                    <div className="mt-1 mr-3 pr-2.5 border-r-2 border-[#C87A38]/40 space-y-1 animate-in fade-in duration-200">
                      {accountingSubPages.map(sub => {
                        const SubIcon = sub.icon;
                        const isSubActive = activeModule === sub.id || (sub.id === 'acc_dashboard' && activeModule === 'finance');

                        return (
                          <button
                            key={sub.id}
                            onClick={() => setActiveModule(sub.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-right ${
                              isSubActive
                                ? 'bg-[#C87A38] text-white shadow-md font-black'
                                : 'text-amber-100/70 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <SubIcon className={`w-4 h-4 shrink-0 ${isSubActive ? 'text-white' : 'text-amber-300/80'}`} />
                            <span className="truncate flex-1 text-[11px] leading-tight">
                              {language === 'ar' ? sub.label : sub.labelEn}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Standard Module Items in this section */}
              {section.items.map((module) => {
                const Icon = module.icon;
                const isActive = activeModule === module.id;

                return (
                  <button
                    key={module.id}
                    onClick={() => setActiveModule(module.id)}
                    className={`w-full group relative flex items-center transition-all duration-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold ${
                      isActive
                        ? 'bg-[#C87A38] text-white shadow-lg shadow-[#C87A38]/30 font-black'
                        : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-3'}`}
                  >
                    <Icon
                      className={`transition-transform duration-200 shrink-0 ${
                        isActive ? 'scale-110 text-white' : 'group-hover:scale-105 text-amber-200/80'
                      } ${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`}
                    />

                    {!isSidebarCollapsed && (
                      <span className="text-xs tracking-wide flex-1 text-right truncate">
                        {language === 'ar' ? module.label : module.labelEn}
                      </span>
                    )}

                    {/* Badges */}
                    {module.id === 'notifications' && unreadCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.2 rounded-full shrink-0">
                        {unreadCount}
                      </span>
                    )}

                    {isSidebarCollapsed && (
                      <div className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {language === 'ar' ? module.label : module.labelEn}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Role Footer */}
      <div className="p-3.5 border-t border-white/10 bg-[#23120A] shrink-0">
        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <ShieldCheck className="w-4 h-4 text-[#C87A38] shrink-0" />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-amber-100 truncate">{currentRole.name}</p>
              <p className="text-[10px] text-amber-200/50 truncate">نظام النفاذ المعياري</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title={currentRole.name}>
            <ShieldCheck className="w-5 h-5 text-[#C87A38]" />
          </div>
        )}
      </div>
    </aside>
  );
};
