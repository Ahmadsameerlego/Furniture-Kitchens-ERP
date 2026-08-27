import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Role, ModuleId } from '../types/erp';
import { ShieldCheck, Plus, Edit, Lock, Eye, CheckSquare, Download, Sparkles } from 'lucide-react';
import { RoleFormModal } from '../components/modals/RoleFormModal';

export const RolesPermissionsPage: React.FC = () => {
  const { roles, addRole, updateRolePermissions, checkPermission } = useERP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  const canCreate = checkPermission('settings', 'create');
  const canEdit = checkPermission('settings', 'edit');

  const handleSaveRole = (data: any) => {
    if (data.id) {
      updateRolePermissions(data.id, data.permissions);
    } else {
      addRole(data);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">الأدوار ومصفوفة الصلاحيات (Roles & Permissions Matrix)</h1>
            <span className="bg-[#E06F28]/15 text-[#E06F28] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E06F28]/30">
              {roles.length} أدوار معرفة
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            صياغة الصلاحيات حسب كل وحدة من وحدات ERP (عرض، إضافة، تعديل، حذف، اعتماد، تصدير)
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => {
              setRoleToEdit(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-[#1C352D] hover:bg-[#142921] text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#E06F28]" />
            <span>إنشاء دور مخصص جديد (Custom Role)</span>
          </button>
        )}
      </div>

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => {
          // Calculate enabled modules count
          const activeModulesCount = Object.values(role.permissions).filter(p => p.view).length;

          return (
            <div
              key={role.id}
              className={`p-6 rounded-3xl bg-white border transition-all space-y-4 shadow-sm hover:shadow-md ${
                role.id === 'role-superadmin'
                  ? 'border-emerald-500/60 ring-2 ring-emerald-500/20'
                  : 'border-slate-200/80'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1C352D] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5 text-[#1C352D]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{role.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      role.isSystem ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {role.isSystem ? 'دور افتراضي بالنظام' : 'دور مخصص (Custom)'}
                    </span>
                  </div>
                </div>

                {canEdit && (
                  <button
                    onClick={() => {
                      setRoleToEdit(role);
                      setIsModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="تعديل الصلاحيات"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed font-medium line-clamp-2">
                {role.description}
              </p>

              {/* Module access statistics */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">الوحدات المصرح بها:</span>
                <span className="text-[#1C352D] bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  {activeModulesCount} من 13 وحدة
                </span>
              </div>

              {/* Action */}
              {canEdit && (
                <button
                  onClick={() => {
                    setRoleToEdit(role);
                    setIsModalOpen(true);
                  }}
                  className="w-full py-2 bg-slate-50 hover:bg-[#1C352D] hover:text-white text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all text-center"
                >
                  تعديل مصفوفة الصلاحيات
                </button>
              )}

            </div>
          );
        })}
      </div>

      {/* Modal */}
      <RoleFormModal
        isOpen={isModalOpen}
        roleToEdit={roleToEdit}
        onSave={handleSaveRole}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
};
