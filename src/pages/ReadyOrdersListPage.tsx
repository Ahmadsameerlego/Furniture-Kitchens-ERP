import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { ReadyOrder, OrderStatus, DeliveryStatus } from '../types/erp';
import { ReadySalesService } from '../services/readySalesService';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Truck,
  DollarSign,
  Eye,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PackageCheck,
  X
} from 'lucide-react';
import { OrderFormModal } from '../components/modals/OrderFormModal';
import { PaymentRecordModal } from '../components/modals/PaymentRecordModal';
import { OrderDeliveryModal } from '../components/modals/OrderDeliveryModal';
import { OrderDetailsPage } from './OrderDetailsPage';

export const ReadyOrdersListPage: React.FC = () => {
  const {
    orders,
    availableBranches,
    selectedOrderId,
    setSelectedOrderId,
    setSelectedCustomerId,
    setActiveModule,
    createReadyOrder,
    recordCustomerPayment,
    updateDeliveryStatus,
    checkPermission
  } = useERP();

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [activePaymentOrder, setActivePaymentOrder] = useState<ReadyOrder | null>(null);
  const [activeDeliveryOrder, setActiveDeliveryOrder] = useState<ReadyOrder | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>('all');
  const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  const canCreate = checkPermission('sales', 'create');

  if (selectedOrderId) {
    return (
      <OrderDetailsPage
        orderId={selectedOrderId}
        onBack={() => setSelectedOrderId(null)}
      />
    );
  }

  // Filter orders by Branch Authorization Scoping
  const authorizedOrders = orders.filter(o => availableBranches.some(b => b.id === o.branchId));

  const filteredOrders = authorizedOrders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.customerPhone.includes(searchQuery);

    const matchesStatus = selectedOrderStatus === 'all' || o.orderStatus === selectedOrderStatus;
    const matchesDelivery = selectedDeliveryStatus === 'all' || o.deliveryInfo.deliveryStatus === selectedDeliveryStatus;
    const matchesBranch = selectedBranch === 'all' || o.branchId === selectedBranch;

    return matchesSearch && matchesStatus && matchesDelivery && matchesBranch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">طلبات ومبيعات الأثاث الجاهز (Ready Orders)</h1>
            <span className="bg-[#E06F28]/15 text-[#E06F28] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E06F28]/30">
              {filteredOrders.length} طلب مصرح
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة المبيعات، حجز المخزون، متابعة التسليم (جاهز للتسليم vs تم التسليم)، وحساب الأرباح الفعلية
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="px-5 py-2.5 bg-[#1C352D] hover:bg-[#142921] text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4 text-[#E06F28]" />
            <span>إنشاء طلب مبيعات جديد</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الطلب أو اسم العميل أو الهاتف..."
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30"
            />
          </div>

          {/* Delivery Status Filter */}
          <div>
            <select
              value={selectedDeliveryStatus}
              onChange={(e) => setSelectedDeliveryStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">كل حالات التسليم</option>
              <option value="ready_for_delivery">جاهز للتسليم (بالمعرض/المخزن)</option>
              <option value="delivered">تم التسليم الفعلي للعميل</option>
              <option value="preparing">جاري التجهيز بالمخزن</option>
            </select>
          </div>

          {/* Order Status Filter */}
          <div>
            <select
              value={selectedOrderStatus}
              onChange={(e) => setSelectedOrderStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">كل حالات الطلب (Order Status)</option>
              <option value="confirmed">مؤكد ومحجوز (Confirmed)</option>
              <option value="preparing">قيد التجهيز (Preparing)</option>
              <option value="ready_for_delivery">جاهز للتسليم (Ready)</option>
              <option value="delivered">تم التسليم للعميل (Delivered)</option>
              <option value="completed">طلب مكتمل بالكامل (Completed)</option>
              <option value="cancelled">ملغي (Cancelled)</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <option value="all">كل الفروع المصرحة</option>
              {availableBranches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Desktop Orders Table - REFINED */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#1C352D] text-white font-bold border-b border-emerald-900/50">
              <tr>
                <th className="p-4 min-w-[200px] text-right whitespace-nowrap">رقم الطلب والعميل</th>
                <th className="p-4 min-w-[150px] text-right whitespace-nowrap">الفرع المسؤول</th>
                <th className="p-4 min-w-[140px] text-left whitespace-nowrap">إجمالي البيع والتكلفة</th>
                <th className="p-4 min-w-[120px] text-left whitespace-nowrap">مجمل الربح</th>
                <th className="p-4 min-w-[150px] text-right whitespace-nowrap">حالة السداد والتحصيل</th>
                <th className="p-4 min-w-[170px] text-right whitespace-nowrap">حالة التسليم (Delivery)</th>
                <th className="p-4 min-w-[140px] text-center whitespace-nowrap">الإجراءات السريعة</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.map(o => {
                const orderStatusMeta = ReadySalesService.getOrderStatusMeta(o.orderStatus);
                const deliveryStatusMeta = ReadySalesService.getDeliveryStatusMeta(o.deliveryInfo.deliveryStatus);
                const paymentStatusMeta = ReadySalesService.getPaymentStatusMeta(o.paymentStatus);

                return (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Order Number & Customer */}
                    <td className="p-4 whitespace-nowrap">
                      <div>
                        <p className="font-black text-slate-900 text-sm">{o.orderNumber}</p>
                        <button
                          onClick={() => {
                            setSelectedCustomerId(o.customerId);
                            setActiveModule('customers');
                          }}
                          className="font-bold text-slate-600 hover:text-[#E06F28] hover:underline block text-xs truncate max-w-[180px]"
                        >
                          {o.customerName} ({o.customerPhone})
                        </button>
                      </div>
                    </td>

                    {/* Branch */}
                    <td className="p-4 font-bold text-slate-800 whitespace-nowrap">
                      {o.branchName}
                    </td>

                    {/* Financial Totals */}
                    <td className="p-4 text-left font-mono whitespace-nowrap">
                      <p className="font-black text-slate-900 text-sm">{o.orderTotal.toLocaleString('ar-EG')} ج.م</p>
                      <p className="text-[10px] text-amber-800 font-bold">التكلفة: {o.totalPurchaseCost.toLocaleString('ar-EG')} ج.م</p>
                    </td>

                    {/* Gross Profit */}
                    <td className="p-4 text-left font-black text-emerald-700 font-mono text-sm whitespace-nowrap">
                      +{o.grossProfit.toLocaleString('ar-EG')} ج.م
                    </td>

                    {/* Payment Status */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold whitespace-nowrap ${paymentStatusMeta.bgClass} ${paymentStatusMeta.textClass}`}>
                          {paymentStatusMeta.label}
                        </span>
                        {o.remainingBalance > 0 && (
                          <p className="text-[10px] text-rose-700 font-bold font-mono">متبقي: {o.remainingBalance.toLocaleString('ar-EG')} ج.م</p>
                        )}
                      </div>
                    </td>

                    {/* Delivery Status Badge */}
                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold border whitespace-nowrap ${deliveryStatusMeta.bgClass} ${deliveryStatusMeta.textClass} ${deliveryStatusMeta.borderClass}`}>
                        {deliveryStatusMeta.label}
                      </span>
                    </td>

                    {/* Quick Actions */}
                    <td className="p-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {o.remainingBalance > 0 && (
                          <button
                            onClick={() => setActivePaymentOrder(o)}
                            className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 transition-colors shrink-0"
                            title="تسجيل تحصيل قسط"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setActiveDeliveryOrder(o)}
                          className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 transition-colors shrink-0"
                          title="تحديث حالة التسليم والتوصيل"
                        >
                          <Truck className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setSelectedOrderId(o.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#1C352D] hover:bg-[#142921] text-white font-black text-xs shadow-xs transition-all flex items-center gap-1 shrink-0 whitespace-nowrap"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#E06F28]" />
                          <span>تفاصيل الطلب</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Responsive Cards */}
      <div className="md:hidden space-y-3">
        {filteredOrders.map(o => {
          const deliveryStatusMeta = ReadySalesService.getDeliveryStatusMeta(o.deliveryInfo.deliveryStatus);

          return (
            <div key={o.id} className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">{o.orderNumber}</h3>
                  <p className="text-slate-600 font-bold">{o.customerName}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${deliveryStatusMeta.bgClass} ${deliveryStatusMeta.textClass}`}>
                  {deliveryStatusMeta.label}
                </span>
              </div>

              <div className="flex justify-between font-bold border-t border-slate-100 pt-2 font-mono">
                <span className="text-slate-500">إجمالي البيع:</span>
                <span className="text-slate-900">{o.orderTotal.toLocaleString('ar-EG')} ج.م</span>
              </div>

              <button
                onClick={() => setSelectedOrderId(o.id)}
                className="w-full py-2 rounded-xl bg-[#1C352D] text-white font-black text-center"
              >
                فتح تفاصيل الطلب بالكامل
              </button>
            </div>
          );
        })}
      </div>

      {/* Order Form Modal */}
      <OrderFormModal
        isOpen={isOrderModalOpen}
        onSave={(data) => createReadyOrder(data)}
        onClose={() => setIsOrderModalOpen(false)}
      />

      {/* Payment Record Modal */}
      {activePaymentOrder && (
        <PaymentRecordModal
          isOpen={!!activePaymentOrder}
          orderNumber={activePaymentOrder.orderNumber}
          customerName={activePaymentOrder.customerName}
          remainingBalance={activePaymentOrder.remainingBalance}
          onSave={(amount, method, receiptRef, paymentType, notes) => {
            recordCustomerPayment(activePaymentOrder.id, amount, method, receiptRef, paymentType, notes);
            setActivePaymentOrder(null);
          }}
          onClose={() => setActivePaymentOrder(null)}
        />
      )}

      {/* Delivery Update Modal */}
      {activeDeliveryOrder && (
        <OrderDeliveryModal
          isOpen={!!activeDeliveryOrder}
          orderNumber={activeDeliveryOrder.orderNumber}
          customerName={activeDeliveryOrder.customerName}
          currentDeliveryStatus={activeDeliveryOrder.deliveryInfo.deliveryStatus}
          onSave={(status, actualDate, notes) => {
            updateDeliveryStatus(activeDeliveryOrder.id, status, actualDate, notes);
            setActiveDeliveryOrder(null);
          }}
          onClose={() => setActiveDeliveryOrder(null)}
        />
      )}

    </div>
  );
};
