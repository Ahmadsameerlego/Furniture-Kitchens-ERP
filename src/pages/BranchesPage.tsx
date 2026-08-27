import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Branch } from '../types/erp';
import {
  MapPin,
  Building,
  Warehouse,
  Factory,
  Plus,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Phone,
  UserCheck,
  ShieldCheck,
  Star
} from 'lucide-react';
import { BranchFormModal } from '../components/modals/BranchFormModal';
import { MainBranchConfirmModal } from '../components/modals/MainBranchConfirmModal';

export const BranchesPage: React.FC = () => {
  const { branches, setMainBranch, addBranch, updateBranch, checkPermission } = useERP();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState<Branch | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [targetMainBranch, setTargetMainBranch] = useState<Branch | null>(null);

  const canCreate = checkPermission('settings', 'create');
  const canEdit = checkPermission('settings', 'edit');

  const currentMainBranch = branches.find(b => b.isMain) || null;

  const handleOpenMainConfirm = (branch: Branch) => {
    if (branch.isMain) return;
    setTargetMainBranch(branch);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmMainBranch = () => {
    if (targetMainBranch) {
      setMainBranch(targetMainBranch.id);
    }
  };

  const handleSaveBranch = (data: any) => {
    if (branchToEdit) {
      updateBranch(branchToEdit.id, data);
    } else {
      addBranch(data);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">هيكل المقرات والفروع (Branch Structure)</h1>
            <span className="bg-[#E06F28]/15 text-[#E06F28] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E06F28]/30">
              {branches.length} مقرات نشطة
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة المعارض والمخازن وورش التصنيع وتخصيص الفرع الرئيسي المعتمد للشركة
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => {
              setBranchToEdit(null);
              setIsFormModalOpen(true);
            }}
            className="px-5 py-2.5 bg-[#1C352D] hover:bg-[#142921] text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#E06F28]" />
            <span>إضافة مقر / فرع جديد</span>
          </button>
        )}
      </div>

      {/* Main Branch Highlight Banner */}
      {currentMainBranch && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#1C352D] via-[#142921] to-[#1C352D] text-white shadow-xl border border-emerald-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E06F28] text-white flex items-center justify-center shadow-lg font-black shrink-0">
              <Star className="w-6 h-6 fill-white text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                الفرع الرئيسي المعتمد للشركة (MAIN BRANCH):
              </span>
              <h3 className="text-lg font-black text-white">{currentMainBranch.name}</h3>
              <p className="text-xs text-emerald-100/80">{currentMainBranch.address}</p>
            </div>
          </div>

          <div className="text-xs text-emerald-200 bg-white/10 px-4 py-2 rounded-2xl border border-white/15">
            تُنسب حسابات العملاء والمعاملات الموحدة تلقائياً لهذا الفرع الرئيسي
          </div>
        </div>
      )}

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((branch) => {
          const typeIcons = {
            showroom: <Building className="w-5 h-5 text-emerald-700" />,
            warehouse: <Warehouse className="w-5 h-5 text-amber-700" />,
            workshop: <Factory className="w-5 h-5 text-indigo-700" />
          };

          const typeLabels = {
            showroom: 'معرض مبيعات (Showroom)',
            warehouse: 'مخزن مركزي (Warehouse)',
            workshop: 'ورشة تصنيع (Workshop)'
          };

          return (
            <div
              key={branch.id}
              className={`p-6 rounded-3xl bg-white border transition-all space-y-4 shadow-sm hover:shadow-md ${
                branch.isMain
                  ? 'border-emerald-500/60 ring-2 ring-emerald-500/20'
                  : 'border-slate-200/80'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                    branch.type === 'showroom' ? 'bg-emerald-50' :
                    branch.type === 'warehouse' ? 'bg-amber-50' : 'bg-indigo-50'
                  }`}>
                    {typeIcons[branch.type]}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">{branch.name}</h3>
                      {branch.isMain && (
                        <span className="bg-[#E06F28] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                          الفرع الرئيسي
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {typeLabels[branch.type]}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {canEdit && (
                    <button
                      onClick={() => {
                        setBranchToEdit(branch);
                        setIsFormModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="تعديل بيانات المقر"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{branch.address}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{branch.phone || 'غير مسجل'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>المدير: {branch.managerName || 'غير محدد'}</span>
                  </div>
                </div>

                {branch.capacity && (
                  <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-bold">
                    السعة / الوصف: {branch.capacity}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  branch.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  الحالة: {branch.status === 'active' ? 'نشط (Active)' : 'معطل'}
                </span>

                {!branch.isMain && canEdit && (
                  <button
                    onClick={() => handleOpenMainConfirm(branch)}
                    className="text-xs font-bold text-[#E06F28] hover:underline flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>تعيين كفرع رئيسي</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Modals */}
      <BranchFormModal
        isOpen={isFormModalOpen}
        branchToEdit={branchToEdit}
        onSave={handleSaveBranch}
        onClose={() => setIsFormModalOpen(false)}
      />

      <MainBranchConfirmModal
        isOpen={isConfirmModalOpen}
        targetBranch={targetMainBranch}
        currentMainBranch={currentMainBranch}
        onConfirm={handleConfirmMainBranch}
        onClose={() => setIsConfirmModalOpen(false)}
      />

    </div>
  );
};
