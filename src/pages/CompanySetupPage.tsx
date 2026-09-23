import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { BusinessType, BusinessModel } from '../types/erp';
import { Building2, CheckCircle2, Save, Sparkles, Layers, Package, Ruler } from 'lucide-react';

export const CompanySetupPage: React.FC = () => {
  const { company, updateCompanyConfig, checkPermission } = useERP();

  const [name, setName] = useState(company.name);
  const [nameEn, setNameEn] = useState(company.nameEn);
  const [taxNumber, setTaxNumber] = useState(company.taxNumber);
  const [commercialReg, setCommercialReg] = useState(company.commercialReg);
  const [businessType, setBusinessType] = useState<BusinessType>(company.businessType);
  const [businessModel, setBusinessModel] = useState<BusinessModel>(company.businessModel);
  const [phone, setPhone] = useState(company.phone);
  const [email, setEmail] = useState(company.email);
  const [address, setAddress] = useState(company.address);

  const canEdit = checkPermission('settings', 'edit');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    updateCompanyConfig({
      name,
      nameEn,
      taxNumber,
      commercialReg,
      businessType,
      businessModel,
      phone,
      email,
      address
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">إعداد وتكوين نشاط الشركة (Company Setup)</h1>
            <span className="bg-[#C87A38]/15 text-[#C87A38] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#C87A38]/30">
              تحديد مجال العمل
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            تخصيص طبيعة النشاط ونموذج التشغيل التجاري لتكييف واجهات ووظائف ERP تلقائياً
          </p>
        </div>

        {!canEdit && (
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs border border-amber-200 font-bold">
            🔒 العرض فقط (لا تملك صلاحية التعديل لدورك الحالي)
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Business Type (Primary Industry Scope) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-[#361D13]" />
            <div>
              <h2 className="text-sm font-black text-slate-900">1. مجال النشاط التخصصي (Business Type)</h2>
              <p className="text-[11px] text-slate-500">اختر مجال النشاط الأساسي لشركة فيرنتشر لاند</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Option A: Furniture */}
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => setBusinessType('furniture')}
              className={`p-5 rounded-2xl border text-right transition-all flex flex-col justify-between space-y-3 ${
                businessType === 'furniture'
                  ? 'bg-emerald-950 text-white border-[#361D13] ring-2 ring-emerald-500/30 shadow-lg'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <Package className={`w-6 h-6 ${businessType === 'furniture' ? 'text-[#C87A38]' : 'text-slate-500'}`} />
                {businessType === 'furniture' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              </div>
              <div>
                <p className="font-black text-sm">أثاث فقط (Furniture Only)</p>
                <p className="text-xs opacity-75 mt-1">صالونات، غرف نوم، سفرة، أثاث مكتبي وديكورات</p>
              </div>
            </button>

            {/* Option B: Kitchens */}
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => setBusinessType('kitchens')}
              className={`p-5 rounded-2xl border text-right transition-all flex flex-col justify-between space-y-3 ${
                businessType === 'kitchens'
                  ? 'bg-emerald-950 text-white border-[#361D13] ring-2 ring-emerald-500/30 shadow-lg'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <Ruler className={`w-6 h-6 ${businessType === 'kitchens' ? 'text-[#C87A38]' : 'text-slate-500'}`} />
                {businessType === 'kitchens' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              </div>
              <div>
                <p className="font-black text-sm">مطابخ فقط (Kitchens Only)</p>
                <p className="text-xs opacity-75 mt-1">مطابخ خشبية، HPL، ألوميتال، خامات ومقاسات</p>
              </div>
            </button>

            {/* Option C: Furniture + Kitchens */}
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => setBusinessType('furniture_kitchens')}
              className={`p-5 rounded-2xl border text-right transition-all flex flex-col justify-between space-y-3 ${
                businessType === 'furniture_kitchens'
                  ? 'bg-emerald-950 text-white border-[#361D13] ring-2 ring-emerald-500/30 shadow-lg'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <Layers className={`w-6 h-6 ${businessType === 'furniture_kitchens' ? 'text-[#C87A38]' : 'text-slate-500'}`} />
                {businessType === 'furniture_kitchens' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              </div>
              <div>
                <p className="font-black text-sm">أثاث ومطابخ معا (Furniture + Kitchens)</p>
                <p className="text-xs opacity-75 mt-1">النطاق المتكامل لأغلب المعارض والمصانع الكبرى في مصر</p>
              </div>
            </button>
          </div>
        </div>

        {/* Section 2: Business Model (Ready vs Custom) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-[#C87A38]" />
            <div>
              <h2 className="text-sm font-black text-slate-900">2. نموذج التشغيل والتنفيذ (Business Model)</h2>
              <p className="text-[11px] text-slate-500">مستقل عن نوع النشاط ويتيح دعم بيع الجاهز أو التفصيل بالطلب</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => setBusinessModel('ready_made')}
              className={`p-4 rounded-2xl border text-right transition-all space-y-2 ${
                businessModel === 'ready_made'
                  ? 'bg-[#361D13] text-white border-[#361D13] font-bold shadow-md'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">جاهز فقط (Ready-Made)</span>
                {businessModel === 'ready_made' && <CheckCircle2 className="w-4 h-4 text-[#C87A38]" />}
              </div>
              <p className="text-xs opacity-75">منتجات معروضة ومجهزة بالكامل بالمعارض والمخازن</p>
            </button>

            <button
              type="button"
              disabled={!canEdit}
              onClick={() => setBusinessModel('custom_made')}
              className={`p-4 rounded-2xl border text-right transition-all space-y-2 ${
                businessModel === 'custom_made'
                  ? 'bg-[#361D13] text-white border-[#361D13] font-bold shadow-md'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">تفصيل فقط (Custom-Made)</span>
                {businessModel === 'custom_made' && <CheckCircle2 className="w-4 h-4 text-[#C87A38]" />}
              </div>
              <p className="text-xs opacity-75">حسب المقاسات والتصميمات الخاصة بكل عميل بالورش</p>
            </button>

            <button
              type="button"
              disabled={!canEdit}
              onClick={() => setBusinessModel('ready_custom')}
              className={`p-4 rounded-2xl border text-right transition-all space-y-2 ${
                businessModel === 'ready_custom'
                  ? 'bg-[#361D13] text-white border-[#361D13] font-bold shadow-md'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">جاهز + تفصيل (Ready + Custom)</span>
                {businessModel === 'ready_custom' && <CheckCircle2 className="w-4 h-4 text-[#C87A38]" />}
              </div>
              <p className="text-xs opacity-75">بيع أطقم جاهزة + مشاريع تفصيل حسب الطلب</p>
            </button>
          </div>
        </div>

        {/* Section 3: Company Primary Data */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100">
            3. البيانات الرسمية للشركة والتواصل
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم الشركة بالعربية *</label>
              <input
                type="text"
                disabled={!canEdit}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم الشركة بالإنجليزية</label>
              <input
                type="text"
                disabled={!canEdit}
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الرقم الضريبي</label>
              <input
                type="text"
                disabled={!canEdit}
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">السجل التجاري</label>
              <input
                type="text"
                disabled={!canEdit}
                value={commercialReg}
                onChange={(e) => setCommercialReg(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">رقم الهاتف الرئيسي</label>
              <input
                type="text"
                disabled={!canEdit}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني الرسمي</label>
              <input
                type="email"
                disabled={!canEdit}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 text-xs">عنوان المقر الرئيسي للشركة</label>
            <input
              type="text"
              disabled={!canEdit}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 text-xs"
            />
          </div>
        </div>

        {/* Submit */}
        {canEdit && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-[#361D13] hover:bg-[#23120A] text-white font-black text-xs rounded-2xl shadow-xl transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-[#C87A38]" />
              <span>حفظ التعديلات والتكوين</span>
            </button>
          </div>
        )}

      </form>
    </div>
  );
};
