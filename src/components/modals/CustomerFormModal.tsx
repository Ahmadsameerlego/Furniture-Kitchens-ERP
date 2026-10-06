import React, { useState, useEffect, useRef } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Customer,
  CustomerStatus,
  CustomerSource,
  CustomerInterestType,
  CustomerType,
  CustomerBillingMethod,
  CustomerTier,
  CustomerAttachment
} from '../../types/erp';
import { CrmService } from '../../services/crmService';
import {
  Users,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  X,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  FileText,
  CreditCard,
  Tag,
  Paperclip,
  Image as ImageIcon,
  Trash2,
  Plus,
  Receipt,
  Award
} from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [customerType, setCustomerType] = useState<CustomerType>('individual');
  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [taxId, setTaxId] = useState('');
  const [commercialRegister, setCommercialRegister] = useState('');
  const [nationalId, setNationalId] = useState('');
  
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('القاهرة');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  
  const [interestType, setInterestType] = useState<CustomerInterestType>('both');
  const [status, setStatus] = useState<CustomerStatus>('new');
  const [billingMethod, setBillingMethod] = useState<CustomerBillingMethod>('printed');
  const [tier, setTier] = useState<CustomerTier>('standard');
  const [source, setSource] = useState<CustomerSource>('instagram');
  const [campaignId, setCampaignId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [responsibleUserId, setResponsibleUserId] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<CustomerAttachment[]>([]);

  // Duplicate Warning Alert
  const [duplicateWarning, setDuplicateWarning] = useState<{ isDuplicate: boolean; existingCustomer?: Customer } | null>(null);

  useEffect(() => {
    if (customerToEdit) {
      setCustomerType(customerToEdit.customerType || 'individual');
      setCode(customerToEdit.code || '');
      setFullName(customerToEdit.fullName);
      setCompanyName(customerToEdit.companyName || '');
      setContactPerson(customerToEdit.contactPerson || '');
      setContactRole(customerToEdit.contactRole || '');
      setTaxId(customerToEdit.taxId || '');
      setCommercialRegister(customerToEdit.commercialRegister || '');
      setNationalId(customerToEdit.nationalId || '');
      setPhone(customerToEdit.phone);
      setAltPhone(customerToEdit.altPhone || '');
      setEmail(customerToEdit.email || '');
      setCity(customerToEdit.city || 'القاهرة');
      setArea(customerToEdit.area || '');
      setAddress(customerToEdit.address || '');
      setInterestType(customerToEdit.interestType);
      setStatus(customerToEdit.status);
      setBillingMethod(customerToEdit.billingMethod || 'printed');
      setTier(customerToEdit.tier || 'standard');
      setSource(customerToEdit.source);
      setCampaignId(customerToEdit.campaignId || '');
      setBranchId(customerToEdit.branchId);
      setResponsibleUserId(customerToEdit.responsibleUserId || '');
      setNotes(customerToEdit.notes || '');
      setAttachments(customerToEdit.initialAttachments || []);
      setDuplicateWarning(null);
    } else {
      const generatedCode = CrmService.generateCustomerCode(customers);
      setCustomerType('individual');
      setCode(generatedCode);
      setFullName('');
      setCompanyName('');
      setContactPerson('');
      setContactRole('');
      setTaxId('');
      setCommercialRegister('');
      setNationalId('');
      setPhone('');
      setAltPhone('');
      setEmail('');
      setCity('القاهرة');
      setArea('');
      setAddress('');
      setInterestType('both');
      setStatus('new');
      setBillingMethod('printed');
      setTier('standard');
      setSource('instagram');
      setCampaignId(campaigns[0]?.id || '');
      setBranchId(availableBranches[0]?.id || 'branch-1');
      setResponsibleUserId(users[0]?.id || '');
      setNotes('');
      setAttachments([]);
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

  // Handle local mock attachment upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: CustomerAttachment[] = Array.from(files).map((f) => {
      const isImg = f.type.startsWith('image/');
      return {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: f.name,
        url: isImg
          ? URL.createObjectURL(f)
          : 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600',
        type: f.type || 'application/octet-stream',
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString().substring(0, 10)
      };
    });

    setAttachments(prev => [...prev, ...newItems]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveName = customerType === 'commercial' ? (companyName.trim() || fullName.trim()) : fullName.trim();
    if (!effectiveName || !phone.trim() || !branchId) return;

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
      code: code || CrmService.generateCustomerCode(customers),
      customerType,
      fullName: effectiveName,
      companyName: customerType === 'commercial' ? companyName.trim() : undefined,
      contactPerson: customerType === 'commercial' ? contactPerson.trim() : undefined,
      contactRole: customerType === 'commercial' ? contactRole.trim() : undefined,
      taxId: customerType === 'commercial' ? taxId.trim() : undefined,
      commercialRegister: customerType === 'commercial' ? commercialRegister.trim() : undefined,
      nationalId: customerType === 'individual' ? nationalId.trim() : undefined,
      phone,
      altPhone,
      email,
      city,
      area,
      address,
      interestType,
      status,
      billingMethod,
      tier,
      source,
      campaignId: campaignId || undefined,
      campaignName: selectedCampaign?.name || undefined,
      branchId,
      branchName: selectedBranch?.name || 'المعرض الرئيسي',
      responsibleUserId: responsibleUserId || undefined,
      responsibleUserName: selectedUser?.fullName || undefined,
      notes,
      initialAttachments: attachments
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5 relative max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#361D13] to-[#5a3222] text-[#C87A38] flex items-center justify-center font-bold border border-[#C87A38]/30 shadow-xs">
              {customerType === 'commercial' ? <Building2 className="w-6 h-6" /> : <Users className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  {customerToEdit ? `تعديل بيانات العميل: ${customerToEdit.fullName}` : 'تسجيل عميل جديد (New Client / Account)'}
                </h3>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  {code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                تحديد هوية العميل والنوع، بيانات الفوترة المفضلة، والملاحظات والمرفقات المبدئية
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

        {/* Section 1: Customer Type Switcher Pills */}
        <div className="bg-slate-100 p-1.5 rounded-2xl grid grid-cols-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setCustomerType('individual');
              if (!customerToEdit) setTier('standard');
            }}
            className={`py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
              customerType === 'individual'
                ? 'bg-white text-slate-900 shadow-sm font-black border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className={`w-4 h-4 ${customerType === 'individual' ? 'text-[#C87A38]' : ''}`} />
            <span>عميل فردي (Individual / B2C)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCustomerType('commercial');
              if (!customerToEdit) setTier('wholesale');
            }}
            className={`py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
              customerType === 'commercial'
                ? 'bg-[#361D13] text-white shadow-md font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className={`w-4 h-4 ${customerType === 'commercial' ? 'text-[#C87A38]' : ''}`} />
            <span>عميل تجاري / شركات ومكاتب (B2B Corporate)</span>
          </button>
        </div>

        {/* Duplicate Phone Warning */}
        {duplicateWarning?.isDuplicate && duplicateWarning.existingCustomer && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-black text-xs text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <span>تنبيه أمان: يوجد عميل مسجل سابقاً برقم الهاتف هذا!</span>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-amber-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">العميل المسجل: {duplicateWarning.existingCustomer.fullName} [{duplicateWarning.existingCustomer.code}]</p>
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
                className="px-3.5 py-1.5 rounded-xl bg-[#361D13] text-white text-xs font-bold hover:bg-[#23120A] transition-colors"
              >
                فتح ملف العميل المسجل حالياً 360
              </button>

              <button
                type="button"
                onClick={() => setDuplicateWarning(null)}
                className="px-3 py-1.5 rounded-xl bg-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-300 transition-colors"
              >
                تجاهل والاستمرار
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Main Name & Commercial Details */}
          {customerType === 'individual' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم العميل بالكامل *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: م. محمد حسن عبد الرحمن"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الرقم القومي (اختياري للتعاقد)</label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="14 رقم للرقم القومي"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 font-mono"
                  dir="ltr"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80">
              <div className="flex items-center gap-1.5 text-indigo-950 font-black text-xs">
                <Building2 className="w-4 h-4 text-indigo-700" />
                <span>بيانات المنشأة التجارية والمسؤول المفوض</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الاسم التجاري للمنشأة / الشركة *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (!fullName) setFullName(e.target.value);
                    }}
                    placeholder="مثال: شركة بالم للتطوير العقاري"
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الشخص المسؤول / المفوض *</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="مثال: م. تامر الشناوي"
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المسمى الوظيفي للمسؤول</label>
                  <input
                    type="text"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                    placeholder="مدير المشتريات / مهندس ديكور"
                    className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الرقم الضريبي (Tax ID)</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="123-456-789"
                    className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-xl font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم السجل التجاري (CR)</label>
                  <input
                    type="text"
                    value={commercialRegister}
                    onChange={(e) => setCommercialRegister(e.target.value)}
                    placeholder="رقم السجل التجاري"
                    className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-xl font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">رقم الهاتف الأساسي (WhatsApp) *</label>
              </div>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={handlePhoneBlur}
                placeholder="010xxxxxxx"
                className="w-full px-3 py-2 bg-emerald-50/40 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 text-left font-mono font-bold text-slate-900"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">رقم هاتف إضافي / أرضي</label>
              <input
                type="text"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 text-left font-mono"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@domain.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 text-left"
                dir="ltr"
              />
            </div>
          </div>

          {/* Location */}
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
                placeholder="مثال: التجمع الخامس، الشيخ زايد"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">العنوان التفصيلي (الموقع)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="رقم العمارة / الفيلا والشارع"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30"
              />
            </div>
          </div>

          {/* Billing Method & Classification (New Feature) */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#C87A38]" />
                <span>إعدادات الفوترة وتصنيف العميل (Billing & Tier)</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">طريقة الفوترة المفضلة *</label>
                <select
                  value={billingMethod}
                  onChange={(e) => setBillingMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900"
                >
                  <option value="printed">📄 فاتورة ورقية مطبوعة مع الاستلام</option>
                  <option value="email">📧 إرسال فاتورة PDF عبر البريد</option>
                  <option value="whatsapp">📱 إشعار ورابط فاتورة إلكتروني بالواتساب</option>
                  <option value="electronic_tax">🏛️ فاتورة إلكترونية ضريبية معتمدة (ETA)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تصنيف العميل (Customer Tier)</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900"
                >
                  <option value="standard">عميل عادي (Standard)</option>
                  <option value="vip">⭐ عميل مميز (VIP Account)</option>
                  <option value="wholesale">🏢 مشروعات / جملة (Wholesale)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع الاهتمام التجاري *</label>
                <select
                  value={interestType}
                  onChange={(e) => setInterestType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900"
                >
                  <option value="kitchens">شغل عمولة وتفصيل فقط (Custom Projects)</option>
                  <option value="furniture">شغل جاهز ومعارض فقط (Ready Furniture)</option>
                  <option value="both">كلاهما معا (جاهز + تفصيل وعمولة)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Marketing Source & Attribution */}
          <div className="p-4 rounded-2xl bg-[#361D13] text-white space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-200 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C87A38]" />
                <span>مصدر وصول العميل والحملة الإعلانية (Campaign Attribution)</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-amber-100 mb-1">مصدر الوصول (Source) *</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-amber-700/50 rounded-xl text-white font-bold"
                >
                  <option value="instagram">انستجرام (Instagram)</option>
                  <option value="facebook">فيسبوك (Facebook)</option>
                  <option value="tiktok">تيك توك (TikTok)</option>
                  <option value="website">الموقع الإلكتروني (Website)</option>
                  <option value="whatsapp">رسالة واتساب (WhatsApp)</option>
                  <option value="walk_in">زيارة المعرض (Walk-in)</option>
                  <option value="phone">اتصال هاتفي مباشر</option>
                  <option value="referral">ترشيح عميل / مكتب هندسي</option>
                  <option value="other">مصدر آخر</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-amber-100 mb-1">الحملة التسويقية (Campaign)</label>
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-amber-700/50 rounded-xl text-white font-bold"
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
                <option value="won">تم الاتفاق والتعاقد (Won)</option>
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

          {/* Enlarged Notes Field */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">ملاحظات واحتياجات العميل الأولية بالتفصيل</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="سجل هنا أي تفاصيل تخص طلب العميل، نوع الخامات المفضلة (HPL، أكريليك، قشرة طبيعي، زان)، الأبعاد التقديرية، الميزانية المتوقعة، أو مواعيد التسليم المرغوبة..."
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 leading-relaxed font-medium"
            ></textarea>
          </div>

          {/* Initial Attachments & Inspiration Upload Area (Feature 5) */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-[#C87A38]" />
                <span>إرفاق ملفات وصور أولية تعبر عن اهتمامات وذوق العميل (اختياري)</span>
              </span>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#361D13] font-bold text-xs rounded-xl border border-slate-300 shadow-xs flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#C87A38]" />
                <span>إضافة مرفقات / صور</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />

            {attachments.length === 0 ? (
              <p className="text-[11px] text-slate-400 py-2 text-center">
                يمكنك إرفاق صور تصاميم من Pinterest، كروكي أولي للموقع، أو ملفات متطلبات ومخططات.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {attachments.map((att) => (
                  <div key={att.id} className="relative group bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                      {att.type.startsWith('image/') ? (
                        <img src={att.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-5 h-5 text-indigo-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 text-[11px] truncate" title={att.name}>{att.name}</p>
                      <p className="text-[10px] text-slate-400">{att.size || 'ملف مرفق'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="w-6 h-6 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 flex items-center justify-center transition-colors shrink-0"
                      title="حذف المرفق"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action Bar */}
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
              <CheckCircle className="w-4 h-4 text-[#C87A38]" />
              <span>{customerToEdit ? 'حفظ تعديلات العميل' : 'حفظ وتسجيل العميل الآن'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
