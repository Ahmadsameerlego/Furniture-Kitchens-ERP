// ====================================================
// REWAQ ERP — PURCHASE ORDERS (PO) VIEW
// Enterprise PO Lifecycle, Line Items Tracking, Revisions & Receipts
// ====================================================

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ProcurementService } from '../../services/procurementService';
import { EnterprisePurchaseOrder, POStatus } from '../../types/procurement';
import { exportToExcel } from '../../utils/excelExport';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Truck,
  Building2,
  FileText,
  Printer,
  Download,
  Eye,
  AlertCircle,
  History,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Receipt,
  DollarSign,
  Sparkles
} from 'lucide-react';

interface PurchaseOrdersViewProps {
  onOpenCreatePO: () => void;
  onOpenTraceability: (po?: EnterprisePurchaseOrder, pr?: any) => void;
}

export const PurchaseOrdersView: React.FC<PurchaseOrdersViewProps> = ({
  onOpenCreatePO,
  onOpenTraceability
}) => {
  const {
    enterprisePurchaseOrders,
    approveEnterprisePurchaseOrder,
    rejectEnterprisePurchaseOrder,
    sendPOToSupplier,
    revisePurchaseOrder,
    cancelEnterprisePurchaseOrder,
    checkPermission,
    showToast
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [receivingFilter, setReceivingFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');

  // Modals & Selected PO
  const [selectedPO, setSelectedPO] = useState<EnterprisePurchaseOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');

  const canApprove = checkPermission('inventory', 'approve');
  const canCreate = checkPermission('inventory', 'create');

  const filteredPOs = enterprisePurchaseOrders.filter(po => {
    const matchesSearch = 
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (po.projectNumber && po.projectNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (po.projectName && po.projectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      po.items.some(i => i.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || i.itemCode.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    const matchesReceiving = receivingFilter === 'all' || po.receivingStatus === receivingFilter;
    const matchesSupplier = supplierFilter === 'all' || po.supplierId === supplierFilter;

    return matchesSearch && matchesStatus && matchesReceiving && matchesSupplier;
  });

  const handleOpenDetails = (po: EnterprisePurchaseOrder) => {
    setSelectedPO(po);
    setIsDetailsOpen(true);
  };

  const handleOpenPrint = (po: EnterprisePurchaseOrder) => {
    setSelectedPO(po);
    setIsPrintModalOpen(true);
  };

  const handleApprove = (poId: string) => {
    approveEnterprisePurchaseOrder(poId);
    if (selectedPO && selectedPO.id === poId) {
      setSelectedPO(prev => prev ? { ...prev, status: 'approved' } : null);
    }
  };

  const handleSend = (poId: string) => {
    sendPOToSupplier(poId);
    if (selectedPO && selectedPO.id === poId) {
      setSelectedPO(prev => prev ? { ...prev, status: 'sent_to_supplier' } : null);
    }
  };

  const handleRevise = () => {
    if (!selectedPO || !revisionReason.trim()) {
      showToast('يرجى كتابة سبب التعديل', 'warning');
      return;
    }
    revisePurchaseOrder(selectedPO.id, {}, revisionReason);
    setIsReviseModalOpen(false);
    setRevisionReason('');
    setIsDetailsOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcel(
      'أوامر_الشراء_الرسمية_PO_Rewaq',
      [
        { header: 'رقم أمر الشراء', key: 'poNumber' },
        { header: 'تاريخ الأمر', key: 'poDate' },
        { header: 'المورد', key: 'supplierName' },
        { header: 'تاريخ التوريد المتوقع', key: 'expectedDeliveryDate' },
        { header: 'المشروع', render: (r) => r.projectNumber || 'عام' },
        { header: 'القيمة الإجمالية (ج.م)', render: (r) => r.grandTotal },
        { header: 'حالة الاستلام', key: 'receivingStatus' },
        { header: 'حالة الأمر', key: 'status' }
      ],
      filteredPOs
    );
    showToast('تم تصدير تقرير أوامر الشراء إلى Excel بنجاح', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#361D13] to-[#1E110B] text-[#E29555] flex items-center justify-center shadow-md">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black text-[#1E110B]">أوامر الشراء الرسمية (Purchase Orders - PO)</h1>
                <span className="bg-[#C87A38]/15 text-[#C87A38] text-xs font-black px-3 py-0.5 rounded-full border border-[#C87A38]/30 font-mono">
                  {enterprisePurchaseOrders.length} أمر شراء
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                إدارة الالتزامات التعاقدية مع الموردين، دورة الاعتمادات، ومتابعة الاستلامات المخزنية والفواتير
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>تصدير Excel</span>
          </button>
          {canCreate && (
            <button
              onClick={onOpenCreatePO}
              className="px-5 py-2.5 bg-gradient-to-r from-[#361D13] to-[#1E110B] hover:opacity-95 text-white font-black text-xs rounded-2xl shadow-md shadow-[#1E110B]/20 border border-[#C87A38]/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#E29555]" />
              <span>أمر شراء جديد (PO)</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم PO، المورد، الصنف، المشروع..."
              className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38] focus:bg-white text-xs font-medium transition-all shadow-2xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
          >
            <option value="all">جميع حالات أمر الشراء (Status)</option>
            <option value="pending_approval">بانتظار الاعتماد (Pending Approval)</option>
            <option value="approved">معتمد رسمياً (Approved)</option>
            <option value="sent_to_supplier">مرسل للمورد (Sent)</option>
            <option value="partially_received">مستلم جزئياً (Partially Received)</option>
            <option value="fully_received">مستلم بالكامل (Fully Received)</option>
            <option value="closed">مكتمل ومغلق (Closed)</option>
            <option value="draft">مسودة (Draft)</option>
          </select>

          <select
            value={receivingFilter}
            onChange={(e) => setReceivingFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
          >
            <option value="all">حالة الاستلام المخزني (Receiving)</option>
            <option value="pending">بانتظار التوريد والاستلام</option>
            <option value="partially_received">استلام دفعات جزئية</option>
            <option value="fully_received">تم الاستلام 100%</option>
          </select>

        </div>
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#1E110B]/5 text-slate-700 font-black border-b border-slate-200/80">
              <tr className="whitespace-nowrap">
                <th className="py-4 px-5 min-w-[130px]">رقم الأمر</th>
                <th className="py-4 px-4 min-w-[140px]">تاريخ الأمر / التوريد</th>
                <th className="py-4 px-4 min-w-[180px]">المورد المعتمد</th>
                <th className="py-4 px-4 min-w-[160px]">المشروع المرتبط</th>
                <th className="py-4 px-4 min-w-[180px]">البنود ونسبة الاستلام</th>
                <th className="py-4 px-4 text-center min-w-[130px]">القيمة الإجمالية</th>
                <th className="py-4 px-4 text-center min-w-[130px]">حالة الاستلام</th>
                <th className="py-4 px-4 text-center min-w-[150px]">الحالة</th>
                <th className="py-4 px-5 text-center min-w-[170px]">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-bold">
                    لا توجد أوامر شراء مطابقة للفلاتر
                  </td>
                </tr>
              ) : (
                filteredPOs.map(po => {
                  const statusBadge = ProcurementService.getPOStatusBadge(po.status);
                  const totalOrdered = po.items.reduce((s, i) => s + i.quantity, 0);
                  const totalReceived = po.items.reduce((s, i) => s + i.receivedQuantity, 0);
                  const receivePercent = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;

                  return (
                    <tr key={po.id} className="hover:bg-amber-50/20 transition-colors">
                      {/* PO Number */}
                      <td className="py-4 px-5 font-mono font-black text-slate-900 text-xs whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
                          {po.poNumber}
                        </span>
                      </td>

                      {/* PO Date & Expected Delivery */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-800 text-xs">{po.poDate}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          تسليم: <strong className="text-amber-800 font-mono font-black">{po.expectedDeliveryDate}</strong>
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 text-xs">{po.supplierName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{po.supplierTaxNumber || 'ضريبي'}</div>
                      </td>

                      {/* Project */}
                      <td className="py-4 px-4">
                        {po.projectNumber ? (
                          <div>
                            <span className="font-bold text-indigo-700 block font-mono text-xs">{po.projectNumber}</span>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[140px] mt-0.5">{po.projectName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium text-xs">مخزون عام</span>
                        )}
                      </td>

                      {/* Items & Progress */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                          <span className="text-slate-700 font-mono">{totalReceived} من {totalOrdered} مستلم</span>
                          <span className="font-mono text-slate-900 font-black">{receivePercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              receivePercent === 100 
                                ? 'bg-emerald-500' 
                                : receivePercent > 0 
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                                : 'bg-slate-300'
                            }`}
                            style={{ width: `${receivePercent}%` }}
                          />
                        </div>
                      </td>

                      {/* Grand Total */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className="font-mono font-black text-slate-900 text-xs">{po.grandTotal.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-500 mr-1 font-bold">ج.م</span>
                      </td>

                      {/* Receiving Status Badge (No clipping) */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className={`whitespace-nowrap inline-flex items-center justify-center px-3 py-1 rounded-xl text-xs font-bold leading-normal border shadow-2xs ${
                          po.receivingStatus === 'fully_received'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : po.receivingStatus === 'partially_received'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {po.receivingStatus === 'fully_received' ? 'استلام كامل' : po.receivingStatus === 'partially_received' ? 'استلام جزئي' : 'قيد الانتظار'}
                        </span>
                      </td>

                      {/* Status Badge (No clipping) */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className={`whitespace-nowrap inline-flex items-center justify-center px-3 py-1 rounded-xl text-xs font-bold leading-normal border shadow-2xs ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenDetails(po)}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            title="تفاصيل أمر الشراء"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenPrint(po)}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            title="طباعة أمر الشراء الرسمي"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {po.status === 'pending_approval' && canApprove && (
                            <button
                              onClick={() => handleApprove(po.id)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                              title="اعتماد أمر الشراء"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>اعتماد</span>
                            </button>
                          )}

                          {po.status === 'approved' && (
                            <button
                              onClick={() => handleSend(po.id)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                              title="إرسال للمورد"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>إرسال</span>
                            </button>
                          )}

                          <button
                            onClick={() => onOpenTraceability(po)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                            title="شجرة التتبع الكاملة"
                          >
                            <Sparkles className="w-4 h-4" />
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

      {/* PO Details Modal */}
      {isDetailsOpen && selectedPO && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-[#361D13] text-white p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black font-mono">{selectedPO.poNumber}</span>
                  <span className="px-2.5 py-0.5 bg-white/10 text-slate-200 rounded-full text-xs font-bold">
                    {ProcurementService.getPOStatusBadge(selectedPO.status).label}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  المورد: {selectedPO.supplierName} • تاريخ الإصدار: {selectedPO.poDate} • موعد التسليم المتوقع: {selectedPO.expectedDeliveryDate}
                </p>
              </div>

              <button
                onClick={() => setIsDetailsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold">المشتري المسؤول</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{selectedPO.buyerName}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold">مستودع الاستلام</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{selectedPO.warehouseName}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold">شروط السداد</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{selectedPO.paymentTerms}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold">المشروع المرتبط</span>
                  <span className="font-bold text-indigo-700 mt-0.5 block font-mono">{selectedPO.projectNumber || 'عام'}</span>
                </div>
              </div>

              {/* Items Line Progress Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#C87A38]" />
                  <span>بنود أمر الشراء والكميات المستلمة والمتبقية</span>
                </h4>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">الصنف / الكود</th>
                        <th className="py-2.5 px-3 text-center">المطلوب</th>
                        <th className="py-2.5 px-3 text-center">المستلم</th>
                        <th className="py-2.5 px-3 text-center">المتبقي</th>
                        <th className="py-2.5 px-3">سعر الوحدة</th>
                        <th className="py-2.5 px-3">ضريبة 14%</th>
                        <th className="py-2.5 px-3">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPO.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-3 px-3">
                            <span className="font-black text-slate-900 block">{it.itemName}</span>
                            <span className="text-[10px] font-mono text-slate-400">{it.itemCode}</span>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-800">{it.quantity} {it.uom}</td>
                          <td className="py-3 px-3 text-center font-bold text-emerald-700">{it.receivedQuantity} {it.uom}</td>
                          <td className="py-3 px-3 text-center font-bold text-amber-700">{it.remainingQuantity} {it.uom}</td>
                          <td className="py-3 px-3 font-mono text-slate-700">{it.netUnitPrice.toLocaleString()} ج.م</td>
                          <td className="py-3 px-3 font-mono text-slate-500">{it.taxAmount.toLocaleString()} ج.م</td>
                          <td className="py-3 px-3 font-mono font-black text-slate-900">{it.totalAmount.toLocaleString()} ج.م</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-black border-t border-slate-200">
                      <tr>
                        <td colSpan={6} className="py-3 px-3 text-slate-700">المبلغ الإجمالي النهائي شامل الضريبة والشحن:</td>
                        <td className="py-3 px-3 font-mono text-indigo-700 text-sm">
                          {selectedPO.grandTotal.toLocaleString()} ج.م
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Linked GRNs & Vendor Bills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Receipts Card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <span className="font-black text-slate-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>أذونات الإضافة المخزنية المرتبطة (GRN):</span>
                  </span>
                  {selectedPO.receiptNotes.length === 0 ? (
                    <p className="text-[11px] text-slate-400">لم يتم تسجيل أي استلام مخزني حتى الآن</p>
                  ) : (
                    selectedPO.receiptNotes.map((rec, rIdx) => (
                      <div key={rIdx} className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-slate-800">{rec.grnNumber}</span>
                          <span className="text-[10px] text-slate-400 block">{rec.grnDate} • {rec.receivedByUserName}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                          {rec.receivedQty} وحدة مستلمة
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Bills Card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <span className="font-black text-slate-900 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-purple-600" />
                    <span>فواتير المورد بالحسابات (Vendor Bills):</span>
                  </span>
                  {selectedPO.vendorBills.length === 0 ? (
                    <p className="text-[11px] text-slate-400">بانتظار ورود فاتورة المورد الرسمية</p>
                  ) : (
                    selectedPO.vendorBills.map((bill, bIdx) => (
                      <div key={bIdx} className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-slate-800">{bill.billNumber}</span>
                          <span className="text-[10px] text-slate-400 block">فاتورة: {bill.vendorInvoiceNumber}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">
                          {bill.amount.toLocaleString()} ج.م
                        </span>
                      </div>
                    ))
                  )}
                </div>

              </div>

              {/* Revision History */}
              {selectedPO.revisions.length > 0 && (
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 text-xs space-y-2">
                  <span className="font-black text-amber-900 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-amber-700" />
                    <span>سجل التعديلات والمراجعات (Audit Revisions):</span>
                  </span>
                  {selectedPO.revisions.map((rev, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-amber-100 text-[11px]">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>النسخة V{rev.revisionNumber} ({rev.modifiedDate})</span>
                        <span>بواسطة: {rev.modifiedByUserName}</span>
                      </div>
                      <p className="text-slate-600 mt-1">السبب: {rev.reason}</p>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Footer Action Bar */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {selectedPO.status === 'pending_approval' && canApprove && (
                  <button
                    onClick={() => handleApprove(selectedPO.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>اعتماد أمر الشراء</span>
                  </button>
                )}

                {selectedPO.status === 'approved' && (
                  <button
                    onClick={() => handleSend(selectedPO.id)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>إرسال للمورد</span>
                  </button>
                )}

                <button
                  onClick={() => setIsReviseModalOpen(true)}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-bold text-xs flex items-center gap-1.5"
                >
                  <History className="w-4 h-4" />
                  <span>تعديل وإنشاء مراجعة</span>
                </button>

                <button
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleOpenPrint(selectedPO);
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة أمر الشراء</span>
                </button>
              </div>

              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Revise PO Modal */}
      {isReviseModalOpen && selectedPO && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-600" />
              <span>تعديل أمر الشراء المعتمد ({selectedPO.poNumber})</span>
            </h3>
            <p className="text-xs text-slate-600">
              تطبيقاً للحوكمة، أي تعديل على أمر الشراء المعتمد يتطلب تسجيل السبب وإعادة توجيهه للاعتماد:
            </p>
            <textarea
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              placeholder="مثال: زيادة الكمية المطلوبة بناء على طلب العميل، أو تعديل موقع الاستلام..."
              className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/30"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsReviseModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={handleRevise}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-sm"
              >
                حفظ التعديل وإرسال للاعتماد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Egyptian Standard Printable PO Modal */}
      {isPrintModalOpen && selectedPO && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 border border-slate-200 shadow-2xl space-y-6">
            
            {/* Print Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">شركة فيرنتشر لاند للأثاث والمطابخ</h2>
                <p className="text-xs text-slate-500">القاهرة الجديدة - التجمع الخامس • س.ت: 748291-EG • ب.ض: 302-881-492</p>
              </div>
              <div className="text-left font-mono">
                <span className="text-lg font-black text-slate-900 block">{selectedPO.poNumber}</span>
                <span className="text-xs text-slate-500 block">{selectedPO.poDate}</span>
              </div>
            </div>

            <div className="text-center py-2 bg-slate-100 rounded-xl font-black text-sm text-slate-900">
              أمر توريد وشراء رسمي (Purchase Order)
            </div>

            {/* Vendor & Delivery details */}
            <div className="grid grid-cols-2 gap-4 text-xs border border-slate-200 p-4 rounded-2xl">
              <div>
                <span className="font-bold text-slate-400 block">السادة / المورد:</span>
                <span className="font-black text-slate-900 text-sm block mt-0.5">{selectedPO.supplierName}</span>
                <span className="text-slate-500 block">الرقم الضريبي: {selectedPO.supplierTaxNumber || '441-209-310'}</span>
                <span className="text-slate-500 block">شروط السداد: {selectedPO.paymentTerms}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block">مكان وتاريخ التسليم:</span>
                <span className="font-black text-slate-900 block mt-0.5">{selectedPO.warehouseName}</span>
                <span className="text-rose-600 font-bold block">تاريخ التوريد المتفق: {selectedPO.expectedDeliveryDate}</span>
                <span className="text-slate-500 block">شروط الشحن: {selectedPO.shippingTerms}</span>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-right text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-black">
                <tr>
                  <th className="p-2.5">م</th>
                  <th className="p-2.5">اسم الصنف والمواصفات</th>
                  <th className="p-2.5 text-center">الكمية</th>
                  <th className="p-2.5">سعر الوحدة</th>
                  <th className="p-2.5">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedPO.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-mono">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-slate-900">{it.itemName} ({it.itemCode})</td>
                    <td className="p-2.5 text-center font-bold">{it.quantity} {it.uom}</td>
                    <td className="p-2.5 font-mono">{it.netUnitPrice.toLocaleString()} ج.م</td>
                    <td className="p-2.5 font-mono font-bold">{it.totalAmount.toLocaleString()} ج.م</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-black">
                <tr>
                  <td colSpan={4} className="p-2.5 text-left">المجموع الإجمالي شامل الضريبة:</td>
                  <td className="p-2.5 font-mono text-sm">{selectedPO.grandTotal.toLocaleString()} ج.م</td>
                </tr>
              </tfoot>
            </table>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-4 pt-6 text-center text-xs border-t border-slate-200">
              <div>
                <span className="text-slate-400 block">إعداد المشتريات</span>
                <span className="font-black text-slate-800 block mt-4">{selectedPO.buyerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">اعتماد الإدارة المالية</span>
                <span className="font-black text-slate-800 block mt-4">سارة الشريف</span>
              </div>
              <div>
                <span className="text-slate-400 block">توقيع واستلام المورد</span>
                <span className="text-slate-300 block mt-4">.........................</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                إغلاق
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-[#361D13] hover:bg-[#23120A] text-white rounded-xl font-black text-xs shadow-md flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة المستند</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
