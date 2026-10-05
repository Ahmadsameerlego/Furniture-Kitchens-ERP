// ====================================================
// REWAQ ERP — REQUEST FOR QUOTATION (RFQ) VIEW
// Multi-Supplier Bidding, Quotation Tracking & Deadline Alerts
// ====================================================

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ProcurementService } from '../../services/procurementService';
import { RequestForQuotation, RFQStatus } from '../../types/procurement';
import { exportToExcel } from '../../utils/excelExport';
import {
  Send,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  Scale,
  Eye,
  Download,
  Calendar,
  Layers,
  AlertCircle,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface RFQListViewProps {
  onOpenCreateRFQ: () => void;
  onOpenComparison: (rfq: RequestForQuotation) => void;
  onOpenRecordQuote: (rfq: RequestForQuotation) => void;
}

export const RFQListView: React.FC<RFQListViewProps> = ({
  onOpenCreateRFQ,
  onOpenComparison,
  onOpenRecordQuote
}) => {
  const {
    rfqs,
    supplierQuotations,
    sendRFQToSuppliers,
    cancelRFQ,
    checkPermission,
    showToast
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRFQ, setSelectedRFQ] = useState<RequestForQuotation | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const canCreate = checkPermission('inventory', 'create');

  const filteredRFQs = rfqs.filter(r => {
    const matchesSearch = 
      r.rfqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.purchaseRequestNumber && r.purchaseRequestNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.projectNumber && r.projectNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.targetSuppliers.some(s => s.supplierName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.items.some(i => i.itemName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenDetails = (rfq: RequestForQuotation) => {
    setSelectedRFQ(rfq);
    setIsDetailsOpen(true);
  };

  const handleSendToSuppliers = (rfqId: string) => {
    const target = rfqs.find(r => r.id === rfqId);
    if (!target) return;
    sendRFQToSuppliers(rfqId, target.targetSuppliers.map(s => s.supplierId));
  };

  const handleExportExcel = () => {
    exportToExcel(
      'طلبات_عروض_الأسعار_RFQ_Rewaq',
      [
        { header: 'رقم الـ RFQ', key: 'rfqNumber' },
        { header: 'تاريخ الإصدار', key: 'issueDate' },
        { header: 'مهلة الرد', key: 'responseDeadline' },
        { header: 'تاريخ التسليم المطلوب', key: 'requiredDeliveryDate' },
        { header: 'طلب الشراء المرتبط', render: (r) => r.purchaseRequestNumber || 'مباشر' },
        { header: 'المشروع', render: (r) => r.projectNumber || 'عام' },
        { header: 'عدد الموردين المدعوين', render: (r) => r.targetSuppliers.length },
        { header: 'الحالة', key: 'status' }
      ],
      filteredRFQs
    );
    showToast('تم تصدير تقرير الـ RFQ إلى Excel بنجاح', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">طلبات عروض الأسعار (Requests for Quotation - RFQ)</h1>
            <span className="bg-[#C87A38]/15 text-[#C87A38] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#C87A38]/30">
              {rfqs.length} منافسة
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            دعوة الموردين للمنافسة على عروض الأسعار والشروط التجارية وتتبع حالة استلام العروض
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>تصدير Excel</span>
          </button>
          {canCreate && (
            <button
              onClick={onOpenCreateRFQ}
              className="px-4 py-2.5 bg-[#361D13] hover:bg-[#23120A] text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#C87A38]" />
              <span>إنشاء طلب تسعير (RFQ)</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم RFQ، الصنف، المورد، المشروع..."
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">جميع الحالات (All Statuses)</option>
            <option value="draft">مسودة (Draft)</option>
            <option value="sent">تم الإرسال للموردين (Sent)</option>
            <option value="partially_responded">وردت بعض العروض (Partially Quoted)</option>
            <option value="fully_responded">عروض كاملة بانتظار المقارنة (Fully Quoted)</option>
            <option value="comparison_completed">تمت المقارنة واختيار المورد (Completed)</option>
          </select>
        </div>
      </div>

      {/* RFQs List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRFQs.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Send className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">لا توجد طلبات تسعير مطابقة</p>
          </div>
        ) : (
          filteredRFQs.map(rfq => {
            const statusBadge = ProcurementService.getRFQStatusBadge(rfq.status);
            const quotedCount = rfq.targetSuppliers.filter(s => s.invitationStatus === 'quoted').length;
            const totalSuppliers = rfq.targetSuppliers.length;

            return (
              <div
                key={rfq.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-[#C87A38]/50 hover:shadow-md transition-all space-y-4"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-slate-900 text-sm">{rfq.rfqNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    تاريخ الإصدار: {rfq.issueDate}
                  </span>
                </div>

                {/* Items & Project summary */}
                <div>
                  <h4 className="text-xs font-black text-slate-800 line-clamp-1">
                    {rfq.items[0]?.itemName} {rfq.items.length > 1 ? `(+${rfq.items.length - 1} بنود أخرى)` : ''}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1.5">
                    {rfq.purchaseRequestNumber && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono font-bold">
                        PR: {rfq.purchaseRequestNumber}
                      </span>
                    )}
                    {rfq.projectNumber && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-mono font-bold">
                        {rfq.projectNumber}
                      </span>
                    )}
                    <span>مهلة الرد: <strong className="text-rose-600">{rfq.responseDeadline}</strong></span>
                  </div>
                </div>

                {/* Invited Suppliers & Response Status */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-600">الموردون والردود:</span>
                    <span className="text-indigo-600 font-mono">{quotedCount} من {totalSuppliers} وردت عروضهم</span>
                  </div>

                  <div className="space-y-1.5">
                    {rfq.targetSuppliers.map((sup, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-white px-2.5 py-1.5 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-800 truncate max-w-[180px]">{sup.supplierName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          sup.invitationStatus === 'quoted' 
                            ? 'bg-emerald-100 text-emerald-800'
                            : sup.invitationStatus === 'viewed'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {sup.invitationStatus === 'quoted' ? 'تم تقديم العرض ✓' : sup.invitationStatus === 'viewed' ? 'تمت المشاهدة' : 'بانتظار الرد'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenDetails(rfq)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>التفاصيل</span>
                    </button>
                    {rfq.status === 'draft' && (
                      <button
                        onClick={() => handleSendToSuppliers(rfq.id)}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>إرسال</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenRecordQuote(rfq)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs transition-colors"
                    >
                      + تسجيل عرض
                    </button>
                    <button
                      onClick={() => onOpenComparison(rfq)}
                      className="px-3.5 py-1.5 bg-[#361D13] hover:bg-[#23120A] text-white rounded-xl font-black text-xs transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Scale className="w-3.5 h-3.5 text-[#C87A38]" />
                      <span>مقارنة العروض</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RFQ Details Modal */}
      {isDetailsOpen && selectedRFQ && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-[#361D13] text-white p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black font-mono">{selectedRFQ.rfqNumber}</span>
                  <span className="px-2.5 py-0.5 bg-white/10 text-slate-200 rounded-full text-xs font-bold">
                    {ProcurementService.getRFQStatusBadge(selectedRFQ.status).label}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  طلب عروض أسعار صادر بتاريخ {selectedRFQ.issueDate} • مهلة الرد: {selectedRFQ.responseDeadline}
                </p>
              </div>

              <button
                onClick={() => setIsDetailsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              {/* Items Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#C87A38]" />
                  <span>البنود والمواصفات المطلوبة للتسعير ({selectedRFQ.items.length})</span>
                </h4>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">كود الصنف</th>
                        <th className="py-2.5 px-3">اسم الخامة والمواصفات الفنية</th>
                        <th className="py-2.5 px-3">الكمية</th>
                        <th className="py-2.5 px-3">تاريخ التسليم المطلوب</th>
                        <th className="py-2.5 px-3">مكان الاستلام</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedRFQ.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{it.itemCode}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-black text-slate-900 block">{it.itemName}</span>
                            {it.technicalSpecs && (
                              <span className="text-[10px] text-slate-500 block mt-0.5">{it.technicalSpecs}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">{it.quantity} {it.uom}</td>
                          <td className="py-2.5 px-3 font-mono text-rose-600">{it.requiredDeliveryDate}</td>
                          <td className="py-2.5 px-3 text-slate-600">{it.deliveryLocation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Commercial Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">شروط السداد المطلوبة:</span>
                  <span className="font-bold text-slate-800 mt-1 block">{selectedRFQ.paymentTermsRequested}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">شروط التسليم والنقل:</span>
                  <span className="font-bold text-slate-800 mt-1 block">{selectedRFQ.deliveryTermsRequested}</span>
                </div>
              </div>

            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsDetailsOpen(false);
                  onOpenComparison(selectedRFQ);
                }}
                className="px-5 py-2.5 bg-[#361D13] hover:bg-[#23120A] text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-sm"
              >
                <Scale className="w-4 h-4 text-[#C87A38]" />
                <span>فتح شاشة المقارنة واختيار المورد</span>
              </button>

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

    </div>
  );
};
