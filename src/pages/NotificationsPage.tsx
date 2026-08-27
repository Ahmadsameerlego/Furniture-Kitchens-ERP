import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { SystemNotification } from '../types/erp';
import {
  Bell,
  AlertTriangle,
  ArrowLeftRight,
  PackageCheck,
  DollarSign,
  CheckCircle2,
  ChevronLeft,
  Ruler,
  Layers,
  FileText,
  Factory,
  Truck,
  Sparkles,
  User,
  Building,
  CheckCheck
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    setSelectedProjectId,
    setSelectedCustomerId,
    setSelectedOrderId,
    setSelectedMaterialId,
    setSelectedSupplierId,
    setSelectedProductId,
    loginAsPortalCustomer,
    setActiveModule,
    showToast
  } = useERP();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'projects' | 'payments' | 'inventory' | 'production'>('all');

  const handleNotificationClick = (notif: SystemNotification) => {
    markNotificationRead(notif.id);

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
  };

  const markAllAsRead = () => {
    notifications.forEach(n => {
      if (!n.isRead) markNotificationRead(n.id);
    });
    showToast('تم تحديد جميع الإشعارات كمقروءة', 'info');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'site_visit':
        return <Ruler className="w-5 h-5 text-indigo-600" />;
      case 'payment_due':
      case 'payment_overdue':
        return <DollarSign className="w-5 h-5 text-amber-600" />;
      case 'design_review':
        return <Layers className="w-5 h-5 text-[#E06F28]" />;
      case 'quotation_review':
      case 'contract_signed':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      case 'low_stock':
      case 'material_shortage':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'purchase_received':
        return <PackageCheck className="w-5 h-5 text-blue-600" />;
      case 'production_created':
      case 'production_completed':
        return <Factory className="w-5 h-5 text-purple-600" />;
      case 'installation_scheduled':
        return <Truck className="w-5 h-5 text-teal-600" />;
      case 'pending_transfer':
        return <ArrowLeftRight className="w-5 h-5 text-cyan-600" />;
      case 'large_expense':
        return <Building className="w-5 h-5 text-slate-700" />;
      case 'handover_completed':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getNotificationIconBg = (type: string) => {
    switch (type) {
      case 'low_stock':
      case 'material_shortage':
      case 'payment_overdue':
        return 'bg-rose-100/80 border-rose-200';
      case 'payment_due':
      case 'design_review':
        return 'bg-amber-100/80 border-amber-200';
      case 'quotation_review':
      case 'contract_signed':
      case 'production_completed':
        return 'bg-emerald-100/80 border-emerald-200';
      case 'production_created':
        return 'bg-purple-100/80 border-purple-200';
      case 'installation_scheduled':
      case 'site_visit':
        return 'bg-indigo-100/80 border-indigo-200';
      default:
        return 'bg-slate-100 border-slate-200';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'projects') return ['custom_projects', 'portal'].includes(n.targetModule) || ['site_visit', 'design_review', 'quotation_review', 'contract_signed'].includes(n.type);
    if (activeFilter === 'payments') return ['sales', 'finance'].includes(n.targetModule) || ['payment_due', 'payment_overdue', 'large_expense'].includes(n.type);
    if (activeFilter === 'inventory') return ['materials', 'inventory', 'suppliers'].includes(n.targetModule) || ['low_stock', 'purchase_received', 'pending_transfer'].includes(n.type);
    if (activeFilter === 'production') return ['production', 'installation'].includes(n.targetModule) || ['production_created', 'production_completed', 'installation_scheduled', 'material_shortage'].includes(n.type);
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 dir-rtl">
      
      {/* Page Top Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1C352D] text-[#E06F28] flex items-center justify-center shadow-md">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">مركز الإشعارات والتنبيهات الحية (System Notifications)</h1>
                {unreadCount > 0 && (
                  <span className="bg-[#E06F28]/15 text-[#E06F28] text-xs font-black px-3 py-1 rounded-full border border-[#E06F28]/30">
                    {unreadCount} تنبيه جديد
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                سجل إشعارات المعاينات، التصميمات الـ 3D، استحقاق الأقساط، الورشة، ونقص الخامات بالمخازن
              </p>
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-2xl border border-slate-200 transition-all flex items-center gap-2 shrink-0"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>تحديد الكل كمقروء</span>
          </button>
        )}
      </div>

      {/* Categories Filter Tabs */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-1.5 text-xs font-bold">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-2xl transition-all ${
            activeFilter === 'all'
              ? 'bg-[#1C352D] text-white font-black shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          كل الإشعارات ({notifications.length})
        </button>

        <button
          onClick={() => setActiveFilter('unread')}
          className={`px-4 py-2 rounded-2xl transition-all ${
            activeFilter === 'unread'
              ? 'bg-[#E06F28] text-white font-black shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          غير المقروءة ({unreadCount})
        </button>

        <button
          onClick={() => setActiveFilter('projects')}
          className={`px-4 py-2 rounded-2xl transition-all ${
            activeFilter === 'projects'
              ? 'bg-[#1C352D] text-white font-black shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          المشاريع والتصميمات 3D 📐
        </button>

        <button
          onClick={() => setActiveFilter('payments')}
          className={`px-4 py-2 rounded-2xl transition-all ${
            activeFilter === 'payments'
              ? 'bg-[#1C352D] text-white font-black shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          الأقساط والمالية 💰
        </button>

        <button
          onClick={() => setActiveFilter('inventory')}
          className={`px-4 py-2 rounded-2xl transition-all ${
            activeFilter === 'inventory'
              ? 'bg-[#1C352D] text-white font-black shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          الخامات والمخزون 📦
        </button>

        <button
          onClick={() => setActiveFilter('production')}
          className={`px-4 py-2 rounded-2xl transition-all ${
            activeFilter === 'production'
              ? 'bg-[#1C352D] text-white font-black shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          الورشة والتركيبات 🏭
        </button>
      </div>

      {/* Main Notifications Feed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Bell className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-bold">لا توجد إشعارات تطابق التصفية المختارة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notif => {
              const iconBgClass = getNotificationIconBg(notif.type);

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group p-4 rounded-3xl border flex items-center justify-between gap-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    notif.isRead
                      ? 'bg-slate-50/60 border-slate-200 text-slate-600 hover:border-slate-300'
                      : 'bg-gradient-to-r from-amber-50/90 via-white to-amber-50/40 border-amber-200 text-slate-900 font-bold shadow-xs hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Icon Badge */}
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs ${iconBgClass}`}>
                      {getNotificationIcon(notif.type)}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-sm text-slate-900 group-hover:text-[#E06F28] transition-colors">
                          {notif.title}
                        </p>

                        {!notif.isRead && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#E06F28] animate-pulse"></span>
                        )}

                        {notif.branchName && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-200 font-bold">
                            {notif.branchName}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-700 leading-relaxed font-medium">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                        <span>{notif.timestamp}</span>
                        <span>•</span>
                        <span className="text-slate-500 font-bold">انقر للفتح والمتابعة المباشرة</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-[#1C352D] group-hover:text-white text-xs font-bold text-slate-700 transition-all shrink-0">
                    <span>متابعة Record</span>
                    <ChevronLeft className="w-4 h-4 text-[#E06F28]" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
