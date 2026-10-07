import React, { useState, useRef, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import { demoPersonas } from '../../mock/initialData';
import { DemoPersonaId } from '../../types/erp';
import { resetDemoState } from '../../services/demoPersistence';
import {
  MapPin,
  Bell,
  ChevronDown,
  User as UserIcon,
  RotateCcw,
  LogOut,
  Settings,
  Search,
  CheckCircle2,
  Building,
  Warehouse,
  Factory,
  Check,
  Sparkles,
  Menu
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentBranch,
    availableBranches,
    setCurrentBranch,
    currentUser,
    currentRole,
    language,
    toggleLanguage,
    setActiveModule,
    switchPersona,
    activePersonaId,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    notifications,
    markNotificationRead,
    setSelectedProjectId,
    setSelectedCustomerId,
    setSelectedOrderId,
    setSelectedMaterialId,
    setSelectedSupplierId,
    setSelectedProductId,
    loginAsPortalCustomer
  } = useERP();

  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPersonaDropdownOpen, setIsPersonaDropdownOpen] = useState(false);

  const branchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const personaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (branchRef.current && !branchRef.current.contains(event.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (personaRef.current && !personaRef.current.contains(event.target as Node)) {
        setIsPersonaDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'showroom':
        return <Building className="w-4 h-4 text-emerald-600" />;
      case 'warehouse':
        return <Warehouse className="w-4 h-4 text-amber-600" />;
      case 'workshop':
        return <Factory className="w-4 h-4 text-indigo-600" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-600" />;
    }
  };

  const getLocationLabel = (type: string) => {
    switch (type) {
      case 'showroom': return 'معرض مبيعات';
      case 'warehouse': return 'مخزن مركزي';
      case 'workshop': return 'ورشة تصنيع';
      default: return 'فرع';
    }
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <header className="h-16 md:h-18 bg-white border-b border-slate-200/80 shadow-xs flex items-center justify-between px-4 md:px-6 z-20 shrink-0 w-full dir-rtl select-none">
      
      {/* RIGHT SECTION: Branch Selector & Mobile Toggle */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Mobile-only Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-[#361D13] hover:text-white transition-colors"
          title="القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Branch Selector Pill */}
        <div className="relative" ref={branchRef}>
          <button
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 sm:py-2 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 transition-all text-slate-800 font-medium text-xs group"
          >
            <div className="w-7 h-7 rounded-xl bg-[#361D13] text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              {getLocationIcon(currentBranch.type)}
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 text-xs">
                  {currentBranch.name}
                </span>
                {currentBranch.isMain && (
                  <span className="bg-[#C87A38] text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                    رئيسي
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-bold block">
                {getLocationLabel(currentBranch.type)}
              </span>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform ${isBranchDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Branch Dropdown Popover */}
          {isBranchDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-black text-slate-800">الفروع والمنشآت المتاحة</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full">
                  {availableBranches.length}
                </span>
              </div>

              <div className="py-1 space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                {availableBranches.map((branch) => {
                  const isSelected = branch.id === currentBranch.id;

                  return (
                    <button
                      key={branch.id}
                      onClick={() => {
                        setCurrentBranch(branch.id);
                        setIsBranchDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-colors text-right text-xs ${
                        isSelected
                          ? 'bg-[#361D13] text-white font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {getLocationIcon(branch.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-black">{branch.name}</span>
                            {branch.isMain && (
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${isSelected ? 'bg-[#C87A38] text-white' : 'bg-[#C87A38]/15 text-[#C87A38]'}`}>
                                رئيسي
                              </span>
                            )}
                          </div>
                          <p className={`text-[10px] ${isSelected ? 'text-amber-100' : 'text-slate-500'}`}>
                            {getLocationLabel(branch.type)}
                          </p>
                        </div>
                      </div>

                      {isSelected && <Check className="w-4 h-4 text-amber-300" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CENTER SECTION: Global Search Bar */}
      <div className="hidden lg:flex items-center relative max-w-xs xl:max-w-md w-full mx-4">
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder="ابحث بالشفرة، اسم المشروع، أو بيانات العميل..."
          className="w-full pl-4 pr-10 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200/90 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#361D13]/20 transition-all"
        />
      </div>

      {/* LEFT SECTION: Portal Link, Persona, Notifications, Lang & User */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        
        {/* Reset the demo to its original scenario */}
        <button
          onClick={() => { if (window.confirm('إعادة الديمو لبدايته؟ سيتم مسح كل ما تم إدخاله على الشاشات.')) resetDemoState(); }}
          className="p-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 shrink-0"
          title="إعادة الديمو لبدايته"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Customer Portal Button */}
        <button
          onClick={() => setActiveModule('portal')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#361D13] hover:bg-[#23120A] text-white font-black text-xs shadow-md transition-all shrink-0 border border-amber-900/50"
          title="دخول بوابة العملاء التفاعلية"
        >
          <UserIcon className="w-4 h-4 text-[#C87A38]" />
          <span>بوابة العملاء 🌐</span>
        </button>

        {/* Demo Persona / Scenario Switcher */}
        <div className="relative" ref={personaRef}>
          <button
            onClick={() => setIsPersonaDropdownOpen(!isPersonaDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 transition-all font-bold text-xs shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C87A38] shrink-0" />
            <span className="hidden sm:inline text-slate-500 font-normal">السيناريو:</span>
            <span className="font-black text-[#C87A38]">
              {currentUser.fullName.split(' ')[0]}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-amber-700 transition-transform ${isPersonaDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Persona Dropdown */}
          {isPersonaDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-black text-slate-800">اختر شخصية الاختبار (Demo Persona)</span>
                <span className="text-[10px] bg-[#C87A38] text-white font-bold px-2 py-0.5 rounded-full">
                  3 سيناريوهات
                </span>
              </div>

              <div className="py-2 space-y-1.5">
                {demoPersonas.map((persona) => {
                  const isActive = activePersonaId === persona.id && currentUser.id === persona.userId;

                  return (
                    <button
                      key={persona.id}
                      onClick={() => {
                        switchPersona(persona.id as DemoPersonaId);
                        setIsPersonaDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all text-right ${
                        isActive
                          ? 'bg-[#C87A38] text-white font-bold shadow-md'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div>
                        <p className="font-black text-xs">{persona.name}</p>
                        <p className={`text-[10px] ${isActive ? 'text-amber-200' : 'text-[#C87A38]'}`}>
                          {persona.roleTitle}
                        </p>
                      </div>
                      {isActive && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 sm:p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-700 transition-colors"
            title="الإشعارات"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#C87A38] text-white text-[9px] font-black flex items-center justify-center animate-pulse border-2 border-white">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800">التنبيهات والإشعارات الحية</span>
                  <span className="text-[10px] bg-[#C87A38]/15 text-[#C87A38] font-bold px-2.5 py-0.5 rounded-full border border-[#C87A38]/30">
                    {unreadNotifications.length} غير مقروء
                  </span>
                </div>
              </div>

              <div className="py-2 space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                {notifications.slice(0, 6).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markNotificationRead(notif.id);
                      setIsNotificationsOpen(false);
                      if (notif.targetModule === 'custom_projects' && notif.targetId) {
                        setSelectedProjectId(notif.targetId);
                        setActiveModule('custom_projects');
                      } else if (notif.targetModule === 'sales' && notif.targetId) {
                        setSelectedOrderId(notif.targetId);
                        setActiveModule('sales');
                      } else if (notif.targetModule === 'customers' && (notif.customerId || notif.targetId)) {
                        setSelectedCustomerId(notif.customerId || notif.targetId || null);
                        setActiveModule('customers');
                      } else if (notif.targetModule === 'materials' && notif.targetId) {
                        setSelectedMaterialId(notif.targetId);
                        setActiveModule('materials');
                      } else if (notif.targetModule === 'suppliers' && notif.targetId) {
                        setSelectedSupplierId(notif.targetId);
                        setActiveModule('suppliers');
                      } else if (notif.targetModule === 'products' && notif.targetId) {
                        setSelectedProductId(notif.targetId);
                        setActiveModule('products');
                      } else if (notif.targetModule === 'portal' && notif.customerId) {
                        loginAsPortalCustomer(notif.customerId);
                      } else {
                        setActiveModule(notif.targetModule);
                      }
                    }}
                    className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                      notif.isRead
                        ? 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                        : 'bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 text-slate-900 font-bold'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-[#C87A38] shrink-0 mt-1.5" />
                    <div className="space-y-1 flex-1">
                      <p className="font-black text-xs text-slate-900 leading-tight">{notif.title}</p>
                      <p className="text-[11px] text-slate-600 font-normal line-clamp-2">{notif.message}</p>
                      <span className="text-[9px] text-slate-400 font-mono block dir-ltr">{notif.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setActiveModule('notifications');
                  setIsNotificationsOpen(false);
                }}
                className="w-full mt-2 py-2 text-center text-xs font-black bg-slate-100 hover:bg-[#361D13] hover:text-white rounded-2xl text-[#361D13] transition-all"
              >
                عرض واستكشاف كافة الإشعارات ({notifications.length}) ←
              </button>
            </div>
          )}
        </div>

        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="px-2.5 py-1.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-800 text-xs font-black transition-colors shrink-0"
          title="تغيير اللغة"
        >
          {language === 'ar' ? 'EN' : 'عربي'}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 sm:p-1.5 sm:pl-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 transition-all text-slate-800 group"
          >
            <img
              src={currentUser.avatar}
              alt=""
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-[#361D13]/20 shadow-xs shrink-0"
            />
            
            <div className="text-right hidden xl:block">
              <p className="text-xs font-black text-slate-900 leading-tight">
                {currentUser.fullName}
              </p>
              <p className="text-[10px] font-bold text-[#C87A38]">
                {currentRole.name.split(' ')[0]}
              </p>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 hidden sm:block" />
          </button>

          {/* User Menu Panel */}
          {isUserMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in duration-150">
              <div className="p-3 rounded-2xl bg-slate-50 mb-2 border border-slate-100 text-right">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover shadow-xs"
                  />
                  <div>
                    <p className="font-black text-slate-900 text-xs">{currentUser.fullName}</p>
                    <p className="text-[10px] text-slate-500 font-mono" dir="ltr">{currentUser.email}</p>
                    <span className="inline-block mt-1 bg-[#361D13] text-[#C87A38] text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {currentRole.name}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-600">
                  <span className="font-bold text-slate-700">الفروع المصرح بها:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {availableBranches.map(b => (
                      <span key={b.id} className="bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                        {b.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <button
                  onClick={() => {
                    setActiveModule('settings');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-bold"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>إعدادات النظام والحساب</span>
                </button>

                <div className="pt-2 border-t border-slate-100 mt-1">
                  <button
                    onClick={() => {
                      switchPersona('ahmed_owner');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>إعادة الضبط لشخصية (أحمد - Owner)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
