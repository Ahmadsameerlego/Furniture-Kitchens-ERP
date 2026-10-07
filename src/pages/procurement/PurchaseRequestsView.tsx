// ====================================================
// REWAQ ERP — PURCHASE REQUESTS (PR) VIEW
// Requisition Management, Approval Workflow & Downstream Conversion
// ====================================================

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ProcurementService } from '../../services/procurementService';
import { PurchaseRequest, PRStatus, PRPriority, PRSourceType } from '../../types/procurement';
import { exportToExcel } from '../../utils/excelExport';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Send,
  ShoppingCart,
  Eye,
  Download,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  History,
  Trash2,
  Sparkles
} from 'lucide-react';

interface PurchaseRequestsViewProps {
  onOpenCreatePR: () => void;
  onOpenCreateRFQFromPR: (pr: PurchaseRequest) => void;
  onOpenCreatePOFromPR: (pr: PurchaseRequest) => void;
  onOpenTraceability: (po?: any, pr?: PurchaseRequest) => void;
}

export const PurchaseRequestsView: React.FC<PurchaseRequestsViewProps> = ({
  onOpenCreatePR,
  onOpenCreateRFQFromPR,
  onOpenCreatePOFromPR,
  onOpenTraceability
}) => {
  const {
    purchaseRequests,
    approvePurchaseRequest,
    rejectPurchaseRequest,
    cancelPurchaseRequest,
    checkPermission,
    showToast
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Modals & Selected PR
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const canApprove = checkPermission('inventory', 'approve');
  const canCreate = checkPermission('inventory', 'create');

  const filteredPRs = purchaseRequests.filter(pr => {
    const matchesSearch = 
      pr.prNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pr.projectNumber && pr.projectNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pr.projectName && pr.projectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      pr.items.some(i => i.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || i.itemCode.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || pr.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || pr.priority === priorityFilter;
    const matchesDept = departmentFilter === 'all' || pr.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesDept;
  });

  const handleOpenDetails = (pr: PurchaseRequest) => {
    setSelectedPR(pr);
    setIsDetailsOpen(true);
  };

  const handleApprove = (prId: string) => {
    approvePurchaseRequest(prId);
    if (selectedPR && selectedPR.id === prId) {
      setSelectedPR(prev => prev ? { ...prev, status: 'approved' } : null);
    }
  };

  const handleReject = () => {
    if (!selectedPR || !rejectionReason.trim()) {
      showToast('يرجى ذكر سبب الرفض', 'warning');
      return;
    }
    rejectPurchaseRequest(selectedPR.id, rejectionReason);
    setShowRejectModal(false);
    setRejectionReason('');
    setIsDetailsOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcel(
      'طلبات_الشراء_المعتمدة_Rewaq',
      [
        { header: 'رقم طلب الشراء', key: 'prNumber' },
        { header: 'تاريخ الطلب', key: 'requestDate' },
        { header: 'تاريخ الاحتياج', key: 'requiredDate' },
        { header: 'طالب الشراء', key: 'requesterName' },
        { header: 'القسم', key: 'department' },
        { header: 'الأولوية', key: 'priority' },
        { header: 'المشروع', render: (r) => r.projectNumber || 'عام' },
        { header: 'القيمة التقديرية (ج.م)', render: (r) => r.totalEstimatedValue },
        { header: 'الحالة', key: 'status' }
      ],
      filteredPRs
    );
    showToast('تم تصدير تقرير طلبات الشراء إلى Excel بنجاح', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#361D13] to-[#1E110B] text-[#E29555] flex items-center justify-center shadow-md">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black text-[#1E110B]">طلبات الشراء والاحتياجات (Purchase Requests - PR)</h1>
                <span className="bg-[#C87A38]/15 text-[#C87A38] text-xs font-black px-3 py-0.5 rounded-full border border-[#C87A38]/30 font-mono">
                  {purchaseRequests.length} طلب
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                استقبال واعتماد طلبات شراء الخامات والمستلزمات الواردة من التخطيط (MRP)، ورش التصنيع، والمخازن
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
              onClick={onOpenCreatePR}
              className="px-5 py-2.5 bg-gradient-to-r from-[#361D13] to-[#1E110B] hover:opacity-95 text-white font-black text-xs rounded-2xl shadow-md shadow-[#1E110B]/20 border border-[#C87A38]/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#E29555]" />
              <span>إنشاء طلب شراء يدوي</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الطلب، الصنف، المشروع، الطالب..."
              className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38] focus:bg-white text-xs font-medium transition-all shadow-2xs"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
          >
            <option value="all">جميع الحالات (All Statuses)</option>
            <option value="pending_approval">بانتظار الاعتماد (Pending)</option>
            <option value="approved">معتمد للتسعير والشراء (Approved)</option>
            <option value="partially_processed">معالج جزئياً (In Process)</option>
            <option value="fully_processed">مكتمل ومعالج بأمر شراء (Closed)</option>
            <option value="draft">مسودة (Draft)</option>
            <option value="rejected">مرفوض (Rejected)</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
          >
            <option value="all">جميع مستويات الأولوية (Priority)</option>
            <option value="urgent">عاجل وحرج (Urgent)</option>
            <option value="high">أولوية عالية (High)</option>
            <option value="normal">عادي (Normal)</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
          >
            <option value="all">جميع الأقسام الطالبة (Departments)</option>
            <option value="planning">التخطيط و MRP (Planning)</option>
            <option value="production">ورش التصنيع (Production)</option>
            <option value="warehouse">المخازن والمستودعات (Warehouse)</option>
            <option value="maintenance">الصيانة والخدمات (Maintenance)</option>
            <option value="sales">المبيعات والمعارض (Sales)</option>
          </select>

        </div>
      </div>

      {/* PR Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#1E110B]/5 text-slate-700 font-black border-b border-slate-200/80">
              <tr className="whitespace-nowrap">
                <th className="py-4 px-5 min-w-[130px]">رقم الطلب</th>
                <th className="py-4 px-4 min-w-[140px]">تاريخ الطلب / الحاجة</th>
                <th className="py-4 px-4 min-w-[150px]">الطالب والمصدر</th>
                <th className="py-4 px-4 min-w-[150px]">المشروع المرتبط</th>
                <th className="py-4 px-4 min-w-[200px]">البنود والكميات</th>
                <th className="py-4 px-4 text-center min-w-[130px]">القيمة التقديرية</th>
                <th className="py-4 px-4 text-center min-w-[120px]">الأولوية</th>
                <th className="py-4 px-4 text-center min-w-[150px]">الحالة</th>
                <th className="py-4 px-5 text-center min-w-[160px]">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredPRs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-bold">
                    لا توجد طلبات شراء مطابقة للفلاتر المحددة
                  </td>
                </tr>
              ) : (
                filteredPRs.map(pr => {
                  const statusBadge = ProcurementService.getPRStatusBadge(pr.status);
                  const priorityBadge = ProcurementService.getPriorityBadge(pr.priority);

                  return (
                    <tr key={pr.id} className="hover:bg-amber-50/20 transition-colors">
                      {/* PR Number */}
                      <td className="py-4 px-5 font-mono font-black text-slate-900 text-xs whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
                          {pr.prNumber}
                        </span>
                      </td>

                      {/* Request & Required Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-800 text-xs">{pr.requestDate}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          مطلوب: <strong className="text-amber-800 font-mono font-black">{pr.requiredDate}</strong>
                        </div>
                      </td>

                      {/* Requester & Department */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 text-xs">{pr.requesterName}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                          <span className="px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                            {pr.department === 'planning' ? 'التخطيط' : pr.department === 'production' ? 'الإنتاج' : 'المخازن'}
                          </span>
                          {pr.sourceReference && <span className="font-mono text-slate-400">• {pr.sourceReference}</span>}
                        </div>
                      </td>

                      {/* Project */}
                      <td className="py-4 px-4">
                        {pr.projectNumber ? (
                          <div>
                            <span className="font-bold text-indigo-700 block font-mono text-xs">{pr.projectNumber}</span>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[140px] mt-0.5">{pr.projectName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium text-xs">مخزون عام</span>
                        )}
                      </td>

                      {/* Items */}
                      <td className="py-4 px-4">
                        <div className="font-black text-[#1E110B] leading-relaxed text-xs line-clamp-1 max-w-[200px]">
                          {pr.items[0]?.itemName}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-bold">
                          <span className="font-mono text-indigo-700">{pr.items[0]?.quantity} {pr.items[0]?.uom}</span>
                          {pr.items.length > 1 && <span className="mr-1 text-slate-400 font-normal"> (+{pr.items.length - 1} بنود)</span>}
                        </div>
                      </td>

                      {/* Estimated Value */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className="font-mono font-black text-slate-900 text-xs">{pr.totalEstimatedValue.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-500 mr-1 font-bold">ج.م</span>
                      </td>

                      {/* Priority Badge (No clipping) */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className={`whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold leading-normal border shadow-2xs ${priorityBadge.bg} ${priorityBadge.text} border-slate-200/60`}>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${priorityBadge.dot}`} />
                          <span>{priorityBadge.label}</span>
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
                          {/* View details */}
                          <button
                            onClick={() => handleOpenDetails(pr)}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            title="عرض التفاصيل الكاملة"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Approve Action */}
                          {pr.status === 'pending_approval' && canApprove && (
                            <button
                              onClick={() => handleApprove(pr.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition-colors flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                              title="اعتماد فوري"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>اعتماد</span>
                            </button>
                          )}

                          {/* Conversion Actions */}
                          {pr.status === 'approved' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onOpenCreateRFQFromPR(pr)}
                                className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-black text-xs transition-colors flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                                title="إنشاء طلب عروض أسعار (RFQ)"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>RFQ</span>
                              </button>
                              <button
                                onClick={() => onOpenCreatePOFromPR(pr)}
                                className="px-2.5 py-1.5 bg-[#361D13] hover:bg-[#23120A] text-white rounded-xl font-black text-xs transition-colors flex items-center gap-1 shadow-2xs border border-[#C87A38]/30 cursor-pointer active:scale-95"
                                title="إصدار أمر شراء مباشر (PO)"
                              >
                                <ShoppingCart className="w-3.5 h-3.5 text-[#E29555]" />
                                <span>PO</span>
                              </button>
                            </div>
                          )}

                          {/* Traceability */}
                          <button
                            onClick={() => onOpenTraceability(undefined, pr)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                            title="شجرة التتبع"
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

      {/* PR Details Modal */}
      {isDetailsOpen && selectedPR && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-[#361D13] text-white p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black font-mono">{selectedPR.prNumber}</span>
                  <span className="px-2.5 py-0.5 bg-white/10 text-slate-200 rounded-full text-xs font-bold">
                    {ProcurementService.getPRStatusBadge(selectedPR.status).label}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  طلب شراء رسمي صادر من قسم {selectedPR.department} بواسطة {selectedPR.requesterName}
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
                  <span className="text-[10px] text-slate-400 block font-bold">تاريخ الطلب</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{selectedPR.requestDate}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold">تاريخ الحاجة بالمصنع</span>
                  <span className="font-bold text-rose-600 mt-0.5 block">{selectedPR.requiredDate}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold">مستودع الاستلام</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{selectedPR.warehouseName}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold">المشروع المرتبط</span>
                  <span className="font-bold text-indigo-700 mt-0.5 block font-mono">{selectedPR.projectNumber || 'عام'}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#C87A38]" />
                  <span>بنود الخامات والمستلزمات المطلوبة ({selectedPR.items.length})</span>
                </h4>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">كود الصنف</th>
                        <th className="py-2.5 px-3">اسم الخامة / المواصفات</th>
                        <th className="py-2.5 px-3">الكمية</th>
                        <th className="py-2.5 px-3">السعر التقديري</th>
                        <th className="py-2.5 px-3">الإجمالي التقديري</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPR.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{it.itemCode}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-black text-slate-900 block">{it.itemName}</span>
                            {it.specifications && (
                              <span className="text-[10px] text-slate-400 block mt-0.5">{it.specifications}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">{it.quantity} {it.uom}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">{it.estimatedUnitCost.toLocaleString()} ج.م</td>
                          <td className="py-2.5 px-3 font-mono font-black text-slate-900">{it.estimatedTotalCost.toLocaleString()} ج.م</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50/80 font-black border-t border-slate-200">
                      <tr>
                        <td colSpan={4} className="py-3 px-3 text-slate-700">الإجمالي التقديري لطلب الشراء:</td>
                        <td className="py-3 px-3 font-mono text-indigo-700 text-sm">
                          {selectedPR.totalEstimatedValue.toLocaleString()} ج.م
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedPR.notes && (
                <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 text-xs">
                  <span className="text-[10px] font-bold text-amber-800 block">ملاحظات ومبررات الشراء:</span>
                  <p className="text-slate-700 mt-1">{selectedPR.notes}</p>
                </div>
              )}

              {/* Traceability Link */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C87A38]" />
                  <span className="text-xs font-bold text-slate-700">تتبع دورة حياة الطلب حتى أمر الشراء والاستلام</span>
                </div>
                <button
                  onClick={() => {
                    setIsDetailsOpen(false);
                    onOpenTraceability(undefined, selectedPR);
                  }}
                  className="text-xs text-[#C87A38] hover:text-[#361D13] font-black"
                >
                  فتح مستكشف التتبع ⟵
                </button>
              </div>

            </div>

            {/* Footer Action Bar */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {selectedPR.status === 'pending_approval' && canApprove && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedPR.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>اعتماد طلب الشراء</span>
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs"
                    >
                      رفض الطلب
                    </button>
                  </>
                )}

                {selectedPR.status === 'approved' && (
                  <>
                    <button
                      onClick={() => {
                        setIsDetailsOpen(false);
                        onOpenCreateRFQFromPR(selectedPR);
                      }}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                      <span>إنشاء طلب تسعير (RFQ)</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsDetailsOpen(false);
                        onOpenCreatePOFromPR(selectedPR);
                      }}
                      className="px-4 py-2 bg-[#361D13] hover:bg-[#23120A] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <ShoppingCart className="w-4 h-4 text-[#C87A38]" />
                      <span>إصدار أمر شراء مباشر (PO)</span>
                    </button>
                  </>
                )}
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

      {/* Reject Modal */}
      {showRejectModal && selectedPR && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-rose-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>تأكيد رفض طلب الشراء ({selectedPR.prNumber})</span>
            </h3>
            <p className="text-xs text-slate-600">
              يرجى توضيح سبب الرفض ليتم إخطار القسم الطالب بسجل المراجعة:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="مثال: الخامات متوفرة بمخزن العبور كبديل، أو تتطلب مراجعة التكلفة مع المكتب الفني..."
              className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/30"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-sm"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
