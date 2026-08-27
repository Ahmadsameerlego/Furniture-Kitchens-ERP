import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { ReadySalesService } from '../services/readySalesService';
import {
  ArrowRight,
  ShoppingBag,
  Truck,
  DollarSign,
  User,
  Building,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Package,
  FileText,
  MessageSquare
} from 'lucide-react';
import { PaymentRecordModal } from '../components/modals/PaymentRecordModal';
import { OrderDeliveryModal } from '../components/modals/OrderDeliveryModal';

interface OrderDetailsPageProps {
  orderId: string;
  onBack: () => void;
}

export const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ orderId, onBack }) => {
  const {
    orders,
    payments,
    paymentSchedules,
    recordCustomerPayment,
    updateDeliveryStatus,
    setSelectedCustomerId,
    setActiveModule
  } = useERP();

  const order = orders.find(o => o.id === orderId);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

  if (!order) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
        <p className="text-slate-500 font-bold text-sm">عفواً، لم يتم العثور على طلب المبيعات المطلوبة</p>
        <button onClick={onBack} className="px-4 py-2 bg-[#1C352D] text-white text-xs font-bold rounded-xl">
          العودة لقائمة الطلبات
        </button>
      </div>
    );
  }

  const orderPayments = payments.filter(p => p.orderId === order.id);
  const orderSchedules = paymentSchedules.filter(s => s.orderId === order.id);

  const orderStatusMeta = ReadySalesService.getOrderStatusMeta(order.orderStatus);
  const deliveryStatusMeta = ReadySalesService.getDeliveryStatusMeta(order.deliveryInfo.deliveryStatus);
  const paymentStatusMeta = ReadySalesService.getPaymentStatusMeta(order.paymentStatus);

  return (
    <div className="space-y-6">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-xs transition-all"
        >
          <ArrowRight className="w-4 h-4 text-[#1C352D]" />
          <span>العودة لقائمة طلبات المبيعات</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <DollarSign className="w-4 h-4" />
            <span>تسجيل تحصيل / قسط</span>
          </button>

          <button
            onClick={() => setIsDeliveryModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-[#1C352D] hover:bg-[#142921] text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Truck className="w-4 h-4 text-[#E06F28]" />
            <span>تحديث حالة التسليم والتوصيل</span>
          </button>
        </div>
      </div>

      {/* Header 360 Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900">طلب المبيعات: {order.orderNumber}</h1>

              <span className={`px-3 py-1 rounded-xl text-xs font-black border ${orderStatusMeta.bgClass} ${orderStatusMeta.textClass} ${orderStatusMeta.borderClass}`}>
                {orderStatusMeta.label}
              </span>

              {/* CRITICAL DISTINCTION BADGE */}
              <span className={`px-3 py-1 rounded-xl text-xs font-black border ${deliveryStatusMeta.bgClass} ${deliveryStatusMeta.textClass} ${deliveryStatusMeta.borderClass}`}>
                {deliveryStatusMeta.label}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600 font-medium flex-wrap">
              <span>
                العميل: {' '}
                <button
                  onClick={() => {
                    setSelectedCustomerId(order.customerId);
                    setActiveModule('customers');
                  }}
                  className="font-black text-slate-900 underline hover:text-[#E06F28]"
                >
                  {order.customerName} ({order.customerPhone})
                </button>
              </span>

              <span>الفرع: <strong className="text-slate-900">{order.branchName}</strong></span>
              <span>المبيعات: <strong className="text-slate-900">{order.salesUserName}</strong></span>
            </div>
          </div>

          {/* Profitability Card (Section 19) */}
          <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-2 text-xs min-w-[260px] shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-emerald-200 font-bold">إجمالي سعر البيع:</span>
              <span className="font-black text-white text-base font-mono">{order.orderTotal.toLocaleString('ar-EG')} ج.م</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-emerald-900">
              <span className="text-emerald-200 font-bold">التكلفة الفعلية للشراء:</span>
              <span className="font-bold text-amber-300 font-mono">{order.totalPurchaseCost.toLocaleString('ar-EG')} ج.م</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-emerald-900">
              <span className="font-bold text-white">هامش الربح المحقق (Gross Profit):</span>
              <span className="font-black text-[#E06F28] text-sm font-mono">+{order.grossProfit.toLocaleString('ar-EG')} ج.م</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid: Items & Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Line Items Table & Delivery Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Items Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>المنتجات والأصناف المحجوزة بالطلب</span>
              <span className="text-xs text-slate-500 font-normal">{order.items.length} أصناف</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">المنتج والمواصفة</th>
                    <th className="p-3 text-center">الكمية</th>
                    <th className="p-3 text-left">سعر البيع</th>
                    <th className="p-3 text-left">التكلفة الفعلية</th>
                    <th className="p-3 text-left">إجمالي البيع</th>
                    <th className="p-3 text-left">الربح</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-medium">
                  {order.items.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <p className="font-black text-slate-900">{item.productName}</p>
                        {item.variantName && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                            {item.variantName}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-900">{item.quantity}</td>
                      <td className="p-3 text-left font-mono">{item.unitSellingPrice.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3 text-left font-mono text-amber-800">{item.actualPurchaseCost.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3 text-left font-bold text-slate-900 font-mono">{item.totalSellingPrice.toLocaleString('ar-EG')} ج.م</td>
                      <td className="p-3 text-left font-black text-emerald-700 font-mono">+{item.itemGrossProfit.toLocaleString('ar-EG')} ج.م</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delivery & Address Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#1C352D]" />
              <span>تفاصيل العنوان واستلام التوصيل</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold block">حالة التسليم الفعلي:</span>
                <span className={`inline-block mt-1 font-black px-2.5 py-0.5 rounded-lg border ${deliveryStatusMeta.bgClass} ${deliveryStatusMeta.textClass} ${deliveryStatusMeta.borderClass}`}>
                  {deliveryStatusMeta.label}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-bold block">تاريخ التسليم المجدول/الفعلي:</span>
                <span className="font-bold text-slate-900">
                  {order.deliveryInfo.actualDeliveryDate || order.deliveryInfo.scheduledDate || 'غير محدد'}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-400 font-bold block">عنوان الاستليم التفصيلي:</span>
                <span className="font-bold text-slate-800">{order.deliveryInfo.deliveryAddress}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Payments & Schedules */}
        <div className="space-y-6">
          
          {/* Payment Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">ملخص المدفوعات والمتبقي</h3>
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${paymentStatusMeta.bgClass} ${paymentStatusMeta.textClass}`}>
                {paymentStatusMeta.label}
              </span>
            </div>

            <div className="space-y-2 text-xs font-bold">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">العربون الأولي:</span>
                <span className="text-slate-900 font-mono">{order.depositAmount.toLocaleString('ar-EG')} ج.م</span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900">
                <span>إجمالي المحصل حتى الآن:</span>
                <span className="font-black font-mono">{order.paidAmount.toLocaleString('ar-EG')} ج.م</span>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-900">
                <span>المتبقي المطلوب سداده:</span>
                <span className="font-black text-sm font-mono">{order.remainingBalance.toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>
          </div>

          {/* Payment Schedules (Installments) */}
          {orderSchedules.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>جدول الأقساط المستقبلية المتبقية</span>
                <span className="text-xs text-amber-800 font-bold">{orderSchedules.length} أقساط</span>
              </h3>

              <div className="space-y-2">
                {orderSchedules.map(sch => (
                  <div
                    key={sch.id}
                    className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                      sch.status === 'paid'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 font-bold'
                        : sch.status === 'overdue'
                        ? 'bg-rose-50 border-rose-200 text-rose-900 font-bold'
                        : 'bg-amber-50/60 border-amber-200 text-amber-900 font-bold'
                    }`}
                  >
                    <div>
                      <p className="font-black text-sm">القسط #{sch.installmentNumber}</p>
                      <p className="text-[10px] text-slate-500 font-mono">تاريخ الاستحقاق: {sch.dueDate}</p>
                    </div>

                    <div className="text-left font-mono">
                      <span className="font-mono text-sm font-black block">{sch.amount.toLocaleString('ar-EG')} ج.م</span>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.2 rounded ${
                        sch.status === 'paid' ? 'bg-emerald-200 text-emerald-900' : sch.status === 'overdue' ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                      }`}>
                        {sch.status === 'paid' ? '✓ تم السداد' : sch.status === 'overdue' ? '⚠️ متأخر' : 'مستحق قريباً'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recorded Payments & Receipts Log */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>إيصالات التحصيل المسجلة بالنظام ({orderPayments.length})</span>
              <span className="text-xs text-emerald-700 font-black">سجل مؤكد</span>
            </h3>

            {orderPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">لم يتم تسجيل أي دفعات مالية للطلب بعد</p>
            ) : (
              <div className="space-y-2 text-xs">
                {orderPayments.map(p => (
                  <div key={p.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-black text-emerald-800 text-sm block">{p.receiptRef || 'إيصال تحصيل'}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{p.paymentDate} — بواسطة: {p.receivedByUserName}</span>
                    </div>

                    <div className="text-left font-mono">
                      <span className="font-black text-sm text-slate-900 block">{p.amount.toLocaleString('ar-EG')} ج.م</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.2 rounded font-bold">
                        {p.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : p.paymentMethod === 'card' ? 'كارت' : 'كاش'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Modals */}
      <PaymentRecordModal
        isOpen={isPaymentModalOpen}
        orderNumber={order.orderNumber}
        customerName={order.customerName}
        remainingBalance={order.remainingBalance}
        onSave={(amount, method, receiptRef, paymentType, notes) => recordCustomerPayment(order.id, amount, method, receiptRef, paymentType, notes)}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      <OrderDeliveryModal
        isOpen={isDeliveryModalOpen}
        orderNumber={order.orderNumber}
        customerName={order.customerName}
        currentDeliveryStatus={order.deliveryInfo.deliveryStatus}
        onSave={(status, actualDate, notes) => updateDeliveryStatus(order.id, status, actualDate, notes)}
        onClose={() => setIsDeliveryModalOpen(false)}
      />

    </div>
  );
};
