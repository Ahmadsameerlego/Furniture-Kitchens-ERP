// ====================================================
// REWAQ ERP — PROCUREMENT & PURCHASING DASHBOARD VIEW
// High-Impact Actionable KPIs, Urgent Queues & Supplier Intelligence
// ====================================================

import React from 'react';
import { useERP } from '../../context/ERPContext';
import { ProcurementService } from '../../services/procurementService';
import {
  FileText,
  Clock,
  Send,
  Scale,
  ShoppingCart,
  Truck,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Building2,
  Eye,
  ArrowRight,
  Plus,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowDownLeft,
  Filter
} from 'lucide-react';
import { PurchaseRequest, EnterprisePurchaseOrder, RequestForQuotation } from '../../types/procurement';

interface ProcurementDashboardViewProps {
  onNavigateTab: (tabId: string) => void;
  onOpenCreatePR: () => void;
  onOpenCreateRFQ: () => void;
  onOpenCreatePO: () => void;
  onOpenTraceability: (po?: EnterprisePurchaseOrder, pr?: PurchaseRequest) => void;
}

export const ProcurementDashboardView: React.FC<ProcurementDashboardViewProps> = ({
  onNavigateTab,
  onOpenCreatePR,
  onOpenCreateRFQ,
  onOpenCreatePO,
  onOpenTraceability
}) => {
  const {
    purchaseRequests,
    rfqs,
    supplierQuotations,
    enterprisePurchaseOrders,
    approvePurchaseRequest,
    approveEnterprisePurchaseOrder,
    sendPOToSupplier,
    currentUser,
    checkPermission
  } = useERP();

  const kpis = ProcurementService.calculateDashboardKPIs(
    purchaseRequests,
    rfqs,
    supplierQuotations,
    enterprisePurchaseOrders
  );

  const pendingPRs = purchaseRequests.filter(p => p.status === 'pending_approval');
  const posRequiringAction = enterprisePurchaseOrders.filter(
    p => p.status === 'pending_approval' || p.status === 'approved' || p.receivingStatus === 'partially_received'
  );

  // Deliveries due soon (next 48h) or delayed
  const today = new Date();
  const fortyEightHoursFromNow = new Date(Date.now() + 2 * 86400000);

  const delayedDeliveries = enterprisePurchaseOrders.filter(po => {
    if (po.receivingStatus === 'fully_received' || po.status === 'closed' || po.status === 'cancelled') return false;
    return new Date(po.expectedDeliveryDate) < today;
  });

  const dueSoonDeliveries = enterprisePurchaseOrders.filter(po => {
    if (po.receivingStatus === 'fully_received' || po.status === 'closed' || po.status === 'cancelled') return false;
    const expDate = new Date(po.expectedDeliveryDate);
    return expDate >= today && expDate <= fortyEightHoursFromNow;
  });

  const canApprove = checkPermission('inventory', 'approve');

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#361D13] via-[#4A281A] to-[#23120A] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#C87A38]/30 text-[#E09F67] border border-[#C87A38]/40 rounded-full text-xs font-black">
                إدارة المشتريات وسلاسل التوريد (Procurement & Sourcing)
              </span>
            </div>
            <h1 className="text-2xl font-black mt-2 text-white flex items-center gap-2">
              لوحة التحكم والعمليات الشرائية
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              تأمين خامات ومستلزمات الإنتاج والمشاريع بأفضل الأسعار وأعلى سرعة توريد مع الربط الكامل بالتخطيط والمخازن والحسابات.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenTraceability()}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#C87A38]" />
              <span>مستكشف التتبع (Traceability)</span>
            </button>
            <button
              onClick={onOpenCreatePR}
              className="px-4 py-2.5 bg-[#C87A38] hover:bg-[#B3682B] text-white rounded-xl font-black text-xs transition-all flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>طلب شراء جديد (PR)</span>
            </button>
            <button
              onClick={onOpenCreateRFQ}
              className="px-4 py-2.5 bg-white text-[#361D13] hover:bg-slate-100 rounded-xl font-black text-xs transition-all flex items-center gap-2 shadow-md"
            >
              <Send className="w-4 h-4 text-[#C87A38]" />
              <span>طلب تسعير (RFQ)</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-[#C87A38]/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 11 Actionable KPIs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* KPI 1: Open PRs */}
        <div 
          onClick={() => onNavigateTab('proc_requests')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-[#C87A38] cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold">طلبات شراء مفتوحة</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis.openPurchaseRequests}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">طلبات جارية وقيد التنفيذ</div>
        </div>

        {/* KPI 2: Pending PR Approvals */}
        <div 
          onClick={() => onNavigateTab('proc_requests')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-amber-500 cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold">بانتظار اعتماد الـ PR</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{kpis.pendingPRApprovals}</div>
          <div className="text-[10px] text-amber-600 mt-1 font-bold">تتطلب مراجعة فورية</div>
        </div>

        {/* KPI 3: Active RFQs */}
        <div 
          onClick={() => onNavigateTab('proc_rfq')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-sky-500 cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold">طلبات تسعير نشطة</span>
            <Send className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis.activeRFQs}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">مرسلة للموردين</div>
        </div>

        {/* KPI 4: Quotes Awaiting Comparison */}
        <div 
          onClick={() => onNavigateTab('proc_quotations')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-purple-500 cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold">عروض بانتظار المقارنة</span>
            <Scale className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600">{kpis.quotesAwaitingComparison}</div>
          <div className="text-[10px] text-purple-600 mt-1 font-bold">جاهزة لاختيار المورد</div>
        </div>

        {/* KPI 5: POs Awaiting Approval */}
        <div 
          onClick={() => onNavigateTab('proc_orders')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-rose-500 cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold">أوامر بانتظار الاعتماد</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">{kpis.posAwaitingApproval}</div>
          <div className="text-[10px] text-rose-600 mt-1 font-bold">أوامر شراء PO جديدة</div>
        </div>

        {/* KPI 6: Open Purchase Orders */}
        <div 
          onClick={() => onNavigateTab('proc_orders')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-blue-500 cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold">أوامر شراء جارية</span>
            <ShoppingCart className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis.openPurchaseOrders}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">قيد التوريد والتنفيذ</div>
        </div>

        {/* KPI 7: Expected Deliveries */}
        <div 
          onClick={() => onNavigateTab('proc_deliveries')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-cyan-500 cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold">توريدات هذا الأسبوع</span>
            <Truck className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-cyan-700">{kpis.expectedDeliveriesThisWeek}</div>
          <div className="text-[10px] text-cyan-600 mt-1 font-medium">شحنات متوقعة بالمخزن</div>
        </div>

        {/* KPI 8: Delayed POs */}
        <div 
          onClick={() => onNavigateTab('proc_deliveries')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-red-500 cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold">توريدات متأخرة</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-red-600">{kpis.delayedPurchaseOrders}</div>
          <div className="text-[10px] text-red-600 mt-1 font-bold">تجاوزت التاريخ المتفق</div>
        </div>

        {/* KPI 9: Partially Received POs */}
        <div 
          onClick={() => onNavigateTab('proc_deliveries')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-amber-500 cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold">مستلمة جزئياً</span>
            <ArrowDownLeft className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis.partiallyReceivedPOs}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">بانتظار باقي الدفعات</div>
        </div>

        {/* KPI 10: Completed Purchases */}
        <div 
          onClick={() => onNavigateTab('proc_orders')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-emerald-500 cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold">مشتريات مكتملة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{kpis.completedPurchasesMonth}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">خلال الشهر الحالي</div>
        </div>

        {/* KPI 11 & 12: Spend Figures */}
        <div className="col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-xs border border-slate-700 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">إجمالي قيمة المشتريات (الشهر الحالي)</span>
            <DollarSign className="w-4 h-4 text-[#C87A38]" />
          </div>
          <div className="text-xl font-black text-emerald-400 my-1">
            {kpis.totalSpendMonthEGP.toLocaleString()} ج.م
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700/60">
            <span>نسبة الالتزام بالمواعيد: <strong className="text-white">{kpis.onTimeDeliveryRatePercent}%</strong></span>
            <span>متوسط التوريد: <strong className="text-white">{kpis.averageLeadTimeDays} يوم</strong></span>
          </div>
        </div>

      </div>

      {/* Main Actionable Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Widget 1: Pending PR Approvals Queue */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">طلبات الشراء بانتظار الاعتماد (Pending PRs)</h3>
                <p className="text-[11px] text-slate-500">طلبات واردة من التخطيط والورش والمخازن بانتظار موافقة مدير المشتريات</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('proc_requests')}
              className="text-xs text-[#C87A38] hover:text-[#361D13] font-bold flex items-center gap-1 transition-colors"
            >
              <span>عرض الكل ({pendingPRs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingPRs.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">لا توجد طلبات شراء معلقة حالياً</p>
              <p className="text-[11px] text-slate-400 mt-0.5">جميع طلبات الأقسام تم اعتمادها أو معالجتها بنجاح</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPRs.slice(0, 3).map(pr => (
                <div key={pr.id} className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-[#C87A38]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-slate-900">{pr.prNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        pr.priority === 'urgent' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {pr.priority === 'urgent' ? 'عاجل' : 'أولوية عالية'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">من: {pr.requesterName} ({pr.department})</span>
                    </div>
                    <p className="text-xs font-black text-slate-800 mt-1 line-clamp-1">
                      {pr.items[0]?.itemName} {pr.items.length > 1 ? `(+${pr.items.length - 1} بنود أخرى)` : ''}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span>القيمة: <strong className="text-slate-800 font-mono">{pr.totalEstimatedValue.toLocaleString()} ج.م</strong></span>
                      <span>•</span>
                      <span>تاريخ الاحتياج: <strong className="text-slate-800">{pr.requiredDate}</strong></span>
                      {pr.projectName && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 font-bold">{pr.projectNumber}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {canApprove && (
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => approvePurchaseRequest(pr.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>اعتماد</span>
                      </button>
                      <button
                        onClick={() => onNavigateTab('proc_requests')}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-colors"
                      >
                        تفاصيل
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Widget 2: POs Requiring Action */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">أوامر الشراء التي تتطلب إجراء (Actionable POs)</h3>
                <p className="text-[11px] text-slate-500">أوامر بانتظار الاعتماد أو الإرسال للمورد أو استكمال التوريد</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('proc_orders')}
              className="text-xs text-[#C87A38] hover:text-[#361D13] font-bold flex items-center gap-1 transition-colors"
            >
              <span>عرض الكل ({posRequiringAction.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {posRequiringAction.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">جميع أوامر الشراء منتظمة ومحدثة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posRequiringAction.slice(0, 3).map(po => {
                const statusBadge = ProcurementService.getPOStatusBadge(po.status);
                return (
                  <div key={po.id} className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-[#C87A38]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-slate-900">{po.poNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                          {statusBadge.label}
                        </span>
                        <span className="text-[11px] text-slate-600 font-bold">{po.supplierName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span>الإجمالي: <strong className="text-slate-800 font-mono">{po.grandTotal.toLocaleString()} ج.م</strong></span>
                        <span>•</span>
                        <span>موعد التسليم: <strong className="text-slate-800">{po.expectedDeliveryDate}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {po.status === 'pending_approval' && canApprove && (
                        <button
                          onClick={() => approveEnterprisePurchaseOrder(po.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>اعتماد PO</span>
                        </button>
                      )}
                      {po.status === 'approved' && (
                        <button
                          onClick={() => sendPOToSupplier(po.id)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>إرسال للمورد</span>
                        </button>
                      )}
                      <button
                        onClick={() => onNavigateTab('proc_orders')}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-colors"
                      >
                        تفاصيل
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Deliveries Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Delayed & Due Soon Deliveries */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">مراقبة وصول الشحنات والتوريدات (Delivery Tracking)</h3>
                <p className="text-[11px] text-slate-500">الشحنات المتأخرة وتلك المتوقع وصولها خلال 48 ساعة</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('proc_deliveries')}
              className="text-xs text-[#C87A38] hover:text-[#361D13] font-bold flex items-center gap-1 transition-colors"
            >
              <span>لوحة التوريدات الكاملة</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Delayed Card */}
            <div className="p-4 rounded-2xl border border-red-200 bg-red-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  شحنات متأخرة عن الموعد ({delayedDeliveries.length})
                </span>
              </div>
              {delayedDeliveries.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">لا توجد شحنات متأخرة حالياً (التوريد منتظم 100%)</p>
              ) : (
                <div className="space-y-2">
                  {delayedDeliveries.slice(0, 2).map(po => (
                    <div key={po.id} className="p-2.5 bg-white rounded-xl border border-red-100 shadow-2xs text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="font-mono text-slate-900">{po.poNumber}</span>
                        <span className="text-red-600 font-bold">متأخر {Math.ceil((Date.now() - new Date(po.expectedDeliveryDate).getTime()) / 86400000)} يوم</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{po.supplierName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Due Soon Card */}
            <div className="p-4 rounded-2xl border border-cyan-200 bg-cyan-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-cyan-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-600" />
                  شحنات متوقعة خلال 48 ساعة ({dueSoonDeliveries.length})
                </span>
              </div>
              {dueSoonDeliveries.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">لا توجد شحنات مستحقة خلال اليومين القادمين</p>
              ) : (
                <div className="space-y-2">
                  {dueSoonDeliveries.slice(0, 2).map(po => (
                    <div key={po.id} className="p-2.5 bg-white rounded-xl border border-cyan-100 shadow-2xs text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="font-mono text-slate-900">{po.poNumber}</span>
                        <span className="text-cyan-700 font-bold">{po.expectedDeliveryDate}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{po.supplierName} • {po.warehouseName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Quick Suppliers Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">أداء الموردين المعتمدين</h3>
                <p className="text-[11px] text-slate-500">حجم المشتريات ومستوى الالتزام</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('proc_suppliers')}
              className="text-xs text-[#C87A38] hover:text-[#361D13] font-bold"
            >
              الدليل
            </button>
          </div>

          <div className="space-y-3">
            {[
              { name: 'شركة الأخشاب العالمية', spend: '180,000 ج.م', rate: 98, onTime: '5 أيام' },
              { name: 'مصنع الصفوة للمفصلات', spend: '48,000 ج.م', rate: 95, onTime: '3 أيام' },
              { name: 'شركة المودرن للأخشاب', spend: '82,000 ج.م', rate: 92, onTime: '7 أيام' }
            ].map((sup, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{sup.name}</span>
                  <span className="text-[10px] text-slate-400">توريد: {sup.onTime}</span>
                </div>
                <div className="text-left">
                  <span className="font-mono font-bold text-slate-800 block">{sup.spend}</span>
                  <span className="text-[10px] text-emerald-600 font-bold">التزام {sup.rate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
