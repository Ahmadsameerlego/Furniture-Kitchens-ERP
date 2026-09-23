import React from 'react';
import { useERP } from '../context/ERPContext';
import {
  ShoppingBag,
  Truck,
  DollarSign,
  TrendingUp,
  PackageCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const ReadySalesDashboardPage: React.FC = () => {
  const { orders, paymentSchedules, availableBranches, setActiveModule } = useERP();

  // Filter orders by authorized branches
  const authorizedOrders = orders.filter(o => availableBranches.some(b => b.id === o.branchId));

  let totalSalesMonth = 0;
  let totalGrossProfit = 0;
  let totalOutstanding = 0;
  let readyForDeliveryCount = 0;
  let deliveredCount = 0;
  let pendingCount = 0;

  authorizedOrders.forEach(o => {
    if (o.orderStatus !== 'cancelled') {
      totalSalesMonth += o.orderTotal;
      totalGrossProfit += o.grossProfit;
      totalOutstanding += o.remainingBalance;
    }

    if (o.deliveryInfo.deliveryStatus === 'ready_for_delivery') {
      readyForDeliveryCount += 1;
    } else if (o.deliveryInfo.deliveryStatus === 'delivered') {
      deliveredCount += 1;
    } else if (o.orderStatus === 'preparing' || o.orderStatus === 'confirmed') {
      pendingCount += 1;
    }
  });

  const overdueCount = paymentSchedules.filter(s => s.status === 'overdue').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">مؤشرات أداء مبيعات الأثاث الجاهز (Ready Sales Overview)</h1>
            <span className="bg-[#361D13] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              تتبع لحظي للمبيعات والتسليم والأرباح
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ملخص مباشر للطلبات، المبالغ المحصلة، المنتجات الجاهزة للتسليم، وإجمالي مجمل أرباح النشاط
          </p>
        </div>

        <button
          onClick={() => setActiveModule('sales')}
          className="px-5 py-2.5 bg-[#361D13] hover:bg-[#23120A] text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4 text-[#C87A38]" />
          <span>فتح قائمة الطلبات التفصيلية</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-right">
        
        {/* Card 1: Total Sales */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">إجمالي مبيعات الفترة</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {totalSalesMonth.toLocaleString('ar-EG')} <span className="text-xs text-slate-500 font-normal">ج.م</span>
          </p>
          <p className="text-[11px] text-slate-500">{authorizedOrders.length} طلبات مبيعات مؤكدة</p>
        </div>

        {/* Card 2: Gross Profit */}
        <div className="p-6 rounded-3xl bg-emerald-950 text-white shadow-md space-y-2">
          <div className="flex items-center justify-between text-emerald-200">
            <span className="text-xs font-bold">إجمالي مجمل الربح (Gross Profit)</span>
            <div className="w-9 h-9 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-300 font-mono">
            +{totalGrossProfit.toLocaleString('ar-EG')} <span className="text-xs text-emerald-200 font-normal">ج.م</span>
          </p>
          <p className="text-[11px] text-emerald-200/80">محسوب بناءً على التكلفة الفعلية للقطع</p>
        </div>

        {/* Card 3: Ready for Delivery (CRITICAL DISTINCTION) */}
        <div className="p-6 rounded-3xl bg-white border border-indigo-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-indigo-900">جاهز للتسليم (بالمعرض/المخزن)</span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-950 font-mono">
            {readyForDeliveryCount} <span className="text-xs text-slate-500 font-normal">طلبات جاهزة</span>
          </p>
          <p className="text-[11px] text-indigo-800 font-medium">في انتظار استلام العميل والتأكيد</p>
        </div>

        {/* Card 4: Delivered */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">تم التسليم الفعلي للعميل</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {deliveredCount} <span className="text-xs text-slate-500 font-normal">طلبات مسلمة</span>
          </p>
          <p className="text-[11px] text-emerald-700 font-bold">تم خفض الكمية المحجوزة بالمخزن</p>
        </div>

      </div>

      {/* Second Row: Outstanding Payments & Overdue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900">المستحق غير المسدد من العملاء</h3>
            <span className="text-xs text-slate-500 font-mono font-bold">
              {totalOutstanding.toLocaleString('ar-EG')} ج.م
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            مجموع مبالغ الأقساط والمتبقي غير المحصل بعد بالطلبات الجارية.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 space-y-3 text-rose-900">
          <div className="flex items-center justify-between pb-2 border-b border-rose-200/80">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-black text-rose-950">الأقساط المتأخرة المستحقة</h3>
            </div>
            <span className="bg-rose-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full">
              {overdueCount} أقساط متأخرة
            </span>
          </div>
          <p className="text-xs text-rose-800 leading-relaxed">
            أقساط تجاوزت تاريخ الاستحقاق المحدد ويتطلب التواصل مع العميل للتحصيل.
          </p>
        </div>

      </div>

    </div>
  );
};
