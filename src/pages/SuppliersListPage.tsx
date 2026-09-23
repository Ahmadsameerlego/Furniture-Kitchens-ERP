import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Supplier } from '../types/erp';
import { Truck, Plus, Search, Phone, Mail, MapPin, DollarSign, Star, CheckCircle2, Eye } from 'lucide-react';
import { SupplierDetailsPage } from './SupplierDetailsPage';

export const SuppliersListPage: React.FC = () => {
  const { suppliers, addSupplier, selectedSupplierId, setSelectedSupplierId, checkPermission } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('دمياط');
  const [specialty, setSpecialty] = useState('');

  const canCreate = checkPermission('suppliers', 'create');

  if (selectedSupplierId) {
    return (
      <SupplierDetailsPage
        supplierId={selectedSupplierId}
        onBack={() => setSelectedSupplierId(null)}
      />
    );
  }

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addSupplier({
      name,
      companyName: companyName || name,
      phone,
      email,
      address: `المنطقة الصناعية - ${city}`,
      city,
      specialty: specialty || 'أخشاب ومستلزمات تصنيع الأثاث',
      paymentTerms: 'سداد نقداً عند الاستلام',
      rating: 5
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">سجل الموردين والشركات المغذية (Suppliers Manager)</h1>
            <span className="bg-[#C87A38]/15 text-[#C87A38] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#C87A38]/30">
              {suppliers.length} مورد مسجل
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            دليل الموردين، حساب كشف الحساب والمدفوعات والمستحق غير المسدد لكل مورد
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-[#361D13] hover:bg-[#23120A] text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4 text-[#C87A38]" />
            <span>إضافة مورد جديد</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم المورد أو التخصص أو المدينة..."
            className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#361D13]/30 text-xs"
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map(s => (
          <div
            key={s.id}
            onClick={() => setSelectedSupplierId(s.id)}
            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-4 text-xs"
          >
            
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base">{s.name}</h3>
                <p className="text-slate-500 text-[11px] font-bold">{s.companyName}</p>
              </div>

              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(s.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 font-medium">
              <p className="text-slate-700">التخصص: <strong className="text-slate-900">{s.specialty}</strong></p>
              <p className="text-slate-500">العنوان: {s.address} ({s.city})</p>
              <p className="text-slate-500 font-mono" dir="ltr">الهاتف: {s.phone}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-bold">
              <div>
                <span className="text-slate-400 text-[10px] block">إجمالي المشتريات:</span>
                <span className="font-mono text-slate-900">{s.totalPurchases.toLocaleString('ar-EG')} ج.م</span>
              </div>

              <div className="text-left">
                <span className="text-slate-400 text-[10px] block">المستحق غير المسدد:</span>
                <span className={`font-mono text-sm ${s.balanceDue > 0 ? 'text-rose-700 font-black' : 'text-emerald-700'}`}>
                  {s.balanceDue.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSupplierId(s.id);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#361D13] text-white font-black text-xs hover:bg-[#23120A] flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-[#C87A38]" />
                <span>كشف حساب المورد 360</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-right space-y-5">
            <h3 className="text-lg font-black text-slate-900">تسجيل مورد جديد بالنظام</h3>

            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المورد / المسؤول *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: شركة الأخشاب العالمية"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الهاتف *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010xxxxxxx"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono dir-ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المدينة</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">التخصص الرئيسي</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="زان، مفصلات..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-700"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-[#361D13] text-white font-black rounded-xl"
                >
                  حفظ المورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
