import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Hammer, 
  ArrowRightLeft, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Eye, 
  Send, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { SupplyProposal } from '../../types/planning';
import { getProposalTypeBadge, getProposalStatusBadge, getPriorityBadge } from '../../services/planningService';

interface PlanningProposalsViewProps {
  proposals: SupplyProposal[];
  onOpenCreateModal: () => void;
  onSelectProposal: (proposal: SupplyProposal) => void;
  onApproveProposal: (proposalId: string) => void;
  onConvertToProcurement: (proposal: SupplyProposal) => void;
  onConvertToProduction: (proposal: SupplyProposal) => void;
}

export const PlanningProposalsView: React.FC<PlanningProposalsViewProps> = ({
  proposals,
  onOpenCreateModal,
  onSelectProposal,
  onApproveProposal,
  onConvertToProcurement,
  onConvertToProduction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProposals = proposals.filter(p => {
    const matchesSearch = 
      p.proposalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectNumbers.some(pn => pn.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'all' || p.proposalType === typeFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const draftCount = proposals.filter(p => p.status === 'draft').length;
  const approvedCount = proposals.filter(p => p.status === 'approved').length;
  const convertedCount = proposals.filter(p => p.status === 'converted_to_po' || p.status === 'converted_to_mo').length;

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-indigo-600" />
            مقترحات التوريد والإنتاج (Supply Proposals)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            مراجعة واعتماد أوامر الشراء المقترحة وأوامر التشغيل وتمريرها للمشتريات أو صالة الإنتاج
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إنشاء مقترح جديد
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">مقترحات بانتظار الاعتماد</span>
            <span className="text-2xl font-black text-amber-600">{draftCount} مقترح</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">مقترحات معتمدة جاهزة للتحويل</span>
            <span className="text-2xl font-black text-blue-600">{approvedCount} مقترح</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">تم تحويلها لمشتريات / إنتاج</span>
            <span className="text-2xl font-black text-emerald-600">{convertedCount} تم تمريره</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بكود المقترح، البند، كود المشروع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
          >
            <option value="all">كل الأنواع (All Types)</option>
            <option value="purchase_requisition">طلب شراء خارجي (Purchase Requisition)</option>
            <option value="planned_production">أمر تشغيل داخلي (Planned Production)</option>
            <option value="inter_warehouse_transfer">تحويل بين المستودعات</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
          >
            <option value="all">كل الحالات (All Statuses)</option>
            <option value="draft">مسودة مقترح (Draft)</option>
            <option value="approved">معتمد من التخطيط (Approved)</option>
            <option value="converted_to_po">تم التحويل لأمر شراء بالمشتريات</option>
            <option value="converted_to_mo">تم التحويل لأمر تصنيع بالورش</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/60">
              <tr>
                <th className="px-4 py-3.5">كود المقترح والنوع</th>
                <th className="px-4 py-3.5">البند المطلوب</th>
                <th className="px-4 py-3.5">الكمية المقترحة</th>
                <th className="px-4 py-3.5">المشاريع المرتبطة</th>
                <th className="px-4 py-3.5">تاريخ الإصدار المقترح</th>
                <th className="px-4 py-3.5">تاريخ الحاجة</th>
                <th className="px-4 py-3.5">الأولوية والحالة</th>
                <th className="px-4 py-3.5 text-center">الإجراءات والتحويل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    لا توجد مقترحات توريد أو إنتاج مطابقة لمعايير البحث
                  </td>
                </tr>
              ) : (
                filteredProposals.map((p) => {
                  const typeMeta = getProposalTypeBadge(p.proposalType);
                  const statusMeta = getProposalStatusBadge(p.status);
                  const priorityMeta = getPriorityBadge(p.priority);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {p.proposalType === 'purchase_requisition' ? (
                            <ShoppingCart className="w-4 h-4 text-emerald-600" />
                          ) : p.proposalType === 'planned_production' ? (
                            <Hammer className="w-4 h-4 text-blue-600" />
                          ) : (
                            <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                          )}
                          <span>{p.proposalNumber}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border mt-1 inline-block ${typeMeta.color}`}>
                          {typeMeta.label}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{p.itemName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.itemCode}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-indigo-700 text-sm">{p.quantity} {p.uom}</span>
                        {p.estimatedTotalCostEGP && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">{p.estimatedTotalCostEGP.toLocaleString()} ج.م</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-slate-700">
                        {p.projectNumbers && p.projectNumbers.length > 0 ? (
                          <div>
                            <span className="font-semibold">{p.projectNumbers.join(', ')}</span>
                            {p.customerNames && (
                              <span className="text-[11px] text-slate-500 block">{p.customerNames.join(', ')}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">مخزون عام</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-amber-700 font-medium">
                        {p.suggestedOrderDate}
                      </td>

                      <td className="px-4 py-3.5 text-slate-800 font-medium">
                        {p.requiredDate}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border block text-center ${statusMeta.color}`}>
                            {statusMeta.label}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border block text-center ${priorityMeta.color}`}>
                            {priorityMeta.label}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* View details */}
                          <button
                            onClick={() => onSelectProposal(p)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Action: Approve Draft */}
                          {p.status === 'draft' && (
                            <button
                              onClick={() => onApproveProposal(p.id)}
                              className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1"
                              title="اعتماد من التخطيط"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>اعتماد</span>
                            </button>
                          )}

                          {/* Action: Handover Approved to Procurement */}
                          {p.status === 'approved' && p.proposalType === 'purchase_requisition' && (
                            <button
                              onClick={() => onConvertToProcurement(p)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 shadow-xs"
                              title="تحويل لطلب شراء بالمشتريات"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>تحويل للمشتريات</span>
                            </button>
                          )}

                          {/* Action: Handover Approved to Production */}
                          {p.status === 'approved' && p.proposalType === 'planned_production' && (
                            <button
                              onClick={() => onConvertToProduction(p)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 shadow-xs"
                              title="تحويل لأمر تشغيل بالإنتاج"
                            >
                              <Hammer className="w-3.5 h-3.5" />
                              <span>تحويل للإنتاج</span>
                            </button>
                          )}

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

    </div>
  );
};
