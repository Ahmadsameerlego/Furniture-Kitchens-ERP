import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import { ProjectType } from '../../types/erp';
import { Ruler, X, CheckCircle2, Building, UserCheck, Calendar, Sparkles } from 'lucide-react';

interface ProjectFormModalProps {
  isOpen: boolean;
  initialCustomerId?: string;
  onClose: () => void;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  initialCustomerId,
  onClose
}) => {
  const { customers, availableBranches, users, createCustomProject, setSelectedProjectId, setActiveModule } = useERP();

  const [projectName, setProjectName] = useState('');
  const [customerId, setCustomerId] = useState(initialCustomerId || customers[0]?.id || '');
  const [branchId, setBranchId] = useState(availableBranches[0]?.id || 'branch-1');
  const [projectType, setProjectType] = useState<ProjectType>('kitchen');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState<number>(0);
  const [targetDeliveryDate, setTargetDeliveryDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10)
  );
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialCustomerId) {
      setCustomerId(initialCustomerId);
      const cust = customers.find(c => c.id === initialCustomerId);
      if (cust) {
        setProjectName(`مشروع ${cust.fullName} - تفصيل`);
        setBranchId(cust.branchId || availableBranches[0]?.id || 'branch-1');
        setAssignedUserId(cust.responsibleUserId || users[0]?.id || '');
      }
    } else {
      setCustomerId(customers[0]?.id || '');
      setProjectName('مشروع تفصيل جديد');
      setAssignedUserId(users[0]?.id || '');
    }
  }, [initialCustomerId, customers, availableBranches, users, isOpen]);

  if (!isOpen) return null;

  const selectedCustomer = customers.find(c => c.id === customerId);
  const selectedBranch = availableBranches.find(b => b.id === branchId);
  const selectedUser = users.find(u => u.id === assignedUserId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !selectedCustomer) return;

    const project = createCustomProject({
      projectName,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.fullName,
      customerPhone: selectedCustomer.phone,
      branchId: selectedBranch?.id || 'branch-1',
      branchName: selectedBranch?.name || 'المعرض الرئيسي',
      projectType,
      assignedUserId: selectedUser?.id || undefined,
      assignedUserName: selectedUser?.fullName || undefined,
      targetDeliveryDate,
      estimatedBudget: Number(estimatedBudget) || undefined,
      notes
    });

    onClose();
    // Take the user straight into the new project's 360 page so the sales cycle continues from there
    if (project?.id) {
      setSelectedProjectId(project.id);
      setActiveModule('custom_projects');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5 relative max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#361D13] text-white flex items-center justify-center font-bold border border-emerald-900">
              <Ruler className="w-5 h-5 text-[#C87A38]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                بدء وإنشاء مشروع تفصيل جديد (Custom Project)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تخصيص مسار التصنيع والرفع الهندسي وعروض الأسعار
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Customer Selection or Lock */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">العميل المرتبط بالمشروع *</label>
            {initialCustomerId && selectedCustomer ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 text-sm">{selectedCustomer.fullName}</span>
                  <span className="text-[11px] font-mono text-slate-500 font-bold dir-ltr">({selectedCustomer.phone})</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                  عميل محدد
                </span>
              </div>
            ) : (
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} - {c.phone}</option>
                ))}
              </select>
            )}
          </div>

          {/* Project Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم / عنوان المشروع *</label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="مثال: مطبخ مودرن ألماني - فيلا التجمع"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">نوع الشغل المطلوب *</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="kitchen">مطبخ تفصيل (Kitchen)</option>
                <option value="bedroom">غرفة نوم ماستر (Master Bedroom)</option>
                <option value="wardrobe">دريسنج روم / دولاب ملابس (Wardrobe)</option>
                <option value="tv_unit">وحدة تلفزيون وديكور (TV Unit)</option>
                <option value="living">غرفة معيشة متكاملة (Living Room)</option>
                <option value="furniture">فرش وأثاث تفصيل كامل (Custom)</option>
                <option value="other">أعمال خشبية أخرى</option>
              </select>
            </div>
          </div>

          {/* Branch & Assigned Designer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الفرع المسؤول</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                {availableBranches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">المصمم / المشرف الهندسي</label>
              <select
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName} ({u.title || u.roleId})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Delivery & Estimated Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">تاريخ التسليم المستهدف</label>
              <input
                type="date"
                value={targetDeliveryDate}
                onChange={(e) => setTargetDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الميزانية التقديرية للعميل (اختياري)</label>
              <input
                type="number"
                value={estimatedBudget || ''}
                onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                placeholder="مثال: 150000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-left"
                dir="ltr"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">ملاحظات وطلبات خاصة</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب مواصفات الخامات أو الألوان أو مواعيد المعاينة الميدانية..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30"
            ></textarea>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#361D13] hover:bg-[#23120A] text-white font-black shadow-lg transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#C87A38]" />
              <span>إنشاء المشروع وفتح ملف المتابعة</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
