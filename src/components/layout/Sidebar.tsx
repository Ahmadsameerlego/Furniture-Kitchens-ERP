import React from 'react';
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
  ShieldCheck,
  Building2,
  Lock,
  Globe
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
      { id: 'custom_projects', label: 'المشاريع والتفصيل', labelEn: 'Custom Projects', icon: Ruler },
      { id: 'production', label: 'الإنتاج والورش', labelEn: 'Production & Workshop', icon: Factory },
      { id: 'inventory', label: 'المخزون والحركات', labelEn: 'Inventory & Stock', icon: Boxes },
      { id: 'installation', label: 'التركيبات والتسليم', labelEn: 'Installation & Handover', icon: Truck },
      { id: 'suppliers', label: 'الموردين والشركات', labelEn: 'Suppliers', icon: Building2 }
    ]
  },
  {
    title: 'المالية والتقارير',
    titleEn: 'FINANCE',
    items: [
      { id: 'finance', label: 'المالية والحسابات', labelEn: 'Finance & Accounts', icon: Landmark },
      { id: 'reports', label: 'التقارير التحليلية', labelEn: 'Reports', icon: BarChart3 }
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Filter visible modules: Visible = Business Configuration + Role Permissions + Branch Access
  const accessibleSections = sidebarSections.map(section => {
    const visibleItems = section.items.filter(item => {
      // 1. Business Configuration Filter
      const isSupportedByBusiness = BackendSecurityService.isModuleSupportedByCompany(company, item.id);
      if (!isSupportedByBusiness) return false;

      // 2. Role Permissions Filter
      const isAllowedByRole = checkPermission(item.id, 'view');
      return isAllowedByRole;
    });

    return { ...section, items: visibleItems };
  }).filter(section => section.items.length > 0); // Hide empty sections

  return (
    <aside
      className={`h-full flex-shrink-0 z-30 flex flex-col bg-[#1C352D] text-white transition-all duration-300 shadow-2xl border-l border-white/10 ${
        isSidebarCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-emerald-900/50 bg-[#142921] shrink-0">
        {!isSidebarCollapsed ? (
          <BrandLogo size="md" variant="dark" showSubtext={true} />
        ) : (
          <div className="mx-auto">
            <BrandLogo size="sm" variant="dark" showSubtext={false} hideText={true} />
          </div>
        )}

        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-xl bg-white/10 text-emerald-200 hover:bg-[#E06F28] hover:text-white transition-all shadow-sm shrink-0"
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
            <Building2 className="w-4 h-4 text-[#E06F28]" />
            <span className="text-xs font-bold text-emerald-100">
              {company.businessType === 'furniture_kitchens' && 'أثاث ومطابخ'}
              {company.businessType === 'furniture' && 'أثاث فقط'}
              {company.businessType === 'kitchens' && 'مطابخ فقط'}
            </span>
          </div>
          <span className="text-[10px] font-black text-[#E06F28] bg-[#E06F28]/15 px-2 py-0.5 rounded-lg border border-[#E06F28]/30">
            {company.businessModel === 'ready_custom' && 'جاهز + تفصيل'}
            {company.businessModel === 'ready_made' && 'جاهز فقط'}
            {company.businessModel === 'custom_made' && 'تفصيل فقط'}
          </span>
        </div>
      )}

      {/* Sectioned Module Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar">
        {accessibleSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isSidebarCollapsed && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-black tracking-wider text-emerald-300/60 uppercase">
                {language === 'ar' ? section.title : section.titleEn}
              </div>
            )}

            {section.items.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;

              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`w-full group relative flex items-center transition-all duration-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold ${
                    isActive
                      ? 'bg-[#E06F28] text-white shadow-lg shadow-[#E06F28]/30 font-black'
                      : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
                  } ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-3'}`}
                >
                  <Icon
                    className={`transition-transform duration-200 shrink-0 ${
                      isActive ? 'scale-110 text-white' : 'group-hover:scale-105 text-emerald-200/80'
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
        ))}
      </nav>

      {/* Role Footer */}
      <div className="p-3.5 border-t border-emerald-900/50 bg-[#142921] shrink-0">
        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <ShieldCheck className="w-4 h-4 text-[#E06F28] shrink-0" />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-emerald-100 truncate">{currentRole.name}</p>
              <p className="text-[10px] text-emerald-300/60 truncate">نظام النفاذ المعياري</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title={currentRole.name}>
            <ShieldCheck className="w-5 h-5 text-[#E06F28]" />
          </div>
        )}
      </div>
    </aside>
  );
};
