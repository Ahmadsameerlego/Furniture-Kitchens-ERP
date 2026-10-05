import React from 'react';
import { X, ShoppingCart, Hammer, ArrowRightLeft, Calendar, Building2, Layers, CheckCircle2, FileText, UserCheck, AlertTriangle } from 'lucide-react';
import { SupplyProposal } from '../../../types/planning';
import { getProposalTypeBadge, getProposalStatusBadge, getPriorityBadge } from '../../../services/planningService';

interface ProposalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: SupplyProposal | null;
  onApprove?: (proposalId: string) => void;
  onConvertToProcurement?: (proposal: SupplyProposal) => void;
  onConvertToProduction?: (proposal: SupplyProposal) => void;
  onCancelProposal?: (proposalId: string) => void;
}

export const ProposalDetailsModal: React.FC<ProposalDetailsModalProps> = ({
  isOpen,
  onClose,
  proposal,
  onApprove,
  onConvertToProcurement,
  onConvertToProduction,
  onCancelProposal
}) => {
  if (!isOpen || !proposal) return null;

  const typeMeta = getProposalTypeBadge(proposal.proposalType);
  const statusMeta = getProposalStatusBadge(proposal.status);
  const priorityMeta = getPriorityBadge(proposal.priority);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              {proposal.proposalType === 'purchase_requisition' ? (
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
              ) : proposal.proposalType === 'planned_production' ? (
                <Hammer className="w-5 h-5 text-blue-400" />
              ) : (
                <ArrowRightLeft className="w-5 h-5 text-purple-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{proposal.proposalNumber}</h3>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${statusMeta.color}`}>
                  {statusMeta.label}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${priorityMeta.color}`}>
                  {priorityMeta.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{typeMeta.label} - {proposal.itemCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Item Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  البند المطلوب في خطة التوريد / الإنتاج
                </span>
                <h4 className="text-base font-bold text-slate-900">{proposal.itemName}</h4>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                  <span>كود: <strong className="text-slate-700">{proposal.itemCode}</strong></span>
                  <span>•</span>
                  <span>المشاريع: <strong className="text-slate-700">{proposal.projectNumbers.join(', ') || 'مخزون عام'}</strong></span>
                </div>
              </div>
              <div className="text-left">
                <span className="text-xs text-slate-400 block">الكمية المقترحة</span>
                <span className="text-xl font-bold text-indigo-700">{proposal.quantity} {proposal.uom}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">تكلفة الوحدة التقديرية</span>
                <span className="font-semibold text-slate-800">{(proposal.estimatedUnitCostEGP || 0).toLocaleString()} ج.م</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">إجمالي القيمة التقديرية</span>
                <span className="font-bold text-emerald-700">{(proposal.estimatedTotalCostEGP || 0).toLocaleString()} ج.م</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">مستودع الاستلام المستهدف</span>
                <span className="font-semibold text-slate-800">{proposal.targetWarehouseName}</span>
              </div>
            </div>
          </div>

          {/* Timing & Lead Time */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/70 text-xs">
              <span className="text-blue-600 font-bold block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                تاريخ الحاجة الفعلية
              </span>
              <span className="font-bold text-blue-950 text-sm">{proposal.requiredDate}</span>
              <span className="text-[10px] text-blue-700 block mt-1">تاريخ بدء مرحلة الإنتاج</span>
            </div>

            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/70 text-xs">
              <span className="text-amber-700 font-bold block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                تاريخ إصدار الأمر المقترح
              </span>
              <span className="font-bold text-amber-950 text-sm">{proposal.suggestedOrderDate}</span>
              <span className="text-[10px] text-amber-700 block mt-1">Order / Release Date</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-bold block mb-1">فترة التوريد / التصنيع</span>
              <span className="font-bold text-slate-800 text-sm">{proposal.leadTimeDays} يوم عمل</span>
              <span className="text-[10px] text-slate-500 block mt-1">Lead Time Required</span>
            </div>
          </div>

          {/* Supplier / Work Center Info */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <h5 className="font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              تفاصيل جهة التنفيذ
            </h5>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-slate-400 block mb-0.5">
                  {proposal.proposalType === 'purchase_requisition' ? 'المورد المفضل المقترح' : 'مركز العمل / الخط الإنتاجي'}
                </span>
                <span className="font-semibold text-slate-800">
                  {proposal.suggestedSupplierName || proposal.targetWorkCenterName || 'لم يحدد بعد'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">تم الإنشاء بواسطة / التاريخ</span>
                <span className="font-semibold text-slate-800">
                  {proposal.createdByUserName} ({proposal.createdDate})
                </span>
              </div>
            </div>

            {proposal.approvedByUserName && (
              <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2 text-emerald-700 font-semibold">
                <UserCheck className="w-4 h-4" />
                <span>تم الاعتماد بواسطة: {proposal.approvedByUserName} بتاريخ ({proposal.approvedDate})</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {proposal.notes && (
            <div className="p-3 bg-slate-100/70 rounded-xl border border-slate-200 text-xs text-slate-700">
              <span className="font-bold block mb-0.5 text-slate-800">ملاحظات التخطيط:</span>
              <p>{proposal.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div>
            {proposal.status === 'draft' && onCancelProposal && (
              <button
                type="button"
                onClick={() => {
                  onCancelProposal(proposal.id);
                  onClose();
                }}
                className="px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
              >
                إلغاء المقترح (Cancel)
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              إغلاق
            </button>

            {proposal.status === 'draft' && onApprove && (
              <button
                type="button"
                onClick={() => {
                  onApprove(proposal.id);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                اعتماد المقترح (Approve Proposal)
              </button>
            )}

            {proposal.status === 'approved' && proposal.proposalType === 'purchase_requisition' && onConvertToProcurement && (
              <button
                type="button"
                onClick={() => {
                  onConvertToProcurement(proposal);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <ShoppingCart className="w-4 h-4" />
                تحويل لطلب شراء بالمشتريات (Send to Procurement)
              </button>
            )}

            {proposal.status === 'approved' && proposal.proposalType === 'planned_production' && onConvertToProduction && (
              <button
                type="button"
                onClick={() => {
                  onConvertToProduction(proposal);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Hammer className="w-4 h-4" />
                تحويل لأمر تشغيل بالإنتاج (Send to Production)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
