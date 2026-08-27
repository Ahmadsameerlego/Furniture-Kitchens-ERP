import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import { Customer, CustomerStatus, CustomerSource, LostReason } from '../../types/erp';
import { CrmService } from '../../services/crmService';
import { Users, Phone, MapPin, Sparkles, X, CheckCircle, AlertTriangle, Building, ShieldAlert } from 'lucide-react';

interface CustomerFormModalProps {
  isOpen: boolean;
  customerToEdit?: Customer | null;
  onSave: (data: any) => void;
  onClose: () => void;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  customerToEdit,
  onSave,
  onClose
}) => {
  const { availableBranches, campaigns, users, customers, setSelectedCustomerId, setActiveModule } = useERP();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('القاهرة');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [interestType, setInterestType] = useState<'furniture' | 'kitchens' | 'both'>('both');
  const [status, setStatus] = useState<CustomerStatus>('new');
  const [source, setSource] = useState<CustomerSource>('instagram');
  const [campaignId, setCampaignId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [responsibleUserId, setResponsibleUserId] = useState('');
  const [notes, setNotes] = useState('');

  // Duplicate Warning Dialog State
  const [duplicateWarning, setDuplicateWarning] = useState<{ isDuplicate: boolean; existingCustomer?: Customer } | null>(null);

  useEffect(() => {
    if (customerToEdit) {
      setFullName(customerToEdit.fullName);
      setPhone(customerToEdit.phone);
      setAltPhone(customerToEdit.altPhone || '');
      setEmail(customerToEdit.email || '');
      setCity(customerToEdit.city || 'القاهرة');
      setArea(customerToEdit.area || '');
      setAddress(customerToEdit.address || '');
      setInterestType(customerToEdit.interestType);
      setStatus(customerToEdit.status);
      setSource(customerToEdit.source);
      setCampaignId(customerToEdit.campaignId || '');
      setBranchId(customerToEdit.branchId);
      setResponsibleUserId(customerToEdit.responsibleUserId || '');
      setNotes(customerToEdit.notes || '');
      setDuplicateWarning(null);
    } else {
      setFullName('');
      setPhone('');
      setAltPhone('');
      setEmail('');
      setCity('القاهرة');
      setArea('');
      setAddress('');
      setInterestType('both');
      setStatus('new');
      setSource('instagram');
      setCampaignId(campaigns[0]?.id || '');
      setBranchId(availableBranches[0]?.id || 'branch-1');
      setResponsibleUserId(users[0]?.id || '');
      setNotes('');
      setDuplicateWarning(null);
    }
  }, [customerToEdit, availableBranches, campaigns, users, isOpen]);

  // Real-time Phone Duplicate Check on Blur
  const handlePhoneBlur = () => {
    if (!phone.trim()) return;
    const check = CrmService.checkDuplicatePhone(phone, customers, customerToEdit?.id);
    if (check.isDuplicate) {
      setDuplicateWarning(check);
    } else {
      setDuplicateWarning(null);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !branchId) return;

    // Check duplicate again if not warned yet
    if (!duplicateWarning) {
      const check = CrmService.checkDuplicatePhone(phone, customers, customerToEdit?.id);
      if (check.isDuplicate) {
        setDuplicateWarning(check);
        return;
      }
    }

    const selectedBranch = availableBranches.find(b => b.id === branchId);
    const selectedCampaign = campaigns.find(c => c.id === campaignId);
    const selectedUser = users.find(u => u.id === responsibleUserId);

    onSave({
      fullName,
      phone,
      altPhone,
      email,
      city,
      area,
      address,
      interestType,
      status,
      source,
      campaignId: campaignId || undefined,
      campaignName: selectedCampaign?.name || undefined,
      branchId,
      branchName: selectedBranch?.name || 'المعرض الرئيسي',
      responsibleUserId: responsibleUserId || undefined,
      responsibleUserName: selectedUser?.fullName || undefined,
      notes,
      avatar: customerToEdit?.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5 relative max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1C352D] flex items-center justify-center font-bold border border-emerald-200">
              <Users className="w-5 h-5 text-[#1C352D]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {customerToEdit ? `تعديل بيانات العميل: ${customerToEdit.fullName}` : 'تسجيل عميل جديد (New Contact)'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                إدخال بيانات التنافس والحملات وتخصيص الفرع المسؤول
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

        {/* Section 10: Duplicate Warning Alert Banner */}
        {duplicateWarning?.isDuplicate && duplicateWarning.existingCustomer && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-black text-xs text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <span>تنبيه أمان: يوجد عميل مسجل سابقاً برقم الهاتف هذا!</span>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-amber-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">العميل المسجل: {duplicateWarning.existingCustomer.fullName}</p>
              <p className="text-[11px] text-slate-600">
                الفرع: {duplicateWarning.existingCustomer.branchName} | الحالة: {CrmService.getStatusMeta(duplicateWarning.existingCustomer.status).label}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (duplicateWarning.existingCustomer) {
                    setSelectedCustomerId(duplicateWarning.existingCustomer.id);
                    setActiveModule('customers');
                    onClose();
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#1C352D] text-white text-xs font-bold hover:bg-[#142921] transition-colors"
              >
                فتح ملف العميل المسجل حالياً 360
              </button>

              <button
                type="button"
                onClick={() => setDuplicateWarning(null)}
                className="px-3 py-1.5 rounded-xl bg-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-300 transition-colors"
              >
                تجاهل الاستمرار بالتسجيل
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم العميل بالكامل *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="اسم العميل الثلاثي"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">رقم الهاتف الرئيسي *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={handlePhoneBlur}
                placeholder="010xxxxxxx"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30 text-left font-mono"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">رقم هاتف إضافي (اختياري)</label>
              <input
                type="text"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30 text-left font-mono"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني (اختياري)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@domain.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30 text-left"
                dir="ltr"
              />
            </div>
          </div>

          {/* Location & Interest */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">المحافظة / المدينة</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="القاهرة">القاهرة</option>
                <option value="الجيزة">الجيزة</option>
                <option value="الإسكندرية">الإسكندرية</option>
                <option value="الشرقية">الشرقية</option>
                <option value="الدقهلية">الدقهلية</option>
                <option value="محافظة أخرى">محافظة أخرى</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">المنطقة / الحي</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="مثال: التجمع الخامس، سموحة"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">نوع الاهتمام التجاري</label>
              <select
                value={interestType}
                onChange={(e) => setInterestType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="both">أثاث ومطابخ معا</option>
                <option value="kitchens">مطابخ فقط</option>
                <option value="furniture">أثاث فقط</option>
              </select>
            </div>
          </div>

          {/* Marketing Source & Campaign Attribution */}
          <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-100 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#E06F28]" />
                <span>مصدر العميل والحملة الإعلانية (Campaign Attribution)</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-emerald-200 mb-1">مصدر الوصول (Source) *</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-emerald-700/50 rounded-xl text-white font-bold"
                >
                  <option value="instagram">انستجرام (Instagram)</option>
                  <option value="facebook">فيسبوك (Facebook)</option>
                  <option value="tiktok">تيك توك (TikTok)</option>
                  <option value="website">الموقع الإلكتروني (Website)</option>
                  <option value="whatsapp">رسالة واتساب (WhatsApp)</option>
                  <option value="walk_in">زيارة المعرض (Walk-in)</option>
                  <option value="phone">اتصال هاتفي مباشر</option>
                  <option value="referral">ترشيح عميل (Referral)</option>
                  <option value="other">مصدر آخر</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-emerald-200 mb-1">الحملة التسويقية (Campaign)</label>
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-emerald-700/50 rounded-xl text-white font-bold"
                >
                  <option value="">بدون حملة محددة</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.platform})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Branch & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الفرع المسؤول *</label>
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
              <label className="block font-bold text-slate-700 mb-1">حالة العميل الأولية</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="new">جديد (New)</option>
                <option value="contacted">تم التواصل (Contacted)</option>
                <option value="interested">مهتم جاد (Interested)</option>
                <option value="measurement_scheduled">موعد معاينة ومقاسات</option>
                <option value="measured">تمت المعاينة (Measured)</option>
                <option value="quotation">قيد التسعير وعرض السعر</option>
                <option value="won">تم الاتفاق (Won)</option>
                <option value="customer">عميل نشط (Customer)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الموظف المسؤول</label>
              <select
                value={responsibleUserId}
                onChange={(e) => setResponsibleUserId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName} ({u.title || u.roleId})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">ملاحظات العميل والتفاصيل الأولية</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب أي ملاحظات خاصة بمتطلبات العميل أو المقاسات المطلوبة..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C352D]/30"
            ></textarea>
          </div>

          {/* Submit */}
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
              className="px-6 py-2.5 rounded-xl bg-[#1C352D] hover:bg-[#142921] text-white font-black shadow-lg transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-[#E06F28]" />
              <span>{customerToEdit ? 'حفظ تعديلات العميل' : 'حفظ وتسجيل العميل الآن'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
