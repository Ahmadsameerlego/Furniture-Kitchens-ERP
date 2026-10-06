import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { VariationOrder, VariationOrderItem, VariationOrderStatus } from '../types/sales';
import {
  History,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Plus,
  Clock,
  Printer,
  DollarSign,
  Calendar,
  Building,
  Ruler,
  AlertTriangle,
  X,
  Trash2,
  ArrowRight
} from 'lucide-react';

export const SalesChangeOrdersPage: React.FC = () => {
  const {
    variationOrders,
    customProjects,
    customContracts,
    availableBranches,
    setSelectedProjectId,
    setActiveModule,
    createVariationOrder,
    approveVariationOrder,
    rejectVariationOrder,
    currentUser
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVOForView, setSelectedVOForView] = useState<VariationOrder | null>(null);

  // Form State
  const [selectedProjectIdForAdd, setSelectedProjectIdForAdd] = useState(customProjects[0]?.id || '');
  const [reason, setReason] = useState('');
  const [deliveryDelayDays, setDeliveryDelayDays] = useState(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Omit<VariationOrderItem, 'id'>[]>([
    {
      changeType: 'upgrade_material',
      description: 'ترقية خامة / إضافة بند جديد',
      previousSpec: '',
      newSpec: '',
      costImpact: 0,
      priceImpact: 0
    }
  ]);

  // Filter Variation Orders
  const filteredOrders = variationOrders.filter(v => {
    const matchesSearch =
      v.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.projectNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.projectName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || v.status === selectedStatus;
    const matchesBranch = selectedBranch === 'all' || v.branchId === selectedBranch;

    return matchesSearch && matchesStatus && matchesBranch;
  });

  // Aggregate Metrics
  const totalPriceImpactSum = filteredOrders.reduce((s, v) => s + (v.totalPriceImpact || 0), 0);
  const totalCostImpactSum = filteredOrders.reduce((s, v) => s + (v.totalCostImpact || 0), 0);
  const pendingCount = filteredOrders.filter(v => v.status === 'pending_approval').length;
  const approvedCount = filteredOrders.filter(v => v.status === 'approved').length;

  const handleAddItemRow = () => {
    setItems([
      ...items,
      {
        changeType: 'add_item',
        description: '',
        previousSpec: '',
        newSpec: '',
        costImpact: 0,
        priceImpact: 0
      }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof Omit<VariationOrderItem, 'id'>, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const project = customProjects.find(p => p.id === selectedProjectIdForAdd) || customProjects[0];
    const contract = customContracts.find(c => c.projectId === project.id) || { id: 'cnt-auto', contractNumber: 'CNT-AUTO' };

    const totalPriceImpact = items.reduce((sum, item) => sum + Number(item.priceImpact || 0), 0);
    const totalCostImpact = items.reduce((sum, item) => sum + Number(item.costImpact || 0), 0);

    createVariationOrder({
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      projectId: project.id,
      projectNumber: project.projectNumber,
      projectName: project.projectName,
      customerId: project.customerId,
      customerName: project.customerName,
      customerPhone: project.customerPhone,
      branchId: project.branchId,
      branchName: project.branchName,
      requestedDate: new Date().toISOString().split('T')[0],
      requestedBy: 'customer',
      requestedByName: `${project.customerName} (العميل)`,
      reason,
      items: items.map((item, idx) => ({ ...item, id: `vi-${Date.now()}-${idx}` })),
      totalPriceImpact,
      totalCostImpact,
      deliveryDelayDays,
      notes
    });

    setIsAddModalOpen(false);
    setReason('');
    setNotes('');
    setItems([{ changeType: 'upgrade_material', description: '', newSpec: '', costImpact: 0, priceImpact: 0 }]);
  };

  const getStatusBadge = (status: VariationOrderStatus) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> معتمد وملحق بالعقد</span>;
      case 'pending_approval':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3.5 h-3.5" /> قيد المراجعة والاعتماد</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200"><XCircle className="w-3.5 h-3.5" /> مرفوض</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#361D13] to-[#5a3222] text-[#C87A38] flex items-center justify-center shadow-md">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">أوامر التغيير والتعديلات بعد التعاقد (Variation Orders)</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              توثيق تعديلات العميل على الخامات والمقاسات، حساب فروق التكلفة والأسعار (+/-)، وتحديث أوامر المصنع والعقد
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-[#361D13] hover:bg-[#4a281b] text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#C87A38]" />
          <span>طلب أمر تغيير جديد (Variation)</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي أوامر التغيير</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{filteredOrders.length}</span>
            <span className="text-xs text-slate-500 font-bold">أمر تغيير</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-bold block mt-1">✓ {approvedCount} معتمد ومطبق</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">صافي القيمة المضافة للعقود</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">+{totalPriceImpactSum.toLocaleString('ar-EG')}</span>
            <span className="text-xs text-slate-500 font-bold">ج.م</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">تعديل تلقائي على قيمة العقود</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">فروق تكلفة الخامات المضافة</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-700">+{totalCostImpactSum.toLocaleString('ar-EG')}</span>
            <span className="text-xs text-slate-500 font-bold">ج.م</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">محدثة في الـ BOM بالمكتب الفني</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">أوامر قيد المراجعة والاعتماد</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
            <span className="text-xs text-slate-500 font-bold">طلب معلق</span>
          </div>
          <span className="text-[11px] text-amber-700 font-medium block mt-1">بانتظار موافقة الإدارة والمكتب الفني</span>
        </div>

      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث برقم الأمر VAR، كود المشروع، اسم العميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pr-10 pl-4 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-[#C87A38] focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="تصفية حسب الحالة"
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">جميع الحالات</option>
              <option value="approved">معتمد (Approved)</option>
              <option value="pending_approval">قيد المراجعة</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2">
            <Building className="w-4 h-4 text-slate-400" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              aria-label="تصفية حسب الفرع"
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">جميع الفروع</option>
              {availableBranches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-black text-slate-600 uppercase tracking-wider">
                <th className="py-4 px-5">رقم التعديل والمشروع</th>
                <th className="py-4 px-5">العميل والتاريخ</th>
                <th className="py-4 px-5">تفاصيل بنود التعديل المطلوب</th>
                <th className="py-4 px-5">فارق السعر (+ / -)</th>
                <th className="py-4 px-5">تأثير التسليم</th>
                <th className="py-4 px-5">حالة الاعتماد</th>
                <th className="py-4 px-5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="font-bold">لا توجد أوامر تغيير مسجلة</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Order # & Project */}
                    <td className="py-4 px-5">
                      <div className="font-black text-slate-900 font-mono text-sm">{v.orderNumber}</div>
                      <div className="text-slate-600 font-bold mt-0.5">{v.projectName}</div>
                      <span className="text-[11px] font-mono text-slate-400 block">{v.projectNumber} | {v.contractNumber}</span>
                    </td>

                    {/* Customer & Date */}
                    <td className="py-4 px-5">
                      <div className="font-black text-slate-900">{v.customerName}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">طلب بواسطة: {v.requestedByName}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5 font-mono">تاريخ الطلب: {v.requestedDate}</div>
                    </td>

                    {/* Change Items Summary */}
                    <td className="py-4 px-5 max-w-sm">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800 line-clamp-1">{v.reason}</p>
                        <div className="text-[11px] text-slate-500">
                          {v.items.length} بنود معدلة: {v.items.map(i => i.description).join(' | ')}
                        </div>
                      </div>
                    </td>

                    {/* Price & Cost Impact */}
                    <td className="py-4 px-5">
                      <div className={`text-sm font-black font-mono ${v.totalPriceImpact >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {v.totalPriceImpact >= 0 ? '+' : ''}{v.totalPriceImpact?.toLocaleString('ar-EG')} ج.م
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        التكلفة: +{v.totalCostImpact?.toLocaleString('ar-EG')} ج.م
                      </span>
                    </td>

                    {/* Delivery Delay */}
                    <td className="py-4 px-5">
                      {v.deliveryDelayDays > 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold text-[11px] border border-amber-200">
                          <Clock className="w-3 h-3" /> +{v.deliveryDelayDays} أيام عمل
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">بدون تأخير</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5">
                      {getStatusBadge(v.status)}
                      {v.approvedByName && (
                        <span className="text-[10px] text-slate-500 block mt-1">
                          معتمد من: {v.approvedByName}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedVOForView(v)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-[#361D13] hover:text-white text-slate-700 transition-all cursor-pointer"
                          title="معاينة أمر التغيير والاعتماد"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedProjectId(v.projectId);
                            setActiveModule('custom_projects');
                          }}
                          className="p-2 rounded-xl bg-[#C87A38]/10 hover:bg-[#C87A38] hover:text-white text-[#C87A38] transition-all cursor-pointer"
                          title="فتح ملف المشروع"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Variation Order Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#C87A38]/10 text-[#C87A38] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">طلب أمر تغيير رسمي (New Variation Order)</h3>
                  <p className="text-xs text-slate-500">توثيق طلب العميل لتعديل المقاسات أو الخامات بعد التعاقد</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5 text-xs">
              
              {/* Project select */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">المشروع والعقد المرتبط *</label>
                <select
                  value={selectedProjectIdForAdd}
                  onChange={(e) => setSelectedProjectIdForAdd(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#C87A38]"
                >
                  {customProjects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.projectNumber} - {p.projectName} ({p.customerName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">سبب وموضوع التعديل *</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="مثال: ترقية الرخام إلى كوارتز أسباني وإضافة وحدة إضاءة ليد للجزيرة..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#C87A38]"
                />
              </div>

              {/* Change Items list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">بنود التعديل والتسعير (+/-) *</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-bold text-[#C87A38] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة بند تعديل
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">بند #{idx + 1}</span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-500 text-[11px] mb-0.5">نوع التعديل</label>
                          <select
                            value={item.changeType}
                            onChange={(e) => handleItemChange(idx, 'changeType', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800"
                          >
                            <option value="upgrade_material">ترقية خامة / إكسسوار</option>
                            <option value="add_item">إضافة وحدة / صنف جديد</option>
                            <option value="dimension_change">تعديل مقاسات</option>
                            <option value="remove_item">إلغاء / استبعاد بند</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[11px] mb-0.5">وصف التعديل</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            placeholder="وصف البند..."
                            required
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-500 text-[11px] mb-0.5">فرق سعر البيع للعميل (ج.م) *</label>
                          <input
                            type="number"
                            value={item.priceImpact}
                            onChange={(e) => handleItemChange(idx, 'priceImpact', Number(e.target.value))}
                            required
                            placeholder="+ / - ج.م"
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[11px] mb-0.5">فرق تكلفة الخامات (ج.م)</label>
                          <input
                            type="number"
                            value={item.costImpact}
                            onChange={(e) => handleItemChange(idx, 'costImpact', Number(e.target.value))}
                            placeholder="التكلفة الداخلية"
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono text-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delay and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">أيام تأخير إضافية على مدة التسليم</label>
                  <input
                    type="number"
                    value={deliveryDelayDays}
                    onChange={(e) => setDeliveryDelayDays(Number(e.target.value))}
                    min={0}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ملاحظات إضافية</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ملاحظات..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Submit buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-[#361D13] hover:bg-[#4a281b] text-white px-5 py-2 rounded-xl font-black shadow-md transition-all cursor-pointer"
                >
                  حفظ وتقديم أمر التغيير
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* View & Approve Modal */}
      {selectedVOForView && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">تفاصيل أمر التغيير (Variation Order)</h3>
                  <span className="text-xs font-mono text-slate-500">{selectedVOForView.orderNumber} | {selectedVOForView.projectNumber}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVOForView(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 block mb-0.5">العميل</span>
                  <strong className="text-slate-900">{selectedVOForView.customerName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">فرق السعر الإجمالي</span>
                  <strong className="text-emerald-700 font-mono font-black text-sm">
                    {selectedVOForView.totalPriceImpact >= 0 ? '+' : ''}{selectedVOForView.totalPriceImpact?.toLocaleString('ar-EG')} ج.م
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">الحالة</span>
                  {getStatusBadge(selectedVOForView.status)}
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-800">سبب وموضوع التعديل:</h5>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700 border border-slate-200/60">{selectedVOForView.reason}</p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-800">بنود التعديل التفصيلية:</h5>
                <div className="space-y-2">
                  {selectedVOForView.items.map((i, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-800">{i.description}</strong>
                        {i.newSpec && <p className="text-[11px] text-slate-500 mt-0.5">{i.newSpec}</p>}
                      </div>
                      <span className="font-mono font-black text-emerald-700">
                        {i.priceImpact >= 0 ? '+' : ''}{i.priceImpact?.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedVOForView.notes && (
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-900 text-xs">
                  <strong>ملاحظات:</strong> {selectedVOForView.notes}
                </div>
              )}

            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              {selectedVOForView.status === 'pending_approval' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      approveVariationOrder(selectedVOForView.id, currentUser.fullName);
                      setSelectedVOForView(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>اعتماد أمر التغيير وتعديل العقد</span>
                  </button>
                  <button
                    onClick={() => {
                      rejectVariationOrder(selectedVOForView.id, currentUser.fullName, 'تم الرفض بواسطة الإدارة');
                      setSelectedVOForView(null);
                    }}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>رفض التعديل</span>
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-bold">تم البت في هذا الأمر مسبقاً</span>
              )}

              <button
                onClick={() => setSelectedVOForView(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold"
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
