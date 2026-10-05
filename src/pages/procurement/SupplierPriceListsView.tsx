import React, { useState } from 'react';
import { 
  DollarSign, Search, Plus, Filter, TrendingUp, TrendingDown, 
  History, ShieldAlert, CheckCircle2, Clock, Building2, Package,
  Edit2, Eye, Calendar, ArrowRightLeft, Layers
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { SupplierItemPrice } from '../../types/procurement';

export const SupplierPriceListsView: React.FC = () => {
  const { 
    supplierPriceLists, 
    suppliers, 
    materials, 
    addSupplierItemPrice, 
    updateSupplierItemPrice,
    currentUser
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [selectedHistoryPrice, setSelectedHistoryPrice] = useState<SupplierItemPrice | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editPriceItem, setEditPriceItem] = useState<SupplierItemPrice | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    supplierId: '',
    itemId: '',
    unitPrice: 0,
    minQuantity: 1,
    leadTimeDays: 5,
    paymentTerms: 'سداد خلال 30 يوم',
    reason: 'تحديث السعر الدوري المتفق عليه',
    notes: ''
  });

  const filteredPrices = supplierPriceLists.filter(p => {
    const matchesSearch = 
      p.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSupplier = supplierFilter === 'all' || p.supplierId === supplierFilter;

    return matchesSearch && matchesSupplier;
  });

  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === formData.supplierId);
    const item = materials.find(m => m.id === formData.itemId);

    if (editPriceItem) {
      updateSupplierItemPrice(
        editPriceItem.id,
        formData.unitPrice,
        formData.reason || 'تحديث سعر الصنف'
      );
    } else {
      if (!sup || !item) return;

      addSupplierItemPrice({
        supplierId: sup.id,
        supplierName: sup.name,
        itemId: item.id,
        itemCode: item.code || item.id,
        itemName: item.name,
        itemCategory: item.categoryName || 'خامات خشب ومصنعات',
        uom: item.unit || 'متر',
        unitPrice: formData.unitPrice,
        currency: 'EGP',
        minQuantity: formData.minQuantity,
        leadTimeDays: formData.leadTimeDays,
        effectiveDate: new Date().toISOString().split('T')[0],
        paymentTerms: formData.paymentTerms,
        isActive: true,
        priceHistory: [{
          price: formData.unitPrice,
          effectiveDate: new Date().toISOString().split('T')[0],
          changedByUserName: currentUser?.fullName || 'مسؤول المشتريات',
          reason: 'تسجيل السعر الأولي المعتمد'
        }],
        notes: formData.notes
      });
    }

    setIsAddModalOpen(false);
    setEditPriceItem(null);
    setFormData({
      supplierId: '',
      itemId: '',
      unitPrice: 0,
      minQuantity: 1,
      leadTimeDays: 5,
      paymentTerms: 'سداد خلال 30 يوم',
      reason: 'تحديث السعر الدوري',
      notes: ''
    });
  };

  const handleOpenEdit = (price: SupplierItemPrice) => {
    setEditPriceItem(price);
    setFormData({
      supplierId: price.supplierId,
      itemId: price.itemId,
      unitPrice: price.unitPrice,
      minQuantity: price.minQuantity,
      leadTimeDays: price.leadTimeDays,
      paymentTerms: price.paymentTerms,
      reason: 'تحديث السعر المتفق عليه',
      notes: price.notes || ''
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">قوائم أسعار الموردين وسجل الأسعار (Supplier Price Lists)</h1>
              <p className="text-sm text-slate-500">إدارة أسعار المواد المتفق عليها مع الموردين وتتبع تاريخ تقلبات وتغيرات الأسعار</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditPriceItem(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#361D13] text-white text-sm font-medium hover:bg-[#4a281b] transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل سعر صنف جديد لمورد</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">إجمالي الأسعار المعتمدة</span>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{supplierPriceLists.length}</div>
          <div className="mt-1 text-xs text-slate-400">سعر ساري للأخشاب والإكسسوارات والمواد</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">الموردين المسجلين بقوائم الأسعار</span>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-900">
            {new Set(supplierPriceLists.map(p => p.supplierId)).size}
          </div>
          <div className="mt-1 text-xs text-emerald-600">موردين لديهم أسعار رسمية نشطة</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm bg-blue-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700">تحديثات الأسعار التاريخية</span>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-900">
            {supplierPriceLists.reduce((acc, p) => acc + (p.priceHistory?.length || 1), 0)}
          </div>
          <div className="mt-1 text-xs text-blue-600">سجل تدقيق وتغيير سعري محفوظ في النظام</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث باسم المادة، كود الصنف، أو اسم المورد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]/30 focus:border-[#C87A38]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
          >
            <option value="all">جميع الموردين</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Price Lists Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
              <tr>
                <th className="py-3 px-4">كود المادة</th>
                <th className="py-3 px-4">اسم المادة / الصنف</th>
                <th className="py-3 px-4">المورد المعتمد</th>
                <th className="py-3 px-4">سعر الوحدة الحالي</th>
                <th className="py-3 px-4">الحد الأدنى للطلب (MOQ)</th>
                <th className="py-3 px-4">مدة التوريد</th>
                <th className="py-3 px-4">تاريخ السريان</th>
                <th className="py-3 px-4 text-center">سجل الأسعار</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    لا توجد أسعار مسجلة مطابقة لمعايير البحث
                  </td>
                </tr>
              ) : (
                filteredPrices.map((price) => (
                  <tr key={price.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3 px-4 font-mono font-medium text-slate-500 text-xs">
                      {price.itemCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{price.itemName}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{price.paymentTerms}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{price.supplierName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                      {price.unitPrice.toLocaleString()} <span className="text-xs font-normal text-slate-500">ج.م / {price.uom}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                      {price.minQuantity} {price.uom}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                      {price.leadTimeDays} أيام عمل
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                      {price.effectiveDate}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedHistoryPrice(price)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>{price.priceHistory?.length || 1} تحديثات</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenEdit(price)}
                        className="p-1.5 text-slate-500 hover:text-[#C87A38] hover:bg-orange-50 rounded-lg transition"
                        title="تعديل السعر"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price History Modal */}
      {selectedHistoryPrice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">سجل تدقيق الأسعار التاريخية</h3>
                  <p className="text-xs text-slate-500">{selectedHistoryPrice.itemName} - {selectedHistoryPrice.supplierName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedHistoryPrice(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3">
              {(selectedHistoryPrice.priceHistory || []).map((hist, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold font-mono text-slate-800 text-sm">{hist.price.toLocaleString()} ج.م</div>
                    <div className="text-[11px] text-slate-400">ساري منذ: {hist.effectiveDate}</div>
                    <div className="text-[10px] text-slate-500 italic mt-0.5">{hist.reason}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 block">
                      بواسطة: {hist.changedByUserName}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedHistoryPrice(null)}
                className="px-4 py-2 bg-[#361D13] text-white rounded-xl text-xs font-medium hover:bg-[#4a281b]"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Price Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSavePrice} className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {editPriceItem ? 'تحديث سعر الصنف للمورد' : 'تسجيل سعر صنف جديد لمورد'}
              </h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {!editPriceItem && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">المورد *</label>
                  <select
                    required
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
                  >
                    <option value="">-- اختر المورد --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">المادة / الصنف من دليل الأصناف *</label>
                  <select
                    required
                    value={formData.itemId}
                    onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
                  >
                    <option value="">-- اختر الصنف --</option>
                    {materials.map(i => (
                      <option key={i.id} value={i.id}>{i.name} ({i.code || i.id})</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">سعر الوحدة (ج.م) *</label>
              <input
                type="number"
                required
                min="0.1"
                step="0.1"
                value={formData.unitPrice || ''}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الحد الأدنى للطلب (MOQ)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 1 })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">مدة التوريد (بالأيام)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.leadTimeDays}
                  onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 1 })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">سبب التحديث / مبرر السعر</label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">شروط الدفع المتفق عليها</label>
              <input
                type="text"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C87A38]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#361D13] text-white rounded-xl text-xs font-semibold hover:bg-[#4a281b]"
              >
                {editPriceItem ? 'تحديث السعر' : 'حفظ السعر'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
