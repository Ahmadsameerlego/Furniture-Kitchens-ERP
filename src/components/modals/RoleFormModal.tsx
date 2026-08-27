import React, { useState, useEffect } from 'react';
import { Role, ModuleId, PermissionActions, ModulePermissions } from '../../types/erp';
import { Shield, X, CheckCircle2, Lock, Eye, Plus, Edit, Trash2, CheckSquare, Download } from 'lucide-react';

interface RoleFormModalProps {
  isOpen: boolean;
  roleToEdit?: Role | null;
  onSave: (roleData: Omit<Role, 'id'> | { id: string; permissions: ModulePermissions }) => void;
  onClose: () => void;
}

const moduleNames: { id: ModuleId; name: string; description: string }[] = [
  { id: 'dashboard', name: 'لوحة التحكم والرؤية الشاملة', description: 'التحليلات والمؤشرات العامة للشركة' },
  { id: 'customers', name: 'إدارة العملاء وخدمة العملاء', description: 'بيانات وإحصائيات وسجل تعامل العملاء' },
  { id: 'sales', name: 'المبيعات وعقود المعارض', description: 'أوامر البيع والتحصيل وعروض الأسعار' },
  { id: 'custom_projects', name: 'المشاريع والتفصيل للمطابخ والأثاث', description: 'المقاسات والتصميمات وأوامر الشغل' },
  { id: 'products', name: 'كتالوج المنتجات الجاهزة', description: 'كتالوج الأثاث الجاهز والمواصفات' },
  { id: 'materials', name: 'خامات ومكونات التصنيع', description: 'الأخشاب والألواح والمسطحات والإكسسوارات' },
  { id: 'inventory', name: 'المخزون والحركات المخزنية', description: 'أرصدة المعارض والتسويات والتحويلات' },
  { id: 'suppliers', name: 'الموردين والمشتريات', description: 'حسابات موردي الأخشاب والمستلزمات' },
  { id: 'production', name: 'الإنتاج ومراحل الورش', description: 'تتبع خروج أوامر التصنيع بالورش' },
  { id: 'finance', name: 'المالية والخزينة والحسابات', description: 'الإيرادات والمصروفات والشيكات والتدفقات' },
  { id: 'reports', name: 'التقارير الإدارية والتحليلية', description: 'تقارير الأرباح والمبيعات والمخزون' },
  { id: 'notifications', name: 'الإشعارات والتنبيهات', description: 'تنبيهات النظام والمبيعات والتصنيع' },
  { id: 'settings', name: 'إعدادات النظام والأمن', description: 'تكوين الشركة والفروع والأدوار والأمن' }
];

const emptyModulePermissions = (): ModulePermissions => {
  const perms = {} as ModulePermissions;
  moduleNames.forEach(m => {
    perms[m.id] = { view: false, create: false, edit: false, delete: false, approve: false, export: false };
  });
  return perms;
};

export const RoleFormModal: React.FC<RoleFormModalProps> = ({
  isOpen,
  roleToEdit,
  onSave,
  onClose
}) => {
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<ModulePermissions>(emptyModulePermissions());

  useEffect(() => {
    if (roleToEdit) {
      setName(roleToEdit.name);
      setNameEn(roleToEdit.nameEn);
      setDescription(roleToEdit.description);
      setPermissions(roleToEdit.permissions);
    } else {
      setName('');
      setNameEn('');
      setDescription('');
      setPermissions(emptyModulePermissions());
    }
  }, [roleToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleAction = (module: ModuleId, action: keyof PermissionActions) => {
    setPermissions(prev => {
      const current = prev[module];
      const nextValue = !current[action];

      // If user enables create/edit/delete/approve/export, auto-enable view
      let updatedModule = { ...current, [action]: nextValue };
      if (nextValue && action !== 'view') {
        updatedModule.view = true;
      }
      // If user disables view, auto-disable all actions
      if (!nextValue && action === 'view') {
        updatedModule = { view: false, create: false, edit: false, delete: false, approve: false, export: false };
      }

      return {
        ...prev,
        [module]: updatedModule
      };
    });
  };

  const toggleFullModule = (module: ModuleId, enable: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        view: enable,
        create: enable,
        edit: enable,
        delete: enable,
        approve: enable,
        export: enable
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (roleToEdit) {
      onSave({
        id: roleToEdit.id,
        permissions
      });
    } else {
      onSave({
        name,
        nameEn: nameEn || name,
        description,
        isSystem: false,
        permissions
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 text-right space-y-6 relative max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E06F28]/10 text-[#E06F28] flex items-center justify-center border border-[#E06F28]/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {roleToEdit ? `محرر صلاحيات الدور: ${roleToEdit.name}` : 'إنشاء دور مخصص جديد (Custom Role)'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تحديد دقيق ومبسط لمصفوفة الصلاحيات (Permission Matrix) مقسمة حسب الوحدات
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          
          {/* Role Metadata */}
          {!roleToEdit?.isSystem && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block font-bold text-slate-700 mb-1">مسمى الدور بالعربية *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: مشرف الورشة والتصنيع"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">وصف المسؤوليات</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر لمسؤوليات صاحب هذا الدور"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30 transition-all"
                />
              </div>
            </div>
          )}

          {/* Module Permission Matrix UI */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="font-black text-slate-900 text-sm">مصفوفة الصلاحيات لكل وحدة من وحدات النظام:</span>
              <span className="text-[11px] text-slate-500">اختر من الأزرار الملونة بدقة للتفعيل/الإلغاء</span>
            </div>

            <div className="space-y-2">
              {moduleNames.map(module => {
                const perms = permissions[module.id] || { view: false, create: false, edit: false, delete: false, approve: false, export: false };
                const isAnyActive = Object.values(perms).some(Boolean);

                return (
                  <div
                    key={module.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isAnyActive
                        ? 'bg-white border-[#1C352D]/30 shadow-sm'
                        : 'bg-slate-50/70 border-slate-200 opacity-80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      {/* Module Title & Enable All Toggle */}
                      <div className="flex items-center justify-between sm:justify-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleFullModule(module.id, !isAnyActive)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors text-xs font-bold ${
                            isAnyActive ? 'bg-[#1C352D] text-white' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                          }`}
                          title={isAnyActive ? 'إلغاء كل الصلاحيات للوحدة' : 'منح كل الصلاحيات للوحدة'}
                        >
                          {isAnyActive ? '✓' : '+'}
                        </button>

                        <div>
                          <p className="font-bold text-slate-900 text-xs">{module.name}</p>
                          <p className="text-[10px] text-slate-500">{module.description}</p>
                        </div>
                      </div>

                      {/* Action Pill Toggles */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {/* View */}
                        <button
                          type="button"
                          onClick={() => toggleAction(module.id, 'view')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                            perms.view
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض</span>
                        </button>

                        {/* Create */}
                        <button
                          type="button"
                          onClick={() => toggleAction(module.id, 'create')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                            perms.create
                              ? 'bg-blue-100 text-blue-900 border border-blue-300 shadow-xs'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة</span>
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => toggleAction(module.id, 'edit')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                            perms.edit
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => toggleAction(module.id, 'delete')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                            perms.delete
                              ? 'bg-rose-100 text-rose-900 border border-rose-300 shadow-xs'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>

                        {/* Approve */}
                        <button
                          type="button"
                          onClick={() => toggleAction(module.id, 'approve')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                            perms.approve
                              ? 'bg-purple-100 text-purple-900 border border-purple-300 shadow-xs'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>اعتماد</span>
                        </button>

                        {/* Export */}
                        <button
                          type="button"
                          onClick={() => toggleAction(module.id, 'export')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                            perms.export
                              ? 'bg-slate-800 text-white border border-slate-900 shadow-xs'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>تصدير</span>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#E06F28] hover:bg-[#E06F28]/90 text-white text-xs font-black shadow-lg transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>حفظ مصفوفة الصلاحيات</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
