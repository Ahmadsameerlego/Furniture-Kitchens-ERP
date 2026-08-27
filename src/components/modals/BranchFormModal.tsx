import React, { useState, useEffect } from 'react';
import { Branch, LocationType } from '../../types/erp';
import { Building, Warehouse, Factory, X, CheckCircle } from 'lucide-react';

interface BranchFormModalProps {
  isOpen: boolean;
  branchToEdit?: Branch | null;
  onSave: (branchData: Omit<Branch, 'id' | 'createdDate'> | Partial<Branch>) => void;
  onClose: () => void;
}

export const BranchFormModal: React.FC<BranchFormModalProps> = ({
  isOpen,
  branchToEdit,
  onSave,
  onClose
}) => {
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [type, setType] = useState<LocationType>('showroom');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [managerName, setManagerName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [isMain, setIsMain] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    if (branchToEdit) {
      setName(branchToEdit.name);
      setNameEn(branchToEdit.nameEn);
      setType(branchToEdit.type);
      setAddress(branchToEdit.address);
      setPhone(branchToEdit.phone);
      setManagerName(branchToEdit.managerName || '');
      setCapacity(branchToEdit.capacity || '');
      setIsMain(branchToEdit.isMain);
      setStatus(branchToEdit.status);
    } else {
      setName('');
      setNameEn('');
      setType('showroom');
      setAddress('');
      setPhone('');
      setManagerName('');
      setCapacity('');
      setIsMain(false);
      setStatus('active');
    }
  }, [branchToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    onSave({
      name,
      nameEn: nameEn || name,
      type,
      address,
      phone,
      managerName,
      capacity,
      isMain,
      status
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 text-right space-y-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {branchToEdit ? 'تعديل بيانيات المقر/الفرع' : 'إضافة مقر تشغيلي جديد'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              تحديد تفاصيل المعارض والمخازن والورش التابعة للشركة
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
          
          {/* Location Type Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-2">نوع المقر التشغيلي *</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setType('showroom')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  type === 'showroom'
                    ? 'bg-[#1C352D] text-white border-[#1C352D] shadow-md font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Building className="w-5 h-5" />
                <span className="font-bold">معرض مبيعات</span>
                <span className="text-[10px] opacity-75">Showroom</span>
              </button>

              <button
                type="button"
                onClick={() => setType('warehouse')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  type === 'warehouse'
                    ? 'bg-[#1C352D] text-white border-[#1C352D] shadow-md font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Warehouse className="w-5 h-5" />
                <span className="font-bold">مخزن مركزي</span>
                <span className="text-[10px] opacity-75">Warehouse</span>
              </button>

              <button
                type="button"
                onClick={() => setType('workshop')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  type === 'workshop'
                    ? 'bg-[#1C352D] text-white border-[#1C352D] shadow-md font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Factory className="w-5 h-5" />
                <span className="font-bold">ورشة / مصنع</span>
                <span className="text-[10px] opacity-75">Workshop</span>
              </button>
            </div>
          </div>

          {/* Name Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم المقر باللغة العربية *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: معرض التجمع الرئيسي"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الاسم بالإنجليزية (English)</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Main Tagamoa Showroom"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30 focus:bg-white transition-all text-left"
                dir="ltr"
              />
            </div>
          </div>

          {/* Address & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">العنوان التفصيلي *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="الشارع - المنطقة - المدينة"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">رقم الهاتف التواصل</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010xxxxxxx"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30 focus:bg-white transition-all text-left"
                dir="ltr"
              />
            </div>
          </div>

          {/* Manager & Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم المدير المسؤول</label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="اسم مدير المقر"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">السعة الاستيعابية / الوصف</label>
              <input
                type="text"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="مثال: مساحة 2500 م2 أو طاقة 50 مشروع"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Status & Main Check */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">حالة الفرع:</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'active'}
                    onChange={() => setStatus('active')}
                    className="accent-[#1C352D]"
                  />
                  <span>نشط (Active)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'inactive'}
                    onChange={() => setStatus('inactive')}
                    className="accent-[#1C352D]"
                  />
                  <span>معطل (Inactive)</span>
                </label>
              </div>
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
              className="px-6 py-2.5 rounded-xl bg-[#1C352D] hover:bg-[#142921] text-white text-xs font-black shadow-lg transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-[#E06F28]" />
              <span>{branchToEdit ? 'حفظ التعديلات' : 'إضافة المقر الآن'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
