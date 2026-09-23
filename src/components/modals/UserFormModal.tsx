import React, { useState, useEffect } from 'react';
import { User, Role, Branch } from '../../types/erp';
import { UserCheck, Shield, MapPin, X, CheckCircle, AlertCircle } from 'lucide-react';

interface UserFormModalProps {
  isOpen: boolean;
  userToEdit?: User | null;
  roles: Role[];
  branches: Branch[];
  onSave: (userData: Omit<User, 'id' | 'createdDate' | 'lastLogin'> | Partial<User>) => void;
  onClose: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  userToEdit,
  roles,
  branches,
  onSave,
  onClose
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [roleId, setRoleId] = useState('');
  const [assignedBranchIds, setAssignedBranchIds] = useState<string[]>([]);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (userToEdit) {
      setFullName(userToEdit.fullName);
      setEmail(userToEdit.email);
      setPhone(userToEdit.phone);
      setTitle(userToEdit.title || '');
      setRoleId(userToEdit.roleId);
      setAssignedBranchIds(userToEdit.assignedBranchIds);
      setStatus(userToEdit.status);
      setAvatar(userToEdit.avatar);
    } else {
      setFullName('');
      setEmail('');
      setPhone('');
      setTitle('');
      setRoleId(roles[0]?.id || '');
      setAssignedBranchIds(branches.map(b => b.id)); // Default all branches
      setStatus('active');
      setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');
    }
  }, [userToEdit, roles, branches, isOpen]);

  if (!isOpen) return null;

  const toggleBranchSelection = (branchId: string) => {
    if (assignedBranchIds.includes(branchId)) {
      // Prevent leaving user with zero branches
      if (assignedBranchIds.length === 1) return;
      setAssignedBranchIds(prev => prev.filter(id => id !== branchId));
    } else {
      setAssignedBranchIds(prev => [...prev, branchId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !roleId || assignedBranchIds.length === 0) return;

    onSave({
      fullName,
      email,
      phone,
      title,
      roleId,
      assignedBranchIds,
      status,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 text-right space-y-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {userToEdit ? 'تعديل بيانات الحساب والصلاحيات' : 'إضافة موظف/مستخدم جديد'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ربط الموظف بالدور الوظيفي والفروع المسموح له بالعمل بها أمنياً
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Main User Profile Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الاسم بالكامل *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="اسم الموظف الثلاثي"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني (اسم المستخدم) *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@furnitureland.eg"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 focus:bg-white transition-all text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">رقم الهاتف التواصل</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010xxxxxxx"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 focus:bg-white transition-all text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">المسمى الوظيفي</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: مشرف مبيعات المعرض الرئيسي"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Section 11: Role Selection (WHAT) */}
          <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#C87A38]" />
                <span className="font-bold text-emerald-100 text-xs">1. الدور الوظيفي (WHAT) — ما المسموح له بتنفيذه؟</span>
              </div>
              <span className="text-[10px] text-emerald-300 bg-emerald-900/50 px-2 py-0.5 rounded border border-emerald-700">
                مصفوفة الصلاحيات
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {roles.map(role => (
                <label
                  key={role.id}
                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                    roleId === role.id
                      ? 'bg-[#C87A38] text-white border-[#C87A38] font-bold shadow-md'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-emerald-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="userRole"
                    checked={roleId === role.id}
                    onChange={() => setRoleId(role.id)}
                    className="mt-1 accent-[#C87A38]"
                  />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-xs truncate">{role.name}</p>
                    <p className="text-[10px] opacity-80 line-clamp-1 mt-0.5">{role.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Section 11: Branch Access Selection (WHERE) */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-100 text-xs">2. نطاق الفروع المسموح بها (WHERE) — أين يمكنه العمل؟</span>
              </div>
              <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {assignedBranchIds.length} فروع مخصصة
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              اختر الفروع والمقارات المصرح لهذا الموظف بالنفاذ لرؤية بياناتها فقط.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {branches.map(branch => {
                const isChecked = assignedBranchIds.includes(branch.id);

                return (
                  <label
                    key={branch.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-emerald-900/60 text-white border-emerald-500 font-bold'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleBranchSelection(branch.id)}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                      <div>
                        <span className="text-xs">{branch.name}</span>
                        {branch.isMain && (
                          <span className="mr-1 text-[9px] bg-[#C87A38] px-1.5 py-0.2 rounded font-bold">
                            رئيسي
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {assignedBranchIds.length === 0 && (
              <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-200 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>يجب تحديد فرع واحد على الأقل للموظف!</span>
              </div>
            )}
          </div>

          {/* Status & Submit */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={status === 'active'}
                onChange={(e) => setStatus(e.target.checked ? 'active' : 'inactive')}
                className="w-4 h-4 accent-[#361D13] rounded"
              />
              <span>حساب نشط (Active User)</span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={assignedBranchIds.length === 0}
                className="px-6 py-2.5 rounded-xl bg-[#361D13] hover:bg-[#23120A] disabled:opacity-50 text-white text-xs font-black shadow-lg transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-[#C87A38]" />
                <span>{userToEdit ? 'حفظ البيانات المحدثة' : 'إنشاء الحساب والتكليف'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
