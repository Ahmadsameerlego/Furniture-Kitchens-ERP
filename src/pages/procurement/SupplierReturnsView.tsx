import React, { useState } from 'react';
import { 
  RotateCcw, Search, Plus, Filter, AlertTriangle, CheckCircle2, 
  Clock, Package, FileText, ArrowUpRight, DollarSign, Building2,
  Calendar, Eye, ShieldAlert, XCircle, Printer
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ProcurementSupplierReturn, SupplierReturnStatus } from '../../types/procurement';

export const SupplierReturnsView: React.FC = () => {
  const { 
    procurementSupplierReturns, 
    enterprisePurchaseOrders, 
    suppliers,
    materials,
    createProcurementSupplierReturn,
    currentUser,
    branches
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReturn, setSelectedReturn] = useState<ProcurementSupplierReturn | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State for creating a return
  const [selectedPoId, setSelectedPoId] = useState('');
  const [reasonDescription, setReasonDescription] = useState('');
  const [returnItems, setReturnItems] = useState<{
    itemId: string;
    itemCode: string;
    itemName: string;
    returnedQuantity: number;
    uom: string;
    unitPrice: number;
    totalAmount: number;
    reasonDetail: string;
  }[]>([]);

  // Filter returns
  const filteredReturns = procurementSupplierReturns.filter(ret => {
    const matchesSearch = 
      ret.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ret.purchaseOrderNumber && ret.purchaseOrderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ret.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ret.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: SupplierReturnStatus) => {
    switch (status) {
      case 'draft':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"><Clock className="w-3.5 h-3.5" /> مسودة</span>;
      case 'pending_approval':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3.5 h-3.5" /> قيد الاعتماد</span>;
      case 'approved':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> معتمد للمرتجع</span>;
      case 'shipped_to_supplier':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"><RotateCcw className="w-3.5 h-3.5" /> تم شحن المرتجع</span>;
      case 'credited_by_vendor':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200"><CheckCircle2 className="w-3.5 h-3.5" /> تمت التسوية المالية</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200"><XCircle className="w-3.5 h-3.5" /> ملغي</span>;
    }
  };

  const handlePoChange = (poId: string) => {
    setSelectedPoId(poId);
    const po = enterprisePurchaseOrders.find(p => p.id === poId);
    if (po) {
      const items = po.items.filter(item => item.receivedQuantity > 0).map(item => ({
        itemId: item.itemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        returnedQuantity: Math.min(1, item.receivedQuantity),
        uom: item.uom,
        unitPrice: item.unitPrice,
        totalAmount: item.unitPrice * Math.min(1, item.receivedQuantity),
        reasonDetail: 'تلف / غير مطابق للمواصفات'
      }));
      setReturnItems(items);
    } else {
      setReturnItems([]);
    }
  };

  const handleItemQtyChange = (index: number, qty: number) => {
    const updated = [...returnItems];
    updated[index].returnedQuantity = qty;
    updated[index].totalAmount = qty * updated[index].unitPrice;
    setReturnItems(updated);
  };

  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const po = enterprisePurchaseOrders.find(p => p.id === selectedPoId);
    if (!po) return;

    const validItems = returnItems.filter(i => i.returnedQuantity > 0);
    if (validItems.length === 0) {
      alert('يرجى تحديد كمية للمواد المراد إرجاعها');
      return;
    }

    const totalRefundAmount = validItems.reduce((acc, curr) => acc + curr.totalAmount, 0);

    createProcurementSupplierReturn({
      returnNumber: `PRET-${new Date().getFullYear()}-${String(procurementSupplierReturns.length + 1).padStart(4, '0')}`,
      returnDate: new Date().toISOString().split('T')[0],
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      purchaseOrderId: po.id,
      purchaseOrderNumber: po.poNumber,
      branchId: po.branchId,
      branchName: po.branchName || 'المصنع الرئيسي',
      warehouseId: po.warehouseId,
      warehouseName: po.warehouseName || 'مستودع الخامات',
      status: 'pending_approval',
      items: validItems.map((item, idx) => ({
        id: `ret-item-${Date.now()}-${idx}`,
        itemId: item.itemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        quantity: item.returnedQuantity,
        uom: item.uom,
        unitCost: item.unitPrice,
        totalCost: item.totalAmount,
        defectReason: item.reasonDetail || reasonDescription || 'تلف صناعي'
      })),
      totalRefundAmount,
      reason: reasonDescription || 'عيوب فنية أو عدم مطابقة للمواصفات',
      processedByUserName: currentUser?.fullName || 'مسؤول المشتريات',
      notes: reasonDescription
    });

    setIsCreateOpen(false);
    setSelectedPoId('');
    setReturnItems([]);
    setReasonDescription('');
  };

  const totalReturnValue = procurementSupplierReturns.reduce((sum, r) => sum + r.totalRefundAmount, 0);
  const pendingApprovalsCount = procurementSupplierReturns.filter(r => r.status === 'pending_approval').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">مرتجعات الموردين (Supplier Returns)</h1>
              <p className="text-sm text-slate-500">إدارة وتسوية البضائع المرتجعة للموردين بسبب التلف أو عدم مطابقة المواصفات</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#361D13] text-white text-sm font-medium hover:bg-[#4a281b] transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء إذن إرجاع مورد</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">إجمالي طلبات المرتجعات</span>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{procurementSupplierReturns.length}</div>
          <div className="mt-1 text-xs text-slate-400">إذن مرتجع مسجل</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">قيد الاعتماد والمراجعة</span>
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-900">{pendingApprovalsCount}</div>
          <div className="mt-1 text-xs text-amber-600">بانتظار موافقة المشتريات والجودة</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">تمت التسوية المالية</span>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-900">
            {procurementSupplierReturns.filter(r => r.status === 'credited_by_vendor').length}
          </div>
          <div className="mt-1 text-xs text-emerald-600">إشعار دائن أو خصم مستحق</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm bg-purple-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700">إجمالي قيمة المرتجعات</span>
            <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-purple-900">
            {totalReturnValue.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
          </div>
          <div className="mt-1 text-xs text-purple-600">قيمة مالية مستردة أو تحت التسوية</div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث برقم المرتجع، أمر الشراء، أو اسم المورد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]/30 focus:border-[#C87A38]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['all', 'pending_approval', 'approved', 'shipped_to_supplier', 'credited_by_vendor'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-[#361D13] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' && 'الكل'}
              {st === 'pending_approval' && 'قيد الاعتماد'}
              {st === 'approved' && 'معتمد'}
              {st === 'shipped_to_supplier' && 'تم الشحن'}
              {st === 'credited_by_vendor' && 'تمت التسوية'}
            </button>
          ))}
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
              <tr>
                <th className="py-3 px-4">رقم إذن المرتجع</th>
                <th className="py-3 px-4">أمر الشراء / المورد</th>
                <th className="py-3 px-4">سبب الإرجاع</th>
                <th className="py-3 px-4">تاريخ الطلب</th>
                <th className="py-3 px-4">عدد الأصناف</th>
                <th className="py-3 px-4">إجمالي القيمة المستردة</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    لا توجد مرتجعات مطابقة لمعايير البحث
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {ret.returnNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{ret.supplierName}</div>
                      <div className="text-xs text-slate-400 font-mono">أمر شراء: {ret.purchaseOrderNumber || '—'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-xs border bg-amber-50 text-amber-700 border-amber-200">
                        {ret.reason}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                      {ret.returnDate}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {ret.items.length} صنف
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                      {ret.totalRefundAmount.toLocaleString()} ج.م
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(ret.status)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedReturn(ret)}
                        className="px-3 py-1 bg-slate-100 hover:bg-[#361D13] hover:text-white text-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-1 mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>تفاصيل</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">إذن مرتجع مورد: {selectedReturn.returnNumber}</h3>
                  <p className="text-xs text-slate-500">تفاصيل إرجاع المواد والتسوية المالية للمورد</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReturn(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block">المورد:</span>
                <span className="font-semibold text-slate-800">{selectedReturn.supplierName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">أمر الشراء الأصلي:</span>
                <span className="font-mono text-slate-800">{selectedReturn.purchaseOrderNumber || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">الحالة:</span>
                <div>{getStatusBadge(selectedReturn.status)}</div>
              </div>
              <div>
                <span className="text-slate-400 block">تاريخ الإذن:</span>
                <span className="font-mono text-slate-800">{selectedReturn.returnDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block">المسؤول:</span>
                <span className="text-slate-800">{selectedReturn.processedByUserName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">الفرع والمخزن:</span>
                <span className="text-slate-800 font-semibold">{selectedReturn.branchName} - {selectedReturn.warehouseName}</span>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">الأصناف المرتجعة</h4>
              <table className="w-full text-right text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">الكود</th>
                    <th className="py-2.5 px-3">اسم الصنف</th>
                    <th className="py-2.5 px-3">الكمية المرتجعة</th>
                    <th className="py-2.5 px-3">سعر الوحدة</th>
                    <th className="py-2.5 px-3">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedReturn.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{item.itemCode}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{item.itemName}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-700">{item.quantity} {item.uom}</td>
                      <td className="py-2.5 px-3 font-mono">{item.unitCost.toLocaleString()} ج.م</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{item.totalCost.toLocaleString()} ج.م</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={4} className="py-2.5 px-3 text-left">إجمالي قيمة المرتجع:</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-800">{selectedReturn.totalRefundAmount.toLocaleString()} ج.م</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Notes and description */}
            {selectedReturn.reason && (
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 text-xs">
                <span className="font-semibold text-amber-900 block mb-1">بيان سبب الإرجاع:</span>
                <p className="text-amber-800">{selectedReturn.reason}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة إذن الإرجاع</span>
              </button>
              <button
                onClick={() => setSelectedReturn(null)}
                className="px-4 py-2 bg-[#361D13] text-white rounded-xl text-xs font-medium hover:bg-[#4a281b]"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Return Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateReturn} className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">إنشاء إذن إرجاع بضاعة لمورد</h3>
              </div>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">أمر الشراء المرتبط (PO) *</label>
                <select
                  required
                  value={selectedPoId}
                  onChange={(e) => handlePoChange(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
                >
                  <option value="">-- اختر أمر شراء مستلم --</option>
                  {enterprisePurchaseOrders
                    .filter(po => ['partially_received', 'fully_received'].includes(po.status) || po.items.some(i => i.receivedQuantity > 0))
                    .map(po => (
                      <option key={po.id} value={po.id}>
                        {po.poNumber} - {po.supplierName} ({po.projectName || 'مخزون'})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">سبب الإرجاع الأساسي *</label>
                <input
                  type="text"
                  required
                  value={reasonDescription}
                  onChange={(e) => setReasonDescription(e.target.value)}
                  placeholder="معيب، غير مطابق للمواصفات، كمية زائدة..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
                />
              </div>
            </div>

            {/* Items selection */}
            {returnItems.length > 0 ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">حدد الكميات المراد إرجاعها من البنود المستلمة</label>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">الصنف</th>
                        <th className="py-2 px-3">سعر الوحدة</th>
                        <th className="py-2 px-3">كمية الإرجاع</th>
                        <th className="py-2 px-3">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {returnItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3">
                            <div className="font-semibold text-slate-800">{item.itemName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{item.itemCode}</div>
                          </td>
                          <td className="py-2 px-3 font-mono">{item.unitPrice.toLocaleString()} ج.م</td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              value={item.returnedQuantity}
                              onChange={(e) => handleItemQtyChange(idx, parseFloat(e.target.value) || 0)}
                              className="w-20 p-1 border border-slate-200 rounded text-center font-mono text-xs focus:ring-1 focus:ring-[#C87A38]"
                            />
                            <span className="mr-1 text-[11px] text-slate-500">{item.uom}</span>
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">
                            {item.totalAmount.toLocaleString()} ج.م
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              selectedPoId && (
                <div className="p-4 bg-amber-50 text-amber-700 rounded-xl text-xs text-center border border-amber-200">
                  لا توجد أصناف مستلمة مسجلة على أمر الشراء هذا حتى الآن.
                </div>
              )
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={returnItems.length === 0}
                className="px-5 py-2 bg-[#361D13] text-white rounded-xl text-xs font-semibold hover:bg-[#4a281b] disabled:opacity-50"
              >
                اعتماد وحفظ إذن المرتجع
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
