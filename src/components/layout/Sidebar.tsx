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
  Truck,
  Factory,
  Landmark,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  Globe,
  FolderTree,
  Scale,
  FileText,
  Receipt,
  CreditCard,
  Calendar,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ClipboardCheck,
  History,
  Warehouse,
  ShieldCheck,
  Compass,
  FileSpreadsheet,
  Cpu,
  Boxes,
  AlertTriangle,
  ShoppingCart,
  Gauge,
  SlidersHorizontal,
  CalendarRange,
  Send
} from 'lucide-react';

interface SubMenuItem {
  id: ModuleId;
  label: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

interface MenuGroup {
  id: string;
  title: string;
  titleEn: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SubMenuItem[];
  permissionCheck?: 'finance' | 'inventory' | 'production' | 'customers' | 'sales' | 'settings';
}

const menuGroups: MenuGroup[] = [
  {
    id: 'sales_crm',
    title: 'العملاء والمبيعات',
    titleEn: 'Sales & CRM',
    icon: Users,
    permissionCheck: 'customers',
    items: [
      { id: 'customers', label: 'العملاء وإدارة المتابعة (CRM)', labelEn: 'Customers & Leads', icon: Users },
      { id: 'custom_projects', label: 'مشاريع المطابخ والتفصيل', labelEn: 'Custom Projects Pipeline', icon: Ruler },
      { id: 'sales', label: 'صالة الأثاث الجاهز (POS)', labelEn: 'Ready Furniture & POS', icon: ShoppingBag },
      { id: 'portal', label: 'بوابة متابعة العميل (Portal)', labelEn: 'Customer Portal', icon: Globe },
      { id: 'campaigns', label: 'الحملات التسويقية', labelEn: 'Marketing Campaigns', icon: Sparkles }
    ]
  },
  {
    id: 'tech_office',
    title: 'المكتب الفني والهندسة',
    titleEn: 'Technical Office & BOM',
    icon: Compass,
    permissionCheck: 'production',
    items: [
      { id: 'tech_dashboard', label: 'لوحة تحكم المكتب الفني والـ KPIs', labelEn: 'Tech Office Dashboard', icon: LayoutDashboard },
      { id: 'tech_projects', label: 'مشاريع التفصيل والرفع المساحي', labelEn: 'Engineering Projects & Survey', icon: Ruler },
      { id: 'tech_designs', label: 'المخططات التنفيذية والـ 3D', labelEn: 'CAD & 3D Revisions', icon: FileSpreadsheet },
      { id: 'tech_boms', label: 'تفجير الـ BOM وقوائم التقطيع', labelEn: 'BOM & Unit Cutting Lists', icon: Layers },
      { id: 'tech_releases', label: 'حزم الإفراج الفني للتخطيط', labelEn: 'Release Packages to Planning', icon: ClipboardCheck },
      { id: 'tech_ecr', label: 'أوامر التعديل الهندسي (ECR)', labelEn: 'Engineering Changes (ECR)', icon: History }
    ]
  },
  {
    id: 'planning_mrp',
    title: 'التخطيط وسلاسل الإمداد (MRP)',
    titleEn: 'Planning & MRP',
    icon: CalendarRange,
    permissionCheck: 'production',
    items: [
      { id: 'plan_dashboard', label: 'لوحة تحكم التخطيط والـ KPIs', labelEn: 'Planning Dashboard', icon: LayoutDashboard },
      { id: 'plan_demand', label: 'طلبات التخطيط واحتياج المشاريع', labelEn: 'Planning Demands', icon: Boxes },
      { id: 'plan_mrp', label: 'محرك حساب الاحتياجات (MRP Engine)', labelEn: 'MRP Net Requirements', icon: Cpu },
      { id: 'plan_shortages', label: 'مصفوفة عجز الخامات والنواقص', labelEn: 'Material Shortages Matrix', icon: AlertTriangle },
      { id: 'plan_proposals', label: 'مقترحات الشراء والتشغيل', labelEn: 'Supply & Work Proposals', icon: ShoppingCart },
      { id: 'plan_capacity', label: 'طاقة وسعة مراكز العمل', labelEn: 'Work Center Capacity', icon: Gauge },
      { id: 'plan_schedule', label: 'الجدولة الزمنية العكسية (Gantt)', labelEn: 'Backward Scheduling', icon: Calendar },
      { id: 'plan_mps', label: 'جدول الإنتاج الرئيسي (MPS)', labelEn: 'Master Production Schedule', icon: SlidersHorizontal }
    ]
  },
  {
    id: 'procurement',
    title: 'المشتريات وسلاسل التوريد',
    titleEn: 'Procurement & Sourcing',
    icon: ShoppingBag,
    permissionCheck: 'inventory',
    items: [
      { id: 'proc_dashboard', label: 'لوحة تحكم المشتريات والـ KPIs', labelEn: 'Procurement Dashboard', icon: LayoutDashboard },
      { id: 'proc_requests', label: 'طلبات الشراء والاحتياجات (PR)', labelEn: 'Purchase Requests (PR)', icon: FileText },
      { id: 'proc_rfq', label: 'طلبات عروض الأسعار (RFQ)', labelEn: 'Requests for Quotation', icon: Send },
      { id: 'proc_quotations', label: 'عروض أسعار الموردين والمقارنة', labelEn: 'Quotations & Comparison', icon: Scale },
      { id: 'proc_orders', label: 'أوامر الشراء الرسمية (PO)', labelEn: 'Purchase Orders (PO)', icon: ShoppingCart },
      { id: 'proc_deliveries', label: 'متابعة التوريدات والاستلامات', labelEn: 'Expected Deliveries', icon: Truck },
      { id: 'proc_returns', label: 'مرتجعات المشتريات (Returns)', labelEn: 'Supplier Returns', icon: ArrowLeftRight },
      { id: 'proc_suppliers', label: 'دليل الموردين والمصانع', labelEn: 'Suppliers Directory', icon: Building2 },
      { id: 'proc_prices', label: 'قوائم وتاريخ أسعار الموردين', labelEn: 'Supplier Price Lists', icon: FileSpreadsheet },
      { id: 'proc_reports', label: 'تقارير المشتريات والـ 3-Way Match', labelEn: 'Procurement Reports', icon: BarChart3 }
    ]
  },
  {
    id: 'operations',
    title: 'التصنيع والعمليات',
    titleEn: 'Manufacturing & Ops',
    icon: Factory,
    permissionCheck: 'production',
    items: [
      { id: 'production', label: 'أوامر الإنتاج والورش', labelEn: 'Production & Factory', icon: Factory },
      { id: 'installation', label: 'التركيبات والتسليم بالموقع', labelEn: 'Installation & Delivery', icon: Truck },
      { id: 'products', label: 'كتالوج المنتجات الجاهزة', labelEn: 'Products Catalog', icon: Package },
      { id: 'materials', label: 'مكتبة الخامات والمستلزمات', labelEn: 'Materials Library', icon: Layers },
      { id: 'suppliers', label: 'الموردين وأوامر الشراء', labelEn: 'Suppliers & Vendors', icon: Building2 }
    ]
  },
  {
    id: 'inventory',
    title: 'المخازن والمستودعات',
    titleEn: 'Inventory Master',
    icon: Warehouse,
    permissionCheck: 'inventory',
    items: [
      { id: 'inv_dashboard', label: 'لوحة تحكم وتقييم المخزون', labelEn: 'Inventory Dashboard', icon: LayoutDashboard },
      { id: 'inv_items', label: 'كروت ودليل الأصناف والخامات', labelEn: 'Item Master Catalog', icon: Package },
      { id: 'inv_grn', label: 'أذونات الإضافة المخزنية (GRN)', labelEn: 'Goods Receipt Notes', icon: ArrowDownToLine },
      { id: 'inv_gin', label: 'أذونات وطلبات الصرف (GIN/MRN)', labelEn: 'Goods Issue & Requisitions', icon: ArrowUpFromLine },
      { id: 'inv_stock_card', label: 'كارت الصنف وسجل الحركات', labelEn: 'Stock Card & Ledger', icon: History },
      { id: 'inv_transfers', label: 'التحويلات بين المخازن', labelEn: 'Inter-Warehouse Transfers', icon: ArrowLeftRight },
      { id: 'inv_stocktaking', label: 'الجرد الدوري والتسويات الجردية', labelEn: 'Stocktaking & Adjustments', icon: ClipboardCheck },
      { id: 'inv_warehouses', label: 'إدارة المستودعات والأرفف', labelEn: 'Warehouses & Locations', icon: Warehouse }
    ]
  },
  {
    id: 'accounting',
    title: 'الحسابات العامة والمالية',
    titleEn: 'Accounting & Finance',
    icon: Landmark,
    permissionCheck: 'finance',
    items: [
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
    ]
  },
  {
    id: 'system',
    title: 'إدارة النظام والإعدادات',
    titleEn: 'System & Admin',
    icon: Settings,
    permissionCheck: 'settings',
    items: [
      { id: 'notifications', label: 'الإشعارات والتنبيهات', labelEn: 'Notifications', icon: Bell },
      { id: 'settings', label: 'إعدادات النظام والصلاحيات', labelEn: 'Settings & Security', icon: Settings }
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
    company,
    language,
    notifications
  } = useERP();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Determine initial open groups based on activeModule
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    menuGroups.forEach(group => {
      const hasActiveChild = group.items.some(item => item.id === activeModule) ||
        (group.id === 'procurement' && (activeModule === 'procurement' || activeModule.startsWith('proc_'))) ||
        (group.id === 'accounting' && (activeModule === 'finance' || activeModule.startsWith('acc_'))) ||
        (group.id === 'inventory' && (activeModule === 'inventory' || activeModule.startsWith('inv_'))) ||
        (group.id === 'tech_office' && (activeModule === 'tech_office' || activeModule.startsWith('tech_')));
      initialState[group.id] = hasActiveChild;
    });
    // Default open sales_crm if nothing else is open
    if (!Object.values(initialState).some(Boolean)) {
      initialState['sales_crm'] = true;
    }
    return initialState;
  });

  // Auto-expand group when active module changes
  useEffect(() => {
    menuGroups.forEach(group => {
      const isGroupActive = group.items.some(item => item.id === activeModule) ||
        (group.id === 'procurement' && (activeModule === 'procurement' || activeModule.startsWith('proc_'))) ||
        (group.id === 'accounting' && (activeModule === 'finance' || activeModule.startsWith('acc_'))) ||
        (group.id === 'inventory' && (activeModule === 'inventory' || activeModule.startsWith('inv_'))) ||
        (group.id === 'tech_office' && (activeModule === 'tech_office' || activeModule.startsWith('tech_')));
      
      if (isGroupActive) {
        setOpenGroups(prev => ({ ...prev, [group.id]: true }));
      }
    });
  }, [activeModule]);

  const toggleGroup = (groupId: string, firstItemId?: ModuleId) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      setOpenGroups(prev => ({ ...prev, [groupId]: true }));
      if (firstItemId) {
        setActiveModule(firstItemId);
      }
      return;
    }

    setOpenGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Filter groups and items based on company business model and role permissions
  const filteredGroups = menuGroups.map(group => {
    if (group.permissionCheck && !checkPermission(group.permissionCheck, 'view')) {
      return null;
    }

    const visibleItems = group.items.filter(item => {
      const isSupported = BackendSecurityService.isModuleSupportedByCompany(company, item.id);
      if (!isSupported) return false;
      return checkPermission(item.id, 'view');
    });

    if (visibleItems.length === 0) return null;

    return {
      ...group,
      items: visibleItems
    };
  }).filter((g): g is MenuGroup => g !== null);

  const isDashboardActive = activeModule === 'dashboard';

  return (
    <aside
      className={`h-full flex-shrink-0 z-30 flex flex-col bg-[#1E110B] text-slate-200 transition-all duration-300 shadow-2xl border-l border-white/5 ${
        isSidebarCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Header Brand */}
      <div className="h-18 flex items-center justify-between px-4 border-b border-white/10 bg-[#160B06] shrink-0">
        {!isSidebarCollapsed ? (
          <BrandLogo size="md" variant="dark" showSubtext={true} />
        ) : (
          <div className="mx-auto">
            <BrandLogo size="sm" variant="dark" showSubtext={false} hideText={true} />
          </div>
        )}

        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 text-amber-300 hover:bg-[#C87A38] hover:text-white transition-all shrink-0"
          title={isSidebarCollapsed ? 'توسيع القائمة' : 'طَي القائمة'}
        >
          {isSidebarCollapsed ? (
            language === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            language === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Scope Sub-badge */}
      {!isSidebarCollapsed && (
        <div className="mx-3.5 mt-3 mb-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-[11px] shrink-0">
          <div className="flex items-center gap-1.5 text-amber-200/90 font-bold">
            <Building2 className="w-3.5 h-3.5 text-[#C87A38]" />
            <span>
              {company.businessType === 'furniture_kitchens' && 'أثاث ومطابخ'}
              {company.businessType === 'furniture' && 'أثاث منزلي'}
              {company.businessType === 'kitchens' && 'مطابخ تفصيل'}
            </span>
          </div>
          <span className="text-[10px] font-black text-[#C87A38] bg-[#C87A38]/10 px-2 py-0.5 rounded-md border border-[#C87A38]/20">
            {company.businessModel === 'ready_custom' ? 'جاهز + تفصيل' : company.businessModel === 'ready_made' ? 'جاهز' : 'تفصيل'}
          </span>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-2 custom-scrollbar text-xs">
        
        {/* DIRECT DASHBOARD BUTTON */}
        <button
          onClick={() => setActiveModule('dashboard')}
          className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all ${
            isDashboardActive
              ? 'bg-[#C87A38] text-white shadow-md font-black'
              : 'text-slate-300 hover:bg-white/5 hover:text-white'
          }`}
          title={isSidebarCollapsed ? 'لوحة التحكم والمؤشرات' : undefined}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className={`w-4 h-4 shrink-0 ${isDashboardActive ? 'text-white' : 'text-amber-400'}`} />
            {!isSidebarCollapsed && <span>لوحة التحكم والمؤشرات</span>}
          </div>
        </button>

        <div className="pt-2 pb-1 border-t border-white/5" />

        {/* UNIFIED COLLAPSIBLE MODULE DROPDOWNS */}
        {filteredGroups.map(group => {
          const isGroupActive = group.items.some(item => item.id === activeModule) ||
            (group.id === 'accounting' && (activeModule === 'finance' || activeModule.startsWith('acc_'))) ||
            (group.id === 'inventory' && (activeModule === 'inventory' || activeModule.startsWith('inv_')));
          
          const isOpen = !!openGroups[group.id];
          const GroupIcon = group.icon;
          const firstItem = group.items[0];

          return (
            <div key={group.id} className="space-y-1">
              {/* Main Module Accordion Header */}
              <button
                onClick={() => toggleGroup(group.id, firstItem?.id)}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  isGroupActive
                    ? 'bg-white/10 text-white border border-amber-500/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
                title={isSidebarCollapsed ? group.title : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1 rounded-lg ${isGroupActive ? 'bg-[#C87A38] text-white' : 'bg-white/5 text-amber-400'}`}>
                    <GroupIcon className="w-3.5 h-3.5" />
                  </div>
                  {!isSidebarCollapsed && (
                    <span className={isGroupActive ? 'font-black text-amber-200' : 'font-bold'}>
                      {group.title}
                    </span>
                  )}
                </div>

                {!isSidebarCollapsed && (
                  <div className="flex items-center gap-1.5">
                    {group.id === 'system' && unreadCount > 0 ? (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white font-mono">
                        {unreadCount}
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 text-amber-200/80 font-mono">
                        {group.items.length}
                      </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                )}
              </button>

              {/* Collapsible Sub-menu Dropdown List */}
              {!isSidebarCollapsed && isOpen && (
                <div className="pr-3 pl-1 pt-1 pb-1 space-y-0.5 border-r-2 border-amber-500/20 mr-3">
                  {group.items.map(sub => {
                    const isSubActive = activeModule === sub.id;
                    const SubIcon = sub.icon;
                    const isNotifications = sub.id === 'notifications';

                    return (
                      <button
                        key={sub.id}
                        onClick={() => setActiveModule(sub.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                          isSubActive
                            ? 'bg-[#C87A38] text-white font-black shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-500'}`} />
                          <span className="truncate">{sub.label}</span>
                        </div>

                        {isNotifications && unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white font-mono">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

      </nav>
    </aside>
  );
};

