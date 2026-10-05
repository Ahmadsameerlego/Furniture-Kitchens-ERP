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
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">طلبات الشراء والاحتياجات (Purchase Requests - PR)</h1>
            <span className="bg-[#C87A38]/15 text-[#C87A38] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#C87A38]/30">
              {purchaseRequests.length} طلب
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            استقبال واعتماد طلبات شراء الخامات والمستلزمات الواردة من التخطيط (MRP)، ورش التصنيع، والمخازن
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
              onClick={onOpenCreatePR}
              className="px-4 py-2.5 bg-[#361D13] hover:bg-[#23120A] text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#C87A38]" />
              <span>إنشاء طلب شراء يدوي</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الطلب، الصنف، المشروع، الطالب..."
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 text-xs"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
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
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
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
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
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
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">رقم الطلب</th>
                <th className="py-3.5 px-4">تاريخ الطلب / الحاجة</th>
                <th className="py-3.5 px-4">الطالب والمصدر</th>
                <th className="py-3.5 px-4">المشروع المرتبط</th>
                <th className="py-3.5 px-4">البنود والكميات</th>
                <th className="py-3.5 px-4">القيمة التقديرية</th>
                <th className="py-3.5 px-4">الأولوية</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPRs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    لا توجد طلبات شراء مطابقة للفلاتر المحددة
                  </td>
                </tr>
              ) : (
                filteredPRs.map(pr => {
                  const statusBadge = ProcurementService.getPRStatusBadge(pr.status);
                  const priorityBadge = ProcurementService.getPriorityBadge(pr.priority);

                  return (
                    <tr key={pr.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                        {pr.prNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{pr.requestDate}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">مطلوب: <strong className="text-slate-700">{pr.requiredDate}</strong></div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{pr.requesterName}</div>
                        <div className="text-[10px] text-slate-500">
                          {pr.department === 'planning' ? 'التخطيط' : pr.department === 'production' ? 'الإنتاج' : 'المخازن'} 
                          {pr.sourceReference ? ` • ${pr.sourceReference}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {pr.projectNumber ? (
                          <div>
                            <span className="font-bold text-indigo-700 block font-mono">{pr.projectNumber}</span>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">{pr.projectName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">مخزون عام</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-800 line-clamp-1 max-w-[200px]">
                          {pr.items[0]?.itemName}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {pr.items[0]?.quantity} {pr.items[0]?.uom} {pr.items.length > 1 ? `(+${pr.items.length - 1} بنود)` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                        {pr.totalEstimatedValue.toLocaleString()} ج.م
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${priorityBadge.bg} ${priorityBadge.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${priorityBadge.dot}`} />
                          {priorityBadge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenDetails(pr)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {pr.status === 'pending_approval' && canApprove && (
                            <button
                              onClick={() => handleApprove(pr.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition-colors flex items-center gap-1 shadow-2xs"
                              title="اعتماد فوري"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>اعتماد</span>
                            </button>
                          )}

                          {pr.status === 'approved' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onOpenCreateRFQFromPR(pr)}
                                className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-[10px] transition-colors flex items-center gap-1 shadow-2xs"
                                title="إنشاء RFQ"
                              >
                                <Send className="w-3 h-3" />
                                <span>RFQ</span>
                              </button>
                              <button
                                onClick={() => onOpenCreatePOFromPR(pr)}
                                className="px-2 py-1 bg-[#361D13] hover:bg-[#23120A] text-white rounded-lg font-bold text-[10px] transition-colors flex items-center gap-1 shadow-2xs"
                                title="إصدار أمر شراء مباشر"
                              >
                                <ShoppingCart className="w-3 h-3 text-[#C87A38]" />
                                <span>PO</span>
                              </button>
                            </div>
                          )}

                          <button
                            onClick={() => onOpenTraceability(undefined, pr)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
