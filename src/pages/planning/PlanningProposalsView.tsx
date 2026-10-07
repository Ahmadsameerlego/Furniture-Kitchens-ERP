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
  AlertCircle,
  Calendar,
  Building2,
  Package,
  Layers
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
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#361D13] to-[#1E110B] text-[#E29555] flex items-center justify-center shadow-md">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1E110B] flex items-center gap-2">
                مقترحات التوريد والإنتاج (Supply Proposals)
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                مراجعة واعتماد مقترحات الشراء الخارجية وأوامر التشغيل وتمريرها للمشتريات أو صالة الإنتاج
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCreateModal}
            className="px-5 py-2.5 bg-gradient-to-r from-[#361D13] to-[#1E110B] hover:opacity-95 text-white rounded-2xl font-black text-xs shadow-md shadow-[#1E110B]/20 border border-[#C87A38]/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#E29555]" />
            <span>إنشاء مقترح يدوي جديد</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-amber-200 transition-colors">
          <div>
            <span className="text-xs font-bold text-slate-500 block">مقترحات بانتظار الاعتماد</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block font-mono">{draftCount}</span>
            <span className="text-[10px] text-amber-700/70 font-medium">تحتاج مراجعة مسؤول التخطيط</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-bold shadow-xs">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-blue-200 transition-colors">
          <div>
            <span className="text-xs font-bold text-slate-500 block">مقترحات معتمدة جاهزة للتحويل</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block font-mono">{approvedCount}</span>
            <span className="text-[10px] text-blue-700/70 font-medium">جاهزة للتمرير للمشتريات أو الورش</span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold shadow-xs">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-colors">
          <div>
            <span className="text-xs font-bold text-slate-500 block">تم تحويلها لمشتريات / إنتاج</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block font-mono">{convertedCount}</span>
            <span className="text-[10px] text-emerald-700/70 font-medium">صدرت بها أوامر رسمية</span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث بكود المقترح، البند، كود المشروع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38] focus:bg-white transition-all shadow-2xs font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38] font-bold text-slate-700"
          >
            <option value="all">كل الأنواع (All Types)</option>
            <option value="purchase_requisition">طلب شراء خارجي (Purchase Requisition)</option>
            <option value="planned_production">أمر تشغيل داخلي (Planned Production)</option>
            <option value="inter_warehouse_transfer">تحويل بين المستودعات</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38] font-bold text-slate-700"
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
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#1E110B]/5 text-slate-700 font-black border-b border-slate-200/80">
              <tr className="whitespace-nowrap">
                <th className="px-5 py-4 min-w-[200px]">كود المقترح والنوع</th>
                <th className="px-4 py-4 min-w-[220px]">البند المطلوب</th>
                <th className="px-4 py-4 min-w-[130px]">الكمية المقترحة</th>
                <th className="px-4 py-4 min-w-[160px]">المشاريع المرتبطة</th>
                <th className="px-4 py-4 text-center min-w-[120px]">تاريخ الإصدار</th>
                <th className="px-4 py-4 text-center min-w-[120px]">تاريخ الحاجة</th>
                <th className="px-4 py-4 text-center min-w-[140px]">الأولوية والحالة</th>
                <th className="px-5 py-4 text-center min-w-[150px]">الإجراءات والتحويل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-bold">
                    لا توجد مقترحات توريد أو إنتاج مطابقة لمعايير البحث
                  </td>
                </tr>
              ) : (
                filteredProposals.map((p) => {
                  const typeMeta = getProposalTypeBadge(p.proposalType);
                  const statusMeta = getProposalStatusBadge(p.status);
                  const priorityMeta = getPriorityBadge(p.priority);

                  return (
                    <tr key={p.id} className="hover:bg-amber-50/20 transition-colors">
                      {/* Code & Type */}
                      <td className="px-5 py-4">
                        <div className="font-mono font-black text-slate-900 flex items-center gap-1.5 text-xs">
                          {p.proposalType === 'purchase_requisition' ? (
                            <ShoppingCart className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : p.proposalType === 'planned_production' ? (
                            <Hammer className="w-4 h-4 text-blue-600 shrink-0" />
                          ) : (
                            <ArrowRightLeft className="w-4 h-4 text-purple-600 shrink-0" />
                          )}
                          <span>{p.proposalNumber}</span>
                        </div>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-lg font-bold border mt-1.5 inline-block whitespace-nowrap leading-relaxed ${typeMeta.color}`}>
                          {typeMeta.label}
                        </span>
                      </td>

                      {/* Item Details */}
                      <td className="px-4 py-4">
                        <div className="font-black text-[#1E110B] leading-relaxed text-xs">{p.itemName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 tracking-wider">{p.itemCode}</div>
                      </td>

                      {/* Quantity & Estimated Cost */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-mono font-black text-indigo-700 text-xs">{p.quantity} {p.uom}</span>
                        {p.estimatedTotalCostEGP && (
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5 font-bold">
                            {p.estimatedTotalCostEGP.toLocaleString()} ج.م
                          </span>
                        )}
                      </td>

                      {/* Projects */}
                      <td className="px-4 py-4">
                        {p.projectNumbers && p.projectNumbers.length > 0 ? (
                          <div>
                            <span className="font-mono font-bold text-slate-800 text-xs">{p.projectNumbers.join(', ')}</span>
                            {p.customerNames && (
                              <span className="text-[10px] text-slate-500 font-medium block mt-0.5 truncate max-w-[150px]">
                                {p.customerNames.join('، ')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">مخزون عام</span>
                        )}
                      </td>

                      {/* Suggested Order Date */}
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-amber-800 text-xs px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-200/80 inline-block">
                          {p.suggestedOrderDate}
                        </span>
                      </td>

                      {/* Required Date */}
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-800 text-xs px-2.5 py-1 bg-slate-100 rounded-lg inline-block">
                          {p.requiredDate}
                        </span>
                      </td>

                      {/* Status & Priority Badges (Fix: Clean pills with no vertical clipping) */}
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-[10px] px-2.5 py-1 rounded-xl font-bold border leading-normal inline-flex items-center justify-center whitespace-nowrap ${statusMeta.color}`}>
                            {statusMeta.label}
                          </span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-xl font-bold border leading-normal inline-flex items-center justify-center whitespace-nowrap ${priorityMeta.color}`}>
                            {priorityMeta.label}
                          </span>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* View details */}
                          <button
                            onClick={() => onSelectProposal(p)}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            title="عرض التفاصيل الكاملة"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Action: Approve Draft */}
                          {p.status === 'draft' && (
                            <button
                              onClick={() => onApproveProposal(p.id)}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl font-black text-xs transition-colors flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
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
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
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
                              className="px-3 py-1.5 bg-[#361D13] hover:bg-[#23120A] text-white rounded-xl font-black text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                              title="تحويل لأمر تشغيل بالإنتاج"
                            >
                              <Hammer className="w-3.5 h-3.5 text-[#E29555]" />
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

