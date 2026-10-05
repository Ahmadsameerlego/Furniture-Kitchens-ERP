// ====================================================
// REWAQ ERP — EXPECTED DELIVERIES & RECEIVING TRACKING VIEW
// Live Supply Schedule, Partial Delivery Progress & Delay Alerts
// ====================================================

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { EnterprisePurchaseOrder } from '../../types/procurement';
import { exportToExcel } from '../../utils/excelExport';
import {
  Truck,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Building2,
  Layers,
  ArrowDownLeft,
  ArrowRight,
  Eye,
  Plus
} from 'lucide-react';

interface ExpectedDeliveriesViewProps {
  onOpenReceiveGoodsModal: (po: EnterprisePurchaseOrder) => void;
  onNavigateToPO: (poId: string) => void;
}

export const ExpectedDeliveriesView: React.FC<ExpectedDeliveriesViewProps> = ({
  onOpenReceiveGoodsModal,
  onNavigateToPO
}) => {
  const {
    enterprisePurchaseOrders,
    updatePOExpectedDeliveryDate,
    showToast
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'delayed' | 'due_soon' | 'on_schedule' | 'completed'>('all');
  
  // Date Update Modal
  const [isUpdateDateOpen, setIsUpdateDateOpen] = useState(false);
  const [selectedPOToUpdate, setSelectedPOToUpdate] = useState<EnterprisePurchaseOrder | null>(null);
  const [newDeliveryDate, setNewDeliveryDate] = useState('');
  const [dateUpdateReason, setDateUpdateReason] = useState('');

  const today = new Date();
  const twoDaysFromNow = new Date(Date.now() + 2 * 86400000);

  // Flatten active delivery line items from open POs
  const deliveryItems = enterprisePurchaseOrders.flatMap(po => {
    return po.items.map(item => {
      const expDate = new Date(po.expectedDeliveryDate);
      const isCompleted = item.remainingQuantity === 0;
      const isDelayed = !isCompleted && expDate < today;
      const isDueSoon = !isCompleted && !isDelayed && expDate <= twoDaysFromNow;

      let scheduleStatus: 'delayed' | 'due_soon' | 'on_schedule' | 'completed' = 'on_schedule';
      if (isCompleted) scheduleStatus = 'completed';
      else if (isDelayed) scheduleStatus = 'delayed';
      else if (isDueSoon) scheduleStatus = 'due_soon';

      const delayDays = isDelayed ? Math.ceil((today.getTime() - expDate.getTime()) / 86400000) : 0;

      return {
        poId: po.id,
        poNumber: po.poNumber,
        supplierName: po.supplierName,
        warehouseName: po.warehouseName,
        expectedDate: po.expectedDeliveryDate,
        projectNumber: po.projectNumber,
        projectName: po.projectName,
        poStatus: po.status,
        receivingStatus: po.receivingStatus,
        rawPO: po,
        // Line Item
        itemId: item.itemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        quantity: item.quantity,
        receivedQuantity: item.receivedQuantity,
        remainingQuantity: item.remainingQuantity,
        uom: item.uom,
        scheduleStatus,
        delayDays
      };
    });
  });

  const filteredDeliveries = deliveryItems.filter(item => {
    const matchesSearch = 
      item.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.projectNumber && item.projectNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || item.scheduleStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenUpdateDate = (po: EnterprisePurchaseOrder) => {
    setSelectedPOToUpdate(po);
    setNewDeliveryDate(po.expectedDeliveryDate);
    setDateUpdateReason('');
    setIsUpdateDateOpen(true);
  };

  const handleSaveNewDate = () => {
    if (!selectedPOToUpdate || !newDeliveryDate || !dateUpdateReason.trim()) {
      showToast('يرجى تحديد الموعد الجديد وذكر السبب', 'warning');
      return;
    }
    updatePOExpectedDeliveryDate(selectedPOToUpdate.id, newDeliveryDate, dateUpdateReason);
    setIsUpdateDateOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcel(
      'جدول_متابعة_التوريدات_Rewaq',
      [
        { header: 'رقم أمر الشراء', key: 'poNumber' },
        { header: 'المورد', key: 'supplierName' },
        { header: 'اسم الصنف', key: 'itemName' },
        { header: 'الكمية المطلوبة', render: (r) => `${r.quantity} ${r.uom}` },
        { header: 'الكمية المستلمة', render: (r) => `${r.receivedQuantity} ${r.uom}` },
        { header: 'الكمية المتبقية', render: (r) => `${r.remainingQuantity} ${r.uom}` },
        { header: 'الموعد المتوقع', key: 'expectedDate' },
        { header: 'المستودع', key: 'warehouseName' },
        { header: 'حالة التوريد', key: 'scheduleStatus' }
      ],
      filteredDeliveries
    );
    showToast('تم تصدير جدول التوريدات إلى Excel بنجاح', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Truck className="w-6 h-6 text-[#C87A38]" />
              <span>متابعة التوريدات والاستلامات المخزنية (Expected Deliveries)</span>
            </h1>
            <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              تتبع حي للشحنات
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            مراقبة مواعيد وصول الخامات بالمستودعات، رصد نسب الاستلام الجزئي، وتنبيهات التأخير
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Filters Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-2xl border text-right transition-all shadow-xs ${
            filterStatus === 'all'
              ? 'bg-[#361D13] text-white border-[#361D13]'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-xs font-bold block opacity-80">جميع البنود المطلوبة</span>
          <span className="text-xl font-black block mt-1">{deliveryItems.length} بند</span>
        </button>

        <button
          onClick={() => setFilterStatus('delayed')}
          className={`p-4 rounded-2xl border text-right transition-all shadow-xs ${
            filterStatus === 'delayed'
              ? 'bg-rose-600 text-white border-rose-600'
              : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
          }`}
        >
          <span className="text-xs font-bold block opacity-80">توريدات متأخرة</span>
          <span className="text-xl font-black block mt-1">
            {deliveryItems.filter(d => d.scheduleStatus === 'delayed').length} بند
          </span>
        </button>

        <button
          onClick={() => setFilterStatus('due_soon')}
          className={`p-4 rounded-2xl border text-right transition-all shadow-xs ${
            filterStatus === 'due_soon'
              ? 'bg-cyan-700 text-white border-cyan-700'
              : 'bg-white text-cyan-800 border-cyan-200 hover:bg-cyan-50'
          }`}
        >
          <span className="text-xs font-bold block opacity-80">وصول خلال 48 ساعة</span>
          <span className="text-xl font-black block mt-1">
            {deliveryItems.filter(d => d.scheduleStatus === 'due_soon').length} بند
          </span>
        </button>

        <button
          onClick={() => setFilterStatus('on_schedule')}
          className={`p-4 rounded-2xl border text-right transition-all shadow-xs ${
            filterStatus === 'on_schedule'
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <span className="text-xs font-bold block opacity-80">توريدات منتظمة</span>
          <span className="text-xl font-black block mt-1">
            {deliveryItems.filter(d => d.scheduleStatus === 'on_schedule').length} بند
          </span>
        </button>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بأمر الشراء، الصنف، المورد، المشروع..."
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#361D13]/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">أمر الشراء / المورد</th>
                <th className="py-3.5 px-4">الصنف المطلوب</th>
                <th className="py-3.5 px-4 text-center">المطلوب</th>
                <th className="py-3.5 px-4 text-center">المستلم</th>
                <th className="py-3.5 px-4 text-center">المتبقي</th>
                <th className="py-3.5 px-4">موعد التوريد المتوقع</th>
                <th className="py-3.5 px-4">مستودع الاستلام</th>
                <th className="py-3.5 px-4">حالة التوريد</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    لا توجد بنود توريد مطابقة للفلاتر
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((del, idx) => {
                  const percent = del.quantity > 0 ? Math.round((del.receivedQuantity / del.quantity) * 100) : 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-slate-900 block">{del.poNumber}</span>
                        <span className="text-[11px] text-slate-500 block">{del.supplierName}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-black text-slate-900 block">{del.itemName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{del.itemCode}</span>
                        {del.projectNumber && (
                          <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">مشروع: {del.projectNumber}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {del.quantity} {del.uom}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                        {del.receivedQuantity} {del.uom}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-amber-700">
                        {del.remainingQuantity} {del.uom}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{del.expectedDate}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {del.warehouseName}
                      </td>
                      <td className="py-3.5 px-4">
                        {del.scheduleStatus === 'completed' && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                            مكتمل 100%
                          </span>
                        )}
                        {del.scheduleStatus === 'delayed' && (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full font-black text-[10px] flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            متأخر {del.delayDays} يوم
                          </span>
                        )}
                        {del.scheduleStatus === 'due_soon' && (
                          <span className="px-2.5 py-1 bg-cyan-100 text-cyan-800 rounded-full font-bold text-[10px] flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" />
                            مستحق خلال 48 س
                          </span>
                        )}
                        {del.scheduleStatus === 'on_schedule' && (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-bold text-[10px]">
                            وفق الجدول
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {del.remainingQuantity > 0 && (
                            <button
                              onClick={() => onOpenReceiveGoodsModal(del.rawPO)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[10px] shadow-2xs transition-colors flex items-center gap-1"
                              title="تسجيل إذن إضافة مخزني"
                            >
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                              <span>استلام</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenUpdateDate(del.rawPO)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="تحديث موعد التوريد"
                          >
                            <Clock className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onNavigateToPO(del.poId)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="فتح أمر الشراء"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Expected Delivery Date Modal */}
      {isUpdateDateOpen && selectedPOToUpdate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#C87A38]" />
              <span>تحديث موعد التوريد المتوقع ({selectedPOToUpdate.poNumber})</span>
            </h3>
            <p className="text-xs text-slate-600">
              المورد: <strong>{selectedPOToUpdate.supplierName}</strong>
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">تاريخ التوريد الجديد المتوقع:</label>
              <input
                type="date"
                value={newDeliveryDate}
                onChange={(e) => setNewDeliveryDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">سبب التعديل والتأجيل (إلزامي للرقابة):</label>
              <textarea
                value={dateUpdateReason}
                onChange={(e) => setDateUpdateReason(e.target.value)}
                placeholder="مثال: إفادة المورد بتأخر شحنة الميناء 3 أيام، أو طلب المصنع جدولة التوريد بعد انتهاء تجهيز عنبر التجميع..."
                className="w-full h-20 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#361D13]/30"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsUpdateDateOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveNewDate}
                className="px-5 py-2 bg-[#361D13] hover:bg-[#23120A] text-white rounded-xl font-black text-xs shadow-md"
              >
                حفظ التحديث والتوثيق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
